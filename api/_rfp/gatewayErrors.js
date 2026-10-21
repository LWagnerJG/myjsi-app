/**
 * Classify AI Gateway / provider failures without logging secrets or document text.
 * Used so the UI can say "auth configured but inference blocked" instead of "AI ready".
 */

export function classifyGatewayError(detail = '') {
  const text = String(detail || '');
  const lower = text.toLowerCase();

  if (
    /credit card|customer_verification|add a card|payment method|verification_required/i.test(text)
    || lower.includes('customer_verification_required')
  ) {
    return {
      kind: 'billing_verification',
      operational: false,
      userMessage:
        'AI auth is present, but AI Gateway inference is blocked until the team adds a payment method / completes billing verification (free credits unlock after verification). Heuristic extract + library matcher are used instead.',
    };
  }

  if (
    /insufficient_funds|insufficient credits|402\b|quota_for_entity_exceeded|budget/i.test(text)
    || lower.includes('insufficient_funds')
  ) {
    return {
      kind: 'billing_funds',
      operational: false,
      userMessage:
        'AI auth is present, but AI Gateway rejected the request for funds/budget reasons. Heuristic extract + library matcher are used instead.',
    };
  }

  if (/unauthorized|401\b|forbidden|403\b|invalid.*(token|key)|oidc/i.test(text)) {
    return {
      kind: 'auth',
      operational: false,
      userMessage:
        'AI Gateway rejected authentication for this request. Check OIDC Federation or AI_GATEWAY_API_KEY. Heuristic path is used instead.',
    };
  }

  if (/429\b|rate.?limit/i.test(text)) {
    return {
      kind: 'rate_limit',
      operational: false,
      userMessage: 'AI Gateway rate-limited this request. Heuristic path is used instead.',
    };
  }

  if (/timed? ?out|TIMEOUT/i.test(text)) {
    return {
      kind: 'timeout',
      operational: false,
      userMessage: 'AI request timed out. Heuristic path is used instead.',
    };
  }

  if (!text.trim()) {
    return {
      kind: 'unknown',
      operational: false,
      userMessage: 'AI inference failed for an unknown reason. Heuristic path is used instead.',
    };
  }

  return {
    kind: 'provider',
    operational: false,
    userMessage: `AI inference failed (${text.slice(0, 160)}). Heuristic path is used instead.`,
  };
}

/** Summarize failed generateValidatedObject errors into one classified failure. */
export function summarizeLlmFailures(errors = []) {
  const last = [...errors].reverse().find((e) => e?.detail || e?.error) || {};
  const detail = last.detail || last.error || '';
  return classifyGatewayError(detail);
}
