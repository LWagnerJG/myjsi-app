// Mock Asset data for Library feature (projects + uploads)
// Shape matches spec Asset interface
export const INITIAL_ASSETS = [
  {
    id: 'asset-1',
    title: 'Vision Casegoods Install',
    src: 'https://webresources.jsifurniture.com/production/uploads/jsi_vision_install_0000010.jpg',
    alt: 'Vision series workstation install',
    source: 'projects',
    projectId: 'proj1',
    products: ['vision'],
    series: 'Vision',
    finish: 'Truss',
    tags: ['installation','workspace','vision','truss'],
    location: 'Chicago, IL',
    createdAt: new Date().toISOString(),
    photographer: 'Staff'
  },
  {
    id: 'asset-2',
    title: 'Caav Lounge Seating',
    src: 'https://webresources.jsifurniture.com/production/uploads/jsi_caav_install_00024_pldPbiW.jpg',
    alt: 'Caav lounge environment',
    source: 'projects',
    projectId: 'proj2',
    products: ['caav'],
    series: 'Caav',
    finish: 'Torii',
    tags: ['installation','lounge','mood','caav'],
    location: 'Boston, MA',
    createdAt: new Date().toISOString(),
    photographer: 'Staff'
  },
  {
    id: 'asset-3',
    title: 'Finn Seating Detail',
    src: 'https://webresources.jsifurniture.com/production/uploads/original_images/jsi_finn_enviro_00004_aOu5872.jpg',
    alt: 'Finn seating finish detail',
    source: 'projects',
    projectId: 'proj3',
    products: ['finn'],
    series: 'Finn',
    finish: 'Carbon',
    tags: ['installation','detail','finn'],
    location: 'Indianapolis, IN',
    createdAt: new Date().toISOString(),
    photographer: 'Staff'
  },
  {
    id: 'asset-4',
    title: 'Native Bench Mood',
    src: 'https://webresources.jsifurniture.com/production/uploads/jsi_coldjet_install_00001.jpg',
    alt: 'Bench in lobby space',
    source: 'upload',
    products: ['native'],
    series: 'Native',
    finish: 'Walnut',
    tags: ['mood','bench','native'],
    location: 'Seattle, WA',
    createdAt: new Date().toISOString(),
    photographer: 'Staff'
  }
];
