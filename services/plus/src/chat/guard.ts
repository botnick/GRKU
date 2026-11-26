/**
 * The guardrails of the assistant around the model: a pre-filter on the user's message (before
 * any model call) and a post-filter on the streamed answer (before any piece reaches the page).
 * The patterns are deliberately narrow: photography words ("shoot", "flash", "kill the
 * highlights", "night", "skin") must pass, so a beginner's question is never refused.
 */

export type Language = 'en' | 'th' | 'zh-Hans' | 'zh-Hant' | 'ja' | 'ko';

/** Why the pre-filter answers a message itself. */
export type Refusal = 'injection' | 'offtopic' | 'selfharm' | 'personal' | 'firmware' | 'piracy' | 'spam';

/** The language of a message by its script, else the page's. */
export function messageLanguage(text: string, page: Language): Language {
  const counts = { th: 0, ko: 0, kana: 0, han: 0, latin: 0 };
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x0e00 && c <= 0x0e7f) counts.th++;
    else if (c >= 0xac00 && c <= 0xd7af) counts.ko++;
    else if ((c >= 0x3040 && c <= 0x30ff) || (c >= 0x31f0 && c <= 0x31ff)) counts.kana++;
    else if (c >= 0x4e00 && c <= 0x9fff) counts.han++;
    else if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) counts.latin++;
  }
  if (counts.th >= 2) return 'th';
  if (counts.ko >= 2) return 'ko';
  if (counts.kana >= 1) return 'ja';
  if (counts.han >= 2) return page === 'zh-Hant' ? 'zh-Hant' : page === 'zh-Hans' ? 'zh-Hans' : page === 'ja' ? 'ja' : 'zh-Hans';
  if (counts.latin >= 3) return 'en';
  return page;
}

