import { describe, expect, it } from 'vitest';
import { answerKey, cacheableQuestion, memoryCache, normalizeQuestion, personal, CACHE_TTL, CLEARED } from './cache';
import { cacheable, chat, lookList, matchText, memoryStore, mentions, readUsage, signReply, startSession, systemPrompt, tagScore, SECTION_LIMITS, type ChatDeps, type ChatEnv, type Knowledge } from './index';

const SECRET = 'test-secret';
const NOW = Date.parse('2026-11-27T10:00:00Z');
const ENV = {
  SITE_URL: 'https://grku.app',
  KEY_SECRET: SECRET,
  CHAT_NAME: 'gemini',
  CHAT_BASE_URL: 'https://gemini.test/v1beta/openai',
  CHAT_API_KEY: 'k1',
  CHAT_MODEL_FREE: 'flash-lite',
  CHAT_MODEL_PLUS: 'flash',
  CHAT_PER_MINUTE: '50',
} as unknown as ChatEnv;

const section = (id: string, tags: string[], size = 200) => ({ id, title: id, tags, text: `${id} `.padEnd(size, '.') });
const PACK: Knowledge = {
  schema: 'grku-chat-knowledge-v1',
  version: '1.10.1',
  hash: 'h1',
  sections: [
    { id: 'about', title: 'GRKU in short', core: true, tags: [], text: 'GRKU core facts.' },
    section('camera', ['ใช้', 'ยังไง', 'menu']),
    section('modules', ['crop', 'ครอป', 'date', 'วันที่']),
    section('learn-framing-and-crops', ['crop', 'ครอป', 'xpan']),
    section('docs-crop', ['crop', 'ครอป', 'มิล', 'focal length']),
    section('docs-date', ['date imprint', 'วันที่', 'ใส่วันที่']),
    section('docs-shutdown', ['ปิดกล้อง', 'shutdown']),
    section('docs-firmware', ['เฟิร์มแวร์', 'เช็ค', 'firmware version']),
    section('recovery', ['เสีย', 'stuck']),
    section('plus', ['เสียเงิน', 'ราคา', 'price']),
    section('big', ['huge'], 8000),
  ],
  looks: [
    { id: 'portra-400-endura-v1', name: 'Portra 400', brand: 'Kodak', kind: 'negative', pack: 'kodak', hint: 'Soft skin.' },
    { id: 'classic-chrome-v1', name: 'Classic Chrome', brand: 'Fujifilm', kind: 'camera', pack: 'free' },
  ],
  lookTags: ['look', 'film', 'chrome', 'ลุค', 'ฟิล์ม', 'สี', 'แนะนำ', 'portrait', 'อุ่น'],
};

const ask = (q: string, tier: 'free' | 'plus' = 'free', page = 'home') => systemPrompt(PACK, [{ role: 'user', content: q }], 'th', { page }, tier);

