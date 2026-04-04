import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Upload, FileText, Eye, Send, Paperclip, Users, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS } from '../../../../design-system/tokens.js';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from '../../data.js';
import { JSI_SERIES } from '../../../products/data.js';
import { ProbabilitySlider } from '../../../../components/forms/ProbabilitySlider.jsx';
import { RequestQuoteModal } from '../../../../components/common/RequestQuoteModal.jsx';
import { ToggleSwitch } from '../../../../components/forms/ToggleSwitch.jsx';
import { SuggestInputPill } from './SuggestInputPill.jsx';
import { ContactSearchSelector } from './ContactSearchSelector.jsx';

/* helpers */
const parseCurrency = (raw) => {
  if (raw == null) return 0;
  const n = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const fmtCurrency = (n) => n > 0 ? `$${n.toLocaleString()}` : '\u2014';
const SPIFF_502010_MIN_LIST = 10000;

/* ---- section primitives ---- */
const Section = ({ title, children, theme, right }) => {
  const isDark = isDarkTheme(theme);
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  return (
    <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${divider}` }}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${divider}` }}>
          <span className="text-[12px] font-bold uppercase tracking-[0.07em]" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>{title}</span>
          {right}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
};

const Row = ({ label, children, theme, noSep }) => {
  const isDark = isDarkTheme(theme);
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  return (
    <div className={`flex items-start gap-3 py-3 ${noSep ? '' : 'border-t'}`} style={{ borderColor: noSep ? undefined : divider }}>
      {label && <label className="text-[11px] font-bold uppercase tracking-[0.07em] whitespace-nowrap flex-shrink-0 pt-1 w-[90px]" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>{label}</label>}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

const PillSelect = ({ options, value, onChange, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const active = opt === value;
        return (
          <button key={opt} onClick={() => onChange(opt)} className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
            style={{ backgroundColor: active ? theme.colors.accent : 'transparent', color: active ? theme.colors.accentText : theme.colors.textSecondary, border: active ? `1.5px solid ${theme.colors.accent}` : `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
};

const MultiPillSelect = ({ options, value = [], onToggle, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const active = value.includes(opt);
        return (
          <button key={opt} onClick={() => onToggle(opt)} className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
            style={{ backgroundColor: active ? theme.colors.accent : 'transparent', color: active ? theme.colors.accentText : theme.colors.textSecondary, border: active ? `1.5px solid ${theme.colors.accent}` : `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
};

/* ---- quote tracker ---- */
const QUOTE_STAGES = [
  { key: 'requested', label: 'Requested', icon: Clock, color: 'var(--theme-warning)' },
  { key: 'in-progress', label: 'In Progress', icon: Loader2, color: 'var(--theme-info)' },
  { key: 'review', label: 'Review', icon: Eye, color: 'var(--theme-info)' },
  { key: 'complete', label: 'Complete', icon: CheckCircle, color: 'var(--theme-success)' },
];

const QuoteTracker = ({ quotes = [], theme, onRequestQuote }) => {
  const isDark = isDarkTheme(theme);
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const fieldBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const queueAhead = 3;
  const estTime = '~2 business days';

  return (
    <div className="space-y-4">
      {quotes.length > 0 && quotes.map((q, qi) => {
        const stageIdx = QUOTE_STAGES.findIndex(s => s.key === (q.status || 'complete'));
        const activeStage = stageIdx >= 0 ? stageIdx : QUOTE_STAGES.length - 1;
        return (
          <div key={q.id || qi} className="rounded-[18px] p-4" style={{ backgroundColor: fieldBg, border: `1px solid ${divider}` }}>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.accent }} />
              <span className="text-[13px] font-bold flex-1 truncate" style={{ color: theme.colors.textPrimary }}>{q.fileName || `Quote #${qi + 1}`}</span>
              {(q.status === 'complete' || !q.status) && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--theme-success-light)', color: 'var(--theme-success)' }}>Ready</span>}
            </div>
            <div className="flex items-center gap-0">
              {QUOTE_STAGES.map((stage, si) => {
                const reached = si <= activeStage;
                const isCurrent = si === activeStage;
                const StIcon = stage.icon;
                return (
                  <React.Fragment key={stage.key}>
                    <div className="flex flex-col items-center" style={{ flex: '0 0 auto' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                        style={{ backgroundColor: reached ? `${stage.color}20` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'), border: isCurrent ? `2px solid ${stage.color}` : 'none' }}>
                        <StIcon className="w-3.5 h-3.5" style={{ color: reached ? stage.color : theme.colors.textSecondary, opacity: reached ? 1 : 0.3 }} />
                      </div>
                      <span className="text-[9px] font-semibold mt-1.5 whitespace-nowrap" style={{ color: isCurrent ? theme.colors.textPrimary : theme.colors.textSecondary, opacity: isCurrent ? 1 : 0.5 }}>{stage.label}</span>
                    </div>
                    {si < QUOTE_STAGES.length - 1 && <div className="flex-1 h-[2px] mx-1 rounded-full" style={{ backgroundColor: si < activeStage ? stage.color : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'), minWidth: 12 }} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="rounded-[18px] p-4 flex items-center gap-3" style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.08)' : 'rgba(91,123,140,0.06)', border: `1px solid ${isDark ? 'rgba(91,123,140,0.15)' : 'rgba(91,123,140,0.10)'}` }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.15)' : 'rgba(91,123,140,0.10)' }}>
          <Users className="w-4 h-4" style={{ color: '#5B7B8C' }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[12px] font-bold block" style={{ color: theme.colors.textPrimary }}>{queueAhead} quotes ahead in queue</span>
          <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>Estimated turnaround: {estTime}</span>
        </div>
      </div>

      <button onClick={onRequestQuote} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[13px] font-bold transition-all active:scale-[0.98] hover:opacity-90"
        style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
        <Send className="w-4 h-4" /> Request New Quote
      </button>
    </div>
  );
};

/* 
   MAIN COMPONENT
    */
export const OpportunityDetail = ({ opp, theme, onUpdate, members, currentUserId }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;

  const [draft, setDraft] = useState(opp);
  const dirty = useRef(false);
  const saveRef = useRef(null);
  useEffect(() => { setDraft(opp); }, [opp]);

  const update = useCallback((k, v) => {
    setDraft(p => { const n = { ...p, [k]: v }; dirty.current = true; return n; });
  }, []);

  useEffect(() => {
    if (!dirty.current) return;
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => { onUpdate(draft); dirty.current = false; }, 500);
    return () => clearTimeout(saveRef.current);
  }, [draft, onUpdate]);

  /* discount dropdown */
  const [discountOpen, setDiscountOpen] = useState(false);
  const discBtn = useRef(null);
  const discMenu = useRef(null);
  const [discPos, setDiscPos] = useState({ top: 0, left: 0, width: 0 });

  const openDiscount = () => {
    if (discBtn.current) { const r = discBtn.current.getBoundingClientRect(); setDiscPos({ top: r.bottom + 8 + window.scrollY, left: r.left + window.scrollX, width: Math.max(r.width, 220) }); }
    setDiscountOpen(true);
  };

  useEffect(() => {
    if (!discountOpen) return;
    const handler = e => { if (discMenu.current && !discMenu.current.contains(e.target) && !discBtn.current.contains(e.target)) setDiscountOpen(false); };
    const onResize = () => setDiscountOpen(false);
    window.addEventListener('mousedown', handler);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('mousedown', handler); window.removeEventListener('resize', onResize); };
  }, [discountOpen]);

  /* draggable pipeline stage */
  const stageTrackRef = useRef(null);
  const [stageDragging, setStageDragging] = useState(false);
  const stageFromX = useCallback((clientX) => {
    if (!stageTrackRef.current) return;
    const rect = stageTrackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (STAGES.length - 1));
    update('stage', STAGES[idx]);
  }, [update]);
  const onStagePointerDown = useCallback((clientX) => { setStageDragging(true); stageFromX(clientX); }, [stageFromX]);
  useEffect(() => {
    if (!stageDragging) return;
    const onMove = (e) => stageFromX(e.clientX || (e.touches && e.touches[0].clientX));
    const onUp = () => setStageDragging(false);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
  }, [stageDragging, stageFromX]);

  /* tag helpers */
  const toggleCompetitor = (comp) => { const list = draft.competitors || []; update('competitors', list.includes(comp) ? list.filter(x => x !== comp) : [...list, comp]); };
  const addProductSeries = (series) => { if (!series) return; const list = draft.products || []; if (!list.some(p => p.series === series)) update('products', [...list, { series }]); };
  const removeProductSeries = (series) => update('products', (draft.products || []).filter(p => p.series !== series));
  const removeFrom = (key, val) => update(key, (draft[key] || []).filter(x => x !== val));
  const addUnique = (key, val) => { if (!val) return; const list = draft[key] || []; if (!list.includes(val)) update(key, [...list, val]); };

  const fileInputRef = useRef(null);

  /* computed */
  const stageIdx = STAGES.indexOf(draft.stage);
  const stagePct = (stageIdx / Math.max(STAGES.length - 1, 1)) * 100;
  const rawNumeric = parseCurrency(draft.value);
  const discountMatch = (draft.discount || '').match(/\(([\d.]+)%\)/);
  const discountPct = discountMatch ? parseFloat(discountMatch[1]) / 100 : 0;
  const discountCode = String(draft.discount || '').split(' ')[0];
  const isDiscount502010 = discountCode === '50/20/10';
  const netValue = discountPct > 0 ? Math.round(rawNumeric * (1 - discountPct)) : rawNumeric;
  const rewardsOn = (draft.salesReward !== false) || (draft.designerReward !== false);
  const showSpiffWarning = isDiscount502010 && rewardsOn && rawNumeric > 0 && rawNumeric < SPIFF_502010_MIN_LIST;

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const enrichedQuotes = useMemo(() => (draft.quotes || []).map((q, i) => ({ ...q, status: q.status || (i === 0 ? 'complete' : 'in-progress') })), [draft.quotes]);
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="flex flex-col h-full" style={{ background: c.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-5 pb-16 max-w-4xl mx-auto w-full space-y-3" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 12px)' }}>

          {/* HERO */}
          <div className="pt-2 pb-2">
            <input value={draft.project || draft.name || ''} onChange={e => update(draft.project !== undefined ? 'project' : 'name', e.target.value)}
              className="w-full bg-transparent outline-none text-[30px] font-black tracking-tight leading-tight" style={{ color: c.textPrimary }} placeholder="Project name" />
            <input value={draft.company || ''} onChange={e => update('company', e.target.value)}
              className="bg-transparent outline-none text-[14px] font-medium mt-1 w-full" style={{ color: c.textSecondary, opacity: 0.7 }} placeholder="Company / End User" />
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}>
                {draft.stage || 'No Stage'}
              </span>
            </div>
          </div>

          {/* 1. FINANCIALS */}
          <Section title="Financials" theme={theme}>
            {/* List Value */}
            <div className="mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: c.textSecondary, opacity: 0.5 }}>List Value</span>
            </div>
            <div className="flex items-baseline gap-1.5 pb-4">
              <span className="text-[22px] font-bold tracking-tight leading-none" style={{ color: c.textSecondary, opacity: 0.22 }}>$</span>
              <input inputMode="numeric"
                value={(() => { const raw = ('' + (draft.value || '')).replace(/[^0-9]/g, ''); return raw ? parseInt(raw, 10).toLocaleString() : ''; })()}
                onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); update('value', val ? ('$' + parseInt(val, 10).toLocaleString()) : ''); }}
                className="bg-transparent outline-none text-[36px] font-black tracking-tight w-full leading-none" style={{ color: c.textPrimary }} placeholder="0" />
            </div>
            {/* Discount + Net row */}
            <div className="flex items-stretch border-t" style={{ borderColor: divider }}>
              <div className="flex-1 py-3.5 cursor-pointer" onClick={() => discountOpen ? setDiscountOpen(false) : openDiscount()} ref={discBtn}>
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] block mb-1" style={{ color: c.textSecondary, opacity: 0.5 }}>Discount</span>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] font-bold tracking-tight" style={{ color: c.textPrimary }}>{draft.discount || '—'}</span>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: c.textSecondary, opacity: 0.4 }} />
                </div>
              </div>
              <div className="w-px self-stretch my-2" style={{ backgroundColor: divider }} />
              <div className="flex-1 py-3.5 pl-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] block mb-1" style={{ color: c.textSecondary, opacity: 0.5 }}>Net Value</span>
                <span className="text-[15px] font-bold tracking-tight" style={{ color: netValue > 0 && discountPct > 0 ? c.accent : c.textSecondary, opacity: netValue > 0 && discountPct > 0 ? 1 : 0.3 }}>
                  {netValue > 0 && discountPct > 0 ? fmtCurrency(netValue) : '—'}
                </span>
              </div>
            </div>
            {/* Reward toggles — flat rows */}
            <div className="flex items-center justify-between py-3 border-t" style={{ borderColor: divider }}>
              <span className="text-[14px] font-semibold" style={{ color: c.textPrimary }}>Sales Reward</span>
              <ToggleSwitch checked={draft.salesReward !== false} onChange={e => update('salesReward', e.target.checked)} theme={theme} />
            </div>
            <div className="flex items-center justify-between py-3 border-t" style={{ borderColor: divider }}>
              <span className="text-[14px] font-semibold" style={{ color: c.textPrimary }}>Designer Reward</span>
              <ToggleSwitch checked={draft.designerReward !== false} onChange={e => update('designerReward', e.target.checked)} theme={theme} />
            </div>
            {showSpiffWarning && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[14px] mt-2" style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.08)' : 'rgba(196,149,106,0.06)' }}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.warning }} />
                <span className="text-[11px] font-medium" style={{ color: theme.colors.warning }}>No spiff eligible: 50/20/10 with list value under $10K.</span>
              </div>
            )}
          </Section>

          {/* 2. PIPELINE STAGE */}
          <Section title="Pipeline Stage" theme={theme}>
            {/* Drag track — dots only, no cramped labels */}
            <div className="relative select-none py-2" ref={stageTrackRef}
              style={{ cursor: stageDragging ? 'grabbing' : 'pointer', touchAction: 'none' }}
              onMouseDown={e => onStagePointerDown(e.clientX)} onTouchStart={e => onStagePointerDown(e.touches[0].clientX)}>
              <div className="absolute top-[13px] left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }} />
              <div className="absolute top-[13px] left-0 h-[3px] rounded-full transition-all" style={{ backgroundColor: c.accent, width: `${stagePct}%`, transitionDuration: stageDragging ? '0ms' : '300ms' }} />
              <div className="relative flex justify-between">
                {STAGES.map((s, i) => {
                  const reached = i <= stageIdx;
                  const isCurrent = s === draft.stage;
                  return (
                    <div key={s} style={{ width: 0, position: 'relative' }} className="flex flex-col items-center">
                      <div className="rounded-full flex-shrink-0 transition-all"
                        style={{ width: isCurrent ? 18 : 10, height: isCurrent ? 18 : 10, backgroundColor: reached ? c.accent : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'), border: isCurrent ? `3px solid ${c.surface}` : 'none', boxShadow: isCurrent ? `0 0 0 2px ${c.accent}` : 'none', marginTop: isCurrent ? -1 : 4, transitionDuration: stageDragging ? '0ms' : '300ms' }} />
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Current stage label */}
            <div className="mt-4 mb-3">
              <p className="text-[20px] font-black tracking-tight" style={{ color: c.textPrimary }}>{draft.stage || '—'}</p>
              <p className="text-[12px] font-medium mt-0.5" style={{ color: c.textSecondary, opacity: 0.5 }}>Step {Math.max(stageIdx + 1, 1)} of {STAGES.length}</p>
            </div>
            {/* Horizontal scroll stage pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
              {STAGES.map(s => (
                <button key={s} onClick={() => update('stage', s)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                  style={{ backgroundColor: s === draft.stage ? c.accent : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'), color: s === draft.stage ? c.accentText : c.textSecondary }}>
                  {s}
                </button>
              ))}
            </div>
            {/* Win probability */}
            <div className="pt-3 mt-2 border-t" style={{ borderColor: divider }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: c.textSecondary, opacity: 0.55 }}>Win Probability</span>
                <span className="text-[13px] font-black tabular-nums" style={{ color: c.textPrimary }}>{draft.winProbability || 0}%</span>
              </div>
              <ProbabilitySlider value={draft.winProbability || 0} onChange={v => update('winProbability', v)} theme={theme} showLabel={false} />
            </div>
          </Section>

          {/* 3. PROJECT DETAILS */}
          <Section title="Project Details" theme={theme}>
            <Row label="Vertical" theme={theme} noSep>
              <PillSelect options={VERTICALS.filter(v => v !== 'Other (Please specify)')} value={draft.vertical} onChange={v => update('vertical', v)} theme={theme} />
            </Row>
            <Row label="PO Timeframe" theme={theme}>
              <PillSelect options={PO_TIMEFRAMES} value={draft.poTimeframe} onChange={v => update('poTimeframe', v)} theme={theme} />
            </Row>
            <Row label="Install Date" theme={theme}>
              <input type="date" value={draft.expectedInstallDate || ''} onChange={e => update('expectedInstallDate', e.target.value)}
                className="w-full bg-transparent outline-none text-[13px] font-medium" style={{ color: c.textPrimary }} />
            </Row>
            <Row label="Location" theme={theme}>
              <input value={draft.installationLocation || ''} onChange={e => update('installationLocation', e.target.value)}
                className="w-full bg-transparent outline-none text-[13px] font-medium" style={{ color: c.textPrimary }} placeholder="City, State" />
            </Row>
            <div className="flex items-center gap-3 py-3 border-t" style={{ borderColor: divider }}>
              <label className="text-[11px] font-bold uppercase tracking-[0.07em] whitespace-nowrap flex-shrink-0 w-[90px]" style={{ color: c.textSecondary, opacity: 0.55 }}>Bid?</label>
              <div className="flex-1 flex justify-end"><ToggleSwitch checked={!!draft.isBid} onChange={e => update('isBid', e.target.checked)} theme={theme} /></div>
            </div>
          </Section>

          {/* 4. STAKEHOLDERS */}
          <Section title="Stakeholders" theme={theme}>
            <Row label="Contact" theme={theme} noSep>
              <ContactSearchSelector value={draft.contact || ''} onChange={v => update('contact', v)} dealers={draft.dealers || []} theme={theme} />
            </Row>
            <Row label="Dealer(s)" theme={theme}>
              <div className="flex flex-wrap gap-1.5">
                {(draft.dealers || []).map(f => (
                  <button key={f} onClick={() => removeFrom('dealers', f)} className="px-3 h-7 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all"
                    style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}>{f}<span className="opacity-40 text-[11px]">{'\u00d7'}</span></button>
                ))}
                <SuggestInputPill placeholder="Add dealer" suggestions={INITIAL_DEALERS} onAdd={v => addUnique('dealers', v)} theme={theme} />
              </div>
            </Row>
            <Row label="A&D Firm(s)" theme={theme}>
              <div className="flex flex-wrap gap-1.5">
                {(draft.designFirms || []).map(f => (
                  <button key={f} onClick={() => removeFrom('designFirms', f)} className="px-3 h-7 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all"
                    style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}>{f}<span className="opacity-40 text-[11px]">{'\u00d7'}</span></button>
                ))}
                <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v => addUnique('designFirms', v)} theme={theme} />
              </div>
            </Row>
            <Row label="End User" theme={theme}>
              <input value={draft.endUser || draft.company || ''} onChange={e => update('endUser', e.target.value)}
                className="w-full bg-transparent outline-none text-[13px] font-medium" style={{ color: c.textPrimary }} placeholder="Company name" />
            </Row>
          </Section>

          {/* 5. COMPETITION */}
          <Section title="Competition" theme={theme} right={<ToggleSwitch checked={draft.competitionPresent !== false} onChange={e => update('competitionPresent', e.target.checked)} theme={theme} />}>
            {draft.competitionPresent !== false ? (
              <MultiPillSelect options={COMPETITORS.filter(x => x !== 'None')} value={draft.competitors || []} onToggle={toggleCompetitor} theme={theme} />
            ) : (
              <p className="text-[12px]" style={{ color: c.textSecondary, opacity: 0.6 }}>No competition noted</p>
            )}
          </Section>

          {/* 6. PRODUCTS */}
          <Section title="Products" theme={theme}>
            <div className="flex flex-wrap gap-2 mb-3">
              {(draft.products || []).map(p => (
                <button key={p.series} onClick={() => removeProductSeries(p.series)} className="px-3.5 h-8 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all"
                  style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}>{p.series}<span className="opacity-40 text-[11px]">{'\u00d7'}</span></button>
              ))}
            </div>
            <SuggestInputPill placeholder="Add series..." suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
          </Section>

          {/* 7. QUOTES */}
          <Section title="Quotes" theme={theme}>
            <QuoteTracker quotes={enrichedQuotes} theme={theme} onRequestQuote={() => setQuoteModalOpen(true)} />
          </Section>

          {/* 8. DOCUMENTS */}
          <Section title="Documents" theme={theme} right={
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}><Upload className="w-3 h-3" /> Upload</button>
          }>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files || []);
                const newDocs = files.map(f => ({ id: Date.now() + '_' + f.name, fileName: f.name, type: f.type.includes('pdf') ? 'PDF' : f.type.includes('image') ? 'Image' : 'Document', size: f.size < 1024 * 1024 ? `${Math.round(f.size / 1024)}KB` : `${(f.size / (1024 * 1024)).toFixed(1)}MB`, date: new Date().toLocaleDateString() }));
                update('documents', [...(draft.documents || []), ...newDocs]);
                e.target.value = '';
              }} />
            {(draft.documents || []).length > 0 ? (
              <div className="space-y-2">
                {(draft.documents || []).map(doc => (
                  <div key={doc.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-colors"
                    style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', border: `1px solid ${divider}` }}>
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: c.accent }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold truncate" style={{ color: c.textPrimary }}>{doc.fileName}</div>
                      <div className="text-[11px]" style={{ color: c.textSecondary, opacity: 0.6 }}>{doc.type} {'\u00b7'} {doc.size} {'\u00b7'} {doc.date}</div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-full" style={{ color: c.textSecondary }} title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => update('documents', (draft.documents || []).filter(d => d.id !== doc.id))} className="p-1 rounded-full" style={{ color: c.textSecondary }} title="Remove"><span className="text-[13px] leading-none">{'\u00d7'}</span></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-[18px] transition-all hover:opacity-80"
                style={{ border: `2px dashed ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, color: c.textSecondary }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                  <Paperclip className="w-4 h-4" style={{ opacity: 0.5 }} />
                </div>
                <span className="text-[12px] font-semibold">Drop files or click to upload</span>
                <span className="text-[11px]" style={{ opacity: 0.5 }}>PDF, DOC, images & more</span>
              </button>
            )}
          </Section>

          {/* 9. NOTES */}
          <Section title="Notes" theme={theme}>
            <textarea value={draft.notes || ''} onChange={e => update('notes', e.target.value)} rows={4}
              className="w-full resize-none bg-transparent outline-none text-[14px] leading-relaxed"
              style={{ color: c.textPrimary }}
              placeholder="Add notes, context, or special instructions..." />
          </Section>

          {/* AUTOSAVE */}
          <div className="flex justify-center pt-1 pb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-success)', opacity: 0.5 }} />
              <span className="text-[11px] font-medium tracking-wide" style={{ color: c.textSecondary, opacity: 0.35 }}>Changes saved automatically</span>
            </div>
          </div>

        </div>
      </div>

      {/* discount dropdown */}
      {discountOpen && (
        <div ref={discMenu} className="fixed rounded-[18px] overflow-hidden"
          style={{ top: discPos.top, left: discPos.left, width: discPos.width, background: theme?.colors?.surface || (isDark ? '#2a2a2a' : '#fff'), border: `1px solid ${divider}`, boxShadow: DESIGN_TOKENS.shadows.modal, zIndex: DESIGN_TOKENS.zIndex.popover }}>
          <div className="max-h-[360px] overflow-y-auto scrollbar-hide py-1">
            {DISCOUNT_OPTIONS.map(opt => (
              <button key={opt} onClick={() => { update('discount', opt); setDiscountOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${opt === draft.discount ? 'font-bold' : 'font-medium'}`}
                style={{ color: c.textPrimary }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      <RequestQuoteModal show={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} theme={theme}
        members={members}
        currentUserId={currentUserId}
        onSubmit={(data) => {
          const newQuote = { id: 'q-' + Date.now(), fileName: `Quote Request - ${data.projectName || draft.project || draft.name || 'Untitled'}.pdf`, status: 'requested', url: null };
          update('quotes', [...(draft.quotes || []), newQuote]);
          setQuoteModalOpen(false);
        }}
        initialData={{ projectName: draft.project || draft.name || '', dealerName: (draft.dealers || [])[0] || '', adFirm: (draft.designFirms || [])[0] || '' }} />
    </div>
  );
};
