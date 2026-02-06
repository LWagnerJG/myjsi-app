import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { PillButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ANNOUNCEMENTS, STORIES } from './data.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Plus, Users, Send, ExternalLink,
  Megaphone, ChevronRight, Sparkles, Image, BarChart3, X, Package, Calendar, DollarSign, Zap
} from 'lucide-react';

/* ── helpers ── */
const glassStyle = (theme, dark) => ({
  backgroundColor: dark ? 'rgba(40,40,40,0.55)' : 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px) saturate(1.4)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
  boxShadow: dark
    ? '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
    : '0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
});

const ANNOUNCEMENT_ICONS = {
  'product-launch': Package,
  'pricing': DollarSign,
  'event': Calendar,
  'operations': Zap,
};

const ANNOUNCEMENT_COLORS = {
  'product-launch': { bg: '#4A7C59', text: '#FFFFFF' },
  'pricing': { bg: '#5B7B8C', text: '#FFFFFF' },
  'event': { bg: '#C4956A', text: '#FFFFFF' },
  'operations': { bg: '#353535', text: '#FFFFFF' },
};

/* ── Stories Ring ── */
const StoriesBar = ({ theme, dark, onStoryClick }) => {
  const ref = useRef(null);
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar px-4 py-2">
        {STORIES.map((story, i) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => onStoryClick?.(story)}
            className="flex flex-col items-center gap-1 flex-shrink-0 group"
          >
            <div
              className="w-[60px] h-[60px] rounded-full p-[2.5px] transition-transform group-hover:scale-105 group-active:scale-95"
              style={{
                background: story.isJSI
                  ? 'linear-gradient(135deg, #353535 0%, #666 50%, #353535 100%)'
                  : `linear-gradient(135deg, ${dark ? '#aaa' : '#666'} 0%, ${dark ? '#666' : '#bbb'} 50%, ${dark ? '#aaa' : '#666'} 100%)`,
              }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: dark ? '#1A1A1A' : '#F0EDE8', border: `2px solid ${dark ? '#1A1A1A' : '#F0EDE8'}` }}
              >
                {story.isJSI ? (
                  <Megaphone className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                ) : story.avatar ? (
                  <img src={story.avatar} alt={story.label} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                )}
              </div>
            </div>
            <span className="text-[10px] font-medium max-w-[60px] truncate" style={{ color: theme.colors.textSecondary }}>
              {story.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

/* ── Announcement Banner Card ── */
const AnnouncementBanner = ({ announcement, theme, dark, onNavigate, onDismiss }) => {
  const colors = ANNOUNCEMENT_COLORS[announcement.category] || ANNOUNCEMENT_COLORS['operations'];
  const Icon = ANNOUNCEMENT_ICONS[announcement.category] || Megaphone;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        ...glassStyle(theme, dark),
        borderLeft: `3px solid ${colors.bg}`,
      }}
    >
      <div className="p-4 flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${colors.bg}18`, color: colors.bg }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.bg}15`, color: colors.bg }}>
              {announcement.category.replace('-', ' ')}
            </span>
            <span className="text-[10px]" style={{ color: theme.colors.textSecondary }}>{announcement.date}</span>
          </div>
          <h4 className="text-sm font-bold mt-1.5" style={{ color: theme.colors.textPrimary }}>{announcement.title}</h4>
          {announcement.subtitle && (
            <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{announcement.subtitle}</p>
          )}
          <p className="text-xs mt-1.5 line-clamp-2" style={{ color: theme.colors.textSecondary }}>{announcement.text}</p>
          {announcement.actionLabel && (
            <button
              onClick={() => onNavigate?.(announcement.actionRoute)}
              className="inline-flex items-center gap-1 text-xs font-semibold mt-2 px-3 py-1.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: `${colors.bg}12`, color: colors.bg }}
            >
              {announcement.actionLabel}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {onDismiss && (
          <button onClick={() => onDismiss(announcement.id)} className="p-1 rounded-full opacity-40 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ── Pinned Announcements Strip (horizontal scroll) ── */
const AnnouncementsStrip = ({ announcements, theme, dark, onNavigate, onDismiss }) => {
  if (!announcements.length) return null;
  const pinned = announcements.filter(a => a.pinned);
  const rest = announcements.filter(a => !a.pinned);
  return (
    <div className="space-y-2 px-4">
      {/* Pinned — full width cards */}
      <AnimatePresence>
        {pinned.map(a => (
          <AnnouncementBanner key={a.id} announcement={a} theme={theme} dark={dark} onNavigate={onNavigate} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
      {/* Remaining — compact horizontal scroll */}
      {rest.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {rest.map((a, i) => {
            const colors = ANNOUNCEMENT_COLORS[a.category] || ANNOUNCEMENT_COLORS['operations'];
            const Icon = ANNOUNCEMENT_ICONS[a.category] || Megaphone;
            return (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onNavigate?.(a.actionRoute)}
                className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98]"
                style={{
                  ...glassStyle(theme, dark),
                  minWidth: 200,
                  borderLeft: `2px solid ${colors.bg}`,
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.bg}15`, color: colors.bg }}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{a.title}</p>
                  <p className="text-[10px] truncate" style={{ color: theme.colors.textSecondary }}>{a.subtitle}</p>
                </div>
                <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-30" style={{ color: theme.colors.textSecondary }} />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Community Screen ── */
export const CommunityScreen = ({
  theme,
  posts = [],
  polls = [],
  likedPosts = {},
  pollChoices = {},
  onToggleLike,
  onPollVote,
  onAddComment,
  openCreateContentModal,
  onNavigate,
  embedMode = false,
  externalQuery = '',
  focusPostId
}) => {
  const dark = isDarkTheme(theme);
  const [expandedComments, setExpandedComments] = useState({});
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('feed');
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(new Set());
  const scrollRef = useRef(null);

  useEffect(() => {
    if (document.getElementById('community-no-scrollbar-style')) return;
    const style = document.createElement('style');
    style.id = 'community-no-scrollbar-style';
    style.innerHTML = `.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }
    @media (max-width: 500px){ .community-post-btn span{ display:none } .community-post-btn{ padding-left:18px; padding-right:18px } }
    `;
    document.head.appendChild(style);
  }, []);

  const effectiveQuery = embedMode ? externalQuery : query;
  const effectiveViewMode = embedMode ? 'feed' : viewMode;

  const timeSafe = (x) => (typeof x.createdAt === 'number' ? x.createdAt : Date.now());

  const allContent = useMemo(() => {
    const list = [...posts, ...polls].map(x => ({ ...x, createdAt: timeSafe(x) }));
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, polls]);

  const focusedPost = useMemo(() => {
    if (!focusPostId) return null;
    return posts.find(p => String(p.id) === String(focusPostId)) || null;
  }, [focusPostId, posts]);

  const filteredContent = useMemo(() => {
    const q = effectiveQuery.trim().toLowerCase();
    if (!q) return allContent;
    return allContent.filter(item => {
      const base = [item.type, item.user?.name, item.text, item.title, item.question].filter(Boolean).join(' ').toLowerCase();
      const optionsText = (item.options || []).map(o => o.text).join(' ').toLowerCase();
      return base.includes(q) || optionsText.includes(q);
    });
  }, [allContent, effectiveQuery]);

  const visibleAnnouncements = useMemo(() => {
    return ANNOUNCEMENTS.filter(a => !dismissedAnnouncements.has(a.id));
  }, [dismissedAnnouncements]);

  const photoLibrary = useMemo(() => {
    const rows = [];
    posts.forEach(p => {
      if (p.image) rows.push({ id: `${p.id}-single`, src: p.image, post: p });
      if (Array.isArray(p.images)) p.images.forEach((img, i) => rows.push({ id: `${p.id}-multi-${i}`, src: img, post: p }));
    });
    const q = effectiveQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => {
      const text = [r.post.title, r.post.text, r.post.user?.name].filter(Boolean).join(' ').toLowerCase();
      return text.includes(q);
    });
  }, [posts, effectiveQuery]);

  const toggleComments = useCallback(id => setExpandedComments(p => ({ ...p, [id]: !p[id] })), []);
  const dismissAnnouncement = useCallback(id => setDismissedAnnouncements(prev => new Set([...prev, id])), []);

  const hoverBg = dark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.02]';

  /* ── Sub-components ── */

  const Avatar = ({ src, alt, size = 40 }) => (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: theme.colors.accent }}
    >
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-white" />}
    </div>
  );

  const StatButton = ({ active, icon: Icon, count, onClick, ariaLabel }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all active:scale-95"
      style={{
        ...glassStyle(theme, dark),
        border: `1px solid ${active ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
        color: active ? theme.colors.accent : theme.colors.textSecondary,
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{count}</span>
    </button>
  );

  const PostCard = ({ post, index }) => {
    const [draft, setDraft] = useState('');
    const isLiked = !!likedPosts[post.id];
    const commentWrapRef = useRef(null);
    const contentRef = useRef(null);
    const [measuredHeight, setMeasuredHeight] = useState(0);
    const postId = post.id;
    const isExpanded = !!expandedComments[postId];
    const isFocused = focusPostId && String(post.id) === String(focusPostId);

    useEffect(() => {
      if (isExpanded && contentRef.current) {
        setMeasuredHeight(contentRef.current.scrollHeight);
      }
    }, [isExpanded, post.comments]);

    const submitComment = (e) => {
      e.preventDefault();
      const text = draft.trim();
      if (!text) return;
      onAddComment?.(post.id, text);
      setDraft('');
      if (!expandedComments[post.id]) toggleComments(post.id);
    };
    const openPost = () => {
      if (!isFocused && onNavigate) onNavigate(`community/post/${post.id}`);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.35 }}
      >
        <div
          className="rounded-[20px] overflow-hidden space-y-0 transition-shadow hover:shadow-lg group"
          style={glassStyle(theme, dark)}
        >
          {/* Clickable header zone */}
          <div
            className={`p-4 pb-2 ${!isFocused ? 'cursor-pointer ' + hoverBg : ''} transition-colors`}
            onClick={!isFocused ? openPost : undefined}
            role={!isFocused ? 'button' : undefined}
            tabIndex={!isFocused ? 0 : undefined}
            onKeyDown={!isFocused ? (e) => { if (e.key === 'Enter') openPost(); } : undefined}
          >
            <div className="flex items-start gap-3">
              <Avatar src={post.user?.avatar} alt={post.user?.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</p>
                  <span className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>{post.timeAgo}</span>
                  {!isFocused && (
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-30 flex-shrink-0 transition-opacity" style={{ color: theme.colors.textSecondary }} />
                  )}
                </div>
                {post.title && <p className="font-bold text-sm mt-0.5" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
                {post.text && <p className="text-[13px] mt-1 whitespace-pre-line leading-relaxed" style={{ color: theme.colors.textSecondary }}>{post.text}</p>}
              </div>
            </div>
          </div>

          {/* Images */}
          {post.image && (
            <div
              className={`mx-3 mb-2 rounded-xl overflow-hidden ${!isFocused ? 'cursor-pointer' : ''}`}
              onClick={!isFocused ? openPost : undefined}
            >
              <img src={post.image} alt="post" className="w-full h-auto object-cover transition-transform hover:scale-[1.01]" />
            </div>
          )}
          {post.images && post.images.length > 0 && (
            <div
              className={`mx-3 mb-2 grid grid-cols-2 gap-1.5 ${!isFocused ? 'cursor-pointer' : ''}`}
              onClick={!isFocused ? openPost : undefined}
            >
              {post.images.map((img, i) => (
                <img key={i} src={img} alt={post.title || 'win'} className="rounded-lg object-cover w-full h-32 transition-transform hover:scale-[1.01]" />
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="px-4 py-2.5 flex items-center gap-2 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
            <StatButton active={isLiked} icon={Heart} count={post.likes || 0} onClick={() => onToggleLike?.(post.id)} ariaLabel="Like" />
            <StatButton active={expandedComments[post.id]} icon={MessageCircle} count={(post.comments || []).length} onClick={() => toggleComments(post.id)} ariaLabel="Comments" />
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title || 'Post', text: post.text });
                } else {
                  navigator.clipboard.writeText(post.text || window.location.href);
                }
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{
                ...glassStyle(theme, dark),
                color: theme.colors.textSecondary,
              }}
            >
              <Share2 className="w-3.5 h-3.5" /> <span>Share</span>
            </button>
          </div>

          {/* Comments collapse */}
          <div
            ref={commentWrapRef}
            style={{
              maxHeight: expandedComments[post.id] ? measuredHeight : 0,
              opacity: expandedComments[post.id] ? 1 : 0,
              transition: 'max-height 300ms ease, opacity 250ms ease',
              overflow: 'hidden',
            }}
          >
            <div ref={contentRef} className="px-4 pb-3 space-y-3">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(post.comments || []).map(c => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: theme.colors.inputBackground, border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}
                    >
                      {c.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 rounded-xl px-3 py-2" style={{ backgroundColor: theme.colors.inputBackground, border: `1px solid ${theme.colors.border}` }}>
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
                  placeholder="Add a comment"
                  className="flex-1 text-sm px-3 py-2 rounded-full outline-none"
                  style={{ backgroundColor: theme.colors.inputBackground, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                />
                <button disabled={!draft.trim()} className="p-2 rounded-full disabled:opacity-40" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const PollCard = ({ poll, index }) => {
    const votedOption = pollChoices[poll.id];
    const totalVotes = (poll.options || []).reduce((s, o) => s + (o.votes || 0), 0);
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.35 }}
      >
        <div className="rounded-[20px] overflow-hidden p-4 space-y-3" style={glassStyle(theme, dark)}>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Poll</span>
          </div>
          <div className="flex items-start gap-3">
            <Avatar src={poll.user?.avatar} alt={poll.user?.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{poll.user?.name}</p>
                <span className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>{poll.timeAgo}</span>
              </div>
              <p className="text-sm mt-1.5 font-semibold" style={{ color: theme.colors.textPrimary }}>{poll.question}</p>
              <div className="mt-3 space-y-2">
                {poll.options.map(opt => {
                  const percent = totalVotes ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
                  const active = votedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!!votedOption}
                      onClick={() => onPollVote?.(poll.id, opt.id)}
                      className="w-full text-left px-3 py-2.5 rounded-xl relative overflow-hidden group whitespace-nowrap transition-all active:scale-[0.98]"
                      style={{
                        ...glassStyle(theme, dark),
                        borderColor: active ? theme.colors.accent : 'transparent',
                        borderWidth: 1,
                        color: active ? theme.colors.accent : theme.colors.textPrimary,
                      }}
                    >
                      <span className="relative z-10 text-xs font-medium flex justify-between">
                        <span>{opt.text}</span>
                        {!!votedOption && <span className="font-bold">{percent}%</span>}
                      </span>
                      {votedOption && (
                        <motion.div
                          className="absolute inset-0"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{
                            transformOrigin: 'left',
                            background: `linear-gradient(90deg, ${theme.colors.accent}20 ${percent}%, transparent ${percent}%)`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              {totalVotes > 0 && (
                <p className="text-[10px] mt-2 font-medium" style={{ color: theme.colors.textSecondary }}>
                  {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ── Layout ── */
  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      {!embedMode && (
        <div className="flex-shrink-0 space-y-2">
          {/* Top controls */}
          <div className="px-4 pt-1 pb-0 w-full">
            <div className="flex w-full gap-2 items-center">
              <div className="flex gap-1.5 p-1 rounded-full" style={{ ...glassStyle(theme, dark) }}>
                {[
                  { id: 'feed', label: 'Feed', icon: Sparkles },
                  { id: 'library', label: 'Library', icon: Image },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: viewMode === tab.id
                        ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)')
                        : 'transparent',
                      color: viewMode === tab.id ? theme.colors.textPrimary : theme.colors.textSecondary,
                    }}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={openCreateContentModal}
                className="community-post-btn ml-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.accentText,
                }}
              >
                <Plus className="w-4 h-4" /> <span className="truncate">Post</span>
              </button>
            </div>
          </div>

          {/* Stories ring */}
          {viewMode === 'feed' && !focusPostId && (
            <StoriesBar theme={theme} dark={dark} onStoryClick={(story) => {
              // JSI story could open announcements modal in future
            }} />
          )}

          {/* Search bar */}
          <div className="px-4 pb-1">
            <div className="rounded-full overflow-hidden" style={glassStyle(theme, dark)}>
              <StandardSearchBar
                value={query}
                onChange={setQuery}
                placeholder={viewMode === 'feed' ? 'Search posts, people, tags' : 'Search library'}
                theme={{ ...theme, colors: { ...theme.colors, surface: 'transparent' } }}
                className=""
              />
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="max-w-5xl mx-auto w-full space-y-4">

          {/* Announcements — only in feed mode, not focus mode */}
          {effectiveViewMode === 'feed' && !focusPostId && visibleAnnouncements.length > 0 && (
            <AnnouncementsStrip
              announcements={visibleAnnouncements}
              theme={theme}
              dark={dark}
              onNavigate={onNavigate}
              onDismiss={dismissAnnouncement}
            />
          )}

          {/* Feed */}
          {effectiveViewMode === 'feed' && !filteredContent.length && !focusedPost && (
            <div className="text-center text-sm pt-20 px-4" style={{ color: theme.colors.textSecondary }}>No content found.</div>
          )}

          {effectiveViewMode === 'feed' && (focusedPost || filteredContent.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 px-4 sm:px-6 lg:px-8">
              {(focusedPost ? [focusedPost] : filteredContent).map((item, i) =>
                item.question
                  ? <PollCard key={`poll-${item.id}`} poll={item} index={i} />
                  : <PostCard key={`post-${item.id}`} post={item} index={i} />
              )}
            </div>
          )}

          {/* Library */}
          {effectiveViewMode === 'library' && !embedMode && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 px-4 sm:px-6 lg:px-8">
              {photoLibrary.map((photo, i) => (
                <motion.button
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onNavigate?.(`community/post/${photo.post.id}`)}
                  className="group relative rounded-xl overflow-hidden aspect-square"
                  style={glassStyle(theme, dark)}
                >
                  <img src={photo.src} alt={photo.post.title || 'post image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2.5">
                    <p className="text-[11px] leading-tight text-white line-clamp-2 font-medium">{photo.post.title || photo.post.text || photo.post.user?.name}</p>
                  </div>
                </motion.button>
              ))}
              {!photoLibrary.length && <p className="col-span-full text-center text-sm pt-20" style={{ color: theme.colors.textSecondary }}>No photos found.</p>}
            </div>
          )}

          <div className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default CommunityScreen;
