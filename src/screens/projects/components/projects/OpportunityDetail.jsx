import React, { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, Upload, FileText, Eye, Send, Paperclip, Users, Clock, CheckCircle, AlertCircle, Loader2, Pencil, Share2, Download, Mail, MapPin, Package, Phone, Truck, ShoppingBag, X, Trash2, Lock, Plus } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS, JSI_COLORS, FIELD_LABEL_CLASSNAME, fieldTileSurface } from '../../../../design-system/tokens.js';
import { formatCurrency, formatRelativeTime } from '../../../../utils/format.js';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from '../../data.js';
import { CONTRACTS_DATA } from '../../../resources/contracts/data.js';
import { buildSpecifierOptions, getDefaultSpecifierOption } from '../../NewLeadScreenComponents.jsx';
import { getSeriesSpecPrompts } from '../../seriesSpecOptions.js';
import { DEALER_CONTACTS } from './utils.js';
import { ORDER_DATA, STATUS_COLORS } from '../../../orders/data.js';
import { JSI_SERIES } from '../../../products/data.js';
import { LEAD_TIMES_DATA, QUICKSHIP_SERIES } from '../../../resources/lead-times/data.js';
import { JSIActionButton, JSIActionButtonGroup, PrimaryButton } from '../../../../components/common/JSIButtons.jsx';
import { Modal } from '../../../../components/common/Modal.jsx';
import { ProbabilitySlider } from '../../../../components/forms/ProbabilitySlider.jsx';
import { RequestQuoteModal } from '../../../../components/common/RequestQuoteModal.jsx';
import { createQuoteListItem, persistQuoteRequest } from '../../../../utils/quoteRequests.js';
import { ToggleSwitch } from '../../../../components/forms/ToggleSwitch.jsx';
import { SuggestInputPill } from './SuggestInputPill.jsx';
import { buildOpportunityProjectContacts, getSampleOrdersForOpportunity, resolveOpportunityCustomerLink } from '../../../../utils/projectLinks.js';

/* helpers */
const parseCurrency = (raw) => {
  if (raw == null) return 0;
  const n = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const formatListPriceInput = (raw) => {
  const digits = String(raw || '').replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10).toLocaleString() : '';
};
const SPIFF_502010_MIN_LIST = 10000;
const REWARD_AUTO_OFF_NET_LIMIT = 150000;
const REWARD_AUTO_OFF_DISCOUNT_MIN = 0.64;

/* Shared surface values — one cool-grey tile (#F2F4F6 light) and pill radii everywhere. */
const DETAIL_RADIUS_CARD = '28px';
const DETAIL_RADIUS_INSET = '24px';
const DETAIL_RADIUS_MENU = '24px';
const DETAIL_RADIUS_HUB = '20px';
const DETAIL_RADIUS_MULTILINE = '16px';
const detailTileBg = (theme) => fieldTileSurface(theme).backgroundColor;
const FIELD_LABEL_CLASS = FIELD_LABEL_CLASSNAME;
const DETAIL_SECTION_TITLE_CLASS = 'text-[0.875rem] font-semibold tracking-[-0.01em] leading-none';
const DETAIL_SECTION_SUBTITLE_CLASS = 'mt-1 text-[0.6875rem] leading-snug';
const TEXT_INPUT_CLASS = 'w-full min-h-[44px] px-3 bg-transparent outline-none text-[0.875rem] font-medium focus-ring';

const dividerColor = (isDark) => (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(53,53,53,0.07)');

const fieldSurface = (theme) => fieldTileSurface(theme);

const multilineSurface = (theme) => ({
  backgroundColor: detailTileBg(theme),
  borderRadius: DETAIL_RADIUS_MULTILINE,
});

const compoundFieldSurface = (theme) => ({
  backgroundColor: detailTileBg(theme),
  borderRadius: DETAIL_RADIUS_INSET,
});

const insetBg = (theme) => detailTileBg(theme);

const getSeriesLeadLabel = (series) => {
  if (QUICKSHIP_SERIES.includes(series)) return 'QS';
  const entries = LEAD_TIMES_DATA.filter(d => d.series === series);
  if (!entries.length) return null;
  const min = Math.min(...entries.map(d => d.weeks));
  return `${min} wk`;
};

const formatPercentLabel = (value) => `${Number(value).toFixed(1).replace(/\.0$/, '')}%`;
const formatDiscountLabel = (value) => {
  if (!value) return 'No discount selected';
  const code = String(value).split(' ')[0];
  const percentMatch = String(value).match(/\(([^)]+)%\)/);
  if (!percentMatch) return code;
  return `${code} • ${formatPercentLabel(Number(percentMatch[1]))}`;
};
const getInitials = (name) => String(name || '').split(' ').filter(Boolean).map((segment) => segment[0]).join('').slice(0, 2).toUpperCase() || '?';
const parseProjectDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const rawValue = String(value);
  const dateOnlyMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const formatSampleOrderTimestamp = (value) => {
  if (!value) return 'Date unavailable';
  const date = parseProjectDateValue(value);
  if (!date) return value;
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};
const formatSampleOrderDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = parseProjectDateValue(value);
  if (!date) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SPECIFIER_TYPE_LABELS = { endUser: 'End user', dealer: 'Dealer', designFirm: 'A&D' };
const CONTRACT_OPTIONS = [
  { label: 'None', value: 'none' },
  ...Object.keys(CONTRACTS_DATA).map((key) => ({ label: CONTRACTS_DATA[key].name, value: key })),
];

/* ---- section primitives ---- */
const cardSurface = (theme) => {
  const dark = isDarkTheme(theme);
  return {
    backgroundColor: dark ? 'rgba(255,255,255,0.035)' : '#FFFFFF',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)'}`,
    borderRadius: DETAIL_RADIUS_CARD,
    boxShadow: dark ? 'none' : '0 2px 14px rgba(53,53,53,0.04)',
  };
};

/* Contained card. A titled section renders a header; a bare card (no title)
   is used for the hero so the whole screen shares one grounded surface system. */
const Section = ({ title, subtitle, children, theme, right, className = '', collapsible = false, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`p-4 sm:p-5 ${className}`}
      style={cardSurface(theme)}
    >
      {title && (
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => collapsible && setOpen(o => !o)}
            className="min-w-0 flex items-center gap-2 text-left focus-ring rounded-full"
            style={{ cursor: collapsible ? 'pointer' : 'default' }}
            aria-expanded={collapsible ? open : undefined}
          >
            {collapsible ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.55, transition: 'transform 0.2s ease', transform: open ? 'none' : 'rotate(-90deg)' }} aria-hidden="true" />
            ) : null}
            <span className="min-w-0">
              <span className={`block ${DETAIL_SECTION_TITLE_CLASS}`} style={{ color: theme.colors.textPrimary }}>{title}</span>
              {subtitle ? (
                <span className={`block ${DETAIL_SECTION_SUBTITLE_CLASS}`} style={{ color: theme.colors.textSecondary, opacity: 0.82 }}>
                  {subtitle}
                </span>
              ) : null}
            </span>
          </button>
          {right ? <div className="flex-shrink-0 pt-0.5">{right}</div> : null}
        </div>
      )}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: open ? 'visible' : 'hidden' }}
      >
        <div className={`${title ? 'pt-4' : ''} px-[3px] pb-[3px]`}>{children}</div>
      </motion.div>
    </motion.section>
  );
};

/**
 * Labeled field row. Pass children as a function to receive a generated id for
 * the control (proper label/control association); plain children are wrapped
 * in a labeled group for composite controls like chip lists.
 */
const Row = ({ label, children, theme, className = '' }) => {
  const fieldId = useId();
  const isRenderProp = typeof children === 'function';
  const labelStyle = { color: theme.colors.textSecondary, opacity: 0.72 };
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        isRenderProp
          ? <label htmlFor={fieldId} className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>{label}</label>
          : <span id={fieldId} className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>{label}</span>
      )}
      <div
        className="flex-1 min-w-0 w-full"
        {...(!isRenderProp && label ? { role: 'group', 'aria-labelledby': fieldId } : {})}
      >
        {isRenderProp ? children(fieldId) : children}
      </div>
    </div>
  );
};

