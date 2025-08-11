import React, { useMemo, useState, useCallback } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PortalNativeSelect } from '../../../components/forms/PortalNativeSelect.jsx';
import { ChevronDown, DollarSign, CalendarDays } from 'lucide-react';
import * as Data from '../../../data';

export const CommissionRatesScreen = ({ theme }) => {
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [expanded, setExpanded] = useState(null);

    const fmtMoney = useCallback(
        (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        []
    );

    const months = useMemo(
        () => [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],
        []
    );

    const yearOptions = useMemo(() => {
        const now = new Date().getFullYear();
        const base = [now, now - 1, now - 2].map(String);
        const dataYears = Object.keys(Data?.COMMISSIONS_DATA || {});
        const union = Array.from(new Set([...base, ...dataYears])).sort((a, b) => Number(b) - Number(a));
        return union.slice(0, 3).map((y) => ({ value: y, label: y }));
    }, []);

    const seeded = (seed) => {
        let t = Math.sin(seed) * 10000;
        return t - Math.floor(t);
    };

    const sampleForYear = (year) =>
        months.map((m, i) => {
            const inv1Net = 12000 + Math.round(seeded(Number(year) * (i + 7)) * 15000);
            const inv2Net = 9000 + Math.round(seeded(Number(year) * (i + 11)) * 12000);
            const inv1Comm = Math.round(inv1Net * (0.04 + seeded(Number(year) * (i + 13)) * 0.02));
            const inv2Comm = Math.round(inv2Net * (0.04 + seeded(Number(year) * (i + 17)) * 0.02));
            const issued = new Date(Number(year), i, 15).toISOString();
            return {
                id: `${year}-${String(i + 1).padStart(2, '0')}`,
                month: m,
                amount: inv1Comm + inv2Comm + 1200,
                issuedDate: issued,
                details: [
                    {
                        invoices: [
                            {
                                so: `SO-${year}${String(i + 1).padStart(2, '0')}01`,
                                project: `Project ${String.fromCharCode(65 + i)}`,
                                netAmount: inv1Net,
                                commission: inv1Comm
                            },
                            {
                                so: `SO-${year}${String(i + 1).padStart(2, '0')}02`,
                                project: `Project ${String.fromCharCode(66 + i)}`,
                                netAmount: inv2Net,
                                commission: inv2Comm
                            }
                        ]
                    },
                    {
                        brandTotal: true,
                        listTotal: inv1Net + inv2Net + Math.round(seeded(i + 31) * 5000),
                        netTotal: inv1Net + inv2Net,
                        commissionTotal: inv1Comm + inv2Comm
                    }
                ]
            };
        });

    const monthlyData = useMemo(() => {
        if (Data?.COMMISSIONS_DATA?.[selectedYear]) return Data.COMMISSIONS_DATA[selectedYear];
        return sampleForYear(selectedYear);
    }, [selectedYear]);

    const yearlyTotal = useMemo(
        () => monthlyData.reduce((s, m) => s + (m.amount || 0), 0),
        [monthlyData]
    );

    const toggle = (id) => setExpanded((p) => (p === id ? null : id));

    return (
        <div className="h-full flex flex-col">
            <div className="px-4 pb-3">
                <PageTitle title="Commissions" theme={theme}>
                    <div className="w-36">
                        <PortalNativeSelect
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            options={yearOptions}
                            theme={theme}
                            placeholder="Select Year"
                        />
                    </div>
                </PageTitle>

                <GlassCard theme={theme} className="p-4 mt-2 rounded-[24px]">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div
                                className="text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: theme.colors.subtle,
                                    color: theme.colors.textSecondary,
                                    border: `1px solid ${theme.colors.border}`
                                }}
                            >
                                <CalendarDays className="w-3.5 h-3.5" /> {selectedYear}
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                Total Commissions
                            </h3>
                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                {monthlyData.filter((m) => m.amount > 0).length} payments received
                            </div>
                        </div>
                        <div className="text-right">
                            <div
                                className="text-3xl font-extrabold tracking-tight"
                                style={{ color: theme.colors.accent }}
                            >
                                {fmtMoney(yearlyTotal)}
                            </div>
                            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                Total Earned
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-6 space-y-3">
                    {monthlyData.map((check) => {
                        const isOpen = expanded === check.id;
                        const paidDate = new Date(check.issuedDate);
                        return (
                            <GlassCard
                                key={check.id}
                                theme={theme}
                                className={`rounded-[20px] overflow-hidden transition-all`}
                            >
                                <button
                                    onClick={() => toggle(check.id)}
                                    className="w-full text-left p-4 flex items-center justify-between gap-3"
                                    aria-expanded={isOpen}
                                    aria-controls={`m-${check.id}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="text-base font-bold truncate"
                                                style={{ color: theme.colors.textPrimary }}
                                            >
                                                {check.month}
                                            </div>
                                            <span
                                                className="text-[11px] px-2 py-0.5 rounded-full"
                                                style={{
                                                    backgroundColor: theme.colors.subtle,
                                                    color: theme.colors.textSecondary,
                                                    border: `1px solid ${theme.colors.border}`
                                                }}
                                            >
                                                Paid {paidDate.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="text-lg font-bold tabular-nums"
                                            style={{ color: theme.colors.accent }}
                                        >
                                            {fmtMoney(check.amount)}
                                        </div>
                                        <ChevronDown
                                            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            style={{ color: theme.colors.textSecondary }}
                                        />
                                    </div>
                                </button>

                                <div
                                    id={`m-${check.id}`}
                                    className={`transition-[max-height,opacity] duration-300 ease-out overflow-hidden ${isOpen ? 'opacity-100 max-h-[1400px]' : 'opacity-0 max-h-0'
                                        }`}
                                >
                                    <div className="px-4 pb-5">
                                        <div
                                            className="grid grid-cols-[2fr,1fr,1fr,0.8fr] gap-x-3 py-2 px-3 mb-2 rounded-xl"
                                            style={{
                                                backgroundColor: theme.colors.subtle,
                                                color: theme.colors.textSecondary,
                                                border: `1px solid ${theme.colors.border}`
                                            }}
                                        >
                                            <div className="text-xs font-semibold">SO # / Project</div>
                                            <div className="text-xs font-semibold text-right">Net Amount</div>
                                            <div className="text-xs font-semibold text-right">Commission</div>
                                            <div className="text-xs font-semibold text-right">Rate</div>
                                        </div>

                                        {check.details?.[0]?.invoices?.map((inv, ii) => {
                                            const rate = inv.netAmount
                                                ? ((inv.commission / inv.netAmount) * 100).toFixed(1)
                                                : '0.0';
                                            return (
                                                <div
                                                    key={ii}
                                                    className="mb-2 rounded-2xl px-3 py-3"
                                                    style={{
                                                        backgroundColor: theme.colors.surface,
                                                        border: `1px solid ${theme.colors.border}`,
                                                        boxShadow: `0 6px 24px ${theme.colors.shadow}`
                                                    }}
                                                >
                                                    <div className="grid grid-cols-[2fr,1fr,1fr,0.8fr] gap-x-3 items-center">
                                                        <div className="min-w-0">
                                                            <div
                                                                className="font-semibold truncate"
                                                                style={{ color: theme.colors.textPrimary }}
                                                            >
                                                                {inv.so}
                                                            </div>
                                                            {inv.project && (
                                                                <div
                                                                    className="text-xs truncate mt-0.5"
                                                                    style={{ color: theme.colors.textSecondary }}
                                                                >
                                                                    {inv.project}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="text-right font-medium tabular-nums"
                                                            style={{ color: theme.colors.textPrimary }}
                                                        >
                                                            {fmtMoney(inv.netAmount)}
                                                        </div>
                                                        <div
                                                            className="text-right font-extrabold tabular-nums"
                                                            style={{ color: theme.colors.accent }}
                                                        >
                                                            {fmtMoney(inv.commission)}
                                                        </div>
                                                        <div
                                                            className="text-right font-medium"
                                                            style={{ color: theme.colors.textPrimary }}
                                                        >
                                                            {rate}%
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {(() => {
                                            const invoices = check.details?.[0]?.invoices || [];
                                            const totalCommission = invoices.reduce((s, i) => s + (i.commission || 0), 0);
                                            const totalNet = invoices.reduce((s, i) => s + (i.netAmount || 0), 0);
                                            const avgRate = totalNet ? ((totalCommission / totalNet) * 100).toFixed(1) : '0.0';
                                            return (
                                                <div className="flex items-center justify-center my-3">
                                                    <div
                                                        className="text-xs mr-2"
                                                        style={{ color: theme.colors.textSecondary }}
                                                    >
                                                        Average Rate
                                                    </div>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-sm font-bold"
                                                        style={{
                                                            color: theme.colors.accent,
                                                            backgroundColor: `${theme.colors.accent}20`
                                                        }}
                                                    >
                                                        {avgRate}%
                                                    </span>
                                                </div>
                                            );
                                        })()}

                                        {check.details
                                            ?.filter((d) => d.brandTotal)
                                            .map((sum, idx) => (
                                                <div key={idx} className="space-y-3 mt-1">
                                                    <div
                                                        className="rounded-2xl px-4 py-3 text-center"
                                                        style={{
                                                            backgroundColor: theme.colors.surface,
                                                            border: `1px solid ${theme.colors.border}`
                                                        }}
                                                    >
                                                        <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                            Invoiced Total
                                                        </div>
                                                        <div
                                                            className="text-xl font-black"
                                                            style={{ color: theme.colors.textPrimary }}
                                                        >
                                                            {fmtMoney(sum.listTotal)}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="rounded-2xl px-4 py-3 text-center"
                                                        style={{
                                                            backgroundColor: theme.colors.surface,
                                                            border: `1px solid ${theme.colors.border}`
                                                        }}
                                                    >
                                                        <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                            Commission Base
                                                        </div>
                                                        <div
                                                            className="text-xl font-black"
                                                            style={{ color: theme.colors.textPrimary }}
                                                        >
                                                            {fmtMoney(sum.netTotal)}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="rounded-2xl px-4 py-4 text-center"
                                                        style={{
                                                            backgroundColor: `${theme.colors.accent}15`,
                                                            border: `1px solid ${theme.colors.border}`
                                                        }}
                                                    >
                                                        <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                                            Commission Earned
                                                        </div>
                                                        <div
                                                            className="text-2xl font-extrabold"
                                                            style={{ color: theme.colors.accent }}
                                                        >
                                                            {fmtMoney(sum.commissionTotal)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}

                    {monthlyData.length === 0 && (
                        <div className="text-center py-12">
                            <DollarSign
                                className="w-14 h-14 mx-auto mb-3"
                                style={{ color: theme.colors.textSecondary }}
                            />
                            <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                No Commission Data
                            </div>
                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                No commission records found for {selectedYear}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
