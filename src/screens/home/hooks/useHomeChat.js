// Custom hook for the Elliott AI chat assistant on the home screen
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Generates a contextual reply based on the user's query.
 * In the future, this could be replaced with an actual API call.
 */
function generateReply(text) {
    const lower = text.toLowerCase();
    if (lower.includes('lead time') || lower.includes('leadtime')) {
        return 'You can check current lead times under Resources → Lead Times. Most standard series ship in 4-6 weeks, and Quick Ship items are available in 10 business days.';
    }
    if (lower.includes('order') || lower.includes('po ')) {
        return 'You can track all your orders from the Orders screen. Use the search bar to find a specific PO number, or filter by status.';
    }
    if (lower.includes('sample')) {
        return 'Head to the Samples screen to browse and request product samples. You can add items to your cart and submit a request.';
    }
    if (lower.includes('commission') || lower.includes('rate')) {
        return 'Commission rate information is available under Resources → Commission Rates. Rates vary by product category and dealer tier.';
    }
    if (lower.includes('product') || lower.includes('finish') || lower.includes('fabric')) {
        return 'Check out the Products screen to browse all JSI product lines, finishes, and fabrics. You can compare products side-by-side too.';
    }
    if (lower.includes('project') || lower.includes('lead') || lower.includes('pipeline')) {
        return 'Your project pipeline is in the Projects screen. You can add new leads, track existing projects, and manage installs there.';
    }
    if (lower.includes('help') || lower.includes('support')) {
        return 'For support, visit the Help screen or submit feedback through the Feedback form. You can also contact your JSI rep directly.';
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return "Hello! I'm Elliott, your JSI assistant. How can I help you today? I can help with orders, lead times, products, samples, and more.";
    }
    return `I can help with that! Here are some things I can assist with:\n\n• **Orders** — Track POs and shipments\n• **Lead Times** — Check current production schedules\n• **Products** — Browse finishes, fabrics, and specs\n• **Samples** — Request product samples\n• **Projects** — Manage your pipeline\n\nTry asking me about any of these topics!`;
}

export function useHomeChat() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatAttachments, setChatAttachments] = useState([]);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const chatFileInputRef = useRef(null);
    const botReplyTimeoutRef = useRef(null);

    const appendChatTurn = useCallback((text, attachments = []) => {
        const trimmed = text?.trim();
        if (!trimmed) return;
        const now = Date.now();
        setChatMessages((prev) => ([
            ...prev,
            { id: `u-${now}`, role: 'user', text: trimmed, attachments }
        ]));
        if (botReplyTimeoutRef.current) {
            clearTimeout(botReplyTimeoutRef.current);
        }
        setIsBotThinking(true);

        const reply = generateReply(trimmed);

        botReplyTimeoutRef.current = setTimeout(() => {
            setChatMessages((prev) => ([
                ...prev,
                { id: `a-${now}`, role: 'assistant', text: reply }
            ]));
            setIsBotThinking(false);
        }, 700);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (botReplyTimeoutRef.current) {
                clearTimeout(botReplyTimeoutRef.current);
            }
        };
    }, []);

    // Escape key to close chat
    useEffect(() => {
        if (!isChatOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsChatOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isChatOpen]);

    const openChatFromQuery = useCallback((query) => {
        const trimmed = query?.trim();
        if (!trimmed) return;
        setIsChatOpen(true);
        appendChatTurn(trimmed.replace(/^\?\s*/, ''), []);
    }, [appendChatTurn]);

    const handleChatSubmit = useCallback((e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        appendChatTurn(chatInput, chatAttachments);
        setChatInput('');
        setChatAttachments([]);
        if (chatFileInputRef.current) {
            chatFileInputRef.current.value = '';
        }
    }, [appendChatTurn, chatAttachments, chatInput]);

    const handleChatFilePick = useCallback(() => {
        chatFileInputRef.current?.click();
    }, []);

    const handleChatFilesSelected = useCallback((event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const mapped = files.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            size: file.size
        }));
        setChatAttachments((prev) => ([...prev, ...mapped]));
    }, []);

    const handleRemoveAttachment = useCallback((id) => {
        setChatAttachments((prev) => prev.filter((file) => file.id !== id));
    }, []);

    const resetChat = useCallback(() => {
        setIsChatOpen(false);
        setChatMessages([]);
        setChatInput('');
        setChatAttachments([]);
    }, []);

    return {
        isChatOpen,
        setIsChatOpen,
        chatMessages,
        chatInput,
        setChatInput,
        chatAttachments,
        isBotThinking,
        chatFileInputRef,
        appendChatTurn,
        openChatFromQuery,
        handleChatSubmit,
        handleChatFilePick,
        handleChatFilesSelected,
        handleRemoveAttachment,
        resetChat,
    };
}
