const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';

const transformCloudinaryUrl = (url, transformation) => {
  if (!url || !url.includes(CLOUDINARY_UPLOAD_SEGMENT)) return url;
  return url.replace(CLOUDINARY_UPLOAD_SEGMENT, `${CLOUDINARY_UPLOAD_SEGMENT}${transformation}/`);
};

const heroImage = (url) => transformCloudinaryUrl(url, 'c_fill,g_auto,w_900,h_520,f_auto,q_auto');
const tileImage = (url) => transformCloudinaryUrl(url, 'c_fill,g_auto,w_700,h_700,f_auto,q_auto');
const galleryImage = (url) => transformCloudinaryUrl(url, 'c_limit,w_1800,f_auto,q_auto');

const DEFAULT_JSI_REP = {
  name: 'Luke Wagner',
  role: 'Jasper Group',
  email: 'LWagner@jaspergroup.us.com',
  phone: '',
};

const emptyMaterials = () => ({
  laminates: [],
  metals: [],
  upholstery: [],
  woods: [],
  paintPlastic: [],
});

const emptyOrders = () => ({
  current: [],
  history: [],
});

const tagify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const asset = (url, publicId, width, height, createdAt, caption = '') => ({
  url,
  publicId,
  width,
  height,
  createdAt,
  caption,
});

