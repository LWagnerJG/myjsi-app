import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { CommunityScreen, AnnouncementsRow } from '../community/CommunityScreen.jsx';
import { INITIAL_ASSETS } from '../library/data.js';
import { ANNOUNCEMENTS } from '../community/data.js';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import {
  Monitor, Users, Heart, MessageSquare, Bookmark, ChevronUp, ChevronRight,
  Shield, Wrench, Briefcase, Star, PenTool, Building2, Sparkles,
  Info, X, Send
} from 'lucide-react';

// ─── Timestamp helpers ─────────────────────────────────────────────────────────
const formatTs = (ts) => {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts : Date.parse(ts));
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const formatExact = (ts) => {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts : Date.parse(ts));
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    + ' \u00b7 ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// ─── Hot sort (upvotes + likes weighted by recency) ────────────────────────────
const hotScore = (post) => {
  const ageH = Math.max(0, (Date.now() - (post.createdAt || Date.now())) / 3600000);
  const engagement = (post.upvotes || 0) * 2 + (post.likes || 0) + (post.comments?.length || 0) * 1.5;
  return engagement / Math.pow(ageH + 2, 1.5);
};

// ─── Subreddit definitions ─────────────────────────────────────────────────────
// role = the user-role that can see this community in production (all visible in demo)
const SUBREDDITS = [
  { id: 'dealer-designers',  name: 'Dealer Designers',   icon: PenTool,   color: '#6366f1', members: 203, role: 'Dealer Designers',  description: 'Spec workflows, material selections, CET tips, and creative problem-solving for in-house dealership designers.' },
  { id: 'dealer-principals', name: 'Dealer Principals',  icon: Building2, color: '#059669', members: 58,  role: 'Dealer Principals', description: 'Business strategy, partnership growth, and the decisions that drive dealership performance.' },
  { id: 'dealer-sales',      name: 'Dealer Sales Reps',  icon: Star,      color: '#d97706', members: 176, role: 'Dealer Sales Reps', description: 'Sales tactics, objection handling, quick wins, and what is working on the floor right now.' },
  { id: 'rep-principals',    name: 'Rep Principals',     icon: Briefcase, color: '#7c3aed', members: 31,  role: 'Rep Principals',    description: 'Dealer development, territory strategy, and running a rep firm at the highest level.' },
  { id: 'reps',              name: 'Reps',               icon: Users,     color: '#0ea5e9', members: 89,  role: 'All Reps',          description: 'The general rep community \u2014 vertical markets, new opportunities, showrooms, and field intelligence.' },
  { id: 'new-reps',          name: 'New Reps!',          icon: Sparkles,  color: '#f43f5e', members: 24,  role: 'New Reps',          description: "First year? You're not alone. Questions welcome, experience encouraged. Learn fast, grow faster." },
  { id: 'jsiers',            name: "JSI'ers",            icon: Shield,    color: '#0f766e', members: 47,  role: 'JSI Team',          description: 'For JSI employees \u2014 internal updates, events, and cross-team conversations.' },
  { id: 'cet-designers',     name: 'CET Designers',      icon: Monitor,   color: '#8b5cf6', members: 112, role: 'CET Users',         description: 'Configurra/CET symbol sharing, workarounds, rendering tips, and JSI-specific configuration advice.' },
  { id: 'install-tips',      name: 'Install Tips',       icon: Wrench,    color: '#b45309', members: 67,  role: 'Install Crews',     description: 'Field installation knowledge \u2014 sequencing, damage prevention, IT coordination, and hard-won lessons.' },
];

// ─── Avatar helper ─────────────────────────────────────────────────────────────
const MiniAvatar = ({ src, name, dark, size = 28 }) => (
  <div
    className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden text-[10px] font-bold"
    style={{ width: size, height: size, backgroundColor: dark ? '#444' : '#E3E0D8' }}
  >
    {src
      ? <img src={src} alt={name} className="w-full h-full object-cover" />
      : <span style={{ color: dark ? '#aaa' : '#888' }}>{(name || '?')[0]}</span>}
  </div>
);

