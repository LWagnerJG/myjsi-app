import React from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const ScreenTopChrome = React.memo(({
    theme,
    children,
    className = '',
    contentClassName = '',
    maxWidthClass = 'max-w-5xl',
    horizontalPaddingClass = 'px-4',
    fade = true,
}) => {
    const dark = isDarkTheme(theme);
    const bgRgb = dark ? '26,26,26' : '240,237,232';

    return (
        <div className={`relative flex-shrink-0 ${className}`.trim()} style={{ backgroundColor: theme.colors.background }}>
            <div className={`mx-auto w-full ${maxWidthClass} ${horizontalPaddingClass} ${contentClassName}`.trim()}>
                {children}
            </div>
            {fade ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 right-0 bottom-0 translate-y-full"
                    style={{
                        height: 32,
                        zIndex: 1,
                        background: `linear-gradient(to bottom,
                            rgba(${bgRgb},0.52) 0%,
                            rgba(${bgRgb},0.28) 35%,
                            rgba(${bgRgb},0.10) 65%,
                            rgba(${bgRgb},0) 100%)`,
                    }}
                />
            ) : null}
        </div>
    );
});

ScreenTopChrome.displayName = 'ScreenTopChrome';

export default ScreenTopChrome;