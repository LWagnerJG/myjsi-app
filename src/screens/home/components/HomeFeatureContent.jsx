import React from 'react';
import { ChevronRight, Package, DollarSign, Calendar, Zap, Gift, Megaphone, Clock, Users, Star } from 'lucide-react';
import { ANNOUNCEMENTS } from '../../community/data.js';
import { MARKETPLACE_PRODUCTS, INITIAL_BALANCE, formatElliottBucks } from '../../marketplace/data.js';
import { PRODUCTS_CATEGORIES_DATA, PRODUCT_DATA } from '../../products/data.js';
import { getCommunityAuthorSafe, getCommunityTextSafe } from '../utils/homeUtils.js';
import { smartTitleCase } from '../../../utils/format.js';

export const HomeFeatureContent = ({
    mode,
    colors,
    leadTimeFavoritesData,
    communityPosts,
    onNavigate,
    opportunities,
    recentOrders,
    hoverBg,
    isDark
}) => {
    const parseCurrencyValue = (rawValue) => {
        const numeric = parseFloat(String(rawValue ?? '').replace(/[^0-9.]/g, ''));
        return Number.isFinite(numeric) ? numeric : 0;
    };

    if (mode === 'community') {
        return (
            <div className="space-y-3">
                {communityPosts.length > 0 ? (
                    communityPosts.map((post) => (
                        <button
                            key={post.id}
                            onClick={() => {
                                onNavigate(`community/post/${post.id}`);
                            }}
                            className={`w-full p-3 rounded-2xl text-left ${hoverBg} transition-colors`}
                            style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <div className="flex items-start gap-3">
                                {(() => {
                                    const image = post.image || (Array.isArray(post.images) ? post.images[0] : null);
                                    return image ? (
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={image} alt="Community" className="w-full h-full object-cover" />
                                        </div>
                                    ) : null;
                                })()}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                        {getCommunityAuthorSafe(post)}
                                    </div>
                                    <div className="text-xs line-clamp-2 mt-0.5" style={{ color: colors.textSecondary }}>
                                        {getCommunityTextSafe(post)}
                                    </div>
                                    {post.timeAgo && (
                                        <div className="text-[11px] mt-1 opacity-50" style={{ color: colors.textSecondary }}>
                                            {post.timeAgo}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                        >
                            <Users className="w-5 h-5" style={{ color: colors.textSecondary, opacity: 0.45 }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            No posts yet
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary, opacity: 0.65 }}>
                            Community activity will show up here
                        </p>
                    </div>
                )}
            </div>
        );
    }

    if (mode === 'lead-times') {
        return (
            <div className="space-y-3">
                {leadTimeFavoritesData.length > 0 ? (
                    leadTimeFavoritesData.map((item) => (
                        <button
                            key={`${item.series}-${item.type}`}
                            onClick={() => onNavigate('resources/lead-times')}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl ${hoverBg} transition-colors`}
                            style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                        >
                            <div className="text-left">
                                <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{item.series}</div>
                                <div className="text-[11px] uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>{item.type}</div>
                            </div>
                            <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>{item.weeks} wks</div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                        >
                            <Clock className="w-5 h-5" style={{ color: colors.textSecondary, opacity: 0.45 }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            No favorites yet
                        </p>
                        <button
                            onClick={() => onNavigate('resources/lead-times')}
                            className="text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
                            style={{ color: colors.accent }}
                        >
                            Star series in Lead Times →
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (mode === 'announcements') {
        const ANN_ICONS = { 'product-launch': Package, 'pricing': DollarSign, 'event': Calendar, 'operations': Zap };
        const ANN_COLORS = { 'product-launch': '#4A7C59', 'pricing': '#5B7B8C', 'event': '#C4956A', 'operations': '#353535' };
        return (
            <div className="space-y-2">
                {ANNOUNCEMENTS.slice(0, 3).map((ann) => {
                    const Icon = ANN_ICONS[ann.category] || Megaphone;
                    const accentColor = ANN_COLORS[ann.category] || '#353535';
                    return (
                        <button
                            key={ann.id}
                            onClick={() => ann.actionRoute ? onNavigate(ann.actionRoute) : onNavigate('community')}
                            className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left ${hoverBg} transition-colors`}
                            style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', borderLeft: `3px solid ${accentColor}` }}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{ann.title}</div>
                                <div className="text-[11px] mt-0.5 line-clamp-1" style={{ color: colors.textSecondary }}>{ann.subtitle || ann.text}</div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 opacity-30" style={{ color: colors.textSecondary }} />
                        </button>
                    );
                })}
            </div>
        );
    }

    if (mode === 'products') {
        const categories = (PRODUCTS_CATEGORIES_DATA || []).slice(0, 6);

        return (
            <div className="space-y-3">
                <div className="space-y-2">
                    {categories.map((category) => {
                        const key = (category.nav || '').split('/').pop();
                        const seriesCount = Array.isArray(PRODUCT_DATA?.[key]?.products) ? PRODUCT_DATA[key].products.length : 0;
                        return (
                            <button
                                key={category.nav}
                                onClick={() => onNavigate(category.nav)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left ${hoverBg} transition-colors`}
                                style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                            >
                                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={category.images?.[0]}
                                        alt={category.name}
                                        className="w-full h-full object-contain object-center mix-blend-multiply"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                                        {category.name}
                                    </div>
                                    <div className="text-xs truncate" style={{ color: colors.textSecondary }}>
                                        {category.description}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-[11px] font-semibold" style={{ color: colors.textSecondary }}>
                                        {seriesCount} series
                                    </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-30" style={{ color: colors.textSecondary }} />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (mode === 'projects') {
        const allOpportunities = Array.isArray(opportunities) ? opportunities : [];
        const discoveryProjects = allOpportunities.filter((project) => project.stage === 'Discovery').slice(0, 3);
        const specifyingProjects = allOpportunities.filter((project) => project.stage === 'Specifying').slice(0, 2);
        const highlighted = [...discoveryProjects, ...specifyingProjects];
        return (
            <div className="space-y-3">
                {highlighted.length > 0 ? (
                    <div className="space-y-2">
                        {highlighted.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => onNavigate(`projects/${project.id}`)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left ${hoverBg} transition-colors`}
                                style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                                        {project.name}
                                    </div>
                                    <div className="text-xs truncate" style={{ color: colors.textSecondary }}>
                                        {project.company || project.contact || project.stage}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div
                                        className="text-[10px] uppercase tracking-widest font-semibold"
                                        style={{ color: colors.textSecondary, opacity: 0.8 }}
                                    >
                                        {project.stage}
                                    </div>
                                    <div className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>
                                        ${parseCurrencyValue(project.value).toLocaleString()}
                                    </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-30" style={{ color: colors.textSecondary }} />
                            </button>
                        ))}
                    </div>
                ) : (
                    <button
                        onClick={() => onNavigate('projects')}
                        className={`w-full p-3 rounded-2xl text-left ${hoverBg} transition-colors`}
                        style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                    >
                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>No active projects yet</div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>Tap to open Projects and create one</div>
                    </button>
                )}
            </div>
        );
    }

    if (mode === 'marketplace') {
        const featured = MARKETPLACE_PRODUCTS.slice(0, 3);
        return (
            <div className="space-y-3">
                {/* Balance hero */}
                <button
                    onClick={() => onNavigate('marketplace')}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl ${hoverBg} transition-colors`}
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(53,53,53,0.6) 0%, rgba(60,60,60,0.6) 100%)'
                            : 'linear-gradient(135deg, #353535 0%, #494949 100%)',
                    }}
                >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                        <Gift className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-white">{formatElliottBucks(INITIAL_BALANCE)} available</div>
                        <div className="text-[11px] text-white/60">ElliottBucks balance</div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-white/40" />
                </button>
                {/* Featured products */}
                {featured.map(p => (
                    <button
                        key={p.id}
                        onClick={() => onNavigate('marketplace')}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl ${hoverBg} transition-colors`}
                        style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{p.name}</div>
                                <div className="text-[11px]" style={{ color: colors.textSecondary }}>{formatElliottBucks(p.price)}</div>
                            </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-30" style={{ color: colors.textSecondary }} />
                    </button>
                ))}
            </div>
        );
    }

    // activity / recent orders (default mode)
    if (!recentOrders.length) {
        return (
            <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                >
                    <Package className="w-5 h-5" style={{ color: colors.textSecondary, opacity: 0.45 }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>No recent orders</p>
                <p className="text-xs" style={{ color: colors.textSecondary, opacity: 0.65 }}>
                    Orders will appear here as they come in
                </p>
            </div>
        );
    }

    return (
        <div>
            {recentOrders.map((order, i) => {
                const hiddenOnMobile = i >= 5 ? 'hidden sm:flex' : 'flex';
                const statusColor = {
                    'Order Entry': '#6B7280',
                    'Acknowledged': '#8B8685',
                    'In Production': '#5B7B8C',
                    'Shipping': '#5B7B8C',
                    'Delivered': '#4A7C59',
                }[order.status] || colors.textSecondary;
                return (
                <button
                    key={order.orderNumber}
                    onClick={() => onNavigate(`orders/${order.orderNumber}`)}
                    className={`w-full ${hiddenOnMobile} items-center gap-3 py-3.5 px-1 ${hoverBg} transition-colors`}
                    style={i > 0 ? { borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` } : undefined}
                >
                    {/* Status dot */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${statusColor}14` }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                    </div>
                    {/* Project + Dealer */}
                    <div className="text-left min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{smartTitleCase(order.details)}</div>
                        <div className="text-xs truncate" style={{ color: colors.textSecondary }}>{smartTitleCase(order.company)}</div>
                    </div>
                    {/* Amount + Status */}
                    <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>${order.net.toLocaleString()}</div>
                        <div className="text-[11px] font-medium" style={{ color: statusColor }}>{order.status}</div>
                    </div>
                </button>
                );
            })}
        </div>
    );
};
