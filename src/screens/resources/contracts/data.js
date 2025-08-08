// Contracts specific data
export const CONTRACTS_DATA = {
    omnia: {
        id: 'omnia',
        name: 'Omnia Partners',
        type: 'Cooperative Purchasing',
        contractNumber: 'R191902',
        effectiveDate: '2019-04-01',
        expirationDate: '2024-03-31',
        tiers: [
            { 
                name: 'Tier 1', 
                discount: '10%', 
                dealerCommission: '5%', 
                repCommission: '5%',
                requirements: 'Minimum $50K annual volume'
            },
            { 
                name: 'Tier 2', 
                discount: '15%', 
                dealerCommission: '7%', 
                repCommission: '8%',
                requirements: 'Minimum $150K annual volume + training completion'
            },
        ],
        eligibleProducts: ['All JSI seating', 'Vision casegoods', 'Tables'],
        territories: ['All US States', 'Select Canadian Provinces'],
        note: 'Omnia Partners contract provides access to cooperative purchasing for public sector entities.',
        documentUrl: 'https://example.com/omnia-contract.pdf',
        contactInfo: {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@omniapartners.com',
            phone: '(555) 123-4567'
        }
    },
    tips: {
        id: 'tips',
        name: 'TIPS (The Interlocal Purchasing System)',
        type: 'Cooperative Purchasing',
        contractNumber: '230105',
        effectiveDate: '2023-01-01',
        expirationDate: '2026-12-31',
        tiers: [
            { 
                name: 'Standard', 
                discount: '12%', 
                dealerCommission: '6%', 
                repCommission: '6%',
                requirements: 'TIPS membership required'
            },
            { 
                name: 'Volume Tier', 
                discount: '18%', 
                dealerCommission: '9%', 
                repCommission: '9%',
                requirements: 'Minimum $200K annual volume through TIPS'
            },
        ],
        eligibleProducts: ['All JSI products', 'Installation services'],
        territories: ['Texas', 'New Mexico', 'Louisiana', 'Oklahoma'],
        note: 'TIPS contract serves educational institutions, government entities, and nonprofits.',
        documentUrl: 'https://example.com/tips-contract.pdf',
        contactInfo: {
            name: 'Mike Rodriguez',
            email: 'mike.rodriguez@tips-usa.com',
            phone: '(555) 234-5678'
        }
    },
    premier: {
        id: 'premier',
        name: 'Premier Healthcare',
        type: 'Healthcare GPO',
        contractNumber: 'PHC-2024-JSI',
        effectiveDate: '2024-01-01',
        expirationDate: '2026-12-31',
        tiers: [
            { 
                name: 'Basic', 
                discount: '20%', 
                dealerCommission: '10%', 
                repCommission: '10%',
                requirements: 'Premier member hospital'
            },
            { 
                name: 'Committed', 
                discount: '25%', 
                dealerCommission: '12%', 
                repCommission: '13%',
                requirements: 'Premier committed volume agreement'
            },
        ],
        eligibleProducts: ['Healthcare seating', 'Patient room furniture', 'Waiting area furniture'],
        territories: ['All US States'],
        note: 'Premier Healthcare contract for hospital and healthcare facility furnishings.',
        documentUrl: 'https://example.com/premier-contract.pdf',
        contactInfo: {
            name: 'Dr. Jennifer Chen',
            email: 'jennifer.chen@premierinc.com',
            phone: '(555) 345-6789'
        }
    },
    gsa: {
        id: 'gsa',
        name: 'GSA Multiple Award Schedule',
        type: 'Government Contract',
        contractNumber: 'GS-28F-0086X',
        effectiveDate: '2023-06-01',
        expirationDate: '2028-05-31',
        tiers: [
            { 
                name: 'Standard GSA', 
                discount: '22%', 
                dealerCommission: '8%', 
                repCommission: '12%',
                requirements: 'Federal agency procurement'
            }
        ],
        eligibleProducts: ['All JSI products', 'Installation services', 'Maintenance services'],
        territories: ['All US States and Territories'],
        note: 'GSA Schedule contract for federal government procurement.',
        documentUrl: 'https://example.com/gsa-contract.pdf',
        contactInfo: {
            name: 'Robert Miller',
            email: 'robert.miller@gsa.gov',
            phone: '(555) 456-7890'
        }
    }
};

export const CONTRACT_TYPES = [
    { value: 'cooperative', label: 'Cooperative Purchasing' },
    { value: 'gpo', label: 'Group Purchasing Organization' },
    { value: 'government', label: 'Government Contract' },
    { value: 'corporate', label: 'Corporate Agreement' }
];

export const CONTRACT_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    PENDING: 'pending',
    SUSPENDED: 'suspended'
};

export const getContractStatus = (contract) => {
    const today = new Date();
    const expiration = new Date(contract.expirationDate);
    const effective = new Date(contract.effectiveDate);
    
    if (today < effective) return CONTRACT_STATUS.PENDING;
    if (today > expiration) return CONTRACT_STATUS.EXPIRED;
    return CONTRACT_STATUS.ACTIVE;
};