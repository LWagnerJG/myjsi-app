import React, { useEffect } from 'react';

export const FormInput = React.memo(({
    label,
    type = 'text',
    value,
    onChange,
    name,
    placeholder,
    className = "",
    theme,
    readOnly = false,
    required = false,
    icon = null,
    size = 'base', // 'base' | 'sm'
    surfaceBg = false, // when true uses surface (lighter) instead of subtle
}) => {
    const controlledValue = value === undefined || value === null ? '' : value;

    const textSizeClass = size === 'sm' ? 'text-sm' : 'text-base';
    const inputClass = `w-full px-4 py-3 border rounded-full focus:ring-2 outline-none ${textSizeClass} ${icon ? 'pr-10' : ''} ${className}`;

    const backgroundColor = surfaceBg ? theme.colors.surface : theme.colors.subtle;

    const styles = {
        backgroundColor,
        borderColor: theme.colors.border,
        color: readOnly && !controlledValue ? theme.colors.textSecondary : theme.colors.textPrimary,
        ringColor: theme.colors.accent,
    };

    // inject placeholder color class once (theme dependent best-effort)
    useEffect(() => {
        const id = 'form-input-placeholder-style';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.innerHTML = `.placeholder-theme-secondary::placeholder{color:${theme.colors.textSecondary}!important;opacity:1;}`;
            document.head.appendChild(style);
        }
    }, [theme.colors.textSecondary]);

    const formatCurrency = (val) => {
        if (!val) return '';
        const numericValue = String(val).replace(/[^0-9]/g, '');
        if (!numericValue) return '$';
        return '$' + new Intl.NumberFormat('en-US').format(numericValue);
    };

    const handleCurrencyChange = (e) => {
        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        onChange({
            target: {
                name: name,
                value: numericValue
            }
        });
    };

    const baseProps = {
        name,
        value: controlledValue,
        onChange,
        className: inputClass + ' placeholder-theme-secondary',
        style: styles,
        placeholder,
        readOnly,
        required
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <div className="relative">
                {type === 'currency' ? (
                    <input
                        type="text"
                        name={name}
                        value={formatCurrency(controlledValue)}
                        onChange={handleCurrencyChange}
                        className={inputClass + ' placeholder-theme-secondary'}
                        style={styles}
                        placeholder={placeholder}
                        required={required}
                    />
                ) : type === 'textarea' ? (
                    <textarea
                        {...baseProps}
                        rows="4"
                        className={`w-full px-4 py-3 border rounded-3xl focus:ring-2 outline-none ${textSizeClass} placeholder-theme-secondary ${className}`}
                        style={{ ...styles, resize: 'none' }}
                    />
                ) : (
                    <input
                        type={type}
                        {...baseProps}
                    />
                )}
                {icon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
});