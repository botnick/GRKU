# GRKU.

**GR ของคุณ ในแบบที่ชอบ** — 為 RICOH GR III、GR IIIx 與 GR IV 打造的底片風格，直接從 SD 卡執行。絕不刷入韌體：相機從記憶卡執行腳本，拔出記憶卡，相機就恢復成 Ricoh 出廠時的狀態。

[ไทย](README.th.md) | [English](README.md) | [简体中文](README.zh-Hans.md) | 繁體中文 | [日本語](README.ja.md) | [한국어](README.ko.md)

[![Tests](https://github.com/botnick/GRKU/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKU/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![grku.app](https://img.shields.io/badge/site-grku.app-d94135)](https://grku.app)

GRKU 是由 [BOTNICK](https://github.com/botnick) 開發的獨立專案，優先為泰國的 GR 使用者打造，接著推向其他地區：內建 152 款底片風格的風格庫（附真實片盒圖示）、配方、更多模組、一鍵啟動、可寫入記憶卡並販售額外風格的網站、泰語語音，以及專屬的發佈流程。使用手冊位於 [grku.app/docs](https://grku.app/docs/)。

<p>
  <img src="resources/images/grku-root.jpg" alt="ADJ 選單中的 GRKU 頁面" width="49%">
  <img src="resources/images/grku-menu.jpg" alt="MENU 自訂頁中的 GRKU 小節" width="49%">
</p>

畫面中的照片：[Mobnoboka](https://commons.wikimedia.org/wiki/File:Oguchi_Joushi_Kouen_1.jpg)，[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。

## 功能

拍攝時按下 ADJ 撥桿，選擇第 6 項 GRKU。GRKU 的所有功能都在這裡，以及 MENU 中的 GRKU 小節。ADJ 會再次開啟在 GRKU 上，並停留在你離開時的那一行，即使關機後也是如此。

- **Film Look**：152 種真實底片風格，記憶卡中一次可存放 40 種。Kodak、Fujifilm、Ilford、CineStill、Lomography、Polaroid、Agfa、Harman 與 Rollei，再加上 GRKU 仿照 GR II 正片風格自製的 GR II Positive (GRKU) 風格，以及 FUJIFILM 相機的十種免費底片模擬，從 Provia、Classic Chrome 到 Acros。每種風格都有採用真實底片盒配色的底片盒圖示。按下 Fn 可微調風格；也可以在網站上匯入自己的 LUT。
- **Recipes**：將整套相機風格命名儲存，或從網站載入熱門配方，即可一次切換 Film Look 或 Image Control、顆粒、光暈、白平衡、校正與曝光，並支援還原。
- **Framing**：XPan、2.35:1、16:9、4:3、5:4、7:6、1:1 或 3:4，可裁切 JPEG，也可僅顯示框線。**Crop**：35、40、50 或 70 mm，具備即時預覽。
- **Guides**：三分法、中心、黃金分割、對角線、黃金螺旋、動態對稱。
- **Date Imprint**：在照片上印日期，有經典、GR1s 點陣或 GR II 三種樣式。
- **Glow**：柔光讓燈光和高光向周圍擴散，底片光暈則呈現電影底片配色的橙紅色光暈。
- **Light Leak**：暗角、灰塵與毛髮、漏光、刮痕，或褪色、蒙塵、漏光、過期等預設。每張照片的效果分布都不同。
- **Diffusion**：1/8、1/4 或 1/2 強度的 Black Pro-Mist 濾鏡、陰影處覆上 Black Mist 薄紗感，以及點光源的變形鏡頭光條；也可單獨使用底片柔和度（弱、中、強），呈現底片掃描時的柔和質感。
- **顆粒（Grain）**：四種強度、四種尺寸，可選擇相機原生繪製或「類底片（Film-like）」：呈現彩色負片印在相紙上的顆粒感，採用 Andrea Volpato 開發的 [spektrafilm](https://github.com/andreavolpato/spektrafilm) 顆粒模型（由 piratenpanda 貢獻）。
- **Border**：為整張照片加上「細」、「粗」或「拍立得」風格的黑白邊框。JPEG 尺寸會隨邊框向外擴展，完整保留照片的所有像素。
- **Enable at Start**：每次開機時將 GRKU 設為開啟、關閉或維持關機前的狀態。
- **Distance Unit**：可在 MENU 的 GRKU Settings 中，將快拍對焦距離與手動對焦尺標切換為公尺或英呎。

開機後 GRKU 需要約 9 秒載入（安裝後的第一次開機會更久）。在這之前相機保持原本的狀態。所有設定都會保留在記憶卡的 `GRKU` 資料夾中。

## 支援機型

| 機型 | 實機測試 | 已支援 |
| --- | --- | --- |
| GR III、GR III HDF | — | 2.10、2.20、2.21 |
| GR IIIx、GR IIIx HDF | — | 1.60、1.70、1.71 |
| GR IV、GR IV HDF | 1.11 | 1.11、1.20、1.21 |
| GR IV Monochrome | — | 1.00、1.10、1.11 |

GRKU 自身的修改已於韌體 1.11 的 GR IV 上實際執行過。GR III 與 GR IIIx 的套件由相同的程式碼與測試建置，但目前尚未有人在這些機型上實際執行 GRKU。若您有測試，請在 [issue](https://github.com/botnick/GRKU/issues) 回報是否成功。針對 Ricoh 於 2026 年 11 月 10 日發佈的韌體（GR III 2.21、GR IIIx 1.71、GR IV 1.21、GR IV Monochrome 1.11）所建置的版本已比對 Ricoh 的韌體檔案，但尚未在相機上實際執行過。

> [!WARNING]
> GRKU 仍是實驗性專案，使用風險請自行承擔。
> 安裝時會開啟相機的 SD 腳本設定，之後需要手動關閉。如果 GRKU 出錯，相機可能卡在開機階段，安裝前請先閱讀[復原指南](resources/RECOVERY.md)。

## 安裝

前往 [grku.app](https://grku.app)，選好你的相機、模組與底片風格，然後選擇其中一種方式：

- 在 Chrome 或 Edge 上**寫入 SD 卡**（該網站也可以更新、增減風格以及解除安裝），或
- **下載 ZIP**（`GRKU-gr3.zip`、`GRKU-gr3x.zip` 或 `GRKU-gr4.zip`），並依照壓縮檔內的 PDF 指南操作（[GR III 與 GR IIIx](resources/INSTALLATION.md)、[GR IV](resources/INSTALLATION-GR4.md)）。

只有第一次開機時需要按住 MENU。若要從 ZIP 更新，替換記憶卡中的 `SCRIPT` 資料夾即可；你的設定會保留在 `GRKU` 裡。格式化記憶卡會移除 GRKU。

若從含有 `GRKIT` 資料夾的舊記憶卡升級，網站會將您的設定與風格移轉至 `GRKU`。若您改以手動複製檔案，請在首次啟動前將記憶卡根目錄的 `GRKIT` 改名為 `GRKU`，或將其刪除。

如果 GRKU 沒有出現，請在 [issue](https://github.com/botnick/GRKU/issues/new) 中附上 `GRKU/REPORT.TXT`、`GRKU/BOOT.TXT` 和 `SCRIPT/GRKU/INSTALL.ERR`（如果存在）。[每一行的意義說明](docs/diagnostics.md)。

## GRKU Plus

免費版網站可寫入任 10 種風格至記憶卡。GRKU Plus 是一次性以 PromptPay 付費的方案，可解鎖 25 個槽位、品牌包，或全部內容（40 個槽位與所有風格）。金鑰會以電子郵件寄出，可在所有裝置上使用。此服務於 `services/plus` 執行；絕不會存取你的記憶卡。

## 從原始碼建置

需要 Rust 1.92 以上版本、支援 ARM 的 Clang 與 LLD，以及理光官方韌體檔案（儲存庫不含韌體）。

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

`build/effects` 包含全部 152 種風格；一個安裝包最多只能放入 40 種，因此用 `python3 -I scripts/defaults.py build/effects build/effects-default` 選出 `effects/defaults.txt` 的 40 種。一個安裝包可容納十個模組，因此請略過一個（正式發布版略過了 Border）。GR III 請分別從其韌體的 `fwdc239b.bin` 建置 `gr3-2.10` 與 `gr3-2.21`，並以 `--camera gr3` 以及為各版本加上 `--build` 來打包；GR IV 安裝包則納入 `gr4-1.11`、`gr4-1.20` 與 `gr4-1.21`。接著以 `python3 -I scripts/card.py write dist/GRKU-gr4.zip` 將安裝包寫入讀卡機中的記憶卡。

## 參與貢獻

請見 [CONTRIBUTING.md](CONTRIBUTING.md)。相機的回報是你能提供最有幫助的內容，特別是來自 GR III 或 GR IIIx 的回報。遇到問題、有想法或疑問，請至 [issues](https://github.com/botnick/GRKU/issues)。

## 文件

- [架構](docs/architecture.md)與[單次啟動](docs/one-shot-start.md)
- [撰寫模組](docs/modules.md)與[模組參考](docs/module-reference.md)
- [裝置回報](docs/diagnostics.md)：`BOOT.TXT`、`REPORT.TXT` 與 `INSTALL.ERR` 逐行說明
- [效果](effects/README.md)、[LUT 來源](docs/lut-sources.md)與 [2026 年熱門底片](docs/popular-films-2026.md)
- [網站](web/README.md)、[品牌規範](docs/brand.md)與[產品筆記](docs/PRODUCT.md)
- [路線圖](docs/roadmap.md)、[社群問卷調查](docs/community-survey.md)與[交接筆記](HANDOFF.md)
- [發佈說明](docs/releasing.md)，以及 grku.app 上的[使用手冊](https://grku.app/docs/)

## 授權

程式碼採用 [MIT 授權條款](LICENSE)。GRKU 包含來自 ahonn 的 [GRKit](https://github.com/ahonn/GRKit) 的程式碼，同樣採用 MIT 授權，並保留其聲明。每個安裝包都附有 `LICENSES.md`，列出包內檔案的授權。

- 效果採用 CC BY-SA 4.0、MIT 或 Apache-2.0 授權。詳見 [effects/NOTICE.md](effects/NOTICE.md)。
- 選單與取景畫面的文字使用 [Roboto Condensed](https://github.com/googlefonts/roboto-classic) 字型，採用 [SIL Open Font License 1.1](crates/grku-core/assets/RobotoCondensed-LICENSE.txt)。
- 效果擬合方法移植自 [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods)，採用 [MIT 授權條款](crates/grku-core/GR3_FILM_MODS_LICENSE.txt)。

RICOH 與 GR 為 Ricoh Company, Ltd. 的商標。底片名稱為各權利人的商標。GRKU 為 [BOTNICK](https://github.com/botnick) 的獨立專案，與 Ricoh 或任何底片製造商皆無隸屬關係。
