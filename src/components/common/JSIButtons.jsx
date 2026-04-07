import React from 'react';
import { DESIGN_TOKENS, isDarkTheme } from '../../design-system/tokens.js';

/**
 * JSI Frost Button — Frosted glass CTA for floating/overlay contexts
 * (fixed footers, sticky bars, buttons over imagery or gradients).
 * Style presets live in DESIGN_TOKENS.frost.button.
 */
const FROST_SIZES = {
    compact: 'px-4 py-2.5 text-xs gap-2',
    default: 'px-5 py-3 text-sm gap-2.5',
    large:   'px-6 py-4 text-base gap-3',
};

const FROST_STYLE = {
    dark:  { ...DESIGN_TOKENS.frost.button.dark,  letterSpacing: '-0.01em' },
    light: { ...DESIGN_TOKENS.frost.button.light, letterSpacing: '-0.01em' },
};

export const FrostButton = ({
    children,
    onClick,
    className = '',
    type = 'button',
    disabled = false,
    variant = 'dark',
    size = 'default',
    icon = null,
    ...props
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${FROST_SIZES[size]} font-semibold rounded-full transition-all flex items-center justify-center motion-tap hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        style={FROST_STYLE[variant] ?? FROST_STYLE.dark}
        {...props}
    >
        {icon && <span className="inline-flex">{icon}</span>}
        {children}
    </button>
);

/**
 * JSI Pill Button - Selection button with pill shape
 * Used for: Stage selection, Vertical selection, Timeframe selection, Competitor selection
 */
export const PillButton = ({
    children,
    isSelected = false,
    onClick,
    size = 'default',
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
        xs:      'px-2.5 py-2 text-xs',
        compact: 'px-4 py-2.5 text-xs',
        default: 'px-5 py-3.5 text-sm',
        large:   'px-6 py-4 text-base',
    };

    const borderClass = size === 'xs' ? 'border' : 'border-2';
    const dark = props.theme && isDarkTheme(props.theme);
    const selectedShadow = dark
        ? '0 2px 8px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)'
        : '0 2px 8px rgba(53,53,53,0.10), 0 1px 3px rgba(53,53,53,0.06)';

    const t = props.theme?.colors;
    const resolvedSelectedBg      = selectedBg      || (t?.accent       || '#353535');
    const resolvedSelectedText    = selectedText    || (t?.accentText    || '#FFFFFF');
    const resolvedUnselectedBg    = unselectedBg    || (t?.surface      || '#FFFFFF');
    const resolvedUnselectedBorder = unselectedBorder || (t?.border     || '#E3E0D8');
    const resolvedUnselectedText  = unselectedText  || (t?.textPrimary  || '#353535');

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${sizeClasses[size]} font-semibold rounded-full transition-all motion-tap ${borderClass} text-center whitespace-nowrap active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
            style={{
                backgroundColor: isSelected ? resolvedSelectedBg    : resolvedUnselectedBg,
                color:           isSelected ? resolvedSelectedText  : resolvedUnselectedText,
                borderColor:     isSelected ? resolvedSelectedBg    : resolvedUnselectedBorder,
                boxShadow:       isSelected ? selectedShadow        : 'none',
                fontWeight:      isSelected ? 600 : 500,
                letterSpacing:   '-0.01em',
            }}
            {...props}
        >
            {children}
        </button>
    );
};

/**
 * JSI Primary Button — Main action button
 * Used for: Form submissions, primary CTAs on flat surfaces (not floating)
 */
export const PrimaryButton = ({
    children,
    onClick,
    theme,
    size = 'default',
    className = '',
    type = 'submit',
    disabled = false,
    fullWidth = false,
    icon = null,
    ...props
}) => {
    const sizeClasses = {
        default: 'py-4 text-base',
        large:   'py-5 text-lg',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} px-8 font-bold rounded-full transition-all motion-tap hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 ${className}`}
            style={{
                backgroundColor: theme.colors.accent,
                color:           theme.colors.accentText || '#FFFFFF',
                boxShadow:       isDarkTheme(theme)
                    ? '0 2px 12px rgba(0,0,0,0.3)'
                    : DESIGN_TOKENS.shadows.button,
                letterSpacing:   '-0.01em',
                fontWeight:      600,
            }}
            {...props}
        >
            {children}
            {icon && <span className="inline-flex">{icon}</span>}
        </button>
    );
};

/**
 * JSI Secondary Button — Secondary action button
 * Used for: Cancel, secondary actions on flat surfaces
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
        large:   'py-4.5 text-lg',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} px-8 font-semibold rounded-full transition-all motion-tap hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed border-2 ${className}`}
            style={{
                backgroundColor: 'transparent',
                color:           theme.colors.accent,
                borderColor:     theme.colors.accent,
                letterSpacing:   '-0.01em',
                fontWeight:      600,
            }}
            {...props}
        >
            {children}
        </button>
    );
};


