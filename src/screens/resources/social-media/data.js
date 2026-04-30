export const DEFAULT_SOCIAL_VERTICAL = 'all';

export const SOCIAL_CHANNELS = [
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/jsifurniture/' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/jsifurniture/' },
];

export const SOCIAL_VERTICALS = [
    { id: 'all', label: 'All Verticals', accent: '#353535' },
    { id: 'workplace', label: 'Workplace', accent: '#353535' },
    { id: 'healthcare', label: 'Healthcare', accent: '#4A7C59' },
    { id: 'education', label: 'Education', accent: '#5B7B8C' },
    { id: 'government', label: 'Government', accent: '#7A8B6F' },
    { id: 'hospitality', label: 'Hospitality', accent: '#C4956A' },
    { id: 'senior-living', label: 'Senior Living', accent: '#8B7355' },
    { id: 'religious', label: 'Religious', accent: '#7A5C2E' },
    { id: 'law-firms', label: 'Law Firms', accent: '#B78B5E' },
];

export const SOCIAL_CAMPAIGNS = [
    {
        id: 'workplace-vision-suite',
        vertical: 'workplace',
        title: 'Vision · Leadership Suites',
        caption: 'Spaces that balance focus, connection, and well-being. Vision casegoods paired with executive seating create leadership settings that feel precise without feeling cold. #JSIFurniture #Vision',
        imageUrl: '/category-images/casegood-images/api_vision.jpg',
    },
    {
        id: 'workplace-anthology-boardroom',
        vertical: 'workplace',
        title: 'Anthology · Gather & Meeting',
        caption: 'Where ideas meet possibility. Anthology tables, layered with refined seating, give teams a place to focus and host with more polish. #JSIFurniture #Anthology',
        imageUrl: '/category-images/conference-images/api_anthology.jpg',
    },
    {
        id: 'healthcare-kindera',
        vertical: 'healthcare',
        title: 'Teekan · Patient Comfort',
        caption: 'Care environments ask a lot from every square foot. Lead with comfort, adaptability, and easy-clean confidence. #JSIHealth',
        imageUrl: '/category-images/lounge-images/api_teekan.jpg',
    },
    {
        id: 'education-lok',
        vertical: 'education',
        title: 'Lok · Training In Motion',
        caption: 'Learning in motion looks better when tables and seating flex without losing warmth. #JSIFurniture #Lok',
        imageUrl: '/category-images/conference-images/api_lok-conference.jpg',
    },
    {
        id: 'government-vision',
        vertical: 'government',
        title: 'Vision · Civic Confidence',
        caption: 'Calm professional settings, backed by procurement clarity and material confidence. #JSIFurniture #Vision',
        imageUrl: '/category-images/conference-images/api_vision.jpg',
    },
    {
        id: 'hospitality-caav',
        vertical: 'hospitality',
        title: 'Caav · Arrival Moments',
        caption: 'When the first impression matters, softness, scale, and tone do a lot of the work. #JSIFurniture #Caav',
        imageUrl: '/category-images/lounge-images/api_caav.jpg',
    },
    {
        id: 'senior-living-indie',
        vertical: 'senior-living',
        title: 'Indie · Residential Warmth',
        caption: 'Calm, familiar, and human. Soft forms and warm materials for resident-facing spaces. #JSIFurniture #Indie',
        imageUrl: '/category-images/lounge-images/api_indie.jpg',
    },
    {
        id: 'religious-poet',
        vertical: 'religious',
        title: 'Poet · Community Gathering',
        caption: 'Grounded, generous environments that bring people together. #JSIFurniture #Poet',
        imageUrl: '/category-images/lounge-images/api_poet.jpg',
    },
    {
        id: 'law-firms-reception',
        vertical: 'law-firms',
        title: 'Vision · Reception',
        caption: 'A reception story rooted in poise and hospitality.',
        imageUrl: '/category-images/casegood-images/api_vision.jpg',
    },
];

