import { beforeEach, describe, expect, it } from 'vitest';
import {
  adminRoute,
  bangkokDayStart,
  COOKIE,
  LOGIN_GLOBAL_LOCK,
  LOGIN_GLOBAL_MAX,
  LOGIN_IP_MAX,
  LOGIN_IP_WINDOW,
  makeSession,
  SESSION_TTL,
  withSettings,
  type AdminDeps,
  type AdminEnv,
} from './index';

// A D1 for the tests: node:sqlite (Node 22.5+) behind the few calls the admin code makes.
type Sqlite = { prepare(sql: string): { get(...a: unknown[]): unknown; all(...a: unknown[]): unknown[]; run(...a: unknown[]): { changes: number } }; exec(sql: string): void };
const { DatabaseSync } = (await import(/* @vite-ignore */ 'node:' + 'sqlite')) as { DatabaseSync: new (path: string) => Sqlite };
const SCHEMA = (await import(/* @vite-ignore */ 'node:' + 'fs')).readFileSync(new URL('../../schema.sql', (import.meta as unknown as { url: string }).url), 'utf8') as string;

function fakeD1(): D1Database {
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA);
  const statement = (sql: string, args: unknown[] = []) => ({
    bind: (...next: unknown[]) => statement(sql, next),
    first: async () => (db.prepare(sql).get(...args) as unknown) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args), success: true }),
    run: async () => {
      if (/\bRETURNING\b/i.test(sql)) return { results: db.prepare(sql).all(...args), meta: { changes: 1 } };
      return { meta: { changes: db.prepare(sql).run(...args).changes } };
    },
  });
  return {
    prepare: (sql: string) => statement(sql),
    batch: async (list: { run(): Promise<unknown> }[]) => {
      const out = [];
      for (const s of list) out.push(await s.run());
      return out;
    },
  } as unknown as D1Database;
}

const ORIGIN = 'https://grku-plus.test';
const PASSWORD = 'test-password-not-real';
let now = Date.parse('2026-11-25T10:00:00Z');
let env: AdminEnv;
let sent: string[];
let mailFails = false;

function deps(): AdminDeps {
  return {
    env,
    now: () => now,
    sleep: async () => {},
    sendKey: async (email) => {
      if (mailFails) throw new Error('552 mailbox full');
      sent.push(email);
    },
  };
}

function req(path: string, init: { method?: string; body?: unknown; cookie?: string; origin?: string | null; ip?: string; fetchSite?: string } = {}): Request {
  const headers = new Headers({ 'CF-Connecting-IP': init.ip ?? '203.0.113.7' });
  if (init.cookie) headers.set('Cookie', `${COOKIE}=${init.cookie}`);
  if (init.origin !== null && (init.method ?? 'GET') === 'POST') headers.set('Origin', init.origin ?? ORIGIN);
  if (init.fetchSite) headers.set('Sec-Fetch-Site', init.fetchSite);
  if (init.body !== undefined) headers.set('Content-Type', 'application/json');
  return new Request(ORIGIN + path, { method: init.method ?? 'GET', headers, body: init.body === undefined ? undefined : JSON.stringify(init.body) });
}

const call = (path: string, init?: Parameters<typeof req>[1]) => adminRoute(req(path, init), deps());
const login = (password: string, ip?: string) => call('/admin/login', { method: 'POST', body: { password }, ip });

async function session(): Promise<string> {
  const response = await login(PASSWORD);
  expect(response.status).toBe(200);
  return /__Host-grku_admin=([^;]+)/.exec(response.headers.get('Set-Cookie') ?? '')![1]!;
}

