import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard.jsx';

export const Modal = ({ show, onClose, title, children, theme }) => {
    React.useEffect(() => {
        if (show) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [show]);

    if (!show) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999] transition-opacity duration-300 pointer-events-auto p-4"
            style={{ opacity: show ? 1 : 0 }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl flex flex-col transition-transform duration-300 transform shadow-2xl"
                style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                }}
            >
                {title && (
                    <div
                        className="flex justify-between items-center p-4 border-b flex-shrink-0"
                        style={{ borderColor: theme.colors.border }}
                    >
                        <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                            style={{ backgroundColor: theme.colors.subtle }}
                        >
                            <X className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        </button>
                    </div>
                )}
                <div
                    className={`${title ? "p-6" : "pt-8 px-6 pb-6"} overflow-y-auto space-y-4 scrollbar-hide`}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};