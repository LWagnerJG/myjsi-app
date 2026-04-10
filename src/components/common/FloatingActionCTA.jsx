import React from 'react';
import FloatingPill from './FloatingPill.jsx';

/**
 * Shared floating action CTA for non-submit actions.
 * Keeps screen-level floating action pills consistent without importing FloatingPill directly.
 */
export const FloatingActionCTA = ({
    theme,
    onClick,
    visible = true,
    icon,
    label,
    className = '',
    type = 'button',
    disabled = false,
    zIndex = 20,
}) => (
    <FloatingPill
        theme={theme}
        onClick={onClick}
        visible={visible}
        icon={icon}
        label={label}
        className={className}
        type={type}
        disabled={disabled}
        zIndex={zIndex}
    />
);

export default FloatingActionCTA;
