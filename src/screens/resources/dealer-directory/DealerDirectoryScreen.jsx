import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { Filter, Plus, ChevronRight, MapPin, TrendingUp, Building2, DollarSign } from 'lucide-react';
import { DEALER_DIRECTORY_DATA } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';

/* ── Format currency like the Sales page: full with commas ── */
const formatCurrency = (n) => '$' + Number(n).toLocaleString();

/* ────────────────────────────────────────────────
 *  Mini sparkline — pure SVG, no deps
 * ──────────────────────────────────────────────── */
const MiniSparkline = ({ data, color, width = 90, height = 32 }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) =>
        `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
    ).join(' ');
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
            <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
    );
};

/* ────────────────────────────────────────────────
 *  Progress Bar mini component
 * ──────────────────────────────────────────────── */
const ProgressBar = ({ value, max, color, bgColor }) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: bgColor }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
    );
};

export const DealerDirectoryScreen = ({ theme, setSuccessMessage, dealerDirectory, onNavigate }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name' });
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterMenuRef = useRef(null);
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) setShowFilterMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sorted = useMemo(() => dealers
        .filter(d =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (d.territory && d.territory.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => sortConfig.key === 'name'
            ? a.name.localeCompare(b.name)
            : (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0)
        ), [dealers, searchTerm, sortConfig]);

    const handleSort = (key) => { setSortConfig({ key }); setShowFilterMenu(false); };

    const totalBookings = dealers.reduce((s, d) => s + (d.bookings || 0), 0);
    const totalSales = dealers.reduce((s, d) => s + (d.sales || 0), 0);

    return (
        <div className="flex flex-col h-full app-header-offset">
            {/* Header */}
            <div className="flex-shrink-0" style={{ backgroundColor: colors.background }}>
                <div className="flex items-center justify-between pr-4">
                    <PageTitle title="Dealer Directory" theme={theme} />
                    <PillButton onClick={() => onNavigate?.('new-dealer-signup')} theme={theme} size="compact">
                        <Plus className="w-4 h-4 mr-1" /> Add Dealer
                    </PillButton>
                </div>

                {/* Aggregate stats bar — matches Sales page style with full $ formatting */}
                <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                    {[
                        { label: 'Dealers', value: String(dealers.length), icon: Building2 },
                        { label: 'Total Sales', value: formatCurrency(totalSales), icon: DollarSign },
                        { label: 'Total Bookings', value: formatCurrency(totalBookings), icon: TrendingUp },
                    ].map(stat => (
                        <div key={stat.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)' }}>
                            <stat.icon className="w-4 h-4 flex-shrink-0" style={{ color: colors.textSecondary }} />
                            <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-wide font-bold" style={{ color: colors.textSecondary }}>{stat.label}</p>
                                <p className="text-[15px] font-black tracking-tight" style={{ color: colors.textPrimary }}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search + filter */}
                <div className="px-4 pb-3 flex items-center space-x-2">
                    <StandardSearchBar className="flex-grow" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, city, or territory..." theme={theme} />
                    <div className="relative">
                        <PillButton onClick={() => setShowFilterMenu(f => !f)} theme={theme} size="compact">
                            <Filter className="w-5 h-5" />
                        </PillButton>
                        {showFilterMenu && (
                            <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-20 w-44 p-2 space-y-1">
                                {[
                                    { key: 'name', label: 'A \u2013 Z' },
                                    { key: 'sales', label: 'By Sales' },
                                    { key: 'bookings', label: 'By Bookings' },
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => handleSort(opt.key)}
                                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                                        style={{
                                            backgroundColor: sortConfig.key === opt.key ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
                                            color: sortConfig.key === opt.key ? colors.textPrimary : colors.textSecondary,
                                            fontWeight: sortConfig.key === opt.key ? 600 : 400,
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </GlassCard>
                        )}
                    </div>
                </div>
            </div>

            {/* Dealer list */}
            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-28">
                {sorted.map(dealer => {
                    const goalPct = dealer.ytdGoal ? Math.round((dealer.sales / dealer.ytdGoal) * 100) : null;
                    const sparkData = dealer.monthlySales?.map(m => m.amount) || [];

                    return (
                        <GlassCard
                            key={dealer.id}
                            theme={theme}
                            className="p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.99]"
                            onClick={() => onNavigate?.(`resources/dealer-directory/${dealer.id}`)}
                            style={{ borderRadius: 20 }}
                        >
                            <div className="px-4 pt-4 pb-3">
                                {/* Top row — name + sparkline + chevron */}
                                <div className="flex items-start justify-between mb-1.5">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-[17px] tracking-tight truncate" style={{ color: colors.textPrimary }}>{dealer.name}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.6 }} />
                                            <p className="text-[13px] truncate" style={{ color: colors.textSecondary }}>{dealer.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        {sparkData.length > 2 && (
                                            <MiniSparkline data={sparkData} color={colors.accent} />
                                        )}
                                        <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary, opacity: 0.35 }} />
                                    </div>
                                </div>

                                {/* Stats row — full formatted like sales page */}
                                <div className="flex items-end gap-5 mt-3">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: colors.textSecondary }}>Sales</p>
                                        <p className="text-[17px] font-black tracking-tight" style={{ color: colors.textPrimary }}>{formatCurrency(dealer.sales)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: colors.textSecondary }}>Bookings</p>
                                        <p className="text-[17px] font-black tracking-tight" style={{ color: colors.textPrimary }}>{formatCurrency(dealer.bookings)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: colors.textSecondary }}>Discount</p>
                                        <p className="text-[15px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>{dealer.dailyDiscount}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom bar — goal progress */}
                            {goalPct !== null && (
                                <div className="px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: colors.textSecondary }}>YTD Goal</span>
                                        <ProgressBar value={dealer.sales} max={dealer.ytdGoal} color={goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : colors.accent} bgColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                                        <span className="text-[12px] font-bold flex-shrink-0" style={{ color: goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : colors.textPrimary }}>{goalPct}%</span>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    );
                })}

                {sorted.length === 0 && (
                    <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center text-center gap-2">
                        <Building2 className="w-8 h-8 mb-1" style={{ color: colors.textSecondary, opacity: 0.4 }} />
                        <p className="text-base font-medium" style={{ color: colors.textPrimary }}>No dealers found</p>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Adjust your search or add a new dealer.</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};