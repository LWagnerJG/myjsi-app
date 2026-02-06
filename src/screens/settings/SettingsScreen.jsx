import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { User, Bell, Palette, Grid, Plus, GripVertical, ChevronDown } from 'lucide-react';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';

// Safe normalization helper
const cleanLabel = (s='') => Array.from(s).filter(ch => { const c=ch.charCodeAt(0); return c!==0xFFFD && c>=32; }).join('');

const Toggle = ({ checked, onChange, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <button onClick={() => onChange(!checked)} className="w-12 h-7 rounded-full transition-all duration-200 relative flex-shrink-0" style={{ backgroundColor: checked ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : theme.colors.border) }}>
      <div className="w-5.5 h-5.5 rounded-full transition-transform duration-200 absolute top-[3px]" style={{ width: 22, height: 22, backgroundColor: checked ? (isDark ? '#1A1A1A' : '#FFFFFF') : (isDark ? 'rgba(255,255,255,0.5)' : '#FFFFFF'), transform: checked ? 'translateX(24px)' : 'translateX(3px)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', left: 0 }} />
    </button>
  );
};

// Glass portal dropdown Select
const Select = ({ value, onChange, options, theme }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const portalRef = useRef(null);
  const [rect, setRect] = useState(null);
  const isDark = isDarkTheme(theme);

  useEffect(() => {
    const handleClick = (e) => {
      if (!open) return;
      if (triggerRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open && triggerRef.current) {
      const update = () => { if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect()); };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
    }
  }, [open]);

  const current = options.find(o => o.value === value)?.label || 'Select';

  return (
    <div className="relative" ref={triggerRef}>
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full px-4 py-2.5 rounded-2xl flex items-center justify-between text-sm font-medium transition-all" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
        <span>{current}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
      </button>
      {open && rect && createPortal(
        <div ref={portalRef} style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, width: rect.width, zIndex: DESIGN_TOKENS.zIndex.popover }}>
          <div className="py-1.5 rounded-2xl overflow-hidden" style={{
            backgroundColor: isDark ? 'rgba(40,40,40,0.88)' : 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: DESIGN_TOKENS.shadows.modal
          }}>
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors active:scale-[0.99]" style={{ color: o.value === value ? theme.colors.accent : theme.colors.textPrimary, backgroundColor: o.value === value ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)') : 'transparent' }}
                onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { if (o.value !== value) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>, document.body)
      }
    </div>
  );
};

const loadHomeApps = () => { try { const raw = localStorage.getItem('homeApps'); if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length === 8) return p; } } catch { /* no-op */ } return [...DEFAULT_HOME_APPS]; };

// Section header
const SectionHeader = ({ icon: Icon, title, subtitle, theme }) => (
  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${isDarkTheme(theme) ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}>
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: isDarkTheme(theme) ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.06)' }}>
        <Icon className="w-4 h-4" style={{ color: theme.colors.accent }} />
      </div>
      <div>
        <h2 className="text-[15px] font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{subtitle}</p>}
      </div>
    </div>
  </div>
);