async function seed() {
  const run = (sql: string, ...args: unknown[]) => env.DB.prepare(sql).bind(...args).run();
  await run("INSERT INTO entitlements (owner, packs, slots, plus, paid, updated) VALUES ('buyer@example.com', '[\"kodak\"]', 10, 1, 248, ?)", now);
  await run("INSERT INTO keys (code, owner, created) VALUES ('ABCD-EFG-HJKM', 'buyer@example.com', ?)", now);
  await run("INSERT INTO orders (id, owner, tier, amount, cents, status, created, paid_at, slip_ref) VALUES ('ord1aaaaaaaa', 'buyer@example.com', 'plus', 199, 37, 'paid', ?, ?, 'ref1')", now - 1000, now - 500);
  await run("INSERT INTO slips (ref, order_id, amount, payer, created) VALUES ('ref1', 'ord1aaaaaaaa', 199, 'นาย สมชาย ใจดี', ?)", now);
  await run("INSERT INTO orders (id, owner, tier, amount, cents, status, created, paid_at, slip_ref) VALUES ('ord2aaaaaaaa', 'buyer@example.com', 'pack:kodak', 49, 5, 'paid', ?, ?, 'tmn:abc')", now - 3 * 86400_000, now - 3 * 86400_000);
  await run("INSERT INTO orders (id, owner, tier, amount, cents, status, created) VALUES ('ord3aaaaaaaa', 'other@example.org', 'slots25', 79, 11, 'open', ?)", now - 60_000);
  await run("INSERT INTO orders (id, owner, tier, amount, cents, status, created) VALUES ('ord4aaaaaaaa', 'anon:xyz', 'plus', 199, 12, 'open', ?)", now - 5 * 3600_000);
  await run("INSERT INTO keys (code, owner, created) VALUES ('ZZZZ-ZZZ-ZZZZ', 'anon:xyz', ?)", now);
}

beforeEach(async () => {
  now = Date.parse('2026-11-25T10:00:00Z');
  env = { DB: fakeD1(), KEY_SECRET: 'key-secret', ADMIN_PASSWORD: PASSWORD };
  sent = [];
  mailFails = false;
});

describe('the page', () => {
  it('serves one HTML page with a strict CSP, no caching, no indexing, and no CORS', async () => {
    const response = await call('/admin');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    const csp = response.headers.get('Content-Security-Policy')!;
    expect(csp).toContain("default-src 'none'");
    expect(csp).toMatch(/script-src 'nonce-[\w-]+'/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    const html = await response.text();
    const nonce = /nonce-([\w-]+)/.exec(csp)![1]!;
    expect(html).toContain(`<script nonce="${nonce}">`);
    expect(html).toContain('ฉันมีคีย์อยู่แล้ว');
    // The script parses.
    const script = new RegExp(`<script nonce="${nonce}">([\\s\\S]*?)</script>`).exec(html)![1]!;
    expect(() => new Function(script)).not.toThrow();
    // Inline style attributes would be blocked by the CSP: the page has none.
    expect(html).not.toMatch(/<[a-z]+[^>]*\sstyle="/);
  });

  it('answers unknown admin paths with 404 and JSON', async () => {
    const response = await call('/admin/nothing');
    expect(response.status).toBe(404);
  });
});

describe('sign-in', () => {
  it('signs in with the password and sets a strict, HttpOnly, Secure cookie for 7 days', async () => {
    const response = await login(PASSWORD);
    expect(response.status).toBe(200);
    const cookie = response.headers.get('Set-Cookie')!;
    expect(cookie).toMatch(/^__Host-grku_admin=v1\./);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain(`Max-Age=${SESSION_TTL / 1000}`);
  });

  it('refuses a wrong password and says how many tries are left', async () => {
    const response = await login('1151');
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: 'wrong password', left: LOGIN_IP_MAX - 1 });
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect((await login('')).status).toBe(401);
    expect((await login(PASSWORD + ' ')).status).toBe(401);
  });

  it('is closed without ADMIN_PASSWORD', async () => {
    env.ADMIN_PASSWORD = undefined;
    expect((await login('')).status).toBe(503);
    expect((await call('/admin/api/me', { cookie: await makeSession({ ...env, ADMIN_PASSWORD: '' }, now) })).status).toBe(401);
  });

  it('allows five tries per IP in 15 minutes, even for the right password after that', async () => {
    for (let i = 0; i < LOGIN_IP_MAX; i++) expect((await login('0000')).status).toBe(401);
    const blocked = await login(PASSWORD);
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toMatchObject({ error: 'too many' });
    // Another IP still may.
    expect((await login(PASSWORD, '198.51.100.1')).status).toBe(200);
    now += LOGIN_IP_WINDOW + 1;
    expect((await login(PASSWORD)).status).toBe(200);
  });

  it('a good sign-in clears the count of its IP', async () => {
    for (let i = 0; i < LOGIN_IP_MAX - 1; i++) await login('0000');
    expect((await login(PASSWORD)).status).toBe(200);
    for (let i = 0; i < LOGIN_IP_MAX - 1; i++) expect((await login('0000')).status).toBe(401);
  });

  it('locks the sign-in for everyone for an hour after 20 failures in an hour', async () => {
    for (let i = 0; i < LOGIN_GLOBAL_MAX; i++) await login('0000', `192.0.2.${i}`);
    const locked = await login(PASSWORD, '198.51.100.99');
    expect(locked.status).toBe(429);
    expect(await locked.json()).toMatchObject({ error: 'locked' });
    now += LOGIN_GLOBAL_LOCK - 60_000;
    expect((await login(PASSWORD, '198.51.100.99')).status).toBe(429);
    now += 120_000;
    expect((await login(PASSWORD, '198.51.100.99')).status).toBe(200);
  });

  it('an open session keeps working while the sign-in is locked', async () => {
    const cookie = await session();
    for (let i = 0; i < LOGIN_GLOBAL_MAX; i++) await login('0000', `192.0.2.${i}`);
    expect((await call('/admin/api/me', { cookie })).status).toBe(200);
  });

  it('logs out by clearing the cookie', async () => {
    const response = await call('/admin/logout', { method: 'POST', body: {} });
    expect(response.headers.get('Set-Cookie')).toContain('Max-Age=0');
  });
});

