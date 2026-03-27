import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, FileText, Paperclip, UploadCloud, X } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput.jsx';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { SpotlightMultiSelect } from '../../components/common/SpotlightMultiSelect.jsx';
import { PillButton, PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { hapticSuccess } from '../../utils/haptics.js';
import { STAGES, VERTICALS, COMPETITORS } from './data.js';
import { DISCOUNT_OPTIONS_WITH_UNKNOWN } from '../../constants/discounts.js';
import { JSI_SERIES } from '../products/data.js';
import { CONTRACTS_DATA } from '../resources/contracts/data.js';
import { ProductCard, ProductSpotlight, Reveal, Row, Section } from './NewLeadScreenComponents.jsx';

const PO_OPTIONS = ['Unknown', '<30 Days', '30-60 Days', '60-180 Days', '180+ Days', 'Next Year'];
const WIN_PRESETS = [10, 25, 50, 75, 90];
const getWinBand = (pct) => {
  if (pct <= 15) return { label: 'Unlikely', tone: '#B85C5C' };
  if (pct <= 35) return { label: 'Possible', tone: '#C4956A' };
  if (pct <= 55) return { label: 'Even Odds', tone: '#5B7B8C' };
  if (pct <= 75) return { label: 'Likely', tone: '#4A7C59' };
  return { label: 'Strong', tone: '#4A7C59' };
};

const TOP_100_CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'Indianapolis, IN', 'San Francisco, CA', 'Seattle, WA', 'Denver, CO', 'Nashville, TN',
  'Oklahoma City, OK', 'El Paso, TX', 'Washington, DC', 'Las Vegas, NV', 'Louisville, KY',
  'Memphis, TN', 'Portland, OR', 'Baltimore, MD', 'Milwaukee, WI', 'Albuquerque, NM',
  'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA', 'Kansas City, MO', 'Mesa, AZ',
  'Atlanta, GA', 'Omaha, NE', 'Colorado Springs, CO', 'Raleigh, NC', 'Long Beach, CA',
  'Virginia Beach, VA', 'Minneapolis, MN', 'Tampa, FL', 'New Orleans, LA', 'Arlington, TX',
  'Bakersfield, CA', 'Honolulu, HI', 'Anaheim, CA', 'Aurora, CO', 'Santa Ana, CA',
  'Corpus Christi, TX', 'Riverside, CA', 'Lexington, KY', 'St. Louis, MO', 'Pittsburgh, PA',
  'Stockton, CA', 'Anchorage, AK', 'Cincinnati, OH', 'St. Paul, MN', 'Greensboro, NC',
  'Toledo, OH', 'Newark, NJ', 'Plano, TX', 'Henderson, NV', 'Orlando, FL',
  'Lincoln, NE', 'Jersey City, NJ', 'Chandler, AZ', 'Fort Wayne, IN', 'St. Petersburg, FL',
  'Laredo, TX', 'Norfolk, VA', 'Madison, WI', 'Durham, NC', 'Lubbock, TX',
  'Winston-Salem, NC', 'Garland, TX', 'Glendale, AZ', 'Hialeah, FL', 'Reno, NV',
  'Baton Rouge, LA', 'Irvine, CA', 'Chesapeake, VA', 'Irving, TX', 'Scottsdale, AZ',
  'North Las Vegas, NV', 'Fremont, CA', 'Gilbert, AZ', 'San Bernardino, CA', 'Birmingham, AL',
  'Boise, ID', 'Rochester, NY', 'Richmond, VA', 'Spokane, WA', 'Des Moines, IA',
  'Montgomery, AL', 'Modesto, CA', 'Fayetteville, NC', 'Tacoma, WA', 'Akron, OH',
];
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
const getSubtleBorder = (theme) => (isDarkTheme(theme) ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)');

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CAL_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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
  if (ratio < 0.35) return { label: 'At Risk', tone: '#B85C5C', step: 1 };
  if (ratio < 0.6) return { label: 'Developing', tone: '#C4956A', step: 2 };
  if (ratio < 0.85) return { label: 'Strong', tone: '#5B7B8C', step: 3 };
  return { label: 'Ready', tone: '#4A7C59', step: 4 };
};

