import { describe, it, expect } from 'vitest';
import { buildMarkdown } from './rfpExport.js';

describe('rfpExport', () => {
  it('builds searchable markdown with page sources and needs-info', () => {
    const md = buildMarkdown({
      meta: { projectName: 'Demo RFP', solicitation: 'DEMO-1', dueDate: 'March 15, 2026' },
      requirements: [
        { id: 'r1', text: 'Provide warranty terms', category: 'warranty', sourcePage: 1 },
        { id: 'r2', text: 'Unknown certification', category: 'compliance', sourcePage: 2 },
      ],
      answers: [
        { requirementId: 'r1', status: 'drafted', draftText: 'Limited Lifetime Warranty on casegoods.' },
        { requirementId: 'r2', status: 'needs_info', draftText: '', needsInfoQuestion: 'Which cert applies?' },
      ],
      itemCodes: [{ id: 'i1', itemCode: 'BCH-1', quantity: 10, sourcePage: 1 }],
      deadlines: [{ id: 'd1', text: 'Response due: March 15, 2026', sourcePage: 1 }],
      approvals: { r1: 'approved' },
    });

    expect(md).toContain('# RFP Response — Demo RFP');
    expect(md).toContain('Source page: 1');
    expect(md).toContain('Limited Lifetime Warranty');
    expect(md).toContain('Needs info: Which cert applies?');
    expect(md).toContain('**BCH-1** — qty 10');
    expect(md).toContain('Approved');
  });
});
