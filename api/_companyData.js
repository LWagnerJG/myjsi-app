const DEFAULT_RESOURCE_URL_ENV = {
  'lead-times': 'MYJSI_LEAD_TIMES_URL',
  'weight-ratings': 'MYJSI_WEIGHT_RATINGS_URL',
  'dealer-directory': 'MYJSI_DEALER_DIRECTORY_URL',
  contracts: 'MYJSI_CONTRACTS_URL',
  presentations: 'MYJSI_PRESENTATIONS_URL',
  orders: 'MYJSI_ORDERS_URL',
  'community-feed': 'MYJSI_COMMUNITY_FEED_URL',
  'knowledge-index': 'MYJSI_KNOWLEDGE_INDEX_URL',
};

const RESOURCE_ALIASES = {
  leadTimes: 'lead-times',
  weightRatings: 'weight-ratings',
  dealerDirectory: 'dealer-directory',
  community: 'community-feed',
  knowledge: 'knowledge-index',
};

const MEMORY_CACHE = new Map();
const DEFAULT_CACHE_SECONDS = 300;

const HUBSPOT_OBJECT_TYPES = new Set(['companies', 'contacts', 'deals', 'tickets']);

function cleanResourceName(resource) {
  const raw = String(resource || '').trim();
  return RESOURCE_ALIASES[raw] || raw;
}

function toNumber(value, fallback = 0) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  return ['true', 'yes', 'y', '1', 'quickship'].includes(String(value ?? '').trim().toLowerCase());
}

function firstValue(row, keys, fallback = '') {
  for (const key of keys) {
    if (row?.[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return row[key];
    }
  }
  return fallback;
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseJsonEnv(value, fallback = {}) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((item) => String(item).trim() !== '')) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((item) => String(item).trim() !== '')) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => String(header || '').trim());
  return rows.slice(1).map((values) => headers.reduce((acc, header, index) => {
    if (header) acc[header] = values[index] ?? '';
    return acc;
  }, {}));
}

function getPathValue(value, path) {
  if (!path) return value;
  return String(path)
    .split('.')
    .filter(Boolean)
    .reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), value);
}

function extractRows(payload, source = {}) {
  const target = getPathValue(payload, source.path);
  if (Array.isArray(target)) return target;
  if (target && typeof target === 'object') {
    if (Array.isArray(target.data)) return target.data;
    if (Array.isArray(target.items)) return target.items;
    if (Array.isArray(target.value)) return target.value;
    if (Array.isArray(target.results)) return target.results;
    if (target.data && typeof target.data === 'object') return target.data;
    if (target.items && typeof target.items === 'object') return target.items;
    if (target.value && typeof target.value === 'object') return target.value;
    if (target.results && typeof target.results === 'object') return target.results;
  }
  return target;
}

function parseMaybeJson(value, fallback) {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value;
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toStringList(value, fallback = []) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  const parsed = parseMaybeJson(value, null);
  if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[|;,]/).map((item) => item.trim()).filter(Boolean);
  }
  return fallback;
}

function normalizeHubSpotResults(rows) {
  return rows.map((row) => ({
    id: row.id,
    ...(row.properties || row),
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
  }));
}

function normalizeWeightRatings(rows) {
  return rows.map((row) => {
    const series = String(firstValue(row, ['series', 'Series', 'productSeries', 'Product Series', 'name', 'Name'])).trim();
    return {
      series,
      slug: slugify(firstValue(row, ['slug', 'Slug'], series)),
      weightLimit: toNumber(firstValue(row, ['weightLimit', 'Weight Limit', 'limit', 'Limit', 'lbs', 'Lbs'], 275), 275),
      failureTestLbs: toNumber(firstValue(row, ['failureTestLbs', 'Failure Test Lbs', 'failureTest', 'Failure Test'], 450), 450),
      image: String(firstValue(row, ['image', 'Image', 'imageUrl', 'Image URL', 'thumbnailUrl', 'Thumbnail URL'])).trim(),
      cloudinaryPublicId: String(firstValue(row, ['cloudinaryPublicId', 'Cloudinary Public ID', 'publicId', 'Public ID', 'cloudinary_public_id'])).trim(),
      supportedTypes: toStringList(firstValue(row, ['supportedTypes', 'Supported Types', 'types', 'Types'], ''), ['Seating']),
      certificationNote: String(firstValue(row, ['certificationNote', 'Certification Note', 'note', 'Note'])).trim(),
    };
  }).filter((row) => row.series)
    .sort((a, b) => a.series.localeCompare(b.series));
}

