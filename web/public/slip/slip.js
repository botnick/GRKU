// The phone page of a GRKU Plus order: the computer shows a QR of /slip/#<order>, the phone opens
// it here and uploads the slip; the computer, which asks the service about the order every few
// seconds, unlocks by itself. No framework: this page has to open fast on any phone.
(function () {
  var API = 'https://grku-plus.botnick.workers.dev';
  var STRINGS = { en: {"title":"Upload the slip","lead":"Upload the slip of this order from your phone. The page on your computer unlocks by itself.","amount":"Amount","receiver":"Receiver","order":"Order","expires":"Expires in ${minutes} min","pick":"Tap to choose the slip","pickHint":"A slip image from your bank app, with its QR code","checking":"Checking the slip…","paidTitle":"Payment received","paidText":"GRKU Plus is unlocked. Go back to your computer: the page there is already unlocked. The key is also in your email.","expired":"This order expired. Start again on the computer.","missing":"This link has no order. Scan the QR on the computer again.","notFound":"This order does not exist. Scan the QR on the computer again.","mismatch":"The slip does not match this order. Check the amount and try again.","used":"This slip was used before.","unreadable":"The slip cannot be read. Upload the image saved from your bank app.","network":"The connection failed. Try again.","again":"Choose another slip","plans_plus":"GRKU Plus · Everything","plans_slots25":"GRKU Plus · 25 slots","plans_pack":"GRKU Plus · One pack","wrongAmount":"The slip is for ฿${got}, but this order is ฿${want}. Transfer exactly ฿${want} with the QR of this order, then upload that slip.","tooOld":"This slip is from before the order was made. Transfer with the QR of this order, then upload the new slip.","wrongReceiver":"This slip paid someone else. Transfer to the PromptPay of this order (••••4275), then upload that slip."}, th: {"title":"แนบสลิป","lead":"อัปโหลดสลิปของคำสั่งซื้อนี้จากมือถือ แล้วหน้าจอบนคอมพิวเตอร์จะปลดล็อกให้เอง","amount":"ยอดเงิน","receiver":"ผู้รับเงิน","order":"คำสั่งซื้อ","expires":"หมดอายุใน ${minutes} นาที","pick":"แตะเพื่อเลือกสลิป","pickHint":"รูปสลิปจากแอปธนาคารที่มี QR code","checking":"กำลังตรวจสอบสลิป…","paidTitle":"ได้รับเงินเรียบร้อยแล้ว","paidText":"ปลดล็อก GRKU Plus แล้ว สลับกลับไปที่คอมพิวเตอร์ได้เลย หน้าเว็บจะปลดล็อกให้เรียบร้อย และเราได้ส่งคีย์ไปที่อีเมลแล้วเช่นกัน","expired":"คำสั่งซื้อนี้หมดอายุแล้ว เริ่มใหม่อีกครั้งบนคอมพิวเตอร์","missing":"ไม่พบคำสั่งซื้อจากลิงก์นี้ สแกน QR บนคอมพิวเตอร์ใหม่อีกครั้ง","notFound":"ไม่พบคำสั่งซื้อนี้ สแกน QR บนคอมพิวเตอร์ใหม่อีกครั้ง","mismatch":"สลิปไม่ตรงกับคำสั่งซื้อนี้ ตรวจสอบยอดเงินแล้วลองใหม่อีกครั้ง","used":"สลิปนี้ถูกใช้งานไปแล้ว","unreadable":"อ่านข้อมูลในสลิปไม่ได้ ให้แนบรูปที่บันทึกมาจากแอปธนาคาร","network":"เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง","again":"เลือกสลิปใหม่","plans_plus":"GRKU Plus · ครบทุกอย่าง","plans_slots25":"GRKU Plus · 25 ช่อง","plans_pack":"GRKU Plus · หนึ่งแพ็ก","wrongAmount":"สลิปมียอด ฿${got} แต่ออเดอร์นี้คือ ฿${want} ให้โอนยอด ฿${want} พอดีผ่าน QR ของออเดอร์นี้ แล้วอัปโหลดสลิปใหม่อีกครั้ง","tooOld":"สลิปนี้โอนก่อนที่จะสร้างออเดอร์ ให้โอนผ่าน QR ของออเดอร์นี้ แล้วอัปโหลดสลิปใหม่","wrongReceiver":"สลิปนี้โอนไปบัญชีอื่น ให้โอนเข้า PromptPay ของออเดอร์นี้ (••••4275) แล้วอัปโหลดสลิปใหม่อีกครั้ง"} };
  // The language of the computer page that made the QR (#<order>.<th|en>), else Thai unless the phone is English.
  // The order and the language from the query (?o=<order>&l=<th|en>), or from an older hash link
  // (#<order>.<lang>). Some phone QR scanners drop the hash, so the query is what the QR carries.
  var query = new URLSearchParams(location.search);
  var hashParts = (location.hash || '').replace(/^#/, '').split('.');
  var linkLang = query.get('l') || hashParts[1];
  var lang = linkLang === 'en' ? 'en' : 'th';
  var t = STRINGS[lang];
  document.documentElement.lang = lang;
  var $ = function (id) { return document.getElementById(id); };
  var order = ((query.get('o') || hashParts[0] || '').toLowerCase().match(/^[a-z0-9]{10,20}$/) || [])[0] || null;
  function fatal(text) { $('fatal').textContent = text; $('fatal').hidden = false; $('card').hidden = true; }
  function plan(tier) { return tier === 'plus' ? t.plans_plus : tier === 'slots25' ? t.plans_slots25 : t.plans_pack; }
  function paid() { $('card').hidden = true; $('done').hidden = false; $('paidTitle').textContent = t.paidTitle; $('paidText').textContent = t.paidText; }
  function errorText(code, status) {
    code = code || '';
    var amount = /^amount (\S+) is not ([\d.]+)/.exec(code);
    if (amount) return t.wrongAmount.split('${got}').join(amount[1]).split('${want}').join(amount[2]);
    if (code === 'slip is older than the order') return t.tooOld;
    if (code === 'the money did not come to GRKU') return t.wrongReceiver;
    if (status === 410) return t.expired;
    if (code === 'slip already used') return t.used;
    if (code === 'slip not readable') return t.unreadable;
    if (status === 422) return t.mismatch;
    return t.network;
  }
  if (!order) return fatal(t.missing);
  ['title', 'lead', 'pick', 'pickHint'].forEach(function (k) { $(k).textContent = t[k]; });
  $('receiverLabel').textContent = t.receiver; $('orderLabel').textContent = t.order;
  fetch(API + '/order/' + order).then(function (r) { return r.json().then(function (b) { return { ok: r.ok, status: r.status, body: b }; }); }).then(function (res) {
    if (!res.ok) return fatal(res.status === 404 ? t.notFound : t.network);
    var o = res.body;
    if (o.status === 'paid') return paid();
    if (o.status === 'expired') return fatal(t.expired);
    $('plan').textContent = plan(o.tier);
    $('amount').textContent = '฿' + Number(o.amount).toFixed(2);
    $('receiver').textContent = o.receiver ? o.receiver.name + ' · ' + o.receiver.account : '';
    $('order').textContent = order.toUpperCase();
    var tick = function () { var m = Math.max(0, Math.round((o.expires - Date.now()) / 60000)); $('expires').textContent = t.expires.replace('${minutes}', m); };
    tick(); setInterval(tick, 30000);
    $('card').hidden = false;
  }).catch(function () { fatal(t.network); });
  $('file').addEventListener('change', function () {
    var file = this.files && this.files[0]; this.value = '';
    if (!file) return;
    var drop = $('drop'), status = $('status');
    drop.classList.add('busy'); status.className = 'status'; status.textContent = t.checking;
    var form = new FormData(); form.append('order', order); form.append('file', file, file.name || 'slip.jpg');
    fetch(API + '/slip', { method: 'POST', body: form }).then(function (r) { return r.json().then(function (b) { return { ok: r.ok, status: r.status, body: b }; }); }).then(function (res) {
      drop.classList.remove('busy');
      if (res.ok) return paid();
      status.className = 'status bad'; status.textContent = errorText(res.body && res.body.error, res.status);
      $('pick').textContent = t.again;
    }).catch(function () { drop.classList.remove('busy'); status.className = 'status bad'; status.textContent = t.network; });
  });
})();
