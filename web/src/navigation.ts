// Links between the three pages of the site. A link is a real address, so the page works without
// the script and search engines follow it; with the script, a click changes the page in place and
// keeps everything that the visitor chose, the connected card too.
import type { MouseEvent } from 'react';
import type { Language } from './i18n';
import { pagePath, type SitePage } from './languagePage';

/** Shows `page`, then the element of `hash` (`#faq`) on it, or its top. */
export type Navigate = (page: SitePage, hash?: string) => void;

/** The `href` and the click handler of a link to `page`, which `navigate` follows in place. */
export function pageLink(language: Language, navigate: Navigate, page: SitePage, hash = '') {
  return {
    href: `${pagePath(language, page)}${hash}`,
    onClick(event: MouseEvent<HTMLAnchorElement>) {
      // A new tab, a new window, or a download keeps the browser's own way.
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(page, hash);
    },
  };
}

/**
 * The page of the old anchors of the one-page site: `/#looks` and `/#install` are on the install
 * page now. The GRKU Plus links of the key email and the pay QR open it too, where the looks unlock.
 */
export function anchorPage(hash: string): SitePage | null {
  if (/^#(plus|pay)=/.test(hash)) return 'install';
  switch (hash) {
    case '#looks':
    case '#modules':
    case '#camera':
    case '#install':
      return 'install';
    default:
      return null;
  }
}

/** A link maker for the components: the link to `page` (and `hash`) in the language of the page. */
export type PageLink = (page: SitePage, hash?: string) => ReturnType<typeof pageLink>;
