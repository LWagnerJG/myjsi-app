import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ANNOUNCEMENTS, STORIES } from './data.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Plus, Users, Send, ExternalLink,
  Megaphone, ChevronRight, Sparkles, Image, BarChart3, X, Package, Calendar, DollarSign, Zap,
  Copy, CheckCircle2, Link2
} from 'lucide-react';

/* ── helpers ── */
const cardBg = (dark) => dark ? '#2A2A2A' : '#FFFFFF';
const subtleBorder = (dark) => dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

const ANNOUNCEMENT_ICONS = {
  'product-launch': Package,
  'pricing': DollarSign,
  'event': Calendar,
  'operations': Zap,
};

const ANNOUNCEMENT_COLORS = {
  'product-launch': '#4A7C59',
  'pricing': '#5B7B8C',
  'event': '#C4956A',
  'operations': '#6A6762',
};

/* ── Stories Ring ── */
const StoriesBar = ({ theme, dark }) => (
  <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
    {STORIES.map((story, i) => (
      <motion.button
        key={story.id}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 26 }}
        className="flex flex-col items-center gap-1 flex-shrink-0 group"
      >
        <div
          className="w-14 h-14 rounded-full p-[2px] transition-transform group-hover:scale-105 group-active:scale-95"
          style={{
            background: story.isJSI
              ? 'linear-gradient(135deg, #353535, #666, #353535)'
              : `linear-gradient(135deg, ${dark ? '#888' : '#999'}, ${dark ? '#555' : '#ccc'})`,
          }}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: dark ? '#1A1A1A' : '#F0EDE8', border: `2px solid ${dark ? '#1A1A1A' : '#F0EDE8'}` }}
          >
            {story.isJSI ? (
              <Megaphone className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
            ) : story.avatar ? (
              <img src={story.avatar} alt={story.label} className="w-full h-full object-cover" />
            ) : (
              <Users className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            )}
          </div>
        </div>
        <span className="text-[10px] font-medium max-w-[56px] truncate" style={{ color: theme.colors.textSecondary }}>
          {story.label}
        </span>
      </motion.button>
    ))}
  </div>
);

