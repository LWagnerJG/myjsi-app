// components/common/FormComponents.jsx
import React from "react";
import { ChevronDown, X } from "lucide-react";

const H = 48;
const R = 16; // unify radius with inputs

const Label = ({ children, theme, required }) => (
    <label
        className="block text-sm font-medium mb-1 px-1"
        style={{ color: theme.colors.textSecondary }}
    >
        {children} {required ? <span style={{ color: '#B85C5C' }}>*</span> : null}
    </label>
);

export const FormInput = ({
    label, value, onChange, theme, type = "text", required = false, name, placeholder, whiteBg = false, ...props
}) => {
    const baseBg = whiteBg ? '#fff' : theme.colors.subtle;
    const baseBorder = `1px solid ${theme.colors.border}`;
    const common = {
        borderRadius: R,
        backgroundColor: baseBg,
        border: baseBorder,
        color: theme.colors.textPrimary,
    };
    return (
    <div>
        {label ? (
            <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
                {label} {required ? <span style={{ color: '#B85C5C' }}>*</span> : null}
            </label>
        ) : null}

        {type === "textarea" ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full focus-ring outline-none text-sm placeholder-opacity-70"
                style={{
                    minHeight: 96,
                    resize: "none",
                    padding: "10px 14px",
                    ...common
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
                className="w-full focus-ring outline-none text-sm placeholder-opacity-70"
                style={{
                    height: H,
                    padding: "0 14px",
                    ...common
                }}
                {...props}
            />
        )}
    </div>);
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
    ...props
}) => {
    const selectRef = React.useRef(null);
    const baseBg = whiteBg ? '#fff' : theme.colors.subtle;
    const placeholderColor = theme.colors.textSecondary;

    const handleFocus = () => {
        if (selectRef.current) {
            selectRef.current.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)';
            selectRef.current.style.borderColor = theme.colors.accent;
        }
    };
    const handleBlur = () => {
        if (selectRef.current) {
            selectRef.current.style.boxShadow = 'none';
            selectRef.current.style.borderColor = theme.colors.border;
        }
    };

    return (
        <div className="relative">
            {label ? <Label theme={theme} required={required}>{label}</Label> : null}
            <select
                ref={selectRef}
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required={required}
                className="w-full appearance-none outline-none text-sm transition-colors"
                style={{
                    height: H,
                    padding: "0 44px 0 16px",
                    borderRadius: R,
                    backgroundColor: baseBg,
                    border: `1px solid ${theme.colors.border}`,
                    color: value ? theme.colors.textPrimary : placeholderColor,
                    lineHeight: `${H - 2}px`,
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                }}
                {...props}
            >
                {placeholder ? <option value="" disabled>{placeholder}</option> : null}
                {options.map(o => { const opt = typeof o === 'string' ? { value: o, label: o } : o; return <option key={opt.value} value={opt.value}>{opt.label}</option>; })}
            </select>
            <div className="pointer-events-none absolute top-0 bottom-0 right-3 flex items-center justify-center" style={{ width:28 }}>
                <ChevronDown style={{ width: 18, height: 18, color: theme.colors.textSecondary }} />
            </div>
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
        const onDoc = (e) => { if (!boxRef.current) return; if (!boxRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    return (
        <div ref={boxRef} className="relative">
            {label ? <Label theme={theme}>{label}</Label> : null}
            <div
                className="w-full flex flex-wrap items-center gap-2 focus-ring"
                style={{ minHeight: H, padding: 8, borderRadius: R, backgroundColor: whiteBg? '#fff': theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
                onClick={() => setOpen(true)}
            >
                {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm" style={{ backgroundColor: theme.colors.accent + '14', color: theme.colors.textPrimary, border: `1px solid ${theme.colors.accent}33` }}>
                        {t}
                        <button onMouseDown={(e) => { e.preventDefault(); onTagsChange(tags.filter((x) => x !== t)); }} className="p-1">
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
                <div className="absolute z-10 w-full mt-2 rounded-2xl overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, boxShadow: '0 8px 24px rgba(0,0,0,.1)' }}>
                    {filtered.map((s) => (
                        <button key={s} type="button" onMouseDown={(e) => { e.preventDefault(); add(s); }} className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.colors.textPrimary }}>
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
