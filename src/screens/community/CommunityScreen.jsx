import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { Heart, MessageCircle, Share2, Plus, Users, Send } from 'lucide-react';

// Community feed screen
export const CommunityScreen = ({
  theme,
  posts = [],
  polls = [],
  likedPosts = {},
  pollChoices = {},
  onToggleLike,
  onPollVote,
  onAddComment,
  openCreateContentModal,
  onRefresh,
  embedMode = false,
  externalQuery = ''
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'library'
  const scrollRef = useRef(null);

  useEffect(() => {
    if (document.getElementById('community-no-scrollbar-style')) return;
    const style = document.createElement('style');
    style.id = 'community-no-scrollbar-style';
    style.innerHTML = `.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }
    @media (max-width: 500px){ .community-post-btn span{ display:none } .community-post-btn{ padding-left:18px; padding-right:18px } }
    `;
    document.head.appendChild(style);
  }, []);

  const handleScroll = useCallback(() => { if (!scrollRef.current) return; setIsScrolled(scrollRef.current.scrollTop > 6); }, []);

  const effectiveQuery = embedMode ? externalQuery : query;
  const effectiveViewMode = embedMode ? 'feed' : viewMode;

  const timeSafe = (x) => (typeof x.createdAt === 'number' ? x.createdAt : Date.now());

  const allContent = useMemo(() => {
    const list = [...posts, ...polls].map(x => ({ ...x, createdAt: timeSafe(x) }));
    return list.sort((a,b) => b.createdAt - a.createdAt);
  }, [posts, polls, refreshKey]);

  const filteredContent = useMemo(() => {
    const q = effectiveQuery.trim().toLowerCase(); if (!q) return allContent;
    return allContent.filter(item => {
      const base = [item.type, item.user?.name, item.text, item.title, item.question].filter(Boolean).join(' ').toLowerCase();
      const optionsText = (item.options || []).map(o => o.text).join(' ').toLowerCase();
      return base.includes(q) || optionsText.includes(q);
    });
  }, [allContent, effectiveQuery]);

  const photoLibrary = useMemo(() => {
    const rows = [];
    posts.forEach(p => {
      if (p.image) rows.push({ id: `${p.id}-single`, src: p.image, post: p });
      if (Array.isArray(p.images)) p.images.forEach((img,i) => rows.push({ id: `${p.id}-multi-${i}` , src: img, post: p }));
    });
    const q = effectiveQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => {
      const text = [r.post.title, r.post.text, r.post.user?.name].filter(Boolean).join(' ').toLowerCase();
      return text.includes(q);
    });
  }, [posts, effectiveQuery]);

  const toggleComments = useCallback(id => setExpandedComments(p => ({ ...p, [id]: !p[id] })), []);

  const Avatar = ({ src, alt }) => (
    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-white" />}
    </div>
  );

  const StatButton = ({ active, icon: Icon, count, onClick, ariaLabel }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all active:scale-95"
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
        color: active ? theme.colors.accent : theme.colors.textSecondary,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
      }}
    >
      <Icon className="w-4 h-4" />
      <span>{count}</span>
    </button>
  );

  const PostCard = ({ post }) => {
    const [draft, setDraft] = useState('');
    const isLiked = !!likedPosts[post.id];
    const commentWrapRef = useRef(null);
    const contentRef = useRef(null);
    const [measuredHeight, setMeasuredHeight] = useState(0);
    useEffect(() => { if (expandedComments[post.id] && contentRef.current) { setMeasuredHeight(contentRef.current.scrollHeight); } }, [expandedComments[post.id], post.comments]);
    const submitComment = (e) => { e.preventDefault(); const text = draft.trim(); if (!text) return; onAddComment?.(post.id, text); setDraft(''); if (!expandedComments[post.id]) toggleComments(post.id); };
    return (
      <GlassCard theme={theme} className="p-4 rounded-[24px] shadow-sm space-y-3 w-full">
        <div className="flex items-start gap-3">
          <Avatar src={post.user?.avatar} alt={post.user?.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{post.user?.name}</p>
              <span className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>{post.timeAgo}</span>
            </div>
            {post.title && <p className="font-bold text-sm mt-0.5" style={{ color: theme.colors.textPrimary }}>{post.title}</p>}
            {post.text && <p className="text-sm mt-1 whitespace-pre-line" style={{ color: theme.colors.textSecondary }}>{post.text}</p>}
          </div>
        </div>
        {/* Centered images full width beneath header row */}
        {post.image && (
          <div className="mt-2 rounded-xl overflow-hidden">
            <img src={post.image} alt="post" className="w-full h-auto object-cover" />
          </div>
        )}
        {post.images && post.images.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {post.images.map((img,i)=>(<img key={i} src={img} alt={post.title||'win'} className="rounded-lg object-cover w-full h-28" />))}
          </div>
        )}
        {/* Stats */}
        <div className="flex items-center gap-2 pt-1">
          <StatButton active={isLiked} icon={Heart} count={post.likes || 0} onClick={()=>onToggleLike?.(post.id)} ariaLabel="Like" />
          <StatButton active={expandedComments[post.id]} icon={MessageCircle} count={(post.comments||[]).length} onClick={()=>toggleComments(post.id)} ariaLabel="Comments" />
          <button onClick={()=>{ if(navigator.share){ navigator.share({ title: post.title || 'Post', text: post.text }); } else { navigator.clipboard.writeText(post.text || window.location.href); } }} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all active:scale-95" style={{ backgroundColor: '#ffffff', border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary, boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
            <Share2 className="w-4 h-4" /> <span>Share</span>
          </button>
        </div>
        {/* Animated Comments */}
        <div
          ref={commentWrapRef}
          style={{ maxHeight: expandedComments[post.id] ? measuredHeight : 0, opacity: expandedComments[post.id] ? 1 : 0, transition: 'max-height 300ms ease, opacity 250ms ease', overflow: 'hidden' }}
        >
          <div ref={contentRef} className="pt-2 space-y-3">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(post.comments||[]).map(c => (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: '#ffffff', border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>{c.name?.[0] || '?'}</div>
                  <div className="flex-1 rounded-xl px-3 py-2" style={{ backgroundColor: '#ffffff', border:`1px solid ${theme.colors.border}` }}>
                    <p className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{c.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{c.text}</p>
                  </div>
                </div>
              ))}
              {(post.comments||[]).length === 0 && (
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>No comments yet.</p>
              )}
            </div>
            <form onSubmit={submitComment} className="flex items-center gap-2">
              <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Add a comment" className="flex-1 text-sm px-3 py-2 rounded-full outline-none" style={{ backgroundColor: '#ffffff', color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }} />
              <button disabled={!draft.trim()} className="p-2 rounded-full disabled:opacity-40" style={{ backgroundColor: theme.colors.accent, color:'#fff' }}>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </GlassCard>
    );
  };

  const PollCard = ({ poll }) => {
    const votedOption = pollChoices[poll.id];
    const totalVotes = (poll.options||[]).reduce((s,o)=>s+(o.votes||0),0);
    return (
      <GlassCard theme={theme} className="p-4 rounded-[24px] shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <Avatar src={poll.user?.avatar} alt={poll.user?.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{poll.user?.name}</p>
              <span className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>{poll.timeAgo}</span>
            </div>
            <p className="text-sm mt-1 font-medium" style={{ color: theme.colors.textPrimary }}>{poll.question}</p>
            <div className="mt-3 space-y-2">
              {poll.options.map(opt => {
                const percent = totalVotes ? Math.round((opt.votes||0)/totalVotes*100) : 0;
                const active = votedOption === opt.id;
                return (
                  <button key={opt.id} type="button" disabled={!!votedOption} onClick={()=>onPollVote?.(poll.id,opt.id)} className="w-full text-left px-3 py-2 rounded-xl border relative overflow-hidden group whitespace-nowrap" style={{ borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: '#ffffff', color: active ? theme.colors.accent : theme.colors.textPrimary }}>
                    <span className="relative z-10 text-xs font-medium flex justify-between">
                      <span>{opt.text}</span>
                      {!!votedOption && <span>{percent}%</span>}
                    </span>
                    {votedOption && (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${theme.colors.accent}30 ${percent}%, transparent ${percent}%)` }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>
    );
  };

  const doRefresh = () => { if (onRefresh) { onRefresh(); } else { setRefreshKey(k=>k+1); } };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      {!embedMode && (
        <div className={`sticky top-0 z-10 transition-all ${isScrolled?'shadow-md':''}`} style={{ backgroundColor: isScrolled?`${theme.colors.background}e8`:theme.colors.background, backdropFilter:isScrolled?'blur(12px)':'none', borderBottom:`1px solid ${isScrolled?theme.colors.border+'40':'transparent'}` }}>
          {/* Top controls raised */}
          <div className="px-4 pt-3 pb-1 w-full">
            <div className="flex w-full gap-3 items-center">
              <div className="flex gap-2">
                <button onClick={()=>setViewMode('feed')} className="h-11 px-6 text-sm font-semibold rounded-full transition-all" style={{ backgroundColor: viewMode==='feed'? theme.colors.accent:'#ffffff', color: viewMode==='feed'? '#fff': theme.colors.textPrimary, boxShadow:'0 2px 4px rgba(0,0,0,0.06)', border:`1px solid ${viewMode==='feed'? theme.colors.accent: theme.colors.border}` }}>Community</button>
                <button onClick={()=>setViewMode('library')} className="h-11 px-6 text-sm font-semibold rounded-full transition-all" style={{ backgroundColor: viewMode==='library'? theme.colors.accent:'#ffffff', color: viewMode==='library'? '#fff': theme.colors.textPrimary, boxShadow:'0 2px 4px rgba(0,0,0,0.06)', border:`1px solid ${viewMode==='library'? theme.colors.accent: theme.colors.border}` }}>Library</button>
              </div>
              <button onClick={openCreateContentModal} className="community-post-btn h-11 ml-auto inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm px-6" style={{ backgroundColor: theme.colors.accent, color:'#fff', boxShadow:'0 4px 14px rgba(0,0,0,0.08)' }}>
                <Plus className="w-4.5 h-4.5" /> <span className="truncate">Post</span>
              </button>
            </div>
          </div>
          {/* Search bar (whiter & closer) */}
          <div className="px-4 pb-1">
            <StandardSearchBar
              value={query}
              onChange={setQuery}
              placeholder={viewMode==='feed'? 'Search posts, people, tags':'Search library'}
              theme={{...theme, colors:{...theme.colors, surface:'#ffffff'}}}
              className="shadow-sm"
            />
          </div>
        </div>
      )}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-1 -mt-1 space-y-4">
        {effectiveViewMode==='feed' && !filteredContent.length && (
          <div className="text-center text-sm pt-20" style={{ color: theme.colors.textSecondary }}>No content found.</div>
        )}
        {effectiveViewMode==='feed' && filteredContent.map(item => item.question ? <PollCard key={`poll-${item.id}`} poll={item} /> : <PostCard key={`post-${item.id}`} post={item} />)}
        {effectiveViewMode==='library' && !embedMode && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoLibrary.map(photo => (
              <div key={photo.id} className="group relative rounded-xl overflow-hidden border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
                <img src={photo.src} alt={photo.post.title||'post image'} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-[11px] leading-tight text-white line-clamp-2">{photo.post.title || photo.post.text || photo.post.user?.name}</p>
                </div>
              </div>
            ))}
            {!photoLibrary.length && <p className="col-span-full text-center text-sm" style={{ color: theme.colors.textSecondary }}>No photos found.</p>}
          </div>
        )}
        <div className="h-2" />
      </div>
    </div>
  );
};

export default CommunityScreen;
