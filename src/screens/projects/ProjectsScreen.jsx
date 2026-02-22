import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Briefcase, ChevronRight, ChevronDown, DollarSign, Percent, Building2, Users, Package, FileText, Upload, Plus, Eye, Send, Paperclip, Search, UserPlus } from 'lucide-react';
import { RequestQuoteModal } from '../../components/common/RequestQuoteModal.jsx';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.js';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { PillButton } from '../../components/common/JSIButtons.jsx';
import { JSI_SERIES } from '../products/data.js';
import { DESIGN_TOKENS, isDarkTheme } from '../../design-system/tokens.js';

// Tab options for projects
const PROJECTS_TAB_OPTIONS = [
  { value: 'pipeline', label: 'Active Projects' },
  { value: 'my-projects', label: 'Installations' }
];

// Dealer → Contact mapping (mock data)
const DEALER_CONTACTS = {
  'Business Furniture': [
    { name: 'Mike Johnson', title: 'Account Manager' },
    { name: 'Sarah Palmer', title: 'Design Consultant' },
    { name: 'Tom Bradley', title: 'Regional Director' },
  ],
  'COE': [
    { name: 'Emily Raine', title: 'Project Manager' },
    { name: 'David Chen', title: 'Sales Representative' },
    { name: 'Lisa Park', title: 'Account Executive' },
    { name: 'Tom Hardy', title: 'Operations Manager' },
  ],
  'OfficeWorks': [
    { name: 'Alan Cooper', title: 'Senior Designer' },
    { name: 'Rachel Green', title: 'Account Manager' },
    { name: 'Mark Wilson', title: 'Sales Lead' },
  ],
  'RJE': [
    { name: 'Sara Lin', title: 'Regional Manager' },
    { name: 'Priya Patel', title: 'Design Specialist' },
    { name: 'James Foster', title: 'Account Executive' },
  ],
};

// currency util
const fmtCurrency = (v) => typeof v === 'string' ? (v.startsWith('$')? v : '$'+v) : (v ?? 0).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});

// Suggest input pill (inline tag adder w/ suggestions)
const SuggestInputPill = ({ placeholder, suggestions, onAdd, theme }) => {
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

// Helper label / inputs (restored)
const SoftLabel = ({ children, theme }) => <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: theme.colors.textSecondary }}>{children}</span>;

