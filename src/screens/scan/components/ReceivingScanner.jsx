import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Camera,
    CameraOff,
    CheckCircle2,
    CornerUpLeft,
    Grid3x3,
    HelpCircle,
    PackagePlus,
    ScanLine,
    Search,
    X,
    XCircle,
} from 'lucide-react';
import { floatingBarStyle, subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import { hapticSuccess, hapticWarning } from '../../../utils/haptics.js';
import { SCAN_OUTCOME, formatClock } from '../receivingLogic.js';
import {
    BigButton,
    Caption,
    ConnectionChip,
    CountTile,
    FilterChip,
    ProgressBar,
    QuietButton,
    SectionCard,
    SectionHeading,
    StatusPill,
    BottomSheet,
} from './ScanPrimitives.jsx';

const FEEDBACK = {
    [SCAN_OUTCOME.VALID]: { tone: 'success', icon: CheckCircle2 },
    [SCAN_OUTCOME.DUPLICATE]: { tone: 'warning', icon: AlertTriangle },
    [SCAN_OUTCOME.WRONG_SHIPMENT]: { tone: 'error', icon: XCircle },
    [SCAN_OUTCOME.UNKNOWN]: { tone: 'info', icon: HelpCircle },
};

function describeResult(result, shipment) {
    const carton = result.carton;
    switch (result.outcome) {
        case SCAN_OUTCOME.VALID:
            return {
                title: result.damaged ? `Carton ${carton.cartonNumber} arrived — damaged` : `Carton ${carton.cartonNumber} of ${carton.cartonCount}`,
                detail: result.damaged
                    ? `${carton.model} · logged as arrived, needs an issue`
                    : `${carton.model} · ${carton.description} · ${carton.pallet}`,
                tone: result.damaged ? 'warning' : 'success',
            };
        case SCAN_OUTCOME.DUPLICATE:
            return {
                title: `Carton ${carton.cartonNumber} already scanned`,
                detail: `First scanned at ${formatClock(result.firstScan?.at)} — count unchanged`,
                tone: 'warning',
            };
        case SCAN_OUTCOME.WRONG_SHIPMENT:
            return {
                title: 'Wrong shipment',
                detail: `Barcode ${result.barcode} belongs to ${result.otherShipment?.projectName} (${result.otherShipment?.id})`,
                tone: 'error',
            };
        case SCAN_OUTCOME.UNKNOWN:
            return {
                title: 'Barcode not on this shipment',
                detail: `${result.barcode} is not expected on ${shipment.id}`,
                tone: 'info',
            };
        default:
            return { title: 'Nothing left to simulate', detail: 'Use the demo panel to reset.', tone: 'info' };
    }
}

export const ReceivingScanner = ({
    theme,
    shipment,
    receiving,
    onOpenIssue,
    onViewBingo,
    onReview,
    onOpenConnection,
}) => {
    const receipt = receiving.receiptFor(shipment.id);
    const counts = receiving.countsFor(shipment);
    const [feedback, setFeedback] = useState(null);
    const [manual, setManual] = useState('');
    const [lookup, setLookup] = useState('');
    const [confirmUndo, setConfirmUndo] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const decoderRef = useRef(null);
    const rafRef = useRef(null);
    const feedbackTimerRef = useRef(null);

    const cameraSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

    const showResult = useCallback((result) => {
        if (!result) return;
        const described = describeResult(result, shipment);
        setFeedback({ ...described, outcome: result.outcome, barcode: result.barcode, carton: result.carton, at: Date.now() });
        if (result.outcome === SCAN_OUTCOME.VALID && !result.damaged) hapticSuccess();
        else hapticWarning();

        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 6000);

        if (result.outcome === SCAN_OUTCOME.VALID && result.damaged) {
            onOpenIssue({ carton: result.carton, type: 'damaged' });
        }
    }, [onOpenIssue, shipment]);

    useEffect(() => () => clearTimeout(feedbackTimerRef.current), []);

    const stopCamera = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks?.().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraOn(false);
    }, []);

    useEffect(() => () => stopCamera(), [stopCamera]);

    const detectLoop = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const decode = decoderRef.current;
        if (!video || !canvas || !decode) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const found = decode(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
            if (found?.data) {
                stopCamera();
                showResult(receiving.scanBarcode(shipment, found.data.trim(), { source: 'camera' }));
                return;
            }
        }
        rafRef.current = requestAnimationFrame(detectLoop);
    }, [receiving, shipment, showResult, stopCamera]);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            if (!decoderRef.current) {
                const mod = await import('jsqr');
                decoderRef.current = mod?.default || mod;
                if (typeof decoderRef.current !== 'function') throw new Error('Scanner unavailable');
            }
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera not supported on this device');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });
            streamRef.current = stream;
            setCameraOn(true);
            requestAnimationFrame(() => {
                const video = videoRef.current;
                if (!video) return;
                video.srcObject = stream;
                video.onloadedmetadata = () => video.play().then(() => detectLoop()).catch(() => {});
            });
        } catch (err) {
            setCameraOn(false);
            setCameraError(err?.message || 'Camera unavailable — use manual entry');
        }
    }, [detectLoop]);

    const submitManual = useCallback((event) => {
        event?.preventDefault?.();
        const value = manual.trim();
        if (!value) return;
        showResult(receiving.scanBarcode(shipment, value, { source: 'manual' }));
        setManual('');
    }, [manual, receiving, shipment, showResult]);

    const recentScans = receiving.recentScansFor(shipment.id, 6);

    const lookupResults = useMemo(() => {
        const q = lookup.trim().toLowerCase();
        if (!q) return [];
        return shipment.cartons
            .filter((carton) => (
                carton.barcode.includes(q) ||
                String(carton.cartonNumber) === q ||
                carton.model.toLowerCase().includes(q) ||
                carton.pallet.toLowerCase().includes(q)
            ))
            .slice(0, 5);
    }, [lookup, shipment.cartons]);

    const feedbackConfig = feedback ? FEEDBACK[feedback.outcome] || FEEDBACK[SCAN_OUTCOME.UNKNOWN] : null;
    const feedbackTone = feedback?.tone || 'info';

    return (
        <div className="space-y-4 pb-64">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[0.9375rem] font-bold truncate" style={{ color: theme.colors.textPrimary }}>
                        {shipment.projectName}
                    </p>
                    <Caption theme={theme}>{shipment.id} · {shipment.warehouse}</Caption>
                </div>
                <ConnectionChip
                    theme={theme}
                    network={receiving.network}
                    queuedCount={receiving.queuedCount}
                    failedCount={receiving.failedCount}
                    syncing={receiving.syncing}
                    onClick={onOpenConnection}
                />
            </div>

            <SectionCard theme={theme} className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[2.25rem] font-bold leading-none tabular-nums" style={{ color: theme.colors.textPrimary }}>
                            {counts.scanned}
                            <span className="text-[1.125rem] font-semibold" style={{ color: theme.colors.textSecondary }}>
                                {' '}of {counts.expected}
                            </span>
                        </p>
                        <Caption theme={theme} className="mt-1">cartons scanned</Caption>
                    </div>
                    {receiving.isOffline ? <StatusPill theme={theme} label="Saving offline" tone="warning" /> : null}
                </div>
                <ProgressBar theme={theme} value={counts.scanned} max={counts.expected} />
                <div className="grid grid-cols-3 gap-2">
                    <CountTile theme={theme} label="Remaining" value={counts.remaining} />
                    <CountTile theme={theme} label="Issues" value={counts.openIssues} tone={counts.openIssues ? theme.colors.warning : undefined} />
                    <CountTile theme={theme} label="To sync" value={receiving.queuedCount} tone={receiving.queuedCount ? theme.colors.info : undefined} />
                </div>
            </SectionCard>

            <div aria-live="assertive" className="sr-only">
                {feedback ? `${feedback.title}. ${feedback.detail}` : ''}
            </div>

            <SectionCard theme={theme} className="space-y-3">
                <SectionHeading theme={theme}>Scan a carton</SectionHeading>

                <div
                    className="rounded-3xl overflow-hidden relative flex items-center justify-center"
                    style={{
                        minHeight: cameraOn ? 220 : 132,
                        backgroundColor: subtleBg(theme, 1.5),
                        border: `1px dashed ${theme.colors.border}`,
                    }}
                >
                    {cameraOn ? (
                        <>
                            <video ref={videoRef} playsInline muted className="w-full h-[220px] object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            <span
                                className="absolute inset-6 rounded-2xl pointer-events-none"
                                style={{ border: `2px solid ${theme.colors.accent}66` }}
                                aria-hidden="true"
                            />
                        </>
                    ) : (
                        <div className="text-center px-6 py-6">
                            <ScanLine className="w-8 h-8 mx-auto opacity-40" style={{ color: theme.colors.textSecondary }} aria-hidden="true" />
                            <p className="mt-2 text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                                Point the scanner at the carton label
                            </p>
                            <Caption theme={theme} className="mt-0.5">
                                Or key the barcode in by hand.
                            </Caption>
                        </div>
                    )}
                </div>

                {cameraError ? (
                    <p className="text-[0.75rem] flex items-center gap-1.5" style={{ color: theme.colors.error }}>
                        <CameraOff className="w-3.5 h-3.5" aria-hidden="true" /> {cameraError}
                    </p>
                ) : null}

                <form onSubmit={submitManual} className="flex gap-2">
                    <label htmlFor="scan-manual" className="sr-only">Barcode</label>
                    <input
                        id="scan-manual"
                        value={manual}
                        onChange={(e) => setManual(e.target.value)}
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Enter barcode"
                        className="flex-1 min-w-0 min-h-[52px] px-4 rounded-full text-[0.9375rem] font-semibold tabular-nums focus-ring"
                        style={{
                            backgroundColor: subtleBg(theme),
                            border: subtleBorder(theme),
                            color: theme.colors.textPrimary,
                        }}
                    />
                    <button
                        type="submit"
                        className="min-h-[52px] px-5 rounded-full text-[0.875rem] font-semibold flex-shrink-0 focus-ring active:scale-[0.98] transition"
                        style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                    >
                        Enter
                    </button>
                </form>

                <div className="flex flex-wrap gap-2">
                    {cameraSupported ? (
                        <QuietButton theme={theme} icon={cameraOn ? CameraOff : Camera} onClick={cameraOn ? stopCamera : startCamera}>
                            {cameraOn ? 'Stop camera' : 'Camera scan'}
                        </QuietButton>
                    ) : null}
                    <QuietButton theme={theme} icon={CornerUpLeft} onClick={() => setConfirmUndo(true)}>
                        Undo last scan
                    </QuietButton>
                    <QuietButton theme={theme} icon={Grid3x3} onClick={onViewBingo}>
                        Bingo sheet
                    </QuietButton>
                </div>
            </SectionCard>

            <SectionCard theme={theme} className="space-y-3">
                <SectionHeading theme={theme}>Find a carton</SectionHeading>
                <div className="relative">
                    <Search
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: theme.colors.textSecondary }}
                        aria-hidden="true"
                    />
                    <label htmlFor="scan-lookup" className="sr-only">Find a carton</label>
                    <input
                        id="scan-lookup"
                        value={lookup}
                        onChange={(e) => setLookup(e.target.value)}
                        placeholder="Carton number, barcode, model or pallet"
                        className="w-full min-h-[48px] pl-11 pr-4 rounded-full text-[0.875rem] focus-ring"
                        style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                    />
                </div>
                {lookup.trim() && !lookupResults.length ? (
                    <Caption theme={theme}>No carton on this shipment matches that.</Caption>
                ) : null}
                {lookupResults.map((carton) => {
                    const scanned = !!receipt?.scanned?.[carton.id];
                    return (
                        <div
                            key={carton.id}
                            className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5"
                            style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}
                        >
                            <div className="min-w-0">
                                <p className="text-[0.8125rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                                    Carton {carton.cartonNumber} · {carton.model}
                                </p>
                                <Caption theme={theme}>{carton.barcode} · {carton.pallet} · line {carton.poLine}</Caption>
                            </div>
                            {scanned ? (
                                <StatusPill theme={theme} label="Scanned" tone="success" icon={CheckCircle2} />
                            ) : (
                                <FilterChip
                                    theme={theme}
                                    active
                                    onClick={() => {
                                        showResult(receiving.scanBarcode(shipment, carton.barcode, { source: 'lookup' }));
                                        setLookup('');
                                    }}
                                >
                                    Scan
                                </FilterChip>
                            )}
                        </div>
                    );
                })}
            </SectionCard>

            <SectionCard theme={theme}>
                <SectionHeading theme={theme}>Recent scans</SectionHeading>
                {recentScans.length ? (
                    <ul className="space-y-1.5">
                        {recentScans.map((event) => {
                            const carton = shipment.cartons.find((c) => c.id === event.cartonId);
                            const tone = event.outcome === SCAN_OUTCOME.VALID
                                ? 'success'
                                : event.outcome === SCAN_OUTCOME.WRONG_SHIPMENT ? 'error' : 'warning';
                            return (
                                <li key={event.id} className="flex items-center justify-between gap-3 py-1">
                                    <div className="min-w-0">
                                        <p className="text-[0.8125rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                                            {carton ? `Carton ${carton.cartonNumber}` : event.barcode}
                                        </p>
                                        <Caption theme={theme}>
                                            {formatClock(event.at)} · {event.by}{event.offline ? ' · saved offline' : ''}
                                        </Caption>
                                    </div>
                                    <StatusPill
                                        theme={theme}
                                        tone={event.outcome === 'undone' ? 'info' : tone}
                                        label={event.outcome === SCAN_OUTCOME.VALID ? 'Added' : event.outcome === 'undone' ? 'Undone' : 'Rejected'}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <Caption theme={theme}>Nothing scanned yet on this receipt.</Caption>
                )}
            </SectionCard>

            {/* Result and count sit with the scan button, in thumb reach and outside page flow. */}
            <div
                className="fixed left-0 right-0 bottom-0 px-4 pt-3"
                style={{ ...floatingBarStyle(theme), paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
                <div className="mx-auto w-full max-w-4xl space-y-2.5">
                    {feedback ? (
                        <motion.div
                            key={feedback.at}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.14 }}
                            className="rounded-3xl px-4 py-3 flex items-start gap-3"
                            style={{
                                backgroundColor: theme.colors.surface,
                                backgroundImage: `linear-gradient(0deg, ${theme.colors[`${feedbackTone}Light`]}, ${theme.colors[`${feedbackTone}Light`]})`,
                                border: `1px solid ${theme.colors[feedbackTone]}33`,
                            }}
                        >
                            {feedbackConfig?.icon ? (
                                <feedbackConfig.icon
                                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                                    style={{ color: theme.colors[feedbackTone] }}
                                    aria-hidden="true"
                                />
                            ) : null}
                            <div className="min-w-0 flex-1">
                                <p className="text-[0.9375rem] font-semibold" style={{ color: theme.colors.textPrimary }}>{feedback.title}</p>
                                <p className="text-[0.75rem] mt-0.5" style={{ color: theme.colors.textSecondary }}>{feedback.detail}</p>
                                {feedback.outcome === SCAN_OUTCOME.UNKNOWN && feedback.barcode ? (
                                    <div className="mt-2.5">
                                        <QuietButton
                                            theme={theme}
                                            icon={PackagePlus}
                                            onClick={() => {
                                                receiving.recordExtraCarton(shipment, feedback.barcode);
                                                onOpenIssue({ carton: null, type: 'extra-carton', barcode: feedback.barcode });
                                                setFeedback(null);
                                            }}
                                        >
                                            Record as extra carton
                                        </QuietButton>
                                    </div>
                                ) : null}
                                {feedback.outcome === SCAN_OUTCOME.VALID && feedback.carton ? (
                                    <div className="mt-2.5">
                                        <QuietButton
                                            theme={theme}
                                            icon={AlertTriangle}
                                            onClick={() => onOpenIssue({ carton: feedback.carton, type: 'damaged' })}
                                        >
                                            Report an issue
                                        </QuietButton>
                                    </div>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                onClick={() => setFeedback(null)}
                                aria-label="Dismiss scan result"
                                className="w-11 h-11 -mr-2 -mt-1.5 rounded-full flex items-center justify-center flex-shrink-0 focus-ring"
                            >
                                <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} aria-hidden="true" />
                            </button>
                        </motion.div>
                    ) : null}

                    <div className="flex items-center justify-between gap-3 px-1">
                        <p className="text-[0.8125rem] font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>
                            {counts.scanned} of {counts.expected}
                        </p>
                        <p className="text-[0.75rem] font-medium tabular-nums" style={{ color: theme.colors.textSecondary }}>
                            {counts.remaining} left
                            {counts.openIssues ? ` · ${counts.openIssues} issue${counts.openIssues === 1 ? '' : 's'}` : ''}
                            {receiving.queuedCount ? ` · ${receiving.queuedCount} to sync` : ''}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <BigButton
                            theme={theme}
                            icon={ScanLine}
                            onClick={() => showResult(receiving.simulateNext(shipment))}
                            className="sm:flex-1"
                        >
                            Simulate next scan
                        </BigButton>
                        <BigButton theme={theme} tone="neutral" onClick={onReview} className="sm:w-48">
                            Review receipt
                        </BigButton>
                    </div>
                </div>
            </div>

            <BottomSheet
                theme={theme}
                open={confirmUndo}
                onClose={() => setConfirmUndo(false)}
                title="Undo the last scan?"
                subtitle="The carton goes back to not scanned. The scan stays in history."
                footer={(
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <BigButton theme={theme} tone="neutral" onClick={() => setConfirmUndo(false)} className="sm:flex-1">
                            Keep it
                        </BigButton>
                        <BigButton
                            theme={theme}
                            tone="danger"
                            onClick={() => {
                                const carton = receiving.undoLastScan(shipment);
                                setConfirmUndo(false);
                                setFeedback(carton
                                    ? { title: `Carton ${carton.cartonNumber} removed`, detail: 'Scan it again when you find it.', tone: 'info', outcome: SCAN_OUTCOME.UNKNOWN, at: Date.now() }
                                    : null);
                            }}
                            className="sm:flex-1"
                        >
                            Undo scan
                        </BigButton>
                    </div>
                )}
            >
                <Caption theme={theme}>
                    Undo removes only the most recent carton on this receipt.
                </Caption>
            </BottomSheet>
        </div>
    );
};
