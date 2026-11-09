# GRKU

僅適用於 RICOH GR III 與 GR III HDF 韌體 2.10。

GRKU 是實驗性軟體，不提供任何擔保。如果 GRKU 出錯，相機可能在啟動時停止回應。請在安裝前閱讀[復原指南](https://github.com/botnick/GRKit/blob/main/resources/RECOVERY.md)。安裝 GRKU 即表示你接受[使用條款](https://github.com/botnick/GRKit/blob/main/resources/TERMS.md)。

## 安裝

在電腦上的 Chrome 或 Edge 瀏覽器中，[grku.app](https://grku.app/) 可以將 GRKU 寫入讀卡機裡的記憶卡。它會取代步驟 2。

1. 關閉相機電源。
2. 將 `SD_ROOT` 裡面的內容（而不是資料夾本身）複製到 SD 卡的根目錄。這樣記憶卡根目錄就會有 `SCRIPT` 資料夾。
3. 插入記憶卡。按住 MENU 的同時開啟相機電源。等到相機自行關機。
4. 正常開啟相機電源。

步驟 3 會開啟相機的 SD 指令碼：相機會顯示 Mode Set Command 與 Complete，然後自行關機。如果 SD 指令碼已經開啟，請跳過步驟 3。

![Mode Set Command 畫面顯示 Script - Enable 與 Complete。](images/modeset.png)

安裝完成後，你可以從記憶卡根目錄移除 `00078350.588` 與 `DEVELOP.MOD`。

## 使用

開機後幾秒鐘，拍攝畫面頂部會顯示 **GRKU**：GRKU 已載入。安裝或更新後的第一次啟動會花較長的時間。在 GRKU 載入之前拍攝的照片不會有 GRKU 效果。在拍攝模式下，按下 ADJ 撥桿並選擇第六個項目 GRKU。

![GRKU 頁面列出各模組並顯示目前的效果。](images/grkit-root.jpg)

照片：[MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/)，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)。

- **Film Look：** 將游標移到某個效果上即可在即時取景中預覽，按下 OK 即可保留。按下 Fn 可調整效果。它不會改變相機的 Image Control 設定。
- **Framing：** XPan、2.35:1、16:9 及其他比例。它會裁切 JPEG 照片，而 DNG 檔案保持 3:2。按下 Fn 可僅將框線用於構圖，或設定遮罩。
- **Guides：** 僅顯示在螢幕上的線條，不會出現在照片中。
- **Date Imprint：** 照片右下角的日期戳記。按下 Fn 可選擇日期樣式和字體。
- **Glow：** Bloom 與 Halation，僅適用於 JPEG 照片，即時取景中無法預覽。
- **Light Leak：** 暗角、灰塵、漏光與刮痕，僅適用於 JPEG 照片，即時取景中無法預覽。按下 Fn 可分別設定每一項的強度。
- **Diffusion：** Black Pro-Mist 柔焦濾鏡的柔光效果，僅適用於 JPEG 照片，即時取景中無法預覽。按下 Fn 可加入 Black Mist（覆蓋在陰影上的薄紗效果）或 Streak（變形鏡頭的水平眩光）。
- **Grain：** 照片上的底片顆粒。按下 Fn 可選擇顆粒大小。
- **Border：** 覆蓋在照片上的白色或黑色邊框，寬度為照片寬度的 3% 或 6%，僅適用於 JPEG 照片。

所有設定同樣位於 MENU 的 Custom 分頁 (C) 末尾的 **GRKU** 區段中。每個模組各佔一列。您可以在那裡開啟或關閉模組，在 **Options** 中勾選要讓 ADJ 顯示的效果、比例或樣式，並在 **ADJ Order** 中設定順序。GRKU 會在關機後保留您的設定。

## 更新

在電腦上的 Chrome 或 Edge 中開啟 [grku.app](https://grku.app/)，可以透過讀卡機直接更新記憶卡，代替第 2、3 步。

1. 關閉相機。
2. 從記憶卡刪除 `SCRIPT` 資料夾。
3. 把新安裝包 `SD_ROOT` 中的 `SCRIPT` 資料夾複製到記憶卡根目錄。
4. 正常開機，不需要按住 MENU。

GRKU 會把設定和效果保存在 `GRKIT` 資料夾中，因此更新後仍在。要從 GRKit 換成 GRKU，請用 grku.app 更新，以保留設定和效果：兩者都把它們存在同一個 `GRKIT` 資料夾裡。

## 疑難排解

### 按住 MENU 開機時，相機開始更新韌體

記憶卡根目錄中有韌體檔案。關閉相機，刪除根目錄中所有 `.bin` 檔案，然後重新執行安裝第 3 步。

### 相機沒有顯示 Mode Set Command

- 先按住 MENU 按鈕，再開機。
- 把 `SD_ROOT` 中的內容複製到記憶卡根目錄，不要複製到 `DCIM` 等資料夾中。

### ADJ 中沒有 GRKU

1. 開機後等待幾秒，直到拍攝畫面頂部顯示 **GRKU**。
2. 確認記憶卡根目錄中有 `SCRIPT` 資料夾。
3. 如果記憶卡中有 `SCRIPT/GRKIT/INSTALL.ERR`，在相機選單中確認韌體版本與安裝包對應。版本正確時，請提交[裝置報告](https://github.com/botnick/GRKit/issues/new?template=device-report.yml)，並附上 `INSTALL.ERR`、`GRKIT/REPORT.TXT` 和 `GRKIT/BOOT.TXT`（如果有）。
4. GRKU 只能在 Ricoh 官方韌體上運作。

### 格式化記憶卡後 GRKU 不運作

格式化會刪除 GRKU 和它的設定。格式化之前，把 `GRKIT` 資料夾複製到電腦。格式化之後，重新複製 `SD_ROOT` 中的內容，再把 `GRKIT` 資料夾複製回記憶卡根目錄。

## 移除 GRKU

在電腦上的 Chrome 或 Edge 中，[grku.app](https://grku.app/) 可以透過讀卡機直接從記憶卡移除 GRKU，也可以同時關閉 SD 腳本功能。

關閉相機，從記憶卡刪除 `SCRIPT` 和 `GRKIT` 資料夾。

SD 腳本功能會保持開啟。要關閉它：

1. 在 https://grku.app 下載你的相機對應的關閉 SD 腳本的檔案。
2. 把 `SD_ROOT` 中的內容複製到記憶卡根目錄。
3. 插入記憶卡。按住 MENU 按鈕開機，等待相機自動關機。
4. 從記憶卡根目錄刪除 `00078350.588` 與 `DEVELOP.MOD`。

相機在啟動時停止回應時，請參閱[復原指南](https://github.com/botnick/GRKit/blob/main/resources/RECOVERY.md)。

GRKU 與 Ricoh 無關。原始碼和授權：https://github.com/botnick/GRKit
