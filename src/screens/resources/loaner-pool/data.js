// Loaner Pool specific data
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
        },
        status: 'available',
        location: 'Jasper Showroom',
        lastMaintenance: '2024-01-15'
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
        },
        status: 'out-for-loan',
        location: 'On loan to Business Furniture LLC',
        returnDate: '2024-12-15'
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
        },
        status: 'available',
        location: 'Indianapolis Warehouse',
        lastMaintenance: '2024-02-20'
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
        },
        status: 'maintenance',
        location: 'Service Center',
        estimatedReturn: '2024-12-01'
    },
];

export const AVAILABILITY_STATUS = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    OUT_FOR_LOAN: 'out-for-loan',
    MAINTENANCE: 'maintenance'
};

export const STATUS_LABELS = {
    [AVAILABILITY_STATUS.AVAILABLE]: 'Available',
    [AVAILABILITY_STATUS.RESERVED]: 'Reserved',
    [AVAILABILITY_STATUS.OUT_FOR_LOAN]: 'Out for Loan',
    [AVAILABILITY_STATUS.MAINTENANCE]: 'Under Maintenance'
};

export const STATUS_COLORS = {
    [AVAILABILITY_STATUS.AVAILABLE]: '#10B981',
    [AVAILABILITY_STATUS.RESERVED]: '#F59E0B',
    [AVAILABILITY_STATUS.OUT_FOR_LOAN]: '#3B82F6',
    [AVAILABILITY_STATUS.MAINTENANCE]: '#EF4444'
};

export const LOAN_DURATIONS = [
    { value: '1-week', label: '1 Week' },
    { value: '2-weeks', label: '2 Weeks' },
    { value: '1-month', label: '1 Month' },
    { value: '3-months', label: '3 Months' }
];

export const LOANER_LOCATIONS = [
    'Jasper Showroom',
    'Indianapolis Warehouse',
    'Chicago Showroom',
    'Service Center'
];