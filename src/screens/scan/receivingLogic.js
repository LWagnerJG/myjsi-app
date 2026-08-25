// Pure receiving logic. No React, no adapters, no storage — so the warehouse
// rules can be tested and reused independently of whichever system consumes them.

/**
 * @typedef {Object} Shipment
 * @property {string} id
 * @property {string} projectId
 * @property {string} dealerPo
 * @property {string} salesOrder
 * @property {string} warehouse
 * @property {string} carrier
 * @property {string} proNumber
 * @property {string} shipDate
 * @property {string} expectedArrival
 * @property {number} pallets      Total handling units on the truck
 * @property {number} cartonCount
 * @property {string[]} productLines
 * @property {string} phase
 * @property {Carton[]} cartons
 *
 * @typedef {Object} Carton
 * @property {string} id           Stable handling-unit id
 * @property {string} shipmentId
 * @property {string} barcode      Unique handling-unit barcode
 * @property {number} cartonNumber
 * @property {number} cartonCount
 * @property {string} poLine
 * @property {string} model
 * @property {string} description
 * @property {number} qty
 * @property {string} pallet
 * @property {string} phase
 *
 * @typedef {Object} ScanEvent
 * @property {string} id
 * @property {string} receiptId
 * @property {string} shipmentId
 * @property {string} barcode
 * @property {string} outcome      valid | duplicate | wrong-shipment | unknown
 * @property {string|null} cartonId
 * @property {string} at           ISO timestamp
 * @property {string} by
 * @property {boolean} offline
 *
 * @typedef {Object} ReceivingIssue
 * @property {string} id
 * @property {string} receiptId
 * @property {string} shipmentId
 * @property {string|null} cartonId
 * @property {string} type
 * @property {string} severity
 * @property {string} disposition  hold | accept
 * @property {string} status       open | closed
 * @property {string} notes
 * @property {string[]} photos
 * @property {string} owner
 * @property {string} openedAt
 * @property {string|null} closedAt
 * @property {{at: string, by: string, label: string}[]} history
 *
 * @typedef {Object} Receipt
 * @property {string} id
 * @property {string} shipmentId
 * @property {string} status       in-progress | held | completed
 * @property {string} startedAt
 * @property {string|null} completedAt
 * @property {string} user
 * @property {Object.<string, {at: string, by: string, barcode: string, offline: boolean}>} scanned
 * @property {string[]} accepted
 * @property {string[]} missing
 * @property {string[]} held
 * @property {Carton[]} extras
 *
 * @typedef {Object} SyncEvent
 * @property {string} id
 * @property {string} type
 * @property {string} dedupeKey
 * @property {Object} payload
 * @property {string} createdAt
 * @property {string} status       queued | synced | failed
 * @property {number} attempts
 * @property {string|null} lastError
 */

/** Carton lifecycle. Physical arrival is deliberately separate from inventory acceptance. */
export const CARTON_STATUS = {
    EXPECTED: 'expected',
    ARRIVED: 'arrived',
    SCANNED: 'scanned',
    ISSUE: 'issue',
    ACCEPTED: 'accepted',
    AVAILABLE: 'available',
    STAGED: 'staged',
    LOADED: 'loaded',
    DELIVERED: 'delivered',
    MISSING: 'missing',
};

export const CARTON_STATUS_LABELS = {
    [CARTON_STATUS.EXPECTED]: 'Not scanned',
    [CARTON_STATUS.ARRIVED]: 'Arrived',
    [CARTON_STATUS.SCANNED]: 'Scanned',
    [CARTON_STATUS.ISSUE]: 'Issue',
    [CARTON_STATUS.ACCEPTED]: 'Accepted',
    [CARTON_STATUS.AVAILABLE]: 'Available',
    [CARTON_STATUS.STAGED]: 'Staged',
    [CARTON_STATUS.LOADED]: 'Loaded',
    [CARTON_STATUS.DELIVERED]: 'Delivered',
    [CARTON_STATUS.MISSING]: 'Missing',
};

/** Theme-color key per carton status, so every status reads the same everywhere. */
export const CARTON_STATUS_TONE = {
    [CARTON_STATUS.EXPECTED]: 'textSecondary',
    [CARTON_STATUS.ARRIVED]: 'info',
    [CARTON_STATUS.SCANNED]: 'info',
    [CARTON_STATUS.ISSUE]: 'warning',
    [CARTON_STATUS.ACCEPTED]: 'success',
    [CARTON_STATUS.AVAILABLE]: 'success',
    [CARTON_STATUS.STAGED]: 'info',
    [CARTON_STATUS.LOADED]: 'info',
    [CARTON_STATUS.DELIVERED]: 'success',
    [CARTON_STATUS.MISSING]: 'error',
};

