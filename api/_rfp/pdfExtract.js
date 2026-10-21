/**
 * In-memory PDF text extraction. Never writes uploaded bytes to disk.
 * Pages with little/no extractable text are flagged (OCR not enabled in this proof).
 */

import { extractText } from 'unpdf';

const MIN_CHARS_PER_PAGE = 12;

/**
 * @param {Uint8Array|Buffer|ArrayBuffer} bytes
 * @param {{ fileName?: string }} [opts]
 */
export async function extractPdfPages(bytes, opts = {}) {
  // unpdf rejects Node Buffer even though Buffer subclasses Uint8Array — copy to a plain view.
  const src = bytes instanceof ArrayBuffer
    ? new Uint8Array(bytes)
    : bytes instanceof Uint8Array
      ? bytes
      : new Uint8Array(bytes);
  const data = new Uint8Array(src.byteLength);
  data.set(src);

  const result = await extractText(data, { mergePages: false });
  const pageTexts = Array.isArray(result.text) ? result.text : [String(result.text || '')];
  const totalPages = result.totalPages || pageTexts.length;

  const pages = [];
  const emptyPages = [];

  for (let i = 0; i < totalPages; i += 1) {
    const pageNumber = i + 1;
    const raw = String(pageTexts[i] ?? '').replace(/\u0000/g, '');
    const text = normalizePageText(raw);
    const hasText = text.replace(/\s+/g, '').length >= MIN_CHARS_PER_PAGE;
    pages.push({
      pageNumber,
      text: hasText ? text : '',
      charCount: text.length,
      hasExtractableText: hasText,
    });
    if (!hasText) {
      emptyPages.push({
        pageNumber,
        reason: 'No extractable text on this page. It may be a scanned image; OCR is not enabled in this proof — please provide a text-based PDF or paste the content.',
      });
    }
  }

  return {
    fileName: opts.fileName || 'document.pdf',
    totalPages,
    pages,
    emptyPages,
    extractedCharCount: pages.reduce((n, p) => n + (p.hasExtractableText ? p.charCount : 0), 0),
  };
}

function normalizePageText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Lightweight heuristic extraction used when AI is unavailable, and as a baseline
 * for item codes / quantities that feed later product matching.
 */
