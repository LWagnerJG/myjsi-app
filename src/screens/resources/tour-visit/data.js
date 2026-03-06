const buildId = () =>
    globalThis.crypto?.randomUUID?.() || `tour-guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const TOUR_VISIT_FACILITIES = [
    {
        id: 'jasper',
        label: 'Jasper',
        name: 'Jasper Headquarters',
        location: 'Jasper, Indiana',
        eyebrow: 'Manufacturing Campus',
        blurb: 'A full-campus visit centered on product making, materiality, and the JSI home base.',
        details: ['Factory walk-through', 'Closest airport: EVV', 'Best for immersive product tours'],
    },
    {
        id: 'chicago',
        label: 'Chicago',
        name: 'Chicago Showroom',
        location: 'Chicago, Illinois',
        eyebrow: 'Showroom Experience',
        blurb: 'A design-forward stop focused on market conversations, hospitality, and curated product storytelling.',
        details: ['Downtown showroom', 'Closest airport: ORD', 'Best for dealer and designer hosting'],
    },
    {
        id: 'dc',
        label: 'DC',
        name: 'Washington DC Space',
        location: 'Washington, DC',
        eyebrow: 'Client Hosting',
        blurb: 'A polished East Coast visit designed for federal, healthcare, and workplace relationship building.',
        details: ['Client-ready setting', 'Closest airport: DCA', 'Best for high-touch hosted visits'],
    },
];

export const TOUR_VISIT_AIRLINES = [
    // Most common choices
    'Southwest',
    'Delta',
    'American',
    'United',
    'Alaska',
    'JetBlue',
    // Major network and leisure carriers
    'Spirit',
    'Frontier',
    'Allegiant',
    'Sun Country',
    'Hawaiian',
    'Breeze',
    'Avelo',
    // Frequent international connections
    'Air Canada',
    'WestJet',
    'Lufthansa',
    'British Airways',
    'Air France',
    'KLM',
    'Iberia',
    'Virgin Atlantic',
    'Emirates',
    'Qatar Airways',
    'Singapore Airlines',
    'ANA',
];

export const TOUR_VISIT_TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

export const TOUR_VISIT_CANDLE_SCENTS = [
    'Amber Oak',
    'White Tea',
    'Citrus Grove',
    'Fresh Linen',
    'Cedar Smoke',
];

export const TOUR_VISIT_DIETARY_RESTRICTIONS = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut Allergy',
    'Shellfish Allergy',
    'Halal',
    'Kosher',
    'Other',
];

export const TOUR_VISIT_NON_NEGOTIABLE_SESSIONS = [
    'Welcome and intro conversation',
    'New product insight conversation',
    'Product training essentials',
];

export const TOUR_VISIT_EXPERIENCE_TRACKS = [
    {
        id: 'manufacturing',
        title: 'Manufacturing Immersion',
        description: 'Hands-on visibility into how products are built and quality checked.',
        options: ['Wood + metal process walk', 'Packaging and staging flow', 'Quality checkpoints review'],
    },
    {
        id: 'design',
        title: 'Design Studio Deep Dive',
        description: 'Explore product intent, finish decisions, and design language.',
        options: ['Finish and material lab', 'Designer Q&A session', 'Future concepts preview'],
    },
    {
        id: 'application',
        title: 'Application + Planning',
        description: 'Plan around real projects with practical product pairings.',
        options: ['Workplace applications', 'Healthcare applications', 'Higher-ed applications'],
    },
    {
        id: 'sales',
        title: 'Sales Enablement',
        description: 'Build sharper messaging and spec conversation confidence.',
        options: ['Specification objection handling', 'Storytelling by collection', 'Competitive positioning workshop'],
    },
    {
        id: 'hospitality',
        title: 'Hospitality + Relationship',
        description: 'Create memorable hosted moments for dealer and client teams.',
        options: ['Hosted dinner program', 'Leadership meet-and-greet', 'Showroom social walkthrough'],
    },
];

export const TOUR_VISIT_UPCOMING_VISITS = [
    {
        id: 'jasper-march-hosted-visit',
        title: 'Jasper Hosted Facility Visit',
        facilityName: 'Jasper Headquarters',
        dateLabel: 'Apr 17-18, 2026',
        overnightLabel: '2 days, 1 night',
        attendees: 'Dealer principals + A&D guests',
        agenda: [
            {
                dayLabel: 'Day 1',
                sessions: [
                    '9:30 AM - Welcome and intro conversation',
                    '10:30 AM - Manufacturing immersion: wood + metal process walk',
                    '12:00 PM - Working lunch with product training essentials',
                    '2:00 PM - New product insight conversation and finish review',
                    '6:00 PM - Hosted dinner program at the Jasper lodge',
                ],
            },
            {
                dayLabel: 'Day 2',
                sessions: [
                    '8:30 AM - Design studio deep dive and applications lab',
                    '10:30 AM - Sales enablement workshop: spec + positioning',
                    '12:00 PM - Leadership Q&A and next-step planning',
                ],
            },
        ],
    },
];

export const createTourGuest = (seed = {}) => ({
    id: buildId(),
    isSelf: false,
    linkedMemberId: null,
    legalFirstName: '',
    legalLastName: '',
    knownTravelerNumber: '',
    preferredAirline: '',
    shirtSize: '',
    candleScent: '',
    hasDietaryRestrictions: false,
    dietaryRestrictions: [],
    dietaryRestrictionsOther: '',
    ...seed,
});

export const createRepGuest = (userSettings = {}) =>
    createTourGuest({
        isSelf: true,
        legalFirstName: userSettings?.firstName || '',
        legalLastName: userSettings?.lastName || '',
        shirtSize: userSettings?.shirtSize || '',
    });