const INSTALLATION_RECORDS = [
  {
    id: 'cloud-scranton',
    name: 'The University of Scranton',
    domain: 'scranton.edu',
    location: { city: 'Scranton', state: 'PA' },
    vertical: 'HigherEd',
    projectName: 'Campus Learning Spaces',
    projectLocation: 'Scranton campus',
    spaceType: 'Classroom',
    folder: 'JSI/General Collateral/Our Installations/The University of Scranton',
    coverIndex: 2,
    documents: [
      {
        name: 'The University of Scranton Project Profile.pdf',
        url: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1764953893/TheUniversityOfScranton_ProjectProfile_m0pqq7.pdf',
      },
    ],
    assets: [
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1764953887/jsi_installs_uofscranton_02_qcrfv6.jpg', 'jsi_installs_uofscranton_02_qcrfv6', 3000, 4000, '2025-12-05', 'Learning space seating'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1764953887/jsi_installs_uofscranton_01_vubzhl.jpg', 'jsi_installs_uofscranton_01_vubzhl', 3000, 4000, '2025-12-05', 'Campus lounge installation'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1764953886/jsi_installs_uofscranton_03_rvruer.jpg', 'jsi_installs_uofscranton_03_rvruer', 4000, 3000, '2025-12-05', 'Collaborative learning area'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1764953886/jsi_installs_uofscranton_06_myovq0.jpg', 'jsi_installs_uofscranton_06_myovq0', 4000, 3000, '2025-12-05', 'Student seating zone'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1764953886/jsi_installs_uofscranton_05_cmuhlc.jpg', 'jsi_installs_uofscranton_05_cmuhlc', 3000, 4000, '2025-12-05', 'Study area detail'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1764953885/jsi_installs_uofscranton_04_mmytok.jpg', 'jsi_installs_uofscranton_04_mmytok', 2910, 3906, '2025-12-05', 'Campus install detail'),
    ],
  },
  {
    id: 'cloud-auburn',
    name: 'Auburn University',
    domain: 'auburn.edu',
    location: { city: 'Auburn', state: 'AL' },
    vertical: 'HigherEd',
    projectName: 'University Project Profile',
    projectLocation: 'Auburn campus',
    spaceType: 'Classroom',
    folder: 'JSI/General Collateral/Our Installations/Auburn University',
    documents: [
      {
        name: 'Auburn University Project Profile.pdf',
        url: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1761843270/JSI_ProjectPortfolio_AuburnUniversity_j8ia8k.pdf',
      },
    ],
    assets: [
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1761843370/jsi_install_auburnuniv__04_yeydth.jpg', 'jsi_install_auburnuniv__04_yeydth', 2000, 1333, '2025-10-29', 'Campus installation overview'),
    ],
  },
  {
    id: 'cloud-montana',
    name: 'University of Montana',
    domain: 'umt.edu',
    location: { city: 'Missoula', state: 'MT' },
    vertical: 'HigherEd',
    projectName: 'Campus Install Gallery',
    projectLocation: 'Missoula campus',
    spaceType: 'Classroom',
    folder: 'JSI/General Collateral/Our Installations/University of Montana',
    assets: [
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1752773745/jsi_installs_uofm_004.jpg', 'jsi_installs_uofm_004', 2000, 1333, '2025-07-17', 'Campus seating installation'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1752773732/jsi_installs_uofm_014.jpg', 'jsi_installs_uofm_014', 2000, 1333, '2025-07-17', 'Learning commons installation'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1755717721/jsi_installs_uofm_12.jpg', 'jsi_installs_uofm_12', 2000, 1331, '2025-07-01', 'Campus lounge area'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1755717659/jsi_installs_uofm_11.jpg', 'jsi_installs_uofm_11', 2000, 1331, '2025-07-01', 'Student gathering area'),
    ],
  },
  {
    id: 'cloud-ache',
    name: 'Arkansas Colleges of Health Education',
    domain: 'achehealth.edu',
    location: { city: 'Fort Smith', state: 'AR' },
    vertical: 'Healthcare',
    projectName: 'Health Education Campus',
    projectLocation: 'Fort Smith campus',
    spaceType: 'Classroom',
    folder: 'JSI/General Collateral/Our Installations/Arkansas Colleges of Health Education',
    assets: [
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1752503224/jsi_moto_snap_00017_u9jmwt.jpg', 'jsi_moto_snap_00017_u9jmwt', 2000, 1331, '2025-07-14', 'Health education seating'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1752174553/jsi_harbor_install_0002.jpg', 'jsi_harbor_install_0002', 2000, 1331, '2025-07-10', 'Harbor install detail'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1752174549/jsi_harbor_install_0001.jpg', 'jsi_harbor_install_0001', 2000, 1331, '2025-07-10', 'Collaborative seating'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1751487338/jsi_installs_uofa_01.jpg', 'jsi_installs_uofa_01', 900, 599, '2025-07-02', 'Campus install overview'),
    ],
  },
  {
    id: 'cloud-manasquan',
    name: 'Manasquan High School',
    domain: 'manasquanschools.org',
    location: { city: 'Manasquan', state: 'NJ' },
    vertical: 'Education',
    projectName: 'High School Learning Spaces',
    projectLocation: 'Manasquan campus',
    spaceType: 'Classroom',
    folder: 'JSI/General Collateral/Our Installations/Manasquan High School',
    assets: [
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1752503223/jsi_moto_snap_00016_oko2uq.jpg', 'jsi_moto_snap_00016_oko2uq', 2000, 1333, '2025-07-14', 'Learning space installation'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1751026901/jsi_connect_install_00025_jph4tm.jpg', 'jsi_connect_install_00025_jph4tm', 2000, 1333, '2025-06-27', 'Connect installation'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1751026895/jsi_connect_install_00024_yk0jem.jpg', 'jsi_connect_install_00024_yk0jem', 2000, 1333, '2025-06-27', 'Classroom furniture install'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1751026888/jsi_connect_install_00023_sdujin.jpg', 'jsi_connect_install_00023_sdujin', 2000, 1333, '2025-06-27', 'Collaborative classroom'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1751026882/jsi_connect_install_00022_zqngre.jpg', 'jsi_connect_install_00022_zqngre', 2000, 1333, '2025-06-27', 'Student workspace'),
    ],
  },
  {
    id: 'cloud-thorup',
    name: 'Thorup Dental',
    domain: 'thorupdental.com',
    location: { city: 'South Jordan', state: 'UT' },
    vertical: 'Healthcare',
    projectName: 'Dental Office Install',
    projectLocation: 'South Jordan office',
    spaceType: 'Patient',
    folder: 'JSI/General Collateral/Our Installations/Thorup Dental',
    coverIndex: 1,
    documents: [
      {
        name: 'Thorup Dental Project Profile.pdf',
        url: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1754685214/jsi_ProjectProfile_ThorupDental.pdf',
      },
    ],
    assets: [
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1754684922/jsi_Install_ThorupDental_01.jpg', 'jsi_Install_ThorupDental_01', 2048, 1366, '2025-08-08', 'Dental office lounge'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1754684920/jsi_Install_ThorupDental_02.jpg', 'jsi_Install_ThorupDental_02', 2048, 1398, '2025-08-08', 'Patient waiting area'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1754684918/jsi_Install_ThorupDental_03.jpg', 'jsi_Install_ThorupDental_03', 1348, 2048, '2025-08-08', 'Dental office seating'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1754684916/jsi_Install_ThorupDental_04.jpg', 'jsi_Install_ThorupDental_04', 2048, 1384, '2025-08-08', 'Consultation space'),
    ],
  },
  {
    id: 'cloud-jim-ellis',
    name: 'Jim Ellis HQ',
    domain: 'jimellis.com',
    location: { city: 'Atlanta', state: 'GA' },
    vertical: 'Corporate',
    projectName: 'Automotive Group Headquarters',
    projectLocation: 'Atlanta headquarters',
    spaceType: 'Office',
    folder: 'JSI/General Collateral/Our Installations/Jim Ellis HQ',
    coverIndex: 1,
    documents: [
      {
        name: 'Jim Ellis HQ Project Profile.pdf',
        url: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1753813760/JimEllisHQ_owbov4.pdf',
      },
    ],
    assets: [
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1758909347/jsi_installs_jimellis_09.jpg', 'jsi_installs_jimellis_09', 1900, 1357, '2025-09-26', 'Headquarters workspace'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1758909335/jsi_installs_jimellis_08.jpg', 'jsi_installs_jimellis_08', 1900, 1267, '2025-09-26', 'Office installation'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1758909323/jsi_installs_jimellis_07.jpg', 'jsi_installs_jimellis_07', 1357, 1900, '2025-09-26', 'Workplace seating'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1753813559/jsi_installs_jimellis_01.jpg', 'jsi_installs_jimellis_01', 1357, 1900, '2025-07-29', 'Office detail'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1753813556/jsi_installs_jimellis_02.jpg', 'jsi_installs_jimellis_02', 1900, 1357, '2025-07-29', 'Conference-adjacent seating'),
    ],
  },
  {
    id: 'cloud-mvp',
    name: 'Magical Vacation Planner',
    domain: 'magicalvacationplanner.com',
    location: { city: 'Mitchell', state: 'IN' },
    vertical: 'Corporate',
    projectName: 'Travel Office Install',
    projectLocation: 'Mitchell office',
    spaceType: 'Office',
    folder: 'JSI/General Collateral/Our Installations/Magical Vacation Planner',
    coverIndex: 1,
    documents: [
      {
        name: 'Magical Vacation Planner Project Profile.pdf',
        url: 'https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1753476101/jsi_ProjectProfile_MVP_wlk17x.pdf',
      },
    ],
    assets: [
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1753813347/jsi_installs_mvp_08.jpg', 'jsi_installs_mvp_08', 5500, 3667, '2025-07-29', 'Office install overview'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1753475469/jsi_installs_mvp_01.jpg', 'jsi_installs_mvp_01', 5500, 3667, '2025-07-25', 'Open office installation'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1753475464/jsi_installs_mvp_02.jpg', 'jsi_installs_mvp_02', 5500, 3667, '2025-07-25', 'Workplace collaboration area'),
      asset('https://res.cloudinary.com/jasper-jsi-furniture/image/upload/v1753475458/jsi_installs_mvp_03.jpg', 'jsi_installs_mvp_03', 5500, 3667, '2025-07-25', 'Office lounge detail'),
    ],
  },
];

