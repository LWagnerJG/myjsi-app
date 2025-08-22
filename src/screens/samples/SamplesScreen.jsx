// src/screens/samples/SamplesScreen.jsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import {
    Package, Plus, ShoppingCart, Trash2, Minus, CheckCircle, Home,
    ChevronUp, ChevronDown, Users, X, Search
} from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, FINISH_CATEGORIES, FINISH_SAMPLES } from './data.js';
import { getSampleProduct } from './sampleIndex.js';
import { useToasts } from '../../components/common/ToastHost.jsx';

const idOf = (x) => String(x);

/* ====================== Directory Modal ====================== */
const DirectoryModal = ({ show, onClose, onSelect, theme, dealers = [], designFirms = [] }) => {
    const [q, setQ] = useState('');
    const HEADER_OFFSET = 80; // keep app header visible / undimmed
    const items = React.useMemo(() => {
        if (!show) return [];
        const normalize = (x, idx) => ({
            key: `${x?.id ?? x?.name ?? 'item'}-${idx}`,
            name: x?.name ?? x?.company ?? x?.title ?? 'Unknown',
            address: x?.address ?? x?.Address ?? x?.location ?? x?.street ?? x?.office ?? '',
        });
        const list = [...(dealers || []), ...(designFirms || [])].map(normalize);
        const k = q.trim().toLowerCase();
        return k ? list.filter((i) => i.name.toLowerCase().includes(k)) : list;
    }, [q, dealers, designFirms, show]);

    React.useEffect(() => { if (!show) setQ(''); }, [show]);
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center pointer-events-none">
            {/* Dim ONLY content below header */}
            <div
                className="absolute left-0 right-0 bottom-0 pointer-events-auto"
                style={{ top: HEADER_OFFSET, background: 'rgba(0,0,0,0.32)' }}
                onClick={onClose}
            />
            <div
                className="relative w-full sm:max-w-md mt-auto sm:mt-[100px] rounded-t-2xl sm:rounded-2xl p-5 space-y-4 pointer-events-auto"
                style={{ background: theme.colors.surface, boxShadow: '0 14px 40px rgba(0,0,0,0.22)' }}
            >
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base tracking-tight" style={{ color: theme.colors.textPrimary }}>Select Company</h3>
                    <button onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-black/5 active:scale-95 transition"><X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} /></button>
                </div>
                <div className="relative">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search companies..."
                        className="w-full rounded-xl pl-9 pr-3 py-2 text-sm outline-none transition focus:ring-2"
                        style={{ background: theme.colors.subtle, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, boxShadow: '0 0 0 transparent' }}
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                    {items.map((it) => (
                        <button
                            key={it.key}
                            onClick={() => { onSelect({ name: it.name, address1: it.address || '' }); onClose(); }}
                            className="w-full text-left px-4 py-3 rounded-xl group border transition-all hover:shadow-sm active:scale-[0.99]"
                            style={{ background: theme.colors.surface, borderColor: theme.colors.border }}
                        >
                            <div className="font-medium text-sm mb-0.5" style={{ color: theme.colors.textPrimary }}>{it.name}</div>
                            {it.address && <div className="text-xs leading-snug" style={{ color: theme.colors.textSecondary }}>{it.address}</div>}
                        </button>
                    ))}
                    {items.length === 0 && (
                        <div className="text-sm text-center py-6" style={{ color: theme.colors.textSecondary }}>No companies found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ====================== Buttons ====================== */
const OrderFullSetButton = ({ onClick, theme, inCart }) => (
    <button
        onClick={onClick}
        className={`flex-1 px-3 py-2 rounded-3xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${inCart ? 'scale-[1.02]' : ''}`}
        style={{
            border: `1px solid ${inCart ? theme.colors.accent : theme.colors.border}`,
            color: inCart ? theme.colors.accent : theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
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
            backgroundColor: theme.colors.surface,
        }}
    >
        {inCart && <CheckCircle className="w-3.5 h-3.5" />}
        <span>Complete {categoryName} Set</span>
    </button>
);

/* ====================== Drawer line item ====================== */
const DrawerItem = React.memo(({ item, onUpdateCart, theme, isLast = false }) => {
    const dec = useCallback((e) => { e.stopPropagation(); onUpdateCart(item, -1); }, [item, onUpdateCart]);
    const inc = useCallback((e) => { e.stopPropagation(); onUpdateCart(item, 1); }, [item, onUpdateCart]);

    return (
        <>
            {!isLast && <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />}
            <div className="flex items-center gap-3 py-2 px-1">
                <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: item.isSet ? theme.colors.subtle : item.color, border: `1px solid ${theme.colors.border}` }}
                >
                    {item.isSet
                        ? <Package className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                        : item.image
                            ? <img loading="lazy" width="300" height="300" src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                            : null}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-xs" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                    {item.code && <p className="text-xs opacity-70" style={{ color: theme.colors.textSecondary }}>{item.code}</p>}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={dec} className="w-6 h-6 flex items-center justify-center rounded-full active:scale-90">
                        {item.quantity === 1
                            ? <Trash2 className="w-3 h-3 text-red-500" />
                            : <Minus className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />}
                    </button>
                    <span className="font-bold w-4 text-center text-xs">{item.quantity}</span>
                    <button onClick={inc} className="w-6 h-6 flex items-center justify-center rounded-full active:scale-90">
                        <Plus className="w-3 h-3" style={{ color: theme.colors.secondary }} />
                    </button>
                </div>
            </div>
        </>
    );
});
DrawerItem.displayName = 'DrawerItem';

/* ====================== Cart Drawer ====================== */
const CartDrawer = ({ cart, onUpdateCart, theme, userSettings, dealers, designFirms, initialOpen = false, onNavigate }) => {
    const [isExpanded, setIsExpanded] = useState(initialOpen);
    const [showDir, setShowDir] = useState(false);
    const [shipToName, setShipToName] = useState('');
    const [address1, setAddress1] = useState(userSettings?.homeAddress || '');
    const [address2, setAddress2] = useState('');
    const [justSubmitted, setJustSubmitted] = useState(false);
    const toasts = useToasts();

    // helper to safely set values (avoid undefined which triggers uncontrolled warning)
    const safeSetShipTo = (v) => setShipToName(v ?? '');
    const safeSetAddress1 = (v) => setAddress1(v ?? '');
    const safeSetAddress2 = (v) => setAddress2(v ?? '');

    const cartItems = useMemo(() => {
        return Object.entries(cart)
            .map(([rawId, quantity]) => {
                const id = idOf(rawId);
                if (id === 'full-jsi-set') return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
                if (id.startsWith('set-')) {
                    const categoryId = id.replace('set-', '');
                    const categoryName =
                        FINISH_CATEGORIES.find((c) => c.id === categoryId)?.name ||
                        SAMPLE_CATEGORIES.find((c) => c.id === categoryId)?.name ||
                        categoryId;
                    return { id, name: `Complete ${categoryName} Set`, quantity, isSet: true };
                }
                const product = getSampleProduct(id); // O(1) lookup
                return product ? { ...product, id, quantity, isSet: false } : null;
            })
            .filter(Boolean);
    }, [cart]);

    const totalCartItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);

    const submit = useCallback(() => {
        if (!shipToName.trim() || !address1.trim() || cartItems.length === 0) {
            toasts.push('Please complete required fields before submitting', { type: 'error' });
            return;
        }
        toasts.push('Sample request submitted');
        setJustSubmitted(true);
        setTimeout(() => {
            setJustSubmitted(false);
            onNavigate && onNavigate('home');
        }, 1500);
    }, [shipToName, address1, cartItems.length, toasts, onNavigate]);

    const canSubmit = totalCartItems > 0 && shipToName.trim() && address1.trim();

    if (totalCartItems === 0) return null;

    return (
        <>
            <div
                className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ${isExpanded ? 'z-30' : 'z-10'}`}
                style={{
                    backgroundColor: theme.colors.surface,
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    // borderTop removed to eliminate stray grey line
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                    maxHeight: isExpanded ? '65vh' : '84px',
                    transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 84px))',
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
                        {isExpanded
                            ? <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                            : <ChevronUp className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />}
                    </div>
                </div>

                {isExpanded && (
                    <div className="px-4 pb-6 pt-2 max-h-[60vh] overflow-y-auto scrollbar-hide flex flex-col">
                        <div className="mb-4">
                            {cartItems.map((item, idx) => (
                                <DrawerItem key={item.id} item={item} onUpdateCart={onUpdateCart} theme={theme} isLast={idx === 0} />
                            ))}
                        </div>

                        {/* Ship To Section */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Ship To</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowDir(true)}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full active:scale-95 border transition-colors"
                                        style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                                    >
                                        <Users className="w-3.5 h-3.5" style={{ color: theme.colors.secondary }} />
                                        Directory
                                    </button>
                                    <button
                                        onClick={() => { safeSetShipTo('Home'); safeSetAddress1(userSettings?.homeAddress || ''); safeSetAddress2(''); }}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full active:scale-95 border transition-colors"
                                        style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                                    >
                                        <Home className="w-3.5 h-3.5" style={{ color: theme.colors.secondary }} />
                                        Use Home
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <input
                                        value={shipToName || ''}
                                        onChange={(e) => safeSetShipTo(e.target.value)}
                                        placeholder="Recipient / Company"
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none border"
                                        style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                                    />
                                </div>
                                <div>
                                    <input
                                        value={address1 || ''}
                                        onChange={(e) => safeSetAddress1(e.target.value)}
                                        placeholder="Address line 1"
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none border"
                                        style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                                    />
                                </div>
                                <div>
                                    <input
                                        value={address2 || ''}
                                        onChange={(e) => safeSetAddress2(e.target.value)}
                                        placeholder="Address line 2 (optional)"
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none border"
                                        style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Spacer to ensure button visibility */}
                        <div className="mt-auto pb-4" />

                        <div className="sticky bottom-2 left-0 right-0">
                            <button
                                disabled={!canSubmit}
                                onClick={submit}
                                className="w-full px-5 py-3 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: canSubmit ? theme.colors.accent : theme.colors.disabled, color: theme.colors.surface }}
                            >
                                Submit Sample Request
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DirectoryModal
                show={showDir}
                onClose={() => setShowDir(false)}
                onSelect={({ name, address1: addr1, address2: addr2 }) => {
                    safeSetShipTo(name);
                    safeSetAddress1(addr1);
                    safeSetAddress2(addr2);
                }}
                theme={theme}
                dealers={dealers}
                designFirms={designFirms}
            />
            {justSubmitted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="px-8 py-6 rounded-2xl text-center shadow-xl" style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                        <div className="text-lg font-bold mb-1" style={{ color: theme.colors.textPrimary }}>Sample Request Submitted</div>
                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}></div>
                    </div>
                </div>
            )}
        </>
    );
};

export const SamplesScreen = ({ theme, onNavigate, cart: cartProp, onUpdateCart: onUpdateCartProp, userSettings, dealerDirectory, designFirms, initialCartOpen = false }) => {
    // allow external cart OR internal fallback (keeps old behavior)
    const [cartInternal, setCartInternal] = useState({});
    const cart = cartProp ?? cartInternal;
    const onUpdateCart = onUpdateCartProp ?? useCallback((item, delta) => {
        setCartInternal((prev) => {
            const id = idOf(item.id);
            const current = prev[id] || 0;
            const quantity = Math.max(0, current + delta);
            const next = { ...prev };
            if (quantity === 0) delete next[id]; else next[id] = quantity;
            return next;
        });
    }, []);

    const [selectedCategory, setSelectedCategory] = useState('tfl');
    const totalCartItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);

    const addSet = useCallback(() => {
        const cat = FINISH_CATEGORIES.find((c) => c.id === selectedCategory)
            || SAMPLE_CATEGORIES.find((c) => c.id === selectedCategory);
        const categoryName = cat?.name || 'Unknown';
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

    const filteredProducts = useMemo(() => {
        const isFinish = FINISH_CATEGORIES.some((cat) => cat.id === selectedCategory);
        const base = isFinish
            ? FINISH_SAMPLES.filter((s) => s.category === selectedCategory)
            : SAMPLE_PRODUCTS.filter((p) => p.category === selectedCategory && !p.subcategory);
        if (selectedCategory === 'tfl') {
            // group by finishType with desired ordering
            const order = ['woodgrain', 'stone', 'metallic', 'solid'];
            return base.sort((a, b) => (order.indexOf(a.finishType || 'solid') - order.indexOf(b.finishType || 'solid'))
                || a.name.localeCompare(b.name));
        }
        return base;
    }, [selectedCategory]);

    const setInCartQuantity = cart[idOf(`set-${selectedCategory}`)] || 0;
    const fullSetInCart = (cart[idOf('full-jsi-set')] || 0) > 0;

    const currentCategoryName =
        FINISH_CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
        SAMPLE_CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
        'Unknown';

    const allCategories = [
        ...FINISH_CATEGORIES,
        ...SAMPLE_CATEGORIES.filter((cat) => cat.id !== 'finishes'),
    ];

    return (
        <div className="flex flex-col h-full" style={{ paddingBottom: totalCartItems > 0 ? '88px' : '0' }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
                {/* Sticky Category + Set Buttons */}
                <div
                    className="sticky top-0 z-10 px-4 pt-4 pb-3 space-y-3"
                    style={{
                        background: theme.colors.background, // fully opaque to prevent bleed-through
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
                        borderBottom: `1px solid ${theme.colors.border}40`
                    }}
                >
                    <div className="relative flex overflow-x-auto scrollbar-hide whitespace-nowrap">
                        {allCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className="relative px-4 py-3 font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full"
                                style={{ color: selectedCategory === cat.id ? theme.colors.accent : theme.colors.textSecondary, outline: 'none' }}
                                aria-pressed={selectedCategory === cat.id}
                            >
                                {cat.name}
                                {selectedCategory === cat.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: theme.colors.accent }} />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <OrderFullSetButton onClick={addFull} theme={theme} inCart={fullSetInCart} />
                        <AddCompleteSetButton onClick={addSet} theme={theme} inCart={setInCartQuantity > 0} categoryName={currentCategoryName} />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="px-4 pb-4 pt-3">
                    {selectedCategory === 'tfl' && (
                        <div className="grid grid-cols-3 gap-3">
                            {filteredProducts.map(product => {
                                const pid = idOf(product.id);
                                const qty = cart[pid] || 0;
                                const hasImage = !!product.image;
                                const bg = hasImage ? theme.colors.subtle : product.color || '#E5E7EB';
                                const addOne = (e) => { if (e) e.stopPropagation(); onUpdateCart({ ...product, id: pid }, 1); };
                                const removeOne = (e) => { if (e) e.stopPropagation(); onUpdateCart({ ...product, id: pid }, -1); };
                                return (
                                    <div key={pid} className="w-full">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={addOne}
                                            onKeyPress={e => { if (e.key === 'Enter') addOne(e); }}
                                            className="relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                                            style={{
                                                border: `2px solid ${qty > 0 ? theme.colors.accent : theme.colors.border}`,
                                                backgroundColor: bg,
                                                transform: qty > 0 ? 'scale(0.95)' : 'scale(1)',
                                                boxShadow: qty > 0 ? `0 0 15px ${theme.colors.accent}40` : 'none',
                                            }}
                                        >
                                            {hasImage && (
                                                <img loading="lazy" width="300" height="300" src={product.image} alt={product.name} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
                                            )}

                                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24">
                                                <GlassCard theme={theme} className="p-0.5 flex items-center justify-between gap-1">
                                                    {qty === 0 ? (
                                                        <button type="button" onClick={addOne} className="w-full h-7 rounded-full flex items-center justify-center active:scale-95">
                                                            <Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button type="button" onClick={removeOne} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-95">
                                                                {qty === 1
                                                                    ? <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                                    : <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />}
                                                            </button>
                                                            <span className="font-bold text-sm select-none" style={{ color: theme.colors.textPrimary }}>{qty}</span>
                                                            <button type="button" onClick={addOne} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-95">
                                                                <Plus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                                            </button>
                                                        </>
                                                    )}
                                                </GlassCard>
                                            </div>
                                        </div>
                                        <div className="mt-1 text-[10px] text-center text-gray-700 truncate select-none">{product.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {selectedCategory !== 'tfl' && (
                        <div className="grid grid-cols-3 gap-3">
                            {filteredProducts.map((product) => {
                                const pid = idOf(product.id);
                                const qty = cart[pid] || 0;
                                const hasImage = !!product.image;
                                const bg = hasImage ? theme.colors.subtle : product.color || '#E5E7EB';

                                const addOne = (e) => { if (e) e.stopPropagation(); onUpdateCart({ ...product, id: pid }, 1); };
                                const removeOne = (e) => { if (e) e.stopPropagation(); onUpdateCart({ ...product, id: pid }, -1); };

                                return (
                                    <div key={pid} className="w-full">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={addOne}
                                            onKeyPress={e => { if (e.key === 'Enter') addOne(e); }}
                                            className="relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                                            style={{
                                                border: `2px solid ${qty > 0 ? theme.colors.accent : theme.colors.border}`,
                                                backgroundColor: bg,
                                                transform: qty > 0 ? 'scale(0.95)' : 'scale(1)',
                                                boxShadow: qty > 0 ? `0 0 15px ${theme.colors.accent}40` : 'none',
                                            }}
                                        >
                                            {hasImage && (
                                                <img loading="lazy" width="300" height="300" src={product.image} alt={product.name} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
                                            )}

                                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24">
                                                <GlassCard theme={theme} className="p-0.5 flex items-center justify-between gap-1">
                                                    {qty === 0 ? (
                                                        <button type="button" onClick={addOne} className="w-full h-7 rounded-full flex items-center justify-center active:scale-95">
                                                            <Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button type="button" onClick={removeOne} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-95">
                                                                {qty === 1
                                                                    ? <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                                    : <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />}
                                                            </button>
                                                            <span className="font-bold text-sm select-none" style={{ color: theme.colors.textPrimary }}>{qty}</span>
                                                            <button type="button" onClick={addOne} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-95">
                                                                <Plus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                                            </button>
                                                        </>
                                                    )}
                                                </GlassCard>
                                            </div>
                                        </div>
                                        <div className="mt-1 text-[10px] text-center text-gray-700 truncate select-none">{product.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer */}
            <CartDrawer
                cart={cart}
                onUpdateCart={onUpdateCart}
                theme={theme}
                userSettings={userSettings}
                dealers={dealerDirectory}
                designFirms={designFirms}
                initialOpen={initialCartOpen}
                onNavigate={onNavigate}
            />
        </div>
    );
};