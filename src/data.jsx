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
    { series: 'Addison', type: 'Wood Seating', weeks: 4, image: '/series-images/jsi_addison_comp_00015.jpg' },
    { series: 'Addison', type: 'Upholstery', weeks: 7, image: '/series-images/jsi_addison_comp_00014.jpg' },
    { series: 'Americana', type: 'Wood Seating', weeks: 4, image: '/series-images/jsi_americana_comp_00026.jpg' },
    { series: 'Americana', type: 'Upholstery', weeks: 7, image: '/series-images/jsi_americana_comp_00027.jpg' },
    { series: 'Ansen', type: 'Seating', weeks: 7, image: '/series-images/jsi_ansen_comp_00002.jpg' },
    { series: 'Anthology', type: 'Casegoods', weeks: 8, image: '/series-images/jsi_anthology_comp_0008.jpg' },
    { series: 'Arwyn', type: 'Seating', weeks: 8, image: '/series-images/jsi_arwyn_comp_0001.jpg' },
    { series: 'Arwyn', type: 'Tables', weeks: 4, image: '/series-images/jsi_arwyn_comp_0001.jpg' },
    { series: 'Avini', type: 'Seating', weeks: 7, image: '/series-images/jsi_avini_comp_00001.jpg' },
    { series: 'BeSPACE', type: 'Seating', weeks: 8, image: '/series-images/jsi_bespace_comp_00001.jpg' },
    { series: 'BeSPACE', type: 'Tables', weeks: 4, image: '/series-images/jsi_bespace_comp_00001.jpg' },
    { series: 'Boston', type: 'Wood Seating', weeks: 7, image: '/series-images/jsi_boston_comp_00001.jpg' },
    { series: 'Boston', type: 'Upholstery', weeks: 7, image: '/series-images/jsi_boston_comp_00001.jpg' },
    { series: 'Bourne', type: 'Seating', weeks: 5, image: '/series-images/jsi_bourne_comp_00001.jpg' },
    { series: 'Bourne', type: 'Tables', weeks: 8, image: '/series-images/jsi_bourne_comp_00001.jpg' },
    { series: 'Brogan', type: 'Casegoods', weeks: 8, image: '/series-images/jsi_brogan_config_00001.jpg' },
    { series: 'Bryn', type: 'Seating', weeks: 6, image: '/series-images/jsi_bryn_comp_0004.jpg' },
    { series: 'Bryn', type: 'Upholstery', weeks: 6, image: '/series-images/jsi_bryn_comp_0004.jpg' },
    { series: 'Cäav', type: 'Seating', weeks: 8, image: '/series-images/jsi_caav_comp_0005.jpg' },
    { series: 'Cäav', type: 'Tables', weeks: 8, image: '/series-images/jsi_caav_comp_0005.jpg' },
    { series: 'Class Act', type: 'Wood Seating', weeks: 4, image: '/series-images/jsi_class-act_comp_00001.jpg' },
    { series: 'Class Act', type: 'Upholstery', weeks: 7, image: '/series-images/jsi_class-act_comp_00001.jpg' },
    { series: 'Connect', type: 'Seating', weeks: 6, image: '/series-images/jsi_connect_comp_00001.jpg' },
    { series: 'Copilot', type: 'Casegoods', weeks: 6, image: '/series-images/jsi_copilot_config_00001.jpg' },
    { series: 'Cosgrove', type: 'Seating', weeks: 5, image: '/series-images/jsi_cosgrove_comp_00001.jpg' },
    { series: 'Encore', type: 'Seating', weeks: 5, image: '/series-images/jsi_encore_comp_00001.jpg' },
    { series: 'Finale', type: 'Casegoods', weeks: 8, image: '/series-images/jsi_finale_config_00001.jpg' },
    { series: 'Finn', type: 'Seating', weeks: 7, image: '/series-images/jsi_finn_comp_00001.jpg' },
    { series: 'Finn Nu', type: 'Seating', weeks: 7, image: '/series-images/jsi_finn-nu_comp_00001.jpg' },
    { series: 'Flux', type: 'Laminate', weeks: 10, image: '/series-images/jsi_flux_config_00008.jpg' },
    { series: 'Flux', type: 'Veneer', weeks: 10, image: '/series-images/jsi_flux_config_00008.jpg' },
    { series: 'Forge', type: 'Casegoods', weeks: 8, image: '/series-images/jsi_forge_config_0001.jpg' },
    { series: 'Garvey RS', type: 'Seating', weeks: 7, image: '/series-images/jsi_garvey-rs_comp_00001.jpg' },
    { series: 'Gatsby', type: 'Seating', weeks: 6, image: '/series-images/jsi_gatsby_comp_00001.jpg' },
    { series: 'Harbor', type: 'Seating', weeks: 7, image: '/series-images/jsi_harbor_comp_00001.jpg' },
    { series: 'Henley', type: 'Seating', weeks: 7, image: '/series-images/jsi_henley_comp_00001.jpg' },
    { series: 'Henley', type: 'Upholstery', weeks: 7, image: '/series-images/jsi_henley_comp_00001.jpg' },
    { series: 'Hoopz', type: 'Upholstery', weeks: 7, image: '/series-images/jsi_hoopz_comp_00001.jpg' },
    { series: 'Indie', type: 'Seating', weeks: 7, image: '/series-images/jsi_indie_comp_00001.jpg' },
    { series: 'Indie', type: 'Tables', weeks: 4, image: '/series-images/jsi_indie_comp_00001.jpg' },
    { series: 'Jude', type: 'Seating', weeks: 5, image: '/series-images/jsi_jude_comp_00001.jpg' },
    { series: 'Jude', type: 'Upholstery', weeks: 5, image: '/series-images/jsi_jude_comp_00001.jpg' },
    { series: 'Kindera', type: 'Seating', weeks: 8, image: '/series-images/jsi_kindera_comp_00001.jpg' },
    { series: 'Knox', type: 'Seating', weeks: 5, image: '/series-images/jsi_knox_comp_00001.jpg' },
    { series: 'Knox', type: 'Upholstery', weeks: 5, image: '/series-images/jsi_knox_comp_00001.jpg' },
    { series: 'Kyla', type: 'Seating', weeks: 5, image: '/series-images/jsi_kyla_comp_00001.jpg' },
    { series: 'Kyla', type: 'Upholstery', weeks: 5, image: '/series-images/jsi_kyla_comp_00001.jpg' },
    { series: 'Lincoln', type: 'Casegoods', weeks: 4, image: '/series-images/jsi_lincoln_config_00001.jpg' },
    { series: 'Lok', type: 'Casegoods', weeks: 5, image: '/series-images/jsi_lok_config_00001.jpg' },
    { series: 'Mackey', type: 'Seating', weeks: 5, image: '/series-images/jsi_mackey_comp_00001.jpg' },
    { series: 'Mackey', type: 'Upholstery', weeks: 5, image: '/series-images/jsi_mackey_comp_00001.jpg' },
    { series: 'Madison', type: 'Seating', weeks: 7, image: '/series-images/jsi_madison_comp_00001.jpg' },
    { series: 'Mittle', type: 'Seating', weeks: 7, image: '/series-images/jsi_mittle_comp_00001.jpg' },
    { series: 'Moto', type: 'Seating', weeks: 5, image: '/series-images/jsi_moto_config_00001.jpg' },
    { series: 'Moto', type: 'Laminate', weeks: 8, image: '/series-images/jsi_moto_config_00001.jpg' },
    { series: 'Moto', type: 'Veneer', weeks: 8, image: '/series-images/jsi_moto_config_00001.jpg' },
    { series: 'Native Benches', type: 'Seating', weeks: 7, image: '/series-images/jsi_native_config_00001.jpg' },
    { series: 'Native', type: 'Laminate', weeks: 8, image: '/series-images/jsi_native_config_00001.jpg' },
    { series: 'Native', type: 'Veneer', weeks: 8, image: '/series-images/jsi_native_config_00001.jpg' },
    { series: 'Newton', type: 'Seating', weeks: 7, image: '/series-images/jsi_newton_comp_00001.jpg' },
    { series: 'Nosh', type: 'Casegoods', weeks: 5, image: '/series-images/jsi_nosh_config_00001.jpg' },
    { series: 'Oxley', type: 'Seating', weeks: 7, image: '/series-images/jsi_oxley_comp_00001.jpg' },
    { series: 'Pillows', type: 'Seating', weeks: 4, image: '/series-images/jsi_pillows_comp_00001.jpg' },
    { series: 'Poet', type: 'Seating', weeks: 8, image: '/series-images/jsi_poet_comp_00001.jpg' },
    { series: 'Poet', type: 'Tables', weeks: 8, image: '/series-images/jsi_poet_comp_00001.jpg' },
    { series: 'Privacy', type: 'Casegoods', weeks: 4, image: '/series-images/jsi_privacy_config_00001.jpg' },
    { series: 'Prost', type: 'Casegoods', weeks: 8, image: '/series-images/jsi_prost_config_00001.jpg' },
    { series: 'Protocol', type: 'Seating', weeks: 5, image: '/series-images/jsi_protocol_comp_00001.jpg' },
    { series: 'Proxy', type: 'Seating', weeks: 7, image: '/series-images/jsi_proxy_comp_00001.jpg' },
    { series: 'Ramona', type: 'Seating', weeks: 7, image: '/series-images/jsi_ramona_comp_00001.jpg' },
    { series: 'Reef', type: 'Laminate', weeks: 8, image: '/series-images/jsi_reef_config_00001.jpg' },
    { series: 'Reef', type: 'Veneer', weeks: 8, image: '/series-images/jsi_reef_config_00001.jpg' },
    { series: 'Ria', type: 'Seating', weeks: 7, image: '/series-images/jsi_ria_comp_00001.jpg' },
    { series: 'Romy', type: 'Casegoods', weeks: 5, image: '/series-images/jsi_romy_config_00001.jpg' },
    { series: 'Satisse', type: 'Seating', weeks: 5, image: '/series-images/jsi_satisse_comp_00001.jpg' },
    { series: 'Somna', type: 'Seating', weeks: 8, image: '/series-images/jsi_somna_comp_00001.jpg' },
    { series: 'Sosa', type: 'Seating', weeks: 6, image: '/series-images/jsi_sosa_comp_00001.jpg' },
    { series: 'Teekan', type: 'Seating', weeks: 8, image: '/series-images/jsi_teekan_comp_00001.jpg' },
    { series: 'Totem', type: 'Seating', weeks: 5, image: '/series-images/jsi_totem_comp_00001.jpg' },
    { series: 'Trinity', type: 'Seating', weeks: 7, image: '/series-images/jsi_trinity_comp_00001.jpg' },
    { series: 'Vision', type: 'Laminate', weeks: 8, image: '/series-images/jsi_vision_config_000002.jpg' },
    { series: 'Vision', type: 'Veneer', weeks: 8, image: '/series-images/jsi_vision_config_000002.jpg' },
    { series: 'Walden', type: 'Casegoods', weeks: 8, image: '/series-images/jsi_walden_config_00001.jpg' },
    { series: 'Wellington', type: 'Casegoods', weeks: 8, image: '/series-images/jsi_wellington_config_00001.jpg' },
    { series: 'Wink', type: 'Seating', weeks: 3, image: '/series-images/jsi_wink_enviro_00033.jpg' },
    { series: 'Ziva', type: 'Tables', weeks: 4, image: '/series-images/jsi_ziva_comp_00001.jpg' },
].sort((a, b) => a.series.localeCompare(b.series));

