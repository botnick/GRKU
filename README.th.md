# GRKU · ฉบับ BOTNICK

แยกสายพัฒนาจาก [ahonn/GRKit](https://github.com/ahonn/grkit) โดย **BOTNICK**: คลังฟิล์ม 135 พร้อมไอคอนกล่องฟิล์มสมจริง, ฟิล์มลุค Positive GRII, ไทล์เมนูแบบสี, โมดูลกรอบภาพ (Border), โหมดเปิดใช้งานครั้งเดียวที่โหลดเร็วขึ้น และไม่ต้องใช้เฟิร์มแวร์บูตเร็ว GRKU ยังคงเป็นเพียงสคริปต์บนการ์ด SD แค่ฟอร์แมตการ์ด กล้องก็กลับคืนสู่ค่าโรงงานทันที

[English](README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | ไทย

[![Tests](https://github.com/ahonn/grkit/actions/workflows/tests.yml/badge.svg)](https://github.com/ahonn/grkit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

GRKU เพิ่มฟิล์มลุค, สัดส่วนภาพแบบ XPan และแบบอื่นๆ, การพิมพ์วันที่ลงบนภาพ, เอฟเฟกต์แสงฟุ้ง (Glow) และเกรน ให้กับกล้อง RICOH GR III, GR IIIx และ GR IV ตัวโปรแกรมทำงานจากการ์ด SD โดยตรงและไม่เขียนข้อมูลใดๆ ลงในเฟิร์มแวร์ เพียงถอดการ์ดออก กล้องก็กลับเป็นปกติเหมือนเดิมทุกประการ

<p>
  <img src="https://github.com/ahonn/grkit/raw/main/resources/images/grkit-root.jpg" alt="หน้า GRKU ในเมนู ADJ" width="49%">
  <img src="https://github.com/ahonn/grkit/raw/main/resources/images/grkit-menu.jpg" alt="ส่วนของ GRKU ในแท็บ Customize ของ MENU" width="49%">
</p>

ภาพถ่ายโดย: [MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)

## ฟีเจอร์

กดปุ่ม ADJ ขณะถ่ายภาพแล้วเลือกรายการที่ 6 คือ GRK

- **Film Look**: Portra 400, Velvia 100, Tri-X 400 และอื่นๆ พร้อมพรีวิวในไลฟ์วิว นอกจากนี้ยังนำเข้าไฟล์ LUT นามสกุล `.cube` หรือพรีเซ็ต Lightroom ของตัวเองได้ที่ [grkit.app](https://grkit.app) แต่ละลุคปรับแต่งมาจาก LUT ฟิล์มแบบโอเพนซอร์ส จึงให้โทนที่ใกล้เคียงต้นฉบับแต่ไม่เหมือนกันทั้งหมด ([แหล่งที่มา](effects/NOTICE.md))
- **Framing**: XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6 และ 1:1 เลือกครอปภาพ JPEG หรือแสดงเฉพาะกรอบจัดองค์ประกอบภาพด้วยมาสก์หรือเส้นกรอบ การเลือกสัดส่วนภาพจะตั้งค่ากล้องเป็น 3:2 ในทั้งสองโหมด ส่วนการเลือก Off จะคงสัดส่วนภาพปัจจุบันของกล้องไว้

  ไฟล์ RAW จะยังคงสัดส่วนการครอปเริ่มต้นแบบ 3:2 ตามเซ็นเซอร์และการตั้งค่าครอปดิจิทัลของกล้องไว้ ส่วนภาพพรีวิวที่ฝังอยู่ในไฟล์ยังสามารถแสดงองค์ประกอบภาพที่เลือกไว้ได้

- **Guides**: เส้นจุดตัดเก้าช่อง จุดกึ่งกลาง สัดส่วนทองคำ หรือเส้นทแยงมุม
- **Date Imprint**: พิมพ์วันที่ลงบนภาพในสไตล์คลาสสิก ดอตเมทริกซ์แบบ GR1s หรือสไตล์ GR II
- **Glow**: Bloom ช่วยกระจายแสงฟุ้งนุ่มๆ รอบดวงไฟและส่วนไฮไลต์ ส่วน Halation จะเพิ่มขอบแสงสีส้มแดงรอบจุดกำเนิดแสงที่สว่างจ้าเพื่อจำลองเอกลักษณ์ของฟิล์มภาพยนตร์ แต่ละเอฟเฟกต์มีการตั้งค่า Enable และ Strength แยกกัน จึงเปิดใช้งานพร้อมกันได้ทั้งคู่
- **Light Leak**: ร่องรอยแบบฟิล์มบนภาพถ่าย ได้แก่ ขอบมืด ฝุ่นและเส้นขน แสงรั่ว และรอยขีดข่วน ซึ่งปรับแยกกันได้ทั้งแบบ Off, Light, Medium หรือ Strong หรือจะเลือกจากพรีเซ็ต Faded, Dusty, Leaky และ Expired ก็ได้ โดยตำแหน่งของร่องรอยจะสุ่มเปลี่ยนไปในแต่ละช็อต
- **Diffusion**: แสงฟุ้งละมุนแบบฟิลเตอร์ Black Pro-Mist ที่ระดับ 1/8, 1/4 หรือ 1/2 โดย Black Mist จะเพิ่มม่านแสงฟุ้งทับส่วนเงามืด และ Streak จะเพิ่มแสงแฟลร์แนวนอนสีน้ำเงินหรือสีอำพันแบบเลนส์ Anamorphic จากจุดกำเนิดแสง ใช้ได้กับภาพ JPEG เท่านั้น
- **Grain**: เกรนฟิล์มปรับความเข้มได้ 4 ระดับ และปรับขนาดได้ 4 ขนาด (Auto, Small, Medium, Large)
- **Border**: ขอบขาวหรือดำแบบภาพอัดทับลงบนภาพถ่าย ที่ขนาด 3% หรือ 6% ของความกว้างภาพ

GRKU ใช้เวลาโหลดประมาณ 8 ถึง 10 วินาทีหลังจากเปิดกล้อง และจะนานขึ้นบน GR IV หรือในการเปิดเครื่องครั้งแรกหลังการติดตั้งหรืออัปเดต ซึ่งระหว่างที่ยังโหลดไม่เสร็จ กล้องจะใช้การตั้งค่าปกติของตัวกล้องไปก่อน การตั้งค่าทั้งหมดจะอยู่ในส่วน GRKU ท้ายแท็บ Customize ใน MENU หากต้องการเขียนโมดูลด้วยตัวเอง ดูได้ที่ [Writing a module](docs/modules.md)

**Fast start:** หากใช้ [เฟิร์มแวร์แบบบูตเร็ว](resources/FASTBOOT.md) ซึ่งเป็นตัวเลือกเสริม แพ็กเกจ GRKU ตัวเดิมจะโหลดเสร็จแทบจะทันทีหลังเปิดกล้อง สามารถสร้างไฟล์นี้ได้ที่หน้า [Fast start](https://grkit.app/fastboot/) บน grkit.app โดยใช้ไฟล์เฟิร์มแวร์ทางการของ Ricoh แล้วนำไปติดตั้งด้วยวิธีอัปเดตเฟิร์มแวร์ตามปกติ ส่วนตัว GRKU เองจะไม่มีการเขียนข้อมูลใดๆ ลงในเฟิร์มแวร์ของกล้อง

## กล้องที่รองรับ

| กล้อง | ทดสอบกับกล้องจริงแล้ว | รองรับ |
| --- | --- | --- |
| GR III, GR III HDF | 2.10, 2.20 | — |
| GR IIIx, GR IIIx HDF | 1.60, 1.70 | — |
| GR IV, GR IV HDF | 1.11, 1.20 | — |
| GR IV Monochrome | 1.00 | 1.10 |

GR IV Monochrome ไม่มีฟิล์มลุค ไม่รองรับกล้องรุ่นอื่นและเฟิร์มแวร์เวอร์ชันอื่นนอกเหนือจากนี้ หาก GRKU ไม่ทำงานบนกล้องที่รองรับ ให้ดู[คู่มือดัมพ์เฟิร์มแวร์](resources/DUMP.md)

> [!WARNING]
> GRKU ยังอยู่ในขั้นทดลอง ผู้ใช้ต้องรับความเสี่ยงด้วยตัวเอง
> การติดตั้งจะเปิดตั้งค่าสคริปต์การ์ด SD ของกล้อง ซึ่งจะเปิดค้างไว้จนกว่าจะสั่งปิดเอง หาก GRKU ทำงานผิดพลาด กล้องอาจค้างตอนเปิดเครื่องได้ จึงควรอ่าน[คู่มือกู้คืนระบบ](resources/RECOVERY.md)ก่อนใช้งานจริง

## การติดตั้ง

เลือกรุ่นกล้อง โมดูล และเอฟเฟกต์บน [grkit.app](https://grkit.app) จากนั้นเลือกทำอย่างใดอย่างหนึ่งต่อไปนี้:

- **เขียนลงการ์ด SD** ผ่าน Chrome หรือ Edge บนคอมพิวเตอร์ นอกจากนี้เว็บไซต์ยังสามารถอัปเดตหรือถอนการติดตั้ง GRKU รวมถึงเพิ่มหรือลบโมดูลและเอฟเฟกต์ได้ด้วย
- **ดาวน์โหลด GRKU.zip** แล้วทำตามคู่มือ PDF ที่อยู่ในไฟล์ ([GR III และ GR IIIx](resources/INSTALLATION.md), [GR IV](resources/INSTALLATION-GR4.md))

เฉพาะการใช้งานครั้งแรก ให้กดปุ่ม MENU ค้างไว้ขณะเปิดกล้อง หากต้องการอัปเดตจากไฟล์ ZIP ให้เขียนทับโฟลเดอร์ `SCRIPT` บนการ์ด การตั้งค่าของคุณจะยังคงอยู่ใน `GRKIT` การฟอร์แมตการ์ดจะทำให้ GRKU ถูกลบออก ดังนั้นควรคัดลอกโฟลเดอร์ `GRKIT` เก็บไว้ในคอมพิวเตอร์ก่อน

หาก GRK ไม่แสดงขึ้นมา ให้ตรวจสอบหน้า FAQ บน [grkit.app](https://grkit.app) หากยังแก้ปัญหาไม่ได้ ให้ส่งไฟล์ `GRKIT/REPORT.TXT`, `GRKIT/BOOT.TXT` และ `SCRIPT/GRKIT/INSTALL.ERR` (ถ้ามี) เข้ามาใน [รายงานปัญหาอุปกรณ์](https://github.com/botnick/GRKit/issues/new) [ความหมายของแต่ละบรรทัดในไฟล์เหล่านั้น](docs/diagnostics.md)

## การบิลด์จากซอร์สโค้ด

คุณต้องมี Rust 1.92 หรือใหม่กว่า, Clang และ LLD ที่รองรับ ARM รวมถึงไฟล์เฟิร์มแวร์ทางการของ Ricoh ซึ่งไม่ได้รวมอยู่ในรีโพซิทอรีนี้

```sh
cargo install --path crates/grkit-cli --locked
grkit effects build --source effects --out build/effects
grkit build --target gr3-2.10 --firmware firmware/fwdc239b.bin --out build/runtime
for module in modules/*/; do grkit module build --dir "$module" --out "build/modules/$(basename "$module").GRM"; done
sh .github/scripts/install-guide-tools.sh build/guide-tools
sh .github/scripts/build-guides.sh grkit build/guide-tools build/guides
grkit package --build build/runtime --effects build/effects $(for m in build/modules/*.GRM; do printf -- '--module %s ' "$m"; done) \
  --guide build/guides/gr3/en.pdf --out dist/GRKit.zip
grkit verify dist/GRKit.zip
```

สำหรับกล้องรุ่นอื่น การเลือกใช้โมดูลที่น้อยลง หรือคู่มือในภาษาอื่น ดูที่ [Build packages](CONTRIBUTING.md#build-packages)

## การมีส่วนร่วม

ดูรายละเอียดได้ที่ [CONTRIBUTING.md](CONTRIBUTING.md) เรายินดีรับรายงานผลการใช้งานจากตัวกล้อง ไม่ว่า GRKU จะทำงานได้หรือไม่ก็ตาม โดยเฉพาะกับเฟิร์มแวร์ที่ยังไม่เคยทดสอบบนกล้องจริง ส่งปัญหาที่พบ ไอเดียฟีเจอร์ใหม่ๆ และคำถามได้ทาง [แบบฟอร์มรับความคิดเห็น](https://tally.so/r/Z9jRgB) และสามารถสนับสนุนโปรเจกต์นี้ได้ด้วยการ [เลี้ยงกาแฟผู้พัฒนา](https://buymeacoffee.com/yuexunjiang)

## เอกสารประกอบ

- [สถาปัตยกรรม](docs/architecture.md)
- [การเขียนโมดูล](docs/modules.md) และ [ข้อมูลอ้างอิงโมดูล](docs/module-reference.md)
- [เฟิร์มแวร์ Fast-boot](docs/fastboot.md): อินเทอร์เฟซสคริปต์สำหรับสคริปต์บนการ์ด SD
- [ขั้นตอนการปล่อยรุ่น](docs/releasing.md)
- [เอฟเฟกต์](effects/README.md)
- [เว็บไซต์](web/README.md)
- [การเริ่มต้นแบบรวดเดียว](docs/one-shot-start.md), [แผนงาน](docs/roadmap.md) และ [การส่งต่องาน](HANDOFF.md) ของ fork นี้

## สัญญาอนุญาต

โค้ดอยู่ภายใต้ [MIT License](LICENSE) ในแต่ละแพ็กเกจจะมีไฟล์ `LICENSES.md` ซึ่งระบุสัญญาอนุญาตของไฟล์ต่างๆ ภายในนั้น

- เอฟเฟกต์ต่างๆ อยู่ภายใต้สัญญาอนุญาต CC BY-SA 4.0 หรือ MIT ดูรายละเอียดที่ [effects/NOTICE.md](effects/NOTICE.md)
- ข้อความในเมนูและไลฟ์วิวใช้ฟอนต์ [Roboto Condensed](https://github.com/googlefonts/roboto-classic) ภายใต้ [SIL Open Font License 1.1](crates/grkit-core/assets/RobotoCondensed-LICENSE.txt)
- การปรับเทียบเอฟเฟกต์พอร์ตมาจาก [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) ภายใต้ [MIT License](crates/grkit-core/GR3_FILM_MODS_LICENSE.txt)

RICOH และ GR เป็นเครื่องหมายการค้าของ Ricoh Company, Ltd. ชื่อฟิล์มเป็นเครื่องหมายการค้าของเจ้าของผลิตภัณฑ์นั้นๆ GRKU เป็นโปรเจกต์อิสระและไม่มีส่วนเกี่ยวข้องกับ Ricoh หรือผู้ผลิตฟิล์มรายใดๆ
