import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { isDarkTheme, fieldTileSurface, portalMenuSurface, PORTAL_MENU_Z_INDEX } from '../../../../design-system/tokens.js';

export const SuggestInputPill = ({
  placeholder,
  suggestions,
  onAdd,
  theme,
  collapsible = false,
  compact = false,
  className = '',
}) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(!collapsible);
  const [activeIdx, setActiveIdx] = useState(0);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const fieldBg = fieldTileSurface(theme).backgroundColor;
  const menuShell = portalMenuSurface(theme);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const pool = suggestions.filter(s => !needle || s.toLowerCase().includes(needle));
    return pool.slice(0, 10);
  }, [q, suggestions]);

  const canAddCustom = !!q.trim() && !suggestions.some(s => s.toLowerCase() === q.trim().toLowerCase());
  const optionCount = filtered.length + (canAddCustom ? 1 : 0);

  const measure = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const maxH = 240;
    const openUp = (window.innerHeight - rect.bottom) < (maxH + 16) && rect.top > maxH;
    setPos({
      top: openUp ? rect.top + window.scrollY : rect.bottom + window.scrollY + 6,
      bottom: openUp ? window.innerHeight - rect.top + window.scrollY + 6 : undefined,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 200),
      openUp,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    if (collapsible && !q.trim()) setExpanded(false);
  }, [collapsible, q]);

  const commit = useCallback((val) => {
    const trimmed = String(val || '').trim();
    if (trimmed) {
      onAdd(trimmed);
      setQ('');
    }
    setOpen(false);
    if (collapsible) setExpanded(false);
  }, [collapsible, onAdd]);

  const openMenu = useCallback(() => {
    measure();
    setOpen(true);
  }, [measure]);

  useEffect(() => { setActiveIdx(0); }, [q, open, filtered.length, canAddCustom]);

  useEffect(() => {
    if (!open) return undefined;
    measure();
    const sync = () => measure();
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [measure, open]);

  useEffect(() => {
    if (!open && !expanded) return undefined;
    const onPointerDown = (e) => {
      if (anchorRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [closeMenu, expanded, open]);

  useEffect(() => {
    if (expanded && collapsible) inputRef.current?.focus();
  }, [collapsible, expanded]);

  const pickOption = useCallback((idx) => {
    if (idx < filtered.length) commit(filtered[idx]);
    else if (canAddCustom) commit(q.trim());
  }, [canAddCustom, commit, filtered, q]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }
    if (!open && e.key === 'ArrowDown') {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!open) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commit(q.trim());
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!optionCount) return;
      setActiveIdx(i => Math.min(i + 1, optionCount - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!optionCount) return;
      setActiveIdx(i => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (optionCount) pickOption(activeIdx);
      else commit(q.trim());
      return;
    }
    if (e.key === 'Tab') closeMenu();
  };

  if (collapsible && !expanded) {
    return (
      <button
        type="button"
        aria-label={placeholder}
        onClick={() => setExpanded(true)}
        className="inline-flex items-center justify-center flex-shrink-0 transition-all active:scale-[0.9] focus-ring hover:opacity-100"
        style={{
          width: 28,
          height: 28,
          borderRadius: 9999,
          backgroundColor: 'transparent',
          border: `1px dashed ${isDark ? 'rgba(255,255,255,0.22)' : 'rgba(53,53,53,0.22)'}`,
          color: c.textSecondary,
          opacity: 0.7,
        }}
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    );
  }

  const inputClass = compact
    ? 'min-h-[40px] px-3.5 text-[0.75rem] font-semibold outline-none w-full focus-ring'
    : 'min-h-[44px] px-3.5 text-[0.8125rem] font-semibold outline-none w-full focus-ring';

  return (
    <div ref={anchorRef} className={`relative min-w-0 ${className}`}>
      <input
        ref={inputRef}
        value={q}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label={placeholder}
        onChange={e => { setQ(e.target.value); if (!open) openMenu(); else setOpen(true); }}
        onFocus={() => openMenu()}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClass}
        style={{ backgroundColor: fieldBg, color: c.textPrimary, borderRadius: '9999px' }}
      />
      {open && optionCount > 0 && createPortal(
        <ul
          ref={menuRef}
          role="listbox"
          className="fixed m-0 list-none overflow-y-auto p-1.5 scrollbar-hide"
          style={{
            ...menuShell,
            top: pos.openUp ? undefined : pos.top,
            bottom: pos.openUp ? pos.bottom : undefined,
            left: pos.left,
            width: pos.width,
            maxHeight: 240,
            zIndex: PORTAL_MENU_Z_INDEX,
            borderRadius: '24px',
          }}
        >
          {filtered.map((s, i) => {
            const active = i === activeIdx;
            return (
              <li key={s} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => pickOption(i)}
                  className="w-full text-left px-3 py-2.5 text-[0.8125rem] font-medium transition-colors rounded-full focus-ring"
                  style={{
                    color: c.textPrimary,
                    backgroundColor: active ? (isDark ? 'rgba(255,255,255,0.08)' : '#E8EBEE') : 'transparent',
                  }}
                >
                  {s}
                </button>
              </li>
            );
          })}
          {canAddCustom ? (
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={activeIdx === filtered.length}
                onMouseEnter={() => setActiveIdx(filtered.length)}
                onClick={() => commit(q.trim())}
                className="w-full text-left px-3 py-2.5 text-[0.8125rem] font-medium transition-colors rounded-full focus-ring"
                style={{
                  color: c.textSecondary,
                  backgroundColor: activeIdx === filtered.length ? (isDark ? 'rgba(255,255,255,0.08)' : '#E8EBEE') : 'transparent',
                }}
              >
                Add &ldquo;{q.trim()}&rdquo;
              </button>
            </li>
          ) : null}
        </ul>,
        document.body,
      )}
    </div>
  );
};
