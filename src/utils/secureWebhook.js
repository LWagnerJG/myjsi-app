const ALLOWED_HOSTNAME_RE = /^([a-z0-9-]+\.)+logic\.azure\.com$/i;
const DEFAULT_WEBHOOK_TIMEOUT_MS = 10000;

export function validateWebhookUrl(url, envKey = 'VITE_POWER_AUTOMATE_URL') {
    const candidate = typeof url === 'string' ? url.trim() : '';

    if (!candidate) {
        console.warn(`[Security] ${envKey} is not configured - webhook disabled.`);
        return null;
    }

    let parsed;
    try {
        parsed = new URL(candidate);
    } catch {
        console.error(`[Security] ${envKey} is not a valid URL - webhook disabled.`);
        return null;
    }

    if (parsed.protocol !== 'https:') {
        console.error(`[Security] ${envKey} must use HTTPS - webhook disabled.`);
        return null;
    }

    if (!ALLOWED_HOSTNAME_RE.test(parsed.hostname)) {
        console.error(
            `[Security] ${envKey} hostname "${parsed.hostname}" is not an allowed ` +
            'Power Automate domain (*.logic.azure.com) - webhook disabled.'
        );
        return null;
    }

    return candidate;
}

export async function postJsonToWebhook(url, payload, {
    envKey = 'VITE_POWER_AUTOMATE_URL',
    context = 'webhook',
    timeoutMs = DEFAULT_WEBHOOK_TIMEOUT_MS,
} = {}) {
    const safeUrl = validateWebhookUrl(url, envKey);
    if (!safeUrl) return false;

    const controller = typeof AbortController !== 'undefined' && timeoutMs > 0
        ? new AbortController()
        : null;
    const timeoutId = controller
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

    try {
        const response = await fetch(safeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller?.signal,
        });

        if (response.ok) return true;

        console.error(`[${context}] Unexpected status:`, response.status);
        return false;
    } catch (error) {
        const label = error?.name === 'AbortError' ? 'Request timed out' : 'Network error';
        console.error(`[${context}] ${label}:`, error);
        return false;
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}
