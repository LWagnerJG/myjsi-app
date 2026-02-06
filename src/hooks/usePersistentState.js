import { useEffect, useState, useRef, useCallback } from 'react';

// Small persistent state hook (localStorage) with versioning
export function usePersistentState(key, initialValue, { version = 1 } = {}) {
  const storageKey = `app:${key}:v${version}`;
  const isMounted = useRef(false);
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        return parsed;
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn(`[usePersistentState] Failed to read "${storageKey}":`, e.message);
      }
      // Remove corrupted data so next write succeeds
      try { localStorage.removeItem(storageKey); } catch (_) { /* noop */ }
    }
    return initialValue;
  });

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn(`[usePersistentState] Failed to write "${storageKey}":`, e.message);
      }
    }
  }, [value, storageKey]);

  // Stable setter that also clears storage when resetting
  const reset = useCallback(() => {
    setValue(initialValue);
    try { localStorage.removeItem(storageKey); } catch (_) { /* noop */ }
  }, [initialValue, storageKey]);

  return [value, setValue, reset];
}
