import React from 'react';
import { Send } from 'lucide-react';
import FloatingPill from './FloatingPill.jsx';

/**
 * Standard floating submit CTA used by form-style screens.
 * Keeps bottom actions visually consistent across the app.
 */
export const FloatingSubmitCTA = ({
    theme,
    label = 'Submit',
    icon,
    onClick,
    type = 'button',
    visible = true,
    disabled = false,
    zIndex = 20,
    className = '',
}) => {
    const clickHandler = onClick || (() => {});

    return (
        <FloatingPill
            theme={theme}
            onClick={clickHandler}
            type={type}
            visible={visible}
            disabled={disabled}
            icon={icon || <Send />}
            label={label}
            zIndex={zIndex}
            className={className}
        />
    );
};

export default FloatingSubmitCTA;
