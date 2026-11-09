/**
 * GRKU Plus: the small service behind the paid tiers of grku.app. A buyer picks a tier on the
 * site, the site opens an order here and shows a PromptPay QR for its amount, the buyer pays with
 * any Thai bank app and uploads the slip, this service verifies the slip with a slip-verification
 * provider (SlipOK or EasySlip), marks the order paid, records what the buyer owns, and answers
 * with a signed key that the site keeps. A key is a bearer for one owner (an email, or an
 * anonymous id); what the owner has is read here each time, so later purchases add up without a
 * new key. An email can ask for a magic link that carries its key to another device.
 *
 * No card data, no gateway: the money goes from the buyer's bank to the PromptPay account.
 */
export interface Env {
  DB: D1Database;
  SITE_URL: string;
  EXTRA_ORIGINS: string;
  PROMPTPAY_ID: string;
  RECEIVER_NAME: string;
  SLIP_PROVIDER: 'slipok' | 'easyslip' | 'mock';
  SLIPOK_BRANCH: string;
  SLIPOK_KEY?: string;
  EASYSLIP_KEY?: string;
  KEY_SECRET: string;
  RESEND_KEY?: string;
  MAIL_FROM: string;
}

/** The tiers and their prices in baht. The site shows the same table (web/src/plus.ts). */
export const PRICES: Record<string, number> = {
  plus: 199,
  slots25: 79,
  'pack:kodak': 49,
  'pack:fuji': 49,
  'pack:slide': 49,
  'pack:mono': 49,
  'pack:cinema': 49,
  'pack:indie': 49,
  'pack:instant': 49,
};
/** The least an order can cost after the credit of earlier purchases. */
const MIN_AMOUNT = 20;
/** The free tier: this many looks of the library on the card. */
const FREE_SLOTS = 10;
/** An open order expires after this long. */
const ORDER_TTL = 60 * 60 * 1000;

interface Entitlement {
  packs: string[];
  slots: number;
  plus: boolean;
  paid: number;
}

const FREE: Entitlement = { packs: [], slots: FREE_SLOTS, plus: false, paid: 0 };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '';
    const cors = corsHeaders(origin, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    try {
      const response = await route(request, url, env);
      for (const [k, v] of Object.entries(cors)) response.headers.set(k, v);
      return response;
    } catch (error) {
      const message = error instanceof HttpError ? error.message : 'unexpected';
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) console.error(error);
      return json({ error: message }, status, cors);
    }
  },
};

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function corsHeaders(origin: string, env: Env): Record<string, string> {
  const allowed = [env.SITE_URL, ...(env.EXTRA_ORIGINS ?? '').split(',')].map((o) => o.trim()).filter(Boolean);
  const allow = allowed.includes(origin) ? origin : allowed[0] ?? '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

async function route(request: Request, url: URL, env: Env): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (request.method === 'GET' && path === '/') return json({ service: 'grku-plus', prices: PRICES, free_slots: FREE_SLOTS });
  if (request.method === 'GET' && path === '/prices') return json({ prices: PRICES, free_slots: FREE_SLOTS, min_amount: MIN_AMOUNT });
  if (request.method === 'POST' && path === '/order') return order(request, env);
  if (request.method === 'POST' && path === '/slip') return slip(request, env);
  if (request.method === 'POST' && path === '/magic') return magic(request, env);
  if (request.method === 'GET' && path === '/me') return me(url, env);
  throw new HttpError(404, 'not found');
}

// ---- Orders -------------------------------------------------------------------------------------

async function order(request: Request, env: Env): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as { tier?: string; email?: string; key?: string };
  const tier = body.tier ?? '';
  const price = PRICES[tier];
  if (!price) throw new HttpError(400, 'unknown tier');
  // The owner: the key's owner, else the email, else a new anonymous id.
  let owner = body.key ? await ownerOfKey(body.key, env) : null;
  const email = normalizeEmail(body.email);
  if (!owner) owner = email ?? `anon:${randomId()}`;
  if (!env.PROMPTPAY_ID) throw new HttpError(503, 'payments are not set up');
  const owned = await entitlementOf(owner, env);
  if (owned.plus) throw new HttpError(409, 'already plus');
  if (tier.startsWith('pack:') && owned.packs.includes(tier.slice(5))) throw new HttpError(409, 'already owned');
  if (tier === 'slots25' && owned.slots >= 25) throw new HttpError(409, 'already owned');
  // The credit: what was paid before counts toward the library and the slots, not toward a pack.
  const credit = tier === 'plus' || tier === 'slots25' ? owned.paid : 0;
  const amount = Math.max(MIN_AMOUNT, price - credit);
  const id = randomId();
  const now = Date.now();
  await env.DB.prepare('INSERT INTO orders (id, owner, tier, amount, status, created) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, owner, tier, amount, 'open', now)
    .run();
  return json({ order: id, tier, amount, promptpay: promptPayPayload(env.PROMPTPAY_ID, amount), expires: now + ORDER_TTL });
}

