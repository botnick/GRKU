# Community survey: forks, issues, and pull requests of ahonn/GRKit

Surveyed 2026-11-08 for GRKU, when it started from GRKit 1.5.1. Fork owners and issue numbers are kept for traceability.

Snapshot: 2026-11-08. Upstream `main` = 920c1d9 (v1.5.1, 2026-11-07), 260 commits, 192 stars, 26 forks, 23 issues (8 open), 47 PRs. Local clone `/Users/botnick/Desktop/GRKU`: `origin/main` (botnick) is identical to `upstream/main`. Nothing was modified; only `git fetch upstream` was run.

Two things to know before reading the fork table:

- **Upstream history is squash/rebase-heavy.** Many forks show `ahead_by > 0` only because they hold pre-squash snapshots of ahonn's own feature branches (`feat/recipes`, `feat/cinema-looks`, `feat/glow`, `feat/gr3-custom-mapping`, `feat/card-data-folder`, old `main`). Those commits are authored by ahonn and are not fork work; I list them separately.
- **Upstream itself has two unmerged maintainer branches** that overlap the most-requested features: `feat/recipes` (5 commits, 2026-11-05/06, 116 files, +12,723 lines; changeset: "Recipes save a look on the camera, or bring recipes from the site, and switch Film Look or Image Control, grain, glow, white balance, and the correction and exposure settings in one step in ADJ, with Undo; MENU lists, applies, renames, and deletes them") and `feat/gr3-custom-mapping` (3 commits, 10-28..11-02, 55 files: map a GR IV custom Image Control block to a GR III Custom set; modules name the cameras they are for; read/write GR III Custom sets over Bluetooth). Older 10-30 versions of `feat/recipes` and `feat/cinema-looks` survive only in the jmsn / wonhao80016 forks.

---

## 1. Forks with unique (fork-authored) work

