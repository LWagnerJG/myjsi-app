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

  const projectContactNames = Array.isArray(opportunity?.contacts) && opportunity.contacts.length
    ? opportunity.contacts
    : (opportunity?.contact ? [opportunity.contact] : []);

  const matchedCustomerIds = new Set();
  projectContactNames.forEach((rawName) => {
    const token = normalizeText(rawName);
    if (!token) return;
    const match = visibleCustomerContacts.find((contact) => normalizeText(contact?.name) === token);
    if (match) {
      matchedCustomerIds.add(String(match.id));
      pushContact(match, 'primary', 'Primary project contact');
    } else {
      pushContact({ name: rawName, role: 'Primary project contact' }, 'primary', 'Primary project contact');
    }
  });

  visibleCustomerContacts.forEach((contact) => {
    if (matchedCustomerIds.has(String(contact?.id))) return;
    pushContact(contact, 'customer', 'Customer contact');
  });

  if (customer?.jsiRep) {
    pushContact(customer.jsiRep, 'rep', 'JSI rep');
  }

  return contacts;
};
