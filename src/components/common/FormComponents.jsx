import React from 'react';

export const FormInput = ({ label, value, onChange, theme, type = 'text', required = false, name, placeholder, ...props }) => (
    <div>
        <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border text-base"
                style={{
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary,
                    minHeight: '80px',
                    resize: 'none'
                }}
                {...props}
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border text-base"
                style={{
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary
                }}
                {...props}
            />
        )}
    </div>
);

export const PortalNativeSelect = ({ label, value, onChange, theme, options = [], ...props }) => (
    <div>
        {label && (
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                {label}
            </label>
        )}
        <select
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.textPrimary
            }}
            {...props}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

export const TagInput = ({ label, tags, onTagsChange, theme, suggestions = [] }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!tags.includes(inputValue.trim())) {
                onTagsChange([...tags, inputValue.trim()]);
            }
            setInputValue('');
            setShowSuggestions(false);
        }
    };

    const removeTag = (tagToRemove) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    const addSuggestion = (suggestion) => {
        if (!tags.includes(suggestion)) {
            onTagsChange([...tags, suggestion]);
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const filteredSuggestions = suggestions.filter(
        s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
    );

    return (
        <div>
            <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
                {label}
            </label>
            <div className="relative">
                <div
                    className="w-full px-3 py-2 rounded-lg border flex flex-wrap items-center gap-2"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                    }}
                >
                    {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-sm px-2 py-1 rounded-full" style={{ backgroundColor: theme.colors.accent, color: 'white' }}>
                            {tag}
                            <button onClick={() => removeTag(tag)} className="text-white">&times;</button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                        className="flex-grow bg-transparent outline-none"
                        style={{ color: theme.colors.textPrimary }}
                        placeholder="Add competitor..."
                    />
                </div>
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 rounded-lg border shadow-lg" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                        {filteredSuggestions.map(suggestion => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addSuggestion(suggestion)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};