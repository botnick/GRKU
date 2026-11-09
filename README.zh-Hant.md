# GRKU · BOTNICK edition

GRKU 由 **BOTNICK** 製作，是 ahonn 的 [GRKit](https://github.com/ahonn/GRKit) 分支：內建 135 底片庫與擬真的底片盒圖示、Positive GRII 風格、彩色選單方塊、Border、Light Leak 與 Diffusion 模組、以英尺為單位的 Snap 對焦距離、載入更快的一次性啟動，且不使用快速啟動韌體。GRKU 只是記憶卡上的一個腳本：格式化記憶卡，相機就恢復原狀。

[English](README.md) | [简体中文](README.zh-Hans.md) | 繁體中文 | [日本語](README.ja.md) | [한국어](README.ko.md) | [ไทย](README.th.md)

[![Tests](https://github.com/botnick/GRKit/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

GRKU 為 RICOH GR III、GR IIIx 與 GR IV 加上底片風格、XPan 等裁切比例、日期戳記、光暈、漏光、柔光、顆粒與邊框。它從記憶卡執行，絕不寫入韌體。拔出記憶卡，相機就恢復原狀。

<p>
  <img src="resources/images/grkit-root.zh-Hant.jpg" alt="ADJ 選單中的 GRKU 頁面" width="49%">
  <img src="resources/images/grkit-menu.zh-Hant.jpg" alt="MENU 自訂頁中的 GRKU 小節" width="49%">
</p>

照片：[MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/)，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)。

## 功能

拍攝時按下 ADJ 撥桿，選擇第 6 項 GRKU。

- **底片風格**：共 135 種風格，其中 40 種內建於安裝包，其餘收錄於底片庫：Kodak、Fujifilm、Ilford、CineStill、Lomography、Polaroid、Agfa、Harman、源自 GR II 的 Positive GRII 風格等，每種風格都有即時預覽和專屬的底片盒圖示。也可以在 [grku.app](https://grku.app) 匯入自己的 `.cube` LUT 或 Lightroom 預設集。風格由開源底片 LUT 擬合而成，效果接近原 LUT，但不完全相同（[來源](effects/NOTICE.md)）。
- **構圖比例**：XPan、2.35:1、16:9、4:3、5:4、7:6 與 1:1。可裁切 JPEG，也可僅輔助構圖，取景時以遮罩或框線標出範圍。兩種模式下，選擇比例都會把相機設為 3:2。關閉構圖比例時保留相機目前的比例。

  RAW 的預設裁切範圍保持原生 3:2，並保留相機的數位裁切設定。內嵌預覽仍可能顯示所選構圖。

- **輔助線**：三分法、中心、黃金分割、對角線、黃金螺旋或動態對稱。
- **加印日期**：在照片上印日期，有經典、GR1s 點陣與 GR II 三種樣式。
- **光暈**：柔光讓燈光和高光向周圍柔和擴散。底片光暈在明亮光源周圍形成橙紅色光暈，模擬電影底片效果。兩項各有「啟用」和「強度」設定，可同時開啟。
- **漏光**：照片上的底片痕跡：暗角、灰塵與毛髮、漏光與刮痕，各有關閉、輕微、中等、強烈四段，另有褪色、蒙塵、漏光、過期四種預設。每張照片的效果分布都不同。
- **柔焦**：Black Pro-Mist 柔焦濾鏡的光暈效果，強度有 1/8、1/4 或 1/2。Black Mist 在陰影上加上濾鏡的薄紗感，Streak 則讓點光源產生變形鏡頭般的藍色或琥珀色水平光條。僅適用於 JPEG 照片。
- **粒紋感**：四段強度與四種粒紋大小（自動、小、中、大）。
- **邊框**：在照片上加上白色或黑色的沖印邊框，寬度為照片寬度的 3% 或 6%。
- **英呎**：在記憶卡中放入 `GRKU/FEET.TXT` 檔案後，Snap 對焦距離設定會以 1'、3'、5'、7'、8' 與 16' 顯示，取代公尺。

開機後 GRKU 需要約 9 秒載入，安裝或更新後的第一次開機會更久。在這之前相機使用原本的設定。完整設定在 MENU 自訂頁最後的 GRKU 小節。想自己寫模組，請見 [Writing a module](docs/modules.md)。

GRKU 沒有快速啟動韌體，未來也不會有：相機本身的韌體維持 Ricoh 出廠時的狀態，GRKU 只是記憶卡上的一支腳本，格式化記憶卡即可移除。這個分支的[單次啟動](docs/one-shot-start.md)機制，讓它在官方韌體上比 GRKit 載入得更快。

## 支援機型

| 機型 | 實機測試 | 已支援 |
| --- | --- | --- |
| GR III、GR III HDF | 2.10、2.20 | — |
| GR IIIx、GR IIIx HDF | 1.60、1.70 | — |
| GR IV、GR IV HDF | 1.11、1.20 | — |
| GR IV Monochrome | 1.00 | 1.10 |

此表來自 GRKit。此分支的修改已在韌體 1.11 的 GR IV 上執行過；GR III 與 GR IIIx 的安裝包由相同的程式碼建置，但尚未在這些相機上實際執行，而最新的模組（Light Leak、Diffusion、Border）與英尺標示也仍在等待首次實機測試。GR IV Monochrome 不含底片風格。其他機型與韌體版本目前不支援。如果 GRKU 在支援的相機上無法載入，請參考[韌體匯出指南](resources/DUMP.zh-Hant.md)。

> [!WARNING]
> GRKU 仍是實驗性專案，使用風險請自行承擔。
> 安裝時會開啟相機的 SD 腳本設定，之後需要手動關閉。如果 GRKU 出錯，相機可能卡在開機階段，安裝前請先閱讀[復原指南](resources/RECOVERY.zh-Hant.md)。

## 安裝

在這個分支版本的網站 [grku.app](https://grku.app) 上選好相機、模組和效果，再選擇一種方式：

- **直接寫入 SD 卡**：在電腦上用 Chrome 或 Edge 操作。網站也可以更新或解除安裝 GRKU，以及增減模組和效果。
- **下載 ZIP**（`GRKU-gr3.zip`、`GRKU-gr3x.zip` 或 `GRKU-gr4.zip`），依照壓縮檔內的 PDF 指南操作（[GR III 與 GR IIIx](resources/INSTALLATION.zh-Hant.md)、[GR IV](resources/INSTALLATION-GR4.zh-Hant.md)）。

也可以從這個儲存庫建置安裝包（見下文），再用讀卡機以 `python3 -I scripts/card.py write dist/GRKU-gr4.zip` 寫入記憶卡；同一個腳本可以開關 feet 標籤（`feet on`、`feet off`），並顯示記憶卡的狀態（`status`）。

只有第一次需要按住 MENU 開機。用 ZIP 更新時，替換卡中的 `SCRIPT` 資料夾即可，設定會保留在 `GRKU` 裡。格式化記憶卡會刪除 GRKU，格式化前請先把 `GRKU` 複製到電腦。

GRKU 沒有出現時，請在 [issue](https://github.com/botnick/GRKit/issues/new) 中附上 `GRKU/REPORT.TXT`、`GRKU/BOOT.TXT` 和 `SCRIPT/GRKU/INSTALL.ERR`（如果有）。[這些檔案每一行的意義](docs/diagnostics.md)。

## 從原始碼建置

需要 Rust 1.92 以上版本、支援 ARM 的 Clang 與 LLD，以及理光官方韌體檔案（儲存庫不含韌體）。

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

`build/effects` 包含全部 135 種風格；一個安裝包最多只能放入 40 種，因此用 `python3 -I scripts/defaults.py build/effects build/effects-default` 從 `effects/defaults.txt` 選出 40 種作為 `--effects` 參數。GR IV 請建置 `gr4-1.11` 與 `gr4-1.20`，並以 `--camera gr4` 將兩者打包。其他機型、部分模組或其他語言的指南，請見 [Build packages](CONTRIBUTING.md#build-packages) 與 [HANDOFF.md](HANDOFF.md)。

## 參與貢獻

請見 [CONTRIBUTING.md](CONTRIBUTING.md)。不論 GRKU 能不能用，都歡迎提交裝置回報，尤其是 GR III 與 GR IIIx，這個分支尚未在這些機型上執行過。遇到問題、有功能想法或疑問，請提交 [issues](https://github.com/botnick/GRKit/issues)。對 GRKit 本身有用的修改，請以 pull request 提交到上游。

## 文件

- [架構](docs/architecture.md)
- [撰寫模組](docs/modules.md)與[模組參考](docs/module-reference.md)
- [裝置回報的三個檔案](docs/diagnostics.md)：`BOOT.TXT`、`REPORT.TXT` 與 `INSTALL.ERR`，逐行說明
- [單次啟動](docs/one-shot-start.md)：GRKU 如何在官方韌體上更快載入
- [效果](effects/README.md)與預設 40 款背後的 [2026 年熱門底片](docs/popular-films-2026.md)
- [網站](web/README.md)與[品牌規範](docs/brand.md)
- 此分支的[路線圖](docs/roadmap.md)與[交接文件](HANDOFF.md)
- 來自 GRKit：[快速啟動韌體](docs/fastboot.md)（GRKU 未使用）與[發布流程](docs/releasing.md)

## 授權

程式碼採用 [MIT 授權條款](LICENSE)。GRKU 以 ahonn 的 [GRKit](https://github.com/ahonn/GRKit) 為基礎，同樣採用 MIT 授權，並保留其聲明。每個安裝包都附有 `LICENSES.md`，列出包內檔案的授權。

- 效果採用 CC BY-SA 4.0、MIT 或 Apache-2.0 授權，詳見 [effects/NOTICE.md](effects/NOTICE.md)。
- 選單與取景畫面的文字使用 [Roboto Condensed](https://github.com/googlefonts/roboto-classic) 字型，採用 [SIL Open Font License 1.1](crates/grkit-core/assets/RobotoCondensed-LICENSE.txt)。
- 效果擬合方法移植自 [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods)，採用 [MIT 授權條款](crates/grkit-core/GR3_FILM_MODS_LICENSE.txt)。

RICOH 與 GR 是 Ricoh Company, Ltd. 的商標，底片名稱是各自所有者的商標。GRKU 是獨立專案，與理光、GRKit 作者及任何底片廠商皆無關聯。
