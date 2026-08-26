import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { JSIWebButton } from '../../components/common/JSIButtons.jsx';
import { ArrowRight, Package, Clock3, Layers, Sparkles } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { isDarkTheme, cardSurface, subtleBg } from '../../design-system/tokens.js';
import { HOME_SURFACE_DARK, HOME_SURFACE_LIGHT } from '../../design-system/homeChrome.js';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrencyOrTbd } from '../../utils/format.js';

// ─── Configuration option sets ───────────────────────────────────────────────
const CASEGOODS_TYPICAL_OPTIONS = ['Single Ped','L-Shape','U-Shape','AH Desk'];
const CONFERENCE_SIZE_OPTIONS = ['30x72','42x90','48x108','54x180','60x210'];
const LOUNGE_SEATING_BASE = ['Single Seater','Two Seater','Three Seater'];
const SERIES_WITH_OTTOMAN = new Set(['arwyn','bespace-lounge','indie-lounge','teekan-lounge']);
const CREDENZA_SIZE_OPTIONS = ['20x60','20x66','20x72','24x72','24x84'];
// Typical estimates relative to the base single-pedestal desk list price
// (L adds a return; U adds return + bridge + credenza; AH adds height-adjust mechanism).
const TYPICAL_MULTIPLIERS = { 'Single Ped': 1, 'L-Shape': 1.65, 'U-Shape': 2.6, 'AH Desk': 1.5 };
const CREDENZA_SIZE_MULTIPLIERS = { '20x60': 0.82, '20x66': 0.88, '20x72': 1, '24x72': 1.06, '24x84': 1.18 };

/** Real veneer list price when the series publishes one; laminate price otherwise. */
const materialPrice = (p, materialMode) =>
  (materialMode === 'veneer' && p.veneerPrice) ? p.veneerPrice : (p.price || 0);

/**
 * Shared list-price math for hero overlay + SERIES table.
 * Keep exact published list when the layout factor is 1; round only for
 * scaled typicals so both surfaces always show the same field.
 */
const computeDisplayedListPrice = ({
  product,
  categoryId,
  materialMode,
  typicalLayout,
  credenzaSize,
}) => {
  if (!product) return null;
  if (categoryId === 'casegoods') {
    const factor = TYPICAL_MULTIPLIERS[typicalLayout] || 1;
    const raw = materialPrice(product, materialMode) * factor;
    return factor === 1 ? Math.round(raw) : Math.round(raw / 10) * 10;
  }
  if (categoryId === 'credenzas') {
    const factor = CREDENZA_SIZE_MULTIPLIERS[credenzaSize] || 1;
    const raw = materialPrice(product, materialMode) * factor;
    return factor === 1 ? Math.round(raw) : Math.round(raw / 10) * 10;
  }
  if (categoryId === 'conference-tables') {
    return materialPrice(product, materialMode);
  }
  return product.price;
};

const CASEGOODS_FINISH_NOTES = {
  brogan: ['Veneer standard', 'Matched grain across pedestals', 'Soft-close drawers'],
  finale: ['Veneer standard', 'Beveled edge profiles', 'Integrated wire management'],
  flux: ['Laminate or veneer tops', 'Full-height storage options', 'Modesty panel available'],
  vision: ['Value laminate lineup', 'Shared hardware with Flux', 'Quick-ship select SKUs'],
};

