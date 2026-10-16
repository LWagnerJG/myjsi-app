import { describe, expect, it } from 'vitest';
import { readWorkspaceRoute, workspaceNavigationPath } from './workspaceRoutes.js';

describe('workspace URLs', () => {
  it('uses explicit, shareable URLs for each view', () => {
    expect(workspaceNavigationPath('projects')).toBe('/projects');
    expect(workspaceNavigationPath('projects', { tab: 'pipeline' })).toBe('/active-projects');
    expect(workspaceNavigationPath('active-projects')).toBe('/active-projects');
    expect(workspaceNavigationPath('projects', { tab: 'my-projects' })).toBe('/projects?view=installations');
  });

  it('round-trips legacy navigation filters, including special characters', () => {
    const path = workspaceNavigationPath('projects', { tab: 'pipeline', company: 'A&D / Workplace', stage: 'PO Expected' });
    const url = new URL(path, 'https://example.com');
    expect(url.pathname).toBe('/active-projects');
    expect(readWorkspaceRoute(url.pathname, url.search)).toEqual({ tab: 'pipeline', company: 'A&D / Workplace', stage: 'PO Expected' });
  });

  it('defaults the existing projects root to Customers and recognizes installations', () => {
    expect(readWorkspaceRoute('/projects/')).toEqual({ tab: 'customers', company: null, stage: '' });
    expect(readWorkspaceRoute('/projects', '?view=installations').tab).toBe('my-projects');
    expect(readWorkspaceRoute('/projects', '?view=unknown').tab).toBe('customers');
    expect(readWorkspaceRoute('/active-projects', '?view=installations').tab).toBe('pipeline');
  });

  it('does not rewrite existing project details or unrelated routes', () => {
    for (const screen of ['projects/123', 'resources/dealer-directory/456', 'orders/789', 'sales']) {
      expect(workspaceNavigationPath(screen, { tab: 'pipeline' })).toBeNull();
      expect(readWorkspaceRoute(`/${screen}`)).toBeNull();
    }
  });
});
