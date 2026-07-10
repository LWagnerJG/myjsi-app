// ─────────────────────────────────────────────────────────────────────────────
// Good · Better · Best — standalone, deep-linked sales presentation
//
// Concept: for each seating category, three products at three price points —
// each tier a DIFFERENT JSI family — so a rep can position the right product for
// any budget. One slide per category; Good / Better / Best across the columns.
// Each category is independently deep-linkable: /presentations/good-better-best/<id>
//
// Integrity: every price is the Grade A list price pulled from JSI's published
// price lists at jsifurniture.com/pricing-planning-spec-guides, and every model
// + image was confirmed against the product pages on jsifurniture.com
// (verified June 2026). No placeholders.
//
//   Lounge   Teekan TK1611 $1,973 · Arwyn AW6010 $2,363 · Caav CVF3440-31 $3,765
//   Guest    Ria RI2571 $1,162 · Bourne BU7511D $1,648 · Arwyn AW6000WL $1,841
//   Task     Cosgrove 72SMXA $1,165 · Knox KN3000WUF $1,365 · Protocol PT5600L $2,345
//
// Imagery: real JSI product photography from JSI's Cloudinary CDN — each public
// id is the white-background product/category shot from jsifurniture.com. We add
// b_white so any transparency flattens onto a clean white background.
// ─────────────────────────────────────────────────────────────────────────────

import { CLOUDINARY_UPLOAD_BASE, cloudinaryImageUrl } from '../../../utils/cloudinary.js';

export const GBB_SLUG = 'good-better-best';
export const GBB_ROUTE = `presentations/${GBB_SLUG}`;

export const GBB_TIERS = [
    { id: 'good', label: 'Good', dot: '#9A9188' },
    { id: 'better', label: 'Better', dot: '#5B7B8C' },
    { id: 'best', label: 'Best', dot: '#4A7C59' },
];

/** @deprecated Prefer CLOUDINARY_UPLOAD_BASE from utils/cloudinary.js */
export const CLOUDINARY_BASE = CLOUDINARY_UPLOAD_BASE;
// Real JSI product photography. Public IDs match the catalog on jsifurniture.com.
// b_white guarantees a clean white background even for transparent source PNGs.
const cl = (publicId, transform = 'c_pad,w_1000,h_820,b_white/f_auto/q_auto') =>
    cloudinaryImageUrl(publicId, transform);

const item = (series, model, price, spec, publicId) => ({
    series, model, price, spec, publicId, image: cl(publicId),
});

export const GOOD_BETTER_BEST_DECK = {
    id: GBB_SLUG,
    slug: GBB_SLUG,
    title: 'Good · Better · Best',
    subtitle: 'Good, better, best across JSI families — the right product at every price point.',
    category: 'Sales Training',
    type: 'Interactive',
    updatedAt: '2026-06-03',
    description:
        'Good / Better / Best across JSI seating categories — lounge, guest, and task. '
        + 'Each tier is a different JSI family with its model number and verified Grade A list pricing.',
    sections: [
        {
            id: 'lounge',
            eyebrow: 'Category 01',
            title: 'Lounge',
            blurb: 'Single-seat lounge for waiting areas, alcoves, and open commons.',
            tiers: {
                good: item('Teekan', 'TK1611', 1973, 'Single-seat lounge · wood or sled foot · Grade A textile', 'jsi_teekan_comp_00009_yujjmi'),
                better: item('Arwyn', 'AW6010', 2363, 'Single seat · small-scale cushion back · Grade A textile', 'jsi_arwyn_comp_00036_ryzcgw'),
                best: item('Caav', 'CVF3440-31', 3765, 'Single seat · maple legs · Grade A textile', 'jsi_caav_comp_00002_witulq'),
            },
        },
        {
            id: 'guest',
            eyebrow: 'Category 02',
            title: 'Guest',
            blurb: 'Side and guest seating for offices, conference rooms, and reception.',
            tiers: {
                good: item('Ria', 'RI2571', 1162, 'Guest chair · upholstered · wall-saver · Grade A textile', 'RI2571_zzuh69'),
                better: item('Bourne', 'BU7511D', 1648, 'Guest chair · wall-saver · maple frame · Grade A textile', 'jsi_bourne_comp_00001_vaoqmp'),
                best: item('Arwyn', 'AW6000WL', 1841, 'Guest chair · wood leg · Grade A textile', 'jsi_arwyn_comp_00033_vtxnqq'),
            },
        },
        {
            id: 'task',
            eyebrow: 'Category 03',
            title: 'Task & Swivel',
            blurb: 'Conference and task swivels, from value to high-performance.',
            tiers: {
                good: item('Cosgrove', '72SMXA', 1165, 'Mid-back armless swivel · knee tilt · Grade A textile', 'jsi_cosgrove_comp_0010_ihduq3'),
                better: item('Knox', 'KN3000WUF', 1365, 'Flared-arm swivel · wood back · upholstered seat · Grade A textile', 'jsi_knoxquickship_comp_0007_kls07j'),
                best: item('Protocol', 'PT5600L', 2345, 'High-performance task · swivel tilt · Grade A textile', 'jsi_protocol_comp_00001_qq9x1p'),
            },
        },
    ],
};

// Resolve a section id (used by deep-link routing) to its index.
export const gbbSectionIndex = (sectionId) => {
    const i = GOOD_BETTER_BEST_DECK.sections.findIndex((s) => s.id === sectionId);
    return i >= 0 ? i : 0;
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
