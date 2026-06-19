import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowRight,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    Info,
    MapPin,
    Plus,
    Send,
    Sparkles,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import { FloatingSubmitCTA } from '../../../components/common/FloatingSubmitCTA.jsx';
import { JSIActionButton, JSIActionButtonGroup } from '../../../components/common/JSIButtons.jsx';
import {
    FIELD_LABEL_CLASSNAME,
    isDarkTheme,
    sectionCardSurface,
    fieldTileSurface,
    subtleBg,
    subtleBorder,
} from '../../../design-system/tokens.js';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { SearchableSelect } from '../../../components/forms/SearchableSelect.jsx';
import { hapticLight, hapticSuccess, hapticWarning } from '../../../utils/haptics.js';
import { DEALER_DIRECTORY_DATA } from '../dealer-directory/data.js';
import {
    TOUR_VISIT_AIRLINES,
    TOUR_VISIT_DIETARY_RESTRICTIONS,
    TOUR_VISIT_EXPERIENCE_TRACKS,
    TOUR_VISIT_FACILITIES,
    TOUR_VISIT_TSHIRT_SIZES,
    TOUR_VISIT_UPCOMING_VISITS,
    createRepGuest,
    createTourGuest,
} from './data.js';

const buildNewCustomerId = (value) => `new-customer-${String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

const buildDefaultExperienceSelections = () =>
    Object.fromEntries(
        TOUR_VISIT_EXPERIENCE_TRACKS.map((track) => [
            track.id,
            track.options.length ? [typeof track.options[0] === 'string' ? track.options[0] : track.options[0].label] : [],
        ])
    );

const TRIP_CONTROL_CLASS = 'min-h-[44px] h-[44px]';
const TRIP_CONTROL_TEXT = 'text-[0.8125rem] font-medium';

const fieldSurf = (dark) => dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)';
const bdr       = (dark) => dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
const eyebrow   = (c) => ({ fontSize: "0.625rem", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: c.textSecondary, opacity: 0.55 });
const cardChrome = (theme) => {
    const dark = isDarkTheme(theme);
    return {
        backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.84)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.05)'}`,
        boxShadow: dark ? 'none' : '0 14px 34px rgba(53,53,53,0.055)',
    };
};
const panelChrome = (theme) => {
    const dark = isDarkTheme(theme);
    return {
        backgroundColor: dark ? 'rgba(255,255,255,0.07)' : subtleBg(theme, 1),
        border: subtleBorder(theme),
    };
};
const iconTileChrome = (theme, active = false) => {
    const dark = isDarkTheme(theme);
    return {
        backgroundColor: active ? `${theme.colors.accent}14` : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.88)'),
        color: active ? theme.colors.accent : theme.colors.textSecondary,
        border: `1px solid ${active ? `${theme.colors.accent}22` : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.05)')}`,
    };
};
const chipChrome = (theme, active = false) => ({
    backgroundColor: active ? `${theme.colors.accent}12` : fieldSurf(isDarkTheme(theme)),
    color: active ? theme.colors.accent : theme.colors.textSecondary,
    border: `1px solid ${active ? `${theme.colors.accent}22` : bdr(isDarkTheme(theme))}`,
});

const isRepAttendee = (guest) => guest.isSelf || Boolean(guest.linkedMemberId);

const isGuestComplete = (guest) => {
    const hasName = guest.legalFirstName.trim() && guest.legalLastName.trim();
    return Boolean(hasName);
};

const getGuestDisplayName = (guest, guestIndex) => {
    const fullName = [guest.legalFirstName.trim(), guest.legalLastName.trim()].filter(Boolean).join(' ');
    if (fullName) return fullName;
    return guest.isSelf ? 'Your Profile' : `Guest ${guestIndex + 1}`;
};

const parseAgendaSession = (session) => {
    const match = String(session || '').match(/^(\d{1,2}:\d{2}\s?[AP]M)\s*-\s*(.+)$/i);

    if (!match) {
        return {
            time: '',
            detail: session,
        };
    }

    return {
        time: match[1].replace(/\s+/g, ' ').toUpperCase(),
        detail: match[2],
    };
};

const buildTripAgenda = (experienceSelections) => {
    const selectedOptions = TOUR_VISIT_EXPERIENCE_TRACKS.flatMap((track) =>
        (experienceSelections[track.id] || []).map((option) => ({ trackTitle: track.title, option }))
    );

    const midpoint = Math.max(1, Math.ceil(selectedOptions.length / 2));
    const dayOneOptions = selectedOptions.slice(0, midpoint);
    const dayTwoOptions = selectedOptions.slice(midpoint);

    return [
        {
            dayLabel: 'Day 1',
            sessions: [
                '9:00 AM - Welcome and intro conversation',
                ...dayOneOptions.map((item, index) => `${10 + index}:00 AM - ${item.option}`),
                '2:00 PM - Product training essentials',
            ],
        },
        {
            dayLabel: 'Day 2',
            sessions: [
                '9:00 AM - New product insight conversation',
                ...dayTwoOptions.map((item, index) => `${10 + index}:15 AM - ${item.option}`),
                '1:00 PM - Wrap-up and next-step planning',
            ],
        },
    ];
};

const normalizeCustomerLabel = (label) => String(label || '').replace(/\s*\((Dealership|Design Firm|End User|Dealer|Designer)\)$/, '').trim();
const getExperienceOptionLabel = (option) => (typeof option === 'string' ? option : option.label);
const getExperienceOptionDescription = (option) => (typeof option === 'string' ? '' : option.description || '');
const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const parseIsoDate = (isoDate) => {
    if (!isoDate) return null;
    const parsed = new Date(`${isoDate}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const formatDateLabel = (isoDate) => {
    if (!isoDate) return '';
    const parsed = parseIsoDate(isoDate);
    if (!parsed) return '';
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const formatDateRangeLabel = (startIsoDate, endIsoDate) => {
    const start = parseIsoDate(startIsoDate);
    const end = parseIsoDate(endIsoDate);
    if (!start || !end) return '';

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();

    if (sameMonth) {
        return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    }

    if (sameYear) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
    }

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};
const getDefaultDateRange = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return {
        start: toIsoDate(startDate),
        end: toIsoDate(endDate),
    };
};
const inferCustomerType = (companyName) => {
    const normalized = String(companyName || '').toLowerCase();
    if (normalized.includes('design')) return 'Design Firm';
    if (normalized.includes('end user')) return 'End User';
    return 'Dealership';
};

const buildSubmittedUpcomingVisit = ({
    selectedCustomerLabel,
    selectedFacility,
    guests,
    experienceSelections,
    requestedDateLabel,
}) => ({
    id: `planned-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
    companyName: normalizeCustomerLabel(selectedCustomerLabel) || 'New Customer Trip',
    facilityName: selectedFacility?.name || 'TBD Facility',
    dateLabel: requestedDateLabel || 'Draft itinerary',
    overnightLabel: `${guests.length} attendee${guests.length === 1 ? '' : 's'}`,
    attendees: guests
        .map((guest) => [guest.legalFirstName, guest.legalLastName].filter(Boolean).join(' ').trim())
        .filter(Boolean)
        .join(', '),
    approvalStatus: 'pending',
    approvalLabel: 'Awaiting JSI approval',
    agendaLabel: 'Draft agenda preloaded from selected experiences',
    agenda: buildTripAgenda(experienceSelections),
});

const tripSelectControlStyle = (theme, hasValue) => ({
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    color: hasValue ? theme.colors.textPrimary : theme.colors.textSecondary,
});

const TripField = ({ label, required, theme, children, className = '', tall = false, flexible = false }) => {
    const c = theme.colors;
    const shellClass = tall
        ? 'min-h-0 items-stretch'
        : flexible
            ? 'min-h-[44px] h-auto items-center md:h-[44px]'
            : `${TRIP_CONTROL_CLASS} items-center`;

    return (
        <div className={`min-w-0 space-y-1 ${className}`}>
            <span className={FIELD_LABEL_CLASSNAME} style={{ color: c.textSecondary }}>
                {label}
                {required ? <span style={{ color: c.error }}> *</span> : null}
            </span>
            <div
                className={`flex w-full rounded-2xl ${shellClass}`}
                style={fieldTileSurface(theme)}
            >
                {children}
            </div>
        </div>
    );
};

const TourVisitSelectField = ({ label, value, onChange, options, placeholder, theme, searchable = true, required = false }) => (
    <TripField label={label} required={required} theme={theme}>
        <div className="relative flex h-[44px] w-full items-center px-2">
            <SearchableSelect
                value={value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                theme={theme}
                searchable={searchable}
                size="sm"
                searchPlaceholder={`Search ${label.toLowerCase()}`}
                buttonClassName="!h-[44px] !min-h-[44px] !rounded-2xl !px-1.5 !pr-10 !text-[0.8125rem] !font-medium focus-ring"
                buttonStyle={tripSelectControlStyle(theme, Boolean(value))}
            />
        </div>
    </TripField>
);

const CardHeader = ({ title, subtitle, right, icon: Icon, theme }) => {
    const dark = isDarkTheme(theme);
    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5" style={{ borderBottom: `1px solid ${bdr(dark)}` }}>
            <div className="flex min-w-0 items-center gap-3">
                {Icon ? (
                    <span
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={iconTileChrome(theme)}
                    >
                        <Icon className="h-4 w-4" />
                    </span>
                ) : null}
                <div className="min-w-0">
                    <span style={eyebrow(theme.colors)}>{title}</span>
                    {subtitle ? (
                        <p className="mt-1 truncate text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
                            {subtitle}
                        </p>
                    ) : null}
                </div>
            </div>
            {right || null}
        </div>
    );
};

