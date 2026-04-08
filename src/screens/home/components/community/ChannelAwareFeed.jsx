import React, { useMemo } from 'react';
import { PollCard } from '../../../community/components/community/PollCard.jsx';
import { SubredditFeed } from './SubredditFeed.jsx';
import { SubredditPostCard } from './SubredditPostCard.jsx';
import { FeedDivider } from './FeedDivider.jsx';
import { ChannelChips } from './ChannelChips.jsx';

export const ChannelAwareFeed = ({
  theme, dark, posts, polls, likedPosts, pollChoices, postUpvotes,
  onToggleLike, onUpvote, onPollVote, onAddComment, query,
  activeSubreddit, onSelectSubreddit,
}) => {

  // Split general feed into Trending (top 3 by upvotes) + Latest (everything else by recency)
  const { trendingFeed, latestFeed } = useMemo(() => {
    const now = Date.now();
    const timeSafe = (x) => (typeof x.createdAt === 'number' ? x.createdAt : now);
    const all = [
      ...(posts || []).filter(p => !p.subreddit).map(p => ({ ...p, _type: 'post', createdAt: timeSafe(p) })),
      ...(polls || []).filter(p => !p.subreddit).map(p => ({ ...p, _type: 'poll', createdAt: timeSafe(p) })),
    ];
    const q = (query || '').trim().toLowerCase();
    const filtered = q
      ? all.filter(item => [item.user?.name, item.text, item.title, item.question, ...(item.options || []).map(o => o.text)].filter(Boolean).join(' ').toLowerCase().includes(q))
      : all;
    // Trending: top 3 by upvotes
    const byUpvotes = [...filtered].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0) || (b.createdAt - a.createdAt));
    const trending = byUpvotes.filter(p => (p.upvotes || 0) > 0).slice(0, 3);
    const trendingIds = new Set(trending.map(p => p.id));
    // Latest: everything else by recency
    const latest = [...filtered].filter(p => !trendingIds.has(p.id)).sort((a, b) => b.createdAt - a.createdAt);
    return { trendingFeed: trending, latestFeed: latest };
  }, [posts, polls, query]);

  // ── Drilled-in channel view ──
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
        onSelectSubreddit={onSelectSubreddit}
      />
    );
  }

  // ── General community feed ──
  const renderItem = (item) => {
    if (item._type === 'poll') {
      return <PollCard key={`poll-${item.id}`} poll={item} theme={theme} dark={dark} votedOption={pollChoices?.[item.id]} onPollVote={onPollVote} />;
    }
    return (
      <SubredditPostCard key={item.id} post={item}
        dark={dark} theme={theme}
        isLiked={!!likedPosts?.[item.id]} isUpvoted={!!postUpvotes?.[item.id]}
        onUpvote={onUpvote} onToggleLike={onToggleLike} onAddComment={onAddComment} />
    );
  };

  const hasAnything = trendingFeed.length > 0 || latestFeed.length > 0;

  return (
    <div>
      {/* Channel chips */}
      <ChannelChips theme={theme} dark={dark} onSelect={onSelectSubreddit} activeId={null} />

      {!hasAnything ? (
        <div className="text-center text-[0.8125rem] pt-16" style={{ color: theme.colors.textSecondary }}>No content found.</div>
      ) : (
        <>
          {trendingFeed.length > 0 && (
            <>
              <FeedDivider label="Trending" dark={dark} theme={theme} first />
              <div className="space-y-3">{trendingFeed.map(renderItem)}</div>
            </>
          )}
          {latestFeed.length > 0 && (
            <>
              <FeedDivider label="Latest" dark={dark} theme={theme} />
              <div className="space-y-3">{latestFeed.map(renderItem)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
};
