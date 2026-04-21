/**
 * Validates that a Power Automate webhook URL originates from an allowed
 * Microsoft Azure / Logic Apps hostname before any fetch is attempted.
 *
 * Allowed pattern: *.logic.azure.com  (Power Automate HTTP trigger URLs)
 *
 * This prevents environment-variable substitution attacks where a compromised
 * deployment secret redirects POST requests to an attacker-controlled server.
 */
const ALLOWED_HOSTNAME_RE = /^[a-z0-9-]+\.logic\.azure\.com$/i;

/**
 * Returns the URL string if it is a valid, allowed Power Automate endpoint.
 * Returns null and logs a security warning otherwise.
 *
 * @param {string | undefined} url - Raw URL from import.meta.env
 * @param {string} envKey - Env variable name (used in warning messages only)
 * @returns {string | null}
 */
export function validateWebhookUrl(url, envKey = 'VITE_POWER_AUTOMATE_URL') {
    if (!url) {
        console.warn(`[Security] ${envKey} is not configured — webhook disabled.`);
        return null;
    }

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        console.error(`[Security] ${envKey} is not a valid URL — webhook disabled.`);
        return null;
    }

    if (parsed.protocol !== 'https:') {
        console.error(`[Security] ${envKey} must use HTTPS — webhook disabled.`);
        return null;
    }

    if (!ALLOWED_HOSTNAME_RE.test(parsed.hostname)) {
        console.error(
            `[Security] ${envKey} hostname "${parsed.hostname}" is not an allowed ` +
            'Power Automate domain (*.logic.azure.com) — webhook disabled.'
        );
        return null;
    }

    return url;
}
