// Tradeshows feature data
// Each show follows a common structure so the UI can render consistently
export const TRADESHOWS = [
  {
    id: 'design-days-2025',
    year: 2025,
    name: 'Design Days 2025',
    short: 'Fulton Market • Chicago',
    website: 'https://fultonmarketdesigndays.com',
    hero: {
      subtitle: 'Sparking Joy in Fulton Market',
      description: `We're back for our third year in the heart of Fulton Market and we're bringing the joy. Join us June 9–11, 2025 at 345 N Morgan, 6th Floor, for Design Days. Our showroom will be filled with new launches, design moments, and plenty of surprises to spark connection, creativity, and joy.`,
      cta: { label: 'Register now', url: 'https://fultonmarketdesigndays.com' }
    },
    location: {
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
      venue: 'JSI Showroom'
    },
    schedule: [
      {
        days: ['Monday, June 9', 'Tuesday, June 10'],
        events: [
          '9:00am • Coffee Bar + Breakfast Bites',
          '11:30am • Light Lunch',
          '3:00pm • Cocktail Hour begins',
          '5:00pm • Doors Close'
        ]
      },
      {
        days: ['Wednesday, June 11'],
        events: [
          '9:00am • Doors Open',
          "3:00pm • That's a Wrap!"
        ]
      }
    ],
    extras: {
      cocktailHour: {
        label: 'Cocktail Hour',
        days: ['Mon', 'Tue'],
        time: '3:00pm',
        description: 'Sip & socialize in our café lounge or outside on the patio with skyline views.'
      }
    }
  },
  {
    id: 'hcd-2024-preshow',
    year: 2024,
    name: 'HCD 2024 Preshow',
    short: 'Healthcare Design Conference',
    website: 'https://www.jsifurniture.com/about-us/hcd-2024-preshow/',
    hero: {
      subtitle: 'Healthcare Design Preview',
      description: 'Preview our healthcare-focused solutions in an intimate setting before the full HCD experience.',
      cta: { label: 'Learn more', url: 'https://www.jsifurniture.com/about-us/hcd-2024-preshow/' }
    },
    location: {
      address: 'TBD',
      city: 'TBD',
      venue: 'JSI Experience'
    },
    schedule: [
      { days: ['Coming Soon'], events: ['Schedule will be published closer to show date.'] }
    ]
  },
  {
    id: 'design-days-2024',
    year: 2024,
    name: 'Design Days 2024',
    short: 'Fulton Market • Chicago',
    website: 'https://www.jsifurniture.com/about-us/design-days-2024/',
    hero: {
      subtitle: 'Celebrating Design Momentum',
      description: 'Highlights from our 2024 presence in Fulton Market with launches, partnerships, and immersive brand storytelling.',
      cta: { label: 'Recap', url: 'https://www.jsifurniture.com/about-us/design-days-2024/' }
    },
    location: {
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
      venue: 'JSI Showroom'
    },
    schedule: [
      { days: ['Past Event'], events: ['Full 2024 recap available online.'] }
    ]
  },
  {
    id: 'design-days-2023',
    year: 2023,
    name: 'Design Days 2023',
    short: 'Fulton Market • Chicago',
    website: 'https://www.jsifurniture.com/about-us/designdays-show-2023/',
    hero: {
      subtitle: 'Moments that Inspired',
      description: 'A look back at experiences, product introductions, and community engagement from 2023.',
      cta: { label: 'Look back', url: 'https://www.jsifurniture.com/about-us/designdays-show-2023/' }
    },
    location: {
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
      venue: 'JSI Showroom'
    },
    schedule: [
      { days: ['Past Event'], events: ['Archive showcase'] }
    ]
  },
  {
    id: 'chicago-showroom',
    year: 2024,
    name: 'Chicago Showroom',
    short: 'Fulton Market Access',
    website: 'https://www.jsifurniture.com/about-us/chicago-showroom/',
    hero: {
      subtitle: 'Always-On Experience',
      description: 'Our Chicago showroom is a year-round environment to explore collections, materials, and workplace stories.',
      cta: { label: 'Explore', url: 'https://www.jsifurniture.com/about-us/chicago-showroom/' }
    },
    location: {
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
      venue: 'JSI Showroom'
    },
    schedule: [
      { days: ['Open By Appointment'], events: ['Contact your JSI representative to schedule a visit.'] }
    ]
  }
];

export const findTradeshow = (id) => TRADESHOWS.find(s => s.id === id);
