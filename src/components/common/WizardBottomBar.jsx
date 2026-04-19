import React from 'react';
import { Check } from 'lucide-react';
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

    return (
        <div
            data-bottom-chrome=""
            className={`sticky bottom-0 z-20 rounded-t-2xl ${className}`}
            style={floatingBarStyle(theme)}
        >
            <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
                {/* Step pills + health */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        {steps.map((label, idx) => {
                            const active = currentStep === idx;
                            const completed = currentStep > idx;
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => onStepChange && onStepChange(idx)}
                                    className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5"
                                    style={{
                                        backgroundColor: active ? c.accent : completed ? `${c.accent}18` : 'transparent',
                                        border: active ? `1.5px solid ${c.accent}` : completed ? `1.5px solid ${c.accent}50` : `1.5px solid ${c.border || 'rgba(0,0,0,0.08)'}`,
                                        color: active ? c.accentText : completed ? c.accent : c.textSecondary,
                                        letterSpacing: '0.01em',
                                    }}
                                >
                                    {completed ? (
                                        <Check className="w-3 h-3" strokeWidth={3} />
                                    ) : (
                                        <span style={{ opacity: active ? 0.7 : 0.45, fontSize: '0.625rem', fontWeight: 700 }}>{idx + 1}</span>
                                    )}
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {healthNode || null}
                </div>
            </div>

            <div
                className="max-w-content mx-auto px-4 sm:px-6 lg:px-8"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
            >
                {actionNode || null}
            </div>
        </div>
    );
};

export default WizardBottomBar;
