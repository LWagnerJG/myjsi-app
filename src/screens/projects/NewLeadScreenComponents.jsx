import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check } from 'lucide-react';
import { InfoTooltip } from '../../components/common/InfoTooltip.jsx';
import { DESIGN_TOKENS, isDarkTheme } from '../../design-system/tokens.js';
import { VisionOptions, KnoxOptions, WinkHoopzOptions } from './product-options.jsx';

/* ═══════════════════════════════════════════════════════════════
   LIGHTWEIGHT UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

/* Section card */
export const Section = ({ title, subtitle, titleRight, children, theme, className = '' }) => {
  const dark = isDarkTheme(theme);
  const divider = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)';
  return (
    <div className={`rounded-[22px] ${className}`} style={{
      padding: '14px 16px',
      backgroundColor: dark ? theme.colors.surface : '#fff',
      border: `1px solid ${divider}`,
    }}>
      {title && (
        <div className="mb-2">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-tight tracking-tight" style={{
                color: theme.colors.textPrimary,
              }}>{title}</h3>
              {subtitle && (
                <p className="text-xs mt-0.5 leading-snug" style={{ color: theme.colors.textSecondary }}>
                  {subtitle}
                </p>
              )}
            </div>
            {titleRight && <div className="ml-auto min-w-0">{titleRight}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

/* Compact field row */
export const Row = ({ label, children, theme, tip, inline }) => {
  const rowLayout = inline ? 'grid items-start gap-1.5 md:grid-cols-[100px_minmax(0,1fr)] md:gap-2.5' : '';
  return (
  <div className={`${rowLayout} py-2`}>
    {label && (
      <div className={`flex items-center gap-1.5 ${inline ? 'md:min-h-[34px] md:pt-1' : 'mb-1'}`}>
        <label className={`text-[0.8125rem] font-semibold ${inline ? 'whitespace-nowrap' : ''}`}
          style={{ color: theme.colors.textSecondary }}>{label}</label>
        {tip && <InfoTooltip content={tip} theme={theme} position="right" size="sm" />}
      </div>
    )}
    {inline ? <div className="min-w-0">{children}</div> : children}
  </div>
  );
};

/* — animated reveal wrapper — uses CSS grid-row trick for smooth height — */
export const Reveal = ({ show, children }) => (
  <div style={{
    display: 'grid',
    gridTemplateRows: show ? '1fr' : '0fr',
    opacity: show ? 1 : 0,
    transition: 'grid-template-rows .35s cubic-bezier(.4,0,.2,1), opacity .3s ease',
  }}>
    <div style={{ overflow: 'hidden' }}>{children}</div>
  </div>
);

const normalizeSpotlightText = (value) => String(value || '').toLowerCase().trim().replace(/\s+/g, ' ');
const getOpportunityName = (opp) => String(opp?.name || opp?.project || '').trim();
const getOpportunityCompany = (opp) => String(opp?.company || opp?.customerName || '').trim();
const getOpportunitySubtitle = (opp) => [getOpportunityCompany(opp), opp?.stage, opp?.value].filter(Boolean).join(' • ');

const getProjectMatchRank = (opp, query, index) => {
  const name = normalizeSpotlightText(getOpportunityName(opp));
  const company = normalizeSpotlightText(getOpportunityCompany(opp));
  if (!query) return index;
  if (!name && !company) return Number.POSITIVE_INFINITY;
  if (name === query) return index;
  if (name.startsWith(query)) return 10 + index;
  if (name.split(' ').some((part) => part.startsWith(query))) return 20 + index;
  if (company.startsWith(query)) return 30 + index;
  if (name.includes(query)) return 40 + index;
  if (company.includes(query)) return 50 + index;
  return Number.POSITIVE_INFINITY;
};

export const ProjectSpotlight = ({
  value,
  onChange,
  onCommitValue,
  onSelectOpportunity,
  opportunities = [],
  selectedOpportunityId,
  onBlur,
  theme,
  placeholder = 'Enter project name',
}) => {
  const [open, setOpen] = useState(false);
  const [hlIdx, setHlIdx] = useState(0);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const dark = isDarkTheme(theme);
  const subtleBorder = dark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)';
  const query = normalizeSpotlightText(value);
  const trimmedValue = String(value || '').trim();

  const activeOpportunities = useMemo(
    () => (opportunities || []).filter((opp) => !['won', 'lost'].includes(String(opp?.stage || '').toLowerCase())),
    [opportunities],
  );

  const selectedOpportunity = useMemo(
    () => activeOpportunities.find((opp) => String(opp?.id) === String(selectedOpportunityId || '')) || null,
    [activeOpportunities, selectedOpportunityId],
  );

  const filtered = useMemo(() => {
    const pool = activeOpportunities.filter((opp) => getOpportunityName(opp));
    if (!query) return pool.slice(0, 6);
    return pool
      .map((opp, index) => ({ opp, rank: getProjectMatchRank(opp, query, index) }))
      .filter((entry) => Number.isFinite(entry.rank))
      .sort((a, b) => a.rank - b.rank || getOpportunityName(a.opp).localeCompare(getOpportunityName(b.opp)))
      .slice(0, 6)
      .map((entry) => entry.opp);
  }, [activeOpportunities, query]);

  const exactMatchExists = useMemo(
    () => !!activeOpportunities.find((opp) => normalizeSpotlightText(getOpportunityName(opp)) === query),
    [activeOpportunities, query],
  );

  const showCreateOption = !!trimmedValue && !exactMatchExists;
  const isLinkedToExisting = !!selectedOpportunity && normalizeSpotlightText(getOpportunityName(selectedOpportunity)) === query;

  useEffect(() => setHlIdx(0), [filtered.length, query, showCreateOption]);

  const measure = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }, []);

  const doOpen = useCallback(() => {
    measure();
    setOpen(true);
  }, [measure]);

  useEffect(() => {
    if (!open) return undefined;
    measure();
    const syncPosition = () => measure();
    window.addEventListener('resize', syncPosition);
    window.addEventListener('scroll', syncPosition, true);
    return () => {
      window.removeEventListener('resize', syncPosition);
      window.removeEventListener('scroll', syncPosition, true);
    };
  }, [measure, open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (anchorRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close, { passive: true });
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  const commitTypedValue = useCallback(() => {
    if (!trimmedValue) return;
    onCommitValue?.(trimmedValue);
    setOpen(false);
    inputRef.current?.blur();
  }, [onCommitValue, trimmedValue]);

  const pickOpportunity = useCallback((opp) => {
    onSelectOpportunity?.(opp);
    setOpen(false);
    inputRef.current?.blur();
  }, [onSelectOpportunity]);

  const totalOptions = filtered.length + (showCreateOption ? 1 : 0);

  const handleKeyDown = useCallback((event) => {
    if (!open) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        doOpen();
      } else if (event.key === 'Enter' && trimmedValue) {
        event.preventDefault();
        commitTypedValue();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!totalOptions) return;
      setHlIdx((idx) => Math.min(idx + 1, totalOptions - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!totalOptions) return;
      setHlIdx((idx) => Math.max(idx - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (filtered[hlIdx]) {
        pickOpportunity(filtered[hlIdx]);
      } else if (showCreateOption && hlIdx === filtered.length) {
        commitTypedValue();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === 'Tab') {
      setOpen(false);
    }
  }, [commitTypedValue, doOpen, filtered, hlIdx, open, pickOpportunity, showCreateOption, totalOptions, trimmedValue]);

  return (
    <div ref={anchorRef}>
      <div
        className="flex items-center gap-2 px-3.5"
        style={{
          height: 40,
          borderRadius: 9999,
          background: dark ? theme.colors.background : theme.colors.surface,
          border: `1px solid ${open ? theme.colors.accent : subtleBorder}`,
          boxShadow: open ? `0 0 0 3px ${theme.colors.accent}14` : 'none',
        }}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={(event) => {
            onChange?.(event.target.value);
            if (!open) doOpen();
          }}
          onFocus={doOpen}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="project-spotlight-listbox"
          className="flex-1 bg-transparent outline-none text-sm placeholder-theme-secondary"
          style={{ color: theme.colors.textPrimary }}
        />
      </div>

      {isLinkedToExisting && (
        <div className="px-1 pt-1.5 text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
          Linked to current project{getOpportunitySubtitle(selectedOpportunity) ? ` • ${getOpportunitySubtitle(selectedOpportunity)}` : ''}
        </div>
      )}

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed rounded-[22px] border overflow-hidden"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            background: theme.colors.surface,
            borderColor: subtleBorder,
            boxShadow: dark ? '0 14px 40px rgba(0,0,0,0.42)' : '0 14px 32px rgba(0,0,0,0.12)',
            zIndex: DESIGN_TOKENS.zIndex.popover,
          }}
        >
          <div className="px-3.5 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary, opacity: 0.72 }}>
            {query ? 'Matching current projects' : 'Current projects'}
          </div>
          <div id="project-spotlight-listbox" role="listbox" className="overflow-y-auto pb-2" style={{ maxHeight: 304, WebkitOverflowScrolling: 'touch' }}>
            {filtered.map((opp, idx) => {
              const highlighted = idx === hlIdx;
              const selected = String(opp?.id) === String(selectedOpportunityId || '') && isLinkedToExisting;
              const name = getOpportunityName(opp);
              const subtitle = getOpportunitySubtitle(opp);
              return (
                <button
                  key={opp?.id ?? `${name}-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    pickOpportunity(opp);
                  }}
                  onClick={() => pickOpportunity(opp)}
                  onMouseEnter={() => setHlIdx(idx)}
                  className="w-full text-left px-3.5 py-2.5 transition-colors"
                  style={{ backgroundColor: highlighted ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{name}</div>
                      {subtitle && (
                        <div className="truncate text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>{subtitle}</div>
                      )}
                    </div>
                    {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.accent }} />}
                  </div>
                </button>
              );
            })}

            {showCreateOption && (
              <>
                {filtered.length > 0 && (
                  <div className="mx-3.5 border-t" style={{ borderColor: subtleBorder, opacity: 0.7 }} />
                )}
                {filtered.length === 0 && (
                  <div className="px-3.5 pt-1 pb-2 text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    No current project matches. Continue with a new project name.
                  </div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={hlIdx === filtered.length}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commitTypedValue();
                  }}
                  onClick={commitTypedValue}
                  onMouseEnter={() => setHlIdx(filtered.length)}
                  className="w-full text-left px-3.5 py-3 transition-colors"
                  style={{ backgroundColor: hlIdx === filtered.length ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                        Use "{trimmedValue}" as a new project
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                        This keeps the request moving without linking to an existing opportunity.
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: theme.colors.accent, backgroundColor: `${theme.colors.accent}14` }}
                    >
                      New
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT SPOTLIGHT (FIXED SCROLL ISSUE)
   ═══════════════════════════════════════════════════════════════ */
export const ProductSpotlight = ({ selectedSeries, onAdd, available, theme }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hlIdx, setHlIdx] = useState(0);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const norm = s => s.toLowerCase();
  const filtered = useMemo(() => {
    if (!q.trim()) return available.slice(0, 40);
    return available.filter(s => norm(s).includes(norm(q))).slice(0, 40);
  }, [available, q]);

  useEffect(() => setHlIdx(0), [filtered.length]);

  const measure = useCallback(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  const doOpen = useCallback(() => { measure(); setOpen(true); }, [measure]);

  // close on outside click — but NOT on scroll inside menu
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (anchorRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('resize', () => setOpen(false));
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('resize', () => setOpen(false)); };
  }, [open]);

  const pick = useCallback((s) => {
    if (!selectedSeries.includes(s)) onAdd(s);
    setQ(''); setOpen(false); inputRef.current?.blur();
  }, [selectedSeries, onAdd]);

  const onKey = useCallback((e) => {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); doOpen(); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHlIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHlIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[hlIdx]) pick(filtered[hlIdx]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
  }, [open, filtered, hlIdx, pick, doOpen]);

  const dark = isDarkTheme(theme);
  const subtleBorder = dark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)';

  return (
    <div ref={anchorRef}>
      <div onClick={doOpen}
        className="flex items-center gap-2 px-3.5 cursor-text"
        style={{ height: 40, borderRadius: 9999, background: dark ? theme.colors.background : theme.colors.surface, border: `1px solid ${subtleBorder}` }}>
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
        <input ref={inputRef} value={q}
          onChange={e => { setQ(e.target.value); if (!open) doOpen(); }}
          onFocus={doOpen} onKeyDown={onKey}
          placeholder="Search JSI series..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: theme.colors.textPrimary }} />
      </div>
      {open && createPortal(
        <div ref={menuRef}
          className="fixed rounded-2xl border shadow-xl overflow-hidden"
          style={{
            top: pos.top, left: pos.left, width: pos.width,
            maxHeight: 280, background: theme.colors.surface, borderColor: subtleBorder,
            zIndex: DESIGN_TOKENS.zIndex.popover,
          }}>
          <div className="overflow-y-auto" style={{ maxHeight: 280, WebkitOverflowScrolling: 'touch' }}>
            {filtered.length > 0 ? filtered.map((s, idx) => {
              const sel = selectedSeries.includes(s);
              const hl = idx === hlIdx;
              return (
                <button key={s} type="button"
                  onClick={() => pick(s)}
                  onMouseEnter={() => setHlIdx(idx)}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors ${hl ? 'bg-black/5 dark:bg-white/5' : ''}`}
                  style={{ color: sel ? theme.colors.textSecondary : theme.colors.textPrimary, opacity: sel ? 0.5 : 1 }}>
                  <span>{s}</span>
                  {sel && <Check className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />}
                </button>
              );
            }) : (
              <div className="px-3.5 py-4 text-sm text-center" style={{ color: theme.colors.textSecondary }}>No products found</div>
            )}
          </div>
        </div>, document.body
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD (added series with options)
   ═══════════════════════════════════════════════════════════════ */
export const ProductCard = React.memo(({ product, idx, onRemove, onUpdate, theme, showBorder = true }) => {
  const subtleBorder = isDarkTheme(theme) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const hasOpts = ['Vision', 'Knox', 'Wink', 'Hoopz'].includes(product.series);
  return (
    <div
      className={showBorder ? 'rounded-[20px] border' : ''}
      style={{ backgroundColor: theme.colors.surface, borderColor: showBorder ? subtleBorder : 'transparent' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{product.series}</span>
        <button type="button" onClick={() => onRemove(idx)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-[0.97]"
            style={{ color: theme.colors.error, backgroundColor: theme.colors.errorLight }}>
          <X className="w-3 h-3" /> Remove
        </button>
      </div>
      {hasOpts && (
        <div className="px-4 pb-3">
          {product.series === 'Vision' && <VisionOptions theme={theme} product={product} productIndex={idx} onUpdate={onUpdate} />}
          {product.series === 'Knox' && <KnoxOptions theme={theme} product={product} productIndex={idx} onUpdate={onUpdate} />}
          {(product.series === 'Wink' || product.series === 'Hoopz') && <WinkHoopzOptions theme={theme} product={product} productIndex={idx} onUpdate={onUpdate} />}
        </div>
      )}
    </div>
  );
});
