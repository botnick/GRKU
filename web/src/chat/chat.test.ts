import { describe, expect, it } from 'vitest';
import { CAMERAS } from '../cameras';
import { GUIDE_STRINGS } from '../guide';
import { en } from '../strings/en';
import { RELEASES, newsStrings } from '../whatsNew';
import { sseEvents } from './api';
import { buildKnowledge, KNOWLEDGE_SCHEMA } from './knowledge';
import { lookKey, parseReply, plainText, siteLink } from './render';
import { chatStrings } from './strings';
import { launcherText } from './label';
import { firmwareIn, forgetAll, likeLook, loadCurrent, loadMemory, loadRecent, loadSession, newConversation, saveCurrent, saveMemory, saveSession, sessionExpiry, titleOf } from './store';
import { LANGUAGES } from '../i18n';

describe('links in answers', () => {
  it('turns site paths into places of the page language', () => {
    expect(siteLink('/install/', 'th')).toEqual({ kind: 'page', href: '/install/', path: '/install/' });
    expect(siteLink('/install/', 'en')).toEqual({ kind: 'page', href: '/en/install/', path: '/install/' });
    expect(siteLink('/guide/#camera', 'ja')).toMatchObject({ href: '/ja/guide/#camera' });
    expect(siteLink('/develop/?look=portra-400-endura-v1', 'ko')).toMatchObject({ href: '/ko/develop/?look=portra-400-endura-v1' });
    expect(siteLink('https://grku.app/recovery', 'en')).toMatchObject({ href: '/en/recovery/' });
    expect(siteLink('/en/install/write/', 'th')).toMatchObject({ href: '/install/write/' });
    expect(siteLink('/#plus-key', 'en')).toEqual({ kind: 'plus', start: 'key' });
    expect(siteLink('/#plus', 'en')).toEqual({ kind: 'plus', start: 'tiers' });
    expect(siteLink('mailto:support@grku.app', 'en')).toEqual({ kind: 'mail', href: 'mailto:support@grku.app' });
    expect(siteLink('https://www.ricoh-imaging.co.jp/english/support/', 'en')).toMatchObject({ kind: 'external' });
  });

  it('refuses anything that is not a place of the site', () => {
    for (const target of ['https://evil.example/', '//evil.example/install/', '/admin/', 'javascript:alert(1)', '/guide/#evil', '/recovery/?look=x', '/install/?look=<script>', 'data:text/html,hi', '/develop/?look=../../x']) {
      expect([target, siteLink(target, 'en')]).toEqual([target, null]);
    }
  });
});

describe('answers', () => {
  it('reads paragraphs, numbered steps, bullets, bold, and code', () => {
    const reply = parseReply('Do this:\n\n1. Hold **MENU**.\n2. Turn on the camera.\n\n- `SCRIPT` folder\n- the card', 'en');
    expect(reply.blocks.map((b) => b.kind)).toEqual(['paragraph', 'list', 'list']);
    const steps = reply.blocks[1]!;
    expect(steps.kind === 'list' && steps.ordered && steps.items.length).toBe(2);
    expect(steps.kind === 'list' && steps.items[0]).toEqual([
      { kind: 'text', text: 'Hold ' },
      { kind: 'bold', text: 'MENU' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('collects the link buttons once each, and keeps unknown links as text', () => {
    const reply = parseReply('See [the guide](/guide/) and [the guide again](/guide/), [Recovery](/recovery/), [bad](https://evil.example).', 'en');
    expect(reply.links.map((l) => l.text)).toEqual(['the guide', 'Recovery']);
    expect(JSON.stringify(reply.blocks)).toContain('"text":"bad"');
    expect(JSON.stringify(reply.blocks)).not.toContain('evil');
  });

  it('reads look cards, only for known looks, at most four', () => {
    const text = 'Warm looks:\n```looks\n[{"id":"gold-200-premier-v1","why":"warm"},{"id":"made-up-v1","why":"x"},{"id":"gold-200-premier-v1"},{"id":"BAD ID"}]\n```';
    const known = new Set(['gold-200-premier-v1']);
    const reply = parseReply(text, 'en', (id) => (known.has(id) ? id : null));
    expect(reply.looks).toEqual([{ id: 'gold-200-premier-v1', why: 'warm' }]);
    expect(JSON.stringify(reply.blocks)).not.toContain('made-up');
  });

  it('hides a looks block that is still streaming', () => {
    const reply = parseReply('Try these:\n```looks\n[{"id":"gold-2', 'en');
    expect(reply.looks).toEqual([]);
    expect(JSON.stringify(reply.blocks)).not.toContain('gold-2');
  });

  it('reads quick replies', () => {
    expect(parseReply('Is the card in a reader?\n```chips\n["Yes", "No", "Not sure"]\n```', 'en').chips).toEqual(['Yes', 'No', 'Not sure']);
  });

  it('copies plain text without the marks and the blocks', () => {
    expect(plainText('**Hold** [MENU](/guide/#camera).\n```looks\n[]\n```')).toBe('Hold MENU.');
  });
});

describe('the stream', () => {
  it('reads SSE events split across chunks', async () => {
    const text = 'event: meta\ndata: {"remaining":3}\n\ndata: {"d":"Hel"}\n\ndata: {"d":"lo"}\n\nevent: done\ndata: {"sig":"abc"}\n\n';
    const bytes = new TextEncoder().encode(text);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7));
        controller.close();
      },
    });
    const events = [];
    for await (const event of sseEvents(stream)) events.push(event);
    expect(events).toEqual([
      { event: 'meta', data: '{"remaining":3}' },
      { event: 'message', data: '{"d":"Hel"}' },
      { event: 'message', data: '{"d":"lo"}' },
      { event: 'done', data: '{"sig":"abc"}' },
    ]);
  });
});