// ─── PostDetailSheet ───────────────────────────────────────────────────────────
const PostDetailSheet = ({ post, theme, dark, isLiked, isUpvoted, onToggleLike, onUpvote, onAddComment, onClose }) => {
  const [draft, setDraft] = useState('');
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
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: dark ? '#1e1e1e' : '#fff', border: `1px solid ${theme.colors.border}`, maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <MiniAvatar src={post.user?.avatar} name={post.user?.name} dark={dark} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</p>
              <p className="text-[10px]" title={formatExact(post.createdAt)} style={{ color: theme.colors.textSecondary }}>{formatTs(post.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
            <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
          {post.title && <p className="text-[15px] font-bold" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
          {post.text && <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: theme.colors.textSecondary }}>{post.text}</p>}
          {post.image && <img src={post.image} alt="post" className="w-full rounded-2xl object-cover" />}
          {(post.images || []).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((img, i) => <img key={i} src={img} alt="" className="w-full h-32 rounded-xl object-cover" />)}
            </div>
          )}

          {/* Engagement row */}
          <div className="flex items-center gap-1 py-2 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => onUpvote?.(post.id)}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{ color: isUpvoted ? '#f97316' : theme.colors.textSecondary, backgroundColor: isUpvoted ? (dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)') : 'transparent' }}
            >
              <ChevronUp className="w-4 h-4" /> {post.upvotes || 0}
            </button>
            <button
              onClick={() => onToggleLike?.(post.id)}
              className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{ color: isLiked ? theme.colors.accent : theme.colors.textSecondary, backgroundColor: isLiked ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`) : 'transparent' }}
            >
              <Heart className="w-4 h-4" style={isLiked ? { fill: theme.colors.accent } : undefined} /> {post.likes || 0}
            </button>
            <span className="text-[11px] ml-auto" style={{ color: theme.colors.textSecondary }}>
              {localComments.length} comment{localComments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Comments thread */}
          <div className="space-y-2 pb-2">
            {localComments.map(c => (
              <div key={c.id} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: dark ? '#333' : '#EDEAE4', color: theme.colors.textSecondary }}>
                  {c.name?.[0] || '?'}
                </div>
                <div className="flex-1 rounded-xl px-2.5 py-1.5" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                  <p className="text-[11px] font-semibold" style={{ color: theme.colors.textPrimary }}>{c.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>{c.text}</p>
                </div>
              </div>
            ))}
            {!localComments.length && (
              <p className="text-[12px] text-center py-4" style={{ color: theme.colors.textSecondary }}>No comments yet \u2014 be the first.</p>
            )}
          </div>
        </div>

        {/* Comment input */}
        <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3 border-t flex-shrink-0" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Add a comment\u2026"
            className="flex-1 text-[13px] px-3 py-2 rounded-full outline-none"
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
    </div>,
    document.body
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
const FeedDivider = ({ label, dark, theme }) => (
  <div className="flex items-center gap-2.5 my-4">
    <div className="flex-1 h-px" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
    <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>{label}</span>
    <div className="flex-1 h-px" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
  </div>
);

// ─── SubredditFeed ─────────────────────────────────────────────────────────────
const SubredditFeed = ({ subreddit, allPosts, theme, dark, likedPosts, postUpvotes, onToggleLike, onUpvote, onAddComment }) => {
  const [detailPost, setDetailPost] = useState(null);

  // Smart split: top 3 most-engaged posts (that have upvotes) stay pinned,
  // remainder sorted newest-first below a "Latest" divider.
  // hotScore naturally decays with age so high-voted old posts eventually fall to Latest.
  const { topPosts, latestPosts } = useMemo(() => {
    const raw = (allPosts || []).filter(p => p.subreddit === subreddit.id);
    const withScore = raw.map(p => ({ p, score: hotScore(p) }));
    const eligible = withScore
      .filter(({ p }) => (p.upvotes || 0) > 0)
      .sort((a, b) => b.score - a.score);
    const top = eligible.slice(0, 3).map(({ p }) => p);
    const topIds = new Set(top.map(p => p.id));
    const latest = raw.filter(p => !topIds.has(p.id)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { topPosts: top, latestPosts: latest };
  }, [allPosts, subreddit.id]);

  const allVisible = [...topPosts, ...latestPosts];
  const Icon = subreddit.icon;

  return (
    <div>
      {/* Subreddit header — minimal, no colored icon box */}
      <div className="pb-3 mb-4 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
        <p className="text-[14px] font-bold" style={{ color: theme.colors.textPrimary }}>{subreddit.name}</p>
        <p className="text-[11px] leading-snug mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>{subreddit.description}</p>
        <p className="text-[10px] mt-1" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
          {subreddit.members} members
        </p>
      </div>

      {/* Posts — Trending pinned up top, Latest below */}
      {!allVisible.length ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <Icon className="w-8 h-8" style={{ color: theme.colors.textSecondary, opacity: 0.2 }} />
          <p className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>No posts yet \u2014 start the conversation.</p>
        </div>
      ) : (
        <>
          {topPosts.length > 0 && (
            <>
              {/* Trending section header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Trending</span>
                <div className="flex-1 h-px" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
              </div>
              <div className="space-y-3">
                {topPosts.map((post, idx) => {
                  const isLiked = !!likedPosts?.[post.id];
                  const isUpvoted = !!postUpvotes?.[post.id];
                  return (
                    <SubredditPostCard key={post.id} post={post} idx={idx} isTop
                      dark={dark} theme={theme} isLiked={isLiked} isUpvoted={isUpvoted}
                      onOpen={() => setDetailPost(post)} onUpvote={onUpvote} onToggleLike={onToggleLike} />
                  );
                })}
              </div>
            </>
          )}
          {topPosts.length > 0 && latestPosts.length > 0 && (
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
                    onOpen={() => setDetailPost(post)} onUpvote={onUpvote} onToggleLike={onToggleLike} />
                );
              })}
            </div>
          )}
        </>
      )}

      {detailPost && (
        <PostDetailSheet
          post={detailPost}
          theme={theme}
          dark={dark}
          isLiked={!!likedPosts?.[detailPost.id]}
          isUpvoted={!!postUpvotes?.[detailPost.id]}
          onToggleLike={onToggleLike}
          onUpvote={onUpvote}
          onAddComment={onAddComment}
          onClose={() => setDetailPost(null)}
        />
      )}
    </div>
  );
};

// ─── SubredditPostCard ─────────────────────────────────────────────────────────
const SubredditPostCard = ({ post, idx, isTop, dark, theme, isLiked, isUpvoted, onOpen, onUpvote, onToggleLike }) => (
  <button
    onClick={onOpen}
    className="w-full rounded-2xl overflow-hidden text-left active:scale-[0.99] transition-transform"
    style={{ backgroundColor: dark ? '#2A2A2A' : '#FFFFFF', border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}
  >
    <div className="p-3.5 pb-2">
      <div className="flex items-center gap-2 mb-1.5">
        {isTop && typeof idx === 'number' && (
          <span className="text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: dark ? 'rgba(249,115,22,0.18)' : 'rgba(249,115,22,0.10)', color: '#f97316' }}>
            {idx + 1}
          </span>
        )}
        <MiniAvatar src={post.user?.avatar} name={post.user?.name} dark={dark} />
        <span className="text-[12px] font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</span>
        <span className="text-[10px] ml-auto cursor-default" title={formatExact(post.createdAt)} style={{ color: theme.colors.textSecondary }}>{formatTs(post.createdAt)}</span>
      </div>
      {post.title && <p className="text-[13px] font-bold mb-1" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
      <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: theme.colors.textSecondary }}>{post.text}</p>
      {post.image && <img src={post.image} alt="post" className="w-full rounded-xl mt-2 object-cover max-h-40" />}
    </div>
    <div className="px-3 py-2 flex items-center gap-2 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} onClick={e => e.stopPropagation()}>
      <button onClick={(e) => { e.stopPropagation(); onUpvote?.(post.id); }} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full transition-all" style={{ color: isUpvoted ? '#f97316' : theme.colors.textSecondary, backgroundColor: isUpvoted ? (dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)') : 'transparent' }}>
        <ChevronUp className="w-3 h-3" /> {post.upvotes || 0}
      </button>
      <button onClick={(e) => { e.stopPropagation(); onToggleLike?.(post.id); }} className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-all" style={{ color: isLiked ? theme.colors.accent : theme.colors.textSecondary, backgroundColor: isLiked ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`) : 'transparent' }}>
        <Heart className="w-3 h-3" style={isLiked ? { fill: theme.colors.accent } : undefined} /> {post.likes || 0}
      </button>
      <span className="flex items-center gap-1 text-[11px] ml-auto" style={{ color: theme.colors.textSecondary }}>
        <MessageSquare className="w-3 h-3" /> {(post.comments || []).length}
      </span>
    </div>
  </button>
);

