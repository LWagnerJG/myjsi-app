import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowRight,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    Copy,
    Mail,
    MapPin,
    MessageSquare,
    Plus,
    Send,
    Sparkles,
    X,
} from 'lucide-react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { SearchableSelect } from '../../../components/forms/SearchableSelect.jsx';
import { hapticLight, hapticSuccess, hapticWarning } from '../../../utils/haptics.js';
import { DEALER_DIRECTORY_DATA } from '../dealer-directory/data.js';
import {
    TOUR_VISIT_AIRLINES,
    TOUR_VISIT_EXPERIENCE_TRACKS,
    TOUR_VISIT_FACILITIES,
    TOUR_VISIT_NON_NEGOTIABLE_SESSIONS,
    TOUR_VISIT_TSHIRT_SIZES,
    TOUR_VISIT_UPCOMING_VISITS,
    createRepGuest,
    createTourGuest,
} from './data.js';

const TOUR_VISIT_YES_NO_OPTIONS = ['No', 'Yes'];

const buildNewCustomerId = (value) => `new-customer-${String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

const buildDefaultExperienceSelections = () =>
    Object.fromEntries(TOUR_VISIT_EXPERIENCE_TRACKS.map((track) => [track.id, track.options.length ? [track.options[0]] : []]));

const sectionLabelStyle = {
    fontSize: '0.72rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontWeight: 700,
};

const TOUR_VISIT_PANEL_SURFACE = 'rgba(255, 255, 255, 0.78)';
const TOUR_VISIT_PANEL_SURFACE_COLLAPSED = 'rgba(255, 255, 255, 0.66)';
const TOUR_VISIT_FIELD_SURFACE = 'rgba(255, 255, 255, 0.5)';
const TOUR_VISIT_SURFACE_BORDER = '1px solid rgba(0, 0, 0, 0.04)';

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

const TourVisitSelectField = ({ label, value, onChange, options, placeholder, theme }) => (
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
            size="sm"
            searchPlaceholder={`Search ${label.toLowerCase()}`}
            buttonClassName="!h-[56px] !rounded-[16px] !px-4 !pr-11 !pb-[6px] !pt-[18px] !text-sm"
            buttonStyle={{
                backgroundColor: TOUR_VISIT_FIELD_SURFACE,
                border: TOUR_VISIT_SURFACE_BORDER,
                color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
            }}
        />
    </div>
);

const FacilityOption = ({ facility, selected, onClick, theme }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-full rounded-[18px] px-4 py-3.5 text-left transition-all motion-card"
        style={{
            backgroundColor: theme.colors.surface,
            border: `1px solid ${selected ? theme.colors.accent : theme.colors.border}`,
            color: theme.colors.textPrimary,
            boxShadow: 'none',
        }}
    >
        <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
                <h3 className="text-base font-semibold">{facility.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{facility.location}</span>
                </div>
            </div>
            <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                    backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
                    color: selected ? theme.colors.accentText : theme.colors.textSecondary,
                    border: `1px solid ${selected ? theme.colors.accent : theme.colors.border}`,
                }}
            >
                <Check className="h-4 w-4" />
            </span>
        </div>
    </button>
);

const SelectedFacilityCard = ({ facility, theme, onChange }) => (
    <div className="px-1 pt-1 pb-0.5 animate-fade-in">
        <button
            type="button"
            onClick={onChange}
            className="w-full text-left transition-all duration-200"
        >
            <div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: theme.colors.border }}>
                <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                        Tour visit
                    </p>
                    <h1 className="mt-1 text-[28px] font-semibold leading-none" style={{ color: theme.colors.textPrimary }}>
                        {facility.name}
                    </h1>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{facility.location}</span>
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: theme.colors.textSecondary }}>
                        Change location
                        <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                </div>
            </div>
        </button>
    </div>
);

const ShareActionButton = ({ icon: Icon, label, onClick, disabled, theme }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
        style={{
            color: theme.colors.textPrimary,
            backgroundColor: TOUR_VISIT_FIELD_SURFACE,
            border: TOUR_VISIT_SURFACE_BORDER,
        }}
    >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
    </button>
);

const EntryChoiceCard = ({ title, description, onClick, theme }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-full rounded-[20px] px-4 py-4 text-left transition-all motion-card"
        style={{
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
        }}
    >
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6" style={{ color: theme.colors.textSecondary }}>
            {description}
        </p>
    </button>
);

const UpcomingVisitDirectory = ({ visits, expandedVisitId, onToggleVisit, theme }) => {
    const selectedVisit = visits.find((visit) => visit.id === expandedVisitId) || null;

    return (
    <GlassCard theme={theme} className="p-5 md:p-6">
        <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
            <p style={{ ...sectionLabelStyle, color: theme.colors.textSecondary }}>Upcoming Visits</p>
        </div>

        <p className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
            Other routes are listed below. Click a company to view the full agenda.
        </p>

        <div className="mt-3 space-y-2.5">
            {visits.map((visit) => {
                const isExpanded = expandedVisitId === visit.id;

                return (
                    <button
                        key={visit.id}
                        type="button"
                        onClick={() => onToggleVisit(visit.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-[14px] px-3.5 py-3 text-left transition-all"
                        style={{
                            backgroundColor: isExpanded ? theme.colors.subtle : TOUR_VISIT_FIELD_SURFACE,
                            border: `1px solid ${isExpanded ? theme.colors.accent + '55' : 'rgba(0, 0, 0, 0.05)'}`,
                        }}
                    >
                        <div>
                            <h3 className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                                {visit.companyName}
                            </h3>
                            <p className="mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>
                                {visit.dateLabel}
                            </p>
                        </div>
                        <ChevronDown
                            className="h-4 w-4 shrink-0 transition-transform duration-200"
                            style={{
                                color: theme.colors.textSecondary,
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                        />
                    </button>
                );
            })}

            {selectedVisit ? (
                <div className="rounded-[16px] px-3.5 py-3" style={{
                    backgroundColor: theme.colors.surface,
                    border: TOUR_VISIT_SURFACE_BORDER,
                }}>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                        {selectedVisit.facilityName} · {selectedVisit.overnightLabel} · {selectedVisit.attendees}
                    </p>
                    <div className="mt-2.5 space-y-2">
                        {selectedVisit.agenda.map((day) => (
                            <div key={`${selectedVisit.id}-${day.dayLabel}`} className="rounded-[12px] px-3 py-2.5" style={{
                                backgroundColor: TOUR_VISIT_FIELD_SURFACE,
                                border: TOUR_VISIT_SURFACE_BORDER,
                            }}>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary }}>
                                    {day.dayLabel}
                                </p>
                                <ul className="mt-1.5 space-y-1 text-xs" style={{ color: theme.colors.textPrimary }}>
                                    {day.sessions.map((session) => (
                                        <li key={`${selectedVisit.id}-${day.dayLabel}-${session}`}>{session}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Additional hosted visits will appear here as they are scheduled.
            </p>
        </div>
    </GlassCard>
    );
};

const ExperienceTrackCard = ({ track, selectedOptions, onToggleOption, theme }) => (
    <div className="rounded-[18px] px-4 py-3.5" style={{
        backgroundColor: TOUR_VISIT_FIELD_SURFACE,
        border: TOUR_VISIT_SURFACE_BORDER,
    }}>
        <h4 className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{track.title}</h4>
        <p className="mt-1 text-xs leading-5" style={{ color: theme.colors.textSecondary }}>{track.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
            {track.options.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onToggleOption(track.id, option)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                            color: theme.colors.textPrimary,
                            backgroundColor: isSelected ? theme.colors.accent + '16' : theme.colors.surface,
                            border: `1px solid ${isSelected ? theme.colors.accent : 'rgba(0, 0, 0, 0.08)'}`,
                        }}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    </div>
);

const GuestPanel = ({
    guest,
    attendeeNumber,
    guestIndex,
    expanded,
    theme,
    embedded = false,
    isFirst = false,
    footerAction = null,
    submitAttempted,
    onToggleExpanded,
    onCollapse,
    onChange,
    onSetDietaryGate,
    onRemove,
}) => {
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

    const handlePanelBlur = (event) => {
        if (!expanded || !isGuestComplete(guest)) return;

        const nextFocused = event.relatedTarget;
        if (nextFocused && event.currentTarget.contains(nextFocused)) return;

        onCollapse();
    };

    return (
        <div
            className="rounded-[18px] px-3.5 py-3"
            onBlur={handlePanelBlur}
            style={{
                backgroundColor: embedded ? 'transparent' : expanded ? TOUR_VISIT_PANEL_SURFACE : TOUR_VISIT_PANEL_SURFACE_COLLAPSED,
                border: embedded ? 'none' : expanded ? TOUR_VISIT_SURFACE_BORDER : '1px solid rgba(0, 0, 0, 0.035)',
                borderTop: embedded && !isFirst ? '1px solid rgba(0, 0, 0, 0.05)' : undefined,
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
                <div className="min-w-0 flex flex-1 items-start gap-3">
                    <span
                        className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-[12px] font-semibold"
                        style={{
                            backgroundColor: theme.colors.accent + '12',
                            color: theme.colors.textPrimary,
                            border: `1px solid ${theme.colors.accent}33`,
                        }}
                    >
                        {attendeeNumber}
                    </span>
                    <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <h3 className="text-[15px] font-semibold leading-5" style={{ color: theme.colors.textPrimary }}>
                                {getGuestDisplayName(guest, guestIndex)}
                            </h3>
                            {repAttendee ? (
                                <span
                                    className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                                    style={{
                                        backgroundColor: theme.colors.accent + '12',
                                        color: theme.colors.textSecondary,
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                    }}
                                >
                                    Rep
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
                    <button
                        type="button"
                        aria-label={guest.isSelf ? 'Remove yourself' : 'Remove guest'}
                        onClick={(event) => {
                            event.stopPropagation();
                            onRemove();
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                        style={{
                            color: theme.colors.error,
                            backgroundColor: theme.colors.errorLight,
                            border: `1px solid ${theme.colors.destructiveBorder}`,
                        }}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200"
                        style={{
                            color: theme.colors.textSecondary,
                            backgroundColor: expanded ? TOUR_VISIT_FIELD_SURFACE : 'transparent',
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                    >
                        <ChevronDown className="h-4 w-4" />
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
                    <div className="grid grid-cols-2 gap-2.5">
                        <FormInput
                            label="Legal First Name"
                            value={guest.legalFirstName}
                            onChange={(event) => onChange('legalFirstName', event.target.value)}
                            placeholder="First name on ID"
                            theme={theme}
                            required
                            insetLabel
                            surfaceBackground={TOUR_VISIT_FIELD_SURFACE}
                            surfaceBorder={TOUR_VISIT_SURFACE_BORDER}
                        />
                        <FormInput
                            label="Legal Last Name"
                            value={guest.legalLastName}
                            onChange={(event) => onChange('legalLastName', event.target.value)}
                            placeholder="Last name on ID"
                            theme={theme}
                            required
                            insetLabel
                            surfaceBackground={TOUR_VISIT_FIELD_SURFACE}
                            surfaceBorder={TOUR_VISIT_SURFACE_BORDER}
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

                    <div className="mt-3.5 space-y-3">
                        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
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
                                surfaceBackground={TOUR_VISIT_FIELD_SURFACE}
                                surfaceBorder={TOUR_VISIT_SURFACE_BORDER}
                            />

                            {!repAttendee ? (
                                <>
                                    <TourVisitSelectField
                                        label="T-Shirt Size"
                                        value={guest.shirtSize}
                                        onChange={(nextValue) => onChange('shirtSize', nextValue)}
                                        options={TOUR_VISIT_TSHIRT_SIZES}
                                        placeholder="Select size"
                                        theme={theme}
                                    />

                                    <TourVisitSelectField
                                        label="Dietary Restrictions"
                                        value={guest.hasDietaryRestrictions ? 'Yes' : 'No'}
                                        onChange={(nextValue) => onSetDietaryGate(nextValue === 'Yes')}
                                        options={TOUR_VISIT_YES_NO_OPTIONS}
                                        placeholder="Select option"
                                        theme={theme}
                                    />
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
                </div>
                </div>

            {footerAction ? (
                <div
                    className="mt-3 border-t pt-3"
                    style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}
                >
                    {footerAction}
                </div>
            ) : null}
        </div>
    );
};

const TourVisitSuccessOverlay = ({ theme, facilityName }) => (
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
                Visit request saved
            </p>
            <p className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                {facilityName ? `${facilityName} is ready to review.` : 'Your tour visit is ready to review.'}
            </p>
        </div>
    </div>
);

const AddAttendeeActions = ({
    theme,
    availableTeamMembers,
    showRepPicker,
    selectedTeamMemberId,
    setSelectedTeamMemberId,
    onAddGuest,
    onOpenRepPicker,
    onCloseRepPicker,
    onAddRep,
}) => {
    if (showRepPicker) {
        return (
            <div className="space-y-2.5">
                <div className="space-y-1.5">
                    <p className="px-1 text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: theme.colors.textSecondary }}>
                        Select rep
                    </p>
                    <SearchableSelect
                        value={selectedTeamMemberId}
                        onChange={setSelectedTeamMemberId}
                        options={availableTeamMembers.map((member) => ({
                            value: String(member.id),
                            label: `${member.firstName} ${member.lastName}`,
                        }))}
                        placeholder="Select rep"
                        theme={theme}
                        size="sm"
                        searchPlaceholder="Search reps"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onCloseRepPicker}
                        className="rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
                        style={{
                            color: theme.colors.textSecondary,
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onAddRep}
                        className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                        style={{
                            color: theme.colors.textPrimary,
                            backgroundColor: TOUR_VISIT_FIELD_SURFACE,
                            border: TOUR_VISIT_SURFACE_BORDER,
                        }}
                    >
                        Add rep
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 sm:flex-row">
            <button
                type="button"
                onClick={onAddGuest}
                className="flex flex-1 items-center justify-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                    color: theme.colors.textSecondary,
                    backgroundColor: TOUR_VISIT_FIELD_SURFACE,
                    border: '1px dashed rgba(0, 0, 0, 0.08)',
                }}
            >
                <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                    style={{
                        backgroundColor: theme.colors.background,
                        color: theme.colors.textPrimary,
                    }}
                >
                    <Plus className="h-3.5 w-3.5" />
                </span>
                Add guest
            </button>

            {availableTeamMembers.length ? (
                <button
                    type="button"
                    onClick={onOpenRepPicker}
                    className="flex flex-1 items-center justify-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{
                        color: theme.colors.textSecondary,
                        backgroundColor: TOUR_VISIT_FIELD_SURFACE,
                        border: '1px dashed rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                        style={{
                            backgroundColor: theme.colors.background,
                            color: theme.colors.textPrimary,
                        }}
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </span>
                    Add rep
                </button>
            ) : null}
        </div>
    );
};

export const TourVisitScreen = ({ theme, userSettings, onNavigate, setBackHandler, members = [], currentUserId }) => {
    const [entryMode, setEntryMode] = useState('home');
    const [guests, setGuests] = useState(() => [createRepGuest(userSettings)]);
    const [customerVisitTitle, setCustomerVisitTitle] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedCustomerLabel, setSelectedCustomerLabel] = useState('');
    const [customerIsNewRecord, setCustomerIsNewRecord] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [selectedFacilityId, setSelectedFacilityId] = useState('');
    const [showFacilityOptions, setShowFacilityOptions] = useState(true);
    const [expandedUpcomingVisitId, setExpandedUpcomingVisitId] = useState(() => TOUR_VISIT_UPCOMING_VISITS[0]?.id || null);
    const [experienceSelections, setExperienceSelections] = useState(() => buildDefaultExperienceSelections());
    const [showExperienceError, setShowExperienceError] = useState(false);
    const [shareContact, setShareContact] = useState('');
    const [shareFeedback, setShareFeedback] = useState('');
    const [expandedGuestId, setExpandedGuestId] = useState(null);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [showRepPicker, setShowRepPicker] = useState(false);
    const [selectedTeamMemberId, setSelectedTeamMemberId] = useState('');
    const formRef = useRef(null);
    const hasInitializedExpandedGuestRef = useRef(false);
    const hasHydratedShareParamsRef = useRef(false);
    const successOverlayTimeoutRef = useRef(null);
    const navigationTimeoutRef = useRef(null);

    const selectedFacility = useMemo(
        () => TOUR_VISIT_FACILITIES.find((facility) => facility.id === selectedFacilityId) || null,
        [selectedFacilityId]
    );

    const customerDirectoryOptions = useMemo(() => {
        const dealerOptions = DEALER_DIRECTORY_DATA.map((dealer) => ({
            value: `dealer-${dealer.id}`,
            label: `${dealer.name} (Dealer)`,
        }));

        const designerOptions = DEALER_DIRECTORY_DATA.flatMap((dealer) =>
            (dealer.designers || []).map((designer) => ({
                value: `designer-${dealer.id}-${designer.name}`,
                label: `${designer.name} - ${dealer.name} (Designer)`,
            }))
        );

        const memberOptions = members
            .filter((member) => member?.firstName || member?.lastName)
            .map((member) => ({
                value: `member-${member.id}`,
                label: `${member.firstName || ''} ${member.lastName || ''}`.trim() + ' (Internal)',
            }));

        const deduped = new Map();
        [...dealerOptions, ...designerOptions, ...memberOptions].forEach((option) => {
            if (!deduped.has(option.label)) deduped.set(option.label, option);
        });

        return Array.from(deduped.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [members]);

    const upcomingVisits = TOUR_VISIT_UPCOMING_VISITS;
    const selectedExperienceCount = useMemo(
        () => Object.values(experienceSelections).reduce((total, options) => total + options.length, 0),
        [experienceSelections]
    );

    const hasExperienceSelectionInEveryTrack = useMemo(
        () => TOUR_VISIT_EXPERIENCE_TRACKS.every((track) => (experienceSelections[track.id] || []).length > 0),
        [experienceSelections]
    );

    const activeShareFacilityId = selectedFacilityId || 'jasper';
    const activeShareLink = useMemo(() => {
        const origin = globalThis.location?.origin || 'https://portal.jsi.com';
        return `${origin}/resources/tour-visit?intake=1&facility=${encodeURIComponent(activeShareFacilityId)}`;
    }, [activeShareFacilityId]);

    const resetTourVisitFlow = useCallback(() => {
        setEntryMode('home');
        setGuests([createRepGuest(userSettings)]);
        setCustomerVisitTitle('');
        setSelectedCustomerId('');
        setSelectedCustomerLabel('');
        setCustomerIsNewRecord(false);
        setCustomerSearchQuery('');
        setSelectedFacilityId('');
        setShowFacilityOptions(true);
        setExpandedUpcomingVisitId(TOUR_VISIT_UPCOMING_VISITS[0]?.id || null);
        setExperienceSelections(buildDefaultExperienceSelections());
        setShowExperienceError(false);
        setShareContact('');
        setShareFeedback('');
        setExpandedGuestId(null);
        setSubmitAttempted(false);
        setFormMessage('');
        setShowSuccessOverlay(false);
        setShowRepPicker(false);
        setSelectedTeamMemberId('');
        hasInitializedExpandedGuestRef.current = false;

        if (successOverlayTimeoutRef.current) {
            clearTimeout(successOverlayTimeoutRef.current);
            successOverlayTimeoutRef.current = null;
        }

        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
        }
    }, [userSettings]);

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
        if (hasHydratedShareParamsRef.current) return;
        hasHydratedShareParamsRef.current = true;

        const search = globalThis.location?.search || '';
        const params = new URLSearchParams(search);
        const linkedFacilityId = params.get('facility');
        if (!linkedFacilityId) return;

        if (TOUR_VISIT_FACILITIES.some((facility) => facility.id === linkedFacilityId)) {
            setEntryMode('new');
            setSelectedFacilityId(linkedFacilityId);
            setShowFacilityOptions(false);
        }
    }, []);

    useEffect(() => {
        if (!selectedFacilityId || !formRef.current) return;
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [selectedFacilityId]);

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

    const updateGuest = (guestId, field, value) => {
        setGuests((currentGuests) =>
            currentGuests.map((guest) =>
                guest.id === guestId
                    ? {
                        ...guest,
                        [field]: value,
                    }
                    : guest
            )
        );
    };

    const setDietaryGate = (guestId, hasDietaryRestrictions) => {
        setGuests((currentGuests) =>
            currentGuests.map((guest) => {
                if (guest.id !== guestId) return guest;

                if (hasDietaryRestrictions) {
                    return {
                        ...guest,
                        hasDietaryRestrictions: true,
                    };
                }

                return {
                    ...guest,
                    hasDietaryRestrictions: false,
                    dietaryRestrictions: [],
                    dietaryRestrictionsOther: '',
                };
            })
        );
    };

    const handleFacilitySelect = (facilityId) => {
        hapticLight();
        setSelectedFacilityId(facilityId);
        setShowFacilityOptions(false);
        setShareFeedback('');
        setFormMessage('');
    };

    const openNewTourFlow = () => {
        hapticLight();
        setEntryMode('new');
        setFormMessage('');
    };

    const openUpcomingVisitsFlow = () => {
        hapticLight();
        setEntryMode('upcoming');
        setFormMessage('');
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

        if (!customerVisitTitle.trim() && selectedOption?.label) {
            const baseTitle = selectedOption.label.replace(/\s*\((Dealer|Designer|Internal)\)$/, '');
            setCustomerVisitTitle(`${baseTitle} Visit`);
        }
    };

    const handleAddNewCustomerRecord = () => {
        const nextLabel = customerSearchQuery.trim();
        if (!nextLabel) return;

        const newRecordId = buildNewCustomerId(nextLabel);
        setSelectedCustomerId(newRecordId);
        setSelectedCustomerLabel(nextLabel);
        setCustomerIsNewRecord(true);

        if (!customerVisitTitle.trim()) {
            setCustomerVisitTitle(`${nextLabel} Visit`);
        }

        setFormMessage('');
        hapticLight();
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

    const handleCopyShareLink = async () => {
        if (!globalThis.navigator?.clipboard?.writeText) {
            setShareFeedback('Copy is not available in this browser.');
            return;
        }

        try {
            await globalThis.navigator.clipboard.writeText(activeShareLink);
            setShareFeedback('Share link copied.');
            hapticLight();
        } catch {
            setShareFeedback('Could not copy the link.');
        }
    };

    const handleEmailShare = () => {
        const subject = selectedFacility
            ? `Tour intake form for ${selectedFacility.name}`
            : 'Tour intake form';
        const body = `Please complete this tour intake form:${'\n\n'}${activeShareLink}`;
        globalThis.open(`mailto:${shareContact.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
        setShareFeedback('Email draft opened.');
    };

    const handleTextShare = () => {
        const message = `Please complete this tour intake form: ${activeShareLink}`;
        globalThis.open(`sms:${shareContact.trim()}?body=${encodeURIComponent(message)}`, '_self');
        setShareFeedback('Text message draft opened.');
    };

    const handleNativeShare = async () => {
        if (!globalThis.navigator?.share) {
            setShareFeedback('Native sharing is not available in this browser.');
            return;
        }

        try {
            await globalThis.navigator.share({
                title: 'Tour Intake Form',
                text: 'Please complete this tour intake form.',
                url: activeShareLink,
            });
            setShareFeedback('Share sheet opened.');
        } catch {
            setShareFeedback('Share was canceled.');
        }
    };

    const handleAddGuest = () => {
        hapticLight();
        const nextGuest = createTourGuest();
        setGuests((currentGuests) => [...currentGuests, nextGuest]);
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
            setSelectedTeamMemberId('');
            setShowRepPicker(false);
            return;
        }

        if (!availableTeamMembers.some((member) => String(member.id) === selectedTeamMemberId)) {
            setSelectedTeamMemberId(String(availableTeamMembers[0].id));
        }
    }, [availableTeamMembers, selectedTeamMemberId]);

    const handleAddTeamMember = () => {
        const teamMember = members.find((member) => String(member.id) === selectedTeamMemberId);
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

    const closeRepPicker = () => {
        setShowRepPicker(false);
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

        if (!customerVisitTitle.trim()) {
            setFormMessage('Add a customer visit title before continuing.');
            hapticWarning();
            return;
        }

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

        if (!hasExperienceSelectionInEveryTrack) {
            setShowExperienceError(true);
            setFormMessage('Choose at least one option in each experience track before submitting.');
            hapticWarning();
            return;
        }

        setFormMessage('');
        hapticSuccess();
        setShowSuccessOverlay(true);

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
            onNavigate?.('resources');
        }, 1500);
    };

    const addAttendeeActions = (
        <AddAttendeeActions
            theme={theme}
            availableTeamMembers={availableTeamMembers}
            showRepPicker={showRepPicker}
            selectedTeamMemberId={selectedTeamMemberId}
            setSelectedTeamMemberId={setSelectedTeamMemberId}
            onAddGuest={handleAddGuest}
            onOpenRepPicker={openRepPicker}
            onCloseRepPicker={closeRepPicker}
            onAddRep={handleAddTeamMember}
        />
    );

    return (
        <div className="screen-container app-header-offset relative" style={{ backgroundColor: theme.colors.background }}>
            <div className="screen-content-area">
                <div className="screen-content-inner pt-4 md:pt-5">
                    <div className="mx-auto w-full max-w-[760px] space-y-3">
                        {entryMode === 'home' ? (
                            <GlassCard theme={theme} className="p-5 md:p-6">
                                <p className="text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                                    Tour planning
                                </p>
                                <h1 className="mt-1 text-[28px] font-semibold leading-none" style={{ color: theme.colors.textPrimary }}>
                                    Tour a Facility
                                </h1>
                                <p className="mt-3 text-sm leading-6" style={{ color: theme.colors.textSecondary }}>
                                    Choose a new factory tour request or review upcoming visits that are already filled out.
                                </p>

                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <EntryChoiceCard
                                        title="Select a Tour Factory Experience"
                                        description="Start a new request and build the itinerary with guests and experiences."
                                        onClick={openNewTourFlow}
                                        theme={theme}
                                    />
                                    <EntryChoiceCard
                                        title="See Upcoming Visits"
                                        description="View visits already submitted and open any route to review the agenda."
                                        onClick={openUpcomingVisitsFlow}
                                        theme={theme}
                                    />
                                </div>
                            </GlassCard>
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
                                    Start new tour request
                                </button>
                            </>
                        ) : null}

                        {entryMode === 'new' ? (
                            <>
                                <GlassCard theme={theme} className="p-5 md:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                                                New tour request
                                            </p>
                                            <h2 className="mt-1 text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                Customer Visit Details
                                            </h2>
                                        </div>
                                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{
                                            color: theme.colors.accent,
                                            backgroundColor: theme.colors.accent + '12',
                                            border: `1px solid ${theme.colors.accent}33`,
                                        }}>
                                            <Sparkles className="h-5 w-5" />
                                        </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                                        <FormInput
                                            label="Customer Visit Title"
                                            value={customerVisitTitle}
                                            onChange={(event) => setCustomerVisitTitle(event.target.value)}
                                            placeholder="Ex: North Star Health Group Strategy Visit"
                                            theme={theme}
                                            required
                                            insetLabel
                                            softChrome
                                            surfaceBackground={TOUR_VISIT_FIELD_SURFACE}
                                            surfaceBorder={TOUR_VISIT_SURFACE_BORDER}
                                        />

                                        <div className="relative">
                                            <label
                                                className="pointer-events-none absolute left-4 top-2 z-[1] text-[11px] font-medium leading-none"
                                                style={{ color: theme.colors.textSecondary }}
                                            >
                                                Customer (Dealer / Designer)
                                            </label>
                                            <SearchableSelect
                                                value={selectedCustomerId}
                                                onChange={handleCustomerSelection}
                                                options={customerDirectoryOptions}
                                                placeholder="Search dealer or designer"
                                                theme={theme}
                                                size="sm"
                                                searchPlaceholder="Spotlight search dealers and designers"
                                                onMissingAction={handleAddNewCustomerRecord}
                                                missingActionLabel={customerSearchQuery.trim() ? `Add "${customerSearchQuery.trim()}" as new` : 'Add new customer'}
                                                onQueryChange={setCustomerSearchQuery}
                                                buttonClassName="!h-[56px] !rounded-[16px] !px-4 !pr-11 !pb-[6px] !pt-[18px] !text-sm"
                                                buttonStyle={{
                                                    backgroundColor: TOUR_VISIT_FIELD_SURFACE,
                                                    border: TOUR_VISIT_SURFACE_BORDER,
                                                    color: selectedCustomerId ? theme.colors.textPrimary : theme.colors.textSecondary,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {customerIsNewRecord ? (
                                        <p className="mt-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                                            This customer will be captured as a new backend record when submitted.
                                        </p>
                                    ) : null}
                                </GlassCard>

                                {selectedFacility && !showFacilityOptions ? (
                                    <SelectedFacilityCard
                                        facility={selectedFacility}
                                        theme={theme}
                                        onChange={() => setShowFacilityOptions(true)}
                                    />
                                ) : (
                                    <GlassCard theme={theme} className="p-5 md:p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Building2 className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
                                            <p style={{ ...sectionLabelStyle, color: theme.colors.textSecondary }}>Tour a Facility</p>
                                        </div>

                                        <div className="space-y-3">
                                            {TOUR_VISIT_FACILITIES.map((facility) => (
                                                <FacilityOption
                                                    key={facility.id}
                                                    facility={facility}
                                                    selected={selectedFacilityId === facility.id}
                                                    onClick={() => handleFacilitySelect(facility.id)}
                                                    theme={theme}
                                                />
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}

                                <GlassCard theme={theme} className="p-5 md:p-6">
                                    <div className="flex items-center gap-2">
                                        <Send className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
                                        <p style={{ ...sectionLabelStyle, color: theme.colors.textSecondary }}>Share Intake Form</p>
                                    </div>

                                    <p className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                                        Send this form to a contact so they can fill details directly.
                                    </p>

                                    <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                                        <FormInput
                                            label="Contact Email or Mobile"
                                            value={shareContact}
                                            onChange={(event) => setShareContact(event.target.value)}
                                            placeholder="name@dealer.com or 555-123-4567"
                                            theme={theme}
                                            insetLabel
                                            softChrome
                                            surfaceBackground={TOUR_VISIT_FIELD_SURFACE}
                                            surfaceBorder={TOUR_VISIT_SURFACE_BORDER}
                                        />

                                        <div className="relative rounded-[16px] px-3.5 pt-7 pb-2.5" style={{
                                            backgroundColor: TOUR_VISIT_FIELD_SURFACE,
                                            border: TOUR_VISIT_SURFACE_BORDER,
                                        }}>
                                            <span className="pointer-events-none absolute left-3.5 top-2 text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
                                                Share Link
                                            </span>
                                            <p className="truncate text-sm" style={{ color: theme.colors.textPrimary }}>{activeShareLink}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <ShareActionButton icon={Copy} label="Copy Link" onClick={handleCopyShareLink} theme={theme} />
                                        <ShareActionButton icon={Mail} label="Email" onClick={handleEmailShare} disabled={!shareContact.trim()} theme={theme} />
                                        <ShareActionButton icon={MessageSquare} label="Text" onClick={handleTextShare} disabled={!shareContact.trim()} theme={theme} />
                                        <ShareActionButton icon={Send} label="Share" onClick={handleNativeShare} theme={theme} />
                                    </div>

                                    {shareFeedback ? (
                                        <p className="mt-3 text-xs" style={{ color: theme.colors.textSecondary }}>{shareFeedback}</p>
                                    ) : null}
                                </GlassCard>
                            </>
                        ) : null}

                        {entryMode === 'new' && selectedFacility ? (
                            <div ref={formRef} className="space-y-3 animate-fade-in">
                                <GlassCard theme={theme} className="p-5 md:p-6">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <p style={{ ...sectionLabelStyle, color: theme.colors.textSecondary }}>Experience Plan</p>
                                            <p className="mt-2 text-sm leading-6" style={{ color: theme.colors.textSecondary }}>
                                                Select the visit experiences you want included in this hosted itinerary.
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium" style={{
                                            color: theme.colors.textSecondary,
                                            backgroundColor: theme.colors.subtle,
                                            border: TOUR_VISIT_SURFACE_BORDER,
                                        }}>
                                            {selectedExperienceCount} options selected
                                        </span>
                                    </div>

                                    <div className="mt-3 rounded-[16px] px-4 py-3" style={{
                                        backgroundColor: TOUR_VISIT_FIELD_SURFACE,
                                        border: TOUR_VISIT_SURFACE_BORDER,
                                    }}>
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: theme.colors.textSecondary }}>
                                            Non-negotiable sessions
                                        </p>
                                        <ul className="mt-2 space-y-1.5 text-sm" style={{ color: theme.colors.textPrimary }}>
                                            {TOUR_VISIT_NON_NEGOTIABLE_SESSIONS.map((session) => (
                                                <li key={session} className="flex items-start gap-2">
                                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: theme.colors.accent }} />
                                                    <span>{session}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                                        {TOUR_VISIT_EXPERIENCE_TRACKS.map((track) => (
                                            <ExperienceTrackCard
                                                key={track.id}
                                                track={track}
                                                selectedOptions={experienceSelections[track.id] || []}
                                                onToggleOption={toggleExperienceOption}
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
                                </GlassCard>

                                <div className="space-y-3 px-1">
                                    <div className="flex flex-col items-start gap-2">
                                        <div>
                                            <p className="text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                                                Attendees
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="overflow-hidden rounded-[22px]"
                                        style={{
                                            backgroundColor: TOUR_VISIT_PANEL_SURFACE_COLLAPSED,
                                            border: '1px solid rgba(0, 0, 0, 0.04)',
                                        }}
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
                                                    attendeeNumber={index + 1}
                                                    guestIndex={guest.isSelf ? 0 : displayGuestIndex}
                                                    expanded={expandedGuestId === guest.id}
                                                    theme={theme}
                                                    embedded
                                                    isFirst={index === 0}
                                                    footerAction={isLastGuest ? addAttendeeActions : null}
                                                    submitAttempted={submitAttempted}
                                                    onToggleExpanded={() => setExpandedGuestId((current) => (current === guest.id ? null : guest.id))}
                                                    onCollapse={() => setExpandedGuestId((current) => (current === guest.id ? null : current))}
                                                    onChange={(field, value) => updateGuest(guest.id, field, value)}
                                                    onSetDietaryGate={(value) => setDietaryGate(guest.id, value)}
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

                                <GlassCard theme={theme} className="p-5 md:p-6">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p style={{ ...sectionLabelStyle, color: theme.colors.textSecondary }}>Review & Submit</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                                                <span>{customerVisitTitle || 'Untitled visit'}</span>
                                                <span>•</span>
                                                <span>{selectedCustomerLabel || 'No customer selected'}</span>
                                                <span>•</span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    {selectedFacility.name}
                                                </span>
                                                <span>•</span>
                                                <span>{completedGuestCount}/{guests.length || 0} ready</span>
                                                <span>•</span>
                                                <span>{selectedExperienceCount} experiences selected</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="rounded-full px-5 py-3 text-sm font-semibold transition-all motion-tap"
                                            style={{
                                                color: theme.colors.accentText,
                                                backgroundColor: theme.colors.accent,
                                                border: `1px solid ${theme.colors.accent}`,
                                                boxShadow: 'none',
                                            }}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                Submit request
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        </button>
                                    </div>

                                    {formMessage ? (
                                        <div
                                            className="mt-4 rounded-2xl px-4 py-3 text-sm"
                                            style={{
                                                backgroundColor: theme.colors.errorLight,
                                                color: theme.colors.error,
                                                border: `1px solid ${theme.colors.destructiveBorder}`,
                                            }}
                                        >
                                            {formMessage}
                                        </div>
                                    ) : null}
                                </GlassCard>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {showSuccessOverlay ? (
                <TourVisitSuccessOverlay theme={theme} facilityName={selectedFacility?.name} />
            ) : null}
        </div>
    );
};
