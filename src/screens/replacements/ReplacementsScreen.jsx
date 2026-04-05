import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Camera, FileText, AlertCircle, CheckCircle, Clock, XCircle, Image, ChevronRight } from 'lucide-react';
import { REPLACEMENT_REQUESTS_DATA } from './data.js';
import jsQR from 'jsqr';
import { hapticSuccess } from '../../utils/haptics.js';
import { isDarkTheme } from '../../design-system/tokens.js';

/* ── Header offset shared across views ── */
const CONTENT_PT = 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 16px)';

/* ── Status helpers ── */
const STATUS_BG  = { Pending: 'rgba(53,53,53,0.10)',   Approved: 'rgba(74,124,89,0.13)',   Rejected: 'rgba(184,92,92,0.13)' };
const STATUS_FG  = { Pending: '#353535',               Approved: '#4A7C59',                Rejected: '#B85C5C' };
const STATUS_ICON = { Pending: Clock, Approved: CheckCircle, Rejected: XCircle };

function StatusBadge({ status }) {
    const Icon = STATUS_ICON[status] || AlertCircle;
    return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
            style={{ backgroundColor: STATUS_BG[status], color: STATUS_FG[status] }}>
            <Icon className="w-3.5 h-3.5" />
            {status}
        </span>
    );
}

/* ── Single request card ── */
function RequestCard({ r, onClick, dark, bdr }) {
    const statusAccent = STATUS_FG[r.status] || '#353535';
    return (
        <button onClick={onClick} className="w-full text-left active:scale-[0.99] transition-transform">
            <div className="rounded-[18px] overflow-hidden flex items-center gap-3 transition-all"
                style={{ backgroundColor: 'transparent', border: `1px solid ${bdr}`, borderLeft: `3px solid ${statusAccent}40` }}>
                <div className="flex-1 min-w-0 px-4 py-3.5">
                    <div className="font-semibold text-[15px] truncate" style={{ color: 'var(--text-primary)' }}>
                        {r.name}
                    </div>
                    <div className="text-xs mt-0.5 truncate opacity-60">
                        {r.dealer || 'Unknown Dealer'} · {new Date(r.date).toLocaleDateString()}
                    </div>
                </div>
                <div className="pr-4 shrink-0 flex items-center gap-2">
                    <StatusBadge status={r.status} />
                </div>
            </div>
        </button>
    );
}

