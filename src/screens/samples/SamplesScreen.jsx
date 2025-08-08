import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Package, Plus, ShoppingCart, Trash2, Minus, CheckCircle, Home, ChevronUp, ChevronDown } from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, FINISH_CATEGORIES, FINISH_SAMPLES } from '../../data/samples.js';

const OrderFullSetButton = ({ onClick, theme, inCart }) => (
    <button
        onClick={onClick}
        className={`flex-1 px-3 py-2 rounded-3xl text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-1.5 ${inCart ? 'scale-[1.02]' : ''}`}
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

const AddCompleteSetButton = ({ onClick, theme, inCart, categoryName }) => (
    <button
        onClick={onClick}
        className={`flex-1 px-3 py-2 rounded-3xl text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-1.5 ${inCart ? 'scale-[1.02]' : ''}`}
        style={{
            border: `1px solid ${inCart ? theme.colors.accent : theme.colors.border}`,
            color: inCart ? theme.colors.accent : theme.colors.textPrimary,
            backgroundColor: theme.colors.surface
        }}
    >
        {inCart && <CheckCircle className="w-3.5 h-3.5" />}
        <span>Complete {categoryName} Set</span>
    </button>
);

const CartItem = React.memo(({ item, onUpdateCart, theme, isLast = false }) => {
    const handleDecrease = useCallback(() => {
        onUpdateCart(item, -1);
    }, [item, onUpdateCart]);

    const handleIncrease = useCallback(() => {
        onUpdateCart(item, 1);
    }, [item, onUpdateCart]);

    return (
        <>
            {!isLast && (
                <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />
            )}
            <div className="flex items-center space-x-3 py-2 px-1">
                <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{
                        backgroundColor: item.isSet ? theme.colors.subtle : item.color,
                        border: `1px solid ${theme.colors.border}`
                    }}
                >
                    {item.isSet && (
                        <Package className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                    )}
                    {item.image && !item.isSet && (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                        />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-xs" style={{ color: theme.colors.textPrimary }}>
                        {item.name}
                    </p>
                    {item.code && (
                        <p className="text-xs opacity-70" style={{ color: theme.colors.textSecondary }}>
                            {item.code}
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={handleDecrease}
                        className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-90 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        {item.quantity === 1 ? (
                            <Trash2 className="w-3 h-3 text-red-500" />
                        ) : (
                            <Minus className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                        )}
                    </button>
                    <span className="font-bold w-4 text-center text-xs">{item.quantity}</span>
                    <button
                        onClick={handleIncrease}
                        className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-90 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <Plus className="w-3 h-3" style={{ color: theme.colors.secondary }} />
                    </button>
                </div>
            </div>
        </>
    );
});

CartItem.displayName = 'CartItem';

const CartDrawer = ({ cart, onUpdateCart, theme, userSettings }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [address, setAddress] = useState(userSettings?.homeAddress || '');

    const cartItems = useMemo(() => {
        if (!SAMPLE_PRODUCTS || !SAMPLE_CATEGORIES) return [];

        return Object.entries(cart).map(([id, quantity]) => {
            if (id === 'full-jsi-set') {
                return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
            }

            if (id.startsWith('set-')) {
                const categoryName = id.replace('set-', '').replace('-', ' ');
                return { id, name: `Complete ${categoryName} Set`, quantity, isSet: true };
            }

            const product = SAMPLE_PRODUCTS.find(p => String(p.id) === id);
            return product ? { ...product, quantity, isSet: false } : null;
        }).filter(Boolean);
    }, [cart]);

    const totalCartItems = useMemo(() =>
        Object.values(cart).reduce((sum, qty) => sum + qty, 0),
        [cart]
    );

    const handleSubmit = useCallback(() => {
        if (cartItems.length === 0 || !address.trim()) return;
        alert('Order submitted successfully!');
    }, [cartItems, address]);

    if (totalCartItems === 0) return null;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-20 transition-all duration-300"
            style={{
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderTop: `1px solid ${theme.colors.border}`,
                maxHeight: isExpanded ? '60vh' : '80px',
                transform: `translateY(${isExpanded ? '0' : 'calc(100% - 80px)'})`
            }}
        >
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                            Cart ({totalCartItems})
                        </p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    ) : (
                        <ChevronUp className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 max-h-96 overflow-y-auto scrollbar-hide">
                    <div className="mb-4">
                        {cartItems.map((item, index) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateCart={onUpdateCart}
                                theme={theme}
                                isLast={index === 0}
                            />
                        ))}
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                                Ship To
                            </h3>
                            <button
                                onClick={() => setAddress(userSettings?.homeAddress || '')}
                                className="flex items-center space-x-1 text-xs font-semibold p-1 rounded-lg hover:bg-black/5 transition-all duration-200"
                            >
                                <Home className="w-3 h-3" style={{ color: theme.colors.secondary }} />
                                <span>Use Home</span>
                            </button>
                        </div>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows="2"
                            placeholder="Enter shipping address..."
                            className="w-full p-2 border rounded-lg text-xs"
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                color: theme.colors.textPrimary,
                                resize: 'none'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={cartItems.length === 0 || !address.trim()}
                        className="w-full font-bold py-3 px-6 rounded-full transition-all duration-200 transform active:scale-95 disabled:opacity-50"
                        style={{
                            backgroundColor: theme.colors.accent,
                            color: '#FFFFFF'
                        }}
                    >
                        Submit Order ({totalCartItems} Items)
                    </button>
                </div>
            )}
        </div>
    );
};

