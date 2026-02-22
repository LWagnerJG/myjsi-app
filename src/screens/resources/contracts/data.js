// Contracts: service-based discounts + accurate dealer/rep commissions per screenshot
// Keep it high-level for the UI.

export const CONTRACTS_DATA = {
    omnia: {
        id: 'omnia',
        name: 'Omnia Partners (TCPN)',
        documentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_tcpn.pdf',
        dealerDocumentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_tcpn_dealer.pdf',
        publicDocumentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_tcpn_public.pdf',
        discounts: [
            {
                label: 'Dock Delivery',
                discount: '54%',
                dealerCommission: '15%',
                repCommission: '3.90%',
                margin: '60.90%',
            },
            {
                label: 'Inside Delivery',
                discount: '53%',
                dealerCommission: '17%',
                repCommission: '3.83%',
                margin: '60.99%',
            },
            {
                label: 'Delivered & Installed',
                discount: '52%',
                dealerCommission: '18%',
                repCommission: '3.75%',
                margin: '60.64%',
            },
        ],
    },

    tips: {
        id: 'tips',
        name: 'TIPS / TAPS',
        documentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_tips_taps.pdf',
        dealerDocumentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_tips_taps_dealer.pdf',
        publicDocumentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_tips_taps_public.pdf',
        discounts: [
            {
                label: 'Delivery & Installed',
                discount: '51%',
                dealerCommission: '24%',
                repCommission: '3.67%',
            },
            {
                label: 'Dock Delivery',
                discount: '53%',
                dealerCommission: '20%',
                repCommission: '3.83%',
            },
        ],
        disclaimer: 'Spiff is not allowed.',
    },

    premier: {
        id: 'premier',
        name: 'Premier (Healthcare GPO)',
        documentUrl: 'https://webresources.jsifurniture.com/production/uploads/j_contracts_premier.pdf',
        dealerDocumentUrl: 'https://webresources.jsifurniture.com/production/uploads/j_contracts_premier_dealer.pdf',
        publicDocumentUrl: 'https://webresources.jsifurniture.com/production/uploads/j_contracts_premier_public.pdf',
        discounts: [
            {
                label: 'Up to $500k list',
                discount: '56%',
                dealerCommission: '14%',
                repCommission: '4.09%',
            },
            {
                label: '$500k - $750k list',
                discount: '57%',
                dealerCommission: '13%',
                repCommission: '4.19%',
            },
            {
                label: '$750k+ list',
                discount: '58%',
                dealerCommission: '12%',
                repCommission: '4.29%',
            },
        ],
    },

    gsa: {
        id: 'gsa',
        name: 'GSA (Federal Government)',
        subtitle: 'Schedule 71 / 33721 (Placeholder)',
        documentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_gsa.pdf',
        dealerDocumentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_gsa_dealer.pdf',
        publicDocumentUrl: 'https://webresources.jsifurniture.com/production/uploads/jsi_contracts_gsa_public.pdf',
        discounts: [
            {
                label: 'Standard (Sub $250k)',
                discount: '55%',
                dealerCommission: '12%',
                repCommission: '4.00%',
            },
            {
                label: '$250k - $500k',
                discount: '56%',
                dealerCommission: '11%',
                repCommission: '4.10%',
            },
            {
                label: '$500k+',
                discount: '57%',
                dealerCommission: '10%',
                repCommission: '4.20%',
            },
        ],
        disclaimer: 'Always confirm SIN/category eligibility. Pricing subject to EPA and compliance review.',
    },
};

// enums kept in case other modules import them
export const CONTRACT_TYPES = [
    { value: 'cooperative', label: 'Cooperative Purchasing' },
    { value: 'gpo', label: 'Group Purchasing Organization' },
    { value: 'government', label: 'Government Contract' },
    { value: 'corporate', label: 'Corporate Agreement' },
];

export const CONTRACT_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
};

export const getContractStatus = (contract) => {
    const today = new Date();
    const expiration = contract.expirationDate ? new Date(contract.expirationDate) : null;
    const effective = contract.effectiveDate ? new Date(contract.effectiveDate) : null;
    if (effective && today < effective) return CONTRACT_STATUS.PENDING;
    if (expiration && today > expiration) return CONTRACT_STATUS.EXPIRED;
    return CONTRACT_STATUS.ACTIVE;
};
