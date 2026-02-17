import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { CommunityScreen } from '../community/CommunityScreen.jsx';
import { INITIAL_ASSETS } from '../library/data.js';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { Monitor, Lightbulb, Camera, HelpCircle, Zap, TrendingUp, ArrowLeft, Users, Heart, MessageSquare, Bookmark } from 'lucide-react';

/* â”€â”€ Sub-communities / Channels â”€â”€ */
const CHANNELS = [
  { id: 'cet-configurra', name: 'CET / Configurra', description: 'Tips, workarounds, and questions for CET Designer and Configurra users.', icon: Monitor, color: '#4A7C59', members: 84, tag: 'Software' },
  { id: 'spec-tips', name: 'Spec Tips', description: 'Share your best practices for specifying JSI products â€” finishes, fabric grades, configurations.', icon: Lightbulb, color: '#C4956A', members: 147, tag: 'Knowledge' },
  { id: 'install-wins', name: 'Install Wins', description: 'Show off completed projects. Photos, stories, client reactions.', icon: Camera, color: '#5B7B8C', members: 212, tag: 'Installs' },
  { id: 'design-help', name: 'Design Help', description: 'Get feedback on layouts, material pairings, and space plans before you present.', icon: HelpCircle, color: '#7B6A8C', members: 96, tag: 'Design' },
  { id: 'quick-ship', name: 'Quick Ship', description: "Discuss lead times, availability updates, and creative Quick Ship solutions when timelines are tight.", icon: Zap, color: '#8C6A4A', members: 63, tag: 'Logistics' },
  { id: 'market-intel', name: 'Market Intel', description: "Competitive landscape, pricing strategy, and what you're hearing from customers in the field.", icon: TrendingUp, color: '#4A6A8C', members: 55, tag: 'Sales' },
];