// ---- Slips --------------------------------------------------------------------------------------

interface Slip {
  ref: string;
  amount: number;
  /** The time of the transfer in milliseconds, or 0 when the provider gives none. */
  time: number;
  receiver: string;
  payer: string;
}

async function slip(request: Request, env: Env): Promise<Response> {
  const form = await request.formData().catch(() => null);
  if (!form) throw new HttpError(400, 'send a form');
  const orderId = String(form.get('order') ?? '');
  const file = form.get('file');
  const payload = String(form.get('payload') ?? '');
  const row = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first<{
    id: string; owner: string; tier: string; amount: number; status: string; created: number;
  }>();
  if (!row) throw new HttpError(404, 'no such order');
  if (row.status === 'paid') return json(await paidResponse(row.owner, env));
  if (Date.now() - row.created > ORDER_TTL) throw new HttpError(410, 'order expired');
  const verified = await verifySlip(file instanceof File ? file : null, payload, row.amount, env);
  if (!verified) throw new HttpError(422, 'slip not readable');
  if (Math.round(verified.amount) !== row.amount) throw new HttpError(422, `amount ${verified.amount} is not ${row.amount}`);
  if (verified.time && verified.time < row.created - 10 * 60 * 1000) throw new HttpError(422, 'slip is older than the order');
  if (env.RECEIVER_NAME && !verified.receiver.toLowerCase().includes(env.RECEIVER_NAME.toLowerCase()))
    throw new HttpError(422, 'the money did not come to GRKU');
  const used = await env.DB.prepare('SELECT ref FROM slips WHERE ref = ?').bind(verified.ref).first();
  if (used) throw new HttpError(409, 'slip already used');
  const now = Date.now();
  const owned = await entitlementOf(row.owner, env);
  const next = grant(owned, row.tier, row.amount);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO slips (ref, order_id, amount, payer, created) VALUES (?, ?, ?, ?, ?)').bind(verified.ref, row.id, row.amount, verified.payer, now),
    env.DB.prepare("UPDATE orders SET status = 'paid', paid_at = ?, slip_ref = ? WHERE id = ?").bind(now, verified.ref, row.id),
    env.DB.prepare(
      'INSERT INTO entitlements (owner, packs, slots, plus, paid, updated) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(owner) DO UPDATE SET packs = excluded.packs, slots = excluded.slots, plus = excluded.plus, paid = excluded.paid, updated = excluded.updated',
    ).bind(row.owner, JSON.stringify(next.packs), next.slots, next.plus ? 1 : 0, next.paid, now),
  ]);
  const result = await paidResponse(row.owner, env);
  if (!row.owner.startsWith('anon:')) await sendKeyMail(row.owner, result.key, env).catch((e) => console.error(e));
  return json(result);
}

/** What `tier` adds to `owned`, with `amount` baht paid. */
export function grant(owned: Entitlement, tier: string, amount: number): Entitlement {
  const next: Entitlement = { ...owned, packs: [...owned.packs], paid: owned.paid + amount };
  if (tier === 'plus') next.plus = true;
  else if (tier === 'slots25') next.slots = Math.max(next.slots, 25);
  else if (tier.startsWith('pack:') && !next.packs.includes(tier.slice(5))) next.packs.push(tier.slice(5));
  return next;
}

async function paidResponse(owner: string, env: Env) {
  const owned = await entitlementOf(owner, env);
  return { key: await mintKey(owner, env), owner: maskOwner(owner), entitlement: owned };
}

