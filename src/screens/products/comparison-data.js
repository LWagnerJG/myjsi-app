// Product Comparison and Competition Analysis data
export const PRODUCT_COMPARISON_CONSTANTS = {
    TAB_SIZES: {
        default: 'w-24 h-24',
        benches: 'w-28 h-28'
    },
    ADVANTAGE_THRESHOLDS: {
        positive: 0,
        negative: 0
    }
};

export const COMPETITION_METRICS = {
    categories: ['laminate', 'veneer', 'pricing'],
    displayFormat: {
        advantage: {
            positive: { backgroundColor: 'rgba(74,124,89,0.12)', color: '#4A7C59' },
            negative: { backgroundColor: 'rgba(184,92,92,0.12)', color: '#B85C5C' }
        }
    }
};