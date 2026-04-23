import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Package, Plus } from 'lucide-react';
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

const AdvantageChip = ({ compPremium }) => {
    if (compPremium === 0) return (
        <span className="text-[0.6875rem] font-medium px-2 py-0.5 rounded-full tabular-nums"
            style={{ background: 'rgba(0,0,0,0.06)', color: '#888' }}>
            parity
        </span>
    );
    const jsiWins = compPremium > 0;
    return (
        <span className="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full tabular-nums"
            style={{
                background: jsiWins ? 'rgba(74,124,89,0.13)' : 'rgba(184,92,92,0.12)',
                color: jsiWins ? '#4A7C59' : '#B85C5C',
            }}>
            {compPremium > 0 ? `+${compPremium}%` : `${compPremium}%`}
        </span>
    );
};

const DiscountPicker = ({ value, onChange, theme }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-[0.625rem] font-semibold rounded-full cursor-pointer focus:outline-none transition-colors appearance-none"
        style={{
            background: theme.colors.surface,
            color: theme.colors.textSecondary,
            border: `1px solid ${theme.colors.border}`,
            padding: '2px 8px 2px 6px',
        }}
    >
        {STANDARD_DISCOUNT_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{shortDiscount(opt)}</option>
        ))}
    </select>
);

const VersusList = ({ jsiProduct, competitors = [], theme, title }) => {
    const [jsiDiscount, setJsiDiscount] = useState(DEFAULT_DISCOUNT);
    const [compDiscounts, setCompDiscounts] = useState(() =>
        Object.fromEntries(competitors.map(c => [c.id, DEFAULT_DISCOUNT]))
    );

    const compKey = competitors.map(c => c.id).join(',');
    useEffect(() => {
        setCompDiscounts(Object.fromEntries(competitors.map(c => [c.id, DEFAULT_DISCOUNT])));
        setJsiDiscount(DEFAULT_DISCOUNT);
    }, [compKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const jsiList = jsiProduct.price || 0;
    const jsiNet = applyDiscount(jsiList, jsiDiscount);

    return (
        <GlassCard theme={theme} className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <h2 className="text-[0.6875rem] font-semibold tracking-widest uppercase"
                    style={{ color: theme.colors.textSecondary }}>
                    {title}
                </h2>
                <span className="text-[0.625rem] font-medium"
                    style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
                    % Δ on net
                </span>
            </div>

            {/* JSI hero row */}
            <div className="mx-4 mb-3 rounded-2xl px-4 py-3.5"
                style={{
                    background: `${theme.colors.accent}14`,
                    border: `1.5px solid ${theme.colors.accent}30`,
                }}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: theme.colors.accent }} />
                        <div className="min-w-0">
                            <p className="font-semibold text-[0.9375rem] leading-tight"
                                style={{ color: theme.colors.textPrimary }}>
                                {jsiProduct.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <DiscountPicker value={jsiDiscount} onChange={setJsiDiscount} theme={theme} />
                                <span className="text-[0.6875rem] tabular-nums"
                                    style={{ color: theme.colors.textSecondary }}>
                                    ${jsiList.toLocaleString()} list
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <p className="text-[1.25rem] font-bold tabular-nums leading-none"
                            style={{ color: theme.colors.textPrimary }}>
                            ${jsiNet.toLocaleString()}
                        </p>
                        <p className="text-[0.625rem] font-medium mt-0.5"
                            style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                            net
                        </p>
                    </div>
                </div>
            </div>

            {/* Competitor rows */}
            {competitors.length > 0 ? (
                <div className="px-4 pb-5 space-y-2">
                    {competitors.map(c => {
                        const cList = parseListPrice(c.laminate);
                        const cDiscount = compDiscounts[c.id] ?? DEFAULT_DISCOUNT;
                        const cNet = applyDiscount(cList, cDiscount);
                        // positive = competitor costs MORE than JSI = JSI advantage (green)
                        // negative = competitor costs LESS than JSI = competitor advantage (red)
                        const compPremium = jsiNet > 0 ? Math.round((cNet - jsiNet) / jsiNet * 100) : 0;

                        return (
                            <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                                style={{
                                    background: theme.colors.subtle,
                                    border: `1px solid ${theme.colors.border}`,
                                }}>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[0.875rem] font-medium leading-tight"
                                        style={{ color: theme.colors.textPrimary }}>
                                        {c.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <DiscountPicker
                                            value={cDiscount}
                                            onChange={v => setCompDiscounts(prev => ({ ...prev, [c.id]: v }))}
                                            theme={theme}
                                        />
                                        <span className="text-[0.6875rem] tabular-nums"
                                            style={{ color: theme.colors.textSecondary }}>
                                            ${cList.toLocaleString()} list
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                                    <p className="text-[1.0625rem] font-bold tabular-nums leading-none"
                                        style={{ color: theme.colors.textPrimary }}>
                                        ${cNet.toLocaleString()}
                                    </p>
                                    <AdvantageChip compPremium={compPremium} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="px-5 pb-5 text-xs" style={{ color: theme.colors.textSecondary }}>
                    No competitive data added yet.
                </p>
            )}
        </GlassCard>
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
