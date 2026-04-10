const QUOTE_REQUESTS_STORAGE_KEY = 'myjsi.quote-requests';

const safeParse = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeFiles = (files = []) => files.map((file, index) => ({
  id: `${Date.now()}-${index}`,
  name: file?.name || `attachment-${index + 1}`,
  size: file?.size || 0,
  type: file?.type || 'application/octet-stream',
}));

export const getStoredQuoteRequests = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(QUOTE_REQUESTS_STORAGE_KEY));
};

export const createQuoteRequestRecord = (data = {}, extras = {}) => ({
  id: `quote-request-${Date.now()}`,
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

export const createQuoteListItem = (record, fallbackProjectName = 'Untitled') => ({
  id: `q-${record.id}`,
  fileName: `Quote Request - ${record.projectName || fallbackProjectName}.pdf`,
  status: 'requested',
  url: null,
  requestedAt: record.submittedAt,
});