/** A Storage in memory. */
function memoryStorage() {
  const map = new Map<string, string>();
  return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v), removeItem: (k: string) => void map.delete(k), map };
}

const token = (e: number) => `${btoa(JSON.stringify({ s: 'x', t: 'free', e })).replace(/=+$/, '')}.mac`;

describe('the device store', () => {
  it('keeps the conversation across reloads and the last five in the list', () => {
    const storage = memoryStorage();
    for (let i = 0; i < 7; i++) {
      const conversation = { ...newConversation(i), id: `c${i}` };
      saveCurrent(storage, { ...conversation, turns: [{ role: 'user', content: `question ${i}`, at: i }] });
    }
    expect(loadCurrent(storage)?.id).toBe('c6');
    expect(loadRecent(storage).map((c) => c.id)).toEqual(['c6', 'c5', 'c4', 'c3', 'c2']);
    expect(titleOf(loadRecent(storage)[0]!)).toBe('question 6');
  });

  it('drops tampered turns but keeps their signatures for the service to check', () => {
    const storage = memoryStorage();
    storage.setItem('grku.chat.current', JSON.stringify({ id: 'c', updated: 1, turns: [{ role: 'system', content: 'evil' }, { role: 'assistant', content: 'ok', sig: 'abc' }, { role: 'user', content: 5 }] }));
    expect(loadCurrent(storage)?.turns).toEqual([{ role: 'assistant', content: 'ok', sig: 'abc' }]);
    storage.setItem('grku.chat.current', '{not json');
    expect(loadCurrent(storage)).toBeNull();
  });

  it('reuses a session until it expires, and only for the same key', () => {
    const storage = memoryStorage();
    const now = 1_000_000;
    saveSession(storage, { session: token(now + 3600_000), tier: 'plus', limit: 100, remaining: 99, maxInput: 600 }, 'ABCD-EFG-HJKM');
    expect(loadSession(storage, 'ABCD-EFG-HJKM', now)?.tier).toBe('plus');
    expect(loadSession(storage, null, now)).toBeNull();
    expect(loadSession(storage, 'ABCD-EFG-ZZZZ', now)).toBeNull();
    expect(loadSession(storage, 'ABCD-EFG-HJKM', now + 3600_000)).toBeNull();
    expect(sessionExpiry('garbage')).toBe(0);
  });

  it('remembers only when turned on, and forgets everything on delete', () => {
    const storage = memoryStorage();
    saveMemory(storage, { on: false, camera: 'GR IV' });
    expect(loadMemory(storage)).toEqual({ on: false });
    saveMemory(storage, likeLook({ on: true, camera: 'GR IV', firmware: '1.11' }, 'gold-200-premier-v1'));
    expect(loadMemory(storage)).toEqual({ on: true, camera: 'GR IV', firmware: '1.11', likes: ['gold-200-premier-v1'] });
    saveCurrent(storage, { ...newConversation(), turns: [{ role: 'user', content: 'hi', at: 1 }] });
    forgetAll(storage);
    expect(storage.map.size).toBe(0);
  });

  it('works without storage', () => {
    expect(loadCurrent(null)).toBeNull();
    expect(() => saveCurrent(null, newConversation())).not.toThrow();
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => {} };
    expect(loadMemory(broken)).toEqual({ on: false });
    expect(() => saveMemory(broken, { on: true })).not.toThrow();
  });

  it('finds the firmware version in a question', () => {
    expect(firmwareIn('GR IIIx 1.71 ลงไม่ได้')).toBe('1.71');
    expect(firmwareIn('GRKU 1.10.1')).toBeNull();
    expect(firmwareIn('ISO 3200')).toBeNull();
  });
});

