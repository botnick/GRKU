import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { canWriteCards } from './card';
import { loadLastCard } from './cardStore';
import { loadImports } from './import/store';
import { loadFonts } from './fonts';
import { pageLanguage, showLanguage, takeLegacyLanguage } from './i18n';
import { LANGUAGE_PATHS } from './languagePage';
// The site serves its fonts itself, so a page view sends no request to a font host.
// loadFonts adds the Chinese, Japanese, or Korean fonts when a page in that language needs them.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './index.css';
import './styles.css';
import './theme.css';
import './landing.css';
import './desk.css';

const language = pageLanguage();
// A visitor who chose a language before each language had its own page goes to that page once.
const legacy = takeLegacyLanguage();
if (legacy !== null && legacy !== language && location.pathname === '/') {
  location.replace(`${LANGUAGE_PATHS[legacy]}${location.search}${location.hash}`);
}
showLanguage(language, false);
loadFonts(language);

// The fast-boot firmware page needs no imports and no card.

/** The result of `task`, or `fallback` when the store is slow, so it does not hold the page back. */
const soon = <T,>(task: Promise<T>, fallback: T) =>
  Promise.race([task, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 800))]);

{
  // The effects imported and the card connected on an earlier visit.
  const [imports, lastCard] = await Promise.all([
    soon(loadImports(), []),
    canWriteCards() ? soon(loadLastCard(), null) : null,
  ]);

  // The build fills the root with the page of this language for search engines. The first render
  // replaces it.
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App initialLanguage={language} initialImports={imports} initialCard={lastCard} />
    </StrictMode>,
  );
}
