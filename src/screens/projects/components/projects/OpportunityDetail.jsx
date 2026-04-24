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
  return (
    <div className="overflow-hidden" style={{ ...sectionCardSurface(theme), padding: '18px', borderRadius: SECTION_RADIUS }}>
      {title && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <span className={SECTION_TITLE_CLASSNAME} style={{ color: theme.colors.textPrimary }}>{title}</span>
            {subtitle ? (
              <p className="mt-1 text-[0.6875rem] leading-snug" style={{ color: theme.colors.textSecondary, opacity: 0.82 }}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {right ? <div className="flex-shrink-0 pt-0.5">{right}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
};

const Row = ({ label, children, theme, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-[0.75rem] font-semibold tracking-[-0.01em]" style={{ color: theme.colors.textSecondary, opacity: 0.9 }}>{label}</label>}
      <div className="flex-1 min-w-0 w-full">{children}</div>
    </div>
  );
};

const PillSelect = ({ options, value, onChange, theme }) => {
  const isDark = isDarkTheme(theme);
  const chipBg = isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = opt === value;
        return (
          <button key={opt} onClick={() => onChange(opt)} className="px-3.5 py-2 rounded-full text-[0.75rem] font-semibold transition-all active:scale-[0.97]"
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
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = value.includes(opt);
        return (
          <button key={opt} onClick={() => onToggle(opt)} className="px-3.5 py-2 rounded-full text-[0.75rem] font-semibold transition-all active:scale-[0.97]"
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
      className="w-full flex items-center gap-3 px-3.5 py-3 text-left transition-all hover:-translate-y-px active:scale-[0.99]"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : FIELD_BG_LIGHT,
        borderRadius: CONTROL_RADIUS,
      }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}16`, color: accent }}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[0.875rem] font-semibold tracking-[-0.01em] truncate" style={{ color: c.textPrimary }}>{title}</span>
          {count != null ? (
            <span className="text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${accent}16`, color: accent }}>{count}</span>
          ) : null}
        </div>
        {summary ? (
          <p className="mt-0.5 text-[0.6875rem] truncate" style={{ color: c.textSecondary }}>{summary}</p>
        ) : null}
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.45 }} />
    </button>
  );
};

/* 
   MAIN COMPONENT
    */