/* ── Manual entry form ── */
function ReplacementForm({ theme, formData, onChange, onSubmit, fileInputRef, onPickPhotos, openPhotoPicker }) {
    const dark = isDarkTheme(theme);
    const bdr = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
    const fieldBg = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)';

    const Field = ({ label, children }) => (
        <div>
            <label className="block text-xs font-bold uppercase tracking-[0.07em] mb-1.5 opacity-50"
                style={{ color: theme.colors.textPrimary }}>
                {label}
            </label>
            {children}
        </div>
    );

    const inputCls = "w-full px-3.5 py-2.5 rounded-[12px] text-sm outline-none transition-colors";
    const inputStyle = { backgroundColor: fieldBg, border: `1px solid ${bdr}`, color: theme.colors.textPrimary };

    return (
        <div className="px-4 sm:px-6 lg:px-8 pb-8 max-w-5xl mx-auto w-full" style={{ paddingTop: CONTENT_PT }}>
            <div className="space-y-4">
                {/* Form card */}
                <div className="rounded-[22px] overflow-hidden p-5 space-y-4"
                    style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
                    <Field label="Sales Order">
                        <input value={formData.salesOrder} onChange={e => onChange('salesOrder', e.target.value)}
                            className={inputCls} style={inputStyle} autoComplete="off" placeholder="e.g., SO-12345" />
                    </Field>
                    <Field label="Line Item">
                        <input value={formData.lineItem} onChange={e => onChange('lineItem', e.target.value)}
                            className={inputCls} style={inputStyle} autoComplete="off" placeholder="e.g., 003" />
                    </Field>
                    <Field label="Dealer">
                        <input value={formData.dealer} onChange={e => onChange('dealer', e.target.value)}
                            className={inputCls} style={inputStyle} autoComplete="off" placeholder="e.g., Acme Office Solutions" />
                    </Field>
                    <Field label="Notes">
                        <textarea rows={3} value={formData.notes} onChange={e => onChange('notes', e.target.value)}
                            className={`${inputCls} resize-none`} style={inputStyle}
                            placeholder="Describe the issue or parts needed…" />
                    </Field>

                    {/* Photos */}
                    <Field label="Photos">
                        {Array.isArray(formData.photos) && formData.photos.length > 0 && (
                            <div className="mb-3 grid grid-cols-3 gap-2">
                                {formData.photos.map((src, idx) => (
                                    <div key={idx} className="relative rounded-[12px] overflow-hidden aspect-square"
                                        style={{ border: `1px solid ${bdr}` }}>
                                        <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" multiple capture="environment"
                            className="hidden" onChange={onPickPhotos} />
                        <button type="button" onClick={openPhotoPicker}
                            className="w-full rounded-[12px] py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-70"
                            style={{ border: `1.5px dashed ${bdr}`, color: theme.colors.textSecondary }}>
                            <Image className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {formData.photos?.length ? 'Add More Photos' : 'Add Photos'}
                            </span>
                        </button>
                    </Field>
                </div>

                {/* Submit */}
                <button onClick={onSubmit}
                    className="w-full py-3.5 rounded-full font-bold text-[15px] active:scale-[0.98] transition-transform"
                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
                    Submit Replacement Request
                </button>
            </div>
        </div>
    );
}

/* ── Main screen ── */
export const ReplacementsScreen = ({ theme }) => {
    const [view, setView] = useState('list');
    const [isScanning, setIsScanning] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [formData, setFormData] = useState({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [] });
    const videoRef  = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);
    const streamRef   = useRef(null);
    const fileInputRef = useRef(null);
    const inFormRef   = useRef(false);

    const [replacementRequests, setReplacementRequests] = useState(
        (REPLACEMENT_REQUESTS_DATA || []).map(r => ({
            name: r.name, dealer: r.dealer || '', date: r.date,
            status: r.status, photos: Array.isArray(r.photos) ? r.photos : [],
        }))
    );

    const dark = isDarkTheme(theme);
    const bdr  = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';

    /* back-button handling */
    useEffect(() => {
        const onPop = () => { if (inFormRef.current) { setView('list'); setIsScanning(false); inFormRef.current = false; } };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    const goToForm = useCallback(() => {
        if (!inFormRef.current) { window.history.pushState({ jsiReplacements: 'form' }, ''); inFormRef.current = true; }
        setView('form');
    }, []);

    const onChange = useCallback((k, v) => setFormData(p => p[k] === v ? p : { ...p, [k]: v }), []);

    const submit = useCallback(() => {
        hapticSuccess();
        setReplacementRequests(p => [{
            name: `${formData.salesOrder} – ${formData.lineItem}`,
            dealer: formData.dealer?.trim() || 'Unknown Dealer',
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            photos: formData.photos.slice(),
        }, ...p]);
        setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [] });
        setView('list');
        inFormRef.current = false;
    }, [formData]);

    /* camera / QR */
    const stopScanning = useCallback(() => {
        setIsScanning(false); setCameraError(null);
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }, []);

    const detectLoop = useCallback(() => {
        intervalRef.current = setInterval(() => {
            if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const v = videoRef.current, c = canvasRef.current, ctx = c.getContext('2d');
                c.width = v.videoWidth; c.height = v.videoHeight;
                ctx.drawImage(v, 0, 0, c.width, c.height);
                const code = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
                if (code) {
                    stopScanning();
                    const qr = code.data || '';
                    const soMatch = qr.match(/SO[-\s]?\d+/i);
                    const liMatch = qr.match(/(?:line|item|li)[-\s:]?\s*(\d+)/i);
                    setFormData({ salesOrder: soMatch ? soMatch[0] : '', lineItem: liMatch ? liMatch[1] : '', dealer: '', notes: `Scanned QR: ${qr}`, photos: [] });
                    goToForm();
                }
            }
        }, 320);
    }, [stopScanning, goToForm]);

    const startScanning = useCallback(async () => {
        setCameraError(null);
        try {
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera not supported on this device');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                const v = videoRef.current;
                v.srcObject = stream; v.muted = true; v.playsInline = true;
                v.onloadedmetadata = () => v.play().then(() => { setIsScanning(true); detectLoop(); });
            }
        } catch (e) {
            setCameraError((e && e.message) || 'Unable to access camera.');
            setIsScanning(false);
        }
    }, [detectLoop]);

    useEffect(() => () => stopScanning(), [stopScanning]);

    const onPickPhotos = useCallback(async e => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const urls = await Promise.all(files.map(f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); })));
        setFormData(p => ({ ...p, photos: [...(p.photos || []), ...urls] }));
        e.target.value = '';
    }, []);

    const openPhotoPicker = useCallback(() => fileInputRef.current?.click(), []);

    /* ── Render ── */
    if (view === 'form') {
        return (
            <div className="min-h-full" style={{ backgroundColor: theme.colors.background }}>
                <ReplacementForm
                    theme={theme} formData={formData} onChange={onChange} onSubmit={submit}
                    fileInputRef={fileInputRef} onPickPhotos={onPickPhotos} openPhotoPicker={openPhotoPicker}
                />
            </div>
        );
    }

    return (
        <div className="min-h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 sm:px-6 lg:px-8 pb-8 max-w-5xl mx-auto w-full space-y-4"
                style={{ paddingTop: CONTENT_PT }}>

                {/* ── QR Scanner card ── */}
                <div className="rounded-[22px] overflow-hidden"
                    style={{ backgroundColor: theme.colors.surface, border: `1px solid ${isScanning ? theme.colors.accent + '60' : bdr}` }}>
                    {/* video always mounted so the ref is stable */}
                    <div className="relative overflow-hidden" style={{ height: isScanning ? 280 : 0, transition: 'height 0.35s ease' }}>
                        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
                        {isScanning && (
                            <>
                                {/* corner brackets */}
                                {[['top-4 left-4', 'border-t-2 border-l-2 rounded-tl-lg'],
                                  ['top-4 right-4', 'border-t-2 border-r-2 rounded-tr-lg'],
                                  ['bottom-4 left-4', 'border-b-2 border-l-2 rounded-bl-lg'],
                                  ['bottom-4 right-4', 'border-b-2 border-r-2 rounded-br-lg']].map(([pos, cls]) => (
                                    <div key={pos} className={`absolute w-6 h-6 ${pos} ${cls}`}
                                        style={{ borderColor: theme.colors.accent }} />
                                ))}
                                <div className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                                    Scanning…
                                </div>
                                <button onClick={stopScanning}
                                    className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full text-sm font-bold text-white active:scale-95"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.60)' }}>
                                    Cancel
                                </button>
                                <canvas ref={canvasRef} className="hidden" />
                            </>
                        )}
                    </div>

                    {/* Tap-to-scan area (shown when not scanning) */}
                    {!isScanning && (
                        <button onClick={startScanning}
                            className="w-full flex flex-col items-center justify-center gap-2 py-10 transition-opacity active:opacity-70">
                            <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-1"
                                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)' }}>
                                <Camera className="w-7 h-7" style={{ color: theme.colors.textSecondary }} />
                            </div>
                            <div className="font-bold text-[15px]" style={{ color: theme.colors.textPrimary }}>
                                Scan QR Code
                            </div>
                            <div className="text-sm opacity-55" style={{ color: theme.colors.textSecondary }}>
                                Tap to open camera
                            </div>
                            {cameraError && (
                                <div className="mt-2 text-xs px-4 py-2 rounded-[12px] max-w-xs text-center"
                                    style={{ backgroundColor: 'rgba(184,92,92,0.12)', color: '#B85C5C' }}>
                                    {cameraError}
                                </div>
                            )}
                        </button>
                    )}
                </div>

                {/* ── Manual entry card ── */}
                <button
                    onClick={() => { setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [] }); goToForm(); }}
                    className="w-full text-left rounded-[22px] px-5 py-4 flex items-center gap-4 active:scale-[0.99] transition-transform"
                    style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
                    <div className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)' }}>
                        <FileText className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-[15px]" style={{ color: theme.colors.textPrimary }}>
                            Enter Details Manually
                        </div>
                        <div className="text-sm opacity-55 mt-0.5" style={{ color: theme.colors.textSecondary }}>
                            Fill out the form without scanning
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 shrink-0" style={{ color: theme.colors.textSecondary }} />
                </button>

                {/* ── Previous Requests ── */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-[15px] font-bold" style={{ color: theme.colors.textPrimary }}>
                            Previous Requests
                        </h3>
                        <span className="text-xs font-bold uppercase tracking-[0.07em] opacity-40"
                            style={{ color: theme.colors.textSecondary }}>
                            {replacementRequests.length} total
                        </span>
                    </div>

                    {replacementRequests.length > 0 ? (
                        <div className="space-y-2.5">
                            {replacementRequests.map((r, i) => (
                                <RequestCard key={`${r.name}-${i}`} r={r} dark={dark} bdr={bdr}
                                    onClick={() => setSelectedRequest(r)} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[22px] p-8 text-center"
                            style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
                            <div className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                No Previous Requests
                            </div>
                            <div className="text-sm opacity-55" style={{ color: theme.colors.textSecondary }}>
                                Submit your first replacement request above.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Request detail modal ── */}
            <Modal show={!!selectedRequest} onClose={() => setSelectedRequest(null)}
                title={selectedRequest?.name || ''} theme={theme}>
                {selectedRequest && (
                    <div className="space-y-4">
                        <StatusBadge status={selectedRequest.status} />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.07em] opacity-45 mb-1"
                                    style={{ color: theme.colors.textSecondary }}>Date</div>
                                <div style={{ color: theme.colors.textPrimary }}>
                                    {new Date(selectedRequest.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.07em] opacity-45 mb-1"
                                    style={{ color: theme.colors.textSecondary }}>Dealer</div>
                                <div style={{ color: theme.colors.textPrimary }}>
                                    {selectedRequest.dealer || 'Unknown Dealer'}
                                </div>
                            </div>
                        </div>
                        {Array.isArray(selectedRequest.photos) && selectedRequest.photos.length > 0 && (
                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.07em] opacity-45 mb-2"
                                    style={{ color: theme.colors.textSecondary }}>Photos</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedRequest.photos.map((src, idx) => (
                                        <div key={idx} className="rounded-[12px] overflow-hidden aspect-square"
                                            style={{ border: `1px solid ${bdr}` }}>
                                            <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
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
