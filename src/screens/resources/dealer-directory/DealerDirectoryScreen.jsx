import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { ChevronRight, MapPin, Building2, Search, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEALER_DIRECTORY_DATA } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { formatCurrency } from '../../../utils/format.js';

/* ────────────────────────────────────────────────
 *  Mini sparkline — pure SVG
 * ──────────────────────────────────────────────── */
const Spark = ({ data, color, w = 56, h = 20 }) => {
    if (!data || data.length < 2) return null;
    const mx = Math.max(...data), mn = Math.min(...data), r = mx - mn || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / r) * (h - 4) - 2}`).join(' ');
    return (
        <svg width={w} height={h} className="flex-shrink-0 opacity-50">
            <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
        </svg>
    );
};

/* ────────────────────────────────────────────────
 *  Peek card — the active card in the carousel
 * ──────────────────────────────────────────────── */
const SWIPE_THRESHOLD = 40;

const ActiveCard = ({ dealer, colors, isDark, onTap }) => {
    const goalPct = dealer?.ytdGoal ? Math.round((dealer.sales / dealer.ytdGoal) * 100) : null;
    const goalColor = goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : colors.accent;
    const sparkData = dealer?.monthlySales?.map(m => m.amount) || [];

    return (
        <div
            className="rounded-2xl overflow-hidden select-none cursor-pointer"
            style={{
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.06)',
            }}
            onClick={onTap}
        >
            <div className="px-5 pt-5 pb-4">
                {/* Name + monogram */}
                <div className="flex items-center gap-3 mb-3.5">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ backgroundColor: `${colors.accent}10`, color: colors.accent }}
                    >
                        {dealer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[17px] font-bold tracking-tight truncate" style={{ color: colors.textPrimary }}>
                            {dealer.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.45 }} />
                            <span className="text-[11px] truncate" style={{ color: colors.textSecondary }}>{dealer.address}</span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.2 }} />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'Sales', value: formatCurrency(dealer.sales) },
                        { label: 'Bookings', value: formatCurrency(dealer.bookings) },
                        { label: 'Discount', value: dealer.dailyDiscount },
                    ].map(m => (
                        <div key={m.label}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>{m.label}</p>
                            <p className="text-[14px] font-bold tracking-tight mt-0.5" style={{ color: colors.textPrimary }}>{m.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer strip */}
            <div className="px-5 py-2.5 flex items-center justify-between" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.015)' }}>
                <div className="flex items-center gap-2">
                    {goalPct !== null && (
                        <>
                            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(goalPct, 100)}%`, backgroundColor: goalColor }} />
                            </div>
                            <span className="text-[10px] font-semibold" style={{ color: goalColor }}>{goalPct}% YTD</span>
                        </>
                    )}
                </div>
                <Spark data={sparkData} color={colors.accent} />
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────
 *  Peek preview (prev/next side cards)
 * ──────────────────────────────────────────────── */
const PeekCard = ({ dealer, colors, isDark, onClick }) => (
    <div
        className="rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col justify-center px-3 py-4"
        style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
        }}
        onClick={onClick}
    >
        <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 text-xs font-bold"
            style={{ backgroundColor: `${colors.accent}10`, color: colors.accent }}
        >
            {dealer.name.charAt(0)}
        </div>
        <p className="text-[10px] font-semibold text-center leading-tight truncate" style={{ color: colors.textSecondary }}>
            {dealer.name.split(' ')[0]}
        </p>
    </div>
);

/* ────────────────────────────────────────────────
 *  Main screen
 * ──────────────────────────────────────────────── */
