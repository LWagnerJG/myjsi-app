import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Briefcase, ChevronRight, ChevronDown, DollarSign, Percent, Building2, Users, Package, FileText } from 'lucide-react';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.js';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { PillButton } from '../../components/common/JSIButtons.jsx';
import { JSI_SERIES } from '../products/data.js';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

// Tab options for projects
const PROJECTS_TAB_OPTIONS = [
  { value: 'pipeline', label: 'Active Projects' },
  { value: 'my-projects', label: 'Installations' }
];

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
const SoftLabel = ({ children, theme }) => <span className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: theme.colors.textSecondary }}>{children}</span>;
const InlineTextInput = ({ value, onChange, theme, placeholder, className='' }) => (
  <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={`bg-transparent outline-none border-b border-transparent focus:border-[currentColor] transition-colors ${className}`} style={{ color: theme.colors.textPrimary }} />
);
const CurrencyInput = ({ value, onChange, theme }) => {
  const raw = (''+(value||'')).replace(/[^0-9]/g,'');
  return <input inputMode="numeric" value={raw} onChange={e=>{ const val=e.target.value.replace(/[^0-9]/g,''); onChange(val? ('$'+parseInt(val,10).toLocaleString()):''); }} className="bg-transparent outline-none px-0 py-1 text-sm font-semibold border-b border-transparent focus:border-[currentColor] w-32" style={{ color: theme.colors.textPrimary }} />;
};

