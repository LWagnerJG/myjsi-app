import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Camera, Image, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { REPLACEMENT_REQUESTS_DATA } from './data.js';
import jsQR from 'jsqr';

function RequestCard({ r, theme, getStatusColor, getStatusText, getIcon, onClick }) {
    const dateText = new Date(r.date).toLocaleDateString();
    const dealerText = r.dealer || 'Unknown Dealer';
    return (
        <button onClick={onClick} className="w-full text-left">
            <GlassCard
                theme={theme}
                variant="minimal"
                interactive
                className="p-4 flex items-center justify-between gap-3"
            >
                <div className="min-w-0">
                    <div className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                        {r.name}
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: theme.colors.textSecondary }}>
                        {dealerText} • {dateText}
                    </div>
                </div>
                <div
                    className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                    style={{ backgroundColor: getStatusColor(r.status), color: getStatusText(r.status) }}
                >
                    {getIcon(r.status)} {r.status}
                </div>
            </GlassCard>
        </button>
    );
}

function ReplacementForm({
    theme,
    formData,
    onChange,
    onSubmit,
    fileInputRef,
    onPickPhotos,
    openPhotoPicker,
}) {
    return (
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
            <div className="max-w-5xl mx-auto w-full space-y-4">
            <GlassCard theme={theme} className="p-4 space-y-4" variant="minimal">
                <div>
                    <label className="block text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                        Sales Order
                    </label>
                    <input
                        value={formData.salesOrder}
                        onChange={(e) => onChange('salesOrder', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                        autoComplete="off"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                        Line Item
                    </label>
                    <input
                        value={formData.lineItem}
                        onChange={(e) => onChange('lineItem', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                        autoComplete="off"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                        Dealer
                    </label>
                    <input
                        value={formData.dealer}
                        onChange={(e) => onChange('dealer', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        placeholder="e.g., Acme Office Solutions"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                        autoComplete="off"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                        Notes
                    </label>
                    <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => onChange('notes', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                        placeholder="Describe the issue or parts needed..."
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                        Photos
                    </label>

                    {/* Previews (if any) */}
                    {Array.isArray(formData.photos) && formData.photos.length > 0 && (
                        <div className="mb-3 grid grid-cols-3 gap-2">
                            {formData.photos.map((src, idx) => (
                                <div key={idx} className="relative rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                                    <img src={src} alt={`Uploaded ${idx + 1}`} className="w-full h-24 object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        className="hidden"
                        onChange={onPickPhotos}
                    />

                    {/* Click target to open the file picker */}
                    <button
                        type="button"
                        onClick={openPhotoPicker}
                        className="w-full rounded-xl p-4 text-center"
                        style={{ border: `2px dashed ${theme.colors.border}`, color: theme.colors.textSecondary, backgroundColor: 'transparent' }}
                    >
                        <Image className="mx-auto mb-2 w-6 h-6" />
                        {formData.photos?.length ? 'Add More Photos' : 'Add Photo'}
                    </button>
                </div>
            </GlassCard>

            <div className="flex">
                <button
                    onClick={onSubmit}
                    className="flex-1 py-3 rounded-full font-semibold text-white active:scale-95"
                    style={{ backgroundColor: theme.colors.accent }}
                >
                    Submit Replacement
                </button>
            </div>
            </div>
        </div>
    );
}

export const ReplacementsScreen = ({ theme }) => {
    const [view, setView] = useState('list');
    const [isScanning, setIsScanning] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [formData, setFormData] = useState({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [] });
    const videoRef = useRef(null); const canvasRef = useRef(null); const intervalRef = useRef(null); const streamRef = useRef(null); const fileInputRef = useRef(null); const inFormRef = useRef(false);
    const [replacementRequests, setReplacementRequests] = useState((REPLACEMENT_REQUESTS_DATA || []).map(r => ({ name: r.name, dealer: r.dealer || '', date: r.date, status: r.status, photos: Array.isArray(r.photos)? r.photos: [] })));

    useEffect(() => { const onPop = () => { if (inFormRef.current) { setView('list'); setIsScanning(false); inFormRef.current = false; } }; window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);
    const goToForm = useCallback(() => { if (!inFormRef.current) { window.history.pushState({ jsiReplacements: 'form' }, ''); inFormRef.current = true; } setView('form'); }, []);
    const onChange = useCallback((k,v)=> setFormData(p => (p[k]===v? p : { ...p, [k]:v })), []);
    const submit = useCallback(()=> { setReplacementRequests(p => [{ name: `${formData.salesOrder} - ${formData.lineItem}`, dealer: formData.dealer?.trim() || 'Unknown Dealer', date: new Date().toISOString().split('T')[0], status: 'Pending', photos: formData.photos.slice() }, ...p]); setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [] }); setView('list'); inFormRef.current=false; }, [formData]);

    const getStatusColor = s => ({ Pending: theme.colors.accent + '22', Approved: '#22c55e22', Rejected: '#ef444422' }[s] || theme.colors.subtle);
    const getStatusText = s => ({ Pending: theme.colors.accent, Approved: '#16a34a', Rejected: '#dc2626' }[s] || theme.colors.textSecondary);
    const getIcon = s => s==='Pending'? <Clock className="w-4 h-4" /> : s==='Approved'? <CheckCircle className="w-4 h-4" /> : s==='Rejected'? <XCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;

    const stopScanning = useCallback(()=> { setIsScanning(false); setCameraError(null); if(streamRef.current){ streamRef.current.getTracks().forEach(t=>t.stop()); streamRef.current=null; } if(videoRef.current) videoRef.current.srcObject=null; if(intervalRef.current){ clearInterval(intervalRef.current); intervalRef.current=null; } }, []);
    const detectLoop = useCallback(()=> { intervalRef.current = setInterval(()=> { if(videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA){ const v=videoRef.current; const c=canvasRef.current; const ctx=c.getContext('2d'); c.width=v.videoWidth; c.height=v.videoHeight; ctx.drawImage(v,0,0,c.width,c.height); const img=ctx.getImageData(0,0,c.width,c.height); const code=jsQR(img.data,c.width,c.height); if(code){ stopScanning(); setFormData({ salesOrder:'SO-450080', lineItem:'001', dealer:'', notes:`Scanned QR Code: ${code.data}`, photos:[] }); goToForm(); } } }, 320); }, [stopScanning, goToForm]);
    const startScanning = useCallback(async()=> { setCameraError(null); try { if(!navigator.mediaDevices?.getUserMedia) throw new Error('Camera not supported on this device'); const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:'environment' }, width:{ ideal:1280 }, height:{ ideal:720 } }, audio:false }); streamRef.current=stream; if(videoRef.current){ const v=videoRef.current; v.srcObject=stream; v.muted=true; v.playsInline=true; v.onloadedmetadata=()=>{ v.play().then(()=>{ setIsScanning(true); detectLoop(); }); }; } } catch(e){ setCameraError((e && e.message) || 'Unable to access camera.'); setIsScanning(false); } }, [detectLoop]);
    useEffect(()=> () => stopScanning(), [stopScanning]);

    const filesToDataURLs = files => Promise.all(files.map(file => new Promise(resolve => { const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.readAsDataURL(file); }))); 
    const onPickPhotos = useCallback(async e => { const files=Array.from(e.target.files||[]); if(!files.length) return; const urls = await filesToDataURLs(files); setFormData(p=> ({ ...p, photos:[...(p.photos||[]), ...urls] })); e.target.value=''; }, []);
    const openPhotoPicker = useCallback(()=> { if(fileInputRef.current) fileInputRef.current.click(); }, []);

    /* -------------------------------- UI ---------------------------------- */
    return (
        <div className="flex flex-col h-full app-header-offset">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {view === 'list' ? (
                    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-6 space-y-6">
                        <div className="max-w-5xl mx-auto w-full space-y-6">
                        <GlassCard theme={theme} className="p-4" variant="minimal">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
                                    <div className="relative rounded-2xl overflow-hidden" style={{ border: `2px dashed ${isScanning ? theme.colors.accent : theme.colors.border}` }}>
                                        <video ref={videoRef} className="block w-full h-[340px] object-cover" playsInline muted autoPlay />
                                        {!isScanning && (
                                            <button onClick={startScanning} className="absolute inset-0 flex flex-col items-center justify-center">
                                                <Camera className="w-10 h-10 mb-2" style={{ color: theme.colors.textSecondary }} />
                                                <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>Scan QR Code</div>
                                                <div className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Tap to open camera</div>
                                                {cameraError && (
                                                    <div className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                                        {cameraError}
                                                    </div>
                                                )}
                                            </button>
                                        )}
                                        {isScanning && (
                                            <>
                                                <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#0009', color: '#fff' }}>
                                                    Scanning…
                                                </div>
                                                <button onClick={stopScanning} className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-sm font-semibold text-white active:scale-95" style={{ backgroundColor: '#ef4444' }}>
                                                    Cancel
                                                </button>
                                                <canvas ref={canvasRef} className="hidden" />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [] }); goToForm(); }}
                                    className="rounded-2xl p-6 text-center active:scale-[0.99]"
                                    style={{ border: `2px dashed ${theme.colors.border}`, backgroundColor: theme.colors.surface, color: theme.colors.textSecondary }}
                                >
                                    <div className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                        Enter Details Manually
                                    </div>
                                    <div className="text-sm mt-1">Fill out the form without scanning</div>
                                </button>
                            </div>
                        </GlassCard>

                        <div>
                            <div className="font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                                Previous Requests
                            </div>
                            <div className="space-y-3">
                                {replacementRequests.length ? (
                                    replacementRequests.map((r, i) => (
                                        <RequestCard
                                            key={`${r.name}-${i}`}
                                            r={r}
                                            theme={theme}
                                            getStatusColor={getStatusColor}
                                            getStatusText={getStatusText}
                                            getIcon={getIcon}
                                            onClick={() => setSelectedRequest(r)}
                                        />
                                    ))
                                ) : (
                                    <GlassCard theme={theme} className="p-8 text-center" variant="minimal">
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
                    </div>
                ) : (
                    <ReplacementForm
                        theme={theme}
                        formData={formData}
                        onChange={onChange}
                        onSubmit={submit}
                        fileInputRef={fileInputRef}
                        onPickPhotos={onPickPhotos}
                        openPhotoPicker={openPhotoPicker}
                    />
                )}
            </div>

            <Modal
                show={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                title={selectedRequest?.name || ''}
                theme={theme}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1" style={{ backgroundColor: getStatusColor(selectedRequest.status), color: getStatusText(selectedRequest.status) }}>
                            {getIcon(selectedRequest.status)} {selectedRequest.status}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="mb-1" style={{ color: theme.colors.textSecondary }}>Date</div>
                                <div style={{ color: theme.colors.textPrimary }}>
                                    {new Date(selectedRequest.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="mb-1" style={{ color: theme.colors.textSecondary }}>Dealer</div>
                                <div style={{ color: theme.colors.textPrimary }}>
                                    {selectedRequest.dealer || 'Unknown Dealer'}
                                </div>
                            </div>
                        </div>

                        {/* Photos (if any) */}
                        {Array.isArray(selectedRequest.photos) && selectedRequest.photos.length > 0 && (
                            <div>
                                <div className="mb-2 text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                                    Submitted Photos
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedRequest.photos.map((src, idx) => (
                                        <div key={idx} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                                            <img src={src} alt={`Request photo ${idx + 1}`} className="w-full h-24 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
