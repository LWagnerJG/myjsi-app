import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Calendar, List, Building2, Package, X, Layers, MapPin, CheckCircle2, Clock, Truck, ChevronRight } from 'lucide-react';
import { VERTICAL_COLORS } from '../../constants/verticals.js';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import SwipeCalendar from '../../components/common/SwipeCalendar.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { isDarkTheme, cardSurface, fieldTileSurface, modalCardSurface } from '../../design-system/tokens.js';
import { ORDER_DATA, STATUS_COLORS } from './data.js';
import { INITIAL_SAMPLE_ORDERS } from '../samples/sampleOrders.js';
import { formatCurrency, formatCompanyName, formatRelativeTime } from '../../utils/format.js';
import { useCompanyResource } from '../../hooks/useCompanyResource.js';

const ORDERS_SHELL_CLASS = 'w-full max-w-[1120px] mx-auto';
const ORDERS_EDGE_PADDING = 'px-4 sm:px-6 lg:px-8 xl:px-6';

export const OrderCalendarView = ({ orders, theme, dateType, onOrderClick }) => {
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
                            <button
                                key={o.orderNumber}
                                type="button"
                                className="w-full rounded-[24px] overflow-hidden text-left cursor-pointer active:scale-[0.99] transition"
                                style={{ ...cardSurface(theme) }}
                                onClick={() => onOrderClick(o)}
                            >
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
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const OrderRow = ({ order, theme, onNavigate, isLast }) => {
    const dark = isDarkTheme(theme);
    const statusColor = STATUS_COLORS[order.status] || '#8B8680';
    return (
        <button
            type="button"
            onClick={() => onNavigate(`orders/${order.orderNumber}`)}
            className={`group/order-row w-full text-left transition active:scale-[0.99] ${dark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.025]'}`}
        >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-6">
                <div className="flex-1 min-w-0">
                    <p className="text-[0.9375rem] font-bold truncate" style={{ color: theme.colors.textPrimary }}>{order.details}</p>
                    <p className="text-[0.8125rem] mt-1 flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
                        <span className="truncate">{formatCompanyName(order.company)}</span>
                        <span className="text-[0.75rem] flex-shrink-0" style={{ opacity: 0.5 }}>{formatRelativeTime(order.date)}</span>
                    </p>
                </div>
                <div className="flex flex-shrink-0 items-center justify-end gap-3 text-right">
                    <div>
                        <p className="text-[0.9375rem] font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>{formatCurrency(order.net)}</p>
                        <p className="text-[0.6875rem] mt-1 flex items-center justify-end gap-1" style={{ color: theme.colors.textSecondary }}>
                            <span style={{ opacity: 0.58 }}>{order.orderNumber}</span>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
                        </p>
                    </div>
                    <ChevronRight
                        className="hidden h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity sm:block group-hover/order-row:opacity-50"
                        style={{ color: theme.colors.textSecondary }}
                    />
                </div>
            </div>
            {!isLast && <div className="mx-5 sm:mx-6" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }} />}
        </button>
    );
};

const DateGroupCard = ({ theme, dateKey, group, onNavigate }) => {
    const dark = isDarkTheme(theme);
    const date = new Date(dateKey);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
    const metaColor = dark ? 'rgba(240,240,240,0.58)' : 'rgba(53,53,53,0.56)';
    const headerDivider = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    return (
        <div className="rounded-[24px] overflow-hidden" style={{ ...cardSurface(theme) }}>
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2 sm:px-6">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em]" style={{ color: metaColor }}>{label}</p>
                <p className="text-[0.6875rem] font-bold tabular-nums" style={{ color: metaColor }}>{formatCurrency(group.total)}</p>
            </div>
            <div className="mx-5 sm:mx-6" style={{ borderTop: `1px solid ${headerDivider}` }} />
            {group.orders.map((o, idx) => (
                <OrderRow key={o.orderNumber} order={o} theme={theme} onNavigate={onNavigate} isLast={idx === group.orders.length - 1} />
            ))}
        </div>
    );
};

