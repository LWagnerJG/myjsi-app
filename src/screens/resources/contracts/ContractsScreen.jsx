import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { ExternalLink, Link2, Share2, FileText } from 'lucide-react';
import { CONTRACTS_DATA } from './data.js';

const TABS = [
    { label: 'Omnia',   value: 'omnia'   },
    { label: 'TIPS',    value: 'tips'    },
    { label: 'Premier', value: 'premier' },
    { label: 'GSA',     value: 'gsa'     },
    { label: 'State',   value: 'state'   },
];

const DOC_VERSIONS = [
    { key: 'documentUrl',       label: 'Rep Version',    short: 'Rep'    },
    { key: 'dealerDocumentUrl', label: 'Dealer Version', short: 'Dealer' },
    { key: 'publicDocumentUrl', label: 'Public Version', short: 'Public' },
];

const fadeUp = {
    initial:    { opacity: 0, y: 10 },
    animate:    { opacity: 1, y: 0  },
    exit:       { opacity: 0, y: -8 },
    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
};

const stagger = (i, base = 0.04) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, delay: i * base, ease: [0.25, 0.1, 0.25, 1] } },
});

/* ── small icon action button ─────────────────────────── */
const IconBtn = ({ icon: Icon, title, onClick, theme, dark }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
    >
        <Icon className="w-[15px] h-[15px]" style={{ color: theme.colors.textSecondary }} />
    </button>
);

/* ── card section header ──────────────────────────────── */
const CardHeader = ({ children, theme, dark, right }) => (
    <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}
    >
        <span
            className="text-[13px] font-bold uppercase tracking-[0.07em]"
            style={{ color: theme.colors.textSecondary, opacity: 0.65 }}
        >
            {children}
        </span>
        {right}
    </div>
);

