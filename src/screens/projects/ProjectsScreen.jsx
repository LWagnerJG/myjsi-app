import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, MapPin, Plus, X, Building2, Upload, ImageIcon, Search, ChevronDown, Check, Store, Pencil } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '../../components/common/EmptyState.jsx';
import { INSTALLATION_CONSTANTS } from './installation-data.js';
import { CITY_OPTIONS } from '../../constants/locations.js';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { STAGES } from './data.js';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { isDarkTheme, JSI_COLORS } from '../../design-system/tokens.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';
import FloatingPill from '../../components/common/FloatingPill.jsx';
import { PROJECTS_TAB_OPTIONS, fmtCurrency } from './components/projects/utils.js';
import { OpportunityDetail } from './components/projects/OpportunityDetail.jsx';
import { ProjectCard } from './components/projects/ProjectCard.jsx';
import { MOCK_CUSTOMERS, VERTICAL_COLORS, getAllProjectsWithMeta } from './customers/customerData.js';
import { CustomerMicrositeScreen } from './customers/CustomerMicrositeScreen.jsx';

/* ── vertical options (matches VERTICAL_COLORS keys + extras) ── */
const VERTICAL_OPTIONS = ['Corporate', 'Healthcare', 'HigherEd', 'Government', 'Hospitality', 'Education', 'Other'];

/* ── Customer type config ── */
const CUSTOMER_TYPES = [
  { id: 'end-users',    label: 'End Users',    singular: 'End User',    icon: Building2 },
  { id: 'dealers',      label: 'Dealers',      singular: 'Dealer',      icon: Store     },
  { id: 'design-firms', label: 'Design Firms', singular: 'Design Firm', icon: Pencil    },
];

