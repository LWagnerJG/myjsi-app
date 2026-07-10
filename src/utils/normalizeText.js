/**
 * Shared text normalization for matching, search, and slugs.
 * Keep behaviors distinct — linking tokens must stay identical to historical
 * project/order matching (no accent folding, no hyphens).
 */

/** Compact alphanumeric token for equality / fuzzy linking. */
export const normalizeMatchToken = (value) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** Accent-aware search normalize (install instructions, free-text filters). */
export const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** URL / id slug with hyphens. */
export const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** @deprecated Prefer normalizeMatchToken — kept for call-site clarity during migration. */
export const normalizeText = normalizeMatchToken;
