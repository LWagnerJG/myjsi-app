import { describe, it, expect } from 'vitest';
import {
    DAMAGED_CARTON_NUMBER,
    FOREIGN_CARTON,
    MAIN_SHIPMENT,
    MISSING_CARTON_NUMBER,
    findCartonByBarcode,
} from './data.js';
import {
    CARTON_STATUS,
    SCAN_OUTCOME,
    applyScan,
    buildCartonStatusMap,
    buildCompletionPrompt,
    buildScanScript,
    classifyScan,
    completeReceipt,
    computeCounts,
    createIssue,
    createReceipt,
    dedupeKeys,
    filterCartons,
    recordRejectedAttempt,
} from './receivingLogic.js';

const lookupBarcode = (barcode) => findCartonByBarcode(barcode);
const cartonNumber = (n) => MAIN_SHIPMENT.cartons.find((c) => c.cartonNumber === n);

const scanAll = (receipt, cartons) => cartons.reduce(
    (acc, carton) => applyScan(acc, carton, { by: 'tester' }),
    receipt
);

describe('demo shipment generation', () => {
    it('generates exactly 180 uniquely identified cartons', () => {
        expect(MAIN_SHIPMENT.cartonCount).toBe(180);
        expect(MAIN_SHIPMENT.cartons).toHaveLength(180);
        expect(new Set(MAIN_SHIPMENT.cartons.map((c) => c.id)).size).toBe(180);
        expect(new Set(MAIN_SHIPMENT.cartons.map((c) => c.barcode)).size).toBe(180);
    });

    it('numbers cartons 1..180 and keeps full detail on the record, not in the barcode', () => {
        const first = MAIN_SHIPMENT.cartons[0];
        const last = MAIN_SHIPMENT.cartons[179];
        expect(first.cartonNumber).toBe(1);
        expect(last.cartonNumber).toBe(180);
        expect(first.barcode).not.toContain(first.model);
        expect(first).toMatchObject({ model: expect.any(String), pallet: expect.any(String), poLine: expect.any(String) });
    });

    it('spreads cartons across several product lines and two phases', () => {
        expect(MAIN_SHIPMENT.productLines.length).toBeGreaterThan(2);
        expect(new Set(MAIN_SHIPMENT.cartons.map((c) => c.phase)).size).toBe(2);
        expect(new Set(MAIN_SHIPMENT.cartons.map((c) => c.pallet)).size).toBe(MAIN_SHIPMENT.pallets);
    });
});

describe('classifyScan', () => {
    it('accepts an expected carton', () => {
        const receipt = createReceipt(MAIN_SHIPMENT, 'tester');
        const carton = cartonNumber(1);
        const result = classifyScan(carton.barcode, { shipment: MAIN_SHIPMENT, receipt, lookupBarcode });
        expect(result.outcome).toBe(SCAN_OUTCOME.VALID);
        expect(result.carton.id).toBe(carton.id);
    });

    it('flags the damaged carton as arrived but needing an issue', () => {
        const receipt = createReceipt(MAIN_SHIPMENT, 'tester');
        const result = classifyScan(cartonNumber(DAMAGED_CARTON_NUMBER).barcode, {
            shipment: MAIN_SHIPMENT,
            receipt,
            lookupBarcode,
        });
        expect(result.outcome).toBe(SCAN_OUTCOME.VALID);
        expect(result.damaged).toBe(true);
    });

    it('rejects a second scan of the same carton without changing the count', () => {
        const carton = cartonNumber(2);
        const receipt = applyScan(createReceipt(MAIN_SHIPMENT, 'tester'), carton, { by: 'tester' });
        const result = classifyScan(carton.barcode, { shipment: MAIN_SHIPMENT, receipt, lookupBarcode });
        expect(result.outcome).toBe(SCAN_OUTCOME.DUPLICATE);
        const after = applyScan(receipt, carton, { by: 'tester' });
        expect(Object.keys(after.scanned)).toHaveLength(1);
    });

    it('names the shipment a foreign carton belongs to', () => {
        const receipt = createReceipt(MAIN_SHIPMENT, 'tester');
        const result = classifyScan(FOREIGN_CARTON.barcode, { shipment: MAIN_SHIPMENT, receipt, lookupBarcode });
        expect(result.outcome).toBe(SCAN_OUTCOME.WRONG_SHIPMENT);
        expect(result.otherShipment.id).not.toBe(MAIN_SHIPMENT.id);
    });

    it('treats an unrecognized barcode as unknown', () => {
        const receipt = createReceipt(MAIN_SHIPMENT, 'tester');
        const result = classifyScan('99999999', { shipment: MAIN_SHIPMENT, receipt, lookupBarcode });
        expect(result.outcome).toBe(SCAN_OUTCOME.UNKNOWN);
        expect(result.carton).toBeNull();
    });
});

