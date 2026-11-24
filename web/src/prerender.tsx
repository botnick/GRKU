// The entry that scripts/prerender.mjs builds for Node. It renders the first screen of each page
// of each language, so the HTML of the page holds its text before the script runs.
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { SiteFooter } from './components/SiteFooter';
import { STRINGS, type Language } from './i18n';
import { releaseUrl } from './links';
import type { SitePage } from './languagePage';

export { LANGUAGES, loadAllStrings, pageText, STRINGS } from './i18n';
export { preloadAll } from './parts';
export { DEVELOP_STRINGS } from './develop/strings';
export { faqOf } from './develop/seo';
export { INDEXED_PAGES, LANGUAGE_PATHS, pagePath, SITE_PAGES } from './languagePage';
export { alternates, alternateTags, localeTags, SITE, sitemapXml } from './seo';

export const VERSION = __GRKU_VERSION__;

/** The markup of `page` in `language`, as a browser without a card or storage shows it first. */
export function render(language: Language, page: SitePage = 'home'): string {
  return renderToString(<App initialLanguage={language} initialPage={page} />);
}

/**
 * The header links, the link preview image text, and the footer of the document pages in `language`, which
 * scripts/build-docs.mjs puts around each document, so they match the pages of the site.
 */
export function docChrome(language: Language): { home: string; install: string; imageAlt: string; footer: string } {
  const t = STRINGS[language];
  return {
    home: t.site.home,
    install: t.install,
    imageAlt: t.site.ogImageAlt,
    footer: renderToString(
      <SiteFooter strings={t} language={language} version={VERSION} releaseUrl={releaseUrl(language)} />,
    ),
  };
}
