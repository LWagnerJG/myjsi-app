/**
 * Request-time AI Gateway auth detection.
 * Do NOT rely only on process.env at module load — on Vercel the OIDC token
 * is usually on the x-vercel-oidc-token request header (via AsyncLocalStorage context).
 */

import { getVercelOidcToken } from '@vercel/oidc';
import { resolveModels, DEFAULT_RFP_MODEL } from './models.js';

const MISSING_HINT = [
  'AI is not configured for this request.',
  'Either set AI_GATEWAY_API_KEY on the Vercel project (Production + Preview),',
  'or enable Project Settings → Security → OIDC Federation so Vercel injects',
  'x-vercel-oidc-token into serverless requests (AI SDK uses getVercelOidcToken()).',
  `Optionally set AI_GATEWAY_MODEL (default ${DEFAULT_RFP_MODEL}).`,
].join(' ');

/**
 * Resolve whether Gateway auth is available for THIS request.
 * @param {{ headers?: Record<string, string|string[]|undefined> }} [req]
 */
export async function getAiConfigStatus(req) {
  const models = resolveModels();
  const hasKey = Boolean(process.env.AI_GATEWAY_API_KEY);

  // Header may be present even when env var is not (production Functions).
  const headerToken = readHeader(req, 'x-vercel-oidc-token');
  const envToken = Boolean(process.env.VERCEL_OIDC_TOKEN);

  let oidcToken = null;
  let oidcError = null;
  if (!hasKey) {
    try {
      oidcToken = await getVercelOidcToken();
    } catch (error) {
      oidcError = error?.message || 'OIDC token unavailable';
      // Last-chance: use raw header if getVercelOidcToken threw (e.g. refresh failed in local)
      if (headerToken) oidcToken = headerToken;
    }
  }

  const hasOidc = Boolean(oidcToken) || Boolean(headerToken) || envToken;
  const configured = hasKey || Boolean(oidcToken) || Boolean(headerToken);

  return {
    configured,
    hasKey,
    hasOidc,
    oidcFromHeader: Boolean(headerToken),
    oidcFromEnv: envToken,
    oidcResolved: Boolean(oidcToken),
    oidcError: configured ? null : oidcError,
    model: models.primary,
    fallbackModel: models.fallback,
    missingHint: MISSING_HINT,
    authMethod: hasKey ? 'api-key' : (configured ? 'oidc' : null),
  };
}

function readHeader(req, name) {
  if (!req?.headers) return '';
  const raw = req.headers[name] ?? req.headers[name.toLowerCase()];
  if (Array.isArray(raw)) return String(raw[0] || '');
  return typeof raw === 'string' ? raw : '';
}
