# GRKU.

**GR のあなたの、お気に入りのスタイルで** — SD カードから動作する、RICOH GR III・GR IIIx・GR IV 向けのフィルムルックです。ファームウェアの書き換えは行いません。カメラはカード上のスクリプトを実行し、カードがなければリコーが出荷した状態のカメラのままです。

[ไทย](README.th.md) | [English](README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | 日本語 | [한국어](README.ko.md)

[![Tests](https://github.com/botnick/GRKU/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKU/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![grku.app](https://img.shields.io/badge/site-grku.app-d94135)](https://grku.app)

GRKU は、[BOTNICK](https://github.com/botnick) がまずタイの GR ユーザーへ、そして世界中のすべての人へ向けて制作した独自のプロジェクトです。SD カードから GR 上でコードを実行する方法を発見した ahonn 氏による [GRKit](https://github.com/ahonn/GRKit) のコードから始まり、その後ひとつひとつ再構築されました。リアルなフィルム箱のアイコンを備えた 135 種類のルックからなるフィルムライブラリ、レシピ、さらなるモジュール、ワンショット起動、カードへの書き込みや追加ルックの購入ができるサイト、タイ語のトーン、そして独自のリリースパイプラインを備えています。[ルーツ](#origins)のセクションに、何が GRKit に由来し、GRKU がそれをどのように作り上げたかを掲載しています。

<p>
  <img src="resources/images/grku-root.jpg" alt="ADJ メニューの GRKU ページ" width="49%">
  <img src="resources/images/grku-menu.jpg" alt="MENU のカスタマイズタブにある GRKU セクション" width="49%">
</p>

写真：[Mobnoboka](https://commons.wikimedia.org/wiki/File:Oguchi_Joushi_Kouen_1.jpg)、[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。

## 機能

撮影中に ADJ レバーを押し、6 番目の項目「GRKU」を選びます。GRKU のすべての機能はそこにあり、MENU の GRKU セクションにもあります。

- **フィルムルック**：実在するフィルムの 135 種類のルックで、カードには一度に 40 種類を保存できます。Kodak、Fujifilm、Ilford、CineStill、Lomography、Polaroid、Agfa、Harman、Rollei に加え、GR II のポジフィルムを再現した GRKU 独自の Positive GRII も収録しています。各ルックには実物のパッケージの色を模したフィルム箱のアイコンが付いています。Fn でルックを微調整でき、サイトから手持ちの LUT を読み込むこともできます。
- **レシピ**：カメラ全体のルックに名前を付けて保存したり、サイトから人気のレシピを取り込んだりして、フィルムルックまたは Image Control、粒状感、グロー、ホワイトバランス、補正、露出をアンドゥ付きで一度に切り替えます。モードダイヤルの U1、U2、U3 にレシピを割り当てることもできます。
- **フレーミング**：XPan、2.35:1、16:9、4:3、5:4、7:6、1:1。JPEG の切り抜きまたは構図枠線のみで表示します。**クロップ**：35、40、50、70、90 mm をライブビューで確認できます。
- **構図ガイド**：9 分割、画面中央、黄金比、対角線、黄金螺旋、ダイナミックシンメトリー。
- **日付写し込み**：クラシック、GR1s のドットマトリクス、GR II の書体で写真に日付を入れます。
- **グロー**：ライトやハイライトの周囲に広がるブルーム、映画用フィルムのような赤橙色のにじみを加えるハレーション。
- **光漏れ**：ビネット、ホコリや毛、光漏れ、傷のほか、Faded、Dusty、Leaky、Expired のプリセット。1 枚ごとに現れ方が変わります。
- **ディフュージョン**：Black Pro-Mist フィルターの 1/8、1/4、1/2、シャドウ部を覆う Black Mist のベール、点光源からのアナモルフィックレンズのような光条。
- **粒状感**：強度は 4 段階、大きさは 4 種類。
- **ボーダー**：写真の周囲に白または黒のプリント枠を付けます。幅は横幅の 3% または 6% です。
- **起動時の有効化**：電源を入れるたびに、GRKU をオン、オフ、または前回の状態のままにします。
- **フィート表示**：カードに `GRKU/FEET.TXT` を置くと、Snap 撮影距離がフィート表示になります。

GRKU の表示には、電源を入れてから約 9 秒かかります（インストール後の最初の起動ではもう少しかかります）。それまではカメラ本来の設定で動作します。設定した内容はすべてカードの `GRKU` フォルダーに保存されます。

## 対応カメラ

| カメラ | 実機で確認済み | 対応 |
| --- | --- | --- |
| GR III、GR III HDF | — | 2.10、2.20 |
| GR IIIx、GR IIIx HDF | — | 1.60、1.70 |
| GR IV、GR IV HDF | 1.11 | 1.11、1.20 |
| GR IV Monochrome | — | 1.00、1.10 |

GRKU 独自の変更点は、ファームウェア 1.11 の GR IV で動作しています。GR III および GR IIIx 用のパッケージは同じコードと GRKit のテストからビルドされていますが、まだ誰もそれらのカメラで GRKU を実行していません。実行された場合は、動作したかどうかにかかわらず [issue](https://github.com/botnick/GRKU/issues) でお知らせください。

> [!WARNING]
> GRKU は試験的なプロジェクトです。ご利用は自己責任でお願いします。
> インストールするとカメラの SD スクリプト設定がオンになり、オフにするまでそのままです。GRKU に問題があると、カメラが起動中に止まることがあります。あらかじめ[復旧ガイド](resources/RECOVERY.md)をお読みください。

## インストール

[grku.app](https://grku.app) でカメラ、モジュール、フィルムルックを選び、次のどちらかを行います。

- Chrome か Edge から **SD カードに書き込む**（このサイトではアップデート、ルックの追加・削除、アンインストールも可能です）。
- **ZIP をダウンロード**（`GRKU-gr3.zip`、`GRKU-gr3x.zip`、または `GRKU-gr4.zip`）し、中の PDF ガイドの手順に従う（[GR III と GR IIIx](resources/INSTALLATION.md)、[GR IV](resources/INSTALLATION-GR4.md)）。

MENU ボタンを押しながら電源を入れるのは初回だけです。ZIP からアップデートするときは、カードの `SCRIPT` フォルダーを入れ替えてください。設定は `GRKU` に残ります。カードをフォーマットすると GRKU は消去されます。

GRKit（GRKU の母体となったプロジェクト）から移行する場合：サイトを利用すると、設定とルックが `GRKIT` フォルダーから `GRKU` に移動されます。手動でファイルをコピーする場合は、初回起動前にカードのルートにある `GRKIT` の名前を `GRKU` に変更するか、削除してください。

GRKU が表示されない場合は、`GRKU/REPORT.TXT`、`GRKU/BOOT.TXT`、`SCRIPT/GRKU/INSTALL.ERR`（存在する場合）を添えて [issue](https://github.com/botnick/GRKU/issues/new) を送信してください。[各行の意味について](docs/diagnostics.md)。

## GRKU Plus

無料のサイトでは、任意の 10 種類のルックをカードに書き込めます。GRKU Plus は PromptPay による 1 回限りの支払いで、25 スロット、ブランドパック、またはすべて（40 スロットとすべてのルック）のロックを解除します。キーはメールで届き、すべてのデバイスで使用できます。このサービスは `services/plus` で動作し、カードを見ることは一切ありません。

## 起源

GRKU は GRKit 1.5.2 および GRKit の `feat/recipes` ブランチをもとに成長しました。ランタイムの仕組み、モジュール ABI、テストハーネスは GRKit のものであり、GRKU はその MIT 表記を保持しています。GRKit の高速起動ファームウェアは意図的に除外されています。以下に挙げるその他すべてが、GRKU 独自の成果です。

| 領域 | GRKit（GRKU の起点） | 現在の GRKU | 実装方法 |
| --- | --- | --- | --- |
| フィルムライブラリ | 21 種類のルック | 135 種類のルック、カードあたり 40 種類。すべてのルックを収録したフィルムライブラリ ZIP | Pat David（CC BY-SA 4.0）、t3mujinpack（MIT）、spektrafilm、Spectral Film LUT、Fotufilm のオープンなフィルムプリセットからフィッティングを行い、`docs/popular-films-2026.md` における 2026 年の人気度調査に基づいてデフォルトの 40 種類を選定 |
| アイコン | フラットなタイル | すべてのルックに実物のパッケージ色を模したフィルム箱、メニュー用のカラータイル、独自の PNG アイコンを持つエフェクト | `scripts/flap-icons.py` が箱を描画。エフェクトコンパイラが `icon: {"png": ...}` を処理 |
| レシピ | 未マージのブランチ | マージ済み。タイ語に配慮した解説、ricohcookbook.com の人気レシピ、3 ステップのエディター、作例写真、カメラ風の設定シートを搭載 | `modules/recipes`、`web/src/components/Recipe*.tsx` |
| モジュール | Film Look、Framing、Guides、Date、Glow、Grain | 加えて Crop、Light Leak、Diffusion、Border、Recipes、Enable at Start、フィート表示ラベル、黄金螺旋およびダイナミックシンメトリーのガイド | MustafaCisse および kkasemsa のフォークから移植し、新規作成。1 つのパッケージに 10 個のモジュールを収録可能 |
| 起動 | 電源を入れるたびに複数回のカードリクエスト | 1 回のリクエスト：コアがスキャン、インストール、レポートを 1 つのプロセスで行い、進行状況を RAM 上のローダーに送信 | `docs/one-shot-start.md` |
| 高速起動 | オプションのパッチ適用ファームウェア | 方針として一切なし：GRKU はカード上のスクリプトのまま動作 | `docs/fastboot.md` を記録として保持 |
| サイト | 英語、中国語、日本語、韓国語 | タイ語ファースト、6 言語、shadcn/ui で構築されたダーク調の 1 ページ構成インストーラー、6 枚のサンプル写真でのライブプレビュー、GRKU Plus、SEO およびリンクプレビュー | `web/`、`services/plus` |
| カード | `GRKIT` フォルダー | `GRKU` フォルダー。サイトおよび `scripts/card.py` が古い `GRKIT` フォルダーを移動し、カメラ側は触れません | `web/src/card.ts`、`scripts/card.py` |
| ブランド | GRKit | GRKU：赤いピリオドが付いたワードマーク、タイのトーン、`docs/brand.md` | |
| リリース | GitHub Actions から grkit.app へ | grku.app 用の同一パイプライン：プッシュによりリリースのプルリクエストが作成され、マージすると公式ファームウェアからビルドして Cloudflare Pages 経由でサイトをデプロイ。Plus サービスは `services/plus` からデプロイ | `.github/workflows`, `docs/releasing.md` |

GRKU は GRKit のモジュール ABI を維持しており（GRKit SDK でビルドされたモジュールも引き続き読み込まれます）、そのライセンスも保持し、適用可能な修正は GRKit に送り返されます。GRKU は GRKit のミラーではありません。GRKit のその後のリリースはマージするのではなく、内容を吟味しています。

## ソースからのビルド

Rust 1.92 以降、ARM 対応の Clang と LLD、リコー公式のファームウェアファイルが必要です（ファームウェアはリポジトリに含まれていません）。

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

`build/effects` には 135 種類すべてのルックが入ります。パッケージには最大 40 種類しか入らないため、`python3 -I scripts/defaults.py build/effects build/effects-default` で `effects/defaults.txt` の 40 種類を選びます。パッケージには 10 個のモジュールを収録できるため、1 つを除外します（リリース版では Border を除外しています）。GR III の場合は、`fwdc239b.bin` から `gr3-2.10` をビルドし、`--camera gr3` でパッケージします。その後、`python3 -I scripts/card.py write dist/GRKU-gr4.zip` でリーダーに入れたカードへパッケージを書き込みます。

## 貢献

[CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。カメラからのレポートは、特にお寄せいただきたい情報であり、とりわけ GR III または GR IIIx からのレポートを歓迎します。問題、アイデア、質問は [issues](https://github.com/botnick/GRKU/issues) へお送りください。

## ドキュメント（英語）

- [アーキテクチャ](docs/architecture.md)と[ワンショット起動](docs/one-shot-start.md)
- [モジュールの作り方](docs/modules.md)と[モジュールリファレンス](docs/module-reference.md)
- [デバイスレポート](docs/diagnostics.md)：`BOOT.TXT`、`REPORT.TXT`、`INSTALL.ERR` を 1 行ずつ解説
- [エフェクト](effects/README.md)、[LUT の出典](docs/lut-sources.md)、[2026 年の人気フィルム](docs/popular-films-2026.md)
- [ウェブサイト](web/README.md)、[ブランド](docs/brand.md)、[プロダクトノート](docs/PRODUCT.md)
- [ロードマップ](docs/roadmap.md)、[コミュニティアンケート](docs/community-survey.md)、[引き継ぎノート](HANDOFF.md)
- [リリース手順](docs/releasing.md)；GRKit より、GRKU では使用しない[高速起動ファームウェア](docs/fastboot.md)

## ライセンス

コードは [MIT ライセンス](LICENSE)です。GRKU は、同じく MIT である ahonn 氏の [GRKit](https://github.com/ahonn/GRKit) をもとにしており、その表記を保持しています。各パッケージには、収録ファイルのライセンスをまとめた `LICENSES.md` が入っています。

- エフェクトのライセンスは CC BY-SA 4.0、MIT、または Apache-2.0 です。[effects/NOTICE.md](effects/NOTICE.md) をご覧ください。
- メニューとライブビューの文字には [Roboto Condensed](https://github.com/googlefonts/roboto-classic) を [SIL Open Font License 1.1](crates/grku-core/assets/RobotoCondensed-LICENSE.txt) のもとで使用しています。
- エフェクトのフィッティングは [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) から [MIT ライセンス](crates/grku-core/GR3_FILM_MODS_LICENSE.txt)のもとで移植しました。

RICOH および GR は Ricoh Company, Ltd. の商標です。フィルム名はそれぞれの所有者の商標です。GRKU は [BOTNICK](https://github.com/botnick) による独立したプロジェクトであり、リコー、GRKit の作者、またはいかなるフィルムメーカーとも関係ありません。
