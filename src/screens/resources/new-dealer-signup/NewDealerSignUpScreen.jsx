import React, { useState } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { FormInput, PortalNativeSelect } from '../../../components/common/FormComponents.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { UserPlus, Building2, FileText, MapPin, Mail } from 'lucide-react';
import { BUSINESS_TYPES, INSTALLATION_OPTIONS, MARKETS, DISCOUNT_OPTIONS } from './data.js';

export const NewDealerSignUpScreen = ({ theme, setSuccessMessage, onNavigate, handleAddDealer }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        title: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        businessType: 'Dealer',
        yearsInBusiness: '',
        marketsFocused: [],
        currentBrands: '',
        showroomSize: '',
        salesTeamSize: '',
        designTeamSize: '',
        installationCapability: 'In-house',
        warehouseSpace: '',
        references: '',
        additionalInfo: '',
        dailyDiscount: ''
    });

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // This is the initial submit handler for the main button
    const handleInitialSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.companyName || !formData.contactName || !formData.email || !formData.dailyDiscount) {
            alert('Please fill in all required fields.');
            return;
        }
        // Open the confirmation modal
        setShowConfirmModal(true);
    };

    // This function runs only after the user confirms in the modal
    const handleFinalSubmit = () => {
        // Call the dealer handler if available
        if (handleAddDealer) {
            handleAddDealer({ 
                dealerName: formData.companyName, 
                email: formData.email, 
                dailyDiscount: formData.dailyDiscount 
            });
        }

        setShowConfirmModal(false); // Close the confirmation modal

        // Reset form
        setFormData({
            companyName: '',
            contactName: '',
            title: '',
            email: '',
            phone: '',
            website: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            businessType: 'Dealer',
            yearsInBusiness: '',
            marketsFocused: [],
            currentBrands: '',
            showroomSize: '',
            salesTeamSize: '',
            designTeamSize: '',
            installationCapability: 'In-house',
            warehouseSpace: '',
            references: '',
            additionalInfo: '',
            dailyDiscount: ''
        });

        // Use the existing success message and navigation system
        if (setSuccessMessage) {
            setSuccessMessage("Dealer Registration Submitted!");
            setTimeout(() => {
                setSuccessMessage("");
                if (onNavigate) {
                    onNavigate('resources');
                }
            }, 1500);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMarketToggle = (market) => {
        setFormData(prev => ({
            ...prev,
            marketsFocused: prev.marketsFocused.includes(market)
                ? prev.marketsFocused.filter(m => m !== market)
                : [...prev.marketsFocused, market]
        }));
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="New Dealer Sign-Up" theme={theme} />

            <div className="px-4 pb-4">
                <GlassCard theme={theme} className="p-4 mb-4">
                    <div className="flex items-start space-x-3">
                        <UserPlus className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
                        <div>
                            <h3 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                Become a JSI Authorized Dealer
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Join our network of authorized dealers and gain access to JSI's complete 
                                product line, competitive pricing, and comprehensive support.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-4">
                    <form onSubmit={handleInitialSubmit} className="space-y-6">
                        {/* Company Information */}
                        <GlassCard theme={theme} className="p-4">
                            <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: theme.colors.textPrimary }}>
                                <Building2 className="w-5 h-5 mr-2" />
                                Company Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Company Name *"
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Website"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    theme={theme}
                                    placeholder="https://..."
                                />
                                <PortalNativeSelect
                                    label="Business Type"
                                    value={formData.businessType}
                                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                                    theme={theme}
                                    options={BUSINESS_TYPES}
                                />
                                <FormInput
                                    label="Years in Business"
                                    type="number"
                                    value={formData.yearsInBusiness}
                                    onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                                    theme={theme}
                                    min="0"
                                />
                            </div>
                        </GlassCard>

                        {/* Contact Information */}
                        <GlassCard theme={theme} className="p-4">
                            <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: theme.colors.textPrimary }}>
                                <Mail className="w-5 h-5 mr-2" />
                                Primary Contact
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Contact Name *"
                                    value={formData.contactName}
                                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    theme={theme}
                                />
                                <FormInput
                                    label="Email *"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    theme={theme}
                                />
                            </div>
                        </GlassCard>

                        {/* Daily Discount */}
                        <GlassCard theme={theme} className="p-4">
                            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.colors.textPrimary }}>
                                Pricing Information
                            </h3>
                            <PortalNativeSelect
                                label="Daily Discount *"
                                value={formData.dailyDiscount}
                                onChange={(e) => handleInputChange('dailyDiscount', e.target.value)}
                                options={DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                                placeholder="Select a discount"
                                theme={theme}
                                required
                            />
                        </GlassCard>

                        {/* Location */}
                        <GlassCard theme={theme} className="p-4">
                            <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: theme.colors.textPrimary }}>
                                <MapPin className="w-5 h-5 mr-2" />
                                Business Location
                            </h3>
                            <div className="space-y-4">
                                <FormInput
                                    label="Address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    theme={theme}
                                />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <FormInput
                                        label="City"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        theme={theme}
                                    />
                                    <FormInput
                                        label="State"
                                        value={formData.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        theme={theme}
                                    />
                                    <FormInput
                                        label="Zip Code"
                                        value={formData.zipCode}
                                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                        theme={theme}
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Business Details */}
                        <GlassCard theme={theme} className="p-4">
                            <h3 className="font-semibold text-lg mb-4" style={{ color: theme.colors.textPrimary }}>
                                Business Details
                            </h3>
                            
                            {/* Markets Served */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                                    Markets Served
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {MARKETS.map((market) => (
                                        <label key={market} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.marketsFocused.includes(market)}
                                                onChange={() => handleMarketToggle(market)}
                                                className="rounded"
                                                style={{ accentColor: theme.colors.accent }}
                                            />
                                            <span className="text-sm" style={{ color: theme.colors.textPrimary }}>
                                                {market}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <FormInput
                                    label="Showroom Size (sq ft)"
                                    value={formData.showroomSize}
                                    onChange={(e) => handleInputChange('showroomSize', e.target.value)}
                                    theme={theme}
                                />
                                <FormInput
                                    label="Warehouse Space (sq ft)"
                                    value={formData.warehouseSpace}
                                    onChange={(e) => handleInputChange('warehouseSpace', e.target.value)}
                                    theme={theme}
                                />
                                <FormInput
                                    label="Sales Team Size"
                                    type="number"
                                    value={formData.salesTeamSize}
                                    onChange={(e) => handleInputChange('salesTeamSize', e.target.value)}
                                    theme={theme}
                                    min="0"
                                />
                                <FormInput
                                    label="Design Team Size"
                                    type="number"
                                    value={formData.designTeamSize}
                                    onChange={(e) => handleInputChange('designTeamSize', e.target.value)}
                                    theme={theme}
                                    min="0"
                                />
                            </div>

                            <div className="mb-4">
                                <PortalNativeSelect
                                    label="Installation Capability"
                                    value={formData.installationCapability}
                                    onChange={(e) => handleInputChange('installationCapability', e.target.value)}
                                    theme={theme}
                                    options={INSTALLATION_OPTIONS}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Current Furniture Brands Carried
                                </label>
                                <textarea
                                    value={formData.currentBrands}
                                    onChange={(e) => handleInputChange('currentBrands', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        border: `1px solid ${theme.colors.border}`,
                                        color: theme.colors.textPrimary
                                    }}
                                    rows="2"
                                    placeholder="List other furniture brands you currently represent..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Business References
                                </label>
                                <textarea
                                    value={formData.references}
                                    onChange={(e) => handleInputChange('references', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        border: `1px solid ${theme.colors.border}`,
                                        color: theme.colors.textPrimary
                                    }}
                                    rows="3"
                                    placeholder="Provide business references (company names and contact information)..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Additional Information
                                </label>
                                <textarea
                                    value={formData.additionalInfo}
                                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        border: `1px solid ${theme.colors.border}`,
                                        color: theme.colors.textPrimary
                                    }}
                                    rows="3"
                                    placeholder="Tell us why you'd like to become a JSI dealer and any other relevant information..."
                                />
                            </div>
                        </GlassCard>

                        <div className="pb-4">
                            <button
                                type="submit"
                                className="w-full font-bold py-3 px-6 rounded-lg text-white"
                                style={{ backgroundColor: theme.colors.accent }}
                            >
                                Submit Application
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Registration" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>
                    This will send the credit application and required documentation to the admin email provided:
                    <strong className="block text-center my-3 text-lg">{formData.email}</strong>
                    Are you sure you want to proceed?
                </p>
                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t" style={{ borderColor: theme.colors.border }}>
                    <button
                        type="button"
                        onClick={() => setShowConfirmModal(false)}
                        className="font-bold py-2 px-5 rounded-lg"
                        style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleFinalSubmit}
                        className="font-bold py-2 px-5 rounded-lg text-white"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Submit
                    </button>
                </div>
            </Modal>
        </div>
    );
};