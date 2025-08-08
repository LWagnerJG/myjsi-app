// Orders feature specific data
export const ORDER_DATA = [
    {
        date: '2025-06-10T11:20:00Z',
        company: 'BUSINESS FURNISHINGS',
        details: 'MONREAU SEMINARY',
        orderNumber: '450080-00',
        po: 'S65474-2',
        net: 112000.00,
        shipDate: '2025-09-15T12:00:00Z',
        status: 'In Production',
        shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628',
        discount: '18.40%',
        lineItems: [
            { line: '001', name: 'VISION CONFERENCE TABLE', model: 'VCT12048', quantity: 5, net: 8000.00, extNet: 40000.00, specs: [{ label: 'FINISH', value: 'MOCHA LAMINATE' }, { label: 'BASE', value: 'TRUSS LEG - BLACK' }] },
            { line: '002', name: 'ARWYN SWIVEL CHAIR', model: 'AW6007C', quantity: 40, net: 1800.00, extNet: 72000.00, specs: [{ label: 'UPHOLSTERY', value: 'MAHARAM, MODE, GLACIER' }] }
        ]
    },
    {
        date: '2025-06-13T10:00:00Z',
        company: 'BUSINESS FURNISHINGS',
        details: 'MONREAU SEMINARY - PHASE 2',
        orderNumber: '450080-01',
        po: 'S65474-3',
        net: 55000.00,
        shipDate: '2025-09-15T12:00:00Z',
        status: 'Acknowledged',
        shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628',
        discount: '18.40%',
        lineItems: [
            { line: '001', name: 'VISION CREDENZA', model: 'VCR7220D', quantity: 10, net: 2500.00, extNet: 25000.00, specs: [{ label: 'FINISH', value: 'MOCHA LAMINATE' }] },
            { line: '002', name: 'CAAV LOUNGE CHAIR', model: 'CV4501A', quantity: 15, net: 2000.00, extNet: 30000.00, specs: [{ label: 'FABRIC', value: 'DESIGNTEX, ECO TWEED, 04' }] }
        ]
    },
    {
        date: '2025-06-11T09:00:00Z',
        company: 'ONE ELEVEN DESIGN',
        details: 'CENTLIVRE, LLC',
        orderNumber: '449645-00',
        po: 'S65474-1',
        net: 2800.00,
        shipDate: '2025-09-05T12:00:00Z',
        status: 'Order Entry',
        shipTo: 'ONE ELEVEN DESIGN\n456 OAK AVENUE\nFORT WAYNE, IN 46802',
        discount: '18.01%',
        lineItems: [
            { line: '001', name: 'POET BARSTOOL', model: 'PT5301A', quantity: 4, net: 700.00, extNet: 2800.00, specs: [{ label: 'WOOD', value: 'LIGHT MAPLE' }] }
        ]
    },
    {
        date: '2025-06-14T11:00:00Z',
        company: 'ONE ELEVEN DESIGN',
        details: 'CENTLIVRE, LLC - LOBBY',
        orderNumber: '449645-01',
        po: 'S65474-4',
        net: 4250.00,
        shipDate: '2025-09-05T12:00:00Z',
        status: 'Order Entry',
        shipTo: 'ONE ELEVEN DESIGN\n456 OAK AVENUE\nFORT WAYNE, IN 46802',
        discount: '19.50%',
        lineItems: [
            { line: '001', name: 'ZIVA COFFEE TABLE', model: 'ZV2448CT', quantity: 1, net: 1250.00, extNet: 1250.00, specs: [{ label: 'FINISH', value: 'FLINT LAMINATE' }] },
            { line: '002', name: 'ZIVA END TABLE', model: 'ZV2222ET', quantity: 2, net: 1500.00, extNet: 3000.00, specs: [{ label: 'FINISH', value: 'FLINT LAMINATE' }] }
        ]
    },
    {
        date: '2025-06-11T16:45:00Z',
        company: 'CORPORATE DESIGN INC',
        details: 'ONE MAIN FINANCIAL',
        orderNumber: '449518-00',
        po: 'S65473-9',
        net: 500.00,
        shipDate: '2025-09-02T12:00:00Z',
        status: 'Acknowledged',
        shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708',
        discount: '22.34%',
        lineItems: [
            { line: '001', name: 'WINK GUEST CHAIR', model: 'WK4501A', quantity: 1, net: 500.00, extNet: 500.00, specs: [{ label: 'SHELL', value: 'KIWI GREEN' }] }
        ]
    },
    {
        date: '2025-06-12T10:15:00Z',
        company: 'CORPORATE DESIGN INC',
        details: 'ONEMAIN FINANCIAL',
        orderNumber: '442365-00',
        po: 'S65473-8',
        net: 950.00,
        shipDate: '2025-08-28T12:00:00Z',
        status: 'Shipping',
        shipTo: 'CORPORATE DESIGN INC\n123 MAIN STREET\nEVANSVILLE, IN 47708',
        discount: '24.03%',
        lineItems: [
            { line: '001', name: 'SIDE TABLE', model: 'SIDETBL-SM', quantity: 2, net: 475.00, extNet: 950.00, specs: [] }
        ]
    },
    {
        date: '2025-06-12T14:30:00Z',
        company: 'BUSINESS FURNITURE LLC',
        details: 'MSD of Lawrence Township - LECC',
        orderNumber: '444353-00',
        po: 'S65473-7',
        net: 31250.00,
        shipDate: '2025-08-25T12:00:00Z',
        status: 'In Production',
        shipTo: 'BUSINESS FURNISHINGS LLC\n4102 MEGHAN BEELER COURT\nSOUTH BEND, IN 46628',
        discount: '61.20%',
        lineItems: [
            { line: '001', name: 'CROSSOVER SWIVEL CONFERENCE', model: 'AW6007C', quantity: 8, net: 902.10, extNet: 7216.80, specs: [{ label: 'MIDBACK-SWIVELBASE', value: 'ARWYNSERIES-MODELAW6007C' }] }
        ]
    },
];

export const STATUS_COLORS = {
    'Discovery': '#3B82F6',      // blue
    'Specifying': '#10B981',     // green
    'Decision/Bidding': '#F59E0B', // orange
    'PO Expected': '#8B5CF6',    // purple
    'Won': '#059669',            // emerald
    'Lost': '#EF4444',           // red
    'Order Entry': '#6B7280',    // gray
    'Acknowledged': '#F59E0B',   // yellow
    'In Production': '#6366F1',  // indigo
    'Shipping': '#06B6D4',       // cyan
};