describe('sessions and CSRF', () => {
  it('needs a session for every API call', async () => {
    for (const path of ['/admin/api/me', '/admin/api/search?q=buyer', '/admin/api/orders', '/admin/api/sales', '/admin/api/mail', '/admin/api/chat']) {
      expect((await call(path)).status).toBe(401);
    }
    expect((await call('/admin/api/resend', { method: 'POST', body: { owner: 'buyer@example.com' } })).status).toBe(401);
    expect((await call('/admin/api/settings', { method: 'POST', body: { CHAT_ENABLED: 'off' } })).status).toBe(401);
  });

  it('refuses a forged, tampered, or expired session', async () => {
    const cookie = await session();
    expect((await call('/admin/api/me', { cookie })).status).toBe(200);
    const parts = cookie.split('.');
    expect((await call('/admin/api/me', { cookie: [parts[0], Number(parts[1]) + 1, parts[2], parts[3]].join('.') })).status).toBe(401);
    expect((await call('/admin/api/me', { cookie: 'v1.99999999999999.x.y' })).status).toBe(401);
    expect((await call('/admin/api/me', { cookie: await makeSession({ ...env, ADMIN_PASSWORD: 'other' }, now) })).status).toBe(401);
    now += SESSION_TTL + 1;
    expect((await call('/admin/api/me', { cookie })).status).toBe(401);
  });

  it('a new password ends the sessions of the old one', async () => {
    const cookie = await session();
    env.ADMIN_PASSWORD = 'new-password';
    expect((await call('/admin/api/me', { cookie })).status).toBe(401);
  });

  it('refuses a POST from another origin or without one', async () => {
    const cookie = await session();
    await seed();
    expect((await call('/admin/api/resend', { method: 'POST', cookie, body: { owner: 'buyer@example.com' }, origin: 'https://evil.example' })).status).toBe(403);
    expect((await call('/admin/api/resend', { method: 'POST', cookie, body: { owner: 'buyer@example.com' }, origin: null })).status).toBe(403);
    expect((await call('/admin/login', { method: 'POST', body: { password: PASSWORD }, origin: 'https://grku.app' })).status).toBe(403);
    expect((await call('/admin/api/settings', { method: 'POST', cookie, body: {}, origin: null, fetchSite: 'cross-site' })).status).toBe(403);
    expect((await call('/admin/api/settings', { method: 'POST', cookie, body: {}, origin: null, fetchSite: 'same-origin' })).status).toBe(200);
    expect(sent).toEqual([]);
  });
});

