import React from 'react';
import { ChevronRight, Package, DollarSign, Calendar, Zap, Megaphone, Clock, Users } from 'lucide-react';
import { ANNOUNCEMENTS } from '../../community/data.js';
import { MARKETPLACE_PRODUCTS, INITIAL_BALANCE, formatElliottBucks } from '../../marketplace/data.js';
import { PRODUCTS_CATEGORIES_DATA, PRODUCT_DATA } from '../../products/data.js';
import { getCommunityAuthorSafe, getCommunityTextSafe } from '../utils/homeUtils.js';
import { smartTitleCase } from '../../../utils/format.js';

// Shared row style — consistent across all content modes
const ROW = 'w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors';

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
            <div className="space-y-0.5 pt-1">
                {communityPosts.length > 0 ? (
                    communityPosts.map((post) => (
                        <button
                            key={post.id}
                            onClick={() => onNavigate(`community/post/${post.id}`)}
                            className={`${ROW} text-left ${hoverBg}`}
                        >
                            {(() => {
                                const image = post.image || (Array.isArray(post.images) ? post.images[0] : null);
                                return image ? (
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={image} alt="Community" className="w-full h-full object-cover" />
                                    </div>
                                ) : null;
                            })()}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                                    {getCommunityAuthorSafe(post)}
                                </div>
                                <div className="text-xs line-clamp-1 mt-0.5" style={{ color: colors.textSecondary }}>
                                    {getCommunityTextSafe(post)}
                                </div>
                                {post.timeAgo && (
                                    <div className="text-[0.625rem] mt-0.5" style={{ color: colors.textSecondary, opacity: 0.45 }}>
                                        {post.timeAgo}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))
                ) : (
                    <EmptyState icon={Users} colors={colors} isDark={isDark} title="No posts yet" subtitle="Community activity will show up here" />
                )}
            </div>
        );
    }

    if (mode === 'lead-times') {
        return (
            <div className="space-y-0.5 pt-1">
                {leadTimeFavoritesData.length > 0 ? (
                    leadTimeFavoritesData.map((item) => (
                        <button
                            key={`${item.series}-${item.type}`}
                            onClick={() => onNavigate('resources/lead-times')}
                            className={`${ROW} ${hoverBg}`}
                        >
                            <div className="flex-1 text-left min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{item.series}</div>
                                <div className="text-[0.625rem] uppercase tracking-widest mt-0.5" style={{ color: colors.textSecondary, opacity: 0.55 }}>{item.type}</div>
                            </div>
                            <div className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: colors.textPrimary }}>{item.weeks} wks</div>
                        </button>
                    ))
                ) : (
                    <EmptyState icon={Clock} colors={colors} isDark={isDark} title="No favorites yet">
                        <button
                            onClick={() => onNavigate('resources/lead-times')}
                            className="text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70 mt-1"
                            style={{ color: colors.accent }}
                        >
                            Open Lead Times
                        </button>
                    </EmptyState>
                )}
            </div>
        );
    }

    if (mode === 'announcements') {
        const ANN_ICONS = { 'product-launch': Package, 'pricing': DollarSign, 'event': Calendar, 'operations': Zap };
        const ANN_COLORS = { 'product-launch': '#4A7C59', 'pricing': '#5B7B8C', 'event': '#C4956A', 'operations': '#353535' };
        return (
            <div className="space-y-0.5 pt-1">
                {ANNOUNCEMENTS.slice(0, 3).map((ann) => {
                    const Icon = ANN_ICONS[ann.category] || Megaphone;
                    const accentColor = ANN_COLORS[ann.category] || '#353535';
                    return (
                        <button
                            key={ann.id}
                            onClick={() => ann.actionRoute ? onNavigate(ann.actionRoute) : onNavigate('community')}
                            className={`${ROW} text-left ${hoverBg}`}
                            style={{ borderLeft: `2px solid ${accentColor}40` }}
                        >
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
                            >
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{ann.title}</div>
                                <div className="text-xs mt-0.5 line-clamp-1" style={{ color: colors.textSecondary }}>{ann.subtitle || ann.text}</div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-25" style={{ color: colors.textSecondary }} />
                        </button>
                    );
                })}
            </div>
        );
    }

    if (mode === 'products') {
        const categories = (PRODUCTS_CATEGORIES_DATA || []).slice(0, 6);
        return (
            <div className="space-y-0.5 pt-1">
                {categories.map((category) => {
                    const key = (category.nav || '').split('/').pop();
                    const seriesCount = Array.isArray(PRODUCT_DATA?.[key]?.products) ? PRODUCT_DATA[key].products.length : 0;
                    return (
                        <button
                            key={category.nav}
                            onClick={() => onNavigate(category.nav)}
                            className={`${ROW} text-left ${hoverBg}`}
                        >
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={category.images?.[0]}
                                    alt={category.name}
                                    className="w-full h-full object-contain object-center mix-blend-multiply"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{category.name}</div>
                                <div className="text-xs truncate mt-0.5" style={{ color: colors.textSecondary, opacity: 0.7 }}>{category.description}</div>
                            </div>
                            <div className="text-xs font-semibold flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.6 }}>
                                {seriesCount}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-25" style={{ color: colors.textSecondary }} />
                        </button>
                    );
                })}
            </div>
        );
    }

    if (mode === 'projects') {
        const allOpportunities = Array.isArray(opportunities) ? opportunities : [];
        const discoveryProjects = allOpportunities.filter((p) => p.stage === 'Discovery').slice(0, 3);
        const specifyingProjects = allOpportunities.filter((p) => p.stage === 'Specifying').slice(0, 2);
        const highlighted = [...discoveryProjects, ...specifyingProjects];
        return (
            <div className="space-y-0.5 pt-1">
                {highlighted.length > 0 ? (
                    highlighted.map((project) => (
                        <button
                            key={project.id}
                            onClick={() => onNavigate(`projects/${project.id}`)}
                            className={`${ROW} text-left ${hoverBg}`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{project.name}</div>
                                <div className="text-xs truncate mt-0.5" style={{ color: colors.textSecondary }}>{project.company || project.contact || project.stage}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-[0.625rem] uppercase tracking-wider font-semibold" style={{ color: colors.textSecondary, opacity: 0.6 }}>{project.stage}</div>
                                <div className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>${parseCurrencyValue(project.value).toLocaleString()}</div>
                            </div>
                        </button>
                    ))
                ) : (
                    <button
                        onClick={() => onNavigate('projects')}
                        className={`${ROW} text-left ${hoverBg}`}
                    >
                        <div>
                            <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>No active projects yet</div>
                            <div className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Tap to open Projects and create one</div>
                        </div>
                    </button>
                )}
            </div>
        );
    }

    if (mode === 'marketplace') {
        const featured = MARKETPLACE_PRODUCTS.slice(0, 3);
        return (
            <div className="space-y-0.5 pt-1">
                <button
                    onClick={() => onNavigate('marketplace')}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl ${hoverBg} transition-colors`}
                    style={{
                        backgroundColor: isDark ? 'rgba(196,149,106,0.07)' : 'rgba(196,149,106,0.06)',
                    }}
                >
                    <div className="text-left">
                        <div className="text-[0.625rem] uppercase tracking-widest font-semibold" style={{ color: colors.textSecondary, opacity: 0.55 }}>Balance</div>
                        <div className="text-base font-bold tabular-nums" style={{ color: colors.textPrimary }}>{formatElliottBucks(INITIAL_BALANCE)}</div>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#C4956A' }}>Redeem →</span>
                </button>
                {featured.map(p => (
                    <button
                        key={p.id}
                        onClick={() => onNavigate('marketplace')}
                        className={`${ROW} text-left ${hoverBg}`}
                    >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{p.name}</div>
                            <div className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{formatElliottBucks(p.price)}</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-25" style={{ color: colors.textSecondary }} />
                    </button>
                ))}
            </div>
        );
    }

    // activity / recent orders (default)
    if (!recentOrders.length) {
        return <EmptyState icon={Package} colors={colors} isDark={isDark} title="No recent orders" subtitle="Orders will appear here as they come in" />;
    }

    const STATUS_COLOR = {
        'Order Entry': '#6B7280',
        'Acknowledged': '#8B8685',
        'In Production': '#5B7B8C',
        'Shipping': '#5B7B8C',
        'Delivered': '#4A7C59',
    };

    return (
        <div className="space-y-0.5 pt-1">
            {recentOrders.map((order, i) => {
                const statusColor = STATUS_COLOR[order.status] || colors.textSecondary;
                return (
                    <button
                        key={order.orderNumber}
                        onClick={() => onNavigate(`orders/${order.orderNumber}`)}
                        className={`${i >= 5 ? 'hidden sm:flex' : 'flex'} w-full items-center gap-3 pl-2.5 pr-0.5 py-2.5 rounded-xl ${hoverBg} transition-colors`}
                    >
                        <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: statusColor }}
                        />
                        <div className="text-left min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{smartTitleCase(order.details)}</div>
                            <div className="text-xs truncate mt-0.5" style={{ color: colors.textSecondary }}>{smartTitleCase(order.company)}</div>
                        </div>
                        <div className="text-right flex-shrink-0 w-[6.25rem]">
                            <div className="text-sm font-bold tabular-nums" style={{ color: colors.textPrimary }}>${order.net.toLocaleString()}</div>
                            <div className="text-[0.625rem] font-medium mt-0.5" style={{ color: statusColor }}>{order.status}</div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

const EmptyState = ({ icon: Icon, colors, isDark, title, subtitle, children }) => (
    <div className="flex flex-col items-center justify-center py-6 text-center gap-1.5">
        <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)' }}
        >
            <Icon className="w-4 h-4" style={{ color: colors.textSecondary, opacity: 0.4 }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{title}</p>
        {subtitle && <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary, opacity: 0.6 }}>{subtitle}</p>}
        {children}
    </div>
);
