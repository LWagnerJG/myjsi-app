// src/screens/samples/SamplesScreen.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { FloatingCart } from '../../components/common/FloatingCart.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { Package, Plus, Trash2, Minus, CheckCircle, Layers } from 'lucide-react';
import { hapticMedium } from '../../utils/haptics.js';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, FINISH_CATEGORIES, FINISH_SAMPLES } from './data.js';

const idOf = (x) => String(x);
const COLLAPSED_HEIGHT = 96;

import { DirectoryModal } from './components/DirectoryModal.jsx';
import { DrawerItem } from './components/DrawerItem.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';

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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 pb-4">
                {/* ── Category Set Tile ── */}
                <div
                    onClick={toggleSet}
                    className="group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
                    style={{
                        backgroundColor: setQty > 0 ? theme.colors.accent : theme.colors.surface,
                        boxShadow: setQty > 0 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        border: setQty > 0 ? `2px solid ${theme.colors.accent}` : `1px solid ${theme.colors.border}`,
                    }}
                >
                    <div className="aspect-[4/3] flex flex-col items-center justify-center gap-1.5 p-3" style={{ backgroundColor: setQty > 0 ? theme.colors.accent : theme.colors.subtle }}>
                        <Package className="w-7 h-7" style={{ color: setQty > 0 ? theme.colors.accentText : theme.colors.textSecondary }} />
                        {setQty > 0 && <CheckCircle className="w-4 h-4" style={{ color: theme.colors.accentText }} />}
                    </div>
                    <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-center" style={{ backgroundColor: setQty > 0 ? theme.colors.accent : theme.colors.surface }}>
                        <p className="text-[11px] sm:text-xs font-bold truncate" style={{ color: setQty > 0 ? theme.colors.accentText : theme.colors.textPrimary }}>All {currentCategoryName}</p>
                        <p className="text-[10px] sm:text-[11px] mt-0.5 font-medium" style={{ color: setQty > 0 ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary }}>{products.length} {categoryItemLabel}</p>
                    </div>
                </div>

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
                            className="group relative rounded-2xl overflow-hidden transition-all duration-300"
                            style={{
                                backgroundColor: theme.colors.surface,
                                boxShadow: qty > 0 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                border: qty > 0 ? `2px solid ${theme.colors.accent}` : `1px solid ${theme.colors.border}`,
                                transform: qty > 0 ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            {qty > 0 && (
                                <div className="absolute top-1.5 left-1.5 z-10 min-w-[20px] sm:min-w-[28px] h-5 sm:h-7 px-1.5 sm:px-2 rounded-full text-[11px] sm:text-sm font-bold flex items-center justify-center shadow-md" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>{qty}</div>
                            )}
                            <div role="button" tabIndex={0} onClick={addOne} onKeyPress={e => { if (e.key === 'Enter') addOne(e); }} className="aspect-[4/3] flex items-center justify-center overflow-hidden" style={{ backgroundColor: bg }}>
                                {hasImage && <img loading="lazy" width="600" height="600" src={product.image} alt={product.name} className="object-cover w-full h-full select-none pointer-events-none" draggable={false} />}
                            </div>
                            <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between gap-1" style={{ backgroundColor: theme.colors.surface }}>
                                <p className="text-[11px] sm:text-sm truncate flex-1" style={{ color: theme.colors.textPrimary }}>{cleanName(product.name)}</p>
                                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                    {qty > 0 && (
                                        <button type="button" onClick={removeOne} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center active:scale-90 transition-all" style={{ backgroundColor: qty === 1 ? theme.colors.destructiveLight : theme.colors.subtle, border: qty === 1 ? `1px solid ${theme.colors.destructiveBorder}` : `1px solid ${theme.colors.border}` }} aria-label={qty === 1 ? `Remove ${product.name}` : `Decrease ${product.name} quantity`}>
                                            {qty === 1 ? <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#B85C5C' }} /> : <Minus className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: theme.colors.textSecondary }} />}
                                        </button>
                                    )}
                                    <button type="button" onClick={addOne} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center active:scale-95 border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }} aria-label={`Add ${product.name}`}>
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: theme.colors.textSecondary }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full app-header-offset">
            {/* Category tabs — underline style */}
            <div className="flex-shrink-0 px-4 pt-2 pb-0" style={{ background: theme.colors.background }}>
                <div className="max-w-5xl mx-auto w-full">
                    <div className="relative">
                        <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap gap-1 border-b" style={{ borderColor: theme.colors.border }}>
                            {allCategories.map((cat) => {
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className="relative px-4 py-2.5 text-sm font-medium transition-all"
                                        style={{ color: isActive ? theme.colors.accent : theme.colors.textSecondary, background: 'transparent' }}
                                    >
                                        {cat.name}
                                        {isActive && <motion.span layoutId="samples-tab-underline" className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none" style={{ background: `linear-gradient(to left, ${theme.colors.background}, transparent)` }} />
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
                <div className="px-4 pt-2" style={{ paddingBottom: totalCartItems > 0 ? `${COLLAPSED_HEIGHT + 16}px` : '16px' }}>
                    <div className="max-w-5xl mx-auto w-full space-y-3">

                        {/* ── Full JSI Set — persistent banner above grid ── */}
                        <button
                            onClick={toggleFull}
                            className="w-full rounded-2xl transition-all duration-200 active:scale-[0.99] overflow-hidden group"
                            style={{
                                backgroundColor: fullQty > 0 ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface),
                                border: fullQty > 0 ? `2px solid ${theme.colors.accent}` : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border}`,
                                boxShadow: fullQty > 0 ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                            }}
                        >
                            <div className="flex items-center gap-4 px-4 py-3.5">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        backgroundColor: fullQty > 0 ? 'rgba(255,255,255,0.15)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.04)'),
                                    }}
                                >
                                    <Layers className="w-5 h-5" style={{ color: fullQty > 0 ? theme.colors.accentText : theme.colors.accent }} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-[13px] font-bold" style={{ color: fullQty > 0 ? theme.colors.accentText : theme.colors.textPrimary }}>
                                        Full JSI Sample Set
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: fullQty > 0 ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary }}>
                                        Every finish across all categories • {totalFinishCount} samples
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {fullQty > 0 ? (
                                        <CheckCircle className="w-5 h-5" style={{ color: theme.colors.accentText }} />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.04)' }}>
                                            <Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                        </div>
                                    )}
                                </div>
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