| Fork / branch | Commits (fork-authored) | Behind main | What it adds | Class | State vs upstream | Mergeability |
|---|---|---|---|---|---|---|
| **MustafaCisse** `feat/crop-zoom-module` | 1 (e5ead20c2b, 11-05) | 63 | `modules/crop-zoom` (`CROPZOOM.GRM`): 35/40/50 mm field of view from the 28 mm lens, resampled to full JPEG size with separable Catmull-Rom; DNG keeps full sensor; live-view frame (Dark/Black/Frame Lines); "Half Frame 3:4" keeps CORE.ASPECT 4:3 for upright portrait half-frames. Tested on GR III 2.10 / GRKit 1.3.4. +738/-0, 15 files, all new under `modules/crop-zoom/` + one changeset. | new feature | not in upstream, no issue/PR filed | small, clean, self-contained; module ABI drifted since 1.3.4 (needs rebuild) |
| **MustafaCisse** `feat/hdf-glow-module` | 3 (a4b8d1ca2e, efa954bda8, 64e0ae4ed4) | 63 | HDF Glow module (`HDF.GRM`): Black Pro-Mist style highlight diffusion 1/8, 1/4, 1/2 + CineStill halation ring; **64e0ae4ed4 adds Black Mist (Off/Light/Heavy shadow veil) and Streak (Off/Blue/Amber anamorphic horizontal flare)**; Windows `\\?\` verbatim-path fix for Clang. Tested GR III 2.10 / 1.3.4. | new feature + build fix | PR #53 closed (upstream has its own Glow); Windows fix landed as 4d57c9b with MustafaCisse co-author. Black Mist / Streak are **not** in upstream Glow. | module dir clean; Black Mist/Streak would need porting into `modules/glow` |
| **kkasemsa** `feature/film-packs-recipes` | 15 (author "Claude", all 10-30) | 87 | (a) `effect_find` core service + module ABI 2.1 (7392d8d9e7); (b) **Recipe module** `extras/recipe` + `extras/recipe-b`: recipe = film look (by effect ID) + grain strength + grain size + optional aspect, chosen from one ADJ menu, viewfinder shows name with `*`/`?` (8055e9c14c, 64c75db705); per-family recipe TOML with GR IV-tested grain (694dd27f47); (c) **Onion Skin** overlay module `extras/onion`: Last Shot / Hold Reference ghost over live view, Faint/Strong/Edges (4ba830b2c6; pose guides later removed b4b2d60555); (d) **Palette Card** `extras/palette`: dominant-colour swatches (median cut + k-means) painted on the photo edge, 3/5/7 colours, optional hex (a3bd892106); (e) Fujicolor C200, UltraMax 400, Provia 100F effects from spektrafilm LUTs (dc07d315dc, 64c75db705) — removes aerocolor-iv; (f) `extras/look-workshop` DNG render scripts (53b0df908c) | new features (several), effects, tooling | C200/UltraMax/Provia shipped upstream in 1.4.0 (204b3bc, no co-author credit). Recipe/Onion/Palette/effect_find **not** upstream. Onion & Palette not camera-verified. | medium: `extras/` modules are self-contained but need the ABI 2.1 `effect_find` change in `crates/grku-core`/`grm.rs`; ~5k lines total |
| **iceboerg00** `grade` | 7 (10-24) | 144 | Pre-modules-era (1.2.x `runtime/plugins`) **Recipes plugin**: GRK page lists recipes from `SCRIPT/PLUGINS/RECIPES/NAMES.TXT`; the resident loader script sends `UserData Set <name> <value>` engineering shell commands line by line from `Rnnn.TXT` (sets Custom 1 look + all params + slot name + WB mode/temp/shift + highlight/shadow/peripheral/NR), highlight-to-preview, OK keeps; 80-recipe pack generated from ricohcookbook.com (`grade/recipes/ricohcookbook-80.json`, generator); `grade/data/werte-custom1.txt` = UserData setting names/values from GR IV 1.11; Windows verbatim-path fix; GR IV 1.11-only packaging. Tested on GR IV 1.11. | new feature + data | Issue #27; maintainer: "I'll use your `grade` branch as a reference and credit you as a co-author". Upstream `feat/recipes` (b694f20 "read the UserData settings of a firmware") appears to adopt the mechanism; unmerged. | old architecture, not mergeable as code; the recipe pack + setting catalogue are reusable data (recipes "belong to their authors") |
| **jakeds** `jake/gr3x-seeded-grain` = `jake/soft16-upstream-menu` | 8 (10-22..10-30) | 76 | "Soft — Ricoh GR" distribution: Grain **Boost** and **Pattern** (moment-derived seed vs fixed seed) submenus for GR III/IIIx (9dbc2b50ec), black lift / roll-off / warm split toning calibration (35ad767987), seven-colour edits, own bloom/halation, small mono date stamps, FP100C crop, re-adds the effects upstream dropped in 1.2.1 (portra-160, exr-200t-2383, fp-100c, vision3-500t-2393), separate builder site, Soft.15 state migration. Merge commit 6d800e3935 touches 300 files (+67,558/-21,058). | experimental / divergent distribution | Upstream credited Jake as co-author on bdfa032 "feat(grain): add an Extra Strong level" (1.3.2). Seeded/fixed grain pattern not upstream. | sprawling; not mergeable; only the fixed-seed grain idea is salvageable |
| **seungwook-jung** `halation-module` | 1 (4ab9521a18, 10-30) | 80 | `modules/halation`: CineStill-style red-orange glow around clipped lights, 3 strengths, frame-stage plane filter; registered as official module. Not camera-tested. +612/-8. | new feature | superseded by upstream Glow (PR #51, 1.4.0: Bloom + Halation with colour choice) | clean, but obsolete |
| **alexanderclin** `diffusion-plugin` | 3 (10-21/22) | 192 | Diffusion plugin (highlight glow Weak/Medium/Strong at JPEG encode) 7917c19a59; web builder upload of custom `.cube` LUTs fitted in-browser with Delta-E score 673bbfad99; `tools/cinema/convert_cinema.py` turning extracted GR IV Cinema looks into effects 09658376ba | new features | all three superseded: LUT import PR #10 (10-22), Glow PR #51, Cinema looks PR #55 | pre-modules runtime; obsolete |
| **jeffreychuuu** `feat/web-browser-backup` | 1 (3116a6758c, 11-05) | 32 | Web "Backup" section: export/import IndexedDB imported LUTs + localStorage settings as `grku-backup/1` JSON; +469 lines in `web/src` | new feature (web) | PR #60 closed; maintainer shipped alternative 2e411f2 "restore imports and settings from a GRKU.zip" (Import GRKU.zip keeps all LUTs, >40 too) | clean but superseded |
| **qubmen** `feat/grku-switch` | 1 (6954d660ea) | 76 | "Enable GRKU" master switch | feature | **merged** as PR #46 → 55b2400 (1.3.5); ahead only because of squash | nothing left |

### Forks with no fork-authored changes
- Only upstream snapshots: **botnick** (your clone: main identical; carries upstream branches), **wonhao80016** (snapshots of feat/glow pre-squash 4 commits, feat/viewfinder-indicators, feat/cinema-looks, feat/recipes 10-30 version, feat/gr3-custom-mapping, pre-rewrite main), **jmsn** (feat/cinema-looks 10-30 version incl. "unlock Cinema Yellow/Green with the user's GR IV firmware" + "adjust the Toning of Cinema on the Fn page"; feat/recipes 10-30 version), **fsgreco** (feat/cinema-looks 10-29 snapshot; PR #42 merged), **iceboerg00**'s `feat/card-data-folder`/`feat/v2-modules` (= ahonn's closed PR #24), **lucasfnicolau** (bot release commit only), **AzaelCC** (PR #13 merged, branches behind).
- Plain behind, main only: okezieuc, nunoo, ductn90, ciqdj, sungikim, raulra08, ThomasLee94, meetbhalodi11, xiaodouzi-2023, a770244764, ayajiboye.
- **VannessChen**: listed by the forks API (created 10-20, pushed 11-06) but `repos/VannessChen/GRKit` returns 404 (deleted, private, or renamed) — not inspectable.

---

## 2. Fork commits worth cherry-picking / porting

All are 63–192 commits behind and most predate module ABI changes (1.3.2 note: "a module built for an earlier GRKU must be built again"), so these are porting candidates, not clean cherry-picks. Also note the maintainer's stated policy in PR #53: "`modules/` stays for modules we maintain and ship."

| SHA (repo) | Reason |
|---|---|
| `e5ead20c2b` (MustafaCisse) | Crop Zoom 35/40/50 mm + Half Frame 3:4 — complete, camera-tested, self-contained module; nothing like it upstream. |
| `64e0ae4ed4` on `efa954bda8` (MustafaCisse) | Black Mist veil and anamorphic Streak — the only Glow sub-effects not in upstream's Bloom/Halation. |
| `8055e9c14c` + `7392d8d9e7` (+ `64c75db705`) (kkasemsa) | Lightweight Recipe module (film look + grain + aspect) and the `effect_find`-by-ID service it needs — a simpler model than upstream's unmerged `feat/recipes`. |
| `4ba830b2c6` + `b4b2d60555` (kkasemsa) | Onion Skin overlay (Last Shot / Hold Reference) — novel; needs camera verification of live-view smoothness. |
| `a3bd892106` (kkasemsa) | Palette Card swatches on the JPEG — novel; needs camera timing check. |
| `53b0df908c` (kkasemsa) | Look-workshop DNG render scripts (dev tooling, no runtime impact). |
| `db2612dcb1` + `e36dc4b355` (iceboerg00) | 80 ricohcookbook recipes as JSON + generator, and `grade/data/werte-custom1.txt` UserData name catalogue — data for whichever recipes implementation lands (author attribution required). |
| `b1e264090a`..`2f9991a3f3` (iceboerg00) | Reference implementation of UserData-via-loader-script recipes (preview, undo, EOF quirk, `goto` quirk) — read for the mechanism, not for code. |
| `9dbc2b50ec` (jakeds) | Grain Boost + fixed-seed Pattern — concept only; branch is unportable. |
| Skip | `3116a6758c` (jeffreychuuu), `4ab9521a18` (seungwook-jung), alexanderclin's three — all superseded upstream. |

---

## 3. Issue / PR catalogue

### Feature requests
| # | Title (requester) | Concrete ask | Maintainer response | Status |
|---|---|---|---|---|
| #15 | GR1s date imprint (stefanomattia) | dot-matrix digits matching GR1s DATE, orange, small | accepted | CLOSED, shipped 1.2.0 (Date Look: GR1s; not adjustable) |
| #18 | Border module (bleighk) | thin white/black edge painted on JPEG; ~3% of width (120 px @ 4000) with a 6% option | accepted in principle: can paint over the edge, cannot add space outside; asked width | OPEN, not implemented (not in CHANGELOG) |
| #19 | Remember GRKU settings per U1/U2/U3 (azhar-ba) | per-user-mode memory of enabled state + settings of every module, restored on mode-dial change, persisted | "added to the roadmap" | OPEN, not implemented; +1 ×3 (stefanomattia, mndscp, anidel) |
| #27 | Native Image Control recipes with WB shift (iceboerg00) | GRK "Recipes" page applying native Custom-slot recipes incl. WB mode/temp/shift, highlight/shadow/peripheral/NR via `UserData Set` shell commands; preview on highlight | accepted; will implement after architecture rework, use `grade` as reference, credit co-author | OPEN; upstream `feat/recipes` branch unmerged |
| #34 | Sticky effects preview on site (fsgreco) | preview stays in view while scrolling the effects grid | implemented by maintainer (d6d1218, co-author credit) + PR #42 | CLOSED, shipped |
| #38 | Film box end-flap icons + custom icon option (robvagin) | 18-icon flap set offered; ask: `"icon": {"image": "flap.png"}` 40×40 binary-alpha PNG in effect JSON and in site LUT import | "I'll look into a way to load custom icons" | OPEN; 1.5.1 only allows picking name/icon of an imported LUT look, no PNG upload; heart ×1, +1 comment (anidel) |
| #59 | Replace 2 s startup delay with readiness check (jshph) | script-readable readiness signal for `lcmd_resp on` | declined: no readable signal; would not speed up (Linux ready ~4.2 s, card mount 6–7 s); firmware change out of scope | CLOSED (1.5.0 later added optional fast-boot firmware) |
| #62 | Create/edit presets in browser (swgrrt) | in-site effect editor: from scratch or open effect JSON, live preview, export | none | OPEN, 0 comments |
| #67 | Edit film look in RAW Development; rename/reorder imported LUTs (momoooooDNG) | Fn adjustments in RAW dev; edit name of imported look | accepted | CLOSED, both shipped 1.5.1 |
| #68 | Upload JSON (swgrrt) | upload an `effects.json` to the web app to include a locally made look | none | OPEN, 0 comments |
| PR #60 | Back up imported LUTs/browser settings (jeffreychuuu) | portable backup file across browsers; >40 LUTs | closed; replaced by "Import GRKU.zip" restore (2e411f2) | CLOSED, alternative shipped |

### Bugs
| # | Summary (reporter) | Camera/fw | Resolution |
|---|---|---|---|
| #7 | GRK absent when `EFFECTS` dir present; scan returns 30 (chiwaisy-cpu) | GR IV HDF 1.11, macOS-copied exFAT | CLOSED fixed 1.1.0 (`._` files on exFAT no longer block install) |
| #9 | Installer error 10 on GR IV HDF 1.11 build 2026/02/18 (AzaelCC; horstf) | GR IV HDF 1.11 | CLOSED fixed 1.1.0/1.1.1 (runtime relocation to other builds); PR #13 adds regression test; horstf's case was impatience |
| #12 | No GRK, INSTALL.ERR 10 (wRath13371337) | GR IV 1.11 | CLOSED dup of #9 |
| #22 | Error 47 on factory 1.20 (DinNguyen88) | GR IV 30th Anniversary, factory 1.20 | CLOSED fixed 1.2.1 after firmware dump |
| #25 | Highlight warning off and histogram truncated with effect on (stefanomattia) | GR IIIx 1.60, 1.2.1 | CLOSED: warning fixed 1.3.0, histogram/clip line 1.3.2 |
| #37 | 1.3.1/1.3.2 not loading, LED flashing (spuzul, ghostdog650, rapmendoza, stevenmqnguyen) | GR III 2.10 / IIIx 1.60 | CLOSED fixed 1.3.3 (exFAT cards; FAT32 32 GB worked) |
| #39 | Film Look and Guides modules not loading (jonchiu) | GR IV 1.11, 1.3.1 | CLOSED fixed 1.3.3 |
| #45 | Touch navigation in GRK changes previous ADJ setting (rapmendoza) | GR IIIx 1.60, 1.3.3 | CLOSED fixed 1.3.5 |
| #63 | GR World import error (dungsuk377; sluczak Android) | GR IV 1.20, 1.4.1/1.3.5 | OPEN — see section 5 |
| #70 | Error 37 on fast-boot firmware (nsch1) | GR IV 1.20, 1.5.0 | OPEN — see section 5 |

### Device reports / notices
- #26 GR IIIx HDF 1.60 + 1.2.1 (allouis): works, every module tested, incl. CLI-built package. CLOSED.
- #17 New Ricoh firmwares (shutterlore): GR III 2.20 / IIIx 1.70 / IV 1.20 / IV Mono 1.10; old-firmware URL trick. CLOSED, supported in 1.2.0.

### Questions
- #41 Modified firmware (GRLife, GR Mod) (anidel): not supported, official firmware only; spuzul confirms GR Mod does not load. CLOSED.

### PRs
- Merged external: #13 AzaelCC (relocation test), #42 fsgreco (CSS grid), #46 qubmen (GRKU switch).
- Closed external: #53 MustafaCisse (HDF Glow; Windows fix absorbed), #60 jeffreychuuu (backup; alternative shipped).
- Maintainer: #10 LUT import, #11 relocation, #20 firmware releases, #23 framing ratios, #24 (closed, superseded by #31), #31 modules/MENU, #33 web SD install, #51 Glow, #54 viewfinder indicators, #55 Cinema looks, #56 landing page, #66 fast-boot; releases #6, #8, #14, #16, #21, #32, #35, #36, #40, #43, #44, #52, #57, #58, #61, #64, #65, #69.
- Dependabot: #1–5, #28–30, #47–50 all closed unmerged.

---

## 4. Most-wanted features (ranked by distinct people + reactions + parallel fork work)

1. **Recipes / native Image Control presets** — #27 (iceboerg00 + full plugin), kkasemsa fork Recipe module, upstream `feat/recipes` WIP; adjacent asks #62/#68. Maintainer committed.
2. **Per-U1/U2/U3 memory of GRKU settings** — #19: requester + 3 thumbs-up = 4 people. On roadmap, no code on main.
3. **Custom icons / box-flap icon set** — #38: requester + heart + comment (3 people). Maintainer will look into it.
4. **Border on JPEGs** — #18: requester + heart (2 people). Maintainer engaged on design.
5. **Browser effect editor + JSON upload** — #62, #68 (same requester, swgrrt). No response.
6. **More glow/diffusion variants** — three independent forks (alexanderclin Diffusion, seungwook-jung Halation, MustafaCisse HDF Glow) preceded upstream Bloom/Halation; still unshipped: Black Mist veil, anamorphic Streak.
7. **Crop Zoom 35/40/50 mm** — MustafaCisse fork only, no issue.
8. **Faster start** — #59 (declined) then fast-boot firmware shipped 1.5.0.
9. **LUT portability across browsers/devices** — PR #60; shipped as GRKU.zip import.

---

## 5. Open bugs with reproduction details

**#63 — GR World app import fails with GRKU on the card** (dungsuk377, iPad Pro 4th gen / iPadOS 27.01 / GR World 2.0.0 / GR IV 1.20 / GRKit 1.4.1→1.4.3; sluczak: Android GR World 2.0.0 / GR IV 1.20 / GRKit 1.3.5)
- Repro: connect via GR World, preview works, Import at either resolution → "an error has occurred during image transfer", also for photos not taken with GRKU. Android: intermittent; same file may transfer on a second connection; sluczak's unproven hypothesis is that panoramic (XPan) photos corrupt the session.
- Maintainer could not reproduce on GR IV with or without GRKU, including XPan photos; asked to update GR World (Ricoh fixed an import bug) and to test with `SCRIPT` removed.
- Reporter's result: removing `SCRIPT` fixed imports; putting it back and shooting XPan + normal photos then also imported fine. Cause unexplained; still open.

**#70 — GRKit 1.5.0 won't install on the GR IV 1.20 fast-boot firmware, works on official** (nsch1)
- Repro: GR IV 1.20, GRKit 1.5.0 gr4-1.20 package, fast-boot firmware installed → `REPORT.TXT`: "GRKU did not install: error 37", all six modules listed as loaded, no effects; `BOOT.TXT` shows load at 6.85/7.01 s, scan 0, install 0 on two boots.
- Maintainer could not reproduce; "made the fast start more robust" so a fast-start failure falls back to the normal load; posted test build `GRKU-gr4-issue70-test-noeffects.zip` (reports as 1.5.1) and asked for `BOOT.TXT`/`REPORT.TXT` after 3 power cycles. No reply yet; no commit on main is explicitly tied to #70 (1.5.1 CHANGELOG does not mention it).

---

## Delta 2026-11-09 (second pass)

Upstream: v1.5.2 (2026-11-08) merged the Guides golden spiral + dynamic symmetry and the fast-boot fallback; our main is 8 commits behind it (conflicts in loader.rs, installer.c, packaging.rs, 3 snapshots). Maintainer branches moving daily: `feat/recipes` (recipes in ADJ with Undo; **U1–U3 of the mode dial carried in the package and shown in the live view**, which answers #19; commits of 2026-11-09), `feat/crop` (PR #77 open: Crop module 35/40/50/70/90 mm with live view and badge; supersedes MustafaCisse's Crop Zoom), `feat/gr3-custom-mapping` (BLE read/write of GR III Custom sets). Plan: take recipes, U-modes, and crop from upstream when they land instead of writing them.

Issues: open #38 icons (done here, in color), #19 U-modes (upstream in progress), #18 Border (unclaimed; white or black edge over the JPEG, 3% and 6% widths), #62 browser preset editor (maintainer declined for now; our site plan covers choosing and editing), #27 recipes (upstream), #70 fast-boot 1.20 install error 37 (not our path), **#71 feet/inches on the snap and MF distance scales (new, unclaimed: RTOS text tables, a REA/Ghidra task)**. Closed #59 confirms the maintainer's view of the load time (card mount dominates), which our one-shot start addresses.

Forks: **kkasemsa** added an `extras/overlay` module (vignette, dust and hairs, light leak as edge wash, band, or corner flare, scratches; Off/Light/Medium/Strong; presets Faded, Dusty, Leaky, Expired; per-shot seed from the picture; camera timing unverified) plus three Recipe menus and canister icons — the overlay is the closest thing to GRLife's light leak and dust, worth porting as our Light leak module. **MustafaCisse** HDF Glow with Black Mist (veil) and Streak (anamorphic flare) was closed as PR #53 (maintainer keeps one Glow); Black Mist and Streak are still unique and portable into our Glow or a Softness module. **jeffreychuuu** web backup became upstream's "GRKU.zip keeps your imported LUTs" (PR #60 closed, feature landed differently). jakeds (Soft: grain boost and fixed pattern), seungwook-jung (halation), alexanderclin (diffusion, cinema tools), iceboerg00 (80 recipes data) unchanged since the first pass.
