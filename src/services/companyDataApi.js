export async function fetchCompanyResource(resource, { signal } = {}) {
  const response = await fetch(`/api/company-data?resource=${encodeURIComponent(resource)}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    signal,
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Company data API did not return JSON');
  }

  const payload = await response.json();
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Company data API returned ${response.status}`);
  }

  return payload;
}

export function hasUsableData(data) {
  if (Array.isArray(data)) return data.length > 0;
  return Boolean(data && typeof data === 'object' && Object.keys(data).length > 0);
}

export function isAbortError(error) {
  return error?.name === 'AbortError';
}
