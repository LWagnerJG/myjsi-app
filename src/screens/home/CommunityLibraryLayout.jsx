import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { CommunityScreen } from '../community/CommunityScreen.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';

export const CommunityLibraryLayout = ({
  theme,
  posts, polls, likedPosts, pollChoices,
  onToggleLike, onPollVote, onAddComment, openCreateContentModal,
}) => {
  const [activeTab, setActiveTab] = useState('community');
  const [query, setQuery] = useState('');
  const scrollPositions = useRef({ community: 0, library: 0 });
  const containerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleScroll = useCallback(() => { if (containerRef.current) setIsScrolled(containerRef.current.scrollTop > 10); }, []);

  const switchTab = useCallback((tab) => {
    if (tab === activeTab) return;
    if (containerRef.current) scrollPositions.current[activeTab] = containerRef.current.scrollTop;
    setActiveTab(tab);
    requestAnimationFrame(()=> { if (containerRef.current) containerRef.current.scrollTop = scrollPositions.current[tab] || 0; });
  }, [activeTab]);

  // Keyboard shortcuts (left/right, ctrl+/ focus search)
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); document.getElementById('community-main-search')?.querySelector('input')?.focus(); }
      if (e.key === 'ArrowLeft') switchTab('community');
      if (e.key === 'ArrowRight') switchTab('library');
    }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, [switchTab]);

  // Animation helper styles
  const paneTransition = prefersReducedMotion ? 'none' : 'opacity 240ms ease, transform 240ms ease';

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      {/* Header controls - fixed below app header */}
      <div className="flex-shrink-0" style={{ backgroundColor: theme.colors.background }}>
        {/* Segmented toggle + Post CTA */}
        <div className="px-4 sm:px-6 lg:px-8 pt-1 pb-1 w-full">
          <div className="max-w-5xl mx-auto w-full flex gap-4 items-center">
            <div className="relative flex flex-[3] rounded-full border overflow-hidden h-12 shadow-sm" style={{ borderColor: theme.colors.border, background: '#ffffff' }}>
              {/* animated background indicator */}
              <div aria-hidden="true" style={{ position:'absolute', top:4, bottom:4, left: activeTab==='community'?4:'50%', width:'calc(50% - 8px)', borderRadius:9999, background: theme.colors.accent, transition: prefersReducedMotion? 'none':'left 240ms cubic-bezier(.3,1,.3,1)' }} />
              <button
                onClick={()=>switchTab('community')}
                className="flex-1 h-full px-6 text-sm font-semibold flex items-center justify-center relative"
                style={{ color: activeTab==='community'? '#ffffff' : theme.colors.textPrimary, transition:'color 160ms ease' }}
                aria-pressed={activeTab==='community'}
              >
                Community
              </button>
              <button
                onClick={()=>switchTab('library')}
                className="flex-1 h-full px-6 text-sm font-semibold flex items-center justify-center relative"
                style={{ color: activeTab==='library'? '#ffffff' : theme.colors.textPrimary, transition:'color 160ms ease' }}
                aria-pressed={activeTab==='library'}
              >
                Library
              </button>
            </div>
            <button onClick={openCreateContentModal} className="flex-[1.2] h-12 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm" style={{ backgroundColor: theme.colors.accent, color:'#fff', boxShadow:'0 4px 14px rgba(0,0,0,0.08)' }}>
              + Post
            </button>
          </div>
        </div>
        {/* Search bar */}
        <div className="px-4 sm:px-6 lg:px-8 mt-2 mb-2">
          <div className="max-w-5xl mx-auto w-full">
          <StandardSearchBar
            id="community-main-search"
            value={query}
            onChange={setQuery}
            placeholder={activeTab==='community'? 'Search posts, people, tags...':'Search library'}
            theme={{...theme, colors:{...theme.colors, surface:'#ffffff'}}}
          />
          </div>
        </div>
      </div>
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-4 scrollbar-hide">
        <div className="mx-auto w-full max-w-5xl" style={{ position:'relative' }}>
          {/* Active pane remains in normal flow so container height = active content height. Inactive pane is absolutely positioned overlay to allow animation without cutting off scroll height. */}
          <div style={{ position:'relative' }}>
            {/* Community Pane */}
            <div style={ activeTab==='community' ? {
                position:'relative',
                opacity:1,
                transform:'translateX(0)',
                transition:paneTransition,
                pointerEvents:'auto'
              } : {
                position:'absolute', inset:0,
                opacity:0,
                transform:'translateX(12px)',
                transition:paneTransition,
                pointerEvents:'none'
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
            <div style={ activeTab==='library' ? {
                position:'relative',
                opacity:1,
                transform:'translateX(0)',
                transition:paneTransition,
                pointerEvents:'auto'
              } : {
                position:'absolute', inset:0,
                opacity:0,
                transform:'translateX(-12px)',
                transition:paneTransition,
                pointerEvents:'none'
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
