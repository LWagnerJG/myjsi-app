const QUOTE_REQUESTS_STORAGE_KEY = 'myjsi.quote-requests';

/** Cryptographically random ID — not guessable unlike Date.now(). */
const randomId = () => {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * @param {string | null} value - Raw JSON string from localStorage
 * @returns {Array<Object>}
 */
const safeParse = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Normalize File objects into plain serialisable descriptors.
 * @param {File[]} [files]
 * @returns {{ id: string, name: string, size: number, type: string }[]}
 */
const normalizeFiles = (files = []) => files.map((file, index) => ({
  id: `${randomId()}-${index}`,
  name: file?.name || `attachment-${index + 1}`,
  size: file?.size || 0,
  type: file?.type || 'application/octet-stream',
}));

/**
 * Read all persisted quote request records from localStorage.
 * @returns {Array<Object>}
 */
export const getStoredQuoteRequests = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(QUOTE_REQUESTS_STORAGE_KEY));
};

/**
 * Build a new quote-request record from form data.
 * @param {{ projectName?: string, dealerName?: string, adName?: string, quoteType?: string, projectType?: string, neededByDate?: string, contractName?: string, itemsNeeded?: string[], formats?: string[], projectInfo?: string, selectedTeamMembers?: string[], previousQuoteRef?: string, files?: File[] }} [data]
 * @param {{ source?: string, metadata?: Object | null }} [extras]
 * @returns {Object}
 */
export const createQuoteRequestRecord = (data = {}, extras = {}) => ({
  id: `quote-request-${randomId()}`,
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
  previousQuoteRef: data.previousQuoteRef || '',
  files: normalizeFiles(data.files),
  metadata: extras.metadata || null,
});

/**
 * Create a quote-request record and persist it to localStorage.
 * @param {{ projectName?: string, dealerName?: string, adName?: string, quoteType?: string, projectType?: string, neededByDate?: string, contractName?: string, itemsNeeded?: string[], formats?: string[], projectInfo?: string, selectedTeamMembers?: string[], previousQuoteRef?: string, files?: File[] }} [data]
 * @param {{ source?: string, metadata?: Object | null }} [extras]
 * @returns {Object} The newly created record
 */
export const persistQuoteRequest = (data = {}, extras = {}) => {
  const record = createQuoteRequestRecord(data, extras);

  if (typeof window !== 'undefined') {
    const current = getStoredQuoteRequests();
    window.localStorage.setItem(
      QUOTE_REQUESTS_STORAGE_KEY,
      JSON.stringify([record, ...current].slice(0, 100))
    );
  }

  return record;
};

/**
 * Convert a persisted quote-request record into a lightweight quote list item
 * suitable for display in the OpportunityDetail quotes list.
 * @param {{ id: string, projectName?: string, submittedAt: string }} record
 * @param {string} [fallbackProjectName] - Used if record.projectName is empty
 * @returns {{ id: string, fileName: string, status: string, url: null, requestedAt: string }}
 */
export const createQuoteListItem = (record, fallbackProjectName = 'Untitled') => ({
  id: `q-${record.id}`,
  fileName: `Quote Request - ${record.projectName || fallbackProjectName}.pdf`,
  status: 'requested',
  url: null,
  requestedAt: record.submittedAt,
});