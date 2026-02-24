// Tradeshows feature data
// Organized by brand/series for the landing page selection flow

// ============================================
// TRADESHOW BRANDS - top-level selection cards
// ============================================
export const TRADESHOW_BRANDS = [
  {
    id: 'design-days',
    name: 'Design Days',
    tagline: 'Fulton Market, Chicago',
    description: 'Our annual celebration of design, innovation, and connection in the heart of Fulton Market.',
    accent: '#5B7B8C',
    icon: 'sparkles',
    heroImage: '/tradeshow-images/JSI_Showroom_05.original.jpg',
    heroFocalPoint: 'center 40%',
  },
  {
    id: 'hcd',
    name: 'HCD',
    tagline: 'Healthcare Design Conference',
    description: 'Showcasing healthcare-focused furniture solutions at the industry\'s premier healthcare design event.',
    accent: '#4A7C59',
    icon: 'heart-pulse',
    heroImage: '/tradeshow-images/JSI_HCD2025_Slider_010_zXE6vkC.width-2000.jpg',
    heroFocalPoint: 'center 45%',
  },
  {
    id: 'edspaces',
    name: 'EdSpaces',
    tagline: 'Education Environments Conference',
    description: 'Inspiring learning environments with thoughtful furniture solutions for K-12 and higher education.',
    accent: '#C4956A',
    icon: 'graduation-cap',
    heroImage: null,
    heroFocalPoint: 'center center',
  },
];

