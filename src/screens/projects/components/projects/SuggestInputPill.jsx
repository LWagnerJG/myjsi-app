import React, { useState, useMemo, useEffect, useRef } from 'react';

export const SuggestInputPill = ({ placeholder, suggestions, onAdd, theme }) => {
  const [q,setQ]=useState(''); const [open,setOpen]=useState(false); const ref=useRef(null); const menu=useRef(null);
  const filtered = useMemo(()=> suggestions.filter(s=> s.toLowerCase().includes(q.toLowerCase()) && s.toLowerCase()!==q.toLowerCase()).slice(0,12),[q,suggestions]);
  useEffect(()=>{ if(!open) return; const close=e=>{ if(ref.current && !ref.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) setOpen(false); }; window.addEventListener('mousedown',close); return ()=>window.removeEventListener('mousedown',close); },[open]);
  const commit = (val)=>{ if(val){ onAdd(val); setQ(''); } setOpen(false); };
  return <div className="relative" ref={ref} style={{ minWidth:140 }}>
    <input value={q} onChange={e=>{ setQ(e.target.value); setOpen(true); }} onFocus={()=>setOpen(true)} onKeyDown={e=>{ if(e.key==='Enter'){ commit(q.trim()); } if(e.key==='Escape'){ setOpen(false);} }} placeholder={placeholder} className="h-8 px-3 rounded-full text-xs font-medium outline-none border w-full" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }} />
    {open && filtered.length>0 && (
      <div ref={menu} className="absolute z-50 mt-1 rounded-xl border shadow-lg overflow-hidden" style={{ background: theme.colors.surface, borderColor: theme.colors.border, maxHeight:220, width:'100%' }}>
        <div className="overflow-y-auto" style={{ maxHeight:220 }}>
          {filtered.map(s=> <button key={s} onClick={()=>commit(s)} className="w-full text-left px-3 py-2 text-xs transition-colors" style={{ color: theme.colors.textPrimary }} onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.subtle} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>{s}</button>)}
        </div>
      </div>
    )}
  </div>;
};
