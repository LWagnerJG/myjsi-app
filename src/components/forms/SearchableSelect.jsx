import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';

const normalizeOption = (option) => {
  if (typeof option === 'string') {
    return {
      value: option,
      label: option,
      description: '',
      searchText: option.toLowerCase(),
    };
  }

  const label = option.label || option.name || option.value || '';
  const description = option.description || option.meta || '';

  return {
    value: option.value || option.label || option.id || option.name || '',
    label,
    description,
    searchText: [label, description, option.searchText || ''].join(' ').toLowerCase(),
  };
};

const assignRef = (ref, node) => {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  ref.current = node;
};

export const SearchableSelect = ({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select...',
  theme,
  allowClear = false,
  size = 'md',
  displayValue,
  inlineSearch = false,
  inputClassName,
  inputStyle,
  dropdownIndicatorMode = 'always',
  leadingIndicator = false,
  onMissingAction,
  missingActionLabel,
  searchPlaceholder = 'Search...',
  buttonClassName = '',
  buttonStyle,
  onQueryChange,
  buttonRef,
  minQueryLength = 0,
  onBlurWithQuery,
  searchable = true,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  const norm = useMemo(() => options.map(normalizeOption), [options]);

  const filtered = useMemo(() => {
    if (!searchable) return norm;
    const normalizedQuery = query.toLowerCase();
    if (minQueryLength > 0 && normalizedQuery.length < minQueryLength) return [];
    if (!normalizedQuery) return norm;
    return norm.filter((option) => option.searchText.includes(normalizedQuery));
  }, [norm, query, minQueryLength, searchable]);

  const selectedOption = useMemo(() => norm.find((option) => option.value === value) || null, [norm, value]);
  const selectedLabel = displayValue || selectedOption?.label || '';

  const closeMenu = useCallback(() => {
    setOpen((wasOpen) => {
      if (wasOpen && onBlurWithQuery) {
        const trimmed = (inputRef.current?.value || '').trim();
        if (trimmed) onBlurWithQuery(trimmed);
      }
      return false;
    });
    setQuery('');
    onQueryChange && onQueryChange('');
  }, [onQueryChange, onBlurWithQuery]);

  const computePosition = useCallback(() => {
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - bounds.bottom;
    const estimatedHeight = Math.min(320, 56 + (filtered.length || 1) * 42);
    const direction = spaceBelow < estimatedHeight && bounds.top > estimatedHeight ? 'up' : 'down';
    const top = direction === 'down' ? bounds.bottom + 4 : bounds.top - estimatedHeight - 4;

    setMenuPos({ left: bounds.left, top, width: bounds.width, direction });
  }, [filtered.length]);

  useEffect(() => {
    if (!open) return;
    computePosition();

    const handlePositionChange = () => computePosition();
    window.addEventListener('resize', handlePositionChange);
    window.addEventListener('scroll', handlePositionChange, true);

    return () => {
      window.removeEventListener('resize', handlePositionChange);
      window.removeEventListener('scroll', handlePositionChange, true);
    };
  }, [computePosition, open]);

  useEffect(() => {
    if (!open) return;

    const handleDown = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      closeMenu();
    };

    document.addEventListener('mousedown', handleDown);
    document.addEventListener('touchstart', handleDown);

    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('touchstart', handleDown);
    };
  }, [closeMenu, open]);

  useEffect(() => {
    if (!open || !menuRef.current || !menuPos || menuPos.direction !== 'up') return;

    const menuHeight = menuRef.current.getBoundingClientRect().height;
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const correctedTop = bounds.top - menuHeight - 4;
    if (Math.abs(correctedTop - menuPos.top) > 2) {
      setMenuPos((current) => ({ ...current, top: correctedTop }));
    }
  }, [menuPos, open]);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  const openMenu = useCallback((seed = '') => {
    setOpen(true);
    setQuery(seed);
    onQueryChange && onQueryChange(seed);
  }, [onQueryChange]);

  const selectValue = (nextValue) => {
    onChange && onChange(nextValue);
    closeMenu();
  };

  const clear = (event) => {
    event.stopPropagation();
    selectValue('');
  };

  const sizeStyles = size === 'sm' ? 'py-2 text-sm' : 'py-3 text-base';
  const fieldClassName = inputClassName || buttonClassName;
  const fieldStyle = inputStyle || buttonStyle;
  const showDropdownIndicator = dropdownIndicatorMode !== 'hidden';
  const dropdownIndicatorClassName = dropdownIndicatorMode === 'focus'
    ? `transition-opacity ${open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`
    : 'transition-opacity opacity-100';

  const handleClosedKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === 'ArrowDown' || event.key === ' ') && !open) {
      event.preventDefault();
      openMenu('');
      return;
    }

    if (!open && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      openMenu(searchable ? event.key : '');
    }
  };

  const handleInlineKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'Enter' && filtered.length === 0 && onMissingAction) {
      event.preventDefault();
      onMissingAction();
      closeMenu();
    }
  };

  const renderOptions = () => (
    <ul className="max-h-64 overflow-y-auto px-1.5 py-1 scrollbar-hide" role="listbox" style={{ background: theme.colors.surface }}>
      {filtered.length === 0 && (
        <li className="px-4 py-3 text-center">
          {onMissingAction && missingActionLabel ? (
            <button
              type="button"
              onClick={() => {
                onMissingAction();
                closeMenu();
              }}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ background: theme.colors.subtle, color: theme.colors.textPrimary }}
            >
              {missingActionLabel}
            </button>
          ) : (
            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>No matches</div>
          )}
        </li>
      )}
      {filtered.map((option) => (
        <li key={option.value}>
          <button
            type="button"
            onClick={() => selectValue(option.value)}
            className={`w-full rounded-xl px-3.5 py-2 text-left text-sm transition-colors ${option.value === value ? 'font-semibold' : 'font-medium'}`}
            style={{
              color: theme.colors.textPrimary,
              backgroundColor: option.value === value ? `${theme.colors.accent}12` : 'transparent',
              border: `1px solid ${option.value === value ? `${theme.colors.accent}33` : 'transparent'}`,
            }}
            role="option"
            aria-selected={option.value === value}
          >
            <span className="block truncate leading-5">{option.label}</span>
            {option.description ? (
              <span className="mt-0.5 block truncate text-[0.6875rem] font-medium uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary }}>
                {option.description}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={containerRef} className="relative group">
      {inlineSearch ? (
        <div className="relative">
          {leadingIndicator ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-2 top-1/2 h-4 w-px -translate-y-1/2 rounded-full"
              style={{ backgroundColor: theme.colors.textSecondary, opacity: open || !selectedLabel ? 0.7 : 0.4 }}
            />
          ) : null}

          {open ? (
            <input
              ref={(node) => {
                inputRef.current = node;
                assignRef(buttonRef, node);
              }}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                onQueryChange && onQueryChange(event.target.value);
              }}
              onKeyDown={handleInlineKeyDown}
              placeholder={placeholder}
              className={`w-full rounded-full border transition-colors outline-none ${sizeStyles} ${fieldClassName}`}
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary, ...fieldStyle }}
              aria-haspopup="listbox"
              aria-expanded={open}
            />
          ) : (
            <button
              ref={(node) => assignRef(buttonRef, node)}
              type="button"
              onFocus={() => openMenu('')}
              onClick={() => openMenu('')}
              onKeyDown={handleClosedKeyDown}
              className={`w-full rounded-full border text-left transition-colors ${sizeStyles} ${buttonClassName}`}
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary, ...buttonStyle }}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <span className={`block truncate ${!selectedLabel ? 'opacity-60' : ''}`} style={{ color: theme.colors.textPrimary }}>
                {selectedLabel || placeholder}
              </span>
            </button>
          )}

          {showDropdownIndicator ? (
            <span className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 gap-1 ${dropdownIndicatorClassName}`}>
              <ChevronDown className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
            </span>
          ) : null}
        </div>
      ) : (
        <button
          ref={(node) => assignRef(buttonRef, node)}
          type="button"
          onClick={() => {
            if (open) {
              closeMenu();
              return;
            }
            openMenu('');
          }}
          onKeyDown={handleClosedKeyDown}
          className={`w-full px-4 pr-11 text-left rounded-full border transition-colors ${sizeStyles} ${buttonClassName}`}
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary, ...buttonStyle }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={`block truncate ${!selectedLabel ? 'opacity-60' : ''}`} style={{ color: theme.colors.textPrimary }}>
            {selectedLabel || placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 gap-1">
            {allowClear && value ? (
              <X onClick={clear} className="h-4 w-4 cursor-pointer hover:opacity-70" style={{ color: theme.colors.textSecondary }} />
            ) : null}
            {showDropdownIndicator ? (
              <ChevronDown className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
            ) : null}
          </span>
        </button>
      )}

      {open && menuPos && (minQueryLength === 0 || query.length >= minQueryLength) && filtered.length > 0 && createPortal(
        <div ref={menuRef} style={{ position: 'fixed', left: menuPos.left, top: menuPos.top, width: menuPos.width, zIndex: 10000 }}>
          <div className="overflow-hidden rounded-2xl border shadow-2xl" style={{ background: theme.colors.surface, borderColor: theme.colors.border }}>
            {!inlineSearch && searchable ? (
              <div className="px-2.5 pt-2.5 pb-1.5" style={{ background: theme.colors.surface }}>
                <input
                  ref={(node) => {
                    inputRef.current = node;
                  }}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    onQueryChange && onQueryChange(event.target.value);
                  }}
                  onKeyDown={handleInlineKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-full px-3.5 py-2 text-sm outline-none transition-colors"
                  style={{ background: theme.colors.background, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}
                />
              </div>
            ) : null}
            {renderOptions()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
