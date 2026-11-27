// The user manual in ja, translated from en.ts with the Gemini tools (grku-tools/i18n-th.mjs,
// checked with i18n-review.mjs), never by hand.
import type { DocsContent } from '../types';

export const ja: DocsContent = {
  "home": {
    "title": "GRKU マニュアル",
    "seoTitle": "GRKU マニュアル：RICOH GR III、IIIx、IV のインストール、フィルムルック、全設定",
    "lead": "GRKU のインストール方法、GR での各機能の使い方、トラブルの対処法を短い手順とわかりやすい言葉で説明します。",
    "trust": "GRKU は SD カードから動作します。カメラのファームウェアは変更しません。",
    "need": "必要なもの",
    "tasks": [
      {
        "slug": "install",
        "label": "GRKU をインストール",
        "hint": "はじめての方向け"
      },
      {
        "slug": "firmware",
        "label": "ファームウェアを確認",
        "hint": "インストールする前に"
      },
      {
        "slug": "controls",
        "label": "カメラでGRKUを使う",
        "hint": "ADJとMENU"
      },
      {
        "slug": "film-look",
        "label": "フィルムルックを選ぶ",
        "hint": "フィルムルック"
      },
      {
        "slug": "not-showing",
        "label": "GRKUが表示されない",
        "hint": "原因を探す"
      },
      {
        "slug": "update",
        "label": "アップデートまたはアンインストール",
        "hint": "設定を保持"
      }
    ],
    "rescue": "起動途中で止まる場合",
    "all": "すべてのページ",
    "credit": "GRKU は ahonn 氏による [GRKit](https://github.com/ahonn/GRKit)（MIT ライセンス）のコードをもとに作られました。"
  },
  "ui": {
    "docs": "マニュアル",
    "searchLabel": "マニュアルを検索",
    "searchHome": "検索（例：日付、XPan、アップデート）",
    "searchShort": "マニュアルを検索",
    "noResults": "見つかりませんでした。",
    "askInstead": "AIアシスタントに聞く",
    "browse": "マニュアルページ一覧",
    "previous": "前へ",
    "next": "次へ",
    "onThisPage": "このページの内容",
    "stuck": "解決しない場合は",
    "report": "メールでお問い合わせ",
    "askAi": "このページについてAIに質問",
    "askAiText": "GRKUアシスタントがこのページに関する質問にお答えします。",
    "askPrompt": "マニュアルページ「${title}」を読んでいます。短い手順で説明してください。",
    "camera": "カメラ",
    "firmware": "ファームウェア",
    "modeset": "ModeSetファイル",
    "ratio": "アスペクト比",
    "mask": "マスク",
    "masks": [
      "ダーク",
      "黒",
      "枠線"
    ],
    "focal": "焦点距離",
    "style": "スタイル",
    "guides": [
      "9分割",
      "画面中央",
      "黄金比",
      "対角線"
    ],
    "settingCol": "カメラでの設定",
    "choicesCol": "選択肢と機能",
    "defaultMark": "デフォルト",
    "withoutLabel": "なし",
    "photoBadge": "カメラの写真",
    "readingTime": "${n}分で読めます",
    "copyStep": "この手順をコピー",
    "copiedStep": "コピーしました",
    "askStep": "この手順についてAIに聞く",
    "askStepPrompt": "マニュアルページ「${title}」のステップ ${n} に、次のように書かれています：「${step}」。この手順をわかりやすく説明してください。",
    "captureBadge": "カメラの画面",
    "drawnBadge": "実メニューからの描画",
    "updated": "更新日"
  },
  "groups": {
    "start": "はじめに",
    "camera": "カメラでの設定",
    "site": "grku.app",
    "help": "ヘルプ"
  },
  "pages": {
    "start": {
      "title": "GRKUとは",
      "sources": [
        "web/src/plus.ts",
        "web/src/generated/modules.ts",
        "web/src/strings/en.ts (faq)",
        "resources/TERMS.md"
      ],
      "seo": "GRKUとは？RICOH GR III、IIIx、IV向けの無料フィルムルック",
      "lead": "GRKUはSDカードからRICOH GRにフィルムルックや撮影効果を追加します。",
      "keywords": "about introduction overview begin beginner free safe firmware 概要 紹介 はじめる 初心者 無料 安全 ファームウェア",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKUはRICOH GR III、GR IIIx、GR IV向けの無料アドオンです。150種類以上のフィルムルックから選び、1枚のカードに最大40個まで入れられます。日付印字や粒状感、XPan比率などのレシピや効果も使えます。"
        },
        {
          "kind": "p",
          "text": "カメラの電源が入っている間、SDカードから動きます。カードがないとGRKUは読み込まれず、カメラはRICOH純正のまま動作します。「SDスクリプト」の設定だけが**オン**のまま残ります。GRKUがカメラのファームウェアを書き換えることはありません。"
        },
        {
          "kind": "h2",
          "id": "need",
          "text": "必要なもの"
        },
        {
          "kind": "list",
          "items": [
            "対応カメラとファームウェアバージョン。[対応カメラ](doc:cameras)を参照してください。",
            "カメラのメモリーカード：GR IIIとGR IIIxはSDカード、GR IVはmicroSDカードを使います。普段撮っているカードで大丈夫です。",
            "ChromeまたはEdgeが入ったパソコンとカードリーダー。ない場合は、GRKU.zipを自分でカードにコピーできます。"
          ]
        },
        {
          "kind": "h2",
          "id": "how",
          "text": "仕組み"
        },
        {
          "kind": "steps",
          "items": [
            "grku.appでフィルムルック、カメラ、モジュールを選び、SDカードに書き込みます。",
            "初回のみ、{{MENU}}を押したままカメラの電源を入れます。これによりSDスクリプトが有効になります。",
            "通常どおりカメラの電源を入れます。数秒後、画面上部に**GRKU**が表示されます。",
            "撮影中に{{ADJ}}を押し、6番目の項目**GRKU**を選びます。"
          ]
        },
        {
          "kind": "h2",
          "id": "free",
          "text": "無料版とGRKU Plusの追加機能"
        },
        {
          "kind": "p",
          "text": "すべてのルックはサイト上で無料でプレビューでき、ライブラリのルックは10個まで無料でカードに入れられます。自分で読み込んだルックは数に含まれません。すべてのモジュールやレシピ、Developページでのルックのお試しも無料です。[GRKU Plus](doc:plus) は、カードに入れられるルックを増やすための買い切りオプションです。"
        },
        {
          "kind": "h2",
          "id": "words",
          "text": "このマニュアルで使う言葉"
        },
        {
          "kind": "list",
          "items": [
            "**SDカード**：写真を撮って保存する小さなメモリーカードです。GR IVはmicroSDカードを使います。このマニュアルではどちらもカードと呼びます。",
            "**Card reader**：パソコンでSDカードの中身を見るための小さな機器です。",
            "**ZIP file**：たくさんのファイルをひとつにまとめたファイルです。開くと中のファイルを取り出せます。",
            "**Firmware**：RICOHが作ったカメラの中のソフトです。GRKUが書き換えることはありません。",
            "**SD scripts**：カードからGRKUを動かせるようにするカメラの設定です。一度だけオンにします。",
            "**ModeSet file**：SD scriptsをオンにするファイルです。`00078560.636`のような数字の名前が付いています。",
            "**ADJ lever**：GRの背面、画面の横にある小さなレバーです。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "実験的機能",
          "text": "GRKUは保証のない実験的なソフトです。うまくいかないと、カメラが起動しなくなることがあります。インストールする前に[起動しなくなったとき](doc:stuck)を読んでください。"
        }
      ]
    },
    "firmware": {
      "title": "ファームウェアのバージョンを確認",
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
      "seo": "RICOH GR III、GR IIIx、GR IVのファームウェアのバージョンを確認する方法",
      "lead": "MENUを押してセットアップメニュー（レンチのアイコン）を開きます。GRKUは、このページの表にあるファームウェアのバージョンでだけ動きます。",
      "keywords": "ファームウェア バージョン 確認 メニュー セットアップ レンチ 機器情報 カメラ情報 更新 リコー 古い 新しい firmware version check menu setup wrench about this device firmware info camera information update ricoh older newer fwdc bin",
      "blocks": [
        {
          "kind": "p",
          "text": "FirmwareはRICOHが作ったカメラの中のソフトです。どのカメラもメニューでファームウェアのバージョンを確認できます。GRKUをインストールする前に確認してください。"
        },
        {
          "kind": "h2",
          "id": "check",
          "text": "カメラでバージョンを確認する"
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
                    "カメラの電源を入れます。",
                    "{{MENU}}を押します。",
                    "セットアップメニュー（レンチアイコンのタブ）を開き、**About This Device**を選びます。",
                    "**Firmware Info / オプション**を選び、右を押します。",
                    "画面にファームウェアのバージョン（例：2.21）が表示されます。"
                  ]
                },
                {
                  "kind": "path",
                  "items": [
                    "MENU",
                    "セットアップ",
                    "この機器について",
                    "ファームウェア情報 / オプション"
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
                    "カメラの電源を入れます。",
                    "{{MENU}}を押します。",
                    "セットアップメニュー（レンチアイコンのタブ）を開き、**Camera Information**を選びます。",
                    "右を押します。",
                    "画面にファームウェアのバージョン（例：1.21）が表示されます。"
                  ]
                },
                {
                  "kind": "path",
                  "items": [
                    "MENU",
                    "セットアップ",
                    "カメラ情報"
                  ]
                }
              ]
            }
          ]
        },
        {
          "kind": "p",
          "text": "GR IV Monochrome：ファームウェアのバージョンは[RICOHのカメラサポートページ](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html)で確認できます。"
        },
        {
          "kind": "h2",
          "id": "supported",
          "text": "GRKUはどのバージョンに対応していますか？"
        },
        {
          "kind": "flow",
          "steps": [
            {
              "see": "お使いのバージョンは表にあります。",
              "then": "[GRKU をインストール](doc:install)。"
            },
            {
              "see": "お使いのバージョンが古いです。",
              "then": "まず RICOH でカメラを更新してください。[下記](doc:firmware#older)を参照。"
            },
            {
              "see": "お使いのバージョンが表より新しい場合",
              "then": "GRKU の更新をお待ちください。[下記](doc:firmware#newer)を参照してください。"
            }
          ]
        },
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GRKUはファームウェア1.11のGR IVで動作確認済みです。他のバージョンや機種向けも同じコードから作られ、RICOHのファイルと照合しましたが、実機での動作はまだ未確認です。"
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Editionには、専用の工場出荷版ファームウェア1.20が入っています。grku.appではまだこのバージョンに対応していないため、まずRICOHの公式サイトから1.21へアップデートしてください。"
        },
        {
          "kind": "h2",
          "id": "older",
          "text": "お使いのバージョンが古い場合"
        },
        {
          "kind": "p",
          "text": "先にカメラをアップデートしてください。必ずRICOHの公式サポートページ（[GR III](https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html)、[GR IIIx](https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html)、[GR IV](https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html)、[GR IV Monochrome](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html)）の手順に従って行いましょう。GRKUがファームウェアを更新することはありません。"
        },
        {
          "kind": "h2",
          "id": "newer",
          "text": "自分のバージョンが表より新しい場合"
        },
        {
          "kind": "p",
          "text": "まだGRKUをインストールしないでください。お使いのバージョンに対応するGRKUのアップデートが出るまで待ってください。時期は[grku.appのお知らせ](site:home)でお知らせします。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "最初の起動時にファームウェア更新画面が出る？",
          "text": "カードにカメラのファームウェアファイル（`fwdc` で始まる `.bin` ファイル）が入っている場合、電源を入れるときに {{MENU}} を押し続けるとファームウェア更新画面が表示されます。**キャンセル** を選んで {{OK}} を押してください。カメラの電源を切り、そのファイルをカードから削除してから、もう一度やり直してください。"
        }
      ]
    },
    "install": {
      "title": "GRKU をインストール",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/guide.ts",
        "web/src/strings/en.ts (cardConnect, cardApplyInstall, download)",
        "crates/grku-core/src/runtime/files.rs",
        "resources/images/modeset.png",
        "resources/images/camera-menu.png",
        "resources/images/grku-root.jpg"
      ],
      "seo": "RICOH GR III、GR IIIx、GR IVへのGRKUインストール方法",
      "lead": "GRKUをSDカードに書き込み、カメラでSDスクリプトを一度有効にします。",
      "keywords": "セットアップ インストール SDカード Chrome Edge zip sd_root modeset mode set command menu 初回起動 setup install sd card chrome edge zip sd_root modeset mode set command menu first start",
      "blocks": [
        {
          "kind": "h2",
          "id": "write",
          "text": "サイトからカードに書き込む"
        },
        {
          "kind": "p",
          "text": "パソコンのChromeまたはEdgeを使い、SDカードをカードリーダーに入れます。カメラのUSBケーブルではこの操作はできません。"
        },
        {
          "kind": "art",
          "art": "computer",
          "alt": "grku.app が開いているパソコンと、カードリーダーに入れる SD カード。"
        },
        {
          "kind": "steps",
          "items": [
            "[インストールページ](site:install)を開きます。",
            "フィルムルック、カメラ、モジュールの順に選びます。",
            "最後のステップで **SD カードに書き込む** を選び、**SD カードを接続** を押します。カード本体を選び、編集を許可してください。",
            "変更内容を確認し、**GRKU をインストール**を押します。カード内の写真はそのまま残ります。",
            "取り出す前に、パソコンでカードを取り出し操作をします。"
          ]
        },
        {
          "kind": "p",
          "text": "カメラのファームウェアがどれかわからないときは、[ファームウェアのバージョンを確認する](doc:firmware)を見てください。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "このように表示されないときは",
          "text": "**SD カードを接続**ボタンがないときは、パソコンのChromeやEdgeでページを開いてください。スマホやSafariでは、下のGRKU.zipを使ってください。"
        },
        {
          "kind": "h2",
          "id": "zip",
          "text": "または自分でGRKU.zipをコピーする"
        },
        {
          "kind": "p",
          "text": "スマホやSafariを使うMacなど、その他のブラウザー向けです。アプリ内のブラウザーでファイルを保存できないときは、スマホのブラウザーでページを開いてください。"
        },
        {
          "kind": "art",
          "art": "copy",
          "alt": "`SCRIPT` フォルダ、`DEVELOP.MOD`、SD_ROOT からコピーした `ModeSet` ファイルが、DCIM と並んでカードの最上位に置かれています。"
        },
        {
          "kind": "steps",
          "items": [
            "インストールの最後のステップで**GRKU.zip をダウンロード**を押します。",
            "ファイルは `GRKU-….zip` として保存されます。解凍してください。ブラウザーによっては自動で解凍されます。",
            "`SD_ROOT`フォルダーそのものではなく、中身をカードの最上位階層にコピーします。",
            "カードの最上位階層に`SCRIPT`フォルダー、`DEVELOP.MOD`、カメラのModeSetファイルが配置されます。"
          ]
        },
        {
          "kind": "card",
          "alt": "インストール後のSDカード最上位階層。",
          "items": [
            [
              "SCRIPT",
              "GRKU本体です。削除しないでください。"
            ],
            [
              "DEVELOP.MOD",
              "最初の起動時にModeSetファイルと一緒に読み込まれます。その後は削除しても大丈夫です。"
            ],
            [
              "00078560.636",
              "SDスクリプトを有効にする、お使いのカメラのModeSetファイルです（GR IIIは00078350.588、GR IIIxは00078490.609、GR IVは00078560.636）。最初の起動後は消してもかまいません。"
            ],
            [
              "GRKU",
              "あなたの設定とフィルムルックです。サイトまたはカメラで作成されます。"
            ],
            [
              "DCIM",
              "あなたの写真です。GRKUを**インストール**しても、写真はそのまま残ります。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "first-start",
          "text": "初回起動：SDスクリプトを有効にする"
        },
        {
          "kind": "p",
          "text": "一度設定すれば大丈夫です。どのSDカードを使っても、またアップデートしても、カメラはこの設定を保持します。"
        },
        {
          "kind": "art",
          "art": "insert",
          "alt": "SD カードをカメラのスロットに入れます。"
        },
        {
          "kind": "steps",
          "items": [
            "カメラの電源を切り、カードを挿入します。",
            "{{MENU}}を押したまま電源ボタンを押します。",
            "画面に**Mode Set Command**、続いて**Script - 有効**と**Complete**が表示されます。カメラの電源が自動で切れます。",
            "いつもどおりカメラの電源を入れます。画面の上に**GRKU**が出るまで待ちます。ふつうは約8〜10秒かかります。インストール後の初回起動は、約1分かかることがあります。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "初回起動のときは待つ",
          "text": "GRKUが初めて起動している間は、電源を切ったりバッテリーを抜いたりしないでください。約1分かかることがあります。"
        },
        {
          "kind": "screen",
          "screen": "modeset-back",
          "source": "capture",
          "alt": "MENUボタンに丸印がついたGRの背面。画面には「Mode Set Command」、「Script - **有効**」、「Complete」が表示されています。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "このように表示されないときは",
          "text": "**Mode Set Command**画面が出ないときは、電源を切ります。先に{{MENU}}を押し続けたまま電源ボタンを押し、画面が出るまで{{MENU}}を押し続けてください。`DEVELOP.MOD`とModeSetファイルがフォルダの中ではなく、カードの一番上の階層にあるか確かめてください。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "ファームウェア更新の画面が出たときは？",
          "text": "カードにカメラのファームウェアファイル（`fwdc` で始まる `.bin` ファイル）が入っています。**Cancel** を選んで {{OK}} を押してください。Executeは絶対に選ばないでください。カメラの電源を切り、カードの最上位からそのファイルを削除してから、このステップをやり直してください。"
        },
        {
          "kind": "p",
          "text": "この手順のあと、カードからModeSetファイルと`DEVELOP.MOD`を削除してもかまいません。`SCRIPT`フォルダーは残してください。"
        },
        {
          "kind": "h2",
          "id": "use",
          "text": "GRKUを使う"
        },
        {
          "kind": "steps",
          "items": [
            "撮影中に{{ADJ}}を押します。",
            "**GRKU**を選びます。ふつうは6番目にありますが、ADJの並び順でモジュールを独立した項目にしている場合は、もっと右にあります。",
            "**フィルムルック**などの機能を選び、選択肢にカーソルを合わせて画面で確認します。",
            "確定するには{{OK}}を押します。その他の設定には{{Fn}}を押します。"
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "このように表示されないときは",
          "text": "ADJに**GRKU**が出ませんか？電源を入れてからもう少し待って、やり直してみてください。初回は約1分かかることがあります。それでも出ないときは、[GRKUが表示されない](doc:not-showing)を見てください。"
        },
        {
          "kind": "screen",
          "screen": "adj-grku",
          "source": "drawn",
          "alt": "GRKUでADJを開いた状態。左上にGRKUとRecipes（最初のモジュール）が表示され、右側に各モジュールのアイコンが並んでいます。"
        },
        {
          "kind": "p",
          "text": "GRKUが読み込まれる前に撮影した写真には、GRKUの効果は適用されません。操作方法の詳細は[ADJとMENU](doc:controls)をご覧ください。"
        }
      ]
    },
    "controls": {
      "title": "ADJとMENU",
      "sources": [
        "runtime/menu.c",
        "runtime/manage.h",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs",
        "resources/images/grku-menu.jpg"
      ],
      "seo": "GRでのGRKUの使い方：ADJレバーとMENU",
      "lead": "カメラ上のGRKUの位置と、各ボタンの働きを説明します。",
      "keywords": "adj lever menu customize fn ok button options order enable grku about version navigate adjレバー メニュー カスタマイズ fn ok ボタン オプション 並び順 有効化 grku 概要 バージョン 操作",
      "blocks": [
        {
          "kind": "h2",
          "id": "adj",
          "text": "ADJでのGRKU"
        },
        {
          "kind": "p",
          "text": "撮影中に{{ADJ}}レバーを押して**GRKU**を選びます（ふつうは6番目）。カードに入っているモジュールの一覧が出ます（**フィルムルック**、**フレーミング**、**粒状感**など）。"
        },
        {
          "kind": "modules"
        },
        {
          "kind": "table",
          "head": [
            "ボタン",
            "GRKUでの働き"
          ],
          "rows": [
            [
              "{{ADJ}}",
              "ADJを開きます。GRKUで閉じたときは、電源を切ったあとも、そこからまた開きます。"
            ],
            [
              "上、下",
              "モジュールへ移動するか、選択肢を強調表示します。対応する機能ではライブビューにすぐ反映されます。"
            ],
            [
              "{{OK}}",
              "選んだモジュールを開くか、選んだ項目を確定します。"
            ],
            [
              "{{Fn}}",
              "行ごとの追加操作をします。モジュールの細かい設定、黄金らせんの次の角、またはレシピの**名称変更**と**消去**です。"
            ],
            [
              "{{MENU}}",
              "戻ります。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "モジュールのあとにある**有効**の行で、GRKUのオンとオフを切り替えます。オンにすると、有効になっている各モジュールがまた動き始めます。"
        },
        {
          "kind": "h2",
          "id": "menu",
          "text": "MENU の GRKU"
        },
        {
          "kind": "path",
          "items": [
            "MENU",
            "カスタマイズ (C)",
            "GRKU"
          ]
        },
        {
          "kind": "p",
          "text": "すべての設定はカメラのメニューからも行えます。{{MENU}} を開き、カスタムタブ（C）から一番下までスクロールすると、GRKU のセクションに次の行が表示されます。"
        },
        {
          "kind": "screen",
          "screen": "menu-grku",
          "source": "drawn",
          "alt": "MENU内のGRKUセクション（Customizeの4ページ目）。Enable GRKUはOnに設定されており、GRKU Settings、Recipes、Film Look、Framing、Crop、Guidesが表示されています。"
        },
        {
          "kind": "screen",
          "screen": "menu-grku-end",
          "source": "drawn",
          "alt": "GRKUセクションの末尾。Guides、Date Imprint、Glow、Light Leak、Diffusion、Grain、About GRKU（バージョン情報付き）が表示されています。"
        },
        {
          "kind": "p",
          "text": "通常モジュールがあるカードでは、上から順に列が並びます。新しいカードでは、選択するまですべての行が「オフ」になります。"
        },
        {
          "kind": "table",
          "head": [
            "項目",
            "表示内容と機能"
          ],
          "rows": [
            [
              "**GRKU を有効**",
              "「オン」（デフォルト）と「オフ」を選べます。GRKUの電源を切り替えます。「オン」にすると、設定済みの各機能が再び開始されます。"
            ],
            [
              "**GRKU 設定**",
              "値はありません。GRKU自体の設定を開きます: 起動時に有効、撮影設定、表示設定、終了画面、モードダイヤル、ADJメニューの順番。[GRKU 設定](doc:settings) を参照してください。"
            ],
            [
              "**レシピ**",
              "カメラがレシピと一致すればその名前を表示し、しなければ何も表示しません。GRKUがオフの間は「オフ」と表示されます。レシピ一覧を開きます（適用中のレシピがない場合、「有効」と「設定を保存」のみ表示）: レシピの適用、表示、名前の変更、削除、および「設定を保存」。[レシピ](doc:recipes) を参照してください。"
            ],
            [
              "**フィルムルック**",
              "使用中のルック、またはオフを表示します。[フィルムルック](doc:film-look)を参照してください。"
            ],
            [
              "**フレーミング**",
              "比率、またはオフを表示します。[フレーミング](doc:framing)を参照してください。"
            ],
            [
              "**クロップ**",
              "焦点距離、またはオフを表示します。[クロップ](doc:crop)を参照してください。"
            ],
            [
              "**構図ガイド**",
              "ガイド、またはオフを表示します。[構図ガイド](doc:guides)を参照してください。"
            ],
            [
              "**日付入れ撮影**",
              "日付のスタイル、またはオフを表示します。[日付入れ撮影](doc:date)を参照してください。"
            ],
            [
              "**グロー**",
              "オンになっている場合はブルームとハレーションを表示し、それ以外はオフを表示します。[グロー](doc:glow)を参照してください。"
            ],
            [
              "**ライトリーク**",
              "ルック、またはオフを表示します。[ライトリーク](doc:light-leak)を参照してください。"
            ],
            [
              "**ディフュージョン**",
              "オンになっている場合はフィルターとソフトネスを表示し、それ以外はオフを表示します。[ディフュージョン](doc:diffusion)を参照してください。"
            ],
            [
              "**ボーダー**",
              "カードにボーダーがある場合のみ表示されます。ディフュージョンと粒状感の間に表示されます。スタイル名、または「オフ」が表示されます。[ボーダー](doc:border)を参照してください。"
            ],
            [
              "**粒状感**",
              "強さ、または「オフ」を表示します。[粒状感](doc:grain)を参照してください。"
            ],
            [
              "**GRKU について**",
              "カード内のGRKUバージョン（例: 1.11.0）を表示し、バージョン、フィルムルックの数、ウェブサイトを含むページを開きます。該当する場合は、「セーフモード」または「再起動後に反映」と表示されます。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "MENU内のモジュールページは、まずそのモジュールだけの**有効**から始まり、次にオプションと順番があり、最後に設定項目が並びます。{{Fn}}でADJに表示されるページにしかない設定もあります。例えば、日付のスタイルや日付の位置などです。"
        },
        {
          "kind": "screen",
          "screen": "menu-photo",
          "source": "photo",
          "alt": "以前のGRKUが入ったGR IVのGRKUセクションの写真です。このバージョンではレシピが粒状感の後にありました。構図ガイドがハイライトされています。"
        },
        {
          "kind": "h2",
          "id": "module-rows",
          "text": "モジュールのページ"
        },
        {
          "kind": "list",
          "items": [
            "**有効** は、このモジュールだけをオンまたはオフにします。",
            "**オプション**があるモジュールでは、ADJに表示する項目を選べます。使わないフィルムルックのチェックを外すと、ADJでスキップされます。",
            "**順番**があるモジュールでは、ADJでの項目の並び順を決めます。",
            "その他の行はモジュールの設定です。このマニュアルの各ページに一覧があります。"
          ]
        },
        {
          "kind": "h2",
          "id": "jpeg",
          "text": "JPEG と DNG"
        },
        {
          "kind": "p",
          "text": "GRKUはJPEGを変えます。DNGはセンサーの生データをそのまま残すため、フィルムルックはかかりません。あとからDNGをGRKUで現像したいときは、[RAW現像](doc:raw)を見てください。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "設定は保持されます",
          "text": "GRKUの設定はカードの`GRKU`フォルダに保存され、電源を切ってもアップデートしても残ります。"
        }
      ]
    },
    "update": {
      "title": "アップデートまたはアンインストール",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/strings/en.ts (updateSteps, removeSteps, uninstall*, scriptsOff*)"
      ],
      "seo": "GRKUのアップデートやアンインストール方法、SDスクリプトの無効化",
      "lead": "アップデートしても設定とフィルムルックは維持されます。再度 MENU を押し続ける必要はありません。",
      "keywords": "アップデート アップグレード 新バージョン アンインストール 削除 消去 sd スクリプト オフ フォーマット カード バックアップ update upgrade new version uninstall remove delete sd scripts off format card backup",
      "blocks": [
        {
          "kind": "h2",
          "id": "update-site",
          "text": "サイトからアップデート"
        },
        {
          "kind": "art",
          "art": "computer",
          "alt": "grku.app が開いているパソコンと、カードリーダーに入れる SD カード。"
        },
        {
          "kind": "steps",
          "items": [
            "カードをカードリーダーに入れ（GR IV はmicroSD）、ChromeまたはEdgeで[インストールページ](site:install)を開きます。",
            "最後のステップで**SD カードを接続**を押します。変更内容が画面に表示されます。",
            "**GRKU をアップデート**を押します。",
            "カードをカメラに入れて、いつもどおり電源を入れます。"
          ]
        },
        {
          "kind": "p",
          "text": "フィルムルックを追加または削除するには、先にカードを接続し、サイト上でルックを変更して、変更リストを確認してから書き込みボタンを押します。"
        },
        {
          "kind": "h2",
          "id": "update-zip",
          "text": "GRKU.zip からのアップデート"
        },
        {
          "kind": "steps",
          "items": [
            "カメラの電源を切ります。カードから `SCRIPT` フォルダを削除します。",
            "新しい GRKU.zip の `SD_ROOT` から、`SCRIPT` フォルダだけをカードの最上位にコピーします。",
            "カードをカメラに入れて電源を入れます。{{MENU}} は押し続けないでください。"
          ]
        },
        {
          "kind": "h2",
          "id": "uninstall",
          "text": "GRKU のアンインストール"
        },
        {
          "kind": "p",
          "text": "インストールの最後のステップでカードを接続し、**GRKU をアンインストール**を押します。設定やフィルムルックも消すかどうかを選び、**Uninstall**を押してください。または、カメラの電源を切って、自分で`SCRIPT`フォルダと`GRKU`フォルダを削除してもかまいません。写真はそのまま残ります。"
        },
        {
          "kind": "h2",
          "id": "scripts-off",
          "text": "SD スクリプトをオフにする"
        },
        {
          "kind": "p",
          "text": "GRKU をアンインストールしても SD スクリプトはオンのまま残ります。GRKU を使わなくなる場合にだけオフにしてください。"
        },
        {
          "kind": "steps",
          "items": [
            "インストールの最後のステップで**SD スクリプトをオフにする**を使って、ファイルをカードに書き込みます。またはダウンロードして、`SD_ROOT`の中身をカードにコピーしてください。",
            "カードを挿入します。{{MENU}} を押したまま電源を入れ、自動で切れるまで待ちます。",
            "カードから ModeSet ファイルと `DEVELOP.MOD` を削除します。"
          ]
        },
        {
          "kind": "h2",
          "id": "format",
          "text": "カードをフォーマットする前に"
        },
        {
          "kind": "p",
          "text": "フォーマットすると GRKU とその設定が消去されます。先に写真と `GRKU` フォルダをパソコンにコピーしてください。フォーマット後に GRKU を再インストールし、`GRKU` フォルダをカードの最上位に戻します。"
        }
      ]
    },
    "film-look": {
      "title": "フィルムルック",
      "sources": [
        "modules/film-look/module.toml",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs (film, adjustments)",
        "CHANGELOG.md"
      ],
      "seo": "RICOH GRのフィルムルック：フィルムルックの使い方",
      "lead": "Image Controlの代わりに、ライブプレビューで見られる実在のフィルムや他機種カメラのルックを使えます。",
      "keywords": "フィルムルック エフェクト イメージコントロール LUT ポートラ クラシッククローム コダック 富士フイルム ファインピックス ポジティブ プレビュー Fn パラメータ フィルムストック film look effect image control lut portra classic chrome kodak fuji fujifilm finepix positive preview fn parameters film stock",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › フィルムルック"
            ],
            [
              "JPEG",
              "ルックが適用されます"
            ],
            [
              "DNG",
              "ルックなしで、生データを保持します"
            ]
          ]
        },
        {
          "kind": "steps",
          "items": [
            "{{ADJ}}を押して**GRKU**を選び、次に**フィルムルック**を選びます。",
            "ルックを選択すると、ライブビューにすぐに反映され、ルックアイコンが表示されます。",
            "{{OK}}を押して確定します。ルックを使わずに撮影する場合は**オフ**を選びます。"
          ]
        },
        {
          "kind": "screen",
          "screen": "film-look",
          "source": "drawn",
          "alt": "ADJでFilm Lookを選択し、Portra 400をハイライトした状態。ライブビューではそのフィルムルックが適用されており、Fnボタンで調整項目を開けます。"
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-portra",
          "label": "Kodak Portra 400",
          "alt": "パラソルの下のデッキチェア2脚。左はカメラの標準モード、右は Kodak Portra 400 フィルムルック。"
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-chrome",
          "label": "Fujifilm Classic Chrome",
          "alt": "同じ写真で、左は標準モード、右は Fujifilm クラシッククローム ルック。"
        },
        {
          "kind": "h2",
          "id": "adjust",
          "text": "ルックを調整する"
        },
        {
          "kind": "p",
          "text": "ルックを選んで{{Fn}}を押します。イメージコントロールと同じように、彩度、コントラスト、周辺光量落ち、明瞭度など、お使いのカメラの調整項目が開きます。調整内容はルックごとに保存されます。"
        },
        {
          "kind": "h2",
          "id": "image-control",
          "text": "フィルムルックとイメージコントロール"
        },
        {
          "kind": "p",
          "text": "ルックがオンの間は、イメージコントロールの代わりに使われます。イメージコントロールの設定は変わらず、**オフ**を選ぶと元に戻ります。"
        },
        {
          "kind": "h2",
          "id": "menu-rows",
          "text": "MENUから"
        },
        {
          "kind": "table",
          "head": [
            "項目",
            "機能"
          ],
          "rows": [
            [
              "**フィルム銘柄**",
              "ADJと同じようにルックを選びます。"
            ],
            [
              "**パラメーター**",
              "ルックがオンのときに表示されます。{{Fn}}と同じように、そのルックの調整画面を開きます。"
            ],
            [
              "**オプション**",
              "ADJに表示するルックを選びます。"
            ],
            [
              "**順番**",
              "2つ以上選択されている場合、ADJでの並び順を設定します。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "which",
          "text": "カードに入れるルック"
        },
        {
          "kind": "p",
          "text": "カードには最大40個のルックを入れられます。[インストールページ](site:install)で選び、[現像ページ](site:develop)で自分の写真に試すこともできます。[サイトでルックを選ぶ](doc:looks)をご覧ください。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "知っておくと便利なこと",
          "text": "ルックはGR IIIセンサー向けに作られているため、GR IVでは色味が少し変わることがあります。GR IV Monochromeはカラーセンサーではないため、フィルムルックはありません。"
        }
      ]
    },
    "recipes": {
      "title": "レシピ",
      "sources": [
        "modules/recipes/module.toml",
        "runtime/recipe_page.h",
        "crates/grku-core/src/menu_text.rs (recipe_*)",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "GRのフィルムレシピ：設定をワンステップで保存・切り替え",
      "lead": "カメラの設定を含めたルック全体を保存し、ワンステップで切り替えられます。",
      "keywords": "レシピ recipe สูตรสี preset save settings undo rename delete apply view white balance exposure",
      "blocks": [
        {
          "kind": "p",
          "text": "レシピには、フィルムルックまたはImage Control、粒状感、グロー、ボーダー、ホワイトバランス、カメラの補正や露出設定が保存されます。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › レシピ"
            ],
            [
              "レシピに含まれる設定",
              "ルック、粒状感、グロー、ボーダー、ホワイトバランス、露出"
            ],
            [
              "制限",
              "レシピは64個まで、ADJメニューに表示できるのは40個まで、取り消しは5回まで"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "save",
          "text": "レシピを保存する"
        },
        {
          "kind": "steps",
          "items": [
            "カメラとGRKUを好みの設定にします。",
            "{{ADJ}}を押し、**GRKU**、続いて**レシピ**を選びます。",
            "**設定を保存**を選びます。カメラのキーボードで名前を入力し、{{OK}}を押します。"
          ]
        },
        {
          "kind": "screen",
          "screen": "recipes",
          "source": "drawn",
          "alt": "レシピを保存する前のADJでのRecipes画面。左上にはSave Settingsが表示されています。"
        },
        {
          "kind": "h2",
          "id": "apply",
          "text": "レシピを使う"
        },
        {
          "kind": "steps",
          "items": [
            "**レシピ**でレシピを選択すると、ライブビューに反映され、画面左にその設定が表示されます。",
            "{{OK}}を押して適用します。ADJが閉じるか、レシピの設定を適用できなかったときにメッセージが表示されます。",
            "やっぱりやめたいときは、**元に戻す**を選びます。レシピで変えたカメラの設定を元に戻します。直近5つのレシピまで戻せます。"
          ]
        },
        {
          "kind": "list",
          "items": [
            "ADJには**元に戻す**（戻せるとき）、オンになっているレシピ、そして最後に**設定を保存**が並びます。",
            "カードには最大64個のレシピを入れられ、そのうち最大40個をADJでオンにできます。MENUの**オプション**でどれを使うか選びます。"
          ]
        },
        {
          "kind": "h2",
          "id": "edit",
          "text": "名称変更または消去"
        },
        {
          "kind": "p",
          "text": "レシピを選んで{{Fn}}を押し、**名称変更**または**消去**を選びます。MENUのレシピごとの画面には、設定をアイコンで表示する**適用**と**詳細**があります。"
        },
        {
          "kind": "h2",
          "id": "site",
          "text": "サイトのレシピ"
        },
        {
          "kind": "p",
          "text": "[インストールの手順](site:install)のステップ3で、人気のコミュニティレシピを追加したり自作したりして、ルックと一緒にカードに書き込めます。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "レシピでモジュール不足と表示される？",
          "text": "粒状感を含むレシピにはカードにGrainモジュールが必要で、GlowやBorderも同様です。カードに入っていないルックを使うレシピでは**エフェクト未インストール**と表示されます。"
        }
      ]
    },
    "framing": {
      "title": "フレーミング",
      "sources": [
        "modules/framing/module.toml",
        "modules/framing/text/en.toml"
      ],
      "seo": "RICOH GRのXPanなどのアスペクト比（フレーミング）",
      "lead": "XPan、2.35:1、16:9、1:1などのアスペクト比で撮影します。",
      "keywords": "フレーミング アスペクト比 画面比 XPan パノラマ 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 マスク 枠線 ガイド クロップ framing aspect ratio xpan panorama 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 mask frame lines guides only crop",
      "blocks": [
        {
          "kind": "frame",
          "mode": "framing",
          "alt": "選んだ比率の枠線を表示して、GRKUで撮影した石造りの家へ続く庭の小道。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › フレーミング"
            ],
            [
              "JPEG",
              "比率に合わせて切り抜く（クロップモード）"
            ],
            [
              "DNG",
              "比率に合わせて切り抜かない"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "比率を選ぶと、ライブビューに枠が表示されます。{{OK}}を押すと確定します。クロップモードではJPEGだけがこの比率に切り抜かれ、DNGは切り抜かれません。"
        },
        {
          "kind": "screen",
          "screen": "framing",
          "source": "drawn",
          "alt": "ADJでFramingを選択し、XPanをハイライトした状態。ライブビューではXPanフレーム外の領域が暗くなっています。"
        },
        {
          "kind": "settings",
          "module": "framing",
          "notes": {
            "CORE.ASPECT": "写真の比率です。3:4はハーフカメラのような縦長の枠です。",
            "CORE.ASPECT_MODE": "**クロップ**はJPEGをその比率に切り抜き、DNGは全体を残します。**構図ガイドのみ**は枠を表示しつつ、写真全体を残します。",
            "MASK": "枠の外側を画面にどう表示するかを設定します。",
            "LABEL": "撮影画面に比率を表示します。"
          }
        },
        {
          "kind": "p",
          "text": "フレーミングで{{Fn}}を押して**モード**と**マスク**を設定します。3:4はハーフサイズカメラのような縦長のフレームです。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "クロップと併用",
          "text": "フレーミングは[クロップ](doc:crop)と連携します。XPanを50 mmで撮影できます。"
        }
      ]
    },
    "crop": {
      "title": "クロップ",
      "sources": [
        "modules/crop/module.toml",
        "modules/crop/text/en.toml",
        "runtime/modules.h (GR IIIx focal lengths)"
      ],
      "seo": "RICOH GRの35mm・50mm・70mmクロップ",
      "lead": "ライブビューに枠を表示し、デジタルテレコンバーターのように長い焦点距離で撮影します。",
      "keywords": "クロップ 焦点距離 ズーム テレ フレーム マスク 枠のみ 未トリミング RAW crop focal length 35mm 40mm 50mm 70mm 57mm 71mm 100mm zoom tele frame only mask uncropped raw",
      "blocks": [
        {
          "kind": "frame",
          "mode": "crop",
          "alt": "GRKUで撮影し、選んだ焦点距離の枠をつけた、石造りの家へ続く庭の小道。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › クロップ"
            ],
            [
              "選択肢",
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
            "CORE.CROP": "デジタルテレコンバーターのような焦点距離です。GR IIIxでは50、57、71、100mmと表示されます。",
            "CORE.CROP_MODE": "**クロップ**は写真を切り抜きます。**枠のみ**は枠を表示し、写真全体を残します。",
            "MASK": "枠の外側を画面にどう表示するかを設定します。"
          }
        },
        {
          "kind": "p",
          "text": "Cropで{{Fn}}を押すと、**モード**と**マスク**を設定できます。35mm、40mm、50mmでは枠なしでライブビューが拡大します。70mmでは50mmの画面の中に枠が表示され、GR IVの40mmでは35mmの画面の中に枠が表示されます。クロップモードでは、**RAW クロップなし**がオンでない限り、JPEGとDNGの両方が切り抜かれます。ADJでは、選択中の焦点距離の枠がライブビューに表示されます。Cropはすべての**フレーミング**比率で使えます。"
        },
        {
          "kind": "screen",
          "screen": "crop",
          "source": "drawn",
          "alt": "ADJでCropを選択し、50mmをハイライトした状態。ライブビューは50mm相当にズームインしています。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "DNG に全体を残す",
          "text": "[GRKU 設定](doc:settings#shooting) で **RAW クロップなし** をオンにします。すると DNG にセンサー全体の画像が残り、Lightroom で開いたときにクロップを元に戻せます。"
        }
      ]
    },
    "guides": {
      "title": "構図ガイド",
      "sources": [
        "modules/guides/module.toml",
        "modules/guides/text/en.toml"
      ],
      "seo": "GRの構図ガイド：三分割法、黄金比、螺旋",
      "lead": "画面に表示される構図の線です。写真には写りません。",
      "keywords": "構図ガイド グリッド ガイドライン 9分割 画面中央 黄金比 対角線 黄金螺旋 ダイナミックシンメトリー 構図 表示 不透明度 色 guides grid lines thirds center golden ratio diagonals golden spiral dynamic symmetry composition disp opacity color",
      "blocks": [
        {
          "kind": "frame",
          "mode": "guides",
          "alt": "GRKUで撮影し、選んだガイドの線をつけた、石造りの家へ続く庭の小道。"
        },
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › 構図ガイド"
            ],
            [
              "写真",
              "写真には写りません"
            ],
            [
              "{{Fn}}",
              "黄金螺旋を回す"
            ]
          ]
        },
        {
          "kind": "settings",
          "module": "guides",
          "notes": {
            "STYLE": "画面に表示される線です。写真には写りません。",
            "COLOR": "線の色です。",
            "OPACITY": "線の濃さです。",
            "DISP": "オン：{{DISP}}で画面表示を消したとき、線も隠れます。オフ：いつも表示します。",
            "SPIRAL": "黄金螺旋が回る向きです。ADJで黄金螺旋を選んだ状態で{{Fn}}を押すと、次の角へ回ります。"
          }
        },
        {
          "kind": "p",
          "text": "ADJで**黄金螺旋**を選んだ状態で{{Fn}}を押すと、螺旋が次の角へ回ります。GRKUがガイドを表示している間、カメラ内蔵のグリッド線は非表示になります。"
        }
      ]
    },
    "date": {
      "title": "日付入れ撮影",
      "sources": [
        "modules/date/module.toml",
        "modules/date/text/en.toml",
        "CHANGELOG.md 1.9.0, 1.10.0"
      ],
      "seo": "RICOH GR写真の日付スタンプ（日付入れ撮影）",
      "lead": "フィルムカメラのように写真へ日付を印字します。3種類のフォント、5色のカラー、キャプションに対応しています。",
      "keywords": "日付入れ撮影 スタンプ 時刻 フォント クラシック gr1s gr ii 色 オレンジ サイズ 位置 角 キャプション ありがとう ハッピーバースデー grku グロー date imprint stamp time font classic gr1s gr ii color orange size position corner caption thank you happy birthday grku glow",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › 日付印画"
            ],
            [
              "JPEG",
              "日付が書き込まれます"
            ],
            [
              "DNG",
              "日付なし"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "chairs-standard",
          "after": "chairs-date",
          "label": "日付入れ撮影: YY M D",
          "alt": "パラソルの下のデッキチェア2脚。左は日付なし、右は「日付入れ」設定（YY M D、フィルム位置：右下、サイズ：M、書体：クラシック、色：標準）。"
        },
        {
          "kind": "p",
          "text": "日付スタイルを選んで{{OK}}を押します。その他の設定は{{Fn}}を押します。カメラ内時計の日時が印字されるため、先に時計を合わせてください。"
        },
        {
          "kind": "settings",
          "module": "date",
          "notes": {
            "STYLE": "日付の並び順です（時刻あり・なしを選べます）。カメラの時計の日時が写し込まれるので、先に時計を合わせてください。MENUの項目ではなく、ADJまたはADJの{{Fn}}から選びます。",
            "POSITION": "**フィルム**はフィルムカメラと同じ位置に写し込みます。**正位置**は縦位置の写真でも向きをそろえて写し込みます。MENUの項目ではなく、ADJで{{Fn}}を押して設定します。",
            "CORNER": "日付を入れる位置です。下部左右は左に日付、右にキャプションを入れます。",
            "SIZE": "数字の大きさです。",
            "LOOK": "フォントです。Classic、GR1s（ドット文字）、またはGR IIを選べます。",
            "COLOR": "標準はフォントの色です。ClassicとGR IIはオレンジ、GR1sは黄色になります。白黒写真は白になります。",
            "GLOW": "数字のまわりのやわらかい光のにじみです。GR IIはにじみのないフラットな数字になります。",
            "CAPTION": "日付の前に入る言葉です。写真では<3がハートになります。",
            "ICON": "撮影画面に日付のスタイルを表示します。"
          }
        },
        {
          "kind": "compare",
          "before": "chairs-date-crop",
          "after": "chairs-date-gr1s-crop",
          "beforeLabel": "日付の書体: クラシック",
          "label": "日付の書体: GR1s",
          "alt": "写真の右下隅。左はクラシック書体、右は GR1s 書体での日付表示。他の設定は同じ。"
        }
      ]
    },
    "glow": {
      "title": "グロー",
      "sources": [
        "modules/glow/module.toml",
        "modules/glow/text/en.toml"
      ],
      "seo": "RICOH GRのブルームとハレーション（グロー）",
      "lead": "光やハイライトのにじむブルームと、映画フィルムのような赤やオレンジのハレーション。",
      "keywords": "グロー ブルーム ハレーション シネスティル 赤 オレンジ ゴールド 白 ハイライト 光 夜 glow bloom halation cinestill red orange gold white highlights lights night",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › グロー"
            ],
            [
              "JPEG",
              "JPEGのみ"
            ],
            [
              "ライブビュー",
              "プレビューなし：再生で確認してください"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-bloom",
          "label": "ブルーム: 強",
          "alt": "曇り日のヒナギク。ブルームなしと、強設定での比較です。明るいハイライト部分で最も効果が出ます。"
        },
        {
          "kind": "p",
          "text": "グローには2つの要素があります。それぞれ強さを設定でき、両方あわせて使うこともできます。"
        },
        {
          "kind": "p",
          "text": "ADJで**ブルーム**または**ハレーション**を選択し、{{Fn}}を押すと、ハレーションの色やアイコンなどの追加設定を開けます。"
        },
        {
          "kind": "settings",
          "module": "glow",
          "notes": {
            "BLOOM": "**ブルーム**：明るい部分のまわりのやわらかい光のにじみです。",
            "BLOOM_ICON": "撮影画面にBloomアイコンを表示します。",
            "HALATION": "**ハレーション**：CineStillフィルムのような、光のまわりの色のにじみです。",
            "HALATION_COLOR": "ハローの色です。GR IV Monochromeでは設定できません。",
            "HALATION_ICON": "撮影画面にハレーションのアイコンを表示します。"
          }
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "再生画面で確認",
          "text": "グローはJPEGのみに適用され、ライブビューには表示されません。再生画面で写真を確認してください。"
        }
      ]
    },
    "light-leak": {
      "title": "ライトリーク",
      "sources": [
        "modules/lightleak/module.toml",
        "modules/lightleak/text/en.toml",
        "modules/lightleak/lightleak.c"
      ],
      "seo": "GRの光漏れ、ダスト、周辺減光エフェクト",
      "lead": "古いフィルムのあと：周辺減光、ホコリや髪の毛、光漏れ、キズ。",
      "keywords": "ライトリーク 周辺減光 ダスト キズ 色あせ 期限切れ 古いフィルム ロモ レトロ light leak vignette dust scratches faded dusty leaky expired old film lomo retro",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › ライトリーク"
            ],
            [
              "JPEG",
              "JPEGのみ"
            ],
            [
              "ライブビュー",
              "プレビューなし：再生で確認してください"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-leak",
          "label": "ライトリーク: 光漏れ",
          "alt": "石造りの家と庭の小道。ライトリークなしと、「Leaky」設定での比較です。"
        },
        {
          "kind": "settings",
          "module": "lightleak",
          "notes": {
            "LOOK": "**カスタム**は、下のスライダーで強さを調整します。他は预设の組み合わせです。",
            "VIGNETTE": "四すみを暗くします。**カスタム**と一緒に使います。",
            "DUST": "ほこりや髪の毛のような写り込みです。**カスタム**と一緒に使います。",
            "LEAK": "はしから光がもれてフィルムがかぶったような写り込みです。**カスタム**と一緒に使います。",
            "SCRATCH": "フィルムのキズのような写り込みです。**カスタム**と一緒に使います。"
          }
        },
        {
          "kind": "p",
          "text": "**カスタム**を選び、{{Fn}}を押して各パーツの強さを設定します。ダスト、光漏れ、キズは写真ごとに違う入り方をします。Light LeakはJPEGだけを変え、ライブビューには表示されません。"
        }
      ]
    },
    "diffusion": {
      "title": "ディフュージョン",
      "sources": [
        "modules/diffusion/module.toml",
        "modules/diffusion/text/en.toml"
      ],
      "seo": "GRでのブラックプロミストディフュージョンとフィルムの柔らかさ",
      "lead": "ブラックプロミストフィルターの柔らかなにじみと、フィルムスキャンのようなやさしい柔らかさ。",
      "keywords": "ディフュージョン フィルター プロミスト ブラックミスト ストリーク アナモルフィック 柔らかさ フィルム 優しい diffusion filter pro mist black mist streak anamorphic softness film softness soft dreamy",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › ディフュージョン"
            ],
            [
              "JPEG",
              "JPEGのみ"
            ],
            [
              "ライブビュー",
              "プレビューなし：再生で確認してください"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-diffusion",
          "label": "フィルター: 1/2",
          "alt": "ヒナギク。ディフュージョンフィルターなしと、1/2設定での比較です。"
        },
        {
          "kind": "compare",
          "before": "daisy-standard",
          "after": "daisy-softness",
          "label": "フィルムソフトネス: 強",
          "alt": "ヒナギク。フィルムソフトネスなしと、強設定での比較です。"
        },
        {
          "kind": "p",
          "text": "ディフュージョンには**フィルター**と**ソフトネス**の2つの項目があり、それぞれ独立して働きます。"
        },
        {
          "kind": "settings",
          "module": "diffusion",
          "notes": {
            "STRENGTH": "**フィルター**：ディフュージョンフィルターの効果の強さです。フィルターの番手のようなものです。",
            "MIST": "**フィルター**：影にかかるうすい膜のような効果です。**強度**が**オフ**以外のときに有効になります。",
            "STREAK": "**フィルター**：点光源にアナモルフィックレンズのような横長の光条を出します。**強度**が**オフ**以外のときに有効になります。",
            "SOFTNESS": "**ソフトネス**：フィルムスキャンのように細部がやわらかくなり、ハイライトがなだらかに落ちます。これだけでも効果があります。"
          }
        },
        {
          "kind": "p",
          "text": "**ディフュージョン**はJPEGのみに反映され、ライブビューには表示されません。"
        }
      ]
    },
    "grain": {
      "title": "粒状感",
      "sources": [
        "modules/grain/module.toml",
        "modules/grain/text/en.toml",
        "modules/grain/grain.c",
        "CHANGELOG.md 1.10.0"
      ],
      "seo": "RICOH GRのフィルム粒状感：強さ、サイズ、フィルム調",
      "lead": "4段階の強度と4段階のサイズでフィルム粒状感を表現し、カメラの粒状感または**フィルム調**を選べます。",
      "keywords": "粒状感 ノイズ フィルム調 システム サイズ 強度 弱 中 強 特強 grain noise film-like system size strength weak medium strong extra",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › グレイン"
            ],
            [
              "スタイル",
              "システムまたはフィルム調"
            ],
            [
              "サイズ オート",
              "撮影時のISOに連動します"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard-crop",
          "after": "house-grain-crop",
          "label": "粒状感: 強, サイズ 中, フィルム調",
          "alt": "石壁と日よけの拡大表示。粒状感なしと、強・サイズ中・スタイルフィルム調での比較です。"
        },
        {
          "kind": "settings",
          "module": "grain",
          "notes": {
            "CORE.GRAIN": "粒子の強さです。",
            "CORE.GRAIN_SIZE": "粒子の大きさです。**オート**は撮ったときのISO感度に合わせます。",
            "STYLE": "**システム**はカメラの粒子です。**フィルム調**はカラーネガプリントの粒子で、中間調がいちばん強く、白と黒には出ず、カラー写真では色がつきます。",
            "ICON": "撮影画面に粒子のアイコンを表示します。"
          }
        },
        {
          "kind": "p",
          "text": "粒状感で{{Fn}}を押すと、**サイズ**と**スタイル**を設定できます。フィルム調の粒状感は、Andrea Volpatoによるspektrafilmのグレインモデルに従っています。"
        }
      ]
    },
    "border": {
      "title": "ボーダー",
      "sources": [
        "modules/border/module.toml",
        "modules/border/text/en.toml",
        "CHANGELOG.md 1.8.5",
        "web/src/generated/modules.ts (DEFAULT_MODULES)"
      ],
      "seo": "GRでの白、黒、インスタント写真の枠",
      "lead": "写真全体の周囲に白または黒のボーダーを追加します。写真の画素はすべて保持されます。",
      "keywords": "border frame white black thin wide instant polaroid edge ボーダー フレーム 白 黒 細い 太い インスタント ポラロイド 縁",
      "blocks": [
        {
          "kind": "facts",
          "cells": [
            [
              "場所",
              "ADJ › GRKU › ボーダー"
            ],
            [
              "JPEG",
              "ボーダー分だけ大きくなります"
            ],
            [
              "DNG",
              "ボーダーなし"
            ]
          ]
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-border-wide",
          "label": "ボーダー: 太い, 白",
          "alt": "石造りの家。白い「Wide」ボーダーなしとありの比較です。"
        },
        {
          "kind": "compare",
          "before": "house-standard",
          "after": "house-border-instant",
          "label": "ボーダー: インスタント・白",
          "alt": "石造りの家。白い「Instant」ボーダーなしとありの比較です。"
        },
        {
          "kind": "settings",
          "module": "border",
          "notes": {
            "CORE.BORDER": "**細い**は短い辺の約3%、**太い**は約6%、**インスタント**は約4%で、下だけ3倍の太さになります。GR IVでは、カメラの空きメモリが少ないと大きな枠が少し細くなることがあります。",
            "CORE.BORDER_COLOR": "枠の色です。",
            "ICON": "撮影画面に枠のアイコンを表示します。"
          }
        },
        {
          "kind": "p",
          "text": "ボーダーの分だけJPEGのサイズが広がるため、写真が隠れることはありません。カメラ内のRAW現像でもボーダーを追加できます。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "カードに入っていない場合",
          "text": "最初はボーダーが入りません。[インストール](site:install)のステップ3でボーダーを**オン**にしてください。カードに入れられるモジュールは最大10個です。10個すべて**オン**の場合は、あまり使わないものを1つ**オフ**にしてください。"
        }
      ]
    },
    "mode-dial": {
      "title": "モードダイヤルとU1–U3",
      "sources": [
        "runtime/mode_dial.h",
        "runtime/menu_dial.h",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "モードダイヤルのGRKU：U1、U2、U3設定",
      "lead": "ダイヤルの各ポジションでGRKUのオン・オフを切り替え、U1、U2、U3にルックをまとめて保存できます。",
      "keywords": "モードダイヤル ユーザーモード 現在の設定を保存 ポジション カメラメニュー mode dial u1 u2 u3 user mode save current settings p av tv m sn position",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "カスタマイズ (C)",
            "GRKU",
            "GRKU 設定",
            "**モードダイヤル**"
          ]
        },
        {
          "kind": "p",
          "text": "P、Av、Tv、M、そしてSn（GR IV）は、1つのGRKU設定を共有します。GR IVでは、このページにP、Av、Tv、Sn、Mの順に並びます。それぞれの位置でGRKUを**オン**または**オフ**にできます。**GRKU を有効**が**オン**のときに動きます。"
        },
        {
          "kind": "screen",
          "screen": "mode-dial-gr4",
          "source": "drawn",
          "alt": "GR IVのGRKU SettingsにあるMode Dialページ。P、Av、Tv、Sn、M、U1モードでGRKUがOnになっています。"
        },
        {
          "kind": "h2",
          "id": "user",
          "text": "U1、U2、U3"
        },
        {
          "kind": "list",
          "items": [
            "**オン**: 共有のGRKU設定を使います。P、Av、Tv、Mと同じ動作です。",
            "**オフ**: GRKUを使わずに撮影します。",
            "**現在の設定を保存**：いまのカメラ設定とGRKU設定をこの位置に保存します。ユーザーモードを上書きする前にカメラが確認し、名前を入力するキーボードが開きます。ダイヤルをそこへ合わせると、両方とも元に戻ります。保存した名前がその位置に表示されます。ADJの並び順、**起動時に有効**、**GRKU を有効**、または**モードダイヤル**の設定は保存されません。"
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "カメラメニューでの保存",
          "text": "RICOHのカメラメニューでユーザーモードを上書き保存すると、そのポジションのGRKUルックは外れます。代わりにGRKU 設定の**現在の設定を保存**を使ってください。"
        }
      ]
    },
    "raw": {
      "title": "RAW現像",
      "sources": [
        "runtime/develop_settings.h",
        "runtime/picture.c",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "GRのDNGファイルをフィルムルックで現像（RAW現像）",
      "lead": "GRKUは生データを変更しません。カメラ内でGRKUを使ってDNGを現像するか、パソコンで現像できます。",
      "keywords": "RAW現像 再生 DNG カメラ内現像 パソコン現像 raw dng development develop in camera playback lightroom camera raw exiftool xmp uncropped",
      "blocks": [
        {
          "kind": "h2",
          "id": "camera",
          "text": "カメラ内での現像"
        },
        {
          "kind": "steps",
          "items": [
            "再生画面でDNGを開き、RAW現像を始めます。",
            "フィルムルックを変えるには、Image Controlの一覧を開きます。ルックの上で{{Fn}}を押すと調整できます。",
            "粒状感、グロー、ボーダー、日付入れ撮影を設定するには、リストの最後にある **GRKU** の項目を開きます。",
            "現像を実行します。"
          ]
        },
        {
          "kind": "p",
          "text": "DNGにGRKUの設定が記録されている場合、現像はその設定から始まります。GRKUの行が変わるのはこの現像だけです。現像の一覧から別の**フレーミング**比率を選ぶこともできます。"
        },
        {
          "kind": "h2",
          "id": "computer",
          "text": "パソコンでの操作"
        },
        {
          "kind": "p",
          "text": "GRKUをオンにして撮った写真には設定がXMPに記録されるため、exiftoolなどのXMPリーダーで確認できます。**RAW クロップなし**をオンにすると、LightroomやCamera Rawで撮影時のクロップ枠付きのDNGが開き、そのクロップを元に戻せます。"
        },
        {
          "kind": "p",
          "text": "すでにある写真には、[現像ページ](doc:develop) でブラウザから同じルックと効果を適用できます。"
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
      "seo": "MENUのGRKU 設定：各オプションの解説",
      "lead": "MENU にある GRKU 自体の設定です。",
      "keywords": "grku settings enable at start keep last uncropped raw distance unit meters feet battery playback icons shutdown screen custom picture show text adj order hidden top GRKU 設定 起動時に有効 前回のまま RAW クロップなし 距離単位 メートル フィート バッテリー 再生アイコン 終了画面 カスタム イメージ テキスト表示 ADJ メニューの順番 非表示 トップ",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "カスタマイズ (C)",
            "GRKU",
            "GRKU 設定"
          ]
        },
        {
          "kind": "table",
          "head": [
            "項目",
            "機能"
          ],
          "rows": [
            [
              "**起動時に有効**",
              "電源を入れるたびのGRKUの状態です。**オン**（初期設定）、**オフ**、または最後に使った状態の**前回のまま**から選べます。"
            ],
            [
              "**モードダイヤル**",
              "ダイヤル各位置と U1〜U3 での GRKU のオン/オフを設定します。詳しくは [モードダイヤル](doc:mode-dial) をご覧ください。"
            ],
            [
              "**ADJ メニューの順番**",
              "ADJ の GRKU リストにおけるモジュールの並び順です。"
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "grku-settings",
          "source": "drawn",
          "alt": "GRKU Settingsページ。Enable at Start、Shooting Settings、Display Settings、Shutdown Screen、Mode Dial、ADJ Orderが表示されています。"
        },
        {
          "kind": "p",
          "text": "カメラの画面では、**起動時に有効**、**撮影設定**、**表示設定**、**終了画面**、**モードダイヤル**、続いて**ADJ メニューの順番**と並びます。各スイッチは**オン**が先、**オフ**が後に並びます。"
        },
        {
          "kind": "h2",
          "id": "adj-order",
          "text": "ADJ メニューの順番"
        },
        {
          "kind": "p",
          "text": "GRKU リスト内でモジュールを上下に移動します。**上段 1** から **上段 4** にすると、ADJ ツールバーの GRKU の前に専用項目として表示され、1 回押すだけで使えます。**非表示** にすると、機能を維持したまま ADJ から隠します。"
        },
        {
          "kind": "h2",
          "id": "shooting",
          "text": "撮影設定"
        },
        {
          "kind": "table",
          "head": [
            "項目",
            "機能"
          ],
          "rows": [
            [
              "**RAW クロップなし**",
              "初期設定は**オフ**です。**オン**にすると、各DNGにセンサー全体の画像が残り、撮影時の切り抜きはLightroomやCamera Rawで元に戻せる設定として扱われます。その場合、Lightroom独自のRAW初期設定が適用されないことがあります。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "display",
          "text": "表示設定"
        },
        {
          "kind": "table",
          "head": [
            "項目",
            "機能"
          ],
          "rows": [
            [
              "**距離の単位**",
              "スナップフォーカス距離とマニュアルフォーカス目盛の表示単位を**メートル**（初期設定）または**フィート**にします。"
            ],
            [
              "**簡易情報の電池**",
              "初期設定は**オフ**です。**オン**にすると、ライブビューの簡易情報表示にも電池残量アイコンが出ます。"
            ],
            [
              "**再生時の効果アイコン**",
              "詳細再生情報の1ページ目に、写真の粒状感、ブルーム、ハレーション、ボーダー、日付入れ撮影のアイコンと、写真のクロップを表示します。デフォルトでオンです。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "shutdown",
          "text": "終了画面"
        },
        {
          "kind": "table",
          "head": [
            "項目",
            "機能"
          ],
          "rows": [
            [
              "**カスタム画像**",
              "カメラの電源を切るときに、自分の画像（`GRKU/GOODBYE.JPG`）を表示します。初期設定はオンです。[シャットダウン画像](doc:shutdown)をご覧ください。"
            ],
            [
              "**文字を表示**",
              "初期設定は**オン**です。**オフ**にすると、電源を切るときに表示される撮影枚数とファームウェアのバージョンが隠れます。"
            ]
          ]
        }
      ]
    },
    "looks": {
      "title": "サイトでルックを選ぶ",
      "sources": [
        "web/src/plus.ts (FREE_SLOTS)",
        "web/src/lookSearch.ts",
        "web/src/strings/en.ts (importOpen, kindImported)",
        "CHANGELOG.md 1.9.0 (xmp)"
      ],
      "seo": "フィルムルックの選び方とLUTまたはLightroomプリセットの読み込み",
      "lead": "カードに入れるフィルムルックを選び、ライブラリを検索して、自分のLUTを読み込みます。",
      "keywords": "ライブラリ ルックを選ぶ 検索 スロット 無料 10 40 読み込み lut cube xmp lightroom プリセット 種類 ネガ リバーサル 白黒 library choose looks search slots free 10 40 import lut cube xmp lightroom preset kinds negative slide black and white",
      "blocks": [
        {
          "kind": "p",
          "text": "[インストール](site:install)のステップ1では、ライブラリ全体を表示します。Kodak、Fujifilm、Ilford、CineStill、Polaroid、シネマフィルム、リバーサルフィルム、白黒、FUJIFILMカメラのフィルムシミュレーション、Positive GRIIやFinePix CCDなどのGRKU独自のルックがあります。"
        },
        {
          "kind": "h2",
          "id": "pick",
          "text": "ルックを選ぶ"
        },
        {
          "kind": "steps",
          "items": [
            "ルックをタップすると、サンプル写真での仕上がりを確認できます。",
            "カードに入れたいルックにチェックを入れます。10個までは無料、カードには最大40個まで入れられます。",
            "名前やメーカー、種類で検索できます（例：「portra」「fuji」「ขาวดำ」）。長い単語のちょっとした入力ミスでも検索できます。"
          ]
        },
        {
          "kind": "p",
          "text": "自分の写真で先に仕上がりを見たい場合は、**自分の写真で試す**を押して[現像ページ](doc:develop)で開きます。"
        },
        {
          "kind": "h2",
          "id": "import",
          "text": "自分のルックを読み込む"
        },
        {
          "kind": "steps",
          "items": [
            "ステップ1で**LUT を読み込む**を押します。",
            "`.cube`ファイルまたはLightroomの`.xmp`プリセットを選びます。",
            "ルックは**インポート**の下に表示されます。ほかのルックと同じようにチェックを入れます。"
          ]
        },
        {
          "kind": "p",
          "text": "Lightroomプリセットは、そのカラー設定をもとにしたルックになります。写真ごとに変化する設定は目安のみです。"
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "モジュール"
        },
        {
          "kind": "p",
          "text": "ステップ3でモジュールを選びます。カードに入れられるのは全11モジュールのうち最大10個です。最初はボーダーが入りません。ステップ3ではレシピや[終了画面](doc:shutdown)も追加します。"
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
      "seo": "GRKU Plus：料金、支払い、ライセンスキー",
      "lead": "SDカードにさらに多くのルックを追加できる買い切りのオプションです。なしでもGRKUは無料で使えます。",
      "keywords": "プラス 料金 支払い 購入 キー メール PromptPay TrueMoney スロット パック すべて 解除 返金 バーツ plus price pay buy key email promptpay truemoney slots pack everything unlock refund baht",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKUのすべての機能は無料です。すべてのルックのプレビュー、ライブラリのルック10個のカード書き込み、すべてのモジュール、レシピ、現像ページは無料で使えます。GRKU Plusは、カードにさらに多くのルックを入れたい方やプロジェクトを応援したい方向けです。"
        },
        {
          "kind": "h2",
          "id": "tiers",
          "text": "解除できる内容"
        },
        {
          "kind": "list",
          "items": [
            "**25 slots**：10個ではなく、好きなルックを25個カードに入れられます。",
            "**One pack**：Kodakカラーやモノクロなど、1つのフィルム系統の全ルックを無料枠に加えて追加できます。",
            "**Everything**：すべてのルックと新作ルック、一度に40個までカードに入れられる枠、そしてGRKU Studioのすべてが使えます。"
          ]
        },
        {
          "kind": "p",
          "text": "どの購入でもGRKU Studioとそのデザインすべてが使えます。料金は[GRKU Plus](site:plus)ページにあります。以前のお支払いはEverythingと25スロット分に充てられ、パックには充てられません。発売記念価格は2027年1月1日に終了します。"
        },
        {
          "kind": "h2",
          "id": "pay",
          "text": "お支払い"
        },
        {
          "kind": "steps",
          "items": [
            "[GRKU Plus](site:plus)を開き、解除したい内容を選びます。",
            "メールアドレスを入力し、[利用規約](site:terms)に同意します。",
            "タイの銀行アプリのPromptPay QRで支払い、明細画像をアップロードします。シートに表示される場合はTrueMoneyのギフトリンクを貼り付けることもできます。",
            "すぐにルックが使えるようになります。",
            "キーがメールで届きます。どの端末でも使えます。"
          ]
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "返金について",
          "text": "購入後すぐにデータが届くため、都合による返金はできません。キーが届かない場合や、当方の不備により14日以内にルックが解除されない場合は全額返金します。[利用規約](site:terms)をご覧ください。"
        },
        {
          "kind": "h2",
          "id": "key",
          "text": "別の端末でキーを使う"
        },
        {
          "kind": "p",
          "text": "[GRKU Plus](site:plus-key)を開き、**キーをお持ちの方**を選んでキーを貼り付け、**解除**を押します。メールが届かない場合も、**キーをお持ちの方**から再送できます。"
        }
      ]
    },
    "shutdown": {
      "title": "終了画面とGRKU Studio",
      "sources": [
        "web/src/strings/en.ts (shutdown)",
        "web/src/shutdownDesigns.ts",
        "CHANGELOG.md 1.9.0, 1.10.0",
        "runtime/manage.h (Custom Picture, Show Text)"
      ],
      "seo": "RICOH GRのカスタム終了画面（GRKU Studio）",
      "lead": "カメラの電源を切るときに好みの画像を表示したり、GRKU Studioでデザインを作成したりできます。",
      "keywords": "シャットダウン 終了画面 画像 グッバイ 電源オフ Studio デザイン ステッカー テンプレート ロゴ カスタム画像 shutdown screen picture goodbye power off studio design sticker template logo custom picture",
      "blocks": [
        {
          "kind": "p",
          "text": "カメラの電源を切るとき、GRKUは好みの画像を表示できます。カメラはカードの`GRKU/GOODBYE.JPG`を読み込みます。"
        },
        {
          "kind": "h2",
          "id": "choose",
          "text": "画像を選ぶ"
        },
        {
          "kind": "steps",
          "items": [
            "[インストール](site:install)の手順3で、終了画面のカードを探します。",
            "用意されたデザインを選ぶか、自作するか、カメラ標準の画面にするには「オフ」を選びます。",
            "いつも通りにカードを書き込みます。次の電源オンから新しい画面が表示されます。GRKU.zipの場合は `GOODBYE.JPG` もダウンロードし、カードの `GRKU` フォルダーに入れてください。"
          ]
        },
        {
          "kind": "p",
          "text": "用意されたデザインには、夕焼け、眠そうな月、昼寝する猫、フィルムロール、レシートなどがあり、任意のテキストを入れられます。自作の写真は3:2にトリミングされます。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "カメラの電源が切れない？",
          "text": "壊れた`GOODBYE.JPG`があると、カメラの電源が切れないことがあります。電池を抜き、パソコンでカードから`GRKU/GOODBYE.JPG`を削除してから、サイトで画像を書き込んでください。"
        },
        {
          "kind": "h2",
          "id": "studio",
          "text": "GRKU Studio"
        },
        {
          "kind": "p",
          "text": "GRKU Studioはレイヤー式のエディターで、背景、自分の写真、ロゴ、切り抜きPNGファイル、8種類のフォントのテキスト、ステッカー、フレーム、そしてソンクラーン、ロイクラトン、新年、バレンタインデーのテンプレートが使えます。ツールバーから追加するか、ファイルをドロップするか、貼り付けて画像を追加します。"
        },
        {
          "kind": "p",
          "text": "GRKU Studioの一部機能と一部のデザインは無料です。[GRKU Plus](doc:plus)を購入するとすべて使えるようになります。"
        },
        {
          "kind": "h2",
          "id": "camera",
          "text": "カメラでの設定"
        },
        {
          "kind": "p",
          "text": "[GRKU 設定](doc:settings#shutdown)で、**カスタム画像**により画像のオン・オフを切り替えられ、**文字を表示**でカメラが重ねて表示する撮影枚数を非表示にできます。"
        }
      ]
    },
    "develop": {
      "title": "現像ページ",
      "sources": [
        "web/src/components/Develop.tsx",
        "web/src/develop/gating.ts",
        "web/src/develop/install.ts",
        "CHANGELOG.md 1.10.1"
      ],
      "seo": "写真向けの無料オンラインフィルムフィルター（Develop）",
      "lead": "お手持ちの写真に、GRKUのフィルムルックや効果をブラウザー上で適用できます。",
      "keywords": "現像 編集 写真 ブラウザー オンライン フィルター 試す プレビュー ダウンロード カメラ不要 スマホ develop edit photo browser online filter try preview download no camera phone",
      "blocks": [
        {
          "kind": "p",
          "text": "[現像ページ](site:develop)では、お手持ちの写真にGRKUのフィルムルックを当てて、カメラのモジュールコードによる効果を確認できます。カメラは不要で、写真が端末の外に出ることはありません。"
        },
        {
          "kind": "steps",
          "items": [
            "[現像ページ](site:develop)を開き、写真を追加します。",
            "ルックを選び、グロー、ライトリーク、ディフュージョン、フィルムソフトネス、粒状感、日付入れ撮影、ボーダーなどの効果を追加します。",
            "写真を保存します。または **GRに追加する** を押すと、選んだルックとモジュールが選択された状態でインストールページが開きます。各効果の強さはカメラ側で設定します。"
          ]
        },
        {
          "kind": "p",
          "text": "無料版では、カメラのルック、スタータールック、またはルックなしを、小さなGRKUクレジット付きで最大2048 px、1回につき5枚まで保存できます。GRKU Plusを購入すると、クレジットなしで全ルックをフルサイズで、1回につき50枚まで保存できます。"
        }
      ]
    },
    "assistant": {
      "title": "AIアシスタント",
      "sources": [
        "web/src/chat/strings.ts",
        "web/src/components/ChatPanel.tsx",
        "services/plus/src/chat/index.ts"
      ],
      "seo": "GRKU AIアシスタント：GRやフィルムルックについて質問",
      "lead": "インストール方法やカメラ、写真に合うルックについてGRKUアシスタントに質問できます。",
      "keywords": "AIアシスタント チャット 質問 ヘルプ ボット マスコット メモリ ai assistant chat ask question help bot mascot memory",
      "blocks": [
        {
          "kind": "p",
          "text": "サイトのページ右下にある丸いボタンを押すと、GRKUアシスタントが開きます。このサイトとマニュアルの内容をもとに、あなたの言語で答え、該当ページへのリンクも表示します。"
        },
        {
          "kind": "h2",
          "id": "ask",
          "text": "よくある質問例"
        },
        {
          "kind": "list",
          "items": [
            "「GR IIIxにGRKUをインストールするにはどうすればよいですか？」",
            "「MENUを長押しするとファームウェアアップデートが表示されます。」",
            "「ポートレートに合う暖色系のルックを教えてください。」",
            "「**ハレーション**とはどのような効果ですか？」"
          ]
        },
        {
          "kind": "p",
          "text": "マニュアルの各ページにある「**Ask AI about this page**」を押すと、そのページの内容を踏まえてアシスタントが開きます。"
        },
        {
          "kind": "h2",
          "id": "limits",
          "text": "知っておくと便利なこと"
        },
        {
          "kind": "list",
          "items": [
            "1日のメッセージ数に上限があります。GRKU Plusをお持ちの場合は、より深い対話と詳しい回答を利用できます。",
            "記憶機能をオンにすると、お使いのカメラやファームウェアのバージョン、好みのルックをブラウザに保存し、質問と一緒に送信します。",
            "返信を作るため、メッセージはAIサービスへ送信されます。個人情報は入力しないでください。",
            "AIの回答には誤りが含まれることがあります。カメラのファームウェアに関する情報は、本マニュアルとRICOHの案内をご確認ください。"
          ]
        }
      ]
    },
    "not-showing": {
      "title": "GRKUが表示されない",
      "sources": [
        "docs/diagnostics.md",
        "resources/INSTALLATION-GR4.md (Troubleshooting)",
        "web/src/strings/en.ts (faq adj)"
      ],
      "seo": "カメラにGRKUが表示されないときの対処法",
      "lead": "上から順に、1つずつ確認してください。",
      "keywords": "表示されない 動かない 見つからない ADJ GRKUなし エラー install.err レポート boot.txt 47 48 ファームウェア モード設定 not showing not working missing adj no grku error install.err report boot.txt 47 48 firmware mode set",
      "blocks": [
        {
          "kind": "flow",
          "steps": [
            {
              "see": "電源を入れても画面の上に **GRKU** が表示されない。",
              "then": "初回は最大1分ほど待ちます。その後、下のチェック項目を確認してください。"
            },
            {
              "see": "{{MENU}} を長押しすると、カメラにファームウェア更新画面が表示される。",
              "then": "**Cancel** を選び、カードから `fwdc….bin` ファイルを削除します。"
            },
            {
              "see": "{{MENU}} を長押ししても、**Mode Set Command** 画面が表示されない。",
              "then": "[初回起動](doc:install#first-start) をもう一度行います。"
            },
            {
              "see": "カメラが起動中に止まります。",
              "then": "[カメラが起動中に止まる](doc:stuck) を見てください。"
            }
          ]
        },
        {
          "kind": "h2",
          "id": "checks",
          "text": "順番に確認"
        },
        {
          "kind": "steps",
          "items": [
            "**お待ちください。**電源を入れてからGRKUが読み込まれるまで約8〜10秒かかります。インストール後の初回起動は約1分ほどかかることがあります。その間はカメラの電源を切らないでください。それまでに撮った写真にはGRKUが適用されません。",
            "**カメラとファームウェア。** MENUを開いてファームウェアバージョンを確認してください。[対応カメラ](doc:cameras)に含まれている必要があります。[ファームウェアバージョンの確認](doc:firmware)をご覧ください。",
            "**SDスクリプト。** 初回起動時に{{MENU}}を押し続けて、**モード Set Command**と**Complete**が表示されましたか？表示されなかった場合は、[初回起動](doc:install#first-start)をやり直してください。",
            "**最上位階層にファイルを配置。** カードの最上位階層に`SCRIPT`フォルダーがある必要があります。`DCIM`や別のフォルダーの中に入れないでください。",
            "**カードリーダー** カメラのUSBケーブル経由ではなく、カードリーダーを使って書き込んでください。",
            "**GRKU を有効**にします。MENUのCustomize（C）＞GRKUで、**GRKU を有効**がオンになっているか、GRKU 設定の**起動時に有効**がオフになっていないか確認してください。"
          ]
        },
        {
          "kind": "h2",
          "id": "errors",
          "text": "エラー番号"
        },
        {
          "kind": "p",
          "text": "GRKUが止まった場合、カードに`SCRIPT/GRKU/INSTALL.ERR`ができます。1行目には数字が入ります。起動に成功したあとはそのファイルがなくなり、代わりに`SCRIPT/GRKU/INSTALL.OK`ができます。"
        },
        {
          "kind": "table",
          "head": [
            "番号",
            "意味",
            "対処法"
          ],
          "rows": [
            [
              "47, 48",
              "このファームウェアビルドにGRKUは対応していません。",
              "対応ファームウェアか確認してから、GRKUを更新してください。改善しない場合はレポートを送信してください。"
            ],
            [
              "60, 61, 62",
              "起動処理が完了しませんでした。",
              "カードに書き込み直してください。改善しない場合はレポートを送信してください。"
            ],
            [
              "36, 37",
              "カード上のプランを読み書きできませんでした。",
              "カードに書き込み直してください。"
            ],
            [
              "30, 31",
              "GRKUがフィルムルックを読み込めません。",
              "カードに書き込み直してください。改善しない場合は別のカードをお試しください。"
            ],
            [
              "23, 24",
              "カメラへの変更が反映されませんでした。",
              "カメラの電源を切ってから入れ直してください。直らない場合はレポートを送ってください。"
            ],
            [
              "その他",
              "その他の理由で GRKU が停止しました。",
              "番号を添えてレポートを送信してください。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "モジュール名の後ろの数字"
        },
        {
          "kind": "p",
          "text": "読み込めなかったモジュールは、MENUで名前の横に番号が表示されます。`GRKU/REPORT.TXT`にも記録されます。GRKUの起動自体は成功しています。"
        },
        {
          "kind": "table",
          "head": [
            "番号",
            "意味",
            "対処法"
          ],
          "rows": [
            [
              "50 to 55, 57",
              "モジュールを読み込めませんでした。",
              "GRKU をアップデートしてください。解消しない場合はレポートを送信してください。"
            ],
            [
              "56",
              "GR IV Monochrome では、カラー写真用のモジュールは使えません。これは正常な動作です。",
              "なし。"
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "files",
          "text": "レポートファイルに書かれていること"
        },
        {
          "kind": "list",
          "items": [
            "`GRKU/REPORT.TXT`：GRKU のバージョンとファームウェアのビルド、各モジュールとフィルムルックの状態（読み込み済み、停止中、またはエラー番号）、サポート向けの詳細情報。内容が変わると書き直されます。",
            "`GRKU/BOOT.TXT`：起動ごとの記録と、各ステップの時刻。直近約20回分の起動履歴が残ります。",
            "`SCRIPT/GRKU/INSTALL.ERR`：起動が止まったときだけ作られ、番号が書かれます。"
          ]
        },
        {
          "kind": "h2",
          "id": "report",
          "text": "レポートを送信"
        },
        {
          "kind": "p",
          "text": "カメラのモデルとファームウェアのバージョンを添えて [support@grku.app](support) までメールをお送りください。その際、カードからこれらのファイルを添付してください。これらには写真は含まれていません。レシピの名前やインポートされたルックの名前が含まれている場合があるため、必要に応じて事前に開いて確認してください。"
        },
        {
          "kind": "files",
          "items": [
            [
              "SCRIPT/GRKU/INSTALL.ERR",
              "起動が止まった理由"
            ],
            [
              "GRKU/REPORT.TXT",
              "カメラ、ファームウェア、GRKU のバージョン"
            ],
            [
              "GRKU/BOOT.TXT",
              "起動時に起きたこと"
            ]
          ]
        }
      ]
    },
    "stuck": {
      "title": "起動時に停止する",
      "sources": [
        "resources/RECOVERY.md"
      ],
      "seo": "RICOH GRが起動で止まるときの復旧方法",
      "lead": "GRKU の変更は電源を切るまでのみ有効です。カードを入れずに起動してください。",
      "keywords": "フリーズ 起動しない 画面がつかない 復旧 リカバリ リセット バッテリー stuck freeze hang frozen not start black screen brick recover recovery reset battery",
      "blocks": [
        {
          "kind": "note",
          "tone": "warning",
          "title": "始める前に",
          "text": "レンズ鏡筒を押したり引いたりしないでください。純正ファームウェアのアップデート中は絶対に電源を切らないでください。"
        },
        {
          "kind": "flow",
          "steps": [
            {
              "see": "カメラが起動中に止まります。",
              "then": "バッテリーとカードを取り出し、カードなしで電源を入れます。"
            },
            {
              "see": "カードなしでも電源が入りません。",
              "then": "再生モードで電源を入れ、カメラの設定をリセットします。"
            },
            {
              "see": "電源は入りますが、切れません。",
              "then": "[シャットダウン画像](doc:shutdown) を見てください。"
            }
          ]
        },
        {
          "kind": "h2",
          "id": "without-card",
          "text": "カードを入れずに起動"
        },
        {
          "kind": "steps",
          "items": [
            "カメラの電源を切ってみてください。",
            "応答しない場合はバッテリーを抜いてください。熱くなっていることがあります。",
            "SDカードを抜いてください。",
            "充電済みのバッテリーを入れて、カードを入れずにカメラの電源を入れてください。"
          ]
        },
        {
          "kind": "h2",
          "id": "still",
          "text": "それでも起動しない場合"
        },
        {
          "kind": "steps",
          "items": [
            "カードを入れないまま再生ボタンを押したままカメラを起動し、再生モードにしてください。",
            "メニューが開いたら、カメラの設定をリセットしてください。リセットすると、自分で変えた設定は消えます。",
            "カードを入れずにカメラの電源を入れ直してください。"
          ]
        },
        {
          "kind": "p",
          "text": "カメラがオンになってもオフにならないときは、壊れた終了画像が原因のことがあります。[終了画像](doc:shutdown) を見てください。それでも起動しないときは、GRKU の使用をやめて RICOH のサポート窓口へ連絡してください。詳しい手順は [復旧ガイド](site:recovery) にあります。"
        }
      ]
    },
    "faq": {
      "title": "よくある質問",
      "sources": [
        "web/src/strings/en.ts (faq)",
        "runtime/mode_dial.h",
        "resources/INSTALLATION-GR4.md"
      ],
      "seo": "GRKU に関する質問と回答",
      "lead": "よく寄せられる質問への短い回答です。",
      "keywords": "faq 質問 なぜ 最初の写真 フィルムルックなし ボックス 初期化 フォーマット スマホ 取り込み gr 世界 安全 保証 faq question why first photos no look box recall format phone import gr world safe warranty",
      "blocks": [
        {
          "kind": "h2",
          "id": "first-photos",
          "text": "なぜ最初の写真にフィルムルックが適用されないのですか？"
        },
        {
          "kind": "p",
          "text": "GRKUが読み込まれるまでの間（電源を入れてから約8〜10秒、インストール後の初回は最大約1分）は、カメラ本体の設定で動きます。画面の上に**GRKU**が出るまで待ってください。"
        },
        {
          "kind": "h2",
          "id": "dng",
          "text": "なぜDNGが3:2になるのか、またはフィルムルックが適用されないのはなぜですか？"
        },
        {
          "kind": "p",
          "text": "GRKUはJPEGを変更し、DNGはRAWデータをそのまま残します。[RAW現像](doc:raw)をご覧ください。"
        },
        {
          "kind": "h2",
          "id": "user-mode",
          "text": "なぜユーザーモードでルックが呼び戻されないのですか？"
        },
        {
          "kind": "p",
          "text": "RICOHのカメラメニューで保存したユーザーモードには、GRKUの設定は保持されません。[現在の設定を保存](doc:mode-dial)または[レシピ](doc:recipes)をお使いください。"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "GRKUはカメラのファームウェアを変更しますか？"
        },
        {
          "kind": "p",
          "text": "いいえ。カメラの電源が入っている間、GRKUはカードから読み込まれます。カメラの設定であるSDスクリプトは、[オフにする](doc:update#scripts-off)までオンのままです。**現在の設定を保存**すると、カメラのユーザーモードにも保存されます。"
        },
        {
          "kind": "h2",
          "id": "menu-again",
          "text": "アップデート後や別のカードを使うときに、またMENUを押し続ける必要がありますか？"
        },
        {
          "kind": "p",
          "text": "いいえ。{{MENU}} の長押しは最初の1回だけです。"
        },
        {
          "kind": "h2",
          "id": "version",
          "text": "カードに入っている GRKU のバージョンはどれですか？"
        },
        {
          "kind": "p",
          "text": "MENU を開きます。カスタマイズタブの GRKU セクションの末尾に **GRKU について** があります。"
        },
        {
          "kind": "h2",
          "id": "phone",
          "text": "スマートフォンで写真を取り込めないのはなぜですか？"
        },
        {
          "kind": "p",
          "text": "GRKUをインストールしても、`DCIM`フォルダーの写真には影響しません。GR WORLDを最新バージョンにアップデートしてください。それでもうまくいかないときは、[サポートへメール](support)してください。"
        },
        {
          "kind": "h2",
          "id": "lightroom",
          "text": "これらのルックを Lightroom で使えますか？"
        },
        {
          "kind": "p",
          "text": "そのままでは使えません。GRKU は Lightroom プリセットを作成しません。[現像ページ](doc:develop) で写真にルックをお試しください。"
        }
      ]
    },
    "cameras": {
      "title": "対応カメラ",
      "sources": [
        "web/src/cameras.ts",
        "web/src/generated/cameras.ts",
        "web/src/package.ts"
      ],
      "seo": "GRKU が対応する RICOH GR カメラとファームウェア",
      "lead": "GRKU は、RICOH の純正ファームウェアを搭載したこれらのカメラとファームウェアバージョンで動作します。",
      "keywords": "カメラ 対応 ファームウェア バージョン cameras supported firmware version gr iii iiix iv hdf monochrome modeset dump",
      "blocks": [
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GRKUはファームウェア1.11のGR IVで動作確認済みです。他のバージョンや機種向けも同じコードから作られ、RICOHのファイルと照合しましたが、実機での動作はまだ未確認です。"
        },
        {
          "kind": "p",
          "text": "カメラで MENU を開いてファームウェアのバージョンを確認します：[ファームウェアのバージョンを確認する](doc:firmware) を参照してください。以前のGRモデルやその他のカメラはサポートされていません。GR IV Monochromeには「フィルムルック」以外のすべてのモジュールが備わっています。"
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Editionには、専用の工場出荷版ファームウェア1.20が入っています。grku.appではまだこのバージョンに対応していないため、まずRICOHの公式サイトから1.21へアップデートしてください。"
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "カメラのファームウェアを更新する"
        },
        {
          "kind": "p",
          "text": "カメラのファームウェアは RICOH の公式サポートサイトからのみ更新し、先に GRKU が新しいバージョンに対応しているか確認してください。GRKU がファームウェアを更新することはありません。"
        },
        {
          "kind": "h2",
          "id": "dump",
          "text": "GRKU が未対応のファームウェア"
        },
        {
          "kind": "p",
          "text": "GRKU が対応できるように、開発者向けにカメラのファームウェアを読み取る方法は [ファームウェアダンプガイド](site:firmware-dump) をご覧ください。"
        }
      ]
    }
  }
};
