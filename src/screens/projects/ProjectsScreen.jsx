import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, Briefcase, DollarSign, LineChart, Percent, ArrowRight, X } from 'lucide-react';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.js';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { JSI_SERIES } from '../products/data.js';

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
          {filtered.map(s=> <button key={s} onClick={()=>commit(s)} className="w-full text-left px-3 py-2 text-xs hover:bg-black/5" style={{ color: theme.colors.textPrimary }}>{s}</button>)}
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
const OpportunityDetail = ({ opp, theme, onBack, onUpdate }) => {
  const [draft,setDraft]=useState(opp); const dirty=useRef(false); const saveRef=useRef(null);
  useEffect(()=>{ setDraft(opp); },[opp.id]);
  const update=(k,v)=> setDraft(p=>{ const n={...p,[k]:v}; dirty.current= true; return n; });
  useEffect(()=>{ if(!dirty.current) return; clearTimeout(saveRef.current); saveRef.current=setTimeout(()=>{ onUpdate(draft); dirty.current=false; },500); return ()=>clearTimeout(saveRef.current); },[draft,onUpdate]);

  // Discount dropdown
  const [discountOpen,setDiscountOpen]=useState(false); const discBtn=useRef(null); const discMenu=useRef(null); const [discPos,setDiscPos]=useState({top:0,left:0,width:0});
  const openDiscount=()=>{ if(discBtn.current){ const r=discBtn.current.getBoundingClientRect(); setDiscPos({ top:r.bottom+8+window.scrollY, left:r.left+window.scrollX, width:r.width }); } setDiscountOpen(true); };
  useEffect(()=>{ if(!discountOpen) return; const handler=e=>{ if(discMenu.current && !discMenu.current.contains(e.target) && !discBtn.current.contains(e.target)) setDiscountOpen(false); }; window.addEventListener('mousedown',handler); window.addEventListener('resize',()=>setDiscountOpen(false)); return ()=>window.removeEventListener('mousedown',handler); },[discountOpen]);

  // Tag helpers
  const removeFrom=(key,val)=> update(key,(draft[key]||[]).filter(x=>x!==val));
  const addUnique=(key,val)=>{ if(!val) return; const list=draft[key]||[]; if(!list.includes(val)) update(key,[...list,val]); };
  const addProductSeries = (series)=>{ if(!series) return; const list=draft.products||[]; if(!list.some(p=>p.series===series)) update('products',[...list,{series}]); };
  const removeProductSeries = (series)=> update('products',(draft.products||[]).filter(p=>p.series!==series));

  return (
    <div className="flex flex-col h-full" style={{ background: theme.colors.background }}>
      <div className="px-4 pt-5 pb-40 overflow-y-auto scrollbar-hide">
        <GlassCard theme={theme} className="p-6 rounded-3xl space-y-8" variant="elevated">
          {/* Header */}
          <div className="space-y-1">
            <InlineTextInput value={draft.project||draft.name} onChange={v=>update('project',v)} theme={theme} className="text-[20px] leading-tight" />
            <InlineTextInput value={draft.company} onChange={v=>update('company',v)} theme={theme} placeholder="Company" className="text-sm font-medium opacity-80" />
          </div>

          {/* Stage & Discount row */}
          <div className="flex flex-col gap-6">
            <div>
              <SoftLabel theme={theme}>Stage</SoftLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {STAGES.map(s=>{ const active=s===draft.stage; return <button key={s} onClick={()=>update('stage',s)} className="px-3 h-8 rounded-full text-[11px] font-medium border transition-colors" style={{ backgroundColor: active? theme.colors.accent: theme.colors.surface, color: active? '#fff': theme.colors.textPrimary, borderColor: active? theme.colors.accent: theme.colors.border }}>{s}</button>; })}
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-8">
              <div className="flex flex-col gap-2">
                <SoftLabel theme={theme}>Discount</SoftLabel>
                <button ref={discBtn} onClick={()=>discountOpen? setDiscountOpen(false):openDiscount()} className="px-4 h-9 rounded-full text-xs font-semibold border shadow-sm flex items-center gap-2" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, borderColor: theme.colors.border }}>{draft.discount || 'Undecided'} <span className={`transition-transform ${discountOpen?'rotate-180':''}`}>?</span></button>
              </div>
              <div className="flex flex-col gap-2 min-w-[220px]">
                <SoftLabel theme={theme}>Vertical</SoftLabel>
                <div className="flex flex-wrap gap-2 max-w-[380px]">
                  {VERTICALS.map(v=>{ const a=v===draft.vertical; return <button key={v} onClick={()=>update('vertical',v)} className="px-3 h-8 rounded-full text-[11px] font-medium border transition-colors" style={{ backgroundColor:a? theme.colors.accent:theme.colors.surface, color:a? '#fff': theme.colors.textPrimary, borderColor:a? theme.colors.accent: theme.colors.border }}>{v}</button>; })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <SoftLabel theme={theme}>PO Timeframe</SoftLabel>
                <div className="flex flex-wrap gap-2 max-w-[360px]">
                  {PO_TIMEFRAMES.map(t=>{ const a=t===draft.poTimeframe; return <button key={t} onClick={()=>update('poTimeFrame',t)} className="px-3 h-8 rounded-full text-[11px] font-medium border transition-colors" style={{ backgroundColor:a? theme.colors.accent:theme.colors.surface, color:a? '#fff': theme.colors.textPrimary, borderColor:a? theme.colors.accent: theme.colors.border }}>{t}</button>; })}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-3">
            <div className="px-3 h-8 flex items-center gap-1 rounded-full border text-[11px] font-semibold" style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>$ {draft.value?.toString().replace(/[^0-9]/g,'') || '0'}</div>
            <div className="px-3 h-8 flex items-center gap-1 rounded-full border text-[11px] font-semibold" style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>Win {draft.winProbability||0}%</div>
            <div className="px-3 h-8 flex items-center gap-1 rounded-full border text-[11px] font-semibold" style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{draft.discount||'Undecided'}</div>
          </div>

          {/* Probability & competition */}
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <SoftLabel theme={theme}>Win Probability</SoftLabel>
                <ProbabilitySlider value={draft.winProbability||0} onChange={v=>update('winProbability',v)} theme={theme} />
              </div>
              <div className="flex items-center gap-4">
                <SoftLabel theme={theme}>Competition?</SoftLabel>
                <ToggleSwitch checked={!!draft.competitionPresent} onChange={v=>update('competitionPresent',v)} theme={theme} />
              </div>
              {draft.competitionPresent && (
                <div className="pt-2">
                  <SoftLabel theme={theme}>Competitors</SoftLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMPETITORS.filter(c=>c!=='None').map(c=>{ const on=(draft.competitors||[]).includes(c); return (
                      <button key={c} onClick={()=>{ const list=draft.competitors||[]; update('competitors', on? list.filter(x=>x!==c): [...list,c]); }} className="px-3 h-8 rounded-full text-[11px] font-medium border transition-colors" style={{ backgroundColor:on? theme.colors.accent: theme.colors.surface, color:on? '#fff': theme.colors.textPrimary, borderColor:on? theme.colors.accent: theme.colors.border }}>{c}</button>
                    );})}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1"><SoftLabel theme={theme}>Contact</SoftLabel><InlineTextInput value={draft.contact} onChange={v=>update('contact',v)} theme={theme} placeholder="Contact" /></div>
                <div className="flex flex-col gap-1"><SoftLabel theme={theme}>Value</SoftLabel><CurrencyInput value={draft.value} onChange={v=>update('value',v)} theme={theme} /></div>
              </div>
              <div>
                <SoftLabel theme={theme}>Products</SoftLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(draft.products||[]).map(p=> <button key={p.series} onClick={()=>removeProductSeries(p.series)} className="px-3 h-8 rounded-full text-[11px] font-medium flex items-center gap-1 border" style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{p.series}<span className="opacity-60">×</span></button>)}
                  <SuggestInputPill placeholder="Add series" suggestions={JSI_SERIES} onAdd={addProductSeries} theme={theme} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <SoftLabel theme={theme}>Design Firms</SoftLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(draft.designFirms||[]).map(f=> <button key={f} onClick={()=>removeFrom('designFirms',f)} className="px-3 h-8 rounded-full text-[11px] font-medium flex items-center gap-1 border" style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{f}<span className="opacity-60">×</span></button>)}
                    <SuggestInputPill placeholder="Add firm" suggestions={INITIAL_DESIGN_FIRMS} onAdd={v=>addUnique('designFirms',v)} theme={theme} />
                  </div>
                </div>
                <div>
                  <SoftLabel theme={theme}>Dealers</SoftLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(draft.dealers||[]).map(f=> <button key={f} onClick={()=>removeFrom('dealers',f)} className="px-3 h-8 rounded-full text-[11px] font-medium flex items-center gap-1 border" style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{f}<span className="opacity-60">×</span></button>)}
                    <SuggestInputPill placeholder="Add dealer" suggestions={INITIAL_DEALERS} onAdd={v=>addUnique('dealers',v)} theme={theme} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SoftLabel theme={theme}>Notes</SoftLabel>
            <textarea value={draft.notes||''} onChange={e=>update('notes',e.target.value)} rows={4} className="w-full mt-2 resize-none rounded-xl p-3 text-sm outline-none border" style={{ background: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }} placeholder="Add project notes..." />
            {Array.isArray(draft.quotes)&&draft.quotes.length>0 && (
              <div className="mt-4 space-y-2">
                <SoftLabel theme={theme}>Quotes</SoftLabel>
                <div className="flex flex-col gap-2">
                  {draft.quotes.map(q=> <a key={q.id} href={q.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-xs font-medium border hover:bg-black/5 transition-colors" style={{ color: theme.colors.textPrimary, borderColor: theme.colors.border }}>{q.fileName}</a>)}
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] italic opacity-70" style={{ color: theme.colors.textSecondary }}>Autosaved</p>
        </GlassCard>
      </div>
      {discountOpen && (
        <div ref={discMenu} className="fixed z-[9999] rounded-2xl border shadow-2xl overflow-hidden" style={{ top:discPos.top, left:discPos.left, width:discPos.width, background:theme.colors.surface, borderColor:theme.colors.border }}>
          <div className="max-h-[360px] overflow-y-auto custom-scroll-hide py-1">
            {DISCOUNT_OPTIONS.map(opt=> <button key={opt} onClick={()=>{ update('discount',opt); setDiscountOpen(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-black/5 ${opt===draft.discount?'font-semibold':''}`} style={{ color: theme.colors.textPrimary }}>{opt}</button>)}
          </div>
        </div>
      )}
    </div>
  );
};

// Project card component (restored)
const ProjectCard = ({ opp, theme, onClick }) => {
  const discountPct = typeof opp.discount === 'string' ? opp.discount : typeof opp.discount === 'number' ? opp.discount+'%' : null;
  let displayValue = opp.value;
  if (displayValue != null) {
    if (typeof displayValue === 'number') displayValue = '$' + displayValue.toLocaleString();
    else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g,'')); if(!isNaN(num)) displayValue = '$'+num.toLocaleString();
    }
  }
  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
      <GlassCard theme={theme} className="p-5 transition-all duration-200 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" variant="elevated">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-[15px] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{opp.name}</p>
            <p className="mt-1 text-[13px] font-medium leading-tight truncate" style={{ color: theme.colors.textSecondary }}>{opp.company||'Unknown'}</p>
          </div>
          {discountPct && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary, border:`1px solid ${theme.colors.border}` }}>{discountPct}</span>}
        </div>
        <div className="mt-3 mb-3 h-px" style={{ backgroundColor: theme.colors.subtle }} />
        <div className="flex items-end justify-end">
          <p className="font-extrabold text-2xl tracking-tight" style={{ color: theme.colors.accent }}>{displayValue}</p>
        </div>
      </GlassCard>
    </button>
  );
};

// InstallationDetail (restored minimal)
const InstallationDetail = ({ project, theme, onAddPhotoFiles }) => {
  const fileRef = useRef(null);
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="px-4 pt-6 pb-32 space-y-4 overflow-y-auto scrollbar-hide">
        <GlassCard theme={theme} className="p-5 space-y-4" variant="elevated">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-xl truncate" style={{ color: theme.colors.textPrimary }}>{project.name}</p>
              <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>{project.location}</p>
            </div>
            <button type="button" onClick={()=>fileRef.current?.click()} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.accent, color:'#fff' }}>Add Photos</button>
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
  );
};

// Exported main ProjectsScreen (restored)
export const ProjectsScreen = forwardRef(({ onNavigate, theme, opportunities, setOpportunities, myProjects, setMyProjects, projectsInitialTab, clearProjectsInitialTab }, ref) => {
  const initial = projectsInitialTab || 'pipeline';
  const [projectsTab, setProjectsTab] = useState(initial);
  useEffect(()=>{ if(projectsInitialTab) clearProjectsInitialTab && clearProjectsInitialTab(); },[projectsInitialTab, clearProjectsInitialTab]);
  const [selectedPipelineStage,setSelectedPipelineStage] = useState('Discovery');
  const [selectedOpportunity,setSelectedOpportunity] = useState(null);
  const [selectedInstall,setSelectedInstall] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isScrolled,setIsScrolled]=useState(false);
  const stagesScrollRef = useRef(null);
  const [stageSlider,setStageSlider]=useState({left:0,width:0,opacity:0});
  const stageButtonRefs = useRef([]);
  const [showStageFadeLeft,setShowStageFadeLeft]=useState(false);
  const [showStageFadeRight,setShowStageFadeRight]=useState(false);
  useImperativeHandle(ref,()=>({ clearSelection:()=>{ let cleared=false; if(selectedOpportunity){ setSelectedOpportunity(null); cleared=true;} if(selectedInstall){ setSelectedInstall(null); cleared=true;} return cleared; } }));
  const handleScroll = useCallback(()=>{ if(scrollContainerRef.current) setIsScrolled(scrollContainerRef.current.scrollTop>10); },[]);
  const updateStageFade = useCallback(()=>{ const el=stagesScrollRef.current; if(!el) return; const {scrollLeft,scrollWidth,clientWidth}=el; setShowStageFadeLeft(scrollLeft>4); setShowStageFadeRight(scrollLeft+clientWidth<scrollWidth-4); },[]);
  useEffect(()=>{ const idx=STAGES.findIndex(s=>s===selectedPipelineStage); const el=stageButtonRefs.current[idx]; if(el) setStageSlider({ left:el.offsetLeft, width:el.offsetWidth, opacity:1 }); },[selectedPipelineStage]);
  useEffect(()=>{ updateStageFade(); },[projectsTab, updateStageFade]);
  const filteredOpportunities = useMemo(()=> (opportunities||[]).filter(o=>o.stage===selectedPipelineStage),[selectedPipelineStage, opportunities]);
  const stageTotals = useMemo(()=>{ const totalValue = filteredOpportunities.reduce((sum,o)=>{ const raw= typeof o.value==='string'? o.value.replace(/[^0-9.]/g,''): o.value; const num=parseFloat(raw)||0; return sum+num; },0); return { totalValue }; },[filteredOpportunities]);
  const updateOpportunity = updated => setOpportunities(prev=> prev.map(o=> o.id===updated.id? updated:o));
  const addInstallPhotos = files => { if(!files||!selectedInstall) return; const arr=Array.from(files); setMyProjects(prev=> prev.map(p=> p.id===selectedInstall.id? {...p, photos:[...(p.photos||[]), ...arr]}:p)); setSelectedInstall(prev=> prev? {...prev, photos:[...(prev.photos||[]), ...arr]}: prev); };
  if(selectedOpportunity) return <OpportunityDetail opp={selectedOpportunity} theme={theme} onBack={()=>setSelectedOpportunity(null)} onUpdate={u=>{ updateOpportunity(u); setSelectedOpportunity(u); }} />;
  if(selectedInstall) return <InstallationDetail project={selectedInstall} theme={theme} onAddPhotoFiles={addInstallPhotos} />;
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
      <div className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled?'shadow-md':''}`} style={{ backgroundColor: isScrolled? `${theme.colors.background}e0`: theme.colors.background, backdropFilter: isScrolled? 'blur(12px)': 'none', WebkitBackdropFilter: isScrolled? 'blur(12px)': 'none', borderBottom:`1px solid ${isScrolled? theme.colors.border+'40':'transparent'}` }}>
        <div className="px-4 pt-4 pb-2 flex items-center gap-4">
          <div className="flex w-full gap-3">
            <div className="flex flex-[2] rounded-full border overflow-hidden h-12 shadow-sm" style={{ borderColor: theme.colors.border, background:'#fff', minWidth:260 }}>
              <button onClick={()=>setProjectsTab('pipeline')} className="flex-1 h-full px-6 text-sm font-semibold flex flex-col items-center justify-center transition-colors" style={{ backgroundColor: projectsTab==='pipeline'? theme.colors.accent:'#fff', color: projectsTab==='pipeline'? '#fff': theme.colors.textPrimary }}>
                <span>Active</span><span className="-mt-[0px]">Projects</span>
              </button>
              <button onClick={()=>setProjectsTab('my-projects')} className="flex-1 h-full px-6 text-sm font-semibold flex items-center justify-center transition-colors" style={{ backgroundColor: projectsTab==='my-projects'? theme.colors.accent:'#fff', color: projectsTab==='my-projects'? '#fff': theme.colors.textPrimary }}>Installations</button>
            </div>
            {projectsTab==='pipeline' && <button onClick={()=>onNavigate('new-lead')} className="flex-[1] h-12 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all shadow-sm px-6" style={{ backgroundColor: theme.colors.accent, color:'#fff' }}>+ New Project</button>}
            {projectsTab==='my-projects' && <button onClick={()=>onNavigate('add-new-install')} className="flex-[1] h-12 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all shadow-sm px-6" style={{ backgroundColor: theme.colors.accent, color:'#fff' }}>+ New Install</button>}
          </div>
        </div>
        {projectsTab==='pipeline' && (
          <div className="px-4 mt-3 pt-1 pb-3 relative">
            <div ref={stagesScrollRef} onScroll={updateStageFade} className="relative overflow-x-auto scrollbar-hide">
              <div className="relative flex items-center gap-4 pb-2 whitespace-nowrap pr-2">
                {STAGES.map((stage,i)=>{ const active= selectedPipelineStage===stage; const showIndex= stage!=='Won' && stage!=='Lost'; return (
                  <React.Fragment key={stage}>
                    <button ref={el=> stageButtonRefs.current[i]=el} onClick={()=>setSelectedPipelineStage(stage)} className="flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: active? theme.colors.accent: theme.colors.textSecondary }}>
                      {showIndex && <span className="text-[11px] opacity-55">{i+1}.</span>}<span>{stage}</span>
                    </button>
                    {i<STAGES.length-1 && <ArrowRight className="w-3 h-3 opacity-40" style={{ color: theme.colors.textSecondary }} />}
                  </React.Fragment>
                ); })}
                <div className="absolute left-0 right-0 bottom-0 h-px" style={{ backgroundColor: theme.colors.border }} />
                <div className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300" style={{ left:stageSlider.left, width:stageSlider.width, backgroundColor: theme.colors.accent, opacity: stageSlider.opacity }} />
              </div>
            </div>
            {showStageFadeLeft && <div className="pointer-events-none absolute inset-y-0 left-0 w-6" style={{ background:`linear-gradient(to right, ${theme.colors.background}, ${theme.colors.background}00)` }} />}
            {showStageFadeRight && <div className="pointer-events-none absolute inset-y-0 right-0 w-6" style={{ background:`linear-gradient(to left, ${theme.colors.background}, ${theme.colors.background}00)` }} />}
          </div>
        )}
      </div>
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 pt-4 pb-40 space-y-3">
          {projectsTab==='pipeline' && (
            filteredOpportunities.length? filteredOpportunities.map(opp=> <ProjectCard key={opp.id} opp={opp} theme={theme} onClick={()=>setSelectedOpportunity(opp)} />):
            <div className="flex flex-col items-center justify-center py-12"><Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} /><p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No projects in {selectedPipelineStage}</p><p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Add a new project to get started</p></div>
          )}
          {projectsTab==='my-projects' && (
            (myProjects||[]).length? (myProjects||[]).map(p=> (
              <GlassCard key={p.id} theme={theme} className="p-0 overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0" variant="elevated" onClick={()=>setSelectedInstall(p)} style={{ borderRadius:'16px' }}>
                <div className="relative aspect-video w/full">
                  <img src={p.image} alt={p.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4"><h3 className="text-xl font-bold text-white tracking-tight mb-1">{p.name}</h3><p className="text-white/90 font-medium text-sm">{p.location}</p></div>
                </div>
              </GlassCard>
            )): <div className="flex flex-col items-center justify-center py-12"><Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} /><p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No installations recorded yet</p><p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Add install photos and details to build your portfolio</p></div>
          )}
        </div>
      </div>
      {projectsTab==='pipeline' && (
        <div className="fixed bottom-0 left-0 right-0 z-30" style={{ backgroundColor: theme.colors.surface, borderTop:`1px solid ${theme.colors.border}` }}>
          <div className="max-w-screen-md mx-auto px-5 py-9 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-[16px] font-bold" style={{ color: theme.colors.textPrimary }}><span>Total:</span></div>
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: theme.colors.accent }}>{fmtCurrency(stageTotals.totalValue)}</div>
          </div>
        </div>
      )}
    </div>
  );
});
