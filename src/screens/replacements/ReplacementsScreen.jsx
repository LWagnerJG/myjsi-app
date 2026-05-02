import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Camera, FileText, AlertCircle, CheckCircle, Clock, XCircle, Image, ChevronRight } from 'lucide-react';
import { FloatingSubmitCTA } from '../../components/common/FloatingSubmitCTA.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { REPLACEMENT_REQUESTS_DATA } from './data.js';
import { hapticSuccess } from '../../utils/haptics.js';
import { isDarkTheme, JSI_COLORS } from '../../design-system/tokens.js';

/* ── Header offset shared across views ── */
const CONTENT_PT = 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 16px)';

/* ── Status helpers ── */
const STATUS_BG  = { Pending: `${JSI_COLORS.charcoal}1A`, Approved: `${JSI_COLORS.success}21`, Rejected: `${JSI_COLORS.error}21` };
const STATUS_FG  = { Pending: JSI_COLORS.charcoal,        Approved: JSI_COLORS.success,      Rejected: JSI_COLORS.error };
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
function RequestCard({ r, onClick, theme, dark }) {
    const statusIconBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

    return (
        <button onClick={onClick} className="w-full text-left px-4 py-3.5 active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: statusIconBg }}
                >
                    <FileText className="w-4 h-4" style={{ color: theme.colors.accent }} />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="font-semibold text-[0.875rem] truncate" style={{ color: theme.colors.textPrimary }}>
                        {r.name}
                    </div>
                    <div className="text-[0.72rem] truncate opacity-60" style={{ color: theme.colors.textSecondary }}>
                        {r.dealer || 'Unknown Dealer'} · {new Date(r.date).toLocaleDateString()}
                    </div>
                </div>

                <StatusBadge status={r.status} />

                <ChevronRight className="w-4 h-4 opacity-35 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
            </div>
        </button>
    );
}

