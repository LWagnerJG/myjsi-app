// Enhanced Samples related data with comprehensive finish and material categories

/**
 * Enum-like frozen object of finish category ids for safer ref usage.
 */
export const FINISH_CATEGORY_IDS = Object.freeze({
    TFL: 'tfl',
    HPL: 'hpl',
    WOOD: 'wood',
    METAL: 'metal',
    SOLID_SURFACE: 'solid-surface',
    POLYURETHANE: 'polyurethane',
    GLASS: 'glass',
    PLASTIC: 'plastic',
    SPECIALTY_UPHOLSTERY: 'specialty-upholstery',
    ACOUSTIC_PANEL: 'acoustic-panel'
});

/**
 * High-level sample categories (legacy grouping)
 */
export const SAMPLE_CATEGORY_IDS = Object.freeze({
    FINISHES: 'finishes',
    TEXTILES: 'textiles',
    HARDWARE: 'hardware'
});

export const FINISH_CATEGORIES = [
    { id: FINISH_CATEGORY_IDS.TFL, name: 'TFL', description: 'Thermally Fused Laminate' },
    { id: FINISH_CATEGORY_IDS.HPL, name: 'HPL', description: 'High Pressure Laminate' },
    { id: FINISH_CATEGORY_IDS.WOOD, name: 'Wood', description: 'Natural wood finishes' },
    { id: FINISH_CATEGORY_IDS.METAL, name: 'Metal', description: 'Metal surface treatments' },
    { id: FINISH_CATEGORY_IDS.SOLID_SURFACE, name: 'Solid Surface', description: 'Solid surface materials' },
    { id: FINISH_CATEGORY_IDS.POLYURETHANE, name: 'Polyurethane', description: 'Polymer finish coatings' },
    { id: FINISH_CATEGORY_IDS.GLASS, name: 'Glass', description: 'Glass surface options' },
    { id: FINISH_CATEGORY_IDS.PLASTIC, name: 'Plastic', description: 'Plastic material finishes' },
    { id: FINISH_CATEGORY_IDS.SPECIALTY_UPHOLSTERY, name: 'Specialty Upholstery', description: 'Premium upholstery materials' },
    { id: FINISH_CATEGORY_IDS.ACOUSTIC_PANEL, name: 'Acoustic Panel', description: 'Sound-absorbing materials' },
];

export const SAMPLE_CATEGORIES = [
    { id: SAMPLE_CATEGORY_IDS.FINISHES, name: 'Finishes' },
    { id: SAMPLE_CATEGORY_IDS.TEXTILES, name: 'Textiles' },
    { id: SAMPLE_CATEGORY_IDS.HARDWARE, name: 'Hardware' },
];

/**
 * @typedef {Object} FinishSample
 * @property {string} id Unique id (category-prefixed)
 * @property {string} name Display name
 * @property {string} category One of FINISH_CATEGORY_IDS values
 * @property {string|null} finishType Sub-grouping for UI (e.g. stone, solid, woodgrain, metallic) or null if not applicable
 * @property {string} color Hex color or "transparent"
 * @property {string} image Relative image path
 * @property {string} code Short marketing code
 * @property {string} description Human friendly description
 */

// Helper factory (kept lightweight; optional but aids consistency)
const fsItem = (o) => ({ finishType: null, ...o });

