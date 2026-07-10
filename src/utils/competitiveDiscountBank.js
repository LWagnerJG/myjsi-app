import { postJsonToWebhook } from './secureWebhook.js';
import { createRandomId, prependToLocalStorageList, readLocalStorageJsonArray } from './persistence.js';

const COMPETITIVE_DISCOUNT_STORAGE_KEY = 'myjsi.competitive-discount-records';

export const getStoredCompetitiveDiscountRecords = () =>
  readLocalStorageJsonArray(COMPETITIVE_DISCOUNT_STORAGE_KEY);

export const createCompetitiveDiscountRecord = (data = {}) => ({
  id: `competitive-discount-${createRandomId()}`,
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
  prependToLocalStorageList(COMPETITIVE_DISCOUNT_STORAGE_KEY, record, 200);

  if (typeof window !== 'undefined') {
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
  return postJsonToWebhook(
    import.meta.env.VITE_COMPETITIVE_DISCOUNT_POWER_AUTOMATE_URL,
    flattenCompetitiveDiscountRecord(record),
    {
      envKey: 'VITE_COMPETITIVE_DISCOUNT_POWER_AUTOMATE_URL',
      context: 'submitCompetitiveDiscountRecord',
    }
  );
}
