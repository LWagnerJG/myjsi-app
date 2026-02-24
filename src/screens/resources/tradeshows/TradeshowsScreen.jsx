import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import {
  Calendar, MapPin, ExternalLink, Sparkles, HeartPulse,
  GraduationCap, ChevronRight, Star,
} from 'lucide-react';
import { TRADESHOW_BRANDS, TRADESHOWS, findTradeshow, findBrand, getShowsByBrand } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';

// ============================================
// Icon resolver for brand cards
// ============================================
const BRAND_ICONS = {
  'sparkles': Sparkles,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
};

// ============================================
// Format date range helper
// ============================================
const formatDateRange = (start, end) => {
  if (!start) return '';
  const s = new Date(start + 'T00:00:00');
  const e = end ? new Date(end + 'T00:00:00') : null;
  const mo = s.toLocaleString('en-US', { month: 'short' });
  const day = s.getDate();
  if (!e) return `${mo} ${day}`;
  const eMo = e.toLocaleString('en-US', { month: 'short' });
  const eDay = e.getDate();
  if (mo === eMo) return `${mo} ${day}\u2013${eDay}`;
  return `${mo} ${day} \u2013 ${eMo} ${eDay}`;
};

// ============================================
// Gradient placeholders per brand when no image
// ============================================
const BRAND_GRADIENTS = {
  'design-days': 'linear-gradient(135deg, #5B7B8C22 0%, #5B7B8C08 40%, #E3E0D8 100%)',
  'hcd': 'linear-gradient(135deg, #4A7C5922 0%, #4A7C5908 40%, #E3E0D8 100%)',
  'edspaces': 'linear-gradient(135deg, #C4956A22 0%, #C4956A08 40%, #E3E0D8 100%)',
};

// ============================================
// STEP 1: Brand Selection Landing
// ============================================
const BrandSelection = ({ theme, onSelect }) => {
  const text = theme.colors.textPrimary;
  const sub = theme.colors.textSecondary;

  return (
    <div className="flex flex-col h-full">
      {/* Page title - matches app pattern */}
      <div className="px-2 pt-4 pb-3">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: text, letterSpacing: '-0.02em' }}
        >
          Tradeshows
        </h1>
        <p className="text-sm mt-1" style={{ color: sub }}>
          Select a show to view schedules and details.
        </p>
      </div>

      {/* Brand cards */}
      <div className="space-y-3 pb-6">
        {TRADESHOW_BRANDS.map((brand) => {
          const Icon = BRAND_ICONS[brand.icon] || Sparkles;
          const shows = TRADESHOWS.filter((s) => s.brandId === brand.id);
          const upcoming = shows.filter((s) => s.status === 'upcoming');
          const latestShow = [...shows].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))[0];
          const hasHero = !!brand.heroImage;

          return (
            <button
              key={brand.id}
              onClick={() => onSelect(brand.id)}
              className="w-full text-left group focus:outline-none"
            >
              <GlassCard theme={theme} variant="interactive" className="overflow-hidden">
                {/* Brand hero strip — real image or gradient fallback */}
                <div className="aspect-[2.2/1] w-full relative overflow-hidden">
                  {hasHero ? (
                    <>
                      <img
                        src={brand.heroImage}
                        alt={brand.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                    </>
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: BRAND_GRADIENTS[brand.id] || BRAND_GRADIENTS['design-days'] }}
                    >
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-[0.07]">
                        <Icon className="w-20 h-20" style={{ color: brand.accent }} />
                      </div>
                    </div>
                  )}

                  {/* Overlays on hero strip */}
                  {upcoming.length > 0 && (
                    <div className="absolute top-3 left-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: hasHero ? 'rgba(255,255,255,0.92)' : brand.accent,
                          color: hasHero ? '#353535' : '#fff',
                        }}
                      >
                        {upcoming.length} Upcoming
                      </span>
                    </div>
                  )}
                  {latestShow && (
                    <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" style={{ color: hasHero ? 'rgba(255,255,255,0.8)' : brand.accent }} />
                      <span
                        className="text-[11px] font-semibold drop-shadow-sm"
                        style={{ color: hasHero ? '#fff' : brand.accent }}
                      >
                        Next: {formatDateRange(latestShow.startDate, latestShow.endDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="px-5 py-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.colors.subtle }}
                  >
                    <Icon className="w-5 h-5" style={{ color: brand.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold" style={{ color: text }}>
                      {brand.name}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: sub }}>
                      {brand.tagline}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-5 h-5 flex-shrink-0 opacity-30 group-hover:opacity-80 transition-opacity"
                    style={{ color: sub }}
                  />
                </div>
              </GlassCard>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// STEP 2: Shows for a Brand (Year picker)
// ============================================
const BrandShowList = ({ theme, brandId, onSelectShow }) => {
  const text = theme.colors.textPrimary;
  const sub = theme.colors.textSecondary;
  const brand = findBrand(brandId);
  const shows = useMemo(() => getShowsByBrand(brandId), [brandId]);
  const upcoming = shows.filter((s) => s.status === 'upcoming');
  const past = shows.filter((s) => s.status === 'past');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-2 pt-4 pb-3 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: theme.colors.subtle }}
        >
          {React.createElement(BRAND_ICONS[brand.icon] || Sparkles, {
            className: 'w-5 h-5',
            style: { color: brand.accent },
          })}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: text, letterSpacing: '-0.02em' }}>
            {brand.name}
          </h1>
          <p className="text-xs" style={{ color: sub }}>
            {brand.tagline}
          </p>
        </div>
      </div>

      {/* Upcoming shows */}
      {upcoming.length > 0 && (
        <div className="space-y-3 mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest px-1" style={{ color: sub }}>
            Upcoming
          </p>
          {upcoming.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              brand={brand}
              theme={theme}
              onClick={() => onSelectShow(show.id)}
            />
          ))}
        </div>
      )}

      {/* Past shows */}
      {past.length > 0 && (
        <div className="space-y-3 mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest px-1" style={{ color: sub }}>
            Past Events
          </p>
          {past.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              brand={brand}
              theme={theme}
              onClick={() => onSelectShow(show.id)}
            />
          ))}
        </div>
      )}

      <div className="pb-6" />
    </div>
  );
};

