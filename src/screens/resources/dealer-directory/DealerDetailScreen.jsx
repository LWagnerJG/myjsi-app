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
    MoreVertical, UserPlus, CheckCircle, Trash2, Award,
    BarChart3, CalendarDays, ChevronDown, Info, TrendingUp, Target,
} from 'lucide-react';
import { HBar, DonutChart, SparkBars } from './components/DealerDetailComponents.jsx';

/* ── Helpers ─────────────────────────────────────────── */
const fmt  = (n) => '$' + Number(n).toLocaleString();
const fmtK = (n) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
    return `$${n.toLocaleString()}`;
};

const goalTone  = (pct) => pct >= 80 ? '#4A7C59' : pct >= 50 ? '#C4956A' : '#B85C5C';
const initials  = (name) => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

/* ── Card section header ─────────────────────────────── */
const CardHeader = ({ children, right, dark, colors }) => (
    <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}
    >
        <span
            className="text-[12px] font-bold uppercase tracking-[0.07em]"
            style={{ color: colors.textSecondary, opacity: 0.6 }}
        >
            {children}
        </span>
        {right && <span style={{ color: colors.textSecondary }}>{right}</span>}
    </div>
);

/* ────────────────────────────────────────────────────────
 *  MAIN SCREEN
 * ──────────────────────────────────────────────────────── */
