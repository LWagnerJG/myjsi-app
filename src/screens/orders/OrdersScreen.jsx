import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Calendar, List, Building2, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import SwipeCalendar from '../../components/common/SwipeCalendar.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { isDarkTheme, DESIGN_TOKENS, cardSurface } from '../../design-system/tokens.js';
import { ORDER_DATA, STATUS_COLORS } from './data.js';
import { formatCurrency, formatCompanyName } from '../../utils/format.js';

/* ---------------------- Calendar View ---------------------- */
export const OrderCalendarView = ({ orders, theme, dateType, onOrderClick }) => {
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

    const renderDayExtra = useCallback((date) => {
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const total = (ordersByDate.get(key) || []).reduce((s, o) => s + (o.net || 0), 0);
        if (!total) return null;
        return <span className="text-[0.625rem] leading-none mt-0.5" style={{ color: theme.colors.textSecondary }}>{formatCurrency(total)}</span>;
    }, [ordersByDate, theme.colors.textSecondary]);

    return (
        <div className="space-y-4">
            <GlassCard theme={theme} className="overflow-hidden" variant="elevated">
                <SwipeCalendar
                    theme={theme}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    renderDayExtra={renderDayExtra}
                />
            </GlassCard>

            {selectedDate && selectedOrders.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                    <h3 className="font-bold" style={{ color: theme.colors.textPrimary }}>
                        {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </h3>
                    {selectedOrders.map((o) => {
                        const sc = STATUS_COLORS[o.status] || '#8B8680';
                        return (
                            <div key={o.orderNumber} className="rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.99] transition"
                                style={{ ...cardSurface(theme) }}
                                onClick={() => onOrderClick(o)}>
                                            <div className="px-5 py-3.5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[0.9375rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{o.details}</p>
                                        <p className="text-[0.8125rem] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                            {formatCompanyName(o.company)}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-[0.9375rem] font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>{formatCurrency(o.net)}</p>
                                        <p className="text-[0.6875rem] mt-0.5 flex items-center justify-end gap-1" style={{ color: theme.colors.textSecondary }}>
                                            <span>{o.orderNumber}</span>
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc }} />
                                        </p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ---- Order Row ---- */
const OrderRow = ({ order, theme, onNavigate, isLast }) => {
    const dark = isDarkTheme(theme);
    const statusColor = STATUS_COLORS[order.status] || '#8B8680';
    return (
        <button
            onClick={() => onNavigate(`orders/${order.orderNumber}`)}
            className={`w-full text-left transition active:scale-[0.98] ${dark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]'}`}
        >
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                    <p className="text-[0.9375rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{order.details}</p>
                    <p className="text-[0.8125rem] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                        {formatCompanyName(order.company)}
                    </p>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-[0.9375rem] font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>{formatCurrency(order.net)}</p>
                    <p className="text-[0.6875rem] mt-0.5 flex items-center justify-end gap-1" style={{ color: theme.colors.textSecondary }}>
                        <span>{order.orderNumber}</span>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
                    </p>
                </div>
            </div>
            {!isLast && <div className="mx-5" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }} />}
        </button>
    );
};

/* ---- Date Group ---- */
const DateGroupCard = ({ theme, dateKey, group, onNavigate }) => {
    const date = new Date(dateKey);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();

    return (
        <div>
            <p className="text-[0.6875rem] font-semibold tracking-wide px-2 mb-1.5" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{label}</p>
            <div className="rounded-[24px] overflow-hidden" style={{ ...cardSurface(theme) }}>
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
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
            {/* Controls */}
            <div className="flex-shrink-0 max-w-2xl mx-auto w-full">
                <div className="px-5 pt-3 pb-2 flex flex-col gap-2.5">
                    <StandardSearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search orders..." theme={theme} />
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <SegmentedToggle value={dateType} onChange={setDateType} options={[{ value: 'shipDate', label: 'Ship Date' }, { value: 'date', label: 'PO Date' }]} theme={theme} size="sm" />
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div ref={dealerRef} className="relative flex-shrink-0">
                                <button onClick={() => setDealerMenuOpen(o => !o)} className="h-10 rounded-full flex items-center justify-center active:scale-95 transition border w-10 md:w-auto md:px-4 md:gap-2" style={{ backgroundColor: selectedDealer !== 'All Dealers' ? `${theme.colors.accent}12` : dark ? 'rgba(255,255,255,0.10)' : theme.colors.surface, borderColor: selectedDealer !== 'All Dealers' ? `${theme.colors.accent}30` : dark ? 'rgba(255,255,255,0.12)' : theme.colors.border }} title={selectedDealer}>
                                    <Building2 className="w-[18px] h-[18px] flex-shrink-0" style={{ color: theme.colors.textPrimary }} />
                                    <span className="hidden md:inline text-[0.8125rem] font-medium whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                                        {selectedDealer === 'All Dealers' ? 'Dealers' : formatCompanyName(selectedDealer)}
                                    </span>
                                </button>
                                {dealerMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto p-2 z-20 rounded-[24px]"
                                        style={{ transformOrigin: 'top right', backgroundColor: theme.colors.surface, border: dark ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${theme.colors.border}`, boxShadow: DESIGN_TOKENS.shadows.modal }}>
                                        {dealers.map(d => {
                                            const active = d === selectedDealer;
                                            return <button key={d} onClick={() => { setSelectedDealer(d); setDealerMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl text-sm transition motion-tap active:scale-[0.98] ${active ? 'font-semibold' : (dark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]')}`} style={{ backgroundColor: active ? theme.colors.subtle : 'transparent', color: theme.colors.textPrimary }}>{formatCompanyName(d)}</button>;
                                        })}
                                    </motion.div>
                                )}
                            </div>
                            <button onClick={() => setViewMode(v => v === 'list' ? 'calendar' : 'list')} className="h-10 rounded-full flex items-center justify-center active:scale-95 transition border w-10 md:w-auto md:px-4 md:gap-2" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.10)' : theme.colors.surface, borderColor: dark ? 'rgba(255,255,255,0.12)' : theme.colors.border }} title={viewMode === 'list' ? 'Calendar View' : 'List View'}>
                                {viewMode === 'list' ? <Calendar className="w-[18px] h-[18px] flex-shrink-0" style={{ color: theme.colors.textPrimary }} /> : <List className="w-[18px] h-[18px] flex-shrink-0" style={{ color: theme.colors.textPrimary }} />}
                                <span className="hidden md:inline text-[0.8125rem] font-medium whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                                    {viewMode === 'list' ? 'Calendar' : 'List'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-5 pt-2 pb-24 max-w-2xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                      {viewMode === 'list' ? (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                          {groupKeys.length ? (
                            <div className="space-y-4">
                                {groupKeys.map((k) => (
                                  <div key={k}>
                                    <DateGroupCard theme={theme} dateKey={k} group={grouped[k]} onNavigate={onNavigate} />
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center py-16 text-center gap-1">
                                <Package className="w-10 h-10 mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.3 }} />
                                <p className="text-[0.9375rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                                    {searchTerm || selectedDealer !== 'All Dealers' ? 'No matching orders' : 'No orders'}
                                </p>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {searchTerm || selectedDealer !== 'All Dealers' ? 'Try adjusting your filters' : 'Orders will appear here'}
                                </p>
                                {(searchTerm || selectedDealer !== 'All Dealers') && (
                                    <button onClick={() => { setSearchTerm(''); setSelectedDealer('All Dealers'); }}
                                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold transition active:scale-95"
                                        style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}>
                                        <X className="w-3 h-3" /> Clear filters
                                    </button>
                                )}
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
