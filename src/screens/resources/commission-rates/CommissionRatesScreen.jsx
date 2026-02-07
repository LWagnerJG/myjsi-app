import React from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import * as Data from './data.js';

export const CommissionRatesScreen = ({ theme }) => {
    const dark = isDarkTheme(theme);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6">

                {/* ── Rates Table ── */}
                <GlassCard theme={theme} className="rounded-[24px] overflow-hidden mt-2">
                    <div className="px-5 pt-5 pb-1">
                        <h2 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>
                            Discount Schedule
                        </h2>
                    </div>

                    <div className="px-3 pb-4 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    {['Discounts', 'Rep Comm.', 'Spiff'].map((h) => (
                                        <th
                                            key={h}
                                            className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider"
                                            style={{ color: theme.colors.textSecondary, borderBottom: `1.5px solid ${theme.colors.border}` }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Data.COMMISSION_RATES_DATA.standard.map((rate, i) => {
                                    const isContract = ['GSA', 'Omnia', 'Premier', 'TIPS'].includes(rate.discount);
                                    return (
                                        <tr
                                            key={rate.discount}
                                            style={{
                                                backgroundColor: i % 2 === 1
                                                    ? (dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.018)')
                                                    : 'transparent',
                                            }}
                                        >
                                            <td
                                                className="py-3 px-3 text-sm font-semibold"
                                                style={{ color: theme.colors.textPrimary, borderBottom: `1px solid ${theme.colors.border}20` }}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {rate.discount}
                                                    {isContract && (
                                                        <span
                                                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                                            style={{ backgroundColor: `${theme.colors.info}14`, color: theme.colors.info }}
                                                        >
                                                            Contract
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td
                                                className="py-3 px-3 text-sm font-bold tabular-nums"
                                                style={{ color: theme.colors.textPrimary, borderBottom: `1px solid ${theme.colors.border}20` }}
                                            >
                                                {rate.rep}
                                            </td>
                                            <td
                                                className="py-3 px-3 text-sm tabular-nums"
                                                style={{
                                                    color: rate.spiff === 'N/A' ? theme.colors.textSecondary : theme.colors.textPrimary,
                                                    borderBottom: `1px solid ${theme.colors.border}20`,
                                                }}
                                            >
                                                {rate.spiff}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                {/* ── Commission Split ── */}
                <GlassCard theme={theme} className="rounded-[24px] overflow-hidden mt-5">
                    <div className="px-5 pt-5 pb-1">
                        <h2 className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>
                            Commission Split
                        </h2>
                    </div>

                    <div className="px-5 pt-3 pb-5">
                        {/* Visual split bar */}
                        <div className="h-11 rounded-full overflow-hidden flex" style={{ border: `1px solid ${theme.colors.border}` }}>
                            {Data.COMMISSION_RATES_DATA.split.map((seg, i) => (
                                <div
                                    key={i}
                                    className="h-full flex items-center justify-center"
                                    style={{ width: `${seg.value}%`, backgroundColor: seg.color }}
                                >
                                    <span className="text-sm font-bold text-white drop-shadow-sm">
                                        {seg.value}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-3">
                            {Data.COMMISSION_RATES_DATA.split.map((seg, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                                    <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                                        {seg.label}
                                    </span>
                                    <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                        ({seg.value}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

            </div>
        </div>
    );
};