export const DealerDetailScreen = ({
    theme, setSuccessMessage, dealerDirectory, onNavigate, screenKey, currentScreen,
}) => {
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);

    const dealerId = useMemo(() => {
        const key = screenKey || currentScreen || '';
        const parts = key.split('/');
        return parseInt(parts[parts.length - 1], 10);
    }, [screenKey, currentScreen]);

    const [localDealers, setLocalDealers] = useState(dealers);
    useEffect(() => setLocalDealers(dealers), [dealers]);
    const dealer = useMemo(() => localDealers.find(d => d.id === dealerId), [localDealers, dealerId]);

    /* ── Discount ── */
    const [showDiscountPicker, setShowDiscountPicker] = useState(false);
    const [pendingDiscount, setPendingDiscount] = useState(null);
    const confirmDiscountChange = () => {
        if (!pendingDiscount) return;
        setLocalDealers(prev => prev.map(d => d.id === dealerId ? { ...d, dailyDiscount: pendingDiscount } : d));
        setPendingDiscount(null);
        setSuccessMessage?.('Discount updated');
        setTimeout(() => setSuccessMessage?.(''), 1500);
    };

    /* ── Rebatable info toggle ── */
    const [showRebateInfo, setShowRebateInfo] = useState(false);

    /* ── Staff management ── */
    const [showAddPerson, setShowAddPerson] = useState(false);
    const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', email: '', role: 'Sales' });
    const [menuState, setMenuState] = useState({ open: false, person: null, top: 0, left: 0 });
    const staffRef = useRef(null);

    const handleAddPerson = (e) => {
        e.preventDefault();
        if (!dealer) return;
        const { firstName, lastName, email, role } = newPerson;
        if (!firstName || !lastName || !email) return;
        const roleKeyMap = {
            'Administrator': 'administration', 'Admin/Sales Support': 'administration',
            'Sales': 'salespeople', 'Designer': 'designers',
            'Sales/Designer': 'salespeople', 'Installer': 'installers',
        };
        const targetKey = roleKeyMap[role] || 'salespeople';
        const person = { name: `${firstName} ${lastName}`, email, status: 'pending', roleLabel: role };
        setLocalDealers(prev => prev.map(d =>
            d.id === dealerId ? { ...d, [targetKey]: [...(d[targetKey] || []), person] } : d
        ));
        setShowAddPerson(false);
        setNewPerson({ firstName: '', lastName: '', email: '', role: 'Sales' });
        setSuccessMessage?.(`Invitation sent to ${email}`);
        setTimeout(() => setSuccessMessage?.(''), 2000);
    };

    const handleUpdatePersonRole = useCallback((personToUpdate, newRoleLabel) => {
        if (!dealer) return;
        const roleKeyMap = {
            'Administrator': 'administration', 'Admin/Sales Support': 'administration',
            'Sales': 'salespeople', 'Designer': 'designers',
            'Sales/Designer': 'salespeople', 'Installer': 'installers',
        };
        const newCategoryKey = roleKeyMap[newRoleLabel];
        const temp = JSON.parse(JSON.stringify(dealer));
        for (const cat of ['salespeople', 'designers', 'administration', 'installers']) {
            const idx = (temp[cat] || []).findIndex(p => p.name === personToUpdate.name);
            if (idx > -1) {
                const p = temp[cat][idx];
                p.roleLabel = newRoleLabel;
                if (cat !== newCategoryKey) {
                    temp[cat].splice(idx, 1);
                    if (!temp[newCategoryKey]) temp[newCategoryKey] = [];
                    temp[newCategoryKey].push(p);
                }
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
        setMenuState({
            open: true, person,
            top: bRect.top - cRect.top + btn.offsetHeight,
            left: bRect.left - cRect.left + btn.offsetWidth - 224,
        });
    };

    /* ── Not found ── */
    if (!dealer) {
        return (
            <div className="flex flex-col h-full app-header-offset items-center justify-center gap-4 px-6">
                <Building2 className="w-12 h-12" style={{ color: colors.textSecondary, opacity: 0.3 }} />
                <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>Dealer not found</p>
                <p className="text-sm text-center" style={{ color: colors.textSecondary }}>
                    This dealer may have been removed or the link is invalid.
                </p>
                <PillButton onClick={() => onNavigate?.('resources/dealer-directory')} theme={theme} size="compact">
                    Back to Directory
                </PillButton>
            </div>
        );
    }

    /* ── Derived values ── */
    const goalPct       = dealer.ytdGoal ? Math.round((dealer.sales / dealer.ytdGoal) * 100) : 0;
    const gColor        = goalTone(goalPct);
    const rebatePct     = dealer.rebatableGoal ? Math.round((dealer.rebatableSales / dealer.rebatableGoal) * 100) : 0;
    const rColor        = goalTone(rebatePct);
    const maxSeriesAmt  = dealer.seriesSales?.[0]?.amount || 1;
    const totalVert     = dealer.verticalSales?.reduce((s, v) => s + v.value, 0) || 0;
    const discountShort = dealer.dailyDiscount?.split(' ')?.[0] || dealer.dailyDiscount || '—';
    const subtleBorder  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: colors.background }}>

            {/* ─── Header ─── */}
            <div
                className="flex-shrink-0 px-4 pt-3 pb-4"
                style={{ backgroundColor: colors.background }}
            >
                <div className="flex items-start gap-3.5">
                    <div
                        className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: colors.accent }}
                    >
                        <span className="text-[15px] font-black" style={{ color: colors.accentText }}>
                            {initials(dealer.name)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h1 className="text-[21px] font-black tracking-tight leading-tight truncate" style={{ color: colors.textPrimary }}>
                            {dealer.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {dealer.address && (
                                <span className="flex items-center gap-1 text-[12px]" style={{ color: colors.textSecondary, opacity: 0.75 }}>
                                    <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent, opacity: 0.55 }} />
                                    <span className="truncate">{dealer.address}</span>
                                </span>
                            )}
                            {dealer.phone && (
                                <a
                                    href={`tel:${dealer.phone}`}
                                    className="flex items-center gap-1 text-[12px] font-semibold flex-shrink-0"
                                    style={{ color: colors.accent }}
                                >
                                    <Phone className="w-3 h-3" />{dealer.phone}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Scrollable content ─── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-3 max-w-5xl mx-auto w-full">

                {/* ── Scorecard: Sales · Bookings · Discount ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                    <div className="flex">
                        {/* YTD Sales */}
                        <div
                            className="flex-1 px-4 pt-4 pb-4"
                            style={{ borderRight: `1px solid ${subtleBorder}` }}
                        >
                            <p
                                className="text-[10px] font-bold uppercase tracking-[0.07em] mb-1.5"
                                style={{ color: colors.textSecondary, opacity: 0.5 }}
                            >
                                YTD Sales
                            </p>
                            <p className="text-[22px] font-black tracking-tight leading-none" style={{ color: colors.textPrimary }}>
                                {fmtK(dealer.sales)}
                            </p>
                        </div>

                        {/* Bookings */}
                        <div
                            className="flex-1 px-4 pt-4 pb-4"
                            style={{ borderRight: `1px solid ${subtleBorder}` }}
                        >
                            <p
                                className="text-[10px] font-bold uppercase tracking-[0.07em] mb-1.5"
                                style={{ color: colors.textSecondary, opacity: 0.5 }}
                            >
                                Bookings
                            </p>
                            <p className="text-[22px] font-black tracking-tight leading-none" style={{ color: colors.textPrimary }}>
                                {fmtK(dealer.bookings)}
                            </p>
                        </div>

                        {/* Discount (tappable) */}
                        <button
                            className="flex-1 px-4 pt-4 pb-4 text-left transition-all active:scale-[0.97]"
                            onClick={() => setShowDiscountPicker(true)}
                        >
                            <p
                                className="text-[10px] font-bold uppercase tracking-[0.07em] mb-1.5"
                                style={{ color: colors.textSecondary, opacity: 0.5 }}
                            >
                                Discount
                            </p>
                            <div className="flex items-center gap-1">
                                <p className="text-[22px] font-black tracking-tight leading-none" style={{ color: colors.accent }}>
                                    {discountShort}
                                </p>
                                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: colors.accent, opacity: 0.45 }} />
                            </div>
                        </button>
                    </div>
                </GlassCard>

                {/* ── Goal Progress ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                    <CardHeader dark={isDark} colors={colors} right={
                        <span className="text-[12px] font-semibold">
                            {fmt(dealer.sales)} of {fmt(dealer.ytdGoal)}
                        </span>
                    }>
                        Goal Progress
                    </CardHeader>
                    <div className="px-5 pt-4 pb-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                                <Target className="w-4 h-4" style={{ color: gColor }} />
                                <span className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                                    YTD Sales
                                </span>
                            </div>
                            <span
                                className="text-[18px] font-black tabular-nums px-3 py-0.5 rounded-full"
                                style={{ backgroundColor: gColor + '1A', color: gColor }}
                            >
                                {goalPct}%
                            </span>
                        </div>
                        <div
                            className="w-full rounded-full overflow-hidden"
                            style={{ height: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(goalPct, 100)}%`, backgroundColor: gColor }}
                            />
                        </div>

                        {dealer.rebatableGoal > 0 && (
                            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${subtleBorder}` }}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[12px] font-semibold" style={{ color: colors.textSecondary, opacity: 0.65 }}>
                                            Rebatable
                                        </span>
                                        <button
                                            onClick={() => setShowRebateInfo(v => !v)}
                                            style={{ color: colors.textSecondary, opacity: 0.4 }}
                                        >
                                            <Info className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <span className="text-[14px] font-black tabular-nums" style={{ color: rColor }}>
                                        {rebatePct}%
                                    </span>
                                </div>
                                {showRebateInfo && (
                                    <p
                                        className="text-[12px] leading-relaxed mb-3 px-3 py-2.5 rounded-xl"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(91,123,140,0.05)',
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        Rebatable sales include only projects at this dealer's standard daily discount.
                                    </p>
                                )}
                                <div
                                    className="w-full rounded-full overflow-hidden"
                                    style={{ height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min(rebatePct, 100)}%`, backgroundColor: rColor, opacity: 0.65 }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-[11px]" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                                        {fmtK(dealer.rebatableSales)} sales
                                    </span>
                                    <span className="text-[11px]" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                                        {fmtK(dealer.rebatableGoal)} goal
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* ── Monthly Trend ── */}
                {dealer.monthlySales?.length > 0 && (
                    <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                        <CardHeader dark={isDark} colors={colors} right={
                            <span className="text-[12px] font-bold" style={{ color: colors.accent }}>
                                {fmtK(dealer.monthlySales[dealer.monthlySales.length - 1]?.amount || 0)} last mo
                            </span>
                        }>
                            Monthly Trend
                        </CardHeader>
                        <div className="px-4 pt-3 pb-4">
                            <SparkBars data={dealer.monthlySales} colors={colors} isDark={isDark} />
                        </div>
                    </GlassCard>
                )}

                {/* ── Sales Breakdown ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dealer.verticalSales?.length > 0 && (
                        <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                            <CardHeader dark={isDark} colors={colors}>By Vertical</CardHeader>
                            <div className="px-4 pt-3 pb-4 flex items-center gap-4">
                                <DonutChart data={dealer.verticalSales} size={92} strokeWidth={14} colors={colors} />
                                <div className="flex-1 space-y-2">
                                    {dealer.verticalSales.map(v => {
                                        const pct = totalVert ? Math.round((v.value / totalVert) * 100) : 0;
                                        return (
                                            <div key={v.label} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
                                                <span className="text-[12px] font-semibold flex-1 truncate" style={{ color: colors.textPrimary }}>{v.label}</span>
                                                <span className="text-[12px] font-bold flex-shrink-0 tabular-nums" style={{ color: colors.textSecondary }}>{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {dealer.seriesSales?.length > 0 && (
                        <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                            <CardHeader dark={isDark} colors={colors} right={
                                <span className="text-[11px] font-bold" style={{ opacity: 0.45 }}>
                                    {dealer.seriesSales.length} series
                                </span>
                            }>
                                By Series
                            </CardHeader>
                            <div className="px-4 pt-1 pb-2">
                                {dealer.seriesSales.map((s, i) => (
                                    <HBar
                                        key={s.series}
                                        label={s.series}
                                        value={s.amount}
                                        maxValue={maxSeriesAmt}
                                        color={colors.accent}
                                        isDark={isDark}
                                        colors={colors}
                                        rank={i + 1}
                                    />
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>

                {/* ── Recent Projects ── */}
                {dealer.recentProjects?.length > 0 && (
                    <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                        <CardHeader dark={isDark} colors={colors}>Recent Projects</CardHeader>
                        {dealer.recentProjects.map((proj, i) => {
                            const statusCfg = PROJECT_STATUS_CONFIG[proj.status] || {};
                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-5"
                                    style={{
                                        paddingTop: 13,
                                        paddingBottom: 13,
                                        borderBottom: i < dealer.recentProjects.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-semibold truncate leading-snug" style={{ color: colors.textPrimary }}>
                                            {proj.name}
                                        </p>
                                        <p className="text-[12px] mt-0.5 leading-snug" style={{ color: colors.textSecondary, opacity: 0.55 }}>
                                            {new Date(proj.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <span
                                        className="px-2 py-0.5 rounded-md text-[11px] font-bold flex-shrink-0"
                                        style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                                    >
                                        {statusCfg.label || proj.status}
                                    </span>
                                    <span className="text-[14px] font-black flex-shrink-0 tabular-nums" style={{ color: colors.textPrimary }}>
                                        {fmtK(proj.amount)}
                                    </span>
                                </div>
                            );
                        })}
                    </GlassCard>
                )}

                {/* ── Rewards ── */}
                {dealer.repRewards?.length > 0 && (
                    <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                        <CardHeader dark={isDark} colors={colors}>Rewards</CardHeader>
                        {dealer.repRewards.map((rep, i) => (
                            <div
                                key={rep.name}
                                className="flex items-center gap-3 px-5"
                                style={{
                                    paddingTop: 13,
                                    paddingBottom: 13,
                                    borderBottom: i < dealer.repRewards.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                }}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-semibold truncate leading-snug" style={{ color: colors.textPrimary }}>
                                        {rep.name}
                                    </p>
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wide"
                                        style={{ color: rep.type === 'sales' ? '#4A7C59' : '#5B7B8C' }}
                                    >
                                        {rep.type}
                                    </span>
                                </div>
                                <span className="text-[15px] font-black flex-shrink-0 tabular-nums" style={{ color: colors.accent }}>
                                    {fmt(rep.ytd)}
                                </span>
                            </div>
                        ))}
                    </GlassCard>
                )}

                {/* ── Staff / Team ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                    <CardHeader dark={isDark} colors={colors} right={
                        <button
                            onClick={() => setShowAddPerson(true)}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-[0.93]"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${colors.accent}10` }}
                            aria-label="Add person"
                        >
                            <UserPlus className="w-[13px] h-[13px]" style={{ color: colors.accent }} />
                        </button>
                    }>
                        Team
                    </CardHeader>

                    <div ref={staffRef} className="relative px-5 py-2">
                        {[
                            { title: 'Sales',   key: 'salespeople'   },
                            { title: 'Design',  key: 'designers'     },
                            { title: 'Admin',   key: 'administration' },
                            { title: 'Install', key: 'installers'    },
                        ].map(section => {
                            const members = dealer[section.key] || [];
                            if (members.length === 0) return null;
                            return (
                                <div key={section.key} className="mt-3 first:mt-1">
                                    <p
                                        className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2"
                                        style={{ color: colors.textSecondary, opacity: 0.4 }}
                                    >
                                        {section.title}
                                    </p>
                                    {members.map((m, mi) => (
                                        <div
                                            key={m.name}
                                            className="flex items-center gap-3 py-[10px]"
                                            style={{
                                                borderBottom: mi < members.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                            }}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-black"
                                                style={{
                                                    backgroundColor: m.status === 'pending'
                                                        ? 'rgba(196,149,106,0.12)'
                                                        : `${colors.accent}12`,
                                                    color: m.status === 'pending' ? '#C4956A' : colors.accent,
                                                }}
                                            >
                                                {initials(m.name)}
                                            </div>

                                            {/* Name + status */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-semibold truncate leading-snug" style={{ color: colors.textPrimary }}>
                                                    {m.name}
                                                </p>
                                                {m.status === 'pending' ? (
                                                    <span
                                                        className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5"
                                                        style={{ backgroundColor: 'rgba(196,149,106,0.12)', color: '#C4956A' }}
                                                    >
                                                        Pending invite
                                                    </span>
                                                ) : (
                                                    <p className="text-[12px] truncate leading-snug mt-0.5" style={{ color: colors.textSecondary, opacity: 0.6 }}>
                                                        {m.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Menu button */}
                                            <button
                                                onClick={(e) => handleMenuOpen(e, m)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                                                style={{ color: colors.textSecondary, opacity: 0.35 }}
                                            >
                                                <MoreVertical className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}

                        {/* Context menu */}
                        {menuState.open && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuState({ open: false, person: null, top: 0, left: 0 })}
                                />
                                <div className="absolute z-20 animate-fade-in" style={{ top: menuState.top, left: Math.max(0, menuState.left) }}>
                                    <GlassCard theme={theme} className="p-1 w-52">
                                        <div
                                            className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.07em]"
                                            style={{ color: colors.textSecondary, opacity: 0.5 }}
                                        >
                                            Change Role
                                        </div>
                                        {ROLE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleUpdatePersonRole(menuState.person, opt.value)}
                                                className="w-full flex justify-between items-center text-left py-2 px-2 text-[13px] font-semibold rounded-xl transition-colors"
                                                style={{ color: menuState.person?.roleLabel === opt.value ? colors.accent : colors.textPrimary }}
                                            >
                                                <span>{opt.label}</span>
                                                {menuState.person?.roleLabel === opt.value && (
                                                    <CheckCircle className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                                                )}
                                            </button>
                                        ))}
                                        <div className="border-t my-1 mx-1" style={{ borderColor: subtleBorder }} />
                                        <button
                                            onClick={() => handleRemovePerson(menuState.person?.name)}
                                            className="w-full flex items-center gap-2 text-left py-2 px-2 text-[13px] font-semibold rounded-xl"
                                            style={{ color: theme.colors.error }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </GlassCard>
                                </div>
                            </>
                        )}
                    </div>
                </GlassCard>

            </div>

            {/* ── Modals ── */}

            {/* Discount picker */}
            <Modal show={showDiscountPicker} onClose={() => setShowDiscountPicker(false)} title="Daily Discount" theme={theme}>
                <p className="text-[13px] mb-3" style={{ color: colors.textSecondary }}>
                    Current: <span className="font-black" style={{ color: colors.textPrimary }}>{dealer.dailyDiscount}</span>
                </p>
                <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-0.5">
                    {DAILY_DISCOUNT_OPTIONS.map(opt => {
                        const isActive = opt === dealer.dailyDiscount;
                        return (
                            <button
                                key={opt}
                                onClick={() => { setShowDiscountPicker(false); setPendingDiscount(opt); }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors"
                                style={{
                                    backgroundColor: isActive ? (colors.accent + '14') : 'transparent',
                                    color: isActive ? colors.accent : colors.textPrimary,
                                }}
                            >
                                <span className="text-[14px] font-semibold">{opt}</span>
                                {isActive && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: colors.accent }} />}
                            </button>
                        );
                    })}
                </div>
            </Modal>

            {/* Confirm discount change */}
            <Modal show={!!pendingDiscount} onClose={() => setPendingDiscount(null)} title="Confirm Change" theme={theme}>
                <p className="text-[14px]" style={{ color: colors.textPrimary }}>
                    Update daily discount to <span className="font-black">{pendingDiscount}</span>?
                </p>
                <div className="flex justify-end gap-3 pt-4">
                    <SecondaryButton onClick={() => setPendingDiscount(null)} theme={theme} size="default">Cancel</SecondaryButton>
                    <PrimaryButton onClick={confirmDiscountChange} theme={theme} size="default">Save</PrimaryButton>
                </div>
            </Modal>

            {/* Add person */}
            <Modal show={showAddPerson} onClose={() => setShowAddPerson(false)} title="Add Person" theme={theme}>
                <form onSubmit={handleAddPerson} className="space-y-3">
                    <FormInput label="First Name" value={newPerson.firstName} onChange={e => setNewPerson(p => ({ ...p, firstName: e.target.value }))} theme={theme} required />
                    <FormInput label="Last Name"  value={newPerson.lastName}  onChange={e => setNewPerson(p => ({ ...p, lastName:  e.target.value }))} theme={theme} required />
                    <FormInput label="Email" type="email" value={newPerson.email} onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))} theme={theme} required />
                    <PortalNativeSelect label="Role" value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))} theme={theme} options={ROLE_OPTIONS} />
                    <div className="pt-2 text-center">
                        <p className="text-[12px] mb-3" style={{ color: colors.textSecondary }}>
                            An invitation email will be sent.
                        </p>
                        <PrimaryButton type="submit" theme={theme} size="default" fullWidth>Send Invite</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
