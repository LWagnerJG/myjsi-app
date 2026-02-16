import React, { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { Package, CheckCircle, Search, X, ExternalLink, ArrowLeft } from 'lucide-react';
import { FrostButton } from '../../../components/common/JSIButtons.jsx';
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

/* ── Required label helper ── */
const FieldLabel = ({ children, required, theme }) => (
  <label className="text-xs font-semibold tracking-wide mb-1.5 block" style={{ color: theme.colors.textPrimary }}>
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
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

  const border = `1px solid ${theme.colors.border}`;

  const menu = open && menuRect ? ReactDOM.createPortal(
    <div
      id="dropdown-portal"
      style={{ position: 'fixed', left: menuRect.left, top: menuRect.top, width: menuRect.width, zIndex: 99999 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: theme.colors.surface, border }}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
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
        className="w-full text-left px-4 py-3 rounded-full flex items-center justify-between transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.textPrimary,
          border,
        }}
      >
        <span className={value ? 'text-sm' : 'text-sm opacity-50'}>
          {value || placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {menu}
    </div>
  );
};

/* ── Chip / pill toggle ── */
const Chip = ({ label, active, onClick, theme }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
    style={{
      backgroundColor: active ? theme.colors.accent : theme.colors.surface,
      color: active ? theme.colors.accentText : theme.colors.textPrimary,
      border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
    }}
  >
    {label}
  </button>
);

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

  /* ── Results view ── */
  if (results) {
    return (
      <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pb-8">
            {/* Summary bar */}
            <div className="pt-2 pb-4 sticky top-0 z-10 flex items-center justify-between gap-3" style={{ background: theme.colors.background }}>
              <button
                onClick={resetSearch}
                className="flex items-center gap-1.5 text-sm font-semibold active:scale-95 transition-all"
                style={{ color: theme.colors.accent }}
              >
                <ArrowLeft className="w-4 h-4" />
                New Search
              </button>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{results.length}</span> result{results.length !== 1 ? 's' : ''}
                {' '}&middot; {form.supplier} &middot; {form.jsiSeries}
              </p>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                  No fabrics match your criteria. Try broadening your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-card p-4"
                    style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
                  >
                    {/* Top row: pattern name + order button */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.success }} />
                        <p className="text-sm font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                          {r.pattern}
                          <span className="font-normal ml-1.5" style={{ color: theme.colors.textSecondary }}>by {r.supplier}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleOrderSample(r)}
                        className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all"
                        style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                      >
                        <Package className="w-3.5 h-3.5" />
                        Sample
                      </button>
                    </div>

                    {/* Detail chips row */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-full" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>
                        Grade {r.grade}
                      </span>
                      {r.textile && (
                        <span className="px-2.5 py-1 rounded-full" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>
                          {r.textile}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full capitalize" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>
                        Tackable: {r.tackable}
                      </span>
                      <span className="px-2.5 py-1 rounded-full" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>
                        {r.series}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Search form view ── */
  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pb-32">
          <form onSubmit={handleSubmit}>
            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-card" style={{ backgroundColor: `${theme.colors.error}20`, border: `1px solid ${theme.colors.error}55` }}>
                <p className="text-xs font-medium" style={{ color: theme.colors.error }}>{error}</p>
              </div>
            )}

            {/* Required selects */}
            <div className="space-y-4 pt-2">
              <LocalSearchSelect
                theme={theme}
                label="Supplier"
                required
                placeholder="Select a supplier"
                options={FABRIC_SUPPLIERS}
                value={form.supplier}
                onChange={e => updateField('supplier', e.target.value)}
              />
              <LocalSearchSelect
                theme={theme}
                label="JSI Series"
                required
                placeholder="Select JSI series"
                options={JSI_SERIES_OPTIONS}
                value={form.jsiSeries}
                onChange={e => updateField('jsiSeries', e.target.value)}
              />
              <LocalSearchSelect
                theme={theme}
                label="Pattern"
                placeholder="Search for a pattern"
                options={FABRIC_PATTERNS}
                value={form.pattern}
                onChange={e => updateField('pattern', e.target.value)}
                emptyCta={{ label: "My pattern isn't here", onClick: openComColLanding }}
              />
            </div>

            {/* Divider */}
            <div className="my-6" style={{ borderTop: `1px solid ${theme.colors.border}` }} />

            {/* Filter chip groups */}
            <div className="space-y-5">
              {/* Grade */}
              <div>
                <FieldLabel theme={theme}>Grade</FieldLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Chip label="Any" active={anyGrade} onClick={() => pressAny('grade')} theme={theme} />
                  {!anyGrade && FABRIC_GRADES.map(g => (
                    <Chip key={g} label={g} active={form.grade.includes(g)} onClick={() => toggleMulti('grade', g)} theme={theme} />
                  ))}
                </div>
              </div>

              {/* Fabric Type */}
              <div>
                <FieldLabel theme={theme}>Fabric Type</FieldLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Chip label="Any" active={anyFabric} onClick={() => pressAny('fabricType')} theme={theme} />
                  {!anyFabric && FABRIC_TYPES.map(t => (
                    <Chip key={t} label={t} active={form.fabricType.includes(t)} onClick={() => toggleMulti('fabricType', t)} theme={theme} />
                  ))}
                </div>
              </div>

              {/* Tackable */}
              <div>
                <FieldLabel theme={theme}>Tackable</FieldLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Chip label="Any" active={anyTack} onClick={() => pressAny('tackable')} theme={theme} />
                  {!anyTack && TACKABLE_OPTIONS.map(t => (
                    <Chip key={t} label={t} active={form.tackable.includes(t.toLowerCase())} onClick={() => toggleMulti('tackable', t.toLowerCase())} theme={theme} />
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Sticky frost submit */}
      <div
        className="flex-shrink-0 px-4 sm:px-6 pb-5 pt-3"
        style={{
          background: isDark
            ? `linear-gradient(to top, ${theme.colors.background} 60%, transparent)`
            : 'linear-gradient(to top, rgba(240,237,232,1) 60%, rgba(240,237,232,0))'
        }}
      >
        <div className="max-w-2xl mx-auto">
          <FrostButton
            onClick={handleSubmit}
            disabled={!canSearch}
            variant="dark"
            size="large"
            className="w-full"
          >
            Search
          </FrostButton>
        </div>
      </div>
    </div>
  );
};
