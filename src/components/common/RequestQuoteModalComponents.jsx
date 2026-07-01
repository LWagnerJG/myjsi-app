import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Plus, CheckCircle2 } from 'lucide-react';
import { isDarkTheme, fieldTileSurface, portalMenuSurface, PORTAL_MENU_Z_INDEX } from '../../design-system/tokens.js';

export const SearchSelect = ({ value, onChange, options, placeholder, theme }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const isDark = isDarkTheme(theme);
  const c = theme?.colors || {};
  const fieldBg = fieldTileSurface(theme).backgroundColor;
  const menuShell = portalMenuSurface(theme);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = !needle
      ? options.slice(0, 8)
      : options.filter(o => o.toLowerCase().includes(needle));
    return pool.slice(0, 8);
  }, [options, query]);

  const canCreate = !!query.trim() && !options.some(o => o.toLowerCase() === query.trim().toLowerCase());
  const optionCount = filtered.length + (canCreate ? 1 : 0);

  const measure = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const maxH = 220;
    const openUp = (window.innerHeight - rect.bottom) < (maxH + 16) && rect.top > maxH;
    setPos({
      top: openUp ? rect.top + window.scrollY : rect.bottom + window.scrollY + 6,
      bottom: openUp ? window.innerHeight - rect.top + window.scrollY + 6 : undefined,
      left: rect.left + window.scrollX,
      width: rect.width,
      openUp,
    });
  }, []);

  useEffect(() => { setActiveIdx(0); }, [query, open, filtered.length, canCreate]);

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
    if (!open) return undefined;
    const close = (e) => {
      if (anchorRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close, { passive: true });
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  const pick = (val) => {
    onChange(val);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
    if (!open && e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); measure(); return; }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!optionCount) return;
      setActiveIdx(i => Math.min(i + 1, optionCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!optionCount) return;
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (optionCount) {
        if (activeIdx < filtered.length) pick(filtered[activeIdx]);
        else if (canCreate) pick(query.trim());
      }
    }
  };

  const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : '#E8EBEE';

  return (
    <div ref={anchorRef} className="relative min-w-0">
      <div
        className="flex min-h-[44px] items-center gap-2 px-3.5 cursor-text focus-within:outline-none"
        style={{ borderRadius: 9999, backgroundColor: fieldBg }}
        onClick={() => { if (!value) { setOpen(true); measure(); } }}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.45 }} aria-hidden="true" />
        {value ? (
          <div className="flex flex-1 min-w-0 items-center justify-between gap-2">
            <span className="truncate text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>{value}</span>
            <button
              type="button"
              aria-label={`Clear ${value}`}
              onClick={(e) => { e.stopPropagation(); onChange(''); setQuery(''); }}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full focus-ring"
              style={{ color: c.textSecondary, opacity: 0.55 }}
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); measure(); }}
            onFocus={() => { setOpen(true); measure(); }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            className="min-w-0 flex-1 bg-transparent text-[0.8125rem] font-semibold outline-none"
            style={{ color: c.textPrimary }}
          />
        )}
      </div>
      {open && !value && optionCount > 0 && createPortal(
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
            maxHeight: 220,
            zIndex: PORTAL_MENU_Z_INDEX,
            borderRadius: '24px',
          }}
        >
          {filtered.map((opt, i) => (
            <li key={opt} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={i === activeIdx}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => pick(opt)}
                className="w-full rounded-full px-3 py-2.5 text-left text-[0.8125rem] font-medium transition-colors focus-ring"
                style={{
                  color: c.textPrimary,
                  backgroundColor: i === activeIdx ? hoverBg : 'transparent',
                }}
              >
                {opt}
              </button>
            </li>
          ))}
          {canCreate ? (
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={activeIdx === filtered.length}
                onMouseEnter={() => setActiveIdx(filtered.length)}
                onClick={() => pick(query.trim())}
                className="flex w-full items-center gap-2 rounded-full px-3 py-2.5 text-left text-[0.8125rem] font-semibold transition-colors focus-ring"
                style={{
                  color: c.accent,
                  backgroundColor: activeIdx === filtered.length ? hoverBg : 'transparent',
                }}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add &ldquo;{query.trim()}&rdquo;
              </button>
            </li>
          ) : null}
        </ul>,
        document.body,
      )}
    </div>
  );
};

export const MiniAvatar = ({ member, selected, onToggle, isDark, colors }) => {
  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();
  return (
    <button type="button" onClick={() => onToggle(member.id)} className="relative group"
      title={`${member.firstName} ${member.lastName}`}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.6875rem] font-bold transition-all"
        style={{
          backgroundColor: selected ? colors.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
          color: selected ? (colors.accentText || '#FFFFFF') : colors.textPrimary,
          border: `2px solid ${selected ? colors.accent : 'transparent'}`,
        }}>
        {initials}
      </div>
      {selected && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--theme-success)' }}>
          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </button>
  );
};
