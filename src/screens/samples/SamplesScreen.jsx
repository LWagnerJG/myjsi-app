// src/screens/samples/SamplesScreen.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';
import { Plus, Trash2, Minus, CheckCircle, Layers } from 'lucide-react';
import { hapticMedium } from '../../utils/haptics.js';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, FINISH_CATEGORIES, FINISH_SAMPLES } from './data.js';
import { CartDrawer } from './components/CartDrawer.jsx';
import { ScreenTopChrome } from '../../components/common/ScreenTopChrome.jsx';

const idOf = (x) => String(x);
const COLLAPSED_HEIGHT = 96;

export const SamplesScreen = ({ theme, onNavigate, cart: cartProp, onUpdateCart: onUpdateCartProp, userSettings, dealerDirectory, designFirms, initialCartOpen = false }) => {
    const [cartInternal, setCartInternal] = useState({});
    const cart = cartProp ?? cartInternal;
    const isDark = isDarkTheme(theme);
    const fallbackUpdateCart = useCallback((item, delta) => {
        setCartInternal((prev) => {
            const id = idOf(item.id);
            const current = prev[id] || 0;
            const quantity = Math.max(0, current + delta);
            const next = { ...prev };
            if (quantity === 0) delete next[id]; else next[id] = quantity;
            return next;
        });
    }, []);
    const onUpdateCart = onUpdateCartProp ?? fallbackUpdateCart;
    const [selectedCategory, setSelectedCategory] = useState('tfl');
    const totalCartItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);

    const isFinishCategory = useMemo(
        () => FINISH_CATEGORIES.some((cat) => cat.id === selectedCategory),
        [selectedCategory]
    );

    const filteredProducts = useMemo(() => {
        const base = isFinishCategory
            ? FINISH_SAMPLES.filter((s) => s.category === selectedCategory)
            : SAMPLE_PRODUCTS.filter((p) => p.category === selectedCategory && !p.subcategory);
        if (selectedCategory === 'tfl') {
            const order = ['woodgrain', 'stone', 'metallic', 'solid'];
            return base.sort((a, b) => (order.indexOf(a.finishType || 'solid') - order.indexOf(b.finishType || 'solid')) || a.name.localeCompare(b.name));
        }
        return base;
    }, [selectedCategory, isFinishCategory]);

    const currentCategoryName = FINISH_CATEGORIES.find((c) => c.id === selectedCategory)?.name || SAMPLE_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Unknown';
    const allCategories = [...FINISH_CATEGORIES, ...SAMPLE_CATEGORIES.filter((cat) => cat.id !== 'finishes')];
    const cleanName = (name) => String(name || '').split('|')[0].trim();
    const categoryItemLabel = isFinishCategory ? 'finishes' : 'samples';

    const totalFinishCount = FINISH_SAMPLES.length;

    /* Full JSI Set — lives above the grid, always visible regardless of category */
    const fullId = idOf('full-jsi-set');
    const fullQty = cart[fullId] || 0;
    const toggleFull = () => onUpdateCart({ id: fullId, name: 'Full JSI Sample Set', isSet: true }, fullQty > 0 ? -fullQty : 1);

    const renderProductGrid = (products) => {
        const setId = idOf(`set-${selectedCategory}`);
        const setQty = cart[setId] || 0;
        const toggleSet = () => onUpdateCart({ id: setId, name: `All ${currentCategoryName} Finishes`, isSet: true }, setQty > 0 ? -setQty : 1);

        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3 pb-4">
                {/* ── Category Set Tile ── */}
                <button
                    onClick={toggleSet}
                    className="relative rounded-2xl overflow-hidden transition-all duration-200 active:scale-[0.97] text-left"
                    style={{
                        backgroundColor: setQty > 0 ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface),
                        boxShadow: setQty > 0 ? undefined : (isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'),
                    }}
                >
                    <div className="aspect-[4/3] flex flex-col items-center justify-center p-3"
                        style={{ backgroundColor: setQty > 0 ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)') }}>
                        {setQty > 0
                            ? <CheckCircle className="w-6 h-6" style={{ color: '#fff' }} />
                            : <Layers className="w-6 h-6" style={{ color: theme.colors.textSecondary, opacity: 0.3 }} />
                        }
                    </div>
                    <div className="px-2 sm:px-2.5 py-1.5 sm:py-2">
                        <p className="text-[0.6875rem] sm:text-[0.75rem] font-bold truncate" style={{ color: setQty > 0 ? '#fff' : theme.colors.textPrimary }}>
                            All {currentCategoryName}
                        </p>
                        <p className="text-[0.625rem] sm:text-[0.6875rem] mt-0.5" style={{ color: setQty > 0 ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary, opacity: setQty > 0 ? 1 : 0.5 }}>
                            {products.length} {categoryItemLabel}
                        </p>
                    </div>
                </button>

                {/* ── Individual product tiles ── */}
                {products.map(product => {
                    const pid = idOf(product.id);
                    const qty = cart[pid] || 0;
                    const hasImage = !!product.image;
                    const bg = hasImage ? theme.colors.subtle : (product.color || theme.colors.subtle);
                    const addOne = (e) => { if (e) e.stopPropagation(); hapticMedium(); onUpdateCart({ ...product, id: pid }, 1); };
                    const removeOne = (e) => { if (e) e.stopPropagation(); onUpdateCart({ ...product, id: pid }, -1); };

                    return (
                        <div
                            key={pid}
                            className="relative rounded-2xl overflow-hidden transition-all duration-200"
                            style={{
                                backgroundColor: theme.colors.surface,
                                boxShadow: qty > 0
                                    ? `0 0 0 2px ${theme.colors.accent}`
                                    : (isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'),
                            }}
                        >
                            {/* Quantity badge */}
                            {qty > 0 && (
                                <div className="absolute top-2 left-2 z-10 min-w-[22px] h-[22px] px-1.5 rounded-full text-[0.6875rem] font-bold flex items-center justify-center"
                                    style={{ backgroundColor: theme.colors.accent, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                                    {qty}
                                </div>
                            )}

                            {/* Swatch image area */}
                            <div role="button" tabIndex={0} onClick={addOne} onKeyPress={e => { if (e.key === 'Enter') addOne(e); }}
                                className="aspect-[4/3] flex items-center justify-center overflow-hidden cursor-pointer"
                                style={{ backgroundColor: bg }}>
                                {hasImage && <img loading="lazy" width="600" height="600" src={product.image} alt={product.name} className="object-cover w-full h-full select-none pointer-events-none" draggable={false} />}
                            </div>

                            {/* Footer: name + actions */}
                            <div className="px-2 sm:px-2.5 py-1.5 sm:py-2 flex items-center gap-1">
                                <p className="text-[0.6875rem] sm:text-[0.75rem] truncate flex-1" style={{ color: theme.colors.textPrimary }}>{cleanName(product.name)}</p>
                                {qty > 0 ? (
                                    <button type="button" onClick={removeOne}
                                        className="w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
                                        style={{ backgroundColor: isDark ? 'rgba(255,100,100,0.15)' : 'rgba(184,92,92,0.08)' }}
                                        aria-label={qty === 1 ? `Remove ${product.name}` : `Decrease ${product.name} quantity`}>
                                        {qty === 1
                                            ? <Trash2 className="w-3 h-3" style={{ color: theme.colors.error || '#B85C5C' }} />
                                            : <Minus className="w-3 h-3" style={{ color: theme.colors.error || '#B85C5C' }} />
                                        }
                                    </button>
                                ) : (
                                    <button type="button" onClick={addOne}
                                        className="w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.05)' }}
                                        aria-label={`Add ${product.name}`}>
                                        <Plus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary, opacity: 0.6 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
            {/* Category chips — scrollable pills */}
            <ScreenTopChrome theme={theme} maxWidthClass="max-w-5xl" horizontalPaddingClass="px-0" contentClassName="pt-2.5 pb-2">
                <div className="flex overflow-x-auto scrollbar-hide no-scrollbar gap-2 px-4">
                    {allCategories.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className="px-3.5 py-2 rounded-full text-[0.8125rem] font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 flex-shrink-0"
                                style={{
                                    backgroundColor: isActive
                                        ? (isDark ? 'rgba(255,255,255,0.16)' : theme.colors.textPrimary)
                                        : 'transparent',
                                    color: isActive
                                        ? (isDark ? '#fff' : '#fff')
                                        : theme.colors.textSecondary,
                                    opacity: isActive ? 1 : 0.7,
                                }}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </ScreenTopChrome>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
                <div className="px-4 pt-2" style={{ paddingBottom: totalCartItems > 0 ? `${COLLAPSED_HEIGHT + 16}px` : '16px' }}>
                    <div className="max-w-5xl mx-auto w-full space-y-3">

                        {/* ── Full JSI Set — prominent banner ── */}
                        <button
                            onClick={toggleFull}
                            className="w-full rounded-2xl transition-all duration-200 active:scale-[0.98] overflow-hidden"
                            style={{
                                backgroundColor: fullQty > 0 ? theme.colors.accent : theme.colors.textPrimary,
                                boxShadow: '0 4px 16px rgba(53,53,53,0.12)',
                            }}
                        >
                            <div className="flex items-center gap-3.5 px-4 py-3.5">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                                >
                                    <Layers className="w-5 h-5" style={{ color: '#fff' }} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-[0.8125rem] font-bold truncate" style={{ color: '#fff' }}>
                                        Full JSI Sample Set
                                    </p>
                                    <p className="text-[0.6875rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                        Every finish across all categories · {totalFinishCount} samples
                                    </p>
                                </div>
                                {fullQty > 0 ? (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#fff' }} />
                                ) : (
                                    <Plus className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
                                )}
                            </div>
                        </button>

                        {/* Product grid */}
                        {renderProductGrid(filteredProducts)}
                    </div>
                </div>
            </div>
            <CartDrawer cart={cart} onUpdateCart={onUpdateCart} theme={theme} userSettings={userSettings} dealers={dealerDirectory} designFirms={designFirms} initialOpen={initialCartOpen} onNavigate={onNavigate} />
        </div>
    );
};

