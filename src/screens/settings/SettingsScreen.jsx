import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { User, Bell, Palette, Grid, Plus, GripVertical } from 'lucide-react';
import { allApps, DEFAULT_HOME_APPS } from '../../data.jsx';

// Safe normalization helper
const cleanLabel = (s='') => Array.from(s).filter(ch => { const c=ch.charCodeAt(0); return c!==0xFFFD && c>=32; }).join('');

const Toggle = ({ checked, onChange, theme }) => (
  <button onClick={() => onChange(!checked)} className="w-12 h-6 rounded-full transition-all duration-200 relative" style={{ backgroundColor: checked ? theme.colors.accent : theme.colors.border }}>
    <div className="w-5 h-5 bg-white rounded-full transition-transform duration-200 absolute top-0.5" style={{ transform: checked ? 'translateX(26px)' : 'translateX(2px)', left: 0 }} />
  </button>
);

// Opaque portal dropdown Select (fixed outside click logic)
const Select = ({ value, onChange, options, theme }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const portalRef = useRef(null);
  const [rect, setRect] = useState(null);

  // Outside click that respects portal content
  useEffect(() => {
    const handleClick = (e) => {
      if (!open) return;
      if (triggerRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return; // click inside menu
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Recompute position when open / resize / scroll
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
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-sm" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
        <span>{current}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" style={{ color: theme.colors.textSecondary }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && rect && createPortal(
        <div ref={portalRef} style={{ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 210000 }}>
          <div className="py-1" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 14, boxShadow: `0 8px 32px ${theme.colors.shadow}`, backdropFilter: 'none' }}>
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 active:scale-[0.99] transition" style={{ color: theme.colors.textPrimary }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>, document.body)
      }
    </div>
  );
};

const loadHomeApps = () => { try { const raw = localStorage.getItem('homeApps'); if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length === 8) return p; } } catch {}; return [...DEFAULT_HOME_APPS]; };

