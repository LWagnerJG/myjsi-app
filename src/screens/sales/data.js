// Sales feature specific data
import { VERTICAL_COLORS } from '../../constants/verticals.js';

export const YTD_SALES_DATA = [
    { label: 'Total Sales', current: 3666132, previous: 2900104, goal: 7000000 },
    { label: 'Education', current: 1250000, previous: 1045589, goal: 2500000 },
    { label: 'Health', current: 980000, previous: 850000, goal: 2000000 }
];

// Annual goals keyed by year — update each January
export const ANNUAL_GOALS_BY_YEAR = {
    2026: 7_500_000,
    2025: 7_000_000,
    2024: 6_500_000,
    2023: 6_000_000,
    2022: 5_500_000,
};

// Monthly bookings + invoiced sales by year
// When ERP is wired, replace with sales.getOrderSummary() grouped by month
export const MONTHLY_SALES_DATA_BY_YEAR = {
    2026: [
        { month: 'Jan', bookings: 1_182_400, sales:   524_800 },
        { month: 'Feb', bookings:   537_200, sales:   491_600 },
        { month: 'Mar', bookings:   428_900, sales:   382_400 },
        { month: 'Apr', bookings:   618_700, sales:   734_200 },
        { month: 'May', bookings:   316_500, sales:   192_300 },
    ],
    2025: [
        { month: 'Jan', bookings: 1259493, sales: 506304 },
        { month: 'Feb', bookings: 497537,  sales: 553922 },
        { month: 'Mar', bookings: 397684,  sales: 365601 },
        { month: 'Apr', bookings: 554318,  sales: 696628 },
        { month: 'May', bookings: 840255,  sales: 1340018 },
        { month: 'Jun', bookings: 116846,  sales: 36823 },
        { month: 'Jul', bookings: 520000,  sales: 785000 },
        { month: 'Aug', bookings: 600000,  sales: 825000 },
    ],
    2024: [
        { month: 'Jan', bookings: 980000,  sales: 810000 },
        { month: 'Feb', bookings: 620000,  sales: 590000 },
        { month: 'Mar', bookings: 745000,  sales: 680000 },
        { month: 'Apr', bookings: 830000,  sales: 760000 },
        { month: 'May', bookings: 910000,  sales: 870000 },
        { month: 'Jun', bookings: 760000,  sales: 720000 },
        { month: 'Jul', bookings: 680000,  sales: 640000 },
        { month: 'Aug', bookings: 590000,  sales: 555000 },
        { month: 'Sep', bookings: 870000,  sales: 830000 },
        { month: 'Oct', bookings: 950000,  sales: 910000 },
        { month: 'Nov', bookings: 710000,  sales: 680000 },
        { month: 'Dec', bookings: 540000,  sales: 510000 },
    ],
    2023: [
        { month: 'Jan', bookings: 810000,  sales: 740000 },
        { month: 'Feb', bookings: 550000,  sales: 510000 },
        { month: 'Mar', bookings: 680000,  sales: 620000 },
        { month: 'Apr', bookings: 720000,  sales: 670000 },
        { month: 'May', bookings: 840000,  sales: 790000 },
        { month: 'Jun', bookings: 690000,  sales: 650000 },
        { month: 'Jul', bookings: 600000,  sales: 560000 },
        { month: 'Aug', bookings: 520000,  sales: 490000 },
        { month: 'Sep', bookings: 760000,  sales: 720000 },
        { month: 'Oct', bookings: 870000,  sales: 840000 },
        { month: 'Nov', bookings: 640000,  sales: 610000 },
        { month: 'Dec', bookings: 490000,  sales: 460000 },
    ],
    2022: [
        { month: 'Jan', bookings: 680000,  sales: 620000 },
        { month: 'Feb', bookings: 450000,  sales: 410000 },
        { month: 'Mar', bookings: 560000,  sales: 510000 },
        { month: 'Apr', bookings: 610000,  sales: 570000 },
        { month: 'May', bookings: 720000,  sales: 680000 },
        { month: 'Jun', bookings: 590000,  sales: 550000 },
        { month: 'Jul', bookings: 510000,  sales: 475000 },
        { month: 'Aug', bookings: 440000,  sales: 410000 },
        { month: 'Sep', bookings: 640000,  sales: 600000 },
        { month: 'Oct', bookings: 730000,  sales: 700000 },
        { month: 'Nov', bookings: 550000,  sales: 520000 },
        { month: 'Dec', bookings: 410000,  sales: 380000 },
    ],
};

// Alias for current year — used by any component that doesn't need year selection
export const MONTHLY_SALES_DATA = MONTHLY_SALES_DATA_BY_YEAR[2025];

