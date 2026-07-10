/**
 * Barrel for project linking helpers.
 * Prefer importing from the focused modules when adding new call sites:
 *   projectCustomerLinks, orderProjectLinks, quoteSummaries
 */
export {
  getOpportunityCustomerDisplayName,
  resolveOpportunityCustomerLink,
  buildOpportunityProjectContacts,
} from './projectCustomerLinks.js';

export {
  resolveOrderProjectLink,
  getSampleOrdersForOpportunity,
} from './orderProjectLinks.js';

export {
  normalizeQuoteStatus,
  summarizeProjectQuotes,
} from './quoteSummaries.js';
