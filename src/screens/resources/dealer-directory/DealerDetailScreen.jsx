import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PillButton, PrimaryButton, SecondaryButton } from '../../../components/common/JSIButtons.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { PortalNativeSelect } from '../../../components/forms/PortalNativeSelect.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { InfoTooltip } from '../../../components/common/InfoTooltip.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { DEALER_DIRECTORY_DATA, DAILY_DISCOUNT_OPTIONS, ROLE_OPTIONS, PROJECT_STATUS_CONFIG } from './data.js';
import {
    Phone, MapPin, Building2, Users, DollarSign,
    MoreVertical, UserPlus, CheckCircle, Trash2, Award, Briefcase,
    BarChart3, CalendarDays, PieChart, Info
} from 'lucide-react';

/* ── Helpers ── */
const fmt = (n) => '$' + Number(n).toLocaleString();
const fmtK = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n.toLocaleString()}`;
};

/* ────────────────────────────────────────────────
 *  Horizontal bar row
 * ──────────────────────────────────────────────── */
const HBar = ({ label, value, maxValue, color, isDark, colors, rank }) => {
    const pct = Math.min((value / maxValue) * 100, 100);
    return (
        <div className="flex items-center gap-2.5 py-1.5">
            {rank != null && (
                <span className="text-xs font-bold w-4 text-center flex-shrink-0" style={{ color: colors.textSecondary }}>{rank}</span>
            )}
            <span className="text-[13px] font-semibold w-28 flex-shrink-0 truncate" style={{ color: colors.textPrimary }}>{label}</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color || colors.accent, opacity: 0.8 }} />
            </div>
            <span className="text-xs font-bold w-16 text-right flex-shrink-0" style={{ color: colors.textPrimary }}>{fmt(value)}</span>
        </div>
    );
};

/* ────────────────────────────────────────────────
 *  Pie chart — pure SVG with percentage labels
 * ──────────────────────────────────────────────── */
const VerticalPieChart = ({ data, size = 140, colors: themeColors }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = 56, cx = 70, cy = 70;
    let start = -90;
    const toRad = (d) => (d * Math.PI) / 180;
    const slices = data.map((d) => {
        const pct = d.value / total;
        const angle = pct * 360;
        const end = start + angle;
        const large = angle > 180 ? 1 : 0;
        const x1 = cx + r * Math.cos(toRad(start));
        const y1 = cy + r * Math.sin(toRad(start));
        const x2 = cx + r * Math.cos(toRad(end));
        const y2 = cy + r * Math.sin(toRad(end));
        const mid = start + angle / 2;
        const lr = r * 0.62;
        const lx = cx + lr * Math.cos(toRad(mid));
        const ly = cy + lr * Math.sin(toRad(mid));
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
        const result = { path, color: d.color, pct, lx, ly };
        start = end;
        return result;
    });
    return (
        <svg width={size} height={size} viewBox="0 0 140 140" className="flex-shrink-0">
            {slices.map((s, i) => (
                <path key={i} d={s.path} fill={s.color} stroke={themeColors?.surface || '#fff'} strokeWidth="2" />
            ))}
            {slices.filter(s => s.pct >= 0.07).map((s, i) => (
                <text key={`l${i}`} x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central"
                    fontSize="10" fontWeight="700" fill="#fff"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {Math.round(s.pct * 100)}%
                </text>
            ))}
        </svg>
    );
};

/* ────────────────────────────────────────────────
 *  Monthly sales bar chart — responsive
 * ──────────────────────────────────────────────── */
const MonthlyBarChart = ({ data, colors, isDark }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.amount));
    const count = data.length;
    const barW = 100 / count; // percentage-based

    return (
        <div className="flex items-end gap-0" style={{ height: 120 }}>
            {data.map((d) => {
                const hPct = (d.amount / max) * 100;
                return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                        <span className="text-[10px] font-bold" style={{ color: colors.textSecondary }}>{fmtK(d.amount)}</span>
                        <div className="w-full flex justify-center" style={{ height: 80 }}>
                            <div
                                className="rounded-t-md transition-all duration-500"
                                style={{
                                    width: '60%',
                                    maxWidth: 28,
                                    height: `${hPct}%`,
                                    backgroundColor: colors.accent,
                                    opacity: 0.8,
                                    alignSelf: 'flex-end',
                                }}
                            />
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: colors.textSecondary }}>{d.month}</span>
                    </div>
                );
            })}
        </div>
    );
};

/* ────────────────────────────────────────────────
 *  Goal progress — reusable
 * ──────────────────────────────────────────────── */
const GoalProgress = ({ current, goal, label, isDark, colors, barHeight = 'h-2.5', className = '' }) => {
    const pct = goal ? Math.round((current / goal) * 100) : 0;
    const color = pct >= 80 ? '#4A7C59' : pct >= 50 ? '#C4956A' : '#B85C5C';
    const bgTint = pct >= 80 ? 'rgba(74,124,89,0.12)' : pct >= 50 ? 'rgba(196,149,106,0.12)' : 'rgba(184,92,92,0.12)';
    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                    {fmt(current)} of {fmt(goal)} {label}
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: bgTint, color }}>{pct}%</span>
            </div>
            <div className={`w-full ${barHeight} rounded-full overflow-hidden`} style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────
 *  Section header
 * ──────────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, colors, right }) => (
    <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" style={{ color: colors.accent }} />}
            <h2 className="text-[15px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>{title}</h2>
        </div>
        {right}
    </div>
);

/* ────────────────────────────────────────────────
 *  MAIN SCREEN
 * ──────────────────────────────────────────────── */
export const DealerDetailScreen = ({ theme, setSuccessMessage, dealerDirectory, onNavigate, onBack, screenKey, currentScreen }) => {
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;
    const dealers = dealerDirectory || DEALER_DIRECTORY_DATA || [];

    const dealerId = useMemo(() => {
        const key = screenKey || currentScreen || '';
        const parts = key.split('/');
        return parseInt(parts[parts.length - 1], 10);
    }, [screenKey, currentScreen]);

    const [localDealers, setLocalDealers] = useState(dealers);
    useEffect(() => setLocalDealers(dealers), [dealers]);
    const dealer = useMemo(() => localDealers.find(d => d.id === dealerId), [localDealers, dealerId]);

    // Discount
    const [pendingDiscount, setPendingDiscount] = useState(null);
    const confirmDiscountChange = () => {
        if (!pendingDiscount) return;
        setLocalDealers(prev => prev.map(d => d.id === dealerId ? { ...d, dailyDiscount: pendingDiscount } : d));
        setPendingDiscount(null);
        setSuccessMessage?.('Discount updated!');
        setTimeout(() => setSuccessMessage?.(''), 1500);
    };

    // Rebatable info popover
    const [showRebateInfo, setShowRebateInfo] = useState(false);

    // Staff
    const [showAddPerson, setShowAddPerson] = useState(false);
    const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', email: '', role: 'Sales' });
    const [menuState, setMenuState] = useState({ open: false, person: null, top: 0, left: 0 });
    const staffRef = useRef(null);

    const handleAddPerson = (e) => {
        e.preventDefault();
        if (!dealer) return;
        const { firstName, lastName, email, role } = newPerson;
        if (!firstName || !lastName || !email) return;
        const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' };
        const targetKey = roleKeyMap[role] || 'salespeople';
        const person = { name: `${firstName} ${lastName}`, email, status: 'pending', roleLabel: role };
        setLocalDealers(prev => prev.map(d => d.id === dealerId ? { ...d, [targetKey]: [...(d[targetKey] || []), person] } : d));
        setShowAddPerson(false);
        setNewPerson({ firstName: '', lastName: '', email: '', role: 'Sales' });
        setSuccessMessage?.(`Invitation sent to ${email}`);
        setTimeout(() => setSuccessMessage?.(''), 2000);
    };

    const handleUpdatePersonRole = useCallback((personToUpdate, newRoleLabel) => {
        if (!dealer) return;
        const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' };
        const newCategoryKey = roleKeyMap[newRoleLabel];
        const temp = JSON.parse(JSON.stringify(dealer));
        for (const cat of ['salespeople', 'designers', 'administration', 'installers']) {
            const idx = (temp[cat] || []).findIndex(p => p.name === personToUpdate.name);
            if (idx > -1) {
                const p = temp[cat][idx];
                p.roleLabel = newRoleLabel;
                if (cat !== newCategoryKey) { temp[cat].splice(idx, 1); if (!temp[newCategoryKey]) temp[newCategoryKey] = []; temp[newCategoryKey].push(p); }
                break;
            }
        }
        setLocalDealers(prev => prev.map(d => d.id === dealerId ? temp : d));
        setSuccessMessage?.('Role updated!');
        setTimeout(() => setSuccessMessage?.(''), 1500);
        setMenuState({ open: false, person: null, top: 0, left: 0 });
    }, [dealer, dealerId, setSuccessMessage]);

    const handleRemovePerson = useCallback((personName) => {
        if (!dealer) return;
        const updated = { ...dealer };
        ['salespeople', 'designers', 'administration', 'installers'].forEach(cat => {
            if (updated[cat]) updated[cat] = updated[cat].filter(p => p.name !== personName);
        });
        setLocalDealers(prev => prev.map(d => d.id === dealerId ? updated : d));
        setMenuState({ open: false, person: null, top: 0, left: 0 });
        setSuccessMessage?.('Person removed');
        setTimeout(() => setSuccessMessage?.(''), 1500);
    }, [dealer, dealerId, setSuccessMessage]);

    const handleMenuOpen = (event, person) => {
        event.stopPropagation();
        const btn = event.currentTarget;
        const container = staffRef.current;
        if (!container) return;
        const bRect = btn.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        setMenuState({ open: true, person, top: bRect.top - cRect.top + btn.offsetHeight, left: bRect.left - cRect.left + btn.offsetWidth - 224 });
    };

    if (!dealer) {
        return (
            <div className="flex flex-col h-full app-header-offset items-center justify-center gap-4 px-6">
                <Building2 className="w-12 h-12" style={{ color: colors.textSecondary, opacity: 0.3 }} />
                <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>Dealer not found</p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>This dealer may have been removed or the link is invalid.</p>
                <PillButton onClick={() => onNavigate?.('resources/dealer-directory')} theme={theme} size="compact">Back to Directory</PillButton>
            </div>
        );
    }

    const rebatePct = dealer.rebatableGoal ? Math.round((dealer.rebatableSales / dealer.rebatableGoal) * 100) : 0;
    const maxSeriesAmount = dealer.seriesSales?.[0]?.amount || 1;
    const totalVerticalSales = dealer.verticalSales?.reduce((s, v) => s + v.value, 0) || 0;

    /* Subtle glass-like bg for stat boxes */
    const subtleBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)';
    const chipBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)';

    return (
        <div className="flex flex-col h-full app-header-offset">
            {/* ─── Sticky header — name + contact ─── */}
            <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-3 pb-3 max-w-5xl mx-auto w-full" style={{ backgroundColor: colors.background }}>
                <h1 className="text-[22px] font-black tracking-tight leading-tight truncate" style={{ color: colors.textPrimary }}>{dealer.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 mt-2">
                    <span className="flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.accent, opacity: 0.7 }} />
                        <span className="text-[13px]">{dealer.address}</span>
                    </span>
                    {dealer.phone && (
                        <a href={`tel:${dealer.phone}`} className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: colors.accent }}>
                            <Phone className="w-3.5 h-3.5" />{dealer.phone}
                        </a>
                    )}
                </div>
            </div>

            {/* ─── Scrollable content — hidden scrollbar ─── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 lg:px-8 space-y-4 pb-28 max-w-5xl mx-auto w-full">

                {/* ──── Hero Stats ──── */}
                <GlassCard theme={theme} className="p-5" variant="elevated">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: colors.textSecondary, opacity: 0.7 }}>YTD Sales</p>
                            <p className="text-2xl font-black tracking-tight leading-tight" style={{ color: colors.textPrimary }}>{fmt(dealer.sales)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: colors.textSecondary, opacity: 0.7 }}>Bookings</p>
                            <p className="text-2xl font-black tracking-tight leading-tight" style={{ color: colors.textPrimary }}>{fmt(dealer.bookings)}</p>
                        </div>
                    </div>

                    {/* YTD Goal progress */}
                    <GoalProgress current={dealer.sales} goal={dealer.ytdGoal} label="YTD goal" isDark={isDark} colors={colors} className="mt-4 pt-3 border-t" barHeight="h-2.5" />

                    {/* Rebatable Goal — discrete, muted */}
                    {dealer.rebatableGoal > 0 && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-xs font-semibold tracking-wide" style={{ color: colors.textSecondary, opacity: 0.6 }}>
                                    Rebatable: {fmt(dealer.rebatableSales)} of {fmt(dealer.rebatableGoal)}
                                </span>
                                <button
                                    onClick={() => setShowRebateInfo(!showRebateInfo)}
                                    className="p-0.5 rounded-full transition-colors"
                                    style={{ color: colors.textSecondary, opacity: 0.5 }}
                                    aria-label="What is rebatable?"
                                >
                                    <Info className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold ml-auto" style={{
                                    color: rebatePct >= 80 ? '#4A7C59' : rebatePct >= 50 ? '#C4956A' : '#B85C5C',
                                    opacity: 0.7
                                }}>{rebatePct}%</span>
                            </div>
                            {showRebateInfo && (
                                <p className="text-xs leading-relaxed mb-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(91,123,140,0.06)', color: colors.textSecondary }}>
                                    Rebatable sales for {new Date().getFullYear()} include only projects at this dealer's standard daily discount.
                                </p>
                            )}
                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                                <div className="h-full rounded-full transition-all duration-700" style={{
                                    width: `${Math.min(rebatePct, 100)}%`,
                                    backgroundColor: rebatePct >= 80 ? '#4A7C59' : rebatePct >= 50 ? '#C4956A' : '#B85C5C',
                                    opacity: 0.5,
                                }} />
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* ──── Daily Discount — compact inline ──── */}
                <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5" style={{ backgroundColor: subtleBg }}>
                    <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: colors.accent, opacity: 0.7 }} />
                    <span className="text-[13px] font-semibold flex-shrink-0" style={{ color: colors.textSecondary }}>Daily Discount</span>
                    <div className="flex-1 max-w-[220px]">
                        <PortalNativeSelect
                            theme={theme}
                            value={dealer.dailyDiscount}
                            onChange={e => setPendingDiscount(e.target.value)}
                            options={DAILY_DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                            size="sm"
                        />
                    </div>
                </div>

                {/* ──── Monthly Sales Trend — fully responsive ──── */}
                {dealer.monthlySales?.length > 0 && (
                    <GlassCard theme={theme} className="p-4">
                        <SectionHeader icon={BarChart3} title="Monthly Sales Trend" colors={colors} />
                        <MonthlyBarChart data={dealer.monthlySales} colors={colors} isDark={isDark} />
                    </GlassCard>
                )}

                {/* ──── Sales by Vertical + Series (responsive 2-col on wider screens) ──── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pie chart — legend | chart | dollar amounts */}
                    {dealer.verticalSales?.length > 0 && (
                        <GlassCard theme={theme} className="p-4">
                            <SectionHeader icon={PieChart} title="Sales by Vertical" colors={colors} />
                            <div className="flex items-center gap-4">
                                {/* Legend column */}
                                <div className="space-y-2">
                                    {dealer.verticalSales.map(v => (
                                        <div key={v.label} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: v.color }} />
                                            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: colors.textPrimary }}>{v.label}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Pie chart in center */}
                                <div className="flex-shrink-0">
                                    <VerticalPieChart data={dealer.verticalSales} colors={colors} />
                                </div>
                                {/* Dollar amounts + pct column */}
                                <div className="space-y-2 ml-auto">
                                    {dealer.verticalSales.map(v => {
                                        const pct = totalVerticalSales ? Math.round((v.value / totalVerticalSales) * 100) : 0;
                                        return (
                                            <div key={v.label} className="flex items-center gap-2 justify-end">
                                                <span className="text-xs font-bold" style={{ color: colors.textSecondary }}>{pct}%</span>
                                                <span className="text-xs font-bold text-right" style={{ color: colors.textPrimary, minWidth: 56 }}>{fmt(v.value)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Series bars */}
                    {dealer.seriesSales?.length > 0 && (
                        <GlassCard theme={theme} className="p-4">
                            <SectionHeader icon={Briefcase} title="Sales by Series" colors={colors}
                                right={<span className="text-xs font-bold" style={{ color: colors.textSecondary }}>{dealer.seriesSales.length} series</span>}
                            />
                            <div className="space-y-0">
                                {dealer.seriesSales.map((s, i) => (
                                    <HBar key={s.series} label={s.series} value={s.amount} maxValue={maxSeriesAmount} color={colors.accent} isDark={isDark} colors={colors} rank={i + 1} />
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>

                {/* ──── Rewards table ──── */}
                {dealer.repRewards?.length > 0 && (
                    <GlassCard theme={theme} className="p-4">
                        <SectionHeader icon={Award} title="Sales & Designer Rewards" colors={colors} />
                        <div className="overflow-x-auto -mx-2 scrollbar-hide">
                            <table className="w-full text-xs" style={{ minWidth: 420 }}>
                                <thead>
                                    <tr>
                                        <th className="text-left pl-2 pb-2 font-bold" style={{ color: colors.textSecondary }}>Name</th>
                                        <th className="text-left pb-2 font-bold" style={{ color: colors.textSecondary }}>Type</th>
                                        <th className="text-right pb-2 font-bold" style={{ color: colors.textSecondary }}>Q1</th>
                                        <th className="text-right pb-2 font-bold" style={{ color: colors.textSecondary }}>Q2</th>
                                        <th className="text-right pb-2 font-bold" style={{ color: colors.textSecondary }}>Q3</th>
                                        <th className="text-right pb-2 font-bold" style={{ color: colors.textSecondary }}>Q4</th>
                                        <th className="text-right pr-2 pb-2 font-black" style={{ color: colors.textPrimary }}>YTD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dealer.repRewards.map((rep) => (
                                        <tr key={rep.name} className="border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                                            <td className="pl-2 py-2 font-semibold" style={{ color: colors.textPrimary }}>{rep.name}</td>
                                            <td className="py-2">
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase"
                                                    style={{
                                                        backgroundColor: rep.type === 'sales' ? 'rgba(74,124,89,0.12)' : 'rgba(91,123,140,0.12)',
                                                        color: rep.type === 'sales' ? '#4A7C59' : '#5B7B8C'
                                                    }}>
                                                    {rep.type}
                                                </span>
                                            </td>
                                            <td className="text-right py-2" style={{ color: colors.textSecondary }}>{rep.q1 ? fmt(rep.q1) : '\u2014'}</td>
                                            <td className="text-right py-2" style={{ color: colors.textSecondary }}>{rep.q2 ? fmt(rep.q2) : '\u2014'}</td>
                                            <td className="text-right py-2" style={{ color: colors.textSecondary }}>{rep.q3 ? fmt(rep.q3) : '\u2014'}</td>
                                            <td className="text-right py-2" style={{ color: colors.textSecondary }}>{rep.q4 ? fmt(rep.q4) : '\u2014'}</td>
                                            <td className="text-right pr-2 py-2 font-black" style={{ color: colors.accent }}>{fmt(rep.ytd)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                )}

                {/* ──── Recent Projects ──── */}
                {dealer.recentProjects?.length > 0 && (
                    <GlassCard theme={theme} className="p-4">
                        <SectionHeader icon={CalendarDays} title="Recent Projects" colors={colors} />
                        <div className="space-y-0">
                            {dealer.recentProjects.map((proj, i) => {
                                const statusCfg = PROJECT_STATUS_CONFIG[proj.status] || {};
                                return (
                                    <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>{proj.name}</p>
                                            <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{new Date(proj.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0"
                                            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                                            {statusCfg.label || proj.status}
                                        </span>
                                        <span className="text-[13px] font-black flex-shrink-0" style={{ color: colors.textPrimary }}>{fmt(proj.amount)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                )}

                {/* ──── Staff Directory ──── */}
                <GlassCard theme={theme} className="p-4">
                    <SectionHeader icon={Users} title="Staff Directory" colors={colors}
                        right={
                            <button
                                onClick={() => setShowAddPerson(true)}
                                className="p-1.5 rounded-full transition-colors"
                                style={{ backgroundColor: chipBg }}
                                aria-label="Add person"
                            >
                                <UserPlus className="w-4 h-4" style={{ color: colors.accent }} />
                            </button>
                        }
                    />
                    <div ref={staffRef} className="relative space-y-3">
                        {[
                            { title: 'Salespeople', key: 'salespeople' },
                            { title: 'Designers', key: 'designers' },
                            { title: 'Administration', key: 'administration' },
                            { title: 'Installers', key: 'installers' },
                        ].map(section => {
                            const members = dealer[section.key] || [];
                            if (members.length === 0) return null;
                            return (
                                <div key={section.key}>
                                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>{section.title}</p>
                                    <div className="space-y-0">
                                        {members.map(m => (
                                            <div key={m.name} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>{m.name}</p>
                                                    <p className="text-xs truncate" style={{ color: m.status === 'pending' ? '#C4956A' : colors.textSecondary }}>
                                                        {m.status === 'pending' ? 'Pending Invitation' : m.email}
                                                    </p>
                                                </div>
                                                <button onClick={(e) => handleMenuOpen(e, m)} className="p-1.5 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                    <MoreVertical className="w-4 h-4" style={{ color: colors.textSecondary }} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Inline context menu */}
                        {menuState.open && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuState({ open: false, person: null, top: 0, left: 0 })} />
                                <div className="absolute z-20 animate-fade-in" style={{ top: menuState.top, left: Math.max(0, menuState.left) }}>
                                    <GlassCard theme={theme} className="p-1 w-56">
                                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Change Role</div>
                                        {ROLE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleUpdatePersonRole(menuState.person, opt.value)}
                                                className="w-full flex justify-between items-center text-left py-2 px-2 text-sm font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                                            >
                                                <span style={{ color: menuState.person?.roleLabel === opt.value ? colors.accent : colors.textPrimary }}>{opt.label}</span>
                                                {menuState.person?.roleLabel === opt.value && <CheckCircle className="w-4 h-4" style={{ color: colors.accent }} />}
                                            </button>
                                        ))}
                                        <div className="border-t my-1 mx-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                                        <button onClick={() => handleRemovePerson(menuState.person?.name)} className="w-full flex items-center text-left py-2 px-2 text-sm font-semibold rounded-lg" style={{ color: '#B85C5C' }}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Remove Person
                                        </button>
                                    </GlassCard>
                                </div>
                            </>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* ──── Modals ──── */}
            <Modal show={!!pendingDiscount} onClose={() => setPendingDiscount(null)} title="Confirm Discount Change" theme={theme}>
                <p className="text-[15px]" style={{ color: colors.textPrimary }}>Change daily discount to <span className="font-black">{pendingDiscount}</span>?</p>
                <div className="flex justify-end gap-3 pt-4">
                    <SecondaryButton onClick={() => setPendingDiscount(null)} theme={theme} size="default">Cancel</SecondaryButton>
                    <PrimaryButton onClick={confirmDiscountChange} theme={theme} size="default">Save</PrimaryButton>
                </div>
            </Modal>

            <Modal show={showAddPerson} onClose={() => setShowAddPerson(false)} title="Add New Person" theme={theme}>
                <form onSubmit={handleAddPerson} className="space-y-4">
                    <FormInput label="First Name" value={newPerson.firstName} onChange={e => setNewPerson(p => ({ ...p, firstName: e.target.value }))} theme={theme} required />
                    <FormInput label="Last Name" value={newPerson.lastName} onChange={e => setNewPerson(p => ({ ...p, lastName: e.target.value }))} theme={theme} required />
                    <FormInput label="Email" type="email" value={newPerson.email} onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))} theme={theme} required />
                    <PortalNativeSelect label="Role" value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))} theme={theme} options={ROLE_OPTIONS} />
                    <div className="pt-2 text-center">
                        <p className="text-[13px] mb-2" style={{ color: colors.textSecondary }}>Invitation email will be sent.</p>
                        <PrimaryButton type="submit" theme={theme} size="default" fullWidth>Send Invite</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};