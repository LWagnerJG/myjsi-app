// Warehouse receiving demo data.
// Every order, shipment, and PRO number here is fabricated for demo purposes.

export const DEMO_DATA_NOTE = 'Demo data — not a live shipment feed';

export const MISSING_CARTON_NUMBER = 173;
export const DAMAGED_CARTON_NUMBER = 8;

export const SCAN_USER = { id: 'wh-user-1', name: 'Marisol Reyes', role: 'Warehouse — Santa Clara' };

export const WAREHOUSES = ['Santa Clara', 'Livermore'];

// Cartons per product line for the 180-carton demo shipment. Sums to 180.
const MAIN_LINE_PLAN = [
    { productLine: 'Finn Task', model: 'FN1210', description: 'Finn task chair, mid-back', qty: 1, count: 64, poLine: '1' },
    { productLine: 'Proxy Stack', model: 'PX1140', description: 'Proxy stack chair, poly seat', qty: 2, count: 40, poLine: '2' },
    { productLine: 'Vision Casegoods', model: 'VS4160', description: 'Vision desk shell, 60"', qty: 1, count: 34, poLine: '3' },
    { productLine: 'Bourne Lounge', model: 'BL2251', description: 'Bourne lounge, 2-seat', qty: 1, count: 26, poLine: '4' },
    { productLine: 'Indie Tables', model: 'IN3208', description: 'Indie occasional table, 20" rd', qty: 1, count: 16, poLine: '5' },
];

const CARTONS_PER_PALLET = 13;

const pad = (n, width = 4) => String(n).padStart(width, '0');

/**
 * Builds carton records from a compact plan instead of hand-writing every row.
 * Carton numbering, pallet grouping, and PO sub-lines are all derived so the
 * generated set stays internally consistent for any count.
 */
function buildCartons({ shipmentSeq, shipmentId, plan, total, phaseSplit }) {
    const cartons = [];
    let cartonNumber = 0;

    plan.forEach((line) => {
        for (let i = 0; i < line.count; i += 1) {
            cartonNumber += 1;
            const pallet = `PLT-${pad(Math.ceil(cartonNumber / CARTONS_PER_PALLET), 2)}`;
            const phase = phaseSplit && cartonNumber > phaseSplit.at ? phaseSplit.second : phaseSplit?.first;
            cartons.push({
                id: `HU-${shipmentSeq}-${pad(cartonNumber)}`,
                shipmentId,
                barcode: `${shipmentSeq}${pad(cartonNumber)}`,
                cartonNumber,
                cartonCount: total,
                poLine: `${line.poLine}.${Math.floor(i / 12) + 1}`,
                model: line.model,
                description: line.description,
                productLine: line.productLine,
                qty: line.qty,
                pallet,
                phase: phase || 'Release 1',
            });
        }
    });

    return cartons;
}

function buildMainShipment() {
    const shipmentSeq = '4471';
    const shipmentId = 'SHP-4471';
    const total = MAIN_LINE_PLAN.reduce((sum, line) => sum + line.count, 0);
    const cartons = buildCartons({
        shipmentSeq,
        shipmentId,
        plan: MAIN_LINE_PLAN,
        total,
        phaseSplit: { at: 120, first: 'Phase 1 — Floors 2–3', second: 'Phase 2 — Floor 4' },
    });

    return {
        id: shipmentId,
        seq: shipmentSeq,
        demo: true,
        projectId: 'PRJ-SNOW-A',
        projectName: 'ServiceNow Building A',
        customer: 'One Workplace',
        manufacturer: 'JSI',
        warehouse: 'Santa Clara',
        dealerPo: 'OW-118204',
        salesOrder: 'SO-451220',
        carrier: 'Averitt Express',
        proNumber: '881-4471902',
        shipDate: '2026-08-21',
        expectedArrival: '2026-08-25',
        phase: 'Phase 1 — Floors 2–3',
        pallets: Math.ceil(total / CARTONS_PER_PALLET),
        cartonCount: total,
        productLines: MAIN_LINE_PLAN.map((line) => line.productLine),
        phases: ['Phase 1 — Floors 2–3', 'Phase 2 — Floor 4'],
        cartons,
        // Pre-flagged for the demo: the worker finds this carton crushed at the door.
        damagedCartonNumber: DAMAGED_CARTON_NUMBER,
        missingCartonNumber: MISSING_CARTON_NUMBER,
    };
}

