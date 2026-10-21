/** Client-side helpers for library display (mirrors api/_rfp/answerLibrary.js). */

export function isStale(entry, asOf = new Date()) {
  if (!entry?.lastReviewed) return true;
  const reviewed = new Date(entry.lastReviewed);
  if (Number.isNaN(reviewed.getTime())) return true;
  const months = entry.staleAfterMonths ?? 12;
  const cutoff = new Date(asOf);
  cutoff.setMonth(cutoff.getMonth() - months);
  return reviewed < cutoff;
}
