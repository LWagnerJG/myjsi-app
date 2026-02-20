/**
 * ── Central Discount Constants ──
 *
 * Single source of truth for all standard stacked-discount options used
 * throughout the JSI app. Every screen that needs a discount dropdown
 * should import from here instead of defining its own list.
 *
 * Format: "chain (net%)" — e.g. "50/20/5 (62.00%)"
 * Sorted ascending by net percentage.
 */

export const STANDARD_DISCOUNT_OPTIONS = [
    '50 (50.00%)',
    '50/5 (52.50%)',
    '50/8 (54.00%)',
    '50/10 (55.00%)',
    '50/10/5 (57.25%)',
    '50/15 (57.50%)',
    '50/10/10 (59.50%)',
    '50/20 (60.00%)',
    '50/20/1 (60.40%)',
    '50/20/2 (60.80%)',
    '50/20/3 (61.20%)',
    '50/20/4 (61.60%)',
    '50/20/2/3 (61.98%)',
    '50/20/5 (62.00%)',
    '50/20/6 (62.40%)',
    '50/25 (62.50%)',
    '50/20/5/2 (62.76%)',
    '50/20/7 (62.80%)',
    '50/20/8 (63.20%)',
    '50/10/10/10 (63.55%)',
    '50/20/9 (63.60%)',
    '50/20/10 (64.00%)',
    '50/20/8/3 (64.30%)',
    '50/20/10/3 (65.08%)',
    '50/20/10/5 (65.80%)',
    '50/20/15 (66.00%)',
    '50/20/8/8 (66.14%)',
    '50/20/8/8/5 (67.83%)',
    '50/20/20 (68.00%)',
    '50/20/10/8/4 (68.20%)',
    '50/20/10/8/4/5 (69.80%)',
    '50/20/10/20 (71.20%)',
    '50/20/30 (72.00%)',
    '50/50 (75.00%)',
    '80 (80.00%)',
    '50/60 (80.00%)',
    '50/60/25 (85.00%)',
];

/**
 * Convenience pre-built lists for common use-cases:
 *
 * DISCOUNT_OPTIONS_WITH_UNKNOWN — New Lead form (allows "Unknown" as first entry)
 * DISCOUNT_OPTIONS_WITH_UNDECIDED — Projects, dealer directory, etc. (allows "Undecided")
 * DAILY_DISCOUNT_OPTIONS — Alias for DISCOUNT_OPTIONS_WITH_UNDECIDED (dealer daily discount)
 */
export const DISCOUNT_OPTIONS_WITH_UNKNOWN   = ['Unknown', ...STANDARD_DISCOUNT_OPTIONS];
export const DISCOUNT_OPTIONS_WITH_UNDECIDED = ['Undecided', ...STANDARD_DISCOUNT_OPTIONS];

/** Backward-compatible aliases */
export const DISCOUNT_OPTIONS       = DISCOUNT_OPTIONS_WITH_UNDECIDED;
export const DAILY_DISCOUNT_OPTIONS = DISCOUNT_OPTIONS_WITH_UNDECIDED;
