import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Package, Search, Filter, Plus, Palette, Ruler, ShoppingCart, Trash2, Minus, CheckCircle, Users, Home } from 'lucide-react';
import * as Data from '../../data.jsx';
import { AddressBookModal } from '../../components/common/AddressBookModal.jsx';

// Updated OrderFullSetButton component - now toggleable
const OrderFullSetButton = ({ onClick, theme, inCart }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${inCart ? 'scale-105' : ''}`}
        style={{
            border: `1px solid ${inCart ? theme.colors.accent : theme.colors.border}`,
            color: inCart ? theme.colors.accent : theme.colors.textPrimary,
            backgroundColor: theme.colors.surface
        }}
    >
        {inCart && <CheckCircle className="w-3.5 h-3.5" />}
        <span>Full JSI Set</span>
    </button>
);

// New component for the TFL Set button with same styling - now toggleable
const AddCompleteSetButton = ({ onClick, theme, inCart, categoryName }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${inCart ? 'scale-105' : ''}`}
        style={{
            border: `1px solid ${inCart ? theme.colors.accent : theme.colors.border}`,
            color: inCart ? theme.colors.accent : theme.colors.textPrimary,
            backgroundColor: theme.colors.surface
        }}
    >
        {inCart && <CheckCircle className="w-3.5 h-3.5" />}
        <span>{categoryName} Set</span>
    </button>
);

export const SamplesScreen = ({ theme, onNavigate, cart, onUpdateCart, userSettings }) => {
    const [selectedCategory, setSelectedCategory] = useState('tfl');

    // Manage category slider pill
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const buttonRefs = useRef([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const idx = Data.SAMPLE_CATEGORIES.findIndex(c => c.id === selectedCategory);
        const btn = buttonRefs.current[idx];
        if (btn) setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth, opacity: 1 });
    }, [selectedCategory]);

    // Handlers
    const handleAddSetToCart = useCallback(() => {
        const categoryName = Data.SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Unknown';
        onUpdateCart(
            { id: `set-${selectedCategory}`, name: `Complete ${categoryName} Set` },
            1
        );
    }, [selectedCategory, onUpdateCart]);

    // This handler is now wrapped in useCallback for optimization
    const handleOrderFullSet = useCallback(
        () => onUpdateCart({ id: 'full-jsi-set', name: 'Full JSI Sample Set' }, 1),
        [onUpdateCart]
    );

    const totalCartItems = useMemo(
        () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
        [cart]
    );

    const filteredProducts = useMemo(
        () => Data.SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory),
        [selectedCategory]
    );

    const setInCartQuantity = cart[`set-${selectedCategory}`] || 0;
    const fullSetInCart = cart['full-jsi-set'] > 0;
    const currentCategoryName = Data.SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'TFL';

    return (
        <div className="flex flex-col h-full">
            {/* Header with action buttons - no title */}
            <div className="sticky top-0 z-10 transition-all duration-300 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <OrderFullSetButton onClick={handleOrderFullSet} theme={theme} inCart={fullSetInCart} />
                        <AddCompleteSetButton 
                            onClick={handleAddSetToCart} 
                            theme={theme} 
                            inCart={setInCartQuantity > 0}
                            categoryName={currentCategoryName}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => onNavigate('samples/cart')}
                            className="p-2 rounded-full hover:bg-black/10 transition"
                        >
                            <ShoppingCart
                                className="w-7 h-7"
                                style={{ color: theme.colors.textPrimary }}
                            />
                        </button>
                        {totalCartItems > 0 && (
                            <div
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ backgroundColor: theme.colors.accent }}
                            >
                                {totalCartItems}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Category selection pills */}
                <div className="px-4 mb-6">
                    <GlassCard theme={theme} className="p-1">
                        <div
                            ref={containerRef}
                            className="relative flex space-x-2 overflow-x-auto scrollbar-hide whitespace-nowrap"
                        >
                            <div
                                className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-in-out"
                                style={{
                                    backgroundColor: theme.colors.accent,
                                    left: pillStyle.left,
                                    width: pillStyle.width,
                                    opacity: pillStyle.opacity
                                }}
                            />
                            {Data.SAMPLE_CATEGORIES.map((cat, index) => (
                                <button
                                    key={cat.id}
                                    ref={el => (buttonRefs.current[index] = el)}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className="relative z-10 px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-300"
                                    style={{
                                        color:
                                            selectedCategory === cat.id
                                                ? 'white'
                                                : theme.colors.textPrimary
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Product grid */}
                <div className="px-4 grid grid-cols-2 gap-4 pb-4">
                    {filteredProducts.map(product => {
                        const quantity = cart[product.id] || 0;
                        return (
                            <div
                                key={product.id}
                                onClick={() => onUpdateCart(product, 1)}
                                className="relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group"
                                style={{
                                    border: `2px solid ${quantity > 0 ? theme.colors.accent : theme.colors.border}`,
                                    backgroundColor: product.image ? theme.colors.subtle : product.color,
                                    transform: quantity > 0 ? 'scale(0.95)' : 'scale(1)',
                                    boxShadow: quantity > 0 ? `0 0 15px ${theme.colors.accent}40` : 'none'
                                }}
                            >
                                {product.image && (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                )}

                                <div
                                    className="absolute top-2 left-2 bg-white bg-opacity-75 px-2 py-1 rounded text-xs font-semibold"
                                    style={{ color: theme.colors.textPrimary }}
                                >
                                    {product.name}
                                </div>

                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28">
                                    <GlassCard theme={theme} className="p-1 flex justify-around items-center">
                                        {quantity === 0 ? (
                                            <button onClick={(e) => { e.stopPropagation(); onUpdateCart(product, 1); }} className="w-full h-7 flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                                                <Plus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); onUpdateCart(product, -1); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                    {quantity === 1 ? (
                                                        <Trash2 className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <Minus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                                    )}
                                                </button>
                                                <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                                                    {quantity}
                                                </span>
                                                <button onClick={(e) => { e.stopPropagation(); onUpdateCart(product, 1); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                    <Plus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                                </button>
                                            </>
                                        )}
                                    </GlassCard>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};