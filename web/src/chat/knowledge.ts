// The knowledge pack of the GRKU assistant: a compact JSON that the site build writes to
// /chat/knowledge.json (scripts/build-chat-knowledge.mjs) and the assistant's Worker reads
// (services/plus/src/chat). Every fact comes from the sources of the site itself, so the
// assistant knows what the site says and nothing it does not: the FAQ, the install guide, the
// cameras and firmware versions, the modules, the look catalog, GRKU Plus prices, What's new,
// and the recovery guide and terms. The "Learn" section is the one written for the assistant:
// short explainers of photography basics as they relate to the GR and GRKU.
//
// The text is English; the assistant answers in the visitor's language. The pack stays lean:
// the Worker sends the core sections always and the others when the question mentions their tags.
import type { Camera } from '../cameras';
import type { Cover } from '../catalog';
import { brandOf, filmKind, type FilmKind } from '../filmKind';
import type { GuideStrings } from '../guide';
import type { Strings } from '../i18n';
import { LAUNCH_ENDS, LAUNCH_PRICES, packOf, REGULAR_PRICES, FREE_SLOTS, PACKS } from '../plus';
import { LEARN_TOPICS } from './learn';
import { blockText } from '../docs/search';
import { DOC_PAGES } from '../docs/pages';
import type { DocsContent } from '../docs/types';

export const KNOWLEDGE_SCHEMA = 'grku-chat-knowledge-v1';

export interface KnowledgeSection {
  id: string;
  title: string;
  /** Lower-case words that bring the section into the prompt when a question contains one. */
  tags: string[];
  /** Always in the prompt. */
  core?: boolean;
  text: string;
}

export interface KnowledgeLook {
  id: string;
  name: string;
  brand: string;
  kind: FilmKind;
  /** The GRKU Plus pack, or "free" for a camera look that no pack holds. */
  pack: string;
  /** The film and paper it was fitted from. */
  film?: string;
  hint?: string;
  /** The box of the look, for the cards of the chat when its box picture does not load. */
  cover?: Cover;
}

export interface Knowledge {
  schema: typeof KNOWLEDGE_SCHEMA;
  version: string;
  sections: KnowledgeSection[];
  looks: KnowledgeLook[];
  /** Words that bring the look list into the prompt. */
  lookTags: string[];
}

/** An effect of the repository (effects/<id>/effect.json), as much as the pack uses. */
export interface EffectSource {
  id: string;
  name: string;
  cover?: Cover;
  monochrome: boolean;
  /** attribution.target: the film and paper of the fit. */
  film?: string;
}

export interface KnowledgeSources {
  version: string;
  strings: Strings;
  guide: GuideStrings;
  cameras: readonly Camera[];
  effects: readonly EffectSource[];
  /** The latest releases, newest first, each with its items in English. */
  news: readonly { version: string; date: string; items: readonly string[] }[];
  recovery: string;
  terms: string;
  /** The package README of the camera (resources/INSTALLATION-GR4.md): use and troubleshooting on the camera. */
  manual: string;
  /** The user manual (/docs/) in English: a section for each page, brought in by its tags. */
  docs?: DocsContent;
  /** The manual in the other languages, whose titles and search words become tags too. */
  docsKeywords?: readonly DocsContent[];
}

/** Text with inline code (the RichText of the strings) as plain text. */
const plain = (parts: readonly string[]) => parts.map((part) => (part.startsWith('`') ? part.slice(1) : part)).join('');

/**
 * Text without the sentences about the fast-boot firmware: GRKU ships none, and the assistant
 * never leads anyone to change the firmware.
 */
const withoutFastboot = (text: string) => text.replace(/[^.]*fast-boot[^.]*\.\s*/gi, '').trim();

/** A Markdown document as compact text: no images, no link targets, no blank lines. */
function compactMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt: string) => (alt ? `(Picture: ${alt})` : ''))
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '')
    .join('\n');
}

