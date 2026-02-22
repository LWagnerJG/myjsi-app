import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { ChevronRight, MapPin, Building2, Search, UserPlus } from 'lucide-react';
import { DEALER_DIRECTORY_DATA } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { formatCurrency } from '../../../utils/format.js';

/* ────────────────────────────────────────────────
 *  Carousel card
 * ──────────────────────────────────────────────── */
const CarouselCard = React.memo(({ dealer, colors, isDark, onTap, isCenter }) => {
    const goalPct = dealer?.ytdGoal ? Math.round((dealer.sales / dealer.ytdGoal) * 100) : null;
    const goalColor = goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : colors.accent;

    return (
        <div
            onClick={onTap}
            className="rounded-[20px] overflow-hidden select-none cursor-pointer transition-all duration-300"
            style={{
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.05)',
                boxShadow: isCenter
                    ? (isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)')
                    : (isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 6px rgba(0,0,0,0.04)'),
                opacity: isCenter ? 1 : 0.7,
                transform: isCenter ? 'scale(1)' : 'scale(0.95)',
            }}
        >
            {/* Header — monogram + name */}
            <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ backgroundColor: `${colors.accent}0D`, color: colors.accent }}
                    >
                        {dealer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold tracking-tight truncate" style={{ color: colors.textPrimary }}>
                            {dealer.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.4 }} />
                            <span className="text-[10px] truncate" style={{ color: colors.textSecondary }}>
                                {dealer.territory || dealer.address?.split(',').slice(1).join(',').trim() || dealer.address}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metrics row */}
                <div className="flex items-end gap-4">
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Sales</p>
                        <p className="text-[15px] font-black tracking-tight" style={{ color: colors.textPrimary }}>{formatCurrency(dealer.sales)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Bookings</p>
                        <p className="text-[13px] font-bold tracking-tight" style={{ color: colors.textSecondary }}>{formatCurrency(dealer.bookings)}</p>
                    </div>
                    {goalPct !== null && (
                        <div className="ml-auto flex items-center gap-1.5">
                            <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(goalPct, 100)}%`, backgroundColor: goalColor }} />
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: goalColor }}>{goalPct}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

/* ────────────────────────────────────────────────
 *  Scroll-snap carousel hook
 * ──────────────────────────────────────────────── */
const useSnapCarousel = (itemCount) => {
    const trackRef = useRef(null);
    const [centerIdx, setCenterIdx] = useState(0);

    const onScroll = useCallback(() => {
        const el = trackRef.current;
        if (!el || !el.children.length) return;
        const scrollCenter = el.scrollLeft + el.offsetWidth / 2;
        let closest = 0, closestDist = Infinity;
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];
            const childCenter = child.offsetLeft + child.offsetWidth / 2;
            const dist = Math.abs(scrollCenter - childCenter);
            if (dist < closestDist) { closestDist = dist; closest = i; }
        }
        setCenterIdx(closest);
    }, []);

    const scrollTo = useCallback((idx) => {
        const el = trackRef.current;
        if (!el || !el.children[idx]) return;
        const child = el.children[idx];
        const scrollTarget = child.offsetLeft - (el.offsetWidth / 2) + (child.offsetWidth / 2);
        el.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }, []);

    return { trackRef, centerIdx, onScroll, scrollTo };
};

/* ────────────────────────────────────────────────
 *  Main screen
 * ──────────────────────────────────────────────── */
export const DealerDirectoryScreen = ({ theme, setSuccessMessage, dealerDirectory, onNavigate }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
    const [searchTerm, setSearchTerm] = useState('');
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

    const { trackRef, centerIdx, onScroll, scrollTo } = useSnapCarousel(sorted.length);

    const divider = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

    return (
        <div className="flex flex-col h-full app-header-offset overflow-hidden" style={{ backgroundColor: colors.background }}>

            {/* Title */}
            <div className="flex-shrink-0 px-4 pt-1 pb-1">
                <PageTitle title="Dealers" theme={theme} />
            </div>

            {/* ── Carousel ── */}
            {sorted.length > 0 ? (
                <div className="flex-shrink-0 pb-3">
                    {/* Horizontal scroll-snap track */}
                    <div
                        ref={trackRef}
                        onScroll={onScroll}
                        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4"
                        style={{
                            scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch',
                            paddingLeft: 'calc(50% - 130px)',
                            paddingRight: 'calc(50% - 130px)',
                        }}
                    >
                        {sorted.map((d, i) => (
                            <div
                                key={d.id}
                                className="flex-shrink-0"
                                style={{ width: 260, scrollSnapAlign: 'center' }}
                            >
                                <CarouselCard
                                    dealer={d}
                                    colors={colors}
                                    isDark={isDark}
                                    isCenter={i === centerIdx}
                                    onTap={() => onNavigate?.(`resources/dealer-directory/${d.id}`)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Dot indicator */}
                    {sorted.length > 1 && sorted.length <= 15 && (
                        <div className="flex justify-center gap-[5px] pt-3">
                            {sorted.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollTo(i)}
                                    className="rounded-full transition-all duration-300 ease-out"
                                    style={{
                                        width: i === centerIdx ? 18 : 5,
                                        height: 5,
                                        backgroundColor: i === centerIdx ? colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'),
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    {sorted.length > 15 && (
                        <p className="text-center text-[11px] font-medium pt-2" style={{ color: colors.textSecondary }}>
                            {centerIdx + 1} / {sorted.length}
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex-shrink-0 px-4 py-8 flex flex-col items-center justify-center text-center gap-2">
                    <Building2 className="w-7 h-7" style={{ color: colors.textSecondary, opacity: 0.25 }} />
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>No dealers found</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>Try a different search.</p>
                </div>
            )}

            {/* ── List section ── */}
            <div className="flex-1 min-h-0 flex flex-col">
                {/* Search + Add Dealer */}
                <div className="flex-shrink-0 px-4 pb-2.5 flex items-center gap-2">
                    <div
                        className="flex-1 flex items-center gap-2.5 px-3.5 rounded-xl"
                        style={{
                            height: 40,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: `1px solid ${divider}`,
                        }}
                    >
                        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.4 }} />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
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

                {/* Dealer list */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-24">
                    <GlassCard theme={theme} className="p-0 overflow-hidden" style={{ borderRadius: 16 }}>
                        {sorted.map((d, i) => {
                            const isActive = i === centerIdx;
                            const goalPct = d.ytdGoal ? Math.round((d.sales / d.ytdGoal) * 100) : null;
                            const goalColor = goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : colors.accent;
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => onNavigate?.(`resources/dealer-directory/${d.id}`)}
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

                                    {/* Name + territory */}
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