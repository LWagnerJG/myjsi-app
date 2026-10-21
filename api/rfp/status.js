import { sendJson } from '../_rfp/limits.js';
import { getAiConfigStatus } from '../_rfp/aiAuth.js';

/**
 * GET /api/rfp/status — AI auth resolved at request time (OIDC header or API key).
 * Never returns secrets.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' }, { allow: 'GET' });
    return;
  }

  const ai = await getAiConfigStatus(req);
  sendJson(res, 200, {
    ok: true,
    aiConfigured: ai.configured,
    authMethod: ai.authMethod,
    model: ai.configured ? ai.model : null,
    fallbackModel: ai.fallbackModel,
    oidcFromHeader: ai.oidcFromHeader,
    oidcFromEnv: ai.oidcFromEnv,
    oidcResolved: ai.oidcResolved,
    aiMessage: ai.configured ? null : ai.missingHint,
  });
}
