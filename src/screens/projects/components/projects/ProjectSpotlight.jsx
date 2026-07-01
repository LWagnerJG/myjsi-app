import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Briefcase, Store, PenTool, User } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS, fieldTileSurface } from '../../../../design-system/tokens.js';

const norm = (s) => String(s || '').toLowerCase();

const matchInfo = (opp, q) => {
  const dealer = (opp.dealers || []).find(d => norm(d).includes(q));
  if (dealer) return { label: dealer, kind: 'Dealer', icon: Store };
  const firm = (opp.designFirms || []).find(f => norm(f).includes(q));
  if (firm) return { label: firm, kind: 'Design firm', icon: PenTool };
  if (norm(opp.endUser).includes(q)) return { label: opp.endUser, kind: 'End user', icon: User };
  if (norm(opp.company).includes(q)) return { label: opp.company, kind: 'Account', icon: User };
  const contact = Array.isArray(opp.contacts)
    ? opp.contacts.find(x => norm(x).includes(q))
    : (norm(opp.contact).includes(q) ? opp.contact : null);
  if (contact) return { label: contact, kind: 'Contact', icon: User };
  if (norm(opp.name).includes(q)) return { label: opp.name, kind: 'Project', icon: Briefcase };
  return null;
};

export const ProjectSpotlight = ({ opportunities = [], theme, onOpenProject }) => {
  const dark = isDarkTheme(theme);
  const c = theme.colors;
  const tileBg = fieldTileSurface(theme).backgroundColor;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  const trimmedQuery = query.trim();

  const results = useMemo(() => {
    const q = norm(trimmedQuery);
    if (!q) {
      return [...opportunities]
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
        .slice(0, 6)
        .map(opp => ({
          opp,
          match: {
            label: opp.company || opp.endUser || opp.name || 'Project',
            kind: 'Recent',
            icon: Briefcase,
          },
        }));
    }
    return opportunities
      .map(opp => ({ opp, match: matchInfo(opp, q) }))
      .filter(r => r.match)
      .slice(0, 12);
  }, [opportunities, trimmedQuery]);

  useEffect(() => { setActive(0); }, [trimmedQuery, open]);

  useEffect(() => {
    setActive((idx) => {
      if (!results.length) return 0;
      return Math.min(idx, results.length - 1);
    });
  }, [results.length]);

  useEffect(() => {
    const el = itemRefs.current[active];
    if (el && listRef.current) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [active, results.length]);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const close = useCallback(() => { setOpen(false); setQuery(''); }, []);
  const choose = useCallback((opp) => { close(); onOpenProject?.(opp.id); }, [close, onOpenProject]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[active];
      if (r) choose(r.opp);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Search projects"
        onClick={() => setOpen(true)}
        className="flex-shrink-0 inline-flex items-center justify-center rounded-full transition-all active:scale-[0.95] focus-ring"
        style={{ height: 'var(--jsi-ctrl-h)', width: 'var(--jsi-ctrl-h)', backgroundColor: tileBg, color: c.textPrimary }}
      >
        <Search size={16} strokeWidth={2.2} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 flex items-start justify-center px-4"
              style={{
                zIndex: DESIGN_TOKENS.zIndex.modal,
                paddingTop: 'max(12vh, 72px)',
                background: dark ? 'rgba(0,0,0,0.55)' : 'rgba(53,53,53,0.28)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
              onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
            >
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-lg overflow-hidden"
                style={{
                  background: c.surface,
                  borderRadius: '28px',
                  boxShadow: DESIGN_TOKENS.shadows.modal,
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Search projects"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div
                  className="flex items-center gap-2.5 px-4"
                  style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}
                >
                  <Search size={17} style={{ color: c.textSecondary, opacity: 0.6 }} aria-hidden="true" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls="project-spotlight-listbox"
                    aria-autocomplete="list"
                    placeholder="Search by dealer, design firm, or end user…"
                    className="flex-1 min-w-0 bg-transparent outline-none py-4 text-[0.9375rem] font-medium focus-ring"
                    style={{ color: c.textPrimary }}
                  />
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={close}
                    className="flex h-8 w-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-opacity opacity-50 hover:opacity-90 focus-ring"
                    style={{ color: c.textSecondary }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div
                  ref={listRef}
                  id="project-spotlight-listbox"
                  role="listbox"
                  className="max-h-[52vh] overflow-y-auto scrollbar-hide p-2"
                >
                  {!trimmedQuery && (
                    <p className="px-2.5 pt-1.5 pb-1 text-[0.625rem] font-bold uppercase tracking-[0.12em]" style={{ color: c.textSecondary, opacity: 0.55 }}>
                      Recent
                    </p>
                  )}
                  {results.length === 0 ? (
                    <div className="px-3 py-8 text-center text-[0.8125rem]" style={{ color: c.textSecondary }}>
                      No projects match &ldquo;{trimmedQuery}&rdquo;.
                    </div>
                  ) : (
                    results.map(({ opp, match }, i) => {
                      const Icon = match.icon || Briefcase;
                      const isActive = i === active;
                      return (
                        <button
                          key={opp.id}
                          ref={(el) => { itemRefs.current[i] = el; }}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => choose(opp)}
                          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-[20px] text-left transition-colors focus-ring"
                          style={{ backgroundColor: isActive ? tileBg : 'transparent' }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tileBg, color: c.accent }}>
                            <Icon className="w-3.5 h-3.5" strokeWidth={1.9} aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.8125rem] font-semibold truncate" style={{ color: c.textPrimary }}>{opp.name}</p>
                            <p className="text-[0.6875rem] truncate" style={{ color: c.textSecondary, opacity: 0.8 }}>
                              <span className="font-semibold">{match.kind}</span>
                              {match.label ? ` · ${match.label}` : ''}
                            </p>
                          </div>
                          <span className="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: tileBg, color: c.textSecondary }}>
                            {opp.stage}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
