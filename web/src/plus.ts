/**
 * GRKU Plus on the site. The free library puts any FREE_SLOTS looks of the catalog on the card,
 * and Positive GRII never takes a slot; imports and the effects already on a card never do
 * either. A purchase adds slots, a pack of films that take no slot, or the whole shelf. What a
 * visitor owns is an Entitlement, read from the Plus service with the key that a purchase gives;
 * this browser keeps the key. The service is services/plus; it issues the PromptPay payload, checks
 * the bank slip, and signs the keys.
 *
 * The picker uses this only to decide whether one more look may go on the card. Nothing here
 * ever blocks a write or a download: a selection made before Plus, or read from a card, stays.
 */
import { MAX_EFFECTS, type CardEffect, type Effect } from './catalog';
import { brandOf, filmKind } from './filmKind';

/** The Plus service. VITE_PLUS_API (web/.env) overrides it for a local Worker. */
export const PLUS_API: string = (import.meta.env?.VITE_PLUS_API as string | undefined) ?? 'https://grku-plus.botnick.workers.dev';

/** The looks that the free library puts on the card. */
export const FREE_SLOTS = 10;

export type Pack = 'kodak' | 'fuji' | 'slide' | 'mono' | 'cinema' | 'instant' | 'indie';
export const PACKS: readonly Pack[] = ['kodak', 'fuji', 'slide', 'mono', 'cinema', 'instant', 'indie'];

export type Tier = 'plus' | 'slots25' | `pack:${Pack}`;

/** The price of each tier in baht, as the service has it (services/plus/src/index.ts PRICES). */
export const PRICES: Readonly<Record<Tier, number>> = {
  plus: 199,
  slots25: 79,
  'pack:kodak': 49,
  'pack:fuji': 49,
  'pack:slide': 49,
  'pack:mono': 49,
  'pack:cinema': 49,
  'pack:instant': 49,
  'pack:indie': 49,
};
/** The least an order costs after the credit of earlier purchases. */
export const MIN_AMOUNT = 20;

export interface Entitlement {
  /** The packs whose looks take no slot. */
  packs: readonly string[];
  /** How many catalog looks outside the packs may be on the card. */
  slots: number;
  /** The whole shelf, up to the card limit. */
  plus: boolean;
  /** Baht paid in all, the credit toward an upgrade. */
  paid: number;
}

export const FREE: Entitlement = { packs: [], slots: FREE_SLOTS, plus: false, paid: 0 };

/**
 * The looks on the card before the first change: Positive GRII, which takes no slot, and six
 * popular films, so the first visit has room to add more.
 */
export const DEFAULT_LOOKS: readonly string[] = [
  'positive-film-grii-v1',
  'portra-400-endura-v1',
  'gold-200-premier-v1',
  'kodachrome-64-v1',
  'velvia-100-v1',
  'eterna-500t-3523xd-v1',
  'trix-400-mono-v1',
];

type Classified = Parameters<typeof filmKind>[0];

/** The pack of a catalog look, or null for a look of the camera itself, which is always free. */
export function packOf(effect: Classified): Pack | null {
  switch (filmKind(effect)) {
    case 'mono':
      return 'mono';
    case 'cine':
      return 'cinema';
    case 'instant':
      return 'instant';
    case 'slide':
      return 'slide';
    case 'camera':
    case 'imported':
      return null;
    case 'negative': {
      const brand = brandOf(effect);
      return brand === 'Kodak' ? 'kodak' : brand === 'Fujifilm' ? 'fuji' : 'indie';
    }
  }
}

/** Whether putting `effect` on the card takes one of the slots of `owned`. */
export function takesSlot(effect: Effect | CardEffect, owned: Entitlement): boolean {
  if (owned.plus || effect.imported || effect.card) return false;
  const pack = packOf(effect);
  return pack !== null && !owned.packs.includes(pack);
}

/** How many slot-taking looks `owned` allows on the card. */
export function slotsOf(owned: Entitlement): number {
  return owned.plus ? MAX_EFFECTS : Math.min(owned.slots, MAX_EFFECTS);
}

/** How many checked effects take a slot. */
export function usedSlots(effects: readonly (Effect | CardEffect)[], checked: ReadonlySet<string>, owned: Entitlement): number {
  return effects.filter((effect) => checked.has(effect.id) && takesSlot(effect, owned)).length;
}

/** The number of catalog looks in each pack. */
export function packCounts(effects: readonly Classified[]): Record<Pack, number> {
  const counts = Object.fromEntries(PACKS.map((pack) => [pack, 0])) as Record<Pack, number>;
  for (const effect of effects) {
    const pack = packOf(effect);
    if (pack) counts[pack] += 1;
  }
  return counts;
}

/** The baht due for `tier` with `owned`: earlier payments count toward the shelf and the slots. */
export function amountDue(tier: Tier, owned: Entitlement): number {
  const credit = tier === 'plus' || tier === 'slots25' ? owned.paid : 0;
  return Math.max(MIN_AMOUNT, PRICES[tier] - credit);
}

/** Whether `owned` already has everything that `tier` gives. */
export function hasTier(tier: Tier, owned: Entitlement): boolean {
  if (owned.plus) return true;
  if (tier === 'slots25') return owned.slots >= 25;
  if (tier.startsWith('pack:')) return owned.packs.includes(tier.slice(5));
  return false;
}

// ---- The key of this browser ---------------------------------------------------------------------

const KEY_STORAGE = 'grku.plusKey';

