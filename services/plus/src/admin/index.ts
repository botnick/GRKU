/**
 * The owner's admin page of GRKU Plus, served by the Worker itself at /admin: one password
 * (ADMIN_PASSWORD, a secret), a signed session cookie, and a few read-mostly views of the
 * database (customers and keys, orders and sales, the key emails, the assistant's counters and
 * switch). Not linked from the site; no CORS; no caching; not indexed.
 *
 * The password is short, so the sign-in counts every attempt: at most LOGIN_IP_MAX per IP in
 * LOGIN_IP_WINDOW, and at most LOGIN_GLOBAL_MAX for everyone in LOGIN_GLOBAL_WINDOW, after which the
 * sign-in is closed to everyone for LOGIN_GLOBAL_LOCK (a session that is already open keeps
 * working). Every attempt also waits about a second.
 */
import { page } from './page';
import { CACHE_TTL, CLEARED } from '../chat/cache';

export interface AdminEnv {
  DB: D1Database;
  KEY_SECRET: string;
  /** The admin password; unset closes the admin page. */
  ADMIN_PASSWORD?: string;
  [name: string]: unknown;
}

export interface AdminDeps {
  env: AdminEnv;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
  /** Emails the owner's key (minting one when it has none) and records the attempt in mail_log. */
  sendKey: (email: string) => Promise<void>;
}

export const COOKIE = '__Host-grku_admin';
export const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;
export const LOGIN_IP_MAX = 5;
export const LOGIN_IP_WINDOW = 15 * 60 * 1000;
export const LOGIN_GLOBAL_MAX = 20;
export const LOGIN_GLOBAL_WINDOW = 60 * 60 * 1000;
export const LOGIN_GLOBAL_LOCK = 60 * 60 * 1000;
const LOGIN_DELAY = 1000;
const ORDER_TTL = 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const BANGKOK = 7 * 60 * 60 * 1000;

/** The settings the admin page may change at run time, over the vars of the same name. */
export const SETTINGS = [
  'CHAT_ENABLED',
  'CHAT_FREE_PER_DAY',
  'CHAT_PLUS_PER_DAY',
  'CHAT_IP_PER_DAY',
  'CHAT_DAILY_MESSAGES',
  'CHAT_DAILY_TOKENS',
  'CHAT_ALLOW_PAID',
  'CHAT_PAID_TIERS',
  'CHAT_PAID_MONTHLY_USD',
  'CHAT_PAID_DAILY_USD',
  'CHAT_IMAGE_FREE_PER_DAY',
  'CHAT_IMAGE_PLUS_PER_DAY',
  'CHAT_IMAGE_DAILY',
  'CHAT_IMAGE_WEIGHT',
  'CHAT_ANSWER_CACHE',
] as const;

/** The form of each setting's value. */
const SETTING_FORMS: Record<string, RegExp> = {
  CHAT_ENABLED: /^(on|off)$/,
  CHAT_ALLOW_PAID: /^[01]$/,
  CHAT_PAID_TIERS: /^(free,plus|plus)$/,
  CHAT_PAID_MONTHLY_USD: /^\d{1,5}(\.\d{1,2})?$/,
  CHAT_PAID_DAILY_USD: /^\d{1,5}(\.\d{1,2})?$/,
  CHAT_IMAGE_WEIGHT: /^[1-9]$/,
  CHAT_ANSWER_CACHE: /^(on|off)$/,
};

class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

const SECURITY_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function reply(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...headers } });
}

/** Everything under /admin. */
export async function adminRoute(request: Request, deps: AdminDeps): Promise<Response> {
  try {
    return await route(request, deps);
  } catch (error) {
    if (error instanceof AdminError) return reply({ error: error.message, ...error.extra }, error.status);
    console.error(error);
    return reply({ error: 'unexpected' }, 500);
  }
}