// ─── CommunitiesSheet ─────────────────────────────────────────────────────────
const CommunitiesSheet = ({ theme, dark, onSelect, onClose, activeSubredditId }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(8px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{ background: dark ? '#1c1c1c' : '#fafafa', maxHeight: '82dvh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Drag handle */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0" style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <div>
            <p className="text-[16px] font-bold" style={{ color: theme.colors.textPrimary }}>Communities</p>
            <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
              Role-gated in production &middot; all visible in this preview
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
            <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          </button>
        </div>

        {/* Subreddit list — no visible scrollbar */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '2.5rem' }}>
          {SUBREDDITS.map((sub) => {
            const Icon = sub.icon;
            return (
              <button
                key={sub.id}
                onClick={() => onSelect(sub)}
                className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left active:opacity-60"
                style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: sub.id === activeSubredditId ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.09)') : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)') }}
                >
                  <Icon className="w-4 h-4" style={{ color: theme.colors.textPrimary, opacity: sub.id === activeSubredditId ? 0.9 : 0.45 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>{sub.name}</p>
                  <p className="text-[11.5px] mt-0.5 line-clamp-2 leading-snug" style={{ color: theme.colors.textSecondary }}>{sub.description}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  {sub.id === activeSubredditId && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: theme.colors.accent }} />
                  )}
                  <span className="text-[11px]" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>{sub.members}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── ChannelAwareFeed ──────────────────────────────────────────────────────────
const ChannelAwareFeed = ({
  theme, dark, posts, polls, likedPosts, pollChoices, postUpvotes,
  onToggleLike, onUpvote, onPollVote, onAddComment, openCreateContentModal, query
}) => {
  const [activeSubreddit, setActiveSubreddit] = useState(null);
  const [showCommunitiesSheet, setShowCommunitiesSheet] = useState(false);
  const [trendingDetail, setTrendingDetail] = useState(null);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(new Set());
  const dismissAnnouncement = useCallback(id => setDismissedAnnouncements(prev => new Set([...prev, id])), []);

  const topTrending = useMemo(() => {
    const allP = (posts || []).filter(p => (p.upvotes || 0) > 0);
    return [...allP].sort((a, b) => hotScore(b) - hotScore(a)).slice(0, 3);
  }, [posts]);
  const trendingIds = useMemo(() => new Set(topTrending.map(p => p.id)), [topTrending]);
  const latestPosts = useMemo(() =>
    (posts || []).filter(p => !p.subreddit && !trendingIds.has(p.id))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [posts, trendingIds]
  );
  const visibleAnnouncements = useMemo(() =>
    ANNOUNCEMENTS.filter(a => !dismissedAnnouncements.has(a.id)),
    [dismissedAnnouncements]
  );

  return (
    <>
      {/* ── Persistent nav strip: left = back/location, right = Communities ── */}
      <div className="flex items-center justify-between mb-3">
        {activeSubreddit ? (
          <button
            onClick={() => setActiveSubreddit(null)}
            className="flex items-center gap-1 text-[12px] font-semibold transition-opacity active:opacity-50 min-w-0 max-w-[60%]"
            style={{ color: theme.colors.textPrimary }}
          >
            <ChevronRight
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ transform: 'rotate(180deg)', color: theme.colors.textSecondary }}
            />
            <span className="truncate">{activeSubreddit.name}</span>
          </button>
        ) : <div />}
        <button
          onClick={() => setShowCommunitiesSheet(true)}
          className="flex items-center gap-1 text-[11.5px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0 transition-all active:scale-95"
          style={{
            backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.055)',
            color: activeSubreddit ? theme.colors.textSecondary : theme.colors.textPrimary,
          }}
        >
          {activeSubreddit ? 'Switch' : 'Communities'}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* ── Content ── */}
      {activeSubreddit ? (
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
      ) : (
        <>
          {/* Announcements */}
          {visibleAnnouncements.length > 0 && (
            <div className="-mx-4 mb-3">
              <AnnouncementsRow
                announcements={visibleAnnouncements}
                theme={theme}
                dark={dark}
                onDismiss={dismissAnnouncement}
              />
            </div>
          )}

          {/* Trending top 3 */}
          {topTrending.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: theme.colors.textSecondary, opacity: 0.4 }}>Trending</span>
                <div className="flex-1 h-px" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
              </div>
              <div className="space-y-3">
                {topTrending.map((post, idx) => (
                  <SubredditPostCard
                    key={post.id} post={post} idx={idx} isTop
                    dark={dark} theme={theme}
                    isLiked={!!likedPosts?.[post.id]}
                    isUpvoted={!!postUpvotes?.[post.id]}
                    onOpen={() => setTrendingDetail(post)}
                    onUpvote={onUpvote}
                    onToggleLike={onToggleLike}
                  />
                ))}
              </div>
            </>
          )}

          {/* Latest: chronological general posts + polls */}
          {(latestPosts.length > 0 || (polls || []).length > 0) && (
            <>
              <FeedDivider label="Latest" dark={dark} theme={theme} />
              <CommunityScreen
                theme={theme}
                posts={latestPosts}
                polls={polls}
                likedPosts={likedPosts}
                pollChoices={pollChoices}
                postUpvotes={postUpvotes}
                onToggleLike={onToggleLike}
                onUpvote={onUpvote}
                onPollVote={onPollVote}
                onAddComment={onAddComment}
                openCreateContentModal={openCreateContentModal}
                embedMode
                externalQuery={query}
              />
            </>
          )}
        </>
      )}

      {trendingDetail && (
        <PostDetailSheet
          post={trendingDetail} theme={theme} dark={dark}
          isLiked={!!likedPosts?.[trendingDetail.id]}
          isUpvoted={!!postUpvotes?.[trendingDetail.id]}
          onToggleLike={onToggleLike} onUpvote={onUpvote}
          onAddComment={onAddComment} onClose={() => setTrendingDetail(null)}
        />
      )}

      {showCommunitiesSheet && (
        <CommunitiesSheet
          theme={theme} dark={dark}
          activeSubredditId={activeSubreddit?.id}
          onSelect={(sub) => { setActiveSubreddit(sub); setShowCommunitiesSheet(false); }}
          onClose={() => setShowCommunitiesSheet(false)}
        />
      )}
    </>
  );
};