export const SettingsScreen = ({ theme, isDarkMode, onToggleTheme, onUpdateHomeApps }) => {
  const [firstName, setFirstName] = useState('Luke');
  const [lastName, setLastName] = useState('Wagner');
  const [shirtSize, setShirtSize] = useState('L');
  const [notif, setNotif] = useState({ newOrder: true, samplesShipped: true, leadTimeChange: true, communityPost: false, replacementApproved: true, commissionPosted: true, orderUpdate: true });
  const notifLabels = { newOrder:'New order placed', orderUpdate:'Order status update', samplesShipped:'Samples shipped', leadTimeChange:'Lead time change', replacementApproved:'Replacement approved', commissionPosted:'Commission posted', communityPost:'New JSI community post' }; const notifKeys = Object.keys(notif);
  const [selected, setSelected] = useState(loadHomeApps);
  useEffect(()=>{ if (selected.length === 8) { try { localStorage.setItem('homeApps', JSON.stringify(selected)); } catch {}; onUpdateHomeApps && onUpdateHomeApps(selected); } }, [selected, onUpdateHomeApps]);
  const availableApps = useMemo(()=> allApps.filter(a => !selected.includes(a.route) && !a.route.startsWith('settings')).sort((a,b)=>a.name.localeCompare(b.name)), [selected]);
  const addApp = route => setSelected(prev => prev.length < 8 && !prev.includes(route) ? [...prev, route] : prev);
  const removeApp = route => setSelected(prev => prev.filter(r => r !== route));

  // Pointer drag reorder
  const gridRef = useRef(null); const [dragInfo,setDragInfo]=useState(null); const tileSizeRef = useRef({ w:0, h:0, gap:12 });
  useEffect(()=>{ if(gridRef.current){ const first=gridRef.current.querySelector('[data-tile]'); if(first){ const r=first.getBoundingClientRect(); tileSizeRef.current={ w:r.width, h:r.height, gap:12 }; } } },[selected]);
  const pointerDown = idx => e => { if(selected[idx]==null) return; const now={ index:idx,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false,pointerId:e.pointerId }; setDragInfo(now); e.currentTarget.setPointerCapture(e.pointerId); };
  const pointerMove = idx => e => { if(!dragInfo || dragInfo.pointerId!==e.pointerId) return; const dx=Math.abs(e.clientX-dragInfo.startX); const dy=Math.abs(e.clientY-dragInfo.startY); const moved = dragInfo.moved || dx>4 || dy>4; if(!moved){ setDragInfo(di=>({...di,lastX:e.clientX,lastY:e.clientY})); return; } const gridRect=gridRef.current.getBoundingClientRect(); const relX=e.clientX-gridRect.left; const relY=e.clientY-gridRect.top; const {w,h,gap}=tileSizeRef.current; const col=Math.min(1,Math.max(0,Math.floor(relX/(w+gap)))); const row=Math.min(3,Math.max(0,Math.floor(relY/(h+gap)))); const target=row*2+col; if(target!==dragInfo.index && target < selected.length){ setSelected(prev=>{ const next=[...prev]; const [it]=next.splice(dragInfo.index,1); next.splice(target,0,it); return next; }); setDragInfo(di=>({...di,index:target,moved:true,lastX:e.clientX,lastY:e.clientY})); } else if(!dragInfo.moved){ setDragInfo(di=>({...di,moved:true,lastX:e.clientX,lastY:e.clientY})); } else { setDragInfo(di=>({...di,lastX:e.clientX,lastY:e.clientY})); } };
  const pointerUp = idx => () => { if(!dragInfo) return; const wasClick = !dragInfo.moved && dragInfo.index===idx; setDragInfo(null); if(wasClick) removeApp(selected[idx]); };

  const slots = useMemo(()=>{ const arr=[...selected]; while(arr.length<8) arr.push(null); return arr; },[selected]);

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto px-4 pb-16 space-y-6 scrollbar-hide">
        <GlassCard theme={theme} className="p-0">
          <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}><div className="flex items-center gap-2"><User className="w-5 h-5" style={{ color: theme.colors.accent }} /><h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Account</h2></div></div>
          <div className="p-4 grid grid-cols-1 gap-3">
            <div><label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>First Name</label><input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ backgroundColor:theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary }} /></div>
            <div><label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>Last Name</label><input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ backgroundColor:theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary }} /></div>
            <div><label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>T-Shirt Size</label><Select value={shirtSize} onChange={setShirtSize} options={['XS','S','M','L','XL','XXL'].map(s=>({value:s,label:s}))} theme={theme} /></div>
          </div>
        </GlassCard>

        <GlassCard theme={theme} className="p-0">
          <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}><div className="flex items-center gap-2"><Bell className="w-5 h-5" style={{ color: theme.colors.accent }} /><h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Push Notifications</h2></div></div>
          <div className="p-2">{notifKeys.map((k,i)=>(<div key={k} className={`flex items-center justify-between px-2 py-3 ${i<notifKeys.length-1?'border-b':''}`} style={{ borderColor: theme.colors.subtle }}><span className="text-sm" style={{ color: theme.colors.textPrimary }}>{notifLabels[k]}</span><Toggle checked={!!notif[k]} onChange={v=>setNotif(p=>({...p,[k]:v}))} theme={theme} /></div>))}</div>
        </GlassCard>

        <GlassCard theme={theme} className="p-0">
          <div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}><div className="flex items-center gap-2"><Grid className="w-5 h-5" style={{ color: theme.colors.accent }} /><h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Homepage Apps</h2></div><p className="mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>Press & drag the below apps to reorder. Tap the apps to remove. Add more below.</p></div>
          <div className="p-4 space-y-6">
            <div ref={gridRef} className="grid grid-cols-2 gap-3 select-none">
              {slots.map((route, idx)=> route===null ? <div key={idx} data-tile className="h-16 rounded-2xl flex items-center justify-center text-[11px] font-medium border border-dashed" style={{ borderColor:theme.colors.border, color:theme.colors.textSecondary }}>Empty</div> : (()=>{ const app=allApps.find(a=>a.route===route); if(!app) return null; const dragging=dragInfo && dragInfo.index===idx; return (<div key={route} data-tile className="h-16 relative"><button onPointerDown={pointerDown(idx)} onPointerMove={pointerMove(idx)} onPointerUp={pointerUp(idx)} onPointerCancel={()=>setDragInfo(null)} className={`absolute inset-0 group p-2 rounded-2xl flex flex-col items-start justify-between overflow-hidden transition shadow-sm bg-white/80 hover:shadow-md ${dragging?'ring-2 ring-offset-0':''}`} style={{ border:`1px solid ${theme.colors.border}`, backgroundColor:theme.colors.surface, touchAction:'none', transform: dragging? 'scale(1.04)' : 'scale(1)', zIndex: dragging?50:1, boxShadow: dragging? '0 6px 24px rgba(0,0,0,0.18)':'0 4px 12px rgba(0,0,0,0.06)' }}><div className="flex items-center w-full justify-between"><app.icon className="w-[18px] h-[18px]" style={{ color: theme.colors.accent }} /><GripVertical className="w-3 h-3 opacity-40 group-hover:opacity-70" style={{ color: theme.colors.textSecondary }} /></div><span className="text-[12px] font-semibold tracking-tight text-left leading-tight" style={{ color: theme.colors.textPrimary }}>{cleanLabel(app.name)}</span><span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] font-medium" style={{ background:'rgba(0,0,0,0.05)', color: theme.colors.textSecondary }}>Tap to remove</span></button></div>); })())}
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>Available Apps</h3>
              <div className="flex flex-wrap gap-2">{availableApps.map(app => (<button key={app.route} onClick={()=>addApp(app.route)} disabled={selected.length>=8} className={`flex items-center gap-1 pl-2 pr-3 py-1.5 rounded-full text-[11px] font-medium border transition ${selected.length>=8?'opacity-40 cursor-not-allowed':'hover:bg-white hover:shadow-sm active:scale-[0.97]'} focus:outline-none`} style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}><app.icon className="w-3 h-3" style={{ color: theme.colors.textSecondary }} /><span>{cleanLabel(app.name).length>18?cleanLabel(app.name).slice(0,17)+'�':cleanLabel(app.name)}</span>{selected.length<8 && <Plus className="w-3 h-3" />}</button>))}</div>
              <div className="text-[11px] flex justify-between px-1" style={{ color: theme.colors.textSecondary }}><span>{selected.length<8 ? `Select ${8-selected.length} more` : 'All 8 selected'}</span><span>Auto-saved</span></div>
            </div>
          </div>
        </GlassCard>

        <GlassCard theme={theme} className="p-0"><div className="p-4 border-b" style={{ borderColor: theme.colors.subtle }}><div className="flex items-center gap-2"><Palette className="w-5 h-5" style={{ color: theme.colors.accent }} /><h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>Appearance</h2></div></div><div className="p-4 flex items-center justify-between"><span className="text-sm" style={{ color: theme.colors.textPrimary }}>Dark mode</span><Toggle checked={isDarkMode} onChange={onToggleTheme} theme={theme} /></div></GlassCard>

        <div className="pt-2 text-center text-[10px]" style={{ color: theme.colors.textSecondary }}>v0.9.3</div>
      </div>
    </div>
  );
};
