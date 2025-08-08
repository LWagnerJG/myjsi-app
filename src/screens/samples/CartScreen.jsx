import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { AddressBookModal } from '../../components/common/AddressBookModal.jsx';
import { Package, CheckCircle, Users, Home, Trash2, Minus, Plus } from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES } from '../../data/samples.js';
import { CART_CONSTANTS, ORDER_STATUS } from './cart-data.js';

// Cart item component for better organization
const CartItem = React.memo(({ 
    item, 
    onUpdateCart, 
    theme,
    isLast = false 
}) => {
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
                    className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center" 
                    style={{ 
                        backgroundColor: item.isSet ? theme.colors.subtle : item.color, 
                        border: `1px solid ${theme.colors.border}` 
                    }}
                >
                    {item.isSet && (
                        <Package className="w-6 h-6" style={{ color: theme.colors.secondary }} />
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
                    <p className="font-semibold truncate text-sm" style={{ color: theme.colors.textPrimary }}>
                        {item.name}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleDecrease} 
                        className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-90 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        {item.quantity === 1 ? (
                            <Trash2 className="w-4 h-4 text-red-500" />
                        ) : (
                            <Minus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                        )}
                    </button>
                    <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                    <button 
                        onClick={handleIncrease} 
                        className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-90 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <Plus className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                    </button>
                </div>
            </div>
        </>
    );
});

CartItem.displayName = 'CartItem';

// Cart success component
const CartSuccess = ({ theme }) => {
    return (
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
                    className="px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 transform active:scale-95" 
                    style={{ 
                        backgroundColor: theme.colors.accent, 
                        color: '#FFFFFF' 
                    }}
                >
                    Print Receipt
                </button>
                <button 
                    onClick={() => window.location.href = '/home'} 
                    className="px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 transform active:scale-95" 
                    style={{ 
                        backgroundColor: theme.colors.subtle, 
                        color: theme.colors.textPrimary 
                    }}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

// Cart screen with improved organization
export const CartScreen = ({ 
    theme, 
    onNavigate, 
    cart, 
    setCart, 
    onUpdateCart, 
    userSettings, 
    dealerDirectory 
}) => {
    const [address, setAddress] = useState(userSettings?.homeAddress || '');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Memoized cart processing
    const cartItems = useMemo(() => {
        if (!SAMPLE_PRODUCTS || !SAMPLE_CATEGORIES) return [];
        
        return Object.entries(cart).map(([id, quantity]) => {
            if (id === 'full-jsi-set') {
                return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
            }
            
            if (id.startsWith('set-')) {
                const categoryId = id.replace('set-', '');
                const categoryName = SAMPLE_CATEGORIES.find(c => c.id === categoryId)?.name || 'Unknown';
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

    // Handlers
    const handleSelectAddress = useCallback((selectedAddress) => {
        setAddress(selectedAddress);
        setShowAddressModal(false);
    }, []);

    const handleSubmit = useCallback(() => {
        setIsSubmitted(true);
        setTimeout(() => {
            setCart({});
            onNavigate('home');
        }, 1200);
    }, [setCart, onNavigate]);

    const handleUseHomeAddress = useCallback(() => {
        setAddress(userSettings?.homeAddress || '');
    }, [userSettings?.homeAddress]);

    const handleShowAddressModal = useCallback(() => {
        setShowAddressModal(true);
    }, []);

    const handleCloseAddressModal = useCallback(() => {
        setShowAddressModal(false);
    }, []);

    const handleBackToSamples = useCallback(() => {
        onNavigate('samples');
    }, [onNavigate]);

    if (isSubmitted) {
        return <CartSuccess theme={theme} />;
    }

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Increased spacer to lower the cart content */}
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

                <div 
                    className="px-4 space-y-3 pt-3 pb-4 border-t" 
                    style={{ 
                        backgroundColor: theme.colors.background, 
                        borderColor: theme.colors.border 
                    }}
                >
                    <GlassCard theme={theme} className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold px-1" style={{ color: theme.colors.textPrimary }}>
                                Ship To
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={handleShowAddressModal}
                                    className="flex items-center space-x-1.5 text-sm font-semibold p-2 rounded-lg hover:bg-black/5 transition-all duration-200 transform active:scale-95"
                                >
                                    <Users className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                                    <span>Directory</span>
                                </button>
                                <button 
                                    onClick={handleUseHomeAddress}
                                    className="flex items-center space-x-1.5 text-sm font-semibold p-2 rounded-lg hover:bg-black/5 transition-all duration-200 transform active:scale-95"
                                >
                                    <Home className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                                    <span>Use Home</span>
                                </button>
                            </div>
                        </div>
                        <textarea 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            rows="3" 
                            placeholder="Enter shipping address..." 
                            className="w-full p-2 border rounded-lg" 
                            style={{ 
                                backgroundColor: theme.colors.subtle, 
                                borderColor: theme.colors.border, 
                                color: theme.colors.textPrimary, 
                                resize: 'none' 
                            }}
                        />
                    </GlassCard>
                    
                    <button 
                        onClick={handleSubmit} 
                        disabled={Object.keys(cart).length === 0 || !(address || '').trim()} 
                        className="w-full font-bold py-3.5 px-6 rounded-full transition-all duration-200 transform active:scale-95 disabled:opacity-50" 
                        style={{ 
                            backgroundColor: theme.colors.accent, 
                            color: '#FFFFFF' 
                        }}
                    >
                        Submit Order ({totalCartItems} Items)
                    </button>
                </div>
            </div>
            
            <AddressBookModal 
                show={showAddressModal} 
                onClose={handleCloseAddressModal} 
                addresses={dealerDirectory} 
                onSelectAddress={handleSelectAddress} 
                theme={theme} 
            />
        </>
    );
};