import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { FormInput } from '../../components/common/FormComponents.jsx';
import { X, ImageIcon, Upload } from 'lucide-react';
import { INSTALLATION_CONSTANTS, FORM_VALIDATION } from './installation-data.js';
import { hapticSuccess } from '../../utils/haptics.js';
import { isDarkTheme } from '../../design-system/tokens.js';

export const AddNewInstallScreen = ({ theme, onAddInstall }) => {
    const [projectName, setProjectName] = useState('');
    const [location, setLocation] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const autocompleteService = useRef(null);
    const locationFieldRef = useRef(null);
    const isDark = isDarkTheme(theme);

    const photoPreviewUrls = useMemo(
        () => photos.map(file => URL.createObjectURL(file)),
        [photos]
    );

    useEffect(() => {
        return () => {
            photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [photoPreviewUrls]);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationFieldRef.current && !locationFieldRef.current.contains(event.target)) {
                setShowPredictions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLocationChange = useCallback((e) => {
        const value = e.target.value;
        setLocation(value);
        
        if (autocompleteService.current && value && INSTALLATION_CONSTANTS.LOCATION_VALIDATION.requiresGooglePlaces) {
            autocompleteService.current.getPlacePredictions({
                input: value,
                types: ['(cities)']
            }, (preds) => {
                setPredictions(preds || []);
                setShowPredictions(true);
            });
        } else {
            setPredictions([]);
            setShowPredictions(false);
        }
    }, []);

    const handleSelectPrediction = useCallback((prediction) => {
        setLocation(prediction.description);
        setPredictions([]);
        setShowPredictions(false);
    }, []);

    const handleFileChange = useCallback((e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            
            // Validate file types and sizes
            const validFiles = newFiles.filter(file => {
                const isValidFormat = INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.acceptedFormats.includes(file.type);
                const isValidSize = file.size <= INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxFileSize;
                return isValidFormat && isValidSize;
            });

            // Check total photo count
            const totalPhotos = photos.length + validFiles.length;
            if (totalPhotos <= INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxPhotos) {
                setPhotos(p => [...p, ...validFiles]);
            } else {
                alert(`Maximum ${INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxPhotos} photos allowed.`);
            }
        }
        e.target.value = '';
    }, [photos.length]);

    const removePhoto = useCallback((photoIndex) => {
        setPhotos(p => p.filter((_, idx) => idx !== photoIndex));
    }, []);

    const validateForm = useCallback(() => {
        // Validate project name
        if (!projectName || 
            projectName.length < FORM_VALIDATION.projectName.minLength || 
            projectName.length > FORM_VALIDATION.projectName.maxLength) {
            return 'Project name must be between 3-100 characters.';
        }

        // Validate location
        if (!location || 
            location.length < FORM_VALIDATION.location.minLength || 
            location.length > FORM_VALIDATION.location.maxLength) {
            return 'Location must be between 5-200 characters.';
        }

        // Validate photos
        if (photos.length < FORM_VALIDATION.photos.minCount) {
            return 'At least one photo is required.';
        }

        return null;
    }, [projectName, location, photos.length]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            alert(validationError);
            return;
        }

        const newInstall = {
            name: projectName,
            location: location,
            image: URL.createObjectURL(photos[0]),
            photoCount: photos.length,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        hapticSuccess();
        onAddInstall(newInstall);
    }, [projectName, location, photos, validateForm, onAddInstall]);

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
                        <GlassCard theme={theme} className="lg:col-span-5 p-5 sm:p-6 space-y-5">
                            <div>
                                <h2 className="text-[18px] font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>Install Details</h2>
                            </div>
                            <FormInput
                                label="Project Name"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g., Acme Corp HQ"
                                theme={theme}
                                required
                            />
                            <div ref={locationFieldRef} className="relative">
                                <FormInput
                                    label="Location"
                                    value={location}
                                    onChange={handleLocationChange}
                                    placeholder="e.g., Jasper, IN"
                                    theme={theme}
                                    required
                                />
                                {showPredictions && predictions.length > 0 && (
                                    <div
                                        className="absolute left-0 right-0 mt-1.5 z-20 rounded-2xl border p-1.5 max-h-52 overflow-y-auto scrollbar-hide"
                                        style={{
                                            backgroundColor: theme.colors.surface,
                                            borderColor: theme.colors.border,
                                            boxShadow: '0 10px 22px rgba(0,0,0,0.10)',
                                        }}
                                    >
                                        {predictions.map(p => (
                                            <button
                                                key={p.place_id}
                                                type="button"
                                                onClick={() => handleSelectPrediction(p)}
                                                className="block w-full text-left px-3 py-2 rounded-xl transition-colors"
                                                style={{ color: theme.colors.textPrimary }}
                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                            >
                                                {p.description}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard theme={theme} className="lg:col-span-7 p-5 sm:p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>
                                    Photos <span style={{ color: '#B85C5C' }}>*</span>
                                </label>
                                <span className="text-[12px] font-semibold tabular-nums" style={{ color: theme.colors.textSecondary }}>
                                    {photos.length}/{INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxPhotos}
                                </span>
                            </div>

                            {photoPreviewUrls.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full min-h-[220px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors motion-tap"
                                    style={{
                                        borderColor: theme.colors.border,
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.colors.subtle,
                                        color: theme.colors.textSecondary,
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}>
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold text-[14px]" style={{ color: theme.colors.textPrimary }}>Add Photos</span>
                                    <span className="text-[12px]" style={{ color: theme.colors.textSecondary }}>
                                        Upload one or more install photos
                                    </span>
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {photoPreviewUrls.map((url, idx) => (
                                        <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border" style={{ borderColor: theme.colors.border }}>
                                            <img
                                                src={url}
                                                alt={`preview-${idx}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(idx)}
                                                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-transform motion-tap"
                                                style={{ backgroundColor: 'rgba(24,24,24,0.68)', color: '#fff' }}
                                                aria-label={`Remove photo ${idx + 1}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {photos.length < INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxPhotos && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors motion-tap"
                                            style={{
                                                borderColor: theme.colors.border,
                                                color: theme.colors.textSecondary,
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.colors.subtle,
                                            }}
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                            <span className="text-[12px] font-semibold">Add</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                accept={INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.acceptedFormats.join(',')}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </GlassCard>
                    </div>

                    <div className="sticky mt-5 flex justify-center" style={{ bottom: 'clamp(0.75rem, 2.5vh, 1.5rem)' }}>
                        <button
                            type="submit"
                            className="w-full max-w-xl font-bold text-[14px] h-12 px-7 rounded-full transition-all motion-tap"
                            style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                        >
                            Upload Install Photo(s)
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};