// Backlog — orders booked but not yet invoiced/shipped
// Source: ERP (products.getLeadTime will inform scheduled ship dates when wired)
export const BACKLOG_DATA = {
    total: 2_845_000,
    items: [
        { dealer: 'RJE Business Interiors',  project: 'Downtown Campus Ph.2',       value: 485000, scheduledShip: '2025-09-15', vertical: 'Corporate',   status: 'In Production' },
        { dealer: 'Business Furniture LLC',  project: 'Lawrence Township Ph.2',     value: 320000, scheduledShip: '2025-09-28', vertical: 'Education',   status: 'Scheduled' },
        { dealer: 'OfficeWorks',             project: 'Meridian HQ Expansion',      value: 295000, scheduledShip: '2025-10-06', vertical: 'Corporate',   status: 'Scheduled' },
        { dealer: 'Corporate Design Inc',    project: 'Parkview Medical Center',    value: 410000, scheduledShip: '2025-10-14', vertical: 'Healthcare',  status: 'In Production' },
        { dealer: 'LOTH Inc.',               project: 'State Archives Renovation',  value: 275000, scheduledShip: '2025-10-22', vertical: 'Government',  status: 'Pending Release' },
        { dealer: 'Sharp School Services',   project: 'Westfield K-8 STEM Wing',    value: 190000, scheduledShip: '2025-11-03', vertical: 'Education',   status: 'Scheduled' },
        { dealer: 'Braden Business Systems', project: 'Regional HQ Refresh',        value: 225000, scheduledShip: '2025-11-10', vertical: 'Corporate',   status: 'Pending Release' },
        { dealer: 'CVC',                     project: 'Operations Center Ph.2',     value: 180000, scheduledShip: '2025-11-17', vertical: 'Corporate',   status: 'Scheduled' },
        { dealer: 'One Eleven Design',       project: 'Embassy Suites Lobby',       value: 265000, scheduledShip: '2025-12-01', vertical: 'Hospitality', status: 'In Production' },
        { dealer: "Schroeder's",             project: 'Clinic Network Rollout',     value: 200000, scheduledShip: '2025-12-08', vertical: 'Healthcare',  status: 'Pending Release' },
    ],
};

export const SALES_VERTICALS_DATA = [
    { label: 'Healthcare',  value: 2900104, color: VERTICAL_COLORS.Healthcare  },
    { label: 'Education',   value: 1045589, color: VERTICAL_COLORS.Education   },
    { label: 'Hospitality', value: 1045589, color: VERTICAL_COLORS.Hospitality },
    { label: 'Corporate',   value: 1045589, color: VERTICAL_COLORS.Corporate   },
    { label: 'Government',  value: 1045589, color: VERTICAL_COLORS.Government  },
    { label: 'Other',       value:  500000, color: VERTICAL_COLORS.Other       },
];

export const CUSTOMER_RANK_DATA = [
    {
        id: 1,
        name: 'Business Furniture LLC',
        bookings: 450000,
        sales: 435000,
        orders: [
            { projectName: 'Lawrence Township LECC', amount: 43034 },
            { projectName: 'Monreau Seminary', amount: 137262 }
        ]
    },
    {
        id: 2,
        name: 'Corporate Design Inc',
        bookings: 380000,
        sales: 395000,
        orders: [
            { projectName: 'OneMain Financial HQ', amount: 1250 },
            { projectName: 'OneMain Financial Branch', amount: 643 }
        ]
    },
    {
        id: 3,
        name: 'OfficeWorks',
        bookings: 490000,
        sales: 510000,
        orders: [{ projectName: 'Main Office Remodel', amount: 510000 }]
    },
    {
        id: 4,
        name: 'LOTH Inc.',
        bookings: 310000,
        sales: 320000,
        orders: [{ projectName: 'Regional Office Refresh', amount: 320000 }]
    },
    {
        id: 5,
        name: 'One Eleven Design',
        bookings: 280000,
        sales: 275000,
        orders: [{ projectName: 'Centlivre, LLC', amount: 3415 }]
    },
    {
        id: 6,
        name: 'RJE Business Interiors',
        bookings: 650000,
        sales: 470000,
        orders: [{ projectName: 'Downtown Campus Buildout', amount: 470000 }]
    },
    {
        id: 7,
        name: 'Sharp School Services',
        bookings: 185000,
        sales: 190000,
        orders: [{ projectName: 'STEM Wing Expansion', amount: 190000 }]
    },
    {
        id: 8,
        name: 'Braden Business Systems',
        bookings: 205000,
        sales: 210000,
        orders: [{ projectName: 'Executive Suite Upgrade', amount: 210000 }]
    },
    {
        id: 9,
        name: "Schroeder's",
        bookings: 150000,
        sales: 140000,
        orders: [{ projectName: 'Clinic Lobby Refresh', amount: 140000 }]
    },
    {
        id: 10,
        name: 'CVC',
        bookings: 230000,
        sales: 220000,
        orders: [{ projectName: 'Operations Center', amount: 220000 }]
    }
];