/* ── main screen ──────────────────────────────────────── */
export const ContractsScreen = ({ theme, setSuccessMessage }) => {
    const [active, setActive] = useState('omnia');
    const dark = isDarkTheme(theme);
    const contract = CONTRACTS_DATA[active];
    const isState = active === 'state';
    const hasMargins = !isState && contract.discounts?.some(r => r.margin);

    const feedback = useCallback((msg) => {
        setSuccessMessage?.(msg);
        if (msg) setTimeout(() => setSuccessMessage?.(''), 1400);
    }, [setSuccessMessage]);

    const copyUrl  = useCallback(async (url, label) => {
        try { await navigator.clipboard.writeText(url); feedback(`${label} link copied`); } catch { /* no-op */ }
    }, [feedback]);

    const shareUrl = useCallback(async (url, title) => {
        if (navigator.share) { try { await navigator.share({ title, url }); } catch { /* no-op */ } }
        else { await navigator.clipboard.writeText(url); feedback('Link copied'); }
    }, [feedback]);

    const subtleBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

    return (
        <div className="flex h-full flex-col app-header-offset" style={{ backgroundColor: theme.colors.background }}>

            {/* ── Tab bar ── */}
            <div className="px-4 pt-3 pb-3">
                <div
                    className="flex rounded-full p-1"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
                >
                    {TABS.map(t => {
                        const on = active === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => setActive(t.value)}
                                className="flex-1 py-2 text-[13px] font-semibold text-center relative z-10 transition-colors duration-200"
                                style={{ color: on ? (theme.colors.accentText || '#fff') : theme.colors.textSecondary }}
                            >
                                {on && (
                                    <motion.div
                                        layoutId="contract-tab-bg"
                                        className="absolute inset-0 rounded-full"
                                        style={{ backgroundColor: theme.colors.accent }}
                                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
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
                    <motion.div key={active} {...fadeUp} className="space-y-4">

                        {/* Contract title */}
                        <div className="pt-1 px-1">
                            <h2 className="text-[21px] font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>
                                {contract.name}
                            </h2>
                            {contract.subtitle && (
                                <p className="text-[14px] mt-1" style={{ color: theme.colors.textSecondary }}>
                                    {contract.subtitle}
                                </p>
                            )}
                        </div>

                        {isState ? (
                            /* ── State contracts list ── */
                            <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                                <CardHeader theme={theme} dark={dark} right={
                                    <span className="text-[11px] font-bold uppercase tracking-[0.06em]"
                                        style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
                                        {contract.entries.length} States
                                    </span>
                                }>
                                    Active Contracts
                                </CardHeader>
                                {contract.entries.map((entry, idx) => (
                                    <motion.div
                                        key={entry.state}
                                        {...stagger(idx, 0.025)}
                                        className="flex items-start px-5 gap-4"
                                        style={{
                                            paddingTop: 13,
                                            paddingBottom: 13,
                                            borderBottom: idx < contract.entries.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                        }}
                                    >
                                        {/* State name */}
                                        <span
                                            className="text-[14px] font-semibold shrink-0 w-[118px]"
                                            style={{ color: theme.colors.textPrimary }}
                                        >
                                            {entry.state}
                                        </span>
                                        {/* Contract numbers */}
                                        <div className="flex-1 flex flex-col gap-[5px]">
                                            {entry.contracts.map((c, ci) => (
                                                <div key={ci} className="flex flex-col">
                                                    <span
                                                        className="text-[13px] font-mono font-medium leading-snug"
                                                        style={{ color: theme.colors.accent }}
                                                    >
                                                        {c.number}
                                                    </span>
                                                    {c.label && (
                                                        <span
                                                            className="text-[11px] leading-snug"
                                                            style={{ color: theme.colors.textSecondary, opacity: 0.6 }}
                                                        >
                                                            {c.label}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </GlassCard>
                        ) : (
                            <>
                                {/* ── Pricing tiers ── */}
                                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                                    <CardHeader theme={theme} dark={dark} right={
                                        <div className="flex items-center gap-5">
                                            <span className="text-[11px] font-bold uppercase tracking-[0.06em] w-[52px] text-center"
                                                style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Dlr</span>
                                            <span className="text-[11px] font-bold uppercase tracking-[0.06em] w-[52px] text-center"
                                                style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Rep</span>
                                            {hasMargins && (
                                                <span className="text-[11px] font-bold uppercase tracking-[0.06em] w-[56px] text-center"
                                                    style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Margin</span>
                                            )}
                                        </div>
                                    }>
                                        Pricing Tiers
                                    </CardHeader>

                                    {contract.discounts?.map((row, idx) => (
                                        <motion.div
                                            key={idx}
                                            {...stagger(idx)}
                                            className="flex items-center px-5"
                                            style={{
                                                paddingTop: 13,
                                                paddingBottom: 13,
                                                borderBottom: idx < contract.discounts.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                            }}
                                        >
                                            <div className="flex-1 min-w-0 flex items-baseline gap-2.5">
                                                <span className="text-[16px] font-extrabold tabular-nums shrink-0" style={{ color: theme.colors.accent }}>
                                                    {row.discount}
                                                </span>
                                                <span className="text-[14px] font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                                                    {row.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center shrink-0 gap-5">
                                                <span className="text-[14px] font-semibold tabular-nums w-[52px] text-center" style={{ color: theme.colors.textPrimary }}>
                                                    {row.dealerCommission}
                                                </span>
                                                <span className="text-[14px] tabular-nums w-[52px] text-center" style={{ color: theme.colors.textSecondary }}>
                                                    {row.repCommission}
                                                </span>
                                                {hasMargins && (
                                                    <span className="text-[13px] tabular-nums w-[56px] text-center font-medium"
                                                        style={{ color: theme.colors.textSecondary, opacity: row.margin ? 0.65 : 0.3 }}>
                                                        {row.margin || '—'}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </GlassCard>

                                {/* Disclaimer */}
                                {contract.disclaimer && (
                                    <p className="text-[13px] italic px-1 leading-relaxed" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                                        {contract.disclaimer}
                                    </p>
                                )}

                                {/* ── Documents ── */}
                                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                                    <CardHeader theme={theme} dark={dark}>Documents</CardHeader>
                                    {DOC_VERSIONS.map((ver, idx) => {
                                        const url = contract[ver.key];
                                        if (!url) return null;
                                        return (
                                            <motion.div
                                                key={ver.key}
                                                {...stagger(idx, 0.06)}
                                                className="px-5 flex items-center justify-between"
                                                style={{
                                                    paddingTop: 13,
                                                    paddingBottom: 13,
                                                    borderBottom: idx < DOC_VERSIONS.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                                }}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
                                                    >
                                                        <FileText className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.6 }} />
                                                    </div>
                                                    <span className="text-[14px] font-medium" style={{ color: theme.colors.textPrimary }}>
                                                        {ver.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <IconBtn icon={ExternalLink} title="Open"       onClick={() => window.open(url, '_blank')}                             theme={theme} dark={dark} />
                                                    <IconBtn icon={Link2}        title="Copy link"  onClick={() => copyUrl(url, ver.short)}                               theme={theme} dark={dark} />
                                                    <IconBtn icon={Share2}       title="Share"      onClick={() => shareUrl(url, `${contract.name} — ${ver.label}`)}      theme={theme} dark={dark} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </GlassCard>
                            </>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
