import { guardRfpRequest, sendJson } from '../_rfp/limits.js';
import { analyzeRfpDocument, getAiConfigStatus } from '../_rfp/ai.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
  maxDuration: 120,
};

/**
 * POST /api/rfp/analyze
 * Body: { pages: [{ pageNumber, text, hasExtractableText }], fileName?, emptyPages? }
 * Does not accept raw PDFs — use /api/rfp/extract first. Never logs page text.
 */
export default async function handler(req, res) {
  if (!guardRfpRequest(req, res, { key: 'rfp-analyze', limit: 8 })) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const pages = Array.isArray(body.pages) ? body.pages : [];
    if (!pages.length) {
      sendJson(res, 400, { ok: false, error: 'Provide pages[] from /api/rfp/extract.' });
      return;
    }

    // Strip to safe shape — ignore unexpected fields; do not log
    const safePages = pages.slice(0, 80).map((p, i) => ({
      pageNumber: Number(p.pageNumber) || i + 1,
      text: String(p.text || '').slice(0, 12_000),
      hasExtractableText: Boolean(p.hasExtractableText ?? (p.text && String(p.text).trim().length > 12)),
      fileName: p.fileName ? String(p.fileName).slice(0, 200) : undefined,
    }));

    const result = await analyzeRfpDocument({
      pages: safePages,
      emptyPages: Array.isArray(body.emptyPages) ? body.emptyPages.slice(0, 80) : [],
      fileName: body.fileName ? String(body.fileName).slice(0, 200) : '',
    });

    sendJson(res, 200, result);
  } catch (error) {
    const ai = getAiConfigStatus();
    sendJson(res, 500, {
      ok: false,
      error: 'RFP analysis failed',
      aiConfigured: ai.configured,
      aiMessage: ai.configured ? 'Unexpected analysis error.' : ai.missingHint,
    });
  }
}
