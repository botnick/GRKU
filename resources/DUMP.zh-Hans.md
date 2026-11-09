# 固件导出工具

固件导出工具把相机正在运行的固件映像从内存复制到存储卡。开发者用这个映像来支持 GRKU 还不认识的固件版本。

只有当 GRKU 不支持你相机的固件版本，或者开发者在 issue 中要求导出时，你才需要它。如果 GRKU 已经在你的相机上正常工作，你不需要它。

此工具只读取内存，不修改相机、固件和相机设置。导出的文件只包含理光固件，不包含照片和个人数据。

适用于 RICOH GR III、GR IIIx、GR IV、GR IV Monochrome 及其 HDF 型号。所有这些相机使用同一个 ZIP。

## 开始之前

- SD 脚本功能必须已经打开。安装 GRKU 时会打开它。如果你从未安装过 GRKU，先按相机的安装指南完成第 1 到第 3 步来安装一次 GRKU（[GR III 和 GR IIIx](https://grku.app/guides/gr3/en.pdf)、[GR IV](https://grku.app/guides/gr4/en.pdf)）。
- 此工具在存储卡上时，GRKU 不会加载。
- 使用充满电的电池。
- 从相机菜单中记录相机的固件版本。提交报告时会用到它。

## 获取工具

下载 [GRKU-dump.zip](https://github.com/botnick/GRKU/releases/latest/download/GRKU-dump.zip)。它与[最新版本](https://github.com/botnick/GRKU/releases/latest)中的 `GRKU-<版本>-dump.zip` 是同一个文件。

ZIP 中包含 `SD_ROOT/SCRIPT/STARTUP.TTL`、`SD_ROOT/SCRIPT/GRDUMP/DUMP.SH`、`SD_ROOT/SCRIPT/GRDUMP/DUMP.BIN` 以及一个 `README.txt`。

## 导出固件

1. 关闭相机。取出存储卡并放入电脑。
2. 如果存储卡上有 `SCRIPT` 文件夹，把它复制到电脑作为备份。如果没有，跳过这一步。
3. 解压工具。把 `SD_ROOT` 里面的 `SCRIPT` 文件夹复制到存储卡根目录。如果电脑提示，替换 `SCRIPT/STARTUP.TTL`。
4. 安全弹出存储卡。把它插入相机。正常开机，不要按住 MENU。
5. 保持相机开机等待 2 分钟。然后关闭相机。
6. 把存储卡放入电脑，并打开存储卡上的 `SCRIPT/GRDUMP`。

如果文件夹中有 `DUMP.OK`，表示导出完成。文件夹中还有约 20 MB 的 `RTOS.BIN` 和 `INFO.TXT`。

如果文件夹中有 `DUMP.ERR`，表示导出失败。`DUMP.ERR` 记录了错误代码。仍然发送这个文件夹。

如果两个文件都没有，表示相机没有运行此工具。确认 SD 脚本功能已经打开。然后重新执行第 4 到第 6 步。

## 发送文件

1. 把 `SCRIPT/GRDUMP` 文件夹压缩成 ZIP。
2. 把 ZIP 附加到一个 [GitHub issue](https://github.com/botnick/GRKU/issues/new) 中。写明相机型号和固件版本。

如果开发者在某个 issue 中请你导出，把 ZIP 附加到那个 issue。ZIP 大小约为 20 MB；GitHub 支持上传最大 25 MB 的文件。

## 恢复存储卡

1. 删除存储卡上的 `SCRIPT` 文件夹。
2. 如果你在第 2 步中制作了备份，把备份中的 `SCRIPT` 文件夹复制到存储卡。

恢复备份后，下次开机时 GRKU 会重新加载。如果没有备份，存储卡会恢复到之前的状态：待支持你的固件版本后，再从 https://grku.app 安装 GRKU。