async function route(request: Request, deps: AdminDeps): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method;
  if ((method === 'GET' || method === 'HEAD') && path === '/admin') {
    const nonce = b64url(crypto.getRandomValues(new Uint8Array(18)));
    return new Response(page(nonce), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...SECURITY_HEADERS,
        'Content-Security-Policy': [
          "default-src 'none'",
          `script-src 'nonce-${nonce}'`,
          `style-src 'nonce-${nonce}' https://fonts.googleapis.com`,
          'font-src https://fonts.gstatic.com',
          "connect-src 'self'",
          "img-src 'self' data:",
          "base-uri 'none'",
          "form-action 'self'",
          "frame-ancestors 'none'",
        ].join('; '),
      },
    });
  }
  if (method !== 'GET' && method !== 'POST') throw new AdminError(405, 'method not allowed');
  // Every POST must come from this page: the Origin (or Sec-Fetch-Site) says same origin.
  if (method === 'POST' && !sameOrigin(request, url)) throw new AdminError(403, 'cross-origin');
  if (method === 'POST' && path === '/admin/login') return login(request, deps);
  if (method === 'POST' && path === '/admin/logout') return reply({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
  if (!path.startsWith('/admin/api/')) throw new AdminError(404, 'not found');
  if (!(await validSession(request, deps))) throw new AdminError(401, 'sign in');
  const api = path.slice('/admin/api/'.length);
  if (method === 'GET' && api === 'me') return reply({ ok: true });
  if (method === 'GET' && api === 'search') return reply(await search(url.searchParams.get('q') ?? '', deps));
  if (method === 'GET' && api === 'orders') return reply(await orders(url.searchParams.get('status') ?? 'all', deps));
  if (method === 'GET' && api === 'sales') return reply(await sales(deps));
  if (method === 'GET' && api === 'mail') return reply(await mailLog(deps));
  if (method === 'POST' && api === 'resend') return resend(request, deps);
  if (method === 'GET' && api === 'chat') return reply(await chatView(deps));
  if (method === 'POST' && api === 'settings') return saveSettings(request, deps);
  if (method === 'POST' && api === 'cache/clear') return clearCache(deps);
  throw new AdminError(404, 'not found');
}

export function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('Origin');
  if (origin) return origin === url.origin;
  return request.headers.get('Sec-Fetch-Site') === 'same-origin';
}

// ---- Sign-in ----------------------------------------------------------------------------------

