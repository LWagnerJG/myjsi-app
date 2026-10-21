/**
 * Client-side honesty helpers for RFP AI readiness and session provenance.
 * Auth configured ≠ inference operational.
 */

export function describeAiStatus(status) {
  if (!status) {
    return {
      tone: 'caution',
      headline: 'AI status unknown',
      detail: 'Could not load /api/rfp/status.',
    };
  }

  if (status.authConfigured === false || (status.authConfigured == null && !status.aiConfigured)) {
    return {
      tone: 'caution',
      headline: 'AI auth not configured',
      detail: status.aiMessage || 'Heuristic extract only until OIDC or AI_GATEWAY_API_KEY is available.',
    };
  }

  // Status endpoint never claims operational without a successful inference.
  if (status.aiOperational === true) {
    return {
      tone: 'positive',
      headline: 'AI inference verified',
      detail: `${status.authMethod || 'gateway'} · ${status.model || 'model'}`,
    };
  }

  if (status.aiOperational === false) {
    return {
      tone: 'caution',
      headline: 'AI auth present — inference not operational',
      detail: status.aiMessage || status.operationalHint || 'Last analysis reported a gateway failure.',
    };
  }

  return {
    tone: 'caution',
    headline: 'AI auth present — inference unverified',
    detail:
      status.operationalHint
      || status.aiMessage
      || `${status.authMethod || 'gateway'} · ${status.model || 'model'} · auth ≠ ready to draft`,
  };
}

export function buildHonestyNotes(session) {
  const notes = [];
  const mode = session?.extractionMode;
  const answers = session?.answers || [];
  const emptyPages = session?.emptyPages || [];
  const drafted = answers.filter((a) => a.draftText && String(a.draftText).trim()).length;
  const undrafted = answers.length - drafted;
  const needsInfo = answers.filter((a) => a.status === 'needs_info' || a.needsInfoQuestion).length;

  if (mode === 'heuristic_fallback') {
    notes.push({
      id: 'heuristic_fallback',
      tone: 'caution',
      text: 'Heuristic fallback — LLM extract failed; requirements came from text rules + quote checks, not model drafting.',
    });
  } else if (mode === 'heuristic') {
    notes.push({
      id: 'heuristic',
      tone: 'caution',
      text: 'Heuristic extract only — AI was not configured for this run.',
    });
  } else if (mode === 'llm_chunked') {
    notes.push({
      id: 'llm',
      tone: 'positive',
      text: 'LLM chunked extract used for this run (still review every citation before external use).',
    });
  } else if (mode === 'empty') {
    notes.push({
      id: 'empty',
      tone: 'negative',
      text: 'No extractable text — PDF may be scanned/image-only. OCR is not enabled.',
    });
  }

  if (session?.aiFailureKind === 'billing_verification' || session?.aiFailureKind === 'billing_funds') {
    notes.push({
      id: 'billing',
      tone: 'caution',
      text: session.aiMessage || 'AI Gateway billing/verification blocked inference for this run.',
    });
  } else if (session?.aiOperational === false && session?.aiMessage) {
    notes.push({
      id: 'ai_failed',
      tone: 'caution',
      text: session.aiMessage,
    });
  }

  if (emptyPages.length) {
    notes.push({
      id: 'empty_pages',
      tone: 'caution',
      text: `${emptyPages.length} page(s) had no extractable text (likely scanned). OCR is not enabled — those pages were not read.`,
    });
  }

  if (answers.length && undrafted > 0) {
    notes.push({
      id: 'undrafted',
      tone: 'caution',
      text: `${undrafted} of ${answers.length} answer(s) are undrafted / need Spec (no grounded library draft yet).`,
    });
  } else if (needsInfo > 0) {
    notes.push({
      id: 'needs_info',
      tone: 'caution',
      text: `${needsInfo} answer(s) flagged needs Spec / insufficient evidence.`,
    });
  }

  if (session?.productMatch || session?.pricing) {
    notes.push({
      id: 'demo_pricing',
      tone: 'caution',
      text: 'SKU matches and pricing are DEMO-ONLY rules (catalog heuristics). Not a formal quote or verified SKU claim.',
    });
  }

  return notes;
}
