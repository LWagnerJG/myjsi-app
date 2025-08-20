import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Calendar, List, Building2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
// Force local data import
import { ORDER_DATA, STATUS_COLORS } from './data.js';

/* ---------------------------- Helpers ---------------------------- */
const formatCompanyName = (name) => (name ? name.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase()) : '');
const currency0 = (n = 0) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const discountInt = (orderNumber) => { // deterministic 54..64
    if (!orderNumber) return 54;
    let h = 0; for (let i = 0; i < orderNumber.length; i++) h = (h * 131 + orderNumber.charCodeAt(i)) >>> 0; return 54 + (h % 11);
};
const Pill = ({ children, theme }) => (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}` }}>{children}</span>
);

/* ---------------------- Calendar View ---------------------- */
export const OrderCalendarView = ({ orders, theme, dateType, onOrderClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const ordersByDate = useMemo(() => {
        const m = new Map();
        orders.forEach((o) => {
            const raw = o[dateType];
            if (!raw) return;
            const d = new Date(raw);
            if (isNaN(d)) return;
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!m.has(key)) m.set(key, []);
            m.get(key).push(o);
        });
        return m;
    }, [orders, dateType]);

    const selectedOrders = useMemo(() => {
        if (!selectedDate) return [];
        const k = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
        return ordersByDate.get(k) || [];
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
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-black/10 active:scale-90 transition">
                        <ChevronLeft style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-black/10 active:scale-90 transition">
                        <ChevronRight style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {blanks.map((_, i) => <div key={`b-${i}`} />)}
                    {days.map((day) => {
                        const date = new Date(year, month, day);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const key = `${year}-${month}-${day}`;
                        const has = ordersByDate.has(key);
                        const total = (ordersByDate.get(key) || []).reduce((s, o) => s + (o.net || 0), 0);
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(date)}
                                className={`h-12 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${isSelected ? 'ring-2 ring-offset-2' : 'hover:bg-black/5'}`}
                                style={{ ringColor: theme.colors.accent }}
                            >
                                <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{day}</span>
                                {has && <span className="text-[10px]" style={{ color: theme.colors.textSecondary }}>{currency0(total)}</span>}
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {selectedDate && selectedOrders.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                    <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>
                        {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </h3>
                    {selectedOrders.map((o) => (
                        <GlassCard key={o.orderNumber} theme={theme} className="p-4 cursor-pointer hover:border-gray-400/50 flex items-center gap-4 active:scale-[0.99] transition" onClick={() => onOrderClick(o)}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[o.status] || theme.colors.secondary }} />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{o.details}</p>
                                <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>{o.company}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <Pill theme={theme}>SO {o.orderNumber}</Pill>
                                    <Pill theme={theme}>{discountInt(o.orderNumber)}% Off</Pill>
                                </div>
                            </div>
                            <p className="font-semibold text-lg whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>{currency0(o.net)}</p>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ---------------------- Grouped List Tile ---------------------- */
const GroupTile = ({ theme, dateKey, group, onNavigate }) => {
    const date = new Date(dateKey);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <GlassCard theme={theme} className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${theme.colors.border}`, background: 'linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0))' }}>
                <h2 className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>{label}</h2>
                <p className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>{currency0(group.total)}</p>
            </div>
            <div className="p-2 space-y-2">
                {group.orders.map((o, idx) => {
                    const showDivider = idx < group.orders.length - 1;
                    return (
                        <React.Fragment key={o.orderNumber}>
                            <button onClick={() => onNavigate(`orders/${o.orderNumber}`)} className="w-full text-left p-3 rounded-xl hover:bg-black/5 active:scale-[0.99] transition">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[o.status] || theme.colors.secondary }} />
                                        <div className="min-w-0">
                                            <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{o.details}</p>
                                            <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>{formatCompanyName(o.company)}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <Pill theme={theme}>SO {o.orderNumber}</Pill>
                                                <Pill theme={theme}>{discountInt(o.orderNumber)}% Off</Pill>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-[15px] whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>{currency0(o.net)}</p>
                                </div>
                            </button>
                            {showDivider && <div style={{ borderTop: `1px solid ${theme.colors.border}` }} className="mx-4" />}
                        </React.Fragment>
                    );
                })}
            </div>
        </GlassCard>
    );
};