// Contact search selector — pulls contacts from associated dealers
const ContactSearchSelector = ({ value, onChange, dealers, theme }) => {
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
const InlineTextInput = ({ value, onChange, theme, placeholder, className='' }) => (
  <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={`bg-transparent outline-none border-b border-transparent focus:border-[currentColor] transition-colors ${className}`} style={{ color: theme.colors.textPrimary }} />
);
const CurrencyInput = ({ value, onChange, theme }) => {
  const raw = (''+(value||'')).replace(/[^0-9]/g,'');
  return <input inputMode="numeric" value={raw} onChange={e=>{ const val=e.target.value.replace(/[^0-9]/g,''); onChange(val? ('$'+parseInt(val,10).toLocaleString()):''); }} className="bg-transparent outline-none px-0 py-1 text-sm font-semibold border-b border-transparent focus:border-[currentColor] w-32" style={{ color: theme.colors.textPrimary }} />;
};

// ================= Opportunity Detail (clean UI) =================
const OpportunityDetail = ({ opp, theme, onUpdate }) => {
  const isDark = isDarkTheme(theme);
  const [draft,setDraft]=useState(opp); const dirty=useRef(false); const saveRef=useRef(null);
  useEffect(()=>{ setDraft(opp); },[opp]);
  const update=(k,v)=> setDraft(p=>{ const n={...p,[k]:v}; dirty.current= true; return n; });
  useEffect(()=>{ if(!dirty.current) return; clearTimeout(saveRef.current); saveRef.current=setTimeout(()=>{ onUpdate(draft); dirty.current=false; },500); return ()=>clearTimeout(saveRef.current); },[draft,onUpdate]);

  // Discount dropdown
  const [discountOpen,setDiscountOpen]=useState(false); const discBtn=useRef(null); const discMenu=useRef(null); const [discPos,setDiscPos]=useState({top:0,left:0,width:0});
  const openDiscount=()=>{ if(discBtn.current){ const r=discBtn.current.getBoundingClientRect(); setDiscPos({ top:r.bottom+8+window.scrollY, left:r.left+window.scrollX, width: Math.max(r.width, 200) }); } setDiscountOpen(true); };
  useEffect(()=>{ if(!discountOpen) return; const handler=e=>{ if(discMenu.current && !discMenu.current.contains(e.target) && !discBtn.current.contains(e.target)) setDiscountOpen(false); }; window.addEventListener('mousedown',handler); window.addEventListener('resize',()=>setDiscountOpen(false)); return ()=>window.removeEventListener('mousedown',handler); },[discountOpen]);

  // Draggable pipeline stage
  const stageTrackRef = useRef(null);
  const [stageDragging,setStageDragging] = useState(false);
  const stageFromX = useCallback((clientX) => {
    if (!stageTrackRef.current) return;
    const rect = stageTrackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (STAGES.length - 1));
    update('stage', STAGES[idx]);
  }, []);
  const onStagePointerDown = useCallback((clientX) => { setStageDragging(true); stageFromX(clientX); }, [stageFromX]);
  useEffect(() => {
    if (!stageDragging) return;
    const onMove = (e) => stageFromX(e.clientX || (e.touches && e.touches[0].clientX));
    const onUp = () => setStageDragging(false);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
  }, [stageDragging, stageFromX]);

  // Tag helpers
  const removeFrom=(key,val)=> update(key,(draft[key]||[]).filter(x=>x!==val));
  const addUnique=(key,val)=>{ if(!val) return; const list=draft[key]||[]; if(!list.includes(val)) update(key,[...list,val]); };
  const addProductSeries = (series)=>{ if(!series) return; const list=draft.products||[]; if(!list.some(p=>p.series===series)) update('products',[...list,{series}]); };
  const removeProductSeries = (series)=> update('products',(draft.products||[]).filter(p=>p.series!==series));

  // File upload ref
  const fileInputRef = useRef(null);

  // Shared styles
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';
  const sectionCard = { backgroundColor: cardBg, border: cardBorder, borderRadius: 20, padding: '20px' };
  const fieldBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)';
  const fieldBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';

  const stageIdx = STAGES.indexOf(draft.stage);
  const stagePct = (stageIdx / Math.max(STAGES.length - 1, 1)) * 100;

  // Net value computation
  const rawNumeric = parseInt(('' + (draft.value || '')).replace(/[^0-9]/g, ''), 10) || 0;
  const discountMatch = (draft.discount || '').match(/\(([\d.]+)%\)/);
  const discountPct = discountMatch ? parseFloat(discountMatch[1]) / 100 : 0;
  const netValue = discountPct > 0 ? Math.round(rawNumeric * (1 - discountPct)) : rawNumeric;

  // Quote modal
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ background: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-32 max-w-3xl mx-auto w-full space-y-4">

          {/* Hero header */}
          <div className="pt-2 pb-1">
            <input
              value={draft.project||draft.name||''}
              onChange={e=>update('project',e.target.value)}
              className="w-full bg-transparent outline-none text-[26px] font-bold tracking-tight leading-tight"
              style={{ color: theme.colors.textPrimary }}
              placeholder="Project name"
            />
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.accent, opacity: 0.6 }} />
              <input
                value={draft.company||''}
                onChange={e=>update('company',e.target.value)}
                className="bg-transparent outline-none text-[13px] font-semibold flex-1"
                style={{ color: theme.colors.accent, opacity: 0.7 }}
                placeholder="Company"
              />
            </div>
          </div>

          {/* Value · Discount · Net bar */}
          <div style={sectionCard}>
            {/* Top row: List Value input */}
            <div className="pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>List Value</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-bold tracking-tight leading-none" style={{ color: theme.colors.textSecondary, opacity: 0.3 }}>$</span>
                <input
                  inputMode="numeric"
                  value={(() => { const raw = (''+(draft.value||'')).replace(/[^0-9]/g,''); return raw ? parseInt(raw,10).toLocaleString() : ''; })()}
                  onChange={e=>{ const val=e.target.value.replace(/[^0-9]/g,''); update('value', val? ('$'+parseInt(val,10).toLocaleString()):''); }}
                  className="bg-transparent outline-none text-[28px] font-bold tracking-tight w-full leading-none"
                  style={{ color: theme.colors.textPrimary }}
                  placeholder="0"
                />
              </div>
            </div>
            {/* Divider */}
            <div className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
            {/* Bottom row: Discount + Net side by side */}
            <div className="flex items-stretch pt-3 gap-0">
              <div
                className="flex-1 flex flex-col justify-center cursor-pointer min-w-0"
                onClick={()=>discountOpen? setDiscountOpen(false):openDiscount()}
                ref={discBtn}
              >
                <span className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Discount</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight truncate" style={{ color: theme.colors.textPrimary }}>{draft.discount || '—'}</span>
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
                </div>
              </div>
              <div className="w-px self-stretch mx-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
              <div className="flex flex-col justify-center">
                <span className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Net Value</span>
                <span className="text-lg font-bold tracking-tight leading-none whitespace-nowrap" style={{ color: theme.colors.accent }}>
                  {netValue > 0 && discountPct > 0 ? `$${netValue.toLocaleString()}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Stage — draggable slider */}
          <div style={sectionCard}>
            <span className="text-[11px] font-semibold uppercase tracking-widest block mb-5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Pipeline Stage</span>
            <div
              className="relative px-5 select-none"
              ref={stageTrackRef}
              style={{ cursor: stageDragging ? 'grabbing' : 'pointer', touchAction: 'none' }}
              onMouseDown={e => onStagePointerDown(e.clientX)}
              onTouchStart={e => onStagePointerDown(e.touches[0].clientX)}
            >
              {/* Track background */}
              <div className="absolute top-[7px] left-5 right-5 h-[3px] rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }} />
              {/* Track filled */}
              <div className="absolute top-[7px] left-5 h-[3px] rounded-full transition-all" style={{ backgroundColor: theme.colors.accent, width: `calc(${stagePct / 100} * (100% - 40px))`, transitionDuration: stageDragging ? '0ms' : '300ms' }} />
              {/* Stage nodes */}
              <div className="relative flex justify-between">
                {STAGES.map((s, i) => {
                  const reached = i <= stageIdx;
                  const isCurrent = s === draft.stage;
                  return (
                    <div key={s} className="flex flex-col items-center" style={{ width: 0, position: 'relative' }}>
                      <div
                        className="rounded-full flex-shrink-0 transition-all"
                        style={{
                          width: isCurrent ? 17 : 11,
                          height: isCurrent ? 17 : 11,
                          backgroundColor: reached ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'),
                          border: isCurrent ? `3px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}` : 'none',
                          marginTop: isCurrent ? -1 : 2,
                          transitionDuration: stageDragging ? '0ms' : '300ms',
                        }}
                      />
                      <span
                        className="absolute top-6 text-[10px] font-semibold whitespace-nowrap transition-all pointer-events-none"
                        style={{
                          color: isCurrent ? theme.colors.textPrimary : theme.colors.textSecondary,
                          opacity: isCurrent ? 1 : 0.45,
                          fontWeight: isCurrent ? 700 : 500,
                          left: '50%',
                          transform: i === 0 ? 'translateX(-10%)' : i === STAGES.length - 1 ? 'translateX(-90%)' : 'translateX(-50%)',
                        }}
                      >
                        {s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-8" />

            {/* Win Probability inline */}
            <div className="pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
              <span className="text-[11px] font-semibold uppercase tracking-widest block mb-1" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Win Probability</span>
              <ProbabilitySlider value={draft.winProbability||0} onChange={v=>update('winProbability',v)} theme={theme} showLabel={false} />
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Vertical */}
            <div style={sectionCard}>
              <span className="text-[11px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Vertical</span>
              <div className="flex flex-wrap gap-1.5">
                {VERTICALS.map(v => {
                  const active = v === draft.vertical;
                  return (
                    <button key={v} onClick={() => update('vertical', v)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all" style={{ backgroundColor: active ? theme.colors.textPrimary : 'transparent', color: active ? (isDark ? '#1a1a1a' : '#fff') : theme.colors.textSecondary, border: active ? 'none' : fieldBorder }}>{v}</button>
                  );
                })}
              </div>
            </div>
            {/* PO Timeframe */}
            <div style={sectionCard}>
              <span className="text-[11px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>PO Timeframe</span>
              <div className="flex flex-wrap gap-1.5">
                {PO_TIMEFRAMES.map(t => {
                  const active = t === draft.poTimeframe;
                  return (
                    <button key={t} onClick={() => update('poTimeframe', t)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all" style={{ backgroundColor: active ? theme.colors.textPrimary : 'transparent', color: active ? (isDark ? '#1a1a1a' : '#fff') : theme.colors.textSecondary, border: active ? 'none' : fieldBorder }}>{t}</button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact — searchable from dealer's contacts */}
          <div style={sectionCard}>
            <span className="text-[11px] font-semibold uppercase tracking-widest block mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Contact</span>
            <ContactSearchSelector
              value={draft.contact || ''}
              onChange={v => update('contact', v)}
              dealers={draft.dealers || []}
              theme={theme}
            />
          </div>

          {/* Competition + Products — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Competition */}
            <div style={sectionCard}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Competition</span>
                <button
                  onClick={() => update('competitionPresent', !draft.competitionPresent)}
                  className="relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0"
                  style={{ backgroundColor: draft.competitionPresent ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)') }}
                >
                  <span className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${draft.competitionPresent ? 'translate-x-[18px]' : ''}`} />
                </button>
              </div>
              {draft.competitionPresent && (
                <div className="flex flex-wrap gap-1.5">
                  {COMPETITORS.filter(c => c !== 'None').map(c => {
                    const on = (draft.competitors || []).includes(c);
                    return (
                      <button key={c} onClick={() => { const list = draft.competitors || []; update('competitors', on ? list.filter(x => x !== c) : [...list, c]); }} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all" style={{ backgroundColor: on ? theme.colors.textPrimary : 'transparent', color: on ? (isDark ? '#1a1a1a' : '#fff') : theme.colors.textSecondary, border: on ? 'none' : fieldBorder }}>{c}</button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Products */}
            <div style={sectionCard}>
              <span className="text-[11px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Products</span>
              <div className="flex flex-wrap gap-2">
                {(draft.products||[]).map(p=> (
                  <button key={p.series} onClick={()=>removeProductSeries(p.series)} className="px-3 h-8 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}>
                    {p.series}<span className="opacity-40 text-[11px]">×</span>
                  </button>
                ))}
                <SuggestInputPill placeholder="Add series" suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
              </div>
            </div>
          </div>

          {/* Design Firms & Dealers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div style={sectionCard}>
              <span className="text-[11px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Design Firms</span>
              <div className="flex flex-wrap gap-2">
                {(draft.designFirms||[]).map(f=> (
                  <button key={f} onClick={()=>removeFrom('designFirms',f)} className="px-3 h-7 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}>
                    {f}<span className="opacity-40 text-[11px]">×</span>
                  </button>
                ))}
                <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v=>addUnique('designFirms',v)} theme={theme} />
              </div>
            </div>
            <div style={sectionCard}>
              <span className="text-[11px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Dealers</span>
              <div className="flex flex-wrap gap-2">
                {(draft.dealers||[]).map(f=> (
                  <button key={f} onClick={()=>removeFrom('dealers',f)} className="px-3 h-7 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}>
                    {f}<span className="opacity-40 text-[11px]">×</span>
                  </button>
                ))}
                <SuggestInputPill placeholder="Add dealer" suggestions={INITIAL_DEALERS} onAdd={v=>addUnique('dealers',v)} theme={theme} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={sectionCard}>
            <span className="text-[11px] font-semibold uppercase tracking-widest block mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Notes</span>
            <textarea
              value={draft.notes||''}
              onChange={e=>update('notes',e.target.value)}
              rows={3}
              className="w-full resize-none rounded-2xl p-3.5 text-[13px] leading-relaxed outline-none"
              style={{ background: fieldBg, border: fieldBorder, color: theme.colors.textPrimary }}
              placeholder="Add project notes..."
            />
          </div>

          {/* Documents & Quotes */}
          <div style={sectionCard}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Documents & Quotes</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}
              >
                <Upload size={12} /> Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  const newDocs = files.map(f => ({ id: Date.now() + '_' + f.name, fileName: f.name, type: f.type.includes('pdf') ? 'PDF' : f.type.includes('image') ? 'Image' : 'Document', size: f.size < 1024*1024 ? `${Math.round(f.size/1024)}KB` : `${(f.size/(1024*1024)).toFixed(1)}MB`, date: new Date().toLocaleDateString() }));
                  update('documents', [...(draft.documents || []), ...newDocs]);
                  e.target.value = '';
                }}
              />
            </div>

            {(draft.documents || []).length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {(draft.documents || []).map(doc => (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                    style={{ background: fieldBg, border: fieldBorder }}
                  >
                    <FileText size={16} style={{ color: theme.colors.accent, flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{doc.fileName}</div>
                      <div className="text-[11px]" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{doc.type} · {doc.size} · {doc.date}</div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-full transition-colors" style={{ color: theme.colors.textSecondary }} title="Preview"><Eye size={14} /></button>
                      <button onClick={() => update('documents', (draft.documents || []).filter(d => d.id !== doc.id))} className="p-1 rounded-full transition-colors" style={{ color: theme.colors.textSecondary }} title="Remove">
                        <span className="text-[13px] leading-none">×</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2.5 py-8 rounded-2xl transition-all hover:opacity-80"
                style={{ border: `2px dashed ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, color: theme.colors.textSecondary }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                  <Paperclip size={18} style={{ opacity: 0.5 }} />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold block">Drop files or click to upload</span>
                  <span className="text-[11px] block mt-0.5" style={{ opacity: 0.5 }}>PDF, DOC, images & more</span>
                </div>
              </button>
            )}

            {/* Request a Quote CTA */}
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold transition-all active:scale-[0.98] hover:opacity-90"
              style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
            >
              <Send size={14} /> Request a Quote
            </button>
          </div>

          {/* Autosaved indicator */}
          <div className="flex justify-center pt-2 pb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4A7C59', opacity: 0.5 }} />
              <span className="text-[11px] font-medium tracking-wide" style={{ color: theme.colors.textSecondary, opacity: 0.35 }}>Changes saved automatically</span>
            </div>
          </div>

        </div>
      </div>
      {discountOpen && (
        <div ref={discMenu} className="fixed rounded-2xl overflow-hidden" style={{ top:discPos.top, left:discPos.left, width:discPos.width, background: isDark ? '#2a2a2a' : '#fff', border: cardBorder, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: DESIGN_TOKENS.zIndex.popover }}>
          <div className="max-h-[360px] overflow-y-auto scrollbar-hide py-1">
            {DISCOUNT_OPTIONS.map(opt=> <button key={opt} onClick={()=>{ update('discount',opt); setDiscountOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${opt===draft.discount?'font-bold':'font-medium'}`} style={{ color: theme.colors.textPrimary }} onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>{opt}</button>)}
          </div>
        </div>
      )}
      <RequestQuoteModal
        show={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        theme={theme}
        onSubmit={(data) => {
          const newDoc = { id: Date.now() + '_quote_request', fileName: `Quote Request - ${data.projectName || draft.project || 'Untitled'}.pdf`, type: 'Quote Request', size: '—', date: new Date().toLocaleDateString() };
          update('documents', [...(draft.documents || []), newDoc]);
          setQuoteModalOpen(false);
        }}
        initialData={{
          projectName: draft.project || draft.name || '',
          dealerName: (draft.dealers || [])[0] || '',
          adFirm: (draft.designFirms || [])[0] || '',
        }}
      />
    </div>
  );
};

// Project card component
const ProjectCard = ({ opp, theme, onClick }) => {
  let displayValue = opp.value;
  if (displayValue != null) {
    if (typeof displayValue === 'number') displayValue = '$' + displayValue.toLocaleString();
    else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g,'')); if(!isNaN(num)) displayValue = '$'+num.toLocaleString();
    }
  }
  const isDark = isDarkTheme(theme);
  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
      <div
        className="p-4 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        style={{
          backgroundColor: isDark ? theme.colors.surface : 'rgba(255,255,255,0.85)',
          border: isDark ? `1px solid ${theme.colors.border}` : '1px solid rgba(0,0,0,0.06)',
          borderRadius: 18,
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div className="mb-2">
          <p className="font-semibold text-sm leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{opp.name}</p>
          <p className="mt-0.5 text-xs font-medium truncate" style={{ color: theme.colors.accent, opacity: 0.8 }}>{opp.company||'Unknown'}</p>
        </div>
        <div className="flex items-end justify-end">
          <p className="font-bold text-[20px] tracking-tight" style={{ color: theme.colors.textPrimary }}>{displayValue}</p>
        </div>
      </div>
    </button>
  );
};

// InstallationDetail (restored minimal)
const InstallationDetail = ({ project, theme, onAddPhotoFiles }) => {
  const fileRef = useRef(null);
  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-32 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto w-full space-y-4">
        <GlassCard theme={theme} className="p-5 space-y-4" variant="elevated">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-xl truncate" style={{ color: theme.colors.textPrimary }}>{project.name}</p>
              <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>{project.location}</p>
            </div>
            <button type="button" onClick={()=>fileRef.current?.click()} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>Add Photos</button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e=>onAddPhotoFiles(e.target.files)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(project.photos || [project.image]).map((img,i)=>(
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg"><img src={typeof img==='string'?img:URL.createObjectURL(img)} alt={project.name+'-photo-'+i} className="w-full h-full object-cover" /></div>
            ))}
          </div>
        </GlassCard>
        </div>
      </div>
    </div>
  );
};

