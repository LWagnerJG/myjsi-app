import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, ArrowUpRight, Building2, CornerDownLeft, FolderOpen, Search, SlidersHorizontal, Store, UserRound, X } from 'lucide-react';
import { DESIGN_TOKENS, isDarkTheme, JSI_COLORS, modalCardSurface } from '../../../../design-system/tokens.js';
import { UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';

const EMPTY_GROUPS = [];
const normalize = value => String(value ?? '').trim().toLocaleLowerCase();
const asArray = value => Array.isArray(value) ? value : value ? [value] : [];
const entityName = value => typeof value === 'string' ? value.trim() : String(value?.name || [value?.firstName, value?.lastName].filter(Boolean).join(' ') || value?.email || '').trim();
const contactDetails = contact => typeof contact === 'object' && contact ? [contact.email, contact.role, contact.title].filter(Boolean) : [];
const match = (values, query) => {
  const haystack = normalize(values.filter(Boolean).join(' '));
  return query.split(/\s+/).every(word => haystack.includes(word));
};

const buildResults = (groups, query) => {
  const projects = [];
  const customers = [];
  const contacts = [];
  const dealers = new Map();
  const contactKeys = new Set();
  const addContact = (contact, group, project) => {
    const name = entityName(contact);
    if (!name) return;
    const detail = contactDetails(contact);
    const key = `contact:${group.id}:${project?.id ?? 'customer'}:${normalize(name)}`;
    if (contactKeys.has(key) || !match([name, ...detail, group.name, project?.name], query)) return;
    contactKeys.add(key);
    contacts.push({ key, title: name, subtitle: [project?.name || group.name, detail[0]].filter(Boolean).join(' · '), icon: UserRound, project, customer: project ? null : group.customer, filter: group.name });
  };
  const addDealer = (dealer, group, project) => {
    const name = entityName(dealer);
    if (!name) return;
    const key = normalize(name);
    if (!dealers.has(key)) dealers.set(key, { name, projectIds: new Set(), customerNames: new Set() });
    const entry = dealers.get(key);
    if (project) entry.projectIds.add(project.id);
    entry.customerNames.add(group.name);
  };

  groups.forEach(group => {
    const customer = group.customer;
    const customerName = group.name || customer?.name || 'Customer TBD';
    if (match([customerName, customer?.domain], query)) {
      const count = (group.projects || []).length;
      customers.push({ key: `customer:${group.id}`, title: customerName, subtitle: [customer?.location?.city, customer?.location?.state, `${count} project${count === 1 ? '' : 's'}`].filter(Boolean).join(' · '), icon: Building2, customer, filter: customerName });
    }
    asArray(customer?.contacts).forEach(contact => addContact(contact, group));
    asArray(customer?.contact).forEach(contact => addContact(contact, group));
    [...asArray(customer?.dealers), ...asArray(customer?.dealer)].forEach(dealer => addDealer(dealer, group));
    (group.projects || []).forEach(project => {
      const projectContacts = [...asArray(project.contact), ...asArray(project.contacts)];
      const projectDealers = [...asArray(project.dealers), ...asArray(project.dealer)];
      if (match([project.name, customerName, project.company, project.endUser, ...projectContacts.flatMap(contact => [entityName(contact), ...contactDetails(contact)]), ...projectDealers.map(entityName)], query)) {
        projects.push({ key: `project:${project.id}`, title: project.name || 'Untitled project', subtitle: customerName, badge: project.stage || 'Unstaged', icon: FolderOpen, project });
      }
      projectContacts.forEach(contact => addContact(contact, group, project));
      projectDealers.forEach(dealer => addDealer(dealer, group, project));
    });
  });

  projects.sort((a, b) => {
    const aTime = Date.parse(a.project.updatedAt) || 0;
    const bTime = Date.parse(b.project.updatedAt) || 0;
    return bTime - aTime || a.title.localeCompare(b.title);
  });
  const dealerResults = [...dealers.values()]
    .filter(dealer => match([dealer.name], query))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(dealer => ({ key: `dealer:${normalize(dealer.name)}`, title: dealer.name, subtitle: `${dealer.projectIds.size} project${dealer.projectIds.size === 1 ? '' : 's'} · Filter workspace`, icon: Store, filter: dealer.name }));
  const sections = [
    { id: 'projects', label: query ? 'Projects' : 'Recent projects', items: projects },
    { id: 'customers', label: 'Customers', items: customers },
    ...(query ? [{ id: 'contacts', label: 'Contacts', items: contacts }, { id: 'dealers', label: 'Dealers', items: dealerResults }] : []),
  ];
  return sections.map(section => ({ ...section, total: section.items.length, items: section.items.slice(0, query ? 6 : 4) })).filter(section => section.total);
};

const isEditing = target => target instanceof Element && !!target.closest('input, textarea, select, [role="textbox"], [contenteditable]:not([contenteditable="false"])');
const hasOpenDialog = () => [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open]')].some(dialog => {
  for (let node = dialog; node instanceof Element; node = node.parentElement) {
    if (node.hidden || node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('inert')) return false;
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }
  return true;
});