function normalizeLeadTimes(rows) {
  return rows.map((row) => ({
    series: String(firstValue(row, ['series', 'Series', 'productSeries', 'Product Series', 'name', 'Name'])).trim(),
    type: String(firstValue(row, ['type', 'Type', 'category', 'Category', 'leadTimeType', 'Lead Time Type'], 'Seating')).trim(),
    weeks: toNumber(firstValue(row, ['weeks', 'Weeks', 'leadTimeWeeks', 'Lead Time Weeks', 'lead_time_weeks']), null),
    image: String(firstValue(row, ['image', 'Image', 'imageUrl', 'Image URL', 'thumbnailUrl', 'Thumbnail URL'])).trim(),
    cloudinaryPublicId: String(firstValue(row, ['cloudinaryPublicId', 'Cloudinary Public ID', 'publicId', 'Public ID', 'cloudinary_public_id'])).trim(),
    quickShip: toBoolean(firstValue(row, ['quickShip', 'QuickShip', 'quick_ship', 'Quick Ship'])),
  })).filter((row) => row.series && row.type && row.weeks !== null)
    .sort((a, b) => a.series.localeCompare(b.series));
}

function normalizeDealerDirectory(rows) {
  const flatRows = rows.some((row) => row?.properties) ? normalizeHubSpotResults(rows) : rows;
  return flatRows.map((row, index) => {
    const city = firstValue(row, ['city', 'City']);
    const state = firstValue(row, ['state', 'State']);
    const zip = firstValue(row, ['zip', 'Zip', 'zipCode', 'postal_code']);
    const street = firstValue(row, ['address', 'Address', 'street', 'Street']);
    const addressParts = [street, city, state, zip].filter(Boolean);
    const contactName = firstValue(row, ['primaryContact', 'Primary Contact', 'contact', 'Contact']);
    const contactEmail = firstValue(row, ['email', 'Email', 'primaryEmail', 'Primary Email']);

    return {
      id: firstValue(row, ['id', 'hs_object_id', 'dealerId', 'Dealer ID'], index + 1),
      name: String(firstValue(row, ['name', 'Name', 'company', 'Company', 'dealerName', 'Dealer Name'], 'Unnamed Dealer')).trim(),
      address: String(firstValue(row, ['fullAddress', 'Full Address'], addressParts.join(', '))).trim(),
      phone: String(firstValue(row, ['phone', 'Phone'], '')).trim(),
      territory: String(firstValue(row, ['territory', 'Territory', 'region', 'Region'], '')).trim(),
      salespeople: parseMaybeJson(firstValue(row, ['salespeople', 'Salespeople']), contactName || contactEmail ? [{
        name: contactName || 'Primary Contact',
        email: contactEmail || '',
        status: 'active',
        roleLabel: 'Sales',
      }] : []),
      designers: parseMaybeJson(firstValue(row, ['designers', 'Designers']), []),
      administration: parseMaybeJson(firstValue(row, ['administration', 'Administration', 'admins']), []),
      installers: parseMaybeJson(firstValue(row, ['installers', 'Installers']), []),
      dailyDiscount: String(firstValue(row, ['dailyDiscount', 'Daily Discount', 'discount'], '')).trim(),
      bookings: toNumber(firstValue(row, ['bookings', 'Bookings']), 0),
      sales: toNumber(firstValue(row, ['sales', 'Sales', 'annualrevenue']), 0),
      ytdGoal: toNumber(firstValue(row, ['ytdGoal', 'YTD Goal']), 0),
      rebatableGoal: toNumber(firstValue(row, ['rebatableGoal', 'Rebatable Goal']), 0),
      rebatableSales: toNumber(firstValue(row, ['rebatableSales', 'Rebatable Sales']), 0),
      verticalSales: parseMaybeJson(firstValue(row, ['verticalSales', 'Vertical Sales']), []),
      seriesSales: parseMaybeJson(firstValue(row, ['seriesSales', 'Series Sales']), []),
      repRewards: parseMaybeJson(firstValue(row, ['repRewards', 'Rep Rewards']), []),
      recentProjects: parseMaybeJson(firstValue(row, ['recentProjects', 'Recent Projects']), []),
      monthlySales: parseMaybeJson(firstValue(row, ['monthlySales', 'Monthly Sales']), []),
    };
  }).filter((row) => row.name);
}

