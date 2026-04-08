/**
 * Product Hub Hierarchy — L1 / L2 / L3 / Model
 *
 * This file models the full product taxonomy that mirrors the Product Hub PRD:
 *   L1 — Product Family / Series  (top-level collection)
 *   L2 — Product Sub-category     (story page, links into products)
 *   L3 — Subseries                (variants within a subcategory)
 *   Model — Individual product    (pricing, lead-time, imagery)
 *
 * Currently populated with static mock data. When the API is ready,
 * replace the static exports in productApi.js with fetch calls —
 * consuming code won't need to change.
 */

const img = (path) => path; // passthrough for public asset paths

// ─── L1: Product Families ────────────────────────────────────────────────────
// Each family maps to one or more L2 subcategories.
export const PRODUCT_FAMILIES = [
  {
    id: 'vision',
    name: 'Vision',
    description: 'Comprehensive workspace and meeting solutions',
    heroImage: img('/category-images/casegood-images/api_vision.jpg'),
    subcategoryIds: ['vision-casegoods', 'vision-conference'],
  },
  {
    id: 'brogan',
    name: 'Brogan',
    description: 'Traditional casegoods and conferencing',
    heroImage: img('/category-images/casegood-images/api_brogan.jpg'),
    subcategoryIds: ['brogan-casegoods', 'brogan-conference'],
  },
  {
    id: 'anthology',
    name: 'Anthology',
    description: 'Premium executive environment',
    heroImage: img('/category-images/casegood-images/api_anthology.jpg'),
    subcategoryIds: ['anthology-casegoods', 'anthology-conference'],
  },
  {
    id: 'arwyn',
    name: 'Arwyn',
    description: 'Full seating family from guest to lounge',
    heroImage: img('/category-images/guest-images/jsi_arwyn_comp_00032.jpg'),
    subcategoryIds: ['arwyn-guest', 'arwyn-swivel', 'arwyn-lounge', 'arwyn-bench'],
  },
  {
    id: 'bourne',
    name: 'Bourne',
    description: 'Versatile seating across applications',
    heroImage: img('/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg'),
    subcategoryIds: ['bourne-guest', 'bourne-lounge'],
  },
  {
    id: 'knox',
    name: 'Knox',
    description: 'Contemporary metal-frame seating',
    heroImage: img('/category-images/guest-images/jsi_knox_comp_00020.jpg'),
    subcategoryIds: ['knox-guest', 'knox-swivel'],
  },
  {
    id: 'finn',
    name: 'Finn',
    description: 'Organic lounge and bench forms',
    heroImage: img('/category-images/lounge-images/api_finn.jpg'),
    subcategoryIds: ['finn-lounge', 'finn-nu-lounge', 'finn-nu-bench'],
  },
  {
    id: 'caav',
    name: 'Caav',
    description: 'Sculptural lounge seating',
    heroImage: img('/category-images/lounge-images/api_caav.jpg'),
    subcategoryIds: ['caav-lounge'],
  },
  {
    id: 'poet',
    name: 'Poet',
    description: 'Expressive lounge and bench collection',
    heroImage: img('/category-images/lounge-images/api_poet.jpg'),
    subcategoryIds: ['poet-lounge', 'poet-bench'],
  },
  {
    id: 'lok',
    name: 'Lok',
    description: 'Flexible training and conferencing tables',
    heroImage: img('/category-images/training-images/api_lok-training.jpg'),
    subcategoryIds: ['lok-training', 'lok-teamwork', 'lok-conference'],
  },
  {
    id: 'moto',
    name: 'Moto',
    description: 'Training, conferencing, and lounge solutions',
    heroImage: img('/category-images/conference-images/api_moto.jpg'),
    subcategoryIds: ['moto-conference', 'moto-training', 'moto-lounge'],
  },
  {
    id: 'connect',
    name: 'Connect',
    description: 'Multi-application workspace furniture',
    heroImage: img('/category-images/training-images/api_connect.jpg'),
    subcategoryIds: ['connect-training', 'connect-casegoods', 'connect-lounge', 'connect-bench'],
  },
  {
    id: 'native',
    name: 'Native',
    description: 'Bench and open-plan solutions',
    heroImage: img('/category-images/bench-images/api_native.jpg'),
    subcategoryIds: ['native-bench', 'native-casegoods'],
  },
  {
    id: 'protocol',
    name: 'Protocol',
    description: 'High-performance task seating',
    heroImage: img('/category-images/swivel-images/api_protocol.jpg'),
    subcategoryIds: ['protocol-swivel'],
  },
  {
    id: 'cosgrove',
    name: 'Cosgrove',
    description: 'Refined guest and task seating',
    heroImage: img('/category-images/swivel-images/api_cosgrove.jpg'),
    subcategoryIds: ['cosgrove-guest', 'cosgrove-swivel'],
  },
  {
    id: 'finale',
    name: 'Finale',
    description: 'Executive casegoods and conferencing',
    heroImage: img('/category-images/casegood-images/api_finale.jpg'),
    subcategoryIds: ['finale-casegoods', 'finale-conference'],
  },
  {
    id: 'walden',
    name: 'Walden',
    description: 'Classic executive workspace',
    heroImage: img('/category-images/casegood-images/api_walden.jpg'),
    subcategoryIds: ['walden-casegoods', 'walden-conference'],
  },
  {
    id: 'wellington',
    name: 'Wellington',
    description: 'Premium traditional workspace',
    heroImage: img('/category-images/casegood-images/api_wellington.jpg'),
    subcategoryIds: ['wellington-casegoods', 'wellington-conference'],
  },
  {
    id: 'flux',
    name: 'Flux',
    description: 'Modern private office solutions',
    heroImage: img('/category-images/casegood-images/api_flux-private-office.jpg'),
    subcategoryIds: ['flux-casegoods'],
  },
  {
    id: 'bespace',
    name: 'BeSPACE',
    description: 'Collaborative open-plan furniture',
    heroImage: img('/category-images/training-images/api_bespace.jpg'),
    subcategoryIds: ['bespace-training', 'bespace-lounge', 'bespace-casegoods', 'bespace-bench'],
  },
];

