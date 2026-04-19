// Products feature data

const localImage = (path) => path;
const jsiImg = (publicId, size = 'medium') => {
  const t = size === 'thumb' ? 't_thumbnail/c_limit,w_256' : size === 'large' ? 't_large/c_limit,w_1200' : 't_medium/c_fill,w_640,h_640,g_auto';
  return `https://res.cloudinary.com/jasper-jsi-furniture/image/upload/${t}/f_auto/q_auto/v1/${publicId}`;
};

const comp = (name, laminate, advantage) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), name, laminate, adv: advantage });

export const PRODUCT_DATA = {
    'benches': {
        name: 'Benches',
        products: [
            { id: 'americana-bench', name: 'Americana', price: 1520, image: localImage('/category-images/bench-images/api_americana.jpg') },
            { id: 'arwyn-bench', name: 'Arwyn', price: 1400, image: localImage('/category-images/bench-images/api_arwyn.jpg') },
            { id: 'bespace-bench', name: 'BeSPACE', price: 1440, image: localImage('/category-images/bench-images/api_bespace.jpg') },
            { id: 'boston-bench', name: 'Boston', price: 1560, image: localImage('/category-images/bench-images/api_boston.jpg') },
            { id: 'connect-bench', name: 'Connect', price: 1600, image: localImage('/category-images/bench-images/api_connect.jpg') },
            { id: 'finn-nu-bench', name: 'Finn Nu', price: 1480, image: localImage('/category-images/bench-images/api_finn-nu.jpg') },
            { id: 'indie', name: 'Indie', price: 1320, image: localImage('/category-images/bench-images/api_indie.jpg') },
            { id: 'native', name: 'Native', price: 1200, image: localImage('/category-images/bench-images/api_native.jpg') },
            { id: 'oxley', name: 'Oxley', price: 1360, image: localImage('/category-images/bench-images/api_oxley.jpg') },
            { id: 'poet', name: 'Poet', price: 1280, image: localImage('/category-images/bench-images/api_poet.jpg') },
        ],
        competition: [],
        competitionByProduct: {
            'native': [comp('OFS Rowen Bench', '$1250', '-4%'), comp('Kimball EverySpace', '$1325', '-9%'), comp('Indiana Clutch', '$1180', '+2%')],
            'poet': [comp('OFS Lite', '$790', '-1%'), comp('Kimball Pep Bench', '$770', '+1%'), comp('SitOnIt Nomad', '$730', '+6%')],
            'indie': [comp('OFS Modern Amenity', '$950', '-3%'), comp('Kimball Alterna', '$935', '-2%'), comp('Global Duet', '$905', '+2%')]
        }
    },
    'casegoods': {
        name: 'Casegoods',
        products: [
            { id: 'brogan', name: 'Brogan', price: 4200, image: localImage('/category-images/casegood-images/api_brogan.jpg') },
            { id: 'finale', name: 'Finale', price: 4700, image: localImage('/category-images/casegood-images/api_finale.jpg') },
            { id: 'flux', name: 'Flux', price: 3700, image: localImage('/category-images/casegood-images/api_flux-private-office.jpg') },
            { id: 'vision', name: 'Vision', price: 3200, image: localImage('/category-images/casegood-images/api_vision.jpg') },
        ],
        competition: [],
        competitionByProduct: {
            'vision': [comp('OFS Staks', '$3350', '-5%'), comp('Kimball Narrate', '$3425', '-7%'), comp('Indiana Canvas', '$3180', '+1%'), comp('Hon Abound', '$3050', '+5%')],
            'flux': [comp('OFS ReframE', '$3825', '-3%'), comp('Kimball Alterna', '$3775', '-2%'), comp('Indiana Gesso', '$3650', '+1%')],
            'brogan': [comp('Kimball Priority', '$4350', '-4%'), comp('OFS Aptos', '$4425', '-6%'), comp('Teknion Expansion', '$4185', '+0%')],
            'finale': [comp('OFS Impulse', '$4850', '-3%'), comp('Kimball Xsede', '$4920', '-4%'), comp('Hon Accelerate', '$4600', '+2%')]
        }
    },
    'conference-tables': {
        name: 'Conference Tables',
        products: [
            { id: 'anthology-table', name: 'Anthology', price: 4700, image: localImage('/category-images/conference-images/api_anthology.jpg') },
            { id: 'brogan-table', name: 'Brogan', price: 4600, image: localImage('/category-images/conference-images/api_brogan.jpg') },
            { id: 'finale-table', name: 'Finale', price: 4800, image: localImage('/category-images/conference-images/api_finale.jpg') },
            { id: 'lok-conference-table', name: 'Lok Conference', price: 4300, image: localImage('/category-images/conference-images/api_lok-conference.jpg') },
            { id: 'moto', name: 'Moto', price: 4000, image: localImage('/category-images/conference-images/api_moto.jpg') },
            { id: 'reef', name: 'Reef', price: 4200, image: localImage('/category-images/conference-images/api_reef.jpg') },
            { id: 'vision-table', name: 'Vision', price: 4500, image: localImage('/category-images/conference-images/api_vision.jpg') },
            { id: 'walden-table', name: 'Walden', price: 5100, image: localImage('/category-images/conference-images/api_walden.jpg') },
            { id: 'wellington-table', name: 'Wellington', price: 5400, image: localImage('/category-images/conference-images/api_wellington.jpg') },
        ],
        competition: [],
        competitionByProduct: {
            'vision-table': [comp('OFS Eleven Table', '$4625', '-3%'), comp('Kimball Dock', '$4550', '-1%'), comp('Indiana Canvas Meet', '$4380', '+3%')],
            'reef': [comp('Kimball KORE', '$4320', '-3%'), comp('OFS Applause', '$4210', '-0%'), comp('Hon Preside', '$4050', '+4%')],
            'moto': [comp('OFS Thrive', '$4125', '-3%'), comp('Kimball Pairings Table', '$4080', '-2%'), comp('SitOnIt Amplify Table', '$3920', '+2%')]
        }
    },
    'guest': {
        name: 'Guest',
        products: [
            { id: 'ansen', name: 'Ansen', price: 750, legType: 'wood', image: localImage('/series-images/jsi_ansen_comp_00002.jpg'), thumbScale: 1.5, heroScale: 1.25 },
            { id: 'arwyn-guest', name: 'Arwyn', price: 520, legType: 'wood', image: localImage('/category-images/guest-images/jsi_arwyn_comp_00032.jpg'), thumbScale: 1.4, heroScale: 1.2 },
            { id: 'avini', name: 'Avini', price: 760, legType: 'wood', image: localImage('/category-images/guest-images/jsi_avini_comp_00007.jpg'), thumbScale: 1.7, heroScale: 1.35 },
            { id: 'boston', name: 'Boston', price: 780, legType: 'wood', image: localImage('/category-images/guest-images/jsi_boston_comp_0007_jBfEUNr.jpg'), thumbScale: 1.65, heroScale: 1.3 },
            { id: 'bourne', name: 'Bourne', price: 560, legType: 'wood', image: localImage('/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg'), thumbScale: 1.3, heroScale: 1.15 },
            { id: 'bryn', name: 'Bryn', price: 900, legType: 'wood', image: localImage('/category-images/guest-images/jsi_bryn_comp_00023.jpg'), thumbScale: 1.6, heroScale: 1.3 },
            { id: 'collective-motion', name: 'Collective Motion', price: 800, legType: 'metal', image: localImage('/category-images/guest-images/jsi_collectivemotion_comp_00014.jpg'), thumbScale: 1.6, heroScale: 1.25 },
            { id: 'cosgrove', name: 'Cosgrove', price: 610, legType: 'metal', image: localImage('/category-images/guest-images/jsi_cosgrove_comp_guest_midback_arms_00004.jpg'), thumbScale: 1.5, heroScale: 1.25 },
            { id: 'harbor', name: 'Harbor', price: 880, legType: 'wood', image: localImage('/category-images/guest-images/jsi_harbor_comp_00010_7pPSeR6.jpg'), thumbScale: 1.55, heroScale: 1.25 },
            { id: 'henley', name: 'Henley', price: 630, legType: 'wood', image: localImage('/category-images/guest-images/jsi_henley_comp_00001.jpg'), thumbScale: 1.5, heroScale: 1.25 },
            { id: 'knox', name: 'Knox', price: 640, legType: 'metal', image: localImage('/category-images/guest-images/jsi_knox_comp_00020.jpg'), thumbScale: 1.8, heroScale: 1.35 },
            { id: 'madison', name: 'Madison', price: 820, legType: 'wood', image: localImage('/category-images/guest-images/jsi_madison_comp_00003.jpg'), thumbScale: 1.6, heroScale: 1.3 },
            { id: 'millie', name: 'Millie', price: 840, legType: 'wood', image: localImage('/category-images/guest-images/jsi_millie_comp_00005_g77W9GX.jpg'), thumbScale: 1.75, heroScale: 1.35 },
            { id: 'ramona', name: 'Ramona', price: 660, legType: 'wood', image: localImage('/category-images/guest-images/jsi_ramona_comp_rotation_ra2581f_00001.jpg'), thumbScale: 1.6, heroScale: 1.3 },
            { id: 'ria', name: 'Ria', price: 680, legType: 'metal', image: localImage('/category-images/guest-images/jsi_ria_comp_00007.jpg'), thumbScale: 1.9, heroScale: 1.4 },
            { id: 'satisse', name: 'Satisse', price: 705, legType: 'metal', image: localImage('/category-images/guest-images/jsi_satisse_comp_00001_LwTdLhw.jpg'), thumbScale: 2.0, heroScale: 1.5 },
            { id: 'sosa', name: 'Sosa', price: 720, legType: 'metal', image: localImage('/category-images/guest-images/jsi_sosa_comp_00020.jpg'), thumbScale: 1.7, heroScale: 1.3 },
            { id: 'totem', name: 'Totem', price: 860, legType: 'wood', image: localImage('/category-images/guest-images/jsi_totem_comp_00003.jpg'), thumbScale: 1.5, heroScale: 1.2 },
            { id: 'wink', name: 'Wink', price: 740, legType: 'wood', image: localImage('/category-images/guest-images/jsi_wink_comp_00070.jpg'), thumbScale: 1.9, heroScale: 1.4 }
        ],
        competition: [],
        competitionByProduct: {
            'ansen': [comp('OFS Rowen Stool', '$775', '-3%'), comp('Kimball Pep Counter', '$760', '-1%'), comp('SitOnIt Wit Counter', '$740', '+1%')],
            'arwyn-guest': [comp('OFS Heya', '$550', '-5%'), comp('Kimball Joya', '$565', '-8%'), comp('Indiana Ovation', '$540', '-3%'), comp('SitOnIt Wit Guest', '$495', '+5%'), comp('Allsteel Aspect', '$590', '-11%')],
            'bourne': [comp('OFS Rowen', '$575', '-3%'), comp('Kimball Pep', '$560', '0%'), comp('Indiana Strut', '$545', '+2%')],
            'cosgrove': [comp('SitOnIt Cameo', '$640', '-5%'), comp('Kimball Kaia', '$655', '-7%'), comp('OFS Coact', '$625', '-2%')],
            'henley': [comp('OFS Rowen Wood', '$650', '-3%'), comp('Kimball Nash', '$640', '-1%'), comp('Indiana Ovation Wood', '$630', '0%')],
            'knox': [comp('SitOnIt Sona', '$660', '-3%'), comp('Kimball Kolo', '$675', '-5%'), comp('OFS Tandem', '$655', '-2%')],
            'ramona': [comp('OFS Modern Amenity', '$685', '-4%'), comp('Kimball Villa', '$670', '-1%'), comp('Indiana Clutch', '$660', '0%')],
            'ria': [comp('SitOnIt Rio', '$700', '-3%'), comp('Kimball Pep Metal', '$690', '-1%'), comp('OFS Lite Metal', '$680', '0%')],
            'satisse': [comp('SitOnIt Amplify Guest', '$730', '-4%'), comp('Kimball Joya Metal', '$725', '-3%'), comp('OFS Eleven Metal', '$715', '-1%')],
            'sosa': [comp('SitOnIt Movi', '$735', '-2%'), comp('Kimball Bloom', '$730', '-1%'), comp('OFS Rally', '$720', '0%')],
            'wink': [comp('SitOnIt Wit Wood', '$760', '-3%'), comp('Kimball Nash Wood', '$755', '-2%'), comp('OFS Heya Wood', '$745', '-1%')],
            'avini': [comp('SitOnIt Focus', '$780', '-3%'), comp('Kimball Villa Wood', '$775', '-2%'), comp('OFS Coact Wood', '$760', '0%')],
            'boston': [comp('SitOnIt Relay', '$800', '-3%'), comp('Kimball Dock Guest', '$795', '-2%'), comp('OFS Lite Wood', '$782', '-0%')],
            'collective-motion': [comp('SitOnIt Flex', '$820', '-2%'), comp('Kimball Alterna Motion', '$815', '-2%'), comp('OFS Motum', '$808', '-1%')],
            'madison': [comp('SitOnIt InFlex', '$835', '-2%'), comp('Kimball Scenario', '$828', '-1%'), comp('OFS Rally Wood', '$820', '0%')],
            'millie': [comp('SitOnIt Novo Guest', '$860', '-2%'), comp('Kimball Axiom', '$855', '-2%'), comp('OFS Eleven Wood', '$848', '-1%')],
            'totem': [comp('SitOnIt Focus Wood', '$880', '-2%'), comp('Kimball EveryDay', '$875', '-2%'), comp('OFS Coact Low', '$865', '-1%')],
            'harbor': [comp('SitOnIt ReAlign', '$900', '-2%'), comp('Kimball Stria', '$895', '-2%'), comp('OFS Modern Amenity High', '$885', '-1%')],
            'bryn': [comp('SitOnIt Wit Plus', '$920', '-2%'), comp('Kimball Joya Plus', '$915', '-2%'), comp('OFS Coact Plus', '$905', '-1%')]
        }
    },
    'lounge': {
        name: 'Lounge',
        products: [
            { id: 'arwyn', name: 'Arwyn', price: 1500, image: localImage('/category-images/lounge-images/api_arwyn.jpg') },
            { id: 'bespace-lounge', name: 'BeSPACE', price: 1900, image: localImage('/category-images/lounge-images/api_bespace.jpg') },
            { id: 'bourne-lounge', name: 'Bourne', price: 1625, image: localImage('/category-images/lounge-images/api_bourne.jpg') },
            { id: 'caav', name: 'Caav', price: 1800, image: localImage('/category-images/lounge-images/api_caav.jpg') },
            { id: 'connect-lounge', name: 'Connect', price: 1720, image: localImage('/category-images/lounge-images/api_connect.jpg') },
            { id: 'finn', name: 'Finn', price: 1600, image: localImage('/category-images/lounge-images/api_finn.jpg') },
            { id: 'finn-nu-lounge', name: 'Finn Nu', price: 1650, image: localImage('/category-images/lounge-images/api_finn-nu.jpg') },
            { id: 'harbor-lounge', name: 'Harbor', price: 1820, image: localImage('/category-images/lounge-images/api_harbor.jpg') },
            { id: 'indie-lounge', name: 'Indie', price: 1700, image: localImage('/category-images/lounge-images/api_indie.jpg') },
            { id: 'jude-lounge', name: 'Jude', price: 1680, image: localImage('/category-images/lounge-images/api_jude.jpg') },
            { id: 'moto-lounge', name: 'Moto', price: 1760, image: localImage('/category-images/lounge-images/api_moto.jpg') },
            { id: 'poet-lounge', name: 'Poet', price: 1750, image: localImage('/category-images/lounge-images/api_poet.jpg') },
            { id: 'satisse-lounge', name: 'Satisse', price: 1880, image: localImage('/category-images/lounge-images/api_satisse.jpg') },
            { id: 'teekan-lounge', name: 'Teekan', price: 1850, image: localImage('/category-images/lounge-images/api_teekan.jpg') },
        ],
        competition: [],
        competitionByProduct: {
            'arwyn': [comp('OFS Heya Lounge', '$1580', '-5%'), comp('Kimball Villa Lounge', '$1625', '-7%'), comp('Indiana Ovation Lounge', '$1490', '+1%')],
            'caav': [comp('OFS Eleven Lounge', '$1880', '-4%'), comp('Kimball Axiom Lounge', '$1850', '-3%'), comp('Allsteel Rise', '$1790', '+1%')],
            'finn': [comp('OFS Coact Lounge', '$1650', '-3%'), comp('Kimball Joya Lounge', '$1620', '-1%'), comp('Indiana Comfort', '$1550', '+3%')]
        }
    },
    'swivels': {
        name: 'Swivels',
        products: [
            { id: 'americana-swivel', name: 'Americana', price: 860, image: localImage('/category-images/swivel-images/api_americana.jpg') },
            { id: 'arwyn-swivel', name: 'Arwyn', price: 1300, image: localImage('/category-images/swivel-images/api_arwyn.jpg') },
            { id: 'boston-swivel', name: 'Boston', price: 890, image: localImage('/category-images/swivel-images/api_boston.jpg') },
            { id: 'cosgrove-swivel', name: 'Cosgrove', price: 1250, image: localImage('/category-images/swivel-images/api_cosgrove.jpg') },
            { id: 'garvey-r5', name: 'Garvey R5', price: 980, image: localImage('/category-images/swivel-images/api_garvey-r5.jpg') },
            { id: 'harbor-swivel', name: 'Harbor', price: 1010, image: localImage('/category-images/swivel-images/api_harbor.jpg') },
            { id: 'knox-swivel', name: 'Knox', price: 940, image: localImage('/category-images/swivel-images/api_knox.jpg') },
            { id: 'madison-swivel', name: 'Madison', price: 1070, image: localImage('/category-images/swivel-images/api_madison.jpg') },
            { id: 'newton-swivel', name: 'Newton', price: 920, image: localImage('/category-images/swivel-images/api_newton.jpg') },
            { id: 'protocol', name: 'Protocol', price: 1180, image: localImage('/category-images/swivel-images/api_protocol.jpg') },
            { id: 'proxy-swivel', name: 'Proxy', price: 1050, image: localImage('/category-images/swivel-images/api_proxy.jpg') },
        ],
        competition: [],
        competitionByProduct: {
            'arwyn-swivel': [comp('SitOnIt Focus Task', '$1350', '-4%'), comp('Kimball Joya Task', '$1365', '-5%'), comp('OFS Rally Task', '$1310', '-1%')],
            'wink': [comp('SitOnIt Wit Task', '$520', '-4%'), comp('Kimball Pep Task', '$515', '-3%'), comp('OFS Lite Task', '$505', '-1%')],
            'protocol': [comp('SitOnIt Amplify', '$835', '-4%'), comp('Kimball Task Pro', '$825', '-3%'), comp('OFS Rally Lite', '$810', '-1%')]
        }
    },
    'credenzas': {
        name: 'Credenzas',
        products: [
            { id: 'anthology-credenza', name: 'Anthology', price: 3800, image: jsiImg('65C203636CBT_tub1u5') },
            { id: 'bespace-credenza', name: 'BeSPACE', price: 2600, image: jsiImg('BS1854-16SOS_vrllgw') },
            { id: 'brogan-credenza', name: 'Brogan', price: 3200, image: jsiImg('BG2472BSC_tmlvpm') },
            { id: 'finale-credenza', name: 'Finale', price: 3600, image: jsiImg('FN2472BSC_ysfjt7') },
            { id: 'flux-credenza', name: 'Flux', price: 2800, image: jsiImg('FLT2272-29F282_sqzk2c') },
            { id: 'lok-credenza', name: 'Lok', price: 2500, image: jsiImg('LKT2072-29L777_tza7jd') },
            { id: 'native-credenza', name: 'Native', price: 3000, image: jsiImg('NAT2436-36RSC_zjjpem') },
            { id: 'vision-credenza', name: 'Vision', price: 2400, image: jsiImg('VST2472SC_pvusmr') },
            { id: 'walden-credenza', name: 'Walden', price: 4000, image: jsiImg('WN2HDP1-2574_pllrs7') },
            { id: 'wellington-credenza', name: 'Wellington', price: 4400, image: jsiImg('CR8071-HD_szybmv') },
        ],
        competition: [],
        competitionByProduct: {
            'vision-credenza': [comp('OFS Staks Credenza', '$2550', '-6%'), comp('Kimball Narrate Storage', '$2620', '-8%'), comp('Hon Abound Credenza', '$2340', '+3%')],
            'flux-credenza': [comp('OFS ReframE Storage', '$2920', '-4%'), comp('Kimball Alterna Credenza', '$2880', '-3%'), comp('Indiana Gesso Storage', '$2750', '+2%')],
            'walden-credenza': [comp('Kimball Hum Credenza', '$4150', '-4%'), comp('OFS Eleven Credenza', '$4280', '-7%'), comp('Indiana Compel Storage', '$3900', '+3%')],
            'wellington-credenza': [comp('Kimball Evoke Credenza', '$4580', '-4%'), comp('OFS Slate Credenza', '$4680', '-6%'), comp('Hon Coordinate Storage', '$4280', '+3%')]
        }
    }
};

