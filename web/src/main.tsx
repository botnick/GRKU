import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { canWriteCards } from './card';
import { loadLastCard } from './cardStore';
import { loadImports } from './import/store';
import { loadFonts } from './fonts';
import { loadStrings, pageLanguage, showLanguage, takeLegacyLanguage } from './i18n';
import { looksLanguage, pagePath, pathPage } from './languagePage';
import { anchorPage } from './navigation';
import { preloadPage, preloadOnIntent } from './parts';

const language = pageLanguage();
let page = pathPage(location.pathname) ?? 'home';
// The steps of the one-page site have their own pages now: `/#install` opens the install page.
// The looks page of the earlier site is the install page now (the edge worker sends it there too).
const moved = page === 'home' ? anchorPage(location.hash) : looksLanguage(location.pathname) ? page : null;
if (moved) {
  history.replaceState(history.state, '', `${pagePath(language, moved)}${location.search}${location.hash}`);
  page = moved;
}
// A visitor who chose a language before each language had its own page goes to that page once.
const legacy = takeLegacyLanguage();
if (legacy !== null && legacy !== language && pagePath('th', page) === location.pathname) {
  location.replace(`${pagePath(legacy, page)}${location.search}${location.hash}`);
}
loadFonts(language);

/** The result of `task`, or `fallback` when the store is slow, so it does not hold the page back. */
const soon = <T,>(task: Promise<T>, fallback: T) =>
  Promise.race([task, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 800))]);

{
  // The effects imported and the card connected on an earlier visit.
  // The part of this page downloads with the stored data, so the first render does not wait for it.
  // The text of the page language is its own script (i18n.ts); it loads with them too.
  const [imports, lastCard] = await Promise.all([
    soon(loadImports(), []),
    canWriteCards() ? soon(loadLastCard(), null) : null,
    preloadPage(page).catch(() => {}),
    loadStrings(language),
  ]);
  showLanguage(language, page);

  // The build fills the root with the page of this language for search engines. The first render
  // replaces it.
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App initialLanguage={language} initialPage={page} initialImports={imports} initialCard={lastCard} />
    </StrictMode>,
  );
}
preloadOnIntent(page);