const CompactSelect = ({ id, options, value, onChange, theme, ariaLabel, surfaceStyle, placeholder = 'Select', mutedValues = [], disabled = false }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const normalized = options.map(opt => (typeof opt === 'string' ? { label: opt, value: opt } : opt));
  const selected = normalized.find(o => o.value === value && o.value !== '');
  const isMuted = !selected || mutedValues.includes(value);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const recalc = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const maxH = 300;
    const openUp = (window.innerHeight - r.bottom) < (maxH + 16) && r.top > maxH;
    setPos({ top: openUp ? r.top + window.scrollY : r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: r.width, openUp });
  };
  const openMenu = () => { if (disabled) return; recalc(); setOpen(true); };
  useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return; setOpen(false); };
    const close = () => setOpen(false);
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="relative">
      <button
        id={id}
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="w-full flex items-center justify-between gap-2 min-h-[44px] px-3 text-[0.875rem] font-semibold text-left outline-none focus-ring transition-all"
        style={{ ...fieldSurface(theme), color: isMuted ? c.textSecondary : c.textPrimary, outline: open ? `1px solid ${c.accent}` : undefined, outlineOffset: '-1px', ...surfaceStyle }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="flex-shrink-0 h-3.5 w-3.5" style={{ color: c.textSecondary, opacity: 0.5, transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
      </button>
      {open && createPortal(
        <motion.ul
          ref={menuRef}
          role="listbox"
          initial={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="fixed m-0 list-none p-1"
          style={{
            top: pos.openUp ? undefined : pos.top,
            bottom: pos.openUp ? (window.innerHeight - pos.top) : undefined,
            left: pos.left,
            width: pos.width,
            minWidth: 168,
            maxHeight: 300,
            overflowY: 'auto',
            background: c.surface,
            boxShadow: DESIGN_TOKENS.shadows.modal,
            zIndex: DESIGN_TOKENS.zIndex.popover,
            borderRadius: DETAIL_RADIUS_MENU,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          {normalized.map(opt => {
            const active = opt.value === value;
            const optMuted = mutedValues.includes(opt.value);
            return (
              <li key={opt.value || opt.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-full text-[0.8125rem] flex items-center justify-between gap-2 transition-colors ${active ? 'font-bold' : 'font-medium'}`}
                  style={{ color: optMuted ? c.textSecondary : c.textPrimary, backgroundColor: active ? `${c.accent}0F` : 'transparent' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : '#E8EBEE'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = active ? `${c.accent}0F` : 'transparent'; }}
                >
                  <span className="truncate">{opt.label}</span>
                  {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.accent }} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </motion.ul>,
        document.body
      )}
    </div>
  );
};

/* Compact Yes/No (or labeled) segmented pill toggle. */
const SegmentToggle = ({ value, onChange, theme, options, ariaLabel, allowDeselect = false }) => {
  const c = theme.colors;
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full p-1" style={fieldSurface(theme)} role="group" aria-label={ariaLabel}>
      {options.map(opt => {
        const active = value === opt.val;
        return (
          <button
            key={`${opt.label}:${String(opt.val)}`}
            type="button"
            onClick={() => onChange(allowDeselect && active ? null : opt.val)}
            aria-pressed={active}
            className="inline-flex min-h-[40px] items-center gap-1.5 px-4 rounded-full text-[0.75rem] font-semibold transition-all active:scale-[0.97] focus-ring"
            style={active ? { backgroundColor: c.accent, color: c.accentText || '#FFFFFF' } : { color: c.textSecondary }}
          >
            {opt.group ? <span className="text-[0.5625rem] font-bold uppercase tracking-[0.05em]" style={{ opacity: active ? 0.85 : 0.5 }}>{opt.group}</span> : null}
            <span className="truncate max-w-[170px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/* Removable entity chip (dealers, A&D firms, series). */
const RemovableChip = ({ label, detail, onRemove, theme, size = 'default' }) => {
  const isDark = isDarkTheme(theme);
  const sizeClass = size === 'small'
    ? 'h-7 px-2.5 text-[0.625rem]'
    : 'h-8 px-3 text-[0.6875rem]';
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label}`}
      className={`inline-flex max-w-full items-center gap-1 rounded-full font-medium transition-all active:scale-[0.97] focus-ring ${sizeClass}`}
      style={{ backgroundColor: detailTileBg(theme), color: theme.colors.textPrimary }}
    >
      <span className="truncate">{label}</span>
      {detail ? <span className="flex-shrink-0 text-[0.5625rem] tabular-nums" style={{ opacity: 0.4 }}>{detail}</span> : null}
      <X className="h-2.5 w-2.5 flex-shrink-0" style={{ opacity: 0.3 }} aria-hidden="true" />
    </button>
  );
};

/* Inline-editable identity text (project name / account) with edit affordance. */
const EditableIdentityField = ({ value, onChange, placeholder, ariaLabel, theme, inputClass, showIcon = true, className = '' }) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const underline = focused
    ? `${c.accent}73`
    : hovered
      ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(53,53,53,0.18)')
      : 'transparent';
  return (
    <div
      className={`inline-flex max-w-full min-w-0 items-center gap-1.5 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: `1.5px solid ${underline}`, transition: 'border-color 150ms ease' }}
    >
      <span className="relative grid min-w-0 max-w-full">
        <span aria-hidden="true" className={`pointer-events-none invisible col-start-1 row-start-1 whitespace-pre ${inputClass}`}>
          {value || placeholder || ' '}
        </span>
        <input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className={`col-start-1 row-start-1 w-full min-w-0 bg-transparent outline-none ${inputClass}`}
        />
      </span>
      {showIcon ? (
        <Pencil
          aria-hidden="true"
          className="h-3.5 w-3.5 flex-shrink-0 transition-opacity"
          style={{ color: c.textSecondary, opacity: focused ? 0 : hovered ? 0.7 : 0.4 }}
        />
      ) : null}
    </div>
  );
};

const RewardTogglePill = ({ label, sublabel, checked, onChange, theme }) => {
  const c = theme.colors;
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-[0.75rem] font-medium" style={{ color: checked ? c.textPrimary : c.textSecondary, opacity: checked ? 1 : 0.6 }}>
        {label} <span className="tabular-nums">{sublabel}</span>
      </span>
      <ToggleSwitch checked={checked} onChange={onChange} theme={theme} ariaLabel={`${label} reward`} />
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
    <div className="flex items-start gap-3 px-3.5 py-3" style={fieldSurface(theme)}>
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
            <a href={`mailto:${contact.email}`} aria-label={`Email ${contact.name}`} className="w-8 h-8 rounded-full flex items-center justify-center focus-ring" style={{ backgroundColor: `${c.accent}12`, color: c.accent }}>
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          ) : null}
          {contact.phone ? (
            <a href={`tel:${contact.phone}`} aria-label={`Call ${contact.name}`} className="w-8 h-8 rounded-full flex items-center justify-center focus-ring" style={{ backgroundColor: `${c.accent}12`, color: c.accent }}>
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const QuoteTracker = ({ quotes = [], theme, onRequestQuote }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;

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
          <div key={q.id || qi} className="flex items-start gap-3 px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
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
          <JSIActionButtonGroup compact className="px-2.5 pb-2.5 pt-0.5">
            <JSIActionButton theme={theme} size="small" icon={<Eye className="w-3 h-3" />}>
              View
            </JSIActionButton>
            <JSIActionButton theme={theme} size="small" icon={<Share2 className="w-3 h-3" />}>
              Share
            </JSIActionButton>
            <JSIActionButton theme={theme} size="small" icon={<Download className="w-3 h-3" />}>
              Save
            </JSIActionButton>
          </JSIActionButtonGroup>
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

const SampleOrderDetailModal = ({ order, theme, onClose }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;

  if (!order) return null;

  const meta = SAMPLE_STATUS_META[order.status] || SAMPLE_STATUS_META.processing;
  const StatusIcon = meta.icon;
  const totalItems = (order.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
  const primaryItemLabel = (order.items || [])[0]?.name || 'Sample order';
  const deliveryLabel = order.deliveredDate
    ? `Delivered ${formatSampleOrderDate(order.deliveredDate)}`
    : order.eta
      ? `ETA ${formatSampleOrderDate(order.eta)}`
      : 'Queued for fulfillment';

  return (
    <Modal
      show={!!order}
      onClose={onClose}
      title="Sample Order"
      theme={theme}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="px-4 py-3.5 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}>
              <StatusIcon className="w-4 h-4" style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[0.875rem] font-semibold truncate" style={{ color: c.textPrimary }}>
                  {primaryItemLabel}{totalItems > 1 ? ` + ${totalItems - 1} more` : ''}
                </span>
                <span className="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: meta.bg, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <p className="mt-1 text-[0.6875rem]" style={{ color: c.textSecondary }}>
                {order.id} · {totalItems} sample{totalItems === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
            <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Ordered</span>
            <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{formatSampleOrderTimestamp(order.date)}</p>
          </div>
          <div className="px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
            <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Fulfillment</span>
            <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{deliveryLabel}</p>
          </div>
          <div className="px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
            <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Ship to</span>
            <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{order.shipTo || 'TBD'}</p>
          </div>
          <div className="px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
            <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Requested by</span>
            <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{order.orderedBy?.name || 'Unknown'}</p>
          </div>
        </div>

        <div className="px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
          <div className="flex items-start gap-2.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: c.textSecondary, opacity: 0.55 }} />
            <div>
              <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Delivery address</span>
              <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{order.address || 'Address pending'}</p>
            </div>
          </div>
        </div>

        {order.tracking ? (
          <div className="px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
            <div className="flex items-start gap-2.5">
              <Truck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: c.textSecondary, opacity: 0.55 }} />
              <div>
                <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Tracking</span>
                <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{order.carrier || 'Carrier'} · {order.tracking}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Sample contents</span>
          <div className="space-y-1.5">
            {(order.items || []).map((item, index) => (
              <div key={`${item.code || item.name}-${index}`} className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: insetBg(theme) }}>
                <div className="min-w-0">
                  <p className="text-[0.75rem] font-semibold truncate" style={{ color: c.textPrimary }}>{item.name}</p>
                  <p className="mt-0.5 text-[0.625rem]" style={{ color: c.textSecondary }}>{item.code || 'Sample'}</p>
                </div>
                <span className="text-[0.75rem] font-semibold flex-shrink-0" style={{ color: c.textPrimary }}>x{item.qty || 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const ProjectNoteLog = ({
  entries,
  documents,
  composer,
  onComposerChange,
  onLog,
  onAttach,
  pendingDocIds,
  onRemovePendingDoc,
  theme,
  readOnly,
}) => {
  const c = theme.colors;
  const docById = useMemo(
    () => Object.fromEntries((documents || []).map(d => [d.id, d])),
    [documents],
  );
  const pendingDocs = (pendingDocIds || []).map(id => docById[id]).filter(Boolean);

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <input
              value={composer}
              onChange={e => onComposerChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onLog(); } }}
              placeholder="Log an update…"
              aria-label="Log an update"
              className="min-h-[44px] flex-1 px-3.5 text-[0.8125rem] font-medium outline-none focus-ring"
              style={{ ...fieldSurface(theme), color: c.textPrimary }}
            />
            <button
              type="button"
              onClick={onLog}
              disabled={!composer.trim() && pendingDocs.length === 0}
              className="inline-flex min-h-[44px] flex-shrink-0 items-center justify-center rounded-full px-4 text-[0.8125rem] font-semibold transition-all active:scale-[0.98] focus-ring disabled:opacity-40"
              style={{ backgroundColor: c.accent, color: c.accentText || '#FFFFFF' }}
            >
              Log
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {pendingDocs.map(doc => (
              <span key={doc.id} className="inline-flex max-w-full items-center gap-1.5 rounded-full py-1 pl-2.5 pr-1.5 text-[0.6875rem] font-semibold" style={{ ...fieldSurface(theme), color: c.textPrimary }}>
                <FileText className="h-3 w-3 flex-shrink-0" style={{ color: c.accent }} aria-hidden="true" />
                <span className="truncate max-w-[140px]">{doc.fileName}</span>
                <button type="button" onClick={() => onRemovePendingDoc(doc.id)} aria-label={`Remove ${doc.fileName} from this log entry`} className="flex h-5 w-5 items-center justify-center rounded-full focus-ring" style={{ color: c.textSecondary }}>
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
            <button type="button" onClick={onAttach} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 text-[0.75rem] font-semibold transition-all active:scale-[0.98] focus-ring" style={{ ...fieldSurface(theme), color: c.textSecondary }}>
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              Attach
            </button>
          </div>
        </div>
      ) : null}

      {entries.length > 0 ? (
        <ol className="m-0 list-none space-y-3 p-0" aria-label="Project activity log">
          {entries.map(entry => (
            <li key={entry.id} className="space-y-1.5">
              {entry.text ? (
                <p className="text-[0.8125rem] leading-relaxed" style={{ color: c.textPrimary }}>{entry.text}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <time className="text-[0.625rem] font-medium tabular-nums" style={{ color: c.textSecondary, opacity: 0.55 }} dateTime={entry.at}>
                  {formatRelativeTime(entry.at)}
                </time>
                {(entry.docIds || []).map(id => {
                  const doc = docById[id];
                  if (!doc) return null;
                  return (
                    <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold" style={{ backgroundColor: detailTileBg(theme), color: c.textSecondary }}>
                      <FileText className="h-3 w-3 flex-shrink-0" style={{ color: c.accent }} aria-hidden="true" />
                      <span className="truncate max-w-[120px]">{doc.fileName}</span>
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-[0.75rem] font-medium" style={{ color: c.textSecondary, opacity: 0.55 }}>
          {readOnly ? 'No updates logged.' : 'Updates and attachments will appear here.'}
        </p>
      )}
    </div>
  );
};

const DetailHubCard = ({ icon: Icon, title, count, summary, onClick, theme, accentColor }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const accent = accentColor || c.accent;
  const hoverBg = detailTileBg(theme);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-2.5 min-h-[52px] py-2.5 text-left rounded-[24px] transition-colors active:scale-[0.99] focus-ring"
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = hoverBg; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}12`, color: accent }}>
        <Icon className="w-4 h-4" strokeWidth={1.9} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[0.8125rem] font-semibold tracking-[-0.01em] truncate" style={{ color: c.textPrimary }}>{title}</span>
          {count != null ? (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[0.625rem] font-bold tabular-nums" style={{ backgroundColor: detailTileBg(theme), color: c.textSecondary }}>{count}</span>
          ) : null}
        </div>
        {summary ? (
          <p className="mt-0.5 text-[0.6875rem] truncate" style={{ color: c.textSecondary, opacity: 0.72 }}>{summary}</p>
        ) : null}
      </div>
      <ArrowUpRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: c.textSecondary, opacity: 0.45 }} aria-hidden="true" />
    </button>
  );
};

/* 
   MAIN COMPONENT
    */
export const OpportunityDetail = ({ opp, theme, onUpdate, onDelete, onMarkLost, onDone, members, currentUserId, sampleOrders = [], opportunities = [], customers = [], onOpenCustomer }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const listPriceId = useId();

  const [draft, setDraft] = useState(opp);
  const [unlocked, setUnlocked] = useState(false);
  const dirty = useRef(false);
  const saveRef = useRef(null);
  const draftRef = useRef(opp);
  const onUpdateRef = useRef(onUpdate);
  /* Rewards stay rule-driven until the user explicitly touches a toggle
     (tracked via the persisted `*Manual` flags so overrides survive saves). */
  const rewardAutoManagedRef = useRef({ salesReward: true, designerReward: true });
  useEffect(() => {
    setDraft(opp);
    setUnlocked(false);
    rewardAutoManagedRef.current = {
      salesReward: opp.salesRewardManual !== true && opp.salesReward !== false,
      designerReward: opp.designerRewardManual !== true && opp.designerReward !== false,
    };
  }, [opp]);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  // Won/Lost deals lock into a read-only historical record until reopened.
  const isClosed = draft.stage === 'Won' || draft.stage === 'Lost';
  const readOnly = isClosed && !unlocked;
  const readOnlyRef = useRef(readOnly);
  readOnlyRef.current = readOnly;

  /* Delineate a project whose name simply duplicates the end-user name.
     Runs once per loaded opportunity so "ABC Corporation" becomes
     "ABC Corporation (Project 1)" — keeping reps from confusing the two. */
  useEffect(() => {
    if (readOnlyRef.current) return;
    const eu = String(opp?.endUser || '').trim();
    const nm = String(opp?.name || '').trim();
    if (!eu || !nm || nm.toLowerCase() !== eu.toLowerCase()) return;
    const norm = (s) => String(s || '').trim().toLowerCase();
    const peers = (opportunities || []).filter(o => norm(o.endUser || o.company) === norm(eu));
    const idx = peers.findIndex(o => String(o.id) === String(opp?.id));
    const n = idx >= 0 ? idx + 1 : peers.length + 1;
    setDraft(p => { dirty.current = true; return { ...p, name: `${eu} (Project ${n})` }; });
  }, [opp?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback((k, v) => {
    if (readOnlyRef.current) return;
    setDraft(p => { const n = { ...p, [k]: v }; dirty.current = true; return n; });
  }, []);

  const contactList = useMemo(
    () => Array.isArray(draft.contacts) ? draft.contacts : (draft.contact ? [draft.contact] : []),
    [draft.contacts, draft.contact],
  );
  const setContacts = useCallback((next) => {
    if (readOnlyRef.current) return;
    setDraft(p => { dirty.current = true; return { ...p, contacts: next, contact: next[0] || '' }; });
  }, []);
  const addProjectContact = useCallback((name) => {
    if (readOnlyRef.current) return;
    const trimmed = String(name || '').trim();
    if (!trimmed) return;
    setDraft(p => {
      const current = Array.isArray(p.contacts) ? p.contacts : (p.contact ? [p.contact] : []);
      if (current.some(x => x.toLowerCase() === trimmed.toLowerCase())) return p;
      dirty.current = true;
      const next = [...current, trimmed];
      return { ...p, contacts: next, contact: next[0] || '' };
    });
  }, []);
  const removeProjectContact = useCallback((name) => {
    if (readOnlyRef.current) return;
    setDraft(p => {
      const current = Array.isArray(p.contacts) ? p.contacts : (p.contact ? [p.contact] : []);
      const next = current.filter(x => x !== name);
      dirty.current = true;
      return { ...p, contacts: next, contact: next[0] || '' };
    });
  }, []);

  useEffect(() => {
    if (!dirty.current) return;
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => { onUpdate(draft); dirty.current = false; }, 500);
    return () => clearTimeout(saveRef.current);
  }, [draft, onUpdate]);

  /* Flush a pending debounced save when navigating away. */
  useEffect(() => () => {
    if (dirty.current) {
      onUpdateRef.current(draftRef.current);
      dirty.current = false;
    }
  }, []);

  /* remove project (move to Lost or delete permanently) */
  const [removeOpen, setRemoveOpen] = useState(false);
  const cancelPendingSave = useCallback(() => {
    dirty.current = false;
    clearTimeout(saveRef.current);
  }, []);
  const handleMarkLost = useCallback(() => {
    cancelPendingSave();
    setRemoveOpen(false);
    onMarkLost?.({ ...draftRef.current, stage: 'Lost' });
  }, [cancelPendingSave, onMarkLost]);
  const handleDelete = useCallback(() => {
    cancelPendingSave();
    setRemoveOpen(false);
    onDelete?.(draftRef.current.id);
  }, [cancelPendingSave, onDelete]);
  const handleDone = useCallback(() => {
    clearTimeout(saveRef.current);
    if (dirty.current) { onUpdateRef.current(draftRef.current); dirty.current = false; }
    onDone?.();
  }, [onDone]);
  const canRemove = Boolean(onDelete || onMarkLost);

  /* discount dropdown */
  const [discountOpen, setDiscountOpen] = useState(false);
  const [pendingDiscount, setPendingDiscount] = useState(null);
  const discBtn = useRef(null);
  const discMenu = useRef(null);
  const [discPos, setDiscPos] = useState({ top: 0, left: 0, width: 0 });

  const openDiscount = () => {
    if (discBtn.current) {
      const r = discBtn.current.getBoundingClientRect();
      const width = Math.max(r.width, 220);
      // Menu is position: fixed — viewport coordinates only, clamped on-screen.
      const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
      setDiscPos({ top: r.bottom + 8, left, width });
    }
    setDiscountOpen(true);
  };

  useEffect(() => {
    if (!discountOpen) return;
    const handler = e => {
      if (discMenu.current && !discMenu.current.contains(e.target) && discBtn.current && !discBtn.current.contains(e.target)) setDiscountOpen(false);
    };
    const close = () => setDiscountOpen(false);
    const onKey = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('mousedown', handler);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('keydown', onKey);
    };
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
  const setCompetition = (on) => { setDraft(p => { dirty.current = true; return { ...p, competitionPresent: on, competitors: on ? (p.competitors || []) : [] }; }); };
  const addProductSeries = (series) => { if (!series) return; const list = draft.products || []; if (!list.some(p => p.series === series)) update('products', [...list, { series }]); };
  const removeProductSeries = (series) => update('products', (draft.products || []).filter(p => p.series !== series));
  const updateProductOption = (series, key, val) => update('products', (draft.products || []).map(p => (p.series === series ? { ...p, [key]: val } : p)));
  const removeFrom = (key, val) => update(key, (draft[key] || []).filter(x => x !== val));
  const addUnique = (key, val) => { if (!val) return; const list = draft[key] || []; if (!list.includes(val)) update(key, [...list, val]); };

  /* Who is leading the specifications? — derived from real stakeholders. */
  const specifierOptions = useMemo(() => buildSpecifierOptions(draft), [draft.endUser, draft.designFirms, draft.dealers]);
  const setDrivingSpecs = useCallback((type, name) => {
    const normalized = String(name || '').trim();
    if (!normalized) return;
    update('drivingSpecs', { type, name: normalized });
  }, [update]);
  useEffect(() => {
    const current = draftRef.current?.drivingSpecs;
    if (!specifierOptions.length) {
      if (current) update('drivingSpecs', null);
      return;
    }
    const match = current && specifierOptions.find(o => o.type === current.type && o.name === current.name);
    if (!match) {
      const fallback = getDefaultSpecifierOption(specifierOptions);
      if (fallback) update('drivingSpecs', { type: fallback.type, name: fallback.name });
    }
  }, [specifierOptions, update]);

  /* JSI quote intake mode (separate from the live quotes in the hub). */
  const quoteMode = draft.jsiQuoteExists ? 'existing' : draft.quoteNeeded ? 'needed' : (draft.noQuoteNeeded ? 'not-needed' : null);
  const setQuoteMode = useCallback((mode) => {
    setDraft(p => {
      dirty.current = true;
      return {
        ...p,
        jsiQuoteExists: mode === 'existing',
        quoteNeeded: mode === 'needed',
        noQuoteNeeded: mode === 'not-needed',
        ...(mode !== 'existing' ? { jsiQuoteNumber: '' } : {}),
      };
    });
  }, []);

  const fileInputRef = useRef(null);
  const notesFileInputRef = useRef(null);
  const [noteComposer, setNoteComposer] = useState('');
  const [pendingNoteDocIds, setPendingNoteDocIds] = useState([]);

  /* computed */
  const rawNumeric = parseCurrency(draft.value);
  const discountMatch = (draft.discount || '').match(/\(([\d.]+)%\)/);
  const discountPct = discountMatch ? parseFloat(discountMatch[1]) / 100 : 0;
  const discountCode = String(draft.discount || '').split(' ')[0];
  const isDiscount502010 = discountCode === '50/20/10';
  const netValue = discountPct > 0 ? Math.round(rawNumeric * (1 - discountPct)) : rawNumeric;
  const rewardDefaultOff = netValue > 0 && netValue < REWARD_AUTO_OFF_NET_LIMIT && discountPct >= REWARD_AUTO_OFF_DISCOUNT_MIN;
  const rewardDefaultValue = !rewardDefaultOff;
  const salesRewardEnabled = rewardAutoManagedRef.current.salesReward ? rewardDefaultValue : draft.salesReward !== false;
  const designerRewardEnabled = rewardAutoManagedRef.current.designerReward ? rewardDefaultValue : draft.designerReward !== false;
  const rewardsOn = salesRewardEnabled || designerRewardEnabled;
  const showSpiffWarning = isDiscount502010 && rewardsOn && rawNumeric > 0 && rawNumeric < SPIFF_502010_MIN_LIST;
  const currentProbability = typeof draft.winProbability === 'number' ? draft.winProbability : 0;

  useEffect(() => {
    if (readOnlyRef.current) return;
    setDraft((prev) => {
      let changed = false;
      const next = { ...prev };
      if (rewardAutoManagedRef.current.salesReward && prev.salesReward !== rewardDefaultValue) {
        next.salesReward = rewardDefaultValue;
        changed = true;
      }
      if (rewardAutoManagedRef.current.designerReward && prev.designerReward !== rewardDefaultValue) {
        next.designerReward = rewardDefaultValue;
        changed = true;
      }
      if (!changed) return prev;
      dirty.current = true;
      return next;
    });
  }, [rewardDefaultValue]);

  const setRewardEnabled = useCallback((key, checked) => {
    rewardAutoManagedRef.current[key] = false;
    setDraft(p => {
      dirty.current = true;
      return { ...p, [key]: checked, [`${key}Manual`]: true };
    });
  }, []);

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const handleRequestQuote = useCallback(() => {
    setQuoteMode('needed');
    setQuoteModalOpen(true);
  }, [setQuoteMode]);
  const [selectedSampleOrder, setSelectedSampleOrder] = useState(null);
  const [hubModal, setHubModal] = useState(null); // 'quotes' | 'samples' | 'documents' | 'contacts' | 'related-orders' | null
  const [newContactName, setNewContactName] = useState('');
  /* Contacts you can pull straight from the dealers / A&D firms on this project. */
  const companyContactGroups = useMemo(() => {
    const companies = [...(draft.dealers || []), ...(draft.designFirms || [])];
    const seen = new Set();
    return companies
      .filter(co => { const k = String(co).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(co => ({ company: co, contacts: DEALER_CONTACTS[co] || [] }))
      .filter(g => g.contacts.length > 0);
  }, [draft.dealers, draft.designFirms]);
  const enrichedQuotes = useMemo(() => (draft.quotes || []).map((q, i) => ({ ...q, status: q.status || (i === 0 ? 'complete' : 'in-progress') })), [draft.quotes]);
  const relatedSampleOrders = useMemo(
    () => getSampleOrdersForOpportunity(draft, sampleOrders, opportunities)
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [draft, sampleOrders, opportunities],
  );

  const relatedOrders = useMemo(() => {
    const normalize = s => (s || '').replace(/[^a-z]/gi, '').toLowerCase();
    const dealerKeys = (draft.dealers || []).map(normalize).filter(k => k.length >= 8);
    if (!dealerKeys.length) return [];
    return ORDER_DATA.filter(o => {
      const orderKey = normalize(o.company);
      return dealerKeys.some(dk => orderKey.includes(dk.slice(0, 10)));
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [draft.dealers]);
  const { customer: linkedCustomer, source: customerLinkSource } = useMemo(
    () => resolveOpportunityCustomerLink(draft, customers),
    [customers, draft],
  );
  const projectContacts = useMemo(
    () => buildOpportunityProjectContacts(draft, linkedCustomer),
    [draft, linkedCustomer],
  );
  const customerLocationLabel = linkedCustomer?.location
    ? [linkedCustomer.location.city, linkedCustomer.location.state].filter(Boolean).join(', ')
    : '';
  const openLinkedCustomer = useCallback(() => {
    if (linkedCustomer && typeof onOpenCustomer === 'function') onOpenCustomer(linkedCustomer);
  }, [linkedCustomer, onOpenCustomer]);
  const heroSummaryParts = [draft.vertical === 'Other' ? (draft.otherVertical || 'Other') : draft.vertical, draft.installationLocation]
    .map(v => String(v || '').trim())
    .filter(Boolean);

  const noteEntries = useMemo(() => {
    if (Array.isArray(draft.noteLog) && draft.noteLog.length) {
      return [...draft.noteLog].sort((a, b) => new Date(a.at) - new Date(b.at));
    }
    const legacy = String(draft.notes || '').trim();
    if (!legacy) return [];
    return [{
      id: 'legacy',
      text: legacy,
      at: draft.updatedAt || opp?.updatedAt || new Date().toISOString(),
      docIds: (draft.documents || []).map(d => d.id),
    }];
  }, [draft.noteLog, draft.notes, draft.updatedAt, draft.documents, opp?.updatedAt]);

  useEffect(() => {
    if (readOnlyRef.current) return;
    const legacy = String(draft.notes || '').trim();
    if (!legacy || (Array.isArray(draft.noteLog) && draft.noteLog.length)) return;
    setDraft(p => {
      dirty.current = true;
      return {
        ...p,
        noteLog: [{
          id: 'legacy',
          text: legacy,
          at: p.updatedAt || new Date().toISOString(),
          docIds: (p.documents || []).map(d => d.id),
        }],
        notes: '',
      };
    });
  }, [opp?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const logNoteEntry = useCallback(() => {
    if (readOnlyRef.current) return;
    const text = noteComposer.trim();
    if (!text && pendingNoteDocIds.length === 0) return;
    setDraft(p => {
      const prior = Array.isArray(p.noteLog)
        ? p.noteLog
        : (String(p.notes || '').trim()
          ? [{ id: 'legacy', text: String(p.notes).trim(), at: p.updatedAt || new Date().toISOString(), docIds: [] }]
          : []);
      dirty.current = true;
      return {
        ...p,
        noteLog: [...prior, {
          id: `n${Date.now()}`,
          text: text || 'Attached files',
          at: new Date().toISOString(),
          docIds: [...pendingNoteDocIds],
        }],
        notes: '',
      };
    });
    setNoteComposer('');
    setPendingNoteDocIds([]);
  }, [noteComposer, pendingNoteDocIds]);

  const handleNotesFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newDocs = files.map(f => ({
      id: `${Date.now()}_${f.name}`,
      fileName: f.name,
      type: f.type.includes('pdf') ? 'PDF' : f.type.includes('image') ? 'Image' : 'Document',
      size: f.size < 1024 * 1024 ? `${Math.round(f.size / 1024)}KB` : `${(f.size / (1024 * 1024)).toFixed(1)}MB`,
      date: new Date().toLocaleDateString(),
    }));
    setDraft(p => {
      dirty.current = true;
      return { ...p, documents: [...(p.documents || []), ...newDocs] };
    });
    setPendingNoteDocIds(ids => [...ids, ...newDocs.map(d => d.id)]);
    e.target.value = '';
  }, []);

  const removePendingNoteDoc = useCallback((docId) => {
    setPendingNoteDocIds(ids => ids.filter(id => id !== docId));
    setDraft(p => {
      dirty.current = true;
      return { ...p, documents: (p.documents || []).filter(d => d.id !== docId) };
    });
  }, []);
  /* End User is the canonical customer; it's set at project creation and
     reviewed (locked) here. Fall back to legacy `company` for older records. */
  const endUserDisplay = String(draft.endUser || draft.company || '').trim();
  const endUserLocked = !!endUserDisplay;
  const competitionValue = (draft.competitors || []).length > 0 || draft.competitionPresent === true
    ? true
    : (draft.competitionPresent === false ? false : null);
  const discountSummaryLabel = discountCode || 'Select discount';
  const discountDetailLabel = discountPct > 0 ? `${formatPercentLabel(discountPct * 100)} off list` : 'Select pricing basis';
  const netValueLabel = rawNumeric > 0 ? formatCurrency(netValue) : '—';
  const rewardsDetailLabel = `Net below ${formatCurrency(REWARD_AUTO_OFF_NET_LIMIT)} with ${formatPercentLabel(REWARD_AUTO_OFF_DISCOUNT_MIN * 100)}+ discount starts rewards off.`;
  const customerConnectionLabel = draft.customerId
    ? 'Linked'
    : customerLinkSource === 'inferred'
      ? 'Matched'
      : 'Open';
  const labelStyle = { color: c.textSecondary, opacity: 0.72 };

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ background: c.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-28 sm:pb-6">
        <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 max-w-content mx-auto w-full">

          {isClosed && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="mb-4 flex items-center justify-between gap-3 px-4 py-3"
              style={{
                backgroundColor: draft.stage === 'Won' ? 'rgba(74,124,89,0.10)' : 'rgba(184,92,92,0.10)',
                border: `1px solid ${draft.stage === 'Won' ? 'rgba(74,124,89,0.22)' : 'rgba(184,92,92,0.22)'}`,
                borderRadius: DETAIL_RADIUS_CARD,
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Lock className="w-4 h-4 flex-shrink-0" style={{ color: draft.stage === 'Won' ? JSI_COLORS.success : JSI_COLORS.error }} aria-hidden="true" />
                <span className="text-[0.8125rem] font-semibold truncate" style={{ color: c.textPrimary }}>
                  {draft.stage === 'Won' ? 'Won' : 'Lost'} {'\u00b7'} {readOnly ? 'locked historical record' : 'editing unlocked'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUnlocked(u => !u)}
                className="px-3 py-1.5 rounded-full text-[0.6875rem] font-semibold flex-shrink-0 transition-all active:scale-[0.97] focus-ring"
                style={{ ...fieldSurface(theme), color: c.textPrimary }}
              >
                {readOnly ? 'Reopen to edit' : 'Lock again'}
              </button>
            </motion.div>
          )}

          {/* HERO — grounded in its own card, consistent with the sections below */}
          <Section theme={theme} className={`mb-4 ${readOnly ? 'pointer-events-none select-none' : ''}`}>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)] md:items-center lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
              <div className="min-w-0">
                <span className={`${FIELD_LABEL_CLASS} mb-1 block`} style={labelStyle}>Project Name</span>
                <EditableIdentityField
                  value={draft.name}
                  onChange={v => update('name', v)}
                  ariaLabel="Project name"
                  placeholder="Project name"
                  theme={theme}
                  inputClass="project-display-title font-semibold tracking-[-0.035em]"
                  className="max-w-[34rem]"
                />
                {heroSummaryParts.length > 0 && (
                  <p className="mt-1 truncate text-[0.75rem] font-medium" style={{ color: c.textSecondary, opacity: 0.6 }} title={heroSummaryParts.join('  \u00b7  ')}>
                    {heroSummaryParts.join('  \u00b7  ')}
                  </p>
                )}

                {/* End User — locked review (set during project creation) */}
                <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className={FIELD_LABEL_CLASS} style={labelStyle}>End User</span>
                  {endUserLocked ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-2.5 py-1"
                      style={fieldSurface(theme)}
                      title="End user is set when the project is created and can't be changed here"
                      aria-label={`End user ${endUserDisplay}. Locked: set at project creation and not editable here.`}
                    >
                      <span className="text-[0.8125rem] font-semibold truncate max-w-[220px]" style={{ color: c.textPrimary }}>{endUserDisplay}</span>
                      <Lock className="w-3 h-3 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.5 }} aria-hidden="true" />
                    </span>
                  ) : (
                    <input
                      value={draft.endUser || ''}
                      onChange={e => update('endUser', e.target.value)}
                      className="min-h-[32px] rounded-full px-3 text-[0.8125rem] font-semibold outline-none focus-ring"
                      style={{ ...fieldSurface(theme), color: c.textPrimary }}
                      placeholder="Add end user"
                    />
                  )}
                  {customerConnectionLabel !== 'Open' ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-[0.05em]"
                      style={{ backgroundColor: draft.customerId ? `${c.accent}14` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.055)'), color: draft.customerId ? c.accent : c.textSecondary }}>
                      {customerConnectionLabel}
                    </span>
                  ) : null}
                  {linkedCustomer ? (
                    <button type="button" onClick={openLinkedCustomer}
                      className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold transition-all active:scale-[0.98] focus-ring"
                      style={{ color: c.accent }}>
                      Open profile
                      <ArrowUpRight className="w-3.5 h-3.5" style={{ opacity: 0.7 }} aria-hidden="true" />
                    </button>
                  ) : null}
                  {customerLocationLabel ? (
                    <span className="text-[0.6875rem] font-medium" style={{ color: c.textSecondary, opacity: 0.6 }}>{customerLocationLabel}</span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
                <div className="min-w-0">
                  <span className={`${FIELD_LABEL_CLASS} mb-1.5 block`} style={labelStyle}>Stage</span>
                  <CompactSelect
                    options={STAGES}
                    value={draft.stage}
                    onChange={v => update('stage', v)}
                    theme={theme}
                    ariaLabel="Project stage"
                  />
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className={FIELD_LABEL_CLASS} style={labelStyle}>Win Probability</span>
                    <span className="text-[0.8125rem] font-bold tabular-nums" style={{ color: c.textPrimary }}>{currentProbability}%</span>
                  </div>
                  <ProbabilitySlider value={currentProbability} onChange={v => update('winProbability', v)} theme={theme} showLabel={false} showValueBubble={false} compact />
                </div>
              </div>
            </div>
          </Section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-5 xl:gap-6 lg:items-start">
            <div className={`min-w-0 space-y-4 ${readOnly ? 'pointer-events-none select-none' : ''}`}>
              <Section title="Pricing" theme={theme}>
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="min-w-0 space-y-1.5">
                      <label htmlFor={listPriceId} className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>List Price</label>
                      <div className="px-3.5 py-2.5" style={compoundFieldSurface(theme)}>
                        <div className="flex min-h-[28px] items-center gap-0.5">
                          <span aria-hidden="true" className="text-[0.9375rem] font-semibold tabular-nums" style={{ color: draft.value ? c.textPrimary : c.textSecondary, opacity: draft.value ? 1 : 0.55 }}>$</span>
                          <input
                            id={listPriceId}
                            inputMode="numeric"
                            value={formatListPriceInput(draft.value)}
                            onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); update('value', val ? ('$' + parseInt(val, 10).toLocaleString()) : ''); }}
                            className="w-full bg-transparent text-[0.9375rem] font-semibold tabular-nums outline-none focus-ring"
                            style={{ color: c.textPrimary }}
                            placeholder="0"
                          />
                        </div>
                        {rawNumeric > 0 && discountPct > 0 ? (
                          <p className="mt-1 text-[0.6875rem] font-medium tabular-nums" style={{ color: c.textSecondary, opacity: 0.62 }}>
                            {netValueLabel} net
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>Discount</span>
                      <div className="px-3.5 py-2.5" style={compoundFieldSurface(theme)}>
                        <button
                          type="button"
                          ref={discBtn}
                          onClick={() => discountOpen ? setDiscountOpen(false) : openDiscount()}
                          aria-haspopup="listbox"
                          aria-expanded={discountOpen}
                          className="flex w-full min-h-[28px] items-center justify-between gap-2 text-left outline-none focus-ring"
                        >
                          <span className="truncate text-[0.9375rem] font-semibold" style={{ color: draft.discount ? c.textPrimary : c.textSecondary, opacity: draft.discount ? 1 : 0.55 }}>
                            {discountSummaryLabel}
                          </span>
                          <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${discountOpen ? 'rotate-180' : ''}`} style={{ color: c.textSecondary, opacity: 0.5 }} aria-hidden="true" />
                        </button>
                        {discountPct > 0 ? (
                          <p className="mt-1 text-[0.6875rem] font-medium" style={{ color: c.textSecondary, opacity: 0.62 }}>
                            {discountDetailLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <Row label="PO Timeframe" theme={theme}>
                      {(id) => <CompactSelect id={id} options={PO_TIMEFRAMES} value={draft.poTimeframe} onChange={v => update('poTimeframe', v)} theme={theme} mutedValues={['Unknown']} />}
                    </Row>
                    <Row label="Contract" theme={theme}>
                      {(id) => <CompactSelect id={id} options={CONTRACT_OPTIONS} value={draft.contractType || ''} onChange={v => update('contractType', v)} theme={theme} ariaLabel="Contract" placeholder="Select contract" mutedValues={['none']} />}
                    </Row>
                  </div>

                  <div className="rounded-[20px] px-3.5 py-3" style={{ backgroundColor: detailTileBg(theme) }}>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                      <span className={`${FIELD_LABEL_CLASS}`} style={labelStyle}>Rewards</span>
                      <RewardTogglePill
                        label="Sales"
                        sublabel={salesRewardEnabled ? '3%' : 'off'}
                        checked={salesRewardEnabled}
                        onChange={e => setRewardEnabled('salesReward', e.target.checked)}
                        theme={theme}
                      />
                      <RewardTogglePill
                        label="Designer"
                        sublabel={designerRewardEnabled ? '1%' : 'off'}
                        checked={designerRewardEnabled}
                        onChange={e => setRewardEnabled('designerReward', e.target.checked)}
                        theme={theme}
                      />
                    </div>
                  </div>

                  {rewardDefaultOff ? (
                    <div className="flex items-center gap-2 rounded-[20px] px-3.5 py-2.5" style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.08)' : 'rgba(196,149,106,0.06)' }}>
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: c.warning }} aria-hidden="true" />
                      <span className="text-[0.6875rem] font-medium" style={{ color: c.warning }}>{rewardsDetailLabel}</span>
                    </div>
                  ) : null}
                  {showSpiffWarning ? (
                    <div className="flex items-center gap-2 rounded-[20px] px-3.5 py-2.5" style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.08)' : 'rgba(196,149,106,0.06)' }}>
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: c.warning }} aria-hidden="true" />
                      <span className="text-[0.6875rem] font-medium" style={{ color: c.warning }}>No spiff eligible: 50/20/10 with list value under $10K.</span>
                    </div>
                  ) : null}
                </div>
              </Section>

              <Section title="Project Details" theme={theme}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Row label="Vertical" theme={theme} className={draft.vertical === 'Other' ? 'sm:col-span-2' : ''}>
                    {(id) => (
                      <div className={draft.vertical === 'Other' ? 'flex items-center gap-2' : ''}>
                        <div className={draft.vertical === 'Other' ? 'w-[44%] flex-shrink-0' : 'w-full'}>
                          <CompactSelect id={id} options={VERTICALS} value={draft.vertical} onChange={v => update('vertical', v)} theme={theme} />
                        </div>
                        {draft.vertical === 'Other' && (
                          <input
                            value={draft.otherVertical || ''}
                            onChange={e => update('otherVertical', e.target.value)}
                            className={`${TEXT_INPUT_CLASS} flex-1 min-w-0`}
                            style={{ color: c.textPrimary, ...fieldSurface(theme) }}
                            placeholder="What kind?"
                          />
                        )}
                      </div>
                    )}
                  </Row>
                  <Row label="Install Date" theme={theme}>
                    {(id) => (
                      <input id={id} type="date" value={draft.expectedInstallDate || ''} onChange={e => update('expectedInstallDate', e.target.value)}
                        className={TEXT_INPUT_CLASS} style={{ color: draft.expectedInstallDate ? c.textPrimary : c.textSecondary, colorScheme: isDark ? 'dark' : 'light', ...fieldSurface(theme) }} />
                    )}
                  </Row>
                  <Row label="Location" theme={theme}>
                    {(id) => (
                      <input id={id} value={draft.installationLocation || ''} onChange={e => update('installationLocation', e.target.value)}
                        className={TEXT_INPUT_CLASS} style={{ color: c.textPrimary, ...fieldSurface(theme) }} placeholder="City, State" />
                    )}
                  </Row>
                  <div className="space-y-1.5">
                    <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>Bid Project</span>
                    <SegmentToggle
                      value={!!draft.isBid}
                      onChange={v => update('isBid', v)}
                      theme={theme}
                      ariaLabel="Bid project"
                      options={[{ label: 'No', val: false }, { label: 'Yes', val: true }]}
                    />
                  </div>
                </div>
              </Section>

              <Section title="Stakeholders & Competition" theme={theme}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>Dealer Partners</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(draft.dealers || []).map(f => (
                        <RemovableChip key={f} label={f} onRemove={() => removeFrom('dealers', f)} theme={theme} />
                      ))}
                      <SuggestInputPill collapsible placeholder="Add dealer" suggestions={INITIAL_DEALERS.filter(x => !(draft.dealers || []).includes(x))} onAdd={v => addUnique('dealers', v)} theme={theme} />
                    </div>
                  </div>
                  <Row label="A&D Firms" theme={theme}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(draft.designFirms || []).map(f => (
                        <RemovableChip key={f} label={f} onRemove={() => removeFrom('designFirms', f)} theme={theme} />
                      ))}
                      <SuggestInputPill collapsible placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS.filter(x => !(draft.designFirms || []).includes(x))} onAdd={v => addUnique('designFirms', v)} theme={theme} />
                    </div>
                  </Row>

                  {specifierOptions.length > 0 && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>Who is leading the specifications?</span>
                      <SegmentToggle
                        theme={theme}
                        ariaLabel="Who is leading the specifications?"
                        value={specifierOptions.findIndex(o => draft.drivingSpecs?.type === o.type && draft.drivingSpecs?.name === o.name)}
                        onChange={(i) => { const o = specifierOptions[i]; if (o) setDrivingSpecs(o.type, o.name); }}
                        options={specifierOptions.map((o, i) => ({ label: o.name, val: i, group: o.group }))}
                      />
                    </div>
                  )}

                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className={`${FIELD_LABEL_CLASS} flex-shrink-0`} style={labelStyle}>Competition</span>
                      <SegmentToggle
                        value={competitionValue}
                        onChange={v => setCompetition(v)}
                        theme={theme}
                        ariaLabel="Competition present"
                        options={[{ label: 'No', val: false }, { label: 'Yes', val: true }]}
                      />
                      {competitionValue === true ? (
                        <SuggestInputPill
                          className="flex-1 min-w-[160px] sm:min-w-[200px]"
                          compact
                          collapsible={false}
                          placeholder={(draft.competitors || []).length ? 'Add competitor…' : 'Search or type competitor…'}
                          suggestions={COMPETITORS.filter(x => x !== 'None' && x !== 'Unknown' && !(draft.competitors || []).includes(x))}
                          onAdd={v => addUnique('competitors', v)}
                          theme={theme}
                        />
                      ) : null}
                    </div>
                    {competitionValue === true && (draft.competitors || []).length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(draft.competitors || []).map(comp => (
                          <RemovableChip key={comp} label={comp} onRemove={() => toggleCompetitor(comp)} theme={theme} size="small" />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Section>

              <Section title="Specs & Quote" theme={theme} collapsible>
                <div className="space-y-3">
                  <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>Specified Series ({(draft.products || []).length})</span>
                  {(draft.products || []).length > 0 && (
                    <div className="space-y-3">
                      {(draft.products || []).map(p => {
                        const prompts = getSeriesSpecPrompts(p.series);
                        const leadLabel = getSeriesLeadLabel(p.series);
                        const nestedFieldBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF';
                        return (
                          <div
                            key={p.series}
                            className="rounded-[20px] px-3.5 py-3"
                            style={{ backgroundColor: detailTileBg(theme) }}
                          >
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="text-[0.875rem] font-semibold truncate" style={{ color: c.textPrimary }}>{p.series}</span>
                                {leadLabel ? (
                                  <span
                                    className="flex-shrink-0 text-[0.5625rem] font-bold uppercase tracking-[0.05em] tabular-nums"
                                    style={{ color: c.textSecondary, opacity: 0.6 }}
                                    title={leadLabel === 'QS' ? 'Quick ship' : `${leadLabel} lead time`}
                                    aria-label={leadLabel === 'QS' ? 'Quick ship' : `${leadLabel} lead time`}
                                  >
                                    {leadLabel === 'QS' ? 'Quick ship' : `${leadLabel} lead`}
                                  </span>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeProductSeries(p.series)}
                                aria-label={`Remove ${p.series}`}
                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full focus-ring transition-all active:scale-[0.95]"
                                style={{ color: c.textSecondary, opacity: 0.5 }}
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                              {prompts.map(prompt => (
                                <div key={prompt.key} className="space-y-1">
                                  <span className="text-[0.625rem] font-medium" style={{ color: c.textSecondary, opacity: 0.72 }}>{prompt.label}</span>
                                  <CompactSelect
                                    options={prompt.options}
                                    value={p[prompt.key] || ''}
                                    onChange={v => updateProductOption(p.series, prompt.key, v)}
                                    theme={theme}
                                    ariaLabel={`${p.series} ${prompt.label}`}
                                    placeholder="TBD"
                                    surfaceStyle={{ minHeight: '38px', backgroundColor: nestedFieldBg }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <SuggestInputPill collapsible placeholder="Add series..." suggestions={JSI_SERIES.filter(s => !(draft.products || []).some(p => p.series === s))} onAdd={addProductSeries} theme={theme} />
                </div>

                <div className="mt-6 space-y-3">
                  <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>JSI Quote</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <SegmentToggle
                      theme={theme}
                      ariaLabel="JSI Quote status"
                      value={quoteMode === 'existing' ? 'existing' : quoteMode === 'not-needed' ? 'not-needed' : null}
                      allowDeselect
                      onChange={(mode) => setQuoteMode(mode || null)}
                      options={[
                        { label: 'Existing Quote', val: 'existing' },
                        { label: 'No Quote Needed', val: 'not-needed' },
                      ]}
                    />
                    {quoteMode === 'existing' && (
                      <input
                        aria-label="JSI quote number"
                        value={draft.jsiQuoteNumber || ''}
                        onChange={e => update('jsiQuoteNumber', e.target.value)}
                        className={`${TEXT_INPUT_CLASS} min-w-[160px] flex-1`}
                        style={{ color: c.textPrimary, ...fieldSurface(theme) }}
                        placeholder="Quote # e.g. Q-12345"
                      />
                    )}
                    {quoteMode !== 'not-needed' ? (
                      <button
                        type="button"
                        onClick={handleRequestQuote}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.8125rem] font-semibold transition-all active:scale-[0.99] focus-ring sm:flex-none sm:min-w-[200px]"
                        style={{ backgroundColor: c.accent, color: c.accentText || '#FFFFFF' }}
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Request Quote
                      </button>
                    ) : null}
                  </div>
                </div>
              </Section>
            </div>

            <div className="min-w-0 space-y-4 lg:sticky lg:top-[calc(var(--app-header-offset,72px)+1rem)] lg:self-start">
              <Section title="Project Hub" theme={theme}>
                <div className="space-y-0.5 -mx-2">
                  <DetailHubCard
                    icon={Users}
                    title="Contacts"
                    count={projectContacts.length}
                    summary={projectContacts[0] ? `${projectContacts[0].name}${projectContacts.length > 1 ? ` + ${projectContacts.length - 1} more` : ''}` : 'No contacts surfaced yet'}
                    onClick={() => setHubModal('contacts')}
                    theme={theme}
                  />
                  <DetailHubCard
                    icon={FileText}
                    title="Quotes"
                    count={enrichedQuotes.length || null}
                    summary={enrichedQuotes.length
                      ? `${enrichedQuotes.filter(q => q.status === 'complete').length} complete · ${enrichedQuotes.filter(q => q.status && q.status !== 'complete').length} in queue`
                      : 'No quote requests yet'}
                    onClick={() => setHubModal('quotes')}
                    theme={theme}
                  />
                  {relatedSampleOrders.length > 0 ? (
                    <DetailHubCard
                      icon={Package}
                      title="Sample Activity"
                      count={relatedSampleOrders.length}
                      summary={(() => {
                        const latest = relatedSampleOrders[0];
                        const meta = SAMPLE_STATUS_META[latest.status] || SAMPLE_STATUS_META.processing;
                        return `${meta.label} · ${formatSampleOrderDate(latest.deliveredDate || latest.eta || latest.date)}`;
                      })()}
                      onClick={() => setHubModal('samples')}
                      theme={theme}
                    />
                  ) : null}
                  <DetailHubCard
                    icon={Paperclip}
                    title="Documents"
                    count={(draft.documents || []).length || null}
                    summary={(draft.documents || []).length
                      ? `Last upload ${(draft.documents || [])[(draft.documents || []).length - 1]?.date || ''}`
                      : 'Drop in plans, specs, and PDFs'}
                    onClick={() => setHubModal('documents')}
                    theme={theme}
                  />
                  {relatedOrders.length > 0 && (
                    <DetailHubCard
                      icon={ShoppingBag}
                      title="Related Orders"
                      count={relatedOrders.length}
                      summary={(() => {
                        const latest = relatedOrders[0];
                        return `${latest.status} · ${new Date(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                      })()}
                      onClick={() => setHubModal('related-orders')}
                      theme={theme}
                      accentColor={STATUS_COLORS[relatedOrders[0]?.status] || undefined}
                    />
                  )}
                </div>
              </Section>

              <Section title="Activity" theme={theme} collapsible>
                <ProjectNoteLog
                  entries={noteEntries}
                  documents={draft.documents || []}
                  composer={noteComposer}
                  onComposerChange={setNoteComposer}
                  onLog={logNoteEntry}
                  onAttach={() => notesFileInputRef.current?.click()}
                  pendingDocIds={pendingNoteDocIds}
                  onRemovePendingDoc={removePendingNoteDoc}
                  theme={theme}
                  readOnly={readOnly}
                />
                <input
                  ref={notesFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleNotesFileUpload}
                />
              </Section>
            </div>
          </div>

          {/* SAVE + STATUS — pinned on mobile, inline on desktop */}
          <div
            className="fixed inset-x-0 bottom-0 z-20 border-t px-4 py-3 sm:static sm:z-auto sm:border-0 sm:px-0 sm:py-0 sm:pt-8"
            style={{
              borderColor: dividerColor(isDark),
              backgroundColor: isDark ? 'rgba(36,36,36,0.92)' : 'rgba(240,237,232,0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
            }}
          >
            <div className="max-w-content mx-auto space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:justify-center">
                {onDone ? (
                  <button
                    type="button"
                    onClick={handleDone}
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.875rem] font-semibold transition-all active:scale-[0.99] focus-ring sm:flex-none sm:min-w-[240px]"
                    style={{ backgroundColor: c.accent, color: c.accentText || '#FFFFFF' }}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Done
                  </button>
                ) : null}
              </div>
              <div className="flex justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: JSI_COLORS.success, opacity: 0.5 }} />
                  <span className="text-[0.625rem] font-medium tracking-wide" style={{ color: c.textSecondary, opacity: 0.45 }}>Changes saved automatically</span>
                </div>
              </div>
            </div>
          </div>

          {canRemove ? (
            <div className="flex justify-center pb-5">
              <button
                type="button"
                onClick={() => setRemoveOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.75rem] font-semibold transition-all active:scale-[0.98] focus-ring"
                style={{ color: c.error }}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete project
              </button>
            </div>
          ) : null}

        </div>
      </div>

      {/* discount dropdown */}
      {discountOpen && (
        <div ref={discMenu} role="listbox" aria-label="Discount options" className="fixed overflow-hidden"
          style={{ top: discPos.top, left: discPos.left, width: discPos.width, background: theme?.colors?.surface || (isDark ? '#2a2a2a' : '#fff'), boxShadow: DESIGN_TOKENS.shadows.modal, zIndex: DESIGN_TOKENS.zIndex.popover, borderRadius: DETAIL_RADIUS_MENU }}>
          <div className="max-h-[320px] overflow-y-auto scrollbar-hide py-1.5">
            {DISCOUNT_OPTIONS.map(opt => {
              const selected = opt === draft.discount;
              return (
                <button key={opt} type="button" role="option" aria-selected={selected} onClick={() => requestDiscountChange(opt)}
                  className={`flex w-full items-center justify-between gap-3 text-left px-4 py-2.5 text-xs transition-colors ${selected ? 'font-bold' : 'font-medium'}`}
                  style={{ color: c.textPrimary }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <span className="truncate">{opt}</span>
                  {selected ? <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: c.accent }} aria-hidden="true" /> : null}
                </button>
              );
            })}
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

          <div className="p-3.5 space-y-2" style={fieldSurface(theme)}>
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
              className="px-4 py-2 rounded-full text-[0.6875rem] font-semibold transition-all active:scale-[0.98] focus-ring"
              style={{ backgroundColor: detailTileBg(theme), color: c.textPrimary }}
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

      <Modal
        show={removeOpen}
        onClose={() => setRemoveOpen(false)}
        title="Remove this project?"
        theme={theme}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3">
          <p className="text-[0.8125rem] leading-relaxed" style={{ color: c.textSecondary }}>
            Choose how to remove <span className="font-semibold" style={{ color: c.textPrimary }}>{draft.name || 'this project'}</span> from your pipeline.
          </p>

          {onMarkLost ? (
            <button
              type="button"
              onClick={handleMarkLost}
              className="w-full text-left p-3.5 transition-all active:scale-[0.99] focus-ring"
              style={fieldSurface(theme)}
            >
              <span className="block text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>Move to Lost</span>
              <span className="mt-1 block text-[0.6875rem] leading-snug" style={{ color: c.textSecondary }}>
                Keeps the project for reporting and moves it to the Lost stage.
              </span>
            </button>
          ) : null}

          {onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full text-left p-3.5 transition-all active:scale-[0.99] focus-ring"
              style={{ backgroundColor: isDark ? 'rgba(184,92,92,0.14)' : 'rgba(184,92,92,0.08)', borderRadius: DETAIL_RADIUS_INSET }}
            >
              <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold" style={{ color: c.error }}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete permanently
              </span>
              <span className="mt-1 block text-[0.6875rem] leading-snug" style={{ color: c.textSecondary }}>
                Removes the project and all its details. This can't be undone.
              </span>
            </button>
          ) : null}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setRemoveOpen(false)}
              className="px-4 py-2 rounded-full text-[0.6875rem] font-semibold transition-all active:scale-[0.98] focus-ring"
              style={{ backgroundColor: detailTileBg(theme), color: c.textPrimary }}
            >
              Cancel
            </button>
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
          setQuoteMode('needed');
          setQuoteModalOpen(false);
        }}
        initialData={{ projectName: draft.name || '', dealerName: (draft.dealers || [])[0] || '', adFirm: (draft.designFirms || [])[0] || '' }} />

      <SampleOrderDetailModal
        order={selectedSampleOrder}
        theme={theme}
        onClose={() => setSelectedSampleOrder(null)}
      />

      {/* Hidden file input for the documents hub */}
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files || []);
          const newDocs = files.map(f => ({ id: Date.now() + '_' + f.name, fileName: f.name, type: f.type.includes('pdf') ? 'PDF' : f.type.includes('image') ? 'Image' : 'Document', size: f.size < 1024 * 1024 ? `${Math.round(f.size / 1024)}KB` : `${(f.size / (1024 * 1024)).toFixed(1)}MB`, date: new Date().toLocaleDateString() }));
          update('documents', [...(draft.documents || []), ...newDocs]);
          e.target.value = '';
        }} />

      {/* CONTACTS HUB MODAL — pull people straight from this project's dealers / A&D firms */}
      <Modal show={hubModal === 'contacts'} onClose={() => { setHubModal(null); setNewContactName(''); }} title="Contacts" theme={theme} maxWidth="max-w-lg">
        <div className="space-y-4">
          {/* Current contacts */}
          <div className="space-y-2">
            <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>On this project</span>
            {contactList.length > 0 ? (
              <div className="space-y-1.5">
                {contactList.map((name) => {
                  const meta = companyContactGroups
                    .flatMap(g => g.contacts.map(ct => ({ ...ct, company: g.company })))
                    .find(ct => ct.name.toLowerCase() === String(name).toLowerCase());
                  return (
                    <div key={name} className="flex items-center gap-2.5 px-3 py-2.5" style={fieldSurface(theme)}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6875rem] font-bold flex-shrink-0" style={{ backgroundColor: `${c.accent}16`, color: c.accent }}>
                        {getInitials(name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.8125rem] font-semibold truncate" style={{ color: c.textPrimary }}>{name}</div>
                        {meta ? <div className="text-[0.6875rem] truncate" style={{ color: c.textSecondary, opacity: 0.75 }}>{meta.title} · {meta.company}</div> : null}
                      </div>
                      <button type="button" onClick={() => removeProjectContact(name)} aria-label={`Remove ${name}`}
                        className="w-7 h-7 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity focus-ring">
                        <X className="w-3.5 h-3.5" style={{ color: c.textSecondary }} aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="px-3.5 py-3 text-[0.75rem]" style={{ ...fieldSurface(theme), color: c.textSecondary, opacity: 0.75 }}>
                No contacts yet. Add people from the dealers or A&amp;D firms below.
              </p>
            )}
          </div>

          {/* Pick from project companies */}
          {companyContactGroups.length > 0 && (
            <div className="space-y-3">
              <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>Add from project companies</span>
              {companyContactGroups.map((group) => (
                <div key={group.company} className="rounded-[24px] p-3" style={{ backgroundColor: insetBg(theme) }}>
                  <div className="text-[0.75rem] font-semibold mb-2" style={{ color: c.textPrimary }}>{group.company}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.contacts.map((ct) => {
                      const added = contactList.some(n => n.toLowerCase() === ct.name.toLowerCase());
                      return (
                        <button
                          key={ct.name}
                          type="button"
                          disabled={added}
                          onClick={() => addProjectContact(ct.name)}
                          className="inline-flex items-center gap-1.5 rounded-full pl-1 pr-3 h-8 text-[0.6875rem] font-semibold transition-all active:scale-[0.97] focus-ring disabled:opacity-50 disabled:cursor-default"
                          style={{ backgroundColor: theme.colors.surface, color: c.textPrimary, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.1)'}` }}
                          title={ct.title}
                        >
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[0.5625rem] font-bold flex-shrink-0" style={{ backgroundColor: `${c.accent}16`, color: c.accent }}>
                            {getInitials(ct.name)}
                          </span>
                          <span className="truncate max-w-[160px]">{ct.name}</span>
                          {added ? <Check className="w-3 h-3 flex-shrink-0" style={{ color: c.accent }} aria-hidden="true" /> : <Plus className="w-3 h-3 flex-shrink-0" style={{ opacity: 0.6 }} aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add someone else */}
          <div className="space-y-1.5">
            <span className={`${FIELD_LABEL_CLASS} block`} style={labelStyle}>Add someone else</span>
            <div className="flex items-center gap-2">
              <input
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newContactName.trim()) { addProjectContact(newContactName); setNewContactName(''); } }}
                className={`${TEXT_INPUT_CLASS} flex-1 min-w-0`}
                style={{ color: c.textPrimary, ...fieldSurface(theme) }}
                placeholder="Type a contact name"
              />
              <button
                type="button"
                onClick={() => { if (newContactName.trim()) { addProjectContact(newContactName); setNewContactName(''); } }}
                disabled={!newContactName.trim()}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 h-[44px] text-[0.75rem] font-semibold transition-all active:scale-[0.98] focus-ring disabled:opacity-40"
                style={{ backgroundColor: c.accent, color: c.accentText || '#FFFFFF' }}
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Add
              </button>
            </div>
            {(draft.dealers || []).length === 0 && (draft.designFirms || []).length === 0 ? (
              <p className="text-[0.6875rem]" style={{ color: c.textSecondary, opacity: 0.7 }}>
                Add a dealer or A&amp;D firm in Stakeholders to pull in their contacts automatically.
              </p>
            ) : null}
          </div>
        </div>
      </Modal>

      {/* QUOTES HUB MODAL */}
      <Modal show={hubModal === 'quotes'} onClose={() => setHubModal(null)} title="Quotes" theme={theme} maxWidth="max-w-lg">
        <QuoteTracker
          quotes={enrichedQuotes}
          theme={theme}
          onRequestQuote={() => { setHubModal(null); handleRequestQuote(); }}
        />
      </Modal>

      {/* SAMPLES HUB MODAL */}
      <Modal show={hubModal === 'samples'} onClose={() => setHubModal(null)} title="Sample Activity" theme={theme} maxWidth="max-w-lg">
        {relatedSampleOrders.length > 0 ? (
          <div className="space-y-2">
            {relatedSampleOrders.map((order) => {
              const meta = SAMPLE_STATUS_META[order.status] || SAMPLE_STATUS_META.processing;
              const StatusIcon = meta.icon;
              const totalItems = (order.items || []).reduce((sum, item) => sum + (item.qty || 0), 0);
              const primaryItemLabel = (order.items || [])[0]?.name || 'Sample order';
              const summaryBits = [
                order.id,
                `${totalItems} sample${totalItems === 1 ? '' : 's'}`,
                order.deliveredDate
                  ? `Delivered ${formatSampleOrderDate(order.deliveredDate)}`
                  : order.eta
                    ? `ETA ${formatSampleOrderDate(order.eta)}`
                    : `Ordered ${formatSampleOrderDate(order.date)}`,
              ];
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => { setHubModal(null); setSelectedSampleOrder(order); }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-left transition-all active:scale-[0.98] focus-ring"
                  style={fieldSurface(theme)}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}>
                    <StatusIcon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[0.8125rem] font-semibold truncate block" style={{ color: c.textPrimary }}>
                          {primaryItemLabel}{totalItems > 1 ? ` + ${totalItems - 1} more` : ''}
                        </span>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem]" style={{ color: c.textSecondary, opacity: 0.82 }}>
                          {summaryBits.map((bit) => <span key={bit}>{bit}</span>)}
                          <span>{order.shipTo || 'Ship to TBD'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5" style={{ color: c.textSecondary, opacity: 0.45 }} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[0.75rem]" style={{ color: c.textSecondary, opacity: 0.7 }}>No sample orders linked to this project.</p>
        )}
      </Modal>

      {/* RELATED ORDERS HUB MODAL */}
      <Modal show={hubModal === 'related-orders'} onClose={() => setHubModal(null)} title="Related Orders" theme={theme} maxWidth="max-w-lg">
        <div className="space-y-2">
          {relatedOrders.map((order) => {
            const sc = STATUS_COLORS[order.status] || '#8B8680';
            return (
              <div key={order.orderNumber} className="flex items-center gap-3 px-3.5 py-3 rounded-[24px]"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : insetBg(theme) }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sc }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.8125rem] font-semibold truncate" style={{ color: c.textPrimary }}>{order.details}</p>
                  <p className="mt-0.5 text-[0.6875rem]" style={{ color: c.textSecondary }}>
                    {order.orderNumber} · {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[0.8125rem] font-bold tabular-nums" style={{ color: c.textPrimary }}>
                    ${order.net.toLocaleString()}
                  </p>
                  <p className="text-[0.625rem] font-semibold mt-0.5" style={{ color: sc }}>{order.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* DOCUMENTS HUB MODAL */}
      <Modal show={hubModal === 'documents'} onClose={() => setHubModal(null)} title="Documents" theme={theme} maxWidth="max-w-lg">
        <div className="space-y-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2.5 py-3 px-3.5 transition-all hover:opacity-80 focus-ring"
            style={{ ...fieldSurface(theme), color: c.textSecondary }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.accent}14`, color: c.accent }}>
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[0.8125rem] font-semibold block" style={{ color: c.textPrimary }}>Upload files</span>
              <span className="text-[0.6875rem]" style={{ opacity: 0.65 }}>PDF, DOC, images and more</span>
            </div>
          </button>
          {(draft.documents || []).length > 0 ? (
            <div className="space-y-2">
              {(draft.documents || []).map(doc => (
                <div key={doc.id} className="group flex items-center gap-2.5 px-3.5 py-3 transition-colors"
                  style={fieldSurface(theme)}>
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: c.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.75rem] font-semibold truncate" style={{ color: c.textPrimary }}>{doc.fileName}</div>
                    <div className="text-[0.6875rem]" style={{ color: c.textSecondary, opacity: 0.65 }}>{doc.type} {'\u00b7'} {doc.size} {'\u00b7'} {doc.date}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-1.5 rounded-full focus-ring" style={{ color: c.textSecondary }} title="Preview" aria-label={`Preview ${doc.fileName}`}><Eye className="w-3.5 h-3.5" aria-hidden="true" /></button>
                    <button type="button" className="p-1.5 rounded-full focus-ring" style={{ color: c.textSecondary }} title="Download" aria-label={`Download ${doc.fileName}`}><Download className="w-3.5 h-3.5" aria-hidden="true" /></button>
                    <button type="button" onClick={() => update('documents', (draft.documents || []).filter(d => d.id !== doc.id))} className="p-1.5 rounded-full focus-ring" style={{ color: c.textSecondary }} title="Remove" aria-label={`Remove ${doc.fileName}`}><X className="w-3.5 h-3.5" aria-hidden="true" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[0.75rem] text-center py-2" style={{ color: c.textSecondary, opacity: 0.7 }}>No documents uploaded yet.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
