import React, { useState, useCallback } from 'react';
import { ChevronUp, Heart, MessageSquare, Send, ZoomIn } from 'lucide-react';
import { MiniAvatar } from './MiniAvatar.jsx';
import { ImageLightbox } from './ImageLightbox.jsx';
import { PostDetailSheet } from './PostDetailSheet.jsx';
import { formatTs, formatExact } from './utils.js';

export const SubredditPostCard = ({ post, idx, isTop, dark, theme, isLiked, isUpvoted, onUpvote, onToggleLike, onAddComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState('');
  const [localComments, setLocalComments] = useState(() => post.comments || []);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const commentCount = localComments.length;

  const submitComment = useCallback((e) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    const c = { id: Date.now(), name: 'You', text: t };
    setLocalComments(prev => [...prev, c]);
    onAddComment?.(post.id, t);
    setDraft('');
  }, [draft, post.id, onAddComment]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : '#FFFFFF', border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)'}` }}
    >
      {/* Post body */}
      <div className="p-3.5 pb-2">
        <div className="flex items-center gap-2 mb-1.5">
          {isTop && typeof idx === 'number' && (
            <span className="text-xs font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: dark ? 'rgba(53,53,53,0.25)' : 'rgba(53,53,53,0.08)', color: theme.colors.accent }}>
              {idx + 1}
            </span>
          )}
          <MiniAvatar src={post.user?.avatar} name={post.user?.name} dark={dark} />
          <span className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</span>
          <span className="text-xs ml-auto cursor-default" title={formatExact(post.createdAt)} style={{ color: theme.colors.textSecondary }}>{formatTs(post.createdAt)}</span>
        </div>
        <button onClick={() => setShowDetail(true)} className="text-left w-full">
          {post.title && <p className="text-sm font-bold mb-1" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
          <p className="text-xs leading-relaxed line-clamp-3" style={{ color: theme.colors.textSecondary }}>{post.text}</p>
        </button>
        {post.image && (
          <button onClick={() => setLightboxSrc(post.image)} className="block w-full relative group rounded-xl overflow-hidden mt-2">
            <img src={post.image} alt="post" className="w-full rounded-xl object-cover max-h-40" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="w-5 h-5 text-white drop-shadow-lg" />
            </div>
          </button>
        )}
      </div>

      {/* Action bar */}
      <div className="px-3.5 py-1.5 flex items-center gap-1 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)' }}>
        <button onClick={() => onUpvote?.(post.id)} className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-full transition-all" style={{ color: isUpvoted ? theme.colors.accent : theme.colors.textSecondary, backgroundColor: isUpvoted ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`) : 'transparent' }}>
          <ChevronUp className="w-3.5 h-3.5" /> {post.upvotes || 0}
        </button>
        <button onClick={() => onToggleLike?.(post.id)} className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-full transition-all" style={{ color: isLiked ? theme.colors.accent : theme.colors.textSecondary, backgroundColor: isLiked ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`) : 'transparent' }}>
          <Heart className="w-3.5 h-3.5" style={isLiked ? { fill: theme.colors.accent } : undefined} /> {post.likes || 0}
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1 text-xs ml-auto px-2 py-1.5 rounded-full transition-all"
          style={{ color: showComments ? theme.colors.accent : theme.colors.textSecondary, backgroundColor: showComments ? (dark ? 'rgba(255,255,255,0.10)' : `${theme.colors.accent}08`) : 'transparent' }}
        >
          <MessageSquare className="w-3.5 h-3.5" /> {commentCount}
        </button>
      </div>

      {/* Inline comments */}
      {showComments && (
        <div className="px-3.5 pb-3 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)' }}>
          {localComments.length > 0 ? (
            <div className="space-y-1.5 pt-2.5">
              {localComments.map(c => (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: dark ? '#333' : '#EDEAE4', color: theme.colors.textSecondary }}>
                    {c.name?.[0] || '?'}
                  </div>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{c.name}</span>
                    <span className="text-xs ml-1.5" style={{ color: theme.colors.textSecondary }}>{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs py-2.5 text-center" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>No comments yet</p>
          )}
          <form onSubmit={submitComment} className="flex items-center gap-2 mt-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Reply\u2026"
              className="flex-1 text-xs h-8 px-3 rounded-full outline-none"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)', color: theme.colors.textPrimary }}
            />
            <button disabled={!draft.trim()} className="h-7 w-7 rounded-full flex items-center justify-center disabled:opacity-25 transition-opacity flex-shrink-0" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt={post.title || 'Post image'} onClose={() => setLightboxSrc(null)} />}
      {showDetail && (
        <PostDetailSheet
          post={{ ...post, comments: localComments }}
          theme={theme}
          dark={dark}
          isLiked={isLiked}
          isUpvoted={isUpvoted}
          onToggleLike={onToggleLike}
          onUpvote={onUpvote}
          onAddComment={(id, text) => {
            const c = { id: Date.now(), name: 'You', text };
            setLocalComments(prev => [...prev, c]);
            onAddComment?.(id, text);
          }}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};
