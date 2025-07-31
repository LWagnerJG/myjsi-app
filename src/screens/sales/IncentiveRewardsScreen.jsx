import React, { useMemo, useState, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle';
import { GlassCard } from '../../components/common/GlassCard';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect';
import { REWARDS_DATA } from '../../data.jsx';

export const IncentiveRewardsScreen = ({ theme }) => {
    const generateTimePeriods = useCallback(() => {
        const periods = [];
        const currentYear = new Date().getFullYear();

        for (let year = currentYear; year >= currentYear - 2; year--) { // Last 3 years
            periods.push({ value: `${year}`, label: `${year}` }); // Add full year
            for (let q = 4; q >= 1; q--) {
                // Only add future quarters for the current year if they are in the past
                if (year === currentYear && q > Math.floor(new Date().getMonth() / 3) + 1) {
                    continue;
                }
                periods.push({ value: `${year}-Q${q}`, label: `Q${q} ${year}` });
            }
        }
        return periods;
    }, []);

    const timePeriods = useMemo(generateTimePeriods, [generateTimePeriods]);
    const [selectedPeriod, setSelectedPeriod] = useState(timePeriods[0].value);

    const rewardsData = useMemo(() => {
        const isAnnual = !selectedPeriod.includes('Q');
        if (isAnnual) {
            const year = selectedPeriod;
            const cumulativeData = { sales: [], designers: [] };
            const salesMap = new Map();
            const designersMap = new Map();

            for (let q = 1; q <= 4; q++) {
                const periodKey = `${year}-Q${q}`;
                if (REWARDS_DATA[periodKey]) { // Fixed typo here
                    REWARDS_DATA[periodKey].sales.forEach(person => { // Fixed typo here
                        salesMap.set(person.name, (salesMap.get(person.name) || 0) + person.amount);
                    });
                    REWARDS_DATA[periodKey].designers.forEach(person => { // Fixed typo here
                        designersMap.set(person.name, (designersMap.get(person.name) || 0) + person.amount);
                    });
                }
            }

            salesMap.forEach((amount, name) => cumulativeData.sales.push({ name, amount }));
            designersMap.forEach((amount, name) => cumulativeData.designers.push({ name, amount }));

            return cumulativeData;
        }
        return REWARDS_DATA[selectedPeriod] || { sales: [], designers: [] }; // Fixed typo here
    }, [selectedPeriod]);

    const sortedSales = [...(rewardsData.sales || [])].sort((a, b) => b.amount - a.amount);
    const sortedDesigners = [...(rewardsData.designers || [])].sort((a, b) => b.amount - a.amount);

    return (
        <>
            <PageTitle title="Rewards" theme={theme}>
                <div className="w-36"> {/* Added a div to control dropdown width */}
                    <PortalNativeSelect
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                        options={timePeriods}
                        theme={theme}
                        placeholder="Select Period"
                    />
                </div>
            </PageTitle>
            <div className="px-4 space-y-4 pb-4">
                <GlassCard theme={theme} className="p-4">
                    <h3 className="font-bold text-xl mb-2" style={{ color: theme.colors.textPrimary }}>Sales</h3>
                    <div className="space-y-2">
                        {sortedSales.length > 0 ? sortedSales.map(person => (
                            <div key={person.name} className="flex justify-between items-center text-sm">
                                <span style={{ color: theme.colors.textPrimary }}>{person.name}</span>
                                <span className="font-semibold" style={{ color: theme.colors.accent }}>${person.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )) : <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No sales rewards for this period.</p>}
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-4">
                    <h3 className="font-bold text-xl mb-2" style={{ color: theme.colors.textPrimary }}>Designers</h3>
                    <div className="space-y-2">
                        {sortedDesigners.length > 0 ? sortedDesigners.map(person => (
                            <div key={person.name} className="flex justify-between items-center text-sm">
                                <span style={{ color: theme.colors.textPrimary }}>{person.name}</span>
                                <span className="font-semibold" style={{ color: theme.colors.accent }}>${person.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )) : <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No designer rewards for this period.</p>}
                    </div>
                </GlassCard>
            </div>
        </>
    );
};
