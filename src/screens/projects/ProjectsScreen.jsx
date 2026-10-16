import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '../../components/common/EmptyState.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { CITY_OPTIONS } from '../../constants/locations.js';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { isDarkTheme, JSI_COLORS, fieldTileSurface, FIELD_LABEL_CLASSNAME } from '../../design-system/tokens.js';
import { OpportunityDetail } from './components/projects/OpportunityDetail.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { MOCK_CUSTOMERS, VERTICAL_COLORS, VERTICAL_OPTIONS, getAllProjectsWithMeta } from './customers/customerData.js';
import { CustomerMicrositeScreen } from './customers/CustomerMicrositeScreen.jsx';
import { usePersistentState } from '../../hooks/usePersistentState.js';
import { ProjectsWorkspace } from './components/projects/ProjectsWorkspace.jsx';

const VIEW_OPTIONS = [
  { value: 'customers', label: 'Customers' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'my-projects', label: 'Installations' },
];

const AddCustomerModal = ({ theme, onClose, onAdd }) => {
  const [customerType, setCustomerType] = useState('end-users');
  const typeSingular = { 'end-users': 'End User', dealers: 'Dealer', 'design-firms': 'Design Firm' }[customerType];
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const fieldTile = fieldTileSurface(theme);

  const [name, setName]           = useState('');
  const [location, setLocation]   = useState('');
  const [vertical, setVertical]   = useState('');
  const [customVertical, setCustomVertical] = useState('');
  const [error, setError]         = useState('');

  const resolvedVertical = vertical === 'Other' && customVertical.trim() ? customVertical.trim() : vertical;

  const handleSubmit = () => {
    if (!name.trim())     { setError('Account name is required.'); return; }
    if (!location.trim()) { setError('Location is required.'); return; }
    if (!vertical)        { setError('Select a vertical.'); return; }
    if (vertical === 'Other' && !customVertical.trim()) { setError('Enter a custom vertical.'); return; }

    const parts = location.trim().split(',').map(s => s.trim());
    const city  = parts[0] || location.trim();
    const state = (parts[1] || '').toUpperCase().slice(0, 2);

    const typeMap = { 'dealers': 'dealer', 'design-firms': 'design-firm', 'end-users': 'end-user' };
    onAdd({
      id: `cust-${Date.now()}`,
      type: typeMap[customerType] || 'end-user',
      name: name.trim(),
      location: { city, state },
      vertical: resolvedVertical,
      image: `https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80`,
      standardsPrograms: [],
      orders: { current: [], history: [] },
      approvedMaterials: {},
      projects: [],
      contacts: [],
      contactVisibilityLocked: false,
      documents: [],
    });
    onClose();
  };

  return (
    <Modal show onClose={onClose} title={`Add ${typeSingular}`} theme={theme}>
      <div className="space-y-4">
        <label className="block text-xs font-medium" style={{ color: c.textSecondary }}>
          Customer type
          <select value={customerType} onChange={event => setCustomerType(event.target.value)} className="block w-full rounded-xl px-4 min-h-[44px] mt-1.5 text-sm focus-ring" style={{ ...fieldTile, color: c.textPrimary }}>
            <option value="end-users">End User</option>
            <option value="dealers">Dealer</option>
            <option value="design-firms">Design Firm</option>
          </select>
        </label>
        {/* Account Name */}
        <div>
          <label className={`${FIELD_LABEL_CLASSNAME} block mb-1.5`} style={{ color: c.textSecondary }}>
            Account Name
          </label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Midwest Health Partners"
            className="w-full rounded-full px-4 py-2.5 text-sm outline-none transition-all"
            style={{ ...fieldTile, color: c.textPrimary }}
          />
        </div>

        {/* Location */}
        <div>
          <label className={`${FIELD_LABEL_CLASSNAME} block mb-1.5`} style={{ color: c.textSecondary }}>
            Location
          </label>
          <AutoCompleteCombobox
            value={location}
            onChange={val => { setLocation(val); setError(''); }}
            onSelect={val => { setLocation(val); setError(''); }}
            onAddNew={val => { setLocation(val.trim()); setError(''); }}
            options={CITY_OPTIONS}
            placeholder="Search city..."
            theme={theme}
            compact
            resetOnSelect={false}
          />
        </div>

        {/* Vertical */}
        <div>
          <label className={`${FIELD_LABEL_CLASSNAME} block mb-1.5`} style={{ color: c.textSecondary }}>
            Vertical
          </label>
          <div className="flex flex-wrap gap-2">
            {VERTICAL_OPTIONS.map(v => {
              const active  = vertical === v;
              const vColor  = VERTICAL_COLORS[v] || c.accent;
              if (v === 'Other') {
                return (
                  <div key={v}
                    className="inline-flex items-center gap-0 rounded-full transition-all"
                    style={{
                      backgroundColor: active ? `${vColor}20` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      border: active ? `1.5px solid ${vColor}60` : `1.5px solid ${border}`,
                    }}
                  >
                    <button type="button"
                      onClick={() => { setVertical('Other'); setError(''); }}
                      className="px-3 py-1.5 text-xs font-semibold"
                      style={{ color: active ? vColor : c.textSecondary }}
                    >
                      Other{active ? ':' : ''}
                    </button>
                    {active && (
                      <input
                        value={customVertical}
                        onChange={e => { setCustomVertical(e.target.value); setError(''); }}
                        placeholder="type..."
                        className="bg-transparent text-xs font-semibold outline-none w-20 pr-3 py-1.5"
                        style={{ color: vColor }}
                        maxLength={30}
                      />
                    )}
                  </div>
                );
              }
              return (
                <button key={v} type="button"
                  onClick={() => { setVertical(v); setCustomVertical(''); setError(''); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.97]"
                  style={{
                    backgroundColor: active ? `${vColor}20` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    color: active ? vColor : c.textSecondary,
                    border: active ? `1.5px solid ${vColor}60` : `1.5px solid ${border}`,
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium" style={{ color: JSI_COLORS.error }}>{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-full text-sm font-bold transition-all active:scale-[0.97]"
            style={{ backgroundColor: c.accent, color: c.accentText }}
          >
            Add {typeSingular}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const ProjectsScreen = forwardRef(({
  onNavigate, theme, opportunities, setOpportunities,
  projectsInitialTab, clearProjectsInitialTab,
  projectsInitialStage, clearProjectsInitialStage,
  deepLinkOppId, members, currentUserId,
  setBackHandler, sampleOrders, myProjects = [],
  screenParams,
}, ref) => {
  const isDark = isDarkTheme(theme);
  const [projectsTab, setProjectsTab] = usePersistentState('pref.projects.activeTab', 'customers');
  const [selectedPipelineStage, setSelectedPipelineStage] = usePersistentState('pref.projects.pipelineStage', '');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [deepLinkResolved, setDeepLinkResolved] = useState(!deepLinkOppId);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [companyFilter, setCompanyFilter] = useState(screenParams?.company || null);
  const screenParamsCompany = screenParams?.company || null;
  useEffect(() => {
    setCompanyFilter(screenParamsCompany);
  }, [screenParamsCompany]);

  const hasRouteOpportunityDetail = Boolean(deepLinkOppId);
  const selectedOpportunityRef = useRef(selectedOpportunity);
  const selectedCustomerRef = useRef(selectedCustomer);

  useEffect(() => {
    selectedOpportunityRef.current = selectedOpportunity;
  }, [selectedOpportunity]);

  useEffect(() => {
    selectedCustomerRef.current = selectedCustomer;
  }, [selectedCustomer]);

  useEffect(() => {
    if (projectsInitialTab) {
      setProjectsTab(projectsInitialTab);
      clearProjectsInitialTab?.();
    }
  }, [projectsInitialTab, clearProjectsInitialTab, setProjectsTab]);

  useEffect(() => {
    if (projectsInitialStage) {
      setSelectedPipelineStage(projectsInitialStage);
      clearProjectsInitialStage?.();
    }
  }, [projectsInitialStage, clearProjectsInitialStage, setSelectedPipelineStage]);

  useEffect(() => {
    if (!deepLinkOppId) {
      setSelectedOpportunity(null);
      setDeepLinkResolved(true);
      return;
    }

    if (!Array.isArray(opportunities)) {
      setSelectedOpportunity(null);
      setDeepLinkResolved(true);
      return;
    }

    const match = opportunities.find(o => String(o.id) === String(deepLinkOppId));
    setSelectedOpportunity(match || null);
    setDeepLinkResolved(true);
  }, [deepLinkOppId, opportunities]);

  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      if (selectedCustomer)    { setSelectedCustomer(null);    return true; }
      if (selectedOpportunity && !hasRouteOpportunityDetail) {
        setSelectedOpportunity(null);
        return true;
      }
      return false;
    },
  }), [selectedCustomer, selectedOpportunity, hasRouteOpportunityDetail]);

  useEffect(() => {
    if (typeof setBackHandler !== 'function') return undefined;
    const hasLocalOpportunityDetail = Boolean(selectedOpportunity) && !hasRouteOpportunityDetail;

    if (!selectedCustomer && !hasLocalOpportunityDetail) {
      setBackHandler(null);
      return undefined;
    }

    return setBackHandler(() => {
      if (selectedCustomerRef.current) {
        setSelectedCustomer(null);
        return true;
      }
      if (!hasRouteOpportunityDetail && selectedOpportunityRef.current) {
        setSelectedOpportunity(null);
        return true;
      }
      return false;
    });
  }, [selectedCustomer, selectedOpportunity, hasRouteOpportunityDetail, setBackHandler]);

  const updateOpportunity = useCallback(updated => {
    const stamped = { ...updated, updatedAt: new Date().toISOString() };
    setOpportunities(prev => prev.map(o => o.id === stamped.id ? stamped : o));
  }, [setOpportunities]);

  const deleteOpportunity = useCallback(id => {
    setOpportunities(prev => prev.filter(o => o.id !== id));
  }, [setOpportunities]);

  const handleAddCustomer = useCallback(newCustomer => {
    setCustomers(prev => [...prev, newCustomer]);
  }, []);

  const updateCustomer = useCallback(updatedCustomer => {
    setCustomers(prev => prev.map(customer => customer.id === updatedCustomer.id ? updatedCustomer : customer));
    setSelectedCustomer(prev => prev?.id === updatedCustomer.id ? updatedCustomer : prev);
  }, []);

  const catalogInstalls = useMemo(() => getAllProjectsWithMeta(customers), [customers]);
  const userInstalls = useMemo(() => (myProjects || []).map((project) => {
    const location = typeof project.location === 'string'
      ? project.location
      : [project.location?.city, project.location?.state].filter(Boolean).join(', ');
    return {
      ...project,
      customerName: project.customerName || project.company || location || 'Install',
      installCount: project.installCount ?? project.photoCount ?? (Array.isArray(project.photos) ? project.photos.length : 0),
      image: project.image || (Array.isArray(project.photos) ? project.photos[0] : '') || '',
      location: location || 'Location TBD',
    };
  }), [myProjects]);
  const allProjects = useMemo(() => {
    const seen = new Set();
    const merged = [];
    for (const project of [...userInstalls, ...catalogInstalls]) {
      const key = String(project.id);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(project);
    }
    return merged;
  }, [userInstalls, catalogInstalls]);

  const deepLinkMissing = deepLinkResolved && Boolean(deepLinkOppId) && !selectedOpportunity;

  if (selectedCustomer) return (
    <CustomerMicrositeScreen
      customer={selectedCustomer}
      theme={theme}
      onUpdateCustomer={updateCustomer}
    />
  );

  if (selectedOpportunity) return (
    <OpportunityDetail
      key={selectedOpportunity.id}
      opp={selectedOpportunity}
      theme={theme}
      customers={customers}
      members={members}
      currentUserId={currentUserId}
      sampleOrders={sampleOrders}
      opportunities={opportunities}
      onNavigate={onNavigate}
      onOpenCustomer={setSelectedCustomer}
      onUpdate={updated => { updateOpportunity(updated); setSelectedOpportunity(updated); }}
      onMarkLost={updated => { updateOpportunity(updated); setDeepLinkResolved(false); setSelectedOpportunity(null); onNavigate('projects'); }}
      onDelete={id => { deleteOpportunity(id); setDeepLinkResolved(false); setSelectedOpportunity(null); onNavigate('projects'); }}
      onDone={() => { setDeepLinkResolved(false); setSelectedOpportunity(null); onNavigate('projects'); }}
    />
  );

  if (deepLinkMissing) {
    return (
      <div className="min-h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
        <div className="px-4 sm:px-6 lg:px-8 pt-8 max-w-content mx-auto w-full">
          <SharedEmptyState
            icon={Briefcase}
            theme={theme}
            title="Project not found"
            description="This project link is invalid or the project was removed."
            action={{ label: 'Back to Projects', onClick: () => onNavigate('projects') }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full relative" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <div className="px-4 sm:px-6 lg:px-8 max-w-content mx-auto w-full pb-10" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 20px)' }}>
        <PageHeader theme={theme} title="My Projects" subtitle="Customer context. Clear next steps." />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <SegmentedToggle value={projectsTab} onChange={setProjectsTab} options={VIEW_OPTIONS} size="sm" theme={theme} ariaLabel="Project views" />
          <button type="button" onClick={() => onNavigate(projectsTab === 'my-projects' ? 'add-new-install' : 'new-lead')}
            className="inline-flex items-center gap-2 rounded-full px-4 min-h-[44px] text-sm font-semibold focus-ring"
            style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
            <Plus size={16} />{projectsTab === 'my-projects' ? 'Add installation' : 'New project'}
          </button>
        </div>
        {projectsTab !== 'my-projects' ? (
          <ProjectsWorkspace theme={theme} view={projectsTab} customers={customers} opportunities={opportunities || []}
            companyFilter={companyFilter} onClearCompany={() => setCompanyFilter(null)}
            initialStage={selectedPipelineStage} onClearInitialStage={() => setSelectedPipelineStage('')}
            onOpenProject={id => onNavigate(`projects/${id}`)} onOpenCustomer={setSelectedCustomer}
            onUpdateProject={updateOpportunity} onAddCustomer={() => setShowAddCustomer(true)} />
        ) : allProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {allProjects.map(project => <InstallCard key={project.id} project={project} isDark={isDark}
              onClick={() => { const customer = customers.find(c => c.id === project.customerId); if (customer) setSelectedCustomer(customer); }} />)}
          </div>
        ) : <SharedEmptyState icon={Briefcase} theme={theme} title="No installations recorded yet" description="Add an installation to get started." />}
      </div>
      {showAddCustomer && <AddCustomerModal theme={theme} onClose={() => setShowAddCustomer(false)} onAdd={handleAddCustomer} />}
    </div>
  );
});
ProjectsScreen.displayName = 'ProjectsScreen';

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

