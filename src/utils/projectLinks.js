const normalizeText = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const uniqueTokens = (values = []) => {
  const seen = new Set();
  return values
    .map((value) => normalizeText(value))
    .filter((value) => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
};

const getOpportunityTokens = (opportunity) => uniqueTokens([
  opportunity?.name,
  opportunity?.company,
  opportunity?.endUser,
  opportunity?.contact,
  ...(opportunity?.dealers || []),
  ...(opportunity?.designFirms || []),
]);

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

const scoreOpportunityMatch = (order, opportunity) => {
  const shipTo = normalizeText(order?.shipTo);
  const orderedBy = normalizeText(order?.orderedBy?.name);
  const tokens = getOpportunityTokens(opportunity);
  let best = 0;

  tokens.forEach((token) => {
    if (!token) return;

    if (shipTo && shipTo === token) {
      best = Math.max(best, 90);
      return;
    }

    if (shipTo && Math.min(shipTo.length, token.length) >= 6 && (shipTo.includes(token) || token.includes(shipTo))) {
      best = Math.max(best, 68);
    }

    if (orderedBy && orderedBy === token) {
      best = Math.max(best, 52);
    }
  });

  return best;
};

export const resolveOrderProjectLink = (order, opportunities = []) => {
  if (!order) return { opportunity: null, source: null };

  const explicitId = order?.linkedProjectId ?? order?.projectId ?? order?.opportunityId;
  if (explicitId != null) {
    const exact = (opportunities || []).find((opportunity) => String(opportunity?.id) === String(explicitId));
    if (exact) return { opportunity: exact, source: 'explicit' };
  }

  const explicitName = normalizeText(order?.linkedProjectName || order?.projectName);
  if (explicitName) {
    const exact = (opportunities || []).find((opportunity) => normalizeText(opportunity?.name) === explicitName);
    if (exact) return { opportunity: exact, source: 'explicit' };
  }

  let bestOpportunity = null;
  let bestScore = 0;
  (opportunities || []).forEach((opportunity) => {
    const score = scoreOpportunityMatch(order, opportunity);
    if (score > bestScore) {
      bestScore = score;
      bestOpportunity = opportunity;
    }
  });

  if (bestOpportunity && bestScore >= 60) {
    return { opportunity: bestOpportunity, source: 'inferred' };
  }

  return { opportunity: null, source: null };
};

export const getSampleOrdersForOpportunity = (opportunity, sampleOrders = [], opportunities = []) => (
  (sampleOrders || []).filter((order) => resolveOrderProjectLink(order, opportunities).opportunity?.id === opportunity?.id)
);