/* ── Announcement Detail Modal ── */
const AnnouncementDetailModal = ({ announcement, theme, dark, onClose, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  if (!announcement) return null;

  const color = ANNOUNCEMENT_COLORS[announcement.category] || ANNOUNCEMENT_COLORS['operations'];
  const Icon = ANNOUNCEMENT_ICONS[announcement.category] || Megaphone;

  const formattedDate = announcement.date
    ? new Date(announcement.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const handleShare = async () => {
    const shareData = {
      title: announcement.title,
      text: `${announcement.title} — ${announcement.subtitle}\n\n${announcement.text || ''}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      /* user cancelled share */
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/#${announcement.actionRoute || ''}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* */ }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />

        {/* Modal */}
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 sm:mx-auto rounded-2xl overflow-hidden"
          style={{ backgroundColor: dark ? '#282828' : '#FFFFFF', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
        >
          {/* Header band */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}18`, color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>{announcement.category?.replace('-', ' ')}</p>
                  {formattedDate && (
                    <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>{formattedDate}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
              >
                <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-4 space-y-3">
            <h3 className="text-[17px] font-bold leading-snug" style={{ color: theme.colors.textPrimary }}>{announcement.title}</h3>
            <p className="text-[13px] font-medium" style={{ color: theme.colors.textSecondary }}>{announcement.subtitle}</p>
            {announcement.text && (
              <p className="text-[13px] leading-relaxed" style={{ color: dark ? '#C0C0C0' : '#555555' }}>{announcement.text}</p>
            )}
            {announcement.image && (
              <div className="rounded-xl overflow-hidden mt-2">
                <img src={announcement.image} alt={announcement.title} className="w-full h-auto object-cover" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex flex-wrap gap-2">
            {announcement.actionLabel && announcement.actionRoute && (
              <button
                onClick={() => { onClose(); onNavigate?.(announcement.actionRoute); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {announcement.actionLabel}
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.textPrimary,
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: copied ? '#4A7C59' : theme.colors.textPrimary,
              }}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

/* ── Compact Announcements — horizontal drag-scroll row ── */
const AnnouncementsRow = ({ announcements, theme, dark, onNavigate, onDismiss }) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const rowRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  const onPointerDown = useCallback((e) => {
    const el = rowRef.current;
    if (!el) return;
    // Do NOT call setPointerCapture — it intercepts child button clicks
    drag.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    rowRef.current.scrollLeft = drag.current.scrollLeft - dx;
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current.active = false;
  }, []);

  const handlePillClick = useCallback((a) => {
    if (!drag.current.moved) setSelectedAnnouncement(a);
  }, []);

  if (!announcements.length) return null;

  return (
    <div className="px-4">
      <div
        ref={rowRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none"
        style={{ cursor: 'grab', WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence>
          {announcements.map((a, i) => {
            const color = ANNOUNCEMENT_COLORS[a.category] || ANNOUNCEMENT_COLORS['operations'];
            const Icon = ANNOUNCEMENT_ICONS[a.category] || Megaphone;
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ delay: i * 0.04 }}
                className="relative flex-shrink-0 rounded-xl"
                style={{
                  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : theme.colors.surface,
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : theme.colors.border}`,
                  minWidth: 172,
                  maxWidth: 232,
                  boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {/* Tappable body */}
                <button
                  onClick={() => handlePillClick(a)}
                  className="w-full flex items-center gap-2 pl-2.5 pr-6 py-2 rounded-xl text-left transition-all active:scale-[0.97]"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: theme.colors.textPrimary }}>{a.title}</p>
                    <p className="text-[10px] leading-tight truncate mt-0.5" style={{ color: theme.colors.textSecondary }}>{a.subtitle}</p>
                  </div>
                </button>

                {/* Discrete dismiss X */}
                {onDismiss && (
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); onDismiss(a.id); }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center transition-opacity opacity-30 hover:opacity-70 active:scale-90"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }}
                    aria-label="Dismiss"
                  >
                    <X className="w-2.5 h-2.5" style={{ color: theme.colors.textSecondary }} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          theme={theme}
          dark={dark}
          onClose={() => setSelectedAnnouncement(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

/* ── Shared micro-components (stable references — defined outside CommunityScreen) ── */

const Avatar = React.memo(({ src, alt, size = 36, dark, theme }) => (
  <div
    className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, backgroundColor: dark ? '#444' : '#E3E0D8' }}
  >
    {src
      ? <img src={src} alt={alt} className="w-full h-full object-cover" />
      : <Users className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />}
  </div>
));
Avatar.displayName = 'Avatar';

const ActionBtn = React.memo(({ active, icon: Icon, count, onClick, label, theme, dark }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full transition-all active:scale-95"
    style={{
      color: active ? theme.colors.accent : theme.colors.textSecondary,
      backgroundColor: active
        ? (dark ? 'rgba(255,255,255,0.08)' : `${theme.colors.accent}10`)
        : 'transparent',
    }}
  >
    <Icon className="w-3.5 h-3.5" style={active ? { fill: theme.colors.accent } : undefined} />
    {count > 0 && <span>{count}</span>}
  </button>
));
ActionBtn.displayName = 'ActionBtn';

const PostCard = React.memo(({ post, index, theme, dark, isLiked, isExpanded, onToggleLike, onAddComment, onToggleComments }) => {
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
            <span className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</span>
            <span className="text-[11px] font-medium ml-2" style={{ color: theme.colors.textSecondary }}>{post.timeAgo}</span>
          </div>
        </div>
        {post.title && <p className="text-[13px] font-bold mt-2" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
        {post.text && <p className="text-[13px] mt-1 whitespace-pre-line leading-relaxed" style={{ color: theme.colors.textSecondary }}>{post.text}</p>}
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
      <div className="px-2 py-1.5 flex items-center gap-0.5 border-t" style={{ borderColor: subtleBorder(dark) }}>
        <ActionBtn active={isLiked} icon={Heart} count={post.likes || 0} onClick={() => onToggleLike?.(post.id)} label="Like" theme={theme} dark={dark} />
        <ActionBtn active={isExpanded} icon={MessageCircle} count={(post.comments || []).length} onClick={() => onToggleComments(post.id)} label="Comments" theme={theme} dark={dark} />
        <button
          onClick={() => {
            if (navigator.share) navigator.share({ title: post.title || 'Post', text: post.text });
            else navigator.clipboard.writeText(post.text || window.location.href);
          }}
          className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full active:scale-95"
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
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ backgroundColor: dark ? '#333' : '#EDEAE4', color: theme.colors.textSecondary }}
                >
                  {c.name?.[0] || '?'}
                </div>
                <div className="flex-1 rounded-xl px-2.5 py-1.5" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                  <p className="text-[11px] font-semibold" style={{ color: theme.colors.textPrimary }}>{c.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>{c.text}</p>
                </div>
              </div>
            ))}
            {(post.comments || []).length === 0 && (
              <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>No comments yet.</p>
            )}
          </div>
          <form onSubmit={submitComment} className="flex items-center gap-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-[12px] px-3 py-1.5 rounded-full outline-none"
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

const PollCard = React.memo(({ poll, index, theme, dark, votedOption, onPollVote }) => {
  const totalVotes = (poll.options || []).reduce((s, o) => s + (o.votes || 0), 0);
  return (
    <div className="rounded-2xl overflow-hidden p-3.5 space-y-2.5" style={{ backgroundColor: cardBg(dark) }}>
      <div className="flex items-center gap-1.5">
        <BarChart3 className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Poll</span>
      </div>
      <div className="flex items-start gap-2.5">
        <Avatar src={poll.user?.avatar} alt={poll.user?.name} dark={dark} theme={theme} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>{poll.user?.name}</span>
            <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{poll.timeAgo}</span>
          </div>
          <p className="text-[13px] mt-1 font-semibold" style={{ color: theme.colors.textPrimary }}>{poll.question}</p>
          <div className="mt-2 space-y-1.5">
            {poll.options.map(opt => {
              const percent = totalVotes ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
              const active = votedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { if (!votedOption) onPollVote?.(poll.id, opt.id); }}
                  className="w-full text-left px-3 py-2 rounded-xl relative overflow-hidden transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    border: active ? `1px solid ${theme.colors.accent}` : `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    color: active ? theme.colors.accent : votedOption ? theme.colors.textSecondary : theme.colors.textPrimary,
                    cursor: votedOption ? 'default' : 'pointer',
                    opacity: votedOption && !active ? 0.65 : 1,
                  }}
                >
                  <span className="relative z-10 text-[12px] font-medium flex justify-between">
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
            <p className="text-[10px] mt-1.5 font-medium" style={{ color: theme.colors.textSecondary }}>
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
PollCard.displayName = 'PollCard';

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
    style.innerHTML = `.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }`;
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

  /* ── Layout ── */
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'transparent' }}>
      {/* Standalone mode header (non-embed) */}
      {!embedMode && (
        <div className="flex-shrink-0 space-y-1.5 px-4 pt-2 pb-0">
          <div className="flex gap-1.5 p-1 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#E3E0D8' }}>
            {[
              { id: 'feed', label: 'Feed', icon: Sparkles },
              { id: 'library', label: 'Library', icon: Image },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all flex-1 justify-center"
                style={{
                  backgroundColor: viewMode === tab.id
                    ? (dark ? 'rgba(255,255,255,0.12)' : '#FFFFFF')
                    : 'transparent',
                  color: viewMode === tab.id ? theme.colors.textPrimary : theme.colors.textSecondary,
                }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center mt-1">
            <div className="flex-1">
              <StandardSearchBar
                value={query}
                onChange={setQuery}
                placeholder={viewMode === 'feed' ? 'Search posts, people, tags...' : 'Search library'}
                theme={theme}
              />
            </div>
            {openCreateContentModal && (
              <button
                onClick={openCreateContentModal}
                className="h-10 px-4 rounded-full text-[13px] font-semibold transition-all active:scale-95 flex-shrink-0"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                + Post
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-6">
        <div className="w-full space-y-3">

          {/* Stories — feed mode, not focused */}
          {effectiveViewMode === 'feed' && !focusPostId && !embedMode && (
            <div className="px-4">
              <StoriesBar theme={theme} dark={dark} />
            </div>
          )}

          {/* Announcements — compact drag-scroll row */}
          {effectiveViewMode === 'feed' && !focusPostId && visibleAnnouncements.length > 0 && (
            <AnnouncementsRow
              announcements={visibleAnnouncements}
              theme={theme}
              dark={dark}
              onNavigate={onNavigate}
              onDismiss={dismissAnnouncement}
            />
          )}

          {/* Feed */}
          {effectiveViewMode === 'feed' && !filteredContent.length && !focusedPost && (
            <div className="text-center text-[13px] pt-16" style={{ color: theme.colors.textSecondary }}>No content found.</div>
          )}

          {effectiveViewMode === 'feed' && (focusedPost || filteredContent.length > 0) && (
            <div className="px-4 space-y-3">
              {(focusedPost ? [focusedPost] : filteredContent).map((item, i) =>
                item.question ? (
                  <PollCard
                    key={`poll-${item.id}`}
                    poll={item}
                    index={i}
                    theme={theme}
                    dark={dark}
                    votedOption={pollChoices[item.id]}
                    onPollVote={onPollVote}
                  />
                ) : (
                  <PostCard
                    key={`post-${item.id}`}
                    post={item}
                    index={i}
                    theme={theme}
                    dark={dark}
                    isLiked={!!likedPosts[item.id]}
                    isExpanded={!!expandedComments[item.id]}
                    onToggleLike={onToggleLike}
                    onAddComment={onAddComment}
                    onToggleComments={toggleComments}
                  />
                )
              )}
            </div>
          )}

          {/* Library — standalone only */}
          {effectiveViewMode === 'library' && !embedMode && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 px-4">
              {photoLibrary.map((photo, i) => (
                <motion.button
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onNavigate?.(`community/post/${photo.post.id}`)}
                  className="group relative rounded-xl overflow-hidden aspect-square"
                  style={{ backgroundColor: cardBg(dark) }}
                >
                  <img src={photo.src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-[10px] text-white line-clamp-2 font-medium">{photo.post.title || photo.post.text || photo.post.user?.name}</p>
                  </div>
                </motion.button>
              ))}
              {!photoLibrary.length && <p className="col-span-full text-center text-[13px] pt-16" style={{ color: theme.colors.textSecondary }}>No photos found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityScreen;
