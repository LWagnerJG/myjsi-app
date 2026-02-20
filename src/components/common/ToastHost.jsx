import React, { createContext, useCallback, useState, useRef, useEffect } from 'react';

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

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed inset-x-0 bottom-4 flex flex-col items-center gap-2 px-2 z-[1200] pointer-events-none" role="log" aria-label="Notifications">
        {toasts.map(t => (
          <div key={t.id} role="status" aria-live={t.type === 'error' ? 'assertive' : 'polite'} className={`pointer-events-auto px-4 py-2 rounded-full shadow-md text-sm font-medium backdrop-blur-sm transition ${prefersReduced.current ? '' : 'animate-fade-in'}`}
            style={{ background: theme.colors.surface, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};