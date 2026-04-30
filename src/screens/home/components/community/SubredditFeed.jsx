import React, { useMemo } from 'react';
import { FeedDivider } from './FeedDivider.jsx';
import { SubredditPostCard } from './SubredditPostCard.jsx';

export const SubredditFeed = ({ subreddit, allPosts, theme, dark, likedPosts, postUpvotes, onToggleLike, onUpvote, onAddComment, query }) => {
  const { topPosts, latestPosts } = useMemo(() => {
    const raw = (allPosts || []).filter((post) => post.subreddit === subreddit.id);
    const q = (query || '').trim().toLowerCase();
    const filtered = q
      ? raw.filter((post) => [post.user?.name, post.title, post.text, ...(post.comments || []).map((comment) => comment.text)].filter(Boolean).join(' ').toLowerCase().includes(q))
      : raw;
    const sorted = [...filtered].sort((a, b) => {
      const diff = (b.upvotes || 0) - (a.upvotes || 0);
      if (diff !== 0) return diff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    const maxTrending = Math.min(3, Math.max(0, sorted.length - 1));
    const top = sorted.filter((post) => (post.upvotes || 0) > 0).slice(0, maxTrending);
    const topIds = new Set(top.map((post) => post.id));
    const latest = sorted.filter((post) => !topIds.has(post.id));
    return { topPosts: top, latestPosts: latest };
  }, [allPosts, query, subreddit.id]);

  const allVisible = [...topPosts, ...latestPosts];
  const Icon = subreddit.icon;

  return (
    <div>
      {!allVisible.length ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <Icon className="w-8 h-8" style={{ color: theme.colors.textSecondary, opacity: 0.2 }} />
          <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{query?.trim() ? 'No posts match this search.' : 'No posts yet - start the conversation.'}</p>
        </div>
      ) : (
        <>
          {topPosts.length > 0 && (
            <>
              <FeedDivider label="Trending" theme={theme} first />
              <div className="space-y-3">
                {topPosts.map((post, idx) => {
                  const isLiked = !!likedPosts?.[post.id];
                  const isUpvoted = !!postUpvotes?.[post.id];
                  return (
                    <SubredditPostCard
                      key={post.id}
                      post={post}
                      idx={idx}
                      isTop
                      dark={dark}
                      theme={theme}
                      isLiked={isLiked}
                      isUpvoted={isUpvoted}
                      onUpvote={onUpvote}
                      onToggleLike={onToggleLike}
                      onAddComment={onAddComment}
                    />
                  );
                })}
              </div>
            </>
          )}
          {latestPosts.length > 0 && (
            <FeedDivider label="Latest" theme={theme} />
          )}
          {latestPosts.length > 0 && (
            <div className="space-y-3">
              {latestPosts.map((post) => {
                const isLiked = !!likedPosts?.[post.id];
                const isUpvoted = !!postUpvotes?.[post.id];
                return (
                  <SubredditPostCard
                    key={post.id}
                    post={post}
                    dark={dark}
                    theme={theme}
                    isLiked={isLiked}
                    isUpvoted={isUpvoted}
                    onUpvote={onUpvote}
                    onToggleLike={onToggleLike}
                    onAddComment={onAddComment}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
