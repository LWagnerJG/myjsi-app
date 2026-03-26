import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Paperclip, UploadCloud, X } from 'lucide-react';
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
const END_USER_OPTIONS = [
  'ABC Corporation', 'GlobalTech', 'Midwest Health', 'State University', 'Metro Hospitality',
  'Innovate Labs', 'XYZ Industries', 'Acme Corp', 'TechVentures', 'Summit Partners',
];

const FILE_LIMIT = 10;
const FILE_MAX_SIZE = 20 * 1024 * 1024;
const FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'heic'];
const FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.heic';
const STEP_LABELS = ['Basics', 'Scope', 'Review'];
const STEP_DESCRIPTIONS = [
  'Capture required project context.',
  'Define commercial scope and stakeholders.',
  'Confirm details before submission.',
];
const getSubtleBorder = (theme) => (isDarkTheme(theme) ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)');

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
        label: 'Power / Data Package',
        key: 'procurementCheckpoint',
        placeholder: 'Select power/data status',
        options: ['Defined', 'Likely Needed', 'Not Needed', 'Unknown'],
      },
      second: {
        label: 'Finish Readiness',
        key: 'productionReadiness',
        placeholder: 'Select finish readiness',
        options: ['Standard Finishes Finalized', 'Custom Finish Pending', 'Needs Design Review'],
      },
    };
  }
  return {
    first: {
      label: 'Upholstery / Textile',
      key: 'procurementCheckpoint',
      placeholder: 'Select textile status',
      options: ['Grade Selected', 'COM/COL Required', 'Needs Dealer Input', 'Unknown'],
    },
    second: {
      label: 'Production Priority',
      key: 'productionReadiness',
      placeholder: 'Select production priority',
      options: ['Standard Lead Time', 'Expedite Request', 'Phased Delivery', 'Unknown'],
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
  return <p className="text-xs mt-1.5" style={{ color: '#B85C5C' }}>{message}</p>;
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

const DiscreteHealthMeter = ({ health, theme, compact = false }) => {
  const c = theme.colors;
  const subtleBorder = getSubtleBorder(theme);
  return (
    <div
      className={`rounded-[20px] border ${compact ? 'px-3 py-2.5' : 'px-3.5 py-3'}`}
      style={{ borderColor: subtleBorder, backgroundColor: c.surface }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.03em]" style={{ color: c.textSecondary }}>
            Lead Score
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="text-lg font-bold leading-none" style={{ color: c.textPrimary }}>
              {health.percent}/100
            </p>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ color: health.tone, backgroundColor: `${health.tone}1A` }}
            >
              {health.label}
            </span>
          </div>
        </div>
        {!compact && <StrengthCircle percent={health.percent} tone={health.tone} size={50} stroke={4} textSize="11px" />}
      </div>
      <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: c.subtle }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${health.percent}%`, backgroundColor: health.tone, transition: 'width 240ms ease' }}
        />
      </div>
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
  const fileInputRef = useRef(null);
  const installDateInputRef = useRef(null);
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

  const stageIndex = useMemo(() => {
    const idx = stageOptions.indexOf(newLeadData.projectStatus);
    return idx >= 0 ? idx : 0;
  }, [newLeadData.projectStatus, stageOptions]);

  const openInstallDatePicker = useCallback(() => {
    const input = installDateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }, []);

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
    if (!projectQuery && !endUserQuery) return [];
    return (opportunities || [])
      .filter((opp) => {
        const name = normalizeText(opp.name || opp.project);
        const company = normalizeText(opp.company);
        const projectHit = projectQuery && (name.includes(projectQuery) || projectQuery.includes(name));
        const companyHit = endUserQuery && (company.includes(endUserQuery) || endUserQuery.includes(company));
        return projectHit || companyHit;
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
    if (quoteMode === 'existing' && newLeadData.jsiQuoteNumber) add('JSI Quote #', newLeadData.jsiQuoteNumber, 1);
    if (quoteMode === 'needed') add('Quote', 'Quote needed', 1);
    if (quoteMode === 'not-needed') add('Quote', 'No quote needed', 1);
    if (selectedSeriesNames.length) add('JSI Series', selectedSeriesNames.join(', '), 1);
    if (seriesCount) add('Series Intake', `${intakeReadyCount}/${seriesCount} ready`, 1);
    if (newLeadData.competitionPresent) {
      add('Competition', 'Present', 1);
      if ((newLeadData.competitors || []).length) add('Competitors', (newLeadData.competitors || []).join(', '), 1);
    } else {
      add('Competition', 'None', 1);
    }
    add('Rewards', [salesRewardEnabled ? 'Sales 3%' : null, designerRewardEnabled ? 'Designer 1%' : null].filter(Boolean).join(' · ') || 'None', 1);
    if (notesPreview) add('Notes', notesPreview);
    if ((newLeadData.attachments || []).length) add('Attachments', `${(newLeadData.attachments || []).length} file(s)`);

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

  const reviewAiSummary = useMemo(() => {
    const stageLabel = stageOptions[stageIndex] || 'unknown stage';
    const winProb = newLeadData.winProbability || 50;
    const estimatedText = parsedEstimatedList > 0 ? `$${parsedEstimatedList.toLocaleString()}` : null;

    const risks = [];
    if (winProb < 30) risks.push(`low win probability at ${winProb}%`);
    if (newLeadData.poTimeframe === 'Next Year' || newLeadData.poTimeframe === '180+ Days') risks.push('long PO timeline');
    if (!estimatedText) risks.push('no estimated list value');
    if (newLeadData.competitionPresent && !(newLeadData.competitors || []).length) risks.push('competition flagged but no competitors named');
    if (!(newLeadData.dealers || []).length) risks.push('no dealer assigned');
    if ((newLeadData.products || []).length && intakeReadyCount < (newLeadData.products || []).length) risks.push('product intake incomplete');

    const positives = [];
    if (winProb >= 70) positives.push(`strong ${winProb}% win probability`);
    if (parsedEstimatedList >= 100000) positives.push(`significant opportunity at ${estimatedText}`);
    if (quoteMode === 'existing') positives.push('existing quote attached');
    if ((newLeadData.designFirms || []).length) positives.push('A&D firm engaged');

    let summary = `${health.label} lead (${health.percent}/100) — ${stageLabel} stage`;
    if (estimatedText) summary += `, estimated list ${estimatedText}`;
    summary += '.';
    if (risks.length) summary += ` Watch: ${risks.join('; ')}.`;
    if (positives.length) summary += ` Strong signals: ${positives.join(', ')}.`;
    if (health.missing[0]) summary += ` Biggest score lift: complete ${health.missing[0]}.`;

    return summary;
  }, [
    health.label,
    health.percent,
    health.missing,
    intakeReadyCount,
    newLeadData.competitionPresent,
    newLeadData.competitors,
    newLeadData.dealers,
    newLeadData.designFirms,
    newLeadData.poTimeframe,
    newLeadData.products,
    newLeadData.winProbability,
    parsedEstimatedList,
    quoteMode,
    stageIndex,
    stageOptions,
  ]);

  const visibleError = useCallback((field) => {
    return (submitAttempted || touched[field]) ? errors[field] : null;
  }, [errors, submitAttempted, touched]);

  const stepValid = useMemo(() => {
    if (step === 0) return !errors.project && !errors.projectStatus && !errors.vertical && !errors.otherVertical;
    if (step === 1) return !errors.estimatedList && !errors.endUser && !errors.dealers && !errors.poTimeframe && !errors.competitors && !errors.jsiQuoteNumber;
    return !errors.project && !errors.projectStatus && !errors.vertical && !errors.otherVertical && !errors.estimatedList && !errors.endUser && !errors.dealers && !errors.poTimeframe && !errors.competitors && !errors.jsiQuoteNumber;
  }, [errors, step]);

  const canSubmit = useMemo(() => {
    return !errors.project && !errors.projectStatus && !errors.vertical && !errors.otherVertical
      && !errors.estimatedList && !errors.endUser && !errors.dealers && !errors.poTimeframe && !errors.competitors && !errors.jsiQuoteNumber;
  }, [errors]);

  const markStepFieldsTouched = useCallback((stepIdx) => {
    if (stepIdx === 0) setTouched((prev) => ({ ...prev, project: true, projectStatus: true, vertical: true, otherVertical: true }));
    if (stepIdx === 1) setTouched((prev) => ({ ...prev, estimatedList: true, endUser: true, dealers: true, poTimeframe: true, competitors: true, jsiQuoteNumber: true }));
  }, []);

  const goNext = useCallback(() => {
    markStepFieldsTouched(step);
    if (!stepValid) {
      const panel = document.querySelector('.panel-content');
      if (panel) panel.scrollTop = 0;
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
    if (!canSubmit) {
      // Navigate to the first step that has errors so user sees them
      const step0Valid = !errors.project && !errors.projectStatus && !errors.vertical && !errors.otherVertical;
      animateToStep(step0Valid ? 1 : 0);
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
                  <div className="flex flex-wrap gap-1.5">
                    {stageOptions.map((stage) => (
                      <PillButton
                        key={stage}
                        size="xs"
                        isSelected={newLeadData.projectStatus === stage}
                        onClick={() => { upd('projectStatus', stage); markTouched('projectStatus'); }}
                        theme={theme}
                      >
                        {stage}
                      </PillButton>
                    ))}
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

              <Row label="Location" theme={theme} inline>
                <FormInput
                  value={newLeadData.installationLocation || ''}
                  onChange={(e) => { upd('installationLocation', e.target.value); markTouched('installationLocation'); }}
                  placeholder="City, State"
                  theme={theme}
                  size="sm"
                  surfaceBg
                />
              </Row>

              <Row label="Install Date" theme={theme} inline>
                <div className="relative">
                  <input
                    ref={installDateInputRef}
                    type="date"
                    value={newLeadData.expectedInstallDate || ''}
                    onChange={(e) => upd('expectedInstallDate', e.target.value)}
                    onClick={openInstallDatePicker}
                    className="w-full h-10 rounded-full border px-4 pr-10 text-[13px] text-left focus:outline-none focus:ring-0 jsi-date-input"
                    style={{
                      backgroundColor: dark ? c.background : c.surface,
                      borderColor: subtleBorder,
                      color: c.textPrimary,
                    }}
                  />
                </div>
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
                  <FormInput
                    type="currency"
                    value={newLeadData.estimatedList || ''}
                    onChange={(e) => { upd('estimatedList', e.target.value); markTouched('estimatedList'); }}
                    onBlur={() => markTouched('estimatedList')}
                    placeholder="Estimated list amount"
                    theme={theme}
                    size="sm"
                    surfaceBg
                  />
                  <FieldError show={!!visibleError('estimatedList')} message={visibleError('estimatedList')} />
                </div>
              </Row>

              <Row label="Win Probability" theme={theme} inline>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pct) => (
                    <PillButton
                      key={pct}
                      size="xs"
                      isSelected={(newLeadData.winProbability || 50) === pct}
                      onClick={() => upd('winProbability', pct)}
                      theme={theme}
                    >
                      {pct}%
                    </PillButton>
                  ))}
                </div>
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
                <PortalNativeSelect
                  value={newLeadData.discount || ''}
                  onChange={(e) => upd('discount', e.target.value)}
                  options={DISCOUNT_OPTIONS_WITH_UNKNOWN.map((d) => ({ label: d, value: d }))}
                  placeholder="Select discount"
                  theme={theme}
                  size="sm"
                  mutedValues={['Unknown']}
                />
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
                  <FieldError show={!!visibleError('endUser')} message={visibleError('endUser')} />
                </div>
              </Row>

              <Row label="Dealer(s)" theme={theme} inline>
                <div>
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
                  <FieldError show={!!visibleError('dealers')} message={visibleError('dealers')} />
                </div>
              </Row>

              <Row label="A&D Firm(s)" theme={theme} inline>
                <SpotlightMultiSelect
                  selectedItems={newLeadData.designFirms || []}
                  onAddItem={(firm) => {
                    const norm = firm.trim();
                    const current = newLeadData.designFirms || [];
                    if (!current.some((f) => f.toLowerCase() === norm.toLowerCase())) upd('designFirms', [...current, norm]);
                  }}
                  onRemoveItem={(firm) => upd('designFirms', (newLeadData.designFirms || []).filter((item) => item !== firm))}
                  options={designFirms || []}
                  onAddNew={(firm) => { const norm = firm.trim(); setDesignFirms((prev) => prev.some((f) => f.toLowerCase() === norm.toLowerCase()) ? prev : [norm, ...prev]); }}
                  placeholder="Search or create firm"
                  theme={theme}
                  compact={false}
                  integratedChips
                />
              </Row>

              <Row label="Competition" theme={theme} inline>
                <div>
                  <div className="flex items-center gap-2.5 py-0.5">
                    <ToggleSwitch
                      checked={!!newLeadData.competitionPresent}
                      onChange={(event) => {
                        upd('competitionPresent', event.target.checked);
                        markTouched('competitionPresent');
                        markTouched('competitors');
                      }}
                      theme={theme}
                    />
                    <span className="text-[13px]" style={{ color: c.textSecondary }}>
                      {newLeadData.competitionPresent ? 'Competitors present' : 'None identified'}
                    </span>
                  </div>
                  <Reveal show={!!newLeadData.competitionPresent}>
                    <div className="mt-2.5">
                      <SpotlightMultiSelect
                        selectedItems={newLeadData.competitors || []}
                        onAddItem={(competitor) => {
                          const norm = competitor.trim();
                          const current = newLeadData.competitors || [];
                          if (!current.some((c) => c.toLowerCase() === norm.toLowerCase())) upd('competitors', [...current, norm]);
                          markTouched('competitors');
                        }}
                        onRemoveItem={(competitor) => { upd('competitors', (newLeadData.competitors || []).filter((item) => item !== competitor)); markTouched('competitors'); }}
                        options={COMPETITORS.filter((name) => name !== 'None')}
                        onAddNew={(name) => { const norm = name.trim(); upd('competitors', [...new Set([...(newLeadData.competitors || []), norm])]); }}
                        placeholder="Search or add competitor"
                        theme={theme}
                        compact={false}
                        integratedChips
                        bordered={false}
                      />
                      <FieldError show={!!visibleError('competitors')} message={visibleError('competitors')} />
                    </div>
                  </Reveal>
                </div>
              </Row>

              <Row label="Rewards" theme={theme} inline>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { upd('salesReward', !salesRewardEnabled); markTouched('salesReward'); }}
                    className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1"
                    style={{ backgroundColor: 'transparent', borderColor: subtleBorder }}
                  >
                    <span className="text-[12px] font-semibold" style={{ color: c.textPrimary }}>Sales</span>
                    <span className="text-[11px] font-medium" style={{ color: c.textSecondary }}>3%</span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <ToggleSwitch
                        checked={salesRewardEnabled}
                        onChange={(event) => { upd('salesReward', event.target.checked); markTouched('salesReward'); }}
                        theme={theme}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { upd('designerReward', !designerRewardEnabled); markTouched('designerReward'); }}
                    className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1"
                    style={{ backgroundColor: 'transparent', borderColor: subtleBorder }}
                  >
                    <span className="text-[12px] font-semibold" style={{ color: c.textPrimary }}>Designer</span>
                    <span className="text-[11px] font-medium" style={{ color: c.textSecondary }}>1%</span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <ToggleSwitch
                        checked={designerRewardEnabled}
                        onChange={(event) => { upd('designerReward', event.target.checked); markTouched('designerReward'); }}
                        theme={theme}
                      />
                    </span>
                  </button>
                </div>
              </Row>

            </Section>

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

              <Row label="JSI Series" theme={theme} inline>
                <div className="space-y-2">
                  <ProductSpotlight
                    selectedSeries={(newLeadData.products || []).map((p) => p.series)}
                    onAdd={addProduct}
                    available={JSI_SERIES}
                    theme={theme}
                  />
                  <p className="text-[11px] px-1" style={{ color: c.textSecondary }}>
                    {(newLeadData.products || []).length} selected • complete intake below.
                  </p>
                </div>
              </Row>

              {(newLeadData.products || []).length > 0 && (
                <div className="space-y-2.5">
                  {(newLeadData.products || []).map((product, idx) => (
                    <div key={`${product.series}-${idx}`} className="rounded-[22px] border overflow-hidden" style={{ borderColor: subtleBorder, backgroundColor: c.surface }}>
                      <ProductCard
                        product={product}
                        idx={idx}
                        onRemove={removeProduct}
                        onUpdate={updateProductOption}
                        theme={theme}
                        showBorder={false}
                      />
                      <div className="border-t px-4 py-3" style={{ borderColor: subtleBorder }}>
                        <p className="text-xs font-semibold" style={{ color: c.textPrimary }}>
                          Intake Details
                        </p>
                        <div className="grid gap-2 mt-2 md:grid-cols-2">
                          {(() => {
                            const prompts = getSeriesProcurementPrompts(product.series);
                            return (
                              <>
                                <div className="rounded-xl border p-2" style={{ borderColor: subtleBorder, backgroundColor: c.background }}>
                                  <p className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>
                                    {prompts.first.label}
                                  </p>
                                  <PortalNativeSelect
                                    value={product[prompts.first.key] || ''}
                                    onChange={(e) => updateProductOption(idx, prompts.first.key, e.target.value)}
                                    options={prompts.first.options.map((option) => ({ label: option, value: option }))}
                                    placeholder={prompts.first.placeholder}
                                    theme={theme}
                                    size="sm"
                                  />
                                </div>
                                <div className="rounded-xl border p-2" style={{ borderColor: subtleBorder, backgroundColor: c.background }}>
                                  <p className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>
                                    {prompts.second.label}
                                  </p>
                                  <PortalNativeSelect
                                    value={product[prompts.second.key] || ''}
                                    onChange={(e) => updateProductOption(idx, prompts.second.key, e.target.value)}
                                    options={prompts.second.options.map((option) => ({ label: option, value: option }))}
                                    placeholder={prompts.second.placeholder}
                                    theme={theme}
                                    size="sm"
                                  />
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        {step === 2 && (
          <>
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

            <Section title="Submission Review" subtitle="Filled details ready for routing." theme={theme}>
              <DiscreteHealthMeter health={health} theme={theme} />

              <div className="mt-3 rounded-2xl border px-3 py-2.5" style={{ borderColor: subtleBorder, backgroundColor: c.surface }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1.5" style={{ color: c.textSecondary }}>
                  AI Summary
                </p>
                <p className="text-xs leading-relaxed" style={{ color: c.textPrimary }}>
                  {reviewAiSummary}
                </p>
              </div>

              <div className="mt-3 rounded-2xl border overflow-hidden" style={{ borderColor: subtleBorder, backgroundColor: c.surface }}>
                {filledReviewItems.length > 0 ? (
                  <div className="divide-y" style={{ borderColor: subtleBorder }}>
                    {filledReviewItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => animateToStep(item.step)}
                        className="w-full grid grid-cols-[100px_minmax(0,1fr)] gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03] active:bg-black/[0.05]"
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] pt-px" style={{ color: c.textSecondary }}>
                          {item.label}
                        </span>
                        <span className="text-[13px] font-medium break-words leading-snug" style={{ color: c.textPrimary }}>
                          {item.value}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-2.5 text-[13px]" style={{ color: c.textSecondary }}>
                    No lead details entered yet.
                  </p>
                )}
              </div>

              <div
                className="mt-3 rounded-2xl border px-3 py-2.5 flex items-center gap-2 text-xs font-medium"
                style={{
                  borderColor: canSubmit ? '#4A7C5940' : '#B85C5C40',
                  color: canSubmit ? '#4A7C59' : '#B85C5C',
                  backgroundColor: canSubmit ? '#4A7C5914' : '#B85C5C14',
                }}
              >
                {canSubmit ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {canSubmit ? 'Lead is ready to submit.' : 'Complete required fields in Basics and Scope before submitting.'}
              </div>
            </Section>
          </>
        )}
        </div>{/* end animated step wrapper */}
      </div>

      {/* ── Integrated bottom bar: step nav + lead score + action ── */}
      <div
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
