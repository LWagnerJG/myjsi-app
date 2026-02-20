import React, { createContext, useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastHost = ({ children, theme }) => {
  const [toasts, setToasts] = useState([]);
  const prefersReduced = useRef(false);
  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

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

  const reduced = prefersReduced.current;

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed inset-x-0 bottom-4 flex flex-col items-center gap-2 px-2 z-[1200] pointer-events-none" role="log" aria-label="Notifications">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout={!reduced}
              initial={reduced ? undefined : { opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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