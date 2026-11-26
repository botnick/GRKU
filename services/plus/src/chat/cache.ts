/**
 * The answer cache of the GRKU assistant: the answer to a first question that many people ask the
 * same way ("GRKU Plus ราคาเท่าไหร่", "How do I install GRKU?") comes from D1 instead of a model, at
 * no cost and at once. Only a first question without photos, without anything personal in the page
 * context, and without anything that looks like personal data counts; a follow-up never does.
 *
 * The key is a hash of the normalized question, its language, the tier, the page, the price phase,
 * the prompt version, and the knowledge pack, so a new prompt, new facts, or the end of the launch
 * prices start over by themselves. The question itself is never stored, only its hash and the
 * answer, and only an answer without personal data. An answer lives 7 days.
 */
import type { Language } from './guard';

export const CACHE_TTL = 7 * 86400_000;
/** The longest question that the cache takes: a longer one is rarely asked twice the same way. */
const MAX_QUESTION = 160;
/** The longest question, as sent, that the cache looks at. */
const MAX_RAW = 300;

export interface CachedAnswer {
  text: string;
  created: number;
}

/** The row that marks the last time the admin page cleared the cache (keys are hex, so it is no key). */
export const CLEARED = '~cleared';

/** Where cached answers live: D1 in production, a Map in the tests. */
export interface AnswerCache {
  get(key: string, now: number): Promise<CachedAnswer | null>;
  /** Keeps an answer, unless the cache was cleared after `since` (when the question was looked up). */
  put(key: string, text: string, now: number, since: number): Promise<void>;
  /** Removes the answers older than the TTL. */
  prune(now: number): Promise<void>;
}

/**
 * Polite endings that are never the end of another word, so cutting them keeps what the question
 * asks (not ค่า, which ends ตั้งค่า, nor นะ, which ends ชนะ). Longest first.
 */
const POLITE_ENDINGS = ['นะครับ', 'นะคะ', 'คร้าบ', 'ครับ', 'ค่ะ', 'คะ', 'คับ', 'จ้า', 'thank you', 'please', 'thanks'];
const POLITE_STARTS = ['สวัสดีครับ', 'สวัสดีค่ะ', 'สวัสดีคะ', 'สวัสดี', 'hello', 'hi'];
const PUNCTUATION = new Set([' ', '?', '!', '.', ',', '~', '…', '。', '？', '！', '、']);

/**
 * The question as the cache compares it: lower case, one space, without the punctuation and the
 * polite words around it. Questions of the same form differ only in case, spaces, punctuation, and
 * politeness, so the model gets the same sections for them. A plain scan, no regex that could
 * backtrack.
 */
export function normalizeQuestion(text: string): string {
  let q = text
    .slice(0, MAX_RAW * 2)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[​-‏﻿]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  for (let changed = true; changed; ) {
    changed = false;
    while (q && PUNCTUATION.has(q[q.length - 1]!)) {
      q = q.slice(0, -1);
      changed = true;
    }
    const end = POLITE_ENDINGS.find((word) => q.endsWith(word) && q.length > word.length);
    if (end) {
      q = q.slice(0, -end.length).trimEnd();
      changed = true;
    }
    // A Latin greeting only as a whole word (hi, not his).
    const start = POLITE_STARTS.find((word) => q.length > word.length && q.startsWith(word) && (/^[฀-๿]/.test(word) || PUNCTUATION.has(q[word.length]!)));
    if (start) {
      q = q.slice(start.length);
      while (q && PUNCTUATION.has(q[0]!)) q = q.slice(1);
      changed = true;
    }
  }
  return q;
}

/** Personal data or a key in a text: an email (but support@grku.app), a link, a phone or order number, a GRKU Plus key. */
export function personal(text: string): boolean {
  const t = text.toLowerCase().replace(/support@grku\.app/g, '');
  if (/@|https?:|www\./.test(t)) return true;
  // A phone or a long number, also with spaces or dashes; a year, a price, or a firmware version is shorter.
  if (/\d(?:[\s-]?\d){6,}/.test(t)) return true;
  // A short key: AAAA-AAA-AAAA with its dashes, or the 11 letters and digits run together.
  if (/(?<![a-z0-9])[a-z0-9]{4}-[a-z0-9]{3}-[a-z0-9]{4}(?![a-z0-9])/.test(t)) return true;
  for (const match of t.matchAll(/(?<![a-z0-9])[a-z0-9]{11}(?![a-z0-9])/g)) {
    if (/\d/.test(match[0]) && /[a-z]/.test(match[0])) return true;
  }
  // A long signed key of the first days: two long base64url parts with a dot between them.
  return /[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/.test(text);
}

/** Whether a question may come from the cache, or go into it: short, and nothing personal in it. */
export function cacheableQuestion(text: string): boolean {
  if (text.length > MAX_RAW) return false;
  const q = normalizeQuestion(text);
  if (q.length < 3 || [...q].length > MAX_QUESTION) return false;
  return !personal(text);
}

/** The cache key: the hash of everything that makes the answer what it is. */
export async function answerKey(parts: { question: string; language: Language; tier: string; page: string; prompt: string; knowledge: string; phase: string }): Promise<string> {
  const text = ['answer-v2', parts.prompt, parts.knowledge, parts.phase, parts.tier, parts.language, parts.page, normalizeQuestion(parts.question)].join('\n');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

export function d1Cache(db: D1Database): AnswerCache {
  return {
    async get(key, now) {
      const row = await db.prepare('SELECT answer, created FROM chat_cache WHERE k = ? AND created > ?').bind(key, now - CACHE_TTL).first<{ answer: string; created: number }>();
      if (!row) return null;
      await db.prepare('UPDATE chat_cache SET hits = hits + 1 WHERE k = ?').bind(key).run().catch(() => {});
      return { text: row.answer, created: row.created };
    },
    async put(key, text, now, since) {
      // One statement, so a clear between the lookup and the answer wins.
      await db
        .prepare(
          'INSERT INTO chat_cache (k, answer, created, hits) SELECT ?, ?, ?, 0 WHERE NOT EXISTS (SELECT 1 FROM chat_cache WHERE k = ? AND created >= ?) ON CONFLICT(k) DO UPDATE SET answer = excluded.answer, created = excluded.created',
        )
        .bind(key, text, now, CLEARED, since)
        .run();
    },
    async prune(now) {
      await db.prepare('DELETE FROM chat_cache WHERE created <= ? AND k != ?').bind(now - CACHE_TTL, CLEARED).run();
    },
  };
}

export function memoryCache(): AnswerCache & { rows: Map<string, CachedAnswer & { hits: number }> } {
  const rows = new Map<string, CachedAnswer & { hits: number }>();
  return {
    rows,
    async get(key, now) {
      const row = rows.get(key);
      if (!row || row.created <= now - CACHE_TTL) return null;
      row.hits += 1;
      return { text: row.text, created: row.created };
    },
    async put(key, text, now, since) {
      if ((rows.get(CLEARED)?.created ?? -1) >= since) return;
      rows.set(key, { text, created: now, hits: 0 });
    },
    async prune(now) {
      for (const [key, row] of rows) if (key !== CLEARED && row.created <= now - CACHE_TTL) rows.delete(key);
    },
  };
}
