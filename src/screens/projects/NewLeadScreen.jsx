import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, FileText, MapPin, UploadCloud, X } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput.jsx';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { SpotlightMultiSelect } from '../../components/common/SpotlightMultiSelect.jsx';
import { WizardBottomBar } from '../../components/common/WizardBottomBar.jsx';
import { PillButton, PrimaryButton } from '../../components/common/JSIButtons.jsx';
import SwipeCalendar from '../../components/common/SwipeCalendar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { hapticSuccess } from '../../utils/haptics.js';
import { formatDate } from '../../utils/format.js';
import { STAGES, VERTICALS, COMPETITORS, PO_TIMEFRAMES } from './data.js';
import { DISCOUNT_OPTIONS_WITH_UNKNOWN } from '../../constants/discounts.js';
import { CITY_OPTIONS } from '../../constants/locations.js';
import { JSI_SERIES } from '../products/data.js';
import { CONTRACTS_DATA } from '../resources/contracts/data.js';
import { ProductCard, ProductSpotlight, ProjectSpotlight, Reveal, Row, Section, SpecifierPicker, buildSpecifierOptions, getDefaultSpecifierOption, isSpecifierCandidate } from './NewLeadScreenComponents.jsx';

const WIN_PRESETS = [10, 25, 50, 75, 90];
const WIN_MIN = 5;
const WIN_MAX = 100;
const getWinSliderFillPercent = (value) => {
  const clamped = Math.max(WIN_MIN, Math.min(WIN_MAX, Number(value) || WIN_MIN));
  return ((clamped - WIN_MIN) / (WIN_MAX - WIN_MIN)) * 100;
};
const getWinBand = (pct) => {
  if (pct <= 15) return { label: 'Unlikely', tone: '#B85C5C' };
  if (pct <= 35) return { label: 'Possible', tone: '#C4956A' };
  if (pct <= 55) return { label: 'Even Odds', tone: '#5B7B8C' };
  if (pct <= 75) return { label: 'Likely', tone: '#4A7C59' };
  return { label: 'Strong', tone: '#4A7C59' };
};

const getPoDateLabel = (option) => {
  if (!option || option === 'Unknown') return null;
  const now = new Date();
  const fmt = (d) => formatDate(d, { month: 'short', day: 'numeric', year: 'numeric' });
  const addDays = (n) => { const r = new Date(now); r.setDate(r.getDate() + n); return r; };
  if (option === 'Within 30 Days') return `By ${fmt(addDays(30))}`;
  if (option === '30-60 Days') return `${fmt(addDays(30))} – ${fmt(addDays(60))}`;
  if (option === '60-180 Days') return `${fmt(addDays(60))} – ${fmt(addDays(180))}`;
  if (option === '180+ Days') return `After ${fmt(addDays(180))}`;
  if (option === 'Next Year') return `Jan – Dec ${now.getFullYear() + 1}`;
  return null;
};


const END_USER_OPTIONS = [
  'Unknown',
  'ABC Corporation', 'GlobalTech', 'Midwest Health', 'State University', 'Metro Hospitality',
  'Innovate Labs', 'XYZ Industries', 'Acme Corp', 'TechVentures', 'Summit Partners',
];

const FILE_LIMIT = 10;
const FILE_MAX_SIZE = 20 * 1024 * 1024;
const FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'heic'];
const FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.heic';
const STEP_LABELS = ['Basics', 'Scope', 'Review'];
const NEW_LEAD_MAX_WIDTH = 'max-w-2xl';
const getSubtleBorder = (theme) => (isDarkTheme(theme) ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)');

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


