import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { closestLooks } from '../lookSearch';
import { en } from '../strings/en';
import { th } from '../strings/th';
import { LookSearchEmpty } from './LookSearchEmpty';

const box = (brand: string, name: string, number?: string) => ({ template: 'box' as const, brand, name, number });
const LOOKS = [
  { id: 'portra-400-endura-v1', name: 'Portra 400', icon: '', cover: box('Kodak', 'PORTRA', '400') },
  { id: 'gold-200-premier-v1', name: 'Gold 200', icon: '', cover: box('Kodak', 'GOLD', '200') },
  { id: 'ektar-100-edge-v1', name: 'Ektar 100', icon: '', cover: box('Kodak', 'EKTAR', '100') },
];
const noop = () => undefined;

function render(query: string, strings = en, makeOwn: Parameters<typeof LookSearchEmpty>[0]['makeOwn'] = { onClick: noop }) {
  const offered = closestLooks(LOOKS, query, ['gold-200-premier-v1', 'portra-400-endura-v1']);
  return renderToStaticMarkup(
    <LookSearchEmpty query={query} suggestions={offered.looks} near={offered.near} strings={strings} onPick={noop} onClear={noop} onShowAll={noop} makeOwn={makeOwn} />,
  );
}

describe('the empty state of the look search', () => {
  it('names the search, offers the closest looks, and the ways on', () => {
    const html = render('Ektra');
    expect(html).toContain('No look named “Ektra”');
    expect(html).toContain('Closest looks');
    expect(html).toContain('Ektar 100');
    expect(html).toContain('Clear search');
    expect(html).toContain('Show all');
    expect(html).toContain('Make your own from a LUT or Lightroom preset');
    expect(html).toContain('href="mailto:support@grku.app?subject=Look%20request%3A%20Ektra"');
  });

  it('offers the popular looks when nothing is near', () => {
    const html = render('FinePix');
    expect(html).toContain('Popular looks');
    expect(html.indexOf('Gold 200')).toBeLessThan(html.indexOf('Portra 400'));
    expect(html).not.toContain('Ektar 100');
  });

  it('links to the install page where the page has no import', () => {
    expect(render('FinePix', en, { href: '/install/' })).toContain('href="/install/"');
    expect(render('FinePix', en, null)).not.toContain('Lightroom');
  });

  it('without a search, only says that the filters find nothing', () => {
    const html = render('');
    expect(html).toContain(en.lookSearch.noLooksHere);
    expect(html).not.toContain('Clear search');
    expect(html).not.toContain('mailto:');
  });

  it('speaks the language of the page', () => {
    expect(render('ฟายน์', th)).toContain(th.lookSearch.noLookNamed('ฟายน์'));
  });
});
