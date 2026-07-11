// Products feature data
import { cloudinaryImageUrl } from '../../utils/cloudinary.js';
import { slugify } from '../../utils/normalizeText.js';

const localImage = (path) => path;
const jsiImg = (publicId, size = 'medium') => cloudinaryImageUrl(publicId, size);
const comp = (name, laminate) => ({ id: slugify(name), name, laminate });

/*
 * List prices verified against the JSI price lists effective January 19, 2026
 * (webresources.jsifurniture.com per-series PDFs — same source as the
 * jsifurniture.com product landing pages' "Starting At" figures).
 *
 * price       = COM / base list price of the referenced model (site "Starting At")
 * veneerPrice = veneer list price where the series offers laminate + veneer;
 *               veneer-standard series (Brogan, Finale, Walden, Wellington)
 *               carry the same figure in both fields.
 * Model references are noted per entry so future price-list updates are
 * a straight lookup.
 */
export const PRODUCT_DATA = {
    'benches': {
        name: 'Benches',
        products: [
            // Americana 52¼"w bench $2,743 · Arwyn AW1960 19x60 bench $2,107
            { id: 'americana-bench', name: 'Americana', price: 2743, image: localImage('/category-images/bench-images/api_americana.jpg') },
            { id: 'arwyn-bench', name: 'Arwyn', price: 2107, image: localImage('/category-images/bench-images/api_arwyn.jpg') },
            // BeSPACE BS240 24" straight bench $1,531 · Boston 49½"w bench $5,033
            { id: 'bespace-bench', name: 'BeSPACE', price: 1531, image: localImage('/category-images/bench-images/api_bespace.jpg') },
            { id: 'boston-bench', name: 'Boston', price: 5033, image: localImage('/category-images/bench-images/api_boston.jpg') },
            // Connect CTL1200 single seat bench $1,748 · Finn Nu FI2371 single bench $1,442
            { id: 'connect-bench', name: 'Connect', price: 1748, image: localImage('/category-images/bench-images/api_connect.jpg') },
            { id: 'finn-nu-bench', name: 'Finn Nu', price: 1442, image: localImage('/category-images/bench-images/api_finn-nu.jpg') },
            // Indie INB1855-19OVB oval bench $2,145 · Native NAB2048-19BEN two-seat bench $2,474
            { id: 'indie', name: 'Indie', price: 2145, image: localImage('/category-images/bench-images/api_indie.jpg') },
            { id: 'native', name: 'Native', price: 2474, image: localImage('/category-images/bench-images/api_native.jpg') },
            // Oxley OX2152P single seat bench $2,190 · Poet PLPMB01 modular single bench $1,632
            { id: 'oxley', name: 'Oxley', price: 2190, image: localImage('/category-images/bench-images/api_oxley.jpg') },
            { id: 'poet', name: 'Poet', price: 1632, image: localImage('/category-images/bench-images/api_poet.jpg') },
        ],
        competitionByProduct: {
            'americana-bench': [comp('OFS Rowen Bench', '$2670'), comp('Kimball EverySpace', '$2795'), comp('Indiana Clutch', '$2635')],
            'native': [comp('OFS Rowen Bench', '$2575'), comp('Kimball EverySpace', '$2730'), comp('Indiana Clutch', '$2435')],
            'poet': [comp('OFS Lite', '$1665'), comp('Kimball Pep Bench', '$1590'), comp('SitOnIt Nomad', '$1545')],
            'indie': [comp('OFS Modern Amenity', '$2250'), comp('Kimball Alterna', '$2195'), comp('Global Duet', '$2080')]
        }
    },
    'casegoods': {
        name: 'Casegoods',
        // price = 30x66 single/double pedestal desk (site "Starting At" for the desk group)
        products: [
            // Brogan BG3066RD $4,691 (veneer standard)
            { id: 'brogan', name: 'Brogan', price: 4691, veneerPrice: 4691, image: localImage('/category-images/casegood-images/api_brogan.jpg') },
            // Finale FN3066RD $5,157 (veneer standard)
            { id: 'finale', name: 'Finale', price: 5157, veneerPrice: 5157, image: localImage('/category-images/casegood-images/api_finale.jpg') },
            // Flux FLT3066DD $3,233 / FLV3066DD $4,513
            { id: 'flux', name: 'Flux', price: 3233, veneerPrice: 4513, image: localImage('/category-images/casegood-images/api_flux-private-office.jpg') },
            // Vision VST3066RD $2,004 / VSV3066RD $3,360
            { id: 'vision', name: 'Vision', price: 2004, veneerPrice: 3360, image: localImage('/category-images/casegood-images/api_vision.jpg') },
        ],
        competitionByProduct: {
            'vision': [comp('OFS Staks', '$2100'), comp('Kimball Narrate', '$2145'), comp('Indiana Canvas', '$1990'), comp('Hon Abound', '$1910')],
            'flux': [comp('OFS ReframE', '$3345'), comp('Kimball Alterna', '$3300'), comp('Indiana Gesso', '$3190')],
            'brogan': [comp('Kimball Priority', '$4860'), comp('OFS Aptos', '$4945'), comp('Teknion Expansion', '$4675')],
            'finale': [comp('OFS Impulse', '$5320'), comp('Kimball Xsede', '$5400'), comp('Hon Accelerate', '$5045')]
        }
    },
    'conference-tables': {
        name: 'Conference Tables',
        // price = smallest complete 36x72-class conference/meeting table
        products: [
            // Anthology 65T3672TT top $491 + 65T2472FRBM frame base kit $1,394 (veneer top $2,122 + kit)
            { id: 'anthology-table', name: 'Anthology', price: 1885, veneerPrice: 3516, image: localImage('/category-images/conference-images/api_anthology.jpg') },
            // Brogan BG3672CTP complete $4,782 (veneer standard)
            { id: 'brogan-table', name: 'Brogan', price: 4782, veneerPrice: 4782, image: localImage('/category-images/conference-images/api_brogan.jpg') },
            // Finale FN3672CTP complete $6,207 (veneer standard)
            { id: 'finale-table', name: 'Finale', price: 6207, veneerPrice: 6207, image: localImage('/category-images/conference-images/api_finale.jpg') },
            // Lok LKT3672-29TTT $2,230 / veneer $2,792
            { id: 'lok-conference-table', name: 'Lok Conference', price: 2230, veneerPrice: 2792, image: localImage('/category-images/conference-images/api_lok-conference.jpg') },
            // Moto MTT4854-39MATB $5,276 / MTV4854-39MATB $6,639
            { id: 'moto', name: 'Moto', price: 5276, veneerPrice: 6639, image: localImage('/category-images/conference-images/api_moto.jpg') },
            // Reef RET3672-37PT $1,684 / REV3672-37PT $4,229
            { id: 'reef', name: 'Reef', price: 1684, veneerPrice: 4229, image: localImage('/category-images/conference-images/api_reef.jpg') },
            // Vision VST3672TT $1,268 + 2x VST2428PBA $1,092 = $3,452 / veneer VSV3672CTP $4,557
            { id: 'vision-table', name: 'Vision', price: 3452, veneerPrice: 4557, image: localImage('/category-images/conference-images/api_vision.jpg') },
            // Walden WN8JDG4-0042 $7,716 (veneer standard)
            { id: 'walden-table', name: 'Walden', price: 7716, veneerPrice: 7716, image: localImage('/category-images/conference-images/api_walden.jpg') },
            // Wellington WE8JDT4-0042 $9,082 (veneer standard)
            { id: 'wellington-table', name: 'Wellington', price: 9082, veneerPrice: 9082, image: localImage('/category-images/conference-images/api_wellington.jpg') },
        ],
        competitionByProduct: {
            'vision-table': [comp('OFS Eleven Table', '$3550'), comp('Kimball Dock', '$3490'), comp('Indiana Canvas Meet', '$3360')],
            'reef': [comp('Kimball KORE', '$1735'), comp('OFS Applause', '$1685'), comp('Hon Preside', '$1625')],
            'moto': [comp('OFS Thrive', '$5440'), comp('Kimball Pairings Table', '$5380'), comp('SitOnIt Amplify Table', '$5170')]
        }
    },
    'guest': {
        name: 'Guest',
        // Ansen and Avini are no longer in the JSI price lists / on jsifurniture.com.
        products: [
            // Arwyn AW6000WL guest chair wood leg $1,821 · AW6000ML metal leg $1,892
            { id: 'arwyn-guest', name: 'Arwyn', price: 1821, legType: 'wood', image: localImage('/category-images/guest-images/jsi_arwyn_comp_00032.jpg'), thumbScale: 1.4, heroScale: 1.2 },
            { id: 'arwyn-guest-metal', name: 'Arwyn', price: 1892, legType: 'metal', image: localImage('/category-images/guest-images/jsi_arwyn_comp_00032.jpg'), thumbScale: 1.4, heroScale: 1.2 },
            // Boston 981A guest chair w/ arms, all wood $1,416
            { id: 'boston', name: 'Boston', price: 1416, legType: 'wood', image: localImage('/category-images/guest-images/jsi_boston_comp_0007_jBfEUNr.jpg'), thumbScale: 1.65, heroScale: 1.3 },
            // Bourne BU7511D guest chair $1,637
            { id: 'bourne', name: 'Bourne', price: 1637, legType: 'wood', image: localImage('/category-images/guest-images/jsi_bourne_comp_00002_k6eFRce.jpg'), thumbScale: 1.3, heroScale: 1.15 },
            // Bryn BY2101PU guest chair, poly seat/back $934
            { id: 'bryn', name: 'Bryn', price: 934, legType: 'wood', image: localImage('/category-images/guest-images/jsi_bryn_comp_00023.jpg'), thumbScale: 1.6, heroScale: 1.3 },
            // Collective Motion CM4517 mini mobile stool $1,800 (maple frame)
            { id: 'collective-motion', name: 'Collective Motion', price: 1800, legType: 'wood', image: localImage('/category-images/guest-images/jsi_collectivemotion_comp_00014.jpg'), thumbScale: 1.6, heroScale: 1.25 },
            // Cosgrove 72SG mid back guest w/ arms, 4-star base $1,562
            { id: 'cosgrove', name: 'Cosgrove', price: 1562, legType: 'metal', image: localImage('/category-images/guest-images/jsi_cosgrove_comp_guest_midback_arms_00004.jpg'), thumbScale: 1.5, heroScale: 1.25 },
            // Harbor HB2901 guest chair $1,567
            { id: 'harbor', name: 'Harbor', price: 1567, legType: 'wood', image: localImage('/category-images/guest-images/jsi_harbor_comp_00010_7pPSeR6.jpg'), thumbScale: 1.55, heroScale: 1.25 },
            // Henley 49S192129WW wood guest chair $1,228
            { id: 'henley', name: 'Henley', price: 1228, legType: 'wood', image: localImage('/category-images/guest-images/jsi_henley_comp_00001.jpg'), thumbScale: 1.5, heroScale: 1.25 },
            // Knox KN3003UU armless stack chair $884
            { id: 'knox', name: 'Knox', price: 884, legType: 'metal', image: localImage('/category-images/guest-images/jsi_knox_comp_00020.jpg'), thumbScale: 1.8, heroScale: 1.35 },
            // Madison MA1561F guest chair $976
            { id: 'madison', name: 'Madison', price: 976, legType: 'wood', image: localImage('/category-images/guest-images/jsi_madison_comp_00003.jpg'), thumbScale: 1.6, heroScale: 1.3 },
            // Millie MI853D guest chair $1,192
            { id: 'millie', name: 'Millie', price: 1192, legType: 'wood', image: localImage('/category-images/guest-images/jsi_millie_comp_00005_g77W9GX.jpg'), thumbScale: 1.75, heroScale: 1.35 },
            // Ramona RA2581C guest chair $1,101
            { id: 'ramona', name: 'Ramona', price: 1101, legType: 'wood', image: localImage('/category-images/guest-images/jsi_ramona_comp_rotation_ra2581f_00001.jpg'), thumbScale: 1.6, heroScale: 1.3 },
            // Ria RI2571 guest chair $1,148
            { id: 'ria', name: 'Ria', price: 1148, legType: 'metal', image: localImage('/category-images/guest-images/jsi_ria_comp_00007.jpg'), thumbScale: 1.9, heroScale: 1.4 },
            // Satisse 20SG1 guest chair, narrow arms $1,478
            { id: 'satisse', name: 'Satisse', price: 1478, legType: 'metal', image: localImage('/category-images/guest-images/jsi_satisse_comp_00001_LwTdLhw.jpg'), thumbScale: 2.0, heroScale: 1.5 },
            // Sosa SA1061C guest chair $1,079 (maple frame)
            { id: 'sosa', name: 'Sosa', price: 1079, legType: 'wood', image: localImage('/category-images/guest-images/jsi_sosa_comp_00020.jpg'), thumbScale: 1.7, heroScale: 1.3 },
            // Totem TM17 round pod $782
            { id: 'totem', name: 'Totem', price: 782, legType: 'wood', image: localImage('/category-images/guest-images/jsi_totem_comp_00003.jpg'), thumbScale: 1.5, heroScale: 1.2 },
            // Wink WK811AP armless wood leg guest, plastic seat $1,139
            { id: 'wink', name: 'Wink', price: 1139, legType: 'wood', image: localImage('/category-images/guest-images/jsi_wink_comp_00070.jpg'), thumbScale: 1.9, heroScale: 1.4 }
        ],
        competitionByProduct: {
            'arwyn-guest': [comp('OFS Heya', '$1925'), comp('Kimball Joya', '$1980'), comp('Indiana Ovation', '$1890'), comp('SitOnIt Wit Guest', '$1735'), comp('Allsteel Aspect', '$2065')],
            'arwyn-guest-metal': [comp('OFS Heya', '$1995'), comp('Kimball Joya', '$2055'), comp('Indiana Ovation', '$1960'), comp('SitOnIt Wit Guest', '$1800')],
            'bourne': [comp('OFS Rowen', '$1680'), comp('Kimball Pep', '$1635'), comp('Indiana Strut', '$1595')],
            'cosgrove': [comp('SitOnIt Cameo', '$1640'), comp('Kimball Kaia', '$1675'), comp('OFS Coact', '$1600')],
            'henley': [comp('OFS Rowen Wood', '$1265'), comp('Kimball Nash', '$1250'), comp('Indiana Ovation Wood', '$1230')],
            'knox': [comp('SitOnIt Sona', '$910'), comp('Kimball Kolo', '$930'), comp('OFS Tandem', '$905')],
            'ramona': [comp('OFS Modern Amenity', '$1140'), comp('Kimball Villa', '$1120'), comp('Indiana Clutch', '$1100')],
            'ria': [comp('SitOnIt Rio', '$1180'), comp('Kimball Pep Metal', '$1165'), comp('OFS Lite Metal', '$1150')],
            'satisse': [comp('SitOnIt Amplify Guest', '$1530'), comp('Kimball Joya Metal', '$1520'), comp('OFS Eleven Metal', '$1500')],
            'sosa': [comp('SitOnIt Movi', '$1100'), comp('Kimball Bloom', '$1095'), comp('OFS Rally', '$1080')],
            'wink': [comp('SitOnIt Wit Wood', '$1170'), comp('Kimball Nash Wood', '$1160'), comp('OFS Heya Wood', '$1145')],
            'boston': [comp('SitOnIt Relay', '$1450'), comp('Kimball Dock Guest', '$1445'), comp('OFS Lite Wood', '$1420')],
            'collective-motion': [comp('SitOnIt Flex', '$1845'), comp('Kimball Alterna Motion', '$1835'), comp('OFS Motum', '$1820')],
            'madison': [comp('SitOnIt InFlex', '$995'), comp('Kimball Scenario', '$985'), comp('OFS Rally Wood', '$975')],
            'millie': [comp('SitOnIt Novo Guest', '$1220'), comp('Kimball Axiom', '$1215'), comp('OFS Eleven Wood', '$1205')],
            'totem': [comp('SitOnIt Focus Wood', '$800'), comp('Kimball EveryDay', '$795'), comp('OFS Coact Low', '$785')],
            'harbor': [comp('SitOnIt ReAlign', '$1600'), comp('Kimball Stria', '$1595'), comp('OFS Modern Amenity High', '$1580')],
            'bryn': [comp('SitOnIt Wit Plus', '$955'), comp('Kimball Joya Plus', '$950'), comp('OFS Coact Plus', '$940')]
        }
    },
    'lounge': {
        name: 'Lounge',
        // price = single-seat lounge chair COM/base list
        products: [
            // Arwyn AW6010 single seat, small scale $2,325
            { id: 'arwyn', name: 'Arwyn', price: 2325, image: localImage('/category-images/lounge-images/api_arwyn.jpg') },
            // BeSPACE BS1 single seat lounge $4,189
            { id: 'bespace-lounge', name: 'BeSPACE', price: 4189, image: localImage('/category-images/lounge-images/api_bespace.jpg') },
            // Bourne BU7521D lounge chair $1,927
            { id: 'bourne-lounge', name: 'Bourne', price: 1927, image: localImage('/category-images/lounge-images/api_bourne.jpg') },
            // Caav CVF3440-31 lounge chair $3,721
            { id: 'caav', name: 'Caav', price: 3721, image: localImage('/category-images/lounge-images/api_caav.jpg') },
            // Connect CTL1201 single seat lounge $1,810
            { id: 'connect-lounge', name: 'Connect', price: 1810, image: localImage('/category-images/lounge-images/api_connect.jpg') },
            // Finn FI2321 single seat lounge $2,466
            { id: 'finn', name: 'Finn', price: 2466, image: localImage('/category-images/lounge-images/api_finn.jpg') },
            // Finn Nu FI2351 single seat lounge $1,917
            { id: 'finn-nu-lounge', name: 'Finn Nu', price: 1917, image: localImage('/category-images/lounge-images/api_finn-nu.jpg') },
            // Harbor HB2911 club chair $2,551
            { id: 'harbor-lounge', name: 'Harbor', price: 2551, image: localImage('/category-images/lounge-images/api_harbor.jpg') },
            // Indie single seat mini low lounge $1,735
            { id: 'indie-lounge', name: 'Indie', price: 1735, image: localImage('/category-images/lounge-images/api_indie.jpg') },
            // Jude JU420D lounge chair $2,226
            { id: 'jude-lounge', name: 'Jude', price: 2226, image: localImage('/category-images/lounge-images/api_jude.jpg') },
            // Moto MTL260 lounge chair $1,655
            { id: 'moto-lounge', name: 'Moto', price: 1655, image: localImage('/category-images/lounge-images/api_moto.jpg') },
            // Poet PLPF21 single seat lounge $3,243
            { id: 'poet-lounge', name: 'Poet', price: 3243, image: localImage('/category-images/lounge-images/api_poet.jpg') },
            // Satisse 20SL1 single seat lounge $2,080
            { id: 'satisse-lounge', name: 'Satisse', price: 2080, image: localImage('/category-images/lounge-images/api_satisse.jpg') },
            // Teekan TK1611 single seat lounge $1,936
            { id: 'teekan-lounge', name: 'Teekan', price: 1936, image: localImage('/category-images/lounge-images/api_teekan.jpg') },
        ],
        competitionByProduct: {
            'arwyn': [comp('OFS Heya Lounge', '$2450'), comp('Kimball Villa Lounge', '$2520'), comp('Indiana Ovation Lounge', '$2310')],
            'caav': [comp('OFS Eleven Lounge', '$3885'), comp('Kimball Axiom Lounge', '$3825'), comp('Allsteel Rise', '$3700')],
            'finn': [comp('OFS Coact Lounge', '$2540'), comp('Kimball Joya Lounge', '$2500'), comp('Indiana Comfort', '$2390')]
        }
    },
    'swivels': {
        name: 'Swivels',
        // price = entry task/conference swivel COM/base list
        products: [
            // Americana jury-base swivel $838
            { id: 'americana-swivel', name: 'Americana', price: 838, image: localImage('/category-images/swivel-images/api_americana.jpg') },
            // Arwyn AW6007C swivel conference chair $2,336
            { id: 'arwyn-swivel', name: 'Arwyn', price: 2336, image: localImage('/category-images/swivel-images/api_arwyn.jpg') },
            // Boston 980A swivel chair w/ arms, all wood $1,822
            { id: 'boston-swivel', name: 'Boston', price: 1822, image: localImage('/category-images/swivel-images/api_boston.jpg') },
            // Cosgrove 72SMXA armless mid back swivel $1,149
            { id: 'cosgrove-swivel', name: 'Cosgrove', price: 1149, image: localImage('/category-images/swivel-images/api_cosgrove.jpg') },
            // Garvey R5 GV1721 swivel $1,314
            { id: 'garvey-r5', name: 'Garvey R5', price: 1314, image: localImage('/category-images/swivel-images/api_garvey-r5.jpg') },
            // Harbor HB2900 management swivel $2,091
            { id: 'harbor-swivel', name: 'Harbor', price: 2091, image: localImage('/category-images/swivel-images/api_harbor.jpg') },
            // Knox KN3000PPF flared-arm swivel, all plastic $948
            { id: 'knox-swivel', name: 'Knox', price: 948, image: localImage('/category-images/swivel-images/api_knox.jpg') },
            // Madison MA1500F executive swivel $1,783
            { id: 'madison-swivel', name: 'Madison', price: 1783, image: localImage('/category-images/swivel-images/api_madison.jpg') },
            // Newton NW5100 swivel $1,357
            { id: 'newton-swivel', name: 'Newton', price: 1357, image: localImage('/category-images/swivel-images/api_newton.jpg') },
            // Protocol PT5600 task swivel $2,076
            { id: 'protocol', name: 'Protocol', price: 2076, image: localImage('/category-images/swivel-images/api_protocol.jpg') },
            // Proxy PX800L swivel $1,397
            { id: 'proxy-swivel', name: 'Proxy', price: 1397, image: localImage('/category-images/swivel-images/api_proxy.jpg') },
        ],
        competitionByProduct: {
            'americana-swivel': [comp('SitOnIt Wit Task', '$820'), comp('Kimball Pep Task', '$835'), comp('OFS Lite Task', '$805')],
            'arwyn-swivel': [comp('SitOnIt Focus Task', '$2425'), comp('Kimball Joya Task', '$2455'), comp('OFS Rally Task', '$2355')],
            'protocol': [comp('SitOnIt Amplify', '$2015'), comp('Kimball Task Pro', '$1990'), comp('OFS Rally Lite', '$1950')]
        }
    },
    'credenzas': {
        name: 'Credenzas',
        // price = the exact pictured model's list price (laminate where offered)
        products: [
            // Anthology 65C203636CBT $2,054 / veneer 65C203636CBV $2,737
            { id: 'anthology-credenza', name: 'Anthology', price: 2054, veneerPrice: 2737, image: jsiImg('65C203636CBT_tub1u5') },
            // BeSPACE BS1854-16SOS bench-height credenza $2,648 (veneer standard)
            { id: 'bespace-credenza', name: 'BeSPACE', price: 2648, veneerPrice: 2648, image: jsiImg('BS1854-16SOS_vrllgw') },
            // Brogan BG2472BSC buffet credenza $6,812 (veneer standard)
            { id: 'brogan-credenza', name: 'Brogan', price: 6812, veneerPrice: 6812, image: jsiImg('BG2472BSC_tmlvpm') },
            // Finale FN2472BSC buffet credenza $9,179 (veneer standard)
            { id: 'finale-credenza', name: 'Finale', price: 9179, veneerPrice: 9179, image: jsiImg('FN2472BSC_ysfjt7') },
            // Flux FLT2272-29F282 $3,261 / FLV2272-29F282 $4,551
            { id: 'flux-credenza', name: 'Flux', price: 3261, veneerPrice: 4551, image: jsiImg('FLT2272-29F282_sqzk2c') },
            // Lok LKT2072-29L777 $4,035 / LKV2072-29L777 $5,158
            { id: 'lok-credenza', name: 'Lok', price: 4035, veneerPrice: 5158, image: jsiImg('LKT2072-29L777_tza7jd') },
            // Native NAT2436-36RSC $3,969 / NAV2436-36RSC $4,724
            { id: 'native-credenza', name: 'Native', price: 3969, veneerPrice: 4724, image: jsiImg('NAT2436-36RSC_zjjpem') },
            // Vision VST2472SC $2,588 / VSV2472SC $4,054
            { id: 'vision-credenza', name: 'Vision', price: 2588, veneerPrice: 4054, image: jsiImg('VST2472SC_pvusmr') },
            // Walden WN2HDP1-2574 $9,925 (veneer standard)
            { id: 'walden-credenza', name: 'Walden', price: 9925, veneerPrice: 9925, image: jsiImg('WN2HDP1-2574_pllrs7') },
            // Wellington CR8071-HD $12,147 (veneer standard)
            { id: 'wellington-credenza', name: 'Wellington', price: 12147, veneerPrice: 12147, image: jsiImg('CR8071-HD_szybmv') },
        ],
        competitionByProduct: {
            'vision-credenza': [comp('OFS Staks Credenza', '$2750'), comp('Kimball Narrate Storage', '$2825'), comp('Hon Abound Credenza', '$2525')],
            'flux-credenza': [comp('OFS ReframE Storage', '$3400'), comp('Kimball Alterna Credenza', '$3355'), comp('Indiana Gesso Storage', '$3200')],
            'walden-credenza': [comp('Kimball Hum Credenza', '$10300'), comp('OFS Eleven Credenza', '$10620'), comp('Indiana Compel Storage', '$9675')],
            'wellington-credenza': [comp('Kimball Evoke Credenza', '$12645'), comp('OFS Slate Credenza', '$12925'), comp('Hon Coordinate Storage', '$11820')]
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
    },
];

export const CUSTOMS_CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'reception', label: 'Reception' },
    { id: 'conference', label: 'Conference' },
    { id: 'desks', label: 'Desks' },
    { id: 'planters', label: 'Planters' },
    { id: 'lounge', label: 'Lounge' },
    { id: 'seating', label: 'Seating' },
    { id: 'casegoods', label: 'Casegoods' },
];