describe('scan script', () => {
    it('never offers the missing carton and injects a duplicate plus a foreign carton', () => {
        const script = buildScanScript(MAIN_SHIPMENT, FOREIGN_CARTON.barcode);
        const missing = cartonNumber(MISSING_CARTON_NUMBER);
        expect(script).not.toContain(missing.barcode);
        expect(script).toContain(FOREIGN_CARTON.barcode);
        expect(script.filter((barcode) => barcode === MAIN_SHIPMENT.cartons[0].barcode)).toHaveLength(2);
        expect(script).toHaveLength(MAIN_SHIPMENT.cartonCount - 1 + 2);
    });
});

describe('counts and completion', () => {
    const scannedAllButMissing = () => scanAll(
        createReceipt(MAIN_SHIPMENT, 'tester'),
        MAIN_SHIPMENT.cartons.filter((c) => c.cartonNumber !== MISSING_CARTON_NUMBER)
    );

    it('reports 179 scanned and 1 missing before completion', () => {
        const counts = computeCounts({ shipment: MAIN_SHIPMENT, receipt: scannedAllButMissing(), issues: [] });
        expect(counts).toMatchObject({ expected: 180, scanned: 179, missing: 1, accepted: 179 });
    });

    it('keeps a held carton out of the accepted count', () => {
        const receipt = scannedAllButMissing();
        const issue = createIssue({
            receipt,
            shipment: MAIN_SHIPMENT,
            carton: cartonNumber(DAMAGED_CARTON_NUMBER),
            type: 'damaged',
            disposition: 'hold',
            by: 'tester',
        });
        const counts = computeCounts({ shipment: MAIN_SHIPMENT, receipt, issues: [issue] });
        expect(counts.accepted).toBe(178);
        expect(counts.held).toBe(1);
        expect(counts.openIssues).toBe(1);
    });

    it('counts duplicate and wrong-shipment attempts separately from cartons', () => {
        let receipt = scannedAllButMissing();
        receipt = recordRejectedAttempt(receipt, { outcome: SCAN_OUTCOME.DUPLICATE, barcode: '1' }, { by: 'tester' });
        receipt = recordRejectedAttempt(receipt, { outcome: SCAN_OUTCOME.WRONG_SHIPMENT, barcode: '2' }, { by: 'tester' });
        const counts = computeCounts({ shipment: MAIN_SHIPMENT, receipt, issues: [] });
        expect(counts.scanned).toBe(179);
        expect(counts.duplicateAttempts).toBe(1);
        expect(counts.wrongShipmentAttempts).toBe(1);
    });

    it('records the shortage and only posts accepted cartons on completion', () => {
        const receipt = scannedAllButMissing();
        const completed = completeReceipt({ shipment: MAIN_SHIPMENT, receipt, issues: [] });
        expect(completed.accepted).toHaveLength(179);
        expect(completed.missing).toHaveLength(1);
        expect(completed.missing[0]).toBe(cartonNumber(MISSING_CARTON_NUMBER).id);
        expect(completed.status).toBe('completed');
    });

    it('writes plain-language confirmation copy', () => {
        expect(buildCompletionPrompt({ accepted: 179, held: 0, openIssues: 1 }))
            .toBe('Post 179 accepted cartons and leave one issue open?');
        expect(buildCompletionPrompt({ accepted: 178, held: 1, openIssues: 2 }))
            .toBe('Post 178 accepted cartons, hold 1, and leave 2 issues open?');
        expect(buildCompletionPrompt({ accepted: 180, held: 0, openIssues: 0 }))
            .toBe('Post 180 accepted cartons?');
    });
});

