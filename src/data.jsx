/**
 * App-level configuration data
 *
 * Note: Feature-specific data has been migrated to screen folders.
 * This file contains only app-wide navigation and configuration.
 */
import {
    MousePointer, BarChart2, Users, PieChart, Armchair,
    Database, Briefcase, MessageSquare, Package, RotateCw, Search, Paperclip,
    DollarSign, UserPlus, MapPin, Percent, FileText, Calendar, Palette,
    Wrench, MonitorPlay, Share2, Hourglass, Settings, HelpCircle, Send, Gift
} from 'lucide-react';

// Re-export theme data from centralized location
export { lightTheme, darkTheme, logoLight } from './data/theme/themeData.js';

// All available apps/screens for home customization and search
export const allApps = [
    { name: 'Samples', route: 'samples', icon: Package },
    { name: 'Replacements', route: 'replacements', icon: RotateCw },
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
    { name: 'Loaner Pool', route: 'resources/loaner-pool', icon: Package },
    { name: 'Discontinued Finishes', route: 'resources/discontinued-finishes', icon: Palette },
    { name: 'Sample Discounts', route: 'resources/sample-discounts', icon: Percent },
    { name: 'Social Media', route: 'resources/social-media', icon: Share2 },
    { name: 'Customer Ranking', route: 'customer-rank', icon: BarChart2 },
    { name: 'Commissions', route: 'commissions', icon: DollarSign },
    { name: 'Members', route: 'members', icon: Users },
    { name: 'Settings', route: 'settings', icon: Settings },
    { name: 'Help', route: 'help', icon: HelpCircle },
    { name: 'Feedback', route: 'feedback', icon: Send },
    { name: 'Design Days', route: 'resources/tradeshows', icon: Calendar },
    { name: 'Search Fabrics', route: 'resources/search-fabrics', icon: Search },
    { name: 'Request COM Yardage', route: 'resources/request-com-yardage', icon: Paperclip },
    { name: 'Install Instructions', route: 'resources/install-instructions', icon: Wrench },
    { name: 'Presentations', route: 'resources/presentations', icon: MonitorPlay },
    { name: 'Request Field Visit', route: 'resources/request-field-visit', icon: MapPin },
    { name: 'New Dealer Sign-Up', route: 'resources/new-dealer-signup', icon: UserPlus },
    // Marketplace lives in Resources > Marketing & Communication, not on home screen
];

// Default home screen apps (used when user hasn't customized)
export const DEFAULT_HOME_APPS = [
    'orders',
    'sales', 
    'products',
    'resources',
    'projects',
    'community',
    'samples',
    'replacements'
];
