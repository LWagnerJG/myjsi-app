import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowRight,
    Check,
    ChevronDown,
    Info,
    MapPin,
    Plus,
    Send,
    X,
} from 'lucide-react';
import { isDarkTheme } from '../../../design-system/tokens.js';
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

const fieldSurf = (dark) => dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
const bdr       = (dark) => dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
const eyebrow   = (c) => ({ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: c.textSecondary, opacity: 0.55 });

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

const TourVisitSelectField = ({ label, value, onChange, options, placeholder, theme, searchable = true }) => {
    const dark = isDarkTheme(theme);
    return (
    <div className="relative">
        <label
            className="pointer-events-none absolute left-4 top-2 z-[1] text-[11px] font-medium leading-none"
            style={{ color: theme.colors.textSecondary }}
        >
            {label}
        </label>
        <SearchableSelect
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            theme={theme}
            searchable={searchable}
            size="sm"
            searchPlaceholder={`Search ${label.toLowerCase()}`}
            buttonClassName="!h-[56px] !rounded-[16px] !px-4 !pr-11 !pb-[6px] !pt-[18px] !text-sm"
            buttonStyle={{
                backgroundColor: fieldSurf(dark),
                border: `1px solid ${bdr(dark)}`,
                color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
            }}
        />
    </div>
    );
};