// Exported main ProjectsScreen (restored)
export const ProjectsScreen = forwardRef(({ onNavigate, theme, opportunities, setOpportunities, myProjects, setMyProjects, projectsInitialTab, clearProjectsInitialTab }, ref) => {
  const isDark = isDarkTheme(theme);
  const initial = projectsInitialTab || 'pipeline';
  const [projectsTab, setProjectsTab] = useState(initial);
  useEffect(()=>{ if(projectsInitialTab) clearProjectsInitialTab && clearProjectsInitialTab(); },[projectsInitialTab, clearProjectsInitialTab]);
  const [selectedPipelineStage,setSelectedPipelineStage] = useState('Discovery');
  const [selectedOpportunity,setSelectedOpportunity] = useState(null);
  const [selectedInstall,setSelectedInstall] = useState(null);
  const scrollContainerRef = useRef(null);
  const stagesScrollRef = useRef(null);
  const [showStageFadeLeft,setShowStageFadeLeft]=useState(false);
  const [showStageFadeRight,setShowStageFadeRight]=useState(false);
  useImperativeHandle(ref,()=>({ clearSelection:()=>{ let cleared=false; if(selectedOpportunity){ setSelectedOpportunity(null); cleared=true;} if(selectedInstall){ setSelectedInstall(null); cleared=true;} return cleared; } }));
  const updateStageFade = useCallback(()=>{ const el=stagesScrollRef.current; if(!el) return; const {scrollLeft,scrollWidth,clientWidth}=el; setShowStageFadeLeft(scrollLeft>4); setShowStageFadeRight(scrollLeft+clientWidth<scrollWidth-4); },[]);
  useEffect(()=>{ updateStageFade(); const onResize=()=>updateStageFade(); window.addEventListener('resize',onResize); const ro=typeof ResizeObserver!=='undefined'&&stagesScrollRef.current? new ResizeObserver(onResize):null; if(ro&&stagesScrollRef.current) ro.observe(stagesScrollRef.current); return ()=>{ window.removeEventListener('resize',onResize); if(ro) ro.disconnect(); }; },[projectsTab, updateStageFade]);
  const filteredOpportunities = useMemo(()=> (opportunities||[]).filter(o=>o.stage===selectedPipelineStage),[selectedPipelineStage, opportunities]);
  const stageTotals = useMemo(()=>{ const totalValue = filteredOpportunities.reduce((sum,o)=>{ const raw= typeof o.value==='string'? o.value.replace(/[^0-9.]/g,''): o.value; const num=parseFloat(raw)||0; return sum+num; },0); return { totalValue }; },[filteredOpportunities]);
  const updateOpportunity = updated => setOpportunities(prev=> prev.map(o=> o.id===updated.id? updated:o));
  const addInstallPhotos = files => { if(!files||!selectedInstall) return; const arr=Array.from(files); setMyProjects(prev=> prev.map(p=> p.id===selectedInstall.id? {...p, photos:[...(p.photos||[]), ...arr]}:p)); setSelectedInstall(prev=> prev? {...prev, photos:[...(prev.photos||[]), ...arr]}: prev); };
  if(selectedOpportunity) return <OpportunityDetail opp={selectedOpportunity} theme={theme} onUpdate={u=>{ updateOpportunity(u); setSelectedOpportunity(u); }} />;
  if(selectedInstall) return <InstallationDetail project={selectedInstall} theme={theme} onAddPhotoFiles={addInstallPhotos} />;
  return (
    <div className="h-full flex flex-col app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      {/* Controls - fixed below app header */}
      <div className="flex-shrink-0" style={{ backgroundColor: theme.colors.background }}>
        <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-2 max-w-5xl mx-auto w-full">
          {/* Tab row: two tab pills + action button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)' }}>
              {PROJECTS_TAB_OPTIONS.map(tab => {
                const active = projectsTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setProjectsTab(tab.value)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: active
                        ? (isDark ? 'rgba(255,255,255,0.14)' : '#fff')
                        : 'transparent',
                      color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {projectsTab==='my-projects' && (
              <button
                onClick={()=>onNavigate('add-new-install')}
                className="h-8 inline-flex items-center justify-center gap-1 rounded-full text-xs font-semibold transition-all px-3.5 whitespace-nowrap"
                style={{ backgroundColor: theme.colors.textPrimary, color: isDark ? '#1a1a1a' : '#fff' }}
              >
                + New Install
              </button>
            )}
          </div>
        </div>
        {projectsTab==='pipeline' && (
          <div className="px-4 sm:px-6 lg:px-8 pb-2 relative max-w-5xl mx-auto w-full">
            <div ref={stagesScrollRef} onScroll={updateStageFade} className="overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1.5 py-1 whitespace-nowrap">
                {STAGES.map((stage,i)=>{ const active= selectedPipelineStage===stage; const showIndex= stage!=='Won' && stage!=='Lost'; return (
                  <React.Fragment key={stage}>
                    <button
                      onClick={()=>setSelectedPipelineStage(stage)}
                      className="text-xs font-semibold transition-all px-3 py-1.5 rounded-full"
                      style={{
                      color: active ? theme.colors.accentText : theme.colors.textSecondary,
                        backgroundColor: active ? theme.colors.textPrimary : 'transparent',
                        opacity: active ? 1 : 0.7,
                      }}
                    >
                      {showIndex && <span className="opacity-60 mr-0.5">{i+1}</span>} {stage}
                    </button>
                    {i<STAGES.length-1 && <span className="text-[11px] opacity-25 select-none" style={{ color: theme.colors.textSecondary }}>›</span>}
                  </React.Fragment>
                ); })}
              </div>
            </div>
            {showStageFadeLeft && <div className="pointer-events-none absolute inset-y-0 left-0 w-8" style={{ background:`linear-gradient(to right, ${theme.colors.background}, ${theme.colors.background}00)` }} />}
            {showStageFadeRight && <div className="pointer-events-none absolute inset-y-0 right-0 w-10 flex items-center justify-end pr-1" style={{ background:`linear-gradient(to left, ${theme.colors.background}, ${theme.colors.background}00)` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                <ChevronRight className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
              </div>
            </div>}
          </div>
        )}
      </div>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-40 max-w-5xl mx-auto w-full">
          {projectsTab==='pipeline' && (
            filteredOpportunities.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredOpportunities.map((opp, i)=> <div key={opp.id}><ProjectCard opp={opp} theme={theme} onClick={()=>setSelectedOpportunity(opp)} /></div>)}
                </div>
                <div className="flex justify-center pt-5 pb-2">
                  <div
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full"
                    style={{
                      backgroundColor: isDark ? theme.colors.surface : 'rgba(0,0,0,0.03)',
                      border: isDark ? `1px solid ${theme.colors.border}` : '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{selectedPipelineStage} Total</span>
                    <span className="text-[15px] font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{fmtCurrency(stageTotals.totalValue)}</span>
                  </div>
                </div>
              </>
            ) :
            <div className="flex flex-col items-center justify-center py-12"><Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} /><p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No projects in {selectedPipelineStage}</p><p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Add a new project to get started</p></div>
          )}
          {projectsTab==='my-projects' && (
            (myProjects||[]).length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(myProjects||[]).map((p, i)=> (
                  <div key={p.id}>
                  <button onClick={()=>setSelectedInstall(p)} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
                    <div
                      className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                      style={{
                        borderRadius: 18,
                        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      <div className="relative aspect-[4/3] w-full">
                        <img src={p.image} alt={p.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-3.5">
                          <h3 className="text-[15px] font-bold text-white tracking-tight leading-snug">{p.name}</h3>
                          <p className="text-white/80 font-medium text-xs mt-0.5">{p.location}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                  </div>
                ))}
              </div>
            ) : <div className="flex flex-col items-center justify-center py-12"><Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} /><p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No installations recorded yet</p><p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Add install photos and details to build your portfolio</p></div>
          )}
        </div>
      </div>

    </div>
  );
});
