import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2, Check, X } from 'lucide-react';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { GOOD_BETTER_BEST_DECK, GBB_TIERS, GBB_ROUTE, formatGbbPrice } from './goodBetterBestData.js';

const pad = (n) => String(n).padStart(2, '0');

// One Good/Better/Best product column — a distinct JSI family, its own photo.
const ProductCard = ({ tier, data, theme, dark }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: tier.index * 0.06 }}
        className="rounded-3xl overflow-hidden flex flex-col"
        style={{
            border: `1px solid ${theme.colors.border}`,
            background: dark ? 'rgba(255,255,255,0.035)' : '#FFFFFF',
            boxShadow: dark ? 'none' : '0 6px 24px rgba(53,53,53,0.07)',
        }}
    >
        <div className="h-1.5 w-full flex-shrink-0" style={{ background: tier.dot }} />
        <div className="relative aspect-[4/3]" style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#F0EDE8' }}>
            <img src={data.image} alt={`${data.series} — ${tier.label}`} className="w-full h-full object-cover" loading="lazy" />
            <span
                className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.16em]"
                style={{ background: dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.92)', color: theme.colors.textPrimary, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            >
                <span className="w-2 h-2 rounded-full" style={{ background: tier.dot }} />
                {tier.label}
            </span>
        </div>
        <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-none" style={{ color: theme.colors.textPrimary }}>
                {data.series}
            </h3>
            <span className="font-mono text-[0.6875rem] tracking-wide mt-1" style={{ color: theme.colors.textSecondary, opacity: 0.8 }}>
                {data.model}
            </span>
            <p className="text-[0.8125rem] leading-relaxed mt-2.5" style={{ color: theme.colors.textSecondary }}>
                {data.spec}
            </p>
            <div className="mt-auto pt-4 flex items-start gap-0.5" style={{ color: theme.colors.textPrimary }}>
                <span className="text-base font-semibold mt-1">$</span>
                <span className="text-[2.25rem] leading-none font-black tracking-tight tabular-nums">
                    {formatGbbPrice(data.price)}
                </span>
                <span className="text-[0.6875rem] font-semibold self-end mb-1.5 ml-1.5" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>list</span>
            </div>
        </div>
    </motion.div>
);

export const GoodBetterBestScreen = ({ theme, onNavigate, handleBack }) => {
    const dark = isDarkTheme(theme);
    const deck = GOOD_BETTER_BEST_DECK;
    const sections = deck.sections;
    const [index, setIndex] = useState(0);
    const [shareNote, setShareNote] = useState('');

    const total = sections.length;
    const active = sections[index] || sections[0];

    const close = useCallback(() => {
        if (typeof onNavigate === 'function') onNavigate('presentations');
        else if (typeof handleBack === 'function') handleBack();
    }, [onNavigate, handleBack]);

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
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') goTo((c) => c + 1);
            else if (e.key === 'ArrowLeft') goTo((c) => c - 1);
            else if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goTo, close]);

    const ghostBtn = useMemo(() => ({
        color: theme.colors.textSecondary,
        background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${theme.colors.border}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
    }), [theme, dark]);

    const tiersWithMeta = useMemo(() => GBB_TIERS.map((t, i) => ({ ...t, index: i })), []);

    const atStart = index === 0;
    const atEnd = index === total - 1;

    const overlay = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex flex-col"
            style={{
                zIndex: 80,
                background: dark
                    ? 'radial-gradient(120% 80% at 50% 0%, #1d1d1d 0%, #161616 60%)'
                    : 'radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, #F0EDE8 55%)',
                color: theme.colors.textPrimary,
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${deck.title} presentation`}
        >
            {/* Top bar */}
            <div
                className="flex-shrink-0 flex items-center justify-between gap-2 px-4 sm:px-6"
                style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)', paddingBottom: 12 }}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <button
                        onClick={close}
                        aria-label="Close presentation"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90 flex-shrink-0"
                        style={ghostBtn}
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold tracking-tight truncate" style={{ color: theme.colors.textPrimary }}>
                        {deck.title}
                    </span>
                </div>
                <button
                    onClick={onShare}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold transition-all active:scale-95 flex-shrink-0"
                    style={ghostBtn}
                >
                    {shareNote ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    {shareNote || 'Share'}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-1 pb-6">
                    {/* Category nav pills */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4">
                        {sections.map((s, i) => {
                            const isActive = i === index;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => goTo(i)}
                                    className="px-4 py-2 rounded-full text-[0.8125rem] font-semibold whitespace-nowrap flex-shrink-0 transition-all"
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

                    <AnimatePresence mode="wait">
                        <motion.section
                            key={active.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22 }}
                        >
                            {/* Category header */}
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-mono text-[0.6875rem] tracking-wide" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                                    {pad(index + 1)} / {pad(total)}
                                </span>
                                <span className="text-[0.625rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                                    {active.eyebrow}
                                </span>
                            </div>
                            <h1 className="text-[2.25rem] sm:text-[3rem] font-black leading-[0.98] tracking-tight" style={{ color: theme.colors.textPrimary }}>
                                {active.title}
                            </h1>
                            <p className="text-sm sm:text-[0.9375rem] leading-relaxed mt-2 mb-6 max-w-2xl" style={{ color: theme.colors.textSecondary }}>
                                {active.blurb}
                            </p>

                            {/* Good / Better / Best columns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
                                {tiersWithMeta.map((t) => (
                                    <ProductCard key={t.id} tier={t} data={active.tiers[t.id]} theme={theme} dark={dark} />
                                ))}
                            </div>
                        </motion.section>
                    </AnimatePresence>
                </div>
            </div>

            {/* Prominent bottom nav */}
            <div
                className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-3"
                style={{
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
                    borderTop: `1px solid ${theme.colors.border}`,
                    background: dark ? 'rgba(22,22,22,0.7)' : 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <div className="mx-auto w-full max-w-[1200px] flex items-center justify-between gap-3">
                    <button
                        onClick={() => goTo((c) => c - 1)}
                        disabled={atStart}
                        className="inline-flex items-center justify-center gap-1.5 h-12 px-5 sm:px-6 rounded-full text-sm font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100"
                        style={ghostBtn}
                    >
                        <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Prev</span>
                    </button>

                    <div className="flex items-center gap-2">
                        {sections.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => goTo(i)}
                                aria-label={`Go to ${s.title}`}
                                className="rounded-full transition-all"
                                style={{
                                    width: i === index ? 30 : 9,
                                    height: 9,
                                    background: i === index ? theme.colors.accent : theme.colors.border,
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => goTo((c) => c + 1)}
                        disabled={atEnd}
                        className="inline-flex items-center justify-center gap-2 h-12 px-6 sm:px-8 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100"
                        style={{ background: theme.colors.accent, color: theme.colors.accentText, boxShadow: '0 6px 18px rgba(53,53,53,0.18)' }}
                    >
                        <span className="hidden sm:inline">{atEnd ? 'Done' : `Next · ${sections[Math.min(index + 1, total - 1)].title}`}</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(overlay, document.body);
};

export default GoodBetterBestScreen;
