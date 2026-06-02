// ─────────────────────────────────────────────────────────────────────────────
// Good · Better · Best — standalone, deep-linked sales presentation
//
// Scope: JSI lounge seating, framed into three quotable tiers so a rep can
// position the right product for a budget in seconds.
//
// Integrity rule: every tier here is a confirmed, quotable list price taken from
// JSI's published Arwyn and Caav price lists (jsifurniture.com). There are no
// placeholders — a series only appears once its three tiers are verified.
//
// Imagery: real JSI product photography served from JSI's Cloudinary CDN
// (jasper-jsi-furniture) — the same source the rest of the app uses.
// ─────────────────────────────────────────────────────────────────────────────

export const GBB_SLUG = 'good-better-best';
export const GBB_ROUTE = `presentations/${GBB_SLUG}`;

export const GBB_TIERS = [
    { id: 'good', label: 'Good', dot: '#9A9188' },
    { id: 'better', label: 'Better', dot: '#5B7B8C' },
    { id: 'best', label: 'Best', dot: '#4A7C59' },
];

const CLOUDINARY_BASE = 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload';
// Real JSI product photography. Public IDs match the catalog on jsifurniture.com.
const cl = (publicId, transform = 'c_fill,w_1280,h_960,g_auto/f_auto/q_auto') =>
    `${CLOUDINARY_BASE}/${transform}/v1/${publicId}`;

const tier = (model, price, spec) => ({ model, price, spec });

export const GOOD_BETTER_BEST_DECK = {
    id: GBB_SLUG,
    slug: GBB_SLUG,
    title: 'Good · Better · Best',
    subtitle: 'JSI lounge seating, priced good to best — a quotable option for every budget.',
    category: 'Sales Training',
    type: 'Interactive',
    updatedAt: '2026-06-02',
    description:
        'Two flagship JSI lounge series, each laid out in three quotable tiers with model numbers, '
        + 'list pricing, and a one-line spec so reps can position the right product fast.',
    sections: [
        {
            id: 'arwyn',
            eyebrow: 'Lounge Seating',
            title: 'Arwyn',
            blurb: 'Tailored single-seat lounge — from a small-scale cushion back up to the quilted wrap, on wood or metal feet.',
            image: cl('jsi_arwyn_comp_00036_ryzcgw'),
            tiers: {
                good: tier('AW6010', 2363, 'Single seat · small scale · cushion back · Grade A textile'),
                better: tier('AW6011', 2518, 'Single seat · cushion back · Grade A textile'),
                best: tier('AW6021', 3066, 'Single seat · quilted wrap · Grade A textile'),
            },
        },
        {
            id: 'caav',
            eyebrow: 'Lounge Seating',
            title: 'Caav',
            blurb: 'Sculptural freestanding lounge with a soft, grounded silhouette — scaling from a single seat to a two-seat settee.',
            image: cl('jsi_caav_comp_00005_flho7u'),
            tiers: {
                good: tier('CVF3440-31', 3765, 'Single seat · maple legs · Grade A textile'),
                better: tier('CVF3843-31', 3984, 'Single seat · grand scale · Grade A textile'),
                best: tier('CVF3464-31', 4872, 'Two seat · maple legs · Grade A textile'),
            },
        },
    ],
};

export const formatGbbPrice = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '';
    return value.toLocaleString('en-US');
};

// Lightweight catalog entry so the deck can surface as a card inside Browse.
export const GOOD_BETTER_BEST_CARD = {
    id: GBB_SLUG,
    title: GOOD_BETTER_BEST_DECK.title,
    category: GOOD_BETTER_BEST_DECK.category,
    type: 'Interactive',
    size: `${GOOD_BETTER_BEST_DECK.sections.length} slides`,
    lastUpdated: GOOD_BETTER_BEST_DECK.updatedAt,
    description: GOOD_BETTER_BEST_DECK.description,
    route: GBB_ROUTE,
    featured: true,
};
