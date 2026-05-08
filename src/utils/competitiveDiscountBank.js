import { validateWebhookUrl } from './secureWebhook.js';

const COMPETITIVE_DISCOUNT_STORAGE_KEY = 'myjsi.competitive-discount-records';

const COMPETITIVE_DISCOUNT_URL = validateWebhookUrl(
    import.meta.env.VITE_COMPETITIVE_DISCOUNT_POWER_AUTOMATE_URL,
    'VITE_COMPETITIVE_DISCOUNT_POWER_AUTOMATE_URL'
);

const safeParse = (value) => {
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const randomId = () => {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const getStoredCompetitiveDiscountRecords = () => {
    if (typeof window === 'undefined') return [];
    return safeParse(window.localStorage.getItem(COMPETITIVE_DISCOUNT_STORAGE_KEY));
};

export const createCompetitiveDiscountRecord = (data = {}) => ({
    id: `competitive-discount-${randomId()}`,
    submittedAt: new Date().toISOString(),
    source: data.source || 'competitive-analysis',
    categoryId: data.categoryId || '',
    categoryName: data.categoryName || '',
    productId: data.productId || '',
    productName: data.productName || '',
    targetKind: data.targetKind || '',
    targetId: data.targetId || '',
    targetName: data.targetName || '',
    listPrice: typeof data.listPrice === 'number' ? data.listPrice : Number(data.listPrice) || 0,
    customDiscount: data.customDiscount || '',
    customDiscountInput: data.customDiscountInput || '',
    offListPercent: typeof data.offListPercent === 'number' ? data.offListPercent : Number(data.offListPercent) || 0,
    netPercent: typeof data.netPercent === 'number' ? data.netPercent : Number(data.netPercent) || 0,
    route: data.route || (typeof window !== 'undefined' ? window.location.pathname : ''),
});

export const persistCompetitiveDiscountRecord = (data = {}) => {
    const record = createCompetitiveDiscountRecord(data);

    if (typeof window !== 'undefined') {
        const current = getStoredCompetitiveDiscountRecords();
        window.localStorage.setItem(
            COMPETITIVE_DISCOUNT_STORAGE_KEY,
            JSON.stringify([record, ...current].slice(0, 200))
        );

        try {
            window.dispatchEvent(new CustomEvent('myjsi:competitive-discount-recorded', { detail: record }));
        } catch {
            // Ignore dispatch failures in non-browser environments.
        }
    }

    return record;
};

const flattenCompetitiveDiscountRecord = (record) => ({
    submittedAt: record.submittedAt,
    source: record.source,
    categoryId: record.categoryId,
    categoryName: record.categoryName,
    productId: record.productId,
    productName: record.productName,
    targetKind: record.targetKind,
    targetId: record.targetId,
    targetName: record.targetName,
    listPrice: String(record.listPrice || ''),
    customDiscount: record.customDiscount,
    customDiscountInput: record.customDiscountInput,
    offListPercent: `${record.offListPercent}%`,
    netPercent: `${record.netPercent}%`,
    route: record.route,
});

export async function submitCompetitiveDiscountRecord(record) {
    if (!COMPETITIVE_DISCOUNT_URL) return false;

    try {
        const res = await fetch(COMPETITIVE_DISCOUNT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flattenCompetitiveDiscountRecord(record)),
        });

        return [200, 201, 202].includes(res.status);
    } catch (err) {
        console.error('[submitCompetitiveDiscountRecord] Network error:', err);
        return false;
    }
}