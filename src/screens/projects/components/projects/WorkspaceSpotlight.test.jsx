import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { WorkspaceSpotlight } from './WorkspaceSpotlight.jsx';
import { lightTheme } from '../../../../data/theme/themeData.js';

const customer = { id: 'acme', name: 'Acme', location: { city: 'Jasper', state: 'IN' }, contacts: [{ id: 'c1', name: 'Linda Torres', email: 'linda@acme.test', role: 'Facilities Director' }] };
const emptyCustomer = { id: 'empty', name: 'Empty customer', contacts: [{ name: 'Nadia Green', email: 'nadia@empty.test' }] };
const projects = [
  { id: 1, name: 'Office refresh', stage: 'Discovery', updatedAt: '2026-09-01', contact: 'John Smith', contacts: [{ name: 'Casey Reed', email: 'casey@design.test' }], dealers: ['Business Furniture'] },
  { id: 2, name: 'Closed lobby', stage: 'Won', updatedAt: '2026-10-01', contact: { name: 'Morgan West', email: 'morgan@acme.test' }, dealers: ['Business Furniture', { name: 'OfficeWorks' }] },
];
const groups = [
  { id: 'acme', name: 'Acme', customer, projects },
  { id: 'empty', name: 'Empty customer', customer: emptyCustomer, projects: [] },
  { id: 'unlinked', name: 'Unlinked company', customer: null, projects: [{ id: 3, name: 'Archived studio', stage: 'Lost', contact: 'Dee Myers', dealers: ['RJE'] }] },
];
const renderSpotlight = props => render(<WorkspaceSpotlight theme={lightTheme} groups={groups} onOpenProject={vi.fn()} onOpenCustomer={vi.fn()} onFilter={vi.fn()} {...props} />);
const openSearch = () => {
  const trigger = screen.getByRole('button', { name: 'Search workspace' });
  trigger.focus();
  fireEvent.click(trigger);
  return screen.getByRole('combobox', { name: 'Search projects, customers, contacts and dealers' });
};
const search = value => {
  const input = screen.getByRole('combobox', { name: 'Search projects, customers, contacts and dealers' });
  fireEvent.change(input, { target: { value } });
  return input;
};
afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