export const RECEIPT_STATUS = { IN_PROGRESS: 'in-progress', HELD: 'held', COMPLETED: 'completed' };

export const SCAN_OUTCOME = {
    VALID: 'valid',
    DUPLICATE: 'duplicate',
    WRONG_SHIPMENT: 'wrong-shipment',
    UNKNOWN: 'unknown',
    EXTRA: 'extra',
};

export const ISSUE_TYPES = [
    { value: 'missing', label: 'Missing' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'wrong-product', label: 'Wrong product' },
    { value: 'extra-carton', label: 'Extra carton' },
    { value: 'unreadable-label', label: 'Label cannot be read' },
    { value: 'quantity-mismatch', label: 'Quantity mismatch' },
    { value: 'other', label: 'Other' },
];

export const ISSUE_SEVERITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export const ISSUE_OWNERS = ['Warehouse lead', 'Dealer service', 'JSI customer care', 'Carrier claim'];

/** Neutral warehouse events. No system-specific naming leaks into this layer. */
export const EVENT_TYPES = {
    SHIPMENT_CACHED: 'ShipmentCached',
    CARTON_SCANNED: 'CartonScanned',
    CARTON_ACCEPTED: 'CartonAccepted',
    ISSUE_OPENED: 'IssueOpened',
    ISSUE_CLOSED: 'IssueClosed',
    RECEIPT_COMPLETED: 'ReceiptCompleted',
};

export const NETWORK_MODES = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    SLOW: 'slow',
    FAILING: 'failing',
};

export const NETWORK_LABELS = {
    [NETWORK_MODES.ONLINE]: 'Online',
    [NETWORK_MODES.OFFLINE]: 'Offline',
    [NETWORK_MODES.SLOW]: 'Slow service',
    [NETWORK_MODES.FAILING]: 'Sync failing',
};

const iso = (at) => new Date(at ?? Date.now()).toISOString();

let idCounter = 0;
/** Monotonic ids so append-only history stays ordered even inside one millisecond. */
export const nextId = (prefix) => {
    idCounter += 1;
    return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
};

export const receiptNumberFor = (shipment, sequence = 1) =>
    `RCV-${shipment.seq || shipment.id}-${String(sequence).padStart(2, '0')}`;

export function createReceipt(shipment, user, at) {
    return {
        id: receiptNumberFor(shipment),
        shipmentId: shipment.id,
        status: RECEIPT_STATUS.IN_PROGRESS,
        startedAt: iso(at),
        completedAt: null,
        user,
        scanned: {},
        accepted: [],
        missing: [],
        held: [],
        extras: [],
        rejectedAttempts: [],
    };
}

/**
 * Decides what a scanned barcode means for the receipt in progress.
 * `lookupBarcode` resolves a barcode to `{ carton, shipment }` anywhere in the
 * catalog so a carton from another truck can be named rather than just refused.
 */
export function classifyScan(barcode, { shipment, receipt, lookupBarcode }) {
    const clean = String(barcode || '').trim();
    if (!clean) return { outcome: SCAN_OUTCOME.UNKNOWN, barcode: clean, carton: null };

    const match = lookupBarcode?.(clean) || null;

    if (match && match.shipment.id !== shipment.id) {
        return {
            outcome: SCAN_OUTCOME.WRONG_SHIPMENT,
            barcode: clean,
            carton: match.carton,
            otherShipment: match.shipment,
        };
    }

    const carton = shipment.cartons.find((c) => c.barcode === clean) || match?.carton || null;
    if (!carton) return { outcome: SCAN_OUTCOME.UNKNOWN, barcode: clean, carton: null };

    if (receipt?.scanned?.[carton.id]) {
        return {
            outcome: SCAN_OUTCOME.DUPLICATE,
            barcode: clean,
            carton,
            firstScan: receipt.scanned[carton.id],
        };
    }

    return {
        outcome: SCAN_OUTCOME.VALID,
        barcode: clean,
        carton,
        damaged: carton.cartonNumber === shipment.damagedCartonNumber,
    };
}

export function applyScan(receipt, carton, { at, by, offline = false } = {}) {
    if (!receipt || !carton) return receipt;
    if (receipt.scanned[carton.id]) return receipt;
    return {
        ...receipt,
        scanned: {
            ...receipt.scanned,
            [carton.id]: { at: iso(at), by, barcode: carton.barcode, offline },
        },
    };
}

