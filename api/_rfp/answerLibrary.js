/**
 * Seeded JSI answer library for RFP drafting.
 * Only includes claims already present in the repo's RFP mock / product content.
 * Entries marked needsApproval: true must not be treated as final approved copy.
 */

export const JSI_ANSWER_LIBRARY = [
  {
    id: 'company-overview',
    category: 'company',
    title: 'Company overview & capacity',
    owner: 'JSI Marketing (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['company', 'capacity', 'qualification', 'offeror', 'experience'],
    body:
      'JSI is a privately held furniture manufacturer based in Jasper, Indiana, with over 100 years of woodworking heritage. We operate a 1.2 million sq. ft. manufacturing campus and serve commercial, education, government, and healthcare markets through a national dealer network.',
  },
  {
    id: 'ansi-bifma',
    category: 'compliance',
    title: 'ANSI/BIFMA structural & testing',
    owner: 'JSI Product (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['bifma', 'ansi', 'testing', 'structural', 'certification'],
    body:
      'All JSI seating complies with ANSI/BIFMA X5.1. Desk and table products comply with ANSI/BIFMA X5.5. Panel systems comply with ANSI/BIFMA X5.6. Storage units comply with ANSI/BIFMA X5.9. JSI seating carries BIFMA LEVEL® 2 certification. Products are tested by independent third-party laboratories.',
  },
  {
    id: 'warranty',
    category: 'warranty',
    title: 'Warranty',
    owner: 'JSI Customer Care (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['warranty', 'lifetime', 'seating', 'casegoods'],
    body:
      'JSI provides a Limited Lifetime Warranty on all casegoods and desking. Seating carries a 12-year warranty covering defects in materials and workmanship under normal commercial use.',
  },
  {
    id: 'sustainability',
    category: 'sustainability',
    title: 'Sustainability & environmental',
    owner: 'JSI Product (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['sustainability', 'voc', 'formaldehyde', 'packaging', 'environment'],
    body:
      'Products manufactured using no-added-formaldehyde composite panels. Low-VOC finishes. BIFMA LEVEL® program participant. Packaging uses recycled content and recyclable materials.',
  },
  {
    id: 'buy-american-taa',
    category: 'compliance',
    title: 'Buy American / TAA / trade',
    owner: 'JSI Contracts (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['buy american', 'taa', 'trade', 'compliance', 'jasper'],
    body:
      'JSI products are manufactured in Jasper, IN — fully compliant with the Buy American Act and TAA requirements.',
  },
  {
    id: 'ada-accessibility',
    category: 'compliance',
    title: 'ADA / ABA accessibility',
    owner: 'JSI Product (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['ada', 'aba', 'accessibility'],
    body:
      'Products comply with applicable ADA/ABA accessibility standards. [needs approval — confirm applicability per product line for the specific solicitation.]',
  },
  {
    id: 'weight-rating-seating',
    category: 'manufacturing',
    title: 'Seating weight ratings',
    owner: 'JSI Product (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['weight', 'rating', 'seating', '275'],
    body:
      'Applicable JSI seating series are rated to 275 lbs for ANSI/BIFMA commercial seating standards. Internal validation continues beyond 450 lbs to confirm structural reserve above the published rating.',
  },
  {
    id: 'manufacturing-location',
    category: 'manufacturing',
    title: 'Manufacturing location',
    owner: 'JSI Operations (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['manufacturing', 'jasper', 'facility', 'made in usa'],
    body:
      'JSI manufactures at its campus in Jasper, Indiana (headquarters address used in app materials: 5445 N Deerwood Lake Rd / 225 Clay Street references appear in brand materials — confirm the address required by the solicitation before submitting).',
  },
  {
    id: 'ul-electrical',
    category: 'compliance',
    title: 'UL-listed electrical components',
    owner: 'JSI Product (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['ul', 'electrical', 'power', 'usb'],
    body:
      '[needs approval] Confirm UL listing and wiring configuration (e.g. 8-wire / 4-2-2) for the specific power products offered under this solicitation before submitting a compliance claim.',
  },
  {
    id: 'hspd12',
    category: 'compliance',
    title: 'HSPD-12 facility access',
    owner: 'JSI Contracts (seed)',
    lastReviewed: '2025-11-01',
    needsApproval: true,
    tags: ['hspd-12', 'security', 'clearance'],
    body:
      '[needs approval] HSPD-12 security adjudication for personnel entering Government facilities must be confirmed with the responding dealer / installer team for each call order — do not assert blanket clearance.',
  },
];

export function librarySummaryForPrompt() {
  return JSI_ANSWER_LIBRARY.map((entry) => ({
    id: entry.id,
    category: entry.category,
    title: entry.title,
    needsApproval: entry.needsApproval,
    tags: entry.tags,
    body: entry.body,
    owner: entry.owner,
    lastReviewed: entry.lastReviewed,
  }));
}

/** Simple tag overlap scorer for offline drafting fallback. */
export function matchLibraryEntries(requirementText, limit = 3) {
  const hay = String(requirementText || '').toLowerCase();
  const scored = JSI_ANSWER_LIBRARY.map((entry) => {
    let score = 0;
    for (const tag of entry.tags) {
      if (hay.includes(tag.toLowerCase())) score += 2;
    }
    if (hay.includes(entry.category)) score += 1;
    return { entry, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((s) => s.entry);
}
