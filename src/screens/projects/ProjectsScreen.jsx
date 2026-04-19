import React, { useState, useMemo, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, MapPin, Plus, X, Building2, Upload, ImageIcon, Search, ChevronDown, Check, Store, Pencil } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '../../components/common/EmptyState.jsx';
import { INSTALLATION_CONSTANTS } from './installation-data.js';
import { CITY_OPTIONS } from '../../constants/locations.js';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { STAGES } from './data.js';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { TabContent } from '../../components/common/TabContent.jsx';
import { isDarkTheme, JSI_COLORS } from '../../design-system/tokens.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';
import { FloatingActionCTA } from '../../components/common/FloatingActionCTA.jsx';
import { PROJECTS_TAB_OPTIONS, fmtCurrency } from './components/projects/utils.js';
import { OpportunityDetail } from './components/projects/OpportunityDetail.jsx';
import { ProjectCard } from './components/projects/ProjectCard.jsx';
import { MOCK_CUSTOMERS, VERTICAL_COLORS, VERTICAL_OPTIONS, getAllProjectsWithMeta } from './customers/customerData.js';
import { CustomerMicrositeScreen } from './customers/CustomerMicrositeScreen.jsx';

const CUSTOMER_TYPES = [
  { id: 'end-users',    label: 'End Users',    singular: 'End User',    icon: Building2 },
  { id: 'dealers',      label: 'Dealers',      singular: 'Dealer',      icon: Store     },
  { id: 'design-firms', label: 'Design Firms', singular: 'Design Firm', icon: Pencil    },
];

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