async function verifySlip(file: File | null, payload: string, amount: number, env: Env): Promise<Slip | null> {
  if (env.SLIP_PROVIDER === 'mock') {
    // Development: any slip pays its order once. The reference is the hash of the image or payload.
    const bytes = file ? new Uint8Array(await file.arrayBuffer()) : new TextEncoder().encode(payload || String(Date.now()));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return { ref: 'mock:' + hex(new Uint8Array(digest)).slice(0, 24), amount, time: Date.now(), receiver: env.RECEIVER_NAME, payer: 'mock' };
  }
  if (env.SLIP_PROVIDER === 'slipok') {
    if (!env.SLIPOK_KEY || !env.SLIPOK_BRANCH) throw new HttpError(503, 'SlipOK is not set up');
    const url = `https://api.slipok.com/api/line/apikey/${env.SLIPOK_BRANCH}`;
    const headers: Record<string, string> = { 'x-authorization': env.SLIPOK_KEY };
    let response: Response;
    if (file) {
      const body = new FormData();
      body.append('files', file, file.name || 'slip.jpg');
      body.append('log', 'true');
      response = await fetch(url, { method: 'POST', headers, body });
    } else {
      response = await fetch(url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ data: payload, log: true }) });
    }
    const result = (await response.json().catch(() => null)) as { success?: boolean; data?: Record<string, unknown>; message?: string } | null;
    if (!result?.success || !result.data) {
      console.warn('slipok', response.status, result?.message);
      return null;
    }
    const d = result.data;
    const receiver = d.receiver as { displayName?: string; name?: string } | undefined;
    const sender = d.sender as { displayName?: string; name?: string } | undefined;
    return {
      ref: String(d.transRef ?? ''),
      amount: Number(d.amount ?? 0),
      time: slipokTime(String(d.transDate ?? ''), String(d.transTime ?? '')),
      receiver: `${receiver?.displayName ?? ''} ${receiver?.name ?? ''}`.trim(),
      payer: `${sender?.displayName ?? ''} ${sender?.name ?? ''}`.trim(),
    };
  }
  if (env.SLIP_PROVIDER === 'easyslip') {
    // EasySlip API v2: https://document.easyslip.com/en/v2/ — one request for a QR payload or an
    // image, Bearer key, { success, data, message }. matchAmount makes EasySlip compare the amount
    // itself; checkDuplicate marks a slip that was verified before (our own payments table is the
    // final check, so a duplicate here is only logged).
    if (!env.EASYSLIP_KEY) throw new HttpError(503, 'EasySlip is not set up');
    const url = 'https://api.easyslip.com/v2/verify/bank';
    const headers: Record<string, string> = { Authorization: `Bearer ${env.EASYSLIP_KEY}` };
    let response: Response;
    if (file) {
      const body = new FormData();
      body.append('image', file, file.name || 'slip.jpg');
      body.append('matchAmount', String(amount));
      body.append('checkDuplicate', 'true');
      response = await fetch(url, { method: 'POST', headers, body });
    } else {
      response = await fetch(url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ payload, matchAmount: amount, checkDuplicate: true }) });
    }
    const result = (await response.json().catch(() => null)) as { success?: boolean; data?: Record<string, unknown>; message?: string; code?: string } | null;
    if (!result?.success || !result.data) {
      console.warn('easyslip', response.status, result?.code, result?.message);
      return null;
    }
    const d = result.data;
    const raw = (d.rawSlip ?? d) as Record<string, unknown>;
    const slipAmount = raw.amount as { amount?: number } | undefined;
    const receiver = raw.receiver as { account?: { name?: { th?: string; en?: string } } } | undefined;
    const sender = raw.sender as { account?: { name?: { th?: string; en?: string } } } | undefined;
    if (d.isDuplicate) console.warn('easyslip duplicate', raw.transRef);
    return {
      ref: String(raw.transRef ?? ''),
      amount: Number(d.amountInSlip ?? slipAmount?.amount ?? 0),
      time: raw.date ? Date.parse(String(raw.date)) : 0,
      receiver: `${receiver?.account?.name?.th ?? ''} ${receiver?.account?.name?.en ?? ''}`.trim(),
      payer: `${sender?.account?.name?.th ?? ''} ${sender?.account?.name?.en ?? ''}`.trim(),
    };
  }
  throw new HttpError(503, 'no slip provider');
}

