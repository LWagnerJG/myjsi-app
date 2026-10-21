import { describe, it, expect } from 'vitest';
import { matchProducts, buildPricingWorksheet } from './rfpProductMatch.js';

describe('rfpProductMatch', () => {
  it('suggests a catalog series and flags partner exceptions', () => {
    const result = matchProducts({
      itemCodes: [
        { itemCode: 'BCH-1', quantity: 10, context: 'benching workstation with privacy screen', sourcePage: 3 },
        { itemCode: 'DW-1', quantity: 2, context: 'demountable wall system STC 39', sourcePage: 8 },
      ],
    });
    expect(result.matches.some((m) => m.itemCode === 'BCH-1')).toBe(true);
    expect(result.matches.find((m) => m.itemCode === 'BCH-1').label).toMatch(/verify SKU/i);
    expect(result.exceptions.some((e) => e.itemCode === 'DW-1')).toBe(true);
  });

  it('builds rules-based demo pricing with GSA install cap and IFF', () => {
    const pricing = buildPricingWorksheet([
      { itemCode: 'BCH-1', series: 'Vision', quantity: 10, listPrice: 2000, label: 'suggested, verify SKU' },
    ], { gsaMode: true, installFeePct: 0.40, discountOption: '50/20/5 (62.00%)' });
    expect(pricing.demo).toBe(true);
    expect(pricing.installFeePct).toBeLessThanOrEqual(0.30);
    expect(pricing.iff).toBeGreaterThan(0);
    expect(pricing.total).toBeGreaterThan(pricing.subtotalNet);
  });
});
