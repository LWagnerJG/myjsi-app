/**
 * Pure discount / list-price math for competitive analysis and pricing UIs.
 * Keeps STANDARD_DISCOUNT_OPTIONS (constants/discounts.js) as the option SSOT;
 * this module owns parsing and net calculations.
 */

/** Parse a list price from a number or currency-ish string ("$1,480"). */
export const parseListPrice = (str) => {
  if (typeof str === 'number') return Number.isFinite(str) ? str : 0;
  return parseInt(String(str).replace(/[^0-9]/g, ''), 10) || 0;
};

/**
 * Convert a stacked discount option into a net multiplier.
 * "50/20 (60.00%)" → 0.40  |  "50/20" → 0.40
 */
export const parseNetMultiplier = (discountOption) => {
  const text = String(discountOption || '');
  const paren = text.match(/\((\d+\.?\d*)%\)/);
  if (paren) return 1 - parseFloat(paren[1]) / 100;
  const parts = text.split('/').map((s) => parseFloat(s));
  let net = 1;
  for (const p of parts) if (!Number.isNaN(p)) net *= (1 - p / 100);
  return net;
};

export const applyDiscount = (list, discountOption) =>
  Math.round(list * parseNetMultiplier(discountOption));

export const getOffListPercent = (discountOption) =>
  (1 - parseNetMultiplier(discountOption)) * 100;

export const calculateCompetitiveDelta = (baselineNet, comparisonNet) => {
  if (baselineNet <= 0) return 0;
  return Math.round(((comparisonNet - baselineNet) / baselineNet) * 100);
};

/** Strip the parenthetical net% for compact display: "50/20 (60.00%)" → "50/20". */
export const shortDiscount = (opt) => String(opt || '').replace(/\s*\(.*\)/, '');

export const formatPercentValue = (value) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toFixed(Number.isInteger(rounded) ? 0 : 2)}%`;
};

export const normalizeDiscountSegment = (value) => {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/\.0+$|0+$/, '').replace(/\.$/, '');
};

export const buildDiscountOptionFromSegments = (segments) => {
  const chain = segments.map(normalizeDiscountSegment).join('/');
  const netMultiplier = segments.reduce((net, segment) => net * (1 - segment / 100), 1);
  const offListPercent = (1 - netMultiplier) * 100;
  return `${chain} (${offListPercent.toFixed(2)}%)`;
};

/**
 * Parse free-form custom discount input ("50/20/5").
 * @returns {{ option?: string, normalizedInput?: string, error?: string }}
 */
export const parseCustomDiscountInput = (rawValue) => {
  const value = String(rawValue || '').trim();
  if (!value) {
    return { error: 'Enter a discount like 50/20/5' };
  }

  const normalized = value.replace(/\s+/g, '').replace(/%/g, '');
  if (!/^\d+(\.\d+)?(\/\d+(\.\d+)?)*$/.test(normalized)) {
    return { error: 'Use numbers separated by /' };
  }

  const segments = normalized.split('/').map(Number);
  if (segments.some((segment) => !Number.isFinite(segment) || segment <= 0 || segment >= 100)) {
    return { error: 'Each number must be between 0 and 100' };
  }

  const option = buildDiscountOptionFromSegments(segments);
  return {
    option,
    normalizedInput: segments.map(normalizeDiscountSegment).join('/'),
    offListPercent: getOffListPercent(option),
    netPercent: parseNetMultiplier(option) * 100,
  };
};
