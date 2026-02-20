import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHomeChat } from './useHomeChat.js';

describe('useHomeChat', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useHomeChat());

        expect(result.current.isChatOpen).toBe(false);
        expect(result.current.chatMessages).toEqual([]);
        expect(result.current.chatInput).toBe('');
        expect(result.current.chatAttachments).toEqual([]);
        expect(result.current.isBotThinking).toBe(false);
    });

    it('opens chat and sends a message via openChatFromQuery', () => {
        const { result } = renderHook(() => useHomeChat());

        act(() => {
            result.current.openChatFromQuery('Hello there');
        });

        expect(result.current.isChatOpen).toBe(true);
        expect(result.current.chatMessages).toHaveLength(1);
        expect(result.current.chatMessages[0].role).toBe('user');
        expect(result.current.chatMessages[0].text).toBe('Hello there');
    });

    it('generates bot reply after delay', () => {
        const { result } = renderHook(() => useHomeChat());

        act(() => {
            result.current.openChatFromQuery('lead time');
        });

        expect(result.current.isBotThinking).toBe(true);

        act(() => {
            vi.advanceTimersByTime(800);
        });

        expect(result.current.isBotThinking).toBe(false);
        expect(result.current.chatMessages).toHaveLength(2);
        expect(result.current.chatMessages[1].role).toBe('assistant');
        expect(result.current.chatMessages[1].text).toContain('Lead Times');
    });

    it('strips the ? prefix from queries', () => {
        const { result } = renderHook(() => useHomeChat());

        act(() => {
            result.current.openChatFromQuery('? orders');
        });

        expect(result.current.chatMessages[0].text).toBe('orders');
    });

    it('handles chat form submit via handleChatSubmit', () => {
        const { result } = renderHook(() => useHomeChat());

        act(() => {
            result.current.setChatInput('What about samples?');
        });

        act(() => {
            result.current.handleChatSubmit({ preventDefault: () => {} });
        });

        expect(result.current.chatMessages).toHaveLength(1);
        expect(result.current.chatMessages[0].text).toBe('What about samples?');
        expect(result.current.chatInput).toBe('');
    });

    it('does not submit empty messages', () => {
        const { result } = renderHook(() => useHomeChat());

        act(() => {
            result.current.handleChatSubmit({ preventDefault: () => {} });
        });

        expect(result.current.chatMessages).toHaveLength(0);
    });

    it('resets chat state via resetChat', () => {
        const { result } = renderHook(() => useHomeChat());

        act(() => {
            result.current.openChatFromQuery('hello');
        });

        act(() => {
            vi.advanceTimersByTime(800);
        });

        expect(result.current.chatMessages.length).toBeGreaterThan(0);

        act(() => {
            result.current.resetChat();
        });

        expect(result.current.isChatOpen).toBe(false);
        expect(result.current.chatMessages).toEqual([]);
        expect(result.current.chatInput).toBe('');
        expect(result.current.chatAttachments).toEqual([]);
    });

    it('handles file attachment removal', () => {
        const { result } = renderHook(() => useHomeChat());

        // Simulate adding attachments by directly calling the internal state
        act(() => {
            // We need to trigger the file selected handler with a mock event
            result.current.handleChatFilesSelected({
                target: {
                    files: [
                        { name: 'test.pdf', size: 1024, lastModified: 1000 },
                        { name: 'doc.pdf', size: 2048, lastModified: 2000 },
                    ]
                }
            });
        });

        expect(result.current.chatAttachments).toHaveLength(2);

        act(() => {
            result.current.handleRemoveAttachment(result.current.chatAttachments[0].id);
        });

        expect(result.current.chatAttachments).toHaveLength(1);
        expect(result.current.chatAttachments[0].name).toBe('doc.pdf');
    });
});
