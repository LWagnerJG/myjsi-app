import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Check, ChevronDown, Package, Plus } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { Modal } from '../../components/common/Modal.jsx';
import { PrimaryButton, SecondaryButton } from '../../components/common/JSIButtons.jsx';
import { FloatingActionCTA } from '../../components/common/FloatingActionCTA.jsx';
import { STANDARD_DISCOUNT_OPTIONS } from '../../constants/discounts.js';
import { isDarkTheme } from '../../design-system/tokens.js';
import { persistCompetitiveDiscountRecord, submitCompetitiveDiscountRecord } from '../../utils/competitiveDiscountBank.js';

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

const calculateCompetitiveDelta = (baselineNet, comparisonNet) => {
    if (baselineNet <= 0) return 0;
    return Math.round(((comparisonNet - baselineNet) / baselineNet) * 100);
};

const shortDiscount = (opt) => opt.replace(/\s*\(.*\)/, '');

const formatCurrency = (value) => `$${value.toLocaleString()}`;

const formatPercentValue = (value) => {
    const rounded = Math.round(value * 100) / 100;
    return `${rounded.toFixed(Number.isInteger(rounded) ? 0 : 2)}%`;
};

const getOffListPercent = (discountOption) => (1 - parseNetMultiplier(discountOption)) * 100;

const normalizeDiscountSegment = (value) => {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.0+$|0+$/, '').replace(/\.$/, '');
};

const buildDiscountOptionFromSegments = (segments) => {
    const chain = segments.map(normalizeDiscountSegment).join('/');
    const netMultiplier = segments.reduce((net, segment) => net * (1 - segment / 100), 1);
    const offListPercent = (1 - netMultiplier) * 100;
    return `${chain} (${offListPercent.toFixed(2)}%)`;
};

const parseCustomDiscountInput = (rawValue) => {
    const value = String(rawValue || '').trim();
    if (!value) {
        return { error: 'Enter a discount like 50/20/5' };
    }

    const normalized = value.replace(/\s+/g, '').replace(/%/g, '');
    if (!/^\d+(\.\d+)?(\/\d+(\.\d+)?)*$/.test(normalized)) {
        return { error: 'Use numbers separated by /' };
    }

    const segments = normalized.split('/').map(Number);
    if (segments.some((segment) => !Number.isFinite(segment) || segment <= 0 || segment >= 100)) {
        return { error: 'Each number must be between 0 and 100' };
    }

    const option = buildDiscountOptionFromSegments(segments);
    return {
        option,
        normalizedInput: segments.map(normalizeDiscountSegment).join('/'),
        offListPercent: getOffListPercent(option),
        netPercent: parseNetMultiplier(option) * 100,
    };
};

const formatNetRate = (discountOption) => {
    const netPercent = parseNetMultiplier(discountOption) * 100;
    return `${formatPercentValue(netPercent)} net`;
};

const DiscountPill = ({ discount, theme, dark, accent = false, open = false, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold transition-all active:scale-[0.97]"
        style={{
            backgroundColor: accent
                ? (dark ? 'rgba(255,255,255,0.14)' : `${theme.colors.accent}12`)
                : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.06)'),
            color: theme.colors.textPrimary,
        }}
    >
        <span style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Discount</span>
        <span className="tabular-nums">{shortDiscount(discount)}</span>
        <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
            style={{ color: theme.colors.textSecondary, opacity: 0.82 }}
        />
    </button>
);

const PriceMetaLine = ({ discount, listPrice, theme, dark, accent = false, open = false, onDiscountClick }) => (
    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[0.75rem] leading-none"
        style={{ color: theme.colors.textSecondary, opacity: accent ? 0.9 : 0.88 }}>
        <span className="tabular-nums">{formatCurrency(listPrice)} list</span>
        <DiscountPill
            discount={discount}
            theme={theme}
            dark={dark}
            accent={accent}
            open={open}
            onClick={onDiscountClick}
        />
    </div>
);

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

