import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { ScreenTopChrome } from '../../../components/common/ScreenTopChrome.jsx';
import { GOOD_BETTER_BEST_DECK, GBB_TIERS, GBB_ROUTE, formatGbbPrice } from './goodBetterBestData.js';

const pad = (n) => String(n).padStart(2, '0');

// One quotable cell — verified price or a "pending verification" placeholder.
const TierCell = ({ data, tier, theme, dark }) => {
    if (!data || data.pending) {
        return (
            <div
                className="relative rounded-2xl h-full min-h-[132px] flex flex-col items-center justify-center text-center px-3 py-5 overflow-hidden"
                style={{
                    border: `1px dashed ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(53,53,53,0.16)'}`,
                    backgroundImage: `repeating-linear-gradient(135deg, ${dark ? 'rgba(255,255,255,0.035)' : 'rgba(53,53,53,0.035)'} 0px, ${dark ? 'rgba(255,255,255,0.035)' : 'rgba(53,53,53,0.035)'} 1px, transparent 1px, transparent 9px)`,
                }}
            >
                <span
                    className="text-[0.625rem] font-bold uppercase tracking-[0.18em]"
                    style={{ color: theme.colors.textSecondary, opacity: 0.75 }}
                >
                    Pending verification
                </span>
                <span className="text-[0.6875rem] mt-1.5 leading-snug" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                    {data?.note || 'Awaiting price list'}
                </span>
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl h-full min-h-[132px] flex flex-col px-4 py-4"
            style={{
                border: `1px solid ${theme.colors.border}`,
                background: dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            }}
        >
            <span
                className="font-mono text-[0.6875rem] tracking-wide"
                style={{ color: theme.colors.textSecondary, opacity: 0.8 }}
            >
                {data.model}
            </span>
            <div className="mt-1 flex items-start gap-0.5" style={{ color: theme.colors.textPrimary }}>
                <span className="text-sm font-semibold mt-0.5">$</span>
                <span className="text-[1.75rem] leading-none font-bold tracking-tight tabular-nums">
                    {formatGbbPrice(data.price)}
                </span>
            </div>
            <p className="text-[0.75rem] leading-relaxed mt-2" style={{ color: theme.colors.textSecondary }}>
                {data.spec}
            </p>
            <span className="sr-only">{tier.label} tier</span>
        </div>
    );
};

const SeriesRow = ({ row, theme, dark }) => (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(120px,168px)_repeat(3,minmax(0,1fr))] gap-x-5 gap-y-3 items-stretch">
        {/* Series label */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3 sm:pt-1">
            <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#F0EDE8', border: `1px solid ${theme.colors.border}` }}
            >
                {row.image ? (
                    <img src={row.image} alt={row.series} className="w-full h-full object-cover" loading="lazy" />
                ) : null}
            </div>
            <div>
                <h3 className="text-base font-bold tracking-tight leading-tight" style={{ color: theme.colors.textPrimary }}>
                    {row.series}
                </h3>
                <p className="text-[0.75rem] leading-snug mt-0.5" style={{ color: theme.colors.textSecondary }}>
                    {row.descriptor}
                </p>
            </div>
        </div>

        {/* Tier cells */}
        {GBB_TIERS.map((t) => (
            <div key={t.id} className="flex flex-col">
                {/* Per-tier label — only on mobile (desktop uses the shared header row) */}
                <div className="flex items-center gap-1.5 mb-1.5 sm:hidden">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} />
                    <span className="text-[0.625rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>
                        {t.label}
                    </span>
                </div>
                <TierCell data={row.tiers?.[t.id]} tier={t} theme={theme} dark={dark} />
            </div>
        ))}
    </div>
);

