import React, { useMemo, useState, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Modal } from '../../components/common/Modal';
import { SegmentedToggle } from '../../components/common/GroupedToggle';
import { CountUp } from '../../components/common/CountUp';
import { CUSTOMER_RANK_DATA } from './data.js';
import { isDarkTheme } from '../../design-system/tokens.js';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ChevronRight, Search, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';

const RANKING_TAB_OPTIONS = [
    { value: 'sales', label: 'Sales' },
    { value: 'bookings', label: 'Bookings' }
];

const formatCompact = (n) => {
    const abs = Math.abs(n);
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
};

// Podium rank styling — gold / silver / bronze
const RANK_CONFIG = {
    1: { emoji: '🥇', gradient: 'linear-gradient(135deg, rgba(232,199,103,0.18), rgba(247,232,173,0.08))', border: '#E8C767', glow: 'rgba(232,199,103,0.12)' },
    2: { emoji: '🥈', gradient: 'linear-gradient(135deg, rgba(200,205,211,0.18), rgba(236,239,242,0.08))', border: '#C8CDD3', glow: 'rgba(200,205,211,0.12)' },
    3: { emoji: '🥉', gradient: 'linear-gradient(135deg, rgba(217,160,121,0.18), rgba(244,209,190,0.08))', border: '#D9A079', glow: 'rgba(217,160,121,0.12)' },
};

