import {
    MousePointer, BarChart2, Users, Package2, RefreshCw, PieChart, Armchair,
    Database, Briefcase, MessageSquare, Package, RotateCw, Search, Paperclip,
    DollarSign, UserPlus, MapPin, Percent, FileText, Calendar, Palette,
    Wrench, MonitorPlay, Share2, Hourglass, Settings, HelpCircle, Send
} from 'lucide-react';

export const lightTheme = {
    colors: {
        background: '#f8f8f8',
        surface: '#FFFFFF',
        primary: '#b3b3af',
        accent: '#AD8A77',
        secondary: '#414141',
        textPrimary: '#111111',
        textSecondary: '#555555',
        border: 'rgba(0,0,0,0.08)',
        shadow: 'rgba(0,0,0,0.10)',
        subtle: 'rgba(0,0,0,0.05)'
    },
    backdropFilter: 'blur(8px)'
};

export const darkTheme = {
    colors: {
        background: '#1E1E1E',
        surface: 'rgba(40,40,40,0.85)',
        primary: '#BBBBBB',
        accent: '#BBBBBB',
        secondary: '#999999',
        textPrimary: '#F5F5F5',
        textSecondary: '#CCCCCC',
        border: 'rgba(255,255,255,0.08)',
        shadow: 'rgba(0,0,0,0.25)',
        subtle: 'rgba(255,255,255,0.05)'
    },
    backdropFilter: 'blur(8px)'
};

export const logoLight = 'https://i.imgur.com/qskYhB0.png';

export const MENU_ITEMS = [{ id: 'orders', icon: MousePointer, label: 'Orders' }, { id: 'sales', icon: PieChart, label: 'Sales' }, { id: 'products', icon: Armchair, label: 'Products' }, { id: 'resources', icon: Database, label: 'Resources' }, { id: 'projects', icon: Briefcase, label: 'Projects' }, { id: 'community', icon: MessageSquare, label: 'Community' }, { id: 'samples', icon: Package, label: 'Samples' }, { id: 'replacements', icon: RotateCw, label: 'Replacements' },];

export const allApps = [
    { name: 'Samples', route: 'samples', icon: Package },
    { name: 'Request Replacement', route: 'replacements', icon: RotateCw },
    { name: 'Community', route: 'community', icon: MessageSquare },
    { name: 'Lead Times', route: 'lead-times', icon: Hourglass },
    { name: 'Products', route: 'products', icon: Armchair },
    { name: 'Orders', route: 'orders', icon: MousePointer },
    { name: 'Sales', route: 'sales', icon: PieChart },
    { name: 'Projects', route: 'projects', icon: Briefcase },
    { name: 'Resources', route: 'resources', icon: Database },
    { name: 'Dealer Directory', route: 'dealer-directory', icon: Users },
    { name: 'Commission Rates', route: 'commission-rates', icon: DollarSign },
    { name: 'Contracts', route: 'contracts', icon: FileText },
    { name: 'Loaner Pool', route: 'loaner-pool', icon: Package },
    { name: 'Discontinued Finishes', route: 'discontinued-finishes', icon: Palette },
    { name: 'Sample Discounts', route: 'sample-discounts', icon: Percent },
    { name: 'Social Media', route: 'social-media', icon: Share2 },
    { name: 'Customer Ranking', route: 'customer-rank', icon: BarChart2 },
    { name: 'Commissions', route: 'commissions', icon: DollarSign },
    { name: 'Members', route: 'members', icon: Users },
    { name: 'Settings', route: 'settings', icon: Settings },
    { name: 'Help', route: 'help', icon: HelpCircle },
    { name: 'Feedback', route: 'feedback', icon: Send },
    { name: 'Design Days', route: 'design-days', icon: Calendar },
];

