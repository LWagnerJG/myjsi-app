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
        title: 'Boston HQ install – success! ??',
        images: [
            'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg',
            'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg',
        ],
    },
];

export const SOCIAL_MEDIA_POSTS = [
    { 
        id: 1, 
        type: 'image', 
        url: 'https://placehold.co/400x500/E3DBC8/2A2A2A?text=JSI+Seating', 
        caption: 'Comfort meets design. ? Discover the new Arwyn series, perfect for any modern workspace. #JSIFurniture #OfficeDesign #ModernWorkplace' 
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