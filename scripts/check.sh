#!/bin/sh
# Runs the checks of the Tests workflow on this computer.
#
# Without options it runs the Rust and the web checks. It adds the ARM builds
# when GRKU_CLANG and GRKU_LLD name the release toolchain, and the firmware
# tests when GRKU_TEST_FIRMWARE, GRKU_TEST_FIRMWARE_GR3_221,
# GRKU_TEST_FIRMWARE_GR4, GRKU_TEST_FIRMWARE_GR4_120,
# GRKU_TEST_FIRMWARE_GR4_120_0528, and GRKU_TEST_FIRMWARE_GR4_121 name the
# firmware files (CONTRIBUTING.md).
set -eu
cd "$(dirname "$0")/.."

step() { printf '\n== %s\n' "$*"; }

step Rust format
cargo fmt --all -- --check
step Clippy
cargo clippy --workspace --all-targets --locked -- -D warnings
step Rust and host C tests
GRKU_REQUIRE_NATIVE_TESTS=1 cargo test --workspace --locked
step WebAssembly build
cargo build -p grku-wasm --target wasm32-unknown-unknown --release --locked

if [ -n "${GRKU_CLANG:-}" ] && [ -n "${GRKU_LLD:-}" ]; then
    step ARM builds
    cargo test -p grku-build --locked -- --ignored synthetic_ dump_
    if [ -n "${GRKU_TEST_FIRMWARE:-}" ] && [ -n "${GRKU_TEST_FIRMWARE_GR3_221:-}" ] &&
        [ -n "${GRKU_TEST_FIRMWARE_GR4:-}" ] &&
        [ -n "${GRKU_TEST_FIRMWARE_GR4_120:-}" ] && [ -n "${GRKU_TEST_FIRMWARE_GR4_120_0528:-}" ] &&
        [ -n "${GRKU_TEST_FIRMWARE_GR4_121:-}" ]; then
        step Firmware tests
        cargo test -p grku-build --locked --release -- --ignored
    else
        step "Firmware tests skipped: set the six GRKU_TEST_FIRMWARE variables"
    fi
else
    step "ARM builds skipped: set GRKU_CLANG and GRKU_LLD"
fi

step Web
cd web
pnpm install --frozen-lockfile
pnpm wasm
pnpm typecheck
pnpm test
