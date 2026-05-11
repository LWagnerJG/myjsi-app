const CLOUDINARY_CLOUD_NAME = 'jasper-jsi-furniture';
const CLOUDINARY_UPLOAD_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const LEAD_TIME_IMAGE_TRANSFORM = 'c_fit,h_160,w_160/f_auto/q_auto';

const LOCAL_IMAGE_PUBLIC_IDS = {
    jsi_addison_comp_00014: 'jsi_addison_comp_00014_clwpn4',
    jsi_addison_comp_00015: 'jsi_addison_comp_00015_r9dmtj',
    jsi_americana_comp_00026: 'jsi_americana_comp_00026_taqggj',
    jsi_americana_comp_00027: 'jsi_americana_comp_00027_h47nfm',
    jsi_ansen_comp_00002: 'jsi_ansen_comp_00002_ogngck',
    jsi_anthology_comp_0008: 'jsi_anthology_comp_0008_pzjwab',
    jsi_avini_comp_00001: 'jsi_avini_comp_00001_yqnwmr',
    jsi_bourne_comp_00001: 'jsi_bourne_comp_00001_vaoqmp',
    jsi_bryn_comp_0004: 'jsi_bryn_comp_00004_r7rt0y',
    jsi_caav_comp_0005: 'jsi_caav_comp_00005_flho7u',
    jsi_connect_comp_00001: 'jsi_connect_comp_00001_cemdwp',
    jsi_finale_config_00001: 'jsi_finale_config_00001_b2f6ag',
    jsi_finn_comp_00001: 'jsi_finn_comp_00001_yldo9i',
    'jsi_finn-nu_comp_00001': 'jsi_finnnu_comp_00001_uodxp5',
    jsi_flux_config_00008: 'jsi_flux_config_00008_teqevq',
    jsi_forge_config_0001: 'jsi_forge_config_00001_achzvt',
    'jsi_garvey-rs_comp_00001': 'jsi_garveyr5_comp_00001_qjofq2',
    jsi_gatsby_comp_00001: 'jsi_gatsby_comp_00001_ekqclw',
    jsi_harbor_comp_00001: 'jsi_harbor_comp_00001_ksp6d3',
    jsi_henley_comp_00001: 'jsi_henley_comp_00001_x8lgnu',
    jsi_hoopz_comp_00001: 'jsi_hoopz_comp_00001_ccbcm3',
    jsi_indie_comp_00001: 'jsi_indie_comp_00001_xtwvxr',
    jsi_jude_comp_00001: 'jsi_jude_comp_00001_lhf0fs',
    jsi_kindera_comp_00001: 'jsi_kindera_comp_00001_z7bd1b',
    jsi_knox_comp_00001: 'jsi_knox_comp_00001_y9fr9m',
    jsi_kyla_comp_00001: 'jsi_kyla_comp_00001_qvsits',
    jsi_lincoln_config_00001: 'jsi_lincoln_config_00001_rzvmgb',
    jsi_lok_config_00001: 'jsi_lok_config_00001_auusrp',
    jsi_mackey_comp_00001: 'jsi_mackey_comp_00001_panaq5',
    jsi_madison_comp_00001: 'jsi_madison_comp_00001_jrfu8g',
    jsi_moto_config_00001: 'jsi_moto_config_00001_qukone',
    jsi_native_config_00001: 'jsi_native_config_00001_lcsy1f',
    jsi_newton_comp_00001: 'jsi_newton_comp_00001_cr4033',
    jsi_nosh_config_00001: 'jsi_nosh_config_00001_i9b28v',
    jsi_oxley_comp_00001: 'jsi_oxley_comp_00001_krlib2',
    jsi_pillows_comp_00001: 'jsi_pillows_comp_00001_gcfmtm',
    jsi_poet_comp_00001: 'jsi_poet_component_00001_rlyrle',
    jsi_prost_config_00001: 'jsi_prost_comp_00001_rohmqf',
    jsi_protocol_comp_00001: 'jsi_protocol_comp_00001_qq9x1p',
    jsi_proxy_comp_00001: 'jsi_proxy_comp_00001_g6i4eh',
    jsi_reef_config_00001: 'jsi_reef_config_00001_vb9tvk',
    jsi_ria_comp_00001: 'jsi_ria_comp_00001_ngpgdu',
    jsi_romy_config_00001: 'jsi_romy_config_00001_wpjoor',
    jsi_satisse_comp_00001: 'jsi_satisse_comp_0001',
    jsi_somna_comp_00001: 'jsi_somna_comp_00001_rkyymr',
    jsi_sosa_comp_00001: 'jsi_sosa_comp_00001_dmnfxv',
    jsi_teekan_comp_00001: 'jsi_teekan_comp_00001_fjl19c',
    jsi_totem_comp_00001: 'jsi_totem_comp_00001_ulvvvv',
    jsi_vision_config_000002: 'jsi_vision_config_000002_w0uvqg',
    jsi_walden_config_00001: 'jsi_walden_config_00001_tbjf5j',
    jsi_wellington_config_00001: 'jsi_wellington_config_00001_bitwyh',
    jsi_wink_enviro_00033: 'jsi_wink_enviro_00033_v1yvfx',
};

