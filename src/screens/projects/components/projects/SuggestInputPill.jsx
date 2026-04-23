import React, { useState, useMemo, useEffect, useRef } from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

export const SuggestInputPill = ({ placeholder, suggestions, onAdd, theme }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menu = useRef(null);
  const isDark = isDarkTheme(theme);
  const filtered = useMemo(() => suggestions.filter(s => s.toLowerCase().includes(q.toLowerCase()) && s.toLowerCase() !== q.toLowerCase()).slice(0, 12), [q, suggestions]);

  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (ref.current && !ref.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  const commit = (val) => {
    if (val) {
      onAdd(val);
      setQ('');
    }
    setOpen(false);
  };

  const fieldBg = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.62)';
  const fieldBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(227,224,216,0.95)';

  return (
    <div className="relative" ref={ref} style={{ minWidth: 152 }}>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Enter') { commit(q.trim()); } if (e.key === 'Escape') { setOpen(false); } }}
        placeholder={placeholder}
        className="h-10 px-3.5 text-xs font-medium outline-none border w-full"
        style={{ backgroundColor: fieldBg, borderColor: fieldBorder, color: theme.colors.textPrimary, borderRadius: '24px' }}
      />
      {open && filtered.length > 0 && (
        <div ref={menu} className="absolute z-50 mt-1.5 border shadow-lg overflow-hidden" style={{ background: theme.colors.surface, borderColor: fieldBorder, maxHeight: 220, width: '100%', borderRadius: '24px' }}>
          <div className="overflow-y-auto p-1.5" style={{ maxHeight: 220 }}>
            {filtered.map(s => (
              <button
                key={s}
                onClick={() => commit(s)}
                className="w-full text-left px-3.5 py-2.5 text-xs transition-colors rounded-[18px]"
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