describe('WorkspaceSpotlight search', () => {
  it('opens from a visible trigger and focuses the search input immediately', () => {
    renderSpotlight();
    const input = openSearch();
    expect(screen.getByRole('dialog', { name: 'Search workspace' })).toHaveAttribute('aria-modal', 'true');
    expect(input).toHaveFocus();
    expect(screen.getByRole('group', { name: 'Recent projects' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Closed lobby/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Empty customer/ })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('opens closed projects without depending on active workspace filters', () => {
    const onOpenProject = vi.fn();
    renderSpotlight({ onOpenProject });
    openSearch();
    search('  ARCHIVED studio  ');
    fireEvent.click(within(screen.getByRole('group', { name: 'Projects' })).getByRole('option', { name: /Archived studio/ }));
    expect(onOpenProject).toHaveBeenCalledWith(3);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens empty customer profiles by name', () => {
    const onOpenCustomer = vi.fn();
    renderSpotlight({ onOpenCustomer });
    openSearch();
    search('Empty customer');
    fireEvent.click(within(screen.getByRole('group', { name: 'Customers' })).getByRole('option', { name: /Empty customer/ }));
    expect(onOpenCustomer).toHaveBeenCalledWith(emptyCustomer);
  });

  it('finds customer contacts by email and opens their customer', () => {
    const onOpenCustomer = vi.fn();
    renderSpotlight({ onOpenCustomer });
    openSearch();
    search('nadia@empty.test');
    fireEvent.click(within(screen.getByRole('group', { name: 'Contacts' })).getByRole('option', { name: /Nadia Green/ }));
    expect(onOpenCustomer).toHaveBeenCalledWith(emptyCustomer);
  });

  it.each([
    ['John Smith', 'John Smith', 1],
    ['casey@design.test', 'Casey Reed', 1],
    ['morgan@acme.test', 'Morgan West', 2],
  ])('finds project contacts in supported data shapes: %s', (query, name, projectId) => {
    const onOpenProject = vi.fn();
    renderSpotlight({ onOpenProject });
    openSearch();
    search(query);
    fireEvent.click(within(screen.getByRole('group', { name: 'Contacts' })).getByRole('option', { name: new RegExp(name) }));
    expect(onOpenProject).toHaveBeenCalledWith(projectId);
  });

  it('deduplicates dealers across projects and filters by the dealer name', () => {
    const onFilter = vi.fn();
    renderSpotlight({ onFilter });
    openSearch();
    search('business');
    const dealerGroup = screen.getByRole('group', { name: 'Dealers' });
    expect(within(dealerGroup).getAllByRole('option')).toHaveLength(1);
    expect(dealerGroup).toHaveTextContent('2 projects');
    fireEvent.click(within(dealerGroup).getByRole('option', { name: /Business Furniture/ }));
    expect(onFilter).toHaveBeenCalledWith('Business Furniture');
  });

  it('filters unlinked customers instead of trying to open a missing profile', () => {
    const onFilter = vi.fn();
    const onOpenCustomer = vi.fn();
    renderSpotlight({ onFilter, onOpenCustomer });
    openSearch();
    search('Unlinked company');
    fireEvent.click(within(screen.getByRole('group', { name: 'Customers' })).getByRole('option'));
    expect(onFilter).toHaveBeenCalledWith('Unlinked company');
    expect(onOpenCustomer).not.toHaveBeenCalled();
  });

  it('offers an explicit query filter and resets search on reopening', () => {
    const onFilter = vi.fn();
    renderSpotlight({ onFilter });
    openSearch();
    search('  Office  ');
    fireEvent.click(screen.getByRole('button', { name: 'Filter workspace by “Office”' }));
    expect(onFilter).toHaveBeenCalledWith('Office');
    expect(openSearch()).toHaveValue('');
  });

  it('shows an empty state, supports clearing, and handles an empty workspace', () => {
    const { rerender } = renderSpotlight();
    const input = openSearch();
    search('no-such-record');
    expect(screen.getByText('No matching results')).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-activedescendant');
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    rerender(<WorkspaceSpotlight theme={lightTheme} groups={[]} />);
    expect(screen.getByText('No projects or customers yet')).toBeInTheDocument();
  });

  it('caps each group while keeping its total visible', () => {
    renderSpotlight({ groups: [{ id: 'many', name: 'Many', projects: Array.from({ length: 9 }, (_, index) => ({ id: index, name: `Sample ${index}` })) }] });
    openSearch();
    search('Sample');
    const group = screen.getByRole('group', { name: 'Projects' });
    expect(within(group).getAllByRole('option')).toHaveLength(6);
    expect(group).toHaveTextContent('6 of 9');
  });
});

describe('WorkspaceSpotlight keyboard and focus', () => {
  it.each(['ctrlKey', 'metaKey'])('opens with %s+K and does not propagate the shortcut', modifier => {
    renderSpotlight();
    const event = new KeyboardEvent('keydown', { key: 'k', [modifier]: true, bubbles: true, cancelable: true });
    fireEvent(document.body, event);
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it.each(['input', 'textarea', 'select', 'editable', 'textbox'])('does not intercept the shortcut while editing %s', kind => {
    render(<><WorkspaceSpotlight theme={lightTheme} groups={groups} />{kind === 'editable' ? <div contentEditable suppressContentEditableWarning data-testid="editor"><span>Typing</span></div> : kind === 'textbox' ? <div role="textbox" tabIndex={0} data-testid="editor" /> : React.createElement(kind, { 'data-testid': 'editor' })}</>);
    const editor = screen.getByTestId('editor');
    editor.focus();
    const target = kind === 'editable' ? editor.firstChild : editor;
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true });
    fireEvent(target, event);
    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole('dialog', { name: 'Search workspace' })).not.toBeInTheDocument();
  });

  it('does not open over another dialog, even with focus outside it', () => {
    render(<><WorkspaceSpotlight theme={lightTheme} groups={groups} /><div role="dialog" aria-label="Existing modal" /></>);
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true });
    fireEvent(document.body, event);
    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole('dialog', { name: 'Search workspace' })).not.toBeInTheDocument();
  });

  it('ignores hidden dialogs when checking the global shortcut', () => {
    render(<><WorkspaceSpotlight theme={lightTheme} groups={groups} /><div style={{ display: 'none' }}><div role="dialog" aria-label="Hidden modal" /></div></>);
    fireEvent.keyDown(document.body, { key: 'K', metaKey: true });
    expect(screen.getByRole('dialog', { name: 'Search workspace' })).toBeInTheDocument();
  });

  it('moves selection with arrows and opens the selected project with Enter', () => {
    const onOpenProject = vi.fn();
    renderSpotlight({ onOpenProject });
    const input = openSearch();
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Closed lobby');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', options[1].id);
    expect(input).toHaveFocus();
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onOpenProject).toHaveBeenCalledWith(2);
  });

  it('wraps the selection and resets it when the query changes', () => {
    renderSpotlight();
    const input = openSearch();
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
    search('Office');
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('does not select during IME composition', () => {
    const onOpenProject = vi.fn();
    renderSpotlight({ onOpenProject });
    const input = openSearch();
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onOpenProject).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on Escape, restores focus, and restores the previous scroll style', () => {
    document.body.style.overflow = 'auto';
    renderSpotlight();
    const input = openSearch();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search workspace' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('traps tab navigation and redirects programmatic focus back into the dialog', () => {
    render(<><button type="button">Outside</button><WorkspaceSpotlight theme={lightTheme} groups={groups} onFilter={vi.fn()} /></>);
    const input = openSearch();
    search('Acme');
    const close = screen.getByRole('button', { name: 'Close workspace search' });
    const filter = screen.getByRole('button', { name: 'Filter workspace by “Acme”' });
    filter.focus();
    fireEvent.keyDown(filter, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(filter).toHaveFocus();
    screen.getByRole('button', { name: 'Outside' }).focus();
    expect(input).toHaveFocus();
  });

  it('restores keyboard invocation focus to the original control', () => {
    render(<><button type="button">Original control</button><WorkspaceSpotlight theme={lightTheme} groups={groups} /></>);
    const original = screen.getByRole('button', { name: 'Original control' });
    original.focus();
    fireEvent.keyDown(original, { key: 'k', ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Close workspace search' }));
    expect(original).toHaveFocus();
  });

  it('cleans up scroll locking and keyboard listeners when unmounted', () => {
    const { unmount } = renderSpotlight();
    openSearch();
    unmount();
    expect(document.body.style.overflow).toBe('');
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});


it('does not open from an outgoing hidden screen during navigation', () => {
  render(<div aria-hidden="true"><WorkspaceSpotlight theme={lightTheme} groups={groups} /></div>);
  fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
