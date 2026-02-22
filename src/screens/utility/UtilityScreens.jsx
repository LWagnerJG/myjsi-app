import React, { 
    useState, 
    useRef,
    useEffect
} from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { 
    Package, 
    ChevronDown
} from 'lucide-react';

// Custom Select Component - shared utility component
const CustomSelect = ({ label, value, onChange, options, theme, placeholder, required, onOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);

    const handleSelect = (option) => {
        onChange({ target: { value: option.value } });
        setIsOpen(false);
    };

    const handleToggle = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (onOpen && newIsOpen) onOpen();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Calculate dynamic height based on number of options
    const dropdownStyle = React.useMemo(() => {
        if (!options || options.length === 0) return {};
        
        const optionHeight = 32; // py-2 + text height ? 32px per option  
        const maxVisibleOptions = 8; // Show max 8 options before scrolling
        const calculatedHeight = Math.min(options.length, maxVisibleOptions) * optionHeight;
        const needsScrolling = options.length > maxVisibleOptions;
        
        return {
            height: needsScrolling ? `${calculatedHeight}px` : 'auto',
            maxHeight: needsScrolling ? `${calculatedHeight}px` : 'none',
            overflowY: needsScrolling ? 'auto' : 'visible'
        };
    }, [options]);

    return (
        <div className={`relative ${isOpen ? 'z-20' : ''}`} ref={buttonRef}>
            {label && (
                <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
                    {label} {required && <span style={{ color: '#B85C5C' }}>*</span>}
                </label>
            )}
            <button
                type="button"
                onClick={handleToggle}
                className="w-full px-3 py-2 rounded-lg border text-sm text-left flex items-center justify-between transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:bg-white/5 transform active:scale-95"
                style={{
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary
                }}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div 
                    className="absolute z-10 w-full mt-1 rounded-lg border shadow-lg opacity-100 transform scale-100 transition-all duration-150" 
                    style={{ 
                        backgroundColor: theme.colors.surface, 
                        borderColor: theme.colors.border,
                        transformOrigin: 'top center',
                        boxShadow: `0 4px 12px ${theme.colors.shadow || 'rgba(0, 0, 0, 0.08)'}`,
                        // Explicitly remove backdrop filters for solid appearance
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
                        ...dropdownStyle
                    }}
                >
                    <div className={dropdownStyle.overflowY === 'auto' ? 'scrollbar-hide' : ''} style={{ height: '100%' }}>
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 dark:hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg transition-all duration-200 transform active:scale-95"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Resource detail screen placeholder - truly generic utility
export const ResourceDetailScreen = ({ theme, currentScreen }) => (
    <div className="p-4">
        <PageTitle title="Resource Detail" theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            <p style={{ color: theme.colors.textPrimary }}>
                Resource details for {currentScreen} coming soon.
            </p>
        </GlassCard>
    </div>
);

// Export shared utility components
export { CustomSelect };