// ─── L2: Product Sub-categories ──────────────────────────────────────────────
// Each sub-category belongs to a family (L1) and a product category.
// It can contain subseries (L3) or models directly.
export const PRODUCT_SUBCATEGORIES = [
  // Vision family
  { id: 'vision-casegoods', familyId: 'vision', categorySlug: 'casegoods', name: 'Vision Casegoods', description: 'Desks, credenzas, and storage', heroImage: img('/category-images/casegood-images/api_vision.jpg'), modelIds: ['vision-desk-utype', 'vision-desk-ltype', 'vision-credenza', 'vision-lateral'] },
  { id: 'vision-conference', familyId: 'vision', categorySlug: 'conference-tables', name: 'Vision Conference', description: 'Conference and meeting tables', heroImage: img('/category-images/conference-images/api_vision.jpg'), modelIds: ['vision-conf-30x72', 'vision-conf-42x90', 'vision-conf-48x108'] },

  // Brogan family
  { id: 'brogan-casegoods', familyId: 'brogan', categorySlug: 'casegoods', name: 'Brogan Casegoods', description: 'Executive desking and storage', heroImage: img('/category-images/casegood-images/api_brogan.jpg'), modelIds: ['brogan-desk-utype', 'brogan-credenza'] },
  { id: 'brogan-conference', familyId: 'brogan', categorySlug: 'conference-tables', name: 'Brogan Conference', description: 'Meeting and boardroom tables', heroImage: img('/category-images/conference-images/api_brogan.jpg'), modelIds: ['brogan-conf-42x90', 'brogan-conf-54x180'] },

  // Anthology family
  { id: 'anthology-casegoods', familyId: 'anthology', categorySlug: 'casegoods', name: 'Anthology Casegoods', description: 'Premium executive desking', heroImage: img('/category-images/casegood-images/api_anthology.jpg'), modelIds: ['anthology-desk-utype', 'anthology-credenza'] },
  { id: 'anthology-conference', familyId: 'anthology', categorySlug: 'conference-tables', name: 'Anthology Conference', description: 'Premium conference tables', heroImage: img('/category-images/conference-images/api_anthology.jpg'), modelIds: ['anthology-conf-48x108', 'anthology-conf-60x210'] },

  // Arwyn family
  { id: 'arwyn-guest', familyId: 'arwyn', categorySlug: 'guest', name: 'Arwyn Guest', description: 'Side and guest seating', heroImage: img('/category-images/guest-images/jsi_arwyn_comp_00032.jpg'), modelIds: ['arwyn-guest-wood-arm', 'arwyn-guest-wood-armless'] },
  { id: 'arwyn-swivel', familyId: 'arwyn', categorySlug: 'swivels', name: 'Arwyn Swivel', description: 'Task and conference swivel', heroImage: img('/category-images/swivel-images/api_arwyn.jpg'), modelIds: ['arwyn-swivel-mid', 'arwyn-swivel-high'] },
  { id: 'arwyn-lounge', familyId: 'arwyn', categorySlug: 'lounge', name: 'Arwyn Lounge', description: 'Soft seating and lounge', heroImage: img('/category-images/lounge-images/api_arwyn.jpg'), modelIds: ['arwyn-lounge-single', 'arwyn-lounge-settee'] },
  { id: 'arwyn-bench', familyId: 'arwyn', categorySlug: 'benches', name: 'Arwyn Bench', description: 'Multi-seat bench', heroImage: img('/category-images/bench-images/api_arwyn.jpg'), modelIds: ['arwyn-bench-2seat', 'arwyn-bench-3seat'] },

  // Bourne family
  { id: 'bourne-guest', familyId: 'bourne', categorySlug: 'guest', name: 'Bourne Guest', description: 'Versatile guest chairs', heroImage: img('/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg'), modelIds: ['bourne-guest-arm', 'bourne-guest-armless'] },
  { id: 'bourne-lounge', familyId: 'bourne', categorySlug: 'lounge', name: 'Bourne Lounge', description: 'Soft seating options', heroImage: img('/category-images/lounge-images/api_bourne.jpg'), modelIds: ['bourne-lounge-single'] },

  // Knox family
  { id: 'knox-guest', familyId: 'knox', categorySlug: 'guest', name: 'Knox Guest', description: 'Metal-frame guest seating', heroImage: img('/category-images/guest-images/jsi_knox_comp_00020.jpg'), modelIds: ['knox-guest-arm', 'knox-guest-stool'] },
  { id: 'knox-swivel', familyId: 'knox', categorySlug: 'swivels', name: 'Knox Swivel', description: 'Task chair', heroImage: img('/category-images/swivel-images/api_knox.jpg'), modelIds: ['knox-swivel-mid'] },

  // Finn family
  { id: 'finn-lounge', familyId: 'finn', categorySlug: 'lounge', name: 'Finn Lounge', description: 'Lounge seating', heroImage: img('/category-images/lounge-images/api_finn.jpg'), modelIds: ['finn-lounge-single', 'finn-lounge-settee'] },
  { id: 'finn-nu-lounge', familyId: 'finn', categorySlug: 'lounge', name: 'Finn Nu Lounge', description: 'Updated Finn lounge', heroImage: img('/category-images/lounge-images/api_finn-nu.jpg'), modelIds: ['finn-nu-lounge-single'] },
  { id: 'finn-nu-bench', familyId: 'finn', categorySlug: 'benches', name: 'Finn Nu Bench', description: 'Multi-seat bench', heroImage: img('/category-images/bench-images/api_finn-nu.jpg'), modelIds: ['finn-nu-bench-2seat'] },

  // Caav family
  { id: 'caav-lounge', familyId: 'caav', categorySlug: 'lounge', name: 'Caav Lounge', description: 'Sculptural lounge forms', heroImage: img('/category-images/lounge-images/api_caav.jpg'), modelIds: ['caav-lounge-single', 'caav-lounge-settee'] },

  // Poet family
  { id: 'poet-lounge', familyId: 'poet', categorySlug: 'lounge', name: 'Poet Lounge', description: 'Expressive soft seating', heroImage: img('/category-images/lounge-images/api_poet.jpg'), modelIds: ['poet-lounge-single', 'poet-lounge-settee'] },
  { id: 'poet-bench', familyId: 'poet', categorySlug: 'benches', name: 'Poet Bench', description: 'Multi-seat bench', heroImage: img('/category-images/bench-images/api_poet.jpg'), modelIds: ['poet-bench-2seat', 'poet-bench-3seat'] },

  // Lok family
  { id: 'lok-training', familyId: 'lok', categorySlug: 'training-tables', name: 'Lok Training', description: 'Flip-top training tables', heroImage: img('/category-images/training-images/api_lok-training.jpg'), modelIds: ['lok-training-rect', 'lok-training-trap'] },
  { id: 'lok-teamwork', familyId: 'lok', categorySlug: 'training-tables', name: 'Lok Teamwork', description: 'Collaborative tables', heroImage: img('/category-images/training-images/api_lok-teamwork-tables.jpg'), modelIds: ['lok-teamwork-round', 'lok-teamwork-rect'] },
  { id: 'lok-conference', familyId: 'lok', categorySlug: 'conference-tables', name: 'Lok Conference', description: 'Meeting tables', heroImage: img('/category-images/conference-images/api_lok-conference.jpg'), modelIds: ['lok-conf-30x72', 'lok-conf-42x90'] },

  // Moto family
  { id: 'moto-conference', familyId: 'moto', categorySlug: 'conference-tables', name: 'Moto Conference', description: 'Conference tables', heroImage: img('/category-images/conference-images/api_moto.jpg'), modelIds: ['moto-conf-30x72', 'moto-conf-48x108'] },
  { id: 'moto-training', familyId: 'moto', categorySlug: 'training-tables', name: 'Moto Training', description: 'Training tables', heroImage: img('/category-images/training-images/api_moto.jpg'), modelIds: ['moto-training-rect'] },
  { id: 'moto-lounge', familyId: 'moto', categorySlug: 'lounge', name: 'Moto Lounge', description: 'Occasional tables', heroImage: img('/category-images/lounge-images/api_moto.jpg'), modelIds: ['moto-lounge-occasional'] },

  // Connect family
  { id: 'connect-training', familyId: 'connect', categorySlug: 'training-tables', name: 'Connect Training', description: 'Nesting training tables', heroImage: img('/category-images/training-images/api_connect.jpg'), modelIds: ['connect-training-rect', 'connect-training-round'] },
  { id: 'connect-casegoods', familyId: 'connect', categorySlug: 'casegoods', name: 'Connect Casegoods', description: 'Desking and storage', heroImage: img('/category-images/casegood-images/api_connect.jpg'), modelIds: ['connect-desk-ltype'] },
  { id: 'connect-lounge', familyId: 'connect', categorySlug: 'lounge', name: 'Connect Lounge', description: 'Lounge seating', heroImage: img('/category-images/lounge-images/api_connect.jpg'), modelIds: ['connect-lounge-single'] },
  { id: 'connect-bench', familyId: 'connect', categorySlug: 'benches', name: 'Connect Bench', description: 'Multi-seat bench', heroImage: img('/category-images/bench-images/api_connect.jpg'), modelIds: ['connect-bench-2seat'] },

  // Native family
  { id: 'native-bench', familyId: 'native', categorySlug: 'benches', name: 'Native Bench', description: 'Benching and desking', heroImage: img('/category-images/bench-images/api_native.jpg'), modelIds: ['native-bench-120', 'native-bench-180'] },
  { id: 'native-casegoods', familyId: 'native', categorySlug: 'casegoods', name: 'Native Casegoods', description: 'Storage components', heroImage: img('/category-images/casegood-images/api_native.jpg'), modelIds: ['native-storage-low', 'native-storage-tower'] },

  // Protocol family
  { id: 'protocol-swivel', familyId: 'protocol', categorySlug: 'swivels', name: 'Protocol Task', description: 'High-performance task chair', heroImage: img('/category-images/swivel-images/api_protocol.jpg'), modelIds: ['protocol-mid', 'protocol-high'] },

  // Cosgrove family
  { id: 'cosgrove-guest', familyId: 'cosgrove', categorySlug: 'guest', name: 'Cosgrove Guest', description: 'Metal-frame guest', heroImage: img('/category-images/guest-images/jsi_cosgrove_comp_guest_midback_arms_00004.jpg'), modelIds: ['cosgrove-guest-arm'] },
  { id: 'cosgrove-swivel', familyId: 'cosgrove', categorySlug: 'swivels', name: 'Cosgrove Swivel', description: 'Conference swivel', heroImage: img('/category-images/swivel-images/api_cosgrove.jpg'), modelIds: ['cosgrove-swivel-mid'] },

  // Finale family
  { id: 'finale-casegoods', familyId: 'finale', categorySlug: 'casegoods', name: 'Finale Casegoods', description: 'Executive furniture', heroImage: img('/category-images/casegood-images/api_finale.jpg'), modelIds: ['finale-desk-utype'] },
  { id: 'finale-conference', familyId: 'finale', categorySlug: 'conference-tables', name: 'Finale Conference', description: 'Conference tables', heroImage: img('/category-images/conference-images/api_finale.jpg'), modelIds: ['finale-conf-48x108'] },

  // Walden family
  { id: 'walden-casegoods', familyId: 'walden', categorySlug: 'casegoods', name: 'Walden Casegoods', description: 'Classic workspace', heroImage: img('/category-images/casegood-images/api_walden.jpg'), modelIds: ['walden-desk-utype'] },
  { id: 'walden-conference', familyId: 'walden', categorySlug: 'conference-tables', name: 'Walden Conference', description: 'Meeting tables', heroImage: img('/category-images/conference-images/api_walden.jpg'), modelIds: ['walden-conf-54x180'] },

  // Wellington family
  { id: 'wellington-casegoods', familyId: 'wellington', categorySlug: 'casegoods', name: 'Wellington Casegoods', description: 'Premium traditional desking', heroImage: img('/category-images/casegood-images/api_wellington.jpg'), modelIds: ['wellington-desk-utype'] },
  { id: 'wellington-conference', familyId: 'wellington', categorySlug: 'conference-tables', name: 'Wellington Conference', description: 'Boardroom tables', heroImage: img('/category-images/conference-images/api_wellington.jpg'), modelIds: ['wellington-conf-60x210'] },

  // Flux family
  { id: 'flux-casegoods', familyId: 'flux', categorySlug: 'casegoods', name: 'Flux Private Office', description: 'Modern private office', heroImage: img('/category-images/casegood-images/api_flux-private-office.jpg'), modelIds: ['flux-desk-ltype', 'flux-credenza'] },

  // BeSPACE family
  { id: 'bespace-training', familyId: 'bespace', categorySlug: 'training-tables', name: 'BeSPACE Training', description: 'Collaborative training', heroImage: img('/category-images/training-images/api_bespace.jpg'), modelIds: ['bespace-training-rect'] },
  { id: 'bespace-lounge', familyId: 'bespace', categorySlug: 'lounge', name: 'BeSPACE Lounge', description: 'Open-plan lounge', heroImage: img('/category-images/lounge-images/api_bespace.jpg'), modelIds: ['bespace-lounge-single'] },
  { id: 'bespace-casegoods', familyId: 'bespace', categorySlug: 'casegoods', name: 'BeSPACE Casegoods', description: 'Storage and desking', heroImage: img('/category-images/casegood-images/api_bespace.jpg'), modelIds: ['bespace-desk-ltype'] },
  { id: 'bespace-bench', familyId: 'bespace', categorySlug: 'benches', name: 'BeSPACE Bench', description: 'Benching system', heroImage: img('/category-images/bench-images/api_bespace.jpg'), modelIds: ['bespace-bench-120'] },
];