const SAMPLE_STATUS_CONFIG = {
    'processing':  { label: 'Processing', icon: Clock,          color: '#B8860B' },
    'in-transit':  { label: 'In Transit', icon: Truck,          color: '#2E75B6' },
    'delivered':   { label: 'Delivered',  icon: CheckCircle2,   color: '#4A7C59' },
};

const SampleOrderCard = ({ order, theme, dark }) => {
    const cfg = SAMPLE_STATUS_CONFIG[order.status] || SAMPLE_STATUS_CONFIG['processing'];
    const Icon = cfg.icon;
    const dateStr = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const totalItems = order.items?.reduce((s, i) => s + (i.qty || 1), 0) ?? 0;

    return (
        <div className="rounded-[24px] overflow-hidden" style={{ ...cardSurface(theme) }}>
            <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[0.6875rem] font-semibold tabular-nums" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{order.id}</span>
                            <span className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary, opacity: 0.3 }}>·</span>
                            <span className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{dateStr}</span>
                        </div>
                        <p className="text-[0.9375rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{order.shipTo}</p>
                        <p className="text-[0.75rem] mt-0.5 flex items-center gap-1 truncate" style={{ color: theme.colors.textSecondary }}>
                            <MapPin className="w-3 h-3 flex-shrink-0" style={{ opacity: 0.5 }} />
                            {order.address}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}18` }}>
                            <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                            <span className="text-[0.6875rem] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                        </div>
                        <span className="text-[0.6875rem] font-medium" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                            {totalItems} sample{totalItems !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                {order.items?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {order.items.slice(0, 4).map((item, i) => (
                            <span key={i} className="text-[0.6875rem] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: theme.colors.textSecondary }}>
                                {item.qty > 1 ? `${item.qty}× ` : ''}{item.name}
                            </span>
                        ))}
                        {order.items.length > 4 && (
                            <span className="text-[0.6875rem] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: theme.colors.textSecondary }}>
                                +{order.items.length - 4} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const SampleOrdersView = ({ theme, dark, searchTerm }) => {
    const filtered = useMemo(() => {
        const q = searchTerm.toLowerCase();
        if (!q) return INITIAL_SAMPLE_ORDERS;
        return INITIAL_SAMPLE_ORDERS.filter(o =>
            o.id.toLowerCase().includes(q) ||
            o.shipTo.toLowerCase().includes(q) ||
            o.address?.toLowerCase().includes(q) ||
            o.items?.some(i => i.name.toLowerCase().includes(q))
        );
    }, [searchTerm]);

    if (!filtered.length) return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-1">
            <Layers className="w-10 h-10 mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.3 }} />
            <p className="text-[0.9375rem] font-semibold" style={{ color: theme.colors.textPrimary }}>No sample orders found</p>
            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Try adjusting your search</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {filtered.map(o => (
                <SampleOrderCard key={o.id} order={o} theme={theme} dark={dark} />
            ))}
        </div>
    );
};

const filterRailSurface = (theme) => {
    const dark = isDarkTheme(theme);
    return {
        backdropFilter: 'blur(18px) saturate(1.28)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.28)',
        backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.68)',
        border: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.82)',
        boxShadow: dark ? 'none' : '0 1px 8px rgba(53,53,53,0.045)'
    };
};

const filterButtonSurface = (theme, active = false) => {
    const dark = isDarkTheme(theme);
    if (!active) {
        return {
            backgroundColor: 'transparent',
            border: '1px solid transparent',
            boxShadow: 'none',
            color: theme.colors.textPrimary
        };
    }

    return {
        backgroundColor: dark ? 'rgba(255,255,255,0.12)' : '#FFFFFF',
        border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.96)',
        boxShadow: dark ? 'none' : '0 1px 5px rgba(53,53,53,0.06)',
        color: theme.colors.textPrimary
    };
};

const OrdersFilterRail = ({
    theme,
    dark,
    selectedDealer,
    dealers,
    dealerMenuOpen,
    setDealerMenuOpen,
    setSelectedDealer,
    dealerRef,
    viewMode,
    setViewMode
}) => {
    const controlTile = fieldTileSurface(theme);
    const dealerActive = selectedDealer !== 'All Dealers';
    const viewActive = viewMode === 'calendar';
    const dealerLabel = dealerActive ? formatCompanyName(selectedDealer) : 'All Dealers';

    return (
        <div
            className="flex w-full min-[420px]:w-auto items-center gap-1 rounded-full p-1"
            style={filterRailSurface(theme)}
        >
            <div ref={dealerRef} className="relative min-w-0 flex-1 min-[420px]:flex-none">
                <button
                    type="button"
                    onClick={() => setDealerMenuOpen((open) => !open)}
                    className="w-full min-[420px]:w-auto min-w-0 rounded-full flex items-center justify-start active:scale-95 transition px-3 gap-1.5"
                    style={{
                        ...filterButtonSurface(theme, dealerActive),
                        height: 'calc(var(--jsi-ctrl-h) - 8px)'
                    }}
                    title={selectedDealer}
                    aria-haspopup="listbox"
                    aria-expanded={dealerMenuOpen}
                >
                    <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textPrimary, opacity: dealerActive ? 1 : 0.82 }} />
                    <span className="min-w-0 truncate text-[0.75rem] font-semibold max-w-[min(8rem,32vw)] min-[420px]:max-w-[6.5rem] sm:max-w-[8rem]" style={{ color: theme.colors.textPrimary }}>
                        {dealerLabel}
                    </span>
                </button>
                {dealerMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 left-0 min-[420px]:left-auto mt-2 w-full min-[420px]:w-60 max-h-72 overflow-y-auto p-2 z-20"
                        style={{ ...modalCardSurface(theme), transformOrigin: 'top right' }}
                        role="listbox"
                        aria-label="Dealer filter"
                    >
                        {dealers.map((dealer) => {
                            const active = dealer === selectedDealer;
                            return (
                                <button
                                    key={dealer}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDealer(dealer);
                                        setDealerMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition motion-tap active:scale-[0.98] ${active ? 'font-semibold' : (dark ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]')}`}
                                    style={{
                                        backgroundColor: active ? controlTile.backgroundColor : 'transparent',
                                        color: theme.colors.textPrimary
                                    }}
                                    role="option"
                                    aria-selected={active}
                                >
                                    {formatCompanyName(dealer)}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            <button
                type="button"
                onClick={() => setViewMode((mode) => mode === 'list' ? 'calendar' : 'list')}
                className="rounded-full flex items-center justify-center active:scale-95 transition w-9 flex-shrink-0"
                style={{
                    ...filterButtonSurface(theme, viewActive),
                    height: 'calc(var(--jsi-ctrl-h) - 8px)'
                }}
                title={viewMode === 'list' ? 'Calendar view' : 'List view'}
                aria-label={viewMode === 'list' ? 'Show calendar view' : 'Show list view'}
                aria-pressed={viewActive}
            >
                {viewMode === 'list'
                    ? <Calendar className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
                    : <List className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />}
            </button>
        </div>
    );
};

