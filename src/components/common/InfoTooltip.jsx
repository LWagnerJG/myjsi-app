import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { DESIGN_TOKENS, JSI_COLORS } from '../../design-system/tokens.js';

/**
 * InfoTooltip Component
 *
 * A tooltip component for displaying helpful information with JSI styling.
 * Features pill-shaped button with info icon and floating tooltip.
 *
 * @param {string} content - The tooltip content to display
 * @param {object} theme - Theme object for styling
 * @param {string} position - Tooltip position: 'top', 'bottom', 'left', 'right' (default: 'top')
 * @param {string} size - Icon size: 'sm', 'md', 'lg' (default: 'md')
 */
export const InfoTooltip = ({
  content,
  theme,
  position = 'top',
  size = 'md',
  className = ''
}) => {
  const [show, setShow] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, ready: false });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const sizeMap = {
    sm: { button: '24px', icon: 14 },
    md: { button: '28px', icon: 16 },
    lg: { button: '32px', icon: 18 },
  };

  const computePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top, left;

    switch (position) {
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollX + 8;
        break;
      case 'top':
      default:
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    setTooltipPos({ top, left, ready: true });
  };

  useEffect(() => {
    if (show) {
      // Compute position after tooltip is rendered
      requestAnimationFrame(computePosition);
    }
  }, [show]);

  useEffect(() => {
    const handleScroll = () => {
      if (show) setShow(false);
    };

    const handleResize = () => {
      if (show) computePosition();
    };

    if (show) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [show]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow(!show);
        }}
        className={`inline-flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${className}`}
        style={{
          width: sizeMap[size].button,
          height: sizeMap[size].button,
          borderRadius: DESIGN_TOKENS.borderRadius.full,
          backgroundColor: `${theme?.colors?.accent || JSI_COLORS.charcoal}15`,
          color: theme?.colors?.accent || JSI_COLORS.charcoal,
          border: 'none',
        }}
        aria-label="More information"
      >
        <Info size={sizeMap[size].icon} strokeWidth={2.5} />
      </button>

      {show && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[1000] px-3 py-2 rounded-xl text-xs leading-relaxed shadow-2xl animate-fade-in"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            opacity: tooltipPos.ready ? 1 : 0,
            backgroundColor: theme?.colors?.surface || JSI_COLORS.white,
            color: theme?.colors?.textPrimary || JSI_COLORS.charcoal,
            border: `1px solid ${theme?.colors?.border || JSI_COLORS.stone}`,
            maxWidth: '280px',
            pointerEvents: 'none',
            zIndex: DESIGN_TOKENS.zIndex.tooltip,
            boxShadow: DESIGN_TOKENS.shadows.xl,
          }}
        >
          {content}
          {/* Arrow indicator */}
          <div
            className="absolute w-2 h-2 rotate-45"
            style={{
              backgroundColor: theme?.colors?.surface || JSI_COLORS.white,
              border: `1px solid ${theme?.colors?.border || JSI_COLORS.stone}`,
              ...(position === 'top' && {
                bottom: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                borderTop: 'none',
                borderLeft: 'none',
              }),
              ...(position === 'bottom' && {
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                borderBottom: 'none',
                borderRight: 'none',
              }),
              ...(position === 'left' && {
                right: '-5px',
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
                borderTop: 'none',
                borderRight: 'none',
              }),
              ...(position === 'right' && {
                left: '-5px',
                top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
                borderBottom: 'none',
                borderLeft: 'none',
              }),
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
};
