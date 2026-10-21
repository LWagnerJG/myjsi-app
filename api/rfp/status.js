import { sendJson } from '../_rfp/limits.js';
import { getAiConfigStatus } from '../_rfp/ai.js';

/** GET /api/rfp/status — whether AI is configured (no secrets). Demo app: no auth. */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' }, { allow: 'GET' });
    return;
  }
  const ai = getAiConfigStatus();
  sendJson(res, 200, {
    ok: true,
    aiConfigured: ai.configured,
    model: ai.configured ? ai.model : null,
    aiMessage: ai.configured ? null : ai.missingHint,
  });
}
