import React from 'react';
import { PageTitle } from './PageTitle.jsx';

/**
 * Shared full-screen layout scaffold used by feature screens.
 * Standardizes app header offset, scroll area, content width, and optional footer CTA region.
 *
 * nestedScroll (default true): scroll inside this layout.
 * nestedScroll=false: let the parent `.panel-content` be the only scroller
 * (avoids nested overflow traps on phone, e.g. Scan shipment overview).
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
    maxWidthClass = 'max-w-content',
    horizontalPaddingClass = 'px-4 sm:px-6 lg:px-8',
    contentPaddingBottomClass = 'pb-28',
    contentClassName = '',
    nestedScroll = true,
    children,
}) => {
    const WrapperTag = asForm ? 'form' : 'div';
    const wrapperProps = asForm ? { onSubmit } : {};

    return (
        <div
            className={`flex flex-col app-header-offset ${nestedScroll ? 'h-full' : 'min-h-full'} ${className}`}
            style={{ backgroundColor: theme.colors.background }}
        >
            <WrapperTag className={`flex flex-col ${nestedScroll ? 'min-h-full flex-1' : 'min-h-full'}`} {...wrapperProps}>
                <div className={nestedScroll ? 'flex-1 overflow-y-auto scrollbar-hide' : ''}>
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
