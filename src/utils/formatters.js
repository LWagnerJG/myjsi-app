/**
 * @deprecated Use './format.js' (re-exported via './index.js') instead.
 * This file is kept for backwards compatibility only.
 */

// Central formatting helpers (currency, percentage, etc.)
export const formatCurrency = (value, currency = 'USD') => {
  if (value === undefined || value === null || value === '') return '$0';
  const num = Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num);
};

export const parseCurrencyToNumber = (input) => {
  if (!input) return 0;
  return Number(String(input).replace(/[^0-9.-]/g, '')) || 0;
};

export const formatPercent = (val, digits = 1) => {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  return `${val.toFixed(digits)}%`;
};

export const capitalizeWords = (str='') => str.replace(/\b([a-z])/g, (m,c)=>c.toUpperCase());
