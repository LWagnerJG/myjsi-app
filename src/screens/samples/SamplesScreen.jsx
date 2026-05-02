// src/screens/samples/SamplesScreen.jsx
import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDarkTheme } from '../../design-system/tokens.js';
import { Plus, Trash2, Minus, CheckCircle, Layers, ShoppingCart } from 'lucide-react';
import { hapticMedium } from '../../utils/haptics.js';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, FINISH_CATEGORIES, FINISH_SAMPLES } from './data.js';
import { CartDrawer } from './components/CartDrawer.jsx';
import { ScreenTopChrome } from '../../components/common/ScreenTopChrome.jsx';

const idOf = (x) => String(x);
const cleanName = (name) => String(name || '').split('|')[0].trim();

/* ── Animation presets ── */
const badgeSpring = { type: 'spring', stiffness: 500, damping: 25, mass: 0.8 };
const stepperSpring = { type: 'spring', stiffness: 420, damping: 28 };
const iconSwap = { duration: 0.12, ease: 'easeOut' };

/* ── Memoised product tile — only re-renders when its own qty or theme changes ── */
const ProductTile = memo(({ product, qty, theme, isDark, onAdd, onRemove }) => {
    const hasImage = !!product.image;
    const bg = hasImage ? theme.colors.subtle : (product.color || theme.colors.subtle);

    const handleAdd = useCallback((e) => {
        e?.stopPropagation();
        hapticMedium();
        onAdd(product);
    }, [product, onAdd]);

    const handleRemove = useCallback((e) => {
        e?.stopPropagation();
        hapticMedium();
        onRemove(product);
    }, [product, onRemove]);

    return (
        <div
            className="relative rounded-xl overflow-hidden"
            style={{
                backgroundColor: theme.colors.surface,
                boxShadow: qty > 0
                    ? `0 0 0 2.5px ${theme.colors.accent}`
                    : `0 0 0 1px ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                transition: 'box-shadow 0.2s ease',
            }}
        >
            {/* Quantity badge */}
            <AnimatePresence>
                {qty > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={badgeSpring}
                        className="absolute top-2 left-2 z-10 min-w-[28px] h-[28px] px-1.5 rounded-full text-[0.8125rem] font-bold flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.accent, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                                key={qty}
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 8, opacity: 0 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                            >
                                {qty}
                            </motion.span>
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Swatch image area */}
            <div
                role="button"
                tabIndex={0}
                onClick={handleAdd}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdd(e); } }}
                className="aspect-[4/3] flex items-center justify-center overflow-hidden cursor-pointer"
                style={{ backgroundColor: bg }}
            >
                {hasImage && (
                    <img loading="lazy" width="600" height="600" src={product.image} alt={product.name}
                        className="object-cover w-full h-full select-none pointer-events-none" draggable={false} />
                )}
            </div>

            {/* Footer: name + actions */}
            <div className="px-2.5 py-2 flex items-center gap-1.5">
                <p className="text-[0.875rem] truncate flex-1 leading-tight"
                    style={{ color: theme.colors.textPrimary }}>
                    {cleanName(product.name)}
                </p>
                <div className="flex items-center flex-shrink-0">
                    <AnimatePresence initial={false}>
                        {qty > 0 && (
                            <motion.div
                                key="remove-slot"
                                initial={{ width: 0, opacity: 0, marginRight: 0 }}
                                animate={{ width: 32, opacity: 1, marginRight: 4 }}
                                exit={{ width: 0, opacity: 0, marginRight: 0 }}
                                transition={stepperSpring}
                                style={{ overflow: 'hidden', flexShrink: 0 }}
                            >
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                                    style={{ backgroundColor: isDark ? 'rgba(255,100,100,0.15)' : 'rgba(184,92,92,0.10)' }}
                                    aria-label={qty === 1 ? `Remove ${product.name}` : `Decrease ${product.name} quantity`}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {qty === 1 ? (
                                            <motion.span key="trash" className="flex items-center justify-center"
                                                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }} transition={iconSwap}>
                                                <Trash2 className="w-4 h-4" style={{ color: theme.colors.error || '#B85C5C' }} />
                                            </motion.span>
                                        ) : (
                                            <motion.span key="minus" className="flex items-center justify-center"
                                                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }} transition={iconSwap}>
                                                <Minus className="w-4 h-4" style={{ color: theme.colors.error || '#B85C5C' }} />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
                        style={{
                            backgroundColor: qty > 0
                                ? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.06)')
                                : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.05)'),
                            transition: 'background-color 0.15s ease',
                        }}
                        aria-label={qty > 0 ? `Add another ${product.name}` : `Add ${product.name}`}
                    >
                        <Plus className="w-4 h-4" style={{
                            color: qty > 0 ? theme.colors.textPrimary : theme.colors.textSecondary,
                            opacity: qty > 0 ? 0.7 : 0.6,
                            transition: 'color 0.15s ease, opacity 0.15s ease',
                        }} />
                    </button>
                </div>
            </div>
        </div>
    );
});
ProductTile.displayName = 'ProductTile';

export const SamplesScreen = ({ theme, onNavigate, cart: cartProp, onUpdateCart: onUpdateCartProp, userSettings, dealerDirectory, designFirms, sampleOrders = [], onSubmitSampleOrder, initialCartOpen = false }) => {
    const [cartInternal, setCartInternal] = useState({});
    const cart = cartProp ?? cartInternal;
    const isDark = isDarkTheme(theme);
    const bgRgb = isDark ? '26,26,26' : '240,237,232';
    const categoryScrollRef = useRef(null);
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

    const handleAddProduct = useCallback((product) => {
        onUpdateCart({ ...product, id: idOf(product.id) }, 1);
    }, [onUpdateCart]);

    const handleRemoveProduct = useCallback((product) => {
        onUpdateCart({ ...product, id: idOf(product.id) }, -1);
    }, [onUpdateCart]);

    const [selectedCategory, setSelectedCategory] = useState('tfl');
    const [cartOpen, setCartOpen] = useState(initialCartOpen);
    const [chipEdgeFade, setChipEdgeFade] = useState({ left: false, right: false });
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
    const categoryItemLabel = isFinishCategory ? 'finishes' : 'samples';

    const totalFinishCount = FINISH_SAMPLES.length;
    const activeOrderCount = useMemo(
        () => (Array.isArray(sampleOrders) ? sampleOrders.filter((order) => order.status !== 'delivered').length : 0),
        [sampleOrders]
    );
    const hasCartShortcut = totalCartItems > 0;

    const chipFadeProfile = hasCartShortcut
        ? {
            leftWidth: 58,
            rightWidth: 96,
            leftGradient: `linear-gradient(to right,
                rgba(${bgRgb},0.88) 0%,
                rgba(${bgRgb},0.78) 22%,
                rgba(${bgRgb},0.54) 48%,
                rgba(${bgRgb},0.28) 72%,
                rgba(${bgRgb},0.10) 88%,
                rgba(${bgRgb},0) 100%)`,
            rightGradient: `linear-gradient(to left,
                rgba(${bgRgb},0.86) 0%,
                rgba(${bgRgb},0.76) 16%,
                rgba(${bgRgb},0.54) 40%,
                rgba(${bgRgb},0.31) 64%,
                rgba(${bgRgb},0.12) 84%,
                rgba(${bgRgb},0) 100%)`,
            leftBlur: 'blur(8px) saturate(1.06)',
            rightBlur: 'blur(13px) saturate(1.06)',
            leftMask: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 26%, rgba(0,0,0,0.62) 58%, rgba(0,0,0,0.26) 82%, rgba(0,0,0,0) 100%)',
            rightMask: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.62) 54%, rgba(0,0,0,0.24) 82%, rgba(0,0,0,0) 100%)',
        }
        : {
            leftWidth: 52,
            rightWidth: 78,
            leftGradient: `linear-gradient(to right,
                rgba(${bgRgb},0.92) 0%,
                rgba(${bgRgb},0.82) 24%,
                rgba(${bgRgb},0.54) 52%,
                rgba(${bgRgb},0.24) 76%,
                rgba(${bgRgb},0.06) 90%,
                rgba(${bgRgb},0) 100%)`,
            rightGradient: `linear-gradient(to left,
                rgba(${bgRgb},0.94) 0%,
                rgba(${bgRgb},0.86) 18%,
                rgba(${bgRgb},0.62) 44%,
                rgba(${bgRgb},0.34) 68%,
                rgba(${bgRgb},0.13) 86%,
                rgba(${bgRgb},0) 100%)`,
            leftBlur: 'blur(7px) saturate(1.06)',
            rightBlur: 'blur(10px) saturate(1.06)',
            leftMask: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 24%, rgba(0,0,0,0.66) 56%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)',
            rightMask: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.66) 52%, rgba(0,0,0,0.28) 80%, rgba(0,0,0,0) 100%)',
        };

    const updateChipEdgeFade = useCallback(() => {
        const viewport = categoryScrollRef.current;
        if (!viewport) return;

        const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const hasOverflow = maxScrollLeft > 2;
        const leftVisible = hasOverflow && viewport.scrollLeft > 4;
        const rightVisible = hasOverflow && viewport.scrollLeft < maxScrollLeft - 4;

        setChipEdgeFade((prev) => {
            if (prev.left === leftVisible && prev.right === rightVisible) return prev;
            return { left: leftVisible, right: rightVisible };
        });
    }, []);

    useEffect(() => {
        const viewport = categoryScrollRef.current;
        if (!viewport) return undefined;

        updateChipEdgeFade();

        const onScroll = () => updateChipEdgeFade();
        viewport.addEventListener('scroll', onScroll, { passive: true });

        const resizeObserver = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(() => updateChipEdgeFade())
            : null;

        resizeObserver?.observe(viewport);
        if (viewport.firstElementChild) resizeObserver?.observe(viewport.firstElementChild);

        window.addEventListener('resize', updateChipEdgeFade);

        return () => {
            viewport.removeEventListener('scroll', onScroll);
            resizeObserver?.disconnect();
            window.removeEventListener('resize', updateChipEdgeFade);
        };
    }, [updateChipEdgeFade, totalCartItems]);

    /* Full JSI Set — lives above the grid, always visible regardless of category */
    const fullId = idOf('full-jsi-set');
    const fullQty = cart[fullId] || 0;
    const toggleFull = () => { hapticMedium(); onUpdateCart({ id: fullId, name: 'Full JSI Sample Set', isSet: true }, fullQty > 0 ? -fullQty : 1); };

    const renderProductGrid = (products) => {
        const setId = idOf(`set-${selectedCategory}`);
        const setQty = cart[setId] || 0;
        const toggleSet = () => { hapticMedium(); onUpdateCart({ id: setId, name: `All ${currentCategoryName} Finishes`, isSet: true }, setQty > 0 ? -setQty : 1); };

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-4">
                {/* ── Category Set Tile ── */}
                <button
                    onClick={toggleSet}
                    className="relative rounded-xl overflow-hidden text-left active:scale-[0.97]"
                    style={{
                        backgroundColor: setQty > 0 ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface),
                        boxShadow: setQty > 0
                            ? `0 0 0 2.5px ${theme.colors.accent}`
                            : `0 0 0 1px ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                        transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
                    }}
                >
                    <div className="aspect-[4/3] flex flex-col items-center justify-center p-3"
                        style={{
                            backgroundColor: setQty > 0 ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)'),
                            transition: 'background-color 0.25s ease',
                        }}>
                        <AnimatePresence mode="wait" initial={false}>
                            {setQty > 0 ? (
                                <motion.span key="check"
                                    initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}
                                    transition={badgeSpring}>
                                    <CheckCircle className="w-6 h-6" style={{ color: '#fff' }} />
                                </motion.span>
                            ) : (
                                <motion.span key="layers"
                                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                                    transition={iconSwap}>
                                    <Layers className="w-6 h-6" style={{ color: theme.colors.textSecondary, opacity: 0.3 }} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="px-2.5 py-2">
                        <p className="text-[0.875rem] font-bold truncate"
                            style={{ color: setQty > 0 ? '#fff' : theme.colors.textPrimary, transition: 'color 0.25s ease' }}>
                            All {currentCategoryName}
                        </p>
                        <p className="text-[0.6875rem] mt-0.5"
                            style={{ color: setQty > 0 ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary, opacity: setQty > 0 ? 1 : 0.5, transition: 'color 0.25s ease, opacity 0.25s ease' }}>
                            {products.length} {categoryItemLabel}
                        </p>
                    </div>
                </button>

                {/* ── Individual product tiles ── */}
                {products.map(product => (
                    <ProductTile
                        key={idOf(product.id)}
                        product={product}
                        qty={cart[idOf(product.id)] || 0}
                        theme={theme}
                        isDark={isDark}
                        onAdd={handleAddProduct}
                        onRemove={handleRemoveProduct}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
            {/* Category chips — scrollable pills with Orders CTA */}
            <ScreenTopChrome theme={theme} horizontalPaddingClass="px-0" contentClassName="pt-2.5 pb-2" fade={false}>
                <div className="flex items-center gap-2 px-4">
                    <div className="relative flex-1 min-w-0">
                        <div
                            data-category-scroll
                            ref={categoryScrollRef}
                            className="flex overflow-x-auto scrollbar-hide no-scrollbar gap-2"
                            style={{ paddingRight: hasCartShortcut ? 10 : 2 }}
                        >
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

                        <div
                            data-edge-fade="left"
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-0"
                            style={{
                                width: `${chipFadeProfile.leftWidth}px`,
                                opacity: chipEdgeFade.left ? 1 : 0,
                                transition: 'opacity 220ms ease, width 240ms ease',
                                background: chipFadeProfile.leftGradient,
                                backdropFilter: chipFadeProfile.leftBlur,
                                WebkitBackdropFilter: chipFadeProfile.leftBlur,
                                maskImage: chipFadeProfile.leftMask,
                                WebkitMaskImage: chipFadeProfile.leftMask,
                            }}
                        />

                        <div
                            data-edge-fade="right"
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 right-0"
                            style={{
                                width: `${chipFadeProfile.rightWidth}px`,
                                opacity: chipEdgeFade.right ? 1 : 0,
                                transition: 'opacity 220ms ease, width 240ms ease',
                                background: chipFadeProfile.rightGradient,
                                backdropFilter: chipFadeProfile.rightBlur,
                                WebkitBackdropFilter: chipFadeProfile.rightBlur,
                                maskImage: chipFadeProfile.rightMask,
                                WebkitMaskImage: chipFadeProfile.rightMask,
                            }}
                        />
                    </div>
                    {/* Cart icon — only visible when cart has items */}
                    <AnimatePresence>
                        {totalCartItems > 0 && (
                            <motion.button
                                key="cart-btn"
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                                transition={badgeSpring}
                                onClick={() => setCartOpen(true)}
                                className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.07)' }}
                                aria-label={`Cart (${totalCartItems})`}
                            >
                                <ShoppingCart className="w-[18px] h-[18px]" style={{ color: theme.colors.textPrimary }} />
                                <motion.span
                                    key={totalCartItems}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={badgeSpring}
                                    className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full text-[0.6875rem] font-bold flex items-center justify-center"
                                    style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                                >
                                    {totalCartItems}
                                </motion.span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </ScreenTopChrome>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
                <div className="px-4 pt-2 pb-6">
                    <div className="max-w-content mx-auto w-full space-y-3">

                        {/* ── Full JSI Set — prominent banner ── */}
                        <button
                            onClick={toggleFull}
                            className="w-full rounded-2xl active:scale-[0.98] overflow-hidden"
                            style={{
                                backgroundColor: fullQty > 0
                                    ? theme.colors.accent
                                    : (isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface),
                                boxShadow: fullQty > 0
                                    ? '0 4px 16px rgba(53,53,53,0.12)'
                                    : (isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'),
                                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                            }}
                        >
                            <div className="flex items-center gap-3.5 px-4 py-3.5">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        backgroundColor: fullQty > 0
                                            ? 'rgba(255,255,255,0.15)'
                                            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)'),
                                        transition: 'background-color 0.3s ease',
                                    }}
                                >
                                    <Layers className="w-5 h-5" style={{
                                        color: fullQty > 0 ? '#fff' : theme.colors.textSecondary,
                                        opacity: fullQty > 0 ? 1 : 0.45,
                                        transition: 'color 0.3s ease, opacity 0.3s ease',
                                    }} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-[0.8125rem] font-bold truncate" style={{
                                        color: fullQty > 0 ? '#fff' : theme.colors.textPrimary,
                                        transition: 'color 0.3s ease',
                                    }}>
                                        Full JSI Sample Set
                                    </p>
                                    <p className="text-[0.6875rem] mt-0.5" style={{
                                        color: fullQty > 0 ? 'rgba(255,255,255,0.65)' : theme.colors.textSecondary,
                                        opacity: fullQty > 0 ? 1 : 0.55,
                                        transition: 'color 0.3s ease, opacity 0.3s ease',
                                    }}>
                                        Every finish across all categories · {totalFinishCount} samples
                                    </p>
                                </div>
                                <AnimatePresence mode="wait" initial={false}>
                                    {fullQty > 0 ? (
                                        <motion.span key="check-full" className="flex-shrink-0"
                                            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}
                                            transition={badgeSpring}>
                                            <CheckCircle className="w-5 h-5" style={{ color: '#fff' }} />
                                        </motion.span>
                                    ) : (
                                        <motion.span key="plus-full" className="flex-shrink-0"
                                            initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }}
                                            transition={badgeSpring}>
                                            <Plus className="w-5 h-5" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </button>

                        {/* Product grid */}
                        {renderProductGrid(filteredProducts)}
                    </div>
                </div>
            </div>
            <CartDrawer cart={cart} onUpdateCart={onUpdateCart} theme={theme} userSettings={userSettings} dealers={dealerDirectory} designFirms={designFirms} open={cartOpen} onOpenChange={setCartOpen} onNavigate={onNavigate} onSubmitOrder={onSubmitSampleOrder} />
        </div>
    );
};

