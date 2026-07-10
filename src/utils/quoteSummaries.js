/**
 * Quote status normalization and project quote rollups.
 */

export const normalizeQuoteStatus = (quote, index = 0) => {
  const raw = String(quote?.status || '').toLowerCase();
  if (['requested', 'in-progress', 'review', 'complete'].includes(raw)) return raw;
  return index === 0 ? 'complete' : 'in-progress';
};

export const summarizeProjectQuotes = (quotes = []) => {
  const counts = { requested: 0, 'in-progress': 0, review: 0, complete: 0 };
  (quotes || []).forEach((quote, index) => {
    counts[normalizeQuoteStatus(quote, index)] += 1;
  });

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return { total: 0, counts, hasPending: false, label: 'No quotes yet' };
  }

  const parts = [];
  if (counts['in-progress']) parts.push(`${counts['in-progress']} in progress`);
  if (counts.review) parts.push(`${counts.review} in review`);
  if (counts.requested) parts.push(`${counts.requested} requested`);
  if (counts.complete) parts.push(`${counts.complete} complete`);

  return {
    total,
    counts,
    hasPending: counts.requested + counts.review + counts['in-progress'] > 0,
    label: parts.join(' · '),
  };
};
