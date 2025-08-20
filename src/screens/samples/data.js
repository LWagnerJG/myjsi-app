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

// Comprehensive finish samples data using actual image files
export const FINISH_SAMPLES = [
    // TFL finishes (add finishType for grouping on UI)
    { id: 'tfl-001', name: 'Nevada Slate', category: 'tfl', finishType: 'stone', color: '#4A5568', image: '/finish-images/jsi_finish_NVS_Nevada_Slate_Laminate.jpg', code: 'NVS', description: 'Modern slate gray TFL' },
    { id: 'tfl-002', name: 'Urban Concrete', category: 'tfl', finishType: 'stone', color: '#718096', image: '/finish-images/jsi_finish_URB_Urban_Concrete_Laminate.jpg', code: 'URB', description: 'Industrial concrete texture TFL' },
    { id: 'tfl-003', name: 'Arctic Oak', category: 'tfl', finishType: 'woodgrain', color: '#E2E8F0', image: '/finish-images/jsi_finish_ARO_Arctic_Oak_Laminate.jpg', code: 'ARO', description: 'Light oak wood grain TFL' },
    { id: 'tfl-004', name: 'Tuscan Marble', category: 'tfl', finishType: 'stone', color: '#F7FAFC', image: '/finish-images/jsi_finish_TUS_Tuscan_Marble_Laminate.jpg', code: 'TUS', description: 'Elegant marble pattern TFL' },
    { id: 'tfl-005', name: 'Brushed Steel', category: 'tfl', finishType: 'metallic', color: '#A0AEC0', image: '/finish-images/jsi_finish_BRS_Brushed_Steel_Laminate.jpg', code: 'BRS', description: 'Metallic steel finish TFL' },
    { id: 'tfl-006', name: 'Sahara Sand', category: 'tfl', finishType: 'stone', color: '#F7E6C9', image: '/finish-images/jsi_finish_SAH_Sahara_Sand_Laminate.jpg', code: 'SAH', description: 'Desert sand texture TFL' },
    { id: 'tfl-007', name: 'Alabaster', category: 'tfl', finishType: 'solid', color: '#F8F8FF', image: '/finish-images/jsi_finish_ALB_Alabaster_Laminate.jpg', code: 'ALB', description: 'Pure alabaster white TFL' },
    { id: 'tfl-008', name: 'Belair', category: 'tfl', finishType: 'solid', color: '#D3D3D3', image: '/finish-images/jsi_finish_BEL_Belair_Laminate.jpg', code: 'BEL', description: 'Sophisticated gray TFL' },
    { id: 'tfl-009', name: 'Black', category: 'tfl', finishType: 'solid', color: '#000000', image: '/finish-images/jsi_finish_BLK_Black_Laminate.jpg', code: 'BLK', description: 'Deep black TFL' },
    { id: 'tfl-010', name: 'Bordeaux', category: 'tfl', finishType: 'solid', color: '#722F37', image: '/finish-images/jsi_finish_BRD_Bordeaux_Laminate.jpg', code: 'BRD', description: 'Rich burgundy TFL' },
    { id: 'tfl-011', name: 'Clay', category: 'tfl', finishType: 'solid', color: '#B87333', image: '/finish-images/jsi_finish_CLY_Clay_Laminate.jpg', code: 'CLY', description: 'Earthy clay TFL' },
    { id: 'tfl-012', name: 'Cask', category: 'tfl', finishType: 'woodgrain', color: '#8B4513', image: '/finish-images/jsi_finish_CSK_Cask_Laminate.jpg', code: 'CSK', description: 'Warm cask brown TFL' },
    { id: 'tfl-013', name: 'Driftwood Elite', category: 'tfl', finishType: 'woodgrain', color: '#A0A0A0', image: '/finish-images/jsi_finish_DWE_Driftwood_Elite_Laminate.jpg', code: 'DWE', description: 'Premium driftwood texture TFL' },
    { id: 'tfl-014', name: 'Egret', category: 'tfl', finishType: 'solid', color: '#F5F5DC', image: '/finish-images/jsi_finish_EGR_Egret_Laminate.jpg', code: 'EGR', description: 'Soft egret white TFL' },
    { id: 'tfl-015', name: 'Fawn', category: 'tfl', finishType: 'solid', color: '#D2B48C', image: '/finish-images/jsi_finish_FAW_Fawn_Laminate.jpg', code: 'FAW', description: 'Gentle fawn beige TFL' },
    { id: 'tfl-016', name: 'Florence Walnut', category: 'tfl', finishType: 'woodgrain', color: '#5D4037', image: '/finish-images/jsi_finish_FLO_Florence_Walnut_Laminate.jpg', code: 'FLO', description: 'Rich walnut grain TFL' },
    { id: 'tfl-017', name: 'Loft', category: 'tfl', finishType: 'solid', color: '#696969', image: '/finish-images/jsi_finish_LOF_Loft_Laminate.jpg', code: 'LOF', description: 'Industrial loft texture TFL' },
    { id: 'tfl-018', name: 'Mocha', category: 'tfl', finishType: 'woodgrain', color: '#3C2414', image: '/finish-images/jsi_finish_MCH_Mocha_Laminate.jpg', code: 'MCH', description: 'Deep mocha brown TFL' },
    { id: 'tfl-019', name: 'Mesa', category: 'tfl', finishType: 'woodgrain', color: '#CD853F', image: '/finish-images/jsi_finish_MES_Mesa_Laminate.jpg', code: 'MES', description: 'Desert mesa texture TFL' },
    { id: 'tfl-020', name: 'Mineral', category: 'tfl', finishType: 'stone', color: '#708090', image: '/finish-images/jsi_finish_MIN_Mineral_Laminate.jpg', code: 'MIN', description: 'Natural mineral texture TFL' },
    { id: 'tfl-021', name: 'Outback', category: 'tfl', finishType: 'woodgrain', color: '#8B7355', image: '/finish-images/jsi_finish_OBK_Outback_Laminate.jpg', code: 'OBK', description: 'Rugged outback texture TFL' },
    { id: 'tfl-022', name: 'Pilsner', category: 'tfl', finishType: 'solid', color: '#DAA520', image: '/finish-images/jsi_finish_PIL_Pilsner_Laminate.jpg', code: 'PIL', description: 'Golden pilsner finish TFL' },
    { id: 'tfl-023', name: 'Pinnacle Walnut', category: 'tfl', finishType: 'woodgrain', color: '#654321', image: '/finish-images/jsi_finish_PIN_PinnacleWalnut_Laminate.jpg', code: 'PIN', description: 'Premium walnut grain TFL' },
    { id: 'tfl-024', name: 'Shadow', category: 'tfl', finishType: 'stone', color: '#2F4F4F', image: '/finish-images/jsi_finish_SHD_Shadow_Laminate.jpg', code: 'SHD', description: 'Deep shadow texture TFL' },
    { id: 'tfl-025', name: 'Umber', category: 'tfl', finishType: 'solid', color: '#4A4A4A', image: '/finish-images/jsi_finish_UMB_Umber_Laminate.jpg', code: 'UMB', description: 'Rich umber brown TFL' },
    { id: 'tfl-026', name: 'Valley', category: 'tfl', finishType: 'woodgrain', color: '#556B2F', image: '/finish-images/jsi_finish_VAL_Valley_Laminate.jpg', code: 'VAL', description: 'Valley green texture TFL' },
    { id: 'tfl-027', name: 'Weathered Ash', category: 'tfl', finishType: 'woodgrain', color: '#9E9E9E', image: '/finish-images/jsi_finish_WEA_WeatheredAsh_Laminate.jpg', code: 'WEA', description: 'Weathered ash grain TFL' },

    // HPL finishes  
    { id: 'hpl-001', name: 'Smoked Hickory', category: 'hpl', color: '#744210', image: '/finish-images/jsi_finish_SHO_Smoked_Hickory_Laminate.jpg', code: 'SHO', description: 'Dark wood grain HPL' },
    { id: 'hpl-002', name: 'Midnight Linen', category: 'hpl', color: '#2D3748', image: '/finish-images/jsi_finish_MNL_Midnight_Linen_Laminate.jpg', code: 'MNL', description: 'Dark fabric texture HPL' },
    { id: 'hpl-003', name: 'Riverstone Gray', category: 'hpl', color: '#4A5568', image: '/finish-images/jsi_finish_RSG_Riverstone_Gray_Laminate.jpg', code: 'RSG', description: 'Natural stone texture HPL' },
    { id: 'hpl-004', name: 'Golden Teak', category: 'hpl', color: '#C69C6D', image: '/finish-images/jsi_finish_GTK_Golden_Teak_Laminate.jpg', code: 'GTK', description: 'Warm teak wood grain HPL' },

    // Wood finishes  
    { id: 'wood-001', name: 'Light Maple', category: 'wood', color: '#E8D5B7', image: '/finish-images/jsi_finish_LMP_Light_Maple_Wood.jpg', code: 'LMP', description: 'Natural light maple' },
    { id: 'wood-002', name: 'Medium Cherry', category: 'wood', color: '#B5651D', image: '/finish-images/jsi_finish_CHR_Cherry_Wood.jpg', code: 'CHR', description: 'Classic cherry finish' },
    { id: 'wood-003', name: 'Dark Walnut', category: 'wood', color: '#5D4037', image: '/finish-images/jsi_finish_WAL_Walnut_Wood.jpg', code: 'WAL', description: 'Rich walnut stain' },
    { id: 'wood-004', name: 'Natural Oak', category: 'wood', color: '#D7B899', image: '/finish-images/jsi_finish_OAK_Oak_Wood.jpg', code: 'OAK', description: 'Traditional oak finish' },
    { id: 'wood-005', name: 'Espresso', category: 'wood', color: '#3E2723', image: '/finish-images/jsi_finish_ESP_Espresso_Wood.jpg', code: 'ESP', description: 'Deep espresso stain' },
    { id: 'wood-006', name: 'Honey Pine', category: 'wood', color: '#DEB887', image: '/finish-images/jsi_finish_PIN_Pine_Wood.jpg', code: 'PIN', description: 'Warm honey pine' },

    // Metal finishes
    { id: 'metal-001', name: 'Polished Chrome', category: 'metal', color: '#E8E8E8', image: '/finish-images/jsi_finish_CHR_Chrome_Metal.jpg', code: 'CHR', description: 'Mirror chrome finish' },
    { id: 'metal-002', name: 'Brushed Aluminum', category: 'metal', color: '#C0C0C0', image: '/finish-images/jsi_finish_ALU_Aluminum_Metal.jpg', code: 'ALU', description: 'Satin aluminum texture' },
    { id: 'metal-003', name: 'Black Powder Coat', category: 'metal', color: '#1A1A1A', image: '/finish-images/jsi_finish_BPC_Black_Powder_Coat.jpg', code: 'BPC', description: 'Matte black coating' },
    { id: 'metal-004', name: 'Bronze Finish', category: 'metal', color: '#CD7F32', image: '/finish-images/jsi_finish_BRZ_Bronze_Metal.jpg', code: 'BRZ', description: 'Antique bronze patina' },
    { id: 'metal-005', name: 'Stainless Steel', category: 'metal', color: '#B8B8B8', image: '/finish-images/jsi_finish_STL_Steel_Metal.jpg', code: 'STL', description: 'Brushed stainless steel' },

    // Solid Surface
    { id: 'solid-001', name: 'Glacier White', category: 'solid-surface', color: '#FFFFFF', image: '/finish-images/jsi_finish_GLW_Glacier_White_Solid.jpg', code: 'GLW', description: 'Pure white solid surface' },
    { id: 'solid-002', name: 'Storm Gray', category: 'solid-surface', color: '#6B7280', image: '/finish-images/jsi_finish_STG_Storm_Gray_Solid.jpg', code: 'STG', description: 'Contemporary gray surface' },
    { id: 'solid-003', name: 'Bone', category: 'solid-surface', color: '#F5F5DC', image: '/finish-images/jsi_finish_BON_Bone_Solid.jpg', code: 'BON', description: 'Warm bone color' },

    // Polyurethane
    { id: 'poly-001', name: 'Clear Matte', category: 'polyurethane', color: 'transparent', image: '/finish-images/jsi_finish_CMT_Clear_Matte_Poly.jpg', code: 'CMT', description: 'Matte polyurethane coating' },
    { id: 'poly-002', name: 'Clear Gloss', category: 'polyurethane', color: 'transparent', image: '/finish-images/jsi_finish_CGL_Clear_Gloss_Poly.jpg', code: 'CGL', description: 'High-gloss polyurethane' },
    { id: 'poly-003', name: 'Satin Clear', category: 'polyurethane', color: 'transparent', image: '/finish-images/jsi_finish_SCL_Satin_Clear_Poly.jpg', code: 'SCL', description: 'Satin polyurethane finish' },

    // Glass
    { id: 'glass-001', name: 'Clear Glass', category: 'glass', color: 'transparent', image: '/finish-images/jsi_finish_CLR_Clear_Glass.jpg', code: 'CLR', description: 'Standard clear glass' },
    { id: 'glass-002', name: 'Frosted Glass', category: 'glass', color: '#F8F8FF', image: '/finish-images/jsi_finish_FRS_Frosted_Glass.jpg', code: 'FRS', description: 'Etched frosted glass' },
    { id: 'glass-003', name: 'Tinted Gray', category: 'glass', color: '#A9A9A9', image: '/finish-images/jsi_finish_TGY_Tinted_Gray_Glass.jpg', code: 'TGY', description: 'Gray tinted glass' },

    // Plastic
    { id: 'plastic-001', name: 'White Thermoplastic', category: 'plastic', color: '#FFFFFF', image: '/finish-images/jsi_finish_WTP_White_Plastic.jpg', code: 'WTP', description: 'Durable white plastic' },
    { id: 'plastic-002', name: 'Black ABS', category: 'plastic', color: '#000000', image: '/finish-images/jsi_finish_BAB_Black_ABS_Plastic.jpg', code: 'BAB', description: 'Black ABS plastic' },
    { id: 'plastic-003', name: 'Gray Polypropylene', category: 'plastic', color: '#808080', image: '/finish-images/jsi_finish_GPP_Gray_Plastic.jpg', code: 'GPP', description: 'Gray recycled plastic' },

    // Specialty Upholstery
    { id: 'upholstery-001', name: 'Premium Leather', category: 'specialty-upholstery', color: '#8B4513', image: '/finish-images/jsi_finish_PRL_Premium_Leather.jpg', code: 'PRL', description: 'Top-grain leather' },
    { id: 'upholstery-002', name: 'Vinyl Contract', category: 'specialty-upholstery', color: '#2F4F4F', image: '/finish-images/jsi_finish_VCT_Vinyl_Contract.jpg', code: 'VCT', description: 'Commercial grade vinyl' },
    { id: 'upholstery-003', name: 'Mesh Performance', category: 'specialty-upholstery', color: '#4682B4', image: '/finish-images/jsi_finish_MSH_Mesh_Performance.jpg', code: 'MSH', description: 'Breathable mesh fabric' },

    // Acoustic Panel
    { id: 'acoustic-001', name: 'Fabric Wrapped Panel', category: 'acoustic-panel', color: '#D3D3D3', image: '/finish-images/jsi_finish_FWP_Fabric_Wrapped_Panel.jpg', code: 'FWP', description: 'Sound-absorbing fabric panel' },
    { id: 'acoustic-002', name: 'Perforated Wood', category: 'acoustic-panel', color: '#DEB887', image: '/finish-images/jsi_finish_PWD_Perforated_Wood_Panel.jpg', code: 'PWD', description: 'Perforated wood acoustic panel' },
    { id: 'acoustic-003', name: 'Metal Mesh Panel', category: 'acoustic-panel', color: '#C0C0C0', image: '/finish-images/jsi_finish_MMP_Metal_Mesh_Panel.jpg', code: 'MMP', description: 'Metal mesh acoustic treatment' },
];

// Legacy sample products for backwards compatibility
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
    
    // Add finish samples to main products for compatibility
    ...FINISH_SAMPLES.map(finish => ({
        id: finish.id,
        name: finish.name,
        image: finish.image,
        color: finish.color,
        category: 'finishes',
        subcategory: finish.category,
        code: finish.code,
        description: finish.description
    }))
];

export const SAMPLES_DATA = SAMPLE_PRODUCTS;