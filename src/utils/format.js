// Centralized formatting utilities - use these instead of inline implementations

/**
 * Format a number as USD currency with no decimals
 * @param {number} n - The number to format
 * @returns {string} Formatted currency string (e.g., "$1,234")
 */
export const formatCurrency = (n = 0) =>
  `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/**
 * Parse a currency-ish value ("$50,000", 50000, "$50k") into a number.
 * @param {string|number|null|undefined} value
 * @returns {number}
 */
export const parseCurrencyAmount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Format currency or a fallback when missing/non-positive.
 * @param {number|null|undefined} n
 * @param {string} [fallback]
 */
export const formatCurrencyOrTbd = (n, fallback = 'TBD') =>
  n == null || Number.isNaN(Number(n)) ? fallback : formatCurrency(n);

/**
 * Format a number as USD currency with 2 decimals
 * @param {number} n - The number to format
 * @returns {string} Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrencyDecimal = (n = 0) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Format a number as compact USD currency with K/M/B suffixes.
 * Uses one decimal unless the value is ≥10× the unit (e.g., $10M+ shows no decimal).
 * @param {number} n - The number to format
 * @returns {string} Compact currency string (e.g., "$1.2M", "$45K", "$500")
 */
export const formatCurrencyCompact = (n = 0) => {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(abs >= 10e9 ? 0 : 1)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(abs >= 10e6 ? 0 : 1)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(abs >= 10e3 ? 0 : 1)}K`;
  return `$${n.toFixed(0)}`;
};

/**
 * Format company / org names. Delegates to smartTitleCase so acronyms
 * (LLC, INC, MSD) stay consistent across sales, orders, and projects.
 * @param {string} name
 * @returns {string}
 */
export const formatCompanyName = (name) => smartTitleCase(name);

/**
 * Smart title-case: respects acronyms (LLC, INC, MSD, LECC, etc.),
 * keeps already-mixed-case words, lowercases small words mid-sentence
 * @param {string} str - String to format
 * @returns {string} Smart title-cased string
 */
export const smartTitleCase = (str) => {
    if (!str) return '';
    // If it's already mixed case (has both upper and lower), return as-is
    if (str !== str.toUpperCase() && str !== str.toLowerCase()) return str;
    const ALWAYS_UPPER = new Set(['LLC', 'INC', 'LP', 'LLP', 'PC', 'PA', 'NA', 'DBA', 'MSD', 'LECC', 'II', 'III', 'IV']);
    const SMALL_WORDS = new Set(['of', 'the', 'and', 'in', 'at', 'to', 'for', 'a', 'an', 'on', 'by', 'or']);
    return str.split(' ').map((word, i) => {
        const clean = word.replace(/[^A-Za-z]/g, '');
        if (ALWAYS_UPPER.has(clean.toUpperCase())) return word.toUpperCase();
        if (i > 0 && SMALL_WORDS.has(clean.toLowerCase()) && word.length <= 3) return word.toLowerCase();
        // Title-case: first letter up, rest lower
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a date value safely. Date-only strings ("YYYY-MM-DD") are treated as
 * LOCAL calendar dates — `new Date('2026-04-29')` parses as UTC midnight and
 * renders as Apr 28 in US timezones, which is wrong for ship/ETA/return dates.
 * @param {string|number|Date} value
 * @returns {Date|null} Parsed date, or null when missing/invalid
 */
export const parseDate = (value) => {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const match = typeof value === 'string' ? value.match(DATE_ONLY_RE) : null;
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Format a date string to locale date
 * @param {string|Date} dateStr - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, options = {}) => {
  const date = parseDate(dateStr);
  if (!date) return '';
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format a date with short month and day
 * @param {string|Date} dateStr - Date to format
 * @returns {string} Formatted date (e.g., "Jan 15")
 */
export const formatShortDate = (dateStr) =>
  formatDate(dateStr, { month: 'short', day: 'numeric' });

/**
 * Format a date with short month, day, and year — returns '—' for missing/invalid input.
 * @param {string|Date} dateStr - Date to format
 * @returns {string} Formatted date (e.g., "Jan 15, 2025") or '—'
 */
export const formatLongDate = (dateStr) =>
  dateStr ? (formatDate(dateStr, { month: 'short', day: 'numeric', year: 'numeric' }) || '—') : '—';

/**
 * Weekday + short month/day/year (sample order detail headers).
 * @param {string|Date} dateStr
 * @returns {string} e.g. "Mon, Jan 15, 2025"
 */
export const formatWeekdayDate = (dateStr) =>
  formatDate(dateStr, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Format a date as a relative time string ("3d ago", "2w ago", "just now").
 * Falls back to a short absolute date once older than 30 days.
 * @param {string|Date} dateStr
 * @param {{ todayLabel?: string, yesterdayLabel?: string, dayGranularity?: boolean }} [opts]
 * @returns {string}
 */
export const formatRelativeTime = (dateStr, opts = {}) => {
  if (!dateStr) return '';
  const date = parseDate(dateStr);
  if (!date) return '';
  const todayLabel = opts.todayLabel ?? 'just now';
  const yesterdayLabel = opts.yesterdayLabel ?? 'yesterday';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return todayLabel;

  // Day-granularity mode (sample orders): Today / Yesterday / Nd ago
  if (opts.dayGranularity) {
    const days = Math.floor(diffMs / 86400000);
    if (days === 0) return opts.todayLabel || 'Today';
    if (days === 1) return opts.yesterdayLabel || 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return formatShortDate(dateStr);
  }

  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return todayLabel;
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return yesterdayLabel;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatShortDate(dateStr);
};

