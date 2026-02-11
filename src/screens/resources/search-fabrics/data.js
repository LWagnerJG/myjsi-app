// Search Fabrics specific data
export const FABRIC_SUPPLIERS = [
    'Arc-Com', 'Camira', 'Carnegie', 'CF Stinson', 'Designtex',
    'Guilford of Maine', 'Knoll', 'Kravet', 'Maharam', 'Momentum',
    'Architex', 'Traditions', 'Kvadrat'
];

export const FABRIC_PATTERNS = [
    'Astor', 'Caldera', 'Crossgrain', 'Dapper', 'Eco Wool',
    'Heritage Tweed', 'Luxe Weave', 'Melange', 'Pixel', 'Prospect',
    'Origin', 'Climb', 'Rigid', 'Mode', 'Beeline', 'Honeycomb',
    'Eco Tweed', 'Remix 3', 'Urban', 'Metro', 'Cityscape',
    'Coastal', 'Maritime', 'Modern', 'Classic', 'Elegance', 'Sophisticate'
];

// JSI series list — imported from the single source of truth
export { JSI_SERIES as JSI_SERIES_OPTIONS } from '../../../data/jsiSeries.js';

export const FABRIC_GRADES = [
    'A', 'B', 'C', 'COL', 'COM', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L1', 'L2'
];

export const FABRIC_TYPES = [
    'Coated', 'Fabric', 'Leather', 'Panel'
];

export const TACKABLE_OPTIONS = [
    'Yes', 'No'
];

// Sample fabric search data for demo purposes
export const SAMPLE_FABRIC_RESULTS = [
    {
        supplier: 'Arc-Com',
        pattern: 'Demo',
        grade: 'A',
        tackable: 'yes',
        textile: 'Fabric',
        series: 'Alden',
        colorways: ['Charcoal', 'Navy', 'Forest'],
        content: '100% Polyester',
        width: '54"',
        durability: '100,000 double rubs'
    },
    {
        supplier: 'Maharam',
        pattern: 'Mode',
        grade: 'B',
        tackable: 'yes',
        textile: 'Fabric',
        series: 'Vision',
        colorways: ['Glacier', 'Stone', 'Ash'],
        content: '75% Wool, 25% Nylon',
        width: '58"',
        durability: '50,000 double rubs'
    }
];

export const SEARCH_FORM_INITIAL = {
    supplier: '',
    pattern: '',
    jsiSeries: '',
    grade: [],
    fabricType: [],
    tackable: []
};