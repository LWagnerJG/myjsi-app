import React, { useState } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { FormInput, PortalNativeSelect } from '../../../components/common/FormComponents.jsx';
import { DISCOUNT_OPTIONS } from './data.js';

export const NewDealerSignUpScreen = ({ theme, setSuccessMessage, onNavigate, handleAddDealer }) => {
    const [formData, setFormData] = useState({ companyName: '', adminEmail: '', dailyDiscount: '' });
    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.companyName || !formData.adminEmail || !formData.dailyDiscount) return;
        handleAddDealer && handleAddDealer({ dealerName: formData.companyName, email: formData.adminEmail, dailyDiscount: formData.dailyDiscount });
        setSuccessMessage && setSuccessMessage('Dealer Submitted');
        setTimeout(() => { setSuccessMessage && setSuccessMessage(''); onNavigate && onNavigate('resources'); }, 1200);
        setFormData({ companyName: '', adminEmail: '', dailyDiscount: '' });
    };

    return (
        <div className="flex flex-col h-full app-header-offset">
            <PageTitle title="New Dealer Sign-Up" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide">
                <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-2 space-y-6">
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
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={!formData.companyName || !formData.adminEmail || !formData.dailyDiscount}
                                className="w-full font-bold py-4 px-6 rounded-full text-white transition disabled:opacity-50"
                                style={{ backgroundColor: theme.colors.accent }}
                            >
                                Submit
                            </button>
                        </div>
                    </GlassCard>
                </form>
            </div>
        </div>
    );
};