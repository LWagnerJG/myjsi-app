import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { FormInput } from '../../components/common/FormComponents.jsx';
import { ShoppingCart, PlusCircle, ArrowLeft, CheckCircle, X, Search } from 'lucide-react';
import * as Data from '../../data.jsx';

export const LoanerPoolScreen = ({ theme, setSuccessMessage, onViewChange }) => {
    // --- STATE MANAGEMENT ---
    const [cartItems, setCartItems] = useState([]);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [currentView, setCurrentView] = useState('listing'); // 'listing' or 'cart'
    const [searchQuery, setSearchQuery] = useState('');

    const [requestForm, setRequestForm] = useState({
        dealerName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        duration: '',
        purpose: '',
        startDate: ''
    });

    // --- MEMOIZED VALUES ---
    const loanerProducts = useMemo(() => Data.LOANER_POOL_PRODUCTS || [], []);
    const cartItemIds = useMemo(() => new Set(cartItems.map(item => item.id)), [cartItems]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return loanerProducts;
        const lowercasedQuery = searchQuery.toLowerCase();
        return loanerProducts.filter(product =>
            product.name.toLowerCase().includes(lowercasedQuery) ||
            product.model.toLowerCase().includes(lowercasedQuery)
        );
    }, [loanerProducts, searchQuery]);

    // --- EFFECTS ---
    // Inform the parent component about the current view state for the header button
    useEffect(() => {
        if (onViewChange) {
            onViewChange(currentView);
        }
    }, [currentView, onViewChange]);


    // --- HANDLER FUNCTIONS ---
    const handleAddToCart = (event, productToAdd) => {
        event.stopPropagation();
        setCartItems(prev => [...prev, productToAdd]);
    };

    const handleRemoveFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    };

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        if (setSuccessMessage) {
            setSuccessMessage(`Request for ${cartItems.length} item(s) submitted!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        setCartItems([]);
        setCurrentView('listing');
        setRequestForm({
            dealerName: '', contactName: '', email: '', phone: '', address: '',
            duration: '', purpose: '', startDate: ''
        });
    };

    // --- SUB-COMPONENTS ---
    const ProductCard = ({ product }) => {
        const isInCart = cartItemIds.has(product.id);
        return (
            <div onClick={() => setViewingProduct(product)} className="text-left cursor-pointer">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden h-full flex flex-col">
                    <div className="w-full h-40 bg-gray-100">
                        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                        <div className="flex-1 mb-3">
                            <h3 className="font-semibold text-base text-gray-800">{product.name}</h3>
                            <p className="text-sm font-mono text-gray-500">Model: {product.model}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isInCart) {
                                    handleRemoveFromCart(product.id);
                                } else {
                                    handleAddToCart(e, product);
                                }
                            }}
                            className="w-full flex items-center justify-center px-3 py-1 rounded-full font-semibold text-sm transition-all active:scale-95"
                            style={{
                                backgroundColor: isInCart ? '#10b981' : theme.colors.accent,
                                color: 'white'
                            }}
                        >
                            {isInCart ? <CheckCircle className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
                            {isInCart ? 'Added' : 'Add to Request'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ProductDetailModal = () => (
        <Modal show={!!viewingProduct} onClose={() => setViewingProduct(null)} title="" theme={theme}>
            {viewingProduct && (
                <div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold">{viewingProduct.name}</h3>
                        <p className="text-sm font-mono text-gray-500">Model: {viewingProduct.model}</p>
                    </div>
                    <img src={viewingProduct.img} alt={viewingProduct.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                    <h4 className="font-bold mb-2">Specifications</h4>
                    <div className="space-y-1 text-sm">
                        {Object.entries(viewingProduct.specs).map(([key, value]) => (
                            <div key={key} className="flex">
                                <span className="font-medium w-24 flex-shrink-0 text-gray-500 capitalize">{key}:</span>
                                <span className="text-gray-800">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    );

    const CartView = () => (
        <div className="p-4 overflow-y-auto scrollbar-hide">
            <button onClick={() => setCurrentView('listing')} className="flex items-center font-bold mb-4 text-gray-600">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Products
            </button>
            <h2 className="text-2xl font-bold mb-4">Your Loaner Request</h2>
            <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="font-bold mb-3">Items ({cartItems.length})</h3>
                <div className="space-y-3 mb-6">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex items-center">
                            <img src={item.img} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-1 ml-3">
                                <p className="font-semibold text-sm">{item.name}</p>
                                <p className="text-xs font-mono text-gray-500">{item.model}</p>
                            </div>
                            <button onClick={() => handleRemoveFromCart(item.id)}>
                                <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                            </button>
                        </div>
                    ))}
                    {cartItems.length === 0 && <p className="text-sm text-center py-4 text-gray-500">Your request is empty.</p>}
                </div>
                {cartItems.length > 0 && (
                    <form onSubmit={handleRequestSubmit} className="space-y-4 border-t pt-6 border-gray-200">
                        <h3 className="font-bold">Request Details</h3>
                        <FormInput label="Dealer Name" value={requestForm.dealerName} onChange={(e) => setRequestForm(prev => ({ ...prev, dealerName: e.target.value }))} theme={theme} required />
                        <FormInput label="Ship to Contact Name" value={requestForm.contactName} onChange={(e) => setRequestForm(prev => ({ ...prev, contactName: e.target.value }))} theme={theme} required />
                        <FormInput label="Ship to Address" value={requestForm.address} onChange={(e) => setRequestForm(prev => ({ ...prev, address: e.target.value }))} theme={theme} required />
                        <FormInput label="Ship to Email" type="email" value={requestForm.email} onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))} theme={theme} required />
                        <FormInput label="Ship to Phone Number" value={requestForm.phone} onChange={(e) => setRequestForm(prev => ({ ...prev, phone: e.target.value }))} theme={theme} required />
                        <FormInput label="Start Date" type="date" value={requestForm.startDate} onChange={(e) => setRequestForm(prev => ({ ...prev, startDate: e.target.value }))} theme={theme} required />
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Expected Loan Time</label>
                            <select
                                value={requestForm.duration}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, duration: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white"
                                required
                            >
                                <option value="">Select duration...</option>
                                <option value="1 week">1 week</option>
                                <option value="2 weeks">2 weeks</option>
                                <option value="3 weeks">3 weeks</option>
                                <option value="1 month">1 month</option>
                                <option value="2 months">2 months</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Purpose of Request</label>
                            <textarea
                                value={requestForm.purpose}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, purpose: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                                rows="3"
                                placeholder="Describe how you plan to use this loaner product..."
                                required
                            />
                        </div>
                        <button type="submit" className="w-full font-bold py-3 px-5 rounded-xl text-white" style={{ backgroundColor: theme.colors.accent }}>
                            Submit Request for {cartItems.length} Item(s)
                        </button>
                    </form>
                )}
            </div>
        </div>
    );

    // --- RENDER LOGIC ---
    if (currentView === 'cart') {
        return <CartView />;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-4 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 py-3 pl-11 pr-4 rounded-full text-sm"
                        style={{ color: theme.colors.textPrimary }}
                    />
                </div>
                <button onClick={() => setCurrentView('cart')} className="relative flex-shrink-0">
                    <ShoppingCart className="w-7 h-7 text-gray-700" />
                    {cartItems.length > 0 && (
                        <span
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: theme.colors.accent }}
                        >
                            {cartItems.length}
                        </span>
                    )}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-4 grid grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-2 mt-8 text-center">
                            <p className="text-gray-500">No products found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
            <ProductDetailModal />
        </div>
    );
};