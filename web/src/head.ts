// The head of the page after a move inside the app: the prerendered HTML of the new address
// (scripts/prerender.mjs) holds its canonical and hreflang links, its link preview, its Markdown
// copy, and its structured data. The page copies them over, so a crawler that runs the script
// sees the same head as one that reads the HTML.

/** The tags of the head that belong to one page. */
const PAGE_TAGS = [
  'link[rel="canonical"]',
  'link[rel="alternate"]',
  'meta[name="description"]',
  'meta[name="robots"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
  'script[type="application/ld+json"]',
].join(',');

let run = 0;

/** Replaces the page tags of the head with those of the prerendered page at `path`. */
export async function syncHead(path: string): Promise<void> {
  const mine = ++run;
  let html: string;
  try {
    // The edge worker sends a visitor of a Thai page to the page of their language; this header
    // asks it for the page itself (src/edge.ts).
    const response = await fetch(path, { headers: { Accept: 'text/html', 'X-GRKU-Head': '1' }, credentials: 'omit' });
    if (!response.ok || response.redirected || !response.headers.get('Content-Type')?.includes('text/html')) return;
    html = await response.text();
  } catch {
    return;
  }
  // A later move won, or the address changed meanwhile.
  if (mine !== run || location.pathname !== path) return;
  const next = new DOMParser().parseFromString(html, 'text/html');
  const fresh = [...next.head.querySelectorAll(PAGE_TAGS)];
  if (fresh.length === 0) return;
  for (const tag of document.head.querySelectorAll(PAGE_TAGS)) tag.remove();
  for (const tag of fresh) document.head.append(document.importNode(tag, true));
  const title = next.querySelector('title')?.textContent;
  if (title) document.title = title;
}