export const OrdersScreen = ({ theme, onNavigate, screenParams }) => {
    const { data: ordersData } = useCompanyResource('orders', ORDER_DATA);
    const dark = isDarkTheme(theme);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateType, setDateType] = useState('shipDate');
    const [viewMode, setViewMode] = useState('list');
    const [dealerMenuOpen, setDealerMenuOpen] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState('All Dealers');
    const [selectedVertical, setSelectedVertical] = useState(screenParams?.vertical || null);
    const scrollRef = useRef(null);
    const dealerRef = useRef(null);

    useEffect(() => {
        if (screenParams?.vertical) setSelectedVertical(screenParams.vertical);
    }, [screenParams?.vertical]);

    const dealers = useMemo(() => ['All Dealers', ...Array.from(new Set(ordersData.map((o) => o.company))).sort((a, b) => a.localeCompare(b))], [ordersData]);

    useEffect(() => {
        const click = (e) => { if (dealerRef.current && !dealerRef.current.contains(e.target)) setDealerMenuOpen(false); };
        document.addEventListener('mousedown', click);
        return () => document.removeEventListener('mousedown', click);
    }, []);

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return ordersData.filter((o) => {
            if (selectedDealer !== 'All Dealers' && o.company !== selectedDealer) return false;
            if (selectedVertical && o.vertical !== selectedVertical) return false;
            return (
                (o.company?.toLowerCase() || '').includes(term) ||
                (o.details?.toLowerCase() || '').includes(term) ||
                (o.orderNumber?.toLowerCase() || '').includes(term)
            );
        });
    }, [ordersData, searchTerm, selectedDealer, selectedVertical]);

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
            <div className="flex-shrink-0 w-full">
                <div className={`${ORDERS_EDGE_PADDING} ${ORDERS_SHELL_CLASS} pt-4 pb-2.5 flex flex-col gap-2.5`}>
                    <div className="space-y-2.5">
                        <div>
                            <StandardSearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search orders..." theme={theme} />
                        </div>
                        <div className={`grid grid-cols-1 ${dateType === 'samples' ? '' : 'min-[420px]:grid-cols-[minmax(0,1fr)_auto]'} items-center gap-2.5`}>
                            <div className="min-w-0 flex-1">
                                <SegmentedToggle
                                    value={dateType}
                                    onChange={setDateType}
                                    options={[
                                        { value: 'shipDate', label: 'Ship Date' },
                                        { value: 'date', label: 'PO Date' },
                                        { value: 'samples', label: 'Samples' },
                                    ]}
                                    theme={theme}
                                    size="smDense"
                                    fullWidth
                                />
                            </div>
                            {dateType !== 'samples' && (
                                <OrdersFilterRail
                                    theme={theme}
                                    dark={dark}
                                    selectedDealer={selectedDealer}
                                    dealers={dealers}
                                    dealerMenuOpen={dealerMenuOpen}
                                    setDealerMenuOpen={setDealerMenuOpen}
                                    setSelectedDealer={setSelectedDealer}
                                    dealerRef={dealerRef}
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                />
                            )}
                        </div>
                    </div>
                    {(selectedVertical || selectedDealer !== 'All Dealers') && (
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                            {selectedVertical && (() => {
                                const vColor = VERTICAL_COLORS[selectedVertical] || '#8B8680';
                                return (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedVertical(null)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                                        style={{ backgroundColor: `${vColor}18`, color: vColor, border: `1px solid ${vColor}30` }}
                                    >
                                        {selectedVertical}
                                        <X className="w-3 h-3" style={{ opacity: 0.7 }} />
                                    </button>
                                );
                            })()}
                            {selectedDealer !== 'All Dealers' && (
                                <button
                                    type="button"
                                    onClick={() => onNavigate('projects', { tab: 'pipeline', company: selectedDealer })}
                                    className="inline-flex items-center gap-1 text-xs font-medium ml-auto transition-opacity hover:opacity-70"
                                    style={{ color: theme.colors.textSecondary }}
                                >
                                    See pipeline
                                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
                <div className={`${ORDERS_EDGE_PADDING} ${ORDERS_SHELL_CLASS} pt-2 pb-24`}>
                    <AnimatePresence mode="wait">
                      {dateType === 'samples' ? (
                        <motion.div key="samples" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                            <SampleOrdersView theme={theme} dark={dark} searchTerm={searchTerm} />
                        </motion.div>
                      ) : viewMode === 'list' ? (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                          {groupKeys.length ? (
                            <div className="space-y-3.5">
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
                                    {searchTerm || selectedDealer !== 'All Dealers' || selectedVertical ? 'No matching orders' : 'No orders'}
                                </p>
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {searchTerm || selectedDealer !== 'All Dealers' || selectedVertical ? 'Try adjusting your filters' : 'Orders will appear here'}
                                </p>
                                {(searchTerm || selectedDealer !== 'All Dealers' || selectedVertical) && (
                                    <button type="button" onClick={() => { setSearchTerm(''); setSelectedDealer('All Dealers'); setSelectedVertical(null); }}
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
