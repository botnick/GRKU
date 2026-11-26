// What the assistant keeps on this device, and only here: the current conversation (so it
// survives a move between pages and a reload), the last five conversations, the session token
// until it expires, and, only when the visitor turns it on, a small memory (camera, firmware,
// liked looks). The service keeps none of it. Each read and write tolerates a browser without
// storage (a private window): the chat then lasts the visit.
import type { ChatSession, Turn } from './api';

export interface StoredTurn extends Turn {
  /** When the turn was made, milliseconds. */
  at: number;
  /** Small copies of the photos of a user turn (JPEG data URLs), for the bubble; the photos themselves are not kept. */
  images?: string[];
  /** Look cards and quick replies stay with the turn's text; nothing else is kept. */
}

export interface Conversation {
  id: string;
  turns: StoredTurn[];
  updated: number;
}

export interface Memory {
  on: boolean;
  camera?: string;
  firmware?: string;
  likes?: string[];
}

const CURRENT = 'grku.chat.current';
const RECENT = 'grku.chat.recent';
const SESSION = 'grku.chat.session';
const MEMORY = 'grku.chat.memory';
/** The most turns a conversation keeps on the device. */
const MAX_TURNS = 40;
const MAX_RECENT = 5;

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;

function read<T>(storage: Storage | null, key: string): T | null {
  try {
    const text = storage?.getItem(key);
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: Storage | null, key: string, value: unknown): void {
  try {
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, JSON.stringify(value));
  } catch {
    // Full or blocked storage: the chat lasts this visit.
  }
}

export function deviceStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

const isTurn = (value: unknown): value is StoredTurn => {
  const turn = value as StoredTurn | null;
  return (
    !!turn &&
    (turn.role === 'user' || turn.role === 'assistant') &&
    typeof turn.content === 'string' &&
    (turn.sig === undefined || typeof turn.sig === 'string') &&
    (turn.images === undefined || (Array.isArray(turn.images) && turn.images.length <= 2 && turn.images.every(isThumb)))
  );
};

/** A small photo that a turn may keep: a JPEG data URL, at most about 60 KB. */
export const isThumb = (value: unknown): value is string => typeof value === 'string' && value.length < 80_000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(value);

/**
 * The turns as the service takes them: assistant turns with their signature; a user turn that had
 * photos says so ("[photo]"), as the photos go only with the turn they were sent with (the last).
 */
export function turnsForService(turns: readonly StoredTurn[], photoOnly: string): Turn[] {
  return turns.map(({ role, content, sig, images }, index) => {
    if (role === 'assistant') return { role, content, sig };
    const text = content.trim() || (images?.length ? photoOnly : content);
    // The last turn sends its photos along; an earlier one only says it had them.
    return { role, content: images?.length && index < turns.length - 1 ? `[photo] ${text}` : text };
  });
}

function validConversation(value: unknown): Conversation | null {
  const conversation = value as Conversation | null;
  if (!conversation || typeof conversation.id !== 'string' || !Array.isArray(conversation.turns)) return null;
  return { id: conversation.id, turns: conversation.turns.filter(isTurn).slice(-MAX_TURNS), updated: Number(conversation.updated) || 0 };
}

export const newConversation = (now = Date.now()): Conversation => ({ id: `c${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`, turns: [], updated: now });

export function loadCurrent(storage: Storage | null): Conversation | null {
  return validConversation(read(storage, CURRENT));
}

/** Keeps `conversation` as the current one, and among the recent ones once it has a turn. */
export function saveCurrent(storage: Storage | null, conversation: Conversation): void {
  const kept = { ...conversation, turns: conversation.turns.slice(-MAX_TURNS) };
  write(storage, CURRENT, kept);
  if (!kept.turns.length) return;
  const recent = loadRecent(storage).filter((item) => item.id !== kept.id);
  write(storage, RECENT, [kept, ...recent].slice(0, MAX_RECENT));
}

export function loadRecent(storage: Storage | null): Conversation[] {
  const list = read<unknown[]>(storage, RECENT);
  return Array.isArray(list) ? list.map(validConversation).filter((c): c is Conversation => !!c && c.turns.length > 0).slice(0, MAX_RECENT) : [];
}

/** The title of a conversation in the list: its first question, short. */
export function titleOf(conversation: Conversation, photo = ''): string {
  const turn = conversation.turns.find((t) => t.role === 'user');
  const first = turn?.content.trim() || (turn?.images?.length ? photo : '');
  const chars = [...first.replace(/\s+/g, ' ').trim()];
  return chars.length > 48 ? `${chars.slice(0, 47).join('')}…` : chars.join('');
}

/** Deletes every conversation, the session, and the memory of this device. */
export function forgetAll(storage: Storage | null): void {
  for (const key of [CURRENT, RECENT, SESSION, MEMORY]) write(storage, key, null);
}

// ---- The session --------------------------------------------------------------------------------

interface StoredSession extends ChatSession {
  /** The last characters of the GRKU Plus key that opened it, or empty: another key needs a new session. */
  keyTag: string;
}

/** The expiry in a session token (its payload is base64url JSON with `e`), or 0. */
export function sessionExpiry(token: string): number {
  try {
    const payload = token.split('.')[0]!.replace(/-/g, '+').replace(/_/g, '/');
    return Number((JSON.parse(atob(payload)) as { e?: unknown }).e) || 0;
  } catch {
    return 0;
  }
}

const keyTagOf = (key: string | null) => (key ? key.replace(/[^0-9A-Za-z]/g, '').slice(-4) : '');

/** The session of an earlier visit, while it is valid for a minute more and for the same key. */
export function loadSession(storage: Storage | null, key: string | null, now = Date.now()): ChatSession | null {
  const stored = read<StoredSession>(storage, SESSION);
  if (!stored || typeof stored.session !== 'string' || stored.keyTag !== keyTagOf(key)) return null;
  if (sessionExpiry(stored.session) < now + 60_000) return null;
  return stored;
}

export function saveSession(storage: Storage | null, session: ChatSession | null, key: string | null): void {
  write(storage, SESSION, session ? { ...session, keyTag: keyTagOf(key) } : null);
}

// ---- The memory of this device ---------------------------------------------------------------------

export function loadMemory(storage: Storage | null): Memory {
  const memory = read<Memory>(storage, MEMORY);
  if (!memory || memory.on !== true) return { on: false };
  return {
    on: true,
    camera: typeof memory.camera === 'string' ? memory.camera.slice(0, 40) : undefined,
    firmware: typeof memory.firmware === 'string' && /^\d\.\d{2}$/.test(memory.firmware) ? memory.firmware : undefined,
    likes: Array.isArray(memory.likes) ? memory.likes.filter((id): id is string => typeof id === 'string').slice(0, 5) : undefined,
  };
}

/** Keeps the memory; turned off, it forgets what it held. */
export function saveMemory(storage: Storage | null, memory: Memory): void {
  write(storage, MEMORY, memory.on ? memory : null);
}

/** Adds a liked look to the memory, newest first, at most five. */
export const likeLook = (memory: Memory, id: string): Memory => (memory.on ? { ...memory, likes: [id, ...(memory.likes ?? []).filter((x) => x !== id)].slice(0, 5) } : memory);

/** A firmware version that a question names (GR IIIx 1.71, "เฟิร์มแวร์ 1.11"), for the memory. */
export function firmwareIn(text: string): string | null {
  return /(?:^|[^\d.])([12]\.\d{2})(?![\d.])/.exec(text)?.[1] ?? null;
}