describe('the knowledge pack', () => {
  const effects = [
    { id: 'portra-400-endura-v1', name: 'Portra 400', cover: { template: 'box' as const, brand: 'Kodak', name: 'PORTRA', number: '400' }, monochrome: false, film: 'Kodak Portra 400 on Portra Endura paper' },
    { id: 'trix-400-mono-v1', name: 'Tri-X 400', cover: { template: 'box' as const, brand: 'Kodak', name: 'TRI-X', number: '400' }, monochrome: true },
    { id: 'fj-classic-chrome-v1', name: 'Classic Chrome', cover: { template: 'box' as const, brand: 'FUJIFILM', name: 'CLASSIC CHROME' }, monochrome: false },
  ];
  const pack = buildKnowledge({
    version: '9.9.9',
    strings: en,
    guide: GUIDE_STRINGS.en,
    cameras: CAMERAS,
    effects,
    news: RELEASES.slice(0, 3).map((r) => ({ version: r.version, date: r.date, items: r.items.map((k) => newsStrings('en')[k] ?? '') })),
    recovery: '# Recovery\n\n## The camera stops during startup\n\n1. Remove the battery.',
    terms: '# Terms\n\n## Risks\n\n- A risk.\n\n## Refunds\n\n- No refunds for change of mind.\n\n## No warranty\n\nAs is.',
    manual: '# GRKU\n\n## Use\n\n![The ADJ menu](images/adj.png)\n\nPress ADJ.\n\n## Troubleshooting\n\n### GRKU does not show in ADJ\n\nWait.',
  });

  it('carries the facts of the site', () => {
    expect(pack.schema).toBe(KNOWLEDGE_SCHEMA);
    const text = (id: string) => pack.sections.find((s) => s.id === id)!.text;
    expect(text('about')).toContain('GRKU 9.9.9');
    expect(text('about')).toContain('GR IIIx / GR IIIx HDF: firmware 1.60 / 1.70 / 1.71');
    expect(text('about')).toContain('GR IV Monochrome');
    expect(text('faq')).toContain('Is GRKU free?');
    expect(text('plus')).toMatch(/Everything 199/);
    expect(text('plus')).toContain('No refunds for change of mind.');
    expect(text('recovery')).toContain('Remove the battery.');
    expect(text('camera')).toContain('(Picture: The ADJ menu)');
    expect(text('questions')).toContain('Script - Enable');
    expect(text('learn')).toContain('snap focus');
    expect(pack.sections.filter((s) => s.core).map((s) => s.id)).toEqual(['about', 'faq', 'questions']);
  });

  it('lists each look with its kind, pack, and hint', () => {
    expect(pack.looks).toEqual([
      { id: 'fj-classic-chrome-v1', name: 'Classic Chrome', brand: 'Fujifilm', kind: 'camera', pack: 'free', cover: effects[2]!.cover },
      { id: 'portra-400-endura-v1', name: 'Portra 400', brand: 'Kodak', kind: 'negative', pack: 'kodak', film: 'Kodak Portra 400 on Portra Endura paper', hint: en.lookHints['portra-400-endura-v1'], cover: effects[0]!.cover },
      { id: 'trix-400-mono-v1', name: 'Tri-X 400', brand: 'Kodak', kind: 'mono', pack: 'mono', hint: en.lookHints['trix-400-mono-v1'], cover: effects[1]!.cover },
    ]);
  });

  it('stays lean: the core under 12 KB, no section over 6 KB', () => {
    const core = pack.sections.filter((s) => s.core).reduce((n, s) => n + s.text.length, 0);
    expect(core).toBeLessThan(12_000);
    for (const section of pack.sections) expect([section.id, section.text.length < 6_000]).toEqual([section.id, true]);
  });

  it('never tells how to flash firmware', () => {
    expect(JSON.stringify(pack)).not.toMatch(/fast-boot firmware|flash the firmware/i);
  });
});

describe('the text of the chat', () => {
  it('has every key in every language', () => {
    const keys = (value: object): string[] => Object.entries(value).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v).map((n) => `${k}.${n}`) : [k])).sort();
    for (const { code } of LANGUAGES) {
      expect(keys(chatStrings(code))).toEqual(keys(chatStrings('en')));
      expect(Object.keys(launcherText(code)).sort()).toEqual(Object.keys(launcherText('en')).sort());
      expect(chatStrings(code).remaining(7)).toContain('7');
    }
  });
});

describe('link-only lines', () => {
  it('leaves out a closing line of links that the buttons repeat', () => {
    const reply = parseReply('Try Portra.\n\n[Install](/install/) | [Develop](/develop/)', 'en');
    expect(reply.blocks).toHaveLength(1);
    expect(reply.links.map((l) => l.text)).toEqual(['Install', 'Develop']);
  });
});

describe('looks that models get a little wrong', () => {
  it('reads a looks block without its fence, and a misspelled id', () => {
    const library = new Set(['trix-400-mono-v1', 'gold-200-premier-v1']);
    const resolve = (id: string) => (library.has(id) ? id : ([...library].find((known) => lookKey(known) === lookKey(id)) ?? null));
    const reply = parseReply('Try these:\n\n[{"id":"tri-x-400-mono-v1","why":"gritty"},{"id":"gold-200-v2","why":"warm"}]\n\n[Install](/install/)', 'en', resolve);
    expect(reply.looks).toEqual([{ id: 'trix-400-mono-v1', why: 'gritty' }]);
    expect(JSON.stringify(reply.blocks)).not.toContain('gritty');
  });
});