export function recordRejectedAttempt(receipt, attempt, { at, by } = {}) {
    if (!receipt) return receipt;
    return {
        ...receipt,
        rejectedAttempts: [
            ...(receipt.rejectedAttempts || []),
            {
                id: nextId('att'),
                outcome: attempt.outcome,
                barcode: attempt.barcode,
                cartonId: attempt.carton?.id || null,
                belongsTo: attempt.otherShipment?.id || null,
                at: iso(at),
                by,
            },
        ],
    };
}

export function makeScanEvent({ receipt, shipment, outcome, barcode, cartonId, by, offline, at }) {
    return {
        id: nextId('scan'),
        receiptId: receipt?.id || null,
        shipmentId: shipment.id,
        barcode,
        outcome,
        cartonId: cartonId || null,
        at: iso(at),
        by,
        offline: !!offline,
    };
}

export function createIssue({ receipt, shipment, carton, type, severity, disposition, notes, photos, owner, at, by }) {
    const now = iso(at);
    return {
        id: nextId('iss'),
        receiptId: receipt?.id || null,
        shipmentId: shipment.id,
        cartonId: carton?.id || null,
        cartonNumber: carton?.cartonNumber || null,
        barcode: carton?.barcode || null,
        model: carton?.model || null,
        poLine: carton?.poLine || null,
        type,
        severity: severity || 'medium',
        disposition: disposition || 'hold',
        status: 'open',
        notes: notes || '',
        photos: photos || [],
        owner: owner || ISSUE_OWNERS[0],
        openedAt: now,
        closedAt: null,
        history: [{ at: now, by, label: 'Issue opened' }],
    };
}

export function appendIssueHistory(issue, label, { at, by } = {}) {
    return { ...issue, history: [...(issue.history || []), { at: iso(at), by, label }] };
}

export function closeIssue(issue, { at, by, resolution } = {}) {
    const now = iso(at);
    return {
        ...issue,
        status: 'closed',
        closedAt: now,
        resolution: resolution || '',
        history: [...(issue.history || []), { at: now, by, label: resolution ? `Issue closed — ${resolution}` : 'Issue closed' }],
    };
}

/**
 * Derives the live carton status map. Scanning never promotes a carton to
 * available inventory; that only happens once a receipt is posted.
 */
export function buildCartonStatusMap({ shipment, receipt, issues = [] }) {
    const issueByCarton = new Map();
    issues.forEach((issue) => {
        if (issue.cartonId && issue.status === 'open') issueByCarton.set(issue.cartonId, issue);
    });

    const map = new Map();
    const completed = receipt?.status === RECEIPT_STATUS.COMPLETED;
    const acceptedSet = new Set(receipt?.accepted || []);
    const missingSet = new Set(receipt?.missing || []);
    const heldSet = new Set(receipt?.held || []);

    shipment.cartons.forEach((carton) => {
        const scan = receipt?.scanned?.[carton.id];
        let status = CARTON_STATUS.EXPECTED;
        if (scan) status = CARTON_STATUS.SCANNED;
        if (issueByCarton.has(carton.id)) status = CARTON_STATUS.ISSUE;
        if (completed) {
            if (missingSet.has(carton.id)) status = CARTON_STATUS.MISSING;
            else if (heldSet.has(carton.id)) status = CARTON_STATUS.ISSUE;
            else if (acceptedSet.has(carton.id)) status = CARTON_STATUS.AVAILABLE;
        }
        map.set(carton.id, status);
    });

    return map;
}

export function computeCounts({ shipment, receipt, issues = [] }) {
    const expected = shipment.cartonCount;
    const scannedIds = Object.keys(receipt?.scanned || {});
    const scanned = scannedIds.length;

    const receiptIssues = issues.filter((issue) => issue.shipmentId === shipment.id);
    const openIssues = receiptIssues.filter((issue) => issue.status === 'open');
    const heldCartonIds = new Set(
        openIssues.filter((issue) => issue.disposition === 'hold' && issue.cartonId).map((issue) => issue.cartonId)
    );

    const accepted = scannedIds.filter((id) => !heldCartonIds.has(id)).length;
    const missing = Math.max(0, expected - scanned);
    const attempts = receipt?.rejectedAttempts || [];

    return {
        expected,
        scanned,
        accepted,
        held: heldCartonIds.size,
        missing,
        remaining: missing,
        issues: receiptIssues.length,
        openIssues: openIssues.length,
        duplicateAttempts: attempts.filter((a) => a.outcome === SCAN_OUTCOME.DUPLICATE).length,
        wrongShipmentAttempts: attempts.filter((a) => a.outcome === SCAN_OUTCOME.WRONG_SHIPMENT).length,
        extras: receipt?.extras?.length || 0,
    };
}

