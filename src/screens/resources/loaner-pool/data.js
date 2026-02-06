// Loaner Pool specific data

// ============================================
// SALES REPS - Who can hold and transfer items
// ============================================
export const SALES_REPS = [
    { id: 'rep-001', name: 'Sarah Mitchell', email: 'sarah.mitchell@jsifurniture.com', region: 'Midwest', phone: '(317) 555-1234' },
    { id: 'rep-002', name: 'Marcus Chen', email: 'marcus.chen@jsifurniture.com', region: 'West Coast', phone: '(415) 555-2345' },
    { id: 'rep-003', name: 'Jennifer Adams', email: 'jennifer.adams@jsifurniture.com', region: 'Northeast', phone: '(212) 555-3456' },
    { id: 'rep-004', name: 'David Rodriguez', email: 'david.rodriguez@jsifurniture.com', region: 'Southeast', phone: '(404) 555-4567' },
    { id: 'rep-005', name: 'Emily Watson', email: 'emily.watson@jsifurniture.com', region: 'Central', phone: '(512) 555-5678' },
];

// Current user (simulated - in real app this would come from auth)
export const CURRENT_USER = SALES_REPS[0]; // Sarah Mitchell

// ============================================
// TRANSFER REQUEST STATUS STATES
// ============================================
export const TRANSFER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    DECLINED: 'declined',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

export const TRANSFER_STATUS_LABELS = {
    [TRANSFER_STATUS.PENDING]: 'Pending Approval',
    [TRANSFER_STATUS.APPROVED]: 'Approved - Awaiting Handoff',
    [TRANSFER_STATUS.DECLINED]: 'Declined',
    [TRANSFER_STATUS.COMPLETED]: 'Completed',
    [TRANSFER_STATUS.CANCELLED]: 'Cancelled'
};

export const TRANSFER_STATUS_COLORS = {
    [TRANSFER_STATUS.PENDING]: '#C4956A',
    [TRANSFER_STATUS.APPROVED]: '#10B981',
    [TRANSFER_STATUS.DECLINED]: '#B85C5C',
    [TRANSFER_STATUS.COMPLETED]: '#6B7280',
    [TRANSFER_STATUS.CANCELLED]: '#9CA3AF'
};

// ============================================
// LOANER POOL PRODUCTS (ENHANCED WITH REP TRACKING)
// ============================================
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
        lastMaintenance: '2024-01-15',
        currentHolderRepId: null,
        transferEligible: true
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
        location: 'In field with Marcus Chen',
        currentHolderRepId: 'rep-002',
        returnDate: '2026-03-15',
        projectName: 'Mercy Health Campus',
        transferEligible: true
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
        lastMaintenance: '2024-02-20',
        currentHolderRepId: null,
        transferEligible: true
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
        estimatedReturn: '2026-02-15',
        currentHolderRepId: null,
        transferEligible: false // Under maintenance - not eligible
    },
    {
        id: 'vi3201',
        name: 'Vision',
        model: 'VI3201',
        img: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_stack_comp_00015.jpg',
        specs: {
            'Material': 'Laminate',
            'Top': 'White Ash',
            'Base': 'Chrome'
        },
        status: 'out-for-loan',
        location: 'In field with Jennifer Adams',
        currentHolderRepId: 'rep-003',
        returnDate: '2026-02-28',
        projectName: 'NYC Tech Startup',
        transferEligible: true
    },
    {
        id: 'ho2101',
        name: 'Hoopz',
        model: 'HO2101',
        img: 'https://webresources.jsifurniture.com/production/uploads/jsi_hoopz_feat_00004.jpg',
        specs: {
            'Shell': 'Poly, Fog',
            'Frame': 'Black Steel',
            'Other': 'Stackable'
        },
        status: 'out-for-loan',
        location: 'In field with David Rodriguez',
        currentHolderRepId: 'rep-004',
        returnDate: '2026-03-01',
        projectName: 'Atlanta School District',
        transferEligible: true
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
    [AVAILABILITY_STATUS.RESERVED]: '#C4956A',
    [AVAILABILITY_STATUS.OUT_FOR_LOAN]: '#5B7B8C',
    [AVAILABILITY_STATUS.MAINTENANCE]: '#B85C5C'
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

// ============================================
// SAMPLE TRANSFER REQUESTS (for demo state)
// ============================================
export const INITIAL_TRANSFER_REQUESTS = [
    {
        id: 'tr-001',
        itemId: 'cv4501',
        fromRepId: 'rep-002', // Marcus Chen
        toRepId: 'rep-001',   // Sarah Mitchell (current user)
        desiredStartDate: '2026-03-16',
        desiredEndDate: '2026-04-15',
        projectId: 'proj-chicago-medical',
        projectName: 'Chicago Medical Center',
        message: 'Need this for the Chicago Medical Center demo next month. Would be perfect for their waiting area.',
        status: 'pending',
        createdAt: '2026-02-01T10:30:00Z',
        decidedAt: null,
        decisionReason: null
    }
];

// ============================================
// LOANER EVENTS (audit trail)
// ============================================
export const LOAN_EVENT_TYPES = {
    CHECKED_OUT: 'checked_out',
    CHECKED_IN: 'checked_in',
    TRANSFER_REQUESTED: 'transfer_requested',
    TRANSFER_APPROVED: 'transfer_approved',
    TRANSFER_DECLINED: 'transfer_declined',
    TRANSFER_COMPLETED: 'transfer_completed',
    TRANSFER_CANCELLED: 'transfer_cancelled',
    MAINTENANCE_START: 'maintenance_start',
    MAINTENANCE_END: 'maintenance_end'
};

export const INITIAL_LOAN_EVENTS = [
    {
        id: 'evt-001',
        itemId: 'cv4501',
        eventType: LOAN_EVENT_TYPES.CHECKED_OUT,
        repId: 'rep-002',
        timestamp: '2026-01-15T09:00:00Z',
        notes: 'Checked out for Mercy Health Campus project'
    },
    {
        id: 'evt-002',
        itemId: 'vi3201',
        eventType: LOAN_EVENT_TYPES.CHECKED_OUT,
        repId: 'rep-003',
        timestamp: '2026-01-20T14:30:00Z',
        notes: 'Checked out for NYC Tech Startup'
    },
    {
        id: 'evt-003',
        itemId: 'ho2101',
        eventType: LOAN_EVENT_TYPES.CHECKED_OUT,
        repId: 'rep-004',
        timestamp: '2026-01-25T11:00:00Z',
        notes: 'Checked out for Atlanta School District'
    }
];

// ============================================
// NOTIFICATIONS
// ============================================
export const INITIAL_NOTIFICATIONS = [
    {
        id: 'notif-001',
        type: 'transfer_request_received',
        title: 'Transfer Request',
        message: 'Emily Watson requested transfer of Knox (KN2301) for University Project',
        fromRepId: 'rep-005',
        toRepId: 'rep-001',
        itemId: 'kn2301',
        transferRequestId: null,
        read: false,
        createdAt: '2026-02-02T08:00:00Z',
        actionRequired: true
    }
];