function normalizeContracts(value) {
  if (value && !Array.isArray(value) && typeof value === 'object') return value;
  return value.reduce((acc, row) => {
    const id = slugify(firstValue(row, ['id', 'key', 'name', 'Name']));
    if (!id) return acc;
    acc[id] = {
      id,
      name: firstValue(row, ['name', 'Name'], id),
      pricingTableTitle: firstValue(row, ['pricingTableTitle', 'Pricing Table Title'], ''),
      documentUrl: firstValue(row, ['documentUrl', 'Document URL', 'url', 'URL'], ''),
      dealerDocumentUrl: firstValue(row, ['dealerDocumentUrl', 'Dealer Document URL'], ''),
      publicDocumentUrl: firstValue(row, ['publicDocumentUrl', 'Public Document URL'], ''),
      discounts: parseMaybeJson(firstValue(row, ['discounts', 'Discounts']), []),
      entries: parseMaybeJson(firstValue(row, ['entries', 'Entries']), undefined),
    };
    return acc;
  }, {});
}

function normalizePresentations(rows) {
  return rows.map((row, index) => ({
    id: firstValue(row, ['id', 'Id', 'ID'], index + 1),
    title: String(firstValue(row, ['title', 'Title', 'name', 'Name'], 'Untitled Presentation')).trim(),
    category: String(firstValue(row, ['category', 'Category'], 'Company')).trim(),
    type: String(firstValue(row, ['type', 'Type', 'format', 'Format'], 'PowerPoint')).trim(),
    size: String(firstValue(row, ['size', 'Size'], '')).trim(),
    lastUpdated: String(firstValue(row, ['lastUpdated', 'Last Updated', 'updatedAt', 'Modified'], '')).trim(),
    description: String(firstValue(row, ['description', 'Description', 'summary', 'Summary'], '')).trim(),
    downloadUrl: String(firstValue(row, ['downloadUrl', 'Download URL', 'url', 'URL', 'webUrl'], '#')).trim(),
    thumbnailUrl: String(firstValue(row, ['thumbnailUrl', 'Thumbnail URL', 'imageUrl', 'Image URL'], '')).trim(),
    slides: parseMaybeJson(firstValue(row, ['slides', 'Slides']), []),
  })).filter((row) => row.title);
}

function normalizeOrders(rows) {
  return rows.map((row) => ({
    date: firstValue(row, ['date', 'Date', 'poDate', 'PO Date']),
    company: String(firstValue(row, ['company', 'Company', 'dealer', 'Dealer'])).trim(),
    details: String(firstValue(row, ['details', 'Details', 'project', 'Project', 'projectName', 'Project Name'])).trim(),
    orderNumber: String(firstValue(row, ['orderNumber', 'Order Number', 'so', 'SO', 'salesOrder', 'Sales Order'])).trim(),
    vertical: String(firstValue(row, ['vertical', 'Vertical'], '')).trim(),
    po: String(firstValue(row, ['po', 'PO', 'purchaseOrder', 'Purchase Order'], '')).trim(),
    net: toNumber(firstValue(row, ['net', 'Net', 'netAmount', 'Net Amount']), 0),
    shipDate: firstValue(row, ['shipDate', 'Ship Date', 'estimatedShipDate', 'Estimated Ship Date']),
    status: String(firstValue(row, ['status', 'Status'], 'Order Entry')).trim(),
    shipTo: String(firstValue(row, ['shipTo', 'Ship To'], '')).trim(),
    discount: String(firstValue(row, ['discount', 'Discount'], '')).trim(),
    ackDate: firstValue(row, ['ackDate', 'ACK Date', 'acknowledgementDate'], null),
    ackUrl: String(firstValue(row, ['ackUrl', 'ACK URL', 'documentUrl', 'Document URL'], '')).trim(),
    lineItems: parseMaybeJson(firstValue(row, ['lineItems', 'Line Items']), []),
  })).filter((row) => row.orderNumber);
}

