import React from 'react';
import { Send } from 'lucide-react';
import FloatingPill from './FloatingPill.jsx';

/**
 * Standard floating submit CTA used by form-style screens.
 * Keeps bottom actions visually consistent across the app.
 */
export const FloatingSubmitCTA = React.memo(({
    theme,
    label = 'Submit',
    icon,
    onClick,
    type = 'button',
    visible = true,
    disabled = false,
    zIndex = 20,
    className = '',
    style,
    iconContainerStyle,
}) => {
    const clickHandler = onClick || (() => {});

    return (
        <FloatingPill
            theme={theme}
            onClick={clickHandler}
            type={type}
            visible={visible}
            disabled={disabled}
            icon={icon === undefined ? <Send /> : icon}
            label={label}
            zIndex={zIndex}
            className={className}
            style={style}
            iconContainerStyle={iconContainerStyle}
        />
    );
});
FloatingSubmitCTA.displayName = 'FloatingSubmitCTA';

export default FloatingSubmitCTA;
