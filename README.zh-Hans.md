# GRKU · BOTNICK edition

GRKU 由 **BOTNICK** 制作，是 ahonn 的 [GRKit](https://github.com/ahonn/GRKit) 的一个分支：一个 135 胶片库，带有逼真的胶卷盒图标、Positive GRII 风格、彩色菜单色块、Border、Light Leak 和 Diffusion 模块、以英尺为单位的 Snap 对焦距离、加载更快的一次性启动，并且没有快速启动固件。GRKU 始终是存储卡上的一个脚本：格式化存储卡，相机就恢复原样。

[English](README.md) | 简体中文 | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [ไทย](README.th.md)

[![Tests](https://github.com/botnick/GRKit/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

GRKU 给 RICOH GR III、GR IIIx 和 GR IV 加上胶片风格、XPan 等裁切、日期打印、光晕、漏光、柔光扩散、颗粒和边框。它从存储卡运行，从不写入固件。拔掉存储卡，相机就恢复原样。

<p>
  <img src="resources/images/grkit-root.zh-Hans.jpg" alt="ADJ 菜单中的 GRKU 页面" width="49%">
  <img src="resources/images/grkit-menu.zh-Hans.jpg" alt="MENU 自定义页中的 GRKU 小节" width="49%">
</p>

照片：[MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/)，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)。

## 功能

拍摄时按下 ADJ 拨杆，选择第 6 项 GRKU。

- **胶片风格**：共 135 种，其中 40 种在安装包里，其余在胶片库中：Kodak、Fujifilm、Ilford、CineStill、Lomography、Polaroid、Agfa、Harman、源自 GR II 的 Positive GRII 风格，等等，每种都有实时预览和自己的胶片盒图标。也可以在 [grku.app](https://grku.app) 导入自己的 `.cube` LUT 或 Lightroom 预设。风格由开源胶片 LUT 拟合而来，效果接近原 LUT，但不完全一样（[来源](effects/NOTICE.md)）。
- **画幅**：XPan、2.35:1、16:9、4:3、5:4、7:6 和 1:1。可裁切 JPEG，也可仅辅助构图，用遮罩或框线标出范围。两种模式下，选择比例都会把相机设为 3:2。关闭画幅时保留相机当前比例。

  RAW 的默认裁切范围保持原生 3:2，并保留相机的数字裁切设置。内嵌预览仍可能显示所选构图。

- **辅助线**：三分法、中心、黄金分割、对角线、黄金螺旋或动态对称。
- **加印日期**：在照片上印日期，有经典、GR1s 点阵和 GR II 三种样式。
- **光晕**：柔光让灯光和高光向周围柔和扩散。胶片光晕在明亮光源周围形成橙红色光晕，模拟电影胶片效果。两项各有“启用”和“强度”设置，可同时开启。
- **漏光**：照片上的胶片瑕疵：暗角、灰尘和毛发、漏光、划痕，各有“关闭、弱、中、强”四档，也有 Faded、Dusty、Leaky、Expired 四种预设。每张照片上的分布都不同。
- **柔焦**：黑柔滤镜（Black Pro-Mist）的柔光效果，强度可选 1/8、1/4 或 1/2。Black Mist 在阴影上叠加滤镜的薄纱感，Streak 让点光源产生变形宽银幕镜头式的蓝色或琥珀色水平眩光。仅限 JPEG。
- **颗粒感**：胶片颗粒，四档强度、四种大小（自动、小、中、大）。
- **边框**：在照片上叠加白色或黑色的打印边框，宽度为照片宽度的 3% 或 6%。
- **英尺**：卡上若有 `GRKU/FEET.TXT` 文件，Snap Focus Distance 设置将显示 1'、3'、5'、7'、8' 和 16'，而不是米。

GRKU 开机后需要约 9 秒加载，安装或更新后的第一次开机会更久。在此之前相机使用原本的设置。完整设置在 MENU 自定义页最后的 GRKU 小节。想自己写模块，见 [Writing a module](docs/modules.md)。

GRKU 没有快速启动固件，以后也不会有：相机固件保持理光出厂原样，GRKU 只是存储卡上的一个脚本，格式化即可删除。本分支的[一次性启动](docs/one-shot-start.md)让它在官方固件上比 GRKit 加载得更快。

## 支持的机型

| 机型 | 真机测试 | 已支持 |
| --- | --- | --- |
| GR III、GR III HDF | 2.10、2.20 | — |
| GR IIIx、GR IIIx HDF | 1.60、1.70 | — |
| GR IV、GR IV HDF | 1.11、1.20 | — |
| GR IV Monochrome | 1.00 | 1.10 |

上表来自 GRKit。本分支的改动已在固件 1.11 的 GR IV 上运行过；GR III 和 GR IIIx 的安装包由同一份代码构建，但尚未在这些相机上运行过，最新的模块（Light Leak、Diffusion、Border）以及英尺标注也还在等待第一次真机测试。GR IV Monochrome 不含胶片风格。其他机型和固件版本暂不支持。如果 GRKU 在受支持的相机上无法加载，请看[固件导出指南](resources/DUMP.zh-Hans.md)。

> [!WARNING]
> GRKU 仍是实验性项目，使用风险自负。
> 安装时会打开相机的 SD 脚本设置，之后需要手动关闭。如果 GRKU 出错，相机可能卡在开机阶段，安装前请先读[恢复指南](resources/RECOVERY.zh-Hans.md)。

## 安装

在本分支的网站 [grku.app](https://grku.app) 上选好相机、模块和效果，然后任选一种方式：

- **直接写入 SD 卡**：在电脑上用 Chrome 或 Edge 操作。网站还可以更新或卸载 GRKU，以及增删模块和效果。
- **下载 ZIP**（`GRKU-gr3.zip`、`GRKU-gr3x.zip` 或 `GRKU-gr4.zip`），按包里的 PDF 指南操作（[GR III 和 GR IIIx](resources/INSTALLATION.zh-Hans.md)、[GR IV](resources/INSTALLATION-GR4.zh-Hans.md)）。

也可以从本仓库构建安装包（见下文），然后用读卡器执行 `python3 -I scripts/card.py write dist/GRKU-gr4.zip` 写入存储卡；同一个脚本还能开关脚垫标签（`feet on`、`feet off`）并查看存储卡状态（`status`）。

只有第一次需要按住 MENU 开机。用 ZIP 更新时，替换卡里的 `SCRIPT` 文件夹即可，设置保存在 `GRKU` 里。格式化存储卡会删掉 GRKU，格式化前先把 `GRKU` 复制到电脑。

如果 GRKU 没有出现，请在 [issue](https://github.com/botnick/GRKit/issues/new) 中附上 `GRKU/REPORT.TXT`、`GRKU/BOOT.TXT` 和 `SCRIPT/GRKU/INSTALL.ERR`（如果有）。[这些文件每一行的含义](docs/diagnostics.md)。

## 从源码构建

需要 Rust 1.92 及以上、支持 ARM 的 Clang 和 LLD，以及理光官方固件文件（仓库不包含固件）。

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

`build/effects` 包含全部 135 个效果；一个安装包最多带 40 个，因此用 `python3 -I scripts/defaults.py build/effects build/effects-default` 挑出 `effects/defaults.txt` 里的 40 个，供 `--effects` 参数使用。GR IV 需构建 `gr4-1.11` 和 `gr4-1.20`，并用 `--camera gr4` 把两者一起打包。其他机型、部分模块或其他语言的指南，见 [Build packages](CONTRIBUTING.md#build-packages) 和 [HANDOFF.md](HANDOFF.md)（英文）。

## 参与贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。不管能不能用，都欢迎提交设备报告，尤其是 GR III 和 GR IIIx，这个分支还没在这些机型上运行过。遇到问题、有功能想法或疑问，请提交 [issues](https://github.com/botnick/GRKit/issues)。对 GRKit 本身有用的改动，请以 pull request 的形式提交到上游。

## 文档

- [架构](docs/architecture.md)
- [编写模块](docs/modules.md)和[模块参考](docs/module-reference.md)
- [设备报告的三个文件](docs/diagnostics.md)：`BOOT.TXT`、`REPORT.TXT` 和 `INSTALL.ERR`，逐行说明
- [一次性启动](docs/one-shot-start.md)：GRKU 如何在官方固件上更快加载
- [效果](effects/README.md)和默认 40 款背后的 [2026 年热门胶片](docs/popular-films-2026.md)
- [网站](web/README.md)和[品牌手册](docs/brand.md)
- 本分支的[路线图](docs/roadmap.md)和[交接说明](HANDOFF.md)
- 来自 GRKit：[快速启动固件](docs/fastboot.md)（GRKU 不使用）和[发布流程](docs/releasing.md)

## 许可

代码采用 [MIT 许可证](LICENSE)。GRKU 基于 ahonn 的 [GRKit](https://github.com/ahonn/GRKit)（同样采用 MIT 许可）开发，并保留了其声明。每个安装包都带有 `LICENSES.md`，列出包内文件的许可。

- 效果采用 CC BY-SA 4.0、MIT 或 Apache-2.0 许可，详见 [effects/NOTICE.md](effects/NOTICE.md)。
- 菜单和取景画面的文字使用 [Roboto Condensed](https://github.com/googlefonts/roboto-classic) 字体，采用 [SIL Open Font License 1.1](crates/grkit-core/assets/RobotoCondensed-LICENSE.txt)。
- 效果拟合方法移植自 [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods)，采用 [MIT 许可证](crates/grkit-core/GR3_FILM_MODS_LICENSE.txt)。

RICOH 和 GR 是 Ricoh Company, Ltd. 的商标，胶片名称是各自所有者的商标。GRKU 是独立项目，与理光、GRKit 的作者及任何胶片厂商均无关联。