// ============================================
// TRADESHOWS - individual events keyed to brand
// ============================================
export const TRADESHOWS = [
  // ---- Design Days ----
  {
    id: 'design-days-2026',
    brandId: 'design-days',
    year: 2026,
    name: 'Design Days 2026',
    tagline: 'Love What You Do',
    heroImage: '/tradeshow-images/JSI_Chicago_Showroom_HospitalityHub_04.jpg',
    heroFocalPoint: 'center 25%',
    website: 'https://fultonmarketdesigndays.com',
    startDate: '2026-06-08',
    endDate: '2026-06-10',
    status: 'upcoming',
    hero: {
      headline: 'Love What You Do',
      description: 'Fourth year in Fulton Market. Experience new launches, design moments, and surprises that spark connection, creativity, and joy.',
      cta: { label: 'Register Now', url: 'https://fultonmarketdesigndays.com' },
    },
    location: {
      venue: 'JSI Showroom',
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
    },
    schedule: [
      {
        days: ['Mon Jun 8', 'Tue Jun 9'],
        events: [
          { time: '9:00 AM', label: 'Coffee Bar + Breakfast Bites' },
          { time: '11:30 AM', label: 'Light Lunch' },
          { time: '3:00 PM', label: 'Cocktail Hour begins' },
          { time: '5:00 PM', label: 'Doors Close' },
        ],
      },
      {
        days: ['Wed Jun 10'],
        events: [
          { time: '9:00 AM', label: 'Doors Open' },
          { time: '3:00 PM', label: "That's a Wrap!" },
        ],
      },
    ],
    highlights: [
      'New product launches across seating, tables & storage',
      'Live material + finish explorations',
      'Cocktail hour on the patio Mon & Tue at 3 PM',
      'Design community networking',
    ],
  },
  {
    id: 'design-days-2025',
    brandId: 'design-days',
    year: 2025,
    name: 'Design Days 2025',
    tagline: 'Sparking Joy in Fulton Market',
    heroImage: '/tradeshow-images/Hospitality_Hub_04.JPG',
    heroFocalPoint: 'center 35%',
    website: 'https://www.jsifurniture.com/about-us/design-days-2025/',
    startDate: '2025-06-09',
    endDate: '2025-06-11',
    status: 'past',
    hero: {
      headline: 'Sparking Joy in Fulton Market',
      description: 'Third year in Fulton Market. Our showroom filled with launches, design moments, and surprises to spark connection, creativity, and joy.',
      cta: { label: 'View Recap', url: 'https://www.jsifurniture.com/about-us/design-days-2025/' },
    },
    location: {
      venue: 'JSI Showroom',
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
    },
    schedule: [
      { days: ['Past Event'], events: [{ time: '', label: 'Full 2025 recap available online.' }] },
    ],
    highlights: [
      'New product launches across seating, tables & storage',
      'Live material + finish explorations',
      'Cocktail hour on the patio Mon & Tue at 3 PM',
      'Design community networking',
    ],
  },
  {
    id: 'design-days-2024',
    brandId: 'design-days',
    year: 2024,
    name: 'Design Days 2024',
    tagline: 'Celebrating Design Momentum',
    heroImage: '/tradeshow-images/F091D02A-8F96-475C-B334-F4C317933DD8.jpeg',
    heroFocalPoint: 'center 40%',
    website: 'https://www.jsifurniture.com/about-us/design-days-2024/',
    startDate: '2024-06-10',
    endDate: '2024-06-12',
    status: 'past',
    hero: {
      headline: 'Celebrating Design Momentum',
      description: 'Highlights from 2024 in Fulton Market: launches, partnerships, and brand storytelling.',
      cta: { label: 'View Recap', url: 'https://www.jsifurniture.com/about-us/design-days-2024/' },
    },
    location: {
      venue: 'JSI Showroom',
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
    },
    schedule: [
      { days: ['Past Event'], events: [{ time: '', label: 'Full 2024 recap available online.' }] },
    ],
    highlights: [],
  },
  {
    id: 'design-days-2023',
    brandId: 'design-days',
    year: 2023,
    name: 'Design Days 2023',
    tagline: 'Moments that Inspired',
    heroImage: '/tradeshow-images/JSI_Showroom_05.original.jpg',
    heroFocalPoint: 'center 40%',
    website: 'https://www.jsifurniture.com/about-us/designdays-show-2023/',
    startDate: '2023-06-10',
    endDate: '2023-06-12',
    status: 'past',
    hero: {
      headline: 'Moments that Inspired',
      description: 'A look back at experiences, product introductions, and community engagement from 2023.',
      cta: { label: 'Look Back', url: 'https://www.jsifurniture.com/about-us/designdays-show-2023/' },
    },
    location: {
      venue: 'JSI Showroom',
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
    },
    schedule: [
      { days: ['Past Event'], events: [{ time: '', label: 'Archive showcase.' }] },
    ],
    highlights: [],
  },

  // ---- HCD ----
  {
    id: 'hcd-2025-kc',
    brandId: 'hcd',
    year: 2025,
    name: 'HCD 2025',
    tagline: 'Healthcare Design Conference - Kansas City',
    heroImage: '/tradeshow-images/JSI_HCD2025_Slider_010_zXE6vkC.width-2000.jpg',
    heroFocalPoint: 'center 45%',
    website: 'https://www.jsifurniture.com',
    startDate: '2025-10-06',
    endDate: '2025-10-09',
    status: 'past',
    hero: {
      headline: 'Healthcare Design Conference',
      description: 'Agenda overview for reps: key times to plan meetings, product walk-throughs, hospitality touches, and team sync moments.',
      cta: { label: 'Official Site', url: 'https://www.jsifurniture.com' },
    },
    location: {
      venue: 'JSI Booth - Convention Center Hall B',
      address: 'Convention Center',
      city: 'Kansas City, MO',
    },
    schedule: [
      {
        days: ['Mon Oct 6'],
        events: [
          { time: '8:00 AM', label: 'Booth Prep / Styling' },
          { time: '10:30 AM', label: 'Internal Rep Huddle (Booth)' },
          { time: '12:00 PM', label: 'Lunch (on own)' },
          { time: '1:00 PM', label: 'Preview Hours / Early Access' },
          { time: '3:30 PM', label: 'Customer Meetings Block' },
          { time: '5:30 PM', label: 'Evening Hospitality (Offsite)' },
        ],
      },
      {
        days: ['Tue Oct 7'],
        events: [
          { time: '8:00 AM', label: 'Coffee Service (Booth Cafe)' },
          { time: '9:00 AM', label: 'Show Opens' },
          { time: '11:30 AM', label: 'Product Story Tour' },
          { time: '12:00 PM', label: 'Lunch Window' },
          { time: '2:00 PM', label: 'Healthcare Seating Focus Walk' },
          { time: '4:30 PM', label: 'Networking + Refreshments' },
          { time: '6:00 PM', label: 'Day Close' },
        ],
      },
      {
        days: ['Wed Oct 8'],
        events: [
          { time: '8:00 AM', label: 'Coffee Service' },
          { time: '9:00 AM', label: 'Show Opens' },
          { time: '10:00 AM', label: 'CEU Presentation' },
          { time: '1:00 PM', label: 'Client Meetings / Demos' },
          { time: '3:30 PM', label: 'Follow Up Planning Session' },
          { time: '5:00 PM', label: 'Hospitality Mixer' },
        ],
      },
      {
        days: ['Thu Oct 9'],
        events: [
          { time: '8:30 AM', label: 'Light Breakfast' },
          { time: '9:00 AM', label: 'Final Meetings' },
          { time: '12:00 PM', label: 'Lunch / Tear Down Begins' },
          { time: '2:00 PM', label: 'Booth Strike' },
          { time: '4:00 PM', label: 'Team Debrief (Optional)' },
          { time: '5:00 PM', label: 'Complete' },
        ],
      },
    ],
    highlights: [
      'Healthcare-focused seating and table solutions',
      'CEU presentation on Wed at 10 AM',
      'Evening hospitality mixer',
      'Product demos and walk-throughs',
    ],
  },
  {
    id: 'hcd-2024-preshow',
    brandId: 'hcd',
    year: 2024,
    name: 'HCD 2024 Preshow',
    tagline: 'Healthcare Design Preview',
    heroImage: '/tradeshow-images/jsihealth_hcd_makersmindset_0008.jpg',
    heroFocalPoint: 'center center',
    website: 'https://www.jsifurniture.com/about-us/hcd-2024-preshow/',
    startDate: '2024-09-01',
    endDate: '2024-09-02',
    status: 'past',
    hero: {
      headline: 'Healthcare Design Preview',
      description: 'Preview healthcare-focused solutions in an intimate setting before the full HCD experience.',
      cta: { label: 'Learn More', url: 'https://www.jsifurniture.com/about-us/hcd-2024-preshow/' },
    },
    location: {
      venue: 'JSI Experience',
      address: 'TBD',
      city: 'Indianapolis, IN',
    },
    schedule: [
      { days: ['Past Event'], events: [{ time: '', label: 'Recap available online.' }] },
    ],
    highlights: [],
  },

  // ---- EdSpaces ----
  {
    id: 'edspaces-2025',
    brandId: 'edspaces',
    year: 2025,
    name: 'EdSpaces 2025',
    tagline: 'Designing the Future of Learning',
    heroImage: '/tradeshow-images/edspaces-2025-hero.jpg',
    heroFocalPoint: 'center center',
    website: 'https://www.jsifurniture.com',
    startDate: '2025-11-12',
    endDate: '2025-11-14',
    status: 'past',
    hero: {
      headline: 'Designing the Future of Learning',
      description: 'Explore how JSI furniture solutions create inspiring, flexible learning environments for students and educators alike.',
      cta: { label: 'Learn More', url: 'https://www.jsifurniture.com' },
    },
    location: {
      venue: 'JSI Booth',
      address: 'Convention Center',
      city: 'Charlotte, NC',
    },
    schedule: [
      { days: ['Details Coming Soon'], events: [{ time: '', label: 'Schedule will be published closer to show date.' }] },
    ],
    highlights: [
      'Flexible classroom furniture demos',
      'Collaborative learning environments',
      'K-12 and higher education solutions',
    ],
  },
];

// Helpers
export const findTradeshow = (id) => TRADESHOWS.find((s) => s.id === id);
export const findBrand = (id) => TRADESHOW_BRANDS.find((b) => b.id === id);
export const getShowsByBrand = (brandId) =>
  TRADESHOWS
    .filter((s) => s.brandId === brandId)
    .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
