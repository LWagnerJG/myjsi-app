import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import { getUnifiedBackdropStyle, UNIFIED_BACKDROP_TRANSITION, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';
import { MOTION_DURATIONS_MS, MOTION_EASINGS, buildCssTransition } from '../../../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../../../hooks/usePrefersReducedMotion.js';

export const CheckoutSuccess = ({ show, theme }) => {
  const prefersReduced = usePrefersReducedMotion();
  if (!show) return null;
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: UNIFIED_MODAL_Z + 100 }}>
      <div className="absolute inset-0" style={{ ...getUnifiedBackdropStyle(show, prefersReduced), transition: prefersReduced ? 'none' : UNIFIED_BACKDROP_TRANSITION }} />
      <div
        className="relative px-10 py-8 rounded-3xl text-center"
        style={{
          background: theme.colors.surface,
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.colors.border}`,
          transform: show ? 'scale(1)' : 'scale(.9)',
          opacity: show ? 1 : 0.9,
          transition: prefersReduced
            ? 'none'
            : [
              buildCssTransition('transform', MOTION_DURATIONS_MS.slow, MOTION_EASINGS.springOut),
              buildCssTransition('opacity', MOTION_DURATIONS_MS.medium, MOTION_EASINGS.standard),
            ].join(', '),
          boxShadow: '0 6px 24px -4px rgba(0,0,0,0.12)',
        }}
      >
        <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#4A7C59' }} />
        <p className="font-bold text-[15px]">Order Placed!</p>
        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Your LWYD merch is on its way.</p>
      </div>
    </div>,
    document.body
  );
};