export const CustomerRankingScreen = ({ theme }) => {
    const [tab, setTab] = useState('sales');
    const [modalData, setModalData] = useState(null);
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const isDark = isDarkTheme(theme);

    const allRows = useMemo(() => {
        const list = [...CUSTOMER_RANK_DATA].sort((a, b) => (b[tab] || 0) - (a[tab] || 0));
        return list.map((c, i) => ({ ...c, rank: i + 1 }));
    }, [tab]);

    const rows = useMemo(() => {
        if (!search.trim()) return allRows;
        const q = search.toLowerCase();
        return allRows.filter(r => r.name.toLowerCase().includes(q));
    }, [allRows, search]);

    const maxVal = useMemo(() => Math.max(...allRows.map(r => r[tab] || 0), 1), [allRows, tab]);
    const totalValue = useMemo(() => allRows.reduce((s, r) => s + (r[tab] || 0), 0), [allRows, tab]);

    const open = useCallback((c) => setModalData(c), []);
    const close = useCallback(() => setModalData(null), []);

    // Comparison metric: difference between sales and bookings
    const getDelta = (c) => {
        const s = c.sales || 0;
        const b = c.bookings || 0;
        return tab === 'sales' ? s - b : b - s;
    };

    const RankBadge = ({ rank }) => {
        const cfg = RANK_CONFIG[rank];
        if (cfg) {
            return (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ background: cfg.gradient, border: `1.5px solid ${cfg.border}`, boxShadow: `0 2px 8px ${cfg.glow}` }}>
                    {cfg.emoji}
                </div>
            );
        }
        return (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: theme.colors.textSecondary }}>
                {rank}
            </div>
        );
    };

    const Row = ({ c, i }) => {
        const pct = Math.min(100, Math.round(((c[tab] || 0) / maxVal) * 100));
        const delta = getDelta(c);
        const otherTab = tab === 'sales' ? 'bookings' : 'sales';
        const otherVal = c[otherTab] || 0;

        return (
            <button
                onClick={() => open(c)}
                className="w-full text-left group"
            >
                <div
                    className="flex items-center gap-3 px-4 py-4 transition-colors"
                    style={{ borderTop: i === 0 ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <RankBadge rank={c.rank} />

                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[15px] truncate" style={{ color: theme.colors.textPrimary }}>{c.name}</span>
                            <div className="shrink-0 text-right">
                                <div className="text-[15px] font-extrabold tabular-nums" style={{ color: theme.colors.textPrimary }}>
                                    {formatCurrency(c[tab])}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Progress bar */}
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: theme.colors.accent }}
                                />
                            </div>
                            {/* Secondary metric */}
                            <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] font-medium tabular-nums" style={{ color: theme.colors.textSecondary }}>
                                    {formatCompact(otherVal)} {otherTab === 'sales' ? 'sold' : 'booked'}
                                </span>
                                {delta !== 0 && (
                                    <span className="flex items-center text-[10px] font-bold" style={{ color: delta > 0 ? (isDark ? '#6B9B7A' : '#4A7C59') : (isDark ? '#C87070' : '#B85C5C') }}>
                                        {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <ChevronRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                </div>
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            {/* Summary Header */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 max-w-5xl mx-auto w-full space-y-4">
                {/* Aggregate KPI */}
                <GlassCard theme={theme} className="px-5 py-4" variant="elevated">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>
                                Total {tab === 'sales' ? 'Sales' : 'Bookings'} — {allRows.length} Dealers
                            </p>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: theme.colors.textPrimary }}>
                                <CountUp value={totalValue} prefix="$" duration={0.7} format={(v) => `$${Math.round(v).toLocaleString()}`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Search toggle */}
                            <button
                                onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearch(''); }}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                                style={{ backgroundColor: showSearch ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') }}
                            >
                                {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-3">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search dealers..."
                                        autoFocus
                                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                            border: `1px solid ${theme.colors.border}`,
                                            color: theme.colors.textPrimary,
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassCard>

                {/* Tab Toggle */}
                <SegmentedToggle
                    value={tab}
                    onChange={setTab}
                    options={RANKING_TAB_OPTIONS}
                    theme={theme}
                    size="sm"
                />
            </div>

            {/* Rankings List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-24 max-w-5xl mx-auto w-full">
                    {rows.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No dealers match "{search}"</p>
                        </div>
                    ) : (
                        <GlassCard theme={theme} className="rounded-2xl overflow-hidden" variant="elevated">
                            {rows.map((c, i) => (
                                <Row key={c.id} c={c} i={i} />
                            ))}
                        </GlassCard>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <Modal show={!!modalData} onClose={close} title={modalData?.name || ''} theme={theme}>
                {!!modalData && (
                    <div className="space-y-5">
                        {/* Rank badge + primary metric */}
                        <div className="flex items-center gap-4">
                            <RankBadgeStatic rank={modalData.rank || (allRows.findIndex(r => r.id === modalData.id) + 1)} isDark={isDark} theme={theme} />
                            <div className="flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>
                                    Rank #{modalData.rank || (allRows.findIndex(r => r.id === modalData.id) + 1)} — {tab === 'sales' ? 'Sales' : 'Bookings'}
                                </p>
                                <div className="text-3xl font-black tabular-nums" style={{ color: theme.colors.textPrimary }}>
                                    {formatCurrency(modalData[tab])}
                                </div>
                            </div>
                        </div>

                        {/* Sales vs Bookings comparison */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl p-4 text-center space-y-1" style={{
                                backgroundColor: tab === 'sales'
                                    ? (isDark ? 'rgba(107,155,122,0.1)' : 'rgba(74,124,89,0.06)')
                                    : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'),
                                border: tab === 'sales' ? `1px solid ${isDark ? 'rgba(107,155,122,0.2)' : 'rgba(74,124,89,0.15)'}` : `1px solid ${theme.colors.border}`,
                            }}>
                                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Sales</div>
                                <div className="text-xl font-black tabular-nums" style={{ color: theme.colors.textPrimary }}>
                                    {formatCurrency(modalData.sales)}
                                </div>
                            </div>
                            <div className="rounded-2xl p-4 text-center space-y-1" style={{
                                backgroundColor: tab === 'bookings'
                                    ? (isDark ? 'rgba(107,155,122,0.1)' : 'rgba(74,124,89,0.06)')
                                    : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'),
                                border: tab === 'bookings' ? `1px solid ${isDark ? 'rgba(107,155,122,0.2)' : 'rgba(74,124,89,0.15)'}` : `1px solid ${theme.colors.border}`,
                            }}>
                                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Bookings</div>
                                <div className="text-xl font-black tabular-nums" style={{ color: theme.colors.textPrimary }}>
                                    {formatCurrency(modalData.bookings)}
                                </div>
                            </div>
                        </div>

                        {/* Sales-to-bookings ratio */}
                        {(() => {
                            const s = modalData.sales || 0;
                            const b = modalData.bookings || 0;
                            const ratio = b > 0 ? ((s / b) * 100).toFixed(0) : 0;
                            const isGood = s >= b;
                            return (
                                <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)' }}>
                                    <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Sales-to-Bookings Ratio</span>
                                    <span className="text-sm font-black flex items-center gap-1" style={{ color: isGood ? (isDark ? '#6B9B7A' : '#4A7C59') : (isDark ? '#C87070' : '#B85C5C') }}>
                                        {ratio}%
                                        {isGood ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                    </span>
                                </div>
                            );
                        })()}

                        {/* Recent orders */}
                        <div className="border-t pt-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Recent Projects</div>
                                <span className="text-[10px] font-bold" style={{ color: theme.colors.textSecondary }}>
                                    {(modalData.orders || []).length} project{(modalData.orders || []).length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {(modalData.orders || []).map((o, i) => (
                                    <div key={`${o.projectName}-${i}`} className="flex items-center justify-between text-sm rounded-xl px-3.5 py-3 transition-colors"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)', border: `1px solid ${theme.colors.border}` }}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: theme.colors.textSecondary }} />
                                            <span className="truncate font-medium" style={{ color: theme.colors.textPrimary }}>{o.projectName}</span>
                                        </div>
                                        <span className="font-bold tabular-nums shrink-0 ml-2" style={{ color: theme.colors.textPrimary }}>
                                            {formatCurrency(o.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// Static rank badge for the modal (no hooks)
const RankBadgeStatic = ({ rank, isDark, theme }) => {
    const cfg = RANK_CONFIG[rank];
    if (cfg) {
        return (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
                style={{ background: cfg.gradient, border: `2px solid ${cfg.border}`, boxShadow: `0 4px 12px ${cfg.glow}` }}>
                {cfg.emoji}
            </div>
        );
    }
    return (
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: theme.colors.textSecondary }}>
            {rank}
        </div>
    );
};
