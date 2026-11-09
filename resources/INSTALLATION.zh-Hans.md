# GRKU

[English](https://github.com/botnick/GRKit/blob/main/README.md) | [繁體中文](https://github.com/botnick/GRKit/blob/main/README.zh-Hant.md) | 简体中文

仅适用于 RICOH GR III 和 GR III HDF 固件 2.10。

GRKU 是实验性软件，不提供任何担保。如果 GRKU 出错，相机可能在启动时停止响应。请在安装前阅读[恢复指南](https://github.com/botnick/GRKit/blob/main/resources/RECOVERY.md)。安装 GRKU 即表示你接受[使用条款](https://github.com/botnick/GRKit/blob/main/resources/TERMS.md)。

## 安装

在电脑上的 Chrome 或 Edge 中，[grku.app](https://grku.app/) 可以通过读卡器直接把 GRKU 写入存储卡，代替第 2 步。

1. 关闭相机。
2. 把 `SD_ROOT` 中的内容（不是这个文件夹本身）复制到存储卡根目录。复制后，根目录中应有 `SCRIPT` 文件夹。
3. 插入存储卡。按住 MENU 按钮开机，等待相机自动关机。
4. 正常开机。

第 3 步会打开相机的 SD 脚本功能：相机显示 Mode Set Command 和 Complete，然后自动关机。如果 SD 脚本功能已经打开，跳过第 3 步。

![Mode Set Command 画面显示 Script - Enable 和 Complete。](images/modeset.png)

安装后，可以从存储卡根目录删除 `00078350.588` 和 `DEVELOP.MOD`。

## 使用

开机几秒后，拍摄画面顶部显示 **GRKU**，表示 GRKU 加载完成。安装或更新后的第一次开机会久一些。在 GRKU 加载完成前拍的照片没有 GRKU 效果。在拍摄模式下按 ADJ 杆，选择第 6 项 GRKU。

![GRKU 页面列出模块，并显示当前效果。](images/grkit-root.jpg)

照片：[MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/)，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)。

- **胶片风格：** 高亮一个效果即可在实时取景中预览，按 OK 保留。按 Fn 调整这个效果。不会改变相机的 Image Control 设置。
- **画幅：** XPan、2.35:1、16:9 等比例。默认裁切 JPEG 照片，DNG 文件保持 3:2。按 Fn 可以改为仅辅助构图，或设置遮罩。
- **辅助线：** 只显示在屏幕上，不会出现在照片中。
- **加印日期：** 在照片右下角加印日期。按 Fn 选择日期样式和字体。
- **光晕：** Bloom 和 Halation，只作用于 JPEG 照片，拍摄画面不预览。
- **漏光：** 暗角、灰尘、漏光和划痕，只作用于 JPEG 照片，拍摄画面不预览。按 Fn 设置每一项的强度。
- **柔光：** Black Pro-Mist 柔光镜的光晕，只作用于 JPEG 照片，拍摄画面不预览。按 Fn 可添加 Black Mist、覆盖阴影的 veil，或变形宽银幕镜头水平眩光的 Streak。
- **颗粒感：** 给照片加胶片颗粒。按 Fn 选择颗粒大小。
- **边框：** 在照片上叠加白色或黑色边框，宽度为照片的 3% 或 6%，只作用于 JPEG 照片。

全部设置也在 MENU 自定义页（C）最后的 **GRKU** 小节中。每个模块一行，可以启用或关闭模块，在**可选项**中勾选 ADJ 里显示的效果、比例或样式，在 **ADJ 菜单顺序**中调整顺序。关机后 GRKU 会保留你的设置。

## 更新

在电脑上的 Chrome 或 Edge 中打开 [grku.app](https://grku.app/)，可以通过读卡器直接更新存储卡，代替第 2、3 步。

1. 关闭相机。
2. 从存储卡删除 `SCRIPT` 文件夹。
3. 把新安装包 `SD_ROOT` 中的 `SCRIPT` 文件夹复制到存储卡根目录。
4. 正常开机，不需要按住 MENU。

GRKU 把你的设置和效果保存在 `GRKU` 文件夹中，所以更新后仍在。要从 GRKit 转到 GRKU，请用 grku.app 更新，以保留设置和效果：两者都把设置和效果保存在同一个 `GRKU` 文件夹中。

## 故障排除

### 按住 MENU 开机时，相机开始更新固件

存储卡根目录中有固件文件。关闭相机，删除根目录中所有 `.bin` 文件，然后重新执行安装第 3 步。

### 相机没有显示 Mode Set Command

- 先按住 MENU 按钮，再开机。
- 把 `SD_ROOT` 中的内容复制到存储卡根目录，不要复制到 `DCIM` 等文件夹中。

### ADJ 中没有 GRKU

1. 开机后等待几秒，直到拍摄画面顶部显示 **GRKU**。
2. 确认存储卡根目录中有 `SCRIPT` 文件夹。
3. 如果存储卡中有 `SCRIPT/GRKU/INSTALL.ERR`，在相机菜单中确认安装包与相机的固件版本对应。版本正确时，请提交[设备报告](https://github.com/botnick/GRKit/issues/new?template=device-report.yml)，并附上 `INSTALL.ERR`、`GRKU/REPORT.TXT` 和 `GRKU/BOOT.TXT`（如果有）。
4. GRKU 只能在 Ricoh 官方固件上运行。

### 格式化存储卡后 GRKU 不工作

格式化会删除 GRKU 和它的设置。格式化之前，把 `GRKU` 文件夹复制到电脑。格式化之后，重新复制 `SD_ROOT` 中的内容，再把 `GRKU` 文件夹复制回存储卡根目录。

## 移除 GRKU

在电脑上的 Chrome 或 Edge 中打开 [grku.app](https://grku.app/)，可以通过读卡器直接移除 GRKU，并可同时关闭 SD 脚本功能。

关闭相机，从存储卡删除 `SCRIPT` 和 `GRKU` 文件夹。

SD 脚本功能会保持打开。要关闭它：

1. 在 https://grku.app 下载你的相机对应的关闭 SD 脚本的文件。
2. 把 `SD_ROOT` 中的内容复制到存储卡根目录。
3. 插入存储卡。按住 MENU 按钮开机，等待相机自动关机。
4. 从存储卡根目录删除 `00078350.588` 和 `DEVELOP.MOD`。

相机在启动时停止响应时，请参阅[恢复指南](https://github.com/botnick/GRKit/blob/main/resources/RECOVERY.md)。

GRKU 与 Ricoh 无关。源代码和许可：https://github.com/botnick/GRKit
