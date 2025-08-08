// Resources related data
export const RESOURCES_DATA = [
    {
        category: "Product & Finish Resources",
        items: [
            { label: "Lead Times", nav: "resources/lead-times" },
            { label: "Search Fabrics", nav: "fabrics/search_form" },
            { label: "Request COM Yardage", nav: "fabrics/com_request" },
            { label: "Discontinued Finishes Database", nav: "resources/discontinued_finishes" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Sales & Rep Tools",
        items: [
            { label: "Dealer Directory", nav: "resources/dealer-directory" },
            { label: "Commission Rates", nav: "resources/commission-rates" },
            { label: "Sample Discounts", nav: "resources/sample_discounts" },
            { label: "Contracts", nav: "resources/contracts" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Dealer & Field Support",
        items: [
            { label: "Loaner Pool", nav: "resources/loaner_pool" },
            { label: "New Dealer Sign-Up", nav: "resources/dealer_registration" },
            { label: "Request Field Visit", nav: "resources/request_field_visit" },
            { label: "Install Instructions", nav: "resources/install_instructions" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Marketing & Communication",
        items: [
            { label: "Presentations", nav: "resources/presentations" },
            { label: "Social Media", nav: "resources/social_media" },
            { label: "Design Days", nav: "resources/design_days" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    }
];

export const LOANER_POOL_PRODUCTS = [
    {
        id: 'br2301',
        name: 'Bryn',
        model: 'BR2301',
        img: 'https://webresources.jsifurniture.com/production/uploads/jsi_bryn_comp_00022.jpg',
        specs: {
            'Upholstery': 'Maharam, Mode, Glacier',
            'Wood': 'Light Maple',
            'Other': 'Polished Aluminum Base'
        }
    },
    {
        id: 'cv4501',
        name: 'Caav',
        model: 'CV4501',
        img: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_feat_00027_vBm3FBY.jpg',
        specs: {
            'Upholstery': 'Momentum, Origin, Lagoon',
            'Wood': 'Mocha',
            'Other': 'Tablet Arm, Bag Hook'
        }
    },
    {
        id: 'kn2301',
        name: 'Knox',
        model: 'KN2301',
        img: 'https://webresources.jsifurniture.com/production/uploads/jsi_knox_comp_00001.jpg',
        specs: {
            'Upholstery': 'CF Stinson, Beeline, Honeycomb',
            'Wood': 'Natural Oak',
            'Other': 'Counter-Height, Foot Ring'
        }
    },
    {
        id: 'wk4501',
        name: 'Wink',
        model: 'WK4501',
        img: 'https://webresources.jsifurniture.com/production/uploads/jsi_wink_enviro_00033.jpg',
        specs: {
            'Upholstery': 'Kvadrat, Remix 3, 0662',
            'Shell': 'Designer White Plastic',
            'Other': '4-Star Swivel Base'
        }
    },
];

export const CONTRACTS_DATA = {
    omnia: {
        name: 'Omnia',
        tiers: [
            { off: '10% (Tier 1)', dealer: '5% dealer commission', rep: '5% rep commission' },
            { off: '15% (Tier 2)', dealer: '7% dealer commission', rep: '8% rep commission' },
        ],
        margin: ['5%', '10%', '15%'],
        note: 'Omnia contract details.',
        url: 'https://example.com/omnia-contract',
    },
    tips: {
        name: 'TIPS',
        tiers: [
            { off: '12% (Tier 1)', dealer: '6% dealer commission', rep: '6% rep commission' },
            { off: '18% (Tier 2)', dealer: '9% dealer commission', rep: '9% rep commission' },
        ],
        margin: ['6%', '12%', '18%'],
        note: 'TIPS contract details.',
        url: 'https://example.com/tips-contract',
    },
    premier: {
        name: 'Premier',
        tiers: [
            { off: '20% (Tier 1)', dealer: '10% dealer commission', rep: '10% rep commission' },
            { off: '25% (Tier 2)', dealer: '12% dealer commission', rep: '13% rep commission' },
        ],
        margin: ['10%', '20%', '25%'],
        note: 'Premier contract details.',
        url: 'https://example.com/premier-contract',
    },
};

export const DEALER_DIRECTORY_DATA = [
    {
        id: 1,
        name: "Business Furniture LLC",
        address: "4102 Meghan Beeler Court, South Bend, IN 46628",
        salespeople: [{ name: "John Doe", email: "john@businessfurniture.com", status: "active", roleLabel: "Sales" }],
        designers: [{ name: "Jane Smith", email: "jane@businessfurniture.com", status: "active", roleLabel: "Designer" }],
        administration: [],
        installers: [],
        dailyDiscount: "18.40%",
        bookings: 450000,
        sales: 435000
    },
    // Add more dealers as needed
];

export const REWARDS_DATA = [
    {
        id: 'reward001',
        name: 'Travel Rewards Program',
        description: 'Earn points for every dollar spent that can be redeemed for travel vouchers',
        pointsRequired: 1000,
        category: 'Travel',
        active: true
    },
    {
        id: 'reward002',
        name: 'Product Sample Credits',
        description: 'Receive credits for sample orders with qualifying purchases',
        pointsRequired: 500,
        category: 'Samples',
        active: true
    },
    {
        id: 'reward003',
        name: 'Training Course Access',
        description: 'Free access to JSI product training courses and certifications',
        pointsRequired: 750,
        category: 'Education',
        active: true
    },
    {
        id: 'reward004',
        name: 'Marketing Materials',
        description: 'Customized marketing materials and catalogs for your showroom',
        pointsRequired: 300,
        category: 'Marketing',
        active: true
    },
    {
        id: 'reward005',
        name: 'Premium Support',
        description: 'Priority customer support and dedicated account management',
        pointsRequired: 2000,
        category: 'Support',
        active: true
    }
];