const recordToCustomer = (record) => {
  const coverAsset = record.assets[record.coverIndex || 0] || record.assets[0];
  const projectId = `${record.id}-project`;

  return {
    id: record.id,
    type: 'end-user',
    name: record.name,
    domain: record.domain,
    location: record.location,
    vertical: record.vertical,
    image: heroImage(coverAsset.url),
    activeProjectIds: [],
    standardsPrograms: [],
    approvedMaterials: emptyMaterials(),
    orders: emptyOrders(),
    typicals: [],
    projects: [
      {
        id: projectId,
        name: record.projectName,
        location: record.projectLocation,
        image: heroImage(coverAsset.url),
        cloudinaryFolder: record.folder,
        installs: record.assets.map((installAsset, index) => ({
          id: `${record.id}-install-${String(index + 1).padStart(2, '0')}`,
          url: galleryImage(installAsset.url),
          thumb: tileImage(installAsset.url),
          sourceUrl: installAsset.url,
          caption: installAsset.caption || `${record.name} install ${index + 1}`,
          spaceType: record.spaceType,
          date: installAsset.createdAt,
          width: installAsset.width,
          height: installAsset.height,
          cloudinaryPublicId: installAsset.publicId,
          cloudinaryFolder: record.folder,
        })),
      },
    ],
    documents: (record.documents || []).map((doc, index) => ({
      id: `${record.id}-doc-${index + 1}`,
      name: doc.name,
      url: doc.url,
    })),
    contacts: [],
    jsiRep: { ...DEFAULT_JSI_REP },
    cloudinaryFolder: record.folder,
    dataSource: 'cloudinary',
  };
};

export const CLOUDINARY_INSTALLATION_CUSTOMERS = INSTALLATION_RECORDS.map(recordToCustomer);

export const CLOUDINARY_LIBRARY_ASSETS = CLOUDINARY_INSTALLATION_CUSTOMERS.flatMap((customer) =>
  (customer.projects || []).flatMap((project) =>
    (project.installs || []).map((install) => ({
      id: `cloud-lib-${install.id}`,
      title: `${customer.name} - ${install.caption}`,
      src: install.thumb || install.url,
      detailSrc: install.url,
      alt: install.caption,
      source: 'cloudinary',
      projectId: project.id,
      products: [],
      series: 'JSI Installations',
      finish: customer.vertical,
      tags: [
        'cloudinary',
        'installation',
        'project',
        tagify(customer.vertical),
        tagify(customer.name),
      ].filter(Boolean),
      location: `${customer.location.city}, ${customer.location.state}`,
      createdAt: install.date,
      photographer: 'Jasper Group Cloudinary',
      sourceUrl: install.sourceUrl,
      cloudinaryPublicId: install.cloudinaryPublicId,
    })),
  ),
);
