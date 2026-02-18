import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check, Upload, Paperclip, FileText, Trash2 } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput.jsx';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect.jsx';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { SpotlightMultiSelect } from '../../components/common/SpotlightMultiSelect.jsx';
import { InfoTooltip } from '../../components/common/InfoTooltip.jsx';
import { PillButton, PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { DESIGN_TOKENS, isDarkTheme } from '../../design-system/tokens.js';

import {
  STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS,
} from './data.js';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { JSI_LAMINATES, JSI_VENEERS, JSI_SERIES } from '../products/data.js';
import { FINISH_SAMPLES } from '../samples';
import { CONTRACTS_DATA } from '../resources/contracts/data.js';
import { VisionOptions, KnoxOptions, WinkHoopzOptions } from './product-options.jsx';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

const parseCurrency = (raw) => {
  if (raw == null) return null;
  const n = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const CITY_OPTIONS = [
  'Indianapolis, IN', 'Jasper, IN', 'Evansville, IN', 'Bloomington, IN', 'Fort Wayne, IN',
  'Cincinnati, OH', 'Louisville, KY', 'Nashville, TN', 'Chicago, IL', 'St. Louis, MO',
  'Columbus, OH', 'Cleveland, OH', 'Detroit, MI', 'Milwaukee, WI', 'Minneapolis, MN',
  'Atlanta, GA', 'Charlotte, NC', 'Raleigh, NC', 'Pittsburgh, PA', 'Philadelphia, PA',
  'New York, NY', 'Boston, MA', 'Washington, DC', 'Baltimore, MD', 'Richmond, VA',
  'Dallas, TX', 'Austin, TX', 'Houston, TX', 'San Antonio, TX', 'Denver, CO',
  'Phoenix, AZ', 'Las Vegas, NV', 'Los Angeles, CA', 'San Diego, CA', 'San Francisco, CA',
  'Seattle, WA', 'Portland, OR', 'Salt Lake City, UT', 'Kansas City, MO', 'Omaha, NE',
];

const PO_OPTIONS = ['Unknown', 'Within 30 Days', '30\u201360 Days', '60\u2013180 Days', '180+ Days', 'Next Year'];
const WIN_PCT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const REWARD_THRESHOLD = 250000;

const END_USER_OPTIONS = [
  'ABC Corporation', 'GlobalTech', 'Midwest Health', 'State University', 'Metro Hospitality',
  'Innovate Labs', 'XYZ Industries', 'Acme Corp', 'TechVentures', 'Summit Partners',
];

/* ═══════════════════════════════════════════════════════════════
   LIGHTWEIGHT UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

/* — section card — */
const Section = ({ title, titleRight, children, theme, className = '' }) => {
  const dark = isDarkTheme(theme);
  const divider = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const lineStyle = { width: '32%', height: 0, borderBottom: `1px solid ${divider}` };
  return (
    <div className={`rounded-2xl ${className}`} style={{
      padding: '14px 20px', backgroundColor: dark ? theme.colors.surface : '#fff',
      border: `1px solid ${divider}`,
    }}>
      {title && !titleRight && (
        <>
          <h3 className="text-[15px] font-bold" style={{
            color: theme.colors.textPrimary, marginBottom: 6,
          }}>{title}</h3>
          <div style={lineStyle} />
        </>
      )}
      {title && titleRight && (
        <>
          <div className="flex items-center gap-4">
            <h3 className="text-[15px] font-bold flex-shrink-0" style={{
              color: theme.colors.textPrimary,
            }}>{title}</h3>
            <div className="ml-auto min-w-0" style={{ width: '55%' }}>{titleRight}</div>
          </div>
          <div style={{ ...lineStyle, marginTop: -3 }} />
        </>
      )}
      {children}
    </div>
  );
};

/* — compact field row — supports inline (label left, field right) — */
const LABEL_W = 'w-[120px]';          // fixed label column for consistent alignment
const Row = ({ label, children, theme, tip, noSep, inline }) => {
  const divider = isDarkTheme(theme) ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  return (
  <div className={`${inline ? 'flex items-center gap-3' : ''} py-2.5 ${noSep ? '' : 'border-t'}`}
    style={{ borderColor: noSep ? undefined : divider }}>
    {label && (
      <div className={`flex items-center gap-1.5 ${inline ? `flex-shrink-0 ${LABEL_W}` : 'mb-1.5'}`}>
        <label className={`text-[13px] font-semibold ${inline ? 'whitespace-nowrap' : ''}`}
          style={{ color: theme.colors.textPrimary }}>{label}</label>
        {tip && <InfoTooltip content={tip} theme={theme} position="right" size="sm" />}
      </div>
    )}
    {inline ? <div className="flex-1 min-w-0 overflow-hidden">{children}</div> : children}
  </div>
  );
};

/* — animated reveal wrapper — uses CSS grid-row trick for smooth height — */
const Reveal = ({ show, children }) => (
  <div style={{
    display: 'grid',
    gridTemplateRows: show ? '1fr' : '0fr',
    opacity: show ? 1 : 0,
    transition: 'grid-template-rows .35s cubic-bezier(.4,0,.2,1), opacity .3s ease',
  }}>
    <div style={{ overflow: 'hidden' }}>{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PRODUCT SPOTLIGHT (FIXED SCROLL ISSUE)
   ═══════════════════════════════════════════════════════════════ */
const ProductSpotlight = ({ selectedSeries, onAdd, available, theme }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hlIdx, setHlIdx] = useState(0);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const norm = s => s.toLowerCase();
  const filtered = useMemo(() => {
    if (!q.trim()) return available.slice(0, 40);
    return available.filter(s => norm(s).includes(norm(q))).slice(0, 40);
  }, [available, q]);

  useEffect(() => setHlIdx(0), [filtered.length]);

  const measure = useCallback(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  const doOpen = useCallback(() => { measure(); setOpen(true); }, [measure]);

  // close on outside click — but NOT on scroll inside menu
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (anchorRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('resize', () => setOpen(false));
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('resize', () => setOpen(false)); };
  }, [open]);

  const pick = useCallback((s) => {
    if (!selectedSeries.includes(s)) onAdd(s);
    setQ(''); setOpen(false);
  }, [selectedSeries, onAdd]);

  const onKey = useCallback((e) => {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); doOpen(); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHlIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHlIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[hlIdx]) pick(filtered[hlIdx]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
  }, [open, filtered, hlIdx, pick, doOpen]);

  return (
    <div ref={anchorRef}>
      <div onClick={doOpen}
        className="flex items-center gap-2 px-3.5 cursor-text"
        style={{ height: 44, borderRadius: 9999, background: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
        <input ref={inputRef} value={q}
          onChange={e => { setQ(e.target.value); if (!open) doOpen(); }}
          onFocus={doOpen} onKeyDown={onKey}
          placeholder="Search products..."
          className="flex-1 bg-transparent outline-none text-[13px]"
          style={{ color: theme.colors.textPrimary }} />
      </div>
      {open && createPortal(
        <div ref={menuRef}
          className="fixed rounded-2xl border shadow-xl overflow-hidden"
          style={{
            top: pos.top, left: pos.left, width: pos.width,
            maxHeight: 280, background: theme.colors.surface, borderColor: theme.colors.border,
            zIndex: DESIGN_TOKENS.zIndex.popover,
          }}>
          <div className="overflow-y-auto" style={{ maxHeight: 280, WebkitOverflowScrolling: 'touch' }}>
            {filtered.length > 0 ? filtered.map((s, idx) => {
              const sel = selectedSeries.includes(s);
              const hl = idx === hlIdx;
              return (
                <button key={s} type="button"
                  onClick={() => pick(s)}
                  onMouseEnter={() => setHlIdx(idx)}
                  className={`w-full text-left px-3.5 py-2.5 text-[13px] flex items-center justify-between transition-colors ${hl ? 'bg-black/5' : ''}`}
                  style={{ color: sel ? theme.colors.textSecondary : theme.colors.textPrimary, opacity: sel ? 0.5 : 1 }}>
                  <span>{s}</span>
                  {sel && <Check className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />}
                </button>
              );
            }) : (
              <div className="px-3.5 py-4 text-[13px] text-center" style={{ color: theme.colors.textSecondary }}>No products found</div>
            )}
          </div>
        </div>, document.body
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD (added series with options)
   ═══════════════════════════════════════════════════════════════ */
const ProductCard = React.memo(({ product, idx, onRemove, onUpdate, theme }) => {
  const hasOpts = ['Vision', 'Knox', 'Wink', 'Hoopz'].includes(product.series);
  return (
    <div className="rounded-2xl border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>{product.series}</span>
        <button type="button" onClick={() => onRemove(idx)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
          style={{ color: '#B85C5C' }}>
          <X className="w-3 h-3" /> Remove
        </button>
      </div>
      {hasOpts && (
        <div className="px-4 pb-3">
          {product.series === 'Vision' && <VisionOptions theme={theme} product={product} productIndex={idx} onUpdate={onUpdate} />}
          {product.series === 'Knox' && <KnoxOptions theme={theme} product={product} productIndex={idx} onUpdate={onUpdate} />}
          {(product.series === 'Wink' || product.series === 'Hoopz') && <WinkHoopzOptions theme={theme} product={product} productIndex={idx} onUpdate={onUpdate} />}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MAIN — NEW LEAD SCREEN
   ═══════════════════════════════════════════════════════════════ */
export const NewLeadScreen = ({
  theme, onSuccess,
  designFirms, setDesignFirms,
  dealers, setDealers,
  newLeadData = {},
  onNewLeadChange,
}) => {
  const stageOptions = useMemo(() => STAGES.filter(s => s !== 'Won' && s !== 'Lost'), []);

  useEffect(() => {
    if (newLeadData.projectStatus && !stageOptions.includes(newLeadData.projectStatus))
      onNewLeadChange({ projectStatus: stageOptions[0] });
  }, [newLeadData.projectStatus, stageOptions, onNewLeadChange]);

  const upd = useCallback((field, value) => {
    if (field === 'vertical' && value !== 'Other (Please specify)')
      return onNewLeadChange({ [field]: value, otherVertical: '' });
    onNewLeadChange({ [field]: value });
  }, [onNewLeadChange]);

  /* auto-disable rewards below threshold */
  const lastEstRef = useRef(null);
  useEffect(() => {
    const amt = parseCurrency(newLeadData.estimatedList);
    const prev = lastEstRef.current;
    if (amt !== null && amt > 0 && amt < REWARD_THRESHOLD && (prev === null || prev >= REWARD_THRESHOLD))
      onNewLeadChange({ salesReward: false, designerReward: false });
    lastEstRef.current = amt;
  }, [newLeadData.estimatedList, newLeadData.salesReward, newLeadData.designerReward, onNewLeadChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newLeadData.projectStatus) return alert('Please select a Project Stage before submitting.');
    onSuccess(newLeadData);
  };

  const toggleCompetitor = (c) => {
    const list = newLeadData.competitors || [];
    upd('competitors', list.includes(c) ? list.filter(x => x !== c) : [...list, c]);
  };

  const addProduct = useCallback((series) => {
    if (!series || (newLeadData.products || []).some(p => p.series === series)) return;
    upd('products', [...(newLeadData.products || []), { series, hasGlassDoors: false, surfaceTypes: [], materials: [], hasWoodBack: false, polyColor: '' }]);
  }, [newLeadData.products, upd]);

  const removeProduct = useCallback((idx) => {
    upd('products', (newLeadData.products || []).filter((_, i) => i !== idx));
  }, [newLeadData.products, upd]);

  const updateProductOption = useCallback((pi, key, value) => {
    upd('products', (newLeadData.products || []).map((p, i) => i === pi ? { ...p, [key]: value } : p));
  }, [newLeadData.products, upd]);

  /* quote state: 'existing' | 'needed' | null */
  const quoteMode = newLeadData.jsiQuoteExists ? 'existing' : newLeadData.quoteNeeded ? 'needed' : null;
  const setQuoteMode = (mode) => {
    onNewLeadChange({
      jsiQuoteExists: mode === 'existing',
      quoteNeeded: mode === 'needed',
      ...(mode !== 'existing' ? { jsiQuoteNumber: '' } : {}),
    });
  };

  const c = theme.colors;
  const dark = isDarkTheme(theme);
  const rangeStyle = {
    '--range-track': dark ? 'rgba(255,255,255,0.13)' : 'rgba(53,53,53,0.12)',
    '--range-thumb': dark ? '#EDE8E3' : '#353535',
  };

  return (
    <form onSubmit={handleSubmit}
      className="flex flex-col h-full overflow-y-auto scrollbar-hide app-header-offset"
      style={{ backgroundColor: c.background }}>
      <div className="px-4 sm:px-5 pt-4 pb-8 max-w-2xl mx-auto w-full">

        {/* ── 1. Project Details ── */}
        <Section title="Project Details" theme={theme} className="mb-4" titleRight={
          <FormInput value={newLeadData.project || ''} onChange={e => upd('project', e.target.value)}
            placeholder="Project Name *" theme={theme} size="sm" surfaceBg required />
        }>

          <Reveal show={!!(newLeadData.project && newLeadData.project.trim())}>
          <Row label="Stage" theme={theme} inline noSep>
            <div>
              <input type="range" min={0} max={stageOptions.length - 1} step={1}
                value={Math.max(0, stageOptions.indexOf(newLeadData.projectStatus))}
                onChange={e => upd('projectStatus', stageOptions[+e.target.value])}
                className="w-full jsi-range" style={rangeStyle} />
              <div className="flex justify-between mt-1" style={{ padding: '0 2px' }}>
                {stageOptions.map((s, i) => {
                  const active = i === stageOptions.indexOf(newLeadData.projectStatus);
                  return (
                    <span key={s}
                      onClick={() => upd('projectStatus', s)}
                      className="text-[10px] cursor-pointer select-none text-center transition-all duration-150"
                      style={{
                        color: active ? c.textPrimary : c.textSecondary,
                        fontWeight: active ? 700 : 400,
                        opacity: active ? 1 : 0.55,
                        flex: i === 0 || i === stageOptions.length - 1 ? 'none' : '1',
                        width: i === 0 || i === stageOptions.length - 1 ? 'auto' : undefined,
                      }}>
                      {s.replace('Decision/Bidding', 'Decision')}
                    </span>
                  );
                })}
              </div>
            </div>
          </Row>

          <Row label="Vertical" theme={theme} inline>
            {newLeadData.vertical === 'Other (Please specify)' ? (
              <div className="flex items-center gap-2">
                <FormInput value={newLeadData.otherVertical || ''} onChange={e => upd('otherVertical', e.target.value)}
                  placeholder="Enter vertical" theme={theme} size="sm" surfaceBg />
                <button type="button" onClick={() => upd('vertical', '')}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: c.subtle }}>
                  <X className="w-3.5 h-3.5" style={{ color: c.textSecondary }} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {VERTICALS.map(v => {
                  const lbl = v === 'Other (Please specify)' ? 'Other' : v;
                  return (
                    <PillButton key={v} size="xs" isSelected={newLeadData.vertical === v}
                      onClick={() => upd('vertical', v)} theme={theme} className="w-full">{lbl}</PillButton>
                  );
                })}
              </div>
            )}
          </Row>

          <Row label="Install Date" theme={theme} inline>
            <FormInput type="date" value={newLeadData.expectedInstallDate || ''}
              onChange={e => upd('expectedInstallDate', e.target.value)}
              theme={theme} size="sm" surfaceBg />
          </Row>

          <Row label="Location" theme={theme} inline
            tip="70% credit to specifying territory, 30% to ordering when territories differ.">
            <AutoCompleteCombobox
              value={newLeadData.installationLocation || ''}
              onChange={val => upd('installationLocation', val)}
              onSelect={val => upd('installationLocation', val)}
              options={CITY_OPTIONS}
              placeholder="City, State"
              theme={theme}
              compact
              resetOnSelect={false} />
          </Row>
          </Reveal>
        </Section>

        {/* ── 2. Financials & Timeline ── */}
        <Section title="Financials & Timeline" theme={theme} className="mb-4" titleRight={
          <FormInput type="currency" value={newLeadData.estimatedList || ''} required
            onChange={e => upd('estimatedList', e.target.value)}
            placeholder="Estimated List $" theme={theme} size="sm" surfaceBg />
        }>

          <Reveal show={!!(newLeadData.estimatedList && String(newLeadData.estimatedList).replace(/[^0-9]/g, '').length > 0)}>
          <Row label="Win Probability" theme={theme} inline>
            <div className="flex items-center gap-2.5 flex-1 min-w-0" style={{ minHeight: 40 }}>
              <input type="range" min={10} max={100} step={10}
                value={newLeadData.winProbability || 50}
                onChange={e => upd('winProbability', Number(e.target.value))}
                className="flex-1 jsi-range" style={{ minWidth: 0, ...rangeStyle }} />
              <span className="text-[12px] font-semibold tabular-nums w-[32px] text-right flex-shrink-0"
                style={{ color: c.textPrimary }}>{newLeadData.winProbability || 50}%</span>
            </div>
          </Row>

          <Row label="Discount" theme={theme} inline>
            <PortalNativeSelect value={newLeadData.discount || ''}
              onChange={e => upd('discount', e.target.value)}
              options={DISCOUNT_OPTIONS.map(d => ({ label: d, value: d }))}
              placeholder="Select Discount" theme={theme} mutedValues={['Undecided']} />
          </Row>

          <Row label="Rewards" theme={theme} inline>
            <div className="grid grid-cols-2 gap-1.5">
              {[['salesReward', 'Sales Reward'], ['designerReward', 'Designer Reward']].map(([key, lbl]) => {
                const on = newLeadData[key] !== false;
                return (
                  <PillButton key={key} size="xs" isSelected={on}
                    onClick={() => upd(key, !on)} theme={theme} className="w-full">{on ? '✓ ' : ''}{lbl}</PillButton>
                );
              })}
            </div>
          </Row>

          <Row label="PO Timeframe" theme={theme} inline>
            <div className="grid grid-cols-3 gap-1.5">
              {PO_OPTIONS.map(t => (
                <PillButton key={t} size="xs"
                  isSelected={newLeadData.poTimeframe === t}
                  onClick={() => upd('poTimeframe', t)} theme={theme} className="w-full">{t}</PillButton>
              ))}
            </div>
          </Row>

          <Row label="Contract" theme={theme} inline>
            <PortalNativeSelect value={newLeadData.contractType || ''}
              onChange={e => upd('contractType', e.target.value)}
              options={[
                { label: 'None', value: 'none' },
                ...Object.keys(CONTRACTS_DATA).map(k => ({ label: CONTRACTS_DATA[k].name, value: k })),
              ]}
              placeholder="Select Contract" theme={theme} mutedValues={['none', 'None']} />
          </Row>
          </Reveal>
        </Section>

        {/* ── 3. Stakeholders ── */}
        <Section title="Stakeholders" theme={theme} className="mb-4">
          <Row label="Dealer(s)" theme={theme} noSep inline>
            <SpotlightMultiSelect
              selectedItems={newLeadData.dealers || []}
              onAddItem={d => { const cur = newLeadData.dealers || []; if (!cur.includes(d)) upd('dealers', [...cur, d]); }}
              onRemoveItem={d => upd('dealers', (newLeadData.dealers || []).filter(x => x !== d))}
              options={(newLeadData.dealers || []).length > 0 ? (dealers || []).filter(d => d !== 'Undecided') : (dealers || [])}
              onAddNew={d => setDealers(p => [...new Set([d, ...p])])}
              placeholder="Search"
              theme={theme}
              compact />
          </Row>
          <Row label="A&D Firm(s)" theme={theme} inline>
            <SpotlightMultiSelect
              selectedItems={newLeadData.designFirms || []}
              onAddItem={f => { const cur = newLeadData.designFirms || []; if (!cur.includes(f)) upd('designFirms', [...cur, f]); }}
              onRemoveItem={f => upd('designFirms', (newLeadData.designFirms || []).filter(x => x !== f))}
              options={designFirms || []}
              onAddNew={f => setDesignFirms(p => [...new Set([f, ...p])])}
              placeholder="Search"
              theme={theme}
              compact />
          </Row>
          <Row label="End User" theme={theme} inline>
            <AutoCompleteCombobox
              value={newLeadData.endUser || ''}
              onChange={val => upd('endUser', val)}
              onSelect={val => upd('endUser', val)}
              options={END_USER_OPTIONS}
              placeholder="Search"
              theme={theme}
              compact
              resetOnSelect={false} />
          </Row>
        </Section>

        {/* ── 4. Competition & Products ── */}
        <Section title="Competition & Products" theme={theme} className="mb-4">
          {/* bid + competition toggles, inline */}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[13px] font-semibold" style={{ color: c.textPrimary }}>Bid?</span>
            <ToggleSwitch checked={!!newLeadData.isBid} onChange={e => upd('isBid', e.target.checked)} theme={theme} />
          </div>
          <div className="flex items-center justify-between py-2.5 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <span className="text-[13px] font-semibold" style={{ color: c.textPrimary }}>Competition?</span>
            <ToggleSwitch checked={!!newLeadData.competitionPresent} onChange={e => upd('competitionPresent', e.target.checked)} theme={theme} />
          </div>

          {/* competitor chips — animate in */}
          <div style={{
            display: 'grid', gridTemplateRows: newLeadData.competitionPresent ? '1fr' : '0fr',
            opacity: newLeadData.competitionPresent ? 1 : 0,
            transition: 'grid-template-rows .3s ease, opacity .25s ease',
          }}>
            <div style={{ overflow: 'hidden' }}>
              <Row label="Competitors" theme={theme} inline noSep>
                <div className="flex flex-wrap gap-1.5">
                  {[...COMPETITORS.filter(c => c !== 'None'), 'Other'].map(comp => (
                    <PillButton key={comp} size="xs" isSelected={(newLeadData.competitors || []).includes(comp)}
                      onClick={() => toggleCompetitor(comp)} theme={theme}>{comp}</PillButton>
                  ))}
                </div>
                {(newLeadData.competitors || []).includes('Other') && (
                  <div className="mt-2">
                    <FormInput value={newLeadData.otherCompetitor || ''} onChange={e => upd('otherCompetitor', e.target.value)}
                      placeholder="Other competitor" theme={theme} size="sm" surfaceBg />
                  </div>
                )}
              </Row>
            </div>
          </div>

          {/* JSI Quote — inline pills, click again to deselect */}
          <Row label="JSI Quote" theme={theme} inline>
            {quoteMode === 'existing' ? (
              <div className="flex items-center gap-1.5 justify-end">
                <div className="flex-1 min-w-[100px]">
                  <input value={newLeadData.jsiQuoteNumber || ''} onChange={e => upd('jsiQuoteNumber', e.target.value)}
                    placeholder="Quote #" className="w-full rounded-full px-3 py-1.5 text-[12px] outline-none border"
                    style={{ color: c.textPrimary, borderColor: c.border, backgroundColor: c.surface }} />
                </div>
                <button type="button" onClick={() => setQuoteMode(null)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: c.subtle }}>
                  <X className="w-3.5 h-3.5" style={{ color: c.textSecondary }} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <PillButton size="xs" isSelected={false}
                  onClick={() => setQuoteMode('existing')} theme={theme} className="w-full">Existing Quote</PillButton>
                <PillButton size="xs" isSelected={quoteMode === 'needed'}
                  onClick={() => setQuoteMode(quoteMode === 'needed' ? null : 'needed')} theme={theme} className="w-full">Quote Needed</PillButton>
              </div>
            )}
          </Row>
          {quoteMode === 'needed' && (
            <div className="pb-2">
              <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ backgroundColor: c.subtle }}>
                <Upload className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.textSecondary }} />
                <div>
                  <p className="text-[12px] font-medium" style={{ color: c.textPrimary }}>Upload specs or request later</p>
                  <p className="text-[11px] mt-0.5" style={{ color: c.textSecondary }}>
                    Attach a PDF now, or request a quote from the project page later.
                  </p>
                  <button type="button" className="mt-1.5 text-[11px] font-semibold underline" style={{ color: c.accent }}>
                    Choose File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* products — search inline to right of label */}
          <Row label="Products" theme={theme} inline>
            <ProductSpotlight
              selectedSeries={(newLeadData.products || []).map(p => p.series)}
              onAdd={addProduct} available={JSI_SERIES} theme={theme} />
          </Row>

          {(newLeadData.products || []).length > 0 && (
            <div className="space-y-2 pb-1">
              {(newLeadData.products || []).map((p, idx) => (
                <ProductCard key={p.series + idx} product={p} idx={idx}
                  onRemove={removeProduct} onUpdate={updateProductOption} theme={theme} />
              ))}
            </div>
          )}
        </Section>

        {/* ── 5. Notes & Attachments ── */}
        <Section title="Notes & Attachments" theme={theme} className="mb-6">
          <textarea
            value={newLeadData.notes || ''}
            onChange={e => upd('notes', e.target.value)}
            placeholder="Add notes, context, or special instructions..."
            rows="3"
            className="mt-2.5 w-full px-4 py-3 text-[13px] rounded-2xl border focus:outline-none focus:ring-0 resize-none placeholder-theme-secondary"
            style={{ backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }}
          />

          {/* Attachments */}
          <div className="mt-3">
            {(newLeadData.attachments || []).length > 0 && (
              <div className="space-y-1.5 mb-3">
                {(newLeadData.attachments || []).map((file, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
                    style={{ backgroundColor: c.surface, borderColor: c.border }}>
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.textSecondary }} />
                    <span className="flex-1 text-[12px] font-medium truncate" style={{ color: c.textPrimary }}>{file.name}</span>
                    <span className="text-[11px] flex-shrink-0" style={{ color: c.textSecondary }}>
                      {file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / 1048576).toFixed(1)} MB`}
                    </span>
                    <button type="button" onClick={() => upd('attachments', (newLeadData.attachments || []).filter((_, j) => j !== i))}
                      className="flex-shrink-0 p-0.5 rounded-full transition-colors"
                      style={{ color: c.textSecondary }}>
                      <X className="w-3 h-3" style={{ color: c.textSecondary }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed cursor-pointer transition-colors"
              style={{ borderColor: c.border, backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
              <Paperclip className="w-3.5 h-3.5" style={{ color: c.textSecondary }} />
              <span className="text-[12px] font-medium" style={{ color: c.textSecondary }}>Attach files</span>
              <input type="file" multiple className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files || []).map(f => ({ name: f.name, size: f.size, type: f.type }));
                  upd('attachments', [...(newLeadData.attachments || []), ...files]);
                  e.target.value = '';
                }} />
            </label>
          </div>
        </Section>

        {/* ── Submit ── */}
        <div className="pb-8">
          <PrimaryButton type="submit" theme={theme} size="large" fullWidth
            disabled={!newLeadData.project || !newLeadData.projectStatus}>
            Submit Lead →
          </PrimaryButton>
          {(!newLeadData.project || !newLeadData.projectStatus) && (
            <p className="text-[12px] text-center mt-3" style={{ color: c.textSecondary }}>
              Please fill in required fields to submit
            </p>
          )}
        </div>

      </div>
    </form>
  );
};