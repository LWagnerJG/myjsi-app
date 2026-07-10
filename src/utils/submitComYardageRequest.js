import { postJsonToWebhook } from './secureWebhook.js';

/**
 * Flatten COM yardage form data for the Power Automate Excel flow.
 * @param {{ requester?: string, models?: Array<{ name?: string, modelId?: string, quantity?: number, fabric?: string }> }} payload
 */
const flattenComYardagePayload = (payload = {}) => ({
  requester: payload.requester || 'unknown@example.com',
  models: Array.isArray(payload.models)
    ? payload.models.map((item) => ({
        name: item.name || item.modelName || '',
        modelId: item.modelId || '',
        quantity: item.quantity ?? 0,
        fabric: item.fabric || '',
      }))
    : [],
  submittedAt: new Date().toISOString(),
});

/**
 * Submit a COM yardage request via the shared Power Automate webhook.
 * @returns {Promise<boolean>}
 */
export async function submitComYardageRequest(payload) {
  return postJsonToWebhook(
    import.meta.env.VITE_POWER_AUTOMATE_URL,
    flattenComYardagePayload(payload),
    {
      envKey: 'VITE_POWER_AUTOMATE_URL',
      context: 'submitComYardageRequest',
    }
  );
}
