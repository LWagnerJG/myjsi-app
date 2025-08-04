import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Filter, Calendar, ChevronDown, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/forms/SearchInput.jsx';
import * as Data from '../../data.jsx';

// OrderCalendarView component - implementing the calendar view functionality
export const OrderCalendarView = ({ orders, theme, dateType, onOrderClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const ordersByDate = useMemo(() => {
        const map = new Map();
        orders.forEach(order => {
            const dateStr = order[dateType];
            if (dateStr) {
                const date = new Date(dateStr);
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                if (!map.has(key)) {
                    map.set(key, []);
                }
                map.get(key).push(order);
            }
        });
        return map;
    }, [orders, dateType]);

    const ordersForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
        return ordersByDate.get(key) || [];
    }, [selectedDate, ordersByDate]);

    const handleDateClick = (day) => {
        const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newSelectedDate);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="space-y-4">
            <GlassCard theme={theme} className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <ChevronLeft style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <ChevronRight style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {blanks.map((_, i) => <div key={`b-${i}`} />)}
                    {days.map(day => {
                        const date = new Date(year, month, day);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const key = `${year}-${month}-${day}`;
                        const hasOrder = ordersByDate.has(key);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`relative h-10 flex items-center justify-center rounded-full transition-colors duration-200 ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-black/5'}`}
                            >
                                <span>{day}</span>
                                {hasOrder && <div className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>}
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {selectedDate && ordersForSelectedDate.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        Orders for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </h3>
                    {ordersForSelectedDate.map(order => (
                        <GlassCard key={order.orderNumber} theme={theme} className="p-4 cursor-pointer hover:border-gray-400/50 flex items-center space-x-4" onClick={() => onOrderClick(order)}>
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: Data.STATUS_COLORS[order.status] || theme.colors.secondary }}></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{order.details || 'N/A'}</p>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{order.company}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-lg whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                                    ${(order.net || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export const OrdersScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateType, setDateType] = useState('shipDate');
    const [viewMode, setViewMode] = useState('list');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);
    const filterMenuRef = useRef(null);

    const formatCompanyName = (name) => {
        if (!name) return '';
        return name.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
    };

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
                setShowDateFilter(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOrders = useMemo(() => {
        return Data.ORDER_DATA.filter(order =>
            (order.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.po?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const groupedOrders = useMemo(() => {
        const groups = filteredOrders.reduce((acc, order) => {
            const dateStr = order[dateType];
            if (!dateStr || isNaN(new Date(dateStr))) return acc;
            const date = new Date(dateStr);
            const groupKey = date.toISOString().split('T')[0];
            if (!acc[groupKey]) {
                acc[groupKey] = { orders: [], total: 0 };
            }
            acc[groupKey].orders.push(order);
            acc[groupKey].total += order.net || 0;
            return acc;
        }, {});
        return groups;
    }, [filteredOrders, dateType]);

    const sortedGroupKeys = useMemo(() => {
        if (!groupedOrders) return [];
        return Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));
    }, [groupedOrders]);

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div 
                className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
                style={{
                    backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent',
                    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`
                }}
            >
                <PageTitle title="Orders" theme={theme}>
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Orders..."
                        theme={theme}
                        className="flex-grow"
                    />
                    <div className="relative">
                        <button onClick={() => setShowDateFilter(f => !f)} className="p-3.5 rounded-full shadow-lg" style={{ backgroundColor: theme.colors.surface }}>
                            <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                        </button>
                        {showDateFilter && (
                            <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-20 w-40 p-2">
                                <button onClick={() => { setDateType('shipDate'); setShowDateFilter(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${dateType === 'shipDate' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: dateType === 'shipDate' ? theme.colors.subtle : 'transparent' }}>Ship Date</button>
                                <button onClick={() => { setDateType('date'); setShowDateFilter(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${dateType === 'date' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: dateType === 'date' ? theme.colors.subtle : 'transparent' }}>PO Date</button>
                            </GlassCard>
                        )}
                    </div>
                    <button onClick={() => setViewMode(v => v === 'list' ? 'calendar' : 'list')} className="p-3.5 rounded-full shadow-lg" style={{ backgroundColor: viewMode === 'calendar' ? theme.colors.accent : theme.colors.surface, }}>
                        <Calendar className="w-5 h-5" style={{ color: viewMode === 'calendar' ? 'white' : theme.colors.textPrimary }} />
                    </button>
                </PageTitle>
            </div>

            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-hide"
            >
                <div className="px-4 pt-4 pb-24 space-y-4 scrollbar-hide">
                    {viewMode === 'list' ? (
                        <div className="space-y-6">
                            {sortedGroupKeys.map(dateKey => {
                                const date = new Date(dateKey);
                                date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                                const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                                return (
                                    <div key={dateKey}>
                                        <div className="px-1 pb-2 flex justify-between items-baseline">
                                            <h2 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                                {formattedDate}
                                            </h2>
                                            <p className="font-semibold text-base" style={{ color: theme.colors.textSecondary }}>
                                                ${groupedOrders[dateKey].total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                        <GlassCard theme={theme} className="p-2 space-y-2">
                                            {groupedOrders[dateKey].orders.map((order, index) => {
                                                const statusColor = Data.STATUS_COLORS[order.status] || theme.colors.secondary;
                                                return (
                                                    <React.Fragment key={order.orderNumber}>
                                                        <button onClick={() => onNavigate(`orders/${order.orderNumber}`)} className="w-full text-left p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/10 rounded-lg">
                                                            <div className="flex items-center justify-between space-x-4">
                                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold truncate text-base" style={{ color: theme.colors.textPrimary }}>
                                                                            {order.details || 'N/A'}
                                                                        </p>
                                                                        <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>
                                                                            {formatCompanyName(order.company)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex-shrink-0 space-y-1">
                                                                    <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                                                        ${(order.net || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                    </p>
                                                                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                                        #{order.orderNumber}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                        {index < groupedOrders[dateKey].orders.length - 1 && <div className="border-t mx-4" style={{ borderColor: theme.colors.border }} />}
                                                    </React.Fragment>
                                                )
                                            })}
                                        </GlassCard>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <OrderCalendarView orders={filteredOrders} theme={theme} dateType={dateType} onOrderClick={(order) => onNavigate(`orders/${order.orderNumber}`)} />
                    )}
                </div>
            </div>
        </div>
    );
};
