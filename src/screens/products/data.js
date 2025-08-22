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
            { id: 'flux', name: 'Flux', price: 3700, image: localImage('/category-images/casegood-images/jsi_flux_config_00008.jpg') },
            { id: 'brogan', name: 'Brogan', price: 4200, image: localImage('/category-images/casegood-images/jsi_brogan_config_0015.jpg') },
            { id: 'finale', name: 'Finale', price: 4700, image: localImage('/category-images/casegood-images/jsi_finale_config_00013_UWjv5eM.jpg') },
            { id: 'walden', name: 'Walden', price: 5200, image: localImage('/category-images/casegood-images/jsi_walden_config_00001.jpg') },
            { id: 'wellington', name: 'Wellington', price: 5700, image: localImage('/category-images/casegood-images/jsi_wellington_config_00006.jpg') },
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
            { id: 'arwyn-guest', name: 'Arwyn', price: 520, legType: 'wood', image: localImage('/category-images/guest-images/jsi_arwyn_comp_00032.jpg'), thumbScale: 1.4, heroScale: 1.2 },
            { id: 'bourne', name: 'Bourne', price: 560, legType: 'wood', image: localImage('/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg'), thumbScale: 1.3, heroScale: 1.15 },
            { id: 'cosgrove', name: 'Cosgrove', price: 610, legType: 'metal', image: localImage('/category-images/guest-images/jsi_cosgrove_comp_guest_midback_arms_00004.jpg'), thumbScale: 1.5, heroScale: 1.25 },
            { id: 'henley', name: 'Henley', price: 630, legType: 'wood', image: localImage('/category-images/guest-images/jsi_henley_comp_00001.jpg'), thumbScale: 1.5, heroScale: 1.25 },
            { id: 'knox', name: 'Knox', price: 640, legType: 'metal', image: localImage('/category-images/guest-images/jsi_knox_comp_00020.jpg'), thumbScale: 1.8, heroScale: 1.35 },
            { id: 'ramona', name: 'Ramona', price: 660, legType: 'wood', image: localImage('/category-images/guest-images/jsi_ramona_comp_rotation_ra2581f_00001.jpg'), thumbScale: 1.6, heroScale: 1.3 },
            { id: 'ria', name: 'Ria', price: 680, legType: 'metal', image: localImage('/category-images/guest-images/jsi_ria_comp_00007.jpg'), thumbScale: 1.9, heroScale: 1.4 },
            { id: 'satisse', name: 'Satisse', price: 705, legType: 'metal', image: localImage('/category-images/guest-images/jsi_satisse_comp_00001_LwTdLhw.jpg'), thumbScale: 2.0, heroScale: 1.5 },
            { id: 'sosa', name: 'Sosa', price: 720, legType: 'metal', image: localImage('/category-images/guest-images/jsi_sosa_comp_00020.jpg'), thumbScale: 1.7, heroScale: 1.3 },
            { id: 'wink', name: 'Wink', price: 740, legType: 'wood', image: localImage('/category-images/guest-images/jsi_wink_comp_00070.jpg'), thumbScale: 1.9, heroScale: 1.4 },
            { id: 'avini', name: 'Avini', price: 760, legType: 'wood', image: localImage('/category-images/guest-images/jsi_avini_comp_00007.jpg'), thumbScale: 1.7, heroScale: 1.35 },
            { id: 'boston', name: 'Boston', price: 780, legType: 'wood', image: localImage('/category-images/guest-images/jsi_boston_comp_0007_jBfEUNr.jpg'), thumbScale: 1.65, heroScale: 1.3 },
            { id: 'collective-motion', name: 'Collective Motion', price: 800, legType: 'metal', image: localImage('/category-images/guest-images/jsi_collectivemotion_comp_00014.jpg'), thumbScale: 1.6, heroScale: 1.25 },
            { id: 'madison', name: 'Madison', price: 820, legType: 'wood', image: localImage('/category-images/guest-images/jsi_madison_comp_00003.jpg'), thumbScale: 1.6, heroScale: 1.3 },
            { id: 'millie', name: 'Millie', price: 840, legType: 'wood', image: localImage('/category-images/guest-images/jsi_millie_comp_00005_g77W9GX.jpg'), thumbScale: 1.75, heroScale: 1.35 },
            { id: 'totem', name: 'Totem', price: 860, legType: 'wood', image: localImage('/category-images/guest-images/jsi_totem_comp_00003.jpg'), thumbScale: 1.5, heroScale: 1.2 },
            { id: 'harbor', name: 'Harbor', price: 880, legType: 'wood', image: localImage('/category-images/guest-images/jsi_harbor_comp_00010_7pPSeR6.jpg'), thumbScale: 1.55, heroScale: 1.25 },
            { id: 'bryn', name: 'Bryn', price: 900, legType: 'wood', image: localImage('/category-images/guest-images/jsi_bryn_comp_00023.jpg'), thumbScale: 1.6, heroScale: 1.3 }
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
            '/category-images/casegood-images/jsi_flux_config_00008.jpg',
            '/category-images/casegood-images/jsi_brogan_config_0015.jpg'
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