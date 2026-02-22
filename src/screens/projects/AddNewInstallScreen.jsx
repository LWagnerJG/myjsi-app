import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { FormInput } from '../../components/common/FormComponents.jsx';
import { X, ImageIcon } from 'lucide-react';
import { INSTALLATION_CONSTANTS, FORM_VALIDATION } from './installation-data.js';

export const AddNewInstallScreen = ({ theme, onAddInstall }) => {
    const [projectName, setProjectName] = useState('');
    const [location, setLocation] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const autocompleteService = useRef(null);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
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
        
        onAddInstall(newInstall);
    }, [projectName, location, photos, validateForm, onAddInstall]);

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <PageTitle title="Add New Install" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-4 space-y-4">
                    <FormInput
                        label="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g., Acme Corp HQ"
                        theme={theme}
                        required
                    />
                    <div className="relative">
                        <FormInput
                            label="Location"
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="e.g., Jasper, IN"
                            theme={theme}
                            required
                        />
                        {showPredictions && predictions.length > 0 && (
                            <GlassCard theme={theme} className="absolute w-full mt-1 z-10 p-1">
                                {predictions.map(p => (
                                    <button
                                        key={p.place_id}
                                        type="button"
                                        onClick={() => handleSelectPrediction(p)}
                                        className="block w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 transform active:scale-95"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        {p.description}
                                    </button>
                                ))}
                            </GlassCard>
                        )}
                    </div>
                    
                    {/* Photo Upload Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                            Photos <span style={{ color: '#B85C5C' }}>*</span>
                            <span className="text-xs ml-2">
                                ({photos.length}/{INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxPhotos})
                            </span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {photos.map((file, idx) => (
                                <div key={idx} className="relative aspect-square">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={`preview-${idx}`} 
                                        className="w-full h-full object-cover rounded-xl shadow-md" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removePhoto(idx)} 
                                        className="absolute -top-1 -right-1 rounded-full p-0.5 transition-all duration-200 transform active:scale-90"
                                        style={{ backgroundColor: '#B85C5C', color: 'white' }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={photos.length >= INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.maxPhotos}
                            className="w-full flex items-center justify-center space-x-2 py-3 rounded-full transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                        >
                            <ImageIcon className="w-5 h-5" />
                            <span className="font-semibold">Add Photo</span>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            multiple 
                            accept={INSTALLATION_CONSTANTS.PHOTO_REQUIREMENTS.acceptedFormats.join(',')}
                            className="hidden" 
                            onChange={handleFileChange} 
                        />
                    </div>
                </GlassCard>
                <div className="pt-2">
                    <button 
                        type="submit" 
                        className="w-full font-bold py-3.5 px-6 rounded-full transition-all duration-200 transform active:scale-95" 
                        style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                    >
                        Submit Install
                    </button>
                </div>
            </div>
        </form>
    );
};