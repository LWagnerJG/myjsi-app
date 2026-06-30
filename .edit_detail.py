import io, sys

p = 'src/screens/projects/components/projects/OpportunityDetail.jsx'
s = open(p, encoding='utf-8').read()
orig = s
edits = []

def rep(old, new, n=1, label=''):
    cnt = s.count(old)
    assert cnt == n, f"[{label}] expected {n} got {cnt}"
    edits.append((old, new))

# 1) imports
rep(
"""import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowUpRight, ChevronDown, Upload, FileText, Eye, Send, Paperclip, Users, Clock, CheckCircle, AlertCircle, Loader2, Share2, Download, Mail, MapPin, Package, Phone, Truck, ShoppingBag } from 'lucide-react';""",
"""import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Upload, FileText, Eye, Send, Paperclip, Users, Clock, CheckCircle, AlertCircle, Loader2, Share2, Download, Mail, MapPin, Package, Phone, Truck, ShoppingBag, Check, Lock } from 'lucide-react';""",
label='imports')

# 2) Section -> collapsible + motion
rep(
"""const Section = ({ title, subtitle, children, theme, right }) => {
  const isDark = isDarkTheme(theme);
  const surface = sectionCardSurface(theme);
  return (
    <div
      className="overflow-hidden"
      style={{
        ...surface,
        padding: '16px',
        borderRadius: SECTION_RADIUS,
        boxShadow: isDark ? surface.boxShadow : '0 6px 16px rgba(53,53,53,0.035)',
      }}
    >
      {title && (
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className={DETAIL_SECTION_TITLE_CLASS} style={{ color: theme.colors.textPrimary }}>{title}</h2>
            {subtitle ? (
              <p className={DETAIL_SECTION_SUBTITLE_CLASS} style={{ color: theme.colors.textSecondary, opacity: 0.82 }}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {right ? <div className="flex-shrink-0 pt-0.5">{right}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
};""",
"""const Section = ({ title, subtitle, children, theme, right, collapsible = false, defaultOpen = true }) => {
  const isDark = isDarkTheme(theme);
  const surface = sectionCardSurface(theme);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
      style={{
        ...surface,
        padding: '16px',
        borderRadius: SECTION_RADIUS,
        boxShadow: isDark ? surface.boxShadow : '0 6px 16px rgba(53,53,53,0.035)',
      }}
    >
      {title && (
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => collapsible && setOpen(o => !o)}
            className="min-w-0 flex items-center gap-2 text-left"
            style={{ cursor: collapsible ? 'pointer' : 'default' }}
            aria-expanded={collapsible ? open : undefined}
          >
            {collapsible ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.55, transition: 'transform 0.2s ease', transform: open ? 'none' : 'rotate(-90deg)' }} />
            ) : null}
            <span className="min-w-0">
              <span className={`block ${DETAIL_SECTION_TITLE_CLASS}`} style={{ color: theme.colors.textPrimary }}>{title}</span>
              {subtitle ? (
                <span className={`block ${DETAIL_SECTION_SUBTITLE_CLASS}`} style={{ color: theme.colors.textSecondary, opacity: 0.82 }}>
                  {subtitle}
                </span>
              ) : null}
            </span>
          </button>
          {right ? <div className="flex-shrink-0 pt-0.5">{right}</div> : null}
        </div>
      )}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div className={title ? 'pt-3' : ''}>{children}</div>
      </motion.div>
    </motion.div>
  );
};""",
label='Section')