function normalizeCommunityFeed(rows) {
  return rows.map((row, index) => ({
    id: firstValue(row, ['id', 'Id', 'ID'], `live-${index + 1}`),
    type: firstValue(row, ['type', 'Type'], 'post'),
    user: parseMaybeJson(firstValue(row, ['user', 'User']), {
      name: firstValue(row, ['author', 'Author', 'name', 'Name'], 'JSI Team'),
      avatar: firstValue(row, ['avatar', 'Avatar'], null),
    }),
    createdAt: firstValue(row, ['createdAt', 'Created At', 'date', 'Date'], Date.now()),
    title: firstValue(row, ['title', 'Title'], ''),
    text: firstValue(row, ['text', 'Text', 'body', 'Body', 'message', 'Message'], ''),
    image: firstValue(row, ['image', 'Image', 'imageUrl', 'Image URL'], null),
    images: parseMaybeJson(firstValue(row, ['images', 'Images']), []),
    likes: toNumber(firstValue(row, ['likes', 'Likes']), 0),
    upvotes: toNumber(firstValue(row, ['upvotes', 'Upvotes']), 0),
    comments: parseMaybeJson(firstValue(row, ['comments', 'Comments']), []),
  })).filter((row) => row.text || row.title);
}

function normalizeKnowledgeIndex(rows) {
  return rows.map((row, index) => ({
    id: firstValue(row, ['id', 'Id', 'ID'], `knowledge-${index + 1}`),
    title: String(firstValue(row, ['title', 'Title', 'name', 'Name'], 'Untitled')).trim(),
    type: String(firstValue(row, ['type', 'Type', 'fileType', 'File Type'], '')).trim(),
    url: String(firstValue(row, ['url', 'URL', 'webUrl', 'Web URL'], '')).trim(),
    summary: String(firstValue(row, ['summary', 'Summary', 'description', 'Description'], '')).trim(),
    updatedAt: firstValue(row, ['updatedAt', 'Updated At', 'modified', 'Modified'], null),
    tags: parseMaybeJson(firstValue(row, ['tags', 'Tags']), []),
  })).filter((row) => row.title);
}

export function normalizeResourcePayload(resource, payload, source = {}) {
  const cleanResource = cleanResourceName(resource);
  const extracted = extractRows(payload, source);
  const rows = extracted?.results && Array.isArray(extracted.results)
    ? extracted.results
    : extracted;

  if (cleanResource === 'contracts') {
    return normalizeContracts(rows);
  }

  const list = Array.isArray(rows) ? rows : [];
  switch (source.mapper || cleanResource) {
    case 'lead-times':
    case 'leadTimes':
      return normalizeLeadTimes(list);
    case 'weight-ratings':
    case 'weightRatings':
      return normalizeWeightRatings(list);
    case 'dealer-directory':
    case 'dealerDirectory':
      return normalizeDealerDirectory(list);
    case 'presentations':
      return normalizePresentations(list);
    case 'orders':
      return normalizeOrders(list);
    case 'community-feed':
    case 'community':
      return normalizeCommunityFeed(list);
    case 'knowledge-index':
    case 'knowledge':
      return normalizeKnowledgeIndex(list);
    default:
      return list;
  }
}

function detectFormat(response, source) {
  if (source.format) return source.format;
  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType.includes('text/csv') || contentType.includes('application/csv')) return 'csv';
  return 'json';
}

async function parseResponse(response, source) {
  const format = detectFormat(response, source);
  if (format === 'csv') return parseCsv(await response.text());
  if (format === 'text') return { text: await response.text() };
  return response.json();
}

function getAuthHeaders(source, env) {
  const headers = { ...(source.headers || {}) };
  const token = source.token || (source.tokenEnv ? env[source.tokenEnv] : null);
  const bearer = source.bearer || (source.bearerEnv ? env[source.bearerEnv] : null);

  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  if (token && !headers.Authorization) headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return headers;
}

async function fetchUrlSource(source, env, fetchImpl) {
  if (!source.url) throw new Error('Missing source URL');
  const response = await fetchImpl(source.url, {
    headers: getAuthHeaders(source, env),
  });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return parseResponse(response, source);
}

async function getGraphToken(env, fetchImpl) {
  const tenantId = env.MICROSOFT_TENANT_ID || env.MYJSI_MICROSOFT_TENANT_ID;
  const clientId = env.MICROSOFT_CLIENT_ID || env.MYJSI_MICROSOFT_CLIENT_ID;
  const clientSecret = env.MICROSOFT_CLIENT_SECRET || env.MYJSI_MICROSOFT_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing Microsoft Graph client credentials');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const response = await fetchImpl(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`Microsoft Graph auth returned ${response.status}`);
  const payload = await response.json();
  return payload.access_token;
}

