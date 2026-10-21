import { describe, it, expect } from 'vitest';
import { describeAiStatus, buildHonestyNotes } from './rfpReadiness.js';

describe('describeAiStatus', () => {
  it('does not say AI ready when only auth is configured', () => {
    const d = describeAiStatus({
      authConfigured: true,
      aiConfigured: true,
      aiOperational: null,
      authMethod: 'oidc',
      model: 'anthropic/claude-opus-5.5',
      operationalHint: 'Auth is present. Inference unverified.',
    });
    expect(d.headline).toMatch(/unverified/i);
    expect(d.headline).not.toMatch(/^AI ready/i);
    expect(d.tone).toBe('caution');
  });

  it('labels missing auth clearly', () => {
    const d = describeAiStatus({ authConfigured: false, aiConfigured: false, aiMessage: 'set key' });
    expect(d.headline).toMatch(/not configured/i);
  });

  it('labels failed inference when operational is false', () => {
    const d = describeAiStatus({
      authConfigured: true,
      aiConfigured: true,
      aiOperational: false,
      aiMessage: 'billing blocked',
    });
    expect(d.headline).toMatch(/not operational/i);
  });
});

describe('buildHonestyNotes', () => {
  it('flags heuristic fallback, undrafted answers, empty pages, demo pricing', () => {
    const notes = buildHonestyNotes({
      extractionMode: 'heuristic_fallback',
      aiFailureKind: 'billing_verification',
      aiMessage: 'payment method required',
      emptyPages: [{ page: 1 }, { page: 2 }],
      answers: [
        { requirementId: 'r1', draftText: '', status: 'needs_info', needsInfoQuestion: 'x' },
        { requirementId: 'r2', draftText: 'Lifetime Lifetime', status: 'library_match' },
      ],
      productMatch: { matches: [], exceptions: [] },
      pricing: { demo: true },
    });
    const ids = notes.map((n) => n.id);
    expect(ids).toContain('heuristic_fallback');
    expect(ids).toContain('billing');
    expect(ids).toContain('empty_pages');
    expect(ids).toContain('undrafted');
    expect(ids).toContain('demo_pricing');
    expect(notes.find((n) => n.id === 'undrafted').text).toMatch(/1 of 2/);
  });
});
