/**
 * The admin page: one self-contained HTML document (inline CSS and JS under a CSP nonce). The
 * text is Thai (th.json, made through Gemini and checked through MaxPlus). The script builds the
 * DOM with textContent only, so no data from the database becomes markup.
 */
import TH from './th.json';

const STYLE = /* css */ `
:root{--bg:#f5f4f1;--card:#fff;--ink:#17171a;--ink2:#3d3d42;--muted:#6f6e73;--line:#e7e4df;--soft:#efede9;--red:#e4312b;--red-soft:#fde9e7;--ok:#1d7f4a;--ok-soft:#e3f3ea;--warn:#a85d00;--warn-soft:#fbf0dd;--bad:#c22a22;--bad-soft:#fbe5e3;--shadow:0 1px 2px rgba(0,0,0,.04),0 4px 16px rgba(0,0,0,.04);color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#0f0f11;--card:#18181b;--ink:#f2f1ee;--ink2:#d0cfcb;--muted:#9b9aa0;--line:#2a2a2f;--soft:#222226;--red:#ff4a43;--red-soft:#3a1715;--ok:#4fc685;--ok-soft:#14301f;--warn:#f0a640;--warn-soft:#33260f;--bad:#ff6b63;--bad-soft:#3a1715;--shadow:none}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 "IBM Plex Sans Thai","IBM Plex Sans",-apple-system,"Segoe UI",Roboto,"Noto Sans Thai",sans-serif}
button,input,select{font:inherit;color:inherit}
.mono{font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace}
.dot{display:inline-block;width:.62em;height:.62em;border-radius:50%;background:var(--red);margin-right:.45em;vertical-align:.05em}
.brand{font-weight:700;letter-spacing:.02em;display:flex;align-items:center;gap:.1em;font-size:17px}
.brand small{font-weight:500;color:var(--muted);margin-left:.4em;font-size:14px}
[hidden]{display:none!important}
/* sign-in */
.login{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px 16px}
.login form{width:100%;max-width:360px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:28px 24px;box-shadow:var(--shadow)}
.login .brand{font-size:22px;margin-bottom:22px}
.field{display:block;margin-bottom:14px}
.field span{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}
input[type=password],input[type=search],input[type=text],input[type=number]{width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--bg);outline:none;font-size:16px}
input:focus{border-color:var(--ink2);box-shadow:0 0 0 3px color-mix(in srgb,var(--ink) 10%,transparent)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line);background:var(--card);border-radius:11px;padding:9px 14px;cursor:pointer;font-weight:500;font-size:14px;white-space:nowrap;transition:background .15s,border-color .15s}
.btn:hover{background:var(--soft)}
.btn:disabled{opacity:.55;cursor:default}
.btn.primary{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.btn.primary:hover{opacity:.9}
.btn.danger{color:var(--bad);border-color:color-mix(in srgb,var(--bad) 35%,var(--line))}
.btn.block{width:100%;padding:12px}
.btn.ghost{border-color:transparent;background:transparent;color:var(--muted)}
.btn.ghost:hover{background:var(--soft);color:var(--ink)}
.msg{min-height:1.5em;margin:10px 0 0;font-size:14px;color:var(--bad)}
.note{font-size:12.5px;color:var(--muted);margin:14px 0 0;line-height:1.5}
/* frame */
header{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:saturate(1.4) blur(12px);-webkit-backdrop-filter:saturate(1.4) blur(12px);border-bottom:1px solid var(--line)}
.bar{max-width:1080px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:10px}
.bar .grow{flex:1}
nav{max-width:1080px;margin:0 auto;padding:0 12px;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
nav::-webkit-scrollbar{display:none}
nav button{border:0;background:none;padding:10px 12px 12px;cursor:pointer;color:var(--muted);font-weight:500;border-bottom:2px solid transparent;white-space:nowrap;display:flex;align-items:center;gap:6px}
nav button[aria-selected=true]{color:var(--ink);border-bottom-color:var(--red)}
nav .badge{background:var(--bad);color:#fff;border-radius:99px;font-size:11px;padding:0 6px;line-height:17px}
main{max-width:1080px;margin:0 auto;padding:20px 16px 80px}
h2{font-size:13px;font-weight:600;color:var(--muted);margin:28px 0 10px;letter-spacing:.01em}
h2:first-child{margin-top:0}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow)}
.pad{padding:16px 18px}
/* stats */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.stat{padding:16px 18px}
.stat .label{font-size:13px;color:var(--muted)}
.stat .value{font-size:30px;font-weight:700;letter-spacing:-.01em;line-height:1.2;margin-top:4px;font-variant-numeric:tabular-nums}
.stat .value small{font-size:15px;font-weight:500;color:var(--muted);margin-left:4px}
.stat .sub{font-size:13px;color:var(--muted);margin-top:2px}
.stat.hero{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.stat.hero .label,.stat.hero .sub,.stat.hero .value small{color:color-mix(in srgb,var(--bg) 70%,transparent)}
.minis{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:12px;font-size:13.5px;color:var(--muted)}
.minis b{color:var(--ink);font-weight:600;font-variant-numeric:tabular-nums}
.chart{display:flex;align-items:flex-end;gap:3px;height:120px;padding-top:8px}
.chart div{flex:1;background:var(--soft);border-radius:4px 4px 1px 1px;min-height:3px;position:relative;cursor:default}
.chart div.on{background:var(--red)}
.chart div:hover,.chart div.pick{outline:2px solid var(--ink);outline-offset:1px}
.axis{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:6px}
.caption{font-size:13.5px;margin-top:8px;min-height:1.5em;color:var(--ink2);font-variant-numeric:tabular-nums}
.tiers{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin-top:4px}
.tier{display:flex;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:11px;background:var(--soft);font-size:14px}
.tier b{font-variant-numeric:tabular-nums}
.seg{display:inline-flex;background:var(--soft);border-radius:11px;padding:3px;gap:2px}
.seg button{border:0;background:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13.5px;color:var(--muted)}
.seg button[aria-pressed=true]{background:var(--card);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.08);font-weight:500}
.row-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:28px 0 10px;flex-wrap:wrap}
.row-head h2{margin:0}
/* lists */
.list{list-style:none;margin:0;padding:0}
.list>li{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:12px 18px;border-top:1px solid var(--line);align-items:center}
.list>li:first-child{border-top:0}
.list>li.click{cursor:pointer}
.list>li.click:hover{background:var(--soft)}
.list .main{font-weight:500;overflow-wrap:anywhere;min-width:0}
.list .meta{font-size:13px;color:var(--muted);overflow-wrap:anywhere}
.list .end{text-align:right;font-variant-numeric:tabular-nums;font-weight:600;grid-row:span 2}
.list .end .pill{margin-top:4px}
.pill{display:inline-block;font-size:12px;font-weight:600;border-radius:99px;padding:1px 9px;line-height:20px;white-space:nowrap}
.pill.paid{background:var(--ok-soft);color:var(--ok)}
.pill.open{background:var(--warn-soft);color:var(--warn)}
.pill.expired{background:var(--soft);color:var(--muted)}
.pill.bad{background:var(--bad-soft);color:var(--bad)}
.pill.red{background:var(--red-soft);color:var(--red)}
.pill.plain{background:var(--soft);color:var(--ink2)}
.empty{padding:36px 18px;text-align:center;color:var(--muted);font-size:14px}
.skeleton{height:14px;border-radius:6px;background:linear-gradient(90deg,var(--soft),var(--line),var(--soft));background-size:200% 100%;animation:sk 1.2s linear infinite;margin:6px 0}
@keyframes sk{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.skeleton{animation:none}}
/* customers */
.searchbox{display:flex;gap:8px;margin-bottom:12px}
#results>.card{margin-top:12px}
#results>.card:first-child{margin-top:0}
.searchbox input{flex:1}
.cust{overflow:hidden}
.cust-head{display:flex;align-items:center;gap:12px;padding:14px 18px;cursor:pointer;width:100%;border:0;background:none;text-align:left}
.cust-head:hover{background:var(--soft)}
.avatar{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:700;background:var(--soft);color:var(--ink2);text-transform:uppercase}
.avatar.plus{background:var(--red-soft);color:var(--red)}
.cust-head .who{flex:1;min-width:0}
.cust-head .email{font-weight:600;overflow-wrap:anywhere}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
.cust-head .total{font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.cust-body{border-top:1px solid var(--line);padding:16px 18px;display:grid;gap:16px}
.keybox{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:14px 16px;border-radius:14px;background:var(--soft)}
.keybox .k{font-size:22px;font-weight:600;letter-spacing:.08em;flex:1;min-width:200px;user-select:all}
.keybox .none{color:var(--muted);flex:1}
.actions{display:flex;flex-wrap:wrap;gap:8px}
.facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px 18px;font-size:14px}
.facts dt{font-size:12.5px;color:var(--muted)}
.facts dd{margin:2px 0 0;overflow-wrap:anywhere}
.mailnote{display:flex;gap:8px;align-items:baseline;font-size:14px;flex-wrap:wrap}
.mailnote .err{color:var(--bad);font-size:13px;overflow-wrap:anywhere}
.sub-list{border:1px solid var(--line);border-radius:12px;overflow:hidden}
/* chat */
.switch{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.switch .state{display:flex;align-items:center;gap:10px;font-weight:600;font-size:17px;flex:1}
.lamp{width:11px;height:11px;border-radius:50%;background:var(--muted)}
.lamp.on{background:var(--ok);box-shadow:0 0 0 4px var(--ok-soft)}
.lamp.off{background:var(--bad);box-shadow:0 0 0 4px var(--bad-soft)}
.meter{height:8px;border-radius:99px;background:var(--soft);overflow:hidden;margin-top:6px}
.meter i{display:block;height:100%;background:var(--ink2);border-radius:99px}
.meter i.hot{background:var(--warn)}
.meter i.full{background:var(--bad)}
.limits{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.limits label span{display:flex;justify-content:space-between;gap:6px;font-size:13px;color:var(--muted);margin-bottom:6px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
/* toast */
#toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;background:var(--ink);color:var(--bg);padding:11px 18px;border-radius:12px;font-size:14px;font-weight:500;transition:opacity .2s,transform .2s;pointer-events:none;max-width:calc(100% - 32px);z-index:20;box-shadow:0 8px 24px rgba(0,0,0,.2)}
#toast.show{opacity:1;transform:translate(-50%,0)}
#toast.bad{background:var(--bad);color:#fff}
@media (max-width:720px){
  .stats{grid-template-columns:1fr 1fr}
  .stats .stat.hero{grid-column:1/-1}
  .stat .value{font-size:26px}
  .grid2{grid-template-columns:1fr}
  .bar .who-label{display:none}
  .list>li{padding:12px 14px}
  .cust-head{padding:12px 14px}
  .cust-body{padding:14px}
  .keybox .k{font-size:19px;min-width:0}
  .facts{grid-template-columns:1fr 1fr}
  main{padding-top:16px}
}
`;

