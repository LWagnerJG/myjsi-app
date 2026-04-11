import React from 'react';
import { PageTitle } from './PageTitle.jsx';

/**
 * Shared full-screen layout scaffold used by feature screens.
 * Standardizes app header offset, scroll area, content width, and optional footer CTA region.
 */
export const AppScreenLayout = ({
    theme,
    title,
    subtitle,
    onBack,
    showBack = true,
    showTitle = true,
    headerSlot,
    topSlot,
    footer,
    asForm = false,
    onSubmit,
    className = '',
    maxWidthClass = 'max-w-3xl',
    horizontalPaddingClass = 'px-4',
    contentPaddingBottomClass = 'pb-28',
    contentClassName = '',
    children,
}) => {
    const WrapperTag = asForm ? 'form' : 'div';
    const wrapperProps = asForm ? { onSubmit } : {};

    return (
        <div
            className={`flex flex-col h-full app-header-offset ${className}`}
            style={{ backgroundColor: theme.colors.background }}
        >
            <WrapperTag className="flex flex-col min-h-full" {...wrapperProps}>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className={`mx-auto w-full ${maxWidthClass} ${horizontalPaddingClass} ${contentPaddingBottomClass}`}>
                        {showTitle ? (
                            <PageTitle
                                title={title}
                                subtitle={subtitle}
                                theme={theme}
                                onBack={onBack}
                                showBack={showBack}
                            >
                                {headerSlot}
                            </PageTitle>
                        ) : null}

                        {topSlot || null}

                        <div className={contentClassName}>
                            {children}
                        </div>
                    </div>
                </div>

                {footer || null}
            </WrapperTag>
        </div>
    );
};

export default AppScreenLayout;
