import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowUpRight, Building2, ChevronDown, Upload, FileText, Eye, Send, Paperclip, Users, Clock, CheckCircle, AlertCircle, Loader2, Share2, Download, Mail, MapPin, Package, Phone, Truck } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS, JSI_COLORS, sectionCardSurface, FIELD_LABEL_CLASSNAME, SECTION_TITLE_CLASSNAME } from '../../../../design-system/tokens.js';
import { formatCurrency } from '../../../../utils/format.js';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from '../../data.js';
import { JSI_SERIES } from '../../../products/data.js';
import { PrimaryButton } from '../../../../components/common/JSIButtons.jsx';
import { Modal } from '../../../../components/common/Modal.jsx';
import { ProbabilitySlider } from '../../../../components/forms/ProbabilitySlider.jsx';
import { RequestQuoteModal } from '../../../../components/common/RequestQuoteModal.jsx';
import { createQuoteListItem, persistQuoteRequest } from '../../../../utils/quoteRequests.js';
import { ToggleSwitch } from '../../../../components/forms/ToggleSwitch.jsx';
import { SuggestInputPill } from './SuggestInputPill.jsx';
import { ContactSearchSelector } from './ContactSearchSelector.jsx';
import { buildOpportunityProjectContacts, getOpportunityCustomerDisplayName, getSampleOrdersForOpportunity, resolveOpportunityCustomerLink } from '../../../../utils/projectLinks.js';

