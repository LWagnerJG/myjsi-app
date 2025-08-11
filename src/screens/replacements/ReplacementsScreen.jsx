import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Camera, Image, AlertCircle, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import * as Data from '../../data.jsx';
import jsQR from 'jsqr';

export const ReplacementsScreen = ({ theme }) => {
    const [view, setView] = useState('list');
    const [isScanning, setIsScanning] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [formData, setFormData] = useState({ salesOrder: '', lineItem: '', notes: '' });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);
    const streamRef = useRef(null);

    const [replacementRequests, setReplacementRequests] = useState(
        Data.REPLACEMENT_REQUESTS_DATA || [
            { name: 'Arwyn Swivel Chair', date: '2023-05-21', status: 'Pending' },
            { name: 'Vision Conference Table', date: '2023-05-19', status: 'Approved' },
            { name: 'Moto Casegood', date: '2023-05-17', status: 'Rejected' }
        ]
    );

    const handleInputChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmitRequest = useCallback(() => {
        setReplacementRequests((prev) => [
            { name: `${formData.salesOrder} - ${formData.lineItem}`, date: new Date().toISOString().split('T')[0], status: 'Pending' },
            ...prev
        ]);
        setFormData({ salesOrder: '', lineItem: '', notes: '' });
        setView('list');
    }, [formData]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <Clock className="w-4 h-4" />;
            case 'Approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'Rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        const c = {
            Pending: theme.colors.accent + '22',
            Approved: '#22c55e22',
            Rejected: '#ef444422'
        };
        return c[status] || theme.colors.subtle;
    };

    const getStatusTextColor = (status) => {
        const c = {
            Pending: theme.colors.accent,
            Approved: '#16a34a',
            Rejected: '#dc2626'
        };
        return c[status] || theme.colors.textSecondary;
    };

    const stopScanning = useCallback(() => {
        setIsScanning(false);
        setCameraError(null);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startQRDetection = useCallback(() => {
        intervalRef.current = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
                try {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, canvas.width, canvas.height);
                    if (code) {
                        stopScanning();
                        setFormData({ salesOrder: 'SO-450080', lineItem: '001', notes: `Scanned QR Code: ${code.data}` });
                        setView('form');
                    }
                } catch { }
            }
        }, 320);
    }, [stopScanning]);

    const startScanning = useCallback(async () => {
        setCameraError(null);
        try {
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is not supported on this device');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().then(() => {
                        setIsScanning(true);
                        startQRDetection();
                    });
                };
            }
        } catch (error) {
            let msg = 'Unable to access camera. ';
            if (error.name === 'NotAllowedError') msg += 'Please allow camera permissions and try again.';
            else if (error.name === 'NotFoundError') msg += 'No camera found on this device.';
            else msg += error.message || 'Please try again.';
            setCameraError(msg);
            setIsScanning(false);
        }
    }, [startQRDetection]);

    useEffect(() => () => stopScanning(), [stopScanning]);

    const RequestCard = ({ request }) => (
        <button
            onClick={() => setSelectedRequest(request)}
            className="w-full text-left"
        >
            <div
                className="p-4 rounded-2xl flex items-center justify-between gap-3 transition-all active:scale-[0.98]"
                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
            >
                <div className="min-w-0">
                    <div className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                        {request.name || request.product}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                        {new Date(request.date).toLocaleDateString()}
                    </div>
                </div>
                <div
                    className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                    style={{ backgroundColor: getStatusColor(request.status), color: getStatusTextColor(request.status) }}
                >
                    {getStatusIcon(request.status)}
                    {request.status}
                </div>
            </div>
        </button>
    );

    const ReplacementForm = () => (
        <div className="space-y-4 px-4">
            <GlassCard theme={theme} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                        Sales Order
                    </label>
                    <input
                        value={formData.salesOrder}
                        onChange={(e) => handleInputChange('salesOrder', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                        Line Item
                    </label>
                    <input
                        value={formData.lineItem}
                        onChange={(e) => handleInputChange('lineItem', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                        Notes
                    </label>
                    <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                        placeholder="Describe the issue or parts needed..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                        Photos
                    </label>
                    <div
                        className="rounded-xl p-4 text-center"
                        style={{ border: `2px dashed ${theme.colors.border}`, color: theme.colors.textSecondary }}
                    >
                        <Image className="mx-auto mb-2 w-6 h-6" />
                        Add Photo
                    </div>
                </div>
            </GlassCard>

            <div className="flex gap-3 pt-1">
                <button
                    onClick={() => setView('list')}
                    className="flex-1 py-3 rounded-full font-semibold active:scale-95"
                    style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                >
                    Back to Requests
                </button>
                <button
                    onClick={handleSubmitRequest}
                    className="flex-1 py-3 rounded-full font-semibold text-white active:scale-95"
                    style={{ backgroundColor: theme.colors.accent }}
                >
                    Submit Replacement
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {view === 'list' ? (
                    <div className="px-4 pt-4 pb-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                                Replacements
                            </h2>
                            <button
                                onClick={() => setView('form')}
                                className="px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1 active:scale-95"
                                style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                            >
                                New Request <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <GlassCard theme={theme} className="p-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div
                                    className="relative rounded-2xl overflow-hidden cursor-pointer"
                                    style={{
                                        border: `2px dashed ${isScanning ? theme.colors.accent : theme.colors.border}`,
                                        backgroundColor: theme.colors.surface
                                    }}
                                    onClick={!isScanning ? startScanning : undefined}
                                >
                                    <div className="p-4">
                                        {!isScanning && (
                                            <div className="text-center py-8">
                                                <Camera className="mx-auto mb-3 w-10 h-10" style={{ color: theme.colors.textSecondary }} />
                                                <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                    Scan QR Code
                                                </div>
                                                <div className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                                                    Tap to open camera
                                                </div>
                                                {cameraError && (
                                                    <div className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                                        {cameraError}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {isScanning && (
                                            <div className="relative w-full h-[340px]">
                                                <style>{`
                          @keyframes scanLine { 0% { transform: translateY(0) } 100% { transform: translateY(100%) } }
                        `}</style>
                                                <video
                                                    ref={videoRef}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    playsInline
                                                    muted
                                                    autoPlay
                                                />
                                                <canvas ref={canvasRef} className="hidden" />
                                                <div
                                                    className="absolute inset-0 pointer-events-none"
                                                    style={{
                                                        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.45)'
                                                    }}
                                                />
                                                <div
                                                    className="absolute left-4 right-4 h-0.5"
                                                    style={{
                                                        top: 16,
                                                        background: theme.colors.accent,
                                                        opacity: 0.9,
                                                        animation: 'scanLine 2.2s linear infinite'
                                                    }}
                                                />
                                                <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#0009', color: '#fff' }}>
                                                    Scanning…
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        stopScanning();
                                                    }}
                                                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-sm font-semibold text-white active:scale-95"
                                                    style={{ backgroundColor: '#ef4444' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="rounded-2xl p-4 cursor-pointer active:scale-[0.99]"
                                    onClick={() => {
                                        setFormData({ salesOrder: '', lineItem: '', notes: '' });
                                        setView('form');
                                    }}
                                    style={{ border: `2px dashed ${theme.colors.border}`, backgroundColor: theme.colors.surface }}
                                >
                                    <div className="text-center">
                                        <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                            Enter Details Manually
                                        </div>
                                        <div className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                                            Fill out the form without scanning
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                    Previous Requests
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {replacementRequests.length ? (
                                    replacementRequests.map((r, i) => <RequestCard key={`${r.name}-${i}`} request={r} />)
                                ) : (
                                    <GlassCard theme={theme} className="p-8 text-center">
                                        <div className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                            No Previous Requests
                                        </div>
                                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                            Submit your first replacement request.
                                        </div>
                                    </GlassCard>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <ReplacementForm />
                )}
            </div>

            <Modal show={!!selectedRequest} onClose={() => setSelectedRequest(null)} title={selectedRequest?.name || ''} theme={theme}>
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                                style={{ backgroundColor: getStatusColor(selectedRequest.status), color: getStatusTextColor(selectedRequest.status) }}
                            >
                                {getStatusIcon(selectedRequest.status)}
                                {selectedRequest.status}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>
                                    Date
                                </div>
                                <div style={{ color: theme.colors.textPrimary }}>{new Date(selectedRequest.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
