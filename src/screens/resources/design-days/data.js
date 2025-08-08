// Design Days specific data
export const DESIGN_DAYS_2025 = {
    title: 'Design Days 2025',
    subtitle: 'Sparking Joy in Fulton Market',
    dates: 'June 9–11, 2025',
    location: {
        address: '345 N Morgan, 6th Floor',
        city: 'Chicago, IL 60607',
        building: 'Fulton Market'
    },
    description: `We're back for our third year in the heart of Fulton Market—and we're bringing the joy. 
    Join us June 9–11, 2025 at 345 N Morgan, 6th Floor, for Design Days. Our showroom will be filled with 
    new launches, design moments, and plenty of surprises to spark connection, creativity, and joy.`,
    registrationUrl: 'https://fultonmarketdesigndays.com',
    schedule: [
        {
            days: ['Monday, June 9', 'Tuesday, June 10'],
            events: [
                '9:00am – Coffee Bar + Breakfast Bites',
                '11:30am – Light Lunch',
                '3:00pm – Cocktail Hour begins',
                '5:00pm – Doors Close',
            ],
        },
        {
            days: ['Wednesday, June 11'],
            events: [
                '9:00am – Doors Open',
                '3:00pm – That\'s a Wrap!',
            ],
        },
    ],
    cocktailHour: {
        days: ['Monday, June 9', 'Tuesday, June 10'],
        time: '3:00pm',
        description: 'Grab a drink (or two)! Sip & socialize in our café lounge or outside on the patio that overlooks the city skyline.'
    },
    transportation: [
        {
            type: 'Shuttle bus',
            description: 'Two 56-person coach buses in continuous loop (every 15–20 min)',
            days: 'June 9 – 11',
            route: 'The Mart – Wells & Kinzie ? Emily Hotel Welcome Center'
        },
        {
            type: 'Rickshaw',
            description: 'Electric pedicabs (3–5 person) in loop (every 15–20 min)',
            days: 'June 9 – 11',
            route: 'The Mart – Wells & Kinzie ? Emily Hotel Welcome Center'
        },
    ],
    contest: {
        title: 'Inspired and Unplugged',
        prize: '4-day, 3-night escape for two to Iceland',
        includes: [
            'Boutique stay at Eyja Hotel',
            'Spa day at Blue Lagoon',
            '$1,000 flight voucher'
        ],
        rules: 'Must be present to enter. Stop by our showroom for details.',
        website: 'https://hoteleyja.is'
    }
};

export const DESIGN_DAYS_HIGHLIGHTS = [
    'New product launches',
    'Interactive design moments',
    'Networking opportunities',
    'Complimentary food and beverages',
    'City skyline patio views',
    'Prize raffle opportunities'
];

export const DESIGN_DAYS_CONTACT = {
    email: 'designdays@jsifurniture.com',
    phone: '(812) 482-3204',
    website: 'https://fultonmarketdesigndays.com'
};