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
    <div className={`rounded-[24px] ${className}`} style={{
      padding: '16px',
      backgroundColor: dark ? theme.colors.surface : '#fff',
      border: `1px solid ${divider}`,
    }}>
      {title && (
        <div className="mb-2.5">
          <div className="flex items-start gap-3">
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold leading-tight" style={{
                color: theme.colors.textPrimary,
                letterSpacing: '-0.01em',
              }}>{title}</h3>
              {subtitle && (
                <p className="text-[12px] mt-0.5 leading-snug" style={{ color: theme.colors.textSecondary }}>
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
export const Row = ({ label, children, theme, tip, noSep, inline }) => {
  const divider = isDarkTheme(theme) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const rowLayout = inline ? 'grid items-start gap-2 md:grid-cols-[110px_minmax(0,1fr)] md:gap-3' : '';
  return (
  <div className={`${rowLayout} py-2.5`}
    style={{ borderColor: undefined }}>
    {label && (
      <div className={`flex items-center gap-1.5 ${inline ? 'md:min-h-[34px] md:pt-1' : 'mb-1.5'}`}>
        <label className={`text-[12px] font-semibold ${inline ? 'whitespace-nowrap' : ''}`}
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
          className="flex-1 bg-transparent outline-none text-[13px]"
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
                  className={`w-full text-left px-3.5 py-2.5 text-[13px] flex items-center justify-between transition-colors ${hl ? 'bg-black/5 dark:bg-white/5' : ''}`}
                  style={{ color: sel ? theme.colors.textSecondary : theme.colors.textPrimary, opacity: sel ? 0.5 : 1 }}>
                  <span>{s}</span>
                  {sel && <Check className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />}
                </button>
              );
            }) : (
              <div className="px-3.5 py-4 text-[13px] text-center" style={{ color: theme.colors.textSecondary }}>No products found</div>
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
        <span className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>{product.series}</span>
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