/** The sections of a Markdown document under the `##` and `###` headings of `wanted`. */
function markdownSections(markdown: string, wanted: readonly string[]): string {
  const out: string[] = [];
  let keep = false;
  for (const line of markdown.split('\n')) {
    const heading = /^#{2,3}\s+(.*)$/.exec(line);
    if (heading) keep = wanted.includes(heading[1]!.trim());
    if (keep) out.push(line);
  }
  return compactMarkdown(out.join('\n'));
}

const KIND_WORDS: Record<FilmKind, string> = {
  negative: 'color negative',
  slide: 'slide',
  mono: 'black and white',
  cine: 'cinema',
  instant: 'instant',
  camera: 'camera simulation',
  imported: 'imported',
};

export function buildKnowledge(sources: KnowledgeSources): Knowledge {
  const { strings: t, guide: g } = sources;
  const looks: KnowledgeLook[] = sources.effects
    .map((effect) => {
      const classified = { id: effect.id, cover: effect.cover, monochrome: effect.monochrome, look: effect.film ?? '' };
      const kind = filmKind(classified);
      const hint = t.lookHints[effect.id];
      const look: KnowledgeLook = { id: effect.id, name: effect.name, brand: brandOf(classified), kind, pack: packOf(classified) ?? 'free' };
      if (effect.film) look.film = effect.film.slice(0, 90);
      if (hint) look.hint = hint;
      if (effect.cover) look.cover = effect.cover;
      return look;
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const supported = sources.cameras.filter((camera) => camera.support);
  const cameraLines = supported.map((camera) => {
    const support = camera.support!;
    const modules = support.modules.map((key) => t.moduleNames[key]).join(', ');
    return `- ${camera.name}: firmware ${support.firmware}${support.noEffects ? ' (no film looks: a monochrome sensor)' : ''}. ModeSet file ${support.modeset}. Modules: ${modules}.`;
  });
  const counts = Object.fromEntries(PACKS.map((pack) => [pack, looks.filter((look) => look.pack === pack).length]));
  const freeLooks = looks.filter((look) => look.pack === 'free').length;
  // The launch ends at midnight in Thailand: its last day and the first day of the regular prices, in Thai time.
  const thaiDay = (ms: number) => new Date(ms + 7 * 3600_000).toISOString().slice(0, 10);
  const lastLaunchDay = thaiDay(LAUNCH_ENDS - 1);
  const regularFrom = thaiDay(LAUNCH_ENDS);

  const sections: KnowledgeSection[] = [
    {
      id: 'about',
      title: 'GRKU in short',
      core: true,
      tags: [],
      text: [
        `GRKU ${sources.version}. ${t.description}`,
        `${t.landing.fact} ${t.riskText}`,
        `Film looks: ${looks.length} in the library (${KIND_SUMMARY(looks)}). A package carries up to 40 looks to the camera. ${t.plus.lead}`,
        'Supported cameras and firmware (the camera shows its version in MENU; other versions and older GR models are not supported):',
        ...cameraLines,
        'Pages: /install/ (pick looks, camera, modules, then write the SD card or download GRKU.zip), /guide/ (install guide), /develop/ (try every look and effect on your own photos in the browser, no camera needed), /recovery/ (camera stuck at startup), /terms/, /#plus (GRKU Plus), /docs/ (the user manual: every feature and setting, one page each). Support: support@grku.app.',
      ].join('\n'),
    },
    {
      id: 'faq',
      title: 'FAQ',
      core: true,
      tags: [],
      text: t.faq.map((item) => `Q: ${item.q}\nA: ${withoutFastboot(plain(item.a))}`).join('\n'),
    },
    {
      id: 'questions',
      title: 'Common questions from GRKU users, with the right answers',
      core: true,
      tags: [],
      text: COMMON_QUESTIONS,
    },
    {
      id: 'camera',
      title: 'On the camera: using GRKU and fixing problems (package README)',
      tags: ['adj', 'fn', 'option', 'order', 'menu', 'customize', 'install.err', 'report', 'not show', 'format', 'dng', 'raw', 'jpeg', 'use', 'how to', 'ใช้', 'ยังไง', 'ปรับ', 'เมนู', 'ฟอร์แมต', 'ไม่ขึ้น', 'ไม่ได้', '使用', '使い方', '사용'],
      // The README names the manual by its full address; the assistant links paths only.
      text: markdownSections(sources.manual, ['Use', 'Troubleshooting', 'The camera starts a firmware update when you hold MENU', 'The camera does not show Mode Set Command', 'GRKU does not show in ADJ', 'GRKU stops working after you format the card']).replace(/https:\/\/grku\.app\/(?:[a-z-]+\/)?docs\//g, '/docs/'),
    },
    {
      id: 'install',
      title: 'How to install, update, and uninstall',
      tags: ['install', 'setup', 'set up', 'sd', 'card', 'zip', 'menu', 'mode set', 'chrome', 'edge', 'safari', 'mac', 'windows', 'phone', 'update', 'uninstall', 'remove', 'adj', 'start', 'ติดตั้ง', 'ลง', 'การ์ด', 'เมม', 'อัปเดต', 'อัพเดท', 'ถอน', 'ลบ', 'เริ่ม', 'ใช้ยังไง', 'วิธี', '安装', '安裝', '卸载', 'インストール', '更新', '설치', '업데이트'],
      text: [
        `${g.heading}. ${g.lead} ${g.whereText}`,
        `Way 1, write to the SD card (${g.cardSub}): ${g.openSite} ${g.reader} (The camera's USB connection does not work for this.) ${g.pick} ${g.connect} ${g.write} ${g.confirmNote}`,
        `Way 2, GRKU.zip (any browser, also a phone or a Mac with Safari): ${g.download} ${t.steps.map(plain).join(' ').replaceAll('{modeset}', 'the ModeSet file')}`,
        `${g.cameraTitle}: ${g.cameraLead} Hold MENU while you turn the camera on, then wait until it turns itself off. ${g.modeSetNote} ${g.powerOn} ${g.firstSlow} ${g.once}`,
        `${g.useTitle}: ${g.adj} ${g.sixth} ${g.look} ${g.menu}`,
        `${g.updateTitle}: ${g.withBrowser} ${g.byHand} ${t.updateSteps.map(plain).join(' ')} ${g.updateKeep}`,
        `Uninstall: ${t.removeSteps.map(plain).join(' ').replaceAll('{modeset}', 'the ModeSet file')}`,
        `${g.helpTitle}: ${g.firmwareQ} ${g.firmwareA} ${g.modeSetQ} ${g.modeSetA} ${g.stuckQ} ${g.stuckA}`,
      ].join('\n'),
    },
    {
      id: 'modules',
      title: 'Modules (each is one row of the GRKU menu on the camera)',
      tags: ['module', 'framing', 'xpan', 'crop', 'mm', 'guide', 'grid', 'date', 'stamp', 'imprint', 'glow', 'halation', 'bloom', 'leak', 'diffusion', 'mist', 'grain', 'border', 'frame', 'recipe', 'u1', 'mode dial', 'โมดูล', 'ครอป', 'วันที่', 'เกรน', 'ขอบ', 'สูตร', 'ฟุ้ง', 'แสงรั่ว', 'กรอบ', '模块', '模組', 'モジュール', '모듈'],
      text: (Object.keys(t.modulesText) as (keyof typeof t.modulesText)[])
        .map((key) => `- ${t.moduleNames[key]}: ${t.modulesText[key]}`)
        .join('\n'),
    },
    {
      id: 'plus',
      title: 'GRKU Plus and prices',
      tags: ['plus', 'price', 'cost', 'pay', 'buy', 'free', 'paid', 'money', 'เสียเงิน', 'ค่าใช้จ่าย', 'แพง', 'กี่บาท', '199', '299', '49', '79', 'key', 'promptpay', 'truemoney', 'refund', 'slot', 'pack', 'baht', '฿', 'ราคา', 'จ่าย', 'ซื้อ', 'ฟรี', 'คีย์', 'โอน', 'สลิป', 'คืนเงิน', 'แพ็ก', 'บาท', '价格', '價格', '免费', '免費', '料金', '無料', '가격', '무료'],
      text: [
        t.plus.lead,
        `Free: every look previews free on the site; any ${FREE_SLOTS} looks of the library go on the card free; every module, recipes, and the Develop page are free. ${freeLooks} camera looks (FUJIFILM film simulations and RICOH's own) are in no pack.`,
        `Tiers, one-time payment, in Thai baht. Launch prices through ${lastLaunchDay} (Thai time): Everything ${LAUNCH_PRICES.plus} (all ${looks.length} looks of the library and every new one: ${t.plus.tierAllText}), 25 slots ${LAUNCH_PRICES.slots25} (${t.plus.tierSlotsText}), one pack ${LAUNCH_PRICES['pack:kodak']} each (${t.plus.tierPackText}). From ${regularFrom}: Everything ${REGULAR_PRICES.plus}, 25 slots ${REGULAR_PRICES.slots25}, one pack ${REGULAR_PRICES['pack:kodak']}. Earlier payments count toward Everything and 25 slots.`,
        `Packs: ${PACKS.map((pack) => `${t.plus.packs[pack]} (${counts[pack]} looks)`).join(', ')}.`,
        `Any purchase also opens ${t.plus.studioFull}. Payment: PromptPay QR from any Thai bank app, or a TrueMoney gift link; upload the slip and the looks unlock at once. The key comes by email and works on every device ("I have a key" on the site).`,
        markdownSections(sources.terms, ['Refunds']),
      ].join('\n'),
    },
    {
      id: 'recovery',
      title: 'Recovery and troubleshooting',
      tags: ['stuck', 'freeze', 'frozen', 'hang', 'not start', "won't start", 'does not start', 'brick', 'error', 'mem error', 'recover', 'broken', 'black screen', 'not show', 'not appear', 'missing', 'problem', 'help', 'ค้าง', 'เปิดไม่ติด', 'ไม่ติด', 'พัง', 'เสีย', 'ไม่ขึ้น', 'หาไม่เจอ', 'ปัญหา', 'แก้', 'กู้', '卡', '死机', '當機', '起動しない', 'フリーズ', '멈춤', '안 켜'],
      text: [compactMarkdown(sources.recovery), `${t.faq.find((item) => item.id === 'adj')?.q} ${plain(t.faq.find((item) => item.id === 'adj')?.a ?? [])}`].join('\n'),
    },
    {
      id: 'card-troubles',
      title: 'Firmware update screen at MENU start, and old or missing looks after GRKit',
      tags: ['firmware', 'update', 'execute', 'cancel', 'ver.', 'fwdc', '.bin', 'grkit', 'huji', 'old look', 'still show', 'เฟิร์มแวร์', 'เฟิมแวร์', 'อัปเดต', 'อัพเดท', 'ยังขึ้น', 'ลุคเก่า', 'ไม่เข้า', 'เปลี่ยนเมม', 'เมมใหม่', '固件', 'ファームウェア', '펌웨어'],
      text: CARD_TROUBLES,
    },
    {
      id: 'safety',
      title: 'Safety, warranty, and terms',
      tags: ['safe', 'risk', 'warranty', 'damage', 'harm', 'official', 'ricoh', 'firmware', 'legal', 'terms', 'privacy', 'data', 'ปลอดภัย', 'เสี่ยง', 'ประกัน', 'เฟิร์มแวร์', 'ข้อมูล', 'เงื่อนไข', '安全', '保修', '安全吗', 'ファームウェア', '保証', '안전', '펌웨어'],
      text: markdownSections(sources.terms, ['Experimental software', 'Risks', 'No warranty', 'The assistant']),
    },
    {
      id: 'develop',
      title: 'The Develop page',
      tags: ['develop', 'photo', 'picture', 'image', 'edit', 'browser', 'try', 'preview', 'online', 'filter', 'phone', 'รูป', 'ภาพ', 'ลอง', 'แต่ง', 'ฟิลเตอร์', '照片', '写真', '사진'],
      text: `${t.develop.description} ${t.develop.homeText} Open /develop/, add a photo, pick a look and effects, then save the photo or carry the look and modules to the install with one button. A look card's "Try on your photo" opens /develop/?look=<id>.`,
    },
    {
      id: 'news',
      title: "What's new",
      tags: ['new', 'latest', 'version', 'release', 'changelog', 'update', 'ใหม่', 'เวอร์ชัน', 'เวอร์ชั่น', 'อัปเดต', '新', 'バージョン', '버전'],
      text: sources.news.map((release) => `${release.version} (${release.date}): ${release.items.join(' ')}`).join('\n'),
    },
    // Learn: photography with a GR and GRKU, one section a topic.
    ...LEARN_TOPICS,
    ...(sources.docs ? docsSections(sources.docs, sources.docsKeywords ?? []) : []),
  ];

  return {
    schema: KNOWLEDGE_SCHEMA,
    version: sources.version,
    sections,
    looks,
    lookTags: [
      'look', 'film', 'recommend', 'suggest', 'which', 'best', 'warm', 'cool', 'vintage', 'retro', 'portrait', 'skin', 'landscape', 'street', 'night', 'black and white', 'b&w', 'mono', 'cinema', 'cinematic', 'slide', 'color', 'colour', 'tone', 'kodak', 'fuji', 'ilford', 'agfa', 'cinestill', 'polaroid', 'instax', 'chrome', 'negative', 'travel', 'food', 'sunset', 'sky', 'beach',
      'ลุค', 'ฟิล์ม', 'โทน', 'สี', 'แนะนำ', 'อุ่น', 'เย็น', 'วินเทจ', 'ขาวดำ', 'หนัง', 'ภาพคน', 'ผิว', 'วิว', 'กลางคืน', 'ทะเล', 'เที่ยว', 'อาหาร',
      '胶片', '膠片', '推荐', '推薦', '色调', '色調', 'フィルム', 'おすすめ', '필름', '추천',
    ],
  };
}

function KIND_SUMMARY(looks: readonly KnowledgeLook[]): string {
  const order: FilmKind[] = ['negative', 'slide', 'mono', 'cine', 'instant', 'camera'];
  return order
    .map((kind) => [kind, looks.filter((look) => look.kind === kind).length] as const)
    .filter(([, n]) => n > 0)
    .map(([kind, n]) => `${n} ${KIND_WORDS[kind]}`)
    .join(', ');
}

/**
 * Real questions that GRKU users asked (in Thai), with the answers the facts give. The assistant
 * reads them as worked examples.
 */
const COMMON_QUESTIONS = [
  'Q: I already paid for GRKU Plus (for example 199 baht). How do I use it? A: The key (AAAA-AAA-AAAA) came by email ("Your GRKU Plus key"). Open the link in that email on the computer you use, or open GRKU Plus on the site, choose "I have a key", paste the key, and press Unlock. The key works on every device. Then on the install page choose the unlocked looks ("Put all bought looks on the card") and write the card as usual. No email? "I have a key" can send it again. Links: /#plus-key, /install/.',
  'Q: Do I have to pay? A: No. GRKU is free: every look previews free, any 10 looks go on the card at once free, and every module, recipes, and the Develop page are free. GRKU Plus is optional, a one-time payment for more looks on the card (prices in the GRKU Plus facts). Links: /install/, /#plus.',
  'Q: How do I update the firmware? A: Two different things. The camera firmware is RICOH\'s: update it only from RICOH\'s official support site, and first check that GRKU supports the new version (the supported versions are in the facts); GRKU never changes the firmware. Updating GRKU itself: write the card again from the site (connect the card on the last step and press Update GRKU), or copy the new SCRIPT folder by hand; settings stay. Links: /guide/#update, /install/write/.',
  'Q: How do I use the film looks? A: On the camera, while you shoot: press the ADJ lever, choose the sixth entry, GRKU, then Film Look; highlight a look to see it on the screen and press OK to keep it. Press Fn to adjust it. To switch, do the same and pick another; to turn it off, pick Off. Links: /guide/#use.',
  'Q: (vague) I went in here, how do I fix it next? A: Ask one short question: what screen or message do they see, and on which step (the site\'s install page, the first start with MENU, or ADJ on the camera)? Offer those places. Links: /guide/#help.',
  'Q: Do I need to buy a card first? I just bought the camera. A: You need an SD card: the one you shoot on is fine, and the GR comes without one, so buy one if you have none. To write it from the site you also need a card reader on a computer with Chrome or Edge; the camera\'s USB cable does not work for this. Without a computer, download GRKU.zip and copy it with a card reader for your phone. Then follow the guide step by step. Links: /guide/, /install/.',
  'Q: GR IIIx 1.71 does not install. A: GR IIIx 1.71 is supported (GR IIIx firmware 1.60, 1.70, 1.71). Common causes: the card was written through the camera\'s USB cable instead of a card reader; the files are not at the top level of the card (SCRIPT, DEVELOP.MOD, 00078490.609); MENU was not held at the first power-on, so SD scripts are off; GRKU needs 8 to 10 seconds after power-on to show in ADJ; a .bin file on the card starts a firmware update instead. Ask what message or screen they see. If the camera stops at startup, follow the recovery guide. Links: /guide/#help, /recovery/.',
  'Q: Can I adjust the tone of a film look myself? A: Yes, several ways: on the camera, press Fn on a look to adjust it; on the site, import your own LUT (.cube) or Lightroom preset (.xmp) as a look in Film Looks; save looks with settings as Recipes; and try looks and effects on your own photos on the Develop page. Links: /install/, /develop/.',
  'Q: I do not like a film look I put on the camera. How do I turn it off or remove it? A: To hide it on the camera: MENU, Customize tab (C), GRKU section, Film Look, Options, and uncheck it. To remove it from the card: on the install page uncheck the look, then write the card again (Update GRKU). Links: /install/, /install/write/.',
  'Q: To change or add film looks, must I delete everything on the card and start over? A: No. Choose the looks on the site and write the card again; the page shows what will change before it writes, and your GRKU settings stay in the GRKU folder. You hold MENU at power-on only the very first time. Links: /install/, /install/write/.',
  'Q: Can I develop RAW later with a film look? A: Yes. Since GRKU 1.9.0, RAW development in the camera (playback) has a GRKU row, so a DNG can be developed with a film look. For photos you already have on a computer or phone, the Develop page applies the same looks in the browser. Links: /develop/, /guide/#use.',
  'Q: I put these 3 items on the card (SCRIPT, DEVELOP.MOD, and the ModeSet file), held MENU and pressed power, and it showed Script - Enable. Is that done? A: Yes. The Mode Set Command screen shows Script - Enable and Complete, then the camera turns itself off: SD scripts are on. Now turn the camera on normally and wait a few seconds until GRKU shows at the top of the screen (the first start takes longer); then press ADJ and choose GRKU. Afterwards you may delete the ModeSet file and DEVELOP.MOD from the card; keep SCRIPT. Links: /guide/#camera, /guide/#use.',
].join('\n');

/** Card problems with their own screens or leftovers, sent when the question mentions them. */
const CARD_TROUBLES = [
  'Q: I held MENU and pressed power, and the camera shows "Updates the camera firmware. Ver.1.60 → Ver.1.60" with Execute and Cancel. What do I do? A: Choose Cancel and press OK; do not choose Execute. The screen shows because a camera firmware file (a .bin file whose name starts with fwdc, from RICOH or a fast-boot file) is at the top level of the card, and the camera reads it before the ModeSet file when MENU is held at power-on. Turn the camera off, put the card in a computer, delete only that fwdc….bin file from the top level of the card, and keep SCRIPT, DEVELOP.MOD, and the ModeSet file (such as 00078490.609). Put the card back, hold MENU and press power again: now the Mode Set Command screen shows Script - Enable and Complete. Then turn the camera on normally and wait 8 to 10 seconds until GRKU shows in ADJ. If the same screen still shows, ask which files are at the top level of the card. Links: /guide/#camera, /guide/#help.',
  'Q: I used GRKit before, wrote GRKU (40 looks) to another card, but the camera shows an old look such as HUJI Cam Style and not the looks I chose. A: Neither GRKU nor GRKit has a look called HUJI Cam Style: it is a LUT someone imported, with its own name. GRKU keeps imported LUTs: writing a card that had GRKit moves its looks and imports into GRKU, and the site writes your imports to every card. So an old look is not proof that GRKit runs. Do not guess; check: (1) scroll the whole Film Look list, which can be long; (2) the GRKU folder on the card has REPORT.TXT, which names what loaded; (3) a photo of the files at the top of the card and in SCRIPT (SCRIPT/GRKIT there means GRKit files were copied over); (4) how the card was written (the site button or GRKU.zip) and whether GRKU Plus covers 40 looks (free is 10). To start clean: copy the photos off, format the card in the camera, and write it again from grku.app. Links: /install/write/, /guide/#help.',
].join('\n');


/** Words that would bring a manual page into nearly every prompt. */
const COMMON_WORDS = new Set(['grku', 'the', 'and', 'for', 'film', 'photo', 'photos', 'camera', 'menu', 'adj', 'free', 'card', 'sd', 'on', 'off', 'gr', 'use', 'new', 'look', 'looks', 'settings', 'setting', 'page', 'site', 'help', 'version', 'white', 'black', 'กล้อง', 'การ์ด', 'ฟิล์มลุค', 'ลุค', 'カメラ', '카메라', '相机', '相機']);

/**
 * The words people ask with, for each page of the manual, on top of its search words: the search
 * words are the manual's own (such as เวอร์ชันเฟิร์มแวร์), while a question says เช็คเฟิร์มแวร์ or
 * ครอปได้กี่มิล. Lower case; Thai as people type it.
 */
const DOC_EXTRA_TAGS: Partial<Record<keyof DocsContent['pages'], readonly string[]>> = {
  start: ['what do i need', 'beginner', 'มือใหม่', 'ต้องมีอะไร', 'ต้องใช้อะไร', 'เริ่มใช้'],
  firmware: ['firmware version', 'camera information', 'about this device', 'เฟิร์มแวร์', 'เฟิมแวร์', 'เช็ค', 'ดูเวอร์ชัน', 'เวอร์ชันกล้อง', 'อัปเฟิร์มแวร์', 'อัพเฟิร์มแวร์', 'เฟิร์มแวร์ใหม่'],
  install: ['mode set command', 'script - enable', 'modeset', 'develop.mod', 'sd_root', 'first start', 'ลง grku', 'ติดตั้ง', 'กด menu ค้าง', 'menu ค้าง'],
  controls: ['adj', 'fn', 'options', 'ปุ่ม', 'ซ่อน', 'ปิดลุค', 'ลบลุค'],
  update: ['update grku', 'uninstall', 'format', 'อัปเดต grku', 'อัพเดท grku', 'ถอน', 'ฟอร์แมต', 'เปลี่ยนลุค', 'เพิ่มลุค', 'ลบของเดิม'],
  'film-look': ['film look', 'image control', 'ฟิล์มลุค', 'ปรับโทน', 'ปรับลุค', 'ใช้งานฟิล์ม'],
  recipes: ['recipe', 'save settings', 'undo', 'สูตร', 'ย้อนกลับ'],
  framing: ['xpan', 'framing', '65:24', 'อัตราส่วน', 'พาโนรามา'],
  crop: ['crop', 'focal length', 'mm', 'ครอป', 'มิล', 'ทางยาวโฟกัส'],
  guides: ['guides', 'grid', 'เส้นตาราง', 'เส้นช่วย', 'เส้น'],
  date: ['date imprint', 'วันที่', 'ใส่วันที่', 'ฟอนต์'],
  glow: ['glow', 'halation', 'bloom', 'ฮาเลชัน', 'ฮาเลชั่น'],
  'light-leak': ['light leak', 'แสงรั่ว'],
  diffusion: ['diffusion', 'pro-mist', 'mist', 'ฟุ้ง'],
  grain: ['grain', 'film-like', 'เกรน'],
  border: ['border', 'ขอบ', 'กรอบรูป'],
  'mode-dial': ['u1', 'u2', 'u3', 'mode dial', 'save current settings', 'แป้นหมุน', 'โหมด u'],
  raw: ['raw', 'dng', 'raw develop', 'ไฟล์ raw', 'ล้าง raw'],
  settings: ['grku settings', 'enable at start', 'adj order', 'uncropped raw', 'top 1', 'distance unit'],
  looks: ['import', 'lut', 'cube', 'xmp', 'นำเข้า', 'กี่ลุค', 'เลือกลุค'],
  plus: ['key', 'คีย์', 'ซื้อ', 'จ่าย', 'ใช้คีย์'],
  shutdown: ['shutdown', 'goodbye', 'studio', 'ตอนปิดกล้อง', 'ปิดกล้องแล้ว', 'รูปตอนปิด'],
  develop: ['develop', 'my own photo', 'รูปตัวเอง', 'ลองกับรูป'],
  assistant: ['assistant', 'ผู้ช่วย', 'แชท'],
  'not-showing': ['install.err', 'report.txt', 'not show', 'ไม่ขึ้น', 'ไม่เห็น', 'ไม่เจอ grku', 'เออเรอร์', 'error'],
  stuck: ['stuck', 'freeze', 'ค้าง', 'เปิดไม่ติด'],
  faq: ['first photos', 'menu again', 'รูปแรก', 'ไม่มีฟิล์มลุค', 'อีกไหม'],
  cameras: ['supported', 'gr iii', 'gr iiix', 'gr iv', 'monochrome', 'รองรับ', 'รุ่น'],
};

/** The tags of a manual page: its search words and title in every language, less the common ones, and the words people ask with. */
function docTags(slug: keyof DocsContent['pages'], all: readonly DocsContent[]): string[] {
  const words = all.flatMap((content) => {
    const page = content.pages[slug];
    // Thai and the CJK languages write no spaces between words: the whole title is one tag.
    return [...page.keywords.toLowerCase().split(/\s+/), page.title.toLowerCase()];
  });
  return [...new Set([...words.map((word) => word.trim()).filter((word) => [...word].length >= 3 && !COMMON_WORDS.has(word)), ...(DOC_EXTRA_TAGS[slug] ?? [])])];
}

/** A section of the knowledge for each page of the manual, with the link of each of its parts. */
export function docsSections(docs: DocsContent, others: readonly DocsContent[]): KnowledgeSection[] {
  return DOC_PAGES.map(({ slug }) => {
    const page = docs.pages[slug];
    const lines = [`Manual page /docs/${slug}/: ${page.lead}`];
    for (const block of page.blocks) {
      if (block.kind === 'h2') lines.push(`[${block.text}] /docs/${slug}/#${block.id}`);
      else if (block.kind === 'cameras') lines.push('(the table of supported cameras, firmware, and ModeSet files)');
      else if (block.kind === 'steps') lines.push(block.items.map((item, index) => `${index + 1}. ${blockText({ kind: 'p', text: item })}`).join(' '));
      else if (block.kind !== 'screen' && block.kind !== 'photo' && block.kind !== 'camera' && block.kind !== 'frame') lines.push(blockText(block));
    }
    return { id: `docs-${slug}`, title: `Manual: ${page.title}`, tags: docTags(slug, [docs, ...others]), text: lines.join('\n') };
  });
}
