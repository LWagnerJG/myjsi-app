import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { motion } from 'framer-motion';
import { ChevronRight, Building2, UserPlus, Check, Award } from 'lucide-react';
import { DEALER_DIRECTORY_DATA, getChoiceProgram } from './data.js';
import { DAILY_DISCOUNT_OPTIONS } from '../../../constants/discounts.js';
import { isDarkTheme, subtleBg } from '../../../design-system/tokens.js';
import { formatCurrency, formatCurrencyCompact } from '../../../utils/format.js';
import { ScreenTopChrome } from '../../../components/common/ScreenTopChrome.jsx';

const stagger = (i) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, delay: i * 0.025, ease: [0.25, 0.1, 0.25, 1] } },
});

const goalTone = (pct) => pct >= 80 ? '#4A7C59' : pct >= 50 ? '#C4956A' : '#B85C5C';

const EMPTY_FORM = { companyName: '', adminEmail: '', dailyDiscount: '' };

const ChoiceBadge = ({ program, compact = false }) => (
    <span
        className={`inline-flex items-center rounded-full font-bold uppercase tracking-[0.06em] ${compact ? 'px-1.5 py-[1px] text-[0.5625rem]' : 'px-2 py-0.5 text-[0.625rem]'}`}
        style={{ color: program.color, backgroundColor: `${program.color}1A` }}
    >
        {program.label}
    </span>
);

const MiniProgress = ({ percent, tone, isDark }) => (
    <div
        className="w-14 rounded-full overflow-hidden"
        style={{ height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)' }}
        aria-hidden="true"
    >
        <div className="h-full rounded-full" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: tone }} />
    </div>
);

const DealerRow = ({ dealer, i, last, colors, isDark, rowBorder, onNavigate, choiceMode }) => {
    const program = getChoiceProgram(dealer);
    const salesPct = dealer.ytdGoal ? Math.round((dealer.sales / dealer.ytdGoal) * 100) : null;
    const displayPct = choiceMode ? (program?.percent ?? null) : salesPct;
    const gColor = displayPct !== null ? (choiceMode && program ? program.color : goalTone(displayPct)) : null;
    const initials = dealer.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const secondaryLine = dealer.territory || dealer.dailyDiscount || 'No territory assigned';

    return (
        <motion.button
            {...stagger(i)}
            onClick={() => onNavigate?.(`resources/dealer-directory/${dealer.id}`)}
            className="w-full text-left flex items-center gap-3.5 px-4 transition-colors active:opacity-75"
            style={{
                paddingTop: 12,
                paddingBottom: 12,
                borderBottom: last ? 'none' : `1px solid ${rowBorder}`,
            }}
        >
            <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[0.6875rem] font-black"
                style={{ backgroundColor: `${colors.accent}12`, color: colors.accent }}
            >
                {initials}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-[0.875rem] font-bold tracking-tight truncate leading-snug" style={{ color: colors.textPrimary }}>
                        {dealer.name}
                    </p>
                    {program && !choiceMode ? <ChoiceBadge program={program} compact /> : null}
                </div>
                <p className="text-[0.6875rem] truncate mt-0.5 leading-snug" style={{ color: colors.textSecondary, opacity: 0.65 }}>
                    {secondaryLine}
                </p>
            </div>

            <div className="flex flex-col items-end flex-shrink-0 gap-1">
                {choiceMode && program ? (
                    <>
                        <span className="text-[0.8125rem] font-black tabular-nums leading-none" style={{ color: colors.textPrimary }}>
                            {formatCurrencyCompact(program.rebatableSales)}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <MiniProgress percent={program.percent} tone={program.color} isDark={isDark} />
                            <span
                                className="text-[0.625rem] font-bold tabular-nums px-1.5 py-[1px] rounded-full"
                                style={{ color: program.color, backgroundColor: `${program.color}1A` }}
                            >
                                {program.percent}%
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="text-[0.8125rem] font-black tabular-nums leading-none" style={{ color: colors.textPrimary }}>
                            {formatCurrency(dealer.sales)}
                        </span>
                        {displayPct !== null && (
                            <span
                                className="text-[0.625rem] font-bold tabular-nums mt-0.5 px-1.5 py-[1px] rounded-full"
                                style={{ color: gColor, backgroundColor: `${gColor}1A` }}
                            >
                                {displayPct}%
                            </span>
                        )}
                    </>
                )}
            </div>

            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.22 }} />
        </motion.button>
    );
};

