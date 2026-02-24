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

const TFL_SAMPLES = [
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
].map(s=>({ ...s, width:300, height:300, webp:s.image.replace(/\.jpg$/i,'.webp') }));

const MATERIAL = (category, code, name, color, description, image = '') => ({
    id: `${category}-${code.toLowerCase()}`,
    name,
    category,
    finishType: 'solid',
    color,
    image,
    code,
    description,
    width: 300,
    height: 300,
    webp: image ? image.replace(/\.jpg$/i, '.webp') : ''
});

const MATERIAL_FINISH_SAMPLES = [
    // Hpl
    MATERIAL('hpl', '18034', 'Belair', '#D8D1C6', 'HPL finish', '/finish-images/jsi_finish_BEL_Belair_Laminate_4pIgaYu.jpg'),
    MATERIAL('hpl', '18033', 'Pilsner', '#D8D1C6', 'HPL finish', '/finish-images/jsi_finish_PIL_Pilsner_Laminate_Jv5IC8B.jpg'),
    MATERIAL('hpl', '18032', 'Pinnacle Walnut', '#D8D1C6', 'HPL finish', '/finish-images/jsi_finish_PIN_PinnacleWalnut_Laminate_w2WoL9i.jpg'),
    MATERIAL('hpl', '18031', 'Florence Walnut', '#D8D1C6', 'HPL finish', '/finish-images/jsi_finish_FLO_FlorenceWalnut_Laminate_eCxkyjK.jpg'),
    MATERIAL('hpl', '18030', 'Black', '#D8D1C6', 'HPL finish', '/finish-images/jsi_finish_BLK_Black_Laminate_voKsTRx.jpg'),

    // Wood
    MATERIAL('wood', '18028', 'Fawn', '#A78763', 'Wood finish', '/finish-images/jsi_finish_FAW_Fawn_Veneer_u12K5ts.jpg'),
    MATERIAL('wood', '18027', 'Pilsner', '#A78763', 'Wood finish', '/finish-images/jsi_finish_PIL_Pilsner_Veneer.jpg'),
    MATERIAL('wood', '18025', 'Clay', '#A78763', 'Wood finish', '/finish-images/jsi_finish_CLY_Clay_Veneer.jpg'),
    MATERIAL('wood', '18024', 'Outback', '#A78763', 'Wood finish', '/finish-images/jsi_finish_OBK_Outback_Veneer.jpg'),
    MATERIAL('wood', '18023', 'Flax', '#A78763', 'Wood finish', '/finish-images/jsi_finish_FLX_Flax_Veneer.jpg'),
    MATERIAL('wood', '18022', 'Mesa', '#A78763', 'Wood finish', '/finish-images/jsi_finish_MES_Mesa_Veneer.jpg'),
    MATERIAL('wood', '18021', 'Sienna', '#A78763', 'Wood finish', '/finish-images/jsi_finish_SIE_Sienna_Veneer.jpg'),
    MATERIAL('wood', '18020', 'Brickdust', '#A78763', 'Wood finish', '/finish-images/jsi_finish_BRD_Brickdust_Veneer.jpg'),

    // Metal
    MATERIAL('metal', '19182', 'Porcelain White', '#9AA1A8', 'Metal finish', '/finish-images/POW_PorcelainWhite_Metal.jpg'),
    MATERIAL('metal', '19181', 'Antique Linen', '#9AA1A8', 'Metal finish', '/finish-images/ANL_AntiqueLinen_Metal_mXqnDnP.jpg'),
    MATERIAL('metal', '19180', 'Cashmere Beige', '#9AA1A8', 'Metal finish', '/finish-images/CAB_CashmereBeige_Metal.jpg'),
    MATERIAL('metal', '19179', 'Toffee Brown', '#9AA1A8', 'Metal finish', '/finish-images/TFB_ToffeeBrown_Metal.jpg'),
    MATERIAL('metal', '19178', 'Vintage Mahogany', '#9AA1A8', 'Metal finish', '/finish-images/VMA_VintageMahogany_Metal.jpg'),
    MATERIAL('metal', '19177', 'Copper Dust', '#9AA1A8', 'Metal finish', '/finish-images/CDU_CopperDust_Metal.jpg'),
    MATERIAL('metal', '19176', 'Golden Honey', '#9AA1A8', 'Metal finish', '/finish-images/GOH_GoldenHoney_Metal_qgtNfvv.jpg'),
    MATERIAL('metal', '19175', 'Desert Stone', '#9AA1A8', 'Metal finish', '/finish-images/DST_DesertStone_Metal.jpg'),

    // Solid Surface
    MATERIAL('solid-surface', '17862', 'Designer White', '#C9C5BC', 'Solid surface finish', '/finish-images/jsi_finish_DWH_Designer_White_Solid_Surface.jpg'),
    MATERIAL('solid-surface', '17861', 'Soothing Grey', '#C9C5BC', 'Solid surface finish', '/finish-images/jsi_finish_SOG_Soothing_Grey_Solid_Surface.jpg'),
    MATERIAL('solid-surface', '17860', 'Hot Stone', '#C9C5BC', 'Solid surface finish', '/finish-images/jsi_finish_HST_Hot_Stone_Solid_Surface.jpg'),
    MATERIAL('solid-surface', '17859', 'Black Onyx Mirage', '#C9C5BC', 'Solid surface finish', '/finish-images/jsi_finish_ONX_BlackOnyx_SolidSurface.jpg'),

    // Polyurethane
    MATERIAL('polyurethane', '18036', 'Stone Grey', '#A6A29B', 'Polyurethane finish', '/finish-images/SGU_StoneGrey_Polyurethane.jpg'),
    MATERIAL('polyurethane', '18035', 'Matte Black', '#A6A29B', 'Polyurethane finish', '/finish-images/MBK_MatteBlack_Polyurethane.jpg'),

    // Glass
    MATERIAL('glass', '3390', 'Matte Black Back Painted Glass', '#CDD7DC', 'Glass finish', '/finish-images/jsi_glass_black.jpg'),
    MATERIAL('glass', '1503', 'Smoke Glass', '#CDD7DC', 'Glass finish', '/finish-images/jsi_glass_smoke_ATKD42m.jpg'),
    MATERIAL('glass', '1502', 'White Back Painted Glass', '#CDD7DC', 'Glass finish', '/finish-images/jsi_glass_white_QquGFN5.jpg'),
    MATERIAL('glass', '1501', 'Clear Glass', '#CDD7DC', 'Glass finish', '/finish-images/jsi_glass_clear.jpg'),

    // Plastic
    MATERIAL('plastic', '1531', 'Toile Red', '#A7A39E', 'Plastic finish', '/finish-images/jsi_plastic_toilered_YsxXwBJ.jpg'),
    MATERIAL('plastic', '1530', 'Thunderous Green', '#A7A39E', 'Plastic finish', '/finish-images/jsi_plastic_thunderousgreen_tHlvxbB.jpg'),
    MATERIAL('plastic', '1529', 'Kiwi Green', '#A7A39E', 'Plastic finish', '/finish-images/jsi_plastic_kiwigreen_4EJYCHk.jpg'),
    MATERIAL('plastic', '1528', 'Refuge Blue', '#A7A39E', 'Plastic finish', '/finish-images/jsi_plastic_refugeblue_wXalKQV.jpg'),
    MATERIAL('plastic', '1527', 'Navy Blue', '#A7A39E', 'Plastic finish', '/finish-images/jsi_plastic_navy_HnzzDcJ.jpg'),
    MATERIAL('plastic', '1102', 'Bright White', '#A7A39E', 'Plastic finish', '/finish-images/jsi_plastic_brightwhite_bPwkoum.jpg'),
    MATERIAL('plastic', '1083', 'Hearthstone Gray', '#A7A39E', 'Plastic finish', '/finish-images/jsi_plastic_heartstonegray.jpg'),
    MATERIAL('plastic', '1082', 'Dancing Green', '#A7A39E', 'Plastic finish', '/finish-images/jsi_plastic_dancinggreen.jpg'),

    // Specialty Upholstery
    MATERIAL('specialty-upholstery', '1474', 'Barely Blue', '#7D7266', 'Specialty upholstery sample', '/finish-images/jsi_knitback_barelyblue.jpg'),
    MATERIAL('specialty-upholstery', '1473', 'Dancing Silver', '#7D7266', 'Specialty upholstery sample', '/finish-images/jsi_knitback_dancingsilver_GXfa02n.jpg'),
    MATERIAL('specialty-upholstery', '1472', 'Jet Black', '#7D7266', 'Specialty upholstery sample', '/finish-images/jsi_knitback_jetblack_3Q9rP4A.jpg'),
    MATERIAL('specialty-upholstery', '1471', 'Rockin\' Red', '#7D7266', 'Specialty upholstery sample', '/finish-images/jsi_knitback_rockinred_elU9NnG.jpg'),
    MATERIAL('specialty-upholstery', '1470', 'Sandy Beige', '#7D7266', 'Specialty upholstery sample', '/finish-images/jsi_knitback_sandybeige_7ieP5IY.jpg'),
    MATERIAL('specialty-upholstery', '1469', 'White River', '#7D7266', 'Specialty upholstery sample', '/finish-images/jsi_knitback_whiteriver_KnvgKSS.jpg'),
    MATERIAL('specialty-upholstery', '18288', 'Black Faux Leather', '#7D7266', 'Specialty upholstery sample', '/finish-images/jsi_black_faux_leather.jpg'),

    // Acoustic Panel
    MATERIAL('acoustic-panel', '1509', 'Ash Grey', '#8A8D90', 'Acoustic panel sample', '/finish-images/jsi_acou_ashgrey.jpg'),
    MATERIAL('acoustic-panel', '1508', 'Silver Grey', '#8A8D90', 'Acoustic panel sample', '/finish-images/jsi_acou_silvergrey.jpg'),
    MATERIAL('acoustic-panel', '1507', 'White', '#8A8D90', 'Acoustic panel sample', '/finish-images/jsi_acou_white.jpg'),
    MATERIAL('acoustic-panel', '1506', 'Milky', '#8A8D90', 'Acoustic panel sample', '/finish-images/jsi_acou_milky.jpg'),
    MATERIAL('acoustic-panel', '1505', 'Cream', '#8A8D90', 'Acoustic panel sample', '/finish-images/jsi_acou_cream.jpg'),
    MATERIAL('acoustic-panel', '1504', 'Grey', '#8A8D90', 'Acoustic panel sample', '/finish-images/jsi_acou_grey.jpg'),

];

export const FINISH_SAMPLES = [...TFL_SAMPLES, ...MATERIAL_FINISH_SAMPLES];

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
