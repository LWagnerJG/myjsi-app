import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { DEALER_CONTACTS } from './utils.js';

const getInitials = (name) => String(name || '').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const ContactSearchSelector = ({ value, onChange, dealers, theme, multiple = false }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const isDark = isDarkTheme(theme);

  const selected = useMemo(
    () => multiple ? (Array.isArray(value) ? value : value ? [value] : []) : [],
    [multiple, value],
  );
  const selectedSet = useMemo(() => new Set(selected.map(s => String(s).toLowerCase())), [selected]);

  const contacts = useMemo(() => {
    const all = [];
    (dealers || []).forEach(d => {
      const dc = DEALER_CONTACTS[d];
      if (dc) dc.forEach(c => { if (!all.some(x => x.name === c.name)) all.push({ ...c, dealer: d }); });
    });
    return all;
  }, [dealers]);
  const filtered = useMemo(() => {
    const base = !query
      ? contacts
      : contacts.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()) || c.title?.toLowerCase().includes(query.toLowerCase()));
    return multiple ? base.filter(c => !selectedSet.has(c.name.toLowerCase())) : base;
  }, [contacts, query, multiple, selectedSet]);
  useEffect(() => {
    if (!open) return undefined;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  const fieldBg = isDark ? 'rgba(255,255,255,0.065)' : 'rgba(240,237,232,0.5)';

  const addContact = (name) => {
    const trimmed = String(name || '').trim();
    if (!trimmed) return;
    if (multiple) {
      if (selectedSet.has(trimmed.toLowerCase())) { setQuery(''); setOpen(false); return; }
      onChange([...selected, trimmed]);
    } else {
      onChange(trimmed);
    }
    setQuery('');
    setOpen(false);
  };
  const removeContact = (name) => {
    if (multiple) onChange(selected.filter(s => s !== name));
    else onChange('');
    setQuery('');
  };

  const showDropdown = open && (multiple || !value);
  const searchPlaceholder = multiple && selected.length ? 'Add another contact' : 'Search contacts';

  const SearchRow = (
    <div className="flex min-h-[44px] items-center gap-2.5 py-2 px-3.5" style={{ background: fieldBg, borderRadius: '16px' }}>
      <Search size={14} aria-hidden="true" style={{ color: theme.colors.textSecondary, opacity: 0.4, flexShrink: 0 }} />
      <input
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-label="Search contacts"
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Enter' && query.trim()) { addContact(query); } if (e.key === 'Escape') setOpen(false); }}
        className="flex-1 min-w-0 bg-transparent outline-none text-[0.875rem] font-semibold"
        style={{ color: theme.colors.textPrimary }}
        placeholder={searchPlaceholder}
      />
    </div>
  );

  const SelectedCard = (name) => (
    <div key={name} className="flex min-h-[44px] items-center gap-2.5 py-2 px-3.5" style={{ background: fieldBg, borderRadius: '16px' }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6875rem] font-bold flex-shrink-0" style={{ backgroundColor: `${theme.colors.accent}16`, color: theme.colors.accent }}>
        {getInitials(name)}
      </div>
      <span className="flex-1 text-[0.875rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{name}</span>
      <button type="button" onClick={() => removeContact(name)} className="w-7 h-7 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity focus-ring" aria-label={`Remove ${name}`}>
        <X className="w-3.5 h-3.5" aria-hidden="true" style={{ color: theme.colors.textSecondary }} />
      </button>
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      {multiple ? (
        <div className="space-y-1.5">
          {selected.map(name => SelectedCard(name))}
          {SearchRow}
        </div>
      ) : value ? (
        SelectedCard(value)
      ) : (
        SearchRow
      )}
      {showDropdown && (
        <div className="absolute z-50 mt-1.5 left-0 right-0 overflow-hidden shadow-xl" style={{ backgroundColor: theme.colors.surface, border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(227,224,216,0.9)', borderRadius: '16px' }}>
          <div className="max-h-[200px] overflow-y-auto scrollbar-hide p-1.5">
            {filtered.length > 0 ? filtered.map(c => (
              <button key={c.name} type="button" onClick={() => addContact(c.name)} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors rounded-[14px]" onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6875rem] font-bold flex-shrink-0" style={{ backgroundColor: `${theme.colors.accent}16`, color: theme.colors.accent }}>
                  {getInitials(c.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-[0.875rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{c.name}</div>
                  <div className="text-[0.6875rem] truncate" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>{c.title} - {c.dealer}</div>
                </div>
              </button>
            )) : (
              <div className="px-3 py-3 text-center text-[0.8125rem]" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
                {contacts.length === 0 ? 'Add a dealer to see contacts' : (multiple && selected.length ? 'No more matching contacts' : 'No matching contacts')}
              </div>
            )}
          </div>
          {query.trim() && !contacts.some(c => c.name.toLowerCase() === query.toLowerCase()) && !selectedSet.has(query.trim().toLowerCase()) && (
            <button type="button" onClick={() => addContact(query)} className="w-full text-left px-3.5 py-3 flex items-center gap-2.5 border-t transition-colors" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(227,224,216,0.85)' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <UserPlus size={14} style={{ color: theme.colors.accent }} />
              <span className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.accent }}>Add "{query.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
