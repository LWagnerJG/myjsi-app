import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Check, ChevronDown, Package, Plus } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { Modal } from '../../components/common/Modal.jsx';
import { PrimaryButton, SecondaryButton } from '../../components/common/JSIButtons.jsx';
import { FloatingActionCTA } from '../../components/common/FloatingActionCTA.jsx';
import { STANDARD_DISCOUNT_OPTIONS } from '../../constants/discounts.js';

const DEFAULT_DISCOUNT = '50/20 (60.00%)';

const parseListPrice = (str) => {
    if (typeof str === 'number') return str;
    return parseInt(String(str).replace(/[^0-9]/g, ''), 10) || 0;
};

// "50/20 (60.00%)" → 0.40  |  "50/20" → 0.40
const parseNetMultiplier = (discountOption) => {
    const paren = discountOption.match(/\((\d+\.?\d*)%\)/);
    if (paren) return 1 - parseFloat(paren[1]) / 100;
    const parts = discountOption.split('/').map(s => parseFloat(s));
    let net = 1;
    for (const p of parts) if (!isNaN(p)) net *= (1 - p / 100);
    return net;
};

const applyDiscount = (list, discountOption) =>
    Math.round(list * parseNetMultiplier(discountOption));

const shortDiscount = (opt) => opt.replace(/\s*\(.*\)/, '');

const formatCurrency = (value) => `$${value.toLocaleString()}`;

const formatNetRate = (discountOption) => {
    const netPercent = parseNetMultiplier(discountOption) * 100;
    const rounded = Math.round(netPercent * 100) / 100;
    return `${rounded.toFixed(Number.isInteger(rounded) ? 0 : 2)}% net`;
};

const AdvantageChip = ({ compPremium, theme }) => {
    const isParity = compPremium === 0;
    const jsiWins = compPremium > 0;

    return (
        <span
            className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tabular-nums"
            style={{
                background: isParity
                    ? theme.colors.subtle
                    : jsiWins
                        ? 'rgba(74,124,89,0.12)'
                        : 'rgba(184,92,92,0.12)',
                color: isParity
                    ? theme.colors.textSecondary
                    : jsiWins
                        ? '#4A7C59'
                        : '#B85C5C',
            }}
        >
            {isParity ? 'Parity' : `${compPremium > 0 ? '+' : ''}${compPremium}%`}
        </span>
    );
};

const MetaPill = ({ label, value, theme, accent = false }) => (
    <div
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{
            background: accent ? `${theme.colors.accent}10` : (theme.colors.surface || '#FFFFFF'),
            border: `1px solid ${accent ? `${theme.colors.accent}24` : theme.colors.border}`,
        }}
    >
        <span
            className="text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: theme.colors.textSecondary, opacity: 0.74 }}
        >
            {label}
        </span>
        <span className="text-[0.8125rem] font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>
            {value}
        </span>
    </div>
);

const DiscountTrigger = ({ value, onClick, theme }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-[0.98]"
        style={{
            background: theme.colors.surface || '#FFFFFF',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
        }}
    >
        <span
            className="text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: theme.colors.textSecondary, opacity: 0.74 }}
        >
            Disc
        </span>
        <span className="text-[0.8125rem] font-semibold leading-none">{shortDiscount(value)}</span>
        <ChevronDown className="h-3.5 w-3.5" style={{ color: theme.colors.textSecondary }} />
    </button>
);