/* ── Type dropdown — branded title + popover ── */
const TypeDropdown = React.memo(({ value, onChange, theme }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const current = CUSTOMER_TYPES.find(t => t.id === value) || CUSTOMER_TYPES[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close, { passive: true });
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 active:opacity-60 transition-opacity select-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <span className="text-[1.375rem] font-bold tracking-tight leading-none" style={{ color: c.textPrimary }}>
          {current.label}
        </span>
        <ChevronDown
          className={`w-[18px] h-[18px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: c.textSecondary, opacity: 0.55, marginTop: 2 }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-50 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: isDark ? 'rgba(35,35,35,0.96)' : c.surface,
            border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.55)' : '0 8px 28px rgba(0,0,0,0.13)',
            minWidth: 170,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {CUSTOMER_TYPES.map((type, idx) => {
            const Icon = type.icon;
            const active = type.id === value;
            return (
              <button
                key={type.id}
                onClick={() => { onChange(type.id); setOpen(false); }}
                className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
                style={{
                  color: active ? c.accent : c.textPrimary,
                  borderTop: idx > 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? c.accent : c.textSecondary, opacity: active ? 1 : 0.5 }} />
                <span className="text-sm font-semibold flex-1">{type.label}</span>
                {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.accent }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
TypeDropdown.displayName = 'TypeDropdown';

/* ═══════════════════════════════════════════════════════════════
   ADD CUSTOMER MODAL
   ═══════════════════════════════════════════════════════════════ */
const AddCustomerModal = ({ theme, onClose, onAdd, customerType = 'end-users', typeSingular = 'Customer' }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : '#f9f9f9';

  const [name, setName]       = useState('');
  const [city, setCity]       = useState('');
  const [state, setState]     = useState('');
  const [vertical, setVertical] = useState('');
  const [error, setError]     = useState('');
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (!name.trim())     { setError('Account name is required.'); return; }
    if (!city.trim())     { setError('City is required.'); return; }
    if (!state.trim())    { setError('State is required.'); return; }
    if (!vertical)        { setError('Select a vertical.'); return; }

    const typeMap = { 'dealers': 'dealer', 'design-firms': 'design-firm', 'end-users': 'end-user' };
    const newCustomer = {
      id: `cust-${Date.now()}`,
      type: typeMap[customerType] || 'end-user',
      name: name.trim(),
      location: { city: city.trim(), state: state.trim().toUpperCase().slice(0, 2) },
      vertical,
      image: `https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80`,
      standardsPrograms: [],
      orders: { current: [], history: [] },
      approvedMaterials: {},
      projects: [],
      contacts: [],
      documents: [],
    };
    onAdd(newCustomer);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ backgroundColor: c.surface, border: `1px solid ${border}` }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c.accent}15` }}>
              <Building2 className="w-4 h-4" style={{ color: c.accent }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: c.textPrimary }}>Add {typeSingular}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
            <X className="w-4 h-4" style={{ color: c.textSecondary }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Account Name</label>
            <input
              ref={nameRef}
              value={name} onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Midwest Health Partners"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ backgroundColor: fieldBg, border: `1.5px solid ${border}`, color: c.textPrimary }}
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: c.textSecondary, opacity: 0.7 }}>City</label>
              <input
                value={city} onChange={e => { setCity(e.target.value); setError(''); }}
                placeholder="Indianapolis"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{ backgroundColor: fieldBg, border: `1.5px solid ${border}`, color: c.textPrimary }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: c.textSecondary, opacity: 0.7 }}>State</label>
              <input
                value={state} onChange={e => { setState(e.target.value); setError(''); }}
                placeholder="IN"
                maxLength={2}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all uppercase"
                style={{ backgroundColor: fieldBg, border: `1.5px solid ${border}`, color: c.textPrimary }}
              />
            </div>
          </div>

          {/* Vertical */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Vertical</label>
            <div className="flex flex-wrap gap-2">
              {VERTICAL_OPTIONS.map(v => {
                const active = vertical === v;
                const vColor = VERTICAL_COLORS[v] || c.accent;
                return (
                  <button key={v} type="button"
                    onClick={() => { setVertical(v); setError(''); }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.97]"
                    style={{
                      backgroundColor: active ? `${vColor}20` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      color: active ? vColor : c.textSecondary,
                      border: active ? `1.5px solid ${vColor}60` : `1.5px solid ${border}`,
                    }}>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-xs font-medium" style={{ color: JSI_COLORS.error }}>{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}>
              Cancel
            </button>
            <button onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
              style={{ backgroundColor: c.accent, color: c.accentText }}>
              Add {typeSingular}
            </button>
          </div>
        </div>

        {/* Safe area bottom */}
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>,
    document.body,
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROJECTS SCREEN
   ═══════════════════════════════════════════════════════════════ */
export const ProjectsScreen = forwardRef(({
  onNavigate, theme, opportunities, setOpportunities,
  projectsInitialTab, clearProjectsInitialTab,
  projectsInitialStage, clearProjectsInitialStage,
  deepLinkOppId, members, currentUserId,
}, ref) => {
  const isDark = isDarkTheme(theme);
  const [projectsTab, setProjectsTab] = usePersistentState('pref.projects.activeTab', 'pipeline');
  const [selectedPipelineStage, setSelectedPipelineStage] = usePersistentState('pref.projects.pipelineStage', 'Discovery');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [customerType, setCustomerType] = usePersistentState('pref.projects.customerType', 'end-users');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const stagesScrollRef = useRef(null);
  const [showStageFadeLeft, setShowStageFadeLeft] = useState(false);
  const [showStageFadeRight, setShowStageFadeRight] = useState(false);

  /* ── Deep-link / initial tab effects ── */
  useEffect(() => {
    if (projectsInitialTab) {
      setProjectsTab(projectsInitialTab);
      clearProjectsInitialTab?.();
    }
  }, [projectsInitialTab, clearProjectsInitialTab, setProjectsTab]);

  useEffect(() => {
    if (projectsInitialStage && STAGES.includes(projectsInitialStage)) {
      setSelectedPipelineStage(projectsInitialStage);
      clearProjectsInitialStage?.();
    }
  }, [projectsInitialStage, clearProjectsInitialStage, setSelectedPipelineStage]);

  useEffect(() => {
    if (deepLinkOppId && opportunities) {
      const match = opportunities.find(o => String(o.id) === String(deepLinkOppId));
      if (match) setSelectedOpportunity(match);
    }
  }, [deepLinkOppId, opportunities]);

  /* ── Expose clearSelection to parent ── */
  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      if (selectedCustomer)    { setSelectedCustomer(null);    return true; }
      if (selectedOpportunity) { setSelectedOpportunity(null); return true; }
      return false;
    },
  }));

  /* ── Stage scroll fades ── */
  const updateStageFade = useCallback(() => {
    const el = stagesScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowStageFadeLeft(scrollLeft > 4);
    setShowStageFadeRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateStageFade();
    window.addEventListener('resize', updateStageFade);
    const ro = typeof ResizeObserver !== 'undefined' && stagesScrollRef.current
      ? new ResizeObserver(updateStageFade)
      : null;
    if (ro && stagesScrollRef.current) ro.observe(stagesScrollRef.current);
    return () => {
      window.removeEventListener('resize', updateStageFade);
      ro?.disconnect();
    };
  }, [projectsTab, updateStageFade]);

  /* ── Derived pipeline data ── */
  const filteredOpportunities = useMemo(
    () => (opportunities || []).filter(o => o.stage === selectedPipelineStage),
    [selectedPipelineStage, opportunities],
  );

  const stageTotalValue = useMemo(() =>
    filteredOpportunities.reduce((sum, o) => {
      const raw = typeof o.value === 'string' ? o.value.replace(/[^0-9.]/g, '') : o.value;
      return sum + (parseFloat(raw) || 0);
    }, 0),
    [filteredOpportunities],
  );

  const updateOpportunity = useCallback(updated => {
    setOpportunities(prev => prev.map(o => o.id === updated.id ? updated : o));
  }, [setOpportunities]);

  const handleAddCustomer = useCallback(newCustomer => {
    setCustomers(prev => [...prev, newCustomer]);
  }, []);

  /* ── Filtered customers for current type ── */
  const filteredCustomers = useMemo(() => {
    if (customerType === 'dealers')       return customers.filter(c => c.type === 'dealer');
    if (customerType === 'design-firms')  return customers.filter(c => c.type === 'design-firm');
    return customers.filter(c => !c.type || c.type === 'end-user');
  }, [customers, customerType]);

  /* ── CTA config per tab ── */
  const ctaSingular = useMemo(
    () => CUSTOMER_TYPES.find(t => t.id === customerType)?.singular || 'Customer',
    [customerType],
  );
  const cta = useMemo(() => ({
    pipeline:      { label: 'Project',    action: () => onNavigate('new-lead') },
    customers:     { label: ctaSingular,  action: () => setShowAddCustomer(true) },
    'my-projects': { label: 'Install',    action: () => onNavigate('add-new-install') },
  })[projectsTab], [projectsTab, ctaSingular, onNavigate]);

  /* ── Sub-screen renders ── */
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
      onUpdate={updated => { updateOpportunity(updated); setSelectedOpportunity(updated); }}
    />
  );

  const allProjects = getAllProjectsWithMeta();

  return (
    <div className="min-h-full relative" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>

      {/* ── Top controls bar ── */}
      <div className="flex-shrink-0" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 12px)', backgroundColor: theme.colors.background }}>
        {/* Row 1 — full-width toggle */}
        <div className="px-4 sm:px-6 lg:px-8 pb-3 max-w-5xl mx-auto w-full">
          <SegmentedToggle
            value={projectsTab}
            onChange={setProjectsTab}
            options={PROJECTS_TAB_OPTIONS}
            size="sm"
            theme={theme}
            fullWidth
          />
        </div>

        {/* Row 2 — contextual title + CTA */}
        <div className="px-4 sm:px-6 lg:px-8 pb-3 max-w-5xl mx-auto w-full flex items-center justify-between gap-3">
          {projectsTab === 'customers' ? (
            <TypeDropdown value={customerType} onChange={setCustomerType} theme={theme} />
          ) : (
            <div /> /* spacer keeps CTA right-aligned on other tabs */
          )}
          {cta && (
            <button
              onClick={cta.action}
              className="flex-shrink-0 inline-flex items-center justify-center gap-1 rounded-full text-sm font-semibold transition-all whitespace-nowrap active:scale-[0.97]"
              style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText, paddingTop: 9, paddingBottom: 9, paddingLeft: 14, paddingRight: 16 }}
            >
              <Plus size={13} strokeWidth={2.5} /> {cta.label}
            </button>
          )}
        </div>

        {/* Pipeline stage strip */}
        {projectsTab === 'pipeline' && (
          <div className="px-4 sm:px-6 lg:px-8 pb-3 relative max-w-5xl mx-auto w-full">
            <div ref={stagesScrollRef} onScroll={updateStageFade} className="overflow-x-auto scrollbar-hide">
              <div className="inline-flex items-center gap-0 py-0.5 whitespace-nowrap">
                {STAGES.map((stage, i) => {
                  const active = selectedPipelineStage === stage;
                  return (
                    <button key={stage} onClick={() => setSelectedPipelineStage(stage)}
                      className="relative text-[0.8125rem] transition-all px-3.5 py-1.5"
                      style={{
                        color: active ? theme.colors.textPrimary : (isDark ? 'rgba(240,240,240,0.55)' : '#9A9790'),
                        fontWeight: active ? 600 : 500,
                        borderBottom: active ? `2px solid ${theme.colors.textPrimary}` : '2px solid transparent',
                      }}>
                      {stage !== 'Won' && stage !== 'Lost' && (
                        <span style={{ opacity: active ? 0.5 : 0.35 }} className="mr-0.5">{i + 1}</span>
                      )}
                      {' '}{stage}
                    </button>
                  );
                })}
              </div>
              <div className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
            </div>
            {showStageFadeLeft && (
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8"
                style={{ background: `linear-gradient(to right, ${theme.colors.background}, ${theme.colors.background}00)` }} />
            )}
            {showStageFadeRight && (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10"
                style={{ background: `linear-gradient(to left, ${theme.colors.background}, ${theme.colors.background}00)` }} />
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-40 max-w-5xl mx-auto w-full">

        {/* PIPELINE tab */}
        {projectsTab === 'pipeline' && (
          filteredOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredOpportunities.map(opp => (
                <ProjectCard key={opp.id} opp={opp} theme={theme}
                  onClick={() => { setSelectedOpportunity(opp); onNavigate(`projects/${opp.id}`); }} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Briefcase} theme={theme} isDark={isDark}
              title={`No projects in ${selectedPipelineStage}`}
              subtitle='Tap "+ Project" to add one' />
          )
        )}

        {/* CUSTOMERS tab */}
        {projectsTab === 'customers' && (
          filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCustomers.map(cust => (
                <CustomerCard key={cust.id} customer={cust} isDark={isDark}
                  onClick={() => setSelectedCustomer(cust)} />
              ))}
            </div>
          ) : (
            <SharedEmptyState icon={Building2} theme={theme}
              title={`No ${ctaSingular.toLowerCase()}s yet`}
              description={`Tap "+ ${ctaSingular}" to add one.`} />
          )
        )}

        {/* MY PROJECTS tab */}
        {projectsTab === 'my-projects' && (
          allProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {allProjects.map(p => {
                const ownerCustomer = customers.find(c => c.id === p.customerId);
                return (
                  <InstallCard key={p.id} project={p} isDark={isDark}
                    onClick={() => ownerCustomer && setSelectedCustomer(ownerCustomer)} />
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Briefcase} theme={theme} isDark={isDark}
              title="No installations recorded yet"
              subtitle='Tap "+ Install" to add one' />
          )
        )}
      </div>

      {/* Floating summary pill (pipeline only) */}
      <FloatingPill
        theme={theme}
        visible={projectsTab === 'pipeline' && filteredOpportunities.length > 0}
        icon={<Briefcase />}
        label={`${selectedPipelineStage} · ${filteredOpportunities.length} ${filteredOpportunities.length === 1 ? 'project' : 'projects'} · ${fmtCurrency(stageTotalValue)}`}
      />

      {/* Add Customer modal */}
      {showAddCustomer && (
        <AddCustomerModal
          theme={theme}
          onClose={() => setShowAddCustomer(false)}
          onAdd={handleAddCustomer}
          customerType={customerType}
          typeSingular={ctaSingular}
        />
      )}
    </div>
  );
});

ProjectsScreen.displayName = 'ProjectsScreen';

/* ═══════════════════════════════════════════════════════════════
   CARD SUB-COMPONENTS (extracted to prevent inline re-creation)
   ═══════════════════════════════════════════════════════════════ */
const CustomerCard = React.memo(({ customer, isDark, onClick }) => {
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
  const activeStds = (customer.standardsPrograms || []).filter(p => p.status === 'Active' || p.status === 'Expiring').length;
  const currentOrd = (customer.orders?.current || []).length;
  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ border: `1px solid ${border}` }}>
        <div className="relative aspect-video w-full">
          <img src={customer.image} alt={customer.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <h3 className="text-[0.9375rem] font-bold text-white tracking-tight leading-snug">{customer.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-white/80" />
              <span className="text-xs text-white/80">{customer.location.city}, {customer.location.state}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {activeStds > 0 && (
                <span className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${JSI_COLORS.success}40`, color: JSI_COLORS.success }}>
                  {activeStds} standard{activeStds !== 1 ? 's' : ''}
                </span>
              )}
              {currentOrd > 0 && (
                <span className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${JSI_COLORS.info}40`, color: JSI_COLORS.info }}>
                  {currentOrd} order{currentOrd !== 1 ? 's' : ''}
                </span>
              )}
              <span className="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                {customer.vertical}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
});
CustomerCard.displayName = 'CustomerCard';

const InstallCard = React.memo(({ project, isDark, onClick }) => (
  <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor: 'transparent' }}>
    <div className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
      style={{ borderRadius: 18, border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)' }}>
      <div className="relative aspect-[4/3] w-full">
        <img src={project.image} alt={project.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <h3 className="text-[0.9375rem] font-bold text-white tracking-tight leading-snug">{project.name}</h3>
          <p className="text-white/80 font-medium text-xs mt-0.5">{project.customerName}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {project.installCount > 0 && (
              <span className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${JSI_COLORS.info}40`, color: JSI_COLORS.info }}>
                {project.installCount} photo{project.installCount !== 1 ? 's' : ''}
              </span>
            )}
            <span className="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
              {project.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  </button>
));
InstallCard.displayName = 'InstallCard';

const EmptyState = ({ icon: Icon, theme, isDark, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)' }}>
      <Icon className="w-7 h-7" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
    </div>
    <p className="text-center text-[0.9375rem] font-semibold" style={{ color: theme.colors.textPrimary }}>{title}</p>
    <p className="text-center text-[0.8125rem] mt-1" style={{ color: theme.colors.textSecondary }}>{subtitle}</p>
  </div>
);
