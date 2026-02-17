import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LibraryGrid } from '../library/LibraryGrid.jsx';
import { CommunityScreen } from '../community/CommunityScreen.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { Monitor, Lightbulb, Camera, HelpCircle, Zap, TrendingUp, ChevronRight, ArrowLeft, Users } from 'lucide-react';

/* ── Sub-communities / Channels ── */
const CHANNELS = [
  {
    id: 'cet-configurra',
    name: 'CET / Configurra',
    description: 'Tips, workarounds, and questions for CET Designer and Configurra users.',
    icon: Monitor,
    color: '#4A7C59',
    members: 84,
    tag: 'Software',
  },
  {
    id: 'spec-tips',
    name: 'Spec Tips & Tricks',
    description: 'Share your best practices for specifying JSI products — finishes, fabric grades, configurations.',
    icon: Lightbulb,
    color: '#C4956A',
    members: 147,
    tag: 'Knowledge',
  },
  {
    id: 'install-wins',
    name: 'Install Wins',
    description: 'Show off completed projects. Photos, stories, client reactions.',
    icon: Camera,
    color: '#5B7B8C',
    members: 212,
    tag: 'Installs',
  },
  {
    id: 'design-help',
    name: 'Design Help',
    description: 'Get feedback on layouts, material pairings, and space plans before you present.',
    icon: HelpCircle,
    color: '#7B6A8C',
    members: 96,
    tag: 'Design',
  },
  {
    id: 'quick-ship',
    name: 'Quick Ship',
    description: "Discuss lead times, availability updates, and creative Quick Ship solutions when timelines are tight.",
    icon: Zap,
    color: '#8C6A4A',
    members: 63,
    tag: 'Logistics',
  },
  {
    id: 'market-intel',
    name: 'Market Intel',
    description: 'Competitive landscape, pricing strategy, and what you\'re hearing from customers in the field.',
    icon: TrendingUp,
    color: '#4A6A8C',
    members: 55,
    tag: 'Sales',
  },
];

const ChannelCard = ({ channel, theme, dark, onClick }) => {
  const Icon = channel.icon;
  return (
    <button
      onClick={() => onClick(channel)}
      className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
      style={{
        backgroundColor: dark ? '#2A2A2A' : '#FFFFFF',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${channel.color}18` }}
      >
        <Icon className="w-5 h-5" style={{ color: channel.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold" style={{ color: theme.colors.textPrimary }}>{channel.name}</span>
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${channel.color}18`, color: channel.color }}
          >
            {channel.tag}
          </span>
        </div>
        <p className="text-[11px] mt-0.5 line-clamp-2 leading-snug" style={{ color: theme.colors.textSecondary }}>{channel.description}</p>
        <p className="text-[10px] mt-1 font-medium" style={{ color: theme.colors.textSecondary }}>
          <Users className="w-2.5 h-2.5 inline mr-0.5 relative" style={{ top: '-0.5px' }} /> {channel.members} members
        </p>
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
    </button>
  );
};

const ChannelFeed = ({ channel, theme, dark, onBack }) => {
  const Icon = channel.icon;
  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="flex items-center gap-3 pt-2 pb-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />
        </button>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${channel.color}18` }}>
          <Icon className="w-4 h-4" style={{ color: channel.color }} />
        </div>
        <div>
          <p className="text-[14px] font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>{channel.name}</p>
          <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>{channel.members} members</p>
        </div>
      </div>

      {/* Channel description */}
      <div
        className="rounded-xl px-4 py-3 mb-3"
        style={{ backgroundColor: `${channel.color}10`, border: `1px solid ${channel.color}25` }}
      >
        <p className="text-[12px] leading-relaxed" style={{ color: theme.colors.textSecondary }}>{channel.description}</p>
      </div>

      {/* Empty state — placeholder until real posts per channel */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${channel.color}18` }}>
          <Icon className="w-7 h-7" style={{ color: channel.color }} />
        </div>
        <p className="text-[14px] font-semibold" style={{ color: theme.colors.textPrimary }}>
          Be the first to post
        </p>
        <p className="text-[12px] text-center max-w-[240px]" style={{ color: theme.colors.textSecondary }}>
          This channel is ready for discussion. Start a conversation with your team.
        </p>
      </div>
    </div>
  );
};

const ChannelsView = ({ theme, dark }) => {
  const [activeChannel, setActiveChannel] = useState(null);

  if (activeChannel) {
    return <ChannelFeed channel={activeChannel} theme={theme} dark={dark} onBack={() => setActiveChannel(null)} />;
  }

  return (
    <div className="space-y-2 pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest px-1 pb-1" style={{ color: theme.colors.textSecondary }}>
        All Channels
      </p>
      {CHANNELS.map(ch => (
        <ChannelCard key={ch.id} channel={ch} theme={theme} dark={dark} onClick={setActiveChannel} />
      ))}
    </div>
  );
};

export const CommunityLibraryLayout = ({
  theme,
  posts, polls, likedPosts, pollChoices,
  onToggleLike, onPollVote, onAddComment, openCreateContentModal,
}) => {
  const [activeTab, setActiveTab] = useState('community');
  const [query, setQuery] = useState('');
  const scrollPositions = useRef({ community: 0, library: 0, channels: 0 });
  const containerRef = useRef(null);
  const dark = isDarkTheme(theme);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const TABS = ['Community', 'Channels', 'Library'];

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      {/* Header: tabs · search · post */}
      <div className="flex-shrink-0 px-4" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-lg mx-auto w-full">
          {/* Row 1: Tabs + Post button */}
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
          {/* Row 2: Search (hidden on Channels) */}
          {activeTab !== 'channels' && (
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
          {activeTab === 'channels' && <div className="mb-2" />}
        </div>
      </div>

      {/* Content panes */}
      <div ref={containerRef} className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        <div className="mx-auto w-full max-w-lg px-4" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            {/* Community Pane */}
            <div style={activeTab === 'community' ? {
              position: 'relative', opacity: 1, transform: 'translateX(0)',
              transition: paneTransition, pointerEvents: 'auto',
            } : {
              position: 'absolute', inset: 0, opacity: 0, transform: 'translateX(-12px)',
              transition: paneTransition, pointerEvents: 'none',
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

            {/* Channels Pane */}
            <div style={activeTab === 'channels' ? {
              position: 'relative', opacity: 1, transform: 'translateX(0)',
              transition: paneTransition, pointerEvents: 'auto',
            } : {
              position: 'absolute', inset: 0, opacity: 0, transform: activeTab === 'community' ? 'translateX(12px)' : 'translateX(-12px)',
              transition: paneTransition, pointerEvents: 'none',
            }}>
              <ChannelsView theme={theme} dark={dark} />
            </div>

            {/* Library Pane */}
            <div style={activeTab === 'library' ? {
              position: 'relative', opacity: 1, transform: 'translateX(0)',
              transition: paneTransition, pointerEvents: 'auto',
            } : {
              position: 'absolute', inset: 0, opacity: 0, transform: 'translateX(12px)',
              transition: paneTransition, pointerEvents: 'none',
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
