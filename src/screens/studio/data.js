import { FileText, BarChart3, Trophy, Wrench, BookOpen, Lightbulb } from 'lucide-react';

export const SCOPES = {
  public: { label: 'Public', tint: '#4A7C59' },
  company: { label: 'Company', tint: '#5B7B8C' },
  private: { label: 'Private', tint: '#8C7B5B' },
};

// Studio Library — creator-published resources. Add new resources here.
// PDFs should live in /public/one-pagers/ (or any reachable URL).
export const ONE_PAGERS = [
  {
    id: 'forge-vs-traditional-millwork',
    title: 'Forge vs. Traditional Millwork',
    summary: 'A side-by-side breakdown of where pre-engineered Forge casework wins on cost, lead time, quality, and lifecycle.',
    author: { name: 'Luke Wagner', role: 'JSI Sales' },
    scope: 'public',
    template: 'product-one-pager',
    series: 'Forge',
    tags: ['casegoods', 'forge', 'healthcare', 'millwork'],
    cover: '/category-images/casegood-images/jsi_vision_config_000007.jpg',
    pdfUrl: '/one-pagers/forge-vs-traditional-millwork.pdf',
    downloads: 142,
    views: 1284,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: 'vision-private-office-story',
    title: 'Vision: A Quiet Win in a Steelcase Stronghold',
    summary: 'How a 38-station Vision rollout displaced a longtime incumbent — pricing, sample strategy, and the moment the dealer flipped.',
    author: { name: 'Rachel Green', role: 'Designer · OfficeWorks' },
    scope: 'public',
    template: 'project-story',
    series: 'Vision',
    tags: ['vision', 'private office', 'win story'],
    cover: '/category-images/casegood-images/jsi_vision_config_000008.jpg',
    pdfUrl: '/one-pagers/vision-private-office-story.pdf',
    downloads: 87,
    views: 642,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'walden-vs-allsteel',
    title: 'Walden vs. Allsteel Acuity',
    summary: 'Spec parity walk-through, lead-time math, and a clean talking-point sheet for the discovery call.',
    author: { name: 'Sam Patel', role: 'Rep · Continuum' },
    scope: 'company',
    template: 'vs-competitor',
    series: 'Walden',
    tags: ['walden', 'competitive', 'casegoods'],
    cover: '/category-images/casegood-images/jsi_walden_config_00001.jpg',
    pdfUrl: '/one-pagers/walden-vs-allsteel.pdf',
    downloads: 24,
    views: 96,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'finale-install-tips',
    title: 'Finale Install: 9 Things Field Crews Wish They Knew',
    summary: 'Punch-list tips collected from 14 installs — sequencing, common mis-orders, and the quick fix for the back-panel gap.',
    author: { name: 'Mike Donato', role: 'JSI Field Service' },
    scope: 'public',
    template: 'install-tip',
    series: 'Finale',
    tags: ['finale', 'install', 'field tips'],
    cover: '/category-images/casegood-images/jsi_finale_config_00013_UWjv5eM.jpg',
    pdfUrl: '/one-pagers/finale-install-tips.pdf',
    downloads: 213,
    views: 1840,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 21,
  },
  {
    id: 'brogan-soft-seating-guide',
    title: 'Brogan Soft Seating: Quick Spec Guide',
    summary: 'One-page reference: GSA pricing tier, COM yardage, top finish pairings, and lead-time bands.',
    author: { name: 'Luke Wagner', role: 'JSI Sales' },
    scope: 'private',
    template: 'product-one-pager',
    series: 'Brogan',
    tags: ['brogan', 'soft seating', 'spec'],
    cover: '/category-images/casegood-images/jsi_brogan_config_0015.jpg',
    pdfUrl: '/one-pagers/brogan-quick-spec.pdf',
    downloads: 4,
    views: 18,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

export const TEMPLATES = [
  {
    id: 'product-one-pager',
    title: 'Product One-Pager',
    desc: 'Hero photo, key benefits, certs, and an Explore links rail. Great for series intros.',
    icon: FileText,
    accent: '#5B7B8C',
  },
  {
    id: 'vs-competitor',
    title: 'Vs. Competitor',
    desc: 'Side-by-side comparison table — cost, lead time, quality, scalability.',
    icon: BarChart3,
    accent: '#4A7C59',
  },
  {
    id: 'project-story',
    title: 'Project Story',
    desc: 'How JSI won (or surprised). Set the scene, the pivot, and the result.',
    icon: BookOpen,
    accent: '#C4956A',
  },
  {
    id: 'install-tip',
    title: 'Install Tip Sheet',
    desc: 'Field-ready punch list of gotchas, fixes, and sequencing tips.',
    icon: Wrench,
    accent: '#8C7B5B',
  },
];

export const CHALLENGES = [
  {
    id: 'healthcare-casework-q2',
    title: 'Healthcare Casework Refresh',
    deadline: 'Closes May 30',
    prize: '500 studio credits + featured placement',
    blurb: 'Reimagine a Forge nurse-station in 1,200 sq ft. Submit one rendering + a one-page narrative.',
  },
  {
    id: 'lobby-lounge-may',
    title: 'Lobby Lounge: Brogan Edition',
    deadline: 'Closes May 14',
    prize: '250 credits + sample kit',
    blurb: 'Pair Brogan with two non-JSI accent pieces. Post the moodboard, win the spec.',
  },
];

export const PROJECT_STORIES = [
  {
    id: 'story-1',
    quote: 'I didn\u2019t expect JSI to win here \u2014 but Vision came in with the cleanest spec and the lead time saved the schedule.',
    author: 'Designer \u00b7 Continuum',
    detail: 'Solved for custom fit + elevated aesthetic on a 38-station rollout.',
  },
  {
    id: 'story-2',
    quote: 'Walden cleared a Steelcase incumbent on a 22-office refresh \u2014 the GSA tier and finish library closed it.',
    author: 'Rep \u00b7 OfficeWorks',
    detail: 'Side-by-side spec deck and a same-day sample drop.',
  },
];

export const STUDIO_STATS = {
  level: 'Silver',
  nextLevel: 'Gold',
  xp: 1820,
  xpToNext: 2500,
  published: 3,
  usedByOthers: 18,
};

export const FEEDBACK_PROMPTS = [
  { id: 'product-idea', icon: Lightbulb, title: 'Product idea', desc: 'Sketch a series, finish, or config you wish existed.' },
  { id: 'cet-improvement', icon: Wrench, title: 'CET improvement', desc: 'A symbol that misbehaves, a config that hurts.' },
  { id: 'win-the-rfp', icon: Trophy, title: 'Help me win this RFP', desc: 'Drop the requirements, get a same-week response.' },
];
