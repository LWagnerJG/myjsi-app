import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { ArrowRight, Package } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { PRODUCT_COMPARISON_CONSTANTS } from './comparison-data.js';

// Product selection tabs (minimal style, no boxes)
const ProductTabs = React.memo(({ products, activeProduct, onProductSelect, theme, categoryName }) => {
    const TAB_HEIGHT = 96; // unified height for image area (slightly smaller, cleaner)
    return (
        <GlassCard theme={theme} className="pt-4 pb-1 px-4">
            <div className="flex space-x-8 overflow-x-auto scrollbar-hide pb-2"
                 style={{ minHeight: TAB_HEIGHT + 40 }}>
                {products.map(p => {
                    const active = activeProduct.id === p.id;
                    // Normalize image scale so different aspect images appear consistent
                    const scale = p.thumbScale || 1.0;
                    return (
                        <div key={p.id} className="flex flex-col items-center select-none" style={{ width: 86 }}>
                            <button
                                onClick={() => onProductSelect(p)}
                                className="relative w-[86px] h-[96px] flex items-center justify-center active:scale-95 transition-transform"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                                aria-pressed={active}
                            >
                                <img
                                    src={p.image}
                                    alt={p.name}
                                    className={`max-w-full max-h-full object-contain transition-transform duration-400 ${active ? 'scale-[1.03]' : 'scale-100'} hover:scale-[1.05]`}
                                    style={{ transform: `scale(${scale})` }}
                                    loading="lazy"
                                />
                                {/* Active underline pill */}
                                {active && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full"
                                          style={{ backgroundColor: theme.colors.accent }} />
                                )}
                            </button>
                            <span className="mt-2 text-[11px] font-semibold tracking-wide px-1 text-center leading-tight"
                                  style={{ color: theme.colors.textPrimary }}>{p.name}</span>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
});
ProductTabs.displayName = 'ProductTabs';

// Hero
const ProductHero = React.memo(({ product, theme, categoryId, onNavigate, categoryName, materialMode }) => {
    const handleCompetitionClick = useCallback(() => { onNavigate(`products/category/${categoryId}/competition/${product.id}`); }, [categoryId, onNavigate, product.id]);
    const isChairCategory = /chair|guest|seating/i.test(categoryId) || /chair|guest|seating/i.test(categoryName || '');
    const aspectClass = isChairCategory ? 'aspect-[4/3]' : 'aspect-video';
    const [currentImg, setCurrentImg] = useState(product.image);
    const [prevImg, setPrevImg] = useState(null);
    useEffect(() => { if (product.image !== currentImg) { setPrevImg(currentImg); setCurrentImg(product.image); const t = setTimeout(()=>setPrevImg(null),450); return ()=>clearTimeout(t);} }, [product.image, currentImg]);
    let baseZoom = product.heroScale ? Math.min(1.1, Math.max(0.85, product.heroScale)) : (isChairCategory ? 0.96 : 1.08);
    if (product.name === 'Arwyn') baseZoom *= 1.05; // slight zoom in
    if (product.name === 'Ria') baseZoom *= 0.92; // zoom OUT a bit for Ria
    return (
        <div className={`relative w-full ${aspectClass} rounded-3xl overflow-hidden shadow-lg group`} style={{ backgroundColor: theme.colors.surface }}>
            {prevImg && <img src={prevImg} alt="prev" className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-500" />}
            <img src={currentImg} alt={product.name} className="absolute inset-0 w-full h-full object-contain transition-all duration-[900ms] ease-[cubic-bezier(.22,.8,.12,.99)] opacity-0 group-hover:scale-[1.02]" style={{ transform: `scale(${baseZoom})`, animation: 'fadeInHero 600ms forwards' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.26), rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0))' }} />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-7 pt-10">
                <div className="space-y-1 translate-y-1 select-none">
                    <h2 className="text-3xl font-bold text-white drop-shadow-sm tracking-tight">{product.name}</h2>
                    <p className="text-xl font-semibold text-white/95 drop-shadow-sm">${product.price?.toLocaleString() || 'TBD'}</p>
                </div>
                <div className="absolute bottom-5 right-5">
                    <button onClick={handleCompetitionClick} className="flex items-center space-x-2 px-5 py-2 rounded-full font-semibold text-sm transition-all active:scale-95 backdrop-blur-sm hover:brightness-105" style={{ backgroundColor: 'rgba(255,255,255,0.55)', color: theme.colors.textPrimary, border: '1px solid rgba(255,255,255,0.65)', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
                        <span>Competition</span><ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
});
ProductHero.displayName = 'ProductHero';

// Pricing table w/ improved material toggle (spring-like animation + scale pulse)
const PricingTable = React.memo(({ products, activeProduct, onSelectProduct, theme, materialMode, onMaterialModeChange, categoryId }) => {
    const sorted = useMemo(() => [...products].sort((a, b) => (a.price || 0) - (b.price || 0)), [products]);
    const isGuest = categoryId === 'guest';
    const isCasegoods = categoryId === 'casegoods';
    const options = isGuest ? ['Wood', 'Metal'] : ['Laminate', 'Veneer'];
    const activeIndex = options.findIndex(o => materialMode === o.toLowerCase());

    const Toggle = () => (
        <div role="tablist" aria-label="Material mode"
             className="relative flex rounded-full font-semibold select-none h-11 text-[12px] tracking-wide px-1"
             style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}>
            <div className="absolute top-1 bottom-1 left-1 rounded-full shadow-md will-change-transform"
                 style={{
                     width: `calc(${100 / options.length}% - 8px)`,
                     background: theme.colors.surface,
                     transform: `translateX(calc(${activeIndex} * (100% + 8px))) scale(1)`,
                     transition: 'transform 420ms cubic-bezier(.25,1,.28,1)',
                 }} />
            {options.map((opt, i) => {
                const key = opt.toLowerCase();
                const active = materialMode === key;
                return (
                    <button key={opt} role="tab" aria-selected={active} tabIndex={active ? 0 : -1}
                            onClick={() => onMaterialModeChange(key)}
                            className={`relative z-10 flex-1 px-5 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-colors ${active ? 'font-bold' : 'font-medium'}`}
                            style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}>
                        {opt}
                    </button>
                );
            })}
        </div>
    );

    return (
        <GlassCard theme={theme} className="px-0 pb-3 pt-3 overflow-hidden animate-[fadeSlide_.55s_ease]">
            <div className="px-6 pb-2 flex items-center justify-between">
                {isCasegoods ? (<span className="text-[12px] font-bold tracking-wide px-3 py-1 rounded-full" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>Typical U-shape</span>) : <span />}
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
                        <button key={p.id} onClick={() => onSelectProduct(p)} className={`w-full group px-6 py-3 flex items-center justify-between text-sm transition-colors rounded-lg text-left ${active ? 'bg-transparent' : 'hover:bg-black/5'} animate-[rowFade_.5s_ease]`} style={{ cursor: active ? 'default' : 'pointer' }} disabled={active}>
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

    useEffect(() => {
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
                    <ProductHero product={activeProduct} theme={theme} categoryId={categoryId} onNavigate={onNavigate} categoryName={categoryData.name} materialMode={materialMode} />
                    <PricingTable products={visibleProducts} activeProduct={activeProduct} onSelectProduct={handleProductSelect} theme={theme} materialMode={materialMode} onMaterialModeChange={setMaterialMode} categoryId={categoryId} />
                </div>
            </div>
        </div>
    );
};

// Keyframe styles (non-intrusive) – rely on global injection; if not present, consumer can add
// We'll append a style tag once (id check)
if (typeof document !== 'undefined' && !document.getElementById('product-comp-anim')) {
    const style = document.createElement('style');
    style.id = 'product-comp-anim';
    style.innerHTML = `@keyframes fadeInHero{0%{opacity:0;transform:scale(.92)}60%{opacity:1}100%{opacity:1}}@keyframes fadeSlide{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}@keyframes rowFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(style);
}