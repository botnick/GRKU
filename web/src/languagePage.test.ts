import { afterEach, describe, expect, it, vi } from 'vitest';
import edge from './edge';
import {
  acceptedLanguages,
  INDEXED_PAGES,
  isInstallStep,
  isCrawler,
  cookieValue,
  fastbootPath,
  isFastbootPath,
  pagePath,
  pathLanguage,
  pathPage,
  visitorLanguage,
  type Visitor,
} from './languagePage';

const visitor = (fields: Partial<Visitor>): Visitor => ({ cookie: null, acceptLanguage: null, country: null, ...fields });

describe('pathLanguage', () => {
  it('reads the language page of an address', () => {
    expect(pathLanguage('/')).toBe('th');
    expect(pathLanguage('/zh-hant/')).toBe('zh-Hant');
    expect(pathLanguage('/zh-Hans')).toBe('zh-Hans');
    expect(pathLanguage('/ja/')).toBe('ja');
    expect(pathLanguage('/ko')).toBe('ko');
    expect(pathLanguage('/faq')).toBe('th');
  });

  it('reads the language of a fast-boot firmware page', () => {
    expect(pathLanguage('/fastboot/')).toBe('th');
    expect(pathLanguage('/zh-hans/fastboot')).toBe('zh-Hans');
    expect(pathLanguage('/ko/fastboot/')).toBe('ko');
    expect(isFastbootPath('/ja/fastboot')).toBe(true);
    expect(isFastbootPath('/ja/')).toBe(false);
    expect(isFastbootPath('/faq/fastboot/')).toBe(false);
    expect(fastbootPath('zh-Hant')).toBe('/zh-hant/fastboot/');
    expect(fastbootPath('en')).toBe('/en/fastboot/');
    expect(fastbootPath('th')).toBe('/fastboot/');
  });
});

describe('site pages', () => {
  it('puts the install page under each language path', () => {
    expect(pagePath('th', 'home')).toBe('/');
    expect(pagePath('th', 'install')).toBe('/install/');
    expect(pagePath('en', 'install')).toBe('/en/install/');
    expect(pagePath('zh-Hant', 'install')).toBe('/zh-hant/install/');
  });

  it('puts each step of the install on its own page', () => {
    expect(pagePath('th', 'camera')).toBe('/install/camera/');
    expect(pagePath('ja', 'modules')).toBe('/ja/install/modules/');
    expect(pagePath('en', 'write')).toBe('/en/install/write/');
    expect(pathPage('/ko/install/write')).toBe('write');
    expect(pathPage('/install/camera/')).toBe('camera');
    expect(pathLanguage('/zh-hans/install/modules/')).toBe('zh-Hans');
    expect(pathLanguage('/install/write/')).toBe('th');
  });

  it('puts the install guide under each language path, indexed and outside the install steps', () => {
    expect(pagePath('th', 'guide')).toBe('/guide/');
    expect(pagePath('en', 'guide')).toBe('/en/guide/');
    expect(pagePath('zh-Hans', 'guide')).toBe('/zh-hans/guide/');
    expect(pathPage('/ja/guide')).toBe('guide');
    expect(pathLanguage('/ko/guide/')).toBe('ko');
    expect(isInstallStep('guide')).toBe(false);
    expect(isInstallStep('write')).toBe(true);
    expect(isInstallStep('home')).toBe(false);
    expect(INDEXED_PAGES).toContain('guide');
  });

  it('reads the page and the language of an address', () => {
    expect(pathPage('/')).toBe('home');
    expect(pathPage('/en/')).toBe('home');
    expect(pathPage('/looks')).toBe('install');
    expect(pathPage('/en/looks/')).toBe('install');
    expect(pathPage('/ja/Install/')).toBe('install');
    expect(pathPage('/faq/')).toBeNull();
    expect(pathPage('/en/terms/')).toBeNull();
    expect(pathLanguage('/looks/')).toBe('th');
    expect(pathLanguage('/ko/looks/')).toBe('ko');
    expect(pathLanguage('/en/install')).toBe('en');
  });
});

