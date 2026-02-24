import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ANNOUNCEMENTS } from './data.js';
import { Sparkles, Image } from 'lucide-react';

import { StoriesBar } from './components/community/StoriesBar.jsx';
import { AnnouncementsRow } from './components/community/AnnouncementsRow.jsx';
import { PostCard } from './components/community/PostCard.jsx';
import { PollCard } from './components/community/PollCard.jsx';
import { cardBg } from './components/community/utils.js';

/* ── Community Screen ── */
export const CommunityScreen = ({
  theme,
  posts = [],
  polls = [],
  likedPosts = {},
  pollChoices = {},
  postUpvotes = {},
  onToggleLike,
  onUpvote,
  onPollVote,
  onAddComment,
  openCreateContentModal,
  openLibraryUploadModal,
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
            {(openCreateContentModal || openLibraryUploadModal) && (
              <button
                onClick={viewMode === 'library' ? openLibraryUploadModal : openCreateContentModal}
                className="h-10 px-4 rounded-full text-[13px] font-semibold transition-all active:scale-95 flex-shrink-0"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                {viewMode === 'library' ? '+ Upload' : '+ Post'}
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

          {/* Announcements — compact drag-scroll row, not shown in embed (parent handles it) */}
          {!embedMode && effectiveViewMode === 'feed' && !focusPostId && visibleAnnouncements.length > 0 && (
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
                    isUpvoted={!!postUpvotes[item.id]}
                    isExpanded={!!expandedComments[item.id]}
                    onToggleLike={onToggleLike}
                    onUpvote={onUpvote}
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
              {photoLibrary.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => onNavigate?.(`community/post/${photo.post.id}`)}
                  className="group relative rounded-xl overflow-hidden aspect-square"
                  style={{ backgroundColor: cardBg(dark) }}
                >
                  <img src={photo.src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-[11px] text-white line-clamp-2 font-medium">{photo.post.title || photo.post.text || photo.post.user?.name}</p>
                  </div>
                </button>
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
