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
      "seo": "GRKUとは？RICOH GR III、IIIx、IV向けの無料フィルムルック",
      "lead": "GRKUはSDカードからRICOH GRにフィルムルックや撮影効果を追加します。",
      "keywords": "about introduction overview begin beginner free safe firmware 概要 紹介 はじめる 初心者 無料 安全 ファームウェア",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKUはRICOH GR III、GR IIIx、GR IV向けの無料アドオンです。150種類以上のフィルムルックから選んで、1枚のカードに最大40個まで入れられます。日付印字や粒状感、XPanサイズなどのレシピや効果も使えます。"
        },
        {
          "kind": "p",
          "text": "カメラの電源が入っている間、SDカードから動作します。カードを抜けば、RICOHが作ったそのままのカメラに戻ります。GRKUがカメラのファームウェアを変更することはありません。"
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
            "SDカード。普段撮影に使っているカードで構いません。",
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
          "text": "すべてのルックはサイトで無料プレビューでき、ライブラリのルックは10個まで無料でカードに入れられます。自分で読み込んだルックは数に入りません。すべてのモジュール、レシピ、Developページは無料です。[GRKU Plus](doc:plus)は、カードに入れられるルックを増やすための買い切りオプションです。"
        },
        {
          "kind": "h2",
          "id": "words",
          "text": "このマニュアルで使う言葉"
        },
        {
          "kind": "list",
          "items": [
            "**SD card**：カメラが写真を保存する小さなメモリーカードです。",
            "**Card reader**：パソコンでSDカードを開けるようにする小さな機器です。",
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
      "seo": "RICOH GR III、GR IIIx、GR IVのファームウェアのバージョンを確認する方法",
      "lead": "MENUを押してセットアップメニュー（レンチのアイコン）を開きます。GRKUが動くのは、このページの表にあるファームウェアのバージョンだけです。",
      "keywords": "ファームウェア バージョン 確認 メニュー セットアップ レンチ 機器情報 カメラ情報 更新 リコー 古い 新しい firmware version check menu setup wrench about this device firmware info camera information update ricoh older newer fwdc bin",
      "blocks": [
        {
          "kind": "p",
          "text": "FirmwareはRICOHが作ったカメラの中のソフトです。どのカメラもメニューでファームウェアのバージョンを確認できます。GRKUをインストールする前に確認してください。"
        },
        {
          "kind": "h2",
          "id": "gr3",
          "text": "GR IIIとGR IIIx"
        },
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
          "kind": "camera",
          "screen": "loaded",
          "press": [
            "menu"
          ],
          "alt": "カメラ背面のMENUボタンを押します。"
        },
        {
          "kind": "screen",
          "screen": "setup-gr3",
          "alt": "GR IIIとGR IIIx：（1）スパナアイコンのセットアップメニュー、（2）About This Device。"
        },
        {
          "kind": "screen",
          "screen": "info-gr3",
          "alt": "GR IIIとGR IIIx：（3）Firmware Info / オプション画面のファームウェアバージョン。"
        },
        {
          "kind": "h2",
          "id": "gr4",
          "text": "GR IV と GR IV HDF"
        },
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
          "kind": "screen",
          "screen": "setup-gr4",
          "alt": "GR IV：（1）スパナアイコンのセットアップメニュー、（2）Camera Information。"
        },
        {
          "kind": "screen",
          "screen": "info-gr4",
          "alt": "GR IV：（3）Camera Information画面のファームウェアバージョン。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "知っておくと便利なこと",
          "text": "この画像ではほかのメニュー項目がグレーになっています。名前は機種やファームウェアによって異なります。"
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
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Editionには専用の工場出荷版1.20が入っており、grku.appではまだ対応していません。先にRICOHのサイトから1.21へアップデートしてください。"
        },
        {
          "kind": "h2",
          "id": "older",
          "text": "お使いのバージョンが古い場合"
        },
        {
          "kind": "p",
          "text": "先にカメラをアップデートしてください。必ずRICOHの公式サポートページ（[GR III](https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html)、[GR IIIx](https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html)、[GR IV](https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html)、[GR IV Monochrome](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html)）から行い、そのページの手順に従ってください。GRKUがファームウェアを更新することはありません。"
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
          "text": "カードにRICOHのファームウェアファイル（`fwdc`で始まる`.bin`ファイル）があると、電源を入れたときに{{MENU}}を押したままでファームウェア更新画面が出ます。**Cancel**を選びます。それからそのファイルをカードから消して、もう一度試してください。"
        }
      ]
    },
    "install": {
      "title": "GRKU をインストール",
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
          "kind": "steps",
          "items": [
            "[インストールページ](site:install)を開きます。",
            "フィルムルック、カメラ、モジュールの順に選びます。",
            "最後のステップで**SD カードを接続**を押します。カード自体を選び、編集を許可します。",
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
          "text": "**SDカードを接続**ボタンがないときは、パソコンのChromeかEdgeでページを開いてください。スマホやSafariでは、下のGRKU.zipを使ってください。"
        },
        {
          "kind": "h2",
          "id": "zip",
          "text": "または自分でGRKU.zipをコピーする"
        },
        {
          "kind": "p",
          "text": "スマホやMacのSafariなど、どのブラウザでも使えます。"
        },
        {
          "kind": "steps",
          "items": [
            "インストールの最後のステップで**GRKU.zip をダウンロード**を押します。",
            "解凍します。ブラウザによっては自動で解凍されます。",
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
              "最初の起動時にModeSetファイルと一緒に使います。そのあとは消しても大丈夫です。"
            ],
            [
              "00078560.636",
              "SDスクリプトを有効にする、お使いのカメラのModeSetファイルです（GR IIIは00078350.588、GR IIIxは00078490.609、GR IVは00078560.636）。最初の起動後は消してもかまいません。"
            ],
            [
              "GRKU",
              "あなたの設定とフィルムルックです。"
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
          "text": "一度だけ行います。設定はすべてのカードで有効のままになり、アップデート時には不要です。"
        },
        {
          "kind": "steps",
          "items": [
            "カメラの電源を切り、カードを挿入します。",
            "{{MENU}}を押したまま電源ボタンを押します。",
            "画面に**Mode Set Command**、続いて**Script - 有効**と**Complete**が表示されます。カメラの電源が自動で切れます。",
            "いつもどおり電源を入れます。画面の上に**GRKU**が出るまで待ちます。約8〜10秒かかります。GR IVや、インストール後の初回はもう少し長くなります。"
          ]
        },
        {
          "kind": "camera",
          "screen": "modeset",
          "press": [
            "menu",
            "power"
          ],
          "alt": "MENUを押したまま電源ボタンを押します。画面にモードセットコマンドが表示されます。"
        },
        {
          "kind": "screen",
          "screen": "modeset",
          "alt": "「Script - Enable」および「Complete」が表示されたモードセットコマンド画面。"
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "このように表示されないときは",
          "text": "**Mode Set Command**画面が出ないときは、電源を切ります。先に{{MENU}}を押したまま電源ボタンを押し、画面が出るまで{{MENU}}を押し続けてください。`DEVELOP.MOD`とModeSetファイルがフォルダの中ではなく、カードの一番上の階層にあるか確かめてください。"
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "ファームウェア更新の画面が出たときは？",
          "text": "カードにファームウェアファイル（`.bin`ファイル）が入っています。**Cancel**を選び、Executeは絶対に選ばないでください。電源を切り、カードの一番上の階層から`.bin`ファイルをすべて消して、この手順をやり直してください。"
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
            "**GRKU**を選びます。ふつうは6番目にあります。",
            "**フィルムルック**などの機能を選び、選択肢にカーソルを合わせて画面で確認します。",
            "確定するには{{OK}}を押します。その他の設定には{{Fn}}を押します。"
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "このように表示されないときは",
          "text": "ADJに**GRKU**がないときは、電源を入れて10秒待ってからもう一度試してください。それでも出ないときは、[GRKUが表示されないとき](doc:not-showing)を見てください。"
        },
        {
          "kind": "screen",
          "screen": "adj",
          "alt": "GRKUのADJ画面に各モジュールのアイコンが表示されている。画面の左上にはGRKUと使用中のルックが表示されている。"
        },
        {
          "kind": "p",
          "text": "GRKUが読み込まれる前に撮影した写真には、GRKUの効果は適用されません。操作方法の詳細は[ADJとMENU](doc:controls)をご覧ください。"
        }
      ]
    },
    "controls": {
      "title": "ADJとMENU",
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
          "kind": "table",
          "head": [
            "項目",
            "機能"
          ],
          "rows": [
            [
              "**GRKU を有効**",
              "GRKUのオンとオフを切り替えます。オンにすると、有効になっている各モジュールがまた動き始めます。"
            ],
            [
              "**GRKU 設定**",
              "GRKU 自体の設定です。[GRKU 設定](doc:settings) をご覧ください。"
            ],
            [
              "**レシピ**、**フィルムルック**、その他のモジュール",
              "カード上の各モジュールと、そのすべての設定を1行ずつ表示します。"
            ],
            [
              "**GRKU について**",
              "カードとウェブサイト上の GRKU バージョンです。"
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "menu",
          "alt": "モジュールごとの行がある MENU の GRKU セクション。"
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
            "**オプション**があるモジュールでは、ADJに表示する項目を選びます。使わないフィルムルックのチェックを外すと、ADJで飛ばされます。",
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
          "kind": "steps",
          "items": [
            "カードをカードリーダーに入れ、Chrome または Edge で [インストールページ](site:install) を開きます。",
            "最後のステップで**SD カードを接続**を押します。変更内容が画面に表示されます。",
            "**GRKU をアップデート**を押します。",
            "カードをカメラに入れて、いつもどおり電源を入れます。"
          ]
        },
        {
          "kind": "p",
          "text": "フィルムルックを追加したり消したりするときも同じです。サイトでルックを変え、カードを接続して変更リストを確認し、書き込みボタンを押してください。"
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
          "text": "インストールの最後のステップでカードを接続し、**GRKU をアンインストール**を押します。設定やフィルムルックも消すかどうかを選び、**アンインストール**を押してください。カメラの電源を切って、自分で`SCRIPT`フォルダと`GRKU`フォルダを消してもかまいません。写真はそのまま残ります。"
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
      "seo": "RICOH GRのフィルムルック：フィルムルックの使い方",
      "lead": "イメージコントロールの代わりに、ライブプレビュー付きで実際のフィルムのルックを使えます。",
      "keywords": "フィルムルック エフェクト イメージコントロール LUT ポートラ クラシッククローム コダック 富士フイルム ファインピックス ポジティブ プレビュー Fn パラメータ フィルムストック film look effect image control lut portra classic chrome kodak fuji fujifilm finepix positive preview fn parameters film stock",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "フィルムルック"
          ]
        },
        {
          "kind": "steps",
          "items": [
            "{{ADJ}}を押して**GRKU**を選び、次に**フィルムルック**を選びます。",
            "ルックを選びます。フィルムボックスのアイコンとともに、ライブビューにすぐ反映されます。",
            "{{OK}}を押して確定します。ルックを使わずに撮影する場合は**オフ**を選びます。"
          ]
        },
        {
          "kind": "screen",
          "screen": "film-look",
          "alt": "ADJのフィルムルック画面：カード上のルックのフィルムボックスが表示され、Kodak Portra 400が選択されている。"
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
              "{{ADJ}}での並び順を設定します。"
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
      "seo": "GRのフィルムレシピ：設定をワンステップで保存・切り替え",
      "lead": "カメラの設定を含めたルック全体を保存し、ワンステップで切り替えられます。",
      "keywords": "レシピ recipe สูตรสี preset save settings undo rename delete apply view white balance exposure",
      "blocks": [
        {
          "kind": "p",
          "text": "レシピには、フィルムルックまたはImage Control、粒状感、グロー、ボーダー、ホワイトバランス、カメラの補正や露出設定が保存されます。"
        },
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "レシピ"
          ]
        },
        {
          "kind": "screen",
          "screen": "recipes",
          "alt": "ADJのレシピ：元に戻す、マイレシピ、設定を保存。"
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
          "kind": "h2",
          "id": "apply",
          "text": "レシピを使う"
        },
        {
          "kind": "steps",
          "items": [
            "**レシピ**でレシピを選択すると、ライブビューに反映され、画面左にその設定が表示されます。",
            "{{OK}}を押して適用します。",
            "やり直したいときは**元に戻す**を選びます。レシピで変更されたカメラの設定がすべて元に戻ります。"
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
      "seo": "RICOH GRのXPanなどのアスペクト比（フレーミング）",
      "lead": "XPan、2.35:1、16:9、1:1などのアスペクト比で撮影します。",
      "keywords": "フレーミング アスペクト比 画面比 XPan パノラマ 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 マスク 枠線 ガイド クロップ framing aspect ratio xpan panorama 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 mask frame lines guides only crop",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "フレーミング"
          ]
        },
        {
          "kind": "frame",
          "mode": "framing",
          "alt": "写真でフレーミングの比率やマスクを試す。"
        },
        {
          "kind": "p",
          "text": "比率を選ぶとライブビューに枠が表示されます。{{OK}}を押すと決定します。JPEGはその比率にクロップされ、DNGは3:2のまま残ります。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**アスペクト比**",
              "オフ、XPan 65:24、16:9、4:3、2.35:1、1:1、5:4、7:6、3:4"
            ],
            [
              "**モード**",
              "**クロップ**（初期設定）はJPEGをトリミングします。**構図ガイドのみ**は枠を表示し、写真全体を残します。"
            ],
            [
              "**マスク**",
              "枠外を画面にどう表示するかを設定します：**ダーク**（初期設定）、**黒**、または**枠線**。"
            ],
            [
              "**アイコン表示**",
              "撮影画面にアスペクト比を表示します：オン（初期設定）またはオフ。"
            ]
          ]
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
      "seo": "RICOH GRの35mm・50mm・70mmクロップ",
      "lead": "ライブビューに枠を表示し、デジタルテレコンバーターのように長い焦点距離で撮影します。",
      "keywords": "クロップ 焦点距離 ズーム テレ フレーム マスク 枠のみ 未トリミング RAW crop focal length 35mm 40mm 50mm 70mm 57mm 71mm 100mm zoom tele frame only mask uncropped raw",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "クロップ"
          ]
        },
        {
          "kind": "frame",
          "mode": "crop",
          "alt": "写真でクロップの焦点距離を試す。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**焦点距離**",
              "オフ、35、40、50、または70 mm。GR IIIxでは：オフ、50、57、71、または100 mm。"
            ],
            [
              "**モード**",
              "**クロップ**（初期設定）は写真を切り抜きます。**枠のみ**は枠を表示し、写真全体を残します。"
            ],
            [
              "**マスク**",
              "**ダーク**（初期設定）、**黒**、**枠線**。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "クロップで {{Fn}} を押すと、**モード** と **マスク** を設定できます。クロップはすべての **フレーミング** 比率で使えます。"
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
      "seo": "GRの構図ガイド：三分割法、黄金比、螺旋",
      "lead": "画面に表示される構図の線です。写真には写りません。",
      "keywords": "構図ガイド グリッド ガイドライン 9分割 画面中央 黄金比 対角線 黄金螺旋 ダイナミックシンメトリー 構図 表示 不透明度 色 guides grid lines thirds center golden ratio diagonals golden spiral dynamic symmetry composition disp opacity color",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "構図ガイド"
          ]
        },
        {
          "kind": "frame",
          "mode": "guides",
          "alt": "写真で構図ガイドのスタイルを試す。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**スタイル**",
              "オフ、9分割、画面中央、黄金比、対角線、9分割+画面中央、黄金螺旋、ダイナミックシンメトリー"
            ],
            [
              "**色**",
              "黒（初期設定）、白、イエロー"
            ],
            [
              "**不透明度**",
              "50%（初期設定）または100%"
            ],
            [
              "**DISPで非表示**",
              "オン（初期設定）：{{DISP}}で画面表示を消すと線も非表示になります。オフ：常に表示されます。"
            ],
            [
              "**螺旋の中心**",
              "黄金螺旋を回す位置：左上、右上、右下（初期設定）、または左下。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "ADJで**黄金螺旋**を選んだ状態で{{Fn}}を押すと、螺旋が次の角へ回ります。GRKUがガイドを表示している間、カメラ内蔵のグリッド線は非表示になります。"
        }
      ]
    },
    "date": {
      "title": "日付入れ撮影",
      "seo": "RICOH GR写真の日付スタンプ（日付入れ撮影）",
      "lead": "フィルムカメラのように写真へ日付を印字します。3種類のフォント、5色のカラー、キャプションに対応しています。",
      "keywords": "日付入れ撮影 スタンプ 時刻 フォント クラシック gr1s gr ii 色 オレンジ サイズ 位置 角 キャプション ありがとう ハッピーバースデー grku グロー date imprint stamp time font classic gr1s gr ii color orange size position corner caption thank you happy birthday grku glow",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "日付入れ撮影"
          ]
        },
        {
          "kind": "photo",
          "photo": "portra-heart",
          "alt": "インスタント枠付きのKodak Portra 400と、GRKU <3 キャプション付きの日付入れ撮影。"
        },
        {
          "kind": "p",
          "text": "日付スタイルを選んで{{OK}}を押します。その他の設定は{{Fn}}を押します。カメラ内時計の日時が印字されるため、先に時計を合わせてください。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**日付のスタイル**",
              "オフ、'YY M D、'YY M D H:MM、M D 'YY、D M 'YY、D M 'YY H:MM"
            ],
            [
              "**日付の位置**",
              "**フィルム**（初期設定）はフィルムカメラと同じ位置に印字します。**正位置**は縦位置写真でも正位置のままにします。"
            ],
            [
              "**日付配置**",
              "右下（初期設定）、左下、右上、または下部左右：左に日付、右にキャプションを表示します。"
            ],
            [
              "**日付サイズ**",
              "S、M（初期設定）、M-L、L"
            ],
            [
              "**日付の書体**",
              "クラシック（初期設定）、GR1s（ドットマトリクス）、GR II"
            ],
            [
              "**日付の色**",
              "標準（初期設定）：カラー写真ではオレンジ、白黒写真では白。またはオレンジ、白、セピア、LEDイエロー。"
            ],
            [
              "**日付の光彩**",
              "オフ（初期設定）またはオン：数字の周りにやわらかい光彩をつけます。"
            ],
            [
              "**キャプション**",
              "オフ（初期設定）、THANK YOU、HAPPY BIRTHDAY、I <3 GR、I <3 YOU、GOOD TIMES、HOLIDAY、CHEERS、GRKU <3。<3 は写真上でハートとして表示されます。"
            ],
            [
              "**アイコン表示**",
              "撮影画面に日付スタイルを表示します：オン（初期設定）またはオフ。"
            ]
          ]
        },
        {
          "kind": "photo",
          "photo": "neg-gr1s",
          "alt": "黒枠付きのクラシック ネガと、GR1sフォントの日付。"
        },
        {
          "kind": "screen",
          "screen": "date",
          "alt": "MENUの日付入れ撮影画面と各設定。"
        }
      ]
    },
    "glow": {
      "title": "グロー",
      "seo": "RICOH GRのブルームとハレーション（グロー）",
      "lead": "光やハイライトのにじむブルームと、映画フィルムのような赤やオレンジのハレーション。",
      "keywords": "グロー ブルーム ハレーション シネスティル 赤 オレンジ ゴールド 白 ハイライト 光 夜 glow bloom halation cinestill red orange gold white highlights lights night",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "グロー"
          ]
        },
        {
          "kind": "photo",
          "photo": "portra-bloom",
          "alt": "ブルーム 弱、ディフュージョン 1/4、粒状感 弱を適用した Kodak Portra 400。"
        },
        {
          "kind": "p",
          "text": "グローには2つの要素があります。それぞれ強さを設定でき、両方あわせて使うこともできます。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**ブルーム** › **強度**",
              "オフ, 弱, 中, 強: 明るい部分のまわりにやわらかいにじみが出ます。"
            ],
            [
              "**ハレーション** › **強度**",
              "オフ, 弱, 中, 強: CineStillフィルムのように、光のまわりに色のにじみが出ます。"
            ],
            [
              "**ハレーション** › **色**",
              "レッド, オレンジ (既定), ゴールド, 白"
            ],
            [
              "**アイコン表示**",
              "撮影画面にブルームやハレーションのアイコンを表示します: オン (既定) または オフ。"
            ]
          ]
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
      "seo": "GRの光漏れ、ダスト、周辺減光エフェクト",
      "lead": "古いフィルムのあと：周辺減光、ホコリや髪の毛、光漏れ、キズ。",
      "keywords": "ライトリーク 周辺減光 ダスト キズ 色あせ 期限切れ 古いフィルム ロモ レトロ light leak vignette dust scratches faded dusty leaky expired old film lomo retro",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "ライトリーク"
          ]
        },
        {
          "kind": "photo",
          "photo": "kodachrome-leak",
          "alt": "Kodachrome 64、ライトリークが弱、粒状感が弱、日付入り。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**ルック**",
              "オフ、カスタム、退色、ダスト、光漏れ、期限切れ。カスタムは下で決めた強さを使います。ほかはあらかじめ用意された組み合わせです。"
            ],
            [
              "**周辺減光**",
              "オフ、弱、中、強"
            ],
            [
              "**ダスト**",
              "オフ、弱、中、強"
            ],
            [
              "**ライトリーク**",
              "オフ、弱、中、強"
            ],
            [
              "**キズ**",
              "オフ、弱、中、強"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "**カスタム**を選び、{{Fn}}を押して各パーツの強さを設定します。ダスト、光漏れ、キズは写真ごとに違う入り方をします。Light LeakはJPEGだけを変え、ライブビューには表示されません。"
        }
      ]
    },
    "diffusion": {
      "title": "ディフュージョン",
      "seo": "GRでのブラックプロミストディフュージョンとフィルムの柔らかさ",
      "lead": "ブラックプロミストフィルターの柔らかなにじみと、フィルムスキャンのようなやさしい柔らかさ。",
      "keywords": "ディフュージョン フィルター プロミスト ブラックミスト ストリーク アナモルフィック 柔らかさ フィルム 優しい diffusion filter pro mist black mist streak anamorphic softness film softness soft dreamy",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "ディフュージョン"
          ]
        },
        {
          "kind": "photo",
          "photo": "pro400h",
          "alt": "Fujifilm Pro 400H、ディフュージョン 1/8、フィルムソフトネス 弱、粒状感 弱。"
        },
        {
          "kind": "p",
          "text": "ディフュージョンには**フィルター**と**ソフトネス**の2つの項目があり、それぞれ独立して働きます。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**フィルター** › **強度**",
              "オフ、1/8、1/4、1/2。ディフュージョンフィルターの番手のような段階です。"
            ],
            [
              "**フィルター** › **ブラックミスト**",
              "オフ、弱、強：影にかかるベールのような効果です。強度がオフ以外のときに働きます。"
            ],
            [
              "**フィルター** › **ストリーク**",
              "オフ、ブルー、アンバー：点光源に出るアナモルフィックレンズの横方向のフレアです。強度がオフ以外のときに働きます。"
            ],
            [
              "**ソフトネス** › **フィルムソフトネス**",
              "オフ、弱、中、強：フィルムスキャンのように細部がやわらぎ、ハイライトが滑らかに落ちます。"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "**ディフュージョン**はJPEGのみに反映され、ライブビューには表示されません。"
        }
      ]
    },
    "grain": {
      "title": "粒状感",
      "seo": "RICOH GRのフィルム粒状感：強さ、サイズ、フィルム調",
      "lead": "4段階の強度と4段階のサイズでフィルム粒状感を表現し、カメラの粒状感または**フィルム調**を選べます。",
      "keywords": "粒状感 ノイズ フィルム調 システム サイズ 強度 弱 中 強 特強 grain noise film-like system size strength weak medium strong extra",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "粒状感"
          ]
        },
        {
          "kind": "photo",
          "photo": "trix",
          "alt": "Kodak Tri-X 400、粒状感 中、GR1sフォントの日付、黒の太い枠。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**強度**",
              "オフ、弱、中、強、特強"
            ],
            [
              "**サイズ**",
              "オート（初期設定）、小、中、大"
            ],
            [
              "**スタイル**",
              "**システム**（初期設定）はカメラの粒状感です。**フィルム調**はカラーネガプリントの色つき粒状感で、中間調で最も強く、白と黒には出ず、毎回異なる模様になります。"
            ],
            [
              "**アイコン表示**",
              "オン（初期設定）またはオフ"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "粒状感で{{Fn}}を押すと、**サイズ**と**スタイル**を設定できます。フィルム調の粒状感は、Andrea Volpatoによるspektrafilmのグレインモデルに従っています。"
        }
      ]
    },
    "border": {
      "title": "ボーダー",
      "seo": "GRでの白、黒、インスタント写真の枠",
      "lead": "写真全体の周囲に白または黒のボーダーを追加します。写真の画素はすべて保持されます。",
      "keywords": "border frame white black thin wide instant polaroid edge ボーダー フレーム 白 黒 細い 太い インスタント ポラロイド 縁",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "ボーダー"
          ]
        },
        {
          "kind": "photo",
          "photo": "velvia-wide",
          "alt": "Fujifilm Velvia、白の太い枠と日付入り。"
        },
        {
          "kind": "photo",
          "photo": "acros-instant",
          "alt": "Fujifilm Acros、白のインスタント枠とGRKU <3キャプション入り。"
        },
        {
          "kind": "table",
          "head": [
            "設定項目",
            "選択肢"
          ],
          "rows": [
            [
              "**スタイル**",
              "オフ、**細い**（短辺の3%）、**太い**（6%）、**インスタント**（4%で、インスタント写真のように下側が3倍の幅）。GR IVではメモリーが足りないと、大きな枠が少し細くなることがあります。"
            ],
            [
              "**色**",
              "白（初期設定）または黒"
            ],
            [
              "**アイコン表示**",
              "オン（初期設定）またはオフ"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "ボーダーの分だけJPEGのサイズが広がるため、写真が隠れることはありません。カメラ内のRAW現像でもボーダーを追加できます。"
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "カードに入っていない場合",
          "text": "使い始めのとき、ボーダーはオフになっています。[インストール](site:install)のステップ3で、ボーダーをオンにしてください。カードには最大10個のモジュールを入れられます。10個ともオンになっているときは、あまり使わないものをオフにしてください。"
        }
      ]
    },
    "mode-dial": {
      "title": "モードダイヤルとU1–U3",
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
          "kind": "screen",
          "screen": "mode-dial",
          "alt": "モードダイヤル画面：各位置でのGRKUオン/オフと、U3での現在の設定保存。"
        },
        {
          "kind": "p",
          "text": "P、Av、Tv、M、およびSn（GR IV）は1つのGRKU設定を共有します。各ポジションでGRKUを**オン**または**オフ**にできます。"
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
            "**現在の設定を保存**：いまのカメラ設定とGRKU設定をこの位置に保存します。ダイヤルをここに合わせると、どちらも元に戻ります。保存したあと、この位置には保存した内容の名前が表示されます。"
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
          "text": "DNGに記録されたGRKU設定があるときは、そこから現像が始まります。GRKUの行は、この現像だけに反映されます。"
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
          "kind": "screen",
          "screen": "settings",
          "alt": "MENUのGRKU 設定画面。"
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
              "電源を入れるたびの GRKU の動作を、**オン**、**オフ**、または終了時の **前回のまま** から選びます。"
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
              "**オン**: 各 DNG にセンサー全体の画像が保持され、撮影時のクロップは Lightroom や Camera Raw で元に戻せる設定として記録されます。その際、Lightroom 独自の RAW 初期設定が適用されない場合があります。"
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
              "スナップフォーカス距離とマニュアルフォーカス目盛りを **メートル** または **フィート** で表示します。"
            ],
            [
              "**簡易情報の電池**",
              "ライブビューの簡易情報表示にもバッテリーアイコンを表示します。"
            ],
            [
              "**再生時の効果アイコン**",
              "詳細再生情報の 1 ページ目に、写真の GRKU 設定ごとのアイコンを表示します。初期設定は **オン** です。"
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
              "シャットダウン画面に描画される撮影枚数とファームウェアバージョンの表示・非表示を切り替えます。"
            ]
          ]
        }
      ]
    },
    "looks": {
      "title": "サイトでルックを選ぶ",
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
          "text": "ステップ3でモジュールを選びます。1枚のカードに11個のモジュールのうち最大10個まで入れられ、開始時はボーダーがオフになっています。ステップ3ではレシピや[シャットダウン画像](doc:shutdown)も追加します。"
        }
      ]
    },
    "plus": {
      "title": "GRKU Plus",
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
          "text": "どの購入でもGRKU Studioとそのデザインすべてが解放されます。料金は[GRKU Plus](site:plus)ページでご確認ください。以前のお支払いはEverythingや25 slotsの差額に充当されます。"
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
            "タイの銀行アプリのPromptPay QRで支払い、明細画像をアップロードします。シートに表示される場合はTrueMoneyのギフトリンクを貼り付けることもできます。",
            "すぐにルックが使えるようになります。",
            "キーがメールで届きます。どの端末でも使えます。"
          ]
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
            "[インストール](site:install)のステップ3で、終了画面カードを開きます。",
            "用意されたデザインを選ぶか、自作するか、カメラ標準の画面にするには オフ を選びます。",
            "いつも通りにカードを書き込みます。次の電源オンから新しい画面が表示されます。GRKU.zipの場合は `GOODBYE.JPG` もダウンロードし、カードの `GRKU` フォルダーに入れてください。"
          ]
        },
        {
          "kind": "p",
          "text": "用意されたデザインには、夕焼け、眠そうな月、昼寝する猫、フィルムロール、レシートなどがあり、任意のテキストを入れられます。自作の写真は3:2にトリミングされます。"
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
            "写真を保存します。または **GRに追加する** を押すと、選んだルックとモジュールが選ばれた状態でインストールページが開きます。各効果の強さはカメラ側で設定します。"
          ]
        },
        {
          "kind": "p",
          "text": "無料版では、カメラのルックやスタータールック、またはルックなしのまま、小さなGRKUクレジット付きで最大2048pxまで保存できます。GRKU Plusを購入すると、クレジットなしでどのルックもフルサイズで保存できます。"
        }
      ]
    },
    "assistant": {
      "title": "AIアシスタント",
      "seo": "GRKU AIアシスタント：GRやフィルムルックについて質問",
      "lead": "インストール方法やカメラ、写真に合うルックについてGRKUアシスタントに質問できます。",
      "keywords": "AIアシスタント チャット 質問 ヘルプ ボット マスコット メモリ ai assistant chat ask question help bot mascot memory",
      "blocks": [
        {
          "kind": "p",
          "text": "各ページの右下にある丸いボタンからGRKUアシスタントを開けます。このサイトとマニュアルの内容をもとに、対応するページへのリンク付きで回答します。"
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
            "メモリー機能をオンにすると、お使いのカメラとお気に入りのルックがブラウザーに保存され、質問と一緒に送信されます。",
            "AIの回答には誤りが含まれることがあります。カメラのファームウェアに関する情報は、本マニュアルとRICOHの案内をご確認ください。"
          ]
        }
      ]
    },
    "not-showing": {
      "title": "GRKUが表示されない",
      "seo": "カメラにGRKUが表示されないときの対処法",
      "lead": "上から順に、1つずつ確認してください。",
      "keywords": "表示されない 動かない 見つからない ADJ GRKUなし エラー install.err レポート boot.txt 47 48 ファームウェア モード設定 not showing not working missing adj no grku error install.err report boot.txt 47 48 firmware mode set",
      "blocks": [
        {
          "kind": "h2",
          "id": "checks",
          "text": "順番に確認"
        },
        {
          "kind": "steps",
          "items": [
            "**待つ。** GRKUは電源を入れてから約8〜10秒で起動します。GR IVやインストール・アップデート直後はもう少し時間がかかります。それより前に撮った写真にはGRKUが適用されません。",
            "**カメラとファームウェア。** MENUを開いてファームウェアバージョンを確認してください。[対応カメラ](doc:cameras)に含まれている必要があります。[ファームウェアバージョンの確認](doc:firmware)をご覧ください。",
            "**SDスクリプト。** 初回起動時に{{MENU}}を押し続けて、**モード Set Command**と**Complete**が表示されましたか？表示されなかった場合は、[初回起動](doc:install#first-start)をやり直してください。",
            "**最上位階層にファイルを配置。** カードの最上位階層に`SCRIPT`フォルダーがある必要があります。`DCIM`や別のフォルダーの中に入れないでください。",
            "**カードリーダー** カメラのUSBケーブル経由ではなく、カードリーダーを使って書き込んでください。",
            "**GRKU を有効** MENU の Customize (C) ＞ GRKU で、**GRKU を有効** が「オン」になっているか確認してください。"
          ]
        },
        {
          "kind": "h2",
          "id": "errors",
          "text": "エラー番号"
        },
        {
          "kind": "p",
          "text": "GRKUが停止した場合、カードに数字付きの `SCRIPT/GRKU/INSTALL.ERR` ができていることがあります。"
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
              "47",
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
              "カード上のプランを書き込めないか、読み込めませんでした。",
              "カードに書き込み直してください。"
            ],
            [
              "30, 31",
              "GRKUがフィルムルックを読み込めません。",
              "カードに書き込み直してください。改善しない場合は別のカードをお試しください。"
            ],
            [
              "50〜56",
              "モジュールが読み込まれませんでした。",
              "GRKU をアップデートしてください。解消しない場合はレポートを送信してください。"
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
          "id": "report",
          "text": "レポートを送信"
        },
        {
          "kind": "p",
          "text": "お使いのカメラ機種とファームウェアのバージョンを添えて [support@grku.app](support) までメールを送り、カードから以下のファイルを添付してください。写真や個人データは含まれません。"
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
          "text": "それでも起動しない場合はGRKUの使用を中止し、RICOHのサポート窓口へお問い合わせください。詳しくは[リカバリーガイド](site:recovery)をご覧ください。"
        }
      ]
    },
    "faq": {
      "title": "よくある質問",
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
          "text": "電源を入れてからGRKUが読み込まれるまでの約8〜10秒間は、カメラ本来の設定が使われます。画面の上に**GRKU**と出るまで待ってください。"
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
      "seo": "GRKU が対応する RICOH GR カメラとファームウェア",
      "lead": "GRKU は、RICOH の純正ファームウェアを搭載したこれらのカメラとファームウェアバージョンで動作します。",
      "keywords": "カメラ 対応 ファームウェア バージョン cameras supported firmware version gr iii iiix iv hdf monochrome modeset dump",
      "blocks": [
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "カメラの MENU を開いてファームウェアバージョンを確認します。それ以前の GR モデルや他のカメラには対応していません。GR IV Monochrome はフィルムルック以外のすべてのモジュールに対応しています。"
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
