// QuickActionDropdown - Plus button dropdown for quick actions
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, FileText, Upload, FileSpreadsheet, MessageSquarePlus, Presentation, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_ACTIONS = [
    { id: 'presentation-builder', label: 'Presentation Builder', icon: Presentation, description: 'AI-generate a custom deck' },
    { id: 'quote', label: 'Request a Quote', icon: FileText, description: 'Get pricing for your project' },
    { id: 'upload', label: 'Upload a File', icon: Upload, description: 'Share documents or specs' },
    { id: 'spec', label: 'Spec Check Request', icon: FileSpreadsheet, description: 'Verify product specifications' },
    { id: 'feedback', label: 'Send Feedback', icon: MessageSquarePlus, description: 'Share your thoughts' },
];

export const QuickActionDropdown = ({ theme, onActionSelect, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const colors = {
        surface: theme?.colors?.surface || '#FFFFFF',
        textPrimary: theme?.colors?.textPrimary || '#353535',
        textSecondary: theme?.colors?.textSecondary || '#666666',
        border: theme?.colors?.border || '#E3E0D8',
        accent: theme?.colors?.accent || '#353535',
    };

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 280;
            
            let left = rect.right - dropdownWidth;
            let top = rect.bottom + 8;

            // Ensure dropdown doesn't go off-screen
            if (left < 16) left = 16;
            if (left + dropdownWidth > window.innerWidth - 16) {
                left = window.innerWidth - dropdownWidth - 16;
            }

            setPosition({ top, left });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(e.target) && 
                buttonRef.current && 
                !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleActionClick = (actionId) => {
        setIsOpen(false);
        onActionSelect?.(actionId);
    };

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className="fixed z-[1000] w-[280px] rounded-2xl overflow-hidden"
                    style={{
                        top: position.top,
                        left: position.left,
                        backgroundColor: colors.surface,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        border: `1px solid ${colors.border}`,
                    }}
                >
                    {/* Header */}
                    <div 
                        className="px-4 py-3 border-b"
                        style={{ borderColor: colors.border }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textSecondary }}>
                                Quick Actions
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
                            </button>
                        </div>
                    </div>

                    {/* Actions List */}
                    <div className="py-2">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleActionClick(action.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/[0.03] transition-colors text-left group"
                            >
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                                    style={{ backgroundColor: `${colors.accent}0D` }}
                                >
                                    <action.icon className="w-5 h-5" style={{ color: colors.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                        {action.label}
                                    </div>
                                    <div className="text-xs truncate" style={{ color: colors.textSecondary }}>
                                        {action.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 ${isOpen ? 'bg-black/5 rotate-45' : ''} ${className}`}
                style={{ color: colors.textSecondary }}
                aria-label="Quick actions"
                aria-expanded={isOpen}
            >
                <Plus className="w-5 h-5 transition-transform" />
            </button>
            {ReactDOM.createPortal(dropdownContent, document.body)}
        </>
    );
};

export default QuickActionDropdown;
