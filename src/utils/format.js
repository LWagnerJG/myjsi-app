// Centralized formatting utilities - use these instead of inline implementations

/**
 * Format a number as USD currency with no decimals
 * @param {number} n - The number to format
 * @returns {string} Formatted currency string (e.g., "$1,234")
 */
export const formatCurrency = (n = 0) =>
  `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

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
 * Format company name with proper title case
 * @param {string} name - Company name to format
 * @returns {string} Title-cased company name
 */
export const formatCompanyName = (name) =>
  name ? name.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase()) : '';

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

/**
 * Format a date string to locale date
 * @param {string|Date} dateStr - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, options = {}) => {
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
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
 * Format a date with weekday, short month and day
 * @param {string|Date} dateStr - Date to format
 * @returns {string} Formatted date (e.g., "Mon, Jan 15")
 */
export const formatDateWithDay = (dateStr) =>
  formatDate(dateStr, { weekday: 'short', month: 'short', day: 'numeric' });

/**
 * Get relative time string (e.g., "2h", "yesterday", "3d ago")
 * @param {Date|number} timestamp - Date or timestamp
 * @returns {string} Relative time string
 */
export const getRelativeTime = (timestamp) => {
  const now = Date.now();
  const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d`;
  return formatShortDate(new Date(time));
};

// Month name to number mapping
export const MONTH_NAME_TO_NUMBER = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};
