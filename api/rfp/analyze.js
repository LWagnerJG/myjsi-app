import { guardRfpRequest, sendJson } from '../_rfp/limits.js';
import { analyzeRfpDocument, getAiConfigStatus } from '../_rfp/ai.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
  maxDuration: 300,
};

/**
 * POST /api/rfp/analyze
 * Body: { pages, emptyPages?, fileName? }
 * Uses request-time OIDC / API key; never logs page text.
 */
export default async function handler(req, res) {
  if (!guardRfpRequest(req, res, { key: 'rfp-analyze', limit: 6 })) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const pages = Array.isArray(body.pages) ? body.pages : [];
    if (!pages.length) {
      sendJson(res, 400, { ok: false, error: 'Provide pages[] from /api/rfp/extract.' });
      return;
    }

    const safePages = pages.slice(0, 200).map((p, i) => ({
      pageNumber: Number(p.pageNumber) || i + 1,
      text: String(p.text || '').slice(0, 12_000),
      hasExtractableText: Boolean(p.hasExtractableText ?? (p.text && String(p.text).trim().length > 12)),
      fileName: p.fileName ? String(p.fileName).slice(0, 200) : undefined,
    }));

    const result = await analyzeRfpDocument({
      pages: safePages,
      emptyPages: Array.isArray(body.emptyPages) ? body.emptyPages.slice(0, 200) : [],
      fileName: body.fileName ? String(body.fileName).slice(0, 200) : '',
      req,
    });

    sendJson(res, 200, result);
  } catch (error) {
    const ai = await getAiConfigStatus(req);
    sendJson(res, 500, {
      ok: false,
      error: error.code === 'TIMEOUT'
        ? error.message
        : 'RFP analysis failed',
      aiConfigured: ai.configured,
      aiMessage: ai.configured ? 'Unexpected analysis error.' : ai.missingHint,
    });
  }
}