describe('choosing the sections', () => {
  it('matches Latin tags as words and Thai tags outside other syllables', () => {
    expect(mentions('how many mm on crop', 'mm')).toBe(true);
    expect(mentions('a comment', 'mm')).toBe(false);
    expect(mentions('50mm please', 'mm')).toBe(true);
    expect(mentions('two modules', 'module')).toBe(true);
    expect(mentions('open it in chrome', 'chrome')).toBe(true);
    // ปิดกล้อง (turn off) is not inside เปิดกล้อง (turn on); สี (color) is not inside เสีย.
    expect(mentions('กด menu ค้างแล้วเปิดกล้อง', 'ปิดกล้อง')).toBe(false);
    expect(mentions('อยากให้ปิดกล้องแล้วขึ้นรูป', 'ปิดกล้อง')).toBe(true);
    expect(mentions('ต้องเสียเงินไหม', 'สี')).toBe(false);
    expect(mentions('สีสวย', 'สี')).toBe(true);
    // A tag cut before a vowel mark is inside another syllable.
    expect(mentions('ลองดู', 'ลอ')).toBe(true);
    expect(mentions('ลือ', 'ล')).toBe(false);
  });

  it('weighs long and rare tags over short and common ones', () => {
    const counts = new Map([['ครอป', 3], ['มิล', 1]]);
    expect(tagScore('ครอปได้กี่มิล', ['ครอป', 'มิล'], counts)).toBeGreaterThan(tagScore('ครอปได้กี่มิล', ['ครอป'], counts));
    expect(tagScore('ใช้ยังไง', ['ใช้', 'ยังไง'])).toBeLessThan(3);
  });

  it('brings the best few sections, the manual first, under the limits', () => {
    const crop = ask('GR IIIx ครอปได้กี่มิลคะ');
    expect(crop.topics[0]).toBe('docs-crop');
    expect(crop.topics.length).toBeLessThanOrEqual(SECTION_LIMITS.free.count);
    expect(ask('อยากใส่วันที่บนรูปแบบกล้องฟิล์ม').topics[0]).toBe('docs-date');
    expect(ask('GR IV เช็คเฟิร์มแวร์ยังไง').topics).toContain('docs-firmware');
    expect(ask('กด MENU ค้างแล้วเปิดกล้อง').topics).not.toContain('docs-shutdown');
    // A section far behind the best one stays out.
    expect(ask('ต้องเสียเงินใช่มั้ยคะ').topics).toEqual(['plus']);
    // Too big for the room: left out.
    expect(ask('huge').topics).toEqual([]);
    expect(ask('hello').topics).toEqual([]);
  });

  it('keeps the shared start of the prompt the same for every question', () => {
    const a = ask('ครอปได้กี่มิล').prompt;
    const b = ask('ราคาเท่าไหร่').prompt;
    const shared = 'GRKU core facts.';
    expect(a.slice(0, a.indexOf(shared))).toBe(b.slice(0, b.indexOf(shared)));
  });

  it('brings the look list only for a look named, or a word of choosing or a scene', () => {
    expect(ask('ใน film look ปรับโทนเพิ่มเองได้ไหม').topics).not.toContain('looks');
    expect(ask('เปิดใน Chrome ไม่ได้').topics).not.toContain('looks');
    expect(ask('แนะนำลุคโทนอุ่นๆ').topics).toContain('looks');
    expect(ask('Classic Chrome กับ Portra 400 ต่างกันยังไง').topics).toContain('looks');
    expect(lookList(PACK.looks)).toBe('[pack kodak; negative]\nportra-400-endura-v1 | Kodak Portra 400 | Soft skin.\n[free: camera looks, in no pack; camera]\nclassic-chrome-v1 | Fujifilm Classic Chrome');
  });
});

describe('usage', () => {
  it('reads cached and reasoning tokens and the billed cost', () => {
    const before = { prompt: 0, completion: 0, cached: 0, reasoning: 0 };
    expect(readUsage({ prompt_tokens: 6000, completion_tokens: 300, prompt_tokens_details: { cached_tokens: 4000 }, completion_tokens_details: { reasoning_tokens: 200 }, cost: 0.0012 }, before)).toEqual({ prompt: 6000, completion: 300, cached: 4000, reasoning: 200, cost: 0.0012 });
    expect(readUsage({ prompt_tokens: 10 }, before)).toEqual({ prompt: 10, completion: 0, cached: 0, reasoning: 0 });
  });
});

