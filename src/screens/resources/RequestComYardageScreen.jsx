import React, { useState } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { FormInput, PortalNativeSelect } from '../../components/common/FormComponents.jsx';
import { Package, Ruler, FileText, Calendar } from 'lucide-react';

export const RequestComYardageScreen = ({ theme, setSuccessMessage }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        dealerName: '',
        contactName: '',
        email: '',
        phone: '',
        fabricManufacturer: '',
        fabricName: '',
        fabricPattern: '',
        colorway: '',
        yardsRequested: '',
        applicationDescription: '',
        urgency: 'Standard',
        requiredDate: '',
        shippingAddress: '',
        specialInstructions: ''
    });

    const urgencyOptions = [
        { label: 'Standard (2-3 weeks)', value: 'Standard' },
        { label: 'Rush (1 week)', value: 'Rush' },
        { label: 'Emergency (ASAP)', value: 'Emergency' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Reset form
        setFormData({
            projectName: '',
            dealerName: '',
            contactName: '',
            email: '',
            phone: '',
            fabricManufacturer: '',
            fabricName: '',
            fabricPattern: '',
            colorway: '',
            yardsRequested: '',
            applicationDescription: '',
            urgency: 'Standard',
            requiredDate: '',
            shippingAddress: '',
            specialInstructions: ''
        });

        if (setSuccessMessage) {
            setSuccessMessage('COM yardage request submitted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Request COM Yardage" theme={theme} />

            <div className="px-4 pb-4">
                <GlassCard theme={theme} className="p-4 mb-4">
                    <div className="flex items-start space-x-3">
                        <Package className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
                        <div>
                            <h3 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                Customer's Own Material (COM) Request
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Request fabric yardage for COM applications. Please provide detailed 
                                fabric information and project specifications for accurate ordering.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Project Information */}
                        <GlassCard theme={theme} className="p-4">
                            <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: theme.colors.textPrimary }}>
                                <FileText className="w-5 h-5 mr-2" />
                                Project Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Project Name"
                                    value={formData.projectName}
                                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Dealer Name"
                                    value={formData.dealerName}
                                    onChange={(e) => handleInputChange('dealerName', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Contact Name"
                                    value={formData.contactName}
                                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Email"
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
                                    required
                                />
                            </div>
                        </GlassCard>

                        {/* Fabric Details */}
                        <GlassCard theme={theme} className="p-4">
                            <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: theme.colors.textPrimary }}>
                                <Ruler className="w-5 h-5 mr-2" />
                                Fabric Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Fabric Manufacturer"
                                    value={formData.fabricManufacturer}
                                    onChange={(e) => handleInputChange('fabricManufacturer', e.target.value)}
                                    theme={theme}
                                    required
                                    placeholder="e.g., Maharam, Momentum, Kvadrat"
                                />
                                <FormInput
                                    label="Fabric Name/Collection"
                                    value={formData.fabricName}
                                    onChange={(e) => handleInputChange('fabricName', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Pattern Number"
                                    value={formData.fabricPattern}
                                    onChange={(e) => handleInputChange('fabricPattern', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Colorway"
                                    value={formData.colorway}
                                    onChange={(e) => handleInputChange('colorway', e.target.value)}
                                    theme={theme}
                                    required
                                />
                                <FormInput
                                    label="Yards Requested"
                                    type="number"
                                    value={formData.yardsRequested}
                                    onChange={(e) => handleInputChange('yardsRequested', e.target.value)}
                                    theme={theme}
                                    required
                                    min="1"
                                    step="0.25"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Application Description
                                </label>
                                <textarea
                                    value={formData.applicationDescription}
                                    onChange={(e) => handleInputChange('applicationDescription', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        border: `1px solid ${theme.colors.border}`,
                                        color: theme.colors.textPrimary
                                    }}
                                    rows="3"
                                    placeholder="Describe what furniture pieces will use this fabric (e.g., '24 Arwyn chairs, 6 ottomans')..."
                                    required
                                />
                            </div>
                        </GlassCard>

                        {/* Timing & Delivery */}
                        <GlassCard theme={theme} className="p-4">
                            <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: theme.colors.textPrimary }}>
                                <Calendar className="w-5 h-5 mr-2" />
                                Timing & Delivery
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <PortalNativeSelect
                                    label="Request Urgency"
                                    value={formData.urgency}
                                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                                    theme={theme}
                                    options={urgencyOptions}
                                />
                                <FormInput
                                    label="Required Date"
                                    type="date"
                                    value={formData.requiredDate}
                                    onChange={(e) => handleInputChange('requiredDate', e.target.value)}
                                    theme={theme}
                                    required
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Shipping Address
                                </label>
                                <textarea
                                    value={formData.shippingAddress}
                                    onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        border: `1px solid ${theme.colors.border}`,
                                        color: theme.colors.textPrimary
                                    }}
                                    rows="3"
                                    placeholder="Complete shipping address including contact person and phone number..."
                                    required
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Special Instructions
                                </label>
                                <textarea
                                    value={formData.specialInstructions}
                                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        border: `1px solid ${theme.colors.border}`,
                                        color: theme.colors.textPrimary
                                    }}
                                    rows="2"
                                    placeholder="Any special handling, cutting, or shipping instructions..."
                                />
                            </div>
                        </GlassCard>

                        <div className="pb-4">
                            <button
                                type="submit"
                                className="w-full font-bold py-3 px-6 rounded-lg text-white"
                                style={{ backgroundColor: theme.colors.accent }}
                            >
                                Submit COM Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};