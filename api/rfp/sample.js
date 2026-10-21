import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { guardRfpRequest, sendJson } from '../_rfp/limits.js';
import { extractPdfPages } from '../_rfp/pdfExtract.js';
import { analyzeRfpDocument } from '../_rfp/ai.js';

export const config = {
  maxDuration: 300,
  memory: 1024,
};

const SAMPLE_PUBLIC_PATH = '/rfp-samples/taps-ifb-2025-10.pdf';
const SAMPLE_NAME = 'TAPS-IFB-2025-10-Office-Furniture.pdf';

async function loadSamplePdf(req) {
  // Prefer local public asset (reliable on Vercel + local).
  const localPath = join(process.cwd(), 'public', 'rfp-samples', 'taps-ifb-2025-10.pdf');
  try {
    const buf = await readFile(localPath);
    return buf;
  } catch {
    // Fall back to HTTP fetch of the deployed static file.
    const host = req.headers.host || 'localhost';
    const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
    const url = `${proto}://${host}${SAMPLE_PUBLIC_PATH}`;
    const pdfRes = await fetch(url);
    if (!pdfRes.ok) {
      const err = new Error(`Sample PDF unavailable (${pdfRes.status}). Expected ${SAMPLE_PUBLIC_PATH}.`);
      err.statusCode = 502;
      throw err;
    }
    return Buffer.from(await pdfRes.arrayBuffer());
  }
}

/**
 * POST /api/rfp/sample
 * Loads the built-in TAPS IFB sample server-side (avoids client 4.5MB body limit).
 */
export default async function handler(req, res) {
  if (!guardRfpRequest(req, res, { key: 'rfp-sample', limit: 4 })) return;

  try {
    const buf = await loadSamplePdf(req);
    if (buf.slice(0, 4).toString('utf8') !== '%PDF') {
      sendJson(res, 502, { ok: false, error: 'Sample asset is not a valid PDF.' });
      return;
    }

    // Cap in-memory sample processing (TAPS is ~6.7MB)
    if (buf.length > 12 * 1024 * 1024) {
      sendJson(res, 413, { ok: false, error: 'Sample PDF unexpectedly oversized.' });
      return;
    }

    const extracted = await extractPdfPages(new Uint8Array(buf), { fileName: SAMPLE_NAME });
    const analyzed = await analyzeRfpDocument({
      pages: extracted.pages,
      emptyPages: extracted.emptyPages,
      fileName: SAMPLE_NAME,
      req,
    });

    sendJson(res, 200, {
      ...analyzed,
      ok: true,
      sample: true,
      sampleId: 'taps-ifb-2025-10',
      documents: [{
        fileName: SAMPLE_NAME,
        totalPages: extracted.totalPages,
        extractedCharCount: extracted.extractedCharCount,
        emptyPageCount: extracted.emptyPages.length,
        byteLength: buf.length,
      }],
    });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      ok: false,
      error: error.message || 'Sample analysis failed',
      code: error.code || null,
    });
  }
}
