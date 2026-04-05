import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ChannelAwareFeed } from './components/community/ChannelAwareFeed.jsx';
import { MyBoardView } from './components/community/MyBoardView.jsx';
import { MakersStudioTab } from './components/community/MakersStudioTab.jsx';

// ─── Main Layout ───────────────────────────────────────────────────────────────
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
    const hasComments = (posts || []).some(p => (p.comments || []).some(c => c.name === 'You'));
    return savedImageIds.length > 0 || Object.keys(likedPosts || {}).length > 0 || hasComments;
  }, [savedImageIds, likedPosts, posts]);

  const TABS = useMemo(() => hasBoardContent ? ['Community', 'Library', 'Makers Studio', 'My Board'] : ['Community', 'Library', 'Makers Studio'], [hasBoardContent]);

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
    requestAnimationFrame(() => { if (containerRef.current) containerRef.current.scrollTop = scrollPositions.current[tab] || 0; });
  }, [activeTab]);

  const enterSubreddit = useCallback((sub) => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setActiveSubreddit(sub);
  }, []);

  const exitSubreddit = useCallback(() => setActiveSubreddit(null), []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); document.getElementById('community-main-search')?.querySelector('input')?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Patch the global back handler while in a sub-community
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

  const tr = prefersReducedMotion ? 'none' : 'opacity 200ms ease, transform 200ms ease';
  const paneStyle = (name) => activeTab === name
    ? { position: 'relative', opacity: 1, transform: 'translateX(0)', transition: tr, pointerEvents: 'auto' }
    : { position: 'absolute', inset: 0, opacity: 0, transform: 'translateX(16px)', transition: tr, pointerEvents: 'none' };

  const chipStyle = (isActive) => ({
    color: isActive ? theme.colors.accentText : (dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'),
    borderColor: isActive ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'),
    backgroundColor: isActive ? theme.colors.accent : 'transparent',
  });

  const inSubCommunity = activeTab === 'community' && !!activeSubreddit;
  const SubIcon = activeSubreddit?.icon;
  const showSearch = activeTab !== 'my board' && activeTab !== 'makers studio';

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>

      {/* ── Controls header ── */}
      <div className="flex-shrink-0 px-4 pt-2" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-3xl mx-auto w-full">

          {/* Tab row — chips or sub-community back bar */}
          <div className="h-9 flex items-center">
            {inSubCommunity ? (
              /* Sub-community back bar */
              <div className="flex items-center gap-2">
                <button
                  onClick={exitSubreddit}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all active:scale-95 border"
                  style={{
                    color: theme.colors.textSecondary,
                    borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </button>
                {SubIcon && (
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activeSubreddit?.color}18`, color: activeSubreddit?.color }}>
                    <SubIcon className="w-3 h-3" />
                  </div>
                )}
                <span className="text-[15px] font-bold" style={{ color: theme.colors.textPrimary }}>{activeSubreddit?.name}</span>
                {activeSubreddit?.members && (
                  <span className="text-[11px]" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{activeSubreddit.members}</span>
                )}
              </div>
            ) : (
              /* Tab chip pills */
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => switchTab(tab.toLowerCase())}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap transition-all active:scale-95 border"
                    style={chipStyle(activeTab === tab.toLowerCase())}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search + action button */}
          {showSearch && (
            <div className="flex items-center gap-2 mt-2 mb-1.5">
              <div className="flex-1">
                <StandardSearchBar
                  id="community-main-search"
                  value={query}
                  onChange={setQuery}
                  placeholder={inSubCommunity ? `Search ${activeSubreddit?.name}\u2026` : activeTab === 'library' ? 'Search library' : 'Search posts, people, tags\u2026'}
                  theme={theme}
                />
              </div>
              <button
                onClick={activeTab === 'library' ? openLibraryUploadModal : openCreateContentModal}
                className="h-10 px-4 rounded-full text-xs font-semibold transition-all active:scale-95 flex-shrink-0"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                {activeTab === 'library' ? '+ Upload' : '+ Post'}
              </button>
            </div>
          )}
          {!showSearch && <div className="mb-1.5" />}
        </div>
      </div>

      {/* ── Content panes ── */}
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
              <LibraryGrid theme={theme} query={query} savedImageIds={savedImageIds} onToggleSaveImage={onToggleSaveImage} assetsOverride={libraryAssets} />
            </div>

            <div style={paneStyle('makers studio')}>
              <MakersStudioTab theme={theme} />
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