// ─── Models ──────────────────────────────────────────────────────────────────
// Individual products with pricing, lead-time, and attributes.
// "subparent" models contain child variants (e.g. arm/armless).
export const PRODUCT_MODELS = [
  // Vision casegoods models
  { id: 'vision-desk-utype', subcategoryId: 'vision-casegoods', name: 'Vision U-Shape Desk', price: 3200, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_vision.jpg') },
  { id: 'vision-desk-ltype', subcategoryId: 'vision-casegoods', name: 'Vision L-Shape Desk', price: 2944, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_vision.jpg') },
  { id: 'vision-credenza', subcategoryId: 'vision-casegoods', name: 'Vision Credenza', price: 1800, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_vision.jpg') },
  { id: 'vision-lateral', subcategoryId: 'vision-casegoods', name: 'Vision Lateral File', price: 1200, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/casegood-images/api_vision.jpg') },

  // Vision conference models
  { id: 'vision-conf-30x72', subcategoryId: 'vision-conference', name: 'Vision 30×72', price: 4500, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/conference-images/api_vision.jpg') },
  { id: 'vision-conf-42x90', subcategoryId: 'vision-conference', name: 'Vision 42×90', price: 5040, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/conference-images/api_vision.jpg') },
  { id: 'vision-conf-48x108', subcategoryId: 'vision-conference', name: 'Vision 48×108', price: 5850, material: 'laminate', leadTime: '5-7 weeks', image: img('/category-images/conference-images/api_vision.jpg') },

  // Brogan models
  { id: 'brogan-desk-utype', subcategoryId: 'brogan-casegoods', name: 'Brogan U-Shape Desk', price: 4200, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_brogan.jpg') },
  { id: 'brogan-credenza', subcategoryId: 'brogan-casegoods', name: 'Brogan Credenza', price: 2400, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_brogan.jpg') },
  { id: 'brogan-conf-42x90', subcategoryId: 'brogan-conference', name: 'Brogan 42×90', price: 4600, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/conference-images/api_brogan.jpg') },
  { id: 'brogan-conf-54x180', subcategoryId: 'brogan-conference', name: 'Brogan 54×180', price: 6200, material: 'laminate', leadTime: '5-7 weeks', image: img('/category-images/conference-images/api_brogan.jpg') },

  // Anthology models
  { id: 'anthology-desk-utype', subcategoryId: 'anthology-casegoods', name: 'Anthology U-Shape Desk', price: 5900, material: 'veneer', leadTime: '6-8 weeks', image: img('/category-images/casegood-images/api_anthology.jpg') },
  { id: 'anthology-credenza', subcategoryId: 'anthology-casegoods', name: 'Anthology Credenza', price: 3400, material: 'veneer', leadTime: '6-8 weeks', image: img('/category-images/casegood-images/api_anthology.jpg') },
  { id: 'anthology-conf-48x108', subcategoryId: 'anthology-conference', name: 'Anthology 48×108', price: 4700, material: 'veneer', leadTime: '6-8 weeks', image: img('/category-images/conference-images/api_anthology.jpg') },
  { id: 'anthology-conf-60x210', subcategoryId: 'anthology-conference', name: 'Anthology 60×210', price: 7200, material: 'veneer', leadTime: '7-9 weeks', image: img('/category-images/conference-images/api_anthology.jpg') },

  // Arwyn seating models
  { id: 'arwyn-guest-wood-arm', subcategoryId: 'arwyn-guest', name: 'Arwyn Guest Wood Arm', price: 520, legType: 'wood', isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/guest-images/jsi_arwyn_comp_00032.jpg') },
  { id: 'arwyn-guest-wood-armless', subcategoryId: 'arwyn-guest', name: 'Arwyn Guest Armless', price: 480, legType: 'wood', isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/guest-images/jsi_arwyn_comp_00032.jpg') },
  { id: 'arwyn-swivel-mid', subcategoryId: 'arwyn-swivel', name: 'Arwyn Swivel Mid-Back', price: 1300, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/swivel-images/api_arwyn.jpg') },
  { id: 'arwyn-swivel-high', subcategoryId: 'arwyn-swivel', name: 'Arwyn Swivel High-Back', price: 1450, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/swivel-images/api_arwyn.jpg') },
  { id: 'arwyn-lounge-single', subcategoryId: 'arwyn-lounge', name: 'Arwyn Lounge Chair', price: 1500, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_arwyn.jpg') },
  { id: 'arwyn-lounge-settee', subcategoryId: 'arwyn-lounge', name: 'Arwyn Settee', price: 2200, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_arwyn.jpg') },
  { id: 'arwyn-bench-2seat', subcategoryId: 'arwyn-bench', name: 'Arwyn 2-Seat Bench', price: 1400, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/bench-images/api_arwyn.jpg') },
  { id: 'arwyn-bench-3seat', subcategoryId: 'arwyn-bench', name: 'Arwyn 3-Seat Bench', price: 1800, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/bench-images/api_arwyn.jpg') },

  // Bourne models
  { id: 'bourne-guest-arm', subcategoryId: 'bourne-guest', name: 'Bourne Guest Arm', price: 560, legType: 'wood', isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg') },
  { id: 'bourne-guest-armless', subcategoryId: 'bourne-guest', name: 'Bourne Guest Armless', price: 510, legType: 'wood', isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg') },
  { id: 'bourne-lounge-single', subcategoryId: 'bourne-lounge', name: 'Bourne Lounge Chair', price: 1625, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_bourne.jpg') },

  // Knox models
  { id: 'knox-guest-arm', subcategoryId: 'knox-guest', name: 'Knox Guest Arm', price: 640, legType: 'metal', isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/guest-images/jsi_knox_comp_00020.jpg') },
  { id: 'knox-guest-stool', subcategoryId: 'knox-guest', name: 'Knox Counter Stool', price: 720, legType: 'metal', isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/guest-images/jsi_knox_comp_00020.jpg') },
  { id: 'knox-swivel-mid', subcategoryId: 'knox-swivel', name: 'Knox Swivel Mid-Back', price: 940, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/swivel-images/api_knox.jpg') },

  // Finn / Finn Nu models
  { id: 'finn-lounge-single', subcategoryId: 'finn-lounge', name: 'Finn Lounge Chair', price: 1600, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_finn.jpg') },
  { id: 'finn-lounge-settee', subcategoryId: 'finn-lounge', name: 'Finn Settee', price: 2400, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_finn.jpg') },
  { id: 'finn-nu-lounge-single', subcategoryId: 'finn-nu-lounge', name: 'Finn Nu Lounge', price: 1650, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_finn-nu.jpg') },
  { id: 'finn-nu-bench-2seat', subcategoryId: 'finn-nu-bench', name: 'Finn Nu 2-Seat Bench', price: 1480, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/bench-images/api_finn-nu.jpg') },

  // Caav models
  { id: 'caav-lounge-single', subcategoryId: 'caav-lounge', name: 'Caav Lounge Chair', price: 1800, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_caav.jpg') },
  { id: 'caav-lounge-settee', subcategoryId: 'caav-lounge', name: 'Caav Settee', price: 2800, isUpholstered: true, leadTime: '5-7 weeks', image: img('/category-images/lounge-images/api_caav.jpg') },

  // Poet models
  { id: 'poet-lounge-single', subcategoryId: 'poet-lounge', name: 'Poet Lounge Chair', price: 1750, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_poet.jpg') },
  { id: 'poet-lounge-settee', subcategoryId: 'poet-lounge', name: 'Poet Settee', price: 2600, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_poet.jpg') },
  { id: 'poet-bench-2seat', subcategoryId: 'poet-bench', name: 'Poet 2-Seat Bench', price: 1280, isUpholstered: false, leadTime: '3-5 weeks', image: img('/category-images/bench-images/api_poet.jpg') },
  { id: 'poet-bench-3seat', subcategoryId: 'poet-bench', name: 'Poet 3-Seat Bench', price: 1680, isUpholstered: false, leadTime: '3-5 weeks', image: img('/category-images/bench-images/api_poet.jpg') },

  // Lok models
  { id: 'lok-training-rect', subcategoryId: 'lok-training', name: 'Lok Training Rectangle', price: 980, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/training-images/api_lok-training.jpg') },
  { id: 'lok-training-trap', subcategoryId: 'lok-training', name: 'Lok Training Trapezoid', price: 940, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/training-images/api_lok-training.jpg') },
  { id: 'lok-teamwork-round', subcategoryId: 'lok-teamwork', name: 'Lok Teamwork Round', price: 1020, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/training-images/api_lok-teamwork-tables.jpg') },
  { id: 'lok-teamwork-rect', subcategoryId: 'lok-teamwork', name: 'Lok Teamwork Rectangle', price: 1050, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/training-images/api_lok-teamwork-tables.jpg') },
  { id: 'lok-conf-30x72', subcategoryId: 'lok-conference', name: 'Lok Conference 30×72', price: 4300, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/conference-images/api_lok-conference.jpg') },
  { id: 'lok-conf-42x90', subcategoryId: 'lok-conference', name: 'Lok Conference 42×90', price: 4800, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/conference-images/api_lok-conference.jpg') },

  // Moto models
  { id: 'moto-conf-30x72', subcategoryId: 'moto-conference', name: 'Moto Conference 30×72', price: 4000, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/conference-images/api_moto.jpg') },
  { id: 'moto-conf-48x108', subcategoryId: 'moto-conference', name: 'Moto Conference 48×108', price: 5200, material: 'laminate', leadTime: '5-7 weeks', image: img('/category-images/conference-images/api_moto.jpg') },
  { id: 'moto-training-rect', subcategoryId: 'moto-training', name: 'Moto Training Table', price: 900, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/training-images/api_moto.jpg') },
  { id: 'moto-lounge-occasional', subcategoryId: 'moto-lounge', name: 'Moto Occasional Table', price: 1760, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/lounge-images/api_moto.jpg') },

  // Connect models
  { id: 'connect-training-rect', subcategoryId: 'connect-training', name: 'Connect Training Rectangle', price: 850, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/training-images/api_connect.jpg') },
  { id: 'connect-training-round', subcategoryId: 'connect-training', name: 'Connect Training Round', price: 890, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/training-images/api_connect.jpg') },
  { id: 'connect-desk-ltype', subcategoryId: 'connect-casegoods', name: 'Connect L-Shape Desk', price: 4600, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_connect.jpg') },
  { id: 'connect-lounge-single', subcategoryId: 'connect-lounge', name: 'Connect Lounge Chair', price: 1720, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_connect.jpg') },
  { id: 'connect-bench-2seat', subcategoryId: 'connect-bench', name: 'Connect 2-Seat Bench', price: 1600, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/bench-images/api_connect.jpg') },

  // Native models
  { id: 'native-bench-120', subcategoryId: 'native-bench', name: 'Native Bench 120"', price: 1200, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/bench-images/api_native.jpg') },
  { id: 'native-bench-180', subcategoryId: 'native-bench', name: 'Native Bench 180"', price: 1600, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/bench-images/api_native.jpg') },
  { id: 'native-storage-low', subcategoryId: 'native-casegoods', name: 'Native Low Storage', price: 5000, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_native.jpg') },
  { id: 'native-storage-tower', subcategoryId: 'native-casegoods', name: 'Native Tower', price: 5600, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_native.jpg') },

  // Protocol models
  { id: 'protocol-mid', subcategoryId: 'protocol-swivel', name: 'Protocol Mid-Back', price: 1180, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/swivel-images/api_protocol.jpg') },
  { id: 'protocol-high', subcategoryId: 'protocol-swivel', name: 'Protocol High-Back', price: 1350, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/swivel-images/api_protocol.jpg') },

  // Cosgrove models
  { id: 'cosgrove-guest-arm', subcategoryId: 'cosgrove-guest', name: 'Cosgrove Guest Arm', price: 610, legType: 'metal', isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/guest-images/jsi_cosgrove_comp_guest_midback_arms_00004.jpg') },
  { id: 'cosgrove-swivel-mid', subcategoryId: 'cosgrove-swivel', name: 'Cosgrove Swivel Mid-Back', price: 1250, isUpholstered: true, leadTime: '3-5 weeks', image: img('/category-images/swivel-images/api_cosgrove.jpg') },

  // Finale models
  { id: 'finale-desk-utype', subcategoryId: 'finale-casegoods', name: 'Finale U-Shape Desk', price: 4700, material: 'veneer', leadTime: '6-8 weeks', image: img('/category-images/casegood-images/api_finale.jpg') },
  { id: 'finale-conf-48x108', subcategoryId: 'finale-conference', name: 'Finale 48×108', price: 4800, material: 'veneer', leadTime: '6-8 weeks', image: img('/category-images/conference-images/api_finale.jpg') },

  // Walden models
  { id: 'walden-desk-utype', subcategoryId: 'walden-casegoods', name: 'Walden U-Shape Desk', price: 5200, material: 'veneer', leadTime: '6-8 weeks', image: img('/category-images/casegood-images/api_walden.jpg') },
  { id: 'walden-conf-54x180', subcategoryId: 'walden-conference', name: 'Walden 54×180', price: 5100, material: 'veneer', leadTime: '6-8 weeks', image: img('/category-images/conference-images/api_walden.jpg') },

  // Wellington models
  { id: 'wellington-desk-utype', subcategoryId: 'wellington-casegoods', name: 'Wellington U-Shape Desk', price: 5700, material: 'veneer', leadTime: '7-9 weeks', image: img('/category-images/casegood-images/api_wellington.jpg') },
  { id: 'wellington-conf-60x210', subcategoryId: 'wellington-conference', name: 'Wellington 60×210', price: 5400, material: 'veneer', leadTime: '7-9 weeks', image: img('/category-images/conference-images/api_wellington.jpg') },

  // Flux models
  { id: 'flux-desk-ltype', subcategoryId: 'flux-casegoods', name: 'Flux L-Shape Desk', price: 3700, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_flux-private-office.jpg') },
  { id: 'flux-credenza', subcategoryId: 'flux-casegoods', name: 'Flux Credenza', price: 2100, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_flux-private-office.jpg') },

  // BeSPACE models
  { id: 'bespace-training-rect', subcategoryId: 'bespace-training', name: 'BeSPACE Training Table', price: 950, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/training-images/api_bespace.jpg') },
  { id: 'bespace-lounge-single', subcategoryId: 'bespace-lounge', name: 'BeSPACE Lounge Chair', price: 1900, isUpholstered: true, leadTime: '4-6 weeks', image: img('/category-images/lounge-images/api_bespace.jpg') },
  { id: 'bespace-desk-ltype', subcategoryId: 'bespace-casegoods', name: 'BeSPACE L-Shape Desk', price: 5400, material: 'laminate', leadTime: '4-6 weeks', image: img('/category-images/casegood-images/api_bespace.jpg') },
  { id: 'bespace-bench-120', subcategoryId: 'bespace-bench', name: 'BeSPACE Bench 120"', price: 1440, material: 'laminate', leadTime: '3-5 weeks', image: img('/category-images/bench-images/api_bespace.jpg') },
];

// ─── Product Categories (the 7 top-level buckets) ────────────────────────────
// These map to the flat category view on the Products landing page.
export const PRODUCT_CATEGORIES = [
  { slug: 'casegoods', name: 'Casegoods' },
  { slug: 'conference-tables', name: 'Conference Tables' },
  { slug: 'guest', name: 'Guest' },
  { slug: 'lounge', name: 'Lounge' },
  { slug: 'swivels', name: 'Swivels' },
  { slug: 'training-tables', name: 'Training Tables' },
  { slug: 'benches', name: 'Benches' },
];
