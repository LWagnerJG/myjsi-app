// components/common/FormComponents.jsx
import React from "react";
import { ChevronDown, X, AlertCircle } from "lucide-react";

const H = 48;
const R = 24; // match --jsi-radius-input token

const Label = ({ children, theme, required }) => (
    <label
        className="block text-sm font-medium mb-1 px-1"
        style={{ color: theme.colors.textSecondary }}
    >
        {children} {required ? <span style={{ color: theme.colors.error }}>*</span> : null}
    </label>
);

export const FormInput = ({
    label,
    value,
    onChange,
    theme,
    type = "text",
    required = false,
    name,
    placeholder,
    whiteBg = false,
    insetLabel = false,
    softChrome = false,
    surfaceBackground,
    surfaceBorder,
    error,
    disabled,
    ...props
}) => {
    const inputRef = React.useRef(null);

    const baseBg = surfaceBackground ?? (softChrome ? theme.colors.background : whiteBg ? '#fff' : theme.colors.subtle);
    const errorBorder   = '1px solid rgba(184,92,92,0.5)';
    const baseBorder    = surfaceBorder ?? (
        error       ? errorBorder :
        softChrome  ? '1px solid rgba(0,0,0,0.04)' :
                      `1px solid ${theme.colors.border}`
    );

    const focusRingColor = theme.colors.focusRing || 'rgba(0,0,0,0.08)';
    const errorRingColor = 'rgba(184,92,92,0.18)';

    const handleFocus = () => {
        if (!inputRef.current) return;
        inputRef.current.style.boxShadow = `0 0 0 3px ${error ? errorRingColor : focusRingColor}`;
        if (!error) {
            inputRef.current.style.borderColor = softChrome
                ? 'rgba(0,0,0,0.08)'
                : (theme.colors.accent || theme.colors.border);
        }
    };
    const handleBlur = () => {
        if (!inputRef.current) return;
        inputRef.current.style.boxShadow = error ? `0 0 0 3px ${errorRingColor}` : 'none';
        inputRef.current.style.borderColor = error
            ? 'rgba(184,92,92,0.5)'
            : softChrome ? 'rgba(0,0,0,0.04)' : theme.colors.border;
    };

    const common = {
        borderRadius: R,
        backgroundColor: baseBg,
        border: baseBorder,
        color: theme.colors.textPrimary,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : undefined,
        transition: 'box-shadow 150ms ease, border-color 150ms ease',
    };

    return (
        <div className={insetLabel ? "relative" : undefined}>
            {label && !insetLabel ? (
                <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
                    {label} {required ? <span style={{ color: theme.colors.error }}>*</span> : null}
                </label>
            ) : null}

            {label && insetLabel ? (
                <label
                    className="absolute left-[14px] top-[8px] z-[1] text-[11px] font-medium leading-none"
                    style={{ color: theme.colors.textSecondary }}
                >
                    {label} {required ? <span style={{ color: theme.colors.error }}>*</span> : null}
                </label>
            ) : null}

            {type === "textarea" ? (
                <textarea
                    ref={inputRef}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required={required}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full outline-none text-sm placeholder-opacity-70"
                    style={{
                        minHeight: 96,
                        resize: "none",
                        padding: insetLabel ? "28px 14px 10px" : "10px 14px",
                        ...common
                    }}
                    {...props}
                />
            ) : (
                <input
                    ref={inputRef}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required={required}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full outline-none text-sm placeholder-opacity-70"
                    style={{
                        height: insetLabel ? 56 : H,
                        padding: insetLabel ? "18px 14px 6px" : "0 14px",
                        paddingRight: error ? 38 : (insetLabel ? 14 : 14),
                        ...common
                    }}
                    {...props}
                />
            )}

            {/* Error icon overlay (inputs only) and error message */}
            {error && type !== "textarea" && (
                <div
                    className="pointer-events-none absolute right-3 top-1/2 flex items-center justify-center"
                    style={{
                        transform: insetLabel ? 'translateY(-25%)' : 'translateY(-50%)',
                        top: insetLabel ? '50%' : '50%',
                    }}
                >
                    <AlertCircle className="w-4 h-4" style={{ color: 'rgba(184,92,92,0.8)' }} />
                </div>
            )}

            {error && (
                <p className="mt-1.5 px-1 text-xs font-medium" style={{ color: '#B85C5C' }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export const PortalNativeSelect = ({
    label,
    value,
    onChange,
    theme,
    options = [],
    placeholder,
    required = false,
    whiteBg = false,
    insetLabel = false,
    softChrome = false,
    surfaceBackground,
    surfaceBorder,
    error,
    disabled,
    ...props
}) => {
    const selectRef = React.useRef(null);
    const baseBg = surfaceBackground ?? (softChrome ? theme.colors.background : whiteBg ? '#fff' : theme.colors.subtle);
    const errorBorder = '1px solid rgba(184,92,92,0.5)';
    const baseBorder  = surfaceBorder ?? (
        error       ? errorBorder :
        softChrome  ? '1px solid rgba(0,0,0,0.04)' :
                      `1px solid ${theme.colors.border}`
    );
    const placeholderColor = theme.colors.textSecondary;
    const focusRingColor   = theme.colors.focusRing || 'rgba(0,0,0,0.08)';
    const errorRingColor   = 'rgba(184,92,92,0.18)';

    const handleFocus = () => {
        if (!selectRef.current) return;
        selectRef.current.style.boxShadow = `0 0 0 3px ${error ? errorRingColor : focusRingColor}`;
        selectRef.current.style.borderColor = error
            ? 'rgba(184,92,92,0.5)'
            : softChrome ? 'rgba(0,0,0,0.08)' : theme.colors.border;
    };
    const handleBlur = () => {
        if (!selectRef.current) return;
        selectRef.current.style.boxShadow = error ? `0 0 0 3px ${errorRingColor}` : 'none';
        selectRef.current.style.borderColor = error
            ? 'rgba(184,92,92,0.5)'
            : softChrome ? 'rgba(0,0,0,0.04)' : theme.colors.border;
    };

    return (
        <div className="relative">
            {label && !insetLabel ? <Label theme={theme} required={required}>{label}</Label> : null}
            {label && insetLabel ? (
                <label
                    className="pointer-events-none absolute left-4 top-2 z-[1] text-[11px] font-medium leading-none"
                    style={{ color: theme.colors.textSecondary }}
                >
                    {label} {required ? <span style={{ color: theme.colors.error }}>*</span> : null}
                </label>
            ) : null}
            <div className="relative">
                <select
                    ref={selectRef}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required={required}
                    disabled={disabled}
                    className="w-full appearance-none outline-none text-sm transition-colors"
                    style={{
                        height: insetLabel ? 56 : H,
                        padding: insetLabel ? "18px 44px 6px 16px" : "0 44px 0 16px",
                        borderRadius: R,
                        backgroundColor: baseBg,
                        border: baseBorder,
                        color: value ? theme.colors.textPrimary : placeholderColor,
                        lineHeight: insetLabel ? 'normal' : `${H - 2}px`,
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        opacity: disabled ? 0.5 : 1,
                        cursor: disabled ? 'not-allowed' : undefined,
                        transition: 'box-shadow 150ms ease, border-color 150ms ease',
                    }}
                    {...props}
                >
                    {placeholder ? <option value="" disabled>{placeholder}</option> : null}
                    {options.map(o => {
                        const opt = typeof o === 'string' ? { value: o, label: o } : o;
                        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                    })}
                </select>
                <div
                    className="pointer-events-none absolute right-3 top-1/2 flex items-center justify-center"
                    style={{ width: 18, height: 18, transform: 'translateY(-50%)' }}
                >
                    <ChevronDown style={{ width: 18, height: 18, color: theme.colors.textSecondary }} />
                </div>
            </div>
            {error && (
                <p className="mt-1.5 px-1 text-xs font-medium" style={{ color: '#B85C5C' }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export const TagInput = ({
    label,
    tags,
    onTagsChange,
    theme,
    suggestions = [],
    whiteBg = false
}) => {
    const [inputValue, setInputValue] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const boxRef = React.useRef(null);

    const filtered = React.useMemo(
        () =>
            suggestions
                .filter(
                    (s) =>
                        s.toLowerCase().includes(inputValue.toLowerCase()) &&
                        !tags.includes(s)
                )
                .slice(0, 8),
        [suggestions, inputValue, tags]
    );

    const add = (v) => {
        const t = v.trim();
        if (!t || tags.includes(t)) return;
        onTagsChange([...tags, t]);
        setInputValue("");
        setOpen(false);
    };

    React.useEffect(() => {
        const onDoc = (e) => {
            if (!boxRef.current) return;
            if (!boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    return (
        <div ref={boxRef} className="relative">
            {label ? <Label theme={theme}>{label}</Label> : null}
            <div
                className="w-full flex flex-wrap items-center gap-2"
                style={{
                    minHeight: H,
                    padding: 8,
                    borderRadius: R,
                    backgroundColor: whiteBg ? '#fff' : theme.colors.subtle,
                    border: `1px solid ${theme.colors.border}`,
                }}
                onClick={() => setOpen(true)}
            >
                {tags.map((t) => (
                    <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                        style={{
                            backgroundColor: theme.colors.accent + '14',
                            color: theme.colors.textPrimary,
                            border: `1px solid ${theme.colors.accent}33`,
                        }}
                    >
                        {t}
                        <button
                            onMouseDown={(e) => { e.preventDefault(); onTagsChange(tags.filter((x) => x !== t)); }}
                            className="p-1"
                            aria-label={`Remove ${t}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setOpen(true); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(inputValue); } }}
                    placeholder="Add competitor..."
                    className="flex-1 min-w-[140px] bg-transparent outline-none text-sm"
                    style={{ color: theme.colors.textPrimary }}
                />
            </div>
            {open && filtered.length > 0 && (
                <div
                    className="absolute z-10 w-full mt-2 rounded-2xl overflow-hidden"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        boxShadow: '0 8px 24px rgba(0,0,0,.1)',
                    }}
                >
                    {filtered.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); add(s); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
