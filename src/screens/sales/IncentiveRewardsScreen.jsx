import { useMemo, useState } from 'react';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect';
import { formatCurrency } from '../../utils/format.js';
import { INCENTIVE_REWARDS_DATA } from './data.js';

const parseQuarterKey = (key = '') => {
    const match = key.match(/^(\d{4})-Q(\d)$/);
    if (!match) return { year: 0, quarter: 0 };
    return { year: Number(match[1]), quarter: Number(match[2]) };
};

const buildTimePeriods = (rewardData) => {
    const quarterKeys = Object.keys(rewardData || {}).filter((key) => /^\d{4}-Q\d$/.test(key));
    const years = [...new Set(quarterKeys.map((key) => parseQuarterKey(key).year))].sort((a, b) => b - a);
    return years.flatMap((year) => {
        const quarters = quarterKeys
            .filter((key) => parseQuarterKey(key).year === year)
            .sort((a, b) => parseQuarterKey(b).quarter - parseQuarterKey(a).quarter)
            .map((key) => ({ value: key, label: `Q${parseQuarterKey(key).quarter} ${year}` }));
        return [...quarters, { value: String(year), label: `${year} Annual` }];
    });
};

const aggregate = (data, year) => {
    const salesMap = new Map();
    const designersMap = new Map();
    Object.entries(data)
        .filter(([key]) => key.startsWith(`${year}-Q`))
        .forEach(([, d]) => {
            d.sales?.forEach((p) => salesMap.set(p.name, (salesMap.get(p.name) || 0) + p.amount));
            d.designers?.forEach((p) => designersMap.set(p.name, (designersMap.get(p.name) || 0) + p.amount));
        });
    const sales = [];
    const designers = [];
    salesMap.forEach((amount, name) => sales.push({ name, amount }));
    designersMap.forEach((amount, name) => designers.push({ name, amount }));
    return { sales, designers };
};

const Row = ({ rank, name, amount, theme }) => (
    <div className="flex items-center justify-between py-2">
        <div className="min-w-0 flex items-center gap-2.5">
            <span
                className="w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0"
                style={{ color: theme.colors.textSecondary, backgroundColor: theme.colors.border }}
            >
                {rank}
            </span>
            <span className="text-sm font-medium truncate" style={{ color: theme.colors.textPrimary }}>{name}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums ml-3" style={{ color: theme.colors.textPrimary }}>
            {formatCurrency(amount)}
        </span>
    </div>
);

const Leaderboard = ({ title, people, emptyLabel, theme }) => {
    const isDark = theme?.name === 'dark';
    const bdr = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
    return (
        <div className="rounded-[22px] overflow-hidden p-5" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.07em] opacity-55 mb-1" style={{ color: theme.colors.textSecondary }}>{title}</p>
            {people.length > 0 ? (
                <div className="divide-y" style={{ borderColor: bdr }}>
                    {people.map((p, i) => <Row key={p.name} rank={i + 1} name={p.name} amount={p.amount} theme={theme} />)}
                </div>
            ) : (
                <p className="text-sm py-3" style={{ color: theme.colors.textSecondary }}>{emptyLabel}</p>
            )}
        </div>
    );
};

export const IncentiveRewardsScreen = ({ theme }) => {
    const timePeriods = useMemo(() => buildTimePeriods(INCENTIVE_REWARDS_DATA), []);
    const [selectedPeriod, setSelectedPeriod] = useState(timePeriods[0]?.value || '');

    const rewardsData = useMemo(() => {
        if (!selectedPeriod) return { sales: [], designers: [] };
        if (!selectedPeriod.includes('Q')) return aggregate(INCENTIVE_REWARDS_DATA, selectedPeriod);
        return INCENTIVE_REWARDS_DATA[selectedPeriod] || { sales: [], designers: [] };
    }, [selectedPeriod]);

    const sortedSales = useMemo(() => [...(rewardsData.sales || [])].sort((a, b) => b.amount - a.amount), [rewardsData.sales]);
    const sortedDesigners = useMemo(() => [...(rewardsData.designers || [])].sort((a, b) => b.amount - a.amount), [rewardsData.designers]);

    return (
        <div className="min-h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-6 max-w-4xl mx-auto w-full space-y-4">
                <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>Dealer Rewards</p>
                    <div className="w-40">
                        <PortalNativeSelect
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            options={timePeriods}
                            theme={theme}
                            size="sm"
                            align="right"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Leaderboard title="Sales" people={sortedSales} emptyLabel="No sales rewards this period." theme={theme} />
                    <Leaderboard title="Design" people={sortedDesigners} emptyLabel="No design rewards this period." theme={theme} />
                </div>
            </div>
        </div>
    );
};
