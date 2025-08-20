// Commission Rates specific data
export const COMMISSION_RATES_DATA = {
    standard: [
        { discount: '5/10', rep: '12%', spiff: '3%' },
        { discount: '50/10/5', rep: '11%', spiff: '3%' },
        { discount: '50/20', rep: '10%', spiff: '3%' },
        { discount: '50/20/1', rep: '9%', spiff: '3%' },
        { discount: '50/20/2', rep: '9%', spiff: '3%' },
        { discount: '50/20/3', rep: '8%', spiff: '3%' },
        { discount: '50/20/4', rep: '8%', spiff: '3%' },
        { discount: '50/20/5', rep: '7%', spiff: '3%' },
        { discount: '50/20/6', rep: '7%', spiff: '3%' },
        { discount: '50/20/7', rep: '6%', spiff: '3%' },
        { discount: '50/20/8', rep: '6%', spiff: '3%' },
        { discount: '50/20/9', rep: '6%', spiff: '3%' },
        { discount: '50/20/10', rep: '5%', spiff: '3%' },
        { discount: 'GSA', rep: '5%', spiff: '3%' },
        { discount: 'Omnia', rep: '3.8-3.9%', spiff: '2.5%' },
        { discount: 'Premier', rep: '4.1-4.3%', spiff: '2%' },
        { discount: 'TIPS', rep: '3.6-3.8%', spiff: 'N/A' }
    ],
    split: [
        { label: 'Specifying', value: 70, color: '#AD8A77' },
        { label: 'Ordering', value: 30, color: '#414141' }
    ]
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

export const COMMISSION_SPLIT_DATA = [
    { label: 'Specifying', value: 70, color: '#AD8A77' },
    { label: 'Ordering', value: 30, color: '#414141' }
];