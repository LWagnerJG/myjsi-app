import React, { useState, useMemo, useCallback, useRef } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { ChevronRight, MapPin, Building2, Phone, Search, ChevronLeft, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEALER_DIRECTORY_DATA } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { formatCurrency } from '../../../utils/format.js';

/* ────────────────────────────────────────────────
 *  Mini sparkline — pure SVG
 * ──────────────────────────────────────────────── */
const Spark = ({ data, color, w = 64, h = 24 }) => {
    if (!data || data.length < 2) return null;
    const mx = Math.max(...data), mn = Math.min(...data), r = mx - mn || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / r) * (h - 4) - 2}`).join(' ');
    return (
        <svg width={w} height={h} className="flex-shrink-0 opacity-60">
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
        </svg>
    );
};

/* ────────────────────────────────────────────────
 *  Swipeable dealer card (hero style)
 * ──────────────────────────────────────────────── */
const SWIPE_THRESHOLD = 50;

const DealerCard = ({ dealer, colors, isDark, onTap, sparkData, goalPct, goalColor }) => (
    <GlassCard
        theme={{ colors }}
        className="p-0 overflow-hidden select-none"
        style={{ borderRadius: 24, minHeight: 200, cursor: 'pointer', border: 'none' }}
    >
        <div className="px-5 pt-5 pb-4" onClick={onTap}>
            {/* Top: monogram + name + arrow */}
            <div className="flex items-center gap-3.5 mb-4">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-base font-bold"
                    style={{ backgroundColor: `${colors.accent}10`, color: colors.accent }}
                >
                    {dealer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold tracking-tight truncate" style={{ color: colors.textPrimary }}>
                        {dealer.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.5 }} />
                        <span className="text-[12px] truncate" style={{ color: colors.textSecondary }}>
                            {dealer.address}
                        </span>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.25 }} />
            </div>

            {/* Metric row */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Sales', value: formatCurrency(dealer.sales) },
                    { label: 'Bookings', value: formatCurrency(dealer.bookings) },
                    { label: 'Discount', value: dealer.dailyDiscount },
                ].map(m => (
                    <div key={m.label}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>{m.label}</p>
                        <p className="text-[15px] font-bold tracking-tight mt-0.5" style={{ color: colors.textPrimary }}>{m.value}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Bottom accent bar — goal + sparkline */}
        <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            onClick={onTap}
        >
            <div className="flex items-center gap-2">
                {goalPct !== null && (
                    <>
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(goalPct, 100)}%`, backgroundColor: goalColor }} />
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: goalColor }}>{goalPct}%</span>
                    </>
                )}
            </div>
            <Spark data={sparkData} color={colors.accent} />
        </div>
    </GlassCard>
);

/* ────────────────────────────────────────────────
 *  Main screen
 * ──────────────────────────────────────────────── */
