// The user manual in th, translated from en.ts with the Gemini tools (grku-tools/i18n-th.mjs,
// checked with i18n-review.mjs), never by hand.
import type { DocsContent } from '../types';

export const th: DocsContent = {
  "home": {
    "title": "คู่มือ GRKU",
    "seoTitle": "คู่มือ GRKU: ติดตั้ง ฟิล์มลุค และทุกการตั้งค่าสำหรับ RICOH GR III, IIIx, IV",
    "lead": "วิธีติดตั้ง GRKU ใช้แต่ละฟีเจอร์บน GR และแก้ปัญหา ขั้นตอนสั้นๆ เข้าใจง่าย",
    "trust": "GRKU ทำงานจากการ์ด ไม่ยุ่งกับเฟิร์มแวร์กล้อง",
    "need": "ต้องใช้อะไรบ้าง",
    "tasks": [
      {
        "slug": "install",
        "label": "ติดตั้ง GRKU",
        "hint": "ครั้งแรก"
      },
      {
        "slug": "firmware",
        "label": "เช็กเฟิร์มแวร์ของฉัน",
        "hint": "ก่อนติดตั้ง"
      },
      {
        "slug": "controls",
        "label": "ใช้งาน GRKU บนกล้อง",
        "hint": "ADJ และ MENU"
      },
      {
        "slug": "film-look",
        "label": "เลือกฟิล์มลุค",
        "hint": "ฟิล์มลุค"
      },
      {
        "slug": "not-showing",
        "label": "GRKU ไม่ขึ้น",
        "hint": "หาสาเหตุ"
      },
      {
        "slug": "update",
        "label": "อัปเดตหรือถอนการติดตั้ง",
        "hint": "เก็บการตั้งค่าไว้"
      }
    ],
    "rescue": "กล้องค้างตอนเปิดเครื่องไหม",
    "all": "ทุกหน้า",
    "credit": "GRKU เริ่มต้นจากโค้ดของ [GRKit](https://github.com/ahonn/GRKit) โดย ahonn (MIT)"
  },
  "ui": {
    "docs": "คู่มือ",
    "searchLabel": "ค้นหาในคู่มือ",
    "searchHome": "ค้นหา เช่น วันที่, XPan, อัปเดต",
    "searchShort": "ค้นหาในคู่มือ",
    "noResults": "ไม่พบข้อมูล",
    "askInstead": "ถามผู้ช่วย AI",
    "browse": "หน้าในคู่มือ",
    "previous": "ก่อนหน้า",
    "next": "ถัดไป",
    "onThisPage": "ในหน้านี้",
    "stuck": "ยังติดขัดอยู่ไหม",
    "report": "ส่งอีเมลขอความช่วยเหลือ",
    "askAi": "ถาม AI เกี่ยวกับหน้านี้",
    "askAiText": "ผู้ช่วย GRKU ตอบคำถามเกี่ยวกับหน้านี้เป็นภาษาของคุณ",
    "askPrompt": "ฉันกำลังอ่านคู่มือหน้า \"${title}\" ช่วยอธิบายเป็นขั้นตอนสั้นๆ ให้หน่อย",
    "camera": "กล้อง",
    "firmware": "เฟิร์มแวร์",
    "modeset": "ไฟล์ ModeSet",
    "ratio": "Aspect Ratio",
    "mask": "Mask",
    "masks": [
      "Dark",
      "Black",
      "Frame Lines"
    ],
    "focal": "Focal Length",
    "style": "Style",
    "guides": [
      "Thirds",
      "Center",
      "Golden Ratio",
      "Diagonals"
    ],
    "updated": "อัปเดตล่าสุด"
  },
  "groups": {
    "start": "เริ่มต้นใช้งาน",
    "camera": "บนกล้อง",
    "site": "บน grku.app",
    "help": "ความช่วยเหลือ"
  },
  "pages": {
    "start": {
      "title": "GRKU คืออะไร",
      "seo": "GRKU คืออะไร ฟิล์มลุคฟรีสำหรับ RICOH GR III, IIIx และ IV",
      "lead": "GRKU เพิ่มโทนฟิล์มและเอฟเฟกต์ภาพให้ RICOH GR จาก SD การ์ด",
      "keywords": "เกี่ยวกับ แนะนำ ภาพรวม เริ่มต้น มือใหม่ ฟรี ปลอดภัย เฟิร์มแวร์ about introduction overview begin beginner free safe firmware",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKU เป็นส่วนเสริมฟรีสำหรับ RICOH GR III, GR IIIx และ GR IV เลือกฟิล์มลุคได้มากกว่า 150 แบบ และใส่ลงการ์ดได้สูงสุด 40 แบบ พร้อมสูตรสีและเอฟเฟกต์อย่างการปั๊มวันที่ เกรน และกรอบภาพ XPan"
        },
        {
          "kind": "p",
          "text": "ตัวโปรแกรมทำงานจากการ์ดตอนที่เปิดกล้องอยู่ ถ้าถอดการ์ดออก กล้องก็จะเป็นกล้องที่ RICOH ทำมาตามเดิม GRKU ไม่เคยแก้เฟิร์มแวร์ของกล้อง"
        },
        {
          "kind": "h2",
          "id": "need",
          "text": "สิ่งที่ต้องใช้"
        },
        {
          "kind": "list",
          "items": [
            "กล้องและเวอร์ชันเฟิร์มแวร์ที่รองรับ ดูได้ที่ [กล้องที่รองรับ](doc:cameras)",
            "SD การ์ด ใช้การ์ดที่ถ่ายรูปอยู่ได้เลย",
            "คอมพิวเตอร์ที่มี Chrome หรือ Edge และการ์ดรีดเดอร์ ถ้าไม่มี ก็ก๊อปปี้ GRKU.zip ลงการ์ดเองได้"
          ]
        },
        {
          "kind": "h2",
          "id": "how",
          "text": "วิธีใช้งาน"
        },
        {
          "kind": "steps",
          "items": [
            "บน grku.app เลือกฟิล์มลุค รุ่นกล้อง และโมดูล แล้วเขียนลงการ์ด",
            "เฉพาะครั้งแรก ให้กด {{MENU}} ค้างไว้ตอนเปิดกล้อง เพื่อเปิดใช้งานสคริปต์บนการ์ด",
            "เปิดกล้องตามปกติ รอไม่กี่วินาที **GRKU** จะขึ้นที่ด้านบนของหน้าจอ",
            "กด {{ADJ}} ตอนถ่ายรูป แล้วเลือกเมนูที่หก **GRKU**"
          ]
        },
        {
          "kind": "h2",
          "id": "free",
          "text": "ของฟรี และสิ่งที่ GRKU Plus เพิ่มเข้ามา"
        },
        {
          "kind": "p",
          "text": "ดูตัวอย่างฟิล์มลุคได้ฟรีบนเว็บ และใส่ฟิล์มลุคจากคลังลงการ์ดได้ฟรี 10 แบบ ฟิล์มลุคที่คุณนำเข้าเองไม่นับรวม โมดูลทั้งหมด สูตรสี และหน้า Develop ใช้ได้ฟรี [GRKU Plus](doc:plus) คือการจ่ายครั้งเดียวแบบไม่บังคับ เพื่อเพิ่มจำนวนฟิล์มลุคบนการ์ด"
        },
        {
          "kind": "h2",
          "id": "words",
          "text": "คำที่ใช้ในคู่มือนี้"
        },
        {
          "kind": "list",
          "items": [
            "**SD card**: การ์ดความจำขนาดเล็กที่กล้องใช้เก็บรูป",
            "**Card reader**: อุปกรณ์ขนาดเล็กที่ช่วยให้คอมพิวเตอร์เปิดอ่านการ์ดได้",
            "**ZIP file**: ไฟล์เดียวที่เก็บหลายไฟล์ไว้ข้างใน เปิดออกเพื่อเอาไฟล์ข้างในออกมา",
            "**Firmware**: ซอฟต์แวร์ข้างในกล้องที่ RICOH ทำ GRKU ไม่เคยแก้ไฟล์ส่วนนี้",
            "**SD scripts**: การตั้งค่าของกล้องที่ให้รัน GRKU จากการ์ด เปิดใช้แค่ครั้งเดียว",
            "**ModeSet file**: ไฟล์ที่เปิดใช้ SD scripts ชื่อไฟล์จะเป็นตัวเลข เช่น `00078560.636`",
            "**ADJ lever**: ก้านเล็กๆ ด้านหลังของ GR ข้างจอ"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "ทดลองใช้งาน",
          "text": "GRKU เป็นซอฟต์แวร์ทดลอง ไม่มีรับประกัน หากเกิดข้อผิดพลาด กล้องอาจค้างตอนเปิดเครื่อง อ่าน [กล้องค้างตอนเปิดเครื่อง](doc:stuck) ก่อนติดตั้ง"
        }
      ]
    },
    "firmware": {
      "title": "เช็กเวอร์ชันเฟิร์มแวร์",
      "seo": "วิธีเช็กเวอร์ชันเฟิร์มแวร์ของ RICOH GR III, GR IIIx หรือ GR IV",
      "lead": "กด MENU แล้วเปิดเมนูตั้งค่า (ไอคอนประแจ) GRKU ใช้ได้เฉพาะกับเวอร์ชันเฟิร์มแวร์ในตารางหน้านี้",
      "keywords": "เวอร์ชันเฟิร์มแวร์ เช็ก เมนู ตั้งค่า ประแจ เกี่ยวกับอุปกรณ์นี้ ข้อมูลเฟิร์มแวร์ ข้อมูลกล้อง อัปเดต ริโก้ เก่ากว่า ใหม่กว่า firmware version check menu setup wrench about this device firmware info camera information update ricoh older newer fwdc bin",
      "blocks": [
        {
          "kind": "p",
          "text": "เฟิร์มแวร์คือซอฟต์แวร์ข้างในกล้องที่ RICOH ทำ กล้องแต่ละตัวจะแสดงเวอร์ชันเฟิร์มแวร์ไว้ในเมนู เช็กก่อนติดตั้ง GRKU"
        },
        {
          "kind": "h2",
          "id": "gr3",
          "text": "GR III และ GR IIIx"
        },
        {
          "kind": "steps",
          "items": [
            "เปิดกล้อง",
            "กด {{MENU}}",
            "ไปที่เมนูตั้งค่า แท็บที่มีรูปประแจ แล้วเปิด **About This Device**",
            "เลือก **Firmware Info / Options** แล้วกดขวา",
            "หน้าจอจะแสดงเวอร์ชันเฟิร์มแวร์ เช่น 2.21"
          ]
        },
        {
          "kind": "camera",
          "screen": "loaded",
          "press": [
            "menu"
          ],
          "alt": "กดปุ่ม MENU ที่ด้านหลังกล้อง"
        },
        {
          "kind": "screen",
          "screen": "setup-gr3",
          "alt": "GR III และ GR IIIx: (1) เมนูตั้งค่ารูปประแจ (2) About This Device"
        },
        {
          "kind": "screen",
          "screen": "info-gr3",
          "alt": "GR III และ GR IIIx: (3) เวอร์ชันเฟิร์มแวร์บนหน้า Firmware Info / Options"
        },
        {
          "kind": "h2",
          "id": "gr4",
          "text": "GR IV และ GR IV HDF"
        },
        {
          "kind": "steps",
          "items": [
            "เปิดกล้อง",
            "กด {{MENU}}",
            "ไปที่เมนูตั้งค่า แท็บที่มีรูปประแจ แล้วเลือก **Camera Information**",
            "กดขวา",
            "หน้าจอจะแสดงเวอร์ชันเฟิร์มแวร์ เช่น 1.21"
          ]
        },
        {
          "kind": "screen",
          "screen": "setup-gr4",
          "alt": "GR IV: (1) เมนูตั้งค่ารูปประแจ (2) Camera Information"
        },
        {
          "kind": "screen",
          "screen": "info-gr4",
          "alt": "GR IV: (3) เวอร์ชันเฟิร์มแวร์บนหน้า Camera Information"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "เรื่องน่ารู้",
          "text": "แถวอื่นในเมนูเป็นสีเทาในรูปเหล่านี้ ชื่อแถวต่างกันไปตามรุ่นกล้องและเฟิร์มแวร์"
        },
        {
          "kind": "p",
          "text": "GR IV Monochrome: [หน้าซัพพอร์ตกล้องของ RICOH](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html) มีรายการเวอร์ชันเฟิร์มแวร์ของรุ่นนี้"
        },
        {
          "kind": "h2",
          "id": "supported",
          "text": "GRKU รองรับเวอร์ชันไหนบ้าง"
        },
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "กล้อง GR IV 30th Anniversary Edition มาพร้อมเฟิร์มแวร์ 1.20 จากโรงงาน ซึ่ง grku.app ยังไม่มีให้โหลด ให้อัปเดตกล้องรุ่นนี้เป็น 1.21 จาก RICOH ก่อน"
        },
        {
          "kind": "h2",
          "id": "older",
          "text": "เวอร์ชันของฉันเก่ากว่า"
        },
        {
          "kind": "p",
          "text": "อัปเดตกล้องก่อน โดยโหลดจากหน้าซัพพอร์ตอย่างเป็นทางการของ RICOH เท่านั้น: [GR III](https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html), [GR IIIx](https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html), [GR IV](https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html), [GR IV Monochrome](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html) ทำตามขั้นตอนในหน้านั้น GRKU ไม่เคยอัปเดตเฟิร์มแวร์เอง"
        },
        {
          "kind": "h2",
          "id": "newer",
          "text": "เวอร์ชันของฉันใหม่กว่าในตาราง"
        },
        {
          "kind": "p",
          "text": "อย่าเพิ่งติดตั้ง GRKU รอจนกว่าจะมีอัปเดต GRKU ที่รองรับเวอร์ชันของคุณ ดูได้จาก[ข่าวบน grku.app](site:home)"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "มีหน้าจออัปเดตเฟิร์มแวร์ตอนเปิดครั้งแรกไหม",
          "text": "ถ้าในการ์ดมีไฟล์เฟิร์มแวร์ของ RICOH (ไฟล์ `.bin` ที่ชื่อขึ้นต้นด้วย `fwdc`) การกด {{MENU}} ค้างตอนเปิดเครื่องจะขึ้นหน้าจออัปเดตเฟิร์มแวร์ ให้เลือก **Cancel** แล้วลบไฟล์นั้นออกจากการ์ดและลองใหม่"
        }
      ]
    },
    "install": {
      "title": "ติดตั้ง GRKU",
      "seo": "วิธีติดตั้ง GRKU บน RICOH GR III, GR IIIx หรือ GR IV",
      "lead": "เขียน GRKU ลงการ์ด แล้วเปิดสคริปต์บนการ์ดบนกล้องหนึ่งครั้ง",
      "keywords": "ติดตั้ง การ์ด sd โครม เอดจ์ ซิป sd_root modeset mode set command เมนู เปิดครั้งแรก setup install sd card chrome edge zip sd_root modeset mode set command menu first start",
      "blocks": [
        {
          "kind": "h2",
          "id": "write",
          "text": "เขียนการ์ดจากหน้าเว็บ"
        },
        {
          "kind": "p",
          "text": "ใช้ Chrome หรือ Edge บนคอมพิวเตอร์ โดยใส่การ์ด SD ในตัวอ่านการ์ด สาย USB ของกล้องใช้กับขั้นตอนนี้ไม่ได้"
        },
        {
          "kind": "steps",
          "items": [
            "เปิด [หน้าติดตั้ง](site:install)",
            "เลือกฟิล์มลุค แล้วเลือกกล้อง แล้วเลือกโมดูล",
            "ในขั้นตอนสุดท้าย กด **เชื่อมต่อการ์ด SD** เลือกที่ตัวการ์ด แล้วอนุญาตให้แก้ไขไฟล์",
            "ตรวจรายการที่เปลี่ยนแปลง แล้วกด **ติดตั้ง GRKU** รูปในเครื่องยังอยู่เหมือนเดิม",
            "สั่งนำการ์ดออกในคอมพิวเตอร์ก่อนดึงออก"
          ]
        },
        {
          "kind": "p",
          "text": "ไม่แน่ใจว่ากล้องใช้เฟิร์มแวร์เวอร์ชันไหน ดูที่[วิธีเช็กเวอร์ชันเฟิร์มแวร์](doc:firmware)"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "ถ้าหน้าจอไม่เหมือนแบบนี้",
          "text": "ไม่มีปุ่ม **เชื่อมต่อการ์ด SD** ใช่ไหม เปิดหน้านี้ใน Chrome หรือ Edge บนคอม ถ้าใช้บนมือถือ หรือใช้ Safari ให้ใช้ GRKU.zip ด้านล่าง"
        },
        {
          "kind": "h2",
          "id": "zip",
          "text": "หรือก๊อปปี้ GRKU.zip เอง"
        },
        {
          "kind": "p",
          "text": "ใช้ได้ในทุกเบราว์เซอร์ รวมถึงบนมือถือหรือ Mac ผ่าน Safari"
        },
        {
          "kind": "steps",
          "items": [
            "ในขั้นตอนสุดท้ายของการติดตั้ง กด **ดาวน์โหลด GRKU.zip**",
            "แตกไฟล์ บางเบราว์เซอร์แตกไฟล์ให้เอง",
            "คัดลอกไฟล์และโฟลเดอร์ข้างใน `SD_ROOT` ไม่ใช่ตัวโฟลเดอร์ ไปไว้ที่ระดับบนสุดของการ์ด",
            "ที่ระดับบนสุดของการ์ดจะมีโฟลเดอร์ `SCRIPT` ไฟล์ `DEVELOP.MOD` และไฟล์ ModeSet ของกล้อง"
          ]
        },
        {
          "kind": "card",
          "alt": "หน้าแรกของการ์ดหลังติดตั้ง",
          "items": [
            [
              "SCRIPT",
              "ตัว GRKU เอง เก็บไฟล์นี้ไว้"
            ],
            [
              "DEVELOP.MOD",
              "มาพร้อมกับไฟล์ ModeSet ตอนเริ่มใช้งานครั้งแรก หลังจากนั้นจะลบออกก็ได้"
            ],
            [
              "00078560.636",
              "ไฟล์ ModeSet ของกล้องคุณ ที่ช่วยเปิดใช้งานสคริปต์บนการ์ด SD: 00078350.588 สำหรับ GR III, 00078490.609 สำหรับ GR IIIx, 00078560.636 สำหรับ GR IV หลังจากเริ่มใช้งานครั้งแรกจะลบออกก็ได้"
            ],
            [
              "GRKU",
              "ค่าตั้งค่าและฟิล์มลุคของคุณ เว็บหรือกล้องเป็นคนสร้างให้"
            ],
            [
              "DCIM",
              "รูปของคุณ การติดตั้ง GRKU จะไม่ไปยุ่งกับรูปพวกนี้"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "first-start",
          "text": "เปิดใช้งานครั้งแรก: เปิดสคริปต์จากการ์ด SD"
        },
        {
          "kind": "p",
          "text": "ทำแค่ครั้งเดียว ค่านี้จะค้างไว้กับการ์ดทุกใบ และตอนอัปเดตก็ไม่ต้องทำซ้ำ"
        },
        {
          "kind": "steps",
          "items": [
            "ปิดกล้องแล้วใส่การ์ด",
            "กด {{MENU}} ค้างไว้แล้วกดปุ่มเปิดเครื่อง",
            "หน้าจอจะขึ้น **Mode Set Command** ตามด้วย **Script - Enable** และ **Complete** จากนั้นกล้องจะปิดเครื่องเอง",
            "เปิดกล้องตามปกติ รอจนคำว่า **GRKU** ขึ้นที่ด้านบนของหน้าจอ จะใช้เวลาประมาณ 8 ถึง 10 วินาที และนานกว่านั้นบน GR IV รวมถึงตอนเปิดครั้งแรกหลังติดตั้ง"
          ]
        },
        {
          "kind": "camera",
          "screen": "modeset",
          "press": [
            "menu",
            "power"
          ],
          "alt": "กด MENU ค้างไว้ แล้วกดปุ่มเปิดปิด หน้าจอจะขึ้น Mode Set Command"
        },
        {
          "kind": "screen",
          "screen": "modeset",
          "alt": "หน้าจอ Mode Set Command ที่มี Script - Enable และ Complete"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "ถ้าหน้าจอไม่เหมือนแบบนี้",
          "text": "ไม่เจอหน้า **Mode Set Command** ใช่ไหม ปิดกล้องก่อน แล้วกด {{MENU}} ค้างไว้ก่อนกดปุ่มเปิดปิด และกด {{MENU}} ค้างไว้จนกว่าหน้าจอจะขึ้น เช็กดูว่า `DEVELOP.MOD` และไฟล์ ModeSet อยู่ที่ชั้นบนสุดของการ์ด ไม่ได้อยู่ในโฟลเดอร์"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "ขึ้นหน้าอัปเดตเฟิร์มแวร์ใช่ไหม",
          "text": "การ์ดมีไฟล์เฟิร์มแวร์ของ RICOH อยู่ (ไฟล์ `.bin` ที่ชื่อขึ้นต้นด้วย `fwdc`) ให้เลือก **Cancel** ห้ามเลือก Execute เด็ดขาด ปิดกล้อง ลบไฟล์นั้นออกจากชั้นบนสุดของการ์ด แล้วทำขั้นตอนนี้ใหม่อีกครั้ง"
        },
        {
          "kind": "p",
          "text": "หลังขั้นตอนนี้จะลบไฟล์ ModeSet และ `DEVELOP.MOD` จากการ์ดได้ เก็บโฟลเดอร์ `SCRIPT` ไว้"
        },
        {
          "kind": "h2",
          "id": "use",
          "text": "ใช้งาน GRKU"
        },
        {
          "kind": "steps",
          "items": [
            "ตอนถ่ายรูป ให้กด {{ADJ}}",
            "เลือก **GRKU** ปกติจะอยู่ที่ลำดับที่หก",
            "เลือกฟีเจอร์ เช่น **Film Look** แล้วเลื่อนแถบเลือกเพื่อดูตัวอย่างบนหน้าจอ",
            "กด {{OK}} เพื่อเก็บค่าไว้ กด {{Fn}} เพื่อดูการตั้งค่าเพิ่มเติม"
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "ถ้าหน้าจอไม่เหมือนแบบนี้",
          "text": "ใน ADJ ไม่มี **GRKU** ใช่ไหม รอ 10 วินาทีหลังเปิดกล้องแล้วลองใหม่ ถ้ายังไม่ขึ้น ดูที่ [GRKU ไม่แสดงผล](doc:not-showing)"
        },
        {
          "kind": "screen",
          "screen": "adj",
          "alt": "หน้า ADJ บน GRKU ที่แสดงไอคอนของโมดูลต่างๆ มุมซ้ายบนของหน้าจอแสดง GRKU และลุคที่ใช้อยู่"
        },
        {
          "kind": "p",
          "text": "รูปที่ถ่ายก่อน GRKU โหลดเสร็จจะไม่มีเอฟเฟกต์ของ GRKU ดูวิธีเลื่อนดูทั้งหมดได้ที่ [ADJ และ MENU](doc:controls)"
        }
      ]
    },
    "controls": {
      "title": "ADJ และ MENU",
      "seo": "วิธีใช้ GRKU บน GR: ก้าน ADJ และ MENU",
      "lead": "GRKU อยู่ตรงไหนบนกล้อง และปุ่มไหนทำหน้าที่อะไรบ้าง",
      "keywords": "adj ก้านปรับ menu ปรับแต่ง fn ok ปุ่ม ตัวเลือก ลำดับ เปิดใช้งาน grku เกี่ยวกับ เวอร์ชัน นำทาง adj lever menu customize fn ok button options order enable grku about version navigate",
      "blocks": [
        {
          "kind": "h2",
          "id": "adj",
          "text": "GRKU ใน ADJ"
        },
        {
          "kind": "p",
          "text": "ระหว่างถ่ายรูป ให้กดก้าน {{ADJ}} แล้วเลือก **GRKU** ซึ่งปกติจะอยู่ที่ลำดับที่หก หน้านี้จะแสดงโมดูลที่อยู่บนการ์ดของคุณ เช่น **Film Look**, **Framing** และ **Grain**"
        },
        {
          "kind": "table",
          "head": [
            "ปุ่ม",
            "การทำงานใน GRKU"
          ],
          "rows": [
            [
              "{{ADJ}}",
              "เปิด ADJ ถ้าคุณปิดไปตอนอยู่ที่ GRKU ก็จะกลับมาเปิดที่เดิมอีก แม้ปิดแล้วเปิดกล้องใหม่"
            ],
            [
              "ขึ้น, ลง",
              "เลื่อนไปยังโมดูล หรือไฮไลต์ตัวเลือก ภาพสดบนจอจะเปลี่ยนตามทันทีในส่วนที่รองรับ"
            ],
            [
              "{{OK}}",
              "เปิดโมดูลที่เลือกอยู่ หรือคงตัวเลือกที่เลือกไว้นั้น"
            ],
            [
              "{{Fn}}",
              "ทำงานเพิ่มเติมของแถวนั้น เช่น การตั้งค่าเพิ่มของโมดูล มุมถัดไปของ golden spiral หรือการเปลี่ยนชื่อและลบสูตรสี"
            ],
            [
              "{{MENU}}",
              "ย้อนกลับ"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "แถว **Enable** ที่อยู่ถัดจากโมดูล ใช้เปิดหรือปิด GRKU เมื่อเปิดใช้งาน จะเริ่มทำงานโมดูลที่เปิดไว้แต่ละตัวอีกครั้ง"
        },
        {
          "kind": "h2",
          "id": "menu",
          "text": "GRKU ใน MENU"
        },
        {
          "kind": "path",
          "items": [
            "MENU",
            "Customize (C)",
            "GRKU"
          ]
        },
        {
          "kind": "p",
          "text": "ทุกการตั้งค่าก็มีในเมนูกล้องเช่นกัน กด {{MENU}} ไปที่แท็บ Customize (C) แล้วเลื่อนลงไปท้ายสุด จะเจอหมวด GRKU ที่มีแถวเหล่านี้"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "การทำงาน"
          ],
          "rows": [
            [
              "**Enable GRKU**",
              "เปิดหรือปิด GRKU เมื่อเปิดใช้งาน จะเริ่มทำงานโมดูลที่เปิดไว้แต่ละตัวอีกครั้ง"
            ],
            [
              "**GRKU Settings**",
              "การตั้งค่าของ GRKU เอง ดูที่ [การตั้งค่า GRKU](doc:settings)"
            ],
            [
              "**สูตรสี** **Film Look** และโมดูลอื่นๆ",
              "แต่ละแถวคือโมดูลหนึ่งตัวบนการ์ด พร้อมการตั้งค่าทั้งหมดของโมดูลนั้น"
            ],
            [
              "**เกี่ยวกับ GRKU**",
              "เวอร์ชันของ GRKU บนการ์ดและบนเว็บไซต์"
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "menu",
          "alt": "ส่วน GRKU ใน MENU ที่มีหนึ่งแถวต่อหนึ่งโมดูล"
        },
        {
          "kind": "h2",
          "id": "module-rows",
          "text": "หน้าของโมดูล"
        },
        {
          "kind": "list",
          "items": [
            "**Enable** เปิดหรือปิดเฉพาะโมดูลนี้",
            "**Options** ในโมดูลที่มีจะเลือกตัวเลือกที่แสดงใน ADJ เอาเครื่องหมายถูกออกหน้าฟิล์มลุคที่ไม่เคยใช้ แล้ว ADJ จะข้ามไป",
            "**Order** ในโมดูลที่มีจะตั้งลำดับของตัวเลือกเหล่านั้นใน ADJ",
            "แถวที่เหลือคือการตั้งค่าของโมดูล แต่ละหน้าในคู่มือนี้มีรายการครบ"
          ]
        },
        {
          "kind": "h2",
          "id": "jpeg",
          "text": "JPEG และ DNG"
        },
        {
          "kind": "p",
          "text": "GRKU เปลี่ยนไฟล์ JPEG ส่วน DNG เก็บข้อมูลดิบของเซนเซอร์โดยไม่มีฟิล์มลุค ถ้าอยากล้าง DNG ด้วย GRKU ทีหลัง ให้ดูที่ [การล้าง RAW ในกล้อง](doc:raw)"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "การตั้งค่าไม่หาย",
          "text": "GRKU เก็บค่าตั้งของคุณไว้ในโฟลเดอร์ `GRKU` บนการ์ด แม้ปิดเครื่องและอัปเดตแล้วก็ตาม"
        }
      ]
    },
    "update": {
      "title": "อัปเดตหรือถอนการติดตั้ง",
      "seo": "วิธีอัปเดตหรือถอนการติดตั้ง GRKU และปิดสคริปต์การ์ด",
      "lead": "อัปเดตแล้วการตั้งค่าและฟิล์มลุคยังอยู่ครบ ไม่ต้องกด MENU ค้างอีก",
      "keywords": "อัปเดต อัปเกรด เวอร์ชันใหม่ ถอนการติดตั้ง ลบ ลบออก sd สคริปต์ ปิด ฟอร์แมต การ์ด สำรองข้อมูล update upgrade new version uninstall remove delete sd scripts off format card backup",
      "blocks": [
        {
          "kind": "h2",
          "id": "update-site",
          "text": "อัปเดตจากหน้าเว็บ"
        },
        {
          "kind": "steps",
          "items": [
            "ใส่การ์ดในเครื่องอ่านการ์ด แล้วเปิด [หน้าติดตั้ง](site:install) ใน Chrome หรือ Edge",
            "ในขั้นตอนสุดท้าย กด **เชื่อมต่อการ์ด SD** หน้านี้จะแสดงสิ่งที่เปลี่ยนแปลง",
            "กด **อัปเดต GRKU**",
            "ใส่การ์ดลงในกล้องแล้วเปิดเครื่องตามปกติ"
          ]
        },
        {
          "kind": "p",
          "text": "ถ้าอยากเพิ่มหรือลบฟิล์มลุค ให้ทำแบบเดียวกัน คือเปลี่ยนลุคบนเว็บ ต่อการ์ด ตรวจดูรายการที่เปลี่ยน แล้วกดปุ่มเขียน"
        },
        {
          "kind": "h2",
          "id": "update-zip",
          "text": "อัปเดตจาก GRKU.zip"
        },
        {
          "kind": "steps",
          "items": [
            "ปิดกล้อง ลบโฟลเดอร์ `SCRIPT` ออกจากการ์ด",
            "จาก `SD_ROOT` ในไฟล์ GRKU.zip ตัวใหม่ ให้คัดลอกเฉพาะโฟลเดอร์ `SCRIPT` ไปไว้ที่ชั้นนอกสุดของการ์ด",
            "ใส่การ์ดลงในกล้องแล้วเปิดเครื่อง ไม่ต้องกด {{MENU}} ค้างไว้"
          ]
        },
        {
          "kind": "h2",
          "id": "uninstall",
          "text": "ถอนการติดตั้ง GRKU"
        },
        {
          "kind": "p",
          "text": "ในขั้นตอนสุดท้ายของการติดตั้ง ให้ต่อการ์ดแล้วกด **ถอนการติดตั้ง GRKU** เลือกด้วยว่าจะลบค่าตั้งและฟิล์มลุคด้วยไหม แล้วกด **Uninstall** หรือปิดกล้องแล้วลบโฟลเดอร์ `SCRIPT` กับ `GRKU` เอง รูปของคุณยังอยู่เหมือนเดิม"
        },
        {
          "kind": "h2",
          "id": "scripts-off",
          "text": "ปิดสคริปต์การ์ด SD"
        },
        {
          "kind": "p",
          "text": "สคริปต์การ์ด SD จะยังทำงานอยู่หลังถอนการติดตั้ง GRKU ให้ปิดเฉพาะตอนที่เลิกใช้ GRKU ถาวร"
        },
        {
          "kind": "steps",
          "items": [
            "ในขั้นตอนสุดท้ายของการติดตั้ง ให้ใช้ **ปิดสคริปต์การ์ด SD** เพื่อเขียนไฟล์ลงการ์ด หรือดาวน์โหลดแล้วคัดลอกสิ่งที่อยู่ใน `SD_ROOT` ไปใส่การ์ด",
            "ใส่การ์ด กด {{MENU}} ค้างไว้แล้วเปิดกล้อง รอจนกล้องปิดเครื่องเอง",
            "ลบไฟล์ ModeSet และ `DEVELOP.MOD` ออกจากการ์ด"
          ]
        },
        {
          "kind": "h2",
          "id": "format",
          "text": "ก่อนฟอร์แมตการ์ด"
        },
        {
          "kind": "p",
          "text": "การฟอร์แมตจะลบ GRKU และการตั้งค่าออก ให้คัดลอกรูปถ่ายและโฟลเดอร์ `GRKU` ไปเก็บไว้ในคอมพิวเตอร์ก่อน หลังฟอร์แมตเสร็จ ให้ติดตั้ง GRKU ใหม่อีกครั้ง แล้วคัดลอกโฟลเดอร์ `GRKU` กลับมาไว้ที่ชั้นนอกสุดของการ์ด"
        }
      ]
    },
    "film-look": {
      "title": "ฟิล์มลุค",
      "seo": "ฟิล์มลุคบน RICOH GR: วิธีใช้ Film Look",
      "lead": "ฟิล์มลุคจากฟิล์มจริง ดูภาพตัวอย่างสดได้ แทน Image Control",
      "keywords": "ฟิล์มลุค สไตล์ฟิล์ม ฟิล์ม สี ภาพตัวอย่าง ฟิล์มเนกาทีฟ ฟิล์มสไลด์ film look effect image control lut portra classic chrome kodak fuji fujifilm finepix positive preview fn parameters film stock",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "ฟิล์มลุค"
          ]
        },
        {
          "kind": "steps",
          "items": [
            "กด {{ADJ}} แล้วเลือก **GRKU** จากนั้นเลือก **Film Look**",
            "เลื่อนไปที่ฟิล์มลุคที่ต้องการ หน้าจอ live view จะแสดงผลทันทีพร้อมไอคอนกล่องฟิล์ม",
            "กด {{OK}} เพื่อยืนยัน หรือเลือก **Off** หากต้องการถ่ายโดยไม่ใช้ฟิล์มลุค"
          ]
        },
        {
          "kind": "screen",
          "screen": "film-look",
          "alt": "Film Look ใน ADJ ที่แสดงกล่องฟิล์มของฟิล์มลุคในการ์ด โดยไฮไลต์ Kodak Portra 400"
        },
        {
          "kind": "h2",
          "id": "adjust",
          "text": "ปรับแต่งฟิล์มลุค"
        },
        {
          "kind": "p",
          "text": "เลื่อนไปที่ฟิล์มลุคที่ต้องการแล้วกด {{Fn}} กล้องจะเปิดหน้าปรับค่าของฟิล์มลุคนั้นเหมือน Image Control ทั้งความอิ่มสี คอนทราสต์ Shading Clarity และค่าอื่นๆ ของกล้องคุณ แต่ละฟิล์มลุคจะจำค่าที่ปรับแยกไว้ของตัวเอง"
        },
        {
          "kind": "h2",
          "id": "image-control",
          "text": "Film Look กับ Image Control"
        },
        {
          "kind": "p",
          "text": "ขณะที่เปิดใช้งานฟิล์มลุค ระบบจะทำงานแทน Image Control ค่า Image Control ที่ตั้งไว้จะไม่เปลี่ยน และจะกลับมาใช้งานตามเดิมเมื่อเลือก **Off**"
        },
        {
          "kind": "h2",
          "id": "menu-rows",
          "text": "ใน MENU"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "การทำงาน"
          ],
          "rows": [
            [
              "**Film Stock**",
              "เลือกฟิล์มลุคเหมือนปุ่ม ADJ"
            ],
            [
              "**Parameters**",
              "แสดงตอนที่เปิดลุคอยู่ เปิดหน้าปรับแต่งของลุคเหมือนปุ่ม {{Fn}}"
            ],
            [
              "**Options**",
              "เลือกว่าจะให้ ADJ แสดงฟิล์มลุคไหนบ้าง"
            ],
            [
              "**Order**",
              "กำหนดลำดับใน ADJ"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "which",
          "text": "มีลุคไหนอยู่ในการ์ดบ้าง"
        },
        {
          "kind": "p",
          "text": "การ์ดเก็บได้สูงสุด 40 ลุค เลือกได้ใน [หน้าติดตั้ง](site:install) และลองใช้แต่ละลุคกับรูปของตัวเองก่อนได้ใน [หน้าพัฒนา](site:develop) ดูเพิ่มเติมได้ที่ [เลือกลุคบนเว็บ](doc:looks)"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "เรื่องน่ารู้",
          "text": "ลุคเหล่านี้ทำมาสำหรับเซนเซอร์ GR III สีจึงอาจต่างออกไปเล็กน้อยบน GR IV ส่วน GR IV Monochrome ไม่มี Film Look เพราะเซนเซอร์รับสีไม่ได้"
        }
      ]
    },
    "recipes": {
      "title": "Recipes",
      "seo": "สูตรสีฟิล์ม GR: บันทึกและสลับการตั้งค่าในขั้นตอนเดียว",
      "lead": "บันทึกทั้งลุคพร้อมการตั้งค่ากล้อง แล้วสลับมาใช้ได้ในขั้นตอนเดียว",
      "keywords": "recipe สูตรสี preset save settings undo rename delete apply view white balance exposure บันทึก ตั้งค่า ยกเลิก เปลี่ยนชื่อ ลบ ใช้งาน ดู ไวต์บาลานซ์ ชดเชยแสง",
      "blocks": [
        {
          "kind": "p",
          "text": "สูตรสีเก็บ Film Look หรือ Image Control, Grain, Glow, Border, ไวต์บาลานซ์ และค่าการปรับแก้กับค่าเปิดรับแสงของกล้องไว้ด้วยกัน"
        },
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Recipes"
          ]
        },
        {
          "kind": "screen",
          "screen": "recipes",
          "alt": "สูตรสีใน ADJ: ย้อนกลับ สูตรสีของคุณ และบันทึกค่าตั้ง"
        },
        {
          "kind": "h2",
          "id": "save",
          "text": "บันทึกสูตรสี"
        },
        {
          "kind": "steps",
          "items": [
            "ตั้งค่ากล้องและ GRKU ตามแบบที่ชอบ",
            "กด {{ADJ}} เลือก **GRKU** แล้วเลือก **Recipes**",
            "เลือก **Save Settings** พิมพ์ชื่อด้วยแป้นพิมพ์บนกล้องแล้วกด {{OK}}"
          ]
        },
        {
          "kind": "h2",
          "id": "apply",
          "text": "ใช้งานสูตรสี"
        },
        {
          "kind": "steps",
          "items": [
            "ใน **Recipes** เลื่อนแถบไปที่สูตรสีที่ต้องการ ภาพสดจะแสดงผลตามนั้น และค่าตั้งค่าจะขึ้นทางซ้ายของจอ",
            "กด {{OK}} เพื่อใช้งาน",
            "เปลี่ยนใจแล้วใช่ไหม เลือก **Undo** แล้วระบบจะดึงค่ากล้องทั้งหมดที่สูตรสีนี้เปลี่ยนไปกลับคืนมา"
          ]
        },
        {
          "kind": "h2",
          "id": "edit",
          "text": "เปลี่ยนชื่อหรือลบ"
        },
        {
          "kind": "p",
          "text": "ไฮไลต์สูตรสีแล้วกด {{Fn}} แล้วเลือก **Rename** หรือ **Delete** ใน MENU หน้าของแต่ละสูตรสีจะมี **Apply** และ **View** ที่แสดงค่าตั้งพร้อมไอคอน"
        },
        {
          "kind": "h2",
          "id": "site",
          "text": "สูตรสีจากเว็บ"
        },
        {
          "kind": "p",
          "text": "ในขั้นตอนที่ 3 ของการ[ติดตั้ง](site:install) เพิ่มสูตรสียอดนิยมจากชุมชนหรือสร้างเอง แล้วเขียนลงการ์ดพร้อมฟิล์มลุคของคุณได้เลย"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "สูตรสีแจ้งว่าขาดโมดูลใช่ไหม",
          "text": "สูตรสีที่มีเกรนต้องมีโมดูล Grain บนการ์ด เช่นเดียวกับ Glow และ Border ส่วนสูตรสีที่มีฟิล์มลุคที่ยังไม่มีบนการ์ดจะขึ้นว่า **Effect not installed**"
        }
      ]
    },
    "framing": {
      "title": "Framing",
      "seo": "XPan และสัดส่วนภาพอื่นๆ บน RICOH GR (Framing)",
      "lead": "ถ่ายในสัดส่วนภาพแบบอื่น เช่น XPan, 2.35:1, 16:9, 1:1 และอื่นๆ",
      "keywords": "framing aspect ratio xpan panorama 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 mask frame lines guides only crop เฟรม อัตราส่วนภาพ พาโนรามา กรอบ เส้นไกด์ ครอป",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Framing"
          ]
        },
        {
          "kind": "frame",
          "mode": "framing",
          "alt": "ลองสัดส่วนภาพและกรอบมาร์กของ Framing บนรูปถ่าย"
        },
        {
          "kind": "p",
          "text": "ไฮไลต์สัดส่วนแล้วไลฟ์วิวจะแสดงกรอบ กด {{OK}} เพื่อเก็บค่าไว้ ไฟล์ JPEG จะถูกครอปตามสัดส่วน ส่วน DNG จะคงไว้ที่ 3:2"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Aspect Ratio**",
              "Off, XPan 65:24, 16:9, 4:3, 2.35:1, 1:1, 5:4, 7:6, 3:4"
            ],
            [
              "**Mode**",
              "**Crop** (ค่าเริ่มต้น) ครอบไฟล์ JPEG ส่วน **Guides Only** แสดงกรอบและเก็บภาพเต็มใบ"
            ],
            [
              "**Mask**",
              "การแสดงพื้นที่นอกกรอบบนจอ: **Dark** (ค่าเริ่มต้น), **Black** หรือ **Frame Lines**"
            ],
            [
              "**Show Icon**",
              "แสดงอัตราส่วนบนหน้าจอถ่ายภาพ: On (ค่าเริ่มต้น) หรือ Off"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "กด {{Fn}} ที่ Framing เพื่อตั้งค่า **Mode** และ **Mask** ส่วน 3:4 คือกรอบแนวตั้งเหมือนกล้องฮาล์ฟเฟรม"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "ใช้ร่วมกับ Crop",
          "text": "Framing ทำงานร่วมกับ [Crop](doc:crop) ได้ เช่น ถ่าย XPan ที่ระยะ 50 mm"
        }
      ]
    },
    "crop": {
      "title": "Crop",
      "seo": "ครอป 35, 50 และ 70 มม. บน RICOH GR (Crop)",
      "lead": "ถ่ายด้วยทางยาวโฟกัสที่ยาวขึ้น เหมือนเทเลคอนเวอร์เตอร์ดิจิทัล โดยมีกรอบแสดงในไลฟ์วิว",
      "keywords": "ครอป ระยะโฟกัส ทางยาวโฟกัส ซูม เทเล กรอบ มาสก์ ไม่ครอป ดิบ crop focal length 35mm 40mm 50mm 70mm 57mm 71mm 100mm zoom tele frame only mask uncropped raw",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Crop"
          ]
        },
        {
          "kind": "frame",
          "mode": "crop",
          "alt": "ลองทางยาวโฟกัสของ Crop บนรูปถ่าย"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Focal Length**",
              "Off, 35, 40, 50 หรือ 70 mm บน GR IIIx คือ Off, 50, 57, 71 หรือ 100 mm"
            ],
            [
              "**Mode**",
              "**Crop** (ค่าเริ่มต้น) จะครอบภาพ ส่วน **Frame Only** จะแสดงกรอบและเก็บภาพเต็มไว้"
            ],
            [
              "**Mask**",
              "**Dark** (ค่าเริ่มต้น), **Black** หรือ **Frame Lines**"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "กด {{Fn}} บนหน้า Crop เพื่อตั้งค่า **Mode** และ **Mask** Crop ใช้ได้กับทุก Framing ratio"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "เก็บภาพเต็มไว้ใน DNG",
          "text": "เปิด **Uncropped RAW** ใน [ตั้งค่า GRKU](doc:settings#shooting) แล้วไฟล์ DNG จะเก็บภาพจากเซ็นเซอร์เต็มใบ และ Lightroom จะเปิดภาพพร้อมกรอบ Crop ที่ย้อนกลับมาแก้ทีหลังได้"
        }
      ]
    },
    "guides": {
      "title": "Guides",
      "seo": "เส้นจัดองค์ประกอบภาพบน GR: สามส่วน สัดส่วนทองคำ ก้นหอย",
      "lead": "เส้นจัดองค์ประกอบบนหน้าจอ ไม่มีผลกับภาพที่ถ่ายออกมา",
      "keywords": "guides grid lines thirds center golden ratio diagonals golden spiral dynamic symmetry composition disp opacity color เส้นไกด์ เส้นตาราง จุดตัดเก้าช่อง กึ่งกลาง สัดส่วนทองคำ เส้นทแยงมุม ก้นหอยทองคำ องค์ประกอบภาพ ความทึบแสง สี",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Guides"
          ]
        },
        {
          "kind": "frame",
          "mode": "guides",
          "alt": "ลองรูปแบบของ Guides บนรูปถ่าย"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Style**",
              "Off, Thirds, Center, Golden Ratio, Diagonals, Thirds + Center, Golden Spiral, Dynamic Symmetry"
            ],
            [
              "**Color**",
              "Black (ค่าเริ่มต้น), White, Yellow"
            ],
            [
              "**Opacity**",
              "50% (ค่าเริ่มต้น) หรือ 100%"
            ],
            [
              "**Hide with DISP**",
              "On (ค่าเริ่มต้น): เส้นจะซ่อนเมื่อ {{DISP}} ซ่อนข้อมูลบนหน้าจอ Off: แสดงตลอดเวลา"
            ],
            [
              "**Spiral Center**",
              "จุดหมุนของ Golden Spiral: Top Left, Top Right, Bottom Right (ค่าเริ่มต้น) หรือ Bottom Left"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "เมื่อเลือก **Golden Spiral** ใน ADJ ให้กด {{Fn}} เพื่อหมุนเส้นไปมุมถัดไป กล้องจะซ่อนเส้นตารางของกล้องเองตอน GRKU วาดเส้นไกด์ให้"
        }
      ]
    },
    "date": {
      "title": "Date Imprint",
      "seo": "ประทับวันที่บนรูป RICOH GR (Date Imprint)",
      "lead": "พิมพ์วันที่ลงบนรูปเหมือนกล้องฟิล์ม มีฟอนต์ให้เลือก 3 แบบ สี 5 สี และใส่ข้อความสั้นๆ ได้",
      "keywords": "พิมพ์วันที่ ประทับวันที่ เวลา ฟอนต์ คลาสสิก สี ส้ม ขนาด ตำแหน่ง มุม ข้อความ ขอบคุณ สุขสันต์วันเกิด เรืองแสง date imprint stamp time font classic gr1s gr ii color orange size position corner caption thank you happy birthday grku glow",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Date Imprint"
          ]
        },
        {
          "kind": "photo",
          "photo": "portra-heart",
          "alt": "Kodak Portra 400 พร้อมขอบ Instant และ Date Imprint ด้วยข้อความ GRKU <3"
        },
        {
          "kind": "p",
          "text": "เลือกสไตล์วันที่แล้วกด {{OK}} กด {{Fn}} เพื่อดูตัวตั้งค่าอื่น กล้องจะพิมพ์วันเวลาตามนาฬิกาของกล้อง ดังนั้นตั้งนาฬิกาให้ตรงก่อนนะ"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Date Style**",
              "Off, 'YY M D, 'YY M D H:MM, M D 'YY, D M 'YY, D M 'YY H:MM"
            ],
            [
              "**Date Position**",
              "**Film** (default) พิมพ์ลงตำแหน่งเดียวกับกล้องฟิล์ม **Upright** คงแนวตั้งของวันที่เมื่อถ่ายภาพแนวตั้ง"
            ],
            [
              "**Date Corner**",
              "Bottom Right (default), Bottom Left, Top Right หรือ Bottom Split โดยวางวันที่ทางซ้ายและคำบรรยายทางขวา"
            ],
            [
              "**Date Size**",
              "S, M (default), M-L, L"
            ],
            [
              "**Date Font**",
              "Classic (default), GR1s (dot matrix), GR II"
            ],
            [
              "**Date Color**",
              "Standard (ค่าเริ่มต้น): สีของตัวหนังสือจะเป็นสีส้มสำหรับ Classic และ GR II สีเหลืองสำหรับ GR1s และสีขาวบนภาพขาวดำ หรือเลือก Orange, White, Sepia, LED Yellow"
            ],
            [
              "**Date Glow**",
              "Off (ค่าเริ่มต้น) หรือ On: แสงเรืองอ่อนๆ รอบตัวเลข GR II จะพิมพ์ตัวเลขแบบเรียบ ไม่มีแสงเรือง"
            ],
            [
              "**Caption**",
              "Off (default), THANK YOU, HAPPY BIRTHDAY, I <3 GR, I <3 YOU, GOOD TIMES, HOLIDAY, CHEERS, GRKU <3 ในภาพจะแสดง <3 เป็นรูปหัวใจ"
            ],
            [
              "**Show Icon**",
              "แสดงรูปแบบวันที่บนหน้าจอถ่ายรูป โดยตั้งเป็น On (ค่าเริ่มต้น) หรือ Off"
            ]
          ]
        },
        {
          "kind": "photo",
          "photo": "neg-gr1s",
          "alt": "Classic Neg พร้อมขอบสีดำและวันที่ฟอนต์ GR1s"
        },
        {
          "kind": "screen",
          "screen": "date",
          "alt": "หน้า Date Imprint ใน MENU พร้อมการตั้งค่า"
        }
      ]
    },
    "glow": {
      "title": "Glow",
      "seo": "แสงฟุ้งและฮาเลชันบน RICOH GR (Glow)",
      "lead": "แสงฟุ้งรอบดวงไฟและส่วนสว่าง รวมถึง Halation สีแดงอมส้มแบบฟิล์มหนัง",
      "keywords": "glow bloom halation cinestill red orange gold white highlights lights night แสงฟุ้ง ฟุ้ง ฮาเลชัน สีแดง สีส้ม สีทอง สีขาว ส่วนสว่าง ดวงไฟ กลางคืน",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Glow"
          ]
        },
        {
          "kind": "photo",
          "photo": "portra-bloom",
          "alt": "Kodak Portra 400 พร้อม Bloom Weak, Diffusion 1/4 และ Grain Weak"
        },
        {
          "kind": "p",
          "text": "Glow มีสองส่วน แต่ละส่วนมีจุดเด่นต่างกัน และใช้คู่กันได้"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Bloom** › **Strength**",
              "Off, Weak, Medium, Strong: แสงฟุ้งนุ่มๆ รอบส่วนสว่าง"
            ],
            [
              "**Halation** › **Strength**",
              "Off, Weak, Medium, Strong: ขอบแสงเรืองรอบดวงไฟแบบฟิล์ม CineStill"
            ],
            [
              "**Halation** › **Color**",
              "Red, Orange (ค่าเริ่มต้น), Gold, White"
            ],
            [
              "**Show Icon**",
              "แสดงไอคอนของ Bloom หรือ Halation บนหน้าจอถ่ายภาพ: On (ค่าเริ่มต้น) หรือ Off"
            ]
          ]
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "เช็กในหน้าดูภาพ",
          "text": "Glow เปลี่ยนเฉพาะ JPEG และไม่เห็นใน live view ให้ดูรูปตอนเล่นภาพ"
        }
      ]
    },
    "light-leak": {
      "title": "Light Leak",
      "seo": "เอฟเฟกต์แสงรั่ว ฝุ่น และขอบมืดบน GR",
      "lead": "ร่องรอยของฟิล์มเก่า ทั้งขอบมืด ฝุ่นและเส้นผม แสงรั่ว และรอยขีดข่วน",
      "keywords": "light leak vignette dust scratches faded dusty leaky expired old film lomo retro แสงรั่ว ขอบมืด ฝุ่น รอยขีดข่วน ฟิล์มซีด ฟิล์มเก่า ฟิล์มหมดอายุ โลโม่ เรโทร",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Light Leak"
          ]
        },
        {
          "kind": "photo",
          "photo": "kodachrome-leak",
          "alt": "Kodachrome 64 แบบ Light Leak Faded, Grain Weak และวันที่"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Look**",
              "Off, Custom, Faded, Dusty, Leaky, Expired โดย Custom จะใช้ความแรงที่คุณตั้งเองด้านล่าง ส่วนที่เหลือคือชุดสำเร็จรูป"
            ],
            [
              "**Vignette**",
              "Off, Light, Medium, Strong"
            ],
            [
              "**Dust**",
              "Off, Light, Medium, Strong"
            ],
            [
              "**Light Leak**",
              "Off, Light, Medium, Strong"
            ],
            [
              "**Scratches**",
              "Off, Light, Medium, Strong"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "เลือก **Custom** แล้วกด {{Fn}} เพื่อตั้งความแรงของแต่ละส่วน ฝุ่น แสงรั่ว และรอยขีดข่วนจะตกต่างกันไปในแต่ละรูป Light Leak เปลี่ยนเฉพาะ JPEG และไม่แสดงในภาพพรีวิวสด"
        }
      ]
    },
    "diffusion": {
      "title": "Diffusion",
      "seo": "ฟิลเตอร์ฟุ้ง Black Pro-Mist และความนุ่มนวลแบบฟิล์มบน GR",
      "lead": "แสงฟุ้งนุ่มๆ แบบฟิลเตอร์ Black Pro-Mist และความนุ่มละมุนแบบสแกนฟิล์ม",
      "keywords": "diffusion filter pro mist black mist streak anamorphic softness film softness soft dreamy ฟิลเตอร์ฟุ้ง แสงฟุ้ง นุ่มละมุน ฟุ้งฝัน สแกนฟิล์ม",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Diffusion"
          ]
        },
        {
          "kind": "photo",
          "photo": "pro400h",
          "alt": "Fujifilm Pro 400H แบบ Diffusion 1/8, Film Softness Low และ Grain Weak"
        },
        {
          "kind": "p",
          "text": "Diffusion มีสองส่วนคือ **Filter** และ **Softness** แต่ละส่วนทำงานแยกกัน"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Filter** › **Strength**",
              "Off, 1/8, 1/4, 1/2 เหมือนเบอร์ของฟิลเตอร์ฟุ้ง"
            ],
            [
              "**Filter** › **Black Mist**",
              "Off, Light, Heavy คือม่านหมอกบางๆ บนส่วนเงา ทำงานเมื่อ Strength ไม่ใช่ Off"
            ],
            [
              "**Filter** › **Streak**",
              "Off, Blue, Amber คือแสงแฟลร์แนวนอนแบบเลนส์อนามอร์ฟิกบนจุดไฟ ทำงานเมื่อ Strength ไม่ใช่ Off"
            ],
            [
              "**Softness** › **Film Softness**",
              "Off, Low, Medium, High: รายละเอียดเล็กๆ จะนุ่มลงและไฮไลต์ค่อยๆ ละลาย เหมือนภาพสแกนจากฟิล์ม"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "Diffusion เปลี่ยนเฉพาะไฟล์ JPEG และไม่แสดงในไลฟ์วิว"
        }
      ]
    },
    "grain": {
      "title": "Grain",
      "seo": "เกรนฟิล์มบน RICOH GR: ความแรง ขนาด และโหมด Film-like",
      "lead": "เกรนฟิล์ม 4 ระดับความแรงและ 4 ขนาด เลือกได้ทั้งแบบที่กล้องสร้างหรือ Film-like",
      "keywords": "grain noise film-like system size strength weak medium strong extra เกรน นอยส์ ฟิล์ม ขนาด ความแรง อ่อน กลาง แรง พิเศษ",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Grain"
          ]
        },
        {
          "kind": "photo",
          "photo": "trix",
          "alt": "Kodak Tri-X 400 แบบ Grain Medium วันที่ฟอนต์ GR1s และขอบ Wide สีดำ"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Strength**",
              "Off, Weak, Medium, Strong, Extra Strong"
            ],
            [
              "**Size**",
              "Auto (ค่าเริ่มต้น), Small, Medium, Large"
            ],
            [
              "**Style**",
              "**System** (ค่าเริ่มต้น) คือเกรนของกล้อง **Film-like** คือเกรนของฟิล์มเนกาทีฟสี ชัดที่สุดในโทนกลาง ไม่มีในส่วนสีขาวหรือสีดำ และมีสีในภาพสี"
            ],
            [
              "**Show Icon**",
              "On (ค่าเริ่มต้น) หรือ Off"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "กด {{Fn}} บน Grain เพื่อตั้งค่า **Size** และ **Style** เกรนฟิล์มใช้โมเดลเกรนของ spektrafilm โดย Andrea Volpato"
        }
      ]
    },
    "border": {
      "title": "Border",
      "seo": "ขอบภาพสีขาว สีดำ และขอบภาพอินสแตนท์บน GR",
      "lead": "ขอบสีขาวหรือสีดำรอบทั้งภาพ ตัวภาพยังอยู่ครบทุกพิกเซล",
      "keywords": "ขอบภาพ กรอบ ขาว ดำ บาง กว้าง อินสแตนท์ โพลารอยด์ ขอบ border frame white black thin wide instant polaroid edge",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "Border"
          ]
        },
        {
          "kind": "photo",
          "photo": "velvia-wide",
          "alt": "Fujifilm Velvia แบบขอบ Wide สีขาวและวันที่"
        },
        {
          "kind": "photo",
          "photo": "acros-instant",
          "alt": "Fujifilm Acros แบบขอบ Instant สีขาวและคำบรรยาย GRKU <3"
        },
        {
          "kind": "table",
          "head": [
            "การตั้งค่า",
            "ค่าที่มีให้เลือก"
          ],
          "rows": [
            [
              "**Style**",
              "Off, **Thin** (3% ของด้านสั้น), **Wide** (6%), **Instant** (4% โดยด้านล่างกว้างเป็นสามเท่า เหมือนรูปโพลารอยด์) บน GR IV ขอบขนาดใหญ่จะแคบลงเล็กน้อยเมื่อกล้องมีหน่วยความจำเหลือน้อย"
            ],
            [
              "**Color**",
              "White (ค่าเริ่มต้น) หรือ Black"
            ],
            [
              "**Show Icon**",
              "On (ค่าเริ่มต้น) หรือ Off"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "ไฟล์ JPEG จะขยายตามขอบ จึงไม่บังส่วนไหนของภาพ การแปลงไฟล์ RAW ในกล้องก็เพิ่มขอบได้เหมือนกัน"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "ไม่มีอยู่ในการ์ดหรือเปล่า",
          "text": "Border ปิดอยู่ตอนเริ่มใช้งาน ในขั้นตอนที่ 3 ของการ[ติดตั้ง](site:install) ให้เปิด Border การ์ดหนึ่งใบรับโมดูลได้สูงสุด 10 ตัว ถ้าเปิดครบ 10 ตัวแล้ว ให้ปิดตัวที่ไม่ค่อยได้ใช้"
        }
      ]
    },
    "mode-dial": {
      "title": "แป้นหมุนโหมดและ U1–U3",
      "seo": "GRKU บนปุ่มหมุนโหมด: การตั้งค่า U1, U2, U3",
      "lead": "เปิดหรือปิด GRKU ในแต่ละตำแหน่งแป้นหมุน แล้วบันทึกทั้งลุคเก็บไว้ใน U1, U2 หรือ U3",
      "keywords": "แป้นหมุนโหมด โหมดผู้ใช้ บันทึกค่าปัจจุบัน ตำแหน่ง mode dial u1 u2 u3 user mode save current settings p av tv m sn position",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "Customize (C)",
            "GRKU",
            "GRKU Settings",
            "Mode Dial"
          ]
        },
        {
          "kind": "screen",
          "screen": "mode-dial",
          "alt": "หน้า Mode Dial: เปิดหรือปิด GRKU ในแต่ละตำแหน่ง และ Save Current Settings บน U3"
        },
        {
          "kind": "p",
          "text": "P, Av, Tv, M และ Sn (GR IV) ใช้การตั้งค่า GRKU ชุดเดียวกัน แต่ละตำแหน่งเลือกเปิด **On** หรือปิด **Off** GRKU ได้ โดยจะทำงานเมื่อเปิด **Enable GRKU** ไว้"
        },
        {
          "kind": "h2",
          "id": "user",
          "text": "U1, U2 และ U3"
        },
        {
          "kind": "list",
          "items": [
            "**On**: ตำแหน่งนี้ใช้ชุดตั้งค่า GRKU ร่วมกัน เหมือน P, Av, Tv และ M",
            "**Off**: ตำแหน่งนี้ถ่ายโดยไม่ใช้ GRKU",
            "**Save Current Settings**: บันทึกค่าตั้งกล้องและค่าตั้ง GRKU ตอนนี้ลงในตำแหน่งนี้ หมุนแป้นมาที่นี่แล้วค่าทั้งคู่จะกลับมา ตำแหน่งนั้นจะแสดงชื่อสิ่งที่บันทึกไว้ แต่มันจะไม่บันทึกการเรียง ADJ, Enable at Start, Enable GRKU หรือค่าตั้ง Mode Dial"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "การบันทึกในเมนูกล้อง",
          "text": "ถ้าบันทึกโหมดผู้ใช้ซ้ำผ่านเมนูกล้องของ RICOH ลุค GRKU ในตำแหน่งนั้นจะหาย ให้ใช้ **Save Current Settings** ใน GRKU Settings แทน"
        }
      ]
    },
    "raw": {
      "title": "การโพรเซส RAW",
      "seo": "ล้างไฟล์ GR DNG ด้วยฟิล์มลุค (การล้าง RAW ในกล้อง)",
      "lead": "GRKU ไม่เคยแก้ข้อมูลดิบ โพรเซสไฟล์ DNG ในกล้องด้วย GRKU หรือบนคอมพิวเตอร์ก็ได้",
      "keywords": "raw dng โพรเซส ในกล้อง เล่นภาพ raw dng development develop in camera playback lightroom camera raw exiftool xmp uncropped",
      "blocks": [
        {
          "kind": "h2",
          "id": "camera",
          "text": "ในกล้อง"
        },
        {
          "kind": "steps",
          "items": [
            "เปิดไฟล์ DNG ในโหมดเล่นภาพแล้วเริ่มโพรเซส RAW",
            "ถ้าจะเปลี่ยนฟิล์มลุค ให้เปิดรายการ Image Control แล้วกด {{Fn}} บนลุคนั้นเพื่อปรับแต่ง",
            "หากต้องการตั้งค่า Grain, Glow, Border หรือ Date Imprint ให้เปิดแถว **GRKU** ที่ท้ายรายการ",
            "สั่งล้างภาพ"
          ]
        },
        {
          "kind": "p",
          "text": "การล้างเริ่มจากค่าตั้ง GRKU ที่บันทึกไว้ใน DNG เมื่อไฟล์นั้นมีข้อมูล แถว GRKU เปลี่ยนเฉพาะการล้างครั้งนี้เท่านั้น"
        },
        {
          "kind": "h2",
          "id": "computer",
          "text": "บนคอมพิวเตอร์"
        },
        {
          "kind": "p",
          "text": "รูปที่ถ่ายโดยเปิด GRKU จะบันทึกค่าต่าง ๆ ไว้ใน XMP ทำให้ exiftool และโปรแกรมอ่าน XMP ตัวอื่นแสดงค่าเหล่านี้ได้ เมื่อเปิด **Uncropped RAW** อยู่ Lightroom และ Camera Raw จะเปิดไฟล์ DNG พร้อมครอปตามช็อตที่ถ่าย และคุณยกเลิกครอปนั้นทีหลังได้"
        },
        {
          "kind": "p",
          "text": "สำหรับภาพที่มีอยู่แล้ว หน้า [Develop](doc:develop) จะใส่ลุคและเอฟเฟกต์แบบเดียวกันให้ในเบราว์เซอร์"
        }
      ]
    },
    "settings": {
      "title": "GRKU Settings",
      "seo": "GRKU Settings ใน MENU: อธิบายทุกตัวเลือก",
      "lead": "การตั้งค่าตัว GRKU เอง ใน MENU",
      "keywords": "ตั้งค่า grku เปิดตั้งแต่เริ่มใช้งาน เก็บค่าล่าสุด uncropped raw หน่วยระยะ เมตร ฟุต แบตเตอรี่ ไอคอนหน้าจอดูภาพ หน้าจอปิดเครื่อง custom picture แสดงข้อความ ลำดับ adj ซ่อน บนสุด grku settings enable at start keep last uncropped raw distance unit meters feet battery playback icons shutdown screen custom picture show text adj order hidden top",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "Customize (C)",
            "GRKU",
            "GRKU Settings"
          ]
        },
        {
          "kind": "screen",
          "screen": "settings",
          "alt": "หน้า GRKU Settings ใน MENU"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "การทำงาน"
          ],
          "rows": [
            [
              "**Enable at Start**",
              "สถานะ GRKU ตอนเปิดเครื่องแต่ละครั้ง: **On**, **Off** หรือ **Keep Last** ตามที่ตั้งทิ้งไว้"
            ],
            [
              "**Mode Dial**",
              "เปิดหรือปิด GRKU ในแต่ละตำแหน่งบนแป้นหมุนโหมด รวมถึง U1 ถึง U3 ดูเพิ่มที่ [Mode dial](doc:mode-dial)"
            ],
            [
              "**ADJ Order**",
              "ลำดับของโมดูลในรายการ GRKU ของ ADJ"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "adj-order",
          "text": "ลำดับ ADJ"
        },
        {
          "kind": "p",
          "text": "เลื่อนโมดูลขึ้นหรือลงในรายการ GRKU **Top 1** ถึง **Top 4** ทำให้โมดูลมีตัวเลือกของตัวเองบนแถบ ADJ ก่อน GRKU จึงกดเรียกใช้ได้ในปุ่มเดียว **Hidden** ซ่อนโมดูลจาก ADJ แต่ยังทำงานอยู่"
        },
        {
          "kind": "h2",
          "id": "shooting",
          "text": "การตั้งค่าการถ่ายภาพ"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "การทำงาน"
          ],
          "rows": [
            [
              "**Uncropped RAW**",
              "เปิด: ไฟล์ DNG แต่ละไฟล์เก็บภาพทั้งเซนเซอร์ไว้ พร้อมกรอบครอปของภาพนั้นเป็นค่าที่ Lightroom และ Camera Raw ย้อนกลับได้ แต่ Lightroom อาจไม่ใช้ค่าเริ่มต้น RAW ของตัวเอง"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "display",
          "text": "การตั้งค่าการแสดงผล"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "การทำงาน"
          ],
          "rows": [
            [
              "**Distance Unit**",
              "ระยะ Snap focus และสเกลโฟกัสแบบแมนนวลเป็น **Meters** หรือ **Feet**"
            ],
            [
              "**Simplified Info. Battery**",
              "แสดงไอคอนแบตเตอรี่ในหน้าจอข้อมูลแบบย่อของ live view ด้วย"
            ],
            [
              "**Effect Icons in Playback**",
              "แสดงไอคอนของ Grain, Bloom, Halation, Border และ Date Imprint รวมถึงสัดส่วนครอปของภาพในหน้าแรกของข้อมูลการดูภาพแบบละเอียด เปิดไว้เป็นค่าเริ่มต้น"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "shutdown",
          "text": "หน้าจอตอนปิดเครื่อง"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "การทำงาน"
          ],
          "rows": [
            [
              "**Custom Picture**",
              "แสดงรูปของคุณเอง (`GRKU/GOODBYE.JPG`) ตอนปิดกล้อง ค่าเริ่มต้นคือเปิด ดูเพิ่มที่ [รูปตอนปิดกล้อง](doc:shutdown)"
            ],
            [
              "**Show Text**",
              "แสดงหรือซ่อนจำนวนช็อตและเวอร์ชันเฟิร์มแวร์ที่กล้องวาดทับบนรูปตอนปิดเครื่อง"
            ]
          ]
        }
      ]
    },
    "looks": {
      "title": "เลือกลุคบนเว็บ",
      "seo": "วิธีเลือกฟิล์มลุคและนำเข้า LUT หรือ Lightroom preset",
      "lead": "เลือกฟิล์มลุคให้การ์ด ค้นหาในคลัง และนำเข้า LUT ของคุณเอง",
      "keywords": "คลัง เลือกลุค ค้นหา ช่อง ฟรี 10 40 นำเข้า lut cube xmp lightroom preset ชนิด ฟิล์มเนกาทีฟ ฟิล์มสไลด์ ขาวดำ library choose looks search slots free 10 40 import lut cube xmp lightroom preset kinds negative slide black and white",
      "blocks": [
        {
          "kind": "p",
          "text": "ขั้นตอนที่ 1 ของหน้า [ติดตั้ง](site:install) แสดงคลังทั้งหมด ทั้ง Kodak, Fujifilm, Ilford, CineStill, Polaroid ฟิล์มหนังและฟิล์มสไลด์ ขาวดำ ฟิล์มซิมูเลชันของกล้อง FUJIFILM และฟิล์มลุคของ GRKU เองอย่าง Positive GRII กับ FinePix CCD"
        },
        {
          "kind": "h2",
          "id": "pick",
          "text": "เลือกฟิล์มลุค"
        },
        {
          "kind": "steps",
          "items": [
            "แตะฟิล์มลุคเพื่อดูตัวอย่างกับรูปตัวอย่าง",
            "ติ๊กเลือกฟิล์มลุคที่ต้องการใส่ลงการ์ด ใช้ฟรีได้ 10 ฟิล์มลุค และการ์ดหนึ่งใส่ได้สูงสุด 40 ฟิล์มลุค",
            "ค้นหาจากชื่อ ยี่ห้อ หรือประเภท เช่น \"portra\" \"fuji\" หรือ \"ขาวดำ\" พิมพ์คำยาวผิดนิดหน่อยก็ได้"
          ]
        },
        {
          "kind": "p",
          "text": "อยากเห็นฟิล์มลุคกับรูปของคุณเองก่อนไหม กด **ลองใช้กับรูปของคุณ** เพื่อเปิดบน [หน้า Develop](doc:develop)"
        },
        {
          "kind": "h2",
          "id": "import",
          "text": "นำเข้าฟิล์มลุคของคุณเอง"
        },
        {
          "kind": "steps",
          "items": [
            "ในขั้นตอนที่ 1 กด **นำเข้า LUT**",
            "เลือกไฟล์ `.cube` หรือพรีเซ็ต `.xmp` ของ Lightroom",
            "ฟิล์มลุคจะขึ้นใต้ **รายการนำเข้า** ติ๊กเลือกได้เหมือนฟิล์มลุคอื่น ๆ"
          ]
        },
        {
          "kind": "p",
          "text": "พรีเซ็ต Lightroom จะกลายเป็นฟิล์มลุคตามค่าสี ส่วนค่าที่เปลี่ยนไปตามแต่ละรูปจะเป็นค่าโดยประมาณเท่านั้น"
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "โมดูล"
        },
        {
          "kind": "p",
          "text": "ขั้นตอนที่ 3 เลือกโมดูล การ์ดใส่ได้สูงสุด 10 จาก 11 โมดูล โดย Border จะปิดอยู่ตอนเริ่ม ขั้นตอนที่ 3 ยังเพิ่มสูตรสีและ[รูปตอนปิดกล้อง](doc:shutdown)ได้ด้วย"
        }
      ]
    },
    "plus": {
      "title": "GRKU Plus",
      "seo": "GRKU Plus: ราคา การชำระเงิน และคีย์ของคุณ",
      "lead": "จ่ายครั้งเดียวสำหรับลุคบนการ์ดเพิ่มแบบไม่บังคับ ส่วน GRKU ยังใช้ฟรีได้เหมือนเดิม",
      "keywords": "plus ราคา จ่าย ซื้อ คีย์ อีเมล promptpay truemoney สล็อต แพ็ก ทั้งหมด ปลดล็อก คืนเงิน บาท pay buy key email slots pack everything unlock refund baht",
      "blocks": [
        {
          "kind": "p",
          "text": "ทุกอย่างใน GRKU ใช้ได้ฟรี พรีวิวทุกฟิล์มลุคได้ฟรี ใส่ฟิล์มลุคจากคลังลงการ์ดได้ฟรี 10 ฟิล์มลุค และทุกโมดูล สูตรสี กับหน้า Develop ก็ฟรี GRKU Plus มีไว้สำหรับคนที่อยากใส่ฟิล์มลุคลงการ์ดเพิ่มและอยากสนับสนุนโปรเจกต์"
        },
        {
          "kind": "h2",
          "id": "tiers",
          "text": "สิ่งที่ปลดล็อกได้"
        },
        {
          "kind": "list",
          "items": [
            "**25 สล็อต**: เลือกลุคใส่การ์ดได้ 25 ลุคแทน 10 ลุค",
            "**หนึ่งแพ็ก**: ได้ทุกลุคของตระกูลฟิล์มหนึ่งตระกูล เช่น ฟิล์มสี Kodak หรือขาวดำ เพิ่มจากสล็อตฟรีที่มี",
            "**ทั้งหมด**: ได้ทุกลุคและลุคใหม่ทั้งหมด ใส่บนการ์ดได้ทีละ 40 ลุค รวมถึง GRKU Studio ทั้งหมด"
          ]
        },
        {
          "kind": "p",
          "text": "การซื้อทุกแบบยังเปิดใช้ GRKU Studio และดีไซน์ทั้งหมดด้วย ดูราคาได้ที่หน้า [GRKU Plus](site:plus) ยอดที่เคยจ่ายมาก่อนหน้าจะถูกนำไปนับรวมกับแพ็กทั้งหมดและ 25 สล็อต"
        },
        {
          "kind": "h2",
          "id": "pay",
          "text": "การชำระเงิน"
        },
        {
          "kind": "steps",
          "items": [
            "เปิด [GRKU Plus](site:plus) แล้วเลือกสิ่งที่ต้องการปลดล็อก",
            "จ่ายด้วย PromptPay QR จากแอปธนาคารไทยตัวไหนก็ได้ แล้วอัปโหลดสลิป หรือถ้าหน้าต่างนั้นมีตัวเลือก ก็วางลิงก์ซองของขวัญ TrueMoney ได้เลย",
            "ฟิล์มลุคจะปลดล็อกทันที",
            "คีย์จะถูกส่งทางอีเมล ใช้ได้กับทุกอุปกรณ์"
          ]
        },
        {
          "kind": "h2",
          "id": "key",
          "text": "ใช้งานคีย์บนอุปกรณ์อื่น"
        },
        {
          "kind": "p",
          "text": "เปิด [GRKU Plus](site:plus-key) เลือก **ฉันมีคีย์อยู่แล้ว** วางคีย์ แล้วกด **ปลดล็อก** ถ้าไม่ได้รับอีเมล กด **ฉันมีคีย์อยู่แล้ว** เพื่อให้ส่งซ้ำได้"
        }
      ]
    },
    "shutdown": {
      "title": "รูปตอนปิดเครื่องและ GRKU Studio",
      "seo": "ภาพหน้าจอตอนปิดเครื่องแบบกำหนดเองสำหรับ RICOH GR (GRKU Studio)",
      "lead": "แสดงรูปของตัวเองตอนปิดกล้อง หรือออกแบบรูปใน GRKU Studio",
      "keywords": "ปิดเครื่อง หน้าจอ รูปภาพ ลาก่อน ปิดกล้อง studio ออกแบบ สติกเกอร์ เทมเพลต โลโก้ รูปกำหนดเอง shutdown screen picture goodbye power off design sticker template logo custom picture",
      "blocks": [
        {
          "kind": "p",
          "text": "ตอนปิดกล้อง GRKU สามารถแสดงรูปที่เลือกไว้ได้ กล้องจะอ่านรูปจาก `GRKU/GOODBYE.JPG` บนการ์ด"
        },
        {
          "kind": "h2",
          "id": "choose",
          "text": "เลือกรูป"
        },
        {
          "kind": "steps",
          "items": [
            "ในขั้นตอนที่ 3 ของหน้า[ติดตั้ง](site:install) ให้เปิดหน้าจอปิดเครื่องของการ์ด",
            "เลือกแบบสำเร็จรูป ทำเอง หรือเลือก Off เพื่อใช้หน้าจอของกล้องเอง",
            "เขียนการ์ดตามปกติ รูปใหม่จะขึ้นตั้งแต่เปิดเครื่องครั้งถัดไป ถ้าใช้ GRKU.zip ให้ดาวน์โหลด `GOODBYE.JPG` ด้วยแล้วคัดลอกลงโฟลเดอร์ `GRKU` บนการ์ด"
          ]
        },
        {
          "kind": "p",
          "text": "แบบสำเร็จรูปมีทั้งพระอาทิตย์ตก พระจันทร์ง่วง แมวหลับ ม้วนฟิล์ม และใบเสร็จที่ใส่ข้อความของคุณเองได้ ส่วนรูปของคุณเองจะถูกครอปเป็นสัดส่วน 3:2"
        },
        {
          "kind": "h2",
          "id": "studio",
          "text": "GRKU Studio"
        },
        {
          "kind": "p",
          "text": "GRKU Studio เป็นโปรแกรมแต่งรูปแบบเลเยอร์ มีทั้งพื้นหลัง รูปของคุณ โลโก้ ไฟล์ PNG ตัดพื้น ตัวอักษร 8 ฟอนต์ สติกเกอร์ กรอบรูป และเทมเพลตสำหรับสงกรานต์ ลอยกระทง ปีใหม่ และวาเลนไทน์ เพิ่มรูปได้จากแถบเครื่องมือ ลากไฟล์มาวาง หรือวางจากคลิปบอร์ด"
        },
        {
          "kind": "p",
          "text": "GRKU Studio บางส่วนและบางแบบใช้ได้ฟรี ซื้อ [GRKU Plus](doc:plus) ครั้งเดียวก็ปลดล็อกทั้งหมด"
        },
        {
          "kind": "h2",
          "id": "camera",
          "text": "บนกล้อง"
        },
        {
          "kind": "p",
          "text": "ใน[ตั้งค่า GRKU](doc:settings#shutdown) **Custom Picture** ใช้เปิดหรือปิดรูป และ **Show Text** ใช้ซ่อนตัวนับจำนวนรูปที่กล้องซ้อนทับไว้"
        }
      ]
    },
    "develop": {
      "title": "หน้า Develop",
      "seo": "ฟิลเตอร์ฟิล์มออนไลน์ฟรีสำหรับรูปของคุณ (หน้า Develop)",
      "lead": "แต่งรูปที่มีอยู่แล้วให้ได้ฟิล์มลุคและเอฟเฟกต์ของ GRKU บนเบราว์เซอร์",
      "keywords": "develop แต่งรูป รูปภาพ แก้ไข เบราว์เซอร์ ออนไลน์ ฟิลเตอร์ ลองใช้ พรีวิว ดาวน์โหลด ไม่ใช้กล้อง มือถือ edit photo browser online filter try preview download no camera phone",
      "blocks": [
        {
          "kind": "p",
          "text": "[หน้า Develop](site:develop) แสดงฟิล์มลุคของ GRKU บนรูปของคุณเอง โดยทำเอฟเฟกต์ด้วยโค้ดโมดูลของกล้อง ไม่ต้องใช้กล้อง และรูปไม่เคยออกจากเครื่องคุณ"
        },
        {
          "kind": "steps",
          "items": [
            "เปิด[หน้า Develop](site:develop) แล้วเพิ่มรูป",
            "เลือกฟิล์มลุค แล้วเพิ่มเอฟเฟกต์ Glow, Light Leak, Diffusion, Film Softness, Grain, Date Imprint และ Border",
            "บันทึกรูป หรือกด **เพิ่มลงใน GR ของฉัน** หน้าติดตั้งจะเปิดขึ้นมาพร้อมฟิล์มลุคและโมดูลที่เลือกไว้ คุณตั้งความแรงของแต่ละเอฟเฟกต์บนกล้องได้เอง"
          ]
        },
        {
          "kind": "p",
          "text": "แบบฟรีบันทึกได้ด้วยฟิล์มลุคของกล้อง ฟิล์มลุคเริ่มต้น หรือไม่ใส่ฟิล์มลุค ขนาดสูงสุด 2048 px พร้อมเครดิต GRKU เล็ก ๆ การซื้อ GRKU Plus แบบใดก็ได้จะบันทึกทุกฟิล์มลุคได้เต็มขนาดโดยไม่มีเครดิตนี้"
        }
      ]
    },
    "assistant": {
      "title": "ผู้ช่วย AI",
      "seo": "ผู้ช่วย AI ของ GRKU: ถามเรื่องกล้อง GR และฟิล์มลุคได้",
      "lead": "ถามผู้ช่วย GRKU เรื่องการติดตั้ง กล้องของคุณ หรือฟิล์มลุคที่เหมาะกับรูปของคุณ",
      "keywords": "ผู้ช่วย ai แชท ถามคำถาม ช่วยเหลือ บอท มาสคอต ความจำ ai assistant chat ask question help bot mascot memory",
      "blocks": [
        {
          "kind": "p",
          "text": "ปุ่มกลมมุมขวาล่างของทุกหน้าเปิด ผู้ช่วย GRKU ที่รู้เนื้อหาในเว็บและคู่มือนี้ และตอบเป็นภาษาคุณพร้อมลิงก์ไปยังหน้าที่เกี่ยวข้อง"
        },
        {
          "kind": "h2",
          "id": "ask",
          "text": "คำถามที่น่าลองถาม"
        },
        {
          "kind": "list",
          "items": [
            "\"ติดตั้ง GRKU บน GR IIIx ยังไง\"",
            "\"กล้องขึ้นอัปเดตเฟิร์มแวร์ตอนกด MENU ค้าง\"",
            "\"แนะนำลุคโทนอุ่นสำหรับถ่ายพอร์ตเทรต\"",
            "\"Halation ทำอะไรได้บ้าง\""
          ]
        },
        {
          "kind": "p",
          "text": "ในแต่ละหน้าของคู่มือนี้ **Ask AI about this page** จะเปิดผู้ช่วยโดยอิงจากหน้านั้น"
        },
        {
          "kind": "h2",
          "id": "limits",
          "text": "เรื่องน่ารู้"
        },
        {
          "kind": "list",
          "items": [
            "มีจำนวนข้อความต่อวัน ผู้ใช้ GRKU Plus จะคุยได้ลึกขึ้นและได้คำตอบละเอียดขึ้น",
            "ถ้าเปิดความจำไว้ เบราว์เซอร์จะเก็บกล้องและฟิล์มลุคที่คุณชอบ แล้วส่งไปพร้อมกับคำถามของคุณ",
            "AI อาจผิดพลาดได้ หากเกี่ยวกับเฟิร์มแวร์กล้อง ให้ทำตามคู่มือนี้และ RICOH"
          ]
        }
      ]
    },
    "not-showing": {
      "title": "GRKU ไม่ขึ้น",
      "seo": "GRKU ไม่ขึ้นบนกล้อง: วิธีแก้ไข",
      "lead": "ตรวจเช็กตามลำดับนี้ทีละข้อ",
      "keywords": "ไม่ขึ้น ใช้งานไม่ได้ หาย adj ไม่มี grku เออเรอร์ ติดตั้ง รายงาน บูต เฟิร์มแวร์ โหมด not showing not working missing adj no grku error install.err report boot.txt 47 48 firmware mode set",
      "blocks": [
        {
          "kind": "h2",
          "id": "checks",
          "text": "ตรวจเช็กตามลำดับ"
        },
        {
          "kind": "steps",
          "items": [
            "**รอสักครู่** GRKU โหลดประมาณ 8 ถึง 10 วินาทีหลังเปิดเครื่อง และนานกว่านั้นบน GR IV หรือหลังติดตั้งหรืออัปเดต รูปที่ถ่ายก่อนหน้านั้นจะไม่มี GRKU",
            "**กล้องและเฟิร์มแวร์** เปิด MENU แล้วเช็กเวอร์ชันเฟิร์มแวร์ ต้องอยู่ใน [กล้องที่รองรับ](doc:cameras) ดูเพิ่มที่ [วิธีเช็กเวอร์ชันเฟิร์มแวร์](doc:firmware)",
            "**สคริปต์ในการ์ด** คุณกด {{MENU}} ค้างตอนเปิดเครื่องครั้งแรก และเห็น **Mode Set Command** กับ **Complete** หรือไม่ หากไม่เห็น ให้ทำขั้นตอน [เริ่มใช้งานครั้งแรก](doc:install#first-start) ใหม่อีกครั้ง",
            "**ไฟล์อยู่ชั้นบนสุด** การ์ดต้องมีโฟลเดอร์ `SCRIPT` อยู่ชั้นบนสุด ไม่ใช่อยู่ใน `DCIM` หรือโฟลเดอร์อื่น",
            "**ตัวอ่านการ์ด** เขียนการ์ดผ่านตัวอ่านการ์ด แทนการต่อสาย USB จากกล้อง",
            "**เปิดใช้งาน GRKU** ใน MENU ที่ Customize (C) > GRKU ให้ตรวจดูว่า **Enable GRKU** เป็น On"
          ]
        },
        {
          "kind": "h2",
          "id": "errors",
          "text": "เลขข้อผิดพลาด"
        },
        {
          "kind": "p",
          "text": "ถ้า GRKU หยุดทำงาน บนการ์ดอาจมีไฟล์ `SCRIPT/GRKU/INSTALL.ERR` พร้อมตัวเลข"
        },
        {
          "kind": "table",
          "head": [
            "หมายเลข",
            "ความหมาย",
            "วิธีแก้"
          ],
          "rows": [
            [
              "47, 48",
              "GRKU ไม่รองรับเฟิร์มแวร์บิลด์นี้",
              "ตรวจดูว่ารองรับเฟิร์มแวร์นี้ไหม แล้วอัปเดต GRKU ถ้ายังไม่หาย ให้ส่งรายงาน"
            ],
            [
              "60, 61, 62",
              "เริ่มทำงานไม่เสร็จ",
              "เขียนการ์ดใหม่ ถ้ายังไม่หาย ให้ส่งรายงาน"
            ],
            [
              "36, 37",
              "GRKU เขียนหรืออ่านแผนการทำงานบนการ์ดไม่ได้",
              "เขียนการ์ดใหม่อีกครั้ง"
            ],
            [
              "30, 31",
              "GRKU อ่านฟิล์มลุคไม่ได้",
              "เขียนการ์ดใหม่ ถ้ายังไม่หาย ให้ลองเปลี่ยนการ์ด"
            ],
            [
              "50 ถึง 55, 57",
              "โมดูลโหลดไม่สำเร็จ",
              "อัปเดต GRKU หากยังไม่หาย ให้ส่งรายงาน"
            ],
            [
              "56",
              "โมดูลสำหรับภาพสีถูกตัดออกบน GR IV Monochrome ซึ่งเป็นเรื่องปกติ",
              "ไม่มีอะไร"
            ],
            [
              "อื่นๆ",
              "GRKU หยุดทำงานด้วยสาเหตุอื่น",
              "ส่งรายงานพร้อมหมายเลข"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "report",
          "text": "ส่งรายงาน"
        },
        {
          "kind": "p",
          "text": "อีเมลไปที่ [support@grku.app](support) พร้อมระบุรุ่นกล้องและเวอร์ชันเฟิร์มแวร์ของคุณ แล้วแนบไฟล์เหล่านี้จากการ์ดมาด้วย ไฟล์เหล่านี้ไม่มีรูปภาพ แต่อาจมีชื่อสูตรสีและฟิล์มลุคที่คุณนำเข้าไว้ เปิดดูก่อนได้ถ้าต้องการ"
        },
        {
          "kind": "files",
          "items": [
            [
              "SCRIPT/GRKU/INSTALL.ERR",
              "สาเหตุที่หยุดทำงานตอนเริ่ม"
            ],
            [
              "GRKU/REPORT.TXT",
              "รุ่นกล้อง เฟิร์มแวร์ และเวอร์ชัน GRKU"
            ],
            [
              "GRKU/BOOT.TXT",
              "สิ่งที่เกิดขึ้นตอนเปิดเครื่อง"
            ]
          ]
        }
      ]
    },
    "stuck": {
      "title": "กล้องค้างตอนเปิดเครื่อง",
      "seo": "RICOH GR ค้างตอนเปิดเครื่อง: วิธีแก้ปัญหา",
      "lead": "GRKU เปลี่ยนแปลงการทำงานของกล้องเฉพาะตอนที่เปิดอยู่เท่านั้น ลองเปิดกล้องโดยไม่ใส่การ์ด",
      "keywords": "ค้าง แข็ง เปิดไม่ติด จอดำ กู้คืน รีเซ็ต แบตเตอรี่ stuck freeze hang frozen not start black screen brick recover recovery reset battery",
      "blocks": [
        {
          "kind": "note",
          "tone": "warning",
          "title": "ก่อนเริ่มทำ",
          "text": "ห้ามดันหรือดึงกระบอกเลนส์ และห้ามถอดแหล่งจ่ายไฟระหว่างอัปเดตเฟิร์มแวร์อย่างเป็นทางการ"
        },
        {
          "kind": "h2",
          "id": "without-card",
          "text": "เปิดกล้องโดยไม่ใส่การ์ด"
        },
        {
          "kind": "steps",
          "items": [
            "ลองปิดกล้อง",
            "ถ้าไม่ตอบสนอง ให้ถอดแบตเตอรี่ออก แบตเตอรี่อาจยังร้อนอยู่",
            "ถอดการ์ดออก",
            "ใส่แบตเตอรี่ที่ชาร์จแล้วและเปิดกล้องโดยไม่ใส่การ์ด"
          ]
        },
        {
          "kind": "h2",
          "id": "still",
          "text": "ถ้ายังเปิดไม่ติด"
        },
        {
          "kind": "steps",
          "items": [
            "โดยไม่ใส่การ์ด ให้กดปุ่มเล่นภาพค้างไว้เพื่อเปิดกล้องในโหมดเล่นภาพ",
            "ถ้าเมนูเปิดขึ้น ให้รีเซ็ตการตั้งค่ากล้อง การรีเซ็ตจะลบการตั้งค่าที่คุณตั้งไว้เอง",
            "เปิดกล้องอีกครั้งโดยไม่ใส่การ์ด"
          ]
        },
        {
          "kind": "p",
          "text": "ถ้ายังเปิดไม่ติด ให้หยุดใช้ GRKU แล้วติดต่อศูนย์บริการ RICOH ดูได้ทุกขั้นตอนที่ [คู่มือกู้คืนระบบ](site:recovery)"
        }
      ]
    },
    "faq": {
      "title": "คำถามที่พบบ่อย",
      "seo": "คำถามและคำตอบเกี่ยวกับ GRKU",
      "lead": "คำตอบสั้นๆ สำหรับเรื่องที่คนถามบ่อยที่สุด",
      "keywords": "faq คำถาม ทำไม รูปแรก ไม่มี ฟิล์มลุค สูตรสี กล่อง เรียกคืน ฟอร์แมต โทรศัพท์ นำเข้า gr โลก ปลอดภัย ประกัน question why first photos no look box recall format phone import gr world safe warranty",
      "blocks": [
        {
          "kind": "h2",
          "id": "first-photos",
          "text": "ทำไมรูปแรกๆ ของฉันถึงไม่มีฟิล์มลุค"
        },
        {
          "kind": "p",
          "text": "ช่วงที่ GRKU กำลังโหลด ประมาณ 8 ถึง 10 วินาทีหลังเปิดกล้อง กล้องจะใช้การตั้งค่าของตัวเอง รอจน **GRKU** ขึ้นที่ด้านบนของหน้าจอ"
        },
        {
          "kind": "h2",
          "id": "dng",
          "text": "ทำไม DNG ของฉันถึงเป็น 3:2 หรือไม่มีฟิล์มลุค"
        },
        {
          "kind": "p",
          "text": "GRKU เปลี่ยนไฟล์ JPEG ส่วน DNG เก็บข้อมูลดิบไว้ ดูเพิ่มเติมที่ [การพัฒนาไฟล์ RAW](doc:raw)"
        },
        {
          "kind": "h2",
          "id": "user-mode",
          "text": "ทำไมโหมดผู้ใช้ถึงไม่ดึงฟิล์มลุคของฉันกลับมา"
        },
        {
          "kind": "p",
          "text": "โหมดผู้ใช้ที่บันทึกจากเมนูของกล้อง RICOH จะไม่เก็บการตั้งค่า GRKU ให้ใช้ [Save Current Settings](doc:mode-dial) หรือ [สูตรสี](doc:recipes)"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "GRKU เปลี่ยนเฟิร์มแวร์ของกล้องไหม"
        },
        {
          "kind": "p",
          "text": "ไม่ GRKU โหลดจากการ์ดตอนที่กล้องเปิดอยู่ ส่วน SD scripts ซึ่งเป็นค่าในกล้อง จะเปิดอยู่จนกว่าคุณจะ [ปิด](doc:update#scripts-off) และ **Save Current Settings** ก็บันทึกลงในโหมดผู้ใช้ของกล้องด้วย"
        },
        {
          "kind": "h2",
          "id": "menu-again",
          "text": "ต้องกด MENU ค้างอีกไหมหลังอัปเดตหรือเปลี่ยนการ์ด"
        },
        {
          "kind": "p",
          "text": "ไม่ใช่ กด {{MENU}} ค้างไว้เฉพาะครั้งแรก"
        },
        {
          "kind": "h2",
          "id": "version",
          "text": "การ์ดของฉันใช้ GRKU เวอร์ชันไหน"
        },
        {
          "kind": "p",
          "text": "เปิด MENU แล้วดู **About GRKU** ที่ท้ายหมวด GRKU ในแท็บ Customize"
        },
        {
          "kind": "h2",
          "id": "phone",
          "text": "ทำไมโทรศัพท์นำเข้ารูปไม่ได้"
        },
        {
          "kind": "p",
          "text": "การติดตั้ง GRKU ไม่เปลี่ยนรูปในโฟลเดอร์ `DCIM` ลองอัปเดต GR WORLD เป็นเวอร์ชันล่าสุด ถ้ายังไม่ได้ผล ให้ [ส่งอีเมลหาฝ่ายช่วยเหลือ](support)"
        },
        {
          "kind": "h2",
          "id": "lightroom",
          "text": "ใช้ลุคเหล่านี้ใน Lightroom ได้ไหม"
        },
        {
          "kind": "p",
          "text": "ไม่ได้โดยตรง GRKU ไม่ได้ทำพรีเซ็ตของ Lightroom ลองดูฟิล์มลุคกับรูปของคุณได้ที่ [หน้า Develop](doc:develop)"
        }
      ]
    },
    "cameras": {
      "title": "กล้องที่รองรับ",
      "seo": "GRKU รองรับกล้อง RICOH GR และเฟิร์มแวร์รุ่นไหนบ้าง",
      "lead": "GRKU ทำงานบนกล้องและเฟิร์มแวร์เหล่านี้ร่วมกับเฟิร์มแวร์ทางการของ RICOH",
      "keywords": "กล้อง ที่รองรับ เฟิร์มแวร์ เวอร์ชัน cameras supported firmware version gr iii iiix iv hdf monochrome modeset dump",
      "blocks": [
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "เปิด **MENU** บนกล้องเพื่อดูเวอร์ชันเฟิร์มแวร์: ดูที่ [ตรวจดูเวอร์ชันเฟิร์มแวร์ของคุณ](doc:firmware) รุ่น GR รุ่นก่อนหน้าและกล้องอื่นๆ ไม่รองรับ GR IV Monochrome มีทุกโมดูลยกเว้นฟิล์มลุค"
        },
        {
          "kind": "p",
          "text": "กล้อง GR IV 30th Anniversary Edition มาพร้อมเฟิร์มแวร์ 1.20 จากโรงงาน ซึ่ง grku.app ยังไม่มีให้โหลด ให้อัปเดตกล้องรุ่นนี้เป็น 1.21 จาก RICOH ก่อน"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "การอัปเดตเฟิร์มแวร์กล้อง"
        },
        {
          "kind": "p",
          "text": "อัปเดตเฟิร์มแวร์กล้องจากหน้าสนับสนุนทางการของ RICOH เท่านั้น และตรวจดูก่อนว่า GRKU รองรับเวอร์ชันใหม่นี้ไหม GRKU ไม่เคยอัปเดตเฟิร์มแวร์ให้"
        },
        {
          "kind": "h2",
          "id": "dump",
          "text": "เฟิร์มแวร์ที่ GRKU ยังไม่รู้จัก"
        },
        {
          "kind": "p",
          "text": "[คู่มือดัมพ์เฟิร์มแวร์](site:firmware-dump) อธิบายวิธีอ่านเฟิร์มแวร์ของกล้องส่งให้นักพัฒนา เพื่อให้ GRKU รองรับได้"
        }
      ]
    }
  }
};
