import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Briefcase, MapPin, Plus } from 'lucide-react';
import { RequestQuoteModal } from '../../components/common/RequestQuoteModal.jsx';
import { STAGES, VERTICALS, COMPETITORS, DISCOUNT_OPTIONS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.js';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { PillButton } from '../../components/common/JSIButtons.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { JSI_SERIES } from '../products/data.js';
import { DESIGN_TOKENS, isDarkTheme } from '../../design-system/tokens.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';
import FloatingPill from '../../components/common/FloatingPill.jsx';

import { PROJECTS_TAB_OPTIONS, fmtCurrency } from './components/projects/utils.js';
import { OpportunityDetail } from './components/projects/OpportunityDetail.jsx';
import { ProjectCard } from './components/projects/ProjectCard.jsx';
import { InstallationDetail } from './components/projects/InstallationDetail.jsx';
import { MOCK_CUSTOMERS, VERTICAL_COLORS, getAllProjectsWithMeta } from './customers/customerData.js';
import { CustomerMicrositeScreen } from './customers/CustomerMicrositeScreen.jsx';

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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
      if (selectedCustomer)   { setSelectedCustomer(null);   cleared = true; }
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

  if (selectedCustomer) return (
    <CustomerMicrositeScreen
      customer={selectedCustomer}
      theme={theme}
      onBack={() => setSelectedCustomer(null)}
    />
  );
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
                className="h-8 inline-flex items-center justify-center gap-1 rounded-full text-[12px] font-semibold transition-all px-3 whitespace-nowrap active:scale-[0.97]"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                <Plus size={13} strokeWidth={2.5} /> Project
              </button>
            )}
            {projectsTab === 'customers' && (
              <button
                onClick={() => {}}
                className="h-8 inline-flex items-center justify-center gap-1 rounded-full text-[12px] font-semibold transition-all px-3 whitespace-nowrap active:scale-[0.97]"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                <Plus size={13} strokeWidth={2.5} /> Customer
              </button>
            )}
            {projectsTab === 'my-projects' && (
              <button
                onClick={() => onNavigate('add-new-install')}
                className="h-8 inline-flex items-center justify-center gap-1 rounded-full text-[12px] font-semibold transition-all px-3 whitespace-nowrap active:scale-[0.97]"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                <Plus size={13} strokeWidth={2.5} /> Install
              </button>
            )}
          </div>
        </div>
        {projectsTab === 'pipeline' && (
          <div className="px-4 sm:px-6 lg:px-8 pb-3 relative max-w-5xl mx-auto w-full">
            <div ref={stagesScrollRef} onScroll={updateStageFade} className="overflow-x-auto scrollbar-hide">
              <div className="inline-flex items-center gap-0 py-0.5 whitespace-nowrap">
                {STAGES.map((stage, i) => {
                  const active = selectedPipelineStage === stage;
                  const showIndex = stage !== 'Won' && stage !== 'Lost';
                  return (
                    <button
                      key={stage}
                      onClick={() => setSelectedPipelineStage(stage)}
                      className="relative text-[13px] transition-all px-3.5 py-1.5"
                      style={{
                        color: active ? theme.colors.textPrimary : (isDark ? 'rgba(240,240,240,0.55)' : '#9A9790'),
                        fontWeight: active ? 600 : 500,
                        borderBottom: active ? `2px solid ${theme.colors.textPrimary}` : '2px solid transparent',
                      }}
                    >
                      {showIndex && <span style={{ opacity: active ? 0.5 : 0.35 }} className="mr-0.5">{i + 1}</span>} {stage}
                    </button>
                  );
                })}
              </div>
              {/* Underline track */}
              <div className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
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
          {projectsTab==='customers' && (
            MOCK_CUSTOMERS.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {MOCK_CUSTOMERS.map(cust => {
                  const vertColor = VERTICAL_COLORS[cust.vertical] || theme.colors.textSecondary;
                  const activeStds = (cust.standardsPrograms || []).filter(p => p.status === 'Active' || p.status === 'Expiring').length;
                  const currentOrd = (cust.orders?.current || []).length;
                  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
                  return (
                    <button key={cust.id} onClick={() => setSelectedCustomer(cust)} className="w-full text-left group" style={{ WebkitTapHighlightColor: 'transparent' }}>
                      <div className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                        style={{ border: `1px solid ${border}` }}>
                        <div className="relative aspect-video w-full">
                          <img src={cust.image} alt={cust.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3.5">
                            <h3 className="text-[15px] font-bold text-white tracking-tight leading-snug">{cust.name}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-white/80" />
                              <span className="text-[11px] text-white/80">{cust.location.city}, {cust.location.state}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                              {activeStds > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(74,124,89,0.25)', color: '#8BC49A' }}>
                                  {activeStds} standard{activeStds !== 1 ? 's' : ''}
                                </span>
                              )}
                              {currentOrd > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(46,107,138,0.25)', color: '#7BBAD4' }}>
                                  {currentOrd} order{currentOrd !== 1 ? 's' : ''}
                                </span>
                              )}
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                                {cust.vertical}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)' }}>
                  <Briefcase className="w-7 h-7" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                </div>
                <p className="text-center text-[15px] font-semibold" style={{ color: theme.colors.textPrimary }}>No customers yet</p>
                <p className="text-center text-[13px] mt-1" style={{ color: theme.colors.textSecondary }}>Customer accounts will appear here</p>
              </div>
            )
          )}
          {projectsTab==='my-projects' && (() => {
            const allProjects = getAllProjectsWithMeta();
            return allProjects.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {allProjects.map((p) => {
                  const ownerCustomer = MOCK_CUSTOMERS.find(c => c.id === p.customerId);
                  return (
                    <div key={p.id}>
                    <button onClick={() => setSelectedCustomer(ownerCustomer)} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
                      <div
                        className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                        style={{
                          borderRadius: 18,
                          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <div className="relative aspect-[4/3] w-full">
                          <img src={p.image} alt={p.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3.5">
                            <h3 className="text-[15px] font-bold text-white tracking-tight leading-snug">{p.name}</h3>
                            <p className="text-white/80 font-medium text-xs mt-0.5">{p.customerName}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {p.installCount > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(46,107,138,0.25)', color: '#7BBAD4' }}>
                                  {p.installCount} photo{p.installCount !== 1 ? 's' : ''}
                                </span>
                              )}
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                                {p.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)' }}>
                  <Briefcase className="w-7 h-7" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                </div>
                <p className="text-center text-[15px] font-semibold" style={{ color: theme.colors.textPrimary }}>No installations recorded yet</p>
                <p className="text-center text-[13px] mt-1" style={{ color: theme.colors.textSecondary }}>Add install photos and details to build your portfolio</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Floating bottom totals pill */}
      <FloatingPill
        theme={theme}
        visible={projectsTab === 'pipeline' && filteredOpportunities.length > 0}
        icon={<Briefcase />}
        label={`${selectedPipelineStage} · ${filteredOpportunities.length} ${filteredOpportunities.length === 1 ? 'project' : 'projects'} · ${fmtCurrency(stageTotals.totalValue)}`}
      />

    </div>
  );
});