// Comprehensive finish samples data using actual image files
/** @type {FinishSample[]} */
export const FINISH_SAMPLES = [
    // TFL finishes (add finishType for grouping on UI)
    { id: 'tfl-001', name: 'Nevada Slate', category: FINISH_CATEGORY_IDS.TFL, finishType: 'stone', color: '#4A5568', image: '/finish-images/jsi_finish_NVS_Nevada_Slate_Laminate.jpg', code: 'NVS', description: 'Modern slate gray TFL' },
    { id: 'tfl-002', name: 'Urban Concrete', category: FINISH_CATEGORY_IDS.TFL, finishType: 'stone', color: '#718096', image: '/finish-images/jsi_finish_URB_Urban_Concrete_Laminate.jpg', code: 'URB', description: 'Industrial concrete texture TFL' },
    { id: 'tfl-003', name: 'Arctic Oak', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#E2E8F0', image: '/finish-images/jsi_finish_ARO_Arctic_Oak_Laminate.jpg', code: 'ARO', description: 'Light oak wood grain TFL' },
    { id: 'tfl-004', name: 'Tuscan Marble', category: FINISH_CATEGORY_IDS.TFL, finishType: 'stone', color: '#F7FAFC', image: '/finish-images/jsi_finish_TUS_Tuscan_Marble_Laminate.jpg', code: 'TUS', description: 'Elegant marble pattern TFL' },
    { id: 'tfl-005', name: 'Brushed Steel', category: FINISH_CATEGORY_IDS.TFL, finishType: 'metallic', color: '#A0AEC0', image: '/finish-images/jsi_finish_BRS_Brushed_Steel_Laminate.jpg', code: 'BRS', description: 'Metallic steel finish TFL' },
    { id: 'tfl-006', name: 'Sahara Sand', category: FINISH_CATEGORY_IDS.TFL, finishType: 'stone', color: '#F7E6C9', image: '/finish-images/jsi_finish_SAH_Sahara_Sand_Laminate.jpg', code: 'SAH', description: 'Desert sand texture TFL' },
    { id: 'tfl-007', name: 'Alabaster', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#F8F8FF', image: '/finish-images/jsi_finish_ALB_Alabaster_Laminate.jpg', code: 'ALB', description: 'Pure alabaster white TFL' },
    { id: 'tfl-008', name: 'Belair', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#D3D3D3', image: '/finish-images/jsi_finish_BEL_Belair_Laminate.jpg', code: 'BEL', description: 'Sophisticated gray TFL' },
    { id: 'tfl-009', name: 'Black', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#000000', image: '/finish-images/jsi_finish_BLK_Black_Laminate.jpg', code: 'BLK', description: 'Deep black TFL' },
    { id: 'tfl-010', name: 'Bordeaux', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#722F37', image: '/finish-images/jsi_finish_BRD_Bordeaux_Laminate.jpg', code: 'BRD', description: 'Rich burgundy TFL' },
    { id: 'tfl-011', name: 'Clay', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#B87333', image: '/finish-images/jsi_finish_CLY_Clay_Laminate.jpg', code: 'CLY', description: 'Earthy clay TFL' },
    { id: 'tfl-012', name: 'Cask', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#8B4513', image: '/finish-images/jsi_finish_CSK_Cask_Laminate.jpg', code: 'CSK', description: 'Warm cask brown TFL' },
    { id: 'tfl-013', name: 'Driftwood Elite', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#A0A0A0', image: '/finish-images/jsi_finish_DWE_Driftwood_Elite_Laminate.jpg', code: 'DWE', description: 'Premium driftwood texture TFL' },
    { id: 'tfl-014', name: 'Egret', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#F5F5DC', image: '/finish-images/jsi_finish_EGR_Egret_Laminate.jpg', code: 'EGR', description: 'Soft egret white TFL' },
    { id: 'tfl-015', name: 'Fawn', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#D2B48C', image: '/finish-images/jsi_finish_FAW_Fawn_Laminate.jpg', code: 'FAW', description: 'Gentle fawn beige TFL' },
    { id: 'tfl-016', name: 'Florence Walnut', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#5D4037', image: '/finish-images/jsi_finish_FLO_Florence_Walnut_Laminate.jpg', code: 'FLO', description: 'Rich walnut grain TFL' },
    { id: 'tfl-017', name: 'Loft', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#696969', image: '/finish-images/jsi_finish_LOF_Loft_Laminate.jpg', code: 'LOF', description: 'Industrial loft texture TFL' },
    { id: 'tfl-018', name: 'Mocha', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#3C2414', image: '/finish-images/jsi_finish_MCH_Mocha_Laminate.jpg', code: 'MCH', description: 'Deep mocha brown TFL' },
    { id: 'tfl-019', name: 'Mesa', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#CD853F', image: '/finish-images/jsi_finish_MES_Mesa_Laminate.jpg', code: 'MES', description: 'Desert mesa texture TFL' },
    { id: 'tfl-020', name: 'Mineral', category: FINISH_CATEGORY_IDS.TFL, finishType: 'stone', color: '#708090', image: '/finish-images/jsi_finish_MIN_Mineral_Laminate.jpg', code: 'MIN', description: 'Natural mineral texture TFL' },
    { id: 'tfl-021', name: 'Outback', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#8B7355', image: '/finish-images/jsi_finish_OBK_Outback_Laminate.jpg', code: 'OBK', description: 'Rugged outback texture TFL' },
    { id: 'tfl-022', name: 'Pilsner', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#DAA520', image: '/finish-images/jsi_finish_PIL_Pilsner_Laminate.jpg', code: 'PIL', description: 'Golden pilsner finish TFL' },
    { id: 'tfl-023', name: 'Pinnacle Walnut', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#654321', image: '/finish-images/jsi_finish_PIN_PinnacleWalnut_Laminate.jpg', code: 'PIN', description: 'Premium walnut grain TFL' },
    { id: 'tfl-024', name: 'Shadow', category: FINISH_CATEGORY_IDS.TFL, finishType: 'stone', color: '#2F4F4F', image: '/finish-images/jsi_finish_SHD_Shadow_Laminate.jpg', code: 'SHD', description: 'Deep shadow texture TFL' },
    { id: 'tfl-025', name: 'Umber', category: FINISH_CATEGORY_IDS.TFL, finishType: 'solid', color: '#4A4A4A', image: '/finish-images/jsi_finish_UMB_Umber_Laminate.jpg', code: 'UMB', description: 'Rich umber brown TFL' },
    { id: 'tfl-026', name: 'Valley', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#556B2F', image: '/finish-images/jsi_finish_VAL_Valley_Laminate.jpg', code: 'VAL', description: 'Valley green texture TFL' },
    { id: 'tfl-027', name: 'Weathered Ash', category: FINISH_CATEGORY_IDS.TFL, finishType: 'woodgrain', color: '#9E9E9E', image: '/finish-images/jsi_finish_WEA_WeatheredAsh_Laminate.jpg', code: 'WEA', description: 'Weathered ash grain TFL' },

    // HPL finishes (added finishType null for consistency)
    { id: 'hpl-001', name: 'Smoked Hickory', category: FINISH_CATEGORY_IDS.HPL, finishType: 'woodgrain', color: '#744210', image: '/finish-images/jsi_finish_SHO_Smoked_Hickory_Laminate.jpg', code: 'SHO', description: 'Dark wood grain HPL' },
    { id: 'hpl-002', name: 'Midnight Linen', category: FINISH_CATEGORY_IDS.HPL, finishType: 'fabric', color: '#2D3748', image: '/finish-images/jsi_finish_MNL_Midnight_Linen_Laminate.jpg', code: 'MNL', description: 'Dark fabric texture HPL' },
    { id: 'hpl-003', name: 'Riverstone Gray', category: FINISH_CATEGORY_IDS.HPL, finishType: 'stone', color: '#4A5568', image: '/finish-images/jsi_finish_RSG_Riverstone_Gray_Laminate.jpg', code: 'RSG', description: 'Natural stone texture HPL' },
    { id: 'hpl-004', name: 'Golden Teak', category: FINISH_CATEGORY_IDS.HPL, finishType: 'woodgrain', color: '#C69C6D', image: '/finish-images/jsi_finish_GTK_Golden_Teak_Laminate.jpg', code: 'GTK', description: 'Warm teak wood grain HPL' },

    // Wood finishes
    { id: 'wood-001', name: 'Light Maple', category: FINISH_CATEGORY_IDS.WOOD, finishType: 'wood', color: '#E8D5B7', image: '/finish-images/jsi_finish_LMP_Light_Maple_Wood.jpg', code: 'LMP', description: 'Natural light maple' },
    { id: 'wood-002', name: 'Medium Cherry', category: FINISH_CATEGORY_IDS.WOOD, finishType: 'wood', color: '#B5651D', image: '/finish-images/jsi_finish_CHR_Cherry_Wood.jpg', code: 'CHR', description: 'Classic cherry finish' },
    { id: 'wood-003', name: 'Dark Walnut', category: FINISH_CATEGORY_IDS.WOOD, finishType: 'wood', color: '#5D4037', image: '/finish-images/jsi_finish_WAL_Walnut_Wood.jpg', code: 'WAL', description: 'Rich walnut stain' },
    { id: 'wood-004', name: 'Natural Oak', category: FINISH_CATEGORY_IDS.WOOD, finishType: 'wood', color: '#D7B899', image: '/finish-images/jsi_finish_OAK_Oak_Wood.jpg', code: 'OAK', description: 'Traditional oak finish' },
    { id: 'wood-005', name: 'Espresso', category: FINISH_CATEGORY_IDS.WOOD, finishType: 'wood', color: '#3E2723', image: '/finish-images/jsi_finish_ESP_Espresso_Wood.jpg', code: 'ESP', description: 'Deep espresso stain' },
    { id: 'wood-006', name: 'Honey Pine', category: FINISH_CATEGORY_IDS.WOOD, finishType: 'wood', color: '#DEB887', image: '/finish-images/jsi_finish_PIN_Pine_Wood.jpg', code: 'PIN', description: 'Warm honey pine' },

    // Metal finishes
    { id: 'metal-001', name: 'Polished Chrome', category: FINISH_CATEGORY_IDS.METAL, finishType: 'metal', color: '#E8E8E8', image: '/finish-images/jsi_finish_CHR_Chrome_Metal.jpg', code: 'CHR', description: 'Mirror chrome finish' },
    { id: 'metal-002', name: 'Brushed Aluminum', category: FINISH_CATEGORY_IDS.METAL, finishType: 'metal', color: '#C0C0C0', image: '/finish-images/jsi_finish_ALU_Aluminum_Metal.jpg', code: 'ALU', description: 'Satin aluminum texture' },
    { id: 'metal-003', name: 'Black Powder Coat', category: FINISH_CATEGORY_IDS.METAL, finishType: 'metal', color: '#1A1A1A', image: '/finish-images/jsi_finish_BPC_Black_Powder_Coat.jpg', code: 'BPC', description: 'Matte black coating' },
    { id: 'metal-004', name: 'Bronze Finish', category: FINISH_CATEGORY_IDS.METAL, finishType: 'metal', color: '#CD7F32', image: '/finish-images/jsi_finish_BRZ_Bronze_Metal.jpg', code: 'BRZ', description: 'Antique bronze patina' },
    { id: 'metal-005', name: 'Stainless Steel', category: FINISH_CATEGORY_IDS.METAL, finishType: 'metal', color: '#B8B8B8', image: '/finish-images/jsi_finish_STL_Steel_Metal.jpg', code: 'STL', description: 'Brushed stainless steel' },

    // Solid Surface
    { id: 'solid-001', name: 'Glacier White', category: FINISH_CATEGORY_IDS.SOLID_SURFACE, finishType: 'solid', color: '#FFFFFF', image: '/finish-images/jsi_finish_GLW_Glacier_White_Solid.jpg', code: 'GLW', description: 'Pure white solid surface' },
    { id: 'solid-002', name: 'Storm Gray', category: FINISH_CATEGORY_IDS.SOLID_SURFACE, finishType: 'solid', color: '#6B7280', image: '/finish-images/jsi_finish_STG_Storm_Gray_Solid.jpg', code: 'STG', description: 'Contemporary gray surface' },
    { id: 'solid-003', name: 'Bone', category: FINISH_CATEGORY_IDS.SOLID_SURFACE, finishType: 'solid', color: '#F5F5DC', image: '/finish-images/jsi_finish_BON_Bone_Solid.jpg', code: 'BON', description: 'Warm bone color' },

    // Polyurethane
    { id: 'poly-001', name: 'Clear Matte', category: FINISH_CATEGORY_IDS.POLYURETHANE, finishType: 'clear-coat', color: 'transparent', image: '/finish-images/jsi_finish_CMT_Clear_Matte_Poly.jpg', code: 'CMT', description: 'Matte polyurethane coating' },
    { id: 'poly-002', name: 'Clear Gloss', category: FINISH_CATEGORY_IDS.POLYURETHANE, finishType: 'clear-coat', color: 'transparent', image: '/finish-images/jsi_finish_CGL_Clear_Gloss_Poly.jpg', code: 'CGL', description: 'High-gloss polyurethane' },
    { id: 'poly-003', name: 'Satin Clear', category: FINISH_CATEGORY_IDS.POLYURETHANE, finishType: 'clear-coat', color: 'transparent', image: '/finish-images/jsi_finish_SCL_Satin_Clear_Poly.jpg', code: 'SCL', description: 'Satin polyurethane finish' },

    // Glass
    { id: 'glass-001', name: 'Clear Glass', category: FINISH_CATEGORY_IDS.GLASS, finishType: 'glass', color: 'transparent', image: '/finish-images/jsi_finish_CLR_Clear_Glass.jpg', code: 'CLR', description: 'Standard clear glass' },
    { id: 'glass-002', name: 'Frosted Glass', category: FINISH_CATEGORY_IDS.GLASS, finishType: 'glass', color: '#F8F8FF', image: '/finish-images/jsi_finish_FRS_Frosted_Glass.jpg', code: 'FRS', description: 'Etched frosted glass' },
    { id: 'glass-003', name: 'Tinted Gray', category: FINISH_CATEGORY_IDS.GLASS, finishType: 'glass', color: '#A9A9A9', image: '/finish-images/jsi_finish_TGY_Tinted_Gray_Glass.jpg', code: 'TGY', description: 'Gray tinted glass' },

    // Plastic
    { id: 'plastic-001', name: 'White Thermoplastic', category: FINISH_CATEGORY_IDS.PLASTIC, finishType: 'plastic', color: '#FFFFFF', image: '/finish-images/jsi_finish_WTP_White_Plastic.jpg', code: 'WTP', description: 'Durable white plastic' },
    { id: 'plastic-002', name: 'Black ABS', category: FINISH_CATEGORY_IDS.PLASTIC, finishType: 'plastic', color: '#000000', image: '/finish-images/jsi_finish_BAB_Black_ABS_Plastic.jpg', code: 'BAB', description: 'Black ABS plastic' },
    { id: 'plastic-003', name: 'Gray Polypropylene', category: FINISH_CATEGORY_IDS.PLASTIC, finishType: 'plastic', color: '#808080', image: '/finish-images/jsi_finish_GPP_Gray_Plastic.jpg', code: 'GPP', description: 'Gray recycled plastic' },

    // Specialty Upholstery
    { id: 'upholstery-001', name: 'Premium Leather', category: FINISH_CATEGORY_IDS.SPECIALTY_UPHOLSTERY, finishType: 'leather', color: '#8B4513', image: '/finish-images/jsi_finish_PRL_Premium_Leather.jpg', code: 'PRL', description: 'Top-grain leather' },
    { id: 'upholstery-002', name: 'Vinyl Contract', category: FINISH_CATEGORY_IDS.SPECIALTY_UPHOLSTERY, finishType: 'vinyl', color: '#2F4F4F', image: '/finish-images/jsi_finish_VCT_Vinyl_Contract.jpg', code: 'VCT', description: 'Commercial grade vinyl' },
    { id: 'upholstery-003', name: 'Mesh Performance', category: FINISH_CATEGORY_IDS.SPECIALTY_UPHOLSTERY, finishType: 'mesh', color: '#4682B4', image: '/finish-images/jsi_finish_MSH_Mesh_Performance.jpg', code: 'MSH', description: 'Breathable mesh fabric' },

    // Acoustic Panel
    { id: 'acoustic-001', name: 'Fabric Wrapped Panel', category: FINISH_CATEGORY_IDS.ACOUSTIC_PANEL, finishType: 'panel', color: '#D3D3D3', image: '/finish-images/jsi_finish_FWP_Fabric_Wrapped_Panel.jpg', code: 'FWP', description: 'Sound-absorbing fabric panel' },
    { id: 'acoustic-002', name: 'Perforated Wood', category: FINISH_CATEGORY_IDS.ACOUSTIC_PANEL, finishType: 'panel', color: '#DEB887', image: '/finish-images/jsi_finish_PWD_Perforated_Wood_Panel.jpg', code: 'PWD', description: 'Perforated wood acoustic panel' },
    { id: 'acoustic-003', name: 'Metal Mesh Panel', category: FINISH_CATEGORY_IDS.ACOUSTIC_PANEL, finishType: 'panel', color: '#C0C0C0', image: '/finish-images/jsi_finish_MMP_Metal_Mesh_Panel.jpg', code: 'MMP', description: 'Metal mesh acoustic treatment' },
];

// Derived lookup maps (frozen for safety)
export const FINISH_SAMPLES_BY_ID = Object.freeze(Object.fromEntries(FINISH_SAMPLES.map(s => [s.id, s])));
export const FINISH_SAMPLES_BY_CODE = Object.freeze(Object.fromEntries(FINISH_SAMPLES.map(s => [s.code, s])));
export const FINISH_SAMPLES_BY_CATEGORY = Object.freeze(
    FINISH_SAMPLES.reduce((acc, s) => {
        (acc[s.category] = acc[s.category] || []).push(s);
        return acc;
    }, {})
);

/** Quick selectors */
export const getFinishSampleById = (id) => FINISH_SAMPLES_BY_ID[id] || null;
export const getFinishSampleByCode = (code) => FINISH_SAMPLES_BY_CODE[code] || null;
export const getFinishSamplesByCategory = (categoryId) => FINISH_SAMPLES_BY_CATEGORY[categoryId] ? [...FINISH_SAMPLES_BY_CATEGORY[categoryId]] : [];

// Legacy sample products for backwards compatibility
// NOTE: Keeping original numeric-like ids to avoid breakage; introduce upgrade helper for future migration.
const LEGACY_BASE_PRODUCTS = [
    { id: '1001', name: 'JSI Laminate Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#E6E6E6', category: SAMPLE_CATEGORY_IDS.FINISHES },
    { id: '1002', name: 'JSI Veneer Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#D3B8A3', category: SAMPLE_CATEGORY_IDS.FINISHES },
    { id: '1003', name: 'JSI Paint Chip', image: 'https://i.imgur.com/8nL6YQf.png', color: '#A9A9A9', category: SAMPLE_CATEGORY_IDS.FINISHES },
    { id: '1004', name: 'JSI Seating Fabric', image: 'https://i.imgur.com/8nL6YQf.png', color: '#C7AD8E', category: SAMPLE_CATEGORY_IDS.TEXTILES },
    { id: '1005', name: 'JSI Panel Fabric', image: 'https://i.imgur.com/8nL6YQf.png', color: '#AD8A77', category: SAMPLE_CATEGORY_IDS.TEXTILES },
    { id: '1006', name: 'JSI Leather', image: 'https://i.imgur.com/8nL6YQf.png', color: '#594A41', category: SAMPLE_CATEGORY_IDS.TEXTILES },
    { id: '2001', name: 'Vision Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#B3B3B3', category: SAMPLE_CATEGORY_IDS.HARDWARE },
    { id: '2002', name: 'Forge Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#414141', category: SAMPLE_CATEGORY_IDS.HARDWARE },
    { id: '2003', name: 'Brogan Pull', image: 'https://i.imgur.com/8nL6YQf.png', color: '#707070', category: SAMPLE_CATEGORY_IDS.HARDWARE },
];

export const SAMPLE_PRODUCTS = [
    ...LEGACY_BASE_PRODUCTS,
    // Add finish samples to main products for compatibility
    ...FINISH_SAMPLES.map(finish => ({
        id: finish.id,
        name: finish.name,
        image: finish.image,
        color: finish.color,
        category: SAMPLE_CATEGORY_IDS.FINISHES,
        subcategory: finish.category,
        code: finish.code,
        description: finish.description,
        finishType: finish.finishType
    }))
];

// Backwards compatible alias (deprecated: prefer SAMPLE_PRODUCTS)
// TODO: Remove SAMPLES_DATA alias in a future major version
export const SAMPLES_DATA = SAMPLE_PRODUCTS; // deprecated

// Fast lookup for any sample (legacy or finish) by id
export const SAMPLE_PRODUCTS_BY_ID = Object.freeze(Object.fromEntries(SAMPLE_PRODUCTS.map(p => [p.id, p])));

/**
 * Dev-time validation to surface inconsistent data early (no-op in prod build)
 */
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    const errors = [];
    const seenIds = new Set();
    for (const s of FINISH_SAMPLES) {
        if (!FINISH_CATEGORY_IDS[s.category?.toUpperCase?.()] && !Object.values(FINISH_CATEGORY_IDS).includes(s.category)) {
            errors.push(`Unknown finish category: ${s.category} (id: ${s.id})`);
        }
        if (seenIds.has(s.id)) errors.push(`Duplicate finish sample id: ${s.id}`);
        seenIds.add(s.id);
        if (!s.finishType) errors.push(`Missing finishType for: ${s.id}`);
    }
    // Ensure every finish code unique
    const codes = new Set();
    for (const s of FINISH_SAMPLES) {
        if (codes.has(s.code)) errors.push(`Duplicate finish code: ${s.code}`);
        codes.add(s.code);
    }
    if (errors.length) {
        // eslint-disable-next-line no-console
        console.warn('[samples:data] Validation issues:', errors);
    }
}