import React, { useState, useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';

export const CommissionRatesScreen = ({ theme }) => {
    const [rates, setRates] = useState({ standard: [], contract: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const powerAutomateURL = import.meta.env.VITE_COMMISSION_RATES_URL;
                if (!powerAutomateURL) {
                    throw new Error("Flow URL is not configured.");
                }
                const response = await fetch(powerAutomateURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const standard = data.filter(d => d.category === 'Standard');
                const contract = data.filter(d => d.category === 'Contract');
                setRates({ standard, contract });
            } catch (e) {
                console.error("Failed to fetch commission rates:", e);
                setError("Could not load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchRates();
    }, []);

    const { accent, textPrimary, textSecondary, border, subtle, secondary } = theme.colors;

    const CommissionSplitDonut = ({ data, theme }) => {
        const total = data.reduce((acc, item) => acc + item.value, 0);
        if (total === 0) return null;

        let cumulative = 0;
        const size = 150;
        const strokeWidth = 20;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;

        return (
            <div className="flex items-center space-x-6">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={theme.colors.subtle}
                            strokeWidth={strokeWidth}
                        />
                        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                            {data.map((item, index) => {
                                const dasharray = (circumference * item.value) / total;
                                const dashoffset = circumference * (1 - (cumulative / total));
                                cumulative += item.value;
                                return (
                                    <circle
                                        key={index}
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke={item.color}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={`${dasharray} ${circumference}`}
                                        strokeDashoffset={-circumference + dashoffset}
                                        className="transition-all duration-500"
                                    />
                                );
                            })}
                        </g>
                    </svg>
                </div>
                <div className="space-y-2">
                    {data.map(item => (
                        <div key={item.label} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <div>
                                <p
                                    className="text-sm font-semibold"
                                    style={{ color: theme.colors.textPrimary }}
                                >
                                    {item.label}
                                </p>
                                <p
                                    className="text-sm font-normal"
                                    style={{ color: theme.colors.textSecondary }}
                                >
                                    {item.value}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const commissionSplitData = [
        { label: 'Specifying', value: 70, color: accent },
        { label: 'Ordering', value: 30, color: secondary }
    ];

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <div className="text-center p-8">
                    <Hourglass
                        className="w-8 h-8 animate-spin mx-auto"
                        style={{ color: accent }}
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full py-6 px-4">
                <GlassCard theme={theme} className="p-8 text-center">
                    <p className="font-semibold text-red-500">{error}</p>
                </GlassCard>
            </div>
        );
    }

    const RateRow = ({ item }) => {
        const hasNote = item.spiff?.includes('*');
        const spiffValue = hasNote ? item.spiff.split('*')[0].trim() : item.spiff;
        const spiffNote = hasNote ? `*${item.spiff.split('*')[1]}` : null;

        return (
            <div className="grid grid-cols-[2fr,1.5fr,1.5fr] items-center gap-x-4 py-3 px-3">
                <span className="font-semibold" style={{ color: textPrimary }}>
                    {item.discount}
                </span>
                <span className="text-center font-bold whitespace-nowrap" style={{ color: accent }}>
                    {item.rep}
                </span>
                <div className="text-center">
                    <span className="font-semibold" style={{ color: textPrimary }}>
                        {spiffValue}
                    </span>
                    {spiffNote && (
                        <p className="text-xs -mt-1" style={{ color: textSecondary }}>
                            {spiffNote}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const SectionHeader = ({ title }) => (
        <div className="px-3 pt-6 pb-2">
            <h3 className="font-bold text-lg" style={{ color: textPrimary }}>
                {title}
            </h3>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
                <GlassCard theme={theme} className="p-4">
                    <div className="grid grid-cols-[2fr,1.5fr,1.5fr] gap-x-4 px-3 pb-3 mb-2 border-b" style={{ borderColor: subtle }}>
                        <span className="text-sm font-semibold" style={{ color: textPrimary }}>Discounts</span>
                        <span className="text-sm font-semibold text-center" style={{ color: textPrimary }}>Rep Comm.</span>
                        <span className="text-sm font-semibold text-center" style={{ color: textPrimary }}>Spiff</span>
                    </div>

                    <div>
                        {rates.standard.map((r, index) => (
                            <div key={r.discount} className={index > 0 ? 'border-t' : ''} style={{ borderColor: subtle }}>
                                <RateRow item={r} />
                            </div>
                        ))}
                        {rates.contract.length > 0 && (
                            <>
                                <SectionHeader title="Contract Discounts" />
                                {rates.contract.map((r, index) => (
                                    <div key={r.discount} className={index > 0 ? 'border-t' : ''} style={{ borderColor: subtle }}>
                                        <RateRow item={r} />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-4">
                    <h3 className="font-bold text-xl mb-4 text-center" style={{ color: textPrimary }}>
                        Commission Split
                    </h3>
                    <div className="flex justify-center">
                        <CommissionSplitDonut data={commissionSplitData} theme={theme} />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
