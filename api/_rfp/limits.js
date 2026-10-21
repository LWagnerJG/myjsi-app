/** Shared limits and abuse controls for RFP API routes. In-memory only — no file persistence. */

export const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel serverless body limit)
export const MAX_FILES = 5;
export const MAX_TOTAL_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME = new Set(['application/pdf']);
export const ALLOWED_EXT = /\.pdf$/i;

/** Sliding-window rate limit: per IP, per route key. */
const buckets = new Map();

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

/**
 * @returns {{ ok: true } | { ok: false, status: number, error: string }}
 */
export function checkRateLimit(req, { key = 'rfp', limit = 12, windowMs = 60_000 } = {}) {
  const ip = getClientIp(req);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  let entry = buckets.get(bucketKey);
  if (!entry || now - entry.start >= windowMs) {
    entry = { start: now, count: 0 };
  }
  entry.count += 1;
  buckets.set(bucketKey, entry);
  if (entry.count > limit) {
    return {
      ok: false,
      status: 429,
      error: 'Too many RFP requests. Please wait a minute and try again.',
    };
  }
  return { ok: true };
}

export function sendJson(res, statusCode, payload, headers = {}) {
  Object.entries({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.status(statusCode).json(payload);
}

/** Demo app: no auth. Lightweight abuse controls only (method + rate limit). */
export function guardRfpRequest(req, res, { key, limit } = {}) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' }, { allow: 'POST' });
    return false;
  }
  const rate = checkRateLimit(req, { key, limit });
  if (!rate.ok) {
    sendJson(res, rate.status, { ok: false, error: rate.error });
    return false;
  }
  return true;
}
