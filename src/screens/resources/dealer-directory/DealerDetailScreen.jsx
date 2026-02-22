import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PillButton, PrimaryButton, SecondaryButton } from '../../../components/common/JSIButtons.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { PortalNativeSelect } from '../../../components/forms/PortalNativeSelect.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { DEALER_DIRECTORY_DATA, DAILY_DISCOUNT_OPTIONS, ROLE_OPTIONS, PROJECT_STATUS_CONFIG } from './data.js';
import {
    Phone, MapPin, Building2, Users, DollarSign,
    MoreVertical, UserPlus, CheckCircle, Trash2, Award, Briefcase,
    BarChart3, CalendarDays, ChevronDown, Info, TrendingUp, Target
} from 'lucide-react';

/* ── Helpers ── */
const fmt = (n) => '$' + Number(n).toLocaleString();
const fmtK = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n.toLocaleString()}`;
};

/* ────────────────────────────────────────────────
 *  Compact horizontal bar
 * ──────────────────────────────────────────────── */
const HBar = ({ label, value, maxValue, color, isDark, colors, rank }) => {
    const pct = Math.min((value / maxValue) * 100, 100);
    return (
        <div className="flex items-center gap-2 py-1">
            {rank != null && (
                <span className="text-[11px] font-black w-4 text-center flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.5 }}>{rank}</span>
            )}
            <span className="text-[12px] font-semibold w-24 flex-shrink-0 truncate" style={{ color: colors.textPrimary }}>{label}</span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color || colors.accent, opacity: 0.75 }} />
            </div>
            <span className="text-[11px] font-bold w-14 text-right flex-shrink-0" style={{ color: colors.textSecondary }}>{fmtK(value)}</span>
        </div>
    );
};

/* ────────────────────────────────────────────────
 *  Donut chart — cleaner than filled pie
 * ──────────────────────────────────────────────── */
const DonutChart = ({ data, size = 100, strokeWidth = 18, colors: themeColors }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const cx = size / 2, cy = size / 2;
    let offset = circumference * 0.25; // start at top

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
            {data.map((d, i) => {
                const pct = d.value / total;
                const dash = pct * circumference;
                const gap = circumference - dash;
                const el = (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                );
                offset -= dash;
                return el;
            })}
            <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central"
                fontSize="13" fontWeight="900" fill={themeColors?.textPrimary || '#353535'}>
                {data.length}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="central"
                fontSize="8" fontWeight="600" fill={themeColors?.textSecondary || '#999'} letterSpacing="0.5">
                VERTICALS
            </text>
        </svg>
    );
};

/* ────────────────────────────────────────────────
 *  Sparkline bar chart — ultra compact
 * ──────────────────────────────────────────────── */
const SparkBars = ({ data, colors, isDark }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.amount));
    return (
        <div className="flex items-end gap-[3px]" style={{ height: 64 }}>
            {data.map((d, i) => {
                const hPct = Math.max((d.amount / max) * 100, 4);
                const isLast = i === data.length - 1;
                return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                        <div className="w-full flex justify-center" style={{ height: 48 }}>
                            <div
                                className="rounded-t transition-all duration-500"
                                style={{
                                    width: '70%',
                                    maxWidth: 20,
                                    height: `${hPct}%`,
                                    backgroundColor: isLast ? colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.10)'),
                                    alignSelf: 'flex-end',
                                }}
                            />
                        </div>
                        <span className="text-[9px] font-semibold leading-none" style={{ color: colors.textSecondary, opacity: 0.6 }}>{d.month}</span>
                    </div>
                );
            })}
        </div>
    );
};

/* ────────────────────────────────────────────────
 *  Stat Chip — small metric display
 * ──────────────────────────────────────────────── */
const StatChip = ({ label, value, isDark, colors, accent }) => (
    <div className="flex-1 min-w-0 py-2.5 px-3 rounded-2xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.025)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: colors.textSecondary, opacity: 0.55 }}>{label}</p>
        <p className="text-lg font-black tracking-tight leading-tight" style={{ color: accent || colors.textPrimary }}>{value}</p>
    </div>
);

/* ────────────────────────────────────────────────
 *  Section label — minimal
 * ──────────────────────────────────────────────── */
const SectionLabel = ({ icon: Icon, title, colors, right }) => (
    <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
            {Icon && <Icon className="w-3.5 h-3.5" style={{ color: colors.accent, opacity: 0.7 }} />}
            <h2 className="text-[13px] font-bold tracking-tight uppercase" style={{ color: colors.textSecondary, opacity: 0.7 }}>{title}</h2>
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
    const [showDiscountPicker, setShowDiscountPicker] = useState(false);
    const [pendingDiscount, setPendingDiscount] = useState(null);
    const confirmDiscountChange = () => {
        if (!pendingDiscount) return;
        setLocalDealers(prev => prev.map(d => d.id === dealerId ? { ...d, dailyDiscount: pendingDiscount } : d));
        setPendingDiscount(null);
        setSuccessMessage?.('Discount updated');
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
        setSuccessMessage?.('Role updated');
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

    const goalPct = dealer.ytdGoal ? Math.round((dealer.sales / dealer.ytdGoal) * 100) : 0;
    const goalColor = goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : '#B85C5C';
    const rebatePct = dealer.rebatableGoal ? Math.round((dealer.rebatableSales / dealer.rebatableGoal) * 100) : 0;
    const rebateColor = rebatePct >= 80 ? '#4A7C59' : rebatePct >= 50 ? '#C4956A' : '#B85C5C';
    const maxSeriesAmount = dealer.seriesSales?.[0]?.amount || 1;
    const totalVerticalSales = dealer.verticalSales?.reduce((s, v) => s + v.value, 0) || 0;
    const discountShort = dealer.dailyDiscount?.split(' ')?.[0] || dealer.dailyDiscount || '—';
    const thinBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

    return (
        <div className="flex flex-col h-full app-header-offset">

            {/* ─── Header — monogram + dealer info ─── */}
            <div className="flex-shrink-0 px-4 sm:px-6 pt-3 pb-2 max-w-5xl mx-auto w-full" style={{ backgroundColor: colors.background }}>
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: colors.accent }}>
                        <span className="text-base font-black" style={{ color: colors.accentText }}>
                            {dealer.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-black tracking-tight leading-tight truncate" style={{ color: colors.textPrimary }}>{dealer.name}</h1>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-[12px]" style={{ color: colors.textSecondary }}>
                                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent, opacity: 0.6 }} />
                                <span className="truncate">{dealer.address}</span>
                            </span>
                            {dealer.phone && (
                                <a href={`tel:${dealer.phone}`} className="flex items-center gap-1 text-[12px] font-semibold flex-shrink-0" style={{ color: colors.accent }}>
                                    <Phone className="w-3 h-3" />{dealer.phone}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Scrollable content ─── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 space-y-3 pb-28 max-w-5xl mx-auto w-full">

                {/* ──── Key Metrics Row ──── */}
                <div className="flex gap-2">
                    <StatChip label="YTD Sales" value={fmtK(dealer.sales)} isDark={isDark} colors={colors} />
                    <StatChip label="Bookings" value={fmtK(dealer.bookings)} isDark={isDark} colors={colors} />
                    <button
                        onClick={() => setShowDiscountPicker(true)}
                        className="flex-1 min-w-0 py-2.5 px-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.025)' }}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: colors.textSecondary, opacity: 0.55 }}>Discount</p>
                        <div className="flex items-center gap-1">
                            <p className="text-lg font-black tracking-tight leading-tight" style={{ color: colors.accent }}>{discountShort}</p>
                            <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.4 }} />
                        </div>
                    </button>
                </div>

                {/* ──── Goal Progress ──── */}
                <GlassCard theme={theme} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" style={{ color: goalColor }} />
                            <span className="text-[12px] font-bold" style={{ color: colors.textSecondary }}>
                                {fmt(dealer.sales)} / {fmt(dealer.ytdGoal)}
                            </span>
                        </div>
                        <span className="text-[12px] font-black px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: goalColor + '18', color: goalColor }}>{goalPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(goalPct, 100)}%`, backgroundColor: goalColor }} />
                    </div>
                    {dealer.rebatableGoal > 0 && (
                        <div className="mt-2.5 pt-2 border-t" style={{ borderColor: thinBorder }}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold" style={{ color: colors.textSecondary, opacity: 0.6 }}>
                                        Rebatable: {fmtK(dealer.rebatableSales)} / {fmtK(dealer.rebatableGoal)}
                                    </span>
                                    <button onClick={() => setShowRebateInfo(!showRebateInfo)}
                                        className="p-0.5 rounded-full" style={{ color: colors.textSecondary, opacity: 0.4 }}>
                                        <Info className="w-3 h-3" />
                                    </button>
                                </div>
                                <span className="text-[11px] font-bold" style={{ color: rebateColor, opacity: 0.7 }}>{rebatePct}%</span>
                            </div>
                            {showRebateInfo && (
                                <p className="text-[11px] leading-relaxed mb-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(91,123,140,0.05)', color: colors.textSecondary }}>
                                    Rebatable sales include only projects at this dealer's standard daily discount.
                                </p>
                            )}
                            <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(rebatePct, 100)}%`, backgroundColor: rebateColor, opacity: 0.5 }} />
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* ──── Monthly Trend ──── */}
                {dealer.monthlySales?.length > 0 && (
                    <GlassCard theme={theme} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <SectionLabel icon={TrendingUp} title="Monthly Trend" colors={colors} />
                            <span className="text-[11px] font-bold" style={{ color: colors.accent }}>{fmtK(dealer.monthlySales[dealer.monthlySales.length - 1]?.amount || 0)} last mo</span>
                        </div>
                        <SparkBars data={dealer.monthlySales} colors={colors} isDark={isDark} />
                    </GlassCard>
                )}

                {/* ──── Sales Breakdown ──── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dealer.verticalSales?.length > 0 && (
                        <GlassCard theme={theme} className="px-4 py-3">
                            <SectionLabel icon={BarChart3} title="By Vertical" colors={colors} />
                            <div className="flex items-center gap-4">
                                <DonutChart data={dealer.verticalSales} size={88} strokeWidth={14} colors={colors} />
                                <div className="flex-1 space-y-1.5">
                                    {dealer.verticalSales.map(v => {
                                        const pct = totalVerticalSales ? Math.round((v.value / totalVerticalSales) * 100) : 0;
                                        return (
                                            <div key={v.label} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
                                                <span className="text-[11px] font-semibold flex-1 truncate" style={{ color: colors.textPrimary }}>{v.label}</span>
                                                <span className="text-[11px] font-bold flex-shrink-0" style={{ color: colors.textSecondary }}>{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {dealer.seriesSales?.length > 0 && (
                        <GlassCard theme={theme} className="px-4 py-3">
                            <SectionLabel icon={Briefcase} title="By Series" colors={colors}
                                right={<span className="text-[10px] font-bold" style={{ color: colors.textSecondary, opacity: 0.5 }}>{dealer.seriesSales.length} series</span>}
                            />
                            <div className="space-y-0">
                                {dealer.seriesSales.map((s, i) => (
                                    <HBar key={s.series} label={s.series} value={s.amount} maxValue={maxSeriesAmount} color={colors.accent} isDark={isDark} colors={colors} rank={i + 1} />
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>

                {/* ──── Recent Projects ──── */}
                {dealer.recentProjects?.length > 0 && (
                    <GlassCard theme={theme} className="px-4 py-3">
                        <SectionLabel icon={CalendarDays} title="Recent Projects" colors={colors} />
                        {dealer.recentProjects.map((proj, i) => {
                            const statusCfg = PROJECT_STATUS_CONFIG[proj.status] || {};
                            return (
                                <div key={i} className="flex items-center gap-2.5 py-2 border-b last:border-0" style={{ borderColor: thinBorder }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold truncate" style={{ color: colors.textPrimary }}>{proj.name}</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary, opacity: 0.6 }}>
                                            {new Date(proj.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0"
                                        style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                                        {statusCfg.label || proj.status}
                                    </span>
                                    <span className="text-[12px] font-black flex-shrink-0" style={{ color: colors.textPrimary }}>{fmtK(proj.amount)}</span>
                                </div>
                            );
                        })}
                    </GlassCard>
                )}

                {/* ──── Rewards ──── */}
                {dealer.repRewards?.length > 0 && (
                    <GlassCard theme={theme} className="px-4 py-3">
                        <SectionLabel icon={Award} title="Rewards" colors={colors} />
                        <div className="space-y-0">
                            {dealer.repRewards.map((rep) => (
                                <div key={rep.name} className="flex items-center gap-2.5 py-2 border-b last:border-0" style={{ borderColor: thinBorder }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold truncate" style={{ color: colors.textPrimary }}>{rep.name}</p>
                                        <span className="text-[10px] font-bold uppercase"
                                            style={{ color: rep.type === 'sales' ? '#4A7C59' : '#5B7B8C' }}>
                                            {rep.type}
                                        </span>
                                    </div>
                                    <span className="text-[12px] font-black flex-shrink-0" style={{ color: colors.accent }}>{fmt(rep.ytd)}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {/* ──── Staff Directory ──── */}
                <GlassCard theme={theme} className="px-4 py-3">
                    <SectionLabel icon={Users} title="Team" colors={colors}
                        right={
                            <button onClick={() => setShowAddPerson(true)}
                                className="p-1 rounded-xl transition-colors"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.05)' }}
                                aria-label="Add person">
                                <UserPlus className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                            </button>
                        }
                    />
                    <div ref={staffRef} className="relative space-y-2">
                        {[
                            { title: 'Sales', key: 'salespeople' },
                            { title: 'Design', key: 'designers' },
                            { title: 'Admin', key: 'administration' },
                            { title: 'Install', key: 'installers' },
                        ].map(section => {
                            const members = dealer[section.key] || [];
                            if (members.length === 0) return null;
                            return (
                                <div key={section.key}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.textSecondary, opacity: 0.5 }}>{section.title}</p>
                                    {members.map(m => (
                                        <div key={m.name} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: thinBorder }}>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-semibold truncate" style={{ color: colors.textPrimary }}>{m.name}</p>
                                                <p className="text-[11px] truncate" style={{ color: m.status === 'pending' ? '#C4956A' : colors.textSecondary, opacity: m.status === 'pending' ? 1 : 0.6 }}>
                                                    {m.status === 'pending' ? 'Pending' : m.email}
                                                </p>
                                            </div>
                                            <button onClick={(e) => handleMenuOpen(e, m)} className="p-1 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                <MoreVertical className="w-3.5 h-3.5" style={{ color: colors.textSecondary, opacity: 0.4 }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}

                        {menuState.open && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuState({ open: false, person: null, top: 0, left: 0 })} />
                                <div className="absolute z-20 animate-fade-in" style={{ top: menuState.top, left: Math.max(0, menuState.left) }}>
                                    <GlassCard theme={theme} className="p-1 w-52">
                                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Change Role</div>
                                        {ROLE_OPTIONS.map(opt => (
                                            <button key={opt.value}
                                                onClick={() => handleUpdatePersonRole(menuState.person, opt.value)}
                                                className="w-full flex justify-between items-center text-left py-1.5 px-2 text-[13px] font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                                                <span style={{ color: menuState.person?.roleLabel === opt.value ? colors.accent : colors.textPrimary }}>{opt.label}</span>
                                                {menuState.person?.roleLabel === opt.value && <CheckCircle className="w-3.5 h-3.5" style={{ color: colors.accent }} />}
                                            </button>
                                        ))}
                                        <div className="border-t my-1 mx-2" style={{ borderColor: thinBorder }} />
                                        <button onClick={() => handleRemovePerson(menuState.person?.name)}
                                            className="w-full flex items-center text-left py-1.5 px-2 text-[13px] font-semibold rounded-lg" style={{ color: '#B85C5C' }}>
                                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove
                                        </button>
                                    </GlassCard>
                                </div>
                            </>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* ──── Modals ──── */}

            {/* Discount picker modal */}
            <Modal show={showDiscountPicker} onClose={() => setShowDiscountPicker(false)} title="Daily Discount" theme={theme}>
                <p className="text-[13px] mb-3" style={{ color: colors.textSecondary }}>
                    Current: <span className="font-black" style={{ color: colors.textPrimary }}>{dealer.dailyDiscount}</span>
                </p>
                <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-0.5">
                    {DAILY_DISCOUNT_OPTIONS.map(opt => {
                        const isActive = opt === dealer.dailyDiscount;
                        return (
                            <button key={opt}
                                onClick={() => { setShowDiscountPicker(false); setPendingDiscount(opt); }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors"
                                style={{
                                    backgroundColor: isActive ? (colors.accent + '14') : 'transparent',
                                    color: isActive ? colors.accent : colors.textPrimary,
                                }}>
                                <span className="text-[13px] font-semibold">{opt}</span>
                                {isActive && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: colors.accent }} />}
                            </button>
                        );
                    })}
                </div>
            </Modal>

            <Modal show={!!pendingDiscount} onClose={() => setPendingDiscount(null)} title="Confirm Change" theme={theme}>
                <p className="text-[14px]" style={{ color: colors.textPrimary }}>
                    Update daily discount to <span className="font-black">{pendingDiscount}</span>?
                </p>
                <div className="flex justify-end gap-3 pt-4">
                    <SecondaryButton onClick={() => setPendingDiscount(null)} theme={theme} size="default">Cancel</SecondaryButton>
                    <PrimaryButton onClick={confirmDiscountChange} theme={theme} size="default">Save</PrimaryButton>
                </div>
            </Modal>

            <Modal show={showAddPerson} onClose={() => setShowAddPerson(false)} title="Add Person" theme={theme}>
                <form onSubmit={handleAddPerson} className="space-y-3">
                    <FormInput label="First Name" value={newPerson.firstName} onChange={e => setNewPerson(p => ({ ...p, firstName: e.target.value }))} theme={theme} required />
                    <FormInput label="Last Name" value={newPerson.lastName} onChange={e => setNewPerson(p => ({ ...p, lastName: e.target.value }))} theme={theme} required />
                    <FormInput label="Email" type="email" value={newPerson.email} onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))} theme={theme} required />
                    <PortalNativeSelect label="Role" value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))} theme={theme} options={ROLE_OPTIONS} />
                    <div className="pt-2 text-center">
                        <p className="text-[12px] mb-2" style={{ color: colors.textSecondary }}>An invitation email will be sent.</p>
                        <PrimaryButton type="submit" theme={theme} size="default" fullWidth>Send Invite</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};