const CardHeader = ({ title, right, theme }) => {
    const dark = isDarkTheme(theme);
    return (
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${bdr(dark)}` }}>
            <span style={eyebrow(theme.colors)}>{title}</span>
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
                className={`w-full text-left ${compact ? 'rounded-none px-0.5 py-0.5' : 'rounded-[16px] px-3.5 py-2.5'}`}
                style={{
                    backgroundColor: compact ? 'transparent' : fieldSurf(dark),
                    border: 'none',
                    color: theme.colors.textPrimary,
                }}
            >
                {showFieldLabel ? (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: theme.colors.textSecondary }}>
                        Date Range
                    </p>
                ) : null}
                <div className={`${showFieldLabel ? 'mt-1' : ''} flex items-center justify-between gap-3`}>
                    <p className="text-[14px] font-medium" style={{ color: theme.colors.textPrimary }}>
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
                        border: 'none',
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
                        <p className="text-[14px] font-semibold" style={{ color: theme.colors.textPrimary }}>{monthLabel}</p>
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
                            <div key={label} className="text-center text-[11px] font-semibold" style={{ color: theme.colors.textSecondary }}>
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
                                    className="h-9 text-[13px] font-medium transition-colors"
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
                        <div className="mt-3 flex justify-end border-t pt-3" style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
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

const FacilityOption = ({ facility, selected, onClick, theme, isInList = false, showTopDivider = false }) => {
    const dark = isDarkTheme(theme);
    return (
    <button
        type="button"
        onClick={onClick}
        className={`w-full px-4 py-3.5 text-left transition-all motion-card ${isInList ? '' : 'rounded-[16px]'}`}
        style={{
            backgroundColor: isInList ? 'transparent' : fieldSurf(dark),
            border: selected ? `1px solid ${theme.colors.accent}55` : 'none',
            borderTop: isInList && showTopDivider ? `1px solid ${bdr(dark)}` : undefined,
            color: theme.colors.textPrimary,
            boxShadow: 'none',
        }}
    >
        <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
                <h3 className="text-[15px] font-semibold leading-5">{facility.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{facility.location}</span>
                </div>
            </div>
            <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                    backgroundColor: theme.colors.surface,
                    color: selected ? theme.colors.accentText : theme.colors.textSecondary,
                    border: 'none',
                }}
            >
                {selected ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </span>
        </div>
    </button>
    );
};

const TourVisitBooleanField = ({ label, value, onChange, theme }) => {
    const dark = isDarkTheme(theme);
    return (
    <div
        className="rounded-[16px] px-3.5 py-2.5"
        style={{
            backgroundColor: fieldSurf(dark),
            border: `1px solid ${bdr(dark)}`,
        }}
    >
        <div className="flex min-h-[36px] items-center justify-between gap-3">
            <label className="text-[11px] font-medium leading-none" style={{ color: theme.colors.textSecondary }}>
                {label}
            </label>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
                    style={{
                        color: !value ? theme.colors.accentText : theme.colors.textSecondary,
                        backgroundColor: !value ? theme.colors.accent : theme.colors.surface,
                        border: !value ? `1px solid ${theme.colors.accent}` : '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                >
                    No
                </button>
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
                    style={{
                        color: value ? theme.colors.accentText : theme.colors.textSecondary,
                        backgroundColor: value ? theme.colors.accent : theme.colors.surface,
                        border: value ? `1px solid ${theme.colors.accent}` : '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                >
                    Yes
                </button>
            </div>
        </div>
    </div>
    );
};

const UpcomingVisitDirectory = ({ visits, expandedVisitId, onToggleVisit, theme }) => {
    const dark = isDarkTheme(theme);
    const border = bdr(dark);
    return (
    <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${border}` }}>
        <CardHeader title="Upcoming Trips" theme={theme} />

        <div>
            {visits.map((visit, visitIndex) => {
                const isExpanded = expandedVisitId === visit.id;
                const isPendingApproval = visit.approvalStatus === 'pending';

                return (
                    <div
                        key={visit.id}
                        className="overflow-hidden"
                        style={{
                            backgroundColor: isExpanded ? fieldSurf(dark) : 'transparent',
                            borderTop: visitIndex > 0 ? `1px solid ${border}` : 'none',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => onToggleVisit(visit.id)}
                            className="flex w-full items-center justify-between gap-3 px-3.5 py-3.5 text-left transition-all"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                                        {visit.companyName}
                                    </h3>
                                    {isPendingApproval ? (
                                        <span
                                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                                            style={{
                                                color: theme.colors.warning,
                                                backgroundColor: theme.colors.warningLight,
                                                border: `1px solid ${theme.colors.warning}22`,
                                            }}
                                        >
                                            Pending
                                        </span>
                                    ) : null}
                                </div>
                                <p className="mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {visit.dateLabel} · {visit.facilityName}
                                </p>
                                {isPendingApproval ? (
                                    <p className="mt-1 text-[11px] font-medium" style={{ color: theme.colors.warning }}>
                                        {visit.approvalLabel || 'Awaiting JSI approval'}
                                    </p>
                                ) : null}
                            </div>
                            <ChevronDown
                                className="h-4 w-4 shrink-0 transition-transform duration-200"
                                style={{
                                    color: theme.colors.textSecondary,
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                }}
                            />
                        </button>

                        {isExpanded ? (
                            <div className="px-3.5 pb-3.5 pt-1.5">
                                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                    {visit.overnightLabel} · {visit.attendees}
                                </p>
                                {visit.agendaLabel ? (
                                    <div
                                        className="mt-2 rounded-[14px] px-3 py-2 text-[11px] font-medium"
                                        style={{
                                            color: isPendingApproval ? theme.colors.warning : theme.colors.textSecondary,
                                            backgroundColor: isPendingApproval ? theme.colors.warningLight : 'rgba(0, 0, 0, 0.03)',
                                            border: `1px solid ${isPendingApproval ? `${theme.colors.warning}22` : 'rgba(0, 0, 0, 0.05)'}`,
                                        }}
                                    >
                                        {visit.agendaLabel}
                                    </div>
                                ) : null}
                                <div className="mt-3 space-y-3">
                                    {visit.agenda.map((day) => (
                                        <div
                                            key={`${visit.id}-${day.dayLabel}`}
                                            className="rounded-[14px] px-3.5 py-3"
                                            style={{
                                                backgroundColor: fieldSurf(dark),
                                                border: 'none',
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary }}>
                                                    {day.dayLabel}
                                                </p>
                                                <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                                                    {day.sessions.length} stops
                                                </span>
                                            </div>
                                            <div className="mt-3 space-y-3">
                                                {day.sessions.map((session, sessionIndex) => {
                                                    const { time, detail } = parseAgendaSession(session);
                                                    const isLastSession = sessionIndex === day.sessions.length - 1;

                                                    return (
                                                        <div key={`${visit.id}-${day.dayLabel}-${session}`} className="grid grid-cols-[72px_1fr] gap-3">
                                                            <div className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary }}>
                                                                {time || `Stop ${sessionIndex + 1}`}
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <div className="relative flex w-3 shrink-0 justify-center">
                                                                    <span
                                                                        className="mt-1.5 h-2.5 w-2.5 rounded-full"
                                                                        style={{ backgroundColor: theme.colors.accent }}
                                                                    />
                                                                    {!isLastSession ? (
                                                                        <span
                                                                            className="absolute left-1/2 top-4 w-px -translate-x-1/2"
                                                                            style={{
                                                                                bottom: '-18px',
                                                                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                                                            }}
                                                                        />
                                                                    ) : null}
                                                                </div>
                                                                <div
                                                                    className="flex-1 rounded-[12px] px-3 py-2.5"
                                                                    style={{
                                                                        backgroundColor: theme.colors.surface,
                                                                        border: 'none',
                                                                    }}
                                                                >
                                                                    <p className="text-sm leading-5" style={{ color: theme.colors.textPrimary }}>
                                                                        {detail}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    </div>
    );
};

const ExperienceTrackCard = ({ track, selectedOptions, expanded, onToggleExpanded, onToggleOption, onOpenInfo, theme }) => {
    const dark = isDarkTheme(theme);
    return (
    <div className="rounded-[16px] px-4 py-3.5" style={{
        backgroundColor: fieldSurf(dark),
        border: `1px solid ${bdr(dark)}`,
    }}>
        <div className="flex items-start gap-3">
            <button
                type="button"
                onClick={() => onToggleExpanded(track.id)}
                className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
                aria-expanded={expanded}
                aria-controls={`experience-track-${track.id}`}
            >
                <div className="min-w-0">
                    <h4 className="text-[14px] font-semibold" style={{ color: theme.colors.textPrimary }}>{track.title}</h4>
                    <p className="mt-1 text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
                        {selectedOptions.length ? `${selectedOptions.length} selected` : 'Click to choose'}
                    </p>
                </div>
                <ChevronDown
                    className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200"
                    style={{
                        color: theme.colors.textSecondary,
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                />
            </button>
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    onOpenInfo(track.id);
                }}
                aria-label={`More information about ${track.title}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                style={{
                    color: theme.colors.textSecondary,
                    backgroundColor: theme.colors.surface,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                }}
            >
                <Info className="h-3.5 w-3.5" />
            </button>
        </div>
        {expanded ? (
            <div id={`experience-track-${track.id}`} className="mt-3 flex flex-wrap gap-1.5">
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
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all"
                            style={{
                                color: isSelected ? theme.colors.accentText : theme.colors.textPrimary,
                                backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                                border: isSelected ? `1px solid ${theme.colors.accent}` : '1px solid rgba(0, 0, 0, 0.08)',
                                boxShadow: 'none',
                            }}
                        >
                            {isSelected ? <Check className="h-3 w-3" /> : null}
                            {optionLabel}
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
    embedded = false,
    isFirst = false,
    footerAction = null,
    submitAttempted,
    autoFocusFirstName = false,
    onToggleExpanded,
    onChange,
    onRemove,
}) => {
    const dark = isDarkTheme(theme);
    const border = bdr(dark);
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
        <div
            className={`rounded-[18px] px-3 py-2.5 ${embedded && !isFirst ? 'pt-3' : ''}`}
            style={{
                backgroundColor: embedded ? 'transparent' : theme.colors.surface,
                borderTop: embedded && !isFirst ? `1px solid ${border}` : undefined,
                borderRadius: embedded ? 0 : 18,
            }}
        >
            <div
                role="button"
                tabIndex={0}
                onClick={handleToggle}
                onKeyDown={handleHeaderKeyDown}
                className="flex w-full items-start justify-between gap-4 text-left cursor-pointer"
            >
                <div className="min-w-0 flex flex-1 items-center gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span
                            className="text-[11px] font-medium leading-none"
                            style={{ color: theme.colors.textSecondary }}
                        >
                            {attendeeOrdinal}.
                        </span>
                        <h3 className="text-[14px] font-semibold leading-5" style={{ color: theme.colors.textPrimary }}>
                            {getGuestDisplayName(guest, guestIndex)}
                        </h3>
                        {repAttendee ? (
                            <span
                                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                                style={{
                                    backgroundColor: theme.colors.accent + '0a',
                                    color: theme.colors.textSecondary,
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
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-opacity opacity-40 hover:opacity-100"
                        style={{
                            color: theme.colors.textSecondary,
                        }}
                    >
                        <X className="h-3 w-3" />
                    </button>

                    <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-200"
                        style={{
                            color: theme.colors.textSecondary,
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
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
                        className="mt-2"
                        style={{
                            transform: expanded ? 'translateY(0)' : 'translateY(-8px)',
                            transition: `transform ${expandTransition}`,
                            pointerEvents: expanded ? 'auto' : 'none',
                        }}
                    >
                    <div className="rounded-[14px] p-2.5" style={{ backgroundColor: fieldSurf(dark) }}>
                    <div className="grid grid-cols-2 gap-2">
                        <FormInput
                            label="First Name"
                            value={guest.legalFirstName}
                            onChange={(event) => onChange('legalFirstName', event.target.value)}
                            placeholder="As on ID"
                            autoFocus={autoFocusFirstName}
                            theme={theme}
                            required
                            insetLabel
                            surfaceBackground={fieldSurf(dark)}
                            surfaceBorder={`1px solid ${bdr(dark)}`}
                        />
                        <FormInput
                            label="Last Name"
                            value={guest.legalLastName}
                            onChange={(event) => onChange('legalLastName', event.target.value)}
                            placeholder="As on ID"
                            theme={theme}
                            required
                            insetLabel
                            surfaceBackground={fieldSurf(dark)}
                            surfaceBorder={`1px solid ${bdr(dark)}`}
                        />

                        {!repAttendee ? (
                            <FormInput
                                label="Date of Birth"
                                type="date"
                                value={guest.dateOfBirth || ''}
                                onChange={(event) => onChange('dateOfBirth', event.target.value)}
                                theme={theme}
                                insetLabel
                                softChrome
                                surfaceBackground={fieldSurf(dark)}
                                surfaceBorder={`1px solid ${bdr(dark)}`}
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

                        <FormInput
                            label="Known Traveler Number"
                            value={guest.knownTravelerNumber}
                            onChange={(event) => onChange('knownTravelerNumber', event.target.value)}
                            placeholder="Optional"
                            theme={theme}
                            insetLabel
                            softChrome
                            surfaceBackground={fieldSurf(dark)}
                            surfaceBorder={`1px solid ${bdr(dark)}`}
                        />
                    </div>

                    {guestErrors.length ? (
                        <div
                            className="mt-2.5 rounded-2xl px-4 py-3 text-sm"
                            style={{
                                backgroundColor: theme.colors.errorLight,
                                color: theme.colors.error,
                                border: `1px solid ${theme.colors.destructiveBorder}`,
                            }}
                        >
                            {guestErrors.join(' ')}
                        </div>
                    ) : null}

                    {!repAttendee ? (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <TourVisitBooleanField
                                    label="Dietary Restrictions"
                                    value={guest.hasDietaryRestrictions}
                                    onChange={(nextValue) => onChange('hasDietaryRestrictions', nextValue)}
                                    theme={theme}
                                />

                                {guest.hasDietaryRestrictions ? (
                                    <div
                                        className="rounded-[16px] px-3.5 py-3"
                                        style={{
                                            backgroundColor: fieldSurf(dark),
                                            border: `1px solid ${bdr(dark)}`,
                                        }}
                                    >
                                        <label className="text-[11px] font-medium leading-none" style={{ color: theme.colors.textSecondary }}>
                                            Restriction Details
                                        </label>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
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
                                                        className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
                                                        style={{
                                                            color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary,
                                                            backgroundColor: isSelected ? theme.colors.accent + '14' : theme.colors.surface,
                                                            border: '1px solid rgba(0, 0, 0, 0.05)',
                                                        }}
                                                    >
                                                        {restriction}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <FormInput
                                label="Fun Fact"
                                value={guest.funFact || ''}
                                onChange={(event) => onChange('funFact', event.target.value)}
                                placeholder="Short note"
                                theme={theme}
                                insetLabel
                                softChrome
                                surfaceBackground={fieldSurf(dark)}
                                surfaceBorder={`1px solid ${bdr(dark)}`}
                                maxLength={60}
                            />

                            {guest.hasDietaryRestrictions && (guest.dietaryRestrictions || []).includes('Other') ? (
                                <div className="col-span-2">
                                    <FormInput
                                        label="Other Dietary Notes"
                                        type="textarea"
                                        value={guest.dietaryRestrictionsOther || ''}
                                        onChange={(event) => onChange('dietaryRestrictionsOther', event.target.value)}
                                        placeholder="Briefly explain dietary restrictions"
                                        theme={theme}
                                        insetLabel
                                        softChrome
                                        surfaceBackground={fieldSurf(dark)}
                                        surfaceBorder={`1px solid ${bdr(dark)}`}
                                        maxLength={140}
                                    />
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                    </div>
                </div>
                </div>
                </div>

            {footerAction ? (
                <div className="mt-2 pt-2">
                    {footerAction}
                </div>
            ) : null}
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
            className="w-full max-w-sm rounded-[28px] px-6 py-7 text-center"
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
                    ? `${customerName} · ${facilityName || 'Awaiting JSI approval'}`
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
                        <h3 className="mt-1 text-[17px] font-bold" style={{ color: theme.colors.textPrimary }}>{track.title}</h3>
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
                                <p className="mt-1 text-[12px] leading-5" style={{ color: theme.colors.textSecondary }}>
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
    const dark = isDarkTheme(theme);
    const repPickerRef = useRef(null);

    useEffect(() => {
        if (!showRepPicker) return;
        requestAnimationFrame(() => {
            repPickerRef.current?.click();
        });
    }, [showRepPicker]);

    if (showRepPicker) {
        return (
            <div className="space-y-1.5">
                <p className="px-1 text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: theme.colors.textSecondary }}>
                    Select rep
                </p>
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
                />
            </div>
        );
    }

    return (
        <div
            className="grid overflow-hidden rounded-[16px]"
            style={{
                gridTemplateColumns: availableTeamMembers.length ? '1fr 1fr' : '1fr',
                backgroundColor: fieldSurf(dark),
                border: `1px solid ${bdr(dark)}`,
            }}
        >
            <button
                type="button"
                onClick={onAddGuest}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                    color: theme.colors.textSecondary,
                }}
            >
                <Plus className="h-4 w-4" />
                Add guest
            </button>

            {availableTeamMembers.length ? (
                <button
                    type="button"
                    onClick={onOpenRepPicker}
                    className="flex items-center justify-center gap-2 border-l px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{
                        color: theme.colors.textSecondary,
                        borderColor: 'rgba(0, 0, 0, 0.03)',
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Add rep
                </button>
            ) : null}
        </div>
    );
};

export const TourVisitScreen = ({ theme, userSettings, setBackHandler, members = [], currentUserId, currentScreen, onNavigate }) => {
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
            setBackHandler(() => {
                resetTourVisitFlow();
                return true;
            });

            return () => {
                setBackHandler(null);
            };
        }

        setBackHandler(null);
        return () => {
            setBackHandler(null);
        };
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
        <div className="screen-container app-header-offset relative" style={{ backgroundColor: theme.colors.background }}>
            <div className="screen-content-area">
                <div className="screen-content-inner pt-4 md:pt-5">
                    <div className="mx-auto w-full max-w-[760px] space-y-3">
                        {entryMode === 'home' ? (
                            <>
                                <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${border}` }}>
                                    <CardHeader title="Schedule Trip" theme={theme} />
                                    <div className="p-3">
                                        <div className="overflow-hidden rounded-[14px]" style={{ backgroundColor: fieldSurf(dark) }}>
                                            {TOUR_VISIT_FACILITIES.map((facility, facilityIndex) => (
                                                <FacilityOption
                                                    key={facility.id}
                                                    facility={facility}
                                                    selected={false}
                                                    onClick={() => handleFacilitySelect(facility.id)}
                                                    theme={theme}
                                                    isInList
                                                    showTopDivider={facilityIndex > 0}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

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
                                <button
                                    type="button"
                                    onClick={openNewTourFlow}
                                    className="w-full rounded-full px-5 py-3 text-sm font-semibold transition-all motion-tap"
                                    style={{
                                        color: theme.colors.accentText,
                                        backgroundColor: theme.colors.accent,
                                        border: `1px solid ${theme.colors.accent}`,
                                    }}
                                >
                                    Schedule new trip
                                </button>
                            </>
                        ) : null}

                        {entryMode === 'new' ? (
                            <>
                                <div ref={topSectionRef}>
                                    <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${border}` }}>
                                    {selectedFacility && !showFacilityOptions ? (
                                        <div>
                                            <div className="px-5 pt-4 pb-3">
                                                <p style={eyebrow(theme.colors)}>Customer</p>
                                                <div className="mt-2">
                                                    <SearchableSelect
                                                        value={selectedCustomerId}
                                                        onChange={handleCustomerSelection}
                                                        options={customerDirectoryOptions}
                                                        placeholder="Customer name"
                                                        displayValue={normalizeCustomerLabel(selectedCustomerLabel)}
                                                        theme={theme}
                                                        size="sm"
                                                        onBlurWithQuery={(typed) => {
                                                            if (!selectedCustomerId || customerIsNewRecord) {
                                                                const newId = buildNewCustomerId(typed);
                                                                setSelectedCustomerId(newId);
                                                                setSelectedCustomerLabel(typed);
                                                                setCustomerIsNewRecord(true);
                                                            }
                                                        }}
                                                        buttonRef={customerFieldRef}
                                                        inlineSearch
                                                        minQueryLength={2}
                                                        dropdownIndicatorMode="hidden"
                                                        buttonClassName="!h-[32px] !rounded-none !px-0 !pr-0 !text-[14px] !font-medium"
                                                        buttonStyle={{
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            color: selectedCustomerId ? theme.colors.textPrimary : theme.colors.textSecondary,
                                                            boxShadow: 'none',
                                                        }}
                                                        inputClassName="!h-[32px] !rounded-none !px-0 !pr-0 !text-[14px] !font-medium"
                                                        inputStyle={{
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            color: theme.colors.textPrimary,
                                                            boxShadow: 'none',
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="px-5 py-3" style={{ borderTop: `1px solid ${border}` }}>
                                                <p style={eyebrow(theme.colors)}>Dates</p>
                                                <div className="mt-2">
                                                    <DateRangeDropdown
                                                        theme={theme}
                                                        startDate={preferredDateStart}
                                                        endDate={preferredDateEnd}
                                                        onChangeStart={setPreferredDateStart}
                                                        onChangeEnd={setPreferredDateEnd}
                                                        showFieldLabel={false}
                                                        compact
                                                        showChevron={false}
                                                    />
                                                </div>
                                            </div>

                                            <div className="px-5 py-3" style={{ borderTop: `1px solid ${border}` }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowFacilityOptions(true)}
                                                    className="w-full text-left"
                                                >
                                                    <p style={eyebrow(theme.colors)}>Location</p>
                                                    <div className="mt-2 flex items-center justify-between gap-4">
                                                        <p className="text-[14px] font-medium" style={{ color: theme.colors.textPrimary }}>
                                                            {selectedFacility.name}
                                                        </p>
                                                        <span className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                                                            Change
                                                        </span>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="px-5 py-3" style={{ borderTop: `1px solid ${border}` }}>
                                                <button
                                                    type="button"
                                                    onClick={handleNativeShare}
                                                    className="inline-flex items-center gap-1.5 text-[11px] font-medium transition-opacity hover:opacity-100"
                                                    style={{ color: theme.colors.textSecondary, opacity: 0.6 }}
                                                >
                                                    <Send className="h-3 w-3" />
                                                    Share form
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4">
                                                <p style={eyebrow(theme.colors)}>Location</p>
                                                <div className="mt-2.5 overflow-hidden rounded-[14px]" style={{ backgroundColor: fieldSurf(dark) }}>
                                                    {TOUR_VISIT_FACILITIES.map((facility, facilityIndex) => (
                                                        <FacilityOption
                                                            key={facility.id}
                                                            facility={facility}
                                                            selected={selectedFacilityId === facility.id}
                                                            onClick={() => handleFacilitySelect(facility.id)}
                                                            theme={theme}
                                                            isInList
                                                            showTopDivider={facilityIndex > 0}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${border}` }}>
                                                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                                                    <div className="rounded-[14px] px-3 py-2" style={{ backgroundColor: fieldSurf(dark) }}>
                                                        <p style={eyebrow(theme.colors)}>Customer</p>
                                                        <div className="mt-1">
                                                            <SearchableSelect
                                                                value={selectedCustomerId}
                                                                onChange={handleCustomerSelection}
                                                                options={customerDirectoryOptions}
                                                                placeholder="Customer name"
                                                                displayValue={normalizeCustomerLabel(selectedCustomerLabel)}
                                                                theme={theme}
                                                                size="sm"
                                                                onBlurWithQuery={(typed) => {
                                                                    if (!selectedCustomerId || customerIsNewRecord) {
                                                                        const newId = buildNewCustomerId(typed);
                                                                        setSelectedCustomerId(newId);
                                                                        setSelectedCustomerLabel(typed);
                                                                        setCustomerIsNewRecord(true);
                                                                    }
                                                                }}
                                                                buttonRef={customerFieldRef}
                                                                inlineSearch
                                                                minQueryLength={2}
                                                                dropdownIndicatorMode="hidden"
                                                                buttonClassName="!h-[36px] !rounded-none !px-0.5 !pr-1 !text-[14px] !font-medium"
                                                                buttonStyle={{
                                                                    backgroundColor: 'transparent',
                                                                    border: 'none',
                                                                    color: selectedCustomerId ? theme.colors.textPrimary : theme.colors.textSecondary,
                                                                    boxShadow: 'none',
                                                                }}
                                                                inputClassName="!h-[36px] !rounded-none !px-0.5 !pr-1 !text-[14px] !font-medium"
                                                                inputStyle={{
                                                                    backgroundColor: 'transparent',
                                                                    border: 'none',
                                                                    color: theme.colors.textPrimary,
                                                                    boxShadow: 'none',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="rounded-[14px] px-3 py-2" style={{ backgroundColor: fieldSurf(dark) }}>
                                                        <p style={eyebrow(theme.colors)}>Dates</p>
                                                        <div className="mt-1">
                                                            <DateRangeDropdown
                                                                theme={theme}
                                                                startDate={preferredDateStart}
                                                                endDate={preferredDateEnd}
                                                                onChangeStart={setPreferredDateStart}
                                                                onChangeEnd={setPreferredDateEnd}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${border}` }}>
                                                <button
                                                    type="button"
                                                    onClick={handleNativeShare}
                                                    className="inline-flex items-center gap-1.5 text-[11px] font-medium transition-opacity hover:opacity-100"
                                                    style={{ color: theme.colors.textSecondary, opacity: 0.65 }}
                                                >
                                                    <Send className="h-3 w-3" />
                                                    Share form
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    </div>
                                </div>
                            </>
                        ) : null}

                        {entryMode === 'new' && selectedFacility ? (
                            <div className="space-y-2.5 animate-fade-in">
                                <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${border}` }}>
                                    <CardHeader title="Attendees" theme={theme} />
                                    <div className="p-3">
                                    <div
                                        className="overflow-hidden rounded-[16px]"
                                        style={{ backgroundColor: fieldSurf(dark) }}
                                    >
                                        {guests.map((guest, index) => {
                                            const isLastGuest = index === guests.length - 1;
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
                                                    embedded
                                                    isFirst={index === 0}
                                                    footerAction={isLastGuest ? addAttendeeActions : null}
                                                    submitAttempted={submitAttempted}
                                                    autoFocusFirstName={pendingGuestFocusId === guest.id}
                                                    onToggleExpanded={() => setExpandedGuestId((current) => (current === guest.id ? null : guest.id))}
                                                    onChange={(field, value) => updateGuest(guest.id, field, value)}
                                                    onRemove={() => handleRemoveGuest(guest.id)}
                                                />
                                            );
                                        })}

                                        {!guests.length ? (
                                            <div className="px-3.5 py-3">
                                                {addAttendeeActions}
                                            </div>
                                        ) : null}
                                    </div>
                                    </div>
                                </div>

                                <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${border}` }}>
                                    <CardHeader
                                        title="Experience Plan"
                                        theme={theme}
                                        right={
                                            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: theme.colors.textSecondary, backgroundColor: fieldSurf(dark) }}>
                                                {selectedExperienceCount} selected
                                            </span>
                                        }
                                    />
                                    <div className="p-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
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
                                </div>

                                <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${border}` }}>
                                    <CardHeader title="Summary" theme={theme} />
                                    <div className="flex flex-col gap-3 p-5">

                                        <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 md:hidden">
                                            {summaryRows.map((item) => (
                                                <React.Fragment key={item.label}>
                                                    <span className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
                                                        {item.label}
                                                    </span>
                                                    <span className="text-right text-[14px] font-medium leading-5" style={{ color: item.isPending ? theme.colors.textSecondary : theme.colors.textPrimary }}>
                                                        {item.value}
                                                    </span>
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        <div className="hidden md:flex md:flex-wrap md:items-center md:gap-x-2 md:gap-y-2">
                                            {summaryRows.map((item, index) => (
                                                <React.Fragment key={item.label}>
                                                    {index > 0 ? <span style={{ color: theme.colors.textSecondary, opacity: 0.28 }}>•</span> : null}
                                                    <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                                                        {item.label}
                                                    </span>
                                                    <span className="text-[14px] font-medium" style={{ color: item.isPending ? theme.colors.textSecondary : theme.colors.textPrimary }}>
                                                        {item.value}
                                                    </span>
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t pt-3" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                                            {summaryStats.map((item, index) => (
                                                <React.Fragment key={item.label}>
                                                    {index > 0 ? <span style={{ color: theme.colors.textSecondary, opacity: 0.24 }}>•</span> : null}
                                                    <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                                                        {item.label}
                                                    </span>
                                                    <span className="text-[13px] font-medium" style={{ color: theme.colors.textPrimary }}>
                                                        {item.value}
                                                    </span>
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="w-full rounded-full px-6 py-2.5 text-sm font-semibold transition-all motion-tap md:w-auto md:self-end"
                                            style={{
                                                color: theme.colors.accentText,
                                                backgroundColor: theme.colors.accent,
                                                border: `1px solid ${theme.colors.accent}`,
                                                boxShadow: 'none',
                                            }}
                                        >
                                            Submit
                                        </button>
                                    </div>

                                    {formMessage ? (
                                        <div
                                            className="mt-3 rounded-[18px] px-3.5 py-2.5 text-[12px] leading-5"
                                            style={{
                                                backgroundColor: 'rgba(184, 92, 92, 0.08)',
                                                color: theme.colors.error,
                                                border: '1px solid rgba(184, 92, 92, 0.14)',
                                            }}
                                        >
                                            {formMessage}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

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
