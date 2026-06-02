// ─────────────────────────────────────────────────────────────────────────────
// Good · Better · Best — standalone product presentation
//
// A shareable, deep-linked sales deck that frames JSI seating and casegoods into
// three value tiers so reps can quickly position the right product for a budget.
//
// Data integrity rules (mirrors Luke's skunk-work convention):
//   • A tier is only shown as a quotable price when `verified: true`.
//   • Anything still being confirmed against the published price list uses
//     `{ pending: true }` and renders a "Pending verification" placeholder so a
//     rep never quotes an unconfirmed number to a customer.
//
// The Lounge slide below is reproduced from Luke's verified one-pager. Remaining
// slides ship as a populated framework (real series + descriptors) with prices
// held back until each row is confirmed against the current price list.
// ─────────────────────────────────────────────────────────────────────────────

export const GBB_SLUG = 'good-better-best';
export const GBB_ROUTE = `presentations/${GBB_SLUG}`;

export const GBB_TIERS = [
    { id: 'good', label: 'Good', dot: '#9A9188' },
    { id: 'better', label: 'Better', dot: '#5B7B8C' },
    { id: 'best', label: 'Best', dot: '#4A7C59' },
];

// Convenience builders keep the section data terse + consistent.
const tier = (model, price, spec) => ({ model, price, spec, verified: true });
const pending = (note) => ({ pending: true, note: note || 'Awaiting price list' });

export const GOOD_BETTER_BEST_DECK = {
    id: GBB_SLUG,
    slug: GBB_SLUG,
    title: 'Good · Better · Best',
    subtitle: 'JSI seating value tiers — the right product for every budget.',
    category: 'Sales Training',
    type: 'Interactive',
    audience: 'Sales team',
    updatedAt: '2026-06-02',
    description:
        'A clean, shareable Good / Better / Best framework across the JSI seating line. '
        + 'Each series is laid out in three quotable tiers with model numbers, list pricing, and a one-line spec so reps can position fast.',
    sections: [
        {
            id: 'lounge',
            eyebrow: 'Seating',
            title: 'Lounge',
            blurb: 'Single-seat lounge for waiting areas, alcoves, and open commons.',
            rows: [
                {
                    series: 'Arwyn',
                    descriptor: 'Tailored single-seat lounge',
                    image: '/category-images/lounge-images/api_arwyn.jpg',
                    tiers: {
                        good: tier('AW6010', 2363, 'Single seat · small scale · cushion back · Grade A textile'),
                        better: tier('AW6011', 2518, 'Single seat · cushion back · Grade A textile'),
                        best: tier('AW6021', 3066, 'Single seat · quilted wrap · Grade A textile'),
                    },
                },
                {
                    series: 'Caav',
                    descriptor: 'Sculpted freestanding lounge',
                    image: '/category-images/lounge-images/api_caav.jpg',
                    tiers: {
                        good: tier('CVF3440-31', 3765, 'Single seat · maple legs · Grade A textile'),
                        better: tier('CVF3843-31', 3984, 'Single seat · grand scale · Grade A textile'),
                        best: tier('CVF3464-31', 4872, 'Two seat · maple legs · Grade A textile'),
                    },
                },
                {
                    series: 'BeSPACE',
                    descriptor: 'Freestanding lounge for open commons',
                    image: '/category-images/lounge-images/api_bespace.jpg',
                    tiers: {
                        good: pending('BeSPACE Good · source not yet retrieved'),
                        better: pending('BeSPACE Better · source not yet retrieved'),
                        best: pending('BeSPACE Best · source not yet retrieved'),
                    },
                },
            ],
        },
        {
            id: 'guest',
            eyebrow: 'Seating',
            title: 'Guest',
            blurb: 'Side and guest seating for offices, conference, and reception.',
            rows: [
                {
                    series: 'Arwyn',
                    descriptor: 'Upholstered guest with wood or metal feet',
                    image: '/category-images/guest-images/jsi_arwyn_comp_00032.jpg',
                    tiers: {
                        good: pending('Confirm armless guest base price'),
                        better: pending('Confirm wood-arm guest base price'),
                        best: pending('Confirm four-star / swivel guest base price'),
                    },
                },
                {
                    series: 'Cosgrove',
                    descriptor: 'Refined metal-frame guest',
                    image: '/category-images/guest-images/jsi_cosgrove_comp_guest_midback_arms_00004.jpg',
                    tiers: {
                        good: pending(),
                        better: pending(),
                        best: pending(),
                    },
                },
                {
                    series: 'Knox',
                    descriptor: 'Contemporary metal-frame guest',
                    image: '/category-images/guest-images/jsi_knox_comp_00020.jpg',
                    tiers: {
                        good: pending(),
                        better: pending(),
                        best: pending(),
                    },
                },
            ],
        },
        {
            id: 'task',
            eyebrow: 'Seating',
            title: 'Task & Swivel',
            blurb: 'Conference and task swivels from value to high-performance.',
            rows: [
                {
                    series: 'Arwyn',
                    descriptor: 'Conference swivel, five-star polished base',
                    image: '/category-images/swivel-images/api_arwyn.jpg',
                    tiers: {
                        good: pending('Confirm mid-back base price'),
                        better: pending('Confirm high-back base price'),
                        best: pending('Confirm executive / dual-uph base price'),
                    },
                },
                {
                    series: 'Cosgrove',
                    descriptor: 'Conference swivel',
                    image: '/category-images/swivel-images/api_cosgrove.jpg',
                    tiers: {
                        good: pending(),
                        better: pending(),
                        best: pending(),
                    },
                },
                {
                    series: 'Protocol',
                    descriptor: 'High-performance task seating',
                    image: '/category-images/swivel-images/api_protocol.jpg',
                    tiers: {
                        good: pending('Confirm mid-back base price'),
                        better: pending('Confirm high-back base price'),
                        best: pending('Confirm fully-loaded base price'),
                    },
                },
            ],
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
