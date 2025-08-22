import React, { useState, useCallback, useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { ArrowRight, Package } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { PRODUCT_COMPARISON_CONSTANTS } from './comparison-data.js';

// Product selection tabs (subtle active indication)
const ProductTabs = React.memo(({ products, activeProduct, onProductSelect, theme, categoryName }) => {
    const isBenches = categoryName?.toLowerCase() === 'benches';
    const tabSize = isBenches ? PRODUCT_COMPARISON_CONSTANTS.TAB_SIZES.benches : PRODUCT_COMPARISON_CONSTANTS.TAB_SIZES.default;
    return (
        <GlassCard theme={theme} className="pt-4 pb-2 px-4">
            <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-1">
                {products.map(p => {
                    const active = activeProduct.id === p.id;
                    const scale = p.thumbScale || 1.5;
                    return (
                        <div key={p.id} className="flex flex-col items-center min-w-[92px]">
                            <button
                                onClick={() => onProductSelect(p)}
                                className={`flex-shrink-0 ${tabSize} relative rounded-2xl overflow-hidden transform active:scale-95 transition-all duration-150`}
                                style={{ backgroundColor: active ? theme.colors.subtle : theme.colors.surface }}
                            >
                                <img src={p.image} alt={p.name} className="w-full h-full object-contain" style={{ transform: `scale(${scale})` }} />
                                {active && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                                )}
                            </button>
                            <span className="mt-1.5 text-[11px] font-semibold tracking-wide px-1 text-center leading-tight" style={{ color: theme.colors.textPrimary }}>{p.name}</span>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
});
ProductTabs.displayName = 'ProductTabs';

// Hero
const ProductHero = React.memo(({ product, theme, categoryId, onNavigate }) => {
    const handleCompetitionClick = React.useCallback(() => { onNavigate(`products/category/${categoryId}/competition`); }, [categoryId, onNavigate]);
    const isGuestCategory = categoryId === 'guest';
    // For guest chairs default zoom a bit higher if heroScale not specified
    const zoom = product.heroScale || (isGuestCategory ? 1.35 : 1.15);
    return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
            <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                style={{ transform: `scale(${zoom})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-7 pt-10">
                <div className="space-y-1 translate-y-1">
                    <h2 className="text-3xl font-bold text-white drop-shadow-sm">{product.name}</h2>
                    <p className="text-xl font-semibold text-white drop-shadow-sm">${product.price?.toLocaleString() || 'TBD'}</p>
                </div>
                <div className="absolute bottom-4 right-4">
                    <button
                        onClick={handleCompetitionClick}
                        className="flex items-center space-x-2 px-5 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-100 shadow-sm"
                        style={{ backgroundColor: 'rgba(255,255,255,0.42)', color: theme.colors.textPrimary, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.55)' }}
                    >
                        <span>Competition</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
});
ProductHero.displayName = 'ProductHero';

// Pricing table
const PricingTable = React.memo(({ products, activeProduct, onSelectProduct, theme, materialMode, onMaterialModeChange, categoryId }) => {
    const sorted = useMemo(() => [...products].sort((a, b) => (a.price || 0) - (b.price || 0)), [products]);
    const isGuest = categoryId === 'guest';
    const isCasegoods = categoryId === 'casegoods';
    const options = isGuest ? ['Wood', 'Metal'] : ['Laminate', 'Veneer'];
    const activeIndex = options.findIndex(o => materialMode === o.toLowerCase());

    const Toggle = () => (
        <div className="relative flex rounded-full text-xs font-semibold overflow-hidden" style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}>
            <div className="absolute top-0.5 bottom-0.5 left-0 w-1/2 rounded-full transition-transform duration-300 ease-out" style={{ backgroundColor: theme.colors.surface, boxShadow: `0 2px 6px ${theme.colors.shadow}`, transform: `translateX(${activeIndex * 100}%)` }} />
            {options.map(opt => {
                const active = materialMode === opt.toLowerCase();
                return (
                    <button key={opt} onClick={() => onMaterialModeChange(opt.toLowerCase())} className="relative z-10 flex-1 px-4 py-1.5 rounded-full transition-colors duration-300" style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}>{opt}</button>
                );
            })}
        </div>
    );

    return (
        <GlassCard theme={theme} className="px-0 pb-3 pt-3 overflow-hidden">
            <div className="px-6 pb-2 flex items-center justify-between">
                {isCasegoods ? (
                    <span className="text-[12px] font-bold tracking-wide px-3 py-1 rounded-full" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>Typical U-shape</span>
                ) : <span />}
                <Toggle />
            </div>
            <div className="mx-6 h-px" style={{ backgroundColor: theme.colors.border }} />
            <div className="px-6 pt-2 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wide uppercase" style={{ color: theme.colors.textSecondary }}>
                <span>Series</span>
                <span>List $ {isGuest ? `(${materialMode === 'wood' ? 'Wood' : 'Metal'})` : `(${materialMode === 'laminate' ? 'Lam.' : 'Ven.'})`}</span>
            </div>
            <div className="mt-1">
                {sorted.map(p => {
                    const active = p.id === activeProduct.id;
                    return (
                        <button key={p.id} onClick={() => onSelectProduct(p)} className={`w-full group px-6 py-3 flex items-center justify-between text-sm transition-colors rounded-lg text-left ${active ? 'bg-transparent' : 'hover:bg-black/5'}`} style={{ cursor: active ? 'default' : 'pointer' }} disabled={active}>
                            <span className="flex items-center">
                                <span className="inline-block w-1.5 h-4 mr-3 rounded-full transition-colors" style={{ backgroundColor: active ? theme.colors.accent : theme.colors.border }} />
                                <span className={`font-medium ${active ? 'tracking-wide' : ''}`} style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}>{p.name}</span>
                            </span>
                            <span className="font-semibold" style={{ color: active ? theme.colors.accent : theme.colors.textSecondary }}>${p.price?.toLocaleString() || 'TBD'}</span>
                        </button>
                    );
                })}
            </div>
        </GlassCard>
    );
});
PricingTable.displayName = 'PricingTable';

const ErrorState = React.memo(({ message = 'The requested item does not exist.', theme }) => (
    <div className="p-4">
        <GlassCard theme={theme} className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            <p style={{ color: theme.colors.textPrimary }}>{message}</p>
        </GlassCard>
    </div>
));
ErrorState.displayName = 'ErrorState';

export const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
    const categoryData = PRODUCT_DATA?.[categoryId];
    const [activeProduct, setActiveProduct] = useState(categoryData?.products?.[0]);
    const isGuest = categoryId === 'guest';
    const [materialMode, setMaterialMode] = useState(isGuest ? 'wood' : 'laminate');

    const handleProductSelect = useCallback((product) => setActiveProduct(product), []);

    if (!categoryData) return <ErrorState theme={theme} />;

    const visibleProducts = useMemo(() => {
        if (!isGuest) return categoryData.products;
        return categoryData.products.filter(p => p.legType === (materialMode === 'wood' ? 'wood' : 'metal'));
    }, [categoryData, isGuest, materialMode]);

    React.useEffect(() => {
        if (isGuest && activeProduct && !visibleProducts.includes(activeProduct)) {
            const next = visibleProducts[0];
            if (next) setActiveProduct(next);
        }
    }, [materialMode, isGuest, activeProduct, visibleProducts]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-4 space-y-5">
                    <ProductTabs products={visibleProducts} activeProduct={activeProduct} onProductSelect={handleProductSelect} theme={theme} categoryName={categoryData.name} />
                    <ProductHero product={activeProduct} theme={theme} categoryId={categoryId} onNavigate={onNavigate} />
                    <PricingTable products={visibleProducts} activeProduct={activeProduct} onSelectProduct={handleProductSelect} theme={theme} materialMode={materialMode} onMaterialModeChange={setMaterialMode} categoryId={categoryId} />
                </div>
            </div>
        </div>
    );
};