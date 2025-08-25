import React, { useState } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Send, Paperclip, X } from 'lucide-react';

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

    function onAttach(e) {
        const list = Array.from(e.target.files || []);
        if (!list.length) return;
        setFiles(prev => [...prev, ...list]);
        e.target.value = '';
    }

    function removeFile(idx) {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return;
        const payload = {
            type: feedbackType,
            subject: subject.trim(),
            message: message.trim(),
            attachments: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
            timestamp: new Date().toISOString()
        };
        console.log('Feedback submitted:', payload);
        setSubject('');
        setMessage('');
        setFiles([]);
        setFeedbackType('general');
    }

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <PageTitle title="" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <GlassCard theme={theme} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {feedbackTypes.map((t) => {
                                const active = feedbackType === t.value;
                                return (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setFeedbackType(t.value)}
                                        className="px-3 py-2 rounded-3xl text-sm font-semibold transition-all"
                                        style={{
                                            backgroundColor: active ? theme.colors.accent : theme.colors.subtle,
                                            color: active ? '#fff' : theme.colors.textPrimary,
                                            border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </GlassCard>

                    <GlassCard theme={theme} className="p-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                            Summary <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief summary..."
                            className="w-full p-3 rounded-2xl border outline-none transition-all"
                            style={{
                                backgroundColor: theme.colors.surface,
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.textPrimary
                            }}
                            required
                        />
                    </GlassCard>

                    <GlassCard theme={theme} className="p-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Share details, steps to reproduce, or ideas..."
                            rows="6"
                            className="w-full p-3 rounded-2xl border outline-none resize-none transition-all"
                            style={{
                                backgroundColor: theme.colors.surface,
                                border: `1px solid ${theme.colors.border}`,
                                color: theme.colors.textPrimary
                            }}
                            required
                        />
                    </GlassCard>

                    <GlassCard theme={theme} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                Attachments
                            </div>
                            <label
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold cursor-pointer"
                                style={{
                                    backgroundColor: theme.colors.subtle,
                                    border: `1px solid ${theme.colors.border}`,
                                    color: theme.colors.textPrimary
                                }}
                            >
                                <Paperclip className="w-4 h-4" />
                                Add files
                                <input type="file" multiple className="hidden" onChange={onAttach} />
                            </label>
                        </div>

                        {files.length > 0 && (
                            <ul className="mt-3 space-y-2">
                                {files.map((f, i) => (
                                    <li
                                        key={`${f.name}-${i}`}
                                        className="flex items-center justify-between px-3 py-2 rounded-2xl"
                                        style={{
                                            backgroundColor: theme.colors.surface,
                                            border: `1px solid ${theme.colors.border}`
                                        }}
                                    >
                                        <div className="truncate text-sm" style={{ color: theme.colors.textPrimary }}>
                                            {f.name}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="ml-3 p-1 rounded-full hover:bg-black/5"
                                        >
                                            <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!subject.trim() || !message.trim()}
                            className="w-full flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-full text-white transition-all disabled:opacity-50"
                            style={{ backgroundColor: theme.colors.accent }}
                        >
                            <Send className="w-5 h-5" />
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
