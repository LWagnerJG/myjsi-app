import React, { useState } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { TRADESHOWS, findTradeshow } from './data.js';

// Landing + detail in one screen: user must select a show first
export const TradeshowsScreen = ({ theme }) => {
  const [selectedId, setSelectedId] = useState(null);
  const active = selectedId ? findTradeshow(selectedId) : null;

  const text = theme.colors.textPrimary;
  const sub = theme.colors.textSecondary;
  const accent = theme.colors.accent;

  return (
    <div className="px-4 pb-8 space-y-6">
      <PageTitle title="Tradeshows" theme={theme} />

      {!active && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: sub }}>Select a show to view details.</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
            {TRADESHOWS.map(show => (
              <button
                key={show.id}
                onClick={() => setSelectedId(show.id)}
                className="text-left group focus:outline-none"
              >
                <GlassCard theme={theme} className="p-4 h-full flex flex-col justify-between transition-colors group-hover:ring-2" style={{ ringColor: accent }}>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accent }}>{show.year}</p>
                    <p className="font-semibold leading-snug" style={{ color: text }}>{show.name}</p>
                    <p className="text-sm" style={{ color: sub }}>{show.hero.subtitle}</p>
                    <p className="text-xs" style={{ color: sub }}>{show.short}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium" style={{ color: accent }}>
                    View details <Calendar className="w-4 h-4" />
                  </span>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      )}

      {active && (
        <div className="space-y-6">
          <button onClick={() => setSelectedId(null)} className="text-sm font-medium" style={{ color: accent }}>? All Tradeshows</button>
          <PageTitle title={active.name} theme={theme} />

            <GlassCard theme={theme} className="p-5 space-y-3">
              <p className="font-semibold text-lg" style={{ color: text }}>{active.hero.subtitle}</p>
              <p style={{ color: sub }}>{active.hero.description}</p>
              {active.hero.cta && (
                <a href={active.hero.cta.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold" style={{ color: accent }}>
                  {active.hero.cta.label} <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </GlassCard>

            <GlassCard theme={theme} className="p-5 flex items-start gap-3">
              <MapPin className="w-6 h-6" style={{ color: accent }} />
              <div>
                <p className="font-semibold" style={{ color: text }}>Location</p>
                <p className="text-sm" style={{ color: sub }}>{active.location.address}<br />{active.location.city}</p>
              </div>
            </GlassCard>

            <div className="space-y-4">
              <p className="font-semibold" style={{ color: text }}><Calendar className="inline w-5 h-5 mr-1" style={{ color: accent }} /> Schedule</p>
              {active.schedule.map((block, i) => (
                <GlassCard key={i} theme={theme} className="p-4 space-y-2">
                  <p className="text-sm font-medium" style={{ color: sub }}>{block.days.join(' • ')}</p>
                  {block.events.map((e, j) => <p key={j} className="text-sm" style={{ color: text }}>{e}</p>)}
                </GlassCard>
              ))}
            </div>

            {active.extras?.cocktailHour && (
              <GlassCard theme={theme} className="p-5 space-y-1">
                <p className="font-semibold" style={{ color: text }}>{active.extras.cocktailHour.label}</p>
                <p className="text-sm" style={{ color: sub }}>{active.extras.cocktailHour.days.join(', ')} • {active.extras.cocktailHour.time} • {active.extras.cocktailHour.description}</p>
              </GlassCard>
            )}
        </div>
      )}
    </div>
  );
};

export default TradeshowsScreen;
