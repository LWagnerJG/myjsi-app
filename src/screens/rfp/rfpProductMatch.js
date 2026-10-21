/**
 * Rules-based product matching against existing JSI product catalog.
 * Suggestions are labeled "suggested, verify SKU" — never invent SKUs.
 */

import { PRODUCT_DATA } from '../products/data.js';
import { JSI_SERIES } from '../../data/jsiSeries.js';

const CATEGORY_HINTS = [
  { re: /bench|workstation|desking|casegood|private office|panel/i, categories: ['casegoods', 'tables', 'benches'], seriesBoost: ['Vision', 'Flux', 'Brogan'] },
  { re: /task chair|task seating|protocol|mesh back|swivel/i, categories: ['swivels'], seriesBoost: ['Protocol', 'Proxy', 'Copilot'] },
  { re: /guest|stack|side chair|knox/i, categories: ['guest'], seriesBoost: ['Knox', 'Harbor', 'Bryn'] },
  { re: /lounge|sofa|collaborat/i, categories: ['lounge'], seriesBoost: ['Indie', 'BeSPACE', 'Native'] },
  { re: /conference|meeting table|racetrack|boardroom/i, categories: ['conference-tables'], seriesBoost: ['Wellington', 'Vision', 'Moto'] },
  { re: /nest|flip.?top|training table|moto/i, categories: ['tables', 'conference-tables'], seriesBoost: ['Moto', 'Reef'] },
  { re: /storage|lateral|pedestal|wardrobe/i, categories: ['casegoods', 'storage'], seriesBoost: ['Vision', 'Flux'] },
];

const PARTNER_HINTS = /demountable|high-?density|phone booth|focus pod|technical work bench|ESD|butcher block/i;

function catalogEntries() {
  const out = [];
  for (const [catId, cat] of Object.entries(PRODUCT_DATA)) {
    for (const product of cat.products || []) {
      out.push({
        categoryId: catId,
        categoryName: cat.name,
        productId: product.id,
        series: product.name,
        listPrice: product.price,
        veneerPrice: product.veneerPrice ?? null,
        image: product.image || '',
      });
    }
  }
  return out;
}

const CATALOG = catalogEntries();

function scoreEntry(entry, text, boostSeries = []) {
  let score = 0;
  const hay = text.toLowerCase();
  const series = String(entry.series || '').toLowerCase();
  if (series && hay.includes(series)) score += 5;
  if (boostSeries.some((s) => s.toLowerCase() === series)) score += 3;
  if (hay.includes(entry.categoryName.toLowerCase())) score += 1;
  return score;
}

/**
 * @param {{ itemCode?: string, quantity?: number|null, context?: string, description?: string, sourcePage?: number }[]} itemCodes
 * @param {{ text?: string, category?: string }[]} requirements
 */
