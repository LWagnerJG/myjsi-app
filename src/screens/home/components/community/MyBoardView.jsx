import React, { useMemo } from 'react';
import { Bookmark, Heart, MessageSquare } from 'lucide-react';
import { LibraryGrid } from '../../../library/LibraryGrid.jsx';
import { INITIAL_ASSETS } from '../../../library/data.js';
import { PostMiniCard } from './PostMiniCard.jsx';

export const MyBoardView = ({ theme, dark, savedImageIds, onToggleSaveImage, posts, likedPosts, postUpvotes, onToggleLike, onUpvote, onAddComment }) => {
  const savedAssets = useMemo(() => INITIAL_ASSETS.filter(a => savedImageIds.includes(a.id)), [savedImageIds]);
  const likedPostsList = useMemo(() => (posts || []).filter(p => likedPosts && likedPosts[p.id]), [posts, likedPosts]);
  const myThreads = useMemo(() => {
    const seen = new Set();
    const result = [];
    (posts || []).forEach(p => {
      if (!seen.has(p.id) && (p.comments || []).some(c => c.name === 'You')) {
        seen.add(p.id);
        result.push(p);
      }
    });
    return result;
  }, [posts]);

  const SectionHeader = ({ label, count, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>{label}</span>
      {count > 0 && (
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: theme.colors.textSecondary }}>{count}</span>
      )}
    </div>
  );

  if (!savedAssets.length && !likedPostsList.length && !myThreads.length) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 px-8 text-center">
        <Bookmark className="w-10 h-10" style={{ color: theme.colors.textSecondary, opacity: 0.25 }} />
        <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>Your board is empty</p>
        <p className="text-xs leading-relaxed" style={{ color: theme.colors.textSecondary }}>
          Save library images with \u2665, upvote or like posts, or leave a comment \u2014 everything you interact with collects here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-2 pb-10">
      {savedAssets.length > 0 && (
        <section>
          <SectionHeader label="Saved Images" count={savedAssets.length} icon={Bookmark} />
          <LibraryGrid theme={theme} query="" savedImageIds={savedImageIds} onToggleSaveImage={onToggleSaveImage} assetsOverride={savedAssets} />
        </section>
      )}
      {likedPostsList.length > 0 && (
        <section>
          <SectionHeader label="Liked Posts" count={likedPostsList.length} icon={Heart} />
          <div className="space-y-2">
            {likedPostsList.map(p => (
              <PostMiniCard key={p.id} post={p} theme={theme} dark={dark}
                isLiked={!!likedPosts?.[p.id]} isUpvoted={!!postUpvotes?.[p.id]}
                onToggleLike={onToggleLike} onUpvote={onUpvote} onAddComment={onAddComment}
              />
            ))}
          </div>
        </section>
      )}
      {myThreads.length > 0 && (
        <section>
          <SectionHeader label="My Threads" count={myThreads.length} icon={MessageSquare} />
          <div className="space-y-2">
            {myThreads.map(p => (
              <PostMiniCard key={p.id} post={p} theme={theme} dark={dark}
                isLiked={!!likedPosts?.[p.id]} isUpvoted={!!postUpvotes?.[p.id]}
                onToggleLike={onToggleLike} onUpvote={onUpvote} onAddComment={onAddComment}
              />
            ))}
          </div>
        </section>
      )}
      <p className="text-xs text-center" style={{ color: theme.colors.textSecondary, opacity: 0.35 }}>
        Your private activity log \u2014 only visible to you.
      </p>
    </div>
  );
};
