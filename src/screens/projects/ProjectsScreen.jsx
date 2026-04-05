import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { RequestQuoteModal } from '../../components/common/RequestQuoteModal.jsx';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.js';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { PillButton } from '../../components/common/JSIButtons.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { JSI_SERIES } from '../products/data.js';
import { DESIGN_TOKENS, isDarkTheme } from '../../design-system/tokens.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';

import { PROJECTS_TAB_OPTIONS, fmtCurrency } from './components/projects/utils.js';
import { OpportunityDetail } from './components/projects/OpportunityDetail.jsx';
import { ProjectCard } from './components/projects/ProjectCard.jsx';
import { InstallationDetail } from './components/projects/InstallationDetail.jsx';

// Exported main ProjectsScreen (restored)
export const ProjectsScreen = forwardRef(({ onNavigate, theme, opportunities, setOpportunities, myProjects, setMyProjects, projectsInitialTab, clearProjectsInitialTab, projectsInitialStage, clearProjectsInitialStage, deepLinkOppId, members, currentUserId }, ref) => {
  const isDark = isDarkTheme(theme);
  const [projectsTab, setProjectsTab] = usePersistentState('pref.projects.activeTab', 'pipeline');
  const [selectedPipelineStage, setSelectedPipelineStage] = usePersistentState('pref.projects.pipelineStage', 'Discovery');
  useEffect(() => {
    if (projectsInitialTab) {
      setProjectsTab(projectsInitialTab);
      clearProjectsInitialTab && clearProjectsInitialTab();
    }
  }, [projectsInitialTab, clearProjectsInitialTab, setProjectsTab]);
  useEffect(() => {
    if (projectsInitialStage && STAGES.includes(projectsInitialStage)) {
      setSelectedPipelineStage(projectsInitialStage);
      clearProjectsInitialStage && clearProjectsInitialStage();
    }
  }, [projectsInitialStage, clearProjectsInitialStage, setSelectedPipelineStage]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedInstall, setSelectedInstall] = useState(null);
  const scrollContainerRef = useRef(null);
  const stagesScrollRef = useRef(null);
  const [showStageFadeLeft, setShowStageFadeLeft] = useState(false);
  const [showStageFadeRight, setShowStageFadeRight] = useState(false);

  // Deep link: auto-select opportunity by ID from URL
  useEffect(() => {
    if (deepLinkOppId && opportunities) {
      const match = opportunities.find(o => String(o.id) === String(deepLinkOppId));
      if (match) setSelectedOpportunity(match);
    }
  }, [deepLinkOppId, opportunities]);

  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      let cleared = false;
      if (selectedOpportunity) { setSelectedOpportunity(null); cleared = true; }
      if (selectedInstall)     { setSelectedInstall(null);     cleared = true; }
      return cleared;
    },
  }));

  const updateStageFade = useCallback(() => {
    const el = stagesScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowStageFadeLeft(scrollLeft > 4);
    setShowStageFadeRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateStageFade();
    const onResize = () => updateStageFade();
    window.addEventListener('resize', onResize);
    const ro =
      typeof ResizeObserver !== 'undefined' && stagesScrollRef.current
        ? new ResizeObserver(onResize)
        : null;
    if (ro && stagesScrollRef.current) ro.observe(stagesScrollRef.current);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, [projectsTab, updateStageFade]);

  const filteredOpportunities = useMemo(
    () => (opportunities || []).filter(o => o.stage === selectedPipelineStage),
    [selectedPipelineStage, opportunities]
  );

  const stageTotals = useMemo(() => {
    const totalValue = filteredOpportunities.reduce((sum, o) => {
      const raw = typeof o.value === 'string' ? o.value.replace(/[^0-9.]/g, '') : o.value;
      const num = parseFloat(raw) || 0;
      return sum + num;
    }, 0);
    return { totalValue };
  }, [filteredOpportunities]);

  const updateOpportunity = useCallback(updated => {
    setOpportunities(prev => prev.map(o => o.id === updated.id ? updated : o));
  }, [setOpportunities]);

  const addInstallPhotos = useCallback(files => {
    if (!files || !selectedInstall) return;
    const arr = Array.from(files);
    setMyProjects(prev =>
      prev.map(p =>
        p.id === selectedInstall.id ? { ...p, photos: [...(p.photos || []), ...arr] } : p
      )
    );
    setSelectedInstall(prev =>
      prev ? { ...prev, photos: [...(prev.photos || []), ...arr] } : prev
    );
  }, [selectedInstall, setMyProjects]);

  if (selectedOpportunity) return (
    <OpportunityDetail
      opp={selectedOpportunity}
      theme={theme}
      members={members}
      currentUserId={currentUserId}
      onUpdate={u => { updateOpportunity(u); setSelectedOpportunity(u); }}
    />
  );
  if (selectedInstall) return (
    <InstallationDetail
      project={selectedInstall}
      theme={theme}
      onAddPhotoFiles={addInstallPhotos}
    />
  );
  return (
    <div className="min-h-full relative" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      {/* Controls */}
      <div className="flex-shrink-0" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 12px)', backgroundColor: theme.colors.background }}>
        <div className="px-4 sm:px-6 lg:px-8 pb-3 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between gap-3">
            <SegmentedToggle
              value={projectsTab}
              onChange={setProjectsTab}
              options={PROJECTS_TAB_OPTIONS}
              size="sm"
              theme={theme}
            />
            {projectsTab === 'pipeline' && (
              <button
                onClick={() => onNavigate('new-lead')}
                className="h-9 inline-flex items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-all px-4 whitespace-nowrap active:scale-[0.97]"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                <Plus size={15} strokeWidth={2.5} /> New Project
              </button>
            )}
            {projectsTab === 'my-projects' && (
              <button
                onClick={() => onNavigate('add-new-install')}
                className="h-9 inline-flex items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-all px-4 whitespace-nowrap active:scale-[0.97]"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                <Plus size={15} strokeWidth={2.5} /> New Install
              </button>
            )}
          </div>
        </div>
        {projectsTab === 'pipeline' && (
          <div className="px-4 sm:px-6 lg:px-8 pb-3 relative max-w-5xl mx-auto w-full">
            <div ref={stagesScrollRef} onScroll={updateStageFade} className="overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1.5 py-0.5 whitespace-nowrap">
                {STAGES.map((stage, i) => {
                  const active = selectedPipelineStage === stage;
                  const showIndex = stage !== 'Won' && stage !== 'Lost';
                  return (
                    <button
                      key={stage}
                      onClick={() => setSelectedPipelineStage(stage)}
                      className="text-[13px] font-semibold transition-all px-3.5 py-1.5 rounded-full"
                      style={{
                        color: active ? theme.colors.accentText : theme.colors.textSecondary,
                        backgroundColor: active ? theme.colors.textPrimary : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)'),
                        opacity: active ? 1 : 0.8,
                      }}
                    >
                      {showIndex && <span className="opacity-50 mr-0.5">{i + 1}</span>} {stage}
                    </button>
                  );
                })}
              </div>
            </div>
            {showStageFadeLeft && <div className="pointer-events-none absolute inset-y-0 left-0 w-8" style={{ background: `linear-gradient(to right, ${theme.colors.background}, ${theme.colors.background}00)` }} />}
            {showStageFadeRight && <div className="pointer-events-none absolute inset-y-0 right-0 w-10" style={{ background: `linear-gradient(to left, ${theme.colors.background}, ${theme.colors.background}00)` }} />}
          </div>
        )}
      </div>
      <div ref={scrollContainerRef}>
        <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-40 max-w-5xl mx-auto w-full">
          {projectsTab==='pipeline' && (
            filteredOpportunities.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredOpportunities.map((opp)=> <div key={opp.id}><ProjectCard opp={opp} theme={theme} onClick={()=>{ setSelectedOpportunity(opp); onNavigate(`projects/${opp.id}`); }} /></div>)}
                </div>

              </>
            ) :
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)' }}>
                <Briefcase className="w-7 h-7" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
              </div>
              <p className="text-center text-[15px] font-semibold" style={{ color: theme.colors.textPrimary }}>No projects in {selectedPipelineStage}</p>
              <p className="text-center text-[13px] mt-1" style={{ color: theme.colors.textSecondary }}>Tap "+ New Project" to add one</p>
            </div>
          )}
          {projectsTab==='my-projects' && (
            (myProjects||[]).length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(myProjects||[]).map((p)=> (
                  <div key={p.id}>
                  <button onClick={()=>setSelectedInstall(p)} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
                    <div
                      className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                      style={{
                        borderRadius: 18,
                        border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
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
            ) : <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)' }}>
                <Briefcase className="w-7 h-7" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
              </div>
              <p className="text-center text-[15px] font-semibold" style={{ color: theme.colors.textPrimary }}>No installations recorded yet</p>
              <p className="text-center text-[13px] mt-1" style={{ color: theme.colors.textSecondary }}>Add install photos and details to build your portfolio</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom totals bar — glassy overlay */}
      {projectsTab === 'pipeline' && filteredOpportunities.length > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none flex justify-center"
          style={{ zIndex: 20, bottom: 'clamp(0.5rem, 5vh, 3.25rem)' }}
        >
          <div
            className="pointer-events-auto inline-flex items-center gap-5 rounded-3xl px-6 py-3.5"
            style={{
              backgroundColor: isDark ? 'rgba(30,30,30,0.75)' : 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark
                ? '0 -4px 24px rgba(0,0,0,0.3)'
                : '0 -2px 20px rgba(0,0,0,0.06)',
            }}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>{selectedPipelineStage}</p>
              <p className="text-[13px] md:text-[14px] font-medium mt-0.5" style={{ color: theme.colors.textSecondary }}>{filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'project' : 'projects'}</p>
            </div>
            <div className="w-px self-stretch" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
            <p className="font-bold tracking-tight leading-none" style={{ color: theme.colors.textPrimary, fontSize: 'clamp(1.5rem, 1.1rem + 0.8vw, 2rem)' }}>{fmtCurrency(stageTotals.totalValue)}</p>
          </div>
        </div>
      )}

    </div>
  );
});