const VersusList = ({ jsiProduct, competitors = [], theme, title }) => {
    const [jsiDiscount, setJsiDiscount] = useState(DEFAULT_DISCOUNT);
    const [compDiscounts, setCompDiscounts] = useState(() =>
        Object.fromEntries(competitors.map(c => [c.id, DEFAULT_DISCOUNT]))
    );
    const [discountTarget, setDiscountTarget] = useState(null);

    const compKey = competitors.map(c => c.id).join(',');
    useEffect(() => {
        setCompDiscounts(Object.fromEntries(competitors.map(c => [c.id, DEFAULT_DISCOUNT])));
        setJsiDiscount(DEFAULT_DISCOUNT);
        setDiscountTarget(null);
    }, [compKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const jsiList = jsiProduct.price || 0;
    const jsiNet = applyDiscount(jsiList, jsiDiscount);
    const activeDiscountValue = discountTarget === 'jsi'
        ? jsiDiscount
        : (discountTarget ? (compDiscounts[discountTarget] ?? DEFAULT_DISCOUNT) : DEFAULT_DISCOUNT);
    const activeDiscountName = discountTarget === 'jsi'
        ? jsiProduct.name
        : competitors.find((competitor) => competitor.id === discountTarget)?.name;

    const handleDiscountSelect = (nextValue) => {
        if (discountTarget === 'jsi') {
            setJsiDiscount(nextValue);
        } else if (discountTarget) {
            setCompDiscounts((prev) => ({ ...prev, [discountTarget]: nextValue }));
        }
        setDiscountTarget(null);
    };

    return (
        <>
            <GlassCard theme={theme} className="overflow-hidden p-0">
                <div className="px-5 pt-5 pb-3.5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2
                                className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em]"
                                style={{ color: theme.colors.textSecondary, opacity: 0.88 }}
                            >
                                {title}
                            </h2>
                            <p className="mt-1 text-[0.75rem] leading-tight" style={{ color: theme.colors.textSecondary, opacity: 0.72 }}>
                                Net comparison updates as you change discounts.
                            </p>
                        </div>
                        <span
                            className="pt-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
                            style={{ color: theme.colors.textSecondary, opacity: 0.58 }}
                        >
                            % Δ on net
                        </span>
                    </div>
                </div>

                <div className="px-4 pb-5 space-y-3">
                    <div
                        className="rounded-[24px] px-4 py-4"
                        style={{
                            background: `linear-gradient(180deg, ${theme.colors.accent}18 0%, ${theme.colors.accent}10 100%)`,
                            border: `1px solid ${theme.colors.accent}28`,
                            boxShadow: '0 10px 24px rgba(53,53,53,0.06)',
                        }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: theme.colors.accent }} />
                                    <span
                                        className="text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
                                        style={{ color: theme.colors.textSecondary, opacity: 0.78 }}
                                    >
                                        JSI benchmark
                                    </span>
                                </div>
                                <p className="mt-2 text-[1rem] font-semibold leading-tight" style={{ color: theme.colors.textPrimary }}>
                                    {jsiProduct.name}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <DiscountTrigger value={jsiDiscount} onClick={() => setDiscountTarget('jsi')} theme={theme} />
                                    <MetaPill label="List" value={formatCurrency(jsiList)} theme={theme} accent />
                                </div>
                            </div>

                            <div className="flex-shrink-0 text-right">
                                <p
                                    className="text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
                                    style={{ color: theme.colors.textSecondary, opacity: 0.6 }}
                                >
                                    Net
                                </p>
                                <p className="mt-1 text-[1.625rem] font-bold tabular-nums leading-none" style={{ color: theme.colors.textPrimary }}>
                                    {formatCurrency(jsiNet)}
                                </p>
                                <p className="mt-1 text-[0.75rem] font-medium" style={{ color: theme.colors.textSecondary, opacity: 0.72 }}>
                                    Comparison baseline
                                </p>
                            </div>
                        </div>
                    </div>

                    {competitors.length > 0 ? competitors.map((c) => {
                        const cList = parseListPrice(c.laminate);
                        const cDiscount = compDiscounts[c.id] ?? DEFAULT_DISCOUNT;
                        const cNet = applyDiscount(cList, cDiscount);
                        const compPremium = jsiNet > 0 ? Math.round(((cNet - jsiNet) / jsiNet) * 100) : 0;

                        return (
                            <div
                                key={c.id}
                                className="rounded-[22px] px-4 py-4"
                                style={{
                                    background: theme.colors.surface || '#FFFFFF',
                                    border: `1px solid ${theme.colors.border}`,
                                    boxShadow: '0 8px 20px rgba(53,53,53,0.04)',
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[0.9375rem] font-semibold leading-tight" style={{ color: theme.colors.textPrimary }}>
                                            {c.name}
                                        </p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <DiscountTrigger
                                                value={cDiscount}
                                                onClick={() => setDiscountTarget(c.id)}
                                                theme={theme}
                                            />
                                            <MetaPill label="List" value={formatCurrency(cList)} theme={theme} />
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 text-right">
                                        <p
                                            className="text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
                                            style={{ color: theme.colors.textSecondary, opacity: 0.58 }}
                                        >
                                            Net
                                        </p>
                                        <p className="mt-1 text-[1.25rem] font-bold tabular-nums leading-none" style={{ color: theme.colors.textPrimary }}>
                                            {formatCurrency(cNet)}
                                        </p>
                                        <div className="mt-2 flex justify-end">
                                            <AdvantageChip compPremium={compPremium} theme={theme} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="px-1 pb-1 text-xs" style={{ color: theme.colors.textSecondary }}>
                            No competitive data added yet.
                        </p>
                    )}
                </div>
            </GlassCard>

            <Modal
                show={!!discountTarget}
                onClose={() => setDiscountTarget(null)}
                title="Select Discount"
                theme={theme}
            >
                <div className="space-y-3">
                    <div
                        className="rounded-[20px] px-4 py-3"
                        style={{
                            background: theme.colors.subtle,
                            border: `1px solid ${theme.colors.border}`,
                        }}
                    >
                        <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {activeDiscountName || 'Series'}
                        </p>
                        <p className="mt-1 text-[0.75rem] leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                            This discount updates the net price and the competitor delta on this screen.
                        </p>
                    </div>

                    <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1 scrollbar-hide">
                        {STANDARD_DISCOUNT_OPTIONS.map((option) => {
                            const isSelected = option === activeDiscountValue;

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleDiscountSelect(option)}
                                    className="w-full rounded-[20px] px-4 py-3 text-left transition-all active:scale-[0.99]"
                                    style={{
                                        background: isSelected ? `${theme.colors.accent}10` : (theme.colors.surface || '#FFFFFF'),
                                        border: `1px solid ${isSelected ? `${theme.colors.accent}2E` : theme.colors.border}`,
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[0.9375rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                {shortDiscount(option)}
                                            </p>
                                            <p className="mt-1 text-[0.75rem]" style={{ color: theme.colors.textSecondary }}>
                                                {formatNetRate(option)}
                                            </p>
                                        </div>
                                        {isSelected ? <Check className="h-4 w-4 flex-shrink-0" style={{ color: theme.colors.accent }} /> : null}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export const CompetitiveAnalysisScreen = ({ categoryId, productId, theme }) => {
    const [showRequest, setShowRequest] = useState(false);
    const [formState, setFormState] = useState({ manufacturer: '', series: '', notes: '' });
    const [submitted, setSubmitted] = useState(false);

    const categoryData = PRODUCT_DATA?.[categoryId];
    if (!categoryData) return (
        <div className="p-4">
            <GlassCard theme={theme} className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
                <p style={{ color: theme.colors.textPrimary }}>Category Not Found</p>
            </GlassCard>
        </div>
    );

    const product = categoryData.products?.find(p => p.id === productId) || categoryData.products?.[0];
    const perProductList = categoryData.competitionByProduct?.[product?.id] || [];
    const categoryFallback = categoryData.competition || [];
    const firstMappedCompetition = Object.values(categoryData.competitionByProduct || {})[0] || [];
    const categoryCompetitors = categoryFallback.length ? categoryFallback : firstMappedCompetition;

    const handleChange = (e) => setFormState(s => ({ ...s, [e.target.name]: e.target.value }));
    const canSubmit = formState.manufacturer.trim() && formState.series.trim();
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitted(true);
        setTimeout(() => {
            setShowRequest(false);
            setSubmitted(false);
            setFormState({ manufacturer: '', series: '', notes: '' });
        }, 1200);
    };

    return (
        <div className="flex flex-col h-full app-header-offset">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-6 pb-32 max-w-content mx-auto">
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm" style={{ background: theme.colors.surface }}>
                        <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h1 className="text-xl sm:text-2xl font-semibold text-white drop-shadow-sm tracking-tight">
                                {product.name} Competitive Analysis
                            </h1>
                        </div>
                    </div>
                    <VersusList
                        jsiProduct={product}
                        competitors={perProductList.length ? perProductList : categoryCompetitors}
                        theme={theme}
                        title={perProductList.length ? 'Versus Competitors' : 'Versus Competitors (Category)'}
                    />
                </div>
            </div>
            <FloatingActionCTA
                theme={theme}
                onClick={() => setShowRequest(true)}
                icon={<Plus />}
                label="Request Competitor"
            />
            <Modal show={showRequest} onClose={() => setShowRequest(false)} title="Request Competitor" theme={theme}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Manufacturer</label>
                        <input
                            name="manufacturer"
                            value={formState.manufacturer}
                            onChange={handleChange}
                            placeholder="e.g. Kimball"
                            className="w-full px-3 py-2 rounded-lg text-sm font-medium"
                            style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Series / Product</label>
                        <input
                            name="series"
                            value={formState.series}
                            onChange={handleChange}
                            placeholder="e.g. Joya"
                            className="w-full px-3 py-2 rounded-lg text-sm font-medium"
                            style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Notes (optional)</label>
                        <textarea
                            name="notes"
                            value={formState.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Any context or price info..."
                            className="w-full px-3 py-2 rounded-lg text-sm font-medium resize-none"
                            style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowRequest(false)}
                            theme={theme}
                            className="h-10 !py-0 px-5 text-[0.8125rem] border"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!canSubmit || submitted}
                            theme={theme}
                            className="h-10 !py-0 px-6 text-[0.8125rem] disabled:cursor-not-allowed"
                        >
                            {submitted ? 'Sent!' : 'Submit'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
