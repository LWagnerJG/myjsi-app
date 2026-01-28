import React from 'react';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

/**
 * JSI Pill Button - Selection button with pill shape
 * Used for: Stage selection, Vertical selection, Timeframe selection, Competitor selection
 *
 * Design Specs (JSI Style Guide):
 * - Border radius: 9999px (pill shape)
 * - Padding: px-5 py-3.5 (standard), px-4 py-3 (compact)
 * - Typography: text-sm, font-semibold, Neue Haas Grotesk Display Pro
 * - Border: 2px solid
 * - Selected: JSI Charcoal background (#353535), white text
 * - Unselected: White background, charcoal text
 * - Shadows: Button shadow when selected, subtle shadow when unselected
 */
export const PillButton = ({
    children,
    isSelected = false,
    onClick,
    theme,
    size = 'default', // 'default' | 'compact' | 'large' | 'xs'
    className = '',
    type = 'button',
    disabled = false,
    selectedBg,
    selectedText,
    unselectedBg,
    unselectedText,
    unselectedBorder,
    ...props
}) => {
    const sizeClasses = {
        xs: 'px-3 py-2 text-[11px]',
        compact: 'px-4 py-2.5 text-xs',
        default: 'px-5 py-3.5 text-sm',
        large: 'px-6 py-4 text-base'
    };

    const selectedShadow = '0 2px 8px rgba(53,53,53,0.10), 0 1px 3px rgba(53,53,53,0.06)';
    const unselectedShadow = '0 1px 3px rgba(53,53,53,0.04)';
    const resolvedSelectedBg = selectedBg || '#353535';
    const resolvedSelectedText = selectedText || '#FFFFFF';
    const resolvedUnselectedBg = unselectedBg || '#FFFFFF';
    const resolvedUnselectedBorder = unselectedBorder || '#E3E0D8';
    const resolvedUnselectedText = unselectedText || '#353535';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${sizeClasses[size]} font-semibold rounded-full transition-all border-2 text-center hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
            style={{
                backgroundColor: isSelected ? resolvedSelectedBg : resolvedUnselectedBg,
                color: isSelected ? resolvedSelectedText : resolvedUnselectedText,
                borderColor: isSelected ? resolvedSelectedBg : resolvedUnselectedBorder,
                boxShadow: isSelected ? selectedShadow : unselectedShadow,
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontWeight: isSelected ? 600 : 500,
                letterSpacing: '-0.01em'
            }}
            {...props}
        >
            {children}
        </button>
    );
};

/**
 * JSI Primary Button - Main action button
 * Used for: Form submissions, primary CTAs
 *
 * Design Specs (JSI Style Guide):
 * - Border radius: 9999px (pill shape)
 * - Padding: py-5 (large), py-4 (default)
 * - Typography: text-lg (large), text-base (default), font-bold, Neue Haas Grotesk Display Pro
 * - Background: JSI Charcoal (#353535)
 * - Color: White
 * - Shadow: Button shadow with hover enhancement
 */
export const PrimaryButton = ({
    children,
    onClick,
    theme,
    size = 'default', // 'default' | 'large'
    className = '',
    type = 'submit',
    disabled = false,
    fullWidth = false,
    icon = null,
    ...props
}) => {
    const sizeClasses = {
        default: 'py-4 text-base',
        large: 'py-5 text-lg'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} px-8 font-bold rounded-full transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 ${className}`}
            style={{
                backgroundColor: theme.colors.accent,
                color: '#FFFFFF',
                boxShadow: DESIGN_TOKENS.shadows.button,
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                letterSpacing: '-0.01em',
                fontWeight: 600
            }}
            {...props}
        >
            {children}
            {icon && <span className="inline-flex">{icon}</span>}
        </button>
    );
};

/**
 * JSI Secondary Button - Secondary action button
 * Used for: Cancel, secondary actions
 *
 * Design Specs:
 * - Similar to Primary but with outline style
 * - Background: Transparent/Surface
 * - Border: 2px solid accent
 * - Color: Accent color
 */
export const SecondaryButton = ({
    children,
    onClick,
    theme,
    size = 'default',
    className = '',
    type = 'button',
    disabled = false,
    fullWidth = false,
    ...props
}) => {
    const sizeClasses = {
        default: 'py-3.5 text-base',
        large: 'py-4.5 text-lg'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} px-8 font-semibold rounded-full transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed border-2 ${className}`}
            style={{
                backgroundColor: 'transparent',
                color: theme.colors.accent,
                borderColor: theme.colors.accent,
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                letterSpacing: '-0.01em',
                fontWeight: 600
            }}
            {...props}
        >
            {children}
        </button>
    );
};

/**
 * JSI Button Grid - Grid container for pill buttons
 * Handles responsive layouts and consistent spacing
 */
export const PillButtonGrid = ({
    children,
    columns = 3, // Number of columns
    gap = 3, // Gap size (Tailwind scale: 1, 2, 3, 4, etc.)
    className = ''
}) => {
    const gapClasses = {
        2: 'gap-2',
        2.5: 'gap-2.5',
        3: 'gap-3',
        4: 'gap-4'
    };

    return (
        <div
            className={`grid grid-cols-${columns} ${gapClasses[gap] || 'gap-3'} ${className}`}
        >
            {children}
        </div>
    );
};
