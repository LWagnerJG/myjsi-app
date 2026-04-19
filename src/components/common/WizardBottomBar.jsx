import React from 'react';
import { floatingBarStyle } from '../../design-system/tokens.js';

/**
 * Shared bottom chrome for multi-step wizard flows.
 * Provides consistent step pills, score slot, and action area.
 */
export const WizardBottomBar = ({
    theme,
    steps = [],
    currentStep = 0,
    onStepChange,
    healthNode,
    actionNode,
    className = '',
}) => {
    const c = theme.colors;
    const subtleBorder = `1px solid ${theme.colors.border || 'rgba(0,0,0,0.08)'}`;

    return (
        <div
            data-bottom-chrome=""
            className={`sticky bottom-0 z-20 rounded-t-2xl ${className}`}
            style={floatingBarStyle(theme)}
        >
            <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                    {steps.map((label, idx) => {
                        const active = currentStep === idx;
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => onStepChange && onStepChange(idx)}
                                className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all border"
                                style={{
                                    backgroundColor: active ? c.accent : 'transparent',
                                    border: active ? `1px solid ${c.accent}` : subtleBorder,
                                    color: active ? c.accentText : c.textSecondary,
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {healthNode || null}
            </div>

            <div
                className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 pb-2.5"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
            >
                {actionNode || null}
            </div>
        </div>
    );
};

export default WizardBottomBar;
