import React from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { MapPin, Calendar, Bus, Share2 } from 'lucide-react';

export const DesignDaysScreen = ({ theme }) => {
    // Hard-coded schedule and transport data from the site
    const schedule = [
        {
            days: ['Monday, June 9', 'Tuesday, June 10'],
            events: [
                '9:00am – Coffee Bar + Breakfast Bites',
                '11:30am – Light Lunch',
                '5:00pm – Doors Close',
            ],
        },
        {
            days: ['Wednesday, June 11'],
            events: [
                '9:00am – Doors Open',
                '3:00pm – That’s a Wrap!',
            ],
        },
    ];

    const transport = [
        {
            icon: Bus,
            title: 'Shuttle bus',
            desc: `Two 56-person coach buses in continuous loop (every 15–20 min)
Days: June 9 – 11
Stops: The Mart – Wells & Kinzie ? Emily Hotel Welcome Center`,
        },
        {
            icon: Bus,
            title: 'Rickshaw',
            desc: `Electric pedicabs (3–5 person) in loop (every 15–20 min)
Days: June 9 – 11
Stops: The Mart – Wells & Kinzie ? Emily Hotel Welcome Center`,
        },
    ];

    return (
        <div className="px-4 pb-6 space-y-6">
            <PageTitle title="Design Days 2025" theme={theme} />

            {/* Intro */}
            <GlassCard theme={theme} className="p-4 space-y-3">
                <p className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                    Sparking Joy in Fulton Market
                </p>
                <p style={{ color: theme.colors.textSecondary }}>
                    We’re back for our third year in the heart of Fulton Market—and we’re bringing the joy.
                    Join us June 9–11, 2025 at 345 N Morgan, 6th Floor, for Design Days. Our showroom will be filled with new launches, design moments, and plenty of surprises to spark connection, creativity, and joy.
                </p>
                <a
                    href="https://fultonmarketdesigndays.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-semibold mt-2"
                    style={{ color: theme.colors.accent }}
                >
                    Register now ?
                </a>
            </GlassCard>

            {/* Location */}
            <GlassCard theme={theme} className="p-4 flex items-start space-x-3">
                <MapPin className="w-6 h-6" style={{ color: theme.colors.secondary }} />
                <div>
                    <p className="font-bold" style={{ color: theme.colors.textPrimary }}>Showroom Location</p>
                    <p style={{ color: theme.colors.textSecondary }}>
                        345 N Morgan, 6th Floor<br />
                        Chicago, IL 60607
                    </p>
                </div>
            </GlassCard>

            {/* Schedule */}
            <div className="space-y-4">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                    <Calendar className="inline w-5 h-5 mr-1" style={{ color: theme.colors.accent }} />
                    Show Schedule
                </p>
                {/* FIX: The `index` variable is now correctly defined for the key prop */}
                {schedule.map((block, index) => (
                    <GlassCard key={index} theme={theme} className="p-4 space-y-2">
                        <p className="font-medium" style={{ color: theme.colors.textSecondary }}>
                            {block.days.join(' and ')}
                        </p>
                        {block.events.map((evt, eventIndex) => (
                            <p key={eventIndex} style={{ color: theme.colors.textPrimary }}>{evt}</p>
                        ))}
                    </GlassCard>
                ))}
            </div>

            {/* Cocktail Hour */}
            <GlassCard theme={theme} className="p-4">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Cocktail Hour</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Monday, June 9 and Tuesday, June 10 — 3:00pm – Grab a drink (or two)!
                    Sip & socialize in our café lounge or outside on the patio that overlooks the city skyline.
                </p>
            </GlassCard>

            {/* Transport */}
            <div className="space-y-4">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Need a lift?</p>
                {/* FIX: The `index` variable is now correctly defined for the key prop */}
                {transport.map(({ icon: Icon, title, desc }, index) => (
                    <GlassCard key={index} theme={theme} className="p-4 flex items-start space-x-3">
                        <Icon className="w-6 h-6" style={{ color: theme.colors.secondary }} />
                        <div>
                            <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{title}</p>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{desc}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Raffle */}
            <GlassCard theme={theme} className="p-4 space-y-2">
                <p className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                    Inspired and Unplugged.
                </p>
                <p style={{ color: theme.colors.textSecondary }}>
                    Step into stillness. Win a 4-day, 3-night escape for two to Iceland—a boutique stay at Eyja Hotel, spa day at Blue Lagoon, plus a $1,000 flight voucher. Must be present to enter. Stop by our showroom for details.
                </p>
                <a
                    href="https://hoteleyja.is"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center font-semibold"
                    style={{ color: theme.colors.accent }}
                >
                    Learn more <Share2 className="w-4 h-4 ml-1" />
                </a>
            </GlassCard>
        </div>
    );
};