/* --------------------------- Main Screen --------------------------- */
export const OrdersScreen = ({ theme, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateType, setDateType] = useState('shipDate');
    const [viewMode, setViewMode] = useState('list');
    const [dealerMenuOpen, setDealerMenuOpen] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState('All Dealers');
    const [isScrolled, setIsScrolled] = useState(false);

    const scrollRef = useRef(null);
    const dealerRef = useRef(null);

    const dealers = useMemo(() => ['All Dealers', ...Array.from(new Set(ORDER_DATA.map((o) => o.company))).sort((a, b) => a.localeCompare(b))], []);

    const handleScroll = useCallback(() => {
        if (scrollRef.current) setIsScrolled(scrollRef.current.scrollTop > 10);
    }, []);

    useEffect(() => {
        const click = (e) => {
            if (dealerRef.current && !dealerRef.current.contains(e.target)) setDealerMenuOpen(false);
        };
        document.addEventListener('mousedown', click);
        return () => document.removeEventListener('mousedown', click);
    }, []);

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return ORDER_DATA.filter((o) => {
            if (selectedDealer !== 'All Dealers' && o.company !== selectedDealer) return false;
            return (
                (o.company?.toLowerCase() || '').includes(term) ||
                (o.details?.toLowerCase() || '').includes(term) ||
                (o.orderNumber?.toLowerCase() || '').includes(term)
            );
        });
    }, [searchTerm, selectedDealer]);

    const grouped = useMemo(() => {
        return filtered.reduce((acc, o) => {
            const raw = o[dateType];
            if (!raw) return acc;
            const d = new Date(raw);
            if (isNaN(d)) return acc;
            const key = d.toISOString().split('T')[0];
            if (!acc[key]) acc[key] = { orders: [], total: 0 };
            acc[key].orders.push(o);
            acc[key].total += o.net || 0;
            return acc;
        }, {});
    }, [filtered, dateType]);

    const groupKeys = useMemo(() => Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)), [grouped]);

    const underlineTransform = dateType === 'shipDate' ? 'translateX(0%)' : 'translateX(100%)';

    // Pill style EXACT match to AppHeader
    const headerPill = {
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: `0 8px 24px ${theme.colors.shadow}`,
        borderRadius: 9999,
        height: 56,
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        alignItems: 'center'
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            {/* Top Controls */}
            <div
                className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
                style={{
                    backgroundColor: isScrolled ? `${theme.colors.background}e0` : 'transparent',
                    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
                    borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`
                }}
            >
                <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
                    {/* Custom search pill matching AppHeader */}
                    <div style={headerPill} className="w-full">
                        <Search className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.75 }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Orders"
                            className="flex-1 bg-transparent outline-none text-[15px] placeholder:opacity-60"
                            style={{ height: '100%', lineHeight: '56px', color: theme.colors.textPrimary }}
                            aria-label="Search Orders"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Underline selector */}
                        <div className="relative flex-grow max-w-md">
                            <div className="flex relative select-none">
                                {['shipDate', 'date'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setDateType(t)}
                                        className="flex-1 pb-2 text-sm font-medium"
                                        style={{ color: t === dateType ? theme.colors.textPrimary : theme.colors.textSecondary, transition: 'color .25s' }}
                                    >
                                        {t === 'shipDate' ? 'Ship Date' : 'PO Date'}
                                    </button>
                                ))}
                                <span className="absolute bottom-0 left-0 h-[3px] w-1/2 rounded-full transition-transform duration-300" style={{ backgroundColor: theme.colors.accent, transform: underlineTransform }} />
                                <span className="absolute bottom-0 left-0 w-full h-px" style={{ backgroundColor: theme.colors.border, opacity: 0.55 }} />
                            </div>
                        </div>

                        {/* Dealer filter */}
                        <div ref={dealerRef} className="relative">
                            <button
                                onClick={() => setDealerMenuOpen((o) => !o)}
                                className="h-11 w-11 border rounded-full flex items-center justify-center active:scale-90 transition"
                                style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border }}
                                title={selectedDealer}
                            >
                                <Building2 className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                            </button>
                            {dealerMenuOpen && (
                                <GlassCard theme={theme} className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto p-2 z-20 animate-fade-in">
                                    {dealers.map((d) => {
                                        const active = d === selectedDealer;
                                        return (
                                            <button
                                                key={d}
                                                onClick={() => { setSelectedDealer(d); setDealerMenuOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition hover:bg-black/5 active:scale-95 ${active ? 'font-semibold' : ''}`}
                                                style={{ backgroundColor: active ? theme.colors.subtle : 'transparent', color: theme.colors.textPrimary }}
                                            >
                                                {d}
                                            </button>
                                        );
                                    })}
                                </GlassCard>
                            )}
                        </div>

                        {/* View toggle */}
                        <button
                            onClick={() => setViewMode((v) => (v === 'list' ? 'calendar' : 'list'))}
                            className="h-11 w-11 border rounded-full flex items-center justify-center active:scale-90 transition"
                            style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border }}
                            title={viewMode === 'list' ? 'Calendar View' : 'List View'}
                        >
                            {viewMode === 'list' ? <Calendar className="w-5 h-5" style={{ color: theme.colors.textPrimary }} /> : <List className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pt-4 pb-24 space-y-4">
                    {viewMode === 'list' ? (
                        groupKeys.length ? (
                            <div className="space-y-4">
                                {groupKeys.map((k) => <GroupTile key={k} theme={theme} dateKey={k} group={grouped[k]} onNavigate={onNavigate} />)}
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No orders found.</p>
                        )
                    ) : (
                        <OrderCalendarView orders={filtered} theme={theme} dateType={dateType} onOrderClick={(o) => onNavigate(`orders/${o.orderNumber}`)} />
                    )}
                </div>
            </div>
        </div>
    );
};
