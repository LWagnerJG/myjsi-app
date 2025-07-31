import React, { useState } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Share2, Download, ExternalLink, Heart, MessageCircle } from 'lucide-react';
import * as Data from '../../data.jsx';

export const SocialMediaScreen = ({ theme }) => {
    const [selectedPost, setSelectedPost] = useState(null);

    const socialPosts = Data.SOCIAL_MEDIA_POSTS || [];

    const handleShare = async (post) => {
        const shareText = `Check out this JSI furniture post: ${post.caption}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'JSI Furniture',
                    text: shareText,
                    url: post.url,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(shareText);
        }
    };

    const handleDownload = (post) => {
        const link = document.createElement('a');
        link.href = post.url;
        link.download = `jsi-social-${post.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const PostCard = ({ post }) => (
        <GlassCard theme={theme} className="p-4 space-y-4">
            <div className="aspect-square w-full rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.subtle }}>
                <img 
                    src={post.url} 
                    alt={`Social media post ${post.id}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                />
            </div>
            
            <div className="space-y-3">
                <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
                    {post.caption}
                </p>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                            <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                {Math.floor(Math.random() * 50) + 10}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                            <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                {Math.floor(Math.random() * 20) + 5}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleDownload(post)}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleShare(post)}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Social Media" theme={theme} />
            
            <div className="px-4 pb-4">
                <GlassCard theme={theme} className="p-4 mb-4">
                    <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                        Ready-to-Share Content
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        Download and share these professionally designed posts on your social media channels to showcase JSI products.
                    </p>
                </GlassCard>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pb-4">
                    {socialPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {socialPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <GlassCard theme={theme} className="p-8 text-center">
                            <Share2 className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                            <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.textPrimary }}>
                                No Social Media Content
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Social media posts will appear here when available.
                            </p>
                        </GlassCard>
                    )}
                </div>
            </div>

            {selectedPost && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedPost(null)}
                >
                    <div 
                        className="max-w-2xl w-full rounded-xl overflow-hidden"
                        style={{ backgroundColor: theme.colors.surface }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={selectedPost.url} 
                            alt={`Social media post ${selectedPost.id}`}
                            className="w-full h-auto"
                        />
                        <div className="p-4">
                            <p className="mb-4" style={{ color: theme.colors.textPrimary }}>
                                {selectedPost.caption}
                            </p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => handleDownload(selectedPost)}
                                    className="px-4 py-2 rounded-lg font-medium"
                                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                                >
                                    Download
                                </button>
                                <button
                                    onClick={() => handleShare(selectedPost)}
                                    className="px-4 py-2 rounded-lg font-medium"
                                    style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};