export function heuristicExtractRequirements(pages) {
  const joined = pages
    .filter((p) => p.hasExtractableText)
    .map((p) => ({ pageNumber: p.pageNumber, text: p.text }));

  const requirements = [];
  const itemCodes = [];
  const deadlines = [];
  const seenCodes = new Set();
  const seenReq = new Set();

  const codeRe = /\b([A-Z]{2,5}-?\d{1,4}[A-Z]?)\b/g;
  const qtyNearCodeRe = /\b(?:qty|quantity|quan\.?|ea\.?|each|units?)\s*[:=]?\s*(\d{1,5})\b/gi;
  const dateRe = /\b(?:due|deadline|submit(?:tal)?(?:\s+due)?|closes?|closing)\b[^\n.]{0,40}?\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/gi;
  const solicitationRe = /\b(?:solicitation|RFQ|RFP|solicitation\s*(?:no\.?|number|#))\s*[:#]?\s*([A-Z0-9][A-Z0-9-]{4,})\b/gi;

  let projectName = '';
  let solicitation = '';

  for (const { pageNumber, text } of joined) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!projectName && lines[0] && lines[0].length > 8 && lines[0].length < 140) {
      projectName = lines[0];
    }

    let m;
    while ((m = solicitationRe.exec(text)) !== null) {
      if (!solicitation) solicitation = m[1];
    }
    solicitationRe.lastIndex = 0;

    while ((m = dateRe.exec(text)) !== null) {
      deadlines.push({
        id: `deadline-p${pageNumber}-${deadlines.length}`,
        type: 'deadline',
        text: m[0].trim(),
        dateText: m[1],
        sourcePage: pageNumber,
      });
    }
    dateRe.lastIndex = 0;

    // Capture codes with nearby quantity when present on same line
    for (const line of lines) {
      codeRe.lastIndex = 0;
      let cm;
      while ((cm = codeRe.exec(line)) !== null) {
        const code = cm[1].toUpperCase();
        if (seenCodes.has(code)) continue;
        // Skip common false positives
        if (/^(PDF|HTML|HTTP|HTTPS|ANSI|BIFMA|ADA|TAA|GSA|RFQ|RFP)$/.test(code.replace(/-\d+$/, ''))) {
          continue;
        }
        let quantity = null;
        qtyNearCodeRe.lastIndex = 0;
        const qm = qtyNearCodeRe.exec(line);
        if (qm) quantity = Number(qm[1]);
        // Also "10 BCH-1" or "BCH-1 (10)"
        if (quantity == null) {
          const before = line.slice(0, cm.index).match(/(\d{1,5})\s*$/);
          const after = line.slice(cm.index + cm[0].length).match(/^\s*[\(:]?\s*(\d{1,5})\b/);
          if (before) quantity = Number(before[1]);
          else if (after) quantity = Number(after[1]);
        }
        seenCodes.add(code);
        itemCodes.push({
          id: `item-${code}`,
          itemCode: code,
          quantity,
          sourcePage: pageNumber,
          context: line.slice(0, 220),
        });
      }
    }

    // Question-like / shall / must lines as requirements
    for (const line of lines) {
      if (line.length < 24 || line.length > 320) continue;
      const looksLikeReq = /\b(shall|must|required|provide|submit|describe|demonstrate)\b/i.test(line)
        || /\?$/.test(line);
      if (!looksLikeReq) continue;
      const key = line.toLowerCase().slice(0, 80);
      if (seenReq.has(key)) continue;
      seenReq.add(key);
      requirements.push({
        id: `req-p${pageNumber}-${requirements.length}`,
        category: guessCategory(line),
        text: line,
        sourcePage: pageNumber,
        itemCode: null,
        quantity: null,
      });
    }
  }

  return {
    meta: {
      projectName: projectName || 'Untitled RFP',
      solicitation: solicitation || '',
      dueDate: deadlines[0]?.dateText || '',
    },
    requirements,
    itemCodes,
    deadlines,
    submissionRules: requirements.filter((r) => /submit|proposal|package|format|electronic/i.test(r.text)),
  };
}

function guessCategory(line) {
  if (/warrant/i.test(line)) return 'warranty';
  if (/sustain|VOC|BIFMA LEVEL|environment/i.test(line)) return 'sustainability';
  if (/Buy American|TAA|compliance|ADA|HSPD/i.test(line)) return 'compliance';
  if (/manufactur|capacity|facility|campus/i.test(line)) return 'manufacturing';
  if (/company|offeror|experience|qualification/i.test(line)) return 'company';
  if (/qty|quantity|item code|typical/i.test(line)) return 'quantity';
  if (/due|deadline|submit/i.test(line)) return 'submission';
  return 'general';
}

/**
 * Decode a base64 PDF payload into bytes. Rejects oversized inputs.
 */
export function decodeBase64Pdf(dataBase64, maxBytes) {
  if (typeof dataBase64 !== 'string' || !dataBase64.length) {
    throw Object.assign(new Error('Missing PDF data'), { statusCode: 400 });
  }
  const cleaned = dataBase64.includes(',')
    ? dataBase64.slice(dataBase64.indexOf(',') + 1)
    : dataBase64;
  const buf = Buffer.from(cleaned, 'base64');
  if (!buf.length) {
    throw Object.assign(new Error('Invalid PDF data'), { statusCode: 400 });
  }
  if (buf.length > maxBytes) {
    throw Object.assign(new Error(`PDF exceeds ${Math.floor(maxBytes / (1024 * 1024))} MB limit`), {
      statusCode: 413,
    });
  }
  // Quick magic-byte check
  if (buf.slice(0, 4).toString('utf8') !== '%PDF') {
    throw Object.assign(new Error('File is not a valid PDF'), { statusCode: 400 });
  }
  return buf;
}