describe('the answer cache', () => {
  it('compares questions without case, spaces, and polite words', () => {
    expect(normalizeQuestion('  GRKU Plus  ราคาเท่าไหร่คะ ?? ')).toBe('grku plus ราคาเท่าไหร่');
    expect(normalizeQuestion('สวัสดีค่ะ ต้องเสียเงินใช่ไหมคะ')).toBe('ต้องเสียเงินใช่ไหม');
    expect(normalizeQuestion('How do I install GRKU? Thanks!')).toBe('how do i install grku');
    // Only endings that end no other word: ตั้งค่า and ชนะ stay whole; "hi" is a word, not "his".
    expect(normalizeQuestion('Enable at Start ตั้งค่า')).toBe('enable at start ตั้งค่า');
    expect(normalizeQuestion('ใครจะชนะ')).toBe('ใครจะชนะ');
    expect(normalizeQuestion('history of grku')).toBe('history of grku');
    // Long input is cut before any work.
    expect(normalizeQuestion('?'.repeat(100000) + 'a').length).toBeLessThan(700);
  });

  it('takes no question with personal data or a long one', () => {
    expect(cacheableQuestion('ราคาเท่าไหร่')).toBe(true);
    expect(cacheableQuestion('my email is a@b.com')).toBe(false);
    expect(cacheableQuestion('โทร 0812345678')).toBe(false);
    expect(cacheableQuestion('key ABCD-EFG-HJKM does not work')).toBe(false);
    expect(cacheableQuestion('key AB2DEFGH3JK does not work')).toBe(false);
    expect(cacheableQuestion('โทร 081-234-5678')).toBe(false);
    expect(cacheableQuestion('eyJvIjoiYUBiLmNvbSJ9abcdefgh.abcdefghijklmnopqrstuv')).toBe(false);
    expect(cacheableQuestion('GR IIIx 1.71 ลงไม่ได้')).toBe(true);
    expect(cacheableQuestion('GRKU Plus ราคาเท่าไหร่')).toBe(true);
    expect(personal('เขียนถึง support@grku.app ได้ค่ะ [GRKU Plus](/#plus) portra-400-endura-v1')).toBe(false);
    expect(cacheableQuestion('x'.repeat(200))).toBe(false);
  });

  it('takes only a first question without photos or page details', () => {
    const one = [{ role: 'user' as const, content: 'ราคาเท่าไหร่' }];
    expect(cacheable(one, { page: 'home' }, false)).toBe(true);
    expect(cacheable(one, { page: 'home' }, true)).toBe(false);
    expect(cacheable(one, { page: 'write', card: true }, false)).toBe(false);
    expect(cacheable(one, { page: 'home', firmware: '1.11' }, false)).toBe(false);
    expect(cacheable([...one, { role: 'assistant', content: 'x' }, { role: 'user', content: 'แล้วจ่ายยังไง' }], { page: 'home' }, false)).toBe(false);
  });

  it('keys by the prompt, the knowledge, the tier, the language, and the page', async () => {
    const base = { question: 'ราคาเท่าไหร่คะ', language: 'th' as const, tier: 'free', page: 'home', prompt: 'p1', knowledge: 'k1', phase: 'launch' };
    const key = await answerKey(base);
    expect(await answerKey({ ...base, question: 'ราคาเท่าไหร่' })).toBe(key);
    for (const change of [{ prompt: 'p2' }, { knowledge: 'k2' }, { tier: 'plus' }, { language: 'en' as const }, { page: 'docs/plus' }, { phase: 'regular' }]) expect(await answerKey({ ...base, ...change })).not.toBe(key);
  });

  function harness(env: Partial<ChatEnv> = {}, answer = 'GRKU Plus is 199 baht. [GRKU Plus](/#plus)') {
    const store = memoryStore();
    const cache = memoryCache();
    const pending: Promise<unknown>[] = [];
    let calls = 0;
    let now = NOW;
    const deps: ChatDeps = {
      env: { ...ENV, ...env } as ChatEnv,
      store,
      now: () => now,
      human: async () => true,
      plusOwner: async () => null,
      fetch: (async () => {
        calls++;
        const lines = [`data: ${JSON.stringify({ choices: [{ delta: { content: answer } }] })}\n\n`, `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: 5000, completion_tokens: 40 } })}\n\n`, 'data: [DONE]\n\n'];
        return new Response(lines.join(''), { headers: { 'Content-Type': 'text/event-stream' } });
      }) as unknown as typeof fetch,
      waitUntil: (promise) => void pending.push(promise),
      knowledge: async () => PACK,
      cache,
    };
    const send = async (messages: unknown[], context: Record<string, unknown> = { page: 'home' }) => {
      const token = ((await (await startSession(new Request('https://plus.test/chat/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }), deps)).json()) as { session: string }).session;
      const response = await chat(new Request('https://plus.test/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'CF-Connecting-IP': '203.0.113.9' }, body: JSON.stringify({ messages, lang: 'th', context }) }), deps);
      const text = await response.text();
      await Promise.all(pending);
      return text;
    };
    return { deps, store, cache, send, calls: () => calls, later: (ms: number) => (now += ms) };
  }

  it('answers the same first question from the cache, signed, without the model', async () => {
    const h = harness();
    await h.send([{ role: 'user', content: 'GRKU Plus ราคาเท่าไหร่คะ' }]);
    expect(h.calls()).toBe(1);
    expect(h.cache.rows.size).toBe(1);
    const second = await h.send([{ role: 'user', content: 'grku plus ราคาเท่าไหร่' }]);
    expect(h.calls()).toBe(1);
    expect(second).toContain('"cache":true');
    expect(second).toContain(await signReply(SECRET, 'GRKU Plus is 199 baht. [GRKU Plus](/#plus)'));
    const day = '2026-11-27';
    expect((await h.store.get(day, 'cache:hit')).n).toBe(1);
    expect((await h.store.get(day, 'cache:miss')).n).toBe(1);
    // It still counts as a message of the day.
    expect((await h.store.get(day, 'global')).n).toBe(2);
  });

  it('asks the model again after 7 days, for a follow-up, with page details, or when turned off', async () => {
    const h = harness();
    await h.send([{ role: 'user', content: 'ราคาเท่าไหร่' }]);
    h.later(CACHE_TTL + 1);
    await h.send([{ role: 'user', content: 'ราคาเท่าไหร่' }]);
    expect(h.calls()).toBe(2);
    await h.send([{ role: 'user', content: 'ราคาเท่าไหร่' }], { page: 'write', card: true });
    expect(h.calls()).toBe(3);
    const off = harness({ CHAT_ANSWER_CACHE: 'off' });
    await off.send([{ role: 'user', content: 'ราคาเท่าไหร่' }]);
    await off.send([{ role: 'user', content: 'ราคาเท่าไหร่' }]);
    expect(off.calls()).toBe(2);
    expect(off.cache.rows.size).toBe(0);
  });

  it('is no first question when the request holds more messages, even if the server dropped them', async () => {
    const h = harness();
    await h.send([{ role: 'user', content: 'ราคาเท่าไหร่' }, { role: 'assistant', content: 'unsigned', sig: 'bad' }, { role: 'user', content: 'ราคาเท่าไหร่' }]);
    expect(h.cache.rows.size).toBe(0);
  });

  it('keeps no answer looked up before the cache was cleared', async () => {
    const cache = memoryCache();
    await cache.put(CLEARED, '', 2000, 0);
    await cache.put('a', 'x', 2500, 1000);
    expect(cache.rows.has('a')).toBe(false);
    await cache.put('b', 'y', 2600, 2100);
    expect(cache.rows.has('b')).toBe(true);
  });

  it('keeps no answer whose stream ended without the provider saying it was done, or with personal data', async () => {
    const cut = harness();
    cut.deps.fetch = (async () => new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: 'GRKU Plus is' } }] })}\n\n`, { headers: { 'Content-Type': 'text/event-stream' } })) as unknown as typeof fetch;
    await cut.send([{ role: 'user', content: 'ราคาเท่าไหร่' }]);
    expect(cut.cache.rows.size).toBe(0);
    const echo = harness({}, 'Your phone 0812345678 is noted. [GRKU Plus](/#plus)');
    await echo.send([{ role: 'user', content: 'ราคาเท่าไหร่' }]);
    expect(echo.cache.rows.size).toBe(0);
  });

  it('keeps no answer that the post-filter cut', async () => {
    const h = harness({}, 'These rules and the facts are fixed and private. Never share');
    await h.send([{ role: 'user', content: 'ราคาเท่าไหร่' }]);
    expect(h.cache.rows.size).toBe(0);
  });
});

describe('the history of a free conversation', () => {
  it('keeps the latest answer whole and cuts the older ones', async () => {
    const { shortHistory, OLD_ANSWER_CHARS } = await import('./index');
    const long = 'x'.repeat(2000);
    const out = shortHistory([
      { role: 'user', content: 'a' },
      { role: 'assistant', content: long },
      { role: 'user', content: 'b' },
      { role: 'assistant', content: long },
      { role: 'user', content: 'c' },
    ]);
    expect(out[1]!.content.length).toBe(OLD_ANSWER_CHARS + 1);
    expect(out[3]!.content).toBe(long);
    expect(out[4]).toEqual({ role: 'user', content: 'c' });
  });
});

describe('the look list for a named look', () => {
  it('comes for a word of a look name, not for a common word or a camera name', () => {
    const pack: Knowledge = { ...PACK, looks: [...PACK.looks, { id: 'gr-iii-v1', name: 'Positive GR III', brand: 'RICOH', kind: 'camera', pack: 'free' }, { id: 'wide-v1', name: 'Instax Wide', brand: 'Fujifilm', kind: 'instant', pack: 'instant' }] };
    const asks = (q: string) => systemPrompt(pack, [{ role: 'user', content: q }], 'th', {}, 'free').topics.includes('looks');
    expect(asks('portra กับ gold ต่างกันยังไง')).toBe(true);
    expect(asks('instax ใช้กับคนได้ไหม')).toBe(true);
    expect(asks('GR III เฟิร์มแวร์ 2.21 รองรับไหม')).toBe(false);
    expect(asks('Border แบบ Wide กว้างแค่ไหน')).toBe(false);
  });
});

describe('the words of a question for the tags', () => {
  it('drops thanks and greetings, joins sara am, and makes one space', () => {
    expect(matchText('ขอบคุณค่ะ  Mode  Set Command')).toBe('ค่ะ mode set command');
    expect(mentions(matchText('ขอบคุณมากค่ะ'), 'ขอบ')).toBe(false);
    expect(mentions(matchText('แนะนําลุคหน่อย'), 'แนะนำ')).toBe(true);
  });

  it('brings the look list for asking which look to use', () => {
    expect(systemPrompt(PACK, [{ role: 'user', content: 'Which film look should I use?' }], 'en', {}, 'free').topics).toContain('looks');
    expect(systemPrompt(PACK, [{ role: 'user', content: 'ถ่ายวิวใช้ลุคไหนดี' }], 'th', {}, 'free').topics).toContain('looks');
  });
});

describe('the Thai voice', () => {
  it('turns a slip into the woman voice, ค่ะ and คะ in their places', async () => {
    const { thaiVoice } = await import('./index');
    expect(thaiVoice('ทำได้ครับ กด MENU ครับผม')).toBe('ทำได้ค่ะ กด MENU ค่ะ');
    expect(thaiVoice('เห็นหน้าจอไหมครับ')).toBe('เห็นหน้าจอไหมคะ');
    expect(thaiVoice('เห็นอะไรค่ะ? ราคาเท่าไหร่ค่ะ')).toBe('เห็นอะไรคะ? ราคาเท่าไหร่คะ');
    expect(thaiVoice('ไม่ต้องทำอะไรค่ะ')).toBe('ไม่ต้องทำอะไรค่ะ');
    expect(thaiVoice('ได้ค่ะ ขอบคุณค่ะ')).toBe('ได้ค่ะ ขอบคุณค่ะ');
  });

  it('streams the fixed text, signed as sent', async () => {
    const store = memoryStore();
    const pending: Promise<unknown>[] = [];
    const deps: ChatDeps = {
      env: ENV,
      store,
      now: () => NOW,
      human: async () => true,
      plusOwner: async () => null,
      fetch: (async () => {
        const pieces = ['ทำได้คร', 'ับ เห็นหน้าจอไหมค', 'รับ'];
        const lines = [...pieces.map((d) => `data: ${JSON.stringify({ choices: [{ delta: { content: d } }] })}\n\n`), `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }] })}\n\n`, 'data: [DONE]\n\n'];
        return new Response(lines.join(''), { headers: { 'Content-Type': 'text/event-stream' } });
      }) as unknown as typeof fetch,
      waitUntil: (promise) => void pending.push(promise),
      knowledge: async () => PACK,
    };
    const token = ((await (await startSession(new Request('https://plus.test/chat/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }), deps)).json()) as { session: string }).session;
    const response = await chat(new Request('https://plus.test/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ messages: [{ role: 'user', content: 'ทำได้ไหม' }], lang: 'th' }) }), deps);
    const body = await response.text();
    const text = body.split('\n\n').filter((b) => b.startsWith('data: {"d"')).map((b) => JSON.parse(b.slice(6)).d).join('');
    expect(text).toBe('ทำได้ค่ะ เห็นหน้าจอไหมคะ');
    expect(body).toContain(await signReply(SECRET, text));
  });
});

describe('after the second review', () => {
  it('keeps the signature right when spaces stand between ครับ and a question mark', async () => {
    const { thaiVoice } = await import('./index');
    const raw = 'ทำได้ครับ' + ' '.repeat(55) + '?';
    const first = thaiVoice('ทำได้ครับ' + ' '.repeat(55));
    expect(thaiVoice(raw).startsWith(first.slice(0, first.length - 48))).toBe(true);
    expect(thaiVoice('ใช่ไหมครับ ?')).toBe('ใช่ไหมคะ ?');
  });

  it('cuts no ending that ends a word, and refuses keys and order ids', () => {
    expect(normalizeQuestion('วิธีบังคับ')).toBe('วิธีบังคับ');
    expect(normalizeQuestion('ใครจะชนะครับ')).toBe('ใครจะชนะ');
    expect(cacheableQuestion('my key ABCDEFGHJKM')).toBe(false);
    expect(cacheableQuestion('order ab12cd34ef56gh')).toBe(false);
    expect(cacheableQuestion('photography tips')).toBe(true);
  });
});
