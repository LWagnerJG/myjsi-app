import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Bookmark, ChevronLeft, Image, MessageSquare, Sparkles } from 'lucide-react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ChannelAwareFeed } from './components/community/ChannelAwareFeed.jsx';
import { MyBoardView } from './components/community/MyBoardView.jsx';
import { MakersStudioTab } from './components/community/MakersStudioTab.jsx';
import { ChannelChips } from './components/community/ChannelChips.jsx';

export const CommunityLibraryLayout = ({
  theme,
  posts, polls, likedPosts, pollChoices, postUpvotes = {},
  onToggleLike, onUpvote, onPollVote, onAddComment, openCreateContentModal,
  openLibraryUploadModal,
  libraryAssets,
  savedImageIds = [], onToggleSaveImage,
}) => {
  const dark = isDarkTheme(theme);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasBoardContent = useMemo(() => {
    const hasComments = (posts || []).some((post) => (post.comments || []).some((comment) => comment.name === 'You'));
    return savedImageIds.length > 0 || Object.keys(likedPosts || {}).length > 0 || hasComments;
  }, [savedImageIds, likedPosts, posts]);

  const tabs = useMemo(() => {
    const base = [
      { value: 'community', label: 'Community' },
      { value: 'library', label: 'Library' },
      { value: 'makers studio', label: 'Makers Studio' },
    ];
    if (hasBoardContent) base.push({ value: 'my board', label: 'My Board' });
    return base;
  }, [hasBoardContent]);

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
    setActiveSubreddit(null);
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = scrollPositions.current[tab] || 0;
      }
    });
  }, [activeTab]);

  const enterSubreddit = useCallback((subreddit) => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setActiveSubreddit(subreddit);
  }, []);

  const exitSubreddit = useCallback(() => setActiveSubreddit(null), []);

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        document.getElementById('community-main-search')?.querySelector('input')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!activeSubreddit) return;
    const onPopState = (event) => {
      event.preventDefault();
      setActiveSubreddit(null);
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeSubreddit]);

  const tr = prefersReducedMotion ? 'none' : 'opacity 250ms ease, transform 250ms ease';
  const paneStyle = (name) => activeTab === name
    ? { position: 'relative', opacity: 1, transform: 'translateY(0)', transition: tr, pointerEvents: 'auto' }
    : { position: 'absolute', inset: 0, opacity: 0, transform: 'translateY(6px)', transition: tr, pointerEvents: 'none' };

  const inSubCommunity = activeTab === 'community' && !!activeSubreddit;
  const showSearch = activeTab !== 'my board' && activeTab !== 'makers studio';
  const activeAction = activeTab === 'library' ? openLibraryUploadModal : openCreateContentModal;
  const actionLabel = activeTab === 'library' ? '+ Upload' : '+ Post';
  const searchPlaceholder = inSubCommunity
    ? `Search ${activeSubreddit?.name}...`
    : activeTab === 'library' ? 'Search library' : 'Search posts, people, tags...';

  const dividerColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <div className="flex-shrink-0" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-3xl mx-auto w-full px-4">

          {/* ── Tabs row + action button ── */}
          <div className="flex items-center pt-1.5 pb-2">
            <div className="flex items-center gap-5 flex-1 overflow-x-auto no-scrollbar">
              {tabs.map(t => {
                const isActive = activeTab === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => switchTab(t.value)}
                    className="relative pb-1.5 text-[0.8125rem] font-semibold whitespace-nowrap transition-all duration-200 active:scale-95"
                    style={{ color: theme.colors.textPrimary, opacity: isActive ? 1 : 0.28 }}
                  >
                    {t.label}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full transition-all duration-250"
                      style={{
                        backgroundColor: theme.colors.textPrimary,
                        opacity: isActive ? 0.7 : 0,
                        transform: `scaleX(${isActive ? 1 : 0})`,
                        transformOrigin: 'center',
                      }}
                    />
                  </button>
                );
              })}
            </div>
            {activeAction && (
              <button
                onClick={activeAction}
                className="ml-3 h-8 px-3.5 rounded-full text-[0.75rem] font-semibold transition-all duration-150 active:scale-95 flex-shrink-0"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                {actionLabel}
              </button>
            )}
          </div>

          {/* ── Community channels or sub-community breadcrumb ── */}
          {activeTab === 'community' && (
            <div className="pb-2">
              {inSubCommunity ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={exitSubreddit}
                    className="flex items-center gap-1 text-[0.75rem] font-semibold transition-all duration-150 active:scale-95"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>All</span>
                  </button>
                  <span className="text-[0.625rem]" style={{ color: theme.colors.textSecondary, opacity: 0.2 }}>/</span>
                  <span className="text-[0.75rem] font-bold" style={{ color: theme.colors.textPrimary }}>
                    {activeSubreddit?.name}
                  </span>
                  {activeSubreddit?.members && (
                    <span className="text-[0.6875rem] font-medium ml-auto tabular-nums" style={{ color: theme.colors.textSecondary, opacity: 0.35 }}>
                      {activeSubreddit.members}
                    </span>
                  )}
                </div>
              ) : (
                <ChannelChips
                  theme={theme}
                  dark={dark}
                  onSelect={enterSubreddit}
                  activeId={null}
                />
              )}
            </div>
          )}

          {/* ── Search row ── */}
          {showSearch && (
            <div className="pb-2.5">
              <StandardSearchBar
                id="community-main-search"
                value={query}
                onChange={setQuery}
                placeholder={searchPlaceholder}
                theme={theme}
              />
            </div>
          )}
        </div>

        {/* ── Separator ── */}
        <div style={{ height: 1, backgroundColor: dividerColor }} />
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <div className="mx-auto w-full max-w-3xl px-4 pt-3" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div style={paneStyle('community')}>
              <ChannelAwareFeed
                theme={theme}
                dark={dark}
                posts={posts}
                polls={polls}
                likedPosts={likedPosts}
                pollChoices={pollChoices}
                postUpvotes={postUpvotes}
                onToggleLike={onToggleLike}
                onUpvote={onUpvote}
                onPollVote={onPollVote}
                onAddComment={onAddComment}
                openCreateContentModal={openCreateContentModal}
                query={query}
                activeSubreddit={activeSubreddit}
              />
            </div>

            <div style={paneStyle('library')}>
              <LibraryGrid
                theme={theme}
                query={query}
                savedImageIds={savedImageIds}
                onToggleSaveImage={onToggleSaveImage}
                assetsOverride={libraryAssets}
              />
            </div>

            <div style={paneStyle('makers studio')}>
              <MakersStudioTab theme={theme} />
            </div>

            {hasBoardContent && (
              <div style={paneStyle('my board')}>
                <MyBoardView
                  theme={theme}
                  dark={dark}
                  savedImageIds={savedImageIds}
                  onToggleSaveImage={onToggleSaveImage}
                  posts={posts}
                  likedPosts={likedPosts}
                  postUpvotes={postUpvotes}
                  onToggleLike={onToggleLike}
                  onUpvote={onUpvote}
                  onAddComment={onAddComment}
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
