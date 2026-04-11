import React, { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { Package, CheckCircle, Search, X, ExternalLink, SearchX, RotateCcw } from 'lucide-react';
import {
  FABRIC_SUPPLIERS,
  FABRIC_PATTERNS,
  JSI_SERIES_OPTIONS,
  FABRIC_GRADES,
  FABRIC_TYPES,
  TACKABLE_OPTIONS,
  SAMPLE_FABRIC_RESULTS,
  SEARCH_FORM_INITIAL
} from './data.js';
import { FABRICS_DATA } from '../../products/data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { JSIWebButton } from '../../../components/common/JSIButtons.jsx';

/* ── Label helper ── */
const FieldLabel = ({ children, required, theme }) => (
  <label className="text-[0.6875rem] font-medium uppercase tracking-wide mb-1 block" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
    {children}
    {required && <span style={{ color: theme.colors.error, opacity: 1 }} className="ml-0.5">*</span>}
  </label>
);

const SectionCard = ({ title, children, theme, className = '' }) => (
  <div
    className={`rounded-[24px] p-4 sm:p-5 ${className}`}
    style={{
      backgroundColor: theme.colors.surface,
      border: `1px solid ${isDarkTheme(theme) ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.03)'}`,
    }}
  >
    {title && (
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wide mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{title}</p>
    )}
    {children}
  </div>
);

/* ── Tethered searchable dropdown (portal) ── */
const LocalSearchSelect = ({
  theme,
  label,
  required,
  placeholder = 'Select...',
  options = [],
  value = '',
  onChange,
  className = '',
  emptyCta,
  showAny = false,
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const fieldRef = useRef(null);
  const [menuRect, setMenuRect] = useState(null);

  const filtered = useMemo(() => {
    const all = options.map(o => String(o));
    if (!q.trim()) return all;
    const needle = q.toLowerCase();
    return all.filter(o => o.toLowerCase().includes(needle));
  }, [q, options]);

  const computeRect = useCallback(() => {
    if (!fieldRef.current) return;
    const r = fieldRef.current.getBoundingClientRect();
    setMenuRect({ left: r.left, top: r.bottom + 4, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    computeRect();
    const onMove = () => computeRect();
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, computeRect]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      const menu = document.getElementById('dropdown-portal');
      if (fieldRef.current?.contains(e.target)) return;
      if (menu?.contains(e.target)) return;
      setOpen(false);
    };
    const onEsc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const border = isDarkTheme(theme) ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.03)';
  const divider = isDarkTheme(theme) ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.03)';

  const menu = open && menuRect ? ReactDOM.createPortal(
    <div
      id="dropdown-portal"
      style={{ position: 'fixed', left: menuRect.left, top: menuRect.top, width: menuRect.width, zIndex: 99999 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-[20px] shadow-2xl overflow-hidden"
        style={{ backgroundColor: theme.colors.surface, border }}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${divider}` }}>
          <Search className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to filter..."
            className="w-full bg-transparent outline-none text-sm"
            style={{ color: theme.colors.textPrimary }}
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="p-1 rounded-full hover:opacity-80" aria-label="Clear">
              <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            </button>
          )}
        </div>
        <div className="max-h-64 overflow-auto">
          {/* "Any" / clear option — only on Pattern dropdown */}
          {showAny && !q.trim() && (
            <button
              type="button"
              onClick={() => { onChange({ target: { value: '' } }); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-[0.8125rem] font-medium transition-colors"
              style={{
                color: !value ? theme.colors.textPrimary : theme.colors.textSecondary,
                backgroundColor: !value ? theme.colors.subtle : 'transparent',
                borderBottom: `1px solid ${divider}`,
              }}
            >
              Any
            </button>
          )}
          {filtered.length === 0 ? (
            <div className="p-3">
              <div className="px-2 py-2 text-sm opacity-70" style={{ color: theme.colors.textSecondary }}>
                No matches
              </div>
              {emptyCta && (
                <button
                  type="button"
                  onClick={emptyCta.onClick}
                  className="w-full mt-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.colors.error, color: theme.colors.accentText }}
                >
                  <ExternalLink className="w-4 h-4" />
                  {emptyCta.label}
                </button>
              )}
            </div>
          ) : (
            filtered.map((opt) => {
              const selected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange({ target: { value: opt } }); setOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm transition-colors"
                  style={{
                    color: theme.colors.textPrimary,
                    backgroundColor: selected ? theme.colors.accent + '22' : 'transparent'
                  }}
                >
                  {opt}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`w-full relative ${className}`}>
      {label && <FieldLabel required={required} theme={theme}>{label}</FieldLabel>}
      <button
        ref={fieldRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3.5 py-2.5 rounded-[16px] flex items-center justify-between transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.textPrimary,
          border,
        }}
      >
        <span className={value ? 'text-[0.8125rem]' : 'text-[0.8125rem] opacity-50'}>
          {value || placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {menu}
    </div>
  );
};

/* ── Chip / pill toggle ── */
const Chip = ({ label, active, onClick, theme, className = '' }) => {
  const dark = isDarkTheme(theme);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[3rem] px-2.5 py-1.5 rounded-full text-[0.6875rem] font-semibold transition-all active:scale-95 text-center ${className}`}
      style={{
        backgroundColor: active ? theme.colors.accent : 'transparent',
        color: active ? theme.colors.accentText : theme.colors.textPrimary,
        border: `1px solid ${active ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')}`,
      }}
    >
      {label}
    </button>
  );
};

/* ── Screen ── */
export const SearchFabricsScreen = ({ theme, onNavigate, onUpdateCart }) => {
  const isDark = isDarkTheme(theme);
  const [form, setForm] = useState(SEARCH_FORM_INITIAL);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const [anyGrade, setAnyGrade] = useState(true);
  const [anyFabric, setAnyFabric] = useState(true);
  const [anyTack, setAnyTack] = useState(true);

  const updateField = useCallback((field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  const toggleMulti = useCallback((field, value) => {
    setForm(f => {
      const has = f[field].includes(value);
      const arr = has ? f[field].filter(x => x !== value) : [...f[field], value];
      return { ...f, [field]: arr };
    });
    if (field === 'grade') setAnyGrade(false);
    if (field === 'fabricType') setAnyFabric(false);
    if (field === 'tackable') setAnyTack(false);
  }, []);

  const pressAny = useCallback((field) => {
    if (field === 'grade') { setAnyGrade(prev => !prev); setForm(f => ({ ...f, grade: [] })); }
    if (field === 'fabricType') { setAnyFabric(prev => !prev); setForm(f => ({ ...f, fabricType: [] })); }
    if (field === 'tackable') { setAnyTack(prev => !prev); setForm(f => ({ ...f, tackable: [] })); }
  }, []);

  const canSearch = form.supplier && form.jsiSeries;

  /* Auto-search when both required fields are filled */
  useEffect(() => {
    if (form.supplier && form.jsiSeries) {
      let filtered = FABRICS_DATA?.filter(item =>
        item.supplier === form.supplier &&
        item.series === form.jsiSeries &&
        (!form.pattern || item.pattern === form.pattern) &&
        (form.grade.length === 0 || form.grade.includes(item.grade)) &&
        (form.fabricType.length === 0 || form.fabricType.includes(item.textile)) &&
        (form.tackable.length === 0 || form.tackable.includes(item.tackable))
      ) || [];

      if (filtered.length === 0 && form.supplier === 'Arc-Com' && form.jsiSeries === 'Alden') {
        filtered = SAMPLE_FABRIC_RESULTS.filter(item =>
          item.supplier === form.supplier && item.series === form.jsiSeries
        );
      }
      setResults(filtered);
      setError('');
    } else {
      setResults(null);
    }
  }, [form]);

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    if (!canSearch) { setError('Please select a supplier and series.'); return; }
    setError('');

    let filtered = FABRICS_DATA?.filter(item =>
      item.supplier === form.supplier &&
      item.series === form.jsiSeries &&
      (!form.pattern || item.pattern === form.pattern) &&
      (form.grade.length === 0 || form.grade.includes(item.grade)) &&
      (form.fabricType.length === 0 || form.fabricType.includes(item.textile)) &&
      (form.tackable.length === 0 || form.tackable.includes(item.tackable))
    ) || [];

    if (filtered.length === 0 && form.supplier === 'Arc-Com' && form.jsiSeries === 'Alden') {
      filtered = SAMPLE_FABRIC_RESULTS.filter(item =>
        item.supplier === form.supplier && item.series === form.jsiSeries
      );
    }
    setResults(filtered);
  }, [form, canSearch]);

  const resetSearch = useCallback(() => {
    setForm(SEARCH_FORM_INITIAL);
    setResults(null);
    setError('');
    setAnyGrade(true);
    setAnyFabric(true);
    setAnyTack(true);
  }, []);

  const handleOrderSample = (fabric) => {
    const newItem = {
      id: `fabric-${fabric.supplier.toLowerCase().replace(/\s/g, '-')}-${fabric.pattern.toLowerCase().replace(/\s/g, '-')}`,
      name: `${fabric.pattern} by ${fabric.supplier}`,
      category: 'Fabric',
      manufacturer: fabric.supplier,
      pattern: fabric.pattern,
      grade: fabric.grade,
      image: '',
    };
    onUpdateCart && onUpdateCart(newItem, 1);
    onNavigate && onNavigate('samples');
  };

  const openComColLanding = () => {
    onNavigate && onNavigate('comcol-request');
  };

  const hasFilled = form.supplier || form.jsiSeries || form.pattern;

  /* ── Single unified view: form + inline results ── */
  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto w-full px-5 sm:px-6 pt-2 pb-20">
          <form onSubmit={handleSubmit}>
            {/* Header — title always left, clear always right (invisible when not needed) */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[1.125rem] font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>Search Fabrics</h2>
              <button
                type="button"
                onClick={resetSearch}
                className="flex items-center gap-1 text-[0.6875rem] font-semibold transition-opacity active:scale-95"
                style={{ color: theme.colors.textSecondary, opacity: hasFilled ? 0.6 : 0, pointerEvents: hasFilled ? 'auto' : 'none' }}
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-3 px-4 py-2.5 rounded-[16px]" style={{ backgroundColor: `${theme.colors.error}12`, border: `1px solid ${theme.colors.error}30` }}>
                <p className="text-xs font-medium" style={{ color: theme.colors.error }}>{error}</p>
              </div>
            )}

            {/* Required selects + Pattern — single card */}
            <SectionCard theme={theme} className="mb-3">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <LocalSearchSelect
                  theme={theme}
                  label="Supplier"
                  required
                  placeholder="Select"
                  options={FABRIC_SUPPLIERS}
                  value={form.supplier}
                  onChange={e => updateField('supplier', e.target.value)}
                />
                <LocalSearchSelect
                  theme={theme}
                  label="JSI Series"
                  required
                  placeholder="Select"
                  options={JSI_SERIES_OPTIONS}
                  value={form.jsiSeries}
                  onChange={e => updateField('jsiSeries', e.target.value)}
                />
              </div>
              <LocalSearchSelect
                theme={theme}
                label="Pattern"
                placeholder="All patterns"
                options={FABRIC_PATTERNS}
                value={form.pattern}
                onChange={e => updateField('pattern', e.target.value)}
                emptyCta={{ label: "My pattern isn't here", onClick: openComColLanding }}
                showAny
              />
            </SectionCard>

            {/* Optional filters — compact inline chips per row */}
            <SectionCard theme={theme} title="Filters" className="mb-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.6875rem] font-medium w-16 shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Grade</span>
                  <Chip label="Any" active={anyGrade} onClick={() => pressAny('grade')} theme={theme} />
                  {!anyGrade && FABRIC_GRADES.map(g => (
                    <Chip key={g} label={g} active={form.grade.includes(g)} onClick={() => toggleMulti('grade', g)} theme={theme} />
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.6875rem] font-medium w-16 shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Type</span>
                  <Chip label="Any" active={anyFabric} onClick={() => pressAny('fabricType')} theme={theme} />
                  {!anyFabric && FABRIC_TYPES.map(t => (
                    <Chip key={t} label={t} active={form.fabricType.includes(t)} onClick={() => toggleMulti('fabricType', t)} theme={theme} />
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.6875rem] font-medium w-16 shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Tackable</span>
                  <Chip label="Any" active={anyTack} onClick={() => pressAny('tackable')} theme={theme} />
                  {!anyTack && TACKABLE_OPTIONS.map(t => (
                    <Chip key={t} label={t} active={form.tackable.includes(t.toLowerCase())} onClick={() => toggleMulti('tackable', t.toLowerCase())} theme={theme} />
                  ))}
                </div>
              </div>
            </SectionCard>
          </form>

          {/* ── Inline results ── */}
          {results && (
            <div
              className="rounded-[24px] overflow-hidden"
              style={{
                backgroundColor: isDark ? theme.colors.surface : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.03)'}`,
              }}
            >
              {/* Results header */}
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: results.length > 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.03)'}` : 'none' }}>
                <p className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                  {results.length > 0 ? (
                    <>{results.length} match{results.length !== 1 ? 'es' : ''}<span className="font-normal ml-1" style={{ color: theme.colors.textSecondary }}>{form.supplier}, {form.jsiSeries}</span></>
                  ) : 'Results'}
                </p>
              </div>

              {results.length === 0 ? (
                <div className="flex items-center gap-3 px-5 py-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(53,53,53,0.04)' }}>
                    <SearchX className="w-5 h-5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>No matching fabrics</p>
                    <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>Try a different supplier or series.</p>
                  </div>
                </div>
              ) : (
                <div>
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="px-5 py-3.5 flex items-center gap-3"
                      style={{ borderTop: i > 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}` : undefined }}
                    >
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.success }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8125rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                          {r.pattern}
                          <span className="font-normal ml-1" style={{ color: theme.colors.textSecondary }}>— {r.supplier}</span>
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-[0.625rem] px-2 py-0.5 rounded-full font-medium" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.04)', color: theme.colors.textSecondary }}>Grade {r.grade}</span>
                          {r.textile && <span className="text-[0.625rem] px-2 py-0.5 rounded-full font-medium" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.04)', color: theme.colors.textSecondary }}>{r.textile}</span>}
                          <span className="text-[0.625rem] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.04)', color: theme.colors.textSecondary }}>Tack: {r.tackable}</span>
                        </div>
                      </div>
                      <JSIWebButton
                        onClick={() => handleOrderSample(r)}
                        theme={theme}
                        variant="outlined"
                        size="small"
                        icon={<Package className="w-3 h-3" />}
                      >
                        Sample
                      </JSIWebButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
