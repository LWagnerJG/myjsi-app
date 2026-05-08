import { CLOUDINARY_SAMPLE_FINISHES } from '../../data/cloudinary/sampleFinishes.js';

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

export const FINISH_SAMPLES = CLOUDINARY_SAMPLE_FINISHES;

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
    ...FINISH_SAMPLES.map((finish) => ({
        id: finish.id,
        name: finish.name,
        image: finish.image,
        sourceUrl: finish.sourceUrl,
        color: finish.color,
        category: 'finishes',
        subcategory: finish.category,
        code: finish.code,
        finishId: finish.finishId,
        cloudinaryFinishCode: finish.cloudinaryFinishCode,
        cloudinaryPublicId: finish.cloudinaryPublicId,
        cloudinaryFolder: finish.cloudinaryFolder,
        description: finish.description,
        dataSource: finish.dataSource,
    })),
];

export const SAMPLES_DATA = SAMPLE_PRODUCTS;