export const CUSTOM_OPPORTUNITIES = [
    {
        id: 'arrival-wall-system',
        title: 'Arrival Wall',
        category: 'reception',
        priceLabel: 'Under $34,000 NET',
        image: localImage('/category-images/conference-images/api_reef.jpg'),
        summary: 'A welcome-zone gesture that fuses display shelving, branded surface, and touchdown storage into a single architectural moment.',
        details: 'Integrated signage, display pocketing, and mixed laminate / veneer faces. Lead time 5–7 weeks.',
    },
    {
        id: 'modesty-refresh-kit',
        title: 'Branded Modesty Kit',
        category: 'reception',
        priceLabel: 'Under $6,500 NET',
        image: localImage('/category-images/casegood-images/api_vision.jpg'),
        summary: 'A small-footprint refresh package that updates fronts, reveals, and guest-facing details without reworking the station.',
        details: 'Applied metal reveal, laser-cut logo panel, contrast edge detailing. Lead time 3–4 weeks.',
    },
    {
        id: 'conference-spine-power',
        title: 'Conference Spine',
        category: 'conference',
        priceLabel: 'Under $23,000 NET',
        image: localImage('/category-images/conference-images/api_wellington.jpg'),
        summary: 'A boardroom table organized around a central power spine, with custom access points and finish breaks that feel built-in.',
        details: 'Custom power routing, inset metal details, segmented top construction. Lead time 7–9 weeks.',
    },
    {
        id: 'anthology-boat-shape',
        title: 'Anthology Boat Top',
        category: 'conference',
        priceLabel: 'Under $18,500 NET',
        image: localImage('/category-images/conference-images/jsi_anthology_comp_0006.jpg'),
        summary: 'A long-format Anthology table reshaped to a soft boat plan with paired veneer sequencing and integrated grommet line.',
        details: 'Sequenced veneer faces, soft-radius edge, custom grommet routing. Lead time 6–8 weeks.',
    },
    {
        id: 'founder-suite-signature',
        title: 'Founder Suite',
        category: 'casegoods',
        priceLabel: 'From $48,000 NET',
        image: localImage('/category-images/casegood-images/api_finale.jpg'),
        summary: 'A fully composed private-office statement: bespoke scale, integrated storage, and detail language carried across the room.',
        details: 'Custom veneer sequencing, integrated credenza wall, extended trim and metal package. Lead time 10–14 weeks.',
    },
    {
        id: 'hospitality-credenza-mix',
        title: 'Hospitality Credenza',
        category: 'casegoods',
        priceLabel: 'Under $11,000 NET',
        image: localImage('/category-images/casegood-images/api_brogan.jpg'),
        summary: 'A tuned credenza blend that mixes open display, hidden storage, and a hospitality-friendly serving zone into one piece.',
        details: 'Mixed door conditions, integrated serving shelf, material break at user touch points. Lead time 4–6 weeks.',
    },
    {
        id: 'flux-private-office',
        title: 'Flux Private Office',
        category: 'casegoods',
        priceLabel: 'Under $19,500 NET',
        image: localImage('/category-images/casegood-images/api_flux-private-office.jpg'),
        summary: 'A composed private office built on the Flux platform with custom worksurface scale and a tuned storage wall.',
        details: 'Custom worksurface scale, paired storage wall, mixed pull hardware. Lead time 6–8 weeks.',
    },
    {
        id: 'guest-arc-collection',
        title: 'Guest Arc',
        category: 'seating',
        priceLabel: 'From $2,400 NET / chair',
        image: localImage('/category-images/guest-images/jsi_harbor_comp_00010_7pPSeR6.jpg'),
        summary: 'A guest seating story where finish pairing, stitch detail, and base expression are tuned to the surrounding architecture.',
        details: 'Contrast stitch spec, base finish customization, paired textile strategy. Lead time 5–7 weeks.',
    },
    {
        id: 'market-hall-benching',
        title: 'Market Hall Bench',
        category: 'seating',
        priceLabel: 'Under $9,800 NET',
        image: localImage('/category-images/bench-images/api_native.jpg'),
        summary: 'A modular benching direction with mixed lengths, integrated planters, and surface drops for casual work or waiting.',
        details: 'Length tuning, accessory add-ons, laminate and solid-surface mixing. Lead time 4–5 weeks.',
    },
    {
        id: 'soft-architecture-cove',
        title: 'Soft Architecture Cove',
        category: 'lounge',
        priceLabel: 'Under $27,000 NET',
        image: localImage('/category-images/lounge-images/api_bespace.jpg'),
        summary: 'A semi-enclosed lounge that uses screening, power, and layered upholstery to carve a destination without full construction.',
        details: 'Partial enclosure panels, power routing, COM and graded-in material story. Lead time 6–8 weeks.',
    },
    {
        id: 'harbor-lounge-pair',
        title: 'Harbor Lounge Pair',
        category: 'lounge',
        priceLabel: 'From $7,400 NET',
        image: localImage('/category-images/lounge-images/api_harbor.jpg'),
        summary: 'A paired Harbor lounge composition with custom welt, base metal finish, and a tuned cushion build.',
        details: 'Custom welt, base metal finish, tuned cushion build. Lead time 5–6 weeks.',
    },
    {
        id: 'poet-component-cluster',
        title: 'Poet Component Cluster',
        category: 'lounge',
        priceLabel: 'Under $14,200 NET',
        image: localImage('/category-images/lounge-images/jsi_poet_component_00008.jpg'),
        summary: 'A modular Poet cluster spec\u2019d with a custom upholstery palette and inset accent table arrangement.',
        details: 'Custom upholstery palette, inset accent tables, paired ottoman scale. Lead time 5–7 weeks.',
    },
    {
        id: 'executive-desk-run',
        title: 'Executive Desk Run',
        category: 'desks',
        priceLabel: 'Under $16,800 NET',
        image: localImage('/category-images/casegood-images/api_vision.jpg'),
        summary: 'A private-office desk composition with custom return length, integrated power, and a tuned pedestal package.',
        details: 'Custom return scale, power/data routing, mixed pull hardware. Lead time 6–8 weeks.',
    },
    {
        id: 'benching-desk-spine',
        title: 'Benching Desk Spine',
        category: 'desks',
        priceLabel: 'Under $22,500 NET',
        image: localImage('/category-images/casegood-images/api_flux-private-office.jpg'),
        summary: 'A multi-station desk run organized around a shared spine with privacy screens and accessory rails.',
        details: 'Shared power spine, screen heights tuned per station, accessory rail package. Lead time 7–9 weeks.',
    },
    {
        id: 'lobby-planter-bench',
        title: 'Lobby Planter Bench',
        category: 'planters',
        priceLabel: 'Under $8,400 NET',
        image: localImage('/category-images/bench-images/api_native.jpg'),
        summary: 'A waiting-area bench that integrates planter volumes and soft surface drops for casual touchdown.',
        details: 'Integrated planter liners, mixed laminate faces, optional power. Lead time 4–6 weeks.',
    },
    {
        id: 'corridor-planter-screen',
        title: 'Corridor Planter Screen',
        category: 'planters',
        priceLabel: 'Under $12,200 NET',
        image: localImage('/category-images/lounge-images/api_bespace.jpg'),
        summary: 'A freestanding planter screen that softens circulation without full construction — greenery plus acoustic mass.',
        details: 'Double-sided planter pockets, acoustic core, finish-matched end caps. Lead time 5–7 weeks.',
    },
    {
        id: 'arrival-desk-composition',
        title: 'Arrival Desk Composition',
        category: 'reception',
        priceLabel: 'Under $28,000 NET',
        image: localImage('/category-images/casegood-images/api_finale.jpg'),
        summary: 'A reception desk built as an architectural composition — transaction height, guest ledge, and branded return.',
        details: 'Transaction / ADA heights, branded return panel, integrated cable management. Lead time 8–10 weeks.',
    },
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
        // One entry per category per series (e.g. Arwyn guest has wood + metal leg variants)
        if (!_seriesMulti[slug].some((e) => e.categoryId === catId)) {
            _seriesMulti[slug].push(entry);
        }
        // Also index by product id for direct lookups
        if (slug !== p.id) {
            if (!_seriesMulti[p.id]) _seriesMulti[p.id] = [];
            if (!_seriesMulti[p.id].some((e) => e.categoryId === catId)) {
                _seriesMulti[p.id].push(entry);
            }
        }
    }
}
export const SERIES_CATEGORIES = Object.freeze(_seriesMulti);

// Re-export hierarchical catalog (productApi stays opt-in — import from ./productApi.js when wiring live fetch)
export { PRODUCT_FAMILIES, PRODUCT_SUBCATEGORIES, PRODUCT_MODELS, PRODUCT_CATEGORIES } from './productHierarchy.js';