const SERIES_PUBLIC_IDS = {
    Addison: 'jsi_addison_comp_00014_clwpn4',
    Americana: 'jsi_americana_comp_00027_h47nfm',
    Ansen: 'jsi_ansen_comp_00002_ogngck',
    Anthology: 'jsi_anthology_comp_0008_pzjwab',
    Arwyn: 'jsi_arwyn_comp_00032_oddogi',
    Avini: 'jsi_avini_comp_00001_yqnwmr',
    BeSPACE: 'jsi_bespace_comp_00021_avv45g',
    Boston: 'jsi_boston_comp_0001_fxcksn',
    Bourne: 'jsi_bourne_comp_00001_vaoqmp',
    Brogan: 'jsi_brogan_comp_00025_ffc67d',
    Bryn: 'jsi_bryn_comp_00004_r7rt0y',
    Caav: 'jsi_caav_comp_00005_flho7u',
    Connect: 'jsi_connect_comp_00001_cemdwp',
    Copilot: 'jsi_copilot_comp_000001_ugzo6t',
    Cosgrove: 'jsi_cosgrove_comp_0010_ihduq3',
    Draft: 'jsi_draft_comp_00001_fx1jms',
    Encore: 'jsi_encore_comp_00010_pvjhtw',
    Finale: 'jsi_finale_config_00001_b2f6ag',
    Finn: 'jsi_finn_comp_00001_yldo9i',
    'Finn Nu': 'jsi_finnnu_comp_00001_uodxp5',
    Flux: 'jsi_flux_config_00008_teqevq',
    Forge: 'jsi_forge_config_00001_achzvt',
    'Garvey RS': 'jsi_garveyr5_comp_00001_qjofq2',
    Gatsby: 'jsi_gatsby_comp_00001_ekqclw',
    Harbor: 'jsi_harbor_comp_00001_ksp6d3',
    Henley: 'jsi_henley_comp_00001_x8lgnu',
    Hoopz: 'jsi_hoopz_comp_00001_ccbcm3',
    Indie: 'jsi_indie_comp_00001_xtwvxr',
    Jude: 'jsi_jude_comp_00001_lhf0fs',
    Kindera: 'jsi_kindera_comp_00001_z7bd1b',
    Knox: 'jsi_knox_comp_00001_y9fr9m',
    Kyla: 'jsi_kyla_comp_00001_qvsits',
    Lincoln: 'jsi_lincoln_config_00001_rzvmgb',
    Lok: 'jsi_lok_config_00001_auusrp',
    Mackey: 'jsi_mackey_comp_00001_panaq5',
    Madison: 'jsi_madison_comp_00001_jrfu8g',
    Millie: 'jsi_millie_comp_00001_c4mljr',
    Moto: 'jsi_moto_config_00001_qukone',
    'Native Benches': 'jsi_native_config_00001_lcsy1f',
    Native: 'jsi_native_config_00001_lcsy1f',
    Newton: 'jsi_newton_comp_00001_cr4033',
    Nosh: 'jsi_nosh_config_00001_i9b28v',
    Oxley: 'jsi_oxley_comp_00001_krlib2',
    Pillows: 'jsi_pillows_comp_00001_gcfmtm',
    Poet: 'jsi_poet_component_00001_rlyrle',
    Privacy: 'jsi_privacy_lk_01_lg',
    Prost: 'jsi_prost_comp_00001_rohmqf',
    Protocol: 'jsi_protocol_comp_00001_qq9x1p',
    Proxy: 'jsi_proxy_comp_00001_g6i4eh',
    Ramona: 'jsi_ramona_comp_00001',
    Reef: 'jsi_reef_config_00001_vb9tvk',
    Ria: 'jsi_ria_comp_00001_ngpgdu',
    Romy: 'jsi_romy_config_00001_wpjoor',
    Satisse: 'jsi_satisse_comp_0001',
    Somna: 'jsi_somna_comp_00001_rkyymr',
    Scroll: 'jsi_scroll_comp_0001_ljwia7',
    Sosa: 'jsi_sosa_comp_00001_dmnfxv',
    Teekan: 'jsi_teekan_comp_00001_fjl19c',
    Totem: 'jsi_totem_comp_00001_ulvvvv',
    Trail: 'jsi_trail_comp_00001_kt3crh',
    Trinity: 'jsi_trinity_comp_00001',
    Vision: 'jsi_vision_config_000002_w0uvqg',
    Walden: 'jsi_walden_config_00001_tbjf5j',
    Wellington: 'jsi_wellington_config_00001_bitwyh',
    Wink: 'jsi_wink_enviro_00033_v1yvfx',
    Ziva: 'jsi_ziva_comp_00001',
};

