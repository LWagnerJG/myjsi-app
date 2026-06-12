import React, { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { ArrowUpRight, Check, ChevronDown, Upload, FileText, Eye, Send, Paperclip, Users, Clock, CheckCircle, AlertCircle, Loader2, Pencil, Share2, Download, Mail, MapPin, Package, Phone, Truck, ShoppingBag, X } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS, JSI_COLORS, sectionCardSurface, FIELD_LABEL_CLASSNAME } from '../../../../design-system/tokens.js';
import { formatCurrency } from '../../../../utils/format.js';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from '../../data.js';
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
import { ContactSearchSelector } from './ContactSearchSelector.jsx';
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

/* Shared surface values for every field-like control on this page. */
const FIELD_BG_LIGHT = 'rgba(240,237,232,0.5)';
const FIELD_BG_DARK = 'rgba(255,255,255,0.065)';
const CHIP_BG_LIGHT = 'rgba(240,237,232,0.62)';
const CHIP_BG_DARK = 'rgba(255,255,255,0.08)';
const CONTROL_RADIUS = '16px';
const FIELD_LABEL_CLASS = FIELD_LABEL_CLASSNAME;
const DETAIL_SECTION_TITLE_CLASS = 'text-[0.98rem] sm:text-[1.05rem] font-semibold tracking-[-0.02em] leading-none';
const DETAIL_SECTION_SUBTITLE_CLASS = 'mt-1 text-[0.6875rem] leading-snug';
const TEXT_INPUT_CLASS = 'w-full min-h-[44px] px-3.5 bg-transparent outline-none text-[0.875rem] font-medium focus-ring';

const fieldSurface = (isDark) => ({
  backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT,
  borderRadius: CONTROL_RADIUS,
});

const getSeriesLeadLabel = (series) => {
  if (QUICKSHIP_SERIES.includes(series)) return 'QS';
  const entries = LEAD_TIMES_DATA.filter(d => d.series === series);
  if (!entries.length) return null;
  const min = Math.min(...entries.map(d => d.weeks));
  return `${min}wk`;
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

/* ---- section primitives ---- */
const Section = ({ title, subtitle, children, theme, right }) => {
  const surface = sectionCardSurface(theme);
  return (
    <section className="p-4 sm:p-5" style={surface}>
      {title && (
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="min-w-0">
            <h2 className={DETAIL_SECTION_TITLE_CLASS} style={{ color: theme.colors.textPrimary }}>{title}</h2>
            {subtitle ? (
              <p className={DETAIL_SECTION_SUBTITLE_CLASS} style={{ color: theme.colors.textSecondary, opacity: 0.82 }}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {right ? <div className="flex-shrink-0 pt-0.5">{right}</div> : null}
        </div>
      )}
      {children}
    </section>
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
  const labelStyle = { color: theme.colors.textSecondary, opacity: 0.78 };
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

const CompactSelect = ({ id, options, value, onChange, theme, ariaLabel, surfaceStyle }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div className="relative">
      <select
        id={id}
        aria-label={ariaLabel}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent outline-none min-h-[44px] px-3.5 pr-9 text-[0.875rem] font-semibold focus-ring"
        style={{
          ...fieldSurface(isDark),
          color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
          ...surfaceStyle,
        }}
      >
        <option value="" disabled>Select</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 h-3.5 w-3.5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
    </div>
  );
};

/* Removable entity chip (dealers, A&D firms, series). */
const RemovableChip = ({ label, detail, onRemove, theme, size = 'default' }) => {
  const isDark = isDarkTheme(theme);
  const sizeClass = size === 'small'
    ? 'min-h-10 px-3.5 text-[0.75rem]'
    : 'min-h-[44px] px-4 text-[0.8125rem]';
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label}`}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full font-semibold transition-all active:scale-[0.97] focus-ring ${sizeClass}`}
      style={{ backgroundColor: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: theme.colors.textPrimary }}
    >
      <span className="truncate">{label}</span>
      {detail ? <span className="flex-shrink-0 text-[0.625rem] font-medium tabular-nums opacity-45">{detail}</span> : null}
      <X className="h-3 w-3 flex-shrink-0 opacity-40" aria-hidden="true" />
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
  const isDark = isDarkTheme(theme);
  return (
    <div className="inline-flex items-center gap-3 rounded-full py-1.5 pl-3.5 pr-1.5" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT }}>
      <div className="min-w-0">
        <span className="block text-[0.75rem] font-semibold leading-none" style={{ color: theme.colors.textPrimary }}>{label}</span>
        <span className="mt-1 block text-[0.625rem] font-medium leading-none tabular-nums" style={{ color: theme.colors.textSecondary, opacity: 0.72 }}>
          {sublabel}
        </span>
      </div>
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
    <div className="flex items-start gap-3 px-3.5 py-3" style={fieldSurface(isDark)}>
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
        <div className="px-4 py-3.5 rounded-[24px]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : FIELD_BG_LIGHT }}>
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
          <div className="px-3.5 py-3 rounded-[20px]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT }}>
            <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Ordered</span>
            <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{formatSampleOrderTimestamp(order.date)}</p>
          </div>
          <div className="px-3.5 py-3 rounded-[20px]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT }}>
            <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Fulfillment</span>
            <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{deliveryLabel}</p>
          </div>
          <div className="px-3.5 py-3 rounded-[20px]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT }}>
            <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Ship to</span>
            <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{order.shipTo || 'TBD'}</p>
          </div>
          <div className="px-3.5 py-3 rounded-[20px]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT }}>
            <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Requested by</span>
            <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{order.orderedBy?.name || 'Unknown'}</p>
          </div>
        </div>

        <div className="px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT }}>
          <div className="flex items-start gap-2.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: c.textSecondary, opacity: 0.55 }} />
            <div>
              <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Delivery address</span>
              <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: c.textPrimary }}>{order.address || 'Address pending'}</p>
            </div>
          </div>
        </div>

        {order.tracking ? (
          <div className="px-3.5 py-3 rounded-[24px]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT }}>
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
              <div key={`${item.code || item.name}-${index}`} className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-[20px]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT }}>
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

