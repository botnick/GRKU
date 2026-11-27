// The user manual in zh-Hant, translated from en.ts with the Gemini tools (grku-tools/i18n-th.mjs,
// checked with i18n-review.mjs), never by hand.
import type { DocsContent } from '../types';

export const zhHant: DocsContent = {
  "home": {
    "title": "GRKU 手冊",
    "seoTitle": "GRKU 手冊：RICOH GR III、IIIx、IV 的安裝、底片風格與各項設定",
    "lead": "教你如何安裝 GRKU、在 GR 上使用各項功能，以及排除問題。步驟簡短，用語淺顯。",
    "trust": "GRKU 從記憶卡執行，絕不會修改相機韌體。",
    "need": "需要準備什麼？",
    "tasks": [
      {
        "slug": "install",
        "label": "安裝 GRKU",
        "hint": "首次使用"
      },
      {
        "slug": "firmware",
        "label": "檢查我的韌體版本",
        "hint": "安裝前先看這裡"
      },
      {
        "slug": "controls",
        "label": "在相機上使用 GRKU",
        "hint": "ADJ 與 MENU"
      },
      {
        "slug": "film-look",
        "label": "挑選底片風格",
        "hint": "底片風格"
      },
      {
        "slug": "not-showing",
        "label": "GRKU 沒有出現",
        "hint": "找出原因"
      },
      {
        "slug": "update",
        "label": "更新或解除安裝",
        "hint": "保留你的設定"
      }
    ],
    "rescue": "相機在開機時停住了？",
    "all": "所有頁面",
    "credit": "GRKU 源自 ahonn 開發的 [GRKit](https://github.com/ahonn/GRKit) 程式碼（MIT 授權）。"
  },
  "ui": {
    "docs": "手冊",
    "searchLabel": "搜尋說明書",
    "searchHome": "搜尋，例如：日期、XPan、更新",
    "searchShort": "搜尋說明書",
    "noResults": "找不到符合的內容。",
    "askInstead": "改問 AI 助理",
    "browse": "說明書頁面",
    "previous": "上一頁",
    "next": "下一頁",
    "onThisPage": "本頁內容",
    "stuck": "還是卡關嗎？",
    "report": "寄信給客服",
    "askAi": "向 AI 詢問本頁內容",
    "askAiText": "GRKU 助理會以你的語言回答與本頁相關的問題。",
    "askPrompt": "我正在閱讀說明書頁面「${title}」。請用簡短步驟為我說明。",
    "camera": "相機",
    "firmware": "韌體",
    "modeset": "ModeSet 檔案",
    "ratio": "長寬比",
    "mask": "遮罩",
    "masks": [
      "暗色",
      "黑色",
      "框線"
    ],
    "focal": "焦距",
    "style": "樣式",
    "guides": [
      "三分法",
      "中心",
      "黃金分割",
      "對角線"
    ],
    "settingCol": "在相機上",
    "choicesCol": "選項與功能",
    "defaultMark": "預設",
    "withoutLabel": "無",
    "photoBadge": "相機實拍",
    "readingTime": "${n} 分鐘閱讀",
    "copyStep": "複製此步驟",
    "copiedStep": "已複製",
    "askStep": "詢問 AI 此步驟",
    "askStepPrompt": "在說明書頁面「${title}」中，第 ${n} 步寫道：「${step}」。請簡單地向我解釋這個步驟。",
    "captureBadge": "螢幕截圖",
    "drawnBadge": "依真實選單繪製",
    "updated": "已更新"
  },
  "groups": {
    "start": "開始使用",
    "camera": "在相機上",
    "site": "grku.app 網站",
    "help": "說明"
  },
  "pages": {
    "start": {
      "title": "什麼是 GRKU",
      "sources": [
        "web/src/plus.ts",
        "web/src/generated/modules.ts",
        "web/src/strings/en.ts (faq)",
        "resources/TERMS.md"
      ],
      "seo": "什麼是 GRKU？適用於 RICOH GR III、IIIx 與 IV 的免費底片色彩風格",
      "lead": "GRKU 可從 SD 卡為 RICOH GR 加入軟片風格與照片效果。",
      "keywords": "關於 介紹 總覽 開始 新手 免費 安全 韌體 about introduction overview begin beginner free safe firmware",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKU 是 RICOH GR III、GR IIIx 和 GR IV 的免費 SD 卡擴充功能。你可以從超過 150 種底片風格中挑選，一張記憶卡最多可放 40 種，還包含日期浮水印、顆粒感與 XPan 寬幅構圖等配方與效果。"
        },
        {
          "kind": "p",
          "text": "相機開機時，它從 SD 卡執行。若沒有這張卡，GRKU 不會載入，相機會以原廠設定運作。只有「SD 腳本」這個相機設定會保持**開啟**。GRKU 絕不修改相機韌體。"
        },
        {
          "kind": "h2",
          "id": "need",
          "text": "所需準備"
        },
        {
          "kind": "list",
          "items": [
            "支援的相機與韌體版本。請參閱[支援的相機](doc:cameras)。",
            "相機的記憶卡：GR III 和 GR IIIx 用 SD 卡，GR IV 用 microSD 卡。你平常拍照用的那張卡就可以。",
            "裝有 Chrome 或 Edge 的電腦與讀卡機。若沒有讀卡機，也可以自行將 `GRKU.zip` 複製到記憶卡。"
          ]
        },
        {
          "kind": "h2",
          "id": "how",
          "text": "運作方式"
        },
        {
          "kind": "steps",
          "items": [
            "在 `grku.app` 選擇軟片風格、相機與模組，再寫入 SD 卡。",
            "僅在第一次開機時，按住 {{MENU}} 並開啟相機電源，以啟用 SD 腳本。",
            "依平常方式開機。幾秒後，螢幕上方會顯示 **GRKU**。",
            "拍攝時按下 {{ADJ}}，選擇第六個項目 **GRKU**。"
          ]
        },
        {
          "kind": "h2",
          "id": "free",
          "text": "免費功能與 GRKU Plus 新增內容"
        },
        {
          "kind": "p",
          "text": "網站上所有風格都能免費預覽，你也可以將片庫中的 10 款風格免費放入記憶卡。自己匯入的風格不佔額度。Develop 頁面上的所有模組、配方與試用風格都是免費的。[GRKU Plus](doc:plus) 是一次性付費的選購方案，讓記憶卡能容納更多風格。"
        },
        {
          "kind": "h2",
          "id": "words",
          "text": "本手冊使用的詞彙"
        },
        {
          "kind": "list",
          "items": [
            "**SD card**：相機用來儲存照片的小記憶卡。GR IV 使用 microSD 卡。本手冊將兩者統稱為「卡片」。",
            "**Card reader**：讓電腦可以讀取 SD 卡的小裝置。",
            "**ZIP file**：把很多檔案包在一起的單一檔案，打開後就能取出裡面的檔案。",
            "**Firmware**：由 RICOH 製作、裝在相機裡的軟體。GRKU 絕不會修改它。",
            "**SD scripts**：讓相機從記憶卡執行 GRKU 的設定，只要開啟一次就好。",
            "**ModeSet** 檔案：用來開啟 SD scripts 的檔案，檔名是一串數字，例如 `00078560.636`。",
            "**ADJ lever**：GR 機背螢幕旁邊的小撥桿。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "實驗性功能",
          "text": "GRKU 是實驗性軟體，不提供任何保固。如果安裝失敗，相機可能會卡在開機畫面。安裝前請先閱讀 [開機卡住怎麼辦](doc:stuck)。"
        }
      ]
    },
    "firmware": {
      "title": "查看你的韌體版本",
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
      "seo": "如何查看 RICOH GR III、GR IIIx 或 GR IV 的韌體版本",
      "lead": "按下 MENU 並打開設定選單（扳手圖示）。GRKU 只支援本頁表格中所列的韌體版本。",
      "keywords": "韌體版本 檢查 選單 設定 扳手 關於此裝置 韌體資訊 相機資訊 更新 ricoh 舊版 新版 fwdc bin firmware version check menu setup wrench about this device firmware info camera information update ricoh older newer fwdc bin",
      "blocks": [
        {
          "kind": "p",
          "text": "Firmware 是由 RICOH 製作、裝在相機裡的軟體。每台相機都會在選單中顯示目前的韌體版本，安裝 GRKU 前請先確認。"
        },
        {
          "kind": "h2",
          "id": "check",
          "text": "在相機上找到版本資訊"
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
                    "開啟相機電源。",
                    "按下 {{MENU}}。",
                    "前往設定選單（扳手圖示分頁），開啟 **關於本裝置**。",
                    "選擇 **韌體資訊 / 選項**，然後按右鍵。",
                    "畫面會顯示韌體版本，例如 2.21。"
                  ]
                },
                {
                  "kind": "path",
                  "items": [
                    "MENU",
                    "設定",
                    "關於此裝置",
                    "韌體資訊 / 選項"
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
                    "開啟相機電源。",
                    "按下 {{MENU}}。",
                    "前往設定選單（扳手圖示分頁），選擇 **相機資訊**。",
                    "按右鍵。",
                    "畫面會顯示韌體版本，例如 1.21。"
                  ]
                },
                {
                  "kind": "path",
                  "items": [
                    "MENU",
                    "設定",
                    "相機資訊"
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "p",
          "text": "GR IV Monochrome：[RICOH 這台相機的支援頁面](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html)列出了它的韌體版本。"
        },
        {
          "kind": "h2",
          "id": "supported",
          "text": "GRKU 支援哪些版本？"
        },
        {
          "kind": "flow",
          "steps": [
            {
              "see": "您的版本在表格中。",
              "then": "[安裝 GRKU](doc:install)。"
            },
            {
              "see": "您的版本較舊。",
              "then": "請先從 RICOH 更新相機韌體。請參閱[下方](doc:firmware#older)。"
            },
            {
              "see": "您的版本比表格中的新。",
              "then": "請等待 GRKU 更新。請參閱[下方](doc:firmware#newer)。"
            }
          ]
        },
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GRKU 已在韌體 1.11 的 GR IV 上實際執行過。其他版本與機型的檔案是由同一份程式碼製作，並與 RICOH 韌體檔案比對確認過，但尚未在實機上測試。"
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Edition 相機出廠內建專屬的 1.20 版本，grku.app 尚未提供。請先從 RICOH 將這台相機更新到 1.21。"
        },
        {
          "kind": "h2",
          "id": "older",
          "text": "我的版本比較舊"
        },
        {
          "kind": "p",
          "text": "先更新相機，只從 RICOH 官方支援頁面下載：[GR III](https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html)、[GR IIIx](https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html)、[GR IV](https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html)、[GR IV Monochrome](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html)。照著該頁面的步驟操作。GRKU 不會更新韌體。"
        },
        {
          "kind": "h2",
          "id": "newer",
          "text": "我的版本比表格裡的還新"
        },
        {
          "kind": "p",
          "text": "先不要安裝 GRKU。等 GRKU 更新支援你的版本再安裝。[grku.app 上的最新消息](site:home)會公告時間。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "第一次開機出現韌體更新畫面？",
          "text": "如果卡片裡有相機韌體檔（檔名開頭為 `fwdc` 的 `.bin` 檔），開機時按住 {{MENU}} 會顯示韌體更新畫面。選擇 **Cancel** 並按下 {{OK}}。將相機關機，從卡片刪除該檔案，再試一次。"
        }
      ]
    },
    "install": {
      "title": "安裝 GRKU",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/guide.ts",
        "web/src/strings/en.ts (cardConnect, cardApplyInstall, download)",
        "crates/grku-core/src/runtime/files.rs",
        "resources/images/modeset.png",
        "resources/images/camera-menu.png",
        "resources/images/grku-root.jpg"
      ],
      "seo": "如何在 RICOH GR III、GR IIIx 或 GR IV 上安裝 GRKU",
      "lead": "將 GRKU 寫入 SD 卡，再於相機上啟用 SD 腳本一次。",
      "keywords": "設定 安裝 記憶卡 SD 卡 瀏覽器 壓縮檔 根目錄 模式設定 指令 選單 首次啟動 setup install sd card chrome edge zip sd_root modeset mode set command menu first start",
      "blocks": [
        {
          "kind": "h2",
          "id": "write",
          "text": "從網站寫入記憶卡"
        },
        {
          "kind": "p",
          "text": "在電腦上使用 Chrome 或 Edge，並將 SD 卡放入讀卡機。相機的 USB 傳輸線無法用於此操作。"
        },
        {
          "kind": "art",
          "art": "computer",
          "alt": "電腦開啟 grku.app，記憶卡插入讀卡機。"
        },
        {
          "kind": "steps",
          "items": [
            "開啟 [安裝頁面](site:install)。",
            "選擇你的軟片風格，再選擇相機型號，最後選擇模組。",
            "最後一步選擇 **Write to the SD card**，然後按 **Connect SD card**。選取卡片本身，再允許編輯。",
            "檢查變更清單，然後按下 **安裝 GRKU**。你的照片會留在記憶卡上。",
            "在電腦上退出記憶卡後再取出。"
          ]
        },
        {
          "kind": "p",
          "text": "不確定相機目前的韌體版本？請看[檢查你的韌體版本](doc:firmware)。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "如果畫面不是這樣",
          "text": "沒看到 **連接 SD 卡** 按鈕？請用電腦的 Chrome 或 Edge 開啟此頁面；手機或 Safari 用戶請改用下方的 GRKU.zip。"
        },
        {
          "kind": "h2",
          "id": "zip",
          "text": "或是自己複製 GRKU.zip"
        },
        {
          "kind": "p",
          "text": "適用於其他瀏覽器，也支援手機或使用 Safari 的 Mac。如果 App 內的瀏覽器無法儲存檔案，請改用手機的瀏覽器開啟這個頁面。"
        },
        {
          "kind": "art",
          "art": "copy",
          "alt": "SCRIPT 資料夾、DEVELOP.MOD，以及從 SD_ROOT 複製到記憶卡根目錄（與 DCIM 並列）的 ModeSet 檔案。"
        },
        {
          "kind": "steps",
          "items": [
            "在安裝的最後一步，按下 **下載 GRKU.zip**。",
            "檔案會儲存為 `GRKU-….zip`。將它解壓縮。有些瀏覽器會自動幫你解壓縮。",
            "將 `SD_ROOT` 內的檔案複製到記憶卡的最上層，不要複製資料夾本身。",
            "現在記憶卡的最上層會有 `SCRIPT` 資料夾、`DEVELOP.MOD` 與你的相機模式 Set 檔案。"
          ]
        },
        {
          "kind": "card",
          "alt": "安裝後記憶卡的最上層目錄。",
          "items": [
            [
              "SCRIPT",
              "GRKU 本體，請保留。"
            ],
            [
              "DEVELOP.MOD",
              "第一次啟動時會搭配 ModeSet 檔案使用，之後可以刪除。"
            ],
            [
              "00078560.636",
              "相機的 ModeSet 檔案，用來開啟 SD 腳本：GR III 為 00078350.588，GR IIIx 為 00078490.609，GR IV 為 00078560.636。第一次啟動後可以刪除。"
            ],
            [
              "GRKU",
              "你的設定與底片風格。由網站或相機產生。"
            ],
            [
              "DCIM",
              "你的照片。安裝 GRKU 不會動到它們。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "first-start",
          "text": "首次啟動：開啟 SD 指令"
        },
        {
          "kind": "p",
          "text": "只要做這一次就好。換任何一張記憶卡相機都會保留這個設定，而且之後更新也不用再做一次。"
        },
        {
          "kind": "art",
          "art": "insert",
          "alt": "將記憶卡插入相機的記憶卡插槽。"
        },
        {
          "kind": "steps",
          "items": [
            "關閉相機電源並插入記憶卡。",
            "按住 {{MENU}} 並按下電源鍵。",
            "畫面會顯示 **模式 Set Command**，接著顯示 **Script - 啟用** 與 **Complete**。相機接著會自動關機。",
            "像平常一樣開機，等到螢幕上方出現 **GRKU**。通常需要約 8 到 10 秒，安裝後第一次開機最多可能要大約一分鐘。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "第一次開機請稍候",
          "text": "GRKU 第一次啟動時，請不要關機或取出電池，最多可能要花大約一分鐘。"
        },
        {
          "kind": "screen",
          "screen": "modeset-back",
          "source": "capture",
          "alt": "GR 機背照片，圈出 MENU 按鈕。螢幕顯示 Mode Set Command、Script - Enable 與 Complete。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "如果畫面不是這樣",
          "text": "沒有看到 **Mode Set Command** 畫面嗎？先關機，按住 {{MENU}} 再按電源鍵，繼續按住 {{MENU}} 直到畫面出現。請確認 `DEVELOP.MOD` 與 ModeSet 檔案都在記憶卡最上層，而不是放在資料夾裡。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "出現韌體更新畫面？",
          "text": "記憶卡裡有相機韌體檔（檔名開頭為 `fwdc` 的 `.bin` 檔）。選擇 **Cancel** 並按下 {{OK}}，千萬不要選 Execute。將相機關機，從記憶卡最上層刪除該檔案，再重新做這一步。"
        },
        {
          "kind": "p",
          "text": "完成這一步後，你可以從記憶卡刪除 ModeSet 檔與 `DEVELOP.MOD`。保留 `SCRIPT` 資料夾。"
        },
        {
          "kind": "h2",
          "id": "use",
          "text": "使用 GRKU"
        },
        {
          "kind": "steps",
          "items": [
            "拍照時按下 {{ADJ}}。",
            "選擇 **GRKU**。它通常在第六個位置，如果你在 ADJ 選單順序裡把模組設為獨立項目，位置可能會更往右。",
            "選擇一項功能，例如 **底片風格**，反白選項即可在螢幕上預覽效果。",
            "按 {{OK}} 保留設定。按 {{Fn}} 查看更多設定。"
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "如果畫面不是這樣",
          "text": "ADJ 裡沒有看到 **GRKU**？開機後多等一下再試一次，第一次最多約一分鐘。還是沒有？請看 [GRKU does not show](doc:not-showing)。"
        },
        {
          "kind": "screen",
          "screen": "adj-grku",
          "source": "drawn",
          "alt": "ADJ 在 GRKU 中開啟。左上角顯示 GRKU 與 Recipes（第一個模組），右側垂直排列各模組圖示。"
        },
        {
          "kind": "p",
          "text": "GRKU 載入前拍的照片不會套用 GRKU 效果。所有操作方式請見 [ADJ 與 MENU](doc:controls)。"
        }
      ]
    },
    "controls": {
      "title": "ADJ 與 MENU",
      "sources": [
        "runtime/menu.c",
        "runtime/manage.h",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs",
        "resources/images/grku-menu.jpg"
      ],
      "seo": "如何在 GR 上使用 GRKU：ADJ 撥桿與 MENU",
      "lead": "GRKU 在相機上的位置，以及各按鍵的功能。",
      "keywords": "adj 撥桿 選單 自訂 fn ok 按鍵 選項 順序 啟用 grku 關於 版本 導覽 adj lever menu customize fn ok button options order enable grku about version navigate",
      "blocks": [
        {
          "kind": "h2",
          "id": "adj",
          "text": "ADJ 中的 GRKU"
        },
        {
          "kind": "p",
          "text": "拍照時按下 {{ADJ}} 撥桿，選擇 **GRKU**（通常在第六個）。裡面會列出記憶卡上的模組，例如 **底片風格**、**構圖比例** 與 **粒紋感**。"
        },
        {
          "kind": "modules"
        },
        {
          "kind": "table",
          "head": [
            "按鍵",
            "在 GRKU 中的功能"
          ],
          "rows": [
            [
              "{{ADJ}}",
              "開啟 ADJ。若上次關閉時停在 GRKU，下次開機也會直接進入這裡。"
            ],
            [
              "上、下",
              "移動到模組，或反白選項。支援的項目會在即時預覽中立即顯示。"
            ],
            [
              "{{OK}}",
              "開啟反白選中的模組，或保留反白選中的選項。"
            ],
            [
              "{{Fn}}",
              "執行這一列的額外動作：進入模組的更多設定、切換黃金螺旋的下一個角落，或是對配方執行重新命名與刪除。"
            ],
            [
              "{{MENU}}",
              "返回上一層。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "模組後面的 **啟用** 這一列用來開啟或關閉 GRKU。開啟後，原本開啟的每個模組都會重新啟動。"
        },
        {
          "kind": "h2",
          "id": "menu",
          "text": "MENU 中的 GRKU"
        },
        {
          "kind": "path",
          "items": [
            "MENU",
            "自訂 (C)",
            "GRKU"
          ]
        },
        {
          "kind": "p",
          "text": "每項設定也都在相機選單中。按下 {{MENU}}，前往自訂分頁 (C) 並捲動到最下方：GRKU 區段即包含這些項目。"
        },
        {
          "kind": "screen",
          "screen": "menu-grku",
          "source": "drawn",
          "alt": "MENU 中的 GRKU 區塊，位於 Customize 第 4 頁：Enable GRKU On、GRKU Settings、Recipes、Film Look、Framing、Crop 與 Guides。"
        },
        {
          "kind": "screen",
          "screen": "menu-grku-end",
          "source": "drawn",
          "alt": "GRKU 區塊的結尾：Guides、Date Imprint、Glow、Light Leak、Diffusion、Grain，以及附帶版本號的 About GRKU。"
        },
        {
          "kind": "p",
          "text": "卡片上一般模組的列，由上到下排列。新卡片中，每個模組列都顯示**關閉**，直到你選擇設定為止。"
        },
        {
          "kind": "table",
          "head": [
            "列",
            "顯示內容與功能"
          ],
          "rows": [
            [
              "**啟用 GRKU**",
              "提供**開啟**（預設）與**關閉**選項。可開啟或關閉 GRKU；選擇**開啟**會重新啟動所有已啟用的模組。"
            ],
            [
              "**GRKU 設定**",
              "無數值。開啟 GRKU 本身的設定：**開機啟用**、**拍攝設定**、**顯示設定**、**關機畫面**、**模式轉盤**和 **ADJ 順序**。請參閱 [GRKU 設定](doc:settings)。"
            ],
            [
              "**配方**",
              "相機符合配方時顯示名稱，否則不顯示；GRKU 關閉時顯示**關閉**。開啟配方清單（若未啟用任何配方，僅有**啟用**和**儲存設定**）：可套用、檢視、重新命名或刪除配方，以及**儲存設定**。請參閱 [配方](doc:recipes)。"
            ],
            [
              "**底片風格**",
              "顯示目前使用的風格，或 **關閉**。請參閱 [底片風格](doc:film-look)。"
            ],
            [
              "**構圖比例**",
              "顯示比例，或 **關閉**。請參閱 [構圖比例](doc:framing)。"
            ],
            [
              "**裁切**",
              "顯示焦距，或 **關閉**。請參閱 [裁切](doc:crop)。"
            ],
            [
              "**輔助線**",
              "顯示輔助線，或 **關閉**。請參閱 [輔助線](doc:guides)。"
            ],
            [
              "**加印日期**",
              "顯示日期樣式，或關閉。請參閱 [加印日期](doc:date)。"
            ],
            [
              "**光暈**",
              "開啟時顯示柔光和底片光暈，否則顯示關閉。請參閱 [光暈](doc:glow)。"
            ],
            [
              "**漏光**",
              "顯示外觀樣式，或關閉。請參閱 [漏光](doc:light-leak)。"
            ],
            [
              "**柔光鏡**",
              "開啟時顯示濾鏡和柔和度，否則顯示關閉。請參閱 [柔光鏡](doc:diffusion)。"
            ],
            [
              "**邊框**",
              "僅當 SD 卡上有邊框功能時，位於柔光鏡與粒紋感之間。顯示樣式或關閉。請參閱 [邊框](doc:border)。"
            ],
            [
              "**粒紋感**",
              "顯示強度，或關閉。請參閱 [粒紋感](doc:grain)。"
            ],
            [
              "**關於 GRKU**",
              "顯示卡上的 GRKU 版本（例如 1.11.0），並開啟頁面顯示版本、底片風格數量與網站。必要時會改為顯示**安全模式**或**重新開機後生效**。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "MENU 裡的模組頁面，開頭是 **啟用**（僅限該模組），接著若有提供則顯示 **可選項** 和 **順序**，最後才是其他設定。有些設定只出現在按 {{Fn}} 於 ADJ 開啟的頁面，例如日期樣式和日期位置。"
        },
        {
          "kind": "screen",
          "screen": "menu-photo",
          "source": "photo",
          "alt": "GR IV 上 GRKU 區塊的照片，使用較舊版本的 GRKU，其中配方位於粒紋感之後：輔助線已反白顯示。"
        },
        {
          "kind": "h2",
          "id": "module-rows",
          "text": "模組頁面"
        },
        {
          "kind": "list",
          "items": [
            "**啟用**可單獨開啟或關閉此模組。",
            "**可選項**（有此功能的模組才有）用來選擇 ADJ 顯示的選項。取消勾選不用的底片風格，ADJ 就會跳過它。",
            "**順序**（有此功能的模組才有）用來設定這些選項在 ADJ 裡的排列順序。",
            "其餘各列為該模組的設定，本手冊各頁皆有列出。"
          ]
        },
        {
          "kind": "h2",
          "id": "jpeg",
          "text": "JPEG 與 DNG"
        },
        {
          "kind": "p",
          "text": "GRKU 會套用到 JPEG。DNG 會保留感光元件的原始資料，沒有底片風格。想之後用 GRKU 沖洗 DNG，請看 [RAW 沖洗](doc:raw)。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "保留設定",
          "text": "GRKU 會把你的設定存在記憶卡的 `GRKU` 資料夾裡，關機和更新後也都會保留。"
        }
      ]
    },
    "update": {
      "title": "更新或解除安裝",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/strings/en.ts (updateSteps, removeSteps, uninstall*, scriptsOff*)"
      ],
      "seo": "如何更新或解除安裝 GRKU，以及關閉 SD 腳本",
      "lead": "更新會保留你的設定與底片風格，不用再次按住 MENU。",
      "keywords": "更新 升級 新版本 解除安裝 移除 刪除 記憶卡 腳本 關閉 格式化 備份 update upgrade new version uninstall remove delete sd scripts off format card backup",
      "blocks": [
        {
          "kind": "h2",
          "id": "update-site",
          "text": "從網站更新"
        },
        {
          "kind": "art",
          "art": "computer",
          "alt": "電腦開啟 grku.app，記憶卡插入讀卡機。"
        },
        {
          "kind": "steps",
          "items": [
            "將記憶卡（GR IV 為 microSD）放進讀卡機，並在 Chrome 或 Edge 開啟[安裝頁面](site:install)。",
            "在最後一步，按下**連接 SD 卡**。頁面會顯示變更內容。",
            "按下**更新 GRKU**。",
            "將記憶卡放入相機，並像平常一樣開機。"
          ]
        },
        {
          "kind": "p",
          "text": "要新增或移除底片風格：先連接卡片，再在網站上變更風格，核對變更清單，然後按下寫入按鈕。"
        },
        {
          "kind": "h2",
          "id": "update-zip",
          "text": "從 GRKU.zip 更新"
        },
        {
          "kind": "steps",
          "items": [
            "將相機關機。從記憶卡刪除 `SCRIPT` 資料夾。",
            "從新版 GRKU.zip 的 `SD_ROOT`，只將 `SCRIPT` 資料夾複製到記憶卡的最上層。",
            "將記憶卡放入相機並開機。不要按住 {{MENU}}。"
          ]
        },
        {
          "kind": "h2",
          "id": "uninstall",
          "text": "解除安裝 GRKU"
        },
        {
          "kind": "p",
          "text": "在安裝的最後一步，接上記憶卡並按下 **解除安裝 GRKU**。你可以選擇是否連同設定和底片風格一起刪除，再按 **解除安裝**。也可以關掉相機後，自己刪除 `SCRIPT` 和 `GRKU` 資料夾。你的照片不會受影響。"
        },
        {
          "kind": "h2",
          "id": "scripts-off",
          "text": "關閉 SD 腳本"
        },
        {
          "kind": "p",
          "text": "解除安裝 GRKU 後，SD 腳本仍會保持開啟。只有在你決定不再使用 GRKU 時才需要關閉。"
        },
        {
          "kind": "steps",
          "items": [
            "在安裝的最後一步，用 **關閉 SD 腳本** 把檔案寫入記憶卡。也可以下載檔案後，把 `SD_ROOT` 裡面的東西複製到記憶卡。",
            "插入記憶卡。按住 {{MENU}} 並將相機開機。等到相機自動關機為止。",
            "從記憶卡刪除 ModeSet 檔案與 `DEVELOP.MOD`。"
          ]
        },
        {
          "kind": "h2",
          "id": "format",
          "text": "格式化記憶卡之前"
        },
        {
          "kind": "p",
          "text": "格式化會刪除 GRKU 及其設定。請先將照片與 `GRKU` 資料夾複製到電腦。格式化後重新安裝 GRKU，再將 `GRKU` 資料夾複製回記憶卡的最上層。"
        }
      ]
    },
    "film-look": {
      "title": "底片風格",
      "sources": [
        "modules/film-look/module.toml",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs (film, adjustments)",
        "CHANGELOG.md"
      ],
      "seo": "RICOH GR 底片風格：如何使用底片風格",
      "lead": "提供真實底片與其他相機的風格，具備即時預覽，取代 Image Control。",
      "keywords": "底片風格 效果 影像控制 LUT Portra Classic Chrome Kodak Fuji Fujifilm FinePix 正片 預覽 Fn 參數 底片 film look effect image control lut portra classic chrome kodak fuji fujifilm finepix positive preview fn parameters film stock",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 底片風格"
            ],
            [
              "JPEG",
              "套用風格"
            ],
            [
              "DNG",
              "保留原始數據，不套用風格"
            ]
          ]
        },
        {
          "kind": "steps",
          "items": [
            "按下 {{ADJ}}，選擇 **GRKU**，再選擇 **底片風格**。",
            "高亮選取一個風格。即時預覽會立即顯示該風格及其圖示。",
            "按下 {{OK}} 保留設定。選擇 **關閉** 則不使用風格拍攝。"
          ]
        },
        {
          "kind": "screen",
          "screen": "film-look",
          "source": "drawn",
          "alt": "ADJ 中的 Film Look，Portra 400 已選取。即時預覽顯示該風格效果，Fn 鍵可開啟其調整選項。"
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-portra",
          "label": "Kodak Portra 400",
          "alt": "遮陽傘下的兩張躺椅，左邊是相機標準風格，右邊是 Kodak Portra 400 底片風格。"
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-chrome",
          "label": "Fujifilm Classic Chrome",
          "alt": "同一張照片，分別為標準風格與 Fujifilm Classic Chrome 風格。"
        },
        {
          "kind": "h2",
          "id": "adjust",
          "text": "調整風格"
        },
        {
          "kind": "p",
          "text": "選取一個風格並按下 {{Fn}}。相機會開啟該風格的調整選項，就像影像控制一樣：飽和度、對比、陰影、清晰度，以及相機的其他設定。每個風格都會保留自己的調整值。在 GR III 和 GR IIIx 上，從 [GR IV 檔案取得](doc:looks#ricoh) 的 Cinema Yellow 和 Cinema Green 風格，在 RAW 轉檔時也有三級 **色調** 可選。"
        },
        {
          "kind": "h2",
          "id": "image-control",
          "text": "底片風格與 Image Control"
        },
        {
          "kind": "p",
          "text": "啟用風格時，會取代 Image Control。你的 Image Control 設定不會改變，選擇 **關閉** 時就會恢復。"
        },
        {
          "kind": "h2",
          "id": "menu-rows",
          "text": "在 MENU 中"
        },
        {
          "kind": "table",
          "head": [
            "列",
            "功能說明"
          ],
          "rows": [
            [
              "**膠卷**",
              "選擇風格，功能與 ADJ 相同。"
            ],
            [
              "**效果參數**",
              "套用風格時會顯示。開啟該風格的微調畫面，作用跟 {{Fn}} 一樣。"
            ],
            [
              "**可選項**",
              "選擇 ADJ 會顯示哪些風格。"
            ],
            [
              "**順序**",
              "勾選兩個以上時，設定它們在 ADJ 中的順序。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "which",
          "text": "記憶卡裡有哪些風格"
        },
        {
          "kind": "p",
          "text": "一張記憶卡最多可存放 40 種風格。你可以在 [安裝頁面](site:install) 挑選，也可以先在 [顯影頁面](site:develop) 用自己的照片試用每一種風格。詳見 [在網站上挑選風格](doc:looks)。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "實用提示",
          "text": "這些風格是針對 GR III 感光元件製作的，因此在 GR IV 上的色彩可能會有些微差異。GR IV Monochrome 沒有底片風格，因為它的感光元件沒有色彩。"
        }
      ]
    },
    "recipes": {
      "title": "配方",
      "sources": [
        "modules/recipes/module.toml",
        "runtime/recipe_page.h",
        "crates/grku-core/src/menu_text.rs (recipe_*)",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "GR 底片配方：一鍵儲存與切換設定",
      "lead": "將整套風格連同相機設定存下來，一鍵切換。",
      "keywords": "配方 สูตรสี 預設 儲存 設定 復原 重新命名 刪除 套用 檢視 白平衡 曝光 recipe preset save settings undo rename delete apply view white balance exposure",
      "blocks": [
        {
          "kind": "p",
          "text": "一份配方包含底片風格或 Image Control、粒紋感、光暈、邊框、白平衡，以及相機的校正與曝光設定。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 配方"
            ],
            [
              "配方包含",
              "風格、顆粒、光暈、邊框、白平衡、曝光"
            ],
            [
              "限制",
              "64 個配方，ADJ 中顯示 40 個，可復原 5 次"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "save",
          "text": "儲存配方"
        },
        {
          "kind": "steps",
          "items": [
            "將相機與 GRKU 調整到你喜歡的狀態。",
            "按下 {{ADJ}}，選擇 **GRKU**，再選擇 **配方**。",
            "選擇 **儲存設定**。用相機鍵盤輸入名稱，然後按下 {{OK}}。"
          ]
        },
        {
          "kind": "screen",
          "screen": "recipes",
          "source": "drawn",
          "alt": "尚未儲存任何配方時的 ADJ Recipes：左上角顯示 Save Settings。"
        },
        {
          "kind": "h2",
          "id": "apply",
          "text": "使用配方"
        },
        {
          "kind": "steps",
          "items": [
            "在 **配方** 中反白選取一份配方。即時預覽會顯示效果，畫面左側也會顯示它的設定。",
            "按 {{OK}} 套用。ADJ 會關閉，或是在配方中有設定無法套用時顯示訊息。",
            "配方也會保留 Grain 樣式：系統或類膠片。",
            "改變主意了嗎？選擇 **復原**，就能把配方改動過的相機設定還原，最多可還原最近 5 個配方。"
          ]
        },
        {
          "kind": "list",
          "items": [
            "ADJ 會依序列出 **復原**（有可還原的項目時）、已開啟的配方，最後是 **儲存設定**。",
            "記憶卡最多可存 64 個配方，ADJ 裡最多可開啟其中 40 個。在 MENU 的 **選項** 中選擇要啟用哪些配方。"
          ]
        },
        {
          "kind": "h2",
          "id": "edit",
          "text": "重新命名或刪除"
        },
        {
          "kind": "p",
          "text": "反白選取配方並按下 {{Fn}}，接著選擇**重新命名**或**刪除**。在 MENU 中，每個配方的頁面都有**套用**與**檢視**，可透過圖示查看其設定。"
        },
        {
          "kind": "h2",
          "id": "site",
          "text": "來自網站的配方"
        },
        {
          "kind": "p",
          "text": "在[安裝](site:install)的第 3 步中，你可以加入熱門社群配方或自行建立，再連同你的風格寫入記憶卡。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "配方顯示缺少模組？",
          "text": "包含粒紋感的配方需要記憶卡上有 Grain 模組，Glow 與 Border 也是如此。若配方包含記憶卡上沒有的風格，會顯示**未安裝此效果**。"
        }
      ]
    },
    "framing": {
      "title": "構圖比例",
      "sources": [
        "modules/framing/module.toml",
        "modules/framing/text/en.toml"
      ],
      "seo": "RICOH GR 的 XPan 與其他長寬比（構圖比例）",
      "lead": "以其他長寬比拍攝：XPan、2.35:1、16:9、1:1 等。",
      "keywords": "framing aspect ratio xpan panorama 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 mask frame lines guides only crop 構圖比例 長寬比 寬景 遮罩 框線 輔助線 裁切",
      "blocks": [
        {
          "kind": "frame",
          "mode": "framing",
          "alt": "通往石屋的花園小徑，使用 GRKU 拍攝，畫面上有選定比例的框線。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 構圖比例"
            ],
            [
              "JPEG",
              "裁切至該比例（裁切模式）"
            ],
            [
              "DNG",
              "不裁切至該比例"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "選取一個比例後，即時取景會顯示框線。按 {{OK}} 儲存。在裁切模式下，JPEG 會依比例裁切；DNG 則不會。當 GR WORLD 要求較小的照片時，帶有構圖比例的照片會以較小的副本傳送到手機，長邊約為 1920 像素。"
        },
        {
          "kind": "screen",
          "screen": "framing",
          "source": "drawn",
          "alt": "ADJ 中的 Framing，XPan 已選取。即時預覽將 XPan 框線外的區域變暗。"
        },
        {
          "kind": "settings",
          "module": "framing",
          "notes": {
            "CORE.ASPECT": "照片的比例。3:4 是直式畫面，就像半格相機一樣。",
            "CORE.ASPECT_MODE": "**裁切** 會把 JPEG 裁切成所選比例，DNG 保留完整畫面。**僅輔助構圖** 會顯示框線，並保留整張照片。",
            "MASK": "畫面如何顯示框線外的區域。",
            "LABEL": "在拍攝畫面上顯示比例。"
          }
        },
        {
          "kind": "p",
          "text": "在構圖比例中按下 {{Fn}} 設定**模式**與**遮罩**。3:4 是直幅構圖，就像半格相機。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "搭配裁切",
          "text": "構圖比例可與[裁切](doc:crop)搭配使用：你可以用 50 mm 拍攝 XPan。"
        }
      ]
    },
    "crop": {
      "title": "裁切",
      "sources": [
        "modules/crop/module.toml",
        "modules/crop/text/en.toml",
        "runtime/modules.h (GR IIIx focal lengths)"
      ],
      "seo": "RICOH GR 的 35、50 與 70 mm 裁切模式（裁切）",
      "lead": "就像數位增距鏡一樣以更長的焦距拍攝，並在即時預覽中顯示構圖框。",
      "keywords": "裁切 焦距 35mm 40mm 50mm 70mm 57mm 71mm 100mm 變焦 增距 構圖框 遮罩 未裁切 RAW crop focal length 35mm 40mm 50mm 70mm 57mm 71mm 100mm zoom tele frame only mask uncropped raw",
      "blocks": [
        {
          "kind": "frame",
          "mode": "crop",
          "alt": "通往石屋的花園小徑，使用 GRKU 拍攝，帶有選定焦距的框線。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 裁切"
            ],
            [
              "選項",
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
            "CORE.CROP": "焦距，就像數位增距鏡一樣。GR IIIx 則會改為顯示 50、57、71 與 100 mm。",
            "CORE.CROP_MODE": "**裁切**會裁掉照片。**僅顯示框線**會顯示框線，並保留整張照片。",
            "MASK": "畫面如何顯示框線外的區域。"
          }
        },
        {
          "kind": "p",
          "text": "在「裁切」上按 {{Fn}} 來設定 **模式** 和 **遮罩**。在 GR IV 上，拍攝後立即選擇的焦距會等到該照片儲存完畢才生效，因此最後一張照片絕不會受損；即時取景會立刻顯示新的裁切範圍。當 GR WORLD 要求較小的照片時，裁切後的照片會以較小的副本傳送到手機，長邊約為 1920 像素。在 35、40 和 50 mm 時，即時取景會放大，不顯示框線。在 70 mm 時，它會在 50 mm 的視角中顯示框線；而在 GR IV 上，40 mm 會在 35 mm 的視角中顯示其框線。在裁切模式下，除非 **RAW 不裁切** 已開啟，否則 JPEG 和 DNG 都會被裁切。在 ADJ 中，即時取景會顯示所選焦距的框線。裁切功能適用於所有構圖比例。"
        },
        {
          "kind": "screen",
          "screen": "crop",
          "source": "drawn",
          "alt": "ADJ 中的 Crop，50mm 已選取。即時預覽放大至 50mm 視角。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "在 DNG 中保留完整畫面",
          "text": "在 [GRKU 設定](doc:settings#shooting) 中開啟 **RAW 不裁切**。DNG 就會保留完整的感光元件畫面，而 Lightroom 開啟時會套用你的裁切，你也能隨時還原。"
        }
      ]
    },
    "guides": {
      "title": "輔助線",
      "sources": [
        "modules/guides/module.toml",
        "modules/guides/text/en.toml"
      ],
      "seo": "GR 構圖輔助線：三分法、黃金比例、螺旋",
      "lead": "螢幕上的構圖線，不會出現在照片中。",
      "keywords": "輔助線 格線 三分法 中心 黃金分割 對角線 黃金螺旋 動態對稱 構圖 顯示 不透明度 色彩 guides grid lines thirds center golden ratio diagonals golden spiral dynamic symmetry composition disp opacity color",
      "blocks": [
        {
          "kind": "frame",
          "mode": "guides",
          "alt": "通往石屋的花園小徑，使用 GRKU 拍攝，帶有選定輔助線。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 輔助線"
            ],
            [
              "照片",
              "照片中絕不出現"
            ],
            [
              "{{Fn}}",
              "開啟黃金螺旋"
            ]
          ]
        },
        {
          "kind": "settings",
          "module": "guides",
          "notes": {
            "STYLE": "畫面上的參考線，不會出現在照片中。",
            "COLOR": "參考線的顏色。",
            "OPACITY": "參考線的明顯程度。",
            "DISP": "開啟：當 {{DISP}} 隱藏畫面資訊時，參考線也會隱藏。關閉：一律顯示。",
            "SPIRAL": "**黃金螺旋**往哪個角落轉動。在 ADJ 中反白選取**黃金螺旋**時，按 {{Fn}} 可轉到下一個角落。"
          }
        },
        {
          "kind": "p",
          "text": "在 ADJ 中反白顯示**黃金螺旋**時，按下 {{Fn}} 可將螺旋轉向到下一個角落。GRKU 繪製輔助線時，相機會隱藏自帶的格線。"
        }
      ]
    },
    "date": {
      "title": "加印日期",
      "sources": [
        "modules/date/module.toml",
        "modules/date/text/en.toml",
        "CHANGELOG.md 1.9.0, 1.10.0"
      ],
      "seo": "RICOH GR 照片日期戳記（加印日期）",
      "lead": "像底片相機一樣在照片上印出日期，提供三種字體、五種顏色與自訂文字。",
      "keywords": "date imprint stamp time font classic gr1s gr ii color orange size position corner caption thank you happy birthday grku glow 加印日期 日期戳記 時間 字體 經典 gr1s gr ii 顏色 橘色 大小 位置 角落 文字 感謝 生日快樂 grku 發光",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 加印日期"
            ],
            [
              "JPEG",
              "會印上日期"
            ],
            [
              "DNG",
              "無日期"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-date",
          "label": "加印日期：'YY M D",
          "alt": "遮陽傘下的兩張躺椅，未加印與加印日期的對比：'YY M D，位置為底片右下角，大小 M，經典字體，標準顏色。"
        },
        {
          "kind": "p",
          "text": "反白顯示日期樣式並按下 {{OK}}。按下 {{Fn}} 可調整其他設定。相機會印出內部時鐘的日期與時間，請先設定好時鐘。"
        },
        {
          "kind": "settings",
          "module": "date",
          "notes": {
            "STYLE": "日期的排列順序，可含或不含時間。相機會印出內部時鐘的日期與時間，所以請先設定好時鐘。這不是 MENU 裡的一列項目：請在 ADJ 中選擇，或在那裡按 {{Fn}} 選擇。",
            "POSITION": "**底片**會印在傳統底片相機印的位置。**擺正**會在直式照片中保持字向擺正。這不是 MENU 裡的一列項目：請在 ADJ 中按 {{Fn}} 設定。",
            "CORNER": "日期要印在哪裡。底部左右分列會把日期放在左邊、標題文字放在右邊。",
            "SIZE": "數字的大小。",
            "LOOK": "字體樣式：經典、GR1s（點陣字體）或 GR II。",
            "COLOR": "標準是字體的顏色：經典與 GR II 為橘色，GR1s 為黃色。黑白照片會變成白色。",
            "GLOW": "數字周圍的柔和光暈。GR II 印出的是平面數字，沒有光暈。",
            "CAPTION": "日期前面的文字。照片中會把 <3 顯示成愛心。",
            "ICON": "在拍攝畫面上顯示日期樣式。"
          }
        },
        {
          "kind": "compare",
          "before": "chairs-date-crop",
          "after": "chairs-date-gr1s-crop",
          "beforeLabel": "日期字體：經典",
          "label": "日期字體：GR1s",
          "alt": "照片右下角：左邊使用經典字體的日期，右邊使用 GR1s 字體的日期，其他設定相同。"
        }
      ]
    },
    "glow": {
      "title": "光暈",
      "sources": [
        "modules/glow/module.toml",
        "modules/glow/text/en.toml"
      ],
      "seo": "RICOH GR 的耀光與光暈效果（柔光）",
      "lead": "光源與亮部周圍的柔光，以及電影底片的紅橙色底片光暈。",
      "keywords": "光暈 柔光 底片光暈 電影底片 紅色 橙色 金色 白色 亮部 光源 夜景 glow bloom halation cinestill red orange gold white highlights lights night",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 光暈"
            ],
            [
              "JPEG",
              "僅 JPEG"
            ],
            [
              "即時取景",
              "無預覽：請在回放中確認"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-bloom",
          "label": "柔光：強",
          "alt": "陰天下的雛菊，未開啟與開啟強柔光的效果對比。柔光效果在明亮的高光處最明顯。"
        },
        {
          "kind": "p",
          "text": "光暈有兩個部分。各自有獨立的強度設定，也可以一起使用。"
        },
        {
          "kind": "p",
          "text": "在 ADJ 中選取**柔光 (Bloom)** 或 **Halation**，按 {{Fn}} 可設定其他選項，例如 Halation 的顏色與圖示。"
        },
        {
          "kind": "settings",
          "module": "glow",
          "notes": {
            "BLOOM": "**柔光**：亮部周圍的柔和光暈。",
            "BLOOM_ICON": "在拍攝畫面上顯示柔光圖示。",
            "HALATION": "**底片光暈**：燈光周圍的有色光環，就像 CineStill 底片一樣。",
            "HALATION_COLOR": "光暈的顏色。GR IV Monochrome 沒有這項功能。",
            "HALATION_ICON": "在拍攝畫面上顯示**底片光暈**圖示。"
          }
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "在播放畫面中確認",
          "text": "光暈只會套用在 JPEG，不會顯示在即時預覽中。請在播放畫面查看照片。"
        }
      ]
    },
    "light-leak": {
      "title": "漏光",
      "sources": [
        "modules/lightleak/module.toml",
        "modules/lightleak/text/en.toml",
        "modules/lightleak/lightleak.c"
      ],
      "seo": "GR 的漏光、灰塵與暗角效果",
      "lead": "老底片的痕跡：暗角、灰塵與毛髮、漏光，還有刮痕。",
      "keywords": "漏光 暗角 灰塵 刮痕 褪色 舊底片 復古 light leak vignette dust scratches faded dusty leaky expired old film lomo retro",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 漏光"
            ],
            [
              "JPEG",
              "僅 JPEG"
            ],
            [
              "即時取景",
              "無預覽：請在回放中確認"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-leak",
          "label": "漏光：嚴重",
          "alt": "石屋與花園小徑，未開啟與開啟漏光效果的對比。"
        },
        {
          "kind": "settings",
          "module": "lightleak",
          "notes": {
            "LOOK": "**自訂**會使用下方的強度設定。其他選項是搭配好的組合。",
            "VIGNETTE": "讓邊角變暗。搭配**自訂**使用。",
            "DUST": "灰塵與毛髮。搭配**自訂**使用。",
            "LEAK": "從邊緣透進來、讓底片霧化的光線。搭配**自訂**使用。",
            "SCRATCH": "底片上的刮痕。搭配**自訂**使用。"
          }
        },
        {
          "kind": "p",
          "text": "選 **自訂** 並按 {{Fn}}，就能設定各部分的強度。灰塵、漏光和刮痕在每張照片上的位置都不一樣。漏光只會套用到 JPEG，不會顯示在即時預覽上。"
        }
      ]
    },
    "diffusion": {
      "title": "柔光鏡",
      "sources": [
        "modules/diffusion/module.toml",
        "modules/diffusion/text/en.toml"
      ],
      "seo": "GR 上的黑柔光鏡擴散與底片柔和度",
      "lead": "黑柔光鏡的柔和光暈，以及底片掃描的溫和柔焦感。",
      "keywords": "柔光鏡 濾鏡 黑柔 拉絲光 變形鏡頭 柔和度 底片柔和度 柔和 夢幻 diffusion filter pro mist black mist streak anamorphic softness film softness soft dreamy",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › Diffusion"
            ],
            [
              "JPEG",
              "僅 JPEG"
            ],
            [
              "即時取景",
              "無預覽：請在回放中確認"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-diffusion",
          "label": "濾鏡：1/2",
          "alt": "雛菊，未開啟與開啟 1/2 柔光鏡的效果對比。"
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-softness",
          "label": "底片柔和度：強",
          "alt": "雛菊，未開啟與開啟強底片柔和度的對比。"
        },
        {
          "kind": "p",
          "text": "柔光鏡包含兩個部分：**濾鏡**與**柔和度**。兩者可各自獨立運作。"
        },
        {
          "kind": "settings",
          "module": "diffusion",
          "notes": {
            "STRENGTH": "**濾鏡**：柔焦濾鏡的光暈效果，類似其強度等級。",
            "MIST": "**濾鏡**：像一層薄紗蓋在暗部上。**強度**不是**關閉**時才會生效。",
            "STREAK": "**濾鏡**：點光源出現像變形鏡頭的水平光條。**強度**不是**關閉**時才會生效。",
            "SOFTNESS": "**柔和度**：細節變淡，高光過渡更平滑，就像底片掃描一樣。可單獨使用。"
          }
        },
        {
          "kind": "p",
          "text": "柔光鏡只會套用至 JPEG，且不會顯示在即時預覽中。"
        }
      ]
    },
    "grain": {
      "title": "粒紋感",
      "sources": [
        "modules/grain/module.toml",
        "modules/grain/text/en.toml",
        "modules/grain/grain.c",
        "CHANGELOG.md 1.10.0"
      ],
      "seo": "RICOH GR 的底片顆粒：強度、大小、底片質感",
      "lead": "提供四種強度與四種尺寸的底片顆粒，可選擇相機原有繪製或膠片質感。",
      "keywords": "粒紋感 雜訊 膠片質感 系統 尺寸 強度 弱 中 強 特強 grain noise film-like system size strength weak medium strong extra",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › Grain"
            ],
            [
              "樣式",
              "系統或類膠片"
            ],
            [
              "大小自動",
              "依拍攝 ISO 自動調整"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard-crop",
          "after": "house-grain-crop",
          "label": "粒紋：強，大小中，膠片質感",
          "alt": "石牆與遮篷的全尺寸近拍，未開啟與開啟強粒紋感、大小中、樣式膠片質感的對比。"
        },
        {
          "kind": "settings",
          "module": "grain",
          "notes": {
            "CORE.GRAIN": "顆粒有多明顯。",
            "CORE.GRAIN_SIZE": "顆粒的大小。**自動**會依拍攝時的 ISO 調整。",
            "STYLE": "**系統**是相機本身的顆粒。**膠片質感**是彩色負片印相的顆粒：中間調最明顯，純白與純黑沒有顆粒，在彩色照片中會帶有色彩。",
            "ICON": "在拍攝畫面上顯示顆粒圖示。"
          }
        },
        {
          "kind": "p",
          "text": "在粒紋感按下 {{Fn}} 可設定**大小**與**樣式**。膠片質感採用 Andrea Volpato 的 spektrafilm 粒紋模型。"
        }
      ]
    },
    "border": {
      "title": "邊框",
      "sources": [
        "modules/border/module.toml",
        "modules/border/text/en.toml",
        "CHANGELOG.md 1.8.5",
        "web/src/generated/modules.ts (DEFAULT_MODULES)"
      ],
      "seo": "GR 上的白邊框、黑邊框與拍立得邊框",
      "lead": "在整張照片周圍加上白色或黑色邊框，照片的每個像素都會完整保留。",
      "keywords": "邊框 相框 白色 黑色 細 寬 拍立得 邊緣 border frame white black thin wide instant polaroid edge",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › Border"
            ],
            [
              "JPEG",
              "尺寸隨邊框增加"
            ],
            [
              "DNG",
              "無邊框"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-border-wide",
          "label": "邊框：寬，白色",
          "alt": "石屋，未開啟與開啟白色寬邊框的對比。"
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-border-instant",
          "label": "邊框：拍立得，白色",
          "alt": "石屋，未開啟與開啟白色拍立得邊框的對比。"
        },
        {
          "kind": "settings",
          "module": "border",
          "notes": {
            "CORE.BORDER": "**細**大約是短邊的 3%，**寬**大約 6%，**拍立得**大約 4%，底部則是三倍寬。在 GR IV 上，相機記憶體不足時，大邊框可能會稍微變窄一點。",
            "CORE.BORDER_COLOR": "邊框的顏色。",
            "ICON": "在拍攝畫面上顯示邊框圖示。"
          }
        },
        {
          "kind": "p",
          "text": "JPEG 會隨邊框向外延伸，因此不會遮擋到照片的任何畫面。機內 RAW 顯像也能加入邊框。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "記憶卡裡沒有？",
          "text": "安裝一開始不會加入邊框。在[安裝](site:install)的第 3 步開啟邊框。一張記憶卡最多可放 10 個模組：如果 10 個都開啟，請關掉一個比較少用的。"
        }
      ]
    },
    "mode-dial": {
      "title": "模式轉盤與 U1–U3",
      "sources": [
        "runtime/mode_dial.h",
        "runtime/menu_dial.h",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "模式轉盤上的 GRKU：U1、U2、U3 設定",
      "lead": "在各個轉盤位置開啟或關閉 GRKU，並將完整風格儲存至 U1、U2 或 U3。",
      "keywords": "模式轉盤 自訂模式 儲存目前設定 位置 mode dial u1 u2 u3 user mode save current settings p av tv m sn position",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "自訂 (C)",
            "GRKU",
            "GRKU 設定",
            "模式轉盤"
          ]
        },
        {
          "kind": "p",
          "text": "P、Av、Tv、M 與 Sn（GR IV）共用同一組 GRKU 設定。在 GR IV 上，這一頁的順序是 P、Av、Tv、Sn，接著才是 M。每個位置都可以把 GRKU 設為**開啟**或**關閉**。這些設定會在**啟用 GRKU** 為**開啟**時生效。"
        },
        {
          "kind": "screen",
          "screen": "mode-dial-gr4",
          "source": "drawn",
          "alt": "GR IV 上 GRKU Settings 的 Mode Dial 頁面：P、Av、Tv、Sn、M 與 U1 模式的 GRKU 皆為 On。"
        },
        {
          "kind": "h2",
          "id": "user",
          "text": "U1、U2 與 U3"
        },
        {
          "kind": "list",
          "items": [
            "**開啟**：此位置使用共用的 GRKU 設定，與 P、Av、Tv、M 相同。",
            "**關閉**：此位置拍攝時不使用 GRKU。",
            "**儲存目前設定**：將當下的相機設定與 GRKU 設定存到此位置。覆寫使用者模式前，相機會先詢問，接著開啟鍵盤讓你輸入名稱。轉到該位置時，兩組設定就會一起回來。此位置之後會顯示儲存的名稱。它不會儲存 ADJ 順序、**開機啟用**、**啟用 GRKU** 或**模式轉盤**設定。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "在相機選單中儲存",
          "text": "若使用 RICOH 相機選單再次儲存自訂模式，該位置會失去 GRKU 風格。請改用 GRKU 設定 中的 **儲存目前設定**。"
        }
      ]
    },
    "raw": {
      "title": "RAW 顯像",
      "sources": [
        "runtime/develop_settings.h",
        "runtime/picture.c",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "以底片風格沖洗 GR 的 DNG 檔案（RAW 沖洗）",
      "lead": "GRKU 絕不會修改原始資料。可在相機內使用 GRKU 顯像 DNG，或在電腦上處理。",
      "keywords": "raw dng 顯像 相機內顯像 播放 未裁切 development develop in camera playback lightroom camera raw exiftool xmp uncropped",
      "blocks": [
        {
          "kind": "h2",
          "id": "camera",
          "text": "在相機內"
        },
        {
          "kind": "steps",
          "items": [
            "在播放模式開啟 DNG，並開始 RAW 顯像。",
            "若要變更底片風格，請開啟 Image Control 清單。在風格上按 {{Fn}} 可進行調整。",
            "若要設定**粒紋感**、**光暈**、**邊框**或**加印日期**，請開啟清單最下方的 **GRKU** 項目。",
            "執行顯像。"
          ]
        },
        {
          "kind": "p",
          "text": "如果 DNG 裡有記錄 GRKU 設定，顯影就會從這些設定開始。GRKU 這一列只會改變這份顯影。你也可以在顯影清單中選其他**構圖比例**。"
        },
        {
          "kind": "h2",
          "id": "computer",
          "text": "在電腦上"
        },
        {
          "kind": "p",
          "text": "使用 GRKU 拍攝的照片會將設定記錄在 XMP 中，因此 exiftool 等讀取工具能看到這些資訊。開啟 **RAW 不裁切** 後，Lightroom 與 Camera Raw 會以原始構圖開啟 DNG，你也可以取消該裁切。"
        },
        {
          "kind": "p",
          "text": "對於已有的相片，[顯像頁面](doc:develop)可在瀏覽器中套用相同的風格與效果。"
        }
      ]
    },
    "settings": {
      "title": "GRKU 設定",
      "sources": [
        "runtime/menu_settings.h",
        "runtime/manage.h",
        "runtime/playback_info.h",
        "crates/grku-core/src/menu_text.rs"
      ],
      "seo": "MENU 中的 GRKU 設定：完整說明各選項",
      "lead": "MENU 中 GRKU 本身的設定。",
      "keywords": "grku settings enable at start keep last uncropped raw distance unit meters feet battery playback icons shutdown screen custom picture show text adj order hidden top GRKU 設定 開機啟用 保持上次 RAW 不裁切 距離單位 公尺 英尺 電池 重播圖示 關機畫面 自訂影像 顯示文字 ADJ 選單順序 隱藏 頂部",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "自訂 (C)",
            "GRKU",
            "GRKU 設定"
          ]
        },
        {
          "kind": "table",
          "head": [
            "列",
            "功能說明"
          ],
          "rows": [
            [
              "**開機啟用**",
              "每次開機時的 GRKU 狀態：**開啟**（預設）、**關閉**，或是**保持上次**的狀態。"
            ],
            [
              "**模式轉盤**",
              "各轉盤位置與 U1 至 U3 的 GRKU 開啟或關閉。請參閱[模式轉盤](doc:mode-dial)。"
            ],
            [
              "**ADJ 選單順序**",
              "設定 GRKU 清單中各模組在 ADJ 的順序。"
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "grku-settings",
          "source": "drawn",
          "alt": "GRKU Settings 頁面：Enable at Start、Shooting Settings、Display Settings、Shutdown Screen、Mode Dial 與 ADJ Order。"
        },
        {
          "kind": "p",
          "text": "在相機上，這一頁會列出**開機啟用**、**拍攝設定**、**顯示設定**、**關機畫面**、**模式轉盤**，接著是 **ADJ 選單順序**。每個開關都是開啟排在關閉前面。"
        },
        {
          "kind": "h2",
          "id": "adj-order",
          "text": "ADJ 選單順序"
        },
        {
          "kind": "p",
          "text": "在 GRKU 清單中將模組上下移動。**頂欄 1** 到 **頂欄 4** 會讓模組在 ADJ 工具列中擁有獨立項目（排在 GRKU 之前），按一次即可使用。**隱藏** 會從 ADJ 隱藏模組，但功能仍正常運作。"
        },
        {
          "kind": "h2",
          "id": "shooting",
          "text": "拍攝設定"
        },
        {
          "kind": "table",
          "head": [
            "列",
            "功能說明"
          ],
          "rows": [
            [
              "**RAW 不裁切**",
              "預設為關閉。開啟：每張 DNG 都會保留完整的感光元件畫面，拍攝時的裁切會變成可還原的設定（Lightroom 和 Camera Raw 可取消）。這樣 Lightroom 可能不會套用它自己的 RAW 預設值。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "display",
          "text": "顯示設定"
        },
        {
          "kind": "table",
          "head": [
            "列",
            "功能說明"
          ],
          "rows": [
            [
              "**距離單位**",
              "Snap 對焦距離與手動對焦尺刻度使用**公尺**（預設）或**英尺**。"
            ],
            [
              "**簡單資訊電量**",
              "預設為關閉。開啟時，即時取景的精簡資訊也會顯示電池圖示。"
            ],
            [
              "**電量百分比**",
              "預設為關閉。開啟後，電池電量會以數字顯示，每 2% 為一步。當電池低電量、使用外接電源或相機無法讀取電量時，會恢復顯示一般圖示。"
            ],
            [
              "**播放效果圖示**",
              "在詳細播放資訊的第一頁顯示照片的粒紋、柔光、底片光暈、邊框與加印日期圖示，以及照片的裁切畫面。預設為開啟。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "shutdown",
          "text": "關機畫面"
        },
        {
          "kind": "table",
          "head": [
            "列",
            "功能說明"
          ],
          "rows": [
            [
              "**自訂圖片**",
              "相機關機時顯示你自己的圖片（`GRKU/GOODBYE.JPG`）。預設為開啟。詳見[關機圖片](doc:shutdown)。"
            ],
            [
              "**顯示文字**",
              "預設為開啟。關閉時，相機關機畫面不會畫出拍攝張數與韌體版本。"
            ]
          ]
        }
      ]
    },
    "looks": {
      "title": "在網站上挑選風格",
      "sources": [
        "web/src/plus.ts (FREE_SLOTS)",
        "web/src/lookSearch.ts",
        "web/src/strings/en.ts (importOpen, kindImported)",
        "CHANGELOG.md 1.9.0 (xmp)"
      ],
      "seo": "如何選擇底片風格並匯入 LUT 或 Lightroom 預設集",
      "lead": "為記憶卡挑選底片風格、搜尋片庫，並匯入自己的 LUT。",
      "keywords": "片庫 挑選 風格 搜尋 欄位 免費 10 40 匯入 lut cube xmp lightroom preset 類型 負片 正片 黑白 library choose looks search slots free 10 40 import lut cube xmp lightroom preset kinds negative slide black and white",
      "blocks": [
        {
          "kind": "p",
          "text": "步驟 1 的 [安裝](site:install) 會顯示整個資料庫：Kodak、Fujifilm、Ilford、CineStill、Polaroid、電影與正片風格、黑白底片、FUJIFILM 相機的底片模擬，以及 GRKU 自有的風格，例如 **GR II Positive (GRKU)** 和 FinePix CCD。"
        },
        {
          "kind": "h2",
          "id": "pick",
          "text": "挑選風格"
        },
        {
          "kind": "steps",
          "items": [
            "點選風格，在範例照片上查看效果。",
            "勾選你想放進記憶卡的風格。10 款免費；一張記憶卡最多可放 40 款。",
            "依名稱、品牌或類型搜尋，例如「portra」、「fuji」或「ขาวดำ」。長字稍微拼錯也沒關係。"
          ]
        },
        {
          "kind": "p",
          "text": "想先在自己的照片上看看效果嗎？按下**套用到自己的照片**，即可在[顯影頁面](doc:develop)開啟。"
        },
        {
          "kind": "h2",
          "id": "ricoh",
          "text": "更多理光風格"
        },
        {
          "kind": "p",
          "text": "有些風格內建在其他 RICOH 相機中。GRKU 可以從該相機的官方韌體檔案免費複製這些風格，你可以從 RICOH 下載該檔案。你不需要用這個檔案更新你的相機：GRKU 只會在瀏覽器中讀取其中的風格。這個檔案絕不會上傳。"
        },
        {
          "kind": "steps",
          "items": [
            "在 [安裝](site:install) 的第 1 步，找到 **更多理光風格** 並按 **取得這些風格**。",
            "從 RICOH 網站下載該相機的韌體：若要取得 GR IV 風格，請下載 GR IV 1.11、1.20 或 1.21；若要取得 GR II Positive，請下載 GR II 3.00。",
            "在開啟的視窗中選擇檔案，或將其拖曳到那裡。ZIP 檔案也可以：您不需要解壓縮它。",
            "幾秒鐘後，風格就會出現在清單中。像檢查其他風格一樣確認它們。"
          ]
        },
        {
          "kind": "table",
          "head": [
            "你的相機",
            "可取得的風格"
          ],
          "rows": [
            [
              "GR III、GR IIIx 及其 HDF 型號",
              "來自 GR IV 檔案：Cinema Yellow、Cinema Green、Mono Standard、Mono Solid、Mono Soft、Mono Hi-Contrast、Mono Grainy，以及 Solarized 1 到 3。來自 GR II 檔案：GR II Positive。"
            ],
            [
              "GR IV, GR IV HDF",
              "來自 GR IV 檔案：Mono 風格和 Solarized 1 到 3。來自 GR II 檔案：GR II Positive。"
            ],
            [
              "GR IV Monochrome",
              "無。"
            ]
          ]
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "Solarized",
          "text": "Solarized 1 至 3 僅來自 GR IV 韌體 1.20 或 1.21。"
        },
        {
          "kind": "h2",
          "id": "positive",
          "text": "GR II Positive、GR II Positive (GRKU) 和 GR2 Positive"
        },
        {
          "kind": "p",
          "text": "有三種風格的名稱與 GR II 的**正片**設定很接近，但它們並不相同："
        },
        {
          "kind": "list",
          "items": [
            "**GR II Positive (GRKU)**：GRKU 自有的風格，由人眼從 GR II 照片中調整而成。所有人都可以在資料庫中找到它。以前稱為 Positive GRII，搜尋這個舊名稱仍然可以找到。在相機上顯示為 **GRII Pos. (GRKU)**。",
            "**GR2 Positive**：來自 Imprint 專案的 GR2 **底片風格** LUT，同樣收錄在風格庫中。",
            "**GR II Positive**：來自 GR II 本身的正片設定，從下載並套用到相機「標準」模式的 GR II 韌體檔案中讀取。您可以透過上方的「更多理光風格」取得此風格。"
          ]
        },
        {
          "kind": "h2",
          "id": "import",
          "text": "匯入自己的風格"
        },
        {
          "kind": "steps",
          "items": [
            "在步驟 1，按下**匯入 LUT**。",
            "選擇 `.cube` 檔案或 Lightroom `.xmp` 預設集。",
            "風格會顯示在**你的匯入**下方。像其他風格一樣勾選即可。"
          ]
        },
        {
          "kind": "p",
          "text": "Lightroom 預設集會轉換為其色彩設定的風格。會隨每張照片變化的設定僅供近似參考。"
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "模組"
        },
        {
          "kind": "p",
          "text": "第 3 步會選擇模組。一張記憶卡最多可放 11 個模組中的 10 個；安裝一開始不會加入邊框。第 3 步也會加入配方與[關機畫面](doc:shutdown)。"
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
      "seo": "GRKU Plus：價格、付款方式與金鑰",
      "lead": "一次付費即可解鎖記憶卡上更多底片風格。不使用也能免費使用 GRKU。",
      "keywords": "plus 價格 付款 購買 金鑰 電子郵件 promptpay truemoney 槽位 組合 全部 解鎖 退款 泰銖 plus price pay buy key email promptpay truemoney slots pack everything unlock refund baht",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKU 的所有功能都免費：每款風格都能免費預覽、風格庫中的 10 款風格可免費放進記憶卡，每個模組、配方與「沖印」頁面也都是免費的。GRKU Plus 適合想在記憶卡放入更多風格，並想支持這個專案的人。"
        },
        {
          "kind": "h2",
          "id": "tiers",
          "text": "可解鎖內容"
        },
        {
          "kind": "list",
          "items": [
            "**25 slots**：記憶卡上可放 25 種自選風格，而不是 10 種。",
            "**One pack**：在免費槽位之外，加上單一底片系列的所有風格，例如 Kodak 彩色或黑白。",
            "**Everything**：所有現有與新增風格，記憶卡單次可放 40 種，並解鎖完整 GRKU Studio。"
          ]
        },
        {
          "kind": "p",
          "text": "任何購買也會解鎖完整的 GRKU Studio 與其設計。價格請見 [GRKU Plus](site:plus) 頁面。你之前的付款將計入 Everything 方案與 25 個名額，而非組合包。首發優惠價於 2027 年 1 月 1 日截止。"
        },
        {
          "kind": "h2",
          "id": "pay",
          "text": "付款"
        },
        {
          "kind": "steps",
          "items": [
            "開啟 [GRKU Plus](site:plus) 並選擇要解鎖的項目。",
            "輸入你的電子郵件並同意[使用條款](site:terms)。",
            "使用任何泰國銀行 App 掃描 PromptPay QR 碼付款，再上傳水單。或在表單提供時，貼上 TrueMoney 禮物連結。",
            "風格會立刻解鎖。",
            "金鑰會寄到你的電子郵件信箱，可在各裝置使用。"
          ]
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "退款說明",
          "text": "購買後立即交付，因此不接受因改變主意而退款。若未收到啟動金鑰，或因我方錯誤導致無法解鎖且 14 天內無法修復，將提供全額退款。請參閱[使用條款](site:terms)。"
        },
        {
          "kind": "h2",
          "id": "key",
          "text": "在其他裝置使用金鑰"
        },
        {
          "kind": "p",
          "text": "開啟 [GRKU Plus](site:plus-key)，選擇 **我已有金鑰**，貼上金鑰後按下 **解鎖**。沒收到信？**我已有金鑰** 可以重新寄送。"
        }
      ]
    },
    "shutdown": {
      "title": "關機畫面與 GRKU Studio",
      "sources": [
        "web/src/strings/en.ts (shutdown)",
        "web/src/shutdownDesigns.ts",
        "CHANGELOG.md 1.9.0, 1.10.0",
        "runtime/manage.h (Custom Picture, Show Text)"
      ],
      "seo": "RICOH GR 自訂關機畫面（GRKU Studio）",
      "lead": "相機關機時顯示自訂畫面，或在 GRKU Studio 中設計畫面。",
      "keywords": "關機 畫面 圖片 道別 電源 關閉 studio 設計 貼紙 範本 標誌 自訂 圖片 shutdown screen picture goodbye power off studio design sticker template logo custom picture",
      "blocks": [
        {
          "kind": "p",
          "text": "相機關機時，GRKU 可顯示你選的圖片。相機會從記憶卡讀取 `GRKU/GOODBYE.JPG`。"
        },
        {
          "kind": "h2",
          "id": "choose",
          "text": "選擇圖片"
        },
        {
          "kind": "steps",
          "items": [
            "在[安裝](site:install)的第 3 步，找到關機畫面卡片。",
            "選擇現成設計、自行製作，或選 **關閉** 使用相機原本的畫面。",
            "像平常一樣寫入記憶卡。新畫面會從下次開機起顯示。若使用 GRKU.zip，請一併下載 `GOODBYE.JPG` 並複製到記憶卡的 `GRKU` 資料夾中。"
          ]
        },
        {
          "kind": "p",
          "text": "現成設計包含日落、熟睡的月亮、打盹的貓、底片捲與收據，並可加上自己的文字。自行提供的照片會裁切成 3:2。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "相機無法關機？",
          "text": "損壞的 `GOODBYE.JPG` 可能會讓相機無法關機。取出電池，在電腦上刪除記憶卡裡的 `GRKU/GOODBYE.JPG`，再從網站重新寫入圖片。"
        },
        {
          "kind": "h2",
          "id": "studio",
          "text": "GRKU Studio"
        },
        {
          "kind": "p",
          "text": "GRKU Studio 是多圖層編輯器：提供背景、你的照片、Logo、去背 PNG 檔、八種字型的文字、貼紙、相框，以及潑水節、水燈節、新年與情人節範本。可從工具列、拖放檔案或貼上來新增圖片。"
        },
        {
          "kind": "p",
          "text": "部分 GRKU Studio 功能與部分設計免費提供。購買任一 [GRKU Plus](doc:plus) 即可解鎖全部內容。"
        },
        {
          "kind": "h2",
          "id": "camera",
          "text": "在相機上"
        },
        {
          "kind": "p",
          "text": "在 [GRKU 設定](doc:settings#shutdown) 中，**自訂圖片** 可開啟或關閉圖片，**顯示文字** 則可隱藏相機疊加在畫面上的拍攝張數。"
        }
      ]
    },
    "develop": {
      "title": "沖印頁面",
      "sources": [
        "web/src/components/Develop.tsx",
        "web/src/develop/gating.ts",
        "web/src/develop/install.ts",
        "CHANGELOG.md 1.10.1"
      ],
      "seo": "照片免費線上底片濾鏡（Develop 頁）",
      "lead": "在瀏覽器中為現有照片套用 GRKU 的底片風格與效果。",
      "keywords": "沖印 編輯 照片 瀏覽器 線上 濾鏡 試用 預覽 下載 無需相機 手機 develop edit photo browser online filter try preview download no camera phone",
      "blocks": [
        {
          "kind": "p",
          "text": "[沖印頁面](site:develop) 會在你的照片上顯示 GRKU 的底片風格，效果由相機的模組程式碼產生。不需要相機，照片也絕不會離開你的裝置。"
        },
        {
          "kind": "steps",
          "items": [
            "開啟[沖印頁面](site:develop)並加入照片。",
            "挑選風格後加入效果：光暈、漏光、柔光鏡、底片柔和度、粒紋感、加印日期與邊框。",
            "儲存照片。或按下 **套用至我的 GR**，就會開啟安裝頁面，並帶入已選的風格與模組。每種效果的強度可在相機上設定。"
          ]
        },
        {
          "kind": "p",
          "text": "免費儲存支援相機風格、入門風格或無風格，解析度最高 2048 px，帶有小型 GRKU 浮水印，一次最多 5 張。購買任一 GRKU Plus 方案可儲存所有風格的原尺寸照片，無浮水印，一次最多 50 張。"
        }
      ]
    },
    "assistant": {
      "title": "AI 助理",
      "sources": [
        "web/src/chat/strings.ts",
        "web/src/components/ChatPanel.tsx",
        "services/plus/src/chat/index.ts"
      ],
      "seo": "GRKU AI 助手：詢問 GR 相機與底片風格",
      "lead": "向 GRKU 助理詢問安裝方式、你的相機，或哪款風格適合你的照片。",
      "keywords": "ai 助理 聊天 提問 說明 機器人 吉祥物 記憶 ai assistant chat ask question help bot mascot memory",
      "blocks": [
        {
          "kind": "p",
          "text": "網站頁面右下角的圓形按鈕可開啟 GRKU 助理。它會依照本網站與本手冊的內容回答，並以你的語言回覆，附上對應頁面的連結。"
        },
        {
          "kind": "h2",
          "id": "ask",
          "text": "常見好問題"
        },
        {
          "kind": "list",
          "items": [
            "「我要如何在 GR IIIx 上安裝 GRKU？」",
            "「按住 MENU 時，相機顯示韌體更新。」",
            "「推薦適合人像的暖色調風格。」",
            "「底片光暈有什麼作用？」"
          ]
        },
        {
          "kind": "p",
          "text": "在本手冊的各個頁面中，點選 **Ask AI about this page** 即可針對該頁開啟助理。"
        },
        {
          "kind": "h2",
          "id": "limits",
          "text": "實用提示"
        },
        {
          "kind": "list",
          "items": [
            "每日可傳送的訊息有數量上限。GRKU Plus 使用者可進行更深入的對話並獲得更詳細的解答。",
            "如果你開啟它的記憶功能，瀏覽器會記住你的相機型號、韌體版本與你喜歡的風格，並在你提問時一併送出。",
            "你的訊息會傳送到 AI 服務來產生回覆。請勿輸入個人資料。",
            "AI 可能會出錯。凡涉及相機韌體的資訊，請依本手冊與 RICOH 官方為準。"
          ]
        }
      ]
    },
    "not-showing": {
      "title": "GRKU 沒有出現",
      "sources": [
        "docs/diagnostics.md",
        "resources/INSTALLATION-GR4.md (Troubleshooting)",
        "web/src/strings/en.ts (faq adj)"
      ],
      "seo": "相機沒看到 GRKU 怎麼辦？排除方法",
      "lead": "依序逐一檢查以下項目。",
      "keywords": "未顯示 無法運作 缺少 adj 無 grku 錯誤 install.err report boot.txt 47 48 韌體 模式 設定 not showing not working missing adj no grku error install.err report boot.txt 47 48 firmware mode set",
      "blocks": [
        {
          "kind": "flow",
          "steps": [
            {
              "see": "開機後螢幕頂端沒有顯示 **GRKU**。",
              "then": "第一次使用請等待約一分鐘，然後查看下方的檢查項目。"
            },
            {
              "see": "按住 {{MENU}} 時，相機顯示韌體更新畫面。",
              "then": "選擇 **取消**，然後從記憶卡刪除 `fwdc….bin` 檔案。"
            },
            {
              "see": "按住 {{MENU}} 時，沒有顯示 **Mode Set Command** 畫面。",
              "then": "重新進行 [首次啟動](doc:install#first-start)。"
            },
            {
              "see": "相機開機時卡住了。",
              "then": "請見 [相機開機時卡住](doc:stuck)。"
            }
          ]
        },
        {
          "kind": "h2",
          "id": "checks",
          "text": "依序檢查"
        },
        {
          "kind": "steps",
          "items": [
            "**稍等一下。**開機後 GRKU 約需 8 到 10 秒載入。安裝後第一次啟動最多可能要大約一分鐘：這段期間請勿關機。在那之前的照片沒有 GRKU。",
            "**相機與韌體。** 開啟 MENU 並檢查韌體版本。必須在 [支援的相機](doc:cameras) 名單內。請參閱 [檢查你的韌體版本](doc:firmware)。",
            "**SD 腳本。**首次開機時是否按住 {{MENU}}，並看到 **模式 Set Command** 與 **Complete**？若沒有，請再做一次[首次啟動](doc:install#first-start)。",
            "**檔案位於最上層。**記憶卡的最上層必須有 `SCRIPT` 資料夾，不能放在 `DCIM` 或其他資料夾內。",
            "**讀卡機。**請使用讀卡機寫入記憶卡，不要透過相機的 USB 連接線。",
            "**啟用 GRKU。**在 MENU 的 Customize (C) > GRKU 中，確認**啟用 GRKU** 為開啟，且 GRKU 設定中的**開機啟用**不是關閉。"
          ]
        },
        {
          "kind": "h2",
          "id": "errors",
          "text": "錯誤編號"
        },
        {
          "kind": "p",
          "text": "如果 GRKU 停止運作，記憶卡裡會有 `SCRIPT/GRKU/INSTALL.ERR`。它的第一行是一個數字。成功啟動後，該檔案會消失，改為出現 `SCRIPT/GRKU/INSTALL.OK`。"
        },
        {
          "kind": "table",
          "head": [
            "編號",
            "意義",
            "處理方式"
          ],
          "rows": [
            [
              "47, 48",
              "GRKU 不支援此韌體版本。",
              "確認韌體版本受支援，然後更新 GRKU。若問題仍在，請回報。"
            ],
            [
              "60, 61, 62",
              "啟動程序未完成。",
              "重新寫入記憶卡。若問題仍在，請回報。"
            ],
            [
              "36, 37",
              "GRKU 無法寫入或讀取記憶卡上的規劃檔案。",
              "重新寫入記憶卡。"
            ],
            [
              "30, 31",
              "GRKU 無法讀取底片風格。",
              "重新寫入記憶卡。若問題仍在，請改用另一張記憶卡。"
            ],
            [
              "23, 24",
              "相機設定的變更沒有生效。",
              "把相機關機再重新開機。如果問題還在，請傳送回報。"
            ],
            [
              "其他",
              "GRKU 因其他原因停止運作。",
              "連同編號傳送回報。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "模組名稱後面的數字"
        },
        {
          "kind": "p",
          "text": "沒載入的模組在 MENU 裡名稱後面會顯示數字，`GRKU/REPORT.TXT` 也會列出。GRKU 還是能正常啟動。"
        },
        {
          "kind": "table",
          "head": [
            "編號",
            "意義",
            "處理方式"
          ],
          "rows": [
            [
              "50 至 55, 57",
              "模組沒有載入。",
              "更新 GRKU。若問題仍在，請傳送回報。"
            ],
            [
              "56",
              "在 GR IV Monochrome 上，彩色模組不會載入，這是正常的。",
              "不用做任何事。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "files",
          "text": "報告檔案裡寫了什麼"
        },
        {
          "kind": "list",
          "items": [
            "`GRKU/REPORT.TXT`：記錄 GRKU 版本與韌體版本、每個模組和底片風格的狀態（已載入、已停止或錯誤代碼），以及支援所需的詳細資訊。內容變動時會重新寫入。",
            "`GRKU/BOOT.TXT`：每次開機都有一段文字，記下每個步驟的時間，大約保留最近 20 次開機紀錄。",
            "`SCRIPT/GRKU/INSTALL.ERR`：僅在開機失敗時出現，並包含錯誤編號。"
          ]
        },
        {
          "kind": "h2",
          "id": "report",
          "text": "傳送回報"
        },
        {
          "kind": "p",
          "text": "請將您的相機型號與韌體版本寄至 [support@grku.app](support)，並附上記憶卡中的這些檔案。這些檔案不包含照片。它們可能包含您的底片模擬收納與匯入風格名稱，若您願意，可先開啟查看。"
        },
        {
          "kind": "files",
          "items": [
            [
              "SCRIPT/GRKU/INSTALL.ERR",
              "啟動停止的原因"
            ],
            [
              "GRKU/REPORT.TXT",
              "相機、韌體與 GRKU 版本"
            ],
            [
              "GRKU/BOOT.TXT",
              "開機時發生的狀況"
            ]
          ]
        }
      ]
    },
    "stuck": {
      "title": "相機卡在開機畫面",
      "sources": [
        "resources/RECOVERY.md"
      ],
      "seo": "RICOH GR 卡在開機畫面怎麼辦？救援方法",
      "lead": "GRKU 只會在開機期間暫時套用變更，關機後即還原。取出記憶卡後再重新開機。",
      "keywords": "卡住 當機 凍結 無法開機 黑畫面 變磚 救援 復原 重設 電池 stuck freeze hang frozen not start black screen brick recover recovery reset battery",
      "blocks": [
        {
          "kind": "note",
          "tone": "warning",
          "title": "開始之前",
          "text": "請勿推拉鏡頭筒。官方韌體更新期間切勿斷電。"
        },
        {
          "kind": "flow",
          "steps": [
            {
              "see": "相機開機過程中停住了。",
              "then": "取出電池和記憶卡，然後不插卡開機。"
            },
            {
              "see": "不插卡還是無法開機。",
              "then": "進入播放模式並重置相機設定。"
            },
            {
              "see": "能開機但關不了機。",
              "then": "請見 [關機畫面](doc:shutdown)。"
            }
          ]
        },
        {
          "kind": "h2",
          "id": "without-card",
          "text": "取出記憶卡後開機"
        },
        {
          "kind": "steps",
          "items": [
            "嘗試將相機關機。",
            "若無反應，請取出電池，電池可能發熱。",
            "取出 SD 卡。",
            "裝入充飽電的電池，不要裝卡並開啟相機。"
          ]
        },
        {
          "kind": "h2",
          "id": "still",
          "text": "若仍無法開機"
        },
        {
          "kind": "steps",
          "items": [
            "在未裝卡的情況下，按住播放鍵以播放模式開機。",
            "如果開啟了選單，請重設相機設定。重設會清除你自己的設定。",
            "在未裝卡的情況下重新開機。"
          ]
        },
        {
          "kind": "p",
          "text": "相機開得了卻關不掉時，可能是關機畫面損壞造成的，請看 [關機畫面](doc:shutdown)。如果還是開不了機，請停止使用 GRKU 並聯絡 RICOH 客服。[修復說明](site:recovery) 裡有完整步驟。"
        }
      ]
    },
    "faq": {
      "title": "常見問題",
      "sources": [
        "web/src/strings/en.ts (faq)",
        "runtime/mode_dial.h",
        "resources/INSTALLATION-GR4.md"
      ],
      "seo": "GRKU 常見問題與解答",
      "lead": "解答最常被問到的問題。",
      "keywords": "常見問題 問題 為什麼 第一張 照片 沒有 底片 風格 盒子 召回 格式化 手機 匯入 gr 全球 安全 保固 faq question why first photos no look box recall format phone import gr world safe warranty",
      "blocks": [
        {
          "kind": "h2",
          "id": "first-photos",
          "text": "為什麼一開始拍的照片沒有底片風格？"
        },
        {
          "kind": "p",
          "text": "在 GRKU 載入完成前（開機後約 8 到 10 秒；安裝後第一次開機最長約一分鐘），相機會使用原本的設定。請等畫面頂端出現 **GRKU**。"
        },
        {
          "kind": "h2",
          "id": "dng",
          "text": "為什麼我的 DNG 是 3:2，或沒有底片風格？"
        },
        {
          "kind": "p",
          "text": "GRKU 會修改 JPEG，而 DNG 會保留原始資料。請參閱 [RAW 顯像](doc:raw)。"
        },
        {
          "kind": "h2",
          "id": "user-mode",
          "text": "為什麼自訂模式沒有帶回我的風格？"
        },
        {
          "kind": "p",
          "text": "用 RICOH 相機選單儲存的使用者模式不會保留 GRKU 設定。請使用 [儲存目前設定](doc:mode-dial) 或[配方](doc:recipes)。"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "GRKU 會修改相機韌體嗎？"
        },
        {
          "kind": "p",
          "text": "不會。GRKU 是在相機開機時從記憶卡載入。相機設定中的 SD 腳本會一直維持開啟，直到你[將它關閉](doc:update#scripts-off)。**儲存目前設定**也會存到相機的使用者模式。"
        },
        {
          "kind": "h2",
          "id": "menu-again",
          "text": "更新後或換另一張記憶卡時，還需要再按住 MENU 嗎？"
        },
        {
          "kind": "p",
          "text": "不會。只有第一次需要按住 {{MENU}}。"
        },
        {
          "kind": "h2",
          "id": "version",
          "text": "我的記憶卡裡是哪一個 GRKU 版本？"
        },
        {
          "kind": "p",
          "text": "開啟 MENU。**關於 GRKU** 在「自訂」分頁的 GRKU 區塊最後方。"
        },
        {
          "kind": "h2",
          "id": "phone",
          "text": "為什麼手機無法匯入照片？"
        },
        {
          "kind": "p",
          "text": "安裝 GRKU 不會變更 `DCIM` 資料夾裡的照片。請將 GR WORLD 更新到最新版本。如果還是失敗，請[寄信給客服](support)。"
        },
        {
          "kind": "h2",
          "id": "lightroom",
          "text": "我可以在 Lightroom 中使用這些風格嗎？"
        },
        {
          "kind": "p",
          "text": "無法直接使用。GRKU 不會製作 Lightroom 預設集。請在[修圖頁面](doc:develop)上套用風格試看你的照片。"
        }
      ]
    },
    "cameras": {
      "title": "支援的相機",
      "sources": [
        "web/src/cameras.ts",
        "web/src/generated/cameras.ts",
        "web/src/package.ts"
      ],
      "seo": "GRKU 支援哪些 RICOH GR 相機機型與韌體版本？",
      "lead": "GRKU 搭配官方 RICOH 韌體，可在這些相機與韌體版本上運作。",
      "keywords": "相機 支援 韌體 版本 cameras supported firmware version gr iii iiix iv hdf monochrome modeset dump",
      "blocks": [
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GRKU 已在韌體 1.11 的 GR IV 上實際執行過。其他版本與機型的檔案是由同一份程式碼製作，並與 RICOH 韌體檔案比對確認過，但尚未在實機上測試。"
        },
        {
          "kind": "p",
          "text": "開啟相機的 MENU 以查看韌體版本：請參閱 [檢查您的韌體版本](doc:firmware)。較早的 GR 機型和其他相機不受支援。GR IV Monochrome 具備除底片風格以外的所有模組。"
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Edition 相機出廠內建專屬的 1.20 版本，grku.app 尚未提供。請先從 RICOH 將這台相機更新到 1.21。"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "更新相機韌體"
        },
        {
          "kind": "p",
          "text": "請僅從 RICOH 官方支援網站更新相機韌體，並先確認 GRKU 支援新版本。GRKU 絕不會更新韌體。"
        },
        {
          "kind": "h2",
          "id": "dump",
          "text": "GRKU 尚不支援的韌體"
        },
        {
          "kind": "p",
          "text": "[韌體傾印指南](site:firmware-dump)說明如何為開發者讀取相機韌體，讓 GRKU 得以支援。"
        }
      ]
    }
  }
};
