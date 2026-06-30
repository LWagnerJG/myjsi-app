/**
 * Per-series specification prompts for the project detail "Specs & Quote" card.
 *
 * Each JSI series carries different material decisions. Rather than ask the same
 * two generic questions for everything, we ask what actually matters for that
 * product type — e.g. casegoods need a surface material (laminate vs. veneer),
 * a shell seat like Knox needs plastic vs. wood, and a wood-base chair like
 * Arwyn needs a foot material.
 *
 * Sourced from JSI price lists / product pages (jsifurniture.com):
 *  - Vision casegoods: TFL / HPL laminate, Veneer Essentials / Artisan collections
 *  - Knox: plastic, wood veneer back, or fully upholstered shells
 *  - Hoopz: plastic or upholstered seat on a metal frame
 *  - Arwyn: wood or metal foot
 */

// Reusable answer sets (empty value = "TBD", shown via the select placeholder).
const OPTIONS = {
  surface: ['TFL Laminate', 'HPL Laminate', 'Veneer – Essentials', 'Veneer – Artisan'],
  power: ['Defined', 'Likely Needed', 'Not Needed'],
  shell: ['Plastic', 'Wood Veneer', 'Upholstered'],
  seat: ['Plastic', 'Upholstered'],
  base: ['Wood', 'Metal'],
  upholstery: ['Standard Grade', 'COM / COL', 'Needs Dealer Input'],
  arms: ['Armless', 'With Arms'],
  primary: ['Laminate', 'Veneer', 'Upholstery', 'Wood', 'Metal', 'Plastic'],
};

// Reusable questions.
const Q = {
  surface: { key: 'surfaceMaterial', label: 'Surface Material', options: OPTIONS.surface },
  power: { key: 'powerData', label: 'Power / Data', options: OPTIONS.power },
  shell: { key: 'shellMaterial', label: 'Shell / Back', options: OPTIONS.shell },
  seat: { key: 'seatMaterial', label: 'Seat', options: OPTIONS.seat },
  base: { key: 'footMaterial', label: 'Foot / Base', options: OPTIONS.base },
  upholstery: { key: 'upholstery', label: 'Upholstery', options: OPTIONS.upholstery },
  arms: { key: 'arms', label: 'Arms', options: OPTIONS.arms },
  primary: { key: 'primaryMaterial', label: 'Primary Material', options: OPTIONS.primary },
};

// Question sets by product family.
const KIND = {
  casegood: [Q.surface, Q.power],
  table: [Q.surface, Q.power],
  storage: [Q.surface],
  shellSeat: [Q.shell, Q.upholstery, Q.arms],   // Knox, Wink
  woodSeat: [Q.shell, Q.base, Q.upholstery],    // Finn-style poly shell + wood/metal legs
  baseSeat: [Q.base, Q.upholstery, Q.arms],     // Arwyn, Satisse, Walden
  stool: [Q.seat, Q.base],                      // Hoopz, Nosh, Prost
  lounge: [Q.base, Q.upholstery],
  task: [Q.arms, Q.upholstery],
  bench: [Q.base, Q.upholstery],
};

// Series → family. Based on the JSI catalogue product type for each name.
const SERIES_KIND = {
  // Casegoods / desks / private office
  Vision: 'casegood', Brogan: 'casegood', Finale: 'casegood', Flux: 'casegood',
  Lincoln: 'casegood', Mackey: 'casegood', Madison: 'casegood', Traditional: 'casegood',
  // Tables / training / occasional
  Bourne: 'table', 'Collective Motion': 'table', Connect: 'table', Draft: 'table',
  Forge: 'table', 'Garvey R5': 'table', Moto: 'table', Newton: 'table', Scroll: 'table',
  Teekan: 'table',
  // Storage
  BeSPACE: 'storage', Lok: 'storage', Totem: 'storage', Privacy: 'storage',
  // Shell seating
  Knox: 'shellSeat', Wink: 'shellSeat',
  // Poly shell + wood/metal base
  Finn: 'woodSeat',
  // Wood/metal base seating
  Arwyn: 'baseSeat', Satisse: 'baseSeat', Walden: 'baseSeat',
  // Stools / cafe
  Hoopz: 'stool', Nosh: 'stool', Prost: 'stool',
  // Task seating
  Bryn: 'task', Copilot: 'task', Kyla: 'task', Protocol: 'task', Proxy: 'task',
  Romy: 'task', Ziva: 'task',
  // Benches
  Americana: 'bench', Boston: 'bench', 'Finn Nu': 'bench', Indie: 'bench',
  Native: 'bench', Oxley: 'bench', Poet: 'bench',
  // Lounge / soft seating
  Addison: 'lounge', Ansen: 'lounge', Anthology: 'lounge', Avini: 'lounge',
  Caav: 'lounge', Cosgrove: 'lounge', Gatsby: 'lounge', Harbor: 'lounge',
  Henley: 'lounge', Jude: 'lounge', Kindera: 'lounge', Millie: 'lounge',
  Ramona: 'lounge', Reef: 'lounge', Ria: 'lounge', Somna: 'lounge', Sosa: 'lounge',
  Trail: 'lounge', Wellington: 'lounge',
};

const FALLBACK = [Q.primary];

/**
 * Returns the ordered list of spec questions for a series.
 * Each entry: { key, label, options }.
 */
export const getSeriesSpecPrompts = (series) => {
  const kind = SERIES_KIND[String(series || '').trim()];
  return kind ? KIND[kind] : FALLBACK;
};