// ============================================
// ShowCard component — ALWAYS shows hero strip
// ============================================
const ShowCard = ({ show, brand, theme, onClick }) => {
  const text = theme.colors.textPrimary;
  const sub = theme.colors.textSecondary;
  const [imgErr, setImgErr] = useState(false);
  const hasImg = show.heroImage && !imgErr;
  const isUpcoming = show.status === 'upcoming';

  return (
    <button onClick={onClick} className="w-full text-left group focus:outline-none">
      <GlassCard theme={theme} variant="interactive" className="overflow-hidden">
        {/* Hero strip — always visible */}
        <div className="relative aspect-[2.5/1] w-full overflow-hidden">
          {hasImg ? (
            <>
              <img
                src={show.heroImage}
                alt={show.name}
                className="w-full h-full object-cover"
                onError={() => setImgErr(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </>
          ) : (
            <div
              className="w-full h-full"
              style={{ background: BRAND_GRADIENTS[show.brandId] || BRAND_GRADIENTS['design-days'] }}
            >
              {/* Watermark icon */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.06]">
                {React.createElement(BRAND_ICONS[brand.icon] || Sparkles, {
                  className: 'w-14 h-14',
                  style: { color: brand.accent },
                })}
              </div>
            </div>
          )}
          {/* Year + status overlay */}
          <div className="absolute bottom-2.5 left-3.5 flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wide drop-shadow-sm"
              style={{ color: hasImg ? '#fff' : brand.accent }}
            >
              {show.year}
            </span>
            {isUpcoming && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: brand.accent, color: '#fff' }}
              >
                Upcoming
              </span>
            )}
            {!isUpcoming && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: hasImg ? 'rgba(255,255,255,0.2)' : theme.colors.subtle,
                  color: hasImg ? '#fff' : sub,
                }}
              >
                Past
              </span>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="px-4 py-3 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[15px]" style={{ color: text }}>
              {show.name}
            </h3>
            <ChevronRight
              className="w-4 h-4 opacity-30 group-hover:opacity-80 transition-opacity"
              style={{ color: sub }}
            />
          </div>
          <p className="text-sm" style={{ color: sub }}>
            {show.tagline}
          </p>
          <div className="flex items-center gap-3 pt-0.5">
            <span className="flex items-center gap-1 text-xs" style={{ color: sub }}>
              <Calendar className="w-3 h-3" />
              {formatDateRange(show.startDate, show.endDate)}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: sub }}>
              <MapPin className="w-3 h-3" />
              {show.location.city}
            </span>
          </div>
        </div>
      </GlassCard>
    </button>
  );
};