export const DealerDirectoryScreen = ({ theme, setSuccessMessage, dealerDirectory, onNavigate }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

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

    const clampedIdx = Math.min(activeIdx, Math.max(sorted.length - 1, 0));
    if (clampedIdx !== activeIdx) setActiveIdx(clampedIdx);

    const goNext = useCallback(() => setActiveIdx(i => Math.min(i + 1, sorted.length - 1)), [sorted.length]);
    const goPrev = useCallback(() => setActiveIdx(i => Math.max(i - 1, 0)), []);

    const handleDragEnd = useCallback((_e, info) => {
        if (info.offset.x < -SWIPE_THRESHOLD) goNext();
        else if (info.offset.x > SWIPE_THRESHOLD) goPrev();
    }, [goNext, goPrev]);

    const current = sorted[clampedIdx];
    const prevDealer = clampedIdx > 0 ? sorted[clampedIdx - 1] : null;
    const nextDealer = clampedIdx < sorted.length - 1 ? sorted[clampedIdx + 1] : null;

    const divider = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

    return (
        <div className="flex flex-col h-full app-header-offset overflow-hidden" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-1">
                <PageTitle title="Dealers" theme={theme} />
            </div>

            {/* Carousel: prev peek | active card | next peek */}
            {sorted.length > 0 && current ? (
                <div className="flex-shrink-0 px-2 pb-3">
                    <div className="flex items-stretch gap-2" style={{ minHeight: 185 }}>
                        {/* Prev peek */}
                        <div className="w-14 flex-shrink-0">
                            {prevDealer ? (
                                <PeekCard dealer={prevDealer} colors={colors} isDark={isDark} onClick={goPrev} />
                            ) : <div />}
                        </div>

                        {/* Active card — swipeable */}
                        <div className="flex-1 min-w-0">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={current.id}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.12}
                                    onDragEnd={handleDragEnd}
                                    className="touch-pan-y h-full"
                                >
                                    <ActiveCard
                                        dealer={current}
                                        colors={colors}
                                        isDark={isDark}
                                        onTap={() => onNavigate?.(`resources/dealer-directory/${current.id}`)}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Next peek */}
                        <div className="w-14 flex-shrink-0">
                            {nextDealer ? (
                                <PeekCard dealer={nextDealer} colors={colors} isDark={isDark} onClick={goNext} />
                            ) : <div />}
                        </div>
                    </div>

                    {/* Dot indicator */}
                    {sorted.length > 1 && sorted.length <= 15 && (
                        <div className="flex justify-center gap-1 pt-3">
                            {sorted.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIdx(i)}
                                    className="rounded-full transition-all duration-200"
                                    style={{
                                        width: i === clampedIdx ? 16 : 5,
                                        height: 5,
                                        backgroundColor: i === clampedIdx ? colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'),
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-shrink-0 px-4 py-8 flex flex-col items-center justify-center text-center gap-2">
                    <Building2 className="w-7 h-7" style={{ color: colors.textSecondary, opacity: 0.25 }} />
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>No dealers found</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>Try a different search.</p>
                </div>
            )}

            {/* All Dealers list section */}
            <div className="flex-1 min-h-0 flex flex-col">
                {/* Search + Add Dealer row */}
                <div className="flex-shrink-0 px-4 pb-2 flex items-center gap-2">
                    <div
                        className="flex-1 flex items-center gap-2.5 px-3.5 rounded-xl"
                        style={{
                            height: 40,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)',
                            border: `1px solid ${divider}`,
                        }}
                    >
                        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.45 }} />
                        <input
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setActiveIdx(0); }}
                            placeholder="Search dealers..."
                            className="flex-1 bg-transparent text-[13px] outline-none"
                            style={{ color: colors.textPrimary }}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>Clear</button>
                        )}
                    </div>
                    <button
                        onClick={() => onNavigate?.('new-dealer-signup')}
                        className="flex items-center gap-1.5 px-3.5 rounded-xl transition-all active:scale-95 flex-shrink-0"
                        style={{
                            height: 40,
                            backgroundColor: colors.accent,
                            color: colors.accentText,
                        }}
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-semibold whitespace-nowrap">Add Dealer</span>
                    </button>
                </div>

                {/* Scrollable dealer list */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-24">
                    <GlassCard theme={theme} className="p-0 overflow-hidden" style={{ borderRadius: 16 }}>
                        {sorted.map((d, i) => {
                            const isActive = i === clampedIdx;
                            const goalPct = d.ytdGoal ? Math.round((d.sales / d.ytdGoal) * 100) : null;
                            const goalColor = goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : colors.accent;
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => {
                                        setActiveIdx(i);
                                        onNavigate?.(`resources/dealer-directory/${d.id}`);
                                    }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-3 transition-colors active:opacity-80"
                                    style={{
                                        borderBottom: i < sorted.length - 1 ? `1px solid ${divider}` : 'none',
                                        backgroundColor: isActive ? `${colors.accent}06` : 'transparent',
                                    }}
                                >
                                    {/* Monogram */}
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                        style={{
                                            backgroundColor: isActive ? `${colors.accent}15` : `${colors.accent}08`,
                                            color: colors.accent,
                                        }}
                                    >
                                        {d.name.charAt(0)}
                                    </div>

                                    {/* Name + address */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold tracking-tight truncate" style={{ color: colors.textPrimary }}>
                                            {d.name}
                                        </p>
                                        <p className="text-[11px] truncate mt-0.5" style={{ color: colors.textSecondary }}>
                                            {d.territory || d.address?.split(',')[1]?.trim() || ''}
                                        </p>
                                    </div>

                                    {/* Sales + goal */}
                                    <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                                        <span className="text-[12px] font-bold" style={{ color: colors.textPrimary }}>
                                            {formatCurrency(d.sales)}
                                        </span>
                                        {goalPct !== null && (
                                            <span className="text-[10px] font-semibold" style={{ color: goalColor }}>
                                                {goalPct}%
                                            </span>
                                        )}
                                    </div>

                                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.2 }} />
                                </button>
                            );
                        })}

                        {sorted.length === 0 && (
                            <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
                                <Building2 className="w-7 h-7" style={{ color: colors.textSecondary, opacity: 0.25 }} />
                                <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>No dealers match</p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};