export const SettingsScreen = ({ theme, isDarkMode, onToggleTheme, onUpdateHomeApps }) => {
  const isDark = isDarkTheme(theme);
  const [firstName, setFirstName] = useState('Luke');
  const [lastName, setLastName] = useState('Wagner');
  const [shirtSize, setShirtSize] = useState('L');
  const [notif, setNotif] = useState({ newOrder: true, samplesShipped: true, leadTimeChange: true, communityPost: false, replacementApproved: true, commissionPosted: true, orderUpdate: true });
  const notifLabels = { newOrder:'New order placed', orderUpdate:'Order status update', samplesShipped:'Samples shipped', leadTimeChange:'Lead time change', replacementApproved:'Replacement approved', commissionPosted:'Commission posted', communityPost:'New JSI community post' };
  const notifKeys = Object.keys(notif);
  const [leadTimeFavorites, setLeadTimeFavorites] = useState(() => {
    try { const raw = localStorage.getItem('leadTimeFavorites'); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  });
  const [selected, setSelected] = useState(loadHomeApps);
  useEffect(()=>{ if (selected.length === 8) { try { localStorage.setItem('homeApps', JSON.stringify(selected)); } catch {} onUpdateHomeApps && onUpdateHomeApps(selected); } }, [selected, onUpdateHomeApps]);
  useEffect(() => { try { localStorage.setItem('leadTimeFavorites', JSON.stringify(leadTimeFavorites)); } catch {} }, [leadTimeFavorites]);
  const availableApps = useMemo(()=> allApps.filter(a => !selected.includes(a.route) && !a.route.startsWith('settings')).sort((a,b)=>a.name.localeCompare(b.name)), [selected]);
  const leadTimeOptions = useMemo(() => {
    const unique = Array.from(new Set(LEAD_TIMES_DATA.map(item => item.series))).sort();
    return unique.slice(0, 24);
  }, []);
  const addApp = route => setSelected(prev => prev.length < 8 && !prev.includes(route) ? [...prev, route] : prev);
  const removeApp = route => setSelected(prev => prev.filter(r => r !== route));

  // Pointer drag reorder
  const gridRef = useRef(null); const [dragInfo,setDragInfo]=useState(null); const tileSizeRef = useRef({ w:0, h:0, gap:12 });
  useEffect(()=>{ if(gridRef.current){ const first=gridRef.current.querySelector('[data-tile]'); if(first){ const r=first.getBoundingClientRect(); tileSizeRef.current={ w:r.width, h:r.height, gap:12 }; } } },[selected]);
  const pointerDown = idx => e => { if(selected[idx]==null) return; const now={ index:idx,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false,pointerId:e.pointerId }; setDragInfo(now); e.currentTarget.setPointerCapture(e.pointerId); };
  const pointerMove = e => { if(!dragInfo || dragInfo.pointerId!==e.pointerId) return; const dx=Math.abs(e.clientX-dragInfo.startX); const dy=Math.abs(e.clientY-dragInfo.startY); const moved = dragInfo.moved || dx>4 || dy>4; if(!moved){ setDragInfo(di=>({...di,lastX:e.clientX,lastY:e.clientY})); return; } const gridRect=gridRef.current.getBoundingClientRect(); const relX=e.clientX-gridRect.left; const relY=e.clientY-gridRect.top; const {w,h,gap}=tileSizeRef.current; const col=Math.min(1,Math.max(0,Math.floor(relX/(w+gap)))); const row=Math.min(3,Math.max(0,Math.floor(relY/(h+gap)))); const target=row*2+col; if(target!==dragInfo.index && target < selected.length){ setSelected(prev=>{ const next=[...prev]; const [it]=next.splice(dragInfo.index,1); next.splice(target,0,it); return next; }); setDragInfo(di=>({...di,index:target,moved:true,lastX:e.clientX,lastY:e.clientY})); } else if(!dragInfo.moved){ setDragInfo(di=>({...di,moved:true,lastX:e.clientX,lastY:e.clientY})); } else { setDragInfo(di=>({...di,lastX:e.clientX,lastY:e.clientY})); } };
  const pointerUp = idx => () => { if(!dragInfo) return; const wasClick = !dragInfo.moved && dragInfo.index===idx; setDragInfo(null); if(wasClick) removeApp(selected[idx]); };

  const slots = useMemo(()=>{ const arr=[...selected]; while(arr.length<8) arr.push(null); return arr; },[selected]);

  const hoverBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 space-y-5 max-w-xl mx-auto w-full pt-2">

          {/* Account */}
          <GlassCard theme={theme} className="overflow-hidden">
            <SectionHeader icon={User} title="Account" theme={theme} />
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textSecondary }}>First Name</label>
                <input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-offset-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary, focusRingColor: theme.colors.accent }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textSecondary }}>Last Name</label>
                <input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-offset-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textSecondary }}>T-Shirt Size</label>
                <Select value={shirtSize} onChange={setShirtSize} options={['XS','S','M','L','XL','XXL'].map(s=>({value:s,label:s}))} theme={theme} />
              </div>
            </div>
          </GlassCard>

          {/* Push Notifications */}
          <GlassCard theme={theme} className="overflow-hidden">
            <SectionHeader icon={Bell} title="Push Notifications" subtitle="Choose which alerts you want to receive." theme={theme} />
            <div className="p-3">
              {notifKeys.map((k, i) => (
                <div key={k}>
                  <div className="flex items-center justify-between px-3 py-3.5 rounded-2xl transition-colors" style={{}} onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{notifLabels[k]}</span>
                    <Toggle checked={!!notif[k]} onChange={v=>setNotif(p=>({...p,[k]:v}))} theme={theme} />
                  </div>
                  {k === 'leadTimeChange' && notif.leadTimeChange && (
                    <div className="px-3 pb-3 -mt-1">
                      <div className="p-4 rounded-2xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                        <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: theme.colors.textSecondary }}>Favorite lead time series</div>
                        <div className="flex flex-wrap gap-2">
                          {leadTimeOptions.map((series) => {
                            const active = leadTimeFavorites.includes(series);
                            return (
                              <button
                                key={series}
                                type="button"
                                onClick={() => setLeadTimeFavorites(prev => active ? prev.filter(s => s !== series) : [...prev, series])}
                                className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                                style={{
                                  backgroundColor: active ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : theme.colors.subtle),
                                  color: active ? (isDark ? '#1A1A1A' : '#FFFFFF') : theme.colors.textSecondary,
                                  border: `1px solid ${active ? 'transparent' : theme.colors.border}`
                                }}
                              >
                                {series}
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-[10px] mt-3 font-medium" style={{ color: theme.colors.textSecondary }}>
                          {leadTimeFavorites.length} selected
                        </div>
                      </div>
                    </div>
                  )}
                  {i < notifKeys.length - 1 && <div className="mx-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }} />}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Homepage Apps */}
          <GlassCard theme={theme} className="overflow-hidden">
            <SectionHeader icon={Grid} title="Homepage Apps" subtitle="Drag to reorder. Tap to remove. Add from below." theme={theme} />
            <div className="p-5 space-y-5">
              <div ref={gridRef} className="grid grid-cols-2 gap-3 select-none">
                {slots.map((route, idx) => route === null ? (
                  <div key={idx} data-tile className="h-[72px] rounded-2xl flex items-center justify-center text-[11px] font-medium border border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border, color: theme.colors.textSecondary }}>
                    Empty
                  </div>
                ) : (() => {
                  const app = allApps.find(a => a.route === route);
                  if (!app) return null;
                  const dragging = dragInfo && dragInfo.index === idx;
                  return (
                    <div key={route} data-tile className="h-[72px] relative">
                      <button
                        onPointerDown={pointerDown(idx)}
                        onPointerMove={pointerMove}
                        onPointerUp={pointerUp(idx)}
                        onPointerCancel={() => setDragInfo(null)}
                        className={`absolute inset-0 group p-3 rounded-2xl flex flex-col items-start justify-between overflow-hidden transition-all ${dragging ? 'ring-2 ring-offset-1' : ''}`}
                        style={{
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border}`,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
                          touchAction: 'none',
                          transform: dragging ? 'scale(1.04)' : 'scale(1)',
                          zIndex: dragging ? 50 : 1,
                          boxShadow: dragging ? '0 8px 28px rgba(0,0,0,0.2)' : DESIGN_TOKENS.shadows.sm,
                          ringColor: theme.colors.accent
                        }}
                      >
                        <div className="flex items-center w-full justify-between">
                          <app.icon className="w-[18px] h-[18px]" style={{ color: theme.colors.accent }} />
                          <GripVertical className="w-3 h-3 opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: theme.colors.textSecondary }} />
                        </div>
                        <span className="text-[12px] font-semibold tracking-tight text-left leading-tight" style={{ color: theme.colors.textPrimary }}>
                          {cleanLabel(app.name)}
                        </span>
                        <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] font-medium transition-opacity" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: theme.colors.textSecondary }}>
                          Tap to remove
                        </span>
                      </button>
                    </div>
                  );
                })())}
              </div>

              {/* Available Apps */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Available Apps</h3>
                <div className="flex flex-wrap gap-2">
                  {availableApps.map(app => (
                    <button
                      key={app.route}
                      onClick={() => addApp(app.route)}
                      disabled={selected.length >= 8}
                      className={`flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${selected.length >= 8 ? 'opacity-30 cursor-not-allowed' : 'active:scale-[0.97]'} focus:outline-none`}
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : theme.colors.subtle,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border,
                        color: theme.colors.textPrimary
                      }}
                      onMouseEnter={e => { if (selected.length < 8) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : theme.colors.subtle; }}
                    >
                      <app.icon className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                      <span>{cleanLabel(app.name).length > 18 ? cleanLabel(app.name).slice(0,17) + '…' : cleanLabel(app.name)}</span>
                      {selected.length < 8 && <Plus className="w-3 h-3 opacity-40" />}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] flex justify-between px-1 font-medium" style={{ color: theme.colors.textSecondary }}>
                  <span>{selected.length < 8 ? `Select ${8 - selected.length} more` : 'All 8 selected'}</span>
                  <span>Auto-saved</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Appearance */}
          <GlassCard theme={theme} className="overflow-hidden">
            <SectionHeader icon={Palette} title="Appearance" theme={theme} />
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>Dark mode</span>
              <Toggle checked={isDarkMode} onChange={onToggleTheme} theme={theme} />
            </div>
          </GlassCard>

          <div className="pt-1 pb-4 text-center text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>v0.9.3</div>
        </div>
      </div>
    </div>
  );
};