const SCRIPT = /* js */ `
'use strict';
const T = JSON.parse(document.getElementById('t').textContent);
const $ = (s, el = document) => el.querySelector(s);
const tr = (k, vars = {}) => (T[k] ?? k).replace(/\\$\\{(\\w+)\\}/g, (_, n) => String(vars[n] ?? ''));
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}
const TZ = 'Asia/Bangkok';
const fmtTime = new Intl.DateTimeFormat('th-TH', { timeZone: TZ, day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const fmtDay = new Intl.DateTimeFormat('th-TH', { timeZone: TZ, day: 'numeric', month: 'short' });
const time = (ms) => (ms ? fmtTime.format(new Date(ms)) : '–');
const num = (n) => Number(n || 0).toLocaleString('th-TH', { maximumFractionDigits: 2 });
const baht = (n) => tr('baht', { n: num(n) });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function tierLabel(t) {
  if (t === 'plus') return tr('plusTier');
  if (t === 'slots25') return tr('slots25');
  if (t.startsWith('pack:')) return tr('pack', { name: cap(t.slice(5)) });
  return t;
}
const statusLabel = { paid: tr('statusPaid'), open: tr('statusOpen'), expired: tr('statusExpired') };
const pill = (status) => h('span', { class: 'pill ' + status }, statusLabel[status] || status);

let toastTimer;
function toast(text, bad) {
  const el = $('#toast');
  el.textContent = text;
  el.className = 'show' + (bad ? ' bad' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = bad ? 'bad' : ''), 2600);
}

async function api(path, body) {
  const init = body === undefined ? { credentials: 'same-origin' } : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
  let res;
  try { res = await fetch(path, init); } catch { throw new Error(tr('error')); }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path.startsWith('/admin/api/')) { showLogin(tr('sessionEnded')); throw new Error('signed out'); }
  if (!res.ok && !(data && data.ok === false)) { const e = new Error(data.error || tr('error')); e.data = data; e.status = res.status; throw e; }
  return data;
}

async function copy(text, done) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = h('textarea', { style: 'position:fixed;opacity:0' }, text);
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  toast(done);
}

// ---- sign-in ----
function showLogin(message) {
  $('#app').hidden = true;
  $('#login').hidden = false;
  $('#login-msg').textContent = message || '';
  setTimeout(() => $('#password').focus(), 30);
}
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#login-btn');
  const msg = $('#login-msg');
  btn.disabled = true; msg.textContent = '';
  try {
    await api('/admin/login', { password: $('#password').value });
    $('#password').value = '';
    start();
  } catch (err) {
    const d = err.data || {};
    const minutes = Math.max(1, Math.ceil((d.retryAfter || 60) / 60));
    msg.textContent = err.message === 'locked' ? tr('locked', { minutes }) : err.message === 'too many' ? tr('tooMany', { minutes }) : err.message === 'wrong password' ? (d.left > 0 ? tr('leftTries', { n: d.left }) : tr('wrongPassword')) : err.message;
    $('#password').select();
  } finally { btn.disabled = false; }
});
$('#logout').addEventListener('click', async () => { await api('/admin/logout', {}).catch(() => {}); showLogin(''); });

// ---- tabs ----
const TABS = ['sales', 'customers', 'mail', 'chat'];
let tab = 'sales';
try { const saved = localStorage.getItem('grku-admin-tab'); if (TABS.includes(saved)) tab = saved; } catch {}
const loaded = {};
function select(name, force) {
  tab = name;
  try { localStorage.setItem('grku-admin-tab', name); } catch {}
  for (const b of document.querySelectorAll('nav button')) b.setAttribute('aria-selected', String(b.dataset.tab === name));
  for (const t of TABS) $('#tab-' + t).hidden = t !== name;
  if (force || !loaded[name]) { loaded[name] = true; LOAD[name](); }
  if (name === 'customers') setTimeout(() => $('#q').focus(), 30);
}
for (const b of document.querySelectorAll('nav button')) b.addEventListener('click', () => select(b.dataset.tab));
$('#refresh').addEventListener('click', () => { for (const k of Object.keys(loaded)) delete loaded[k]; select(tab, true); refreshMailBadge(); });

const skeleton = (n = 3) => h('div', { class: 'pad' }, Array.from({ length: n }, (_, i) => h('div', { class: 'skeleton', style: 'width:' + (90 - i * 17) + '%' })));
const failBox = (retry) => h('div', { class: 'empty' }, tr('error'), h('div', { style: 'margin-top:10px' }, h('button', { class: 'btn', onclick: retry }, tr('refresh'))));

// ---- sales ----
let orderFilter = 'all';
async function loadSales() {
  const box = $('#sales');
  box.replaceChildren(h('div', { class: 'card' }, skeleton(4)));
  let s;
  try { s = await api('/admin/api/sales'); } catch (e) { if (e.message !== 'signed out') box.replaceChildren(h('div', { class: 'card' }, failBox(loadSales))); return; }
  const stat = (label, p, hero) => h('div', { class: 'card stat' + (hero ? ' hero' : '') },
    h('div', { class: 'label' }, label),
    h('div', { class: 'value' }, num(p.baht), h('small', null, '฿')),
    h('div', { class: 'sub' }, tr('ordersCount', { n: p.n })));
  const max = Math.max(1, ...s.days.map((d) => d.baht));
  const caption = h('div', { class: 'caption' });
  const pick = (d, el) => { for (const x of el.parentNode.children) x.classList.remove('pick'); el.classList.add('pick'); caption.textContent = fmtDay.format(new Date(d.day)) + ' · ' + baht(d.baht) + ' · ' + tr('ordersCount', { n: d.n }); };
  const bars = s.days.map((d) => { const el = h('div', { class: d.baht > 0 ? 'on' : '', style: 'height:' + Math.max(3, Math.round((d.baht / max) * 100)) + '%', title: fmtDay.format(new Date(d.day)) + ' ' + baht(d.baht) }); el.addEventListener('mouseenter', () => pick(d, el)); el.addEventListener('click', () => pick(d, el)); return el; });
  const tiers = Object.entries(s.d30.tiers).sort((a, b) => b[1].baht - a[1].baht);
  box.replaceChildren(
    h('div', { class: 'stats' }, stat(tr('today'), s.today, true), stat(tr('last7'), s.d7), stat(tr('last30'), s.d30)),
    h('div', { class: 'minis' },
      h('span', null, tr('allTime') + ' ', h('b', null, baht(s.allTime.baht)), ' · ' + tr('ordersCount', { n: s.allTime.n })),
      h('span', null, tr('buyers') + ' ', h('b', null, num(s.buyers))),
      h('span', null, tr('openNow') + ' ', h('b', null, num(s.openNow)))),
    h('h2', null, tr('dailySales')),
    h('div', { class: 'card pad' }, h('div', { class: 'chart' }, bars),
      h('div', { class: 'axis' }, h('span', null, fmtDay.format(new Date(s.days[0].day))), h('span', null, tr('today'))), caption),
    h('h2', null, tr('byTier') + ' · ' + tr('last30')),
    tiers.length ? h('div', { class: 'tiers' }, tiers.map(([t, v]) => h('div', { class: 'tier' }, h('span', null, tierLabel(t), h('span', { style: 'color:var(--muted)' }, ' ×' + v.n)), h('b', null, baht(v.baht)))))
      : h('div', { class: 'card empty' }, tr('noSales')));
}
async function loadOrders() {
  const box = $('#orders');
  box.replaceChildren(skeleton(5));
  let data;
  try { data = await api('/admin/api/orders?status=' + orderFilter); } catch (e) { if (e.message !== 'signed out') box.replaceChildren(failBox(loadOrders)); return; }
  if (!data.orders.length) return box.replaceChildren(h('div', { class: 'empty' }, tr('noOrders')));
  box.replaceChildren(h('ul', { class: 'list' }, data.orders.map((o) => orderRow(o, false))));
}
function orderRow(o, inCustomer) {
  const who = o.owner.startsWith('anon:') ? tr('anonymous') : o.owner;
  const meta = [tierLabel(o.tier), time(o.created)];
  if (o.payer) meta.push(tr('payer') + ' ' + o.payer);
  const li = h('li', { class: inCustomer ? '' : 'click', title: inCustomer ? null : tr('openCustomer') },
    h('div', { class: 'main' }, inCustomer ? tierLabel(o.tier) : who),
    h('div', { class: 'end' }, baht(o.amount), h('div', null, pill(o.status))),
    h('div', { class: 'meta' }, (inCustomer ? [time(o.created)].concat(o.paid_at ? [tr('paidAt') + ' ' + time(o.paid_at)] : [], o.payer ? [tr('payer') + ' ' + o.payer] : []) : meta).join(' · '), h('span', { class: 'mono' }, ' · ' + o.id)));
  if (!inCustomer) li.addEventListener('click', () => { $('#q').value = o.owner.startsWith('anon:') ? o.id : o.owner; select('customers'); runSearch(); });
  return li;
}
for (const b of document.querySelectorAll('#order-filter button')) b.addEventListener('click', () => {
  orderFilter = b.dataset.f;
  for (const x of document.querySelectorAll('#order-filter button')) x.setAttribute('aria-pressed', String(x === b));
  loadOrders();
});

// ---- customers ----
let searchSeq = 0;
async function runSearch() {
  const q = $('#q').value.trim();
  const box = $('#results');
  if (q.length < 2) return box.replaceChildren(h('div', { class: 'card empty' }, tr('searchHint')));
  const seq = ++searchSeq;
  box.replaceChildren(h('div', { class: 'card cust' }, skeleton(3)));
  let data;
  try { data = await api('/admin/api/search?q=' + encodeURIComponent(q)); } catch (e) { if (e.message !== 'signed out' && seq === searchSeq) box.replaceChildren(h('div', { class: 'card' }, failBox(runSearch))); return; }
  if (seq !== searchSeq) return;
  if (!data.customers.length) return box.replaceChildren(h('div', { class: 'card empty' }, tr('noResults')));
  box.replaceChildren(...data.customers.map((c) => customerCard(c, data.customers.length === 1)));
}
function chipsOf(c) {
  const e = c.entitlement;
  const chips = [];
  if (e.plus) chips.push(h('span', { class: 'pill red' }, tr('plusTier')));
  for (const p of e.packs) chips.push(h('span', { class: 'pill plain' }, tr('pack', { name: cap(p) })));
  if (!e.plus && e.slots > 10) chips.push(h('span', { class: 'pill plain' }, tr('slotsN', { n: e.slots })));
  if (!chips.length) chips.push(h('span', { class: 'pill expired' }, tr('free')));
  return chips;
}
function customerCard(c, open) {
  const body = h('div', { class: 'cust-body' });
  const head = h('button', { class: 'cust-head', 'aria-expanded': String(!!open) },
    h('span', { class: 'avatar' + (c.entitlement.plus ? ' plus' : '') }, c.email ? c.email[0] : '?'),
    h('span', { class: 'who' }, h('div', { class: 'email' }, c.email || tr('anonymous')), h('div', { class: 'chips' }, chipsOf(c))),
    h('span', { class: 'total' }, baht(c.entitlement.paid)));
  const card = h('div', { class: 'card cust' }, head, body);
  body.hidden = !open;
  head.addEventListener('click', () => { body.hidden = !body.hidden; head.setAttribute('aria-expanded', String(!body.hidden)); });
  const actions = h('div', { class: 'actions' });
  if (c.key) {
    actions.append(
      h('button', { class: 'btn', onclick: () => copy(c.key, tr('keyCopied')) }, tr('copyKey')),
      h('button', { class: 'btn primary', onclick: () => copy(tr('customerMessage', { key: c.key }), tr('messageCopied')) }, tr('copyMessage')));
  }
  if (c.email) {
    const resend = h('button', { class: 'btn' }, tr('resend'));
    resend.addEventListener('click', async () => {
      if (!confirm(tr('resendConfirm', { email: c.email }))) return;
      resend.disabled = true; resend.textContent = tr('sending');
      try {
        const r = await api('/admin/api/resend', { owner: c.email });
        if (r.ok) toast(tr('sent')); else toast(tr('sendFailed', { error: r.error || '' }), true);
        loaded.mail = false; refreshMailBadge();
        const again = await api('/admin/api/search?q=' + encodeURIComponent(c.owner));
        const fresh = again.customers.find((x) => x.owner === c.owner);
        if (fresh) card.replaceWith(customerCard(fresh, true));
      } catch (e) { if (e.message !== 'signed out') toast(tr('sendFailed', { error: e.message }), true); }
      finally { resend.disabled = false; resend.textContent = tr('resend'); }
    });
    actions.append(resend);
  }
  const m = c.lastMail;
  body.append(
    h('div', { class: 'keybox' }, c.key ? h('span', { class: 'k mono' }, c.key) : h('span', { class: 'none' }, tr('noKey')), actions),
    h('dl', { class: 'facts' },
      h('div', null, h('dt', null, tr('owner')), h('dd', { class: c.email ? '' : 'mono' }, c.owner)),
      h('div', null, h('dt', null, tr('paidTotal')), h('dd', null, baht(c.entitlement.paid))),
      h('div', null, h('dt', null, tr('keyCreated')), h('dd', null, time(c.keyCreated))),
      h('div', null, h('dt', null, tr('customerSince')), h('dd', null, time(c.entitlement.updated)))),
    h('div', { class: 'mailnote' }, h('b', null, tr('lastMail')),
      m ? [h('span', { class: 'pill ' + (m.ok ? 'paid' : 'bad') }, m.ok ? tr('mailOk') : tr('mailFailed')), h('span', { style: 'color:var(--muted);font-size:13px' }, time(m.created) + ' · ' + kindLabel(m.kind)), m.error ? h('div', { class: 'err' }, m.error) : null]
        : h('span', { style: 'color:var(--muted)' }, tr('never'))),
    c.orders.length ? h('div', null, h('h2', { style: 'margin:0 0 8px' }, tr('orders') + ' · ' + c.orders.length), h('div', { class: 'sub-list' }, h('ul', { class: 'list' }, c.orders.map((o) => orderRow(o, true))))) : null);
  return card;
}
const kindLabel = (k) => ({ paid: tr('kindPaid'), magic: tr('kindMagic'), admin: tr('kindAdmin') })[k] || k;
let searchTimer;
$('#q').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 350); });
$('#search-form').addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(searchTimer); runSearch(); });

// ---- mail ----
async function loadMail() {
  const box = $('#mail');
  box.replaceChildren(h('div', { class: 'card' }, skeleton(4)));
  let data;
  try { data = await api('/admin/api/mail'); } catch (e) { if (e.message !== 'signed out') box.replaceChildren(h('div', { class: 'card' }, failBox(loadMail))); return; }
  setMailBadge(data.failed30);
  box.replaceChildren(
    h('div', { class: 'card pad', style: 'display:flex;gap:10px;align-items:center;flex-wrap:wrap' },
      h('span', { class: 'pill ' + (data.failed30 ? 'bad' : 'paid') }, data.failed30 ? tr('mailFailedCount', { n: data.failed30 }) : tr('mailAllOk')),
      h('span', { style: 'color:var(--muted);font-size:13px' }, tr('mailHint'))),
    h('h2', null, tr('mailTitle')),
    h('div', { class: 'card' }, data.mails.length ? h('ul', { class: 'list' }, data.mails.map((m) => {
      const li = h('li', { class: 'click', title: tr('openCustomer') },
        h('div', { class: 'main' }, m.recipient),
        h('div', { class: 'end' }, h('span', { class: 'pill ' + (m.ok ? 'paid' : 'bad') }, m.ok ? tr('mailOk') : tr('mailFailed'))),
        h('div', { class: 'meta' }, time(m.created) + ' · ' + kindLabel(m.kind), m.error ? h('div', { style: 'color:var(--bad)' }, m.error) : null));
      li.addEventListener('click', () => { $('#q').value = m.recipient; select('customers'); runSearch(); });
      return li;
    })) : h('div', { class: 'empty' }, tr('noMail'))));
}
function setMailBadge(n) { const b = $('#mail-badge'); b.hidden = !n; b.textContent = String(n); }
function refreshMailBadge() { api('/admin/api/mail').then((d) => setMailBadge(d.failed30)).catch(() => {}); }

// ---- chat ----
const LIMITS = [['CHAT_FREE_PER_DAY', 'limitFreePerDay'], ['CHAT_PLUS_PER_DAY', 'limitPlusPerDay'], ['CHAT_IP_PER_DAY', 'limitIpPerDay'], ['CHAT_DAILY_MESSAGES', 'limitDailyMessages'], ['CHAT_DAILY_TOKENS', 'limitDailyTokens']];
function meter(used, capN) {
  const p = capN > 0 ? Math.min(100, (used / capN) * 100) : 0;
  return h('div', { class: 'meter' }, h('i', { class: p >= 100 ? 'full' : p >= 75 ? 'hot' : '', style: 'width:' + (capN > 0 ? p : 0) + '%' }));
}
async function loadChat() {
  const box = $('#chat');
  box.replaceChildren(h('div', { class: 'card' }, skeleton(4)));
  let data;
  try { data = await api('/admin/api/chat'); } catch (e) { if (e.message !== 'signed out') box.replaceChildren(h('div', { class: 'card' }, failBox(loadChat))); return; }
  if (!data.available) return box.replaceChildren(h('div', { class: 'card empty' }, tr('chatWaiting')));
  const eff = (k) => data.settings[k] ?? data.defaults[k] ?? '';
  const on = eff('CHAT_ENABLED') !== 'off';
  const s = data.stats || {};
  const g = s.global || { n: 0, tokens: 0 };
  const capMsgs = Number(eff('CHAT_DAILY_MESSAGES')) || 0;
  const capTokens = Number(eff('CHAT_DAILY_TOKENS')) || 0;
  const toggle = h('button', { class: 'btn ' + (on ? 'danger' : 'primary') }, on ? tr('turnOff') : tr('turnOn'));
  toggle.addEventListener('click', async () => {
    if (on && !confirm(tr('turnOffConfirm'))) return;
    toggle.disabled = true;
    try { await api('/admin/api/settings', { CHAT_ENABLED: on ? 'off' : 'on' }); toast(tr('saved')); loadChat(); }
    catch (e) { if (e.message !== 'signed out') toast(tr('error'), true); toggle.disabled = false; }
  });
  const statBox = (label, value, sub, extra) => h('div', { class: 'card stat' }, h('div', { class: 'label' }, label), h('div', { class: 'value' }, value), sub ? h('div', { class: 'sub' }, sub) : null, extra || null);
  const countList = (rows, empty) => rows.length ? h('ul', { class: 'list' }, rows.map(([k, n]) => h('li', null, h('div', { class: 'main' }, k), h('div', { class: 'end' }, num(n))))) : h('div', { class: 'empty' }, empty);
  const inputs = {};
  const form = h('form', { class: 'card pad' },
    h('div', { class: 'limits' }, LIMITS.map(([k, label]) => {
      inputs[k] = h('input', { type: 'number', min: '0', step: '1', inputmode: 'numeric', value: data.settings[k] ?? '', placeholder: data.defaults[k] || '' });
      return h('label', null, h('span', null, h('b', { style: 'font-weight:500;color:var(--ink2)' }, tr(label)), data.settings[k] != null ? h('span', { class: 'pill red' }, tr('overrides')) : h('span', null, tr('default', { n: num(data.defaults[k]) }))), inputs[k]);
    })),
    h('div', { style: 'display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap' }, h('button', { class: 'btn primary', type: 'submit' }, tr('save')), h('span', { class: 'note', style: 'margin:0' }, tr('limitsHint'))));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {};
    for (const [k] of LIMITS) body[k] = inputs[k].value.trim();
    try { await api('/admin/api/settings', body); toast(tr('saved')); loadChat(); }
    catch (err) { if (err.message !== 'signed out') toast(tr('error'), true); }
  });
  box.replaceChildren(
    h('div', { class: 'card pad switch' },
      h('div', { class: 'state' }, h('span', { class: 'lamp ' + (on ? 'on' : 'off') }), on ? tr('chatOn') : tr('chatOff'), data.settings.CHAT_ENABLED != null ? h('span', { class: 'pill red', style: 'font-size:11px' }, tr('overrides')) : null),
      toggle,
      on ? null : h('div', { class: 'note', style: 'flex-basis:100%;margin:0' }, tr('chatClosedHint'))),
    h('h2', null, tr('today') + ' · ' + tr('chatDayHint')),
    h('div', { class: 'stats' },
      statBox(tr('messagesToday'), num(g.n), capMsgs ? tr('used', { used: num(g.n), cap: num(capMsgs) }) : null, meter(g.n, capMsgs)),
      statBox(tr('sessionsToday'), num(s.sessions), tr('visitors') + ' ' + num(s.visitors)),
      statBox(tr('tokensToday'), num(g.tokens), capTokens ? tr('used', { used: num(g.tokens), cap: num(capTokens) }) : null, meter(g.tokens, capTokens))),
    h('h2', null, tr('models')),
    h('div', { class: 'card' }, (s.models || []).length ? h('ul', { class: 'list' }, s.models.map((m) => h('li', null,
      h('div', { class: 'main' }, h('span', { class: 'mono', style: 'font-size:13.5px' }, m.model)),
      h('div', { class: 'end' }, m.cap ? tr('used', { used: num(m.n), cap: num(m.cap) }) : num(m.n)),
      h('div', { class: 'meta' }, m.provider + ' · ' + tr('tokens', { n: num(m.tokens) }) + (m.cap ? '' : ' · ' + tr('noCap')), m.cap ? meter(m.n, m.cap) : null)))) : h('div', { class: 'empty' }, tr('nothingYet'))),
    h('div', { class: 'grid2' },
      h('div', null, h('h2', null, tr('refusals')), h('div', { class: 'card' }, countList(s.refusals || [], tr('nothingYet')))),
      h('div', null, h('h2', null, tr('topics')), h('div', { class: 'card' }, countList(s.topics || [], tr('nothingYet'))))),
    h('div', { class: 'grid2' },
      h('div', null, h('h2', null, tr('cuts')), h('div', { class: 'card' }, countList(s.cuts || [], tr('nothingYet')))),
      h('div', null, h('h2', null, tr('violations')), h('div', { class: 'card stat' }, h('div', { class: 'value' }, num(s.violations))))),
    h('h2', null, tr('limits')),
    form);
}

const LOAD = { sales: () => { loadSales(); loadOrders(); }, customers: () => runSearch(), mail: loadMail, chat: loadChat };

async function start() {
  try { await api('/admin/api/me'); } catch { return; }
  $('#login').hidden = true;
  $('#app').hidden = false;
  for (const k of Object.keys(loaded)) delete loaded[k];
  select(tab, true);
  refreshMailBadge();
}
start();
`;

