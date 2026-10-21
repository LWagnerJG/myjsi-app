/**
 * Verify that source quotes actually appear in extracted page text.
 * Drops or flags items whose quote cannot be found.
 */

export function normalizeForMatch(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[“”"‘’']/g, '')
    .replace(/[^\p{L}\p{N}\s./:-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @returns {{ found: boolean, pageNumber: number|null, matchedQuote: string }}
 */
export function findQuoteInPages(quote, pages, preferredPage) {
  const needle = normalizeForMatch(quote);
  if (!needle || needle.length < 8) {
    return { found: false, pageNumber: null, matchedQuote: '' };
  }

  // Prefer an 80-char distinctive fragment from the middle/start of the quote
  const fragments = [
    needle,
    needle.slice(0, Math.min(120, needle.length)),
    needle.slice(0, Math.min(60, needle.length)),
  ].filter((f) => f.length >= 8);

  const ordered = [...(pages || [])].sort((a, b) => {
    if (a.pageNumber === preferredPage) return -1;
    if (b.pageNumber === preferredPage) return 1;
    return a.pageNumber - b.pageNumber;
  });

  for (const page of ordered) {
    if (!page?.hasExtractableText) continue;
    const hay = normalizeForMatch(page.text);
    for (const frag of fragments) {
      if (hay.includes(frag)) {
        return { found: true, pageNumber: page.pageNumber, matchedQuote: quote };
      }
    }
  }
  return { found: false, pageNumber: null, matchedQuote: '' };
}

/**
 * Verify a list of sourced items. Returns kept + dropped with reasons.
 * Items without a usable quote are flagged (kept with quoteVerified=false) when
 * soft=true; otherwise dropped.
 */
export function verifySourcedItems(items, pages, { soft = false, kind = 'item' } = {}) {
  const kept = [];
  const dropped = [];
  const flagged = [];

  for (const item of items || []) {
    const quote = item.sourceQuote || item.context || '';
    const result = findQuoteInPages(quote, pages, item.sourcePage);
    if (result.found) {
      kept.push({
        ...item,
        sourcePage: result.pageNumber || item.sourcePage,
        sourceQuote: item.sourceQuote || quote,
        quoteVerified: true,
      });
      continue;
    }

    // Heuristic items may only have context line — try text field
    if (!result.found && item.text) {
      const alt = findQuoteInPages(item.text, pages, item.sourcePage);
      if (alt.found) {
        kept.push({
          ...item,
          sourcePage: alt.pageNumber || item.sourcePage,
          sourceQuote: item.sourceQuote || item.text.slice(0, 240),
          quoteVerified: true,
        });
        continue;
      }
    }

    if (soft) {
      const flaggedItem = {
        ...item,
        quoteVerified: false,
        notes: [item.notes, 'Source quote not found in extracted text — verify manually.']
          .filter(Boolean)
          .join(' '),
      };
      kept.push(flaggedItem);
      flagged.push({ kind, id: item.id, sourcePage: item.sourcePage, reason: 'quote_not_found' });
    } else {
      dropped.push({ kind, id: item.id, sourcePage: item.sourcePage, reason: 'quote_not_found', text: (item.text || item.itemCode || '').slice(0, 120) });
    }
  }

  return { kept, dropped, flagged };
}

/**
 * Attach verified source quote from the parent requirement onto each answer.
 */
export function attachAnswerSources(answers, requirements) {
  const byId = new Map((requirements || []).map((r) => [r.id, r]));
  return (answers || []).map((ans) => {
    const req = byId.get(ans.requirementId);
    if (!req) {
      return { ...ans, quoteVerified: false, notes: [ans.notes, 'Missing parent requirement.'].filter(Boolean).join(' ') };
    }
    return {
      ...ans,
      sourcePage: ans.sourcePage || req.sourcePage,
      sourceQuote: ans.sourceQuote || req.sourceQuote || req.text?.slice(0, 240) || '',
      quoteVerified: Boolean(req.quoteVerified),
    };
  });
}
