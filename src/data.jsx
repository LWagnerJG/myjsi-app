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
        primary: '#003366',
        accent: '#AD8A77', // Changed to the new color
        secondary: '#414141',
        textPrimary: '#111111',
        textSecondary: '#555555',
        border: 'rgba(0,0,0,0.08)',
        shadow: 'rgba(0,0,0,0.10)'
    },
    backdropFilter: 'blur(12px)'
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
        shadow: 'rgba(0,0,0,0.25)' 
    }, 
    backdropFilter: 'blur(12px)' 
};

// ... (the rest of your data.jsx file remains the same)

export const logoLight = 'https://i.imgur.com/qskYhB0.png';

export const MENU_ITEMS = [{ id: 'orders', icon: MousePointer, label: 'Orders' }, { id: 'sales', icon: PieChart, label: 'Sales' }, { id: 'products', icon: Armchair, label: 'Products' }, { id: 'resources', icon: Database, label: 'Resources' }, { id: 'projects', icon: Briefcase, label: 'Projects' }, { id: 'community', icon: MessageSquare, label: 'Community' }, { id: 'samples', icon: Package, label: 'Samples' }, { id: 'replacements', icon: RotateCw, label: 'Replacements' },];

export const MY_PROJECTS_DATA = [
    {
        id: 'proj1',
        name: 'Acme Corp HQ',
        location: 'Indianapolis, IN',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg'
    },
    {
        id: 'proj2',
        name: 'Tech Park Offices',
        location: 'Fishers, IN',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg'
    },
    {
        id: 'proj3',
        name: 'Community Hospital',
        location: 'Carmel, IN',
        image: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg'
    },
    {
        id: 'proj4',
        name: 'Downtown Library',
        location: 'Indianapolis, IN',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_coldjet_install_00001.jpg'
    },
];
export const LEAD_TIMES_DATA = [
    { series: 'Addison', type: 'Wood Seating', weeks: 4 },
    { series: 'Addison', type: 'Upholstery', weeks: 7 },
    { series: 'Americana', type: 'Wood Seating', weeks: 4 },
    { series: 'Americana', type: 'Upholstery', weeks: 7 },
    { series: 'Ansen', type: 'Seating', weeks: 7 },
    { series: 'Anthology', type: 'Casegoods', weeks: 8 },
    { series: 'Arwyn', type: 'Seating', weeks: 8 },
    { series: 'Arwyn', type: 'Tables', weeks: 4 },
    { series: 'Avini', type: 'Seating', weeks: 7 },
    { series: 'BeSPACE', type: 'Seating', weeks: 8 },
    { series: 'BeSPACE', type: 'Tables', weeks: 4 },
    { series: 'Boston', type: 'Wood Seating', weeks: 7 },
    { series: 'Boston', type: 'Upholstery', weeks: 7 },
    { series: 'Bourne', type: 'Seating', weeks: 5 },
    { series: 'Bourne', type: 'Tables', weeks: 8 },
    { series: 'Brogan', type: 'Casegoods', weeks: 8 },
    { series: 'Bryn', type: 'Seating', weeks: 6 },
    { series: 'Bryn', type: 'Upholstery', weeks: 6 },
    { series: 'Cäav', type: 'Seating', weeks: 8 },
    { series: 'Cäav', type: 'Tables', weeks: 8 },
    { series: 'Class Act', type: 'Wood Seating', weeks: 4 },
    { series: 'Class Act', type: 'Upholstery', weeks: 7 },
    { series: 'Connect', type: 'Seating', weeks: 6 },
    { series: 'Copilot', type: 'Casegoods', weeks: 6 },
    { series: 'Cosgrove', type: 'Seating', weeks: 5 },
    { series: 'Encore', type: 'Seating', weeks: 5 },
    { series: 'Finale', type: 'Casegoods', weeks: 8 },
    { series: 'Finn', type: 'Seating', weeks: 7 },
    { series: 'Finn Nu', type: 'Seating', weeks: 7 },
    { series: 'Flux', type: 'Laminate', weeks: 10 },
    { series: 'Flux', type: 'Veneer', weeks: 10 },
    { series: 'Forge', type: 'Casegoods', weeks: 8 },
    { series: 'Garvey RS', type: 'Seating', weeks: 7 },
    { series: 'Gatsby', type: 'Seating', weeks: 6 },
    { series: 'Harbor', type: 'Seating', weeks: 7 },
    { series: 'Henley', type: 'Seating', weeks: 7 },
    { series: 'Henley', type: 'Upholstery', weeks: 7 },
    { series: 'Hoopz', type: 'Upholstery', weeks: 7 },
    { series: 'Indie', type: 'Seating', weeks: 7 },
    { series: 'Indie', type: 'Tables', weeks: 4 },
    { series: 'Jude', type: 'Seating', weeks: 5 },
    { series: 'Jude', type: 'Upholstery', weeks: 5 },
    { series: 'Kindera', type: 'Seating', weeks: 8 },
    { series: 'Knox', type: 'Seating', weeks: 5 },
    { series: 'Knox', type: 'Upholstery', weeks: 5 },
    { series: 'Kyla', type: 'Seating', weeks: 5 },
    { series: 'Kyla', type: 'Upholstery', weeks: 5 },
    { series: 'Lincoln', type: 'Casegoods', weeks: 4 },
    { series: 'Lok', type: 'Casegoods', weeks: 5 },
    { series: 'Mackey', type: 'Seating', weeks: 5 },
    { series: 'Mackey', type: 'Upholstery', weeks: 5 },
    { series: 'Madison', type: 'Seating', weeks: 7 },
    { series: 'Mittle', type: 'Seating', weeks: 7 },
    { series: 'Moto', type: 'Seating', weeks: 5 },
    { series: 'Moto', type: 'Laminate', weeks: 8 },
    { series: 'Moto', type: 'Veneer', weeks: 8 },
    { series: 'Native Benches', type: 'Seating', weeks: 7 },
    { series: 'Native', type: 'Laminate', weeks: 8 },
    { series: 'Native', type: 'Veneer', weeks: 8 },
    { series: 'Newton', type: 'Seating', weeks: 7 },
    { series: 'Nosh', type: 'Casegoods', weeks: 5 },
    { series: 'Oxley', type: 'Seating', weeks: 7 },
    { series: 'Pillows', type: 'Seating', weeks: 4 },
    { series: 'Poet', type: 'Seating', weeks: 8 },
    { series: 'Poet', type: 'Tables', weeks: 8 },
    { series: 'Privacy', type: 'Casegoods', weeks: 4 }, // LO Style
    { series: 'Privacy', type: 'Casegoods', weeks: 4 }, // VS Style
    { series: 'Prost', type: 'Casegoods', weeks: 8 },
    { series: 'Protocol', type: 'Seating', weeks: 5 },
    { series: 'Proxy', type: 'Seating', weeks: 7 },
    { series: 'Ramona', type: 'Seating', weeks: 7 },
    { series: 'Reef', type: 'Laminate', weeks: 8 },
    { series: 'Reef', type: 'Veneer', weeks: 8 },
    { series: 'Ria', type: 'Seating', weeks: 7 },
    { series: 'Romy', type: 'Casegoods', weeks: 5 },
    { series: 'Satisse', type: 'Seating', weeks: 5 },
    { series: 'Somna', type: 'Seating', weeks: 8 },
    { series: 'Sosa', type: 'Seating', weeks: 6 },
    { series: 'Teekan', type: 'Seating', weeks: 8 },
    { series: 'Totem', type: 'Seating', weeks: 5 },
    { series: 'Trinity', type: 'Seating', weeks: 7 },
    { series: 'Vision', type: 'Laminate', weeks: 8 },
    { series: 'Vision', type: 'Veneer', weeks: 8 },
    { series: 'Walden', type: 'Casegoods', weeks: 8 },
    { series: 'Wellington', type: 'Casegoods', weeks: 8 },
    { series: 'Wink', type: 'Seating', weeks: 3 },
    { series: 'Ziva', type: 'Tables', weeks: 4 },
].sort((a, b) => a.series.localeCompare(b.series));
export const FABRICS_DATA = [{ name: 'Luxe Weave', manufacturer: 'Momentum' }, { name: 'Origin', manufacturer: 'Momentum' }, { name: 'Origin', manufacturer: 'Maharam' }, { name: 'Origin', manufacturer: 'Architex' }, { name: 'Climb', manufacturer: 'Maharam' }, { name: 'Rigid', manufacturer: 'Maharam' }, { name: 'Heritage Tweed', manufacturer: 'Traditions' }];
export const allApps = [
    { name: 'Samples', route: 'samples', icon: Package },
    { name: 'Request Replacement', route: 'replacements', icon: RotateCw },
    { name: 'Community', route: 'community', icon: MessageSquare },
    { name: 'Lead Times', route: 'resources/lead-times', icon: Hourglass },
    { name: 'Products', route: 'products', icon: Armchair },
    { name: 'Orders', route: 'orders', icon: MousePointer },
    { name: 'Sales', route: 'sales', icon: PieChart },
    { name: 'Projects', route: 'projects', icon: Briefcase },
    { name: 'Resources', route: 'resources', icon: Database },
    { name: 'Dealer Directory', route: 'resources/dealer_directory', icon: Users },
    { name: 'Commission Rates', route: 'resources/commission_rates', icon: DollarSign },
    { name: 'Contracts', route: 'resources/contracts', icon: FileText },
    { name: 'Loaner Pool', route: 'resources/loaner_pool', icon: Package },
    { name: 'Discontinued Finishes', route: 'resources/discontinued_finishes', icon: Palette },
    { name: 'Sample Discounts', route: 'resources/sample_discounts', icon: Percent },
    { name: 'Social Media', route: 'resources/social_media', icon: Share2 },
    { name: 'Customer Ranking', route: 'customer-rank', icon: BarChart2 },
    { name: 'Commissions', route: 'commissions', icon: DollarSign },
    { name: 'Members', route: 'members', icon: Users },
    { name: 'Settings', route: 'settings', icon: Settings },
    { name: 'Help', route: 'help', icon: HelpCircle },
    { name: 'Feedback', route: 'feedback', icon: Send },
];
export const RESOURCES_DATA = [
    {
        category: "Fabrics",
        items: [
            { label: "Search Database", nav: "fabrics/search_form" },
            { label: "Request COM Yardage", nav: "fabrics/com_request" }
        ]
    },
    {
        category: "Rep Functions",
        items: [
            { label: "Commission Rates", nav: "resources/commission_rates" },
            { label: "Loaner Pool", nav: "resources/loaner_pool" },
            { label: "New Dealer Sign-Up", nav: "resources/dealer_registration" },
            { label: "Request Field Visit", nav: "resources/request_field_visit" },
            { label: "Sample Discounts", nav: "resources/sample_discounts" },
            { label: "Dealer Directory", nav: "resources/dealer_directory" }
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Misc.",
        items: [
            { label: "Contracts", nav: "resources/contracts" },
            { label: "Design Days", nav: "resources/design_days" },
            { label: "Discontinued Finishes Database", nav: "resources/discontinued_finishes" },
            { label: "Install Instructions", nav: "resources/install_instructions" },
            { label: "Presentations", nav: "resources/presentations" },
            { label: "Social Media", nav: "resources/social_media" },
            // <-- fixed here:
            { label: "Lead Times", nav: "resources/lead-times" }
        ].sort((a, b) => a.label.localeCompare(b.label))
    }
];
export const SOCIAL_MEDIA_POSTS = [{ id: 1, type: 'image', url: 'https://placehold.co/400x500/E3DBC8/2A2A2A?text=JSI+Seating', caption: 'Comfort meets design. ✨ Discover the new Arwyn series, perfect for any modern workspace. #JSIFurniture #OfficeDesign #ModernWorkplace' }, { id: 2, type: 'image', url: 'https://placehold.co/400x500/D9CDBA/2A2A2A?text=Vision+Casegoods', caption: 'Functionality at its finest. The Vision casegoods line offers endless configuration possibilities. #Casegoods #OfficeInspo #JSI' }, { id: 3, type: 'video', url: 'https://placehold.co/400x500/A9886C/FFFFFF?text=Lounge+Tour+(Video)', caption: 'Take a closer look at the luxurious details of our Caav lounge collection. #LoungeSeating #ContractFurniture #HospitalityDesign' }, { id: 4, type: 'image', url: 'https://placehold.co/400x500/966642/FFFFFF?text=Forge+Tables', caption: 'Gather around. The Forge table series brings a rustic yet refined look to collaborative spaces. #MeetingTable #Collaboration #JSI' },];
export const LOANER_POOL_PRODUCTS = [
    {
        id: 'br2301',
        name: 'Bryn',
        model: 'BR2301',
        img: 'https://webresources.jsifurniture.com/production/uploads/jsi_bryn_feat_00018_kI9ljLG.jpg',
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
export const INITIAL_OPPORTUNITIES = [{ id: 1, name: 'New Office Furnishings', stage: 'Discovery', discount: '5%', value: '$50,000', company: 'ABC Corporation', contact: 'John Smith', poTimeframe: '30-60 days' }, { id: 2, name: 'Lobby Refresh', stage: 'Specifying', value: '$75,000', company: 'XYZ Industries', contact: 'Jane Doe', poTimeframe: '60-90 days' },];

export const STAGES = ['Discovery', 'Specifying', 'Decision/Bidding', 'PO Expected', 'Won', 'Lost'];

export const STAGE_COLORS = { 'Discovery': `bg-blue-200 text-blue-900`, 'Specifying': `bg-green-200 text-green-900`, 'Decision/Bidding': `bg-orange-200 text-orange-900`, 'PO Expected': `bg-purple-200 text-purple-900`, 'Won': `bg-emerald-200 text-emerald-900`, 'Lost': `bg-red-200 text-red-900`, };

export const EMPTY_LEAD = { project: '', designFirm: '', dealer: '', winProbability: '', projectStatus: '', vertical: '', otherVertical: '', estimatedList: '', poTimeframe: '', competitors: [], competitionPresent: false, isBid: false, jsiSpecServices: false, quoteType: 'New Quote', pastProjectRef: '', discount: 'Undecided', products: [], notes: '', jsiQuoteNumber: '', isContract: false, contractType: '' }; export const VERTICALS = ['Corporate', 'Education', 'Government', 'Healthcare', 'Hospitality', 'Other (Please specify)'];

export const URGENCY_LEVELS = ['Low', 'Medium', 'High'];

export const PO_TIMEFRAMES = ['Within 30 Days', '30-60 Days', '60-90 Days', '90+ Days', 'Early 2026', 'Late 2026', '2027 or beyond'];

export const COMPETITORS = ['None', 'Kimball', 'OFS', 'Indiana Furniture', 'National', 'Haworth', 'MillerKnoll', 'Steelcase', 'Versteel', 'Krug', 'Lazyboy', 'DarRan', 'Hightower', 'Allsteel'];

export const DISCOUNT_OPTIONS = ['Undecided', '50/20 (60.00%)', '50/20/1 (60.4%)', '50/20/2 (60.80%)', '50/20/4 (61.60%)', '50/20/2/3 (61.98%)', '50/20/5 (62.00%)', '50/20/3 (61.20%)', '50/20/6 (62.40%)', '50/25 (62.50%)', '50/20/5/2 (62.76%)', '50/20/7 (62.80%)', '50/20/8 (63.20%)', '50/10/10/10 (63.55%)', '50/20/9 (63.6%)', '50/20/10 (64.00%)', '50/20/8/3 (64.30%)', '50/20/10/3 (65.08%)', '50/20/10/5 (65.80%)', '50/20/15 (66.00%)'];

export const JSI_PRODUCT_SERIES = ['Arwyn', 'Bryn', 'Caav', 'Connect', 'Hoopz', 'Indie', 'Jude', 'Kindera', 'Lok', 'Poet', 'Teekan', 'Vision', 'Wink', 'Ziva'].sort();

export const VISION_MATERIALS = ['TFL', 'HPL', 'Veneer'];

export const WIN_PROBABILITY_OPTIONS = ['20%', '40%', '60%', '80%', '100%'];

export const INITIAL_DESIGN_FIRMS = ['N/A', 'Undecided', 'McGee Designhouse', 'Ratio', 'CSO', 'IDO', 'Studio M'];

export const INITIAL_DEALERS = ['Undecided', 'Business Furniture', 'COE', 'OfficeWorks', 'RJE'];

export const JSI_LAMINATES = ['Nevada Slate', 'Urban Concrete', 'Smoked Hickory', 'Arctic Oak', 'Tuscan Marble', 'Brushed Steel', 'Midnight Linen', 'Riverstone Gray', 'Golden Teak', 'Sahara Sand'];
export const JSI_VENEERS = ['Rift Cut Oak', 'Smoked Walnut', 'Figured Anigre', 'Reconstituted Ebony', 'Fumed Eucalyptus', 'Birdseye Maple', 'Cherry Burl', 'Sapele Pommele', 'Zebrawood', 'Koa'];

export const YTD_SALES_DATA = [{ label: 'Total Sales', current: 3666132, previous: 2900104, goal: 7000000 }, { label: 'Education', current: 1250000, previous: 1045589, goal: 2500000 }, { label: 'Health', current: 980000, previous: 850000, goal: 2000000 },];

export const MONTHLY_SALES_DATA = [{ month: 'Jan', bookings: 1259493, sales: 506304 }, { month: 'Feb', bookings: 497537, sales: 553922 }, { month: 'Mar', bookings: 397684, sales: 365601 }, { month: 'Apr', bookings: 554318, sales: 696628 }, { month: 'May', bookings: 840255, sales: 1340018 }, { month: 'Jun', bookings: 116846, sales: 36823 },];

export const SALES_VERTICALS_DATA = [{ label: 'Healthcare', value: 2900104, color: '#B99962' }, { label: 'Higher Ed', value: 1045589, color: '#7A7A7A' }, { label: 'K12', value: 1045589, color: '#A0A0A0' }, { label: 'Corporate', value: 1045589, color: '#2A2A2A' }, { label: 'Government', value: 1045589, color: '#CCCCCC' },];

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

export const CUSTOMER_RANK_DATA = [
    { id: 1, name: 'Business Furniture LLC', bookings: 450000, sales: 435000, orders: [{ projectName: 'Lawrence Township LECC', amount: 43034 }, { projectName: 'Monreau Seminary', amount: 137262 }] },
    { id: 2, name: 'Corporate Design Inc', bookings: 380000, sales: 395000, orders: [{ projectName: 'OneMain Financial HQ', amount: 1250 }, { projectName: 'OneMain Financial Branch', amount: 643 }] },
    { id: 3, name: 'OfficeWorks', bookings: 490000, sales: 510000, orders: [{ projectName: 'Main Office Remodel', amount: 510000 }] },
    { id: 4, name: 'LOTH Inc.', bookings: 310000, sales: 320000, orders: [] },
    { id: 5, name: 'One Eleven Design', bookings: 280000, sales: 275000, orders: [{ projectName: 'Centlivre, LLC', amount: 3415 }] },
    { id: 6, name: 'RJE Business Interiors', bookings: 650000, sales: 470000, orders: [] },
    { id: 7, name: 'Sharp School Services', bookings: 185000, sales: 190000, orders: [] },
    { id: 8, name: 'Braden Business Systems', bookings: 205000, sales: 210000, orders: [] },
    { id: 9, 'name': 'Schroeder\'s', bookings: 150000, sales: 140000, orders: [] },
    { id: 10, 'name': 'CVC', bookings: 230000, sales: 220000, orders: [] }
];

export const ORDER_DATA = [
    { date: '2025-07-04T14:30:00Z', amount: '$169,946.99', company: 'OFFICEWORKS INC.', details: 'University of Notre Dame', orderNumber: '454108-01', po: 'S65557-3', net: 169946.99, reward: 'DEBRA BUTLER (1%)', shipDate: '2025-07-04T12:00:00Z', status: 'Delivered', shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628', discount: '61.20%', packQty: 0, lineItems: [] },
    { date: '2025-06-11T16:45:00Z', amount: '$44,818.00', company: 'BUSINESS FURNISHINGS LLC', details: 'University of Notre Dame', orderNumber: '449956-00', po: 'S65557-3', net: 33811.20, reward: 'DEBRA BUTLER (1%)', shipDate: '2025-07-04T12:00:00Z', status: 'Delivered', shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628', discount: '61.20%', packQty: 0, lineItems: [] },

    { date: '2025-06-12T14:30:00Z', amount: '$43,034.00', company: 'BUSINESS FURNITURE LLC', details: 'MSD of Lawrence Township - LECC', orderNumber: '444353-00', po: 'S65473-7', net: 31250.00, reward: 'Jennifer Franklin (1%)', shipDate: '2025-08-25T12:00:00Z', status: 'In Production', shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628', discount: '61.20%', packQty: 8, lineItems: [{ line: '001', name: 'CROSSOVER SWIVEL CONFERENCE', model: 'AW6007C', quantity: 8, net: 902.10, extNet: 7216.80, options: 'None', specs: [{ label: 'MIDBACK-SWIVELBASE', value: 'ARWYNSERIES-MODELAW6007C' }] }] },
    { date: '2025-06-12T10:15:00Z', amount: '$1,250.50', company: 'CORPORATE DESIGN INC', details: 'ONEMAIN FINANCIAL', orderNumber: '442365-00', po: 'S65473-8', net: 950.00, reward: 'John Doe (1.5%)', shipDate: '2025-08-28T12:00:00Z', status: 'Shipping', shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708', discount: '24.03%', packQty: 0, lineItems: [{ line: '001', name: 'SIDE TABLE', model: 'SIDETBL-SM', quantity: 2, net: 475.00, extNet: 950.00, options: 'None', specs: [] }] },
    { date: '2025-06-11T16:45:00Z', amount: '$643.80', company: 'CORPORATE DESIGN INC', details: 'ONE MAIN FINANCIAL', orderNumber: '449518-00', po: 'S65473-9', net: 500.00, reward: 'Jennifer Franklin (1%)', shipDate: '2025-09-02T12:00:00Z', status: 'Acknowledged', packQty: 1, shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708', discount: '22.34%', lineItems: [] },
    { date: '2025-06-11T09:00:00Z', amount: '$3,415.20', company: 'ONE ELEVEN DESIGN', details: 'CENTLIVRE, LLC', orderNumber: '449645-00', po: 'S65474-1', net: 2800.00, reward: 'Jane Smith (1%)', shipDate: '2025-09-05T12:00:00Z', status: 'Order Entry', packQty: 0, shipTo: 'ONE ELEVEN DESIGN\n456 OAK AVENUE\nFORT WAYNE, IN 46802', discount: '18.01%', lineItems: [] },
    { date: '2025-06-10T11:20:00Z', amount: '$137,262.94', company: 'BUSINESS FURNISHINGS', details: 'MONREAU SEMINARY', orderNumber: '450080-00', po: 'S65474-2', net: 112000.00, reward: 'Jennifer Franklin (1%)', shipDate: '2025-09-15T12:00:00Z', status: 'In Production', packQty: 25, shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628', discount: '18.40%', lineItems: [] },
    { date: '', amount: '', company: 'SHARP SCHOOL SERVICES INC', details: 'MARSHALL COMMUNITY BUILDING', orderNumber: '442137', po: 'S65479-1', status: 'Entered', shipDate: '2025-07-20T12:00:00Z' },
];

export const SAMPLE_CATEGORIES = [{ id: 'tfl', name: 'TFL' }, { id: 'hpl', name: 'HPL' }, { id: 'veneer', name: 'Veneer' }, { id: 'solid-wood', name: 'Solid Wood' }, { id: 'paint', name: 'Paint' }, { id: 'metal', name: 'Metal' }, { id: 'solid-surface', name: 'Solid Surface' }, { id: 'glass', name: 'Glass' }, { id: 'plastic', name: 'Plastic' }, { id: 'poly', name: 'Poly' }, { id: 'specialty', name: 'Specialty' },];

export const SAMPLE_PRODUCTS = [{ id: 1, name: 'Belair', category: 'veneer', color: '#E3DBC8' }, { id: 2, name: 'Egret', category: 'veneer', color: '#D9CDBA' }, { id: 3, name: 'Clay', category: 'veneer', color: '#A9886C' }, { id: 4, name: 'Outback', category: 'veneer', color: '#966642' }, { id: 5, name: 'Forged', category: 'metal', color: '#5A5A5A' }, { id: 6, name: 'Carbon', category: 'metal', color: '#3E3E3E' }, { id: 7, name: 'Cotton', category: 'fabric', color: '#F0F0F0' }, { id: 8, name: 'Linen', category: 'fabric', color: '#EAE0D3' },];

export const JSI_MODELS = [{ id: 'VST2430SC', name: 'Storage Cabinet', series: 'Vision', isUpholstered: false }, { id: 'BRY2001', name: 'Desk Chair', series: 'Bryn', isUpholstered: true }, { id: 'TBCONF8', name: 'Conference Table', series: 'Tablet', isUpholstered: false }, { id: 'SIDETBL-SM', name: 'Side Table', series: 'Americana', isUpholstered: false }, { id: 'LNGCHR-OTT', name: 'Lounge Chair', series: 'Caav', isUpholstered: true },];

const generateCommissionData = () => {
    const data = {};
    const currentYear = new Date().getFullYear();
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    for (let year = currentYear; year >= currentYear - 2; year--) {
        data[year] = [];
        for (let i = 0; i < 12; i++) {
            if (year === currentYear && i > new Date().getMonth()) {
                continue;
            }
            const amount = Math.floor(Math.random() * (50000 - 30000 + 1)) + 30000;
            const issuedDate = `${year}-${String(i + 1).padStart(2, '0')}-22`;
            data[year].push({ month: months[i], fullMonth: new Date(issuedDate).toLocaleString('default', { month: 'long' }), amount, issuedDate });
        }
    }
    return data;
};

export const COMMISSIONS_CHECKS_DATA = generateCommissionData();

export const STATUS_COLORS = {
    'Entered': '#A0AEC0',        // Slate Gray
    'Order Entry': '#716A66',    // Strong Blue
    'Acknowledged': '#B6B5AA',   // Medium Slate Blue
    'In Production': '#C7AD8E',  // Gold/Orange
    'Shipping': '#878F95',       // Teal
    'Delivered': '#689a5e',      // Success Green
};
export const COMMISSION_RATES_TABLE_DATA = { standard: [{ discount: '5/10', rep: '12%', spiff: '3%' }, { discount: '50/10/5', rep: '11%', spiff: '3%' }, { discount: '50/20', rep: '10%', spiff: '3%' }, { discount: '50/20/1', rep: '9%', spiff: '3%' }, { discount: '50/20/2', rep: '9%', spiff: '3%' }, { discount: '50/20/3', rep: '8%', spiff: '3%' }, { discount: '50/20/4', rep: '8%', spiff: '3%' }, { discount: '50/20/5', rep: '7%', spiff: '3%' }, { discount: '50/20/6', rep: '7%', spiff: '3%' }, { discount: '50/20/7', rep: '6%', spiff: '3%' }, { discount: '50/20/8', rep: '6%', spiff: '3%' }, { discount: '50/20/9', rep: '6%', spiff: '3%' }, { discount: '50/20/10', rep: '5%', spiff: { value: '3%', note: '*if > $100k net' } },], contract: [{ discount: 'GSA', rep: '5%', spiff: '3%' }, { discount: 'Omnia', rep: '3.8-3.9%', spiff: '2.5%' }, { discount: 'Premier', rep: '4.1-4.3%', spiff: '2%' }, { discount: 'TIPS', rep: '3.6-3.8%', spiff: 'N/A' },], split: [{ territory: 'Specifying', percentage: 70 }, { territory: 'Ordering', percentage: 30 },] };

export const CONTRACTS_DATA = { omnia: { name: "Omnia", tiers: [{ off: "54% off (Dock Delivery)", dealer: "15% dealer commission", rep: "3.91% rep commission" }, { off: "53% off (Dock Delivery)", dealer: "17% dealer commission", rep: "3.83% rep commission" }, { off: "52% off (Dock Delivery)", dealer: "18% dealer commission", rep: "3.75% rep commission" },], margin: ["54/15 = 60.90%", "53/17 = 60.99%", "52/18 = 60.64%"], url: "https://webresources.jsifurniture.com/production/uploads/j_contracts_tcpn.pdf" }, tips: { name: "TIPS", tiers: [{ off: "51% off (Delivery and Installed)", dealer: "24% dealer commission", rep: "3.67% rep commission" }, { off: "53% off (Dock Delivery)", dealer: "20% dealer commission", rep: "3.83% rep commission" },], note: "Spiff is not allowed.", url: "https://webresources.jsifurniture.com/production/uploads/jsi_contracts_tips_taps.pdf" }, premier: { name: "Premier", tiers: [{ off: "56% off (up to $500k)", dealer: "14% dealer commission", rep: "4.09% rep commission" }, { off: "57% off ($500k-750k)", dealer: "13% dealer commission", rep: "4.19% rep commission" }, { off: "58% off ($750k+)", dealer: "12% dealer commission", rep: "4.29% rep commission" },], url: "https://webresources.jsifurniture.com/production/uploads/jsi_contracts_premier.pdf" } };

export const CONTRACT_OPTIONS = [
    "GSA",
    "GSA (MJP)",
    "Omnia Partners",
    "Premier Healthcare Alliance L.P.",
    "TIPS",
    "GSA TEAM"
];

export const DAILY_DISCOUNT_OPTIONS = ["50 (50)", "50/5 (52.5)", "50/8 (54)", "50/10 (55)", "50/10/5 (57.25)"];

export const DEALER_DIRECTORY_DATA = [{ id: 1, name: 'Business Furniture LLC', address: '4102 Meghan Beeler Court, South Bend, IN 46628', bookings: 450000, sales: 435000, salespeople: [{ name: 'Alan Bird', status: 'active' }, { name: 'Deb Butler', status: 'active' }], designers: [{ name: 'Jen Franklin', status: 'active' }], administration: [{ name: 'Luke Miller', status: 'active' }], installers: [{ name: 'Installer A', status: 'active' }], recentOrders: [{ id: '444353-00', amount: 43034, shippedDate: '2025-05-12' }, { id: '450080-00', amount: 137262, shippedDate: '2025-06-02' }], dailyDiscount: '50/20 (60.00%)' }, { id: 2, name: 'Corporate Design Inc', address: '123 Main Street, Evansville, IN 47708', bookings: 380000, sales: 395000, salespeople: [{ name: 'Jason Beehler', status: 'active' }], designers: [], administration: [], installers: [{ name: 'Installer B', status: 'active' }, { name: 'Installer C', status: 'active' }], recentOrders: [{ id: '442365-00', amount: 1250, shippedDate: '2025-05-18' }, { id: '449518-00', amount: 643, shippedDate: '2025-06-10' }], dailyDiscount: '50/20 (60.00%)' }, { id: 3, name: 'OfficeWorks', address: '5678 Commerce Blvd, Indianapolis, IN 46250', bookings: 510000, sales: 490000, salespeople: [{ name: 'Andrea Kirkland', status: 'active' }], designers: [{ name: 'Jessica Williams', status: 'active' }], administration: [{ name: 'Sarah Chen', status: 'active' }], installers: [{ name: 'Installer D', status: 'active' }], recentOrders: [{ id: '449645-00', amount: 510000, shippedDate: '2025-06-15' }], dailyDiscount: '50/20 (60.00%)' }, { id: 4, name: 'LOTH Inc.', address: '9876 Design Drive, Cincinnati, OH 45242', bookings: 320000, sales: 310000, salespeople: [{ name: 'Michael Jones', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' }, { id: 5, name: 'One Eleven Design', address: '456 Oak Avenue, Fort Wayne, IN 46802', bookings: 280000, sales: 275000, salespeople: [{ name: 'David Brown', status: 'active' }], designers: [{ name: 'Sarah Chen', status: 'active' }], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' }, { id: 6, name: 'RJE Business Interiors', address: '1234 Project Place, Indianapolis, IN 46202', bookings: 470000, sales: 465000, salespeople: [{ name: 'Alan Bird', status: 'active' }], designers: [], administration: [], installers: [{ name: 'Installer E', status: 'active' }], dailyDiscount: '50/20 (60.00%)' }, { id: 7, name: 'Sharp School Services', address: '555 Education Rd, Elkhart, IN 46514', bookings: 190000, sales: 185000, salespeople: [{ name: 'Deb Butler', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' }, { id: 8, name: 'Braden Business Systems', address: '777 Systems Way, Fishers, IN 46037', bookings: 210000, sales: 205000, salespeople: [{ name: 'Jason Beehler', status: 'active' }], designers: [{ name: 'Jen Franklin', status: 'active' }], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' }, { id: 9, 'name': 'Schroeder\'s', address: '888 Office Park, Fort Wayne, IN 46805', bookings: 150000, sales: 140000, salespeople: [{ name: 'Andrea Kirkland', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' }, { id: 10, 'name': 'CVC', address: '999 Corporate Dr, Evansville, IN 47715', bookings: 230000, sales: 220000, salespeople: [{ name: 'Michael Jones', status: 'active' }], designers: [], administration: [{ name: 'Luke Miller', status: 'active' }], installers: [], dailyDiscount: '50/20 (60.00%)' }, { id: 11, 'name': 'Indy Office Solutions', address: '101 Solution St, Indianapolis, IN 46204', bookings: 600000, sales: 580000, salespeople: [{ name: 'David Brown', status: 'active' }], designers: [{ name: 'Sarah Chen', status: 'active' }], administration: [], installers: [{ name: 'Installer A', status: 'active' }, { name: 'Installer D', status: 'active' }], dailyDiscount: '50/20 (60.00%)' }, { id: 12, 'name': 'Fort Wayne Furnishings', address: '202 Supply Ave, Fort Wayne, IN 46808', bookings: 120000, sales: 115000, salespeople: [{ name: 'Alan Bird', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' }, { id: 13, 'name': 'South Bend Interiors', address: '303 Design Plaza, South Bend, IN 46601', bookings: 330000, sales: 325000, salespeople: [{ name: 'Deb Butler', status: 'active' }], designers: [{ name: 'Jen Franklin', status: 'active' }], administration: [], installers: [{ name: 'Installer B', status: 'active' }], dailyDiscount: '50/20 (60.00%)' }, { id: 14, 'name': 'Hoosier Desks', address: '404 State Rd, Bloomington, IN 47401', bookings: 95000, sales: 90000, salespeople: [{ name: 'Jason Beehler', status: 'active' }], designers: [], administration: [], installers: [], dailyDiscount: '50/20 (60.00%)' }, { id: 15, 'name': 'Circle City Commercial', address: '505 Monument Circle, Indianapolis, IN 46204', bookings: 750000, sales: 720000, salespeople: [{ name: 'Andrea Kirkland', status: 'active' }, { name: 'Michael Jones', status: 'active' }], designers: [{ name: 'Jessica Williams', status: 'active' }], administration: [{ name: 'Sarah Chen', status: 'active' }], installers: [{ name: 'Installer C', status: 'active' }, { name: 'Installer E', status: 'active' }], dailyDiscount: '50/20 (60.00%)' }];

export const DISCONTINUED_FINISHES = [{ category: "Maple", oldName: "ALE MEDIUM", veneer: "#3610", solid: "#3610", oldColor: "#d3b48c", newName: "PILSNER", newColor: "#e6d3b1" }, { category: "Maple", oldName: "BUTTERSCOTCH", veneer: "#3381", solid: "#3381", oldColor: "#a96e41", newName: "OUTBACK", newColor: "#966642" }, { category: "Maple", oldName: "VENETIAN", veneer: "#3593", solid: "#3593", oldColor: "#5e3a2f", newName: "BRICKDUST", newColor: "#744334" }, { category: "Cherry", oldName: "BOURBON MEDIUM", veneer: "#3581", solid: "#3683", oldColor: "#744334", newName: "OUTBACK", newColor: "#966642" }, { category: "Cherry", oldName: "BRIGHTON MEDIUM", veneer: "#3611", solid: "#3684", oldColor: "#5e3a2f", newName: "BRICKDUST", newColor: "#744334" }, { category: "Oak", oldName: "GOLDEN OAK", veneer: "#3321", solid: "#3321", oldColor: "#c68e41", newName: "DUNE", newColor: "#d1b38b" }, { category: "Oak", oldName: "TRADITIONAL OAK", veneer: "#3351", solid: "#3351", oldColor: "#a46e3a", newName: "FAWN", newColor: "#c8a57a" }, { category: "Walnut", oldName: "NATURAL WALNUT", veneer: "#3401", solid: "#3401", oldColor: "#6b4a39", newName: "NATURAL", newColor: "#6f4f3a" }, { category: "Laminate", oldName: "KENSINGTON MAPLE", veneer: "N/A", solid: "N/A", oldColor: "#d8b48b", newName: "HARD ROCK MAPLE", newColor: "#dcb992" }, { category: "Laminate", oldName: "WINDSOR CHERRY", veneer: "N/A", solid: "N/A", oldColor: "#8b4b3b", newName: "WILD CHERRY", newColor: "#8f5245" },];

export const PRODUCT_DATA = {
    'bar-stools': {
        title: 'Bar Stools',
        data: [
            { id: 'poet-bar', name: 'Poet', image: 'https://via.placeholder.com/300?text=Poet', basePrice: { list: 780 } },
            { id: 'knox-bar', name: 'Knox', image: 'https://via.placeholder.com/300?text=Knox', basePrice: { list: 850 } },
            { id: 'indie-bar', name: 'Indie', image: 'https://via.placeholder.com/300?text=Indie', basePrice: { list: 920 } },
            { id: 'jude-bar', name: 'Jude', image: 'https://via.placeholder.com/300?text=Jude', basePrice: { list: 1050 } },
        ],
    },

    'counter-stools': {
        title: 'Counter Stools',
        data: [
            { id: 'poet-counter', name: 'Poet', image: 'https://via.placeholder.com/300?text=Poet', basePrice: { list: 750 } },
            { id: 'knox-counter', name: 'Knox', image: 'https://via.placeholder.com/300?text=Knox', basePrice: { list: 820 } },
            { id: 'indie-counter', name: 'Indie', image: 'https://via.placeholder.com/300?text=Indie', basePrice: { list: 890 } },
            { id: 'jude-counter', name: 'Jude', image: 'https://via.placeholder.com/300?text=Jude', basePrice: { list: 1020 } },
        ],
    },

    swivels: {
        title: 'Swivel Chairs',
        data: [
            { id: 'cosgrove', name: 'Cosgrove', image: 'https://via.placeholder.com/300?text=Cosgrove', basePrice: { list: 1187 } },
            { id: 'arwyn', name: 'Arwyn', image: 'https://via.placeholder.com/300?text=Arwyn', basePrice: { list: 1395 } },
            { id: 'newton', name: 'Newton', image: 'https://via.placeholder.com/300?text=Newton', basePrice: { list: 1520 } },
            { id: 'proxy', name: 'Proxy', image: 'https://via.placeholder.com/300?text=Proxy', basePrice: { list: 1675 } },
        ],
    },

    'guest-chairs': {
        title: 'Guest Chairs',
        data: [
            { id: 'indie-guest', name: 'Indie', image: 'https://via.placeholder.com/300?text=Indie', basePrice: { list: 850 } },
            { id: 'jude-guest', name: 'Jude', image: 'https://via.placeholder.com/300?text=Jude', basePrice: { list: 980 } },
            { id: 'arwyn-guest', name: 'Arwyn', image: 'https://via.placeholder.com/300?text=Arwyn', basePrice: { list: 1100 } },
            { id: 'wink-guest', name: 'Wink', image: 'https://via.placeholder.com/300?text=Wink', basePrice: { list: 1200 } },
        ],
    },

    lounge: {
        title: 'Lounge',
        data: [
            { id: 'caav', name: 'Caav', image: 'https://via.placeholder.com/300?text=Caav', basePrice: { list: 2100 } },
            { id: 'kindera', name: 'Kindera', image: 'https://via.placeholder.com/300?text=Kindera', basePrice: { list: 2400 } },
            { id: 'somna', name: 'Somna', image: 'https://via.placeholder.com/300?text=Somna', basePrice: { list: 2900 } },
            { id: 'satisse', name: 'Satisse', image: 'https://via.placeholder.com/300?text=Satisse', basePrice: { list: 3200 } },
        ],
    },

    'coffee-tables': {
        title: 'Coffee Tables',
        data: [
            { id: 'poet-coffee', name: 'Poet', image: 'https://via.placeholder.com/300?text=Poet', basePrice: { list: 950 } },
            { id: 'teekan-coffee', name: 'Teekan', image: 'https://via.placeholder.com/300?text=Teekan', basePrice: { list: 1400 } },
            { id: 'connect-coffee', name: 'Connect', image: 'https://via.placeholder.com/300?text=Connect', basePrice: { list: 1550 } },
            { id: 'ziva-coffee', name: 'Ziva', image: 'https://via.placeholder.com/300?text=Ziva', basePrice: { list: 1250 } },
        ],
    },

    'end-tables': {
        title: 'End Tables',
        data: [
            { id: 'poet-end', name: 'Poet', image: 'https://via.placeholder.com/300?text=Poet', basePrice: { list: 750 } },
            { id: 'teekan-end', name: 'Teekan', image: 'https://via.placeholder.com/300?text=Teekan', basePrice: { list: 1100 } },
            { id: 'ziva-end', name: 'Ziva', image: 'https://via.placeholder.com/300?text=Ziva', basePrice: { list: 950 } },
            { id: 'connect-end', name: 'Connect', image: 'https://via.placeholder.com/300?text=Connect', basePrice: { list: 1250 } },
        ],
    },

    conference: {
        title: 'Conference Tables',
        data: [
            { id: 'moto-conf', name: 'Moto', image: 'https://via.placeholder.com/300?text=Moto', basePrice: { list: 4800 } },
            { id: 'vision-conf', name: 'Vision', image: 'https://via.placeholder.com/300?text=Vision', basePrice: { list: 7200 } },
            { id: 'forge-conf', name: 'Forge', image: 'https://via.placeholder.com/300?text=Forge', basePrice: { list: 6000 } },
            { id: 'brogan-conf', name: 'Brogan', image: 'https://via.placeholder.com/300?text=Brogan', basePrice: { list: 6500 } },
        ],
    },

    casegoods: {
        title: 'Casegoods',
        data: [
            { id: 'vision-1', name: 'Vision', image: 'https://via.placeholder.com/300?text=Vision', basePrice: { list: 7200 } },
            { id: 'flux-1', name: 'Flux', image: 'https://via.placeholder.com/300?text=Flux', basePrice: { list: 5800 } },
            { id: 'brogan-1', name: 'Brogan', image: 'https://via.placeholder.com/300?text=Brogan', basePrice: { list: 6500 } },
            { id: 'moto-1', name: 'Moto', image: 'https://via.placeholder.com/300?text=Moto', basePrice: { list: 4200 } },
        ],
    },
};

export const PRODUCTS_CATEGORIES_DATA = Object.entries(PRODUCT_DATA).map(([key, value]) => ({ name: value.title, nav: `products/category/${key}`, images: value.data.length > 0 ? value.data.slice(0, 2).map(p => p.image) : ['https://placehold.co/100x100/EEE/777?text=JSI'] })).sort((a, b) => a.name.localeCompare(b.name));

export const CASEGOODS_COMPETITIVE_DATA = { typicals: [{ id: 'vision-1', name: 'Vision', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000002.jpg', url: 'https://www.jsifurniture.com/product/vision', basePrice: { laminate: 7200, veneer: 8600 }, }, { id: 'vision-2', name: 'Vision', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000007.jpg', url: 'https://www.jsifurniture.com/product/vision', basePrice: { laminate: 7200, veneer: 8600 }, }, { id: 'vision-3', name: 'Vision', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000009.jpg', url: 'https://www.jsifurniture.com/product/vision', basePrice: { laminate: 7200, veneer: 8600 }, }, { id: 'vision-4', name: 'Vision', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_00000012.jpg', url: 'https://www.jsifurniture.com/product/vision', basePrice: { laminate: 7200, veneer: 8600 }, }, { id: 'vision-5', name: 'Vision', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_0023_6DHmfyb.jpg', url: 'https://www.jsifurniture.com/product/vision', basePrice: { laminate: 7200, veneer: 8600 }, }, { id: 'flux-1', name: 'Flux', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_flux_config_00008.jpg', url: 'https://www.jsifurniture.com/product/flux', basePrice: { laminate: 5800, veneer: 7200 }, },], competitors: [{ name: 'Kimball Priority', factor: 1.15 }, { name: 'OFS Pulse', factor: 1.10 }, { name: 'Indiana Canvas', factor: 0.95 },], };

export const SWIVELS_COMPETITIVE_DATA = { typicals: [{ id: 'cosgrove', name: 'Cosgrove', image: 'https://placehold.co/200x150?text=Cosgrove', basePrice: { list: 1187 } }, { id: 'arwyn', name: 'Arwyn', image: 'https://placehold.co/200x150?text=Arwyn', basePrice: { list: 1395 } }, { id: 'newton', name: 'Newton', image: 'https://placehold.co/200x150?text=Newton', basePrice: { list: 1520 } }, { id: 'proxy', name: 'Proxy', image: 'https://placehold.co/200x150?text=Proxy', basePrice: { list: 1675 } },], competitors: [{ name: 'Kimball Eon', factor: 1.10 }, { name: 'National Fringe', factor: 1.05 }, { name: 'OFS Eleven', factor: 1.18 },], };

export const BARSTOOLS_COMPETITIVE_DATA = { typicals: [{ id: 'knox', name: 'Knox', image: 'https://placehold.co/200x150?text=Knox', basePrice: { list: 850 } }, { id: 'indy', name: 'Indy', image: 'https://placehold.co/200x150?text=Indy', basePrice: { list: 920 } },], competitors: [{ name: 'Hightower Toro', factor: 1.12 }, { name: 'Versteel Quanta', factor: 1.14 },], };

export const COUNTERSTOOLS_COMPETITIVE_DATA = { typicals: [{ id: 'knox-c', name: 'Knox-C', image: 'https://placehold.co/200x150?text=Knox+C', basePrice: { list: 820 } },], competitors: [{ name: 'National Fringe', factor: 1.05 }, { name: 'OFS Hula', factor: 1.13 },], };

export const GUESTCHAIRS_COMPETITIVE_DATA = { typicals: [{ id: 'arwyn-guest', name: 'Arwyn', image: 'https://placehold.co/200x150?text=Arwyn', basePrice: { list: 1100 } }, { id: 'bryn-guest', name: 'Bryn', image: 'https://placehold.co/200x150?text=Bryn', basePrice: { list: 1350 } },], competitors: [{ name: 'Kimball Villa', factor: 1.08 }, { name: 'Indiana Natta', factor: 0.97 },], };

export const LOUNGE_COMPETITIVE_DATA = { typicals: [{ id: 'caav', name: 'Caav', image: 'https://placehold.co/200x150?text=Caav', basePrice: { list: 2100 } }, { id: 'welli', name: 'Welli', image: 'https://placehold.co/200x150?text=Welli', basePrice: { list: 2800 } },], competitors: [{ name: 'Allsteel Rise', factor: 1.22 }, { name: 'Haworth Cabana', factor: 1.30 },], };

export const COFFEETABLES_COMPETITIVE_DATA = { typicals: [{ id: 'poet-c', name: 'Poet', image: 'https://placehold.co/200x150?text=Poet', basePrice: { list: 950 } }, { id: 'denver-c', name: 'Denver', image: 'https://placehold.co/200x150?text=Denver', basePrice: { list: 1250 } },], competitors: [{ name: 'Versteel Elara', factor: 1.18 }, { name: 'National Epic', factor: 1.06 },], };

export const ENDTABLES_COMPETITIVE_DATA = { typicals: [{ id: 'poet-e', name: 'Poet (End)', image: 'https://placehold.co/200x150?text=Poet+End', basePrice: { list: 750 } }, { id: 'denver-e', name: 'Denver (End)', image: 'https://placehold.co/200x150?text=Denver+End', basePrice: { list: 950 } },], competitors: [{ name: 'OFS Eleven', factor: 1.12 }, { name: 'Indiana Oasis', factor: 0.98 },], };

export const CONFERENCE_COMPETITIVE_DATA = { typicals: [{ id: 'tablet-conf', name: 'Tablet', image: 'https://placehold.co/200x150?text=Tablet', basePrice: { list: 5500 } }, { id: 'vision-conf', name: 'Vision', image: 'https://placehold.co/200x150?text=Vision', basePrice: { list: 7200 } },], competitors: [{ name: 'Kimball Priority', factor: 1.15 }, { name: 'Versteel Quanta', factor: 1.10 },], };

export const COMPETITIVE_DATA = { casegoods: CASEGOODS_COMPETITIVE_DATA, swivels: SWIVELS_COMPETITIVE_DATA, 'bar-stools': BARSTOOLS_COMPETITIVE_DATA, 'counter-stools': COUNTERSTOOLS_COMPETITIVE_DATA, 'guest-chairs': GUESTCHAIRS_COMPETITIVE_DATA, lounge: LOUNGE_COMPETITIVE_DATA, 'coffee-tables': COFFEETABLES_COMPETITIVE_DATA, 'end-tables': ENDTABLES_COMPETITIVE_DATA, conference: CONFERENCE_COMPETITIVE_DATA, };

export const SAMPLE_DISCOUNTS_DATA = [{ title: "Rep Showroom/Samples", ssa: "RT-711576", off: "85% Off", commission: "No commission" }, { title: "Dealer Showroom Samples", ssa: "DR-228919", off: "75% Off", commission: "No commission" }, { title: "Designer Samples", ssa: "WE-304039", off: "75% Off", commission: "No commission" }, { title: "Personal Use Samples", ssa: "DF-022745", off: "75% Off", commission: "No commission" }];

export const INITIAL_MEMBERS = [
    { id: 1, firstName: 'Luke', lastName: 'Miller', email: 'luke.miller@example.com', title: 'Admin', role: 'Admin', permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } },
    { id: 2, firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@example.com', title: 'Admin', role: 'Admin', permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true } },
    { id: 3, firstName: 'Michael', lastName: 'Jones', email: 'michael.jones@example.com', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: true, projects: false, customerRanking: true, dealerRewards: false, submittingReplacements: false } },
    { id: 4, firstName: 'Jessica', lastName: 'Williams', email: 'jessica.williams@example.com', title: 'Designer', role: 'User', permissions: { salesData: false, commissions: false, projects: true, customerRanking: false, dealerRewards: false, submittingReplacements: true } },
    { id: 5, firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', title: 'Sales', role: 'User', permissions: { salesData: true, commissions: true, projects: false, customerRanking: true, dealerRewards: false, submittingReplacements: false } },
];

export const REWARDS_DATA = { '2025-Q2': { sales: [{ name: "Alan Bird", amount: 1034.21 }, { name: "Deb Butler", amount: 520.32 }, { name: "Jason Beehler", amount: 44.21 }, { name: "Andrea Kirkland", amount: 20.00 },], designers: [{ name: "Jen Franklin", amount: 12.10 }] }, '2025-Q1': { sales: [{ name: "Deb Butler", amount: 845.12 }, { name: "Alan Bird", amount: 730.50 }, { name: "Andrea Kirkland", amount: 55.00 }, { name: "Jason Beehler", amount: 32.80 },], designers: [{ name: "Jen Franklin", amount: 25.50 }] }, '2024-Q4': { sales: [{ name: "Alan Bird", amount: 1200.00 }, { name: "Deb Butler", amount: 950.00 }, { name: "Jason Beehler", amount: 75.00 }, { name: "Andrea Kirkland", amount: 30.00 },], designers: [{ name: "Jen Franklin", amount: 40.00 }] }, '2024-Q3': { sales: [], designers: [] }, '2024-Q2': { sales: [{ name: "Deb Butler", amount: 1100.30 }, { name: "Alan Bird", amount: 1050.11 }, { name: "Andrea Kirkland", amount: 60.00 }, { name: "Jason Beehler", amount: 50.15 },], designers: [{ name: "Jen Franklin", amount: 75.00 }] }, '2024-Q1': { sales: [{ name: "Alan Bird", amount: 962.21 }, { name: "Deb Butler", amount: 720.60 }, { name: "Jason Beehler", amount: 65.80 }, { name: "Andrea Kirkland", amount: 30.00 },], designers: [{ name: "Jen Franklin", amount: 35.00 }] }, '2023-Q4': { sales: [], designers: [] }, '2023-Q3': { sales: [], designers: [] }, '2023-Q2': { sales: [], designers: [] }, '2023-Q1': { sales: [], designers: [] }, };

export const INSTALL_INSTRUCTIONS_DATA = [
    {
        id: 'arwyn',
        name: 'Arwyn',
        type: 'Seating',
        videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video',
        pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_arwyn_comp_0001.jpg'
    },
    {
        id: 'bryn',
        name: 'Bryn',
        type: 'Seating',
        videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video',
        pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_bryn_comp_0004.jpg'
    },
    {
        id: 'caav',
        name: 'Caav',
        type: 'Lounge',
        videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video',
        pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_comp_0005.jpg'
    },
    {
        id: 'vision',
        name: 'Vision',
        type: 'Casegoods',
        videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video',
        pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000002.jpg'
    },
    {
        id: 'forge',
        name: 'Forge',
        type: 'Tables',
        videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video',
        pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_forge_config_0001.jpg'
    },
    {
        id: 'flux',
        name: 'Flux',
        type: 'Casegoods',
        videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video',
        pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_flux_config_00008.jpg'
    },
    {
        id: 'tablet',
        name: 'Tablet',
        type: 'Tables',
        videoUrl: 'https://placehold.co/1600x900/2A2A2A/FFF?text=Video',
        pdfUrl: 'https://www.jsifurniture.com/resources/documents/type/11',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_tablet_config_0001.jpg'
    },
];

export const COMMISSIONS_DATA = {
    '2025': [
        {
            month: 'June', amount: 37094.23, issuedDate: '2025-07-22', details: [
                {
                    salesperson: 'DAN@BGREPS.COM; OTCOLEINDY@GMAIL.COM', invoices: [
                        { invoice: '0000608805', po: 'A289743-4', so: '486242', project: '9100 KEYSTONE AMENITY: FURNITURE ELL LILY', listValue: 1070.40, netAmount: 1536.77, commission: 153.68 },
                        { invoice: '0000608806', po: 'A2900020-1', so: '495025', project: 'ELI LILLY AND COMPANY', listValue: 1035.90, netAmount: 995.03, commission: 114.36 },
                        { invoice: '0000600608', po: 'A2901050-1', so: '450581', project: 'ELI LILLY & COMPANY', listValue: 190.40, netAmount: 743.73, commission: 74.37 },
                        { invoice: '00006069725', po: 'A290006-3', so: '450338', project: 'MARSHALL COMMUNITY BUILDING', listValue: 103.20, netAmount: 178.54, commission: 17.85 },
                        { invoice: '00006069750', po: 'A290036-2', so: '450224', project: 'BELZER MIDDLE SCHOOL MSD OF LAWRENCE TOWNSHIP', listValue: 2276.62, netAmount: 2223.49, commission: 96.65 },
                        { invoice: '0000600883', po: 'A290066-3', so: '450338', project: 'MSD OF LAWRENCE TOWNSHIP', listValue: 1143.60, netAmount: 1128.11, commission: 1128.11 },
                        { invoice: '0000610026', po: 'A289674-4', so: '486362', project: 'GREENFIELD BANKING CO FISHERS OFFICE', listValue: 40.40, netAmount: 40.40, commission: 40.40 },
                    ]
                },
                { customer: '025708 OTIS R BOWEN CENTER FOR HUMAN', total: 0 },
                { customer: '025728 INNOVATE LLC', total: 0 },
                { customer: '044145 - DESKS INC OF UTAH', total: 0 },
                { customer: '044145 DESKS INC OF UTAH', total: 0 },
                { brandTotal: 'JSI', listTotal: 537933.27, netTotal: 507450.82, commissionTotal: 37094.23 },
            ]
        },
        { month: 'May', amount: 45000.00, issuedDate: '2025-06-22', details: [] },
        { month: 'April', amount: 32000.50, issuedDate: '2025-05-22', details: [] },
    ],
    '2024': [
        { month: 'December', amount: 28000.00, issuedDate: '2025-01-22', details: [] },
    ],
};