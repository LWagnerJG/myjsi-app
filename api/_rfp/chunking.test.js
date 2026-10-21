import { describe, it, expect } from 'vitest';
import { chunkPages, mergeExtractions } from './chunking.js';

describe('chunkPages', () => {
  it('chunks long page lists with overlap and preserves page numbers', () => {
    const pages = Array.from({ length: 30 }, (_, i) => ({
      pageNumber: i + 1,
      text: `Requirement shall apply on page ${i + 1}. `.repeat(20),
      hasExtractableText: true,
    }));
    const chunks = chunkPages(pages, { pagesPerChunk: 10, overlapPages: 1 });
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[0].startPage).toBe(1);
    expect(chunks[0].pages).toHaveLength(10);
    // Overlap: next chunk starts before previous end
    expect(chunks[1].startPage).toBeLessThanOrEqual(chunks[0].endPage);
  });

  it('returns a single chunk for short docs', () => {
    const pages = [
      { pageNumber: 1, text: 'Hello RFP', hasExtractableText: true },
      { pageNumber: 2, text: 'More text', hasExtractableText: true },
    ];
    expect(chunkPages(pages)).toHaveLength(1);
  });
});

describe('mergeExtractions', () => {
  it('dedupes requirements across chunks', () => {
    const merged = mergeExtractions([
      {
        meta: { projectName: 'A', solicitation: 'X-1' },
        requirements: [
          { id: 'a', text: 'Offeror shall provide warranty terms.', sourcePage: 1, sourceQuote: 'provide warranty terms' },
        ],
        itemCodes: [],
        deadlines: [],
        submissionRules: [],
      },
      {
        meta: {},
        requirements: [
          { id: 'b', text: 'Offeror shall provide warranty terms.', sourcePage: 2, sourceQuote: 'provide warranty terms longer' },
          { id: 'c', text: 'Products must meet ANSI/BIFMA.', sourcePage: 3, sourceQuote: 'meet ANSI/BIFMA' },
        ],
        itemCodes: [{ id: 'i1', itemCode: 'BCH-1', quantity: 10, sourcePage: 3, sourceQuote: 'BCH-1 quantity 10' }],
        deadlines: [],
        submissionRules: [],
      },
    ], { meta: {}, requirements: [], itemCodes: [], deadlines: [], submissionRules: [] });

    expect(merged.requirements).toHaveLength(2);
    expect(merged.meta.solicitation).toBe('X-1');
    expect(merged.itemCodes[0].itemCode).toBe('BCH-1');
  });
});
