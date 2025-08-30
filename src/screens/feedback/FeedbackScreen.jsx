import React, { useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

// Shadow tokens
const BUTTON_SHADOW = '0 2px 4px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)';
const BUTTON_SHADOW_HOVER = '0 3px 8px rgba(0,0,0,0.10), 0 2px 2px rgba(0,0,0,0.05)';
const BUTTON_SHADOW_ACTIVE = '0 4px 14px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.10)';
const CARD_SHADOW = '0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06)';

// Local super-white card with elevated shadow
const WhiteCard = ({ children, className = '', style = {} }) => (
    <div
        className={`rounded-[28px] border transition-shadow duration-200 ${className}`}
        style={{
            backgroundColor: '#ffffff',
            borderColor: 'rgba(0,0,0,0.07)',
            boxShadow: CARD_SHADOW,
            ...style
        }}
    >
        {children}
    </div>
);

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

    const RADIUS_OUTER = 28;
    const RADIUS_INNER = 20;

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
        backgroundColor: '#ffffff',
        border: `1px solid ${innerBorder}`,
        color: theme.colors.textPrimary,
        borderRadius: RADIUS_INNER,
        boxShadow: '0 0 0 2px rgba(255,255,255,0.6) inset, 0 1px 2px rgba(0,0,0,0.04)'
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide">
                <form onSubmit={handleSubmit} className="pt-3 max-w-2xl mx-auto space-y-7">
                    {/* Feedback type selector */}
                    <div className="flex w-full items-center justify-between -mt-1 gap-2">
                        {feedbackTypes.map(t => {
                            const active = feedbackType === t.value;
                            return (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setFeedbackType(t.value)}
                                    className="px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap focus:outline-none focus:ring transition-all duration-150"
                                    style={{
                                        backgroundColor: active ? theme.colors.accent : '#ffffff',
                                        color: active ? '#ffffff' : theme.colors.textSecondary,
                                        border: `1px solid ${active ? theme.colors.accent : innerBorder}`,
                                        boxShadow: active ? BUTTON_SHADOW_ACTIVE : BUTTON_SHADOW,
                                        transform: active ? 'translateY(0)' : 'translateY(0)'
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.boxShadow = BUTTON_SHADOW_HOVER; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.boxShadow = BUTTON_SHADOW; }}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Subject */}
                    <WhiteCard className="p-5 md:p-6">
                        <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.textSecondary }}>Subject <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Feedback subject..."
                            className="w-full px-4 py-3 outline-none transition-all focus:ring-2"
                            style={inputBaseStyle}
                            required
                        />
                    </WhiteCard>

                    {/* Message */}
                    <WhiteCard className="p-5 md:p-6">
                        <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.textSecondary }}>Message <span className="text-red-500">*</span></label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Share details, steps to reproduce, or ideas..."
                            rows="6"
                            className="w-full px-4 py-3 outline-none resize-none transition-all focus:ring-2"
                            style={inputBaseStyle}
                            required
                        />
                    </WhiteCard>

                    {/* Attachments */}
                    <WhiteCard className="p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Attachments</div>
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all" style={{ backgroundColor: '#ffffff', border: `1px solid ${innerBorder}`, color: theme.colors.textPrimary, boxShadow: BUTTON_SHADOW }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = BUTTON_SHADOW_HOVER; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = BUTTON_SHADOW; }}
                            >
                                <Paperclip className="w-4 h-4" /> Add files
                                <input type="file" multiple className="hidden" onChange={onAttach} />
                            </label>
                        </div>
                        {files.length > 0 && (
                            <ul className="mt-4 space-y-2">
                                {files.map((f, i) => (
                                    <li key={`${f.name}-${i}`} className="flex items-center justify-between px-4 py-2 border" style={{ backgroundColor: '#ffffff', border: `1px solid ${innerBorder}`, borderRadius: RADIUS_INNER, boxShadow: BUTTON_SHADOW }}>
                                        <div className="truncate text-sm" style={{ color: theme.colors.textPrimary }}>{f.name}</div>
                                        <button type="button" onClick={() => removeFile(i)} className="ml-3 p-1 rounded-full hover:bg-black/5"><X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </WhiteCard>

                    {/* Submit */}
                    <div className="pt-1">
                        <button
                            type="submit"
                            disabled={!subject.trim() || !message.trim()}
                            className="w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-full text-white transition-all disabled:opacity-50 focus:outline-none focus:ring-2"
                            style={{ backgroundColor: theme.colors.accent, boxShadow: BUTTON_SHADOW_ACTIVE }}
                        >
                            <Send className="w-5 h-5" /> Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