/** SlipOK gives the date as YYYYMMDD and the time as HH:mm:ss, Bangkok time. */
function slipokTime(date: string, time: string): number {
  if (!/^\d{8}$/.test(date)) return 0;
  const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${/^\d{2}:\d{2}(:\d{2})?$/.test(time) ? time : '00:00:00'}+07:00`;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// ---- Keys and owners ---------------------------------------------------------------------------

async function entitlementOf(owner: string, env: Env): Promise<Entitlement> {
  const row = await env.DB.prepare('SELECT packs, slots, plus, paid FROM entitlements WHERE owner = ?').bind(owner).first<{
    packs: string; slots: number; plus: number; paid: number;
  }>();
  if (!row) return { ...FREE };
  return { packs: JSON.parse(row.packs) as string[], slots: row.slots, plus: row.plus === 1, paid: row.paid };
}

async function me(url: URL, env: Env): Promise<Response> {
  const key = url.searchParams.get('key') ?? '';
  const owner = await ownerOfKey(key, env);
  if (!owner) throw new HttpError(401, 'bad key');
  return json({ owner: maskOwner(owner), entitlement: await entitlementOf(owner, env) });
}

async function magic(request: Request, env: Env): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = normalizeEmail(body.email);
  if (!email) throw new HttpError(400, 'send an email');
  const row = await env.DB.prepare('SELECT owner FROM entitlements WHERE owner = ?').bind(email).first();
  // The same answer whether or not the email bought anything, so the list of buyers stays private.
  if (row) await sendKeyMail(email, await mintKey(email, env), env).catch((e) => console.error(e));
  return json({ sent: true });
}

/** A key: base64url(JSON {o: owner, i: issued}) . base64url(HMAC-SHA256). */
export async function mintKey(owner: string, env: Env): Promise<string> {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ o: owner, i: Date.now() })));
  return `${payload}.${await sign(payload, env.KEY_SECRET)}`;
}

export async function ownerOfKey(key: string, env: Env): Promise<string | null> {
  const [payload, mac] = key.trim().split('.');
  if (!payload || !mac) return null;
  if ((await sign(payload, env.KEY_SECRET)) !== mac) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(unb64url(payload))) as { o?: string };
    return typeof data.o === 'string' && data.o ? data.o : null;
  } catch {
    return null;
  }
}

async function sign(text: string, secret: string): Promise<string> {
  if (!secret) throw new HttpError(503, 'KEY_SECRET is not set');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text))));
}

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
}

function maskOwner(owner: string): string {
  if (owner.startsWith('anon:')) return 'anon';
  const [user = '', domain = ''] = owner.split('@');
  return `${user.slice(0, 2)}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`;
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return b64url(bytes).replace(/[-_]/g, 'x').toLowerCase();
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

function hex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---- PromptPay ----------------------------------------------------------------------------------

/**
 * The EMVCo payload of a PromptPay QR for `id` with `amount` baht: the one that every Thai bank
 * app scans. `id` is a phone (10 digits), a national ID (13 digits), or an e-wallet ID (15 digits).
 */
export function promptPayPayload(id: string, amount: number): string {
  const digits = id.replace(/\D/g, '');
  let target: string;
  if (digits.length === 10 && digits.startsWith('0')) target = tlv('01', '0066' + digits.slice(1));
  else if (digits.length === 13) target = tlv('02', digits);
  else if (digits.length === 15) target = tlv('03', digits);
  else throw new HttpError(503, 'PROMPTPAY_ID is not a phone, an ID, or an e-wallet');
  const body =
    tlv('00', '01') +
    tlv('01', amount > 0 ? '12' : '11') +
    tlv('29', tlv('00', 'A000000677010111') + target) +
    tlv('53', '764') +
    (amount > 0 ? tlv('54', amount.toFixed(2)) : '') +
    tlv('58', 'TH') +
    '6304';
  return body + crc16(body);
}

function tlv(id: string, value: string): string {
  return id + value.length.toString().padStart(2, '0') + value;
}

/** CRC-16/CCITT-FALSE, as the EMVCo QR specification asks, in four upper-case hex digits. */
export function crc16(text: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(text)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// ---- Mail ----------------------------------------------------------------------------------------

async function sendKeyMail(email: string, key: string, env: Env): Promise<void> {
  if (!env.RESEND_KEY) return;
  const link = `${env.SITE_URL}/#plus=${key}`;
  const html = `<p>ขอบคุณที่สนับสนุน GRKU</p><p>กดลิงก์นี้บนเครื่องที่ต้องการใช้ เพื่อปลดล็อกฟิล์มลุคของคุณ:</p><p><a href="${link}">${link}</a></p><p>หรือวางคีย์นี้ในหน้า "มีคีย์อยู่แล้ว" ของ GRKU Plus:</p><pre>${key}</pre><p>ลิงก์และคีย์ใช้ได้ทุกเครื่อง เก็บอีเมลฉบับนี้ไว้</p><hr><p>Thank you for supporting GRKU. Open the link on the device you use, or paste the key into "I have a key". They work on every device; keep this email.</p>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [email], subject: 'คีย์ GRKU Plus ของคุณ · Your GRKU Plus key', html }),
  });
  if (!response.ok) console.error('resend', response.status, await response.text());
}
