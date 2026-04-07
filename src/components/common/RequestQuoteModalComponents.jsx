import React, { useState, useMemo } from 'react';
import { Search, X, Plus, CheckCircle2 } from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const SearchSelect = ({ value, onChange, options, placeholder, theme, onAddNew }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const isDark = isDarkTheme(theme);
    const c = theme?.colors || {};

    const filtered = useMemo(() => {
        if (!query) return options.slice(0, 8);
        return options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
    }, [options, query]);
    const canCreate = query && !options.some(o => o.toLowerCase() === query.toLowerCase());

    const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.025)';
    const fieldBrd = `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`;
    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
    const dropBg  = isDark ? '#2a2a2a' : '#fff';

    return (
        <div className="relative">
            <div
                className="flex items-center gap-2 px-3 cursor-text"
                style={{ height: 40, borderRadius: 12, background: fieldBg, border: fieldBrd }}
                onClick={() => setOpen(true)}
            >
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.4 }} />
                {value ? (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="text-[12px] font-medium truncate" style={{ color: c.textPrimary }}>{value}</span>
                        <button onClick={e => { e.stopPropagation(); onChange(''); }} className="p-0.5 rounded-full flex-shrink-0 transition-opacity opacity-40 hover:opacity-80"
                            style={{ color: c.textSecondary }}>
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <input
                        value={query}
                        onChange={e => { setQuery(e.target.value); setOpen(true); }}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent outline-none text-[12px] font-medium"
                        style={{ color: c.textPrimary }}
                        onFocus={() => setOpen(true)}
                    />
                )}
            </div>
            {open && !value && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-lg z-50"
                        style={{ backgroundColor: dropBg, border: fieldBrd }}>
                        <div className="max-h-[180px] overflow-y-auto scrollbar-hide py-0.5">
                            {filtered.map(opt => (
                                <button key={opt} className="w-full text-left px-3 py-2 text-[12px] font-medium transition-colors"
                                    style={{ color: c.textPrimary }}
                                    onClick={() => { onChange(opt); setQuery(''); setOpen(false); }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    {opt}
                                </button>
                            ))}
                            {canCreate && onAddNew && (
                                <>
                                    <div className="h-px mx-2"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                                    <button className="w-full text-left px-3 py-2 text-[12px] font-semibold flex items-center gap-2 transition-colors"
                                        style={{ color: c.accent }}
                                        onClick={() => { onAddNew(query); onChange(query); setQuery(''); setOpen(false); }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <Plus className="w-3 h-3" /> Add "{query}"
                                    </button>
                                </>
                            )}
                            {!filtered.length && !canCreate && (
                                <div className="px-3 py-2.5 text-[11px] text-center" style={{ color: c.textSecondary }}>No results</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export const MiniAvatar = ({ member, selected, onToggle, isDark, colors }) => {
    const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();
    return (
        <button type="button" onClick={() => onToggle(member.id)} className="relative group"
            title={`${member.firstName} ${member.lastName}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
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