describe('acceptedLanguages', () => {
  it('orders the tags by quality and drops the wildcard and q=0', () => {
    expect(acceptedLanguages('en-US,en;q=0.9,ja;q=0.95,*;q=0.5,ko;q=0')).toEqual(['en-US', 'ja', 'en']);
    expect(acceptedLanguages('')).toEqual([]);
    expect(acceptedLanguages('*')).toEqual([]);
  });
});

describe('cookieValue', () => {
  it('finds one cookie among others', () => {
    expect(cookieValue('a=1; grku_language=ja; b=2', 'grku_language')).toBe('ja');
    expect(cookieValue('a=1', 'grku_language')).toBeNull();
  });
});

describe('visitorLanguage', () => {
  it('keeps the language that the visitor chose', () => {
    const chosen = visitor({ cookie: 'grku_language=en', acceptLanguage: 'zh-TW', country: 'TW' });
    expect(visitorLanguage(chosen)).toBe('en');
    expect(visitorLanguage(visitor({ cookie: 'grku_language=ko', acceptLanguage: 'ja' }))).toBe('ko');
  });

  it('ignores a cookie with an unknown language', () => {
    expect(visitorLanguage(visitor({ cookie: 'grku_language=fr', acceptLanguage: 'ja' }))).toBe('ja');
  });

  it('follows the browser language before the country', () => {
    expect(visitorLanguage(visitor({ acceptLanguage: 'en-US,en;q=0.9', country: 'TW' }))).toBe('en');
    expect(visitorLanguage(visitor({ acceptLanguage: 'ja-JP', country: 'US' }))).toBe('ja');
    expect(visitorLanguage(visitor({ acceptLanguage: 'de-DE,de;q=0.9', country: 'JP' }))).toBe('en');
  });

  it('takes the script of a bare zh from the country', () => {
    expect(visitorLanguage(visitor({ acceptLanguage: 'zh', country: 'HK' }))).toBe('zh-Hant');
    expect(visitorLanguage(visitor({ acceptLanguage: 'zh', country: 'CN' }))).toBe('zh-Hans');
    expect(visitorLanguage(visitor({ acceptLanguage: 'zh-CN', country: 'TW' }))).toBe('zh-Hans');
  });

  it('keeps the page that was asked for when the browser sends no language, as search engines crawl', () => {
    expect(visitorLanguage(visitor({ country: 'KR' }))).toBeNull();
    expect(visitorLanguage(visitor({ country: 'US' }))).toBeNull();
    expect(visitorLanguage(visitor({}))).toBeNull();
    expect(visitorLanguage(visitor({ acceptLanguage: '*' }))).toBeNull();
  });

  it('keeps the page that was asked for when a crawler or a link preview asks', () => {
    const googlebot = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    expect(visitorLanguage(visitor({ acceptLanguage: 'en-US', country: 'US', userAgent: googlebot }))).toBeNull();
    expect(visitorLanguage(visitor({ acceptLanguage: 'ja', userAgent: 'facebookexternalhit/1.1;line-poker/1.0' }))).toBeNull();
    expect(visitorLanguage(visitor({ acceptLanguage: 'ko', userAgent: 'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)' }))).toBeNull();
  });
});

