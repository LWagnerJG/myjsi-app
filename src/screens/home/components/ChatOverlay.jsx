import React, { useState, useCallback } from 'react';
import { X, Paperclip, Sparkles, ArrowUp, Clock, Package, BarChart3, FileText, ChevronRight, Copy, Share2, Check } from 'lucide-react';

/* ── Elliott's avatar ────────────────────────────────────────────── */
const ELLIOTT_AVATAR_URL = '/elliott-avatar.png';

const ElliottAvatar = ({ size = 36 }) => (
    <div
        className="rounded-full flex-shrink-0 overflow-hidden"
        style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #E8D1C2 0%, #D3A891 100%)',
            boxShadow: '0 2px 8px rgba(211,168,145,0.35)',
        }}
    >
        <img
            src={ELLIOTT_AVATAR_URL}
            alt="Elliott"
            width={size}
            height={size}
            className="w-full h-full object-cover"
            loading="eager"
        />
    </div>
);

/* ── Timestamp formatting ──────────────────────────────────────────── */
function formatTimestamp(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const time = `${h}:${mins} ${ampm}`;
    // If same day, show only time; otherwise show date + time
    if (d.toDateString() === now.toDateString()) return time;
    return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
}

/* ── Suggested quick prompts ───────────────────────────────────────── */
const SUGGESTIONS = [
    { icon: Clock, label: 'Lead times', query: 'What are the quickship series?' },
    { icon: Package, label: 'My orders', query: 'Show me my orders overview' },
    { icon: BarChart3, label: 'Commissions', query: 'What are the commission rates?' },
    { icon: FileText, label: 'Contracts', query: 'Tell me about JSI contracts' },
];

