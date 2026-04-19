import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  MapPin, ChevronRight, FileText, Download, CheckCircle2,
  Mail, Phone, X, Package, Award, Image,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDarkTheme, DESIGN_TOKENS, JSI_COLORS } from '../../../design-system/tokens.js';
import { getModalMotion } from '../../../design-system/motion.js';
import { formatCurrency, formatLongDate } from '../../../utils/format.js';
import {
  VERTICAL_COLORS, ORDER_STATUS_COLORS, MATERIAL_CATEGORIES, INSTALL_SPACE_TYPES, getAllInstalls,
} from './customerData.js';

const fmtMoney = formatCurrency;
const fmtDate = formatLongDate;

/* ═══════════════════════════════════════════════════════════════
   SECTION CARD PRIMITIVE
   ═══════════════════════════════════════════════════════════════ */
const Sect = ({ title, icon: Icon, right, children, theme, noPad = false }) => {
  const dark = isDarkTheme(theme);
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#fff', border: `1px solid ${border}` }}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: border }}>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.45 }} />}
            <span className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary, opacity: 0.65 }}>{title}</span>
          </div>
          {right}
        </div>
      )}
      <div className={noPad ? '' : 'px-5 pb-5 pt-4'}>
        {children}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TAB BAR
   ═══════════════════════════════════════════════════════════════ */
const TabBar = ({ tabs, value, onChange, theme }) => {
  const dark = isDarkTheme(theme);
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tabs.map(t => {
        const active = t === value;
        return (
          <button key={t} onClick={() => onChange(t)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.97]"
            style={{
              backgroundColor: active ? theme.colors.accent : 'transparent',
              color: active ? theme.colors.accentText : theme.colors.textSecondary,
              border: active ? `1.5px solid ${theme.colors.accent}` : `1.5px solid ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'}`,
            }}>
            {t}
          </button>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHARED ATOMS
   ═══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const color = ORDER_STATUS_COLORS[status] || '#9B9B9B';
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: `${color}22`, color }}>
      {status}
    </span>
  );
};

const CodeChip = ({ code, theme }) => (
  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}>
    {code}
  </span>
);

const Divider = ({ dark }) => (
  <div className="border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }} />
);

