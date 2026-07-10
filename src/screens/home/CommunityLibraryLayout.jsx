import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ChannelAwareFeed } from './components/community/ChannelAwareFeed.jsx';
import { PostDetailSheet } from './components/community/PostDetailSheet.jsx';
import { MyBoardView } from './components/community/MyBoardView.jsx';
import { MakersStudioTab } from './components/community/MakersStudioTab.jsx';
import { ChannelChips } from './components/community/ChannelChips.jsx';
import { ChannelSidebar } from './components/community/ChannelSidebar.jsx';
import { ScreenTopChrome } from '../../components/common/ScreenTopChrome.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { CreateOnePagerModal } from '../studio/CreateOnePagerModal.jsx';
import { useToast } from '../../components/common/toastContext.js';

const communitySearchSurface = (dark) => ({
  backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
  border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.05)',
  boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.18)' : '0 1px 4px rgba(53,53,53,0.05)',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
});

const buildCommunityTabOptions = (hasBoardContent, compact = false) => {
  const base = [
    { value: 'community', label: compact ? 'Feed' : 'Community' },
    { value: 'library', label: 'Library' },
    { value: 'makers studio', label: 'Studio' },
  ];

  if (hasBoardContent) {
    base.push({ value: 'my board', label: 'Board' });
  }

  return base;
};

// Map tab values <-> URL slug. Default tab `community` lives at /community (no slug).
const TAB_TO_SLUG = { 'community': '', 'library': 'library', 'makers studio': 'studio', 'my board': 'board' };
const SLUG_TO_TAB = { '': 'community', 'library': 'library', 'studio': 'makers studio', 'board': 'my board' };
const tabPath = (tab) => {
  const slug = TAB_TO_SLUG[tab] ?? '';
  return slug ? `community/${slug}` : 'community';
};

