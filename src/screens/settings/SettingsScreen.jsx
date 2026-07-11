import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AppScreenLayout } from '../../components/common/AppScreenLayout.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { User, Bell, Palette, ChevronDown, Loader2 } from 'lucide-react';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { useLeadTimeFavorites } from '../../hooks/useLeadTimeFavorites.js';
import {
  isDarkTheme,
  DESIGN_TOKENS,
  inputSurface,
  fieldTileSurface,
  groupedTileSurface,
  modalCardSurface,
  FIELD_LABEL_CLASSNAME,
  SECTION_TITLE_CLASSNAME,
} from '../../design-system/tokens.js';

const Select = ({ value, onChange, options, theme, surfaceStyle }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const portalRef = useRef(null);
  const [rect, setRect] = useState(null);
  const isDark = isDarkTheme(theme);
  const popoverSurface = modalCardSurface(theme);
  const selectedBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.06)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)';

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
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 h-11 rounded-2xl flex items-center justify-between text-sm font-medium transition-all"
        style={{ ...inputSurface(theme), ...surfaceStyle }}
      >
        <span>{current}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
      </button>
      {open && rect && createPortal(
        <div ref={portalRef} style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, width: rect.width, zIndex: DESIGN_TOKENS.zIndex.popover }}>
          <div className="py-1.5 rounded-2xl overflow-hidden" style={popoverSurface}>
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors active:scale-[0.99]" style={{ color: o.value === value ? theme.colors.accent : theme.colors.textPrimary, backgroundColor: o.value === value ? selectedBg : 'transparent' }}
                onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.backgroundColor = hoverBg; }}
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

