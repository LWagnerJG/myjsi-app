import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Plus, Briefcase, DollarSign, LineChart, Percent, ArrowRight, PencilLine, Check, X, Share2, FileText } from 'lucide-react';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES } from './data.js';
import { FormInput, PortalNativeSelect, TagInput } from '../../components/common/FormComponents.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { VisionOptions, KnoxOptions, WinkHoopzOptions } from './product-options.jsx';

// utility format
const fmtCurrency = (v) => typeof v === 'string' ? v : (v ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const Chip = ({ icon: Icon, label, theme }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
    {Icon && <Icon className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />}
    {label}
  </span>
);

const SectionHeader = ({ title, theme }) => (
  <h2 className="text-sm tracking-wide font-semibold uppercase" style={{ color: theme.colors.textSecondary }}>{title}</h2>
);

const ReadOnlyList = ({ items, theme }) => (
  <div className="grid gap-3 text-sm">
    {items.map(([label, value]) => (
      <div key={label} className="flex items-start justify-between gap-4">
        <span className="font-medium" style={{ color: theme.colors.textSecondary }}>{label}</span>
        <span className="text-right" style={{ color: theme.colors.textPrimary }}>{value || '-'}</span>
      </div>
    ))}
  </div>
);

// Redesigned consolidated opportunity detail view
const OpportunityDetail = ({ opp, theme, onBack, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(opp);
  const [activeField, setActiveField] = useState(null);
  useEffect(()=>{ setDraft(opp); },[opp]);
  const update=(k,v)=> setDraft(p=>({...p,[k]:v}));
  const save=()=>{ onUpdate(draft); setEditMode(false); setActiveField(null); };
  const cancel=()=>{ setDraft(opp); setEditMode(false); setActiveField(null); };
  const toggleCompetitor=c=>{ const list=draft.competitors||[]; update('competitors', list.includes(c)? list.filter(x=>x!==c): [...list,c]); };

  const infoChipStyle = { backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="px-4 pt-5 pb-40 overflow-y-auto scrollbar-hide">
        <div className="relative rounded-3xl p-6 mb-5" style={{ backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}`, boxShadow:'0 4px 18px rgba(0,0,0,0.06)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {editMode ? (
                <FormInput label="Project Name" value={draft.project||draft.name} onChange={e=>update('project',e.target.value)} theme={theme} />
              ):(<h1 className="font-bold text-xl mb-1" style={{ color: theme.colors.textPrimary }}>{draft.project||draft.name}</h1>)}
              {editMode ? (
                <FormInput label="Company" value={draft.company} onChange={e=>update('company',e.target.value)} theme={theme} />
              ):(<p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>{draft.company}</p>)}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=> setEditMode(m=>!m)} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }}>{ editMode? 'Cancel':'Edit' }</button>
              {editMode && <button onClick={save} className="px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: theme.colors.accent }}>Save</button>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={infoChipStyle}><DollarSign className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} /> {fmtCurrency(draft.estimatedList || draft.value)}</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={infoChipStyle}><Briefcase className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} /> {draft.projectStatus || draft.stage}</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={infoChipStyle}><Percent className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} /> {draft.discount}</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={infoChipStyle}><LineChart className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} /> Win {draft.winProbability||50}%</span>
          </div>
        </div>

        <div className="grid gap-5">
          {/* Overview group */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}` }}>
            <h2 className="text-xs font-semibold tracking-wider mb-4" style={{ color: theme.colors.textSecondary }}>OVERVIEW</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span style={{ color: theme.colors.textSecondary }}>Vertical</span><span style={{ color: theme.colors.textPrimary }}>{draft.vertical||'-'}</span>
              <span style={{ color: theme.colors.textSecondary }}>PO Timeframe</span><span style={{ color: theme.colors.textPrimary }}>{draft.poTimeframe||'-'}</span>
              <span style={{ color: theme.colors.textSecondary }}>Contact</span><span style={{ color: theme.colors.textPrimary }}>{draft.contact||'-'}</span>
              <span style={{ color: theme.colors.textSecondary }}>Products</span><span style={{ color: theme.colors.textPrimary }}>{(draft.products||[]).map(p=>p.series).join(', ')||'-'}</span>
            </div>
          </div>

            {/* Competition & Stakeholders */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}` }}>
            <h2 className="text-xs font-semibold tracking-wider mb-4" style={{ color: theme.colors.textSecondary }}>COMPETITION & STAKEHOLDERS</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span style={{ color: theme.colors.textSecondary }}>Competition Present</span><span style={{ color: theme.colors.textPrimary }}>{draft.competitionPresent? 'Yes':'No'}</span>
              <span style={{ color: theme.colors.textSecondary }}>Competitors</span><span style={{ color: theme.colors.textPrimary }}>{(draft.competitors||[]).join(', ')||'-'}</span>
              <span style={{ color: theme.colors.textSecondary }}>Design Firms</span><span style={{ color: theme.colors.textPrimary }}>{(draft.designFirms||[]).join(', ')||'-'}</span>
              <span style={{ color: theme.colors.textSecondary }}>Dealers</span><span style={{ color: theme.colors.textPrimary }}>{(draft.dealers||[]).join(', ')||'-'}</span>
            </div>
            {editMode && draft.competitionPresent && (
              <div className="flex flex-wrap gap-2 mt-4">
                {COMPETITORS.filter(c=>c!=='None').map(c=>{ const on=(draft.competitors||[]).includes(c); return <button key={c} type="button" onClick={()=>toggleCompetitor(c)} className="px-3 py-1.5 text-[11px] rounded-full font-medium transition-colors border" style={{ backgroundColor:on?theme.colors.accent:theme.colors.surface, color:on?theme.colors.surface:theme.colors.textPrimary, borderColor:on?theme.colors.accent:theme.colors.border }}>{c}</button>; })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-3xl p-6" style={{ backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}` }}>
            <h2 className="text-xs font-semibold tracking-wider mb-4" style={{ color: theme.colors.textSecondary }}>NOTES</h2>
            {editMode ? (
              <FormInput label="" type="textarea" value={draft.notes||''} onChange={e=>update('notes', e.target.value)} theme={theme} />
            ):(<p className="text-sm leading-relaxed" style={{ color: theme.colors.textPrimary }}>{draft.notes || 'No notes yet.'}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ProjectCard cleaned (no gradient, no duplicate % icon)
const ProjectCard = ({ opp, theme, onClick }) => {
  const discountPct = typeof opp.discount === 'string' ? opp.discount : typeof opp.discount === 'number' ? `${opp.discount}%` : null;
  // Normalize value: if value is string with $ keep, if number convert, if string digits convert
  let displayValue = opp.value;
  if (displayValue != null) {
    if (typeof displayValue === 'number') {
      displayValue = '$' + displayValue.toLocaleString();
    } else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g,''));
      if (!isNaN(num)) displayValue = '$' + num.toLocaleString();
    }
  }
  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <GlassCard theme={theme} className="p-5 transition-all duration-200 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-[15px] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{opp.name}</p>
            <p className="mt-1 text-[13px] font-medium leading-tight truncate" style={{ color: theme.colors.textSecondary }}>{opp.company||'Unknown'}</p>
          </div>
          {discountPct && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}` }}>
              {discountPct}
            </span>
          )}
        </div>
        <div className="mt-3 mb-3 h-px" style={{ backgroundColor: theme.colors.border }} />
        <div className="flex items-end justify-end">
          <p className="font-extrabold text-2xl tracking-tight" style={{ color: theme.colors.accent }}>{displayValue}</p>
        </div>
      </GlassCard>
    </button>
  );
};

const InstallationDetail = ({ project, theme, onAddPhoto, onAddPhotoFiles }) => {
  const fileRef = React.useRef(null);
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="px-4 pt-6 pb-32 space-y-4 overflow-y-auto scrollbar-hide">
        <GlassCard theme={theme} className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-xl truncate" style={{ color: theme.colors.textPrimary }}>{project.name}</p>
              <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>{project.location}</p>
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.accent, color: '#fff' }}>Add Photos</button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e)=>onAddPhotoFiles(e.target.files)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(project.photos || [project.image]).map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={project.name + '-photo-' + i} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard theme={theme} className="p-5 space-y-3">
          <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>Previous Quotes</h3>
          <div className="text-sm" style={{ color: theme.colors.textSecondary }}>No quote history yet.</div>
        </GlassCard>
        <GlassCard theme={theme} className="p-5 space-y-3">
          <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>Standards</h3>
          <div className="flex flex-wrap gap-2">
            {(project.standards || []).length === 0 && <div className="text-sm" style={{ color: theme.colors.textSecondary }}>No standards recorded.</div>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export const ProjectsScreen = forwardRef(({ onNavigate, theme, opportunities, setOpportunities, myProjects, setMyProjects, projectsInitialTab, clearProjectsInitialTab }, ref) => {
    const initial = projectsInitialTab || 'pipeline';
    const [projectsTab, setProjectsTab] = useState(initial);
    useEffect(() => { if (projectsInitialTab) clearProjectsInitialTab && clearProjectsInitialTab(); }, [projectsInitialTab, clearProjectsInitialTab]);

    const [selectedPipelineStage, setSelectedPipelineStage] = useState('Discovery');
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [selectedInstall, setSelectedInstall] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);
    const stagesScrollRef = useRef(null);
    const [showStageFadeLeft, setShowStageFadeLeft] = useState(false);
    const [showStageFadeRight, setShowStageFadeRight] = useState(false);

    useImperativeHandle(ref, () => ({
        clearSelection: () => { let cleared=false; if (selectedOpportunity) { setSelectedOpportunity(null); cleared=true; } if (selectedInstall) { setSelectedInstall(null); cleared=true; } return cleared; },
    }));

    const handleScroll = useCallback(() => { if (scrollContainerRef.current) setIsScrolled(scrollContainerRef.current.scrollTop > 10); }, []);
    const updateStageFade = useCallback(() => {
        const el = stagesScrollRef.current; if (!el) return; const { scrollLeft, scrollWidth, clientWidth } = el; setShowStageFadeLeft(scrollLeft > 4); setShowStageFadeRight(scrollLeft + clientWidth < scrollWidth - 4);
    }, []);

    const [stageSlider, setStageSlider] = useState({ left: 0, width: 0, opacity: 0 });
    const stageButtonRefs = useRef([]);
    useEffect(() => { const idx = STAGES.findIndex(s => s === selectedPipelineStage); const el = stageButtonRefs.current[idx]; if (el) setStageSlider({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 }); }, [selectedPipelineStage]);
    useEffect(() => { updateStageFade(); }, [projectsTab, updateStageFade]);

    const filteredOpportunities = useMemo(() => (opportunities || []).filter(o => o.stage === selectedPipelineStage), [selectedPipelineStage, opportunities]);

    const stageTotals = useMemo(() => {
        const totalValue = filteredOpportunities.reduce((sum, o) => {
            const raw = typeof o.value === 'string' ? o.value.replace(/[^0-9.]/g, '') : o.value; const num = parseFloat(raw) || 0; return sum + num;
        }, 0); return { totalValue };
    }, [filteredOpportunities]);

    const updateOpportunity = (updated) => {
        setOpportunities(prev => prev.map(o => o.id === updated.id ? updated : o));
    };

    const addInstallPhotos = (files) => {
      if (!files || !selectedInstall) return; const arr = Array.from(files);
      setMyProjects(prev => prev.map(p => p.id === selectedInstall.id ? { ...p, photos: [...(p.photos||[]), ...arr] } : p));
      setSelectedInstall(prev => prev ? { ...prev, photos: [...(prev.photos||[]), ...arr] } : prev);
    };

    if (selectedOpportunity) return <OpportunityDetail opp={selectedOpportunity} theme={theme} onBack={() => setSelectedOpportunity(null)} onUpdate={(u)=>{updateOpportunity(u); setSelectedOpportunity(u);}} />;
    if (selectedInstall) return <InstallationDetail project={selectedInstall} theme={theme} onAddPhotoFiles={addInstallPhotos} />;

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            <div className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`} style={{ backgroundColor: isScrolled ? `${theme.colors.background}e0` : theme.colors.background, backdropFilter: isScrolled ? 'blur(12px)' : 'none', WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none', borderBottom: `1px solid ${isScrolled ? theme.colors.border + '40' : 'transparent'}` }}>
                <div className="px-4 pt-4 pb-2 flex items-center gap-4">
                    <div className="flex w-full gap-3">
                        {/* Segmented control styled like Community (active accent, inactive white) */}
                        <div className="flex flex-[2] rounded-full border overflow-hidden h-12 shadow-sm" style={{ borderColor: theme.colors.border, background: '#fff', minWidth: 260 }}>
                            <button onClick={() => setProjectsTab('pipeline')} className="flex-1 h-full px-6 text-sm font-semibold flex flex-col items-center justify-center transition-colors" style={{ backgroundColor: projectsTab==='pipeline'? theme.colors.accent:'#fff', color: projectsTab==='pipeline'? '#fff': theme.colors.textPrimary, lineHeight: '1.05' }}>
                              <span className="leading-[1.05]">Active</span>
                              <span className="leading-[1.05] -mt-[0px]">Projects</span>
                            </button>
                            <button onClick={() => setProjectsTab('my-projects')} className="flex-1 h-full px-6 text-sm font-semibold flex items-center justify-center transition-colors" style={{ backgroundColor: projectsTab==='my-projects'? theme.colors.accent:'#fff', color: projectsTab==='my-projects'? '#fff': theme.colors.textPrimary }}>
                              Installations
                            </button>
                        </div>
                        {/* Action button same size/color style as community Post button */}
                        {projectsTab === 'pipeline' && (
                          <button onClick={() => onNavigate('new-lead')} className="flex-[1] h-12 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm px-6" style={{ backgroundColor: theme.colors.accent, color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
                            + New Project
                          </button>
                        )}
                        {projectsTab === 'my-projects' && (
                          <button onClick={() => onNavigate('add-new-install')} className="flex-[1] h-12 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm px-6" style={{ backgroundColor: theme.colors.accent, color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}>
                            + New Install
                          </button>
                        )}
                    </div>
                </div>
                {projectsTab === 'pipeline' && (
                    <div className="px-4 mt-3 pt-1 pb-3 relative">
                        <div ref={stagesScrollRef} onScroll={updateStageFade} className="relative overflow-x-auto scrollbar-hide">
                            <div className="relative flex items-center gap-4 pb-2 whitespace-nowrap pr-2">
                                {STAGES.map((stage, i) => {
                                    const active = selectedPipelineStage === stage; 
                                    const showIndex = stage !== 'Won' && stage !== 'Lost';
                                    return (
                                      <React.Fragment key={stage}>
                                        <button ref={el => (stageButtonRefs.current[i] = el)} onClick={() => setSelectedPipelineStage(stage)} className="flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: active ? theme.colors.accent : theme.colors.textSecondary }}>
                                          {showIndex && <span className="text-[11px] font-normal opacity-55" style={{ color: active ? theme.colors.textSecondary : theme.colors.textSecondary }}>{i+1}.</span>}
                                          <span>{stage}</span>
                                        </button>
                                        {i < STAGES.length -1 && <ArrowRight className="w-3 h-3 opacity-40" style={{ color: theme.colors.textSecondary }} />}
                                      </React.Fragment>
                                    );
                                })}
                                <div className="absolute left-0 right-0 bottom-0 h-px" style={{ backgroundColor: theme.colors.border }} />
                                <div className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300" style={{ left: stageSlider.left, width: stageSlider.width, backgroundColor: theme.colors.accent, opacity: stageSlider.opacity }} />
                            </div>
                        </div>
                        {showStageFadeLeft && <div className="pointer-events-none absolute inset-y-0 left-0 w-6" style={{ background: `linear-gradient(to right, ${theme.colors.background}, ${theme.colors.background}00)` }} />}
                        {showStageFadeRight && <div className="pointer-events-none absolute inset-y-0 right-0 w-6" style={{ background: `linear-gradient(to left, ${theme.colors.background}, ${theme.colors.background}00)` }} />}
                    </div>
                )}
            </div>
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 pt-4 pb-40 space-y-3">
                    {projectsTab === 'pipeline' && (
                        filteredOpportunities.length ? (
                            filteredOpportunities.map(opp => <ProjectCard key={opp.id} opp={opp} theme={theme} onClick={() => setSelectedOpportunity(opp)} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} />
                                <p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No projects in {selectedPipelineStage}</p>
                                <p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Add a new project to get started</p>
                            </div>
                        )
                    )}

                    {projectsTab === 'my-projects' && (
                        (myProjects || []).length ? (
                            (myProjects || []).map(p => (
                                <GlassCard
                                    key={p.id}
                                    theme={theme}
                                    className="p-0 overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                                    onClick={() => setSelectedInstall(p)}
                                    style={{ border: `1px solid ${theme.colors.border}`, borderRadius: '16px' }}
                                >
                                    <div className="relative aspect-video w/full">
                                        <img src={p.image} alt={p.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-4">
                                            <h3 className="text-xl font-bold text-white tracking-tight mb-1">{p.name}</h3>
                                            <p className="text-white/90 font-medium text-sm">{p.location}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Briefcase className="w-12 h-12 mb-4" style={{ color: theme.colors.textSecondary }} />
                                <p className="text-center text-sm font-medium" style={{ color: theme.colors.textSecondary }}>No installations recorded yet</p>
                                <p className="text-center text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Add install photos and details to build your portfolio</p>
                            </div>
                        )
                    )}
                </div>
            </div>
            {projectsTab === 'pipeline' && (
                <div className="fixed bottom-0 left-0 right-0 z-30" style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}` }}>
                    <div className="max-w-screen-md mx-auto px-5 py-9">
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 text-[16px] font-bold" style={{ color: theme.colors.textPrimary }}><span>Total:</span></div>
                            <div className="text-3xl font-extrabold tracking-tight" style={{ color: theme.colors.accent }}>{fmtCurrency(stageTotals.totalValue)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
