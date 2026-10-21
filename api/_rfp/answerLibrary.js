/**
 * Seeded JSI answer library from public cited sources (research spec §3).
 * Every entry has source URL(s), owner, lastReviewed. Flag risks honestly.
 */

export const JSI_ANSWER_LIBRARY = [
  {
    id: 'company-overview',
    category: 'company',
    title: 'Company overview',
    owner: 'JSI Marketing',
    lastReviewed: '2026-03-01',
    needsApproval: false,
    staleAfterMonths: 12,
    tags: ['company', 'jasper', 'heritage', 'capacity', 'offeror', 'experience'],
    sourceUrls: [
      'https://www.jaspergroup.us.com/about-us/our-story/',
      'https://jsifurniture.com/our-story',
      'https://webresources.jsifurniture.com/production/uploads/documents/jg_80historybook-2.pdf',
    ],
    body:
      'JSI is a Jasper Group brand. Jasper Seating was founded in 1929; the JSI contract office division started in 1996. Woodworking heritage dates to 1876 (first patent 1890). The organization employs about 1,000 people across roughly 2.3 million sq. ft. in Dubois and Orange counties, Indiana. Headquarters: 225 Clay St, Jasper, IN 47546 · 800.457.4511.',
  },
  {
    id: 'warranty',
    category: 'warranty',
    title: 'Warranty (public terms)',
    owner: 'JSI Customer Care',
    lastReviewed: '2026-03-01',
    needsApproval: false,
    staleAfterMonths: 6,
    tags: ['warranty', 'lifetime', 'seating', 'casegoods', 'multi-shift'],
    sourceUrls: [
      'https://jasperwebsites.blob.core.windows.net/production/uploads/jsi_warrantyinformation_IvcWQpZ.pdf',
      'https://webresources.jsifurniture.com/production/uploads/jsi_lok_pricelist.pdf',
    ],
    body:
      'Limited Lifetime Warranty to the original purchaser, based on single-shift 40-hr/week use; JSI repairs or replaces at its option. 12 years: wood seating, seating controls, pneumatic cylinders, laminate, veneer, solid surface, and Somna/Kindera/Satisse/Forge in multi-shift use. 10 years: recliner mechanisms. 5 years: casters, glides, electric height-adjustable bases, task lights, mesh/knit, electrical, foam. Replacement parts: 2 years or remaining warranty, whichever is longer. Textiles carry the supplier’s warranty; COM/COL is excluded.',
    riskFlags: ['If the RFP requires warranty beyond these published terms, flag as Gap / needs Spec.'],
  },
  {
    id: 'ansi-bifma-testing',
    category: 'compliance',
    title: 'ANSI/BIFMA testing',
    owner: 'JSI Product',
    lastReviewed: '2026-03-01',
    needsApproval: false,
    staleAfterMonths: 12,
    tags: ['bifma', 'ansi', 'testing', 'structural', 'x5.1'],
    sourceUrls: [
      'https://www.bifma.org/members/?id=16386942',
      'https://webresources.jsifurniture.com/production/uploads/documents/Sustainability_0624.pdf',
    ],
    body:
      'JSI has been a BIFMA member since 2009 and tests products to applicable ANSI/BIFMA standards for the category offered. Confirm the exact X5.x standard and third-party test reports required by the solicitation before attaching certificates.',
  },
  {
    id: 'level-self-certified',
    category: 'sustainability',
    title: 'BIFMA e3 / LEVEL (self-certified — risk)',
    owner: 'JSI Product',
    lastReviewed: '2026-03-01',
    needsApproval: true,
    staleAfterMonths: 6,
    tags: ['level', 'bifma e3', 'sustainability', 'silver', 'third-party'],
    sourceUrls: [
      'https://webresources.jsifurniture.com/production/uploads/documents/Sustainability_0624.pdf',
      'https://www.bifma.org/page/level-designersandbuyers',
    ],
    body:
      'JSI states ANSI/BIFMA e3 self-certified Silver and participates on the e3 committee. [RISK] This is self-certified — if the solicitation requires a third-party LEVEL certificate, do NOT claim third-party LEVEL; mark Gap and escalate to Spec.',
    riskFlags: ['LEVEL self-certified vs third-party certificate required'],
  },
  {
    id: 'greenguard',
    category: 'sustainability',
    title: 'GREENGUARD / VOC',
    owner: 'JSI Product',
    lastReviewed: '2026-03-01',
    needsApproval: true,
    staleAfterMonths: 6,
    tags: ['greenguard', 'ul 2818', 'voc', 'leed', 'fsc'],
    sourceUrls: [
      'https://webresources.jsifurniture.com/production/uploads/documents/Sustainability_0624.pdf',
    ],
    body:
      'JSI states its products are UL 2818 GREENGUARD certified and can contribute to LEED credits; FSC and USGBC partnerships noted in sustainability materials. Water-based glues and recycled finish waste practices are described publicly. [needs approval] Attach current certificates for the specific SKUs offered.',
    riskFlags: ['Confirm current GREENGUARD certificates per SKU before submission'],
  },
  {
    id: 'gsa-contract',
    category: 'compliance',
    title: 'GSA MAS contract GS-28F-0030U',
    owner: 'JSI Contracts',
    lastReviewed: '2026-03-01',
    needsApproval: false,
    staleAfterMonths: 3,
    tags: ['gsa', 'mas', 'gs-28f-0030u', 'taa', 'sin 33721', 'cage'],
    sourceUrls: [
      'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/Contract%20GS-28F-0030U',
      'https://www.gsaelibrary.gsa.gov/ElibMain/home.do/sinDetails.do?executeQuery=YES&scheduleNumber=MAS&specialItemNumber=33721',
    ],
    body:
      'GSA contract GS-28F-0030U, valid through June 24, 2028. SINs 33721, OLM, and 339113H. FOB destination, 48 contiguous states. Lead time typically 30–75 days ARO; Quickship 15–20 days. Terms 1% 15 / net 30. Min order $100, max $250k. Install capped at 30% of net product. Open to all JSI dealers. CAGE 31881. Series on contract include Wellington, Vision, Walden, Brogan, Finale, Flux, BeSpace, Arwyn, Lok, Draft, and others.',
    riskFlags: ['TAA / Buy American: confirm product origin for the specific offer before claiming compliance'],
  },
  {
    id: 'lead-time',
    category: 'manufacturing',
    title: 'Lead time / Quickship',
    owner: 'JSI Operations',
    lastReviewed: '2026-03-01',
    needsApproval: false,
    staleAfterMonths: 6,
    tags: ['lead time', 'quickship', 'aro', 'delivery'],
    sourceUrls: [
      'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/Contract%20GS-28F-0030U',
    ],
    body:
      'Under GSA GS-28F-0030U published terms: standard lead time 30–75 days ARO; Quickship 15–20 days where applicable. Confirm current lead times with Customer Care for the specific series and options on this bid.',
  },
  {
    id: 'install-cap-gsa',
    category: 'pricing',
    title: 'Installation fee cap (GSA)',
    owner: 'JSI Contracts',
    lastReviewed: '2026-03-01',
    needsApproval: false,
    staleAfterMonths: 6,
    tags: ['install', 'gsa', '30%', 'pricing'],
    sourceUrls: [
      'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/Contract%20GS-28F-0030U',
    ],
    body:
      'On GSA GS-28F-0030U, installation is capped at 30% of net product. Use this as a hard ceiling on any GSA-priced worksheet.',
  },
  {
    id: 'taa-buy-american',
    category: 'compliance',
    title: 'TAA / Buy American (needs confirmation)',
    owner: 'JSI Contracts',
    lastReviewed: '2026-03-01',
    needsApproval: true,
    staleAfterMonths: 3,
    tags: ['taa', 'buy american', 'trade', 'compliance'],
    sourceUrls: [
      'https://info.winvale.com/blog/how-do-sell-furniture-gsa-mas-program',
      'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/Contract%20GS-28F-0030U',
    ],
    body:
      '[needs approval] GSA MAS furniture offers generally require TAA compliance. Do not assert Buy American or TAA for a specific line without confirming country of origin for that SKU. Escalate country-of-origin questions to Contracts.',
    riskFlags: ['TAA / Buy American — verify per SKU'],
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
    sourceUrls: entry.sourceUrls,
    riskFlags: entry.riskFlags || [],
  }));
}

export function isStale(entry, asOf = new Date()) {
  if (!entry?.lastReviewed) return true;
  const reviewed = new Date(entry.lastReviewed);
  if (Number.isNaN(reviewed.getTime())) return true;
  const months = entry.staleAfterMonths ?? 12;
  const cutoff = new Date(asOf);
  cutoff.setMonth(cutoff.getMonth() - months);
  return reviewed < cutoff;
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
    if (/level|third.?party/i.test(hay) && entry.id === 'level-self-certified') score += 4;
    if (/warrant/i.test(hay) && entry.id === 'warranty') score += 3;
    if (/gsa|mas|gs-28/i.test(hay) && entry.id === 'gsa-contract') score += 3;
    return { entry, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((s) => s.entry);
}