# 3) CompactSelect -> custom in-app dropdown
rep(
"""const CompactSelect = ({ options, value, onChange, theme, compact = false }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`w-full appearance-none bg-transparent outline-none ${compact ? 'min-h-[34px] px-2.5 pr-7 text-[0.8125rem]' : 'min-h-[44px] px-3.5 pr-9 text-[0.875rem]'} font-semibold`}
        style={{
          backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT,
          borderRadius: CONTROL_RADIUS,
          color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
        }}
      >
        <option value="" disabled>Select</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${compact ? 'right-2 h-3 w-3' : 'right-3 h-3.5 w-3.5'}`} style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
    </div>
  );
};""",
"""const CompactSelect = ({ options, value, onChange, theme, compact = false, disabled = false, placeholder = 'Select' }) => {
  const isDark = isDarkTheme(theme);
  const c = theme.colors;
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const norm = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = norm.find(o => o.value === value && o.value !== '');
  const recalc = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const maxH = 300;
    const openUp = (window.innerHeight - r.bottom) < (maxH + 16) && r.top > maxH;
    setPos({
      top: openUp ? r.top + window.scrollY : r.bottom + window.scrollY + 6,
      left: r.left + window.scrollX,
      width: r.width,
      openUp,
    });
  };
  const openMenu = () => { if (disabled) return; recalc(); setOpen(true); };
  useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return; setOpen(false); };
    const onScroll = () => setOpen(false);
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <>
      <button
        type="button"
        ref={btnRef}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`relative w-full flex items-center justify-between gap-2 ${compact ? 'min-h-[34px] px-2.5 text-[0.8125rem]' : 'min-h-[44px] px-3.5 text-[0.875rem]'} font-semibold text-left transition-all ${disabled ? '' : 'active:scale-[0.99]'}`}
        style={{
          backgroundColor: isDark ? FIELD_BG_DARK : FIELD_BG_LIGHT,
          borderRadius: CONTROL_RADIUS,
          color: selected ? c.textPrimary : c.textSecondary,
          outline: open ? `1px solid ${c.accent}` : 'none',
          outlineOffset: '-1px',
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        {!disabled && (
          <ChevronDown
            className={`flex-shrink-0 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`}
            style={{ color: c.textSecondary, opacity: 0.5, transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'none' }}
          />
        )}
      </button>
      {open && createPortal(
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="fixed overflow-hidden"
          style={{
            top: pos.openUp ? undefined : pos.top,
            bottom: pos.openUp ? (window.innerHeight - pos.top) : undefined,
            left: pos.left,
            width: pos.width,
            minWidth: 168,
            background: c.surface,
            boxShadow: DESIGN_TOKENS.shadows.modal,
            zIndex: DESIGN_TOKENS.zIndex.popover,
            borderRadius: '18px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-1">
            {norm.map(o => {
              const active = o.value === value;
              return (
                <button
                  key={o.value || o.label}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 text-[0.8125rem] flex items-center justify-between gap-2 transition-colors ${active ? 'font-bold' : 'font-medium'}`}
                  style={{ color: c.textPrimary, backgroundColor: active ? `${c.accent}0F` : 'transparent' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = active ? `${c.accent}0F` : 'transparent'; }}
                >
                  <span className="truncate">{o.label}</span>
                  {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.accent }} />}
                </button>
              );
            })}
          </div>
        </motion.div>,
        document.body
      )}
    </>
  );
};""",
label='CompactSelect')

# 4) draft/update + lock state
rep(
"""  const [draft, setDraft] = useState(opp);
  const dirty = useRef(false);
  const saveRef = useRef(null);
  const rewardAutoManagedRef = useRef({ salesReward: true, designerReward: true });
  useEffect(() => {
    setDraft(opp);
    rewardAutoManagedRef.current = {
      salesReward: opp.salesReward == null || opp.salesReward === true,
      designerReward: opp.designerReward == null || opp.designerReward === true,
    };
  }, [opp]);

  const update = useCallback((k, v) => {
    setDraft(p => { const n = { ...p, [k]: v }; dirty.current = true; return n; });
  }, []);""",
"""  const [draft, setDraft] = useState(opp);
  const [unlocked, setUnlocked] = useState(false);
  const dirty = useRef(false);
  const saveRef = useRef(null);
  const rewardAutoManagedRef = useRef({ salesReward: true, designerReward: true });
  useEffect(() => {
    setDraft(opp);
    setUnlocked(false);
    rewardAutoManagedRef.current = {
      salesReward: opp.salesReward == null || opp.salesReward === true,
      designerReward: opp.designerReward == null || opp.designerReward === true,
    };
  }, [opp]);

  // Closed deals (Won/Lost) lock into a read-only historical record until reopened.
  const isClosed = draft.stage === 'Won' || draft.stage === 'Lost';
  const readOnly = isClosed && !unlocked;
  const readOnlyRef = useRef(readOnly);
  readOnlyRef.current = readOnly;

  const update = useCallback((k, v) => {
    if (readOnlyRef.current) return;
    setDraft(p => { const n = { ...p, [k]: v }; dirty.current = true; return n; });
  }, []);""",
label='draft/update/lock')

# 5) rewards auto effect guard
rep(
"""  useEffect(() => {
    setDraft((prev) => {
      let changed = false;
      const next = { ...prev };
      if (rewardAutoManagedRef.current.salesReward && prev.salesReward !== rewardDefaultValue) {""",
"""  useEffect(() => {
    if (readOnly) return;
    setDraft((prev) => {
      let changed = false;
      const next = { ...prev };
      if (rewardAutoManagedRef.current.salesReward && prev.salesReward !== rewardDefaultValue) {""",
label='rewards-guard')
rep(
"""    if (!changed) return prev;
      dirty.current = true;
      return next;
    });
  }, [rewardDefaultValue]);""",
"""    if (!changed) return prev;
      dirty.current = true;
      return next;
    });
  }, [rewardDefaultValue, readOnly]);""",
label='rewards-deps')

