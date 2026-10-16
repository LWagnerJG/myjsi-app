import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, ArrowUpRight, Plus, X } from 'lucide-react';
import { ProjectBoard } from './ProjectBoard.jsx';
import { WorkspaceSpotlight } from './WorkspaceSpotlight.jsx';
import { STAGES } from '../../data.js';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { fmtCurrency } from './utils.js';
import { groupCustomerProjects, isOpenProject, matchesCompany, projectListValue, matchesCustomerQuery, matchesWorkspaceQuery } from './workspaceData.js';

const sumList = projects => projects.reduce((sum, project) => sum + projectListValue(project), 0);

export const ProjectsWorkspace = ({ theme, view, customers, opportunities, companyFilter, onClearCompany, onClearFilters, initialStage, onClearInitialStage, onOpenProject, onOpenCustomer, onUpdateProject, onAddCustomer }) => {
  const c = theme.colors;
  const dark = isDarkTheme(theme);
  const [query, setQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [showDirectory, setShowDirectory] = useState(false);
  const [includeClosed, setIncludeClosed] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [lastMove, setLastMove] = useState(null);
  const undoButtonRef = useRef(null);
  useEffect(() => {
    if (lastMove?.focusUndo) undoButtonRef.current?.focus();
  }, [lastMove]);
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.09)';
  const surface = { backgroundColor: c.surface, border: `1px solid ${border}` };
  const subtle = dark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.035)';
  const inputStyle = { ...surface, color: c.textPrimary };
  const groups = useMemo(() => groupCustomerProjects(customers, opportunities), [customers, opportunities]);
  const normalizedQuery = query.trim().toLowerCase();
  const scopedGroups = groups.filter(group => !customerId || group.id === customerId).map(group => ({
    ...group,
    projects: group.projects.filter(project => matchesCompany(project, companyFilter) && (!normalizedQuery || matchesWorkspaceQuery(project, group, normalizedQuery))),
  })).filter(group => {
    if (group.projects.length) return true;
    return !companyFilter && (!normalizedQuery || matchesCustomerQuery(group, normalizedQuery));
  });
  const scopedProjects = scopedGroups.flatMap(group => group.projects);
  const activeProjects = scopedProjects.filter(project => isOpenProject(project) && (!initialStage || project.stage === initialStage));
  const showClosed = includeClosed || ['Won', 'Lost'].includes(initialStage);
  const hasFilter = Boolean(customerId || normalizedQuery || companyFilter || initialStage);
  const visibleGroups = scopedGroups.filter(group => hasFilter || group.projects.some(project => showClosed || isOpenProject(project)));
  const otherGroups = hasFilter ? [] : scopedGroups.filter(group => !visibleGroups.includes(group));
  const allStages = [...STAGES, ...new Set(scopedProjects.map(project => project.stage || 'Unstaged').filter(stage => !STAGES.includes(stage)))];
  const visibleStages = initialStage && allStages.includes(initialStage) ? [initialStage] : allStages.filter(stage => showClosed || !['Won', 'Lost'].includes(stage));

  const moveProject = (project, stage, options = {}) => {
    if (!STAGES.includes(stage) || project.stage === stage) return;
    onUpdateProject({ ...project, stage });
    setLastMove({ id: project.id, from: project.stage, to: stage, focusUndo: options.focusUndo && !showClosed && ['Won', 'Lost'].includes(stage) });
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
    <div key={project.id} className={`min-w-0 ${board ? 'rounded-2xl p-3.5' : 'py-3 px-4 sm:px-5 flex flex-wrap items-center gap-3'}`} style={board ? undefined : { borderTop: `1px solid ${border}` }}>
      <button type="button" onClick={() => onOpenProject(project.id)} className={`text-left focus-ring rounded-lg min-h-[44px] ${board ? 'w-full pr-7' : 'flex-1 min-w-[150px]'}`}>
        <span className="block font-semibold text-sm leading-snug">{project.name || 'Untitled project'}</span>
        <span className="block text-xs mt-1" style={{ color: c.textSecondary }}>{board ? customerName : project.contact || 'Contact TBD'}</span>
      </button>
      <div className={board ? 'flex justify-between items-center gap-2 mt-3 mb-2' : 'text-right'}>
        <span className="text-[11px] mr-1.5" style={{ color: c.textSecondary }}>List</span>
        <span className="text-sm font-semibold tabular-nums">{project.value == null || project.value === '' ? '—' : fmtCurrency(projectListValue(project))}</span>
      </div>
      {board && <p className="text-xs mb-3" style={{ color: c.textSecondary }}>PO: {project.poTimeframe || 'Not set'}</p>}
      <select aria-label={`Stage for ${project.name || 'Untitled project'}`} value={project.stage || ''} onChange={event => moveProject(project, event.target.value, { focusUndo: true })}
        className={`rounded-xl text-xs font-medium px-3 min-h-[44px] focus-ring ${board ? 'w-full' : 'w-full sm:w-[165px]'}`} style={inputStyle}>
        {!STAGES.includes(project.stage) && <option value={project.stage || ''}>{project.stage || 'Choose stage'}</option>}
        {STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div aria-label="Project summary" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs tabular-nums" style={{ color: c.textSecondary }}>
        <span><span className="font-medium" style={{ color: c.textPrimary }}>{activeProjects.length}</span> active projects</span>
        <span><span className="font-medium" style={{ color: c.textPrimary }}>{fmtCurrency(sumList(activeProjects))}</span> active list</span>
        <span><span className="font-medium" style={{ color: c.textPrimary }}>{scopedGroups.length}</span> customers</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:flex-1 sm:min-w-[220px]"><WorkspaceSpotlight theme={theme} groups={groups} onOpenProject={onOpenProject} onOpenCustomer={onOpenCustomer} onFilter={value => { setQuery(value); setCustomerId(''); if (onClearFilters) onClearFilters(); else { onClearCompany?.(); onClearInitialStage?.(); } setIncludeClosed(true); }} /></div>
        <select aria-label="Filter by customer" value={customerId} onChange={event => setCustomerId(event.target.value)} className="rounded-xl px-3 min-h-[44px] text-sm flex-1 sm:flex-none sm:w-48 focus-ring" style={inputStyle}>
          <option value="">All customers</option>
          {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
        <label className="flex items-center gap-2 min-h-[44px] text-xs cursor-pointer px-2">
          <input type="checkbox" checked={showClosed} disabled={['Won', 'Lost'].includes(initialStage)} onChange={event => setIncludeClosed(event.target.checked)} />Show closed
        </label>
      </div>
      {(companyFilter || initialStage || query) && <div className="flex flex-wrap gap-2">
        {query && <button type="button" onClick={() => setQuery('')} className="inline-flex items-center gap-2 rounded-full px-3 min-h-[44px] text-xs focus-ring" style={surface}>Search: {query}<X size={14} /><span className="sr-only">Clear search</span></button>}
        {companyFilter && <button type="button" onClick={onClearCompany} className="inline-flex items-center gap-2 rounded-full px-3 min-h-[44px] text-xs focus-ring" style={surface}>{companyFilter}<X size={14} /><span className="sr-only">Clear company filter</span></button>}
        {initialStage && <button type="button" onClick={onClearInitialStage} className="inline-flex items-center gap-2 rounded-full px-3 min-h-[44px] text-xs focus-ring" style={surface}>{initialStage}<X size={14} /><span className="sr-only">Show all stages</span></button>}
      </div>}
      {view === 'customers' && <div className="flex justify-end"><button type="button" onClick={onAddCustomer} className="inline-flex items-center gap-1 min-h-[44px] text-xs focus-ring rounded-lg" style={{ color: c.textSecondary }}><Plus size={14} />Add customer</button></div>}
      <div aria-live="polite" className={announcement ? 'text-xs flex flex-wrap items-center gap-3' : 'sr-only'}>
        {announcement}
        {lastMove && opportunities.some(project => project.id === lastMove.id && project.stage === lastMove.to) && <button ref={undoButtonRef} type="button" onClick={undoMove} className="underline min-h-[44px] px-2 focus-ring rounded-lg">Undo stage change</button>}
      </div>
      {view === 'pipeline' ? (
        <ProjectBoard stages={visibleStages} projects={scopedProjects} groups={groups} showClosed={showClosed} surface={surface} subtle={subtle} secondary={c.textSecondary} renderProject={projectRow} onMove={moveProject} />
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
          {!!otherGroups.length && <div className="rounded-2xl overflow-hidden" style={surface}>
            <button type="button" onClick={() => setShowDirectory(value => !value)} aria-expanded={showDirectory} aria-controls="other-customers-directory" className="w-full min-h-[52px] px-5 flex items-center justify-between text-sm text-left focus-ring">
              <span>Other customers <span className="ml-1 text-xs" style={{ color: c.textSecondary }}>{otherGroups.length}</span></span><span className="text-xs" style={{ color: c.textSecondary }}>{showDirectory ? 'Hide' : 'Browse'}</span>
            </button>
            {showDirectory && <div id="other-customers-directory" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1 p-2" style={{ borderTop: `1px solid ${border}` }}>{otherGroups.map(group => <button key={group.id} type="button" onClick={() => group.customer ? onOpenCustomer(group.customer) : (setCustomerId(group.id), setIncludeClosed(true))} className="min-h-[52px] flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left focus-ring" style={{ color: c.textSecondary }}><span className="text-sm">{group.name}</span><ArrowUpRight size={14} className="shrink-0" /></button>)}</div>}
          </div>}
          {!visibleGroups.length && !otherGroups.length && <div className="rounded-2xl p-8 text-center" style={surface}><h2 className="font-semibold">No matching customers or projects</h2><p className="text-sm mt-2" style={{ color: c.textSecondary }}>Try a different search or clear your filters.</p></div>}
        </div>
      )}
      <p className="text-[11px] leading-relaxed pt-2" style={{ color: c.textSecondary }}>Prototype · Project changes saved in this browser · Sample customer data · List estimates, not net · No HubSpot updates</p>
    </div>
  );
};
