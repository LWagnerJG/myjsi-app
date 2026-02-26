import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { User, Bell, Palette, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import { hapticLight } from '../../utils/haptics.js';

const Toggle = ({ checked, onChange, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <button onClick={() => { hapticLight(); onChange(!checked); }} className="w-12 h-7 rounded-full transition-all duration-200 relative flex-shrink-0" style={{ backgroundColor: checked ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : theme.colors.border) }}>
      <div className="w-5.5 h-5.5 rounded-full transition-transform duration-200 absolute top-[3px]" style={{ width: 22, height: 22, backgroundColor: checked ? (isDark ? '#1A1A1A' : '#FFFFFF') : (isDark ? 'rgba(255,255,255,0.5)' : '#FFFFFF'), transform: checked ? 'translateX(24px)' : 'translateX(3px)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', left: 0 }} />
    </button>
  );
};

// Glass portal dropdown Select
const Select = ({ value, onChange, options, theme }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const portalRef = useRef(null);
  const [rect, setRect] = useState(null);
  const isDark = isDarkTheme(theme);

  useEffect(() => {
    const handleClick = (e) => {
      if (!open) return;
      if (triggerRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open && triggerRef.current) {
      const update = () => { if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect()); };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
    }
  }, [open]);

  const current = options.find(o => o.value === value)?.label || 'Select';

  return (
    <div className="relative" ref={triggerRef}>
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full px-4 py-2.5 rounded-2xl flex items-center justify-between text-sm font-medium transition-all" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
        <span>{current}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
      </button>
      {open && rect && createPortal(
        <div ref={portalRef} style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, width: rect.width, zIndex: DESIGN_TOKENS.zIndex.popover }}>
          <div className="py-1.5 rounded-2xl overflow-hidden" style={{
            backgroundColor: isDark ? '#282828' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: DESIGN_TOKENS.shadows.modal
          }}>
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors active:scale-[0.99]" style={{ color: o.value === value ? theme.colors.accent : theme.colors.textPrimary, backgroundColor: o.value === value ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)') : 'transparent' }}
                onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { if (o.value !== value) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>, document.body)
      }
    </div>
  );
};

// Section header
const SectionHeader = ({ icon: Icon, title, subtitle, theme }) => (
  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${isDarkTheme(theme) ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}>
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: isDarkTheme(theme) ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.06)' }}>
        <Icon className="w-4 h-4" style={{ color: theme.colors.accent }} />
      </div>
      <div>
        <h2 className="text-[15px] font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{subtitle}</p>}
      </div>
    </div>
  </div>
);