const FieldError = ({ show, message }) => {
  if (!show || !message) return null;
  return <p className="nl-field-error text-xs mt-1.5" style={{ color: '#B85C5C' }}>{message}</p>;
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
      <span className="text-[11px] font-semibold" style={{ color: health.tone }}>
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
  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : null;

  // Flip calendar above trigger when there isn't enough space below.
  // Re-checks on resize so iOS keyboard open/close (which changes innerHeight) is handled.
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
  const [viewYear, setViewYear] = useState(() => parsed ? parsed.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parsed ? parsed.getMonth() : today.getMonth());

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

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const selectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const isSelected = (day) => parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === day;
  const isToday = (day) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full h-10 rounded-full border flex items-center justify-between px-4 text-[14px] focus:outline-none transition-colors"
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
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: subtleBorder }}>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={prevMonth}
              className="p-1.5 rounded-full transition-colors hover:bg-black/[0.05]">
              <ChevronLeft className="w-4 h-4" style={{ color: c.textSecondary }} />
            </button>
            <span className="text-[13px] font-semibold" style={{ color: c.textPrimary }}>
              {MONTHS_LONG[viewMonth]} {viewYear}
            </span>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={nextMonth}
              className="p-1.5 rounded-full transition-colors hover:bg-black/[0.05]">
              <ChevronRight className="w-4 h-4" style={{ color: c.textSecondary }} />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="px-3 pt-2 pb-1">
            <div className="grid grid-cols-7 mb-0.5">
              {CAL_WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: c.textSecondary, opacity: 0.6 }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, idx) => (
                <div key={idx} className="flex items-center justify-center">
                  {day !== null ? (
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectDay(day); }}
                      onClick={() => selectDay(day)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-all"
                      style={{
                        backgroundColor: isSelected(day) ? c.accent : 'transparent',
                        color: isSelected(day) ? c.accentText : isToday(day) ? c.accent : c.textPrimary,
                        fontWeight: isSelected(day) || isToday(day) ? 700 : 400,
                        outline: isToday(day) && !isSelected(day) ? `1.5px solid ${c.accent}55` : 'none',
                        outlineOffset: '-1.5px',
                      }}
                    >
                      {day}
                    </button>
                  ) : <div className="w-8 h-8" />}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2.5 flex justify-between items-center" style={{ borderColor: subtleBorder }}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="text-[12px] font-medium"
              style={{ color: c.textSecondary }}
            >
              Clear
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const d = today;
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                onChange(`${d.getFullYear()}-${mm}-${dd}`);
                setIsOpen(false);
              }}
              className="text-[12px] font-semibold"
              style={{ color: c.accent }}
            >
              Today
            </button>
          </div>
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
  const stageOptions = useMemo(() => STAGES.filter((stage) => stage !== 'Won' && stage !== 'Lost'), []);

  const [step, setStep] = useState(0);
  const [stepAnimClass, setStepAnimClass] = useState('');
  const prevStepRef = useRef(0);

  // Declared early so effects that depend on it don't hit the temporal dead zone
  const animateToStep = useCallback((nextStep) => {
    const dir = nextStep > prevStepRef.current ? 'nl-fwd' : 'nl-back';
    prevStepRef.current = nextStep;
    setStepAnimClass(dir);
    setStep(nextStep);
  }, []);

  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileNotice, setFileNotice] = useState('');
  // Location/date "Unknown" collapsed state — show input only when user explicitly opens it
  const [locationInputOpen, setLocationInputOpen] = useState(() => !!newLeadData.installationLocation);
  const [dateInputOpen, setDateInputOpen] = useState(() => !!newLeadData.expectedInstallDate);
  // Dealers "Out to Bid" state — collapses search area to a single pill
  const [dealerOutToBid, setDealerOutToBid] = useState(() => (newLeadData.dealers || []).includes('Out to Bid'));
  // Competition expanded state — goes full-width once first competitor added; resets only when toggle turned off
  const [compExpanded, setCompExpanded] = useState(() => (newLeadData.competitors || []).length > 0);

  // Custom discount mode — true when the stored value isn't in the predefined list
  const [discountCustom, setDiscountCustom] = useState(
    () => !!(newLeadData.discount && !DISCOUNT_OPTIONS_WITH_UNKNOWN.includes(newLeadData.discount)),
  );
  const fileInputRef = useRef(null);
  const [endUserOptions, setEndUserOptions] = useState(() => mergeUnique(
    END_USER_OPTIONS,
    (opportunities || []).map((opp) => opp.company),
  ));

  useEffect(() => {
    if (newLeadData.projectStatus && !stageOptions.includes(newLeadData.projectStatus)) {
      onNewLeadChange({ projectStatus: stageOptions[0] });
    }
  }, [newLeadData.projectStatus, onNewLeadChange, stageOptions]);

  useEffect(() => {
    if (!String(newLeadData.endUser || '').trim()) return;
    setEndUserOptions((prev) => mergeUnique(prev, newLeadData.endUser));
  }, [newLeadData.endUser]);

  useEffect(() => {
    setEndUserOptions((prev) => mergeUnique(prev, (opportunities || []).map((opp) => opp.company)));
  }, [opportunities]);

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
      return () => setBackHandler(null);
    }
    setBackHandler(() => {
      animateToStep(Math.max(step - 1, 0));
      return true; // consumed — prevent screen-level navigation
    });
    return () => setBackHandler(null);
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
        .nl-fwd  { animation: nl-slide-in-right .25s cubic-bezier(.25,.46,.45,.94) both; }
        .nl-back { animation: nl-slide-in-left  .25s cubic-bezier(.25,.46,.45,.94) both; }

        .win-slider { -webkit-appearance:none; appearance:none; height:5px; border-radius:99px; outline:none; cursor:pointer; display:block; width:100%; }
        .win-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:50%; background:#fff; border:2.5px solid var(--ws-accent,#666); box-shadow:0 1px 6px rgba(0,0,0,0.18); cursor:pointer; transition:transform .12s ease, box-shadow .12s ease; }
        .win-slider::-webkit-slider-thumb:active { transform:scale(1.18); box-shadow:0 2px 12px rgba(0,0,0,0.22); }
        .win-slider::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:#fff; border:2.5px solid var(--ws-accent,#666); box-shadow:0 1px 6px rgba(0,0,0,0.18); cursor:pointer; box-sizing:border-box; }
        .win-slider:focus { outline:none; }
        .win-slider:focus-visible::-webkit-slider-thumb { box-shadow:0 0 0 4px var(--ws-accent-ring,rgba(0,0,0,0.15)), 0 1px 6px rgba(0,0,0,0.18); }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const upd = useCallback((field, value) => {
    if (field === 'vertical' && value !== 'Other (Please specify)') {
      onNewLeadChange({ vertical: value, otherVertical: '' });
      return;
    }
    if (field === 'competitionPresent' && value === false) {
      onNewLeadChange({ competitionPresent: false, competitors: [], otherCompetitor: '' });
      return;
    }
    onNewLeadChange({ [field]: value });
  }, [onNewLeadChange]);

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const addEndUserOption = useCallback((value) => {
    const normalized = String(value || '').trim();
    if (!normalized) return;
    setEndUserOptions((prev) => mergeUnique(prev, normalized));
    upd('endUser', normalized);
    markTouched('endUser');
  }, [markTouched, upd]);

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
    // Require BOTH project and end user to have enough characters and BOTH to match
    if (!projectQuery || !endUserQuery) return [];
    return (opportunities || [])
      .filter((opp) => {
        const name = normalizeText(opp.name || opp.project);
        const company = normalizeText(opp.company);
        const projectHit = name.includes(projectQuery) || projectQuery.includes(name);
        const companyHit = company.includes(endUserQuery) || endUserQuery.includes(company);
        return projectHit && companyHit;
      })
      .slice(0, 3);
  }, [newLeadData.project, newLeadData.endUser, opportunities]);

  const errors = useMemo(() => {
    const next = {};
    if (!String(newLeadData.project || '').trim()) next.project = 'Project name is required.';
    if (!newLeadData.projectStatus) next.projectStatus = 'Project stage is required.';
    if (!newLeadData.vertical) next.vertical = 'Vertical is required.';
    if (newLeadData.vertical === 'Other (Please specify)' && !String(newLeadData.otherVertical || '').trim()) {
      next.otherVertical = 'Please enter the vertical type.';
    }
    if (parseCurrency(newLeadData.estimatedList) <= 0) next.estimatedList = 'Estimated list must be greater than zero.';
    if (!String(newLeadData.endUser || '').trim()) next.endUser = 'Select or create an end user.';
    if (!(newLeadData.dealers || []).length) next.dealers = 'Add at least one dealer.';
    if (!newLeadData.poTimeframe) next.poTimeframe = 'PO timeframe is required.';
    if (newLeadData.competitionPresent && !(newLeadData.competitors || []).length) {
      next.competitors = 'Add at least one competitor or switch Competition off.';
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
    newLeadData.dealers,
    newLeadData.poTimeframe,
    newLeadData.competitionPresent,
    newLeadData.competitors,
    newLeadData.jsiQuoteExists,
    newLeadData.jsiQuoteNumber,
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
      '<30 Days': 8,
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
      ? ((newLeadData.competitors || []).length ? 4 : 1)
      : 7;

    const signals = [
      { label: 'Project Name', points: String(newLeadData.project || '').trim() ? 5 : 0, max: 5 },
      { label: 'Stage Progress', points: Math.round(stageProgress * 10), max: 10 },
      { label: 'Vertical', points: newLeadData.vertical && (newLeadData.vertical !== 'Other (Please specify)' || String(newLeadData.otherVertical || '').trim()) ? 3 : 0, max: 3 },
      { label: 'Win Probability', points: Math.round((winProbabilityValue / 100) * 10), max: 10 },
      { label: 'Estimated List', points: estimatedListPoints, max: 14 },
      { label: 'PO Timeframe', points: poTimeframePoints, max: 8 },
      { label: 'End User', points: String(newLeadData.endUser || '').trim() ? 5 : 0, max: 5 },
      { label: 'Dealer Coverage', points: (newLeadData.dealers || []).length ? 6 : 0, max: 6 },
      { label: 'A&D Alignment', points: (newLeadData.designFirms || []).length ? 3 : 1, max: 3 },
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
    newLeadData.dealers,
    newLeadData.designFirms,
    newLeadData.competitionPresent,
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
    add('Vertical', newLeadData.vertical === 'Other (Please specify)' ? newLeadData.otherVertical : newLeadData.vertical, 0);
    if (newLeadData.installationLocation) add('Location', newLeadData.installationLocation, 0);
    if (newLeadData.expectedInstallDate) add('Install Date', newLeadData.expectedInstallDate, 0);
    if (parsedEstimatedList > 0) add('Estimated List', `$${parsedEstimatedList.toLocaleString()}`, 1);
    add('PO Timeframe', newLeadData.poTimeframe, 1);
    add('End User', newLeadData.endUser, 1);
    if ((newLeadData.dealers || []).length) add('Dealers', (newLeadData.dealers || []).join(', '), 1);
    if ((newLeadData.designFirms || []).length) add('A&D Firms', (newLeadData.designFirms || []).join(', '), 1);
    if (newLeadData.competitionPresent) {
      add('Competition', 'Present', 1);
      if ((newLeadData.competitors || []).length) add('Competitors', (newLeadData.competitors || []).join(', '), 1);
    } else {
      add('Competition', 'None', 1);
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
    newLeadData.dealers,
    newLeadData.designFirms,
    newLeadData.installationLocation,
    newLeadData.expectedInstallDate,
    quoteMode,
    newLeadData.jsiQuoteNumber,
    selectedSeriesNames,
    seriesCount,
    newLeadData.competitionPresent,
    newLeadData.competitors,
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
    <form onSubmit={handleSubmit} className="min-h-full app-header-offset flex flex-col" style={{ backgroundColor: c.background }}>
      {/* Invisible focus sink — prevents AnimatedScreenWrapper from focusing a heading on mount */}
      <div data-autofocus tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', outline: 'none' }} />
      <div className="px-4 sm:px-5 pt-5 pb-40 max-w-3xl mx-auto w-full">

        <div key={step} className={`space-y-4 ${stepAnimClass}`}>
        {step === 0 && (
          <>
            <Section title="Project Basics" subtitle="Required project context to register this lead." theme={theme}>
              <Row label="Project Name" theme={theme} inline noSep>
                <div>
                  <FormInput
                    value={newLeadData.project || ''}
                    onChange={(e) => { upd('project', e.target.value); markTouched('project'); }}
                    onBlur={() => markTouched('project')}
                    placeholder="Enter project name"
                    theme={theme}
                    size="sm"
                    surfaceBg
                  />
                  <FieldError show={!!visibleError('project')} message={visibleError('project')} />
                </div>
              </Row>

              <Row label="Stage" theme={theme} inline>
                <div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {stageOptions.map((stage, idx) => {
                      const num = idx + 1;
                      const isSelected = newLeadData.projectStatus === stage;
                      const isPast = stageIndex > idx;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => { upd('projectStatus', stage); markTouched('projectStatus'); }}
                          className="flex items-center gap-2.5 rounded-full border transition-all text-left px-3 py-2.5"
                          style={{
                            backgroundColor: isSelected ? c.accent : isPast ? `${c.accent}14` : 'transparent',
                            borderColor: isSelected ? c.accent : isPast ? `${c.accent}50` : subtleBorder,
                          }}
                        >
                          <span
                            className="text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : isPast ? `${c.accent}20` : dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                              color: isSelected ? c.accentText : isPast ? c.accent : c.textSecondary,
                            }}
                          >
                            {num}
                          </span>
                          <span
                            className="text-[13px] font-semibold leading-tight"
                            style={{ color: isSelected ? c.accentText : c.textPrimary }}
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
                  {newLeadData.vertical === 'Other (Please specify)' ? (
                    <div className="rounded-[18px] border overflow-hidden" style={{ borderColor: subtleBorder, backgroundColor: c.surface }}>
                      <PortalNativeSelect
                        value={newLeadData.vertical || ''}
                        onChange={(e) => { upd('vertical', e.target.value); markTouched('vertical'); }}
                        options={VERTICALS.map((v) => ({ label: v === 'Other (Please specify)' ? 'Other' : v, value: v }))}
                        placeholder="Select vertical"
                        theme={theme}
                        size="sm"
                        bordered={false}
                      />
                      <div className="h-px" style={{ backgroundColor: subtleBorder }} />
                      <input
                        type="text"
                        value={newLeadData.otherVertical || ''}
                        onChange={(e) => { upd('otherVertical', e.target.value); markTouched('otherVertical'); }}
                        onBlur={() => markTouched('otherVertical')}
                        placeholder="Specify other vertical"
                        className="w-full h-9 px-3.5 text-[13px] focus:outline-none focus:ring-0 placeholder-theme-secondary bg-transparent border-0"
                        style={{ color: c.textPrimary }}
                      />
                    </div>
                  ) : (
                    <PortalNativeSelect
                      value={newLeadData.vertical || ''}
                      onChange={(e) => { upd('vertical', e.target.value); markTouched('vertical'); }}
                      options={VERTICALS.map((v) => ({ label: v === 'Other (Please specify)' ? 'Other' : v, value: v }))}
                      placeholder="Select vertical"
                      theme={theme}
                      size="sm"
                    />
                  )}
                  <FieldError show={!!visibleError('vertical')} message={visibleError('vertical')} />
                  <FieldError show={!!visibleError('otherVertical')} message={visibleError('otherVertical')} />
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
                        options={TOP_100_CITIES}
                        placeholder="Search city..."
                        theme={theme}
                        compact
                        resetOnSelect={false}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { upd('installationLocation', ''); setLocationInputOpen(false); }}
                      className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all"
                      style={{ borderColor: subtleBorder, color: c.textSecondary, backgroundColor: 'transparent' }}
                    >
                      Unknown
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLocationInputOpen(true)}
                    className="w-full h-10 rounded-full border flex items-center justify-between px-4 text-[14px] transition-colors"
                    style={{ borderColor: subtleBorder, backgroundColor: dark ? c.background : c.surface, color: c.textSecondary }}
                  >
                    <span className="text-[13px] font-medium">Unknown</span>
                    <span className="text-[11px]" style={{ color: c.textSecondary, opacity: 0.55 }}>Set location</span>
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
                    <button
                      type="button"
                      onClick={() => { upd('expectedInstallDate', ''); setDateInputOpen(false); }}
                      className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all"
                      style={{ borderColor: subtleBorder, color: c.textSecondary, backgroundColor: 'transparent' }}
                    >
                      Unknown
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDateInputOpen(true)}
                    className="w-full h-10 rounded-full border flex items-center justify-between px-4 transition-colors"
                    style={{ borderColor: subtleBorder, backgroundColor: dark ? c.background : c.surface, color: c.textSecondary }}
                  >
                    <span className="text-[13px] font-medium">Unknown</span>
                    <span className="text-[11px]" style={{ color: c.textSecondary, opacity: 0.55 }}>Set date</span>
                  </button>
                )}
              </Row>
            </Section>

            <Reveal show={!!duplicateMatches.length}>
              <div style={{ paddingTop: '1rem' }}>
                <Section title="Potential Duplicates" theme={theme}>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#B85C5C' }}>
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
            <Section title="Commercial Scope" subtitle="Sizing, timeline, and discount details." theme={theme}>
              <Row label="Estimated List" theme={theme} inline noSep>
                <div>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.,]*"
                    value={newLeadData.estimatedList || ''}
                    onChange={(e) => { upd('estimatedList', e.target.value); markTouched('estimatedList'); }}
                    onBlur={() => markTouched('estimatedList')}
                    placeholder="Estimated list amount"
                    className="w-full outline-none"
                    style={{
                      height: 40,
                      borderRadius: 24,
                      border: `1px solid ${getSubtleBorder(theme)}`,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.textPrimary,
                      fontSize: 14,
                      padding: '0 14px',
                    }}
                  />
                  <FieldError show={!!visibleError('estimatedList')} message={visibleError('estimatedList')} />
                </div>
              </Row>

              <Row label="Win %" theme={theme} inline>
                {(() => {
                  const winProb = newLeadData.winProbability ?? 50;
                  const winBand = getWinBand(winProb);
                  const trackBg = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="tabular-nums leading-none" style={{ color: c.textPrimary, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
                          {winProb}<span style={{ fontSize: 15, fontWeight: 600, color: c.textSecondary, marginLeft: 2 }}>%</span>
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${winBand.tone}1A`, color: winBand.tone, transition: 'color .15s, background-color .15s' }}
                        >
                          {winBand.label}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={winProb}
                        onChange={(e) => upd('winProbability', Number(e.target.value))}
                        className="win-slider"
                        style={{
                          '--ws-accent': c.accent,
                          '--ws-accent-ring': `${c.accent}44`,
                          background: `linear-gradient(to right, ${c.accent} ${winProb}%, ${trackBg} ${winProb}%)`,
                        }}
                      />
                      <div className="flex gap-1.5 mt-3">
                        {WIN_PRESETS.map((pct) => {
                          const active = winProb === pct;
                          return (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => upd('winProbability', pct)}
                              className="flex-1 rounded-full py-1.5 border transition-all"
                              style={{
                                fontSize: 11,
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
                  <div className="grid grid-cols-3 gap-1.5">
                    {PO_OPTIONS.map((item) => (
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
                    <button
                      type="button"
                      onClick={() => { setDiscountCustom(false); upd('discount', ''); }}
                      className="shrink-0 text-[12px] font-medium px-2.5 py-1.5 rounded-full border transition-colors"
                      style={{ color: c.textSecondary, borderColor: subtleBorder }}
                    >
                      ← Discounts
                    </button>
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

            <Section title="Stakeholders & Competition" subtitle="Who's involved and who you're up against." theme={theme}>
              <Row label="End User" theme={theme} inline noSep>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <AutoCompleteCombobox
                        value={newLeadData.endUser || ''}
                        onChange={(val) => { upd('endUser', val); markTouched('endUser'); }}
                        onSelect={(val) => { upd('endUser', val); markTouched('endUser'); }}
                        onAddNew={addEndUserOption}
                        options={endUserOptions}
                        placeholder="Search or add end user"
                        theme={theme}
                        compact
                        resetOnSelect={false}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { upd('endUser', 'Unknown'); markTouched('endUser'); }}
                      className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all"
                      style={{
                        borderColor: newLeadData.endUser === 'Unknown' ? theme.colors.accent : subtleBorder,
                        color: newLeadData.endUser === 'Unknown' ? theme.colors.accent : c.textSecondary,
                        backgroundColor: newLeadData.endUser === 'Unknown' ? `${theme.colors.accent}12` : 'transparent',
                      }}
                    >
                      Unknown
                    </button>
                  </div>
                  <FieldError show={!!visibleError('endUser')} message={visibleError('endUser')} />
                </div>
              </Row>

              <Row label="Dealer(s)" theme={theme} inline>
                <div>
                  {dealerOutToBid ? (
                    <button
                      type="button"
                      onClick={() => { setDealerOutToBid(false); upd('dealers', []); markTouched('dealers'); }}
                      className="w-full h-10 rounded-full border flex items-center justify-between px-4 transition-colors"
                      style={{ borderColor: theme.colors.accent, backgroundColor: `${theme.colors.accent}12`, color: c.textPrimary }}
                    >
                      <span className="text-[13px] font-medium" style={{ color: theme.colors.accent }}>Out to Bid</span>
                      <span className="text-[11px]" style={{ color: c.textSecondary, opacity: 0.55 }}>Add dealers</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <SpotlightMultiSelect
                          selectedItems={newLeadData.dealers || []}
                          onAddItem={(dealer) => {
                            const norm = dealer.trim();
                            const current = newLeadData.dealers || [];
                            if (!current.some((d) => d.toLowerCase() === norm.toLowerCase())) upd('dealers', [...current, norm]);
                            markTouched('dealers');
                          }}
                          onRemoveItem={(dealer) => { upd('dealers', (newLeadData.dealers || []).filter((item) => item !== dealer)); markTouched('dealers'); }}
                          options={(newLeadData.dealers || []).length > 0 ? (dealers || []).filter((item) => item !== 'Undecided') : (dealers || [])}
                          onAddNew={(dealer) => { const norm = dealer.trim(); setDealers((prev) => prev.some((d) => d.toLowerCase() === norm.toLowerCase()) ? prev : [norm, ...prev]); }}
                          placeholder="Search or create dealer"
                          theme={theme}
                          compact={false}
                          integratedChips
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => { setDealerOutToBid(true); upd('dealers', ['Out to Bid']); markTouched('dealers'); }}
                        className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all"
                        style={{ borderColor: subtleBorder, color: c.textSecondary, backgroundColor: 'transparent' }}
                      >
                        Out to Bid
                      </button>
                    </div>
                  )}
                  <FieldError show={!!visibleError('dealers')} message={visibleError('dealers')} />
                </div>
              </Row>

              <Row label="A&D Firm(s)" theme={theme} inline>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <SpotlightMultiSelect
                      selectedItems={newLeadData.designFirms || []}
                      onAddItem={(firm) => {
                        const norm = firm.trim();
                        const current = newLeadData.designFirms || [];
                        if (!current.some((f) => f.toLowerCase() === norm.toLowerCase())) upd('designFirms', [...current, norm]);
                      }}
                      onRemoveItem={(firm) => upd('designFirms', (newLeadData.designFirms || []).filter((item) => item !== firm))}
                      options={['Unknown', ...(designFirms || []).filter((f) => f !== 'Unknown')]}
                      onAddNew={(firm) => { const norm = firm.trim(); setDesignFirms((prev) => prev.some((f) => f.toLowerCase() === norm.toLowerCase()) ? prev : [norm, ...prev]); }}
                      placeholder="Search or create firm"
                      theme={theme}
                      compact={false}
                      integratedChips
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current = newLeadData.designFirms || [];
                      if (!current.includes('Unknown')) upd('designFirms', ['Unknown', ...current]);
                    }}
                    className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all"
                    style={{
                      borderColor: (newLeadData.designFirms || []).includes('Unknown') ? theme.colors.accent : subtleBorder,
                      color: (newLeadData.designFirms || []).includes('Unknown') ? theme.colors.accent : c.textSecondary,
                      backgroundColor: (newLeadData.designFirms || []).includes('Unknown') ? `${theme.colors.accent}12` : 'transparent',
                    }}
                  >
                    Unknown
                  </button>
                </div>
              </Row>

              {/* Competition */}
              <div className="py-2.5 border-t" style={{ borderColor: subtleBorder }}>
                {compExpanded && newLeadData.competitionPresent ? (
                  /* ── Expanded: label+toggle header, full-width search+chips below ── */
                  <>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[13px] font-semibold" style={{ color: c.textSecondary }}>Competition</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px]" style={{ color: c.textSecondary }}>Active</span>
                        <ToggleSwitch
                          checked
                          onChange={() => {
                            upd('competitionPresent', false);
                            upd('competitors', []);
                            setCompExpanded(false);
                            markTouched('competitionPresent');
                            markTouched('competitors');
                          }}
                          theme={theme}
                        />
                      </div>
                    </div>
                    <SpotlightMultiSelect
                      selectedItems={newLeadData.competitors || []}
                      onAddItem={(competitor) => {
                        const norm = competitor.trim();
                        const current = newLeadData.competitors || [];
                        if (!current.some((co) => co.toLowerCase() === norm.toLowerCase())) upd('competitors', [...current, norm]);
                        markTouched('competitors');
                      }}
                      onRemoveItem={(competitor) => { upd('competitors', (newLeadData.competitors || []).filter((item) => item !== competitor)); markTouched('competitors'); }}
                      options={['Unknown', ...COMPETITORS.filter((name) => name !== 'None' && name !== 'Unknown')]}
                      onAddNew={(name) => { const norm = name.trim(); upd('competitors', [...new Set([...(newLeadData.competitors || []), norm])]); }}
                      placeholder="Search or add competitor"
                      theme={theme}
                      compact={false}
                      integratedChips={false}
                      bordered
                    />
                  </>
                ) : (
                  /* ── Compact: all inline — label | search (if active) | None/Active | toggle ── */
                  <div className="flex items-center gap-2 min-h-[40px]">
                    <span className="text-[13px] font-semibold shrink-0" style={{ color: c.textSecondary }}>Competition</span>
                    {newLeadData.competitionPresent && (
                      <div className="flex-1 min-w-0">
                        <SpotlightMultiSelect
                          selectedItems={[]}
                          onAddItem={(competitor) => {
                            const norm = competitor.trim();
                            upd('competitors', [norm]);
                            setCompExpanded(true);
                            markTouched('competitors');
                          }}
                          onRemoveItem={() => {}}
                          options={['Unknown', ...COMPETITORS.filter((name) => name !== 'None' && name !== 'Unknown')]}
                          onAddNew={(name) => {
                            const norm = name.trim();
                            upd('competitors', [norm]);
                            setCompExpanded(true);
                            markTouched('competitors');
                          }}
                          placeholder="Search or add competitor"
                          theme={theme}
                          compact={false}
                          integratedChips={false}
                          bordered
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      <span className="text-[12px]" style={{ color: c.textSecondary }}>
                        {newLeadData.competitionPresent ? 'Active' : 'None'}
                      </span>
                      <ToggleSwitch
                        checked={!!newLeadData.competitionPresent}
                        onChange={(event) => {
                          upd('competitionPresent', event.target.checked);
                          if (!event.target.checked) { upd('competitors', []); setCompExpanded(false); }
                          markTouched('competitionPresent');
                          markTouched('competitors');
                        }}
                        theme={theme}
                      />
                    </div>
                  </div>
                )}
                <FieldError show={!!visibleError('competitors')} message={visibleError('competitors')} />
              </div>

              {/* Rewards — label left, toggles right */}
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-[13px] font-semibold shrink-0" style={{ color: c.textSecondary }}>Rewards</span>
                <div className="flex items-center gap-5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium" style={{ color: salesRewardEnabled ? c.textPrimary : c.textSecondary }}>Sales 3%</span>
                    <ToggleSwitch
                      checked={salesRewardEnabled}
                      onChange={(event) => { upd('salesReward', event.target.checked); markTouched('salesReward'); }}
                      theme={theme}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium" style={{ color: designerRewardEnabled ? c.textPrimary : c.textSecondary }}>Designer 1%</span>
                    <ToggleSwitch
                      checked={designerRewardEnabled}
                      onChange={(event) => { upd('designerReward', event.target.checked); markTouched('designerReward'); }}
                      theme={theme}
                    />
                  </div>
                </div>
              </div>

            </Section>
          </>
        )}

        {step === 2 && (
          <>
            <Section title="Quote & JSI Series" subtitle="Attach a quote and specify product lines." theme={theme}>
              <Row label="JSI Quote" theme={theme} inline noSep>
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

              {/* JSI Series — full-width, search + cards unified */}
              <div className="py-3">
                <div className="mb-2">
                  <span className="text-[13px] font-semibold" style={{ color: c.textSecondary }}>JSI Series</span>
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
                        <div key={`${product.series}-${idx}`} className="rounded-[22px] border overflow-hidden" style={{ borderColor: subtleBorder, backgroundColor: c.surface }}>
                          <ProductCard
                            product={product}
                            idx={idx}
                            onRemove={removeProduct}
                            onUpdate={updateProductOption}
                            theme={theme}
                            showBorder={false}
                          />
                          {/* Intake — compact inline rows, no heavy inner borders */}
                          <div className="border-t" style={{ borderColor: subtleBorder }}>
                            <p className="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: c.textSecondary, opacity: 0.5 }}>
                              Manufacturing context <span className="normal-case tracking-normal font-normal opacity-100">· optional</span>
                            </p>
                            {[prompts.first, prompts.second].map((prompt) => (
                              <div key={prompt.key} className="flex items-center gap-3 px-4 py-1.5">
                                <span className="text-[12px] flex-1 leading-tight" style={{ color: c.textSecondary }}>
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

            <Section title="Notes & Attachments" subtitle="Optional context and support files." theme={theme}>
              <textarea
                value={newLeadData.notes || ''}
                onChange={(e) => upd('notes', e.target.value)}
                rows={4}
                placeholder="Add context, timing risks, or requirements..."
                className="mt-2.5 w-full px-4 py-3 text-[13px] rounded-2xl border focus:outline-none resize-none placeholder-theme-secondary transition-shadow"
                style={{ backgroundColor: dark ? c.background : c.surface, borderColor: subtleBorder, color: c.textPrimary }}
                onFocus={(e) => { e.target.style.boxShadow = `0 0 0 3px ${c.accent}33`; e.target.style.borderColor = c.accent || subtleBorder; }}
                onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = subtleBorder; }}
              />

              <div className="mt-3 space-y-2">
                <div
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border border-dashed px-4 py-4 transition-colors cursor-pointer"
                  style={{
                    borderColor: dragActive ? c.accent : subtleBorder,
                    backgroundColor: dragActive ? `${c.accent}12` : (dark ? 'rgba(255,255,255,0.03)' : 'transparent'),
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: c.subtle }}>
                      <UploadCloud className="w-4 h-4" style={{ color: c.textSecondary }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: c.textPrimary }}>
                        Drag files here or click to upload
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
                        Optional. Up to {FILE_LIMIT} files, 20 MB each (PDF, Office files, PNG/JPG/HEIC)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ borderColor: subtleBorder, color: c.textPrimary }}
                  >
                    <Paperclip className="w-3.5 h-3.5" /> Browse Files
                  </button>
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
                {fileNotice && <p className="text-xs" style={{ color: '#B85C5C' }}>{fileNotice}</p>}
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

            <Section title="Review & Submit" subtitle="Tap any row to edit." theme={theme}>
              {/* Score card */}
              <div
                className="rounded-2xl px-4 py-4 mb-3 flex items-center gap-4"
                style={{
                  backgroundColor: `${health.tone}0D`,
                  border: `1.5px solid ${health.tone}30`,
                }}
              >
                <StrengthCircle percent={health.percent} tone={health.tone} size={60} stroke={4} textSize="12px" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: health.tone, opacity: 0.7 }}>Lead Score</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[22px] font-bold tabular-nums leading-none" style={{ color: health.tone }}>{health.percent}</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ color: health.tone, backgroundColor: `${health.tone}20` }}>{health.label}</span>
                    {canSubmit
                      ? <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: health.tone }} />
                      : <AlertTriangle className="w-4 h-4 ml-auto shrink-0" style={{ color: health.tone }} />
                    }
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: health.tone, opacity: 0.7 }}>
                    {health.missing[0] ? `+ ${health.missing[0]} will boost your score` : 'All key fields complete'}
                  </p>
                </div>
              </div>

              {/* Single unified review card */}
              {filledReviewItems.filter((item) => item.label !== 'Notes').length > 0 && (() => {
                const groups = [0, 1, 2].map((stepIdx) => ({
                  stepIdx,
                  items: filledReviewItems.filter((i) => i.step === stepIdx && i.label !== 'Notes'),
                })).filter((g) => g.items.length > 0);
                return (
                  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: subtleBorder, backgroundColor: c.surface }}>
                    {groups.map((group, gi) => (
                      <React.Fragment key={group.stepIdx}>
                        {gi > 0 && (
                          <div className="flex items-center gap-2 px-3.5 py-1" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)' }}>
                            <div className="flex-1 h-px" style={{ backgroundColor: subtleBorder }} />
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: c.textSecondary, opacity: 0.4 }}>
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
                            className="w-full flex items-center gap-3 px-3.5 text-left active:bg-black/[0.04] dark:active:bg-white/[0.04] transition-colors"
                            style={{
                              paddingTop: 11,
                              paddingBottom: 11,
                              borderTop: (gi === 0 && i === 0) ? 'none' : (i > 0 ? `1px solid ${subtleBorder}` : 'none'),
                            }}
                          >
                            <span className="text-[12px] font-medium shrink-0 w-[96px]" style={{ color: c.textSecondary }}>{item.label}</span>
                            <span className="text-[13px] font-semibold flex-1 text-right truncate" style={{ color: c.textPrimary }}>{item.value}</span>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-25" style={{ color: c.textSecondary }} />
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
        </div>{/* end animated step wrapper */}
      </div>

      {/* ── Integrated bottom bar: step nav + lead score + action ── */}
      <div
        data-bottom-chrome=""
        className="sticky bottom-0 z-20 border-t"
        style={{ borderColor: subtleBorder, backgroundColor: c.background }}
      >
        {/* Step pills + score row */}
        <div className="max-w-3xl mx-auto px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((label, idx) => {
              const active = step === idx;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => animateToStep(idx)}
                  className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all border"
                  style={{
                    backgroundColor: active ? c.accent : 'transparent',
                    borderColor: active ? c.accent : subtleBorder,
                    color: active ? c.accentText : c.textSecondary,
                    letterSpacing: '0.01em',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <InlineStepHealth health={health} theme={theme} />
        </div>

        {/* Action button */}
        <div className="max-w-3xl mx-auto px-4 sm:px-5 pb-2.5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}>
          {step < 2 ? (
            <div style={{ opacity: stepValid ? 1 : 0.45, transition: 'opacity 0.2s ease' }}>
              <PrimaryButton
                type="button"
                onClick={goNext}
                theme={theme}
                size="default"
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
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
        </div>
      </div>
    </form>
  );
};
