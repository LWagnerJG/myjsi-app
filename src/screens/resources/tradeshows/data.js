// Tradeshows feature data (ASCII only for broad compatibility)
// Added startDate for chronological sorting (descending newest first)
export const TRADESHOWS = [
  {
    id: 'hcd-2025-kc',
    year: 2025,
    name: 'HCD 2025',
    short: 'Kansas City, MO',
    website: 'https://www.jsifurniture.com',
    startDate: '2025-10-06',
    endDate: '2025-10-09',
    hero: {
      subtitle: 'Healthcare Design Conference - Kansas City',
      description: 'Agenda overview for reps: key times to plan meetings, product walk throughs, hospitality touches, and team sync moments.',
      cta: { label: 'Official Site', url: 'https://www.jsifurniture.com' }
    },
    location: {
      address: 'Convention Center - Hall B',
      city: 'Kansas City, MO',
      venue: 'JSI Booth'
    },
    schedule: [
      {
        days: ['Mon Oct 6'],
        events: [
          '8:00am - Booth Prep / Styling',
          '10:30am - Internal Rep Huddle (Booth)',
          '12:00pm - Lunch (on own)',
          '1:00pm - Preview Hours / Early Access',
          '3:30pm - Customer Meetings Block',
          '5:30pm - Evening Hospitality (Offsite)'
        ]
      },
      {
        days: ['Tue Oct 7'],
        events: [
          '8:00am - Coffee Service (Booth Cafe)',
          '9:00am - Show Opens',
          '11:30am - Product Story Tour',
          '12:00pm - Lunch Window',
          '2:00pm - Healthcare Seating Focus Walk',
          '4:30pm - Networking + Refreshments',
          '6:00pm - Day Close'
        ]
      },
      {
        days: ['Wed Oct 8'],
        events: [
          '8:00am - Coffee Service',
          '9:00am - Show Opens',
          '10:00am - CEU Presentation',
          '1:00pm - Client Meetings / Demos',
          '3:30pm - Follow Up Planning Session',
          '5:00pm - Hospitality Mixer'
        ]
      },
      {
        days: ['Thu Oct 9'],
        events: [
          '8:30am - Light Breakfast',
          '9:00am - Final Meetings',
          '12:00pm - Lunch / Tear Down Begins',
          '2:00pm - Booth Strike',
          '4:00pm - Team Debrief (Optional)',
          '5:00pm - Complete'
        ]
      }
    ]
  },
  {
    id: 'design-days-2025',
    year: 2025,
    name: 'Design Days 2025',
    short: 'Fulton Market - Chicago',
    website: 'https://fultonmarketdesigndays.com',
    startDate: '2025-06-09',
    endDate: '2025-06-11',
    hero: {
      subtitle: 'Sparking Joy in Fulton Market',
      description: 'Third year in Fulton Market. Showroom filled with launches, design moments, and surprises to spark connection, creativity, and joy.',
      cta: { label: 'Register now', url: 'https://fultonmarketdesigndays.com' }
    },
    location: {
      address: '345 N Morgan, 6th Floor',
      city: 'Chicago, IL 60607',
      venue: 'JSI Showroom'
    },
    schedule: [
      {
        days: ['Mon Jun 9', 'Tue Jun 10'],
        events: [
          '9:00am - Coffee Bar + Breakfast Bites',
          '11:30am - Light Lunch',
          '3:00pm - Cocktail Hour begins',
          '5:00pm - Doors Close'
        ]
      },
      {
        days: ['Wed Jun 11'],
        events: [
          '9:00am - Doors Open',
          '3:00pm - Thats a Wrap!'
        ]
      }
    ],
    extras: {
      cocktailHour: {
        label: 'Cocktail Hour',
        days: ['Mon', 'Tue'],
        time: '3:00pm',
        description: 'Socialize in the lounge or on the patio.'
      }
    }
  },
  {
    id: 'hcd-2024-preshow',
    year: 2024,
    name: 'HCD 2024 Preshow',
    short: 'Healthcare Design Conference',
    website: 'https://www.jsifurniture.com/about-us/hcd-2024-preshow/',
    startDate: '2024-09-01',
    endDate: '2024-09-02',
    hero: {
      subtitle: 'Healthcare Design Preview',
      description: 'Preview healthcare focused solutions in an intimate setting before the full HCD experience.',
      cta: { label: 'Learn more', url: 'https://www.jsifurniture.com/about-us/hcd-2024-preshow/' }
    },
    location: {
      address: 'TBD',
      city: 'Indianapolis, IN',
      venue: 'JSI Experience'
    },
    schedule: [
      { days: ['Details Coming Soon'], events: ['Schedule will be published closer to show date.'] }
    ]
  },
  {
    id: 'design-days-2024',
    year: 2024,
    name: 'Design Days 2024',
    short: 'Fulton Market - Chicago',
    website: 'https://www.jsifurniture.com/about-us/design-days-2024/',
    startDate: '2024-06-10',
    endDate: '2024-06-12',
    hero: {
      subtitle: 'Celebrating Design Momentum',
      description: 'Highlights from 2024 in Fulton Market: launches, partnerships, and brand storytelling.',
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
    short: 'Fulton Market - Chicago',
    website: 'https://www.jsifurniture.com/about-us/designdays-show-2023/',
    startDate: '2023-06-10',
    endDate: '2023-06-12',
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
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    hero: {
      subtitle: 'Always-On Experience',
      description: 'Year-round environment to explore collections, materials, and workplace stories.',
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
