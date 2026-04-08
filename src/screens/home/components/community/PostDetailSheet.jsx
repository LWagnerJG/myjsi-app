import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ChevronUp, Heart, Send } from 'lucide-react';
import { MiniAvatar } from './MiniAvatar.jsx';
import { ImageLightbox } from './ImageLightbox.jsx';
import { formatTs, formatExact } from './utils.js';
import { hapticMedium } from '../../../../utils/haptics.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';

export const PostDetailSheet = ({ post, theme, dark, isLiked, isUpvoted, onToggleLike, onUpvote, onAddComment, onClose }) => {
  const [draft, setDraft] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState(null);
  // Local comments so new submissions appear instantly without waiting for global state re-render
  const [localComments, setLocalComments] = useState(() => post.comments || []);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const submit = useCallback((e) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    const newComment = { id: Date.now(), name: 'You', text: t };
    setLocalComments(prev => [...prev, newComment]);
    onAddComment?.(post.id, t);
    setDraft('');
  }, [draft, post.id, onAddComment]);

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ ...getUnifiedBackdropStyle(true), zIndex: UNIFIED_MODAL_Z }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: dark ? '#1e1e1e' : '#fff', border: `1px solid ${theme.colors.border}`, maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <MiniAvatar src={post.user?.avatar} name={post.user?.name} dark={dark} />
            <div>
              <p className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</p>
              <p className="text-[0.6875rem]" title={formatExact(post.createdAt)} style={{ color: theme.colors.textSecondary }}>{formatTs(post.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
            <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
          {post.title && <p className="text-[0.9375rem] font-bold" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
          {post.text && <p className="text-[0.8125rem] leading-relaxed whitespace-pre-line" style={{ color: theme.colors.textSecondary }}>{post.text}</p>}
          {post.image && (
            <button onClick={() => setLightboxSrc(post.image)} className="block w-full relative group rounded-2xl overflow-hidden">
              <img src={post.image} alt="post" className="w-full rounded-2xl object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </button>
          )}
          {(post.images || []).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((img, i) => (
                <button key={i} onClick={() => setLightboxSrc(img)} className="block relative group rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-32 rounded-xl object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Engagement row */}
          <div className="flex items-center gap-1 py-2 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => { hapticMedium(); onUpvote?.(post.id); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{ color: isUpvoted ? '#f97316' : theme.colors.textSecondary, backgroundColor: isUpvoted ? (dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)') : 'transparent' }}
            >
              <ChevronUp className="w-4 h-4" /> {post.upvotes || 0}
            </button>
            <button
              onClick={() => { hapticMedium(); onToggleLike?.(post.id); }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{ color: isLiked ? theme.colors.accent : theme.colors.textSecondary, backgroundColor: isLiked ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`) : 'transparent' }}
            >
              <Heart className="w-4 h-4" style={isLiked ? { fill: theme.colors.accent } : undefined} /> {post.likes || 0}
            </button>
            <span className="text-xs ml-auto" style={{ color: theme.colors.textSecondary }}>
              {localComments.length} comment{localComments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Comments thread */}
          <div className="space-y-2 pb-2">
            {localComments.map(c => (
              <div key={c.id} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.625rem] font-bold flex-shrink-0" style={{ backgroundColor: dark ? '#333' : '#EDEAE4', color: theme.colors.textSecondary }}>
                  {c.name?.[0] || '?'}
                </div>
                <div className="flex-1 rounded-xl px-2.5 py-1.5" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)' }}>
                  <p className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{c.text}</p>
                </div>
              </div>
            ))}
            {!localComments.length && (
              <p className="text-xs text-center py-4" style={{ color: theme.colors.textSecondary }}>No comments yet \u2014 be the first.</p>
            )}
          </div>
        </div>

        {/* Comment input */}
        <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3 border-t flex-shrink-0" style={{ borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Add a comment\u2026"
            className="flex-1 text-[0.8125rem] px-3 py-2 rounded-full outline-none"
            style={{ backgroundColor: dark ? '#333' : '#f0ede8', color: theme.colors.textPrimary }}
          />
          <button
            disabled={!draft.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
            style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt={post.title || 'Post image'} onClose={() => setLightboxSrc(null)} />}
    </div>,
    document.body
  );
};
