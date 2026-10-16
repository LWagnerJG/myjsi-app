import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import { INITIAL_OPPORTUNITIES } from './screens/projects/data.js';
import { allApps } from './constants/apps.js';

vi.mock('./hooks/useCompanyResource.js', () => ({ useCompanyResource: () => ({ isLive: false }) }));
vi.mock('./screens/projects/data.js', async importOriginal => {
  const original = await importOriginal();
  return { ...original, INITIAL_OPPORTUNITIES: original.INITIAL_OPPORTUNITIES.slice(0, 1), MY_PROJECTS_DATA: [] };
});
vi.mock('./screens/projects/customers/customerData.js', async importOriginal => {
  const original = await importOriginal();
  return { ...original, MOCK_CUSTOMERS: original.MOCK_CUSTOMERS.slice(0, 1), getAllProjectsWithMeta: () => [] };
});
vi.mock('./config/screenMap.js', () => ({
  SCREEN_MAP: {
    home: ({ onNavigate }) => <button onClick={() => onNavigate('projects', { tab: 'pipeline', company: 'A&D Workplace', stage: 'PO Expected' })}>Open filtered projects</button>,
  },
  ProductComparisonScreen: () => null,
  CompetitiveAnalysisScreen: () => null,
  SalesScreen: () => null,
  SamplesScreen: () => null,
}));
vi.mock('./screens/projects/components/projects/ProjectsWorkspace.jsx', () => ({
  ProjectsWorkspace: ({ view, companyFilter, initialStage, opportunities, customers, onOpenProject, onOpenCustomer, onClearCompany, onClearInitialStage, onClearFilters }) => {
    const [query, setQuery] = React.useState('');
    return (
    <section aria-label="Workspace content">
      <input aria-label="Local workspace search" value={query} onChange={event => setQuery(event.target.value)} />
      <div data-testid="workspace-view">{view}</div>
      <div data-testid="company-filter">{companyFilter || 'All companies'}</div>
      <div data-testid="stage-filter">{initialStage || 'All stages'}</div>
      <button onClick={() => onOpenProject(opportunities[0].id)}>Open first project</button>
      <button onClick={() => onOpenCustomer(customers[0])}>Open first customer</button>
      <button onClick={onClearCompany}>Clear company</button>
      <button onClick={onClearInitialStage}>Clear stage</button>
      <button onClick={onClearFilters}>Clear filters</button>
    </section>
    );
  },
}));
vi.mock('./screens/projects/components/projects/OpportunityDetail.jsx', () => ({
  OpportunityDetail: ({ opp, onDone, onOpenCustomer, customers }) => (
    <section aria-label="Project detail">
      <h1>{opp.name}</h1>
      <button onClick={onDone}>Done with project</button>
      <button onClick={() => onOpenCustomer(customers[0])}>Open project customer</button>
    </section>
  ),
}));
vi.mock('./screens/projects/customers/CustomerMicrositeScreen.jsx', () => ({
  CustomerMicrositeScreen: ({ customer }) => <section aria-label="Customer detail">{customer.name}</section>,
}));

const routers = [];
function renderRoute(path) {
  const router = createMemoryRouter([{ path: '*', element: <App /> }], { initialEntries: [path] });
  routers.push(router);
  const rendered = render(<RouterProvider router={router} />);
  return { router, ...rendered };
}
const currentUrl = router => `${router.state.location.pathname}${router.state.location.search}`;

beforeAll(async () => { await import('./screens/projects/ProjectsScreen.jsx'); });
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  routers.splice(0).forEach(router => router.dispose());
});

