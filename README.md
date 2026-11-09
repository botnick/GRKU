# GRKU · BOTNICK edition

GRKU by **BOTNICK**, a fork of [GRKit](https://github.com/ahonn/GRKit) by ahonn: a 135-film library with realistic film-box icons, the Positive GRII look, color menu tiles, the Border, Light Leak, and Diffusion modules, snap focus distances in feet, the one-shot start that loads sooner, and no fast-boot firmware. GRKU stays a script on the SD card: format the card and the camera is back to stock.

English | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [ไทย](README.th.md)

[![Tests](https://github.com/botnick/GRKit/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

GRKU adds film looks, XPan and other crops, date stamps, glow, light leaks, diffusion, grain, and borders to RICOH GR III, GR IIIx, and GR IV. It runs from the SD card and never writes to the firmware. Take the card out and the camera is back to stock.

<p>
  <img src="resources/images/grkit-root.jpg" alt="The GRKU page in the ADJ menu" width="49%">
  <img src="resources/images/grkit-menu.jpg" alt="The GRKU section in the Customize tab of MENU" width="49%">
</p>

Photo: [MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).

## Features

Press the ADJ lever while shooting and pick the sixth item, GRKU.

- **Film Look**: 135 looks, 40 of them in the package and the rest in the film library: Kodak, Fujifilm, Ilford, CineStill, Lomography, Polaroid, Agfa, Harman, the Positive GRII look after the GR II, and more, each with a live preview and its own film-box icon. You can also import your own `.cube` LUT or Lightroom preset on [grku.app](https://grku.app). Each look is fitted from an open-source film LUT, so it comes close to the original but isn't identical ([sources](effects/NOTICE.md)).
- **Framing**: XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6, and 1:1. Crop JPEG photos or mark composition only, with a mask or frame lines. Selecting a ratio sets the camera to 3:2 in either mode. Off keeps the camera's current aspect ratio.

  RAW files keep the native 3:2 default crop and the camera's digital crop setting. Embedded previews can still show the selected composition.

- **Guides**: thirds, center, golden ratio, diagonals, the golden spiral, or dynamic symmetry.
- **Date Imprint**: the date on the photo in classic, GR1s dot-matrix, or GR II style.
- **Glow**: Bloom softly spreads light around lights and highlights. Halation adds a red-orange halo around bright lights to simulate motion-picture film. Each effect has its own Enable and Strength settings, so both can run together.
- **Light Leak**: film artefacts on photos: a vignette, dust and hairs, a light leak, and scratches, each Off, Light, Medium, or Strong, or the Faded, Dusty, Leaky, and Expired presets. They fall differently on every shot.
- **Diffusion**: the glow of a Black Pro-Mist diffusion filter at 1/8, 1/4, or 1/2. Black Mist adds the veil of the filter over the shadows, and Streak adds the blue or amber horizontal flare of an anamorphic lens from point lights. JPEG photos only.
- **Grain**: film grain in four strengths and four sizes (Auto, Small, Medium, Large).
- **Border**: a white or black print border over the photo, 3% or 6% of its width.
- **Feet**: with a file `GRKU/FEET.TXT` on the card, the Snap Focus Distance setting reads 1', 3', 5', 7', 8', and 16' instead of meters.

GRKU takes about 9 seconds to load after power-on, and longer on the first start after an install or update. Until then, the camera uses its own settings. All the settings are in the GRKU section at the end of the Customize tab in MENU. To write your own module, see [Writing a module](docs/modules.md).

GRKU has no fast-boot firmware and never will: the camera's own firmware stays as Ricoh shipped it, GRKU is only a script on the card, and a format removes it. The [one-shot start](docs/one-shot-start.md) of this fork is what makes it load sooner than GRKit on the official firmware.

## Supported cameras

| Camera | Tested on a camera | Supported |
| --- | --- | --- |
| GR III, GR III HDF | 2.10, 2.20 | — |
| GR IIIx, GR IIIx HDF | 1.60, 1.70 | — |
| GR IV, GR IV HDF | 1.11, 1.20 | — |
| GR IV Monochrome | 1.00 | 1.10 |

The table is GRKit's. The changes of this fork have run on a GR IV with firmware 1.11; the GR III and GR IIIx packages are built from the same code but have not been run on those cameras yet, and the newest modules (Light Leak, Diffusion, Border) and the feet labels are still waiting for their first camera test. GR IV Monochrome has no Film Look. Other models and firmware versions aren't supported. If GRKU doesn't load on a supported camera, see the [firmware dump guide](resources/DUMP.md).

> [!WARNING]
> GRKU is experimental. Use it at your own risk.
> Installing it turns on the camera's SD script setting, which stays on until you turn it off. If GRKU fails, the camera can hang at startup, so read the [recovery guide](resources/RECOVERY.md) first.

## Install

Pick your camera, modules, and effects on [grku.app](https://grku.app), the site of this fork, then either:

- **Write to the SD card** from Chrome or Edge on a computer. The site can also update or uninstall GRKU and add or remove modules and effects.
- **Download the ZIP** (`GRKU-gr3.zip`, `GRKU-gr3x.zip`, or `GRKU-gr4.zip`) and follow the PDF guide inside it ([GR III and GR IIIx](resources/INSTALLATION.md), [GR IV](resources/INSTALLATION-GR4.md)).

Or build the package from this repository (below) and write it to a card in a reader with `python3 -I scripts/card.py write dist/GRKU-gr4.zip`; the same script turns the feet labels on and off (`feet on`, `feet off`) and shows the state of a card (`status`).

The first time only, hold MENU while you turn the camera on. To update from a ZIP, replace the `SCRIPT` folder on the card. Your settings stay in `GRKU`. Formatting the card removes GRKU, so copy `GRKU` to a computer first.

If GRKU doesn't show up, send `GRKU/REPORT.TXT`, `GRKU/BOOT.TXT`, and `SCRIPT/GRKU/INSTALL.ERR` (if it exists) in an [issue](https://github.com/botnick/GRKit/issues/new). [What each line of those files means](docs/diagnostics.md).

## Build from source

You need Rust 1.92 or later, Clang and LLD with ARM support, and the official Ricoh firmware file, which this repository doesn't include.

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

`build/effects` holds all 135 looks; a package carries at most 40, so `python3 -I scripts/defaults.py build/effects build/effects-default` picks the 40 of `effects/defaults.txt` for the `--effects` argument. For the GR IV, build `gr4-1.11` and `gr4-1.20` and package both with `--camera gr4`. For other cameras, fewer modules, or other guide languages, see [Build packages](CONTRIBUTING.md#build-packages) and [HANDOFF.md](HANDOFF.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Device reports are welcome whether GRKU worked or not, especially from the GR III and GR IIIx, which this fork has not been run on yet. Send problems, ideas, and questions as [issues](https://github.com/botnick/GRKit/issues). Changes that are useful to GRKit itself go upstream as pull requests.

## Documentation

- [Architecture](docs/architecture.md)
- [Writing a module](docs/modules.md) and the [module reference](docs/module-reference.md)
- [The three files of a device report](docs/diagnostics.md): `BOOT.TXT`, `REPORT.TXT`, and `INSTALL.ERR`, line by line
- [One-shot start](docs/one-shot-start.md): how GRKU loads sooner on the official firmware
- [Effects](effects/README.md) and the [popular films of 2026](docs/popular-films-2026.md) behind the default 40
- [Web site](web/README.md) and the [brand sheet](docs/brand.md)
- [Roadmap](docs/roadmap.md) and [Handoff](HANDOFF.md) of this fork
- From GRKit: the [fast-boot firmware](docs/fastboot.md), which GRKU does not use, and the [release process](docs/releasing.md)

## License

The code is under the [MIT License](LICENSE). GRKU builds on [GRKit](https://github.com/ahonn/GRKit) by ahonn, also MIT, and keeps its notices. Each package includes `LICENSES.md` with the licenses of its files.

- The effects are under CC BY-SA 4.0, MIT, or Apache-2.0. See [effects/NOTICE.md](effects/NOTICE.md).
- The menu and live view text uses [Roboto Condensed](https://github.com/googlefonts/roboto-classic) under the [SIL Open Font License 1.1](crates/grkit-core/assets/RobotoCondensed-LICENSE.txt).
- The effect fitting is ported from [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) under the [MIT License](crates/grkit-core/GR3_FILM_MODS_LICENSE.txt).

RICOH and GR are trademarks of Ricoh Company, Ltd. Film names are trademarks of their respective owners. GRKU is an independent project and is not affiliated with Ricoh, GRKit's author, or any film manufacturer.