export const RESOURCES_DATA = [
    {
        category: "Product & Finish Resources",
        items: [
            { label: "Lead Times", nav: "lead-times" },
            { label: "Search Fabrics", nav: "search-fabrics" },
            { label: "Request COM Yardage", nav: "request-com-yardage" },
            { label: "Discontinued Finishes Database", nav: "discontinued-finishes" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Sales & Rep Tools",
        items: [
            { label: "Dealer Directory", nav: "dealer-directory" },
            { label: "Commission Rates", nav: "commission-rates" },
            { label: "Sample Discounts", nav: "sample-discounts" },
            { label: "Contracts", nav: "contracts" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Dealer & Field Support",
        items: [
            { label: "Loaner Pool", nav: "loaner-pool" },
            { label: "New Dealer Sign-Up", nav: "new-dealer-signup" },
            { label: "Request Field Visit", nav: "request-field-visit" },
            { label: "Install Instructions", nav: "install-instructions" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Marketing & Communication",
        items: [
            { label: "Presentations", nav: "presentations" },
            { label: "Social Media", nav: "social-media" },
            { label: "Design Days", nav: "design-days" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    }
];

export const SOCIAL_MEDIA_POSTS = [{ id: 1, type: 'image', url: 'https://placehold.co/400x500/E3DBC8/2A2A2A?text=JSI+Seating', caption: 'Comfort meets design. ✨ Discover the new Arwyn series, perfect for any modern workspace. #JSIFurniture #OfficeDesign #ModernWorkplace' }, { id: 2, type: 'image', url: 'https://placehold.co/400x500/D9CDBA/2A2A2?text=Vision+Casegoods', caption: 'Functionality at its finest. The Vision casegoods line offers endless configuration possibilities. #Casegoods #OfficeInspo #JSI' }, { id: 3, type: 'video', url: 'https://placehold.co/400x500/A9886C/FFFFFF?text=Lounge+Tour+(Video)', caption: 'Take a closer look at the luxurious details of our Caav lounge collection. #LoungeSeating #ContractFurniture #HospitalityDesign' }, { id: 4, type: 'image', url: 'https://placehold.co/400x500/966642/FFFFFF?text=Forge+Tables', caption: 'Gather around. The Forge table series brings a rustic yet refined look to collaborative spaces. #MeetingTable #Collaboration #JSI' },];

export const INITIAL_POSTS = [
    {
        id: 1,
        type: 'post', // Added type property
        user: { name: 'Natalie Parker', avatar: 'https://i.pravatar.cc/150?u=natalie' },
        timeAgo: '2h',
        text: 'Great install in Chicago! The Vision series looks amazing in the new corporate headquarters.',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg',
        likes: 12,
        comments: [{ id: 1, name: 'John Doe', text: 'Looks fantastic!' }],
    },
];

export const INITIAL_WINS = [
    {
        id: 2, // Changed id to be unique
        type: 'win', // Added type property
        user: { name: 'Laura Chen', avatar: 'https://i.pravatar.cc/150?u=laura' },
        timeAgo: 'yesterday',
        title: 'Boston HQ install – success! 🎉',
        images: [
            'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg',
            'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg',
        ],
    },
];

export const INITIAL_POLLS = [
    {
        id: 3,
        user: { name: 'Doug Shapiro', avatar: null }, // Avatar removed to show generic icon
        timeAgo: '1d',
        question: 'Which Vision base finish do you spec the most?',
        options: [
            { id: 'carbon', text: 'Truss', votes: 8 },
            { id: 'oak', text: 'Torii', votes: 5 },
            { id: 'white', text: 'Executive', votes: 12 },
        ],
    },
];

export const PERMISSION_LABELS = {
    salesData: "Sales Data",
    customerRanking: "Customer Ranking",
    projects: "Projects",
    commissions: "Commissions",
    dealerRewards: "Dealer Rewards",
    submittingReplacements: "Submitting Replacements"
};

export const USER_TITLES = ["Sales", "Designer", "Sales/Designer", "Admin Support"];

export const EMPTY_USER = { firstName: '', lastName: '', email: '', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: false, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } };

export const INITIAL_MEMBERS = [
    { id: 1, name: 'Alice Johnson', role: 'Sales', email: 'alice@company.com', phone: '555-1234' },
    { id: 2, name: 'Bob Smith', role: 'Designer', email: 'bob@company.com', phone: '555-5678' },
    { id: 3, name: 'Carol Lee', role: 'Admin', email: 'carol@company.com', phone: '555-8765' },
    { id: 4, name: 'David Kim', role: 'Sales', email: 'david@company.com', phone: '555-4321' },
    { id: 5, name: 'Eva Green', role: 'Installer', email: 'eva@company.com', phone: '555-2468' },
];

export const SAMPLE_PRODUCTS = [
    { id: '1001', name: 'JSI Laminate Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#E6E6E6', categoryId: 'finishes' },
    { id: '1002', name: 'JSI Veneer Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#D3B8A3', categoryId: 'finishes' },
    { id: '1003', name: 'JSI Paint Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#A9A9A9', categoryId: 'finishes' },
    { id: '1004', name: 'JSI Seating Fabric', image: 'https://i.imgur.com/8nL6YQf.png', color: '#C7AD8E', categoryId: 'textiles' },
    { id: '1005', name: 'JSI Panel Fabric', image: 'https://i.imgur.com/8nL6YQf.png', color: '#AD8A77', categoryId: 'textiles' },
    { id: '1006', name: 'JSI Leather', image: 'https://i.imgur.com/8nL6YQf.png', color: '#594A41', categoryId: 'textiles' },
    { id: '2001', name: 'Vision Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#B3B3B3', categoryId: 'hardware' },
    { id: '2002', name: 'Forge Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#414141', categoryId: 'hardware' },
    { id: '2003', name: 'Brogan Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#707070', categoryId: 'hardware' },
];

export const SAMPLE_CATEGORIES = [
    { id: 'finishes', name: 'Finishes' },
    { id: 'textiles', name: 'Textiles' },
    { id: 'hardware', name: 'Hardware' },
];

export const SAMPLES_DATA = SAMPLE_PRODUCTS;

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

export const REPLACEMENT_REQUESTS_DATA = [
    { id: 'req1', product: 'Vision Conference Table', reason: 'Damaged in shipping', status: 'Approved', date: '2023-05-20' },
    { id: 'req2', product: 'Arwyn Swivel Chair', reason: 'Missing parts', status: 'Pending', date: '2023-05-22' },
    { id: 'req3', product: 'Moto Casegood', reason: 'Wrong finish', status: 'Rejected', date: '2023-05-18' },
].sort((a, b) => new Date(b.date) - new Date(a.date));

// Temporary - until fully migrated to products feature folder
export const PRODUCTS_CATEGORIES_DATA = [
    {
        name: 'Casegoods',
        description: 'Storage and workspace solutions',
        nav: 'products/casegoods',
        images: ['/series-images/jsi_vision_config_000002.jpg', '/series-images/jsi_brogan_config_00001.jpg']
    },
    {
        name: 'Conference Tables',
        description: 'Meeting and collaboration tables',
        nav: 'products/conference-tables',
        images: ['/series-images/jsi_vision_config_000002.jpg', '/series-images/jsi_reef_config_00001.jpg']
    },
    {
        name: 'Guest',
        description: 'Visitor and side seating',
        nav: 'products/guest',
        images: ['/series-images/jsi_addison_comp_00015.jpg', '/series-images/jsi_americana_comp_00026.jpg']
    },
    {
        name: 'Lounge',
        description: 'Casual and soft seating',
        nav: 'products/lounge',
        images: ['/series-images/jsi_arwyn_comp_0001.jpg', '/series-images/jsi_caav_comp_0005.jpg']
    },
    {
        name: 'Swivels',
        description: 'Task and office chairs',
        nav: 'products/swivels',
        images: ['/series-images/jsi_arwyn_comp_0001.jpg']
    },
    {
        name: 'Training Tables',
        description: 'Flexible training furniture',
        nav: 'products/training-tables',
        images: ['/series-images/jsi_moto_config_00001.jpg', '/series-images/jsi_connect_comp_00001.jpg']
    },
    {
        name: 'Benches',
        description: 'Multi-seat solutions',
        nav: 'products/benches',
        images: ['/series-images/jsi_native_comp_00001.jpg', '/series-images/jsi_poet_comp_00001.jpg']
    }
];