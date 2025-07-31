import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { ToggleButtonGroup } from '../../components/common/ToggleButtonGroup.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { RotateCw, Search, Plus, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import * as Data from '../../data.jsx';

export const ReplacementsScreen = ({ theme, onNavigate }) => {
    const [view, setView] = useState('request');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formData, setFormData] = useState({
        productSeries: '',
        model: '',
        quantity: '',
        reason: '',
        description: '',
        urgency: 'Medium',
        customerInfo: '',
        orderNumber: ''
    });

    // Mock replacement requests data
    const replacementRequests = useMemo(() => [
        {
            id: 'REP-001',
            productSeries: 'Vision',
            model: 'VCT12048',
            quantity: 2,
            reason: 'Damaged in shipping',
            status: 'Pending',
            submittedDate: '2025-01-15',
            expectedDate: '2025-01-22',
            urgency: 'High'
        },
        {
            id: 'REP-002',
            productSeries: 'Arwyn',
            model: 'AW6007C',
            quantity: 1,
            reason: 'Manufacturing defect',
            status: 'Approved',
            submittedDate: '2025-01-10',
            expectedDate: '2025-01-18',
            urgency: 'Medium'
        },
        {
            id: 'REP-003',
            productSeries: 'Caav',
            model: 'CV4501A',
            quantity: 3,
            reason: 'Wrong configuration',
            status: 'Shipped',
            submittedDate: '2025-01-05',
            expectedDate: '2025-01-15',
            urgency: 'Low'
        }
    ], []);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmitRequest = useCallback(() => {
        // This would typically submit to an API
        alert('Replacement request submitted successfully!');
        setFormData({
            productSeries: '',
            model: '',
            quantity: '',
            reason: '',
            description: '',
            urgency: 'Medium',
            customerInfo: '',
            orderNumber: ''
        });
    }, []);

    const handleRequestClick = useCallback((request) => {
        setSelectedRequest(request);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedRequest(null);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'Approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'Shipped':
                return <Package className="w-5 h-5 text-blue-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'High':
                return '#ef4444';
            case 'Medium':
                return '#f59e0b';
            case 'Low':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };

    const RequestCard = ({ request, theme, onClick }) => (
        <button
            onClick={() => onClick(request)}
            className="w-full p-4 text-left rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {request.id}
                        </span>
                        <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                                backgroundColor: getUrgencyColor(request.urgency) + '20',
                                color: getUrgencyColor(request.urgency)
                            }}
                        >
                            {request.urgency}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: theme.colors.textPrimary }}>
                        {request.productSeries} - {request.model}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                        Quantity: {request.quantity} • {request.reason}
                    </p>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                        Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    {getStatusIcon(request.status)}
                    <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
                        {request.status}
                    </span>
                </div>
            </div>
        </button>
    );

    const RequestForm = () => (
        <div className="space-y-4">
            <GlassCard theme={theme} className="p-4 space-y-4">
                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    Product Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                            Product Series
                        </label>
                        <select
                            value={formData.productSeries}
                            onChange={(e) => handleInputChange('productSeries', e.target.value)}
                            className="w-full p-3 rounded-lg text-sm"
                            style={{ 
                                backgroundColor: theme.colors.surface, 
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.textPrimary
                            }}
                        >
                            <option value="">Select Series</option>
                            {Data.JSI_PRODUCT_SERIES?.map(series => (
                                <option key={series} value={series}>{series}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                            Model Number
                        </label>
                        <input
                            type="text"
                            value={formData.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                            placeholder="Enter model number"
                            className="w-full p-3 rounded-lg text-sm"
                            style={{ 
                                backgroundColor: theme.colors.surface, 
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.textPrimary
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                            Quantity
                        </label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => handleInputChange('quantity', e.target.value)}
                            placeholder="How many pieces?"
                            className="w-full p-3 rounded-lg text-sm"
                            style={{ 
                                backgroundColor: theme.colors.surface, 
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.textPrimary
                            }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                            Urgency Level
                        </label>
                        <select
                            value={formData.urgency}
                            onChange={(e) => handleInputChange('urgency', e.target.value)}
                            className="w-full p-3 rounded-lg text-sm"
                            style={{ 
                                backgroundColor: theme.colors.surface, 
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.textPrimary
                            }}
                        >
                            {Data.URGENCY_LEVELS?.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                        Reason for Replacement
                    </label>
                    <select
                        value={formData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        className="w-full p-3 rounded-lg text-sm"
                        style={{ 
                            backgroundColor: theme.colors.surface, 
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.textPrimary
                        }}
                    >
                        <option value="">Select reason</option>
                        <option value="Damaged in shipping">Damaged in shipping</option>
                        <option value="Manufacturing defect">Manufacturing defect</option>
                        <option value="Wrong configuration">Wrong configuration</option>
                        <option value="Customer request">Customer request</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Provide additional details about the replacement request..."
                        rows={3}
                        className="w-full p-3 rounded-lg text-sm resize-none"
                        style={{ 
                            backgroundColor: theme.colors.surface, 
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.textPrimary
                        }}
                    />
                </div>
            </GlassCard>

            <GlassCard theme={theme} className="p-4 space-y-4">
                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    Order Information
                </h3>
                
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                        Original Order Number
                    </label>
                    <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                        placeholder="Enter order number"
                        className="w-full p-3 rounded-lg text-sm"
                        style={{ 
                            backgroundColor: theme.colors.surface, 
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.textPrimary
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                        Customer Information
                    </label>
                    <input
                        type="text"
                        value={formData.customerInfo}
                        onChange={(e) => handleInputChange('customerInfo', e.target.value)}
                        placeholder="Customer name or company"
                        className="w-full p-3 rounded-lg text-sm"
                        style={{ 
                            backgroundColor: theme.colors.surface, 
                            border: `1px solid ${theme.colors.border}`,
                            color: theme.colors.textPrimary
                        }}
                    />
                </div>

                <button
                    onClick={handleSubmitRequest}
                    className="w-full py-3 px-6 rounded-full font-semibold"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    Submit Replacement Request
                </button>
            </GlassCard>
        </div>
    );

    const RequestsList = () => (
        <div className="space-y-3">
            {replacementRequests.length > 0 ? (
                replacementRequests.map((request) => (
                    <RequestCard
                        key={request.id}
                        request={request}
                        theme={theme}
                        onClick={handleRequestClick}
                    />
                ))
            ) : (
                <GlassCard theme={theme} className="p-8 text-center">
                    <RotateCw className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                    <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                        No Replacement Requests
                    </h3>
                    <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                        You haven't submitted any replacement requests yet.
                    </p>
                    <button
                        onClick={() => setView('request')}
                        className="px-6 py-3 rounded-full font-semibold"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        Submit First Request
                    </button>
                </GlassCard>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Replacements" theme={theme} />

            <div className="px-4 pb-4">
                <ToggleButtonGroup
                    value={view}
                    onChange={setView}
                    options={[
                        { label: 'Submit Request', value: 'request' },
                        { label: 'My Requests', value: 'list' }
                    ]}
                    theme={theme}
                />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-4">
                    {view === 'request' ? <RequestForm /> : <RequestsList />}
                </div>
            </div>

            <Modal 
                show={!!selectedRequest} 
                onClose={handleCloseModal} 
                title={`Request ${selectedRequest?.id || ''}`} 
                theme={theme}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(selectedRequest.status)}
                                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                    {selectedRequest.status}
                                </span>
                            </div>
                            <span 
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{ 
                                    backgroundColor: getUrgencyColor(selectedRequest.urgency) + '20',
                                    color: getUrgencyColor(selectedRequest.urgency)
                                }}
                            >
                                {selectedRequest.urgency} Priority
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Product</div>
                                <div style={{ color: theme.colors.textPrimary }}>
                                    {selectedRequest.productSeries} - {selectedRequest.model}
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Quantity</div>
                                <div style={{ color: theme.colors.textPrimary }}>{selectedRequest.quantity}</div>
                            </div>
                            <div>
                                <div className="font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Reason</div>
                                <div style={{ color: theme.colors.textPrimary }}>{selectedRequest.reason}</div>
                            </div>
                            <div>
                                <div className="font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Expected Date</div>
                                <div style={{ color: theme.colors.textPrimary }}>
                                    {new Date(selectedRequest.expectedDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};