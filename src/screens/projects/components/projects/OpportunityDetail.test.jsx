import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup, within } from '@testing-library/react';
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
  });

  it('exposes the No/Yes control as a radiogroup with correct radio semantics', () => {
    render(<Harness initial={baseOpp} />);

    const group = screen.getByRole('radiogroup', { name: 'Competition present' });
    expect(group).toBeInTheDocument();

    const noOption = within(group).getByRole('radio', { name: 'No' });
    const yesOption = within(group).getByRole('radio', { name: 'Yes' });
    expect(noOption).toHaveAttribute('aria-checked', 'true');
    expect(yesOption).toHaveAttribute('aria-checked', 'false');
    // Roving tabindex: selected option is tabbable, the other is not.
    expect(noOption).toHaveAttribute('tabindex', '0');
    expect(yesOption).toHaveAttribute('tabindex', '-1');
  });

  it('moves the radiogroup selection with the arrow keys', () => {
    render(<Harness initial={baseOpp} />);
    const group = screen.getByRole('radiogroup', { name: 'Competition present' });
    const noOption = within(group).getByRole('radio', { name: 'No' });

    noOption.focus();
    fireEvent.keyDown(noOption, { key: 'ArrowRight' });

    expect(within(group).getByRole('radio', { name: 'Yes' })).toHaveAttribute('aria-checked', 'true');
    expect(within(group).getByRole('radio', { name: 'No' })).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects real autosave activity through a polite status region', () => {
    vi.useFakeTimers();
    render(<Harness initial={baseOpp} />);
    const status = screen.getByRole('status');

    // Let any mount-time normalization settle to the saved state.
    act(() => { vi.advanceTimersByTime(700); });

    fireEvent.change(screen.getByRole('textbox', { name: 'Project name' }), {
      target: { value: 'Renamed Project' },
    });
    expect(status).toHaveTextContent(/saving/i);

    act(() => { vi.advanceTimersByTime(700); });
    expect(status).toHaveTextContent(/^saved$/i);
  });

  it('exposes page landmarks, an h1, and a skip link', () => {
    render(<Harness initial={baseOpp} />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Project Hub and notes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Project');
    expect(screen.getByRole('link', { name: /skip to project form/i })).toHaveAttribute('href', '#project-detail-main');
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