const SectionHeader = ({ icon: Icon, title, subtitle, theme }) => (
  <div className="px-5 pt-4 pb-3">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ ...fieldTileSurface(theme), borderRadius: '999px' }}>
        <Icon className="w-4 h-4" style={{ color: theme.colors.accent }} />
      </div>
      <div className="min-w-0">
        <h2 className={SECTION_TITLE_CLASSNAME} style={{ color: theme.colors.textPrimary }}>{title}</h2>
        {subtitle && <p className="text-[0.75rem] mt-1 leading-relaxed" style={{ color: theme.colors.textSecondary }}>{subtitle}</p>}
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
  const notifGroups = [
    { label: 'Orders and shipping', keys: ['newOrder', 'orderUpdate', 'samplesShipped'] },
    { label: 'Projects and revenue', keys: ['replacementApproved', 'commissionPosted'] },
    { label: 'Products and community', keys: ['leadTimeChange', 'communityPost'] },
  ];
  const notifLabels = { newOrder:'New order placed', orderUpdate:'Order status update', samplesShipped:'Samples shipped', leadTimeChange:'Lead time change', replacementApproved:'Replacement approved', commissionPosted:'Commission posted', communityPost:'New JSI community post' };
  const [leadTimeFavorites, setLeadTimeFavorites] = useLeadTimeFavorites();
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
  const rowDivider = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)';
  const groupedRows = {
    ...groupedTileSurface(theme),
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(240,237,232,0.72)',
  };
  const insetTileSurface = {
    ...groupedTileSurface(theme),
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(240,237,232,0.92)',
  };
  const settingsCardStyle = isDark ? {} : { border: 'none' };
  const settingsInputStyle = {
    ...inputSurface(theme),
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(246,243,238,0.88)',
    border: isDark ? '1px solid rgba(255,255,255,0.045)' : 'none',
  };

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

  const accountCard = (
    <GlassCard theme={theme} className="overflow-visible order-1 lg:order-none" style={settingsCardStyle}>
      <SectionHeader icon={User} title="Account" subtitle="Keep your profile details up to date." theme={theme} />
      <div className="px-5 pb-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={`${FIELD_LABEL_CLASSNAME} block mb-1.5`} style={{ color: theme.colors.textSecondary }}>First name</label>
            <input
              value={firstName}
              onChange={e => {
                const value = e.target.value;
                setFirstName(value);
                setUserSettings?.(prev => ({ ...prev, firstName: value }));
              }}
              autoComplete="given-name"
              className="w-full px-4 h-11 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-offset-1"
              style={settingsInputStyle}
            />
          </div>
          <div>
            <label className={`${FIELD_LABEL_CLASSNAME} block mb-1.5`} style={{ color: theme.colors.textSecondary }}>Last name</label>
            <input
              value={lastName}
              onChange={e => {
                const value = e.target.value;
                setLastName(value);
                setUserSettings?.(prev => ({ ...prev, lastName: value }));
              }}
              autoComplete="family-name"
              className="w-full px-4 h-11 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-offset-1"
              style={settingsInputStyle}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
          <div className="min-w-0">
            <label className={`${FIELD_LABEL_CLASSNAME} block mb-1.5`} style={{ color: theme.colors.textSecondary }}>Street address</label>
            <div className="relative">
              <input
                value={streetAddress}
                onChange={e => applyStreetAddress(e.target.value)}
                onFocus={() => setShowAddressSuggestions(true)}
                onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 120)}
                autoComplete="street-address"
                inputMode="text"
                placeholder="Start typing your address"
                className="w-full px-4 h-11 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-offset-1"
                style={settingsInputStyle}
              />
              {showAddressSuggestions && (
                <div
                  className="absolute left-0 right-0 mt-1.5 rounded-2xl overflow-hidden z-20"
                  style={modalCardSurface(theme)}
                >
                  {addressLoading && (
                    <div className="px-3 py-2.5 text-xs flex items-center gap-2" style={{ color: theme.colors.textSecondary }}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Searching addresses...
                    </div>
                  )}
                  {!addressLoading && addressSuggestions.length === 0 && (
                    <div className="px-3 py-2.5 text-xs" style={{ color: theme.colors.textSecondary }}>
                      Keep typing to find your full address.
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
                  <div className="px-3 py-1.5 text-[0.625rem]" style={{ color: theme.colors.textSecondary, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.018)' }}>
                    Powered by OpenStreetMap
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className={`${FIELD_LABEL_CLASSNAME} block mb-1.5`} style={{ color: theme.colors.textSecondary }}>T-shirt size</label>
            <Select
              value={shirtSize}
              onChange={(s) => {
                setShirtSize(s);
                setUserSettings?.(prev => ({ ...prev, shirtSize: s }));
              }}
              options={['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => ({ value: s, label: s }))}
              theme={theme}
              surfaceStyle={settingsInputStyle}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );

  const appearanceCard = (
    <GlassCard theme={theme} className="overflow-hidden order-3 lg:order-none" style={settingsCardStyle}>
      <SectionHeader icon={Palette} title="Appearance" theme={theme} />
      <div className="px-5 pb-5">
        <div className="rounded-2xl px-4 py-3.5 flex items-center justify-between gap-4" style={groupedRows}>
          <div className="min-w-0">
            <p className="text-[0.875rem] font-medium leading-tight" style={{ color: theme.colors.textPrimary }}>Dark mode</p>
            <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>Use a lower-glare theme throughout the app.</p>
          </div>
          <ToggleSwitch
            checked={isDarkMode}
            onChange={() => onToggleTheme?.()}
            theme={theme}
            ariaLabel="Dark mode"
          />
        </div>
      </div>
    </GlassCard>
  );

  const notificationsCard = (
    <GlassCard theme={theme} className="overflow-hidden order-2 lg:order-none lg:col-span-7 xl:col-span-8" style={settingsCardStyle}>
      <SectionHeader icon={Bell} title="Push Notifications" subtitle="Only keep alerts that are useful for your day-to-day." theme={theme} />
      <div className="px-4 pb-4 space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {notifGroups.map((group) => (
            <div key={group.label} className={group.keys.includes('leadTimeChange') ? 'xl:col-span-2' : undefined}>
              <div className="px-2.5 pb-2">
                <span className={`${FIELD_LABEL_CLASSNAME}`} style={{ color: theme.colors.textSecondary }}>
                  {group.label}
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden" style={groupedRows}>
                {group.keys.map((k, index) => (
                  <div key={k}>
                    <div className="flex items-center justify-between px-4 py-3 gap-4 min-h-[44px]">
                      <span className="text-[0.875rem] font-medium leading-tight" style={{ color: theme.colors.textPrimary }}>{notifLabels[k]}</span>
                      <ToggleSwitch
                        checked={!!notif[k]}
                        onChange={(e) => setNotif(p => ({ ...p, [k]: e.target.checked }))}
                        theme={theme}
                        ariaLabel={notifLabels[k]}
                      />
                    </div>
                    {k === 'leadTimeChange' && notif.leadTimeChange && (
                      <div className="px-4 pb-4">
                        <div className="rounded-2xl p-3.5" style={insetTileSurface}>
                          <div className={`${FIELD_LABEL_CLASSNAME} mb-2`} style={{ color: theme.colors.textSecondary }}>
                            Lead time series alerts
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {leadTimeOptions.map((series) => {
                              const active = leadTimeFavorites.includes(series);
                              return (
                                <button
                                  key={series}
                                  type="button"
                                  onClick={() => setLeadTimeFavorites(prev => (active ? prev.filter(s => s !== series) : [...prev, series]))}
                                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 min-h-[36px]"
                                  style={{
                                    backgroundColor: active ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.12)' : '#FFFFFF'),
                                    color: active ? (isDark ? '#1A1A1A' : '#FFFFFF') : theme.colors.textSecondary,
                                    border: `1px solid ${active ? 'transparent' : theme.colors.border}`
                                  }}
                                >
                                  {series}
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-[0.6875rem] mt-2" style={{ color: theme.colors.textSecondary }}>
                            {leadTimeFavorites.length} selected
                          </div>
                        </div>
                      </div>
                    )}
                    {index < group.keys.length - 1 && <div className="mx-4" style={{ borderTop: `1px solid ${rowDivider}` }} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );

  return (
    <AppScreenLayout
      theme={theme}
      title="Settings"
      subtitle="Profile, alerts, and appearance"
      maxWidthClass="max-w-content"
      horizontalPaddingClass="px-4 sm:px-6 lg:px-8"
      contentPaddingBottomClass="pb-24 lg:pb-12"
      contentClassName="pt-1 space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Mobile: contents so cards join the parent grid for reordering.
            Desktop: sticky left rail with Account + Appearance. */}
        <div className="contents lg:flex lg:flex-col lg:gap-4 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-4 lg:self-start">
          {accountCard}
          {appearanceCard}
        </div>
        {notificationsCard}
      </div>

      <div className="pt-1 pb-4 text-center text-[0.6875rem] font-medium" style={{ color: theme.colors.textSecondary }}>v0.9.4</div>
    </AppScreenLayout>
  );
};
