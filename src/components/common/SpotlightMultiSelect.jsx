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
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const anchorRef = useRef(null);
  const menuRef = useRef(null);

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

  const pick = (val) => { if (!val) return; onAddItem?.(val); setQ(""); setOpen(false); };
  const create = () => { const name = q.trim(); if (!name) return; onAddNew?.(name); onAddItem?.(name); setQ(""); setOpen(false); };

  const Menu = () =>
    createPortal(
      <div
        ref={menuRef}
        className="fixed rounded-2xl overflow-hidden shadow-2xl border custom-scroll-hide"
        style={{ top: pos.top, left: pos.left, width: pos.width, background: palette.bg, border: `1px solid ${palette.border}`, zIndex: 9999, maxHeight: 360, overflowY: 'auto' }}
      >
        <div className="py-1">
          {filtered.map((opt) => (
            <button
              key={opt}
              className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: palette.text }}
              onMouseDown={(e) => { e.preventDefault(); pick(opt); }}
            >
              {opt}
            </button>
          ))}
          {canCreate && (
            <>
              <div className="h-px my-1" style={{ background: palette.border }} />
              <button
                className="w-full text-left px-3 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ color: palette.accent }}
                onMouseDown={(e) => { e.preventDefault(); create(); }}
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
        className="flex items-center gap-2 px-3 cursor-text"
        style={{ height: 46, borderRadius: 24, background: palette.field, border: `1px solid ${palette.border}` }}
        onClick={() => setOpen(true)}
      >
        <Search className="w-3.5 h-3.5" style={{ color: palette.hint }} />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[14px]"
          style={{ color: palette.text }}
        />
      </div>

      {selectedItems.length > 0 && (
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
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Remove"
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