import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Upload, FileText, Eye, Send, Paperclip, Users, Clock, CheckCircle, AlertCircle, Loader2, Share2, Download, ExternalLink } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS, JSI_COLORS } from '../../../../design-system/tokens.js';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from '../../data.js';
import { JSI_SERIES } from '../../../products/data.js';
import { PrimaryButton } from '../../../../components/common/JSIButtons.jsx';
import { ProbabilitySlider } from '../../../../components/forms/ProbabilitySlider.jsx';
import { RequestQuoteModal } from '../../../../components/common/RequestQuoteModal.jsx';
import { createQuoteListItem, persistQuoteRequest } from '../../../../utils/quoteRequests.js';
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
  const divider = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  return (
    <div className="rounded-2xl" style={{ padding: '12px 14px', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#fff', border: `1px solid ${divider}` }}>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.08em]" style={{ color: theme.colors.accent, opacity: 0.7 }}>{title}</span>
          {right}
        </div>
      )}
      {children}
    </div>
  );
};

const Row = ({ label, children, theme, noSep }) => {
  const isDark = isDarkTheme(theme);
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  return (
    <div className={`flex items-center gap-2.5 py-2.5 ${noSep ? '' : 'border-t'}`} style={{ borderColor: noSep ? undefined : divider }}>
      {label && <label className="text-[0.6875rem] font-semibold whitespace-nowrap flex-shrink-0" style={{ color: theme.colors.textSecondary, minWidth: 72 }}>{label}</label>}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

const PillSelect = ({ options, value, onChange, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(opt => {
        const active = opt === value;
        return (
          <button key={opt} onClick={() => onChange(opt)} className="px-2.5 py-[5px] rounded-full text-[0.6875rem] font-semibold transition-all active:scale-[0.97]"
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
    <div className="flex flex-wrap gap-1">
      {options.map(opt => {
        const active = value.includes(opt);
        return (
          <button key={opt} onClick={() => onToggle(opt)} className="px-2.5 py-[5px] rounded-full text-[0.6875rem] font-semibold transition-all active:scale-[0.97]"
            style={{ backgroundColor: active ? theme.colors.accent : 'transparent', color: active ? theme.colors.accentText : theme.colors.textSecondary, border: active ? `1.5px solid ${theme.colors.accent}` : `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
};

/* ---- quote tracker ---- */
const STATUS_META = {
  requested:    { label: 'Requested',   icon: Clock,        color: JSI_COLORS.warning, bg: `${JSI_COLORS.warning}1A` },
  'in-progress':{ label: 'In Progress', icon: Loader2,      color: JSI_COLORS.info,    bg: `${JSI_COLORS.info}1A` },
  review:       { label: 'In Review',   icon: Eye,          color: JSI_COLORS.info,    bg: `${JSI_COLORS.info}1A` },
  complete:     { label: 'Complete',    icon: CheckCircle,  color: JSI_COLORS.success, bg: `${JSI_COLORS.success}1A` },
};

const QuoteTracker = ({ quotes = [], theme, onRequestQuote }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const divider = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';

  const completed = quotes.filter(q => q.status === 'complete' || !q.status);
  const pending = quotes.filter(q => q.status && q.status !== 'complete');
  const queueAhead = Math.max(0, pending.length + 2); // 2 = simulated team queue
  const estDays = queueAhead <= 1 ? 1 : Math.min(queueAhead, 5);

  return (
    <div className="space-y-3">
      {/* ── Queue status bar ── */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.10)' : 'rgba(91,123,140,0.06)', border: `1px solid ${isDark ? 'rgba(91,123,140,0.15)' : 'rgba(91,123,140,0.08)'}` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.18)' : 'rgba(91,123,140,0.12)' }}>
            <Users className="w-3 h-3" style={{ color: JSI_COLORS.info }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[0.6875rem] font-bold block leading-tight" style={{ color: c.textPrimary }}>{queueAhead} quote{queueAhead !== 1 ? 's' : ''} in queue</span>
            <span className="text-[0.625rem] leading-tight" style={{ color: c.textSecondary }}>Est. {estDays} business day{estDays !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* ── Pending quotes ── */}
      {pending.map((q, qi) => {
        const meta = STATUS_META[q.status] || STATUS_META.requested;
        const StIcon = meta.icon;
        return (
          <div key={q.id || qi} className="flex items-center gap-3 px-3.5 py-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${divider}` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}>
              <StIcon className="w-3 h-3" style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[0.6875rem] font-bold truncate block" style={{ color: c.textPrimary }}>{q.fileName || `Quote #${qi + 1}`}</span>
              <span className="text-[0.625rem]" style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
            </div>
          </div>
        );
      })}

      {/* ── Completed quotes — viewable / shareable ── */}
      {completed.map((q, qi) => (
        <div key={q.id || `c${qi}`} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(74,124,89,0.20)' : 'rgba(74,124,89,0.15)'}`, backgroundColor: isDark ? 'rgba(74,124,89,0.06)' : 'rgba(74,124,89,0.04)' }}>
          <div className="flex items-center gap-3 px-3.5 py-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(74,124,89,0.12)' }}>
              <CheckCircle className="w-3 h-3" style={{ color: JSI_COLORS.success }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[0.6875rem] font-bold truncate block" style={{ color: c.textPrimary }}>{q.fileName || `Quote #${qi + 1}`}</span>
              <span className="text-[0.625rem] font-semibold" style={{ color: JSI_COLORS.success }}>Ready to view</span>
            </div>
          </div>
          <div className="flex border-t" style={{ borderColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.10)' }}>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[0.625rem] font-semibold transition-colors hover:bg-black/[0.03] active:scale-[0.98]" style={{ color: c.textPrimary }}>
              <Eye className="w-3 h-3" /> View
            </button>
            <div className="w-px" style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.10)' }} />
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[0.625rem] font-semibold transition-colors hover:bg-black/[0.03] active:scale-[0.98]" style={{ color: c.textPrimary }}>
              <Share2 className="w-3 h-3" /> Share
            </button>
            <div className="w-px" style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.10)' }} />
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[0.625rem] font-semibold transition-colors hover:bg-black/[0.03] active:scale-[0.98]" style={{ color: c.textPrimary }}>
              <Download className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      ))}

      {/* ── Request new quote CTA ── */}
      <PrimaryButton
        type="button"
        onClick={onRequestQuote}
        theme={theme}
        fullWidth
        className="py-2.5 text-xs font-bold"
        icon={<Send className="w-3.5 h-3.5" />}
      >
        Request Quote
      </PrimaryButton>
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
  const divider = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ background: c.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-5 pt-3 pb-6 max-w-3xl mx-auto w-full space-y-2.5">

          {/* HERO */}
          <div className="pb-0.5">
            <input value={draft.project || draft.name || ''} onChange={e => update(draft.project !== undefined ? 'project' : 'name', e.target.value)}
              className="w-full bg-transparent outline-none text-xl font-bold tracking-tight leading-tight" style={{ color: c.textPrimary }} placeholder="Project name" />
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent, opacity: 0.5 }} />
              <input value={draft.company || ''} onChange={e => update('company', e.target.value)}
                className="bg-transparent outline-none text-[0.6875rem] font-semibold flex-1" style={{ color: c.textSecondary }} placeholder="Company / End User" />
            </div>
          </div>

          {/* 1. FINANCIALS */}
          <Section title="Financials" theme={theme}>
            <div className="flex items-baseline gap-1.5 pb-2">
              <span className="text-lg font-bold tracking-tight leading-none" style={{ color: c.textSecondary, opacity: 0.25 }}>$</span>
              <input inputMode="numeric"
                value={(() => { const raw = ('' + (draft.value || '')).replace(/[^0-9]/g, ''); return raw ? parseInt(raw, 10).toLocaleString() : ''; })()}
                onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); update('value', val ? ('$' + parseInt(val, 10).toLocaleString()) : ''); }}
                className="bg-transparent outline-none text-[1.375rem] font-bold tracking-tight w-full leading-none" style={{ color: c.textPrimary }} placeholder="0" />
            </div>
            <div className="h-px" style={{ backgroundColor: divider }} />
            <div className="pt-2 flex items-center gap-4">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => discountOpen ? setDiscountOpen(false) : openDiscount()} ref={discBtn}>
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.08em] block mb-0.5" style={{ color: c.accent, opacity: 0.7 }}>Discount</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold tracking-tight truncate" style={{ color: c.textPrimary }}>{draft.discount || '\u2014'}</span>
                  <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.35 }} />
                </div>
              </div>
              <div className="w-px h-7 flex-shrink-0" style={{ backgroundColor: divider }} />
              <div className="flex-1 min-w-0">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.08em] block mb-0.5" style={{ color: c.accent, opacity: 0.7 }}>Net Value</span>
                <span className="text-[0.8125rem] font-bold tracking-tight leading-none" style={{ color: c.textPrimary }}>{netValue > 0 && discountPct > 0 ? fmtCurrency(netValue) : '\u2014'}</span>
              </div>
            </div>
            <div className="h-px mt-2" style={{ backgroundColor: divider }} />
            <div className="flex gap-1.5 pt-2">
              <div className="flex-1 rounded-lg px-2.5 py-1.5 flex items-center justify-between" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.015)' }}>
                <span className="text-[0.625rem] font-semibold" style={{ color: c.textPrimary }}>Sales Reward</span>
                <ToggleSwitch checked={draft.salesReward !== false} onChange={e => update('salesReward', e.target.checked)} theme={theme} />
              </div>
              <div className="flex-1 rounded-lg px-2.5 py-1.5 flex items-center justify-between" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.015)' }}>
                <span className="text-[0.625rem] font-semibold" style={{ color: c.textPrimary }}>Designer Reward</span>
                <ToggleSwitch checked={draft.designerReward !== false} onChange={e => update('designerReward', e.target.checked)} theme={theme} />
              </div>
            </div>
            {showSpiffWarning && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mt-1" style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.08)' : 'rgba(196,149,106,0.06)' }}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.warning }} />
                <span className="text-[0.6875rem] font-medium" style={{ color: theme.colors.warning }}>No spiff eligible: 50/20/10 with list value under $10K.</span>
              </div>
            )}
          </Section>

          {/* 2. PIPELINE STAGE */}
          <Section title="Pipeline Stage" theme={theme}>
            <div className="relative px-3 select-none" ref={stageTrackRef}
              style={{ cursor: stageDragging ? 'grabbing' : 'pointer', touchAction: 'none' }}
              onMouseDown={e => onStagePointerDown(e.clientX)} onTouchStart={e => onStagePointerDown(e.touches[0].clientX)}>
              <div className="absolute top-[6px] left-3 right-3 h-[2px] rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
              <div className="absolute top-[6px] left-3 h-[2px] rounded-full transition-all" style={{ backgroundColor: c.accent, width: `calc(${stagePct / 100} * (100% - 24px))`, transitionDuration: stageDragging ? '0ms' : '300ms' }} />
              <div className="relative flex justify-between">
                {STAGES.map((s, i) => {
                  const reached = i <= stageIdx;
                  const isCurrent = s === draft.stage;
                  return (
                    <div key={s} className="flex flex-col items-center" style={{ width: 0, position: 'relative' }}>
                      <div className="rounded-full flex-shrink-0 transition-all"
                        style={{ width: isCurrent ? 14 : 9, height: isCurrent ? 14 : 9, backgroundColor: reached ? c.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'), border: isCurrent ? `2.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}` : 'none', marginTop: isCurrent ? -1 : 1, transitionDuration: stageDragging ? '0ms' : '300ms' }} />
                      <span className="absolute top-5 text-[0.5625rem] font-semibold whitespace-nowrap transition-all pointer-events-none"
                        style={{ color: isCurrent ? c.textPrimary : c.textSecondary, opacity: isCurrent ? 1 : 0.4, fontWeight: isCurrent ? 700 : 500, left: '50%', transform: i === 0 ? 'translateX(-10%)' : i === STAGES.length - 1 ? 'translateX(-90%)' : 'translateX(-50%)' }}>
                        {s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-4" />
            <div className="pt-2 border-t" style={{ borderColor: divider }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.08em]" style={{ color: c.accent, opacity: 0.7 }}>Win Probability</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: c.textPrimary }}>{draft.winProbability || 0}%</span>
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
                className="w-full bg-transparent outline-none text-xs font-medium" style={{ color: c.textPrimary }} />
            </Row>
            <Row label="Location" theme={theme}>
              <input value={draft.installationLocation || ''} onChange={e => update('installationLocation', e.target.value)}
                className="w-full bg-transparent outline-none text-xs font-medium" style={{ color: c.textPrimary }} placeholder="City, State" />
            </Row>
            <Row label="Bid?" theme={theme}>
              <div className="flex justify-end"><ToggleSwitch checked={!!draft.isBid} onChange={e => update('isBid', e.target.checked)} theme={theme} /></div>
            </Row>
          </Section>

          {/* 4. STAKEHOLDERS */}
          <Section title="Stakeholders" theme={theme}>
            <Row label="Contact" theme={theme} noSep>
              <ContactSearchSelector value={draft.contact || ''} onChange={v => update('contact', v)} dealers={draft.dealers || []} theme={theme} />
            </Row>
            <Row label="Dealer(s)" theme={theme}>
              <div className="flex flex-wrap gap-1">
                {(draft.dealers || []).map(f => (
                  <button key={f} onClick={() => removeFrom('dealers', f)} className="px-2.5 h-6 rounded-full text-[0.6875rem] font-semibold flex items-center gap-1 transition-all"
                    style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}>{f}<span className="opacity-40 text-[0.625rem]">{'×'}</span></button>
                ))}
                <SuggestInputPill placeholder="Add dealer" suggestions={INITIAL_DEALERS} onAdd={v => addUnique('dealers', v)} theme={theme} />
              </div>
            </Row>
            <Row label="A&D Firm(s)" theme={theme}>
              <div className="flex flex-wrap gap-1">
                {(draft.designFirms || []).map(f => (
                  <button key={f} onClick={() => removeFrom('designFirms', f)} className="px-2.5 h-6 rounded-full text-[0.6875rem] font-semibold flex items-center gap-1 transition-all"
                    style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}>{f}<span className="opacity-40 text-[0.625rem]">{'×'}</span></button>
                ))}
                <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v => addUnique('designFirms', v)} theme={theme} />
              </div>
            </Row>
            <Row label="End User" theme={theme}>
              <input value={draft.endUser || draft.company || ''} onChange={e => update('endUser', e.target.value)}
                className="w-full bg-transparent outline-none text-xs font-medium" style={{ color: c.textPrimary }} placeholder="Company name" />
            </Row>
          </Section>

          {/* 5. COMPETITION */}
          <Section title="Competition" theme={theme} right={<ToggleSwitch checked={draft.competitionPresent !== false} onChange={e => update('competitionPresent', e.target.checked)} theme={theme} />}>
            {draft.competitionPresent !== false ? (
              <MultiPillSelect options={COMPETITORS.filter(x => x !== 'None')} value={draft.competitors || []} onToggle={toggleCompetitor} theme={theme} />
            ) : (
              <p className="text-[0.6875rem]" style={{ color: c.textSecondary, opacity: 0.6 }}>No competition noted</p>
            )}
          </Section>

          {/* 6. PRODUCTS */}
          <Section title="Products" theme={theme}>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {(draft.products || []).map(p => (
                <button key={p.series} onClick={() => removeProductSeries(p.series)} className="px-3 h-7 rounded-full text-[0.6875rem] font-semibold flex items-center gap-1.5 transition-all"
                  style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}>{p.series}<span className="opacity-40 text-[0.625rem]">{'×'}</span></button>
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
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-semibold transition-all"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: c.textPrimary }}><Upload className="w-3 h-3" /> Upload</button>
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
                  <div key={doc.id} className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors"
                    style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)', border: `1px solid ${divider}` }}>
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.accent }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.6875rem] font-semibold truncate" style={{ color: c.textPrimary }}>{doc.fileName}</div>
                      <div className="text-[0.625rem]" style={{ color: c.textSecondary, opacity: 0.6 }}>{doc.type} {'\u00b7'} {doc.size} {'\u00b7'} {doc.date}</div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-full" style={{ color: c.textSecondary }} title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => update('documents', (draft.documents || []).filter(d => d.id !== doc.id))} className="p-1 rounded-full" style={{ color: c.textSecondary }} title="Remove"><span className="text-[0.8125rem] leading-none">{'\u00d7'}</span></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2.5 py-3 px-3 rounded-xl transition-all hover:opacity-80"
                style={{ border: `1.5px dashed ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, color: c.textSecondary }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)' }}>
                  <Paperclip className="w-3 h-3" style={{ opacity: 0.45 }} />
                </div>
                <div className="text-left">
                  <span className="text-[0.6875rem] font-semibold block">Drop files or click to upload</span>
                  <span className="text-[0.5625rem]" style={{ opacity: 0.5 }}>PDF, DOC, images & more</span>
                </div>
              </button>
            )}
          </Section>

          {/* 9. NOTES */}
          <Section title="Notes" theme={theme}>
            <textarea value={draft.notes || ''} onChange={e => update('notes', e.target.value)} rows={2}
              className="w-full resize-none rounded-lg p-2.5 text-[0.6875rem] leading-relaxed outline-none"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)', border: `1px solid ${divider}`, color: c.textPrimary }}
              placeholder="Add project notes, context, or special instructions..." />
          </Section>

          {/* AUTOSAVE */}
          <div className="flex justify-center pt-0.5 pb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: JSI_COLORS.success, opacity: 0.45 }} />
              <span className="text-[0.625rem] font-medium tracking-wide" style={{ color: c.textSecondary, opacity: 0.3 }}>Changes saved automatically</span>
            </div>
          </div>

        </div>
      </div>

      {/* discount dropdown */}
      {discountOpen && (
        <div ref={discMenu} className="fixed rounded-2xl overflow-hidden"
          style={{ top: discPos.top, left: discPos.left, width: discPos.width, background: theme?.colors?.surface || (isDark ? '#2a2a2a' : '#fff'), border: `1px solid ${divider}`, boxShadow: DESIGN_TOKENS.shadows.modal, zIndex: DESIGN_TOKENS.zIndex.popover }}>
          <div className="max-h-[360px] overflow-y-auto scrollbar-hide py-1">
            {DISCOUNT_OPTIONS.map(opt => (
              <button key={opt} onClick={() => { update('discount', opt); setDiscountOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${opt === draft.discount ? 'font-bold' : 'font-medium'}`}
                style={{ color: c.textPrimary }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      <RequestQuoteModal show={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} theme={theme}
        members={members}
        currentUserId={currentUserId}
        onSubmit={(data) => {
          const record = persistQuoteRequest(data, {
            source: 'opportunity-detail',
            metadata: { opportunityId: draft.id || null },
          });
          const newQuote = createQuoteListItem(record, data.projectName || draft.project || draft.name || 'Untitled');
          update('quotes', [...(draft.quotes || []), newQuote]);
          setQuoteModalOpen(false);
        }}
        initialData={{ projectName: draft.project || draft.name || '', dealerName: (draft.dealers || [])[0] || '', adFirm: (draft.designFirms || [])[0] || '' }} />
    </div>
  );
};
