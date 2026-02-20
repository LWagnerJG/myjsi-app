import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { PollCard } from '../community/CommunityScreen.jsx';
import { INITIAL_ASSETS } from '../library/data.js';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import {
  Monitor, Users, Heart, MessageSquare, Bookmark, ChevronUp,
  Shield, Wrench, Briefcase, Star, PenTool, Building2, Sparkles,
  X, Send, Download, Share2, ZoomIn
} from 'lucide-react';
import { hapticMedium } from '../../utils/haptics.js';

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

// ─── Subreddit definitions ─────────────────────────────────────────────────────
// role = the user-role that can see this community in production (all visible in demo)
const SUBREDDITS = [
  { id: 'dealer-designers',  name: 'Dealer Designers',   icon: PenTool,   color: '#6A6762', members: 203, role: 'Dealer Designers',  description: 'Spec workflows, material selections, CET tips, and creative problem-solving for in-house dealership designers.' },
  { id: 'dealer-principals', name: 'Dealer Principals',  icon: Building2, color: '#4A7C59', members: 58,  role: 'Dealer Principals', description: 'Business strategy, partnership growth, and the decisions that drive dealership performance.' },
  { id: 'dealer-sales',      name: 'Dealer Sales Reps',  icon: Star,      color: '#C4956A', members: 176, role: 'Dealer Sales Reps', description: 'Sales tactics, objection handling, quick wins, and what is working on the floor right now.' },
  { id: 'rep-principals',    name: 'Rep Principals',     icon: Briefcase, color: '#5B7B8C', members: 31,  role: 'Rep Principals',    description: 'Dealer development, territory strategy, and running a rep firm at the highest level.' },
  { id: 'reps',              name: 'Reps',               icon: Users,     color: '#8C7B63', members: 89,  role: 'All Reps',          description: 'The general rep community \u2014 vertical markets, new opportunities, showrooms, and field intelligence.' },
  { id: 'new-reps',          name: 'New Reps!',          icon: Sparkles,  color: '#9B8574', members: 24,  role: 'New Reps',          description: "First year? You're not alone. Questions welcome, experience encouraged. Learn fast, grow faster." },
  { id: 'jsiers',            name: "JSI'ers",            icon: Shield,    color: '#4A6258', members: 47,  role: 'JSI Team',          description: 'For JSI employees \u2014 internal updates, events, and cross-team conversations.' },
  { id: 'cet-designers',     name: 'CET Designers',      icon: Monitor,   color: '#6B7B6A', members: 112, role: 'CET Users',         description: 'Configurra/CET symbol sharing, workarounds, rendering tips, and JSI-specific configuration advice.' },
  { id: 'install-tips',      name: 'Install Tips',       icon: Wrench,    color: '#7A6E5D', members: 67,  role: 'Install Crews',     description: 'Field installation knowledge \u2014 sequencing, damage prevention, IT coordination, and hard-won lessons.' },
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

// ─── ImageLightbox ─────────────────────────────────────────────────────────────
const ImageLightbox = ({ src, alt, onClose }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleDownload = useCallback(async () => {
    try {
      const resp = await fetch(src, { mode: 'cors' });
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (alt || 'image').replace(/[^a-zA-Z0-9_-]/g, '_') + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, '_blank');
    }
  }, [src, alt]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: alt || 'Image', url: src });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(src);
      } catch {
        window.prompt('Copy this link:', src);
      }
    }
  }, [src, alt]);

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top-right actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={handleDownload}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          title="Download"
        >
          <Download className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          title="Share"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          title="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      {/* Image */}
      <img
        src={src}
        alt={alt || 'Preview'}
        className="max-w-[92vw] max-h-[85vh] rounded-2xl object-contain select-none"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
      />
    </div>,
    document.body
  );
};

// ─── PostDetailSheet ───────────────────────────────────────────────────────────
const PostDetailSheet = ({ post, theme, dark, isLiked, isUpvoted, onToggleLike, onUpvote, onAddComment, onClose }) => {
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
          <div className="flex items-center gap-1 py-2 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => { hapticMedium(); onUpvote?.(post.id); }}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{ color: isUpvoted ? '#f97316' : theme.colors.textSecondary, backgroundColor: isUpvoted ? (dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)') : 'transparent' }}
            >
              <ChevronUp className="w-4 h-4" /> {post.upvotes || 0}
            </button>
            <button
              onClick={() => { hapticMedium(); onToggleLike?.(post.id); }}
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
      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt={post.title || 'Post image'} onClose={() => setLightboxSrc(null)} />}
    </div>,
    document.body
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
const FeedDivider = ({ label, dark, theme, first }) => (
  <div className={`flex items-center gap-2.5 ${first ? 'mt-3 mb-4' : 'mt-6 mb-4'}`}>
    <div className="flex-1 h-px" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
    <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>{label}</span>
    <div className="flex-1 h-px" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
  </div>
);

