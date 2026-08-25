// Connection boundary between warehouse work and whatever system consumes it.
// The receiving workflow only ever emits the neutral events in EVENT_TYPES; each
// adapter is responsible for translating them for its own destination.

import { EVENT_TYPES, NETWORK_MODES } from './receivingLogic.js';

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

export class WarehouseSystemAdapter {
    constructor({ id, name, note }) {
        this.id = id;
        this.name = name;
        this.note = note || '';
    }

    /** Human-readable line for the integration log. Subclasses translate here. */
    describe(event) {
        return `${event.type} received`;
    }

    async deliver(event, { mode = NETWORK_MODES.ONLINE, alreadyDelivered } = {}) {
        const base = {
            adapterId: this.id,
            adapterName: this.name,
            eventId: event.id,
            eventType: event.type,
            dedupeKey: event.dedupeKey,
            at: new Date().toISOString(),
        };

        if (alreadyDelivered?.has(event.dedupeKey)) {
            return { ...base, status: 'skipped', message: 'Already received — ignored repeat' };
        }

        if (mode === NETWORK_MODES.SLOW) await wait(700);
        else await wait(90);

        if (mode === NETWORK_MODES.FAILING) {
            return { ...base, status: 'failed', message: `${this.name} did not respond` };
        }

        return { ...base, status: 'delivered', message: this.describe(event) };
    }
}

export class MockHedbergAdapter extends WarehouseSystemAdapter {
    constructor() {
        super({ id: 'hedberg', name: 'Hedberg', note: 'Mock connection' });
    }

    describe(event) {
        const p = event.payload || {};
        switch (event.type) {
            case EVENT_TYPES.SHIPMENT_CACHED:
                return `Inbound ${p.shipmentId} pulled for receiving`;
            case EVENT_TYPES.CARTON_SCANNED:
                return `Carton ${p.cartonNumber} marked arrived on ${p.receiptId}`;
            case EVENT_TYPES.CARTON_ACCEPTED:
                return `${p.acceptedCount} cartons posted to inventory`;
            case EVENT_TYPES.ISSUE_OPENED:
                return `Exception logged on PO line ${p.poLine || '—'}`;
            case EVENT_TYPES.ISSUE_CLOSED:
                return `Exception ${p.issueId} cleared`;
            case EVENT_TYPES.RECEIPT_COMPLETED:
                return `Receiving document ${p.receiptId} posted`;
            default:
                return `${event.type} received`;
        }
    }
}

export class MockFutureErpAdapter extends WarehouseSystemAdapter {
    constructor() {
        super({ id: 'future-erp', name: 'Future ERP', note: 'Mock connection' });
    }

    describe(event) {
        const p = event.payload || {};
        switch (event.type) {
            case EVENT_TYPES.SHIPMENT_CACHED:
                return `inbound_delivery.prepared (${p.shipmentId})`;
            case EVENT_TYPES.CARTON_SCANNED:
                return `handling_unit.arrived (${p.cartonId})`;
            case EVENT_TYPES.CARTON_ACCEPTED:
                return `goods_receipt.accepted (${p.acceptedCount})`;
            case EVENT_TYPES.ISSUE_OPENED:
                return `exception.opened (${p.type})`;
            case EVENT_TYPES.ISSUE_CLOSED:
                return `exception.closed (${p.issueId})`;
            case EVENT_TYPES.RECEIPT_COMPLETED:
                return `goods_receipt.posted (${p.receiptId})`;
            default:
                return `event.received (${event.type})`;
        }
    }
}

export const WAREHOUSE_ADAPTERS = [new MockHedbergAdapter(), new MockFutureErpAdapter()];
