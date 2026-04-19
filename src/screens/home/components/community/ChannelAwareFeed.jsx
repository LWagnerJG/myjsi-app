import React, { useMemo } from 'react';
import { PollCard } from '../../../community/components/community/PollCard.jsx';
import { SubredditFeed } from './SubredditFeed.jsx';
import { SubredditPostCard } from './SubredditPostCard.jsx';
import { FeedDivider } from './FeedDivider.jsx';

export const ChannelAwareFeed = ({
  theme, dark, posts, polls, likedPosts, pollChoices, postUpvotes,
  onToggleLike, onUpvote, onPollVote, onAddComment, query,
  activeSubreddit,
}) => {
  const { trendingFeed, latestFeed } = useMemo(() => {
    const now = Date.now();
    const timeSafe = (item) => (typeof item.createdAt === 'number' ? item.createdAt : now);
    const all = [
      ...(posts || []).filter((post) => !post.subreddit).map((post) => ({ ...post, _type: 'post', createdAt: timeSafe(post) })),
      ...(polls || []).filter((poll) => !poll.subreddit).map((poll) => ({ ...poll, _type: 'poll', createdAt: timeSafe(poll) })),
    ];
    const q = (query || '').trim().toLowerCase();
    const filtered = q
      ? all.filter((item) => [item.user?.name, item.text, item.title, item.question, ...(item.options || []).map((option) => option.text)].filter(Boolean).join(' ').toLowerCase().includes(q))
      : all;
    const byUpvotes = [...filtered].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0) || (b.createdAt - a.createdAt));
    const trending = byUpvotes.filter((item) => (item.upvotes || 0) > 0).slice(0, 3);
    const trendingIds = new Set(trending.map((item) => item.id));
    const latest = [...filtered].filter((item) => !trendingIds.has(item.id)).sort((a, b) => b.createdAt - a.createdAt);
    return { trendingFeed: trending, latestFeed: latest };
  }, [posts, polls, query]);

  if (activeSubreddit) {
    return (
      <SubredditFeed
        subreddit={activeSubreddit}
        allPosts={posts}
        theme={theme}
        dark={dark}
        likedPosts={likedPosts}
        postUpvotes={postUpvotes}
        onToggleLike={onToggleLike}
        onUpvote={onUpvote}
        onAddComment={onAddComment}
      />
    );
  }

  const renderItem = (item) => {
    if (item._type === 'poll') {
      return <PollCard key={`poll-${item.id}`} poll={item} theme={theme} dark={dark} votedOption={pollChoices?.[item.id]} onPollVote={onPollVote} />;
    }

    return (
      <SubredditPostCard
        key={item.id}
        post={item}
        dark={dark}
        theme={theme}
        isLiked={!!likedPosts?.[item.id]}
        isUpvoted={!!postUpvotes?.[item.id]}
        onUpvote={onUpvote}
        onToggleLike={onToggleLike}
        onAddComment={onAddComment}
      />
    );
  };

  const hasAnything = trendingFeed.length > 0 || latestFeed.length > 0;

  return (
    <div>
      {!hasAnything ? (
        <div className="text-center text-sm pt-16" style={{ color: theme.colors.textSecondary }}>No content found.</div>
      ) : (
        <>
          {trendingFeed.length > 0 && (
            <>
              <FeedDivider label="Trending" theme={theme} first />
              <div className="space-y-3">{trendingFeed.map(renderItem)}</div>
            </>
          )}
          {latestFeed.length > 0 && (
            <>
              <FeedDivider label="Latest" theme={theme} />
              <div className="space-y-3">{latestFeed.map(renderItem)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
};
