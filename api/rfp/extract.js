import {
  guardRfpRequest,
  sendJson,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  ALLOWED_MIME,
  ALLOWED_EXT,
} from '../_rfp/limits.js';
import { decodeBase64Pdf, extractPdfPages, heuristicExtractRequirements } from '../_rfp/pdfExtract.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '9mb',
    },
  },
  maxDuration: 60,
};

/**
 * POST /api/rfp/extract
 * Body: { files: [{ name, mimeType, dataBase64 }] }
 * Processes PDFs in memory only — never writes uploads to disk or logs contents.
 */
export default async function handler(req, res) {
  if (!guardRfpRequest(req, res, { key: 'rfp-extract', limit: 10 })) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const files = Array.isArray(body.files) ? body.files : [];
    if (!files.length) {
      sendJson(res, 400, { ok: false, error: 'Provide at least one PDF in files[].' });
      return;
    }
    if (files.length > MAX_FILES) {
      sendJson(res, 400, { ok: false, error: `Maximum ${MAX_FILES} PDF files per request.` });
      return;
    }

    let totalBytes = 0;
    const documents = [];

    for (const file of files) {
      const name = String(file.name || 'document.pdf');
      const mimeType = String(file.mimeType || 'application/pdf');
      if (!ALLOWED_MIME.has(mimeType) && !ALLOWED_EXT.test(name)) {
        sendJson(res, 400, { ok: false, error: `Only PDF files are accepted (${name}).` });
        return;
      }
      const bytes = decodeBase64Pdf(file.dataBase64, MAX_FILE_BYTES);
      totalBytes += bytes.length;
      if (totalBytes > MAX_TOTAL_BYTES) {
        sendJson(res, 413, { ok: false, error: 'Total upload exceeds size limit.' });
        return;
      }
      const extracted = await extractPdfPages(bytes, { fileName: name });
      documents.push(extracted);
    }

    // Merge pages across attachments with offset page labels kept per-file
    const mergedPages = [];
    const emptyPages = [];
    documents.forEach((doc) => {
      doc.pages.forEach((p) => {
        mergedPages.push({
          ...p,
          fileName: doc.fileName,
          label: documents.length > 1 ? `${doc.fileName} p.${p.pageNumber}` : `p.${p.pageNumber}`,
        });
      });
      doc.emptyPages.forEach((e) => {
        emptyPages.push({ ...e, fileName: doc.fileName });
      });
    });

    const heuristic = heuristicExtractRequirements(mergedPages);

    sendJson(res, 200, {
      ok: true,
      documents: documents.map((d) => ({
        fileName: d.fileName,
        totalPages: d.totalPages,
        extractedCharCount: d.extractedCharCount,
        emptyPageCount: d.emptyPages.length,
      })),
      pages: mergedPages,
      emptyPages,
      heuristic,
      limits: {
        maxFileBytes: MAX_FILE_BYTES,
        maxFiles: MAX_FILES,
      },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(res, status, {
      ok: false,
      error: error.message || 'PDF extraction failed',
    });
  }
}
