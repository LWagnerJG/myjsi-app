import React from 'react';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

/**
 * JSI Product Cards - Style Guide Pages 19-22
 * Multiple card variants matching the Digital Style Guide 1.0
 */

// Standard Product Card with Image (Style Guide Page 19)
export const ProductCard = ({
    image,
    title,
    subtitle,
    description,
    tags = [],
    actions = [],
    onClick,
    theme,
    className = ''
}) => {
    return (
        <div
            onClick={onClick}
            className={`rounded-2xl overflow-hidden transition-all hover:scale-[1.01] cursor-pointer ${className}`}
            style={{
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: DESIGN_TOKENS.shadows.card
            }}
        >
            {/* Image */}
            {image && (
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                    {/* Tags Overlay */}
                    {tags.length > 0 && (
                        <div className="absolute top-3 left-3 flex gap-2">
                            {tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-xs font-semibold"
                                    style={{
                                        backgroundColor: tag.bg || theme.colors.accent,
                                        color: tag.color || '#FFFFFF',
                                        fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                                    }}
                                >
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {subtitle && (
                    <p
                        className="text-sm font-medium mb-1"
                        style={{
                            color: theme.colors.textSecondary,
                            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                        }}
                    >
                        {subtitle}
                    </p>
                )}

                <h3
                    className="text-xl font-bold mb-2"
                    style={{
                        color: theme.colors.textPrimary,
                        fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                        letterSpacing: '-0.01em'
                    }}
                >
                    {title}
                </h3>

                {description && (
                    <p
                        className="text-sm mb-4"
                        style={{
                            color: theme.colors.textSecondary,
                            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                            lineHeight: 1.5
                        }}
                    >
                        {description}
                    </p>
                )}

                {/* Actions */}
                {actions.length > 0 && (
                    <div className="flex gap-2 mt-4">
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick();
                                }}
                                className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    backgroundColor: action.variant === 'primary'
                                        ? theme.colors.accent
                                        : 'transparent',
                                    color: action.variant === 'primary'
                                        ? '#FFFFFF'
                                        : theme.colors.accent,
                                    border: action.variant === 'secondary'
                                        ? `1.5px solid ${theme.colors.accent}`
                                        : 'none',
                                    fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Compact Horizontal Product Card (Style Guide Page 19)
export const CompactProductCard = ({
    image,
    title,
    subtitle,
    tags = [],
    onClick,
    theme,
    className = ''
}) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer ${className}`}
            style={{
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: DESIGN_TOKENS.shadows.sm
            }}
        >
            {/* Image */}
            {image && (
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4
                    className="text-base font-bold truncate"
                    style={{
                        color: theme.colors.textPrimary,
                        fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                    }}
                >
                    {title}
                </h4>
                {subtitle && (
                    <p
                        className="text-sm truncate"
                        style={{
                            color: theme.colors.textSecondary,
                            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex gap-2">
                    {tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                                backgroundColor: tag.bg || theme.colors.accent,
                                color: tag.color || '#FFFFFF',
                                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                            }}
                        >
                            {tag.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// Material/Fabric Card (Style Guide Page 22)
export const MaterialCard = ({
    image,
    name,
    category,
    metadata,
    tags = [],
    onClick,
    theme,
    variant = 'default', // 'default' | 'rounded' | 'square'
    className = ''
}) => {
    const borderRadius = variant === 'square' ? '12px' : variant === 'rounded' ? '24px' : '16px';

    return (
        <div
            onClick={onClick}
            className={`overflow-hidden transition-all hover:scale-[1.01] cursor-pointer ${className}`}
            style={{
                backgroundColor: theme.colors.surface,
                border: variant === 'rounded' ? `2px solid ${theme.colors.textPrimary}` : 'none',
                borderRadius,
                boxShadow: DESIGN_TOKENS.shadows.card
            }}
        >
            {/* Material Swatch */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                {/* Tags Overlay */}
                {tags.length > 0 && (
                    <div className="absolute top-3 right-3 flex gap-2">
                        {tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: tag.bg || theme.colors.accent,
                                    color: tag.color || '#FFFFFF',
                                    fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                                }}
                            >
                                {tag.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Material Info */}
            <div className="p-4">
                <h4
                    className="text-base font-bold mb-1"
                    style={{
                        color: theme.colors.textPrimary,
                        fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                    }}
                >
                    {name}
                </h4>
                {category && (
                    <p
                        className="text-sm mb-2"
                        style={{
                            color: theme.colors.textSecondary,
                            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                        }}
                    >
                        {category}
                    </p>
                )}
                {metadata && (
                    <p
                        className="text-xs"
                        style={{
                            color: theme.colors.textSecondary,
                            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                        }}
                    >
                        {metadata}
                    </p>
                )}
            </div>
        </div>
    );
};

// Hero Card with Overlay Text (Style Guide Page 21)
export const HeroCard = ({
    image,
    title,
    subtitle,
    description,
    actions = [],
    theme,
    className = ''
}) => {
    return (
        <div
            className={`relative rounded-3xl overflow-hidden h-96 ${className}`}
            style={{
                boxShadow: DESIGN_TOKENS.shadows.card
            }}
        >
            {/* Background Image */}
            <img
                src={image}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)'
                }}
            />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                {subtitle && (
                    <p
                        className="text-sm font-medium mb-2 uppercase tracking-wide"
                        style={{
                            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                            opacity: 0.9
                        }}
                    >
                        {subtitle}
                    </p>
                )}

                <h2
                    className="text-4xl lg:text-5xl font-bold mb-3"
                    style={{
                        fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1
                    }}
                >
                    {title}
                </h2>

                {description && (
                    <p
                        className="text-base mb-6 max-w-2xl"
                        style={{
                            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                            lineHeight: 1.6,
                            opacity: 0.9
                        }}
                    >
                        {description}
                    </p>
                )}

                {/* Actions */}
                {actions.length > 0 && (
                    <div className="flex gap-3">
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={action.onClick}
                                className="px-6 py-3 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    backgroundColor: action.variant === 'primary' ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                                    color: action.variant === 'primary' ? theme.colors.textPrimary : '#FFFFFF',
                                    backdropFilter: action.variant === 'secondary' ? 'blur(24px)' : 'none',
                                    fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Glass Card with Frost Effect (Style Guide Page 17)
export const GlassCard = ({
    children,
    theme,
    frostLevel = 'medium', // 'light' | 'medium' | 'heavy'
    className = ''
}) => {
    const blurValues = {
        light: '24px',
        medium: '34px',
        heavy: '44px'
    };

    return (
        <div
            className={`rounded-2xl p-6 ${className}`}
            style={{
                backgroundColor: `${theme.colors.surface}95`,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: `blur(${blurValues[frostLevel]})`,
                boxShadow: DESIGN_TOKENS.shadows.card
            }}
        >
            {children}
        </div>
    );
};