export const FABRICS_DATA = [
    // Arc-Com Fabrics
    { supplier: 'Arc-Com', pattern: 'Astor', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Alden' },
    { supplier: 'Arc-Com', pattern: 'Caldera', grade: 'B', tackable: 'no', textile: 'Coated', series: 'Alden' },
    { supplier: 'Arc-Com', pattern: 'Demo', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Alden' },
    { supplier: 'Arc-Com', pattern: 'Traverse', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Arwyn' },
    { supplier: 'Arc-Com', pattern: 'Kinetic', grade: 'A', tackable: 'no', textile: 'Coated', series: 'Arwyn' },
    { supplier: 'Arc-Com', pattern: 'Highlight', grade: 'B', tackable: 'yes', textile: 'Fabric', series: 'Arwyn' },
    { supplier: 'Arc-Com', pattern: 'Prospect', grade: 'D', tackable: 'yes', textile: 'Fabric', series: 'Vision' },
    { supplier: 'Arc-Com', pattern: 'Metro', grade: 'C', tackable: 'no', textile: 'Fabric', series: 'Wink' },
    { supplier: 'Arc-Com', pattern: 'Rally', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Convert' },
    { supplier: 'Arc-Com', pattern: 'Strand', grade: 'B', tackable: 'no', textile: 'Coated', series: 'Symmetry' },
    
    // Maharam Fabrics
    { supplier: 'Maharam', pattern: 'Origin', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Vision' },
    { supplier: 'Maharam', pattern: 'Climb', grade: 'D', tackable: 'no', textile: 'Fabric', series: 'Vision' },
    { supplier: 'Maharam', pattern: 'Rigid', grade: 'B', tackable: 'yes', textile: 'Fabric', series: 'Wink' },
    { supplier: 'Maharam', pattern: 'Mode', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Symmetry' },
    { supplier: 'Maharam', pattern: 'Relay', grade: 'B', tackable: 'yes', textile: 'Fabric', series: 'Arwyn' },
    { supplier: 'Maharam', pattern: 'Canvas', grade: 'C', tackable: 'no', textile: 'Fabric', series: 'Alden' },
    
    // Momentum Fabrics
    { supplier: 'Momentum', pattern: 'Luxe Weave', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Convert' },
    { supplier: 'Momentum', pattern: 'Origin', grade: 'B', tackable: 'no', textile: 'Fabric', series: 'Vision' },
    { supplier: 'Momentum', pattern: 'Prospect', grade: 'D', tackable: 'yes', textile: 'Coated', series: 'Momentum' },
    { supplier: 'Momentum', pattern: 'Riff', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Arwyn' },
    { supplier: 'Momentum', pattern: 'Silica', grade: 'E', tackable: 'no', textile: 'Fabric', series: 'Alden' },
    
    // Architex Fabrics
    { supplier: 'Architex', pattern: 'Origin', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Allied' },
    { supplier: 'Architex', pattern: 'Crossgrain', grade: 'E', tackable: 'no', textile: 'Panel', series: 'Proton' },
    
    // Traditions Fabrics
    { supplier: 'Traditions', pattern: 'Heritage Tweed', grade: 'F', tackable: 'yes', textile: 'Fabric', series: 'Reveal' },
    { supplier: 'Traditions', pattern: 'Eco Wool', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Midwest' },
    
    // CF Stinson Fabrics
    { supplier: 'CF Stinson', pattern: 'Beeline', grade: 'B', tackable: 'no', textile: 'Fabric', series: 'Cincture' },
    { supplier: 'CF Stinson', pattern: 'Honeycomb', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Aria' },
    
    // Designtex Fabrics
    { supplier: 'Designtex', pattern: 'Eco Tweed', grade: 'G', tackable: 'yes', textile: 'Fabric', series: 'Anthology' },
    { supplier: 'Designtex', pattern: 'Melange', grade: 'H', tackable: 'no', textile: 'Coated', series: 'Wink' },
    
    // Kvadrat Fabrics
    { supplier: 'Kvadrat', pattern: 'Remix 3', grade: 'I', tackable: 'yes', textile: 'Fabric', series: 'Convert' },
    { supplier: 'Kvadrat', pattern: 'Pixel', grade: 'J', tackable: 'no', textile: 'Panel', series: 'Vision' },
    
    // Camira Fabrics
    { supplier: 'Camira', pattern: 'Dapper', grade: 'L1', tackable: 'yes', textile: 'Fabric', series: 'Symmetry' },
    { supplier: 'Camira', pattern: 'Urban', grade: 'L2', tackable: 'no', textile: 'Leather', series: 'Proton' },
    
    // Carnegie Fabrics
    { supplier: 'Carnegie', pattern: 'Metro', grade: 'COL', tackable: 'yes', textile: 'Fabric', series: 'Allied' },
    { supplier: 'Carnegie', pattern: 'Cityscape', grade: 'COM', tackable: 'no', textile: 'Coated', series: 'Momentum' },
    
    // Guilford of Maine
    { supplier: 'Guilford of Maine', pattern: 'Coastal', grade: 'A', tackable: 'yes', textile: 'Fabric', series: 'Reveal' },
    { supplier: 'Guilford of Maine', pattern: 'Maritime', grade: 'B', tackable: 'no', textile: 'Panel', series: 'Midwest' },
    
    // Knoll Fabrics
    { supplier: 'Knoll', pattern: 'Modern', grade: 'C', tackable: 'yes', textile: 'Fabric', series: 'Cincture' },
    { supplier: 'Knoll', pattern: 'Classic', grade: 'D', tackable: 'no', textile: 'Leather', series: 'Aria' },
    
    // Kravet Fabrics
    { supplier: 'Kravet', pattern: 'Elegance', grade: 'E', tackable: 'yes', textile: 'Fabric', series: 'Anthology' },
    { supplier: 'Kravet', pattern: 'Sophisticate', grade: 'F', tackable: 'no', textile: 'Coated', series: 'Wink' }
];

export const JSI_MODELS = [
    { id: 'AW6007', name: 'Arwyn Swivel Chair', isUpholstered: true },
    { id: 'BR2301', name: 'Bryn Guest Chair', isUpholstered: true },
    { id: 'CV4501', name: 'Caav Lounge Chair', isUpholstered: true },
    { id: 'WK4501', name: 'Wink Task Chair', isUpholstered: true },
    { id: 'KN2301', name: 'Knox Counter Stool', isUpholstered: true },
    { id: 'FN5001', name: 'Finn Lounge Chair', isUpholstered: true },
    { id: 'PT5301', name: 'Poet Barstool', isUpholstered: false },
    { id: 'VCT1248', name: 'Vision Conference Table', isUpholstered: false },
    { id: 'AR6001', name: 'Arwyn Guest Chair', isUpholstered: true },
    { id: 'MD5501', name: 'Madison Lounge Chair', isUpholstered: true },
    { id: 'PR4001', name: 'Protocol Task Chair', isUpholstered: true },
    { id: 'GV2301', name: 'Garvey RS Chair', isUpholstered: true },
    { id: 'HN3001', name: 'Henley Guest Chair', isUpholstered: true },
    { id: 'JD4501', name: 'Jude Lounge Chair', isUpholstered: true },
    { id: 'KL2001', name: 'Kyla Guest Chair', isUpholstered: true }
];

export const JSI_LAMINATES = ['Nevada Slate', 'Urban Concrete', 'Smoked Hickory', 'Arctic Oak', 'Tuscan Marble', 'Brushed Steel', 'Midnight Linen', 'Riverstone Gray', 'Golden Teak', 'Sahara Sand'];

export const JSI_VENEERS = ['Rift Cut Oak', 'Smoked Walnut', 'Figured Anigre', 'Reconstituted Ebony', 'Fumed Eucalyptus', 'Birdseye Maple', 'Cherry Burl', 'Sapele Pommele', 'Zebrawood', 'Koa'];

export const VISION_MATERIALS = ['TFL', 'HPL', 'Veneer'];

// Product categories for main products screen
export const PRODUCTS_CATEGORIES_DATA = [
    {
        name: 'Casegoods',
        description: 'Private office desk systems',
        nav: 'products/category/casegoods',
        images: [
            '/category-images/casegood-images/api_vision.jpg',
            '/category-images/casegood-images/api_flux-private-office.jpg',
            '/category-images/casegood-images/api_brogan.jpg'
        ].map(localImage)
    },
    {
        name: 'Conference Tables',
        description: 'Meeting and collaboration tables',
        nav: 'products/category/conference-tables',
        images: [
            '/category-images/conference-images/api_vision.jpg',
            '/category-images/conference-images/api_reef.jpg',
            '/category-images/conference-images/api_moto.jpg'
        ].map(localImage)
    },
    {
        name: 'Guest',
        description: 'Visitor and side seating',
        nav: 'products/category/guest',
        images: [
            '/category-images/guest-images/jsi_arwyn_comp_00032.jpg',
            '/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg',
            '/category-images/guest-images/jsi_knox_comp_00020.jpg'
        ].map(localImage)
    },
    {
        name: 'Lounge',
        description: 'Casual and soft seating',
        nav: 'products/category/lounge',
        images: [
            '/category-images/lounge-images/api_arwyn.jpg',
            '/category-images/lounge-images/api_caav.jpg',
            '/category-images/lounge-images/api_poet.jpg'
        ].map(localImage)
    },
    {
        name: 'Swivels',
        description: 'Task and office chairs',
        nav: 'products/category/swivels',
        images: [
            '/category-images/swivel-images/api_arwyn.jpg',
            '/category-images/swivel-images/api_protocol.jpg',
            '/category-images/swivel-images/api_garvey-r5.jpg'
        ].map(localImage)
    },
    {
        name: 'Credenzas',
        description: 'Storage and credenza solutions',
        nav: 'products/category/credenzas',
        images: [
            jsiImg('VST2472SC_pvusmr'),
            jsiImg('WN2HDP1-2574_pllrs7'),
            jsiImg('FLT2272-29F282_sqzk2c'),
        ]
    },
    {
        name: 'Benches',
        description: 'Multi-seat solutions',
        nav: 'products/category/benches',
        images: [
            '/category-images/bench-images/api_native.jpg',
            '/category-images/bench-images/api_poet.jpg',
            '/category-images/bench-images/api_indie.jpg'
        ].map(localImage)
    }
];

// Re-export the single-source-of-truth series list so existing imports keep working
export { JSI_SERIES } from '../../data/jsiSeries.js';

// Map series slug (e.g. 'harbor') → array of { categoryId, categoryName, productId, productName, image }
// by scanning PRODUCT_DATA. Collects ALL categories a series appears in.
const _seriesMulti = {};
for (const [catId, cat] of Object.entries(PRODUCT_DATA)) {
    for (const p of cat.products || []) {
        const slug = p.name.toLowerCase().replace(/\s+/g, '-');
        const entry = { categoryId: catId, categoryName: cat.name, productId: p.id, productName: p.name, image: p.image };
        if (!_seriesMulti[slug]) _seriesMulti[slug] = [];
        _seriesMulti[slug].push(entry);
        // Also index by product id for direct lookups
        if (slug !== p.id) {
            if (!_seriesMulti[p.id]) _seriesMulti[p.id] = [];
            _seriesMulti[p.id].push(entry);
        }
    }
}
export const SERIES_CATEGORIES = Object.freeze(_seriesMulti);

// Convenience: single-match lookup (first category found) — kept for backwards compat
export const SERIES_TO_CATEGORY = Object.freeze(
    Object.fromEntries(Object.entries(_seriesMulti).map(([k, v]) => [k, v[0]]))
);

// Re-export new hierarchical data + API abstraction
export { PRODUCT_FAMILIES, PRODUCT_SUBCATEGORIES, PRODUCT_MODELS, PRODUCT_CATEGORIES } from './productHierarchy.js';
export * from './productApi.js';
