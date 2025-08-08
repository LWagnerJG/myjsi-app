// Dealer Directory specific data
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
    {
        id: 2,
        name: "Corporate Design Inc",
        address: "123 Main Street, Evansville, IN 47708",
        salespeople: [{ name: "Mike Wilson", email: "mike@corporatedesign.com", status: "active", roleLabel: "Sales" }],
        designers: [{ name: "Sarah Johnson", email: "sarah@corporatedesign.com", status: "active", roleLabel: "Designer" }],
        administration: [{ name: "Admin User", email: "admin@corporatedesign.com", status: "active", roleLabel: "Admin" }],
        installers: [],
        dailyDiscount: "22.34%",
        bookings: 380000,
        sales: 395000
    },
    {
        id: 3,
        name: "OfficeWorks",
        address: "456 Business Ave, Indianapolis, IN 46204",
        salespeople: [{ name: "Lisa Chen", email: "lisa@officeworks.com", status: "active", roleLabel: "Sales" }],
        designers: [],
        administration: [],
        installers: [{ name: "Tom Brown", email: "tom@officeworks.com", status: "active", roleLabel: "Installer" }],
        dailyDiscount: "19.50%",
        bookings: 490000,
        sales: 510000
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