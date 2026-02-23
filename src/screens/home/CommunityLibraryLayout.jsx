import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ChannelAwareFeed } from './components/community/ChannelAwareFeed.jsx';
import { MyBoardView } from './components/community/MyBoardView.jsx';

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
              <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
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
              <button onClick={openCreateContentModal} className="h-12 px-5 rounded-full text-xs font-semibold transition-all active:scale-95 flex-shrink-0" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
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