export const DealerDirectoryScreen = ({ theme, dealerDirectory, setDealerDirectory, onNavigate, setSuccessMessage }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
    const [searchTerm, setSearchTerm] = useState('');
    const [choiceOnly, setChoiceOnly] = useState(false);
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

    /* ── Add dealer modal state ── */
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const canSubmit = !!(form.companyName.trim() && form.adminEmail.trim() && form.dailyDiscount);

    const handleFormChange = useCallback((field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddDealer = useCallback(() => {
        if (!canSubmit) return;
        const newDealer = {
            id: Date.now(),
            name: form.companyName.trim(),
            address: '',
            phone: '',
            territory: '',
            salespeople: [{ name: 'Admin', email: form.adminEmail.trim(), status: 'active', roleLabel: 'Admin' }],
            designers: [],
            administration: [],
            installers: [],
            dailyDiscount: form.dailyDiscount,
            bookings: 0,
            sales: 0,
            ytdGoal: 0,
            rebatableGoal: 0,
            rebatableSales: 0,
            verticalSales: [],
            seriesSales: [],
            monthlyTrend: [],
            recentProjects: [],
            repRewards: [],
        };
        setDealerDirectory?.(prev => [...prev, newDealer]);
        setShowAddModal(false);
        setForm(EMPTY_FORM);
        setSuccessMessage?.('Dealer Added');
        setTimeout(() => setSuccessMessage?.(''), 1500);
    }, [canSubmit, form, setDealerDirectory, setSuccessMessage]);

    const sorted = useMemo(() => dealers
        .filter(d => {
            if (!searchTerm) return true;
            const q = searchTerm.toLowerCase();
            return d.name.toLowerCase().includes(q) ||
                (d.address && d.address.toLowerCase().includes(q)) ||
                (d.territory && d.territory.toLowerCase().includes(q));
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [dealers, searchTerm]);

    const choiceGroups = useMemo(() => {
        const members = sorted.filter(d => getChoiceProgram(d));
        const platinum = members.filter(d => getChoiceProgram(d)?.id === 'platinum');
        const gold = members.filter(d => getChoiceProgram(d)?.id === 'gold');
        return { platinum, gold, count: members.length };
    }, [sorted]);

    const rowBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
    const listEmpty = choiceOnly ? choiceGroups.count === 0 : sorted.length === 0;

    const renderGroup = (label, color, rows, startIndex, isLastGroup) => {
        if (!rows.length) return null;
        return (
            <div key={label}>
                <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
                    <span
                        className="text-[0.625rem] font-bold uppercase tracking-[0.08em]"
                        style={{ color, opacity: 0.9 }}
                    >
                        {label}
                    </span>
                    <span className="text-[0.625rem] font-semibold tabular-nums" style={{ color: colors.textSecondary, opacity: 0.45 }}>
                        {rows.length}
                    </span>
                </div>
                {rows.map((d, i) => (
                    <DealerRow
                        key={d.id}
                        dealer={d}
                        i={startIndex + i}
                        last={isLastGroup && i === rows.length - 1}
                        colors={colors}
                        isDark={isDark}
                        rowBorder={rowBorder}
                        onNavigate={onNavigate}
                        choiceMode
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: colors.background }}>

            <ScreenTopChrome theme={theme} contentClassName="pt-2 pb-3 space-y-2.5">
                <div className="flex items-start justify-between gap-3 px-0 pt-1">
                    <div className="min-w-0">
                        <h1
                            className="text-[1.625rem] font-black tracking-[-0.03em] leading-tight"
                            style={{ color: colors.textPrimary }}
                        >
                            Dealers
                        </h1>
                        {choiceOnly ? (
                            <p className="mt-0.5 text-[0.75rem] font-medium" style={{ color: colors.textSecondary, opacity: 0.7 }}>
                                Choice · Platinum and Gold
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setChoiceOnly(v => !v)}
                            aria-pressed={choiceOnly}
                            className="flex items-center gap-1.5 rounded-full px-3.5 h-9 text-[0.8125rem] font-semibold transition-all active:scale-[0.97] focus-ring"
                            style={choiceOnly ? {
                                backgroundColor: '#5B7B8C',
                                color: '#FFFFFF',
                                boxShadow: isDark ? 'none' : '0 6px 14px rgba(91,123,140,0.28)',
                            } : {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                                color: colors.textPrimary,
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.08)'}`,
                            }}
                        >
                            <Award className="w-3.5 h-3.5" aria-hidden="true" />
                            Choice
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 rounded-full px-3.5 h-9 text-[0.8125rem] font-semibold transition-all active:scale-[0.97] focus-ring"
                            style={{
                                backgroundColor: colors.accent,
                                color: colors.accentText,
                                boxShadow: isDark ? 'none' : '0 6px 14px rgba(53,53,53,0.16)',
                            }}
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Add
                        </button>
                    </div>
                </div>
                <StandardSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={choiceOnly ? 'Search Choice dealers...' : 'Search dealers...'}
                    theme={theme}
                    className="w-full"
                />
            </ScreenTopChrome>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-8">
                <div className="max-w-content mx-auto w-full pt-1">
                {!listEmpty ? (
                    <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                        {choiceOnly ? (
                            <>
                                {renderGroup('Platinum', '#5B7B8C', choiceGroups.platinum, 0, choiceGroups.gold.length === 0)}
                                {renderGroup('Gold', '#C4956A', choiceGroups.gold, choiceGroups.platinum.length, true)}
                            </>
                        ) : (
                            sorted.map((d, i) => (
                                <DealerRow
                                    key={d.id}
                                    dealer={d}
                                    i={i}
                                    last={i === sorted.length - 1}
                                    colors={colors}
                                    isDark={isDark}
                                    rowBorder={rowBorder}
                                    onNavigate={onNavigate}
                                    choiceMode={false}
                                />
                            ))
                        )}
                    </GlassCard>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: subtleBg(theme, 1.2) }}
                        >
                            {choiceOnly
                                ? <Award className="w-6 h-6" style={{ color: colors.textSecondary, opacity: 0.35 }} />
                                : <Building2 className="w-6 h-6" style={{ color: colors.textSecondary, opacity: 0.35 }} />}
                        </div>
                        <p className="text-[0.9375rem] font-bold" style={{ color: colors.textPrimary }}>
                            {choiceOnly ? 'No Choice dealers found' : 'No dealers found'}
                        </p>
                        <p className="text-[0.8125rem]" style={{ color: colors.textSecondary, opacity: 0.7 }}>
                            {choiceOnly ? 'Platinum and Gold partners will appear here.' : 'Try a different search term.'}
                        </p>
                    </div>
                )}
                </div>
            </div>

            <Modal show={showAddModal} onClose={() => { setShowAddModal(false); setForm(EMPTY_FORM); }} title="New Dealer" theme={theme}>
                <div className="px-5 pb-5 pt-1 space-y-4">
                    <div>
                        <label className="block text-[0.75rem] font-semibold mb-1.5 px-0.5" style={{ color: colors.textSecondary }}>
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={form.companyName}
                            onChange={(e) => handleFormChange('companyName', e.target.value)}
                            placeholder="Registered company name"
                            className="w-full outline-none text-[0.875rem]"
                            style={{
                                height: 44,
                                padding: '0 14px',
                                borderRadius: 12,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                                color: colors.textPrimary,
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-[0.75rem] font-semibold mb-1.5 px-0.5" style={{ color: colors.textSecondary }}>
                            Admin Email
                        </label>
                        <input
                            type="email"
                            value={form.adminEmail}
                            onChange={(e) => handleFormChange('adminEmail', e.target.value)}
                            placeholder="Primary contact email"
                            className="w-full outline-none text-[0.875rem]"
                            style={{
                                height: 44,
                                padding: '0 14px',
                                borderRadius: 12,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                                color: colors.textPrimary,
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-[0.75rem] font-semibold mb-1.5 px-0.5" style={{ color: colors.textSecondary }}>
                            Daily Discount
                        </label>
                        <div
                            className="w-full overflow-y-auto scrollbar-hide"
                            style={{
                                maxHeight: 180,
                                borderRadius: 12,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                            }}
                        >
                            {DAILY_DISCOUNT_OPTIONS.filter(o => o !== 'Undecided').map((opt) => {
                                const isSelected = form.dailyDiscount === opt;
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleFormChange('dailyDiscount', opt)}
                                        className="w-full text-left flex items-center justify-between px-3.5 py-2.5 text-[0.8125rem] transition-colors"
                                        style={{
                                            color: isSelected ? colors.accent : colors.textPrimary,
                                            fontWeight: isSelected ? 700 : 400,
                                            backgroundColor: isSelected ? `${colors.accent}10` : 'transparent',
                                        }}
                                    >
                                        <span className="truncate">{opt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.accent }} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddDealer}
                        disabled={!canSubmit}
                        className="w-full rounded-xl py-3 text-[0.875rem] font-bold transition-all active:scale-[0.98]"
                        style={{
                            backgroundColor: canSubmit ? colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                            color: canSubmit ? (colors.accentText || '#fff') : colors.textSecondary,
                            opacity: canSubmit ? 1 : 0.5,
                        }}
                    >
                        Add Dealer
                    </button>
                </div>
            </Modal>
        </div>
    );
};