describe('customers', () => {
  let cookie: string;
  beforeEach(async () => {
    cookie = await session();
    await seed();
  });
  const find = async (q: string) => ((await (await call(`/admin/api/search?q=${encodeURIComponent(q)}`, { cookie })).json()) as { customers: { owner: string; key: string | null; orders: { id: string; status: string; amount: number; payer: string | null }[]; entitlement: { plus: boolean; packs: string[] } }[] }).customers;

  it('finds a customer by a part of the email, with key, entitlement, and orders', async () => {
    const [c, ...rest] = await find('BUYER@exa');
    expect(rest).toEqual([]);
    expect(c!.owner).toBe('buyer@example.com');
    expect(c!.key).toBe('ABCD-EFG-HJKM');
    expect(c!.entitlement).toMatchObject({ plus: true, packs: ['kodak'] });
    expect(c!.orders.map((o) => o.id)).toEqual(['ord1aaaaaaaa', 'ord2aaaaaaaa']);
    expect(c!.orders[0]).toMatchObject({ status: 'paid', amount: 199.37, payer: 'นาย สมชาย ใจดี' });
    // A gift link pays whole baht.
    expect(c!.orders[1]!.amount).toBe(49);
  });

  it('finds by a part of the key, with or without dashes, look-alike letters read as the key', async () => {
    expect((await find('efg-hj')).map((c) => c.owner)).toEqual(['buyer@example.com']);
    expect((await find('abcdefghjkm')).map((c) => c.owner)).toEqual(['buyer@example.com']);
    expect((await find('zzzz-zzz')).map((c) => c.owner)).toEqual(['anon:xyz']);
  });

  it('finds by the payer name on a slip and by an order id', async () => {
    expect((await find('สมชาย')).map((c) => c.owner)).toEqual(['buyer@example.com']);
    expect((await find('ord3aaaaaaaa')).map((c) => c.owner)).toEqual(['other@example.org']);
  });

  it('treats % and _ as text, and needs two letters', async () => {
    expect(await find('%')).toEqual([]);
    expect(await find('%%')).toEqual([]);
    expect(await find('__')).toEqual([]);
    expect(await find('b')).toEqual([]);
  });

  it('marks an open order past its hour as expired', async () => {
    const [anon] = await find('zzzz');
    expect(anon!.orders[0]!.status).toBe('expired');
  });

  it('emails the key again to a known customer only', async () => {
    const ok = await call('/admin/api/resend', { method: 'POST', cookie, body: { owner: 'Buyer@Example.com' } });
    expect(await ok.json()).toEqual({ ok: true });
    expect(sent).toEqual(['buyer@example.com']);
    expect((await call('/admin/api/resend', { method: 'POST', cookie, body: { owner: 'stranger@example.com' } })).status).toBe(404);
    expect((await call('/admin/api/resend', { method: 'POST', cookie, body: { owner: 'anon:xyz' } })).status).toBe(400);
    mailFails = true;
    const failed = await call('/admin/api/resend', { method: 'POST', cookie, body: { owner: 'buyer@example.com' } });
    expect(await failed.json()).toEqual({ ok: false, error: '552 mailbox full' });
  });
});

