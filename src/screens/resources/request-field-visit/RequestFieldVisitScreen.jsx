import React, { useState, useMemo, useRef, useCallback } from 'react';
import { AppScreenLayout } from '../../../components/common/AppScreenLayout.jsx';
import { FloatingSubmitCTA } from '../../../components/common/FloatingSubmitCTA.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import SwipeCalendar from '../../../components/common/SwipeCalendar.jsx';
import { MapPin, Calendar, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FIELD_VISIT_REQUIREMENTS } from './data.js';
import { hapticSuccess } from '../../../utils/haptics.js';

export const RequestFieldVisitScreen = ({ theme, setSuccessMessage, onNavigate }) => {
    // Calendar state
    const [selectedDate, setSelectedDate] = useState(null);
    
    // Form state
    const [soNumber, setSoNumber] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);

    // Two weeks out boundary
    const twoWeeksFromNow = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + (FIELD_VISIT_REQUIREMENTS.minAdvanceWeeks * 7));
        return d;
    }, []);

    // Is a date disabled?
    const isDateDisabled = useCallback((date) => {
        const dow = date.getDay();
        return date < twoWeeksFromNow || !FIELD_VISIT_REQUIREMENTS.allowedDays.includes(dow);
    }, [twoWeeksFromNow]);

    // Render green dot for available dates
    const renderDayExtra = useCallback((date) => {
        if (isDateDisabled(date)) return null;
        const sel = selectedDate?.toDateString() === date.toDateString();
        if (sel) return null;
        return <span className="h-1 w-1 rounded-full mt-0.5" style={{ backgroundColor: '#10b981' }} />;
    }, [isDateDisabled, selectedDate]);

    // File input change
    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).slice(0, FIELD_VISIT_REQUIREMENTS.maxPhotos - photos.length);
            setPhotos(prev => [...prev, ...newFiles]);
        }
    };

    const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));
    const canSubmit = !!(
        selectedDate &&
        soNumber.trim() &&
        address.trim() &&
        notes.trim() &&
        photos.length
    );

    // Submission
    const handleSubmit = () => {
        if (canSubmit) {
            hapticSuccess();
            setSuccessMessage('Field visit requested!');
            setTimeout(() => {
                setSuccessMessage('');
                if (onNavigate) {
                    onNavigate('resources');
                }
            }, 1500);
        } else {
            alert('Please fill out all fields and add at least one photo.');
        }
    };

    return (
        <AppScreenLayout
            theme={theme}
            title="Request Field Visit"
            subtitle="Schedule an on-site visit and include issue photos for review."
            maxWidthClass="max-w-3xl"
            horizontalPaddingClass="px-4"
            contentPaddingBottomClass="pb-28"
            contentClassName="py-4 space-y-4"
            footer={(
                <FloatingSubmitCTA
                    theme={theme}
                    onClick={handleSubmit}
                    visible={!!selectedDate}
                    disabled={!canSubmit}
                    label="Submit Field Visit Request"
                />
            )}
        >
                    {/* Info Card */}
                    <GlassCard theme={theme} className="p-4">
                        <div className="flex items-start space-x-3">
                            <MapPin className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
                            <div>
                                <h3 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                    Schedule a Field Visit
                                </h3>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    Select a date and provide details for your field visit request. 
                                    Field visits must be scheduled at least {FIELD_VISIT_REQUIREMENTS.minAdvanceWeeks} weeks in advance.
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Calendar */}
                    <GlassCard theme={theme} className="overflow-hidden">
                        <SwipeCalendar
                            theme={theme}
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            isDisabled={isDateDisabled}
                            renderDayExtra={renderDayExtra}
                        />
                        {/* Legend */}
                        <div className="px-4 pb-3 pt-1 text-xs" style={{ color: theme.colors.textSecondary }}>
                            <p>Available dates are at least {FIELD_VISIT_REQUIREMENTS.minAdvanceWeeks} weeks out and on weekdays</p>
                        </div>
                    </GlassCard>

                    {/* Visit Details Form */}
                    {selectedDate && (
                        <div className="animate-fade-in space-y-4">
                            <GlassCard theme={theme} className="p-4 space-y-4">
                                <div className="text-center">
                                    <h3 className="font-bold text-lg mb-1" style={{ color: theme.colors.textPrimary }}>
                                        Visit Details
                                    </h3>
                                    <p className="text-sm" style={{ color: theme.colors.accent }}>
                                        {selectedDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <FormInput
                                    label="Sales Order Number"
                                    value={soNumber}
                                    onChange={e => setSoNumber(e.target.value)}
                                    placeholder="Enter SO#"
                                    theme={theme}
                                    required
                                />

                                <FormInput
                                    label="Visit Address"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Enter full address including city, state, zip"
                                    theme={theme}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
                                        Issue Details *
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border text-sm"
                                        style={{
                                            backgroundColor: theme.colors.surface,
                                            border: `1px solid ${theme.colors.border}`,
                                            color: theme.colors.textPrimary
                                        }}
                                        rows="3"
                                        placeholder="Describe what went wrong, what assistance is needed, or specific issues to address during the visit..."
                                        required
                                    />
                                </div>

                                {/* Photo Upload Section */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                                        Photos * (At least one required, max {FIELD_VISIT_REQUIREMENTS.maxPhotos})
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {photos.map((file, idx) => (
                                            <div key={idx} className="relative aspect-square">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${idx + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => removePhoto(idx)}
                                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {photos.length < FIELD_VISIT_REQUIREMENTS.maxPhotos && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 dark:hover:bg-white/5"
                                                style={{ 
                                                    borderColor: theme.colors.border, 
                                                    color: theme.colors.textSecondary 
                                                }}
                                            >
                                                <Camera className="w-6 h-6 mb-1" />
                                                <span className="text-xs font-semibold">Add Photo</span>
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        multiple
                                        accept={FIELD_VISIT_REQUIREMENTS.acceptedPhotoTypes.join(',')}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <p className="text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
                                        Upload photos showing the issue or area requiring attention
                                    </p>
                                </div>
                            </GlassCard>
                        </div>
                    )}
        </AppScreenLayout>
    );
};