import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { OpportunityDetail } from './OpportunityDetail.jsx';
import { lightTheme } from '../../../../data/theme/themeData.js';
import { INITIAL_OPPORTUNITIES } from '../../data.js';
const baseOpp = {
  id: 99,
  name: 'Test Project',
  stage: 'Specifying',
  value: '$100,000',
  company: 'Acme Health',
  contact: '',
  vertical: 'Healthcare',
  poTimeframe: '60-180 Days',
  winProbability: 50,
  competitionPresent: false,
  competitors: [],
  designFirms: [],
  dealers: ['RJE'],
  products: [],
  notes: '',
};

/* Mirrors how ProjectsScreen echoes saves back into the `opp` prop. */
const Harness = ({ initial }) => {
  const [opp, setOpp] = useState(initial);
  return (
    <OpportunityDetail
      opp={opp}
      theme={lightTheme}
      onUpdate={setOpp}
      members={[]}
      currentUserId="u1"
    />
  );
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('OpportunityDetail', () => {
  it('renders identity, stage, and an adjustable win probability slider', () => {
    render(<Harness initial={baseOpp} />);

    expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveValue('Test Project');
    expect(screen.getByRole('combobox', { name: 'Project stage' })).toHaveTextContent('Specifying');

    const slider = screen.getByRole('slider', { name: /win probability/i });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('adjusts win probability in 5% steps from the keyboard', () => {
    render(<Harness initial={baseOpp} />);
    const slider = screen.getByRole('slider', { name: /win probability/i });

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(screen.getByRole('slider', { name: /win probability/i })).toHaveAttribute('aria-valuenow', '55');

    fireEvent.keyDown(slider, { key: 'Home' });
    expect(screen.getByRole('slider', { name: /win probability/i })).toHaveAttribute('aria-valuenow', '0');

    fireEvent.keyDown(slider, { key: 'End' });
    expect(screen.getByRole('slider', { name: /win probability/i })).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders seeded project id 1 with full stakeholder data', () => {
    const opp = INITIAL_OPPORTUNITIES.find(o => o.id === 1);
    render(<Harness initial={opp} />);
    expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveValue('New Office Furnishings');
    expect(screen.getByText('Stakeholders & Competition')).toBeInTheDocument();
    expect(screen.getByText('Specs & Quote')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('keeps free-form project notes in a multi-row Notes field', () => {
    render(<Harness initial={baseOpp} />);
    const notes = screen.getByRole('textbox', { name: 'Project notes' });
    expect(notes.tagName).toBe('TEXTAREA');
    fireEvent.change(notes, { target: { value: 'Main HQ expansion; awaiting test fit.' } });
    expect(screen.getByRole('textbox', { name: 'Project notes' })).toHaveValue('Main HQ expansion; awaiting test fit.');
  });

  it('requires a project type selection before Done fires', () => {
    const onDone = vi.fn();
    render(
      <OpportunityDetail
        opp={{ ...baseOpp, projectType: undefined }}
        theme={lightTheme}
        onUpdate={() => {}}
        onDone={onDone}
        members={[]}
        currentUserId="u1"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onDone).not.toHaveBeenCalled();
    expect(screen.getByText(/choose a project type/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Project type' }));
    fireEvent.click(screen.getByRole('option', { name: 'General Commercial' }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('reveals the contract program picker when Project Type is Contract', () => {
    render(<Harness initial={baseOpp} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Project type' }));
    fireEvent.click(screen.getByRole('option', { name: 'Contract' }));
    expect(screen.getByRole('combobox', { name: 'Contract program' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Contract program' }));
    fireEvent.click(screen.getByRole('option', { name: 'State Contracts' }));
    expect(screen.getByRole('combobox', { name: 'Contract state' })).toBeInTheDocument();
  });

  it('keeps a manually enabled reward on after the autosave round-trip', () => {
    vi.useFakeTimers();
    // Net 36k at 64% discount → rewards auto-default off.
    render(<Harness initial={{ ...baseOpp, discount: '50/20/10 (64.00%)' }} />);

    const salesToggle = () => screen.getByRole('switch', { name: 'Sales reward' });
    expect(salesToggle()).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(salesToggle());
    expect(salesToggle()).toHaveAttribute('aria-checked', 'true');

    // Flush the debounced save; the parent echoes the saved opp back down.
    act(() => { vi.advanceTimersByTime(700); });
    expect(salesToggle()).toHaveAttribute('aria-checked', 'true');
  });
});
