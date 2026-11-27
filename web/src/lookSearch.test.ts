import { describe, expect, it } from 'vitest';
import { closestLooks, editDistance, lookRequestMail, normalize, POPULAR_SEARCH, searchLooks, type SearchableLook } from './lookSearch';

const box = (brand: string, name: string, number?: string) => ({ template: 'box' as const, brand, name, number });
const LOOKS: SearchableLook[] = [
  { id: 'ektar-100-edge-v1', name: 'Ektar 100', cover: box('Kodak', 'EKTAR', '100'), look: 'Kodak Ektar 100 on Ektacolor Edge paper' },
  { id: 'pd-portra-400-vc-v1', name: 'Portra 400 VC', cover: box('Kodak', 'PORTRA VC', '400'), look: 'Portra 400 VC, as the film emulation preset' },
  { id: 'portra-400-endura-v1', name: 'Portra 400', cover: box('Kodak', 'PORTRA', '400'), look: 'Kodak Portra 400 on Portra Endura paper' },
  { id: 'spk-portra-800-endura-v1', name: 'Portra 800', cover: box('Kodak', 'PORTRA', '800'), look: 'Kodak Portra 800 on Portra Endura paper' },
  { id: 'gold-200-premier-v1', name: 'Gold 200', cover: box('Kodak', 'GOLD', '200'), look: 'Kodak Gold 200 on Endura Premier paper' },
  { id: 'ff-cinestill800t-v1', name: 'CineStill 800T', cover: box('CINESTILL', 'CINESTILL', '800T'), look: 'CineStill 800T on Kodak Ektacolor Edge paper' },
  { id: 'fj-classic-chrome-v1', name: 'Classic Chrome', cover: box('FUJIFILM', 'CLASSIC', 'CHROME'), look: 'The Classic Chrome film simulation' },
  { id: 'positive-film-grii-v1', name: 'GR II Positive (GRKU)', cover: box('RICOH', 'POSITIVE', 'GRII'), look: 'The Positive Film image setting of the RICOH GR II' },
  { id: 'trix-400-mono-v1', name: 'Tri-X 400', cover: box('Kodak', 'TRI-X', '400'), monochrome: true, look: 'Kodak Tri-X 400 on Polymax Fine-Art paper' },
  { id: 'hp5-plus-400-mono-v1', name: 'HP5 Plus 400', cover: box('ILFORD', 'HP5 PLUS', '400'), monochrome: true, look: 'Ilford HP5 Plus 400' },
  { id: 'ff-instaxmini-v1', name: 'Instax Mini', cover: box('FUJIFILM', 'INSTAX', 'MINI'), look: 'Fujifilm instax mini print' },
  { id: 'finepix-ccd-v1', name: 'FinePix CCD', cover: box('FUJIFILM', 'FINEPIX', 'CCD'), look: 'The bright daylight color of a FinePix CCD camera' },
  { id: 'c200-premier-v1', name: 'Fujicolor C200', cover: box('FUJIFILM', 'FUJICOLOR', 'C200'), look: 'Fujicolor C200 on Endura Premier paper' },
  { id: 'ff-lomochromepurple-v1', name: 'Purple 400', cover: box('LOMO', 'PURPLE', '400'), look: 'Lomography LomoChrome Purple XR 100-400 on Fujicolor Crystal Archive paper' },
  { id: 'pd-apx-100-mono-v1', name: 'APX 100', cover: box('AGFA', 'APX', '100'), monochrome: true, look: 'APX 100, as the film emulation preset' },
  { id: 'sfl-vision-320t-5277-v1', name: 'Vision 320T', cover: { template: 'cine', brand: 'Kodak', name: '5277', number: '320T' }, look: 'Kodak Vision 320T 5277 on Kodak Vision 2383 print film' },
];
const ids = (query: string) => searchLooks(LOOKS, query).map((look) => look.id);
const names = (query: string) => searchLooks(LOOKS, query).map((look) => look.name);

describe('normalize', () => {
  it('ignores case, accents, punctuation, and spaces between letters and numbers', () => {
    expect(normalize('  Tri-X  400 ')).toBe('tri x 400');
    expect(normalize('PORTRA400')).toBe('portra 400');
    expect(normalize('Café B&W')).toBe('cafe b and w');
    expect(normalize('ฟูจิ')).toBe('ฟูจิ');
  });
});

