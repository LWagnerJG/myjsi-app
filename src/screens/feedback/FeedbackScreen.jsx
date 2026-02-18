import React, { useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const FeedbackScreen = ({ theme }) => {
    const [feedbackType, setFeedbackType] = useState('general');
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

    const feedbackTypes = [
        { value: 'general', label: 'General' },
        { value: 'bug', label: 'Bug Report' },
        { value: 'feature', label: 'Feature Request' },
        { value: 'improvement', label: 'Improvement' },
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
        console.log('Feedback submitted:', { type: feedbackType, message: message.trim(), attachments: files.map(f => ({ name: f.name, size: f.size })), timestamp: new Date().toISOString() });
        setSubmitted(true);
    }

    const cardStyle = {
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
        borderRadius: 20,
    };

    const inputStyle = {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
        color: colors.textPrimary,
        borderRadius: 14,
        outline: 'none',
        width: '100%',
    };

    if (submitted) {
        return (
            <div className="flex flex-col h-full app-header-offset items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
                <div className="text-center space-y-3 max-w-xs">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2"
                        style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.10)', border: '1px solid rgba(74,124,89,0.2)' }}
                    >
                        <Send className="w-6 h-6" style={{ color: '#4A7C59' }} />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Thanks for the feedback</h2>
                    <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>We review every submission and use it to improve MyJSI.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <form onSubmit={handleSubmit}>
                    <div className="px-4 sm:px-6 pb-10 max-w-2xl mx-auto space-y-3 pt-2">

                        {/* Header */}
                        <div className="pt-2 pb-3">
                            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: colors.textPrimary }}>Share Feedback</h1>
                            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>We read every submission. Help shape what's next.</p>
                        </div>

                        {/* Type selector */}
                        <div className="flex gap-2 p-1.5 overflow-x-auto scrollbar-hide" style={cardStyle}>
                            {feedbackTypes.map(t => {
                                const active = feedbackType === t.value;
                                return (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setFeedbackType(t.value)}
                                        className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                                        style={{
                                            backgroundColor: active
                                                ? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)')
                                                : 'transparent',
                                            color: active ? colors.textPrimary : colors.textSecondary,
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Message */}
                        <div style={cardStyle} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Message</span>
                                {message.length > 0 && (
                                    <span className="text-[10px]" style={{ color: colors.textSecondary, opacity: 0.5 }}>{message.length}</span>
                                )}
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us what's on your mind — bugs, ideas, anything..."
                                rows={6}
                                className="resize-none text-sm leading-relaxed"
                                style={{ ...inputStyle, padding: '12px 14px' }}
                                required
                            />
                        </div>

                        {/* Attachments */}
                        <div style={cardStyle} className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Attachments</span>
                                <label
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-all"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                                        color: colors.textSecondary,
                                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <Paperclip className="w-3 h-3" />
                                    Add files
                                    <input type="file" multiple className="hidden" onChange={onAttach} />
                                </label>
                            </div>
                            {files.length > 0 && (
                                <ul className="mt-3 space-y-1.5">
                                    {files.map((f, i) => (
                                        <li
                                            key={`${f.name}-${i}`}
                                            className="flex items-center justify-between px-3 py-2 rounded-xl"
                                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate text-[12px] font-medium" style={{ color: colors.textPrimary }}>{f.name}</div>
                                                <div className="text-[10px] opacity-50" style={{ color: colors.textSecondary }}>{formatFileSize(f.size)}</div>
                                            </div>
                                            <button type="button" onClick={() => removeFile(i)} className="ml-3 p-1 rounded-full transition-opacity hover:opacity-60">
                                                <X className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-30"
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
