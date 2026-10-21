import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  extractPdfPages,
  heuristicExtractRequirements,
  decodeBase64Pdf,
} from './pdfExtract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '__fixtures__', 'sample-rfp.pdf');

describe('pdfExtract', () => {
  it('extracts page text and item codes/quantities from the sample RFP fixture', async () => {
    const bytes = readFileSync(fixturePath);
    const extracted = await extractPdfPages(bytes, { fileName: 'sample-rfp.pdf' });

    expect(extracted.totalPages).toBeGreaterThanOrEqual(1);
    expect(extracted.pages[0].hasExtractableText).toBe(true);
    expect(extracted.pages[0].text).toMatch(/BCH-1/);
    expect(extracted.extractedCharCount).toBeGreaterThan(40);

    const heuristic = heuristicExtractRequirements(extracted.pages);
    expect(heuristic.itemCodes.some((i) => i.itemCode === 'BCH-1')).toBe(true);
    const bch = heuristic.itemCodes.find((i) => i.itemCode === 'BCH-1');
    expect(bch.quantity).toBe(10);
    expect(heuristic.deadlines.length).toBeGreaterThanOrEqual(1);
    expect(heuristic.requirements.length).toBeGreaterThanOrEqual(1);
    expect(heuristic.meta.solicitation || heuristic.requirements.join('')).toBeTruthy();
  });

  it('rejects non-PDF base64 payloads', () => {
    const fake = Buffer.from('not-a-pdf').toString('base64');
    expect(() => decodeBase64Pdf(fake, 1024 * 1024)).toThrow(/valid PDF/i);
  });

  it('flags empty/scanned-like pages without inventing text', async () => {
    // Minimal valid PDF with no content stream text
    const emptyPdf = Buffer.from(
      `%PDF-1.1
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj
4 0 obj<< /Length 0 >>stream
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer<< /Size 5 /Root 1 0 R >>
startxref
255
%%EOF
`
    );
    const extracted = await extractPdfPages(emptyPdf, { fileName: 'blank.pdf' });
    expect(extracted.pages[0].hasExtractableText).toBe(false);
    expect(extracted.emptyPages[0].reason).toMatch(/No extractable text/i);
  });
});
