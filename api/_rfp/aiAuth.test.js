import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vercel/oidc', () => ({
  getVercelOidcToken: vi.fn(),
}));

import { getVercelOidcToken } from '@vercel/oidc';
import { getAiConfigStatus } from './aiAuth.js';

describe('getAiConfigStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.VERCEL_OIDC_TOKEN;
    delete process.env.AI_GATEWAY_MODEL;
  });

  it('is configured when API key is present but does not claim operational inference', async () => {
    process.env.AI_GATEWAY_API_KEY = 'test-key';
    const status = await getAiConfigStatus({});
    expect(status.configured).toBe(true);
    expect(status.authConfigured).toBe(true);
    expect(status.aiOperational).toBeNull();
    expect(status.operationalState).toBe('auth_ready_inference_unverified');
    expect(status.authMethod).toBe('api-key');
    expect(status.model).toContain('claude-opus');
    expect(status.operationalHint).toMatch(/unverified|auth/i);
  });

  it('resolves OIDC via getVercelOidcToken at request time', async () => {
    getVercelOidcToken.mockResolvedValue('oidc-token-value');
    const status = await getAiConfigStatus({ headers: {} });
    expect(getVercelOidcToken).toHaveBeenCalled();
    expect(status.configured).toBe(true);
    expect(status.authMethod).toBe('oidc');
    expect(status.oidcResolved).toBe(true);
  });

  it('treats x-vercel-oidc-token header as configured when getVercelOidcToken throws', async () => {
    getVercelOidcToken.mockRejectedValue(new Error('missing'));
    const status = await getAiConfigStatus({
      headers: { 'x-vercel-oidc-token': 'header-token' },
    });
    expect(status.configured).toBe(true);
    expect(status.oidcFromHeader).toBe(true);
  });

  it('returns missing hint when neither key nor OIDC is available', async () => {
    getVercelOidcToken.mockRejectedValue(new Error('missing'));
    const status = await getAiConfigStatus({ headers: {} });
    expect(status.configured).toBe(false);
    expect(status.missingHint).toMatch(/AI_GATEWAY_API_KEY|OIDC/i);
  });
});
