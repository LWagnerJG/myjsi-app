import { describe, expect, it } from 'vitest';
import {
  parseListPrice,
  parseNetMultiplier,
  applyDiscount,
  getOffListPercent,
  parseCustomDiscountInput,
  shortDiscount,
  calculateCompetitiveDelta,
} from './discountMath.js';
import { cloudinaryImageUrl, CLOUDINARY_THUMB_PREFIX } from './cloudinary.js';
import { normalizeMatchToken, normalizeSearchText, slugify } from './normalizeText.js';
import { createRandomId, safeParseJsonArray, prependToLocalStorageList } from './persistence.js';
import { formatCurrencyOrTbd, parseCurrencyAmount, formatCompanyName, formatRelativeTime } from './format.js';
import { summarizeProjectQuotes, normalizeQuoteStatus } from './quoteSummaries.js';

describe('discountMath', () => {
  it('parses list prices from currency strings', () => {
    expect(parseListPrice('$1,480')).toBe(1480);
    expect(parseListPrice(520)).toBe(520);
  });

  it('parses stacked discount options into net multipliers', () => {
    expect(parseNetMultiplier('50/20 (60.00%)')).toBeCloseTo(0.4, 5);
    expect(parseNetMultiplier('50/20')).toBeCloseTo(0.4, 5);
    expect(applyDiscount(1000, '50/20 (60.00%)')).toBe(400);
    expect(getOffListPercent('50/20 (60.00%)')).toBeCloseTo(60, 5);
  });

  it('parses custom discount input', () => {
    const ok = parseCustomDiscountInput('50/20/5');
    expect(ok.error).toBeUndefined();
    expect(ok.option).toBe('50/20/5 (62.00%)');
    expect(ok.normalizedInput).toBe('50/20/5');
    expect(parseCustomDiscountInput('').error).toBeTruthy();
    expect(shortDiscount('50/20 (60.00%)')).toBe('50/20');
    expect(calculateCompetitiveDelta(400, 440)).toBe(10);
  });
});

describe('cloudinary', () => {
  it('builds preset and custom transform URLs', () => {
    expect(cloudinaryImageUrl('abc_123', 'thumb')).toContain('/t_thumbnail/c_limit,w_256/');
    expect(cloudinaryImageUrl('abc_123', 'thumb')).toContain('/v1/abc_123');
    expect(CLOUDINARY_THUMB_PREFIX).toContain('jasper-jsi-furniture');
    const custom = cloudinaryImageUrl('pid', 'c_pad,w_1000,h_820,b_white/f_auto/q_auto');
    expect(custom).toBe(
      'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/c_pad,w_1000,h_820,b_white/f_auto/q_auto/v1/pid'
    );
  });
});

describe('normalizeText', () => {
  it('normalizes match tokens, search text, and slugs', () => {
    expect(normalizeMatchToken('Business Furniture LLC')).toBe('businessfurniturellc');
    expect(normalizeSearchText('Café  Seating!')).toBe('cafe seating');
    expect(slugify('OFS Rowen Bench')).toBe('ofs-rowen-bench');
  });
});

describe('persistence', () => {
  it('creates random ids and parses arrays safely', () => {
    expect(createRandomId(4)).toMatch(/^[0-9a-f]{8}$/);
    expect(safeParseJsonArray('["a"]')).toEqual(['a']);
    expect(safeParseJsonArray('{bad')).toEqual([]);
    expect(safeParseJsonArray('{"a":1}')).toEqual([]);
  });

  it('prepends to localStorage lists', () => {
    const key = 'myjsi.test.persistence';
    window.localStorage.removeItem(key);
    prependToLocalStorageList(key, { id: 1 }, 2);
    prependToLocalStorageList(key, { id: 2 }, 2);
    prependToLocalStorageList(key, { id: 3 }, 2);
    expect(JSON.parse(window.localStorage.getItem(key))).toEqual([{ id: 3 }, { id: 2 }]);
    window.localStorage.removeItem(key);
  });
});

describe('format helpers', () => {
  it('parses and formats currency consistently', () => {
    expect(parseCurrencyAmount('$50,000')).toBe(50000);
    expect(formatCurrencyOrTbd(520)).toBe('$520');
    expect(formatCurrencyOrTbd(null)).toBe('TBD');
    expect(formatCompanyName('BUSINESS FURNITURE LLC')).toBe('Business Furniture LLC');
  });

  it('supports day-granularity relative dates', () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(formatRelativeTime(iso, { dayGranularity: true })).toBe('Today');
  });
});

describe('quoteSummaries', () => {
  it('rolls up quote statuses', () => {
    expect(normalizeQuoteStatus({ status: 'Review' })).toBe('review');
    const summary = summarizeProjectQuotes([
      { status: 'complete' },
      { status: 'in-progress' },
      { status: 'requested' },
    ]);
    expect(summary.total).toBe(3);
    expect(summary.hasPending).toBe(true);
    expect(summary.label).toContain('in progress');
  });
});
