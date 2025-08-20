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
        <Modal show={show} onClose={onClose} title="Create New Post" theme={theme}>
            <form onSubmit={submit} className="space-y-4">
                <div
                    className="grid grid-cols-2 p-1 rounded-full"
                    style={{ background: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
                >
                    {['post', 'poll'].map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className="h-9 rounded-full text-sm font-semibold transition"
                            style={{
                                background: mode === m ? theme.colors.surface : 'transparent',
                                color: mode === m ? theme.colors.textPrimary : theme.colors.textSecondary,
                                boxShadow: mode === m ? `0 6px 24px ${theme.colors.shadow}` : 'none',
                            }}
                        >
                            {m === 'poll' ? <span className="inline-flex items-center gap-1.5"><ListChecks className="w-4 h-4" />Poll</span> : 'Post'}
                        </button>
                    ))}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                        {mode === 'poll' ? 'Poll question' : 'What is on your mind?'}
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={mode === 'poll' ? 2 : 4}
                        className="w-full px-3 py-2 rounded-[16px] outline-none"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            color: theme.colors.textPrimary,
                            border: `1px solid ${theme.colors.border}`,
                        }}
                        placeholder={mode === 'poll' ? 'Which finish do you spec most?' : 'Share an update, install, or photo…'}
                    />
                </div>

                {mode === 'poll' ? (
                    <>
                        <div className="space-y-2">
                            {[0, 1].map((i) => (
                                <input
                                    key={i}
                                    value={opts[i] || ''}
                                    onChange={(e) => {
                                        const next = [...opts];
                                        next[i] = e.target.value;
                                        setOpts(next);
                                    }}
                                    placeholder={`Option ${i + 1}`}
                                    className="w-full px-3 py-2 rounded-[12px] outline-none"
                                    style={{ background: theme.colors.subtle, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                                />
                            ))}
                            {showMoreOptions && [2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        value={opts[i] || ''}
                                        onChange={(e) => {
                                            const next = [...opts];
                                            next[i] = e.target.value;
                                            setOpts(next);
                                        }}
                                        placeholder={`Option ${i + 1} (optional)`}
                                        className="flex-1 px-3 py-2 rounded-[12px] outline-none"
                                        style={{ background: theme.colors.subtle, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                                    />
                                    {!!opts[i] && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = [...opts];
                                                next[i] = '';
                                                setOpts(next);
                                            }}
                                            className="p-2 rounded-full"
                                            style={{ background: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
                                            aria-label="Clear option"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!showMoreOptions && (
                            <button
                                type="button"
                                onClick={() => setShowMoreOptions(true)}
                                className="px-3 py-2 rounded-full text-sm font-semibold"
                                style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}
                            >
                                Add more options
                            </button>
                        )}
                    </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>Images</label>
                    {files.length>0 && (
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {files.map((o,idx)=>(
                          <div key={idx} className="relative aspect-square">
                            <img src={o.url} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-[14px] shadow" />
                            <button type="button" onClick={()=>removeImage(idx)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={()=>fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-[16px] border-2 border-dashed" style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary, background: theme.colors.surface }}>
                      <ImageIcon className="w-5 h-5" /><span className="font-semibold">Add Images</span>
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={()=>{ reset(); onClose?.(); }} className="flex-1 py-3 rounded-full font-semibold" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                  <button type="submit" disabled={!canSubmit} className="flex-1 py-3 rounded-full font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: theme.colors.accent }}>{mode==='poll'?'Create Poll':'Post'}</button>
                </div>
            </form>
        </Modal>
    );
};
