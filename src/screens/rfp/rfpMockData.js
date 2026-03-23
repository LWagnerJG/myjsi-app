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
    question: 'Which JSI task seating line should we lead with?',
    rfpExcerpt: 'Section 8.0(H): Task chair (TC), heavy-duty task chair (THD), and task stool (TST) must be offered from the same product line family.',
    choices: ['Protocol', 'Ansen', 'Flux', 'Not sure yet'],
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
      { series: 'Vision', type: 'Benching Workstations (BFS/BWS)', fitScore: 93, rationale: 'Covers BCH-1 typical: 60" single-sided benching with privacy screen, base in-feed, and power/data at worksurface. Meets 24"–26" depth requirement.' },
      { series: 'Knox', type: 'Private Office Casegoods (PWS/PLF/PWC)', fitScore: 95, rationale: 'Veneer L-shape typical PO-1: 72"×24" worksurface + 60"×24" adjustable height + lateral file + wardrobe combination + closed overhead. Full veneer finish available.' },
      { series: 'Moto', type: 'Nesting Tables (NT)', fitScore: 91, rationale: 'Flip-top nesting table, 72"×24"×28"–30"H with laminate top, modesty panel, power module with daisy chaining, and wire management per NT-1 typical.' },
      { series: 'Indie', type: 'Lounge Seating (LG/HLG/BAN)', fitScore: 86, rationale: 'Transitional style lounge chairs, sofas, and high-back configurations. Power/USB options. Matches dimensional requirements for LG-1, LG-2, LG-3, HLG-3.' },
      { series: 'Protocol', type: 'Task Seating (TC/THD/TST)', fitScore: 88, rationale: 'Same product line family across task chair, heavy-duty, and stool per Section 8.0(H) requirements. Mesh back, adjustable lumbar, 5-star base with hard/soft casters.' },
      { series: 'Ansen', type: 'Guest & Stacking Chairs (SHC/SC/NC)', fitScore: 84, rationale: 'Standard height chair with plywood back + upholstered seat pad on molded plastic per SHC-1 typical. Armless configuration. Same family for CHS and BHS.' },
      { series: 'Wellington', type: 'Conference Tables (CFT)', fitScore: 90, rationale: 'Laminate and veneer options for CFT-1: 96"×36" ellipse/oval/racetrack with panel base, recessed power module (3 power + 2 USB + HDMI + data).' },
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
