//! Files generated from `grku_core::abi`, `modules`, `camera`, and `site`. Set
//! GRKU_UPDATE_GENERATED=1 to rewrite them after a change of the tables.

use std::{fs, path::Path};

#[test]
fn checked_in_generated_files_match_the_tables() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    let mut files = vec![("runtime/abi.h", grku_core::abi::header())];
    files.extend(grku_core::modules::generated());
    files.extend(grku_core::camera::generated());
    files.extend(grku_core::site::generated());
    let update = std::env::var_os("GRKU_UPDATE_GENERATED").is_some();
    let mut stale = Vec::new();
    for (name, expected) in files {
        let path = root.join(name);
        if update {
            fs::create_dir_all(path.parent().unwrap()).unwrap();
            fs::write(&path, &expected).unwrap();
        } else if fs::read_to_string(&path).ok().as_deref() != Some(expected.as_str()) {
            stale.push(name);
        }
    }
    assert!(
        stale.is_empty(),
        "{stale:?} are stale. Run GRKU_UPDATE_GENERATED=1 cargo test -p grku-core --test generated"
    );
}
