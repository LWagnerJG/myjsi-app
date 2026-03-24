/* ── RFP Responder Mock Data ─────────────────────────────────────── */

export const PROCESSING_STEPS = [
  { id: 'requirements', label: 'BPA Scope & Structure', statusText: 'Parsing solicitation number, zones, period of performance, and estimated value…' },
  { id: 'furniture-codes', label: 'Furniture Code Extraction', statusText: 'Mapping item codes to categories — workstations, benching, seating, tables, storage…' },
  { id: 'specs', label: 'Specification Compliance', statusText: 'Cross-referencing ANSI/BIFMA structural requirements and Section 8.0 furniture specs…' },
  { id: 'product-fit', label: 'JSI Product Matching', statusText: 'Scoring JSI series against SOW item codes and sample project typicals…' },
  { id: 'dealer', label: 'Response Assembly', statusText: 'Preparing editable sections for your review…' },
];

export const CLARIFICATION_QUESTIONS = [
  {
    question: 'Which zone(s) is your dealer network responding to?',
    rfpExcerpt: 'Section 2.0 defines three zones: East (Regions 1–4, 11), Central (Regions 5–7), and West (Regions 8–10 including OCONUS). Offerors may bid on one, two, or all three zones.',
    choices: ['East (Regions 1–4, 11)', 'Central (Regions 5–7)', 'West (Regions 8–10, OCONUS)', 'All Zones', 'Not sure yet'],
  },
  {
    question: 'How should we handle the product line limit per item code?',
    rfpExcerpt: 'Section 4.0(G): Offerors shall submit no more than 3 product lines per item code, with exceptions for WMD, WSD, WLF, WWD, WWC, SO, and PLW which allow up to 4.',
    choices: ['Prioritize our best 2–3 lines', 'Max out the allowance where possible', 'I\'ll decide per code later', 'Not sure yet'],
  },
  {
    question: 'What discount tier should we quote for seating?',
    rfpExcerpt: 'Section 3.0: Sample project pricing shall reflect the Offeror\'s best commercial pricing. Pricing will be evaluated on a per-zone basis. Volume discount schedules may be submitted as part of the pricing proposal.',
    choices: ['Aggressive — win on price', 'Standard GSA contract pricing', 'Premium — justify with service value', 'Not sure yet'],
  },
  {
    question: 'How should we handle the items JSI doesn\'t manufacture?',
    rfpExcerpt: 'The SOW includes demountable walls (DW) and high-density storage systems (HDS) — categories outside the current JSI portfolio.',
    choices: ['Flag as partner / subcontractor scope', 'I have teaming partners lined up', 'Exclude from response', 'Not sure yet'],
  },
];

