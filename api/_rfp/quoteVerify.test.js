import { describe, it, expect } from 'vitest';
import { findQuoteInPages, verifySourcedItems } from './quoteVerify.js';

const pages = [
  {
    pageNumber: 1,
    hasExtractableText: true,
    text: 'Offerors shall provide documentation of company capacity and warranty terms. Item BCH-1 quantity 10 are required.',
  },
  {
    pageNumber: 2,
    hasExtractableText: true,
    text: 'All products must comply with applicable ANSI/BIFMA testing standards.',
  },
];

describe('quoteVerify', () => {
  it('finds quotes on the preferred page', () => {
    const hit = findQuoteInPages('provide documentation of company capacity', pages, 1);
    expect(hit.found).toBe(true);
    expect(hit.pageNumber).toBe(1);
  });

  it('drops items whose quote is not in the document when soft=false', () => {
    const { kept, dropped } = verifySourcedItems([
      {
        id: 'r1',
        text: 'Provide warranty',
        sourcePage: 1,
        sourceQuote: 'provide documentation of company capacity',
      },
      {
        id: 'r2',
        text: 'Invented claim',
        sourcePage: 1,
        sourceQuote: 'this quote does not exist anywhere in the rfp text at all',
      },
    ], pages, { soft: false, kind: 'requirement' });

    expect(kept).toHaveLength(1);
    expect(kept[0].quoteVerified).toBe(true);
    expect(dropped).toHaveLength(1);
    expect(dropped[0].id).toBe('r2');
  });

  it('flags unverified quotes when soft=true', () => {
    const { kept, flagged } = verifySourcedItems([
      {
        id: 'r3',
        text: 'Missing',
        sourcePage: 2,
        sourceQuote: 'zzzz-not-in-doc-zzzz',
      },
    ], pages, { soft: true, kind: 'requirement' });
    expect(kept).toHaveLength(1);
    expect(kept[0].quoteVerified).toBe(false);
    expect(flagged).toHaveLength(1);
  });
});
