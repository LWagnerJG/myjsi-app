// src/screens/samples/CartScreen.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Package, CheckCircle, Users, Home, Trash2, Minus, Plus, X, Search } from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES } from '../../data/samples.js';

const DirectoryModal = ({ show, onClose, onSelect, theme, dealers = [], designFirms = [] }) => {
    const [q, setQ] = useState('');
    const items = useMemo(() => {
        if (!show) return [];
        const norm = (x, i) => ({
            id: `${x.id || x.name || 'item'}-${i}`,
            name: x.name || x.company || x.title || 'Unknown',
            address: x.address || x.Address || x.location || x.street || x.office || '',
        });
        const list = [...(dealers || []), ...(designFirms || [])].map(norm);
        const k = q.trim().toLowerCase();
        return k ? list.filter((i) => i.name.toLowerCase().includes(k)) : list;
    }, [q, dealers, designFirms, show]);

    React.useEffect(() => {
        if (!show) setQ('');
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={onClose} />
            <div
                className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3"
                style={{ background: theme.colors.surface, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            >
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>Select Company</h3>
                    <button onClick={onClose} className="p-2 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search companies…"
                        className="w-full rounded-xl pl-9 pr-3 py-2 outline-none"
                        style={{ 
                            background: theme.colors.subtle, 
                            border: `1px solid ${theme.colors.border}`, 
                            color: theme.colors.textPrimary 
                        }}
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2">
                    {items.map((it) => (
                        <div
                            key={it.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                onSelect({ name: it.name, address1: it.address || '' });
                                onClose();
                            }}
                            onKeyPress={e => { if (e.key === 'Enter') { onSelect({ name: it.name, address1: it.address || '' }); onClose(); }}}
                            className="w-full text-left p-3 rounded-xl active:scale-[0.99] transition cursor-pointer"
                            style={{ background: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
                        >
                            <div className="font-medium" style={{ color: theme.colors.textPrimary }}>
                                {it.name}
                            </div>
                            {it.address && (
                                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    {it.address}
                                </div>
                            )}
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-sm text-center py-6" style={{ color: theme.colors.textSecondary }}>
                            No matches.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CartItem = React.memo(({ item, onUpdateCart, theme, isLast = false }) => {
    const dec = useCallback(() => onUpdateCart(item, -1), [item, onUpdateCart]);
    const inc = useCallback(() => onUpdateCart(item, 1), [item, onUpdateCart]);

    return (
        <>
            {!isLast && <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />}
            <div className="flex items-center space-x-3 py-2 px-1">
                <div
                    className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{
                        backgroundColor: item.isSet ? theme.colors.subtle : item.color,
                        border: `1px solid ${theme.colors.border}`,
                    }}
                >
                    {item.isSet ? (
                        <Package className="w-6 h-6" style={{ color: theme.colors.secondary }} />
                    ) : item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                    ) : null}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm" style={{ color: theme.colors.textPrimary }}>
                        {item.name}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={dec} className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90">
                        {item.quantity === 1 ? (
                            <Trash2 className="w-4 h-4 text-red-500" />
                        ) : (
                            <Minus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                        )}
                    </button>
                    <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                    <button onClick={inc} className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90">
                        <Plus className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                    </button>
                </div>
            </div>
        </>
    );
});
CartItem.displayName = 'CartItem';

const CartSuccess = ({ theme }) => (
    <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
            Order Submitted!
        </h2>
        <p className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
            Thank you for your order. Your items will be shipped to you shortly.
        </p>
        <div className="flex items-center justify-center mt-4 space-x-2">
            <button 
                onClick={() => window.print()} 
                className="px-4 py-2 text-sm font-semibold rounded-full active:scale-95" 
                style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
            >
                Print Receipt
            </button>
            <button 
                onClick={() => (window.location.href = '/home')} 
                className="px-4 py-2 text-sm font-semibold rounded-full active:scale-95" 
                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
            >
                Back to Home
            </button>
        </div>
    </div>
);

export const CartScreen = ({ theme, onNavigate, cart, setCart, onUpdateCart, userSettings, dealerDirectory, designFirms }) => {
    const [shipToName, setShipToName] = useState('');
    const [address1, setAddress1] = useState(userSettings?.homeAddress || '');
    const [address2, setAddress2] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showDir, setShowDir] = useState(false);

    const cartItems = useMemo(() => {
        return Object.entries(cart)
            .map(([id, quantity]) => {
                if (id === 'full-jsi-set') return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
                if (id.startsWith('set-')) {
                    const categoryId = id.replace('set-', '');
                    const categoryName = SAMPLE_CATEGORIES.find((c) => c.id === categoryId)?.name || 'Unknown';
                    return { id, name: `Complete ${categoryName} Set`, quantity, isSet: true };
                }
                const product = SAMPLE_PRODUCTS.find((p) => String(p.id) === id);
                return product ? { ...product, quantity, isSet: false } : null;
            })
            .filter(Boolean);
    }, [cart]);

    const totalCartItems = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);

    const handleSelectFromDir = useCallback((sel) => {
        setShipToName(sel.name || '');
        setAddress1(sel.address1 || '');
    }, []);

    const submit = useCallback(() => {
        setIsSubmitted(true);
        setTimeout(() => {
            setCart({});
            onNavigate('home');
        }, 1200);
    }, [setCart, onNavigate]);

    if (isSubmitted) return <CartSuccess theme={theme} />;

    const canSubmit = totalCartItems > 0 && shipToName.trim() && address1.trim();

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="h-12" />
                <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                    <GlassCard theme={theme} className="p-2">
                        <h3 className="font-bold text-xl px-2 pt-2" style={{ color: theme.colors.textPrimary }}>
                            Cart
                        </h3>
                        {cartItems.length > 0 ? (
                            <div className="mt-2">
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
                        ) : (
                            <p className="text-sm p-4 text-center" style={{ color: theme.colors.textSecondary }}>
                                Your cart is empty.
                            </p>
                        )}
                    </GlassCard>
                </div>

                <div className="px-4 space-y-3 pt-3 pb-4 border-t" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
                    <GlassCard theme={theme} className="p-3 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold px-1" style={{ color: theme.colors.textPrimary }}>Ship To</h3>
                            <div className="flex items-center gap-2">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setShowDir(true)}
                                    onKeyPress={e => { if (e.key === 'Enter') setShowDir(true); }}
                                    className="flex items-center gap-1.5 text-sm font-semibold p-2 rounded-lg active:scale-95 cursor-pointer"
                                    style={{ userSelect: 'none' }}
                                >
                                    <Users className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                                    <span>Directory</span>
                                </div>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        setShipToName('Home');
                                        setAddress1(userSettings?.homeAddress || '');
                                        setAddress2('');
                                    }}
                                    onKeyPress={e => { if (e.key === 'Enter') {
                                        setShipToName('Home');
                                        setAddress1(userSettings?.homeAddress || '');
                                        setAddress2('');
                                    }}}
                                    className="flex items-center gap-1.5 text-sm font-semibold p-2 rounded-lg active:scale-95 cursor-pointer"
                                    style={{ userSelect: 'none' }}
                                >
                                    <Home className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                                    <span>Use Home</span>
                                </div>
                            </div>
                        </div>

                        <input
                            value={shipToName}
                            onChange={(e) => setShipToName(e.target.value)}
                            placeholder="Recipient name"
                            className="w-full rounded-lg px-3 py-2 outline-none"
                            style={{ 
                                background: theme.colors.subtle, 
                                border: `1px solid ${theme.colors.border}`, 
                                color: theme.colors.textPrimary 
                            }}
                        />
                        <input
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                            placeholder="Address"
                            className="w-full rounded-lg px-3 py-2 outline-none"
                            style={{ 
                                background: theme.colors.subtle, 
                                border: `1px solid ${theme.colors.border}`, 
                                color: theme.colors.textPrimary 
                            }}
                        />
                        <input
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                            placeholder="Suite / Apt (optional)"
                            className="w-full rounded-lg px-3 py-2 outline-none"
                            style={{ 
                                background: theme.colors.subtle, 
                                border: `1px solid ${theme.colors.border}`, 
                                color: theme.colors.textPrimary 
                            }}
                        />
                    </GlassCard>

                    <button
                        onClick={submit}
                        disabled={!canSubmit}
                        className="w-full font-bold py-3.5 px-6 rounded-full active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}
                    >
                        Submit Order ({totalCartItems} Items)
                    </button>
                </div>
            </div>

            <DirectoryModal
                show={showDir}
                onClose={() => setShowDir(false)}
                onSelect={handleSelectFromDir}
                theme={theme}
                dealers={dealerDirectory}
                designFirms={designFirms}
            />
        </>
    );
};
