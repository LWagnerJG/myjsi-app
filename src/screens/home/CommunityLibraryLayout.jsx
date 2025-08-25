import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { CommunityScreen } from '../community/CommunityScreen.jsx';
import { motion } from 'framer-motion';

// Combined Community / Library layout with segmented toggle + shared search bar + animated indicator
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
  const tabContainerRef = useRef(null);
  const btnRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const measure = useCallback(() => {
    const btn = btnRefs.current[activeTab];
    const wrap = tabContainerRef.current;
    if (!btn || !wrap) return;
    const br = btn.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setIndicatorStyle({ left: br.left - wr.left, width: br.width });
  }, [activeTab]);

  useEffect(() => { measure(); }, [measure, activeTab]);
  useEffect(() => { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }, [measure]);

  const switchTab = useCallback((tab) => {
    if (tab === activeTab) return;
    if (containerRef.current) scrollPositions.current[activeTab] = containerRef.current.scrollTop;
    setActiveTab(tab);
    requestAnimationFrame(() => {
      if (containerRef.current) containerRef.current.scrollTop = scrollPositions.current[tab] || 0;
    });
  }, [activeTab]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); const inp = document.getElementById('community-library-search'); inp?.focus(); }
      if (e.key === 'ArrowLeft') switchTab('community');
      if (e.key === 'ArrowRight') switchTab('library');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [switchTab]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div ref={headerRef} className="px-5 pt-3 pb-3 sticky top-0 z-10 space-y-3" style={{ background: theme.colors.background, transition:'filter 180ms ease, opacity 180ms ease' }}>
        {/* Toggle + Post */}
        <div className="flex items-center gap-4">
          <div ref={tabContainerRef} role="tablist" aria-label="Community or Library" className="relative flex rounded-full p-1" style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, boxShadow: `0 8px 24px ${theme.colors.shadow}` }}>
            {/* animated background */}
            {indicatorStyle.width > 0 && (
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute top-1 bottom-1 rounded-full"
                style={{ left: indicatorStyle.left, width: indicatorStyle.width, background: theme.colors.accent }}
              />
            )}
            {['community', 'library'].map(tab => {
              const active = tab === activeTab;
              return (
                <button
                  key={tab}
                  ref={el => btnRefs.current[tab] = el}
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchTab(tab)}
                  className="relative px-6 h-12 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2"
                  style={{ color: active ? '#fff' : theme.colors.textSecondary }}
                >
                  <span className="relative z-10">{tab === 'community' ? 'Community' : 'Library'}</span>
                </button>
              );
            })}
          </div>
          {activeTab === 'community' && (
            <button onClick={openCreateContentModal} className="ml-auto px-6 h-12 rounded-full text-sm font-semibold transition-transform active:scale-95" style={{ background: theme.colors.accent, color: '#fff' }}>+ Post</button>
          )}
        </div>
        {/* Unified Search */}
        <div className="w-full">
          <div className="flex items-center px-6" style={{ height: 56, borderRadius: 9999, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, boxShadow: `0 8px 24px ${theme.colors.shadow}` }}>
            <input id="community-library-search" value={query} onChange={e => setQuery(e.target.value)} placeholder={activeTab === 'community' ? 'Search posts, people, tags...' : 'Search products, finishes, shots...'} className="flex-1 bg-transparent outline-none text-[15px] placeholder:opacity-70" style={{ color: theme.colors.textPrimary }} />
          </div>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {activeTab === 'community' && (
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
        {activeTab === 'library' && (
          <LibraryGrid theme={theme} query={query} onQueryChange={setQuery} parentHeaderRef={headerRef} />
        )}
      </div>
    </div>
  );
};

export default CommunityLibraryLayout;
