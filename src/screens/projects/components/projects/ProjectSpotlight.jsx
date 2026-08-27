import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Store, PenTool, User } from 'lucide-react';
import { isDarkTheme, DESIGN_TOKENS, fieldTileSurface } from '../../../../design-system/tokens.js';
import StandardSearchBar from '../../../../components/common/StandardSearchBar.jsx';

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
  const anchorRef = useRef(null);
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

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (anchorRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [close, open]);

  return (
    <div
      ref={anchorRef}
      className={`flex min-w-0 items-center gap-2 ${open ? 'flex-1 sm:flex-none sm:w-[min(100%,280px)]' : ''}`}
    >
      {open ? (
        <StandardSearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search projects…"
          theme={theme}
          size="control"
          className="flex-1 min-w-0 w-full"
          inputRef={inputRef}
          inputClassName="focus-ring"
          onKeyDown={onKeyDown}
        />
      ) : (
        <button
          type="button"
          aria-label="Search projects"
          onClick={() => setOpen(true)}
          className="flex-shrink-0 inline-flex items-center justify-center rounded-full transition-all active:scale-[0.95] focus-ring min-h-[44px] min-w-[44px]"
          style={{ height: 'var(--jsi-ctrl-h)', width: 'var(--jsi-ctrl-h)', backgroundColor: tileBg, color: c.textPrimary }}
        >
          <Search size={18} strokeWidth={2.2} />
        </button>
      )}

      {createPortal(
        <AnimatePresence>
          {open && anchorRef.current && (
            <motion.div
              ref={listRef}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              id="project-spotlight-listbox"
              role="listbox"
              className="fixed overflow-hidden"
              style={{
                zIndex: DESIGN_TOKENS.zIndex.popover,
                top: anchorRef.current.getBoundingClientRect().bottom + 8,
                left: anchorRef.current.getBoundingClientRect().left,
                width: Math.max(anchorRef.current.getBoundingClientRect().width, 280),
                maxWidth: 'calc(100vw - 2rem)',
                background: c.surface,
                borderRadius: '20px',
                boxShadow: DESIGN_TOKENS.shadows.modal,
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <div className="max-h-[52vh] overflow-y-auto scrollbar-hide p-2">
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
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};