// ============================================
// STEP 3: Show Detail with Hero
// ============================================
const ShowDetail = ({ theme, showId }) => {
  const show = findTradeshow(showId);
  const brand = findBrand(show?.brandId);
  const text = theme.colors.textPrimary;
  const sub = theme.colors.textSecondary;
  const accent = brand?.accent || theme.colors.accent;
  const dark = isDarkTheme(theme);
  const [imgErr, setImgErr] = useState(false);

  if (!show) return null;

  const hasHeroImg = show.heroImage && !imgErr;

  return (
    <div className="space-y-5 -mx-4">
      {/* HERO SECTION */}
      <div
        className="relative overflow-hidden"
        style={{ borderRadius: '24px', margin: '0 16px' }}
      >
        {hasHeroImg ? (
          <>
            <img
              src={show.heroImage}
              alt={show.name}
              className="w-full aspect-[16/9] object-cover"
              onError={() => setImgErr(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <div
            className="w-full aspect-[16/9] relative"
            style={{
              background: `linear-gradient(160deg, ${accent}35 0%, ${accent}12 50%, ${dark ? '#1a1a1a' : '#F0EDE8'} 100%)`,
            }}
          >
            {/* Watermark */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06]">
              {brand && React.createElement(BRAND_ICONS[brand.icon] || Sparkles, {
                className: 'w-24 h-24',
                style: { color: accent },
              })}
            </div>
          </div>
        )}

        {/* Hero overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: hasHeroImg ? 'rgba(255,255,255,0.7)' : accent }}
          >
            {show.year} &middot; {show.location.city}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold leading-tight mb-2"
            style={{
              color: hasHeroImg ? '#fff' : text,
              letterSpacing: '-0.02em',
            }}
          >
            {show.hero.headline}
          </h1>
          <p
            className="text-sm leading-relaxed mb-4 max-w-md"
            style={{ color: hasHeroImg ? 'rgba(255,255,255,0.85)' : sub }}
          >
            {show.hero.description}
          </p>
          {show.hero.cta && (
            <a
              href={show.hero.cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-[0.97]"
              style={{
                backgroundColor: hasHeroImg ? '#fff' : accent,
                color: hasHeroImg ? '#353535' : '#fff',
              }}
            >
              {show.hero.cta.label}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* CONTENT BELOW HERO */}
      <div className="px-4 space-y-5">
        {/* Quick info row */}
        <div className="flex gap-3">
          <GlassCard theme={theme} className="flex-1 p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accent + '15' }}
            >
              <Calendar className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: sub }}>
                Dates
              </p>
              <p className="text-sm font-semibold" style={{ color: text }}>
                {formatDateRange(show.startDate, show.endDate)}
              </p>
            </div>
          </GlassCard>

          <GlassCard theme={theme} className="flex-1 p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accent + '15' }}
            >
              <MapPin className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: sub }}>
                Venue
              </p>
              <p className="text-sm font-semibold" style={{ color: text }}>
                {show.location.venue}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Address */}
        <GlassCard theme={theme} className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: text }}>
                {show.location.address}
              </p>
              <p className="text-xs" style={{ color: sub }}>
                {show.location.city}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Highlights */}
        {show.highlights && show.highlights.length > 0 && (
          <div className="space-y-2.5">
            <h2
              className="text-[11px] font-semibold uppercase tracking-widest px-1"
              style={{ color: sub }}
            >
              Highlights
            </h2>
            <GlassCard theme={theme} className="p-4 space-y-2.5">
              {show.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Star
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                    style={{ color: accent }}
                  />
                  <p className="text-sm" style={{ color: text }}>
                    {h}
                  </p>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        {/* Schedule */}
        <div className="space-y-2.5">
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest px-1"
            style={{ color: sub }}
          >
            Schedule
          </h2>
          {show.schedule.map((block, i) => (
            <GlassCard key={i} theme={theme} className="p-4 space-y-3">
              <p
                className="text-sm font-bold"
                style={{ color: accent }}
              >
                {block.days.join(' & ')}
              </p>
              <div className="space-y-2">
                {block.events.map((evt, j) => (
                  <div key={j} className="flex items-start gap-3">
                    {evt.time && (
                      <span
                        className="text-xs font-semibold w-16 flex-shrink-0 pt-px text-right"
                        style={{ color: sub }}
                      >
                        {evt.time}
                      </span>
                    )}
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: accent + '50' }}
                    />
                    <p className="text-sm" style={{ color: text }}>
                      {evt.label}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Visit website */}
        {show.website && (
          <div className="pt-2 pb-6">
            <a
              href={show.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: accent,
                color: '#fff',
              }}
            >
              Visit Official Site
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN SCREEN: Orchestrates the 3 views
// ============================================
export const TradeshowsScreen = ({ theme, onNavigate, initialBrandId, initialShowId }) => {
  // Determine which view to show based on route props
  const brandId = initialBrandId || null;
  const showId = initialShowId || null;

  const navigateToBrand = (id) => onNavigate(`resources/tradeshows/${id}`);
  const navigateToShow = (bId, sId) => onNavigate(`resources/tradeshows/${bId}/${sId}`);

  return (
    <div className="px-4 pb-10 min-h-full app-header-offset">
      {/* View 1: Brand selection */}
      {!brandId && !showId && (
        <BrandSelection
          theme={theme}
          onSelect={navigateToBrand}
        />
      )}

      {/* View 2: Shows for selected brand */}
      {brandId && !showId && (
        <BrandShowList
          theme={theme}
          brandId={brandId}
          onSelectShow={(sId) => navigateToShow(brandId, sId)}
        />
      )}

      {/* View 3: Show detail */}
      {showId && (
        <ShowDetail
          theme={theme}
          showId={showId}
        />
      )}
    </div>
  );
};

export default TradeshowsScreen;
