// Members and user management data
// ============================================
// Role system
// Rep users: your team members in the rep firm
// Dealer view: shows dealer companies signed up and their people
// ============================================

// Rep roles
export const REP_ROLES = [
    { value: 'rep-admin', label: 'Rep Admin' },
    { value: 'rep-principal', label: 'Rep Principal' },
    { value: 'rep-user', label: 'Rep User' },
];

// Dealer roles (for dealer users within a dealer company)
export const DEALER_ROLES = [
    { value: 'dealer-principal', label: 'Dealer Principal' },
    { value: 'dealer-admin-support', label: 'Dealer Admin Support' },
    { value: 'dealer-sales-rep', label: 'Dealer Sales Rep' },
    { value: 'dealer-designer', label: 'Dealer Designer' },
    { value: 'dealer-sales-and-design', label: 'Dealer Sales & Design' },
    { value: 'dealer-installer', label: 'Dealer Installer' },
];

// Admin-level roles (full access)
export const ADMIN_ROLES = ['rep-admin', 'rep-principal', 'dealer-principal', 'dealer-admin-support'];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const getRoleLabel = (roleValue) => {
    const all = [...REP_ROLES, ...DEALER_ROLES];
    return all.find(r => r.value === roleValue)?.label || roleValue;
};

// ----- Permission system -----
export const PERMISSION_LABELS = {
    salesData: 'Sales Data',
    projectsData: 'Projects Data',
    orderData: 'Order Data',
    replacements: 'Replacements',
    sampleOrdering: 'Sample Ordering',
    commissions: 'Commissions',
};

export const PERMISSION_DESCRIPTIONS = {
    salesData: 'Access to sales reports, customer data, revenue metrics, dealer rewards, and customer ranking',
    projectsData: 'Create, edit, and manage project opportunities and leads',
    orderData: 'View and manage orders, order history, and order entry',
    replacements: 'Submit and track replacement part requests',
    sampleOrdering: 'Order product samples and track sample requests',
    commissions: 'View commission reports and earning statements',
};

// ----- Rep team members (your firm) -----
export const INITIAL_MEMBERS = [
    {
        id: 1,
        firstName: 'Luke',
        lastName: 'Wagner',
        email: 'luke.wagner@jsi.com',
        phone: '555-1234',
        role: 'rep-admin',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true, commissions: true,
        },
    },
    {
        id: 2,
        firstName: 'Jessica',
        lastName: 'Rodriguez',
        email: 'jessica.rodriguez@jsi.com',
        phone: '555-4321',
        role: 'rep-principal',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true, commissions: true,
        },
    },
    {
        id: 3,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@jsi.com',
        phone: '555-5678',
        role: 'rep-user',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true, commissions: false,
        },
    },
    {
        id: 4,
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@jsi.com',
        phone: '555-8765',
        role: 'rep-user',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true, commissions: true,
        },
    },
    {
        id: 5,
        firstName: 'David',
        lastName: 'Thompson',
        email: 'david.thompson@jsi.com',
        phone: '555-2468',
        role: 'rep-user',
        permissions: {
            salesData: false, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true, commissions: false,
        },
    },
    {
        id: 6,
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@jsi.com',
        phone: '555-1357',
        role: 'rep-user',
        permissions: {
            salesData: true, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: false, commissions: false,
        },
    },
    {
        id: 7,
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@jsi.com',
        phone: '555-9753',
        role: 'rep-user',
        permissions: {
            salesData: false, projectsData: true, orderData: true,
            replacements: true, sampleOrdering: true, commissions: false,
        },
    },
];

// ----- Dealer companies & their users -----
export const INITIAL_DEALER_COMPANIES = [
    {
        id: 'd1',
        name: 'Office Interiors Group',
        city: 'Indianapolis, IN',
        signedUp: '2024-08-12',
        users: [
            { id: 'd1u1', firstName: 'Karen', lastName: 'Mitchell', email: 'karen@oig.com', role: 'dealer-principal' },
            { id: 'd1u2', firstName: 'Tom', lastName: 'Bradley', email: 'tom@oig.com', role: 'dealer-sales-rep' },
            { id: 'd1u3', firstName: 'Lisa', lastName: 'Nguyen', email: 'lisa@oig.com', role: 'dealer-designer' },
        ],
    },
    {
        id: 'd2',
        name: 'Pinnacle Workspace Solutions',
        city: 'Louisville, KY',
        signedUp: '2024-10-03',
        users: [
            { id: 'd2u1', firstName: 'James', lastName: 'Foster', email: 'james@pinnacle-ws.com', role: 'dealer-principal' },
            { id: 'd2u2', firstName: 'Amanda', lastName: 'Cole', email: 'amanda@pinnacle-ws.com', role: 'dealer-admin-support' },
            { id: 'd2u3', firstName: 'Ryan', lastName: 'Patel', email: 'ryan@pinnacle-ws.com', role: 'dealer-sales-and-design' },
            { id: 'd2u4', firstName: 'Megan', lastName: 'Brooks', email: 'megan@pinnacle-ws.com', role: 'dealer-sales-rep' },
        ],
    },
    {
        id: 'd3',
        name: 'Metro Contract Furnishings',
        city: 'Cincinnati, OH',
        signedUp: '2025-01-18',
        users: [
            { id: 'd3u1', firstName: 'Steve', lastName: 'Harrison', email: 'steve@metrocf.com', role: 'dealer-principal' },
            { id: 'd3u2', firstName: 'Diane', lastName: 'Reeves', email: 'diane@metrocf.com', role: 'dealer-designer' },
        ],
    },
    {
        id: 'd4',
        name: 'Heartland Office Products',
        city: 'Evansville, IN',
        signedUp: '2025-03-22',
        users: [
            { id: 'd4u1', firstName: 'Chris', lastName: 'Walker', email: 'chris@heartlandop.com', role: 'dealer-admin-support' },
            { id: 'd4u2', firstName: 'Natalie', lastName: 'Kim', email: 'natalie@heartlandop.com', role: 'dealer-sales-rep' },
            { id: 'd4u3', firstName: 'Derek', lastName: 'Simmons', email: 'derek@heartlandop.com', role: 'dealer-installer' },
        ],
    },
    {
        id: 'd5',
        name: 'Great Lakes Furnishings',
        city: 'Fort Wayne, IN',
        signedUp: '2025-06-10',
        users: [
            { id: 'd5u1', firstName: 'Jennifer', lastName: 'Owens', email: 'jen@greatlakesf.com', role: 'dealer-principal' },
        ],
    },
];

export const EMPTY_USER = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'rep-user',
    permissions: {
        salesData: true, commissions: false, projects: true,
        customerRanking: true, dealerRewards: true, submittingReplacements: true,
    },
};

// Legacy exports for backward compat
export const USER_TITLES = [];
export const USER_ROLES = ['Admin', 'User'];
export const STATUS_COLORS = {
    active: '#10B981',
    pending: '#C4956A',
    inactive: '#6B7280',
    suspended: '#B85C5C',
};
export const DOMAINS = { rep: 'rep', dealer: 'dealer' };
export const getRolesForDomain = (domain) => domain === 'dealer' ? DEALER_ROLES : REP_ROLES;