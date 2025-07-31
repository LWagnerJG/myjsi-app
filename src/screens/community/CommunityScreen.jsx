import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { MessageSquare, Heart, MessageCircle, Share2, Plus, TrendingUp, Users } from 'lucide-react';
import * as Data from '../../data.jsx';

export const CommunityScreen = ({ theme, posts, polls, likedPosts, onToggleLike, pollChoices, onPollVote, openCreateContentModal }) => {
    const [selectedPost, setSelectedPost] = useState(null);

    const allContent = useMemo(() => {
        const postsList = posts || Data.INITIAL_POSTS || [];
        const pollsList = polls || Data.INITIAL_POLLS || [];
        const winsList = Data.INITIAL_WINS || [];
        
        return [...postsList, ...pollsList, ...winsList].sort((a, b) => {
            const timeOrder = { '2h': 1, 'yesterday': 2, '1d': 3 };
            return (timeOrder[a.timeAgo] || 999) - (timeOrder[b.timeAgo] || 999);
        });
    }, [posts, polls]);

    const handlePostClick = useCallback((post) => {
        setSelectedPost(post);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedPost(null);
    }, []);

    const PostCard = ({ post, theme }) => (
        <GlassCard theme={theme} className="p-4 space-y-3">
            <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
                    {post.user?.avatar ? (
                        <img src={post.user.avatar} alt={post.user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <Users className="w-5 h-5 text-white" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {post.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {post.timeAgo}
                        </span>
                    </div>
                    {post.text && (
                        <p className="mt-2 text-sm" style={{ color: theme.colors.textPrimary }}>
                            {post.text}
                        </p>
                    )}
                </div>
            </div>

            {post.image && (
                <div className="rounded-lg overflow-hidden">
                    <img src={post.image} alt="Post content" className="w-full h-48 object-cover" />
                </div>
            )}

            {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {post.images.map((img, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden">
                            <img src={img} alt={`Post image ${idx + 1}`} className="w-full h-32 object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => onToggleLike && onToggleLike(post.id)}
                        className="flex items-center space-x-1 text-sm"
                    >
                        <Heart 
                            className={`w-4 h-4 ${likedPosts?.[post.id] ? 'fill-current' : ''}`}
                            style={{ color: likedPosts?.[post.id] ? theme.colors.accent : theme.colors.textSecondary }}
                        />
                        <span style={{ color: theme.colors.textSecondary }}>
                            {post.likes}
                        </span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm">
                        <MessageCircle className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                        <span style={{ color: theme.colors.textSecondary }}>
                            {post.comments?.length || 0}
                        </span>
                    </button>
                </div>
                <button className="p-1">
                    <Share2 className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                </button>
            </div>
        </GlassCard>
    );

    const PollCard = ({ poll, theme }) => (
        <GlassCard theme={theme} className="p-4 space-y-3">
            <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
                    {poll.user?.avatar ? (
                        <img src={poll.user.avatar} alt={poll.user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <TrendingUp className="w-5 h-5 text-white" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {poll.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {poll.timeAgo}
                        </span>
                    </div>
                    <p className="mt-2 font-semibold" style={{ color: theme.colors.textPrimary }}>
                        {poll.question}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {poll.options?.map((option) => {
                    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    const isSelected = pollChoices?.[poll.id] === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => onPollVote && onPollVote(poll.id, option.id)}
                            className={`w-full p-3 rounded-lg text-left relative overflow-hidden ${isSelected ? 'ring-2' : ''}`}
                            style={{ 
                                backgroundColor: theme.colors.subtle,
                                ringColor: isSelected ? theme.colors.accent : 'transparent'
                            }}
                        >
                            <div 
                                className="absolute inset-0 opacity-20"
                                style={{ 
                                    backgroundColor: theme.colors.accent,
                                    width: `${percentage}%`
                                }}
                            />
                            <div className="relative flex items-center justify-between">
                                <span style={{ color: theme.colors.textPrimary }}>
                                    {option.text}
                                </span>
                                <span className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                                    {option.votes} ({percentage.toFixed(0)}%)
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </GlassCard>
    );

    const WinCard = ({ win, theme }) => (
        <GlassCard theme={theme} className="p-4 space-y-3">
            <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
                    {win.user?.avatar ? (
                        <img src={win.user.avatar} alt={win.user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <TrendingUp className="w-5 h-5 text-white" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {win.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                            {win.timeAgo}
                        </span>
                    </div>
                    <p className="mt-2 font-semibold text-lg" style={{ color: theme.colors.accent }}>
                        {win.title}
                    </p>
                </div>
            </div>

            {win.images && win.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {win.images.map((img, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden">
                            <img src={img} alt={`Win image ${idx + 1}`} className="w-full h-32 object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </GlassCard>
    );

    const renderContentItem = (item) => {
        if (item.type === 'poll' || item.question) {
            return <PollCard key={item.id} poll={item} theme={theme} />;
        } else if (item.type === 'win') {
            return <WinCard key={item.id} win={item} theme={theme} />;
        } else {
            return <PostCard key={item.id} post={item} theme={theme} />;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Community" theme={theme}>
                <button
                    onClick={openCreateContentModal}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    <Plus className="w-4 h-4" />
                    <span>Post</span>
                </button>
            </PageTitle>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-4 space-y-4">
                    {allContent.length > 0 ? (
                        allContent.map(renderContentItem)
                    ) : (
                        <GlassCard theme={theme} className="p-8 text-center">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                            <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                                No Community Posts Yet
                            </h3>
                            <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                                Be the first to share your projects and connect with the JSI community.
                            </p>
                            <button
                                onClick={openCreateContentModal}
                                className="px-6 py-3 rounded-full font-semibold"
                                style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                            >
                                Create First Post
                            </button>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};