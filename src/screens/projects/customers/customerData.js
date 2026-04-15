/* ═══════════════════════════════════════════════════════════════
   CUSTOMER MOCK DATA
   ═══════════════════════════════════════════════════════════════ */

export const MOCK_CUSTOMERS = [
  {
    id: 'cust-1',
    type: 'end-user',
    name: 'Midwest Health Partners',
    domain: 'midwesthealthpartners.com',
    location: { city: 'Indianapolis', state: 'IN' },
    vertical: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
    activeProjectIds: ['opp-1', 'opp-3'],

    standardsPrograms: [
      {
        id: 'sp-1', title: 'Patient Room Furniture Standard', code: 'MHP-STD-2024',
        status: 'Active', startDate: '2024-01-15', endDate: '2027-01-14',
        summary: 'Standardized patient room casegoods and seating for all MHP facilities.',
        poRequirementText: 'All POs must reference contract #MHP-STD-2024 and include facility code.',
        purchasingAwarenessRequired: true, purchasingNotifiedAt: '2024-02-01',
        specialNotes: ['Includes antimicrobial finish on all surfaces', 'Bariatric seating required in 20% of patient rooms', 'Coordinated with infection control team'],
        specialMaterials: ['Crypton fabrics only', 'HPL tops rated for chemical cleaners'],
        attachments: [{ id: 'd1', name: 'MHP Standards Guide.pdf', url: '#' }],
        lastUpdated: '2025-11-12', ownerName: 'Sarah Mitchell',
      },
      {
        id: 'sp-2', title: 'Nursing Station Refresh', code: 'MHP-NS-2025',
        status: 'Active', startDate: '2025-03-01', endDate: '2026-12-31',
        summary: 'Phased replacement of all nursing station desking across 8 locations.',
        poRequirementText: null,
        purchasingAwarenessRequired: false, purchasingNotifiedAt: null,
        specialNotes: ['Standing-height option at every station', 'Integrated power/data'],
        specialMaterials: [], attachments: [],
        lastUpdated: '2026-01-20', ownerName: 'Sarah Mitchell',
      },
      {
        id: 'sp-3', title: 'Lobby Seating Agreement', code: 'MHP-LOB-2023',
        status: 'Expiring', startDate: '2023-06-01', endDate: '2026-05-31',
        summary: 'Guest and lobby seating for main campus buildings.',
        poRequirementText: 'Reference contract on all orders over $5,000.',
        purchasingAwarenessRequired: true, purchasingNotifiedAt: '2023-07-15',
        specialNotes: ['Weighted base required for all guest chairs'],
        specialMaterials: ['Grade 2+ upholstery only'],
        attachments: [], lastUpdated: '2025-09-04', ownerName: 'Tom Bradley',
      },
    ],

    approvedMaterials: {
      laminates: [
        { id: 'm1', name: 'Warm White', code: 'WW-110', vendor: 'Wilsonart', swatchHex: '#F5F0E8' },
        { id: 'm2', name: 'Natural Maple', code: 'NM-330', vendor: 'Formica', swatchHex: '#D4BA8A' },
        { id: 'm3', name: 'Pewter Mesh', code: 'PM-504', vendor: 'Wilsonart', swatchHex: '#9B9B9B' },
      ],
      metals: [
        { id: 'm4', name: 'Silver', code: 'SLV-01', vendor: null, swatchHex: '#C0C0C0' },
        { id: 'm5', name: 'Black', code: 'BLK-02', vendor: null, swatchHex: '#2C2C2C' },
      ],
      upholstery: [
        { id: 'm6', name: 'Ocean Tide', code: 'CR-4420', vendor: 'Crypton', swatchHex: '#2E6B8A' },
        { id: 'm7', name: 'Sage Mist', code: 'CR-4418', vendor: 'Crypton', swatchHex: '#8BAF8B' },
        { id: 'm8', name: 'Graphite', code: 'CR-4401', vendor: 'Crypton', swatchHex: '#4A4A4A' },
      ],
      woods: [
        { id: 'm9', name: 'Shaker Cherry', code: 'SC-200', vendor: null, swatchHex: '#8B4513' },
      ],
      paintPlastic: [
        { id: 'm10', name: 'Designer White', code: 'DW-01', vendor: null, swatchHex: '#FAFAFA' },
      ],
    },

    orders: {
      current: [
        { id: 'ord-1', orderNumber: 'JSI-94201', type: 'Standard', status: 'In Production', amount: 42800, eta: '2026-05-15', createdAt: '2026-02-10' },
        { id: 'ord-2', orderNumber: 'JSI-94305', type: 'Standard', status: 'Acknowledged', amount: 18450, eta: '2026-06-22', createdAt: '2026-03-18' },
      ],
      history: [
        { id: 'ord-3', orderNumber: 'JSI-91204', type: 'Standard', status: 'Delivered', amount: 67200, completedAt: '2025-08-20', createdAt: '2025-04-02' },
        { id: 'ord-4', orderNumber: 'JSI-89330', type: 'Rush', status: 'Installed', amount: 11900, completedAt: '2025-03-10', createdAt: '2025-01-15' },
      ],
    },

    typicals: [
      { id: 't1', name: 'Patient Bedside Cabinet', dimensions: '24"W × 18"D × 30"H', startingPrice: 1240, image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg' },
      { id: 't2', name: 'Nursing Station 72"', dimensions: '72"W × 30"D × 42"H', startingPrice: 3890, image: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg' },
      { id: 't3', name: 'Guest Chair - Bariatric', dimensions: '26"W × 24"D × 33"H', startingPrice: 780, image: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg' },
    ],

    projects: [
      {
        id: 'proj-1-1', name: 'Main Lobby & Reception', location: 'Building A',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg',
        installs: [
          { id: 'i1', url: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg', caption: 'Main lobby reception', spaceType: 'Lobby', date: '2025-06-14' },
          { id: 'i3', url: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg', caption: 'Waiting area 2nd floor', spaceType: 'Lobby', date: '2025-09-05' },
        ],
      },
      {
        id: 'proj-1-2', name: 'Patient Wing 4th Floor', location: 'Building B',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg',
        installs: [
          { id: 'i2', url: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg', caption: 'Patient room 4th floor', spaceType: 'Patient', date: '2025-08-20' },
          { id: 'i4', url: 'https://webresources.jsifurniture.com/production/uploads/jsi_coldjet_install_00001.jpg', caption: 'Nurse station B wing', spaceType: 'Office', date: '2025-11-03' },
        ],
      },
    ],

    documents: [
      { id: 'doc-1', name: 'MHP-Furniture-Standards-2024.pdf', url: '#' },
      { id: 'doc-2', name: 'Approved-Finishes-Matrix.xlsx', url: '#' },
    ],

    contacts: [
      { id: 'c1', name: 'Linda Torres', role: 'Facilities Director', email: 'ltorres@mhp.org', visibility: 'dealer' },
      { id: 'c2', name: 'James Park', role: 'Procurement Manager', email: 'jpark@mhp.org', visibility: 'dealer' },
    ],

    jsiRep: { name: 'Sarah Mitchell', role: 'Account Executive', email: 'smitchell@jsifurniture.com', phone: '317-555-0142' },
  },

  {
    id: 'cust-2',
    type: 'end-user',
    name: 'Crane & Associates',
    domain: 'craneassociates.com',
    location: { city: 'Chicago', state: 'IL' },
    vertical: 'Corporate',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    activeProjectIds: ['opp-5'],

    standardsPrograms: [
      {
        id: 'sp-4', title: 'Open Office Furniture Program', code: 'CA-OF-2025',
        status: 'Active', startDate: '2025-01-01', endDate: '2027-12-31',
        summary: 'Standardized open-plan workstations and collaborative furniture.',
        poRequirementText: 'All POs require department cost-center code.',
        purchasingAwarenessRequired: true, purchasingNotifiedAt: '2025-01-20',
        specialNotes: ['Height-adjustable desks mandatory', 'Acoustic privacy panels required'],
        specialMaterials: ['Grade 3 performance fabric minimum'],
        attachments: [], lastUpdated: '2026-02-15', ownerName: 'Mike Johnson',
      },
    ],

    approvedMaterials: {
      laminates: [
        { id: 'm20', name: 'Studio Teak', code: 'ST-440', vendor: 'Formica', swatchHex: '#A0784C' },
        { id: 'm21', name: 'Fog Grey', code: 'FG-220', vendor: 'Wilsonart', swatchHex: '#B0AFA8' },
      ],
      metals: [{ id: 'm22', name: 'Charcoal', code: 'CH-03', vendor: null, swatchHex: '#3A3A3A' }],
      upholstery: [
        { id: 'm23', name: 'Navy', code: 'TX-1100', vendor: 'Maharam', swatchHex: '#1B2A4A' },
        { id: 'm24', name: 'Stone', code: 'TX-1108', vendor: 'Maharam', swatchHex: '#A09888' },
      ],
      woods: [],
      paintPlastic: [],
    },

    orders: {
      current: [
        { id: 'ord-5', orderNumber: 'JSI-94500', type: 'Standard', status: 'Entered', amount: 89500, eta: '2026-07-01', createdAt: '2026-03-25' },
      ],
      history: [
        { id: 'ord-6', orderNumber: 'JSI-90100', type: 'Standard', status: 'Installed', amount: 124000, completedAt: '2025-10-11', createdAt: '2025-05-20' },
      ],
    },

    typicals: [
      { id: 't4', name: 'Open Plan Workstation 60"', dimensions: '60"W × 30"D × 29"H', startingPrice: 2150, image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg' },
      { id: 't5', name: 'Collaboration Table 96"', dimensions: '96"W × 42"D × 29"H', startingPrice: 4200, image: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg' },
    ],

    projects: [
      {
        id: 'proj-2-1', name: 'Floor 12 Renovation', location: 'Main Tower',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
        installs: [
          { id: 'i5', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', caption: 'Floor 12 open plan', spaceType: 'Office', date: '2025-10-11' },
          { id: 'i6', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80', caption: 'Executive conference room', spaceType: 'Conference', date: '2025-11-22' },
        ],
      },
    ],

    documents: [
      { id: 'doc-3', name: 'Crane-Office-Standards.pdf', url: '#' },
    ],

    contacts: [
      { id: 'c3', name: 'Rachel Wong', role: 'Office Manager', email: 'rwong@crane.com', visibility: 'dealer' },
    ],

    jsiRep: { name: 'Mike Johnson', role: 'Territory Manager', email: 'mjohnson@jsifurniture.com', phone: '312-555-0198' },
  },

  {
    id: 'cust-3',
    type: 'end-user',
    name: 'State University System',
    domain: 'stateuniv.edu',
    location: { city: 'Columbus', state: 'OH' },
    vertical: 'HigherEd',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80',
    activeProjectIds: [],

    standardsPrograms: [
      {
        id: 'sp-5', title: 'Campus Classroom Seating', code: 'SUS-CLS-2024',
        status: 'Active', startDate: '2024-07-01', endDate: '2027-06-30',
        summary: 'Flexible classroom seating for all SUS campuses.',
        poRequirementText: null,
        purchasingAwarenessRequired: false, purchasingNotifiedAt: null,
        specialNotes: ['Stackable and mobile preferred', 'Tablet arm option on 50% of chairs'],
        specialMaterials: [],
        attachments: [], lastUpdated: '2025-12-01', ownerName: 'Emily Raine',
      },
      {
        id: 'sp-6', title: 'Library Renovation Phase II', code: 'SUS-LIB-2023',
        status: 'Expired', startDate: '2023-01-01', endDate: '2025-12-31',
        summary: 'Completed library redesign project for main campus.',
        poRequirementText: null,
        purchasingAwarenessRequired: false, purchasingNotifiedAt: null,
        specialNotes: ['Project completed on time'],
        specialMaterials: [],
        attachments: [], lastUpdated: '2025-12-15', ownerName: 'Emily Raine',
      },
    ],

    approvedMaterials: {
      laminates: [{ id: 'm30', name: 'Classic Oak', code: 'CO-550', vendor: 'Formica', swatchHex: '#B8956A' }],
      metals: [{ id: 'm31', name: 'Bronze', code: 'BRZ-04', vendor: null, swatchHex: '#8B7355' }],
      upholstery: [{ id: 'm32', name: 'Crimson', code: 'UF-600', vendor: 'Designtex', swatchHex: '#8B1A1A' }],
      woods: [],
      paintPlastic: [],
    },

    orders: {
      current: [],
      history: [
        { id: 'ord-7', orderNumber: 'JSI-87500', type: 'Standard', status: 'Delivered', amount: 210000, completedAt: '2025-09-30', createdAt: '2025-03-15' },
      ],
    },

    typicals: [],

    projects: [
      {
        id: 'proj-3-1', name: 'Swain Hall', location: 'Main Campus',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80',
        installs: [
          { id: 'i7', url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80', caption: 'Main library 1st floor', spaceType: 'Classroom', date: '2025-09-30' },
          { id: 'i8', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80', caption: 'Swain Hall lecture room', spaceType: 'Classroom', date: '2025-10-15' },
        ],
      },
      {
        id: 'proj-3-2', name: 'Student Commons', location: 'East Campus',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
        installs: [
          { id: 'i9', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80', caption: 'Student lounge area', spaceType: 'Lobby', date: '2025-11-20' },
        ],
      },
    ],

    documents: [],

    contacts: [
      { id: 'c4', name: 'Dr. Amy Chen', role: 'Facilities VP', email: 'achen@stateuniv.edu', visibility: 'dealer' },
    ],

    jsiRep: { name: 'Emily Raine', role: 'Project Manager', email: 'eraine@jsifurniture.com', phone: '614-555-0177' },
  },

  {
    id: 'cust-4',
    type: 'end-user',
    name: 'Greenfield Government Center',
    domain: 'greenfieldgov.org',
    location: { city: 'Greenfield', state: 'IN' },
    vertical: 'Government',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&q=80',
    activeProjectIds: ['opp-8'],

    standardsPrograms: [],

    approvedMaterials: {
      laminates: [{ id: 'm40', name: 'Grey Nebula', code: 'GN-105', vendor: 'Wilsonart', swatchHex: '#7D7D7D' }],
      metals: [],
      upholstery: [{ id: 'm41', name: 'Federal Blue', code: 'FB-300', vendor: 'Guilford of Maine', swatchHex: '#2F4F7F' }],
      woods: [],
      paintPlastic: [],
    },

    orders: {
      current: [
        { id: 'ord-8', orderNumber: 'JSI-94620', type: 'Standard', status: 'Acknowledged', amount: 34200, eta: '2026-06-10', createdAt: '2026-03-05' },
      ],
      history: [],
    },

    typicals: [
      { id: 't6', name: 'Council Chamber Desk', dimensions: '72"W × 24"D × 30"H', startingPrice: 2800, image: 'https://webresources.jsifurniture.com/production/uploads/jsi_coldjet_install_00001.jpg' },
    ],

    projects: [
      {
        id: 'proj-4-1', name: 'Council Chambers', location: 'City Hall',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_coldjet_install_00001.jpg',
        installs: [],
      },
    ],
    documents: [],
    contacts: [],

    jsiRep: { name: 'Tom Bradley', role: 'Territory Manager', email: 'tbradley@jsifurniture.com', phone: '317-555-0163' },
  },

  /* ── Dealers ── */
  {
    id: 'dealer-1', type: 'dealer',
    name: 'Contract Source Interiors',
    domain: 'contractsource.com',
    location: { city: 'Chicago', state: 'IL' },
    vertical: 'Full Service',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
    standardsPrograms: [
      { id: 'dsp-1', title: 'Preferred Dealer Agreement', code: 'CSI-PDA-2024', status: 'Active', startDate: '2024-01-01', endDate: '2027-01-01', summary: 'Authorized reseller agreement with preferred pricing tiers.', poRequirementText: null, purchasingAwarenessRequired: false, purchasingNotifiedAt: null, specialNotes: [], specialMaterials: [], attachments: [], lastUpdated: '2025-10-01', ownerName: 'Rachel Owens' },
    ],
    approvedMaterials: { laminates: [], metals: [], upholstery: [], woods: [], paintPlastic: [] },
    orders: { current: [{ id: 'dord-1', orderNumber: 'JSI-94800', type: 'Standard', status: 'In Production', amount: 31200, eta: '2026-05-20', createdAt: '2026-02-14' }], history: [] },
    projects: [], documents: [], typicals: [],
    contacts: [
      { id: 'dc1', name: 'Rachel Owens', role: 'Sales Manager', email: 'rowens@contractsource.com', visibility: 'dealer' },
      { id: 'dc2', name: 'Kevin Blake', role: 'Project Coordinator', email: 'kblake@contractsource.com', visibility: 'dealer' },
    ],
    jsiRep: { name: 'Sarah Mitchell', role: 'Account Executive', email: 'smitchell@jsifurniture.com', phone: '317-555-0142' },
  },
  {
    id: 'dealer-2', type: 'dealer',
    name: 'WorkSpace Environments',
    domain: 'wsenviro.com',
    location: { city: 'Indianapolis', state: 'IN' },
    vertical: 'Corporate',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    standardsPrograms: [],
    approvedMaterials: { laminates: [], metals: [], upholstery: [], woods: [], paintPlastic: [] },
    orders: { current: [], history: [{ id: 'dord-2', orderNumber: 'JSI-91500', type: 'Standard', status: 'Delivered', amount: 22400, completedAt: '2025-11-08', createdAt: '2025-07-01' }] },
    projects: [], documents: [], typicals: [],
    contacts: [
      { id: 'dc3', name: 'Monica Lewis', role: 'Principal', email: 'mlewis@wsenviro.com', visibility: 'dealer' },
    ],
    jsiRep: { name: 'Sarah Mitchell', role: 'Account Executive', email: 'smitchell@jsifurniture.com', phone: '317-555-0142' },
  },
  {
    id: 'dealer-3', type: 'dealer',
    name: 'Apex Office Solutions',
    domain: 'apexofficesolutions.com',
    location: { city: 'Columbus', state: 'OH' },
    vertical: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80',
    standardsPrograms: [],
    approvedMaterials: { laminates: [], metals: [], upholstery: [], woods: [], paintPlastic: [] },
    orders: { current: [], history: [] },
    projects: [], documents: [], typicals: [],
    contacts: [
      { id: 'dc4', name: 'James Tran', role: 'Sales Director', email: 'jtran@apexoffice.com', visibility: 'dealer' },
    ],
    jsiRep: { name: 'Tom Bradley', role: 'Territory Manager', email: 'tbradley@jsifurniture.com', phone: '317-555-0163' },
  },

  /* ── Design Firms ── */
  {
    id: 'df-1', type: 'design-firm',
    name: 'Meridian Design Studio',
    domain: 'meridianstudio.com',
    location: { city: 'Chicago', state: 'IL' },
    vertical: 'Workplace',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80',
    standardsPrograms: [
      { id: 'dfsp-1', title: 'Preferred Specification Agreement', code: 'MDS-PSA-2025', status: 'Active', startDate: '2025-06-01', endDate: '2028-06-01', summary: 'Preferred specification relationship with JSI product libraries.', poRequirementText: null, purchasingAwarenessRequired: false, purchasingNotifiedAt: null, specialNotes: ['JSI library integrated in Revit workflow'], specialMaterials: [], attachments: [], lastUpdated: '2025-09-14', ownerName: 'Amanda Reyes' },
    ],
    approvedMaterials: { laminates: [], metals: [], upholstery: [], woods: [], paintPlastic: [] },
    orders: { current: [], history: [] },
    projects: [], documents: [], typicals: [],
    contacts: [
      { id: 'dfc1', name: 'Amanda Reyes', role: 'Principal, Interior Design', email: 'areyes@meridianstudio.com', visibility: 'dealer' },
      { id: 'dfc2', name: 'Carlos Diaz', role: 'Project Designer', email: 'cdiaz@meridianstudio.com', visibility: 'dealer' },
    ],
    jsiRep: { name: 'Sarah Mitchell', role: 'Account Executive', email: 'smitchell@jsifurniture.com', phone: '317-555-0142' },
  },
  {
    id: 'df-2', type: 'design-firm',
    name: 'Foundry Architecture + Interiors',
    domain: 'foundryai.com',
    location: { city: 'Indianapolis', state: 'IN' },
    vertical: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
    standardsPrograms: [],
    approvedMaterials: { laminates: [], metals: [], upholstery: [], woods: [], paintPlastic: [] },
    orders: { current: [], history: [] },
    projects: [], documents: [], typicals: [],
    contacts: [
      { id: 'dfc3', name: 'Brianna Cole', role: 'Senior Interior Designer', email: 'bcole@foundryai.com', visibility: 'dealer' },
    ],
    jsiRep: { name: 'Sarah Mitchell', role: 'Account Executive', email: 'smitchell@jsifurniture.com', phone: '317-555-0142' },
  },
  {
    id: 'df-3', type: 'design-firm',
    name: 'Nucleus Creative Group',
    domain: 'nucleuscreative.com',
    location: { city: 'Detroit', state: 'MI' },
    vertical: 'Education',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80',
    standardsPrograms: [],
    approvedMaterials: { laminates: [], metals: [], upholstery: [], woods: [], paintPlastic: [] },
    orders: { current: [], history: [] },
    projects: [], documents: [], typicals: [],
    contacts: [
      { id: 'dfc4', name: 'Tyrone Nash', role: 'Creative Director', email: 'tnash@nucleuscreative.com', visibility: 'dealer' },
    ],
    jsiRep: { name: 'Tom Bradley', role: 'Territory Manager', email: 'tbradley@jsifurniture.com', phone: '317-555-0163' },
  },
];

export const VERTICAL_COLORS = {
  Corporate: '#4A7C59',
  Healthcare: '#2E6B8A',
  HigherEd: '#8B6914',
  Government: '#6B4E8A',
  Hospitality: '#8A5C2E',
  Education: '#7A5C2E',
  'Full Service': '#2E5C7A',
  Workplace: '#4A6B7C',
};

// Ordered list of verticals used for customer/project filtering UI.
// Matches the primary VERTICAL_COLORS keys (excluding 'Full Service' and 'Workplace'
// which are legacy internal categories) plus 'Other' for catch-all.
export const VERTICAL_OPTIONS = ['Corporate', 'Healthcare', 'HigherEd', 'Government', 'Hospitality', 'Education', 'Other'];

export const ORDER_STATUS_COLORS = {
  Entered: '#9B9B9B',
  Acknowledged: '#5B7B8C',
  'In Production': '#C4956A',
  Shipped: '#4A7C59',
  Delivered: '#4A7C59',
  Installed: '#2E6B8A',
};

export const MATERIAL_CATEGORIES = [
  { key: 'laminates', label: 'Laminates' },
  { key: 'metals', label: 'Metals' },
  { key: 'upholstery', label: 'Upholstery' },
  { key: 'woods', label: 'Woods' },
  { key: 'paintPlastic', label: 'Paint & Plastic' },
];

export const INSTALL_SPACE_TYPES = ['All', 'Office', 'Lobby', 'Patient', 'Classroom', 'Conference', 'Other'];

/* ── Hierarchy helpers ── */
export const getAllInstalls = (customer) =>
  (customer.projects || []).flatMap(p =>
    (p.installs || []).map(i => ({ ...i, projectId: p.id, projectName: p.name }))
  );

export const getAllProjectsWithMeta = () =>
  MOCK_CUSTOMERS.flatMap(c =>
    (c.projects || []).map(p => ({
      ...p,
      customerId: c.id, customerName: c.name, customerImage: c.image, vertical: c.vertical,
      installCount: (p.installs || []).length,
    }))
  );