// ─── PostMiniCard — clickable compact card for My Board ────────────────────────
const PostMiniCard = ({ post, theme, dark, isLiked, isUpvoted, onToggleLike, onUpvote, onAddComment }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl p-3.5 active:scale-[0.98] transition-transform"
        style={{ backgroundColor: dark ? '#222' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <MiniAvatar src={post.user?.avatar} name={post.user?.name} dark={dark} size={24} />
          <span className="text-[12px] font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</span>
          <span className="text-[10px] ml-auto" title={formatExact(post.createdAt)} style={{ color: theme.colors.textSecondary }}>{formatTs(post.createdAt)}</span>
        </div>
        {post.title && <p className="text-[12px] font-semibold mb-0.5" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
        <p className="text-[12px] line-clamp-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>{post.text}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: isUpvoted ? '#f97316' : theme.colors.textSecondary }}>
            <ChevronUp className="w-3 h-3" /> {post.upvotes || 0}
          </span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: isLiked ? theme.colors.accent : theme.colors.textSecondary }}>
            <Heart className="w-3 h-3" style={isLiked ? { fill: theme.colors.accent } : undefined} /> {post.likes || 0}
          </span>
          <span className="flex items-center gap-1 text-[10px] ml-auto" style={{ color: theme.colors.textSecondary }}>
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

// ─── My Board ──────────────────────────────────────────────────────────────────
const MyBoardView = ({ theme, dark, savedImageIds, onToggleSaveImage, posts, likedPosts, postUpvotes, onToggleLike, onUpvote, onAddComment }) => {
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
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>{label}</span>
      {count > 0 && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: theme.colors.textSecondary }}>{count}</span>
      )}
    </div>
  );

  if (!savedAssets.length && !likedPostsList.length && !myThreads.length) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 px-8 text-center">
        <Bookmark className="w-10 h-10" style={{ color: theme.colors.textSecondary, opacity: 0.25 }} />
        <p className="text-[14px] font-semibold" style={{ color: theme.colors.textPrimary }}>Your board is empty</p>
        <p className="text-[12px] leading-relaxed" style={{ color: theme.colors.textSecondary }}>
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
      <p className="text-[10px] text-center" style={{ color: theme.colors.textSecondary, opacity: 0.35 }}>
        Your private activity log \u2014 only visible to you.
      </p>
    </div>
  );
};

