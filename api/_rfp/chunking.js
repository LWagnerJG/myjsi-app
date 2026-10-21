/**
 * Chunk long RFPs for LLM extraction, then merge/dedupe across chunks.
 */

export const DEFAULT_PAGES_PER_CHUNK = 12;
export const DEFAULT_CHUNK_OVERLAP_PAGES = 1;
export const DEFAULT_MAX_CHARS_PER_CHUNK = 28_000;

/**
 * Split pages into overlapping chunks for long documents.
 * @param {Array<{ pageNumber: number, text: string, hasExtractableText: boolean }>} pages
 */
export function chunkPages(pages, {
  pagesPerChunk = DEFAULT_PAGES_PER_CHUNK,
  overlapPages = DEFAULT_CHUNK_OVERLAP_PAGES,
  maxCharsPerChunk = DEFAULT_MAX_CHARS_PER_CHUNK,
} = {}) {
  const usable = (pages || []).filter(Boolean);
  if (!usable.length) return [];

  const chunks = [];
  let i = 0;
  while (i < usable.length) {
    const slice = [];
    let chars = 0;
    let j = i;
    while (j < usable.length && slice.length < pagesPerChunk) {
      const page = usable[j];
      const len = page.hasExtractableText ? String(page.text || '').length : 40;
      if (slice.length > 0 && chars + len > maxCharsPerChunk) break;
      slice.push(page);
      chars += len;
      j += 1;
    }
    if (!slice.length) {
      // Force at least one page even if oversized
      slice.push(usable[i]);
      j = i + 1;
    }
    chunks.push({
      index: chunks.length,
      startPage: slice[0].pageNumber,
      endPage: slice[slice.length - 1].pageNumber,
      pages: slice,
    });
    if (j >= usable.length) break;
    i = Math.max(i + 1, j - overlapPages);
  }
  return chunks;
}

export function pagesToPromptBlock(pages, maxChars = DEFAULT_MAX_CHARS_PER_CHUNK) {
  let used = 0;
  const parts = [];
  for (const page of pages) {
    if (!page.hasExtractableText) {
      parts.push(`--- PAGE ${page.pageNumber} [NO EXTRACTABLE TEXT] ---`);
      continue;
    }
    const chunk = String(page.text || '').slice(0, 8000);
    if (used + chunk.length > maxChars) break;
    parts.push(`--- PAGE ${page.pageNumber} ---\n${chunk}`);
    used += chunk.length;
  }
  return parts.join('\n\n');
}

function normalizeKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[“”"']/g, '')
    .trim()
    .slice(0, 180);
}

function mergeByKey(items, keyFn) {
  const map = new Map();
  for (const item of items || []) {
    const key = keyFn(item);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, { ...item });
    } else {
      const existing = map.get(key);
      // Prefer richer quote / quantity
      if ((item.sourceQuote?.length || 0) > (existing.sourceQuote?.length || 0)) {
        existing.sourceQuote = item.sourceQuote;
        existing.sourcePage = item.sourcePage;
      }
      if (existing.quantity == null && item.quantity != null) existing.quantity = item.quantity;
      if (!existing.description && item.description) existing.description = item.description;
      if (!existing.dateText && item.dateText) existing.dateText = item.dateText;
    }
  }
  return Array.from(map.values());
}

/**
 * Merge chunk extractions + heuristic baseline; dedupe requirements/items/deadlines/rules.
 */
export function mergeExtractions(parts, heuristic = {}) {
  const metas = parts.map((p) => p.meta || {}).filter(Boolean);
  const pick = (key) => metas.find((m) => m[key])?.[key] || heuristic.meta?.[key] || '';
  const meta = {
    projectName: pick('projectName') || 'Untitled RFP',
    solicitation: pick('solicitation'),
    dueDate: pick('dueDate'),
    summary: pick('summary'),
    qaDeadline: pick('qaDeadline'),
    walkThrough: pick('walkThrough'),
    submissionMethod: pick('submissionMethod'),
    contractVehicle: pick('contractVehicle'),
  };

  const requirements = mergeByKey(
    [
      ...parts.flatMap((p) => p.requirements || []),
      ...(heuristic.requirements || []),
    ],
    (r) => normalizeKey(r.text),
  ).map((r, i) => ({ ...r, id: r.id || `req-${i + 1}` }));

  const itemCodes = mergeByKey(
    [
      ...parts.flatMap((p) => p.itemCodes || []),
      ...(heuristic.itemCodes || []),
    ],
    (r) => String(r.itemCode || '').toUpperCase(),
  ).map((r) => ({ ...r, itemCode: String(r.itemCode || '').toUpperCase(), id: r.id || `item-${r.itemCode}` }));

  const deadlines = mergeByKey(
    [
      ...parts.flatMap((p) => p.deadlines || []),
      ...(heuristic.deadlines || []),
    ],
    (r) => normalizeKey(r.dateText || r.text),
  );

  const submissionRules = mergeByKey(
    [
      ...parts.flatMap((p) => p.submissionRules || []),
      ...(heuristic.submissionRules || []),
    ],
    (r) => normalizeKey(r.text),
  );

  return { meta, requirements, itemCodes, deadlines, submissionRules };
}
