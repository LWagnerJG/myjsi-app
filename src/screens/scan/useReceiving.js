import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState } from '../../hooks/usePersistentState.js';
import { WAREHOUSE_ADAPTERS } from './adapters.js';
import {
    DEMO_SHIPMENTS,
    FOREIGN_CARTON,
    SCAN_USER,
    findCartonByBarcode,
} from './data.js';
import {
    EVENT_TYPES,
    NETWORK_MODES,
    RECEIPT_STATUS,
    SCAN_OUTCOME,
    applyScan,
    appendIssueHistory,
    buildScanScript,
    classifyScan,
    closeIssue as closeIssueRecord,
    completeReceipt as completeReceiptRecord,
    computeCounts,
    createIssue,
    createReceipt,
    dedupeKeys,
    makeScanEvent,
    makeSyncEvent,
    nextId,
    recordRejectedAttempt,
} from './receivingLogic.js';

const MAX_SCAN_EVENTS = 400;
const MAX_LOG_ENTRIES = 80;
const MAX_SYNCED_QUEUE = 120;

function buildSeedState() {
    const receipts = {};
    DEMO_SHIPMENTS.forEach((shipment) => {
        if (shipment.preCompleted) {
            receipts[shipment.id] = {
                ...createReceipt(shipment, shipment.preCompleted.user, shipment.preCompleted.completedAt),
                id: shipment.preCompleted.receiptNumber,
                status: RECEIPT_STATUS.COMPLETED,
                completedAt: shipment.preCompleted.completedAt,
                scanned: shipment.cartons.reduce((acc, carton) => {
                    acc[carton.id] = {
                        at: shipment.preCompleted.completedAt,
                        by: shipment.preCompleted.user,
                        barcode: carton.barcode,
                        offline: false,
                    };
                    return acc;
                }, {}),
                accepted: shipment.cartons.map((c) => c.id),
                missing: [],
                held: [],
            };
            return;
        }

        if (shipment.preInProgress) {
            const seedCount = Math.max(1, Math.min(shipment.preInProgress.scannedCount || 1, shipment.cartons.length));
            const seededCartons = shipment.cartons.slice(0, seedCount);
            const startedAt = shipment.preInProgress.startedAt || '2026-08-25T14:08:00.000Z';
            receipts[shipment.id] = {
                ...createReceipt(shipment, shipment.preInProgress.user, startedAt),
                id: shipment.preInProgress.receiptNumber,
                status: RECEIPT_STATUS.IN_PROGRESS,
                startedAt,
                completedAt: null,
                scanned: seededCartons.reduce((acc, carton) => {
                    acc[carton.id] = {
                        at: startedAt,
                        by: shipment.preInProgress.user,
                        barcode: carton.barcode,
                        offline: false,
                    };
                    return acc;
                }, {}),
                accepted: [],
                missing: [],
                held: [],
            };
        }
    });

    return {
        network: NETWORK_MODES.ONLINE,
        cached: [],
        receipts,
        scanEvents: [],
        issues: [],
        queue: [],
        delivered: {},
        log: [],
        lastSyncAt: null,
        simIndex: {},
    };
}

const INITIAL_STATE = buildSeedState();

const lookupBarcode = (barcode) => findCartonByBarcode(barcode);

