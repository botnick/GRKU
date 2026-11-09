# GRKU · BOTNICK edition

GRKU は **BOTNICK** による、ahonn 氏の [GRKit](https://github.com/ahonn/GRKit) のフォークです。135 フィルムのライブラリとリアルなフィルム箱のアイコン、Positive GRII ルック、色付きのメニュータイル、Border モジュール・Light Leak モジュール・Diffusion モジュール、フィート単位の Snap 距離、より早く読み込まれるワンショット起動を備え、高速起動ファームウェアは使用しません。GRKU は SD カード上のスクリプトのまま動作します。カードをフォーマットすれば、カメラは元の状態に戻ります。

[English](README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | 日本語 | [한국어](README.ko.md) | [ไทย](README.th.md)

[![Tests](https://github.com/botnick/GRKit/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

GRKU は、RICOH GR III・GR IIIx・GR IV に、フィルム風の色、XPan などの比率、日付写し込み、グロー、ライトリーク、ディフュージョン、粒状感、ボーダーを追加するツールです。SD カードから動作し、ファームウェアには一切書き込みません。カードを抜けば、カメラは元の状態に戻ります。

<p>
  <img src="resources/images/grkit-root.ja.jpg" alt="ADJ メニューの GRKU ページ" width="49%">
  <img src="resources/images/grkit-menu.ja.jpg" alt="MENU のカスタマイズタブにある GRKU" width="49%">
</p>

写真：[MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/)、[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)

## 機能

撮影中に ADJ レバーを押し、6 番目の項目「GRKU」を選びます。

- **フィルムルック**：135 種類のルック。そのうち 40 種類はパッケージに、残りはフィルムライブラリに収録されています。Kodak、Fujifilm、Ilford、CineStill、Lomography、Polaroid、Agfa、Harman、GR II を再現した Positive GRII ルックなど、それぞれにライブプレビューと専用のフィルムボックスのアイコンが付いています。[grku.app](https://grku.app) で手持ちの `.cube` LUT や Lightroom プリセットも読み込めます。各ルックはオープンソースのフィルム LUT をもとに近似したもので、元の LUT に近いものの、まったく同じではありません（[出典](effects/NOTICE.md)）。
- **フレーミング**：XPan、2.35:1、16:9、4:3、5:4、7:6、1:1。JPEG の切り抜きと構図ガイドのみを選べ、マスクか枠線で表示します。どちらのモードでも、比率を選ぶとカメラ側が 3:2 になります。オフにするとカメラ側の現在の比率がそのまま保たれます。

  RAW の初期表示範囲はカメラ本来の 3:2 を保ち、カメラのデジタルクロップ設定も保持します。埋め込みプレビューには、選んだ構図が表示されることがあります。

- **構図ガイド**：9 分割、画面中央、黄金比、対角線、黄金螺旋、ダイナミックシンメトリー。
- **日付入れ撮影**：クラシック、GR1s のドット、GR II の書体で写真に日付を入れます。
- **グロー**：ブルームはライトやハイライトの周囲に柔らかな光を広げます。ハレーションは明るい光源の周囲に赤橙色のにじみを加え、映画用フィルムのような効果を再現します。それぞれ有効・無効と強度を個別に設定でき、同時に使用できます。
- **光漏れ**：写真にフィルム特有のアーティファクトを加えます。ビネット、ホコリや毛、光漏れ、傷があり、それぞれオフ・弱・中・強から選べるほか、Faded、Dusty、Leaky、Expired のプリセットもあります。1 枚ごとに現れ方が変わります。
- **ディフュージョン**：Black Pro-Mist ディフュージョンフィルターの 1/8、1/4、1/2 の柔らかな光を再現します。Black Mist はフィルターのベールをシャドウ部にかけ、Streak はアナモルフィックレンズのような、点光源からの青または琥珀色の水平フレアを加えます。JPEG のみに対応します。
- **粒状感**：強度は 4 段階、粒の大きさは 4 種類（自動・小・中・大）から選べます。
- **ボーダー**：写真の周囲に白または黒のプリント枠を付けます。幅は写真の横幅の 3% または 6% です。
- **フィート表示**：カードに `GRKU/FEET.TXT` ファイルを置くと、Snap Focus Distance の設定がメートルではなく 1'、3'、5'、7'、8'、16' の表示になります。

GRKU の読み込みには、電源を入れてから約 9 秒かかり、インストール・アップデート後の最初の起動ではもう少しかかります。それまではカメラ本来の設定で撮影されます。すべての設定は MENU のカスタマイズタブの最後にある GRKU にあります。モジュールを自作する場合は [Writing a module](docs/modules.md) をご覧ください。

GRKU には高速起動ファームウェアはなく、今後も作られません。カメラのファームウェアはリコーが出荷した状態のままで、GRKU はカード上のスクリプトにすぎず、フォーマットすれば消えます。このフォークの[ワンショット起動](docs/one-shot-start.md)により、公式ファームウェア上で GRKit よりも速く読み込まれます。

## 対応カメラ

| カメラ | 実機で確認済み | 対応 |
| --- | --- | --- |
| GR III、GR III HDF | 2.10、2.20 | — |
| GR IIIx、GR IIIx HDF | 1.60、1.70 | — |
| GR IV、GR IV HDF | 1.11、1.20 | — |
| GR IV Monochrome | 1.00 | 1.10 |

この表は GRKit のものです。本フォークによる変更点は、ファームウェア 1.11 の GR IV で動作しています。GR III および GR IIIx 用のパッケージは同じコードからビルドされていますが、まだそれらのカメラでは実行されておらず、最新のモジュール（Light Leak、Diffusion、Border）およびフィートのラベルも、最初のカメラでのテストを待っている状態です。GR IV Monochrome ではフィルムルックは使えません。ほかの機種やファームウェアには対応していません。対応カメラで GRKU が読み込まれない場合は、[ファームウェア書き出しガイド](resources/DUMP.ja.md)をご覧ください。

> [!WARNING]
> GRKU は試験的なプロジェクトです。ご利用は自己責任でお願いします。
> インストールするとカメラの SD スクリプト設定がオンになり、オフにするまでそのままです。GRKU に問題があるとカメラが起動中に止まることがあるため、インストール前に[復旧ガイド](resources/RECOVERY.ja.md)をお読みください。

## インストール

このフォークのサイト [grku.app](https://grku.app) でカメラ、モジュール、エフェクトを選び、次のどちらかでインストールします。

- パソコンの Chrome か Edge で **SD カードに直接書き込む**。このサイトでは GRKU のアップデートやアンインストール、モジュールやエフェクトの追加・削除もできます。
- **ZIP をダウンロード**（`GRKU-gr3.zip`、`GRKU-gr3x.zip`、または `GRKU-gr4.zip`）し、中の PDF ガイドの手順に従います（[GR III と GR IIIx](resources/INSTALLATION.ja.md)、[GR IV](resources/INSTALLATION-GR4.ja.md)）。

または、このリポジトリからパッケージをビルドし（後述）、リーダーに入れたカードへ `python3 -I scripts/card.py write dist/GRKU-gr4.zip` で書き込みます。同じスクリプトでフィートのラベルのオン・オフ（`feet on`、`feet off`）の切り替えや、カードの状態の確認（`status`）ができます。

MENU ボタンを押しながら電源を入れるのは初回だけです。ZIP からアップデートするときは、カードの `SCRIPT` フォルダーを入れ替えてください。設定は `GRKU` に残ります。カードをフォーマットすると GRKU も消えるので、先に `GRKU` をパソコンにコピーしておいてください。

GRKU が表示されない場合は、`GRKU/REPORT.TXT`、`GRKU/BOOT.TXT`、`SCRIPT/GRKU/INSTALL.ERR`（ある場合）を添えて [issue](https://github.com/botnick/GRKit/issues/new) を送信してください。[これらのファイルの各行の意味](docs/diagnostics.md)。

## ソースからのビルド

Rust 1.92 以降、ARM 対応の Clang と LLD、リコー公式のファームウェアファイルが必要です（ファームウェアはリポジトリに含まれていません）。

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

`build/effects` には 135 種類すべてのルックが入ります。パッケージには最大 40 種類しか入らないため、`python3 -I scripts/defaults.py build/effects build/effects-default` で `effects/defaults.txt` にある 40 種類を選び、`--effects` 引数に使います。GR IV では `gr4-1.11` と `gr4-1.20` をビルドし、両方を `--camera gr4` でパッケージします。ほかのカメラ、一部のモジュールだけのパッケージ、ほかの言語のガイドについては [Build packages](CONTRIBUTING.md#build-packages) と [HANDOFF.md](HANDOFF.md) をご覧ください。

## 貢献

[CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。GRKU が動作したかどうかにかかわらず、デバイスのレポートを歓迎します。特に、このフォークがまだ実行されていない GR III および GR IIIx からのレポートを歓迎します。問題、アイデア、質問は [issues](https://github.com/botnick/GRKit/issues) としてお送りください。GRKit 自体にとって有用な変更は、プルリクエストとして上流に送られます。

## ドキュメント（英語）

- [アーキテクチャ](docs/architecture.md)
- [モジュールの作り方](docs/modules.md)と[モジュールリファレンス](docs/module-reference.md)
- [デバイスレポートの 3 つのファイル](docs/diagnostics.md)：`BOOT.TXT`、`REPORT.TXT`、`INSTALL.ERR` を 1 行ずつ解説
- [ワンショット起動](docs/one-shot-start.md)：公式ファームウェアで GRKU がより早く読み込まれる仕組み
- [エフェクト](effects/README.md)と、デフォルトの 40 種のもとになった [2026 年の人気フィルム](docs/popular-films-2026.md)
- [ウェブサイト](web/README.md)と[ブランドシート](docs/brand.md)
- このフォークの[ロードマップ](docs/roadmap.md)と[引き継ぎ](HANDOFF.md)
- GRKit より：GRKU では使用しない[高速起動ファームウェア](docs/fastboot.md)と、[リリース手順](docs/releasing.md)

## ライセンス

コードは [MIT ライセンス](LICENSE)です。GRKU は、同じく MIT ライセンスである ahonn 氏の [GRKit](https://github.com/ahonn/GRKit) をもとにしており、その表記を保持しています。各パッケージには、収録ファイルのライセンスをまとめた `LICENSES.md` が入っています。

- エフェクトのライセンスは CC BY-SA 4.0、MIT、または Apache-2.0 です。詳しくは [effects/NOTICE.md](effects/NOTICE.md) をご覧ください。
- メニューと撮影画面の文字には [Roboto Condensed](https://github.com/googlefonts/roboto-classic) を [SIL Open Font License 1.1](crates/grkit-core/assets/RobotoCondensed-LICENSE.txt) のもとで使用しています。
- エフェクトのフィッティング手法は [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) から [MIT ライセンス](crates/grkit-core/GR3_FILM_MODS_LICENSE.txt)のもとで移植しました。

RICOH および GR は Ricoh Company, Ltd. の商標です。フィルム名はそれぞれの所有者の商標です。GRKU は独立したプロジェクトであり、リコーや GRKit の作者、フィルムメーカーとは関係ありません。
