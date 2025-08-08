// Feedback specific data
export const FEEDBACK_TYPES = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'improvement', label: 'Improvement Suggestion' }
];

export const FEEDBACK_CATEGORIES = [
    'App Functionality',
    'User Interface',
    'Performance',
    'Content',
    'Navigation',
    'Features',
    'Other'
];

export const RATING_LABELS = {
    1: 'Very Poor',
    2: 'Poor', 
    3: 'Average',
    4: 'Good',
    5: 'Excellent'
};

export const FEEDBACK_FORM_INITIAL = {
    type: 'general',
    rating: 0,
    subject: '',
    message: '',
    category: '',
    email: '',
    includeContact: false
};

export const SAMPLE_FEEDBACK_SUBMISSIONS = [
    {
        id: 1,
        type: 'feature',
        subject: 'Add dark mode toggle',
        message: 'Would love to see a dark mode option in the app settings.',
        rating: 4,
        category: 'Features',
        timestamp: '2025-01-15T10:30:00Z',
        status: 'reviewed'
    },
    {
        id: 2,
        type: 'bug',
        subject: 'Cart items disappearing',
        message: 'Items in my samples cart sometimes disappear when navigating between screens.',
        rating: 2,
        category: 'App Functionality',
        timestamp: '2025-01-14T16:45:00Z',
        status: 'in-progress'
    }
];