export const MOCK_RESPONSE = {
  projectRequirements: {
    confidence: 'High',
    fields: {
      projectName: 'GSA Large Furniture Projects BPA — Office Furniture & Related Services',
      dueDate: 'November 14, 2025',
      deliverables:
        'Solicitation 47QSMA25Q0082 — Blanket Purchase Agreement for workstations, benching, private offices, technical work benches, high-density storage, demountable walls, seating, tables, meeting & touchdown spaces, open area storage, and ancillary items. Includes design, project management, and installation services across GSA National Regions. 1 base year + 4 option years. Estimated BPA value: $50M.',
      alternates:
        'Product line submissions per item code (max 3 lines per code, 4 for WMD/WSD/WLF/WWD/WWC/SO/PLW).\nDigital locks and power on seating/tables excluded from product line count limits.\nUpholstery quoted at mid-grade per manufacturer scale.',
      gaps:
        '• Sample project pricing (Section 3.0) quantities established but BPA call-level quantities TBD.\n• Union/prevailing wage rates will be established at BPA call level — not included in initial response.\n• Warehousing beyond 30 days to be negotiated per BPA call.\n• Design and installation hourly rates must not exceed GSA MAS contract terms.',
    },
  },

  businessFaqs: {
    confidence: 'High',
    items: [
      {
        question: 'Company Information & Capacity',
        rfpQuestion: 'Provide documentation demonstrating the Offeror\'s ability to respond to multiple concurrent RFQs, manage simultaneous design, manufacture, and installation projects, and deliver services across multiple zones as described in Section 4.0(F).',
        answer:
          'JSI is a privately held furniture manufacturer based in Jasper, Indiana, with over 100 years of woodworking heritage. We operate a 1.2 million sq. ft. manufacturing campus and serve commercial, education, government, and healthcare markets through a national dealer network. JSI has the capacity to respond to multiple concurrent RFQs and manage simultaneous design, manufacture, and installation across zones as required by Section 4.0(F).',
      },
      {
        question: 'Structural & Testing Compliance',
        rfpQuestion: 'All products offered must comply with applicable ANSI/BIFMA testing standards for the product category offered. Provide documentation of third-party testing and certification for each product line submitted under this solicitation.',
        answer:
          'All JSI seating complies with ANSI/BIFMA X5.1. Desk and table products comply with ANSI/BIFMA X5.5. Panel systems comply with ANSI/BIFMA X5.6. Storage units comply with ANSI/BIFMA X5.9. JSI seating carries BIFMA LEVEL® 2 certification. Products are tested by independent third-party laboratories.',
      },
      {
        question: 'Warranty',
        rfpQuestion: 'Describe the warranty coverage, terms, and conditions for all product categories offered. Include the timeline for replacement of missing or damaged products per Section 5.0(I).',
        answer:
          'JSI provides a Limited Lifetime Warranty on all casegoods and desking. Seating carries a 12-year warranty covering defects in materials and workmanship under normal commercial use. Replacement of missing or damaged products within 20 business days per Section 5.0(I).',
      },
      {
        question: 'Sustainability & Environmental',
        rfpQuestion: 'Describe environmental sustainability practices, including materials sourcing, VOC emissions, environmental certifications, and packaging disposal and recycling practices per Section 13.0.',
        answer:
          'Products manufactured using no-added-formaldehyde composite panels. Low-VOC finishes. BIFMA LEVEL® program participant. Packaging uses recycled content and recyclable materials. JSI participates in responsible disposal and recycling of packing materials per Section 13.0.',
      },
      {
        question: 'Compliance & Trade Agreements',
        rfpQuestion: 'Provide documentation of Buy American Act and TAA compliance, ADA/ABA accessibility standards per Section 5.0(E), HSPD-12 security clearance capability, and UL listing for all electrical components including 8-wire, 4-2-2 configuration requirements.',
        answer:
          'JSI products are manufactured in Jasper, IN — fully compliant with the Buy American Act and TAA requirements. Products comply with applicable ADA/ABA accessibility standards per Section 5.0(E). HSPD-12 security requirements acknowledged. All electrical components are UL listed and meet 8-wire, 4-2-2 configuration requirements with 20 amp outlets and circuit identification.',
      },
    ],
  },

  visualIntent: {
    confidence: 'Medium',
    summary:
      'This BPA is specification-driven rather than design-driven — Section 7.0 focuses on materials, dimensions, and finishes rather than a specific aesthetic direction. For the sample project, upholstery is quoted at mid-grade per manufacturer scale. Laminate options include HPL for worksurfaces and TFL/HPL for case and panels. Veneer is specified for Private Office typicals (PO-1). Metal finishes required across storage and seating frames.',
    finishCallouts:
      '• HPL worksurfaces (all workstation, benching, and table categories)\n• TFL or HPL for case/panel goods where applicable\n• Veneer required for Private Office typical PO-1 (worksurface, lateral file, wardrobe combination, closed overhead, mobile pedestal)\n• Mid-grade upholstery — JSI Grade 3 or 4 on sequential scale\n• Metal storage finished in standard paint options\n• Edge treatment: flat or eased per Section 8.0 specifications',
  },

  productFit: {
    confidence: 'Medium',
    typicals: [
      {
        itemCode: 'BCH-1',
        category: 'Benching Workstation',
        series: 'Vision',
        image: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/t_large/c_limit,w_1200/f_auto/q_auto/v1/jsi_vision_enviro_00014_d3aygj',
        rfpRequirement: 'Section 8.0(A): 60" W single-sided benching workstation with privacy screen, base in-feed power/data at worksurface height, 24"–26" depth, modesty panel, and wire management trough.',
        rationale: 'Vision benching delivers a 60" single-sided configuration with integrated base in-feed for power and data at worksurface height. The system supports 24"–26" depth options as specified. Privacy screens mount directly to the worksurface with no additional framing, and the built-in wire management trough routes cabling cleanly from the base in-feed to device level.',
      },
      {
        itemCode: 'PO-1',
        category: 'Private Office',
        series: 'Vision',
        image: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/t_large/c_limit,w_1200/f_auto/q_auto/v1/jsi_vision_config_000009_bi3fmy',
        rfpRequirement: 'Section 8.0(C): 7\'-0" × 8\'-0" L-shape private office typical in veneer. Includes: (PWS) 72"W×24"D worksurface, (PAH) 60"W×24"D adjustable height worksurface, (PTK) 72"W tackable surface, (PLF) 30"W×2H lateral file, (PWC) 24"W×24"D wardrobe combination, (PMD) mobile pedestal, (PCO) 36"W closed overhead ×2. All veneer with key locks on storage.',
        rationale: 'Vision provides the full PO-1 component list in a unified veneer finish. The 72"×24" primary worksurface pairs with a 60"×24" electric adjustable height peninsula — meeting the PAH requirement with a height range of 22.6"–48.7". The 30"W two-high lateral file and 24"W wardrobe combination include key locks as specified. Two 36"W closed overheads mount above the credenza. A tackable fabric panel and cushion-top mobile pedestal complete the typical. Flat and D-shape/bullet worksurface edges are available per Section 8.0(C)(c), with grommet for power passthrough.',
        components: '(PWS) 72"W×24"D Worksurface — Veneer\n(PAH) 60"W×24"D Adj. Height — Veneer\n(PTK) 72"W Tackable Surface\n(PLF) 30"W×2H Lateral File — Veneer, Key Lock\n(PWC) 24"W×24"D Wardrobe Combo — Veneer, Key Lock\n(PMD) Mobile Pedestal — Veneer, Cushion Top, Key Lock\n(PCO) 36"W Closed Overhead ×2 — Veneer, Key Lock',
      },
      {
        itemCode: 'NT-1',
        category: 'Nesting Table',
        series: 'Moto',
        image: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/t_large/c_limit,w_1200/f_auto/q_auto/v1/jsi_moto_enviro_00019',
        rfpRequirement: 'Section 8.0(K): Flip-top nesting table, 72"×24"×28"–30"H. Laminate top, modesty panel, power module with daisy chaining capability, and integrated wire management.',
        rationale: 'Moto flip-top nesting tables meet the 72"×24" footprint and 28"–30" height range. The flip-top mechanism allows quick reconfiguration and nesting for storage. Laminate top is standard, with an integrated modesty panel. Power modules with daisy chain capability mount in-top, keeping cabling organized across ganged configurations.',
      },
      {
        itemCode: 'LG-1',
        category: 'Lounge Seating',
        series: 'Indie',
        image: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/t_large/c_limit,w_1200/f_auto/q_auto/v1/jsi_indie_enviro_00020_zoq0fr',
        rfpRequirement: 'Section 8.0(L): Lounge chair, sofa, and high-back configurations for collaborative and quiet zones. Power/USB options required. Dimensional specs for LG-1 (single seat), LG-2 (loveseat), LG-3 (sofa), HLG-3 (high-back sofa).',
        rationale: 'Indie provides freestanding lounge seating in single-seat, loveseat, and sofa configurations matching LG-1 through LG-3 dimension requirements. High-back versions (HLG-3) offer acoustic privacy for focused work. Integrated power with USB charging is available through hanging power modules. The collection\'s modular design supports benches, ottomans, and privacy screen accessories for flexible zone planning.',
      },
      {
        itemCode: 'TC-1',
        category: 'Task Seating',
        series: 'Protocol',
        image: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/t_large/c_limit,w_1200/f_auto/q_auto/v1/jsi_protocol_enviro_00002',
        rfpRequirement: 'Section 8.0(H): Task chair (TC), heavy-duty task chair (THD), and task stool (TST) must be offered from the same product line family. Mesh back, adjustable lumbar, multi-function mechanism, 5-star base with hard and soft casters.',
        rationale: 'Protocol satisfies the single-family requirement across TC, THD, and TST from one product line. Mesh back with adjustable lumbar support is standard. The synchro-tilt multi-function mechanism provides seat depth adjustment, tilt tension, and tilt lock. 5-star base is available in polished aluminum or black nylon with both hard (carpet) and soft (hard floor) casters. The heavy-duty variant supports 350 lbs per Section 8.0(H)(2).',
      },
      {
        itemCode: 'SHC-1',
        category: 'Guest & Stacking Chair',
        series: 'Knox',
        image: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/t_large/c_limit,w_1200/f_auto/q_auto/v1/jsi_knox_enviro_00028_yil44t',
        rfpRequirement: 'Section 8.0(I): Standard height chair (SHC), counter height stool (CHS), and bar height stool (BHS) from the same product line. Plywood back with upholstered seat pad or molded plastic. Armless. Stackable.',
        rationale: 'Knox offers standard height, counter height, and bar height models from a single product line family — meeting the SHC/CHS/BHS requirement. The multi-use chair stacks up to 8 high for efficient storage. Plywood back with upholstered seat pad and molded plastic options are both available. Armless, arm, and easy-access configurations offered. Knox also supports tandem/ganging brackets for row seating in training and event configurations.',
      },
      {
        itemCode: 'CFT-1',
        category: 'Conference Table',
        series: 'Wellington',
        image: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/t_large/c_limit,w_1200/f_auto/q_auto/v1/jsi_wellington_enviro_00005',
        rfpRequirement: 'Section 8.0(M): Conference table, 96"×36", ellipse/oval/racetrack shape with panel base. Recessed power module with minimum 3 power outlets, 2 USB, HDMI, and data connections. Laminate and veneer options.',
        rationale: 'Wellington conference tables are available in the 96"×36" size with racetrack and boat-shape options on panel bases. Both laminate and veneer finishes are supported. Recessed power modules integrate 3 power + 2 USB + HDMI + data as specified. Grommets with flip lids provide clean cable access. Traditional design language brings executive presence appropriate for government boardrooms and formal meeting spaces.',
      },
    ],
    assumptions:
      '• Sample project quantities per Section 3.0 used for pricing basis (20 WK-1, 10 BCH-1, 10 PO-1, etc.).\n• Task seating (TC, THD, TST) quoted from single product line family as required.\n• Standard height chair (SHC), counter height stool (CHS), and bar height stool (BHS) from same product line.\n• All lateral files and bookcases quoted to match heights/depths within each category.\n• Power modules quoted separately from product line count per Section 4.0(G).',
    gaps:
      '• Demountable walls (DW) — not a JSI product category, requires teaming partner.\n• High-density storage systems (HDS) — not a JSI product category, requires teaming partner.\n• Technical work benches (TWB) — ESD-controlled laminate and wood butcher block worksurfaces outside JSI portfolio.\n• Lounge serpentine seating (LSS-1) — inside/outside wedge seat configuration availability to be verified.\n• Phone booth (PB) — freestanding enclosed booth with sprinkler provision, not standard JSI offering.',
  },

  dealerNotes: {
    confidence: 'Low',
    fields: {
      projectNotes: 'BPA period: 1 base year + 4 option years. Respond to multiple concurrent RFQs. Dealer network must be educated on SOW requirements per Section 4.0(E). Proof of insurance required 72 hours prior to deliveries. HSPD-12 security adjudication required for all personnel entering Government facilities.',
      nonJsiScope:
        'Demountable walls (DW-1 typical — solid and glass panels, swing doors, STC 39/35 acoustic, UL classified).\nHigh-density storage systems (HDS-1 typical — electric, floor track + carriages, seismic features, 1,000 lbs/carriage foot).\nTechnical work benches (TWB-1 typical — welded frame, ESD laminate, butcher block options).\nPhone booths (PB — freestanding, enclosed, sprinkler provision).',
      otherManufacturers: 'Demountable walls: TBD teaming partner\nHigh-density storage: TBD teaming partner\nTechnical work benches: TBD teaming partner',
      commercialExceptions: 'Hourly rates for design, PM, and installation shall not exceed GSA MAS contract terms.\nWarehousing included at no charge for first 30 days; extended storage negotiated per BPA call.\nUnion/prevailing wage rates excluded from BPA-level pricing — addressed at call level.',
    },
  },
};
