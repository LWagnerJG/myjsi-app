import React, { useState, useMemo, useCallback } from 'react';
import { Modal } from '../../../components/common/Modal.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { ShoppingCart, PlusCircle, CheckCircle, X, Search, Package, ChevronUp, ChevronDown, Trash2, Plus, Home } from 'lucide-react';
import { LOANER_POOL_PRODUCTS, AVAILABILITY_STATUS, STATUS_LABELS, STATUS_COLORS, LOAN_DURATIONS, LOANER_LOCATIONS } from './data.js';

const RequestItem = React.memo(({ item, onRemoveFromRequest, theme, isLast = false }) => {
    return (
        <>
            {!isLast && (
                <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />
            )}
            <div className="flex items-center space-x-3 py-2 px-1">
                <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{
                        backgroundColor: theme.colors.subtle,
                        border: `1px solid ${theme.colors.border}`
                    }}
                >
                    <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-xs" style={{ color: theme.colors.textPrimary }}>
                        {item.name}
                    </p>
                    <p className="text-xs opacity-70" style={{ color: theme.colors.textSecondary }}>
                        {item.model}
                    </p>
                </div>
                <button
                    onClick={() => onRemoveFromRequest(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-90 hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <Trash2 className="w-3 h-3 text-red-500" />
                </button>
            </div>
        </>
    );
});

RequestItem.displayName = 'RequestItem';

const RequestDrawer = ({ requestItems, onRemoveFromRequest, onSubmitRequest, theme, userSettings }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [requestForm, setRequestForm] = useState({
        dealerName: '',
        contactName: '',
        email: '',
        phone: '',
        address: userSettings?.homeAddress || '',
        duration: '',
        purpose: '',
        startDate: ''
    });

    const totalRequestItems = useMemo(() => requestItems.length, [requestItems]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (requestItems.length === 0 || !requestForm.dealerName.trim() || !requestForm.contactName.trim() || !requestForm.address.trim()) return;
        
        onSubmitRequest(requestForm);
        
        // Reset form
        setRequestForm({
            dealerName: '',
            contactName: '',
            email: '',
            phone: '',
            address: userSettings?.homeAddress || '',
            duration: '',
            purpose: '',
            startDate: ''
        });
        setIsExpanded(false);
    }, [requestItems, requestForm, onSubmitRequest, userSettings?.homeAddress]);

    const handleUseHomeAddress = useCallback(() => {
        setRequestForm(prev => ({ ...prev, address: userSettings?.homeAddress || '' }));
    }, [userSettings?.homeAddress]);

    if (totalRequestItems === 0) return null;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-20 transition-all duration-300"
            style={{
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderTop: `1px solid ${theme.colors.border}`,
                maxHeight: isExpanded ? '80vh' : '80px',
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
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                            Request ({totalRequestItems})
                        </p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {requestItems.length} item{requestItems.length !== 1 ? 's' : ''}
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
                        {requestItems.map((item, index) => (
                            <RequestItem
                                key={item.id}
                                item={item}
                                onRemoveFromRequest={onRemoveFromRequest}
                                theme={theme}
                                isLast={index === 0}
                            />
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <FormInput 
                                label="Dealer Name" 
                                value={requestForm.dealerName} 
                                onChange={(e) => setRequestForm(prev => ({ ...prev, dealerName: e.target.value }))} 
                                theme={theme} 
                                required 
                            />
                            <FormInput 
                                label="Contact Name" 
                                value={requestForm.contactName} 
                                onChange={(e) => setRequestForm(prev => ({ ...prev, contactName: e.target.value }))} 
                                theme={theme} 
                                required 
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <FormInput 
                                label="Email" 
                                type="email" 
                                value={requestForm.email} 
                                onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))} 
                                theme={theme} 
                                required 
                            />
                            <FormInput 
                                label="Phone" 
                                value={requestForm.phone} 
                                onChange={(e) => setRequestForm(prev => ({ ...prev, phone: e.target.value }))} 
                                theme={theme} 
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                    Ship To Address
                                </label>
                                <button
                                    type="button"
                                    onClick={handleUseHomeAddress}
                                    className="flex items-center space-x-1 text-xs font-semibold p-1 rounded-lg hover:bg-black/5 transition-all duration-200"
                                >
                                    <Home className="w-3 h-3" style={{ color: theme.colors.secondary }} />
                                    <span>Use Home</span>
                                </button>
                            </div>
                            <textarea
                                value={requestForm.address}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, address: e.target.value }))}
                                rows="2"
                                placeholder="Enter shipping address..."
                                className="w-full p-2 border rounded-lg text-xs"
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.textPrimary,
                                    resize: 'none'
                                }}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormInput 
                                label="Start Date" 
                                type="date" 
                                value={requestForm.startDate} 
                                onChange={(e) => setRequestForm(prev => ({ ...prev, startDate: e.target.value }))} 
                                theme={theme} 
                                required 
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                    Loan Duration
                                </label>
                                <select
                                    value={requestForm.duration}
                                    onChange={(e) => setRequestForm(prev => ({ ...prev, duration: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        borderColor: theme.colors.border,
                                        color: theme.colors.textPrimary
                                    }}
                                    required
                                >
                                    <option value="">Select duration...</option>
                                    {LOAN_DURATIONS.map(duration => (
                                        <option key={duration.value} value={duration.label}>{duration.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                Purpose of Request
                            </label>
                            <textarea
                                value={requestForm.purpose}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, purpose: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                rows="2"
                                placeholder="Describe how you plan to use this loaner product..."
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.textPrimary,
                                    resize: 'none'
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={requestItems.length === 0 || !requestForm.dealerName.trim() || !requestForm.contactName.trim() || !requestForm.address.trim()}
                            className="w-full font-bold py-3 px-6 rounded-full transition-all duration-200 transform active:scale-95 disabled:opacity-50"
                            style={{
                                backgroundColor: theme.colors.accent,
                                color: '#FFFFFF'
                            }}
                        >
                            Submit Request ({totalRequestItems} Items)
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export const LoanerPoolScreen = ({ theme, setSuccessMessage, userSettings }) => {
    // --- STATE MANAGEMENT ---
    const [requestItems, setRequestItems] = useState([]);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- MEMOIZED VALUES ---
    const loanerProducts = useMemo(() => LOANER_POOL_PRODUCTS || [], []);
    const requestItemIds = useMemo(() => new Set(requestItems.map(item => item.id)), [requestItems]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return loanerProducts;
        const lowercasedQuery = searchQuery.toLowerCase();
        return loanerProducts.filter(product =>
            product.name.toLowerCase().includes(lowercasedQuery) ||
            product.model.toLowerCase().includes(lowercasedQuery)
        );
    }, [loanerProducts, searchQuery]);

    const totalRequestItems = useMemo(() => requestItems.length, [requestItems]);

    // --- HANDLER FUNCTIONS ---
    const handleAddToRequest = useCallback((event, productToAdd) => {
        event.stopPropagation();
        setRequestItems(prev => [...prev, productToAdd]);
    }, []);

    const handleRemoveFromRequest = useCallback((productId) => {
        setRequestItems(prev => prev.filter(item => item.id !== productId));
    }, []);

    const handleSubmitRequest = useCallback((formData) => {
        if (setSuccessMessage) {
            setSuccessMessage(`Request for ${requestItems.length} item(s) submitted!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        setRequestItems([]);
    }, [requestItems.length, setSuccessMessage]);

    // --- SUB-COMPONENTS ---
    const ProductCard = ({ product }) => {
        const isInRequest = requestItemIds.has(product.id);
        const isAvailable = product.status === AVAILABILITY_STATUS.AVAILABLE;
        
        return (
            <div onClick={() => setViewingProduct(product)} className="text-left cursor-pointer">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden h-full flex flex-col">
                    <div className="w-full h-40 bg-gray-100 relative">
                        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                        {!isAvailable && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {STATUS_LABELS[product.status]}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                        <div className="flex-1 mb-3">
                            <h3 className="font-semibold text-base text-gray-800">{product.name}</h3>
                            <p className="text-sm font-mono text-gray-500">Model: {product.model}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isInRequest) {
                                    handleRemoveFromRequest(product.id);
                                } else if (isAvailable) {
                                    handleAddToRequest(e, product);
                                }
                            }}
                            disabled={!isAvailable && !isInRequest}
                            className="w-full flex items-center justify-center px-3 py-1 rounded-full font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: isInRequest ? '#10b981' : (isAvailable ? theme.colors.accent : '#6b7280'),
                                color: 'white'
                            }}
                        >
                            {isInRequest ? (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Added
                                </>
                            ) : isAvailable ? (
                                <>
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    Add to Request
                                </>
                            ) : (
                                <>Unavailable</>
                            )}
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
                        <div className="mt-2">
                            <span 
                                className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                                style={{ 
                                    backgroundColor: STATUS_COLORS[viewingProduct.status] + '20',
                                    color: STATUS_COLORS[viewingProduct.status]
                                }}
                            >
                                {STATUS_LABELS[viewingProduct.status]}
                            </span>
                        </div>
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
                    <div className="mt-4 space-y-1 text-sm">
                        <div className="flex">
                            <span className="font-medium w-24 flex-shrink-0 text-gray-500">Location:</span>
                            <span className="text-gray-800">{viewingProduct.location}</span>
                        </div>
                        {viewingProduct.returnDate && (
                            <div className="flex">
                                <span className="font-medium w-24 flex-shrink-0 text-gray-500">Return Date:</span>
                                <span className="text-gray-800">{viewingProduct.returnDate}</span>
                            </div>
                        )}
                        {viewingProduct.estimatedReturn && (
                            <div className="flex">
                                <span className="font-medium w-24 flex-shrink-0 text-gray-500">Est. Return:</span>
                                <span className="text-gray-800">{viewingProduct.estimatedReturn}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );

    // --- RENDER LOGIC ---
    return (
        <div className="flex flex-col h-full" style={{ paddingBottom: totalRequestItems > 0 ? '80px' : '0' }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
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
                </div>

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

            <RequestDrawer
                requestItems={requestItems}
                onRemoveFromRequest={handleRemoveFromRequest}
                onSubmitRequest={handleSubmitRequest}
                theme={theme}
                userSettings={userSettings}
            />

            <ProductDetailModal />
        </div>
    );
};