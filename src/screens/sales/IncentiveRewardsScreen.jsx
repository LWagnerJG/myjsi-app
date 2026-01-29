import { useMemo, useState, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect';
import { SegmentedToggle } from '../../components/common/GroupedToggle';
import { INCENTIVE_REWARDS_DATA } from './data.js';

const VIEW_FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'sales', label: 'Sales' },
    { value: 'designers', label: 'Designers' }
];

export const IncentiveRewardsScreen = ({ theme }) => {
    const generateTimePeriods = useCallback(() => {
        const periods = [];
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

        for (let year = currentYear; year >= currentYear - 2; year--) {
            const isCurrentYear = year === currentYear;
            const quartersInYear = isCurrentYear ? currentQuarter : 4;

            for (let q = quartersInYear; q >= 1; q--) {
                periods.push({ value: `${year}-Q${q}`, label: `Q${q} ${year}` });
            }
            periods.push({ value: `${year}`, label: `${year} Annual` });
        }
        return periods;
    }, []);

    const timePeriods = useMemo(generateTimePeriods, [generateTimePeriods]);
    const [selectedPeriod, setSelectedPeriod] = useState(timePeriods[0]?.value || new Date().getFullYear().toString());
    const [viewFilter, setViewFilter] = useState('all');

    const rewardsData = useMemo(() => {
        if (!selectedPeriod) return { sales: [], designers: [] };

        const isAnnual = !selectedPeriod.includes('Q');
        if (isAnnual) {
            const year = selectedPeriod;
            const salesMap = new Map();
            const designersMap = new Map();

            for (let q = 1; q <= 4; q++) {
                const periodKey = `${year}-Q${q}`;
                const periodData = INCENTIVE_REWARDS_DATA[periodKey];
                if (periodData) {
                    periodData.sales?.forEach(person => {
                        salesMap.set(person.name, (salesMap.get(person.name) || 0) + person.amount);
                    });
                    periodData.designers?.forEach(person => {
                        designersMap.set(person.name, (designersMap.get(person.name) || 0) + person.amount);
                    });
                }
            }
            const cumulativeData = { sales: [], designers: [] };
            salesMap.forEach((amount, name) => cumulativeData.sales.push({ name, amount }));
            designersMap.forEach((amount, name) => cumulativeData.designers.push({ name, amount }));
            return cumulativeData;
        }
        return INCENTIVE_REWARDS_DATA[selectedPeriod] || { sales: [], designers: [] };
    }, [selectedPeriod]);

    const sortedSales = useMemo(() => [...(rewardsData.sales || [])].sort((a, b) => b.amount - a.amount), [rewardsData.sales]);
    const sortedDesigners = useMemo(() => [...(rewardsData.designers || [])].sort((a, b) => b.amount - a.amount), [rewardsData.designers]);

    return (
        <>
            <div className="p-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4 max-w-5xl mx-auto w-full">
                <div className="w-40">
                    <PortalNativeSelect
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                        options={timePeriods}
                        theme={theme}
                    />
                </div>
                <div className="flex-1 max-w-xs">
                    <SegmentedToggle
                        value={viewFilter}
                        onChange={setViewFilter}
                        options={VIEW_FILTER_OPTIONS}
                        theme={theme}
                        size="sm"
                    />
                </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 space-y-4 pb-4 max-w-5xl mx-auto w-full">
                {(viewFilter === 'all' || viewFilter === 'sales') && (
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
                )}
                {(viewFilter === 'all' || viewFilter === 'designers') && (
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
                )}
            </div>
        </>
    );
};