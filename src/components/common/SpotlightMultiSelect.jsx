import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { createPortal } from "react-dom";

export function SpotlightMultiSelect({
  label,
  selectedItems = [],
  onAddItem,
  onRemoveItem,
  options = [],
  onAddNew,
  placeholder = "Search...",
  theme,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useMemo(() => `listbox-${Math.random().toString(36).substr(2, 9)}`, []);

  const norm = (s) => (s || "").trim().toLowerCase();
  const available = useMemo(
    () => options.filter(o => !selectedItems.some(s => norm(s) === norm(o))),
    [options, selectedItems]
  );
  const filtered = useMemo(() => {
    if (!q) return available; // show all (can scroll, hidden scrollbar handled globally if desired)
    return available.filter(o => norm(o).includes(norm(q)));
  }, [available, q]);

  const exactExists = useMemo(() => available.some(o => norm(o) === norm(q)), [available, q]);
  const canCreate = q && !exactExists;

  const totalItems = filtered.length + (canCreate ? 1 : 0);

  useEffect(() => {
    setActiveIndex(-1);
  }, [q, open]);

  const palette = {
    bg: theme.colors.surface,
    field: theme.colors.surface,
    border: theme.colors.border,
    text: theme.colors.textPrimary,
    hint: theme.colors.textSecondary,
    accent: theme.colors.accent,
    chipBg: theme.colors.surface,
  };

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX, width: r.width });
  }, [open]);

  useEffect(() => {
    const close = (e) => {
      if (!anchorRef.current || !menuRef.current) return;
      if (!anchorRef.current.contains(e.target) && !menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", close);
      document.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
    }
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const pick = (val) => { if (!val) return; onAddItem?.(val); setQ(""); setOpen(false); inputRef.current?.blur(); };
  const create = () => { const name = q.trim(); if (!name) return; onAddNew?.(name); onAddItem?.(name); setQ(""); setOpen(false); inputRef.current?.blur(); };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          pick(filtered[activeIndex]);
        } else if (activeIndex === filtered.length && canCreate) {
          create();
        } else if (filtered.length === 1 && !canCreate) {
          pick(filtered[0]);
        } else if (canCreate && filtered.length === 0) {
          create();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (open && activeIndex >= 0 && menuRef.current) {
      const activeEl = menuRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, open]);

  const Menu = () =>
    createPortal(
      <div
        ref={menuRef}
        className="fixed rounded-2xl overflow-hidden shadow-2xl border custom-scroll-hide"
        style={{ top: pos.top, left: pos.left, width: pos.width, background: palette.bg, border: `1px solid ${palette.border}`, zIndex: 9999, maxHeight: 360, overflowY: 'auto' }}
        role="listbox"
        id={listboxId}
      >
        <div className="py-1">
          {filtered.map((opt, idx) => (
            <button
              key={opt}
              id={`${listboxId}-option-${idx}`}
              data-index={idx}
              role="option"
              aria-selected={activeIndex === idx}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${activeIndex === idx ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5 dark:hover:bg-white/5'}`}
              style={{ color: palette.text }}
              onMouseDown={(e) => { e.preventDefault(); pick(opt); }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {opt}
            </button>
          ))}
          {canCreate && (
            <>
              {filtered.length > 0 && <div className="h-px my-1" style={{ background: palette.border }} />}
              <button
                id={`${listboxId}-option-${filtered.length}`}
                data-index={filtered.length}
                role="option"
                aria-selected={activeIndex === filtered.length}
                className={`w-full text-left px-3 py-2 text-sm font-semibold flex items-center gap-2 transition-colors ${activeIndex === filtered.length ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5 dark:hover:bg-white/5'}`}
                style={{ color: palette.accent }}
                onMouseDown={(e) => { e.preventDefault(); create(); }}
                onMouseEnter={() => setActiveIndex(filtered.length)}
              >
                <Plus className="w-4 h-4" /> Create "{q.trim()}"
              </button>
            </>
          )}
          {!filtered.length && !canCreate && (
            <div className="px-3 py-3 text-sm" style={{ color: palette.hint }}>No matches</div>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <div className="w-full">
      {label ? (
        <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
          {label}
        </label>
      ) : null}

      <div
        ref={anchorRef}
        className="flex items-center gap-2 px-4 cursor-text"
        style={{ height: compact ? 40 : 48, borderRadius: 9999, background: palette.field, border: `1px solid ${palette.border}` }}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: palette.hint }} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedItems.length > 0 && compact ? '' : placeholder}
          className={`flex-1 bg-transparent outline-none min-w-[60px] ${compact ? 'text-[13px]' : 'text-sm'}`}
          style={{ color: palette.text }}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        />
        {/* compact: render chips inside the search bar */}
        {compact && selectedItems.length > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0 overflow-x-auto max-w-[60%] scrollbar-hide">
            {selectedItems.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium border flex-shrink-0"
                style={{ background: palette.chipBg, borderColor: palette.border, color: palette.text }}
              >
                <span className="truncate max-w-[120px]">{s}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveItem?.(s); }}
                  className="w-4 h-4 flex items-center justify-center rounded-full"
                  aria-label={`Remove ${s}`}
                >
                  <X className="w-3 h-3" style={{ color: palette.hint }} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* non-compact: render chips below the search bar */}
      {!compact && selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedItems.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-sm border"
              style={{ background: palette.chipBg, borderColor: palette.border, color: palette.text }}
            >
              {s}
              <button
                onClick={() => onRemoveItem?.(s)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                aria-label={`Remove ${s}`}
              >
                <X className="w-3.5 h-3.5" style={{ color: palette.hint }} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && <Menu />}
    </div>
  );
}