export function matchProducts({ itemCodes = [], requirements = [] } = {}) {
  const matches = [];
  const exceptions = [];

  for (const item of itemCodes) {
    const blob = [item.itemCode, item.context, item.description].filter(Boolean).join(' ');
    if (PARTNER_HINTS.test(blob)) {
      exceptions.push({
        itemCode: item.itemCode,
        quantity: item.quantity ?? null,
        sourcePage: item.sourcePage,
        reason: 'Outside typical JSI portfolio — flag as partner / exception',
        status: 'Partner',
      });
      continue;
    }

    const hint = CATEGORY_HINTS.find((h) => h.re.test(blob))
      || CATEGORY_HINTS.find((h) => requirements.some((r) => h.re.test(r.text || '')));

    let candidates = CATALOG;
    if (hint) {
      candidates = CATALOG.filter((c) => hint.categories.includes(c.categoryId));
      if (!candidates.length) candidates = CATALOG;
    }

    const ranked = candidates
      .map((c) => ({ entry: c, score: scoreEntry(c, blob, hint?.seriesBoost) }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    if (!best || best.score < 1) {
      // Soft fallback: first boost series if known in catalog
      const boostName = hint?.seriesBoost?.[0];
      const boost = boostName
        ? CATALOG.find((c) => c.series.toLowerCase() === boostName.toLowerCase())
        : null;
      if (boost) {
        matches.push({
          itemCode: item.itemCode,
          quantity: item.quantity ?? 1,
          sourcePage: item.sourcePage,
          series: boost.series,
          categoryName: boost.categoryName,
          productId: boost.productId,
          listPrice: boost.listPrice,
          image: boost.image,
          label: 'suggested, verify SKU',
          confidence: 'low',
          status: 'Partial',
          rationale: `Category hint matched ${boost.categoryName}; confirm exact SKU against price list.`,
        });
      } else {
        exceptions.push({
          itemCode: item.itemCode,
          quantity: item.quantity ?? null,
          sourcePage: item.sourcePage,
          reason: 'No confident JSI series match — needs product specialist',
          status: 'Gap',
        });
      }
      continue;
    }

    matches.push({
      itemCode: item.itemCode,
      quantity: item.quantity ?? 1,
      sourcePage: item.sourcePage,
      series: best.entry.series,
      categoryName: best.entry.categoryName,
      productId: best.entry.productId,
      listPrice: best.entry.listPrice,
      image: best.entry.image,
      label: 'suggested, verify SKU',
      confidence: best.score >= 5 ? 'medium' : 'low',
      status: best.score >= 5 ? 'Meets' : 'Partial',
      rationale: `Matched from catalog series "${best.entry.series}" (${best.entry.categoryName}).`,
    });
  }

  return {
    matches,
    exceptions,
    knownSeries: JSI_SERIES,
    disclaimer: 'DEMO-ONLY product matches — rule-based suggestions from the in-app JSI catalog. Always verify SKU and finish against the current price list. Not a formal offer.',
  };
}

/** Parse "50/20/5 (62.00%)" → net fraction 0.38 of list (pay 38%). */
export function parseDiscountOption(option) {
  const m = String(option || '').match(/\(([\d.]+)%\)/);
  if (!m) return { label: option, netPct: 50, multiplier: 0.5 };
  const offPct = Number(m[1]);
  return { label: option, netPct: offPct, multiplier: Math.max(0, 1 - offPct / 100) };
}

/**
 * Rules-based demo pricing worksheet — never AI-guessed.
 */
export function buildPricingWorksheet(matches, {
  discountOption = '50/20/5 (62.00%)',
  installFeePct = 0.08,
  designFeeFlat = 0,
  gsaMode = false,
  iffPct = 0.0075,
} = {}) {
  const discount = parseDiscountOption(discountOption);
  // GSA GS-28F-0030U: install capped at 30% of net product
  const cappedInstallPct = gsaMode ? Math.min(installFeePct, 0.30) : installFeePct;

  const lines = (matches || []).map((m) => {
    const qty = Number(m.quantity) > 0 ? Number(m.quantity) : 1;
    const list = Number(m.listPrice) || 0;
    const extList = list * qty;
    const extNet = extList * discount.multiplier;
    return {
      itemCode: m.itemCode,
      series: m.series,
      quantity: qty,
      listUnit: list,
      extList,
      extNet,
      label: m.label,
    };
  });

  const subtotalList = lines.reduce((n, l) => n + l.extList, 0);
  const subtotalNet = lines.reduce((n, l) => n + l.extNet, 0);
  const installFee = subtotalNet * cappedInstallPct;
  const iff = gsaMode ? subtotalNet * iffPct : 0;
  const total = subtotalNet + installFee + designFeeFlat + iff;

  return {
    demo: true,
    disclaimer: 'DEMO PRICE DATA ONLY — list prices from the in-app catalog (Jan 2026 price list references). Rules-based only (no AI pricing). Not a formal quote or commitment.',
    discountOption: discount.label,
    netOffPct: discount.netPct,
    installFeePct: cappedInstallPct,
    installCappedAt30: gsaMode && installFeePct > 0.30,
    designFeeFlat,
    gsaMode,
    iffPct: gsaMode ? iffPct : 0,
    iff,
    lines,
    subtotalList,
    subtotalNet,
    installFee,
    total,
  };
}
