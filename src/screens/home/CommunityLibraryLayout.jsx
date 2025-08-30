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
  const headerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

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
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); document.getElementById('community-main-search')?.focus(); }
      if (e.key === 'ArrowLeft') switchTab('community');
      if (e.key === 'ArrowRight') switchTab('library');
    }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, [switchTab]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div ref={headerRef} className={`sticky top-0 z-10 transition-all ${isScrolled ? 'shadow-md':''}`} style={{ backgroundColor: isScrolled? `${theme.colors.background}e8`: theme.colors.background, backdropFilter: isScrolled? 'blur(12px)':'none', borderBottom:`1px solid ${isScrolled? theme.colors.border+'40':'transparent'}` }}>
        {/* Segmented toggle + Post CTA (original style; only change: inactive stays pure white) */}
        <div className="px-4 pt-4 pb-1 w-full">
          <div className="flex w-full gap-4 items-center">
            <div className="flex flex-[3] rounded-full border overflow-hidden h-12 shadow-sm" style={{ borderColor: theme.colors.border, background: '#ffffff' }}>
              <button
                onClick={()=>switchTab('community')}
                className="flex-1 h-full px-6 text-sm font-semibold flex items-center justify-center"
                style={{
                  backgroundColor: activeTab==='community'? theme.colors.accent : '#ffffff',
                  color: activeTab==='community'? '#ffffff' : theme.colors.textPrimary
                }}
              >
                Community
              </button>
              <button
                onClick={()=>switchTab('library')}
                className="flex-1 h-full px-6 text-sm font-semibold flex items-center justify-center"
                style={{
                  backgroundColor: activeTab==='library'? theme.colors.accent : '#ffffff',
                  color: activeTab==='library'? '#ffffff' : theme.colors.textPrimary
                }}
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
        <div className="px-4 mt-3 mb-3">
          <StandardSearchBar
            value={query}
            onChange={setQuery}
            placeholder={activeTab==='community'? 'Search posts, people, tags...':'Search library'}
            theme={{...theme, colors:{...theme.colors, surface:'#ffffff'}}}
          />
        </div>
      </div>
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pb-10 pt-3 space-y-4 scrollbar-hide">
        <div className="mx-auto w-full" style={{ maxWidth: '100%' }}>
          {activeTab==='community' && (
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
          )}
          {activeTab==='library' && (
            <LibraryGrid theme={theme} query={query} onQueryChange={setQuery} parentHeaderRef={headerRef} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityLibraryLayout;