const DATE_WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DateRangeDropdown = ({
    theme,
    startDate,
    endDate,
    onChangeStart,
    onChangeEnd,
    showFieldLabel = true,
    compact = false,
    showChevron = true,
}) => {
    const dark = isDarkTheme(theme);
    const containerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const sourceDate = parseIsoDate(startDate) || new Date();
        return new Date(sourceDate.getFullYear(), sourceDate.getMonth(), 1);
    });

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event) => {
            if (containerRef.current?.contains(event.target)) return;
            setOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [open]);

    const monthLabel = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
    const summaryLabel = startDate && endDate
        ? `${formatDateLabel(startDate)} to ${formatDateLabel(endDate)}`
        : (startDate ? `${formatDateLabel(startDate)} - select end` : 'Select beginning and end');

    const dayCells = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => {
            const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1);
            return {
                iso: toIsoDate(date),
                dayNumber: index + 1,
            };
        }),
    ];

    const handleDaySelect = (selectedIsoDate) => {
        if (!startDate || (startDate && endDate)) {
            onChangeStart(selectedIsoDate);
            onChangeEnd('');
            return;
        }

        if (selectedIsoDate < startDate) {
            onChangeStart(selectedIsoDate);
            return;
        }

        onChangeEnd(selectedIsoDate);
    };

    const goToMonth = (delta) => {
        setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    setVisibleMonth(() => {
                        const sourceDate = parseIsoDate(startDate) || new Date();
                        return new Date(sourceDate.getFullYear(), sourceDate.getMonth(), 1);
                    });
                    setOpen((current) => !current);
                }}
                className={`w-full text-left transition-colors ${compact ? `flex ${TRIP_CONTROL_CLASS} items-center px-2` : 'rounded-[16px] px-3.5 py-2.5'}`}
                style={{
                    backgroundColor: compact ? 'transparent' : panelChrome(theme).backgroundColor,
                    border: compact ? 'none' : panelChrome(theme).border,
                    color: theme.colors.textPrimary,
                }}
            >
                {showFieldLabel ? (
                    <p className="text-[0.625rem] font-semibold uppercase tracking-[0.06em]" style={{ color: theme.colors.textSecondary }}>
                        Date Range
                    </p>
                ) : null}
                <div className={`${showFieldLabel ? 'mt-1' : ''} flex min-w-0 flex-1 items-center justify-between gap-3`}>
                    <p className={`min-w-0 truncate ${compact ? TRIP_CONTROL_TEXT : 'text-sm font-medium'}`} style={{ color: theme.colors.textPrimary }}>
                        {summaryLabel}
                    </p>
                    {showChevron ? (
                        <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                            style={{ color: theme.colors.textSecondary }}
                        />
                    ) : null}
                </div>
            </button>

            {open ? (
                <div
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[18px] p-3"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${bdr(dark)}`,
                        boxShadow: '0 18px 45px rgba(0, 0, 0, 0.12)',
                    }}
                >
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => goToMonth(-1)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ color: theme.colors.textSecondary, backgroundColor: fieldSurf(dark) }}
                            aria-label="Previous month"
                        >
                            <ArrowRight className="h-4 w-4 rotate-180" />
                        </button>
                        <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{monthLabel}</p>
                        <button
                            type="button"
                            onClick={() => goToMonth(1)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ color: theme.colors.textSecondary, backgroundColor: fieldSurf(dark) }}
                            aria-label="Next month"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-3 grid grid-cols-7 gap-0">
                        {DATE_WEEKDAY_LABELS.map((label) => (
                            <div key={label} className="text-center text-[0.6875rem] font-semibold" style={{ color: theme.colors.textSecondary }}>
                                {label}
                            </div>
                        ))}
                        {dayCells.map((cell, index) => {
                            if (!cell) {
                                return <div key={`blank-${index}`} className="h-9" />;
                            }

                            const isStart = startDate === cell.iso;
                            const isEnd = endDate === cell.iso;
                            const isInRange = startDate && endDate && cell.iso >= startDate && cell.iso <= endDate;
                            const isSingleDayRange = isStart && isEnd;
                            let rangeRadius = '10px';
                            if (isInRange && !isSingleDayRange) {
                                if (isStart) rangeRadius = '10px 0 0 10px';
                                else if (isEnd) rangeRadius = '0 10px 10px 0';
                                else rangeRadius = '0';
                            }

                            return (
                                <button
                                    key={cell.iso}
                                    type="button"
                                    onClick={() => handleDaySelect(cell.iso)}
                                    className="h-9 text-[0.8125rem] font-medium transition-colors"
                                    style={{
                                        color: isStart || isEnd ? theme.colors.accentText : theme.colors.textPrimary,
                                        backgroundColor: isStart || isEnd
                                            ? theme.colors.accent
                                            : (isInRange ? `${theme.colors.accent}1A` : 'transparent'),
                                        border: 'none',
                                        borderRadius: rangeRadius,
                                    }}
                                >
                                    {cell.dayNumber}
                                </button>
                            );
                        })}
                    </div>

                    {startDate && endDate ? (
                        <div className="mt-3 flex justify-end border-t pt-3" style={{ borderColor: bdr(dark) }}>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
                                style={{
                                    backgroundColor: theme.colors.accent + '12',
                                    color: theme.colors.textPrimary,
                                    border: '1px solid rgba(0, 0, 0, 0.06)',
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};

const TourVisitSectionHeader = ({ title, subtitle, icon: Icon, theme, action }) => {
    const c = theme.colors;
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
                {Icon ? (
                    <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${c.accent}12`, color: c.accent }}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                ) : null}
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold tracking-tight" style={{ color: c.textPrimary }}>{title}</h2>
                    {subtitle ? (
                        <p className="mt-0.5 text-[0.75rem] leading-snug" style={{ color: c.textSecondary, opacity: 0.82 }}>
                            {subtitle}
                        </p>
                    ) : null}
                </div>
            </div>
            {action || null}
        </div>
    );
};

const FacilityGridCard = ({ facility, onClick, theme, selected = false }) => {
    const isDark = isDarkTheme(theme);
    const c = theme.colors;
    const tile = fieldTileSurface(theme);

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className="group flex h-full min-h-[44px] flex-col rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-ring"
            style={{
                backgroundColor: selected ? `${c.accent}0c` : (isDark ? 'rgba(255,255,255,0.05)' : c.surface),
                border: selected ? `1px solid ${c.accent}44` : subtleBorder(theme),
                boxShadow: selected && !isDark ? '0 10px 28px rgba(53,53,53,0.07)' : (isDark ? 'none' : '0 1px 4px rgba(53,53,53,0.05)'),
            }}
        >
            <p className={`${FIELD_LABEL_CLASSNAME} uppercase tracking-[0.12em]`} style={{ color: c.textSecondary }}>
                {facility.eyebrow}
            </p>
            <h3 className="mt-1.5 text-[0.9375rem] font-semibold leading-snug tracking-tight" style={{ color: c.textPrimary }}>
                {facility.name}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-[0.75rem] font-medium" style={{ color: c.info }}>
                <MapPin className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
                <span>{facility.location}</span>
            </div>
            <p className="mt-2 flex-1 text-[0.6875rem] leading-relaxed line-clamp-2" style={{ color: c.textSecondary, opacity: 0.85 }}>
                {facility.blurb}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
                <span className="inline-flex rounded-full px-2.5 py-1 text-[0.625rem] font-semibold" style={{ ...tile, color: c.textSecondary }}>
                    {facility.details[0]}
                </span>
                <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
                    style={{ backgroundColor: `${c.accent}12`, color: c.accent }}
                    aria-hidden="true"
                >
                    <ArrowRight className="h-4 w-4" />
                </span>
            </div>
        </button>
    );
};

const FacilityOption = ({ facility, selected, onClick, theme, isInList = false, showTopDivider = false }) => {
    const dark = isDarkTheme(theme);
    return (
    <button
        type="button"
        onClick={onClick}
        className={`w-full px-3.5 py-3.5 text-left transition-all motion-card sm:px-4 focus-ring active:scale-[0.98] ${isInList ? '' : 'rounded-[18px]'}`}
        style={{
            backgroundColor: selected ? `${theme.colors.accent}0f` : (isInList ? 'transparent' : panelChrome(theme).backgroundColor),
            border: selected ? `1px solid ${theme.colors.accent}44` : (isInList ? 'none' : panelChrome(theme).border),
            borderTop: isInList && showTopDivider ? `1px solid ${bdr(dark)}` : undefined,
            color: theme.colors.textPrimary,
            boxShadow: selected && !dark ? '0 10px 28px rgba(53,53,53,0.07)' : 'none',
        }}
    >
        <div className="flex items-start gap-3">
            <span
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={iconTileChrome(theme, selected)}
            >
                <Building2 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p style={eyebrow(theme.colors)}>{facility.eyebrow}</p>
                        <h3 className="mt-1 text-[0.9375rem] font-semibold leading-5">{facility.name}</h3>
                    </div>
                    <span
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={iconTileChrome(theme, selected)}
                    >
                        {selected ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{facility.location}</span>
                </div>
                {!isInList ? (
                    <p className="mt-2 text-xs leading-5" style={{ color: theme.colors.textSecondary }}>
                        {facility.blurb}
                    </p>
                ) : null}
                <div className={`${isInList ? 'mt-2' : 'mt-3'} flex flex-wrap gap-1.5`}>
                    {(isInList ? facility.details.slice(0, 1) : facility.details).map((detail) => (
                        <span
                            key={detail}
                            className="rounded-full px-2 py-1 text-[0.625rem] font-semibold"
                            style={chipChrome(theme)}
                        >
                            {detail}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </button>
    );
};

const TourVisitBooleanField = ({ label, value, onChange, theme }) => {
    const c = theme.colors;
    return (
        <TripField label={label} theme={theme}>
            <div className="flex h-[44px] w-full items-center justify-end gap-1.5 px-2">
                {[{ label: 'No', val: false }, { label: 'Yes', val: true }].map((opt) => {
                    const active = value === opt.val;
                    return (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => onChange(opt.val)}
                            aria-pressed={active}
                            className="h-[36px] min-w-[52px] rounded-full px-3.5 text-[0.6875rem] font-semibold transition-all active:scale-[0.97] focus-ring"
                            style={active
                                ? { backgroundColor: c.accent, color: c.accentText || '#FFFFFF' }
                                : { color: c.textSecondary, backgroundColor: subtleBg(theme, 1.5) }}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </TripField>
    );
};

const TripFormInput = ({ label, required, theme, className = '', type = 'text', ...inputProps }) => (
    <TripField label={label} required={required} theme={theme} className={className} tall={type === 'textarea'}>
        <div className={`flex w-full ${type === 'textarea' ? 'px-2 py-2' : 'h-[44px] items-center px-2 [&_input]:!h-[44px] [&_input]:!min-h-0 [&_textarea]:!min-h-[96px]'}`}>
            <FormInput
                theme={theme}
                type={type}
                surfaceBackground="transparent"
                surfaceBorder="none"
                {...inputProps}
            />
        </div>
    </TripField>
);

const TripCustomerField = ({
    theme,
    selectedCustomerId,
    selectedCustomerLabel,
    customerFieldRef,
    customerDirectoryOptions,
    onCustomerSelection,
    onBlurWithQuery,
}) => (
    <TripField label="Customer" required theme={theme}>
        <div className="relative flex h-[44px] w-full items-center px-2">
            <SearchableSelect
                value={selectedCustomerId}
                onChange={onCustomerSelection}
                options={customerDirectoryOptions}
                placeholder="Customer name"
                displayValue={normalizeCustomerLabel(selectedCustomerLabel)}
                theme={theme}
                size="sm"
                onBlurWithQuery={onBlurWithQuery}
                buttonRef={customerFieldRef}
                inlineSearch
                minQueryLength={2}
                dropdownIndicatorMode="hidden"
                buttonClassName="!h-[44px] !min-h-[44px] !rounded-2xl !px-1.5 !pr-10 !text-[0.8125rem] !font-medium focus-ring"
                buttonStyle={tripSelectControlStyle(theme, Boolean(selectedCustomerId))}
                inputClassName="!h-[44px] !min-h-[44px] !rounded-2xl !px-1.5 !text-[0.8125rem] !font-medium"
                inputStyle={tripSelectControlStyle(theme, true)}
            />
        </div>
    </TripField>
);

const TripDetailsFields = ({
    theme,
    selectedFacility,
    showFacilityOptions,
    selectedFacilityId,
    selectedCustomerId,
    selectedCustomerLabel,
    customerFieldRef,
    customerDirectoryOptions,
    preferredDateStart,
    preferredDateEnd,
    onCustomerSelection,
    onCustomerBlurWithQuery,
    onChangeStart,
    onChangeEnd,
    onFacilitySelect,
    onShowFacilityOptions,
}) => {
    const c = theme.colors;

    const handleCustomerBlur = (typed) => {
        onCustomerBlurWithQuery(typed);
    };

    if (selectedFacility && !showFacilityOptions) {
        const locationSummary = `${selectedFacility.name} · ${selectedFacility.location}`;
        return (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 md:items-start md:gap-4">
                <TripCustomerField
                    theme={theme}
                    selectedCustomerId={selectedCustomerId}
                    selectedCustomerLabel={selectedCustomerLabel}
                    customerFieldRef={customerFieldRef}
                    customerDirectoryOptions={customerDirectoryOptions}
                    onCustomerSelection={onCustomerSelection}
                    onBlurWithQuery={handleCustomerBlur}
                />
                <TripField label="Dates" theme={theme}>
                    <DateRangeDropdown
                        theme={theme}
                        startDate={preferredDateStart}
                        endDate={preferredDateEnd}
                        onChangeStart={onChangeStart}
                        onChangeEnd={onChangeEnd}
                        showFieldLabel={false}
                        compact
                    />
                </TripField>
                <TripField label="Location" theme={theme} flexible>
                    <button
                        type="button"
                        onClick={onShowFacilityOptions}
                        title={locationSummary}
                        className="flex min-h-[44px] w-full items-center justify-between gap-2 px-2 py-1.5 text-left focus-ring md:h-[44px] md:py-0"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: `${c.accent}12`, color: c.accent }}
                            >
                                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="md:hidden">
                                    <span className={`block truncate ${TRIP_CONTROL_TEXT} font-semibold`} style={{ color: c.textPrimary }}>
                                        {selectedFacility.name}
                                    </span>
                                    <span className="block truncate text-[0.6875rem] font-medium" style={{ color: c.textSecondary }}>
                                        {selectedFacility.location}
                                    </span>
                                </span>
                                <span className={`hidden truncate md:block ${TRIP_CONTROL_TEXT}`} style={{ color: c.textPrimary }}>
                                    {locationSummary}
                                </span>
                            </span>
                        </div>
                        <span className="shrink-0 text-[0.6875rem] font-semibold" style={{ color: c.accent }}>
                            Change
                        </span>
                    </button>
                </TripField>
            </div>
        );
    }

    return (
        <>
            <div className="mt-4">
                <span className={FIELD_LABEL_CLASSNAME} style={{ color: c.textSecondary }}>
                    Location
                </span>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {TOUR_VISIT_FACILITIES.map((facility) => (
                        <FacilityGridCard
                            key={facility.id}
                            facility={facility}
                            selected={selectedFacilityId === facility.id}
                            onClick={() => onFacilitySelect(facility.id)}
                            theme={theme}
                        />
                    ))}
                </div>
            </div>

            {selectedFacilityId ? (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <TripCustomerField
                        theme={theme}
                        selectedCustomerId={selectedCustomerId}
                        selectedCustomerLabel={selectedCustomerLabel}
                        customerFieldRef={customerFieldRef}
                        customerDirectoryOptions={customerDirectoryOptions}
                        onCustomerSelection={onCustomerSelection}
                        onBlurWithQuery={handleCustomerBlur}
                    />
                    <TripField label="Dates" theme={theme}>
                        <DateRangeDropdown
                            theme={theme}
                            startDate={preferredDateStart}
                            endDate={preferredDateEnd}
                            onChangeStart={onChangeStart}
                            onChangeEnd={onChangeEnd}
                            showFieldLabel={false}
                            compact
                        />
                    </TripField>
                </div>
            ) : null}
        </>
    );
};

const UpcomingVisitDirectory = ({ visits, expandedVisitId, onToggleVisit, theme }) => {
    const isDark = isDarkTheme(theme);
    const c = theme.colors;
    const tile = fieldTileSurface(theme);
    const dividerColor = c.border || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.08)');

    if (!visits.length) {
        return (
            <section className="rounded-[24px] p-5 text-center" style={sectionCardSurface(theme)}>
                <CalendarDays className="mx-auto h-8 w-8 opacity-30" style={{ color: c.textSecondary }} aria-hidden="true" />
                <p className="mt-3 text-sm font-medium" style={{ color: c.textPrimary }}>No upcoming trips</p>
                <p className="mt-1 text-[0.75rem]" style={{ color: c.textSecondary }}>Scheduled visits will appear here as itinerary cards.</p>
            </section>
        );
    }

    return (
        <section className="space-y-3">
            <TourVisitSectionHeader
                title="Upcoming Trips"
                subtitle={`${visits.length} active visit${visits.length === 1 ? '' : 's'}`}
                icon={CalendarDays}
                theme={theme}
            />

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
                {visits.map((visit) => {
                    const isExpanded = expandedVisitId === visit.id;
                    const isPendingApproval = visit.approvalStatus === 'pending';

                    return (
                        <article
                            key={visit.id}
                            className="overflow-hidden rounded-2xl transition-shadow duration-200"
                            style={{
                                ...sectionCardSurface(theme),
                                borderLeft: `3px solid ${isPendingApproval ? c.warning : c.accent}`,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => onToggleVisit(visit.id)}
                                className="flex w-full items-start gap-3 p-4 text-left transition-colors active:scale-[0.995] focus-ring"
                                aria-expanded={isExpanded}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-[0.9375rem] font-semibold leading-snug tracking-tight" style={{ color: c.textPrimary }}>
                                            {visit.companyName}
                                        </h3>
                                        <ChevronDown
                                            className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200"
                                            style={{
                                                color: c.textSecondary,
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            }}
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                        <span
                                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold tabular-nums"
                                            style={{ ...tile, color: c.textPrimary }}
                                        >
                                            <Clock3 className="h-3 w-3 opacity-70" aria-hidden="true" />
                                            {visit.dateLabel}
                                        </span>
                                        <span
                                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold"
                                            style={{ ...tile, color: c.textSecondary }}
                                        >
                                            <MapPin className="h-3 w-3 opacity-70" aria-hidden="true" />
                                            <span className="truncate max-w-[10rem]">{visit.facilityName}</span>
                                        </span>
                                        {isPendingApproval ? (
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.06em]"
                                                style={{
                                                    color: c.warning,
                                                    backgroundColor: c.warningLight,
                                                    border: `1px solid ${c.warning}33`,
                                                }}
                                            >
                                                Pending
                                            </span>
                                        ) : null}
                                    </div>

                                    {!isExpanded ? (
                                        <p className="mt-2 text-[0.6875rem] leading-snug" style={{ color: c.textSecondary, opacity: 0.8 }}>
                                            {visit.overnightLabel}
                                            {visit.attendees ? ` · ${visit.attendees}` : ''}
                                        </p>
                                    ) : null}
                                </div>
                            </button>

                            {isExpanded ? (
                                <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: dividerColor }}>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-xl px-3 py-2.5" style={tile}>
                                            <p className={`${FIELD_LABEL_CLASSNAME} uppercase tracking-[0.1em] opacity-70`} style={{ color: c.textSecondary }}>Length</p>
                                            <p className="mt-1 text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>{visit.overnightLabel}</p>
                                        </div>
                                        <div className="rounded-xl px-3 py-2.5" style={tile}>
                                            <p className={`${FIELD_LABEL_CLASSNAME} uppercase tracking-[0.1em] opacity-70`} style={{ color: c.textSecondary }}>Attendees</p>
                                            <p className="mt-1 text-[0.8125rem] font-semibold leading-snug" style={{ color: c.textPrimary }}>{visit.attendees}</p>
                                        </div>
                                    </div>

                                    {visit.agendaLabel ? (
                                        <p
                                            className="mt-2.5 rounded-xl px-3 py-2 text-[0.6875rem] font-medium leading-snug"
                                            style={{
                                                color: isPendingApproval ? c.warning : c.textSecondary,
                                                backgroundColor: isPendingApproval ? c.warningLight : subtleBg(theme, 1.2),
                                            }}
                                        >
                                            {visit.agendaLabel}
                                        </p>
                                    ) : null}

                                    <div className="mt-3 space-y-3">
                                        {visit.agenda.map((day) => (
                                            <div key={`${visit.id}-${day.dayLabel}`} className="rounded-xl px-3.5 py-3" style={tile}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`${FIELD_LABEL_CLASSNAME} uppercase tracking-[0.1em]`} style={{ color: c.textSecondary }}>
                                                        {day.dayLabel}
                                                    </p>
                                                    <span className="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold" style={{ backgroundColor: `${c.accent}12`, color: c.accent }}>
                                                        {day.sessions.length} stops
                                                    </span>
                                                </div>
                                                <ul className="mt-2.5 space-y-2">
                                                    {day.sessions.map((session) => {
                                                        const { time, detail } = parseAgendaSession(session);
                                                        return (
                                                            <li key={`${visit.id}-${day.dayLabel}-${session}`} className="flex gap-2.5 text-[0.75rem]">
                                                                <span className="w-14 shrink-0 pt-0.5 text-[0.625rem] font-semibold uppercase tracking-wide tabular-nums" style={{ color: c.textSecondary, opacity: 0.75 }}>
                                                                    {time || '—'}
                                                                </span>
                                                                <span className="flex-1 leading-snug" style={{ color: c.textPrimary }}>{detail}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

const ExperienceTrackCard = ({ track, selectedOptions, expanded, onToggleExpanded, onToggleOption, onOpenInfo, theme }) => {
    const c = theme.colors;
    const hasSelection = selectedOptions.length > 0;

    return (
        <div
            className="rounded-2xl p-3.5 transition-all duration-200"
            style={{
                backgroundColor: hasSelection ? `${c.accent}14` : subtleBg(theme, 1),
                border: 'none',
                borderLeft: `3px solid ${hasSelection ? c.accent : 'transparent'}`,
                opacity: hasSelection ? 1 : 0.88,
            }}
        >
            <div className="flex items-start gap-3">
                <span
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                        backgroundColor: hasSelection ? `${c.accent}14` : subtleBg(theme, 1.5),
                        color: hasSelection ? c.accent : c.textSecondary,
                    }}
                >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <button
                    type="button"
                    onClick={() => onToggleExpanded(track.id)}
                    className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left focus-ring rounded-xl"
                    aria-expanded={expanded}
                    aria-controls={`experience-track-${track.id}`}
                >
                    <div className="min-w-0">
                        <h4 className="text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>{track.title}</h4>
                        <p className="mt-1 text-[0.75rem] font-normal leading-5" style={{ color: c.textSecondary }}>
                            {track.description}
                        </p>
                        {!expanded && hasSelection ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {selectedOptions.map((option) => (
                                    <span
                                        key={option}
                                        className="rounded-full px-2 py-1 text-[0.625rem] font-semibold"
                                        style={{
                                            backgroundColor: `${c.accent}14`,
                                            color: c.accent,
                                        }}
                                    >
                                        {option}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <span
                                    className="rounded-full px-2 py-1 text-[0.625rem] font-semibold"
                                    style={{
                                        backgroundColor: hasSelection ? `${c.accent}12` : subtleBg(theme),
                                        color: hasSelection ? c.accent : c.textSecondary,
                                    }}
                                >
                                    {hasSelection ? `${selectedOptions.length} selected` : 'Choose options'}
                                </span>
                            </div>
                        )}
                    </div>
                    <ChevronDown
                        className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200"
                        style={{
                            color: c.textSecondary,
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                        aria-hidden="true"
                    />
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpenInfo(track.id);
                    }}
                    aria-label={`More information about ${track.title}`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus-ring"
                    style={{
                        backgroundColor: subtleBg(theme, 1.5),
                        color: c.textSecondary,
                    }}
                >
                    <Info className="h-3.5 w-3.5" />
                </button>
            </div>
            {expanded ? (
                <div id={`experience-track-${track.id}`} className="mt-3 flex flex-col gap-2">
                    {track.options.map((option) => {
                        const optionLabel = getExperienceOptionLabel(option);
                        const optionDesc = getExperienceOptionDescription(option);
                        const isSelected = selectedOptions.includes(optionLabel);
                        return (
                            <button
                                key={optionLabel}
                                type="button"
                                onClick={() => onToggleOption(track.id, optionLabel)}
                                title={optionDesc || undefined}
                                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all focus-ring"
                                style={{
                                    color: c.textPrimary,
                                    backgroundColor: isSelected ? `${c.accent}14` : 'transparent',
                                    border: isSelected ? `1px solid ${c.accent}44` : 'none',
                                }}
                            >
                                <span
                                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                    style={{
                                        backgroundColor: isSelected ? c.accent : subtleBg(theme, 1.5),
                                        color: isSelected ? (c.accentText || '#FFFFFF') : c.textSecondary,
                                    }}
                                >
                                    {isSelected ? <Check className="h-3 w-3" /> : null}
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[0.8125rem] font-medium leading-5">{optionLabel}</span>
                                    {optionDesc ? (
                                        <span className="mt-0.5 block text-[0.75rem] font-normal leading-4" style={{ color: c.textSecondary }}>
                                            {optionDesc}
                                        </span>
                                    ) : null}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
};

const GuestPanel = ({
    guest,
    guestIndex,
    attendeeOrdinal,
    expanded,
    theme,
    isFirst = false,
    submitAttempted,
    autoFocusFirstName = false,
    onToggleExpanded,
    onChange,
    onRemove,
}) => {
    const c = theme.colors;
    const repAttendee = isRepAttendee(guest);
    const showNameError = submitAttempted && (!guest.legalFirstName.trim() || !guest.legalLastName.trim());
    const handleToggle = () => onToggleExpanded();
    const expandTransition = '260ms cubic-bezier(0.23, 1, 0.32, 1)';
    const guestErrors = [];
    if (showNameError) guestErrors.push('Legal first and last name are required.');

    const handleHeaderKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        }
    };

    return (
        <div className={`py-3 ${isFirst ? 'pt-1' : ''}`}>
            <div
                role="button"
                tabIndex={0}
                onClick={handleToggle}
                onKeyDown={handleHeaderKeyDown}
                className="flex w-full cursor-pointer items-start justify-between gap-4 text-left focus-ring rounded-xl"
            >
                <div className="min-w-0 flex flex-1 items-center gap-3">
                    <span
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{
                            backgroundColor: expanded ? `${c.accent}14` : subtleBg(theme, 1.5),
                            color: expanded ? c.accent : c.textSecondary,
                        }}
                    >
                        <UserRound className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span
                            className="text-[0.6875rem] font-medium leading-none"
                            style={{ color: c.textSecondary }}
                        >
                            {attendeeOrdinal}.
                        </span>
                        <h3 className="text-[0.8125rem] font-semibold leading-5" style={{ color: c.textPrimary }}>
                            {getGuestDisplayName(guest, guestIndex)}
                        </h3>
                        {repAttendee ? (
                            <span
                                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em]"
                                style={{
                                    backgroundColor: `${c.accent}0a`,
                                    color: c.textSecondary,
                                }}
                            >
                                Rep
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        aria-label={guest.isSelf ? 'Remove yourself' : 'Remove guest'}
                        onClick={(event) => {
                            event.stopPropagation();
                            onRemove();
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-opacity opacity-40 hover:opacity-100 focus-ring"
                        style={{ color: c.textSecondary }}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200"
                        style={{
                            color: c.textSecondary,
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                        aria-hidden="true"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                    </span>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: expanded ? '1fr' : '0fr',
                    opacity: expanded ? 1 : 0,
                    transition: `grid-template-rows ${expandTransition}, opacity 180ms ease`,
                }}
                aria-hidden={!expanded}
            >
                <div className="overflow-hidden">
                    <div
                        className="mt-3"
                        style={{
                            transform: expanded ? 'translateY(0)' : 'translateY(-8px)',
                            transition: `transform ${expandTransition}`,
                            pointerEvents: expanded ? 'auto' : 'none',
                        }}
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <TripFormInput
                                label="First Name"
                                value={guest.legalFirstName}
                                onChange={(event) => onChange('legalFirstName', event.target.value)}
                                placeholder="As on ID"
                                autoFocus={autoFocusFirstName}
                                theme={theme}
                                required
                            />
                            <TripFormInput
                                label="Last Name"
                                value={guest.legalLastName}
                                onChange={(event) => onChange('legalLastName', event.target.value)}
                                placeholder="As on ID"
                                theme={theme}
                                required
                            />

                            {!repAttendee ? (
                                <TripFormInput
                                    label="Date of Birth"
                                    type="date"
                                    value={guest.dateOfBirth || ''}
                                    onChange={(event) => onChange('dateOfBirth', event.target.value)}
                                    theme={theme}
                                />
                            ) : null}

                            {!repAttendee ? (
                                <TourVisitSelectField
                                    label="T-Shirt Size"
                                    value={guest.shirtSize}
                                    onChange={(nextValue) => onChange('shirtSize', nextValue)}
                                    options={TOUR_VISIT_TSHIRT_SIZES}
                                    placeholder="Select size"
                                    searchable={false}
                                    theme={theme}
                                />
                            ) : null}

                            <TourVisitSelectField
                                label="Preferred Airline"
                                value={guest.preferredAirline}
                                onChange={(nextValue) => onChange('preferredAirline', nextValue)}
                                options={TOUR_VISIT_AIRLINES}
                                placeholder="Select airline"
                                theme={theme}
                            />

                            <TripFormInput
                                label="Known Traveler Number"
                                value={guest.knownTravelerNumber}
                                onChange={(event) => onChange('knownTravelerNumber', event.target.value)}
                                placeholder="Optional"
                                theme={theme}
                            />
                        </div>

                        {guestErrors.length ? (
                            <div
                                className="mt-2.5 rounded-2xl px-4 py-3 text-sm"
                                style={{
                                    backgroundColor: c.errorLight,
                                    color: c.error,
                                    border: `1px solid ${c.destructiveBorder}`,
                                }}
                            >
                                {guestErrors.join(' ')}
                            </div>
                        ) : null}

                        {!repAttendee ? (
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <TourVisitBooleanField
                                        label="Dietary Restrictions"
                                        value={guest.hasDietaryRestrictions}
                                        onChange={(nextValue) => onChange('hasDietaryRestrictions', nextValue)}
                                        theme={theme}
                                    />

                                    {guest.hasDietaryRestrictions ? (
                                        <TripField label="Restriction Details" theme={theme} flexible>
                                            <div className="flex flex-wrap gap-1.5 px-2 py-2">
                                                {TOUR_VISIT_DIETARY_RESTRICTIONS.map((restriction) => {
                                                    const isSelected = (guest.dietaryRestrictions || []).includes(restriction);
                                                    return (
                                                        <button
                                                            key={restriction}
                                                            type="button"
                                                            onClick={() => {
                                                                const current = guest.dietaryRestrictions || [];
                                                                const next = isSelected
                                                                    ? current.filter((r) => r !== restriction)
                                                                    : [...current, restriction];
                                                                onChange('dietaryRestrictions', next);
                                                                if (restriction === 'Other' && isSelected) {
                                                                    onChange('dietaryRestrictionsOther', '');
                                                                }
                                                            }}
                                                            className="min-h-[36px] rounded-full px-2.5 py-1 text-[0.6875rem] font-medium transition-all focus-ring"
                                                            style={{
                                                                color: isSelected ? c.textPrimary : c.textSecondary,
                                                                backgroundColor: isSelected ? `${c.accent}14` : subtleBg(theme, 1.5),
                                                            }}
                                                        >
                                                            {restriction}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </TripField>
                                    ) : null}
                                </div>

                                <TripFormInput
                                    label="Fun Fact"
                                    value={guest.funFact || ''}
                                    onChange={(event) => onChange('funFact', event.target.value)}
                                    placeholder="Short note"
                                    theme={theme}
                                    maxLength={60}
                                />

                                {guest.hasDietaryRestrictions && (guest.dietaryRestrictions || []).includes('Other') ? (
                                    <TripFormInput
                                        className="sm:col-span-2"
                                        label="Other Dietary Notes"
                                        type="textarea"
                                        value={guest.dietaryRestrictionsOther || ''}
                                        onChange={(event) => onChange('dietaryRestrictionsOther', event.target.value)}
                                        placeholder="Briefly explain dietary restrictions"
                                        theme={theme}
                                        maxLength={140}
                                    />
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TourVisitSuccessOverlay = ({ theme, facilityName, customerName }) => (
    <div
        className="absolute inset-0 z-20 flex items-center justify-center px-6 animate-fade-in"
        style={{
            backgroundColor: 'rgba(240, 237, 232, 0.62)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
        }}
    >
        <div
            className="w-full max-w-sm rounded-2xl px-6 py-7 text-center"
            style={{
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: `0 24px 70px ${theme.colors.shadow || 'rgba(53, 53, 53, 0.12)'}`,
            }}
        >
            <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                    backgroundColor: theme.colors.accent + '12',
                    color: theme.colors.accent,
                }}
            >
                <Check className="h-5 w-5" />
            </div>
            <p className="mt-4 text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                Added to Upcoming Trips
            </p>
            <p className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                {customerName
                    ? `${customerName} / ${facilityName || 'Awaiting JSI approval'}`
                    : (facilityName ? `${facilityName} is awaiting JSI approval.` : 'Your customer experience trip is awaiting JSI approval.')}
            </p>
        </div>
    </div>
);

const ExperienceTrackInfoOverlay = ({ theme, track, onClose }) => {
    const dark = isDarkTheme(theme);
    if (!track) return null;

    return (
        <div
            className="fixed inset-0 z-[35] flex items-center justify-center px-4"
            onClick={onClose}
            style={{
                backgroundColor: 'rgba(240, 237, 232, 0.62)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
            }}
        >
            <div
                className="w-full max-w-[560px] rounded-[24px] p-5 md:p-6"
                onClick={(event) => event.stopPropagation()}
                style={{
                    backgroundColor: theme.colors.surface,
                    border: 'none',
                    boxShadow: `0 24px 70px ${theme.colors.shadow || 'rgba(53, 53, 53, 0.12)'}`,
                }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p style={eyebrow(theme.colors)}>Experience Detail</p>
                        <h3 className="mt-1 text-[1.0625rem] font-bold" style={{ color: theme.colors.textPrimary }}>{track.title}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: fieldSurf(dark), color: theme.colors.textSecondary }}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mt-2 text-sm leading-6" style={{ color: theme.colors.textSecondary }}>
                    {track.description}
                </p>

                <div className="mt-4 space-y-2.5">
                    {track.options.map((option) => {
                        const label = getExperienceOptionLabel(option);
                        const detail = getExperienceOptionDescription(option)
                            || `${label} gives your team practical context ahead of hosted conversations.`;

                        return (
                            <div
                                key={`${track.id}-${label}`}
                                className="rounded-[16px] px-3.5 py-3"
                                style={{
                                    backgroundColor: fieldSurf(dark),
                                    border: `1px solid ${bdr(dark)}`,
                                }}
                            >
                                <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{label}</p>
                                <p className="mt-1 text-xs leading-5" style={{ color: theme.colors.textSecondary }}>
                                    {detail} This option is designed to give attendees concrete takeaways they can apply to future projects.
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const AddAttendeeActions = ({
    theme,
    availableTeamMembers,
    showRepPicker,
    onAddGuest,
    onOpenRepPicker,
    onSelectRep,
}) => {
    const repPickerRef = useRef(null);

    useEffect(() => {
        if (!showRepPicker) return;
        requestAnimationFrame(() => {
            repPickerRef.current?.click();
        });
    }, [showRepPicker]);

    if (showRepPicker) {
        return (
            <div className="space-y-1">
                <p className={FIELD_LABEL_CLASSNAME} style={{ color: theme.colors.textSecondary }}>
                    Select rep
                </p>
                <div className="flex h-[44px] w-full items-center rounded-2xl px-2" style={fieldTileSurface(theme)}>
                    <SearchableSelect
                        value=""
                        onChange={onSelectRep}
                        options={availableTeamMembers.map((member) => ({
                            value: String(member.id),
                            label: `${member.firstName} ${member.lastName}`,
                        }))}
                        placeholder="Select rep"
                        theme={theme}
                        size="sm"
                        searchable={false}
                        buttonRef={repPickerRef}
                        buttonClassName="!h-[44px] !min-h-[44px] !rounded-2xl !px-1.5 !pr-10 !text-[0.8125rem] !font-medium focus-ring"
                        buttonStyle={tripSelectControlStyle(theme, false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <JSIActionButtonGroup compact wrap className="w-full [&_button]:!min-h-[44px]">
            <JSIActionButton
                theme={theme}
                size="small"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={onAddGuest}
            >
                Add guest
            </JSIActionButton>

            {availableTeamMembers.length ? (
                <JSIActionButton
                    theme={theme}
                    size="small"
                    icon={<Plus className="h-3.5 w-3.5" />}
                    onClick={onOpenRepPicker}
                >
                    Add rep
                </JSIActionButton>
            ) : null}
        </JSIActionButtonGroup>
    );
};

export const TourVisitScreen = ({ theme, userSettings, setBackHandler, members = [], currentUserId, currentScreen, onNavigate }) => {
    const dark = isDarkTheme(theme);
    const border = bdr(dark);
    const [entryMode, setEntryMode] = useState('home');
    const [guests, setGuests] = useState(() => [createRepGuest(userSettings)]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedCustomerLabel, setSelectedCustomerLabel] = useState('');
    const [customerIsNewRecord, setCustomerIsNewRecord] = useState(false);
    const [selectedFacilityId, setSelectedFacilityId] = useState('');
    const [showFacilityOptions, setShowFacilityOptions] = useState(true);
    const [upcomingVisits, setUpcomingVisits] = useState(() => TOUR_VISIT_UPCOMING_VISITS);
    const [expandedUpcomingVisitId, setExpandedUpcomingVisitId] = useState(null);
    const [expandedExperienceTrackId, setExpandedExperienceTrackId] = useState(null);
    const [experienceSelections, setExperienceSelections] = useState(() => buildDefaultExperienceSelections());
    const [showExperienceError, setShowExperienceError] = useState(false);
    const [expandedGuestId, setExpandedGuestId] = useState(null);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [showRepPicker, setShowRepPicker] = useState(false);
    const [pendingGuestFocusId, setPendingGuestFocusId] = useState(null);
    const [preferredDateStart, setPreferredDateStart] = useState(() => getDefaultDateRange().start);
    const [preferredDateEnd, setPreferredDateEnd] = useState(() => getDefaultDateRange().end);
    const [activeInfoTrackId, setActiveInfoTrackId] = useState(null);
    const topSectionRef = useRef(null);
    const customerFieldRef = useRef(null);
    const hasInitializedExpandedGuestRef = useRef(false);
    const successOverlayTimeoutRef = useRef(null);
    const navigationTimeoutRef = useRef(null);

    const routeParts = useMemo(
        () => String(currentScreen || '').split('/').filter(Boolean),
        [currentScreen]
    );
    const isNewTripRoute = routeParts[0] === 'new-trip';
    const routeFacilityId = useMemo(() => {
        const candidate = routeParts[1] || '';
        return TOUR_VISIT_FACILITIES.some((facility) => facility.id === candidate) ? candidate : '';
    }, [routeParts]);

    const selectedFacility = useMemo(
        () => TOUR_VISIT_FACILITIES.find((facility) => facility.id === selectedFacilityId) || null,
        [selectedFacilityId]
    );

    const customerDirectoryOptions = useMemo(
        () =>
            DEALER_DIRECTORY_DATA.map((dealer) => ({
                value: `dealer-${dealer.id}`,
                label: dealer.name,
                description: inferCustomerType(dealer.name),
                searchText: `${dealer.name} ${inferCustomerType(dealer.name).toLowerCase()} dealer design firm end user`,
            })).sort((a, b) => a.label.localeCompare(b.label)),
        []
    );

    const selectedExperienceCount = useMemo(
        () => Object.values(experienceSelections).reduce((total, options) => total + options.length, 0),
        [experienceSelections]
    );

    const hasExperienceSelectionInEveryTrack = useMemo(
        () => TOUR_VISIT_EXPERIENCE_TRACKS.every((track) => (experienceSelections[track.id] || []).length > 0),
        [experienceSelections]
    );

    const requestedDateLabel = useMemo(() => {
        if (!preferredDateStart || !preferredDateEnd) return '';
        return formatDateRangeLabel(preferredDateStart, preferredDateEnd);
    }, [preferredDateEnd, preferredDateStart]);

    const activeInfoTrack = useMemo(
        () => TOUR_VISIT_EXPERIENCE_TRACKS.find((track) => track.id === activeInfoTrackId) || null,
        [activeInfoTrackId]
    );

    const activeShareFacilityId = selectedFacilityId || 'jasper';
    const activeShareLink = useMemo(() => {
        const origin = globalThis.location?.origin || 'https://portal.jsi.com';
        return `${origin}/new-trip/${encodeURIComponent(activeShareFacilityId)}`;
    }, [activeShareFacilityId]);

    const navigateToTripRoute = useCallback((facilityId = '') => {
        if (typeof onNavigate !== 'function') return false;
        onNavigate(facilityId ? `new-trip/${facilityId}` : 'new-trip');
        return true;
    }, [onNavigate]);

    const resetTourVisitFlow = useCallback(() => {
        const defaultDateRange = getDefaultDateRange();

        if (isNewTripRoute && typeof onNavigate === 'function') {
            onNavigate('resources/tour-visit');
        }

        setEntryMode('home');
        setGuests([createRepGuest(userSettings)]);
        setSelectedCustomerId('');
        setSelectedCustomerLabel('');
        setCustomerIsNewRecord(false);
        setSelectedFacilityId('');
        setShowFacilityOptions(true);
        setExpandedUpcomingVisitId(null);
        setExpandedExperienceTrackId(null);
        setExperienceSelections(buildDefaultExperienceSelections());
        setShowExperienceError(false);
        setExpandedGuestId(null);
        setSubmitAttempted(false);
        setFormMessage('');
        setShowSuccessOverlay(false);
        setShowRepPicker(false);
        setPendingGuestFocusId(null);
        setPreferredDateStart(defaultDateRange.start);
        setPreferredDateEnd(defaultDateRange.end);
        setActiveInfoTrackId(null);
        hasInitializedExpandedGuestRef.current = false;

        if (successOverlayTimeoutRef.current) {
            clearTimeout(successOverlayTimeoutRef.current);
            successOverlayTimeoutRef.current = null;
        }

        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
        }
    }, [isNewTripRoute, onNavigate, userSettings]);

    useEffect(() => {
        if (!hasInitializedExpandedGuestRef.current && !expandedGuestId && guests.length) {
            hasInitializedExpandedGuestRef.current = true;
            setExpandedGuestId(guests[0].id);
            return;
        }

        if (expandedGuestId && !guests.some((guest) => guest.id === expandedGuestId)) {
            setExpandedGuestId(guests[0]?.id ?? null);
        }
    }, [expandedGuestId, guests]);

    useEffect(() => {
        const search = globalThis.location?.search || '';
        const params = new URLSearchParams(search);
        const linkedFacilityId = params.get('facility');
        const queryFacilityId = TOUR_VISIT_FACILITIES.some((facility) => facility.id === linkedFacilityId) ? linkedFacilityId : '';
        const deepLinkedFacilityId = routeFacilityId || queryFacilityId;

        if (isNewTripRoute || deepLinkedFacilityId) {
            setEntryMode('new');
            setSelectedFacilityId(deepLinkedFacilityId);
            setShowFacilityOptions(!deepLinkedFacilityId);
            setFormMessage('');
        }
    }, [isNewTripRoute, routeFacilityId]);

    useEffect(() => {
        if (entryMode !== 'new' || !selectedFacilityId) return;

        requestAnimationFrame(() => {
            topSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            customerFieldRef.current?.focus();
        });
    }, [entryMode, selectedFacilityId]);

    useEffect(() => {
        if (typeof setBackHandler !== 'function') return undefined;

        if (entryMode !== 'home') {
            return setBackHandler(() => {
                resetTourVisitFlow();
                return true;
            });
        }

        setBackHandler(null);
        return undefined;
    }, [entryMode, setBackHandler, resetTourVisitFlow]);

    useEffect(() => () => {
        if (successOverlayTimeoutRef.current) {
            clearTimeout(successOverlayTimeoutRef.current);
        }
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
        }
    }, []);

    const completedGuestCount = guests.filter(isGuestComplete).length;
    const summaryCustomerLabel = normalizeCustomerLabel(selectedCustomerLabel) || 'Customer needed';
    const summaryLocationLabel = selectedFacility?.name || 'Location needed';
    const summaryDateLabel = requestedDateLabel || 'Dates needed';
    const summaryRows = [
        { label: 'Customer', value: summaryCustomerLabel, isPending: !normalizeCustomerLabel(selectedCustomerLabel) },
        { label: 'Location', value: summaryLocationLabel, isPending: !selectedFacility?.name },
        { label: 'Dates', value: summaryDateLabel, isPending: !requestedDateLabel },
    ];
    const summaryStats = [
        { label: 'Attendees', value: `${completedGuestCount}/${guests.length || 0}` },
        { label: 'Experiences', value: String(selectedExperienceCount) },
    ];
    const summaryStatTiles = [
        ...summaryRows,
        ...summaryStats,
    ];
    const experienceSummaryLine = useMemo(() => {
        const selections = TOUR_VISIT_EXPERIENCE_TRACKS.flatMap((track) => experienceSelections[track.id] || []);
        return selections.length ? selections.join(' · ') : 'Select at least one option in each experience track';
    }, [experienceSelections]);
    const showTourVisitSubmitCta = entryMode === 'new' && Boolean(selectedFacility);

    useEffect(() => {
        if (!pendingGuestFocusId) return;
        const timeoutId = setTimeout(() => setPendingGuestFocusId(null), 0);
        return () => clearTimeout(timeoutId);
    }, [pendingGuestFocusId]);

    const updateGuest = (guestId, field, value) => {
        setGuests((currentGuests) =>
            currentGuests.map((guest) =>
                guest.id === guestId
                    ? {
                        ...guest,
                        ...(field === 'hasDietaryRestrictions' && !value
                            ? { dietaryRestrictions: [], dietaryRestrictionsOther: '' }
                            : {}),
                        [field]: value,
                    }
                    : guest
            )
        );
    };



    const handleFacilitySelect = (facilityId) => {
        hapticLight();
        setEntryMode('new');
        setSelectedFacilityId(facilityId);
        setShowFacilityOptions(false);
        setFormMessage('');
        navigateToTripRoute(facilityId);
    };

    const openNewTourFlow = () => {
        hapticLight();
        setEntryMode('new');
        setFormMessage('');
        navigateToTripRoute(selectedFacilityId);
    };

    const handleCustomerSelection = (customerId) => {
        if (!customerId) {
            setSelectedCustomerId('');
            setSelectedCustomerLabel('');
            setCustomerIsNewRecord(false);
            return;
        }

        const selectedOption = customerDirectoryOptions.find((option) => option.value === customerId);
        setSelectedCustomerId(customerId);
        setSelectedCustomerLabel(selectedOption?.label || customerId);
        setCustomerIsNewRecord(customerId.startsWith('new-customer-'));
    };

    const toggleExperienceOption = (trackId, option) => {
        setExperienceSelections((currentSelections) => {
            const currentTrackSelections = currentSelections[trackId] || [];
            const nextTrackSelections = currentTrackSelections.includes(option)
                ? currentTrackSelections.filter((item) => item !== option)
                : [...currentTrackSelections, option];

            return {
                ...currentSelections,
                [trackId]: nextTrackSelections,
            };
        });
        setShowExperienceError(false);
    };

    const toggleUpcomingVisit = (visitId) => {
        setExpandedUpcomingVisitId((currentId) => (currentId === visitId ? null : visitId));
    };

    const toggleExperienceTrack = (trackId) => {
        setExpandedExperienceTrackId((currentId) => (currentId === trackId ? null : trackId));
    };

    const handleNativeShare = async () => {
        if (!globalThis.navigator?.share) {
            // Fallback: copy the link
            try {
                await globalThis.navigator.clipboard.writeText(activeShareLink);
                hapticLight();
            } catch { /* ignore */ }
            return;
        }

        try {
            await globalThis.navigator.share({
                title: 'New Trip Form',
                text: 'Please complete this new trip form.',
                url: activeShareLink,
            });
        } catch { /* canceled */ }
    };

    const handleAddGuest = () => {
        hapticLight();
        const nextGuest = createTourGuest();
        setGuests((currentGuests) => [...currentGuests, nextGuest]);
        setPendingGuestFocusId(nextGuest.id);
        setExpandedGuestId(nextGuest.id);
    };

    const availableTeamMembers = useMemo(() => {
        const active = members.filter((member) => member?.status !== 'inactive' && member?.status !== 'disabled');
        const repOnly = active.filter((member) => String(member?.role || '').startsWith('rep-'));
        const pool = repOnly.length ? repOnly : active;
        const linkedIds = new Set(guests.map((guest) => guest.linkedMemberId).filter(Boolean));

        return pool.filter((member) => member?.id !== currentUserId && !linkedIds.has(member.id));
    }, [currentUserId, guests, members]);

    useEffect(() => {
        if (!availableTeamMembers.length) {
            setShowRepPicker(false);
        }
    }, [availableTeamMembers]);

    const handleAddTeamMember = (teamMemberId) => {
        const teamMember = members.find((member) => String(member.id) === String(teamMemberId));
        if (!teamMember) return;

        hapticLight();
        const nextGuest = createTourGuest({
            linkedMemberId: teamMember.id,
            legalFirstName: teamMember.firstName || '',
            legalLastName: teamMember.lastName || '',
        });

        setGuests((currentGuests) => [...currentGuests, nextGuest]);
        setExpandedGuestId(nextGuest.id);
        setShowRepPicker(false);
    };

    const openRepPicker = () => {
        hapticLight();
        setShowRepPicker(true);
    };

    const handleRemoveGuest = (guestId) => {
        setGuests((currentGuests) => {
            const nextGuests = currentGuests.filter((guest) => guest.id !== guestId);
            setExpandedGuestId((currentExpanded) => (currentExpanded === guestId ? nextGuests[0]?.id ?? null : currentExpanded));
            return nextGuests;
        });
    };

    const handleSubmit = () => {
        setSubmitAttempted(true);

        if (!selectedCustomerId) {
            setFormMessage('Select a customer (or add a new one) before continuing.');
            hapticWarning();
            return;
        }

        if (!selectedFacility) {
            setFormMessage('Choose a facility before building the guest list.');
            hapticWarning();
            return;
        }

        if (guests.length === 0) {
            setFormMessage('Add at least one attendee before submitting this visit.');
            hapticWarning();
            return;
        }

        const firstIncompleteGuest = guests.find((guest) => !isGuestComplete(guest));
        if (firstIncompleteGuest) {
            setExpandedGuestId(firstIncompleteGuest.id);
        }

        const hasMissingLegalNames = guests.some(
            (guest) => !guest.legalFirstName.trim() || !guest.legalLastName.trim()
        );
        if (hasMissingLegalNames) {
            setFormMessage('Every guest needs a legal first and last name.');
            hapticWarning();
            return;
        }

        if (!requestedDateLabel) {
            setFormMessage('Add your preferred visit date details before submitting.');
            hapticWarning();
            return;
        }

        if (preferredDateStart && preferredDateEnd && preferredDateEnd < preferredDateStart) {
            setFormMessage('Choose a valid date range where end date is after start date.');
            hapticWarning();
            return;
        }

        if (!hasExperienceSelectionInEveryTrack) {
            setShowExperienceError(true);
            setFormMessage('Choose at least one option in each experience track before submitting.');
            hapticWarning();
            return;
        }

        const submittedVisit = buildSubmittedUpcomingVisit({
            selectedCustomerLabel,
            selectedFacility,
            guests,
            experienceSelections,
            requestedDateLabel,
        });

        setFormMessage('');
        hapticSuccess();
        setShowSuccessOverlay(true);
        setUpcomingVisits((currentVisits) => [submittedVisit, ...currentVisits]);
        setExpandedUpcomingVisitId(null);

        if (successOverlayTimeoutRef.current) {
            clearTimeout(successOverlayTimeoutRef.current);
        }
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
        }

        successOverlayTimeoutRef.current = setTimeout(() => {
            setShowSuccessOverlay(false);
        }, 1350);

        navigationTimeoutRef.current = setTimeout(() => {
            const defaultDateRange = getDefaultDateRange();

            if (isNewTripRoute && typeof onNavigate === 'function') {
                onNavigate('resources/tour-visit');
            }

            setEntryMode('home');
            setGuests([createRepGuest(userSettings)]);
            setSelectedCustomerId('');
            setSelectedCustomerLabel('');
            setCustomerIsNewRecord(false);
            setSelectedFacilityId('');
            setShowFacilityOptions(true);
            setExperienceSelections(buildDefaultExperienceSelections());
            setExpandedExperienceTrackId(null);
            setShowExperienceError(false);
            setExpandedGuestId(null);
            setPendingGuestFocusId(null);
            setPreferredDateStart(defaultDateRange.start);
            setPreferredDateEnd(defaultDateRange.end);
            setActiveInfoTrackId(null);
            setSubmitAttempted(false);
            setFormMessage('');
            setShowRepPicker(false);
            hasInitializedExpandedGuestRef.current = false;
            topSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1500);
    };

    const handleCustomerBlurWithQuery = useCallback((typed) => {
        if (!selectedCustomerId || customerIsNewRecord) {
            const newId = buildNewCustomerId(typed);
            setSelectedCustomerId(newId);
            setSelectedCustomerLabel(typed);
            setCustomerIsNewRecord(true);
        }
    }, [selectedCustomerId, customerIsNewRecord]);

    const addAttendeeActions = (
        <AddAttendeeActions
            theme={theme}
            availableTeamMembers={availableTeamMembers}
            showRepPicker={showRepPicker}
            onAddGuest={handleAddGuest}
            onOpenRepPicker={openRepPicker}
            onSelectRep={handleAddTeamMember}
        />
    );

    return (
        <div className="screen-container app-header-offset relative flex flex-col" style={{ backgroundColor: theme.colors.background }}>
            <div className={`screen-content-area flex-1 min-h-0 ${showTourVisitSubmitCta ? 'relative' : ''}`}>
                {showTourVisitSubmitCta ? (
                    <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24"
                        style={{
                            background: `linear-gradient(to top, ${theme.colors.background} 0%, transparent 100%)`,
                        }}
                        aria-hidden="true"
                    />
                ) : null}
                <div className={`screen-content-inner w-full pt-4 md:pt-5 space-y-4 ${showTourVisitSubmitCta ? 'pb-36 sm:pb-40' : 'pb-8'}`}>
                        {entryMode === 'home' ? (
                            <>
                                <section className="rounded-[24px] p-4 sm:p-5" style={sectionCardSurface(theme)}>
                                    <TourVisitSectionHeader
                                        title="Schedule Trip"
                                        subtitle="Choose a hosted location to begin"
                                        icon={Building2}
                                        theme={theme}
                                    />
                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {TOUR_VISIT_FACILITIES.map((facility) => (
                                            <FacilityGridCard
                                                key={facility.id}
                                                facility={facility}
                                                onClick={() => handleFacilitySelect(facility.id)}
                                                theme={theme}
                                            />
                                        ))}
                                    </div>
                                </section>

                                <UpcomingVisitDirectory
                                    visits={upcomingVisits}
                                    expandedVisitId={expandedUpcomingVisitId}
                                    onToggleVisit={toggleUpcomingVisit}
                                    theme={theme}
                                />
                            </>
                        ) : null}

                        {entryMode === 'upcoming' ? (
                            <>
                                <UpcomingVisitDirectory
                                    visits={upcomingVisits}
                                    expandedVisitId={expandedUpcomingVisitId}
                                    onToggleVisit={toggleUpcomingVisit}
                                    theme={theme}
                                />
                                <JSIActionButton
                                    theme={theme}
                                    variant="filled"
                                    size="medium"
                                    icon={<ArrowRight className="h-4 w-4" />}
                                    onClick={openNewTourFlow}
                                >
                                    Schedule new trip
                                </JSIActionButton>
                            </>
                        ) : null}

                        {entryMode === 'new' ? (
                            <section ref={topSectionRef} className="rounded-[24px] p-4 sm:p-5" style={sectionCardSurface(theme)}>
                                <TourVisitSectionHeader
                                    title="Trip Request"
                                    subtitle={selectedFacility ? selectedFacility.name : 'Choose a hosted location'}
                                    icon={CalendarDays}
                                    theme={theme}
                                    action={selectedFacility ? (
                                        <JSIActionButton
                                            theme={theme}
                                            size="small"
                                            icon={<Send className="h-3.5 w-3.5" />}
                                            grow={false}
                                            onClick={handleNativeShare}
                                        >
                                            Share
                                        </JSIActionButton>
                                    ) : null}
                                />
                                <TripDetailsFields
                                    theme={theme}
                                    selectedFacility={selectedFacility}
                                    showFacilityOptions={showFacilityOptions}
                                    selectedFacilityId={selectedFacilityId}
                                    selectedCustomerId={selectedCustomerId}
                                    selectedCustomerLabel={selectedCustomerLabel}
                                    customerFieldRef={customerFieldRef}
                                    customerDirectoryOptions={customerDirectoryOptions}
                                    preferredDateStart={preferredDateStart}
                                    preferredDateEnd={preferredDateEnd}
                                    onCustomerSelection={handleCustomerSelection}
                                    onCustomerBlurWithQuery={handleCustomerBlurWithQuery}
                                    onChangeStart={setPreferredDateStart}
                                    onChangeEnd={setPreferredDateEnd}
                                    onFacilitySelect={handleFacilitySelect}
                                    onShowFacilityOptions={() => setShowFacilityOptions(true)}
                                />
                            </section>
                        ) : null}

                        {entryMode === 'new' && selectedFacility ? (
                            <div className="space-y-4 animate-fade-in">
                                <section className="rounded-[24px] p-4 sm:p-5" style={sectionCardSurface(theme)}>
                                    <TourVisitSectionHeader
                                        title="Attendees"
                                        subtitle={`${guests.length} traveler${guests.length === 1 ? '' : 's'} in this request`}
                                        icon={Users}
                                        theme={theme}
                                    />
                                    <div className="mt-4 divide-y divide-black/[0.04]">
                                        {guests.map((guest, index) => {
                                            let displayGuestIndex = 0;
                                            for (let currentIndex = 0; currentIndex < index; currentIndex += 1) {
                                                if (!guests[currentIndex].isSelf) displayGuestIndex += 1;
                                            }

                                            return (
                                                <GuestPanel
                                                    key={guest.id}
                                                    guest={guest}
                                                    guestIndex={guest.isSelf ? 0 : displayGuestIndex}
                                                    attendeeOrdinal={index + 1}
                                                    expanded={expandedGuestId === guest.id}
                                                    theme={theme}
                                                    isFirst={index === 0}
                                                    submitAttempted={submitAttempted}
                                                    autoFocusFirstName={pendingGuestFocusId === guest.id}
                                                    onToggleExpanded={() => setExpandedGuestId((current) => (current === guest.id ? null : guest.id))}
                                                    onChange={(field, value) => updateGuest(guest.id, field, value)}
                                                    onRemove={() => handleRemoveGuest(guest.id)}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 border-t pt-4" style={{ borderColor: border }}>
                                        {addAttendeeActions}
                                    </div>
                                </section>

                                <section className="rounded-[24px] p-4 sm:p-5" style={sectionCardSurface(theme)}>
                                    <TourVisitSectionHeader
                                        title="Experience Plan"
                                        subtitle="Build the agenda around hosted conversations"
                                        icon={Sparkles}
                                        theme={theme}
                                        action={(
                                            <span
                                                className="whitespace-nowrap rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold"
                                                style={{
                                                    backgroundColor: selectedExperienceCount > 0 ? `${theme.colors.accent}12` : subtleBg(theme),
                                                    color: selectedExperienceCount > 0 ? theme.colors.accent : theme.colors.textSecondary,
                                                }}
                                            >
                                                {selectedExperienceCount} selected
                                            </span>
                                        )}
                                    />
                                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start">
                                        {TOUR_VISIT_EXPERIENCE_TRACKS.map((track) => (
                                            <ExperienceTrackCard
                                                key={track.id}
                                                track={track}
                                                selectedOptions={experienceSelections[track.id] || []}
                                                expanded={expandedExperienceTrackId === track.id}
                                                onToggleExpanded={toggleExperienceTrack}
                                                onToggleOption={toggleExperienceOption}
                                                onOpenInfo={setActiveInfoTrackId}
                                                theme={theme}
                                            />
                                        ))}
                                    </div>

                                    {showExperienceError ? (
                                        <div
                                            className="mt-3 rounded-2xl px-4 py-3 text-sm"
                                            style={{
                                                backgroundColor: theme.colors.errorLight,
                                                color: theme.colors.error,
                                                border: `1px solid ${theme.colors.destructiveBorder}`,
                                            }}
                                        >
                                            Select at least one option in each experience track.
                                        </div>
                                    ) : null}
                                </section>

                                <section className="rounded-[24px] p-4 sm:p-5" style={sectionCardSurface(theme)}>
                                    <TourVisitSectionHeader
                                        title="Summary"
                                        subtitle="Review before submission"
                                        icon={Check}
                                        theme={theme}
                                    />
                                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                        {summaryStatTiles.map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-xl px-3 py-2.5"
                                                style={fieldTileSurface(theme)}
                                            >
                                                <p className={FIELD_LABEL_CLASSNAME} style={{ color: theme.colors.textSecondary }}>
                                                    {item.label}
                                                </p>
                                                <p
                                                    className="mt-1 text-[0.8125rem] font-semibold leading-snug"
                                                    style={{ color: item.isPending ? theme.colors.textSecondary : theme.colors.textPrimary }}
                                                >
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="mt-3 text-[0.75rem] font-normal leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                                        {experienceSummaryLine}
                                    </p>

                                    {formMessage ? (
                                        <div
                                            className="mt-3 rounded-2xl px-3.5 py-2.5 text-xs leading-5"
                                            style={{
                                                backgroundColor: 'rgba(184, 92, 92, 0.08)',
                                                color: theme.colors.error,
                                                border: '1px solid rgba(184, 92, 92, 0.14)',
                                            }}
                                        >
                                            {formMessage}
                                        </div>
                                    ) : null}
                                </section>
                            </div>
                        ) : null}
                </div>
            </div>

            {showTourVisitSubmitCta ? (
                <footer className="shrink-0">
                    <FloatingSubmitCTA
                        theme={theme}
                        onClick={handleSubmit}
                        label="Submit Trip Request"
                        visible
                    />
                </footer>
            ) : null}

            {showSuccessOverlay ? (
                <TourVisitSuccessOverlay
                    theme={theme}
                    facilityName={selectedFacility?.name}
                    customerName={normalizeCustomerLabel(selectedCustomerLabel)}
                />
            ) : null}

            <ExperienceTrackInfoOverlay
                theme={theme}
                track={activeInfoTrack}
                onClose={() => setActiveInfoTrackId(null)}
            />
        </div>
    );
};
