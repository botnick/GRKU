// The Cloudflare Pages worker (`_worker.js`). `_routes.json` sends it only the pages of the root
// language (`EDGE_PATHS`), so it costs nothing for the other requests. scripts/prerender.mjs bundles it into the build.
import { pagePath, SITE_PAGES, visitorLanguage, type SitePage } from './languagePage';

/** The pages of the root language, each of which sends a visitor to the same page of their language. */
export const EDGE_PATHS: Readonly<Record<string, SitePage>> = Object.fromEntries(
  (Object.keys(SITE_PAGES) as SitePage[]).map((page) => [pagePath('th', page), page]),
);

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
    const page = Object.hasOwn(EDGE_PATHS, url.pathname) ? EDGE_PATHS[url.pathname] : undefined;
    if (page && (request.method === 'GET' || request.method === 'HEAD')) {
      const language = visitorLanguage({
        cookie: request.headers.get('Cookie'),
        acceptLanguage: request.headers.get('Accept-Language'),
        country: request.cf?.country ?? null,
      });
      // The root pages are the pages of one language (Thai); every other language has its own path.
      // A visitor of that language gets the root page itself; a redirect to it would loop.
      const target = pagePath(language, page);
      if (target !== url.pathname) {
        url.pathname = target;
        return new Response(null, {
          status: 302,
          headers: { Location: url.href, 'Cache-Control': 'private, no-store', Vary: 'Accept-Language, Cookie' },
        });
      }
    }
    const asset = await env.ASSETS.fetch(request);
    const response = new Response(asset.body, asset);
    for (const [name, value] of Object.entries(__SITE_HEADERS__)) {
      if (!response.headers.has(name)) response.headers.set(name, value);
    }
    response.headers.append('Vary', 'Accept-Language, Cookie');
    return response;
  },
};