/* â”€â”€ Channel feed empty-state â”€â”€ */
const ChannelFeed = ({ channel, theme, dark }) => {
  const Icon = channel.icon;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${channel.color}18` }}>
        <Icon className="w-7 h-7" style={{ color: channel.color }} />
      </div>
      <p className="text-[14px] font-semibold" style={{ color: theme.colors.textPrimary }}>Be the first to post in {channel.name}</p>
      <div className="rounded-xl px-4 py-3 mt-1 max-w-xs text-center" style={{ backgroundColor: `${channel.color}10`, border: `1px solid ${channel.color}25` }}>
        <p className="text-[12px] leading-relaxed" style={{ color: theme.colors.textSecondary }}>{channel.description}</p>
        <p className="text-[10px] mt-2 font-medium" style={{ color: theme.colors.textSecondary }}>
          <Users className="w-2.5 h-2.5 inline mr-0.5" style={{ position: 'relative', top: '-0.5px' }} /> {channel.members} members
        </p>
      </div>
    </div>
  );
};

/* â”€â”€ Channel pill strip + aware feed â”€â”€ */
const ChannelAwareFeed = ({ theme, dark, posts, polls, likedPosts, pollChoices, onToggleLike, onPollVote, onAddComment, openCreateContentModal, query }) => {
  const [activeChannel, setActiveChannel] = useState(null); // null = "All"

  return (
    <>
      {/* Horizontal pill strip */}
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 pt-1 px-0 -mx-4 px-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Back arrow when inside a channel */}
        {activeChannel && (
          <button
            onClick={() => setActiveChannel(null)}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
          </button>
        )}
        {/* "All" pill */}
        <button
          onClick={() => setActiveChannel(null)}
          className="flex-shrink-0 h-8 px-4 rounded-full text-[12px] font-semibold transition-all"
          style={{
            backgroundColor: !activeChannel ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.055)'),
            color: !activeChannel ? theme.colors.accentText : theme.colors.textSecondary,
          }}
        >
          All
        </button>
        {CHANNELS.map(ch => {
          const isActive = activeChannel?.id === ch.id;
          const Icon = ch.icon;
          return (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition-all"
              style={{
                backgroundColor: isActive ? `${ch.color}22` : (dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.055)'),
                color: isActive ? ch.color : theme.colors.textSecondary,
                border: isActive ? `1px solid ${ch.color}55` : '1px solid transparent',
              }}
            >
              <Icon className="w-3 h-3" />
              {ch.name}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <div className="mt-2">
        {activeChannel ? (
          <ChannelFeed channel={activeChannel} theme={theme} dark={dark} />
        ) : (
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
      </div>
    </>
  );
};

/* â”€â”€ My Board personal catalog â”€â”€ */
const MyBoardView = ({ theme, dark, savedImageIds, onToggleSaveImage, posts, likedPosts }) => {
  const savedAssets = useMemo(() => INITIAL_ASSETS.filter(a => savedImageIds.includes(a.id)), [savedImageIds]);
  const likedPostsList = useMemo(() => (posts || []).filter(p => likedPosts && likedPosts[p.id]), [posts, likedPosts]);
  const myComments = useMemo(() => (posts || []).flatMap(p =>
    (p.comments || []).filter(c => c.name === 'You').map(c => ({ ...c, post: p }))
  ), [posts]);

  const sectionHeader = (label, count, Icon) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
      <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>{label}</span>
      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: theme.colors.textSecondary }}>{count}</span>
    </div>
  );

  return (
    <div className="space-y-8 pt-2 pb-10">
      {/* Saved Images */}
      <section>
        {sectionHeader('Saved Images', savedAssets.length, Bookmark)}
        {savedAssets.length > 0 ? (
          <LibraryGrid
            theme={theme}
            query=""
            savedImageIds={savedImageIds}
            onToggleSaveImage={onToggleSaveImage}
            assetsOverride={savedAssets}
          />
        ) : (
          <p className="text-[13px] text-center py-6" style={{ color: theme.colors.textSecondary }}>
            Tap â™¡ on any library image to save it here.
          </p>
        )}
      </section>

      {/* Liked Posts */}
      <section>
        {sectionHeader('Liked Posts', likedPostsList.length, Heart)}
        {likedPostsList.length > 0 ? (
          <div className="space-y-3">
            {likedPostsList.map(p => (
              <div key={p.id} className="rounded-2xl p-3.5" style={{ backgroundColor: dark ? '#1e1e1e' : '#fff', border: `1px solid ${theme.colors.border}` }}>
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: theme.colors.textPrimary }}>{p.author || p.name || 'Community Member'}</p>
                <p className="text-[12px] line-clamp-3" style={{ color: theme.colors.textSecondary }}>{p.content || p.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-center py-4" style={{ color: theme.colors.textSecondary }}>
            Posts you like will appear here.
          </p>
        )}
      </section>

      {/* My Comments */}
      <section>
        {sectionHeader('My Comments', myComments.length, MessageSquare)}
        {myComments.length > 0 ? (
          <div className="space-y-3">
            {myComments.map(c => (
              <div key={c.id} className="rounded-2xl p-3.5" style={{ backgroundColor: dark ? '#1e1e1e' : '#fff', border: `1px solid ${theme.colors.border}` }}>
                <p className="text-[11px] mb-1 font-medium" style={{ color: theme.colors.textSecondary }}>
                  On: <span style={{ color: theme.colors.textPrimary }}>{c.post.author || c.post.name || 'post'}</span>
                </p>
                <p className="text-[13px]" style={{ color: theme.colors.textPrimary }}>{c.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-center py-4" style={{ color: theme.colors.textSecondary }}>
            Comments you write will appear here.
          </p>
        )}
      </section>
    </div>
  );
};

/* â”€â”€ Main Layout â”€â”€ */
export const CommunityLibraryLayout = ({
  theme,
  posts, polls, likedPosts, pollChoices,
  onToggleLike, onPollVote, onAddComment, openCreateContentModal,
  savedImageIds = [], onToggleSaveImage,
}) => {
  const dark = isDarkTheme(theme);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasBoardContent = useMemo(() => {
    const myComments = (posts || []).some(p => (p.comments || []).some(c => c.name === 'You'));
    return savedImageIds.length > 0 || Object.keys(likedPosts || {}).length > 0 || myComments;
  }, [savedImageIds, likedPosts, posts]);

  const TABS = useMemo(() => hasBoardContent ? ['Community', 'Library', 'My Board'] : ['Community', 'Library'], [hasBoardContent]);

  const [activeTab, setActiveTab] = useState('community');
  const [query, setQuery] = useState('');
  const scrollPositions = useRef({});
  const containerRef = useRef(null);

  // If My Board disappears (all content removed), go back to Community
  useEffect(() => {
    if (!hasBoardContent && activeTab === 'my board') setActiveTab('community');
  }, [hasBoardContent, activeTab]);

  const switchTab = useCallback((tab) => {
    if (tab === activeTab) return;
    if (containerRef.current) scrollPositions.current[activeTab] = containerRef.current.scrollTop;
    setActiveTab(tab);
    requestAnimationFrame(() => { if (containerRef.current) containerRef.current.scrollTop = scrollPositions.current[tab] || 0; });
  }, [activeTab]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); document.getElementById('community-main-search')?.querySelector('input')?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const paneTransition = prefersReducedMotion ? 'none' : 'opacity 200ms ease, transform 200ms ease';

  const tabStyle = (isActive) => ({
    color: isActive ? theme.colors.textPrimary : (dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'),
    fontWeight: isActive ? 700 : 500,
    borderBottom: isActive ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
  });

  const paneStyle = (tabName) => {
    const isActive = activeTab === tabName;
    return isActive ? {
      position: 'relative', opacity: 1, transform: 'translateX(0)',
      transition: paneTransition, pointerEvents: 'auto',
    } : {
      position: 'absolute', inset: 0, opacity: 0, transform: 'translateX(16px)',
      transition: paneTransition, pointerEvents: 'none',
    };
  };

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-lg mx-auto w-full">
          {/* Tabs + Post button */}
          <div className="flex items-center gap-0.5 pt-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab.toLowerCase())}
                className="text-[14px] px-3 py-2 transition-all"
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
          {/* Search (shown for Community and Library) */}
          {(activeTab === 'community' || activeTab === 'library') && (
            <div className="mt-2 mb-2">
              <StandardSearchBar
                id="community-main-search"
                value={query}
                onChange={setQuery}
                placeholder={activeTab === 'community' ? 'Search posts, people, tags...' : 'Search library'}
                theme={theme}
              />
            </div>
          )}
          {(activeTab === 'my board') && <div className="mb-2" />}
        </div>
      </div>

      {/* Content panes */}
      <div ref={containerRef} className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <div className="mx-auto w-full max-w-lg px-4" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>

            {/* Community Pane (with inline channel pills) */}
            <div style={paneStyle('community')}>
              <ChannelAwareFeed
                theme={theme}
                dark={dark}
                posts={posts}
                polls={polls}
                likedPosts={likedPosts}
                pollChoices={pollChoices}
                onToggleLike={onToggleLike}
                onPollVote={onPollVote}
                onAddComment={onAddComment}
                openCreateContentModal={openCreateContentModal}
                query={query}
              />
            </div>

            {/* Library Pane */}
            <div style={paneStyle('library')}>
              <LibraryGrid
                theme={theme}
                query={query}
                savedImageIds={savedImageIds}
                onToggleSaveImage={onToggleSaveImage}
              />
            </div>

            {/* My Board Pane */}
            {hasBoardContent && (
              <div style={paneStyle('my board')}>
                <MyBoardView
                  theme={theme}
                  dark={dark}
                  savedImageIds={savedImageIds}
                  onToggleSaveImage={onToggleSaveImage}
                  posts={posts}
                  likedPosts={likedPosts}
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