export function useReceiving() {
    // v2 reseeds localStorage with the deterministic mid-receive demo fixture.
    const [state, setState, resetState] = usePersistentState('scan.receiving', INITIAL_STATE, { version: 2 });
    const [syncing, setSyncing] = useState(false);
    const stateRef = useRef(state);
    const syncRunRef = useRef(false);

    useEffect(() => { stateRef.current = state; }, [state]);

    const network = state.network || NETWORK_MODES.ONLINE;
    const isOffline = network === NETWORK_MODES.OFFLINE;

    const queuedEvents = useMemo(() => (state.queue || []).filter((e) => e.status === 'queued'), [state.queue]);
    const failedEvents = useMemo(() => (state.queue || []).filter((e) => e.status === 'failed'), [state.queue]);

    const enqueue = useCallback((type, payload, dedupeKey) => {
        setState((prev) => {
            const queue = prev.queue || [];
            const alreadyPending = queue.some((e) => e.dedupeKey === dedupeKey && e.status !== 'failed');
            if (alreadyPending) return prev;
            const pruned = queue.length > MAX_SYNCED_QUEUE
                ? [...queue.filter((e) => e.status !== 'synced'), ...queue.filter((e) => e.status === 'synced').slice(-40)]
                : queue;
            return { ...prev, queue: [...pruned, makeSyncEvent(type, payload, { dedupeKey })] };
        });
    }, [setState]);

    /** Delivers queued events in order, one at a time, so the UI can tick down. */
    const syncNow = useCallback(async () => {
        if (syncRunRef.current) return;
        const current = stateRef.current;
        if ((current.network || NETWORK_MODES.ONLINE) === NETWORK_MODES.OFFLINE) return;

        const pending = (current.queue || []).filter((e) => e.status === 'queued' || e.status === 'failed');
        if (!pending.length) return;

        syncRunRef.current = true;
        setSyncing(true);

        try {
            for (const event of pending) {
                const mode = stateRef.current.network || NETWORK_MODES.ONLINE;
                if (mode === NETWORK_MODES.OFFLINE) break;

                const records = [];
                for (const adapter of WAREHOUSE_ADAPTERS) {
                    const delivered = new Set(stateRef.current.delivered?.[adapter.id] || []);
                    const record = await adapter.deliver(event, { mode, alreadyDelivered: delivered });
                    records.push(record);
                }

                const failed = records.some((r) => r.status === 'failed');

                setState((prev) => {
                    const delivered = { ...(prev.delivered || {}) };
                    if (!failed) {
                        records.forEach((record) => {
                            const keys = new Set(delivered[record.adapterId] || []);
                            keys.add(event.dedupeKey);
                            delivered[record.adapterId] = [...keys];
                        });
                    }
                    return {
                        ...prev,
                        delivered,
                        lastSyncAt: failed ? prev.lastSyncAt : new Date().toISOString(),
                        queue: (prev.queue || []).map((e) => (
                            e.id === event.id
                                ? {
                                    ...e,
                                    status: failed ? 'failed' : 'synced',
                                    attempts: (e.attempts || 0) + 1,
                                    lastError: failed ? records.find((r) => r.status === 'failed')?.message || 'Delivery failed' : null,
                                    syncedAt: failed ? null : new Date().toISOString(),
                                }
                                : e
                        )),
                        log: [
                            ...records.map((record) => ({
                                id: nextId('log'),
                                adapterId: record.adapterId,
                                adapterName: record.adapterName,
                                eventType: record.eventType,
                                status: record.status,
                                message: record.message,
                                at: record.at,
                            })),
                            ...(prev.log || []),
                        ].slice(0, MAX_LOG_ENTRIES),
                    };
                });
            }
        } finally {
            syncRunRef.current = false;
            setSyncing(false);
        }
    }, [setState]);

    // Drain the queue whenever service is available and something is waiting.
    useEffect(() => {
        if (isOffline || !queuedEvents.length) return;
        const timer = setTimeout(() => { syncNow(); }, 300);
        return () => clearTimeout(timer);
    }, [isOffline, queuedEvents.length, syncNow]);

    const setNetwork = useCallback((mode) => {
        setState((prev) => ({ ...prev, network: mode }));
    }, [setState]);

    const receiptFor = useCallback((shipmentId) => state.receipts?.[shipmentId] || null, [state.receipts]);

    const issuesFor = useCallback(
        (shipmentId) => (state.issues || []).filter((issue) => issue.shipmentId === shipmentId),
        [state.issues]
    );

    const isCached = useCallback((shipmentId) => (state.cached || []).includes(shipmentId), [state.cached]);

    const cacheShipment = useCallback((shipment) => {
        setState((prev) => (
            (prev.cached || []).includes(shipment.id)
                ? prev
                : { ...prev, cached: [...(prev.cached || []), shipment.id] }
        ));
        enqueue(
            EVENT_TYPES.SHIPMENT_CACHED,
            { shipmentId: shipment.id, cartonCount: shipment.cartonCount, warehouse: shipment.warehouse },
            dedupeKeys.shipmentCached(shipment.id)
        );
    }, [enqueue, setState]);

    const startReceiving = useCallback((shipment) => {
        setState((prev) => {
            if (prev.receipts?.[shipment.id]) return prev;
            return {
                ...prev,
                receipts: { ...(prev.receipts || {}), [shipment.id]: createReceipt(shipment, SCAN_USER.name) },
            };
        });
    }, [setState]);

    /**
     * Single entry point for every scan, whatever the source (camera, keyed in,
     * or simulated). Returns the classification so the caller can show feedback.
     */
    const scanBarcode = useCallback((shipment, barcode, { source = 'manual' } = {}) => {
        const current = stateRef.current;
        const receipt = current.receipts?.[shipment.id] || createReceipt(shipment, SCAN_USER.name);
        const offline = (current.network || NETWORK_MODES.ONLINE) === NETWORK_MODES.OFFLINE;
        const result = classifyScan(barcode, { shipment, receipt, lookupBarcode });

        const scanEvent = makeScanEvent({
            receipt,
            shipment,
            outcome: result.outcome,
            barcode: result.barcode,
            cartonId: result.carton?.id,
            by: SCAN_USER.name,
            offline,
        });

        setState((prev) => {
            const prevReceipt = prev.receipts?.[shipment.id] || receipt;
            const nextReceipt = result.outcome === SCAN_OUTCOME.VALID
                ? applyScan(prevReceipt, result.carton, { by: SCAN_USER.name, offline })
                : recordRejectedAttempt(prevReceipt, result, { by: SCAN_USER.name });

            return {
                ...prev,
                receipts: { ...(prev.receipts || {}), [shipment.id]: nextReceipt },
                scanEvents: [scanEvent, ...(prev.scanEvents || [])].slice(0, MAX_SCAN_EVENTS),
            };
        });

        if (result.outcome === SCAN_OUTCOME.VALID) {
            enqueue(
                EVENT_TYPES.CARTON_SCANNED,
                {
                    receiptId: receipt.id,
                    shipmentId: shipment.id,
                    cartonId: result.carton.id,
                    cartonNumber: result.carton.cartonNumber,
                    barcode: result.carton.barcode,
                    offline,
                    source,
                },
                dedupeKeys.cartonScanned(receipt.id, result.carton.id)
            );
        }

        return result;
    }, [enqueue, setState]);

    const scanScript = useMemo(
        () => Object.fromEntries(DEMO_SHIPMENTS.map((s) => [s.id, buildScanScript(s, FOREIGN_CARTON.barcode)])),
        []
    );

    const simulateNext = useCallback((shipment) => {
        const script = scanScript[shipment.id] || [];
        const pointer = stateRef.current.simIndex?.[shipment.id] || 0;
        if (pointer >= script.length) return { outcome: 'exhausted', barcode: null };

        setState((prev) => ({
            ...prev,
            simIndex: { ...(prev.simIndex || {}), [shipment.id]: pointer + 1 },
        }));

        return scanBarcode(shipment, script[pointer], { source: 'simulated' });
    }, [scanBarcode, scanScript, setState]);

    /** Demo-only shortcut: accept the rest of the truck without 170 taps. */
    const fastForwardScanning = useCallback((shipment) => {
        const current = stateRef.current;
        const receipt = current.receipts?.[shipment.id] || createReceipt(shipment, SCAN_USER.name);
        const offline = (current.network || NETWORK_MODES.ONLINE) === NETWORK_MODES.OFFLINE;
        const remaining = shipment.cartons.filter(
            (carton) => !receipt.scanned?.[carton.id] && carton.cartonNumber !== shipment.missingCartonNumber
        );
        if (!remaining.length) return 0;

        const at = new Date().toISOString();
        setState((prev) => {
            const prevReceipt = prev.receipts?.[shipment.id] || receipt;
            const scanned = { ...prevReceipt.scanned };
            remaining.forEach((carton) => {
                scanned[carton.id] = { at, by: SCAN_USER.name, barcode: carton.barcode, offline };
            });
            const events = remaining.slice(-25).map((carton) => makeScanEvent({
                receipt: prevReceipt,
                shipment,
                outcome: SCAN_OUTCOME.VALID,
                barcode: carton.barcode,
                cartonId: carton.id,
                by: SCAN_USER.name,
                offline,
                at,
            }));
            return {
                ...prev,
                receipts: { ...(prev.receipts || {}), [shipment.id]: { ...prevReceipt, scanned } },
                scanEvents: [...events.reverse(), ...(prev.scanEvents || [])].slice(0, MAX_SCAN_EVENTS),
                simIndex: { ...(prev.simIndex || {}), [shipment.id]: (scanScript[shipment.id] || []).length },
            };
        });

        // One rolled-up event keeps the demo queue readable instead of 170 rows.
        enqueue(
            EVENT_TYPES.CARTON_SCANNED,
            {
                receiptId: receipt.id,
                shipmentId: shipment.id,
                cartonId: `${remaining.length} cartons`,
                cartonNumber: `${remaining[0].cartonNumber}–${remaining[remaining.length - 1].cartonNumber}`,
                offline,
                source: 'fast-forward',
            },
            `${EVENT_TYPES.CARTON_SCANNED}:${receipt.id}:bulk-${remaining.length}`
        );

        return remaining.length;
    }, [enqueue, scanScript, setState]);

    const undoLastScan = useCallback((shipment) => {
        const current = stateRef.current;
        const receipt = current.receipts?.[shipment.id];
        if (!receipt) return null;
        const entries = Object.entries(receipt.scanned || {});
        if (!entries.length) return null;
        const [lastId] = entries.sort((a, b) => new Date(b[1].at) - new Date(a[1].at))[0];
        const carton = shipment.cartons.find((c) => c.id === lastId) || null;

        setState((prev) => {
            const prevReceipt = prev.receipts?.[shipment.id];
            if (!prevReceipt) return prev;
            const scanned = { ...prevReceipt.scanned };
            delete scanned[lastId];
            return {
                ...prev,
                receipts: { ...(prev.receipts || {}), [shipment.id]: { ...prevReceipt, scanned } },
                scanEvents: [
                    {
                        ...makeScanEvent({
                            receipt: prevReceipt,
                            shipment,
                            outcome: 'undone',
                            barcode: carton?.barcode || lastId,
                            cartonId: lastId,
                            by: SCAN_USER.name,
                        }),
                    },
                    ...(prev.scanEvents || []),
                ].slice(0, MAX_SCAN_EVENTS),
                queue: (prev.queue || []).filter(
                    (e) => !(e.dedupeKey === dedupeKeys.cartonScanned(prevReceipt.id, lastId) && e.status === 'queued')
                ),
            };
        });

        return carton;
    }, [setState]);

    const recordExtraCarton = useCallback((shipment, barcode) => {
        setState((prev) => {
            const prevReceipt = prev.receipts?.[shipment.id];
            if (!prevReceipt) return prev;
            const extras = prevReceipt.extras || [];
            if (extras.some((extra) => extra.barcode === barcode)) return prev;
            return {
                ...prev,
                receipts: {
                    ...(prev.receipts || {}),
                    [shipment.id]: {
                        ...prevReceipt,
                        extras: [...extras, { id: nextId('extra'), barcode, at: new Date().toISOString() }],
                    },
                },
            };
        });
    }, [setState]);

    const openIssue = useCallback((shipment, draft) => {
        const current = stateRef.current;
        const receipt = current.receipts?.[shipment.id] || createReceipt(shipment, SCAN_USER.name);
        const issue = createIssue({ ...draft, receipt, shipment, by: SCAN_USER.name });

        setState((prev) => ({ ...prev, issues: [issue, ...(prev.issues || [])] }));
        enqueue(
            EVENT_TYPES.ISSUE_OPENED,
            {
                issueId: issue.id,
                receiptId: receipt.id,
                shipmentId: shipment.id,
                cartonId: issue.cartonId,
                poLine: issue.poLine,
                type: issue.type,
                severity: issue.severity,
                disposition: issue.disposition,
            },
            dedupeKeys.issueOpened(issue.id)
        );
        return issue;
    }, [enqueue, setState]);

    const updateIssue = useCallback((issueId, patch, label) => {
        setState((prev) => ({
            ...prev,
            issues: (prev.issues || []).map((issue) => {
                if (issue.id !== issueId) return issue;
                const next = { ...issue, ...patch };
                return label ? appendIssueHistory(next, label, { by: SCAN_USER.name }) : next;
            }),
        }));
    }, [setState]);

    const closeIssue = useCallback((issueId, resolution) => {
        const issue = (stateRef.current.issues || []).find((i) => i.id === issueId);
        if (!issue) return;
        setState((prev) => ({
            ...prev,
            issues: (prev.issues || []).map((i) => (
                i.id === issueId ? closeIssueRecord(i, { by: SCAN_USER.name, resolution }) : i
            )),
        }));
        enqueue(
            EVENT_TYPES.ISSUE_CLOSED,
            { issueId, receiptId: issue.receiptId, shipmentId: issue.shipmentId, type: issue.type, resolution },
            dedupeKeys.issueClosed(issueId)
        );
    }, [enqueue, setState]);

    const holdReceipt = useCallback((shipment) => {
        setState((prev) => {
            const prevReceipt = prev.receipts?.[shipment.id];
            if (!prevReceipt) return prev;
            return {
                ...prev,
                receipts: { ...(prev.receipts || {}), [shipment.id]: { ...prevReceipt, status: RECEIPT_STATUS.HELD } },
            };
        });
    }, [setState]);

    const resumeReceipt = useCallback((shipment) => {
        setState((prev) => {
            const prevReceipt = prev.receipts?.[shipment.id];
            if (!prevReceipt || prevReceipt.status === RECEIPT_STATUS.COMPLETED) return prev;
            return {
                ...prev,
                receipts: { ...(prev.receipts || {}), [shipment.id]: { ...prevReceipt, status: RECEIPT_STATUS.IN_PROGRESS } },
            };
        });
    }, [setState]);

    const finishReceipt = useCallback((shipment) => {
        const current = stateRef.current;
        const receipt = current.receipts?.[shipment.id];
        if (!receipt || receipt.status === RECEIPT_STATUS.COMPLETED) return receipt || null;
        const issues = (current.issues || []).filter((issue) => issue.shipmentId === shipment.id);
        const completed = completeReceiptRecord({ shipment, receipt, issues });

        setState((prev) => ({
            ...prev,
            receipts: { ...(prev.receipts || {}), [shipment.id]: completed },
        }));

        enqueue(
            EVENT_TYPES.CARTON_ACCEPTED,
            { receiptId: completed.id, shipmentId: shipment.id, acceptedCount: completed.accepted.length },
            dedupeKeys.cartonAccepted(completed.id)
        );
        enqueue(
            EVENT_TYPES.RECEIPT_COMPLETED,
            {
                receiptId: completed.id,
                shipmentId: shipment.id,
                acceptedCount: completed.accepted.length,
                missingCount: completed.missing.length,
                heldCount: completed.held.length,
                openIssues: issues.filter((i) => i.status === 'open').length,
                completedAt: completed.completedAt,
                user: completed.user,
            },
            dedupeKeys.receiptCompleted(completed.id)
        );

        return completed;
    }, [enqueue, setState]);

    const retryFailed = useCallback(() => {
        setState((prev) => ({
            ...prev,
            queue: (prev.queue || []).map((e) => (e.status === 'failed' ? { ...e, status: 'queued', lastError: null } : e)),
        }));
    }, [setState]);

    const resetDemo = useCallback(() => {
        resetState();
        stateRef.current = INITIAL_STATE;
    }, [resetState]);

    const countsFor = useCallback((shipment) => computeCounts({
        shipment,
        receipt: state.receipts?.[shipment.id],
        issues: (state.issues || []).filter((issue) => issue.shipmentId === shipment.id),
    }), [state.issues, state.receipts]);

    const recentScansFor = useCallback(
        (shipmentId, limit = 8) => (state.scanEvents || []).filter((e) => e.shipmentId === shipmentId).slice(0, limit),
        [state.scanEvents]
    );

    return {
        network,
        isOffline,
        setNetwork,
        syncing,
        queuedCount: queuedEvents.length,
        failedCount: failedEvents.length,
        queue: state.queue || [],
        lastSyncAt: state.lastSyncAt,
        log: state.log || [],
        delivered: state.delivered || {},
        adapters: WAREHOUSE_ADAPTERS,
        issues: state.issues || [],
        receipts: state.receipts || {},
        isCached,
        cacheShipment,
        receiptFor,
        issuesFor,
        countsFor,
        recentScansFor,
        startReceiving,
        scanBarcode,
        simulateNext,
        fastForwardScanning,
        undoLastScan,
        recordExtraCarton,
        openIssue,
        updateIssue,
        closeIssue,
        holdReceipt,
        resumeReceipt,
        finishReceipt,
        syncNow,
        retryFailed,
        resetDemo,
    };
}
