// Projects feature specific data (migrated from root data/projects.js)
export const MY_PROJECTS_DATA = [
  { id: 'proj1', name: 'Acme Corp HQ', location: 'Indianapolis, IN', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg' },
  { id: 'proj2', name: 'Tech Park Offices', location: 'Fishers, IN', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg' },
  { id: 'proj3', name: 'Community Hospital', location: 'Carmel, IN', image: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg' },
  { id: 'proj4', name: 'Downtown Library', location: 'Indianapolis, IN', image: 'https://webresources.jsifurniture.com/production/uploads/jsi_coldjet_install_00001.jpg' },
];

// Use only valid discount option strings from DISCOUNT_OPTIONS list
export const INITIAL_OPPORTUNITIES = [
  { id: 1, name: 'New Office Furnishings', stage: 'Discovery', discount: '50/20/5 (62.00%)', value: '$50,000', company: 'ABC Corporation', contact: 'John Smith', poTimeframe: '30-60 days', vertical: 'Corporate', winProbability: 50, competitionPresent: true, competitors: ['Steelcase','Haworth'], designFirms: ['McGee Designhouse'], dealers: ['Business Furniture'], products: [{series:'Vision'},{series:'Finn'}], notes: 'Main HQ expansion; awaiting test fit.', quotes:[{id:'q1', fileName:'Quote_100045.pdf', url:'/mock/Quote_100045.pdf' }] },
  { id: 3, name: 'Corporate Expansion Towers', stage: 'Discovery', discount: '50/20/3 (61.20%)', value: '$180,000', company: 'GlobalTech', contact: 'Sara Lin', poTimeframe: '60-90 days', vertical: 'Corporate', winProbability: 40, competitionPresent: false, competitors: [], designFirms: ['CSO'], dealers: ['RJE'], products: [{series:'Knox'}], notes: 'Early budget phase; spec standards requested.', quotes:[{id:'q2', fileName:'Budget_Set_A.pdf', url:'/mock/Budget_Set_A.pdf'}] },
  { id: 4, name: 'Medical Wing Remodel', stage: 'Discovery', discount: '50/20/2 (60.80%)', value: '$95,000', company: 'Midwest Health', contact: 'Alan Cooper', poTimeframe: '30-60 Days', vertical: 'Healthcare', winProbability: 60, competitionPresent: true, competitors: ['OFS'], designFirms: ['Ratio'], dealers: ['OfficeWorks'], products: [{series:'Coact'}], notes: 'Clinical areas focusing on cleanability.' },
  { id: 5, name: 'University Commons Refresh', stage: 'Discovery', discount: '50/20 (60.00%)', value: '$120,000', company: 'State University', contact: 'Emily Raine', poTimeframe: '90+ Days', vertical: 'Education', winProbability: 20, competitionPresent: false, competitors: [], designFirms: ['Studio M'], dealers: ['COE'], products: [{series:'Cao'}, {series:'Wink'}], notes: 'Student collaboration zones & lounge pieces.', quotes:[{id:'q3', fileName:'Student_Lounge_Rev1.pdf', url:'/mock/Student_Lounge_Rev1.pdf'}] },
  { id: 6, name: 'Hotel Lobby Seating', stage: 'Discovery', discount: '50/20/6 (62.40%)', value: '$70,000', company: 'Metro Hospitality', contact: 'Chris Dow', poTimeframe: '60-90 days', vertical: 'Hospitality', winProbability: 55, competitionPresent: true, competitors: ['DarRan'], designFirms: ['IDO'], dealers: ['Business Furniture'], products: [{series:'Hoopz'}], notes: 'Boutique brand look; finishes TBD.' },
  { id: 7, name: 'Startup Collaboration Space', stage: 'Discovery', discount: '50/20/4 (61.60%)', value: '$42,000', company: 'Innovate Labs', contact: 'Priya Patel', poTimeframe: 'Within 30 Days', vertical: 'Corporate', winProbability: 80, competitionPresent: false, competitors: [], designFirms: ['McGee Designhouse'], dealers: ['RJE'], products: [{series:'Vision'}], notes: 'Fast-track timeline; prioritizing flexible meeting areas.' },
  { id: 2, name: 'Lobby Refresh', stage: 'Specifying', discount: '50/20/8 (63.20%)', value: '$75,000', company: 'XYZ Industries', contact: 'Jane Doe', poTimeframe: '60-90 days', vertical: 'Corporate', winProbability: 65, competitionPresent: true, competitors: ['MillerKnoll'], designFirms: ['CSO'], dealers: ['Business Furniture'], products: [{series:'Vision'},{series:'Wink'}], notes: 'Renderings complete; awaiting final budget approval.', quotes:[{id:'q4', fileName:'Lobby_Renderings.pdf', url:'/mock/Lobby_Renderings.pdf'}] }
];

export const STAGES = ['Discovery', 'Specifying', 'Decision/Bidding', 'PO Expected', 'Won', 'Lost'];

export const EMPTY_LEAD = { project: '', designFirm: '', dealer: '', winProbability: 50, projectStatus: '', vertical: '', otherVertical: '', estimatedList: '', poTimeframe: '', competitors: [], competitionPresent: false, isBid: false, jsiSpecServices: false, quoteType: 'New Quote', pastProjectRef: '', discount: 'Undecided', products: [], notes: '', jsiQuoteNumber: '', isContract: false, contractType: '' };

export const URGENCY_LEVELS = ['Low', 'Medium', 'High'];
export const PO_TIMEFRAMES = ['Within 30 Days', '30-60 Days', '60-90 Days', '90+ Days', 'Early 2026', 'Late 2026', '2027 or beyond'];
export const COMPETITORS = ['None', 'Kimball', 'OFS', 'Indiana Furniture', 'National', 'Haworth', 'MillerKnoll', 'Steelcase', 'Versteel', 'Krug', 'Lazyboy', 'DarRan', 'Hightower', 'Allsteel'];
export const DISCOUNT_OPTIONS = ['Undecided', '50/20 (60.00%)', '50/20/1 (60.4%)', '50/20/2 (60.80%)', '50/20/4 (61.60%)', '50/20/2/3 (61.98%)', '50/20/5 (62.00%)', '50/20/3 (61.20%)', '50/20/6 (62.40%)', '50/25 (62.50%)', '50/20/5/2 (62.76%)', '50/20/7 (62.80%)', '50/20/8 (63.20%)', '50/10/10/10 (63.55%)', '50/20/9 (63.6%)', '50/20/10 (64.00%)', '50/20/8/3 (64.30%)', '50/20/10/3 (65.08%)', '50/20/10/5 (65.80%)', '50/20/15 (66.00%)'];
export const VERTICALS = ['Corporate', 'Education', 'Government', 'Healthcare', 'Hospitality', 'Other (Please specify)'];
export const WIN_PROBABILITY_OPTIONS = ['20%', '40%', '60%', '80%', '100%'];
export const INITIAL_DESIGN_FIRMS = ['N/A', 'Undecided', 'McGee Designhouse', 'Ratio', 'CSO', 'IDO', 'Studio M'];
export const INITIAL_DEALERS = ['Undecided', 'Business Furniture', 'COE', 'OfficeWorks', 'RJE'];
export const DAILY_DISCOUNT_OPTIONS = DISCOUNT_OPTIONS;
