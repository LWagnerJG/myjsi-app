import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ChannelAwareFeed } from './components/community/ChannelAwareFeed.jsx';
import { MyBoardView } from './components/community/MyBoardView.jsx';
import { MakersStudioTab } from './components/community/MakersStudioTab.jsx';
import { ChannelChips } from './components/community/ChannelChips.jsx';
import { ScreenTopChrome } from '../../components/common/ScreenTopChrome.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';

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
      { value: 'makers studio', label: 'Studio' },
    ];
    if (hasBoardContent) base.push({ value: 'my board', label: 'Board' });
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

  const tr = prefersReducedMotion ? 'none' : 'opacity 200ms ease';
  const paneStyle = (name) => activeTab === name
    ? { position: 'relative', opacity: 1, transition: tr, pointerEvents: 'auto' }
    : { position: 'absolute', inset: 0, opacity: 0, transition: tr, pointerEvents: 'none' };

  const inSubCommunity = activeTab === 'community' && !!activeSubreddit;
  const showSearch = activeTab !== 'my board' && activeTab !== 'makers studio';
  const activeAction = activeTab === 'community'
    ? openCreateContentModal
    : activeTab === 'library'
      ? openLibraryUploadModal
      : null;
  const actionLabel = activeTab === 'library' ? '+ Upload' : '+ Post';
  const searchPlaceholder = inSubCommunity
    ? `Search ${activeSubreddit?.name}...`
    : activeTab === 'library' ? 'Search library' : 'Search posts, people, tags...';

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <ScreenTopChrome theme={theme} maxWidthClass="max-w-3xl" horizontalPaddingClass="px-4" contentClassName="pt-1 pb-2">
        <div className="space-y-3">

          {inSubCommunity ? (
            /* ── Immersive sub-community header ── */
            <>
              <div className="flex items-baseline gap-3">
                <h2 className="text-[1.125rem] font-bold truncate" style={{ color: theme.colors.textPrimary }}>
                  {activeSubreddit?.name}
                </h2>
                {activeSubreddit?.members ? (
                  <span className="text-[0.75rem] font-medium tabular-nums flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
                    {activeSubreddit.members}
                  </span>
                ) : null}
                <button
                  onClick={openCreateContentModal}
                  className="h-8 px-3.5 rounded-full text-sm font-semibold transition-all duration-150 active:scale-95 flex-shrink-0 ml-auto"
                  style={{
                    backgroundColor: theme.colors.accent || theme.colors.textPrimary,
                    color: theme.colors.accentText || '#FFFFFF',
                  }}
                >
                  + Post
                </button>
              </div>
              <StandardSearchBar
                id="community-main-search"
                value={query}
                onChange={setQuery}
                placeholder={searchPlaceholder}
                theme={theme}
              />
            </>
          ) : (
            /* ── Normal top-level chrome ── */
            <>
              <div className="flex items-center gap-3">
                <SegmentedToggle
                  value={activeTab}
                  onChange={switchTab}
                  options={tabs}
                  size="sm"
                  theme={theme}
                />

                {activeAction ? (
                  <button
                    onClick={activeAction}
                    className="h-8 px-3.5 rounded-full text-sm font-semibold transition-all duration-150 active:scale-95 flex-shrink-0 ml-auto"
                    style={{
                      backgroundColor: theme.colors.accent || theme.colors.textPrimary,
                      color: theme.colors.accentText || '#FFFFFF',
                    }}
                  >
                    {actionLabel}
                  </button>
                ) : null}
              </div>

              {activeTab === 'community' ? (
                <ChannelChips
                  theme={theme}
                  dark={dark}
                  onSelect={enterSubreddit}
                  activeId={null}
                />
              ) : null}

              {showSearch ? (
                <StandardSearchBar
                  id="community-main-search"
                  value={query}
                  onChange={setQuery}
                  placeholder={searchPlaceholder}
                  theme={theme}
                />
              ) : null}
            </>
          )}

        </div>
      </ScreenTopChrome>

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
