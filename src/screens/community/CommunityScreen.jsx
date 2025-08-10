import React, { useState, useMemo, useCallback, useRef } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { MessageSquare, Heart, MessageCircle, Share2, Plus, TrendingUp, Users, Send, ChevronDown } from 'lucide-react';

export const CommunityScreen = ({
    theme,
    posts,
    polls,
    likedPosts,
    pollChoices,
    onToggleLike,
    onPollVote,
    onAddComment,
    openCreateContentModal,
}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [expandedComments, setExpandedComments] = useState({});
    const scrollRef = useRef(null);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        setIsScrolled(scrollRef.current.scrollTop > 6);
    }, []);

    const allContent = useMemo(() => {
        const list = [...(posts || []), ...(polls || [])].map((x) => ({
            ...x,
            createdAt: typeof x.createdAt === 'number' ? x.createdAt : Date.now(),
        }));
        return list.sort((a, b) => b.createdAt - a.createdAt);
    }, [posts, polls]);

    const toggleComments = useCallback((postId) => {
        setExpandedComments((p) => ({ ...p, [postId]: !p[postId] }));
    }, []);

    const Avatar = ({ src, alt }) => (
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
            {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-white" />}
        </div>
    );

    const StatButton = ({ active, icon: Icon, count, onClick, ariaLabel }) => (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            className="flex items-center gap-1.5 text-sm px-2 py-1 rounded-full transition-all active:scale-95"
            style={{
                backgroundColor: active ? `${theme.colors.accent}0F` : theme.colors.subtle,
                border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
                color: active ? theme.colors.accent : theme.colors.textSecondary,
            }}
        >
            <Icon className="w-4 h-4" />
            <span>{count}</span>
        </button>
    );

    const PostCard = ({ post }) => {
        const [draft, setDraft] = useState('');
        const isLiked = !!likedPosts?.[post.id];

        const submitComment = (e) => {
            e.preventDefault();
            const text = draft.trim();
            if (!text) return;
            onAddComment?.(post.id, text);
            setDraft('');
            if (!expandedComments[post.id]) toggleComments(post.id);
        };

        return (
            <GlassCard theme={theme} className="p-4 rounded-[24px] shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                    <Avatar src={post.user?.avatar} alt={post.user?.name} />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{post.user?.name || 'Anonymous'}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: theme.colors.textSecondary, background: theme.colors.subtle }}>
                                {post.timeAgo || 'now'}
                            </span>
                        </div>
                        {post.text && (
                            <p className="mt-2 text-[15px] leading-6" style={{ color: theme.colors.textPrimary }}>
                                {post.text}
                            </p>
                        )}
                    </div>
                </div>

                {post.image && (
                    <div className="rounded-xl overflow-hidden">
                        <img src={post.image} alt="" className="w-full h-52 object-cover select-none pointer-events-none" />
                    </div>
                )}

                {post.images?.length > 0 && (
                    <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {post.images.map((src, i) => (
                            <div key={i} className="rounded-xl overflow-hidden">
                                <img src={src} alt="" className="w-full h-32 object-cover select-none pointer-events-none" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                    <div className="flex items-center gap-2">
                        <StatButton
                            active={isLiked}
                            icon={Heart}
                            count={post.likes ?? 0}
                            onClick={() => onToggleLike?.(post.id)}
                            ariaLabel="Like"
                        />
                        <StatButton
                            active={!!expandedComments[post.id]}
                            icon={MessageCircle}
                            count={post.comments?.length || 0}
                            onClick={() => toggleComments(post.id)}
                            ariaLabel="Comments"
                        />
                    </div>
                    <button className="px-2 py-1 rounded-full active:scale-95" aria-label="Share" style={{ color: theme.colors.textSecondary }}>
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                {expandedComments[post.id] && (
                    <div id={`comments-${post.id}`} className="pt-2 space-y-3">
                        <div className="space-y-2">
                            {(post.comments || []).map((c) => (
                                <div key={c.id} className="flex items-start gap-2">
                                    <div className="w-7 h-7 rounded-full" style={{ background: theme.colors.subtle }} />
                                    <div className="flex-1 text-sm">
                                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{c.name || 'User'}</span>{' '}
                                        <span style={{ color: theme.colors.textSecondary }}>{c.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={submitComment} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full" style={{ background: theme.colors.subtle }} />
                            <input
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Add a comment…"
                                className="flex-1 px-3 py-2 rounded-full text-sm outline-none"
                                style={{
                                    backgroundColor: theme.colors.subtle,
                                    color: theme.colors.textPrimary,
                                    border: `1px solid ${theme.colors.border}`,
                                }}
                            />
                            <button
                                type="submit"
                                className="rounded-full px-3 py-2 text-sm font-semibold flex items-center gap-1 active:scale-95"
                                style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                            >
                                <Send className="w-4 h-4" /> Send
                            </button>
                        </form>
                    </div>
                )}
            </GlassCard>
        );
    };

    const PollCard = ({ poll }) => {
        const total = poll.options?.reduce((s, o) => s + o.votes, 0) || 0;
        return (
            <GlassCard theme={theme} className="p-4 rounded-[24px] shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                    <Avatar src={poll.user?.avatar} alt={poll.user?.name} />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{poll.user?.name || 'Anonymous'}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: theme.colors.textSecondary, background: theme.colors.subtle }}>
                                {poll.timeAgo}
                            </span>
                        </div>
                        <p className="mt-2 font-semibold" style={{ color: theme.colors.textPrimary }}>{poll.question}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {poll.options?.map((o) => {
                        const pct = total ? Math.round((o.votes / total) * 100) : 0;
                        const isSelected = pollChoices?.[poll.id] === o.id;
                        return (
                            <button
                                key={o.id}
                                onClick={() => onPollVote?.(poll.id, o.id)}
                                className={`w-full p-3 rounded-xl text-left relative overflow-hidden active:scale-[0.98] transition ${isSelected ? 'ring-2' : ''}`}
                                style={{ backgroundColor: theme.colors.subtle, ringColor: isSelected ? theme.colors.accent : 'transparent' }}
                            >
                                <div className="absolute inset-y-0 left-0 opacity-15" style={{ backgroundColor: theme.colors.accent, width: `${pct}%` }} />
                                <div className="relative flex items-center justify-between">
                                    <span style={{ color: theme.colors.textPrimary }}>{o.text}</span>
                                    <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                                        {o.votes} ({pct}%)
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div
                className={`sticky top-0 z-10 transition-shadow duration-200 ${isScrolled ? 'shadow-md' : ''}`}
                style={{
                    backgroundColor: `${theme.colors.background}e6`,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}`,
                }}
            >
                <PageTitle title="Community" theme={theme}>
                    <button
                        onClick={openCreateContentModal}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold active:scale-95 transition"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>Post</span>
                    </button>
                </PageTitle>
            </div>

            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    {allContent.length === 0 ? (
                        <GlassCard theme={theme} className="p-8 text-center rounded-[24px]">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                            <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>No Community Posts Yet</h3>
                            <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                                Be the first to share your projects and connect with the JSI community.
                            </p>
                            <button
                                onClick={openCreateContentModal}
                                className="px-6 py-3 rounded-full font-semibold active:scale-95 transition"
                                style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                            >
                                Create First Post
                            </button>
                        </GlassCard>
                    ) : (
                        allContent.map((item) =>
                            item.type === 'poll' || item.question ? (
                                <PollCard key={`poll-${item.id}`} poll={item} />
                            ) : (
                                <PostCard key={`post-${item.id}`} post={item} />
                            ),
                        )
                    )}
                </div>
            </div>

            <div className="pointer-events-none fixed bottom-2 left-0 right-0 flex justify-center">
                <div className="px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-auto" style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                    <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    <span className="text-xs" style={{ color: theme.colors.textSecondary }}>Pull to refresh</span>
                </div>
            </div>
        </div>
    );
};
