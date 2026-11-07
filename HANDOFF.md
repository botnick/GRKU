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

## What was NOT done

- **Nothing on this branch has run on a camera.** The host tests pass (Rust, the host C contracts, the script shape tests), but the handshake between the loader script and the start (the mailbox, the fork, the `lcmd` request returning while the child runs) is reasoned from the 1.3.1 loader, which used the same mailbox in the field, and from `FINISH.SH` of 1.3.1, which ran a detached process the same way. The fallbacks (the card files, `INSTALL.SH`) exist so that a mailbox the loader cannot see still loads GRKit, but only a camera can confirm that.
- The ARM runtime (`CORE.BIN`) has not been built on this Mac yet: see "Build the package" below. The C changes compile only in the host contract tests so far (parts of the installer, not `installer.c` as a whole). **Build it first; fix any ARM-only compile error** (likely candidates: the `syscall6` of `fork`, `setsid`, `dup2`, `nanosleep`, which are new numbers for this file).
- Phase 2 of the load time (start before the camera mounts the card) is designed, not written.
- No new module, no new effect, no Thai menu text yet.

## This Mac

Everything below was installed on 2026-11-08 under the `botnick` account.

| Tool | Where | Note |
| --- | --- | --- |
| Rust 1.99.1 stable | `~/.rustup/toolchains/stable-aarch64-apple-darwin/bin` (`rustup` from Homebrew at `~/homebrew/bin/rustup`) | put the toolchain `bin` on `PATH`; there is no `~/.cargo/bin` |
| Apple Clang 21.0.0 | `/usr/bin/clang` | the reference compiler of upstream |
| LLD 21.1.8 | `~/Tools/llvm-dl/LLVM-21.1.8-macOS-ARM64/bin/ld.lld` | the reference linker version of upstream (prebuilt LLVM release; Homebrew was building LLVM from source, which takes hours) |
| Official GR III 2.10 firmware | `/private/tmp/claude-501/-Users-botnick-Desktop/7d107312-c5d7-476e-a394-ec91b22f56f4/scratchpad/firmware/v210/fwdc239b.bin` (SHA-256 `d6a3c9c2…bfd4`, the pinned image of target `gr3-2.10`) | **copy it to `~/firmware/gr3-2.10/fwdc239b.bin` now**; the scratch folder is temporary. It came from `https://www.ricoh-imaging.co.jp/resources/japan/support/download/digital/FIRMWARE/gr3_v210.zip`, which Ricoh no longer links but still serves. Keep firmware out of Git. |
| REA (Reverse Engineer Anything) 6.7.0 | `rea` on PATH (npm global); registered as MCP server `rea` for Claude Code (`~/.claude.json`) and Codex (`~/.codex/config.toml`); skill `reverse-engineer-anything` | for the RTOS reverse engineering of the roadmap |
| Ghidra 12.2 | `~/Tools/ghidra-dl/ghidra_12.2_PUBLIC/ghidraRun` | Java 21 (Temurin) is installed; run `rea doctor` and point REA at this Ghidra |
| Node 24, pnpm | nvm | for `web/` |

```sh
export PATH="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin:$HOME/homebrew/bin:$PATH"
export GRKIT_CLANG=/usr/bin/clang
export GRKIT_LLD="$HOME/Tools/llvm-dl/LLVM-21.1.8-macOS-ARM64/bin/ld.lld"
```

## Build the package

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

For GR IIIx, package with `--camera gr3x`. GR IV needs the GR IV firmware files (not downloaded). `build/runtime/build.json` reports the code sizes; the fastboot files are optional and not our path.

## Test

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
GRKIT_REQUIRE_NATIVE_TESTS=1 cargo test --workspace --locked
GRKIT_UPDATE_GENERATED=1 cargo test -p grkit-core --test generated   # after a change to abi.rs
GRKIT_UPDATE_GENERATED=1 cargo test -p grkit-build                    # after a change to the scripts (snapshots)
```

## Test on a camera

1. Build the package (above) or take `dist/GRKit.zip`, copy the contents of `SD_ROOT` to the card root. If the card already has GRKit, replace only `SCRIPT`.
2. Power on three times. Each time, time GRK in ADJ with a stopwatch.
3. Read `GRKIT/BOOT.TXT`: the `load`, `scan 0`, `install 0` lines of each start (see one-shot-start.md). `GRKIT/REPORT.TXT` says what loaded. `SCRIPT/GRKIT/INSTALL.ERR`, if it exists, says which step stopped.
4. Create an empty `GRKIT/DIAG`, power on, wait 20 s, power off, read `GRKIT/DIAG.TXT`, delete `GRKIT/DIAG`. The `read-core` block gives the read speed of the card file system and whether a second read is cheaper. The `mounts` block gives the mount of `/media/storage1` and its options. This decides Phase 2.
5. If GRK does not appear within 30 s: power off, remove the card, and read the three files above. The fallbacks mean the most likely failure is a compile or syscall mistake in `--start`, which `INSTALL.ERR` and `BOOT.TXT` will name.

## Next tasks, in order

1. Build `CORE.BIN` from this branch and fix ARM compile errors. Commit.
2. Camera test on GR III / IIIx as above. Fix what it says. Commit the `BOOT.TXT` numbers into one-shot-start.md.
3. Rebuild the site data (`grkit site`, `grkit effects publish`) if the site should serve this fork's packages.
4. Then follow docs/roadmap.md, section 5.

## Rules kept from upstream

See `CONTRIBUTING.md`: no filesystem access in `grkit-core`, target addresses only in the target definitions, no edits to the generated `runtime/abi.h` and `web/src/generated/`, conventional commits, a change file in `.changeset/` for each user-visible change, firmware and build outputs out of Git, licenses of every effect source in `effects/NOTICE.md`.

## Credits

Upstream is the work of ahonn and the GRKit contributors (MIT). The community survey names the fork authors whose work the roadmap proposes to port (MustafaCisse, kkasemsa, iceboerg00, jakeds, and others); credit them as co-authors when porting, as upstream did.
