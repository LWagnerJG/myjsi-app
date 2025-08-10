import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Package, Plus, ShoppingCart, Trash2, Minus, CheckCircle, Home, ChevronUp, ChevronDown } from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, FINISH_CATEGORIES, FINISH_SAMPLES } from '../../data/samples.js';

/* ---------- Helpers ---------- */
const idOf = (x) => String(x); // normalize all ids to string

/* ---------- Small buttons ---------- */
const OrderFullSetButton = ({ onClick, theme, inCart }) => (
    <button
        onClick={onClick}
        className={`flex-1 px-3 py-2 rounded-3xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${inCart ? 'scale-[1.02]' : ''}`}
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
        className={`flex-1 px-3 py-2 rounded-3xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${inCart ? 'scale-[1.02]' : ''}`}
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

/* ---------- Cart drawer ---------- */
const CartItem = React.memo(({ item, onUpdateCart, theme, isLast = false }) => {
    const dec = useCallback(() => onUpdateCart(item, -1), [item, onUpdateCart]);
    const inc = useCallback(() => onUpdateCart(item, 1), [item, onUpdateCart]);

    return (
        <>
            {!isLast && <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />}
            <div className="flex items-center gap-3 py-2 px-1">
                <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{
                        backgroundColor: item.isSet ? theme.colors.subtle : item.color,
                        border: `1px solid ${theme.colors.border}`
                    }}
                >
                    {item.isSet && <Package className="w-5 h-5" style={{ color: theme.colors.secondary }} />}
                    {item.image && !item.isSet && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-xs" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                    {item.code && <p className="text-xs opacity-70" style={{ color: theme.colors.textSecondary }}>{item.code}</p>}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={dec} className="w-6 h-6 flex items-center justify-center rounded-full transition-all active:scale-90 hover:bg-black/5 dark:hover:bg-white/5">
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />}
                    </button>
                    <span className="font-bold w-4 text-center text-xs">{item.quantity}</span>
                    <button onClick={inc} className="w-6 h-6 flex items-center justify-center rounded-full transition-all active:scale-90 hover:bg-black/5 dark:hover:bg-white/5">
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
        return Object.entries(cart).map(([rawId, quantity]) => {
            const id = idOf(rawId);
            if (id === 'full-jsi-set') return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
            if (id.startsWith('set-')) {
                const categoryName = id.replace('set-', '').replace('-', ' ');
                return { id, name: `Complete ${categoryName} Set`, quantity, isSet: true };
            }
            const product = SAMPLE_PRODUCTS.find(p => idOf(p.id) === id);
            return product ? { ...product, id, quantity, isSet: false } : null;
        }).filter(Boolean);
    }, [cart]);

    const totalCartItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);

    const submit = useCallback(() => {
        if (cartItems.length === 0 || !address.trim()) return;
        alert('Order submitted successfully!');
    }, [cartItems, address]);

    if (totalCartItems === 0) return null;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ${isExpanded ? 'z-30' : 'z-10'}`}
            style={{
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderTop: `1px solid ${theme.colors.border}`,
                maxHeight: isExpanded ? '60vh' : '80px',
                transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 80px))'
            }}
        >
            <div
                className="flex items-center justify-between p-4 cursor-pointer relative z-10"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Cart ({totalCartItems})</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} /> : <ChevronUp className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />}
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 max-h-96 overflow-y-auto scrollbar-hide">
                    <div className="mb-4">
                        {cartItems.map((item, idx) => (
                            <CartItem key={item.id} item={item} onUpdateCart={onUpdateCart} theme={theme} isLast={idx === 0} />
                        ))}
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Ship To</h3>
                            <button
                                onClick={() => setAddress(userSettings?.homeAddress || '')}
                                className="flex items-center gap-1 text-xs font-semibold p-1 rounded-lg hover:bg-black/5 transition-colors"
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
                            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary, resize: 'none' }}
                        />
                    </div>

                    <button
                        onClick={submit}
                        disabled={cartItems.length === 0 || !address.trim()}
                        className="w-full font-bold py-3 px-6 rounded-full transition-all active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}
                    >
                        Submit Order ({totalCartItems} Items)
                    </button>
                </div>
            )}
        </div>
    );
};

/* ---------- Main screen ---------- */
export const SamplesScreen = ({ theme, onNavigate, cart, onUpdateCart, userSettings }) => {
    const [selectedCategory, setSelectedCategory] = useState('laminate');

    const addSet = useCallback(() => {
        const categoryName = FINISH_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Unknown';
        const key = `set-${selectedCategory}`;
        const id = idOf(key);
        const currentQty = cart[id] || 0;
        onUpdateCart({ id, name: `Complete ${categoryName} Set` }, currentQty > 0 ? -currentQty : 1);
    }, [selectedCategory, onUpdateCart, cart]);

    const addFull = useCallback(() => {
        const id = idOf('full-jsi-set');
        const currentQty = cart[id] || 0;
        onUpdateCart({ id, name: 'Full JSI Sample Set' }, currentQty > 0 ? -currentQty : 1);
    }, [onUpdateCart, cart]);

    const totalCartItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);

    const filteredProducts = useMemo(() => {
        const isFinish = FINISH_CATEGORIES.some(cat => cat.id === selectedCategory);
        return isFinish
            ? FINISH_SAMPLES.filter(s => s.category === selectedCategory)
            : SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory && !p.subcategory);
    }, [selectedCategory]);

    const setInCartQuantity = cart[idOf(`set-${selectedCategory}`)] || 0;
    const fullSetInCart = (cart[idOf('full-jsi-set')] || 0) > 0;

    const currentCategoryName =
        FINISH_CATEGORIES.find(c => c.id === selectedCategory)?.name ||
        SAMPLE_CATEGORIES.find(c => c.id === selectedCategory)?.name ||
        'Unknown';

    const allCategories = [
        ...FINISH_CATEGORIES,
        ...SAMPLE_CATEGORIES.filter(cat => cat.id !== 'finishes'),
    ];

    return (
        <div className="flex flex-col h-full" style={{ paddingBottom: totalCartItems > 0 ? '88px' : '0' }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Material selector */}
                <div className="px-4 pt-4 pb-2">
                    <div className="relative flex overflow-x-auto scrollbar-hide whitespace-nowrap">
                        {allCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className="relative px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap"
                                style={{ color: selectedCategory === cat.id ? theme.colors.accent : theme.colors.textSecondary }}
                            >
                                {cat.name}
                                {selectedCategory === cat.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: theme.colors.accent }} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="px-4 py-4">
                    <div className="flex gap-3">
                        <OrderFullSetButton onClick={addFull} theme={theme} inCart={fullSetInCart} />
                        <AddCompleteSetButton onClick={addSet} theme={theme} inCart={setInCartQuantity > 0} categoryName={currentCategoryName} />
                    </div>
                </div>

                {/* Sample grid */}
                <div className="px-4 grid grid-cols-3 gap-3 pb-4">
                    {filteredProducts.map(product => {
                        const pid = idOf(product.id);
                        const qty = cart[pid] || 0;
                        const hasImage = !!product.image;
                        const bg = hasImage ? theme.colors.subtle : (product.color || '#E5E7EB');

                        const addOne = () => onUpdateCart({ ...product, id: pid }, 1);
                        const removeOne = () => onUpdateCart({ ...product, id: pid }, -1);

                        return (
                            <div key={pid} className="w-full">
                                <div
                                    className="relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-200"
                                    style={{
                                        border: `2px solid ${qty > 0 ? theme.colors.accent : theme.colors.border}`,
                                        backgroundColor: bg,
                                        transform: qty > 0 ? 'scale(0.95)' : 'scale(1)',
                                        boxShadow: qty > 0 ? `0 0 15px ${theme.colors.accent}40` : 'none'
                                    }}
                                >
                                    {hasImage && (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover select-none"
                                            draggable={false}
                                        />
                                    )}

                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24">
                                        <GlassCard theme={theme} className="p-0.5 flex items-center justify-between gap-1">
                                            {qty === 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={addOne}
                                                    className="w-full h-7 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95"
                                                >
                                                    <Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={removeOne}
                                                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95"
                                                    >
                                                        {qty === 1 ? (
                                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                        ) : (
                                                            <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                                        )}
                                                    </button>
                                                    <span className="font-bold text-sm select-none" style={{ color: theme.colors.textPrimary }}>
                                                        {qty}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={addOne}
                                                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                                    </button>
                                                </>
                                            )}
                                        </GlassCard>
                                    </div>
                                </div>

                                <div className="mt-1 text-[10px] text-center text-gray-700 truncate select-none">
                                    {product.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <CartDrawer cart={cart} onUpdateCart={onUpdateCart} theme={theme} userSettings={userSettings} />
        </div>
    );
};