export const OpportunityDetail = ({ opp, theme, onUpdate, members, currentUserId, sampleOrders = [], opportunities = [], customers = [], onOpenCustomer }) => {
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
  const [selectedSampleOrder, setSelectedSampleOrder] = useState(null);
  const [hubModal, setHubModal] = useState(null); // 'quotes' | 'samples' | 'documents' | 'contacts' | null
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
  const locationSummary = draft.installationLocation || customerLocationLabel || 'Location pending';
  const stagePositionLabel = `${Math.min(currentStageIndex + 1, STAGES.length)} / ${STAGES.length}`;
  const heroInsetStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(240,237,232,0.78)',
    borderRadius: '28px',
  };
  const customerConnectionLabel = draft.customerId
    ? 'Linked'
    : customerLinkSource === 'inferred'
      ? 'Matched'
      : 'Open';
  return (
    <div className="flex flex-col h-full app-header-offset" style={{ background: c.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-6 max-w-content mx-auto w-full space-y-3.5">

          {/* HERO */}
          <div className="rounded-[32px] p-5 sm:p-6 space-y-4" style={{ ...sectionCardSurface(theme), borderRadius: '32px' }}>
            <div className="space-y-3">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold" style={{ backgroundColor: `${c.accent}14`, color: c.accent }}>
                    {draft.stage}
                  </span>
                  {draft.vertical ? (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(240,237,232,0.9)', color: c.textSecondary }}>
                      {draft.vertical}
                    </span>
                  ) : null}
                  {draft.poTimeframe ? (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(240,237,232,0.9)', color: c.textSecondary }}>
                      {draft.poTimeframe}
                    </span>
                  ) : null}
                  {linkedCustomer ? (
                    <button type="button" onClick={openLinkedCustomer} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-semibold transition-all active:scale-[0.98]"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)', color: c.textPrimary }}>
                      <Building2 className="w-3 h-3" style={{ color: c.accent }} />
                      {customerLinkSource === 'explicit' ? 'Customer profile' : 'Matched customer'}
                      <ArrowUpRight className="w-3 h-3" style={{ color: c.textSecondary, opacity: 0.6 }} />
                    </button>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <input value={draft.name || ''} onChange={e => update('name', e.target.value)}
                    className="w-full bg-transparent outline-none text-[2rem] sm:text-[2.35rem] font-semibold tracking-[-0.03em] leading-[0.98]" style={{ color: c.textPrimary }} placeholder="Project name" />
                  <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent, opacity: 0.5 }} />
                    <input value={draft.company || ''} onChange={e => update('company', e.target.value)}
                      className="bg-transparent outline-none text-[0.8125rem] font-medium flex-1 min-w-[220px]" style={{ color: c.textSecondary }} placeholder="Customer account / End user" />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3.5" style={heroInsetStyle}>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-[0.6875rem] font-semibold tracking-[-0.01em]" style={{ color: c.textSecondary, opacity: 0.85 }}>Stage Progress</span>
                <span className="text-[0.625rem] font-semibold" style={{ color: c.textSecondary }}>{stagePositionLabel}</span>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex items-start gap-1.5 sm:gap-2 w-full min-w-[560px]">
                  {STAGES.map((stage, stageIndex) => {
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
                          className="flex-1 min-w-0 flex flex-col items-center gap-1.5 rounded-[20px] px-2 py-1.5 sm:px-2.5 text-center transition-all active:scale-[0.98]"
                          style={{
                            backgroundColor: active ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(227,224,216,0.66)') : 'transparent',
                          }}
                        >
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5625rem] font-bold flex-shrink-0"
                            style={{
                              backgroundColor: circleBg,
                              border: `1px solid ${circleBorder}`,
                              color: active ? c.accentText : (complete ? c.textPrimary : c.textSecondary),
                            }}
                          >
                            {stepToken}
                          </span>
                          <span
                            className="text-[0.625rem] sm:text-[0.6875rem] font-semibold leading-[1.05] whitespace-normal break-words text-center"
                            style={{ color: labelColor, opacity: active ? 1 : (complete ? 0.82 : 0.68) }}
                          >
                            {stage}
                          </span>
                        </button>
                        {stageIndex < STAGES.length - 1 && (
                          <div aria-hidden="true" className="flex-[0.22_1_0%] min-w-[14px] pt-[10px]">
                            <div
                              className="h-px w-full rounded-full"
                              style={{
                                backgroundColor: connectorComplete ? c.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(227,224,216,1)'),
                                opacity: connectorComplete ? 0.65 : 1,
                              }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)'}` }}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[0.6875rem] font-semibold tracking-[-0.01em]" style={{ color: c.textSecondary, opacity: 0.85 }}>Win Probability</span>
                  <span className="text-[0.6875rem] font-bold tabular-nums" style={{ color: c.textPrimary }}>{draft.winProbability || 0}%</span>
                </div>
                <ProbabilitySlider value={draft.winProbability || 0} onChange={v => update('winProbability', v)} theme={theme} showLabel={false} />
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)] xl:items-start">
            <div className="space-y-3.5 min-w-0">
              <Section title="Commercial" subtitle="Pricing basis, discounting, and reward settings" theme={theme}>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="px-3.5 py-3.5 sm:col-span-2 lg:col-span-2" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>List Value</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-bold tracking-tight leading-none" style={{ color: c.textSecondary, opacity: 0.25 }}>$</span>
                      <input inputMode="numeric"
                        value={(() => { const raw = ('' + (draft.value || '')).replace(/[^0-9]/g, ''); return raw ? parseInt(raw, 10).toLocaleString() : ''; })()}
                        onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); update('value', val ? ('$' + parseInt(val, 10).toLocaleString()) : ''); }}
                        className="bg-transparent outline-none text-[1.5rem] font-bold tracking-tight w-full leading-none" style={{ color: c.textPrimary }} placeholder="0" />
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold whitespace-nowrap"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)', color: c.textSecondary }}>
                    {draft.discount || 'No discount'}
                  </span>
                </div>
              </div>

              <button type="button" className="h-full px-3.5 py-3.5 text-left transition-all active:scale-[0.99]" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }} onClick={() => discountOpen ? setDiscountOpen(false) : openDiscount()} ref={discBtn}>
                <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>Discount</span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-[0.9375rem] font-bold tracking-tight truncate" style={{ color: c.textPrimary }}>{draft.discount || '\u2014'}</span>
                  <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.4 }} />
                </div>
                <p className="mt-1 text-[0.625rem] leading-snug" style={{ color: c.textSecondary, opacity: 0.72 }}>Pricing basis</p>
              </button>

              <div className="px-3.5 py-3.5 h-full" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>Net Value</span>
                <span className="mt-1 block text-[1.125rem] font-bold tracking-tight leading-none" style={{ color: c.textPrimary }}>{netValue > 0 && discountPct > 0 ? formatCurrency(netValue) : '\u2014'}</span>
                <p className="mt-1 text-[0.625rem] leading-snug" style={{ color: c.textSecondary, opacity: 0.72 }}>
                  {discountPct > 0 ? `${Math.round(discountPct * 100)}% off list` : 'Awaiting discount'}
                </p>
              </div>

              <div className="px-3.5 py-3.5 flex items-center justify-between" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                <div>
                  <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>Sales Reward</span>
                  <span className="mt-1 block text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>{draft.salesReward !== false ? 'Enabled' : 'Off'}</span>
                </div>
                <ToggleSwitch checked={draft.salesReward !== false} onChange={e => update('salesReward', e.target.checked)} theme={theme} />
              </div>

              <div className="px-3.5 py-3.5 flex items-center justify-between" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                <div>
                  <span className={`${FIELD_LABEL_CLASS} block`} style={{ color: c.textSecondary, opacity: 0.84 }}>Designer Reward</span>
                  <span className="mt-1 block text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>{draft.designerReward !== false ? 'Enabled' : 'Off'}</span>
                </div>
                <ToggleSwitch checked={draft.designerReward !== false} onChange={e => update('designerReward', e.target.checked)} theme={theme} />
              </div>

            </div>
            {showSpiffWarning && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 mt-2" style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.08)' : 'rgba(196,149,106,0.06)', borderRadius: '22px' }}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.warning }} />
                <span className="text-[0.6875rem] font-medium" style={{ color: theme.colors.warning }}>No spiff eligible: 50/20/10 with list value under $10K.</span>
              </div>
            )}
              </Section>

              <Section title="Project Profile" subtitle="Scope, schedule, and install intent" theme={theme}>
                <div className="grid gap-3.5 xl:grid-cols-2">
                  <Row label="Vertical" theme={theme}>
                    <PillSelect options={VERTICALS.filter(v => v !== 'Other (Please specify)')} value={draft.vertical} onChange={v => update('vertical', v)} theme={theme} />
                  </Row>
                  <Row label="PO Timeframe" theme={theme}>
                    <PillSelect options={PO_TIMEFRAMES} value={draft.poTimeframe} onChange={v => update('poTimeframe', v)} theme={theme} />
                  </Row>
                  <Row label="Install Date" theme={theme}>
                    <input type="date" value={draft.expectedInstallDate || ''} onChange={e => update('expectedInstallDate', e.target.value)}
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-[0.9375rem] font-medium" style={{ color: c.textPrimary, backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }} />
                  </Row>
                  <Row label="Location" theme={theme}>
                    <input value={draft.installationLocation || ''} onChange={e => update('installationLocation', e.target.value)}
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-[0.9375rem] font-medium" style={{ color: c.textPrimary, backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }} placeholder="City, State" />
                  </Row>
                  <Row label="Bid Path" theme={theme}>
                    <div className="w-full px-4 py-3.5 flex items-center justify-between" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                      <span className="text-[0.875rem] font-medium" style={{ color: c.textPrimary }}>Include in bid process</span>
                      <ToggleSwitch checked={!!draft.isBid} onChange={e => update('isBid', e.target.checked)} theme={theme} />
                    </div>
                  </Row>
                </div>
              </Section>

              <Section title="Project Team" subtitle="Core contacts, dealer partners, and A&D firms" theme={theme}>
                <div className="grid gap-3.5 xl:grid-cols-2">
                  <Row label="Primary Contact" theme={theme}>
                    <ContactSearchSelector value={draft.contact || ''} onChange={v => update('contact', v)} dealers={draft.dealers || []} theme={theme} />
                  </Row>
                  <Row label="Customer Account" theme={theme}>
                    <input value={draft.endUser || draft.company || ''} onChange={e => update('endUser', e.target.value)}
                      className="w-full px-4 py-3.5 bg-transparent outline-none text-[0.9375rem] font-medium" style={{ color: c.textPrimary, backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }} placeholder="Customer account name" />
                  </Row>
                  <Row label="Dealer Partners" theme={theme}>
                    <div className="flex flex-wrap gap-2">
                      {(draft.dealers || []).map(f => (
                        <button key={f} onClick={() => removeFrom('dealers', f)} className="px-3.5 py-2 rounded-full text-[0.75rem] font-semibold flex items-center gap-1.5 transition-all"
                          style={{ background: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: c.textPrimary }}>{f}<span className="opacity-40 text-[0.6875rem]">{'×'}</span></button>
                      ))}
                      <SuggestInputPill placeholder="Add dealer" suggestions={INITIAL_DEALERS} onAdd={v => addUnique('dealers', v)} theme={theme} />
                    </div>
                  </Row>
                  <Row label="A&D Firms" theme={theme}>
                    <div className="flex flex-wrap gap-2">
                      {(draft.designFirms || []).map(f => (
                        <button key={f} onClick={() => removeFrom('designFirms', f)} className="px-3.5 py-2 rounded-full text-[0.75rem] font-semibold flex items-center gap-1.5 transition-all"
                          style={{ background: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: c.textPrimary }}>{f}<span className="opacity-40 text-[0.6875rem]">{'×'}</span></button>
                      ))}
                      <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v => addUnique('designFirms', v)} theme={theme} />
                    </div>
                  </Row>
                </div>
              </Section>

              <Section title="Specs & Competition" subtitle="Series in consideration and competitive pressure" theme={theme}>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.75rem] font-semibold tracking-[-0.01em]" style={{ color: c.textPrimary }}>Specified Series</span>
                      <span className="text-[0.625rem] font-semibold" style={{ color: c.textSecondary }}>{(draft.products || []).length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(draft.products || []).map(p => (
                        <button key={p.series} onClick={() => removeProductSeries(p.series)} className="px-3.5 py-2 rounded-full text-[0.75rem] font-semibold flex items-center gap-1.5 transition-all"
                          style={{ background: isDark ? CHIP_BG_DARK : CHIP_BG_LIGHT, color: c.textPrimary }}>{p.series}<span className="opacity-40 text-[0.6875rem]">{'×'}</span></button>
                      ))}
                      <SuggestInputPill placeholder="Add series..." suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.75rem] font-semibold tracking-[-0.01em]" style={{ color: c.textPrimary }}>Competition</span>
                      <ToggleSwitch checked={draft.competitionPresent !== false} onChange={e => update('competitionPresent', e.target.checked)} theme={theme} />
                    </div>
                    {draft.competitionPresent !== false ? (
                      <MultiPillSelect options={COMPETITORS.filter(x => x !== 'None')} value={draft.competitors || []} onToggle={toggleCompetitor} theme={theme} />
                    ) : (
                      <p className="text-[0.75rem]" style={{ color: c.textSecondary, opacity: 0.65 }}>No competition noted</p>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Notes" subtitle="Working context, constraints, and next steps" theme={theme}>
                <textarea value={draft.notes || ''} onChange={e => update('notes', e.target.value)} rows={4}
                  className="w-full resize-none p-3.5 text-[0.75rem] leading-relaxed outline-none"
                  style={{ background: isDark ? 'rgba(255,255,255,0.06)' : FIELD_BG_LIGHT, color: c.textPrimary, borderRadius: CONTROL_RADIUS }}
                  placeholder="Add project notes, context, or special instructions..." />
              </Section>
            </div>

            <div className="space-y-3.5 min-w-0">
              <Section
                title="Account"
                subtitle="Customer record linked to this project"
                theme={theme}
                right={
                  <span className="text-[0.625rem] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: draft.customerId ? `${c.accent}14` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.06)'), color: draft.customerId ? c.accent : c.textSecondary }}>
                    {customerConnectionLabel}
                  </span>
                }
              >
                <button
                  type="button"
                  onClick={linkedCustomer ? openLinkedCustomer : () => setHubModal('contacts')}
                  className="w-full flex items-start gap-3 px-3.5 py-3 text-left transition-all hover:-translate-y-px active:scale-[0.99]"
                  style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.accent}14`, color: c.accent }}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.9375rem] font-semibold leading-tight truncate" style={{ color: c.textPrimary }}>{displayCustomerName}</p>
                    <p className="mt-1 text-[0.6875rem] leading-tight truncate" style={{ color: c.textSecondary }}>{customerLocationLabel || customerLinkStatus}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: c.textSecondary, opacity: 0.5 }} />
                </button>
              </Section>

              <Section title="Project Hub" subtitle="Tap any card to view full details" theme={theme}>
                <div className="space-y-2">
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
                </div>
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
          <div className="px-3.5 py-3" style={{ backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={FIELD_LABEL_CLASS} style={{ color: c.textSecondary, opacity: 0.84 }}>Linked customer profile</span>
              {draft.customerId ? (
                <button type="button" onClick={() => update('customerId', null)} className="text-[0.6875rem] font-semibold" style={{ color: c.accent }}>
                  Clear link
                </button>
              ) : null}
            </div>
            <select value={draft.customerId ? String(draft.customerId) : ''} onChange={(event) => update('customerId', event.target.value || null)}
              className="w-full bg-transparent outline-none text-[0.8125rem] font-medium" style={{ color: c.textPrimary }}>
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
            <div className="flex items-center gap-2.5 px-3.5 py-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
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
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-left transition-all active:scale-[0.98]"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}
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

      {/* DOCUMENTS HUB MODAL */}
      <Modal show={hubModal === 'documents'} onClose={() => setHubModal(null)} title="Documents" theme={theme} maxWidth="max-w-lg">
        <div className="space-y-3">
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2.5 py-3 px-3.5 transition-all hover:opacity-80"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : FIELD_BG_LIGHT, color: c.textSecondary, borderRadius: CONTROL_RADIUS }}>
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
                  style={{ background: isDark ? 'rgba(255,255,255,0.06)' : FIELD_BG_LIGHT, borderRadius: CONTROL_RADIUS }}>
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: c.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.75rem] font-semibold truncate" style={{ color: c.textPrimary }}>{doc.fileName}</div>
                    <div className="text-[0.6875rem]" style={{ color: c.textSecondary, opacity: 0.65 }}>{doc.type} {'\u00b7'} {doc.size} {'\u00b7'} {doc.date}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-full" style={{ color: c.textSecondary }} title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-full" style={{ color: c.textSecondary }} title="Download"><Download className="w-3.5 h-3.5" /></button>
                    <button onClick={() => update('documents', (draft.documents || []).filter(d => d.id !== doc.id))} className="p-1.5 rounded-full" style={{ color: c.textSecondary }} title="Remove"><span className="text-[0.875rem] leading-none">{'\u00d7'}</span></button>
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
