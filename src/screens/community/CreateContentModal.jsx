import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { X, ImageIcon, ListChecks } from 'lucide-react';

export const CreateContentModal = ({ show, onClose, theme, onCreatePost }) => {
    const [mode, setMode] = useState('post'); // 'post' | 'poll'
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]); // [{file, url}]
    const [opts, setOpts] = useState(['', '']); // always render 2; can expand to 4
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const fileInputRef = useRef(null);

    // Derived submit availability (must run every render to preserve hook order regardless of visibility)
    const canSubmit = useMemo(() => {
        if (mode === 'poll') {
            const a = opts[0]?.trim();
            const b = opts[1]?.trim();
            return !!content.trim() && !!a && !!b;
        }
        return !!content.trim() || files.length > 0;
    }, [mode, content, opts, files]);

    // Cleanup created object URLs when modal is hidden or unmounts
    useEffect(() => {
        if (!show && files.length) {
            files.forEach((o) => o.url && URL.revokeObjectURL(o.url));
            // don't clear files so reopening still shows them unless we explicitly reset
        }
        return () => {
            files.forEach((o) => o.url && URL.revokeObjectURL(o.url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    const reset = () => {
        setMode('post');
        setContent('');
        setFiles((prev) => {
            prev.forEach((o) => o.url && URL.revokeObjectURL(o.url));
            return [];
        });
        setOpts(['', '']);
        setShowMoreOptions(false);
    };

    const handleFileChange = (e) => {
        if (!e.target.files) return;
        const next = Array.from(e.target.files).map((f) => ({ file: f, url: URL.createObjectURL(f) }));
        setFiles((prev) => [...prev, ...next]);
    };

    const removeImage = (idx) => {
        setFiles((prev) => {
            const copy = [...prev];
            const [removed] = copy.splice(idx, 1);
            if (removed) URL.revokeObjectURL(removed.url);
            return copy;
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const now = Date.now();
        if (mode === 'poll') {
            const optionTexts = [
                ...opts,
                ...(showMoreOptions ? ['', ''] : []),
            ]
                .map((t) => t?.trim())
                .filter(Boolean)
                .slice(0, 4);
            const payload = {
                id: now,
                type: 'poll',
                user: { name: 'You', avatar: null },
                timeAgo: 'now',
                createdAt: now,
                question: content.trim(),
                options: optionTexts.map((text, i) => ({ id: `opt${i + 1}`, text, votes: 0 })),
            };
            onCreatePost?.(payload);
            reset();
            onClose?.();
            return;
        }
        const payload = {
            id: now,
            type: 'post',
            user: { name: 'You', avatar: null },
            timeAgo: 'now',
            createdAt: now,
            text: content.trim(),
            image: files.length === 1 ? files[0].url : null,
            images: files.length > 1 ? files.map((o) => o.url) : [],
            likes: 0,
            comments: [],
        };
        onCreatePost?.(payload);
        reset();
        onClose?.();
    };

    if (!show) return null; // safe now because all hooks already executed in stable order

    return (
        <Modal show={show} onClose={onClose} title="New Post" theme={theme}>
            <form onSubmit={submit} className="space-y-5">
                {/* ── Mode toggle ── */}
                <div
                    className="grid grid-cols-2 gap-1 p-0.5 rounded-full"
                    style={{ background: theme.colors.subtle }}
                >
                    {['post', 'poll'].map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className="h-8 rounded-full text-[13px] font-semibold transition-all"
                            style={{
                                background: mode === m ? theme.colors.surface : 'transparent',
                                color: mode === m ? theme.colors.textPrimary : theme.colors.textSecondary,
                                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            }}
                        >
                            {m === 'poll' ? <span className="inline-flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" />Poll</span> : 'Post'}
                        </button>
                    ))}
                </div>

                {/* ── Text area ── */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={mode === 'poll' ? 2 : 3}
                    className="w-full px-4 py-3 rounded-2xl outline-none resize-none text-sm leading-relaxed"
                    style={{
                        backgroundColor: theme.colors.subtle,
                        color: theme.colors.textPrimary,
                    }}
                    placeholder={mode === 'poll' ? 'Ask a question\u2026' : 'Share an update, install, or photo\u2026'}
                />

                {mode === 'poll' ? (
                    <>
                        {/* ── Poll options ── */}
                        <div className="space-y-2">
                            {[0, 1].map((i) => (
                                <input
                                    key={i}
                                    value={opts[i] || ''}
                                    onChange={(e) => { const next = [...opts]; next[i] = e.target.value; setOpts(next); }}
                                    placeholder={`Option ${i + 1}`}
                                    className="w-full h-10 px-4 rounded-xl outline-none text-sm"
                                    style={{ background: theme.colors.subtle, color: theme.colors.textPrimary }}
                                />
                            ))}
                            {showMoreOptions && [2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        value={opts[i] || ''}
                                        onChange={(e) => { const next = [...opts]; next[i] = e.target.value; setOpts(next); }}
                                        placeholder={`Option ${i + 1} (optional)`}
                                        className="flex-1 h-10 px-4 rounded-xl outline-none text-sm"
                                        style={{ background: theme.colors.subtle, color: theme.colors.textPrimary }}
                                    />
                                    {!!opts[i] && (
                                        <button
                                            type="button"
                                            onClick={() => { const next = [...opts]; next[i] = ''; setOpts(next); }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ background: theme.colors.subtle }}
                                            aria-label="Clear option"
                                        >
                                            <X className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!showMoreOptions && (
                            <button
                                type="button"
                                onClick={() => setShowMoreOptions(true)}
                                className="text-[13px] font-semibold"
                                style={{ color: theme.colors.accent }}
                            >
                                + Add more options
                            </button>
                        )}
                    </>
                ) : (
                  <>
                    {/* ── Image previews ── */}
                    {files.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {files.map((o, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                            <img src={o.url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm"
                              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* ── Add images ── */}
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-medium transition-colors"
                      style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}
                    >
                      <ImageIcon className="w-4 h-4" />Add Images
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </>
                )}

                {/* ── Actions ── */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { reset(); onClose?.(); }}
                    className="flex-1 h-11 rounded-full text-[13px] font-semibold transition-colors"
                    style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                  >Cancel</button>
                  <button type="submit" disabled={!canSubmit}
                    className="flex-1 h-11 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                  >{mode === 'poll' ? 'Create Poll' : 'Post'}</button>
                </div>
            </form>
        </Modal>
    );
};
