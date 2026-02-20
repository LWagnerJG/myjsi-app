// Dealer Directory specific data — enriched with vertical sales, series, rep rewards, recent projects
export const DEALER_DIRECTORY_DATA = [
    {
        id: 1,
        name: "Business Furniture LLC",
        address: "4102 Meghan Beeler Court, South Bend, IN 46628",
        phone: "(574) 234-8176",
        territory: "Northern Indiana",
        salespeople: [
            { name: "John Doe", email: "john@businessfurniture.com", status: "active", roleLabel: "Sales" },
            { name: "Amy Richards", email: "amy@businessfurniture.com", status: "active", roleLabel: "Sales" }
        ],
        designers: [{ name: "Jane Smith", email: "jane@businessfurniture.com", status: "active", roleLabel: "Designer" }],
        administration: [{ name: "Karen Mitchell", email: "karen@businessfurniture.com", status: "active", roleLabel: "Administrator" }],
        installers: [{ name: "Steve Park", email: "steve@businessfurniture.com", status: "active", roleLabel: "Installer" }],
        dailyDiscount: "18.40%",
        bookings: 450000,
        sales: 435000,
        ytdGoal: 900000,
        rebatableGoal: 600000,
        rebatableSales: 312000,
        verticalSales: [
            { label: 'Healthcare', value: 152000, color: '#4A7C59' },
            { label: 'Education', value: 118000, color: '#5B7B8C' },
            { label: 'Corporate', value: 95000, color: '#8B7355' },
            { label: 'Government', value: 42000, color: '#7A8B6F' },
            { label: 'Hospitality', value: 28000, color: '#C4956A' },
        ],
        seriesSales: [
            { series: 'Ansen', amount: 82000 },
            { series: 'Bryn', amount: 67000 },
            { series: 'Cosgrove', amount: 54000 },
            { series: 'Flux', amount: 48000 },
            { series: 'Collective Motion', amount: 41000 },
            { series: 'Harbor', amount: 38000 },
            { series: 'Encore', amount: 32000 },
            { series: 'Indie', amount: 28000 },
            { series: 'Forge', amount: 22000 },
            { series: 'Gatsby', amount: 18000 },
        ],
        repRewards: [
            { name: "John Doe", type: "sales", q1: 3200, q2: 3800, q3: 4500, q4: 0, ytd: 11500 },
            { name: "Amy Richards", type: "sales", q1: 2100, q2: 2600, q3: 3100, q4: 0, ytd: 7800 },
            { name: "Jane Smith", type: "designer", q1: 1800, q2: 2200, q3: 2700, q4: 0, ytd: 6700 },
        ],
        recentProjects: [
            { name: "Lawrence Township LECC", amount: 43034, status: "shipped", date: "2025-09-12" },
            { name: "Monreau Seminary", amount: 137262, status: "in-progress", date: "2025-10-05" },
            { name: "South Bend City Hall Refresh", amount: 28500, status: "quoted", date: "2025-11-01" },
            { name: "Granger K-8 Library", amount: 62100, status: "ordered", date: "2025-08-18" },
        ],
        monthlySales: [
            { month: 'Jan', amount: 32000 }, { month: 'Feb', amount: 38000 }, { month: 'Mar', amount: 29000 },
            { month: 'Apr', amount: 45000 }, { month: 'May', amount: 52000 }, { month: 'Jun', amount: 48000 },
            { month: 'Jul', amount: 55000 }, { month: 'Aug', amount: 61000 }, { month: 'Sep', amount: 75000 },
        ],
    },
    {
        id: 2,
        name: "Corporate Design Inc",
        address: "123 Main Street, Evansville, IN 47708",
        phone: "(812) 555-0142",
        territory: "Southern Indiana",
        salespeople: [{ name: "Mike Wilson", email: "mike@corporatedesign.com", status: "active", roleLabel: "Sales" }],
        designers: [
            { name: "Sarah Johnson", email: "sarah@corporatedesign.com", status: "active", roleLabel: "Designer" },
            { name: "Rachel Kim", email: "rachel@corporatedesign.com", status: "active", roleLabel: "Designer" }
        ],
        administration: [{ name: "Admin User", email: "admin@corporatedesign.com", status: "active", roleLabel: "Administrator" }],
        installers: [],
        dailyDiscount: "22.34%",
        bookings: 380000,
        sales: 395000,
        ytdGoal: 800000,
        rebatableGoal: 500000,
        rebatableSales: 278000,
        verticalSales: [
            { label: 'Corporate', value: 185000, color: '#8B7355' },
            { label: 'Healthcare', value: 95000, color: '#4A7C59' },
            { label: 'Education', value: 68000, color: '#5B7B8C' },
            { label: 'Government', value: 32000, color: '#7A8B6F' },
            { label: 'Hospitality', value: 15000, color: '#C4956A' },
        ],
        seriesSales: [
            { series: 'Collective Motion', amount: 72000 },
            { series: 'Bryn', amount: 58000 },
            { series: 'Flux', amount: 51000 },
            { series: 'Harbor', amount: 44000 },
            { series: 'Ansen', amount: 38000 },
            { series: 'Gatsby', amount: 35000 },
            { series: 'Forge', amount: 29000 },
            { series: 'Indie', amount: 24000 },
        ],
        repRewards: [
            { name: "Mike Wilson", type: "sales", q1: 2800, q2: 3200, q3: 3900, q4: 0, ytd: 9900 },
            { name: "Sarah Johnson", type: "designer", q1: 1500, q2: 1900, q3: 2400, q4: 0, ytd: 5800 },
            { name: "Rachel Kim", type: "designer", q1: 1200, q2: 1600, q3: 2000, q4: 0, ytd: 4800 },
        ],
        recentProjects: [
            { name: "OneMain Financial HQ", amount: 1250, status: "shipped", date: "2025-07-22" },
            { name: "OneMain Financial Branch", amount: 643, status: "shipped", date: "2025-08-15" },
            { name: "Deaconess Medical Tower", amount: 89400, status: "in-progress", date: "2025-09-30" },
            { name: "USI Admin Building", amount: 54200, status: "quoted", date: "2025-10-18" },
        ],
        monthlySales: [
            { month: 'Jan', amount: 28000 }, { month: 'Feb', amount: 34000 }, { month: 'Mar', amount: 42000 },
            { month: 'Apr', amount: 38000 }, { month: 'May', amount: 46000 }, { month: 'Jun', amount: 51000 },
            { month: 'Jul', amount: 48000 }, { month: 'Aug', amount: 53000 }, { month: 'Sep', amount: 55000 },
        ],
    },
    {
        id: 3,
        name: "OfficeWorks",
        address: "456 Business Ave, Indianapolis, IN 46204",
        phone: "(317) 555-0198",
        territory: "Central Indiana",
        salespeople: [
            { name: "Lisa Chen", email: "lisa@officeworks.com", status: "active", roleLabel: "Sales" },
            { name: "Brian Noel", email: "brian@officeworks.com", status: "active", roleLabel: "Sales" },
            { name: "Tanya Webb", email: "tanya@officeworks.com", status: "pending", roleLabel: "Sales" },
        ],
        designers: [{ name: "Derek Langston", email: "derek@officeworks.com", status: "active", roleLabel: "Designer" }],
        administration: [{ name: "Mira Patel", email: "mira@officeworks.com", status: "active", roleLabel: "Administrator" }],
        installers: [{ name: "Tom Brown", email: "tom@officeworks.com", status: "active", roleLabel: "Installer" }],
        dailyDiscount: "19.50%",
        bookings: 490000,
        sales: 510000,
        ytdGoal: 1000000,
        rebatableGoal: 700000,
        rebatableSales: 428000,
        verticalSales: [
            { label: 'Education', value: 210000, color: '#5B7B8C' },
            { label: 'Healthcare', value: 125000, color: '#4A7C59' },
            { label: 'Corporate', value: 98000, color: '#8B7355' },
            { label: 'Government', value: 52000, color: '#7A8B6F' },
            { label: 'Hospitality', value: 25000, color: '#C4956A' },
        ],
        seriesSales: [
            { series: 'Ansen', amount: 95000 },
            { series: 'Bryn', amount: 82000 },
            { series: 'Cosgrove', amount: 71000 },
            { series: 'Flux', amount: 62000 },
            { series: 'Collective Motion', amount: 55000 },
            { series: 'Harbor', amount: 42000 },
            { series: 'Encore', amount: 38000 },
            { series: 'Gatsby', amount: 28000 },
            { series: 'Forge', amount: 19000 },
            { series: 'Indie', amount: 18000 },
        ],
        repRewards: [
            { name: "Lisa Chen", type: "sales", q1: 4200, q2: 4800, q3: 5500, q4: 0, ytd: 14500 },
            { name: "Brian Noel", type: "sales", q1: 2800, q2: 3200, q3: 3800, q4: 0, ytd: 9800 },
            { name: "Tanya Webb", type: "sales", q1: 0, q2: 800, q3: 1200, q4: 0, ytd: 2000 },
            { name: "Derek Langston", type: "designer", q1: 2200, q2: 2600, q3: 3100, q4: 0, ytd: 7900 },
        ],
        recentProjects: [
            { name: "Main Office Remodel", amount: 510000, status: "in-progress", date: "2025-06-10" },
            { name: "Carmel Clay Schools Phase 2", amount: 128000, status: "ordered", date: "2025-09-02" },
            { name: "IU Health Saxony", amount: 74500, status: "shipped", date: "2025-08-28" },
            { name: "Fishers City Hall", amount: 42000, status: "quoted", date: "2025-11-05" },
            { name: "Zionsville Library Annex", amount: 31200, status: "ordered", date: "2025-10-12" },
        ],
        monthlySales: [
            { month: 'Jan', amount: 42000 }, { month: 'Feb', amount: 48000 }, { month: 'Mar', amount: 55000 },
            { month: 'Apr', amount: 52000 }, { month: 'May', amount: 68000 }, { month: 'Jun', amount: 62000 },
            { month: 'Jul', amount: 58000 }, { month: 'Aug', amount: 64000 }, { month: 'Sep', amount: 61000 },
        ],
    }
];

