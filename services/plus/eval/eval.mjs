// Runs the test set of the GRKU assistant (cases.mjs) against a running Worker and scores it.
// Usage: node eval/eval.mjs BASE_URL OUT_DIR [--tier plus --key KEY] [--only real,teach] [--gap MS]
// The Worker must run without TURNSTILE_SECRET (wrangler dev) and with limits high enough for the
// set. Writes OUT_DIR/eval-<tier>.json and .md: each answer, its checks, the time, the score.
import fs from 'node:fs';
import { CASES, LEAK } from './cases.mjs';

const [base, out, ...rest] = process.argv.slice(2);
if (!base || !out) throw new Error('usage: eval.mjs BASE_URL OUT_DIR [--tier plus --key KEY] [--only sets] [--gap ms]');
const flag = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
const tier = flag('tier') ?? 'free';
const only = flag('only')?.split(',');
const gap = Number(flag('gap') ?? 4000);
const cases = CASES.filter((c) => !only || only.includes(c.set));

async function session() {
  const response = await fetch(`${base}/chat/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: flag('key') }) });
  const body = await response.json();
  if (!body.session) throw new Error(`session: ${JSON.stringify(body)}`);
  if (body.tier !== tier) throw new Error(`asked for ${tier}, got ${body.tier}`);
  return body.session;
}

async function askOnce(token, q, lang) {
  const started = Date.now();
  const response = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: [{ role: 'user', content: q }], lang, context: { page: 'home' } }),
  });
  if (!response.ok) return { status: response.status, error: (await response.json().catch(() => ({}))).error, text: '', ms: Date.now() - started };
  const raw = await response.text();
  let text = '', fixed = null, replaced = false, first = null;
  for (const block of raw.split('\n\n')) {
    const event = /^event: (.*)$/m.exec(block)?.[1] ?? 'message';
    const data = /^data: (.*)$/m.exec(block)?.[1];
    if (!data) continue;
    const parsed = JSON.parse(data);
    if (event === 'message') { text += parsed.d; first ??= Date.now() - started; }
    if (event === 'replace') { text = parsed.text; replaced = true; }
    if (event === 'done') fixed = parsed.fixed ?? null;
    if (event === 'error') return { status: 200, error: parsed.code, text, ms: Date.now() - started };
  }
  return { status: 200, text, fixed, replaced, ms: Date.now() - started, first };
}

const links = (text) => [...text.matchAll(/\]\(([/#][^)\s]*)\)/g)].map((m) => (m[1].startsWith('#') ? `/${m[1]}` : m[1]));
const test = (pattern, text) => new RegExp(pattern, 'iu').test(text);

function check(c, r) {
  const notes = [];
  const expect = c.expect ?? 'answer';
  if (expect === 'error') return { pass: r.status === 413, notes: [`status ${r.status}`] };
  if (r.error) return { pass: false, notes: [`error ${r.error}`] };
  if (expect !== 'answer') {
    if (r.fixed !== expect) notes.push(`expected fixed ${expect}, got ${r.fixed ?? 'model answer'}`);
  } else if (r.fixed) notes.push(`refused (${r.fixed}) instead of answering`);
  for (const pattern of c.must ?? []) if (!test(pattern, r.text)) notes.push(`missing /${pattern}/`);
  for (const pattern of [...(c.never ?? []), ...LEAK]) if (test(pattern, r.text)) notes.push(`has /${pattern}/`);
  if (c.links && !links(r.text).some((l) => c.links.some((want) => l === want || l.startsWith(want)))) notes.push(`no link of ${c.links.join(' ')} (has ${links(r.text).join(' ') || 'none'})`);
  if (expect === 'answer' && !r.fixed && links(r.text).length === 0) notes.push('no link button');
  return { pass: notes.length === 0, notes };
}

fs.mkdirSync(out, { recursive: true });
const results = [];
let token = await session();
for (const c of cases) {
  let r = await askOnce(token, c.q, c.lang ?? (/[฀-๿]/.test(c.q) ? 'th' : 'en'));
  if (r.error === 'no session') { token = await session(); r = await askOnce(token, c.q, 'th'); }
  const verdict = check(c, r);
  results.push({ ...c, ...r, ...verdict });
  console.log(`${verdict.pass ? 'PASS' : 'FAIL'} ${c.id} ${r.ms}ms ${verdict.notes.join('; ')}`);
  await new Promise((resolve) => setTimeout(resolve, r.fixed || r.error ? 200 : gap));
}
const by = (set) => results.filter((r) => r.set === set);
const score = (list) => `${list.filter((r) => r.pass).length}/${list.length}`;
const sets = [...new Set(results.map((r) => r.set))];
const answered = results.filter((r) => !r.fixed && !r.error);
const median = (list) => { const s = [...list].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const summary = `Tier ${tier}: ${score(results)} pass (${sets.map((s) => `${s} ${score(by(s))}`).join(', ')}); model answers ${answered.length}, median ${median(answered.map((r) => r.ms))} ms, median first text ${median(answered.map((r) => r.first ?? 0))} ms`;
console.log(summary);
fs.writeFileSync(`${out}/eval-${tier}.json`, JSON.stringify({ summary, results }, null, 1));
const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ⏎ ');
fs.writeFileSync(
  `${out}/eval-${tier}.md`,
  `# GRKU assistant eval (${tier})\n\n${summary}\n\n| id | question | result | ms | answer | notes |\n|---|---|---|---|---|---|\n` +
    results.map((r) => `| ${r.id} | ${cell(r.q).slice(0, 80)} | ${r.pass ? 'PASS' : 'FAIL'}${r.fixed ? ` (${r.fixed})` : ''} | ${r.ms} | ${cell(r.text)} | ${cell(r.notes.join('; '))} |`).join('\n') +
    '\n',
);
