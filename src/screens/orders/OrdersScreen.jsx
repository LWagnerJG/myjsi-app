import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { ORDER_DATA, STATUS_COLORS } from './data.js';

/* ----------------------- Small helpers ----------------------- */
const formatCompanyName = (name) =>
    name ? name.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase()) : '';

const currency0 = (n = 0) =>
    `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/* ----------------------- Calendar View ----------------------- */
export const OrderCalendarView = ({ orders, theme, dateType, onOrderClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const ordersByDate = useMemo(() => {
        const map = new Map();
        orders.forEach((order) => {
            const dateStr = order[dateType];
            if (dateStr) {
                const d = new Date(dateStr);
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                if (!map.has(key)) map.set(key, []);
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
                    <button
                        onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 active:scale-90"
                    >
                        <ChevronLeft style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                        onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 active:scale-90"
                    >
                        <ChevronRight style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>

                <div
                    className="grid grid-cols-7 gap-1 text-center text-xs font-semibold"
                    style={{ color: theme.colors.textSecondary }}
                >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d}>{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {blanks.map((_, i) => (
                        <div key={`b-${i}`} />
                    ))}
                    {days.map((day) => {
                        const date = new Date(year, month, day);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const key = `${year}-${month}-${day}`;
                        const hasOrder = ordersByDate.has(key);
                        const dayTotal = (ordersByDate.get(key) || []).reduce((s, o) => s + (o.net || 0), 0);

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(date)}
                                className={`relative h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-200 active:scale-95 ${isSelected ? 'ring-2 ring-offset-2' : 'hover:bg-black/5'
                                    }`}
                                style={{ ringColor: theme.colors.accent }}
                            >
                                <span className="text-sm" style={{ color: theme.colors.textPrimary }}>
                                    {day}
                                </span>
                                {hasOrder && (
                                    <span className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
                                        {currency0(dayTotal)}
                                    </span>
                                )}
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
                    {ordersForSelectedDate.map((order) => (
                        <GlassCard
                            key={order.orderNumber}
                            theme={theme}
                            className="p-4 cursor-pointer hover:border-gray-400/50 flex items-center space-x-4 transition-all duration-200 active:scale-[0.99]"
                            onClick={() => onOrderClick(order)}
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: STATUS_COLORS[order.status] || theme.colors.secondary }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                                    {order.details || 'N/A'}
                                </p>
                                <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>
                                    {order.company}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-lg whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                                    {currency0(order.net)}
                                </p>
                                {/* keep SO off this card; detail page will show it */}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ----------------------- Group Tile ----------------------- */
const GroupTile = ({ theme, dateKey, group, onNavigate }) => {
    // Normalize TZ for label
    const date = new Date(dateKey);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const formatted = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    // Shared typography for header date & total
    const headerTextStyle = {
        color: theme.colors.textPrimary
    };

    return (
        <GlassCard theme={theme} className="p-0 overflow-hidden">
            {/* Header inside the card: date (L) and total (R), same style */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.00) 100%)',
                    borderBottom: `1px solid ${theme.colors.border}`
                }}
            >
                <h2 className="font-semibold text-base tracking-wide" style={headerTextStyle}>
                    {formatted}
                </h2>
                <div className="font-semibold text-base tracking-wide" style={headerTextStyle}>
                    {currency0(group.total)}
                </div>
            </div>

            {/* Orders */}
            <div className="p-2 space-y-2">
                {group.orders.map((order, idx) => {
                    const statusColor = STATUS_COLORS[order.status] || theme.colors.secondary;
                    const showDivider = idx < group.orders.length - 1;

                    return (
                        <React.Fragment key={order.orderNumber}>
                            <button
                                onClick={() => onNavigate(`orders/${order.orderNumber}`)}
                                className="w-full text-left p-3 transition-all duration-200 active:scale-[0.99] hover:bg-black/5 rounded-xl"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: statusColor }}
                                        />
                                        <div className="min-w-0">
                                            <p
                                                className="font-semibold truncate text-base"
                                                style={{ color: theme.colors.textPrimary }}
                                            >
                                                {order.details || 'N/A'}
                                            </p>
                                            <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>
                                                {formatCompanyName(order.company)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        {/* Same vibe as header but a tad smaller */}
                                        <p
                                            className="font-semibold text-[15px] whitespace-nowrap tracking-wide"
                                            style={{ color: theme.colors.textPrimary }}
                                        >
                                            {currency0(order.net)}
                                        </p>
                                        {/* SO hidden here; still searchable & shown on detail page */}
                                    </div>
                                </div>
                            </button>

                            {showDivider && (
                                <div className="mx-4" style={{ borderTop: `1px dashed ${theme.colors.border}` }} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </GlassCard>
    );
};

/* ----------------------- Orders Screen ----------------------- */
export const OrdersScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateType, setDateType] = useState('shipDate');
    const [viewMode, setViewMode] = useState('list');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);
    const filterMenuRef = useRef(null);

    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) setIsScrolled(scrollContainerRef.current.scrollTop > 10);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) setShowDateFilter(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOrders = useMemo(() => {
        return ORDER_DATA.filter(
            (order) =>
                (order.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (order.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (order.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const groupedOrders = useMemo(() => {
        const groups = filteredOrders.reduce((acc, order) => {
            const dateStr = order[dateType];
            if (!dateStr || isNaN(new Date(dateStr))) return acc;
            const d = new Date(dateStr);
            const key = d.toISOString().split('T')[0];
            if (!acc[key]) acc[key] = { orders: [], total: 0 };
            acc[key].orders.push(order);
            acc[key].total += order.net || 0;
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
            {/* Top bar */}
            <div
                className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
                style={{
                    backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent',
                    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`
                }}
            >
                <div className="p-4 flex items-center space-x-2">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search Orders"
                        theme={theme}
                        className="flex-grow"
                    />

                    <div className="relative">
                        <button
                            onClick={() => setShowDateFilter((f) => !f)}
                            className="p-2.5 rounded-full transition-all duration-200 active:scale-90 border"
                            style={{
                                minHeight: 0,
                                height: 44,
                                width: 44,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: theme.colors.subtle,
                                borderColor: theme.colors.border
                            }}
                        >
                            <span className="sr-only">Filter</span>
                            <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                        </button>

                        {showDateFilter && (
                            <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-20 w-44 p-2">
                                <button
                                    onClick={() => {
                                        setDateType('shipDate');
                                        setShowDateFilter(false);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-all duration-200 active:scale-95 ${dateType === 'shipDate' ? 'font-bold' : ''
                                        }`}
                                    style={{
                                        color: theme.colors.textPrimary,
                                        backgroundColor: dateType === 'shipDate' ? theme.colors.subtle : 'transparent'
                                    }}
                                >
                                    Ship Date
                                </button>
                                <button
                                    onClick={() => {
                                        setDateType('date');
                                        setShowDateFilter(false);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-all duration-200 active:scale-95 ${dateType === 'date' ? 'font-bold' : ''
                                        }`}
                                    style={{
                                        color: theme.colors.textPrimary,
                                        backgroundColor: dateType === 'date' ? theme.colors.subtle : 'transparent'
                                    }}
                                >
                                    PO Date
                                </button>
                            </GlassCard>
                        )}
                    </div>

                    <button
                        onClick={() => setViewMode((v) => (v === 'list' ? 'calendar' : 'list'))}
                        className="p-2.5 rounded-full transition-all duration-200 active:scale-90 border"
                        style={{
                            minHeight: 0,
                            height: 44,
                            width: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.colors.subtle,
                            borderColor: theme.colors.border
                        }}
                    >
                        <Calendar className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pt-4 pb-24 space-y-4 scrollbar-hide">
                    {viewMode === 'list' ? (
                        <div className="space-y-4">
                            {sortedGroupKeys.map((dateKey) => (
                                <GroupTile
                                    key={dateKey}
                                    theme={theme}
                                    dateKey={dateKey}
                                    group={groupedOrders[dateKey]}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                    ) : (
                        <OrderCalendarView
                            orders={filteredOrders}
                            theme={theme}
                            dateType={dateType}
                            onOrderClick={(order) => onNavigate(`orders/${order.orderNumber}`)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
