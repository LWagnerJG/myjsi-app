import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, X, MessageSquare, Bug, Lightbulb, Sparkles, CheckCircle2, Send } from 'lucide-react';
import { AppScreenLayout } from '../../components/common/AppScreenLayout.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { FloatingSubmitCTA } from '../../components/common/FloatingSubmitCTA.jsx';
import { PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme, subtleBg, subtleBorder, fieldTileSurface, floatingBarStyle } from '../../design-system/tokens.js';
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

const getFileKey = (file) => `${file?.name || 'file'}_${file?.size || 0}_${file?.lastModified || 0}`;

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
        setFiles((prev) => {
            const seen = new Set(prev.map(getFileKey));
            const next = [...prev];
            list.forEach((file) => {
                const key = getFileKey(file);
                if (seen.has(key)) return;
                seen.add(key);
                next.push(file);
            });
            return next;
        });
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
    const helperSurface = subtleBg(theme, 1.1);
    const fieldTile = fieldTileSurface(theme);
    const activeTypeSurface = colors.accent || colors.textPrimary;
    const showFloatingSubmit = canSubmit && !isSubmitAreaVisible && !isMessageFocused;
    const feedbackChromeRgb = isDark ? '26,26,26' : '240,237,232';
    const feedbackFloatingCtaStyle = {
        ...floatingBarStyle(theme),
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
            contentClassName="pt-3 space-y-4"
        >
            <GlassCard theme={theme} className="p-4 sm:p-5">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
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
                                        backgroundColor: active ? activeTypeSurface : fieldTile.backgroundColor,
                                        color: active ? (colors.accentText || '#FFFFFF') : colors.textSecondary,
                                        border: 'none',
                                        boxShadow: active
                                            ? (isDark ? '0 12px 28px rgba(0,0,0,0.24)' : '0 12px 28px rgba(53,53,53,0.10)')
                                            : 'none',
                                    }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                            style={{
                                                backgroundColor: active
                                                    ? 'rgba(255,255,255,0.16)'
                                                    : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)'),
                                            }}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[0.9375rem] font-semibold leading-none">{item.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div>
                        <div
                            className="rounded-[24px] px-4 py-4 sm:px-5 sm:py-5 transition-all duration-200"
                            style={{
                                ...fieldTile,
                                border: isMessageFocused ? `1px solid ${colors.accent}33` : '1px solid transparent',
                                boxShadow: isMessageFocused ? `0 0 0 3px ${colors.accent}14` : 'none',
                            }}
                        >
                            <textarea
                                id="feedback-message"
                                aria-label="Feedback message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onFocus={() => setIsMessageFocused(true)}
                                onBlur={() => setIsMessageFocused(false)}
                                placeholder="What happened, or what should change?"
                                rows={7}
                                required
                                className="w-full min-h-[172px] resize-none bg-transparent text-[0.9375rem] leading-6 outline-none placeholder:opacity-45"
                                style={{
                                    color: colors.textPrimary,
                                    caretColor: colors.textPrimary,
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div
                            className="rounded-[24px] px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3"
                            style={fieldTile}
                        >
                            <div className="min-w-0">
                                <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                    Attachments
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                                    Optional
                                </div>
                            </div>

                            <label
                                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all active:scale-[0.98] shrink-0"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.surface,
                                    color: colors.textPrimary,
                                    border: 'none',
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
                                            ...fieldTile,
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.78)',
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

                    <div ref={submitAreaRef}>
                        <PrimaryButton
                            theme={theme}
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full"
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
