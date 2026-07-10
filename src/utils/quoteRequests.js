import { createRandomId, prependToLocalStorageList, readLocalStorageJsonArray } from './persistence.js';

const QUOTE_REQUESTS_STORAGE_KEY = 'myjsi.quote-requests';

/**
 * Normalize File objects into plain serialisable descriptors.
 * @param {File[]} [files]
 * @returns {{ id: string, name: string, size: number, type: string }[]}
 */
const normalizeFiles = (files = []) => files.map((file, index) => ({
  id: `${createRandomId()}-${index}`,
  name: file?.name || `attachment-${index + 1}`,
  size: file?.size || 0,
  type: file?.type || 'application/octet-stream',
}));

/**
 * Read all persisted quote request records from localStorage.
 * @returns {Array<Object>}
 */
export const getStoredQuoteRequests = () => readLocalStorageJsonArray(QUOTE_REQUESTS_STORAGE_KEY);

/**
 * Build a new quote-request record from form data.
 */
export const createQuoteRequestRecord = (data = {}, extras = {}) => ({
  id: `quote-request-${createRandomId()}`,
  submittedAt: new Date().toISOString(),
  status: 'requested',
  source: extras.source || 'app',
  projectName: data.projectName || '',
  dealerName: data.dealerName || '',
  adName: data.adName || '',
  quoteType: data.quoteType || 'new',
  projectType: data.projectType || 'commercial',
  neededByDate: data.neededByDate || '',
  contractName: data.contractName || '',
  itemsNeeded: Array.isArray(data.itemsNeeded) ? data.itemsNeeded : [],
  formats: Array.isArray(data.formats) ? data.formats : [],
  projectInfo: data.projectInfo || '',
  selectedTeamMembers: Array.isArray(data.selectedTeamMembers) ? data.selectedTeamMembers : [],
  selectedTeamMemberNames: Array.isArray(data.selectedTeamMemberNames) ? data.selectedTeamMemberNames : [],
  previousQuoteRef: data.previousQuoteRef || '',
  files: normalizeFiles(data.files),
  metadata: extras.metadata || null,
});

/**
 * Create a quote-request record and persist it to localStorage.
 * @returns {Object} The newly created record
 */
export const persistQuoteRequest = (data = {}, extras = {}) => {
  const record = createQuoteRequestRecord(data, extras);
  prependToLocalStorageList(QUOTE_REQUESTS_STORAGE_KEY, record, 100);
  return record;
};

/**
 * Convert a persisted quote-request record into a lightweight quote list item
 * suitable for display in the OpportunityDetail quotes list.
 */
export const createQuoteListItem = (record, fallbackProjectName = 'Untitled') => ({
  id: `q-${record.id}`,
  fileName: `Quote Request - ${record.projectName || fallbackProjectName}.pdf`,
  status: 'requested',
  url: null,
  requestedAt: record.submittedAt,
  assigneeNames: Array.isArray(record.selectedTeamMemberNames) ? record.selectedTeamMemberNames : [],
});
