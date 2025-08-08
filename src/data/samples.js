// Enhanced Samples related data with comprehensive finish and material categories
export const FINISH_CATEGORIES = [
    { id: 'laminate', name: 'Laminate', description: 'Durable surface finishes' },
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

// Comprehensive finish samples data
export const FINISH_SAMPLES = [
    // Laminate finishes
    { id: 'lam-001', name: 'Nevada Slate', category: 'laminate', color: '#4A5568', image: null, code: 'NS', description: 'Modern slate gray laminate' },
    { id: 'lam-002', name: 'Urban Concrete', category: 'laminate', color: '#718096', image: null, code: 'UC', description: 'Industrial concrete texture' },
    { id: 'lam-003', name: 'Smoked Hickory', category: 'laminate', color: '#744210', image: null, code: 'SH', description: 'Dark wood grain laminate' },
    { id: 'lam-004', name: 'Arctic Oak', category: 'laminate', color: '#E2E8F0', image: null, code: 'AO', description: 'Light oak wood grain' },
    { id: 'lam-005', name: 'Tuscan Marble', category: 'laminate', color: '#F7FAFC', image: null, code: 'TM', description: 'Elegant marble pattern' },
    { id: 'lam-006', name: 'Brushed Steel', category: 'laminate', color: '#A0AEC0', image: null, code: 'BS', description: 'Metallic steel finish' },
    { id: 'lam-007', name: 'Midnight Linen', category: 'laminate', color: '#2D3748', image: null, code: 'ML', description: 'Dark fabric texture' },
    { id: 'lam-008', name: 'Riverstone Gray', category: 'laminate', color: '#4A5568', image: null, code: 'RG', description: 'Natural stone texture' },
    { id: 'lam-009', name: 'Golden Teak', category: 'laminate', color: '#C69C6D', image: null, code: 'GT', description: 'Warm teak wood grain' },
    { id: 'lam-010', name: 'Sahara Sand', category: 'laminate', color: '#F7E6C9', image: null, code: 'SS', description: 'Desert sand texture' },

    // Wood finishes  
    { id: 'wood-001', name: 'Light Maple', category: 'wood', color: '#E8D5B7', image: null, code: 'LM', description: 'Natural light maple' },
    { id: 'wood-002', name: 'Medium Cherry', category: 'wood', color: '#B5651D', image: null, code: 'MC', description: 'Classic cherry finish' },
    { id: 'wood-003', name: 'Dark Walnut', category: 'wood', color: '#5D4037', image: null, code: 'DW', description: 'Rich walnut stain' },
    { id: 'wood-004', name: 'Natural Oak', category: 'wood', color: '#D7B899', image: null, code: 'NO', description: 'Traditional oak finish' },
    { id: 'wood-005', name: 'Espresso', category: 'wood', color: '#3E2723', image: null, code: 'ES', description: 'Deep espresso stain' },
    { id: 'wood-006', name: 'Honey Pine', category: 'wood', color: '#DEB887', image: null, code: 'HP', description: 'Warm honey pine' },

    // Specialty Wood - now merged into wood category
    { id: 'spec-wood-001', name: 'Rift Cut Oak', category: 'wood', color: '#C8A882', image: null, code: 'RCO', description: 'Premium rift cut oak veneer' },
    { id: 'spec-wood-002', name: 'Smoked Walnut', category: 'wood', color: '#4A4A4A', image: null, code: 'SW', description: 'Exotic smoked walnut' },
    { id: 'spec-wood-003', name: 'Figured Anigre', category: 'wood', color: '#E6D3A3', image: null, code: 'FA', description: 'Figured anigre veneer' },
    { id: 'spec-wood-004', name: 'Reconstituted Ebony', category: 'wood', color: '#1C1C1C', image: null, code: 'RE', description: 'Deep ebony finish' },
    { id: 'spec-wood-005', name: 'Birdseye Maple', category: 'wood', color: '#F5E6D3', image: null, code: 'BM', description: 'Rare birdseye maple' },
    { id: 'spec-wood-006', name: 'Zebrawood', category: 'wood', color: '#D4A574', image: null, code: 'ZW', description: 'Exotic zebrawood pattern' },

    // Metal finishes
    { id: 'metal-001', name: 'Polished Chrome', category: 'metal', color: '#E8E8E8', image: null, code: 'PC', description: 'Mirror chrome finish' },
    { id: 'metal-002', name: 'Brushed Aluminum', category: 'metal', color: '#C0C0C0', image: null, code: 'BA', description: 'Satin aluminum texture' },
    { id: 'metal-003', name: 'Black Powder Coat', category: 'metal', color: '#1A1A1A', image: null, code: 'BPC', description: 'Matte black coating' },
    { id: 'metal-004', name: 'Bronze Finish', category: 'metal', color: '#CD7F32', image: null, code: 'BF', description: 'Antique bronze patina' },
    { id: 'metal-005', name: 'Stainless Steel', category: 'metal', color: '#B8B8B8', image: null, code: 'SS', description: 'Brushed stainless steel' },

    // Solid Surface
    { id: 'solid-001', name: 'Glacier White', category: 'solid-surface', color: '#FFFFFF', image: null, code: 'GW', description: 'Pure white solid surface' },
    { id: 'solid-002', name: 'Storm Gray', category: 'solid-surface', color: '#6B7280', image: null, code: 'SG', description: 'Contemporary gray surface' },
    { id: 'solid-003', name: 'Bone', category: 'solid-surface', color: '#F5F5DC', image: null, code: 'BN', description: 'Warm bone color' },

    // Polyurethane
    { id: 'poly-001', name: 'Clear Matte', category: 'polyurethane', color: 'transparent', image: null, code: 'CM', description: 'Matte polyurethane coating' },
    { id: 'poly-002', name: 'Clear Gloss', category: 'polyurethane', color: 'transparent', image: null, code: 'CG', description: 'High-gloss polyurethane' },
    { id: 'poly-003', name: 'Satin Clear', category: 'polyurethane', color: 'transparent', image: null, code: 'SC', description: 'Satin polyurethane finish' },

    // Glass
    { id: 'glass-001', name: 'Clear Glass', category: 'glass', color: 'transparent', image: null, code: 'CLG', description: 'Standard clear glass' },
    { id: 'glass-002', name: 'Frosted Glass', category: 'glass', color: '#F8F8FF', image: null, code: 'FG', description: 'Etched frosted glass' },
    { id: 'glass-003', name: 'Tinted Gray', category: 'glass', color: '#A9A9A9', image: null, code: 'TG', description: 'Gray tinted glass' },

    // Plastic
    { id: 'plastic-001', name: 'White Thermoplastic', category: 'plastic', color: '#FFFFFF', image: null, code: 'WT', description: 'Durable white plastic' },
    { id: 'plastic-002', name: 'Black ABS', category: 'plastic', color: '#000000', image: null, code: 'BA', description: 'Black ABS plastic' },
    { id: 'plastic-003', name: 'Gray Polypropylene', category: 'plastic', color: '#808080', image: null, code: 'GP', description: 'Gray recycled plastic' },

    // Specialty Upholstery
    { id: 'upholstery-001', name: 'Premium Leather', category: 'specialty-upholstery', color: '#8B4513', image: null, code: 'PL', description: 'Top-grain leather' },
    { id: 'upholstery-002', name: 'Vinyl Contract', category: 'specialty-upholstery', color: '#2F4F4F', image: null, code: 'VC', description: 'Commercial grade vinyl' },
    { id: 'upholstery-003', name: 'Mesh Performance', category: 'specialty-upholstery', color: '#4682B4', image: null, code: 'MP', description: 'Breathable mesh fabric' },

    // Acoustic Panel
    { id: 'acoustic-001', name: 'Fabric Wrapped Panel', category: 'acoustic-panel', color: '#D3D3D3', image: null, code: 'FWP', description: 'Sound-absorbing fabric panel' },
    { id: 'acoustic-002', name: 'Perforated Wood', category: 'acoustic-panel', color: '#DEB887', image: null, code: 'PW', description: 'Perforated wood acoustic panel' },
    { id: 'acoustic-003', name: 'Metal Mesh Panel', category: 'acoustic-panel', color: '#C0C0C0', image: null, code: 'MMP', description: 'Metal mesh acoustic treatment' },
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