export function completeReceipt({ shipment, receipt, issues = [], at }) {
    const counts = computeCounts({ shipment, receipt, issues });
    const heldCartonIds = new Set(
        issues
            .filter((issue) => issue.status === 'open' && issue.disposition === 'hold' && issue.cartonId)
            .map((issue) => issue.cartonId)
    );
    const scannedIds = Object.keys(receipt.scanned || {});

    return {
        ...receipt,
        status: RECEIPT_STATUS.COMPLETED,
        completedAt: iso(at),
        accepted: scannedIds.filter((id) => !heldCartonIds.has(id)),
        held: scannedIds.filter((id) => heldCartonIds.has(id)),
        missing: shipment.cartons.filter((c) => !receipt.scanned?.[c.id]).map((c) => c.id),
        counts,
    };
}

/** Plain-language confirmation copy for the review step. */
export function buildCompletionPrompt(counts) {
    const parts = [`Post ${counts.accepted} accepted carton${counts.accepted === 1 ? '' : 's'}`];
    if (counts.held) parts.push(`hold ${counts.held}`);
    const openText = counts.openIssues === 1 ? 'one issue' : `${counts.openIssues} issues`;
    if (counts.openIssues) parts.push(`leave ${openText} open`);
    return `${parts.join(', ')}?`;
}

export function makeSyncEvent(type, payload, { at, dedupeKey } = {}) {
    return {
        id: nextId('evt'),
        type,
        dedupeKey: dedupeKey || `${type}:${nextId('k')}`,
        payload,
        createdAt: iso(at),
        status: 'queued',
        attempts: 0,
        lastError: null,
    };
}

export const dedupeKeys = {
    shipmentCached: (shipmentId) => `${EVENT_TYPES.SHIPMENT_CACHED}:${shipmentId}`,
    cartonScanned: (receiptId, cartonId) => `${EVENT_TYPES.CARTON_SCANNED}:${receiptId}:${cartonId}`,
    cartonAccepted: (receiptId) => `${EVENT_TYPES.CARTON_ACCEPTED}:${receiptId}`,
    issueOpened: (issueId) => `${EVENT_TYPES.ISSUE_OPENED}:${issueId}`,
    issueClosed: (issueId) => `${EVENT_TYPES.ISSUE_CLOSED}:${issueId}`,
    receiptCompleted: (receiptId) => `${EVENT_TYPES.RECEIPT_COMPLETED}:${receiptId}`,
};

/**
 * Scripted barcode order for the simulated scanner. The missing carton is never
 * offered, and a duplicate plus a foreign carton are injected early so the whole
 * exception path is reachable in a few taps.
 */
export function buildScanScript(shipment, foreignBarcode) {
    const cartons = shipment.cartons.filter((c) => c.cartonNumber !== shipment.missingCartonNumber);
    const script = [];
    cartons.forEach((carton, index) => {
        script.push(carton.barcode);
        if (index === 2) script.push(cartons[0].barcode);
        if (index === 4 && foreignBarcode) script.push(foreignBarcode);
    });
    return script;
}

export function nextScriptedBarcode(script, index) {
    if (!script.length) return null;
    return script[Math.min(index, script.length - 1)] ?? null;
}

export const filterCartons = (cartons, { query, status, productLine, pallet, phase }, statusMap) => {
    const q = String(query || '').trim().toLowerCase();
    return cartons.filter((carton) => {
        if (status && status !== 'all' && statusMap.get(carton.id) !== status) return false;
        if (productLine && productLine !== 'all' && carton.productLine !== productLine) return false;
        if (pallet && pallet !== 'all' && carton.pallet !== pallet) return false;
        if (phase && phase !== 'all' && carton.phase !== phase) return false;
        if (!q) return true;
        return (
            carton.barcode.includes(q) ||
            String(carton.cartonNumber) === q ||
            carton.model.toLowerCase().includes(q) ||
            carton.description.toLowerCase().includes(q) ||
            carton.pallet.toLowerCase().includes(q) ||
            carton.poLine.includes(q)
        );
    });
};

export const formatClock = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '—';
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${formatClock(isoString)}`;
};