// ─── SubredditFeed ─────────────────────────────────────────────────────────────
const SubredditFeed = ({ subreddit, allPosts, theme, dark, likedPosts, postUpvotes, onToggleLike, onUpvote, onAddComment }) => {

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

// ─── SubredditPostCard ─────────────────────────────────────────────────────────
const SubredditPostCard = ({ post, idx, isTop, dark, theme, isLiked, isUpvoted, onOpen, onUpvote, onToggleLike, onAddComment }) => {
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
      style={{ backgroundColor: dark ? '#2A2A2A' : '#FFFFFF', border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}
    >
      {/* Post body */}
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
        <button onClick={() => setShowDetail(true)} className="text-left w-full">
          {post.title && <p className="text-[13px] font-bold mb-1" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
          <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: theme.colors.textSecondary }}>{post.text}</p>
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
      <div className="px-3 py-2 flex items-center gap-2 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
        <button onClick={() => onUpvote?.(post.id)} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full transition-all" style={{ color: isUpvoted ? '#f97316' : theme.colors.textSecondary, backgroundColor: isUpvoted ? (dark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)') : 'transparent' }}>
          <ChevronUp className="w-3 h-3" /> {post.upvotes || 0}
        </button>
        <button onClick={() => onToggleLike?.(post.id)} className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-all" style={{ color: isLiked ? theme.colors.accent : theme.colors.textSecondary, backgroundColor: isLiked ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`) : 'transparent' }}>
          <Heart className="w-3 h-3" style={isLiked ? { fill: theme.colors.accent } : undefined} /> {post.likes || 0}
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1 text-[11px] ml-auto px-2 py-1 rounded-full transition-all"
          style={{ color: showComments ? theme.colors.accent : theme.colors.textSecondary, backgroundColor: showComments ? (dark ? 'rgba(255,255,255,0.06)' : `${theme.colors.accent}08`) : 'transparent' }}
        >
          <MessageSquare className="w-3 h-3" /> {commentCount}
        </button>
      </div>

      {/* Inline comments */}
      {showComments && (
        <div className="px-3.5 pb-3 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
          {localComments.length > 0 ? (
            <div className="space-y-1.5 pt-2.5">
              {localComments.map(c => (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: dark ? '#333' : '#EDEAE4', color: theme.colors.textSecondary }}>
                    {c.name?.[0] || '?'}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold" style={{ color: theme.colors.textPrimary }}>{c.name}</span>
                    <span className="text-[11px] ml-1.5" style={{ color: theme.colors.textSecondary }}>{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] py-2.5 text-center" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>No comments yet</p>
          )}
          <form onSubmit={submitComment} className="flex items-center gap-2 mt-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Reply\u2026"
              className="flex-1 text-[12px] h-8 px-3 rounded-full outline-none"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: theme.colors.textPrimary }}
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

// ─── Channel chips — minimal text pills ─────────────────────────────────────────
const ChannelChips = ({ theme, dark, onSelect }) => (
  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-0.5">
    {SUBREDDITS.map((sub) => (
      <button
        key={sub.id}
        onClick={() => onSelect(sub)}
        className="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap transition-all active:scale-95"
        style={{
          color: theme.colors.textSecondary,
          backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        }}
      >
        {sub.name}
      </button>
    ))}
  </div>
);

// ─── ChannelAwareFeed ──────────────────────────────────────────────────────────
const ChannelAwareFeed = ({
  theme, dark, posts, polls, likedPosts, pollChoices, postUpvotes,
  onToggleLike, onUpvote, onPollVote, onAddComment, openCreateContentModal, query,
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
      <ChannelChips theme={theme} dark={dark} onSelect={onSelectSubreddit} />

      {!hasAnything ? (
        <div className="text-center text-[13px] pt-16" style={{ color: theme.colors.textSecondary }}>No content found.</div>
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
  handleBack: parentHandleBack,
}) => {
  const dark = isDarkTheme(theme);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasBoardContent = useMemo(() => {
    const hasComments = (posts || []).some(p => (p.comments || []).some(c => c.name === 'You'));
    return savedImageIds.length > 0 || Object.keys(likedPosts || {}).length > 0 || hasComments;
  }, [savedImageIds, likedPosts, posts]);

  const TABS = useMemo(() => hasBoardContent ? ['Community', 'Library', 'My Board'] : ['Community', 'Library'], [hasBoardContent]);

  const [activeTab, setActiveTab] = useState('community');
  const [activeSubreddit, setActiveSubreddit] = useState(null);
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
    setActiveSubreddit(null); // going to a tab resets sub-community
    requestAnimationFrame(() => { if (containerRef.current) containerRef.current.scrollTop = scrollPositions.current[tab] || 0; });
  }, [activeTab]);

  const enterSubreddit = useCallback((sub) => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setActiveSubreddit(sub);
  }, []);

  const exitSubreddit = useCallback(() => {
    setActiveSubreddit(null);
  }, []);

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

  const inSubCommunity = activeTab === 'community' && !!activeSubreddit;
  const SubIcon = activeSubreddit?.icon;

  // Override parent back: when in sub-community, exit channel instead of leaving page
  const interceptedBack = useCallback(() => {
    if (activeSubreddit) {
      exitSubreddit();
    } else if (parentHandleBack) {
      parentHandleBack();
    }
  }, [activeSubreddit, exitSubreddit, parentHandleBack]);

  // Patch the global back handler while we're in a sub-community
  useEffect(() => {
    if (!activeSubreddit) return;
    const onPopState = (e) => {
      e.preventDefault();
      setActiveSubreddit(null);
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeSubreddit]);

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-2" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-3xl mx-auto w-full">
          {/* Tabs row — sub-community name slides in from left, tabs shift right */}
          <div className="flex items-center h-10">
            {/* Sub-community title (left — expands to push tabs right) */}
            <div
              className="flex items-center gap-2 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxWidth: inSubCommunity ? 300 : 0,
                opacity: inSubCommunity ? 1 : 0,
                marginRight: inSubCommunity ? 10 : 0,
              }}
            >
              {SubIcon && (
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activeSubreddit?.color}18`, color: activeSubreddit?.color }}>
                  <SubIcon className="w-3 h-3" />
                </div>
              )}
              <span className="text-[15px] font-bold whitespace-nowrap" style={{ color: theme.colors.textPrimary }}>
                {activeSubreddit?.name}
              </span>
              <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
                {activeSubreddit?.members}
              </span>
            </div>

            {/* Divider dot */}
            <div
              className="w-1 h-1 rounded-full flex-shrink-0 transition-all duration-300 ease-in-out"
              style={{
                backgroundColor: theme.colors.textSecondary,
                opacity: inSubCommunity ? 0.2 : 0,
                transform: inSubCommunity ? 'scale(1)' : 'scale(0)',
                marginRight: inSubCommunity ? 8 : 0,
              }}
            />

            {/* Tabs — start left, shift right as sub-community title expands */}
            <div className="flex items-center gap-0.5 transition-all duration-300 ease-in-out">
              {TABS.map(tab => (
                <button key={tab} onClick={() => switchTab(tab.toLowerCase())}
                  className="text-[13px] px-2.5 py-2 transition-all whitespace-nowrap"
                  style={tabStyle(activeTab === tab.toLowerCase())}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search + Post inline */}
          {activeTab !== 'my board' && (
            <div className="flex items-center gap-2 mt-2 mb-2">
              <div className="flex-1">
                <StandardSearchBar
                  id="community-main-search"
                  value={query}
                  onChange={setQuery}
                  placeholder={inSubCommunity ? `Search ${activeSubreddit?.name}\u2026` : activeTab === 'library' ? 'Search library' : 'Search posts, people, tags\u2026'}
                  theme={theme}
                />
              </div>
              <button onClick={openCreateContentModal} className="h-12 px-5 rounded-full text-[12px] font-semibold transition-all active:scale-95 flex-shrink-0" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
                + Post
              </button>
            </div>
          )}
          {activeTab === 'my board' && <div className="mb-2" />}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <div className="mx-auto w-full max-w-3xl px-4" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>

            <div style={paneStyle('community')}>
              <ChannelAwareFeed
                theme={theme} dark={dark} posts={posts} polls={polls}
                likedPosts={likedPosts} pollChoices={pollChoices} postUpvotes={postUpvotes}
                onToggleLike={onToggleLike} onUpvote={onUpvote} onPollVote={onPollVote}
                onAddComment={onAddComment} openCreateContentModal={openCreateContentModal} query={query}
                activeSubreddit={activeSubreddit} onSelectSubreddit={enterSubreddit}
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
