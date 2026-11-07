# Handoff

For whoever continues this fork (a person, or Codex / another coding agent). It says what this fork is, what changed, how to build and test on this Mac, what was never run on a camera, and what to do next. Read [docs/roadmap.md](docs/roadmap.md) for the plan and [docs/one-shot-start.md](docs/one-shot-start.md) for the first delivered change.

## The fork in one paragraph

[ahonn/GRKit](https://github.com/ahonn/GRKit) adds film looks, crops, date stamps, glow, and grain to RICOH GR III / IIIx / IV from the SD card, with no firmware change. We forked it (`origin` = `botnick/GRKit`, `upstream` = `ahonn/GRKit`, forked at upstream `920c1d9`, v1.5.1, 2026-11-07) to (1) load sooner, (2) reach the feature set of GRLife Pro, (3) widen the film library, (4) fold in the good work of the community forks and issues, all **without ever flashing the firmware**. The SD script setting of the camera is turned on once and stays on until the disable package turns it off, as upstream does.

## What this branch changes (`feat/one-shot-start`)

| File | Change |
| --- | --- |
| `runtime/installer.c` | `--start`, `--start-known`, `--start-try`: one process scans, posts to the mailbox, waits for the arrays, installs, posts the result, writes the files and the boot log. `make_plan` / `publish_plan` / `open_plan_tmp` split out of `scan`; `install_planned` split out of `install` so the retries of a not-ready camera do not re-run the relocation. `ARRAY_LEAD` is 2 (probe array, then mailbox). |
| `runtime/install_io.h` | `ram_cache` and `read_whole`: a start reads each card file once and keeps a copy under `/tmp/grkit-cache`. `read_effect` uses it. |
| `runtime/install_plan.h` | `read_module` uses `read_whole`. |
| `runtime/install_status.h` | `STATUS_NO_PROCESS = 4`. |
| `crates/grkit-core/src/abi.rs`, `runtime/abi.h` (generated) | `MAILBOX_*` fields. |
| `crates/grkit-core/src/runtime/loader.rs` | `LOADER.TTL`: allocates `mb`, polls the mailbox and the files, posts `mb[13]` after the arrays, sends `INSTALL.SH` only as a 10 s watchdog, writes the status of a failed start. |
| `crates/grkit-core/src/runtime/files.rs` | `SCAN.SH` runs the core once with `--start*` and leaves while the start lock exists; `GRKIT/DIAG` diagnostics; `INSTALL.SH` is the fallback and checks the pid of the start. |
| `crates/grkit-build/src/tests/snapshots/*` | regenerated. |
| tests | `loader.rs` unit tests, `packaging.rs` script shape tests, `abi.rs` field test. |
| docs | `docs/one-shot-start.md`, `docs/roadmap.md`, `docs/lut-sources.md`, `docs/community-survey.md`, `README.th.md`, this file. |

The web site (`web/`) and the modules are unchanged. A package built from this branch has the same files as a 1.5.1 package (`SCAN.SH`, `INSTALL.SH`, `LOADER.TTL`, `CORE.BIN`, modules, effects), so the site's "write to SD card" flow still applies once the site data is rebuilt from this branch.

## Film library and icons (branch `feat/film-library`, merged 2026-11-08)

- `effects/` has 104 looks. The 83 new ones were fitted with `grkit effects import` from HaldCLUTs of Pat David's film emulation presets (NatronGitHub/clut mirror, CC BY-SA 4.0) and t3mujinpack (MIT); the scripts that made them are in the session scratchpad only, the result is the effect folders, `effects/sources/manifest.json`, `effects/sources/PATDAVID_LICENSE.txt`, and the notices. Grades: every kept fit is A or B. The spektrafilm and Spectral Film LUT generators are set up in a venv under the scratchpad (`uv venv -p 3.13`, spektrafilm needs the `exiv2` module that did not install); their missing stocks are the next step of `docs/lut-sources.md`.
- Every effect has an own-image icon (`icon: {"png": ...}`), a film box end flap in brand colors that `scripts/flap-icons.py embed` draws from the `cover` fields (the former box icon fields, kept for the site). `scripts/golden.py BUILD_DIR` pins `effects/golden.json` after a change.
- A package carries 40 effects (`MAX_COUNT` of the runtime; the camera lists 64 files). `build/effects-default` holds the 40 of the release packages (the 21 of upstream and 19 new ones, chosen in the packaging command of this session); `dist/GRKit-film-library.zip` has every GRF with `INDEX.txt`. A better way to pick is the site (`docs/roadmap.md`, section 5).

## What was NOT done

- **Nothing on this branch has run on a camera.** The host tests pass (Rust, the host C contracts, the script shape tests), but the handshake between the loader script and the start (the mailbox, the fork, the `lcmd` request returning while the child runs) is reasoned from the 1.3.1 loader, which used the same mailbox in the field, and from `FINISH.SH` of 1.3.1, which ran a detached process the same way. The fallbacks (the card files, `INSTALL.SH`) exist so that a mailbox the loader cannot see still loads GRKit, but only a camera can confirm that.
- The ARM runtime (`CORE.BIN`) builds (see "Next tasks"), so the C compiles and links; whether `fork` (ARM EABI syscall 2), `setsid` (66), `dup2` (63), and `nanosleep` (162) behave as expected on the camera's kernel is what the camera test shows. The fallbacks cover a start that dies: `INSTALL.SH` after 10 s installs from the plan in RAM if the plan was posted, else the loader stops with a status in `INSTALL.ERR`.
- Phase 2 of the load time (start before the camera mounts the card) is designed, not written.
- No new module, no new effect, no Thai menu text yet.

## This Mac

Everything below was installed on 2026-11-08 under the `botnick` account.

| Tool | Where | Note |
| --- | --- | --- |
| Rust 1.99.1 stable | `~/.rustup/toolchains/stable-aarch64-apple-darwin/bin` (`rustup` from Homebrew at `~/homebrew/bin/rustup`) | put the toolchain `bin` on `PATH`; there is no `~/.cargo/bin` |
| Apple Clang 21.0.0 | `/usr/bin/clang` | the reference compiler of upstream |
| LLD 21.1.8 | `~/Tools/llvm-dl/LLVM-21.1.8-macOS-ARM64/bin/ld.lld` | the reference linker version of upstream (prebuilt LLVM release; Homebrew was building LLVM from source, which takes hours) |
| Official firmware files | `~/firmware/gr3-2.10/fwdc239b.bin` (target `gr3-2.10`), `~/firmware/gr4-1.11/fwdc248b.bin` (`gr4-1.11`), `~/firmware/gr4-1.20/fwdc248b.bin` (`gr4-1.20`), each with the SHA-256 that its target pins; the zips are next to them | From `https://www.ricoh-imaging.co.jp/resources/japan/support/download/digital/FIRMWARE/gr3_v210.zip`, `gr4_v111.zip`, `gr4_v120.zip`: Ricoh links only the latest version but still serves the older files. The factory build of the GR IV 30th Anniversary camera (`gr4-1.20-0528`) comes only from a camera dump (`runtime/dump/`), which we do not have. Keep firmware out of Git. |
| REA (Reverse Engineer Anything) 6.7.0 | `rea` on PATH (npm global); registered as MCP server `rea` for Claude Code (`~/.claude.json`) and Codex (`~/.codex/config.toml`); skill `reverse-engineer-anything` | for the RTOS reverse engineering of the roadmap |
| Ghidra 12.1.4 (the version REA verifies against; 12.2 wants JDK 25) | `~/Tools/ghidra-dl/ghidra_12.1.4_PUBLIC` | the release zip has no macOS arm64 decompiler: `support/buildNatives` builds it with Gradle (started on 2026-11-08; check `Ghidra/Features/Decompiler/build/os/mac_arm_64/decompile`). Until then `rea doctor` reports `native_decompiler` as missing and REA's native analysis is off. Ghidra 12.2 is also at `~/Tools/ghidra-dl/ghidra_12.2_PUBLIC` |
| JDK 21 (Temurin 21.0.14) | `~/Tools/jdk-dl/jdk-21.0.14+1/Contents/Home` | not on PATH; export `JAVA_HOME` |
| Node 24, pnpm | nvm | for `web/` |

```sh
export GHIDRA_INSTALL_DIR="$HOME/Tools/ghidra-dl/ghidra_12.1.4_PUBLIC"
export JAVA_HOME="$HOME/Tools/jdk-dl/jdk-21.0.14+1/Contents/Home"
rea doctor --json | head -c 2000      # the Ghidra provider checks
rea setup --client claude_code --client codex --yes   # saves the provider paths into the MCP registrations
```

The RTOS image to analyze is the decoded body of `fwdc239b.bin`: `grkit` decodes it (`crates/grkit-firmware`, `grkit_core::firmware::decode`), the RTOS loads at `0x53000000` (`target::RTOS_BASE`), and `crates/grkit-build/src/target/gr3_210.rs` names the known functions and hook sites. `runtime/dump/` is the tool that copies the running RTOS from a camera for builds that differ.

```sh
export PATH="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin:$HOME/homebrew/bin:$PATH"
export GRKIT_CLANG=/usr/bin/clang
export GRKIT_LLD="$HOME/Tools/llvm-dl/LLVM-21.1.8-macOS-ARM64/bin/ld.lld"
```

## Build the package

`grkit` embeds `runtime/` and `resources/` at `cargo install` time: **after any change under `runtime/`, run `cargo install --path crates/grkit-cli --locked` again before `grkit build`**, or the build silently uses the old installer. `grkit build` refuses an existing `--out` directory; remove it first.

```sh
cd ~/Desktop/GRKit
cargo install --path crates/grkit-cli --locked
grkit doctor
grkit effects build --source effects --out build/effects
grkit build --target gr3-2.10 --firmware ~/firmware/gr3-2.10/fwdc239b.bin --out build/runtime \
  --clang "$GRKIT_CLANG" --lld "$GRKIT_LLD"
for module in modules/*/; do grkit module build --dir "$module" --out "build/modules/$(basename "$module").GRM"; done
sh .github/scripts/install-guide-tools.sh build/guide-tools
sh .github/scripts/build-guides.sh grkit build/guide-tools build/guides
grkit package --build build/runtime --effects build/effects $(for m in build/modules/*.GRM; do printf -- '--module %s ' "$m"; done) \
  --guide build/guides/gr3/en.pdf --out dist/GRKit.zip
grkit verify dist/GRKit.zip
```

For GR IIIx, package with `--camera gr3x` and `--guide build/guides/gr3x/en.pdf`. For GR IV, build `gr4-1.11` and `gr4-1.20` from their firmware files into two directories and package both:

```sh
grkit build --target gr4-1.11 --firmware ~/firmware/gr4-1.11/fwdc248b.bin --out build/runtime-gr4-1.11 --clang "$GRKIT_CLANG" --lld "$GRKIT_LLD"
grkit build --target gr4-1.20 --firmware ~/firmware/gr4-1.20/fwdc248b.bin --out build/runtime-gr4-1.20 --clang "$GRKIT_CLANG" --lld "$GRKIT_LLD"
grkit package --build build/runtime-gr4-1.11 --build build/runtime-gr4-1.20 --effects build/effects $(for m in build/modules/*.GRM; do printf -- '--module %s ' "$m"; done) \
  --camera gr4 --guide build/guides/gr4/en.pdf --out dist/GRKit-gr4.zip
```

This fork's packaging accepts a package with the builds the builder has (in release order), so the GR IV package ships without the `gr4-1.20-0528` factory build: a 30th Anniversary camera on that build gets `INSTALL.ERR` 47 instead of GRKit. `build/runtime*/build.json` reports the code sizes; the fast-boot files that `grkit build` also writes are optional and not our path.

## Test

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
GRKIT_REQUIRE_NATIVE_TESTS=1 cargo test --workspace --locked
GRKIT_UPDATE_GENERATED=1 cargo test -p grkit-core --test generated   # after a change to abi.rs
GRKIT_UPDATE_GENERATED=1 cargo test -p grkit-build                    # after a change to the scripts (snapshots)
```

State on 2026-11-08: `cargo fmt` clean; the workspace tests pass with the host C tests required; `cargo clippy` with Rust 1.99.1 fails on **upstream** code only (the new `chunks_exact_to_as_chunks` lint in `grkit-firmware/src/update.rs`, `grkit-core/src/fit/sectors.rs`, `gr4_looks.rs`, `grm.rs`, `hue.rs`), not on the changes of this branch. Upstream CI runs an older stable. Either pin the toolchain with a `rust-toolchain.toml` or fix those sites when touching them.

## Test on a camera

1. Build the package (above) or take `dist/GRKit.zip`, copy the contents of `SD_ROOT` to the card root. If the card already has GRKit, replace only `SCRIPT`.
2. Power on three times. Each time, time GRK in ADJ with a stopwatch.
3. Read `GRKIT/BOOT.TXT`: the `load`, `scan 0`, `install 0` lines of each start (see one-shot-start.md). `GRKIT/REPORT.TXT` says what loaded. `SCRIPT/GRKIT/INSTALL.ERR`, if it exists, says which step stopped.
4. Create an empty `GRKIT/DIAG`, power on, wait 20 s, power off, read `GRKIT/DIAG.TXT`, delete `GRKIT/DIAG`. The `read-core` block gives the read speed of the card file system and whether a second read is cheaper. The `mounts` block gives the mount of `/media/storage1` and its options. This decides Phase 2.
5. If GRK does not appear within 30 s: power off, remove the card, and read the three files above. The fallbacks mean the most likely failure is a compile or syscall mistake in `--start`, which `INSTALL.ERR` and `BOOT.TXT` will name.

## Next tasks, in order

1. ~~Build `CORE.BIN` from this branch~~ Done on 2026-11-08 for `gr3-2.10`, `gr4-1.11`, and `gr4-1.20`; `dist/GRKit-gr3.zip`, `GRKit-gr3x.zip`, and `GRKit-gr4.zip` verify. The GR IV package was written to the user's card (a GR IV on firmware 1.11) for the first camera test.
2. Camera test as above (the user's camera is a GR IV 1.11; GR III / IIIx still need a tester). Fix what it says. Commit the `BOOT.TXT` numbers into one-shot-start.md.
3. Rebuild the site data (`grkit site`, `grkit effects publish`) if the site should serve this fork's packages.
4. Then follow docs/roadmap.md, section 5.

## Rules kept from upstream

See `CONTRIBUTING.md`: no filesystem access in `grkit-core`, target addresses only in the target definitions, no edits to the generated `runtime/abi.h` and `web/src/generated/`, conventional commits, a change file in `.changeset/` for each user-visible change, firmware and build outputs out of Git, licenses of every effect source in `effects/NOTICE.md`.

## Credits

Upstream is the work of ahonn and the GRKit contributors (MIT). The community survey names the fork authors whose work the roadmap proposes to port (MustafaCisse, kkasemsa, iceboerg00, jakeds, and others); credit them as co-authors when porting, as upstream did.