describe('isCrawler', () => {
  it('knows the search engines and the link previews', () => {
    for (const agent of [
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/120.0 Safari/537.36',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
      'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1)',
      'Twitterbot/1.0',
      'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
      'WhatsApp/2.23.20.0',
      'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    ]) {
      expect(isCrawler(agent), agent).toBe(true);
    }
  });

  it('leaves browsers alone', () => {
    for (const agent of [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 Line/14.19.1',
    ]) {
      expect(isCrawler(agent), agent).toBe(false);
    }
    expect(isCrawler(null)).toBe(false);
  });
});

describe('edge worker', () => {
  const page = '<!doctype html><title>GRKU</title>';
  const assets = { fetch: vi.fn(async () => new Response(page, { headers: { 'Content-Type': 'text/html' } })) };
  const request = (path: string, headers: Record<string, string>, country?: string) =>
    Object.assign(new Request(`https://grku.app${path}`, { headers }), { cf: country ? { country } : undefined });

  afterEach(() => {
    vi.unstubAllGlobals();
    assets.fetch.mockClear();
  });

  it('sends a visitor of the root page to the page of their language', async () => {
    const response = await edge.fetch(request('/?ref=x', { 'Accept-Language': 'zh-TW' }), { ASSETS: assets });
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://grku.app/zh-hant/?ref=x');
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it('sends a visitor of English to the English page, not to the root', async () => {
    const response = await edge.fetch(request('/', { 'Accept-Language': 'en-US,en;q=0.9' }, 'US'), { ASSETS: assets });
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://grku.app/en/');
    expect(response.headers.get('Vary')).toBe('Accept-Language, Cookie, User-Agent');
  });

  it('serves the Thai pages to search engines, which crawl from abroad', async () => {
    vi.stubGlobal('__SITE_HEADERS__', {});
    // Googlebot crawls from the US without a language.
    const plain = await edge.fetch(request('/', { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }, 'US'), { ASSETS: assets });
    expect(plain.status).toBe(200);
    const english = await edge.fetch(
      request('/guide/', { 'Accept-Language': 'en-US', 'User-Agent': 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)' }, 'US'),
      { ASSETS: assets },
    );
    expect(english.status).toBe(200);
    expect(english.headers.get('Vary')).toBe('Accept-Language, Cookie, User-Agent');
    expect(assets.fetch).toHaveBeenCalledTimes(2);
  });

  it('serves the root page, which is Thai, to a visitor of Thai, with the site headers', async () => {
    vi.stubGlobal('__SITE_HEADERS__', { 'Content-Security-Policy': "default-src 'self'" });
    const response = await edge.fetch(request('/', { 'Accept-Language': 'th' }, 'TH'), { ASSETS: assets });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(page);
    expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'self'");
    expect(response.headers.get('Vary')).toBe('Accept-Language, Cookie, User-Agent');
  });

  it('sends the old looks pages to the install page of their language', async () => {
    const thai = await edge.fetch(request('/looks/', { 'Accept-Language': 'ja' }), { ASSETS: assets });
    expect(thai.status).toBe(301);
    expect(thai.headers.get('Location')).toBe('https://grku.app/install/');
    const english = await edge.fetch(request('/en/looks?ref=x', {}), { ASSETS: assets });
    expect(english.headers.get('Location')).toBe('https://grku.app/en/install/?ref=x');
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it('sends a visitor of a Thai page to the same page of their language', async () => {
    const install = await edge.fetch(request('/install/?ref=x', { 'Accept-Language': 'en' }), { ASSETS: assets });
    expect(install.headers.get('Location')).toBe('https://grku.app/en/install/?ref=x');
    vi.stubGlobal('__SITE_HEADERS__', {});
    const thai = await edge.fetch(request('/install/', { 'Accept-Language': 'th' }), { ASSETS: assets });
    expect(thai.status).toBe(200);
  });

  it('sends a visitor of a Thai step to the same step of their language', async () => {
    const response = await edge.fetch(request('/install/modules/', { 'Accept-Language': 'ko' }), { ASSETS: assets });
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://grku.app/ko/install/modules/');
  });

  it('leaves a language page as it is', async () => {
    vi.stubGlobal('__SITE_HEADERS__', {});
    const response = await edge.fetch(request('/ja/', { 'Accept-Language': 'ko' }), { ASSETS: assets });
    expect(response.status).toBe(200);
    expect(assets.fetch).toHaveBeenCalledOnce();
  });
});
