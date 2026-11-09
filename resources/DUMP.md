# Firmware dump tool

The firmware dump tool copies the firmware image that the camera runs from memory to the SD card. The developer uses this image to support a firmware version that GRKU does not know yet.

You need it only when GRKU does not support the firmware version of your camera, or when the developer asks for a dump in an issue. If GRKU already works on your camera, you do not need it.

The tool only reads memory. It does not change the camera, the firmware, or the camera settings. The files contain Ricoh firmware only. They do not contain photos or personal data.

For RICOH GR III, GR IIIx, GR IV, GR IV Monochrome, and their HDF models. The same ZIP works on every one of these cameras.

## Before you start

- SD scripts must be on. Installing GRKU turns them on. If you never installed GRKU, install GRKU once with steps 1 to 3 of the installation guide for your camera first ([GR III and GR IIIx](https://grku.app/guides/gr3/en.pdf), [GR IV](https://grku.app/guides/gr4/en.pdf)).
- While the tool is on the card, GRKU does not load.
- Use a charged battery.
- Note the firmware version of your camera from the camera menu. You need it for the report.

## Get the tool

Download [GRKU-dump.zip](https://github.com/botnick/GRKU/releases/latest/download/GRKU-dump.zip). It is the same file as `GRKU-<version>-dump.zip` in the [latest release](https://github.com/botnick/GRKU/releases/latest).

The ZIP holds `SD_ROOT/SCRIPT/STARTUP.TTL`, `SD_ROOT/SCRIPT/GRDUMP/DUMP.SH`, `SD_ROOT/SCRIPT/GRDUMP/DUMP.BIN`, and a `README.txt`.

## Dump the firmware

1. Turn the camera off. Remove the card and put it in a computer.
2. If the card has a `SCRIPT` folder, copy it to your computer as a backup. If it has none, skip this step.
3. Unzip the tool. Copy the `SCRIPT` folder from inside `SD_ROOT` to the root of the card. If the computer asks, replace `SCRIPT/STARTUP.TTL`.
4. Eject the card safely. Insert it in the camera. Turn the camera on normally. Do not hold MENU.
5. Wait 2 minutes with the camera on. Then turn the camera off.
6. Put the card in the computer and open `SCRIPT/GRDUMP` on the card.

If the folder has `DUMP.OK`, the dump is complete. The folder also has `RTOS.BIN`, about 20 MB, and `INFO.TXT`.

If the folder has `DUMP.ERR`, the dump failed. `DUMP.ERR` holds the error code. Send the folder anyway.

If the folder has neither file, the camera did not run the tool. Make sure that SD scripts are on. Then do steps 4 to 6 again.

## Send the files

1. Zip the `SCRIPT/GRDUMP` folder.
2. Attach the ZIP to a [GitHub issue](https://github.com/botnick/GRKU/issues/new). Give the camera model and the firmware version.

If the developer asked for the dump in an issue, attach the ZIP to that issue. The ZIP is about 20 MB; GitHub accepts files up to 25 MB.

## Restore the card

1. Delete the `SCRIPT` folder from the card.
2. If you made a backup in step 2, copy the `SCRIPT` folder from your backup to the card.

With the backup back, GRKU loads again at the next startup. Without a backup, the card is as it was before: install GRKU from https://grku.app when it supports your firmware.
