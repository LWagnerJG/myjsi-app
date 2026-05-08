import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { postJsonToWebhook, validateWebhookUrl } from './secureWebhook.js';

const VALID_WEBHOOK_URL = 'https://prod-01.eastus.logic.azure.com/workflows/example/triggers/manual/paths/invoke';

describe('secureWebhook', () => {
    let consoleWarnSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('accepts trimmed HTTPS Logic Apps webhook URLs', () => {
        expect(validateWebhookUrl(` ${VALID_WEBHOOK_URL} `, 'TEST_WEBHOOK_URL')).toBe(VALID_WEBHOOK_URL);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('rejects missing, non-HTTPS, and untrusted webhook URLs', () => {
        expect(validateWebhookUrl('', 'TEST_WEBHOOK_URL')).toBeNull();
        expect(validateWebhookUrl('http://prod-01.eastus.logic.azure.com/path', 'TEST_WEBHOOK_URL')).toBeNull();
        expect(validateWebhookUrl('https://example.com/path', 'TEST_WEBHOOK_URL')).toBeNull();

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('posts JSON and treats any 2xx response as success', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
        vi.stubGlobal('fetch', fetchMock);

        const result = await postJsonToWebhook(
            VALID_WEBHOOK_URL,
            { projectName: 'Atrium' },
            { envKey: 'TEST_WEBHOOK_URL', context: 'testWebhook', timeoutMs: 0 }
        );

        expect(result).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
            VALID_WEBHOOK_URL,
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName: 'Atrium' }),
            })
        );
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('does not fetch when validation fails', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        const result = await postJsonToWebhook(
            'https://example.com/path',
            { projectName: 'Atrium' },
            { envKey: 'TEST_WEBHOOK_URL', context: 'testWebhook', timeoutMs: 0 }
        );

        expect(result).toBe(false);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns false for non-successful webhook responses', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
        vi.stubGlobal('fetch', fetchMock);

        const result = await postJsonToWebhook(
            VALID_WEBHOOK_URL,
            { projectName: 'Atrium' },
            { envKey: 'TEST_WEBHOOK_URL', context: 'testWebhook', timeoutMs: 0 }
        );

        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith('[testWebhook] Unexpected status:', 500);
    });
});
