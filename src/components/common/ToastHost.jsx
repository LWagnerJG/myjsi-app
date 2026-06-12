import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToastMotion } from '../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { ToastContext } from './toastContext.js';

let idCounter = 0;

export const ToastHost = ({ children, theme }) => {
  const [toasts, setToasts] = useState([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const dismissTimersRef = useRef(new Map());

  const push = useCallback((message, options={}) => {
    const id = ++idCounter;
    setToasts(t => [...t, { id, message, type: options.type || 'info', ttl: options.ttl || 3000 }]);
  }, []);

  // Schedule one dismiss timer per toast. Re-mapping all timers on every
  // change would reset existing toasts' countdowns whenever a new toast lands.
  useEffect(() => {
    const timers = dismissTimersRef.current;
    toasts.forEach(t => {
      if (timers.has(t.id)) return;
      timers.set(t.id, setTimeout(() => {
        timers.delete(t.id);
        setToasts(cur => cur.filter(c => c.id !== t.id));
      }, t.ttl));
    });
  }, [toasts]);

  useEffect(() => () => {
    dismissTimersRef.current.forEach(clearTimeout);
    dismissTimersRef.current.clear();
  }, []);

  const toastMotion = getToastMotion(prefersReducedMotion);
  const ctxValue = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}
      <div className="fixed inset-x-0 bottom-4 flex flex-col items-center gap-2 px-2 z-[1200] pointer-events-none" role="log" aria-label="Notifications">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout={!prefersReducedMotion}
              initial={toastMotion.initial}
              animate={toastMotion.animate}
              exit={toastMotion.exit}
              transition={toastMotion.transition}
              role="status"
              aria-live={t.type === 'error' ? 'assertive' : 'polite'}
              className="pointer-events-auto px-4 py-2 rounded-full shadow-md text-sm font-medium backdrop-blur-sm"
              style={{ background: theme.colors.surface, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
