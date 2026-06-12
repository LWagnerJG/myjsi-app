import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { OpportunityDetail } from './OpportunityDetail.jsx';
import { lightTheme } from '../../../../data/theme/themeData.js';

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
    expect(screen.getByRole('combobox', { name: 'Project stage' })).toHaveValue('Specifying');

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
