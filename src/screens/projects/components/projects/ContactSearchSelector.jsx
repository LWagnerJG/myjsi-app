import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { DEALER_CONTACTS } from './utils.js';

export const ContactSearchSelector = ({ value, onChange, dealers, theme }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const isDark = isDarkTheme(theme);
  const contacts = useMemo(() => {
    const all = [];
    (dealers || []).forEach(d => {
      const dc = DEALER_CONTACTS[d];
      if (dc) dc.forEach(c => { if (!all.some(x => x.name === c.name)) all.push({ ...c, dealer: d }); });
    });
    return all;
  }, [dealers]);
  const filtered = useMemo(() => !query ? contacts : contacts.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.title.toLowerCase().includes(query.toLowerCase())), [contacts, query]);
  useEffect(() => { if (!open) return; const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; window.addEventListener('mousedown', close); return () => window.removeEventListener('mousedown', close); }, [open]);
  const fieldBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)';
  const fieldBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';
  return (
    <div className="relative" ref={ref}>
      {value ? (
        <div className="flex items-center gap-2.5 py-2 px-3.5 rounded-xl" style={{ background: fieldBg, border: fieldBorder }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ backgroundColor: theme.colors.accent + '18', color: theme.colors.accent }}>
            {value.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <span className="flex-1 text-sm font-medium truncate" style={{ color: theme.colors.textPrimary }}>{value}</span>
          <button onClick={() => { onChange(''); setQuery(''); }} className="p-0.5 rounded-full opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-sm leading-none" style={{ color: theme.colors.textSecondary }}>×</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 py-2 px-3.5 rounded-xl" style={{ background: fieldBg, border: fieldBorder }}>
          <Search size={14} style={{ color: theme.colors.textSecondary, opacity: 0.4, flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={e => { if (e.key === 'Enter' && query.trim()) { onChange(query.trim()); setQuery(''); setOpen(false); } if (e.key === 'Escape') setOpen(false); }}
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{ color: theme.colors.textPrimary }}
            placeholder="Search contacts..."
          />
        </div>
      )}
      {open && !value && (
        <div className="absolute z-50 mt-1.5 left-0 right-0 rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: isDark ? '#2a2a2a' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' }}>
          <div className="max-h-[200px] overflow-y-auto scrollbar-hide py-1">
            {filtered.length > 0 ? filtered.map(c => (
              <button key={c.name} onClick={() => { onChange(c.name); setQuery(''); setOpen(false); }} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors" onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ backgroundColor: theme.colors.accent + '18', color: theme.colors.accent }}>
                  {c.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{c.name}</div>
                  <div className="text-[11px] truncate" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{c.title} · {c.dealer}</div>
                </div>
              </button>
            )) : (
              <div className="px-3 py-3 text-center text-xs" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
                {contacts.length === 0 ? 'Add a dealer to see contacts' : 'No matching contacts'}
              </div>
            )}
          </div>
          {query.trim() && !contacts.some(c => c.name.toLowerCase() === query.toLowerCase()) && (
            <button onClick={() => { onChange(query.trim()); setQuery(''); setOpen(false); }} className="w-full text-left px-3 py-2.5 flex items-center gap-2 border-t transition-colors" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <UserPlus size={14} style={{ color: theme.colors.accent }} />
              <span className="text-xs font-semibold" style={{ color: theme.colors.accent }}>Add "{query.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