function normalizePublicId(value) {
    return String(value || '')
        .trim()
        .replace(/^\/+/, '')
        .replace(/^series-images\//, '')
        .replace(/\.(jpe?g|png|webp|gif)$/i, '');
}

function extractLocalPublicId(value) {
    const raw = String(value || '').trim();
    if (!raw.startsWith('/series-images/')) return '';
    return normalizePublicId(raw.split('/').pop());
}

function addCloudinaryCandidate(list, publicId) {
    const id = normalizePublicId(publicId);
    if (!id) return;
    const url = `${CLOUDINARY_UPLOAD_BASE}/${LEAD_TIME_IMAGE_TRANSFORM}/${id}`;
    if (!list.includes(url)) list.push(url);
}

function addUrlCandidate(list, url) {
    const trimmed = String(url || '').trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) return;
    if (!list.includes(trimmed)) list.push(trimmed);
}

export function getLeadTimeImageSources(typeData = {}, series = '') {
    const rawImage = typeof typeData === 'string' ? typeData : typeData.image;
    const explicitPublicId = typeof typeData === 'object' ? typeData.cloudinaryPublicId : '';
    const isLocalSeriesPath = String(rawImage || '').trim().startsWith('/series-images/');
    const sources = [];

    addCloudinaryCandidate(sources, explicitPublicId);

    const localPublicId = extractLocalPublicId(rawImage);
    addCloudinaryCandidate(sources, LOCAL_IMAGE_PUBLIC_IDS[localPublicId]);
    addCloudinaryCandidate(sources, SERIES_PUBLIC_IDS[series]);

    if (/^https?:\/\//i.test(String(rawImage || ''))) {
        addUrlCandidate(sources, rawImage);
    } else if (!isLocalSeriesPath) {
        const publicId = normalizePublicId(rawImage);
        addCloudinaryCandidate(sources, LOCAL_IMAGE_PUBLIC_IDS[publicId]);
        addCloudinaryCandidate(sources, publicId);
    }

    return sources;
}

export function getLeadTimeImageUrl(typeData = {}, series = '') {
    return getLeadTimeImageSources(typeData, series)[0] || '';
}

export { LEAD_TIME_IMAGE_TRANSFORM };