export const DealerDirectoryScreen = ({ theme, setSuccessMessage, dealerDirectory, onNavigate }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;
    const constraintsRef = useRef(null);

    const sorted = useMemo(() => dealers
        .filter(d => {
            if (!searchTerm) return true;
            const q = searchTerm.toLowerCase();
            return d.name.toLowerCase().includes(q) ||
                (d.address && d.address.toLowerCase().includes(q)) ||
                (d.territory && d.territory.toLowerCase().includes(q));
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [dealers, searchTerm]);

    // Reset index when filter changes
    const clampedIdx = Math.min(activeIdx, Math.max(sorted.length - 1, 0));
    if (clampedIdx !== activeIdx) setActiveIdx(clampedIdx);

    const goNext = useCallback(() => setActiveIdx(i => Math.min(i + 1, sorted.length - 1)), [sorted.length]);
    const goPrev = useCallback(() => setActiveIdx(i => Math.max(i - 1, 0)), []);

    const handleDragEnd = useCallback((_e, info) => {
        if (info.offset.x < -SWIPE_THRESHOLD) goNext();
        else if (info.offset.x > SWIPE_THRESHOLD) goPrev();
    }, [goNext, goPrev]);

    const dealer = sorted[clampedIdx];
    const sparkData = dealer?.monthlySales?.map(m => m.amount) || [];
    const goalPct = dealer?.ytdGoal ? Math.round((dealer.sales / dealer.ytdGoal) * 100) : null;
    const goalColor = goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : colors.accent;

    /* dot color */
    const dotBase = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-1 pb-1">
                <div className="flex items-center justify-between">
                    <PageTitle title="Dealers" theme={theme} />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSearchOpen(o => !o)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                            style={{ backgroundColor: searchOpen ? `${colors.accent}12` : 'transparent' }}
                        >
                            <Search className="w-[18px] h-[18px]" style={{ color: colors.textSecondary }} />
                        </button>
                        <button
                            onClick={() => onNavigate?.('new-dealer-signup')}
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${colors.accent}10` }}
                        >
                            <UserPlus className="w-[18px] h-[18px]" style={{ color: colors.accent }} />
                        </button>
                    </div>
                </div>

                {/* Inline search — slides down */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <input
                                autoFocus
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setActiveIdx(0); }}
                                placeholder="Search dealers..."
                                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-2"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                    color: colors.textPrimary,
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Counter + nav arrows */}
            <div className="flex-shrink-0 px-5 pb-2 flex items-center justify-between">
                <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    {sorted.length > 0 ? `${clampedIdx + 1} of ${sorted.length}` : 'No dealers'}
                </p>
                {sorted.length > 1 && (
                    <div className="flex items-center gap-1">
                        <button onClick={goPrev} disabled={clampedIdx === 0} className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-20">
                            <ChevronLeft className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        </button>
                        <button onClick={goNext} disabled={clampedIdx >= sorted.length - 1} className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-20">
                            <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        </button>
                    </div>
                )}
            </div>

            {/* Swipeable card area */}
            <div className="flex-1 min-h-0 flex flex-col px-4" ref={constraintsRef}>
                {sorted.length > 0 ? (
                    <div className="flex-1 flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={dealer?.id}
                                initial={{ opacity: 0, x: 60, scale: 0.97 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -60, scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.15}
                                onDragEnd={handleDragEnd}
                                className="touch-pan-y"
                            >
                                <DealerCard
                                    dealer={dealer}
                                    colors={colors}
                                    isDark={isDark}
                                    onTap={() => onNavigate?.(`resources/dealer-directory/${dealer.id}`)}
                                    sparkData={sparkData}
                                    goalPct={goalPct}
                                    goalColor={goalColor}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Dot indicator */}
                        {sorted.length > 1 && sorted.length <= 20 && (
                            <div className="flex justify-center gap-1.5 pt-4 pb-2">
                                {sorted.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIdx(i)}
                                        className="rounded-full transition-all duration-200"
                                        style={{
                                            width: i === clampedIdx ? 18 : 6,
                                            height: 6,
                                            backgroundColor: i === clampedIdx ? colors.accent : dotBase,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Quick-tap list below */}
                        <div className="mt-3 space-y-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider px-1 pb-1.5" style={{ color: colors.textSecondary, opacity: 0.6 }}>All Dealers</p>
                            <GlassCard theme={theme} className="p-0 overflow-hidden" style={{ borderRadius: 16 }}>
                                <div className="max-h-[220px] overflow-y-auto scrollbar-hide">
                                    {sorted.map((d, i) => (
                                        <button
                                            key={d.id}
                                            onClick={() => setActiveIdx(i)}
                                            className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 transition-colors"
                                            style={{
                                                borderBottom: i < sorted.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` : 'none',
                                                backgroundColor: i === clampedIdx ? `${colors.accent}08` : 'transparent',
                                            }}
                                        >
                                            <div
                                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                                                style={{ backgroundColor: `${colors.accent}10`, color: colors.accent }}
                                            >
                                                {d.name.charAt(0)}
                                            </div>
                                            <span className="text-[13px] font-medium truncate" style={{ color: i === clampedIdx ? colors.textPrimary : colors.textSecondary }}>
                                                {d.name}
                                            </span>
                                            <span className="text-[11px] font-semibold ml-auto flex-shrink-0" style={{ color: colors.textSecondary }}>
                                                {formatCurrency(d.sales)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 pb-12">
                        <Building2 className="w-8 h-8" style={{ color: colors.textSecondary, opacity: 0.25 }} />
                        <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>No dealers found</p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>Try a different search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};