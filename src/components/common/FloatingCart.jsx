// Shared FloatingCart pill — standardised across Samples, Marketplace, and any future cart-bearing screen.
// Uses FloatingPill for consistent positioning, glass style, and animation.
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import FloatingPill from './FloatingPill.jsx';

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
export const FloatingCart = React.memo(({ itemCount = 0, label, onClick, theme, visible = true }) => (
    <FloatingPill
        theme={theme}
        onClick={onClick}
        visible={visible && itemCount > 0}
        icon={<ShoppingCart />}
        label={label || `View Cart (${itemCount})`}
    />
));

FloatingCart.displayName = 'FloatingCart';
