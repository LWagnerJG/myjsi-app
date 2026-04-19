import React, { useState } from 'react';
import { AppScreenLayout } from '../../../components/common/AppScreenLayout.jsx';
import { FloatingSubmitCTA } from '../../../components/common/FloatingSubmitCTA.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { PortalNativeSelect } from '../../../components/forms/PortalNativeSelect.jsx';
import { DISCOUNT_OPTIONS } from './data.js';

export const NewDealerSignUpScreen = ({ theme, setSuccessMessage, onNavigate, handleAddDealer }) => {
    const [formData, setFormData] = useState({ companyName: '', adminEmail: '', dailyDiscount: '' });
    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const canSubmit = !!(formData.companyName && formData.adminEmail && formData.dailyDiscount);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.companyName || !formData.adminEmail || !formData.dailyDiscount) return;
        handleAddDealer && handleAddDealer({ dealerName: formData.companyName, email: formData.adminEmail, dailyDiscount: formData.dailyDiscount });
        setSuccessMessage && setSuccessMessage('Dealer Submitted');
        setTimeout(() => { setSuccessMessage && setSuccessMessage(''); onNavigate && onNavigate('resources'); }, 1200);
        setFormData({ companyName: '', adminEmail: '', dailyDiscount: '' });
    };

    return (
        <AppScreenLayout
            theme={theme}
            asForm
            onSubmit={handleSubmit}
            title="New Dealer Sign-Up"
            subtitle="Create a dealer account and assign a daily discount tier."
            maxWidthClass="max-w-content"
            horizontalPaddingClass="px-4"
            contentPaddingBottomClass="pb-28"
            contentClassName="pt-1 space-y-6"
            footer={(
                <FloatingSubmitCTA
                    theme={theme}
                    type="submit"
                    label="Submit Dealer Sign-Up"
                    disabled={!canSubmit}
                    visible
                />
            )}
        >
            <GlassCard theme={theme} className="p-5 md:p-6 space-y-5">
                <div className="space-y-5">
                    <FormInput
                        label="Company Name"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        theme={theme}
                        required
                        placeholder="Enter registered company name..."
                        whiteBg
                    />
                    <FormInput
                        label="Admin Email"
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        theme={theme}
                        required
                        placeholder="Enter email for administration contact..."
                        whiteBg
                    />
                    <PortalNativeSelect
                        label="Daily Discount"
                        value={formData.dailyDiscount}
                        onChange={(e) => handleInputChange('dailyDiscount', e.target.value)}
                        options={DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                        placeholder="Select a discount..."
                        theme={theme}
                        required
                        whiteBg
                    />
                </div>
            </GlassCard>
        </AppScreenLayout>
    );
};