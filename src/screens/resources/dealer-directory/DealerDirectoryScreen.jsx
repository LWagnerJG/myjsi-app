import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { motion } from 'framer-motion';
import { ChevronRight, Building2, UserPlus, ChevronDown, Check } from 'lucide-react';
import { DEALER_DIRECTORY_DATA } from './data.js';
import { DAILY_DISCOUNT_OPTIONS } from '../../../constants/discounts.js';
import { isDarkTheme, subtleBg, DESIGN_TOKENS } from '../../../design-system/tokens.js';
import { formatCurrency } from '../../../utils/format.js';
import { ScreenTopChrome } from '../../../components/common/ScreenTopChrome.jsx';
import { UNIFIED_MODAL_Z } from '../../../components/common/modalUtils.js';

const stagger = (i) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, delay: i * 0.025, ease: [0.25, 0.1, 0.25, 1] } },
});

const goalTone = (pct) => pct >= 80 ? '#4A7C59' : pct >= 50 ? '#C4956A' : '#B85C5C';

export const DealerDirectoryScreen = ({ theme, dealerDirectory, setDealerDirectory, onNavigate, setSuccessMessage }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
    const [searchTerm, setSearchTerm] = useState('');
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

    /* ── Add dealer modal state ── */
    const [showAddModal, setShowAddModal] = useState(false);
    const EMPTY_FORM = { companyName: '', adminEmail: '', dailyDiscount: '' };
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

    const totalSales = useMemo(() => dealers.reduce((s, d) => s + (d.sales || 0), 0), [dealers]);
    const rowBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: colors.background }}>

            <ScreenTopChrome theme={theme} maxWidthClass="" horizontalPaddingClass="px-4" contentClassName="pt-3 pb-3">
                <PageTitle
                    title="Dealers"
                    subtitle={`${dealers.length} accounts \u00B7 ${formatCurrency(totalSales)}`}
                    theme={theme}
                    className="px-0 pt-0 pb-0"
                    titleClassName="text-[1.625rem] font-black tracking-[-0.03em]"
                    subtitleClassName="text-[0.8125rem] mt-0.5"
                >
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 rounded-full px-3.5 h-9 text-[0.8125rem] font-semibold transition-all active:scale-[0.97] flex-shrink-0"
                        style={{ backgroundColor: colors.accent, color: colors.accentText }}
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add
                    </button>
                </PageTitle>
                <StandardSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search dealers..."
                    theme={theme}
                    className="w-full"
                />
            </ScreenTopChrome>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-10">
                {sorted.length > 0 ? (
                    <div
                        className="rounded-[20px] overflow-hidden"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.surface,
                            boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                        }}
                    >
                        {sorted.map((d, i) => {
                            const pct = d.ytdGoal ? Math.round((d.sales / d.ytdGoal) * 100) : null;
                            const gColor = pct !== null ? goalTone(pct) : null;
                            const initials = d.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

                            return (
                                <motion.button
                                    key={d.id}
                                    {...stagger(i)}
                                    onClick={() => onNavigate?.(`resources/dealer-directory/${d.id}`)}
                                    className="w-full text-left flex items-center gap-3 px-4 transition-colors active:bg-black/[0.02]"
                                    style={{
                                        paddingTop: 13,
                                        paddingBottom: 13,
                                        borderBottom: i < sorted.length - 1 ? `1px solid ${rowBorder}` : 'none',
                                    }}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[0.6875rem] font-black"
                                        style={{ backgroundColor: `${colors.accent}12`, color: colors.accent }}
                                    >
                                        {initials}
                                    </div>

                                    {/* Name + territory */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[0.875rem] font-bold tracking-tight truncate leading-snug" style={{ color: colors.textPrimary }}>
                                            {d.name}
                                        </p>
                                        <p className="text-[0.6875rem] truncate mt-0.5 leading-snug" style={{ color: colors.textSecondary, opacity: 0.65 }}>
                                            {d.territory || d.address || d.dailyDiscount || ''}
                                        </p>
                                    </div>

                                    {/* Sales + goal bar */}
                                    <div className="flex flex-col items-end flex-shrink-0 gap-1">
                                        <span className="text-[0.8125rem] font-black tabular-nums leading-none" style={{ color: colors.textPrimary }}>
                                            {formatCurrency(d.sales)}
                                        </span>
                                        {pct !== null && (
                                            <div className="flex items-center gap-1.5">
                                                <div
                                                    className="w-12 rounded-full overflow-hidden"
                                                    style={{ height: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
                                                >
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: gColor }}
                                                    />
                                                </div>
                                                <span className="text-[0.625rem] font-bold tabular-nums" style={{ color: gColor, minWidth: 26, textAlign: 'right' }}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.18 }} />
                                </motion.button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: subtleBg(theme, 1.2) }}
                        >
                            <Building2 className="w-6 h-6" style={{ color: colors.textSecondary, opacity: 0.35 }} />
                        </div>
                        <p className="text-[0.9375rem] font-bold" style={{ color: colors.textPrimary }}>No dealers found</p>
                        <p className="text-[0.8125rem]" style={{ color: colors.textSecondary, opacity: 0.7 }}>Try a different search term.</p>
                    </div>
                )}
            </div>

            {/* ── Add Dealer Modal ── */}
            <Modal show={showAddModal} onClose={() => { setShowAddModal(false); setForm(EMPTY_FORM); }} title="New Dealer" theme={theme}>
                <div className="px-5 pb-5 pt-1 space-y-4">
                    {/* Company Name */}
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

                    {/* Admin Email */}
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

                    {/* Daily Discount — inline scrollable picker */}
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

                    {/* Submit */}
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
