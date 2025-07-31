import React, { useState } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { FormInput } from '../../components/common/FormComponents.jsx';
import { Package, Calendar, MapPin, Mail } from 'lucide-react';
import * as Data from '../../data.jsx';

export const LoanerPoolScreen = ({ theme, setSuccessMessage }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
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

    const loanerProducts = Data.LOANER_POOL_PRODUCTS || [];

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        setShowRequestModal(false);
        setSelectedProduct(null);
        setRequestForm({
            dealerName: '',
            contactName: '',
            email: '',
            phone: '',
            address: '',
            duration: '',
            purpose: '',
            startDate: ''
        });
        
        if (setSuccessMessage) {
            setSuccessMessage('Loaner request submitted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const ProductCard = ({ product }) => (
        <GlassCard theme={theme} className="p-4">
            <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: theme.colors.subtle }}>
                    <img 
                        src={product.img} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                                {product.name}
                            </h3>
                            <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>
                                Model: {product.model}
                            </p>
                        </div>
                        <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                                backgroundColor: '#10b981' + '20',
                                color: '#10b981'
                            }}
                        >
                            Available
                        </span>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-1 mb-3">
                        {Object.entries(product.specs).map(([key, value]) => (
                            <div key={key} className="flex items-center text-sm">
                                <span className="font-medium w-20" style={{ color: theme.colors.textSecondary }}>
                                    {key}:
                                </span>
                                <span style={{ color: theme.colors.textPrimary }}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setSelectedProduct(product);
                            setShowRequestModal(true);
                        }}
                        className="px-4 py-2 rounded-lg font-medium text-sm"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        Request Loaner
                    </button>
                </div>
            </div>
        </GlassCard>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Loaner Pool" theme={theme} />

            <div className="px-4 pb-4">
                <GlassCard theme={theme} className="p-4 mb-4">
                    <div className="flex items-start space-x-3">
                        <Package className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
                        <div>
                            <h3 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                Product Loaner Program
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Request demonstration products for your showroom or client presentations. 
                                All loaner items are subject to availability and approval.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 space-y-3 pb-4">
                    {loanerProducts.length > 0 ? (
                        loanerProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <GlassCard theme={theme} className="p-8 text-center">
                            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                            <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                                No Products Available
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                No loaner products are currently available. Check back later.
                            </p>
                        </GlassCard>
                    )}
                </div>
            </div>

            {/* Request Modal */}
            <Modal 
                show={showRequestModal} 
                onClose={() => {
                    setShowRequestModal(false);
                    setSelectedProduct(null);
                }} 
                title={`Request Loaner: ${selectedProduct?.name || ''}`} 
                theme={theme}
            >
                <form onSubmit={handleRequestSubmit} className="space-y-4">
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
                    
                    <FormInput
                        label="Delivery Address"
                        value={requestForm.address}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, address: e.target.value }))}
                        theme={theme}
                        required
                    />
                    
                    <FormInput
                        label="Start Date"
                        type="date"
                        value={requestForm.startDate}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, startDate: e.target.value }))}
                        theme={theme}
                        required
                    />
                    
                    <FormInput
                        label="Duration (weeks)"
                        type="number"
                        value={requestForm.duration}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, duration: e.target.value }))}
                        theme={theme}
                        required
                        min="1"
                        max="12"
                    />
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                            Purpose of Request
                        </label>
                        <textarea
                            value={requestForm.purpose}
                            onChange={(e) => setRequestForm(prev => ({ ...prev, purpose: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{
                                backgroundColor: theme.colors.surface,
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.textPrimary
                            }}
                            rows="3"
                            placeholder="Describe how you plan to use this loaner product..."
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowRequestModal(false);
                                setSelectedProduct(null);
                            }}
                            className="font-bold py-2 px-5 rounded-lg"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="font-bold py-2 px-5 rounded-lg text-white"
                            style={{ backgroundColor: theme.colors.accent }}
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};