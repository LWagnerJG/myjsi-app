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

    state: {
        id: 'state',
        name: 'State Contracts',
        subtitle: 'Active state & university contracts by region',
        entries: [
            {
                state: 'Alabama',
                contracts: [
                    { number: 'MA220000002807', label: 'State of Alabama' },
                    { number: 'T054514',         label: 'University of Alabama' },
                ],
            },
            {
                state: 'Arkansas',
                contracts: [
                    { number: 'R240107/4600056039' },
                ],
            },
            {
                state: 'Connecticut',
                contracts: [
                    { number: '15PSX0041', label: 'Office' },
                    { number: 'F102' },
                    { number: 'MC12-C07' },
                ],
            },
            {
                state: 'Delaware',
                contracts: [
                    { number: 'GSS21479' },
                ],
            },
            {
                state: 'Florida',
                contracts: [
                    { number: '600655' },
                    { number: '56120000-24-NY-ACS' },
                ],
            },
            {
                state: 'Georgia',
                contracts: [
                    { number: '99999-001-SPD0000198-0014' },
                ],
            },
            {
                state: 'Illinois',
                contracts: [
                    { number: 'IPHEC1905' },
                ],
            },
            {
                state: 'Indiana',
                contracts: [
                    { number: 'TY-184730', label: 'Indiana University SSA' },
                ],
            },
            {
                state: 'Kansas',
                contracts: [
                    { number: '54995' },
                ],
            },
            {
                state: 'Kentucky',
                contracts: [
                    { number: 'MA 758 2300000873' },
                    { number: 'UK-2558-26Q', label: 'University of Kentucky' },
                ],
            },
            {
                state: 'Maine',
                contracts: [
                    { number: 'MC12-C07' },
                ],
            },
            {
                state: 'Massachusetts',
                contracts: [
                    { number: 'MC12-C07' },
                ],
            },
            {
                state: 'Mississippi',
                contracts: [
                    { number: '8200080586' },
                ],
            },
            {
                state: 'New Hampshire',
                contracts: [
                    { number: 'MC12-C07' },
                ],
            },
            {
                state: 'New Jersey',
                contracts: [
                    { number: '25-COMG-94091', label: 'State of New Jersey' },
                ],
            },
            {
                state: 'New Mexico',
                contracts: [
                    { number: '50-00000-25-00070' },
                ],
            },
            {
                state: 'New York',
                contracts: [
                    { number: 'PC70219' },
                ],
            },
            {
                state: 'North Carolina',
                contracts: [
                    { number: '5610A' },
                ],
            },
            {
                state: 'Ohio',
                contracts: [
                    { number: 'STS714', label: 'State of Ohio' },
                ],
            },
            {
                state: 'Oklahoma',
                contracts: [
                    { number: 'R-22000-22' },
                ],
            },
            {
                state: 'Pennsylvania',
                contracts: [
                    { number: '4400025629',          label: 'State of Pennsylvania' },
                    { number: 'COSTARS-035-E22-190', label: 'Pennsylvania COSTARS' },
                ],
            },
            {
                state: 'Rhode Island',
                contracts: [
                    { number: 'MC12-C07' },
                ],
            },
            {
                state: 'South Carolina',
                contracts: [
                    { number: '4400022631' },
                ],
            },
            {
                state: 'South Dakota',
                contracts: [
                    { number: '17527' },
                ],
            },
            {
                state: 'Utah',
                contracts: [
                    { number: 'MA4707' },
                ],
            },
            {
                state: 'Vermont',
                contracts: [
                    { number: 'MC12-C07' },
                ],
            },
            {
                state: 'Wisconsin',
                contracts: [
                    { number: '23-5665' },
                ],
            },
        ],
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
