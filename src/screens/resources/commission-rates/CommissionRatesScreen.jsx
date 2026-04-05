import React from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { InfoTooltip } from '../../../components/common/InfoTooltip.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import * as Data from './data.js';

const CONTRACT_NAMES = new Set(['GSA', 'Omnia', 'Premier', 'TIPS']);

const standardRates = Data.COMMISSION_RATES_DATA.standard.filter(r => !CONTRACT_NAMES.has(r.discount));
const contractRates = Data.COMMISSION_RATES_DATA.standard.filter(r => CONTRACT_NAMES.has(r.discount));

/* ── Column header row inside a card ─────────────────────────── */
const CardHeader = ({ title, extra, theme, dark }) => (
    <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}` }}
    >
        <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold uppercase tracking-[0.07em]"
                style={{ color: theme.colors.textSecondary, opacity: 0.65 }}>
                {title}
            </span>
            {extra}
        </div>
        <div className="flex items-center gap-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] min-w-[48px] text-right"
                style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
                Rep
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] min-w-[40px] text-right"
                style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
                Spiff
            </span>
        </div>
    </div>
);

/* ── Individual rate row ─────────────────────────────────────── */
const RateRow = ({ rate, theme, dark, isLast }) => (
    <div
        className="flex items-center justify-between px-5"
        style={{
            paddingTop: 13,
            paddingBottom: 13,
            borderBottom: isLast ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.045)'}`,
        }}
    >
        <span className="text-[15px] font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>
            {rate.discount}
        </span>
        <div className="flex items-center gap-6">
            <span className="text-[15px] font-bold tabular-nums min-w-[48px] text-right"
                style={{ color: theme.colors.accent }}>
                {rate.rep}
            </span>
            <span className="text-[14px] tabular-nums min-w-[40px] text-right font-medium"
                style={{
                    color: rate.spiff === 'N/A' ? theme.colors.textSecondary : theme.colors.textPrimary,
                    opacity: rate.spiff === 'N/A' ? 0.35 : 0.6,
                }}>
                {rate.spiff}
            </span>
        </div>
    </div>
);

/* ── Main screen ─────────────────────────────────────────────── */
export const CommissionRatesScreen = ({ theme }) => {
    const dark = isDarkTheme(theme);
    const split = Data.COMMISSION_RATES_DATA.split;
    const subtleBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-4">

                {/* ── Page title ── */}
                <div className="pt-5 pb-1 px-1">
                    <h1 className="text-[22px] font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>
                        Commission Rates
                    </h1>
                    <p className="text-[14px] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                        Current rep rates and spiff structure.
                    </p>
                </div>

                {/* ── Standard Discounts ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                    <CardHeader title="Standard Discounts" theme={theme} dark={dark} />
                    {standardRates.map((rate, i) => (
                        <RateRow
                            key={rate.discount}
                            rate={rate}
                            theme={theme}
                            dark={dark}
                            isLast={i === standardRates.length - 1}
                        />
                    ))}
                </GlassCard>

                {/* ── Contract Pricing ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                    <CardHeader title="Contract Pricing" theme={theme} dark={dark} />
                    {contractRates.map((rate, i) => (
                        <RateRow
                            key={rate.discount}
                            rate={rate}
                            theme={theme}
                            dark={dark}
                            isLast={i === contractRates.length - 1}
                        />
                    ))}
                </GlassCard>

                {/* ── Commission Split ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5"
                        style={{ borderBottom: `1px solid ${subtleBorder}` }}>
                        <span className="text-[13px] font-bold uppercase tracking-[0.07em]"
                            style={{ color: theme.colors.textSecondary, opacity: 0.65 }}>
                            Commission Split
                        </span>
                        <InfoTooltip
                            theme={theme}
                            size="sm"
                            position="left"
                            content="When two reps are involved in a sale, the specifying rep (who spec'd the product) receives 70% of the commission and the ordering rep (who placed the order) receives 30%."
                        />
                    </div>

                    {/* Bar */}
                    <div className="px-5 pt-4 pb-2">
                        <div className="flex h-11 rounded-2xl overflow-hidden">
                            {split.map((seg, i) => (
                                <div
                                    key={i}
                                    className="h-full flex items-center justify-center"
                                    style={{ width: `${seg.value}%`, backgroundColor: seg.color }}
                                >
                                    <span className="text-[13px] font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
                                        {seg.value}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 px-5 pb-4 pt-2">
                        {split.map((seg, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                                <div>
                                    <span className="text-[14px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                                        {seg.value}%
                                    </span>
                                    <span className="text-[13px] font-medium ml-1.5" style={{ color: theme.colors.textSecondary }}>
                                        {seg.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

            </div>
        </div>
    );
};
