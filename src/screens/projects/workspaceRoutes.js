// Workspace views are URL state, so a shared link does not depend on saved tabs.
export function readWorkspaceRoute(pathname, search = '') {
  const path = pathname.replace(/^\/+|\/+$/g, '');
  if (path !== 'projects' && path !== 'active-projects') return null;

  const query = new URLSearchParams(search);
  return {
    tab: path === 'active-projects' ? 'pipeline' : query.get('view') === 'installations' ? 'my-projects' : 'customers',
    company: query.get('company') || null,
    stage: query.get('stage') || '',
  };
}

// Preserve existing onNavigate('projects', { tab, company, stage }) callers.
export function workspaceNavigationPath(screen, params = {}) {
  if (screen !== 'projects' && screen !== 'active-projects') return null;

  const tab = screen === 'active-projects' ? 'pipeline' : params?.tab;
  const path = tab === 'pipeline' ? '/active-projects' : '/projects';
  const query = new URLSearchParams();
  if (tab === 'my-projects') query.set('view', 'installations');
  if (params?.company) query.set('company', params.company);
  if (params?.stage) query.set('stage', params.stage);
  const search = query.toString();
  return `${path}${search ? `?${search}` : ''}`;
}
