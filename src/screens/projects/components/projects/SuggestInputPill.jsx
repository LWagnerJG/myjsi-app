import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

export const SuggestInputPill = ({ placeholder, suggestions, onAdd, theme, collapsible = false }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(!collapsible);
  const ref = useRef(null);
  const menu = useRef(null);
  const inputRef = useRef(null);
  const isDark = isDarkTheme(theme);
  const filtered = useMemo(() => suggestions.filter(s => s.toLowerCase().includes(q.toLowerCase()) && s.toLowerCase() !== q.toLowerCase()).slice(0, 12), [q, suggestions]);

  useEffect(() => {
    if (!open && !expanded) return;
    const close = e => {
      if (ref.current && !ref.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) {
        setOpen(false);
        if (collapsible && !q.trim()) setExpanded(false);
      }
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open, expanded, collapsible, q]);

  useEffect(() => {
    if (expanded && collapsible && inputRef.current) inputRef.current.focus();
  }, [expanded, collapsible]);

  const commit = (val) => {
    if (val) {
      onAdd(val);
      setQ('');
    }
    setOpen(false);
  };

  const fieldBg = isDark ? 'rgba(255,255,255,0.065)' : 'rgba(240,237,232,0.5)';

  if (collapsible && !expanded) {
    return (
      <button
        type="button"
        aria-label={placeholder}
        onClick={() => setExpanded(true)}
        className="inline-flex items-center justify-center flex-shrink-0 transition-all active:scale-[0.95] focus-ring"
        style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: fieldBg, color: theme.colors.textSecondary }}
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="relative" ref={ref} style={{ minWidth: 120 }}>
      <input
        ref={inputRef}
        value={q}
        aria-label={placeholder}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter') { commit(q.trim()); if (collapsible) setExpanded(false); }
          if (e.key === 'Escape') { setOpen(false); if (collapsible && !q.trim()) setExpanded(false); }
        }}
        placeholder={placeholder}
        className="h-8 px-3 text-[0.75rem] font-medium outline-none w-full focus-ring"
        style={{ backgroundColor: fieldBg, color: theme.colors.textPrimary, borderRadius: '9999px' }}
      />
      {open && filtered.length > 0 && (
        <div ref={menu} className="absolute z-50 mt-1.5 border shadow-lg overflow-hidden" style={{ background: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(227,224,216,0.9)', maxHeight: 220, width: '100%', borderRadius: '16px' }}>
          <div className="overflow-y-auto scrollbar-hide p-1.5" style={{ maxHeight: 220 }}>
            {filtered.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { commit(s); if (collapsible) setExpanded(false); }}
                className="w-full text-left px-3 py-2.5 text-[0.8125rem] transition-colors rounded-[14px]"
                style={{ color: theme.colors.textPrimary }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.subtle}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
