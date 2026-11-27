# GRKU.

**GR ของคุณ ในแบบที่ชอบ** — film looks for the RICOH GR III, GR IIIx and GR IV, from the SD card. Nothing is flashed: the camera runs a script from the card, and without the card it is the camera Ricoh shipped.

[ไทย](README.th.md) | English | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

[![Tests](https://github.com/botnick/GRKU/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKU/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![grku.app](https://img.shields.io/badge/site-grku.app-d94135)](https://grku.app)

GRKU is its own project, made by [BOTNICK](https://github.com/botnick) for GR owners in Thailand first and everyone else next: a film library of 152 looks with real film-box icons, recipes, more modules, a one-shot start, a site that writes the card and sells extra looks, a Thai voice, and its own release pipeline. The user manual is at [grku.app/docs](https://grku.app/docs/).

<p>
  <img src="resources/images/grku-root.jpg" alt="The GRKU page in the ADJ menu" width="49%">
  <img src="resources/images/grku-menu.jpg" alt="The GRKU section in the Customize tab of MENU" width="49%">
</p>

Photo in the screens: [Mobnoboka](https://commons.wikimedia.org/wiki/File:Oguchi_Joushi_Kouen_1.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## What it does

Press the ADJ lever while shooting and pick the sixth entry, GRKU. Everything GRKU does is in there, and in the GRKU section of MENU. ADJ opens on GRKU again, on the row you left, also after you turn the camera off.

- **Film Look**: 152 looks of real films, 40 on the card at a time. Kodak, Fujifilm, Ilford, CineStill, Lomography, Polaroid, Agfa, Harman and Rollei, plus GR II Positive (GRKU), GRKU's own look after the Positive Film of the GR II, and the ten film simulations of the FUJIFILM cameras, from Provia and Classic Chrome to Acros, which are free. Each look has a film-box icon in the colors of the real box. Fn adjusts a look; import your own LUT on the site.
- **Recipes**: save the whole look of the camera under a name, or bring popular recipes from the site, then switch Film Look or Image Control, grain, glow, white balance, corrections and exposure in one step, with Undo.
- **Framing**: XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6, 1:1, or 3:4, as a crop of the JPEG or as frame lines only. **Crop**: 35, 40, 50 or 70 mm (50 to 100 mm on GR IIIx), shown in the live view.
- **Guides**: thirds, center, golden ratio, diagonals, golden spiral, dynamic symmetry.
- **Date Imprint**: the date on the photo in the classic, GR1s dot-matrix or GR II style.
- **Glow**: Bloom around lights and highlights, Halation as a red-orange halo in the colors of motion-picture film.
- **Light Leak**: vignette, dust and hairs, a light leak, scratches, or the presets Faded, Dusty, Leaky and Expired. Different on every shot.
- **Diffusion**: a Black Pro-Mist filter at 1/8, 1/4 or 1/2, a Black Mist veil over the shadows, and the anamorphic streak of point lights; and, on its own, Film Softness (Low, Medium, High), the gentle softness of a film scan.
- **Grain**: four strengths, four sizes, as the camera draws it or Film-like: the grain of a color negative on paper, after the grain model of [spektrafilm](https://github.com/andreavolpato/spektrafilm) by Andrea Volpato (by piratenpanda).
- **Border**: a Thin, Wide, or Instant white or black border around the whole photo: the JPEG grows by the border and the photo keeps every pixel.
- **Enable at Start**: GRKU on, off, or as you left it, at every power-on.
- **Distance Unit**: the Snap focus distances and the manual focus scale in meters or in feet, in MENU under GRKU Settings.

GRKU shows up about nine seconds after power-on (longer on the first start after an install). Until then the camera is itself. Everything you set is kept in the `GRKU` folder of the card.

## Cameras

| Camera | Ran on a camera | Built for |
| --- | --- | --- |
| GR III, GR III HDF | — | 2.10, 2.20, 2.21 |
| GR IIIx, GR IIIx HDF | — | 1.60, 1.70, 1.71 |
| GR IV, GR IV HDF | 1.11 | 1.11, 1.20, 1.21 |
| GR IV Monochrome | — | 1.00, 1.10, 1.11 |

GRKU's own changes have run on a GR IV with firmware 1.11. The GR III and GR IIIx packages are built from the same code and tests, but nobody has run GRKU on those cameras yet. If you do, tell us in an [issue](https://github.com/botnick/GRKU/issues), whether it worked or not. The builds for the firmware that Ricoh released on 10 November 2026 (GR III 2.21, GR IIIx 1.71, GR IV 1.21, GR IV Monochrome 1.11) are checked against Ricoh's firmware files; they have not run on a camera yet.

> [!WARNING]
> GRKU is experimental. Use it at your own risk.
> Installing it turns on the camera's SD script setting, which stays on until you turn it off. If GRKU fails, the camera can hang at startup. Read the [recovery guide](resources/RECOVERY.md) first.

## Install

Go to [grku.app](https://grku.app), pick your camera, your modules and your film looks, then either

- **write the SD card** from Chrome or Edge (the site also updates, adds and removes looks, and uninstalls), or
- **download the ZIP** (`GRKU-gr3.zip`, `GRKU-gr3x.zip` or `GRKU-gr4.zip`) and follow the PDF guide inside it ([GR III and GR IIIx](resources/INSTALLATION.md), [GR IV](resources/INSTALLATION-GR4.md)).

The first time only, hold MENU while you turn the camera on. To update from a ZIP, replace the `SCRIPT` folder on the card; your settings stay in `GRKU`. Formatting the card removes GRKU.

Coming from an older card with a `GRKIT` folder: the site moves your settings and looks from it to `GRKU`. If you copy files by hand instead, rename `GRKIT` to `GRKU` at the card root before the first start, or delete it.

If GRKU does not show up, send `GRKU/REPORT.TXT`, `GRKU/BOOT.TXT` and `SCRIPT/GRKU/INSTALL.ERR` (if it exists) in an [issue](https://github.com/botnick/GRKU/issues/new). [What each line means](docs/diagnostics.md).

## GRKU Plus

The free site writes any 10 looks to the card. GRKU Plus is a one-time payment by PromptPay that unlocks 25 slots, a brand pack, or everything (40 slots and every look). The key arrives by email and works on every device. The service runs in `services/plus`; it never sees your card.

## Build from source

You need Rust 1.92 or later, Clang and LLD with ARM support, and the official Ricoh firmware file, which this repository does not include.

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

`build/effects` holds all 152 looks; a package carries at most 40, so `python3 -I scripts/defaults.py build/effects build/effects-default` picks the 40 of `effects/defaults.txt`. A package holds ten modules, so leave one out (the release leaves out Border). For the GR III, build `gr3-2.10` and `gr3-2.21`, each from the `fwdc239b.bin` of its firmware, and package with `--camera gr3` and a `--build` for each; the GR IV package takes `gr4-1.11`, `gr4-1.20` and `gr4-1.21`. Then `python3 -I scripts/card.py write dist/GRKU-gr4.zip` puts the package on a card in a reader.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Reports from a camera are the most useful thing you can send, especially from a GR III or GR IIIx. Problems, ideas and questions go to the [issues](https://github.com/botnick/GRKU/issues).

## Documentation

- [Architecture](docs/architecture.md) and the [one-shot start](docs/one-shot-start.md)
- [Writing a module](docs/modules.md) and the [module reference](docs/module-reference.md)
- [Device reports](docs/diagnostics.md): `BOOT.TXT`, `REPORT.TXT` and `INSTALL.ERR` line by line
- [Effects](effects/README.md), the [LUT sources](docs/lut-sources.md) and the [popular films of 2026](docs/popular-films-2026.md)
- [The site](web/README.md), the [brand](docs/brand.md) and the [product notes](docs/PRODUCT.md)
- [Roadmap](docs/roadmap.md), the [community survey](docs/community-survey.md) and the [handoff notes](HANDOFF.md)
- [Releasing](docs/releasing.md), and the [user manual](https://grku.app/docs/) on grku.app

## License

The code is under the [MIT License](LICENSE). GRKU includes code from [GRKit](https://github.com/ahonn/GRKit) by ahonn, also MIT, and keeps its notices. Each package includes `LICENSES.md` with the licenses of its files.

- The effects are under CC BY-SA 4.0, MIT or Apache-2.0. See [effects/NOTICE.md](effects/NOTICE.md).
- The menu and live view text uses [Roboto Condensed](https://github.com/googlefonts/roboto-classic) under the [SIL Open Font License 1.1](crates/grku-core/assets/RobotoCondensed-LICENSE.txt).
- The effect fitting is ported from [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods) under the [MIT License](crates/grku-core/GR3_FILM_MODS_LICENSE.txt).

RICOH and GR are trademarks of Ricoh Company, Ltd. Film names are trademarks of their owners. GRKU is an independent project by [BOTNICK](https://github.com/botnick) and is not affiliated with Ricoh or with any film manufacturer.
