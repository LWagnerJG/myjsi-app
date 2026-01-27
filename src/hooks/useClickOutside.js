import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to detect clicks outside of a referenced element
 * @param {function} onClickOutside - Callback when click is detected outside
 * @param {boolean} enabled - Whether the listener is active (default true)
 * @returns {React.RefObject} Ref to attach to the element
 */
export function useClickOutside(onClickOutside, enabled = true) {
  const ref = useRef(null);
  const callbackRef = useRef(onClickOutside);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onClickOutside;
  }, [onClickOutside]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callbackRef.current?.(e);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [enabled]);

  return ref;
}

/**
 * Hook that returns a callback ref version for more flexibility
 * @param {function} onClickOutside - Callback when click is detected outside
 * @param {boolean} enabled - Whether the listener is active
 * @returns {function} Callback ref to attach to element
 */
export function useClickOutsideCallback(onClickOutside, enabled = true) {
  const elementRef = useRef(null);
  const callbackRef = useRef(onClickOutside);

  useEffect(() => {
    callbackRef.current = onClickOutside;
  }, [onClickOutside]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (elementRef.current && !elementRef.current.contains(e.target)) {
        callbackRef.current?.(e);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [enabled]);

  const setRef = useCallback((node) => {
    elementRef.current = node;
  }, []);

  return setRef;
}
