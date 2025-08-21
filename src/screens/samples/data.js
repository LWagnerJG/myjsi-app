// Enhanced Samples related data with comprehensive finish and material categories
export const FINISH_CATEGORIES = [
    { id: 'tfl', name: 'TFL', description: 'Thermally Fused Laminate' },
    { id: 'hpl', name: 'HPL', description: 'High Pressure Laminate' },
    { id: 'wood', name: 'Wood', description: 'Natural wood finishes' },
    { id: 'metal', name: 'Metal', description: 'Metal surface treatments' },
    { id: 'solid-surface', name: 'Solid Surface', description: 'Solid surface materials' },
    { id: 'polyurethane', name: 'Polyurethane', description: 'Polymer finish coatings' },
    { id: 'glass', name: 'Glass', description: 'Glass surface options' },
    { id: 'plastic', name: 'Plastic', description: 'Plastic material finishes' },
    { id: 'specialty-upholstery', name: 'Specialty Upholstery', description: 'Premium upholstery materials' },
    { id: 'acoustic-panel', name: 'Acoustic Panel', description: 'Sound-absorbing materials' },
];

export const SAMPLE_CATEGORIES = [
    { id: 'finishes', name: 'Finishes' },
    { id: 'textiles', name: 'Textiles' },
    { id: 'hardware', name: 'Hardware' },
];

// Helper for building finish entries using actual public root images
const TFL = (code, name, file, finishType = 'solid') => ({
    id: `tfl-${code.toLowerCase()}`,
    name,
    category: 'tfl',
    finishType,
    color: '#E5E5E5',
    image: `/${file}`,
    code,
    description: `${name} laminate`
});

export const FINISH_SAMPLES = [
    TFL('ALB','Alabaster','jsi_finish_ALB_Alabaster_Laminate.jpg'),
    TFL('BBL','Bridal Blanco','jsi_finish_BBL_BridalBlanco_Laminate.jpg'),
    TFL('BEL','Belair','jsi_finish_BEL_Belair_Laminate.jpg'),
    TFL('BLK','Black','jsi_finish_BLK_Black_Laminate.jpg'),
    TFL('BRD','Brickdust','jsi_finish_BRD_Brickdust_Laminate.jpg'),
    TFL('CLY','Clay','jsi_finish_CLY_Clay_Laminate.jpg'),
    TFL('CSK','Cask','jsi_finish_CSK_Cask_Laminate.jpg'),
    TFL('DWH','Designer White','jsi_finish_DWH_DesignerWhite_Laminate.jpg'),
    TFL('EGR','Egret','jsi_finish_EGR_Egret_Laminate.jpg'),
    TFL('FAW','Fawn','jsi_finish_FAW_Fawn_Laminate.jpg'),
    TFL('FLN','Flint','jsi_finish_FLN_Flint_Laminate.jpg'),
    TFL('FLO','Florence Walnut','jsi_finish_FLO_FlorenceWalnut_Laminate.jpg','woodgrain'),
    TFL('LOF','Loft','jsi_finish_LOF_Loft_Laminate.jpg'),
    TFL('MCH','Mocha','jsi_finish_MCH_Mocha_Laminate.jpg','woodgrain'),
    TFL('MES','Mesa','jsi_finish_MES_Mesa_Laminate.jpg'),
    TFL('MIN','Mineral','jsi_finish_MIN_Mineral_Laminate.jpg','stone'),
    TFL('OBK','Outback','jsi_finish_OBK_Outback_Laminate.jpg','woodgrain'),
    TFL('PIL','Pilsner','jsi_finish_PIL_Pilsner_Laminate.jpg'),
    TFL('PIN','Pinnacle Walnut','jsi_finish_PIN_PinnacleWalnut_Laminate.jpg','woodgrain'),
    TFL('SHD','Shadow','jsi_finish_SHD_Shadow_Laminate.jpg','stone'),
    TFL('SLG','Slate Grey','jsi_finish_SLG_SlateGrey_Laminate.jpg','stone'),
    TFL('UMB','Umber','jsi_finish_UMB_Umber_Laminate.jpg'),
    TFL('VAL','Valley','jsi_finish_VAL_Valley_Laminate.jpg','woodgrain'),
    TFL('WEA','Weathered Ash','jsi_finish_WEA_WeatheredAsh_Laminate.jpg','woodgrain'),
    TFL('WLH','Walnut Heights','jsi_finish_WLH_WalnutHeights_Laminate.jpg','woodgrain'),
    TFL('ZEN','Zen Grey','jsi_finish_ZEN_ZenGrey_Laminate.jpg','solid'),
];

// Legacy sample products (kept) + integrate finish samples
export const SAMPLE_PRODUCTS = [
    { id: '1001', name: 'JSI Laminate Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#E6E6E6', category: 'finishes' },
    { id: '1002', name: 'JSI Veneer Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#D3B8A3', category: 'finishes' },
    { id: '1003', name: 'JSI Paint Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#A9A9A9', category: 'finishes' },
    { id: '1004', name: 'JSI Seating Fabric', image: 'https://i.imgur.com/8nL6YQf.png', color: '#C7AD8E', category: 'textiles' },
    { id: '1005', name: 'JSI Panel Fabric', image: 'https://i.imgur.com/8nL6YQf.png', color: '#AD8A77', category: 'textiles' },
    { id: '1006', name: 'JSI Leather', image: 'https://i.imgur.com/8nL6YQf.png', color: '#594A41', category: 'textiles' },
    { id: '2001', name: 'Vision Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#B3B3B3', category: 'hardware' },
    { id: '2002', name: 'Forge Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#414141', category: 'hardware' },
    { id: '2003', name: 'Brogan Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#707070', category: 'hardware' },
    ...FINISH_SAMPLES.map(finish => ({
        id: finish.id,
        name: finish.name,
        image: finish.image,
        color: finish.color,
        category: 'finishes',
        subcategory: finish.category,
        code: finish.code,
        description: finish.description
    })),
];

export const SAMPLES_DATA = SAMPLE_PRODUCTS;