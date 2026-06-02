import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2, Check, X } from 'lucide-react';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { GOOD_BETTER_BEST_DECK, GBB_TIERS, GBB_ROUTE, formatGbbPrice } from './goodBetterBestData.js';

const pad = (n) => String(n).padStart(2, '0');

const TierCard = ({ tier, data, theme, dark }) => (
    <div
        className="rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 flex items-center gap-4"
        style={{
            border: `1px solid ${theme.colors.border}`,
            background: dark ? 'rgba(255,255,255,0.035)' : '#FFFFFF',
        }}
    >
        <div className="flex items-center gap-2 w-[5.25rem] flex-shrink-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tier.dot }} />
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                {tier.label}
            </span>
        </div>
        <div className="flex-1 min-w-0">
            <span className="font-mono text-[0.6875rem] tracking-wide" style={{ color: theme.colors.textSecondary, opacity: 0.8 }}>
                {data.model}
            </span>
            <p className="text-[0.75rem] leading-snug mt-0.5" style={{ color: theme.colors.textSecondary }}>
                {data.spec}
            </p>
        </div>
        <div className="flex items-start gap-0.5 flex-shrink-0" style={{ color: theme.colors.textPrimary }}>
            <span className="text-sm font-semibold mt-0.5">$</span>
            <span className="text-[1.625rem] sm:text-[1.875rem] leading-none font-bold tracking-tight tabular-nums">
                {formatGbbPrice(data.price)}
            </span>
        </div>
    </div>
);

export const GoodBetterBestScreen = ({ theme, onNavigate, handleBack }) => {
    const dark = isDarkTheme(theme);
    const deck = GOOD_BETTER_BEST_DECK;
    const sections = deck.sections;
    const [index, setIndex] = useState(0);
    const [shareNote, setShareNote] = useState('');

    const total = sections.length;
    const active = sections[index] || sections[0];

    // Always land on the presentations list — predictable whether the deck was
    // opened from Browse or via a shared deep link (no in-app history).
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

    // Immersive: lock body scroll while the deck is open.
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

    const pillBtn = useMemo(() => ({
        color: theme.colors.textSecondary,
        background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${theme.colors.border}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
    }), [theme, dark]);

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
                        style={pillBtn}
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
                    style={pillBtn}
                >
                    {shareNote ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    {shareNote || 'Share'}
                </button>
            </div>

            {/* Slide */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
                    <AnimatePresence mode="wait">
                        <motion.section
                            key={active.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.24 }}
                            className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-5 lg:gap-8 lg:items-center"
                        >
                            {/* Hero image */}
                            <div
                                className="rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[clamp(360px,58vh,560px)]"
                                style={{ border: `1px solid ${theme.colors.border}`, background: dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF' }}
                            >
                                <img src={active.image} alt={`${active.title} lounge`} className="w-full h-full object-cover" />
                            </div>

                            {/* Detail */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
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
                                <p className="text-sm sm:text-[0.9375rem] leading-relaxed mt-2.5 max-w-md" style={{ color: theme.colors.textSecondary }}>
                                    {active.blurb}
                                </p>

                                <div className="space-y-2.5 mt-5">
                                    {GBB_TIERS.map((t) => (
                                        <TierCard key={t.id} tier={t} data={active.tiers[t.id]} theme={theme} dark={dark} />
                                    ))}
                                </div>
                            </div>
                        </motion.section>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom nav */}
            <div
                className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-3"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
            >
                <div className="mx-auto w-full max-w-[1100px] flex items-center justify-between gap-3">
                    <button
                        onClick={() => goTo((c) => c - 1)}
                        disabled={index === 0}
                        className="inline-flex items-center gap-1.5 pl-2 pr-4 h-10 rounded-full text-xs font-semibold transition-all disabled:opacity-30"
                        style={pillBtn}
                    >
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </button>

                    <div className="flex items-center gap-2">
                        {sections.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => goTo(i)}
                                aria-label={`Go to ${s.title}`}
                                className="rounded-full transition-all"
                                style={{
                                    width: i === index ? 26 : 8,
                                    height: 8,
                                    background: i === index ? theme.colors.accent : theme.colors.border,
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => goTo((c) => c + 1)}
                        disabled={index === total - 1}
                        className="inline-flex items-center gap-1.5 pl-4 pr-2 h-10 rounded-full text-xs font-semibold transition-all disabled:opacity-30"
                        style={pillBtn}
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(overlay, document.body);
};

export default GoodBetterBestScreen;
