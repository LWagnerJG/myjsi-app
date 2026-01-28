import React, { useState } from 'react';
import { Send, Paperclip, X, MessageSquareText } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PillButton, PrimaryButton } from '../../components/common/JSIButtons.jsx';

export const FeedbackScreen = ({ theme }) => {
    const [feedbackType, setFeedbackType] = useState('general');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);

    const feedbackTypes = [
        { value: 'general', label: 'General' },
        { value: 'bug', label: 'Bug' },
        { value: 'feature', label: 'Feature' },
        { value: 'improvement', label: 'Improvement' }
    ];

    const RADIUS_INNER = 16;

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
        if (!subject.trim() || !message.trim()) return;
        const payload = { type: feedbackType, subject: subject.trim(), message: message.trim(), attachments: files.map(f => ({ name: f.name, size: f.size, type: f.type })), timestamp: new Date().toISOString() };
        console.log('Feedback submitted:', payload);
        setSubject(''); setMessage(''); setFiles([]); setFeedbackType('general');
    }

    const innerBorder = 'rgba(0,0,0,0.06)';

    const inputBaseStyle = {
        backgroundColor: theme.colors.surface,
        border: `1px solid ${innerBorder}`,
        color: theme.colors.textPrimary,
        borderRadius: RADIUS_INNER,
        boxShadow: '0 0 0 2px rgba(255,255,255,0.4) inset, 0 1px 2px rgba(0,0,0,0.04)'
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-12 scrollbar-hide">
                <form onSubmit={handleSubmit} className="pt-4 max-w-2xl mx-auto space-y-6">
                    <GlassCard theme={theme} className="p-5 md:p-6" variant="elevated">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${theme.colors.accent}12` }}>
                                <MessageSquareText className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>Send Feedback</h2>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Share bugs, ideas, or improvements. We review every submission.</p>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="flex w-full items-center justify-between gap-2">
                        {feedbackTypes.map(t => {
                            const active = feedbackType === t.value;
                            return (
                                <PillButton
                                    key={t.value}
                                    isSelected={active}
                                    onClick={() => setFeedbackType(t.value)}
                                    theme={theme}
                                    size="default"
                                    className="flex-1"
                                >
                                    {t.label}
                                </PillButton>
                            );
                        })}
                    </div>

                    <GlassCard theme={theme} className="p-5 md:p-6" variant="elevated">
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Subject <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Feedback subject..."
                            className="w-full px-4 py-3 outline-none transition-all focus:ring-2"
                            style={inputBaseStyle}
                            required
                        />
                        <div className="mt-2 text-xs" style={{ color: theme.colors.textSecondary }}>A short summary helps us triage faster.</div>
                    </GlassCard>

                    <GlassCard theme={theme} className="p-5 md:p-6" variant="elevated">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Message <span className="text-red-500">*</span></label>
                            <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{message.length} chars</span>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Share details, steps to reproduce, or ideas..."
                            rows="6"
                            className="w-full px-4 py-3 outline-none resize-none transition-all focus:ring-2"
                            style={inputBaseStyle}
                            required
                        />
                        <div className="mt-2 text-xs" style={{ color: theme.colors.textSecondary }}>Include expected vs. actual behavior and any screenshots.</div>
                    </GlassCard>

                    <GlassCard theme={theme} className="p-5 md:p-6" variant="elevated">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Attachments</div>
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${innerBorder}`, color: theme.colors.textPrimary }}>
                                <Paperclip className="w-4 h-4" /> Add files
                                <input type="file" multiple className="hidden" onChange={onAttach} />
                            </label>
                        </div>
                        {files.length > 0 && (
                            <ul className="mt-4 space-y-2">
                                {files.map((f, i) => (
                                    <li key={`${f.name}-${i}`} className="flex items-center justify-between px-4 py-2 border" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${innerBorder}`, borderRadius: RADIUS_INNER }}>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm" style={{ color: theme.colors.textPrimary }}>{f.name}</div>
                                            <div className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{formatFileSize(f.size)} • {f.type || 'File'}</div>
                                        </div>
                                        <button type="button" onClick={() => removeFile(i)} className="ml-3 p-1 rounded-full hover:bg-black/5"><X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>

                    <div className="pt-1">
                        <PrimaryButton
                            type="submit"
                            disabled={!subject.trim() || !message.trim()}
                            theme={theme}
                            size="default"
                            fullWidth
                            icon={<Send className="w-5 h-5" />}
                        >
                            Submit Feedback
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};
