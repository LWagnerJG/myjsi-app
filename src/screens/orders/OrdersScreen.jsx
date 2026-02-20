import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, List, Building2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ORDER_DATA, STATUS_COLORS } from './data.js';

/* ---- Helpers ---- */
const formatCompanyName = (name) => (name ? name.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase()) : '');
const currency0 = (n = 0) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/* ---------------------- Calendar View ---------------------- */
export const OrderCalendarView = ({ orders, theme, dateType, onOrderClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const isDark = isDarkTheme(theme);

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
            <GlassCard theme={theme} className="p-4" variant="elevated">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full active:scale-95 transition" style={{ ':hover': {} }} onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <ChevronLeft style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full active:scale-95 transition" style={{ ':hover': {} }} onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
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
                                className={`h-12 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
                                style={{
                                    ...(isSelected ? { boxShadow: `0 0 0 2px ${theme.colors.accent}` } : {}),
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                    {selectedOrders.map((o, idx) => {
                        const sc = STATUS_COLORS[o.status] || '#8B8680';
                        return (
                            <div key={o.orderNumber} className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition"
                                style={{ backgroundColor: theme.colors.surface, border: isDark ? '1px solid rgba(255,255,255,0.06)' : 'none', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}
                                onClick={() => onOrderClick(o)}>
                                <div className="flex items-center gap-3.5 px-4 py-3.5">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)' }}>
                                        <Package className="w-[18px] h-[18px]" style={{ color: theme.colors.textSecondary }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[15px] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{o.details}</p>
                                        <p className="text-[12px] mt-0.5 truncate" style={{ color: theme.colors.textSecondary }}>{formatCompanyName(o.company)}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] font-medium px-1.5 py-px rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: theme.colors.textSecondary }}>SO {o.orderNumber}</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: sc }}>{o.status}</span>
                                        </div>
                                    </div>
                                    <p className="font-bold text-[16px] tabular-nums flex-shrink-0" style={{ color: theme.colors.textPrimary }}>{currency0(o.net)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ---- Order Row (inside a group card) ---- */
const OrderRow = ({ order, theme, onNavigate, isLast }) => {
    const dark = isDarkTheme(theme);
    const statusColor = STATUS_COLORS[order.status] || '#8B8680';
    return (
        <button
            onClick={() => onNavigate(`orders/${order.orderNumber}`)}
            className="w-full text-left transition active:scale-[0.99]"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            <div className="flex items-center gap-3.5 px-4 py-3.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)' }}>
                    <Package className="w-[18px] h-[18px]" style={{ color: theme.colors.textSecondary }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{order.details}</p>
                    <p className="text-[12px] mt-0.5 truncate" style={{ color: theme.colors.textSecondary }}>{formatCompanyName(order.company)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-px rounded" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: theme.colors.textSecondary }}>SO {order.orderNumber}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: statusColor }}>{order.status}</span>
                    </div>
                </div>
                <p className="font-bold text-[16px] tabular-nums flex-shrink-0" style={{ color: theme.colors.textPrimary }}>{currency0(order.net)}</p>
            </div>
            {!isLast && <div className="mx-4" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }} />}
        </button>
    );
};

/* ---- Date Group Card ---- */
const DateGroupCard = ({ theme, dateKey, group, onNavigate }) => {
    const dark = isDarkTheme(theme);
    const date = new Date(dateKey);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();

    return (
        <div className="rounded-2xl overflow-hidden" style={{
            backgroundColor: theme.colors.surface,
            border: dark ? '1px solid rgba(255,255,255,0.06)' : 'none',
            boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
        }}>
            <div className="flex items-baseline justify-between px-4 pt-3.5 pb-1">
                <h2 className="text-[11px] font-bold tracking-wider" style={{ color: theme.colors.textSecondary }}>{label}</h2>
                <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{group.orders.length} {group.orders.length === 1 ? 'order' : 'orders'} &middot; {currency0(group.total)}</p>
            </div>
            <div>
                {group.orders.map((o, idx) => (
                    <OrderRow key={o.orderNumber} order={o} theme={theme} onNavigate={onNavigate} isLast={idx === group.orders.length - 1} />
                ))}
            </div>
        </div>
    );
};

/* ---- Main Screen ---- */
export const OrdersScreen = ({ theme, onNavigate }) => {
    const dark = isDarkTheme(theme);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateType, setDateType] = useState('shipDate');
    const [viewMode, setViewMode] = useState('list');
    const [dealerMenuOpen, setDealerMenuOpen] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState('All Dealers');
    const scrollRef = useRef(null);
    const dealerRef = useRef(null);

    const dealers = useMemo(() => ['All Dealers', ...Array.from(new Set(ORDER_DATA.map((o) => o.company))).sort((a, b) => a.localeCompare(b))], []);

    useEffect(() => {
        const click = (e) => { if (dealerRef.current && !dealerRef.current.contains(e.target)) setDealerMenuOpen(false); };
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
            const raw = o[dateType]; if (!raw) return acc;
            const d = new Date(raw); if (isNaN(d)) return acc;
            const key = d.toISOString().split('T')[0];
            if (!acc[key]) acc[key] = { orders: [], total: 0 };
            acc[key].orders.push(o); acc[key].total += o.net || 0;
            return acc;
        }, {});
    }, [filtered, dateType]);

    const groupKeys = useMemo(() => Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)), [grouped]);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            {/* Controls */}
            <div className="flex-shrink-0 max-w-5xl mx-auto w-full">
                <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-3 flex flex-col gap-2.5">
                    <div style={{ height: 56 }}>
                        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search orders..." theme={theme} variant="header" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1 max-w-[220px]">
                            <SegmentedToggle value={dateType} onChange={setDateType} options={[{ value: 'shipDate', label: 'Ship Date' }, { value: 'date', label: 'PO Date' }]} theme={theme} size="sm" />
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <div ref={dealerRef} className="relative flex-shrink-0">
                                <button onClick={() => setDealerMenuOpen(o => !o)} className="h-10 w-10 rounded-full flex items-center justify-center active:scale-90 transition border" style={{ backgroundColor: selectedDealer !== 'All Dealers' ? `${theme.colors.accent}12` : dark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, borderColor: selectedDealer !== 'All Dealers' ? `${theme.colors.accent}30` : dark ? 'rgba(255,255,255,0.12)' : theme.colors.border }} title={selectedDealer}>
                                    <Building2 className="w-[18px] h-[18px]" style={{ color: theme.colors.textPrimary }} />
                                </button>
                                {dealerMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto p-2 z-20 rounded-2xl"
                                        style={{ transformOrigin: 'top right', backgroundColor: theme.colors.surface, border: dark ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${theme.colors.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                                        {dealers.map(d => {
                                            const active = d === selectedDealer;
                                            return <button key={d} onClick={() => { setSelectedDealer(d); setDealerMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl text-sm transition active:scale-95 ${active ? 'font-semibold' : ''}`} style={{ backgroundColor: active ? theme.colors.subtle : 'transparent', color: theme.colors.textPrimary }} onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }} onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}>{formatCompanyName(d)}</button>;
                                        })}
                                    </motion.div>
                                )}
                            </div>
                            <button onClick={() => setViewMode(v => v === 'list' ? 'calendar' : 'list')} className="h-10 w-10 rounded-full flex items-center justify-center active:scale-90 transition border" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, borderColor: dark ? 'rgba(255,255,255,0.12)' : theme.colors.border }} title={viewMode === 'list' ? 'Calendar View' : 'List View'}>
                                {viewMode === 'list' ? <Calendar className="w-[18px] h-[18px]" style={{ color: theme.colors.textPrimary }} /> : <List className="w-[18px] h-[18px]" style={{ color: theme.colors.textPrimary }} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-24 max-w-5xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                      {viewMode === 'list' ? (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                          {groupKeys.length ? (
                            <div className="space-y-4">
                                {groupKeys.map((k, i) => (
                                  <div key={k}>
                                    <DateGroupCard theme={theme} dateKey={k} group={grouped[k]} onNavigate={onNavigate} />
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center py-16 text-center">
                                <Package className="w-10 h-10 mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
                                <p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No orders found</p>
                            </motion.div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                          <OrderCalendarView orders={filtered} theme={theme} dateType={dateType} onOrderClick={(o) => onNavigate(`orders/${o.orderNumber}`)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
