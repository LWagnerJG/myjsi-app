// Commission Rates specific data
export const COMMISSION_RATES_DATA = {
    standard: {
        name: 'Standard Commission Structure',
        tiers: [
            { from: 0, to: 50000, rate: 3.0, description: 'Base rate for sales up to $50K' },
            { from: 50001, to: 100000, rate: 3.5, description: 'Sales between $50K - $100K' },
            { from: 100001, to: 250000, rate: 4.0, description: 'Sales between $100K - $250K' },
            { from: 250001, to: null, rate: 4.5, description: 'Sales over $250K' }
        ]
    },
    dealer: {
        name: 'Dealer Commission Structure',
        tiers: [
            { from: 0, to: 25000, rate: 2.0, description: 'Base dealer rate up to $25K' },
            { from: 25001, to: 75000, rate: 2.5, description: 'Dealer sales $25K - $75K' },
            { from: 75001, to: 150000, rate: 3.0, description: 'Dealer sales $75K - $150K' },
            { from: 150001, to: null, rate: 3.5, description: 'Dealer sales over $150K' }
        ]
    },
    designer: {
        name: 'Designer Commission Structure',
        tiers: [
            { from: 0, to: 30000, rate: 1.5, description: 'Designer rate up to $30K' },
            { from: 30001, to: 60000, rate: 2.0, description: 'Designer sales $30K - $60K' },
            { from: 60001, to: 120000, rate: 2.5, description: 'Designer sales $60K - $120K' },
            { from: 120001, to: null, rate: 3.0, description: 'Designer sales over $120K' }
        ]
    }
};

export const BONUS_STRUCTURE = {
    quarterly: {
        name: 'Quarterly Bonuses',
        thresholds: [
            { target: 100000, bonus: 1000, description: 'Q1 Target Achievement' },
            { target: 150000, bonus: 2000, description: 'Q1 Stretch Goal' },
            { target: 200000, bonus: 3500, description: 'Q1 Excellence Award' }
        ]
    },
    annual: {
        name: 'Annual Bonuses',
        thresholds: [
            { target: 500000, bonus: 5000, description: 'Annual Target Achievement' },
            { target: 750000, bonus: 10000, description: 'Annual Stretch Goal' },
            { target: 1000000, bonus: 20000, description: 'Million Dollar Club' }
        ]
    }
};

export const COMMISSION_TYPES = [
    { value: 'standard', label: 'Standard Sales Rep' },
    { value: 'dealer', label: 'Dealer' },
    { value: 'designer', label: 'Designer' }
];

export const PAYMENT_SCHEDULES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'on-payment', label: 'Upon Customer Payment' }
];