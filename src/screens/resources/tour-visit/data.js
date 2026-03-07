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
        name: 'Fulton Market Showroom',
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
        options: [
            { label: 'Wood + metal process walk', description: 'See core fabrication, assembly, and finish steps across the manufacturing floor.' },
            { label: 'Packaging and staging flow', description: 'Review how product is packed, staged, and prepared for shipment and install.' },
            { label: 'Quality checkpoints review', description: 'Walk through the quality checks used before product leaves the plant.' },
        ],
    },
    {
        id: 'design',
        title: 'Design Studio Deep Dive',
        description: 'Explore product intent, finish decisions, and design language.',
        options: [
            { label: 'Finish and material lab', description: 'Compare finishes and materials in a hands-on review with the product team.' },
            { label: 'Designer Q&A session', description: 'Spend time with design leadership discussing product decisions and intent.' },
            { label: 'Future concepts preview', description: 'Preview early-stage thinking and directional ideas under active exploration.' },
        ],
    },
    {
        id: 'application',
        title: 'Application + Planning',
        description: 'Plan around real projects with practical product pairings.',
        options: [
            { label: 'Workplace applications', description: 'Focus on planning ideas and product mixes for workplace environments.' },
            { label: 'Healthcare applications', description: 'Review relevant applications for patient, staff, and support spaces.' },
            { label: 'Higher-ed applications', description: 'Explore product approaches for classrooms, commons, and campus settings.' },
        ],
    },
    {
        id: 'sales',
        title: 'Sales Enablement',
        description: 'Build sharper messaging and spec conversation confidence.',
        options: [
            { label: 'Specification objection handling', description: 'Work through common specification concerns and response strategies.' },
            { label: 'Storytelling by collection', description: 'Learn concise ways to present collections and their best-fit stories.' },
            { label: 'Competitive positioning workshop', description: 'Sharpen how teams compare JSI against common competitive alternatives.' },
        ],
    },
    {
        id: 'hospitality',
        title: 'Hospitality + Relationship',
        description: 'Create memorable hosted moments for dealer and client teams.',
        options: [
            { label: 'Hosted dinner program', description: 'Add a hosted dinner moment that supports stronger relationship-building.' },
            { label: 'Leadership meet-and-greet', description: 'Create a short leadership introduction for key guests and hosted teams.' },
            { label: 'Showroom social walkthrough', description: 'Turn the showroom visit into a more informal hosted social experience.' },
        ],
    },
];

export const TOUR_VISIT_UPCOMING_VISITS = [
    {
        id: 'north-star-health-jasper',
        companyName: 'North Star Health Group',
        facilityName: 'Jasper Headquarters',
        dateLabel: 'Apr 17-18, 2026',
        overnightLabel: '2 days, 1 night',
        attendees: 'Healthcare design leadership team',
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
    {
        id: 'civic-workplace-chicago',
        companyName: 'Civic Workplace Collective',
        facilityName: 'Fulton Market Showroom',
        dateLabel: 'May 9-10, 2026',
        overnightLabel: '2 days, 1 night',
        attendees: 'Dealer strategy and workplace clients',
        agenda: [
            {
                dayLabel: 'Day 1',
                sessions: [
                    '10:00 AM - Welcome and intro conversation',
                    '11:00 AM - Design studio deep dive and finish narratives',
                    '1:00 PM - Product training essentials over hosted lunch',
                    '3:00 PM - New product insight conversation',
                    '6:30 PM - Hosted dinner with market storytelling review',
                ],
            },
            {
                dayLabel: 'Day 2',
                sessions: [
                    '8:30 AM - Application workshop: workplace + higher-ed',
                    '10:15 AM - Sales enablement and specification roleplay',
                    '11:45 AM - Wrap-up and next project commitments',
                ],
            },
        ],
    },
    {
        id: 'meridian-learning-dc',
        companyName: 'Meridian Learning Systems',
        facilityName: 'Washington DC Space',
        dateLabel: 'Jun 4-5, 2026',
        overnightLabel: '2 days, 1 night',
        attendees: 'Education planning and procurement partners',
        agenda: [
            {
                dayLabel: 'Day 1',
                sessions: [
                    '9:00 AM - Welcome and intro conversation',
                    '10:00 AM - Product training essentials and planning priorities',
                    '12:00 PM - Hosted lunch and insight exchange',
                    '2:00 PM - New product insight conversation',
                    '4:00 PM - Application review: student + faculty environments',
                ],
            },
            {
                dayLabel: 'Day 2',
                sessions: [
                    '8:45 AM - Hospitality and relationship-building walkthrough',
                    '10:00 AM - Sales enablement session and roadmap alignment',
                    '11:30 AM - Closing commitments and follow-up scheduling',
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
    funFact: '',
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