const CompactDiscountMenu = ({ theme, anchorEl, open, value, onSelect, onClose }) => {
    const dark = isDarkTheme(theme);
    const menuRef = useRef(null);
    const [position, setPosition] = useState(null);
    const [dropUp, setDropUp] = useState(false);
    const [customDiscount, setCustomDiscount] = useState('');
    const [customError, setCustomError] = useState('');

    useEffect(() => {
        if (!open) return;
        setCustomDiscount(STANDARD_DISCOUNT_OPTIONS.includes(value) ? '' : shortDiscount(value));
        setCustomError('');
    }, [open, value]);

    const recalcPosition = useCallback(() => {
        if (!anchorEl) return;

        const rect = anchorEl.getBoundingClientRect();
        const estimatedHeight = 344;
        const menuWidth = Math.max(Math.min(rect.width + 52, 280), 236);
        const viewportPad = 12;
        const chrome = document.querySelector('[data-bottom-chrome]');
        const bottomOccupied = chrome ? (window.innerHeight - chrome.getBoundingClientRect().top) : 0;
        const openAbove = window.innerHeight - rect.bottom - bottomOccupied < estimatedHeight && rect.top > estimatedHeight;

        setDropUp(openAbove);
        setPosition({
            top: openAbove ? rect.top - 8 : rect.bottom + 8,
            left: Math.min(Math.max(viewportPad, rect.left), window.innerWidth - menuWidth - viewportPad),
            width: menuWidth,
        });
    }, [anchorEl]);

    useEffect(() => {
        if (!open || !anchorEl) return;

        recalcPosition();

        const handleOutside = (event) => {
            if (anchorEl?.contains(event.target)) return;
            if (menuRef.current?.contains(event.target)) return;
            onClose?.();
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') onClose?.();
        };

        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside, { passive: true });
        document.addEventListener('keydown', handleEscape);
        window.addEventListener('resize', recalcPosition);
        window.addEventListener('scroll', recalcPosition, true);

        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('resize', recalcPosition);
            window.removeEventListener('scroll', recalcPosition, true);
        };
    }, [open, anchorEl, onClose, recalcPosition]);

    if (!open || !position) return null;

    const customPreview = customDiscount.trim() ? parseCustomDiscountInput(customDiscount) : null;
    const canApplyCustom = !!customPreview && !customPreview.error;

    const handleCustomSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const parsed = parseCustomDiscountInput(customDiscount);
        if (parsed.error) {
            setCustomError(parsed.error);
            return;
        }

        onSelect(parsed.option, {
            source: 'custom',
            rawInput: parsed.normalizedInput,
            offListPercent: parsed.offListPercent,
            netPercent: parsed.netPercent,
        });
    };

    return createPortal(
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                width: position.width,
                zIndex: 1200,
                transform: dropUp ? 'translateY(-100%)' : 'none',
            }}
        >
            <div
                className="overflow-hidden rounded-[20px]"
                style={{
                    backgroundColor: dark ? 'rgba(34,34,34,0.96)' : 'rgba(252,250,248,0.98)',
                    boxShadow: dark ? '0 18px 44px rgba(0,0,0,0.42)' : '0 14px 34px rgba(53,53,53,0.12)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                }}
            >
                <div className="max-h-[224px] overflow-y-auto scrollbar-hide py-1.5" role="listbox">
                    {STANDARD_DISCOUNT_OPTIONS.map((option) => {
                        const isSelected = option === value;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => onSelect(option, { source: 'standard' })}
                                className="w-full px-3.5 py-2.5 text-left transition-colors active:scale-[0.99]"
                                style={{
                                    backgroundColor: isSelected
                                        ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.06)')
                                        : 'transparent',
                                }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[0.875rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                                            {shortDiscount(option)}
                                        </p>
                                        <p className="mt-0.5 text-[0.7rem]" style={{ color: theme.colors.textSecondary }}>
                                            {formatNetRate(option)}
                                        </p>
                                    </div>
                                    {isSelected ? <Check className="h-4 w-4 flex-shrink-0" style={{ color: theme.colors.accent }} /> : null}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div
                    className="border-t px-3 py-3"
                    style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.08)' }}
                >
                    <p
                        className="text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
                        style={{ color: theme.colors.textSecondary, opacity: 0.74 }}
                    >
                        Custom discount
                    </p>
                    <form onSubmit={handleCustomSubmit} className="mt-2.5 space-y-2">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={customDiscount}
                            onChange={(event) => {
                                setCustomDiscount(event.target.value);
                                if (customError) setCustomError('');
                            }}
                            placeholder="50/20/5"
                            aria-label="Custom discount"
                            className="w-full rounded-[14px] px-3 py-2 text-[0.8rem] font-medium outline-none"
                            style={{
                                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.05)',
                                color: theme.colors.textPrimary,
                            }}
                        />
                        <div className="flex items-center justify-between gap-2">
                            <p
                                className="min-w-0 text-[0.67rem] leading-snug"
                                style={{
                                    color: customError
                                        ? '#B85C5C'
                                        : theme.colors.textSecondary,
                                    opacity: customError ? 1 : 0.84,
                                }}
                            >
                                {customError
                                    ? customError
                                    : canApplyCustom
                                        ? `${formatPercentValue(customPreview.offListPercent)} off list • ${formatPercentValue(customPreview.netPercent)} net`
                                        : 'Use slash-separated discounts like 50/20/5'}
                            </p>
                            <button
                                type="submit"
                                disabled={!canApplyCustom}
                                className="flex-shrink-0 rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold transition-opacity disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: dark ? 'rgba(255,255,255,0.14)' : `${theme.colors.accent}14`,
                                    color: theme.colors.textPrimary,
                                    opacity: canApplyCustom ? 1 : 0.48,
                                }}
                            >
                                Apply
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

const VersusList = ({ jsiProduct, competitors = [], theme, categoryId, categoryName }) => {
    const dark = isDarkTheme(theme);
    const [jsiDiscount, setJsiDiscount] = useState(DEFAULT_DISCOUNT);
    const [compDiscounts, setCompDiscounts] = useState(() =>
        Object.fromEntries(competitors.map(c => [c.id, DEFAULT_DISCOUNT]))
    );
    const [discountTarget, setDiscountTarget] = useState(null);
    const discountAnchorRef = useRef(null);

    const compKey = competitors.map(c => c.id).join(',');
    useEffect(() => {
        setCompDiscounts(Object.fromEntries(competitors.map(c => [c.id, DEFAULT_DISCOUNT])));
        setJsiDiscount(DEFAULT_DISCOUNT);
        setDiscountTarget(null);
        discountAnchorRef.current = null;
    }, [compKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const jsiList = jsiProduct.price || 0;
    const jsiNet = applyDiscount(jsiList, jsiDiscount);
    const activeDiscountValue = discountTarget === 'jsi'
        ? jsiDiscount
        : (discountTarget ? (compDiscounts[discountTarget] ?? DEFAULT_DISCOUNT) : DEFAULT_DISCOUNT);

    const handleDiscountSelect = (nextValue, meta = { source: 'standard' }) => {
        const selectedTarget = discountTarget;

        if (selectedTarget === 'jsi') {
            setJsiDiscount(nextValue);
        } else if (selectedTarget) {
            setCompDiscounts((prev) => ({ ...prev, [selectedTarget]: nextValue }));
        }

        if (meta.source === 'custom' && selectedTarget) {
            const competitor = competitors.find((item) => item.id === selectedTarget);
            const targetIsJsi = selectedTarget === 'jsi';
            const record = persistCompetitiveDiscountRecord({
                source: 'competitive-analysis',
                categoryId,
                categoryName,
                productId: jsiProduct.id,
                productName: jsiProduct.name,
                targetKind: targetIsJsi ? 'jsi' : 'competitor',
                targetId: targetIsJsi ? jsiProduct.id : (competitor?.id || selectedTarget),
                targetName: targetIsJsi ? jsiProduct.name : (competitor?.name || selectedTarget),
                listPrice: targetIsJsi ? jsiList : parseListPrice(competitor?.laminate),
                customDiscount: nextValue,
                customDiscountInput: meta.rawInput || shortDiscount(nextValue),
                offListPercent: Math.round((meta.offListPercent ?? getOffListPercent(nextValue)) * 100) / 100,
                netPercent: Math.round((meta.netPercent ?? (parseNetMultiplier(nextValue) * 100)) * 100) / 100,
            });

            void submitCompetitiveDiscountRecord(record);
        }

        discountAnchorRef.current = null;
        setDiscountTarget(null);
    };

    const closeDiscountMenu = useCallback(() => {
        discountAnchorRef.current = null;
        setDiscountTarget(null);
    }, []);

    const openDiscountMenu = useCallback((target, event) => {
        event.preventDefault();
        event.stopPropagation();
        discountAnchorRef.current = event.currentTarget;
        setDiscountTarget((prev) => prev === target ? null : target);
    }, []);

    const listSurface = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.78)';
    const benchmarkSurface = dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.94)';
    const benchmarkPillSurface = dark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.06)';
    const rowSeparator = dark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.07)';

    return (
        <>
            <div className="px-1">
                <div
                    className="overflow-hidden rounded-[28px]"
                    style={{ backgroundColor: listSurface }}
                >
                    <div
                        className="px-4 py-4"
                        style={{
                            backgroundColor: benchmarkSurface,
                        }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <span
                                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
                                    style={{
                                        backgroundColor: benchmarkPillSurface,
                                        color: theme.colors.textSecondary,
                                    }}
                                >
                                    JSI
                                </span>
                                <p className="mt-2 text-[1.08rem] font-semibold leading-tight" style={{ color: theme.colors.textPrimary }}>
                                    {jsiProduct.name}
                                </p>
                                <PriceMetaLine
                                    discount={jsiDiscount}
                                    listPrice={jsiList}
                                    theme={theme}
                                    dark={dark}
                                    open={discountTarget === 'jsi'}
                                    onDiscountClick={(event) => openDiscountMenu('jsi', event)}
                                />
                            </div>

                            <div className="min-w-[78px] flex-shrink-0 text-right">
                                <p
                                    className="text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
                                    style={{ color: theme.colors.textSecondary, opacity: 0.72 }}
                                >
                                    JSI net
                                </p>
                                <p className="mt-1.5 text-[1.75rem] font-bold tabular-nums leading-none" style={{ color: theme.colors.textPrimary }}>
                                    {formatCurrency(jsiNet)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {competitors.length > 0 ? competitors.map((c, index) => {
                        const cList = parseListPrice(c.laminate);
                        const cDiscount = compDiscounts[c.id] ?? DEFAULT_DISCOUNT;
                        const cNet = applyDiscount(cList, cDiscount);
                        const compPremium = calculateCompetitiveDelta(jsiNet, cNet);

                        return (
                            <div
                                key={c.id}
                                className="px-4 py-4"
                                style={{
                                    borderTop: `${index === 0 ? 1 : 1}px solid ${rowSeparator}`,
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[0.98rem] font-semibold leading-tight" style={{ color: theme.colors.textPrimary }}>
                                            {c.name}
                                        </p>
                                        <PriceMetaLine
                                            discount={cDiscount}
                                            listPrice={cList}
                                            theme={theme}
                                            dark={dark}
                                            open={discountTarget === c.id}
                                            onDiscountClick={(event) => openDiscountMenu(c.id, event)}
                                        />
                                    </div>

                                    <div className="min-w-[72px] flex-shrink-0 text-right">
                                        <p
                                            className="text-[0.625rem] font-semibold uppercase tracking-[0.12em]"
                                            style={{ color: theme.colors.textSecondary, opacity: 0.62 }}
                                        >
                                            Net
                                        </p>
                                        <p className="mt-1.5 text-[1.25rem] font-bold tabular-nums leading-none" style={{ color: theme.colors.textPrimary }}>
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
            </div>

            <CompactDiscountMenu
                theme={theme}
                open={!!discountTarget}
                anchorEl={discountAnchorRef.current}
                value={activeDiscountValue}
                onSelect={handleDiscountSelect}
                onClose={closeDiscountMenu}
            />
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
                        categoryId={categoryId}
                        categoryName={categoryData.name || categoryId}
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
