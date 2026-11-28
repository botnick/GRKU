// The user manual in th, translated from en.ts with the Gemini tools (grku-tools/i18n-th.mjs,
// checked with i18n-review.mjs), never by hand.
import type { DocsContent } from '../types';

export const th: DocsContent = {
  "home": {
    "title": "คู่มือ GRKU",
    "seoTitle": "คู่มือ GRKU: การติดตั้ง ฟิล์มลุค และทุกการตั้งค่าสำหรับ RICOH GR III, IIIx, IV",
    "lead": "วิธีติดตั้ง GRKU ใช้ฟีเจอร์ต่างๆ บน GR ของคุณ และแก้ปัญหา ขั้นตอนสั้นๆ คำเข้าใจง่าย",
    "trust": "GRKU ทำงานจากการ์ด ไม่เคยเปลี่ยนเฟิร์มแวร์กล้อง",
    "need": "ต้องใช้อะไรบ้าง",
    "tasks": [
      {
        "slug": "install",
        "label": "ติดตั้ง GRKU",
        "hint": "ครั้งแรก"
      },
      {
        "slug": "firmware",
        "label": "เช็กเฟิร์มแวร์",
        "hint": "ก่อนติดตั้ง"
      },
      {
        "slug": "controls",
        "label": "ใช้ GRKU บนกล้อง",
        "hint": "ADJ และ MENU"
      },
      {
        "slug": "film-look",
        "label": "เลือกฟิล์มลุค",
        "hint": "Film Look"
      },
      {
        "slug": "not-showing",
        "label": "GRKU ไม่ขึ้น",
        "hint": "หาสาเหตุ"
      },
      {
        "slug": "update",
        "label": "อัปเดตหรือถอนการติดตั้ง",
        "hint": "เก็บการตั้งค่าของคุณไว้"
      }
    ],
    "rescue": "กล้องค้างตอนเปิดเครื่องไหม",
    "all": "ทุกหน้า",
    "credit": "GRKU เริ่มต้นจากโค้ดของ [GRKit](https://github.com/ahonn/GRKit) โดย ahonn (MIT)"
  },
  "ui": {
    "docs": "คู่มือ",
    "searchLabel": "ค้นหาในคู่มือ",
    "searchHome": "ค้นหา เช่น date, XPan, update",
    "searchShort": "ค้นหาในคู่มือ",
    "noResults": "ไม่พบสิ่งที่ค้นหา",
    "askInstead": "ถามผู้ช่วย AI",
    "browse": "หน้าในคู่มือ",
    "previous": "ก่อนหน้า",
    "next": "ถัดไป",
    "onThisPage": "ในหน้านี้",
    "stuck": "ยังติดขัดอยู่ไหม",
    "report": "ส่งอีเมลถึงฝ่ายช่วยเหลือ",
    "askAi": "ถาม AI เกี่ยวกับหน้านี้",
    "askAiText": "ผู้ช่วย GRKU ตอบคำถามเกี่ยวกับหน้านี้เป็นภาษาของคุณ",
    "askPrompt": "ฉันกำลังอ่านหน้าคู่มือ \"${title}\" ช่วยอธิบายให้ฟังเป็นขั้นตอนสั้นๆ",
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
    "settingCol": "บนกล้อง",
    "choicesCol": "ตัวเลือกและการทำงาน",
    "defaultMark": "ค่าเริ่มต้น",
    "withoutLabel": "ไม่มี",
    "photoBadge": "ภาพถ่ายจากกล้อง",
    "readingTime": "${n} นาที",
    "copyStep": "คัดลอกขั้นตอนนี้",
    "copiedStep": "คัดลอกแล้ว",
    "askStep": "ถาม AI เกี่ยวกับขั้นตอนนี้",
    "askStepPrompt": "ในหน้าคู่มือ \"${title}\" ขั้นตอนที่ ${n} เขียนว่า: \"${step}\" อธิบายขั้นตอนนี้ให้เข้าใจง่ายๆ",
    "captureBadge": "ภาพหน้าจอจากกล้อง",
    "drawnBadge": "ภาพจำลองจากเมนูจริง",
    "updated": "อัปเดตแล้ว"
  },
  "groups": {
    "start": "เริ่มต้นใช้งาน",
    "camera": "บนกล้อง",
    "site": "บน grku.app",
    "help": "ช่วยเหลือ"
  },
  "pages": {
    "start": {
      "title": "GRKU คืออะไร",
      "sources": [
        "web/src/plus.ts",
        "web/src/generated/modules.ts",
        "web/src/strings/en.ts (faq)",
        "resources/TERMS.md"
      ],
      "seo": "GRKU คืออะไร ฟิล์มลุคฟรีสำหรับ RICOH GR III, IIIx และ IV",
      "lead": "GRKU เพิ่มฟิล์มลุคและเอฟเฟกต์ภาพถ่ายให้ RICOH GR จากการ์ด",
      "keywords": "เกี่ยวกับ บทนำ ภาพรวม เริ่มต้น มือใหม่ ฟรี ปลอดภัย เฟิร์มแวร์ about introduction overview begin beginner free safe firmware",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKU เป็นส่วนเสริมฟรีสำหรับ RICOH GR III, GR IIIx และ GR IV เลือกฟิล์มลุคได้มากกว่า 150 แบบ และใส่ลงการ์ดได้สูงสุด 40 แบบ พร้อมสูตรสีและเอฟเฟกต์ เช่น ประทับวันที่ เกรน และกรอบภาพ XPan"
        },
        {
          "kind": "p",
          "text": "ตัวเสริมนี้ทำงานจากการ์ดตอนที่เปิดกล้อง ถ้าไม่มีการ์ด GRKU จะไม่โหลด และกล้องจะทำงานตามที่ RICOH ทำมา มีแค่สคริปต์ SD ซึ่งเป็นค่าตั้งในกล้องที่ยังอยู่ GRKU ไม่เคยเปลี่ยนเฟิร์มแวร์ของกล้อง"
        },
        {
          "kind": "h2",
          "id": "need",
          "text": "สิ่งที่ต้องใช้"
        },
        {
          "kind": "list",
          "items": [
            "กล้องและรุ่นเฟิร์มแวร์ที่รองรับ ดูที่ [กล้องที่รองรับ](doc:cameras)",
            "การ์ดความจำของกล้อง ใช้การ์ด SD บน GR III และ GR IIIx และใช้การ์ด microSD บน GR IV ใช้การ์ดที่ถ่ายรูปอยู่ได้เลย",
            "คอมพิวเตอร์ที่มี Chrome หรือ Edge และเครื่องอ่านการ์ด ถ้าไม่มี ก็ย้าย GRKU.zip ลงการ์ดเองได้"
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
            "บน grku.app เลือกฟิล์มลุค กล้อง และโมดูล แล้วเขียนลงการ์ด",
            "ทำแค่ครั้งแรก กด {{MENU}} ค้างไว้ตอนเปิดกล้อง เพื่อเปิดสคริปต์ SD",
            "เปิดกล้องตามปกติ หลังผ่านไปไม่กี่วินาที **GRKU** จะขึ้นที่ด้านบนของหน้าจอ",
            "กด {{ADJ}} ตอนถ่ายรูป แล้วเลือกตัวเลือกที่หก **GRKU**"
          ]
        },
        {
          "kind": "h2",
          "id": "free",
          "text": "ใช้งานฟรี และสิ่งที่ GRKU Plus เพิ่มเข้ามา"
        },
        {
          "kind": "p",
          "text": "ดูตัวอย่างฟิล์มลุคได้ฟรีบนเว็บ และใส่ฟิล์มลุคจากคลังลงการ์ดได้ฟรี 10 แบบ ฟิล์มลุคที่นำเข้าเองไม่นับรวม โมดูลทั้งหมด สูตรสี และการลองฟิล์มลุคในหน้า Develop ก็ฟรี [GRKU Plus](doc:plus) เป็นแบบจ่ายครั้งเดียวตามต้องการ เพื่อเพิ่มจำนวนฟิล์มลุคบนการ์ด"
        },
        {
          "kind": "h2",
          "id": "words",
          "text": "คำที่ใช้ในคู่มือนี้"
        },
        {
          "kind": "list",
          "items": [
            "**การ์ด SD**: การ์ดความจำขนาดเล็กที่กล้องใช้เก็บรูป GR IV ใช้การ์ด microSD คู่มือนี้เรียกทั้งสองอย่างว่าการ์ด",
            "**เครื่องอ่านการ์ด**: อุปกรณ์ขนาดเล็กที่ช่วยให้คอมพิวเตอร์เปิดอ่านการ์ดได้",
            "**ไฟล์ ZIP**: ไฟล์เดียวที่รวมหลายไฟล์ไว้ข้างใน เปิดไฟล์นี้เพื่อดึงไฟล์ข้างในออกมา",
            "**เฟิร์มแวร์**: ซอฟต์แวร์ในกล้องที่ RICOH สร้างมา GRKU ไม่เคยเปลี่ยนส่วนนี้",
            "**สคริปต์ SD**: ค่าตั้งในกล้องที่ให้กล้องรัน GRKU จากการ์ด เปิดแค่ครั้งเดียว",
            "**ModeSet file**: ไฟล์ที่เปิดใช้งาน สคริปต์ SD ชื่อไฟล์จะเป็นตัวเลข เช่น `00078560.636`",
            "**ADJ lever**: คันโยกเล็ก ๆ ด้านหลังของ GR อยู่ข้างหน้าจอ"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "ทดลองใช้",
          "text": "GRKU เป็นซอฟต์แวร์ทดลองใช้และไม่มีการรับประกัน หากทำงานพลาด กล้องอาจค้างตอนเปิดเครื่อง อ่าน [กล้องค้างตอนเปิดเครื่อง](doc:stuck) ก่อนติดตั้ง"
        }
      ]
    },
    "firmware": {
      "title": "เช็กเวอร์ชันเฟิร์มแวร์",
      "sources": [
        "crates/grku-core/src/camera.rs",
        "web/src/generated/cameras.ts",
        "web/src/package.ts (gr4-1.20-0528 not published)",
        "https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html",
        "https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html",
        "https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html",
        "https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html",
        "web/src/chat/knowledge.ts (firmware update screen)"
      ],
      "seo": "วิธีเช็กเวอร์ชันเฟิร์มแวร์ของ RICOH GR III, GR IIIx หรือ GR IV",
      "lead": "กด MENU แล้วเปิดเมนูตั้งค่า (ไอคอนประแจ) GRKU ใช้งานได้เฉพาะเวอร์ชันเฟิร์มแวร์ในตารางหน้านี้เท่านั้น",
      "keywords": "เวอร์ชันเฟิร์มแวร์ เช็ก เมนู ตั้งค่า ประแจ เกี่ยวกับอุปกรณ์นี้ ข้อมูลเฟิร์มแวร์ ข้อมูลกล้อง อัปเดต ricoh รุ่นเก่ากว่า รุ่นใหม่กว่า fwdc bin firmware version check menu setup wrench about this device firmware info camera information update ricoh older newer fwdc bin",
      "blocks": [
        {
          "kind": "p",
          "text": "เฟิร์มแวร์คือซอฟต์แวร์ในกล้องที่ RICOH สร้างขึ้น กล้องแต่ละตัวจะแสดงเวอร์ชันเฟิร์มแวร์ในเมนู เช็กให้เรียบร้อยก่อนติดตั้ง GRKU"
        },
        {
          "kind": "h2",
          "id": "check",
          "text": "หาเวอร์ชันบนกล้องของคุณ"
        },
        {
          "kind": "tabs",
          "tabs": [
            {
              "label": "GR III / GR IIIx",
              "blocks": [
                {
                  "kind": "steps",
                  "items": [
                    "เปิดกล้อง",
                    "กด {{MENU}}",
                    "ไปที่เมนูตั้งค่า แท็บที่มีไอคอนประแจ แล้วเปิด **About This Device**",
                    "เลือก **Firmware Info / Options** แล้วกดปุ่มขวา",
                    "หน้าจอจะแสดงเวอร์ชันเฟิร์มแวร์ เช่น 2.21"
                  ]
                },
                {
                  "kind": "path",
                  "items": [
                    "MENU",
                    "Setup",
                    "About This Device",
                    "Firmware Info / Options"
                  ]
                }
              ]
            },
            {
              "label": "GR IV",
              "blocks": [
                {
                  "kind": "steps",
                  "items": [
                    "เปิดกล้อง",
                    "กด {{MENU}}",
                    "ไปที่เมนูตั้งค่า แท็บที่มีไอคอนประแจ แล้วเลือก **Camera Information**",
                    "กดปุ่มขวา",
                    "หน้าจอจะแสดงเวอร์ชันเฟิร์มแวร์ เช่น 1.21"
                  ]
                },
                {
                  "kind": "path",
                  "items": [
                    "MENU",
                    "Setup",
                    "Camera Information"
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "p",
          "text": "GR IV Monochrome: [หน้าซัพพอร์ตกล้องของ RICOH](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html) แสดงรายการเวอร์ชันเฟิร์มแวร์ของกล้องรุ่นนี้"
        },
        {
          "kind": "h2",
          "id": "supported",
          "text": "GRKU รองรับเวอร์ชันไหนบ้าง"
        },
        {
          "kind": "flow",
          "steps": [
            {
              "see": "เวอร์ชันของคุณอยู่ในตาราง",
              "then": "[ติดตั้ง GRKU](doc:install)"
            },
            {
              "see": "เวอร์ชันของคุณเก่ากว่า",
              "then": "อัปเดตกล้องจาก RICOH ก่อน ดู [ด้านล่าง](doc:firmware#older)"
            },
            {
              "see": "เวอร์ชันของคุณใหม่กว่าในตาราง",
              "then": "รอการอัปเดต GRKU ดู [ด้านล่าง](doc:firmware#newer)"
            }
          ]
        },
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GRKU เคยใช้งานบน GR IV เฟิร์มแวร์ 1.11 แล้ว ตัวติดตั้งสำหรับเวอร์ชันและรุ่นอื่นสร้างจากโค้ดเดียวกันและตรวจกับไฟล์เฟิร์มแวร์ของ RICOH แล้ว แต่ยังไม่เคยใช้งานบนกล้องจริง"
        },
        {
          "kind": "p",
          "text": "กล้อง GR IV 30th Anniversary Edition มาพร้อมเฟิร์มแวร์ 1.20 รุ่นเฉพาะจากโรงงาน ซึ่ง grku.app ยังไม่มีให้ดาวน์โหลด ให้อัปเดตกล้องรุ่นนี้เป็น 1.21 จาก RICOH ก่อน"
        },
        {
          "kind": "h2",
          "id": "older",
          "text": "เวอร์ชันของฉันเก่ากว่า"
        },
        {
          "kind": "p",
          "text": "อัปเดตกล้องก่อน โดยดาวน์โหลดจากหน้าซัพพอร์ตทางการของ RICOH เท่านั้น: [GR III](https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html), [GR IIIx](https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html), [GR IV](https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html), [GR IV Monochrome](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html) ทำตามขั้นตอนในหน้านั้น GRKU จะไม่อัปเดตเฟิร์มแวร์ให้"
        },
        {
          "kind": "h2",
          "id": "newer",
          "text": "เวอร์ชันของฉันใหม่กว่าในตาราง"
        },
        {
          "kind": "p",
          "text": "อย่าเพิ่งติดตั้ง GRKU รอจนกว่า GRKU จะออกอัปเดตที่รองรับเวอร์ชันของคุณ ดูได้ใน[ข่าวสารบน grku.app](site:home)"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "มีหน้าจออัปเดตเฟิร์มแวร์ตอนเปิดเครื่องครั้งแรกไหม",
          "text": "ถ้าในการ์ดมีไฟล์เฟิร์มแวร์ของกล้อง (ไฟล์ `.bin` ที่ขึ้นต้นด้วย `fwdc`) การกด {{MENU}} ค้างไว้ตอนเปิดเครื่องจะขึ้นหน้าจออัปเดตเฟิร์มแวร์ ให้เลือก **Cancel** แล้วกด {{OK}} ปิดกล้อง ลบไฟล์นั้นออกจากการ์ด แล้วลองใหม่อีกครั้ง"
        }
      ]
    },
    "install": {
      "title": "ติดตั้ง GRKU",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/guide.ts",
        "web/src/strings/en.ts (cardConnect, cardApplyInstall, download)",
        "crates/grku-core/src/runtime/files.rs",
        "resources/images/modeset.png",
        "resources/images/camera-menu.png",
        "resources/images/grku-root.jpg"
      ],
      "seo": "วิธีติดตั้ง GRKU บน RICOH GR III, GR IIIx หรือ GR IV",
      "lead": "เขียน GRKU ลงการ์ด แล้วเปิดสคริปต์ SD ที่กล้องหนึ่งครั้ง",
      "keywords": "setup install sd card chrome edge zip sd_root modeset mode set command menu first start ตั้งค่า ติดตั้ง การ์ด สคริปต์ SD เมนู เริ่มต้น",
      "blocks": [
        {
          "kind": "h2",
          "id": "write",
          "text": "เขียนการ์ดจากหน้าเว็บ"
        },
        {
          "kind": "p",
          "text": "ใช้ Chrome หรือ Edge บนคอมพิวเตอร์ โดยใส่การ์ดในเครื่องอ่านการ์ด สาย USB ของกล้องใช้กับขั้นตอนนี้ไม่ได้"
        },
        {
          "kind": "art",
          "art": "computer",
          "alt": "คอมพิวเตอร์ที่เปิดหน้า grku.app และการ์ดที่เสียบเข้ากับเครื่องอ่านการ์ด"
        },
        {
          "kind": "steps",
          "items": [
            "เปิด [หน้าติดตั้ง](site:install)",
            "เลือกฟิล์มลุค แล้วเลือกรุ่นกล้อง แล้วเลือกโมดูล",
            "ในขั้นตอนสุดท้าย ให้เลือก **เขียนลงการ์ด SD** แล้วกด **เชื่อมต่อการ์ด SD** เลือกตัวการ์ด แล้วอนุญาตให้แก้ไข",
            "ตรวจรายการไฟล์ที่จะเปลี่ยน แล้วกด **ติดตั้ง GRKU** รูปของคุณยังอยู่ในการ์ดเหมือนเดิม",
            "กดนำการ์ดออกในคอมพิวเตอร์ก่อนดึงออก"
          ]
        },
        {
          "kind": "p",
          "text": "ไม่แน่ใจว่ากล้องใช้เฟิร์มแวร์รุ่นไหน ดูที่ [ตรวจดูเวอร์ชันเฟิร์มแวร์](doc:firmware) ได้เลย"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "ถ้าหน้าตาไม่เป็นแบบนี้",
          "text": "ไม่มีปุ่ม **เชื่อมต่อการ์ด SD** ใช่ไหม เปิดหน้านี้ใน Chrome หรือ Edge บนคอมพิวเตอร์ ถ้าใช้บนมือถือหรือใช้ Safari ให้ใช้ GRKU.zip ด้านล่าง"
        },
        {
          "kind": "h2",
          "id": "zip",
          "text": "หรือคัดลอก GRKU.zip เอง"
        },
        {
          "kind": "p",
          "text": "สำหรับเบราว์เซอร์อื่น รวมถึงบนมือถือหรือ Mac ที่ใช้ Safari ถ้าเบราว์เซอร์ในแอปบันทึกไฟล์ไม่ได้ ให้เปิดหน้านี้ในเบราว์เซอร์หลักของมือถือ"
        },
        {
          "kind": "art",
          "art": "copy",
          "alt": "โฟลเดอร์ SCRIPT ไฟล์ DEVELOP.MOD และไฟล์ ModeSet จาก SD_ROOT ถูกคัดลอกไปไว้ที่ชั้นบนสุดของการ์ด ข้างๆ โฟลเดอร์ DCIM"
        },
        {
          "kind": "steps",
          "items": [
            "ในขั้นตอนสุดท้ายของการติดตั้ง ให้กด **ดาวน์โหลด GRKU.zip**",
            "ไฟล์จะบันทึกเป็น `GRKU-….zip` ให้แตกไฟล์ บางเบราว์เซอร์จะแตกไฟล์ให้เอง",
            "คัดลอกของข้างในโฟลเดอร์ `SD_ROOT` ไม่ใช่ตัวโฟลเดอร์ ไปไว้ที่ชั้นบนสุดของการ์ด",
            "ตอนนี้ชั้นบนสุดของการ์ดจะมีโฟลเดอร์ `SCRIPT` ไฟล์ `DEVELOP.MOD` และไฟล์ ModeSet ของกล้องคุณ"
          ]
        },
        {
          "kind": "card",
          "alt": "ชั้นบนสุดของการ์ดหลังติดตั้งเสร็จ",
          "items": [
            [
              "SCRIPT",
              "ตัว GRKU เอง เก็บไว้"
            ],
            [
              "DEVELOP.MOD",
              "มาพร้อมกับไฟล์ ModeSet ตอนเริ่มใช้งานครั้งแรก หลังจากนั้นจะลบออกก็ได้"
            ],
            [
              "00078560.636",
              "ไฟล์ ModeSet ของกล้องที่เปิดใช้สคริปต์ SD คือ 00078350.588 สำหรับ GR III, 00078490.609 สำหรับ GR IIIx และ 00078560.636 สำหรับ GR IV หลังจากเริ่มใช้งานครั้งแรกจะลบออกก็ได้"
            ],
            [
              "GRKU",
              "การตั้งค่าและฟิล์มลุคของคุณ เว็บไซต์หรือกล้องจะสร้างให้"
            ],
            [
              "DCIM",
              "รูปของคุณ การติดตั้ง GRKU จะไม่ยุ่งกับรูปพวกนี้"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "first-start",
          "text": "เริ่มใช้งานครั้งแรก: เปิดใช้สคริปต์ SD"
        },
        {
          "kind": "p",
          "text": "ทำแค่นี้ครั้งเดียว กล้องจะจำค่านี้ไว้ ใช้ได้กับการ์ดทุกใบ และตอนอัปเดตไม่ต้องทำซ้ำ"
        },
        {
          "kind": "art",
          "art": "insert",
          "alt": "การ์ดถูกใส่ลงในช่องเสียบการ์ดของกล้อง"
        },
        {
          "kind": "steps",
          "items": [
            "ปิดกล้องแล้วใส่การ์ด",
            "กด {{MENU}} ค้างไว้แล้วกดปุ่มเปิดปิด",
            "หน้าจอจะขึ้น **Mode Set Command** ตามด้วย **Script - Enable** และ **Complete** แล้วกล้องจะปิดเครื่องเอง",
            "เปิดกล้องตามปกติ แล้วรอจน **GRKU** ขึ้นที่ด้านบนของหน้าจอ ปกติใช้เวลาประมาณ 8 ถึง 10 วินาที แต่การเปิดครั้งแรกหลังติดตั้งอาจใช้เวลาถึงประมาณหนึ่งนาที"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "รอตอนเริ่มใช้งานครั้งแรก",
          "text": "อย่าเพิ่งปิดกล้องหรือถอดแบตออกตอนที่ GRKU กำลังเริ่มทำงานครั้งแรก อาจใช้เวลาถึงประมาณหนึ่งนาที"
        },
        {
          "kind": "screen",
          "screen": "modeset-back",
          "source": "capture",
          "alt": "ด้านหลังของกล้อง GR ที่มีวงกลมล้อมปุ่ม MENU บนหน้าจอขึ้น Mode Set Command, Script - Enable และ Complete"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "ถ้าหน้าตาไม่เป็นแบบนี้",
          "text": "ไม่เจอหน้าจอ **Mode Set Command** ใช่ไหม ลองปิดกล้องก่อน กด {{MENU}} ค้างไว้ก่อนแล้วค่อยกดปุ่มเปิดปิด และกด {{MENU}} ค้างไว้จนกว่าหน้าจอจะขึ้นมา ลองเช็กดูว่า `DEVELOP.MOD` กับไฟล์ ModeSet อยู่ที่ชั้นบนสุดของการ์ด ไม่ได้อยู่ในโฟลเดอร์"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "ขึ้นหน้าจออัปเดตเฟิร์มแวร์ไหม",
          "text": "ในการ์ดมีไฟล์เฟิร์มแวร์กล้อง (ไฟล์ `.bin` ที่ชื่อขึ้นต้นด้วย `fwdc`) ให้เลือก **Cancel** แล้วกด {{OK}} ห้ามเลือก Execute เด็ดขาด แล้วปิดกล้อง ลบไฟล์นั้นออกจากชั้นบนสุดของการ์ด แล้วทำขั้นตอนนี้ใหม่อีกครั้ง"
        },
        {
          "kind": "p",
          "text": "หลังทำขั้นตอนนี้เสร็จ จะลบไฟล์ ModeSet กับ `DEVELOP.MOD` ออกจากเครื่องอ่านการ์ดก็ได้ แต่เก็บโฟลเดอร์ `SCRIPT` ไว้นะ"
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
            "เลือก **GRKU** ปกติจะอยู่ลำดับที่หก หรืออยู่ถัดไปทางขวาถ้าคุณแยกโมดูลเป็นรายการของตัวเองใน ADJ Order",
            "เลือกฟีเจอร์ เช่น **Film Look** แล้วเลื่อนไฮไลต์ตัวเลือกเพื่อดูผลบนหน้าจอ",
            "กด {{OK}} เพื่อเก็บค่านี้ กด {{Fn}} เพื่อดูการตั้งค่าเพิ่มเติม"
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "ถ้าหน้าตาไม่เป็นแบบนี้",
          "text": "ไม่เจอ **GRKU** ใน ADJ ใช่ไหม รออีกนิดหลังเปิดเครื่องแล้วลองใหม่ ครั้งแรกอาจใช้เวลาเกือบนาที ยังไม่เจอก็ดูที่ [GRKU ไม่ขึ้น](doc:not-showing)"
        },
        {
          "kind": "screen",
          "screen": "adj-grku",
          "source": "drawn",
          "alt": "หน้า ADJ เปิด GRKU อยู่ มุมซ้ายบนแสดงคำว่า GRKU และ Recipes ซึ่งเป็นโมดูลแรก ส่วนไอคอนของโมดูลต่างๆ เรียงกันลงมาทางขวา"
        },
        {
          "kind": "p",
          "text": "รูปที่ถ่ายก่อน GRKU โหลดเสร็จจะไม่มีเอฟเฟกต์ของ GRKU ดูวิธีใช้งานปุ่มต่างๆ ทั้งหมดได้ที่ [ADJ และ MENU](doc:controls)"
        }
      ]
    },
    "controls": {
      "title": "ADJ และ MENU",
      "sources": [
        "runtime/menu.c",
        "runtime/manage.h",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs",
        "resources/images/grku-menu.jpg"
      ],
      "seo": "วิธีใช้ GRKU บน GR ด้วยก้าน ADJ และ MENU",
      "lead": "GRKU อยู่ตรงไหนบนกล้อง และปุ่มไหนทำอะไรได้บ้าง",
      "keywords": "adj lever menu ปรับแต่ง fn ok ปุ่ม ตัวเลือก ลำดับ เปิดใช้ grku เกี่ยวกับ เวอร์ชัน นำทาง",
      "blocks": [
        {
          "kind": "h2",
          "id": "adj",
          "text": "GRKU ใน ADJ"
        },
        {
          "kind": "p",
          "text": "ตอนถ่ายรูป ให้กดก้าน {{ADJ}} แล้วเลือก **GRKU** ปกติจะอยู่ลำดับที่หก หน้าจอจะแสดงรายการโมดูลบนการ์ดของคุณ เช่น **Film Look**, **Framing** และ **Grain**"
        },
        {
          "kind": "modules"
        },
        {
          "kind": "table",
          "head": [
            "ปุ่ม",
            "หน้าที่ใน GRKU"
          ],
          "rows": [
            [
              "{{ADJ}}",
              "เปิด ADJ ถ้าปิดไปตอนอยู่บน GRKU คราวหน้าก็จะเปิดกลับมาตรงนี้เหมือนเดิม แม้ปิดเครื่องไปแล้วก็ตาม"
            ],
            [
              "ขึ้น, ลง",
              "เลื่อนไปที่โมดูล หรือไฮไลต์ตัวเลือก หน้าจอแบบเรียลไทม์จะแสดงผลให้เห็นทันทีในส่วนที่ทำได้"
            ],
            [
              "{{OK}}",
              "เปิดโมดูลที่เลือกอยู่ หรือเก็บตัวเลือกที่เลือกไว้"
            ],
            [
              "{{Fn}}",
              "ทำหน้าที่เพิ่มเติมของแถวนั้น เช่น ตั้งค่าโมดูลเพิ่ม มุมถัดไปของสัดส่วนทองคำ หรือเปลี่ยนชื่อกับลบสูตรสี"
            ],
            [
              "{{MENU}}",
              "ย้อนกลับ"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "แถว **Enable** ที่อยู่ถัดจากโมดูลใช้เปิดหรือปิด GRKU พอเปิดใหม่ โมดูลที่เปิดไว้จะเริ่มทำงานอีกครั้ง"
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
          "text": "ทุกการตั้งค่าอยู่ในเมนูกล้องด้วย กด {{MENU}} ไปที่แท็บ Customize (C) แล้วเลื่อนลงไปท้ายสุด ส่วนของ GRKU จะมีแถวพวกนี้"
        },
        {
          "kind": "screen",
          "screen": "menu-grku",
          "source": "drawn",
          "alt": "ส่วน GRKU ในเมนู MENU อยู่ที่หน้า Customize ที่ 4: Enable GRKU เป็น On, GRKU Settings, Recipes, Film Look, Framing, Crop และ Guides"
        },
        {
          "kind": "screen",
          "screen": "menu-grku-end",
          "source": "drawn",
          "alt": "ท้ายส่วน GRKU: Guides, Date Imprint, Glow, Light Leak, Diffusion, Grain และ About GRKU พร้อมเวอร์ชัน"
        },
        {
          "kind": "p",
          "text": "แถวจากบนลงล่าง บนการ์ดที่มีโมดูลตามปกติ การ์ดใหม่ทุกแถวจะแสดง Off จนกว่าคุณจะเลือกค่า"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "สิ่งที่แสดงและหน้าที่"
          ],
          "rows": [
            [
              "**Enable GRKU**",
              "เปิดตัวเลือก On (ค่าเริ่มต้น) และ Off เปิดหรือปิด GRKU เมื่อเป็น On จะเริ่มทำงานทุกโมดูลที่เปิดไว้"
            ],
            [
              "**GRKU Settings**",
              "ไม่มีค่า เปิดการตั้งค่าของ GRKU เอง: Enable at Start, Shooting Settings, Display Settings, Shutdown Screen, Mode Dial และ ADJ Order ดู [GRKU Settings](doc:settings)"
            ],
            [
              "**สูตรสี**",
              "แสดงชื่อสูตรสีเมื่อกล้องจับคู่ได้ มิฉะนั้นจะไม่แสดงอะไรเลย และแสดง Off เมื่อ GRKU ปิดอยู่ เปิดดูสูตรสีของคุณ (โดยไม่มีสูตรสีใดเปิดใช้งาน มีเฉพาะ Enable และ Save Settings): ใช้, ดู, เปลี่ยนชื่อ หรือลบ และ Save Settings ดูที่ [Recipes](doc:recipes)"
            ],
            [
              "**ฟิล์มลุค**",
              "แสดงฟิล์มลุคที่กำลังใช้ หรือ Off ดูที่ [Film Look](doc:film-look)"
            ],
            [
              "**กรอบภาพ**",
              "แสดงสัดส่วนภาพ หรือ Off ดูที่ [Framing](doc:framing)"
            ],
            [
              "**การครอป**",
              "แสดงความยาวโฟกัส หรือ Off ดูที่ [Crop](doc:crop)"
            ],
            [
              "**Guides**",
              "แสดงตัวช่วย หรือ Off ดูที่ [Guides](doc:guides)"
            ],
            [
              "**วันที่**",
              "แสดงรูปแบบวันที่ หรือ Off ดู [Date Imprint](doc:date)"
            ],
            [
              "**Glow**",
              "แสดง Bloom และ Halation เมื่อเปิดใช้งาน หรือ Off ดู [Glow](doc:glow)"
            ],
            [
              "**Light Leak**",
              "แสดงลุค หรือ Off ดู [Light Leak](doc:light-leak)"
            ],
            [
              "**Diffusion**",
              "แสดง Filter และ Softness เมื่อเปิดใช้งาน หรือ Off ดู [Diffusion](doc:diffusion)"
            ],
            [
              "**Border**",
              "มีเฉพาะเมื่อเปิด Border ในการ์ด อยู่ระหว่าง Diffusion กับ Grain แสดงสไตล์ หรือ Off ดู [Border](doc:border)"
            ],
            [
              "**Grain**",
              "แสดงความเข้ม หรือ Off ดู [Grain](doc:grain)"
            ],
            [
              "**About GRKU**",
              "แสดงเวอร์ชัน GRKU บนการ์ด เช่น 1.11.0 และเปิดหน้าที่มีข้อมูลเวอร์ชัน จำนวนฟิล์มลุค และเว็บไซต์ หากอยู่ในโหมดพิเศษ จะแสดง Safe mode หรือ Restart to apply แทน"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "หน้าโมดูลใน MENU เริ่มด้วย **Enable** (สำหรับโมดูลนั้นเท่านั้น) จากนั้นเป็น **Options** และ **Order** ถ้ามี แล้วตามด้วยการตั้งค่า การตั้งค่าบางรายการจะอยู่ในหน้าที่ {{Fn}} เปิดใน ADJ เท่านั้น เช่น Date Style และ Date Position"
        },
        {
          "kind": "h2",
          "id": "module-rows",
          "text": "หน้าของโมดูล"
        },
        {
          "kind": "list",
          "items": [
            "**Enable** เปิดหรือปิดแค่โมดูลนี้",
            "**Options** ในโมดูลที่มีปุ่มนี้ จะเลือกตัวเลือกที่ ADJ แสดง เอาเครื่องหมายถูกออกจากฟิล์มลุคที่ไม่เคยใช้ แล้ว ADJ จะข้ามไป",
            "**Order** ในโมดูลที่มีปุ่มนี้ จะตั้งลำดับของตัวเลือกเหล่านั้นใน ADJ",
            "แถวอื่นๆ คือการตั้งค่าของโมดูล แต่ละหน้าของคู่มือนี้จะมีรายการบอกไว้"
          ]
        },
        {
          "kind": "h2",
          "id": "jpeg",
          "text": "JPEG และ DNG"
        },
        {
          "kind": "p",
          "text": "GRKU เปลี่ยนไฟล์ JPEG ส่วน DNG จะเก็บข้อมูลดิบของเซนเซอร์ไว้โดยไม่มีฟิล์มลุค ถ้าจะล้าง DNG ด้วย GRKU ทีหลัง ให้ดูที่ [การล้าง RAW ในกล้อง](doc:raw)"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "การตั้งค่าไม่หาย",
          "text": "GRKU เก็บการตั้งค่าของคุณไว้ในโฟลเดอร์ `GRKU` บนการ์ด แม้ปิดเครื่องหรืออัปเดตแล้วก็ยังอยู่"
        }
      ]
    },
    "update": {
      "title": "อัปเดตหรือถอนการติดตั้ง",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/strings/en.ts (updateSteps, removeSteps, uninstall*, scriptsOff*)"
      ],
      "seo": "วิธีอัปเดตหรือถอนการติดตั้ง GRKU และปิดสคริปต์ SD",
      "lead": "การอัปเดตจะเก็บการตั้งค่าและฟิล์มลุคของคุณไว้ ไม่ต้องกด MENU ค้างอีก",
      "keywords": "อัปเดต อัปเกรด เวอร์ชันใหม่ ถอนการติดตั้ง เอาออก ลบ ปิดสคริปต์ SD ฟอร์แมตการ์ด สำรองข้อมูล update upgrade new version uninstall remove delete sd scripts off format card backup",
      "blocks": [
        {
          "kind": "h2",
          "id": "update-site",
          "text": "อัปเดตจากเว็บ"
        },
        {
          "kind": "art",
          "art": "computer",
          "alt": "คอมพิวเตอร์ที่เปิดหน้า grku.app และการ์ดที่เสียบเข้ากับเครื่องอ่านการ์ด"
        },
        {
          "kind": "steps",
          "items": [
            "ใส่การ์ด (microSD สำหรับ GR IV) ลงในเครื่องอ่านการ์ด แล้วเปิด [หน้าติดตั้ง](site:install) ใน Chrome หรือ Edge",
            "ในขั้นตอนสุดท้าย ให้กด **เชื่อมต่อการ์ด SD** หน้าเว็บจะบอกว่ามีอะไรเปลี่ยนบ้าง",
            "กด **อัปเดต GRKU**",
            "ใส่การ์ดในกล้องแล้วเปิดเครื่องตามปกติ"
          ]
        },
        {
          "kind": "p",
          "text": "วิธีเพิ่มหรือลบฟิล์มลุค: เสียบการ์ดก่อน แล้วเปลี่ยนฟิล์มลุคบนหน้าเว็บ ตรวจดูรายการที่เปลี่ยน แล้วกดปุ่มเขียน"
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
            "จาก `SD_ROOT` ของ GRKU.zip ตัวใหม่ ก๊อปปี้เฉพาะโฟลเดอร์ `SCRIPT` ไปไว้ที่ชั้นบนสุดของการ์ด",
            "ใส่การ์ดเข้ากล้องแล้วเปิดกล้อง ห้ามกด {{MENU}} ค้างไว้"
          ]
        },
        {
          "kind": "h2",
          "id": "uninstall",
          "text": "ถอนการติดตั้ง GRKU"
        },
        {
          "kind": "p",
          "text": "ในขั้นตอนสุดท้ายของการติดตั้ง ให้เสียบการ์ดแล้วกด **ถอนการติดตั้ง GRKU** เลือกว่าจะลบการตั้งค่าและฟิล์มลุคด้วยไหม แล้วกด **ถอนการติดตั้ง** หรือปิดกล้องแล้วลบโฟลเดอร์ `SCRIPT` และ `GRKU` เอง รูปของคุณยังอยู่ครบ"
        },
        {
          "kind": "h2",
          "id": "scripts-off",
          "text": "ปิดสคริปต์ SD"
        },
        {
          "kind": "p",
          "text": "สคริปต์ SD ยังเปิดอยู่หลังถอนการติดตั้ง GRKU ให้ปิดสคริปต์ SD เฉพาะตอนที่เลิกใช้ GRKU ถาวร"
        },
        {
          "kind": "steps",
          "items": [
            "ในขั้นตอนสุดท้ายของการติดตั้ง ให้ใช้ **ปิดสคริปต์ SD** เพื่อเขียนไฟล์ลงการ์ด หรือดาวน์โหลดไฟล์แล้วก๊อปปี้ของใน `SD_ROOT` ลงการ์ด",
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
          "text": "การฟอร์แมตจะลบ GRKU และการตั้งค่าทั้งหมด ให้ก๊อปปี้รูปและโฟลเดอร์ `GRKU` ไปไว้ในคอมพิวเตอร์ก่อน หลังฟอร์แมตเสร็จ ให้ติดตั้ง GRKU อีกครั้ง แล้วก๊อปปี้โฟลเดอร์ `GRKU` กลับมาไว้ที่ชั้นบนสุดของการ์ด"
        }
      ]
    },
    "film-look": {
      "title": "Film Look",
      "sources": [
        "modules/film-look/module.toml",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs (film, adjustments)",
        "CHANGELOG.md"
      ],
      "seo": "ฟิล์มลุคบน RICOH GR: วิธีใช้ Film Look",
      "lead": "ฟิล์มลุคของฟิล์มจริงและกล้องรุ่นอื่น พร้อมพรีวิวสด แทน Image Control",
      "keywords": "ฟิล์มลุค เอฟเฟกต์ โทนฟิล์ม พรีวิวสด พารามิเตอร์ film look effect image control lut portra classic chrome kodak fuji fujifilm finepix positive preview fn parameters film stock",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Film Look"
            ],
            [
              "JPEG",
              "ใช้ฟิล์มลุค"
            ],
            [
              "DNG",
              "เก็บข้อมูลดิบไว้ ไม่ใส่ฟิล์มลุค"
            ]
          ]
        },
        {
          "kind": "steps",
          "items": [
            "กด {{ADJ}} เลือก **GRKU** แล้วเลือก **Film Look**",
            "เลือกฟิล์มลุค หน้าจอแสดงภาพจะเปลี่ยนทันที พร้อมไอคอนของฟิล์มลุคนั้น",
            "กด {{OK}} เพื่อใช้งาน เลือก **Off** หากต้องการถ่ายแบบไม่ใช้ฟิล์มลุค"
          ]
        },
        {
          "kind": "screen",
          "screen": "film-look",
          "source": "drawn",
          "alt": "Film Look ในหน้า ADJ โดยเลือก Portra 400 ไว้ จอภาพสดจะแสดงฟิล์มลุคนี้ และปุ่ม Fn ใช้ปรับค่าต่างๆ ได้"
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-portra",
          "label": "Kodak Portra 400",
          "alt": "เก้าอี้ผ้าใบสองตัวใต้ร่มกันแดด ในฟิล์มลุค Standard ของกล้อง และในฟิล์มลุค Kodak Portra 400"
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-chrome",
          "label": "Fujifilm Classic Chrome",
          "alt": "ภาพถ่ายเดียวกันในฟิล์มลุค Standard และในฟิล์มลุค Fujifilm Classic Chrome"
        },
        {
          "kind": "h2",
          "id": "adjust",
          "text": "ปรับแต่งฟิล์มลุค"
        },
        {
          "kind": "p",
          "text": "เลื่อนไปเลือกฟิล์มลุค แล้วกด {{Fn}} กล้องจะเปิดหน้าปรับค่าของลุคนั้น เหมือนกับ Image Control เช่น saturation, contrast, Shading, Clarity และค่าอื่นๆ ของกล้อง แต่ละลุคมีค่าการปรับของตัวเอง บน GR III และ GR IIIx ลุค Cinema Yellow และ Cinema Green ที่คุณ [รับจากไฟล์ GR IV](doc:looks#ricoh) จะมี **Toning** ให้เลือก 3 ระดับ ใช้ได้ทั้งตอนถ่ายและในการล้าง RAW ในกล้อง"
        },
        {
          "kind": "h2",
          "id": "image-control",
          "text": "Film Look กับ Image Control"
        },
        {
          "kind": "p",
          "text": "ตอนที่เปิดใช้งานฟิล์มลุคอยู่ ระบบจะทำงานแทน Image Control ค่า Image Control ที่ตั้งไว้จะไม่เปลี่ยน และจะกลับมาเหมือนเดิมเมื่อเลือก **Off**"
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
            "หน้าที่"
          ],
          "rows": [
            [
              "**Film Stock**",
              "เลือกฟิล์มลุค เหมือนที่ทำใน ADJ"
            ],
            [
              "**Parameters**",
              "แสดงเมื่อเปิดฟิล์มลุคอยู่ เปิดหน้าปรับแต่งของฟิล์มลุคนั้น เหมือนการกด {{Fn}}"
            ],
            [
              "**Options**",
              "เลือกว่าจะให้ ADJ แสดงฟิล์มลุคไหนบ้าง"
            ],
            [
              "**Order**",
              "จัดลำดับฟิล์มลุคใน ADJ เมื่อเลือกตั้งแต่สองตัวขึ้นไป"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "which",
          "text": "ในการ์ดมีฟิล์มลุคไหนบ้าง"
        },
        {
          "kind": "p",
          "text": "การ์ดหนึ่งใบเก็บฟิล์มลุคได้สูงสุด 40 แบบ เลือกได้ในหน้า [ติดตั้ง](site:install) และลองใช้กับรูปของตัวเองก่อนได้ในหน้า [ล้างรูป](site:develop) ดูเพิ่มเติมที่ [เลือกฟิล์มลุคบนเว็บ](doc:looks)"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "เรื่องน่ารู้",
          "text": "ฟิล์มลุคเหล่านี้ทำมาสำหรับเซนเซอร์ GR III สีบน GR IV จึงอาจต่างออกไปเล็กน้อย GR IV Monochrome ไม่มี Film Look เพราะเซนเซอร์รับภาพได้เฉพาะขาวดำ"
        }
      ]
    },
    "recipes": {
      "title": "Recipes",
      "sources": [
        "modules/recipes/module.toml",
        "runtime/recipe_page.h",
        "crates/grku-core/src/menu_text.rs (recipe_*)",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "สูตรสีฟิล์มของ GR บันทึกและสลับการตั้งค่าได้ในขั้นตอนเดียว",
      "lead": "บันทึกฟิล์มลุคพร้อมการตั้งค่ากล้อง แล้วสลับใช้ได้ในขั้นตอนเดียว",
      "keywords": "recipe สูตรสี preset บันทึก ตั้งค่า ย้อนกลับ เปลี่ยนชื่อ ลบ ใช้ ดู ไวท์บาลานซ์ ชดเชยแสง white balance exposure",
      "blocks": [
        {
          "kind": "p",
          "text": "สูตรสีหนึ่งสูตรเก็บ Film Look หรือ Image Control, Grain, Glow, Border, ไวท์บาลานซ์ รวมถึงการปรับแต่งและค่าชดเชยแสงของกล้อง"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Recipes"
            ],
            [
              "สูตรสีประกอบด้วย",
              "Look, Grain, Glow, Border, สมดุลแสงขาว, ค่าแสง"
            ],
            [
              "ข้อจำกัด",
              "64 สูตรสี, เปิดใช้ใน ADJ ได้ 40, ย้อนกลับได้ 5 ครั้ง"
            ]
          ]
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
          "kind": "screen",
          "screen": "recipes",
          "source": "drawn",
          "alt": "Recipes ในหน้า ADJ ก่อนที่จะบันทึกสูตรสีใดๆ: มุมซ้ายบนแสดงคำว่า Save Settings"
        },
        {
          "kind": "h2",
          "id": "apply",
          "text": "ใช้สูตรสี"
        },
        {
          "kind": "steps",
          "items": [
            "ใน **Recipes** เลื่อนแถบไปที่สูตรสีที่ต้องการ ภาพสดจะแสดงผลให้ดู และค่าต่าง ๆ จะขึ้นทางซ้ายของจอ",
            "กด {{OK}} เพื่อใช้งาน ADJ จะปิด หรือแสดงข้อความเมื่อบางค่าของสูตรสีใช้ไม่ได้",
            "สูตรสียังเก็บค่า Grain style ไว้ด้วย ไม่ว่าจะเป็น System หรือ Film-like",
            "เปลี่ยนใจไหม เลือก **Undo** จะดึงค่ากล้องที่สูตรสีเปลี่ยนไปกลับคืนได้สูงสุด 5 สูตรสีล่าสุด"
          ]
        },
        {
          "kind": "list",
          "items": [
            "ADJ จะขึ้น **Undo** (เมื่อมีสิ่งที่ย้อนกลับได้) ตามด้วยสูตรสีที่เปิดอยู่ แล้วปิดท้ายด้วย **Save Settings**",
            "การ์ดเก็บสูตรสีได้สูงสุด 64 สูตร และเปิดใช้งานใน ADJ ได้สูงสุด 40 สูตร ใน MENU เลือกตั้งค่าได้ใน **Options**"
          ]
        },
        {
          "kind": "h2",
          "id": "edit",
          "text": "เปลี่ยนชื่อหรือลบ"
        },
        {
          "kind": "p",
          "text": "เลื่อนไปที่สูตรสีแล้วกด {{Fn}} จากนั้นเลือก **Rename** หรือ **Delete** ใน MENU หน้าของแต่ละสูตรสีจะมี **Apply** และ **View** ที่แสดงค่าตั้งพร้อมไอคอน"
        },
        {
          "kind": "h2",
          "id": "site",
          "text": "สูตรสีจากเว็บ"
        },
        {
          "kind": "p",
          "text": "ในขั้นตอนที่ 3 ของการ[ติดตั้ง](site:install) คุณเพิ่มสูตรสีฮิตจากชุมชนหรือทำเองได้ แล้วเขียนลงการ์ดพร้อมกับฟิล์มลุคของคุณ"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "สูตรสีขึ้นว่าขาดโมดูลหรือเปล่า",
          "text": "สูตรสีที่มีเกรนต้องมีโมดูล Grain บนการ์ด ส่วน Glow และ Border ก็เหมือนกัน สูตรสีที่ใช้ฟิล์มลุคที่ยังไม่มีบนการ์ดจะขึ้นว่า **Effect not installed**"
        }
      ]
    },
    "framing": {
      "title": "Framing",
      "sources": [
        "modules/framing/module.toml",
        "modules/framing/text/en.toml"
      ],
      "seo": "XPan และสัดส่วนภาพอื่นบน RICOH GR (Framing)",
      "lead": "ถ่ายในสัดส่วนภาพอื่นได้ เช่น XPan, 2.35:1, 16:9, 1:1 และอีกมากมาย",
      "keywords": "การจัดเฟรม สัดส่วนภาพ framing aspect ratio xpan panorama 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 กรอบภาพ เส้นไกด์ mask frame lines guides only crop",
      "blocks": [
        {
          "kind": "frame",
          "mode": "framing",
          "alt": "ทางเดินในสวนไปยังบ้านหินที่ถ่ายด้วย GRKU พร้อมกรอบของสัดส่วนภาพที่เลือก"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Framing"
            ],
            [
              "JPEG",
              "ตัดตามสัดส่วน (Crop mode)"
            ],
            [
              "DNG",
              "ไม่ตัดตามสัดส่วน"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "เลื่อนไปเลือกอัตราส่วน หน้าจอแสดงภาพจะเห็นกรอบตามนั้น กด {{OK}} เพื่อยืนยัน ในโหมด Crop ไฟล์ JPEG จะถูกตัดขอบตามอัตราส่วน ส่วนไฟล์ DNG จะไม่ถูกตัด เมื่อ GR WORLD ขอรูปขนาดเล็กลง รูปที่มี Framing size จะส่งเข้ามือถือเป็นสำเนาที่เล็กลง ประมาณ 1920 พิกเซลในด้านยาว"
        },
        {
          "kind": "screen",
          "screen": "framing",
          "source": "drawn",
          "alt": "Framing ในหน้า ADJ โดยเลือก XPan ไว้ จอภาพสดจะมืดลงนอกกรอบ XPan"
        },
        {
          "kind": "screen",
          "screen": "framing",
          "source": "drawn",
          "alt": "Framing ในหน้า ADJ โดยเลือก XPan ไว้ จอภาพสดจะมืดลงนอกกรอบ XPan"
        },
        {
          "kind": "settings",
          "module": "framing",
          "notes": {
            "CORE.ASPECT": "สัดส่วนของภาพ 3:4 เป็นกรอบแนวตั้ง เหมือนกล้องฮาล์ฟเฟรม",
            "CORE.ASPECT_MODE": "**Crop** จะครอปไฟล์ JPEG ตามสัดส่วนภาพ ส่วน DNG จะเก็บภาพเต็มใบไว้ **Guides Only** จะแสดงกรอบและเก็บภาพเต็มใบไว้",
            "MASK": "รูปแบบที่หน้าจอแสดงพื้นที่นอกกรอบเฟรม",
            "LABEL": "แสดงสัดส่วนภาพบนหน้าจอถ่ายภาพ"
          }
        },
        {
          "kind": "p",
          "text": "กด {{Fn}} ที่ Framing เพื่อตั้งค่า **Mode** และ **Mask** 3:4 เป็นเฟรมแนวตั้ง เหมือนกล้องฮาล์ฟเฟรม"
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
      "sources": [
        "modules/crop/module.toml",
        "modules/crop/text/en.toml",
        "runtime/modules.h (GR IIIx focal lengths)"
      ],
      "seo": "ครอประยะ 35, 50 และ 70 mm บน RICOH GR (Crop)",
      "lead": "ถ่ายที่ทางยาวโฟกัสไกลขึ้น เหมือนดิจิทัลเทเลคอนเวอร์เตอร์ พร้อมกรอบเฟรมในภาพสดบนจอ",
      "keywords": "crop ครอป ระยะ โฟกัส ทางยาวโฟกัส ซูม เทเล กรอบ เฟรม มาสก์ ไฟล์ดิบ focal length 35mm 40mm 50mm 70mm 57mm 71mm 100mm zoom tele frame only mask uncropped raw",
      "blocks": [
        {
          "kind": "frame",
          "mode": "crop",
          "alt": "ทางเดินในสวนไปสู่บ้านหิน ถ่ายด้วย GRKU พร้อมกรอบเฟรมตามทางยาวโฟกัสที่เลือก"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Crop"
            ],
            [
              "ตัวเลือก",
              "35, 40, 50, 70 mm"
            ],
            [
              "GR IIIx",
              "50, 57, 71, 100 mm"
            ]
          ]
        },
        {
          "kind": "settings",
          "module": "crop",
          "notes": {
            "CORE.CROP": "ทางยาวโฟกัส เหมือนดิจิทัลเทเลคอนเวอร์เตอร์ ส่วน GR IIIx จะแสดง 50, 57, 71 และ 100 mm แทน",
            "CORE.CROP_MODE": "**Crop** จะครอปรูป ส่วน **Frame Only** จะแสดงกรอบเฟรมและเก็บภาพเต็มใบไว้",
            "MASK": "รูปแบบที่หน้าจอแสดงพื้นที่นอกกรอบเฟรม"
          }
        },
        {
          "kind": "p",
          "text": "กด {{Fn}} ที่เมนู Crop เพื่อตั้ง **Mode** และ **Mask** บน GR IV ถ้าเลือกทางยาวโฟกัสทันทีหลังถ่ายรูป กล้องจะรอจนกว่ารูปนั้นจะบันทึกเสร็จ จึงไม่ทำให้รูปสุดท้ายเสีย แต่หน้าจอแสดงภาพจะเปลี่ยนเป็น Crop ใหม่ทันที เมื่อ GR WORLD ขอรูปขนาดเล็กลง รูปที่ถูก Crop จะส่งเข้ามือถือเป็นสำเนาที่เล็กลง ประมาณ 1920 พิกเซลในด้านยาว ที่ระยะ 35, 40 และ 50 mm หน้าจอแสดงภาพจะซูมเข้า โดยไม่มีกรอบ ที่ระยะ 70 mm จะแสดงกรอบในมุมมองของ 50 mm และบน GR IV ระยะ 40 mm จะแสดงกรอบในมุมมองของ 35 mm ในโหมด Crop ทั้ง JPEG และ DNG จะถูกตัดขอบ เว้นแต่จะเปิด **Uncropped RAW** ใน ADJ หน้าจอแสดงภาพจะแสดงกรอบของทางยาวโฟกัสที่เลือกอยู่ Crop ใช้ได้กับทุกอัตราส่วน Framing"
        },
        {
          "kind": "screen",
          "screen": "crop",
          "source": "drawn",
          "alt": "Crop ในหน้า ADJ โดยเลือก 50mm ไว้ จอภาพสดจะซูมเข้าเป็นระยะ 50mm"
        },
        {
          "kind": "screen",
          "screen": "crop",
          "source": "drawn",
          "alt": "Crop ในหน้า ADJ โดยเลือก 50mm ไว้ จอภาพสดจะซูมเข้าเป็นระยะ 50mm"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "เก็บภาพเต็มใบไว้ใน DNG",
          "text": "เปิด **Uncropped RAW** ใน [GRKU Settings](doc:settings#shooting) ไฟล์ DNG จะเก็บภาพเต็มเซ็นเซอร์ไว้ และ Lightroom จะเปิดไฟล์พร้อมระยะครอปของคุณ ซึ่งย้อนกลับได้ทีหลัง"
        }
      ]
    },
    "guides": {
      "title": "Guides",
      "sources": [
        "modules/guides/module.toml",
        "modules/guides/text/en.toml"
      ],
      "seo": "เส้นไกด์จัดองค์ประกอบบน GR: สามส่วน สัดส่วนทองคำ ก้นหอย",
      "lead": "เส้นจัดองค์ประกอบบนหน้าจอ ไม่ติดไปในรูป",
      "keywords": "เส้นจัดองค์ประกอบ ตารางเก้าช่อง จุดกึ่งกลาง สัดส่วนทองคำ เส้นทแยงมุม ก้นหอยทองคำ ไดนามิกซิมเมตรี จัดองค์ประกอบ หน้าจอ ความโปร่งใส สี guides grid lines thirds center golden ratio diagonals golden spiral dynamic symmetry composition disp opacity color",
      "blocks": [
        {
          "kind": "frame",
          "mode": "guides",
          "alt": "ทางเดินในสวนไปสู่บ้านหิน ถ่ายด้วย GRKU แสดงเส้นไกด์ที่เลือก"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Guides"
            ],
            [
              "ในภาพ",
              "ไม่ปรากฏในภาพเลย"
            ],
            [
              "{{Fn}}",
              "หมุนเส้นเกลียวทอง"
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "guides",
          "source": "drawn",
          "alt": "เปิด Guides ในเมนู ADJ โดยเลือก Thirds เส้นแบ่งสามส่วนจะแสดงบนจอภาพสด"
        },
        {
          "kind": "settings",
          "module": "guides",
          "notes": {
            "STYLE": "เส้นบนหน้าจอ ไม่ติดไปในรูป",
            "COLOR": "สีของเส้น",
            "OPACITY": "เส้นชัดแค่ไหน",
            "DISP": "เปิด: ซ่อนเส้นเมื่อ {{DISP}} ซ่อนข้อมูลบนหน้าจอ ปิด: แสดงตลอด",
            "SPIRAL": "ทิศหมุนของก้นหอยทองคำ เมื่อเลือก Golden Spiral ใน ADJ ให้กด {{Fn}} เพื่อหมุนไปยังมุมถัดไป"
          }
        },
        {
          "kind": "p",
          "text": "เมื่อเลือก **Golden Spiral** ใน ADJ ให้กด {{Fn}} เพื่อหมุนก้นหอยไปยังมุมถัดไป กล้องจะซ่อนเส้นตารางของกล้องเองตอน GRKU วาดเส้นไกด์"
        }
      ]
    },
    "date": {
      "title": "Date Imprint",
      "sources": [
        "modules/date/module.toml",
        "modules/date/text/en.toml",
        "CHANGELOG.md 1.9.0, 1.10.0"
      ],
      "seo": "พิมพ์วันที่ลงบนรูป RICOH GR (Date Imprint)",
      "lead": "พิมพ์วันที่ลงบนรูปเหมือนกล้องฟิล์ม มี 3 ฟอนต์ 5 สี และใส่คำบรรยายได้",
      "keywords": "พิมพ์วันที่ วันที่ เวลา ฟอนต์ คลาสสิก gr1s gr ii สี ส้ม ขนาด ตำแหน่ง มุม คำบรรยาย ขอบคุณ สุขสันต์วันเกิด เรืองแสง date imprint stamp time font classic gr1s gr ii color orange size position corner caption thank you happy birthday grku glow",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Date Imprint"
            ],
            [
              "JPEG",
              "พิมพ์วันที่ลงบนภาพ"
            ],
            [
              "DNG",
              "ไม่แสดงวันที่"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-date",
          "label": "Date Imprint: 'YY M D",
          "alt": "เก้าอี้ผ้าใบสองตัวใต้ร่มกันแดด โดยไม่มีการประทับวันที่ และกับการประทับวันที่แบบ Date Imprint: 'YY M D ตำแหน่ง Film มุมขวาล่าง ขนาด M ฟอนต์ Classic สี Standard"
        },
        {
          "kind": "p",
          "text": "เลือกแถบรูปแบบวันที่แล้วกด {{OK}} กด {{Fn}} เพื่อดูการตั้งค่าอื่น กล้องจะพิมพ์วันที่และเวลาจากนาฬิกาของกล้อง จึงควรตั้งเวลาก่อน"
        },
        {
          "kind": "screen",
          "screen": "date",
          "source": "drawn",
          "alt": "เปิด Date Imprint ในเมนู ADJ โดยเลือกสไตล์ 'YY M D วันที่จะปรากฏเฉพาะในไฟล์ JPEG ไม่แสดงบนจอภาพสด"
        },
        {
          "kind": "settings",
          "module": "date",
          "notes": {
            "STYLE": "รูปแบบวันที่ มีหรือไม่มีเวลาก็ได้ กล้องจะพิมพ์วันที่และเวลาตามนาฬิกาของกล้อง จึงควรตั้งนาฬิกาก่อน ไม่ใช่หัวข้อใน MENU ให้เลือกใน ADJ หรือกด {{Fn}} ที่หน้านี้",
            "POSITION": "**Film** พิมพ์วันที่ในตำแหน่งเดียวกับกล้องฟิล์ม **Upright** คงทิศทางให้ตั้งตรงในภาพแนวตั้ง ไม่ใช่หัวข้อใน MENU ให้ตั้งค่าโดยกด {{Fn}} ใน ADJ",
            "CORNER": "ตำแหน่งที่วางวันที่ Bottom Split วางวันที่ไว้ทางซ้ายและคำบรรยายไว้ทางขวา",
            "SIZE": "ขนาดของตัวเลข",
            "LOOK": "รูปแบบตัวอักษร: Classic, GR1s (dot matrix) หรือ GR II",
            "COLOR": "Standard คือสีตัวอักษรตามปกติ: สีส้มสำหรับ Classic และ GR II และสีเหลืองสำหรับ GR1s ภาพขาวดำได้ตัวอักษรสีขาว",
            "GLOW": "แสงฟุ้งนุ่มๆ รอบตัวเลข GR II พิมพ์ตัวเลขเรียบๆ ไม่มีแสงฟุ้ง",
            "CAPTION": "คำที่อยู่หน้าวันที่ ในรูปแสดง <3 เป็นรูปหัวใจ",
            "ICON": "แสดงรูปแบบวันที่บนหน้าจอตอนถ่าย"
          }
        },
        {
          "kind": "compare",
          "before": "chairs-date-crop",
          "after": "chairs-date-gr1s-crop",
          "beforeLabel": "ฟอนต์วันที่: Classic",
          "label": "Date Font: GR1s",
          "alt": "มุมขวาล่างของภาพ: วันที่ในฟอนต์ Classic (ซ้าย) และในฟอนต์ GR1s (ขวา) ส่วนการตั้งค่าอื่นๆ เหมือนเดิม"
        }
      ]
    },
    "glow": {
      "title": "Glow",
      "sources": [
        "modules/glow/module.toml",
        "modules/glow/text/en.toml"
      ],
      "seo": "แสงฟุ้งและฮาเลชันบน RICOH GR (Glow)",
      "lead": "แสงฟุ้งรอบดวงไฟและส่วนสว่าง รวมถึงฮาเลชันสีแดงส้มแบบฟิล์มหนัง",
      "keywords": "แสงฟุ้ง ฮาเลชัน ฟิล์มหนัง แดง ส้ม ทอง ขาว ไฮไลต์ ดวงไฟ กลางคืน glow bloom halation cinestill red orange gold white highlights lights night",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Glow"
            ],
            [
              "JPEG",
              "เฉพาะไฟล์ JPEG"
            ],
            [
              "ภาพตัวอย่างบนจอ",
              "ไม่มีภาพตัวอย่าง: ดูตอนเปิดดูภาพแทน"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-bloom",
          "label": "Bloom: Strong",
          "alt": "ดอกเดซี่ในวันที่ฟ้าครึ้ม เปรียบเทียบแบบไม่มีและใช้ Bloom ที่ระดับ Strong จะเห็นผลชัดที่สุดตรงจุดสว่างจ้า"
        },
        {
          "kind": "p",
          "text": "Glow แบ่งเป็นสองส่วน แต่ละส่วนมีความแรงของตัวเอง และใช้ร่วมกันได้"
        },
        {
          "kind": "p",
          "text": "ใน ADJ เลื่อนไปที่ **Bloom** หรือ **Halation** แล้วกด {{Fn}} เพื่อดูการตั้งค่าอื่นๆ เช่น สีของ Halation และไอคอน"
        },
        {
          "kind": "settings",
          "module": "glow",
          "notes": {
            "BLOOM": "**Bloom** คือแสงฟุ้งนุ่มๆ รอบจุดสว่าง",
            "BLOOM_ICON": "แสดงไอคอน Bloom บนหน้าจอถ่ายภาพ",
            "HALATION": "**Halation** คือแสงเรืองสีรอบดวงไฟ เหมือนฟิล์ม CineStill",
            "HALATION_COLOR": "สีของแสงเรือง ใช้ไม่ได้กับ GR IV Monochrome",
            "HALATION_ICON": "แสดงไอคอน Halation บนหน้าจอถ่ายภาพ"
          }
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "ดูในหน้าเล่นภาพ",
          "text": "Glow เปลี่ยนแค่ JPEG และไม่เห็นในภาพสด ดูรูปในหน้าเล่นภาพ"
        }
      ]
    },
    "light-leak": {
      "title": "Light Leak",
      "sources": [
        "modules/lightleak/module.toml",
        "modules/lightleak/text/en.toml",
        "modules/lightleak/lightleak.c"
      ],
      "seo": "เอฟเฟกต์แสงรั่ว ฝุ่น และขอบมืดบน GR",
      "lead": "ร่องรอยของฟิล์มเก่า ทั้งขอบมืด ฝุ่นและเส้นผม แสงรั่ว และรอยขีดข่วน",
      "keywords": "light leak vignette dust scratches faded dusty leaky expired old film lomo retro แสงรั่ว ขอบมืด ฝุ่น รอยขีดข่วน ซีด เก่า หมดอายุ ย้อนยุค",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Light Leak"
            ],
            [
              "JPEG",
              "เฉพาะไฟล์ JPEG"
            ],
            [
              "ภาพตัวอย่างบนจอ",
              "ไม่มีภาพตัวอย่าง: ดูตอนเปิดดูภาพแทน"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-leak",
          "label": "Light Leak: Leaky",
          "alt": "บ้านหินและทางเดินในสวน เปรียบเทียบแบบไม่มีและใช้ Light Leak ที่ระดับ Leaky"
        },
        {
          "kind": "screen",
          "screen": "light-leak",
          "source": "drawn",
          "alt": "เปิด Light Leak ในเมนู ADJ โดยเลือก Faded"
        },
        {
          "kind": "settings",
          "module": "lightleak",
          "notes": {
            "LOOK": "**Custom** ใช้ระดับความแรงที่คุณตั้งไว้ด้านล่าง ส่วนตัวอื่นเป็นแบบผสมสำเร็จรูป",
            "VIGNETTE": "ขอบมืดลง ใช้กับ Custom",
            "DUST": "ฝุ่นและเส้นผม ใช้กับ Custom",
            "LEAK": "แสงรั่วเข้าฟิล์มจากขอบ ใช้กับ Custom",
            "SCRATCH": "รอยขีดข่วนบนฟิล์ม ใช้กับ Custom"
          }
        },
        {
          "kind": "p",
          "text": "เลือก **Custom** แล้วกด {{Fn}} เพื่อตั้งความแรงของแต่ละส่วน ฝุ่น แสงรั่ว และรอยขีดข่วนจะตกต่างกันไปในแต่ละรูป Light Leak เปลี่ยนเฉพาะ JPEG และไม่แสดงในภาพสด"
        }
      ]
    },
    "diffusion": {
      "title": "Diffusion",
      "sources": [
        "modules/diffusion/module.toml",
        "modules/diffusion/text/en.toml"
      ],
      "seo": "ฟิลเตอร์ฟุ้งแบบ Black Pro-Mist และความนุ่มนวลแบบฟิล์มบน GR",
      "lead": "แสงฟุ้งนุ่มๆ ของฟิลเตอร์ Black Pro-Mist และความนุ่มละมุนแบบภาพสแกนฟิล์ม",
      "keywords": "ฟุ้ง ซอฟต์ ฟิลเตอร์ โกลว์ แสงแฉก นุ่มละมุน ฟิล์ม diffusion filter pro mist black mist streak anamorphic softness film softness soft dreamy",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Diffusion"
            ],
            [
              "JPEG",
              "เฉพาะไฟล์ JPEG"
            ],
            [
              "ภาพตัวอย่างบนจอ",
              "ไม่มีภาพตัวอย่าง: ดูตอนเปิดดูภาพแทน"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-diffusion",
          "label": "Filter: 1/2",
          "alt": "ดอกเดซี่ เปรียบเทียบแบบไม่มีและใช้ฟิลเตอร์ Diffusion ที่ระดับ 1/2"
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-softness",
          "label": "Film Softness: High",
          "alt": "ดอกเดซี่ เปรียบเทียบแบบไม่มีและใช้ Film Softness ที่ระดับ High"
        },
        {
          "kind": "p",
          "text": "Diffusion มีสองส่วนคือ **Filter** และ **Softness** แต่ละส่วนทำงานแยกกัน"
        },
        {
          "kind": "settings",
          "module": "diffusion",
          "notes": {
            "STRENGTH": "**Filter**: ความฟุ้งของฟิลเตอร์ เหมือนระดับความแรงของฟิลเตอร์",
            "MIST": "**Filter**: ม่านหมอกบางๆ บนเงามืด ทำงานเมื่อ Strength ไม่ใช่ Off",
            "STREAK": "**Filter**: แสงแฉกแนวนอนของเลนส์ anamorphic บนจุดไฟ ทำงานเมื่อ Strength ไม่ใช่ Off",
            "SOFTNESS": "**Softness**: รายละเอียดเล็กๆ จะจางลงและไฮไลต์ค่อยๆ ไล่โทน เหมือนภาพสแกนฟิล์ม ทำงานได้ด้วยตัวเอง"
          }
        },
        {
          "kind": "p",
          "text": "Diffusion เปลี่ยนเฉพาะ JPEG และไม่แสดงในภาพสด"
        }
      ]
    },
    "grain": {
      "title": "Grain",
      "sources": [
        "modules/grain/module.toml",
        "modules/grain/text/en.toml",
        "modules/grain/grain.c",
        "CHANGELOG.md 1.10.0"
      ],
      "seo": "เกรนฟิล์มบน RICOH GR: ความแรง ขนาด และ Film-like",
      "lead": "เกรนฟิล์มสี่ระดับความแรงและสี่ขนาด ตามแบบที่กล้องสร้างให้หรือแบบ Film-like",
      "keywords": "เกรน นอยส์ เม็ดฟิล์ม ขนาด ความแรง อ่อน กลาง แรง พิเศษ grain noise film-like system size strength weak medium strong extra",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Grain"
            ],
            [
              "สไตล์",
              "แบบระบบ หรือ แบบฟิล์ม"
            ],
            [
              "ขนาดอัตโนมัติ",
              "ปรับตาม ISO ของรูป"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard-crop",
          "after": "house-grain-crop",
          "label": "Grain: Strong, Size Medium, Film-like",
          "alt": "ภาพขยายเต็มของผนังหินและกันสาด เปรียบเทียบแบบไม่มีและใช้ Grain ที่ระดับ Strong ขนาด Medium สไตล์ Film-like"
        },
        {
          "kind": "screen",
          "screen": "grain",
          "source": "drawn",
          "alt": "เปิด Grain ในเมนู ADJ โดยเลือก Medium เม็ดฟิล์มจะปรากฏในภาพถ่าย ไม่แสดงบนจอภาพสด"
        },
        {
          "kind": "settings",
          "module": "grain",
          "notes": {
            "CORE.GRAIN": "ความแรงของเกรน",
            "CORE.GRAIN_SIZE": "ขนาดของเกรน Auto จะปรับตาม ISO ของภาพที่ถ่าย",
            "STYLE": "**System** คือเกรนของกล้อง **Film-like** คือเกรนของภาพอัดจากฟิล์มเนกาทีฟสี แรงสุดตรงโทนกลาง ไม่มีในสีขาวหรือดำ และเป็นเกรนสีบนภาพสี",
            "ICON": "แสดงไอคอนเกรนบนหน้าจอถ่ายภาพ"
          }
        },
        {
          "kind": "p",
          "text": "กด {{Fn}} ที่ Grain เพื่อตั้งค่า **Size** และ **Style** เกรนแบบ Film-like อ้างอิงโมเดลเกรนของ spektrafilm โดย Andrea Volpato"
        }
      ]
    },
    "border": {
      "title": "Border",
      "sources": [
        "modules/border/module.toml",
        "modules/border/text/en.toml",
        "CHANGELOG.md 1.8.5",
        "web/src/generated/modules.ts (DEFAULT_MODULES)"
      ],
      "seo": "ขอบภาพสีขาว สีดำ และแบบภาพถ่ายทันทีบน GR",
      "lead": "ขอบสีขาวหรือสีดำรอบทั้งภาพ ภาพยังมีครบทุกพิกเซล",
      "keywords": "ขอบ กรอบ ขาว ดำ บาง กว้าง ภาพถ่ายทันที โพลารอยด์ ขอบภาพ border frame white black thin wide instant polaroid edge",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "เมนู",
              "ADJ › GRKU › Border"
            ],
            [
              "JPEG",
              "เพิ่มขนาดตามขอบ"
            ],
            [
              "DNG",
              "ไม่มีขอบ"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-border-wide",
          "label": "Border: Wide, White",
          "alt": "บ้านหิน เปรียบเทียบแบบไม่มีและใช้ขอบสีขาวแบบ Wide"
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-border-instant",
          "label": "Border: Instant, White",
          "alt": "บ้านหิน เปรียบเทียบแบบไม่มีและใช้ขอบสีขาวแบบ Instant"
        },
        {
          "kind": "screen",
          "screen": "border",
          "source": "drawn",
          "alt": "เปิด Border ในเมนู ADJ โดยเลือก Thin ขอบภาพจะถูกเพิ่มรอบไฟล์ JPEG"
        },
        {
          "kind": "settings",
          "module": "border",
          "notes": {
            "CORE.BORDER": "**Thin** กว้างราว 3% ของด้านสั้น **Wide** ราว 6% **Instant** ราว 4% และขอบล่างกว้างเป็นสามเท่า บน GR IV ขอบขนาดใหญ่จะแคบลงเล็กน้อยเมื่อกล้องมีหน่วยความจำเหลือน้อย",
            "CORE.BORDER_COLOR": "สีของขอบภาพ",
            "ICON": "แสดงไอคอนขอบภาพบนหน้าจอถ่ายภาพ"
          }
        },
        {
          "kind": "p",
          "text": "ไฟล์ JPEG จะขยายใหญ่ขึ้นตามขอบ จึงไม่บังส่วนใดของภาพ การล้าง RAW ในกล้องก็เพิ่มขอบได้เช่นกัน"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "ไม่เจอในการ์ดใช่ไหม",
          "text": "ตอนแรกการติดตั้งจะยังไม่ใส่ Border เข้ามา ที่ขั้นตอนที่ 3 ของ[การติดตั้ง](site:install) ให้เปิด Border การ์ดรองรับได้สูงสุด 10 โมดูล ถ้าเปิดครบทั้ง 10 อย่างแล้ว ให้ปิดตัวที่ไม่ค่อยได้ใช้ไปหนึ่งตัว"
        }
      ]
    },
    "mode-dial": {
      "title": "แป้นหมุนโหมดและ U1–U3",
      "sources": [
        "runtime/mode_dial.h",
        "runtime/menu_dial.h",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "ใช้ GRKU บนแป้นหมุนโหมด: การตั้งค่า U1, U2, U3",
      "lead": "เปิดหรือปิด GRKU ในแต่ละตำแหน่งบนแป้นหมุน และบันทึกฟิล์มลุคทั้งชุดไว้ที่ U1, U2 หรือ U3",
      "keywords": "แป้นหมุนโหมด u1 u2 u3 โหมดผู้ใช้ บันทึกการตั้งค่าปัจจุบัน p av tv m sn ตำแหน่ง mode dial u1 u2 u3 user mode save current settings p av tv m sn position",
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
          "kind": "p",
          "text": "P, Av, Tv, M และ Sn (GR IV) ใช้ชุดการตั้งค่า GRKU ร่วมกัน บน GR IV หน้านี้จะเรียงเป็น P, Av, Tv, Sn แล้วตามด้วย M แต่ละตำแหน่งตั้งค่า GRKU เป็น **On** หรือ **Off** ได้ ทั้งหมดนี้จะทำงานเมื่อ **Enable GRKU** เป็น On"
        },
        {
          "kind": "screen",
          "screen": "mode-dial-gr4",
          "source": "drawn",
          "alt": "หน้า Mode Dial ใน GRKU Settings บน GR IV: GRKU เป็น On สำหรับโหมด P, Av, Tv, Sn, M และ U1"
        },
        {
          "kind": "h2",
          "id": "user",
          "text": "U1, U2 และ U3"
        },
        {
          "kind": "list",
          "items": [
            "**On**: ตำแหน่งนี้ใช้การตั้งค่า GRKU ชุดเดียวกับ P, Av, Tv และ M",
            "**Off**: ตำแหน่งนี้ถ่ายภาพโดยไม่ใช้ GRKU",
            "**Save Current Settings**: บันทึกการตั้งค่ากล้องและการตั้งค่า GRKU ณ ตอนนี้ลงในตำแหน่งนี้ กล้องจะถามก่อนเขียนทับโหมดผู้ใช้ แล้วเปิดแป้นพิมพ์ให้ตั้งชื่อ พอหมุนแป้นมาที่ตำแหน่งนี้ ทั้งสองอย่างก็จะกลับมา ตำแหน่งนี้จะแสดงชื่อของสิ่งที่บันทึกไว้ แต่จะไม่บันทึกลำดับ ADJ, Enable at Start, Enable GRKU หรือการตั้งค่า Mode Dial"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "การบันทึกในเมนูกล้อง",
          "text": "ถ้าบันทึกโหมดผู้ใช้อีกครั้งผ่านเมนูกล้องของ RICOH ตำแหน่งนั้นจะเสียฟิล์มลุคของ GRKU ไป ให้ใช้ **Save Current Settings** ใน GRKU Settings แทน"
        }
      ]
    },
    "raw": {
      "title": "การล้าง RAW ในกล้อง",
      "sources": [
        "runtime/develop_settings.h",
        "runtime/picture.c",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "ล้างไฟล์ DNG ของ GR ด้วยฟิล์มลุค (การล้าง RAW ในกล้อง)",
      "lead": "GRKU ไม่แก้ข้อมูลดิบของภาพ ล้าง DNG ในกล้องด้วย GRKU หรือล้างบนคอมพิวเตอร์ก็ได้",
      "keywords": "ล้าง raw dng ล้างในกล้อง ดูภาพย้อนหลัง lightroom camera raw exiftool xmp ไม่ครอป raw dng development develop in camera playback lightroom camera raw exiftool xmp uncropped",
      "blocks": [
        {
          "kind": "h2",
          "id": "camera",
          "text": "ในกล้อง"
        },
        {
          "kind": "steps",
          "items": [
            "เปิดไฟล์ DNG ตอนดูภาพย้อนหลัง แล้วเริ่มการล้าง RAW ในกล้อง",
            "ถ้าจะเปลี่ยนฟิล์มลุค ให้เปิดรายการ Image Control กด {{Fn}} บนฟิล์มลุคที่เลือกเพื่อปรับแต่ง",
            "ถ้าจะตั้งค่า Grain, Glow, Border หรือ Date Imprint ให้เปิดแถว **GRKU** ที่ท้ายรายการ",
            "สั่งล้างภาพ"
          ]
        },
        {
          "kind": "p",
          "text": "การล้างจะเริ่มจากค่า GRKU ที่บันทึกไว้ในไฟล์ DNG ถ้าไฟล์นั้นมีค่าบันทึกไว้ แถว GRKU จะเปลี่ยนแค่การล้างครั้งนี้เท่านั้น คุณยังเลือก Framing ratio แบบอื่นในรายการตอนล้างได้ด้วย"
        },
        {
          "kind": "h2",
          "id": "computer",
          "text": "บนคอมพิวเตอร์"
        },
        {
          "kind": "p",
          "text": "ภาพที่ถ่ายตอนเปิด GRKU จะบันทึกค่าตั้งไว้ใน XMP ทำให้ exiftool และตัวอ่าน XMP อื่นๆ มองเห็นได้ เมื่อเปิด **Uncropped RAW** โปรแกรม Lightroom และ Camera Raw จะเปิดไฟล์ DNG ตามสัดส่วนครอปของภาพที่ถ่าย และคุณกดยกเลิกครอปนั้นทีหลังได้"
        },
        {
          "kind": "p",
          "text": "สำหรับภาพที่มีอยู่แล้ว หน้า [Develop](doc:develop) จะใส่ฟิล์มลุคและเอฟเฟกต์แบบเดียวกันให้ในเบราว์เซอร์"
        }
      ]
    },
    "settings": {
      "title": "GRKU Settings",
      "sources": [
        "runtime/menu_settings.h",
        "runtime/manage.h",
        "runtime/playback_info.h",
        "crates/grku-core/src/menu_text.rs"
      ],
      "seo": "ตั้งค่า GRKU ใน MENU: อธิบายทุกตัวเลือก",
      "lead": "ค่าตั้งของตัว GRKU เอง อยู่ใน MENU",
      "keywords": "ตั้งค่า grku เปิดใช้ตอนเปิดเครื่อง จำค่าล่าสุด ไม่ครอป raw ระยะทาง เมตร ฟุต แบตเตอรี่ ไอคอนดูภาพย้อนหลัง หน้าจอปิดเครื่อง custom picture แสดงข้อความ ลำดับ adj ซ่อน ไว้บนสุด grku settings enable at start keep last uncropped raw distance unit meters feet battery playback icons shutdown screen custom picture show text adj order hidden top",
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
          "kind": "table",
          "head": [
            "แถว",
            "หน้าที่"
          ],
          "rows": [
            [
              "**Enable at Start**",
              "สถานะ GRKU ตอนเปิดกล้องแต่ละครั้ง เลือก **On** (ค่าเริ่มต้น) **Off** หรือ **Keep Last** ตามที่ตั้งไว้ล่าสุด"
            ],
            [
              "**Mode Dial**",
              "เปิดหรือปิด GRKU ในแต่ละตำแหน่งบนแป้นหมุนโหมด และ U1 ถึง U3 ดูเพิ่มที่ [Mode dial](doc:mode-dial)"
            ],
            [
              "**ADJ Order**",
              "ลำดับของโมดูลในรายการ GRKU บน ADJ"
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "grku-settings",
          "source": "drawn",
          "alt": "หน้า GRKU Settings: Enable at Start, Shooting Settings, Display Settings, Shutdown Screen, Mode Dial และ ADJ Order"
        },
        {
          "kind": "p",
          "text": "บนหน้าจอกล้อง หน้านี้จะเรียง **Enable at Start** **Shooting Settings** **Display Settings** **Shutdown Screen** **Mode Dial** แล้วตามด้วย **ADJ Order** สวิตช์แต่ละตัวจะขึ้น On ก่อน Off"
        },
        {
          "kind": "h2",
          "id": "adj-order",
          "text": "ADJ Order"
        },
        {
          "kind": "p",
          "text": "เลื่อนโมดูลขึ้นหรือลงในรายการ GRKU **Top 1** ถึง **Top 4** จะให้โมดูลมีช่องของตัวเองบนแถบ ADJ ก่อน GRKU กดทีเดียวก็ถึง ส่วน **Hidden** จะซ่อนโมดูลจาก ADJ แต่ยังทำงานอยู่"
        },
        {
          "kind": "h2",
          "id": "shooting",
          "text": "Shooting Settings"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "หน้าที่"
          ],
          "rows": [
            [
              "**Uncropped RAW**",
              "ค่าเริ่มต้นคือ Off เมื่อเปิด On ไฟล์ DNG แต่ละไฟล์จะเก็บภาพเต็มเซนเซอร์ไว้ พร้อมเก็บกรอบที่ถ่ายเป็นค่าปรับที่ย้อนกลับได้ใน Lightroom และ Camera Raw ซึ่งอาจทำให้ Lightroom ไม่ใช้ค่าเริ่มต้น RAW ของตัวเอง"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "display",
          "text": "Display Settings"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "หน้าที่"
          ],
          "rows": [
            [
              "**Distance Unit**",
              "ระยะ Snap focus และสเกลโฟกัสแบบแมนนวลในหน่วย **Meters** (ค่าเริ่มต้น) หรือ **Feet**"
            ],
            [
              "**Simplified Info. Battery**",
              "ปิดอยู่เป็นค่าเริ่มต้น ถ้าเปิดจะแสดงไอคอนแบตเตอรี่ในหน้าข้อมูลย่อของ live view ด้วย"
            ],
            [
              "**Battery Percentage**",
              "ปิดเป็นค่าเริ่มต้น ถ้าเปิด จะแสดงระดับแบตเตอรี่เป็นตัวเลข ทีละ 2% ไอคอนแบบเดิมจะกลับมาเมื่อแบตต่ำ เชื่อมต่อไฟภายนอก หรือกล้องอ่านค่าไม่ได้"
            ],
            [
              "**Effect Icons in Playback**",
              "แสดงไอคอน Grain, Bloom, Halation, Border และ Date Imprint ของรูปในหน้าแรกของข้อมูลละเอียดตอนเปิดดูรูป และแสดงส่วนที่ครอปของรูป เปิดอยู่เป็นค่าเริ่มต้น"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "shutdown",
          "text": "หน้าจอตอนปิดกล้อง"
        },
        {
          "kind": "table",
          "head": [
            "แถว",
            "หน้าที่"
          ],
          "rows": [
            [
              "**Custom Picture**",
              "แสดงรูปของคุณเอง (`GRKU/GOODBYE.JPG`) ตอนปิดกล้อง เปิดอยู่เป็นค่าเริ่มต้น ดูที่ [รูปตอนปิดกล้อง](doc:shutdown)"
            ],
            [
              "**Show Text**",
              "เปิดอยู่เป็นค่าเริ่มต้น ถ้าปิดจะซ่อนจำนวนรูปที่ถ่ายและเวอร์ชันเฟิร์มแวร์ที่กล้องวาดตอนปิดกล้อง"
            ]
          ]
        }
      ]
    },
    "looks": {
      "title": "เลือกฟิล์มลุคบนเว็บ",
      "sources": [
        "web/src/plus.ts (FREE_SLOTS)",
        "web/src/lookSearch.ts",
        "web/src/strings/en.ts (importOpen, kindImported)",
        "CHANGELOG.md 1.9.0 (xmp)"
      ],
      "seo": "วิธีเลือกฟิล์มลุคและนำเข้า LUT หรือ Lightroom preset",
      "lead": "เลือกฟิล์มลุคลงการ์ด ค้นหาในคลัง และนำเข้า LUT ของคุณเอง",
      "keywords": "คลัง เลือก ฟิล์มลุค ค้นหา ช่อง ฟรี 10 40 นำเข้า lut cube xmp lightroom preset ประเภท เนกาทีฟ สไลด์ ขาวดำ library choose looks search slots free 10 40 import lut cube xmp lightroom preset kinds negative slide black and white",
      "blocks": [
        {
          "kind": "p",
          "text": "ขั้นตอนที่ 1 ของ [การติดตั้ง](site:install) จะแสดงคลังทั้งหมด ได้แก่ Kodak, Fujifilm, Ilford, CineStill, Polaroid, ฟิล์มสำหรับหนังและสไลด์, ขาวดำ, การจำลองฟิล์มของกล้อง FUJIFILM และฟิล์มลุคของ GRKU เอง เช่น GR II Positive (GRKU) และ FinePix CCD"
        },
        {
          "kind": "h2",
          "id": "pick",
          "text": "เลือกฟิล์มลุค"
        },
        {
          "kind": "steps",
          "items": [
            "แตะฟิล์มลุคเพื่อดูบนรูปตัวอย่าง",
            "ติ๊กเลือกฟิล์มลุคที่อยากได้ลงการ์ด ฟรี 10 แบบ การ์ดหนึ่งใบใส่ได้สูงสุด 40 แบบ",
            "ค้นหาจากชื่อ ยี่ห้อ หรือประเภท เช่น \"portra\" \"fuji\" หรือ \"ขาวดำ\" คำยาวที่พิมพ์ผิดนิดหน่อยก็ยังหาเจอ"
          ]
        },
        {
          "kind": "p",
          "text": "อยากลองดูฟิล์มลุคกับรูปของตัวเองก่อนไหม กด **ลองใช้กับรูปของคุณ** เพื่อเปิดในหน้า [ล้างรูป](doc:develop) ได้เลย"
        },
        {
          "kind": "h2",
          "id": "ricoh",
          "text": "ลุคเพิ่มเติมจาก RICOH"
        },
        {
          "kind": "p",
          "text": "ลุคบางตัวมีอยู่ในกล้อง RICOH รุ่นอื่น GRKU สามารถคัดลอกมาใช้งานได้ฟรีจากไฟล์เฟิร์มแวร์ทางการของรุ่นนั้น ซึ่งคุณดาวน์โหลดจาก RICOH คุณไม่ต้องอัปเดตกล้องด้วยไฟล์นี้: GRKU เพียงแค่อ่านค่าลุคจากไฟล์ในเบราว์เซอร์ของคุณ ไฟล์จะไม่ถูกอัปโหลด"
        },
        {
          "kind": "steps",
          "items": [
            "ในขั้นตอนที่ 1 ของ [หน้าติดตั้ง](site:install) ให้หา **ลุคเพิ่มเติมจาก RICOH** แล้วกด **รับลุคเหล่านี้**",
            "ดาวน์โหลดเฟิร์มแวร์ของรุ่นนั้นจากเว็บไซต์ RICOH: GR IV เวอร์ชัน 1.11, 1.20 หรือ 1.21 สำหรับลุคของ GR IV และ GR II เวอร์ชัน 3.00 สำหรับ GR II Positive",
            "ในหน้าต่างที่เปิดขึ้นมา เลือกไฟล์ หรือลากมาวางได้เลย ไฟล์ ZIP ใช้ได้ ไม่ต้องแตกไฟล์",
            "รอสักครู่ ลุคเหล่านั้นจะปรากฏในรายการของคุณ ตรวจสอบได้เหมือนลุคทั่วไป"
          ]
        },
        {
          "kind": "table",
          "head": [
            "กล้องของคุณ",
            "ลุคที่คุณรับได้"
          ],
          "rows": [
            [
              "GR III, GR IIIx และรุ่น HDF ของทั้งสอง",
              "จากไฟล์ GR IV: Cinema Yellow, Cinema Green, Mono Standard, Mono Solid, Mono Soft, Mono Hi-Contrast, Mono Grainy และ Solarized 1 ถึง 3 จากไฟล์ GR II: GR II Positive"
            ],
            [
              "GR IV, GR IV HDF",
              "จากไฟล์ GR IV: ลุค Mono ต่างๆ และ Solarized 1 ถึง 3 จากไฟล์ GR II: GR II Positive"
            ],
            [
              "GR IV Monochrome",
              "ไม่มี"
            ]
          ]
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "Solarized",
          "text": "Solarized 1 ถึง 3 มีเฉพาะใน GR IV เวอร์ชันเฟิร์มแวร์ 1.20 หรือ 1.21 เท่านั้น"
        },
        {
          "kind": "h2",
          "id": "positive",
          "text": "GR II Positive, GR II Positive (GRKU) และ GR2 Positive"
        },
        {
          "kind": "p",
          "text": "ฟิล์มลุคสามตัวนี้มีชื่อคล้ายกับค่า **Positive Film** ของ GR II แต่ไม่ใช่ตัวเดียวกัน:"
        },
        {
          "kind": "list",
          "items": [
            "**GR II Positive (GRKU)**: ฟิล์มลุคของ GRKU ที่ทำขึ้นจากการดูภาพจาก GR II ด้วยตาเปล่า มีอยู่ในคลังให้ทุกคนใช้ได้ เดิมเรียกว่า Positive GRII ซึ่งค้นหาด้วยชื่อนั้นก็ยังเจอ บนกล้องจะแสดงเป็น **GRII Pos. (GRKU)**",
            "**GR2 Positive**: ฟิล์มลุคจาก LUT ของโปรเจกต์ Imprint สำหรับ GR2 Film Look มีอยู่ในคลังเช่นกัน",
            "**GR II Positive**: ค่า Positive Film ของ GR II เอง อ่านจากไฟล์ firmware ของ GR II ที่คุณดาวน์โหลดและใส่ไว้ใน Standard ของกล้อง คุณจะได้มันพร้อมกับ **ลุคเพิ่มเติมจาก RICOH** ด้านบน"
          ]
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
            "ฟิล์มลุคจะขึ้นใต้ **รายการนำเข้า** กดเลือกดูเหมือนฟิล์มลุคอื่นได้เลย"
          ]
        },
        {
          "kind": "p",
          "text": "พรีเซ็ตของ Lightroom จะกลายเป็นฟิล์มลุคจากค่าสีของมัน ค่าที่เปลี่ยนไปตามรูปแต่ละใบจะใกล้เคียงเท่านั้น"
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "โมดูล"
        },
        {
          "kind": "p",
          "text": "ขั้นตอนที่ 3 เลือกโมดูล การ์ดใส่ได้สูงสุด 10 โมดูลจากทั้งหมด 11 โมดูล โดยตอนติดตั้งจะยังไม่ใส่ Border ไว้ก่อน ขั้นตอนที่ 3 ยังเพิ่มสูตรสีและ[รูปตอนปิดกล้อง](doc:shutdown)ให้ด้วย"
        }
      ]
    },
    "plus": {
      "title": "GRKU Plus",
      "sources": [
        "web/src/plus.ts",
        "web/src/strings/en.ts (plus)",
        "web/src/components/PlusSheet.tsx"
      ],
      "seo": "GRKU Plus: ราคา การจ่ายเงิน และคีย์ของคุณ",
      "lead": "จ่ายครั้งเดียวแบบไม่บังคับ เพื่อเพิ่มฟิล์มลุคบนการ์ด ส่วน GRKU ยังใช้ฟรีได้เหมือนเดิมถ้าไม่ซื้อ",
      "keywords": "plus ราคา จ่าย ซื้อ คีย์ อีเมล promptpay truemoney สล็อต แพ็ก ทั้งหมด ปลดล็อก คืนเงิน บาท plus price pay buy key email promptpay truemoney slots pack everything unlock refund baht",
      "blocks": [
        {
          "kind": "p",
          "text": "ทุกอย่างใน GRKU ฟรี ดูตัวอย่างฟิล์มลุคได้ฟรีทั้งหมด ฟิล์มลุคในคลัง 10 แบบลงการ์ดได้ฟรี และทุกโมดูล สูตรสี กับหน้าล้างรูปก็ฟรี ส่วน GRKU Plus มีไว้สำหรับคนที่อยากได้ฟิล์มลุคบนการ์ดเพิ่ม และอยากสนับสนุนโปรเจกต์"
        },
        {
          "kind": "h2",
          "id": "tiers",
          "text": "สิ่งที่ปลดล็อกได้"
        },
        {
          "kind": "list",
          "items": [
            "**25 สล็อต**: เลือกฟิล์มลุคลงการ์ดได้ 25 แบบแทนที่จะเป็น 10 แบบ",
            "**หนึ่งแพ็ก**: ได้ฟิล์มลุคทั้งหมดของฟิล์มตระกูลนั้น เช่น โคดักสีหรือขาวดำ เพิ่มจากสล็อตฟรีของคุณ",
            "**ทั้งหมด**: ได้ฟิล์มลุคทุกแบบรวมถึงแบบใหม่ๆ ลงการ์ดได้ทีละ 40 แบบ และได้ GRKU Studio ทั้งหมด"
          ]
        },
        {
          "kind": "p",
          "text": "ไม่ว่าจะซื้อแบบไหน ก็เปิดใช้ GRKU Studio และดีไซน์ทั้งหมดได้ด้วย ดูราคาได้ที่หน้า [GRKU Plus](site:plus) เงินที่เคยจ่ายมาก่อนจะนับรวมให้แบบทั้งหมดกับ 25 สล็อต แต่ไม่นับรวมให้แบบแพ็ก ราคาช่วงเปิดตัวหมดเขต 1 มกราคม 2027"
        },
        {
          "kind": "h2",
          "id": "pay",
          "text": "จ่ายเงิน"
        },
        {
          "kind": "steps",
          "items": [
            "เปิด [GRKU Plus](site:plus) แล้วเลือกสิ่งที่ต้องการปลดล็อก",
            "พิมพ์อีเมลของคุณแล้วยอมรับ [terms of use](site:terms)",
            "จ่ายผ่าน QR PromptPay จากแอปธนาคารไทยไหนก็ได้ แล้วอัปโหลดสลิป หรือถ้าหน้าต่างมีตัวเลือกนี้ ให้วางลิงก์ซองของขวัญ TrueMoney",
            "ฟิล์มลุคจะปลดล็อกทันที",
            "คีย์จะถูกส่งทางอีเมล ใช้ได้กับทุกอุปกรณ์"
          ]
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "การคืนเงิน",
          "text": "เมื่อซื้อแล้วจะได้รับทันที จึงไม่มีการคืนเงินหากเปลี่ยนใจ คุณจะได้รับเงินคืนเต็มจำนวนเมื่อไม่ได้รับคีย์ หรือฟิล์มลุคไม่ปลดล็อกเนื่องจากข้อผิดพลาดจากฝั่งเราที่เราแก้ไขไม่ได้ภายใน 14 วัน ดูรายละเอียดได้ที่ [ข้อกำหนดการใช้งาน](site:terms)"
        },
        {
          "kind": "h2",
          "id": "key",
          "text": "ใช้คีย์ของคุณบนอุปกรณ์อื่น"
        },
        {
          "kind": "p",
          "text": "เปิด [GRKU Plus](site:plus-key) เลือก **ฉันมีคีย์อยู่แล้ว** วางคีย์ แล้วกด **ปลดล็อก** ไม่ได้รับอีเมลใช่ไหม กด **ฉันมีคีย์อยู่แล้ว** เพื่อส่งซ้ำได้"
        }
      ]
    },
    "shutdown": {
      "title": "ภาพตอนปิดกล้องและ GRKU Studio",
      "sources": [
        "web/src/strings/en.ts (shutdown)",
        "web/src/shutdownDesigns.ts",
        "CHANGELOG.md 1.9.0, 1.10.0",
        "runtime/manage.h (Custom Picture, Show Text)"
      ],
      "seo": "ภาพหน้าจอตอนปิดกล้องแบบกำหนดเองสำหรับ RICOH GR (GRKU Studio)",
      "lead": "แสดงภาพของคุณเองตอนปิดกล้อง หรือออกแบบได้ใน GRKU Studio",
      "keywords": "ภาพหน้าจอตอนปิดกล้อง ตอนปิดเครื่อง ปิดกล้อง สตูดิโอ ออกแบบ สติ๊กเกอร์ เทมเพลต โลโก้ ภาพกำหนดเอง shutdown screen picture goodbye power off studio design sticker template logo custom picture",
      "blocks": [
        {
          "kind": "p",
          "text": "ตอนปิดกล้อง GRKU สามารถแสดงภาพที่คุณเลือกได้ กล้องจะอ่านภาพนี้จาก `GRKU/GOODBYE.JPG` บนการ์ด"
        },
        {
          "kind": "h2",
          "id": "choose",
          "text": "เลือกรูป"
        },
        {
          "kind": "steps",
          "items": [
            "ในขั้นตอนที่ 3 ของหน้า [install](site:install) ให้หาการ์ดของหน้าจอตอนปิดกล้อง",
            "เลือกลายสำเร็จรูป ทำลายเอง หรือเลือก Off เพื่อใช้หน้าจอเดิมของกล้อง",
            "เขียนลงการ์ดตามปกติ ภาพใหม่จะขึ้นตั้งแต่เปิดกล้องครั้งถัดไป ถ้าใช้ GRKU.zip ให้ดาวน์โหลด `GOODBYE.JPG` มาด้วย แล้วคัดลอกไปไว้ในโฟลเดอร์ `GRKU` ของการ์ด"
          ]
        },
        {
          "kind": "p",
          "text": "ลายสำเร็จรูปมีทั้งพระอาทิตย์ตก พระจันทร์ง่วงนอน แมวกำลังงีบ ม้วนฟิล์ม และใบเสร็จ พร้อมใส่ข้อความของคุณเองได้ ถ้าใช้รูปของคุณเอง ระบบจะครอบตัดเป็นสัดส่วน 3:2"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "กล้องไม่ยอมปิดเครื่องใช่ไหม",
          "text": "ไฟล์ `GOODBYE.JPG` ที่เสียอาจทำให้กล้องไม่ยอมปิดเครื่อง ให้ถอดแบตเตอรี่ออก ลบ `GRKU/GOODBYE.JPG` ออกจากการ์ดบนคอมพิวเตอร์ แล้วเขียนภาพใหม่อีกครั้งจากหน้าเว็บ"
        },
        {
          "kind": "h2",
          "id": "studio",
          "text": "GRKU Studio"
        },
        {
          "kind": "p",
          "text": "GRKU Studio เป็นโปรแกรมแต่งภาพแบบเลเยอร์ มีทั้งพื้นหลัง รูปของคุณ โลโก้ ไฟล์ PNG ไดคัท ข้อความแปดแบบอักษร สติกเกอร์ กรอบรูป และเทมเพลตสำหรับวันสงกรานต์ วันลอยกระทง ปีใหม่ และวันวาเลนไทน์ เพิ่มรูปได้จากแถบเครื่องมือ ลากไฟล์มาวาง หรือวางรูปที่คัดลอกไว้"
        },
        {
          "kind": "p",
          "text": "GRKU Studio และดีไซน์บางส่วนใช้ได้ฟรี ซื้อ [GRKU Plus](doc:plus) ครั้งเดียวก็ปลดล็อกทั้งหมด"
        },
        {
          "kind": "h2",
          "id": "camera",
          "text": "บนกล้อง"
        },
        {
          "kind": "p",
          "text": "ใน [GRKU Settings](doc:settings#shutdown) **Custom Picture** เปิดหรือปิดรูป และ **Show Text** ซ่อนตัวนับจำนวนภาพที่กล้องวาดทับลงไป"
        }
      ]
    },
    "develop": {
      "title": "หน้า Develop",
      "sources": [
        "web/src/components/Develop.tsx",
        "web/src/develop/gating.ts",
        "web/src/develop/install.ts",
        "CHANGELOG.md 1.10.1"
      ],
      "seo": "ฟิลเตอร์ฟิล์มออนไลน์ฟรีสำหรับรูปของคุณ (หน้า Develop)",
      "lead": "แต่งรูปที่มีอยู่ให้เป็นฟิล์มลุคและเอฟเฟกต์ของ GRKU ได้ในเบราว์เซอร์",
      "keywords": "แต่งรูป ล้างรูป เบราว์เซอร์ ฟิลเตอร์ ออนไลน์ ทดลอง ดูตัวอย่าง ดาวน์โหลด ไม่มีกล้อง มือถือ develop edit photo browser online filter try preview download no camera phone",
      "blocks": [
        {
          "kind": "p",
          "text": "[หน้า Develop](site:develop) แสดงฟิล์มลุคของ GRKU บนรูปของคุณ พร้อมเอฟเฟกต์จากโค้ดโมดูลของกล้อง ไม่ต้องใช้กล้อง และรูปไม่ถูกส่งออกจากเครื่องของคุณ"
        },
        {
          "kind": "steps",
          "items": [
            "เปิด [หน้า Develop](site:develop) แล้วเพิ่มรูป",
            "เลือกฟิล์มลุค แล้วเพิ่มเอฟเฟกต์ Glow, Light Leak, Diffusion, Film Softness, Grain, Date Imprint และ Border",
            "บันทึกรูป หรือกด **ติดตั้งลงในกล้อง GR** เพื่อเปิดหน้าติดตั้งพร้อมฟิล์มลุคและโมดูลที่เลือกไว้ แล้วไปตั้งความแรงของแต่ละเอฟเฟกต์บนกล้อง"
          ]
        },
        {
          "kind": "p",
          "text": "แบบฟรีบันทึกงานที่ใช้ฟิล์มลุคของกล้อง ฟิล์มลุคเริ่มต้น หรือไม่ใช้ฟิล์มลุคได้สูงสุด 2048 px แบบมีเครดิต GRKU เล็กๆ ครั้งละ 5 รูป ซื้อ GRKU Plus ครั้งเดียวจะบันทึกทุกฟิล์มลุคได้เต็มขนาดแบบไม่มีเครดิต ครั้งละ 50 รูป"
        }
      ]
    },
    "assistant": {
      "title": "ผู้ช่วย AI",
      "sources": [
        "web/src/chat/strings.ts",
        "web/src/components/ChatPanel.tsx",
        "services/plus/src/chat/index.ts"
      ],
      "seo": "ผู้ช่วย AI ของ GRKU ถามเรื่องกล้อง GR และฟิล์มลุคได้เลย",
      "lead": "ถามผู้ช่วย GRKU เรื่องการติดตั้ง กล้องของคุณ หรือฟิล์มลุคที่เหมาะกับรูปได้",
      "keywords": "ผู้ช่วย ai แชท ถามคำถาม บอท มาสคอต ความจำ ai assistant chat ask question help bot mascot memory",
      "blocks": [
        {
          "kind": "p",
          "text": "ปุ่มกลมมุมขวาล่างของหน้าต่างๆ บนเว็บเปิดผู้ช่วย GRKU ได้ ระบบจะตอบจากข้อมูลในเว็บและคู่มือนี้ เป็นภาษาของคุณ พร้อมลิงก์ไปยังหน้าที่เกี่ยวข้อง"
        },
        {
          "kind": "h2",
          "id": "ask",
          "text": "คำถามที่น่าถาม"
        },
        {
          "kind": "list",
          "items": [
            "\"ติดตั้ง GRKU บน GR IIIx ยังไง\"",
            "\"กล้องขึ้นหน้าอัปเดตเฟิร์มแวร์ตอนที่กด MENU ค้างไว้\"",
            "\"แนะนำฟิล์มลุคโทนอุ่นสำหรับถ่ายคน\"",
            "\"Halation ทำอะไร\""
          ]
        },
        {
          "kind": "p",
          "text": "ในแต่ละหน้าของคู่มือนี้ กด **Ask AI about this page** เพื่อเปิดผู้ช่วยที่รู้ว่าคุณดูหน้านี้อยู่"
        },
        {
          "kind": "h2",
          "id": "limits",
          "text": "เรื่องน่ารู้"
        },
        {
          "kind": "list",
          "items": [
            "มีจำนวนข้อความต่อวัน ผู้ที่มี GRKU Plus จะคุยได้ลึกขึ้นและได้คำตอบละเอียดขึ้น",
            "ถ้าเปิดความจำของระบบไว้ เบราว์เซอร์จะเก็บข้อมูลกล้อง เวอร์ชันเฟิร์มแวร์ และฟิล์มลุคที่คุณชอบ แล้วส่งไปพร้อมคำถามของคุณ",
            "ข้อความของคุณจะถูกส่งไปยังบริการ AI เพื่อตอบกลับ อย่าพิมพ์ข้อมูลส่วนตัว",
            "AI อาจผิดพลาดได้ เรื่องเกี่ยวกับเฟิร์มแวร์กล้องให้ทำตามคู่มือนี้และ RICOH"
          ]
        }
      ]
    },
    "not-showing": {
      "title": "GRKU ไม่ขึ้น",
      "sources": [
        "docs/diagnostics.md",
        "resources/INSTALLATION-GR4.md (Troubleshooting)",
        "web/src/strings/en.ts (faq adj)"
      ],
      "seo": "GRKU ไม่ขึ้นบนกล้อง: วิธีแก้ไข",
      "lead": "ตรวจเช็กตามลำดับทีละข้อ",
      "keywords": "ไม่ขึ้น ไม่ทำงาน หาย adj no grku error install.err report boot.txt 47 48 firmware mode set เฟิร์มแวร์ โหมดเซ็ต สคริปต์",
      "blocks": [
        {
          "kind": "flow",
          "steps": [
            {
              "see": "ไม่มี **GRKU** ขึ้นที่ด้านบนของหน้าจอหลังเปิดเครื่อง",
              "then": "ครั้งแรกอาจต้องรอประมาณหนึ่งนาที จากนั้นลองทำตามขั้นตอนด้านล่าง"
            },
            {
              "see": "กล้องจะแสดงหน้าจออัปเดตเฟิร์มแวร์เมื่อคุณกดปุ่ม {{MENU}} ค้างไว้",
              "then": "เลือก **Cancel** แล้วลบไฟล์ `fwdc….bin` ออกจากการ์ด"
            },
            {
              "see": "ไม่มีหน้าจอ **Mode Set Command** ขึ้นเมื่อคุณกด {{MENU}} ค้างไว้",
              "then": "ให้ทำ [การเปิดใช้งานครั้งแรก](doc:install#first-start) อีกครั้ง"
            },
            {
              "see": "กล้องค้างตอนเปิดเครื่อง",
              "then": "ดู [กล้องค้างตอนเปิดเครื่อง](doc:stuck)"
            }
          ]
        },
        {
          "kind": "h2",
          "id": "checks",
          "text": "ตรวจเช็กตามลำดับ"
        },
        {
          "kind": "steps",
          "items": [
            "**รอ** GRKU โหลดประมาณ 8 ถึง 10 วินาทีหลังเปิดเครื่อง การเปิดครั้งแรกหลังติดตั้งอาจใช้เวลาถึงราวหนึ่งนาที อย่าเพิ่งปิดกล้องระหว่างนี้ รูปที่ถ่ายก่อนหน้านั้นจะยังไม่มี GRKU",
            "**กล้องและเฟิร์มแวร์** เปิด MENU แล้วดูเวอร์ชันเฟิร์มแวร์ ต้องอยู่ในรายการ [กล้องที่รองรับ](doc:cameras) ดูเพิ่มที่ [วิธีดูเวอร์ชันเฟิร์มแวร์](doc:firmware)",
            "**สคริปต์ SD** ตอนเปิดเครื่องครั้งแรกได้กด {{MENU}} ค้างไว้ แล้วเห็น **Mode Set Command** กับ **Complete** ไหม ถ้าไม่เห็น ให้ทำ[การเปิดใช้งานครั้งแรก](doc:install#first-start)ใหม่อีกครั้ง",
            "**ไฟล์ที่ชั้นบนสุดของการ์ด** การ์ดต้องมีโฟลเดอร์ `SCRIPT` อยู่ตรงชั้นบนสุดของการ์ด ไม่ใช่ใน `DCIM` หรือโฟลเดอร์อื่น",
            "**เครื่องอ่านการ์ด** เขียนข้อมูลลงการ์ดผ่านเครื่องอ่านการ์ด อย่าเขียนผ่านสาย USB ของกล้อง",
            "**Enable GRKU** ใน MENU ที่ Customize (C) แล้ว GRKU ให้ตรวจว่า **Enable GRKU** เป็น On และ **Enable at Start** ใน GRKU Settings ไม่ได้ตั้งเป็น Off"
          ]
        },
        {
          "kind": "h2",
          "id": "errors",
          "text": "หมายเลขข้อผิดพลาด"
        },
        {
          "kind": "p",
          "text": "ถ้า GRKU หยุดทำงาน การ์ดจะมีไฟล์ `SCRIPT/GRKU/INSTALL.ERR` บรรทัดแรกจะเป็นตัวเลข พอเริ่มทำงานได้แล้ว ไฟล์นี้จะหายไปและมี `SCRIPT/GRKU/INSTALL.OK` แทน"
        },
        {
          "kind": "table",
          "head": [
            "ตัวเลข",
            "ความหมาย",
            "สิ่งที่ต้องทำ"
          ],
          "rows": [
            [
              "47, 48",
              "GRKU ไม่รองรับเฟิร์มแวร์รุ่นนี้",
              "ตรวจดูว่ารองรับเฟิร์มแวร์นี้ไหม แล้วอัปเดต GRKU ถ้ายังเป็นอยู่ ให้ส่งรายงาน"
            ],
            [
              "60, 61, 62",
              "เริ่มทำงานไม่เสร็จ",
              "เขียนการ์ดซ้ำอีกครั้ง ถ้ายังเป็นอยู่ ให้ส่งรายงาน"
            ],
            [
              "36, 37",
              "GRKU เขียนหรืออ่านแผนการทำงานบนการ์ดไม่ได้",
              "เขียนการ์ดซ้ำอีกครั้ง"
            ],
            [
              "30, 31",
              "GRKU อ่านฟิล์มลุคไม่ได้",
              "เขียนการ์ดซ้ำอีกครั้ง ถ้ายังเป็นอยู่ ให้ลองเปลี่ยนการ์ดใบอื่น"
            ],
            [
              "23, 24",
              "การตั้งค่าบนกล้องไม่ทำงาน",
              "ปิดกล้องแล้วเปิดใหม่ ถ้ายังเป็นอยู่ ให้ส่งรายงาน"
            ],
            [
              "อื่นๆ",
              "GRKU หยุดทำงานด้วยสาเหตุอื่น",
              "ส่งรายงานพร้อมตัวเลข"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "ตัวเลขหลังชื่อโมดูล"
        },
        {
          "kind": "p",
          "text": "โมดูลที่โหลดไม่สำเร็จจะแสดงตัวเลขหลังชื่อใน MENU และมีรายการอยู่ใน `GRKU/REPORT.TXT` การเริ่มทำงานของ GRKU ยังใช้งานได้"
        },
        {
          "kind": "table",
          "head": [
            "ตัวเลข",
            "ความหมาย",
            "สิ่งที่ต้องทำ"
          ],
          "rows": [
            [
              "50 ถึง 55, 57",
              "โมดูลโหลดไม่สำเร็จ",
              "อัปเดต GRKU หากยังไม่หาย ให้ส่งรายงาน"
            ],
            [
              "56",
              "โมดูลสำหรับรูปสีไม่มีใน GR IV Monochrome ซึ่งเป็นเรื่องปกติ",
              "ไม่ต้องทำอะไร"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "files",
          "text": "ไฟล์รายงานบอกอะไรบ้าง"
        },
        {
          "kind": "list",
          "items": [
            "`GRKU/REPORT.TXT`: เวอร์ชัน GRKU และบิลด์เฟิร์มแวร์ สถานะของแต่ละโมดูลและฟิล์มลุค (โหลดแล้ว หยุดทำงาน หรือเป็นตัวเลข) ตามด้วยรายละเอียดสำหรับฝ่ายซัพพอร์ต และเขียนใหม่เมื่อมีการเปลี่ยนแปลง",
            "`GRKU/BOOT.TXT`: รายการแต่ละครั้งที่เริ่มทำงาน พร้อมเวลาของแต่ละขั้นตอน เก็บไว้ราว 20 ครั้งล่าสุด",
            "`SCRIPT/GRKU/INSTALL.ERR`: มีเฉพาะตอนที่การเริ่มทำงานหยุดลง พร้อมตัวเลขของสาเหตุนั้น"
          ]
        },
        {
          "kind": "h2",
          "id": "report",
          "text": "ส่งรายงาน"
        },
        {
          "kind": "p",
          "text": "ส่งอีเมลไปที่ [support@grku.app](support) พร้อมแจ้งรุ่นกล้องและเวอร์ชันเฟิร์มแวร์ แล้วแนบไฟล์เหล่านี้จากการ์ดไปด้วย ไฟล์เหล่านี้ไม่มีรูป แต่อาจมีชื่อสูตรสีและฟิล์มลุคที่นำเข้าไว้ เปิดดูก่อนได้ถ้าต้องการ"
        },
        {
          "kind": "files",
          "items": [
            [
              "SCRIPT/GRKU/INSTALL.ERR",
              "ทำไมตอนเปิดเครื่องถึงหยุดกลางคัน"
            ],
            [
              "GRKU/REPORT.TXT",
              "รุ่นกล้อง เฟิร์มแวร์ และเวอร์ชัน GRKU"
            ],
            [
              "GRKU/BOOT.TXT",
              "เกิดอะไรขึ้นตอนเปิดเครื่อง"
            ]
          ]
        }
      ]
    },
    "stuck": {
      "title": "กล้องค้างตอนเปิดเครื่อง",
      "sources": [
        "resources/RECOVERY.md"
      ],
      "seo": "RICOH GR ค้างตอนเปิดเครื่อง วิธีแก้ให้กลับมาใช้ได้",
      "lead": "GRKU เปลี่ยนการทำงานของกล้องเฉพาะตอนที่เปิดอยู่ ลองเปิดเครื่องโดยไม่ใส่การ์ด",
      "keywords": "ค้าง แช่แข็ง เปิดไม่ติด จอดำ กู้คืน รีเซ็ต แบต stuck freeze hang frozen not start black screen brick recover recovery reset battery",
      "blocks": [
        {
          "kind": "note",
          "tone": "warning",
          "title": "ก่อนเริ่มทำ",
          "text": "อย่าดันหรือดึงกระบอกเลนส์ ห้ามถอดไฟออกระหว่างอัปเดตเฟิร์มแวร์แท้ของกล้อง"
        },
        {
          "kind": "flow",
          "steps": [
            {
              "see": "กล้องค้างระหว่างกำลังเปิด",
              "then": "ถอดแบตเตอรี่และการ์ดออก แล้วลองเปิดเครื่องโดยไม่มีการ์ด"
            },
            {
              "see": "ยังเปิดไม่ติดแม้จะเอาการ์ดออกแล้ว",
              "then": "เปิดในโหมดดูภาพ (Playback) แล้วรีเซ็ตการตั้งค่ากล้อง"
            },
            {
              "see": "เปิดติดแต่ปิดไม่ได้",
              "then": "ดู [ภาพตอนปิดเครื่อง](doc:shutdown)"
            }
          ]
        },
        {
          "kind": "h2",
          "id": "without-card",
          "text": "เปิดเครื่องโดยไม่ใส่การ์ด"
        },
        {
          "kind": "steps",
          "items": [
            "ลองปิดเครื่อง",
            "ถ้าไม่ตอบสนอง ให้ถอดแบตเตอรี่ออก แบตอาจร้อนได้",
            "ถอดการ์ด",
            "ใส่แบตที่ชาร์จไฟแล้ว และเปิดเครื่องโดยไม่ใส่การ์ด"
          ]
        },
        {
          "kind": "h2",
          "id": "safe-mode",
          "text": "โหมดปลอดภัย: เริ่ม GRKU โดยไม่ใช้โมดูล"
        },
        {
          "kind": "p",
          "text": "ถ้ากล้องเปิดติดเมื่อไม่มีการ์ด แต่ดับอีกเมื่อใส่การ์ด แสดงว่าเกิดจากโมดูล โหมดปลอดภัยจะเริ่ม GRKU โดยไม่โหลดโมดูล ทำให้คุณปิดโมดูลนั้นได้"
        },
        {
          "kind": "steps",
          "items": [
            "เสียบการ์ดเข้ากับเครื่องอ่านการ์ดบนคอมพิวเตอร์",
            "สร้างไฟล์ว่างชื่อ `SAFE.TXT` (หรือ `SAFE`) ในโฟลเดอร์ `GRKU` บนการ์ด",
            "ใส่การ์ดกลับเข้ากล้องแล้วเปิดเครื่อง จะไม่มีการโหลดโมดูล และ **About GRKU** ใน MENU จะแสดงว่า **Safe mode**",
            "ใน MENU, Customize (C), GRKU ให้ปิดโมดูลที่คุณเพิ่มหรือแก้ไขล่าสุด",
            "ปิดกล้อง ลบไฟล์ `SAFE` ออกจากการ์ด แล้วเปิดกล้องอีกครั้ง"
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "โหมดปลอดภัย",
          "text": "โหมดปลอดภัยจะไม่เริ่มเองโดยอัตโนมัติ ตราบใดที่มีไฟล์ `SAFE` อยู่ในการ์ด ภาพถ่ายจะไม่ได้รับเอฟเฟกต์จาก GRKU"
        },
        {
          "kind": "h2",
          "id": "still",
          "text": "ถ้ายังเปิดไม่ติด"
        },
        {
          "kind": "steps",
          "items": [
            "ตอนไม่ใส่การ์ด ให้กดปุ่มดูรูปค้างไว้เพื่อเปิดกล้องในโหมดดูรูป",
            "ถ้าเมนูเปิดขึ้นมา ให้รีเซ็ตการตั้งค่ากล้อง การรีเซ็ตจะลบค่าที่คุณตั้งไว้เอง",
            "ลองเปิดเครื่องอีกครั้งโดยไม่ใส่การ์ด"
          ]
        },
        {
          "kind": "p",
          "text": "ถ้ากล้องเปิดติดแต่ปิดไม่ลง อาจเกิดจากรูปตอนปิดเครื่องเสียหาย ดูที่ [รูปตอนปิดเครื่อง](doc:shutdown) ถ้ายังเปิดไม่ติด ให้เลิกใช้ GRKU แล้วติดต่อศูนย์ RICOH [คู่มือกู้คืน](site:recovery) มีครบทุกขั้นตอน"
        }
      ]
    },
    "faq": {
      "title": "คำถามที่พบบ่อย",
      "sources": [
        "web/src/strings/en.ts (faq)",
        "runtime/mode_dial.h",
        "resources/INSTALLATION-GR4.md"
      ],
      "seo": "คำถามและคำตอบของ GRKU",
      "lead": "คำตอบสั้นๆ สำหรับเรื่องที่คนถามบ่อย",
      "keywords": "faq คำถาม ทำไม ภาพแรก ไม่มีฟิล์มลุค กล่อง เรียกคืน ฟอร์แมต โทรศัพท์ นำเข้า gr world ปลอดภัย ประกัน",
      "blocks": [
        {
          "kind": "h2",
          "id": "first-photos",
          "text": "ทำไมภาพแรกๆ ของฉันถึงไม่มีฟิล์มลุค"
        },
        {
          "kind": "p",
          "text": "จนกว่า GRKU จะโหลดเสร็จ ซึ่งใช้เวลาประมาณ 8 ถึง 10 วินาทีหลังเปิดเครื่อง (หรือนานสุดประมาณ 1 นาทีในครั้งแรกหลังติดตั้ง) กล้องจะใช้ค่าของตัวเอง รอจนคำว่า **GRKU** ขึ้นที่ด้านบนของหน้าจอ"
        },
        {
          "kind": "h2",
          "id": "dng",
          "text": "ทำไม DNG ของฉันถึงเป็น 3:2 หรือไม่มีฟิล์มลุค"
        },
        {
          "kind": "p",
          "text": "GRKU เปลี่ยนไฟล์ JPEG ส่วน DNG เก็บข้อมูลดิบไว้ ดูที่ [การล้าง RAW ในกล้อง](doc:raw)"
        },
        {
          "kind": "h2",
          "id": "user-mode",
          "text": "ทำไมโหมดผู้ใช้ถึงไม่ดึงฟิล์มลุคของฉันกลับมา"
        },
        {
          "kind": "p",
          "text": "โหมดผู้ใช้ที่บันทึกจากเมนูของกล้อง RICOH ไม่เก็บค่าของ GRKU ให้ใช้ [Save Current Settings](doc:mode-dial) หรือ [สูตรสี](doc:recipes)"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "GRKU เปลี่ยนเฟิร์มแวร์กล้องไหม"
        },
        {
          "kind": "p",
          "text": "ไม่ GRKU โหลดจากการ์ดตอนเปิดกล้อง สคริปต์ SD ซึ่งเป็นค่าของกล้อง จะเปิดอยู่จนกว่าคุณจะ [ปิดมัน](doc:update#scripts-off) **Save Current Settings** ก็บันทึกลงโหมดผู้ใช้ของกล้องด้วย"
        },
        {
          "kind": "h2",
          "id": "menu-again",
          "text": "ต้องกด MENU ค้างอีกไหมหลังอัปเดตหรือเปลี่ยนการ์ด"
        },
        {
          "kind": "p",
          "text": "ไม่ต้อง คุณกด {{MENU}} ค้างแค่ครั้งแรก"
        },
        {
          "kind": "h2",
          "id": "version",
          "text": "การ์ดของฉันมี GRKU เวอร์ชันไหน"
        },
        {
          "kind": "p",
          "text": "เปิด MENU **About GRKU** อยู่ท้ายส่วน GRKU ในแท็บ Customize"
        },
        {
          "kind": "h2",
          "id": "phone",
          "text": "ทำไมโทรศัพท์ถึงนำเข้ารูปไม่ได้"
        },
        {
          "kind": "p",
          "text": "การติดตั้ง GRKU ไม่เปลี่ยนรูปในโฟลเดอร์ `DCIM` อัปเดต GR WORLD เป็นเวอร์ชันล่าสุด ถ้ายังไม่ได้ ให้ [ส่งอีเมลหาฝ่ายช่วยเหลือ](support)"
        },
        {
          "kind": "h2",
          "id": "lightroom",
          "text": "ใช้ฟิล์มลุคเหล่านี้ใน Lightroom ได้ไหม"
        },
        {
          "kind": "p",
          "text": "ไม่ได้โดยตรง GRKU ไม่ได้ทำพรีเซ็ตของ Lightroom ลองใช้ฟิล์มลุคกับรูปของคุณได้ที่ [หน้าล้างรูป](doc:develop)"
        }
      ]
    },
    "cameras": {
      "title": "กล้องที่รองรับ",
      "sources": [
        "web/src/cameras.ts",
        "web/src/generated/cameras.ts",
        "web/src/package.ts"
      ],
      "seo": "GRKU รองรับกล้อง RICOH GR และเฟิร์มแวร์รุ่นไหนบ้าง",
      "lead": "GRKU ทำงานกับกล้องและเฟิร์มแวร์รุ่นเหล่านี้ โดยใช้เฟิร์มแวร์แท้ของ RICOH",
      "keywords": "กล้องที่รองรับ เฟิร์มแวร์ เวอร์ชัน gr iii iiix iv hdf monochrome modeset dump cameras supported firmware version gr iii iiix iv hdf monochrome modeset dump",
      "blocks": [
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GRKU เคยใช้งานบน GR IV เฟิร์มแวร์ 1.11 แล้ว ตัวติดตั้งสำหรับเวอร์ชันและรุ่นอื่นสร้างจากโค้ดเดียวกันและตรวจกับไฟล์เฟิร์มแวร์ของ RICOH แล้ว แต่ยังไม่เคยใช้งานบนกล้องจริง"
        },
        {
          "kind": "p",
          "text": "เปิด MENU บนกล้องเพื่อดูเวอร์ชันเฟิร์มแวร์ ดูที่ [วิธีเช็กเวอร์ชันเฟิร์มแวร์](doc:firmware) กล้อง GR รุ่นก่อนหน้านี้และกล้องยี่ห้ออื่นไม่รองรับ ส่วน GR IV Monochrome มีทุกส่วนยกเว้น Film Look"
        },
        {
          "kind": "p",
          "text": "กล้อง GR IV 30th Anniversary Edition มาพร้อมเฟิร์มแวร์ 1.20 รุ่นเฉพาะจากโรงงาน ซึ่ง grku.app ยังไม่มีให้ดาวน์โหลด ให้อัปเดตกล้องรุ่นนี้เป็น 1.21 จาก RICOH ก่อน"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "การอัปเดตเฟิร์มแวร์กล้อง"
        },
        {
          "kind": "p",
          "text": "อัปเดตเฟิร์มแวร์กล้องจากหน้าสนับสนุนอย่างเป็นทางการของ RICOH เท่านั้น และเช็กก่อนว่า GRKU รองรับเวอร์ชันใหม่นี้แล้ว GRKU ไม่มีการอัปเดตเฟิร์มแวร์ให้"
        },
        {
          "kind": "h2",
          "id": "dump",
          "text": "เฟิร์มแวร์ที่ GRKU ยังไม่รู้จัก"
        },
        {
          "kind": "p",
          "text": "[คู่มือดึงไฟล์เฟิร์มแวร์](site:firmware-dump) อธิบายวิธีอ่านเฟิร์มแวร์จากกล้องส่งให้นักพัฒนา เพื่อให้ GRKU รองรับรุ่นนั้นได้"
        }
      ]
    }
  }
};
