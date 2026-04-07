import React, { useEffect } from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

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
    const dark = isDarkTheme(theme);
    const subtleBorder = dark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)';

    const textSizeClass = size === 'sm' ? 'text-[14px]' : 'text-base';
    const paddingClass = size === 'sm' ? 'px-4' : 'px-4 py-3';
    const dateDarkClass = type === 'date' && dark ? 'jsi-date-dark' : '';
    const inputClass = `w-full ${paddingClass} border rounded-full focus:outline-none focus:ring-0 ${textSizeClass} ${dateDarkClass} ${icon ? 'pr-10' : ''} ${className}`;

    // On dark: always use background color so inputs appear as inset wells below the card surface
    const backgroundColor = dark ? theme.colors.background : (surfaceBg ? theme.colors.surface : theme.colors.subtle);

    const styles = {
        backgroundColor,
        borderColor: subtleBorder,
        color: readOnly && !controlledValue ? theme.colors.textSecondary : theme.colors.textPrimary,
        ...(size === 'sm' ? { height: 40 } : {}),
    };

    // inject placeholder color — update when theme changes
    useEffect(() => {
        const id = 'form-input-placeholder-style';
        let style = document.getElementById(id);
        if (!style) {
            style = document.createElement('style');
            style.id = id;
            document.head.appendChild(style);
        }
        style.innerHTML = `.placeholder-theme-secondary::placeholder{color:${theme.colors.textSecondary}!important;opacity:1;}`;
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
                        className={`w-full ${size === 'sm' ? 'px-4 py-2.5' : 'px-4 py-3'} border rounded-2xl focus:outline-none focus:ring-0 ${textSizeClass} placeholder-theme-secondary ${className}`}
                        style={{ ...styles, resize: 'none', height: 'auto' }}
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