/* ── CSS keyframes injected once ───────────────────────────────────── */
const styleId = 'elliott-chat-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes elliott-dot-bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-4px); }
        }
        @keyframes elliott-fade-up {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

export const ChatOverlay = ({
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    chatInput,
    setChatInput,
    chatAttachments,
    isBotThinking,
    chatFileInputRef,
    handleChatSubmit,
    handleChatFilePick,
    handleChatFilesSelected,
    handleRemoveAttachment,
    appendChatTurn,
    onNavigate,
    colors,
    isDark
}) => {
    const [copiedId, setCopiedId] = useState(null);

    const handleCopyMessage = useCallback((msg) => {
        // Strip markdown bold markers for plain text copy
        const plain = msg.text.replace(/\*\*(.*?)\*\*/g, '$1');
        navigator.clipboard?.writeText(plain).then(() => {
            setCopiedId(msg.id);
            setTimeout(() => setCopiedId(null), 1800);
        });
    }, []);

    const handleShareMessage = useCallback((msg) => {
        const plain = msg.text.replace(/\*\*(.*?)\*\*/g, '$1');
        if (navigator.share) {
            navigator.share({ title: 'Elliott — JSI Assistant', text: plain }).catch(() => {});
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard?.writeText(plain).then(() => {
                setCopiedId(msg.id);
                setTimeout(() => setCopiedId(null), 1800);
            });
        }
    }, []);

    if (!isChatOpen) return null;

    const accentBg = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)';

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 60 }}
            role="dialog"
            aria-modal="true"
            aria-label="Elliott Bot"
        >
            <div
                className="w-full h-full flex flex-col"
                style={{ backgroundColor: colors.background }}
            >
                {/* ── Header ────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-5 py-3.5"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ElliottAvatar size={40} />
                            <span
                                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                                style={{ backgroundColor: '#34D399', borderColor: colors.background }}
                            />
                        </div>
                        <div className="leading-tight">
                            <div className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                                Elliott
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" style={{ color: '#D3A891' }} />
                                <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                                    JSI Sales Assistant
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsChatOpen(false)}
                        className="p-2 rounded-full transition-colors"
                        style={{ backgroundColor: accentBg }}
                        aria-label="Close chat"
                    >
                        <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                    </button>
                </div>

                {/* ── Messages area ─────────────────────────────────── */}
                <div
                    className="flex-1 overflow-y-auto px-4 py-5"
                    ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
                >
                    {chatMessages.length === 0 ? (
                        /* ── Welcome state ──────────────────────────── */
                        <div className="flex flex-col items-center justify-center h-full px-6">
                            <div className="mb-5" style={{ animation: 'elliott-fade-up 0.4s ease-out' }}>
                                <ElliottAvatar size={72} />
                            </div>
                            <p
                                className="text-lg font-semibold mb-1"
                                style={{ color: colors.textPrimary, animation: 'elliott-fade-up 0.4s ease-out 0.05s both' }}
                            >
                                Hey, I&apos;m Elliott!
                            </p>
                            <p
                                className="text-[13px] text-center mb-6 max-w-[280px]"
                                style={{ color: colors.textSecondary, animation: 'elliott-fade-up 0.4s ease-out 0.1s both' }}
                            >
                                Your JSI sales assistant. I know lead times, orders, commissions, contracts&nbsp;&mdash; ask me anything.
                            </p>

                            <div
                                className="grid grid-cols-2 gap-2 w-full max-w-[320px]"
                                style={{ animation: 'elliott-fade-up 0.4s ease-out 0.18s both' }}
                            >
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s.label}
                                        onClick={() => appendChatTurn(s.query)}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                                        style={{
                                            backgroundColor: accentBg,
                                            border: `1px solid ${colors.border}`,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        <s.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D3A891' }} />
                                        <span className="text-xs font-medium">{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {chatMessages.map((msg, idx) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    style={{ animation: idx === chatMessages.length - 1 ? 'elliott-fade-up 0.25s ease-out' : undefined }}
                                >
                                    {/* Bot avatar */}
                                    {msg.role === 'assistant' && <ElliottAvatar size={30} />}

                                    <div className="flex flex-col max-w-[75%]">
                                    <div
                                        className={`px-4 py-3 text-sm space-y-2 ${
                                            msg.role === 'user' ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'
                                        }`}
                                        style={{
                                            backgroundColor: msg.role === 'user' ? colors.textPrimary : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)'),
                                            color: msg.role === 'user' ? '#FFFFFF' : colors.textPrimary,
                                            border: msg.role === 'user' ? 'none' : `1px solid ${colors.border}`,
                                        }}
                                    >
                                        <div
                                            className="whitespace-pre-wrap leading-relaxed [&_strong]:font-semibold"
                                            dangerouslySetInnerHTML={{
                                                __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            }}
                                        />
                                        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {msg.attachments.map((file) => (
                                                    <span
                                                        key={file.id}
                                                        className="text-[11px] px-2 py-1 rounded-full"
                                                        style={{
                                                            backgroundColor: msg.role === 'user' ? 'rgba(255,255,255,0.2)' : `${colors.border}66`,
                                                            color: msg.role === 'user' ? '#FFFFFF' : colors.textSecondary
                                                        }}
                                                    >
                                                        {file.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {/* ── Smart navigation buttons ──── */}
                                        {msg.role === 'assistant' && Array.isArray(msg.actions) && msg.actions.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2.5">
                                                {msg.actions.map((action) => (
                                                    <button
                                                        key={action.route}
                                                        onClick={() => {
                                                            setIsChatOpen(false);
                                                            onNavigate?.(action.route);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 rounded-full text-[12px] font-semibold tracking-tight transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                                                        style={{
                                                            background: isDark
                                                                ? 'linear-gradient(135deg, rgba(211,168,145,0.18) 0%, rgba(211,168,145,0.08) 100%)'
                                                                : 'linear-gradient(135deg, rgba(53,53,53,0.07) 0%, rgba(91,123,140,0.06) 100%)',
                                                            color: isDark ? '#D3A891' : colors.textPrimary,
                                                            border: `1px solid ${isDark ? 'rgba(211,168,145,0.25)' : 'rgba(53,53,53,0.12)'}`,
                                                            boxShadow: isDark
                                                                ? '0 1px 4px rgba(0,0,0,0.2)'
                                                                : '0 1px 4px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(53,53,53,0.06)',
                                                        }}
                                                    >
                                                        {action.label}
                                                        <span
                                                            className="w-5 h-5 rounded-full flex items-center justify-center ml-0.5 flex-shrink-0"
                                                            style={{
                                                                backgroundColor: isDark ? 'rgba(211,168,145,0.2)' : 'rgba(53,53,53,0.08)',
                                                            }}
                                                        >
                                                            <ChevronRight className="w-3 h-3" />
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Timestamp + Copy/Share row ──── */}
                                    <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[10px]" style={{ color: colors.textSecondary, opacity: 0.6 }}>
                                            {formatTimestamp(msg.timestamp)}
                                        </span>
                                        {msg.role === 'assistant' && (
                                            <span className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopyMessage(msg)}
                                                    className="p-0.5 rounded transition-colors hover:opacity-80"
                                                    aria-label="Copy message"
                                                    title="Copy"
                                                >
                                                    {copiedId === msg.id
                                                        ? <Check className="w-3 h-3" style={{ color: '#34D399' }} />
                                                        : <Copy className="w-3 h-3" style={{ color: colors.textSecondary, opacity: 0.5 }} />
                                                    }
                                                </button>
                                                <button
                                                    onClick={() => handleShareMessage(msg)}
                                                    className="p-0.5 rounded transition-colors hover:opacity-80"
                                                    aria-label="Share message"
                                                    title="Share"
                                                >
                                                    <Share2 className="w-3 h-3" style={{ color: colors.textSecondary, opacity: 0.5 }} />
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                    </div>
                                </div>
                            ))}

                            {/* ── Typing indicator ──────────────────── */}
                            {isBotThinking && (
                                <div className="flex gap-2.5 justify-start" style={{ animation: 'elliott-fade-up 0.2s ease-out' }}>
                                    <ElliottAvatar size={30} />
                                    <div
                                        className="px-4 py-3 rounded-2xl rounded-bl-md"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)',
                                            border: `1px solid ${colors.border}`,
                                        }}
                                    >
                                        <span className="inline-flex items-center gap-1.5 h-4">
                                            {[0, 1, 2].map(i => (
                                                <span
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{
                                                        backgroundColor: '#D3A891',
                                                        animation: `elliott-dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                                                    }}
                                                />
                                            ))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Input area ─────────────────────────────────────── */}
                <div className="px-4 pb-4 pt-2" style={{ borderTop: `1px solid ${colors.border}` }}>
                    {chatAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {chatAttachments.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)',
                                        border: `1px solid ${colors.border}`,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(file.id)}
                                        className="hover:opacity-80"
                                        aria-label="Remove attachment"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleChatFilePick}
                            className="p-2.5 rounded-full transition-colors flex-shrink-0"
                            style={{ color: colors.textSecondary }}
                            aria-label="Attach file"
                        >
                            <Paperclip className="w-[18px] h-[18px]" />
                        </button>
                        <input
                            ref={chatFileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleChatFilesSelected}
                        />
                        <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask Elliott anything..."
                            className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
                            style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)',
                                color: colors.textPrimary,
                                border: `1px solid ${colors.border}`,
                            }}
                            aria-label="Chat message"
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim() && chatAttachments.length === 0}
                            className="p-2.5 rounded-full transition-all disabled:opacity-30 flex-shrink-0"
                            style={{ backgroundColor: colors.textPrimary }}
                            aria-label="Send message"
                        >
                            <ArrowUp className="w-4 h-4" style={{ color: colors.background }} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
