import { useEffect, useState, useRef } from 'react';

// Small persistent state hook (localStorage) with versioning
export function usePersistentState(key, initialValue, { version = 1 } = {}) {
  const storageKey = `app:${key}:v${version}`;
  const isMounted = useRef(false);
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return initialValue;
  });

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }, [value, storageKey]);

  return [value, setValue];
}
