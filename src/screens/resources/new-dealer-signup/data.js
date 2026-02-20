// New Dealer Sign-Up specific data
export const BUSINESS_TYPES = [
    { label: 'Dealer', value: 'Dealer' },
    { label: 'Distributor', value: 'Distributor' },
    { label: 'Design Firm', value: 'Design Firm' },
    { label: 'Contractor', value: 'Contractor' },
    { label: 'Other', value: 'Other' }
];

export const INSTALLATION_OPTIONS = [
    { label: 'In-house team', value: 'In-house' },
    { label: 'Subcontracted', value: 'Subcontracted' },
    { label: 'Both', value: 'Both' },
    { label: 'None', value: 'None' }
];

export const MARKETS = [
    'Corporate', 
    'Healthcare', 
    'Education', 
    'Government', 
    'Hospitality', 
    'Religious', 
    'Senior Living', 
    'Other'
];

// Standard stacked-discount options — pull from central constants
export { DISCOUNT_OPTIONS } from '../../../constants/discounts.js';

export const FORM_SECTIONS = [
    {
        id: 'company',
        title: 'Company Information',
        icon: 'Building2'
    },
    {
        id: 'contact',
        title: 'Primary Contact',
        icon: 'Mail'
    },
    {
        id: 'pricing',
        title: 'Pricing Information',
        icon: 'DollarSign'
    },
    {
        id: 'location',
        title: 'Business Location',
        icon: 'MapPin'
    },
    {
        id: 'details',
        title: 'Business Details',
        icon: 'FileText'
    }
];