export const GoodBetterBestScreen = ({ theme }) => {
    const dark = isDarkTheme(theme);
    const deck = GOOD_BETTER_BEST_DECK;
    const sections = deck.sections;
    const [index, setIndex] = useState(0);
    const [shareNote, setShareNote] = useState('');

    const total = sections.length;
    const active = sections[index] || sections[0];

    const goTo = useCallback((next) => {
        setIndex((cur) => {
            const target = typeof next === 'function' ? next(cur) : next;
            return Math.max(0, Math.min(total - 1, target));
        });
    }, [total]);

    const onShare = useCallback(async () => {
        const url = typeof window !== 'undefined' ? `${window.location.origin}/${GBB_ROUTE}` : '';
        try {
            if (navigator.share) {
                await navigator.share({ title: deck.title, text: deck.subtitle, url });
                return;
            }
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                setShareNote('Link copied');
                setTimeout(() => setShareNote(''), 1800);
            }
        } catch { /* user cancelled */ }
    }, [deck.title, deck.subtitle]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') goTo((c) => c + 1);
            else if (e.key === 'ArrowLeft') goTo((c) => c - 1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goTo]);

    const subtleBtn = useMemo(() => ({
        color: theme.colors.textSecondary,
        background: theme.colors.subtle,
        border: `1px solid ${theme.colors.border}`,
    }), [theme]);

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
            {/* Top chrome: context label + share (back is handled by the app header) */}
            <div
                className="flex-shrink-0"
                style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 12px)', backgroundColor: theme.colors.background }}
            >
                <ScreenTopChrome theme={theme} contentClassName="pb-2" fade={false}>
                    <div className="flex items-center justify-between gap-2">
                        <span
                            className="text-[0.6875rem] font-bold uppercase tracking-[0.18em]"
                            style={{ color: theme.colors.textSecondary, opacity: 0.6 }}
                        >
                            Sales Deck
                        </span>
                        <button
                            onClick={onShare}
                            className="inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold transition-colors active:opacity-70 flex-shrink-0"
                            style={{ height: 'var(--jsi-ctrl-h, 36px)', ...subtleBtn }}
                        >
                            {shareNote ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                            {shareNote || 'Share'}
                        </button>
                    </div>
                </ScreenTopChrome>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide pb-28">
                <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <div className="pt-1 pb-5">
                        <h1 className="text-[2rem] sm:text-[2.75rem] font-black leading-[1.02] tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {deck.title}
                        </h1>
                        <p className="text-sm sm:text-base leading-relaxed mt-2 max-w-2xl" style={{ color: theme.colors.textSecondary }}>
                            {deck.subtitle}
                        </p>
                    </div>

                    {/* Section pills */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4">
                        {sections.map((s, i) => {
                            const isActive = i === index;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => goTo(i)}
                                    className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all"
                                    style={{
                                        background: isActive ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)'),
                                        color: isActive ? theme.colors.accentText : theme.colors.textSecondary,
                                        border: `1px solid ${isActive ? theme.colors.accent : theme.colors.border}`,
                                    }}
                                >
                                    {s.title}
                                </button>
                            );
                        })}
                    </div>

                    {/* Slide */}
                    <AnimatePresence mode="wait">
                        <motion.section
                            key={active.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22 }}
                            className="rounded-3xl p-5 sm:p-7"
                            style={{
                                background: dark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                border: `1px solid ${theme.colors.border}`,
                                boxShadow: dark ? 'none' : '0 4px 24px rgba(53,53,53,0.06)',
                            }}
                        >
                            {/* Slide header */}
                            <div className="flex items-end justify-between gap-4 pb-4 mb-5" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-[0.6875rem] tracking-wide" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                                            {pad(index + 1)} / {pad(total)}
                                        </span>
                                        <span className="text-[0.625rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                                            {active.eyebrow}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none" style={{ color: theme.colors.textPrimary }}>
                                        {active.title}
                                    </h2>
                                    {active.blurb ? (
                                        <p className="text-[0.8125rem] leading-relaxed mt-2 max-w-xl" style={{ color: theme.colors.textSecondary }}>
                                            {active.blurb}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            {/* Shared GOOD / BETTER / BEST column headers (desktop) */}
                            <div className="hidden sm:grid grid-cols-[minmax(120px,168px)_repeat(3,minmax(0,1fr))] gap-x-5 mb-3">
                                <div />
                                {GBB_TIERS.map((t) => (
                                    <div key={t.id} className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ background: t.dot }} />
                                        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>
                                            {t.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Series rows */}
                            <div className="space-y-7 sm:space-y-5">
                                {active.rows.map((row, ri) => (
                                    <React.Fragment key={row.series + ri}>
                                        {ri > 0 ? <div className="hidden sm:block" style={{ borderTop: `1px solid ${theme.colors.border}` }} /> : null}
                                        <SeriesRow row={row} theme={theme} dark={dark} />
                                    </React.Fragment>
                                ))}
                            </div>
                        </motion.section>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom nav bar */}
            <div
                className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-3"
                style={{
                    borderTop: `1px solid ${theme.colors.border}`,
                    background: dark ? 'rgba(22,22,22,0.85)' : 'rgba(240,237,232,0.85)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
                }}
            >
                <div className="mx-auto w-full max-w-content flex items-center justify-between gap-3">
                    <button
                        onClick={() => goTo((c) => c - 1)}
                        disabled={index === 0}
                        className="inline-flex items-center gap-1.5 pl-2 pr-4 py-2 rounded-full text-xs font-semibold transition-all disabled:opacity-35"
                        style={subtleBtn}
                    >
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </button>

                    <div className="flex items-center gap-1.5">
                        {sections.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => goTo(i)}
                                aria-label={`Go to ${s.title}`}
                                className="rounded-full transition-all"
                                style={{
                                    width: i === index ? 22 : 7,
                                    height: 7,
                                    background: i === index ? theme.colors.accent : theme.colors.border,
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => goTo((c) => c + 1)}
                        disabled={index === total - 1}
                        className="inline-flex items-center gap-1.5 pl-4 pr-2 py-2 rounded-full text-xs font-semibold transition-all disabled:opacity-35"
                        style={subtleBtn}
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoodBetterBestScreen;
