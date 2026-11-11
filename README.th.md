# GRKU.

**GR ของคุณ ในแบบที่ชอบ** — ฟิล์มลุคสำหรับ RICOH GR III, GR IIIx และ GR IV จากการ์ด SD โดยไม่มีการแฟลชข้อมูลใดๆ: กล้องจะรันสคริปต์จากการ์ด และเมื่อไม่มีการ์ด กล้องก็คือตัวเดิมที่ Ricoh ส่งมอบมา

ไทย | [English](README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

[![Tests](https://github.com/botnick/GRKU/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKU/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![grku.app](https://img.shields.io/badge/site-grku.app-d94135)](https://grku.app)

GRKU เป็นโปรเจกต์อิสระที่สร้างขึ้นโดย [BOTNICK](https://github.com/botnick) สำหรับผู้ใช้ GR ชาวไทยเป็นกลุ่มแรกและทุกคนต่อไป โปรเจกต์นี้เริ่มต้นจากโค้ดของ [GRKit](https://github.com/ahonn/GRKit) โดย ahonn ซึ่งเป็นผู้ค้นพบวิธีรันโค้ดบน GR จากการ์ด SD และตั้งแต่นั้นมาก็ได้ถูกสร้างขึ้นใหม่ทีละส่วน: คลังฟิล์ม 145 ลุคพร้อมไอคอนกล่องฟิล์มสมจริง, สูตรภาพ, โมดูลที่มากขึ้น, การเริ่มต้นแบบรวดเดียว, เว็บไซต์ที่เขียนลงการ์ดได้และมีลุคเพิ่มเติมให้เลือกซื้อ, เอกลักษณ์ภาษาไทย และไปป์ไลน์การปล่อยรุ่นของตัวเอง ส่วน [ที่มา](#origins) ได้ระบุไว้ว่าสิ่งใดมาจาก GRKit และ GRKU นำมาพัฒนาต่ออย่างไร

<p>
  <img src="resources/images/grku-root.jpg" alt="หน้า GRKU ในเมนู ADJ" width="49%">
  <img src="resources/images/grku-menu.jpg" alt="ส่วนของ GRKU ในแท็บ Customize ของ MENU" width="49%">
</p>

ภาพถ่ายบนหน้าจอโดย: [Mobnoboka](https://commons.wikimedia.org/wiki/File:Oguchi_Joushi_Kouen_1.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

## ฟีเจอร์

กดปุ่ม ADJ ขณะถ่ายภาพแล้วเลือกรายการที่ 6 คือ GRKU การทำงานทั้งหมดของ GRKU จะรวมอยู่ในนั้น และในส่วนของ GRKU ใน MENU ปุ่ม ADJ จะเปิดกลับมาที่ GRKU อีกครั้งตรงแถวเดิมที่คุณค้างไว้ แม้หลังจากปิดกล้องไปแล้วก็ตาม

- **Film Look**: 145 ลุคจากฟิล์มจริง ใส่ในการ์ดได้ครั้งละ 40 ลุค ได้แก่ Kodak, Fujifilm, Ilford, CineStill, Lomography, Polaroid, Agfa, Harman และ Rollei รวมทั้ง Positive GRII ซึ่งเป็นลุคเฉพาะของ GRKU ตามแบบฟิล์ม Positive ของ GR II และฟิล์มซิมูเลชัน 10 แบบของกล้อง FUJIFILM ตั้งแต่ Provia และ Classic Chrome ไปจนถึง Acros ซึ่งเปิดให้ใช้ได้ฟรี แต่ละลุคมีไอคอนกล่องฟิล์มตามสีของกล่องจริง กดปุ่ม Fn เพื่อปรับแต่งลุค นำเข้าไฟล์ LUT ของตัวเองได้ที่เว็บไซต์
- **Recipes**: บันทึกโทนภาพทั้งหมดของกล้องไว้ในชื่อเดียว หรือดึงสูตรยอดนิยมมาจากเว็บไซต์ จากนั้นสลับเปลี่ยน Film Look หรือ Image Control, เกรน, แสงฟุ้ง (Glow), ไวต์บาลานซ์, การชดเชยต่างๆ และค่าแสงได้ในขั้นตอนเดียว พร้อมฟังก์ชัน Undo ปุ่มหมุนเลือกโหมด U1, U2 และ U3 สามารถบันทึกสูตรไว้ได้
- **Framing**: XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6 และ 1:1 เลือกได้ทั้งแบบครอปภาพ JPEG หรือแสดงเฉพาะเส้นกรอบ **Crop**: 35, 40, 50, 70 หรือ 90 มม. พร้อมพรีวิวในไลฟ์วิว
- **Guides**: เส้นจุดตัดเก้าช่อง จุดกึ่งกลาง สัดส่วนทองคำ เส้นทแยงมุม วงก้นหอยทองคำ สมมาตรไดนามิก
- **Date Imprint**: พิมพ์วันที่ลงบนภาพในสไตล์คลาสสิก ดอตเมทริกซ์แบบ GR1s หรือสไตล์ GR II
- **Glow**: Bloom รอบดวงไฟและส่วนไฮไลต์ Halation ขอบแสงสีส้มแดงตามโทนสีของฟิล์มภาพยนตร์
- **Light Leak**: ขอบมืด ฝุ่นและเส้นขน แสงรั่ว รอยขีดข่วน หรือเลือกจากพรีเซ็ต Faded, Dusty, Leaky และ Expired แตกต่างกันไปในแต่ละช็อต
- **Diffusion**: ฟิลเตอร์ Black Pro-Mist ที่ระดับ 1/8, 1/4 หรือ 1/2 ม่านแสง Black Mist ทับส่วนเงามืด และแสงแฟลร์แนวนอนแบบเลนส์ Anamorphic จากจุดกำเนิดแสง
- **Grain**: ปรับความเข้มได้ 4 ระดับ ปรับขนาดได้ 4 ขนาด
- **Border**: ใส่ขอบขาวหรือขอบดำรอบรูป เลือกความหนาได้ 3% หรือ 6% ของความกว้าง โดยระบบจะย่อรูปให้พอดีข้างใน ไม่โดนตัดขอบ และวันที่ยังคงอยู่ด้านในเหมือนรูปถ่ายอัดพิมพ์
- **Enable at Start**: กำหนดให้ GRKU เปิด ปิด หรือคงสถานะเดิมตามที่ตั้งทิ้งไว้ ทุกครั้งที่เปิดกล้อง
- **Feet**: แสดงระยะโฟกัส Snap เป็นหน่วยฟุต เมื่อมีไฟล์ `GRKU/FEET.TXT` อยู่ในการ์ด

GRKU จะแสดงขึ้นมาหลังจากเปิดกล้องประมาณ 9 วินาที (และจะนานขึ้นในการเปิดเครื่องครั้งแรกหลังการติดตั้ง) ระหว่างนั้นกล้องจะทำงานตามปกติของตัวกล้อง ทุกการตั้งค่าของคุณจะถูกเก็บไว้ในโฟลเดอร์ `GRKU` บนการ์ด

## กล้องที่รองรับ

| กล้อง | ทดสอบกับกล้องจริงแล้ว | รองรับ |
| --- | --- | --- |
| GR III, GR III HDF | — | 2.10, 2.20, 2.21 |
| GR IIIx, GR IIIx HDF | — | 1.60, 1.70, 1.71 |
| GR IV, GR IV HDF | 1.11 | 1.11, 1.20, 1.21 |
| GR IV Monochrome | — | 1.00, 1.10, 1.11 |

การเปลี่ยนแปลงเฉพาะของ GRKU ได้ทดสอบบน GR IV กับเฟิร์มแวร์ 1.11 แล้ว แพ็กเกจสำหรับ GR III และ GR IIIx สร้างขึ้นจากโค้ดชุดเดียวกันและผ่านการทดสอบของ GRKit แต่ยังไม่เคยมีใครนำ GRKU ไปรันบนกล้องเหล่านั้นจริง หากคุณได้ลองใช้ โปรดแจ้งให้เราทราบใน [issue](https://github.com/botnick/GRKU/issues) ไม่ว่าจะใช้งานได้หรือไม่ก็ตาม ส่วนบิลด์สำหรับเฟิร์มแวร์ที่ Ricoh ปล่อยเมื่อวันที่ 10 พฤศจิกายน 2026 (GR III 2.21, GR IIIx 1.71, GR IV 1.21, GR IV Monochrome 1.11) ได้รับการตรวจสอบเทียบกับไฟล์เฟิร์มแวร์ของ Ricoh แล้ว แต่ยังไม่ได้นำไปรันบนกล้องจริง

> [!WARNING]
> GRKU ยังอยู่ในขั้นทดลอง ผู้ใช้ต้องรับความเสี่ยงด้วยตัวเอง
> การติดตั้งจะเปิดตั้งค่าสคริปต์การ์ด SD ของกล้อง ซึ่งจะเปิดค้างไว้จนกว่าคุณจะสั่งปิด หาก GRKU ทำงานผิดพลาด กล้องอาจค้างตอนเปิดเครื่องได้ ควรอ่าน[คู่มือกู้คืนระบบ](resources/RECOVERY.md)ก่อน

## การติดตั้ง

ไปที่ [grku.app](https://grku.app) เลือกรุ่นกล้อง โมดูล และฟิล์มลุคของคุณ จากนั้นเลือกทำอย่างใดอย่างหนึ่งต่อไปนี้

- **เขียนลงการ์ด SD** ผ่าน Chrome หรือ Edge (นอกจากนี้เว็บไซต์ยังสามารถอัปเดต เพิ่มหรือลบลุค และถอนการติดตั้งได้ด้วย) หรือ
- **ดาวน์โหลดไฟล์ ZIP** (`GRKU-gr3.zip`, `GRKU-gr3x.zip` หรือ `GRKU-gr4.zip`) แล้วทำตามคู่มือ PDF ที่อยู่ในไฟล์ ([GR III และ GR IIIx](resources/INSTALLATION.md), [GR IV](resources/INSTALLATION-GR4.md))

เฉพาะการใช้งานครั้งแรก ให้กดปุ่ม MENU ค้างไว้ขณะเปิดกล้อง หากต้องการอัปเดตจากไฟล์ ZIP ให้เขียนทับโฟลเดอร์ `SCRIPT` บนการ์ด การตั้งค่าของคุณจะยังคงอยู่ใน `GRKU` การฟอร์แมตการ์ดจะทำให้ GRKU ถูกลบออก

หากเปลี่ยนมาจาก GRKit (โปรเจกต์ที่ GRKU พัฒนาต่อยอดขึ้นมา): เว็บไซต์จะย้ายการตั้งค่าและลุคต่างๆ จากโฟลเดอร์ `GRKIT` ไปยัง `GRKU` แต่หากคุณคัดลอกไฟล์ด้วยตัวเอง ให้เปลี่ยนชื่อโฟลเดอร์ `GRKIT` ที่รูทของการ์ดเป็น `GRKU` ก่อนเปิดเครื่องใช้งานครั้งแรก หรือลบโฟลเดอร์นั้นทิ้ง

หาก GRKU ไม่แสดงขึ้นมา ให้ส่งไฟล์ `GRKU/REPORT.TXT`, `GRKU/BOOT.TXT` และ `SCRIPT/GRKU/INSTALL.ERR` (ถ้ามี) เข้ามาใน [issue](https://github.com/botnick/GRKU/issues/new) [ความหมายของแต่ละบรรทัด](docs/diagnostics.md)

## GRKU Plus

เว็บไซต์ฟรีสามารถเขียนได้ 10 ลุคใดๆ ลงในการ์ด GRKU Plus คือการชำระเงินครั้งเดียวผ่านพร้อมเพย์ (PromptPay) ซึ่งจะปลดล็อกช่องใส่ 25 ช่อง, ชุดฟิล์มตามแบรนด์ (brand pack) หรือทั้งหมด (40 ช่องและทุกลุค) คีย์จะส่งให้ทางอีเมลและใช้งานได้บนทุกอุปกรณ์ บริการนี้ทำงานอยู่ใน `services/plus` โดยจะไม่มีการเข้าถึงการ์ดของคุณเลย

## ที่มา

GRKU พัฒนาต่อยอดจาก GRKit 1.5.2 และบรันช์ `feat/recipes` ของ GRKit; เทคนิคระบบรันไทม์, ABI ของโมดูล และชุดทดสอบเป็นของ GRKit โดย GRKU ยังคงเก็บประกาศสิทธิ์ MIT เดิมไว้ ส่วนเฟิร์มแวร์บูตเร็วของ GRKit นั้นตั้งใจตัดออกไป ทั้งหมดด้านล่างนี้คือผลงานของ GRKU เอง

| ด้าน | GRKit (จุดเริ่มต้นของ GRKU) | GRKU ในปัจจุบัน | วิธีการ |
| --- | --- | --- | --- |
| คลังฟิล์ม | 21 ลุค | 145 ลุค, บรรจุได้ 40 ลุคต่อการ์ด; มีไฟล์ ZIP รวมคลังฟิล์มที่มีทุกลุค | ปรับแต่งมาจากพรีเซ็ตฟิล์มแบบเปิดของ Pat David (CC BY-SA 4.0), t3mujinpack (MIT), spektrafilm, Spectral Film LUT และ Fotufilm รวมถึงไฟล์ LUT ของ FUJIFILM เองสำหรับ Film Simulation ทั้งสิบแบบ พร้อมผลการสำรวจความนิยมปี 2026 ใน `docs/popular-films-2026.md` เพื่อคัดเลือก 40 ลุคเริ่มต้น |
| ไอคอน | ไทล์แบบแบน | กล่องฟิล์มตามสีของกล่องจริงสำหรับทุกลุค, ไทล์เมนูแบบสี และเอฟเฟกต์ที่นำเข้าไอคอน PNG ของตัวเองได้ | `scripts/flap-icons.py` ใช้สำหรับวาดกล่องฟิล์ม; ตัวคอมไพเลอร์เอฟเฟกต์รองรับ `icon: {"png": ...}` |
| สูตรภาพ (Recipes) | บรันช์ที่ยังไม่ได้รวม | รวมเข้ามาแล้ว พร้อมคำอธิบายที่เข้าใจง่ายสำหรับคนไทย, สูตรภาพยอดนิยมจาก ricohcookbook.com, ตัวแก้ไขแบบสามขั้นตอน, ภาพตัวอย่าง และใบสรุปการตั้งค่าสไตล์เมนูกล้อง | `modules/recipes`, `web/src/components/Recipe*.tsx` |
| โมดูล | Film Look, Framing, Guides, Date, Glow, Grain | เพิ่ม Crop, Light Leak, Diffusion, Border, Recipes, Enable at Start, ป้ายหน่วยฟุต, เส้นไกด์วงก้นหอยทองคำ และสมมาตรไดนามิก | พอร์ตมาจาก fork ของ MustafaCisse และ kkasemsa พร้อมทั้งเขียนขึ้นใหม่; รองรับได้สิบโมดูลในหนึ่งแพ็กเกจ |
| การเริ่มต้นระบบ | ร้องขอการอ่านการ์ดหลายครั้งในแต่ละครั้งที่เปิดเครื่อง | ร้องขอเพียงครั้งเดียว: ตัวคอร์จะสแกน ติดตั้ง และรายงานผลในกระบวนการเดียว พร้อมส่งความคืบหน้าไปยังตัวโหลดใน RAM | `docs/one-shot-start.md` |
| การบูตเร็ว | มีตัวเลือกเฟิร์มแวร์ที่ผ่านการแพตช์ | ไม่มี ตามกฎที่ตั้งไว้: GRKU เป็นเพียงสคริปต์บนการ์ดเท่านั้น | `docs/fastboot.md` คงไว้เป็นข้อมูลอ้างอิง |
| เว็บไซต์ | ภาษาอังกฤษ, จีน, ญี่ปุ่น, เกาหลี | ภาษาไทยเป็นหลัก, รวมหกภาษา, หน้าติดตั้งแบบหน้าเดียวในธีมมืดสร้างด้วย shadcn/ui, พรีวิวสดบนภาพตัวอย่างหกภาพ, GRKU Plus, SEO และพรีวิวลิงก์ | `web/`, `services/plus` |
| การ์ด SD | โฟลเดอร์ `GRKIT` | โฟลเดอร์ `GRKU`; เว็บไซต์และ `scripts/card.py` จะย้ายโฟลเดอร์ `GRKIT` เดิมให้ โดยกล้องจะไม่แตะต้องเลย | `web/src/card.ts`, `scripts/card.py` |
| แบรนด์ | GRKit | GRKU: เครื่องหมายคำที่มีจุดสีแดง, เอกลักษณ์ภาษาไทย, `docs/brand.md` | |
| การปล่อยรุ่น | GitHub Actions ไปยัง grkit.app | ไปป์ไลน์เดียวกันสำหรับ grku.app: เมื่อ push จะเปิด pull request สำหรับปล่อยรุ่น และเมื่อ merge จะบิลด์จากเฟิร์มแวร์ทางการแล้วดีพลอยเว็บไซต์ผ่าน Cloudflare Pages; ส่วนบริการ Plus จะดีพลอยจาก `services/plus` | `.github/workflows`, `docs/releasing.md` |

GRKU ยังคงใช้ ABI โมดูลของ GRKit (โมดูลที่บิลด์ด้วย GRKit SDK ยังคงโหลดได้) รวมถึงสัญญาอนุญาตต่างๆ และส่งการแก้ไขกลับไปยัง GRKit ในส่วนที่เกี่ยวข้อง โปรเจกต์นี้ไม่ได้เป็นมิเรอร์ของ GRKit แต่ติดตามการพัฒนาอยู่เสมอ: การเปลี่ยนแปลงในภายหลังแต่ละอย่างของ GRKit จะถูกพอร์ตมาเมื่อเกี่ยวข้อง เช่น การจำค่า ADJ ของ GRKit 1.5.4, เฟิร์มแวร์ของเดือนพฤศจิกายน 2026 ตลอดจนแถบสถานะและการแก้ไขสูตรภาพของ GRKit 1.5.5 ส่วนการเปลี่ยนแปลงของเฟิร์มแวร์บูตเร็วของ GRKit นั้นจะยังคงตัดออกไปเช่นเดิม

## การบิลด์จากซอร์สโค้ด

คุณต้องมี Rust 1.92 หรือใหม่กว่า, Clang และ LLD ที่รองรับ ARM รวมถึงไฟล์เฟิร์มแวร์ทางการของ Ricoh ซึ่งไม่ได้รวมอยู่ในรีโพซิทอรีนี้

```sh
cargo install --path crates/grku-cli --locked
grku effects build --source effects --out build/effects
grku build --target gr4-1.11 --firmware firmware/fwdc248b.bin --out build/runtime
for module in modules/*/; do grku module build --dir "$module" --out "build/modules/$(basename "$module").GRM"; done
sh .github/scripts/install-guide-tools.sh build/guide-tools
sh .github/scripts/build-guides.sh grku build/guide-tools build/guides
grku package --build build/runtime --camera gr4 --effects build/effects-default \
  $(for m in build/modules/*.GRM; do case $m in *BORDER*) ;; *) printf -- '--module %s ' "$m";; esac; done) \
  --guide build/guides/gr4/en.pdf --out dist/GRKU-gr4.zip
grku verify dist/GRKU-gr4.zip
```

`build/effects` จะเก็บลุคทั้งหมด 145 ลุคไว้ แพ็กเกจหนึ่งใส่ได้สูงสุด 40 ลุค ดังนั้น `python3 -I scripts/defaults.py build/effects build/effects-default` จึงใช้เลือก 40 ลุคจาก `effects/defaults.txt` แพ็กเกจหนึ่งจุได้สิบโมดูล จึงต้องเว้นไว้หนึ่งโมดูล (เวอร์ชันเผยแพร่ได้เว้น Border เอาไว้) สำหรับ GR III ให้บิลด์ `gr3-2.10` และ `gr3-2.21` โดยแต่ละตัวบิลด์มาจาก `fwdc239b.bin` ของเฟิร์มแวร์รุ่นนั้นๆ แล้วแพ็กเกจด้วย `--camera gr3` พร้อมทั้งระบุ `--build` สำหรับแต่ละตัว ส่วนแพ็กเกจของ GR IV จะใช้ `gr4-1.11`, `gr4-1.20` และ `gr4-1.21` จากนั้นคำสั่ง `python3 -I scripts/card.py write dist/GRKU-gr4.zip` จะเขียนแพ็กเกจลงในการ์ดที่อยู่ในเครื่องอ่านการ์ด

## การมีส่วนร่วม

ดูรายละเอียดได้ที่ [CONTRIBUTING.md](CONTRIBUTING.md) รายงานผลการใช้งานจากตัวกล้องคือสิ่งที่มีประโยชน์ที่สุดที่คุณส่งมาได้ โดยเฉพาะจากรุ่น GR III หรือ GR IIIx ส่งปัญหาที่พบ ไอเดีย และคำถามเข้ามาได้ที่ [issues](https://github.com/botnick/GRKU/issues)

## เอกสารประกอบ

- [สถาปัตยกรรม](docs/architecture.md) และ[การเริ่มต้นแบบรวดเดียว](docs/one-shot-start.md)
- [การเขียนโมดูล](docs/modules.md) และ[ข้อมูลอ้างอิงโมดูล](docs/module-reference.md)
- [รายงานอุปกรณ์](docs/diagnostics.md): `BOOT.TXT`, `REPORT.TXT` และ `INSTALL.ERR` ทีละบรรทัด
- [เอฟเฟกต์](effects/README.md), [แหล่งที่มาของ LUT](docs/lut-sources.md) และ[ฟิล์มยอดนิยมแห่งปี 2026](docs/popular-films-2026.md)
- [เว็บไซต์](web/README.md), [แบรนด์](docs/brand.md) และ[บันทึกผลิตภัณฑ์](docs/PRODUCT.md)
- [แผนงาน](docs/roadmap.md), [แบบสำรวจความคิดเห็นชุมชน](docs/community-survey.md) และ[บันทึกการส่งต่องาน](HANDOFF.md)
- [ขั้นตอนการปล่อยรุ่น](docs/releasing.md); จาก GRKit, [เฟิร์มแวร์บูตเร็ว](docs/fastboot.md) ซึ่ง GRKU ไม่ได้ใช้

## สัญญาอนุญาต

โค้ดอยู่ภายใต้ [MIT License](LICENSE) GRKU มีโค้ดจาก [GRKit](https://github.com/ahonn/GRKit) โดย ahonn ซึ่งใช้สัญญาอนุญาต MIT เช่นกัน และยังคงเก็บประกาศสิทธิ์เดิมไว้ แต่ละแพ็กเกจจะมีไฟล์ `LICENSES.md` ซึ่งระบุสัญญาอนุญาตของไฟล์ต่างๆ ภายในนั้น

- เอฟเฟกต์ต่างๆ อยู่ภายใต้ CC BY-SA 4.0, MIT หรือ Apache-2.0 ดูรายละเอียดที่ [effects/NOTICE.md](effects/NOTICE.md)
- ข้อความในเมนูและไลฟ์วิวใช้ฟอนต์ [Roboto Condensed](https://github.com/googlefonts/roboto-classic) ภายใต้ [SIL Open Font License 1.1](crates/grku-core/assets/RobotoCondensed-LICENSE.txt)
- การปรับเทียบเอฟเฟกต์พอร์ตมาจาก [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) ภายใต้ [MIT License](crates/grku-core/GR3_FILM_MODS_LICENSE.txt)

RICOH และ GR เป็นเครื่องหมายการค้าของ Ricoh Company, Ltd. ชื่อฟิล์มเป็นเครื่องหมายการค้าของเจ้าของผลิตภัณฑ์นั้นๆ GRKU เป็นโปรเจกต์อิสระโดย [BOTNICK](https://github.com/botnick) และไม่มีส่วนเกี่ยวข้องกับ Ricoh, ผู้พัฒนา GRKit หรือผู้ผลิตฟิล์มรายใดๆ