// ─── Main Layout ───────────────────────────────────────────────────────────────
export const CommunityLibraryLayout = ({
  theme,
  posts, polls, likedPosts, pollChoices, postUpvotes = {},
  onToggleLike, onUpvote, onPollVote, onAddComment, openCreateContentModal,
  savedImageIds = [], onToggleSaveImage,
}) => {
  const dark = isDarkTheme(theme);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasBoardContent = useMemo(() => {
    const hasComments = (posts || []).some(p => (p.comments || []).some(c => c.name === 'You'));
    return savedImageIds.length > 0 || Object.keys(likedPosts || {}).length > 0 || hasComments;
  }, [savedImageIds, likedPosts, posts]);

  const TABS = useMemo(() => hasBoardContent ? ['Community', 'Library', 'My Board'] : ['Community', 'Library'], [hasBoardContent]);

  const [activeTab, setActiveTab] = useState('community');
  const [query, setQuery] = useState('');
  const scrollPositions = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    if (!hasBoardContent && activeTab === 'my board') setActiveTab('community');
  }, [hasBoardContent, activeTab]);

  const switchTab = useCallback((tab) => {
    if (tab === activeTab) return;
    if (containerRef.current) scrollPositions.current[activeTab] = containerRef.current.scrollTop;
    setActiveTab(tab);
    requestAnimationFrame(() => { if (containerRef.current) containerRef.current.scrollTop = scrollPositions.current[tab] || 0; });
  }, [activeTab]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); document.getElementById('community-main-search')?.querySelector('input')?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const tr = prefersReducedMotion ? 'none' : 'opacity 200ms ease, transform 200ms ease';
  const tabStyle = (isActive) => ({
    color: isActive ? theme.colors.textPrimary : (dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'),
    fontWeight: isActive ? 700 : 500,
    borderBottom: isActive ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
  });
  const paneStyle = (name) => activeTab === name
    ? { position: 'relative', opacity: 1, transform: 'translateX(0)', transition: tr, pointerEvents: 'auto' }
    : { position: 'absolute', inset: 0, opacity: 0, transform: 'translateX(16px)', transition: tr, pointerEvents: 'none' };

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-shrink-0 px-4" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-lg mx-auto w-full">
          <div className="flex items-center gap-0.5 pt-1">
            {TABS.map(tab => (
              <button key={tab} onClick={() => switchTab(tab.toLowerCase())} className="text-[14px] px-3 py-2 transition-all" style={tabStyle(activeTab === tab.toLowerCase())}>
                {tab}
              </button>
            ))}
            <button onClick={openCreateContentModal} className="ml-auto h-8 px-4 rounded-full text-[12px] font-semibold transition-all active:scale-95" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
              + Post
            </button>
          </div>
          {(activeTab === 'community' || activeTab === 'library') && (
            <div className="mt-2 mb-1">
              <StandardSearchBar id="community-main-search" value={query} onChange={setQuery} placeholder={activeTab === 'community' ? 'Search posts, people, tags\u2026' : 'Search library'} theme={theme} />
            </div>
          )}
          {activeTab === 'my board' && <div className="mb-2" />}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <div className="mx-auto w-full max-w-lg px-4" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>

            <div style={paneStyle('community')}>
              <ChannelAwareFeed
                theme={theme} dark={dark} posts={posts} polls={polls}
                likedPosts={likedPosts} pollChoices={pollChoices} postUpvotes={postUpvotes}
                onToggleLike={onToggleLike} onUpvote={onUpvote} onPollVote={onPollVote}
                onAddComment={onAddComment} openCreateContentModal={openCreateContentModal} query={query}
              />
            </div>

            <div style={paneStyle('library')}>
              <LibraryGrid theme={theme} query={query} savedImageIds={savedImageIds} onToggleSaveImage={onToggleSaveImage} />
            </div>

            {hasBoardContent && (
              <div style={paneStyle('my board')}>
                <MyBoardView
                  theme={theme} dark={dark}
                  savedImageIds={savedImageIds} onToggleSaveImage={onToggleSaveImage}
                  posts={posts} likedPosts={likedPosts} postUpvotes={postUpvotes}
                  onToggleLike={onToggleLike} onUpvote={onUpvote} onAddComment={onAddComment}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLibraryLayout;
