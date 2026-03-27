import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { isDarkTheme } from "../../design-system/tokens.js";

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
  integratedChips = false,
  bordered = true,
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [q, setQ] = useState("");

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const chrome = document.querySelector('[data-bottom-chrome]');
    const bottomOccupied = chrome ? (window.innerHeight - chrome.getBoundingClientRect().top) : 0;
    setDropUp(window.innerHeight - rect.bottom - bottomOccupied < 300);
  }, [open]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const listboxId = useMemo(() => `listbox-${Math.random().toString(36).substr(2, 9)}`, []);

  const norm = (s) => (s || "").trim().toLowerCase();

  const available = useMemo(
    () => options.filter((o) => !selectedItems.some((s) => norm(s) === norm(o))),
    [options, selectedItems]
  );

  const filtered = useMemo(() => {
    if (!q) return available;
    return available.filter((o) => norm(o).includes(norm(q)));
  }, [available, q]);

  const exactExists = useMemo(() => available.some((o) => norm(o) === norm(q)), [available, q]);
  const canCreate = !!(q.trim()) && !exactExists;
  const totalItems = filtered.length + (canCreate ? 1 : 0);
  const showIntegratedChips = !compact && integratedChips && selectedItems.length > 0;

  useEffect(() => { setActiveIndex(-1); }, [q, open]);

  const dark = isDarkTheme(theme);
  const palette = {
    bg: theme.colors.surface,
    field: dark ? theme.colors.background : theme.colors.surface,
    border: dark ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.07)",
    text: theme.colors.textPrimary,
    hint: theme.colors.textSecondary,
    accent: theme.colors.accent,
    chipBg: theme.colors.surface,
  };

  // Outside-click closes dropdown — wrapperRef contains both input and inline menu
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  const pick = (val) => {
    if (!val) return;
    onAddItem?.(val);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const create = () => {
    const name = q.trim();
    if (!name) return;
    onAddNew?.(name);
    onAddItem?.(name);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") { e.preventDefault(); setOpen(true); }
      return;
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActiveIndex((p) => Math.min(p + 1, totalItems - 1)); break;
      case "ArrowUp":   e.preventDefault(); setActiveIndex((p) => Math.max(p - 1, 0)); break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) pick(filtered[activeIndex]);
        else if (activeIndex === filtered.length && canCreate) create();
        else if (filtered.length === 1 && !canCreate) pick(filtered[0]);
        else if (canCreate && filtered.length === 0) create();
        break;
      case "Escape": e.preventDefault(); setOpen(false); inputRef.current?.blur(); break;
      case "Tab": setOpen(false); break;
    }
  };

  useEffect(() => {
    if (open && activeIndex >= 0 && menuRef.current) {
      const el = menuRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open]);

  const showMenu = open && (filtered.length > 0 || canCreate);

  return (
    <div className="w-full" ref={wrapperRef}>
      {label ? (
        <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
          {label}
        </label>
      ) : null}

      {/* Input bar + inline absolute dropdown */}
      <div className="relative">
        <div
          className="flex items-center gap-2 px-4 cursor-text"
          style={{
            height: 40,
            borderRadius: showIntegratedChips ? "16px 16px 0 0" : 9999,
            background: palette.field,
            border: bordered ? `1px solid ${palette.border}` : "none",
            borderBottomWidth: bordered && showIntegratedChips ? 0 : (bordered ? 1 : 0),
          }}
          onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: palette.hint }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedItems.length > 0 && compact ? "" : placeholder}
            className={`flex-1 bg-transparent outline-none min-w-[60px] ${compact ? "text-[13px]" : "text-[14px]"}`}
            style={{ color: palette.text }}
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          />
          {/* Compact mode: chips live inside the input bar */}
          {compact && selectedItems.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0 overflow-x-auto max-w-[72%] scrollbar-hide">
              {selectedItems.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium border flex-shrink-0"
                  style={{ background: palette.chipBg, borderColor: palette.border, color: palette.text }}
                >
                  <span className="truncate max-w-[180px]">{s}</span>
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

        {/* Inline dropdown — position:absolute, no portal, no scroll-close, no position recalc */}
        {showMenu && (
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 z-50 rounded-2xl border overflow-y-auto"
            style={{
              ...(dropUp ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }),
              backgroundColor: palette.bg,
              borderColor: palette.border,
              boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.11)",
              maxHeight: 260,
            }}
          >
            <div className="py-1">
              {filtered.map((opt, idx) => (
                <button
                  key={opt}
                  id={`${listboxId}-option-${idx}`}
                  data-index={idx}
                  role="option"
                  aria-selected={activeIndex === idx}
                  className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors ${
                    activeIndex === idx ? "bg-black/[0.08] dark:bg-white/[0.08]" : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                  }`}
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
                    className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold flex items-center gap-2 transition-colors ${
                      activeIndex === filtered.length ? "bg-black/[0.08] dark:bg-white/[0.08]" : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                    }`}
                    style={{ color: palette.accent }}
                    onMouseDown={(e) => { e.preventDefault(); create(); }}
                    onMouseEnter={() => setActiveIndex(filtered.length)}
                  >
                    <Plus className="w-4 h-4" /> Create "{q.trim()}"
                  </button>
                </>
              )}
              {!filtered.length && !canCreate && (
                <div className="px-4 py-3 text-[13px]" style={{ color: palette.hint }}>No matches</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Non-compact chips below the input bar */}
      {!compact && selectedItems.length > 0 && (
        <div
          className={
            showIntegratedChips
              ? `flex flex-wrap gap-2 px-3 pb-2.5 pt-1.5${bordered ? " border border-t-0 rounded-b-2xl" : ""}`
              : "flex flex-wrap gap-2 pt-2"
          }
          style={
            showIntegratedChips
              ? bordered
                ? { borderColor: palette.border, background: palette.field }
                : { background: palette.field }
              : undefined
          }
        >
          {selectedItems.map((s) => (
            <span
              key={s}
              className={`inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-[13px]${bordered ? " border" : ""}`}
              style={{
                background: showIntegratedChips ? theme.colors.subtle : palette.chipBg,
                borderColor: palette.border,
                color: palette.text,
              }}
            >
              {s}
              <button
                onClick={() => onRemoveItem?.(s)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label={`Remove ${s}`}
              >
                <X className="w-3.5 h-3.5" style={{ color: palette.hint }} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
