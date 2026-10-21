import { describe, it, expect } from 'vitest';
import { classifyGatewayError, summarizeLlmFailures } from './gatewayErrors.js';

describe('classifyGatewayError', () => {
  it('detects credit-card / verification blockers', () => {
    const c = classifyGatewayError(
      'AI Gateway requires a valid credit card on file to service requests. Please visit https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card',
    );
    expect(c.kind).toBe('billing_verification');
    expect(c.operational).toBe(false);
    expect(c.userMessage).toMatch(/payment method|billing verification/i);
  });

  it('detects insufficient funds', () => {
    const c = classifyGatewayError('402 insufficient_funds');
    expect(c.kind).toBe('billing_funds');
  });

  it('detects auth failures', () => {
    const c = classifyGatewayError('Unauthorized: invalid OIDC token');
    expect(c.kind).toBe('auth');
  });
});

describe('summarizeLlmFailures', () => {
  it('uses the last error detail', () => {
    const s = summarizeLlmFailures([
      { detail: 'timeout' },
      { detail: 'AI Gateway requires a valid credit card on file' },
    ]);
    expect(s.kind).toBe('billing_verification');
  });
});
