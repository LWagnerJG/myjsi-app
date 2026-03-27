import React, { useCallback, useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_POLICIES } from './data.js';

const stagger = (i) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] } },
});

const POLICY_NOTE = {
    'dealer-project':  'Max qty 1 per model number',
    'rep-showroom':    'Max qty 1 per model number',
    'dealer-showroom': 'Treated as a standard order',
};

/* ── Card section header — matches ContractsScreen / DealerDetailScreen ── */
const CardHeader = ({ children, right, dark, colors }) => (
    <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}
    >
        <span
            className="text-[12px] font-bold uppercase tracking-[0.07em]"
            style={{ color: colors.textSecondary, opacity: 0.6 }}
        >
            {children}
        </span>
        {right}
    </div>
);

export const SampleDiscountsScreen = ({ theme, setSuccessMessage }) => {
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;
    const [copiedId, setCopiedId] = useState(null);
    const subtleBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

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
                ta.value = val; document.body.appendChild(ta); ta.select();
                document.execCommand('copy'); document.body.removeChild(ta);
                finish(true);
            } catch { finish(false); }
        }
    }, [setSuccessMessage]);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: colors.background }}>

            {/* ── Page header ── */}
            <div className="flex-shrink-0 px-4 pt-3 pb-3">
                <h1 className="text-[22px] font-black tracking-tight leading-tight" style={{ color: colors.textPrimary }}>
                    Sample Policies
                </h1>
                <p className="text-[14px] mt-0.5" style={{ color: colors.textSecondary }}>
                    Effective May 1, 2021 &middot; Commission not paid
                </p>
            </div>

            {/* ── Policy card ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-10">
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">

                    <CardHeader dark={isDark} colors={colors} right={
                        <span
                            className="text-[11px] font-bold uppercase tracking-[0.06em]"
                            style={{ color: colors.textSecondary, opacity: 0.4 }}
                        >
                            {SAMPLE_POLICIES.length} policies
                        </span>
                    }>
                        Discount Schedule
                    </CardHeader>

                    {SAMPLE_POLICIES.map((policy, i) => {
                        const isCopied = copiedId === policy.id;
                        const note     = POLICY_NOTE[policy.id];
                        const isTop    = policy.discount === 85;

                        return (
                            <motion.div
                                key={policy.id}
                                {...stagger(i)}
                                className="flex items-center gap-4 px-5"
                                style={{
                                    paddingTop: 15,
                                    paddingBottom: 15,
                                    borderBottom: i < SAMPLE_POLICIES.length - 1
                                        ? `1px solid ${subtleBorder}` : 'none',
                                }}
                            >
                                {/* Discount badge — proper pill container */}
                                <div
                                    className="flex-shrink-0 w-[54px] h-[54px] rounded-2xl flex flex-col items-center justify-center"
                                    style={{ backgroundColor: `${colors.accent}${isTop ? '18' : '0D'}` }}
                                >
                                    <span
                                        className="text-[20px] font-black leading-none tabular-nums"
                                        style={{ color: colors.accent }}
                                    >
                                        {policy.discount}%
                                    </span>
                                    <span
                                        className="text-[7.5px] font-bold uppercase tracking-[0.1em] mt-[3px]"
                                        style={{ color: colors.accent, opacity: 0.5 }}
                                    >
                                        off list
                                    </span>
                                </div>

                                {/* Title + subtitle + note */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-[15px] font-bold leading-snug tracking-tight"
                                        style={{ color: colors.textPrimary }}
                                    >
                                        {policy.title}
                                    </p>
                                    {policy.subtitle && (
                                        <p
                                            className="text-[12px] mt-[3px] leading-snug"
                                            style={{ color: colors.textSecondary, opacity: 0.65 }}
                                        >
                                            {policy.subtitle}
                                        </p>
                                    )}
                                    {note && (
                                        <p
                                            className="text-[12px] mt-[3px] leading-snug"
                                            style={{ color: colors.textSecondary, opacity: 0.5 }}
                                        >
                                            {note}
                                        </p>
                                    )}
                                </div>

                                {/* SSA copy — rounded-full pill per brand tokens */}
                                <button
                                    onClick={() => handleCopy(policy)}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-[7px] rounded-full transition-all active:scale-[0.93]"
                                    style={{
                                        backgroundColor: isCopied
                                            ? `${colors.accent}15`
                                            : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                                        border: `1px solid ${isCopied
                                            ? colors.accent + '40'
                                            : subtleBorder}`,
                                    }}
                                >
                                    <span
                                        className="text-[11px] font-mono font-semibold"
                                        style={{ color: isCopied ? colors.accent : colors.textPrimary }}
                                    >
                                        {policy.ssa}
                                    </span>
                                    <AnimatePresence mode="wait" initial={false}>
                                        {isCopied ? (
                                            <motion.span key="check"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.14 }}
                                            >
                                                <Check className="w-3 h-3" style={{ color: colors.accent }} />
                                            </motion.span>
                                        ) : (
                                            <motion.span key="copy"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.14 }}
                                            >
                                                <Copy className="w-3 h-3" style={{ color: colors.textSecondary, opacity: 0.4 }} />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                        );
                    })}
                </GlassCard>
            </div>
        </div>
    );
};
