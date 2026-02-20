import React, { useState, useMemo, useRef } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { MapPin, Calendar, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FIELD_VISIT_REQUIREMENTS } from './data.js';
import { hapticSuccess } from '../../../utils/haptics.js';

export const RequestFieldVisitScreen = ({ theme, setSuccessMessage, onNavigate }) => {
    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());
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

    // Handle picking a date (only weekdays ? two weeks away)
    const handleDateClick = (day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const clicked = new Date(year, month, day);
        const dow = clicked.getDay();
        if (clicked >= twoWeeksFromNow && FIELD_VISIT_REQUIREMENTS.allowedDays.includes(dow)) {
            setSelectedDate(clicked);
        }
    };

    // File input change
    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).slice(0, FIELD_VISIT_REQUIREMENTS.maxPhotos - photos.length);
            setPhotos(prev => [...prev, ...newFiles]);
        }
    };

    const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

    // Submission
    const handleSubmit = () => {
        if (selectedDate && soNumber && address && notes && photos.length) {
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

    // Render the month calendar
    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const numDays = new Date(year, month + 1, 0).getDate();

        const blanks = Array(firstDay).fill(null);
        const days = Array.from({ length: numDays }, (_, i) => i + 1);

        return (
            <GlassCard theme={theme} className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <button 
                        onClick={() => setCurrentDate(new Date(year, month - 1, 1))} 
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        <ChevronLeft className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button 
                        onClick={() => setCurrentDate(new Date(year, month + 1, 1))} 
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        <ChevronRight className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>
                
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {blanks.map((_, i) => <div key={`blank-${i}`} className="h-10" />)}
                    {days.map(day => {
                        const date = new Date(year, month, day);
                        const dow = date.getDay();
                        const isAvailable = date >= twoWeeksFromNow && FIELD_VISIT_REQUIREMENTS.allowedDays.includes(dow);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        
                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                disabled={!isAvailable}
                                className={`relative h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                                    isSelected 
                                        ? 'ring-2 ring-offset-2 scale-110' 
                                        : isAvailable 
                                            ? 'hover:bg-black/5 dark:hover:bg-white/5' 
                                            : 'opacity-40 cursor-not-allowed'
                                }`}
                                style={{
                                    ringColor: isSelected ? theme.colors.accent : 'transparent',
                                    backgroundColor: isSelected ? theme.colors.accent : 'transparent',
                                    color: isSelected ? '#fff' : theme.colors.textPrimary,
                                }}
                            >
                                {day}
                                {!isSelected && isAvailable && (
                                    <span 
                                        className="absolute bottom-1 h-1 w-1 rounded-full" 
                                        style={{ backgroundColor: '#10b981' }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
                
                {/* Legend */}
                <div className="mt-4 text-xs" style={{ color: theme.colors.textSecondary }}>
                    <p>� Available dates are at least {FIELD_VISIT_REQUIREMENTS.minAdvanceWeeks} weeks out and on weekdays</p>
                    <p>� Green dot indicates available dates</p>
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="flex flex-col h-full app-header-offset">
            <PageTitle title="Request Field Visit" theme={theme} />

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 py-4 space-y-4">
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
                    {renderCalendar()}

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
                                                className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
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

                                <button
                                    onClick={handleSubmit}
                                    className="w-full font-bold py-3 px-6 rounded-lg transition-colors"
                                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                                >
                                    Submit Field Visit Request
                                </button>
                            </GlassCard>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};