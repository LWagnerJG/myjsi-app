// Commission Rates specific data
export const COMMISSION_RATES_DATA = {
    standard: [
        { discount: '50/20 (60.00%)', rep: '3.0%', spiff: '1.0%' },
        { discount: '50/20/1 (60.4%)', rep: '3.2%', spiff: '1.0%' },
        { discount: '50/20/2 (60.80%)', rep: '3.4%', spiff: '1.2%' },
        { discount: '50/20/4 (61.60%)', rep: '3.8%', spiff: '1.4%' },
        { discount: '50/20/2/3 (61.98%)', rep: '3.9%', spiff: '1.5%' },
        { discount: '50/20/5 (62.00%)', rep: '4.0%', spiff: '1.5%' },
        { discount: '50/20/3 (61.20%)', rep: '3.6%', spiff: '1.3%' },
        { discount: '50/20/6 (62.40%)', rep: '4.2%', spiff: '1.6%' },
        { discount: '50/25 (62.50%)', rep: '4.3%', spiff: '1.6%' },
        { discount: '50/20/5/2 (62.76%)', rep: '4.4%', spiff: '1.7%' },
        { discount: '50/20/7 (62.80%)', rep: '4.4%', spiff: '1.7%' },
        { discount: '50/20/8 (63.20%)', rep: '4.6%', spiff: '1.8%' },
        { discount: '50/10/10/10 (63.55%)', rep: '4.7%', spiff: '1.8%' },
        { discount: '50/20/9 (63.6%)', rep: '4.7%', spiff: '1.8%' },
        { discount: '50/20/10 (64.00%)', rep: '4.8%', spiff: '1.9%' },
        { discount: '50/20/8/3 (64.30%)', rep: '4.9%', spiff: '1.9%' },
        { discount: '50/20/10/3 (65.08%)', rep: '5.1%', spiff: '2.0%' },
        { discount: '50/20/10/5 (65.80%)', rep: '5.3%', spiff: '2.1%' },
        { discount: '50/20/15 (66.00%)', rep: '5.4%', spiff: '2.1%' }
    ],
    contract: [
        { discount: 'Omnia Tier 1 (60%)', rep: '5.0%', spiff: '2.0%' },
        { discount: 'Omnia Tier 2 (65%)', rep: '6.0%', spiff: '2.5%' },
        { discount: 'TIPS Standard (62%)', rep: '5.5%', spiff: '2.2%' },
        { discount: 'TIPS Volume (68%)', rep: '6.5%', spiff: '2.8%' },
        { discount: 'Premier Basic (70%)', rep: '7.0%', spiff: '3.0%' },
        { discount: 'Premier Committed (75%)', rep: '8.0%', spiff: '3.5%' },
        { discount: 'GSA Schedule (72%)', rep: '7.2%', spiff: '3.1%' }
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