describe('carton status map', () => {
    it('keeps scanning separate from available inventory', () => {
        const carton = cartonNumber(1);
        const receipt = applyScan(createReceipt(MAIN_SHIPMENT, 'tester'), carton, { by: 'tester' });
        const beforePost = buildCartonStatusMap({ shipment: MAIN_SHIPMENT, receipt, issues: [] });
        expect(beforePost.get(carton.id)).toBe(CARTON_STATUS.SCANNED);

        const completed = completeReceipt({ shipment: MAIN_SHIPMENT, receipt, issues: [] });
        const afterPost = buildCartonStatusMap({ shipment: MAIN_SHIPMENT, receipt: completed, issues: [] });
        expect(afterPost.get(carton.id)).toBe(CARTON_STATUS.AVAILABLE);
        expect(afterPost.get(cartonNumber(MISSING_CARTON_NUMBER).id)).toBe(CARTON_STATUS.MISSING);
    });

    it('marks a carton with an open issue as an issue, not scanned', () => {
        const carton = cartonNumber(DAMAGED_CARTON_NUMBER);
        const receipt = applyScan(createReceipt(MAIN_SHIPMENT, 'tester'), carton, { by: 'tester' });
        const issue = createIssue({ receipt, shipment: MAIN_SHIPMENT, carton, type: 'damaged', by: 'tester' });
        const map = buildCartonStatusMap({ shipment: MAIN_SHIPMENT, receipt, issues: [issue] });
        expect(map.get(carton.id)).toBe(CARTON_STATUS.ISSUE);
    });
});

describe('bingo sheet filtering', () => {
    it('finds the missing carton by number', () => {
        const receipt = scanAll(
            createReceipt(MAIN_SHIPMENT, 'tester'),
            MAIN_SHIPMENT.cartons.filter((c) => c.cartonNumber !== MISSING_CARTON_NUMBER)
        );
        const completed = completeReceipt({ shipment: MAIN_SHIPMENT, receipt, issues: [] });
        const statusMap = buildCartonStatusMap({ shipment: MAIN_SHIPMENT, receipt: completed, issues: [] });

        const byNumber = filterCartons(MAIN_SHIPMENT.cartons, { query: String(MISSING_CARTON_NUMBER) }, statusMap);
        expect(byNumber.some((c) => c.cartonNumber === MISSING_CARTON_NUMBER)).toBe(true);

        const missingOnly = filterCartons(MAIN_SHIPMENT.cartons, { status: CARTON_STATUS.MISSING }, statusMap);
        expect(missingOnly).toHaveLength(1);
        expect(missingOnly[0].cartonNumber).toBe(MISSING_CARTON_NUMBER);
    });

    it('filters by product line, pallet and phase', () => {
        const statusMap = buildCartonStatusMap({ shipment: MAIN_SHIPMENT, receipt: null, issues: [] });
        const line = MAIN_SHIPMENT.productLines[0];
        const byLine = filterCartons(MAIN_SHIPMENT.cartons, { productLine: line }, statusMap);
        expect(byLine.every((c) => c.productLine === line)).toBe(true);

        const byPallet = filterCartons(MAIN_SHIPMENT.cartons, { pallet: 'PLT-01' }, statusMap);
        expect(byPallet.every((c) => c.pallet === 'PLT-01')).toBe(true);

        const byPhase = filterCartons(MAIN_SHIPMENT.cartons, { phase: MAIN_SHIPMENT.phases[1] }, statusMap);
        expect(byPhase.every((c) => c.phase === MAIN_SHIPMENT.phases[1])).toBe(true);
    });
});

describe('outbound event identity', () => {
    it('produces one stable dedupe key per receipt so a repeated sync cannot double-post', () => {
        expect(dedupeKeys.receiptCompleted('RCV-4471-01')).toBe(dedupeKeys.receiptCompleted('RCV-4471-01'));
        expect(dedupeKeys.receiptCompleted('RCV-4471-01')).not.toBe(dedupeKeys.receiptCompleted('RCV-4471-02'));
        expect(dedupeKeys.cartonScanned('RCV-4471-01', 'HU-4471-0001'))
            .not.toBe(dedupeKeys.cartonScanned('RCV-4471-01', 'HU-4471-0002'));
    });
});
