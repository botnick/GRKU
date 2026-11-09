# Roadmap

GRKU is developed from [GRKit](https://github.com/ahonn/GRKit) and keeps its one hard rule: **the camera's firmware is never flashed.** Everything loads from the SD card through the camera's own script setting. This page says what GRKU has done since it started from GRKit 1.5.2 and what comes next. The history of each release is in [CHANGELOG.md](../CHANGELOG.md).

## Done

| Date | What | Where |
| --- | --- | --- |
| 2026-11-08 | Film library grown from 21 to 104, then 135 looks, with the 2026 popularity research choosing the 40 of a package | `effects/`, [popular-films-2026.md](popular-films-2026.md), [lut-sources.md](lut-sources.md) |
| 2026-11-08 | Film-box icons in the colors of the real boxes, color menu tiles, effects with their own PNG icon | `scripts/flap-icons.py`, the effect compiler |
| 2026-11-08 | Modules: Crop, Light Leak, Diffusion, Border, feet labels, Golden Spiral and Dynamic Symmetry | `modules/` |
| 2026-11-09 | One-shot start: one request to the camera at power-on, measured on a GR IV | [one-shot-start.md](one-shot-start.md) |
| 2026-11-09 | Renamed to GRKU everywhere; the card folder is `GRKU`, the computer moves an old `GRKIT` folder | [HANDOFF.md](../HANDOFF.md) |
| 2026-11-09 | GRKit's `feat/recipes` merged: Recipes, Mode Dial U1 to U3, Enable at Start; 22 popular recipes from ricohcookbook.com; a three-step editor and a camera-style settings sheet on the site | `modules/recipes`, `web/src/components/Recipe*.tsx` |
| 2026-11-09 | The site rebuilt as a dark one-page installer on shadcn/ui, Thai first, six languages, live previews on six sample photos | `web/` |
| 2026-11-09 | GRKU Plus: PromptPay, slip verification, keys by email from noreply@grku.app | `services/plus` |
| 2026-11-10 | Everything through git: the release pipeline, Cloudflare Pages for grku.app, the Plus deploy workflow, search and link previews, icons | [releasing.md](releasing.md) |

## Next

In order of value for the people who use GRKU.

1. **Camera reports from the GR III and GR IIIx.** The packages are built and tested on the host, but GRKU's changes have run only on a GR IV 1.11. The first reports decide whether anything needs a camera-specific fix.
2. **A Thai installation guide.** The PDF guides exist in English, Chinese, Japanese and Korean; the Thai one is the next translation through the Gemini tools.
3. **Recipes on the camera.** Rename and delete in MENU work; next are the recipe list in ADJ with the look's icon, and sharing a recipe as a link from the site.
4. **The start before the camera mounts the card** (phase 2 of [one-shot-start.md](one-shot-start.md)): 5 to 6 seconds instead of 9, built only with the `DIAG.TXT` numbers from cameras and the safety rules written there.
5. **Site: film shelves and search by mood**, an effect editor in the browser, and the Plus library synced across devices by key.
6. **Ideas from GRLife and the community**, kept from the [community survey](community-survey.md): Imprint captions and sizes, a level, more ADJ slots, the rear dial for ISO, shutdown screens. Each needs reverse engineering of the firmware tables and a camera test.
7. **Upstream.** Fixes that apply to GRKit go back as pull requests; GRKit's next releases are reviewed for anything worth merging (its 1.5.3 fast-boot speedups are not, except the idea of a resident loader file).

## Not planned

- A fast-boot or patched firmware of any kind.
- A Thai camera menu: the camera has no Thai font, and Thai users read the camera in English.
- An account system for the site: a key by email is enough.
