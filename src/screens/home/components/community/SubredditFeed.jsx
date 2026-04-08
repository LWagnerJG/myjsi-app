import React, { useMemo } from 'react';
import { FeedDivider } from './FeedDivider.jsx';
import { SubredditPostCard } from './SubredditPostCard.jsx';
import { ChannelChips } from './ChannelChips.jsx';

export const SubredditFeed = ({ subreddit, allPosts, theme, dark, likedPosts, postUpvotes, onToggleLike, onUpvote, onAddComment, onSelectSubreddit }) => {

  // Sort all posts by upvotes (highest first), then by recency as tiebreaker
  const { topPosts, latestPosts } = useMemo(() => {
    const raw = (allPosts || []).filter(p => p.subreddit === subreddit.id);
    const sorted = [...raw].sort((a, b) => {
      const diff = (b.upvotes || 0) - (a.upvotes || 0);
      if (diff !== 0) return diff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    // Top 3 most-upvoted stay pinned as "Trending" (cap so Latest always has content)
    const maxTrending = Math.min(3, Math.max(0, sorted.length - 1));
    const top = sorted.filter(p => (p.upvotes || 0) > 0).slice(0, maxTrending);
    const topIds = new Set(top.map(p => p.id));
    const latest = sorted.filter(p => !topIds.has(p.id));
    return { topPosts: top, latestPosts: latest };
  }, [allPosts, subreddit.id]);

  const allVisible = [...topPosts, ...latestPosts];
  const Icon = subreddit.icon;

  return (
    <div>
      {/* Channel chips with active subreddit highlighted */}
      <ChannelChips theme={theme} dark={dark} onSelect={onSelectSubreddit} activeId={subreddit.id} />

      {/* Posts — Trending pinned up top, Latest below */}
      {!allVisible.length ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <Icon className="w-8 h-8" style={{ color: theme.colors.textSecondary, opacity: 0.2 }} />
          <p className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>No posts yet \u2014 start the conversation.</p>
        </div>
      ) : (
        <>
          {topPosts.length > 0 && (
            <>
              <FeedDivider label="Trending" dark={dark} theme={theme} first />
              <div className="space-y-3">
                {topPosts.map((post, idx) => {
                  const isLiked = !!likedPosts?.[post.id];
                  const isUpvoted = !!postUpvotes?.[post.id];
                  return (
                    <SubredditPostCard key={post.id} post={post} idx={idx} isTop
                      dark={dark} theme={theme} isLiked={isLiked} isUpvoted={isUpvoted}
                      onUpvote={onUpvote} onToggleLike={onToggleLike} onAddComment={onAddComment} />
                  );
                })}
              </div>
            </>
          )}
          {latestPosts.length > 0 && (
            <FeedDivider label="Latest" dark={dark} theme={theme} />
          )}
          {latestPosts.length > 0 && (
            <div className="space-y-3">
              {latestPosts.map(post => {
                const isLiked = !!likedPosts?.[post.id];
                const isUpvoted = !!postUpvotes?.[post.id];
                return (
                  <SubredditPostCard key={post.id} post={post}
                    dark={dark} theme={theme} isLiked={isLiked} isUpvoted={isUpvoted}
                    onUpvote={onUpvote} onToggleLike={onToggleLike} onAddComment={onAddComment} />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
