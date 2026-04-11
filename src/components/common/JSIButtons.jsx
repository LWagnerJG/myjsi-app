import React from 'react';
import { DESIGN_TOKENS, isDarkTheme } from '../../design-system/tokens.js';
import { ArrowUpRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
 * JSI Web Button — Faithful replica of the jsifurniture.com button with the
 * signature "sweep-up" hover animation. A hidden duplicate layer slides up
 * from below on hover, filling the pill with the inverted color while the
 * original content fades up and out.
 *
 * Variants:
 *   outlined (default) — transparent bg, border, text → hover fills solid
 *   filled             — solid bg → hover sweeps matching color
 *
 * Tones:
 *   dark  (default) — dark border/text, dark sweep bg
 *   light           — white border/text, white sweep bg
 *
 * Sizes: default (45px), medium (38px), small (30px)
 *
 * Use `as="a"` + href to render as a link.
 * ────────────────────────────────────────────────────────────────────────── */

const webBtnColors = (variant, tone, theme) => {
    const accent = theme?.colors?.accent || '#353535';
    const accentText = theme?.colors?.accentText || '#FFFFFF';
    const dark = theme ? isDarkTheme(theme) : false;

    if (tone === 'light') {
        const fg = dark ? accentText : '#FFFFFF';
        return {
            base: {
                color: fg,
                border: variant === 'outlined' ? `2px solid ${fg}` : 'none',
                backgroundColor: variant === 'filled' ? fg : 'transparent',
                ...(variant === 'filled' && { color: accent }),
            },
            sweep: {
                backgroundColor: fg,
                color: accent,
            },
        };
    }

    // tone = 'dark' (default)
    const surface = theme?.colors?.surface || '#FFFFFF';
    const softBg = dark ? 'rgba(255,255,255,0.10)' : surface;
    const softBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)';

    if (variant === 'soft') {
        return {
            base: {
                color: accent,
                backgroundColor: softBg,
                border: `1px solid ${softBorder}`,
            },
            sweep: {
                backgroundColor: accent,
                color: accentText,
            },
        };
    }

    return {
        base: {
            color: accent,
            border: variant === 'outlined' ? `2px solid ${accent}` : 'none',
            backgroundColor: variant === 'filled' ? accent : 'transparent',
            ...(variant === 'filled' && { color: accentText }),
        },
        sweep: {
            backgroundColor: accent,
            color: accentText,
        },
    };
};

export const JSIWebButton = ({
    children,
    onClick,
    theme,
    variant = 'outlined',
    tone = 'dark',
    size = 'default',
    icon = <ArrowUpRight size={size === 'small' ? 18 : size === 'medium' ? 20 : 22} strokeWidth={2} />,
    as: Tag = 'button',
    className = '',
    disabled = false,
    style: styleProp,
    ...props
}) => {
    const colors = webBtnColors(variant, tone, theme);
    const sizeClass = `jsi-web-btn--${size}`;
    const borderWidth = variant === 'outlined' ? (size === 'small' ? '1px' : '2px') : undefined;

    const content = (
        <>
            {children}
            {icon && <span className="inline-flex shrink-0">{icon}</span>}
        </>
    );

    return (
        <Tag
            {...(Tag === 'button' ? { type: 'button' } : {})}
            onClick={onClick}
            disabled={disabled}
            className={`jsi-web-btn ${sizeClass} ${className}`}
            style={{ ...colors.base, ...(borderWidth && { borderWidth }), ...styleProp }}
            {...props}
        >
            <span className="jsi-web-btn__content">{content}</span>
            <span className="jsi-web-btn__sweep" style={colors.sweep} aria-hidden="true">
                <span className="jsi-web-btn__sweep-inner">{content}</span>
            </span>
        </Tag>
    );
};
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