describe('editDistance', () => {
  it('counts a swap of two letters as one edit', () => {
    expect(editDistance('protra', 'portra')).toBe(1);
    expect(editDistance('finepx', 'finepix')).toBe(1);
    expect(editDistance('kodak', 'kodak')).toBe(0);
    expect(editDistance('abcdefgh', 'z', 2)).toBeGreaterThan(2);
  });
});

describe('searchLooks', () => {
  it('gives every look for an empty search', () => {
    expect(searchLooks(LOOKS, '  ')).toHaveLength(LOOKS.length);
  });

  it('ignores case, spaces, and punctuation', () => {
    expect(ids('FinePix')).toEqual(['finepix-ccd-v1']);
    expect(ids('fine pix')).toEqual(['finepix-ccd-v1']);
    expect(ids('trix')).toContain('trix-400-mono-v1');
    expect(ids('TRI-X 400')[0]).toBe('trix-400-mono-v1');
    expect(ids('portra400')[0]).toBe('portra-400-endura-v1');
  });

  it('matches the brand, the box, the id, and the kind', () => {
    expect(names('ilford')).toEqual(['HP5 Plus 400']);
    expect(ids('5277')).toEqual(['sfl-vision-320t-5277-v1']);
    expect(ids('lomochromepurple')).toEqual(['ff-lomochromepurple-v1']);
    expect(ids('cine')).toEqual(expect.arrayContaining(['sfl-vision-320t-5277-v1', 'ff-cinestill800t-v1']));
    expect(ids('instant')).toEqual(['ff-instaxmini-v1']);
  });

  it('knows the other names of brands and films', () => {
    expect(ids('fuji')).toEqual(expect.arrayContaining(['fj-classic-chrome-v1', 'finepix-ccd-v1', 'ff-instaxmini-v1', 'c200-premier-v1']));
    expect(ids('fuji')).not.toContain('portra-400-endura-v1');
    expect(ids('lomo')).toEqual(['ff-lomochromepurple-v1']);
    expect(ids('bw').sort()).toEqual(['hp5-plus-400-mono-v1', 'pd-apx-100-mono-v1', 'trix-400-mono-v1']);
    expect(ids('black and white').sort()).toEqual(ids('bw').sort());
    expect(ids('B&W').sort()).toEqual(ids('bw').sort());
    expect(ids('agfa')).toEqual(['pd-apx-100-mono-v1']);
    expect(ids('ricoh')).toEqual(['positive-film-grii-v1']);
    // GR II Positive (GRKU) was Positive GRII: its old name finds it.
    for (const query of ['Positive GRII', 'grii', 'gr2 positive', 'GR II Positive']) expect(ids(query)[0]).toBe('positive-film-grii-v1');
  });

  it('knows the Thai names', () => {
    expect(ids('ฟูจิ').sort()).toEqual(ids('fujifilm').sort());
    expect(ids('ฟูจิฟิล์ม').sort()).toEqual(ids('fujifilm').sort());
    expect(ids('โกดัก').sort()).toEqual(ids('kodak').sort());
    expect(ids('พอร์ตร้า').sort()).toEqual(ids('portra').sort());
    expect(ids('พอร์ทรา').sort()).toEqual(ids('portra').sort());
    expect(ids('พอร์ตร้า 800')).toEqual(['spk-portra-800-endura-v1']);
    expect(ids('ขาวดำ').sort()).toEqual(ids('bw').sort());
    expect(ids('โกลด์')).toEqual(['gold-200-premier-v1']);
    expect(ids('ซีเนสติล')).toEqual(['ff-cinestill800t-v1']);
    expect(ids('คลาสสิกโครม')).toEqual(['fj-classic-chrome-v1']);
    expect(ids('โพสิทีฟ')).toEqual(['positive-film-grii-v1']);
    expect(ids('อินสแตกซ์')).toEqual(['ff-instaxmini-v1']);
    expect(ids('ฟายน์พิกซ์')).toEqual(['finepix-ccd-v1']);
    expect(ids('ริโก้')).toEqual(['positive-film-grii-v1']);
    // Two words without a space, and a filler word.
    expect(ids('ฟิล์มโกดักโกลด์')).toEqual(['gold-200-premier-v1']);
    // A transliteration one mark away from the table.
    expect(ids('พอร์ทร้า').sort()).toEqual(ids('portra').sort());
  });

  it('forgives a typo in a long word, not in a short one', () => {
    expect(ids('protra')).toEqual(ids('portra'));
    expect(ids('cinestil')).toEqual(['ff-cinestill800t-v1']);
    expect(ids('finepx')).toEqual(['finepix-ccd-v1']);
    expect(ids('classc chrome')).toEqual(['fj-classic-chrome-v1']);
    expect(ids('ilfrod')).toEqual(['hp5-plus-400-mono-v1']);
    expect(ids('gpld')).toEqual([]);
    expect(ids('xyzzyq')).toEqual([]);
  });

  it('matches numbers at the start of a word', () => {
    expect(ids('400')).toEqual(expect.arrayContaining(['portra-400-endura-v1', 'trix-400-mono-v1', 'hp5-plus-400-mono-v1']));
    expect(ids('400')).not.toContain('ektar-100-edge-v1');
    expect(ids('800t')).toEqual(['ff-cinestill800t-v1']);
    expect(ids('800')).toEqual(expect.arrayContaining(['ff-cinestill800t-v1', 'spk-portra-800-endura-v1']));
    expect(ids('200')).not.toContain('sfl-vision-320t-5277-v1');
  });

  it('ranks the exact name, then the start, then other names, then typos', () => {
    // The exact name first, though the other look comes first in the list.
    expect(names('portra 400')).toEqual(['Portra 400', 'Portra 400 VC']);
    expect(names('Portra')[0]).toBe('Portra 400 VC');
    // A name that starts with the search beats a match in the text.
    expect(names('gold')[0]).toBe('Gold 200');
    expect(ids('kodak')[0]).toBe('ektar-100-edge-v1');
    const mixed = [
      { id: 'a-v1', name: 'Porta Thing', cover: box('X', 'PORTA') },
      { id: 'b-v1', name: 'Thing', cover: box('Kodak', 'THING'), look: 'Kodak Portra' },
      { id: 'c-v1', name: 'Portra', cover: box('Kodak', 'PORTRA') },
    ];
    // The look text only counts when nothing else matches.
    expect(searchLooks(mixed, 'portra').map((look) => look.id)).toEqual(['c-v1', 'a-v1']);
    expect(searchLooks(mixed, 'พอร์ตร้า').map((look) => look.id)).toEqual(['c-v1']);
  });

  it('reads the look text when nothing else matches, and not for a brand', () => {
    expect(ids('ektacolor')).toEqual(['ektar-100-edge-v1', 'ff-cinestill800t-v1']);
    expect(ids('crystal archive')).toEqual(['ff-lomochromepurple-v1']);
    expect(ids('fuji')).not.toContain('ff-lomochromepurple-v1');
    expect(ids('ฟูจิ')).not.toContain('ff-lomochromepurple-v1');
  });
});

describe('closestLooks', () => {
  it('suggests looks near a search that found nothing', () => {
    expect(closestLooks(LOOKS, 'portrq 4000', POPULAR_SEARCH).looks.length).toBeGreaterThan(0);
    const near = closestLooks(LOOKS, 'Ektra', POPULAR_SEARCH);
    expect(near.near).toBe(true);
    expect(near.looks[0]?.id).toBe('ektar-100-edge-v1');
  });

  it('offers the popular looks when nothing is near, up to six', () => {
    const { looks: offered, near } = closestLooks(LOOKS, 'qqqqqqqqqq', POPULAR_SEARCH);
    expect(near).toBe(false);
    expect(offered.map((look) => look.id)).toEqual(POPULAR_SEARCH.filter((id) => LOOKS.some((look) => look.id === id)).slice(0, 6));
    expect(offered.length).toBeLessThanOrEqual(6);
  });
});

describe('lookRequestMail', () => {
  it('asks for the look by name', () => {
    expect(lookRequestMail(' FinePix Z ')).toBe('mailto:support@grku.app?subject=Look%20request%3A%20FinePix%20Z');
  });
});
