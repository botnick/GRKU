# Roadmap of this fork

This fork of [ahonn/GRKit](https://github.com/ahonn/GRKit) keeps the one rule of GRKit that matters to us: **the camera's firmware is never flashed.** Everything loads from the SD card through the camera's SD script setting, which is turned on once (hold MENU at power-on with the activation files) and stays on until the disable package turns it off. The optional fast-boot firmware of upstream 1.5 is not part of our plan.

The goal is a GRKit that loads sooner, has every feature that [GRLife Pro](https://grlife.app/) and the GRKit community asked for, and ships a film library as wide as the open-source LUT world allows. This document is the plan. [docs/one-shot-start.md](one-shot-start.md) is the first delivered piece. [HANDOFF.md](../HANDOFF.md) says how to work on the repository.

## 1. Load time

| Step | State | Expected GRK in ADJ (GR III) |
| --- | --- | --- |
| Upstream 1.5.1, official firmware | shipped | 8 to 10 s |
| **Phase 1: one-shot start** (this branch) | code done, tests pass, **not yet run on a camera** | 7 to 8 s: one program load, one read of each file, four card writes |
| **Phase 2: start before the camera's mount** | designed in one-shot-start.md, needs `DIAG.TXT` numbers from a camera first | 5 to 6 s: Linux runs commands at 4.2 s, the camera mounts the card at 6 to 7 s |

Phase 2 is what gets the 4 to 5 s the user asked for. It is also the step that upstream withdrew in 1.3.3 for reliability, so it must be built with the measurements and the safety rules in one-shot-start.md, and tested on each camera model.

Measurement protocol, each time: three cold power-ons, `GRKIT/BOOT.TXT` lines `load`, `scan`, `install`, the time GRK shows in ADJ by stopwatch, then once with `GRKIT/DIAG` for `DIAG.TXT`. The first camera is a GR IV on firmware 1.11; ahonn's numbers above are from a GR III, and GR IV loads later still, so expect larger values there.

## 2. Feature gap against GRLife Pro 2.0

Everything in GRLife runs inside a patched firmware. Each row says how the same thing is done from the card. "Module" means a `.GRM` module of the existing module system (`docs/modules.md`), which needs no firmware knowledge. "Core hook" means a new extension point in `runtime/` at a firmware address, which needs reverse engineering of the RTOS image (`firmware/gr3-2.10/fwdc239b.bin` decoded, see HANDOFF.md, with REA and Ghidra).

| GRLife feature | GRKit today | Plan | How | Effort |
| --- | --- | --- | --- | --- |
| 64 films on 13 shelves (Kodak, Fuji, CineStill, Ilford, Agfa, Polaroid, Hasselblad, Pentax, Leica, Ricoh, Creative) | **104 looks** since 2026-11-08 (83 from Pat David and t3mujinpack, see `docs/lut-sources.md`); a package carries 40, `GRKit-film-library.zip` the rest | Next: the spektrafilm and Spectral Film LUT stocks that are still missing (Vision3 50D/200T, Portra 160/800 from measured data, Superia Reala, Velvia 50, cine stocks), Fotufilm's 47 profiles, and shelves on the site | `effects/`, `grkit effects import`, `web/src/catalog.ts` | medium, mostly curation |
| Hue-sector colour per film, custom `.cube` LUT | have (GRF hue feature, site import) | keep | | |
| Film for video and in-camera RAW development | RAW development: have (1.4/1.5). Video: no | video needs the video pipeline hook | core hook | hard |
| Grain fine / coarse / classic, Low / Med / High | 4 strengths, 4 sizes (camera's own grain) | add Pattern (moment-derived seed vs fixed seed) and Boost from the jakeds fork, as options of `modules/grain` | module | small |
| Soft glow (HDF diffusion) 4 levels | Bloom (have) | add a "Black Mist" veil and "Streak" (anamorphic flare) from the MustafaCisse fork into `modules/glow` | module (port) | small |
| Film softness Low / Med / High | no | a plane filter that low-passes luma slightly at the JPEG encode stage, like Glow's filter but a blur | module `softness` | small |
| CineStill halation | have, with colour choice | keep | | |
| Light leak Off / Glow / First roll | no | a plane filter that adds a warm gradient at one edge, strength and side as settings, seeded per shot | module `leak` | small |
| Imprint: 5 date formats, 12 caption presets + 3 custom (24 chars), film name line, 7-segment or 5x7 dot matrix, 4 colours, glow, 4 positions, 4 sizes | Classic / GR1s / GR II styles, Upright position, lit stamp | extend `modules/date`: formats, colours (orange, white, sepia, LED yellow), sizes, positions (BR, BL, TR, split), film name line (the effect name is in the core header), caption presets; custom captions come from `GRKIT/CAPTION.TXT` on the card (the camera has no text entry) | module | medium |
| Aspect ratios 7:6, 5:4, 4:3, 16:9, 65:24 | have, plus 2.35:1 | keep | | |
| Half frame: two portrait frames in one 3:2 photo | no | first step: "Half Frame 3:4" live-view framing from the MustafaCisse Crop Zoom module (one upright frame, cropped); the real diptych needs the previous shot kept between two shots, which does not fit the script arrays, so it waits | module (port), then core | small, then hard |
| Golden grid and four golden spirals | golden ratio grid | add the four spirals to `modules/guides` | module | small |
| Rail / slider level (two tracks) | no | needs the level sensor reading: find the firmware's level value and draw it in a layer | core hook + module | medium RE |
| Nine ADJ settings with Grid Style in ADJ | GRK is the sixth ADJ entry with the module pages inside it | find the ADJ list table and its limit of five | core hook | medium RE |
| Rear dial sets ISO, AUTO below the lowest | no | find the dial event handler in ISO priority | core hook | medium RE |
| HDR photo with Ultra HDR gain map | no | out of scope for now (the JPEG writer would have to emit a gain map) | | hard |
| Shutdown screens BYE1 to BYE9, last frame, camera frame | no | find where the firmware draws the power-off image and feed a JPEG from the card; needs the decoder entry point | core hook | medium RE, high value |
| 48 community recipes, JSON import, estimate from `.cube` | upstream has an unmerged `feat/recipes` branch (5 commits, 116 files); the kkasemsa fork has a small Recipe module; the iceboerg00 fork has 80 ricohcookbook recipes as JSON and the UserData catalogue | rebase upstream `feat/recipes` first (it is the maintainer's own design: one ADJ list, Undo, MENU management); import the 80 recipes with attribution | core + site | medium (port) |
| GRLife Pro shortcut (OK on the shooting screen) | ADJ sixth entry | keep; an OK hook is possible later | | |
| Languages: English, Simplified and Traditional Chinese | English, zh-Hans, zh-Hant, ja, ko | **add Thai** to `menu_text.rs`, the guides, and the site | text | small |
| Clear GRLife data | delete `GRKIT/` on the card | document | | |

## 3. What the community asked for (issues and forks)

From the survey of all 26 forks and 23 issues on 2026-11-08 (details in [docs/community-survey.md](community-survey.md)):

| Ask | Where | Plan |
| --- | --- | --- |
| Recipes / native Image Control presets with WB shift | #27, kkasemsa and iceboerg00 forks, upstream `feat/recipes` | section 2, recipes row |
| Remember GRKit settings per U1 / U2 / U3 | #19, four people | a core hook on the mode dial change plus three state files; medium |
| Custom icons and film box end-flap icon set | #38 | **Done in the compiler** (`icon: {"png": ...}`, `scripts/flap-icons.py` draws the flaps in color for every look); the site's upload control is still to do |
| Border on JPEGs (3 % and 6 %) | #18 | module `border`: a plane filter that paints the edge; small |
| Crop Zoom 35 / 40 / 50 mm | MustafaCisse `feat/crop-zoom-module` (camera-tested on GR III) | port as an official module; small |
| Onion Skin (ghost of the last shot), Palette Card | kkasemsa `feature/film-packs-recipes` | port after a camera check of live-view smoothness; medium |
| Browser effect editor, JSON upload | #62, #68 | site; medium |
| GR World import fails with GRKit on the card | #63, open | reproduce on GR IV with `SCRIPT` present and absent; unknown cause |
| Error 37 on the fast-boot firmware | #70, open | not our path (no firmware flashing), but the one-shot start changes the plan flow: re-test the fast-boot package anyway |

## 4. Film library

The rule stays the upstream rule: an effect ships only if its source license permits redistribution of derived data (CC BY-SA 4.0 and MIT so far). The survey of open-source film LUT sources is in [docs/lut-sources.md](lut-sources.md) with each license. Import with `grkit effects import` (see `effects/README.md`), keep the attribution in `effects/NOTICE.md`, and group the site by shelf.

State on 2026-11-09: 134 effects (upstream 21, Pat David and t3mujinpack 83, spektrafilm and Spectral Film LUT 18, Fotufilm 15, GRKit's own Positive GRII), every one with a film box icon in the colors of the real box. The 40 of the release packages are `effects/defaults.txt`, chosen from the popularity research in [docs/popular-films-2026.md](popular-films-2026.md); the other 93 ship in `GRKit-film-library.zip`.

## 5. Order of work

1. **Measure.** Run the one-shot start on a GR III or GR IIIx: `BOOT.TXT` and `DIAG.TXT`. Fix what the camera says. Then decide Phase 2 from the numbers.
2. **Quick modules** (no firmware knowledge): Imprint extension, Light leak, Softness, Golden spirals, Border, Grain pattern, Black Mist and Streak, Crop Zoom port, Thai menu text.
3. **Recipes**: rebase upstream `feat/recipes`, add the 80 recipes.
4. **Phase 2 load time** if the numbers allow.
5. **Reverse-engineering items** with REA and Ghidra on the decoded RTOS: shutdown screen, level, ADJ slots, rear dial ISO, per-U memory.
6. **Library and site**: imports, shelves, icons, JSON upload, editor.