# 6) lock banner after container open
rep(
"""        <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-6 max-w-content mx-auto w-full space-y-3.5">

          {/* HERO */}""",
"""        <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-6 max-w-content mx-auto w-full space-y-3.5">

          {isClosed && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{
                backgroundColor: draft.stage === 'Won' ? 'rgba(74,124,89,0.10)' : 'rgba(184,92,92,0.10)',
                border: `1px solid ${draft.stage === 'Won' ? 'rgba(74,124,89,0.22)' : 'rgba(184,92,92,0.22)'}`,
                borderRadius: '20px',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Lock className="w-4 h-4 flex-shrink-0" style={{ color: draft.stage === 'Won' ? JSI_COLORS.success : JSI_COLORS.error }} />
                <span className="text-[0.8125rem] font-semibold truncate" style={{ color: c.textPrimary }}>
                  {draft.stage === 'Won' ? 'Won' : 'Lost'} · {readOnly ? 'locked historical record' : 'editing unlocked'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUnlocked(u => !u)}
                className="px-3 py-1.5 rounded-full text-[0.6875rem] font-semibold flex-shrink-0 transition-all active:scale-[0.97]"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.06)', color: c.textPrimary }}
              >
                {readOnly ? 'Reopen to edit' : 'Lock again'}
              </button>
            </motion.div>
          )}

          {/* HERO */}""",
label='lock-banner')

# 7) hero pointer-events when readOnly
rep(
"""          {/* HERO */}
          <div className="p-4 sm:p-5" style={{ ...sectionCardSurface(theme), borderRadius: '24px' }}>""",
"""          {/* HERO */}
          <div className="p-4 sm:p-5" style={{ ...sectionCardSurface(theme), borderRadius: '24px', pointerEvents: readOnly ? 'none' : undefined, opacity: readOnly ? 0.96 : 1 }}>""",
label='hero-lock')

# 8) left column pointer-events when readOnly (disambiguated by following Commercial section)
rep(
"""            <div className="space-y-3.5 min-w-0">
              <Section title="Commercial" theme={theme}>""",
"""            <div className="space-y-3.5 min-w-0" style={{ pointerEvents: readOnly ? 'none' : undefined, opacity: readOnly ? 0.96 : 1 }}>
              <Section title="Commercial" theme={theme}>""",
label='leftcol-lock')

# 9) Net animated value
rep(
"""                        <p className="mt-2 text-[1.4rem] font-bold tracking-[-0.035em] leading-none" style={{ color: c.textPrimary }}>
                          {netValueLabel}
                        </p>""",
"""                        <div className="mt-2 h-[1.4rem] overflow-hidden">
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.p
                              key={netValueLabel}
                              initial={{ y: '70%', opacity: 0 }}
                              animate={{ y: '0%', opacity: 1 }}
                              exit={{ y: '-70%', opacity: 0 }}
                              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                              className="text-[1.4rem] font-bold tracking-[-0.035em] leading-none"
                              style={{ color: c.textPrimary }}
                            >
                              {netValueLabel}
                            </motion.p>
                          </AnimatePresence>
                        </div>""",
label='net-anim')

# 10) collapsible Specs + Notes
rep(
'              <Section title="Specs & Competition" theme={theme}>',
'              <Section title="Specs & Competition" theme={theme} collapsible>',
label='specs-collapsible')
rep(
'              <Section title="Notes" theme={theme}>',
'              <Section title="Notes" theme={theme} collapsible>',
label='notes-collapsible')

# 11) customer link native select -> CompactSelect
rep(
"""            <select value={draft.customerId ? String(draft.customerId) : ''} onChange={(event) => update('customerId', event.target.value || null)}
              className="w-full bg-transparent outline-none text-[0.8125rem] font-medium" style={{ color: c.textPrimary }}>
              <option value="">Select customer profile...</option>
              {(customers || []).map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>""",
"""            <CompactSelect
              theme={theme}
              value={draft.customerId ? String(draft.customerId) : ''}
              onChange={(v) => update('customerId', v || null)}
              placeholder="Select customer profile..."
              options={[{ value: '', label: 'Select customer profile...' }, ...(customers || []).map((customer) => ({ value: String(customer.id), label: customer.name }))]}
            />""",
label='customer-select')

# 12) pass disabled to the three hero/profile selects so lock also greys them
rep(
'                  <CompactSelect options={STAGES} value={draft.stage} onChange={v => update(\'stage\', v)} theme={theme} compact />',
'                  <CompactSelect options={STAGES} value={draft.stage} onChange={v => update(\'stage\', v)} theme={theme} compact disabled={readOnly} placeholder="Stage" />',
label='stage-disabled')
rep(
'                    <CompactSelect options={VERTICALS} value={draft.vertical} onChange={v => update(\'vertical\', v)} theme={theme} />',
'                    <CompactSelect options={VERTICALS} value={draft.vertical} onChange={v => update(\'vertical\', v)} theme={theme} disabled={readOnly} placeholder="Vertical" />',
label='vertical-disabled')
rep(
'                    <CompactSelect options={PO_TIMEFRAMES} value={draft.poTimeframe} onChange={v => update(\'poTimeframe\', v)} theme={theme} />',
'                    <CompactSelect options={PO_TIMEFRAMES} value={draft.poTimeframe} onChange={v => update(\'poTimeframe\', v)} theme={theme} disabled={readOnly} placeholder="PO Timeframe" />',
label='po-disabled')

# apply
for old, new in edits:
    s = s.replace(old, new, 1)

assert s != orig, "no changes applied"
open(p, 'w', encoding='utf-8').write(s)
print(f"applied {len(edits)} edits OK")
