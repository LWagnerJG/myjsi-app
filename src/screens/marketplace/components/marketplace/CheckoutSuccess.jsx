import React from 'react';
import { CheckCircle } from 'lucide-react';

export const CheckoutSuccess = ({ show, theme }) => {
  if (!show) return null;
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0" style={{ background: show ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)', transition: prefersReduced ? 'none' : 'background 320ms ease' }} />
      <div
        className="relative px-10 py-8 rounded-3xl text-center"
        style={{
          background: theme.colors.surface,
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.colors.border}`,
          transform: show ? 'scale(1)' : 'scale(.9)',
          opacity: show ? 1 : 0.9,
          transition: prefersReduced ? 'none' : 'transform 480ms cubic-bezier(.3,1,.3,1), opacity 360ms ease',
          boxShadow: '0 6px 24px -4px rgba(0,0,0,0.12)',
        }}
      >
        <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#4A7C59' }} />
        <p className="font-bold text-[15px]">Order Placed!</p>
        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Your LWYD merch is on its way.</p>
      </div>
    </div>
  );
};