async function login(request: Request, deps: AdminDeps): Promise<Response> {
  const { env } = deps;
  if (!env.ADMIN_PASSWORD) throw new AdminError(503, 'admin is not set up');
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
  const now = deps.now();
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const ipKey = `ip:${(await sha256(`admin-login\n${ip}`)).slice(0, 24)}`;
  // The lock for everyone is checked first: no attempt counts while it holds.
  const global = await env.DB.prepare('SELECT n, reset FROM admin_login WHERE k = ?').bind('global').first<{ n: number; reset: number }>();
  if (global && global.n >= LOGIN_GLOBAL_MAX && global.reset > now) {
    await deps.sleep(LOGIN_DELAY);
    throw new AdminError(429, 'locked', { retryAfter: Math.ceil((global.reset - now) / 1000) });
  }
  // Count the attempt before the check, so attempts in parallel cannot pass the limit.
  const ipCount = await bump(env.DB, ipKey, now, LOGIN_IP_WINDOW);
  if (ipCount.n > LOGIN_IP_MAX) {
    await deps.sleep(LOGIN_DELAY);
    throw new AdminError(429, 'too many', { retryAfter: Math.ceil((ipCount.reset - now) / 1000) });
  }
  const globalCount = await bump(env.DB, 'global', now, LOGIN_GLOBAL_WINDOW);
  if (globalCount.n >= LOGIN_GLOBAL_MAX) {
    await env.DB.prepare('UPDATE admin_login SET reset = ? WHERE k = ?').bind(now + LOGIN_GLOBAL_LOCK, 'global').run();
  }
  await deps.sleep(LOGIN_DELAY);
  if (!(await sameSecret(password, env.ADMIN_PASSWORD, env.KEY_SECRET))) {
    const left = Math.max(0, LOGIN_IP_MAX - ipCount.n);
    throw new AdminError(401, 'wrong password', { left });
  }
  // A good password: the attempt does not count.
  await env.DB.batch([
    env.DB.prepare('DELETE FROM admin_login WHERE k = ?').bind(ipKey),
    env.DB.prepare('UPDATE admin_login SET n = MAX(0, n - 1) WHERE k = ? AND n < ?').bind('global', LOGIN_GLOBAL_MAX),
  ]);
  const cookie = await makeSession(env, now);
  return reply({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=${cookie}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL / 1000}` });
}

/** Adds one to the counter `k`, starting a new window of `window` ms when the last one ended. */
async function bump(db: D1Database, k: string, now: number, window: number): Promise<{ n: number; reset: number }> {
  const row = await db
    .prepare(
      'INSERT INTO admin_login (k, n, reset) VALUES (?1, 1, ?2) ON CONFLICT(k) DO UPDATE SET n = CASE WHEN reset <= ?3 THEN 1 ELSE n + 1 END, reset = CASE WHEN reset <= ?3 THEN ?2 ELSE reset END RETURNING n, reset',
    )
    .bind(k, now + window, now)
    .first<{ n: number; reset: number }>();
  return row ?? { n: 1, reset: now + window };
}

/** Whether `given` is `expected`, in constant time: both through one HMAC, then every byte compared. */
async function sameSecret(given: string, expected: string, salt: string): Promise<boolean> {
  const key = await hmacKey(`admin-compare\n${salt}`);
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([crypto.subtle.sign('HMAC', key, enc.encode(given)), crypto.subtle.sign('HMAC', key, enc.encode(expected))]);
  return equalBytes(new Uint8Array(a), new Uint8Array(b));
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/** The session key: KEY_SECRET and the password, so a new password ends every session. */
const sessionKey = (env: AdminEnv) => hmacKey(`admin-session\n${env.KEY_SECRET}\n${env.ADMIN_PASSWORD}`);

/** A session: v1.<expiry ms>.<nonce>.<HMAC>. */
export async function makeSession(env: AdminEnv, now: number): Promise<string> {
  const body = `v1.${now + SESSION_TTL}.${b64url(crypto.getRandomValues(new Uint8Array(12)))}`;
  const mac = await crypto.subtle.sign('HMAC', await sessionKey(env), new TextEncoder().encode(body));
  return `${body}.${b64url(new Uint8Array(mac))}`;
}

async function validSession(request: Request, deps: AdminDeps): Promise<boolean> {
  const { env } = deps;
  if (!env.ADMIN_PASSWORD || !env.KEY_SECRET) return false;
  const cookie = (request.headers.get('Cookie') ?? '')
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  const parts = cookie?.split('.') ?? [];
  if (parts.length !== 4 || parts[0] !== 'v1') return false;
  const expiry = Number(parts[1]);
  if (!Number.isFinite(expiry) || expiry <= deps.now()) return false;
  const mac = await crypto.subtle.sign('HMAC', await sessionKey(env), new TextEncoder().encode(parts.slice(0, 3).join('.')));
  let given: Uint8Array;
  try {
    given = unb64url(parts[3]!);
  } catch {
    return false;
  }
  return equalBytes(new Uint8Array(mac), given);
}

// ---- Customers --------------------------------------------------------------------------------

interface OrderRow {
  id: string;
  owner: string;
  tier: string;
  amount: number;
  cents: number;
  status: string;
  created: number;
  paid_at: number | null;
  slip_ref: string | null;
  payer?: string | null;
  code?: string | null;
}

/** What the owner paid for an order: the baht and satang of a slip, the baht of a gift link. */
const paidAmount = (o: OrderRow) => (o.slip_ref?.startsWith('tmn:') ? o.amount : Math.round(o.amount * 100 + (o.cents ?? 0)) / 100);

/** An order as the page shows it: an open order past its hour is expired. */
function orderView(o: OrderRow, now: number) {
  const status = o.status === 'open' && now - o.created > ORDER_TTL ? 'expired' : o.status;
  return { id: o.id, owner: o.owner, tier: o.tier, amount: paidAmount(o), status, created: o.created, paid_at: o.paid_at, payer: o.payer ?? null, key: o.code ?? null };
}

const likeOf = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/**
 * The customers that match `q`: a part of the email, of the key (with or without the dashes, the
 * look-alike letters read as the key's own), of the payer's name on a slip, or an order id.
 */
export async function search(q: string, deps: AdminDeps) {
  const { DB } = deps.env;
  const text = q.trim().toLowerCase().slice(0, 100);
  if (text.length < 2) return { customers: [] };
  const plainKey = text.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  const like = likeOf(text);
  const found = await DB.prepare(
    `SELECT owner, MAX(t) AS t FROM (
       SELECT owner, updated AS t FROM entitlements WHERE owner LIKE ?1 ESCAPE '\\'
       UNION ALL SELECT owner, created AS t FROM orders WHERE owner LIKE ?1 ESCAPE '\\' OR id = ?2
       UNION ALL SELECT owner, created AS t FROM keys WHERE owner LIKE ?1 ESCAPE '\\' OR (length(?3) >= 3 AND REPLACE(code, '-', '') LIKE ?4)
       UNION ALL SELECT o.owner, o.created AS t FROM slips s JOIN orders o ON o.id = s.order_id WHERE s.payer LIKE ?1 ESCAPE '\\'
     ) GROUP BY owner ORDER BY t DESC LIMIT 20`,
  )
    .bind(like, text, plainKey, `%${plainKey}%`)
    .all<{ owner: string }>();
  const customers = [];
  for (const { owner } of found.results ?? []) customers.push(await customer(owner, deps));
  return { customers };
}

async function customer(owner: string, deps: AdminDeps) {
  const { DB } = deps.env;
  const now = deps.now();
  const [key, owned, list, mail] = await Promise.all([
    DB.prepare('SELECT code, created FROM keys WHERE owner = ?').bind(owner).first<{ code: string; created: number }>(),
    DB.prepare('SELECT packs, slots, plus, paid, updated FROM entitlements WHERE owner = ?').bind(owner).first<{ packs: string; slots: number; plus: number; paid: number; updated: number }>(),
    DB.prepare('SELECT o.*, s.payer FROM orders o LEFT JOIN slips s ON s.ref = o.slip_ref WHERE o.owner = ? ORDER BY o.created DESC LIMIT 50').bind(owner).all<OrderRow>(),
    DB.prepare('SELECT ok, error, kind, created FROM mail_log WHERE recipient = ? ORDER BY created DESC LIMIT 1').bind(owner).first<{ ok: number; error: string | null; kind: string; created: number }>(),
  ]);
  return {
    owner,
    email: owner.startsWith('anon:') ? null : owner,
    key: key?.code ?? null,
    keyCreated: key?.created ?? null,
    entitlement: owned
      ? { plus: owned.plus === 1, packs: JSON.parse(owned.packs) as string[], slots: owned.slots, paid: owned.paid, updated: owned.updated }
      : { plus: false, packs: [], slots: 10, paid: 0, updated: null },
    orders: (list.results ?? []).map((o) => orderView(o, now)),
    lastMail: mail ? { ok: mail.ok === 1, error: mail.error, kind: mail.kind, created: mail.created } : null,
  };
}

async function resend(request: Request, deps: AdminDeps): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as { owner?: unknown };
  const owner = typeof body.owner === 'string' ? body.owner.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner)) throw new AdminError(400, 'not an email');
  // Only to a known customer: the admin page does not mail keys to any address.
  const known = await deps.env.DB.prepare('SELECT owner FROM entitlements WHERE owner = ?1 UNION SELECT owner FROM keys WHERE owner = ?1').bind(owner).first();
  if (!known) throw new AdminError(404, 'no such customer');
  try {
    await deps.sendKey(owner);
  } catch (error) {
    return reply({ ok: false, error: String(error instanceof Error ? error.message : error).slice(0, 300) }, 502);
  }
  return reply({ ok: true });
}

// ---- Orders and sales -------------------------------------------------------------------------

async function orders(status: string, deps: AdminDeps) {
  const { DB } = deps.env;
  const now = deps.now();
  const where =
    status === 'paid' ? "WHERE o.status = 'paid'" : status === 'open' ? "WHERE o.status = 'open' AND o.created > ?1" : status === 'expired' ? "WHERE o.status = 'open' AND o.created <= ?1" : '';
  const statement = DB.prepare(`SELECT o.*, s.payer, k.code FROM orders o LEFT JOIN slips s ON s.ref = o.slip_ref LEFT JOIN keys k ON k.owner = o.owner ${where} ORDER BY o.created DESC LIMIT 50`);
  const rows = await (where.includes('?1') ? statement.bind(now - ORDER_TTL) : statement).all<OrderRow>();
  return { orders: (rows.results ?? []).map((o) => orderView(o, now)) };
}

/** The start of the Bangkok day of `now`, in ms. */
export const bangkokDayStart = (now: number) => Math.floor((now + BANGKOK) / DAY) * DAY - BANGKOK;

export async function sales(deps: AdminDeps) {
  const { DB } = deps.env;
  const now = deps.now();
  const today = bangkokDayStart(now);
  const from = today - 29 * DAY;
  const [paid, all, open, buyers] = await Promise.all([
    DB.prepare("SELECT tier, amount, cents, slip_ref, paid_at FROM orders WHERE status = 'paid' AND paid_at >= ?").bind(from).all<OrderRow>(),
    DB.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN slip_ref LIKE 'tmn:%' THEN amount ELSE amount + cents / 100.0 END), 0) AS baht FROM orders WHERE status = 'paid'").first<{ n: number; baht: number }>(),
    DB.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'open' AND created > ?").bind(now - ORDER_TTL).first<{ n: number }>(),
    DB.prepare('SELECT COUNT(*) AS n FROM entitlements WHERE paid > 0').first<{ n: number }>(),
  ]);
  const period = () => ({ baht: 0, n: 0, tiers: {} as Record<string, { n: number; baht: number }> });
  const periods = { today: period(), d7: period(), d30: period() };
  const days = Array.from({ length: 30 }, (_, i) => ({ day: from + i * DAY, baht: 0, n: 0 }));
  for (const o of paid.results ?? []) {
    const at = o.paid_at ?? 0;
    const baht = paidAmount(o);
    const add = (p: ReturnType<typeof period>) => {
      p.baht += baht;
      p.n += 1;
      const t = (p.tiers[o.tier] ??= { n: 0, baht: 0 });
      t.n += 1;
      t.baht += baht;
    };
    add(periods.d30);
    if (at >= today - 6 * DAY) add(periods.d7);
    if (at >= today) add(periods.today);
    const bucket = days[Math.floor((at - from) / DAY)];
    if (bucket) {
      bucket.baht += baht;
      bucket.n += 1;
    }
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  for (const p of Object.values(periods)) {
    p.baht = round(p.baht);
    for (const t of Object.values(p.tiers)) t.baht = round(t.baht);
  }
  for (const d of days) d.baht = round(d.baht);
  return { ...periods, days, allTime: { n: all?.n ?? 0, baht: round(all?.baht ?? 0) }, openNow: open?.n ?? 0, buyers: buyers?.n ?? 0 };
}

async function mailLog(deps: AdminDeps) {
  const rows = await deps.env.DB.prepare('SELECT recipient, kind, ok, error, created FROM mail_log ORDER BY created DESC LIMIT 50').all<{
    recipient: string; kind: string; ok: number; error: string | null; created: number;
  }>();
  const failed = await deps.env.DB.prepare('SELECT COUNT(*) AS n FROM mail_log WHERE ok = 0 AND created > ?').bind(deps.now() - 30 * DAY).first<{ n: number }>();
  return { mails: (rows.results ?? []).map((r) => ({ ...r, ok: r.ok === 1 })), failed30: failed?.n ?? 0 };
}

/** Records one key email: to whom, why, and whether it went out. */
export async function logMail(db: D1Database, recipient: string, kind: string, error: unknown, now = Date.now()): Promise<void> {
  const message = error === null ? null : String(error instanceof Error ? error.message : error).slice(0, 300);
  await db
    .prepare('INSERT INTO mail_log (recipient, kind, ok, error, created) VALUES (?, ?, ?, ?, ?)')
    .bind(recipient, kind, message === null ? 1 : 0, message, now)
    .run()
    .catch((e) => console.error('mail_log', e));
}

// ---- Settings (the assistant) -----------------------------------------------------------------

let cache: { at: number; values: Record<string, string> } | null = null;
const CACHE_MS = 30 * 1000;

/** The settings rows, cached for CACHE_MS in this isolate. */
export async function settingsOf(db: D1Database, now = Date.now()): Promise<Record<string, string>> {
  if (cache && now - cache.at < CACHE_MS) return cache.values;
  const rows = await db
    .prepare('SELECT k, v FROM admin_settings')
    .all<{ k: string; v: string }>()
    .catch(() => ({ results: [] as { k: string; v: string }[] }));
  const values: Record<string, string> = {};
  for (const r of rows.results ?? []) if ((SETTINGS as readonly string[]).includes(r.k)) values[r.k] = r.v;
  cache = { at: now, values };
  return values;
}

/** `env` with the settings of the admin page over its vars. */
export async function withSettings<E extends object>(env: E & { DB: D1Database }, now = Date.now()): Promise<E> {
  const values = await settingsOf(env.DB, now);
  return Object.keys(values).length ? { ...env, ...values } : env;
}

async function chatView(deps: AdminDeps) {
  const values = await settingsOf(deps.env.DB, 0);
  const defaults: Record<string, string> = {};
  for (const k of SETTINGS) defaults[k] = typeof deps.env[k] === 'string' ? (deps.env[k] as string) : '';
  // The assistant counts by UTC day (src/chat dayOf), so the day starts at 07:00 Bangkok time.
  const day = new Date(deps.now()).toISOString().slice(0, 10);
  const available = typeof deps.env.CHAT_NAME === 'string' && deps.env.CHAT_NAME !== '';
  return { available, settings: values, defaults, evaluation: evaluationOf(deps.env.CHAT_EVAL), stats: available ? await chatStats({ ...deps.env, ...values } as AdminEnv, day, deps.now()) : null };
}

/**
 * The last graded eval of the assistant (services/plus/eval/graded.mjs), as wrangler.toml's
 * CHAT_EVAL records it with the change it measured: {"date", "prompt", "cases", "free", "plus"}
 * (the share of cases that passed, in percent). Null when it is missing or not that form.
 */
export function evaluationOf(value: unknown): { date: string; prompt: string; cases: number; free: number; plus: number } | null {
  if (typeof value !== 'string' || !value) return null;
  try {
    const v = JSON.parse(value) as Record<string, unknown>;
    if (typeof v.date !== 'string' || typeof v.free !== 'number') return null;
    return { date: v.date, prompt: String(v.prompt ?? ''), cases: Number(v.cases ?? 0), free: v.free, plus: Number(v.plus ?? 0) };
  } catch {
    return null;
  }
}

async function saveSettings(request: Request, deps: AdminDeps): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { DB } = deps.env;
  const now = deps.now();
  const statements = [];
  for (const k of SETTINGS) {
    if (!(k in body)) continue;
    const v = body[k];
    if (v === null || v === '') {
      statements.push(DB.prepare('DELETE FROM admin_settings WHERE k = ?').bind(k));
      continue;
    }
    const text = String(v).trim();
    if (!(SETTING_FORMS[k] ?? /^\d{1,9}$/).test(text)) throw new AdminError(400, `bad ${k}`);
    statements.push(DB.prepare('INSERT INTO admin_settings (k, v, updated) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated = excluded.updated').bind(k, text, now));
  }
  if (statements.length) await DB.batch(statements);
  cache = null;
  return reply({ ok: true, settings: await settingsOf(DB, now) });
}

/**
 * Empties the assistant's answer cache (chat_cache): the next first questions go to the model
 * again. The CLEARED row keeps the time, so an answer on its way that was looked up before it is
 * not kept (src/chat/cache.ts put).
 */
async function clearCache(deps: AdminDeps): Promise<Response> {
  const { DB } = deps.env;
  const [done] = await DB.batch([
    DB.prepare('DELETE FROM chat_cache WHERE k != ?').bind(CLEARED),
    DB.prepare('INSERT INTO chat_cache (k, answer, created, hits) VALUES (?, ?, ?, 0) ON CONFLICT(k) DO UPDATE SET created = MAX(created, excluded.created)').bind(CLEARED, '', deps.now()),
  ]);
  return reply({ ok: true, cleared: (done as D1Result | undefined)?.meta?.changes ?? 0 });
}

/** The daily caps of a provider's models: "model=n,model=n", or one number for every model. */
function capsOf(text: string): Map<string, number> {
  const caps = new Map<string, number>();
  for (const part of text.split(',').map((p) => p.trim()).filter(Boolean)) {
    const at = part.lastIndexOf('=');
    const n = Number.parseInt(at < 0 ? part : part.slice(at + 1), 10);
    caps.set(at < 0 ? '*' : part.slice(0, at).trim(), Number.isFinite(n) && n > 0 ? n : 0);
  }
  return caps;
}

/** The assistant's counters of `day` (chat_usage), summed for the page. No message content exists there. */
export async function chatStats(env: AdminEnv, day: string, now = Date.now()) {
  type Row = { k: string; n: number; tokens: number };
  const empty = { results: [] as Row[] };
  const month = day.slice(0, 7);
  const [rows, monthRows, status, cacheRow] = await Promise.all([
    env.DB.prepare('SELECT k, n, tokens FROM chat_usage WHERE day = ?').bind(day).all<Row>().catch(() => empty),
    env.DB.prepare("SELECT k, n, tokens FROM chat_usage WHERE day = ? AND (k = 'usd' OR k LIKE '$:%')").bind(month).all<Row>().catch(() => empty),
    env.DB.prepare('SELECT name, model, ok_at, err_at, err_code FROM chat_provider')
      .all<{ name: string; model: string; ok_at: number | null; err_at: number | null; err_code: string | null }>()
      .catch(() => ({ results: [] as { name: string; model: string; ok_at: number | null; err_at: number | null; err_code: string | null }[] })),
    // The answers still alive (7 days), and how often all of them were served.
    env.DB.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(hits), 0) AS hits FROM chat_cache WHERE k != ? AND created > ?').bind(CLEARED, now - CACHE_TTL).first<{ n: number; hits: number }>().catch(() => null),
    env.DB.prepare('DELETE FROM chat_cache WHERE k != ? AND created <= ?').bind(CLEARED, now - CACHE_TTL).run().catch(() => null),
  ]);
  // The answer cache: answers kept, and today's first questions that it could answer, found or not.
  const cache = { entries: cacheRow?.n ?? 0, hitsAll: cacheRow?.hits ?? 0, hits: 0, misses: 0 };
  let global = { n: 0, tokens: 0 };
  let sessions = 0;
  let visitors = 0;
  let violations = 0;
  let usdToday = 0;
  let retries = 0;
  // Photos: how many came today, in how many messages, from how many visitors. Never the photos.
  const images = { n: 0, messages: 0, visitors: 0 };
  type Model = { provider: string; model: string; paid: boolean; n: number; tokens: number; cap: number; usd: number; usdMonth: number; nMonth: number };
  const models = new Map<string, Model>();
  const refusals: [string, number][] = [];
  const topics: [string, number][] = [];
  const cuts: [string, number][] = [];
  const errors = new Map<string, Record<string, number>>();
  // The providers from the vars: CHAT_, CHAT2_ … CHAT4_ with _NAME, _RPD, _PAID, and the models.
  const providers: { name: string; paid: boolean; caps: Map<string, number> }[] = [];
  const model = (provider: string, name: string): Model => {
    const key = `${provider}\n${name}`;
    let m = models.get(key);
    if (!m) {
      const p = providers.find((x) => x.name === provider);
      m = { provider, model: name, paid: p?.paid ?? false, n: 0, tokens: 0, cap: p?.caps.get(name) ?? p?.caps.get('*') ?? 0, usd: 0, usdMonth: 0, nMonth: 0 };
      models.set(key, m);
    }
    return m;
  };
  for (const prefix of ['CHAT', 'CHAT2', 'CHAT3', 'CHAT4']) {
    const name = env[`${prefix}_NAME`];
    if (typeof name !== 'string' || !name) continue;
    const listed = [env[`${prefix}_MODEL_FREE`], env[`${prefix}_MODEL_PLUS`], env[`${prefix}_MODEL_QUICK`]].map((v) => String(v ?? '')).join(',');
    const paid = env[`${prefix}_PAID`] === '1';
    const extra = paid ? String(env.CHAT_PRO_MODELS ?? '') : '';
    const caps = capsOf(String(env[`${prefix}_RPD`] ?? ''));
    providers.push({ name, paid, caps });
    for (const m of `${listed},${extra}`.split(',').map((x) => x.trim()).filter(Boolean)) model(name, m);
  }
  const paidProvider = providers.find((p) => p.paid)?.name ?? 'paid';
  for (const r of rows.results ?? []) {
    if (r.k === 'global') global = { n: r.n, tokens: r.tokens };
    else if (r.k === 'usd') usdToday = r.tokens;
    else if (r.k === 'retry:paid') retries = r.n;
    else if (r.k === 'cache:hit') cache.hits = r.n;
    else if (r.k === 'cache:miss') cache.misses = r.n;
    else if (r.k === 'ig') images.n = r.n;
    else if (r.k === 'img:msg') images.messages = r.n;
    else if (r.k.startsWith('ii:') || r.k.startsWith('io:')) images.visitors += r.n > 0 ? 1 : 0;
    else if (r.k.startsWith('s:')) sessions += 1;
    else if (r.k.startsWith('ip:') || r.k.startsWith('o:')) visitors += 1;
    else if (r.k.startsWith('v:')) violations += r.n;
    else if (r.k.startsWith('r:')) refusals.push([r.k.slice(2), r.n]);
    else if (r.k.startsWith('t:')) topics.push([r.k.slice(2), r.n]);
    else if (r.k.startsWith('x:')) cuts.push([r.k.slice(2), r.n]);
    else if (r.k.startsWith('$:')) {
      const m = model(paidProvider, r.k.slice(2));
      m.n = Math.max(m.n, r.n);
      m.usd = r.tokens / 1e6;
    } else if (r.k.startsWith('e:')) {
      const rest = r.k.slice(2);
      const at = rest.lastIndexOf(':');
      const table = errors.get(rest.slice(0, at)) ?? {};
      table[rest.slice(at + 1)] = r.n;
      errors.set(rest.slice(0, at), table);
    } else if (r.k.startsWith('p:')) {
      const rest = r.k.slice(2);
      const at = rest.indexOf(':');
      const m = model(rest.slice(0, at), rest.slice(at + 1));
      m.n = Math.max(m.n, r.n);
      m.tokens = r.tokens;
    }
  }
  let usdMonth = 0;
  for (const r of monthRows.results ?? []) {
    if (r.k === 'usd') usdMonth = r.tokens;
    else {
      const m = model(paidProvider, r.k.slice(2));
      m.usdMonth = r.tokens / 1e6;
      m.nMonth = r.n;
    }
  }
  // Each provider's state today: its last answer and failure, and the failures of the day by code.
  const dayStart = Date.parse(`${day}T00:00:00Z`);
  const providerView = providers.map((p) => {
    const rowsOf = (status.results ?? []).filter((r) => r.name === p.name);
    const okAt = Math.max(0, ...rowsOf.map((r) => r.ok_at ?? 0)) || null;
    const last = rowsOf.filter((r) => r.err_at).sort((a, b) => (b.err_at ?? 0) - (a.err_at ?? 0))[0];
    const errAt = last?.err_at ?? null;
    const failures = errors.get(p.name) ?? {};
    let state: 'ok' | 'limited' | 'failing' | 'idle' = 'idle';
    if (errAt && errAt >= dayStart && (!okAt || errAt > okAt)) state = last?.err_code === '429' ? 'limited' : 'failing';
    else if (okAt && okAt >= dayStart) state = 'ok';
    return { name: p.name, paid: p.paid, state, okAt, errAt, errCode: last?.err_code ?? null, failures };
  });
  const byCount = (a: [string, number], b: [string, number]) => b[1] - a[1];
  return {
    day,
    now,
    global,
    sessions,
    visitors,
    violations,
    retries,
    images,
    paid: { usdToday: usdToday / 1e6, usdMonth: usdMonth / 1e6, perMessage: global.n > 0 ? usdToday / 1e6 / global.n : 0 },
    cache,
    providers: providerView,
    models: [...models.values()].sort((a, b) => Number(a.paid) - Number(b.paid) || providers.findIndex((p) => p.name === a.provider) - providers.findIndex((p) => p.name === b.provider) || b.n - a.n),
    refusals: refusals.sort(byCount),
    topics: topics.sort(byCount),
    cuts: cuts.sort(byCount),
  };
}

// ---- Bytes ------------------------------------------------------------------------------------

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function b64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(text: string): Uint8Array {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}
