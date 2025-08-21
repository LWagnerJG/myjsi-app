// Products feature specific data (authoritative after migration)
// NOTE: Root data/products.js has been migrated and can be removed.

const localImage = (path) => path; // helper passthrough for public assets

export const PRODUCT_DATA = {
    'benches': {
        name: 'Benches',
        products: [
            { id: 'native', name: 'Native', price: 1200, image: 'https://via.placeholder.com/300x200/E3DBC8/2A2A2A?text=Native+Bench' },
            { id: 'poet', name: 'Poet', price: 780, image: 'https://via.placeholder.com/300x200/D9CDBA/2A2A2A?text=Poet+Bench' },
            { id: 'indie', name: 'Indie', price: 920, image: 'https://via.placeholder.com/300x200/C7AD8E/2A2A2A?text=Indie+Bench' },
        ],
        competition: []
    },
    'casegoods': {
        name: 'Casegoods',
        products: [
            { id: 'vision', name: 'Vision', price: 3200, image: localImage('/category-images/casegood-images/jsi_vision_config_000007.jpg') },
            { id: 'brogan', name: 'Brogan', price: 2800, image: localImage('/category-images/casegood-images/jsi_vision_config_000008.jpg') },
            { id: 'finale', name: 'Finale', price: 3500, image: localImage('/category-images/casegood-images/jsi_vision_config_000001_dkm0wsV.jpg') },
        ],
        competition: []
    },
    'conference-tables': {
        name: 'Conference Tables',
        products: [
            { id: 'vision-table', name: 'Vision', price: 4500, image: localImage('/category-images/conference-images/jsi_anthology_comp_0003_NBW46kS.jpg') },
            { id: 'reef', name: 'Reef', price: 4200, image: localImage('/category-images/conference-images/jsi_anthology_comp_0004_OlfZHks.jpg') },
            { id: 'moto', name: 'Moto', price: 4000, image: localImage('/category-images/conference-images/jsi_anthology_comp_0006.jpg') },
        ],
        competition: []
    },
    'guest': {
        name: 'Guest',
        products: [
            { id: 'addison', name: 'Addison', price: 600, image: 'https://via.placeholder.com/300x200/E3DBC8/2A2A2A?text=Addison+Guest' },
            { id: 'americana', name: 'Americana', price: 650, image: 'https://via.placeholder.com/300x200/D9CDBA/2A2A2A?text=Americana+Guest' },
            { id: 'boston', name: 'Boston', price: 700, image: 'https://via.placeholder.com/300x200/C7AD8E/2A2A2A?text=Boston+Guest' },
        ],
        competition: []
    },
    'lounge': {
        name: 'Lounge',
        products: [
            { id: 'arwyn', name: 'Arwyn', price: 1500, image: 'https://via.placeholder.com/300x200/E3DBC8/2A2A2A?text=Arwyn+Lounge' },
            { id: 'caav', name: 'Cäav', price: 1800, image: 'https://via.placeholder.com/300x200/D9CDBA/2A2A2A?text=Caav+Lounge' },
            { id: 'finn', name: 'Finn', price: 1600, image: 'https://via.placeholder.com/300x200/C7AD8E/2A2A2A?text=Finn+Lounge' },
        ],
        competition: []
    },
    'swivels': {
        name: 'Swivels',
        products: [
            { id: 'arwyn-swivel', name: 'Arwyn', price: 1300, image: 'https://via.placeholder.com/300x200/E3DBC8/2A2A2A?text=Arwyn+Swivel' },
            { id: 'wink', name: 'Wink', price: 500, image: 'https://via.placeholder.com/300x200/D9CDBA/2A2A2A?text=Wink+Swivel' },
            { id: 'protocol', name: 'Protocol', price: 800, image: 'https://via.placeholder.com/300x200/C7AD8E/2A2A2A?text=Protocol+Swivel' },
        ],
        competition: []
    },
    'training-tables': {
        name: 'Training Tables',
        products: [
            { id: 'moto-training', name: 'Moto', price: 900, image: 'https://via.placeholder.com/300x200/E3DBC8/2A2A2A?text=Moto+Training' },
            { id: 'connect', name: 'Connect', price: 850, image: 'https://via.placeholder.com/300x200/D9CDBA/2A2A2A?text=Connect+Training' },
            { id: 'bespace', name: 'BeSpace', price: 950, image: 'https://via.placeholder.com/300x200/C7AD8E/2A2A2A?text=BeSpace+Training' },
        ],
        competition: []
    }
};

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

