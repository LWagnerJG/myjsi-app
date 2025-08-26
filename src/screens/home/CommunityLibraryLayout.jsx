import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { CommunityScreen } from '../community/CommunityScreen.jsx';
import { Search } from 'lucide-react';

// Projects-style Community / Library layout with segmented toggle + CTA and search below
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
        {/* Segmented control + CTA (classic style) */}
        <div className="px-4 pt-6 pb-2 w-full">
          <div className="flex w-full gap-4 items-center">
            <div className="flex flex-[3] rounded-full border overflow-hidden h-12" style={{ borderColor: theme.colors.border }}>
              <button onClick={()=>switchTab('community')} className="flex-1 h-full px-6 text-sm font-semibold flex items-center justify-center" style={{ backgroundColor: activeTab==='community'? theme.colors.accent:'transparent', color: activeTab==='community'? '#fff': theme.colors.textSecondary }}>
                Community
              </button>
              <button onClick={()=>switchTab('library')} className="flex-1 h-full px-6 text-sm font-semibold flex items-center justify-center" style={{ backgroundColor: activeTab==='library'? theme.colors.accent:'transparent', color: activeTab==='library'? '#fff': theme.colors.textSecondary }}>
                Library
              </button>
            </div>
            {activeTab === 'community' && (
              <button onClick={openCreateContentModal} className="flex-[1.2] h-12 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0" style={{ backgroundColor: theme.colors.accent, color:'#fff', boxShadow:'0 4px 14px rgba(0,0,0,0.08)' }}>
                <span className="truncate">+ Post</span>
              </button>
            )}
            {activeTab === 'library' && <div className="flex-[1.2]" />}
          </div>
        </div>
        {/* Search bar with adjusted margins: more top buffer, less bottom */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-3 px-5" style={{ height: 52, borderRadius: 9999, background: theme.colors.surface, border:`1px solid ${theme.colors.border}` }}>
            <Search className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            <input id="community-main-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={activeTab==='community'? 'Search posts, people, tags...':'Search library'} className="flex-1 bg-transparent outline-none text-[14px] placeholder:opacity-70" style={{ color: theme.colors.textPrimary }} />
          </div>
        </div>
      </div>
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pb-10 pt-4 space-y-4 scrollbar-hide">
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
