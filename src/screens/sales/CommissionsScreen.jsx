import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle';
import { GlassCard } from '../../components/common/GlassCard';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect';
import { ChevronDown, DollarSign } from 'lucide-react';
import * as Data from '../../data';

export const CommissionsScreen = ({ theme }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [expandedMonth, setExpandedMonth] = useState(null);

    // Generate sample commission data for demonstration (moved inside component)
    const generateSampleCommissionData = () => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June'];
        return months.map((month, index) => ({
            month,
            amount: 2500 + (index * 300) + Math.random() * 1000,
            issuedDate: new Date(selectedYear, index, 15).toISOString(),
            details: [
                {
                    invoices: [
                        {
                            so: `SO-${selectedYear}${(index + 1).toString().padStart(2, '0')}001`,
                            project: `Project ${String.fromCharCode(65 + index)}`,
                            netAmount: 15000 + Math.random() * 10000,
                            commission: 750 + Math.random() * 500,
                        },
                        {
                            so: `SO-${selectedYear}${(index + 1).toString().padStart(2, '0')}002`,
                            project: `Project ${String.fromCharCode(66 + index)}`,
                            netAmount: 12000 + Math.random() * 8000,
                            commission: 600 + Math.random() * 400,
                        }
                    ]
                },
                {
                    brandTotal: true,
                    listTotal: 27000 + Math.random() * 18000,
                    netTotal: 24000 + Math.random() * 15000,
                    commissionTotal: 1350 + Math.random() * 900,
                }
            ]
        }));
    };

    // Generate years or use existing commission data years
    const years = useMemo(() => {
        if (Data.COMMISSIONS_DATA) {
            return Object.keys(Data.COMMISSIONS_DATA).sort((a, b) => b - a);
        }
        // Fallback to generate recent years
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 3 }, (_, i) => (currentYear - i).toString());
    }, []);

    // Get monthly data for selected year
    const monthlyData = useMemo(() => {
        if (Data.COMMISSIONS_DATA && Data.COMMISSIONS_DATA[selectedYear]) {
            return Data.COMMISSIONS_DATA[selectedYear];
        }
        // Generate sample data if none exists
        return generateSampleCommissionData();
    }, [selectedYear]);

    const toggleMonth = useCallback((month) => {
        setExpandedMonth(prev => prev === month ? null : month);
    }, []);

    // Calculate yearly total
    const yearlyTotal = useMemo(() => {
        return monthlyData.reduce((sum, check) => sum + check.amount, 0);
    }, [monthlyData]);

    return (
        <div className="h-full flex flex-col">
            <div className="px-4 pb-4">
                <PageTitle title="Commissions" theme={theme}>
                    <div className="w-32">
                        <PortalNativeSelect
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            options={years.map(y => ({ value: y, label: y }))}
                            theme={theme}
                            placeholder="Select Year"
                        />
                    </div>
                </PageTitle>
                
                {/* Yearly Summary Card */}
                <GlassCard theme={theme} className="p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                                {selectedYear} Total Commissions
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                {monthlyData.length} commission{monthlyData.length !== 1 ? 's' : ''} received
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
                                ${yearlyTotal.toLocaleString()}
                            </div>
                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Total Earned
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-4 space-y-3">
                    {monthlyData.map((check, index) => (
                        <GlassCard
                            key={check.month}
                            theme={theme}
                            className="overflow-hidden"
                        >
                            <div
                                onClick={() => toggleMonth(check.month)}
                                className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                            {check.month}
                                        </div>
                                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                            Paid: {new Date(check.issuedDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                            <div className="font-bold text-lg" style={{ color: theme.colors.accent }}>
                                                ${check.amount.toLocaleString()}
                                            </div>
                                        </div>
                                        <ChevronDown 
                                            className={`w-5 h-5 transition-transform duration-200 ${
                                                expandedMonth === check.month ? 'rotate-180' : ''
                                            }`} 
                                            style={{ color: theme.colors.textSecondary }} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {expandedMonth === check.month && check.details && (
                                <div className="border-t" style={{ borderColor: theme.colors.border }}>
                                    {check.details.map((detail, dIndex) => {
                                        if (detail.invoices) {
                                            const totalCommission = detail.invoices.reduce((sum, inv) => sum + inv.commission, 0);
                                            const totalNetAmount = detail.invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
                                            const avgRate = totalNetAmount > 0 ? ((totalCommission / totalNetAmount) * 100).toFixed(1) : '0.0';

                                            return (
                                                <div key={dIndex} className="p-4 space-y-3">
                                                    {/* Table Header */}
                                                    <div 
                                                        className="grid grid-cols-[2fr,1fr,1fr,0.8fr] gap-x-3 py-2 px-3 text-xs font-semibold rounded-lg" 
                                                        style={{ 
                                                            backgroundColor: theme.colors.subtle,
                                                            color: theme.colors.textSecondary 
                                                        }}
                                                    >
                                                        <div>SO # / Project</div>
                                                        <div className="text-right">Net Amount</div>
                                                        <div className="text-right">Commission</div>
                                                        <div className="text-right">Rate</div>
                                                    </div>
                                                    
                                                    {/* Invoice Rows */}
                                                    <div className="space-y-2">
                                                        {detail.invoices.map((inv, iIndex) => {
                                                            const commissionRate = inv.netAmount ? ((inv.commission / inv.netAmount) * 100).toFixed(1) : '0.0';
                                                            return (
                                                                <div
                                                                    key={iIndex}
                                                                    className="grid grid-cols-[2fr,1fr,1fr,0.8fr] gap-x-3 py-3 px-3 text-sm rounded-lg transition-colors"
                                                                    style={{
                                                                        backgroundColor: iIndex % 2 === 0 ? 'transparent' : theme.colors.subtle + '30'
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <div className="font-semibold break-words" style={{ color: theme.colors.textPrimary }}>
                                                                            {inv.so || inv.invoice}
                                                                        </div>
                                                                        {inv.project && (
                                                                            <div className="text-xs mt-1 break-words" style={{ color: theme.colors.textSecondary }}>
                                                                                {inv.project}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right font-medium" style={{ color: theme.colors.textPrimary }}>
                                                                        ${inv.netAmount.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-right font-bold" style={{ color: theme.colors.accent }}>
                                                                        ${inv.commission.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-right font-medium" style={{ color: theme.colors.textPrimary }}>
                                                                        {commissionRate}%
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    {/* Average Rate Summary */}
                                                    <div className="border-t pt-3 mt-3" style={{ borderColor: theme.colors.border }}>
                                                        <div className="flex justify-end">
                                                            <div className="text-sm">
                                                                <span style={{ color: theme.colors.textSecondary }}>Average Rate: </span>
                                                                <span className="font-bold" style={{ color: theme.colors.accent }}>
                                                                    {avgRate}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } else if (detail.brandTotal) {
                                            return (
                                                <div key={dIndex} className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
                                                    <h4 className="font-bold text-lg mb-4 flex items-center" style={{ color: theme.colors.textPrimary }}>
                                                        <DollarSign className="w-5 h-5 mr-2" style={{ color: theme.colors.accent }} />
                                                        Month Summary
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: theme.colors.subtle + '50' }}>
                                                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                                                Invoiced Total
                                                            </div>
                                                            <div className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                                                                ${detail.listTotal.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: theme.colors.subtle + '50' }}>
                                                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                                                Commission Base
                                                            </div>
                                                            <div className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                                                                ${detail.netTotal.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: theme.colors.accent + '20' }}>
                                                            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                                                Commission Earned
                                                            </div>
                                                            <div className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                                                                ${detail.commissionTotal.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                        </GlassCard>
                    ))}
                    
                    {monthlyData.length === 0 && (
                        <div className="text-center py-12">
                            <DollarSign className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
                            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                                No Commission Data
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                No commission records found for {selectedYear}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};