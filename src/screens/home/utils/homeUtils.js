// Badge and helper utilities extracted from HomeScreen.jsx

/**
 * Returns a badge object for a given app route based on live data.
 * Used to show counts/values on the home screen app tiles.
 */
export const getAppBadge = (route, recentOrders, posts, leadTimeFavoritesData, samplesCartCount) => {
    switch (route) {
        case 'orders': {
            const open = recentOrders?.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length || 0;
            return open > 0 ? { value: String(open), label: 'Open', color: '#5B7B8C' } : null;
        }
        case 'sales': {
            const ytd = recentOrders?.reduce((s, o) => s + (o.net || 0), 0) || 0;
            if (!ytd) return null;
            const fmt = ytd >= 1000000 ? `$${(ytd / 1000000).toFixed(1)}M` : `$${Math.round(ytd / 1000)}K`;
            return { value: fmt, label: 'YTD', color: '#4A7C59' };
        }
        case 'community': {
            const count = posts?.length || 0;
            return count > 0 ? { value: String(count), label: 'Posts', color: '#C4956A' } : null;
        }
        case 'resources': {
            const faveCount = leadTimeFavoritesData?.length || 0;
            return faveCount > 0 ? { value: String(faveCount), label: 'Tracked', color: '#5B7B8C' } : null;
        }
        case 'samples': {
            return samplesCartCount > 0 ? { value: String(samplesCartCount), label: 'In Cart', color: '#C4956A' } : null;
        }
        default:
            return null;
    }
};

// Home screen configuration constants
export const MIN_PINNED_APPS = 3;
export const MAX_PINNED_APPS = 9;
export const NON_REMOVABLE_APPS = new Set(['resources']);
export const EXCLUDED_ROUTES = new Set(['settings', 'feedback', 'help', 'contracts', 'members', 'resources/dealer_registration']);

/**
 * Shallow equality check for two arrays (by reference per element).
 */
export const areArraysEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

/**
 * Safely extract author name from a community post object.
 */
export const getCommunityAuthorSafe = (post) => {
    if (!post) return 'Community';
    if (typeof post.user === 'string') return post.user;
    if (typeof post.name === 'string') return post.name;
    if (typeof post.author === 'string') return post.author;
    if (post.user?.name) return post.user.name;
    if (post.user?.firstName || post.user?.lastName) {
        return `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.trim();
    }
    return 'Community';
};

/**
 * Safely extract text content from a community post object.
 */
export const getCommunityTextSafe = (post) => {
    if (!post) return 'New update available';
    if (typeof post.text === 'string') return post.text;
    if (typeof post.content === 'string') return post.content;
    if (typeof post.message === 'string') return post.message;
    if (typeof post.title === 'string') return post.title;
    return 'New update available';
};
