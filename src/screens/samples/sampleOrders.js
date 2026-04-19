const DEFAULT_ORDERED_BY = {
    name: 'Luke Wagner',
    email: 'lwagner@jaspergroup.us.com',
    isCurrentUser: true,
};

export const INITIAL_SAMPLE_ORDERS = [
    {
        id: 'SO-2026-0041',
        date: '2026-04-17T14:30:00',
        status: 'in-transit',
        shipTo: 'Benchmark Design Group',
        shipToType: 'design',
        address: '220 W Kinzie St, Chicago, IL 60654',
        orderedBy: DEFAULT_ORDERED_BY,
        tracking: '1Z999AA10123456784',
        carrier: 'UPS',
        eta: '2026-04-21',
        items: [
            { name: 'Pinnacle Walnut', code: 'PIN', qty: 2 },
            { name: 'Florence Walnut', code: 'FLO', qty: 1 },
            { name: 'Cask', code: 'CSK', qty: 3 },
        ],
    },
    {
        id: 'SO-2026-0038',
        date: '2026-04-14T09:15:00',
        status: 'delivered',
        shipTo: 'Haworth Chicago Showroom',
        shipToType: 'dealer',
        address: '330 N Wabash Ave, Chicago, IL 60611',
        orderedBy: DEFAULT_ORDERED_BY,
        tracking: '1Z999AA10123456790',
        carrier: 'UPS',
        eta: '2026-04-17',
        deliveredDate: '2026-04-16',
        items: [
            { name: 'Full JSI Sample Set', code: 'SET', qty: 1 },
        ],
    },
    {
        id: 'SO-2026-0035',
        date: '2026-04-10T16:45:00',
        status: 'delivered',
        shipTo: 'Sarah Mitchell — Mitchell Interiors',
        shipToType: 'design',
        address: '1500 E Washington St, Indianapolis, IN 46201',
        orderedBy: { name: 'Sarah Mitchell', email: 'sarah@mitchellinteriors.com', isCurrentUser: false },
        tracking: '1Z999AA10123456801',
        carrier: 'UPS',
        deliveredDate: '2026-04-14',
        items: [
            { name: 'Mocha', code: 'MCH', qty: 5 },
            { name: 'Shadow', code: 'SHD', qty: 2 },
            { name: 'Walnut Heights', code: 'WLH', qty: 3 },
        ],
    },
    {
        id: 'SO-2026-0029',
        date: '2026-04-03T11:20:00',
        status: 'processing',
        shipTo: 'Workspace Solutions',
        shipToType: 'dealer',
        address: '4000 W 106th St, Carmel, IN 46032',
        orderedBy: DEFAULT_ORDERED_BY,
        items: [
            { name: 'All TFL Finishes', code: 'TFL-SET', qty: 1 },
            { name: 'Fawn Veneer', code: 'FAW', qty: 2 },
        ],
    },
    {
        id: 'SO-2026-0022',
        date: '2026-03-25T08:50:00',
        status: 'delivered',
        shipTo: 'Home',
        shipToType: 'personal',
        address: '5445 N Deerwood Lake Rd, Jasper, IN 47546',
        orderedBy: DEFAULT_ORDERED_BY,
        deliveredDate: '2026-03-28',
        items: [
            { name: 'Alabaster', code: 'ALB', qty: 1 },
            { name: 'Designer White', code: 'DWH', qty: 1 },
        ],
    },
    {
        id: 'SO-2026-0018',
        date: '2026-03-18T13:10:00',
        status: 'delivered',
        shipTo: 'Amanda Chen — Perkins&Will',
        shipToType: 'design',
        address: '330 N Wabash Ave #3600, Chicago, IL 60611',
        orderedBy: { name: 'Amanda Chen', email: 'amanda.chen@perkinswill.com', isCurrentUser: false },
        tracking: '1Z999AA10123456822',
        carrier: 'FedEx',
        deliveredDate: '2026-03-21',
        items: [
            { name: 'Clay', code: 'CLY', qty: 2 },
            { name: 'Mesa', code: 'MES', qty: 2 },
            { name: 'Outback', code: 'OBK', qty: 1 },
            { name: 'Brickdust', code: 'BRD', qty: 1 },
        ],
    },
];

const inferItemCode = (item) => {
    if (item?.code) return item.code;
    if (item?.id === 'full-jsi-set') return 'SET';
    if (String(item?.id || '').startsWith('set-')) {
        return `${String(item.id).replace('set-', '').toUpperCase()}-SET`;
    }
    return 'SMP';
};

const inferShipToType = (shipToType, shipToName) => {
    if (shipToType) return shipToType;
    return String(shipToName || '').trim().toLowerCase() === 'home' ? 'personal' : 'end-user';
};

const getNextSampleOrderId = (existingOrders = [], now = new Date()) => {
    const year = now.getFullYear();
    const maxSuffix = existingOrders.reduce((max, order) => {
        const match = String(order?.id || '').match(/(\d{4})$/);
        const parsed = match ? Number.parseInt(match[1], 10) : 0;
        return Math.max(max, parsed || 0);
    }, 0);
    return `SO-${year}-${String(maxSuffix + 1).padStart(4, '0')}`;
};

export const buildSubmittedSampleOrder = ({
    existingOrders = [],
    cartItems = [],
    shipToName,
    address1,
    address2,
    shipToType,
    userSettings,
}) => {
    const now = new Date();
    const eta = new Date(now.getTime() + (4 * 24 * 60 * 60 * 1000));
    const firstName = String(userSettings?.firstName || '').trim();
    const lastName = String(userSettings?.lastName || '').trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || DEFAULT_ORDERED_BY.name;
    const address = [String(address1 || '').trim(), String(address2 || '').trim()].filter(Boolean).join(', ');

    return {
        id: getNextSampleOrderId(existingOrders, now),
        date: now.toISOString(),
        status: 'processing',
        shipTo: String(shipToName || '').trim() || 'Home',
        shipToType: inferShipToType(shipToType, shipToName),
        address,
        eta: eta.toISOString().slice(0, 10),
        carrier: 'UPS',
        orderedBy: {
            name: fullName,
            email: userSettings?.email || DEFAULT_ORDERED_BY.email,
            isCurrentUser: true,
        },
        items: cartItems.map((item) => ({
            name: item.name,
            code: inferItemCode(item),
            qty: item.quantity || item.qty || 1,
        })),
    };
};