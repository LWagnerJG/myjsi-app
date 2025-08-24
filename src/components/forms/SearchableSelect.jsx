import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';

export const SearchableSelect = ({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select...',
  theme,
  allowClear = false,
  size = 'md',
  onMissingAction,
  missingActionLabel,
  searchPlaceholder = 'Search...'
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null); // {left, top, width, direction}

  const norm = useMemo(() => options.map(o => typeof o === 'string' ? { value: o, label: o } : {
    value: o.value || o.label || o.id || o.name || '',
    label: o.label || o.name || o.value || ''
  }), [options]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return norm;
    return norm.filter(o => o.label.toLowerCase().includes(q));
  }, [query, norm]);

  const selectedLabel = useMemo(() => norm.find(o => o.value === value)?.label || '', [norm, value]);

  const computePosition = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const estimatedHeight = Math.min(320, 56 + (filtered.length || 1) * 42); // rough heuristic
    const direction = spaceBelow < estimatedHeight && r.top > estimatedHeight ? 'up' : 'down';
    const baseTop = direction === 'down' ? r.bottom + 4 : r.top - estimatedHeight - 4;
    setMenuPos({ left: r.left, top: baseTop, width: r.width, direction });
  }, [filtered.length]);

  // Recompute when open, scroll, resize
  useEffect(() => {
    if (!open) return;
    computePosition();
    const handler = () => computePosition();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [open, computePosition]);

  // Outside click (include portal menu)
  useEffect(() => {
    if (!open) return;
    const handleDown = (e) => {
      if (containerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('touchstart', handleDown);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('touchstart', handleDown);
    };
  }, [open]);

  const selectValue = (val) => {
    onChange && onChange(val);
    setOpen(false);
    setQuery('');
  };
  const clear = (e) => { e.stopPropagation(); selectValue(''); };

  const sizeStyles = size === 'sm' ? 'py-2 text-sm' : 'py-3 text-base';

  // After menu actually renders, if direction is up we need accurate height to correct top
  useEffect(() => {
    if (open && menuRef.current && menuPos) {
      const h = menuRef.current.getBoundingClientRect().height;
      if (menuPos.direction === 'up') {
        const r = containerRef.current.getBoundingClientRect();
        const newTop = r.top - h - 4;
        if (Math.abs(newTop - menuPos.top) > 2) setMenuPos(p => ({ ...p, top: newTop }));
      }
    }
  }, [open, menuPos]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 0); }}
        className={`w-full px-4 pr-11 text-left rounded-full border transition-colors ${sizeStyles}`}
        style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`block truncate ${!selectedLabel ? 'opacity-60' : ''}`} style={{ color: theme.colors.textPrimary }}>
          {selectedLabel || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 gap-1">
          {allowClear && value && (
            <X onClick={clear} className="w-4 h-4 cursor-pointer hover:opacity-70" style={{ color: theme.colors.textSecondary }} />
          )}
          <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
        </span>
      </button>
      {open && menuPos && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', left: menuPos.left, top: menuPos.top, width: menuPos.width, zIndex: 10000 }}
        >
          <div className="rounded-2xl border shadow-2xl overflow-hidden" style={{ background: theme.colors.surface, borderColor: theme.colors.border }}>
            <div className="p-2 border-b" style={{ borderColor: theme.colors.border, background: theme.colors.surface }}>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 text-sm rounded-xl outline-none border"
                style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
              />
            </div>
            <ul className="max-h-64 overflow-y-auto py-1 scrollbar-hide" role="listbox" style={{ background: theme.colors.surface }}>
              {filtered.length === 0 && (
                <li className="px-4 py-4 space-y-3 text-center">
                  <div className="text-sm" style={{ color: theme.colors.textSecondary }}>No matches</div>
                  {onMissingAction && missingActionLabel && (
                    <button
                      type="button"
                      onClick={() => { onMissingAction(); setOpen(false); }}
                      className="w-full text-xs font-semibold px-4 py-2 rounded-full"
                      style={{ background: '#dc2626', color: '#fff' }}
                    >
                      {missingActionLabel}
                    </button>
                  )}
                </li>
              )}
              {filtered.map(opt => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => selectValue(opt.value)}
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${opt.value === value ? 'font-semibold' : ''}`}
                    style={{ color: theme.colors.textPrimary, backgroundColor: opt.value === value ? theme.colors.subtle : 'transparent' }}
                    role="option"
                    aria-selected={opt.value === value}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>, document.body)
      }
    </div>
  );
};