export const SamplesScreen = ({ theme, onNavigate, cart, onUpdateCart, userSettings }) => {
    const [selectedCategory, setSelectedCategory] = useState('laminate');

    const handleAddSetToCart = useCallback(() => {
        const categoryName = FINISH_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Unknown';
        const currentQuantity = cart[`set-${selectedCategory}`] || 0;

        if (currentQuantity > 0) {
            onUpdateCart(
                { id: `set-${selectedCategory}`, name: `Complete ${categoryName} Set` },
                -currentQuantity
            );
        } else {
            onUpdateCart(
                { id: `set-${selectedCategory}`, name: `Complete ${categoryName} Set` },
                1
            );
        }
    }, [selectedCategory, onUpdateCart, cart]);

    const handleOrderFullSet = useCallback(() => {
        const currentQuantity = cart['full-jsi-set'] || 0;

        if (currentQuantity > 0) {
            onUpdateCart({ id: 'full-jsi-set', name: 'Full JSI Sample Set' }, -currentQuantity);
        } else {
            onUpdateCart({ id: 'full-jsi-set', name: 'Full JSI Sample Set' }, 1);
        }
    }, [onUpdateCart, cart]);

    const totalCartItems = useMemo(
        () => Object.values(cart).reduce((sum, qty) => sum + qty, 0),
        [cart]
    );

    const filteredProducts = useMemo(() => {
        const isFinishCategory = FINISH_CATEGORIES.some(cat => cat.id === selectedCategory);

        if (isFinishCategory) {
            return FINISH_SAMPLES.filter(sample => sample.category === selectedCategory);
        } else {
            return SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory && !p.subcategory);
        }
    }, [selectedCategory]);

    const setInCartQuantity = cart[`set-${selectedCategory}`] || 0;
    const fullSetInCart = cart['full-jsi-set'] > 0;
    const currentCategoryName = FINISH_CATEGORIES.find(c => c.id === selectedCategory)?.name ||
        SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name ||
        'Unknown';

    const allCategories = [...FINISH_CATEGORIES, ...SAMPLE_CATEGORIES.filter(cat => cat.id !== 'finishes')];

    return (
        <div className="flex flex-col h-full" style={{ paddingBottom: totalCartItems > 0 ? '80px' : '0' }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pt-4 pb-2">
                    <div className="relative flex overflow-x-auto scrollbar-hide whitespace-nowrap">
                        {allCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className="relative px-4 py-3 font-semibold text-sm transition-colors duration-200 whitespace-nowrap"
                                style={{
                                    color: selectedCategory === cat.id ? theme.colors.accent : theme.colors.textSecondary
                                }}
                            >
                                {cat.name}
                                {selectedCategory === cat.id && (
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200"
                                        style={{ backgroundColor: theme.colors.accent }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4">
                    <div
                        className="h-px w-full"
                        style={{ backgroundColor: theme.colors.border }}
                    />
                </div>

                <div className="px-4 py-4">
                    <div className="flex space-x-3">
                        <OrderFullSetButton onClick={handleOrderFullSet} theme={theme} inCart={fullSetInCart} />
                        <AddCompleteSetButton
                            onClick={handleAddSetToCart}
                            theme={theme}
                            inCart={setInCartQuantity > 0}
                            categoryName={currentCategoryName}
                        />
                    </div>
                </div>

                <div className="px-4 grid grid-cols-3 gap-3 pb-4">
                    {filteredProducts.map(product => {
                        const quantity = cart[product.id] || 0;
                        const hasImage = product.image && product.image !== '';
                        const backgroundColor = hasImage ? theme.colors.subtle : (product.color || '#E5E7EB');

                        return (
                            <div key={product.id} className="w-full">
                                <div
                                    onClick={() => onUpdateCart(product, 1)}
                                    className="relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group"
                                    style={{
                                        border: `2px solid ${quantity > 0 ? theme.colors.accent : theme.colors.border}`,
                                        backgroundColor: backgroundColor,
                                        transform: quantity > 0 ? 'scale(0.95)' : 'scale(1)',
                                        boxShadow: quantity > 0 ? `0 0 15px ${theme.colors.accent}40` : 'none'
                                    }}
                                >
                                    {hasImage && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}

                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20">
                                        <GlassCard theme={theme} className="p-0.5 flex justify-around items-center">
                                            {quantity === 0 ? (
                                                <button onClick={(e) => { e.stopPropagation(); onUpdateCart(product, 1); }} className="w-full h-6 flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                                                    <Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); onUpdateCart(product, -1); }} className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                        {quantity === 1 ? (
                                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                        ) : (
                                                            <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                                        )}
                                                    </button>
                                                    <span className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                                                        {quantity}
                                                    </span>
                                                    <button onClick={(e) => { e.stopPropagation(); onUpdateCart(product, 1); }} className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                                        <Plus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                                    </button>
                                                </>
                                            )}
                                        </GlassCard>
                                    </div>
                                </div>

                                <div className="mt-1 text-[10px] text-center text-gray-700 truncate">
                                    {product.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <CartDrawer
                cart={cart}
                onUpdateCart={onUpdateCart}
                theme={theme}
                userSettings={userSettings}
            />
        </div>
    );
};
