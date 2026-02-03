import React, { useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { TRADESHOWS, findTradeshow } from './data.js';

// Landing + detail in one screen
export const TradeshowsScreen = ({ theme }) => {
  const [selectedId, setSelectedId] = useState(null);
  const active = selectedId ? findTradeshow(selectedId) : null;

  const text = theme.colors.textPrimary;
  const sub = theme.colors.textSecondary;
  const accent = theme.colors.accent;

  // Sort newest (by startDate desc) for landing
  const showsSorted = [...TRADESHOWS].sort((a,b)=> (b.startDate || '').localeCompare(a.startDate || ''));

  // Hook into app header back button: when in detail view, override to go back to listing
  // We rely on presence of selectedId; parent passes handleBack but we shadow it via onNavigate pattern if needed.
  // (Assumes parent uses currentScreen state; simpler: we expose a global listener via window but not needed.)

  return (
    <div className="px-4 pb-10 space-y-6 h-full overflow-y-auto app-header-offset">
      {!active && (
        <div className="mt-2">
          <h1 className="text-2xl font-semibold mb-4" style={{ color: text }}>Tradeshows</h1>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
            {showsSorted.map(show => (
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
            <h1 className="text-2xl font-semibold" style={{ color: text }}>{active.name}</h1>
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
                  <p className="text-sm font-medium" style={{ color: sub }}>{block.days.join(' | ')}</p>
                  {block.events.map((e, j) => <p key={j} className="text-sm" style={{ color: text }}>{e}</p>)}
                </GlassCard>
              ))}
            </div>

            {active.extras?.cocktailHour && (
              <GlassCard theme={theme} className="p-5 space-y-1">
                <p className="font-semibold" style={{ color: text }}>{active.extras.cocktailHour.label}</p>
                <p className="text-sm" style={{ color: sub }}>{active.extras.cocktailHour.days.join(', ')} - {active.extras.cocktailHour.time} - {active.extras.cocktailHour.description}</p>
              </GlassCard>
            )}

            <div className="pb-4" />
        </div>
      )}

      {active && (
        <div className="fixed bottom-4 right-4">
          <PillButton
            onClick={() => setSelectedId(null)}
            theme={theme}
            size="default"
            aria-label="Back to all shows"
          >
            Back
          </PillButton>
        </div>
      )}
    </div>
  );
};

export default TradeshowsScreen;