// Each list is lower case and matched against the lower-cased message. Thai has no spaces, so
// Thai entries are whole words that do not occur inside photography words.
const INJECTION: RegExp[] = [
  /\b(ignore|disregard|forget|override|bypass)\b[^.\n]{0,40}\b(previous|above|prior|earlier|all|your|the|these|system)\b[^.\n]{0,30}\b(instructions?|rules?|prompts?|guidelines?|directions?|messages?)/,
  /\b(system|developer|hidden|initial|original)\s+(prompt|message|instructions?)\b/,
  /\b(reveal|show|print|repeat|output|tell me|what (is|are))\b[^.\n]{0,30}\b(your|the)\s+(instructions?|rules|prompt|system|configuration|api key|keys?|secrets?)\b/,
  /\b(pretend (to be|you are|you're|that you)|role-?play|act as (my|an?) (?!webcam))/,
  /\byou are (now|no longer)\b/,
  /\b(dan|jailbreak|developer mode|god mode|unfiltered|uncensored|do anything now)\b/,
  /\bmy (late )?grand(ma|mother|pa|father)\b[^.\n]{0,60}\b(used to|would)\b/,
  /\b(api[_ -]?key|secret key|access token|bearer)\b/,
  /<\/?(system|instructions?|im_start|im_end)>|\[\/?inst\]|<<sys>>|^\s*(system|assistant)\s*:/m,
  /(เพิกเฉย|ไม่ต้องสนใจ|ลืม|ข้าม)\s*(คำสั่ง|กฎ|ข้อห้าม)/,
  /(system ?prompt|ซิสเต็มพรอมต์|พรอมต์ระบบ|คำสั่งระบบ|คำสั่งลับ)/,
  /(แกล้งทำเป็น|สวมบทบาท|เล่นบทบาท|ทำตัวเป็น|สมมติว่าคุณเป็น)/,
  /(忽略|无视|忽視|無視)(之前|以上|上面|所有|前面)?(的)?(指令|规则|規則|提示)/,
  /(以前の|上記の|すべての)?(指示|ルール|命令)を(無視|忘れ)/,
  /(이전|위의|모든)?\s*(지시|규칙|명령)(을|를)?\s*(무시|잊어)/,
];

const SELF_HARM: RegExp[] = [/\b(kill myself|suicide|suicidal|end my life|self[- ]harm|want to die)\b/, /(ฆ่าตัวตาย|อยากตาย|ทำร้ายตัวเอง|ไม่อยากมีชีวิต)/, /(自杀|自殺|自残|死にたい|자살|죽고\s*싶)/];

/** Topics that an answer must never be about (the post-filter). */
const NEVER: RegExp[] = [
  /\b(porn\w*|nude|nudes|naked|nsfw|hentai|erotic)\b/,
  /(หนังโป๊|ลามก|เย็ด)/,
  /\b(rifle|pistol|bomb|explosive|murder|meth|cocaine|heroin)\b/,
];

const OFF_TOPIC: RegExp[] = [
  // Politics and religion.
  /\b(election|president|prime minister|politic\w*|democrat|republican|parliament|monarchy|religio\w*|jesus|allah|buddhism|islam|christian\w*)\b/,
  /(การเมือง|นายก|รัฐบาล|เลือกตั้ง|พรรค|ศาสนา|สถาบันกษัตริย์)/,
  // Sex.
  /\b(sex|sexy|porn\w*|nude|nudes|naked|nsfw|boobs?|dick|pussy|hentai|erotic)\b/,
  /(เซ็กส์|โป๊|เปลือย|หนังโป๊|ลามก|ควย|เย็ด)/,
  // Weapons and violence (not "shoot", which is photography).
  /\b(gun|guns|rifle|pistol|bomb|explosive|weapon|murder|terroris\w*|meth|cocaine|heroin)\b/,
  /(ปืน|อาวุธ|ฆ่าคน|ยาเสพติด|ยาบ้า)/,
  // Medical, legal, financial advice; hate.
  /\b(prescription|medication|dosage|lawsuit|sue (him|her|them)|stock market|crypto\w*|bitcoin|forex|gambl\w*|casino|lottery)\b/,
  /(หวย|พนัน|คาสิโน|ตลาดหุ้น|คริปโต|บิทคอยน์|ฟ้องร้อง|ยารักษา|อาการป่วย)/,
  /\b(nigger|faggot|retard\w*|kike|chink)\b/,
  // Other tasks: code, essays, homework.
  /\b(write|generate)\b[^.\n]{0,30}\b(code|python|javascript|sql|essay|poem|homework|story)\b/,
  /(เขียนโค้ด|เขียนโปรแกรม|ทำการบ้าน|แต่งกลอน|เขียนเรียงความ)/,
];

const PERSONAL: RegExp[] = [
  /\b(phone number|home address|address of|where does .{1,30} live|password of|id card|credit card)\b/,
  /(เบอร์โทร(ของ|ศัพท์ของ)|ที่อยู่ของ|ที่อยู่บ้าน|บ้านของ.{0,20}อยู่ที่ไหน|เลขบัตรประชาชน|รหัสผ่านของ)/,
];

// Changing the firmware, hacking or unlocking the camera. Not "install GRKU", which is the product.
const FIRMWARE: RegExp[] = [
  /\b(flash|patch|modify|downgrade|hack|jailbreak|crack|root)\w*\b[^.\n]{0,30}\bfirmware\b/,
  /\bfirmware\b[^.\n]{0,30}\b(flash|patch|modif|downgrade|hack|crack)\w*/,
  /\b(hack|crack|exploit|root)\w*\b[^.\n]{0,20}\b(camera|ricoh|gr ?(iii|iv|3|4))\b/,
  /(แฟลช|ดาวน์เกรด|แฮก|แฮ็ก|เจาะ|ปลดล็อก)\s*(เฟิร์มแวร์|เฟิร์มแว|กล้อง)/,
  /(เฟิร์มแวร์|เฟิร์มแว).{0,20}(แฟลช|ดาวน์เกรด|แฮก|แฮ็ก|ดัดแปลง|แก้ไข)/,
];

// Getting paid things free: keys, cracks, other brands' paid presets.
const PIRACY: RegExp[] = [
  /\b(free|crack\w*|generate|leak\w*|steal)\b[^.\n]{0,25}\b(plus )?(keys?|serial|activation)\b/,
  /\b(plus|premium)\b[^.\n]{0,20}\b(for free|free of charge|without pay\w*|crack\w*)\b/,
  /\b(crack(ed|s)?|pirac\w*|pirated|torrent|warez|keygen)\b/,
  /(คีย์ฟรี|แจกคีย์|แคร็ก|ของเถื่อน|ละเมิดลิขสิทธิ์)/,
];

/** Whether a message is mostly the same few characters, a code dump, or a list of links. */
function spam(text: string): boolean {
  const chars = [...text.replace(/\s+/g, '')];
  if (chars.length >= 24 && new Set(chars).size <= 3) return true;
  const urls = text.match(/https?:\/\/\S+/g) ?? [];
  if (urls.length >= 3) return true;
  const codeLines = text.split('\n').filter((line) => /[{};]\s*$|^\s*(import|function|const|let|var|def|class|<\/?\w+)/.test(line)).length;
  if (codeLines >= 4) return true;
  // Emoji and symbols only.
  const letters = text.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  if (chars.length >= 10 && letters / chars.length < 0.2) return true;
  return false;
}

/**
 * The pre-filter: why the message is answered without the model, or null to ask the model.
 * Self-harm comes first, so a person in distress gets the caring line whatever else they wrote.
 */
export function preFilter(text: string): Refusal | null {
  // NFKC folds full-width letters and look-alikes, but it also splits the Thai sara am (ำ), so
  // each pattern sees both forms.
  const forms = [text.toLowerCase(), text.toLowerCase().normalize('NFKC')];
  const any = (patterns: RegExp[]) => patterns.some((p) => forms.some((form) => p.test(form)));
  if (any(SELF_HARM)) return 'selfharm';
  if (any(INJECTION)) return 'injection';
  if (any(FIRMWARE)) return 'firmware';
  if (any(PIRACY)) return 'piracy';
  if (any(PERSONAL)) return 'personal';
  if (any(OFF_TOPIC)) return 'offtopic';
  if (spam(text)) return 'spam';
  return null;
}

// ---- The post-filter --------------------------------------------------------------------------------

/** Hosts that an answer may name besides grku.app. */
const HOSTS = ['grku.app', 'ricoh-imaging.co.jp', 'ricoh-imaging.com', 'ricoh-imaging.eu', 'ricoh-imaging.co.uk', 'ricoh.com', 'github.com'];
/** Whether `host` is one of HOSTS or a subdomain of one (RICOH has a site per region). */
const allowedHost = (host: string) => HOSTS.some((h) => host === h || host.endsWith(`.${h}`));

export const FIRMWARE_FILE = /\b(fwdc\w*|[a-z0-9_]{2,}\.bin)\b/i;
const DELETE = /\b(delete|remove)\b|ลบ|เอาออก|削除|删除|刪除|삭제/i;
/** Flashing. */
const FLASH: RegExp[] = [/\b(flash\w*|downgrad\w*|patch\w*|modif\w*)\b[^.\n]{0,30}\bfirmware/i, /แฟลช(?!ไดรฟ์)|ดาวน์เกรด|แก้ไขเฟิร์มแวร์/];
/** Choosing Execute on the firmware update screen, unless the answer says not to. */
const EXECUTE: RegExp[] = [
  /(?<!(not|never|don't|do not|ห้าม|อย่า|ไม่ต้อง|ไม่)\s*\**\s*)\b(choose|select|press|pick|tap)\s+\**["“]?execute/i,
  /(?<!(ห้าม|อย่า|ไม่ต้อง|ไม่)\s*)(เลือก|กด)\s*\**["“]?\s*Execute/i,
];

/** Why an answer must not reach the page, or null. `fragments` are pieces of the system prompt. */
export function postFilter(text: string, fragments: readonly string[]): string | null {
  // Key shapes: Google (AIza…, AQ.…), OpenRouter (sk-or-…), Cloudflare and other bearer tokens.
  if (/\bAIza[0-9A-Za-z_-]{20,}|\bAQ\.[0-9A-Za-z_-]{20,}|\bsk-(or-)?[0-9A-Za-z_-]{16,}|\bBearer\s+[0-9A-Za-z._-]{20,}/.test(text)) return 'key';
  const lower = text.toLowerCase();
  if (fragments.some((fragment) => lower.includes(fragment))) return 'prompt';
  for (const match of text.matchAll(/\bhttps?:\/\/([a-z0-9.-]+)/gi)) {
    if (!allowedHost(match[1]!.toLowerCase())) return 'url';
  }
  for (const match of text.matchAll(/\bwww\.([a-z0-9-]+\.)+[a-z]{2,}/gi)) {
    if (!allowedHost(match[0].toLowerCase())) return 'url';
  }
  if (EXECUTE.some((p) => p.test(text))) return 'firmware';
  // Firmware files and flashing steps. Naming the camera's firmware file (fwdc….bin) to tell the
  // user to delete it from the card is the fix for the update screen at a MENU start, so it stays
  // when the answer says to delete and nothing flashes or picks Execute. While the answer
  // streams, relay in index.ts holds it back and decides on the whole answer.
  if (FIRMWARE_FILE.test(text) && /firmware|เฟิร์มแวร์/i.test(text)) {
    // The answers name the file in the cause and say "delete the .bin file" in a later step, so a
    // deletion anywhere counts; flashing and choosing Execute are cut on their own.
    const deletes = DELETE.test(text);
    const flashes = FLASH.some((p) => p.test(text));
    if (!deletes || flashes) return 'firmware';
  }
  if (NEVER.some((p) => p.test(lower))) return 'topic';
  // Garbage: a share of scripts that none of the six languages uses.
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length > 40) {
    const foreign = letters.filter((ch) => /[\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Hebrew}\p{Script=Greek}\p{Script=Bengali}\p{Script=Tamil}]/u.test(ch)).length;
    if (foreign / letters.length > 0.15) return 'garbage';
  }
  return null;
}