// Law Firms easter-egg landing page — modeled after jsifurniture.com
// vertical pages (e.g. /learning-training-spaces), translated for legal.
export const LAW_FIRM_LANDING_PAGE = {
    slug: 'law-firm-spaces',
    title: 'Law Firm Spaces',
    subtitle: 'Spaces that earn trust at the front door and hold focus from reception to boardroom.',
    heroImage: '/category-images/casegood-images/jsi_vision_config_000007.jpg',
    sections: [
        { number: '01', label: 'Reception & Arrival' },
        { number: '02', label: 'Admin & Benching' },
        { number: '03', label: 'Private Offices' },
        { number: '04', label: 'Boardrooms' },
        { number: '05', label: 'Custom Casegoods' },
    ],
    featuredProducts: [
        { category: 'Casegoods & Storage', family: 'Vision', label: 'Vision Reception & Casegoods', image: '/category-images/casegood-images/jsi_vision_config_000001_dkm0wsV.jpg' },
        { category: 'Conference Tables', family: 'Anthology', label: 'Anthology Conference', image: '/category-images/conference-images/jsi_anthology_comp_0003_NBW46kS.jpg' },
        { category: 'Executive Seating', family: 'Cosgrove', label: 'Cosgrove Highback', image: '/category-images/swivel-images/jsi_cosgrove_comp_highback_arms_00002_KAky10n.jpg' },
        { category: 'Guest Seating', family: 'Bourne', label: 'Bourne Guest', image: '/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg' },
        { category: 'Lounge', family: 'Caav', label: 'Caav Lounge', image: '/category-images/lounge-images/api_caav.jpg' },
        { category: 'Casegoods', family: 'Brogan', label: 'Brogan Private Office', image: '/category-images/casegood-images/jsi_brogan_config_0015.jpg' },
        { category: 'Benching', family: 'Flux', label: 'Flux Benching', image: '/category-images/casegood-images/jsi_flux_config_00008.jpg' },
        { category: 'Guest Seating', family: 'Ria', label: 'Ria Guest', image: '/category-images/guest-images/jsi_ria_comp_00007.jpg' },
    ],
    spaces: [
        {
            slug: 'reception',
            number: '01',
            title: 'Reception & Client Arrival',
            body: 'A welcome that sets the tone for trust. Custom Vision casegoods, layered with hospitality-forward lounge moments, give clients an arrival that feels assured rather than austere.',
            image: '/category-images/casegood-images/jsi_vision_config_000008.jpg',
        },
        {
            slug: 'admin',
            number: '02',
            title: 'Admin & Benching',
            body: 'Treat administration as a Vision opportunity. Benching with a tailored finish package keeps support staff productive without breaking the firm’s tone of voice.',
            image: '/category-images/casegood-images/jsi_flux_config_00008.jpg',
        },
        {
            slug: 'private-office',
            number: '03',
            title: 'Private & Executive Offices',
            body: 'Authority that doesn’t shout. Vision and Brogan private offices balance storage, privacy, and a comfortable day-long footprint for partners and counsel.',
            image: '/category-images/casegood-images/jsi_brogan_config_0015.jpg',
        },
        {
            slug: 'boardroom',
            number: '04',
            title: 'Boardrooms & Conference',
            body: 'Long sessions, integrated power, and seating that stays graceful through deposition, mediation, and client review. Anthology and Cosgrove anchor the room.',
            image: '/category-images/conference-images/jsi_anthology_comp_0006.jpg',
        },
        {
            slug: 'waiting',
            number: '05',
            title: 'Waiting & Hospitality',
            body: 'Front-of-house spaces borrow from hospitality without losing authority. Caav, Bourne, and Poet keep waiting moments composed and considered.',
            image: '/category-images/lounge-images/api_caav.jpg',
        },
        {
            slug: 'custom',
            number: '06',
            title: 'Custom Reception & Casegoods',
            body: 'Vic and Ed lead the firm-specific work — bespoke reception desks, millwork-grade veneers, and casegoods built around the floorplate, not the other way around.',
            image: '/category-images/casegood-images/jsi_vision_config_000007.jpg',
        },
    ],
    designedYourWay: {
        eyebrow: 'Designed Your Way',
        title: 'Configurable for the firm, finished for the partner.',
        body: 'Every Vision plan is built to order — pulls, edges, veneers, and integrated tech tailored at the case-level. Our Custom team partners directly with the design firm to keep the architectural language consistent through reception, partner offices, and conference.',
        image: '/category-images/casegood-images/api_vision.jpg',
    },
    contracts: [
        { label: 'GSA', note: 'Federal procurement schedule' },
        { label: 'OMNIA Partners', note: 'Cooperative purchasing' },
        { label: 'BuyBoard', note: 'National purchasing cooperative' },
        { label: 'NCPA', note: 'National cooperative' },
    ],
    installation: {
        eyebrow: 'Featured Installation',
        title: 'A downtown Chicago law firm reception.',
        body: 'Custom Vision reception in walnut veneer, paired with Caav lounge and Bourne guest seating. The floor reads as a hospitality lobby first, a law firm second — exactly the brief.',
        image: '/category-images/casegood-images/jsi_vision_config_000007.jpg',
        meta: 'Chicago, IL · Custom Vision · Caav · Bourne',
    },
    resources: [
        { label: 'Law Firm One-Pager', kind: 'PDF · 2 pages', image: '/category-images/casegood-images/api_vision.jpg' },
        { label: 'Custom Reception Lookbook', kind: 'PDF · 12 pages', image: '/category-images/casegood-images/jsi_vision_config_000008.jpg' },
        { label: 'Vision for Legal Spec Guide', kind: 'PDF · 8 pages', image: '/category-images/casegood-images/api_vision.jpg' },
    ],
    reps: [
        { name: 'Mike Wolf', territory: 'Chicago Metro · Law Firm Pursuit', email: 'mike@jsireps.com', phone: '(312) 555-0142' },
        { name: 'Vic Allen', territory: 'Custom Reception & Casegoods', email: 'vic@jsifurniture.com', phone: '(812) 482-1006' },
        { name: 'Ed Bryant', territory: 'Custom Casegoods Lead', email: 'ed@jsifurniture.com', phone: '(812) 482-1007' },
    ],
};
