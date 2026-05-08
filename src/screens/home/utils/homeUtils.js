// Badge and helper utilities extracted from HomeScreen.jsx

/**
 * Returns a badge object for a given app route based on live data.
 * Used to show counts/values on the home screen app tiles.
 */
export const getAppBadge = (route, recentOrders, posts, leadTimeFavoritesData, samplesCartCount, opportunities, replacementRequests) => {
    switch (route) {
        case 'orders': {
            const unacked = recentOrders?.filter(o => o.status === 'Order Entry').length || 0;
            if (unacked > 0) return { value: String(unacked), label: 'To Ack', color: '#C4956A', kind: 'count' };
            const shipping = recentOrders?.filter(o => o.status === 'Shipping').length || 0;
            if (shipping > 0) return { value: String(shipping), label: 'Shipping', color: '#5B7B8C', kind: 'count' };
            return null;
        }
        case 'sales': {
            const ytd = recentOrders?.reduce((s, o) => s + (o.net || 0), 0) || 0;
            if (!ytd) return null;
            const fmt = ytd >= 1000000 ? `$${(ytd / 1000000).toFixed(1)}M` : `$${Math.round(ytd / 1000)}K`;
            return { value: fmt, label: 'YTD', color: '#4A7C59', kind: 'currency' };
        }
        case 'community': {
            const cutoff = Date.now() - 48 * 60 * 60 * 1000;
            const recent = posts?.filter(p => p.createdAt && p.createdAt > cutoff).length || 0;
            return recent > 0 ? { value: String(recent), label: 'New', color: '#C4956A', kind: 'count' } : null;
        }
        case 'resources': {
            return null;
        }
        case 'projects': {
            const active = opportunities?.filter(o => o.stage !== 'Won' && o.stage !== 'Lost').length || 0;
            return active > 0 ? { value: String(active), label: 'Active', color: '#4A7C59', kind: 'count' } : null;
        }
        case 'samples': {
            return samplesCartCount > 0 ? { value: String(samplesCartCount), label: 'In Cart', color: '#C4956A', kind: 'count' } : null;
        }
        case 'replacements': {
            const pending = replacementRequests?.filter(r => r.status === 'Pending').length || 0;
            return pending > 0 ? { value: String(pending), label: 'Pending', color: '#C4956A', kind: 'count' } : null;
        }
        default:
            return null;
    }
};

// Functional icon colors per app route — breaks the monochromatic sameness
// by giving key tiles a semantically meaningful tint
export const APP_ICON_COLORS = {
    orders: '#5B7B8C',
    sales: '#4A7C59',
    community: '#C4956A',
    samples: '#C4956A',
    resources: '#5B7B8C',
    projects: '#4A7C59',
    marketplace: '#C4956A',
    replacements: '#5B7B8C',
};

// Home screen configuration constants
export const MIN_PINNED_APPS = 3;
export const MAX_PINNED_APPS = 9;
export const NON_REMOVABLE_APPS = new Set(['resources']);
export const EXCLUDED_ROUTES = new Set(['settings', 'feedback', 'help', 'contracts', 'members', 'resources/dealer_registration', 'resources/discontinued-finishes']);

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