// ─── Product thumbnail strip ─────────────────────────────────────────────────
const ProductTabs = React.memo(({ products, activeProduct, onProductSelect, theme, categoryName }) => {
  const dark = isDarkTheme(theme);
  const isCasegoods = categoryName?.toLowerCase() === 'casegoods';
  const scrollRef = useRef(null);
  const fillStrip = products.length > 0 && products.length <= 6;

  // Auto-scroll the active product into view on narrow strips
  useEffect(() => {
    if (fillStrip) return;
    const container = scrollRef.current;
    if (!container || !activeProduct) return;
    const idx = products.findIndex(p => p.id === activeProduct.id);
    if (idx < 0) return;
    const btn = container.children[idx];
    if (!btn) return;
    const btnLeft = btn.offsetLeft;
    const btnWidth = btn.offsetWidth;
    const containerWidth = container.offsetWidth;
    const scrollTarget = btnLeft - (containerWidth / 2) + (btnWidth / 2);
    container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, [activeProduct, products, fillStrip]);

  return (
    <div
      className="rounded-[24px] overflow-hidden"
      style={{
        ...cardSurface(theme),
        backgroundColor: dark ? HOME_SURFACE_DARK : HOME_SURFACE_LIGHT,
        boxShadow: 'none',
        padding: 0,
      }}
    >
      <div
        ref={scrollRef}
        className={`flex px-3 py-3 gap-1 ${fillStrip ? 'lg:gap-2' : 'overflow-x-auto scrollbar-hide'}`}
      >
        {products.map((p) => {
          const active = activeProduct?.id === p.id;
          const baseScale = p?.thumbScale || (isCasegoods ? 1.25 : 1.0);
          return (
            <button
              key={p.id}
              onClick={() => onProductSelect(p)}
              aria-pressed={active}
              className={`relative flex flex-col items-center rounded-2xl transition-all duration-300 group ${fillStrip ? 'flex-1 min-w-0' : 'flex-shrink-0'}`}
              style={{
                width: fillStrip ? undefined : 88,
                padding: '10px 4px 8px',
                backgroundColor: 'transparent',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="relative w-[72px] h-[76px] flex items-center justify-center overflow-hidden mx-auto">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    loading={fillStrip ? 'eager' : 'lazy'}
                    fetchPriority={fillStrip && active ? 'high' : undefined}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.08]"
                    style={{ transform: `scale(${active ? baseScale * 1.06 : baseScale})` }}
                  />
                ) : (
                  <Package className="w-7 h-7" style={{ color: theme.colors.textSecondary, opacity: 0.35 }} />
                )}
              </div>
              <span
                className="mt-1.5 text-[0.8125rem] font-medium tracking-tight text-center leading-tight line-clamp-1 w-full px-1 transition-colors"
                style={{ color: active ? theme.colors.textPrimary : theme.colors.textSecondary }}
              >
                {p.name}
              </span>
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
const ProductHero = React.memo(({ product, theme, categoryId, onNavigate, categoryName, listPrice }) => {
  const dark = isDarkTheme(theme);
  const handleCompetitionClick = useCallback(
    () => onNavigate(`products/category/${categoryId}/competition/${product.id}`),
    [categoryId, onNavigate, product.id]
  );
  const isSeatingLikeCategory = /chair|guest|seating|swivel|lounge|bench|stool/i.test(categoryId) ||
    /chair|guest|seating|swivel|lounge|bench|stool/i.test(categoryName || '');
  const isCasegoods = categoryId === 'casegoods';
  // Keep product-photo proportions — avoid ultra-wide 16:9 frames that stretch
  // square/portrait studio shots and create a visible crop edge on desktop.
  const aspectClass = isSeatingLikeCategory ? 'aspect-[4/3]' : 'aspect-[5/4] lg:aspect-[4/3]';

  let baseZoom = product.heroScale
    ? Math.min(1.18, Math.max(0.85, product.heroScale))
    : (isSeatingLikeCategory ? 0.96 : 1.12);
  if (isCasegoods) baseZoom *= 1.15;

  return (
    <motion.div
      className={`relative w-full ${aspectClass} rounded-[24px] overflow-hidden group`}
      style={{
        backgroundColor: dark ? '#1E1E1E' : '#F0EDE8',
      }}
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 0.8, 0.12, 0.99] }}
    >
      {/* Product image with crossfade — no radial mask (that caused the boxy crop) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          className="absolute inset-0 w-full h-full flex items-center justify-center p-3 sm:p-4 lg:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain group-hover:scale-[1.03] transition-transform duration-700"
            style={{ transform: `scale(${baseZoom})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom gradient — kept short so it doesn't fight the product photo */}
      <div
        className="absolute inset-x-0 bottom-0 h-[42%] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.16) 55%, transparent 100%)',
        }}
      />

      {/* Info overlay */}
      <div className="absolute left-0 right-0 bottom-0 px-4 pb-4 pt-10 flex items-end justify-between gap-3">
        <div className="leading-tight select-none min-w-0">
          <AnimatePresence mode="wait">
            <motion.h2
              key={product.name}
              className="text-[1.5rem] sm:text-[1.625rem] font-bold text-white drop-shadow-md tracking-tight truncate"
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
              key={listPrice ?? product.price}
              className="mt-0.5 text-[0.9375rem] font-semibold text-white/90 drop-shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {formatCurrencyOrTbd(listPrice ?? product.price)}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Competition CTA — same sweep-up hover treatment as Order Detail actions */}
        <JSIWebButton
          onClick={handleCompetitionClick}
          theme={theme}
          variant="filled"
          tone="light"
          size="medium"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          className="flex-shrink-0"
          style={{
            backgroundColor: dark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.72)',
            border: 'none',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          Competition
        </JSIWebButton>
      </div>
    </motion.div>
  );
});
ProductHero.displayName = 'ProductHero';



// ─── Pricing Table (glass) ──────────────────────────────────────────────────
const PricingTable = React.memo(({
  products, activeProduct, onSelectProduct, theme, categoryId,
  typicalLayout, onTypicalLayoutChange,
  conferenceSize, onConferenceSizeChange,
  loungeConfig, onLoungeConfigChange,
  guestLegType, onGuestLegTypeChange,
  credenzaSize, onCredenzaSizeChange,
  materialMode, onMaterialModeChange,
}) => {
  const dark = isDarkTheme(theme);
  const isGuest = categoryId === 'guest';
  const isCasegoods = categoryId === 'casegoods';
  const isConference = categoryId === 'conference-tables';
  const isCredenzas = categoryId === 'credenzas';
  const isLounge = categoryId === 'lounge';

  const showMaterialToggle = isCasegoods || isConference || isCredenzas;

  let configOptions = [];
  let configValue = '';
  let onConfigChange = () => {};
  if (isCasegoods) {
    configOptions = CASEGOODS_TYPICAL_OPTIONS.map(v => ({ value: v, label: v }));
    configValue = typicalLayout; onConfigChange = onTypicalLayoutChange;
  } else if (isConference) {
    configOptions = CONFERENCE_SIZE_OPTIONS.map(v => ({ value: v, label: v }));
    configValue = conferenceSize; onConfigChange = onConferenceSizeChange;
  } else if (isLounge) {
    const hasOttoman = SERIES_WITH_OTTOMAN.has(activeProduct?.id);
    const opts = hasOttoman ? [...LOUNGE_SEATING_BASE, 'Ottoman'] : LOUNGE_SEATING_BASE;
    configOptions = opts.map(v => ({ value: v, label: v }));
    configValue = (!hasOttoman && loungeConfig === 'Ottoman') ? 'Single Seater' : loungeConfig;
    onConfigChange = onLoungeConfigChange;
  } else if (isGuest) {
    configOptions = [{ value: 'wood', label: 'Wood' }, { value: 'metal', label: 'Metal' }];
    configValue = guestLegType; onConfigChange = onGuestLegTypeChange;
  } else if (isCredenzas) {
    configOptions = CREDENZA_SIZE_OPTIONS.map(v => ({ value: v, label: v }));
    configValue = credenzaSize; onConfigChange = onCredenzaSizeChange;
  }

  const sorted = useMemo(() => [...products].sort((a, b) => (a.price || 0) - (b.price || 0)), [products]);

  const computePrice = useCallback((p) => computeDisplayedListPrice({
    product: p,
    categoryId,
    materialMode,
    typicalLayout,
    credenzaSize,
  }), [categoryId, materialMode, typicalLayout, credenzaSize]);

  return (
    <div
      className="rounded-[24px] overflow-hidden"
      style={{
        ...cardSurface(theme),
        backgroundColor: dark ? HOME_SURFACE_DARK : HOME_SURFACE_LIGHT,
        boxShadow: 'none',
      }}
    >
      {/* Config toggles — inside the card top */}
      {(configOptions.length > 0 || showMaterialToggle) && (
        <div className="px-4 pt-4 space-y-2">
          {showMaterialToggle && (
            <SegmentedToggle
              value={materialMode}
              onChange={onMaterialModeChange}
              options={[
                { value: 'laminate', label: 'Laminate' },
                { value: 'veneer', label: 'Veneer' },
              ]}
              size="md"
              fullWidth
              theme={theme}
            />
          )}
          {configOptions.length > 0 && (
            <SegmentedToggle
              value={configValue}
              onChange={onConfigChange}
              options={configOptions}
              size="sm"
              fullWidth
              wrap
              theme={theme}
            />
          )}
        </div>
      )}

      {/* Column headers */}
      <div className="px-5 pt-4 pb-1.5 flex items-center justify-between">
        <span className="text-[0.6875rem] font-medium tracking-wide uppercase" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
          Series
        </span>
        <span className="text-[0.6875rem] font-medium tracking-wide uppercase" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
          List
        </span>
      </div>

      {/* Product rows */}
      <div className="px-2 pb-3">
        {sorted.map((p) => {
          const active = p.id === activeProduct?.id;
          const price = computePrice(p);
          return (
            <button
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="w-full px-3 py-3 flex items-center justify-between transition-all duration-200 text-left rounded-[16px] active:scale-[0.99]"
              style={{
                cursor: active ? 'default' : 'pointer',
                backgroundColor: active ? subtleBg(theme, 1.5) : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = subtleBg(theme, 0.8);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = active ? subtleBg(theme, 1.5) : 'transparent';
              }}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: 3,
                    height: active ? 18 : 14,
                    backgroundColor: active ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                  }}
                />
                <span
                  className="text-[0.875rem] transition-all"
                  style={{
                    color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                    fontWeight: active ? 600 : 450,
                  }}
                >
                  {p.name}
                </span>
              </span>
              <span
                className="text-[0.875rem] tabular-nums transition-colors"
                style={{
                  color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                  fontWeight: active ? 600 : 450,
                }}
              >
                {formatCurrencyOrTbd(price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
PricingTable.displayName = 'PricingTable';

const ProductSeriesDetails = React.memo(({ product, products, theme, categoryId, onSelectProduct, materialMode }) => {
  const dark = isDarkTheme(theme);
  const lead = useMemo(
    () => LEAD_TIMES_DATA.find((row) => row.series?.toLowerCase() === product?.name?.toLowerCase()),
    [product?.name]
  );
  const finishes = CASEGOODS_FINISH_NOTES[product?.id] || [
    materialMode === 'veneer' ? 'Veneer list pricing' : 'Laminate list pricing',
    'Standard JSI finish program',
    'COM / COL available on select SKUs',
  ];
  const related = useMemo(
    () => (products || []).filter((p) => p.id !== product?.id).slice(0, 3),
    [products, product?.id]
  );

  if (!product) return null;

  return (
    <div
      className="rounded-[24px] overflow-hidden"
      style={{
        ...cardSurface(theme),
        backgroundColor: dark ? HOME_SURFACE_DARK : HOME_SURFACE_LIGHT,
        boxShadow: 'none',
      }}
    >
      <div className="px-5 pt-4 pb-2 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary, opacity: 0.55 }} />
        <span className="text-[0.6875rem] font-medium tracking-wide uppercase" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
          {product.name} details
        </span>
      </div>

      <div className="px-5 pb-3 space-y-3">
        <div className="flex items-start gap-2.5">
          <Clock3 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wide" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
              Lead time
            </p>
            <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
              {lead?.weeks != null ? `${lead.weeks} weeks` : '4–6 weeks'}
              {lead?.type ? ` · ${lead.type}` : categoryId === 'casegoods' ? ' · Casegoods' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
          <div className="min-w-0 flex-1">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wide mb-1.5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
              Specs & finishes
            </p>
            <ul className="space-y-1">
              {finishes.map((note) => (
                <li key={note} className="text-[0.8125rem] leading-snug" style={{ color: theme.colors.textPrimary }}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <div className="mx-5" style={{ height: 1, backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
          <div className="px-5 pt-3 pb-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wide mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
              Related series
            </p>
            <div className="flex flex-col gap-1">
              {related.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProduct(p)}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors"
                  style={{ backgroundColor: subtleBg(theme, 0.6) }}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                    {p.image ? (
                      <img src={p.image} alt="" className="w-full h-full object-contain p-0.5" loading="lazy" />
                    ) : (
                      <Package className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
                    )}
                  </div>
                  <span className="text-sm font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{p.name}</span>
                  <span className="ml-auto text-xs font-semibold tabular-nums shrink-0" style={{ color: theme.colors.textSecondary }}>
                    {formatCurrencyOrTbd(materialPrice(p, materialMode))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});
ProductSeriesDetails.displayName = 'ProductSeriesDetails';

// ─── Error State ─────────────────────────────────────────────────────────────
const ErrorState = ({ theme, message = 'The requested item does not exist.' }) => {
  return (
    <div className="p-6">
      <div
        className="p-10 text-center rounded-[24px]"
        style={{ ...cardSurface(theme), boxShadow: 'none' }}
      >
        <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
        <p className="font-medium" style={{ color: theme.colors.textPrimary }}>{message}</p>
      </div>
    </div>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export const ProductComparisonScreen = ({ categoryId, initialProductId, onNavigate, theme }) => {
  const categoryData = PRODUCT_DATA?.[categoryId];
  const isGuest = categoryId === 'guest';

  const initialProduct = useMemo(() => {
    if (!categoryData) return null;
    if (initialProductId) {
      const match = categoryData.products.find(p => p.id === initialProductId);
      if (match) return match;
    }
    return categoryData.products[0];
  }, [categoryData, initialProductId]);

  const [activeProduct, setActiveProduct] = useState(initialProduct);
  const [materialMode, setMaterialMode] = useState(isGuest ? 'wood' : 'laminate');
  const [typicalLayout, setTypicalLayout] = useState('Single Ped');  // matches TYPICAL_MULTIPLIERS keys
  const [conferenceSize, setConferenceSize] = useState('30x72');
  const [loungeConfig, setLoungeConfig] = useState('Single Seater');
  const [guestLegType, setGuestLegType] = useState('wood');
  const [credenzaSize, setCredenzaSize] = useState('20x72');

  const handleProductSelect = useCallback(p => setActiveProduct(p), []);

  const visibleProducts = useMemo(() => {
    if (!categoryData) return [];
    if (isGuest) return categoryData.products.filter(p => p.legType === guestLegType);
    return categoryData.products;
  }, [categoryData, isGuest, guestLegType]);

  const activeListPrice = useMemo(() => computeDisplayedListPrice({
    product: activeProduct,
    categoryId,
    materialMode,
    typicalLayout,
    credenzaSize,
  }), [activeProduct, categoryId, materialMode, typicalLayout, credenzaSize]);

  useEffect(() => {
    if (isGuest && activeProduct && !visibleProducts.includes(activeProduct)) {
      const next = visibleProducts[0];
      if (next) setActiveProduct(next);
    }
  }, [isGuest, activeProduct, visibleProducts]);

  if (!categoryData) return <ErrorState theme={theme} />;

  return (
    <div className="flex flex-col h-full app-header-offset overflow-x-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* Cap width below global --content-max-width so product photos don't stretch on xl/2xl */}
        <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-8 space-y-3 mx-auto w-full max-w-[720px] lg:max-w-[1100px] xl:max-w-[1280px]">
          {/* Category title */}
          <h1
            className="text-[1.25rem] font-bold tracking-tight px-1"
            style={{ color: theme.colors.textPrimary }}
          >
            {categoryData.name}
          </h1>

          {/* Product tabs */}
          <ProductTabs
            products={visibleProducts}
            activeProduct={activeProduct}
            onProductSelect={handleProductSelect}
            theme={theme}
            categoryName={categoryData.name}
          />

          {/* Stacked on mobile; hero + pricing side-by-side on desktop */}
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.9fr)] lg:gap-5 lg:items-start">
            <div className="min-w-0">
              <ProductHero
                product={activeProduct}
                listPrice={activeListPrice}
                theme={theme}
                categoryId={categoryId}
                onNavigate={onNavigate}
                categoryName={categoryData.name}
              />
            </div>

            <div className="min-w-0 space-y-3 lg:sticky lg:top-3">
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
                credenzaSize={credenzaSize}
                onCredenzaSizeChange={setCredenzaSize}
                materialMode={materialMode}
                onMaterialModeChange={setMaterialMode}
              />
              <ProductSeriesDetails
                product={activeProduct}
                products={visibleProducts}
                theme={theme}
                categoryId={categoryId}
                onSelectProduct={handleProductSelect}
                materialMode={materialMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
