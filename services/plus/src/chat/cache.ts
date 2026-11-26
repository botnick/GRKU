/**
 * The answer cache of the GRKU assistant: the answer to a first question that many people ask the
 * same way ("GRKU Plus ราคาเท่าไหร่", "How do I install GRKU?") comes from D1 instead of a model, at
 * no cost and at once. Only a first question without photos, without anything personal in the page
 * context, and without anything that looks like personal data counts; a follow-up never does.
 *
 * The key is a hash of the normalized question, its language, the tier, the page, the prompt
 * version, and the knowledge pack, so a new prompt or new facts start over by themselves. The
 * question itself is never stored, only its hash and the answer. An answer lives 7 days.
 */
import type { Language } from './guard';

export const CACHE_TTL = 7 * 86400_000;
/** The longest question that the cache takes: a longer one is rarely asked twice the same way. */
const MAX_QUESTION = 160;

export interface CachedAnswer {
  text: string;
  created: number;
}

/** Where cached answers live: D1 in production, a Map in the tests. */
export interface AnswerCache {
  get(key: string, now: number): Promise<CachedAnswer | null>;
  put(key: string, text: string, now: number): Promise<void>;
  /** Removes the answers older than the TTL. */
  prune(now: number): Promise<void>;
}

/** Polite words and fillers at the end of a question, which do not change what it asks. */
const TAIL = /(?:\s*(?:ค่ะ|คะ|คับ|ครับ|ครัช|คร้าบ|ค่า|ค้า|จ้า|จ้ะ|จ๊ะ|นะ|น้า|หน่อย|ด้วย|please|pls|plz|thanks|thank you|thx)\s*|[\s?!.,~…。？！、]+)+$/u;
/** Polite words at the start. */
const HEAD = /^(?:\s*(?:สวัสดี(?:ค่ะ|คะ|ครับ)?|hi|hello|hey|ขอถาม(?:หน่อย)?|สอบถาม(?:หน่อย)?)[\s,!.]*)+/u;

/** The question as the cache compares it: lower case, one space, without polite words around it. */
export function normalizeQuestion(text: string): string {
  let q = text.normalize('NFC').toLowerCase().replace(/[​-‏﻿]/g, '').replace(/\s+/g, ' ').trim();
  for (let i = 0; i < 3; i++) q = q.replace(TAIL, '').replace(HEAD, '').trim();
  // ไหม, มั้ย, ไหมคะ are one question word.
  return q.replace(/มั้ย|มั๊ย|ไม๊/g, 'ไหม').replace(/อัพเดท|อัพเดต|อัปเดท/g, 'อัปเดต');
}

/** Whether a question may come from the cache, or go into it: short, and nothing personal in it. */
export function cacheableQuestion(text: string): boolean {
  const q = normalizeQuestion(text);
  if (q.length < 3 || [...q].length > MAX_QUESTION) return false;
  // An email, a link, a key, or a long number (a phone, an order) is personal or one of a kind.
  if (/@|https?:|www\.|\d{5,}|[a-z0-9]{4}-[a-z0-9]{3}-[a-z0-9]{4}/i.test(q)) return false;
  return true;
}

/** The cache key: the hash of everything that makes the answer what it is. */
export async function answerKey(parts: { question: string; language: Language; tier: string; page: string; prompt: string; knowledge: string }): Promise<string> {
  const text = ['answer-v1', parts.prompt, parts.knowledge, parts.tier, parts.language, parts.page, normalizeQuestion(parts.question)].join('\n');
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
    async put(key, text, now) {
      await db.prepare('INSERT INTO chat_cache (k, answer, created, hits) VALUES (?, ?, ?, 0) ON CONFLICT(k) DO UPDATE SET answer = excluded.answer, created = excluded.created').bind(key, text, now).run();
    },
    async prune(now) {
      await db.prepare('DELETE FROM chat_cache WHERE created <= ?').bind(now - CACHE_TTL).run();
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
    async put(key, text, now) {
      rows.set(key, { text, created: now, hits: 0 });
    },
    async prune(now) {
      for (const [key, row] of rows) if (row.created <= now - CACHE_TTL) rows.delete(key);
    },
  };
}
