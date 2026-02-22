import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { ArrowRight, Package, Check, ChevronRight } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Configuration option sets ───────────────────────────────────────────────
const CASEGOODS_TYPICAL_OPTIONS = ['U-Shape','L-Shape','Single Ped Desk','Adjustable Ht Desk'];
const CONFERENCE_SIZE_OPTIONS = ['30x72','42x90','48x108','54x180','60x210'];
const LOUNGE_SEATING_OPTIONS = ['Single Seater','Two Seater','Three Seater','Ottoman'];
const MATERIAL_UPCHARGE = { laminate: 1, veneer: 1.12 };
const TYPICAL_MULTIPLIERS = { 'U-Shape': 1, 'L-Shape': 0.92, 'Single Ped Desk': 0.85, 'Adjustable Ht Desk': 1.05 };

// ─── Clean card helpers (consistent surfaces) ───────────────────────────────
const glassStyle = (theme, dark) => ({
  backgroundColor: dark ? '#2A2A2A' : '#FFFFFF',
  border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
  boxShadow: 'none',
});

// ─── Product thumbnail strip ─────────────────────────────────────────────────
const ProductTabs = React.memo(({ products, activeProduct, onProductSelect, theme, categoryName }) => {
  const dark = isDarkTheme(theme);
  const isCasegoods = categoryName?.toLowerCase() === 'casegoods';
  const scrollRef = useRef(null);

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ ...glassStyle(theme, dark), padding: 0 }}
    >
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-3 py-3 gap-1"
      >
        {products.map((p, i) => {
          const active = activeProduct?.id === p.id;
          const baseScale = p?.thumbScale || (isCasegoods ? 1.25 : 1.0);
          return (
            <button
              key={p.id}
              onClick={() => onProductSelect(p)}
              aria-pressed={active}
              className="relative flex-shrink-0 flex flex-col items-center rounded-2xl transition-all duration-300 group"
              style={{
                width: 88,
                padding: '10px 4px 8px',
                backgroundColor: active
                  ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)')
                  : 'transparent',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="relative w-[72px] h-[76px] flex items-center justify-center overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.08]"
                  style={{ transform: `scale(${active ? baseScale * 1.06 : baseScale})` }}
                />
              </div>
              <span
                className="mt-1.5 text-xs font-semibold tracking-tight text-center leading-tight line-clamp-1 w-full px-1 transition-colors"
                style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}
              >
                {p.name}
              </span>
              {/* Active indicator dot */}
              <motion.span
                className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                initial={false}
                animate={{
                  width: active ? 20 : 0,
                  height: active ? 3 : 0,
                  opacity: active ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{ backgroundColor: theme.colors.accent }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
});
ProductTabs.displayName = 'ProductTabs';

// ─── Hero image with overlay info ────────────────────────────────────────────
const ProductHero = React.memo(({ product, theme, categoryId, onNavigate, categoryName }) => {
  const dark = isDarkTheme(theme);
  const handleCompetitionClick = useCallback(
    () => onNavigate(`products/category/${categoryId}/competition/${product.id}`),
    [categoryId, onNavigate, product.id]
  );
  const isChairCategory = /chair|guest|seating/i.test(categoryId) || /chair|guest|seating/i.test(categoryName || '');
  const isCasegoods = categoryId === 'casegoods';
  const aspectClass = isChairCategory ? 'aspect-[4/3]' : 'aspect-[16/10]';

  let baseZoom = product.heroScale
    ? Math.min(1.18, Math.max(0.85, product.heroScale))
    : (isChairCategory ? 0.96 : 1.12);
  if (isCasegoods) baseZoom *= 1.15;

  return (
    <motion.div
      className={`relative w-full ${aspectClass} rounded-[28px] overflow-hidden group`}
      style={{
        backgroundColor: dark ? '#1E1E1E' : '#F0EDE8',
        boxShadow: dark
          ? '0 4px 12px rgba(0,0,0,0.2)'
          : '0 2px 8px rgba(53,53,53,0.08)',
      }}
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 0.8, 0.12, 0.99] }}
    >
      {/* Product image with crossfade */}
      <AnimatePresence mode="wait">
        <motion.img
          key={product.id}
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-700"
          style={{ transform: `scale(${baseZoom})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {/* Bottom gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.02) 65%, transparent 100%)',
        }}
      />

      {/* Info overlay — frosted glass pill */}
      <div className="absolute left-0 right-0 bottom-0 px-4 pb-4 pt-12 flex items-end justify-between">
        <div className="leading-tight select-none">
          <AnimatePresence mode="wait">
            <motion.h2
              key={product.name}
              className="text-[28px] sm:text-[32px] font-bold text-white drop-shadow-md tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {product.name}
            </motion.h2>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={product.price}
              className="mt-0.5 text-lg font-semibold text-white/90 drop-shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              ${product.price?.toLocaleString() || 'TBD'}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Competition CTA — frosted glass */}
        <button
          onClick={handleCompetitionClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-[13px] transition-all active:scale-95 hover:scale-[1.03]"
          style={{
            backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.6)',
            color: dark ? '#fff' : theme.colors.textPrimary,
            border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          Competition
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
});
ProductHero.displayName = 'ProductHero';

// ─── Segmented pill toggle (glass) ───────────────────────────────────────────
const GlassSegmentedToggle = React.memo(({ options, value, onChange, theme }) => {
  const dark = isDarkTheme(theme);
  const activeIdx = options.findIndex(o => (typeof o === 'string' ? o.toLowerCase() : o) === value);

  return (
    <div
      className="relative flex h-11 rounded-full p-1 overflow-hidden"
      style={{
        backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Sliding indicator */}
      <motion.span
        className="absolute top-1 bottom-1 rounded-full"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          left: 4,
          ...glassStyle(theme, dark),
          border: 'none',
        }}
        animate={{ x: `${activeIdx * 100}%` }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      />
      {options.map(opt => {
        const label = typeof opt === 'string' ? opt : opt;
        const val = label.toLowerCase();
        const active = val === value;
        return (
          <button
            key={label}
            onClick={() => onChange(val)}
            className="relative z-10 flex-1 rounded-full flex items-center justify-center whitespace-nowrap text-xs font-semibold transition-colors duration-200"
            style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
});
GlassSegmentedToggle.displayName = 'GlassSegmentedToggle';

// ─── Configuration pill bar ──────────────────────────────────────────────────
const ConfigPills = React.memo(({ pills, activeValue, onSelect, theme }) => {
  const dark = isDarkTheme(theme);
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      {pills.map(pill => {
        const active = pill === activeValue || pill.toLowerCase() === activeValue;
        return (
          <button
            key={pill}
            onClick={() => onSelect(pill)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-250 active:scale-95 hover:scale-[1.02]"
            style={{
              backgroundColor: active
                ? theme.colors.accent
                : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: active
                ? theme.colors.accentText
                : theme.colors.textSecondary,
              border: active ? 'none' : (dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'),
              boxShadow: active
                ? (dark ? '0 2px 12px rgba(255,255,255,0.12)' : '0 2px 12px rgba(53,53,53,0.15)')
                : 'none',
            }}
          >
            {pill}
          </button>
        );
      })}
    </div>
  );
});
ConfigPills.displayName = 'ConfigPills';

// ─── Pricing Table (glass) ──────────────────────────────────────────────────
const PricingTable = React.memo(({
  products, activeProduct, onSelectProduct, theme, categoryId,
  typicalLayout, onTypicalLayoutChange,
  conferenceSize, onConferenceSizeChange,
  loungeConfig, onLoungeConfigChange,
  guestLegType, onGuestLegTypeChange,
  materialMode, onMaterialModeChange,
}) => {
  const dark = isDarkTheme(theme);
  const isGuest = categoryId === 'guest';
  const isCasegoods = categoryId === 'casegoods';
  const isConference = categoryId === 'conference-tables';
  const isTraining = categoryId === 'training-tables';
  const isLounge = categoryId === 'lounge';

  const showMaterialToggle = isCasegoods || isConference || isTraining;

  let pills = [];
  let activePill = '';
  let onPillSelect = () => {};
  if (isCasegoods) { pills = CASEGOODS_TYPICAL_OPTIONS; activePill = typicalLayout; onPillSelect = onTypicalLayoutChange; }
  else if (isConference) { pills = CONFERENCE_SIZE_OPTIONS; activePill = conferenceSize; onPillSelect = onConferenceSizeChange; }
  else if (isLounge) { pills = LOUNGE_SEATING_OPTIONS; activePill = loungeConfig; onPillSelect = onLoungeConfigChange; }
  else if (isGuest) { pills = ['Wood','Metal']; activePill = guestLegType; onPillSelect = (v) => onGuestLegTypeChange(v.toLowerCase()); }

  const sorted = useMemo(() => [...products].sort((a, b) => (a.price || 0) - (b.price || 0)), [products]);

  const computePrice = useCallback((p) => {
    if (isCasegoods) {
      const materialFactor = MATERIAL_UPCHARGE[materialMode] || 1;
      const typicalFactor = TYPICAL_MULTIPLIERS[typicalLayout] || 1;
      return Math.round((p.price || 0) * materialFactor * typicalFactor / 10) * 10;
    }
    return p.price;
  }, [isCasegoods, materialMode, typicalLayout]);

  return (
    <div
      className="rounded-[24px] overflow-hidden"
      style={{ ...glassStyle(theme, dark) }}
    >
      {/* Config section */}
      <div className="px-5 pt-5 space-y-3">
        {pills.length > 0 && (
          <ConfigPills pills={pills} activeValue={activePill} onSelect={onPillSelect} theme={theme} />
        )}
        {showMaterialToggle && (
          <GlassSegmentedToggle
            options={['Laminate', 'Veneer']}
            value={materialMode}
            onChange={onMaterialModeChange}
            theme={theme}
          />
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 mt-4 mb-0" style={{ height: 1, backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

      {/* Column headers */}
      <div className="px-5 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: theme.colors.textSecondary }}>
          Series
        </span>
        <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: theme.colors.textSecondary }}>
          List
        </span>
      </div>

      {/* Product rows */}
      <div className="pb-2">
        {sorted.map((p, i) => {
          const active = p.id === activeProduct?.id;
          const price = computePrice(p);
          return (
            <button
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="w-full group px-5 py-3.5 flex items-center justify-between text-[13px] transition-all duration-200 text-left rounded-none"
              style={{
                cursor: active ? 'default' : 'pointer',
                backgroundColor: active
                  ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)')
                  : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span className="flex items-center gap-3">
                {/* Active indicator */}
                <span
                  className="inline-block rounded-full transition-all duration-200"
                  style={{
                    width: active ? 3 : 2,
                    height: active ? 20 : 14,
                    backgroundColor: active ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'),
                  }}
                />
                <span
                  className={`font-medium transition-all ${active ? 'font-semibold' : ''}`}
                  style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}
                >
                  {p.name}
                </span>
              </span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}
              >
                ${price?.toLocaleString?.() || 'TBD'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
PricingTable.displayName = 'PricingTable';

// ─── Error State ─────────────────────────────────────────────────────────────
const ErrorState = ({ theme, message = 'The requested item does not exist.' }) => {
  const dark = isDarkTheme(theme);
  return (
    <div className="p-6">
      <div
        className="p-10 text-center rounded-[24px]"
        style={{ ...glassStyle(theme, dark) }}
      >
        <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
        <p className="font-medium" style={{ color: theme.colors.textPrimary }}>{message}</p>
      </div>
    </div>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
  const categoryData = PRODUCT_DATA?.[categoryId];
  const isGuest = categoryId === 'guest';

  const [activeProduct, setActiveProduct] = useState(categoryData?.products?.[0]);
  const [materialMode, setMaterialMode] = useState(isGuest ? 'wood' : 'laminate');
  const [typicalLayout, setTypicalLayout] = useState('U-Shape');
  const [conferenceSize, setConferenceSize] = useState('30x72');
  const [loungeConfig, setLoungeConfig] = useState('Single Seater');
  const [guestLegType, setGuestLegType] = useState('wood');

  const handleProductSelect = useCallback(p => setActiveProduct(p), []);

  const visibleProducts = useMemo(() => {
    if (!categoryData) return [];
    if (isGuest) return categoryData.products.filter(p => p.legType === guestLegType);
    return categoryData.products;
  }, [categoryData, isGuest, guestLegType]);

  useEffect(() => {
    if (isGuest && activeProduct && !visibleProducts.includes(activeProduct)) {
      const next = visibleProducts[0];
      if (next) setActiveProduct(next);
    }
  }, [isGuest, activeProduct, visibleProducts]);

  if (!categoryData) return <ErrorState theme={theme} />;

  return (
    <div className="flex flex-col h-full app-header-offset">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-5 lg:px-8 pt-3 pb-8 space-y-4 max-w-5xl mx-auto w-full">
          {/* Category title */}
          <div
            className="px-1 pt-1"
          >
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: theme.colors.textPrimary }}
            >
              {categoryData.name}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>
              {visibleProducts.length} {visibleProducts.length === 1 ? 'series' : 'series'} available
            </p>
          </div>

          {/* Product tabs */}
          <ProductTabs
            products={visibleProducts}
            activeProduct={activeProduct}
            onProductSelect={handleProductSelect}
            theme={theme}
            categoryName={categoryData.name}
          />

          {/* Hero */}
          <ProductHero
            product={activeProduct}
            theme={theme}
            categoryId={categoryId}
            onNavigate={onNavigate}
            categoryName={categoryData.name}
          />

          {/* Pricing & config */}
          <PricingTable
            products={visibleProducts}
            activeProduct={activeProduct}
            onSelectProduct={handleProductSelect}
            theme={theme}
            categoryId={categoryId}
            typicalLayout={typicalLayout}
            onTypicalLayoutChange={setTypicalLayout}
            conferenceSize={conferenceSize}
            onConferenceSizeChange={setConferenceSize}
            loungeConfig={loungeConfig}
            onLoungeConfigChange={setLoungeConfig}
            guestLegType={guestLegType}
            onGuestLegTypeChange={setGuestLegType}
            materialMode={materialMode}
            onMaterialModeChange={setMaterialMode}
          />
        </div>
      </div>
    </div>
  );
};
