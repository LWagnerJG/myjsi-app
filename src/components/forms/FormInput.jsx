import React from 'react';

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
}) => {
    const controlledValue = value === undefined || value === null ? '' : value;

    const inputClass = `w-full px-4 py-3 border rounded-full focus:ring-2 text-base outline-none ${icon ? 'pr-10' : ''} ${className}`;

    const styles = {
        backgroundColor: theme.colors.subtle,
        borderColor: theme.colors.border,
        color: readOnly && !controlledValue ? theme.colors.textSecondary : theme.colors.textPrimary,
        ringColor: theme.colors.accent,
    };

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
                        className={inputClass}
                        style={styles}
                        placeholder={placeholder}
                        required={required}
                    />
                ) : type === 'textarea' ? (
                    <textarea
                        name={name}
                        value={controlledValue}
                        onChange={onChange}
                        className="w-full px-4 py-3 border rounded-3xl focus:ring-2 text-base outline-none"
                        style={{ ...styles, resize: 'none' }}
                        rows="4"
                        placeholder={placeholder}
                        readOnly={readOnly}
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={controlledValue}
                        onChange={onChange}
                        className={inputClass}
                        style={styles}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        required={required}
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