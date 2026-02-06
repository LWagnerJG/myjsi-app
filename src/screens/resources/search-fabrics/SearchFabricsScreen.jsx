import React, { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Package, CheckCircle, Search, X, ExternalLink } from 'lucide-react';
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

/** ---------- Tethered searchable dropdown (portal) ---------- */
const LocalSearchSelect = ({
  theme,
  label,
  placeholder = 'Select�',
  options = [],
  value = '',
  onChange,
  className = '',
  emptyCta, // { label, onClick }
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
    setMenuRect({ left: r.left, top: r.bottom + 4, width: r.width }); // tight tether
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
        style={{ backgroundColor: theme.colors.surface, border, backdropFilter: 'blur(8px)' }}
      >
        {/* Integrated search (part of the dropdown) */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
          <Search className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to filter�"
            className="w-full bg-transparent outline-none text-sm"
            style={{ color: theme.colors.textPrimary }}
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="p-1 rounded-full hover:opacity-80" aria-label="Clear">
              <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
            </button>
          )}
        </div>

        {/* Options */}
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
                  style={{ backgroundColor: '#B85C5C', color: 'white' }}
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
      {label && (
        <label className="text-sm font-semibold mb-2 block" style={{ color: theme.colors.textSecondary }}>
          {label}
        </label>
      )}

      <button
        ref={fieldRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 rounded-3xl flex items-center justify-between transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.textPrimary,
          border,
          boxShadow: 'none',
        }}
      >
        <span className={value ? '' : 'opacity-60'}>
          {value || placeholder}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {menu}
    </div>
  );
};