const AddCustomerModal = ({ theme, onClose, onAdd, customerType = 'end-users', typeSingular = 'Customer' }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : '#f9f9f9';

  const [name, setName]       = useState('');
  const [location, setLocation] = useState('');
  const [vertical, setVertical] = useState('');
  const [customVertical, setCustomVertical] = useState('');
  const [error, setError]     = useState('');
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const resolvedVertical = vertical === 'Other' && customVertical.trim() ? customVertical.trim() : vertical;

  const handleSubmit = () => {
    if (!name.trim())     { setError('Account name is required.'); return; }
    if (!location.trim()) { setError('Location is required.'); return; }
    if (!vertical)        { setError('Select a vertical.'); return; }
    if (vertical === 'Other' && !customVertical.trim()) { setError('Enter a custom vertical.'); return; }

    const parts = location.trim().split(',').map(s => s.trim());
    const city = parts[0] || location.trim();
    const state = (parts[1] || '').toUpperCase().slice(0, 2);

    const typeMap = { 'dealers': 'dealer', 'design-firms': 'design-firm', 'end-users': 'end-user' };
    const newCustomer = {
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
      documents: [],
    };
    onAdd(newCustomer);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl"
        style={{ backgroundColor: c.surface, border: `1px solid ${border}`, overflow: 'visible' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl" style={{ borderColor: border, backgroundColor: c.surface }}>
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

        <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-hide" style={{ backgroundColor: c.surface, borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
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

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Location</label>
            <AutoCompleteCombobox
              value={location}
              onChange={(val) => { setLocation(val); setError(''); }}
              onSelect={(val) => { setLocation(val); setError(''); }}
              onAddNew={(val) => { setLocation(val.trim()); setError(''); }}
              options={CITY_OPTIONS}
              placeholder="Search city..."
              theme={theme}
              compact
              resetOnSelect={false}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Vertical</label>
            <div className="flex flex-wrap gap-2">
              {VERTICAL_OPTIONS.map(v => {
                const active = vertical === v;
                const vColor = VERTICAL_COLORS[v] || c.accent;
                if (v === 'Other') {
                  return (
                    <div key={v} className="inline-flex items-center gap-0 rounded-full transition-all"
                      style={{
                        backgroundColor: active ? `${vColor}20` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                        border: active ? `1.5px solid ${vColor}60` : `1.5px solid ${border}`,
                      }}>
                      <button type="button"
                        onClick={() => { setVertical('Other'); setError(''); }}
                        className="px-3 py-1.5 text-xs font-semibold"
                        style={{ color: active ? vColor : c.textSecondary }}>
                        Other{active ? ':' : ''}
                      </button>
                      {active && (
                        <input
                          autoFocus
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
                    }}>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs font-medium" style={{ color: JSI_COLORS.error }}>{error}</p>}

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

const AddInstallModal = ({ theme, onClose, onAdd, customers }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : '#f9f9f9';
  const MAX_PHOTOS = INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxPhotos;

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectSearch, setProjectSearch]     = useState('');
  const [projectOpen, setProjectOpen]         = useState(false);
  const [location, setLocation]               = useState('');
  const [photos, setPhotos]                   = useState([]);
  const [error, setError]                     = useState('');
  const searchRef = useRef(null);
  const fileInputRef = useRef(null);
  const projectDropdownRef = useRef(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const projectOptions = useMemo(() => {
    return (customers || []).flatMap(cust =>
      (cust.projects || []).map(p => ({
        id: p.id,
        label: `${cust.name}: ${p.name}`,
        customerName: cust.name,
        projectName: p.name,
        location: p.location || `${cust.location?.city || ''}, ${cust.location?.state || ''}`,
      })),
    );
  }, [customers]);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.toLowerCase().trim();
    if (!q) return projectOptions;
    return projectOptions.filter(p =>
      p.customerName.toLowerCase().includes(q) ||
      p.projectName.toLowerCase().includes(q),
    );
  }, [projectSearch, projectOptions]);

  useEffect(() => {
    if (!projectOpen) return;
    const close = (e) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target)) setProjectOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close, { passive: true });
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, [projectOpen]);

  const handleSelectProject = useCallback((proj) => {
    setSelectedProject(proj);
    setProjectSearch(proj.label);
    setProjectOpen(false);
    if (proj.location && !location) setLocation(proj.location);
    setError('');
  }, [location]);

  const photoPreviewUrls = useMemo(
    () => photos.map(file => URL.createObjectURL(file)),
    [photos],
  );

  useEffect(() => {
    return () => { photoPreviewUrls.forEach(url => URL.revokeObjectURL(url)); };
  }, [photoPreviewUrls]);

  const handleFileChange = useCallback((e) => {
    if (!e.target.files) return;
    const valid = Array.from(e.target.files).filter(f =>
      INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.acceptedFormats.includes(f.type) &&
      f.size <= INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxFileSize,
    );
    if (photos.length + valid.length <= MAX_PHOTOS) {
      setPhotos(p => [...p, ...valid]);
      setError('');
    }
    e.target.value = '';
  }, [photos.length, MAX_PHOTOS]);

  const removePhoto = useCallback((idx) => {
    setPhotos(p => p.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = () => {
    if (!selectedProject)          { setError('Select a project.'); return; }
    if (!location.trim() || location.trim().length < 3) { setError('Location is required.'); return; }
    if (photos.length < 1)        { setError('Add at least one photo.'); return; }

    onAdd({
      name: selectedProject.projectName,
      location: location.trim(),
      image: URL.createObjectURL(photos[0]),
      photoCount: photos.length,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl"
        style={{ backgroundColor: c.surface, border: `1px solid ${border}`, overflow: 'visible' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl" style={{ borderColor: border, backgroundColor: c.surface }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c.accent}15` }}>
              <ImageIcon className="w-4 h-4" style={{ color: c.accent }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: c.textPrimary }}>Add Install</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
            <X className="w-4 h-4" style={{ color: c.textSecondary }} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-hide" style={{ backgroundColor: c.surface, borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Project</label>
            <div className="relative" ref={projectDropdownRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.textSecondary }} />
              <input
                ref={searchRef}
                value={projectSearch}
                onFocus={() => setProjectOpen(true)}
                onChange={e => { setProjectSearch(e.target.value); setSelectedProject(null); setProjectOpen(true); setError(''); }}
                placeholder="Search customer or project..."
                className="w-full rounded-full pl-[34px] pr-4 text-sm outline-none"
                style={{ height: 40, backgroundColor: isDark ? c.background : c.surface, border: `1px solid ${isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)'}`, color: c.textPrimary }}
              />
              {projectOpen && filteredProjects.length > 0 && (
                <div className="absolute left-0 right-0 z-50 rounded-2xl border overflow-hidden"
                  style={{
                    top: 'calc(100% + 6px)',
                    backgroundColor: c.surface,
                    borderColor: isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 24px rgba(0,0,0,0.11)',
                  }}>
                  <div className="overflow-y-auto py-1" style={{ maxHeight: 216 }}>
                    {filteredProjects.map(proj => (
                      <button key={proj.id} type="button"
                        onMouseDown={e => { e.preventDefault(); handleSelectProject(proj); }}
                        onClick={() => handleSelectProject(proj)}
                        className="w-full text-left px-4 py-2.5 text-[0.8125rem] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.09] active:bg-black/[0.06]"
                        style={{ color: c.textPrimary }}>
                        <span className="font-medium" style={{ color: c.textSecondary }}>{proj.customerName}:</span>{' '}
                        <span className="font-semibold">{proj.projectName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {projectOpen && filteredProjects.length === 0 && projectSearch.trim() && (
                <div className="absolute left-0 right-0 z-50 rounded-2xl border overflow-hidden"
                  style={{
                    top: 'calc(100% + 6px)',
                    backgroundColor: c.surface,
                    borderColor: isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 24px rgba(0,0,0,0.11)',
                  }}>
                  <div className="px-4 py-3 text-[0.8125rem]" style={{ color: c.textSecondary }}>
                    No matching projects
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Location</label>
            <AutoCompleteCombobox
              value={location}
              onChange={(val) => { setLocation(val); setError(''); }}
              onSelect={(val) => { setLocation(val); setError(''); }}
              onAddNew={(val) => { setLocation(val.trim()); setError(''); }}
              options={CITY_OPTIONS}
              placeholder="Search city..."
              theme={theme}
              compact
              resetOnSelect={false}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.textSecondary, opacity: 0.7 }}>Photos</label>
              <span className="text-xs font-semibold tabular-nums" style={{ color: c.textSecondary, opacity: 0.6 }}>{photos.length}/{MAX_PHOTOS}</span>
            </div>
            {photos.length === 0 ? (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors"
                style={{ borderColor: border, backgroundColor: fieldBg, color: c.textSecondary }}>
                <Upload className="w-5 h-5" style={{ opacity: 0.5 }} />
                <span className="text-xs font-semibold" style={{ color: c.textPrimary }}>Add Photos</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photoPreviewUrls.map((url, idx) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(24,24,24,0.7)', color: '#fff' }}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
                    style={{ borderColor: border, color: c.textSecondary, backgroundColor: fieldBg }}>
                    <Plus className="w-4 h-4" />
                    <span className="text-[0.625rem] font-semibold">Add</span>
                  </button>
                )}
              </div>
            )}
            <input
              type="file" ref={fileInputRef} multiple className="hidden"
              accept={INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.acceptedFormats.join(',')}
              onChange={handleFileChange}
            />
          </div>

          {error && <p className="text-xs font-medium" style={{ color: JSI_COLORS.error }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}>
              Cancel
            </button>
            <button onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
              style={{ backgroundColor: c.accent, color: c.accentText }}>
              Add Install
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

export const ProjectsScreen = forwardRef(({
  onNavigate, theme, opportunities, setOpportunities,
  projectsInitialTab, clearProjectsInitialTab,
  projectsInitialStage, clearProjectsInitialStage,
  deepLinkOppId, members, currentUserId,
  setBackHandler, onAddInstall,
}, ref) => {
  const isDark = isDarkTheme(theme);
  const [projectsTab, setProjectsTab] = usePersistentState('pref.projects.activeTab', 'pipeline');
  const [selectedPipelineStage, setSelectedPipelineStage] = usePersistentState('pref.projects.pipelineStage', 'Discovery');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [customerType, setCustomerType] = usePersistentState('pref.projects.customerType', 'end-users');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddInstall, setShowAddInstall] = useState(false);
  const stagesScrollRef = useRef(null);
  const [showStageFadeLeft, setShowStageFadeLeft] = useState(false);
  const [showStageFadeRight, setShowStageFadeRight] = useState(false);

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

  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      if (selectedCustomer)    { setSelectedCustomer(null);    return true; }
      if (selectedOpportunity) { setSelectedOpportunity(null); return true; }
      return false;
    },
  }));

  useEffect(() => {
    if (selectedCustomer || selectedOpportunity) {
      setBackHandler?.(() => {
        if (selectedCustomer)    { setSelectedCustomer(null);    return true; }
        if (selectedOpportunity) { setSelectedOpportunity(null); return true; }
        return false;
      });
    } else {
      setBackHandler?.(null);
    }
    return () => setBackHandler?.(null);
  }, [selectedCustomer, selectedOpportunity, setBackHandler]);

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

  const filteredCustomers = useMemo(() => {
    if (customerType === 'dealers')       return customers.filter(c => c.type === 'dealer');
    if (customerType === 'design-firms')  return customers.filter(c => c.type === 'design-firm');
    return customers.filter(c => !c.type || c.type === 'end-user');
  }, [customers, customerType]);

  const ctaSingular = useMemo(
    () => CUSTOMER_TYPES.find(t => t.id === customerType)?.singular || 'Customer',
    [customerType],
  );
  const cta = useMemo(() => ({
    pipeline:      { label: 'Project',    action: () => onNavigate('new-lead') },
    customers:     { label: ctaSingular,  action: () => setShowAddCustomer(true) },
    'my-projects': { label: 'Install',    action: () => onNavigate('add-new-install') },
  })[projectsTab], [projectsTab, ctaSingular, onNavigate]);

  if (selectedCustomer) return (
    <CustomerMicrositeScreen
      customer={selectedCustomer}
      theme={theme}
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

      <div className="flex-shrink-0" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 12px)', backgroundColor: theme.colors.background }}>
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

      <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-40 max-w-5xl mx-auto w-full">
        <TabContent activeKey={projectsTab}>
          {projectsTab === 'pipeline' && (
            filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredOpportunities.map(opp => (
                  <ProjectCard key={opp.id} opp={opp} theme={theme}
                    onClick={() => { setSelectedOpportunity(opp); onNavigate(`projects/${opp.id}`); }} />
                ))}
              </div>
            ) : (
              <SharedEmptyState icon={Briefcase} theme={theme}
                title={`No projects in ${selectedPipelineStage}`}
                description='Tap "+ Project" to add one.' />
            )
          )}

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
              <SharedEmptyState icon={Briefcase} theme={theme}
                title="No installations recorded yet"
                description='Tap "+ Install" to add one.' />
            )
          )}
        </TabContent>
      </div>

      <FloatingActionCTA
        theme={theme}
        visible={projectsTab === 'pipeline' && filteredOpportunities.length > 0}
        icon={<Briefcase />}
        label={`${selectedPipelineStage} · ${filteredOpportunities.length} ${filteredOpportunities.length === 1 ? 'project' : 'projects'} · ${fmtCurrency(stageTotalValue)}`}
      />

      {showAddCustomer && (
        <AddCustomerModal
          theme={theme}
          onClose={() => setShowAddCustomer(false)}
          onAdd={handleAddCustomer}
          customerType={customerType}
          typeSingular={ctaSingular}
        />
      )}

      {showAddInstall && (
        <AddInstallModal
          theme={theme}
          onClose={() => setShowAddInstall(false)}
          onAdd={onAddInstall}
          customers={customers}
        />
      )}
    </div>
  );
});

ProjectsScreen.displayName = 'ProjectsScreen';

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