const parseCurrency = (raw) => {
  const n = Number(String(raw ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const normalizeText = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const toStep1Percent = (ratio) => {
  const raw = Number.isFinite(ratio) ? ratio * 100 : 0;
  const rounded = Math.round(raw);
  return Math.max(0, Math.min(100, rounded));
};

const parseDiscountPercent = (value) => {
  const match = String(value || '').match(/\((\d+(?:\.\d+)?)%\)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const mergeUnique = (...lists) => {
  const seen = new Set();
  return lists
    .flat()
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter((item) => {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const getSeriesProcurementPrompts = (series) => {
  const name = String(series || '').toLowerCase();
  const isWorksurface = /(table|desk|bench|case|storage|training|conference|lok|native|poet|indie|vision|knox|wink|hoopz)/.test(name);
  if (isWorksurface) {
    return {
      first: {
        label: 'Power / Data',
        key: 'procurementCheckpoint',
        placeholder: 'Unknown',
        options: ['Unknown', 'Defined', 'Likely Needed', 'Not Needed'],
      },
      second: {
        label: 'Finish Readiness',
        key: 'productionReadiness',
        placeholder: 'Unknown',
        options: ['Unknown', 'Standard Finishes Finalized', 'Custom Finish Pending', 'Needs Design Review'],
      },
    };
  }
  return {
    first: {
      label: 'Upholstery / Textile',
      key: 'procurementCheckpoint',
      placeholder: 'Unknown',
      options: ['Unknown', 'Grade Selected', 'COM/COL Required', 'Needs Dealer Input'],
    },
    second: {
      label: 'Production Priority',
      key: 'productionReadiness',
      placeholder: 'Unknown',
      options: ['Unknown', 'Standard Lead Time', 'Expedite Request', 'Phased Delivery'],
    },
  };
};

const getHealthBand = (ratio) => {
  if (ratio < 0.35) return { label: 'At Risk', tone: 'var(--theme-error)', step: 1 };
  if (ratio < 0.6) return { label: 'Developing', tone: 'var(--theme-warning)', step: 2 };
  if (ratio < 0.85) return { label: 'Strong', tone: 'var(--theme-info)', step: 3 };
  return { label: 'Ready', tone: 'var(--theme-success)', step: 4 };
};

const FieldError = ({ show, message }) => {
  if (!show || !message) return null;
  return <p className="nl-field-error text-xs mt-1.5" style={{ color: 'var(--theme-error)' }}>{message}</p>;
};

const QuickPickButton = ({ active = false, disabled = false, theme, children, icon, className = '', ...props }) => {
  const c = theme.colors;
  const subtleBorder = getSubtleBorder(theme);
  return (
    <button
      type="button"
      disabled={disabled}
      className={`shrink-0 h-10 rounded-full border px-4 text-xs font-semibold transition-all flex items-center gap-1 ${className}`}
      style={{
        borderColor: active ? c.accent : subtleBorder,
        color: active ? c.accent : c.textSecondary,
        backgroundColor: active ? `${c.accent}12` : 'transparent',
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

const StakeholderCollapsedPill = ({ label, hint, onExpand, theme }) => {
  const c = theme.colors;
  return (
    <button
      type="button"
      onClick={onExpand}
      className="w-full h-10 rounded-full border flex items-center justify-between px-4 transition-colors"
      style={{ borderColor: c.accent, backgroundColor: `${c.accent}12`, color: c.textPrimary }}
    >
      <span className="text-sm font-medium" style={{ color: c.accent }}>{label}</span>
      <span className="text-xs" style={{ color: c.textSecondary, opacity: 0.55 }}>{hint}</span>
    </button>
  );
};

const getRealDealers = (dealers = []) => (dealers || []).filter((dealer) => String(dealer).trim().toLowerCase() !== 'out to bid');
const getRealDesignFirms = (firms = []) => (firms || []).filter((firm) => String(firm).trim().toLowerCase() !== 'unknown');
const getRealCompetitors = (competitors = []) => (competitors || []).filter((name) => String(name).trim().toLowerCase() !== 'unknown');
const getRealEndUser = (endUser = '') => {
  const trimmed = String(endUser || '').trim();
  return trimmed.toLowerCase() === 'unknown' ? '' : trimmed;
};
const isUnknownStakeholderValue = (value) => String(value || '').trim().toLowerCase() === 'unknown';

// Inline label + toggle pair, keeping every switch in the flow visually identical.
const ToggleField = ({ label, checked, onChange, theme }) => {
  const c = theme.colors;
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs font-medium" style={{ color: checked ? c.textPrimary : c.textSecondary }}>{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} theme={theme} />
    </div>
  );
};

const RewardTogglePill = ({ label, sublabel, checked, onChange, theme }) => {
  const c = theme.colors;
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="text-xs font-medium tabular-nums"
        style={{ color: checked ? c.textPrimary : c.textSecondary, opacity: checked ? 1 : 0.65 }}
      >
        {label} {sublabel}
      </span>
      <ToggleSwitch checked={checked} onChange={onChange} theme={theme} ariaLabel={`${label} reward`} />
    </div>
  );
};

const StrengthCircle = ({ percent, tone, size = 44, stroke = 4, textSize = '11px' }) => {
  const normalized = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="opacity-15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 240ms ease' }}
        />
      </svg>
      <span className="absolute font-semibold" style={{ fontSize: textSize, color: tone }}>
        {normalized}
      </span>
    </div>
  );
};

const InlineStepHealth = ({ health, theme }) => {
  const c = theme.colors;
  const dark = isDarkTheme(theme);
  const subtleBorder = getSubtleBorder(theme);
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border pl-1.5 pr-2.5 py-1"
      style={{ borderColor: subtleBorder, backgroundColor: dark ? c.background : c.surface }}
    >
      <StrengthCircle percent={health.percent} tone={health.tone} size={30} stroke={3} textSize="10px" />
      <span className="text-xs font-semibold" style={{ color: health.tone }}>
        {health.label}
      </span>
    </div>
  );
};

const DatePickerInput = ({ value, onChange, theme, placeholder = 'Select date' }) => {
  const dark = isDarkTheme(theme);
  const c = theme.colors;
  const subtleBorder = getSubtleBorder(theme);
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const wrapperRef = useRef(null);
  const parsed = value ? new Date(value + 'T00:00:00') : null;

  // Flip calendar above trigger when there isn't enough space below.
  const calcDropUp = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const chrome = document.querySelector('[data-bottom-chrome]');
    const bottomOccupied = chrome ? (window.innerHeight - chrome.getBoundingClientRect().top) : 0;
    setDropUp(window.innerHeight - rect.bottom - bottomOccupied < 380);
  };
  useLayoutEffect(() => { if (isOpen) calcDropUp(); }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('resize', calcDropUp);
    return () => window.removeEventListener('resize', calcDropUp);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close, { passive: true });
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [isOpen]);

  const displayText = parsed
    ? `${MONTHS_LONG[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`
    : null;

  const handleSelect = useCallback((date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onChange(`${date.getFullYear()}-${mm}-${dd}`);
    setIsOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full h-10 rounded-full border flex items-center justify-between px-4 text-sm focus:outline-none transition-colors"
        style={{
          backgroundColor: dark ? c.background : c.surface,
          borderColor: isOpen ? c.accent : subtleBorder,
          color: displayText ? c.textPrimary : c.textSecondary,
          boxShadow: isOpen ? `0 0 0 3px ${c.accent}18` : 'none',
        }}
      >
        <span>{displayText || placeholder}</span>
        <CalendarDays className="w-4 h-4 shrink-0" style={{ color: c.textSecondary }} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 z-50 rounded-2xl border overflow-hidden"
          style={{
            ...(dropUp ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
            backgroundColor: c.surface,
            borderColor: subtleBorder,
            boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 24px rgba(0,0,0,0.11)',
          }}
        >
          <SwipeCalendar
            theme={theme}
            selected={parsed}
            onSelect={handleSelect}
            showFooter
            onClear={handleClear}
          />
        </div>
      )}
    </div>
  );
};

export const NewLeadScreen = ({
  theme,
  onNavigate,
  onSuccess,
  designFirms,
  setDesignFirms,
  dealers,
  setDealers,
  opportunities = [],
  newLeadData = {},
  onNewLeadChange,
  setBackHandler,
}) => {
  const c = theme.colors;
  const dark = isDarkTheme(theme);
  const subtleBorder = getSubtleBorder(theme);
  const prefersReducedMotion = usePrefersReducedMotion();
  const stageOptions = useMemo(() => STAGES.filter((stage) => stage !== 'Won' && stage !== 'Lost'), []);

  const [step, setStep] = useState(0);
  const [stepAnimClass, setStepAnimClass] = useState('');
  const prevStepRef = useRef(0);

  const animateToStep = useCallback((nextStep) => {
    const dir = prefersReducedMotion ? '' : (nextStep > prevStepRef.current ? 'nl-fwd' : 'nl-back');
    prevStepRef.current = nextStep;
    setStepAnimClass(dir);
    setStep(nextStep);
  }, [prefersReducedMotion]);

  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileNotice, setFileNotice] = useState('');
  // Location/date "Unknown" collapsed state — show input only when user explicitly opens it
  const [locationInputOpen, setLocationInputOpen] = useState(() => !!newLeadData.installationLocation);
  const [dateInputOpen, setDateInputOpen] = useState(() => !!newLeadData.expectedInstallDate);
  const [dealerFieldExpanded, setDealerFieldExpanded] = useState(() => getRealDealers(newLeadData.dealers).length > 0);
  const [designFirmFieldExpanded, setDesignFirmFieldExpanded] = useState(() => getRealDesignFirms(newLeadData.designFirms).length > 0);
  const [endUserFieldExpanded, setEndUserFieldExpanded] = useState(() => !!getRealEndUser(newLeadData.endUser));
  const [competitionFieldExpanded, setCompetitionFieldExpanded] = useState(() => getRealCompetitors(newLeadData.competitors).length > 0);

  // Custom discount mode — true when the stored value isn't in the predefined list
  const [discountCustom, setDiscountCustom] = useState(
    () => !!(newLeadData.discount && !DISCOUNT_OPTIONS_WITH_UNKNOWN.includes(newLeadData.discount)),
  );
  const fileInputRef = useRef(null);
  const [endUserOptions, setEndUserOptions] = useState(() => mergeUnique(
    END_USER_OPTIONS,
    (opportunities || []).map((opp) => opp.company),
  ));

  const realDealers = useMemo(() => getRealDealers(newLeadData.dealers), [newLeadData.dealers]);
  const realDesignFirms = useMemo(() => getRealDesignFirms(newLeadData.designFirms), [newLeadData.designFirms]);
  const realCompetitors = useMemo(() => getRealCompetitors(newLeadData.competitors), [newLeadData.competitors]);
  const realEndUser = useMemo(() => getRealEndUser(newLeadData.endUser), [newLeadData.endUser]);
  const isDealerOutToBid = !!newLeadData.isBid;
  const isDesignFirmUnknown = !!newLeadData.designFirmUnknown;
  const isEndUserUnknown = !!newLeadData.endUserUnknown;
  const isCompetitionUnknown = !!newLeadData.competitionUnknown;

  useEffect(() => {
    if (newLeadData.projectStatus && !stageOptions.includes(newLeadData.projectStatus)) {
      onNewLeadChange({ projectStatus: stageOptions[0] });
    }
  }, [newLeadData.projectStatus, onNewLeadChange, stageOptions]);

  useEffect(() => {
    if (!realEndUser) return;
    setEndUserOptions((prev) => mergeUnique(prev, realEndUser));
  }, [realEndUser]);

  useEffect(() => {
    setEndUserOptions((prev) => mergeUnique(prev, (opportunities || []).map((opp) => opp.company)));
  }, [opportunities]);

  useEffect(() => {
    const dealers = newLeadData.dealers || [];
    const designFirmsList = newLeadData.designFirms || [];
    const competitorsList = newLeadData.competitors || [];
    const hasLegacyBid = dealers.some((dealer) => String(dealer).trim().toLowerCase() === 'out to bid');
    const legacyUnknownOnly = designFirmsList.includes('Unknown') && getRealDesignFirms(designFirmsList).length === 0;
    const legacyCompetitionUnknown = competitorsList.includes('Unknown') && getRealCompetitors(competitorsList).length === 0;
    const legacyEndUserUnknown = String(newLeadData.endUser || '').trim().toLowerCase() === 'unknown';
    const updates = {};

    if (hasLegacyBid) {
      updates.isBid = true;
      updates.dealers = getRealDealers(dealers);
    }
    if (legacyUnknownOnly && !newLeadData.designFirmUnknown) {
      updates.designFirmUnknown = true;
      updates.designFirms = [];
    }
    if (legacyCompetitionUnknown && !newLeadData.competitionUnknown) {
      updates.competitionUnknown = true;
      updates.competitors = [];
    }
    if (legacyEndUserUnknown && !newLeadData.endUserUnknown) {
      updates.endUserUnknown = true;
      updates.endUser = '';
    }
    if (Object.keys(updates).length) onNewLeadChange(updates);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (realEndUser) setEndUserFieldExpanded(true);
    else if (isEndUserUnknown) setEndUserFieldExpanded(false);
  }, [realEndUser, isEndUserUnknown]);

  useEffect(() => {
    if (realDealers.length > 0) setDealerFieldExpanded(true);
    else if (isDealerOutToBid) setDealerFieldExpanded(false);
  }, [realDealers.length, isDealerOutToBid]);

  useEffect(() => {
    if (realDesignFirms.length > 0) setDesignFirmFieldExpanded(true);
    else if (isDesignFirmUnknown) setDesignFirmFieldExpanded(false);
  }, [realDesignFirms.length, isDesignFirmUnknown]);

  useEffect(() => {
    if (realCompetitors.length > 0) setCompetitionFieldExpanded(true);
    else if (isCompetitionUnknown) setCompetitionFieldExpanded(false);
  }, [realCompetitors.length, isCompetitionUnknown]);

  const showDealerCollapsed = isDealerOutToBid && realDealers.length === 0 && !dealerFieldExpanded;
  const showDesignFirmCollapsed = isDesignFirmUnknown && realDesignFirms.length === 0 && !designFirmFieldExpanded;
  const showEndUserCollapsed = isEndUserUnknown && !realEndUser && !endUserFieldExpanded;
  const showCompetitionCollapsed = !!newLeadData.competitionPresent && isCompetitionUnknown && realCompetitors.length === 0 && !competitionFieldExpanded;

  useEffect(() => {
    // Scroll back to top so each step feels like a fresh page
    const panel = document.querySelector('.panel-content');
    if (panel) panel.scrollTop = 0;
  }, [step]);

  // Auto-disable rewards when discount is 64%+ off
  useEffect(() => {
    const discountPercent = parseDiscountPercent(newLeadData.discount);
    if (discountPercent !== null && discountPercent >= 64) {
      onNewLeadChange({ salesReward: false, designerReward: false });
    }
  }, [newLeadData.discount, onNewLeadChange]);

  // Register back handler so AppHeader arrow navigates between wizard steps
  useEffect(() => {
    if (!setBackHandler) return undefined;
    if (step === 0) {
      // On first step, clear any custom handler — default back exits the screen
      setBackHandler(null);
      return undefined;
    }
    return setBackHandler(() => {
      animateToStep(Math.max(step - 1, 0));
      return true; // consumed — prevent screen-level navigation
    });
  }, [step, setBackHandler, animateToStep]);

  // Inject step-transition keyframes once
  useEffect(() => {
    const id = 'nl-step-transitions';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @keyframes nl-slide-in-right { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        @keyframes nl-slide-in-left  { from { opacity:0; transform:translateX(-18px); } to { opacity:1; transform:translateX(0); } }
        @keyframes nl-reveal-in { from { opacity:0; } to { opacity:1; } }
        .nl-fwd  { animation: nl-slide-in-right .25s cubic-bezier(.25,.46,.45,.94) both; }
        .nl-back { animation: nl-slide-in-left  .25s cubic-bezier(.25,.46,.45,.94) both; }
        .nl-reveal-in { animation: nl-reveal-in .2s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .nl-fwd, .nl-back, .nl-reveal-in { animation: none !important; }
        }

        .win-slider { -webkit-appearance:none; appearance:none; height:22px; border-radius:99px; outline:none; cursor:pointer; display:block; width:100%; background:transparent; }
        .win-slider::-webkit-slider-runnable-track { height:5px; border-radius:99px; background:transparent; }
        .win-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:50%; background:#fff; border:2.5px solid var(--ws-accent,#666); box-shadow:0 1px 6px rgba(0,0,0,0.18); cursor:pointer; transition:transform .12s ease, box-shadow .12s ease; margin-top:-8.5px; }
        .win-slider::-webkit-slider-thumb:active { transform:scale(1.18); box-shadow:0 2px 12px rgba(0,0,0,0.22); }
        .win-slider::-moz-range-track { height:5px; border-radius:99px; background:transparent; }
        .win-slider::-moz-range-progress { background:transparent; }
        .win-slider::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:#fff; border:2.5px solid var(--ws-accent,#666); box-shadow:0 1px 6px rgba(0,0,0,0.18); cursor:pointer; box-sizing:border-box; }
        .win-slider:focus { outline:none; }
        .win-slider:focus-visible::-webkit-slider-thumb { box-shadow:0 0 0 4px var(--ws-accent-ring,rgba(0,0,0,0.15)), 0 1px 6px rgba(0,0,0,0.18); }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const upd = useCallback((field, value) => {
    if (field === 'vertical' && value !== 'Other') {
      onNewLeadChange({ vertical: value, otherVertical: '' });
      return;
    }
    if (field === 'competitionPresent' && value === false) {
      onNewLeadChange({ competitionPresent: false, competitors: [], otherCompetitor: '', competitionUnknown: false });
      return;
    }
    onNewLeadChange({ [field]: value });
  }, [onNewLeadChange]);

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const toggleDrivingSpecs = useCallback((type, name) => {
    const normalized = String(name || '').trim();
    if (!normalized) return;
    onNewLeadChange({ drivingSpecs: { type, name: normalized } });
  }, [onNewLeadChange]);

  const specifierOptions = useMemo(
    () => buildSpecifierOptions(newLeadData),
    [newLeadData.endUser, newLeadData.dealers, newLeadData.designFirms],
  );

  useEffect(() => {
    const current = newLeadData.drivingSpecs;
    if (!specifierOptions.length) {
      if (current) onNewLeadChange({ drivingSpecs: null });
      return;
    }
    const match = current && specifierOptions.find((option) => option.type === current.type && option.name === current.name);
    if (!match) {
      const fallback = getDefaultSpecifierOption(specifierOptions);
      if (fallback) onNewLeadChange({ drivingSpecs: { type: fallback.type, name: fallback.name } });
    }
  }, [specifierOptions, newLeadData.drivingSpecs, onNewLeadChange]);

  const addDesignFirm = useCallback((firm) => {
    const norm = firm.trim();
    if (!norm) return;
    if (isUnknownStakeholderValue(norm)) {
      onNewLeadChange({ designFirmUnknown: true, designFirms: [] });
      setDesignFirmFieldExpanded(false);
      return;
    }
    const current = getRealDesignFirms(newLeadData.designFirms);
    if (current.some((f) => f.toLowerCase() === norm.toLowerCase())) return;
    const updates = { designFirms: [...current, norm], designFirmUnknown: false };
    if (isSpecifierCandidate(norm)) {
      updates.drivingSpecs = { type: 'designFirm', name: norm };
    }
    onNewLeadChange(updates);
    setDesignFirmFieldExpanded(true);
  }, [newLeadData.designFirms, onNewLeadChange]);

  const addCompetitor = useCallback((competitor) => {
    const norm = competitor.trim();
    if (!norm) return;
    if (isUnknownStakeholderValue(norm)) {
      onNewLeadChange({ competitionUnknown: true, competitors: [] });
      setCompetitionFieldExpanded(false);
      markTouched('competitors');
      return;
    }
    const current = getRealCompetitors(newLeadData.competitors);
    if (current.some((name) => name.toLowerCase() === norm.toLowerCase())) return;
    onNewLeadChange({ competitionUnknown: false, competitors: [...current, norm] });
    setCompetitionFieldExpanded(true);
    markTouched('competitors');
  }, [markTouched, newLeadData.competitors, onNewLeadChange]);

  const addEndUser = useCallback((value) => {
    const norm = String(value || '').trim();
    if (!norm) return;
    if (isUnknownStakeholderValue(norm)) {
      onNewLeadChange({ endUserUnknown: true, endUser: '' });
      setEndUserFieldExpanded(false);
      markTouched('endUser');
      return;
    }
    setEndUserOptions((prev) => mergeUnique(prev, norm));
    onNewLeadChange({ endUser: norm, endUserUnknown: false });
    setEndUserFieldExpanded(true);
    markTouched('endUser');
  }, [markTouched, onNewLeadChange]);

  const handleProjectInputChange = useCallback((nextValue) => {
    const currentSelectedProject = (opportunities || []).find((opp) => String(opp?.id) === String(newLeadData.pastProjectRef || ''));
    const selectedName = currentSelectedProject ? String(currentSelectedProject.name || currentSelectedProject.project || '').trim() : '';
    const updates = { project: nextValue };

    if (newLeadData.pastProjectRef && normalizeText(selectedName) !== normalizeText(nextValue)) {
      updates.pastProjectRef = '';
    }

    onNewLeadChange(updates);
  }, [newLeadData.pastProjectRef, onNewLeadChange, opportunities]);

  const commitProjectValue = useCallback((nextValue) => {
    onNewLeadChange({ project: String(nextValue || '').trim(), pastProjectRef: '' });
    markTouched('project');
  }, [markTouched, onNewLeadChange]);

  const handleSelectExistingProject = useCallback((opp) => {
    const projectName = String(opp?.name || opp?.project || '').trim();
    if (!projectName) return;

    const companyName = String(opp?.company || opp?.customerName || '').trim();
    const updates = {
      project: projectName,
      pastProjectRef: String(opp?.id ?? ''),
    };

    if (companyName && !realEndUser && !newLeadData.endUserUnknown) {
      updates.endUser = companyName;
      updates.endUserUnknown = false;
    }

    onNewLeadChange(updates);
    markTouched('project');
    if (companyName && !realEndUser && !newLeadData.endUserUnknown) {
      markTouched('endUser');
    }
  }, [markTouched, newLeadData.endUserUnknown, onNewLeadChange, realEndUser]);

  const addEndUserOption = useCallback((value) => {
    addEndUser(value);
  }, [addEndUser]);

  const stageIndex = useMemo(
    () => stageOptions.indexOf(newLeadData.projectStatus), // -1 when nothing selected
    [newLeadData.projectStatus, stageOptions],
  );

  const quoteMode = newLeadData.jsiQuoteExists ? 'existing' : newLeadData.quoteNeeded ? 'needed' : (newLeadData.noQuoteNeeded ? 'not-needed' : null);
  const setQuoteMode = useCallback((mode) => {
    onNewLeadChange({
      jsiQuoteExists: mode === 'existing',
      quoteNeeded: mode === 'needed',
      noQuoteNeeded: mode === 'not-needed',
      ...(mode !== 'existing' ? { jsiQuoteNumber: '' } : {}),
    });
  }, [onNewLeadChange]);

  const duplicateMatches = useMemo(() => {
    const project = normalizeText(newLeadData.project);
    const endUser = normalizeText(newLeadData.endUser);
    const projectQuery = project.length >= 3 ? project : '';
    const endUserQuery = endUser.length >= 3 ? endUser : '';
    const selectedProjectRef = String(newLeadData.pastProjectRef || '');
    // Require BOTH project and end user to have enough characters and BOTH to match
    if (!projectQuery || !endUserQuery) return [];
    return (opportunities || [])
      .filter((opp) => String(opp?.id) !== selectedProjectRef)
      .filter((opp) => {
        const name = normalizeText(opp.name || opp.project);
        const company = normalizeText(opp.company);
        const projectHit = name.includes(projectQuery) || projectQuery.includes(name);
        const companyHit = company.includes(endUserQuery) || endUserQuery.includes(company);
        return projectHit && companyHit;
      })
      .slice(0, 3);
  }, [newLeadData.project, newLeadData.endUser, newLeadData.pastProjectRef, opportunities]);

  const errors = useMemo(() => {
    const next = {};
    if (!String(newLeadData.project || '').trim()) next.project = 'Project name is required.';
    if (!newLeadData.projectStatus) next.projectStatus = 'Project stage is required.';
    if (!newLeadData.vertical) next.vertical = 'Vertical is required.';
    if (parseCurrency(newLeadData.estimatedList) <= 0) next.estimatedList = 'Estimated list must be greater than zero.';
    if (!realEndUser && !newLeadData.endUserUnknown) next.endUser = 'Select or create an end user.';
    if (!realDealers.length && !newLeadData.isBid) next.dealers = 'Add at least one dealer or mark Out to Bid.';
    if (!newLeadData.poTimeframe) next.poTimeframe = 'PO timeframe is required.';
    if (newLeadData.competitionPresent && !realCompetitors.length && !newLeadData.competitionUnknown) {
      next.competitors = 'Add a competitor, mark Unknown, or switch Competition off.';
    }
    if (newLeadData.jsiQuoteExists && !String(newLeadData.jsiQuoteNumber || '').trim()) {
      next.jsiQuoteNumber = 'Quote number is required when Existing Quote is selected.';
    }
    return next;
  }, [
    newLeadData.project,
    newLeadData.projectStatus,
    newLeadData.vertical,
    newLeadData.otherVertical,
    newLeadData.estimatedList,
    newLeadData.endUser,
    newLeadData.endUserUnknown,
    realEndUser,
    newLeadData.dealers,
    newLeadData.isBid,
    newLeadData.poTimeframe,
    newLeadData.competitionPresent,
    newLeadData.competitionUnknown,
    newLeadData.competitors,
    newLeadData.jsiQuoteExists,
    newLeadData.jsiQuoteNumber,
    realDealers,
    realCompetitors,
  ]);


  const health = useMemo(() => {
    const products = newLeadData.products || [];
    const intakeReadyCount = products.filter((product) => {
      const prompts = getSeriesProcurementPrompts(product.series);
      return !!product[prompts.first.key] && !!product[prompts.second.key];
    }).length;
    const intakeRatio = products.length ? intakeReadyCount / products.length : 0;
    const winProbabilityValue = Number(newLeadData.winProbability || 50);
    const estimatedListValue = parseCurrency(newLeadData.estimatedList);
    const discountPercent = parseDiscountPercent(newLeadData.discount);
    const hasInstallDetails = !!String(newLeadData.installationLocation || '').trim() || !!String(newLeadData.expectedInstallDate || '').trim();
    const stageProgress = newLeadData.projectStatus ? (stageIndex + 1) / Math.max(stageOptions.length, 1) : 0;

    const estimatedListPoints = estimatedListValue >= 250000
      ? 14
      : estimatedListValue >= 100000
        ? 12
        : estimatedListValue >= 50000
          ? 10
          : estimatedListValue >= 20000
            ? 8
            : estimatedListValue > 0
              ? 6
              : 0;

    const poTimeframePoints = {
      'Within 30 Days': 8,
      '30-60 Days': 7,
      '60-180 Days': 5,
      '180+ Days': 3,
      'Next Year': 2,
      Unknown: 4,
    }[newLeadData.poTimeframe] ?? 0;

    const discountPoints = discountPercent == null
      ? 3
      : discountPercent < 64
        ? 8
        : discountPercent <= 64
          ? 7
          : discountPercent <= 66
            ? 6
            : discountPercent <= 70
              ? 4
              : 2;

    const quotePoints = quoteMode === 'existing'
      ? (String(newLeadData.jsiQuoteNumber || '').trim() ? 7 : 3)
      : quoteMode === 'needed'
        ? 5
        : quoteMode === 'not-needed'
          ? 6
          : 3;

    const competitionPoints = newLeadData.competitionPresent
      ? (realCompetitors.length || newLeadData.competitionUnknown ? 4 : 1)
      : 7;

    const signals = [
      { label: 'Project Name', points: String(newLeadData.project || '').trim() ? 5 : 0, max: 5 },
      { label: 'Stage Progress', points: Math.round(stageProgress * 10), max: 10 },
      { label: 'Vertical', points: newLeadData.vertical ? 3 : 0, max: 3 },
      { label: 'Win Probability', points: Math.round((winProbabilityValue / 100) * 10), max: 10 },
      { label: 'Estimated List', points: estimatedListPoints, max: 14 },
      { label: 'PO Timeframe', points: poTimeframePoints, max: 8 },
      { label: 'End User', points: (realEndUser || newLeadData.endUserUnknown) ? 5 : 0, max: 5 },
      { label: 'Dealer Coverage', points: (realDealers.length || newLeadData.isBid) ? 6 : 0, max: 6 },
      { label: 'A&D Alignment', points: (realDesignFirms.length || newLeadData.designFirmUnknown) ? 3 : 1, max: 3 },
      { label: 'Discount Quality', points: discountPoints, max: 8 },
      { label: 'Competition Position', points: competitionPoints, max: 7 },
      { label: 'Quote Strategy', points: quotePoints, max: 7 },
      { label: 'JSI Series', points: products.length ? 4 : 0, max: 4 },
      { label: 'Plant Intake', points: Math.round(intakeRatio * 5), max: 5 },
      { label: 'Install Details', points: hasInstallDetails ? 2 : 0, max: 2 },
      { label: 'Rewards', points: (newLeadData.salesReward !== false || newLeadData.designerReward !== false) ? 1 : 0, max: 1 },
      { label: 'Notes Added', points: String(newLeadData.notes || '').trim() ? 1 : 0, max: 1 },
      { label: 'Files Added', points: (newLeadData.attachments || []).length ? 1 : 0, max: 1 },
    ];

    const score = signals.reduce((sum, signal) => sum + signal.points, 0);
    const max = signals.reduce((sum, signal) => sum + signal.max, 0);
    const ratio = max ? score / max : 0;
    const percent = toStep1Percent(ratio);
    const missing = signals
      .filter((signal) => signal.points < signal.max)
      .sort((a, b) => (b.max - b.points) - (a.max - a.points))
      .map((signal) => signal.label);

    return { score, max, percent, missing, ...getHealthBand(ratio) };
  }, [
    newLeadData.project,
    newLeadData.projectStatus,
    newLeadData.vertical,
    newLeadData.winProbability,
    newLeadData.otherVertical,
    newLeadData.estimatedList,
    newLeadData.poTimeframe,
    newLeadData.endUser,
    newLeadData.endUserUnknown,
    realEndUser,
    newLeadData.dealers,
    newLeadData.isBid,
    newLeadData.designFirms,
    newLeadData.competitionPresent,
    newLeadData.competitionUnknown,
    newLeadData.competitors,
    newLeadData.salesReward,
    newLeadData.designerReward,
    newLeadData.discount,
    quoteMode,
    newLeadData.jsiQuoteNumber,
    newLeadData.products,
    newLeadData.installationLocation,
    newLeadData.expectedInstallDate,
    newLeadData.notes,
    newLeadData.attachments,
    stageIndex,
    stageOptions.length,
    realDealers,
    realDesignFirms,
    realCompetitors,
    newLeadData.designFirmUnknown,
  ]);
  const salesRewardEnabled = newLeadData.salesReward !== false;
  const designerRewardEnabled = newLeadData.designerReward !== false;

  const parsedEstimatedList = useMemo(() => parseCurrency(newLeadData.estimatedList), [newLeadData.estimatedList]);
  const notesPreview = useMemo(() => {
    const notes = String(newLeadData.notes || '').trim();
    return notes.length > 210 ? `${notes.slice(0, 207)}...` : notes;
  }, [newLeadData.notes]);
  const seriesCount = (newLeadData.products || []).length;
  const readinessChecks = useMemo(() => {
    return (newLeadData.products || []).map((product) => {
      const prompts = getSeriesProcurementPrompts(product.series);
      const firstAnswer = product[prompts.first.key];
      const secondAnswer = product[prompts.second.key];
      return {
        series: product.series,
        firstLabel: prompts.first.label,
        firstValue: firstAnswer || 'Pending',
        secondLabel: prompts.second.label,
        secondValue: secondAnswer || 'Pending',
        done: !!firstAnswer && !!secondAnswer,
      };
    });
  }, [newLeadData.products]);
  const intakeReadyCount = useMemo(() => readinessChecks.filter((item) => item.done).length, [readinessChecks]);
  const selectedSeriesNames = useMemo(
    () => (newLeadData.products || []).map((product) => product.series).filter(Boolean),
    [newLeadData.products],
  );
  const filledReviewItems = useMemo(() => {
    const items = [];
    const add = (label, value, itemStep = 1) => {
      if (value == null) return;
      const text = String(value).trim();
      if (!text) return;
      items.push({ label, value: text, step: itemStep });
    };

    add('Project', newLeadData.project, 0);
    add('Stage', newLeadData.projectStatus, 0);
    add('Vertical', newLeadData.vertical === 'Other' ? (newLeadData.otherVertical || 'Other') : newLeadData.vertical, 0);
    if (newLeadData.installationLocation) add('Location', newLeadData.installationLocation, 0);
    if (newLeadData.expectedInstallDate) add('Install Date', newLeadData.expectedInstallDate, 0);
    if (parsedEstimatedList > 0) add('Estimated List', `$${parsedEstimatedList.toLocaleString()}`, 1);
    add('PO Timeframe', newLeadData.poTimeframe, 1);
    if (newLeadData.endUserUnknown || realEndUser) {
      add('End User', newLeadData.endUserUnknown ? 'Unknown' : realEndUser, 1);
    }
    if (realDealers.length || newLeadData.isBid) {
      const dealerText = [newLeadData.isBid ? 'Out to bid' : null, realDealers.length ? realDealers.join(', ') : null].filter(Boolean).join(' · ');
      add('Dealers', dealerText, 1);
    }
    if (realDesignFirms.length || newLeadData.designFirmUnknown) {
      const firmText = [newLeadData.designFirmUnknown ? 'Unknown' : null, realDesignFirms.length ? realDesignFirms.join(', ') : null].filter(Boolean).join(' · ');
      add('A&D Firms', firmText, 1);
    }
    if (newLeadData.competitionPresent) {
      const compText = [
        newLeadData.competitionUnknown ? 'Unknown' : null,
        realCompetitors.length ? realCompetitors.join(', ') : null,
      ].filter(Boolean).join(' · ') || 'Unknown';
      add('Competition', compText, 1);
    } else {
      add('Competition', 'Inactive', 1);
    }
    if (newLeadData.drivingSpecs?.name) {
      const typeLabels = { endUser: 'End user', dealer: 'Dealer', designFirm: 'A&D' };
      add('Who is leading the specifications?', `${typeLabels[newLeadData.drivingSpecs.type] || newLeadData.drivingSpecs.type} · ${newLeadData.drivingSpecs.name}`, 1);
    }
    add('Rewards', [salesRewardEnabled ? 'Sales 3%' : null, designerRewardEnabled ? 'Designer 1%' : null].filter(Boolean).join(' · ') || 'None', 1);
    if (quoteMode === 'existing' && newLeadData.jsiQuoteNumber) add('JSI Quote #', newLeadData.jsiQuoteNumber, 2);
    if (quoteMode === 'needed') add('Quote', 'Quote needed', 2);
    if (quoteMode === 'not-needed') add('Quote', 'No quote needed', 2);
    if (selectedSeriesNames.length) add('JSI Series', selectedSeriesNames.join(', '), 2);
    if (seriesCount) add('Series Intake', `${intakeReadyCount}/${seriesCount} ready`, 2);
    if (notesPreview) add('Notes', notesPreview, 2);
    if ((newLeadData.attachments || []).length) add('Attachments', `${(newLeadData.attachments || []).length} file(s)`, 2);

    return items;
  }, [
    intakeReadyCount,
    newLeadData.project,
    newLeadData.projectStatus,
    newLeadData.vertical,
    newLeadData.otherVertical,
    parsedEstimatedList,
    newLeadData.poTimeframe,
    newLeadData.endUser,
    newLeadData.endUserUnknown,
    realEndUser,
    newLeadData.dealers,
    newLeadData.isBid,
    newLeadData.designFirms,
    newLeadData.designFirmUnknown,
    realDealers,
    realDesignFirms,
    newLeadData.installationLocation,
    newLeadData.expectedInstallDate,
    quoteMode,
    newLeadData.jsiQuoteNumber,
    selectedSeriesNames,
    seriesCount,
    newLeadData.competitionPresent,
    newLeadData.competitionUnknown,
    newLeadData.competitors,
    realCompetitors,
    newLeadData.drivingSpecs,
    salesRewardEnabled,
    designerRewardEnabled,
    notesPreview,
    newLeadData.attachments,
  ]);

  const visibleError = useCallback((field) => {
    return (submitAttempted || touched[field]) ? errors[field] : null;
  }, [errors, submitAttempted, touched]);

  const stepValid = useMemo(() => {
    if (step === 0) return !errors.project && !errors.projectStatus && !errors.vertical && !errors.otherVertical;
    if (step === 1) return !errors.estimatedList && !errors.endUser && !errors.dealers && !errors.poTimeframe && !errors.competitors;
    return !errors.project && !errors.projectStatus && !errors.vertical && !errors.otherVertical
      && !errors.estimatedList && !errors.endUser && !errors.dealers && !errors.poTimeframe
      && !errors.competitors && !errors.jsiQuoteNumber;
  }, [errors, step]);

  const canSubmit = useMemo(() => {
    return !errors.project && !errors.projectStatus && !errors.vertical && !errors.otherVertical
      && !errors.estimatedList && !errors.endUser && !errors.dealers && !errors.poTimeframe && !errors.competitors && !errors.jsiQuoteNumber;
  }, [errors]);

  const markStepFieldsTouched = useCallback((stepIdx) => {
    if (stepIdx === 0) setTouched((prev) => ({ ...prev, project: true, projectStatus: true, vertical: true, otherVertical: true }));
    if (stepIdx === 1) setTouched((prev) => ({ ...prev, estimatedList: true, endUser: true, dealers: true, poTimeframe: true, competitors: true }));
    if (stepIdx === 2) setTouched((prev) => ({ ...prev, jsiQuoteNumber: true }));
  }, []);

  const goNext = useCallback(() => {
    markStepFieldsTouched(step);
    if (!stepValid) {
      // Wait one frame for the error elements to render after state update, then scroll to the first one
      setTimeout(() => {
        const firstErr = document.querySelector('.nl-field-error');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const panel = document.querySelector('.panel-content');
          if (panel) panel.scrollTop = 0;
        }
      }, 30);
      return;
    }
    animateToStep(Math.min(step + 1, 2));
  }, [animateToStep, markStepFieldsTouched, step, stepValid]);


  const addProduct = useCallback((series) => {
    if (!series || (newLeadData.products || []).some((p) => p.series === series)) return;
    upd('products', [
      ...(newLeadData.products || []),
      {
        series,
        hasGlassDoors: false,
        surfaceTypes: [],
        materials: [],
        hasWoodBack: false,
        polyColor: '',
        procurementCheckpoint: '',
        productionReadiness: '',
      },
    ]);
  }, [newLeadData.products, upd]);

  const removeProduct = useCallback((idx) => {
    upd('products', (newLeadData.products || []).filter((_, i) => i !== idx));
  }, [newLeadData.products, upd]);

  const updateProductOption = useCallback((idx, key, value) => {
    upd('products', (newLeadData.products || []).map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  }, [newLeadData.products, upd]);

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const current = newLeadData.attachments || [];
    const dedupeKeys = new Set(current.map((f) => `${f.name}_${f.size}_${f.lastModified || 0}`));
    const next = [...current];
    let rejected = '';

    for (const file of incoming) {
      const ext = String(file.name || '').split('.').pop()?.toLowerCase() || '';
      if (!FILE_EXTENSIONS.includes(ext)) {
        rejected = `Unsupported file type: .${ext || 'unknown'}`;
        continue;
      }
      if (file.size > FILE_MAX_SIZE) {
        rejected = `File too large: ${file.name} (max 20 MB).`;
        continue;
      }
      if (next.length >= FILE_LIMIT) {
        rejected = `Attachment limit reached (${FILE_LIMIT}).`;
        break;
      }
      const key = `${file.name}_${file.size}_${file.lastModified || 0}`;
      if (dedupeKeys.has(key)) continue;
      dedupeKeys.add(key);
      next.push({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified || Date.now(),
      });
    }
    upd('attachments', next);
    setFileNotice(rejected || '');
  }, [newLeadData.attachments, upd]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    addFiles(event.dataTransfer?.files);
  }, [addFiles]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    markStepFieldsTouched(0);
    markStepFieldsTouched(1);
    markStepFieldsTouched(2);
    if (!canSubmit) {
      const step0Valid = !errors.project && !errors.projectStatus && !errors.vertical && !errors.otherVertical;
      const step1Valid = !errors.estimatedList && !errors.endUser && !errors.dealers && !errors.poTimeframe && !errors.competitors;
      animateToStep(!step0Valid ? 0 : !step1Valid ? 1 : 2);
      const panel = document.querySelector('.panel-content');
      if (panel) panel.scrollTop = 0;
      return;
    }
    hapticSuccess();
    onSuccess(newLeadData);
  }, [animateToStep, canSubmit, errors, markStepFieldsTouched, newLeadData, onSuccess]);

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="min-h-full flex flex-col" style={{ backgroundColor: c.background }}>
      {/* Invisible focus sink — prevents AnimatedScreenWrapper from focusing a heading on mount */}
      <div data-autofocus tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', outline: 'none' }} />
      <div className={`px-4 sm:px-6 pb-32 ${NEW_LEAD_MAX_WIDTH} mx-auto w-full`} style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 16px)' }}>

        <div key={step} className={`space-y-4 ${stepAnimClass}`}>
        {step === 0 && (
          <>
            <Section theme={theme}>
              <Row label="Project Name" theme={theme} inline>
                <div>
                  <ProjectSpotlight
                    value={newLeadData.project || ''}
                    onChange={handleProjectInputChange}
                    onCommitValue={commitProjectValue}
                    onSelectOpportunity={handleSelectExistingProject}
                    opportunities={opportunities}
                    selectedOpportunityId={newLeadData.pastProjectRef}
                    onBlur={() => markTouched('project')}
                    placeholder="Enter or search project name"
                    theme={theme}
                  />
                  <FieldError show={!!visibleError('project')} message={visibleError('project')} />
                </div>
              </Row>

              <Row label="Stage" theme={theme} inline>
                <div>
                  <div className="grid grid-cols-2 gap-1">
                    {stageOptions.map((stage, idx) => {
                      const num = idx + 1;
                      const isSelected = newLeadData.projectStatus === stage;
                      const isPast = stageIndex > idx;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => { upd('projectStatus', stage); markTouched('projectStatus'); }}
                          className="flex items-center gap-2 rounded-full border transition-all text-left px-2.5 py-2"
                          style={{
                            backgroundColor: isSelected ? c.accent : isPast ? `${c.accent}20` : 'transparent',
                            borderColor: isSelected ? c.accent : isPast ? c.accent : subtleBorder,
                          }}
                        >
                          <span
                            className="text-[0.625rem] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              width: 18, height: 18,
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : isPast ? c.accent : dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                              color: isSelected ? c.accentText : isPast ? c.accentText : c.textSecondary,
                            }}
                          >
                            {num}
                          </span>
                          <span
                            className="text-[0.8125rem] font-semibold leading-tight"
                            style={{ color: isSelected ? c.accentText : isPast ? c.accent : c.textPrimary }}
                          >
                            {stage}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError show={!!visibleError('projectStatus')} message={visibleError('projectStatus')} />
                </div>
              </Row>

              <Row label="Vertical" theme={theme} inline>
                <div>
                  <div className={newLeadData.vertical === 'Other' ? 'flex items-center gap-2' : ''}>
                    <div className={newLeadData.vertical === 'Other' ? 'w-[42%] flex-shrink-0' : 'w-full'}>
                      <PortalNativeSelect
                        value={newLeadData.vertical || ''}
                        onChange={(e) => { upd('vertical', e.target.value); markTouched('vertical'); }}
                        options={VERTICALS.map((v) => ({ label: v, value: v }))}
                        placeholder="Select vertical"
                        theme={theme}
                        size="sm"
                      />
                    </div>
                    {newLeadData.vertical === 'Other' && (
                      <input
                        type="text"
                        value={newLeadData.otherVertical || ''}
                        onChange={(e) => { upd('otherVertical', e.target.value); markTouched('otherVertical'); }}
                        placeholder="What kind?"
                        autoFocus
                        className="min-w-0 flex-1 text-sm placeholder-theme-secondary focus:outline-none"
                        style={{ height: 40, padding: '0 16px', borderRadius: 9999, backgroundColor: c.surface, border: `1px solid ${subtleBorder}`, color: c.textPrimary }}
                      />
                    )}
                  </div>
                  <FieldError show={!!visibleError('vertical')} message={visibleError('vertical')} />
                </div>
              </Row>

              <Row label="Install Location" theme={theme} inline>
                {(locationInputOpen || newLeadData.installationLocation) ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <AutoCompleteCombobox
                        value={newLeadData.installationLocation || ''}
                        onChange={(val) => { upd('installationLocation', val); markTouched('installationLocation'); }}
                        onSelect={(val) => { upd('installationLocation', val); markTouched('installationLocation'); }}
                        onAddNew={(val) => { upd('installationLocation', val.trim()); markTouched('installationLocation'); }}
                        options={CITY_OPTIONS}
                        placeholder="Search city..."
                        theme={theme}
                        compact
                        resetOnSelect={false}
                      />
                    </div>
                    <QuickPickButton
                      theme={theme}
                      onClick={() => { upd('installationLocation', ''); setLocationInputOpen(false); }}
                    >
                      Unknown
                    </QuickPickButton>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLocationInputOpen(true)}
                    className="w-full h-10 rounded-full border flex items-center justify-between px-3.5 transition-colors active:scale-[0.98]"
                    style={{ borderColor: subtleBorder, backgroundColor: dark ? c.background : c.surface }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" style={{ color: c.textSecondary, opacity: 0.45 }} />
                      <span className="text-sm font-medium" style={{ color: c.textSecondary, opacity: 0.5 }}>Unknown</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: c.accent }}>Set location</span>
                  </button>
                )}
              </Row>

              <Row label="Install Date" theme={theme} inline>
                {(dateInputOpen || newLeadData.expectedInstallDate) ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <DatePickerInput
                        value={newLeadData.expectedInstallDate || ''}
                        onChange={(v) => upd('expectedInstallDate', v)}
                        theme={theme}
                        placeholder="Set date..."
                      />
                    </div>
                    <QuickPickButton
                      theme={theme}
                      onClick={() => { upd('expectedInstallDate', ''); setDateInputOpen(false); }}
                    >
                      Unknown
                    </QuickPickButton>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDateInputOpen(true)}
                    className="w-full h-10 rounded-full border flex items-center justify-between px-3.5 transition-colors active:scale-[0.98]"
                    style={{ borderColor: subtleBorder, backgroundColor: dark ? c.background : c.surface }}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5" style={{ color: c.textSecondary, opacity: 0.45 }} />
                      <span className="text-sm font-medium" style={{ color: c.textSecondary, opacity: 0.5 }}>Unknown</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: c.accent }}>Set date</span>
                  </button>
                )}
              </Row>
            </Section>

            <Reveal show={!!duplicateMatches.length} reduceMotion={prefersReducedMotion}>
              <div style={{ paddingTop: '1rem' }}>
                <Section title="Potential Duplicates" theme={theme}>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs font-medium" style={{ color: c.error || 'var(--theme-error)' }}>
                      <AlertTriangle className="w-4 h-4" />
                      Similar opportunities already exist.
                    </div>
                    {duplicateMatches.map((opp) => (
                      <button
                        key={opp.id}
                        type="button"
                        onClick={() => onNavigate?.(`projects/${opp.id}`)}
                        className="w-full rounded-2xl border px-3 py-2.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ borderColor: subtleBorder }}
                      >
                        <div className="text-sm font-semibold" style={{ color: c.textPrimary }}>{opp.name}</div>
                        <div className="text-xs" style={{ color: c.textSecondary }}>{opp.company || 'Unknown company'}</div>
                      </button>
                    ))}
                  </div>
                </Section>
              </div>
            </Reveal>
          </>
        )}

        {step === 1 && (
          <>
            <Section title="Commercial Scope" theme={theme}>
              <Row label="Estimated List" theme={theme} inline>
                <div>
                  <div className="relative w-full">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none select-none" style={{ color: theme.colors.textSecondary, fontSize: "1rem" }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9,]*"
                      value={newLeadData.estimatedList || ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, '');
                        const formatted = digits ? Number(digits).toLocaleString('en-US') : '';
                        upd('estimatedList', formatted);
                        markTouched('estimatedList');
                      }}
                      onBlur={() => markTouched('estimatedList')}
                      placeholder="0"
                      className="w-full outline-none"
                      style={{
                        height: 40,
                        borderRadius: 9999,
                        border: `1px solid ${getSubtleBorder(theme)}`,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary,
                        padding: '0 14px 0 26px',
                      }}
                    />
                  </div>
                  <FieldError show={!!visibleError('estimatedList')} message={visibleError('estimatedList')} />
                </div>
              </Row>

              <Row label="Win %" theme={theme} inline>
                {(() => {
                  const winProb = newLeadData.winProbability ?? 50;
                  const winBand = getWinBand(winProb);
                  const trackBg = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';
                  const fillPercent = getWinSliderFillPercent(winProb);
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="tabular-nums leading-none" style={{ color: c.textPrimary, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
                          {winProb}<span style={{ fontSize: "0.9375rem", fontWeight: 600, color: c.textSecondary, marginLeft: 2 }}>%</span>
                        </span>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${winBand.tone}1A`, color: winBand.tone, transition: 'color .15s, background-color .15s' }}
                        >
                          {winBand.label}
                        </span>
                      </div>
                      <div className="relative flex items-center h-[22px]">
                        <div
                          className="absolute inset-x-0 h-[5px] rounded-full pointer-events-none"
                          style={{ backgroundColor: trackBg }}
                          aria-hidden="true"
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `calc(11px + (100% - 22px) * ${fillPercent / 100})`,
                              backgroundColor: c.accent,
                              transition: 'width 80ms ease-out',
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={WIN_MIN}
                          max={WIN_MAX}
                          step={5}
                          value={winProb}
                          onChange={(e) => upd('winProbability', Number(e.target.value))}
                          className="win-slider relative z-[1]"
                          style={{
                            '--ws-accent': c.accent,
                            '--ws-accent-ring': `${c.accent}44`,
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {WIN_PRESETS.map((pct) => {
                          const active = winProb === pct;
                          return (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => upd('winProbability', pct)}
                              className="rounded-full py-1.5 px-3 border transition-all"
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                backgroundColor: active ? c.accent : 'transparent',
                                borderColor: active ? c.accent : subtleBorder,
                                color: active ? c.accentText : c.textSecondary,
                              }}
                            >
                              {pct}%
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </Row>

              <Row label="PO Timeframe" theme={theme} inline>
                <div>
                  {newLeadData.poTimeframe && newLeadData.poTimeframe !== 'Unknown' && (
                    <div className="flex justify-end mb-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${c.accent}14`, color: c.accent, transition: 'color .15s, background-color .15s' }}>
                        {getPoDateLabel(newLeadData.poTimeframe)}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-1">
                    {PO_TIMEFRAMES.map((item) => (
                      <PillButton
                        key={item}
                        size="xs"
                        isSelected={newLeadData.poTimeframe === item}
                        onClick={() => { upd('poTimeframe', item); markTouched('poTimeframe'); }}
                        theme={theme}
                        className="w-full"
                      >
                        {item}
                      </PillButton>
                    ))}
                  </div>
                  <FieldError show={!!visibleError('poTimeframe')} message={visibleError('poTimeframe')} />
                </div>
              </Row>

              <Row label="Discount" theme={theme} inline>
                {discountCustom ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <FormInput
                        value={newLeadData.discount || ''}
                        onChange={(e) => upd('discount', e.target.value)}
                        placeholder="e.g. 54/12 or 65%"
                        theme={theme}
                        size="sm"
                        surfaceBg
                      />
                    </div>
                    <QuickPickButton
                      theme={theme}
                      onClick={() => { setDiscountCustom(false); upd('discount', ''); }}
                      icon={<ChevronLeft className="w-3.5 h-3.5" />}
                    >
                      List
                    </QuickPickButton>
                  </div>
                ) : (
                  <PortalNativeSelect
                    value={newLeadData.discount || ''}
                    onChange={(e) => {
                      if (e.target.value === '__discount_other__') {
                        setDiscountCustom(true);
                        upd('discount', '');
                      } else {
                        upd('discount', e.target.value);
                      }
                    }}
                    options={[
                      ...DISCOUNT_OPTIONS_WITH_UNKNOWN.map((d) => ({ label: d, value: d })),
                      { label: 'Other (type custom)…', value: '__discount_other__' },
                    ]}
                    placeholder="Select discount"
                    theme={theme}
                    size="sm"
                    mutedValues={['Unknown', '__discount_other__']}
                  />
                )}
              </Row>

              <Row label="Contract" theme={theme} inline>
                <PortalNativeSelect
                  value={newLeadData.contractType || ''}
                  onChange={(e) => upd('contractType', e.target.value)}
                  options={[
                    { label: 'None', value: 'none' },
                    ...Object.keys(CONTRACTS_DATA).map((key) => ({ label: CONTRACTS_DATA[key].name, value: key })),
                  ]}
                  placeholder="Select contract"
                  theme={theme}
                  size="sm"
                  mutedValues={['none']}
                />
              </Row>
            </Section>

            <Section title="Stakeholders & Competition" theme={theme}>
              <Row label="End User" theme={theme} inline>
                <div>
                  {showEndUserCollapsed ? (
                    <StakeholderCollapsedPill
                      label="Unknown"
                      hint="Add end user"
                      onExpand={() => {
                        setEndUserFieldExpanded(true);
                        if (newLeadData.endUserUnknown) onNewLeadChange({ endUserUnknown: false });
                      }}
                      theme={theme}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <SpotlightMultiSelect
                          selectedItems={realEndUser ? [realEndUser] : []}
                          onAddItem={addEndUser}
                          onRemoveItem={() => {
                            onNewLeadChange({ endUser: '', endUserUnknown: false });
                            markTouched('endUser');
                          }}
                          options={endUserOptions.filter((option) => (
                            !isUnknownStakeholderValue(option)
                            && option.toLowerCase() !== String(realEndUser || '').toLowerCase()
                          ))}
                          onAddNew={addEndUserOption}
                          placeholder={isEndUserUnknown && !realEndUser ? 'Add end user name' : 'Search or add end user'}
                          dimmed={isEndUserUnknown && !realEndUser}
                          theme={theme}
                          compact={false}
                          integratedChips
                        />
                      </div>
                      <QuickPickButton
                        active={isEndUserUnknown && !realEndUser}
                        theme={theme}
                        onClick={() => {
                          onNewLeadChange({ endUserUnknown: true, endUser: '' });
                          setEndUserFieldExpanded(false);
                          markTouched('endUser');
                        }}
                      >
                        Unknown
                      </QuickPickButton>
                    </div>
                  )}
                  <FieldError show={!!visibleError('endUser')} message={visibleError('endUser')} />
                </div>
              </Row>

              <Row label="Dealer(s)" theme={theme} inline>
                <div>
                  {showDealerCollapsed ? (
                    <StakeholderCollapsedPill
                      label="Out to Bid"
                      hint="Add dealers"
                      onExpand={() => setDealerFieldExpanded(true)}
                      theme={theme}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <SpotlightMultiSelect
                          selectedItems={realDealers}
                          onAddItem={(dealer) => {
                            const norm = dealer.trim();
                            if (!norm || norm.toLowerCase() === 'out to bid') return;
                            const current = realDealers;
                            if (!current.some((d) => d.toLowerCase() === norm.toLowerCase())) upd('dealers', [...current, norm]);
                            markTouched('dealers');
                          }}
                          onRemoveItem={(dealer) => {
                            upd('dealers', realDealers.filter((item) => item !== dealer));
                            markTouched('dealers');
                          }}
                          options={(realDealers.length > 0 ? (dealers || []).filter((item) => item !== 'Undecided') : (dealers || [])).filter((item) => item.toLowerCase() !== 'out to bid')}
                          onAddNew={(dealer) => { const norm = dealer.trim(); setDealers((prev) => prev.some((d) => d.toLowerCase() === norm.toLowerCase()) ? prev : [norm, ...prev]); }}
                          placeholder="Search or create dealer"
                          theme={theme}
                          compact={false}
                          integratedChips
                        />
                      </div>
                      <QuickPickButton
                        active={isDealerOutToBid}
                        theme={theme}
                        onClick={() => {
                          if (realDealers.length === 0) {
                            onNewLeadChange({ isBid: true, dealers: [] });
                            setDealerFieldExpanded(false);
                          } else {
                            upd('isBid', !isDealerOutToBid);
                          }
                          markTouched('dealers');
                        }}
                      >
                        Out to Bid
                      </QuickPickButton>
                    </div>
                  )}
                  <FieldError show={!!visibleError('dealers')} message={visibleError('dealers')} />
                </div>
              </Row>

              <Row label="A&D Firm(s)" theme={theme} inline>
                <div>
                  {showDesignFirmCollapsed ? (
                    <StakeholderCollapsedPill
                      label="Unknown"
                      hint="Add A&D firms"
                      onExpand={() => {
                        setDesignFirmFieldExpanded(true);
                        if (newLeadData.designFirmUnknown) onNewLeadChange({ designFirmUnknown: false });
                      }}
                      theme={theme}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <SpotlightMultiSelect
                          selectedItems={realDesignFirms}
                          onAddItem={addDesignFirm}
                          onRemoveItem={(firm) => {
                            upd('designFirms', realDesignFirms.filter((item) => item !== firm));
                          }}
                          options={(designFirms || []).filter((firm) => !isUnknownStakeholderValue(firm))}
                          onAddNew={(firm) => { const norm = firm.trim(); setDesignFirms((prev) => prev.some((f) => f.toLowerCase() === norm.toLowerCase()) ? prev : [norm, ...prev]); }}
                          placeholder={isDesignFirmUnknown && realDesignFirms.length === 0 ? 'Add firm name' : 'Search or create firm'}
                          dimmed={isDesignFirmUnknown && realDesignFirms.length === 0}
                          theme={theme}
                          compact={false}
                          integratedChips
                        />
                      </div>
                      <QuickPickButton
                        active={isDesignFirmUnknown && realDesignFirms.length === 0}
                        theme={theme}
                        onClick={() => {
                          onNewLeadChange({ designFirmUnknown: true, designFirms: [] });
                          setDesignFirmFieldExpanded(false);
                        }}
                      >
                        Unknown
                      </QuickPickButton>
                    </div>
                  )}
                </div>
              </Row>

              {specifierOptions.length > 0 && (
                <SpecifierPicker
                  options={specifierOptions}
                  value={newLeadData.drivingSpecs}
                  onSelect={toggleDrivingSpecs}
                  theme={theme}
                />
              )}

              <Row label="Competition" theme={theme} inline>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      {newLeadData.competitionPresent && (
                        showCompetitionCollapsed ? (
                          <StakeholderCollapsedPill
                            label="Unknown"
                            hint="Add competitor"
                            onExpand={() => {
                              setCompetitionFieldExpanded(true);
                              if (newLeadData.competitionUnknown) onNewLeadChange({ competitionUnknown: false });
                            }}
                            theme={theme}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <SpotlightMultiSelect
                                selectedItems={realCompetitors}
                                onAddItem={addCompetitor}
                                onRemoveItem={(competitor) => {
                                  upd('competitors', realCompetitors.filter((item) => item !== competitor));
                                  markTouched('competitors');
                                }}
                                options={isCompetitionUnknown
                                  ? []
                                  : COMPETITORS.filter((name) => name !== 'None' && name !== 'Unknown')}
                                onAddNew={(name) => { addCompetitor(name); }}
                                placeholder={isCompetitionUnknown ? 'Add competitor name' : 'Search or add competitor'}
                                dimmed={isCompetitionUnknown}
                                theme={theme}
                                compact={false}
                                integratedChips
                              />
                            </div>
                            <QuickPickButton
                              active={isCompetitionUnknown && realCompetitors.length === 0}
                              theme={theme}
                              onClick={() => {
                                onNewLeadChange({ competitionUnknown: true, competitors: [] });
                                setCompetitionFieldExpanded(false);
                                markTouched('competitors');
                              }}
                            >
                              Unknown
                            </QuickPickButton>
                          </div>
                        )
                      )}
                    </div>
                    <ToggleField
                      label="Active"
                      checked={!!newLeadData.competitionPresent}
                      onChange={() => {
                        upd('competitionPresent', !newLeadData.competitionPresent);
                        markTouched('competitionPresent');
                        markTouched('competitors');
                      }}
                      theme={theme}
                    />
                  </div>
                  <FieldError show={!!visibleError('competitors')} message={visibleError('competitors')} />
                </div>
              </Row>

              <Row label="Rewards" theme={theme} inline>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 min-h-[40px]">
                  <RewardTogglePill
                    label="Sales"
                    sublabel={salesRewardEnabled ? '3%' : 'off'}
                    checked={salesRewardEnabled}
                    onChange={(event) => { upd('salesReward', event.target.checked); markTouched('salesReward'); }}
                    theme={theme}
                  />
                  <RewardTogglePill
                    label="Designer"
                    sublabel={designerRewardEnabled ? '1%' : 'off'}
                    checked={designerRewardEnabled}
                    onChange={(event) => { upd('designerReward', event.target.checked); markTouched('designerReward'); }}
                    theme={theme}
                  />
                </div>
              </Row>
            </Section>
          </>
        )}

        {step === 2 && (
          <>
            <Section title="Quote & JSI Series" theme={theme}>
              <Row label="JSI Quote" theme={theme} inline>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <PillButton
                      size="xs"
                      isSelected={quoteMode === 'existing'}
                      onClick={() => { setQuoteMode('existing'); markTouched('jsiQuoteNumber'); }}
                      theme={theme}
                    >
                      Existing Quote
                    </PillButton>
                    <PillButton
                      size="xs"
                      isSelected={quoteMode === 'needed'}
                      onClick={() => setQuoteMode(quoteMode === 'needed' ? null : 'needed')}
                      theme={theme}
                    >
                      Quote Needed
                    </PillButton>
                    <PillButton
                      size="xs"
                      isSelected={quoteMode === 'not-needed'}
                      onClick={() => setQuoteMode(quoteMode === 'not-needed' ? null : 'not-needed')}
                      theme={theme}
                    >
                      No Quote Needed
                    </PillButton>
                    {quoteMode === 'existing' && (
                      <div className="flex-1 min-w-[190px]">
                        <FormInput
                          value={newLeadData.jsiQuoteNumber || ''}
                          onChange={(e) => { upd('jsiQuoteNumber', e.target.value); markTouched('jsiQuoteNumber'); }}
                          onBlur={() => markTouched('jsiQuoteNumber')}
                          placeholder="e.g. Q-12345"
                          theme={theme}
                          size="sm"
                          surfaceBg
                        />
                      </div>
                    )}
                  </div>
                  <FieldError show={!!visibleError('jsiQuoteNumber')} message={visibleError('jsiQuoteNumber')} />
                </div>
              </Row>

              <div className="py-3">
                <div className="mb-2">
                  <span className="text-sm font-semibold" style={{ color: c.textSecondary }}>JSI Series</span>
                </div>
                <ProductSpotlight
                  selectedSeries={(newLeadData.products || []).map((p) => p.series)}
                  onAdd={addProduct}
                  available={JSI_SERIES}
                  theme={theme}
                />
                {(newLeadData.products || []).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {(newLeadData.products || []).map((product, idx) => {
                      const prompts = getSeriesProcurementPrompts(product.series);
                      return (
                        <div key={`${product.series}-${idx}`} className="rounded-[20px] border overflow-hidden" style={{ borderColor: subtleBorder, backgroundColor: c.surface }}>
                          <ProductCard
                            product={product}
                            idx={idx}
                            onRemove={removeProduct}
                            onUpdate={updateProductOption}
                            theme={theme}
                            showBorder={false}
                          />
                          <div className="border-t" style={{ borderColor: subtleBorder }}>
                            <p className="px-4 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-[0.06em]" style={{ color: c.textSecondary, opacity: 0.5 }}>
                              Manufacturing context <span className="normal-case tracking-normal font-normal opacity-100">· optional</span>
                            </p>
                            {[prompts.first, prompts.second].map((prompt) => (
                              <div key={prompt.key} className="flex items-center gap-3 px-4 py-1.5">
                                <span className="text-xs flex-1 leading-tight" style={{ color: c.textSecondary }}>
                                  {prompt.label}
                                </span>
                                <div className="w-[52%] shrink-0">
                                  <PortalNativeSelect
                                    value={product[prompt.key] || ''}
                                    onChange={(e) => updateProductOption(idx, prompt.key, e.target.value)}
                                    options={prompt.options.map((option) => ({ label: option, value: option }))}
                                    placeholder="Unknown"
                                    theme={theme}
                                    size="sm"
                                    mutedValues={['Unknown']}
                                  />
                                </div>
                              </div>
                            ))}
                            <div className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Section>

            <Section title="Notes & Attachments" theme={theme}>
              <textarea
                value={newLeadData.notes || ''}
                onChange={(e) => upd('notes', e.target.value)}
                rows={3}
                placeholder="Add notes, timing risks, requirements..."
                className="mt-1 w-full px-4 py-3 text-sm rounded-2xl border focus:outline-none resize-none placeholder-theme-secondary transition-shadow"
                style={{ backgroundColor: dark ? c.background : c.surface, borderColor: subtleBorder, color: c.textPrimary }}
                onFocus={(e) => { e.target.style.boxShadow = `0 0 0 3px ${c.accent}33`; e.target.style.borderColor = c.accent || subtleBorder; }}
                onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = subtleBorder; }}
              />

              <div className="mt-2 space-y-1.5">
                <div
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-dashed px-3.5 py-3 transition-colors cursor-pointer"
                  style={{
                    borderColor: dragActive ? c.accent : subtleBorder,
                    backgroundColor: dragActive ? `${c.accent}12` : (dark ? 'rgba(255,255,255,0.06)' : 'transparent'),
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <UploadCloud className="w-4 h-4 shrink-0" style={{ color: c.textSecondary, opacity: 0.5 }} />
                    <p className="text-xs" style={{ color: c.textSecondary }}>
                      Tap to attach files <span style={{ opacity: 0.5 }}>· up to {FILE_LIMIT}, 20 MB each</span>
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={FILE_ACCEPT}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>
                {fileNotice && <p className="text-xs" style={{ color: c.error || 'var(--theme-error)' }}>{fileNotice}</p>}
                {(newLeadData.attachments || []).length > 0 && (
                  <div className="space-y-1.5">
                    {(newLeadData.attachments || []).map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
                        style={{ borderColor: subtleBorder, backgroundColor: c.surface }}
                      >
                        <FileText className="w-3.5 h-3.5" style={{ color: c.textSecondary }} />
                        <span className="text-xs font-medium truncate flex-1" style={{ color: c.textPrimary }}>{file.name}</span>
                        <span className="text-xs" style={{ color: c.textSecondary }}>{formatBytes(file.size || 0)}</span>
                        <button
                          type="button"
                          onClick={() => upd('attachments', (newLeadData.attachments || []).filter((_, i) => i !== idx))}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                          aria-label="Remove attachment"
                        >
                          <X className="w-3 h-3" style={{ color: c.textSecondary }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            <Section title="Review & Submit" theme={theme}>
              <div
                className="rounded-xl px-3.5 py-3 mb-3 flex items-center gap-3"
                style={{
                  backgroundColor: `${health.tone}0D`,
                  border: `1.5px solid ${health.tone}30`,
                }}
              >
                <StrengthCircle percent={health.percent} tone={health.tone} size={48} stroke={3.5} textSize="11px" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tabular-nums leading-none" style={{ color: health.tone }}>{health.percent}</span>
                    <span className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full" style={{ color: health.tone, backgroundColor: `${health.tone}20` }}>{health.label}</span>
                    {canSubmit
                      ? <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: health.tone }} />
                      : <AlertTriangle className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: health.tone }} />
                    }
                  </div>
                  <p className="text-[0.6875rem] mt-0.5" style={{ color: health.tone, opacity: 0.7 }}>
                    {health.missing[0] ? `+ ${health.missing[0]}` : 'All key fields complete'}
                  </p>
                </div>
              </div>

              {filledReviewItems.filter((item) => item.label !== 'Notes').length > 0 && (() => {
                const groups = [0, 1, 2].map((stepIdx) => ({
                  stepIdx,
                  items: filledReviewItems.filter((i) => i.step === stepIdx && i.label !== 'Notes'),
                })).filter((g) => g.items.length > 0);
                return (
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: subtleBorder, backgroundColor: c.surface }}>
                    {groups.map((group, gi) => (
                      <React.Fragment key={group.stepIdx}>
                        {gi > 0 && (
                          <div className="flex items-center gap-2 px-3 py-0.5" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)' }}>
                            <div className="flex-1 h-px" style={{ backgroundColor: subtleBorder }} />
                            <span className="text-[0.625rem] font-bold uppercase tracking-[0.08em]" style={{ color: c.textSecondary, opacity: 0.35 }}>
                              {['Basics', 'Scope', 'Details'][group.stepIdx]}
                            </span>
                            <div className="flex-1 h-px" style={{ backgroundColor: subtleBorder }} />
                          </div>
                        )}
                        {group.items.map((item, i) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => animateToStep(item.step)}
                            className="w-full flex items-center gap-2.5 px-3 text-left active:bg-black/[0.04] dark:active:bg-white/[0.08] transition-colors"
                            style={{
                              paddingTop: 9,
                              paddingBottom: 9,
                              borderTop: (gi === 0 && i === 0) ? 'none' : (i > 0 ? `1px solid ${subtleBorder}` : 'none'),
                            }}
                          >
                            <span className="text-[0.6875rem] font-medium shrink-0 w-[88px]" style={{ color: c.textSecondary }}>{item.label}</span>
                            <span className="text-[0.8125rem] font-semibold flex-1 text-right truncate" style={{ color: c.textPrimary }}>{item.value}</span>
                            <ChevronRight className="w-3 h-3 shrink-0 opacity-20" style={{ color: c.textSecondary }} />
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })()}
            </Section>
          </>
        )}
        </div>
      </div>

      <WizardBottomBar
        theme={theme}
        steps={STEP_LABELS}
        currentStep={step}
        onStepChange={animateToStep}
        contentMaxWidthClass={NEW_LEAD_MAX_WIDTH}
        healthNode={<InlineStepHealth health={health} theme={theme} />}
        actionNode={step < 2 ? (
          <div style={{ opacity: stepValid ? 1 : 0.45, transition: 'opacity 0.2s ease' }}>
            <PrimaryButton
              type="button"
              onClick={goNext}
              theme={theme}
              size="default"
              fullWidth
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {step === 0 ? 'Continue to Scope' : 'Continue to Review'}
            </PrimaryButton>
          </div>
        ) : (
          <PrimaryButton
            type="submit"
            theme={theme}
            size="default"
            fullWidth
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Submit Lead
          </PrimaryButton>
        )}
      />
    </form>
  );
};
