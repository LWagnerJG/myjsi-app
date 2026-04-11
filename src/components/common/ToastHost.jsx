import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getToastMotion } from '../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

let idCounter = 0;

export const ToastHost = ({ children, theme }) => {
  const [toasts, setToasts] = useState([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const push = useCallback((message, options={}) => {
    const id = ++idCounter;
    setToasts(t => [...t, { id, message, type: options.type || 'info', ttl: options.ttl || 3000 }]);
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map(t => setTimeout(() => {
      setToasts(cur => cur.filter(c => c.id !== t.id));
    }, t.ttl));
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

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
