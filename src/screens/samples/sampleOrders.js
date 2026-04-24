const DEFAULT_ORDERED_BY = {
    name: 'Luke Wagner',
    email: 'lwagner@jaspergroup.us.com',
    isCurrentUser: true,
};

export const INITIAL_SAMPLE_ORDERS = [
    {
        id: 'SO-2026-0048',
        linkedProjectId: 7,
        linkedProjectName: 'Startup Collaboration Space',
        date: '2026-04-23T10:20:00',
        status: 'processing',
        shipTo: 'Innovate Labs',
        shipToType: 'end-user',
        address: '1201 Tech Avenue, Indianapolis, IN 46202',
        orderedBy: DEFAULT_ORDERED_BY,
        carrier: 'UPS',
        eta: '2026-04-29',
        items: [
            { name: 'Vision White Oak', code: 'VWO', qty: 2 },
            { name: 'Pebble Felt', code: 'PBF', qty: 2 },
        ],
    },
    {
        id: 'SO-2026-0047',
        linkedProjectId: 6,
        linkedProjectName: 'Hotel Lobby Seating',
        date: '2026-04-22T09:10:00',
        status: 'delivered',
        shipTo: 'Metro Hospitality Studio',
        shipToType: 'design',
        address: '18 W Illinois St, Chicago, IL 60654',
        orderedBy: { name: 'Chris Dow', email: 'chris.dow@metrohospitality.com', isCurrentUser: false },
        tracking: '1Z999AA10123456841',
        carrier: 'UPS',
        eta: '2026-04-24',
        deliveredDate: '2026-04-24',
        items: [
            { name: 'Hoopz Saddle', code: 'HPZ-SDL', qty: 2 },
            { name: 'Bronzed Pull', code: 'BRP', qty: 1 },
        ],
    },
    {
        id: 'SO-2026-0046',
        linkedProjectId: 5,
        linkedProjectName: 'University Commons Refresh',
        date: '2026-04-20T13:40:00',
        status: 'in-transit',
        shipTo: 'State University Planning',
        shipToType: 'end-user',
        address: '500 College Ave, Bloomington, IN 47405',
        orderedBy: { name: 'Emily Raine', email: 'emily.raine@stateuniversity.edu', isCurrentUser: false },
        tracking: '1Z999AA10123456838',
        carrier: 'UPS',
        eta: '2026-04-25',
        items: [
            { name: 'Cao Clay', code: 'CAO-CLY', qty: 2 },
            { name: 'Wink Moss', code: 'WNK-MOS', qty: 2 },
            { name: 'Inset Pull Finish Ring', code: 'IPR', qty: 1 },
        ],
    },
    {
        id: 'SO-2026-0045',
        linkedProjectId: 4,
        linkedProjectName: 'Medical Wing Remodel',
        date: '2026-04-18T08:15:00',
        status: 'delivered',
        shipTo: 'Midwest Health Facilities',
        shipToType: 'end-user',
        address: '8900 W 82nd St, Indianapolis, IN 46278',
        orderedBy: { name: 'Alan Cooper', email: 'acooper@midwesthealth.org', isCurrentUser: false },
        tracking: '773456781234',
        carrier: 'FedEx',
        eta: '2026-04-22',
        deliveredDate: '2026-04-21',
        items: [
            { name: 'Coact Mist', code: 'COA-MST', qty: 3 },
            { name: 'Healthcare Pull Pack', code: 'HCP', qty: 1 },
        ],
    },
    {
        id: 'SO-2026-0044',
        linkedProjectId: 2,
        linkedProjectName: 'Lobby Refresh',
        date: '2026-04-16T15:05:00',
        status: 'in-transit',
        shipTo: 'XYZ Industries',
        shipToType: 'end-user',
        address: '4100 Meridian Plaza, Carmel, IN 46032',
        orderedBy: DEFAULT_ORDERED_BY,
        tracking: '1Z999AA10123456830',
        carrier: 'UPS',
        eta: '2026-04-20',
        items: [
            { name: 'Vision Drift', code: 'VIS-DRF', qty: 2 },
            { name: 'Wink Sand', code: 'WNK-SND', qty: 2 },
        ],
    },
    {
        id: 'SO-2026-0043',
        linkedProjectId: 1,
        linkedProjectName: 'New Office Furnishings',
        date: '2026-04-12T10:45:00',
        status: 'delivered',
        shipTo: 'ABC Corporation HQ',
        shipToType: 'end-user',
        address: '888 Meridian Tower, Indianapolis, IN 46204',
        orderedBy: DEFAULT_ORDERED_BY,
        tracking: '1Z999AA10123456827',
        carrier: 'UPS',
        eta: '2026-04-15',
        deliveredDate: '2026-04-15',
        items: [
            { name: 'Finn Studio Black', code: 'FIN-SBK', qty: 2 },
            { name: 'Vision Natural Walnut', code: 'VIS-NWL', qty: 2 },
            { name: 'Laminate Pull Sample', code: 'LPS', qty: 1 },
        ],
    },
    {
        id: 'SO-2026-0041',
        linkedProjectId: 8,
        linkedProjectName: 'Benchmark Finish Library Refresh',
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
        linkedProjectId: 9,
        linkedProjectName: 'Chicago Showroom Standards Reset',
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
        linkedProjectId: 10,
        linkedProjectName: 'Mitchell Interiors Material Palette',
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
        linkedProjectId: 11,
        linkedProjectName: 'Perkins&Will Sample Library Update',
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

const mergeSeedOrder = (seedOrder, existingOrder) => {
    if (!existingOrder) return seedOrder;

    return {
        ...seedOrder,
        ...existingOrder,
        linkedProjectId: existingOrder.linkedProjectId ?? seedOrder.linkedProjectId ?? null,
        linkedProjectName: existingOrder.linkedProjectName ?? seedOrder.linkedProjectName ?? '',
        shipTo: existingOrder.shipTo ?? seedOrder.shipTo,
        shipToType: existingOrder.shipToType ?? seedOrder.shipToType,
        address: existingOrder.address ?? seedOrder.address,
        orderedBy: existingOrder.orderedBy ?? seedOrder.orderedBy,
        tracking: existingOrder.tracking ?? seedOrder.tracking,
        carrier: existingOrder.carrier ?? seedOrder.carrier,
        eta: existingOrder.eta ?? seedOrder.eta,
        deliveredDate: existingOrder.deliveredDate ?? seedOrder.deliveredDate,
        items: Array.isArray(existingOrder.items) && existingOrder.items.length > 0 ? existingOrder.items : seedOrder.items,
    };
};

export const syncSampleOrdersWithSeeds = (existingOrders = []) => {
    if (!Array.isArray(existingOrders)) return [...INITIAL_SAMPLE_ORDERS];

    const nextOrders = [...existingOrders];
    let changed = false;

    INITIAL_SAMPLE_ORDERS.forEach((seedOrder) => {
        const matchIndex = nextOrders.findIndex((order) => String(order?.id) === String(seedOrder.id));
        if (matchIndex === -1) {
            nextOrders.push(seedOrder);
            changed = true;
            return;
        }

        const mergedOrder = mergeSeedOrder(seedOrder, nextOrders[matchIndex]);
        if (JSON.stringify(mergedOrder) !== JSON.stringify(nextOrders[matchIndex])) {
            nextOrders[matchIndex] = mergedOrder;
            changed = true;
        }
    });

    return changed ? nextOrders : existingOrders;
};

export const buildSubmittedSampleOrder = ({
    existingOrders = [],
    cartItems = [],
    shipToName,
    address1,
    address2,
    shipToType,
    linkedProjectId = null,
    linkedProjectName = '',
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
        linkedProjectId,
        linkedProjectName: String(linkedProjectName || '').trim(),
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