import React, { useState } from 'react';
import { Paperclip, X, MessageSquare, Bug, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppScreenLayout } from '../../components/common/AppScreenLayout.jsx';
import { FloatingSubmitCTA } from '../../components/common/FloatingSubmitCTA.jsx';
import { isDarkTheme, subtleBorder } from '../../design-system/tokens.js';
import { hapticSuccess } from '../../utils/haptics.js';

const FEEDBACK_TYPES = [
    { value: 'general',     label: 'General',     icon: MessageSquare },
    { value: 'bug',         label: 'Bug',          icon: Bug           },
    { value: 'feature',     label: 'Feature',      icon: Lightbulb     },
    { value: 'improvement', label: 'Improvement',  icon: Sparkles      },
];

const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FeedbackScreen = ({ theme }) => {
    const [feedbackType, setFeedbackType] = useState('general');
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

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
        hapticSuccess();
        if (import.meta.env.DEV) console.log('Feedback submitted:', { type: feedbackType, message: message.trim(), attachments: files.map(f => ({ name: f.name, size: f.size })), timestamp: new Date().toISOString() });
        setSubmitted(true);
    }

    const surface = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.80)';
    const surfaceBorder = subtleBorder(theme);

    /* ── Success ── */
    if (submitted) {
        return (
            <div className="min-h-full app-header-offset flex items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
                <div className="text-center max-w-xs space-y-5">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                        style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.18)' : 'rgba(74,124,89,0.10)' }}
                    >
                        <CheckCircle2 className="w-6 h-6" style={{ color: colors.success }} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-[1.375rem] font-bold tracking-tight" style={{ color: colors.textPrimary }}>Thank you</h2>
                        <p className="text-[0.8125rem] leading-relaxed" style={{ color: colors.textSecondary }}>
                            Your feedback has been received. We read every message and use it to improve myJSI.
                        </p>
                    </div>
                    <button
                        onClick={() => { setSubmitted(false); setMessage(''); setFiles([]); setFeedbackType('general'); }}
                        className="text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-70"
                        style={{ color: colors.textSecondary, backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }}
                    >
                        Send another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AppScreenLayout
            theme={theme}
            asForm
            onSubmit={handleSubmit}
            title="Share Feedback"
            subtitle="Help us build a better myJSI. We read every message."
            maxWidthClass="max-w-lg"
            horizontalPaddingClass="px-4 sm:px-6"
            contentPaddingBottomClass="pb-28"
            contentClassName="space-y-6"
            footer={(
                <FloatingSubmitCTA
                    theme={theme}
                    type="submit"
                    label="Send Feedback"
                    disabled={!message.trim()}
                    visible
                />
            )}
        >

                        {/* ── Category ── */}
                        <div className="space-y-2.5">
                            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.10em]" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                                Category
                            </span>
                            <div className="flex gap-2 flex-wrap">
                                {FEEDBACK_TYPES.map(t => {
                                    const active = feedbackType === t.value;
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setFeedbackType(t.value)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                                            style={{
                                                backgroundColor: active
                                                    ? (isDark ? 'rgba(255,255,255,0.12)' : colors.textPrimary)
                                                    : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)'),
                                                color: active
                                                    ? (isDark ? colors.textPrimary : '#fff')
                                                    : colors.textSecondary,
                                                border: active
                                                    ? (isDark ? '1px solid rgba(255,255,255,0.15)' : 'none')
                                                    : surfaceBorder,
                                            }}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Message ── */}
                        <div className="space-y-2.5">
                            <div className="flex items-baseline justify-between">
                                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.10em]" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                                    Message
                                </span>
                                {message.length > 0 && (
                                    <span className="text-[0.6875rem] tabular-nums" style={{ color: colors.textSecondary, opacity: 0.30 }}>
                                        {message.length}
                                    </span>
                                )}
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="What's on your mind — bugs, ideas, anything..."
                                rows={6}
                                required
                                className="w-full resize-none text-sm leading-relaxed px-4 py-3.5 rounded-2xl transition-all outline-none"
                                style={{
                                    backgroundColor: surface,
                                    border: surfaceBorder,
                                    color: colors.textPrimary,
                                    caretColor: colors.textPrimary,
                                }}
                            />
                        </div>

                        {/* ── Attachments ── */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.10em]" style={{ color: colors.textSecondary, opacity: 0.5 }}>
                                    Attachments
                                </span>
                                <label
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.6875rem] font-semibold cursor-pointer transition-all active:scale-95 hover:opacity-70"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)',
                                        color: colors.textSecondary,
                                        border: surfaceBorder,
                                    }}
                                >
                                    <Paperclip className="w-3 h-3" />
                                    Attach files
                                    <input type="file" multiple className="hidden" onChange={onAttach} />
                                </label>
                            </div>

                            {files.length > 0 && (
                                <ul className="space-y-1.5">
                                    {files.map((f, i) => (
                                        <li
                                            key={`${f.name}-${i}`}
                                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                                            style={{ backgroundColor: surface, border: surfaceBorder }}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[0.8125rem] font-medium" style={{ color: colors.textPrimary }}>{f.name}</div>
                                                <div className="text-[0.6875rem] mt-0.5" style={{ color: colors.textSecondary, opacity: 0.45 }}>{formatFileSize(f.size)}</div>
                                            </div>
                                            <button type="button" onClick={() => removeFile(i)} className="ml-3 p-1.5 rounded-full transition-opacity hover:opacity-60 shrink-0">
                                                <X className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

        </AppScreenLayout>
    );
};
