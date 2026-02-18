// Community seed data
export const INITIAL_POSTS = [
    {
        id: 1,
        type: 'post',
        subreddit: null,
        user: { name: 'Natalie Parker', avatar: 'https://i.pravatar.cc/150?u=natalie' },
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        text: 'Great install in Chicago! The Vision series looks amazing in the new corporate headquarters.',
        image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg',
        likes: 12,
        upvotes: 18,
        comments: [{ id: 1, name: 'John Doe', text: 'Looks fantastic!' }],
    },
    {
        id: 4,
        type: 'post',
        subreddit: null,
        user: { name: 'Michael Torres', avatar: 'https://i.pravatar.cc/150?u=michael' },
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        text: 'Just wrapped a 200-seat training room with the Moto stack chairs. Client is thrilled with the mobility and nested storage. Another win for the team!',
        likes: 8,
        upvotes: 11,
        comments: [
            { id: 1, name: 'Sarah Kim', text: 'Moto is so underrated. Great choice!' },
            { id: 2, name: 'Dave Reynolds', text: 'What finish did you go with?' }
        ],
    },
    {
        id: 5,
        type: 'post',
        subreddit: null,
        user: { name: 'Rachel Green', avatar: 'https://i.pravatar.cc/150?u=rachel' },
        createdAt: Date.now() - 1000 * 60 * 60 * 8,
        text: 'Pro tip: the new Vision L-desk with the Torii base pairs beautifully with the Arwyn mid-back task chair. Perfect executive suite combo.',
        image: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_vision_enviro_00011.jpg',
        likes: 21,
        upvotes: 29,
        comments: [{ id: 1, name: 'Tom Brady', text: 'Adding this to my next spec. Thanks for the tip!' }],
    },
];

export const INITIAL_POLLS = [
    {
        id: 3,
        type: 'poll',
        subreddit: null,
        user: { name: 'Doug Shapiro', avatar: null },
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
        subreddit: null,
        user: { name: 'Laura Chen', avatar: 'https://i.pravatar.cc/150?u=laura' },
        createdAt: Date.now() - 1000 * 60 * 60 * 18,
        title: 'Boston HQ install - success!',
        text: 'Caav lounge seating and Finn benching throughout the open office. The client loved the material selections.',
        images: [
            'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg',
            'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg',
        ],
        likes: 34,
        upvotes: 41,
        comments: [
            { id: 1, name: 'Natalie Parker', text: 'Stunning! What fabrics are those?' },
            { id: 2, name: 'Laura Chen', text: 'Thanks! The lounge is Grade B Camira Era, the task seating is Grade A Guilford Channels.' }
        ],
    },
];

// Role-specific subreddit posts — each belongs to one community
// subreddit values must match the id fields in SUBREDDITS in CommunityLibraryLayout
const T = Date.now();
const h = (n) => T - 1000 * 60 * 60 * n;