describe('MyWorkspace routing', () => {
  it('opens /active-projects directly, regardless of a saved tab or stage', async () => {
    localStorage.setItem('app:pref.projects.activeTab:v1', JSON.stringify('my-projects'));
    localStorage.setItem('app:pref.projects.pipelineStage:v1', JSON.stringify('Lost'));
    renderRoute('/active-projects');
    expect(await screen.findByRole('heading', { name: 'MyWorkspace' })).toBeInTheDocument();
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('pipeline');
    expect(screen.getByTestId('stage-filter')).toHaveTextContent('All stages');
    expect(screen.getByText('MyWorkspace screen')).toBeInTheDocument();
    expect(allApps.find(app => app.route === 'projects').name).toBe('MyWorkspace');
  });

  it('opens the legacy /projects root as Customers even after visiting Active Projects', async () => {
    localStorage.setItem('app:pref.projects.activeTab:v1', JSON.stringify('pipeline'));
    renderRoute('/projects');
    expect(await screen.findByTestId('workspace-view')).toHaveTextContent('customers');
  });

  it('updates the URL for tabs and restores each view through back, forward, and refresh', async () => {
    const { router, unmount } = renderRoute('/projects');
    await screen.findByTestId('workspace-view');
    fireEvent.click(screen.getByRole('button', { name: 'Active Projects' }));
    await waitFor(() => expect(currentUrl(router)).toBe('/active-projects'));
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('pipeline');
    fireEvent.click(screen.getByRole('button', { name: 'Installations' }));
    await waitFor(() => expect(currentUrl(router)).toBe('/projects?view=installations'));
    expect(screen.getByRole('button', { name: 'Add installation' })).toBeInTheDocument();

    await act(() => router.navigate(-1));
    expect(currentUrl(router)).toBe('/active-projects');
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('pipeline');
    await act(() => router.navigate(-1));
    expect(currentUrl(router)).toBe('/projects');
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('customers');
    await act(() => router.navigate(1));
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('pipeline');

    const sharedUrl = currentUrl(router);
    unmount();
    renderRoute(sharedUrl);
    expect(await screen.findByTestId('workspace-view')).toHaveTextContent('pipeline');
  });

  it('loads the installations URL directly and returns to the Customers URL', async () => {
    const { router } = renderRoute('/projects?view=installations');
    await screen.findByRole('button', { name: 'Add installation' });
    fireEvent.click(screen.getByRole('button', { name: 'Customers' }));
    await waitFor(() => expect(currentUrl(router)).toBe('/projects'));
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('customers');
  });

  it('preserves local workspace state while switching between Customers and Active Projects', async () => {
    renderRoute('/projects');
    fireEvent.change(await screen.findByRole('textbox', { name: 'Local workspace search' }), { target: { value: 'Acme workspace search' } });
    fireEvent.click(screen.getByRole('button', { name: 'Active Projects' }));
    await waitFor(() => expect(screen.getByTestId('workspace-view')).toHaveTextContent('pipeline'));
    expect(screen.getByRole('textbox', { name: 'Local workspace search' })).toHaveValue('Acme workspace search');
    fireEvent.click(screen.getByRole('button', { name: 'Customers' }));
    await waitFor(() => expect(screen.getByTestId('workspace-view')).toHaveTextContent('customers'));
    expect(screen.getByRole('textbox', { name: 'Local workspace search' })).toHaveValue('Acme workspace search');
  });

  it('closes customer drill-ins on browser history changes without changing local header back behavior', async () => {
    const { router } = renderRoute('/projects');
    fireEvent.click(await screen.findByRole('button', { name: 'Active Projects' }));
    await waitFor(() => expect(currentUrl(router)).toBe('/active-projects'));
    fireEvent.click(screen.getByRole('button', { name: 'Open first customer' }));
    expect(screen.getByRole('region', { name: 'Customer detail' })).toBeInTheDocument();

    await act(() => router.navigate(-1));
    expect(currentUrl(router)).toBe('/projects');
    expect(screen.queryByRole('region', { name: 'Customer detail' })).not.toBeInTheDocument();
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('customers');
    fireEvent.click(screen.getByRole('button', { name: 'Open first customer' }));
    expect(screen.getByRole('region', { name: 'Customer detail' })).toBeInTheDocument();
    await act(() => router.navigate(1));
    expect(currentUrl(router)).toBe('/active-projects');
    expect(screen.queryByRole('region', { name: 'Customer detail' })).not.toBeInTheDocument();
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('pipeline');

    fireEvent.click(screen.getByRole('button', { name: 'Open first customer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(currentUrl(router)).toBe('/active-projects');
    expect(screen.queryByRole('region', { name: 'Customer detail' })).not.toBeInTheDocument();
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('pipeline');
  });

  it('preserves company and stage from legacy navigation through refresh and history', async () => {
    const { router, unmount } = renderRoute('/');
    fireEvent.click(await screen.findByRole('button', { name: 'Open filtered projects' }));
    await screen.findByTestId('workspace-view');
    expect(currentUrl(router)).toBe('/active-projects?company=A%26D+Workplace&stage=PO+Expected');
    expect(screen.getByTestId('company-filter')).toHaveTextContent('A&D Workplace');
    expect(screen.getByTestId('stage-filter')).toHaveTextContent('PO Expected');
    const sharedUrl = currentUrl(router);
    fireEvent.click(screen.getByRole('button', { name: 'Clear company' }));
    await waitFor(() => expect(currentUrl(router)).toBe('/active-projects?stage=PO+Expected'));
    fireEvent.click(screen.getByRole('button', { name: 'Clear stage' }));
    await waitFor(() => expect(currentUrl(router)).toBe('/active-projects'));
    await act(() => router.navigate(-1));
    expect(screen.getByTestId('stage-filter')).toHaveTextContent('PO Expected');
    await act(() => router.navigate(-1));
    expect(screen.getByTestId('company-filter')).toHaveTextContent('A&D Workplace');
    unmount();
    const refreshed = renderRoute(sharedUrl);
    expect(await screen.findByTestId('company-filter')).toHaveTextContent('A&D Workplace');
    expect(screen.getByTestId('stage-filter')).toHaveTextContent('PO Expected');
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => expect(currentUrl(refreshed.router)).toBe('/active-projects'));
    expect(screen.getByTestId('company-filter')).toHaveTextContent('All companies');
    expect(screen.getByTestId('stage-filter')).toHaveTextContent('All stages');
  });

  it('preserves /projects/:id, customer drill-ins, global back, and return to Active Projects', async () => {
    const { router } = renderRoute('/active-projects');
    fireEvent.click(await screen.findByRole('button', { name: 'Open first project' }));
    await screen.findByRole('region', { name: 'Project detail' });
    expect(currentUrl(router)).toBe(`/projects/${INITIAL_OPPORTUNITIES[0].id}`);
    fireEvent.click(screen.getByRole('button', { name: 'Open project customer' }));
    expect(screen.getByRole('region', { name: 'Customer detail' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(screen.getByRole('region', { name: 'Project detail' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Done with project' }));
    await waitFor(() => expect(currentUrl(router)).toBe('/active-projects'));
    expect(screen.getByTestId('workspace-view')).toHaveTextContent('pipeline');
  });

  it('loads an existing project detail URL directly', async () => {
    renderRoute(`/projects/${INITIAL_OPPORTUNITIES[0].id}`);
    expect(await screen.findByRole('region', { name: 'Project detail' })).toHaveTextContent(INITIAL_OPPORTUNITIES[0].name);
  });
});
