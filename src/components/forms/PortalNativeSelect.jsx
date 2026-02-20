import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

/* ──────────────────────────────────────────────────────────────────
   PortalNativeSelect — On-brand custom dropdown
   ─ Framer-motion entrance / exit
   ─ Keyboard navigation (↑↓ Home End Esc Enter Space, type-ahead)
   ─ ARIA listbox roles
   ─ Smart positioning (opens upward when near viewport bottom)
   ─ Portal-rendered so it escapes scroll containers / modals
   ────────────────────────────────────────────────────────────────── */

const DROPDOWN_ANIMATION = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -4, scale: 0.97 },
  transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
};

export const PortalNativeSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  theme,
  required = false,
  mutedValues = [],
  size = 'default',        // 'sm' | 'default'  — sm is compact/inline
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [openAbove, setOpenAbove] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const [typeAhead, setTypeAhead] = useState('');

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);
  const typeTimer = useRef(null);

  // Normalise options to { value, label }
  const normOptions = useMemo(
    () => options.map(o => (typeof o === 'string' ? { value: o, label: o } : o)),
    [options],
  );

  // Derived display state
  const selectedOpt = normOptions.find(o => o.value === value);
  const displayText = selectedOpt ? selectedOpt.label : placeholder;
  const isMuted = selectedOpt && mutedValues.includes(selectedOpt.value);
  const isPlaceholder = !selectedOpt;

  // ── Position calculation ──────────────────────────────────────
  const recalcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const maxH = 340;
    const pad = 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < maxH + pad && rect.top > maxH + pad;
    setOpenAbove(above);
    setPosition({
      top: above
        ? rect.top + window.scrollY - pad
        : rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 200),
    });
  }, []);

  // ── Open / close helpers ──────────────────────────────────────
  const open = useCallback(() => {
    recalcPosition();
    setIsOpen(true);
    const idx = normOptions.findIndex(o => o.value === value);
    setFocusIdx(idx >= 0 ? idx : 0);
  }, [recalcPosition, normOptions, value]);

  const close = useCallback(() => { setIsOpen(false); setTypeAhead(''); }, []);
  const toggle = useCallback((e) => { e.preventDefault(); e.stopPropagation(); isOpen ? close() : open(); }, [isOpen, open, close]);

  const select = useCallback((val) => {
    onChange({ target: { value: val } });
    close();
    triggerRef.current?.focus();
  }, [onChange, close]);

  // ── Click-outside + scroll / resize ───────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      close();
    };
    const onScrollOrResize = () => recalcPosition();
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [isOpen, close, recalcPosition]);

  // ── Scroll focused option into view ───────────────────────────
  useEffect(() => {
    if (isOpen && focusIdx >= 0 && itemRefs.current[focusIdx]) {
      itemRefs.current[focusIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [focusIdx, isOpen]);

  // ── Keyboard navigation ───────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setFocusIdx(i => Math.min(i + 1, normOptions.length - 1)); break;
      case 'ArrowUp':   e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)); break;
      case 'Home':      e.preventDefault(); setFocusIdx(0); break;
      case 'End':       e.preventDefault(); setFocusIdx(normOptions.length - 1); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusIdx >= 0 && normOptions[focusIdx]) select(normOptions[focusIdx].value);
        break;
      case 'Escape':
      case 'Tab':
        e.preventDefault();
        close();
        break;
      default:
        if (e.key.length === 1) {
          const next = typeAhead + e.key.toLowerCase();
          setTypeAhead(next);
          clearTimeout(typeTimer.current);
          typeTimer.current = setTimeout(() => setTypeAhead(''), 600);
          const match = normOptions.findIndex(o => o.label.toLowerCase().startsWith(next));
          if (match >= 0) setFocusIdx(match);
        }
    }
  }, [isOpen, normOptions, focusIdx, typeAhead, open, close, select]);

  // ── Style tokens ──────────────────────────────────────────────
  const c = theme.colors;
  const isSm = size === 'sm';
  const triggerH = isSm ? 34 : 44;

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium mb-1 px-1" style={{ color: c.textSecondary }}>
          {label} {required && <span style={{ color: '#B85C5C' }}>*</span>}
        </label>
      )}

      {/* ── Trigger button ──────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className="w-full text-left flex items-center justify-between transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{
          height: triggerH,
          padding: isSm ? '0 12px' : '0 16px',
          borderRadius: isSm ? 9999 : 16,
          backgroundColor: c.surface,
          border: `1px solid ${isOpen ? c.accent : c.border}`,
          color: (isPlaceholder || isMuted) ? c.textSecondary : c.textPrimary,
          fontSize: isSm ? 13 : 14,
          boxShadow: isOpen ? `0 0 0 3px ${c.accent}18` : 'none',
        }}
      >
        <span className="truncate pr-2">{displayText}</span>
        <ChevronDown
          className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ width: isSm ? 14 : 16, height: isSm ? 14 : 16, color: c.textSecondary }}
        />
      </button>

      {/* ── Dropdown menu (portaled) ────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              role="listbox"
              aria-label={label || 'Select an option'}
              {...DROPDOWN_ANIMATION}
              className="fixed rounded-2xl overflow-hidden"
              style={{
                top: openAbove ? undefined : position.top,
                bottom: openAbove ? window.innerHeight - position.top : undefined,
                left: position.left,
                width: position.width,
                backgroundColor: c.surface,
                border: `1px solid ${c.border}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: DESIGN_TOKENS.zIndex.popover,
                transformOrigin: openAbove ? 'bottom center' : 'top center',
              }}
            >
              <div className="max-h-[340px] overflow-y-auto scrollbar-hide py-1">
                {normOptions.length > 0 ? normOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isFocused = idx === focusIdx;
                  const optMuted = mutedValues.includes(opt.value);
                  return (
                    <button
                      key={`${opt.value}-${idx}`}
                      ref={el => (itemRefs.current[idx] = el)}
                      role="option"
                      aria-selected={isSelected}
                      type="button"
                      className="w-full text-left flex items-center justify-between px-3.5 py-2.5 text-[13px] transition-colors cursor-pointer outline-none"
                      style={{
                        color: optMuted ? c.textSecondary : c.textPrimary,
                        fontWeight: isSelected ? 700 : 500,
                        backgroundColor: isFocused
                          ? (c.accent + '14')
                          : isSelected
                            ? (c.accent + '0A')
                            : 'transparent',
                      }}
                      onMouseEnter={() => setFocusIdx(idx)}
                      onMouseDown={(e) => { e.preventDefault(); select(opt.value); }}
                    >
                      <span className="truncate pr-2">{opt.label}</span>
                      {isSelected && (
                        <Check className="flex-shrink-0 w-3.5 h-3.5" style={{ color: c.accent }} />
                      )}
                    </button>
                  );
                }) : (
                  <div className="px-3 py-2 text-sm text-center" style={{ color: c.textSecondary }}>No options</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};
