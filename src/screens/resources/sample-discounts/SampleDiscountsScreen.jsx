import React, { useCallback, useMemo, useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { isDarkTheme, subtleBg } from '../../../design-system/tokens.js';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_POLICIES } from './data.js';

const INFO   = '#5B7B8C';
const WARN   = '#C4956A';

export const SampleDiscountsScreen = ({ theme, setSuccessMessage }) => {
    const isDark  = isDarkTheme(theme);
    const colors  = theme.colors;
    const [copiedId, setCopiedId] = useState(null);

    // Best discount first
    const sorted = useMemo(
        () => [...SAMPLE_POLICIES].sort((a, b) => b.discount - a.discount),
        []
    );

    const handleCopy = useCallback((policy) => {
        const val = `SSA ${policy.ssa}`;
        const finish = (ok) => {
            if (ok) {
                setCopiedId(policy.id);
                setTimeout(() => setCopiedId(null), 1800);
                setSuccessMessage?.('SSA# Copied!');
                setTimeout(() => setSuccessMessage?.(''), 1400);
            } else {
                setSuccessMessage?.('Copy failed');
                setTimeout(() => setSuccessMessage?.(''), 1200);
            }
        };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(val).then(() => finish(true)).catch(() => finish(false));
        } else {
            try {
                const ta = document.createElement('textarea');
                ta.value = val;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                finish(true);
            } catch { finish(false); }
        }
    }, [setSuccessMessage]);

    return (
        <div
            className="min-h-full app-header-offset overflow-x-hidden"
            style={{ backgroundColor: colors.background }}
        >
            <div className="min-w-0 px-4 sm:px-6 lg:px-8 pt-5 pb-12 max-w-content mx-auto w-full space-y-3">

                {/* ── Page header ── */}
                <div className="pb-1">
                    <h1
                        className="text-[1.75rem] font-black tracking-tight leading-tight"
                        style={{ color: colors.textPrimary }}
                    >
                        Sample Policies
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                        <span
                            className="text-xs font-semibold"
                            style={{ color: colors.textPrimary, opacity: 0.35 }}
                        >
                            Effective May 1, 2021
                        </span>
                        <span
                            className="inline-flex items-center text-[0.5625rem] font-black uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                            style={{
                                backgroundColor: `${WARN}${isDark ? '28' : '18'}`,
                                color: WARN,
                            }}
                        >
                            No commission
                        </span>
                    </div>
                </div>

                {/* ── Policy cards ── */}
                {sorted.map((policy, i) => {
                    const isCopied  = copiedId === policy.id;
                    const isPremium = policy.discount === 85;
                    const badgeColor = isPremium ? INFO : colors.accent;
                    const badgeBg    = `${badgeColor}${isDark ? '22' : (isPremium ? '14' : '0F')}`;

                    // Pull notes that aren't the commission reminder (shown in page header)
                    const notes = (policy.notes || []).filter(
                        n => !n.toLowerCase().includes('commission')
                    );

                    return (
                        <motion.div
                            key={policy.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.24,
                                delay: i * 0.055,
                                ease: [0.34, 1.1, 0.64, 1],
                            }}
                        >
                            <GlassCard theme={theme} variant="elevated" className="overflow-hidden p-0">

                                {/* Top: badge + title + notes */}
                                <div className="px-4 pt-4 pb-4 flex items-start gap-3.5">

                                    {/* Discount badge */}
                                    <div
                                        className="rounded-[18px] flex flex-col items-center justify-center shrink-0"
                                        style={{
                                            width: 62,
                                            height: 62,
                                            backgroundColor: badgeBg,
                                        }}
                                    >
                                        <span
                                            className="text-[1.375rem] font-black tabular-nums leading-none tracking-tight"
                                            style={{ color: badgeColor }}
                                        >
                                            {policy.discount}%
                                        </span>
                                        <span
                                            className="text-[6.5px] font-black uppercase tracking-[0.14em] mt-[3px]"
                                            style={{ color: badgeColor, opacity: 0.5 }}
                                        >
                                            off list
                                        </span>
                                    </div>

                                    {/* Title + optional "Best" badge + notes */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-start gap-2 min-w-0">
                                            <p
                                                className="text-[0.9375rem] font-bold leading-snug tracking-tight flex-1 min-w-0"
                                                style={{ color: colors.textPrimary }}
                                            >
                                                {policy.title}
                                            </p>
                                            {isPremium && (
                                                <span
                                                    className="shrink-0 text-[0.5rem] font-black uppercase tracking-[0.1em] px-1.5 py-[3px] rounded-md"
                                                    style={{
                                                        backgroundColor: `${INFO}${isDark ? '28' : '14'}`,
                                                        color: INFO,
                                                    }}
                                                >
                                                    Best
                                                </span>
                                            )}
                                        </div>

                                        {policy.subtitle && (
                                            <p
                                                className="text-xs mt-1 leading-snug"
                                                style={{ color: colors.textPrimary, opacity: 0.5 }}
                                            >
                                                {policy.subtitle}
                                            </p>
                                        )}

                                        {notes.map((note, ni) => (
                                            <p
                                                key={ni}
                                                className="text-xs mt-0.5 leading-snug"
                                                style={{ color: colors.textPrimary, opacity: 0.38 }}
                                            >
                                                {note}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Full-width SSA copy footer */}
                                <button
                                    type="button"
                                    onClick={() => handleCopy(policy)}
                                    className="w-full flex items-center justify-between px-4 min-h-[44px] py-3 transition-all active:opacity-60"
                                    style={{
                                        backgroundColor: isCopied
                                            ? `${colors.accent}0A`
                                            : subtleBg(theme, 1.5),
                                        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.045)'}`,
                                    }}
                                    aria-label={`Copy SSA code ${policy.ssa}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className="text-[0.5rem] font-black uppercase tracking-[0.18em]"
                                            style={{ color: colors.textPrimary, opacity: 0.28 }}
                                        >
                                            SSA
                                        </span>
                                        <span
                                            className="text-sm font-mono font-bold tracking-wider"
                                            style={{
                                                color: isCopied ? colors.accent : colors.textPrimary,
                                                opacity: isCopied ? 1 : 0.82,
                                                transition: 'color 200ms ease',
                                            }}
                                        >
                                            {policy.ssa}
                                        </span>
                                    </div>

                                    <AnimatePresence mode="wait" initial={false}>
                                        {isCopied ? (
                                            <motion.span
                                                key="check"
                                                initial={{ scale: 0.6, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.6, opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                                                className="flex items-center gap-1.5 shrink-0"
                                            >
                                                <span
                                                    className="text-[0.5625rem] font-bold"
                                                    style={{ color: colors.accent }}
                                                >
                                                    Copied
                                                </span>
                                                <Check className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="copy"
                                                initial={{ scale: 0.6, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.6, opacity: 0 }}
                                                transition={{ duration: 0.12 }}
                                                className="shrink-0"
                                            >
                                                <Copy
                                                    className="w-3.5 h-3.5"
                                                    style={{ color: colors.textPrimary, opacity: 0.28 }}
                                                />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>

                            </GlassCard>
                        </motion.div>
                    );
                })}

            </div>
        </div>
    );
};
