// The entry of the page. The HTML already holds the text and the pictures of the page
// (scripts/prerender.mjs), so the app starts after them: when the page has loaded, at the first
// touch, key, or click, or after a few seconds, whichever comes first. The photo at the top then
// downloads and shows without the script competing for the connection and the processor.
// The styles stay here, in the HTML, so the page shows styled before the app starts.
// The site serves its fonts itself, so a page view sends no request to a font host.
// loadFonts adds the Chinese, Japanese, or Korean fonts when a page in that language needs them.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/ibm-plex-sans-condensed/700.css';
import './index.css';
import { loadFonts } from './fonts';
import { pathLanguage } from './languagePage';

// The Thai fonts load at once, not with the app: their styles are small, and a Thai page sets all
// its text in them. The Chinese, Japanese, and Korean styles are large (about 100 KB each), so they
// load with the app (main.tsx), after the photo; the text shows in the system font until then.
const language = pathLanguage(location.pathname);
if (language === 'th') loadFonts(language);

const EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const;
let started = false;

function start() {
  if (started) return;
  started = true;
  removeEventListener('load', afterPaint);
  for (const type of EVENTS) removeEventListener(type, start, { capture: true });
  void import('./main');
}

const painted = () => performance.getEntriesByType('paint').some((entry) => entry.name === 'first-contentful-paint');

/**
 * Starts once the loaded page is on the screen: after the first paint, then two more frames, so
 * the photos that loaded with the page show before the app starts.
 */
function afterPaint() {
  if (!painted()) {
    requestAnimationFrame(afterPaint);
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(start, 0)));
}

if (document.readyState === 'complete') {
  afterPaint();
} else {
  addEventListener('load', afterPaint, { once: true });
  for (const type of EVENTS) addEventListener(type, start, { once: true, passive: true, capture: true });
  setTimeout(start, 4000);
}
