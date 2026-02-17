import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { CommunityScreen } from '../community/CommunityScreen.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';

export const CommunityLibraryLayout = ({
  theme,
  posts, polls, likedPosts, pollChoices,
  onToggleLike, onPollVote, onAddComment, openCreateContentModal,
}) => {
  const [activeTab, setActiveTab] = useState('community');
  const [query, setQuery] = useState('');
  const scrollPositions = useRef({ community: 0, library: 0 });
  const containerRef = useRef(null);
  const dark = isDarkTheme(theme);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const switchTab = useCallback((tab) => {
    if (tab === activeTab) return;
    if (containerRef.current) scrollPositions.current[activeTab] = containerRef.current.scrollTop;
    setActiveTab(tab);
    requestAnimationFrame(()=> { if (containerRef.current) containerRef.current.scrollTop = scrollPositions.current[tab] || 0; });
  }, [activeTab]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); document.getElementById('community-main-search')?.querySelector('input')?.focus(); }
      if (e.key === 'ArrowLeft') switchTab('community');
      if (e.key === 'ArrowRight') switchTab('library');
    }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, [switchTab]);

  const paneTransition = prefersReducedMotion ? 'none' : 'opacity 240ms ease, transform 240ms ease';

  const tabStyle = (isActive) => ({
    color: isActive ? theme.colors.textPrimary : (dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'),
    fontWeight: isActive ? 700 : 500,
    borderBottom: isActive ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
  });

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      {/* Clean header: tabs · search · post */}
      <div className="flex-shrink-0 px-4" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-lg mx-auto w-full">
          {/* Row 1: Tabs + Post button */}
          <div className="flex items-center gap-1 pt-1">
            {['Community', 'Library'].map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab.toLowerCase())}
                className="text-[15px] px-3 py-2 transition-all"
                style={tabStyle(activeTab === tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
            <button
              onClick={openCreateContentModal}
              className="ml-auto h-8 px-4 rounded-full text-[12px] font-semibold transition-all active:scale-95"
              style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
            >
              + Post
            </button>
          </div>
          {/* Row 2: Search */}
          <div className="mt-2 mb-2">
            <StandardSearchBar
              id="community-main-search"
              value={query}
              onChange={setQuery}
              placeholder={activeTab === 'community' ? 'Search posts, people, tags...' : 'Search library'}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* Content panes */}
      <div ref={containerRef} className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <div className="mx-auto w-full max-w-lg px-4" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            {/* Community Pane */}
            <div style={activeTab === 'community' ? {
              position: 'relative', opacity: 1, transform: 'translateX(0)',
              transition: paneTransition, pointerEvents: 'auto'
            } : {
              position: 'absolute', inset: 0, opacity: 0, transform: 'translateX(12px)',
              transition: paneTransition, pointerEvents: 'none'
            }}>
              <CommunityScreen
                theme={theme}
                posts={posts}
                polls={polls}
                likedPosts={likedPosts}
                pollChoices={pollChoices}
                onToggleLike={onToggleLike}
                onPollVote={onPollVote}
                onAddComment={onAddComment}
                openCreateContentModal={openCreateContentModal}
                embedMode
                externalQuery={query}
              />
            </div>
            {/* Library Pane */}
            <div style={activeTab === 'library' ? {
              position: 'relative', opacity: 1, transform: 'translateX(0)',
              transition: paneTransition, pointerEvents: 'auto'
            } : {
              position: 'absolute', inset: 0, opacity: 0, transform: 'translateX(-12px)',
              transition: paneTransition, pointerEvents: 'none'
            }}>
              <LibraryGrid theme={theme} query={query} onQueryChange={setQuery} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLibraryLayout;
