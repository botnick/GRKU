// The landing data that the page (landing.ts) and scripts/build-landing.mjs share. It has no
// asset imports, so Node can load it.
import type { Cover } from './catalog';

/**
 * The film looks of the landing hero: the catalog name, the image that scripts/build-landing.mjs
 * renders on the sample photo, and the cover of the catalog effect, so the hero draws its
 * icons without the catalog.
 */
export interface LandingLook {
  name: string;
  image: string;
  /** The effect whose box the picker shows (web/public/boxes/<effect>.png). */
  effect: string;
  cover: Cover;
}

export const LANDING_LOOKS = [
  { name: 'Portra 400', image: 'portra-400', effect: 'portra-400-endura-v1', cover: { band: true, brand: 'Kodak', name: 'PORTRA', number: '400', template: 'box' } },
  { name: 'Kodachrome 64', image: 'kodachrome-64', effect: 'kodachrome-64-v1', cover: { band: true, brand: 'Kodak', name: 'KODACHROME', number: '64', template: 'box' } },
  { name: 'Velvia 100', image: 'velvia-100', effect: 'velvia-100-v1', cover: { band: true, brand: 'FUJIFILM', name: 'VELVIA', number: '100', template: 'box' } },
  { name: 'Eterna 500T', image: 'eterna-500t', effect: 'eterna-500t-3523xd-v1', cover: { brand: 'FUJIFILM', name: '8573', number: '500T', template: 'cine' } },
  { name: 'Tri-X 400', image: 'tri-x-400', effect: 'trix-400-mono-v1', cover: { band: true, brand: 'Kodak', name: 'TRI-X', number: '400', template: 'box' } },
] as const satisfies readonly LandingLook[];

/** The photos of the landing page, credited where they show, with a link to their source page. */
export const LANDING_PHOTOS = {
  wheels: {
    author: 'Austin Kirk',
    license: 'CC BY 2.0',
    camera: 'RICOH GR IIIx',
    source: 'https://www.flickr.com/photos/aukirk/53383031689/',
  },
  wakkanai: {
    author: 'Ryo FUKAsawa',
    license: 'CC BY 2.0',
    camera: 'RICOH GR IIIx',
    source: 'https://www.flickr.com/photos/fukapon/52748403830/',
  },
  hokkaido: {
    author: 'MIKI Yoshihito',
    license: 'CC BY 4.0',
    camera: 'RICOH GR IIIx',
    source: 'https://www.flickr.com/photos/mujitra/55047855669/',
  },
  tram: {
    author: 'MIKI Yoshihito',
    license: 'CC BY 2.0',
    camera: 'RICOH GR IIIx',
    source: 'https://www.flickr.com/photos/mujitra/53731862585/',
  },
  achensee: {
    author: 'Stephan van Helden',
    license: 'CC BY-SA 4.0',
    camera: 'RICOH GR III',
    source: 'https://commons.wikimedia.org/wiki/File:Achensee_n%C3%B6rdlich_von_Pertisau.jpg',
  },
  clouds: {
    author: 'Stephan van Helden',
    license: 'CC BY-SA 4.0',
    camera: 'RICOH GR IV',
    source: 'https://commons.wikimedia.org/wiki/File:Blick_vom_Riebersgrund_auf_LB-01298_(2).jpg',
  },
  beach: {
    author: 'Matthias Ripp',
    license: 'CC BY 2.0',
    camera: 'RICOH GR IIIx',
    source: 'https://commons.wikimedia.org/wiki/File:Paradise_found_-_Flickr_-_matthias.ripp.jpg',
  },
  nathans: {
    author: 'Andrzej Barabasz (Chepry)',
    license: 'CC BY-SA 4.0',
    camera: 'RICOH GR IIIx',
    source: 'https://commons.wikimedia.org/wiki/File:Nathan%27s_Famous_(Coney_Island)_AB.jpg',
  },
  neon: {
    author: 'Sergiy Galyonkin',
    license: 'CC BY-SA 4.0',
    camera: 'RICOH GR IV',
    source: 'https://commons.wikimedia.org/wiki/File:Chicken_sandwiches_in_Vegas.jpg',
  },
  temple: {
    author: 'Mobnoboka',
    license: 'CC BY-SA 4.0',
    camera: 'RICOH GR II',
    source: 'https://commons.wikimedia.org/wiki/File:Oguchi_Joushi_Kouen_1.jpg',
  },
  takeaway: {
    author: 'Tony Barrett',
    license: 'CC BY-SA 4.0',
    camera: 'RICOH GR III',
    source: 'https://discuss.pixls.us/t/40918',
  },
  dunes: {
    author: 'raw.pixls.us',
    license: 'CC0 1.0',
    camera: 'RICOH GR III',
    source: 'https://raw.pixls.us/',
  },
} as const;