/** ---------- Screen ---------- */
export const SearchFabricsScreen = ({ theme, onNavigate, onUpdateCart }) => {
  const [form, setForm] = useState(SEARCH_FORM_INITIAL);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // "Any �" toggle state (controls hiding/showing the other chips)
  const [anyGrade, setAnyGrade] = useState(false);
  const [anyFabric, setAnyFabric] = useState(false);
  const [anyTack, setAnyTack] = useState(false);

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

  // Click "Any �" again to unselect it and reveal options (with none selected)
  const pressAny = useCallback((field) => {
    if (field === 'grade') {
      setAnyGrade(prev => !prev);
      setForm(f => ({ ...f, grade: [] }));
    }
    if (field === 'fabricType') {
      setAnyFabric(prev => !prev);
      setForm(f => ({ ...f, fabricType: [] }));
    }
    if (field === 'tackable') {
      setAnyTack(prev => !prev);
      setForm(f => ({ ...f, tackable: [] }));
    }
  }, []);

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    if (!form.supplier || !form.jsiSeries) {
      setError('Supplier and Series are required.');
      return;
    }
    setError('');

    let filtered = FABRICS_DATA?.filter(item =>
      item.supplier === form.supplier &&
      item.series === form.jsiSeries &&
      (!form.pattern || item.pattern === form.pattern) &&
      (form.grade.length === 0 || form.grade.includes(item.grade)) &&
      (form.fabricType.length === 0 || form.fabricType.includes(item.textile)) &&
      (form.tackable.length === 0 || form.tackable.includes(item.tackable))
    ) || [];

    if (
      filtered.length === 0 &&
      form.supplier === 'Arc-Com' &&
      form.jsiSeries === 'Alden'
    ) {
      filtered = SAMPLE_FABRIC_RESULTS.filter(item =>
        item.supplier === form.supplier && item.series === form.jsiSeries
      );
    }
    setResults(filtered);
  }, [form]);

  const resetSearch = useCallback(() => {
    setForm(SEARCH_FORM_INITIAL);
    setResults(null);
    setError('');
    setAnyGrade(false);
    setAnyFabric(false);
    setAnyTack(false);
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
    // keep users in-app
    onNavigate && onNavigate('comcol-request');
  };

  const chipBase = "px-4 py-2 rounded-3xl font-medium transition-all border";

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {!results ? (
          <div className="space-y-6">
            <GlassCard theme={theme} className="rounded-3xl">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.colors.accent + '20' }}
                  >
                    <Search className="w-5 h-5" style={{ color: theme.colors.accent }} />
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                    Search Criteria
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-3xl border" style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca' }}>
                      <p className="text-sm font-medium" style={{ color: '#B85C5C' }}>{error}</p>
                    </div>
                  )}

                  {/* Required */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LocalSearchSelect
                      theme={theme}
                      label="Supplier *"
                      placeholder="Select a supplier"
                      options={FABRIC_SUPPLIERS}
                      value={form.supplier}
                      onChange={e => updateField('supplier', e.target.value)}
                      className="rounded-3xl"
                    />
                    <LocalSearchSelect
                      theme={theme}
                      label="JSI Series *"
                      placeholder="Select JSI series"
                      options={JSI_SERIES_OPTIONS}
                      value={form.jsiSeries}
                      onChange={e => updateField('jsiSeries', e.target.value)}
                      className="rounded-3xl"
                    />
                  </div>

                  {/* Pattern with in-app CTA */}
                  <div className="max-w-md">
                    <LocalSearchSelect
                      theme={theme}
                      label="Pattern (Optional)"
                      placeholder="Search for a pattern"
                      options={FABRIC_PATTERNS}
                      value={form.pattern}
                      onChange={e => updateField('pattern', e.target.value)}
                      className="rounded-3xl"
                      emptyCta={{
                        label: "My pattern isn't here",
                        onClick: openComColLanding
                      }}
                    />
                  </div>

                  {/* Grade */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Grade</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => pressAny('grade')}
                        className={chipBase}
                        style={{
                          backgroundColor: anyGrade ? theme.colors.accent : theme.colors.subtle,
                          color: anyGrade ? 'white' : theme.colors.textPrimary,
                          borderColor: anyGrade ? theme.colors.accent : theme.colors.subtle
                        }}
                      >
                        Any Grade
                      </button>
                      {!anyGrade && FABRIC_GRADES.map(g => {
                        const active = form.grade.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => toggleMulti('grade', g)}
                            className={chipBase}
                            style={{
                              backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                              color: active ? 'white' : theme.colors.textPrimary,
                              borderColor: active ? theme.colors.accent : theme.colors.border
                            }}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fabric Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Fabric Type</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => pressAny('fabricType')}
                        className={chipBase}
                        style={{
                          backgroundColor: anyFabric ? theme.colors.accent : theme.colors.subtle,
                          color: anyFabric ? 'white' : theme.colors.textPrimary,
                          borderColor: anyFabric ? theme.colors.accent : theme.colors.subtle
                        }}
                      >
                        Any Type
                      </button>
                      {!anyFabric && FABRIC_TYPES.map(t => {
                        const active = form.fabricType.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleMulti('fabricType', t)}
                            className={chipBase}
                            style={{
                              backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                              color: active ? 'white' : theme.colors.textPrimary,
                              borderColor: active ? theme.colors.accent : theme.colors.border
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tackable */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Tackable</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => pressAny('tackable')}
                        className={chipBase + ' capitalize'}
                        style={{
                          backgroundColor: anyTack ? theme.colors.accent : theme.colors.subtle,
                          color: anyTack ? 'white' : theme.colors.textPrimary,
                          borderColor: anyTack ? theme.colors.accent : theme.colors.subtle
                        }}
                      >
                        Any Option
                      </button>
                      {!anyTack && TACKABLE_OPTIONS.map(t => {
                        const v = t.toLowerCase();
                        const active = form.tackable.includes(v);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleMulti('tackable', v)}
                            className={chipBase + ' capitalize'}
                            style={{
                              backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                              color: active ? 'white' : theme.colors.textPrimary,
                              borderColor: active ? theme.colors.accent : theme.colors.border
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full font-bold text-lg transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                  >
                    Search
                  </button>
                </form>
              </div>
            </GlassCard>
          </div>
        ) : (
          <div className="space-y-4">
            <GlassCard theme={theme} className="rounded-3xl">
              <div className="px-5 sm:px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <p style={{ color: theme.colors.textSecondary }}>
                    Found <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{results.length}</span> matching fabric{results.length !== 1 ? 's' : ''}
                  </p>
                  <div className="text-right text-sm space-y-1" style={{ color: theme.colors.textSecondary }}>
                    <div><span className="font-medium">Supplier:</span> {form.supplier}</div>
                    {form.pattern && <div><span className="font-medium">Pattern:</span> {form.pattern}</div>}
                    <div><span className="font-medium">Series:</span> {form.jsiSeries}</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="space-y-4">
              {results.map((r, i) => (
                <GlassCard key={i} theme={theme} className="rounded-3xl">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme.colors.accent + '20' }}>
                          <CheckCircle className="w-6 h-6" style={{ color: theme.colors.accent }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Approved Fabric</h3>
                          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Ready for specification</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOrderSample(r)}
                        className="px-6 py-3 rounded-3xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
                        style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                      >
                        <Package className="w-4 h-4" />
                        <span>Order Sample</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div><span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Supplier:</span><p style={{ color: theme.colors.textPrimary }}>{r.supplier}</p></div>
                      <div><span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Pattern:</span><p style={{ color: theme.colors.textPrimary }}>{r.pattern}</p></div>
                      <div><span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Grade:</span><p style={{ color: theme.colors.textPrimary }}>{r.grade}</p></div>
                      <div><span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Tackable:</span><p className="capitalize" style={{ color: theme.colors.textPrimary }}>{r.tackable}</p></div>
                      <div><span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Type:</span><p style={{ color: theme.colors.textPrimary }}>{r.textile || 'Not Specified'}</p></div>
                      <div><span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Series:</span><p style={{ color: theme.colors.textPrimary }}>{r.series}</p></div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={resetSearch}
                className="px-8 py-3 rounded-3xl font-semibold transition-all duration-200 hover:scale-105 border"
                style={{ backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }}
              >
                Start New Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