function buildSecondShipment() {
    const shipmentSeq = '4482';
    const shipmentId = 'SHP-4482';
    const plan = [
        { productLine: 'Indie Tables', model: 'IN3208', description: 'Indie occasional table, 20" rd', qty: 1, count: 18, poLine: '1' },
        { productLine: 'Proxy Stack', model: 'PX1140', description: 'Proxy stack chair, poly seat', qty: 2, count: 24, poLine: '2' },
    ];
    const total = plan.reduce((sum, line) => sum + line.count, 0);

    return {
        id: shipmentId,
        seq: shipmentSeq,
        demo: true,
        projectId: 'PRJ-PAN-CAFE',
        projectName: 'Palo Alto Networks Café',
        customer: 'One Workplace',
        manufacturer: 'JSI',
        warehouse: 'Santa Clara',
        dealerPo: 'OW-118377',
        salesOrder: 'SO-451544',
        carrier: 'Averitt Express',
        proNumber: '881-4482115',
        shipDate: '2026-08-22',
        expectedArrival: '2026-08-25',
        phase: 'Release 1 — Café + huddle',
        pallets: Math.ceil(total / CARTONS_PER_PALLET),
        cartonCount: total,
        productLines: plan.map((line) => line.productLine),
        phases: ['Release 1 — Café + huddle'],
        cartons: buildCartons({ shipmentSeq, shipmentId, plan, total }),
    };
}

function buildCompletedShipment() {
    const shipmentSeq = '4463';
    const shipmentId = 'SHP-4463';
    const plan = [
        { productLine: 'Finn Task', model: 'FN1210', description: 'Finn task chair, mid-back', qty: 1, count: 30, poLine: '1' },
        { productLine: 'Vision Casegoods', model: 'VS4160', description: 'Vision desk shell, 60"', qty: 1, count: 12, poLine: '2' },
    ];
    const total = plan.reduce((sum, line) => sum + line.count, 0);

    return {
        id: shipmentId,
        seq: shipmentSeq,
        demo: true,
        projectId: 'PRJ-STAN-C3',
        projectName: 'Stanford Health Clinic 3',
        customer: 'One Workplace',
        manufacturer: 'JSI',
        warehouse: 'Santa Clara',
        dealerPo: 'OW-117902',
        salesOrder: 'SO-450882',
        carrier: 'Old Dominion',
        proNumber: '881-4463077',
        shipDate: '2026-08-18',
        expectedArrival: '2026-08-22',
        phase: 'Release 2 — Exam rooms',
        pallets: Math.ceil(total / CARTONS_PER_PALLET),
        cartonCount: total,
        productLines: plan.map((line) => line.productLine),
        phases: ['Release 2 — Exam rooms'],
        cartons: buildCartons({ shipmentSeq, shipmentId, plan, total }),
        preCompleted: {
            receiptNumber: 'RCV-4463-01',
            acceptedCount: total,
            completedAt: '2026-08-22T16:12:00.000Z',
            user: SCAN_USER.name,
        },
    };
}

export const MAIN_SHIPMENT = buildMainShipment();
export const DEMO_SHIPMENTS = [MAIN_SHIPMENT, buildSecondShipment(), buildCompletedShipment()];
export const DEMO_SHIPMENT_INDEX = new Map(DEMO_SHIPMENTS.map((shipment) => [shipment.id, shipment]));

/** A carton that physically shows up on the dock but belongs to another shipment. */
export const FOREIGN_CARTON = DEMO_SHIPMENTS[1].cartons[3];

export const getShipment = (shipmentId) => DEMO_SHIPMENT_INDEX.get(shipmentId) || null;

export const findCartonByBarcode = (barcode) => {
    const clean = String(barcode || '').trim();
    if (!clean) return null;
    for (const shipment of DEMO_SHIPMENTS) {
        const carton = shipment.cartons.find((c) => c.barcode === clean);
        if (carton) return { carton, shipment };
    }
    return null;
};