export const JSI_MODELS = [
    { id: 'AW6007', name: 'Arwyn Swivel Chair', isUpholstered: true },
    { id: 'BR2301', name: 'Bryn Guest Chair', isUpholstered: true },
    { id: 'CV4501', name: 'Caav Lounge Chair', isUpholstered: true },
    { id: 'WK4501', name: 'Wink Task Chair', isUpholstered: true },
    { id: 'KN2301', name: 'Knox Counter Stool', isUpholstered: true },
    { id: 'FN5001', name: 'Finn Lounge Chair', isUpholstered: true },
    { id: 'PT5301', name: 'Poet Barstool', isUpholstered: false },
    { id: 'VCT1248', name: 'Vision Conference Table', isUpholstered: false },
    { id: 'AR6001', name: 'Arwyn Guest Chair', isUpholstered: true },
    { id: 'MD5501', name: 'Madison Lounge Chair', isUpholstered: true },
    { id: 'PR4001', name: 'Protocol Task Chair', isUpholstered: true },
    { id: 'GV2301', name: 'Garvey RS Chair', isUpholstered: true },
    { id: 'HN3001', name: 'Henley Guest Chair', isUpholstered: true },
    { id: 'JD4501', name: 'Jude Lounge Chair', isUpholstered: true },
    { id: 'KL2001', name: 'Kyla Guest Chair', isUpholstered: true }
];

export const JSI_LAMINATES = ['Nevada Slate', 'Urban Concrete', 'Smoked Hickory', 'Arctic Oak', 'Tuscan Marble', 'Brushed Steel', 'Midnight Linen', 'Riverstone Gray', 'Golden Teak', 'Sahara Sand'];

export const JSI_VENEERS = ['Rift Cut Oak', 'Smoked Walnut', 'Figured Anigre', 'Reconstituted Ebony', 'Fumed Eucalyptus', 'Birdseye Maple', 'Cherry Burl', 'Sapele Pommele', 'Zebrawood', 'Koa'];

export const VISION_MATERIALS = ['TFL', 'HPL', 'Veneer'];

// Product categories for main products screen
export const PRODUCTS_CATEGORIES_DATA = [
    {
        name: 'Casegoods',
        description: 'Storage and workspace solutions',
        nav: 'products/category/casegoods',
        images: [
            '/category-images/casegood-images/jsi_vision_config_000007.jpg',
            '/category-images/casegood-images/jsi_vision_config_000008.jpg',
            '/category-images/casegood-images/jsi_vision_config_000001_dkm0wsV.jpg'
        ].map(localImage)
    },
    {
        name: 'Conference Tables',
        description: 'Meeting and collaboration tables',
        nav: 'products/category/conference-tables',
        images: [
            '/category-images/conference-images/jsi_anthology_comp_0003_NBW46kS.jpg',
            '/category-images/conference-images/jsi_anthology_comp_0004_OlfZHks.jpg',
            '/category-images/conference-images/jsi_anthology_comp_0006.jpg'
        ].map(localImage)
    },
    {
        name: 'Guest',
        description: 'Visitor and side seating',
        nav: 'products/category/guest',
        images: [
            '/category-images/guest-images/jsi_arwyn_comp_00032.jpg',
            '/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg',
            '/category-images/guest-images/jsi_knox_comp_00020.jpg'
        ].map(localImage)
    },
    {
        name: 'Lounge',
        description: 'Casual and soft seating',
        nav: 'products/category/lounge',
        images: [
            '/category-images/lounge-images/jsi_arwyn_comp_00002.jpg',
            '/category-images/lounge-images/jsi_indie_comp_00060.jpg',
            '/category-images/lounge-images/jsi_poet_component_00001.jpg'
        ].map(localImage)
    },
    {
        name: 'Swivels',
        description: 'Task and office chairs',
        nav: 'products/category/swivels',
        images: [
            '/category-images/swivel-images/jsi_arwynconference_comp_hi.jpg',
            '/category-images/swivel-images/jsi_cosgrove_comp_hi.jpg',
            '/category-images/swivel-images/jsi_garvey5_comp_00001.jpg'
        ].map(localImage)
    },
    {
        name: 'Training Tables',
        description: 'Flexible training furniture',
        nav: 'products/category/training-tables',
        images: [
            '/category-images/training-images/jsi_lok_comp_00001.jpg',
            '/category-images/training-images/jsi_moto_comp_00001.jpg',
            '/category-images/training-images/jsi_synk_comp_00011.jpg'
        ].map(localImage)
    },
    {
        name: 'Benches',
        description: 'Multi-seat solutions',
        nav: 'products/category/benches',
        images: [
            '/category-images/bench-images/jsi_indie_comp_00040.jpg',
            '/category-images/bench-images/jsi_native_comp_00028.jpg',
            '/category-images/bench-images/jsi_native_comp_00030.jpg'
        ].map(localImage)
    }
];