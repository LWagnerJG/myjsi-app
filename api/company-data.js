import { loadCompanyResource } from './_companyData.js';

function sendJson(res, statusCode, payload, headers = {}) {
  Object.entries({
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.status(statusCode).json(payload);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' }, { allow: 'GET' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const resource = url.searchParams.get('resource');
  const refresh = url.searchParams.get('refresh') === '1';

  if (!resource) {
    sendJson(res, 400, { ok: false, error: 'Missing resource query parameter' });
    return;
  }

  try {
    const payload = await loadCompanyResource(resource, { refresh });
    sendJson(res, 200, payload, {
      'cache-control': 's-maxage=120, stale-while-revalidate=600',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      sendJson(res, 200, {
        ok: true,
        configured: false,
        resource,
        fetchedAt: new Date().toISOString(),
        count: 0,
        data: null,
      }, {
        'cache-control': 'no-store',
      });
      return;
    }

    const statusCode = error.statusCode || 502;
    sendJson(res, statusCode, {
      ok: false,
      resource,
      error: error.message || 'Unable to load company data',
    }, {
      'cache-control': 'no-store',
    });
  }
}