// ================= Opportunity Detail (clean UI) =================
const OpportunityDetail = ({ opp, theme, onUpdate }) => {
  const isDark = theme.name === 'dark';
  const [draft,setDraft]=useState(opp); const dirty=useRef(false); const saveRef=useRef(null);
  useEffect(()=>{ setDraft(opp); },[opp]);
  const update=(k,v)=> setDraft(p=>{ const n={...p,[k]:v}; dirty.current= true; return n; });
  useEffect(()=>{ if(!dirty.current) return; clearTimeout(saveRef.current); saveRef.current=setTimeout(()=>{ onUpdate(draft); dirty.current=false; },500); return ()=>clearTimeout(saveRef.current); },[draft,onUpdate]);

  // Discount dropdown
  const [discountOpen,setDiscountOpen]=useState(false); const discBtn=useRef(null); const discMenu=useRef(null); const [discPos,setDiscPos]=useState({top:0,left:0,width:0});
  const openDiscount=()=>{ if(discBtn.current){ const r=discBtn.current.getBoundingClientRect(); setDiscPos({ top:r.bottom+8+window.scrollY, left:r.left+window.scrollX, width: Math.max(r.width, 200) }); } setDiscountOpen(true); };
  useEffect(()=>{ if(!discountOpen) return; const handler=e=>{ if(discMenu.current && !discMenu.current.contains(e.target) && !discBtn.current.contains(e.target)) setDiscountOpen(false); }; window.addEventListener('mousedown',handler); window.addEventListener('resize',()=>setDiscountOpen(false)); return ()=>window.removeEventListener('mousedown',handler); },[discountOpen]);

  // Tag helpers
  const removeFrom=(key,val)=> update(key,(draft[key]||[]).filter(x=>x!==val));
  const addUnique=(key,val)=>{ if(!val) return; const list=draft[key]||[]; if(!list.includes(val)) update(key,[...list,val]); };
  const addProductSeries = (series)=>{ if(!series) return; const list=draft.products||[]; if(!list.some(p=>p.series===series)) update('products',[...list,{series}]); };
  const removeProductSeries = (series)=> update('products',(draft.products||[]).filter(p=>p.series!==series));

  // Shared styles
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';
  const sectionCard = { backgroundColor: cardBg, border: cardBorder, borderRadius: 20, padding: '20px' };
  const fieldBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)';
  const fieldBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';

  const displayValue = fmtCurrency(draft.value);

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
            <input
              value={draft.company||''}
              onChange={e=>update('company',e.target.value)}
              className="w-full bg-transparent outline-none text-[14px] font-medium mt-1"
              style={{ color: theme.colors.accent, opacity: 0.7 }}
              placeholder="Company"
            />
          </div>

          {/* Value & Discount bar */}
          <div style={sectionCard} className="flex items-stretch">
            <div className="flex-1 flex flex-col justify-center py-2 pr-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Project Value</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[13px] font-semibold" style={{ color: theme.colors.textSecondary, opacity: 0.4 }}>$</span>
                <input
                  inputMode="numeric"
                  value={(() => { const raw = (''+(draft.value||'')).replace(/[^0-9]/g,''); return raw ? parseInt(raw,10).toLocaleString() : ''; })()}
                  onChange={e=>{ const val=e.target.value.replace(/[^0-9]/g,''); update('value', val? ('$'+parseInt(val,10).toLocaleString()):''); }}
                  className="bg-transparent outline-none text-[28px] font-bold tracking-tight w-full"
                  style={{ color: theme.colors.textPrimary }}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="w-px self-stretch my-2" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }} />
            <div
              className="flex flex-col justify-center py-2 pl-4 cursor-pointer min-w-[140px]"
              onClick={()=>discountOpen? setDiscountOpen(false):openDiscount()}
              ref={discBtn}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Discount</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[16px] font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{draft.discount || '—'}</span>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary, opacity: 0.4 }} />
              </div>
            </div>
          </div>

          {/* Pipeline Stage slider */}
          <div style={sectionCard}>
            <span className="text-[10px] font-semibold uppercase tracking-widest block mb-5" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Pipeline Stage</span>
            <div className="relative px-2">
              {/* Track background */}
              <div className="absolute top-[7px] left-2 right-2 h-[3px] rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }} />
              {/* Track filled */}
              <div className="absolute top-[7px] left-2 h-[3px] rounded-full transition-all duration-300" style={{ backgroundColor: theme.colors.accent, width: `${(STAGES.indexOf(draft.stage) / Math.max(STAGES.length - 1, 1)) * 100}%` }} />
              {/* Stage nodes */}
              <div className="relative flex justify-between">
                {STAGES.map((s, i) => {
                  const activeIdx = STAGES.indexOf(draft.stage);
                  const reached = i <= activeIdx;
                  const isCurrent = s === draft.stage;
                  return (
                    <button
                      key={s}
                      onClick={() => update('stage', s)}
                      className="flex flex-col items-center group"
                      style={{ width: 0, position: 'relative' }}
                    >
                      <div
                        className="rounded-full transition-all duration-300 flex-shrink-0"
                        style={{
                          width: isCurrent ? 17 : 11,
                          height: isCurrent ? 17 : 11,
                          backgroundColor: reached ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'),
                          border: isCurrent ? `3px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}` : 'none',
                          marginTop: isCurrent ? -1 : 2,
                        }}
                      />
                      <span
                        className="absolute top-6 text-[9px] font-semibold whitespace-nowrap transition-all"
                        style={{
                          color: isCurrent ? theme.colors.textPrimary : theme.colors.textSecondary,
                          opacity: isCurrent ? 1 : 0.5,
                          fontWeight: isCurrent ? 700 : 500,
                        }}
                      >
                        {s}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="h-8" /> {/* spacer for labels */}
          </div>

          {/* Win Probability */}
          <div style={sectionCard}>
            <span className="text-[10px] font-semibold uppercase tracking-widest block mb-1" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Win Probability</span>
            <ProbabilitySlider value={draft.winProbability||0} onChange={v=>update('winProbability',v)} theme={theme} showLabel={false} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Vertical */}
            <div style={sectionCard}>
              <span className="text-[10px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Vertical</span>
              <div className="flex flex-wrap gap-1.5">
                {VERTICALS.map(v => {
                  const active = v === draft.vertical;
                  return (
                    <button key={v} onClick={() => update('vertical', v)} className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all" style={{ backgroundColor: active ? theme.colors.textPrimary : 'transparent', color: active ? (isDark ? '#1a1a1a' : '#fff') : theme.colors.textSecondary, border: active ? 'none' : fieldBorder }}>{v}</button>
                  );
                })}
              </div>
            </div>
            {/* PO Timeframe */}
            <div style={sectionCard}>
              <span className="text-[10px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>PO Timeframe</span>
              <div className="flex flex-wrap gap-1.5">
                {PO_TIMEFRAMES.map(t => {
                  const active = t === draft.poTimeframe;
                  return (
                    <button key={t} onClick={() => update('poTimeframe', t)} className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all" style={{ backgroundColor: active ? theme.colors.textPrimary : 'transparent', color: active ? (isDark ? '#1a1a1a' : '#fff') : theme.colors.textSecondary, border: active ? 'none' : fieldBorder }}>{t}</button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={sectionCard}>
            <span className="text-[10px] font-semibold uppercase tracking-widest block mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Contact</span>
            <input
              value={draft.contact||''}
              onChange={e=>update('contact',e.target.value)}
              className="w-full outline-none text-[15px] font-medium py-2 px-3.5 rounded-xl"
              style={{ color: theme.colors.textPrimary, background: fieldBg, border: fieldBorder }}
              placeholder="Contact name"
            />
          </div>

          {/* Competition */}
          <div style={sectionCard}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Competition</span>
              <ToggleSwitch checked={!!draft.competitionPresent} onChange={v=>update('competitionPresent',v)} theme={theme} />
            </div>
            {draft.competitionPresent && (
              <div className="flex flex-wrap gap-1.5">
                {COMPETITORS.filter(c => c !== 'None').map(c => {
                  const on = (draft.competitors || []).includes(c);
                  return (
                    <button key={c} onClick={() => { const list = draft.competitors || []; update('competitors', on ? list.filter(x => x !== c) : [...list, c]); }} className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all" style={{ backgroundColor: on ? theme.colors.textPrimary : 'transparent', color: on ? (isDark ? '#1a1a1a' : '#fff') : theme.colors.textSecondary, border: on ? 'none' : fieldBorder }}>{c}</button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Products */}
          <div style={sectionCard}>
            <span className="text-[10px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Products</span>
            <div className="flex flex-wrap gap-2">
              {(draft.products||[]).map(p=> (
                <button key={p.series} onClick={()=>removeProductSeries(p.series)} className="px-3 h-8 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}>
                  {p.series}<span className="opacity-40 text-[10px]">×</span>
                </button>
              ))}
              <SuggestInputPill placeholder="Add series" suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
            </div>
          </div>

          {/* Design Firms & Dealers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div style={sectionCard}>
              <span className="text-[10px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Design Firms</span>
              <div className="flex flex-wrap gap-2">
                {(draft.designFirms||[]).map(f=> (
                  <button key={f} onClick={()=>removeFrom('designFirms',f)} className="px-3 h-7 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}>
                    {f}<span className="opacity-40 text-[10px]">×</span>
                  </button>
                ))}
                <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v=>addUnique('designFirms',v)} theme={theme} />
              </div>
            </div>
            <div style={sectionCard}>
              <span className="text-[10px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Dealers</span>
              <div className="flex flex-wrap gap-2">
                {(draft.dealers||[]).map(f=> (
                  <button key={f} onClick={()=>removeFrom('dealers',f)} className="px-3 h-7 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}>
                    {f}<span className="opacity-40 text-[10px]">×</span>
                  </button>
                ))}
                <SuggestInputPill placeholder="Add dealer" suggestions={INITIAL_DEALERS} onAdd={v=>addUnique('dealers',v)} theme={theme} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={sectionCard}>
            <span className="text-[10px] font-semibold uppercase tracking-widest block mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Notes</span>
            <textarea
              value={draft.notes||''}
              onChange={e=>update('notes',e.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl p-3.5 text-[13px] leading-relaxed outline-none"
              style={{ background: fieldBg, border: fieldBorder, color: theme.colors.textPrimary }}
              placeholder="Add project notes..."
            />
            {Array.isArray(draft.quotes)&&draft.quotes.length>0 && (
              <div className="mt-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest block mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>Quotes</span>
                <div className="flex flex-col gap-1.5">
                  {draft.quotes.map(q=> <a key={q.id} href={q.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-xl text-[12px] font-medium transition-colors" style={{ color: theme.colors.textPrimary, background: fieldBg, border: fieldBorder }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{q.fileName}</a>)}
                </div>
              </div>
            )}
          </div>

          {/* Autosaved indicator */}
          <div className="flex justify-center pt-1 pb-4">
            <span className="text-[10px] font-medium tracking-wide" style={{ color: theme.colors.textSecondary, opacity: 0.35 }}>Changes saved automatically</span>
          </div>

        </div>
      </div>
      {discountOpen && (
        <div ref={discMenu} className="fixed rounded-2xl overflow-hidden" style={{ top:discPos.top, left:discPos.left, width:discPos.width, background: isDark ? '#2a2a2a' : '#fff', border: cardBorder, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: DESIGN_TOKENS.zIndex.popover }}>
          <div className="max-h-[360px] overflow-y-auto scrollbar-hide py-1">
            {DISCOUNT_OPTIONS.map(opt=> <button key={opt} onClick={()=>{ update('discount',opt); setDiscountOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[12px] transition-colors ${opt===draft.discount?'font-bold':'font-medium'}`} style={{ color: theme.colors.textPrimary }} onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>{opt}</button>)}
          </div>
        </div>
      )}
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
  const isDark = theme.name === 'dark';
  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
      <div
        className="p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
          borderRadius: 18,
        }}
      >
        <div className="mb-2">
          <p className="font-semibold text-[14px] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{opp.name}</p>
          <p className="mt-0.5 text-[11px] font-medium truncate" style={{ color: theme.colors.accent, opacity: 0.8 }}>{opp.company||'Unknown'}</p>
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
  const isDark = theme.name === 'dark';
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
            <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
              {PROJECTS_TAB_OPTIONS.map(tab => {
                const active = projectsTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setProjectsTab(tab.value)}
                    className="px-4 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                    style={{
                      backgroundColor: active
                        ? (isDark ? 'rgba(255,255,255,0.10)' : '#fff')
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
            {projectsTab==='pipeline' && (
              <button
                onClick={()=>onNavigate('new-lead')}
                className="h-8 inline-flex items-center justify-center gap-1 rounded-full text-[11px] font-semibold transition-all px-3.5 whitespace-nowrap"
                style={{ backgroundColor: theme.colors.textPrimary, color: isDark ? '#1a1a1a' : '#fff' }}
              >
                + New Project
              </button>
            )}
            {projectsTab==='my-projects' && (
              <button
                onClick={()=>onNavigate('add-new-install')}
                className="h-8 inline-flex items-center justify-center gap-1 rounded-full text-[11px] font-semibold transition-all px-3.5 whitespace-nowrap"
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
                      className="text-[11px] font-semibold transition-all px-3 py-1.5 rounded-full"
                      style={{
                        color: active ? (isDark ? '#fff' : '#fff') : theme.colors.textSecondary,
                        backgroundColor: active ? theme.colors.textPrimary : 'transparent',
                        opacity: active ? 1 : 0.7,
                      }}
                    >
                      {showIndex && <span className="opacity-60 mr-0.5">{i+1}</span>} {stage}
                    </button>
                    {i<STAGES.length-1 && <span className="text-[10px] opacity-25 select-none" style={{ color: theme.colors.textSecondary }}>›</span>}
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
                  {filteredOpportunities.map(opp=> <ProjectCard key={opp.id} opp={opp} theme={theme} onClick={()=>setSelectedOpportunity(opp)} />)}
                </div>
                <div className="flex justify-center pt-5 pb-2">
                  <div
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{selectedPipelineStage} Total</span>
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
                {(myProjects||[]).map(p=> (
                  <button key={p.id} onClick={()=>setSelectedInstall(p)} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
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
                          <p className="text-white/80 font-medium text-[11px] mt-0.5">{p.location}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : <div className="flex flex-col items-center justify-center py-12"><Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} /><p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No installations recorded yet</p><p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Add install photos and details to build your portfolio</p></div>
          )}
        </div>
      </div>

    </div>
  );
});
