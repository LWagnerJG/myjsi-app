/** Frontier defaults for RFP analysis. AI_GATEWAY_MODEL overrides the primary. */

export const DEFAULT_RFP_MODEL = 'anthropic/claude-opus-5.5';
export const FALLBACK_RFP_MODEL = 'anthropic/claude-sonnet-5.5';

export const LLM_TIMEOUT_MS = 90_000;
export const LLM_MAX_RETRIES = 1; // retry once on invalid schema, then try fallback model

export function resolveModels() {
  const primary = process.env.AI_GATEWAY_MODEL || DEFAULT_RFP_MODEL;
  const fallback = process.env.AI_GATEWAY_FALLBACK_MODEL || FALLBACK_RFP_MODEL;
  return {
    primary,
    fallback: fallback === primary ? FALLBACK_RFP_MODEL : fallback,
  };
}