export const CommunityLibraryLayout = ({
  theme,
  posts, polls, likedPosts, pollChoices, postUpvotes = {},
  onToggleLike, onUpvote, onPollVote, onAddComment, openCreateContentModal,
  openLibraryUploadModal,
  libraryAssets,
  savedImageIds = [], onToggleSaveImage,
  setBackHandler,
  currentScreen, onNavigate, currentUserId,
  focusPostId,
}) => {
  const dark = isDarkTheme(theme);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Deep link support: community/post/{id} (e.g. from Home feed previews)
  // opens that post's detail sheet on arrival.
  const [focusedPostId, setFocusedPostId] = useState(focusPostId || null);
  useEffect(() => { setFocusedPostId(focusPostId || null); }, [focusPostId]);
  const focusedPost = useMemo(
    () => focusedPostId != null
      ? (posts || []).find((post) => String(post.id) === String(focusedPostId)) || null
      : null,
    [focusedPostId, posts],
  );
  const closeFocusedPost = useCallback(() => setFocusedPostId(null), []);

  const hasBoardContent = useMemo(() => {
    const hasComments = (posts || []).some((post) => (post.comments || []).some((comment) => comment.name === 'You'));
    return savedImageIds.length > 0 || Object.keys(likedPosts || {}).length > 0 || hasComments;
  }, [savedImageIds, likedPosts, posts]);

  // Derive active tab from URL: /community | /community/library | /community/studio | /community/board
  const urlTab = useMemo(() => {
    const parts = (currentScreen || 'community').split('/');
    if (parts[0] !== 'community') return 'community';
    return SLUG_TO_TAB[parts[1] || ''] || 'community';
  }, [currentScreen]);
  const activeTab = urlTab;
  const setActiveTab = useCallback((tab) => {
    if (typeof onNavigate === 'function') onNavigate(tabPath(tab));
  }, [onNavigate]);
  const [activeSubreddit, setActiveSubreddit] = useState(null);
  const [query, setQuery] = useState('');
  const [communityTabMode, setCommunityTabMode] = useState('default');
  const [createOnePagerOpen, setCreateOnePagerOpen] = useState(false);
  const [createOnePagerTemplate, setCreateOnePagerTemplate] = useState('product-one-pager');
  const toast = useToast();
  const openCreateOnePager = useCallback((templateId) => {
    if (typeof templateId === 'string') setCreateOnePagerTemplate(templateId);
    setCreateOnePagerOpen(true);
  }, []);
  const closeCreateOnePager = useCallback(() => setCreateOnePagerOpen(false), []);
  const handleOnePagerPublished = useCallback((record) => {
    toast?.push?.(`Published \u201C${record.title}\u201D`, { ttl: 2400 });
  }, [toast]);
  const scrollPositions = useRef({});
  const containerRef = useRef(null);
  const activeSubredditRef = useRef(activeSubreddit);
  const topHeaderControlsRef = useRef(null);
  const topTabsViewportRef = useRef(null);
  const topTabsStandardMeasureRef = useRef(null);
  const topTabsCompactMeasureRef = useRef(null);

  const standardTabs = useMemo(() => buildCommunityTabOptions(hasBoardContent, false), [hasBoardContent]);
  const compactTabs = useMemo(() => buildCommunityTabOptions(hasBoardContent, true), [hasBoardContent]);
  const noopTabChange = useCallback(() => {}, []);
  const tabs = useMemo(
    () => communityTabMode === 'compact' ? compactTabs : standardTabs,
    [communityTabMode, compactTabs, standardTabs],
  );
  const topTabToggleSize = communityTabMode === 'compact' ? 'smDense' : 'sm';

  useEffect(() => {
    if (!hasBoardContent && activeTab === 'my board') setActiveTab('community');
  }, [hasBoardContent, activeTab, setActiveTab]);

  useEffect(() => {
    activeSubredditRef.current = activeSubreddit;
  }, [activeSubreddit]);

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
  }, [activeTab, setActiveTab]);

  const enterSubreddit = useCallback((subreddit) => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setActiveSubreddit((prev) => {
      const prevId = prev?.id || null;
      const nextId = subreddit?.id || null;
      return prevId === nextId ? prev : subreddit;
    });
  }, []);

  const handleSubredditSelect = useCallback((subreddit) => {
    enterSubreddit(subreddit || null);
  }, [enterSubreddit]);

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
      handleSubredditSelect(null);
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeSubreddit, handleSubredditSelect]);

  useEffect(() => {
    if (typeof setBackHandler !== 'function') return undefined;
    if (!activeSubreddit) {
      setBackHandler(null);
      return undefined;
    }

    return setBackHandler(() => {
      if (!activeSubredditRef.current) return false;
      handleSubredditSelect(null);
      return true;
    });
  }, [activeSubreddit, handleSubredditSelect, setBackHandler]);

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
  const ActiveSubredditIcon = activeSubreddit?.icon || null;
  const searchPlaceholder = inSubCommunity
    ? `Search ${activeSubreddit?.name}...`
    : activeTab === 'library' ? 'Search library' : 'Search posts, people, tags...';
  const communityTransitionClassName = prefersReducedMotion ? '' : 'animate-fade-in motion-fade-up';
  const communitySearchStyle = useMemo(() => communitySearchSurface(dark), [dark]);
  const desktopToolbarCols = activeAction
    ? (showSearch ? 'md:grid-cols-[auto_minmax(0,1fr)_auto]' : 'md:grid-cols-[auto_auto]')
    : (showSearch ? 'md:grid-cols-[auto_minmax(0,1fr)]' : 'md:grid-cols-[auto]');

  const updateCommunityTabMode = useCallback(() => {
    const viewport = topTabsViewportRef.current;
    if (!viewport) return;

    const availableWidth = viewport.clientWidth;
    const standardWidth = topTabsStandardMeasureRef.current?.scrollWidth || 0;
    const compactWidth = topTabsCompactMeasureRef.current?.scrollWidth || 0;
    if (!availableWidth || !standardWidth) return;

    const nextMode = standardWidth > availableWidth - 4 && compactWidth > 0 ? 'compact' : 'default';
    setCommunityTabMode((prev) => prev === nextMode ? prev : nextMode);
  }, []);

  useLayoutEffect(() => {
    if (inSubCommunity) return undefined;

    updateCommunityTabMode();
    const controls = topHeaderControlsRef.current;
    if (!controls) return undefined;

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updateCommunityTabMode())
      : null;

    resizeObserver?.observe(controls);
    if (topTabsViewportRef.current) resizeObserver?.observe(topTabsViewportRef.current);
    if (topTabsStandardMeasureRef.current) resizeObserver?.observe(topTabsStandardMeasureRef.current);
    if (topTabsCompactMeasureRef.current) resizeObserver?.observe(topTabsCompactMeasureRef.current);

    window.addEventListener('resize', updateCommunityTabMode);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateCommunityTabMode);
    };
  }, [inSubCommunity, tabs, topTabToggleSize, updateCommunityTabMode]);

  useLayoutEffect(() => {
    if (inSubCommunity) return undefined;

    const viewport = topTabsViewportRef.current;
    if (!viewport) return undefined;

    const selectedIndex = tabs.findIndex((option) => option.value === activeTab);
    const selectedButton = viewport.querySelectorAll('[data-toggle-btn]')[selectedIndex];
    if (!selectedButton) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const gutter = communityTabMode === 'compact' ? 16 : 14;
      const nextLeft = Math.max(0, selectedButton.offsetLeft - gutter);
      const nextRight = selectedButton.offsetLeft + selectedButton.offsetWidth + gutter;
      const viewportLeft = viewport.scrollLeft;
      const viewportRight = viewportLeft + viewport.clientWidth;

      if (nextLeft < viewportLeft) {
        viewport.scrollLeft = nextLeft;
        return;
      }

      if (nextRight > viewportRight) {
        viewport.scrollLeft = Math.max(0, nextRight - viewport.clientWidth);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, communityTabMode, inSubCommunity, tabs]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <div className="flex-shrink-0" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 20px)', backgroundColor: theme.colors.background }}>
        <ScreenTopChrome theme={theme} contentClassName="pb-2.5" fade={false}>
          <div className="space-y-3">

            {/* Desktop: toggles | search | CTA. Mobile: toggles+CTA row, search below. */}
            <div
              ref={topHeaderControlsRef}
              className={`grid grid-cols-[minmax(0,1fr)_auto] ${desktopToolbarCols} items-center gap-x-2.5 gap-y-2.5`}
            >
              <div
                ref={topTabsViewportRef}
                className="min-w-0 col-start-1 row-start-1 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollPaddingLeft: 14, scrollPaddingRight: 16 }}
              >
                <div className="inline-block min-w-full md:min-w-0 pr-1 md:pr-0">
                  <SegmentedToggle
                    value={activeTab}
                    onChange={switchTab}
                    options={tabs}
                    size={topTabToggleSize}
                    theme={theme}
                    fullWidth
                    className="w-full"
                  />
                </div>
              </div>

              {activeAction ? (
                <button
                  type="button"
                  onClick={activeAction}
                  className="col-start-2 row-start-1 md:col-start-3 flex-shrink-0 inline-flex items-center justify-center rounded-full font-semibold transition-all whitespace-nowrap active:scale-[0.97] min-w-[82px] px-3 text-sm leading-none justify-self-end"
                  style={{
                    height: 'var(--jsi-ctrl-h)',
                    backgroundColor: theme.colors.accent || theme.colors.textPrimary,
                    color: theme.colors.accentText || '#FFFFFF',
                  }}
                >
                  {actionLabel}
                </button>
              ) : null}

              {showSearch ? (
                <div className="col-span-2 md:col-span-1 md:col-start-2 row-start-2 md:row-start-1 min-w-0 w-full">
                  <StandardSearchBar
                    id="community-main-search"
                    value={query}
                    onChange={setQuery}
                    placeholder={searchPlaceholder}
                    theme={theme}
                    size="control"
                    style={communitySearchStyle}
                  />
                </div>
              ) : null}

              <div aria-hidden="true" className="absolute invisible pointer-events-none h-0 overflow-hidden whitespace-nowrap">
                <div ref={topTabsStandardMeasureRef} className="inline-block">
                  <SegmentedToggle
                    value={activeTab}
                    onChange={noopTabChange}
                    options={standardTabs}
                    size="sm"
                    theme={theme}
                  />
                </div>
                <div ref={topTabsCompactMeasureRef} className="inline-block ml-4">
                  <SegmentedToggle
                    value={activeTab}
                    onChange={noopTabChange}
                    options={compactTabs}
                    size="smDense"
                    theme={theme}
                  />
                </div>
              </div>
            </div>

            {/* Context strip — same height slot, no layout jump when entering a subreddit. Hidden on lg+ where the sidebar takes over. */}
            <div
              aria-hidden={activeTab !== 'community' ? true : undefined}
              className="lg:hidden"
              style={{
                overflow: 'hidden',
                maxHeight: activeTab === 'community' ? '44px' : '0px',
                transition: 'max-height 260ms cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {inSubCommunity ? (
                <div className="flex items-center gap-2 py-1">
                  <button
                    type="button"
                    onClick={() => handleSubredditSelect(null)}
                    className="flex-shrink-0 flex items-center gap-0.5 rounded-full pl-2 pr-3 text-[0.8125rem] font-semibold transition-colors active:opacity-60"
                    style={{
                      height: 'var(--jsi-ctrl-h)',
                      color: theme.colors.textSecondary,
                      background: theme.colors.subtle,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    All
                  </button>
                  {ActiveSubredditIcon ? (
                    <ActiveSubredditIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: activeSubreddit?.color || theme.colors.textSecondary }} />
                  ) : null}
                  <span className="text-[0.9375rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                    {activeSubreddit?.name}
                  </span>
                </div>
              ) : (
                <ChannelChips
                  theme={theme}
                  dark={dark}
                  onSelect={handleSubredditSelect}
                  activeId={activeSubreddit?.id || null}
                />
              )}
            </div>

          </div>
        </ScreenTopChrome>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 pt-1" style={{ position: 'relative' }}>
          <div
            className={
              activeTab === 'community' || activeTab === 'my board'
                ? 'lg:grid lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-8 lg:items-start'
                : ''
            }
            style={{ position: 'relative' }}
          >
            {/* Desktop channel sidebar — always visible on lg+ for community/board tabs */}
            {(activeTab === 'community' || activeTab === 'my board') ? (
              <div className="hidden lg:block">
                <ChannelSidebar
                  theme={theme}
                  dark={dark}
                  activeId={activeSubreddit?.id || null}
                  onSelect={handleSubredditSelect}
                />
              </div>
            ) : null}

            <div className="min-w-0 relative">
              <div style={paneStyle('community')}>
                <div className="md:max-w-[680px] md:mx-auto lg:mx-0 lg:max-w-[680px] xl:max-w-none">
                  <div key={`community-feed-${activeSubreddit?.id || 'root'}`} className={communityTransitionClassName}>
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
                </div>
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
                <MakersStudioTab theme={theme} currentUserId={currentUserId} onNavigate={onNavigate} onCreateOnePager={openCreateOnePager} />
              </div>

              {hasBoardContent && (
                <div style={paneStyle('my board')}>
                  <div className="md:max-w-[680px] md:mx-auto lg:mx-0 lg:max-w-[680px]">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateOnePagerModal
        show={createOnePagerOpen}
        onClose={closeCreateOnePager}
        theme={theme}
        initialTemplate={createOnePagerTemplate}
        onPublished={handleOnePagerPublished}
      />

      {focusedPost && (
        <PostDetailSheet
          post={focusedPost}
          theme={theme}
          dark={dark}
          isLiked={!!likedPosts?.[focusedPost.id]}
          isUpvoted={!!postUpvotes?.[focusedPost.id]}
          onToggleLike={onToggleLike}
          onUpvote={onUpvote}
          onAddComment={onAddComment}
          onClose={closeFocusedPost}
        />
      )}
    </div>
  );
};

export default CommunityLibraryLayout;