/* ── Manual entry form ── */
function ReplacementForm({ theme, formData, onChange, fileInputRef, onPickPhotos, openPhotoPicker }) {
    const dark = isDarkTheme(theme);
    const inputBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
    const shellBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    const Field = ({ label, children }) => (
        <div>
            <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.08em] mb-1.5"
                style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                {label}
            </label>
            {children}
        </div>
    );

    const inputCls = "w-full px-4 py-3 rounded-2xl text-[0.875rem] outline-none placeholder:opacity-40";
    const inputStyle = {
        backgroundColor: inputBg,
        border: 'none',
        color: theme.colors.textPrimary,
        boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.03)',
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 pb-28 max-w-content mx-auto w-full" style={{ paddingTop: CONTENT_PT }}>
            <div className="rounded-[24px] p-4 sm:p-5 space-y-5" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${shellBorder}` }}>
                <Field label="Sales Order">
                    <input value={formData.salesOrder} onChange={e => onChange('salesOrder', e.target.value)}
                        className={inputCls} style={inputStyle} autoComplete="off" placeholder="e.g. SO-12345" />
                </Field>
                <Field label="Line Item">
                    <input value={formData.lineItem} onChange={e => onChange('lineItem', e.target.value)}
                        className={inputCls} style={inputStyle} autoComplete="off" placeholder="e.g. 003" />
                </Field>
                <Field label="Dealer">
                    <input value={formData.dealer} onChange={e => onChange('dealer', e.target.value)}
                        className={inputCls} style={inputStyle} autoComplete="off" placeholder="e.g. Acme Office Solutions" />
                </Field>
                <Field label="Notes">
                    <textarea rows={3} value={formData.notes} onChange={e => onChange('notes', e.target.value)}
                        className={`${inputCls} resize-none`} style={inputStyle}
                        placeholder="Describe the issue or parts needed..." />
                </Field>

                <Field label="Photos">
                    {Array.isArray(formData.photos) && formData.photos.length > 0 && (
                        <div className="mb-3 grid grid-cols-3 gap-2">
                            {formData.photos.map((src, idx) => (
                                <div key={idx} className="relative rounded-2xl overflow-hidden aspect-square">
                                    <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple capture="environment"
                        className="hidden" onChange={onPickPhotos} />
                    <button type="button" onClick={openPhotoPicker}
                        className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-opacity active:scale-[0.98]"
                        style={{ backgroundColor: inputBg, color: theme.colors.textSecondary, boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <Image className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        <span className="text-[0.8125rem] font-semibold">
                            {formData.photos?.length ? 'Add More Photos' : 'Add Photos'}
                        </span>
                    </button>
                </Field>
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
    const qrScannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const inFormRef   = useRef(false);

    const [replacementRequests, setReplacementRequests] = useState(
        (REPLACEMENT_REQUESTS_DATA || []).map(r => ({
            name: r.name, dealer: r.dealer || '', date: r.date,
            status: r.status, photos: Array.isArray(r.photos) ? r.photos : [],
        }))
    );

    const dark = isDarkTheme(theme);
    const bdr  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

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
                const scanQr = qrScannerRef.current;
                if (!scanQr) return;
                c.width = v.videoWidth; c.height = v.videoHeight;
                ctx.drawImage(v, 0, 0, c.width, c.height);
                const code = scanQr(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
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
            if (!qrScannerRef.current) {
                const qrModule = await import('jsqr');
                qrScannerRef.current = qrModule?.default || qrModule;
                if (typeof qrScannerRef.current !== 'function') {
                    throw new Error('Unable to load QR scanner. Try manual entry.');
                }
            }

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
    const canSubmit = Boolean(formData.salesOrder.trim() && formData.lineItem.trim());

    /* ── Render ── */
    if (view === 'form') {
        return (
            <div className="min-h-full" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
                <ReplacementForm
                    theme={theme} formData={formData} onChange={onChange}
                    fileInputRef={fileInputRef} onPickPhotos={onPickPhotos} openPhotoPicker={openPhotoPicker}
                />
                <FloatingSubmitCTA
                    theme={theme}
                    onClick={submit}
                    label="Submit Replacement Request"
                    visible
                    disabled={!canSubmit}
                />
            </div>
        );
    }

    return (
        <div className="min-h-full" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
            <div className="px-4 sm:px-6 lg:px-8 pb-8 max-w-content mx-auto w-full"
                style={{ paddingTop: CONTENT_PT }}>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-[1rem] sm:text-[1.08rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                        Replacement Requests
                    </h2>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                        Start
                    </span>
                </div>

                {/* ── Action tiles — side-by-side ── */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {/* Scan QR */}
                    <button onClick={startScanning}
                        className="rounded-2xl px-3 py-3.5 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : `${theme.colors.accent}12` }}>
                            <Camera className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        </div>
                        <span className="font-semibold text-[0.8125rem]" style={{ color: theme.colors.textPrimary }}>Scan QR</span>
                    </button>
                    {/* Manual entry */}
                    <button
                        onClick={() => { setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [] }); goToForm(); }}
                        className="rounded-2xl px-3 py-3.5 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : `${theme.colors.accent}12` }}>
                            <FileText className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        </div>
                        <span className="font-semibold text-[0.8125rem]" style={{ color: theme.colors.textPrimary }}>Enter Manual</span>
                    </button>
                </div>

                {/* ── QR Scanner viewport (expands when scanning) ── */}
                <div className="rounded-2xl overflow-hidden mb-5"
                    style={{ height: isScanning ? 240 : 0, transition: 'height 0.3s ease', border: isScanning ? `1px solid ${theme.colors.accent}50` : 'none' }}>
                    <div className="relative w-full h-full">
                        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
                        {isScanning && (
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.07em]"
                                style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#FFFFFF' }}>
                                Scanning...
                            </div>
                        )}
                        {isScanning && (
                            <>
                                {[['top-3 left-3', 'border-t-2 border-l-2 rounded-tl-md'],
                                  ['top-3 right-3', 'border-t-2 border-r-2 rounded-tr-md'],
                                  ['bottom-3 left-3', 'border-b-2 border-l-2 rounded-bl-md'],
                                  ['bottom-3 right-3', 'border-b-2 border-r-2 rounded-br-md']].map(([pos, cls]) => (
                                    <div key={pos} className={`absolute w-5 h-5 ${pos} ${cls}`}
                                        style={{ borderColor: theme.colors.accent }} />
                                ))}
                                <button onClick={stopScanning}
                                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold text-white active:scale-95"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                                    Cancel
                                </button>
                                <canvas ref={canvasRef} className="hidden" />
                            </>
                        )}
                    </div>
                </div>
                {cameraError && (
                    <div className="mb-4 text-xs px-3 py-2 rounded-xl text-center"
                        style={{ backgroundColor: 'rgba(184,92,92,0.10)', color: '#B85C5C' }}>
                        {cameraError}
                    </div>
                )}

                {/* ── Previous Requests ── */}
                <div className="flex items-baseline justify-between mb-1 px-1">
                    <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary, opacity: 0.62 }}>
                        Recent Requests
                    </h3>
                    {replacementRequests.length > 0 && (
                        <span className="text-[0.72rem] opacity-45" style={{ color: theme.colors.textSecondary }}>
                            {replacementRequests.length}
                        </span>
                    )}
                </div>

                {replacementRequests.length > 0 ? (
                    <div className="rounded-2xl overflow-hidden divide-y"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}`, borderColor: bdr }}>
                        {replacementRequests.map((r, i) => (
                            <div key={`${r.name}-${i}`} style={{ borderColor: bdr }}>
                                <RequestCard r={r} theme={theme} dark={dark}
                                    onClick={() => setSelectedRequest(r)} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl"
                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
                        <EmptyState
                            icon={FileText}
                            title="No replacement requests yet"
                            description="Scan a QR code or submit a manual request to start tracking replacements."
                            action={{
                                label: 'Create Request',
                                onClick: () => { setFormData({ salesOrder: '', lineItem: '', dealer: '', notes: '', photos: [] }); goToForm(); },
                            }}
                            theme={theme}
                        />
                    </div>
                )}
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
