# GRKU · ฉบับ BOTNICK

GRKU โดย **BOTNICK** แยกสายพัฒนาจาก [GRKit](https://github.com/ahonn/GRKit) ของ ahonn: คลังฟิล์ม 135 พร้อมไอคอนกล่องฟิล์มสมจริง, ฟิล์มลุค Positive GRII, ไทล์เมนูแบบสี, โมดูล Border, Light Leak และ Diffusion, ระยะโฟกัส Snap ในหน่วยฟุต, โหมดเปิดใช้งานครั้งเดียวที่โหลดเร็วขึ้น และไม่ต้องใช้เฟิร์มแวร์บูตเร็ว GRKU ยังคงเป็นเพียงสคริปต์บนการ์ด SD แค่ฟอร์แมตการ์ด กล้องก็กลับคืนสู่ค่าโรงงานทันที

[English](README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | ไทย

[![Tests](https://github.com/botnick/GRKit/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

GRKU เพิ่มฟิล์มลุค, สัดส่วนภาพแบบ XPan และแบบอื่นๆ, การพิมพ์วันที่ลงบนภาพ, เอฟเฟกต์แสงฟุ้ง (Glow), แสงรั่ว (Light Leak), แสงฟุ้งละมุน (Diffusion), เกรน และกรอบภาพ ให้กับกล้อง RICOH GR III, GR IIIx และ GR IV ตัวโปรแกรมทำงานจากการ์ด SD โดยตรงและไม่เขียนข้อมูลใดๆ ลงในเฟิร์มแวร์ เพียงถอดการ์ดออก กล้องก็กลับเป็นปกติเหมือนเดิมทุกประการ

<p>
  <img src="resources/images/grkit-root.jpg" alt="หน้า GRKU ในเมนู ADJ" width="49%">
  <img src="resources/images/grkit-menu.jpg" alt="ส่วนของ GRKU ในแท็บ Customize ของ MENU" width="49%">
</p>

ภาพถ่ายโดย: [MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)

## ฟีเจอร์

กดปุ่ม ADJ ขณะถ่ายภาพแล้วเลือกรายการที่ 6 คือ GRKU

- **Film Look**: 135 ลุค โดยมาพร้อมในแพ็กเกจ 40 ลุค และที่เหลืออยู่ในคลังฟิล์ม ได้แก่ Kodak, Fujifilm, Ilford, CineStill, Lomography, Polaroid, Agfa, Harman, ฟิล์มลุค Positive GRII แบบ GR II และอื่นๆ พร้อมพรีวิวในไลฟ์วิวและมีไอคอนกล่องฟิล์มของตัวเอง นอกจากนี้ยังนำเข้าไฟล์ LUT นามสกุล `.cube` หรือพรีเซ็ต Lightroom ของตัวเองได้ที่ [grku.app](https://grku.app) แต่ละลุคปรับแต่งมาจาก LUT ฟิล์มแบบโอเพนซอร์ส จึงให้โทนที่ใกล้เคียงต้นฉบับแต่ไม่เหมือนกันทั้งหมด ([แหล่งที่มา](effects/NOTICE.md))
- **Framing**: XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6 และ 1:1 เลือกครอปภาพ JPEG หรือแสดงเฉพาะกรอบจัดองค์ประกอบภาพด้วยมาสก์หรือเส้นกรอบ การเลือกสัดส่วนภาพจะตั้งค่ากล้องเป็น 3:2 ในทั้งสองโหมด ส่วนการเลือก Off จะคงสัดส่วนภาพปัจจุบันของกล้องไว้

  ไฟล์ RAW จะยังคงสัดส่วนการครอปเริ่มต้นแบบ 3:2 ตามเซ็นเซอร์และการตั้งค่าครอปดิจิทัลของกล้องไว้ ส่วนภาพพรีวิวที่ฝังอยู่ในไฟล์ยังสามารถแสดงองค์ประกอบภาพที่เลือกไว้ได้

- **Guides**: เส้นจุดตัดเก้าช่อง จุดกึ่งกลาง สัดส่วนทองคำ เส้นทแยงมุม วงก้นหอยทองคำ หรือสมมาตรไดนามิก
- **Date Imprint**: พิมพ์วันที่ลงบนภาพในสไตล์คลาสสิก ดอตเมทริกซ์แบบ GR1s หรือสไตล์ GR II
- **Glow**: Bloom ช่วยกระจายแสงฟุ้งนุ่มๆ รอบดวงไฟและส่วนไฮไลต์ ส่วน Halation จะเพิ่มขอบแสงสีส้มแดงรอบจุดกำเนิดแสงที่สว่างจ้าเพื่อจำลองเอกลักษณ์ของฟิล์มภาพยนตร์ แต่ละเอฟเฟกต์มีการตั้งค่า Enable และ Strength แยกกัน จึงเปิดใช้งานพร้อมกันได้ทั้งคู่
- **Light Leak**: ร่องรอยแบบฟิล์มบนภาพถ่าย ได้แก่ ขอบมืด ฝุ่นและเส้นขน แสงรั่ว และรอยขีดข่วน ซึ่งปรับแยกกันได้ทั้งแบบ Off, Light, Medium หรือ Strong หรือจะเลือกจากพรีเซ็ต Faded, Dusty, Leaky และ Expired ก็ได้ โดยตำแหน่งของร่องรอยจะสุ่มเปลี่ยนไปในแต่ละช็อต
- **Diffusion**: แสงฟุ้งละมุนแบบฟิลเตอร์ Black Pro-Mist ที่ระดับ 1/8, 1/4 หรือ 1/2 โดย Black Mist จะเพิ่มม่านแสงฟุ้งทับส่วนเงามืด และ Streak จะเพิ่มแสงแฟลร์แนวนอนสีน้ำเงินหรือสีอำพันแบบเลนส์ Anamorphic จากจุดกำเนิดแสง ใช้ได้กับภาพ JPEG เท่านั้น
- **Grain**: เกรนฟิล์มปรับความเข้มได้ 4 ระดับ และปรับขนาดได้ 4 ขนาด (Auto, Small, Medium, Large)
- **Border**: ขอบขาวหรือดำแบบภาพอัดทับลงบนภาพถ่าย ที่ขนาด 3% หรือ 6% ของความกว้างภาพ
- **Feet**: เมื่อมีไฟล์ `GRKIT/FEET.TXT` อยู่ในการ์ด การตั้งค่าระยะโฟกัส Snap จะอ่านค่าเป็น 1', 3', 5', 7', 8' และ 16' แทนหน่วยเมตร

GRKU ใช้เวลาโหลดประมาณ 9 วินาทีหลังจากเปิดกล้อง และจะนานขึ้นในการเปิดเครื่องครั้งแรกหลังการติดตั้งหรืออัปเดต ซึ่งระหว่างที่ยังโหลดไม่เสร็จ กล้องจะใช้การตั้งค่าปกติของตัวกล้องไปก่อน การตั้งค่าทั้งหมดจะอยู่ในส่วน GRKU ท้ายแท็บ Customize ใน MENU หากต้องการเขียนโมดูลด้วยตัวเอง ดูได้ที่ [Writing a module](docs/modules.md)

GRKU ไม่มีเฟิร์มแวร์บูตเร็วและจะไม่มีการทำขึ้นมา เฟิร์มแวร์ของกล้องยังคงเป็นเวอร์ชันเดิมที่ Ricoh แจกจ่ายมา GRKU เป็นเพียงสคริปต์บนการ์ด SD แค่ฟอร์แมตการ์ดก็ถูกลบออก โหมด[เปิดใช้งานครั้งเดียว](docs/one-shot-start.md)ของ fork นี้คือสิ่งที่ทำให้โหลดเร็วกว่า GRKit บนเฟิร์มแวร์ทางการ

## กล้องที่รองรับ

| กล้อง | ทดสอบกับกล้องจริงแล้ว | รองรับ |
| --- | --- | --- |
| GR III, GR III HDF | 2.10, 2.20 | — |
| GR IIIx, GR IIIx HDF | 1.60, 1.70 | — |
| GR IV, GR IV HDF | 1.11, 1.20 | — |
| GR IV Monochrome | 1.00 | 1.10 |

ตารางนี้เป็นของ GRKit ส่วนการเปลี่ยนแปลงของ fork นี้ได้ทดสอบบน GR IV กับเฟิร์มแวร์ 1.11 แล้ว แพ็กเกจสำหรับ GR III และ GR IIIx สร้างจากโค้ดชุดเดียวกันแต่ยังไม่เคยรันบนกล้องรุ่นเหล่านั้น และโมดูลใหม่ล่าสุด (Light Leak, Diffusion, Border) รวมถึงป้ายหน่วยฟุตยังรอการทดสอบบนกล้องจริงเป็นครั้งแรก GR IV Monochrome ไม่มีฟิล์มลุค ไม่รองรับกล้องรุ่นอื่นและเฟิร์มแวร์เวอร์ชันอื่นนอกเหนือจากนี้ หาก GRKU ไม่ทำงานบนกล้องที่รองรับ ให้ดู[คู่มือดัมพ์เฟิร์มแวร์](resources/DUMP.md)

> [!WARNING]
> GRKU ยังอยู่ในขั้นทดลอง ผู้ใช้ต้องรับความเสี่ยงด้วยตัวเอง
> การติดตั้งจะเปิดตั้งค่าสคริปต์การ์ด SD ของกล้อง ซึ่งจะเปิดค้างไว้จนกว่าจะสั่งปิดเอง หาก GRKU ทำงานผิดพลาด กล้องอาจค้างตอนเปิดเครื่องได้ จึงควรอ่าน[คู่มือกู้คืนระบบ](resources/RECOVERY.md)ก่อนใช้งานจริง

## การติดตั้ง

เลือกรุ่นกล้อง โมดูล และเอฟเฟกต์บน [grku.app](https://grku.app) ซึ่งเป็นเว็บไซต์ของ fork นี้ จากนั้นเลือกทำอย่างใดอย่างหนึ่งต่อไปนี้:

- **เขียนลงการ์ด SD** ผ่าน Chrome หรือ Edge บนคอมพิวเตอร์ นอกจากนี้เว็บไซต์ยังสามารถอัปเดตหรือถอนการติดตั้ง GRKU รวมถึงเพิ่มหรือลบโมดูลและเอฟเฟกต์ได้ด้วย
- **ดาวน์โหลดไฟล์ ZIP** (`GRKU-gr3.zip`, `GRKU-gr3x.zip` หรือ `GRKU-gr4.zip`) แล้วทำตามคู่มือ PDF ที่อยู่ในไฟล์ ([GR III และ GR IIIx](resources/INSTALLATION.md), [GR IV](resources/INSTALLATION-GR4.md))

หรือจะบิลด์แพ็กเกจจากรีโพซิทอรีนี้ (ด้านล่าง) แล้วเขียนลงการ์ดผ่านเครื่องอ่านการ์ดด้วยคำสั่ง `python3 -I scripts/card.py write dist/GRKU-gr4.zip` สคริปต์เดียวกันนี้ยังใช้เปิดและปิดป้ายหน่วยฟุต (`feet on`, `feet off`) และแสดงสถานะของการ์ด (`status`) ได้ด้วย

เฉพาะการใช้งานครั้งแรก ให้กดปุ่ม MENU ค้างไว้ขณะเปิดกล้อง หากต้องการอัปเดตจากไฟล์ ZIP ให้เขียนทับโฟลเดอร์ `SCRIPT` บนการ์ด การตั้งค่าของคุณจะยังคงอยู่ใน `GRKIT` การฟอร์แมตการ์ดจะทำให้ GRKU ถูกลบออก ดังนั้นควรคัดลอกโฟลเดอร์ `GRKIT` เก็บไว้ในคอมพิวเตอร์ก่อน

หาก GRKU ไม่แสดงขึ้นมา ให้ส่งไฟล์ `GRKIT/REPORT.TXT`, `GRKIT/BOOT.TXT` และ `SCRIPT/GRKIT/INSTALL.ERR` (ถ้ามี) เข้ามาใน [issue](https://github.com/botnick/GRKit/issues/new) [ความหมายของแต่ละบรรทัดในไฟล์เหล่านั้น](docs/diagnostics.md)

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
  --guide build/guides/gr3/en.pdf --out dist/GRKU-gr3.zip
grkit verify dist/GRKU-gr3.zip
```

`build/effects` จะเก็บลุคทั้งหมด 135 ลุคไว้ แต่แพ็กเกจหนึ่งใส่ได้สูงสุด 40 ลุค ดังนั้น `python3 -I scripts/defaults.py build/effects build/effects-default` จึงใช้เลือก 40 ลุคจาก `effects/defaults.txt` สำหรับอาร์กิวเมนต์ `--effects` สำหรับ GR IV ให้บิลด์ `gr4-1.11` และ `gr4-1.20` แล้วแพ็กเกจทั้งคู่ด้วย `--camera gr4` สำหรับกล้องรุ่นอื่น การเลือกใช้โมดูลที่น้อยลง หรือคู่มือในภาษาอื่น ดูที่ [Build packages](CONTRIBUTING.md#build-packages) และ [HANDOFF.md](HANDOFF.md)

## การมีส่วนร่วม

ดูรายละเอียดได้ที่ [CONTRIBUTING.md](CONTRIBUTING.md) เรายินดีรับรายงานผลการใช้งานจากตัวกล้อง ไม่ว่า GRKU จะทำงานได้หรือไม่ก็ตาม โดยเฉพาะจากรุ่น GR III และ GR IIIx ซึ่ง fork นี้ยังไม่เคยถูกนำไปใช้งานจริง ส่งปัญหาที่พบ ไอเดีย และคำถามเข้ามาเป็น [issues](https://github.com/botnick/GRKit/issues) ส่วนการเปลี่ยนแปลงที่เป็นประโยชน์ต่อตัว GRKit เองจะถูกส่งกลับไปยังโปรเจกต์ต้นน้ำในรูปแบบของ pull request

## เอกสารประกอบ

- [สถาปัตยกรรม](docs/architecture.md)
- [การเขียนโมดูล](docs/modules.md) และ[ข้อมูลอ้างอิงโมดูล](docs/module-reference.md)
- [ไฟล์ทั้งสามของรายงานอุปกรณ์](docs/diagnostics.md): `BOOT.TXT`, `REPORT.TXT` และ `INSTALL.ERR` ทีละบรรทัด
- [การเริ่มต้นแบบรวดเดียว](docs/one-shot-start.md): วิธีที่ GRKU โหลดได้เร็วขึ้นบนเฟิร์มแวร์ทางการ
- [เอฟเฟกต์](effects/README.md) และ[ฟิล์มยอดนิยมแห่งปี 2026](docs/popular-films-2026.md) ที่อยู่เบื้องหลังค่าเริ่มต้น 40 ลุค
- [เว็บไซต์](web/README.md) และ[เอกสารแบรนด์](docs/brand.th.md)
- [แผนงาน](docs/roadmap.md) และ[การส่งต่องาน](HANDOFF.md) ของ fork นี้
- จาก GRKit: [เฟิร์มแวร์ Fast-boot](docs/fastboot.md) ซึ่ง GRKU ไม่ได้ใช้ และ[ขั้นตอนการปล่อยรุ่น](docs/releasing.md)

## สัญญาอนุญาต

โค้ดอยู่ภายใต้ [MIT License](LICENSE) GRKU พัฒนาต่อยอดจาก [GRKit](https://github.com/ahonn/GRKit) โดย ahonn ซึ่งใช้สัญญาอนุญาต MIT เช่นกัน และยังคง保留ประกาศสิทธิ์เดิมไว้ แต่ละแพ็กเกจจะมีไฟล์ `LICENSES.md` ซึ่งระบุสัญญาอนุญาตของไฟล์ต่างๆ ภายในนั้น

- เอฟเฟกต์ต่างๆ อยู่ภายใต้สัญญาอนุญาต CC BY-SA 4.0, MIT หรือ Apache-2.0 ดูรายละเอียดที่ [effects/NOTICE.md](effects/NOTICE.md)
- ข้อความในเมนูและไลฟ์วิวใช้ฟอนต์ [Roboto Condensed](https://github.com/googlefonts/roboto-classic) ภายใต้ [SIL Open Font License 1.1](crates/grkit-core/assets/RobotoCondensed-LICENSE.txt)
- การปรับเทียบเอฟเฟกต์พอร์ตมาจาก [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) ภายใต้ [MIT License](crates/grkit-core/GR3_FILM_MODS_LICENSE.txt)

RICOH และ GR เป็นเครื่องหมายการค้าของ Ricoh Company, Ltd. ชื่อฟิล์มเป็นเครื่องหมายการค้าของเจ้าของผลิตภัณฑ์นั้นๆ GRKU เป็นโปรเจกต์อิสระและไม่มีส่วนเกี่ยวข้องกับ Ricoh, ผู้พัฒนา GRKit หรือผู้ผลิตฟิล์มรายใดๆ