describe('orders, sales, mail, settings', () => {
  let cookie: string;
  beforeEach(async () => {
    cookie = await session();
    await seed();
  });

  it('lists the recent orders with a status filter', async () => {
    const ids = async (status: string) => ((await (await call(`/admin/api/orders?status=${status}`, { cookie })).json()) as { orders: { id: string }[] }).orders.map((o) => o.id);
    expect(await ids('all')).toEqual(['ord1aaaaaaaa', 'ord3aaaaaaaa', 'ord4aaaaaaaa', 'ord2aaaaaaaa']);
    expect(await ids('paid')).toEqual(['ord1aaaaaaaa', 'ord2aaaaaaaa']);
    expect(await ids('open')).toEqual(['ord3aaaaaaaa']);
    expect(await ids('expired')).toEqual(['ord4aaaaaaaa']);
  });

  it('sums the sales of today, 7 days, and 30 days by Bangkok day, by tier', async () => {
    const s = (await (await call('/admin/api/sales', { cookie })).json()) as Record<string, { baht: number; n: number; tiers: Record<string, { n: number }> }> & { openNow: number; buyers: number; days: { baht: number }[] };
    expect(s.today).toMatchObject({ baht: 199.37, n: 1 });
    expect(s.d7).toMatchObject({ baht: 248.37, n: 2 });
    expect(s.d30!.tiers).toMatchObject({ plus: { n: 1 }, 'pack:kodak': { n: 1 } });
    expect(s.openNow).toBe(1);
    expect(s.buyers).toBe(1);
    expect(s.days).toHaveLength(30);
    expect(s.days[29]!.baht).toBe(199.37);
  });

  it('starts the day at midnight in Bangkok', () => {
    // 2026-11-25 16:59 UTC is 23:59 in Bangkok; 17:00 UTC is the next day.
    expect(bangkokDayStart(Date.parse('2026-11-25T16:59:00Z'))).toBe(Date.parse('2026-11-24T17:00:00Z'));
    expect(bangkokDayStart(Date.parse('2026-11-25T17:00:00Z'))).toBe(Date.parse('2026-11-25T17:00:00Z'));
  });

  it('lists the key emails and counts the failures', async () => {
    const { logMail } = await import('./index');
    await logMail(env.DB, 'buyer@example.com', 'paid', null, now - 10);
    await logMail(env.DB, 'buyer@example.com', 'magic', new Error('552 5.2.2 mailbox full'), now);
    const mail = (await (await call('/admin/api/mail', { cookie })).json()) as { mails: { ok: boolean; error: string | null }[]; failed30: number };
    expect(mail.failed30).toBe(1);
    expect(mail.mails[0]).toMatchObject({ ok: false, error: '552 5.2.2 mailbox full' });
    const [c] = ((await (await call('/admin/api/search?q=buyer', { cookie })).json()) as { customers: { lastMail: { ok: boolean; kind: string } }[] }).customers;
    expect(c!.lastMail).toMatchObject({ ok: false, kind: 'magic' });
  });

  it('keeps settings over the vars, and empty goes back to the var', async () => {
    const save = (body: unknown) => call('/admin/api/settings', { method: 'POST', cookie, body });
    expect((await save({ CHAT_ENABLED: 'maybe' })).status).toBe(400);
    expect((await save({ CHAT_FREE_PER_DAY: '-1' })).status).toBe(400);
    expect((await save({ CHAT_ENABLED: 'off', CHAT_FREE_PER_DAY: '5', NOT_A_SETTING: 'x' })).status).toBe(200);
    const vars = { DB: env.DB, CHAT_ENABLED: 'on', CHAT_FREE_PER_DAY: '15', CHAT_PLUS_PER_DAY: '100' };
    expect(await withSettings(vars, now)).toMatchObject({ CHAT_ENABLED: 'off', CHAT_FREE_PER_DAY: '5', CHAT_PLUS_PER_DAY: '100' });
    expect((await save({ CHAT_ENABLED: '' })).status).toBe(200);
    expect(await withSettings(vars, now)).toMatchObject({ CHAT_ENABLED: 'on', CHAT_FREE_PER_DAY: '5' });
  });

  it('checks the form of the paid settings', async () => {
    const save = (body: unknown) => call('/admin/api/settings', { method: 'POST', cookie, body });
    expect((await save({ CHAT_ALLOW_PAID: 'yes' })).status).toBe(400);
    expect((await save({ CHAT_PAID_TIERS: 'free' })).status).toBe(400);
    expect((await save({ CHAT_PAID_MONTHLY_USD: '-5' })).status).toBe(400);
    expect((await save({ CHAT_ALLOW_PAID: '0', CHAT_PAID_TIERS: 'plus', CHAT_PAID_MONTHLY_USD: '12.50', CHAT_PAID_DAILY_USD: '2' })).status).toBe(200);
    expect(await withSettings({ DB: env.DB, CHAT_ALLOW_PAID: '1' }, now)).toMatchObject({ CHAT_ALLOW_PAID: '0', CHAT_PAID_TIERS: 'plus', CHAT_PAID_MONTHLY_USD: '12.50' });
  });

  it('sums the assistant counters: messages, models against caps, paid spend, provider state', async () => {
    Object.assign(env, {
      CHAT_NAME: 'gemini', CHAT_MODEL_FREE: 'lite', CHAT_MODEL_PLUS: 'flash', CHAT_RPD: 'flash=200,lite=900',
      CHAT3_NAME: 'paid', CHAT3_PAID: '1', CHAT3_MODEL_FREE: 'g/lite', CHAT3_MODEL_PLUS: 'g/flash',
      CHAT_PAID_MONTHLY_USD: '10', CHAT_DAILY_MESSAGES: '600',
    });
    const day = '2026-11-25';
    const add = (d: string, k: string, n: number, tokens: number) => env.DB.prepare('INSERT INTO chat_usage (day, k, n, tokens) VALUES (?, ?, ?, ?)').bind(d, k, n, tokens).run();
    await add(day, 'global', 40, 9000);
    await add(day, 's:a', 3, 0);
    await add(day, 's:b', 2, 0);
    await add(day, 'ip:x', 5, 0);
    await add(day, 'p:gemini:lite', 30, 7000);
    await add(day, 'p:paid:g/flash', 0, 2000);
    await add(day, '$:g/flash', 4, 120000);
    await add(day, 'usd', 0, 120000);
    await add('2026-11', 'usd', 0, 3_400_000);
    await add('2026-11', '$:g/flash', 50, 3_400_000);
    await add(day, 'e:gemini:429', 3, 0);
    await add(day, 'r:offtopic', 2, 0);
    await env.DB.prepare('INSERT INTO chat_provider (name, model, ok_at, err_at, err_code) VALUES (?, ?, ?, ?, ?)').bind('gemini', 'flash', now - 600_000, now - 60_000, '429').run();
    await env.DB.prepare('INSERT INTO chat_provider (name, model, ok_at) VALUES (?, ?, ?)').bind('paid', 'g/flash', now - 30_000).run();
    const chat = (await (await call('/admin/api/chat', { cookie })).json()) as {
      available: boolean;
      stats: { global: { n: number }; sessions: number; visitors: number; paid: { usdToday: number; usdMonth: number }; models: { model: string; paid: boolean; n: number; cap: number; usd: number; usdMonth: number }[]; providers: { name: string; state: string; errCode: string | null; failures: Record<string, number> }[]; refusals: [string, number][] };
    };
    expect(chat.available).toBe(true);
    const s = chat.stats;
    expect(s).toMatchObject({ global: { n: 40 }, sessions: 2, visitors: 1, paid: { usdToday: 0.12, usdMonth: 3.4 }, refusals: [['offtopic', 2]] });
    expect(s.models.map((m) => [m.model, m.paid, m.n, m.cap])).toEqual([['lite', false, 30, 900], ['flash', false, 0, 200], ['g/flash', true, 4, 0], ['g/lite', true, 0, 0]]);
    expect(s.models.find((m) => m.model === 'g/flash')).toMatchObject({ usd: 0.12, usdMonth: 3.4 });
    expect(s.providers).toEqual([
      expect.objectContaining({ name: 'gemini', state: 'limited', errCode: '429', failures: { '429': 3 } }),
      expect.objectContaining({ name: 'paid', state: 'ok' }),
    ]);
  });

  it('shows the answer cache, the cost per message, and the last eval, and clears the cache', async () => {
    Object.assign(env, { CHAT_NAME: 'gemini', CHAT_MODEL_FREE: 'lite', CHAT_EVAL: JSON.stringify({ date: '2026-11-27', prompt: 'p4', cases: 73, free: 90, plus: 92 }) });
    const day = '2026-11-25';
    const add = (k: string, n: number, tokens: number) => env.DB.prepare('INSERT INTO chat_usage (day, k, n, tokens) VALUES (?, ?, ?, ?)').bind(day, k, n, tokens).run();
    await add('global', 50, 0);
    await add('usd', 0, 100_000);
    await add('cache:hit', 6, 0);
    await add('cache:miss', 14, 0);
    for (const k of ['a', 'b']) await env.DB.prepare('INSERT INTO chat_cache (k, answer, created, hits) VALUES (?, ?, ?, ?)').bind(k, 'x', now, 3).run();
    type View = { evaluation: unknown; stats: { cache: unknown; paid: { perMessage: number } } };
    const view = (await (await call('/admin/api/chat', { cookie })).json()) as View;
    expect(view.evaluation).toEqual({ date: '2026-11-27', prompt: 'p4', cases: 73, free: 90, plus: 92 });
    expect(view.stats.cache).toEqual({ entries: 2, hitsAll: 6, hits: 6, misses: 14 });
    expect(view.stats.paid.perMessage).toBeCloseTo(0.002);
    const cleared = await call('/admin/api/cache/clear', { method: 'POST', body: {}, cookie });
    expect(await cleared.json()).toMatchObject({ ok: true, cleared: 2 });
    expect(((await (await call('/admin/api/chat', { cookie })).json()) as View).stats.cache).toMatchObject({ entries: 0 });
    // The switch is a setting of the page, on or off only.
    expect((await call('/admin/api/settings', { method: 'POST', body: { CHAT_ANSWER_CACHE: 'off' }, cookie })).status).toBe(200);
    expect((await call('/admin/api/settings', { method: 'POST', body: { CHAT_ANSWER_CACHE: 'maybe' }, cookie })).status).toBe(400);
    // Without a recorded eval, or with a broken one, there is none.
    env.CHAT_EVAL = 'not json';
    expect(((await (await call('/admin/api/chat', { cookie })).json()) as View).evaluation).toBeNull();
  });

  it('shows the assistant as not live without its vars', async () => {
    const chat = (await (await call('/admin/api/chat', { cookie })).json()) as { available: boolean };
    expect(chat.available).toBe(false);
  });
});