const InitialsAvatar = ({ name, size = 36, theme }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-sm shrink-0"
      style={{ width: size, height: size, backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}>
      {initials}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STANDARDS PROGRAM DETAIL MODAL
   ═══════════════════════════════════════════════════════════════ */
const StandardsProgramDetailModal = ({ program, customer, theme, onClose }) => {
  if (!program) return null;
  const dark = isDarkTheme(theme);
  const c = theme.colors;
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const spring = getModalMotion();

  return createPortal(
    <AnimatePresence>
      <motion.div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto"
        style={{ zIndex: DESIGN_TOKENS.zIndex.modal, backgroundColor: 'rgba(0,0,0,0.5)', top: 76, bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
        onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="w-full max-w-lg rounded-2xl my-4 overflow-hidden"
          style={{ backgroundColor: c.surface, border: `1px solid ${border}` }}
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          transition={spring}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
            <div className="flex items-center gap-2 min-w-0">
              <CodeChip code={program.code} theme={theme} />
              <StatusBadge status={program.status} />
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-4 h-4" style={{ color: c.textSecondary }} />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold" style={{ color: c.textPrimary }}>{program.title}</h3>
              <p className="text-sm mt-1" style={{ color: c.textSecondary }}>{customer.name} · {customer.location.city}, {customer.location.state}</p>
            </div>

            {/* PO Requirements */}
            {program.poRequirementText && (
              <div className="rounded-xl px-4 py-3.5 flex items-start gap-3" style={{ backgroundColor: `${c.accent}0D`, border: `1px solid ${c.accent}30` }}>
                <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c.accent }} />
                <div>
                  <p className="text-[0.6875rem] font-bold uppercase tracking-wider mb-1" style={{ color: c.accent }}>PO Requirement</p>
                  <p className="text-sm leading-snug" style={{ color: c.textPrimary }}>{program.poRequirementText}</p>
                </div>
              </div>
            )}

            {/* Overview */}
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-wider mb-2" style={{ color: c.textSecondary, opacity: 0.6 }}>Program Overview</p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: c.textPrimary }}>{program.summary}</p>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {[
                  ['Effective', `${new Date(program.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${new Date(program.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`],
                  ['Status', program.status],
                  ['Owner', program.ownerName],
                  ['Updated', formatLongDate(program.lastUpdated)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span className="font-semibold" style={{ color: c.textSecondary }}>{label}: </span>
                    <span style={{ color: c.textPrimary }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Notes */}
            {program.specialNotes?.length > 0 && (
              <div>
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider mb-2" style={{ color: c.textSecondary, opacity: 0.6 }}>What&apos;s Special</p>
                <ul className="space-y-2">
                  {program.specialNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: c.textPrimary }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: JSI_COLORS.success }} />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purchasing Awareness */}
            {program.purchasingAwarenessRequired && (
              <div>
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider mb-1.5" style={{ color: c.textSecondary, opacity: 0.6 }}>Purchasing Visibility</p>
                <p className="text-sm" style={{ color: c.textPrimary }}>
                  Purchasing awareness required.
                  {program.purchasingNotifiedAt && ` Notified ${formatLongDate(program.purchasingNotifiedAt)}.`}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN: CustomerMicrositeScreen
   ═══════════════════════════════════════════════════════════════ */
export const CustomerMicrositeScreen = ({ customer, theme }) => {
  const dark = isDarkTheme(theme);
  const c = theme.colors;
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';

  const [orderTab, setOrderTab] = useState('Current');
  const [materialTab, setMaterialTab] = useState('laminates');
  const [spaceFilter, setSpaceFilter] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [lightboxImg, setLightboxImg] = useState(null);

  /* ── Logo with fallback chain ── */
  const logoUrl = customer.uploadedLogoUrl
    ?? (customer.domain ? `https://logo.clearbit.com/${encodeURIComponent(customer.domain)}` : null);

  const [logoError, setLogoError] = useState(false);
  const faviconUrl = customer.domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(customer.domain)}&sz=128` : null;

  /* ── Standards grouping ── */
  const { programs, contracts, dimmed } = useMemo(() => {
    const progs = [], contr = [], dim = [];
    (customer.standardsPrograms || []).forEach(p => {
      if (p.status === 'Expiring' || p.status === 'Expired') dim.push(p);
      else if (p.poRequirementText) contr.push(p);
      else progs.push(p);
    });
    return { programs: progs, contracts: contr, dimmed: dim };
  }, [customer.standardsPrograms]);

  /* ── Install filter (project-aware) ── */
  const allInstalls = useMemo(() => getAllInstalls(customer), [customer]);

  const filteredInstalls = useMemo(() => {
    let list = allInstalls;
    if (selectedProjectFilter !== 'All') list = list.filter(i => i.projectId === selectedProjectFilter);
    if (spaceFilter !== 'All') list = list.filter(i => i.spaceType === spaceFilter);
    return list;
  }, [allInstalls, selectedProjectFilter, spaceFilter]);

  const verticalColor = VERTICAL_COLORS[customer.vertical] || c.textSecondary;

  const ordersList = orderTab === 'Current' ? (customer.orders?.current || []) : (customer.orders?.history || []);
  const materialsList = customer.approvedMaterials?.[materialTab] || [];

  const activeStandards = (customer.standardsPrograms || []).filter(p => p.status === 'Active' || p.status === 'Expiring').length;
  const currentOrders = (customer.orders?.current || []).length;
  const lastInstall = useMemo(() =>
    [...allInstalls].sort((a, b) => b.date.localeCompare(a.date))[0]?.date,
    [allInstalls]
  );

  const renderProgramRow = useCallback((prog, dim = false) => (
    <button key={prog.id} type="button" onClick={() => setSelectedProgram(prog)}
      className="w-full flex items-center gap-3 py-4 text-left transition-colors active:bg-black/[0.03] dark:active:bg-white/[0.05]"
      style={{ opacity: dim ? 0.45 : 1 }}>
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <CodeChip code={prog.code} theme={theme} />
        <StatusBadge status={prog.status} />
      </div>
      <span className="text-sm font-semibold flex-1 min-w-0" style={{ color: c.textPrimary }}>{prog.title}</span>
      <ChevronRight className="w-4 h-4 shrink-0 opacity-25 ml-1" style={{ color: c.textSecondary }} />
    </button>
  ), [c, theme]);

  return (
    <div className="min-h-full" style={{ backgroundColor: c.background, color: c.textPrimary, paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-40">
        <div className="flex flex-col lg:flex-row gap-5 pt-5">

          <div className="flex-1 min-w-0 space-y-4">

            {/* ── HERO HEADER ── */}
            <div className="rounded-2xl px-5 py-5 flex items-center gap-4"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#fff', border: `1px solid ${border}` }}>
              {/* Logo */}
              <div className="w-[4.5rem] h-[4.5rem] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', border: `1px solid ${border}` }}>
                {logoUrl && !logoError ? (
                  <img src={logoError ? faviconUrl : logoUrl} alt="" className="w-full h-full object-contain p-2"
                    onError={() => setLogoError(true)} />
                ) : faviconUrl && logoError ? (
                  <img src={faviconUrl} alt="" className="w-10 h-10 object-contain" onError={() => {}} />
                ) : (
                  <InitialsAvatar name={customer.name} size={72} theme={theme} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold tracking-tight leading-tight" style={{ color: c.textPrimary }}>{customer.name}</h1>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: c.textSecondary }} />
                    <span className="text-sm" style={{ color: c.textSecondary }}>{customer.location.city}, {customer.location.state}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${verticalColor}18`, color: verticalColor }}>
                    {customer.vertical}
                  </span>
                </div>
              </div>
            </div>

            {/* ── ORDERS ── */}
            <Sect title="Orders" icon={Package} theme={theme} noPad>
              <div className="px-5 pt-4 pb-1">
                <TabBar tabs={['Current', 'History']} value={orderTab} onChange={setOrderTab} theme={theme} />
              </div>
              {ordersList.length > 0 ? ordersList.map((o) => (
                <React.Fragment key={o.id}>
                  <Divider dark={dark} />
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: c.textPrimary }}>{o.orderNumber}</p>
                      <p className="text-[0.8125rem] font-semibold mt-0.5" style={{ color: c.textSecondary }}>{fmtMoney(o.amount)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs" style={{ color: c.textSecondary }}>{o.eta ? `ETA ${fmtDate(o.eta)}` : fmtDate(o.completedAt)}</p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                </React.Fragment>
              )) : (
                <div className="px-5 py-6">
                  <p className="text-sm text-center" style={{ color: c.textSecondary, opacity: 0.6 }}>No {orderTab.toLowerCase()} orders</p>
                </div>
              )}
              <div className="pb-1" />
            </Sect>

            {/* ── APPROVED MATERIALS ── */}
            <Sect title="Approved Materials" icon={Award} theme={theme} noPad>
              <div className="px-5 pt-4 pb-1">
                <TabBar
                  tabs={MATERIAL_CATEGORIES.map(m => m.label)}
                  value={MATERIAL_CATEGORIES.find(m => m.key === materialTab)?.label || 'Laminates'}
                  onChange={label => setMaterialTab(MATERIAL_CATEGORIES.find(m => m.label === label)?.key || 'laminates')}
                  theme={theme}
                />
              </div>
              {materialsList.length > 0 ? (
                materialsList.map((m) => (
                  <React.Fragment key={m.id}>
                    <Divider dark={dark} />
                    <div className="flex items-center gap-3.5 px-5 py-4">
                      <div className="w-9 h-9 rounded-xl shrink-0" style={{ backgroundColor: m.swatchHex, border: `1.5px solid ${border}` }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: c.textPrimary }}>{m.name}</p>
                        <p className="text-xs font-mono mt-0.5" style={{ color: c.textSecondary, opacity: 0.65 }}>{m.code}</p>
                      </div>
                      {m.vendor && <span className="text-xs shrink-0" style={{ color: c.textSecondary }}>{m.vendor}</span>}
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="px-5 py-6">
                  <p className="text-sm text-center" style={{ color: c.textSecondary, opacity: 0.6 }}>None approved</p>
                </div>
              )}
              <div className="pb-1" />
            </Sect>

            {/* ── STANDARDS & PROGRAMS ── */}
            {(customer.standardsPrograms || []).length > 0 && (
              <Sect title="Standards & Programs" theme={theme} noPad>
                <div className="px-5 pt-2">
                  {programs.length > 0 && (
                    <div className="divide-y" style={{ borderColor: border }}>
                      {programs.map(p => renderProgramRow(p))}
                    </div>
                  )}
                  {contracts.length > 0 && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wider pt-4 pb-0.5" style={{ color: c.accent, opacity: 0.65 }}>Contracts</p>
                      <div className="divide-y" style={{ borderColor: border }}>
                        {contracts.map(p => renderProgramRow(p))}
                      </div>
                    </>
                  )}
                  {dimmed.length > 0 && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wider pt-4 pb-0.5" style={{ color: c.textSecondary, opacity: 0.5 }}>Expiring / Expired</p>
                      <div className="divide-y" style={{ borderColor: border }}>
                        {dimmed.map(p => renderProgramRow(p, true))}
                      </div>
                    </>
                  )}
                </div>
                <div className="pb-3" />
              </Sect>
            )}

            {/* ── TYPICALS ── */}
            {(customer.typicals || []).length > 0 && (
              <Sect title="Typicals" theme={theme}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {customer.typicals.map(t => (
                    <div key={t.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${border}`, backgroundColor: c.surface }}>
                      <div className="aspect-[4/3] relative">
                        <img src={t.image} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-sm font-semibold truncate" style={{ color: c.textPrimary }}>{t.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: c.textSecondary }}>{t.dimensions}</p>
                        <p className="text-sm font-bold mt-1" style={{ color: c.accent }}>From {fmtMoney(t.startingPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Sect>
            )}

            {/* ── PROJECTS ── */}
            {(customer.projects || []).length > 0 && (
              <Sect title="Projects" theme={theme} noPad>
                <div className="px-5 pt-1">
                  {(customer.projects || []).map((proj, idx) => {
                    const photoCount = (proj.installs || []).length;
                    const isActive = selectedProjectFilter === proj.id;
                    return (
                      <React.Fragment key={proj.id}>
                        {idx > 0 && <Divider dark={dark} />}
                        <button type="button"
                          onClick={() => setSelectedProjectFilter(isActive ? 'All' : proj.id)}
                          className="w-full flex items-center gap-4 py-4 text-left transition-all active:bg-black/[0.03] dark:active:bg-white/[0.05]"
                          style={{ backgroundColor: isActive ? `${c.accent}08` : 'transparent' }}>
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                            <img src={proj.image} alt={proj.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: c.textPrimary }}>{proj.name}</p>
                            <p className="text-xs mt-1" style={{ color: c.textSecondary }}>
                              {proj.location}{photoCount > 0 ? ` · ${photoCount} photo${photoCount !== 1 ? 's' : ''}` : ''}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 opacity-25" style={{ color: c.textSecondary, transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="pb-3" />
              </Sect>
            )}

            {/* ── INSTALL GALLERY ── */}
            {allInstalls.length > 0 && (
              <Sect
                title={selectedProjectFilter !== 'All'
                  ? `Installs · ${(customer.projects || []).find(p => p.id === selectedProjectFilter)?.name || ''}`
                  : 'Install Gallery'}
                icon={Image}
                theme={theme}
                right={selectedProjectFilter !== 'All' && (
                  <button onClick={() => setSelectedProjectFilter('All')} className="text-xs font-semibold" style={{ color: c.accent }}>Show All</button>
                )}>
                <TabBar
                  tabs={INSTALL_SPACE_TYPES.filter(t => t === 'All' || allInstalls.some(i => i.spaceType === t))}
                  value={spaceFilter} onChange={setSpaceFilter} theme={theme}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {filteredInstalls.map(i => (
                    <button key={i.id} type="button" onClick={() => setLightboxImg(i)}
                      className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={i.url} alt={i.caption} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="absolute bottom-0 left-0 p-2.5 text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">{i.caption}</p>
                    </button>
                  ))}
                </div>
              </Sect>
            )}

            {/* ── DOCUMENTS ── */}
            {(customer.documents || []).length > 0 && (
              <Sect title="Documents" icon={FileText} theme={theme} noPad>
                <div className="px-5 pt-1">
                  {customer.documents.map((d, idx) => (
                    <React.Fragment key={d.id}>
                      {idx > 0 && <Divider dark={dark} />}
                      <div className="flex items-center gap-3 py-4">
                        <FileText className="w-4 h-4 shrink-0" style={{ color: c.textSecondary, opacity: 0.5 }} />
                        <span className="text-sm font-medium flex-1 truncate" style={{ color: c.textPrimary }}>{d.name}</span>
                        <Download className="w-4 h-4 shrink-0 opacity-35" style={{ color: c.textSecondary }} />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <div className="pb-3" />
              </Sect>
            )}

            {/* ── CONTACTS ── */}
            {(customer.contacts || []).filter(ct => ct.visibility === 'dealer').length > 0 && (
              <Sect title="Contacts" theme={theme} noPad>
                <div className="px-5 pt-1">
                  {customer.contacts.filter(ct => ct.visibility === 'dealer').map((ct, idx) => (
                    <React.Fragment key={ct.id}>
                      {idx > 0 && <Divider dark={dark} />}
                      <div className="flex items-center gap-3.5 py-4">
                        <InitialsAvatar name={ct.name} size={38} theme={theme} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: c.textPrimary }}>{ct.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: c.textSecondary }}>{ct.role}</p>
                        </div>
                        <a href={`mailto:${ct.email}`} className="text-xs font-semibold shrink-0" style={{ color: c.accent }}>{ct.email}</a>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <div className="pb-3" />
              </Sect>
            )}
          </div>

          {/* ── DESKTOP RIGHT RAIL ── */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky" style={{ top: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 16px)' }}>
              <Sect title="At a Glance" theme={theme}>
                <div className="space-y-3.5">
                  {[
                    ['Active Standards', activeStandards],
                    ['Current Orders', currentOrders],
                    ['Last Install', lastInstall ? fmtDate(lastInstall) : '—'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: c.textSecondary }}>{label}</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: c.textPrimary }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* JSI Rep */}
                {customer.jsiRep && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: border }}>
                    <p className="text-[0.6875rem] font-bold uppercase tracking-wider mb-3" style={{ color: c.textSecondary, opacity: 0.5 }}>Your JSI Rep</p>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={customer.jsiRep.name} size={36} theme={theme} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold" style={{ color: c.textPrimary }}>{customer.jsiRep.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: c.textSecondary }}>{customer.jsiRep.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <a href={`mailto:${customer.jsiRep.email}`} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: c.accent }}>
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                      <a href={`tel:${customer.jsiRep.phone}`} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: c.accent }}>
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>
                  </div>
                )}
              </Sect>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxImg && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-6"
          style={{ zIndex: DESIGN_TOKENS.zIndex.modal + 10, backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightboxImg(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setLightboxImg(null)}>
            <X className="w-5 h-5 text-white" />
          </button>
          <img src={lightboxImg.url} alt={lightboxImg.caption} className="max-w-full max-h-[85vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-8 left-0 right-0 text-center px-8">
            <p className="text-white text-sm font-semibold">{lightboxImg.caption}</p>
            {lightboxImg.projectName && <p className="text-white/60 text-xs mt-1">{lightboxImg.projectName}</p>}
            {lightboxImg.date && <p className="text-white/45 text-xs mt-0.5">{fmtDate(lightboxImg.date)}</p>}
          </div>
        </div>,
        document.body,
      )}

      {/* ── Standards Modal ── */}
      {selectedProgram && (
        <StandardsProgramDetailModal program={selectedProgram} customer={customer} theme={theme} onClose={() => setSelectedProgram(null)} />
      )}
    </div>
  );
};
