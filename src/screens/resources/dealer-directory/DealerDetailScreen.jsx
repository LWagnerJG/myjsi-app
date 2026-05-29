import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PillButton, PrimaryButton, SecondaryButton } from '../../../components/common/JSIButtons.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { PortalNativeSelect } from '../../../components/forms/PortalNativeSelect.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { ScreenTopChrome } from '../../../components/common/ScreenTopChrome.jsx';
import { isDarkTheme, subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import { formatCurrencyCompact, formatLongDate } from '../../../utils/format.js';
import { DEALER_DIRECTORY_DATA, DAILY_DISCOUNT_OPTIONS, ROLE_OPTIONS, PROJECT_STATUS_CONFIG } from './data.js';
import {
    Building2,
    MoreVertical, UserPlus, CheckCircle, Trash2,
    ChevronDown,
} from 'lucide-react';
import { HBar, DonutChart, SparkBars } from './components/DealerDetailComponents.jsx';

const goalTone  = (pct) => pct >= 80 ? '#4A7C59' : pct >= 50 ? '#C4956A' : '#B85C5C';
const initials  = (name) => (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

/* ── Card section header ─────────────────────────────── */
const CardHeader = ({ children, right, colors }) => (
    <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2.5">
        <span
            className="text-[0.75rem] font-semibold tracking-[0.08em] uppercase truncate"
            style={{ color: colors.textSecondary, opacity: 0.62 }}
        >
            {children}
        </span>
        {right && <div className="shrink-0" style={{ color: colors.textSecondary }}>{right}</div>}
    </div>
);

const HeaderMeta = ({ children, colors }) => (
    <span className="text-[0.6875rem] font-semibold" style={{ color: colors.textSecondary, opacity: 0.7 }}>
        {children}
    </span>
);

const InfoPill = ({ children, href, theme, colors }) => {
    const sharedProps = {
        className: 'inline-flex items-center rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold transition-opacity active:opacity-70',
        style: {
            color: colors.textSecondary,
            backgroundColor: subtleBg(theme, 1.6),
            border: subtleBorder(theme),
        },
    };

    if (href) {
        return <a href={href} {...sharedProps}>{children}</a>;
    }

    return <span {...sharedProps}>{children}</span>;
};

const SummaryTile = ({ label, value, theme, colors, accent = false, onClick, trailing }) => {
    const Component = onClick ? 'button' : 'div';

    return (
        <Component
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`rounded-2xl px-3.5 py-3 text-left ${onClick ? 'transition-transform active:scale-[0.97]' : ''}`}
            style={{
                backgroundColor: subtleBg(theme, 1.6),
                border: subtleBorder(theme),
            }}
        >
            <p
                className="text-[0.625rem] font-semibold uppercase tracking-[0.08em]"
                style={{ color: colors.textSecondary, opacity: 0.56 }}
            >
                {label}
            </p>
            <div className="mt-1.5 flex items-center gap-1">
                <span
                    className="text-[1.125rem] font-black tracking-tight leading-none truncate"
                    style={{ color: accent ? colors.accent : colors.textPrimary }}
                >
                    {value}
                </span>
                {trailing}
            </div>
        </Component>
    );
};

const ProgressBlock = ({ label, percent, tone, currentValue, goalValue, theme, colors, isDark }) => (
    <div
        className="rounded-2xl px-4 py-3.5"
        style={{ backgroundColor: subtleBg(theme, 1.3), border: subtleBorder(theme) }}
    >
        <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[0.8125rem] font-semibold" style={{ color: colors.textSecondary, opacity: 0.82 }}>
                {label}
            </span>
            <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.75rem] font-black tabular-nums"
                style={{ color: tone, backgroundColor: `${tone}1A` }}
            >
                {percent}%
            </span>
        </div>
        <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 7, backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.055)' }}
        >
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: tone }}
            />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-[0.6875rem] font-semibold">
            <span style={{ color: colors.textSecondary, opacity: 0.58 }}>{currentValue}</span>
            <span style={{ color: colors.textSecondary, opacity: 0.58 }}>{goalValue}</span>
        </div>
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
    const rowBorder     = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)';
    const topMetricChevron = <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.accent, opacity: 0.42 }} />;
    const latestMonth = dealer.monthlySales?.[dealer.monthlySales.length - 1];
    const teamSections  = [
        { title: 'Sales',   key: 'salespeople' },
        { title: 'Design',  key: 'designers' },
        { title: 'Admin',   key: 'administration' },
        { title: 'Install', key: 'installers' },
    ].map(section => ({ ...section, members: dealer?.[section.key] || [] })).filter(section => section.members.length > 0);
    const totalTeamMembers = teamSections.reduce((sum, section) => sum + section.members.length, 0);
    const rewardByName = (() => {
        const out = new Map();
        (dealer?.repRewards || []).forEach((reward) => {
            if (!reward?.name) return;
            out.set(reward.name.trim().toLowerCase(), reward);
        });
        return out;
    })();

    return (
        <div
            className="flex flex-col h-full app-header-offset"
            style={{ backgroundColor: colors.background }}
        >

            {/* ─── Header ─── */}
            <ScreenTopChrome theme={theme} contentClassName="pt-1 pb-2" fade={false}>
                <GlassCard theme={theme} className="overflow-hidden p-0">
                    <div className="px-5 pt-5 pb-5">
                        <div className="flex items-start gap-3.5 min-w-0">
                            <div
                                className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : `${colors.accent}10`,
                                    color: isDark ? '#F4F1EC' : colors.accent,
                                    border: subtleBorder(theme),
                                }}
                            >
                                <span className="text-[0.8125rem] font-black tracking-tight">
                                    {initials(dealer.name)}
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <h1
                                    className="text-[1.375rem] font-black tracking-tight leading-tight"
                                    style={{ color: colors.textPrimary }}
                                >
                                    {dealer.name}
                                </h1>

                                {dealer.address && (
                                    <p
                                        className="mt-1 text-[0.8125rem] leading-snug"
                                        style={{ color: colors.textSecondary, opacity: 0.76 }}
                                    >
                                        {dealer.address}
                                    </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {dealer.territory && (
                                        <InfoPill theme={theme} colors={colors}>{dealer.territory}</InfoPill>
                                    )}
                                    {dealer.phone && (
                                        <InfoPill href={`tel:${dealer.phone}`} theme={theme} colors={colors}>{dealer.phone}</InfoPill>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 mt-4">
                            <SummaryTile
                                label="YTD Sales"
                                value={formatCurrencyCompact(dealer.sales)}
                                theme={theme}
                                colors={colors}
                            />
                            <SummaryTile
                                label="Bookings"
                                value={formatCurrencyCompact(dealer.bookings)}
                                theme={theme}
                                colors={colors}
                            />
                            <SummaryTile
                                label="Discount"
                                value={discountShort}
                                theme={theme}
                                colors={colors}
                                accent
                                onClick={() => setShowDiscountPicker(true)}
                                trailing={topMetricChevron}
                            />
                        </div>
                    </div>
                </GlassCard>
            </ScreenTopChrome>

            {/* ─── Scrollable content ─── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-16 space-y-4 max-w-content mx-auto w-full">

                {/* ── Goal Progress ── */}
                <GlassCard theme={theme} className="overflow-hidden p-0">
                    <CardHeader colors={colors}>
                        Goal Progress
                    </CardHeader>
                    <div className="px-5 pb-5 space-y-3">
                        <ProgressBlock
                            label="Annual goal"
                            percent={goalPct}
                            tone={gColor}
                            currentValue={`${formatCurrencyCompact(dealer.sales)} sales`}
                            goalValue={`${formatCurrencyCompact(dealer.ytdGoal)} goal`}
                            theme={theme}
                            colors={colors}
                            isDark={isDark}
                        />

                        {dealer.rebatableGoal > 0 && (
                            <ProgressBlock
                                label="Rebatable goal"
                                percent={rebatePct}
                                tone={rColor}
                                currentValue={`${formatCurrencyCompact(dealer.rebatableSales)} sales`}
                                goalValue={`${formatCurrencyCompact(dealer.rebatableGoal)} goal`}
                                theme={theme}
                                colors={colors}
                                isDark={isDark}
                            />
                        )}
                    </div>
                </GlassCard>

                {/* ── Monthly Trend ── */}
                {dealer.monthlySales?.length > 0 && (
                    <GlassCard theme={theme} className="overflow-hidden p-0">
                        <CardHeader colors={colors} right={
                            <HeaderMeta colors={colors}>{`${latestMonth?.month || ''} ${formatCurrencyCompact(latestMonth?.amount || 0)}`.trim()}</HeaderMeta>
                        }>
                            Monthly Trend
                        </CardHeader>
                        <div className="px-5 pb-5">
                            <SparkBars data={dealer.monthlySales} colors={colors} isDark={isDark} />
                        </div>
                    </GlassCard>
                )}

                {/* ── Sales Breakdown ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dealer.verticalSales?.length > 0 && (
                        <GlassCard theme={theme} className="overflow-hidden p-0">
                            <CardHeader colors={colors} right={<HeaderMeta colors={colors}>{formatCurrencyCompact(totalVert)} total</HeaderMeta>}>
                                By Vertical
                            </CardHeader>
                            <div className="px-5 pb-5 flex items-center gap-4">
                                <DonutChart data={dealer.verticalSales} size={92} strokeWidth={14} colors={colors} />
                                <div className="flex-1 space-y-2">
                                    {dealer.verticalSales.map(v => {
                                        const pct = totalVert ? Math.round((v.value / totalVert) * 100) : 0;
                                        return (
                                            <div key={v.label} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
                                                <span className="text-xs font-semibold flex-1 truncate" style={{ color: colors.textPrimary }}>{v.label}</span>
                                                <span className="text-xs font-bold flex-shrink-0 tabular-nums" style={{ color: colors.textSecondary }}>{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {dealer.seriesSales?.length > 0 && (
                        <GlassCard theme={theme} className="overflow-hidden p-0">
                            <CardHeader colors={colors} right={
                                <HeaderMeta colors={colors}>{dealer.seriesSales.length} series</HeaderMeta>
                            }>
                                By Series
                            </CardHeader>
                            <div className="px-5 pb-4">
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
                    <GlassCard theme={theme} className="overflow-hidden p-0">
                        <CardHeader colors={colors} right={<HeaderMeta colors={colors}>{dealer.recentProjects.length} active</HeaderMeta>}>
                            Recent Projects
                        </CardHeader>
                        {dealer.recentProjects.map((proj, i) => {
                            const statusCfg = PROJECT_STATUS_CONFIG[proj.status] || {};
                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-5"
                                    style={{
                                        paddingTop: 13,
                                        paddingBottom: 13,
                                        borderBottom: i < dealer.recentProjects.length - 1 ? `1px solid ${rowBorder}` : 'none',
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate leading-snug" style={{ color: colors.textPrimary }}>
                                            {proj.name}
                                        </p>
                                        <p className="text-xs mt-0.5 leading-snug" style={{ color: colors.textSecondary, opacity: 0.55 }}>
                                            {formatLongDate(proj.date)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <span className="text-sm font-black tabular-nums" style={{ color: colors.textPrimary }}>
                                            {formatCurrencyCompact(proj.amount)}
                                        </span>
                                        <span
                                            className="px-2 py-0.5 rounded-md text-[0.6875rem] font-bold"
                                            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                                        >
                                            {statusCfg.label || proj.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </GlassCard>
                )}

                {/* ── Team + Rewards ── */}
                <GlassCard theme={theme} className="overflow-hidden p-0">
                    <CardHeader colors={colors} right={
                        <div className="flex items-center gap-2">
                            <HeaderMeta colors={colors}>{totalTeamMembers} people</HeaderMeta>
                            <button
                                type="button"
                                onClick={() => setShowAddPerson(true)}
                                className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-[0.93]"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${colors.accent}10` }}
                                aria-label="Add person"
                            >
                                <UserPlus className="w-[13px] h-[13px]" style={{ color: colors.accent }} />
                            </button>
                        </div>
                    }>
                        Team
                    </CardHeader>

                    <div ref={staffRef} className="relative px-5 py-2">
                        {teamSections.length === 0 ? (
                            <div className="py-3">
                                <p className="text-sm" style={{ color: colors.textSecondary, opacity: 0.75 }}>
                                    No team members yet.
                                </p>
                            </div>
                        ) : teamSections.map((section, sectionIndex) => {
                            return (
                                <div
                                    key={section.key}
                                    className={sectionIndex > 0 ? 'mt-3.5' : 'pt-0.5'}
                                >
                                    <div className="mb-1.5">
                                        <p
                                            className="text-[0.625rem] font-bold uppercase tracking-[0.08em]"
                                            style={{ color: colors.textSecondary, opacity: 0.5 }}
                                        >
                                            {section.title}
                                        </p>
                                    </div>

                                    {section.members.map((m, mi) => {
                                        const reward = rewardByName.get((m.name || '').trim().toLowerCase());
                                        return (
                                        <div
                                            key={m.name}
                                            className="flex items-center gap-3 py-2.5"
                                            style={{
                                                borderBottom: mi < section.members.length - 1 ? `1px solid ${rowBorder}` : 'none',
                                            }}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[0.6875rem] font-black"
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
                                                <p className="text-sm font-semibold truncate leading-snug" style={{ color: colors.textPrimary }}>
                                                    {m.name}
                                                </p>

                                                <div className="mt-0.5 flex items-center justify-between gap-2">
                                                    {m.status === 'pending' ? (
                                                        <span
                                                            className="inline-block text-[0.625rem] font-bold px-1.5 py-0.5 rounded-md"
                                                            style={{ backgroundColor: 'rgba(196,149,106,0.12)', color: '#C4956A' }}
                                                        >
                                                            Pending invite
                                                        </span>
                                                    ) : (
                                                        <p className="text-xs truncate leading-snug" style={{ color: colors.textSecondary, opacity: 0.6 }}>
                                                            {m.email}
                                                        </p>
                                                    )}

                                                    {reward && m.status !== 'pending' && (
                                                        <span
                                                            className="text-[0.6875rem] font-semibold tabular-nums whitespace-nowrap"
                                                            style={{ color: colors.textSecondary, opacity: 0.72 }}
                                                        >
                                                            {formatCurrencyCompact(reward.ytd)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Menu button */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleMenuOpen(e, m)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                                                style={{ color: colors.textSecondary, opacity: 0.35 }}
                                            >
                                                <MoreVertical className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )})}
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
                                            className="px-2 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.07em]"
                                            style={{ color: colors.textSecondary, opacity: 0.5 }}
                                        >
                                            Change Role
                                        </div>
                                        {ROLE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleUpdatePersonRole(menuState.person, opt.value)}
                                                className="w-full flex justify-between items-center text-left py-2 px-2 text-[0.8125rem] font-semibold rounded-xl transition-colors"
                                                style={{ color: menuState.person?.roleLabel === opt.value ? colors.accent : colors.textPrimary }}
                                            >
                                                <span>{opt.label}</span>
                                                {menuState.person?.roleLabel === opt.value && (
                                                    <CheckCircle className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                                                )}
                                            </button>
                                        ))}
                                        <div className="border-t my-1 mx-1" style={{ borderColor: rowBorder }} />
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePerson(menuState.person?.name)}
                                            className="w-full flex items-center gap-2 text-left py-2 px-2 text-[0.8125rem] font-semibold rounded-xl"
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
                <p className="text-[0.8125rem] mb-3" style={{ color: colors.textSecondary }}>
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
                                <span className="text-sm font-semibold">{opt}</span>
                                {isActive && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: colors.accent }} />}
                            </button>
                        );
                    })}
                </div>
            </Modal>

            {/* Confirm discount change */}
            <Modal show={!!pendingDiscount} onClose={() => setPendingDiscount(null)} title="Confirm Change" theme={theme}>
                <p className="text-sm" style={{ color: colors.textPrimary }}>
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
                        <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                            An invitation email will be sent.
                        </p>
                        <PrimaryButton type="submit" theme={theme} size="default" fullWidth>Send Invite</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
