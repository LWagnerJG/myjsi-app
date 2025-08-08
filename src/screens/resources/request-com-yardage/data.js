// Request COM Yardage feature data
export const COM_YARDAGE_DATA = {
    instructions: [
        "Select the models you need COM yardage for",
        "Choose appropriate fabric options for each model", 
        "Specify quantities for each model",
        "Submit your request and it will be processed within 24-48 hours"
    ],
    defaultYardageRequirements: {
        'guest-chair': { min: 1.5, recommended: 2.0 },
        'lounge-chair': { min: 3.0, recommended: 4.0 },
        'sofa': { min: 8.0, recommended: 10.0 },
        'ottoman': { min: 1.0, recommended: 1.5 }
    },
    estimatedTurnaroundTime: "24-48 hours",
    supportContact: {
        name: "COM Support Team",
        email: "com-support@jsifurniture.com",
        phone: "1-800-555-0123"
    }
};

// Integration with samples system - fabric samples that can be ordered
export const COM_FABRIC_SAMPLES = [
    { id: 'fab-001', name: 'Premium Wool Blend', category: 'textiles', color: '#8B4513', grade: 'A', supplier: 'Maharam', pattern: 'Divina', yardagePerUnit: 2.5 },
    { id: 'fab-002', name: 'Contract Vinyl', category: 'textiles', color: '#2F4F4F', grade: 'B', supplier: 'Momentum', pattern: 'Refuge', yardagePerUnit: 1.8 },
    { id: 'fab-003', name: 'Performance Mesh', category: 'textiles', color: '#4682B4', grade: 'C', supplier: 'Designtex', pattern: 'Aerios', yardagePerUnit: 3.2 },
    { id: 'fab-004', name: 'Leather Grade Premium', category: 'textiles', color: '#8B4513', grade: 'L1', supplier: 'Camira', pattern: 'Dapper', yardagePerUnit: 4.0 },
    { id: 'fab-005', name: 'Eco-Friendly Cotton', category: 'textiles', color: '#90EE90', grade: 'A', supplier: 'Architex', pattern: 'Origin', yardagePerUnit: 2.0 },
    { id: 'fab-006', name: 'High-Performance Polyester', category: 'textiles', color: '#FF6347', grade: 'B', supplier: 'CF Stinson', pattern: 'Beeline', yardagePerUnit: 2.3 },
    { id: 'fab-007', name: 'Luxury Alpaca Blend', category: 'textiles', color: '#DDA0DD', grade: 'D', supplier: 'Kravet', pattern: 'Elegance', yardagePerUnit: 3.5 },
    { id: 'fab-008', name: 'Contract Grade Polyurethane', category: 'textiles', color: '#000080', grade: 'C', supplier: 'Guilford of Maine', pattern: 'Coastal', yardagePerUnit: 1.9 },
];

// Sample request templates for common furniture types
export const SAMPLE_REQUEST_TEMPLATES = {
    'executive-office': {
        name: 'Executive Office Package',
        description: 'Complete finish samples for executive office furniture',
        includes: ['laminate', 'wood', 'metal', 'textiles'],
        recommendedSamples: [
            'lam-001', 'lam-005', 'wood-002', 'wood-003', 'metal-001', 'metal-004',
            'fab-001', 'fab-004'
        ]
    },
    'conference-room': {
        name: 'Conference Room Package',
        description: 'Samples for meeting and conference spaces',
        includes: ['laminate', 'wood', 'glass', 'textiles'],
        recommendedSamples: [
            'lam-002', 'lam-008', 'wood-001', 'wood-004', 'glass-001', 'glass-002',
            'fab-002', 'fab-003'
        ]
    },
    'open-office': {
        name: 'Open Office Package',
        description: 'Modern finish options for collaborative workspaces',
        includes: ['laminate', 'metal', 'plastic', 'acoustic-panel'],
        recommendedSamples: [
            'lam-006', 'lam-007', 'metal-002', 'metal-005', 'plastic-001',
            'acoustic-001', 'acoustic-002'
        ]
    },
    'healthcare': {
        name: 'Healthcare Package',
        description: 'Antimicrobial and easy-clean finish options',
        includes: ['solid-surface', 'polyurethane', 'specialty-upholstery'],
        recommendedSamples: [
            'solid-001', 'solid-002', 'poly-002', 'upholstery-002', 'upholstery-003'
        ]
    },
    'hospitality': {
        name: 'Hospitality Package',
        description: 'Durable and attractive finishes for hotels and restaurants',
        includes: ['specialty-wood', 'metal', 'glass', 'specialty-upholstery'],
        recommendedSamples: [
            'spec-wood-005', 'spec-wood-006', 'metal-003', 'glass-003',
            'upholstery-001', 'upholstery-003'
        ]
    }
};