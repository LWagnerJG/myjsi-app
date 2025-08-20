import React from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import * as Data from './data.js';

export const CommissionRatesScreen = ({ theme }) => {
    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-6 mt-6">
                <GlassCard theme={theme} className="p-6 rounded-2xl shadow-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ color: theme.colors.textSecondary }}>
                                <th className="py-2 px-4 text-base font-bold border-b" style={{ borderColor: theme.colors.border }}>Discounts</th>
                                <th className="py-2 px-4 text-base font-bold border-b" style={{ borderColor: theme.colors.border }}>Rep Comm.</th>
                                <th className="py-2 px-4 text-base font-bold border-b" style={{ borderColor: theme.colors.border }}>Spiff</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Data.COMMISSION_RATES_DATA.standard.map((rate, index) => (
                                <tr key={index} style={{ color: theme.colors.textPrimary }}>
                                    <td className="py-3 px-4 text-sm border-b" style={{ borderColor: theme.colors.border }}>{rate.discount}</td>
                                    <td className="py-3 px-4 text-sm border-b" style={{ borderColor: theme.colors.border }}>{rate.rep}</td>
                                    <td className="py-3 px-4 text-sm border-b" style={{ borderColor: theme.colors.border }}>{rate.spiff}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>

                <GlassCard theme={theme} className="p-6 mt-6 rounded-2xl shadow-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ color: theme.colors.textSecondary }}>
                                <th className="py-2 px-4 text-base font-bold border-b" style={{ borderColor: theme.colors.border }}>Commission Split</th>
                                <th className="py-2 px-4 text-base font-bold border-b" style={{ borderColor: theme.colors.border }}>Territory</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Data.COMMISSION_RATES_DATA.split.map((split, index) => (
                                <tr key={index} style={{ color: theme.colors.textPrimary }}>
                                    <td className="py-3 px-4 text-sm border-b" style={{ borderColor: theme.colors.border }}>{split.value}%</td>
                                    <td className="py-3 px-4 text-sm border-b" style={{ borderColor: theme.colors.border }}>{split.label}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>
            </div>
        </div>
    );
};
