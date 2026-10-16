import React, { useMemo, useState } from 'react';
import { Building2, ArrowUpRight, Search, Plus, X } from 'lucide-react';
import { STAGES } from '../../data.js';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { fmtCurrency } from './utils.js';
import { groupCustomerProjects, isOpenProject, matchesCompany, projectListValue } from './workspaceData.js';

const sumList = projects => projects.reduce((sum, project) => sum + projectListValue(project), 0);

export const ProjectsWorkspace = ({ theme, view, customers, opportunities, companyFilter, onClearCompany, initialStage, onClearInitialStage, onOpenProject, onOpenCustomer, onUpdateProject, onAddCustomer }) => {
  const c = theme.colors;
  const dark = isDarkTheme(theme);
  const [query, setQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [includeClosed, setIncludeClosed] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [lastMove, setLastMove] = useState(null);
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.09)';
  const surface = { backgroundColor: c.surface, border: `1px solid ${border}` };
  const subtle = dark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.035)';
  const inputStyle = { ...surface, color: c.textPrimary };
  const groups = useMemo(() => groupCustomerProjects(customers, opportunities), [customers, opportunities]);
  const normalizedQuery = query.trim().toLowerCase();
  const scopedGroups = groups.filter(group => !customerId || group.id === customerId).map(group => ({
    ...group,
    projects: group.projects.filter(project => matchesCompany(project, companyFilter) && (!normalizedQuery || [group.name, project.name, project.contact, ...(project.dealers || [])].some(value => String(value || '').toLowerCase().includes(normalizedQuery)))),
  })).filter(group => {
    if (group.projects.length) return true;
    return !companyFilter && (!normalizedQuery || group.name.toLowerCase().includes(normalizedQuery));
  });
  const scopedProjects = scopedGroups.flatMap(group => group.projects);
  const activeProjects = scopedProjects.filter(project => isOpenProject(project) && (!initialStage || project.stage === initialStage));
  const showClosed = includeClosed || ['Won', 'Lost'].includes(initialStage);
  const visibleGroups = scopedGroups;
  const allStages = [...STAGES, ...new Set(scopedProjects.map(project => project.stage || 'Unstaged').filter(stage => !STAGES.includes(stage)))];
  const visibleStages = initialStage && allStages.includes(initialStage) ? [initialStage] : allStages.filter(stage => showClosed || !['Won', 'Lost'].includes(stage));

  const moveProject = (project, stage) => {
    if (!STAGES.includes(stage) || project.stage === stage) return;
    onUpdateProject({ ...project, stage });
    setLastMove({ id: project.id, from: project.stage, to: stage });
    setAnnouncement(`${project.name} moved to ${stage}.`);
  };
  const undoMove = () => {
    const current = opportunities.find(project => project.id === lastMove?.id);
    if (current && current.stage === lastMove.to) {
      onUpdateProject({ ...current, stage: lastMove.from });
      setAnnouncement(`${current.name} moved back to ${lastMove.from}.`);
    }
    setLastMove(null);
  };
  const projectRow = (project, customerName, board = false) => (
    <div key={project.id} className={`min-w-0 ${board ? 'rounded-2xl p-3.5' : 'py-3 px-4 sm:px-5 flex flex-wrap items-center gap-3'}`} style={board ? surface : { borderTop: `1px solid ${border}` }}>
      <button type="button" onClick={() => onOpenProject(project.id)} className={`text-left focus-ring rounded-lg min-h-[44px] ${board ? 'w-full' : 'flex-1 min-w-[150px]'}`}>
        <span className="block font-semibold text-sm leading-snug">{project.name || 'Untitled project'}</span>
        <span className="block text-xs mt-1" style={{ color: c.textSecondary }}>{board ? customerName : project.contact || 'Contact TBD'}</span>
      </button>
      <div className={board ? 'flex justify-between items-center gap-2 mt-3 mb-2' : 'text-right'}>
        <span className="text-[11px] mr-1.5" style={{ color: c.textSecondary }}>List</span>
        <span className="text-sm font-semibold tabular-nums">{project.value == null || project.value === '' ? '—' : fmtCurrency(projectListValue(project))}</span>
      </div>
      {board && <p className="text-xs mb-3" style={{ color: c.textSecondary }}>PO: {project.poTimeframe || 'Not set'}</p>}
      <select aria-label={`Stage for ${project.name || 'Untitled project'}`} value={project.stage || ''} onChange={event => moveProject(project, event.target.value)}
        className={`rounded-xl text-xs font-medium px-3 min-h-[44px] focus-ring ${board ? 'w-full' : 'w-full sm:w-[165px]'}`} style={inputStyle}>
        {!STAGES.includes(project.stage) && <option value={project.stage || ''}>{project.stage || 'Choose stage'}</option>}
        {STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[['Active projects', activeProjects.length], ['Active list value', fmtCurrency(sumList(activeProjects))], ['Customers in view', scopedGroups.length]].map(([label, value]) => (
          <div key={label} className="rounded-2xl p-3 sm:px-5 sm:py-4" style={{ backgroundColor: subtle }}>
            <p className="text-lg sm:text-2xl font-semibold tracking-tight tabular-nums break-words">{value}</p>
            <p className="text-[10px] sm:text-xs mt-1" style={{ color: c.textSecondary }}>{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-3 flex flex-wrap items-center gap-3" style={surface}>
        <div className="flex items-center gap-2 flex-1 min-w-[180px] px-2">
          <Search size={16} aria-hidden="true" style={{ color: c.textSecondary }} />
          <input aria-label="Search customers and projects" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search customers or projects" className="bg-transparent min-h-[44px] text-sm w-full min-w-0 outline-none focus:ring-2 rounded-lg" />
        </div>
        <select aria-label="Filter by customer" value={customerId} onChange={event => setCustomerId(event.target.value)} className="rounded-xl px-3 min-h-[44px] text-sm w-full sm:w-56 focus-ring" style={inputStyle}>
          <option value="">All customers</option>
          {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
        <label className="flex items-center gap-2 min-h-[44px] text-xs cursor-pointer px-2">
          <input type="checkbox" checked={showClosed} disabled={['Won', 'Lost'].includes(initialStage)} onChange={event => setIncludeClosed(event.target.checked)} />Show closed
        </label>
      </div>
      {(companyFilter || initialStage) && <div className="flex flex-wrap gap-2">
        {companyFilter && <button type="button" onClick={onClearCompany} className="inline-flex items-center gap-2 rounded-full px-3 min-h-[44px] text-xs focus-ring" style={surface}>{companyFilter}<X size={14} /><span className="sr-only">Clear company filter</span></button>}
        {initialStage && <button type="button" onClick={onClearInitialStage} className="inline-flex items-center gap-2 rounded-full px-3 min-h-[44px] text-xs focus-ring" style={surface}>{initialStage}<X size={14} /><span className="sr-only">Show all stages</span></button>}
      </div>}
      <div className="flex items-center justify-between gap-3 min-h-[24px] text-xs" style={{ color: c.textSecondary }}>
        <p>{view === 'pipeline' ? 'Change a stage directly on any project.' : 'Open a project, or explore its customer workspace.'}</p>
        {view === 'customers' && <button type="button" onClick={onAddCustomer} className="inline-flex items-center gap-1 min-h-[44px] whitespace-nowrap focus-ring rounded-lg"><Plus size={14} />Add customer</button>}
      </div>
      <div aria-live="polite" className={announcement ? 'text-xs flex flex-wrap items-center gap-3' : 'sr-only'}>
        {announcement}
        {lastMove && opportunities.some(project => project.id === lastMove.id && project.stage === lastMove.to) && <button type="button" onClick={undoMove} className="underline min-h-[44px] px-2 focus-ring rounded-lg">Undo stage change</button>}
      </div>
      {view === 'pipeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
          {visibleStages.map(stage => {
            const projects = scopedProjects.filter(project => (project.stage || 'Unstaged') === stage);
            return <section key={stage} aria-label={`${stage} pipeline`} className="rounded-2xl p-3 min-w-0" style={{ backgroundColor: subtle }}>
              <div className="flex items-start justify-between gap-2 px-1 pt-1 pb-4">
                <div><h2 className="text-sm font-semibold">{stage}</h2><p className="text-xs mt-1" style={{ color: c.textSecondary }}>{fmtCurrency(sumList(projects))} list</p></div>
                <span className="text-xs rounded-full px-2 py-1" style={surface}>{projects.length}</span>
              </div>
              <div className="space-y-3">{projects.map(project => projectRow(project, groups.find(group => group.projects.some(item => item.id === project.id))?.name, true))}</div>
              {!projects.length && <p className="text-xs py-8 text-center" style={{ color: c.textSecondary }}>No projects</p>}
            </section>;
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleGroups.map(group => {
            const open = group.projects.filter(isOpenProject);
            const visible = group.projects.filter(project => (showClosed || isOpenProject(project)) && (!initialStage || project.stage === initialStage));
            const customer = group.customer;
            return <section key={group.id} aria-label={`${group.name} projects`} className="rounded-2xl overflow-hidden" style={surface}>
              <div className="p-4 sm:p-5 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="rounded-xl p-3" style={{ backgroundColor: subtle }}><Building2 size={20} style={{ color: c.textSecondary }} /></div>
                  <div className="min-w-0"><h2 className="font-semibold text-base">{group.name}</h2>
                    <p className="text-xs mt-1" style={{ color: c.textSecondary }}>{customer ? [customer.location?.city, customer.location?.state, customer.vertical].filter(Boolean).join(' · ') : 'Customer profile not linked'}</p>
                    <p className="text-xs mt-2" style={{ color: c.textSecondary }}>{open.length} active · {fmtCurrency(sumList(open))} list{customer ? ` · ${(customer.standardsPrograms || []).filter(item => ['Active', 'Expiring'].includes(item.status)).length} standards · ${(customer.orders?.current || []).length} current orders` : ''}</p>
                  </div>
                </div>
                {customer && <button type="button" onClick={() => onOpenCustomer(customer)} className="inline-flex items-center gap-1.5 text-xs min-h-[44px] px-3 rounded-full focus-ring" style={{ backgroundColor: subtle }}>Customer workspace<ArrowUpRight size={14} /></button>}
              </div>
              {visible.map(project => projectRow(project, group.name))}
              {!visible.length && <p className="text-xs px-5 py-4" style={{ borderTop: `1px solid ${border}`, color: c.textSecondary }}>{group.projects.length ? 'No projects match the current stage or status filters.' : 'No projects linked yet. Customer standards, orders and materials are in the workspace.'}</p>}
            </section>;
          })}
          {!visibleGroups.length && <div className="rounded-2xl p-8 text-center" style={surface}><h2 className="font-semibold">No matching customers or projects</h2><p className="text-sm mt-2" style={{ color: c.textSecondary }}>Try a different search or clear your filters.</p></div>}
        </div>
      )}
      <p className="text-[11px] leading-relaxed pt-2" style={{ color: c.textSecondary }}>Prototype workspace · Project changes save in this browser. Customer profiles use sample data. No HubSpot updates are sent. Values are estimated list, not net; active totals exclude Won and Lost.</p>
    </div>
  );
};