export const INCENTIVE_REWARDS_DATA = {
    // 2025 quarters
    '2025-Q3': {
        sales: [
            { name: 'Luke Wagner', amount: 8500.00 },
            { name: 'Sarah Johnson', amount: 6750.50 },
            { name: 'Mike Davis', amount: 5200.25 },
            { name: 'Emily Chen', amount: 4100.75 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 3200.00 },
            { name: 'David Wilson', amount: 2800.50 },
            { name: 'Lisa Garcia', amount: 2400.25 }
        ]
    },
    '2025-Q2': {
        sales: [
            { name: 'Luke Wagner', amount: 7200.00 },
            { name: 'Sarah Johnson', amount: 5850.25 },
            { name: 'Mike Davis', amount: 4650.75 },
            { name: 'Emily Chen', amount: 3800.50 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 2900.00 },
            { name: 'David Wilson', amount: 2500.75 },
            { name: 'Lisa Garcia', amount: 2100.50 }
        ]
    },
    '2025-Q1': {
        sales: [
            { name: 'Luke Wagner', amount: 6800.00 },
            { name: 'Sarah Johnson', amount: 5400.75 },
            { name: 'Mike Davis', amount: 4200.50 },
            { name: 'Emily Chen', amount: 3600.25 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 2700.00 },
            { name: 'David Wilson', amount: 2300.50 },
            { name: 'Lisa Garcia', amount: 1950.75 }
        ]
    },
    // 2024 quarters
    '2024-Q4': {
        sales: [
            { name: 'Luke Wagner', amount: 9200.00 },
            { name: 'Sarah Johnson', amount: 7150.50 },
            { name: 'Mike Davis', amount: 5900.25 },
            { name: 'Emily Chen', amount: 4750.75 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 3500.00 },
            { name: 'David Wilson', amount: 3100.25 },
            { name: 'Lisa Garcia', amount: 2650.50 }
        ]
    },
    '2024-Q3': {
        sales: [
            { name: 'Luke Wagner', amount: 8800.00 },
            { name: 'Sarah Johnson', amount: 6900.75 },
            { name: 'Mike Davis', amount: 5500.50 },
            { name: 'Emily Chen', amount: 4400.25 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 3300.00 },
            { name: 'David Wilson', amount: 2950.50 },
            { name: 'Lisa Garcia', amount: 2500.75 }
        ]
    },
    '2024-Q2': {
        sales: [
            { name: 'Luke Wagner', amount: 7500.00 },
            { name: 'Sarah Johnson', amount: 6200.25 },
            { name: 'Mike Davis', amount: 4800.75 },
            { name: 'Emily Chen', amount: 3900.50 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 3000.00 },
            { name: 'David Wilson', amount: 2600.75 },
            { name: 'Lisa Garcia', amount: 2200.50 }
        ]
    },
    '2024-Q1': {
        sales: [
            { name: 'Luke Wagner', amount: 6500.00 },
            { name: 'Sarah Johnson', amount: 5100.50 },
            { name: 'Mike Davis', amount: 4000.25 },
            { name: 'Emily Chen', amount: 3200.75 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 2500.00 },
            { name: 'David Wilson', amount: 2200.25 },
            { name: 'Lisa Garcia', amount: 1850.50 }
        ]
    },
    // 2023 quarters
    '2023-Q4': {
        sales: [
            { name: 'Luke Wagner', amount: 8900.00 },
            { name: 'Sarah Johnson', amount: 6800.75 },
            { name: 'Mike Davis', amount: 5400.50 },
            { name: 'Emily Chen', amount: 4300.25 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 3400.00 },
            { name: 'David Wilson', amount: 2900.50 },
            { name: 'Lisa Garcia', amount: 2450.75 }
        ]
    },
    '2023-Q3': {
        sales: [
            { name: 'Luke Wagner', amount: 7800.00 },
            { name: 'Sarah Johnson', amount: 6200.25 },
            { name: 'Mike Davis', amount: 4900.75 },
            { name: 'Emily Chen', amount: 3800.50 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 3100.00 },
            { name: 'David Wilson', amount: 2700.75 },
            { name: 'Lisa Garcia', amount: 2300.50 }
        ]
    },
    '2023-Q2': {
        sales: [
            { name: 'Luke Wagner', amount: 6900.00 },
            { name: 'Sarah Johnson', amount: 5500.50 },
            { name: 'Mike Davis', amount: 4300.25 },
            { name: 'Emily Chen', amount: 3400.75 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 2800.00 },
            { name: 'David Wilson', amount: 2400.25 },
            { name: 'Lisa Garcia', amount: 2000.50 }
        ]
    },
    '2023-Q1': {
        sales: [
            { name: 'Luke Wagner', amount: 5800.00 },
            { name: 'Sarah Johnson', amount: 4600.75 },
            { name: 'Mike Davis', amount: 3600.50 },
            { name: 'Emily Chen', amount: 2800.25 }
        ],
        designers: [
            { name: 'Jessica Martinez', amount: 2300.00 },
            { name: 'David Wilson', amount: 2000.50 },
            { name: 'Lisa Garcia', amount: 1700.75 }
        ]
    }
};