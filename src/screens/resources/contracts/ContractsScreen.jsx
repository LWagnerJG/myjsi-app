import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { ExternalLink, Copy, Share2, Download, FileText, Link2 } from 'lucide-react';
import { CONTRACTS_DATA } from './data.js';

/* ── constants ────────────────────────────────────────── */
const TABS = [
    { label: 'Omnia', value: 'omnia' },
    { label: 'TIPS', value: 'tips' },
    { label: 'Premier', value: 'premier' },
    { label: 'GSA', value: 'gsa' },
];

const DOC_VERSIONS = [
    { key: 'documentUrl',       label: 'Rep Version',    short: 'Rep' },
    { key: 'dealerDocumentUrl', label: 'Dealer Version', short: 'Dealer' },
    { key: 'publicDocumentUrl', label: 'Public Version', short: 'Public' },
];

/* ── animation helpers ────────────────────────────────── */
const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
};

const stagger = (i, base = 0.04) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22, delay: i * base, ease: [0.25, 0.1, 0.25, 1] } },
});

/* ── main screen ──────────────────────────────────────── */
export const ContractsScreen = ({ theme, setSuccessMessage }) => {
    const [active, setActive] = useState('omnia');
    const dark = isDarkTheme(theme);
    const contract = CONTRACTS_DATA[active];
    const hasMargins = contract.discounts?.some(r => r.margin);

    const feedback = useCallback((msg) => {
        setSuccessMessage?.(msg);
        if (msg) setTimeout(() => setSuccessMessage?.(''), 1400);
    }, [setSuccessMessage]);

    const copyUrl = useCallback(async (url, label) => {
        try { await navigator.clipboard.writeText(url); feedback(`${label} link copied`); } catch { /* no-op */ }
    }, [feedback]);

    const shareUrl = useCallback(async (url, title) => {
        if (navigator.share) { try { await navigator.share({ title, url }); } catch { /* no-op */ } }
        else { await navigator.clipboard.writeText(url); feedback('Link copied'); }
    }, [feedback]);

    return (
        <div className="flex h-full flex-col app-header-offset" style={{ backgroundColor: theme.colors.background }}>

            {/* ── Full-width tab bar ── */}
            <div className="px-4 pt-1 pb-3">
                <div className="flex rounded-xl overflow-hidden relative" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                    {TABS.map(t => {
                        const on = active === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => setActive(t.value)}
                                className="flex-1 py-[9px] text-[13px] font-semibold text-center relative z-10 transition-colors duration-200"
                                style={{
                                    color: on ? (theme.colors.accentText || '#fff') : theme.colors.textSecondary,
                                }}
                            >
                                {on && (
                                    <motion.div
                                        layoutId="contract-tab-bg"
                                        className="absolute inset-0 rounded-xl"
                                        style={{ backgroundColor: theme.colors.accent }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                    />
                                )}
                                <span className="relative z-10">{t.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 scrollbar-hide">
                <AnimatePresence mode="wait">
                    <motion.div key={active} {...fadeUp} className="space-y-5">

                        {/* Contract title */}
                        <div className="pt-0.5">
                            <h2 className="text-[17px] font-bold leading-snug" style={{ color: theme.colors.textPrimary }}>
                                {contract.name}
                            </h2>
                            {contract.subtitle && (
                                <p className="text-[12px] mt-1" style={{ color: theme.colors.textSecondary }}>{contract.subtitle}</p>
                            )}
                        </div>

                        {/* ── Pricing tiers ── */}
                        <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                            {/* Column headers */}
                            <div className="flex items-center px-4 py-2.5" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                                <span className="flex-1 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>
                                    Pricing Tiers
                                </span>
                                <div className="flex items-center" style={{ gap: '2px' }}>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.05em] w-[50px] text-center" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Dlr</span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.05em] w-[50px] text-center" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Rep</span>
                                    {hasMargins && (
                                        <span className="text-[10px] font-bold uppercase tracking-[0.05em] w-[52px] text-center" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Margin</span>
                                    )}
                                </div>
                            </div>

                            {/* Rows */}
                            {contract.discounts?.map((row, idx) => (
                                <motion.div
                                    key={idx}
                                    {...stagger(idx)}
                                    className="flex items-center px-4 py-3.5"
                                    style={{ borderBottom: idx < contract.discounts.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` : 'none' }}
                                >
                                    {/* Left: discount + label */}
                                    <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                        <span className="text-[15px] font-extrabold tabular-nums flex-shrink-0" style={{ color: theme.colors.accent }}>
                                            {row.discount}
                                        </span>
                                        <span className="text-[13px] font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                                            {row.label}
                                        </span>
                                    </div>
                                    {/* Right: stats */}
                                    <div className="flex items-center flex-shrink-0" style={{ gap: '2px' }}>
                                        <span className="text-[13px] font-semibold tabular-nums w-[50px] text-center" style={{ color: theme.colors.textPrimary }}>
                                            {row.dealerCommission}
                                        </span>
                                        <span className="text-[13px] tabular-nums w-[50px] text-center" style={{ color: theme.colors.textSecondary }}>
                                            {row.repCommission}
                                        </span>
                                        {hasMargins && (
                                            <span className="text-[12px] tabular-nums w-[52px] text-center font-medium" style={{ color: theme.colors.textSecondary, opacity: row.margin ? 0.6 : 0.3 }}>
                                                {row.margin || '—'}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </GlassCard>

                        {/* ── Disclaimer (if any) ── */}
                        {contract.disclaimer && (
                            <p className="text-[12px] italic px-1 leading-relaxed" style={{ color: theme.colors.textSecondary, opacity: 0.65 }}>
                                {contract.disclaimer}
                            </p>
                        )}

                        {/* ── Document Versions ── */}
                        <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                            <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                                <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>
                                    Documents
                                </span>
                            </div>

                            {DOC_VERSIONS.map((ver, idx) => {
                                const url = contract[ver.key];
                                if (!url) return null;
                                return (
                                    <motion.div
                                        key={ver.key}
                                        {...stagger(idx, 0.06)}
                                        className="px-4 py-3.5 flex items-center justify-between"
                                        style={{ borderBottom: idx < DOC_VERSIONS.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` : 'none' }}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <FileText className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                                            <span className="text-[13px] font-medium" style={{ color: theme.colors.textPrimary }}>
                                                {ver.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <IconBtn icon={ExternalLink} title="Open" onClick={() => window.open(url, '_blank')} theme={theme} dark={dark} />
                                            <IconBtn icon={Link2} title="Copy link" onClick={() => copyUrl(url, ver.short)} theme={theme} dark={dark} />
                                            <IconBtn icon={Share2} title="Share" onClick={() => shareUrl(url, `${contract.name} — ${ver.label}`)} theme={theme} dark={dark} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </GlassCard>

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

/* ── small icon button ────────────────────────────────── */
const IconBtn = ({ icon: Icon, title, onClick, theme, dark }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90"
        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
    >
        <Icon className="w-[15px] h-[15px]" style={{ color: theme.colors.textSecondary }} />
    </button>
);
