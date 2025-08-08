import React from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { MapPin, Calendar, Bus, Share2 } from 'lucide-react';
import { DESIGN_DAYS_2025 } from './data.js';

export const DesignDaysScreen = ({ theme }) => {
    const { schedule, transportation, location, cocktailHour, contest } = DESIGN_DAYS_2025;

    return (
        <div className="px-4 pb-6 space-y-6">
            <PageTitle title="Design Days 2025" theme={theme} />

            {/* Intro */}
            <GlassCard theme={theme} className="p-4 space-y-3">
                <p className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                    {DESIGN_DAYS_2025.subtitle}
                </p>
                <p style={{ color: theme.colors.textSecondary }}>
                    {DESIGN_DAYS_2025.description}
                </p>
                <a
                    href={DESIGN_DAYS_2025.registrationUrl}
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
                        {location.address}<br />
                        {location.city}
                    </p>
                </div>
            </GlassCard>

            {/* Schedule */}
            <div className="space-y-4">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                    <Calendar className="inline w-5 h-5 mr-1" style={{ color: theme.colors.accent }} />
                    Show Schedule
                </p>
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
                    {cocktailHour.days.join(' and ')} — {cocktailHour.time} – {cocktailHour.description}
                </p>
            </GlassCard>

            {/* Transport */}
            <div className="space-y-4">
                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>Need a lift?</p>
                {transportation.map((transport, index) => (
                    <GlassCard key={index} theme={theme} className="p-4 flex items-start space-x-3">
                        <Bus className="w-6 h-6" style={{ color: theme.colors.secondary }} />
                        <div>
                            <p className="font-bold" style={{ color: theme.colors.textPrimary }}>{transport.type}</p>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                {transport.description}<br />
                                Days: {transport.days}<br />
                                Stops: {transport.route}
                            </p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Contest */}
            <GlassCard theme={theme} className="p-4 space-y-2">
                <p className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                    {contest.title}
                </p>
                <p style={{ color: theme.colors.textSecondary }}>
                    Step into stillness. Win a {contest.prize}—{contest.includes.join(', ')}. {contest.rules}
                </p>
                <a
                    href={contest.website}
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