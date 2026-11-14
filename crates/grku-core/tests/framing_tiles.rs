//! Each ratio of the catalog of `grku_core::aspect` has its Framing tile. The
//! GRKU tiles are color pictures (scripts/menu-tiles.py; 3:4 is the 1:1
//! picture in a 14 by 18 frame), not those of `examples/module-icons.rs`.

use grku_core::{aspect::RATIOS, png};
use std::path::PathBuf;

#[test]
fn each_framing_ratio_has_its_tile() {
    let tiles = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../modules/framing/tiles");
    for ratio in &RATIOS[1..] {
        let file = std::fs::read(tiles.join(ratio.tile)).unwrap();
        let (width, height, _) = png::decode_rgba8(&file).unwrap();
        assert_eq!((width, height), (40, 40), "{}", ratio.tile);
    }
}
