import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share2, ChevronUp, Send } from 'lucide-react';
import { Avatar, ActionBtn } from './SharedComponents.jsx';
import { cardBg, subtleBorder, formatTimestamp, formatExactTimestamp } from './utils.js';

export const PostCard = React.memo(({ post, theme, dark, isLiked, isUpvoted, isExpanded, onToggleLike, onUpvote, onAddComment, onToggleComments }) => {
  const [draft, setDraft] = useState('');
  const contentRef = useRef(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    if (isExpanded && contentRef.current) setMeasuredHeight(contentRef.current.scrollHeight);
  }, [isExpanded, post.comments]);

  const submitComment = useCallback((e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAddComment?.(post.id, text);
    setDraft('');
    if (!isExpanded) onToggleComments(post.id);
  }, [draft, post.id, onAddComment, isExpanded, onToggleComments]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: cardBg(dark) }}
    >
      {/* Header + text */}
      <div className="p-3.5 pb-2">
        <div className="flex items-center gap-2.5">
          <Avatar src={post.user?.avatar} alt={post.user?.name} dark={dark} theme={theme} />
          <div className="flex-1 min-w-0">
            <span className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</span>
            <span
              className="text-xs font-medium ml-2 cursor-default"
              title={formatExactTimestamp(post.createdAt)}
              style={{ color: theme.colors.textSecondary }}
            >
              {formatTimestamp(post.createdAt)}
            </span>
          </div>
        </div>
        {post.title && <p className="text-[0.8125rem] font-bold mt-2" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
        {post.text && <p className="text-[0.8125rem] mt-1 whitespace-pre-line leading-relaxed" style={{ color: theme.colors.textSecondary }}>{post.text}</p>}
      </div>

      {/* Images */}
      {post.image && (
        <div className="mx-3 mb-1.5 rounded-xl overflow-hidden">
          <img src={post.image} alt="post" className="w-full h-auto object-cover" />
        </div>
      )}
      {post.images && post.images.length > 0 && (
        <div className="mx-3 mb-1.5 grid grid-cols-2 gap-1.5">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" className="rounded-lg object-cover w-full h-32" />
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="px-3.5 py-1.5 flex items-center gap-0.5 border-t" style={{ borderColor: subtleBorder(dark) }}>
        {/* Upvote */}
        <button
          onClick={() => onUpvote?.(post.id)}
          aria-label="Upvote"
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all active:scale-95"
          style={{
            color: isUpvoted ? theme.colors.accent : theme.colors.textSecondary,
            backgroundColor: isUpvoted ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`) : 'transparent',
          }}
        >
          <ChevronUp className="w-3.5 h-3.5" style={isUpvoted ? { strokeWidth: 2.5 } : undefined} />
          {(post.upvotes || 0) > 0 && <span>{post.upvotes}</span>}
        </button>
        <ActionBtn active={isLiked} icon={Heart} count={post.likes || 0} onClick={() => onToggleLike?.(post.id)} label="Like" theme={theme} dark={dark} />
        <ActionBtn active={isExpanded} icon={MessageCircle} count={(post.comments || []).length} onClick={() => onToggleComments(post.id)} label="Comments" theme={theme} dark={dark} />
        <button
          onClick={() => {
            if (navigator.share) navigator.share({ title: post.title || 'Post', text: post.text });
            else navigator.clipboard.writeText(post.text || window.location.href);
          }}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full active:scale-95"
          style={{ color: theme.colors.textSecondary }}
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Comments collapse */}
      <div style={{
        maxHeight: isExpanded ? measuredHeight : 0,
        opacity: isExpanded ? 1 : 0,
        transition: 'max-height 280ms ease, opacity 220ms ease',
        overflow: 'hidden',
      }}>
        <div ref={contentRef} className="px-3.5 pb-3 space-y-2">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(post.comments || []).map(c => (
              <div key={c.id} className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[0.625rem] font-bold flex-shrink-0"
                  style={{ backgroundColor: dark ? '#333' : '#EDEAE4', color: theme.colors.textSecondary }}
                >
                  {c.name?.[0] || '?'}
                </div>
                <div className="flex-1 rounded-xl px-2.5 py-1.5" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)' }}>
                  <p className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{c.text}</p>
                </div>
              </div>
            ))}
            {(post.comments || []).length === 0 && (
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>No comments yet.</p>
            )}
          </div>
          <form onSubmit={submitComment} className="flex items-center gap-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-xs px-3 py-1.5 rounded-full outline-none"
              style={{ backgroundColor: dark ? '#333' : '#F0EDE8', color: theme.colors.textPrimary }}
            />
            <button disabled={!draft.trim()} className="p-1.5 rounded-full disabled:opacity-30" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});
PostCard.displayName = 'PostCard';
