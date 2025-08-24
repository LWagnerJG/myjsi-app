import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { User, Bell, Palette, Grid, Plus, GripVertical } from 'lucide-react';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';

// Safe normalization helper
const cleanLabel = (s='') => Array.from(s).filter(ch => { const c=ch.charCodeAt(0); return c!==0xFFFD && c>=32; }).join('');

// Toggle component
const Toggle = ({ checked, onChange, theme }) => (
  <button onClick={() => onChange(!checked)} className="w-12 h-6 rounded-full transition-all duration-200 relative" style={{ backgroundColor: checked ? theme.colors.accent : theme.colors.border }}>
    <div className="w-5 h-5 bg-white rounded-full transition-transform duration-200 absolute top-0.5" style={{ transform: checked ? 'translateX(26px)' : 'translateX(2px)', left: 0 }} />
  </button>
);

// Select component
const Select = ({ value, onChange, options, theme }) => {
  const [open, setOpen] = useState(false); const ref = useRef(null);
  useEffect(() => { const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  const current = options.find(o => o.value === value)?.label || 'Select';
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o=>!o)} className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-sm" style={{ backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
        <span>{current}</span>
      </button>
      {open && (
        <div className="absolute z-[9999] mt-1 w-full">
          <GlassCard theme={theme} className="p-1">
            {options.map(o => (
              <button key={o.value} onClick={()=>{onChange(o.value); setOpen(false);}} className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 text-sm" style={{ color: theme.colors.textPrimary }}>{o.label}</button>
            ))}
          </GlassCard>
        </div>
      )}
    </div>
  );
};

// Load home apps from localStorage or return default
const loadHomeApps = () => { try { const raw = localStorage.getItem('homeApps'); if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length === 8) return p; } } catch {}; return [...DEFAULT_HOME_APPS]; };

