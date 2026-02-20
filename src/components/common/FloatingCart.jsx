// Shared FloatingCart pill — standardised across Samples, Marketplace, and any future cart-bearing screen.
// Shows a prominent blurred pill when collapsed. Scales up on larger viewports.
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * FloatingCart
 *
 * Props:
 *   itemCount  {number}   – total number of items in the cart
 *   label      {string}   – right-side label text, e.g. "View Cart (3)" or "EB 1,250 · 3 items"
 *   onClick    {function} – called when the pill is tapped/clicked
 *   theme      {object}   – standard app theme object
 *   visible    {boolean}  – whether the pill should be shown at all (default true)
 */
export const FloatingCart = React.memo(({ itemCount = 0, label, onClick, theme, visible = true }) => {
    const isDark = isDarkTheme(theme);
    const show = visible && itemCount > 0;

    return (
        <AnimatePresence>
            {show && (
                <motion.button
                    initial={{ opacity: 0, y: 24, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    onClick={onClick}
                    aria-label={label || `Cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                    className="
                        fixed z-20
                        bottom-5 left-1/2 -translate-x-1/2
                        flex items-center gap-3
                        pl-4 pr-5 py-3
                        sm:pl-5 sm:pr-6 sm:py-3.5
                        rounded-full
                        transition-shadow duration-200 active:scale-95
                    "
                    style={{
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.22)'
                            : 'rgba(30, 30, 30, 0.80)',
                        boxShadow: isDark
                            ? '0 6px 28px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.09) inset'
                            : '0 6px 28px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.08) inset',
                        border: isDark
                            ? '1px solid rgba(255,255,255,0.18)'
                            : '1px solid rgba(255,255,255,0.14)',
                    }}
                >
                    {/* Icon bubble */}
                    <div
                        className="
                            w-8 h-8
                            sm:w-9 sm:h-9
                            rounded-full flex items-center justify-center flex-shrink-0
                        "
                        style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
                    >
                        <ShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" aria-hidden="true" />
                    </div>

                    {/* Label */}
                    <span className="text-white font-semibold text-sm sm:text-[15px] whitespace-nowrap">
                        {label}
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
});

FloatingCart.displayName = 'FloatingCart';
