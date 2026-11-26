// The Cloudflare Pages worker (`_worker.js`). `_routes.json` sends it only the pages of the root
// language (`EDGE_PATHS`) and the old looks pages (`LOOKS_PATHS`), so it costs nothing for the other requests. scripts/prerender.mjs bundles it into the build.
import { LANGUAGE_PATHS, looksLanguage, looksPath, pagePath, SITE_PAGES, visitorLanguage, type SitePage } from './languagePage';

/** The pages of the root language, each of which sends a visitor to the same page of their language. */
export const EDGE_PATHS: Readonly<Record<string, SitePage>> = Object.fromEntries(
  (Object.keys(SITE_PAGES) as SitePage[]).map((page) => [pagePath('th', page), page]),
);

/** The old looks pages, which the worker sends to the install page of their language. */
export const LOOKS_PATHS: readonly string[] = (Object.keys(LANGUAGE_PATHS) as (keyof typeof LANGUAGE_PATHS)[]).map(looksPath);

/** The headers of `_headers` for every path. Pages does not add them to worker responses. */
declare const __SITE_HEADERS__: Readonly<Record<string, string>>;

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

/** The request properties that Cloudflare adds. */
type EdgeRequest = Request & { cf?: { country?: string } };

export default {
  async fetch(request: EdgeRequest, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // The looks page of the earlier site is the install page now, which starts with the looks.
    const looks = looksLanguage(url.pathname);
    if (looks && (request.method === 'GET' || request.method === 'HEAD')) {
      url.pathname = pagePath(looks, 'install');
      return Response.redirect(url.href, 301);
    }
    const page = Object.hasOwn(EDGE_PATHS, url.pathname) ? EDGE_PATHS[url.pathname] : undefined;
    // The page itself, for the head of the app after a move inside it (src/head.ts).
    if (page && (request.method === 'GET' || request.method === 'HEAD') && request.headers.get('X-GRKU-Head') !== '1') {
      const language = visitorLanguage({
        cookie: request.headers.get('Cookie'),
        acceptLanguage: request.headers.get('Accept-Language'),
        country: request.cf?.country ?? null,
        userAgent: request.headers.get('User-Agent'),
      });
      // The root pages are the pages of one language (Thai); every other language has its own path.
      // A visitor of that language, a crawler, and a request without a language get the root page
      // itself; a redirect to it would loop.
      const target = language && pagePath(language, page);
      if (target && target !== url.pathname) {
        url.pathname = target;
        return new Response(null, {
          status: 302,
          headers: { Location: url.href, 'Cache-Control': 'private, no-store', Vary: 'Accept-Language, Cookie, User-Agent, X-GRKU-Head' },
        });
      }
    }
    const asset = await env.ASSETS.fetch(request);
    const response = new Response(asset.body, asset);
    for (const [name, value] of Object.entries(__SITE_HEADERS__)) {
      if (!response.headers.has(name)) response.headers.set(name, value);
    }
    response.headers.append('Vary', 'Accept-Language, Cookie, User-Agent, X-GRKU-Head');
    // A page that the worker could have sent elsewhere is the answer of this request only.
    if (page) response.headers.set('Cache-Control', 'private, no-store');
    return response;
  },
};