// Main settings screen component
export const SettingsScreen = ({ theme, isDarkMode, onToggleTheme, onUpdateHomeApps }) => {
  // Account state
  const [firstName, setFirstName] = useState('Luke');
  const [lastName, setLastName] = useState('Wagner');
  const [shirtSize, setShirtSize] = useState('L');

  // Notifications state
  const [notif, setNotif] = useState({ newOrder: true, samplesShipped: true, leadTimeChange: true, communityPost: false, replacementApproved: true, commissionPosted: true, orderUpdate: true });
  const notifLabels = { newOrder:'New order placed', orderUpdate:'Order status update', samplesShipped:'Samples shipped', leadTimeChange:'Lead time change', replacementApproved:'Replacement approved', commissionPosted:'Commission posted', communityPost:'New JSI community post' };
  const notifKeys = Object.keys(notif);

  // Homepage apps state
  const [selected, setSelected] = useState(loadHomeApps);
  const dragIndex = useRef(null);

  // Auto-persist selected apps to localStorage and notify parent
  useEffect(()=>{ if (selected.length === 8) { try { localStorage.setItem('homeApps', JSON.stringify(selected)); } catch {}; onUpdateHomeApps && onUpdateHomeApps(selected); } }, [selected, onUpdateHomeApps]);

  // Derived available apps (exclude selected)
  const availableApps = useMemo(()=> allApps.filter(a => !selected.includes(a.route) && !a.route.startsWith('settings')).sort((a,b)=>a.name.localeCompare(b.name)), [selected]);

  // Add app to homepage
  const addApp = route => setSelected(prev => prev.length < 8 && !prev.includes(route) ? [...prev, route] : prev);
  // Remove app from homepage
  const removeApp = route => setSelected(prev => prev.filter(r => r !== route));

  // Reorder on drag over for immediacy
  const handleDragStart = idx => e => { dragIndex.current = idx; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', idx); };
  const handleDragEnter = idx => e => { e.preventDefault(); const from = dragIndex.current; if (from == null || from === idx) return; setSelected(prev => { const next=[...prev]; const [it]=next.splice(from,1); next.splice(idx,0,it); dragIndex.current=idx; return next; }); };
  const handleDragEnd = () => { dragIndex.current=null; };

  // Build 8 slots (fill with null placeholders if not yet filled)
  const slots = useMemo(()=>{ const arr=[...selected]; while(arr.length<8) arr.push(null); return arr; }, [selected]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto px-4 pb-16 space-y-6 pt-4 scrollbar-hide">
        {/* Account */}
        <GlassCard theme={theme} className="p-0">
          <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}>
            <div className="flex items-center gap-2"><User className="w-5 h-5" style={{ color: theme.colors.accent }} /><h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Account</h2></div>
          </div>
          <div className="p-4 grid grid-cols-1 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>First Name</label><input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ backgroundColor:theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary }} /></div>
            <div><label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>Last Name</label><input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ backgroundColor:theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary }} /></div>
            <div><label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>T-Shirt Size</label><Select value={shirtSize} onChange={setShirtSize} options={['XS','S','M','L','XL','XXL'].map(s=>({value:s,label:s}))} theme={theme} /></div>
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard theme={theme} className="p-0">
          <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}>
            <div className="flex items-center gap-2"><Bell className="w-5 h-5" style={{ color: theme.colors.accent }} /><h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Push Notifications</h2></div>
          </div>
          <div className="p-2">
            {notifKeys.map((k,i)=>(

              <div key={k} className={`flex items-center justify-between px-2 py-3 ${i<notifKeys.length-1?'border-b':''}`} style={{ borderColor: theme.colors.subtle }}>
                <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{notifLabels[k]}</span>
                <Toggle checked={!!notif[k]} onChange={v=>setNotif(p=>({...p,[k]:v}))} theme={theme} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Homepage Apps */}
        <GlassCard theme={theme} className="p-0">
          <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}>
            <div className="flex items-center gap-2"><Grid className="w-5 h-5" style={{ color: theme.colors.accent }} /><h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Homepage Apps</h2></div>
            <p className="mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>Drag to reorder (2 x 4 grid). Tap a tile to remove. Add from list below.</p>
          </div>
          <div className="p-4 space-y-6">
            {/* Mini grid */}
            <div className="grid grid-cols-2 gap-3">
              {slots.map((route, idx) => {
                if (route === null) return (
                  <div key={idx} className="h-16 rounded-2xl flex items-center justify-center text-[11px] font-medium border border-dashed" style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}>
                    Empty
                  </div>
                );
                const app = allApps.find(a => a.route === route);
                if (!app) return null;
                return (
                  <button
                    key={route}
                    draggable="true"
                    onDragStart={handleDragStart(idx)}
                    onDragEnter={handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onClick={()=>removeApp(route)}
                    className="relative group h-16 p-2 rounded-2xl flex flex-col items-start justify-between overflow-hidden select-none cursor-grab active:cursor-grabbing transition shadow-sm bg-white/80 hover:shadow-md"
                    style={{ border:`1px solid ${theme.colors.border}`, backgroundColor: theme.colors.surface }}
                  >
                    <div className="flex items-center w-full justify-between">
                      <app.icon className="w-[18px] h-[18px]" style={{ color: theme.colors.accent }} />
                      <GripVertical className="w-3 h-3 opacity-40 group-hover:opacity-70" style={{ color: theme.colors.textSecondary }} />
                    </div>
                    <span className="text-[12px] font-semibold tracking-tight text-left leading-tight" style={{ color: theme.colors.textPrimary }}>{cleanLabel(app.name)}</span>
                    <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] font-medium" style={{ background:'rgba(0,0,0,0.04)', color: theme.colors.textSecondary }}>Remove</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Available Apps</h3>
              <div className="flex flex-wrap gap-2">
                {availableApps.map(app => (
                  <button key={app.route} onClick={()=>addApp(app.route)} disabled={selected.length>=8} className={`flex items-center gap-1 pl-2 pr-3 py-1.5 rounded-full text-[11px] font-medium border transition ${selected.length>=8?'opacity-40 cursor-not-allowed':'hover:bg-white hover:shadow-sm active:scale-[0.97]'} focus:outline-none`} style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>
                    <app.icon className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                    <span>{cleanLabel(app.name).length>18?cleanLabel(app.name).slice(0,17)+'…':cleanLabel(app.name)}</span>
                    {selected.length<8 && <Plus className="w-3 h-3" />}
                  </button>
                ))}
              </div>
              <div className="text-[11px] flex justify-between px-1" style={{ color: theme.colors.textSecondary }}>
                <span>{selected.length<8 ? `Select ${8-selected.length} more` : 'All 8 selected'}</span>
                <span>Auto-saved</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Appearance */}
        <GlassCard theme={theme} className="p-0">
          <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}>
            <div className="flex items-center gap-2"><Palette className="w-5 h-5" style={{ color: theme.colors.accent }} /><h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Appearance</h2></div>
          </div>
          <div className="p-4 flex items-center justify-between"><span className="text-sm" style={{ color: theme.colors.textPrimary }}>Dark mode</span><Toggle checked={isDarkMode} onChange={onToggleTheme} theme={theme} /></div>
        </GlassCard>

        <div className="pt-2 text-center text-[10px]" style={{ color: theme.colors.textSecondary }}>v0.9.3</div>
      </div>
    </div>
  );
};
