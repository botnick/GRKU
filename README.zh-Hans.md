# GRKU.

**GR 的个性，由你做主** —— 适用于 RICOH GR III、GR IIIx 和 GR IV 的胶片风格，直接从 SD 卡运行。从不写入固件：相机运行存储卡上的一个脚本，拔掉存储卡，它就变回理光出厂时的原样相机。

[ไทย](README.th.md) | [English](README.md) | 简体中文 | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

[![Tests](https://github.com/botnick/GRKU/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKU/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![grku.app](https://img.shields.io/badge/site-grku.app-d94135)](https://grku.app)

GRKU 是由 [BOTNICK](https://github.com/botnick) 开发的独立项目，最初面向泰国 GR 用户，随后扩展至所有用户：包含 152 款胶片色彩预设及真实胶片盒图标、配方、更多功能模块、一键启动、支持写入存储卡及售卖额外预设的网站、泰语语音，以及独立的发布流程。用户手册位于 [grku.app/docs](https://grku.app/docs/)。

<p>
  <img src="resources/images/grku-root.jpg" alt="ADJ 菜单中的 GRKU 页面" width="49%">
  <img src="resources/images/grku-menu.jpg" alt="MENU 自定义页中的 GRKU 小节" width="49%">
</p>

屏幕中的照片：[Mobnoboka](https://commons.wikimedia.org/wiki/File:Oguchi_Joushi_Kouen_1.jpg)，[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。

## 功能

拍摄时按下 ADJ 拨杆，选择第 6 项 GRKU。GRKU 的所有功能都在这里，以及 MENU 的 GRKU 小节中。再次按下 ADJ 时仍会停留在 GRKU 上，并停留在你离开时的那一行，即使关机后再开也是如此。

- **Film Look**：152 种真实胶片风格，卡上一次最多 40 种。Kodak、Fujifilm、Ilford、CineStill、Lomography、Polaroid、Agfa、Harman 和 Rollei，以及源自 GR II 正片（Positive Film）的 GRKU 专属 Positive GRII 风格，还有富士相机的十款胶片模拟（从 Provia、Classic Chrome 到 Acros，均可免费使用）。每种风格都有采用真实胶卷盒配色的胶片盒图标。按 Fn 键可调整风格；也可以在网站上导入自己的 LUT。
- **Recipes**：将相机的整套风格以名称保存，或从网站载入热门配方，然后一键切换 Film Look 或 Image Control、颗粒、光晕、白平衡、校正与曝光，并支持撤销。
- **Framing**：XPan、2.35:1、16:9、4:3、5:4、7:6、1:1 或 3:4，可直接裁切 JPEG，也可仅显示框线。**Crop**：35、40、50 或 70 mm，带有实时取景。
- **Guides**：三分法、中心、黄金分割、对角线、黄金螺旋、动态对称。
- **Date Imprint**：在照片上印日期，有经典、GR1s 点阵或 GR II 样式。
- **Glow**：灯光和高光周围的柔光（Bloom），以及模拟电影胶片配色的橙红色光晕（Halation）。
- **Light Leak**：暗角、灰尘和毛发、漏光、划痕，或 Faded、Dusty、Leaky 和 Expired 预设。每张照片上的分布都不同。
- **Diffusion**：黑柔滤镜（Black Pro-Mist）效果，强度可选 1/8、1/4 或 1/2，阴影上的 Black Mist 薄纱感，以及点光源的变形宽银幕横向眩光；此外还可单独使用胶片柔和度（弱、中、强），呈现胶片扫描般的柔和质感。
- **颗粒**：提供四档强度与四档尺寸，支持相机原生渲染或“胶片感”（还原彩色负片印在相纸上的颗粒效果，参考 Andrea Volpato 开发的 [spektrafilm](https://github.com/andreavolpato/spektrafilm) 颗粒模型，由 piratenpanda 实现）。
- **Border**：为整张照片添加窄、宽或拍立得样式的黑白边框；JPEG 图像尺寸随边框扩展，完整保留照片全部像素。
- **Enable at Start**：每次开机时开启、关闭或保持上次退出时的状态。
- **Distance Unit**：可在 MENU 的 GRKU Settings 中，将快拍对焦距离和手动对焦标尺切换为米或英尺。

GRKU 在开机后约 9 秒出现（安装后的第一次开机耗时更长）。在此之前，相机保持原样。你所设置的一切都保存在存储卡的 `GRKU` 文件夹中。

## 支持的机型

| 机型 | 真机测试 | 已支持 |
| --- | --- | --- |
| GR III、GR III HDF | — | 2.10、2.20、2.21 |
| GR IIIx、GR IIIx HDF | — | 1.60、1.70、1.71 |
| GR IV、GR IV HDF | 1.11 | 1.11、1.20、1.21 |
| GR IV Monochrome | — | 1.00、1.10、1.11 |

GRKU 自身的修改已在固件 1.11 的 GR IV 上运行通过。GR III 与 GR IIIx 安装包由相同的代码和测试构建而成，但目前尚无人在这两款机型上实际运行过 GRKU。如果你进行了测试，无论成功与否，都请在 [issue](https://github.com/botnick/GRKU/issues) 中告诉我们。针对理光于 2026 年 11 月 10 日发布的固件（GR III 2.21、GR IIIx 1.71、GR IV 1.21、GR IV Monochrome 1.11）所构建的版本，已对照理光固件文件完成校验，但尚未在实机上运行。

> [!WARNING]
> GRKU 仍是实验性项目。使用风险自负。
> 安装时会打开相机的 SD 脚本设置，之后会一直保持开启，直到您手动关闭。如果 GRKU 出错，相机可能卡在开机阶段。请先阅读[恢复指南](resources/RECOVERY.md)。

## 安装

前往 [grku.app](https://grku.app)，选好相机、模块和胶片风格，然后任选一种方式：

- **写入 SD 卡**：在 Chrome 或 Edge 中操作（网站还支持更新、增删胶片风格以及卸载），或
- **下载 ZIP**（`GRKU-gr3.zip`、`GRKU-gr3x.zip` 或 `GRKU-gr4.zip`），并按照压缩包内的 PDF 指南操作（[GR III 和 GR IIIx](resources/INSTALLATION.md)、[GR IV](resources/INSTALLATION-GR4.md)）。

只有第一次需要按住 MENU 开机。若要通过 ZIP 更新，替换存储卡上的 `SCRIPT` 文件夹即可；你的设置保存在 `GRKU` 中。格式化存储卡会删除 GRKU。

如果你使用的是包含 `GRKIT` 文件夹的旧存储卡：网站会将其中的设置和预设迁移至 `GRKU`。如果改为手动复制文件，请在首次启动前将存储卡根目录下的 `GRKIT` 重命名为 `GRKU`，或将其删除。

如果 GRKU 没有显示，请在 [issue](https://github.com/botnick/GRKU/issues/new) 中附上 `GRKU/REPORT.TXT`、`GRKU/BOOT.TXT` 和 `SCRIPT/GRKU/INSTALL.ERR`（如果存在）。[每一行的含义](docs/diagnostics.md)。

## GRKU Plus

免费网站可将任意 10 种风格写入存储卡。GRKU Plus 是通过 PromptPay 进行的一次性付款，可解锁 25 个卡位、品牌包或全部内容（40 个卡位和所有风格）。密钥会通过电子邮件发送，并可在所有设备上使用。该服务运行在 `services/plus` 中；它绝不会接触到您的存储卡。

## 从源码构建

需要 Rust 1.92 及以上、支持 ARM 的 Clang 和 LLD，以及理光官方固件文件（仓库不包含固件）。

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

`build/effects` 包含全部 152 个效果；一个安装包最多带 40 个，因此用 `python3 -I scripts/defaults.py build/effects build/effects-default` 挑出 `effects/defaults.txt` 里的 40 个。一个安装包可容纳十个模块，所以需要省去一个（发布版本省去了 Border）。对于 GR III，分别从对应固件的 `fwdc239b.bin` 构建 `gr3-2.10` 和 `gr3-2.21`，并使用 `--camera gr3` 以及为每一个构建传入 `--build` 来打包；GR IV 安装包则包含 `gr4-1.11`、`gr4-1.20` 和 `gr4-1.21`。然后 `python3 -I scripts/card.py write dist/GRKU-gr4.zip` 即可将安装包写入读卡器中的存储卡。

## 参与贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。来自相机的报告是你能提供的最有用的东西，尤其是来自 GR III 或 GR IIIx 的报告。遇到问题、有想法或疑问，请提交到 [issues](https://github.com/botnick/GRKU/issues)。

## 文档

- [架构](docs/architecture.md)与[一次性启动](docs/one-shot-start.md)
- [编写模块](docs/modules.md)与[模块参考](docs/module-reference.md)
- [设备报告](docs/diagnostics.md)：`BOOT.TXT`、`REPORT.TXT` 和 `INSTALL.ERR` 逐行说明
- [效果](effects/README.md)、[LUT 来源](docs/lut-sources.md)以及 [2026 年热门胶片](docs/popular-films-2026.md)
- [网站](web/README.md)、[品牌](docs/brand.md)与[产品说明](docs/PRODUCT.md)
- [路线图](docs/roadmap.md)、[社区调查](docs/community-survey.md)与[交接说明](HANDOFF.md)
- [发布说明](docs/releasing.md)，以及 grku.app 上的[用户手册](https://grku.app/docs/)

## 许可

代码采用 [MIT 许可证](LICENSE)。GRKU 包含来自 ahonn 的 [GRKit](https://github.com/ahonn/GRKit)（同样采用 MIT 许可）的代码，并保留了其声明。每个安装包都带有 `LICENSES.md`，列出包内文件的许可。

- 效果采用 CC BY-SA 4.0、MIT 或 Apache-2.0 许可。详见 [effects/NOTICE.md](effects/NOTICE.md)。
- 菜单和取景画面的文字使用 [Roboto Condensed](https://github.com/googlefonts/roboto-classic) 字体，采用 [SIL Open Font License 1.1](crates/grku-core/assets/RobotoCondensed-LICENSE.txt)。
- 效果拟合方法移植自 [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods)，采用 [MIT 许可证](crates/grku-core/GR3_FILM_MODS_LICENSE.txt)。

RICOH 与 GR 是理光株式会社（Ricoh Company, Ltd.）的商标。各胶片名称归其各自所有者所有。GRKU 是由 [BOTNICK](https://github.com/botnick) 开发的独立项目，与理光或任何胶片制造商均无隶属或关联关系。