export function loadKey(): string | null {
  try {
    return localStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
}

export function saveKey(key: string): void {
  try {
    localStorage.setItem(KEY_STORAGE, key);
  } catch {
    // Without storage, the key lasts this visit.
  }
}

export function forgetKey(): void {
  try {
    localStorage.removeItem(KEY_STORAGE);
  } catch {
    // Nothing was kept.
  }
}

/**
 * The key in the page address, from the link of the key email (`#plus=<key>`), saved and taken
 * out of the address. Null when the address has none.
 */
export function takeKeyFromHash(): string | null {
  if (typeof location === 'undefined') return null;
  const match = /^#plus=([A-Za-z0-9_.-]+)$/.exec(location.hash);
  if (!match) return null;
  const key = match[1]!;
  saveKey(key);
  history.replaceState(null, '', location.pathname + location.search);
  return key;
}

// ---- The service -------------------------------------------------------------------------------------

export class PlusError extends Error {
  constructor(
    /** The error of the service, or `network` when no answer came. */
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${PLUS_API}${path}`, init);
  } catch {
    throw new PlusError('network', 0);
  }
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new PlusError(body.error ?? 'failed', response.status);
  return body as T;
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export interface Order {
  order: string;
  tier: Tier;
  amount: number;
  /** The EMVCo payload of the PromptPay QR for the amount. */
  promptpay: string;
  expires: number;
  /** Who receives the money, as the page shows it next to the QR. */
  receiver?: { name: string; account: string };
  /** Whether the service takes TrueMoney อั่งเปา links too. */
  angpao?: boolean;
}

/** The state of an order, for the page that waits while a phone pays. */
export type OrderStatus =
  | ({ status: 'open' } & Order)
  | ({ status: 'paid'; tier: Tier; amount: number } & Paid)
  | { status: 'expired'; tier: Tier; amount: number };

export interface Paid {
  key: string;
  owner: string;
  entitlement: Entitlement;
}

export const fetchEntitlement = (key: string) =>
  call<{ owner: string; entitlement: Entitlement }>(`/me?key=${encodeURIComponent(key)}`);

/** The Turnstile widget of grku.app (a public site key); the service checks the token with its secret. */
export const TURNSTILE_SITEKEY = '0x4AAAAAAF6WphXG1XRt8M87';

export const createOrder = (tier: Tier, email: string, key: string | null, turnstile: string | null) =>
  call<Order>('/order', json({ tier, email, key: key ?? undefined, turnstile: turnstile ?? undefined }));

export const orderStatus = (order: string) => call<OrderStatus>(`/order/${encodeURIComponent(order)}`);

/**
 * Pays an order with a TrueMoney อั่งเปา link. A gift too small for the order fails with the code
 * `gift SHORT <got> <missing>`: the gift stays as credit and the order now asks for the rest.
 */
export const redeemAngpao = (order: string, link: string) => call<Paid>('/angpao', json({ order, link }));

/** The amounts of a `gift SHORT` error, or null for another error. */
export function giftShort(error: unknown): { got: number; missing: number } | null {
  if (!(error instanceof PlusError)) return null;
  const match = /^gift SHORT (\d+) (\d+)$/.exec(error.code);
  return match ? { got: Number(match[1]), missing: Number(match[2]) } : null;
}

/** The address a phone opens to upload the slip of an order: the light page public/slip/. */
export const payLink = (order: string) => `${location.origin}/slip/?o=${order}&l=${document.documentElement.lang === 'th' ? 'th' : 'en'}`;

/** The order in the page address (`#pay=<order>`), taken out of the address. Null when the address has none. */
export function takeOrderFromHash(): string | null {
  if (typeof location === 'undefined') return null;
  const match = /^#pay=([a-z0-9]{10,20})$/.exec(location.hash);
  if (!match) return null;
  history.replaceState(null, '', location.pathname + location.search);
  return match[1]!;
}

export function submitSlip(order: string, file: File): Promise<Paid> {
  const body = new FormData();
  body.append('order', order);
  body.append('file', file, file.name || 'slip.jpg');
  return call<Paid>('/slip', { method: 'POST', body });
}

export const requestKey = (email: string) => call<{ sent: boolean }>('/magic', json({ email }));

/** Which text of `strings.plus` tells the visitor about `error`. */
export function errorKind(
  error: unknown,
): 'unavailable' | 'orderExpired' | 'slipMismatch' | 'slipUsed' | 'slipUnreadable' | 'badKey' | 'networkError' | 'angpaoFailed' {
  if (!(error instanceof PlusError)) return 'networkError';
  if (error.status === 503) return 'unavailable';
  if (error.status === 410) return 'orderExpired';
  if (error.status === 401) return 'badKey';
  if (error.code === 'slip already used' || error.code === 'angpao already used') return 'slipUsed';
  if (error.code === 'slip not readable') return 'slipUnreadable';
  if (error.code.startsWith('gift ')) return 'angpaoFailed';
  if (error.status === 422) return 'slipMismatch';
  return 'networkError';
}

/** What an entitlement gives, one line each, for the page and the sheet. Empty for the free tier. */
export function ownedLines(owned: Entitlement, strings: { yoursAll: string; yoursPack: (name: string, n: number) => string; yoursSlots: (n: number) => string; packs: Record<Pack, string> }, counts: Record<Pack, number> | null): string[] {
  if (owned.plus) return [strings.yoursAll];
  const lines = owned.packs.filter((pack): pack is Pack => (PACKS as readonly string[]).includes(pack)).map((pack) => strings.yoursPack(strings.packs[pack], counts?.[pack] ?? 0));
  if (owned.slots > FREE.slots) lines.push(strings.yoursSlots(owned.slots));
  return lines;
}

/** Whether a look is unlocked by a purchase (in an owned pack, or everything). */
export function unlockedBy(effect: Classified, owned: Entitlement): boolean {
  if (owned.plus) return true;
  const pack = packOf(effect);
  return pack !== null && owned.packs.includes(pack);
}
