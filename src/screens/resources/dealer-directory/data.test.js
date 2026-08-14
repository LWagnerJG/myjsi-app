import { describe, it, expect } from 'vitest';
import { DEALER_DIRECTORY_DATA, getChoiceProgram, isChoiceDealer } from './data.js';

describe('Choice program', () => {
  it('marks Platinum and Gold dealers as Choice and leaves others out', () => {
    const officeworks = DEALER_DIRECTORY_DATA.find(d => d.name === 'OfficeWorks');
    const schroeders = DEALER_DIRECTORY_DATA.find(d => d.name === "Schroeder's");

    expect(isChoiceDealer(officeworks)).toBe(true);
    expect(getChoiceProgram(officeworks).label).toBe('Platinum');
    expect(getChoiceProgram(officeworks).rebateRate).toBe(3);
    expect(getChoiceProgram(officeworks).percent).toBeGreaterThan(0);

    expect(isChoiceDealer(schroeders)).toBe(false);
    expect(getChoiceProgram(schroeders)).toBeNull();
  });

  it('resolves Choice membership by dealer name when ids differ', () => {
    const program = getChoiceProgram({
      id: 999,
      name: 'RJE Business Interiors',
      rebatableSales: 400000,
      rebatableGoal: 800000,
    });
    expect(program.label).toBe('Platinum');
    expect(program.percent).toBe(50);
  });
});
