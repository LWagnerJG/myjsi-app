import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, X, MessageSquare, Bug, Lightbulb, Sparkles, CheckCircle2, Send } from 'lucide-react';
import { AppScreenLayout } from '../../components/common/AppScreenLayout.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { FloatingSubmitCTA } from '../../components/common/FloatingSubmitCTA.jsx';
import { PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme, subtleBg, subtleBorder } from '../../design-system/tokens.js';
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
    const [isMessageFocused, setIsMessageFocused] = useState(false);
    const [isSubmitAreaVisible, setIsSubmitAreaVisible] = useState(true);

    const submitAreaRef = useRef(null);

    const isDark = isDarkTheme(theme);
    const colors = theme.colors;
    const trimmedMessage = message.trim();
    const canSubmit = trimmedMessage.length > 0;
    const activeFeedbackType = FEEDBACK_TYPES.find((item) => item.value === feedbackType) || FEEDBACK_TYPES[0];

    useEffect(() => {
        if (!submitAreaRef.current || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            return undefined;
        }

        const observer = new window.IntersectionObserver(
            ([entry]) => {
                setIsSubmitAreaVisible(entry.isIntersecting);
            },
            {
                threshold: 0.45,
                rootMargin: '0px 0px -120px 0px',
            }
        );

        observer.observe(submitAreaRef.current);

        return () => observer.disconnect();
    }, []);

    function onAttach(e) {
        const list = Array.from(e.target.files || []);
        if (!list.length) return;
        setFiles(prev => [...prev, ...list]);
        e.target.value = '';
    }
    function removeFile(idx) { setFiles(prev => prev.filter((_, i) => i !== idx)); }

    function resetForm() {
        setSubmitted(false);
        setFeedbackType('general');
        setMessage('');
        setFiles([]);
        setIsMessageFocused(false);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        hapticSuccess();
        if (import.meta.env.DEV) console.log('Feedback submitted:', { type: feedbackType, message: trimmedMessage, attachments: files.map(f => ({ name: f.name, size: f.size })), timestamp: new Date().toISOString() });
        setSubmitted(true);
    }

    const surfaceBorder = subtleBorder(theme);
    const composerSurface = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
    const helperSurface = subtleBg(theme, 1.1);
    const activeTypeSurface = colors.accent || colors.textPrimary;
    const showFloatingSubmit = canSubmit && !isSubmitAreaVisible && !isMessageFocused;
    const feedbackChromeRgb = isDark ? '26,26,26' : '240,237,232';
    const feedbackFloatingCtaStyle = {
        backdropFilter: 'blur(20px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        backgroundColor: isDark ? 'rgba(42,42,42,0.72)' : 'rgba(255,255,255,0.82)',
        border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.88)',
        boxShadow: isDark
            ? '0 14px 36px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 12px 32px rgba(53,53,53,0.10), 0 2px 10px rgba(53,53,53,0.04)',
        color: colors.textPrimary,
    };

    /* ── Success ── */
    if (submitted) {
        const ActiveFeedbackIcon = activeFeedbackType.icon;

        return (
            <div className="min-h-full app-header-offset flex items-center justify-center px-4 sm:px-6" style={{ backgroundColor: colors.background }}>
                <GlassCard theme={theme} className="w-full max-w-sm p-6 sm:p-7 text-center space-y-5">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                        style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.18)' : 'rgba(74,124,89,0.10)' }}
                    >
                        <CheckCircle2 className="w-7 h-7" style={{ color: colors.success }} />
                    </div>
                    <div className="space-y-3">
                        <div
                            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                            style={{
                                backgroundColor: helperSurface,
                                border: surfaceBorder,
                                color: colors.textSecondary,
                            }}
                        >
                            <ActiveFeedbackIcon className="w-3.5 h-3.5" />
                            {activeFeedbackType.label}
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-[1.5rem] font-bold tracking-tight" style={{ color: colors.textPrimary }}>Thanks for the note</h2>
                            <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                                Your feedback has been received. We read every message and use it to improve myJSI.
                            </p>
                        </div>
                    </div>
                    <PrimaryButton
                        type="button"
                        onClick={resetForm}
                        theme={theme}
                        fullWidth
                    >
                        Send another note
                    </PrimaryButton>
                </GlassCard>
            </div>
        );
    }

    return (
        <AppScreenLayout
            theme={theme}
            asForm
            onSubmit={handleSubmit}
            title="Feedback"
            maxWidthClass="max-w-content"
            horizontalPaddingClass="px-4 sm:px-6"
            contentPaddingBottomClass="pb-36"
            contentClassName="pt-2 space-y-5"
        >
            <GlassCard theme={theme} className="p-4 sm:p-5">
                <div className="space-y-5">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                What is this about?
                            </h2>
                            <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                                Pick the closest type, then tell us what happened or what should change.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {FEEDBACK_TYPES.map((item) => {
                                const active = feedbackType === item.value;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => setFeedbackType(item.value)}
                                        className="rounded-[20px] px-3.5 py-3 text-left transition-all active:scale-[0.98]"
                                        style={{
                                            backgroundColor: active ? activeTypeSurface : helperSurface,
                                            color: active ? (colors.accentText || '#FFFFFF') : colors.textSecondary,
                                            border: active ? 'none' : surfaceBorder,
                                            boxShadow: active
                                                ? (isDark ? '0 12px 28px rgba(0,0,0,0.24)' : '0 12px 28px rgba(53,53,53,0.10)')
                                                : 'none',
                                        }}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                style={{
                                                    backgroundColor: active
                                                        ? 'rgba(255,255,255,0.16)'
                                                        : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)'),
                                                }}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold leading-none">{item.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <label htmlFor="feedback-message" className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                Message
                            </label>
                            <span className="text-xs tabular-nums" style={{ color: colors.textSecondary, opacity: message.length > 0 ? 0.75 : 0.55 }}>
                                {message.length > 0 ? `${message.length} chars` : 'A short note is enough'}
                            </span>
                        </div>

                        <div
                            className="rounded-[24px] px-4 py-4 sm:px-5 sm:py-5 transition-all duration-200"
                            style={{
                                backgroundColor: composerSurface,
                                border: isMessageFocused ? `1px solid ${colors.accent}33` : surfaceBorder,
                                boxShadow: isMessageFocused ? `0 0 0 3px ${colors.accent}14` : 'none',
                            }}
                        >
                            <textarea
                                id="feedback-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onFocus={() => setIsMessageFocused(true)}
                                onBlur={() => setIsMessageFocused(false)}
                                placeholder="Tell us what you ran into, what you expected, or what would make this better."
                                rows={7}
                                required
                                className="w-full min-h-[180px] resize-none bg-transparent text-[0.9375rem] leading-6 outline-none placeholder:opacity-45"
                                style={{
                                    color: colors.textPrimary,
                                    caretColor: colors.textPrimary,
                                }}
                            />

                            <div className="mt-3 flex items-center justify-between gap-3">
                                <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                                    Include what happened, what you expected, and anything that would help us reproduce it.
                                </p>
                                <div
                                    className="shrink-0 rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold"
                                    style={{
                                        backgroundColor: helperSurface,
                                        border: surfaceBorder,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    {activeFeedbackType.label}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="rounded-[24px] px-4 py-4 sm:px-5 sm:py-5 space-y-3"
                        style={{
                            backgroundColor: helperSurface,
                            border: surfaceBorder,
                        }}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                    Attachments
                                </h3>
                                <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                                    Screenshots, PDFs, and marked-up images help when something looks wrong.
                                </p>
                            </div>

                            <label
                                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all active:scale-[0.98]"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
                                    color: colors.textPrimary,
                                    border: surfaceBorder,
                                }}
                            >
                                <Paperclip className="w-4 h-4" />
                                Add files
                                <input type="file" multiple className="hidden" onChange={onAttach} />
                            </label>
                        </div>

                        {files.length > 0 ? (
                            <ul className="space-y-2">
                                {files.map((file, index) => (
                                    <li
                                        key={`${file.name}-${index}`}
                                        className="flex items-center justify-between gap-3 rounded-[20px] px-3.5 py-3"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.78)',
                                            border: surfaceBorder,
                                        }}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium" style={{ color: colors.textPrimary }}>
                                                {file.name}
                                            </div>
                                            <div className="mt-0.5 text-[0.6875rem]" style={{ color: colors.textSecondary, opacity: 0.65 }}>
                                                {formatFileSize(file.size)}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="shrink-0 rounded-full p-2 transition-opacity hover:opacity-65"
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            <X className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    <div
                        ref={submitAreaRef}
                        className="rounded-[24px] px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                        style={{
                            backgroundColor: helperSurface,
                            border: surfaceBorder,
                        }}
                    >
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                Send feedback
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                                {canSubmit
                                    ? 'We read every note and use it to improve myJSI.'
                                    : 'Write a message first, then send it when you are ready.'}
                            </p>
                        </div>

                        <PrimaryButton
                            theme={theme}
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full sm:w-auto sm:min-w-[13rem]"
                            icon={<Send className="w-[18px] h-[18px]" />}
                        >
                            Send feedback
                        </PrimaryButton>
                    </div>
                </div>
            </GlassCard>

            <FloatingSubmitCTA
                theme={theme}
                type="submit"
                label="Send feedback"
                disabled={!canSubmit}
                visible={showFloatingSubmit}
                icon={null}
                style={feedbackFloatingCtaStyle}
            />

            {showFloatingSubmit ? (
                <div
                    aria-hidden="true"
                    className="fixed left-0 right-0 bottom-0 pointer-events-none"
                    style={{
                        height: 96,
                        zIndex: 19,
                        backdropFilter: 'blur(16px) saturate(1.6)',
                        WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
                        background: `linear-gradient(to top,
                            rgba(${feedbackChromeRgb},0.82) 0%,
                            rgba(${feedbackChromeRgb},0.56) 38%,
                            rgba(${feedbackChromeRgb},0.18) 72%,
                            rgba(${feedbackChromeRgb},0) 100%)`,
                        maskImage: 'linear-gradient(to top, black 0%, black 54%, rgba(0,0,0,0.46) 76%, rgba(0,0,0,0.1) 90%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to top, black 0%, black 54%, rgba(0,0,0,0.46) 76%, rgba(0,0,0,0.1) 90%, transparent 100%)',
                    }}
                />
            ) : null}

        </AppScreenLayout>
    );
};
