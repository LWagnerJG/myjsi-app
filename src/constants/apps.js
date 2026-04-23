import {
    MousePointer, BarChart2, Users, PieChart, Armchair,
    Database, Briefcase, MessageSquare, Package, RotateCw, Search, Paperclip,
    DollarSign, UserPlus, MapPin, Percent, FileText, Calendar, Palette,
    Wrench, MonitorPlay, Share2, Hourglass, Settings, HelpCircle, Send, Gift, FilePlus,
    BrainCircuit,
} from 'lucide-react';

// All available apps/screens for home customization and search
export const allApps = [
    { name: 'Samples', route: 'samples', icon: Package, desc: 'Order finish and fabric samples' },
    { name: 'Replacements', route: 'replacements', icon: RotateCw, desc: 'Request replacement parts' },
    { name: 'Community', route: 'community', icon: MessageSquare, desc: 'Connect with reps and designers' },
    { name: 'Lead Times', route: 'resources/lead-times', icon: Hourglass, desc: 'Current production lead times' },
    { name: 'Products', route: 'products', icon: Armchair, desc: 'Browse the full JSI catalog' },
    { name: 'Orders', route: 'orders', icon: MousePointer, desc: 'Track and manage your orders' },
    { name: 'Sales', route: 'sales', icon: PieChart, desc: 'View sales data and project momentum' },
    { name: 'Projects', route: 'projects', icon: Briefcase, desc: 'Manage active project specs' },
    { name: 'Add New Project', route: 'new-lead', icon: FilePlus, desc: 'Start a new project or lead' },
    { name: 'Resources', route: 'resources', icon: Database, desc: 'Tools, docs, and references' },
    { name: 'Dealer Directory', route: 'resources/dealer-directory', icon: Users, desc: 'Find dealers by location' },
    { name: 'Commission Rates', route: 'resources/commission-rates', icon: DollarSign, desc: 'View current commission rates' },
    { name: 'Contracts', route: 'resources/contracts', icon: FileText, desc: 'Access dealer contracts' },
    { name: 'Loaner Pool', route: 'resources/loaner-pool', icon: Package, desc: 'Reserve loaner furniture' },
    { name: 'Discontinued Finishes', route: 'resources/discontinued-finishes', icon: Palette, desc: 'Check discontinued finish status' },
    { name: 'Sample Discounts', route: 'resources/sample-discounts', icon: Percent, desc: 'Current sample discount programs' },
    { name: 'Social Media', route: 'resources/social-media', icon: Share2, desc: 'JSI social media assets' },
    { name: 'Customer Ranking', route: 'customer-rank', icon: BarChart2, desc: 'See top customers by volume' },
    { name: 'Commissions', route: 'commissions', icon: DollarSign, desc: 'Track your commission earnings' },
    { name: 'Members', route: 'members', icon: Users, desc: 'View team members' },
    { name: 'Settings', route: 'settings', icon: Settings, desc: 'App preferences and account' },
    { name: 'Help', route: 'help', icon: HelpCircle, desc: 'Get support and FAQs' },
    { name: 'Feedback', route: 'feedback', icon: Send, desc: 'Share ideas to improve MyJSI' },
    { name: 'Design Days', route: 'resources/tradeshows', icon: Calendar, desc: 'Upcoming events and tradeshows' },
    { name: 'Search Fabrics', route: 'resources/search-fabrics', icon: Search, desc: 'Find fabrics by name or color' },
    { name: 'Request COM Yardage', route: 'resources/request-com-yardage', icon: Paperclip, desc: 'Submit COM yardage requests' },
    { name: 'Install Instructions', route: 'resources/install-instructions', icon: Wrench, desc: 'Product install guides' },
    { name: 'Presentations', route: 'resources/presentations', icon: MonitorPlay, desc: 'Build and share presentations' },
    { name: 'Request Field Visit', route: 'resources/request-field-visit', icon: MapPin, desc: 'Schedule a JSI field visit' },
    { name: 'New Dealer Sign-Up', route: 'resources/new-dealer-signup', icon: UserPlus, homeEligible: false, desc: 'Register a new dealer' },
    { name: 'RFP Responder', route: 'rfp-responder', icon: BrainCircuit, desc: 'Analyze an RFP and build a response' },
];

// Default home screen apps (used when user hasn't customized)
export const DEFAULT_HOME_APPS = [
    'orders',
    'sales', 
    'products',
    'resources',
    'projects',
    'new-lead',
    'community',
    'samples',
    'replacements'
];