/* helpers */
const parseCurrency = (raw) => {
  if (raw == null) return 0;
  const n = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const SPIFF_502010_MIN_LIST = 10000;
const FIELD_BG_LIGHT = 'rgba(240,237,232,0.88)';
const FIELD_BG_DARK = 'rgba(255,255,255,0.065)';
const CHIP_BG_LIGHT = 'rgba(240,237,232,0.96)';
const CHIP_BG_DARK = 'rgba(255,255,255,0.08)';
const SECTION_RADIUS = '28px';
const CONTROL_RADIUS = '24px';
const FIELD_LABEL_CLASS = FIELD_LABEL_CLASSNAME;

const formatDiscountLabel = (value) => value || 'No discount selected';
const getInitials = (name) => String(name || '').split(' ').filter(Boolean).map((segment) => segment[0]).join('').slice(0, 2).toUpperCase() || '?';

/* ---- section primitives ---- */
const Section = ({ title, children, theme, right }) => {
  return (
    <div className="overflow-hidden" style={{ ...sectionCardSurface(theme), padding: '16px', borderRadius: SECTION_RADIUS }}>
      {title && (
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <span className={SECTION_TITLE_CLASSNAME} style={{ color: theme.colors.textPrimary }}>{title}</span>
          {right ? <div className="flex-shrink-0 pt-0.5">{right}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
};

const Row = ({ label, children, theme, noSep }) => {
  return (
    <div className={`flex flex-col gap-2.5 py-1.5 sm:flex-row sm:items-start sm:gap-4 ${noSep ? '' : 'mt-1.5'}`}>
      {label && <label className="text-[0.6875rem] font-semibold tracking-[0.01em] sm:w-[104px] sm:flex-shrink-0 sm:pt-2" style={{ color: theme.colors.textSecondary, opacity: 0.88 }}>{label}</label>}
      <div className="flex-1 min-w-0 w-full">{children}</div>
    </div>
  );
};

const PillSelect = ({ options, value, onChange, theme }) => {
  const isDark = isDarkTheme(theme);
  const chipBg = isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT;
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const active = opt === value;
        return (
          <button key={opt} onClick={() => onChange(opt)} className="px-3 py-1.5 rounded-full text-[0.6875rem] font-semibold transition-all active:scale-[0.97]"
            style={{ backgroundColor: active ? theme.colors.accent : chipBg, color: active ? theme.colors.accentText : theme.colors.textSecondary, boxShadow: active ? (isDark ? '0 10px 20px rgba(0,0,0,0.16)' : '0 10px 18px rgba(53,53,53,0.08)') : 'none' }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
};

const MultiPillSelect = ({ options, value = [], onToggle, theme }) => {
  const isDark = isDarkTheme(theme);
  const chipBg = isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT;
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const active = value.includes(opt);
        return (
          <button key={opt} onClick={() => onToggle(opt)} className="px-3 py-1.5 rounded-full text-[0.6875rem] font-semibold transition-all active:scale-[0.97]"
            style={{ backgroundColor: active ? theme.colors.accent : chipBg, color: active ? theme.colors.accentText : theme.colors.textSecondary, boxShadow: active ? (isDark ? '0 10px 20px rgba(0,0,0,0.16)' : '0 10px 18px rgba(53,53,53,0.08)') : 'none' }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
};

const ContactSummaryCard = ({ contact, theme }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const avatarBg = contact.kind === 'rep'
    ? `${JSI_COLORS.info}18`
    : contact.kind === 'primary'
      ? `${c.accent}18`
      : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.08)');
  const avatarColor = contact.kind === 'customer' ? c.textPrimary : c.accent;
  const badgeBg = contact.kind === 'rep'
    ? `${JSI_COLORS.info}16`
    : contact.kind === 'primary'
      ? `${c.accent}14`
      : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.07)');
  const badgeColor = contact.kind === 'rep'
    ? JSI_COLORS.info
    : contact.kind === 'primary'
      ? c.accent
      : c.textSecondary;

  return (
    <div className="flex items-start gap-3 px-3.5 py-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.6875rem] font-bold flex-shrink-0" style={{ backgroundColor: avatarBg, color: avatarColor }}>
        {getInitials(contact.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[0.75rem] font-semibold truncate" style={{ color: c.textPrimary }}>{contact.name}</span>
          <span className="text-[0.5625rem] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: badgeBg, color: badgeColor }}>
            {contact.label}
          </span>
        </div>
        {contact.role ? <p className="mt-1 text-[0.6875rem]" style={{ color: c.textSecondary }}>{contact.role}</p> : null}
      </div>
      {(contact.email || contact.phone) ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {contact.email ? (
            <a href={`mailto:${contact.email}`} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c.accent}12`, color: c.accent }}>
              <Mail className="w-3.5 h-3.5" />
            </a>
          ) : null}
          {contact.phone ? (
            <a href={`tel:${contact.phone}`} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c.accent}12`, color: c.accent }}>
              <Phone className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>
      ) : null}
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

const SAMPLE_STATUS_META = {
  processing: { label: 'Processing', color: JSI_COLORS.warning, bg: `${JSI_COLORS.warning}1A`, icon: Clock },
  'in-transit': { label: 'In Transit', color: JSI_COLORS.info, bg: `${JSI_COLORS.info}1A`, icon: Truck },
  delivered: { label: 'Delivered', color: JSI_COLORS.success, bg: `${JSI_COLORS.success}1A`, icon: CheckCircle },
};

const formatQuoteAssignees = (quote) => {
  const names = Array.isArray(quote?.assigneeNames) ? quote.assigneeNames.filter(Boolean) : [];
  if (!names.length) return 'Awaiting assignment';
  if (names.length === 1) return names[0];
  return `${names[0]} + ${names.length - 1} more`;
};

const formatQuoteMoment = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const QuoteTracker = ({ quotes = [], theme, onRequestQuote }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const divider = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(227,224,216,0.92)';

  const completed = quotes.filter(q => q.status === 'complete' || !q.status);
  const pending = quotes.filter(q => q.status && q.status !== 'complete');
  const queueAhead = Math.max(0, pending.length + 2); // 2 = simulated team queue
  const estDays = queueAhead <= 1 ? 1 : Math.min(queueAhead, 5);

  return (
    <div className="space-y-2.5">
      {/* ── Queue status bar ── */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.10)' : 'rgba(91,123,140,0.06)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.18)' : 'rgba(91,123,140,0.12)' }}>
            <Users className="w-3 h-3" style={{ color: JSI_COLORS.info }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[0.75rem] font-semibold block leading-tight tracking-[-0.01em]" style={{ color: c.textPrimary }}>{queueAhead} quote{queueAhead !== 1 ? 's' : ''} in queue</span>
            <span className="text-[0.625rem] leading-tight" style={{ color: c.textSecondary }}>Est. {estDays} business day{estDays !== 1 ? 's' : ''} · {pending.length} active</span>
          </div>
        </div>
      )}

      {/* ── Pending quotes ── */}
      {pending.map((q, qi) => {
        const meta = STATUS_META[q.status] || STATUS_META.requested;
        const StIcon = meta.icon;
        const requestedLabel = formatQuoteMoment(q.requestedAt);
        return (
          <div key={q.id || qi} className="flex items-start gap-3 px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : FIELD_BG_LIGHT }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}>
              <StIcon className="w-3 h-3" style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[0.75rem] font-semibold tracking-[-0.01em] truncate block" style={{ color: c.textPrimary }}>{q.fileName || `Quote #${qi + 1}`}</span>
                <span className="text-[0.5625rem] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full whitespace-nowrap" style={{ color: meta.color, backgroundColor: meta.bg }}>{meta.label}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[0.625rem]" style={{ color: c.textSecondary }}>
                <span className="font-semibold" style={{ color: c.textPrimary }}>Assigned to {formatQuoteAssignees(q)}</span>
                {requestedLabel ? <span style={{ opacity: 0.55 }}>Requested {requestedLabel}</span> : null}
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Completed quotes — viewable / shareable ── */}
      {completed.map((q, qi) => {
        const completedLabel = formatQuoteMoment(q.completedAt || q.requestedAt);
        return (
        <div key={q.id || `c${qi}`} className="rounded-[24px] overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.06)' : 'rgba(74,124,89,0.05)' }}>
          <div className="flex items-start gap-3 px-3.5 py-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(74,124,89,0.12)' }}>
              <CheckCircle className="w-3 h-3" style={{ color: JSI_COLORS.success }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[0.75rem] font-semibold tracking-[-0.01em] truncate block" style={{ color: c.textPrimary }}>{q.fileName || `Quote #${qi + 1}`}</span>
                <span className="text-[0.5625rem] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full whitespace-nowrap" style={{ color: JSI_COLORS.success, backgroundColor: 'rgba(74,124,89,0.12)' }}>Complete</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[0.625rem]" style={{ color: c.textSecondary }}>
                <span className="font-semibold" style={{ color: c.textPrimary }}>Assigned to {formatQuoteAssignees(q)}</span>
                {completedLabel ? <span style={{ opacity: 0.55 }}>Completed {completedLabel}</span> : null}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 px-2.5 pb-2.5 pt-0.5">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[0.625rem] font-semibold rounded-full transition-colors hover:bg-black/[0.03] active:scale-[0.98]" style={{ color: c.textPrimary, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)' }}>
              <Eye className="w-3 h-3" /> View
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[0.625rem] font-semibold rounded-full transition-colors hover:bg-black/[0.03] active:scale-[0.98]" style={{ color: c.textPrimary, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)' }}>
              <Share2 className="w-3 h-3" /> Share
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[0.625rem] font-semibold rounded-full transition-colors hover:bg-black/[0.03] active:scale-[0.98]" style={{ color: c.textPrimary, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)' }}>
              <Download className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      )})}

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
export const OpportunityDetail = ({ opp, theme, onUpdate, members, currentUserId, sampleOrders = [], opportunities = [], onNavigate, customers = [], onOpenCustomer }) => {
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
  const [pendingDiscount, setPendingDiscount] = useState(null);
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

  const requestDiscountChange = useCallback((nextDiscount) => {
    setDiscountOpen(false);
    if (!nextDiscount || nextDiscount === draft.discount) {
      setPendingDiscount(null);
      return;
    }
    setPendingDiscount(nextDiscount);
  }, [draft.discount]);

  const closeDiscountConfirm = useCallback(() => {
    setPendingDiscount(null);
  }, []);

  const confirmDiscountChange = useCallback(() => {
    if (!pendingDiscount) return;
    update('discount', pendingDiscount);
    setPendingDiscount(null);
  }, [pendingDiscount, update]);

  /* tag helpers */
  const toggleCompetitor = (comp) => { const list = draft.competitors || []; update('competitors', list.includes(comp) ? list.filter(x => x !== comp) : [...list, comp]); };
  const addProductSeries = (series) => { if (!series) return; const list = draft.products || []; if (!list.some(p => p.series === series)) update('products', [...list, { series }]); };
  const removeProductSeries = (series) => update('products', (draft.products || []).filter(p => p.series !== series));
  const removeFrom = (key, val) => update(key, (draft[key] || []).filter(x => x !== val));
  const addUnique = (key, val) => { if (!val) return; const list = draft[key] || []; if (!list.includes(val)) update(key, [...list, val]); };

  const fileInputRef = useRef(null);

  /* computed */
  const rawNumeric = parseCurrency(draft.value);
  const discountMatch = (draft.discount || '').match(/\(([\d.]+)%\)/);
  const discountPct = discountMatch ? parseFloat(discountMatch[1]) / 100 : 0;
  const discountCode = String(draft.discount || '').split(' ')[0];
  const isDiscount502010 = discountCode === '50/20/10';
  const netValue = discountPct > 0 ? Math.round(rawNumeric * (1 - discountPct)) : rawNumeric;
  const rewardsOn = (draft.salesReward !== false) || (draft.designerReward !== false);
  const showSpiffWarning = isDiscount502010 && rewardsOn && rawNumeric > 0 && rawNumeric < SPIFF_502010_MIN_LIST;
  const currentStageIndex = Math.max(STAGES.indexOf(draft.stage), 0);

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const enrichedQuotes = useMemo(() => (draft.quotes || []).map((q, i) => ({ ...q, status: q.status || (i === 0 ? 'complete' : 'in-progress') })), [draft.quotes]);
  const relatedSampleOrders = useMemo(
    () => getSampleOrdersForOpportunity(draft, sampleOrders, opportunities)
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [draft, sampleOrders, opportunities],
  );
  const divider = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const { customer: linkedCustomer, source: customerLinkSource } = useMemo(
    () => resolveOpportunityCustomerLink(draft, customers),
    [customers, draft],
  );
  const displayCustomerName = useMemo(
    () => getOpportunityCustomerDisplayName(draft, linkedCustomer),
    [draft, linkedCustomer],
  );
  const projectContacts = useMemo(
    () => buildOpportunityProjectContacts(draft, linkedCustomer),
    [draft, linkedCustomer],
  );
  const customerLocationLabel = linkedCustomer?.location
    ? [linkedCustomer.location.city, linkedCustomer.location.state].filter(Boolean).join(', ')
    : '';
  const customerLinkStatus = draft.customerId
    ? 'Linked customer profile'
    : customerLinkSource === 'inferred'
      ? 'Matched from project account'
      : 'No customer profile linked yet';
  const openLinkedCustomer = useCallback(() => {
    if (linkedCustomer && typeof onOpenCustomer === 'function') onOpenCustomer(linkedCustomer);
  }, [linkedCustomer, onOpenCustomer]);

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ background: c.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-6 max-w-content mx-auto w-full space-y-3.5">

          {/* HERO */}
          <div className="pb-1 space-y-1.5">
            <input value={draft.name || ''} onChange={e => update('name', e.target.value)}
              className="w-full bg-transparent outline-none text-[1.85rem] sm:text-[2rem] font-semibold tracking-[-0.02em] leading-[1.02]" style={{ color: c.textPrimary }} placeholder="Project name" />
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent, opacity: 0.5 }} />
              <input value={draft.company || ''} onChange={e => update('company', e.target.value)}
                className="bg-transparent outline-none text-[0.75rem] font-medium flex-1 min-w-[180px]" style={{ color: c.textSecondary }} placeholder="Customer account / End User" />
              {linkedCustomer ? (
                <button type="button" onClick={openLinkedCustomer} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.625rem] font-semibold transition-all active:scale-[0.98]"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)', color: c.textPrimary }}>
                  <Building2 className="w-3 h-3" style={{ color: c.accent }} />
                  {customerLinkSource === 'explicit' ? 'Customer profile' : 'Matched customer'}
                  <ArrowUpRight className="w-3 h-3" style={{ color: c.textSecondary, opacity: 0.6 }} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)] xl:items-start">
            <div className="space-y-3.5 min-w-0">
              <div className="grid gap-3.5 lg:grid-cols-2">
                <div className="h-full">
                  <Section title="Financials" theme={theme}>
            <div className="space-y-2.5">
              <div className="px-3.5 py-3.5" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>List Value</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-bold tracking-tight leading-none" style={{ color: c.textSecondary, opacity: 0.25 }}>$</span>
                  <input inputMode="numeric"
                    value={(() => { const raw = ('' + (draft.value || '')).replace(/[^0-9]/g, ''); return raw ? parseInt(raw, 10).toLocaleString() : ''; })()}
                    onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); update('value', val ? ('$' + parseInt(val, 10).toLocaleString()) : ''); }}
                    className="bg-transparent outline-none text-[1.5rem] font-bold tracking-tight w-full leading-none" style={{ color: c.textPrimary }} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="px-3.5 py-3.5 text-left transition-all active:scale-[0.99]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }} onClick={() => discountOpen ? setDiscountOpen(false) : openDiscount()} ref={discBtn}>
                  <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>Discount</span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[0.8125rem] font-bold tracking-tight truncate" style={{ color: c.textPrimary }}>{draft.discount || '\u2014'}</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.4 }} />
                  </div>
                </button>
                <div className="px-3.5 py-3.5" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                  <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>Net Value</span>
                  <span className="mt-1 block text-[1rem] font-bold tracking-tight leading-none" style={{ color: c.textPrimary }}>{netValue > 0 && discountPct > 0 ? formatCurrency(netValue) : '\u2014'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="px-3.5 py-3 flex items-center justify-between" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                  <span className="text-[0.6875rem] font-semibold" style={{ color: c.textPrimary }}>Sales Reward</span>
                  <ToggleSwitch checked={draft.salesReward !== false} onChange={e => update('salesReward', e.target.checked)} theme={theme} />
                </div>
                <div className="px-3.5 py-3 flex items-center justify-between" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                  <span className="text-[0.6875rem] font-semibold" style={{ color: c.textPrimary }}>Designer Reward</span>
                  <ToggleSwitch checked={draft.designerReward !== false} onChange={e => update('designerReward', e.target.checked)} theme={theme} />
                </div>
              </div>

            </div>
            {showSpiffWarning && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 mt-2" style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.08)' : 'rgba(196,149,106,0.06)', borderRadius: '22px' }}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.warning }} />
                <span className="text-[0.6875rem] font-medium" style={{ color: theme.colors.warning }}>No spiff eligible: 50/20/10 with list value under $10K.</span>
              </div>
            )}
                  </Section>
                </div>

                <div className="h-full">
                  <Section title="Project Progress" theme={theme}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>Current Stage</span>
                <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]" style={{ color: c.textPrimary }}>{draft.stage}</span>
              </div>
              <span className="text-xs font-bold tabular-nums" style={{ color: c.textPrimary }}>{draft.winProbability || 0}%</span>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
              <div className="inline-flex items-start min-w-max">
                {STAGES.map((stage) => {
                  const stageIndex = STAGES.indexOf(stage);
                  const active = draft.stage === stage;
                  const complete = stageIndex < currentStageIndex;
                  const connectorComplete = stageIndex < currentStageIndex;
                  const circleBg = active
                    ? c.accent
                    : complete
                      ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.12)')
                      : 'transparent';
                  const circleBorder = active
                    ? c.accent
                    : complete
                      ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.12)')
                      : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(227,224,216,0.98)');
                  const labelColor = active || complete ? c.textPrimary : c.textSecondary;
                  const stepToken = stage === 'Won' ? 'W' : stage === 'Lost' ? 'L' : stageIndex + 1;
                  return (
                    <React.Fragment key={stage}>
                      <button
                        type="button"
                        onClick={() => update('stage', stage)}
                        className="flex flex-col items-center gap-1.5 w-[72px] rounded-[22px] px-2 py-2 text-center transition-all active:scale-[0.98]"
                        style={{
                          backgroundColor: active ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(227,224,216,0.66)') : 'transparent',
                        }}
                      >
                        <span
                          className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[0.5625rem] font-bold flex-shrink-0"
                          style={{
                            backgroundColor: circleBg,
                            border: `1px solid ${circleBorder}`,
                            color: active ? c.accentText : (complete ? c.textPrimary : c.textSecondary),
                          }}
                        >
                          {stepToken}
                        </span>
                        <span
                          className="text-[0.625rem] font-semibold leading-[1.05] whitespace-normal break-words"
                          style={{ color: labelColor, opacity: active ? 1 : (complete ? 0.82 : 0.68) }}
                        >
                          {stage}
                        </span>
                      </button>
                      {stageIndex < STAGES.length - 1 && (
                        <div
                          aria-hidden="true"
                          className="w-4 h-px mx-0.5 mt-[11px] rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: connectorComplete ? c.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(227,224,216,1)'),
                            opacity: connectorComplete ? 0.65 : 1,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <div className="px-3.5 py-3.5 mt-2" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Win Probability</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: c.textPrimary }}>{draft.winProbability || 0}%</span>
              </div>
              <ProbabilitySlider value={draft.winProbability || 0} onChange={v => update('winProbability', v)} theme={theme} showLabel={false} />
            </div>
                  </Section>
                </div>
              </div>

              <Section title="Project Details" theme={theme}>
                <Row label="Vertical" theme={theme} noSep>
                  <PillSelect options={VERTICALS.filter(v => v !== 'Other (Please specify)')} value={draft.vertical} onChange={v => update('vertical', v)} theme={theme} />
                </Row>
                <Row label="PO Timeframe" theme={theme}>
                  <PillSelect options={PO_TIMEFRAMES} value={draft.poTimeframe} onChange={v => update('poTimeframe', v)} theme={theme} />
                </Row>
                <Row label="Install Date" theme={theme}>
                  <input type="date" value={draft.expectedInstallDate || ''} onChange={e => update('expectedInstallDate', e.target.value)}
                    className="w-full px-3.5 py-3 bg-transparent outline-none text-xs font-medium" style={{ color: c.textPrimary, backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }} />
                </Row>
                <Row label="Location" theme={theme}>
                  <input value={draft.installationLocation || ''} onChange={e => update('installationLocation', e.target.value)}
                    className="w-full px-3.5 py-3 bg-transparent outline-none text-xs font-medium" style={{ color: c.textPrimary, backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }} placeholder="City, State" />
                </Row>
                <Row label="Bid?" theme={theme}>
                  <div className="w-full px-3.5 py-3 flex items-center justify-between" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                    <span className="text-[0.6875rem] font-medium" style={{ color: c.textPrimary }}>Include in bid process</span>
                    <ToggleSwitch checked={!!draft.isBid} onChange={e => update('isBid', e.target.checked)} theme={theme} />
                  </div>
                </Row>
              </Section>

              <Section title="Stakeholders" theme={theme}>
                <Row label="Contact" theme={theme} noSep>
                  <ContactSearchSelector value={draft.contact || ''} onChange={v => update('contact', v)} dealers={draft.dealers || []} theme={theme} />
                </Row>
                <Row label="Dealer(s)" theme={theme}>
                  <div className="flex flex-wrap gap-1.5">
                    {(draft.dealers || []).map(f => (
                      <button key={f} onClick={() => removeFrom('dealers', f)} className="px-3 py-1.5 rounded-full text-[0.6875rem] font-semibold flex items-center gap-1.5 transition-all"
                        style={{ background: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: c.textPrimary }}>{f}<span className="opacity-40 text-[0.625rem]">{'×'}</span></button>
                    ))}
                    <SuggestInputPill placeholder="Add dealer" suggestions={INITIAL_DEALERS} onAdd={v => addUnique('dealers', v)} theme={theme} />
                  </div>
                </Row>
                <Row label="A&D Firm(s)" theme={theme}>
                  <div className="flex flex-wrap gap-1.5">
                    {(draft.designFirms || []).map(f => (
                      <button key={f} onClick={() => removeFrom('designFirms', f)} className="px-3 py-1.5 rounded-full text-[0.6875rem] font-semibold flex items-center gap-1.5 transition-all"
                        style={{ background: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: c.textPrimary }}>{f}<span className="opacity-40 text-[0.625rem]">{'×'}</span></button>
                    ))}
                    <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v => addUnique('designFirms', v)} theme={theme} />
                  </div>
                </Row>
                <Row label="Customer Account" theme={theme}>
                  <input value={draft.endUser || draft.company || ''} onChange={e => update('endUser', e.target.value)}
                    className="w-full px-3.5 py-3 bg-transparent outline-none text-xs font-medium" style={{ color: c.textPrimary, backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }} placeholder="Customer account name" />
                </Row>
              </Section>

              <div className="grid gap-3.5 lg:grid-cols-2">
                <div className="h-full">
                  <Section title="Competition" theme={theme} right={<ToggleSwitch checked={draft.competitionPresent !== false} onChange={e => update('competitionPresent', e.target.checked)} theme={theme} />}>
                    {draft.competitionPresent !== false ? (
                      <MultiPillSelect options={COMPETITORS.filter(x => x !== 'None')} value={draft.competitors || []} onToggle={toggleCompetitor} theme={theme} />
                    ) : (
                      <p className="text-[0.6875rem]" style={{ color: c.textSecondary, opacity: 0.6 }}>No competition noted</p>
                    )}
                  </Section>
                </div>

                <div className="h-full">
                  <Section title="Products" theme={theme}>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {(draft.products || []).map(p => (
                        <button key={p.series} onClick={() => removeProductSeries(p.series)} className="px-3 py-1.5 rounded-full text-[0.6875rem] font-semibold flex items-center gap-1.5 transition-all"
                          style={{ background: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: c.textPrimary }}>{p.series}<span className="opacity-40 text-[0.625rem]">{'×'}</span></button>
                      ))}
                    </div>
                    <SuggestInputPill placeholder="Add series..." suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
                  </Section>
                </div>
              </div>

              <Section title="Notes" theme={theme}>
                <textarea value={draft.notes || ''} onChange={e => update('notes', e.target.value)} rows={4}
                  className="w-full resize-none p-3.5 text-[0.75rem] leading-relaxed outline-none"
                  style={{ background: isDark ? 'rgba(255,255,255,0.06)' : FIELD_BG_LIGHT, color: c.textPrimary, borderRadius: CONTROL_RADIUS }}
                  placeholder="Add project notes, context, or special instructions..." />
              </Section>
            </div>

            <div className="space-y-3.5 min-w-0">
              <Section title="Customer Connection" theme={theme}>
                <div className="space-y-2.5">
                  <div className="px-3.5 py-3.5" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.accent}15`, color: c.accent }}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Project account</span>
                          <p className="mt-1 text-[0.9375rem] font-semibold leading-tight" style={{ color: c.textPrimary }}>{displayCustomerName}</p>
                          <p className="mt-1 text-[0.6875rem] leading-tight" style={{ color: c.textSecondary }}>{customerLocationLabel || customerLinkStatus}</p>
                        </div>
                      </div>
                      {linkedCustomer ? (
                        <button type="button" onClick={openLinkedCustomer} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.625rem] font-semibold transition-all active:scale-[0.98]"
                          style={{ backgroundColor: `${c.accent}14`, color: c.accent }}>
                          Open
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="px-3.5 py-3.5" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Linked customer profile</span>
                      {draft.customerId ? (
                        <button type="button" onClick={() => update('customerId', null)} className="text-[0.625rem] font-semibold" style={{ color: c.accent }}>
                          Clear link
                        </button>
                      ) : null}
                    </div>
                    <select value={draft.customerId ? String(draft.customerId) : ''} onChange={(event) => update('customerId', event.target.value || null)}
                      className="w-full bg-transparent outline-none text-[0.75rem] font-medium" style={{ color: c.textPrimary }}>
                      <option value="">Select customer profile...</option>
                      {(customers || []).map((customer) => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                    </select>
                    <p className="mt-2 text-[0.625rem] leading-tight" style={{ color: c.textSecondary, opacity: 0.78 }}>
                      {draft.customerId
                        ? 'This project is explicitly pinned to a customer profile.'
                        : customerLinkSource === 'inferred'
                          ? 'A customer profile is already matched from the project account. Select it here to lock the relationship.'
                          : 'Link a customer profile to bring in customer contacts, rep context, and quick navigation.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3.5 py-3" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                      <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Customer contacts</span>
                      <p className="mt-1 text-[0.9375rem] font-semibold" style={{ color: c.textPrimary }}>{projectContacts.filter((contact) => contact.kind !== 'rep').length}</p>
                    </div>
                    <div className="px-3.5 py-3" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                      <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Dealer teams</span>
                      <p className="mt-1 text-[0.9375rem] font-semibold" style={{ color: c.textPrimary }}>{(draft.dealers || []).length}</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Project Contacts" theme={theme} right={<span className="text-[0.625rem] font-semibold" style={{ color: c.textSecondary }}>{projectContacts.length} total</span>}>
                {projectContacts.length > 0 ? (
                  <div className="space-y-2">
                    {projectContacts.map((contact) => (
                      <ContactSummaryCard key={`${contact.kind}-${contact.id}`} contact={contact} theme={theme} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-3.5 py-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                    <Users className="w-4 h-4 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.45 }} />
                    <span className="text-[0.6875rem]" style={{ color: c.textSecondary }}>
                      Add a primary contact or link a customer profile to surface project contacts here.
                    </span>
                  </div>
                )}
                {linkedCustomer ? (
                  <div className="mt-2 flex items-center gap-2 text-[0.625rem]" style={{ color: c.textSecondary }}>
                    <MapPin className="w-3 h-3" style={{ opacity: 0.55 }} />
                    <span>{customerLocationLabel || linkedCustomer.name}</span>
                  </div>
                ) : null}
              </Section>

              <Section title="Sample Activity" theme={theme}>
            {relatedSampleOrders.length > 0 ? (
              <div className="space-y-2">
                {relatedSampleOrders.map((order) => {
                  const meta = SAMPLE_STATUS_META[order.status] || SAMPLE_STATUS_META.processing;
                  const StatusIcon = meta.icon;
                  const totalItems = (order.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);

                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => onNavigate?.('samples/orders', { orderId: order.id, tab: order.status === 'delivered' ? 'past' : 'current' })}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-left transition-all active:scale-[0.98]"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}>
                        <StatusIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[0.75rem] font-bold truncate" style={{ color: c.textPrimary }}>{order.id}</span>
                          <span className="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="mt-1 text-[0.6875rem] leading-tight" style={{ color: c.textSecondary }}>
                          {(order.items || [])[0]?.name || 'Sample order'}{totalItems > 1 ? ` + ${totalItems - 1} more` : ''}
                        </div>
                        <div className="mt-1 text-[0.625rem]" style={{ color: c.textSecondary, opacity: 0.72 }}>
                          {order.date || 'No ship date'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                <Package className="w-4 h-4 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.45 }} />
                <span className="text-[0.6875rem]" style={{ color: c.textSecondary }}>
                  No sample orders linked to this project yet.
                </span>
              </div>
            )}
              </Section>

              <Section title="Quotes" theme={theme}>
            <QuoteTracker quotes={enrichedQuotes} theme={theme} onRequestQuote={() => setQuoteModalOpen(true)} />
              </Section>

              <Section title="Documents" theme={theme} right={
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.625rem] font-semibold transition-all"
              style={{ background: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: c.textPrimary }}><Upload className="w-3 h-3" /> Upload</button>
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
                  <div key={doc.id} className="group flex items-center gap-2.5 px-3.5 py-3 transition-colors"
                    style={{ background: isDark ? 'rgba(255,255,255,0.08)' : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.accent }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.6875rem] font-semibold truncate" style={{ color: c.textPrimary }}>{doc.fileName}</div>
                      <div className="text-[0.625rem]" style={{ color: c.textSecondary, opacity: 0.6 }}>{doc.type} {'\u00b7'} {doc.size} {'\u00b7'} {doc.date}</div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-full" style={{ color: c.textSecondary }} title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => update('documents', (draft.documents || []).filter(d => d.id !== doc.id))} className="p-1 rounded-full" style={{ color: c.textSecondary }} title="Remove"><span className="text-[0.8125rem] leading-none">{'\u00d7'}</span></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2.5 py-3 px-3.5 transition-all hover:opacity-80"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : FIELD_BG_LIGHT, color: c.textSecondary, borderRadius: CONTROL_RADIUS }}>
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
            </div>
          </div>

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
        <div ref={discMenu} className="fixed overflow-hidden"
          style={{ top: discPos.top, left: discPos.left, width: discPos.width, background: theme?.colors?.surface || (isDark ? '#2a2a2a' : '#fff'), boxShadow: DESIGN_TOKENS.shadows.modal, zIndex: DESIGN_TOKENS.zIndex.popover, borderRadius: '26px' }}>
          <div className="max-h-[360px] overflow-y-auto scrollbar-hide py-1">
            {DISCOUNT_OPTIONS.map(opt => (
              <button key={opt} onClick={() => requestDiscountChange(opt)}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${opt === draft.discount ? 'font-bold' : 'font-medium'}`}
                style={{ color: c.textPrimary }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      <Modal
        show={!!pendingDiscount}
        onClose={closeDiscountConfirm}
        title="Authorize Discount Change"
        theme={theme}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-[0.8125rem] leading-relaxed" style={{ color: c.textSecondary }}>
            This will change the discount on this project. Authorize the update to apply the new pricing basis.
          </p>

          <div className="p-3.5 space-y-2" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
            <div className="flex items-center justify-between gap-3">
              <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Current</span>
              <span className="text-[0.75rem] font-semibold text-right" style={{ color: c.textPrimary }}>{formatDiscountLabel(draft.discount)}</span>
            </div>
            <div className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(227,224,216,0.95)' }} />
            <div className="flex items-center justify-between gap-3">
              <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>New</span>
              <span className="text-[0.75rem] font-semibold text-right" style={{ color: c.textPrimary }}>{formatDiscountLabel(pendingDiscount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeDiscountConfirm}
              className="px-4 py-2 rounded-full text-[0.6875rem] font-semibold transition-all active:scale-[0.98]"
              style={{ backgroundColor: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: c.textPrimary }}
            >
              Cancel
            </button>
            <PrimaryButton
              type="button"
              onClick={confirmDiscountChange}
              theme={theme}
              className="px-4 py-2 text-[0.6875rem] font-semibold"
            >
              Authorize
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <RequestQuoteModal show={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} theme={theme}
        members={members}
        currentUserId={currentUserId}
        onSubmit={(data) => {
          const selectedTeamMemberNames = (data.selectedTeamMembers || [])
            .map((memberId) => members?.find?.((member) => String(member.id) === String(memberId)))
            .filter(Boolean)
            .map((member) => `${member.firstName} ${member.lastName}`.trim());
          const quoteRequestData = {
            ...data,
            selectedTeamMemberNames,
          };
          const record = persistQuoteRequest(quoteRequestData, {
            source: 'opportunity-detail',
            metadata: { opportunityId: draft.id || null },
          });
          const newQuote = createQuoteListItem(record, data.projectName || draft.name || 'Untitled');
          update('quotes', [...(draft.quotes || []), newQuote]);
          setQuoteModalOpen(false);
        }}
        initialData={{ projectName: draft.name || '', dealerName: (draft.dealers || [])[0] || '', adFirm: (draft.designFirms || [])[0] || '' }} />
    </div>
  );
};
