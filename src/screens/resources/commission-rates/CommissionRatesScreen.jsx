import React from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import * as Data from './data.js';

/* ── helpers ─────────────────────────────────────────── */
const CONTRACT_NAMES = new Set(['GSA', 'Omnia', 'Premier', 'TIPS']);

const standardRates = Data.COMMISSION_RATES_DATA.standard.filter(r => !CONTRACT_NAMES.has(r.discount));
const contractRates = Data.COMMISSION_RATES_DATA.standard.filter(r => CONTRACT_NAMES.has(r.discount));

/* ── single rate row ─────────────────────────────────── */
const RateRow = ({ rate, theme, dark }) => (
    <div
        className="flex items-center justify-between px-4 py-[10px]"
        style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` }}
    >
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>
            {rate.discount}
        </span>
        <div className="flex items-center gap-5">
            <span className="text-[13px] font-bold tabular-nums min-w-[52px] text-right" style={{ color: theme.colors.accent }}>
                {rate.rep}
            </span>
            <span
                className="text-[13px] tabular-nums min-w-[36px] text-right"
                style={{ color: rate.spiff === 'N/A' ? theme.colors.textSecondary : theme.colors.textPrimary, opacity: rate.spiff === 'N/A' ? 0.4 : 0.7 }}
            >
                {rate.spiff}
            </span>
        </div>
    </div>
);

/* ── section heading inside card ─────────────────────── */
const SectionLabel = ({ children, theme }) => (
    <div className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>
            {children}
        </span>
        <div className="flex items-center gap-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] min-w-[52px] text-right" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Rep</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] min-w-[36px] text-right" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Spiff</span>
        </div>
    </div>
);

export const CommissionRatesScreen = ({ theme }) => {
    const dark = isDarkTheme(theme);
    const split = Data.COMMISSION_RATES_DATA.split;

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-4">

                {/* ── Standard Rates ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden mt-2">
                    <SectionLabel theme={theme}>Standard Discounts</SectionLabel>
                    {standardRates.map((rate) => (
                        <RateRow key={rate.discount} rate={rate} theme={theme} dark={dark} />
                    ))}
                </GlassCard>

                {/* ── Contract Rates ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                    <SectionLabel theme={theme}>Contract Pricing</SectionLabel>
                    {contractRates.map((rate) => (
                        <RateRow key={rate.discount} rate={rate} theme={theme} dark={dark} />
                    ))}
                </GlassCard>

                {/* ── Commission Split ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                    <div className="px-4 py-3.5 flex items-center gap-4">
                        {/* Proportional bar */}
                        <div className="flex h-7 rounded-lg overflow-hidden flex-1">
                            {split.map((seg, i) => (
                                <div
                                    key={i}
                                    className="h-full flex items-center justify-center"
                                    style={{ width: `${seg.value}%`, backgroundColor: seg.color }}
                                >
                                    <span className="text-[11px] font-bold text-white drop-shadow-sm">
                                        {seg.value}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-5 px-4 pb-3.5 -mt-1">
                        {split.map((seg, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                                <span className="text-[12px] font-medium" style={{ color: theme.colors.textSecondary }}>
                                    {seg.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

            </div>
        </div>
    );
};
