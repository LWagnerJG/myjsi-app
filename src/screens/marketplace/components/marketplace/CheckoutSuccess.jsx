import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import { getUnifiedBackdropStyle, UNIFIED_BACKDROP_TRANSITION, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';
import { MOTION_DURATIONS_MS, MOTION_EASINGS, buildCssTransition } from '../../../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../../../hooks/usePrefersReducedMotion.js';
import { formatElliottBucks } from '../../data.js';
import { getMarketplacePalette } from '../../theme.js';

export const CheckoutSuccess = ({ show, theme, amount, orderId }) => {
  const prefersReduced = usePrefersReducedMotion();
  const palette = getMarketplacePalette(theme);
  if (!show) return null;
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: UNIFIED_MODAL_Z + 100 }}>
      <div className="absolute inset-0" style={{ ...getUnifiedBackdropStyle(show, prefersReduced), transition: prefersReduced ? 'none' : UNIFIED_BACKDROP_TRANSITION }} />
      <div
        className="relative px-10 py-8 rounded-[28px] text-center max-w-sm"
        style={{
          background: theme.colors.surface,
          color: theme.colors.textPrimary,
          border: `1px solid ${palette.border}`,
          transform: show ? 'scale(1)' : 'scale(.9)',
          opacity: show ? 1 : 0.9,
          transition: prefersReduced
            ? 'none'
            : [
              buildCssTransition('transform', MOTION_DURATIONS_MS.slow, MOTION_EASINGS.springOut),
              buildCssTransition('opacity', MOTION_DURATIONS_MS.medium, MOTION_EASINGS.standard),
            ].join(', '),
          boxShadow: palette.shadow,
        }}
      >
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: palette.successSoft }}>
          <CheckCircle className="w-8 h-8" style={{ color: palette.success }} />
        </div>
        <p className="font-black text-[1.125rem] tracking-tight">Redemption placed</p>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
          {amount ? `Redeemed ${formatElliottBucks(amount)}.` : 'Your LWYD merch is on the way.'}
        </p>
        <p className="text-[0.6875rem] mt-2" style={{ color: theme.colors.textSecondary }}>
          {orderId ? `${orderId} is now in Orders.` : 'You can track it from Orders.'}
        </p>
      </div>
    </div>,
    document.body
  );
};
