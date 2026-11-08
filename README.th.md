# GRKit · BOTNICK edition

ฟอร์กของ [ahonn/GRKit](https://github.com/ahonn/grkit) โดย **BOTNICK**: คลังฟิล์ม 135 ลุคพร้อมไอคอนกล่องฟิล์มสมจริง, ลุค Positive GRII, ไอคอนเมนูสี, โมดูล Border, การโหลดแบบ one-shot ที่เร็วขึ้น และไม่มีเฟิร์มแวร์ fast-boot GRKit ยังเป็นแค่สคริปต์บนการ์ด SD ฟอร์แมตการ์ดแล้วกล้องกลับเป็นของเดิม

[English](README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | ไทย

[![Tests](https://github.com/ahonn/grkit/actions/workflows/tests.yml/badge.svg)](https://github.com/ahonn/grkit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

GRKit เพิ่ม Film Look, การครอปแบบ XPan และอัตราส่วนอื่น ๆ, ตราประทับวันที่, Glow และ Grain ให้กับ RICOH GR III, GR IIIx และ GR IV ทำงานจาก SD card และไม่เขียนทับ firmware ของกล้องเลย ถอดการ์ดออก กล้องก็กลับเป็นของเดิม

<p>
  <img src="https://github.com/ahonn/grkit/raw/main/resources/images/grkit-root.jpg" alt="หน้า GRKit ในเมนู ADJ" width="49%">
  <img src="https://github.com/ahonn/grkit/raw/main/resources/images/grkit-menu.jpg" alt="หมวด GRKit ในแท็บ Customize ของ MENU" width="49%">
</p>

ภาพถ่าย: [MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)

## คุณสมบัติ

กดคันโยก ADJ ขณะถ่ายภาพ แล้วเลือกรายการที่ 6 ชื่อ GRK

- **Film Look**: Portra 400, Velvia 100, Tri-X 400 และอีกหลายตัว พร้อมพรีวิวสด คุณยังนำเข้า LUT `.cube` หรือ preset ของ Lightroom ของคุณเองได้ที่ [grkit.app](https://grkit.app) แต่ละลุคฟิตมาจาก LUT ฟิล์มโอเพนซอร์ส จึงใกล้เคียงของจริงแต่ไม่เหมือนทุกประการ ([แหล่งที่มา](effects/NOTICE.md))
- **Framing**: XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6 และ 1:1 จะครอปภาพ JPEG จริง หรือแค่ทำเครื่องหมายช่วยจัดองค์ประกอบด้วยมาสก์หรือเส้นกรอบก็ได้ การเลือกอัตราส่วนจะตั้งกล้องเป็น 3:2 ในทั้งสองโหมด ส่วน Off จะคงอัตราส่วนปัจจุบันของกล้องไว้

  ไฟล์ RAW คงการครอปเริ่มต้นแบบ 3:2 และค่า digital crop ของกล้องไว้ ส่วนพรีวิวที่ฝังในไฟล์ยังแสดงองค์ประกอบที่เลือกไว้ได้

- **Guides**: จุดตัดเก้าช่อง กึ่งกลาง อัตราส่วนทอง หรือเส้นทแยง
- **Date Imprint**: วันที่บนภาพในสไตล์ Classic, จุดแบบ GR1s หรือ GR II
- **Glow**: Bloom กระจายแสงนุ่ม ๆ รอบแหล่งแสงและส่วนสว่าง Halation เพิ่มวงแสงสีแดงส้มรอบแสงจ้าเพื่อเลียนแบบฟิล์มภาพยนตร์ แต่ละเอฟเฟกต์มีค่า Enable และ Strength ของตัวเอง จึงเปิดพร้อมกันได้
- **Grain**: เกรนฟิล์ม 4 ระดับ และ 4 ขนาด (Auto, Small, Medium, Large)

GRKit ใช้เวลาโหลดราว 8 ถึง 10 วินาทีหลังเปิดกล้อง และนานกว่านั้นบน GR IV หรือในการเปิดครั้งแรกหลังติดตั้งหรืออัปเดต ก่อนหน้านั้นกล้องจะใช้ค่าของตัวเอง การตั้งค่าทั้งหมดอยู่ในหมวด GRKit ท้ายแท็บ Customize ของ MENU หากต้องการเขียนโมดูลของคุณเอง ดู [Writing a module](docs/modules.md)

**Fast start:** ด้วย [fast-boot firmware](resources/FASTBOOT.md) ที่เป็นตัวเลือกเสริม package GRKit ชุดเดิมจะโหลดได้ทันทีหลังเปิดกล้อง คุณสร้างมันได้ที่หน้า [Fast start](https://grkit.app/fastboot/) ของ grkit.app จาก firmware ทางการของ Ricoh แล้วติดตั้งแบบเดียวกับการอัปเดต firmware ตัว GRKit เองไม่เขียนทับ firmware

## กล้องที่รองรับ

| กล้อง | ทดสอบบนกล้องแล้ว | รองรับ |
| --- | --- | --- |
| GR III, GR III HDF | 2.10, 2.20 | — |
| GR IIIx, GR IIIx HDF | 1.60, 1.70 | — |
| GR IV, GR IV HDF | 1.11, 1.20 | — |
| GR IV Monochrome | 1.00 | 1.10 |

GR IV Monochrome ไม่มี Film Look รุ่นและเวอร์ชัน firmware อื่นไม่รองรับ หาก GRKit ไม่โหลดบนกล้องที่รองรับ ดู[คู่มือ firmware dump](resources/DUMP.md)

> [!WARNING]
> GRKit เป็นซอฟต์แวร์ทดลอง ใช้บนความเสี่ยงของคุณเอง
> การติดตั้งจะเปิดค่า SD script ของกล้อง ซึ่งจะค้างอยู่จนกว่าคุณจะปิดมัน หาก GRKit ล้มเหลว กล้องอาจค้างตอนเปิดเครื่อง ดังนั้นอ่าน[คู่มือกู้คืน](resources/RECOVERY.md)ก่อน

## ติดตั้ง

เลือกกล้อง โมดูล และเอฟเฟกต์ที่ [grkit.app](https://grkit.app) แล้วเลือกอย่างใดอย่างหนึ่ง:

- **เขียนลง SD card** จาก Chrome หรือ Edge บนคอมพิวเตอร์ เว็บยังอัปเดตหรือถอนการติดตั้ง GRKit และเพิ่มหรือลบโมดูลกับเอฟเฟกต์ได้ด้วย
- **ดาวน์โหลด GRKit.zip** แล้วทำตามคู่มือ PDF ที่อยู่ข้างใน ([GR III และ GR IIIx](resources/INSTALLATION.md), [GR IV](resources/INSTALLATION-GR4.md))

เฉพาะครั้งแรก ให้กด MENU ค้างไว้ขณะเปิดกล้อง การอัปเดตจาก ZIP ให้แทนที่โฟลเดอร์ `SCRIPT` บนการ์ด การตั้งค่าของคุณอยู่ใน `GRKIT` การฟอร์แมตการ์ดจะลบ GRKit ดังนั้นคัดลอก `GRKIT` ไปไว้ในคอมพิวเตอร์ก่อน

หาก GRK ไม่ปรากฏ ดู FAQ ที่ [grkit.app](https://grkit.app) ถ้ายังไม่ได้ผล ส่ง `GRKIT/REPORT.TXT`, `GRKIT/BOOT.TXT` และ `SCRIPT/GRKIT/INSTALL.ERR` (ถ้ามี) ใน [device report](https://github.com/ahonn/grkit/issues/new?template=device-report.yml)

## Build จากซอร์ส

ต้องมี Rust 1.92 ขึ้นไป, Clang และ LLD ที่รองรับ ARM และไฟล์ firmware ทางการของ Ricoh ซึ่งรีโปนี้ไม่ได้รวมไว้

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

สำหรับกล้องรุ่นอื่น โมดูลที่น้อยลง หรือคู่มือภาษาอื่น ดู [Build packages](CONTRIBUTING.md#build-packages)

## การมีส่วนร่วม

ดู [CONTRIBUTING.md](CONTRIBUTING.md) ยินดีรับ device report ไม่ว่า GRKit จะทำงานได้หรือไม่ โดยเฉพาะกับ firmware ที่ยังไม่เคยทดสอบบนกล้อง ส่งปัญหา ไอเดียฟีเจอร์ และคำถามผ่าน[ฟอร์ม feedback](https://tally.so/r/Z9jRgB) และสนับสนุนโปรเจกต์ได้ด้วยการ[เลี้ยงกาแฟ](https://buymeacoffee.com/yuexunjiang)

## เอกสาร

- [Architecture](docs/architecture.md)
- [Writing a module](docs/modules.md) และ [module reference](docs/module-reference.md)
- [Fast-boot firmware](docs/fastboot.md): อินเทอร์เฟซสคริปต์สำหรับ SD script
- [Release process](docs/releasing.md)
- [Effects](effects/README.md)
- [Web site](web/README.md)
- [One-shot start](docs/one-shot-start.md), [Roadmap](docs/roadmap.md) และ [Handoff](HANDOFF.md) ของ fork นี้

## สัญญาอนุญาต

โค้ดอยู่ภายใต้ [MIT License](LICENSE) แต่ละ package มี `LICENSES.md` ที่ระบุสัญญาอนุญาตของไฟล์ในนั้น

- เอฟเฟกต์อยู่ภายใต้ CC BY-SA 4.0 หรือ MIT ดู [effects/NOTICE.md](effects/NOTICE.md)
- ข้อความในเมนูและไลฟ์วิวใช้ฟอนต์ [Roboto Condensed](https://github.com/googlefonts/roboto-classic) ภายใต้ [SIL Open Font License 1.1](crates/grkit-core/assets/RobotoCondensed-LICENSE.txt)
- การฟิตเอฟเฟกต์พอร์ตมาจาก [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) ภายใต้ [MIT License](crates/grkit-core/GR3_FILM_MODS_LICENSE.txt)

RICOH และ GR เป็นเครื่องหมายการค้าของ Ricoh Company, Ltd. ชื่อฟิล์มเป็นเครื่องหมายการค้าของเจ้าของแต่ละราย GRKit เป็นโปรเจกต์อิสระ ไม่เกี่ยวข้องกับ Ricoh หรือผู้ผลิตฟิล์มรายใด
