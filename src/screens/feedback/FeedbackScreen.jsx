import React, { useState } from 'react';
import { Send, Paperclip, X, MessageSquare, Bug, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const FeedbackScreen = ({ theme }) => {
    const [feedbackType, setFeedbackType] = useState('general');
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

    const feedbackTypes = [
        { value: 'general', label: 'General', icon: MessageSquare },
        { value: 'bug', label: 'Bug Report', icon: Bug },
        { value: 'feature', label: 'Feature', icon: Lightbulb },
        { value: 'improvement', label: 'Improvement', icon: Sparkles },
    ];

    const formatFileSize = (bytes = 0) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    function onAttach(e) {
        const list = Array.from(e.target.files || []);
        if (!list.length) return;
        setFiles(prev => [...prev, ...list]);
        e.target.value = '';
    }
    function removeFile(idx) { setFiles(prev => prev.filter((_, i) => i !== idx)); }

    function handleSubmit(e) {
        e.preventDefault();
        if (!message.trim()) return;
        if (import.meta.env.DEV) console.log('Feedback submitted:', { type: feedbackType, message: message.trim(), attachments: files.map(f => ({ name: f.name, size: f.size })), timestamp: new Date().toISOString() });
        setSubmitted(true);
    }

    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)';
    const cardBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';
    const subtleBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)';
    const subtleBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';

    if (submitted) {
        return (
            <div className="flex flex-col h-full app-header-offset items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
                <div className="text-center space-y-4 max-w-xs">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                        style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.08)' }}
                    >
                        <CheckCircle2 className="w-7 h-7" style={{ color: '#4A7C59' }} />
                    </div>
                    <div className="space-y-1.5">
                        <h2 className="text-xl font-semibold tracking-tight" style={{ color: colors.textPrimary }}>Thank you</h2>
                        <p className="text-[13px] leading-relaxed" style={{ color: colors.textSecondary }}>Your feedback has been submitted. We read every message and use it to improve MyJSI.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <form onSubmit={handleSubmit}>
                    <div className="px-4 sm:px-6 pb-10 max-w-2xl mx-auto pt-2">

                        {/* Header */}
                        <div className="pt-2 pb-5">
                            <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>Share Feedback</h1>
                            <p className="text-[13px] mt-1" style={{ color: colors.textSecondary, opacity: 0.7 }}>Help us build a better MyJSI — we read every message.</p>
                        </div>

                        {/* Type selector — grid of equal-width tiles */}
                        <div className="mb-4">
                            <span className="text-xs font-semibold uppercase tracking-widest mb-2.5 block" style={{ color: colors.textSecondary, opacity: 0.6 }}>Category</span>
                            <div className="grid grid-cols-4 gap-2">
                                {feedbackTypes.map(t => {
                                    const active = feedbackType === t.value;
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setFeedbackType(t.value)}
                                            className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-semibold transition-all"
                                            style={{
                                                backgroundColor: active
                                                    ? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)')
                                                    : cardBg,
                                                border: active
                                                    ? (isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.10)')
                                                    : cardBorder,
                                                color: active ? colors.textPrimary : colors.textSecondary,
                                                borderRadius: 16,
                                            }}
                                        >
                                            <Icon className="w-4 h-4" style={{ opacity: active ? 1 : 0.5 }} />
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary, opacity: 0.6 }}>Message</span>
                                {message.length > 0 && (
                                    <span className="text-[11px] tabular-nums" style={{ color: colors.textSecondary, opacity: 0.35 }}>{message.length}</span>
                                )}
                            </div>
                            <div style={{ backgroundColor: cardBg, border: cardBorder, borderRadius: 20 }} className="p-1">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="What's on your mind — bugs, ideas, anything..."
                                    rows={5}
                                    className="resize-none text-[13px] leading-relaxed w-full rounded-2xl px-4 py-3"
                                    style={{
                                        backgroundColor: subtleBg,
                                        border: 'none',
                                        color: colors.textPrimary,
                                        outline: 'none',
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary, opacity: 0.6 }}>Attachments</span>
                                <label
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all active:scale-95"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                        color: colors.textSecondary,
                                        border: subtleBorder,
                                    }}
                                >
                                    <Paperclip className="w-3 h-3" />
                                    Add files
                                    <input type="file" multiple className="hidden" onChange={onAttach} />
                                </label>
                            </div>
                            {files.length > 0 && (
                                <div style={{ backgroundColor: cardBg, border: cardBorder, borderRadius: 16 }} className="p-2">
                                    <ul className="space-y-1">
                                        {files.map((f, i) => (
                                            <li
                                                key={`${f.name}-${i}`}
                                                className="flex items-center justify-between px-3 py-2 rounded-xl"
                                                style={{ backgroundColor: subtleBg }}
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate text-xs font-medium" style={{ color: colors.textPrimary }}>{f.name}</div>
                                                    <div className="text-[11px]" style={{ color: colors.textSecondary, opacity: 0.45 }}>{formatFileSize(f.size)}</div>
                                                </div>
                                                <button type="button" onClick={() => removeFile(i)} className="ml-3 p-1 rounded-full transition-opacity hover:opacity-60">
                                                    <X className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="w-full flex items-center justify-center gap-2 py-3.5 text-[13px] font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-25"
                            style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : colors.textPrimary,
                                color: isDark ? colors.textPrimary : '#fff',
                                border: 'none',
                            }}
                        >
                            <Send className="w-4 h-4" />
                            Submit Feedback
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};
