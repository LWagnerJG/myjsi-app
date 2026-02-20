import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePersistentState } from './usePersistentState';

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => usePersistentState('testKey', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return value from localStorage if it exists', () => {
    localStorage.setItem('app:testKey:v1', JSON.stringify('storedValue'));
    const { result } = renderHook(() => usePersistentState('testKey', 'initial'));
    expect(result.current[0]).toBe('storedValue');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => usePersistentState('testKey', 'initial'));
    
    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem('app:testKey:v1')).toBe(JSON.stringify('newValue'));
  });

  it('should handle reset correctly', () => {
    const { result } = renderHook(() => usePersistentState('testKey', 'initial'));
    
    act(() => {
      result.current[1]('newValue');
    });
    expect(result.current[0]).toBe('newValue');

    act(() => {
      result.current[2](); // reset
    });

    expect(result.current[0]).toBe('initial');
    // After reset, the useEffect re-persists the initial value
    expect(localStorage.getItem('app:testKey:v1')).toBe(JSON.stringify('initial'));
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('app:testKey:v1', '{invalid json}');
    
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => usePersistentState('testKey', 'initial'));
    
    expect(result.current[0]).toBe('initial');
    expect(localStorage.getItem('app:testKey:v1')).toBeNull(); // Should be removed
    
    consoleWarnSpy.mockRestore();
  });

  it('should support versioning', () => {
    localStorage.setItem('app:testKey:v1', JSON.stringify('v1Value'));
    localStorage.setItem('app:testKey:v2', JSON.stringify('v2Value'));
    
    const { result } = renderHook(() => usePersistentState('testKey', 'initial', { version: 2 }));
    
    expect(result.current[0]).toBe('v2Value');
  });
});