export const SUBREDDIT_POSTS = [
    // ── dealer-designers ────────────────────────────────────────────────
    { id: 101, type: 'post', subreddit: 'dealer-designers', upvotes: 14, likes: 9,
      user: { name: 'Rachel Holt', avatar: 'https://i.pravatar.cc/150?u=rachelholt' }, createdAt: h(3),
      text: 'My client wants a biophilic workspace but we only have 12 weeks. What JSI pieces pair best alongside living walls? Thinking Caav lounge but open to any suggestions.',
      comments: [
        { id: 1, name: 'Amy Torres', text: "Finn benching with bamboo-look laminates is chef's kiss in that setting." },
        { id: 2, name: 'Mike Carr', text: 'Caav + the Kelp fabric grade = perfect. Very organic feel.' },
      ] },
    { id: 102, type: 'post', subreddit: 'dealer-designers', upvotes: 6, likes: 4,
      user: { name: 'Mike Carr', avatar: 'https://i.pravatar.cc/150?u=mikecarr' }, createdAt: h(26),
      text: "Anyone using Configurra for complex L-shape Vision runs? I keep getting the corner filler floating 2mm above the return. Symbol issue or floor-lock setting?",
      comments: [{ id: 1, name: 'Doug Kim', text: 'Try disabling Snap to Grid and manually set Z=0 on corner units.' }] },
    { id: 103, type: 'post', subreddit: 'dealer-designers', upvotes: 22, likes: 31,
      user: { name: 'Amy Torres', avatar: 'https://i.pravatar.cc/150?u=amytorres' }, createdAt: h(48),
      image: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_vision_enviro_00011.jpg',
      text: 'Vision Torii base renders so much richer in dark wood interiors. Swapping my default from Truss to Torii for executive projects. The visual weight just lands better.',
      comments: [{ id: 1, name: 'Rachel Holt', text: "Torii is doing a lot of work for us too. Clients love it." }] },

    // ── dealer-principals ────────────────────────────────────────────────
    { id: 201, type: 'post', subreddit: 'dealer-principals', upvotes: 18, likes: 11,
      user: { name: 'Tom Berkshire', avatar: 'https://i.pravatar.cc/150?u=tomberkshire' }, createdAt: h(5),
      text: "How are you handling the 2026 price increase conversations with existing clients? We're leading with value early — spec locks, Quick Ship saves, total project savings. What's working?",
      comments: [
        { id: 1, name: 'Sarah Lind', text: "We start the pricing conversation in Q4 every year now. No surprises = happy clients." },
        { id: 2, name: 'Jeff Durham', text: "Lock-in orders before Feb 1 saved two major accounts from shopping around." },
      ] },
    { id: 202, type: 'post', subreddit: 'dealer-principals', upvotes: 9, likes: 7,
      user: { name: 'Sarah Lind', avatar: 'https://i.pravatar.cc/150?u=sarahlind' }, createdAt: h(28),
      text: "Considering hiring a 2nd dedicated JSI specialist. Currently at $2.1M/yr JSI revenue. At what volume did it make sense for your team?",
      comments: [{ id: 1, name: 'Tom Berkshire', text: 'We pulled the trigger at $1.8M and it paid off in 8 months.' }] },
    { id: 203, type: 'post', subreddit: 'dealer-principals', upvotes: 35, likes: 28,
      user: { name: 'Jeff Durham', avatar: 'https://i.pravatar.cc/150?u=jeffdurham' }, createdAt: h(72),
      text: "Just hit Gold Partner. The incremental discount completely changes the math on competitive accounts — we were losing bids by 3-4% and now we're winning them.",
      comments: [
        { id: 1, name: 'Sarah Lind', text: 'Congrats Jeff! How long from Silver?' },
        { id: 2, name: 'Jeff Durham', text: '14 months. Intentional spec work with 3 key accounts.' },
      ] },

    // ── dealer-sales ────────────────────────────────────────────────────
    { id: 301, type: 'post', subreddit: 'dealer-sales', upvotes: 11, likes: 8,
      user: { name: 'Chris Navarro', avatar: 'https://i.pravatar.cc/150?u=chrisnavarro' }, createdAt: h(4),
      text: "Lost a deal to Knoll yesterday on price — $180k order, within $1,500. When does the value story stop mattering and you just have to sharpen the pencil?",
      comments: [
        { id: 1, name: 'Dana Reeves', text: "Lead times. If JSI is 4 weeks and Knoll is 12, that's your real margin." },
        { id: 2, name: 'Chris Navarro', text: "Good call — I didn't push the Quick Ship angle hard enough." },
      ] },
    { id: 302, type: 'post', subreddit: 'dealer-sales', upvotes: 44, likes: 36,
      user: { name: 'Dana Reeves', avatar: 'https://i.pravatar.cc/150?u=danareeves' }, createdAt: h(14),
      text: "Quick Ship Moto chairs saved my November number. Client needed 40 units by Thanksgiving — 10-day ship, delivered with 3 days to spare. This program is criminally underused.",
      comments: [
        { id: 1, name: 'Chris Navarro', text: 'Going to start leading with Quick Ship in every new account conversation.' },
        { id: 2, name: 'Sam Fields', text: 'Same story with Caav singles. Two orders in one week.' },
      ] },
    { id: 303, type: 'post', subreddit: 'dealer-sales', upvotes: 7, likes: 6,
      user: { name: 'Sam Fields', avatar: 'https://i.pravatar.cc/150?u=samfields' }, createdAt: h(32),
      text: "What's your go-to close when a client says 'let me think about it' after a strong presentation? The urgency play (pricing/lead time) feels forced sometimes.",
      comments: [{ id: 1, name: 'Dana Reeves', text: "Ask what specifically they're weighing. 9/10 it surfaces a hidden objection." }] },

    // ── rep-principals ───────────────────────────────────────────────────
    { id: 401, type: 'post', subreddit: 'rep-principals', upvotes: 13, likes: 9,
      user: { name: 'Paul Watkins', avatar: 'https://i.pravatar.cc/150?u=paulwatkins' }, createdAt: h(6),
      text: "Looking at adding a new dealer partner in Cleveland. Beyond revenue potential, what criteria do you use to evaluate JSI fit for a new dealership?",
      comments: [{ id: 1, name: 'Larry Wang', text: "Designer-led teams. If their designers aren't enthusiastic, principals rarely commit." }] },
    { id: 402, type: 'post', subreddit: 'rep-principals', upvotes: 28, likes: 19,
      user: { name: 'Larry Wang', avatar: 'https://i.pravatar.cc/150?u=larrywang' }, createdAt: h(36),
      text: "Q1 is tracking 18% ahead of plan. January showroom install month + the Quick Ship expansion made a real difference. Anyone else seeing a Q1 lift this year?",
      comments: [{ id: 1, name: 'Paul Watkins', text: "Similar here — up 12%. National accounts are moving faster." }] },
    { id: 403, type: 'post', subreddit: 'rep-principals', upvotes: 5, likes: 4,
      user: { name: 'Diane Marsh', avatar: 'https://i.pravatar.cc/150?u=dianemarsh' }, createdAt: h(60),
      text: "Floor sample strategy question: how do you decide which pieces to request, and how often do you rotate? Some of our dealer showrooms are getting stale.",
      comments: [{ id: 1, name: 'Larry Wang', text: "Rotate after any product launch and whenever a competitor gets something new in a dealer showroom." }] },

    // ── reps ─────────────────────────────────────────────────────────────
    { id: 501, type: 'post', subreddit: 'reps', upvotes: 16, likes: 12,
      user: { name: 'Jim Keller', avatar: 'https://i.pravatar.cc/150?u=jimkeller' }, createdAt: h(7),
      text: "Opening a new vertical: pediatric healthcare. JSI's antimicrobial fabrics are a real differentiator. Does anyone have case studies or install photos from healthcare environments?",
      comments: [
        { id: 1, name: 'Meg Donovan', text: "Reach out to marketing — I got a full healthcare deck last fall." },
        { id: 2, name: 'Steve Park', text: "Caav lounge with antimicrobial vinyl COM works great in low-traffic waiting areas." },
      ] },
    { id: 502, type: 'post', subreddit: 'reps', upvotes: 9, likes: 14,
      user: { name: 'Meg Donovan', avatar: 'https://i.pravatar.cc/150?u=megdonovan' }, createdAt: h(22),
      text: "Who's going to NeoCon? Trying to coordinate a group dealer trip to the JSI showroom (11th floor, theMART). Drop a reply if you're in — I'll build a shared itinerary.",
      comments: [
        { id: 1, name: 'Jim Keller', text: "In! Bringing 3 dealer designers from Nashville." },
        { id: 2, name: 'Steve Park', text: "Me too — 2 from our Cleveland dealer." },
      ] },
    { id: 503, type: 'post', subreddit: 'reps', upvotes: 6, likes: 5,
      user: { name: 'Steve Park', avatar: 'https://i.pravatar.cc/150?u=stevepark' }, createdAt: h(44),
      text: "Best approach for introducing JSI to a dealer who almost exclusively specs a competitor? I don't want to come in pushing hard — looking for a natural entry point.",
      comments: [{ id: 1, name: 'Jim Keller', text: "Lead with a project they can't win with their current line. Usually a lead-time or price gap." }] },

    // ── new-reps ─────────────────────────────────────────────────────────
    { id: 601, type: 'post', subreddit: 'new-reps', upvotes: 19, likes: 15,
      user: { name: 'Tyler Brooks', avatar: 'https://i.pravatar.cc/150?u=tylerbrooks' }, createdAt: h(10),
      text: "Week 3 in the rep role. Feeling overwhelmed by the product breadth. How long before you felt like you actually knew the line well enough to present confidently?",
      comments: [
        { id: 1, name: 'Jess Marino', text: "Honestly? 6 months for competence, 18 for real confidence. Pick 3 series and go deep first." },
        { id: 2, name: 'Tyler Brooks', text: "That's really helpful — Vision, Finn, and Caav are my focus for now." },
        { id: 3, name: 'Steve Park', text: "Learn the Quick Ship roster cold. That's your instant credibility play in year one." },
      ] },
    { id: 602, type: 'post', subreddit: 'new-reps', upvotes: 12, likes: 10,
      user: { name: 'Jess Marino', avatar: 'https://i.pravatar.cc/150?u=jessmarino' }, createdAt: h(30),
      text: "First dealer presentation done ✓ Showed the full Vision line + Caav lounge. They want floor samples of the Torii base in Natural Walnut. Is that a stock sample finish?",
      comments: [{ id: 1, name: 'Paul Watkins', text: "Natural Walnut is standard — should be quick. Confirm with marketing." }] },
    { id: 603, type: 'post', subreddit: 'new-reps', upvotes: 8, likes: 7,
      user: { name: 'Kim Ross', avatar: 'https://i.pravatar.cc/150?u=kimross' }, createdAt: h(52),
      text: "Starting my CET symbol library from scratch. Is there an official JSI add-on pack for Configurra, or am I building symbols manually?",
      comments: [{ id: 1, name: 'Doug Kim', text: "Check the Configurra content library — JSI has an official add-on. If it's missing, ask your JSI sales contact." }] },

    // ── jsiers ────────────────────────────────────────────────────────────
    { id: 701, type: 'post', subreddit: 'jsiers', upvotes: 24, likes: 18,
      user: { name: 'Mark H. · JSI', avatar: 'https://i.pravatar.cc/150?u=markhjsi' }, createdAt: h(8),
      text: "Reminder: Dealer Advisory Panel plant visit is Feb 25. Dinner at the Lodge at 5pm, plant tour starts 8am sharp. Send final dietary restrictions to events@ by Feb 20.",
      comments: [{ id: 1, name: 'Karen Bell · JSI', text: "14 dealer attendees confirmed so far — great turnout!" }] },
    { id: 702, type: 'post', subreddit: 'jsiers', upvotes: 17, likes: 22,
      user: { name: 'Product Team · JSI', avatar: null }, createdAt: h(32),
      text: "Spring 2026 fabric additions are shipping to reps this week — 14 new grades across 4 performance families. Physical memo samples included. Full deck in Resources › Samples.",
      comments: [{ id: 1, name: 'Mark H. · JSI', text: "The new indoor/outdoor performance grades are going to be very popular this season." }] },
    { id: 703, type: 'post', subreddit: 'jsiers', upvotes: 11, likes: 9,
      user: { name: 'Karen Bell · JSI', avatar: 'https://i.pravatar.cc/150?u=karenbell' }, createdAt: h(60),
      text: "NeoCon 2026 planning has started! To volunteer for showroom duty (June 8-10, Chicago) DM me by March 1. Priority given to product team and marketing.",
      comments: [] },

    // ── cet-designers ─────────────────────────────────────────────────────
    { id: 801, type: 'post', subreddit: 'cet-designers', upvotes: 31, likes: 24,
      user: { name: 'Doug Kim', avatar: 'https://i.pravatar.cc/150?u=dougkim' }, createdAt: h(5),
      text: "Anyone else seeing Configurra files corrupting post-6.5.3 update? Workaround: save in 6.2 compatibility mode. CET support ticket #CC-40812 is open. Avoid upgrading for now.",
      comments: [
        { id: 1, name: 'Rachel Holt', text: "Yes — lost 3 hours yesterday. Thank you for the workaround." },
        { id: 2, name: 'Sam Fields', text: "I rolled back to 6.4.9 entirely. Zero issues since." },
      ] },
    { id: 802, type: 'post', subreddit: 'cet-designers', upvotes: 48, likes: 41,
      user: { name: 'Rachel Holt', avatar: 'https://i.pravatar.cc/150?u=rachelholt' }, createdAt: h(20),
      text: "Sharing my JSI Vision parametric symbol pack — all 3 bases (Truss, Torii, Executive) with nested height and finish config. DM me your email and I'll send the .cet export.",
      comments: [
        { id: 1, name: 'Doug Kim', text: "This is so generous. DM sent." },
        { id: 2, name: 'Mike Carr', text: "Sending DM now — thank you!" },
      ] },
    { id: 803, type: 'post', subreddit: 'cet-designers', upvotes: 15, likes: 19,
      user: { name: 'Sam Fields', avatar: 'https://i.pravatar.cc/150?u=samfields' }, createdAt: h(38),
      text: "CET tip: enable 'Lock to Floor' on all Moto stack chair symbols or they render floating 2mm above finish floor. Small thing, kills otherwise perfect renders.",
      comments: [{ id: 1, name: 'Rachel Holt', text: "I add this to every JSI symbol description now." }] },

    // ── install-tips ──────────────────────────────────────────────────────
    { id: 901, type: 'post', subreddit: 'install-tips', upvotes: 37, likes: 29,
      user: { name: 'Oscar Mendez', avatar: 'https://i.pravatar.cc/150?u=oscarmendez' }, createdAt: h(9),
      text: "Always pre-stage and pre-assemble Vision casegoods in a staging area before moving to the workspace. We cut install time by 30% and eliminated all field damage. Non-negotiable for us.",
      comments: [
        { id: 1, name: 'Frank Russo', text: "Same. The elevator used to eat 45 minutes per floor." },
        { id: 2, name: 'Marcus Webb', text: "Add: photograph the staging assembly as proof-of-condition before moving." },
      ] },
    { id: 902, type: 'post', subreddit: 'install-tips', upvotes: 22, likes: 18,
      user: { name: 'Frank Russo', avatar: 'https://i.pravatar.cc/150?u=frankrusso' }, createdAt: h(28),
      text: "Caav sectional tip: ship in zone sequence (A, B, C…). If zones get mixed in transit you're in for a puzzle on a deadline. Label every pallet by zone at the dock.",
      comments: [{ id: 1, name: 'Oscar Mendez', text: "Shrink-wrap by zone after palletizing — keeps groups intact even if things get moved." }] },
    { id: 903, type: 'post', subreddit: 'install-tips', upvotes: 14, likes: 21,
      user: { name: 'Marcus Webb', avatar: 'https://i.pravatar.cc/150?u=marcuswebb' }, createdAt: h(50),
      text: "Phase power/data with IT before moving benching in. Had a perfect Finn run installed Friday — IT disconnected half of it Monday. Now I require IT sign-off before delivery day.",
      comments: [
        { id: 1, name: 'Frank Russo', text: "IT coordination is on our delivery checklist now. Saved multiple projects." },
        { id: 2, name: 'Oscar Mendez', text: "Get IT to mark data points with floor tape before you finalise benching layout." },
      ] },
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