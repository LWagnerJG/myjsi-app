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

const getOpportunityCustomerTokens = (opportunity) => uniqueTokens([
  opportunity?.endUser,
  opportunity?.company,
]);

const getCustomerTokens = (customer) => uniqueTokens([
  customer?.name,
  customer?.domain,
  customer?.domain ? customer.domain.split('.')[0] : null,
]);

export const getOpportunityCustomerDisplayName = (opportunity, customer) => (
  customer?.name || opportunity?.endUser || opportunity?.company || 'Customer TBD'
);

export const resolveOpportunityCustomerLink = (opportunity, customers = []) => {
  if (!opportunity) return { customer: null, source: null };

  const explicitId = opportunity?.customerId ?? opportunity?.linkedCustomerId;
  if (explicitId != null) {
    const explicitCustomer = (customers || []).find((customer) => String(customer?.id) === String(explicitId));
    if (explicitCustomer) return { customer: explicitCustomer, source: 'explicit' };
  }

  const opportunityTokens = getOpportunityCustomerTokens(opportunity);
  let bestCustomer = null;
  let bestScore = 0;

  (customers || []).forEach((customer) => {
    const customerTokens = getCustomerTokens(customer);
    let score = 0;

    opportunityTokens.forEach((opportunityToken) => {
      customerTokens.forEach((customerToken) => {
        if (!opportunityToken || !customerToken) return;

        if (opportunityToken === customerToken) {
          score = Math.max(score, 100);
          return;
        }

        if (
          Math.min(opportunityToken.length, customerToken.length) >= 6
          && (opportunityToken.includes(customerToken) || customerToken.includes(opportunityToken))
        ) {
          score = Math.max(score, 74);
        }
      });
    });

    if (score > bestScore) {
      bestScore = score;
      bestCustomer = customer;
    }
  });

  if (bestCustomer && bestScore >= 74) {
    return { customer: bestCustomer, source: 'inferred' };
  }

  return { customer: null, source: null };
};

export const buildOpportunityProjectContacts = (opportunity, customer) => {
  const visibleCustomerContacts = (customer?.contacts || []).filter(
    (contact) => !contact?.visibility || contact.visibility === 'dealer',
  );
  const primaryContactToken = normalizeText(opportunity?.contact);
  const matchedCustomerContact = visibleCustomerContacts.find(
    (contact) => normalizeText(contact?.name) === primaryContactToken,
  );

  const contacts = [];
  const seen = new Set();

  const pushContact = (contact, kind, label) => {
    const name = String(contact?.name || '').trim();
    if (!name) return;

    const key = normalizeText(name);
    if (seen.has(key)) return;
    seen.add(key);

    contacts.push({
      id: contact?.id || `${kind}-${key}`,
      kind,
      label,
      name,
      role: contact?.role || contact?.title || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
    });
  };

  if (matchedCustomerContact) {
    pushContact(matchedCustomerContact, 'primary', 'Primary project contact');
  } else if (opportunity?.contact) {
    pushContact({ name: opportunity.contact, role: 'Primary project contact' }, 'primary', 'Primary project contact');
  }

  visibleCustomerContacts.forEach((contact) => {
    if (matchedCustomerContact && String(contact?.id) === String(matchedCustomerContact?.id)) return;
    pushContact(contact, 'customer', 'Customer contact');
  });

  if (customer?.jsiRep) {
    pushContact(customer.jsiRep, 'rep', 'JSI rep');
  }

  return contacts;
};

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