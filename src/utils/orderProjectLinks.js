import { normalizeMatchToken as normalizeText } from './normalizeText.js';

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
  (sampleOrders || []).filter((order) => {
    const link = resolveOrderProjectLink(order, opportunities);
    return link.source === 'explicit' && link.opportunity?.id === opportunity?.id;
  })
);
