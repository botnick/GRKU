// The user manual in zh-Hans, translated from en.ts with the Gemini tools (grku-tools/i18n-th.mjs,
// checked with i18n-review.mjs), never by hand.
import type { DocsContent } from '../types';

export const zhHans: DocsContent = {
  "home": {
    "title": "GRKU 说明书",
    "seoTitle": "GRKU 说明书：RICOH GR III、IIIx、IV 安装、胶片风格与各项设置",
    "lead": "了解如何安装 GRKU、在 GR 上使用各项功能以及排查问题。步骤简短，通俗易懂。",
    "trust": "GRKU 从 SD 卡运行，不会更改相机固件。",
    "need": "需要准备什么？",
    "tasks": [
      {
        "slug": "install",
        "label": "安装 GRKU",
        "hint": "首次使用"
      },
      {
        "slug": "firmware",
        "label": "检查我的固件",
        "hint": "安装前先看"
      },
      {
        "slug": "controls",
        "label": "在相机上使用 GRKU",
        "hint": "ADJ 和 MENU"
      },
      {
        "slug": "film-look",
        "label": "选择胶片风格",
        "hint": "胶片风格"
      },
      {
        "slug": "not-showing",
        "label": "GRKU 未显示",
        "hint": "查找原因"
      },
      {
        "slug": "update",
        "label": "更新或卸载",
        "hint": "保留你的设置"
      }
    ],
    "rescue": "相机卡在开机界面？",
    "all": "全部页面",
    "credit": "GRKU 最初基于 ahonn 开发的 [GRKit](https://github.com/ahonn/GRKit) 代码（MIT 协议）。"
  },
  "ui": {
    "docs": "说明书",
    "searchLabel": "搜索手册",
    "searchHome": "搜索，例如：日期、XPan、更新",
    "searchShort": "搜索手册",
    "noResults": "未找到相关内容。",
    "askInstead": "询问 AI 助手",
    "browse": "手册页面",
    "previous": "上一页",
    "next": "下一页",
    "onThisPage": "本页内容",
    "stuck": "仍有疑问？",
    "report": "邮件支持",
    "askAi": "向 AI 询问本页内容",
    "askAiText": "GRKU 助手会用你的语言回答与本页相关的问题。",
    "askPrompt": "我正在阅读手册页面“${title}”。请用简短的步骤向我说明。",
    "camera": "相机",
    "firmware": "固件",
    "modeset": "ModeSet 文件",
    "ratio": "画幅比例",
    "mask": "遮罩",
    "masks": [
      "暗色",
      "黑色",
      "边框线"
    ],
    "focal": "焦距",
    "style": "样式",
    "guides": [
      "三分法",
      "中心",
      "黄金分割",
      "对角线"
    ],
    "settingCol": "在相机上",
    "choicesCol": "选项与功能",
    "defaultMark": "默认",
    "withoutLabel": "无",
    "photoBadge": "相机实拍",
    "readingTime": "${n} 分钟读完",
    "copyStep": "复制此步骤",
    "copiedStep": "已复制",
    "askStep": "向 AI 询问此步骤",
    "askStepPrompt": "在手册页面“${title}”中，第 ${n} 步写着：“${step}”。请简单地向解释这一步。",
    "captureBadge": "相机截屏",
    "drawnBadge": "菜单绘制图",
    "updated": "已更新"
  },
  "groups": {
    "start": "开始使用",
    "camera": "在相机上",
    "site": "在 grku.app 上",
    "help": "帮助"
  },
  "pages": {
    "start": {
      "title": "GRKU 是什么",
      "sources": [
        "web/src/plus.ts",
        "web/src/generated/modules.ts",
        "web/src/strings/en.ts (faq)",
        "resources/TERMS.md"
      ],
      "seo": "什么是 GRKU？适用于 RICOH GR III、IIIx 和 IV 的免费胶片色彩预设",
      "lead": "GRKU 可通过 SD 卡为 RICOH GR 增添胶片色彩与照片效果。",
      "keywords": "关于 简介 概览 开始 新手 免费 安全 固件 about introduction overview begin beginner free safe firmware",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKU 是适用于 RICOH GR III、GR IIIx 和 GR IV 的免费插件。这里有超过 150 种胶片风格可选，单张卡最多可放入 40 款，还支持日期水印、颗粒和 XPan 画幅等配方与效果。"
        },
        {
          "kind": "p",
          "text": "它在相机开机时从 SD 卡运行。取出卡片后，GRKU 不会加载，相机恢复为 RICOH 原厂状态。仅保留“SD 脚本”这一设置开启。GRKU 绝不修改相机固件。"
        },
        {
          "kind": "h2",
          "id": "need",
          "text": "所需准备"
        },
        {
          "kind": "list",
          "items": [
            "受支持的相机型号与固件版本。请参阅[受支持的相机](doc:cameras)。",
            "相机的存储卡：GR III 和 GR IIIx 上是 SD 卡，GR IV 上是 microSD 卡。你平时拍照用的卡就可以。",
            "装有 Chrome 或 Edge 的电脑以及读卡器。若没有读卡器，也可自行将 GRKU.zip 复制到卡中。"
          ]
        },
        {
          "kind": "h2",
          "id": "how",
          "text": "使用方法"
        },
        {
          "kind": "steps",
          "items": [
            "在 grku.app 选择胶片色彩、相机型号与功能模块，随后写入 SD 卡。",
            "仅在首次使用时，开机时按住 {{MENU}}，以开启 SD 脚本功能。",
            "按常规方式开机。数秒后，屏幕顶部会显示 **GRKU**。",
            "拍摄时按下 {{ADJ}}，选择第六项 **GRKU**。"
          ]
        },
        {
          "kind": "h2",
          "id": "free",
          "text": "免费内容与 GRKU Plus 新增内容"
        },
        {
          "kind": "p",
          "text": "网站上的每一种风格都可以免费预览，你还能免费把库里的 10 种风格放到卡上。你自己导入的风格不计入数量。Develop 页面上的每个模块、配方和试用风格都免费。[GRKU Plus](doc:plus) 是可选的一次性付费升级，用来在卡上放更多风格。"
        },
        {
          "kind": "h2",
          "id": "words",
          "text": "本手册中用到的词"
        },
        {
          "kind": "list",
          "items": [
            "**SD 卡**：相机用来保存照片的小存储卡。GR IV 用的是 microSD 卡。本手册里两种卡都会这样称呼。",
            "**读卡器**：让电脑读取 SD 卡的小设备。",
            "**ZIP 文件**：把许多文件打包在一起的文件，打开它就能取出里面的文件。",
            "**固件**：相机内部的软件，由 RICOH 制作。GRKU 绝不会修改它。",
            "**SD 脚本**：相机的一项设置，让相机从存储卡运行 GRKU。只需开启一次。",
            "**ModeSet 文件**：用来开启 SD 脚本的文件。它的文件名是一串数字，例如 `00078560.636`。",
            "**ADJ 拨杆**：GR 机身背面、屏幕旁边的小拨杆。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "实验性功能",
          "text": "GRKU 是实验性软件，不提供保修。如果安装失败，相机可能卡在开机界面。安装前请先阅读[相机卡在开机界面](doc:stuck)。"
        }
      ]
    },
    "firmware": {
      "title": "查看固件版本",
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
      "seo": "如何查看 RICOH GR III、GR IIIx 或 GR IV 的固件版本",
      "lead": "按下 MENU 并打开设置菜单（扳手图标）。GRKU 仅支持本页表格中列出的固件版本。",
      "keywords": "固件 版本 检查 菜单 设置 扳手 关于本机 固件信息 相机信息 更新 firmware version check menu setup wrench about this device firmware info camera information update ricoh older newer fwdc bin",
      "blocks": [
        {
          "kind": "p",
          "text": "固件是相机内部的软件，由 RICOH 制作。每台相机都会在菜单里显示自己的固件版本。安装 GRKU 前请先查看。"
        },
        {
          "kind": "h2",
          "id": "check",
          "text": "查看相机上的版本"
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
                    "打开相机电源。",
                    "按下 {{MENU}}。",
                    "进入设置菜单，切换到扳手图标标签页，打开 **关于本机**。",
                    "选择 **Firmware Info / 可选项**，然后按向右。",
                    "屏幕上会显示固件版本，例如 2.21。"
                  ]
                },
                {
                  "kind": "path",
                  "items": [
                    "MENU",
                    "设置",
                    "关于此设备",
                    "固件信息 / 选项"
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
                    "打开相机电源。",
                    "按下 {{MENU}}。",
                    "进入设置菜单，切换到扳手图标标签页，选择 **相机信息**。",
                    "按向右。",
                    "屏幕上会显示固件版本，例如 1.21。"
                  ]
                },
                {
                  "kind": "path",
                  "items": [
                    "MENU",
                    "设置",
                    "相机信息"
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "p",
          "text": "GR IV Monochrome：请查看[该相机的 RICOH 支持页面](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html)了解固件版本信息。"
        },
        {
          "kind": "h2",
          "id": "supported",
          "text": "GRKU 支持哪些版本？"
        },
        {
          "kind": "flow",
          "steps": [
            {
              "see": "你的版本在表格中。",
              "then": "[安装 GRKU](doc:install)。"
            },
            {
              "see": "你的版本较旧。",
              "then": "请先从 RICOH 更新相机固件。详见[下方](doc:firmware#older)。"
            },
            {
              "see": "你的版本比表格中的新。",
              "then": "等待 GRKU 更新。请参见[下方](doc:firmware#newer)。"
            }
          ]
        },
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GRKU 已在固件 1.11 的 GR IV 上运行过。其他版本和机型的构建基于同一代码，并对照了 RICOH 固件文件，但尚未在相机上实测。"
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Edition 相机出厂自带专属 1.20 版本，grku.app 暂未提供对应版本。请先从 RICOH 更新至 1.21。"
        },
        {
          "kind": "h2",
          "id": "older",
          "text": "我的版本较旧"
        },
        {
          "kind": "p",
          "text": "请先更新相机，且仅从 RICOH 官方支持页面下载：[GR III](https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html)、[GR IIIx](https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html)、[GR IV](https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html)、[GR IV Monochrome](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html)。按页面说明操作。GRKU 不会更新固件。"
        },
        {
          "kind": "h2",
          "id": "newer",
          "text": "我的版本比表格中的更新"
        },
        {
          "kind": "p",
          "text": "暂不安装 GRKU。请等到 GRKU 更新支持你的版本后再安装，详情见 [grku.app 上的最新消息](site:home)。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "首次开机出现固件更新界面？",
          "text": "如果卡里有相机固件文件（名称以 `fwdc` 开头的 `.bin` 文件），开机时按住 {{MENU}} 会显示固件更新界面。选择 **Cancel** 并按下 {{OK}}。关机，从卡里删掉那个文件，然后再试一次。"
        }
      ]
    },
    "install": {
      "title": "安装 GRKU",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/guide.ts",
        "web/src/strings/en.ts (cardConnect, cardApplyInstall, download)",
        "crates/grku-core/src/runtime/files.rs",
        "resources/images/modeset.png",
        "resources/images/camera-menu.png",
        "resources/images/grku-root.jpg"
      ],
      "seo": "如何在 RICOH GR III、GR IIIx 或 GR IV 上安装 GRKU",
      "lead": "将 GRKU 写入 SD 卡，然后在相机上开启一次 SD 脚本功能。",
      "keywords": "设置 安装 SD卡 SD 卡 chrome edge zip sd_root modeset mode set command menu 首次启动",
      "blocks": [
        {
          "kind": "h2",
          "id": "write",
          "text": "从网站写入存储卡"
        },
        {
          "kind": "p",
          "text": "在电脑上使用 Chrome 或 Edge，并将 SD 卡放入读卡器。相机 USB 数据线无法用于此操作。"
        },
        {
          "kind": "art",
          "art": "computer",
          "alt": "一台打开了 grku.app 的电脑，以及一张正放入读卡器的存储卡。"
        },
        {
          "kind": "steps",
          "items": [
            "打开[安装页面](site:install)。",
            "选择胶片风格，再选择相机型号，最后选择模块。",
            "在最后一步，选择 **写入 SD 卡**，然后按下 **连接 SD 卡**。选中 SD 卡本身，再允许编辑。",
            "检查更改列表，然后点击**安装 GRKU**。存储卡上的照片会保留。",
            "在电脑上弹出存储卡后再拔出。"
          ]
        },
        {
          "kind": "p",
          "text": "不确定相机的固件版本？请查看[查看固件版本](doc:firmware)。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "如果画面不是这样",
          "text": "没有 **连接 SD 卡** 按钮？请在电脑上用 Chrome 或 Edge 打开此页面。在手机上或使用 Safari 时，请使用下方的 GRKU.zip。"
        },
        {
          "kind": "h2",
          "id": "zip",
          "text": "或者自己复制 GRKU.zip"
        },
        {
          "kind": "p",
          "text": "其他浏览器也适用，包括手机浏览器或 Mac 上的 Safari。如果应用内的浏览器无法保存文件，请在手机浏览器中打开此页面。"
        },
        {
          "kind": "art",
          "art": "copy",
          "alt": "SCRIPT 文件夹、DEVELOP.MOD 和来自 SD_ROOT 的 ModeSet 文件已复制到存储卡根目录，位于 DCIM 旁边。"
        },
        {
          "kind": "steps",
          "items": [
            "在安装的最后一步点击**下载 GRKU.zip**。",
            "文件会保存为 `GRKU-….zip`。把它解压。有些浏览器会自动帮你解压。",
            "将 `SD_ROOT` 内的内容（而非文件夹本身）复制到存储卡的根目录。",
            "现在存储卡根目录包含 `SCRIPT` 文件夹、`DEVELOP.MOD` 以及你相机的 ModeSet 文件。"
          ]
        },
        {
          "kind": "card",
          "alt": "安装后 SD 卡的根目录。",
          "items": [
            [
              "SCRIPT",
              "GRKU 本体。请保留。"
            ],
            [
              "DEVELOP.MOD",
              "与 ModeSet 文件一起在首次启动时使用。之后可以删除。"
            ],
            [
              "00078560.636",
              "相机的 ModeSet 文件，用于开启 SD 脚本：GR III 上为 00078350.588，GR IIIx 上为 00078490.609，GR IV 上为 00078560.636。首次启动后可以删除。"
            ],
            [
              "GRKU",
              "您的设置与胶片风格。由本网站或相机生成。"
            ],
            [
              "DCIM",
              "你的照片。安装 GRKU 不会影响它们。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "first-start",
          "text": "首次启动：开启 SD 脚本"
        },
        {
          "kind": "p",
          "text": "只需设置一次。相机会记住此设置，换卡也无需重设，日后更新也不用再做。"
        },
        {
          "kind": "art",
          "art": "insert",
          "alt": "将存储卡插入相机的卡槽。"
        },
        {
          "kind": "steps",
          "items": [
            "关闭相机并插入存储卡。",
            "按住 {{MENU}} 并按下电源键。",
            "屏幕显示**Mode Set Command**，随后显示**Script - 启用**和**Complete**。相机会自动关机。",
            "像平时一样打开相机。等屏幕上方出现 **GRKU**。通常需要大约 8 到 10 秒。安装后的首次启动最多可能需要大约一分钟。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "首次启动请等待",
          "text": "GRKU 首次启动时，不要关闭相机或取出电池。这最多可能需要大约一分钟。"
        },
        {
          "kind": "screen",
          "screen": "modeset-back",
          "source": "capture",
          "alt": "GR 相机背面，圈出 MENU 按钮。屏幕显示 Mode Set Command、Script - Enable 和 Complete。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "如果画面不是这样",
          "text": "没有看到 **模式 Set Command** 屏幕？先关机。先按住 {{MENU}}，再按电源键，并一直按住 {{MENU}} 直到屏幕显示。检查 `DEVELOP.MOD` 和 ModeSet 文件是否在卡的根目录，而不是文件夹里。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "出现固件更新屏幕？",
          "text": "卡里有相机固件文件（名称以 `fwdc` 开头的 `.bin` 文件）。选择 **Cancel** 并按下 {{OK}}，切勿选择 Execute。关机，从卡的根目录删除该文件，然后重新执行此步骤。"
        },
        {
          "kind": "p",
          "text": "完成这一步后，你可以从存储卡中删除 ModeSet 文件和 `DEVELOP.MOD`。保留 `SCRIPT` 文件夹。"
        },
        {
          "kind": "h2",
          "id": "use",
          "text": "使用 GRKU"
        },
        {
          "kind": "steps",
          "items": [
            "拍摄时，按下 {{ADJ}}。",
            "选择 **GRKU**。它通常排在第 6 项；如果你在 ADJ 菜单顺序中为各模块设置了独立入口，位置会更靠右。",
            "选择一项功能，例如 **胶片风格**，高亮某个选项即可在屏幕上看到效果。",
            "按 {{OK}} 确认保留。按 {{Fn}} 查看更多设置。"
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "如果画面不是这样",
          "text": "ADJ 里没有 **GRKU**？开机后再多等一会儿再试：首次启动最多需要大约一分钟。还是没有？请查看 [GRKU 不显示](doc:not-showing)。"
        },
        {
          "kind": "screen",
          "screen": "adj-grku",
          "source": "drawn",
          "alt": "ADJ 已打开 GRKU。左上角显示 GRKU 和 Recipes（第一个模块），右侧垂直排列各模块图标。"
        },
        {
          "kind": "p",
          "text": "GRKU 加载前拍摄的照片不会带有 GRKU 效果。有关各种操作方式，请参阅 [ADJ 和 MENU](doc:controls)。"
        }
      ]
    },
    "controls": {
      "title": "ADJ 和 MENU",
      "sources": [
        "runtime/menu.c",
        "runtime/manage.h",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs",
        "resources/images/grku-menu.jpg"
      ],
      "seo": "如何在 GR 上使用 GRKU：ADJ 拨杆与 MENU",
      "lead": "GRKU 在相机的哪个位置，以及每个按键的作用。",
      "keywords": "adj 拨杆 菜单 自定义 fn ok 按钮 选项 顺序 启用 grku 关于 版本 导览 adj lever menu customize fn ok button options order enable grku about version navigate",
      "blocks": [
        {
          "kind": "h2",
          "id": "adj",
          "text": "ADJ 中的 GRKU"
        },
        {
          "kind": "p",
          "text": "拍摄时，按 {{ADJ}} 拨杆并选择 **GRKU**，通常排在第六项。它会列出卡里的模块，例如 **胶片风格**、**画幅** 和 **颗粒感**。"
        },
        {
          "kind": "modules"
        },
        {
          "kind": "table",
          "head": [
            "按键",
            "在 GRKU 中的作用"
          ],
          "rows": [
            [
              "{{ADJ}}",
              "打开 ADJ。如果上次关闭时停留在 GRKU，再次打开也会停在这里，即使关机重启也一样。"
            ],
            [
              "上、下",
              "切换到某个模块，或高亮显示选项。在支持的条件下，实时取景会立即呈现效果。"
            ],
            [
              "{{OK}}",
              "打开当前选中的模块，或确认当前选中的选项。"
            ],
            [
              "{{Fn}}",
              "执行该行的附加操作：进入模块更多设置、切换黄金螺旋线的下一个角落，或对配方进行重命名和删除。"
            ],
            [
              "{{MENU}}",
              "返回。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "模块后面的 **启用** 行用于开启或关闭 GRKU。开启后会重新启动每个已启用的模块。"
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
            "自定义 (C)",
            "GRKU"
          ]
        },
        {
          "kind": "p",
          "text": "每项设置也都位于相机菜单中。打开 {{MENU}}，前往自定义选项卡 (C)，滚动到最底部：GRKU 区域包含以下行。"
        },
        {
          "kind": "screen",
          "screen": "menu-grku",
          "source": "drawn",
          "alt": "MENU 中的 GRKU 部分，位于 Customize 第 4 页：Enable GRKU On、GRKU Settings、Recipes、Film Look、Framing、Crop 和 Guides。"
        },
        {
          "kind": "screen",
          "screen": "menu-grku-end",
          "source": "drawn",
          "alt": "GRKU 部分的末尾：Guides、Date Imprint、Glow、Light Leak、Diffusion、Grain 以及带有版本号的 About GRKU。"
        },
        {
          "kind": "p",
          "text": "从上到下是卡片上的各个模块行。新建卡片时，每个模块行都显示为**关闭**，直到你进行选择。"
        },
        {
          "kind": "table",
          "head": [
            "行",
            "显示内容与功能"
          ],
          "rows": [
            [
              "**启用 GRKU**",
              "提供**开启**（默认）和**关闭**两个选项。用于打开或关闭 GRKU；选择**开启**会启动所有已启用的模块。"
            ],
            [
              "**GRKU 设置**",
              "无值。打开 GRKU 本身的设置：开机启用、拍摄设置、显示设置、关机画面、模式转盘和 ADJ 顺序。参见 [GRKU 设置](doc:settings)。"
            ],
            [
              "**配方**",
              "当相机匹配到配方时显示其名称，否则不显示；GRKU 处于**关闭**状态时也显示**关闭**。点击可打开你的配方列表（若未启用任何配方，仅显示启用和保存设置）：应用、查看、重命名或删除配方，以及保存设置。参见 [配方](doc:recipes)。"
            ],
            [
              "**胶片风格**",
              "显示当前使用的风格，或显示“关闭”。参见 [胶片风格](doc:film-look)。"
            ],
            [
              "**画幅**",
              "显示比例，或显示“关闭”。参见 [画幅](doc:framing)。"
            ],
            [
              "**裁切**",
              "显示焦距，或显示“关闭”。参见 [裁切](doc:crop)。"
            ],
            [
              "**辅助线**",
              "显示辅助线，或显示“关闭”。参见 [辅助线](doc:guides)。"
            ],
            [
              "**加印日期**",
              "显示日期样式，或显示“关闭”。参见[加印日期](doc:date)。"
            ],
            [
              "**光晕**",
              "开启时显示柔光和光晕，或显示“关闭”。参见[光晕](doc:glow)。"
            ],
            [
              "**漏光**",
              "显示效果样式，或显示“关闭”。参见[漏光](doc:light-leak)。"
            ],
            [
              "**柔光镜**",
              "开启时显示滤镜和柔和度，或显示“关闭”。参见[柔光镜](doc:diffusion)。"
            ],
            [
              "**边框**",
              "仅当卡片开启边框时，位于柔光镜和颗粒感之间。显示样式或关闭。参见[边框](doc:border)。"
            ],
            [
              "**颗粒感**",
              "显示强度，或关闭。参见[颗粒感](doc:grain)。"
            ],
            [
              "**关于 GRKU**",
              "显示卡上 GRKU 的版本号（如 1.11.0），并打开一个页面，其中包含版本号、胶片模拟数量及网站链接。如果适用，则显示**安全模式**或**重新开机后生效**。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "MENU 中的模块页面以 **启用**（仅限该模块）开头，接着是 **可选项** 和 **顺序**（如果模块有这些设置），然后是具体设置。部分设置仅在 {{Fn}} 在 ADJ 中打开的页面上可见，例如日期样式和日期位置。"
        },
        {
          "kind": "h2",
          "id": "module-rows",
          "text": "模块页面"
        },
        {
          "kind": "list",
          "items": [
            "**启用**仅开启或关闭当前模块。",
            "**可选项**：在支持的模块中，用来选择 ADJ 显示的胶片风格。取消勾选不用的风格，ADJ 就会跳过它。",
            "**顺序**在有该项的模块中，用来设置这些选项在 ADJ 中的排列顺序。",
            "其余行为该模块的设置，本手册各页面均有列出。"
          ]
        },
        {
          "kind": "h2",
          "id": "jpeg",
          "text": "JPEG 和 DNG"
        },
        {
          "kind": "p",
          "text": "GRKU 会修改 JPEG。DNG 会保留传感器的原始数据，不会套用胶片风格。想以后用 GRKU 冲洗 DNG，请看[RAW 冲洗](doc:raw)。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "设置会保留",
          "text": "GRKU 会把你的设置保存在存储卡的 `GRKU` 文件夹中，关机和更新后也会保留。"
        }
      ]
    },
    "update": {
      "title": "更新或卸载",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/strings/en.ts (updateSteps, removeSteps, uninstall*, scriptsOff*)"
      ],
      "seo": "如何更新或卸载 GRKU，以及关闭 SD 脚本",
      "lead": "更新会保留你的设置和胶片风格，无需再次按住 MENU。",
      "keywords": "更新 升级 新版本 卸载 移除 删除 存储卡 脚本 关闭 格式化 备份 update upgrade new version uninstall remove delete sd scripts off format card backup",
      "blocks": [
        {
          "kind": "h2",
          "id": "update-site",
          "text": "从网站更新"
        },
        {
          "kind": "art",
          "art": "computer",
          "alt": "一台打开了 grku.app 的电脑，以及一张正放入读卡器的存储卡。"
        },
        {
          "kind": "steps",
          "items": [
            "将存储卡（GR IV 为 microSD 卡）插入读卡器，然后在 Chrome 或 Edge 中打开[安装页面](site:install)。",
            "在最后一步，按下**连接 SD 卡**。页面会显示将发生哪些更改。",
            "按下**更新 GRKU**。",
            "将存储卡放入相机，像平时一样开机。"
          ]
        },
        {
          "kind": "p",
          "text": "要添加或移除胶片风格：先连接 SD 卡，再在网站上修改风格，核对变更列表，然后按下写入按钮。"
        },
        {
          "kind": "h2",
          "id": "update-zip",
          "text": "通过 GRKU.zip 更新"
        },
        {
          "kind": "steps",
          "items": [
            "关闭相机。从存储卡中删除 `SCRIPT` 文件夹。",
            "从新 GRKU.zip 的 `SD_ROOT` 中，仅将 `SCRIPT` 文件夹复制到存储卡的根目录。",
            "将存储卡放入相机并开机。不要按住 {{MENU}}。"
          ]
        },
        {
          "kind": "h2",
          "id": "uninstall",
          "text": "卸载 GRKU"
        },
        {
          "kind": "p",
          "text": "在安装的最后一步，连上存储卡并按下**卸载 GRKU**。你可以选择是否连同设置和胶片风格一起删除，然后按下**卸载**。也可以关掉相机，自己删除 `SCRIPT` 和 `GRKU` 文件夹。你的照片不会丢失。"
        },
        {
          "kind": "h2",
          "id": "scripts-off",
          "text": "关闭 SD 脚本"
        },
        {
          "kind": "p",
          "text": "卸载 GRKU 后，SD 脚本仍会保持开启。仅当你永久停止使用 GRKU 时才关闭它们。"
        },
        {
          "kind": "steps",
          "items": [
            "在安装的最后一步，使用**关闭 SD 脚本**把文件写入存储卡。也可以下载文件后，把 `SD_ROOT` 里的内容复制到存储卡。",
            "插入存储卡。按住 {{MENU}} 并开启相机。等待相机自动关机。",
            "从存储卡中删除 ModeSet 文件和 `DEVELOP.MOD`。"
          ]
        },
        {
          "kind": "h2",
          "id": "format",
          "text": "格式化存储卡之前"
        },
        {
          "kind": "p",
          "text": "格式化会删除 GRKU 及其设置。先将你的照片和 `GRKU` 文件夹复制到电脑。格式化后，重新安装 GRKU，然后将 `GRKU` 文件夹复制回存储卡的根目录。"
        }
      ]
    },
    "film-look": {
      "title": "胶片风格",
      "sources": [
        "modules/film-look/module.toml",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs (film, adjustments)",
        "CHANGELOG.md"
      ],
      "seo": "RICOH GR 的胶片风格：如何使用胶片风格",
      "lead": "模拟真实胶片和其他相机的风格，支持实时预览，可替代 Image Control。",
      "keywords": "胶片风格 效果 图像控制 实时预览 参数 胶片 反转片 film look effect image control lut portra classic chrome kodak fuji fujifilm finepix positive preview fn parameters film stock",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 胶片风格"
            ],
            [
              "JPEG",
              "应用风格"
            ],
            [
              "DNG",
              "保留原始数据，无风格"
            ]
          ]
        },
        {
          "kind": "steps",
          "items": [
            "按下 {{ADJ}}，选择 **GRKU**，再选择 **胶片风格**。",
            "高亮一种外观。实时取景会立即显示该外观及其图标。",
            "按下 {{OK}} 确认使用；选择 **关闭** 则不使用任何风格拍摄。"
          ]
        },
        {
          "kind": "screen",
          "screen": "film-look",
          "source": "drawn",
          "alt": "ADJ 中的 Film Look，Portra 400 处于高亮状态。实时取景显示该效果，Fn 键可打开其调整选项。"
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-portra",
          "label": "Kodak Portra 400",
          "alt": "遮阳伞下的两张躺椅，分别展示相机的标准效果和 Kodak Portra 400 胶片效果。"
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-chrome",
          "label": "Fujifilm Classic Chrome",
          "alt": "同一张照片，分别展示标准效果和 Fujifilm Classic Chrome 效果。"
        },
        {
          "kind": "h2",
          "id": "adjust",
          "text": "调整风格"
        },
        {
          "kind": "p",
          "text": "选中一种风格并按下 {{Fn}}，相机会打开该风格的调整项，与 Image Control 类似：饱和度、对比度、暗角、清晰度以及你所用相机支持的其他项目。每种风格各自保存自己的调整设置。"
        },
        {
          "kind": "h2",
          "id": "image-control",
          "text": "胶片风格与 Image Control"
        },
        {
          "kind": "p",
          "text": "开启风格后，它会替代 Image Control。你的 Image Control 原有设置不会改变，选择 **关闭** 时会恢复。"
        },
        {
          "kind": "h2",
          "id": "menu-rows",
          "text": "在 MENU 中"
        },
        {
          "kind": "table",
          "head": [
            "行",
            "功能说明"
          ],
          "rows": [
            [
              "**胶卷**",
              "选择风格，作用与 ADJ 相同。"
            ],
            [
              "**效果参数**",
              "开启胶片风格时显示。和 {{Fn}} 一样，用来打开该风格的调整项。"
            ],
            [
              "**可选项**",
              "选择 ADJ 中显示哪些风格。"
            ],
            [
              "**顺序**",
              "勾选两项或以上时，设置它们在 ADJ 中的顺序。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "which",
          "text": "卡上包含哪些风格"
        },
        {
          "kind": "p",
          "text": "一张卡最多可存放 40 种风格。你可以在[安装页面](site:install)中选择它们，也可以先在[显影页面](site:develop)上用自己的照片试用。请参阅[在网站上选择风格](doc:looks)。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "实用提示",
          "text": "这些风格针对 GR III 传感器制作，因此在 GR IV 上色彩可能会略有不同。GR IV Monochrome 没有色彩传感器，因此没有胶片风格。"
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
      "seo": "GR 胶片配方：一步保存与切换设置",
      "lead": "将整套风格连同相机设置一起保存，一步即可切换。",
      "keywords": "recipe 配方 สูตรสี preset 保存 设置 撤销 重命名 删除 应用 查看 白平衡 曝光 save settings undo rename delete apply view white balance exposure",
      "blocks": [
        {
          "kind": "p",
          "text": "配方包含胶片风格或 Image Control、颗粒感、光晕、边框、白平衡，以及相机的校正和曝光设置。"
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
              "风格、颗粒、光晕、边框、白平衡、曝光"
            ],
            [
              "限制",
              "64 个配方，ADJ 中启用 40 个，5 步撤销"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "save",
          "text": "保存配方"
        },
        {
          "kind": "steps",
          "items": [
            "将相机和 GRKU 调到你喜欢的设置。",
            "按下 {{ADJ}}，选择 **GRKU**，然后选择 **配方**。",
            "选择 **保存设置**。用相机键盘输入名称，然后按下 {{OK}}。"
          ]
        },
        {
          "kind": "screen",
          "screen": "recipes",
          "source": "drawn",
          "alt": "ADJ 中的 Recipes，尚未保存任何配方时：左上角显示 Save Settings。"
        },
        {
          "kind": "h2",
          "id": "apply",
          "text": "使用配方"
        },
        {
          "kind": "steps",
          "items": [
            "在 **配方** 中高亮选中一个配方。实时取景会显示效果，屏幕左侧会显示其设置。",
            "按 {{OK}} 应用。ADJ 菜单会关闭；如果配方中的某项设置无法应用，屏幕上会显示提示信息。",
            "改变主意了？选择 **撤销**。它会恢复配方修改过的所有相机设置，最多可撤销最近 5 个配方。"
          ]
        },
        {
          "kind": "list",
          "items": [
            "ADJ 会列出 **撤销**（有可撤销的操作时）、已开启的胶片配方，最后是 **保存设置**。",
            "存储卡最多保存 64 个配方，其中最多 40 个可在 ADJ 中启用。在 MENU 的 **选项** 中选择要启用的配方。"
          ]
        },
        {
          "kind": "h2",
          "id": "edit",
          "text": "重命名或删除"
        },
        {
          "kind": "p",
          "text": "选中配方并按下 {{Fn}}，然后选择**重命名**或**删除**。在 MENU 中，每个配方的页面都有**应用**和**查看**，后者会用图标显示各项设置。"
        },
        {
          "kind": "h2",
          "id": "site",
          "text": "网站上的配方"
        },
        {
          "kind": "p",
          "text": "在[安装](site:install)的第 3 步中，你可以添加热门社区配方或自建配方，然后连同你的胶片风格一起写入存储卡。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "配方提示缺少模块？",
          "text": "包含颗粒感的配方需要存储卡上有**颗粒感**模块，**光晕**和**边框**同理。若配方使用的风格不在存储卡上，则会提示**未安装此效果**。"
        }
      ]
    },
    "framing": {
      "title": "画幅",
      "sources": [
        "modules/framing/module.toml",
        "modules/framing/text/en.toml"
      ],
      "seo": "RICOH GR 的 XPan 与其他画幅（取景画幅）",
      "lead": "切换其他画幅比例拍摄：XPan、2.35:1、16:9、1:1 等。",
      "keywords": "画幅 画幅比例 宽幅 全景 framing aspect ratio xpan panorama 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 遮罩 画幅框 构图线 仅参考线 裁剪 mask frame lines guides only crop",
      "blocks": [
        {
          "kind": "frame",
          "mode": "framing",
          "alt": "通往石屋的花园小径，使用 GRKU 拍摄，画面带有选定画幅比例的框线。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 画幅"
            ],
            [
              "JPEG",
              "按比例裁切（裁切模式）"
            ],
            [
              "DNG",
              "不按比例裁切"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "选中某个比例，实时取景画面就会显示对应的框线。按 {{OK}} 确认使用。在裁切模式下，JPEG 会按该比例裁切，DNG 则不会裁切。"
        },
        {
          "kind": "screen",
          "screen": "framing",
          "source": "drawn",
          "alt": "ADJ 中的 Framing，XPan 处于高亮状态。实时取景中 XPan 画幅以外的区域变暗。"
        },
        {
          "kind": "settings",
          "module": "framing",
          "notes": {
            "CORE.ASPECT": "照片的画幅比例。3:4 是竖向画幅，就像半格相机。",
            "CORE.ASPECT_MODE": "**裁切** 会将 JPEG 按比例裁剪，DNG 保留完整画面。**仅显示框线** 会显示取景框并保留整张照片。",
            "MASK": "屏幕如何显示取景框外的区域。",
            "LABEL": "在拍摄屏幕上显示画幅比例。"
          }
        },
        {
          "kind": "p",
          "text": "在画幅设置中按下 {{Fn}} 可设置**模式**和**遮罩**。3:4 是竖向画幅，类似半格相机。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "配合裁切",
          "text": "画幅可与[裁切](doc:crop)配合使用：你可以用 50 mm 拍摄 XPan。"
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
      "seo": "RICOH GR 的 35、50 与 70 mm 裁切（数码裁切）",
      "lead": "使用更长焦段拍摄，就像数字增距镜一样，实时取景中会显示画幅框。",
      "keywords": "裁切 焦距 35mm 40mm 50mm 70mm 57mm 71mm 100mm 变焦 长焦 画幅框 仅辅助构图 遮罩 未裁切 raw crop focal length 35mm 40mm 50mm 70mm 57mm 71mm 100mm zoom tele frame only mask uncropped raw",
      "blocks": [
        {
          "kind": "frame",
          "mode": "crop",
          "alt": "通往石屋的花园小径，使用 GRKU 拍摄，画面带有选定焦段的框线。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 裁切"
            ],
            [
              "选项",
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
            "CORE.CROP": "焦段，类似数码增距镜。GR IIIx 会改为显示 50、57、71 和 100 mm。",
            "CORE.CROP_MODE": "**裁切** 会裁剪照片。**仅显示框线** 会显示取景框，并保留整张照片。",
            "MASK": "屏幕如何显示取景框外的区域。"
          }
        },
        {
          "kind": "p",
          "text": "在“裁切”上按 {{Fn}} 可设置 **模式** 和 **遮罩**。在 35、40 和 50 mm 时，实时取景会直接放大，不显示框线。在 70 mm 时，会在 50 mm 的画面中显示框线；在 GR IV 上，40 mm 会在 35 mm 的画面中显示框线。在“裁切”模式下，JPEG 和 DNG 都会被裁剪，除非开启 **RAW 不裁剪**。在 ADJ 中，实时取景会显示当前选中焦段的框线。“裁切”功能适用于所有画幅比例。"
        },
        {
          "kind": "screen",
          "screen": "crop",
          "source": "drawn",
          "alt": "ADJ 中的 Crop，50mm 处于高亮状态。实时取景放大至 50mm。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "在 DNG 中保留完整画面",
          "text": "在 [GRKU 设置](doc:settings#shooting) 中开启 **RAW 不裁切**。这样 DNG 会保留整个传感器的画面，Lightroom 打开时会带上你的裁切设置，且可随时撤销。"
        }
      ]
    },
    "guides": {
      "title": "辅助线",
      "sources": [
        "modules/guides/module.toml",
        "modules/guides/text/en.toml"
      ],
      "seo": "GR 上的构图辅助线：三分法、黄金比例、螺旋线",
      "lead": "屏幕上的构图线条，不会出现在照片中。",
      "keywords": "辅助线 网格线 三分法 中心 黄金分割 对角线 黄金螺线 动态对称 构图 显示 不透明度 颜色 guides grid lines thirds center golden ratio diagonals golden spiral dynamic symmetry composition disp opacity color",
      "blocks": [
        {
          "kind": "frame",
          "mode": "guides",
          "alt": "通往石屋的花园小径，使用 GRKU 拍摄，画面带有选定的辅助线。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 辅助线"
            ],
            [
              "照片",
              "不会出现在照片中"
            ],
            [
              "{{Fn}}",
              "旋转黄金螺旋"
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "guides",
          "source": "drawn",
          "alt": "在 ADJ 中选中 Guides，高亮显示 Thirds。实时取景画面中显示三分法参考线。"
        },
        {
          "kind": "settings",
          "module": "guides",
          "notes": {
            "STYLE": "屏幕上的线条。它们不会出现在照片中。",
            "COLOR": "线条的颜色。",
            "OPACITY": "线条的透明度。",
            "DISP": "开启：当 {{DISP}} 隐藏屏幕信息时，线条也会隐藏。关闭：始终显示。",
            "SPIRAL": "黄金螺线的转向。在 ADJ 中选中黄金螺线后，按 {{Fn}} 可将其转到下一个边角。"
          }
        },
        {
          "kind": "p",
          "text": "在 ADJ 中选中**黄金螺线**后，按下 {{Fn}} 可将螺线转到下一个角落。GRKU 绘制参考线时，相机会隐藏自身的网格线。"
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
      "seo": "RICOH GR 照片上的日期印记（加印日期）",
      "lead": "像胶片相机一样在照片上打印日期，提供三种字体、五种颜色和字幕功能。",
      "keywords": "加印日期 日期 印章 时间 字体 经典 gr1s gr ii 颜色 橙色 大小 位置 角落 字幕 谢谢 生日快乐 grku 辉光 date imprint stamp time font classic gr1s gr ii color orange size position corner caption thank you happy birthday grku glow",
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
              "日期已打印"
            ],
            [
              "DNG",
              "无日期"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-date",
          "label": "加印日期：'YY M D",
          "alt": "遮阳伞下的两张躺椅，分别未添加和添加了日期印：'YY M D，位置为胶片右下角，大小为 M，字体为经典，颜色为标准。"
        },
        {
          "kind": "p",
          "text": "选中日期样式后按 {{OK}}。按 {{Fn}} 查看其他设置。相机会打印机内时钟的日期和时间，请先设置时钟。"
        },
        {
          "kind": "screen",
          "screen": "date",
          "source": "drawn",
          "alt": "在 ADJ 中选中 Date Imprint，高亮显示 'YY M D 样式。日期仅印在 JPEG 照片上，不显示在实时取景画面中。"
        },
        {
          "kind": "settings",
          "module": "date",
          "notes": {
            "STYLE": "日期的排列顺序，可选择是否包含时间。相机打印的是内部时钟的时间，请先校准时钟。此项不在 MENU 列表中：请在 ADJ 中选择，或在 ADJ 中按 {{Fn}} 切换。",
            "POSITION": "**胶片**会将日期打印在胶片相机常见的位置。**摆正**会在竖拍照片中保持日期方向端正。此项不在 MENU 列表中：请在 ADJ 中按 {{Fn}} 设置。",
            "CORNER": "日期的位置。底部分列会把日期放在左侧，说明放在右侧。",
            "SIZE": "数字的大小。",
            "LOOK": "字体样式：Classic、GR1s（点阵）或 GR II。",
            "COLOR": "标准指字体的颜色：Classic 和 GR II 为橙色，GR1s 为黄色。黑白照片会显示为白色。",
            "GLOW": "数字周围的柔和光晕。GR II 的数字是平面的，没有光晕。",
            "CAPTION": "日期前的一个词。照片中会把 <3 显示为爱心。",
            "ICON": "在拍摄屏幕上显示日期样式。"
          }
        },
        {
          "kind": "compare",
          "before": "chairs-date-crop",
          "after": "chairs-date-gr1s-crop",
          "beforeLabel": "日期字体：经典",
          "label": "日期字体：GR1s",
          "alt": "照片右下角：左侧为经典字体的日期，右侧为 GR1s 字体的日期，其他设置相同。"
        }
      ]
    },
    "glow": {
      "title": "光晕",
      "sources": [
        "modules/glow/module.toml",
        "modules/glow/text/en.toml"
      ],
      "seo": "RICOH GR 的柔光与光晕（弥散光晕）",
      "lead": "灯光与高光周围的柔光，以及电影胶片的红橙色胶片光晕。",
      "keywords": "光晕 柔光 胶片光晕 电影胶片 红色 橙色 金色 白色 高光 灯光 夜景 glow bloom halation cinestill red orange gold white highlights lights night",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › 光晕"
            ],
            [
              "JPEG",
              "仅 JPEG"
            ],
            [
              "实时取景",
              "无预览：请在回放中查看"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-bloom",
          "label": "柔光：强",
          "alt": "阴天里的雏菊，未开启和开启强柔光的效果对比。柔光在明亮的高光处最明显。"
        },
        {
          "kind": "p",
          "text": "光晕包含两部分。每部分都有各自的强度，你也可以同时使用。"
        },
        {
          "kind": "p",
          "text": "在 ADJ 中，选中**柔光**或**胶片光晕**并按 {{Fn}}，可调整其他设置，例如胶片光晕的颜色和图标。"
        },
        {
          "kind": "settings",
          "module": "glow",
          "notes": {
            "BLOOM": "**柔光**：明亮区域周围的柔和光晕。",
            "BLOOM_ICON": "在拍摄屏幕上显示柔光图标。",
            "HALATION": "**胶片光晕**：灯光周围的彩色光环，就像 CineStill 胶片上的效果。",
            "HALATION_COLOR": "光晕的颜色。不适用于 GR IV Monochrome。",
            "HALATION_ICON": "在拍摄屏幕上显示胶片光晕图标。"
          }
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "在回放中查看",
          "text": "光晕仅更改 JPEG，不会显示在实时取景中。请在回放中查看照片。"
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
      "seo": "GR 上的漏光、灰尘与暗角效果",
      "lead": "老胶片的痕迹：暗角、灰尘和毛发、漏光与划痕。",
      "keywords": "漏光 暗角 灰尘 发丝 划痕 褪色 多尘 过期 老胶片 复古 light leak vignette dust scratches faded dusty leaky expired old film lomo retro",
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
              "仅 JPEG"
            ],
            [
              "实时取景",
              "无预览：请在回放中查看"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-leak",
          "label": "漏光：明显",
          "alt": "石屋和花园小径，未开启和开启漏光效果（强度设为“漏光”）的对比。"
        },
        {
          "kind": "screen",
          "screen": "light-leak",
          "source": "drawn",
          "alt": "在 ADJ 中选中 Light Leak，高亮显示 Faded。"
        },
        {
          "kind": "settings",
          "module": "lightleak",
          "notes": {
            "LOOK": "**自定义**使用你在下方的设定。其他选项是预设搭配。",
            "VIGNETTE": "角落更暗。搭配**自定义**使用。",
            "DUST": "灰尘和毛发。搭配**自定义**使用。",
            "LEAK": "从边缘渗入的光线，使胶片产生雾化效果。搭配**自定义**使用。",
            "SCRATCH": "胶片上的划痕。搭配**自定义**使用。"
          }
        },
        {
          "kind": "p",
          "text": "选择**自定义**并按 {{Fn}}，可设置各部分的强度。灰尘、漏光和划痕在每张照片上的位置都不一样。漏光只修改 JPEG，不会在实时取景中显示。"
        }
      ]
    },
    "diffusion": {
      "title": "柔光镜",
      "sources": [
        "modules/diffusion/module.toml",
        "modules/diffusion/text/en.toml"
      ],
      "seo": "GR 上的黑柔光镜扩散与胶片柔和度",
      "lead": "类似黑柔滤镜的柔和光晕，以及胶片扫描般的细腻柔和感。",
      "keywords": "柔光镜 滤镜 黑柔 拉丝光 变形镜头 柔和 胶片柔和 梦幻 diffusion filter pro mist black mist streak anamorphic softness film softness soft dreamy",
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
              "仅 JPEG"
            ],
            [
              "实时取景",
              "无预览：请在回放中查看"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-diffusion",
          "label": "滤镜：1/2",
          "alt": "雏菊，未开启和开启1/2强度柔光镜的效果对比。"
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-softness",
          "label": "胶片柔和度：强",
          "alt": "雏菊，对比未开启和开启强胶片柔和度的效果。"
        },
        {
          "kind": "p",
          "text": "柔光镜包含两部分：**滤镜**和**柔和度**。两部分可单独生效。"
        },
        {
          "kind": "settings",
          "module": "diffusion",
          "notes": {
            "STRENGTH": "**滤镜**：柔光镜的光晕效果，类似它的不同等级。",
            "MIST": "**滤镜**：阴影上的一层薄雾。在**强度**不为**关闭**时生效。",
            "STREAK": "**滤镜**：点光源上的变形镜头水平眩光。在**强度**不为**关闭**时生效。",
            "SOFTNESS": "**柔和度**：细微细节变淡，高光过渡更柔和，就像胶片扫描一样。可单独生效。"
          }
        },
        {
          "kind": "p",
          "text": "柔光镜仅改变 JPEG，不会在实时取景中显示。"
        }
      ]
    },
    "grain": {
      "title": "颗粒感",
      "sources": [
        "modules/grain/module.toml",
        "modules/grain/text/en.toml",
        "modules/grain/grain.c",
        "CHANGELOG.md 1.10.0"
      ],
      "seo": "RICOH GR 胶片颗粒感：强度、尺寸、胶片质感",
      "lead": "四种强度与四种尺寸的胶片颗粒，支持相机原生绘制或胶片质感。",
      "keywords": "颗粒 噪点 胶片质感 系统 尺寸 强度 弱 中 强 特强 grain noise film-like system size strength weak medium strong extra",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "位置",
              "ADJ › GRKU › Grain"
            ],
            [
              "样式",
              "系统或胶片风格"
            ],
            [
              "大小 自动",
              "跟随拍摄的 ISO"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard-crop",
          "after": "house-grain-crop",
          "label": "颗粒感：强，大小中，胶片质感",
          "alt": "石墙和遮阳篷的全尺寸特写，未开启和开启颗粒感（强度强、大小中、样式胶片质感）的效果对比。"
        },
        {
          "kind": "screen",
          "screen": "grain",
          "source": "drawn",
          "alt": "在 ADJ 中选中 Grain，高亮显示 Medium。颗粒效果仅应用于照片，不显示在实时取景画面中。"
        },
        {
          "kind": "settings",
          "module": "grain",
          "notes": {
            "CORE.GRAIN": "颗粒的强度。",
            "CORE.GRAIN_SIZE": "颗粒的大小。**自动**会跟随拍摄时的 ISO。",
            "STYLE": "**系统**是相机自带的颗粒。**胶片质感**模拟彩色负片的颗粒：中间调最强，纯白或纯黑处无颗粒，在彩色照片中呈现彩色颗粒。",
            "ICON": "在拍摄屏幕上显示颗粒图标。"
          }
        },
        {
          "kind": "p",
          "text": "在颗粒感上按 {{Fn}} 键可设置**大小**和**样式**。胶片质感采用 Andrea Volpato 的 spektrafilm 颗粒模型。"
        }
      ]
    },
    "border": {
      "title": "边框",
      "sources": [
        "modules/border/module.toml",
        "modules/border/text/en.toml",
        "CHANGELOG.md 1.8.5",
        "web/src/generated/modules.ts (DEFAULT_MODULES)"
      ],
      "seo": "GR 上的白边、黑边与拍立得相纸边框",
      "lead": "照片四周添加白色或黑色边框，完整保留每一个像素。",
      "keywords": "边框 相框 白边 黑边 细边 宽边 拍立得 边缘 border frame white black thin wide instant polaroid edge",
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
              "随边框尺寸增加"
            ],
            [
              "DNG",
              "无边框"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-border-wide",
          "label": "边框：宽，白色",
          "alt": "石屋，未添加和添加白色宽边框的效果对比。"
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-border-instant",
          "label": "边框：拍立得，白色",
          "alt": "石屋，未添加和添加白色拍立得边框的效果对比。"
        },
        {
          "kind": "screen",
          "screen": "border",
          "source": "drawn",
          "alt": "在 ADJ 中选中 Border，高亮显示 Thin。边框将添加在 JPEG 照片周围。"
        },
        {
          "kind": "settings",
          "module": "border",
          "notes": {
            "CORE.BORDER": "**细**约为短边的 3%，**宽**约为 6%，**拍立得**约为 4%（底边宽度是其三倍）。在 GR IV 上，若内存不足，大边框可能会略窄。",
            "CORE.BORDER_COLOR": "边框的颜色。",
            "ICON": "在拍摄屏幕上显示边框图标。"
          }
        },
        {
          "kind": "p",
          "text": "JPEG 画面会随边框向外扩展，不会遮挡照片内容。机内 RAW 显像也可添加边框。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "存储卡中没有？",
          "text": "安装时默认不包含边框。在[安装](site:install)的第 3 步中，开启边框。一张存储卡最多支持 10 个模块：如果 10 个都已开启，请关闭一个不常用的模块。"
        }
      ]
    },
    "mode-dial": {
      "title": "模式转盘与 U1–U3",
      "sources": [
        "runtime/mode_dial.h",
        "runtime/menu_dial.h",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "模式转盘上的 GRKU：U1、U2、U3 设置",
      "lead": "在每个转盘位置开启或关闭 GRKU，并将整套外观保存到 U1、U2 或 U3。",
      "keywords": "模式转盘 用户模式 保存当前设置 位置 mode dial u1 u2 u3 user mode save current settings p av tv m sn position",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "自定义 (C)",
            "GRKU",
            "GRKU 设置",
            "**模式转盘**"
          ]
        },
        {
          "kind": "p",
          "text": "P、Av、Tv、M 和 Sn（GR IV）共用一套 GRKU 设置。在 GR IV 上，页面列出的是 P、Av、Tv、Sn，然后是 M。每个位置都可以将 GRKU 设为**开启**或**关闭**。这些设置会在**启用 GRKU**处于开启状态时生效。"
        },
        {
          "kind": "screen",
          "screen": "mode-dial-gr4",
          "source": "drawn",
          "alt": "GR IV 上 GRKU Settings 的 Mode Dial 页面：P、Av、Tv、Sn、M 和 U1 模式下 GRKU 均为 On。"
        },
        {
          "kind": "h2",
          "id": "user",
          "text": "U1、U2 和 U3"
        },
        {
          "kind": "list",
          "items": [
            "**开启**：该位置使用共用的 GRKU 设置，与 P、Av、Tv 和 M 相同。",
            "**关闭**：该位置拍摄时不使用 GRKU。",
            "**保存当前设置**：将当前的相机和 GRKU 设置保存到此位置。覆盖用户模式前相机会先询问，并打开键盘让你输入名称。转到该位置即可恢复这两项设置。该位置会显示保存的名称。注意：不会保存 ADJ 顺序、**开机启用**、**启用 GRKU** 或 **模式转盘** 设置。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "在相机菜单中保存",
          "text": "如果再次通过 RICOH 相机菜单保存用户模式，该位置将丢失 GRKU 外观。请改用 GRKU 设置中的**保存当前设置**。"
        }
      ]
    },
    "raw": {
      "title": "RAW 显像",
      "sources": [
        "runtime/develop_settings.h",
        "runtime/picture.c",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "使用胶片效果冲洗 GR DNG 文件（RAW 冲洗）",
      "lead": "GRKU 不会更改原始数据。可在相机中使用 GRKU 显像 DNG，或在电脑上处理。",
      "keywords": "raw dng 显像 机内显像 回放 lightroom camera raw exiftool xmp 未裁剪 development develop in camera playback uncropped",
      "blocks": [
        {
          "kind": "h2",
          "id": "camera",
          "text": "在相机中"
        },
        {
          "kind": "steps",
          "items": [
            "在回放中打开 DNG 并开始 RAW 显像。",
            "要更改胶片外观，请打开 Image Control 列表。在某个外观上按 {{Fn}} 进行调整。",
            "要设置颗粒感、光晕、边框或加印日期，请打开列表末尾的 **GRKU** 行。",
            "执行显影。"
          ]
        },
        {
          "kind": "p",
          "text": "显影会从 DNG 记录的 GRKU 设置开始（如果其中包含这些设置）。GRKU 这一行只改变本次显影。你还可以在显影列表中选择其他**画幅**比例。"
        },
        {
          "kind": "h2",
          "id": "computer",
          "text": "在电脑上"
        },
        {
          "kind": "p",
          "text": "开启 GRKU 后拍摄的照片会将设置记录在 XMP 中，exiftool 等 XMP 读取工具会显示这些信息。开启 **RAW 不裁切** 后，Lightroom 和 Camera Raw 打开 DNG 时会带有拍摄时的裁切，你也可以撤销该裁切。"
        },
        {
          "kind": "p",
          "text": "对于已有的照片，[显影页](doc:develop)可在浏览器中应用相同的胶片风格与效果。"
        }
      ]
    },
    "settings": {
      "title": "GRKU 设置",
      "sources": [
        "runtime/menu_settings.h",
        "runtime/manage.h",
        "runtime/playback_info.h",
        "crates/grku-core/src/menu_text.rs"
      ],
      "seo": "MENU 中的 GRKU 设置：各项选项说明",
      "lead": "MENU 中 GRKU 自身的设置。",
      "keywords": "grku settings enable at start keep last uncropped raw distance unit meters feet battery playback icons shutdown screen custom picture show text adj order hidden top grku 设置 开机启用 保持上次 raw 不裁切 距离单位 米 英尺 电池 回放图标 关机画面 自定义影像 显示文字 adj 菜单顺序 隐藏 顶部",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "自定义 (C)",
            "GRKU",
            "GRKU 设置"
          ]
        },
        {
          "kind": "table",
          "head": [
            "行",
            "功能说明"
          ],
          "rows": [
            [
              "**开机启用**",
              "每次开机时的 GRKU 状态：**开启**（默认）、**关闭**，或**保持上次**（即关机前的状态）。"
            ],
            [
              "**模式转盘**",
              "设置各转盘档位及 U1 至 U3 的 GRKU 开启或关闭。请参阅[模式转盘](doc:mode-dial)。"
            ],
            [
              "**ADJ 菜单顺序**",
              "ADJ 中 GRKU 列表里各模块的顺序。"
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "grku-settings",
          "source": "drawn",
          "alt": "GRKU Settings 页面：Enable at Start、Shooting Settings、Display Settings、Shutdown Screen、Mode Dial 和 ADJ Order。"
        },
        {
          "kind": "p",
          "text": "在相机上，该页面依次列出**开机启用**、**拍摄设置**、**显示设置**、**关机画面**、**模式转盘**，然后是**ADJ 菜单顺序**。每个开关都按“开启”在前的顺序列出。"
        },
        {
          "kind": "h2",
          "id": "adj-order",
          "text": "ADJ 菜单顺序"
        },
        {
          "kind": "p",
          "text": "在 GRKU 列表中上下移动模块。**顶栏 1** 到 **顶栏 4** 让模块在 ADJ 工具栏中拥有独立入口，排在 GRKU 之前，按一次即可直达。**隐藏** 会从 ADJ 中隐藏模块，但模块仍保持生效。"
        },
        {
          "kind": "h2",
          "id": "shooting",
          "text": "拍摄设置"
        },
        {
          "kind": "table",
          "head": [
            "行",
            "功能说明"
          ],
          "rows": [
            [
              "**RAW 不裁切**",
              "默认**关闭**。**开启**后，每张 DNG 保留完整传感器画面，拍摄时的裁剪作为元数据记录，可在 Lightroom 和 Camera Raw 中撤销。此时 Lightroom 可能不会应用其默认的 RAW 设置。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "display",
          "text": "显示设置"
        },
        {
          "kind": "table",
          "head": [
            "行",
            "功能说明"
          ],
          "rows": [
            [
              "**距离单位**",
              "快照对焦距离和手动对焦刻度显示为**米**（默认）或**英尺**。"
            ],
            [
              "**简单信息电量**",
              "默认**关闭**。**开启**后，实时取景的简化信息界面也会显示电池图标。"
            ],
            [
              "**回放效果图标**",
              "在详细播放信息的第一页上显示照片的颗粒感、柔光、胶片光晕、边框和加印日期图标，以及照片的裁切。默认开启。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "shutdown",
          "text": "关机画面"
        },
        {
          "kind": "table",
          "head": [
            "行",
            "功能说明"
          ],
          "rows": [
            [
              "**自定义图片**",
              "相机关机时显示你的图片（`GRKU/GOODBYE.JPG`）。默认开启。参见[关机图片](doc:shutdown)。"
            ],
            [
              "**显示文字**",
              "默认**开启**。若**关闭**，相机关机时将不显示快门次数和固件版本。"
            ]
          ]
        }
      ]
    },
    "looks": {
      "title": "在网站选择胶片风格",
      "sources": [
        "web/src/plus.ts (FREE_SLOTS)",
        "web/src/lookSearch.ts",
        "web/src/strings/en.ts (importOpen, kindImported)",
        "CHANGELOG.md 1.9.0 (xmp)"
      ],
      "seo": "如何选择胶片效果以及导入 LUT 或 Lightroom 预设",
      "lead": "挑选要存入存储卡的胶片风格、搜索片库，并导入自己的 LUT。",
      "keywords": "片库 选择风格 搜索 槽位 免费 10 40 导入 lut cube xmp lightroom 预设 类型 负片 反转片 黑白 library choose looks search slots free 10 40 import lut cube xmp lightroom preset kinds negative slide black and white",
      "blocks": [
        {
          "kind": "p",
          "text": "[安装](site:install)第 1 步会展示完整片库：Kodak、Fujifilm、Ilford、CineStill、Polaroid、电影胶片和反转片、黑白胶片、FUJIFILM 相机的胶片模拟，以及 GRKU 自带风格（如 GR II Positive (GRKU) 和 FinePix CCD）。"
        },
        {
          "kind": "h2",
          "id": "pick",
          "text": "挑选风格"
        },
        {
          "kind": "steps",
          "items": [
            "轻点某个风格，查看它在样张上的效果。",
            "勾选你想放进存储卡的胶片风格。10 款免费，一张卡最多可放 40 款。",
            "按名称、品牌或类型搜索，例如“portra”、“fuji”或“ขาวดำ”。长词稍微拼错也没关系。"
          ]
        },
        {
          "kind": "p",
          "text": "想先用自己的照片看看效果？点击**在自己的照片上试用**，即可在[显影页](doc:develop)打开。"
        },
        {
          "kind": "h2",
          "id": "import",
          "text": "导入自己的风格"
        },
        {
          "kind": "steps",
          "items": [
            "在第 1 步点击**导入 LUT**。",
            "选择 `.cube` 文件或 Lightroom `.xmp` 预设。",
            "该风格会显示在**你的导入**下。像其他风格一样勾选即可。"
          ]
        },
        {
          "kind": "p",
          "text": "Lightroom 预设会转化为其色彩设置对应的风格。随每张照片变化的设置仅为近似效果。"
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "**模块**"
        },
        {
          "kind": "p",
          "text": "第 3 步选择模块。一张存储卡最多支持 11 个模块中的 10 个；安装时默认不包含边框。第 3 步还会添加配方和[关机画面](doc:shutdown)。"
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
      "seo": "GRKU Plus：价格、付款与密钥",
      "lead": "可选的一次性付费，用于在卡上存放更多胶片效果。没有它，GRKU 依然免费。",
      "keywords": "plus 价格 付费 购买 密钥 邮箱 promptpay truemoney 槽位 组合包 全部 解锁 退款 泰铢 plus price pay buy key email promptpay truemoney slots pack everything unlock refund baht",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKU 的所有内容都免费：每款胶片风格都可免费预览，片库中有 10 款可免费存入存储卡，所有模块、配方和“显影”页也都免费。GRKU Plus 适合想在存储卡里放更多胶片风格并支持该项目的人。"
        },
        {
          "kind": "h2",
          "id": "tiers",
          "text": "可解锁的内容"
        },
        {
          "kind": "list",
          "items": [
            "**25 个槽位**：卡上可存放自选的 25 个效果，而不是 10 个。",
            "**单个组合包**：在免费槽位之外，解锁某一胶片系列的全部效果（例如柯达彩色或黑白）。",
            "**全部内容**：解锁所有效果以及未来的新效果，卡上可同时存放 40 个，并解锁 GRKU Studio 的全部功能。"
          ]
        },
        {
          "kind": "p",
          "text": "任何购买均解锁完整的 GRKU Studio 及其设计。价格详见 [GRKU Plus](site:plus) 页面。之前的付款计入“全部解锁”和 25 个槽位，不计入单个套装包。首发优惠于 2027 年 1 月 1 日结束。"
        },
        {
          "kind": "h2",
          "id": "pay",
          "text": "付款"
        },
        {
          "kind": "steps",
          "items": [
            "打开 [GRKU Plus](site:plus) 并选择要解锁的内容。",
            "输入你的邮箱并同意[使用条款](site:terms)。",
            "用任意泰国银行 App 扫描 PromptPay 二维码付款，然后上传付款凭证。或者，当表格提供该选项时，粘贴 TrueMoney 红包链接。",
            "胶片风格会立即解锁。",
            "密钥会通过邮件发送，可在所有设备上使用。"
          ]
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "退款政策",
          "text": "购买后产品会立即发送，因此不支持因改变主意而退款。如果未收到密钥，或因我方故障导致胶片效果无法解锁且 14 天内未能修复，您将获得全额退款。详情请参阅[使用条款](site:terms)。"
        },
        {
          "kind": "h2",
          "id": "key",
          "text": "在其他设备上使用密钥"
        },
        {
          "kind": "p",
          "text": "打开 [GRKU Plus](site:plus-key)，选择 **我已有密钥**，粘贴密钥，然后点击 **解锁**。没收到邮件？点击 **我已有密钥** 可重新发送。"
        }
      ]
    },
    "shutdown": {
      "title": "关机画面与 GRKU Studio",
      "sources": [
        "web/src/strings/en.ts (shutdown)",
        "web/src/shutdownDesigns.ts",
        "CHANGELOG.md 1.9.0, 1.10.0",
        "runtime/manage.h (Custom Picture, Show Text)"
      ],
      "seo": "RICOH GR 自定义关机画面（GRKU Studio）",
      "lead": "在相机关机时显示自己的图片，或在 GRKU Studio 中设计图片。",
      "keywords": "关机 屏幕 图片 告别 断电 studio 设计 贴纸 模板 徽标 自定义 图片 shutdown screen picture goodbye power off studio design sticker template logo custom picture",
      "blocks": [
        {
          "kind": "p",
          "text": "相机关机时，GRKU 可以显示你选择的图片。相机会从存储卡的 `GRKU/GOODBYE.JPG` 读取该图片。"
        },
        {
          "kind": "h2",
          "id": "choose",
          "text": "选择图片"
        },
        {
          "kind": "steps",
          "items": [
            "在[安装](site:install)的第 3 步中，找到关机画面卡片。",
            "选择现成设计、自制设计，或选择 **关闭** 以使用相机自带的关机画面。",
            "像平时一样写入存储卡。新画面会在下次开机时显示。如果是 GRKU.zip，请一并下载 `GOODBYE.JPG`，并复制到存储卡的 `GRKU` 文件夹中。"
          ]
        },
        {
          "kind": "p",
          "text": "现成设计包括日落、困倦的月亮、打盹的猫咪、胶卷和小票，并可搭配你自己的文字。自己的照片会裁剪为 3:2。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "相机无法关机？",
          "text": "损坏的 `GOODBYE.JPG` 可能导致相机无法关机。取出电池，在电脑上删除存储卡中的 `GRKU/GOODBYE.JPG`，然后从网站重新写入该图片。"
        },
        {
          "kind": "h2",
          "id": "studio",
          "text": "GRKU Studio"
        },
        {
          "kind": "p",
          "text": "GRKU Studio 是图层编辑器：支持背景、你的照片、Logo、抠图 PNG 文件、八种字体的文字、贴纸、相框，以及泼水节、水灯节、新年和情人节模板。可通过工具栏、拖放文件或粘贴来添加图片。"
        },
        {
          "kind": "p",
          "text": "GRKU Studio 的部分功能和部分设计免费。购买任意 [GRKU Plus](doc:plus) 即可解锁全部内容。"
        },
        {
          "kind": "h2",
          "id": "camera",
          "text": "在相机上"
        },
        {
          "kind": "p",
          "text": "在 [GRKU 设置](doc:settings#shutdown) 中，**自定义图片**可开启或关闭该图片，**显示文字**可隐藏相机叠加在画面上的拍摄张数。"
        }
      ]
    },
    "develop": {
      "title": "冲洗页",
      "sources": [
        "web/src/components/Develop.tsx",
        "web/src/develop/gating.ts",
        "web/src/develop/install.ts",
        "CHANGELOG.md 1.10.1"
      ],
      "seo": "免费在线照片胶片滤镜（“冲洗”页面）",
      "lead": "在浏览器中为已有照片套用 GRKU 的胶片色彩和效果。",
      "keywords": "冲洗 编辑 照片 浏览器 在线 滤镜 试用 预览 下载 无相机 手机 develop edit photo browser online filter try preview download no camera phone",
      "blocks": [
        {
          "kind": "p",
          "text": "[显影页](site:develop) 会在你的照片上展示 GRKU 的胶片风格，效果由相机模块代码生成。无需相机，且照片不会离开你的设备。"
        },
        {
          "kind": "steps",
          "items": [
            "打开[冲洗页](site:develop)并添加照片。",
            "选择色彩，然后添加效果：光晕、漏光、柔光镜、胶片柔和度、颗粒感、加印日期和边框。",
            "保存照片。或者点击 **添加到我的 GR**：安装页将打开，并已选好该风格和对应模块。每种效果的强度需在相机上设置。"
          ]
        },
        {
          "kind": "p",
          "text": "免费版支持使用相机模拟、入门模拟或无模拟保存，最高 2048 px，带小型 GRKU 水印，每次最多 5 张。购买任意 GRKU Plus 即可全尺寸保存所有模拟，无水印，每次最多 50 张。"
        }
      ]
    },
    "assistant": {
      "title": "AI 助手",
      "sources": [
        "web/src/chat/strings.ts",
        "web/src/components/ChatPanel.tsx",
        "services/plus/src/chat/index.ts"
      ],
      "seo": "GRKU AI 助手：咨询你的 GR 和胶片效果",
      "lead": "向 GRKU 助手咨询安装方法、你的相机，或哪款色彩适合你的照片。",
      "keywords": "AI 助手 聊天 提问 帮助 机器人 吉祥物 记忆 ai assistant chat ask question help bot mascot memory",
      "blocks": [
        {
          "kind": "p",
          "text": "网站页面右下角的圆形按钮可打开 GRKU 助手。它会根据本网站和本手册的内容回答，并用你的语言回复，同时附上对应页面的链接。"
        },
        {
          "kind": "h2",
          "id": "ask",
          "text": "推荐提问"
        },
        {
          "kind": "list",
          "items": [
            "“如何在 GR IIIx 上安装 GRKU？”",
            "“按住 MENU 时相机显示固件更新。”",
            "“推荐一款适合人像的温暖影调。”",
            "“胶片光晕 有什么作用？”"
          ]
        },
        {
          "kind": "p",
          "text": "在手册的每个页面上，**Ask AI about this page** 可在关联当前页面的情况下打开助手。"
        },
        {
          "kind": "h2",
          "id": "limits",
          "text": "实用提示"
        },
        {
          "kind": "list",
          "items": [
            "每日可发送的消息数量有限。GRKU Plus 用户可进行更深入的对话并获得更详细的解答。",
            "如果开启记忆功能，浏览器会记住你的相机型号、固件版本和你喜欢的风格，并在提问时一并发送。",
            "你的消息会发送给 AI 服务以获取回复。请勿输入个人数据。",
            "AI 回答可能出错。涉及相机固件的任何操作，请以本手册和 RICOH 官方说明为准。"
          ]
        }
      ]
    },
    "not-showing": {
      "title": "GRKU 未显示",
      "sources": [
        "docs/diagnostics.md",
        "resources/INSTALLATION-GR4.md (Troubleshooting)",
        "web/src/strings/en.ts (faq adj)"
      ],
      "seo": "相机不显示 GRKU：解决方法",
      "lead": "按顺序逐一检查以下各项。",
      "keywords": "未显示 不生效 缺少 adj no grku 错误 install.err report boot.txt 47 48 固件 模式 设置 not showing not working missing adj no grku error install.err report boot.txt 47 48 firmware mode set",
      "blocks": [
        {
          "kind": "flow",
          "steps": [
            {
              "see": "开机后屏幕顶部没有显示 **GRKU**。",
              "then": "首次使用时请等待约一分钟。然后查看下面的检查步骤。"
            },
            {
              "see": "按住 {{MENU}} 时，相机显示固件更新界面。",
              "then": "选择 **取消**，然后从存储卡中删除 `fwdc….bin` 文件。"
            },
            {
              "see": "按住 {{MENU}} 时，没有出现 **模式设置** 界面。",
              "then": "重新执行 [首次启动](doc:install#first-start) 步骤。"
            },
            {
              "see": "相机在启动时卡住了。",
              "then": "查看 [相机启动卡住](doc:stuck)。"
            }
          ]
        },
        {
          "kind": "h2",
          "id": "checks",
          "text": "按顺序检查"
        },
        {
          "kind": "steps",
          "items": [
            "**等待。**开机后 GRKU 大约需要 8 到 10 秒加载。安装后的首次启动最长可能需要约一分钟：期间请勿关机。在此之前拍摄的照片没有 GRKU 效果。",
            "**相机和固件。** 打开 MENU 查看固件版本。确保它在 [支持的相机](doc:cameras) 列表中。详见 [查看固件版本](doc:firmware)。",
            "**SD 卡脚本。** 首次开机时是否按住了 {{MENU}}，并看到了 **模式 Set Command** 和 **Complete**？如果没有，请重新执行 [首次启动](doc:install#first-start)。",
            "**文件位于顶层目录。** `SCRIPT` 文件夹必须在存储卡的顶层目录中，不能放在 `DCIM` 或其他文件夹内。",
            "**读卡器。**请使用读卡器写入存储卡，不要通过相机的 USB 数据线写入。",
            "**启用 GRKU。** 进入 MENU > 自定义 (C) > GRKU，确认**启用 GRKU**已开启，且 GRKU 设置中的**开机启用**未设为关闭。"
          ]
        },
        {
          "kind": "h2",
          "id": "errors",
          "text": "错误编号"
        },
        {
          "kind": "p",
          "text": "如果 GRKU 停止运行，存储卡中会出现 `SCRIPT/GRKU/INSTALL.ERR`。它的第一行是一个数字。成功启动后，该文件会消失，取而代之的是 `SCRIPT/GRKU/INSTALL.OK`。"
        },
        {
          "kind": "table",
          "head": [
            "编号",
            "含义",
            "解决方法"
          ],
          "rows": [
            [
              "47, 48",
              "GRKU 不适配当前的固件版本。",
              "确认固件是否受支持，然后更新 GRKU。如果问题仍在，请发送报告。"
            ],
            [
              "60, 61, 62",
              "启动未完成。",
              "重新写入存储卡。如果问题仍在，请发送报告。"
            ],
            [
              "36, 37",
              "GRKU 无法在存储卡上读写其配置文件。",
              "重新写入存储卡。"
            ],
            [
              "30, 31",
              "GRKU 无法读取胶片风格。",
              "重新写入存储卡。如果问题仍在，请尝试更换另一张存储卡。"
            ],
            [
              "23, 24",
              "对相机的更改未生效。",
              "将相机关机再重新开机。如果问题仍在，请发送报告。"
            ],
            [
              "其他",
              "GRKU 因其他原因停止运行。",
              "发送带编号的报告。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "模块名称后的数字"
        },
        {
          "kind": "p",
          "text": "未加载的模块会在 MENU 中名称后显示数字，`GRKU/REPORT.TXT` 也会列出它。GRKU 仍能正常启动。"
        },
        {
          "kind": "table",
          "head": [
            "编号",
            "含义",
            "解决方法"
          ],
          "rows": [
            [
              "50 到 55，57",
              "这个模块没有加载成功。",
              "更新 GRKU。如果问题仍在，请发送报告。"
            ],
            [
              "56",
              "在 GR IV Monochrome 上，彩色照片模块会被跳过。这很正常。",
              "无影响。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "files",
          "text": "报告文件里写了什么"
        },
        {
          "kind": "list",
          "items": [
            "`GRKU/REPORT.TXT`：记录 GRKU 版本和固件版本，每个模块和胶片模拟的状态（已加载、已停止或一个数字），以及用于技术支持的详细信息。内容发生变化时会重新写入。",
            "`GRKU/BOOT.TXT`：每次开机记录一段日志，包含每一步的时间。大约保留最近 20 次开机的记录。",
            "`SCRIPT/GRKU/INSTALL.ERR`：仅在开机停止时生成，并附带对应的数字。"
          ]
        },
        {
          "kind": "h2",
          "id": "report",
          "text": "发送报告"
        },
        {
          "kind": "p",
          "text": "请发送电子邮件至 [support@grku.app](support)，附上您的相机型号和固件版本，并将卡中的这些文件作为附件发送。这些文件中不包含照片。它们可能会包含您的配方名称和导入的风格，如果您愿意，可以先打开它们查看。"
        },
        {
          "kind": "files",
          "items": [
            [
              "SCRIPT/GRKU/INSTALL.ERR",
              "启动中断的原因"
            ],
            [
              "GRKU/REPORT.TXT",
              "相机、固件和 GRKU 版本"
            ],
            [
              "GRKU/BOOT.TXT",
              "启动时发生的情况"
            ]
          ]
        }
      ]
    },
    "stuck": {
      "title": "相机卡在启动界面",
      "sources": [
        "resources/RECOVERY.md"
      ],
      "seo": "RICOH GR 卡在开机界面：恢复方法",
      "lead": "GRKU 仅在开机期间生效，关机后会恢复。请取出存储卡后再开机。",
      "keywords": "卡死 死机 冻结 无响应 无法开机 黑屏 变砖 恢复 还原 电池 stuck freeze hang frozen not start black screen brick recover recovery reset battery",
      "blocks": [
        {
          "kind": "note",
          "tone": "warning",
          "title": "开始前",
          "text": "请勿推拉镜头筒。官方固件更新期间切勿断电。"
        },
        {
          "kind": "flow",
          "steps": [
            {
              "see": "相机在开机过程中卡住了。",
              "then": "取出电池和存储卡，然后在不插卡的情况下开机。"
            },
            {
              "see": "不插卡仍然无法开机。",
              "then": "进入回放模式并重置相机设置。"
            },
            {
              "see": "能开机但无法关机。",
              "then": "查看 [关机画面](doc:shutdown)。"
            }
          ]
        },
        {
          "kind": "h2",
          "id": "without-card",
          "text": "取出存储卡后开机"
        },
        {
          "kind": "steps",
          "items": [
            "尝试关闭相机。",
            "如果相机没有响应，请取出电池。电池可能会发烫。",
            "取出 SD 卡。",
            "装入充满电的电池，在不插卡的情况下开机。"
          ]
        },
        {
          "kind": "h2",
          "id": "safe-mode",
          "text": "安全模式：不加载模块启动 GRKU"
        },
        {
          "kind": "p",
          "text": "如果相机在没有存储卡时能正常启动，但插入后再次停止，则可能是某个模块导致的。安全模式会在不加载任何模块的情况下启动 GRKU，以便您关闭该模块。"
        },
        {
          "kind": "steps",
          "items": [
            "将存储卡插入电脑的读卡器。",
            "在存储卡的 `GRKU` 文件夹中，创建一个名为 `SAFE.TXT`（或 `SAFE`）的空文件。",
            "将存储卡插入相机并开机。此时不会加载任何模块，MENU 中的 **About GRKU** 会显示 **Safe mode**。",
            "在 MENU、Customize (C)、GRKU 中，关闭您最近添加或修改的模块。",
            "关闭相机，从存储卡中删除 `SAFE` 文件，然后重新开启相机。"
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "安全模式",
          "text": "安全模式不会自动启动。只要存储卡上存在 `SAFE` 文件，拍摄的照片就不会应用 GRKU 效果。"
        },
        {
          "kind": "h2",
          "id": "still",
          "text": "如果仍无法开机"
        },
        {
          "kind": "steps",
          "items": [
            "在不插卡的情况下，按住回放键以回放模式启动相机。",
            "如果菜单打开了，请重置相机设置。重置会清除你自己的设置。",
            "在不插卡的情况下再次开机。"
          ]
        },
        {
          "kind": "p",
          "text": "如果相机能开机但关不了机，可能是关机画面损坏导致的：请查看 [关机画面](doc:shutdown)。如果还是开不了机，请停止使用 GRKU 并联系 RICOH 售后。[恢复指南](site:recovery) 里有完整的步骤。"
        }
      ]
    },
    "faq": {
      "title": "常见问题",
      "sources": [
        "web/src/strings/en.ts (faq)",
        "runtime/mode_dial.h",
        "resources/INSTALLATION-GR4.md"
      ],
      "seo": "GRKU 常见问题解答",
      "lead": "常见问题的简短解答。",
      "keywords": "faq 常见问题 问题 为什么 第一张 照片 没有 胶片 色彩 盒装 召回 格式化 手机 导入 gr 全球 安全 保修 why first photos no look box recall format phone import gr world safe warranty",
      "blocks": [
        {
          "kind": "h2",
          "id": "first-photos",
          "text": "为什么刚拍的照片没有胶片色彩？"
        },
        {
          "kind": "p",
          "text": "开机后约 8 到 10 秒（安装后首次开机最长约 1 分钟），GRKU 才会加载完成。在此之前，相机使用自身设置。请等待屏幕顶部显示 **GRKU**。"
        },
        {
          "kind": "h2",
          "id": "dng",
          "text": "为什么我的 DNG 是 3:2，或者没有胶片色彩？"
        },
        {
          "kind": "p",
          "text": "GRKU 会修改 JPEG，DNG 则保留原始数据。请参阅[RAW 机内处理](doc:raw)。"
        },
        {
          "kind": "h2",
          "id": "user-mode",
          "text": "为什么用户模式没有恢复我的胶片色彩？"
        },
        {
          "kind": "p",
          "text": "用 RICOH 相机菜单保存的用户模式不会记录 GRKU 设置。请使用[保存当前设置](doc:mode-dial)或[配方](doc:recipes)。"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "GRKU 会修改相机固件吗？"
        },
        {
          "kind": "p",
          "text": "不会。GRKU 是在相机开机时从存储卡加载的。SD 脚本是相机的一项设置，它会一直保持开启，直到你[关闭它](doc:update#scripts-off)。**保存当前设置**也会保存到相机的用户模式中。"
        },
        {
          "kind": "h2",
          "id": "menu-again",
          "text": "更新后或换用另一张卡时，还需要再次按住 MENU 吗？"
        },
        {
          "kind": "p",
          "text": "不是。只有第一次需要按住 {{MENU}}。"
        },
        {
          "kind": "h2",
          "id": "version",
          "text": "我的存储卡里是哪个 GRKU 版本？"
        },
        {
          "kind": "p",
          "text": "打开 MENU。**关于 GRKU** 在自定义标签页中 GRKU 部分的末尾。"
        },
        {
          "kind": "h2",
          "id": "phone",
          "text": "为什么手机无法导入照片？"
        },
        {
          "kind": "p",
          "text": "安装 GRKU 不会更改 `DCIM` 文件夹里的照片。请把 GR WORLD 更新到最新版本。如果还是失败，请[发邮件联系支持](support)。"
        },
        {
          "kind": "h2",
          "id": "lightroom",
          "text": "能在 Lightroom 中使用这些风格吗？"
        },
        {
          "kind": "p",
          "text": "不能直接使用。GRKU 不会生成 Lightroom 预设。你可以在[显影页面](doc:develop)上用你的照片试用这些风格。"
        }
      ]
    },
    "cameras": {
      "title": "支持的相机",
      "sources": [
        "web/src/cameras.ts",
        "web/src/generated/cameras.ts",
        "web/src/package.ts"
      ],
      "seo": "GRKU 支持哪些 RICOH GR 相机机型与固件版本？",
      "lead": "GRKU 在官方 RICOH 固件下支持以下相机与固件版本。",
      "keywords": "相机 支持 固件 版本 gr iii iiix iv hdf monochrome modeset dump cameras supported firmware version gr iii iiix iv hdf monochrome modeset dump",
      "blocks": [
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GRKU 已在固件 1.11 的 GR IV 上运行过。其他版本和机型的构建基于同一代码，并对照了 RICOH 固件文件，但尚未在相机上实测。"
        },
        {
          "kind": "p",
          "text": "在相机上打开 MENU 以查看其固件版本：请参阅 [检查您的固件版本](doc:firmware)。早期 GR 型号和其他相机不受支持。GR IV Monochrome 拥有除胶片风格之外的所有模块。"
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Edition 相机出厂自带专属 1.20 版本，grku.app 暂未提供对应版本。请先从 RICOH 更新至 1.21。"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "更新相机固件"
        },
        {
          "kind": "p",
          "text": "仅从 RICOH 官方支持站点更新相机固件，并先确认 GRKU 支持该新版本。GRKU 不会更新固件。"
        },
        {
          "kind": "h2",
          "id": "dump",
          "text": "GRKU 尚未支持的固件"
        },
        {
          "kind": "p",
          "text": "[固件提取指南](site:firmware-dump)介绍了如何为开发者读取相机固件，让 GRKU 支持该版本。"
        }
      ]
    }
  }
};
