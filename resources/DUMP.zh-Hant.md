# 韌體匯出工具

韌體匯出工具把相機正在執行的韌體映像從記憶體複製到記憶卡。開發者用這個映像來支援 GRKU 還不認識的韌體版本。

只有當 GRKU 不支援你相機的韌體版本，或開發者在 issue 中要求匯出時，你才需要它。如果 GRKU 已經可以在你的相機上運作，你就不需要它。

此工具只讀取記憶體，不修改相機、韌體和相機設定。匯出的檔案只包含理光韌體，不包含照片和個人資料。

適用於 RICOH GR III、GR IIIx、GR IV、GR IV Monochrome 及其 HDF 型號。所有相機使用同一個 ZIP。

## 開始之前

- SD 腳本功能必須已經開啟。安裝 GRKU 時會開啟它。如果你沒有安裝過 GRKU，先依照相機的安裝指南完成第 1 到第 3 步以安裝一次 GRKU（[GR III 和 GR IIIx](https://grku.app/guides/gr3/en.pdf)、[GR IV](https://grku.app/guides/gr4/en.pdf)）。
- 此工具在記憶卡上時，GRKU 不會載入。
- 使用充飽電的電池。
- 從相機選單中記下相機的韌體版本。回報時會需要它。

## 取得工具

下載 [GRKU-dump.zip](https://github.com/botnick/GRKU/releases/latest/download/GRKU-dump.zip)。它與[最新版本](https://github.com/botnick/GRKU/releases/latest)中的 `GRKU-<版本>-dump.zip` 是同一個檔案。

ZIP 內包含 `SD_ROOT/SCRIPT/STARTUP.TTL`、`SD_ROOT/SCRIPT/GRDUMP/DUMP.SH`、`SD_ROOT/SCRIPT/GRDUMP/DUMP.BIN` 以及一個 `README.txt`。

## 匯出韌體

1. 關閉相機。取出記憶卡並放入電腦。
2. 如果記憶卡上有 `SCRIPT` 資料夾，把它複製到電腦作為備份。如果沒有，跳過這一步。
3. 解壓縮此工具。把 `SD_ROOT` 裡面的 `SCRIPT` 資料夾複製到記憶卡根目錄。如果電腦詢問，取代 `SCRIPT/STARTUP.TTL`。
4. 安全退出記憶卡。把它插入相機。正常開機，不要按住 MENU。
5. 保持開機狀態等待 2 分鐘。然後關閉相機。
6. 把記憶卡放入電腦，開啟記憶卡上的 `SCRIPT/GRDUMP`。

如果資料夾中有 `DUMP.OK`，表示匯出完成。資料夾中還有約 20 MB 的 `RTOS.BIN` 和 `INFO.TXT`。

如果資料夾中有 `DUMP.ERR`，表示匯出失敗。`DUMP.ERR` 記錄了錯誤代碼。仍然傳送這個資料夾。

如果兩個檔案都沒有，表示相機沒有執行此工具。確認 SD 腳本功能已經開啟，然後重新執行第 4 到第 6 步。

## 傳送檔案

1. 把 `SCRIPT/GRDUMP` 資料夾壓縮成 ZIP。
2. 把 ZIP 附加到一個 [GitHub issue](https://github.com/botnick/GRKU/issues/new) 中。寫明相機型號和韌體版本。

如果開發者在某個 issue 中請你匯出，把 ZIP 附加到那個 issue。ZIP 約 20 MB；GitHub 接受最大 25 MB 的檔案。

## 還原記憶卡

1. 刪除記憶卡上的 `SCRIPT` 資料夾。
2. 如果你在第 2 步製作了備份，把備份的 `SCRIPT` 資料夾複製到記憶卡。

還原備份後，下次開機時 GRKU 會重新載入。若沒有備份，記憶卡會恢復到原本的狀態：等 GRKU 支援你的韌體版本時，再從 https://grku.app 安裝 GRKU。