export const DEALER_ROLES = [
    { value: 'sales', label: 'Sales' },
    { value: 'designer', label: 'Designer' },
    { value: 'admin', label: 'Administration' },
    { value: 'installer', label: 'Installer' }
];

export const DEALER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending'
};

export const ROLE_OPTIONS = [
    { label: 'Administrator', value: 'Administrator' },
    { label: 'Admin/Sales Support', value: 'Admin/Sales Support' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Designer', value: 'Designer' },
    { label: 'Sales/Designer', value: 'Sales/Designer' },
    { label: 'Installer', value: 'Installer' }
];

// Daily discount options — pull from central constants
export { DAILY_DISCOUNT_OPTIONS } from '../../../constants/discounts.js';

// Status badge mapping for project statuses
export const PROJECT_STATUS_CONFIG = {
    'shipped': { label: 'Shipped', color: '#4A7C59', bg: 'rgba(74,124,89,0.12)' },
    'in-progress': { label: 'In Progress', color: '#C4956A', bg: 'rgba(196,149,106,0.12)' },
    'ordered': { label: 'Ordered', color: '#5B7B8C', bg: 'rgba(91,123,140,0.12)' },
    'quoted': { label: 'Quoted', color: '#8B7355', bg: 'rgba(139,115,85,0.12)' },
};