export const WorkspaceSpotlight = ({ theme, groups = EMPTY_GROUPS, onOpenProject, onOpenCustomer, onFilter }) => {
  const dark = isDarkTheme(theme);
  const colors = theme?.colors || {};
  const text = colors.textPrimary || JSI_COLORS.charcoal;
  const muted = dark ? '#B7AEA5' : '#706D67';
  const border = dark ? 'rgba(255,255,255,0.12)' : JSI_COLORS.stone;
  const inset = dark ? 'rgba(255,255,255,0.055)' : JSI_COLORS.warmBeige;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const returnFocusRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const id = useId();
  const listId = `${id}-results`;
  const normalizedQuery = normalize(query);
  const sections = useMemo(() => buildResults(groups, normalizedQuery), [groups, normalizedQuery]);
  const results = useMemo(() => sections.flatMap(section => section.items), [sections]);
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));
  const shortcut = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || '') ? '⌘ K' : 'Ctrl K';

  const openSearch = useCallback(() => {
    if (hasOpenDialog()) return;
    returnFocusRef.current = document.activeElement === document.body ? triggerRef.current : document.activeElement;
    setQuery('');
    setActive(0);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const choose = result => {
    close();
    if (result.project) onOpenProject?.(result.project.id);
    else if (result.customer) onOpenCustomer?.(result.customer);
    else if (result.filter) onFilter?.(result.filter);
  };
  const filterWorkspace = () => {
    if (!query.trim()) return;
    close();
    onFilter?.(query.trim());
  };

  useEffect(() => {
    const handleShortcut = event => {
      if (open || event.defaultPrevented || event.isComposing || event.altKey || event.shiftKey || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      if (triggerRef.current?.closest('[aria-hidden="true"], [inert]')) return;
      if (isEditing(event.target) || isEditing(document.activeElement) || hasOpenDialog()) return;
      event.preventDefault();
      openSearch();
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [open, openSearch]);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus({ preventScroll: true });
    const containFocus = event => {
      if (!dialog?.contains(event.target)) inputRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('focusin', containFocus);
    return () => {
      document.removeEventListener('focusin', containFocus);
      document.body.style.overflow = previousOverflow;
      // Do not take focus back from a destination dialog that has already opened.
      if (document.activeElement === document.body || dialog?.contains(document.activeElement)) {
        const target = returnFocusRef.current?.isConnected ? returnFocusRef.current : trigger;
        target?.focus?.({ preventScroll: true });
      }
    };
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, open, normalizedQuery]);

  const handleDialogKey = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [href], [tabindex="0"]')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement))) {
      event.preventDefault();
      first?.focus();
    }
  };
  const handleSearchKey = event => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length) setActive((activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (results[activeIndex]) choose(results[activeIndex]);
      else filterWorkspace();
    }
  };
  let resultIndex = 0;

  return <>
    <button ref={triggerRef} type="button" onClick={openSearch} aria-label="Search workspace" aria-haspopup="dialog" aria-expanded={open} aria-keyshortcuts="Meta+K Control+K"
      className="inline-flex w-full flex-1 min-w-0 min-h-[44px] items-center gap-2.5 rounded-full px-4 text-left focus-ring transition-colors"
      style={{ color: muted, backgroundColor: inset, border: `1px solid ${border}` }}>
      <Search size={17} className="shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-sm">Search workspace</span>
      <kbd aria-hidden="true" className="hidden shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block" style={{ borderColor: border, fontFamily: 'inherit' }}>{shortcut}</kbd>
    </button>
    {open && createPortal(
      <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-3 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6 sm:pt-[12vh]" style={{ zIndex: UNIFIED_MODAL_Z + 1, backgroundColor: 'rgba(35,33,30,0.38)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', overscrollBehavior: 'contain' }}
        onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onKeyDown={handleDialogKey}
          className="relative flex w-full max-w-[660px] flex-col overflow-hidden" style={{ ...modalCardSurface(theme), color: text, maxHeight: 'min(760px, calc(100dvh - 2rem))', boxShadow: dark ? DESIGN_TOKENS.shadowsDark.modal : '0 28px 80px rgba(53,53,53,0.22)' }}>
          <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
            <div className="min-w-0"><h2 id={`${id}-title`} className="text-base font-semibold tracking-tight">Search workspace</h2><p id={`${id}-description`} className="mt-1 text-xs" style={{ color: muted }}>Projects, customers, contacts and dealers</p></div>
            <button type="button" onClick={close} aria-label="Close workspace search" className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full focus-ring" style={{ backgroundColor: inset, color: muted }}><X size={18} aria-hidden="true" /></button>
          </div>
          <div className="mx-4 mb-3 mt-4 flex min-h-[52px] items-center gap-3 rounded-2xl px-3 sm:mx-5" style={{ backgroundColor: colors.surface || '#FFFFFF', border: `1px solid ${border}` }}>
            <Search size={19} aria-hidden="true" className="shrink-0" style={{ color: muted }} />
            <input ref={inputRef} type="text" role="combobox" aria-label="Search projects, customers, contacts and dealers" aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={results.length ? `${id}-option-${activeIndex}` : undefined}
              value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={handleSearchKey} placeholder="Search by name, contact or dealer…" autoComplete="off" autoCorrect="off" spellCheck={false}
              className="min-h-[48px] min-w-0 flex-1 rounded-lg bg-transparent text-base outline-none focus-visible:ring-2 focus-visible:ring-stone-400" style={{ color: text }} />
            {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setActive(0); inputRef.current?.focus(); }} className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full focus-ring" style={{ color: muted }}><X size={16} aria-hidden="true" /></button>}
          </div>
          <div aria-live="polite" aria-atomic="true" className="sr-only">{normalizedQuery ? `${sections.reduce((sum, section) => sum + section.total, 0)} results for ${query.trim()}.` : 'Recent projects and customers.'}</div>
          <div id={listId} role="listbox" aria-label="Workspace search results" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 sm:px-3" style={{ overscrollBehavior: 'contain' }}>
            {sections.map(section => <div key={section.id} role="group" aria-labelledby={`${id}-${section.id}`}>
              <div className="flex items-center justify-between px-3 pb-1.5 pt-3" style={{ color: muted }}><h3 id={`${id}-${section.id}`} className="text-[11px] font-semibold tracking-[0.02em]">{section.label}</h3><span className="text-[10px] tabular-nums">{section.items.length < section.total ? `${section.items.length} of ${section.total}` : section.total}</span></div>
              {section.items.map(result => {
                const index = resultIndex++;
                const selected = index === activeIndex;
                const Icon = result.icon;
                return <button key={result.key} id={`${id}-option-${index}`} ref={element => { optionRefs.current[index] = element; }} type="button" role="option" aria-selected={selected} tabIndex={-1}
                  onMouseEnter={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(result)}
                  className="flex min-h-[60px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left focus-ring" style={{ backgroundColor: selected ? inset : 'transparent' }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.055)' : '#FFFFFF', color: muted, border: `1px solid ${border}` }}><Icon size={17} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{result.title}</span><span className="mt-0.5 block truncate text-[11px]" style={{ color: muted }}>{result.subtitle}</span></span>
                  {result.badge && <span className="hidden max-w-[110px] shrink-0 truncate rounded-full px-2 py-1 text-[10px] sm:inline-block" style={{ color: muted, border: `1px solid ${border}` }}>{result.badge}</span>}
                  <ArrowUpRight size={15} aria-hidden="true" className="shrink-0" style={{ color: muted, opacity: selected ? 1 : 0.45 }} />
                </button>;
              })}
            </div>)}
            {!results.length && <div role="presentation" className="px-4 py-10 text-center"><Search size={24} aria-hidden="true" className="mx-auto mb-3" style={{ color: muted }} /><p className="text-sm font-semibold">{normalizedQuery ? 'No matching results' : 'No projects or customers yet'}</p><p className="mt-1 text-xs" style={{ color: muted }}>{normalizedQuery ? 'Try a project, customer, contact or dealer name.' : 'New projects and customers will appear here.'}</p></div>}
          </div>
          <div className="shrink-0 px-4 pb-3 pt-2 sm:px-5" style={{ backgroundColor: inset, borderTop: `1px solid ${border}` }}>
            {normalizedQuery && onFilter && <button type="button" onClick={filterWorkspace} className="mb-1 flex min-h-[44px] w-full items-center gap-2 rounded-lg text-left text-xs font-medium focus-ring"><SlidersHorizontal size={15} aria-hidden="true" className="shrink-0" /><span className="min-w-0 flex-1 truncate">Filter workspace by “{query.trim()}”</span><ArrowUpRight size={14} aria-hidden="true" className="shrink-0" /></button>}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[10px]" style={{ color: muted }}><span>Includes closed projects</span><span className="hidden items-center gap-3 sm:inline-flex" aria-hidden="true"><span className="inline-flex items-center gap-0.5"><ArrowUp size={11} /><ArrowDown size={11} /> Navigate</span><span className="inline-flex items-center gap-1"><CornerDownLeft size={11} /> Open</span><span>Esc Close</span></span></div>
          </div>
        </div>
      </div>, document.body,
    )}
  </>;
};