const DetailHubCard = ({ icon: Icon, title, count, summary, onClick, theme, accentColor }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const accent = accentColor || c.accent;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-1.5 py-2.5 text-left transition-all active:scale-[0.99] focus-ring rounded-[14px]"
      style={{
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.055)'}`,
      }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(53,53,53,0.045)', color: accent }}>
        <Icon className="w-3.5 h-3.5" strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[0.8125rem] font-semibold tracking-[-0.01em] truncate" style={{ color: c.textPrimary }}>{title}</span>
          {count != null ? (
            <span className="text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.055)', color: c.textSecondary }}>{count}</span>
          ) : null}
        </div>
        {summary ? (
          <p className="mt-0.5 text-[0.6875rem] truncate" style={{ color: c.textSecondary, opacity: 0.78 }}>{summary}</p>
        ) : null}
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.35 }} />
    </button>
  );
};

/* 
   MAIN COMPONENT
    */
export const OpportunityDetail = ({ opp, theme, onUpdate, members, currentUserId, sampleOrders = [], opportunities = [], customers = [], onOpenCustomer }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const listPriceId = useId();

  const [draft, setDraft] = useState(opp);
  const dirty = useRef(false);
  const saveRef = useRef(null);
  const draftRef = useRef(opp);
  const onUpdateRef = useRef(onUpdate);
  /* Rewards stay rule-driven until the user explicitly touches a toggle
     (tracked via the persisted `*Manual` flags so overrides survive saves). */
  const rewardAutoManagedRef = useRef({ salesReward: true, designerReward: true });
  useEffect(() => {
    setDraft(opp);
    rewardAutoManagedRef.current = {
      salesReward: opp.salesRewardManual !== true && opp.salesReward !== false,
      designerReward: opp.designerRewardManual !== true && opp.designerReward !== false,
    };
  }, [opp]);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  const update = useCallback((k, v) => {
    setDraft(p => { const n = { ...p, [k]: v }; dirty.current = true; return n; });
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
  const rewardDefaultOff = netValue > 0 && netValue < REWARD_AUTO_OFF_NET_LIMIT && discountPct >= REWARD_AUTO_OFF_DISCOUNT_MIN;
  const rewardDefaultValue = !rewardDefaultOff;
  const salesRewardEnabled = rewardAutoManagedRef.current.salesReward ? rewardDefaultValue : draft.salesReward !== false;
  const designerRewardEnabled = rewardAutoManagedRef.current.designerReward ? rewardDefaultValue : draft.designerReward !== false;
  const rewardsOn = salesRewardEnabled || designerRewardEnabled;
  const showSpiffWarning = isDiscount502010 && rewardsOn && rawNumeric > 0 && rawNumeric < SPIFF_502010_MIN_LIST;
  const currentProbability = typeof draft.winProbability === 'number' ? draft.winProbability : 0;

  useEffect(() => {
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
  const [selectedSampleOrder, setSelectedSampleOrder] = useState(null);
  const [hubModal, setHubModal] = useState(null); // 'quotes' | 'samples' | 'documents' | 'contacts' | 'related-orders' | null
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
  const heroDealers = (draft.dealers || []).filter(Boolean);
  const heroDealerLabel = heroDealers.length > 1 ? `${heroDealers[0]} +${heroDealers.length - 1}` : (heroDealers[0] || 'Not assigned');
  const discountSummaryLabel = discountCode || 'Select discount';
  const discountDetailLabel = discountPct > 0 ? `${formatPercentLabel(discountPct * 100)} off list` : 'Select pricing basis';
  const netValueLabel = rawNumeric > 0 ? formatCurrency(netValue) : '—';
  const netValueDetailLabel = rawNumeric > 0
    ? discountPct > 0
      ? 'Auto-calculated from list and discount'
      : 'Matches list until a discount is selected'
    : 'Enter list price to start';
  const rewardsDetailLabel = `Net below ${formatCurrency(REWARD_AUTO_OFF_NET_LIMIT)} with ${formatPercentLabel(REWARD_AUTO_OFF_DISCOUNT_MIN * 100)}+ discount starts rewards off.`;
  const customerConnectionLabel = draft.customerId
    ? 'Linked'
    : customerLinkSource === 'inferred'
      ? 'Matched'
      : 'Open';
  const heroPanelBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(240,237,232,0.22)';
  const heroControlSurface = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : c.surface,
  };

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ background: c.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-6 max-w-content mx-auto w-full space-y-3.5">

          {/* HERO — project identity + at-a-glance summary */}
          <div className="p-4 sm:p-5" style={sectionCardSurface(theme)}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center">
              <div className="min-w-0">
                <span className={`${FIELD_LABEL_CLASS} mb-1.5 block`} style={{ color: c.textSecondary, opacity: 0.78 }}>Project Name</span>
                <EditableIdentityField
                  value={draft.name}
                  onChange={v => update('name', v)}
                  ariaLabel="Project name"
                  placeholder="Project name"
                  theme={theme}
                  inputClass="project-display-title font-semibold tracking-[-0.035em]"
                  className="max-w-[34rem]"
                />
              </div>

              <div className="rounded-[20px] p-3.5 sm:p-4" style={{ backgroundColor: heroPanelBg }}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <span className={`${FIELD_LABEL_CLASS} mb-1.5 block`} style={{ color: c.textSecondary, opacity: 0.78 }}>Stage</span>
                    <CompactSelect
                      options={STAGES}
                      value={draft.stage}
                      onChange={v => update('stage', v)}
                      theme={theme}
                      ariaLabel="Project stage"
                      surfaceStyle={heroControlSurface}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className={`${FIELD_LABEL_CLASS} mb-1.5 block`} style={{ color: c.textSecondary, opacity: 0.78 }}>Dealer</span>
                    <p
                      className="flex min-h-[44px] items-center text-[0.875rem] font-semibold"
                      style={{ color: heroDealers.length ? c.textPrimary : c.textSecondary }}
                      title={heroDealers.join(', ') || undefined}
                    >
                      <span className="truncate">{heroDealerLabel}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.78 }}>Win Probability</span>
                    <span className="text-[0.8125rem] font-bold tabular-nums" style={{ color: c.textPrimary }}>{currentProbability}%</span>
                  </div>
                  <ProbabilitySlider value={currentProbability} onChange={v => update('winProbability', v)} theme={theme} showLabel={false} showValueBubble={false} compact />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)] xl:items-start">
            <div className="space-y-3.5 min-w-0">
              <Section title="Commercial" theme={theme}>
                <div className="rounded-[20px] overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(240,237,232,0.4)' }}>
                  <div className="grid sm:grid-cols-[minmax(0,0.95fr)_minmax(0,0.85fr)_minmax(0,1.05fr)]">
                    {/* List price — editable */}
                    <div className="min-w-0 px-4 py-3.5">
                      <label htmlFor={listPriceId} className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.78 }}>List Price</label>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span aria-hidden="true" className="text-[1rem] font-bold tracking-tight leading-none" style={{ color: c.textSecondary, opacity: 0.4 }}>$</span>
                        <input
                          id={listPriceId}
                          inputMode="numeric"
                          value={formatListPriceInput(draft.value)}
                          onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); update('value', val ? ('$' + parseInt(val, 10).toLocaleString()) : ''); }}
                          className="commercial-value-input w-full bg-transparent outline-none font-semibold tracking-[-0.03em] leading-none tabular-nums focus-ring rounded-md"
                          style={{ color: c.textPrimary }}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Discount — dropdown */}
                    <button
                      type="button"
                      ref={discBtn}
                      onClick={() => discountOpen ? setDiscountOpen(false) : openDiscount()}
                      aria-haspopup="listbox"
                      aria-expanded={discountOpen}
                      className="min-w-0 px-4 py-3.5 text-left transition-all active:scale-[0.99] focus-ring"
                      style={{
                        ...(discountOpen ? { boxShadow: `inset 0 0 0 1.5px ${c.accent}` } : {}),
                      }}
                    >
                      <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.78 }}>Discount</span>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[1.25rem] font-semibold tracking-[-0.02em] leading-none truncate" style={{ color: draft.discount ? c.textPrimary : c.textSecondary }}>
                          {discountSummaryLabel}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${discountOpen ? 'rotate-180' : ''}`} style={{ color: c.textSecondary, opacity: 0.5 }} aria-hidden="true" />
                      </div>
                      <p className="mt-1.5 text-[0.6875rem] font-medium leading-snug" style={{ color: c.textSecondary, opacity: 0.68 }}>
                        {discountDetailLabel}
                      </p>
                    </button>

                    {/* Net — calculated, distinguished by the Auto badge */}
                    <div className="min-w-0 px-4 py-3.5 sm:text-right">
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.78 }}>Net</span>
                        <span className="rounded-full px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-[0.08em]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(53,53,53,0.07)', color: c.textSecondary }}>
                          Auto
                        </span>
                      </div>
                      <p className="mt-2 text-[1.25rem] font-bold tracking-[-0.03em] leading-none tabular-nums" style={{ color: c.textPrimary }}>
                        {netValueLabel}
                      </p>
                      <p className="mt-1.5 text-[0.6875rem] font-medium leading-snug" style={{ color: c.textSecondary, opacity: 0.68 }}>
                        {netValueDetailLabel}
                      </p>
                    </div>
                  </div>

                  {/* Rewards — part of the same commercial summary */}
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.78 }}>Rewards</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <RewardTogglePill
                        label="Sales"
                        sublabel={salesRewardEnabled ? '3%' : 'Off'}
                        checked={salesRewardEnabled}
                        onChange={e => setRewardEnabled('salesReward', e.target.checked)}
                        theme={theme}
                      />
                      <RewardTogglePill
                        label="Designer"
                        sublabel={designerRewardEnabled ? '1%' : 'Off'}
                        checked={designerRewardEnabled}
                        onChange={e => setRewardEnabled('designerReward', e.target.checked)}
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>

                {rewardDefaultOff && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 mt-2.5 rounded-[16px]" style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.08)' : 'rgba(196,149,106,0.06)' }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.warning }} aria-hidden="true" />
                    <span className="text-[0.6875rem] font-medium" style={{ color: c.warning }}>{rewardsDetailLabel}</span>
                  </div>
                )}
                {showSpiffWarning && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 mt-2.5 rounded-[16px]" style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.08)' : 'rgba(196,149,106,0.06)' }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.warning }} aria-hidden="true" />
                    <span className="text-[0.6875rem] font-medium" style={{ color: c.warning }}>No spiff eligible: 50/20/10 with list value under $10K.</span>
                  </div>
                )}
              </Section>

              <Section title="Project Details" theme={theme}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Row label="Customer Account" theme={theme} className="sm:col-span-2">
                    {(id) => (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          id={id}
                          value={draft.company || ''}
                          onChange={e => update('company', e.target.value)}
                          className={`${TEXT_INPUT_CLASS} flex-1 min-w-[180px]`}
                          style={{ color: c.textPrimary, ...fieldSurface(isDark) }}
                          placeholder="Customer account name"
                        />
                        {customerConnectionLabel !== 'Open' ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold"
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
                          <span className="text-[0.6875rem] font-medium" style={{ color: c.textSecondary, opacity: 0.72 }}>{customerLocationLabel}</span>
                        ) : null}
                      </div>
                    )}
                  </Row>
                  <Row label="Vertical" theme={theme}>
                    {(id) => <CompactSelect id={id} options={VERTICALS} value={draft.vertical} onChange={v => update('vertical', v)} theme={theme} />}
                  </Row>
                  <Row label="PO Timeframe" theme={theme}>
                    {(id) => <CompactSelect id={id} options={PO_TIMEFRAMES} value={draft.poTimeframe} onChange={v => update('poTimeframe', v)} theme={theme} />}
                  </Row>
                  <Row label="Install Date" theme={theme}>
                    {(id) => (
                      <input id={id} type="date" value={draft.expectedInstallDate || ''} onChange={e => update('expectedInstallDate', e.target.value)}
                        className={TEXT_INPUT_CLASS} style={{ color: draft.expectedInstallDate ? c.textPrimary : c.textSecondary, ...fieldSurface(isDark) }} />
                    )}
                  </Row>
                  <Row label="Location" theme={theme}>
                    {(id) => (
                      <input id={id} value={draft.installationLocation || ''} onChange={e => update('installationLocation', e.target.value)}
                        className={TEXT_INPUT_CLASS} style={{ color: c.textPrimary, ...fieldSurface(isDark) }} placeholder="City, State" />
                    )}
                  </Row>
                  <Row label="Primary Contact" theme={theme}>
                    <ContactSearchSelector value={draft.contact || ''} onChange={v => update('contact', v)} dealers={draft.dealers || []} theme={theme} />
                  </Row>
                  <Row label="Bid Path" theme={theme}>
                    <div className="flex w-full min-h-[44px] items-center justify-between px-3.5 py-2" style={fieldSurface(isDark)}>
                      <span className="text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>Bid process</span>
                      <ToggleSwitch checked={!!draft.isBid} onChange={e => update('isBid', e.target.checked)} theme={theme} ariaLabel="Bid process" />
                    </div>
                  </Row>
                  <Row label="Dealer Partners" theme={theme} className="sm:col-span-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(draft.dealers || []).map(f => (
                        <RemovableChip key={f} label={f} onRemove={() => removeFrom('dealers', f)} theme={theme} />
                      ))}
                      <SuggestInputPill placeholder="Add dealer" suggestions={INITIAL_DEALERS} onAdd={v => addUnique('dealers', v)} theme={theme} />
                    </div>
                  </Row>
                  <Row label="A&D Firms" theme={theme} className="sm:col-span-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(draft.designFirms || []).map(f => (
                        <RemovableChip key={f} label={f} onRemove={() => removeFrom('designFirms', f)} theme={theme} />
                      ))}
                      <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v => addUnique('designFirms', v)} theme={theme} />
                    </div>
                  </Row>
                </div>
              </Section>

              <Section title="Specs & Competition" theme={theme}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Row label={`Specified Series (${(draft.products || []).length})`} theme={theme}>
                    <div className="flex flex-wrap gap-1.5">
                      {(draft.products || []).map(p => (
                        <RemovableChip
                          key={p.series}
                          label={p.series}
                          detail={getSeriesLeadLabel(p.series)}
                          onRemove={() => removeProductSeries(p.series)}
                          theme={theme}
                          size="small"
                        />
                      ))}
                      <SuggestInputPill placeholder="Add series..." suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
                    </div>
                  </Row>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.78 }}>Competition</span>
                      <label className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold cursor-pointer" style={{ color: c.textSecondary }}>
                        Present
                        <ToggleSwitch checked={draft.competitionPresent !== false} onChange={e => update('competitionPresent', e.target.checked)} theme={theme} ariaLabel="Competition present" />
                      </label>
                    </div>
                    {draft.competitionPresent !== false ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(draft.competitors || []).map(comp => (
                          <RemovableChip key={comp} label={comp} onRemove={() => toggleCompetitor(comp)} theme={theme} size="small" />
                        ))}
                        <SuggestInputPill placeholder="Add competitor..." suggestions={COMPETITORS.filter(x => x !== 'None')} onAdd={v => addUnique('competitors', v)} theme={theme} />
                      </div>
                    ) : (
                      <p className="flex min-h-10 items-center text-[0.75rem]" style={{ color: c.textSecondary, opacity: 0.65 }}>No competition noted</p>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Notes" theme={theme}>
                <textarea value={draft.notes || ''} onChange={e => update('notes', e.target.value)} rows={3}
                  aria-label="Project notes"
                  className="w-full resize-none p-3.5 text-[0.8125rem] leading-relaxed outline-none focus-ring"
                  style={{ ...fieldSurface(isDark), color: c.textPrimary }}
                  placeholder="Notes, constraints, next steps..." />
              </Section>
            </div>

            <div className="space-y-3.5 min-w-0">
              <Section title="Project Hub" theme={theme}>
                <div className="-mt-1">
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
            </div>
          </div>

          {/* AUTOSAVE */}
          <div className="flex justify-center pt-0.5 pb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: JSI_COLORS.success, opacity: 0.5 }} />
              <span className="text-[0.625rem] font-medium tracking-wide" style={{ color: c.textSecondary, opacity: 0.45 }}>Changes saved automatically</span>
            </div>
          </div>

        </div>
      </div>

      {/* discount dropdown */}
      {discountOpen && (
        <div ref={discMenu} role="listbox" aria-label="Discount options" className="fixed overflow-hidden"
          style={{ top: discPos.top, left: discPos.left, width: discPos.width, background: theme?.colors?.surface || (isDark ? '#2a2a2a' : '#fff'), boxShadow: DESIGN_TOKENS.shadows.modal, zIndex: DESIGN_TOKENS.zIndex.popover, borderRadius: '20px' }}>
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

          <div className="p-3.5 space-y-2" style={fieldSurface(isDark)}>
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

      {/* CONTACTS HUB MODAL */}
      <Modal show={hubModal === 'contacts'} onClose={() => setHubModal(null)} title="Project Contacts" theme={theme} maxWidth="max-w-lg">
        <div className="space-y-3.5">
          <div className="px-3.5 py-3" style={fieldSurface(isDark)}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <label htmlFor="opportunity-customer-link" className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Linked customer profile</label>
              {draft.customerId ? (
                <button type="button" onClick={() => update('customerId', null)} className="text-[0.6875rem] font-semibold focus-ring rounded-full" style={{ color: c.accent }}>
                  Clear link
                </button>
              ) : null}
            </div>
            <select id="opportunity-customer-link" value={draft.customerId ? String(draft.customerId) : ''} onChange={(event) => update('customerId', event.target.value || null)}
              className="w-full bg-transparent outline-none text-[0.8125rem] font-medium focus-ring rounded-md" style={{ color: c.textPrimary }}>
              <option value="">Select customer profile...</option>
              {(customers || []).map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
            <p className="mt-2 text-[0.6875rem] leading-snug" style={{ color: c.textSecondary, opacity: 0.78 }}>
              {draft.customerId
                ? 'This project is explicitly pinned to a customer profile.'
                : customerLinkSource === 'inferred'
                  ? 'A customer is matched from the project account. Lock it to keep contacts in sync.'
                  : 'Link a customer profile to surface contacts, rep context, and quick navigation.'}
            </p>
          </div>

          {projectContacts.length > 0 ? (
            <div className="space-y-2">
              {projectContacts.map((contact) => (
                <ContactSummaryCard key={`${contact.kind}-${contact.id}`} contact={contact} theme={theme} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3.5 py-3" style={fieldSurface(isDark)}>
              <Users className="w-4 h-4 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.45 }} />
              <span className="text-[0.75rem]" style={{ color: c.textSecondary }}>
                Add a primary contact or link a customer profile to surface project contacts here.
              </span>
            </div>
          )}
        </div>
      </Modal>

      {/* QUOTES HUB MODAL */}
      <Modal show={hubModal === 'quotes'} onClose={() => setHubModal(null)} title="Quotes" theme={theme} maxWidth="max-w-lg">
        <QuoteTracker
          quotes={enrichedQuotes}
          theme={theme}
          onRequestQuote={() => { setHubModal(null); setQuoteModalOpen(true); }}
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
                  style={fieldSurface(isDark)}
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
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : FIELD_BG_LIGHT }}>
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
            style={{ ...fieldSurface(isDark), color: c.textSecondary }}>
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
                  style={fieldSurface(isDark)}>
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
