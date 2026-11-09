# Contributing to GRKU

GRKU is its own project that grew out of [GRKit](https://github.com/ahonn/GRKit). The runtime technique, the module system and the test harness came from GRKit; the film library, the recipes, the newer modules, the one-shot start, the Thai-first site, GRKU Plus and the release pipeline are GRKU's. Read [README.md](README.md#origins) for the list, and [HANDOFF.md](HANDOFF.md) for the state of the work and the lessons of the camera tests.

The most useful contribution is a camera report: whether GRKU worked or not, on which camera and firmware, with `GRKU/BOOT.TXT` and `GRKU/REPORT.TXT` from the card ([what each line means](docs/diagnostics.md)). Open an [issue](https://github.com/botnick/GRKU/issues) for it.

## How the work flows

Everything goes through git. A push to `main` runs the tests, deploys the Plus service when `services/plus` changed, and opens or updates the release pull request from the change files in `.changeset/`. Merging that pull request tags the version, builds the packages from the official firmware, deploys grku.app and publishes the release. Nobody deploys by hand. [docs/releasing.md](docs/releasing.md) describes the pipeline and its setup.

Commits are plain: one change, a message that says what and why, no trailers. Add a change file in `.changeset/` for each change that a user can see.

## Set up

- Rust 1.92 or later. Use the checked-in `Cargo.lock`. CI runs clippy with 1.92 (`rustup run 1.92.0 cargo clippy --workspace --all-targets --locked -- -D warnings`); newer toolchains flag more.
- Clang and LLD with ARM support for runtime builds. No ARM libc or sysroot is necessary. Effect builds and package verification need no ARM compiler. If a compiler is not on `PATH`, pass `--clang` or `--lld`; `grku doctor` checks the toolchain. The reference toolchain is Apple Clang 21.0.0 with LLD 21.1.8.
- The official firmware for runtime builds, from Ricoh's download page: `fwdc239b.bin` in `gr3_v210.zip` (GR III 2.10), and `fwdc248b.bin` in `gr4_v111.zip` (GR IV 1.11). The build rejects other firmware. Firmware never goes into git.
- Node 24 and pnpm 11 for `web/` and `services/plus`.

## Build packages

[README.md](README.md#build-from-source) builds a GR IV package. For the others:

- GR III: build with `--target gr3-2.10` from `fwdc239b.bin`, package with `--camera gr3` and `--guide build/guides/gr3/en.pdf`.
- GR IIIx: the GR III runtime, packaged with `--camera gr3x` and `--guide build/guides/gr3x/en.pdf`.
- HDF models: package for the base camera, for example `--camera gr3` for the GR III HDF.
- GR IV Monochrome: package as for the GR IV, without the Film Look module (`FILMLOOK.GRM`) and without `--effects`.
- A package holds ten modules; the release leaves Border out. Effects need the Film Look module.
- Guide language: add `--language zh-Hans`, `--language zh-Hant`, `--language ja` or `--language ko`, with the guide in that language.

## Test

`scripts/check.sh` runs the Rust and web checks, and adds the ARM and firmware tests when their variables are set. CI also runs the dependency policy, the sanitizers and the stack budget. The basic commands:

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
GRKU_REQUIRE_NATIVE_TESTS=1 cargo test --workspace --locked
cargo deny --locked check
```

Host C tests compile parts of the runtime with a host C compiler; without one they are skipped, and `GRKU_REQUIRE_NATIVE_TESTS=1` makes that a failure. The ARM builds are ignored tests; the NEON parity test of Glow needs `qemu-arm`:

```sh
GRKU_CLANG=clang GRKU_LLD=ld.lld cargo test -p grku-build --locked -- --ignored synthetic_ dump_
GRKU_TEST_FIRMWARE="$PWD/firmware/fwdc239b.bin" GRKU_CLANG=clang GRKU_LLD=ld.lld \
  cargo test -p grku-build --locked pinned_firmware_build_is_reproducible -- --ignored
```

The memory checks use a host Clang with sanitizers; the native contract tests run under UBSan in CI, so a test that reads past a string literal fails there and not locally:

```sh
export GRKU_HOST_CC="$PWD/.github/scripts/clang-sanitized.sh"
export GRKU_SANITIZER_CC=clang
export GRKU_REQUIRE_NATIVE_TESTS=1
cargo run --locked -p grku-cli -- module test --dir modules/glow --cc "$GRKU_HOST_CC"
cargo test --locked -p grku-core --test native_contracts
unset GRKU_HOST_CC GRKU_SANITIZER_CC GRKU_REQUIRE_NATIVE_TESTS
```

The port test needs the official GR IV 1.11 and 1.20 firmware files, but no toolchain; see [Porting](docs/architecture.md#porting). For the site, `pnpm typecheck`, `pnpm test` and `pnpm build` in `web/`; see [web/README.md](web/README.md). For the Plus service, `pnpm typecheck` in `services/plus`, and `wrangler dev` with a `.dev.vars` for a local run.

Host tests and builds do not verify device behavior. Say in the pull request what you ran on a camera. The maintainer tests on a GR IV 1.11 and writes the card with `python3 -I scripts/card.py write dist/GRKU-gr4.zip`.

## Rules

- The camera's firmware is never flashed. GRKU is files on the SD card.
- Keep filesystem and process access out of `grku-core`.
- Put target addresses in the target definition or its native adapter. Check the hook bytes before you patch them.
- Do not edit `runtime/abi.h` or `web/src/generated/`. Change the layout tables in `crates/grku-core/src/abi.rs`, the capabilities in `crates/grku-core/src/capabilities.rs`, the official modules in `crates/grku-core/src/modules.rs` or the recipe tables, then regenerate with `GRKU_UPDATE_GENERATED=1 cargo test -p grku-core --test generated`.
- Keep the module ABI compatible with GRKit's SDK: a module built with GRKit's `grkit.h` still loads (the installer exports both context names).
- `SCAN.SH` must finish well under 1.5 s on the camera, and the camera never deletes or moves folders on the card (the card file system renames files only). The computer side does migrations.
- For independent controls in one ADJ entry, use `[page] kind = "settings"`; for separate pages under one entry, `[page] kind = "group"` with `[[page.children]]`. See [the module reference](docs/module-reference.md#page). To add a module, follow [Writing a module](docs/modules.md).
- Keep firmware details in the core. A module that needs a firmware function gets a core service, not an address.
- Add each new hook and its extension point to the hooks of its family in `crates/grku-build/src/target/<family>.rs`, with a site in every target of the family.
- Keep processing records valid while camera tasks use them. Do not change persistent native camera settings. Changes to cache synchronization or task lifetimes need a camera test.
- Add focused tests for new behavior. Keep GRF bytes unchanged in compatible refactors.
- Every Thai string of the site and the guides goes through the translation tools from the English source; none is written by hand into the code. The camera menu stays English: the camera has no Thai font.
- Change the English, Chinese, Japanese and Korean guides in `resources/` together, with the same headings and steps in the same order, and only the Markdown that `grku guides` accepts.
- Keep firmware, build outputs, archives, keys and local paths out of git. Secrets live in the repository secrets of GitHub Actions.
- Keep third-party notices. Review each new effect input and its license.

## License of contributions

- A code contribution is licensed under the MIT License.
- An effect contribution uses the license that its source requires. A fit of a spektrafilm LUT uses CC BY-SA 4.0. A fit of a Spectral Film LUT uses the MIT License.
- For a new effect source, add its attribution and license to `effects/NOTICE.md`, and its license text and changes to `effects/sources/`.
- Do not contribute an effect if its source license does not permit redistribution of derived data.

Fixes that apply to GRKit are welcome to go back to GRKit as pull requests there.
