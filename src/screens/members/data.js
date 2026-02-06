// Members and user management data
export const INITIAL_MEMBERS = [
    { 
        id: 1, 
        firstName: 'Luke', 
        lastName: 'Wagner', 
        email: 'luke.wagner@jsi.com', 
        phone: '555-1234', 
        title: 'Sales Manager',
        role: 'Admin',
        status: 'active',
        lastLogin: '2025-01-15T10:30:00Z',
        permissions: { 
            salesData: true, 
            commissions: true, 
            projects: true, 
            customerRanking: true, 
            dealerRewards: true, 
            submittingReplacements: true 
        },
        avatar: '/avatars/luke-wagner.jpg'
    },
    { 
        id: 2, 
        firstName: 'Sarah', 
        lastName: 'Johnson', 
        email: 'sarah.johnson@jsi.com', 
        phone: '555-5678', 
        title: 'Senior Designer',
        role: 'User',
        status: 'active',
        lastLogin: '2025-01-15T09:15:00Z',
        permissions: { 
            salesData: true, 
            commissions: false, 
            projects: true, 
            customerRanking: true, 
            dealerRewards: false, 
            submittingReplacements: true 
        },
        avatar: '/avatars/sarah-johnson.jpg'
    },
    { 
        id: 3, 
        firstName: 'Michael', 
        lastName: 'Chen', 
        email: 'michael.chen@jsi.com', 
        phone: '555-8765', 
        title: 'Regional Sales Rep',
        role: 'User',
        status: 'active',
        lastLogin: '2025-01-14T16:45:00Z',
        permissions: { 
            salesData: true, 
            commissions: true, 
            projects: true, 
            customerRanking: true, 
            dealerRewards: true, 
            submittingReplacements: true 
        },
        avatar: '/avatars/michael-chen.jpg'
    },
    { 
        id: 4, 
        firstName: 'Jessica', 
        lastName: 'Rodriguez', 
        email: 'jessica.rodriguez@jsi.com', 
        phone: '555-4321', 
        title: 'Admin Support',
        role: 'Admin',
        status: 'active',
        lastLogin: '2025-01-15T08:00:00Z',
        permissions: { 
            salesData: true, 
            commissions: true, 
            projects: true, 
            customerRanking: true, 
            dealerRewards: true, 
            submittingReplacements: true 
        },
        avatar: '/avatars/jessica-rodriguez.jpg'
    },
    { 
        id: 5, 
        firstName: 'David', 
        lastName: 'Thompson', 
        email: 'david.thompson@jsi.com', 
        phone: '555-2468', 
        title: 'Field Installer',
        role: 'User',
        status: 'pending',
        lastLogin: null,
        permissions: { 
            salesData: false, 
            commissions: false, 
            projects: true, 
            customerRanking: false, 
            dealerRewards: false, 
            submittingReplacements: true 
        },
        avatar: '/avatars/david-thompson.jpg'
    },
    { 
        id: 6, 
        firstName: 'Emily', 
        lastName: 'Davis', 
        email: 'emily.davis@jsi.com', 
        phone: '555-1357', 
        title: 'Sales/Designer',
        role: 'User',
        status: 'active',
        lastLogin: '2025-01-15T11:20:00Z',
        permissions: { 
            salesData: true, 
            commissions: false, 
            projects: true, 
            customerRanking: true, 
            dealerRewards: true, 
            submittingReplacements: true 
        },
        avatar: '/avatars/emily-davis.jpg'
    },
    { 
        id: 7, 
        firstName: 'Robert', 
        lastName: 'Wilson', 
        email: 'robert.wilson@jsi.com', 
        phone: '555-9753', 
        title: 'Designer',
        role: 'User',
        status: 'active',
        lastLogin: '2025-01-14T14:30:00Z',
        permissions: { 
            salesData: false, 
            commissions: false, 
            projects: true, 
            customerRanking: false, 
            dealerRewards: false, 
            submittingReplacements: true 
        },
        avatar: '/avatars/robert-wilson.jpg'
    }
];

export const PERMISSION_LABELS = {
    salesData: "Sales Data",
    customerRanking: "Customer Ranking",
    projects: "Projects",
    commissions: "Commissions",
    dealerRewards: "Dealer Rewards",
    submittingReplacements: "Submitting Replacements"
};

export const USER_TITLES = [
    "Sales", 
    "Designer", 
    "Sales/Designer", 
    "Admin Support",
    "Sales Manager",
    "Regional Sales Rep",
    "Senior Designer",
    "Field Installer"
];

export const USER_ROLES = ["Admin", "User"];

export const USER_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
};

export const STATUS_COLORS = {
    active: '#10B981',
    pending: '#C4956A', 
    inactive: '#6B7280',
    suspended: '#B85C5C'
};

export const EMPTY_USER = { 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '',
    title: 'Sales', 
    role: 'User',
    status: 'pending',
    permissions: { 
        salesData: true, 
        commissions: false, 
        projects: true, 
        customerRanking: true, 
        dealerRewards: true, 
        submittingReplacements: true 
    } 
};

export const MEMBER_STATS = {
    totalUsers: 7,
    activeUsers: 6,
    pendingUsers: 1,
    adminUsers: 2,
    standardUsers: 5
};

export const PERMISSION_DESCRIPTIONS = {
    salesData: "Access to sales reports, customer data, and revenue metrics",
    customerRanking: "View and manage customer ranking and performance data",
    projects: "Create, edit, and manage project opportunities and leads", 
    commissions: "View commission reports and earning statements",
    dealerRewards: "Access dealer incentive programs and reward tracking",
    submittingReplacements: "Submit and track replacement part requests"
};