export function page(nonce: string): string {
  const t = (k: keyof typeof TH) => escapeHtml(TH[k]);
  const data = JSON.stringify(TH).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#f5f4f1" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0f0f11" media="(prefers-color-scheme: dark)">
<title>${t('title')}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6' fill='%23e4312b'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap">
<style nonce="${nonce}">${STYLE}</style>
</head>
<body>
<section id="login" class="login" hidden>
  <form id="login-form" autocomplete="on">
    <div class="brand"><span class="dot"></span>GRKU<small>admin</small></div>
    <label class="field"><span>${t('password')}</span><input id="password" type="password" name="password" autocomplete="current-password" required maxlength="200"></label>
    <button id="login-btn" class="btn primary block" type="submit">${t('signIn')}</button>
    <p id="login-msg" class="msg" role="alert"></p>
    <p class="note">${t('lockNote')}</p>
  </form>
</section>
<div id="app" hidden>
  <header>
    <div class="bar">
      <div class="brand"><span class="dot"></span>GRKU<small class="who-label">admin</small></div>
      <div class="grow"></div>
      <button id="refresh" class="btn ghost" type="button">${t('refresh')}</button>
      <button id="logout" class="btn ghost" type="button">${t('signOut')}</button>
    </div>
    <nav role="tablist">
      <button role="tab" data-tab="sales">${t('tabSales')}</button>
      <button role="tab" data-tab="customers">${t('tabCustomers')}</button>
      <button role="tab" data-tab="mail">${t('tabMail')}<span id="mail-badge" class="badge" hidden></span></button>
      <button role="tab" data-tab="chat">${t('tabChat')}</button>
    </nav>
  </header>
  <main>
    <section id="tab-sales">
      <div id="sales"></div>
      <div class="row-head">
        <h2>${t('recentOrders')}</h2>
        <div id="order-filter" class="seg" role="group">
          <button type="button" data-f="all" aria-pressed="true">${t('all')}</button>
          <button type="button" data-f="paid" aria-pressed="false">${t('statusPaid')}</button>
          <button type="button" data-f="open" aria-pressed="false">${t('statusOpen')}</button>
          <button type="button" data-f="expired" aria-pressed="false">${t('statusExpired')}</button>
        </div>
      </div>
      <div id="orders" class="card"></div>
    </section>
    <section id="tab-customers" hidden>
      <form id="search-form" class="searchbox" role="search">
        <input id="q" type="search" placeholder="${t('searchPlaceholder')}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">
        <button class="btn primary" type="submit">${t('search')}</button>
      </form>
      <div id="results"><div class="card empty">${t('searchHint')}</div></div>
    </section>
    <section id="tab-mail" hidden><div id="mail"></div></section>
    <section id="tab-chat" hidden><div id="chat"></div></section>
  </main>
</div>
<div id="toast" role="status" aria-live="polite"></div>
<script id="t" type="application/json" nonce="${nonce}">${data}</script>
<script nonce="${nonce}">${SCRIPT}</script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
