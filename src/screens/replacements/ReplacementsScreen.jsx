import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Camera, Image, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import * as Data from '../../data.jsx';
import jsQR from 'jsqr';

export const ReplacementsScreen = ({ theme, onNavigate }) => {
    const [view, setView] = useState('list');
    const [isScanning, setIsScanning] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formData, setFormData] = useState({
        salesOrder: '',
        lineItem: '',
        notes: '',
    });
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);

    // Mock replacement requests data
    const [replacementRequests, setReplacementRequests] = useState(Data.REPLACEMENT_REQUESTS_DATA || []);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmitRequest = useCallback(() => {
        alert('Replacement request submitted successfully!');
        setReplacementRequests(prev => [
            {
                name: `${formData.salesOrder} - ${formData.lineItem}`,
                date: new Date().toLocaleDateString('en-US'),
                status: 'Pending',
            },
            ...prev,
        ]);
        setFormData({ salesOrder: '', lineItem: '', notes: '' });
        setView('list');
    }, [formData]);

    const handleRequestClick = useCallback((request) => {
        setSelectedRequest(request);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedRequest(null);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'Approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            Pending: theme.colors.accent + '30',
            Approved: '#4ade80' + '30',
            Rejected: '#f87171' + '30',
        };
        return colors[status] || theme.colors.subtle;
    };
    
    const getStatusTextColor = (status) => {
        const colors = {
            Pending: theme.colors.accent,
            Approved: '#16a34a',
            Rejected: '#dc2626',
        };
        return colors[status] || theme.colors.textSecondary;
    };

    const stopScanning = useCallback(() => {
        setIsScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startScanning = useCallback(() => {
        const initScanner = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setIsScanning(true);
                }

                intervalRef.current = setInterval(() => {
                    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA) {
                        if (canvasRef.current) {
                            canvasRef.current.height = videoRef.current.videoHeight;
                            canvasRef.current.width = videoRef.current.videoWidth;
                            const ctx = canvasRef.current.getContext('2d');
                            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                            const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                            const code = jsQR(imageData.data, canvasRef.current.width, canvasRef.current.height);
                            if (code) {
                                setFormData({
                                    salesOrder: 'SO-450080',
                                    lineItem: '001',
                                    notes: `Scanned from QR: ${code.data}`,
                                });
                                stopScanning();
                                setView('form');
                            }
                        }
                    }
                }, 500);
            } catch (error) {
                console.error('Error accessing camera:', error);
                alert('Unable to access camera. Please check permissions and try again.');
                setIsScanning(false);
            }
        };
        initScanner();
    }, [stopScanning]);

    useEffect(() => {
        return () => stopScanning();
    }, [stopScanning]);

    const RequestCard = ({ request, theme, onClick }) => (
        <button
            onClick={() => onClick(request)}
            className="w-full p-4 text-left rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between"
            style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
        >
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                    {request.name || request.product}
                </h3>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    {new Date(request.date).toLocaleDateString()}
                </p>
            </div>
            <div
                className="px-3 py-1 rounded-full text-sm font-medium flex-shrink-0"
                style={{ backgroundColor: getStatusColor(request.status), color: getStatusTextColor(request.status) }}
            >
                {request.status}
            </div>
        </button>
    );

    const RequestsList = () => (
        <div className="space-y-3">
            {replacementRequests.length > 0 ? (
                replacementRequests.map((request, index) => (
                    <RequestCard
                        key={index}
                        request={request}
                        theme={theme}
                        onClick={handleRequestClick}
                    />
                ))
            ) : (
                <GlassCard theme={theme} className="p-8 text-center">
                    <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                        No Previous Requests
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        You haven't submitted any requests yet.
                    </p>
                </GlassCard>
            )}
        </div>
    );

    const ReplacementForm = () => (
        <div className="space-y-4 px-4">
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    Sales Order
                </label>
                <input
                    type="text"
                    value={formData.salesOrder}
                    onChange={(e) => handleInputChange('salesOrder', e.target.value)}
                    className="w-full p-3 rounded-lg text-sm"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textPrimary,
                    }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    Line Item
                </label>
                <input
                    type="text"
                    value={formData.lineItem}
                    onChange={(e) => handleInputChange('lineItem', e.target.value)}
                    className="w-full p-3 rounded-lg text-sm"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textPrimary,
                    }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    Notes
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Describe the issue or parts needed..."
                    rows={3}
                    className="w-full p-3 rounded-lg text-sm resize-none"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textPrimary,
                    }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                    Photos
                </label>
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                    style={{ color: theme.colors.textSecondary }}
                >
                    <Image className="mx-auto mb-2 w-6 h-6" />
                    Add Photo
                </div>
            </div>
            <div className="flex space-x-4 pt-4">
                <button
                    onClick={() => setView('list')}
                    className="flex-1 py-3 rounded-full font-semibold"
                    style={{ backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                >
                    Back to Requests
                </button>
                <button
                    onClick={handleSubmitRequest}
                    className="flex-1 py-3 rounded-full font-semibold"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    Submit Replacement
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title={view === 'form' ? "New Replacement" : "My JSI"} theme={theme} />
            
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {view === 'list' && (
                    <div className="px-4 pb-4 space-y-4">
                        <div 
                            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer overflow-hidden transition-all duration-300"
                            style={{ 
                                color: theme.colors.textSecondary,
                                borderColor: isScanning ? theme.colors.accent : 'rgb(209 213 219)',
                                height: isScanning ? '24rem' : 'auto'
                            }}
                            onClick={!isScanning ? startScanning : undefined}
                        >
                            {isScanning ? (
                                <div className="relative w-full h-full">
                                    <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover rounded-md" />
                                    <canvas ref={canvasRef} className="hidden" />
                                    <button 
                                        onClick={stopScanning}
                                        className="absolute bottom-2 right-2 px-3 py-1 text-xs bg-red-500 text-white rounded-full font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <Camera className="mx-auto mb-2 w-10 h-10" />
                                    Scan QR Code
                                </div>
                            )}
                        </div>

                        <div className="text-center" style={{ color: theme.colors.textSecondary }}>
                            OR
                        </div>
                        <div
                            onClick={() => {
                                setFormData({ salesOrder: '', lineItem: '', notes: '' });
                                setView('form');
                            }}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            Enter Details Manually
                        </div>
                        <h2 className="font-bold text-lg pt-4" style={{ color: theme.colors.textPrimary }}>
                            Previous Requests
                        </h2>
                        <RequestsList />
                    </div>
                )}

                {view === 'form' && <ReplacementForm />}
            </div>

            <Modal
                show={!!selectedRequest}
                onClose={handleCloseModal}
                title={selectedRequest?.name || selectedRequest?.product || ''}
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
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Date</div>
                                <div style={{ color: theme.colors.textPrimary }}>{new Date(selectedRequest.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};