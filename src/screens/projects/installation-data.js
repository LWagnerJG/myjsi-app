// Project installation management data
export const INSTALLATION_CONSTANTS = {
    PHOTO_REQUIREMENTS: {
        minPhotos: 1,
        maxPhotos: 10,
        acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSize: 5 * 1024 * 1024 // 5MB
    },
    LOCATION_VALIDATION: {
        requiresGooglePlaces: true,
        allowManualEntry: true,
        defaultCountry: 'US'
    },
    PROJECT_TYPES: [
        'Office Installation',
        'Healthcare Facility', 
        'Educational Institution',
        'Hospitality Project',
        'Government Building',
        'Other'
    ]
};

export const INSTALLATION_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    ON_HOLD: 'on-hold'
};

export const FORM_VALIDATION = {
    projectName: {
        required: true,
        minLength: 3,
        maxLength: 100
    },
    location: {
        required: true,
        minLength: 5,
        maxLength: 200
    },
    photos: {
        required: true,
        minCount: 1
    }
};