function encodeGraphPath(path) {
  return String(path || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

async function fetchSharePointFileSource(source, env, fetchImpl) {
  const token = await getGraphToken(env, fetchImpl);
  const driveId = source.driveId || env.MYJSI_SHAREPOINT_DRIVE_ID;
  const siteId = source.siteId || env.MYJSI_SHAREPOINT_SITE_ID;
  const itemId = source.itemId;
  const itemPath = source.itemPath || source.path;

  if (!driveId && !siteId) throw new Error('Missing SharePoint siteId or driveId');

  let url;
  if (itemId && driveId) {
    url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`;
  } else if (itemPath && driveId) {
    url = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodeGraphPath(itemPath)}:/content`;
  } else if (itemPath && siteId) {
    url = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${encodeGraphPath(itemPath)}:/content`;
  } else {
    throw new Error('Missing SharePoint itemId or itemPath');
  }

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`SharePoint returned ${response.status}`);
  return parseResponse(response, source);
}

async function fetchHubSpotSource(source, env, fetchImpl) {
  const token = source.token || env.HUBSPOT_PRIVATE_APP_TOKEN || env.MYJSI_HUBSPOT_PRIVATE_APP_TOKEN;
  const objectType = source.objectType || 'companies';
  if (!token) throw new Error('Missing HubSpot private app token');
  if (!HUBSPOT_OBJECT_TYPES.has(objectType)) throw new Error(`Unsupported HubSpot object type: ${objectType}`);

  const response = await fetchImpl(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      limit: Math.min(toNumber(source.limit, 100), 200),
      properties: Array.isArray(source.properties) ? source.properties : [],
      filterGroups: Array.isArray(source.filterGroups) ? source.filterGroups : [],
      sorts: Array.isArray(source.sorts) ? source.sorts : [],
      query: source.query || undefined,
    }),
  });
  if (!response.ok) throw new Error(`HubSpot returned ${response.status}`);
  return response.json();
}

function getConfiguredSource(resource, env) {
  const cleanResource = cleanResourceName(resource);
  const sourceMap = parseJsonEnv(env.MYJSI_DATA_SOURCES, {});
  const configured = sourceMap[cleanResource];
  if (configured) {
    return typeof configured === 'string' ? { type: 'url', url: configured } : configured;
  }

  const envName = DEFAULT_RESOURCE_URL_ENV[cleanResource];
  const url = envName ? env[envName] : '';
  if (url) return { type: 'url', url };
  return null;
}

async function fetchSource(source, env, fetchImpl) {
  switch (source.type || 'url') {
    case 'url':
      return fetchUrlSource(source, env, fetchImpl);
    case 'sharepoint-file':
      return fetchSharePointFileSource(source, env, fetchImpl);
    case 'hubspot':
      return fetchHubSpotSource(source, env, fetchImpl);
    default:
      throw new Error(`Unsupported source type: ${source.type}`);
  }
}

export async function loadCompanyResource(resource, options = {}) {
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const cleanResource = cleanResourceName(resource);
  const source = getConfiguredSource(cleanResource, env);
  if (!source) {
    const err = new Error(`No live data source configured for ${cleanResource}`);
    err.statusCode = 404;
    throw err;
  }

  const cacheSeconds = toNumber(source.cacheSeconds ?? env.MYJSI_DATA_CACHE_SECONDS, DEFAULT_CACHE_SECONDS);
  const cacheKey = `${cleanResource}:${JSON.stringify(source)}`;
  const cached = MEMORY_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() && !options.refresh) {
    return cached.value;
  }

  const raw = await fetchSource(source, env, fetchImpl);
  const data = normalizeResourcePayload(cleanResource, raw, source);
  const result = {
    ok: true,
    resource: cleanResource,
    source: {
      type: source.type || 'url',
      label: source.label || source.name || source.url || source.objectType || 'configured source',
    },
    fetchedAt: new Date().toISOString(),
    count: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
    data,
  };

  MEMORY_CACHE.set(cacheKey, {
    expiresAt: Date.now() + (cacheSeconds * 1000),
    value: result,
  });

  return result;
}
