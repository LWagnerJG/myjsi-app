import React, { useState, useRef } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { X, ImageIcon, ListChecks } from 'lucide-react';

export const CreateContentModal = ({ show, onClose, theme, onCreatePost }) => {
    const [isPoll, setIsPoll] = useState(false);
    const [content, setContent] = useState('');        // Post text OR Poll question
    const [images, setImages] = useState([]);
    const [opts, setOpts] = useState(['', '', '', '']);  // 4 fields; first 2 required for polls
    const fileInputRef = useRef(null);

    if (!show) return null;

    const reset = () => {
        setIsPoll(false);
        setContent('');
        setImages([]);
        setOpts(['', '', '', '']);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const now = Date.now();

        if (!isPoll) {
            if (!content.trim() && images.length === 0) return;
            const payload = {
                id: now,
                type: 'post',
                user: { name: 'You', avatar: null },
                timeAgo: 'now',
                createdAt: now,
                text: content.trim(),
                image: images.length === 1 ? URL.createObjectURL(images[0]) : null,
                images: images.length > 1 ? images.map(f => URL.createObjectURL(f)) : [],
                likes: 0,
                comments: [],
            };
            onCreatePost?.(payload);
            reset();
            onClose?.();
            return;
        }

        // Poll
        const clean = opts.map(o => o.trim()).filter(Boolean);
        if (!content.trim() || clean.slice(0, 2).length < 2) return; // need question + first two options
        const optionObjs = clean.map((text, i) => ({ id: `opt${i + 1}`, text, votes: 0 }));
        const payload = {
            id: now,
            type: 'poll',
            user: { name: 'You', avatar: null },
            timeAgo: 'now',
            createdAt: now,
            question: content.trim(),
            options: optionObjs,
        };
        onCreatePost?.(payload);
        reset();
        onClose?.();
    };

    const handleFileChange = (e) => {
        if (e.target.files) setImages(prev => [...prev, ...Array.from(e.target.files)]);
    };
    const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

    return (
        <Modal show={show} onClose={onClose} title="Create New Post" theme={theme}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mode toggle */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                        {isPoll ? 'Creating a Poll' : 'Creating a Post'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsPoll(v => !v)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold active:scale-95 transition"
                        style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                        aria-pressed={isPoll}
                        title={isPoll ? 'Switch to Post' : 'Add Poll'}
                    >
                        <ListChecks className="w-4 h-4" />
                        {isPoll ? 'Post' : 'Add Poll'}
                    </button>
                </div>

                {/* Content / Question */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                        {isPoll ? 'Poll Question' : 'What’s on your mind?'}
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={isPoll ? 2 : 4}
                        className="w-full px-3 py-2 rounded-lg outline-none"
                        style={{
                            backgroundColor: theme.colors.subtle,
                            color: theme.colors.textPrimary,
                            border: `1px solid ${theme.colors.border}`,
                        }}
                        placeholder={isPoll ? 'Which Vision base finish do you spec most?' : 'Share an update, install, or photo…'}
                        required={!isPoll} /* for polls we validate below */
                    />
                </div>

                {/* Poll options (first two required, last two optional) */}
                {isPoll && (
                    <div className="space-y-2">
                        {[0, 1, 2, 3].map((idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    value={opts[idx]}
                                    onChange={(e) => {
                                        const next = [...opts];
                                        next[idx] = e.target.value;
                                        setOpts(next);
                                    }}
                                    className="flex-1 px-3 py-2 rounded-lg outline-none"
                                    style={{
                                        backgroundColor: theme.colors.subtle,
                                        color: theme.colors.textPrimary,
                                        border: `1px solid ${theme.colors.border}`,
                                    }}
                                    placeholder={`Option ${idx + 1}${idx > 1 ? ' (optional)' : ''}`}
                                    required={idx < 2}
                                />
                                {opts[idx] && (
                                    <button
                                        type="button"
                                        onClick={() => { const next = [...opts]; next[idx] = ''; setOpts(next); }}
                                        className="p-2 rounded-full active:scale-95 transition"
                                        style={{ backgroundColor: theme.colors.subtle }}
                                        aria-label="Clear option"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Images (post only) */}
                {!isPoll && (
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                            Images
                        </label>
                        <div className="space-y-3">
                            {images.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {images.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`preview-${idx}`}
                                                className="w-full h-full object-cover rounded-lg shadow"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 active:scale-90 transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed active:scale-95 transition"
                                style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
                            >
                                <ImageIcon className="w-5 h-5" />
                                <span className="font-semibold">Add Images</span>
                            </button>
                            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => { reset(); onClose?.(); }}
                        className="flex-1 py-3 rounded-full font-semibold active:scale-95 transition"
                        style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 rounded-full font-semibold text-white active:scale-95 transition"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Post
                    </button>
                </div>
            </form>
        </Modal>
    );
};
