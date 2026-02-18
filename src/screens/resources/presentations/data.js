// Presentations specific data (enhanced with slide previews + mock pdf)
export const MOCK_PRESENTATION_PDF_BASE64 = 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWJCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSPj4+PiA+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNjQgPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMDAgNzAwIFRkCihIZWxsbyBKU0kgUHJlc2VudGF0aW9uKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL05hbWUgL0YxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE3IDAwMDAwIG4gCjAwMDAwMDAwNzYgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMjc1IDAwMDAwIG4gCjAwMDAwMDAzNjEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYgL1Jvb3QgMSAwIFIgL0luZm8gPDwvQ3JlYXRpb25EYXRlIChEOjIwMjQwMTAxMDkwMDAwKzAwJzAwJykvUHJvZHVjZXIgKEpTSS1BSSkgPj4+PgpzdGFydHhyZWYKNDEzCiUlRU9G';

// ─── Builder prompt suggestions ─────────────────────────────────────────────
export const BUILDER_PROMPT_SUGGESTIONS = [
    { label: 'Office seating overview', prompt: 'Create a product overview for JSI office seating solutions with key features and pricing tiers' },
    { label: 'Competitor comparison', prompt: 'Build a competitive comparison deck showing JSI vs top competitors on quality, price, and lead time' },
    { label: 'Casegoods pitch deck', prompt: 'Design a pitch presentation for vision casegoods targeted at corporate clients' },
    { label: 'Sustainability story', prompt: 'Create a sustainability-focused deck showcasing JSI environmental certifications and initiatives' },
    { label: 'New product launch', prompt: 'Generate a new product launch presentation for the 2025 lineup with hero imagery and selling angles' },
    { label: 'Client proposal', prompt: 'Build a professional client proposal around JSI lounge and collaborative furniture' },
];

export const BUILDER_EXPORT_FORMATS = [
    { id: 'pptx', label: 'PowerPoint', ext: '.pptx', icon: 'slides' },
    { id: 'pdf', label: 'PDF', ext: '.pdf', icon: 'file' },
];

// ─── My Decks (personal saved/generated presentations) ───────────────────────
export const INITIAL_MY_DECKS = [
    {
        id: 'deck-1',
        title: 'Riverside Medical Q1 Proposal',
        createdAt: '2026-01-28',
        updatedAt: '2026-02-04',
        source: 'generated',
        prompt: 'Build a proposal for Riverside Medical Center covering lounge and conference seating',
        slideCount: 12,
        format: 'pptx',
        thumbnailUrl: 'https://placehold.co/600x338/353535/ffffff?text=Riverside+Medical',
    },
    {
        id: 'deck-2',
        title: 'JSI Seating Competitive Edge',
        createdAt: '2026-01-15',
        updatedAt: '2026-01-15',
        source: 'generated',
        prompt: 'Competitive comparison deck for seating against top 3 competitors',
        slideCount: 9,
        format: 'pdf',
        thumbnailUrl: 'https://placehold.co/600x338/1a1a1a/ffffff?text=Competitive+Edge',
    },
];

const slides = (title) => [
  { id: 's1', image: 'https://placehold.co/800x450?text=' + encodeURIComponent(title + ' Slide 1'), caption: 'Intro & value proposition.' },
  { id: 's2', image: 'https://placehold.co/800x450?text=' + encodeURIComponent(title + ' Slide 2'), caption: 'Key differentiators / data.' },
  { id: 's3', image: 'https://placehold.co/800x450?text=' + encodeURIComponent(title + ' Slide 3'), caption: 'Call to action summary.' }
];

// Presentations specific data
export const PRESENTATIONS_DATA = [
    {
        id: 1,
        title: 'JSI Product Overview 2025',
        category: 'Product Training',
        type: 'PowerPoint',
        size: '12.4 MB',
        lastUpdated: '2025-01-15',
        description: 'High?level overview of JSI product families with positioning & quick specs.',
        downloadUrl: '#',
        thumbnailUrl: 'https://placehold.co/300x200?text=Overview+2025',
        slides: slides('Overview 2025')
    },
    {
        id: 2,
        title: 'Vision Casegoods Series',
        category: 'Product Specific',
        type: 'PowerPoint',
        size: '8.2 MB',
        lastUpdated: '2025-01-10',
        description: 'Vision casegoods configurations, finish options & application photos.',
        downloadUrl: '#',
        thumbnailUrl: 'https://placehold.co/300x200?text=Vision+Casegoods',
        slides: slides('Vision Casegoods')
    },
    {
        id: 3,
        title: 'Sustainability & JSI',
        category: 'Company',
        type: 'PDF',
        size: '5.6 MB',
        lastUpdated: '2024-12-20',
        description: 'Summary of sustainability initiatives, certifications & materials.',
        downloadUrl: '#',
        thumbnailUrl: 'https://placehold.co/300x200?text=Sustainability',
        slides: slides('Sustainability')
    },
    {
        id: 4,
        title: 'Contract Pricing Guide',
        category: 'Sales Training',
        type: 'PowerPoint',
        size: '4.1 MB',
        lastUpdated: '2025-01-05',
        description: 'Discount structure examples & margin talking points.',
        downloadUrl: '#',
        thumbnailUrl: 'https://placehold.co/300x200?text=Pricing+Guide',
        slides: slides('Pricing Guide')
    },
    {
        id: 5,
        title: 'New Product Launches 2025',
        category: 'Product Training',
        type: 'PowerPoint',
        size: '15.2 MB',
        lastUpdated: '2025-01-20',
        description: 'Launch roadmap, hero imagery & selling angles for 2025 intros.',
        downloadUrl: '#',
        thumbnailUrl: 'https://placehold.co/300x200?text=Launches+2025',
        slides: slides('Launches 2025')
    },
    {
        id: 6,
        title: 'Seating Collection Overview',
        category: 'Product Specific',
        type: 'PowerPoint',
        size: '9.8 MB',
        lastUpdated: '2025-01-12',
        description: 'Task, guest & lounge seating assortment with quick comparison.',
        downloadUrl: '#',
        thumbnailUrl: 'https://placehold.co/300x200?text=Seating+Overview',
        slides: slides('Seating Overview')
    }
];

export const PRESENTATION_CATEGORIES = [
    'Product Training',
    'Product Specific', 
    'Sales Training',
    'Company'
];

export const PRESENTATION_TYPES = [
    'PowerPoint',
    'PDF',
    'Video',
    'Interactive'
];