import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { ProjectsWorkspace } from './ProjectsWorkspace.jsx';
import { lightTheme } from '../../../../data/theme/themeData.js';
import { groupCustomerProjects, isOpenProject, matchesCompany, projectListValue } from './workspaceData.js';

const customers = [{ id: 'a', name: 'Acme', location: { city: 'Jasper', state: 'IN' }, standardsPrograms: [{ status: 'Active' }], orders: { current: [{}] } }, { id: 'b', name: 'Empty customer' }];
const projects = [
  { id: 1, name: 'Office refresh', company: 'Acme', customerId: 'a', stage: 'Discovery', value: '$10,000', dealers: ['RJE'] },
  { id: 2, name: 'Closed project', customerId: 'a', stage: 'Won', value: '$90,000' },
  { id: 3, name: 'Unlinked work', company: 'Unlinked company', stage: 'Specifying', value: 2000 },
  { id: 4, name: 'No customer', stage: 'Lost', value: 2000 },
];
const Harness = ({ view = 'customers', initial = projects, initialStage, onOpenProject = vi.fn(), onOpenCustomer = vi.fn() }) => {
  const [opportunities, setOpportunities] = useState(initial);
  return <ProjectsWorkspace theme={lightTheme} view={view} initialStage={initialStage} customers={customers} opportunities={opportunities} onOpenProject={onOpenProject} onOpenCustomer={onOpenCustomer} onUpdateProject={updated => setOpportunities(prev => prev.map(project => project.id === updated.id ? updated : project))} onAddCustomer={vi.fn()} />;
};
afterEach(cleanup);

describe('customer project grouping', () => {
  it('retains empty customers and gives unlinked projects their own named groups', () => {
    const groups = groupCustomerProjects(customers, projects);
    expect(groups.find(group => group.id === 'a').projects).toHaveLength(2);
    expect(groups.find(group => group.id === 'b').projects).toHaveLength(0);
    expect(groups.find(group => group.name === 'Unlinked company').projects).toHaveLength(1);
    expect(groups.find(group => group.name === 'Customer TBD').projects).toHaveLength(1);
  });
  it('excludes closed from active totals and does not interpret missing values as net', () => {
    expect(projects.filter(isOpenProject).reduce((sum, project) => sum + projectListValue(project), 0)).toBe(12000);
    expect(projectListValue({ value: 'TBD' })).toBe(0);
    expect(projectListValue({ value: -100 })).toBe(0);
  });
  it('does not match an empty dealer against a company filter', () => {
    expect(matchesCompany({ dealers: [''], company: '' }, 'Business Furniture')).toBe(false);
    expect(matchesCompany({ dealers: ['Business Furniture LLC'] }, 'Business Furniture')).toBe(true);
  });
});

describe('ProjectsWorkspace', () => {
  it('shows customer context and excludes closed projects by default', () => {
    render(<Harness />);
    expect(screen.getByText('$12,000')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Acme projects' })).toHaveTextContent('1 standards · 1 current orders');
    expect(screen.queryByRole('button', { name: /Closed project/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show closed' }));
    expect(screen.getByRole('button', { name: /Closed project/ })).toBeInTheDocument();
  });
  it('filters by customer and finds empty customer profiles by name', () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by customer' }), { target: { value: 'a' } });
    expect(screen.queryByRole('button', { name: /Unlinked work/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by customer' }), { target: { value: '' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search customers and projects' }), { target: { value: 'Empty customer' } });
    expect(screen.getByRole('region', { name: 'Empty customer projects' })).toBeInTheDocument();
  });
  it('changes stages from an accessible select and can undo', () => {
    render(<Harness view="pipeline" />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Stage for Office refresh' }), { target: { value: 'PO Expected' } });
    expect(within(screen.getByRole('region', { name: 'PO Expected pipeline' })).getByRole('button', { name: /Office refresh/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo stage change' }));
    expect(within(screen.getByRole('region', { name: 'Discovery pipeline' })).getByRole('button', { name: /Office refresh/ })).toBeInTheDocument();
  });
  it('moving a project to Won updates active totals without losing it', () => {
    render(<Harness view="pipeline" />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Stage for Office refresh' }), { target: { value: 'Won' } });
    expect(screen.queryByText('$12,000')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show closed' }));
    expect(within(screen.getByRole('region', { name: 'Won pipeline' })).getByRole('button', { name: /Office refresh/ })).toBeInTheDocument();
  });
  it('keeps unknown stages visible in pipeline', () => {
    render(<Harness view="pipeline" initial={[{ id: 99, name: 'Legacy work', company: 'Acme', stage: 'Custom stage', value: 500 }]} />);
    expect(within(screen.getByRole('region', { name: 'Custom stage pipeline' })).getByRole('button', { name: /Legacy work/ })).toBeInTheDocument();
  });
  it('honors an explicit closed stage in customer view', () => {
    render(<Harness initialStage="Won" />);
    expect(screen.getByRole('button', { name: /Closed project/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Show closed' })).toBeChecked();
    expect(screen.queryByRole('button', { name: /Office refresh/ })).not.toBeInTheDocument();
  });
  it('keeps customer and project navigation separate', () => {
    const onOpenProject = vi.fn(); const onOpenCustomer = vi.fn();
    render(<Harness onOpenProject={onOpenProject} onOpenCustomer={onOpenCustomer} />);
    fireEvent.click(screen.getByRole('button', { name: /Office refresh/ }));
    expect(onOpenProject).toHaveBeenCalledWith(1);
    fireEvent.click(within(screen.getByRole('region', { name: 'Acme projects' })).getByRole('button', { name: 'Customer workspace' }));
    expect(onOpenCustomer).toHaveBeenCalledWith(customers[0]);
  });
});
