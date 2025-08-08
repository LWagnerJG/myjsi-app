// Request Field Visit specific data
export const VISIT_TYPES = [
    'Installation Support',
    'Product Issue',
    'Quality Concern',
    'Training',
    'Warranty Service',
    'Other'
];

export const URGENCY_LEVELS = [
    { value: 'low', label: 'Low - General support', color: '#10B981' },
    { value: 'medium', label: 'Medium - Issue affecting use', color: '#F59E0B' },
    { value: 'high', label: 'High - Critical issue', color: '#EF4444' }
];

export const FIELD_VISIT_REQUIREMENTS = {
    minAdvanceWeeks: 2,
    allowedDays: [1, 2, 3, 4, 5], // Monday through Friday
    maxPhotos: 10,
    acceptedPhotoTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

export const SAMPLE_VISIT_DATA = [
    {
        id: 1,
        soNumber: 'SO-2024-001234',
        requestDate: '2024-01-15',
        scheduledDate: '2024-02-01',
        status: 'Scheduled',
        visitType: 'Installation Support',
        address: '123 Corporate Blvd, Indianapolis, IN 46240',
        urgency: 'medium',
        notes: 'Need assistance with Vision casegoods installation and configuration'
    },
    {
        id: 2,
        soNumber: 'SO-2024-001189',
        requestDate: '2024-01-10',
        scheduledDate: '2024-01-25',
        status: 'Completed',
        visitType: 'Quality Concern',
        address: '456 Business Park Dr, Fort Wayne, IN 46825',
        urgency: 'high',
        notes: 'Customer reporting finish inconsistencies on multiple pieces'
    }
];

export const VISIT_STATUS_COLORS = {
    'Scheduled': '#3B82F6',
    'In Progress': '#F59E0B', 
    'Completed': '#10B981',
    'Cancelled': '#EF4444',
    'Rescheduled': '#8B5CF6'
};