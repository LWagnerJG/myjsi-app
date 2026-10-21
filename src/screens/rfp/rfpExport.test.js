import { describe, it, expect } from 'vitest';
import { buildMarkdown } from './rfpExport.js';

describe('rfpExport', () => {
  it('builds searchable markdown with page sources and needs-info', () => {
    const md = buildMarkdown({
      meta: { projectName: 'Demo RFP', solicitation: 'DEMO-1', dueDate: 'March 15, 2026' },
      requirements: [
        { id: 'r1', text: 'Provide warranty terms', category: 'warranty', sourcePage: 1, sourceQuote: 'warranty terms' },
        { id: 'r2', text: 'Unknown certification', category: 'compliance', sourcePage: 2 },
      ],
      answers: [
        { requirementId: 'r1', status: 'drafted', draftText: 'Limited Lifetime Warranty on casegoods.' },
        { requirementId: 'r2', status: 'needs_info', draftText: '', needsInfoQuestion: 'Which cert applies?' },
      ],
      itemCodes: [{ id: 'i1', itemCode: 'BCH-1', quantity: 10, sourcePage: 1 }],
      productMatch: {
        matches: [{ itemCode: 'BCH-1', series: 'Vision', categoryName: 'Casegoods', quantity: 10, label: 'suggested, verify SKU', status: 'Partial' }],
        exceptions: [],
        disclaimer: 'demo',
      },
      goNoGo: {
        agency: 'Demo RFP',
        recommendation: 'Go — with conditions',
        dueDate: 'March 15, 2026',
        estimatedValue: 'n/a',
        risks: ['Demo risk'],
        disclaimer: 'scorecard disclaimer',
        matrix: [{
          id: 'r1',
          requirement: 'Provide warranty terms',
          category: 'warranty',
          sourcePage: 1,
          sourceQuote: 'warranty terms',
          status: 'Meets',
          confidence: 'Med',
        }],
      },
      approvals: { r1: 'approved' },
    });

    expect(md).toContain('# RFP Response — Demo RFP');
    expect(md).toContain('Source page: 1');
    expect(md).toContain('Limited Lifetime Warranty');
    expect(md).toContain('Needs info: Which cert applies?');
    expect(md).toContain('**BCH-1** → Vision');
    expect(md).toContain('Go / No-Go');
    expect(md).toContain('Approved');
  });
});