export const SettingsScreen = ({ theme, isDarkMode, onToggleTheme, userSettings, setUserSettings }) => {
  const isDark = isDarkTheme(theme);
  const [firstName, setFirstName] = useState(userSettings?.firstName || 'Luke');
  const [lastName, setLastName] = useState(userSettings?.lastName || 'Wagner');
  const [streetAddress, setStreetAddress] = useState(userSettings?.streetAddress || userSettings?.homeAddress || '');
  const [shirtSize, setShirtSize] = useState(userSettings?.shirtSize || 'L');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressRequestRef = useRef(null);
  const addressCacheRef = useRef(new Map());
  const [notif, setNotif] = useState({ newOrder: true, samplesShipped: true, leadTimeChange: true, communityPost: false, replacementApproved: true, commissionPosted: true, orderUpdate: true });
  const notifLabels = { newOrder:'New order placed', orderUpdate:'Order status update', samplesShipped:'Samples shipped', leadTimeChange:'Lead time change', replacementApproved:'Replacement approved', commissionPosted:'Commission posted', communityPost:'New JSI community post' };
  const notifKeys = Object.keys(notif);
  const [leadTimeFavorites, setLeadTimeFavorites] = useState(() => {
    try { const raw = localStorage.getItem('leadTimeFavorites'); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  });
  useEffect(() => {
    try {
      localStorage.setItem('leadTimeFavorites', JSON.stringify(leadTimeFavorites));
    } catch (_storageError) {
      return;
    }
  }, [leadTimeFavorites]);
  const leadTimeOptions = useMemo(() => {
    const unique = Array.from(new Set(LEAD_TIMES_DATA.map(item => item.series))).sort();
    return unique.slice(0, 24);
  }, []);
  const fallbackAddressHints = useMemo(() => {
    const candidates = [
      userSettings?.streetAddress,
      userSettings?.homeAddress,
      '5445 N Deerwood Lake Rd, Jasper, IN 47546',
      '4102 Meghan Beeler Court, South Bend, IN 46628',
      '429 N Pennsylvania St, Indianapolis, IN 46204',
      '201 E Market St, Louisville, KY 40202',
      '111 W Berry St, Fort Wayne, IN 46802',
    ];
    return Array.from(new Set(candidates.filter(Boolean).map((item) => String(item).trim()))).slice(0, 6);
  }, [userSettings?.homeAddress, userSettings?.streetAddress]);
  const hoverBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';

  useEffect(() => {
    setFirstName(userSettings?.firstName || 'Luke');
    setLastName(userSettings?.lastName || 'Wagner');
    setStreetAddress(userSettings?.streetAddress || userSettings?.homeAddress || '');
    setShirtSize(userSettings?.shirtSize || 'L');
  }, [userSettings?.firstName, userSettings?.lastName, userSettings?.streetAddress, userSettings?.homeAddress, userSettings?.shirtSize]);

  const applyStreetAddress = useCallback((value) => {
    setStreetAddress(value);
    setUserSettings?.(prev => ({ ...prev, streetAddress: value, homeAddress: value }));
  }, [setUserSettings]);

  useEffect(() => {
    const query = String(streetAddress || '').trim();
    if (query.length < 3) {
      setAddressLoading(false);
      setAddressSuggestions(query ? fallbackAddressHints.filter((hint) => hint.toLowerCase().includes(query.toLowerCase())) : fallbackAddressHints);
      return;
    }

    const cacheKey = query.toLowerCase();
    const cached = addressCacheRef.current.get(cacheKey);
    if (cached) {
      setAddressSuggestions(cached);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (addressRequestRef.current) addressRequestRef.current.abort();
        const controller = new AbortController();
        addressRequestRef.current = controller;
        setAddressLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=us&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: {
              'Accept-Language': 'en-US',
            },
          }
        );
        if (!response.ok) throw new Error('Address lookup failed');
        const rows = await response.json();
        const suggestions = Array.from(new Set((rows || []).map((row) => row?.display_name).filter(Boolean)));
        addressCacheRef.current.set(cacheKey, suggestions);
        setAddressSuggestions(suggestions.length ? suggestions : fallbackAddressHints.filter((hint) => hint.toLowerCase().includes(query.toLowerCase())));
      } catch (error) {
        if (error?.name !== 'AbortError') {
          setAddressSuggestions(fallbackAddressHints.filter((hint) => hint.toLowerCase().includes(query.toLowerCase())));
        }
      } finally {
        setAddressLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [streetAddress, fallbackAddressHints]);

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 space-y-5 max-w-xl mx-auto w-full pt-2">

          {/* Account */}
          <GlassCard theme={theme} className="overflow-hidden">
            <SectionHeader icon={User} title="Account" theme={theme} />
            <div className="p-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: theme.colors.textSecondary }}>First Name</label>
                  <input
                    value={firstName}
                    onChange={e => {
                      const value = e.target.value;
                      setFirstName(value);
                      setUserSettings?.(prev => ({ ...prev, firstName: value }));
                    }}
                    autoComplete="given-name"
                    className="w-full px-4 h-10 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-offset-1"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary, focusRingColor: theme.colors.accent }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: theme.colors.textSecondary }}>Last Name</label>
                  <input
                    value={lastName}
                    onChange={e => {
                      const value = e.target.value;
                      setLastName(value);
                      setUserSettings?.(prev => ({ ...prev, lastName: value }));
                    }}
                    autoComplete="family-name"
                    className="w-full px-4 h-10 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-offset-1"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: theme.colors.textSecondary }}>Street Address</label>
                <div className="relative">
                  <input
                    value={streetAddress}
                    onChange={e => applyStreetAddress(e.target.value)}
                    onFocus={() => setShowAddressSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 120)}
                    autoComplete="street-address"
                    inputMode="text"
                    placeholder="Start typing full street address"
                    className="w-full pl-10 pr-4 h-10 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-offset-1"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface, border:`1px solid ${theme.colors.border}`, color:theme.colors.textPrimary }}
                  />
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: theme.colors.textSecondary }} />
                  {showAddressSuggestions && (
                    <div
                      className="absolute left-0 right-0 mt-1.5 rounded-2xl border overflow-hidden z-20"
                      style={{
                        borderColor: theme.colors.border,
                        backgroundColor: isDark ? '#242424' : '#FFFFFF',
                        boxShadow: DESIGN_TOKENS.shadows.modal,
                      }}
                    >
                      {addressLoading && (
                        <div className="px-3 py-2.5 text-xs flex items-center gap-2" style={{ color: theme.colors.textSecondary }}>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Searching addresses...
                        </div>
                      )}
                      {!addressLoading && addressSuggestions.length === 0 && (
                        <div className="px-3 py-2.5 text-xs" style={{ color: theme.colors.textSecondary }}>
                          Keep typing to search full addresses
                        </div>
                      )}
                      {!addressLoading && addressSuggestions.map((address) => (
                        <button
                          key={address}
                          type="button"
                          onMouseDown={() => applyStreetAddress(address)}
                          className="w-full text-left px-3 py-2.5 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {address}
                        </button>
                      ))}
                      <div className="px-3 py-1.5 text-[10px] border-t" style={{ color: theme.colors.textSecondary, borderColor: theme.colors.border }}>
                        Search powered by OpenStreetMap
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: theme.colors.textSecondary }}>T-Shirt Size</label>
                <Select value={shirtSize} onChange={(s) => { setShirtSize(s); setUserSettings?.(prev => ({ ...prev, shirtSize: s })); }} options={['XS','S','M','L','XL','XXL'].map(s=>({value:s,label:s}))} theme={theme} />
              </div>
            </div>
          </GlassCard>

          {/* Push Notifications */}
          <GlassCard theme={theme} className="overflow-hidden">
            <SectionHeader icon={Bell} title="Push Notifications" subtitle="Choose which alerts you want to receive." theme={theme} />
            <div className="p-3">
              {notifKeys.map((k, i) => (
                <div key={k}>
                  <div className="flex items-center justify-between px-3 py-3.5 rounded-2xl transition-colors" style={{}} onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{notifLabels[k]}</span>
                    <Toggle checked={!!notif[k]} onChange={v=>setNotif(p=>({...p,[k]:v}))} theme={theme} />
                  </div>
                  {k === 'leadTimeChange' && notif.leadTimeChange && (
                    <div className="px-3 pb-3 -mt-1">
                      <div className="p-4 rounded-2xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: theme.colors.textSecondary }}>Favorite lead time series</div>
                        <div className="flex flex-wrap gap-2">
                          {leadTimeOptions.map((series) => {
                            const active = leadTimeFavorites.includes(series);
                            return (
                              <button
                                key={series}
                                type="button"
                                onClick={() => setLeadTimeFavorites(prev => active ? prev.filter(s => s !== series) : [...prev, series])}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                                style={{
                                  backgroundColor: active ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : theme.colors.subtle),
                                  color: active ? (isDark ? '#1A1A1A' : '#FFFFFF') : theme.colors.textSecondary,
                                  border: `1px solid ${active ? 'transparent' : theme.colors.border}`
                                }}
                              >
                                {series}
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-[11px] mt-3 font-medium" style={{ color: theme.colors.textSecondary }}>
                          {leadTimeFavorites.length} selected
                        </div>
                      </div>
                    </div>
                  )}
                  {i < notifKeys.length - 1 && <div className="mx-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }} />}
                </div>
              ))}
            </div>
          </GlassCard>


          {/* Appearance */}
          <GlassCard theme={theme} className="overflow-hidden">
            <SectionHeader icon={Palette} title="Appearance" theme={theme} />
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>Dark mode</span>
              <Toggle checked={isDarkMode} onChange={onToggleTheme} theme={theme} />
            </div>
          </GlassCard>

          <div className="pt-1 pb-4 text-center text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>v0.9.3</div>
        </div>
      </div>
    </div>
  );
};
