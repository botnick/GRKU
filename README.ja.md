# GRKU.

**GR のあなたの、お気に入りのスタイルで** — SD カードから動作する、RICOH GR III・GR IIIx・GR IV 向けのフィルムルックです。ファームウェアの書き換えは行いません。カメラはカード上のスクリプトを実行し、カードがなければリコーが出荷した状態のカメラのままです。

[ไทย](README.th.md) | [English](README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | 日本語 | [한국어](README.ko.md)

[![Tests](https://github.com/botnick/GRKU/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKU/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![grku.app](https://img.shields.io/badge/site-grku.app-d94135)](https://grku.app)

GRKUは[BOTNICK](https://github.com/botnick)が手がける独立プロジェクトです。まずタイのGRユーザー向けに作られ、その後ほかの地域のユーザーにも広げられました。152種類のフィルムルックと実物のフィルム箱アイコンを備えたライブラリ、レシピ、追加モジュール、ワンショット起動、カード書き込みと追加ルック販売を行うサイト、タイ語音声、独自のリリース基盤を備えています。ユーザーマニュアルは[grku.app/docs](https://grku.app/docs/)にあります。

<p>
  <img src="resources/images/grku-root.jpg" alt="ADJ メニューの GRKU ページ" width="49%">
  <img src="resources/images/grku-menu.jpg" alt="MENU のカスタマイズタブにある GRKU セクション" width="49%">
</p>

画面内の写真：[Mobnoboka](https://commons.wikimedia.org/wiki/File:Oguchi_Joushi_Kouen_1.jpg)、[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。

## 機能

撮影中に ADJ レバーを押し、6 番目の項目「GRKU」を選びます。GRKU のすべての機能はそこにあり、MENU の GRKU セクションにもあります。カメラの電源を切った後でも、ADJ は前回離れた行の GRKU の位置で再び開きます。

- **フィルムルック**：実在するフィルムの 152 種類のルックで、カードには一度に 40 種類を保存できます。Kodak、Fujifilm、Ilford、CineStill、Lomography、Polaroid、Agfa、Harman、Rollei に加え、GR II のポジフィルムを再現した GRKU 独自の GR II Positive (GRKU)、そして無料で利用できる Provia や Classic Chrome から Acros までの FUJIFILM カメラの 10 種類のフィルムシミュレーションも収録しています。各ルックには実物のパッケージの色を模したフィルム箱のアイコンが付いています。Fn でルックを微調整でき、サイトから手持ちの LUT を読み込むこともできます。
- **レシピ**：カメラ全体のルックに名前を付けて保存したり、サイトから人気のレシピを取り込んだりして、フィルムルックまたは Image Control、粒状感、グロー、ホワイトバランス、補正、露出をアンドゥ付きで一度に切り替えます。
- **フレーミング**：XPan、2.35:1、16:9、4:3、5:4、7:6、1:1、3:4。JPEG の切り抜きまたは構図枠線のみで表示します。**クロップ**：35、40、50、70 mm をライブビューで確認できます。
- **構図ガイド**：9 分割、画面中央、黄金比、対角線、黄金螺旋、ダイナミックシンメトリー。
- **日付写し込み**：クラシック、GR1s のドットマトリクス、GR II の書体で写真に日付を入れます。
- **グロー**：ライトやハイライトの周囲に広がるブルーム、映画用フィルムのような赤橙色のにじみを加えるハレーション。
- **光漏れ**：ビネット、ホコリや毛、光漏れ、傷のほか、Faded、Dusty、Leaky、Expired のプリセット。1 枚ごとに現れ方が変わります。
- **ディフュージョン**：Black Pro-Mist フィルターの 1/8、1/4、1/2、シャドウ部を覆う Black Mist のベール、点光源からのアナモルフィックレンズのような光条。また、単独で使えるフィルムソフトネス（弱・中・強）は、フィルムスキャンのような自然な柔らかさを加えます。
- **粒状感**：強さ4段階、サイズ4段階。カメラ描画または印画紙上のカラーネガの粒状感を再現するFilm-like（Andrea Volpatoによる[spektrafilm](https://github.com/andreavolpato/spektrafilm)の粒状モデルに基づく。piratenpanda作）。
- **Border**: 写真の周囲に白または黒の枠線（細め、太め、インスタント）を追加します。JPEG画像が枠線分拡大され、元の画素はすべて保持されます。
- **起動時の有効化**：電源を入れるたびに、GRKU をオン、オフ、または前回の状態のままにします。
- **Distance Unit**: スナップ撮影距離およびマニュアルフォーカスの距離目盛の単位（メートル／フィート）をMENU内の「GRKU Settings」で切り替えます。

GRKU の表示には、電源を入れてから約 9 秒かかります（インストール後の最初の起動ではもう少しかかります）。それまではカメラ本来の設定で動作します。設定した内容はすべてカードの `GRKU` フォルダーに保存されます。

## 対応カメラ

| カメラ | 実機で確認済み | 対応 |
| --- | --- | --- |
| GR III、GR III HDF | — | 2.10、2.20、2.21 |
| GR IIIx、GR IIIx HDF | — | 1.60、1.70、1.71 |
| GR IV、GR IV HDF | 1.11 | 1.11、1.20、1.21 |
| GR IV Monochrome | — | 1.00、1.10、1.11 |

GRKU独自の変更はファームウェア1.11のGR IVで動作確認済みです。GR IIIおよびGR IIIx向けパッケージは同一のコードとテストからビルドされていますが、実機での動作報告はまだありません。お試しいただいた際は、動作の有無を[issue](https://github.com/botnick/GRKU/issues)でお知らせください。2026年11月10日にリコーから公開されたファームウェア（GR III 2.21、GR IIIx 1.71、GR IV 1.21、GR IV Monochrome 1.11）向けビルドはリコーのファームウェアファイルと照合済みですが、実機ではまだ実行していません。

> [!WARNING]
> GRKU は試験的なプロジェクトです。ご利用は自己責任でお願いします。
> インストールするとカメラの SD スクリプト設定がオンになり、オフにするまでそのままです。GRKU に問題があると、カメラが起動中に止まることがあります。あらかじめ[復旧ガイド](resources/RECOVERY.md)をお読みください。

## インストール

[grku.app](https://grku.app) でカメラ、モジュール、フィルムルックを選び、次のどちらかを行います。

- Chrome か Edge から **SD カードに書き込む**（このサイトではアップデート、ルックの追加・削除、アンインストールも可能です）。
- **ZIP をダウンロード**（`GRKU-gr3.zip`、`GRKU-gr3x.zip`、または `GRKU-gr4.zip`）し、中の PDF ガイドの手順に従う（[GR III と GR IIIx](resources/INSTALLATION.md)、[GR IV](resources/INSTALLATION-GR4.md)）。

MENU ボタンを押しながら電源を入れるのは初回だけです。ZIP からアップデートするときは、カードの `SCRIPT` フォルダーを入れ替えてください。設定は `GRKU` に残ります。カードをフォーマットすると GRKU は消去されます。

`GRKIT`フォルダーがある古いカードから移行する場合、サイトが設定とルックを`GRKU`へ移動します。手動でファイルをコピーする場合は、初回起動前にカード直下で`GRKIT`を`GRKU`にリネームするか、削除してください。

GRKU が表示されない場合は、`GRKU/REPORT.TXT`、`GRKU/BOOT.TXT`、`SCRIPT/GRKU/INSTALL.ERR`（存在する場合）を添えて [issue](https://github.com/botnick/GRKU/issues/new) を送信してください。[各行の意味について](docs/diagnostics.md)。

## GRKU Plus

無料のサイトでは、任意の 10 種類のルックをカードに書き込めます。GRKU Plus は PromptPay による 1 回限りの支払いで、25 スロット、ブランドパック、またはすべて（40 スロットとすべてのルック）のロックを解除します。キーはメールで届き、すべてのデバイスで使用できます。このサービスは `services/plus` で動作し、カードを見ることは一切ありません。

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

`build/effects` には 152 種類すべてのルックが入ります。パッケージには最大 40 種類しか入らないため、`python3 -I scripts/defaults.py build/effects build/effects-default` で `effects/defaults.txt` の 40 種類を選びます。パッケージには 10 個のモジュールを収録できるため、1 つを除外します（リリース版では Border を除外しています）。GR III の場合は、それぞれのファームウェアの `fwdc239b.bin` から `gr3-2.10` と `gr3-2.21` をビルドし、`--camera gr3` とそれぞれに対する `--build` を指定してパッケージします。GR IV のパッケージには `gr4-1.11`、`gr4-1.20`、`gr4-1.21` を含めます。その後、`python3 -I scripts/card.py write dist/GRKU-gr4.zip` でリーダーに入れたカードへパッケージを書き込みます。

## 貢献

[CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。カメラからのレポートは、特にお寄せいただきたい情報であり、とりわけ GR III または GR IIIx からのレポートを歓迎します。問題、アイデア、質問は [issues](https://github.com/botnick/GRKU/issues) へお送りください。

## ドキュメント

- [アーキテクチャ](docs/architecture.md)と[ワンショット起動](docs/one-shot-start.md)
- [モジュールの作り方](docs/modules.md)と[モジュールリファレンス](docs/module-reference.md)
- [デバイスレポート](docs/diagnostics.md)：`BOOT.TXT`、`REPORT.TXT`、`INSTALL.ERR` を 1 行ずつ解説
- [エフェクト](effects/README.md)、[LUT の出典](docs/lut-sources.md)、[2026 年の人気フィルム](docs/popular-films-2026.md)
- [ウェブサイト](web/README.md)、[ブランド](docs/brand.md)、[プロダクトノート](docs/PRODUCT.md)
- [ロードマップ](docs/roadmap.md)、[コミュニティアンケート](docs/community-survey.md)、[引き継ぎノート](HANDOFF.md)
- [リリース手順](docs/releasing.md)およびgrku.appの[ユーザーマニュアル](https://grku.app/docs/)

## ライセンス

コードは [MIT ライセンス](LICENSE)です。GRKU は、同じく MIT である ahonn 氏の [GRKit](https://github.com/ahonn/GRKit) のコードを含んでおり、その表記を保持しています。各パッケージには、収録ファイルのライセンスをまとめた `LICENSES.md` が入っています。

- エフェクトのライセンスは CC BY-SA 4.0、MIT、または Apache-2.0 です。[effects/NOTICE.md](effects/NOTICE.md) をご覧ください。
- メニューとライブビューの文字には [Roboto Condensed](https://github.com/googlefonts/roboto-classic) を [SIL Open Font License 1.1](crates/grku-core/assets/RobotoCondensed-LICENSE.txt) のもとで使用しています。
- エフェクトのフィッティングは [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) から [MIT ライセンス](crates/grku-core/GR3_FILM_MODS_LICENSE.txt)のもとで移植しました。

RICOHおよびGRは株式会社リコーの商標です。フィルム名は各権利者の商標です。GRKUは[BOTNICK](https://github.com/botnick)による独立プロジェクトであり、リコーおよび各フィルムメーカーとは提携関係にありません。
