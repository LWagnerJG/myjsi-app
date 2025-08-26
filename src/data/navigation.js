// Navigation menu data
import {
    MousePointer, PieChart, Armchair, Database, Briefcase, MessageSquare, 
    Package, RotateCw, Users, DollarSign, FileText, Palette, Percent, 
    Share2, BarChart2, Settings, HelpCircle, Send, Calendar, Hourglass
} from 'lucide-react';

export const MENU_ITEMS = [
    { id: 'orders', icon: MousePointer, label: 'Orders' }, 
    { id: 'sales', icon: PieChart, label: 'Sales' }, 
    { id: 'products', icon: Armchair, label: 'Products' }, 
    { id: 'resources', icon: Database, label: 'Resources' }, 
    { id: 'projects', icon: Briefcase, label: 'Projects' }, 
    { id: 'community', icon: MessageSquare, label: 'Community' }, 
    { id: 'samples', icon: Package, label: 'Samples' }, 
    { id: 'replacements', icon: RotateCw, label: 'Replacements' }
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
    { name: 'Tradeshows', route: 'resources/tradeshows', icon: Calendar },
];