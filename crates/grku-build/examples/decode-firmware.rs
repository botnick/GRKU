//! Decode an official firmware file and write its RTOS section, for analysis with strings,
//! Ghidra, or REA: `cargo run -p grku-build --example decode-firmware -- fwdc248b.bin rtos.bin`.
//! The RTOS image loads at 0x53000000 (`grku_build::target::RTOS_BASE`).
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    anyhow::ensure!(
        args.len() == 3,
        "Usage: decode-firmware FIRMWARE.bin OUT.bin"
    );
    let data = std::fs::read(&args[1]).with_context(|| format!("Read {}", args[1]))?;
    let decoded = grku_build::firmware::decode(&data)?;
    let rtos = grku_build::firmware::rtos_section(&decoded)?;
    std::fs::write(&args[2], rtos).with_context(|| format!("Write {}", args[2]))?;
    println!(
        "decoded {} bytes, RTOS section {} bytes -> {}",
        decoded.len(),
        rtos.len(),
        args[2]
    );
    Ok(())
}
