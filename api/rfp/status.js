import { sendJson } from '../_rfp/limits.js';
import { getAiConfigStatus } from '../_rfp/aiAuth.js';

/**
 * GET /api/rfp/status — auth readiness only (no paid inference probe).
 * Never returns secrets.
 *
 * aiConfigured / authConfigured = auth material present.
 * aiOperational is always null here — only a successful analyze proves inference.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' }, { allow: 'GET' });
    return;
  }

  const ai = await getAiConfigStatus(req);
  sendJson(res, 200, {
    ok: true,
    authConfigured: ai.authConfigured,
    // Backward-compatible alias — means AUTH only, not operational inference.
    aiConfigured: ai.configured,
    aiOperational: null,
    operationalState: ai.operationalState,
    operationalHint: ai.operationalHint,
    authMethod: ai.authMethod,
    model: ai.configured ? ai.model : null,
    fallbackModel: ai.fallbackModel,
    oidcFromHeader: ai.oidcFromHeader,
    oidcFromEnv: ai.oidcFromEnv,
    oidcResolved: ai.oidcResolved,
    aiMessage: ai.configured ? ai.operationalHint : ai.missingHint,
  });
}
