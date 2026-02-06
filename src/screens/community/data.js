// Community seed data
export const INITIAL_POSTS = [
    {
        id: 1,
        type: 'post',
        user: { name: 'Natalie Parker', avatar: 'https://i.pravatar.cc/150?u=natalie' },
        timeAgo: '2h',
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        text: 'Great install in Chicago! The Vision series looks amazing in the new corporate headquarters.',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg',
        likes: 12,
        comments: [{ id: 1, name: 'John Doe', text: 'Looks fantastic!' }],
    },
    {
        id: 4,
        type: 'post',
        user: { name: 'Michael Torres', avatar: 'https://i.pravatar.cc/150?u=michael' },
        timeAgo: '5h',
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        text: 'Just wrapped a 200-seat training room with the Moto stack chairs. Client is thrilled with the mobility and nested storage. Another win for the team!',
        likes: 8,
        comments: [
            { id: 1, name: 'Sarah Kim', text: 'Moto is so underrated. Great choice!' },
            { id: 2, name: 'Dave Reynolds', text: 'What finish did you go with?' }
        ],
    },
    {
        id: 5,
        type: 'post',
        user: { name: 'Rachel Green', avatar: 'https://i.pravatar.cc/150?u=rachel' },
        timeAgo: '8h',
        createdAt: Date.now() - 1000 * 60 * 60 * 8,
        text: 'Pro tip: the new Vision L-desk with the Torii base pairs beautifully with the Arwyn mid-back task chair. Perfect executive suite combo.',
        image: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_vision_enviro_00011.jpg',
        likes: 21,
        comments: [{ id: 1, name: 'Tom Brady', text: 'Adding this to my next spec. Thanks for the tip!' }],
    },
];

export const INITIAL_POLLS = [
    {
        id: 3,
        type: 'poll',
        user: { name: 'Doug Shapiro', avatar: null },
        timeAgo: '1d',
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        question: 'Which Vision base finish do you spec the most?',
        options: [
            { id: 'truss', text: 'Truss', votes: 8 },
            { id: 'torii', text: 'Torii', votes: 5 },
            { id: 'exec', text: 'Executive', votes: 12 },
        ],
    },
];


export const INITIAL_WINS = [
    {
        id: 2,
        type: 'win',
        user: { name: 'Laura Chen', avatar: 'https://i.pravatar.cc/150?u=laura' },
        timeAgo: 'yesterday',
        createdAt: Date.now() - 1000 * 60 * 60 * 18,
        title: 'Boston HQ install - success!',
        text: 'Caav lounge seating and Finn benching throughout the open office. The client loved the material selections.',
        images: [
            'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg',
            'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg',
        ],
        likes: 34,
        comments: [
            { id: 1, name: 'Natalie Parker', text: 'Stunning! What fabrics are those?' },
            { id: 2, name: 'Laura Chen', text: 'Thanks! The lounge is Grade B Camira Era, the task seating is Grade A Guilford Channels.' }
        ],
    },
];

// JSI Announcements — official comms from JSI corporate
export const ANNOUNCEMENTS = [
    {
        id: 'ann-1',
        type: 'announcement',
        category: 'product-launch',
        title: 'Introducing the Arwyn Series',
        subtitle: 'New ergonomic task & conference seating',
        text: 'The all-new Arwyn series combines contemporary design with day-long comfort. Available in mid-back and high-back configurations with optional adjustable lumbar and 4D arms. Ships in 4 weeks.',
        image: 'https://placehold.co/800x400/353535/FFFFFF?text=Arwyn+Series+Launch',
        date: '2026-02-05',
        pinned: true,
        actionLabel: 'View Products',
        actionRoute: 'products/category/swivel',
    },
    {
        id: 'ann-2',
        type: 'announcement',
        category: 'pricing',
        title: '2026 Price List Now Available',
        subtitle: 'Updated pricing effective February 1',
        text: 'The 2026 dealer price list is now live in Resources. Average increase of 3-5% across most categories. Quick Ship program pricing remains unchanged through Q2.',
        date: '2026-02-01',
        pinned: true,
        actionLabel: 'View Price Lists',
        actionRoute: 'resources',
    },
    {
        id: 'ann-3',
        type: 'announcement',
        category: 'event',
        title: 'NeoCon 2026 — Save the Date',
        subtitle: 'June 8-10, 2026 · theMART, Chicago',
        text: 'Join JSI at NeoCon 2026 in our expanded showroom on the 11th floor. Preview new product launches and connect with the JSI team. Dealer registration opens March 1.',
        date: '2026-01-28',
        pinned: false,
        actionLabel: 'Learn More',
        actionRoute: 'resources',
    },
    {
        id: 'ann-4',
        type: 'announcement',
        category: 'operations',
        title: 'Quick Ship Expansion',
        subtitle: '12 new SKUs added to 10-day program',
        text: 'We\'ve expanded Quick Ship to include select Vision casegoods, Moto stacking chairs, and Caav lounge configurations. Check lead times for the full list.',
        date: '2026-01-20',
        pinned: false,
        actionLabel: 'Check Lead Times',
        actionRoute: 'resources/lead-times',
    },
];

// Stories — highlights displayed as circular avatars at top of community
export const STORIES = [
    { id: 'story-jsi', type: 'official', label: 'JSI', avatar: null, isJSI: true, color: '#353535' },
    { id: 'story-1', type: 'user', label: 'Natalie', avatar: 'https://i.pravatar.cc/150?u=natalie', previewImage: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg' },
    { id: 'story-2', type: 'user', label: 'Laura', avatar: 'https://i.pravatar.cc/150?u=laura', previewImage: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg' },
    { id: 'story-3', type: 'user', label: 'Michael', avatar: 'https://i.pravatar.cc/150?u=michael', previewImage: null },
    { id: 'story-4', type: 'user', label: 'Rachel', avatar: 'https://i.pravatar.cc/150?u=rachel', previewImage: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_vision_enviro_00011.jpg' },
    { id: 'story-5', type: 'user', label: 'Doug', avatar: null, previewImage: null },
];

export const SOCIAL_MEDIA_POSTS = [
    { 
        id: 1, 
        type: 'image', 
        url: 'https://placehold.co/400x500/E3DBC8/2A2A2A?text=JSI+Seating', 
        caption: 'Comfort meets design. Discover the new Arwyn series, perfect for any modern workspace. #JSIFurniture #OfficeDesign #ModernWorkplace' 
    }, 
    { 
        id: 2, 
        type: 'image', 
        url: 'https://placehold.co/400x500/D9CDBA/2A2A2?text=Vision+Casegoods', 
        caption: 'Functionality at its finest. The Vision casegoods line offers endless configuration possibilities. #Casegoods #OfficeInspo #JSI' 
    }, 
    { 
        id: 3, 
        type: 'video', 
        url: 'https://placehold.co/400x500/A9886C/FFFFFF?text=Lounge+Tour+(Video)', 
        caption: 'Take a closer look at the luxurious details of our Caav lounge collection. #LoungeSeating #ContractFurniture #HospitalityDesign' 
    }, 
    { 
        id: 4, 
        type: 'image', 
        url: 'https://placehold.co/400x500/966642/FFFFFF?text=Forge+Tables', 
        caption: 'Gather around. The Forge table series brings a rustic yet refined look to collaborative spaces. #MeetingTable #Collaboration #JSI' 
    }
];