export const FABRICS_DATA = [
    // Arc-Com Fabrics
    { supplier: 'Arc-Com', pattern: 'Astor', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Alden' },
    { supplier: 'Arc-Com', pattern: 'Caldera', grade: 'B', tackable: 'no', textile: 'Coated', series: 'Alden' },
    { supplier: 'Arc-Com', pattern: 'Demo', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Alden' },
    
    // Maharam Fabrics
    { supplier: 'Maharam', pattern: 'Origin', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Vision' },
    { supplier: 'Maharam', pattern: 'Climb', grade: 'D', tackable: 'no', textile: 'Fabric', series: 'Vision' },
    { supplier: 'Maharam', pattern: 'Rigid', grade: 'B', tackable: 'yes', textile: 'Fabric', series: 'Wink' },
    { supplier: 'Maharam', pattern: 'Mode', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Symmetry' },
    
    // Momentum Fabrics
    { supplier: 'Momentum', pattern: 'Luxe Weave', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Convert' },
    { supplier: 'Momentum', pattern: 'Origin', grade: 'B', tackable: 'no', textile: 'Fabric', series: 'Vision' },
    { supplier: 'Momentum', pattern: 'Prospect', grade: 'D', tackable: 'yes', textile: 'Coated', series: 'Momentum' },
    
    // Architex Fabrics
    { supplier: 'Architex', pattern: 'Origin', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Allied' },
    { supplier: 'Architex', pattern: 'Crossgrain', grade: 'E', tackable: 'no', textile: 'Panel', series: 'Proton' },
    
    // Traditions Fabrics
    { supplier: 'Traditions', pattern: 'Heritage Tweed', grade: 'F', tackable: 'yes', textile: 'Fabric', series: 'Reveal' },
    { supplier: 'Traditions', pattern: 'Eco Wool', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Midwest' },
    
    // CF Stinson Fabrics
    { supplier: 'CF Stinson', pattern: 'Beeline', grade: 'B', tackable: 'no', textile: 'Fabric', series: 'Cincture' },
    { supplier: 'CF Stinson', pattern: 'Honeycomb', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Aria' },
    
    // Designtex Fabrics
    { supplier: 'Designtex', pattern: 'Eco Tweed', grade: 'G', tackable: 'yes', textile: 'Fabric', series: 'Anthology' },
    { supplier: 'Designtex', pattern: 'Melange', grade: 'H', tackable: 'no', textile: 'Coated', series: 'Wink' },
    
    // Kvadrat Fabrics
    { supplier: 'Kvadrat', pattern: 'Remix 3', grade: 'I', tackable: 'yes', textile: 'Fabric', series: 'Convert' },
    { supplier: 'Kvadrat', pattern: 'Pixel', grade: 'J', tackable: 'no', textile: 'Panel', series: 'Vision' },
    
    // Camira Fabrics
    { supplier: 'Camira', pattern: 'Dapper', grade: 'L1', tackable: 'yes', textile: 'Fabric', series: 'Symmetry' },
    { supplier: 'Camira', pattern: 'Urban', grade: 'L2', tackable: 'no', textile: 'Leather', series: 'Proton' },
    
    // Carnegie Fabrics
    { supplier: 'Carnegie', pattern: 'Metro', grade: 'COL', tackable: 'yes', textile: 'Fabric', series: 'Allied' },
    { supplier: 'Carnegie', pattern: 'Cityscape', grade: 'COM', tackable: 'no', textile: 'Coated', series: 'Momentum' },
    
    // Guilford of Maine
    { supplier: 'Guilford of Maine', pattern: 'Coastal', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Reveal' },
    { supplier: 'Guilford of Maine', pattern: 'Maritime', grade: 'B', tackable: 'no', textile: 'Panel', series: 'Midwest' },
    
    // Knoll Fabrics
    { supplier: 'Knoll', pattern: 'Modern', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Cincture' },
    { supplier: 'Knoll', pattern: 'Classic', grade: 'D', tackable: 'no', textile: 'Leather', series: 'Aria' },
    
    // Kravet Fabrics
    { supplier: 'Kravet', pattern: 'Elegance', grade: 'E', tackable: 'yes', textile: 'Fabric', series: 'Anthology' },
    { supplier: 'Kravet', pattern: 'Sophisticate', grade: 'F', tackable: 'no', textile: 'Coated', series: 'Wink' }
];

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
    { name: 'Dealer Directory', route: 'resources/dealer-directory', icon: Users },
    { name: 'Commission Rates', route: 'resources/commission-rates', icon: DollarSign },
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
    { name: 'Design Days', route: 'resources/design_days', icon: Calendar },
];

export const RESOURCES_DATA = [
    {
        category: "Product & Finish Resources",
        items: [
            { label: "Lead Times", nav: "resources/lead-times" },
            { label: "Search Fabrics", nav: "fabrics/search_form" },
            { label: "Request COM Yardage", nav: "fabrics/com_request" },
            { label: "Discontinued Finishes Database", nav: "resources/discontinued_finishes" },
        ].sort((a, b) => a.label.localeCompare(b.label)) // Keep alphabetical sorting within categories
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

export const VERTICALS = [
    'Corporate',
    'Education',
    'Government',
    'Healthcare',
    'Hospitality',
    'Other (Please specify)'
];

export const SOCIAL_MEDIA_POSTS = [{ id: 1, type: 'image', url: 'https://placehold.co/400x500/E3DBC8/2A2A2A?text=JSI+Seating', caption: 'Comfort meets design. ✨ Discover the new Arwyn series, perfect for any modern workspace. #JSIFurniture #OfficeDesign #ModernWorkplace' }, { id: 2, type: 'image', url: 'https://placehold.co/400x500/D9CDBA/2A2A2A?text=Vision+Casegoods', caption: 'Functionality at its finest. The Vision casegoods line offers endless configuration possibilities. #Casegoods #OfficeInspo #JSI' }, { id: 3, type: 'video', url: 'https://placehold.co/400x500/A9886C/FFFFFF?text=Lounge+Tour+(Video)', caption: 'Take a closer look at the luxurious details of our Caav lounge collection. #LoungeSeating #ContractFurniture #HospitalityDesign' }, { id: 4, type: 'image', url: 'https://placehold.co/400x500/966642/FFFFFF?text=Forge+Tables', caption: 'Gather around. The Forge table series brings a rustic yet refined look to collaborative spaces. #MeetingTable #Collaboration #JSI' },];

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

export const INITIAL_OPPORTUNITIES = [{ id: 1, name: 'New Office Furnishings', stage: 'Discovery', discount: '5%', value: '$50,000', company: 'ABC Corporation', contact: 'John Smith', poTimeframe: '30-60 days' }, { id: 2, name: 'Lobby Refresh', stage: 'Specifying', value: '$75,000', company: 'XYZ Industries', contact: 'Jane Doe', poTimeframe: '60-90 days' },];

export const STAGES = ['Discovery', 'Specifying', 'Decision/Bidding', 'PO Expected', 'Won', 'Lost'];

export const STAGE_COLORS = { 'Discovery': `bg-blue-200 text-blue-900`, 'Specifying': `bg-green-200 text-green-900`, 'Decision/Bidding': `bg-orange-200 text-orange-900`, 'PO Expected': `bg-purple-200 text-purple-900`, 'Won': `bg-emerald-200 text-emerald-900`, 'Lost': `bg-red-200 text-red-900`, };

export const EMPTY_LEAD = {
    project: '',
    designFirm: '',
    dealer: '',
    winProbability: 50, // FIXED: Changed from '' to a default number
    projectStatus: '',
    vertical: '',
    otherVertical: '',
    estimatedList: '',
    poTimeframe: '',
    competitors: [],
    competitionPresent: false,
    isBid: false,
    jsiSpecServices: false,
    quoteType: 'New Quote',
    pastProjectRef: '',
    discount: 'Undecided',
    products: [],
    notes: '',
    jsiQuoteNumber: '',
    isContract: false,
    contractType: ''
};

export const URGENCY_LEVELS = ['Low', 'Medium', 'High'];

export const PO_TIMEFRAMES = ['Within 30 Days', '30-60 Days', '60-90 Days', '90+ Days', 'Early 2026', 'Late 2026', '2027 or beyond'];

export const COMPETITORS = ['None', 'Kimball', 'OFS', 'Indiana Furniture', 'National', 'Haworth', 'MillerKnoll', 'Steelcase', 'Versteel', 'Krug', 'Lazyboy', 'DarRan', 'Hightower', 'Allsteel'];

export const DISCOUNT_OPTIONS = ['Undecided', '50/20 (60.00%)', '50/20/1 (60.4%)', '50/20/2 (60.80%)', '50/20/4 (61.60%)', '50/20/2/3 (61.98%)', '50/20/5 (62.00%)', '50/20/3 (61.20%)', '50/20/6 (62.40%)', '50/25 (62.50%)', '50/20/5/2 (62.76%)', '50/20/7 (62.80%)', '50/20/8 (63.20%)', '50/10/10/10 (63.55%)', '50/20/9 (63.6%)', '50/20/10 (64.00%)', '50/20/8/3 (64.30%)', '50/20/10/3 (65.08%)', '50/20/10/5 (65.80%)', '50/20/15 (66.00%)'];

export const VISION_MATERIALS = ['TFL', 'HPL', 'Veneer'];

export const WIN_PROBABILITY_OPTIONS = ['20%', '40%', '60%', '80%', '100%'];

export const INITIAL_DESIGN_FIRMS = ['N/A', 'Undecided', 'McGee Designhouse', 'Ratio', 'CSO', 'IDO', 'Studio M'];

export const INITIAL_DEALERS = ['Undecided', 'Business Furniture', 'COE', 'OfficeWorks', 'RJE'];

export const JSI_LAMINATES = ['Nevada Slate', 'Urban Concrete', 'Smoked Hickory', 'Arctic Oak', 'Tuscan Marble', 'Brushed Steel', 'Midnight Linen', 'Riverstone Gray', 'Golden Teak', 'Sahara Sand'];

export const JSI_VENEERS = ['Rift Cut Oak', 'Smoked Walnut', 'Figured Anigre', 'Reconstituted Ebony', 'Fumed Eucalyptus', 'Birdseye Maple', 'Cherry Burl', 'Sapele Pommele', 'Zebrawood', 'Koa'];

export const YTD_SALES_DATA = [{ label: 'Total Sales', current: 3666132, previous: 2900104, goal: 7000000 }, { label: 'Education', current: 1250000, previous: 1045589, goal: 2500000 }, { label: 'Health', current: 980000, previous: 850000, goal: 2000000 },];

export const MONTHLY_SALES_DATA = [{ month: 'Jan', bookings: 1259493, sales: 506304 }, { month: 'Feb', bookings: 497537, sales: 553922 }, { month: 'Mar', bookings: 397684, sales: 365601 }, { month: 'Apr', bookings: 554318, sales: 696628 }, { month: 'May', bookings: 840255, sales: 1340018 }, { month: 'Jun', bookings: 116846, sales: 36823 },];

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

export const SALES_VERTICALS_DATA = [
    { label: 'Healthcare', value: 2900104, color: '#c5e1a5' }, // Changed color
    { label: 'Education', value: 1045589, color: '#ef9a9a' }, // Changed color
    { label: 'Hospitality', value: 1045589, color: '#b39ddb' }, // Changed color
    { label: 'Corporate', value: 1045589, color: '#C7AD8E' }, // Changed color
    { label: 'Government', value: 1045589, color: '#ffe082' }, // Changed color
    { label: 'Other', value: 500000, color: '#c1c1c1' }, // Added an 'Other' category to use the last color
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
    {
        date: '2025-06-10T11:20:00Z',
        company: 'BUSINESS FURNISHINGS',
        details: 'MONREAU SEMINARY',
        orderNumber: '450080-00',
        po: 'S65474-2',
        net: 112000.00,
        shipDate: '2025-09-15T12:00:00Z',
        status: 'In Production',
        shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628',
        discount: '18.40%',
        lineItems: [
            { line: '001', name: 'VISION CONFERENCE TABLE', model: 'VCT12048', quantity: 5, net: 8000.00, extNet: 40000.00, specs: [{ label: 'FINISH', value: 'MOCHA LAMINATE' }, { label: 'BASE', value: 'TRUSS LEG - BLACK' }] },
            { line: '002', name: 'ARWYN SWIVEL CHAIR', model: 'AW6007C', quantity: 40, net: 1800.00, extNet: 72000.00, specs: [{ label: 'UPHOLSTERY', value: 'MAHARAM, MODE, GLACIER' }] }
        ]
    },
    {
        date: '2025-06-13T10:00:00Z',
        company: 'BUSINESS FURNISHINGS',
        details: 'MONREAU SEMINARY - PHASE 2',
        orderNumber: '450080-01',
        po: 'S65474-3',
        net: 55000.00,
        shipDate: '2025-09-15T12:00:00Z',
        status: 'Acknowledged',
        shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628',
        discount: '18.40%',
        lineItems: [
            { line: '001', name: 'VISION CREDENZA', model: 'VCR7220D', quantity: 10, net: 2500.00, extNet: 25000.00, specs: [{ label: 'FINISH', value: 'MOCHA LAMINATE' }] },
            { line: '002', name: 'CAAV LOUNGE CHAIR', model: 'CV4501A', quantity: 15, net: 2000.00, extNet: 30000.00, specs: [{ label: 'FABRIC', value: 'DESIGNTEX, ECO TWEED, 04' }] }
        ]
    },
    {
        date: '2025-06-11T09:00:00Z',
        company: 'ONE ELEVEN DESIGN',
        details: 'CENTLIVRE, LLC',
        orderNumber: '449645-00',
        po: 'S65474-1',
        net: 2800.00,
        shipDate: '2025-09-05T12:00:00Z',
        status: 'Order Entry',
        shipTo: 'ONE ELEVEN DESIGN\n456 OAK AVENUE\nFORT WAYNE, IN 46802',
        discount: '18.01%',
        lineItems: [
            { line: '001', name: 'POET BARSTOOL', model: 'PT5301A', quantity: 4, net: 700.00, extNet: 2800.00, specs: [{ label: 'WOOD', value: 'LIGHT MAPLE' }] }
        ]
    },
    {
        date: '2025-06-14T11:00:00Z',
        company: 'ONE ELEVEN DESIGN',
        details: 'CENTLIVRE, LLC - LOBBY',
        orderNumber: '449645-01',
        po: 'S65474-4',
        net: 4250.00,
        shipDate: '2025-09-05T12:00:00Z',
        status: 'Order Entry',
        shipTo: 'ONE ELEVEN DESIGN\n456 OAK AVENUE\nFORT WAYNE, IN 46802',
        discount: '19.50%',
        lineItems: [
            { line: '001', name: 'ZIVA COFFEE TABLE', model: 'ZV2448CT', quantity: 1, net: 1250.00, extNet: 1250.00, specs: [{ label: 'FINISH', value: 'FLINT LAMINATE' }] },
            { line: '002', name: 'ZIVA END TABLE', model: 'ZV2222ET', quantity: 2, net: 1500.00, extNet: 3000.00, specs: [{ label: 'FINISH', value: 'FLINT LAMINATE' }] }
        ]
    },
    {
        date: '2025-06-11T16:45:00Z',
        company: 'CORPORATE DESIGN INC',
        details: 'ONE MAIN FINANCIAL',
        orderNumber: '449518-00',
        po: 'S65473-9',
        net: 500.00,
        shipDate: '2025-09-02T12:00:00Z',
        status: 'Acknowledged',
        shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708',
        discount: '22.34%',
        lineItems: [
            { line: '001', name: 'WINK GUEST CHAIR', model: 'WK4501A', quantity: 1, net: 500.00, extNet: 500.00, specs: [{ label: 'SHELL', value: 'KIWI GREEN' }] }
        ]
    },
    {
        date: '2025-06-12T10:15:00Z',
        company: 'CORPORATE DESIGN INC',
        details: 'ONEMAIN FINANCIAL',
        orderNumber: '442365-00',
        po: 'S65473-8',
        net: 950.00,
        shipDate: '2025-08-28T12:00:00Z',
        status: 'Shipping',
        shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708',
        discount: '24.03%',
        lineItems: [
            { line: '001', name: 'SIDE TABLE', model: 'SIDETBL-SM', quantity: 2, net: 475.00, extNet: 950.00, specs: [] }
        ]
    },
    {
        date: '2025-06-12T14:30:00Z',
        company: 'BUSINESS FURNITURE LLC',
        details: 'MSD of Lawrence Township - LECC',
        orderNumber: '444353-00',
        po: 'S65473-7',
        net: 31250.00,
        shipDate: '2025-08-25T12:00:00Z',
        status: 'In Production',
        shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628',
        discount: '61.20%',
        lineItems: [
            { line: '001', name: 'CROSSOVER SWIVEL CONFERENCE', model: 'AW6007C', quantity: 8, net: 902.10, extNet: 7216.80, specs: [{ label: 'MIDBACK-SWIVELBASE', value: 'ARWYNSERIES-MODELAW6007C' }] }
        ]
    },
];

export const INITIAL_MEMBERS = [
    { id: 1, firstName: 'Luke', lastName: 'Wagner', title: 'Sales Rep', role: 'Admin', permissions: { salesData: true, customerRanking: true, projects: true, commissions: true, dealerRewards: true, submittingReplacements: true } },
    { id: 2, firstName: 'Sarah', lastName: 'Johnson', title: 'Designer', role: 'User', permissions: { salesData: true, customerRanking: false, projects: true, commissions: false, dealerRewards: false, submittingReplacements: true } },
    { id: 3, firstName: 'Mike', lastName: 'Davis', title: 'Sales Manager', role: 'User', permissions: { salesData: true, customerRanking: true, projects: true, commissions: true, dealerRewards: true, submittingReplacements: false } },
    { id: 4, firstName: 'Emily', lastName: 'Chen', title: 'Account Manager', role: 'User', permissions: { salesData: false, customerRanking: false, projects: false, commissions: false, dealerRewards: false, submittingReplacements: true } }
];

export const DEALER_DIRECTORY_DATA = [
    {
        id: 1,
        name: 'Business Furniture LLC',
        address: '123 Main St, Indianapolis, IN 46201',
        phone: '(317) 555-0123',
        email: 'info@businessfurniture.com',
        bookings: 450000,
        sales: 435000,
        salespeople: [
            { name: 'John Smith', email: 'john@businessfurniture.com', phone: '(317) 555-0124' },
            { name: 'Jane Doe', email: 'jane@businessfurniture.com', phone: '(317) 555-0125' }
        ],
        designers: [
            { name: 'Mary Wilson', email: 'mary@businessfurniture.com', phone: '(317) 555-0126' }
        ],
        administration: [
            { name: 'Bob Brown', email: 'bob@businessfurniture.com', phone: '(317) 555-0127' }
        ],
        installers: [
            { name: 'Tom Johnson', email: 'tom@businessfurniture.com', phone: '(317) 555-0128' }
        ],
        recentOrders: [
            { projectName: 'Lawrence Township LECC', amount: 43034 },
            { projectName: 'Monreau Seminary', amount: 137262 }
        ],
        dailyDiscount: '50/20 (60.00%)'
    },
    {
        id: 2,
        name: 'Corporate Design Inc',
        address: '456 Oak Ave, Fort Wayne, IN 46802',
        phone: '(260) 555-0200',
        email: 'contact@corporatedesign.com',
        bookings: 380000,
        sales: 395000,
        salespeople: [
            { name: 'David Miller', email: 'david@corporatedesign.com', phone: '(260) 555-0201' }
        ],
        designers: [
            { name: 'Lisa Garcia', email: 'lisa@corporatedesign.com', phone: '(260) 555-0202' },
            { name: 'Chris Taylor', email: 'chris@corporatedesign.com', phone: '(260) 555-0203' }
        ],
        administration: [
            { name: 'Karen White', email: 'karen@corporatedesign.com', phone: '(260) 555-0204' }
        ],
        installers: [],
        recentOrders: [
            { projectName: 'OneMain Financial HQ', amount: 1250 },
            { projectName: 'OneMain Financial Branch', amount: 643 }
        ],
        dailyDiscount: '50/20/2 (60.80%)'
    }
];

export const PRODUCTS_CATEGORIES_DATA = [
    {
        name: 'Benches',
        nav: 'products/category/benches',
        images: [
            '/series-images/jsi_native_comp_00001.jpg',
            '/series-images/jsi_poet_comp_00001.jpg',
            '/series-images/jsi_indie_comp_00001.jpg',
        ],
    },
    {
        name: 'Casegoods',
        nav: 'products/category/casegoods',
        images: [
            '/series-images/jsi_vision_config_000002.jpg',
            '/series-images/jsi_brogan_config_00001.jpg',
            '/series-images/jsi_finale_config_00001.jpg',
        ],
    },
    {
        name: 'Conference Tables',
        nav: 'products/category/conference-tables',
        images: [
            '/series-images/jsi_vision_config_000002.jpg',
            '/series-images/jsi_reef_config_00001.jpg',
            '/series-images/jsi_moto_config_00001.jpg',
        ],
    },
    {
        name: 'Guest',
        nav: 'products/category/guest',
        images: [
            '/series-images/jsi_addison_comp_00015.jpg',
            '/series-images/jsi_americana_comp_00026.jpg',
            '/series-images/jsi_boston_comp_00001.jpg',
        ],
    },
    {
        name: 'Lounge',
        nav: 'products/category/lounge',
        images: [
            '/series-images/jsi_arwyn_comp_0001.jpg',
            '/series-images/jsi_caav_comp_0005.jpg',
            '/series-images/jsi_finn_comp_00001.jpg',
        ],
    },
    {
        name: 'Swivels',
        nav: 'products/category/swivels',
        images: [
            '/series-images/jsi_arwyn_comp_0001.jpg',
            '/series-images/jsi_wink_enviro_00033.jpg',
            '/series-images/jsi_protocol_comp_00001.jpg',
        ],
    },
    {
        name: 'Training Tables',
        nav: 'products/category/training-tables',
        images: [
            '/series-images/jsi_moto_config_00001.jpg',
            '/series-images/jsi_connect_comp_00001.jpg',
            '/series-images/jsi_bespace_comp_00001.jpg',
        ],
    },
].sort((a, b) => a.name.localeCompare(b.name));

export const PRODUCT_DATA = {
    'benches': {
        name: 'Benches',
        products: [
            { id: 'native', name: 'Native', price: 1200, image: '/series-images/jsi_native_comp_00001.jpg' },
            { id: 'poet', name: 'Poet', price: 780, image: '/series-images/jsi_poet_comp_00001.jpg' },
            { id: 'indie', name: 'Indie', price: 920, image: '/series-images/jsi_indie_comp_00001.jpg' },
        ],
        competition: []
    },
    'casegoods': {
        name: 'Casegoods',
        products: [
            { id: 'vision', name: 'Vision', price: 3200, image: '/series-images/jsi_vision_config_000002.jpg' },
            { id: 'brogan', name: 'Brogan', price: 2800, image: '/series-images/jsi_brogan_config_00001.jpg' },
            { id: 'finale', name: 'Finale', price: 3500, image: '/series-images/jsi_finale_config_00001.jpg' },
        ],
        competition: []
    },
    'conference-tables': {
        name: 'Conference Tables',
        products: [
            { id: 'vision-table', name: 'Vision', price: 4500, image: '/series-images/jsi_vision_config_000002.jpg' },
            { id: 'reef', name: 'Reef', price: 4200, image: '/series-images/jsi_reef_config_00001.jpg' },
            { id: 'moto', name: 'Moto', price: 4000, image: '/series-images/jsi_moto_config_00001.jpg' },
        ],
        competition: []
    },
    'guest': {
        name: 'Guest',
        products: [
            { id: 'addison', name: 'Addison', price: 600, image: '/series-images/jsi_addison_comp_00015.jpg' },
            { id: 'americana', name: 'Americana', price: 650, image: '/series-images/jsi_americana_comp_00026.jpg' },
            { id: 'boston', name: 'Boston', price: 700, image: '/series-images/jsi_boston_comp_00001.jpg' },
        ],
        competition: []
    },
    'lounge': {
        name: 'Lounge',
        products: [
            { id: 'arwyn', name: 'Arwyn', price: 1500, image: '/series-images/jsi_arwyn_comp_0001.jpg' },
            { id: 'caav', name: 'Cäav', price: 1800, image: '/series-images/jsi_caav_comp_0005.jpg' },
            { id: 'finn', name: 'Finn', price: 1600, image: '/series-images/jsi_finn_comp_00001.jpg' },
        ],
        competition: []
    },
    'swivels': {
        name: 'Swivels',
        products: [
            { id: 'arwyn-swivel', name: 'Arwyn', price: 1300, image: '/series-images/jsi_arwyn_comp_0001.jpg' },
            { id: 'wink', name: 'Wink', price: 500, image: '/series-images/jsi_wink_enviro_00033.jpg' },
            { id: 'protocol', name: 'Protocol', price: 800, image: '/series-images/jsi_protocol_comp_00001.jpg' },
        ],
        competition: []
    },
    'training-tables': {
        name: 'Training Tables',
        products: [
            { id: 'moto-training', name: 'Moto', price: 900, image: '/series-images/jsi_moto_config_00001.jpg' },
            { id: 'connect', name: 'Connect', price: 850, image: '/series-images/jsi_connect_comp_00001.jpg' },
            { id: 'bespace', name: 'BeSpace', price: 950, image: '/series-images/jsi_bespace_comp_00001.jpg' },
        ],
        competition: []
    }
};

export const REPLACEMENT_REQUESTS_DATA = [
    { id: 'req1', product: 'Vision Conference Table', reason: 'Damaged in shipping', status: 'Approved', date: '2023-05-20' },
    { id: 'req2', product: 'Arwyn Swivel Chair', reason: 'Missing parts', status: 'Pending', date: '2023-05-22' },
    { id: 'req3', product: 'Moto Casegood', reason: 'Wrong finish', status: 'Rejected', date: '2023-05-18' },
].sort((a, b) => new Date(b.date) - new Date(a.date));

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

export const STATUS_COLORS = {
    'Discovery': 'bg-blue-200 text-blue-900',
    'Specifying': 'bg-green-200 text-green-900',
    'Decision/Bidding': 'bg-orange-200 text-orange-900',
    'PO Expected': 'bg-purple-200 text-purple-900',
    'Won': 'bg-emerald-200 text-emerald-900',
    'Lost': 'bg-red-200 text-red-900'
};

export const SAMPLE_DISCOUNTS_DATA = [
    {
        id: 'sd001',
        productLine: 'Vision Casegoods',
        category: 'Casegoods',
        sampleDiscount: 15,
        standardDiscount: 10,
        description: 'Enhanced discount for Vision casegoods sample orders',
        minOrderQty: 1,
        leadTime: 4,
        active: true,
        validUntil: '2025-12-31',
        SSANumber: 'VIS001',
        Title: 'Vision Casegoods',
        Discount: '15',
        CommissionInfo: '4 weeks lead time • Enhanced commission rates'
    },
    {
        id: 'sd002',
        productLine: 'Arwyn Seating',
        category: 'Seating',
        sampleDiscount: 20,
        standardDiscount: 15,
        description: 'Premium discount for Arwyn seating samples',
        minOrderQty: 2,
        leadTime: 6,
        active: true,
        validUntil: '2025-12-31',
        SSANumber: 'ARW001',
        Title: 'Arwyn Seating',
        Discount: '20',
        CommissionInfo: '6 weeks lead time • Premium commission rates'
    },
    {
        id: 'sd003',
        productLine: 'Bryn Collection',
        category: 'Seating',
        sampleDiscount: 18,
        standardDiscount: 12,
        description: 'Special pricing for Bryn collection samples',
        minOrderQty: 1,
        leadTime: 5,
        active: true,
        validUntil: '2025-12-31',
        SSANumber: 'BRY001',
        Title: 'Bryn Collection',
        Discount: '18',
        CommissionInfo: '5 weeks lead time • Standard commission rates'
    },
    {
        id: 'sd004',
        productLine: 'Caav Lounge',
        category: 'Lounge',
        sampleDiscount: 25,
        standardDiscount: 18,
        description: 'Exclusive discount for Caav lounge samples',
        minOrderQty: 1,
        leadTime: 8,
        active: true,
        validUntil: '2025-12-31',
        SSANumber: 'CAV001',
        Title: 'Caav Lounge',
        Discount: '25',
        CommissionInfo: '8 weeks lead time • Exclusive commission rates'
    },
    {
        id: 'sd005',
        productLine: 'Wink Task Chairs',
        category: 'Task Seating',
        sampleDiscount: 12,
        standardDiscount: 8,
        description: 'Standard discount for Wink task chair samples',
        minOrderQty: 3,
        leadTime: 3,
        active: true,
        validUntil: '2025-12-31',
        SSANumber: 'WNK001',
        Title: 'Wink Task Chairs',
        Discount: '12',
        CommissionInfo: '3 weeks lead time • Standard commission rates'
    }
];

export const INSTALL_INSTRUCTIONS_DATA = [
    {
        id: 'inst001',
        name: 'Vision Casegoods Assembly',
        type: 'Casegoods',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_config_000002.jpg',
        videoUrl: 'https://example.com/vision-assembly-video',
        pdfUrl: 'https://example.com/vision-assembly-guide.pdf'
    },
    {
        id: 'inst002',
        name: 'Arwyn Chair Installation',
        type: 'Seating',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_arwyn_comp_0001.jpg',
        videoUrl: 'https://example.com/arwyn-chair-video',
        pdfUrl: 'https://example.com/arwyn-chair-guide.pdf'
    },
    {
        id: 'inst003',
        name: 'Caav Lounge Setup',
        type: 'Lounge',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_comp_0005.jpg',
        videoUrl: 'https://example.com/caav-lounge-video',
        pdfUrl: 'https://example.com/caav-lounge-guide.pdf'
    },
    {
        id: 'inst004',
        name: 'Wink Chair Assembly',
        type: 'Task Seating',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_wink_enviro_00033.jpg',
        videoUrl: 'https://example.com/wink-chair-video',
        pdfUrl: 'https://example.com/wink-chair-guide.pdf'
    },
    {
        id: 'inst005',
        name: 'General Table Assembly',
        type: 'Tables',
        thumbnail: 'https://webresources.jsifurniture.com/production/uploads/jsi_ziva_comp_00001.jpg',
        videoUrl: 'https://example.com/table-assembly-video',
        pdfUrl: 'https://example.com/table-assembly-guide.pdf'
    }
];

export const DISCONTINUED_FINISHES = [
    {
        id: 'df001',
        oldName: 'Classic Oak',
        newName: 'Weathered Ash',
        category: 'Wood',
        veneer: 'V001',
        solid: 'S001',
        oldImage: '/jsi_finish_WEA_WeatheredAsh_Laminate.jpg',
        newImage: '/jsi_finish_WEA_WeatheredAsh_Laminate.jpg'
    },
    {
        id: 'df002',
        oldName: 'Traditional Cherry',
        newName: 'Mocha',
        category: 'Wood',
        veneer: 'V002',
        solid: 'S002',
        oldImage: '/jsi_finish_MCH_Mocha_Laminate.jpg',
        newImage: '/jsi_finish_MCH_Mocha_Laminate.jpg'
    },
    {
        id: 'df003',
        oldName: 'Light Maple',
        newName: 'Designer White',
        category: 'Laminate',
        veneer: 'V003',
        solid: 'S003',
        oldImage: '/jsi_finish_DWH_DesignerWhite_Laminate.jpg',
        newImage: '/jsi_finish_DWH_DesignerWhite_Laminate.jpg'
    },
    {
        id: 'df004',
        oldName: 'Dark Walnut',
        newName: 'Walnut Heights',
        category: 'Wood',
        veneer: 'V004',
        solid: 'S004',
        oldImage: '/jsi_finish_WLH_WalnutHeights_Laminate.jpg',
        newImage: '/jsi_finish_WLH_WalnutHeights_Laminate.jpg'
    },
    {
        id: 'df005',
        oldName: 'Espresso',
        newName: 'Shadow',
        category: 'Laminate',
        veneer: 'V005',
        solid: 'S005',
        oldImage: '/jsi_finish_SHD_Shadow_Laminate.jpg',
        newImage: '/jsi_finish_SHD_Shadow_Laminate.jpg'
    }
];

export const SAMPLE_CATEGORIES = [
    { id: 'tfl', name: 'TFL' },
    { id: 'veneer', name: 'Veneer' },
    { id: 'laminate', name: 'Laminate' },
    { id: 'paint', name: 'Paint' },
    { id: 'pulls', name: 'Pulls' },
    { id: 'fabric', name: 'Fabric' },
];

export const SAMPLE_PRODUCTS = [
    // TFL Samples
    { id: 'tfl-001', name: 'Designer White', category: 'tfl', color: '#FFFFFF', image: '/jsi_finish_DWH_DesignerWhite_Laminate.jpg' },
    { id: 'tfl-002', name: 'Shadow', category: 'tfl', color: '#4A4A4A', image: '/jsi_finish_SHD_Shadow_Laminate.jpg' },
    { id: 'tfl-003', name: 'Mocha', category: 'tfl', color: '#6B4F3E', image: '/jsi_finish_MCH_Mocha_Laminate.jpg' },
    { id: 'tfl-004', name: 'Walnut Heights', category: 'tfl', color: '#8A6E5F', image: '/jsi_finish_WLH_WalnutHeights_Laminate.jpg' },

    // Veneer Samples
    { id: 'veneer-001', name: 'Rift Cut Oak', category: 'veneer', image: '/jsi_finish_RCO_RiftCutOak_Veneer.jpg' },
    { id: 'veneer-002', name: 'Smoked Walnut', category: 'veneer', image: '/jsi_finish_SWN_SmokedWalnut_Veneer.jpg' },
    { id: 'veneer-003', name: 'Fumed Eucalyptus', category: 'veneer', image: '/jsi_finish_FEU_FumedEucalyptus_Veneer.jpg' },

    // Laminate Samples
    { id: 'laminate-001', name: 'Nevada Slate', category: 'laminate', image: '/jsi_finish_NSL_NevadaSlate_Laminate.jpg' },
    { id: 'laminate-002', name: 'Urban Concrete', category: 'laminate', image: '/jsi_finish_UCN_UrbanConcrete_Laminate.jpg' },

    // Paint Samples
    { id: 'paint-001', name: 'Cloud White', category: 'paint', color: '#F5F5F5' },
    { id: 'paint-002', name: 'Iron Ore', category: 'paint', color: '#343434' },
    { id: 'paint-003', name: 'Stormy Sky', category: 'paint', color: '#88959E' },

    // Pulls Samples
    { id: 'pull-001', name: 'Bar Pull 6"', category: 'pulls', image: '/jsi_pull_bar_01.jpg' },
    { id: 'pull-002', name: 'Tab Pull', category: 'pulls', image: '/jsi_pull_tab_01.jpg' },
    { id: 'pull-003', name: 'Square Knob', category: 'pulls', image: '/jsi_pull_knob_01.jpg' },
    
    // Fabric Samples
    { id: 'fabric-001', name: 'Eco Wool', category: 'fabric', color: '#D3D3D3' },
    { id: 'fabric-002', name: 'Heritage Tweed', category: 'fabric', color: '#A9A9A9' },
];