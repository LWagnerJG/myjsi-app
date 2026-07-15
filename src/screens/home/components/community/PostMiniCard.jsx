import React, { useState } from 'react';
import { ChevronUp, Heart, MessageSquare } from 'lucide-react';
import { MiniAvatar } from './MiniAvatar.jsx';
import { PostDetailSheet } from './PostDetailSheet.jsx';
import { formatTs, formatExact } from './utils.js';

export const PostMiniCard = ({ post, theme, dark, isLiked, isUpvoted, onToggleLike, onUpvote, onAddComment }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl p-3.5 active:scale-[0.98] transition-transform"
        style={{ backgroundColor: dark ? '#222' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'}` }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <MiniAvatar src={post.user?.avatar} name={post.user?.name} dark={dark} size={24} />
          <span className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</span>
          <span className="text-xs ml-auto" title={formatExact(post.createdAt)} style={{ color: theme.colors.textSecondary }}>{formatTs(post.createdAt)}</span>
        </div>
        {post.title && <p className="text-xs font-semibold mb-0.5" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>{post.text}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs" style={{ color: isUpvoted ? '#f97316' : theme.colors.textSecondary }}>
            <ChevronUp className="w-3 h-3" /> {post.upvotes || 0}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: isLiked ? theme.colors.accent : theme.colors.textSecondary }}>
            <Heart className="w-3 h-3" style={isLiked ? { fill: theme.colors.accent } : undefined} /> {post.likes || 0}
          </span>
          <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: theme.colors.textSecondary }}>
            <MessageSquare className="w-3 h-3" /> {(post.comments || []).length}
          </span>
        </div>
      </button>
      {open && (
        <PostDetailSheet
          post={post}
          theme={theme}
          dark={dark}
          isLiked={isLiked}
          isUpvoted={isUpvoted}
          onToggleLike={onToggleLike}
          onUpvote={onUpvote}
          onAddComment={onAddComment}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
