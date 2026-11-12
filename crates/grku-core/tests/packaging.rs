use std::io::{Cursor, Read, Write};

use grku_core::{
    camera, guide::installation_guide, language::Language, packaging::*, runtime, testing, Files,
};
use serde_json::{json, Value};
use zip::{write::SimpleFileOptions, CompressionMethod, ZipArchive, ZipWriter};

fn runtime_fixture() -> Files {
    testing::runtime_files(&testing::installer(), "gr3-2.10")
}

/// The runtimes of a GR III or GR IIIx package: one for each GR III build.
fn gr3_runtimes() -> Vec<VerifiedRuntime> {
    testing::camera_runtimes(&camera::GR3)
}

/// A stand-in for a guide PDF, which the release builds with Typst.
const PDF: &[u8] = b"%PDF-1.7\n% GRKU test guide\n";

fn english() -> Guide<'static> {
    Guide {
        language: Language::English,
        pdf: PDF,
    }
}

fn package() -> Vec<u8> {
    assemble(
        &gr3_runtimes(),
        &testing::effect_set(&["test-effect"]),
        &testing::official_modules(),
        &camera::GR3,
        &english(),
    )
    .unwrap()
    .bytes
}

fn with_sums(mut files: Files) -> Files {
    let sums = files
        .iter()
        .filter(|(name, _)| name.as_str() != "SHA256SUMS")
        .map(|(name, bytes)| format!("{}  {name}\n", sha256(bytes)))
        .collect::<String>();
    files.insert("SHA256SUMS".into(), sums.into_bytes());
    files
}

fn unpack(bytes: &[u8]) -> Files {
    let mut archive = ZipArchive::new(Cursor::new(bytes)).unwrap();
    let mut files = Files::new();
    for index in 0..archive.len() {
        let mut entry = archive.by_index(index).unwrap();
        let mut bytes = Vec::new();
        entry.read_to_end(&mut bytes).unwrap();
        files.insert(entry.name().unwrap().into_owned(), bytes);
    }
    files
}

fn repack(files: &Files, compression: CompressionMethod) -> Vec<u8> {
    let mut archive = ZipWriter::new(Cursor::new(Vec::new()));
    for (name, blob) in files {
        archive
            .start_file(
                name,
                SimpleFileOptions::default().compression_method(compression),
            )
            .unwrap();
        archive.write_all(blob).unwrap();
    }
    archive.finish().unwrap().into_inner()
}

#[test]
fn package_round_trip_is_deterministic_and_preserves_metadata() {
    let first = package();
    assert_eq!(first, package());
    let verified = verify_package(&first).unwrap();
    assert_eq!(verified.effect_ids, ["test-effect"]);
    assert_eq!(verified.targets, ["gr3-2.10", "gr3-2.21"]);
    let mut archive = ZipArchive::new(Cursor::new(first)).unwrap();
    for index in 0..archive.len() {
        let entry = archive.by_index(index).unwrap();
        assert_eq!(entry.compression(), CompressionMethod::Stored);
        assert_eq!(entry.last_modified().unwrap().year(), 2026);
        let name = entry.name().unwrap();
        let expected = if name.ends_with(".BIN") || name.ends_with(".SH") {
            0o100755
        } else {
            0o100644
        };
        assert_eq!(entry.unix_mode(), Some(expected));
    }
}

#[test]
fn packages_ship_only_the_guide_the_licenses_and_checksums() {
    let files = unpack(&package());
    let documents: Vec<_> = files
        .keys()
        .filter(|name| !name.starts_with("SD_ROOT/"))
        .map(String::as_str)
        .collect();
    assert_eq!(
        documents,
        ["GRKU Installation Guide.pdf", "LICENSES.md", "SHA256SUMS"]
    );
    assert_eq!(files["GRKU Installation Guide.pdf"], PDF);
}

#[test]
fn manifests_notices_and_extra_documents_are_rejected() {
    let files = unpack(&package());
    assert!(verify_package(&repack(
        &with_sums(files.clone()),
        CompressionMethod::Stored
    ))
    .is_ok());
    for name in [
        "MANIFEST.json",
        "NOTICES/EFFECTS.md",
        "RECOVERY.md",
        "INSTALLATION.md",
        "images/grku-root.jpg",
    ] {
        let mut extra = files.clone();
        extra.insert(name.into(), b"{}".to_vec());
        assert!(
            verify_package(&repack(&with_sums(extra), CompressionMethod::Stored)).is_err(),
            "{name}"
        );
    }
}

#[test]
fn legacy_deflated_packages_remain_supported() {
    let files = unpack(&package());
    assert!(verify_package(&repack(&files, CompressionMethod::Deflated)).is_ok());
}

#[test]
fn corrupted_profiles_documents_manifests_and_sums_are_rejected() {
    let original = unpack(&package());
    let profile = original.keys().find(|name| name.ends_with(".GRF")).unwrap();
    for name in [
        profile.as_str(),
        "GRKU Installation Guide.pdf",
        "LICENSES.md",
        "SHA256SUMS",
    ] {
        let mut files = original.clone();
        files.get_mut(name).unwrap().push(b' ');
        assert!(
            verify_package(&repack(&files, CompressionMethod::Stored)).is_err(),
            "{name}"
        );
    }
    let mut bytes = package();
    bytes.truncate(bytes.len() / 2);
    assert!(verify_package(&bytes).is_err());
}

#[test]
fn paths_and_unexpected_entries_are_rejected() {
    for path in [
        "",
        "/absolute",
        "../outside",
        "a/../b",
        "a/./b",
        "a//b",
        "a/",
        "a\\b",
        "C:a",
        "a\0b",
        "中文",
    ] {
        assert!(safe_path(path).is_err(), "{path:?}");
    }
    for name in [
        "../outside",
        "SD_ROOT/EXTRA",
        "installation.md",
        "NOTICES/nested/extra",
    ] {
        let mut files = unpack(&package());
        files.insert(name.into(), b"bad".to_vec());
        assert!(
            verify_package(&repack(&files, CompressionMethod::Stored)).is_err(),
            "{name}"
        );
    }
}

#[test]
fn entry_limits_and_required_files_are_enforced() {
    let mut files = unpack(&package());
    files.remove("SD_ROOT/DEVELOP.MOD");
    assert!(validate_contents(&files).is_err());
    let mut files = unpack(&package());
    files.insert("EXTRA/huge".into(), vec![0; MAX_FILE_SIZE + 1]);
    assert!(validate_contents(&files).is_err());
    let mut files = unpack(&package());
    files.insert("EXTRA/one".into(), vec![0; MAX_FILE_SIZE]);
    files.insert("EXTRA/two".into(), vec![0; MAX_FILE_SIZE]);
    assert!(validate_contents(&files).is_err());
    let mut files = unpack(&package());
    for index in 0..MAX_ENTRIES {
        files.insert(format!("EXTRA/{index}"), vec![]);
    }
    assert!(verify_package(&repack(&files, CompressionMethod::Stored)).is_err());
}

#[test]
fn production_boundaries_are_enforced() {
    for (key, value) in [
        ("profile", "diagnostic"),
        ("startup_activation", "test-effect"),
        ("target", "other"),
    ] {
        let files = runtime_fixture();
        let mut altered = manifest("gr3-2.10", &files);
        altered[key] = json!(value);
        assert!(load_runtime(&json_bytes(&Value::Object(altered)).unwrap(), &files).is_err());
    }
    for suffix in [b"--select test-effect".as_slice(), b"changed"] {
        let mut altered = runtime_fixture();
        altered
            .get_mut("SCRIPT/STARTUP.TTL")
            .unwrap()
            .extend_from_slice(suffix);
        assert!(validate_runtime(&altered, "gr3-2.10").is_err());
    }
}

#[test]
fn target_capacity_and_empty_effect_selection_are_supported() {
    let mut effects = EffectSet::default();
    for i in 0..runtime::MAX_COUNT {
        effects
            .insert(testing::effect(&format!("effect-{i}")))
            .unwrap();
    }
    let bytes = assemble(
        &gr3_runtimes(),
        &effects,
        &testing::official_modules(),
        &camera::GR3,
        &english(),
    )
    .unwrap()
    .bytes;
    assert_eq!(
        verify_package(&bytes).unwrap().effect_ids.len(),
        runtime::MAX_COUNT
    );
    let error = effects
        .insert(testing::effect("effect-overflow"))
        .unwrap_err();
    assert!(
        error
            .to_string()
            .contains(&format!("at most {} effects", runtime::MAX_COUNT)),
        "{error}"
    );
    let bytes = assemble(
        &gr3_runtimes(),
        &EffectSet::default(),
        &testing::official_modules(),
        &camera::GR3,
        &english(),
    )
    .unwrap()
    .bytes;
    assert_eq!(
        verify_package(&bytes).unwrap().effect_ids,
        Vec::<String>::new()
    );
}

#[test]
fn selected_modules_are_packaged_and_verified() {
    let effects = testing::effect_set(&["test-effect"]);
    let modules = [testing::module("DATE"), testing::module("FILMLOOK")];
    let bytes = assemble(
        &gr3_runtimes(),
        &effects,
        &modules,
        &camera::GR3,
        &english(),
    )
    .unwrap()
    .bytes;
    let files = unpack(&bytes);
    assert!(files.contains_key("SD_ROOT/SCRIPT/GRKU/MODULES/DATE.GRM"));
    assert!(files.contains_key("SD_ROOT/SCRIPT/GRKU/MODULES/FILMLOOK.GRM"));
    assert_eq!(
        verify_package(&bytes).unwrap().modules,
        ["DATE", "FILMLOOK"]
    );
    // The plugin list of GRKU 1.x is not part of a package.
    let mut files = unpack(&package());
    files.insert(
        "SD_ROOT/SCRIPT/GRKU/PLUGINS.TXT".into(),
        b"image-control\n".to_vec(),
    );
    assert!(validate_contents(&with_sums(files)).is_err());
}

#[test]
fn packages_that_show_nothing_are_rejected() {
    let assemble_with = |effects: &[&str], modules: &[&str]| {
        let modules: Vec<_> = modules.iter().map(|id| testing::module(id)).collect();
        assemble(
            &gr3_runtimes(),
            &testing::effect_set(effects),
            &modules,
            &camera::GR3,
            &english(),
        )
    };
    // No module.
    assert!(assemble_with(&[], &[]).is_err());
    // Image Control shows only with effects.
    assert!(assemble_with(&[], &["FILMLOOK"]).is_err());
    assert!(assemble_with(&["test-effect"], &["FILMLOOK"]).is_ok());
    // Effects need Image Control.
    assert!(assemble_with(&["test-effect"], &["FRAMING"]).is_err());
    assert!(assemble_with(&[], &["FRAMING"]).is_ok());
    // A module of another author shows its own page.
    assert!(assemble_with(&[], &["PROBE"]).is_ok());
}

#[test]
fn malformed_manifest_records_are_rejected_without_panicking() {
    for value in [
        json!([]),
        json!(null),
        json!(42),
        json!({"files": null}),
        json!({"files": [null]}),
        json!({"files": [{"path": "x", "size": true, "sha256": "0".repeat(64)}]}),
        json!({"files": [{"path": "x", "size": -1, "sha256": "0".repeat(64)}]}),
        json!({"files": [{"path": "x", "size": 1.0, "sha256": "0".repeat(64)}]}),
    ] {
        assert!(
            read_manifest(&json_bytes(&value).unwrap()).is_err(),
            "{value}"
        );
    }
    assert!(read_manifest(br#"{"files":[],"files":[]}"#).is_err());
    assert!(read_manifest(
        &json_bytes(&json!({"files": [
            {"path": "X", "size": 0, "sha256": "0".repeat(64)},
            {"path": "x", "size": 0, "sha256": "0".repeat(64)}
        ]}))
        .unwrap()
    )
    .is_err());
}

#[test]
fn json_matches_existing_ascii_pretty_format() {
    assert_eq!(
        json_bytes(&json!({"z": [1, true], "a": "中😀\u{7f}"})).unwrap(),
        b"{\n  \"a\": \"\\u4e2d\\ud83d\\ude00\\u007f\",\n  \"z\": [\n    1,\n    true\n  ]\n}\n"
    );
}

#[test]
fn runtime_layout_matches_target_capacity() {
    assert_eq!(runtime::MAX_COUNT, 40);
    assert_eq!(
        runtime::layout(0).unwrap(),
        json!({"words": runtime::HEADER_SIZE / 4, "tail_words": runtime::TAIL_WORDS, "icon_words": [12816]})
    );
    assert_eq!(
        runtime::layout(40).unwrap(),
        json!({
            "words": (runtime::HEADER_SIZE + 40 * 0x1100) / 4,
            "tail_words": runtime::TAIL_WORDS,
            "icon_words": [64080, 12816]
        })
    );
    assert!(runtime::layout(41).is_err());
}

#[test]
fn allocation_includes_host_icons_at_chunk_boundaries() {
    for count in 0..=runtime::MAX_COUNT {
        let layout = runtime::layout(count).unwrap();
        let words = layout["words"].as_u64().unwrap() as usize;
        let icons: Vec<_> = layout["icon_words"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_u64().unwrap() as usize)
            .collect();
        // The registry holds the header and the records. The tail holds the
        // picture scratch, the menu text, the live-view labels, the profile
        // table, and the Toning curves (abi::TAIL_SIZE).
        assert_eq!(
            words * 4,
            runtime::HEADER_SIZE + count * 0x1100,
            "count {count}"
        );
        // One TTL array holds the tail: at most 65536 words.
        let tail = layout["tail_words"].as_u64().unwrap() as usize;
        assert_eq!(tail * 4, grku_core::abi::TAIL_SIZE);
        assert!(tail <= grku_core::abi::MODULE_ARRAY_WORDS);
        assert_eq!(
            icons.iter().sum::<usize>() * 4,
            (count + runtime::HOST_ICON_COUNT) * 6408,
            "count {count}"
        );
        assert!(std::iter::once(&words)
            .chain(&icons)
            .all(|v| (1..=65536).contains(v)));
        // The host icons come first, then the effects, 40 icons in each
        // chunk. Module tiles follow the effects (runtime/installer.c).
        assert_eq!(
            icons.len(),
            (count + runtime::HOST_ICON_COUNT).div_ceil(40),
            "count {count}"
        );
    }
    assert!(runtime::layout(usize::MAX).is_err());
}

#[test]
fn duplicate_central_directory_entries_are_not_hidden_by_the_zip_index() {
    let original = package();
    let end = original.len() - 22;
    assert_eq!(&original[end..end + 4], b"PK\x05\x06");
    let start = u32::from_le_bytes(original[end + 16..end + 20].try_into().unwrap()) as usize;
    let variable: usize = [28, 30, 32]
        .iter()
        .map(|offset| {
            u16::from_le_bytes(
                original[start + offset..start + offset + 2]
                    .try_into()
                    .unwrap(),
            ) as usize
        })
        .sum();
    let record = &original[start..start + 46 + variable];
    let mut mutated = original[..end].to_vec();
    mutated.extend_from_slice(record);
    mutated.extend_from_slice(&original[end..]);
    let new_end = end + record.len();
    for offset in [8, 10] {
        let count = u16::from_le_bytes(
            mutated[new_end + offset..new_end + offset + 2]
                .try_into()
                .unwrap(),
        );
        mutated[new_end + offset..new_end + offset + 2].copy_from_slice(&(count + 1).to_le_bytes());
    }
    let size = u32::from_le_bytes(mutated[new_end + 12..new_end + 16].try_into().unwrap());
    mutated[new_end + 12..new_end + 16]
        .copy_from_slice(&(size + record.len() as u32).to_le_bytes());
    assert!(verify_package(&mutated).is_err());
}

#[test]
fn symlink_and_encrypted_entries_are_rejected() {
    for encrypted in [false, true] {
        let mut bytes = package();
        let end = bytes.len() - 22;
        let central = u32::from_le_bytes(bytes[end + 16..end + 20].try_into().unwrap()) as usize;
        if encrypted {
            bytes[central + 8] |= 1;
        } else {
            bytes[central + 5] = 3;
            bytes[central + 38..central + 42].copy_from_slice(&(0o120777u32 << 16).to_le_bytes());
        }
        assert!(verify_package(&bytes).is_err());
    }
}

#[test]
fn runtime_builds_must_match_their_manifest_exactly() {
    let files = runtime_fixture();
    let manifest = |files: &Files| testing::manifest("gr3-2.10", files);
    let runtime = load_runtime(&manifest(&files), &files).unwrap();
    assert_eq!(runtime.files(), &files);
    assert_eq!(runtime.target(), "gr3-2.10");

    let mut extra = files.clone();
    extra.insert("SCRIPT/EXTRA.SH".into(), b"x".to_vec());
    let mut missing = files.clone();
    missing.remove("SCRIPT/STARTUP.TTL");
    let mut changed = files.clone();
    changed.insert("SCRIPT/STARTUP.TTL".into(), b"changed".to_vec());
    for (actual, expected) in [
        (&extra, "differs from its manifest"),
        (&missing, "differs from its manifest"),
        (&changed, "hash or size mismatch"),
    ] {
        let message = format!("{:#}", load_runtime(&manifest(&files), actual).unwrap_err());
        assert!(message.contains(expected), "{message}");
    }
    let unknown = format!("{:#}", load_runtime(&manifest(&extra), &extra).unwrap_err());
    assert!(
        unknown.contains("Invalid runtime manifest entries"),
        "{unknown}"
    );
}

#[test]
fn each_camera_gets_its_modeset_file_and_guide() {
    let effects = testing::effect_set(&["test-effect"]);
    let gr3 = unpack(&package());
    let bytes = assemble(
        &gr3_runtimes(),
        &effects,
        &testing::official_modules(),
        &camera::GR3X,
        &english(),
    )
    .unwrap()
    .bytes;
    let verified = verify_package(&bytes).unwrap();
    assert_eq!(verified.camera.id, "gr3x");
    assert_eq!(verified.targets, ["gr3-2.10", "gr3-2.21"]);
    let gr3x = unpack(&bytes);
    assert!(gr3x.contains_key("SD_ROOT/00078490.609"));
    assert!(!gr3x.contains_key("SD_ROOT/00078350.588"));
    // The guide source names GR IIIx, GR IIIx HDF, and their ModeSet file.
    let guide = String::from_utf8(installation_guide(&camera::GR3X, Language::English)).unwrap();
    assert!(guide.contains("For RICOH GR IIIx and GR IIIx HDF firmware 1.60, 1.70, or 1.71 only."));
    assert!(guide.contains("`00078490.609`") && !guide.contains("00078350.588"));
    // The GR III guide is the resource with each release of its runtime build.
    assert_eq!(
        String::from_utf8(installation_guide(&camera::GR3, Language::English)).unwrap(),
        include_str!("../../../resources/INSTALLATION.md").replace(
            "GR III HDF firmware 2.10 only.",
            "GR III HDF firmware 2.10, 2.20, or 2.21 only."
        )
    );
    // Every runtime and effect file is the same for both cameras.
    for (name, blob) in &gr3 {
        if !name.ends_with(".588") && name != "SHA256SUMS" {
            assert_eq!(&gr3x[name], blob, "{name}");
        }
    }
}

#[test]
fn the_guide_names_the_camera_once_and_the_modeset_file_three_times() {
    // installation_guide replaces these strings, so each must occur exactly once.
    for (language, guide) in [
        (
            Language::English,
            include_str!("../../../resources/INSTALLATION.md"),
        ),
        (
            Language::SimplifiedChinese,
            include_str!("../../../resources/INSTALLATION.zh-Hans.md"),
        ),
        (
            Language::TraditionalChinese,
            include_str!("../../../resources/INSTALLATION.zh-Hant.md"),
        ),
        (
            Language::Japanese,
            include_str!("../../../resources/INSTALLATION.ja.md"),
        ),
        (
            Language::Korean,
            include_str!("../../../resources/INSTALLATION.ko.md"),
        ),
    ] {
        // The resource names the first GR III release; the package guide
        // names each release of the runtime build.
        let phrase = language.camera_phrase(&camera::GR3, &["2.10"]);
        assert_eq!(guide.matches(&phrase).count(), 1, "{phrase}");
        let source = String::from_utf8(installation_guide(&camera::GR3, language)).unwrap();
        let releases = language.camera_phrase(&camera::GR3, &["2.10", "2.20", "2.21"]);
        assert_eq!(source.matches(&releases).count(), 1, "{releases}");
        assert_eq!(guide.matches(camera::GR3.hdf).count(), 1, "{language:?}");
        // In the card picture after step 2, after the installation, and in the
        // steps that turn SD scripts off.
        assert_eq!(
            guide.matches(camera::GR3.modeset).count(),
            3,
            "{language:?}"
        );
    }
}

#[test]
fn the_gr4_guide_names_each_release_once() {
    // installation_guide replaces the phrase, so it must occur exactly once.
    for (language, guide) in [
        (
            Language::English,
            include_str!("../../../resources/INSTALLATION-GR4.md"),
        ),
        (
            Language::SimplifiedChinese,
            include_str!("../../../resources/INSTALLATION-GR4.zh-Hans.md"),
        ),
        (
            Language::TraditionalChinese,
            include_str!("../../../resources/INSTALLATION-GR4.zh-Hant.md"),
        ),
        (
            Language::Japanese,
            include_str!("../../../resources/INSTALLATION-GR4.ja.md"),
        ),
        (
            Language::Korean,
            include_str!("../../../resources/INSTALLATION-GR4.ko.md"),
        ),
    ] {
        let phrase = language.camera_phrase(&camera::GR4, &["1.11"]);
        assert_eq!(guide.matches(&phrase).count(), 1, "{phrase}");
        let source = String::from_utf8(installation_guide(&camera::GR4, language)).unwrap();
        let releases = language.camera_phrase(&camera::GR4, &["1.11", "1.20", "1.21"]);
        assert_eq!(source.matches(&releases).count(), 1, "{releases}");
    }
}

#[test]
fn a_package_has_the_guide_of_its_language_only() {
    let effects = testing::effect_set(&["test-effect"]);
    for language in Language::ALL {
        let bytes = assemble(
            &gr3_runtimes(),
            &effects,
            &testing::official_modules(),
            &camera::GR3X,
            &Guide { language, pdf: PDF },
        )
        .unwrap()
        .bytes;
        assert_eq!(verify_package(&bytes).unwrap().language, language);
        let files = unpack(&bytes);
        assert_eq!(files[&language.guide_path()], PDF);
        let guides = files.keys().filter(|name| name.ends_with(".pdf")).count();
        assert_eq!(guides, 1, "{language:?}");
        // The guide source names GR IIIx and GR IIIx HDF in each language.
        let source = String::from_utf8(installation_guide(&camera::GR3X, language)).unwrap();
        assert!(source.contains(&language.camera_phrase(&camera::GR3X, &["1.60", "1.70", "1.71"])));
        assert_eq!(source.matches(camera::GR3X.hdf).count(), 1, "{language:?}");
        assert!(!source.contains(camera::GR3.hdf));
        assert!(source.contains(camera::GR3X.modeset) && !source.contains(camera::GR3.modeset));
    }
    assert_eq!(
        Language::ALL.map(Language::guide_path),
        [
            "GRKU Installation Guide.pdf",
            "GRKU 安装指南.pdf",
            "GRKU 安裝指南.pdf",
            "GRKU インストールガイド.pdf",
            "GRKU 설치 가이드.pdf",
        ]
    );
    // The GR IV guide names each release of GR IV; each has its own build.
    assert_eq!(
        String::from_utf8(installation_guide(
            &camera::GR4,
            Language::TraditionalChinese
        ))
        .unwrap(),
        include_str!("../../../resources/INSTALLATION-GR4.zh-Hant.md").replace(
            "GR IV HDF 韌體 1.11。",
            "GR IV HDF 韌體 1.11、1.20 或 1.21。"
        )
    );
}

#[test]
fn a_package_has_exactly_one_pdf_guide() {
    let files = unpack(&package());
    let mut two = files.clone();
    two.insert(Language::SimplifiedChinese.guide_path(), PDF.to_vec());
    assert!(verify_package(&repack(&with_sums(two), CompressionMethod::Stored)).is_err());
    let mut none = files.clone();
    none.remove("GRKU Installation Guide.pdf");
    assert!(verify_package(&repack(&with_sums(none), CompressionMethod::Stored)).is_err());
    let mut text = files;
    text.insert("GRKU Installation Guide.pdf".into(), b"# GRKU\n".to_vec());
    assert!(verify_package(&repack(&with_sums(text), CompressionMethod::Stored)).is_err());
    let text_guide = Guide {
        language: Language::English,
        pdf: b"# GRKU\n",
    };
    assert!(assemble(
        &gr3_runtimes(),
        &EffectSet::default(),
        &testing::official_modules(),
        &camera::GR3,
        &text_guide,
    )
    .is_err());
    assert!(Language::parse("fr").is_err());
    assert_eq!(Language::parse("ja").unwrap(), Language::Japanese);
    assert_eq!(Language::parse("ko").unwrap(), Language::Korean);
}

#[test]
fn a_package_has_the_modeset_file_of_exactly_one_camera() {
    let mut files = unpack(&package());
    files.insert(
        "SD_ROOT/00078490.609".into(),
        files["SD_ROOT/00078350.588"].clone(),
    );
    assert!(validate_contents(&with_sums(files)).is_err());
    let mut files = unpack(&package());
    files.remove("SD_ROOT/00078350.588");
    assert!(validate_contents(&with_sums(files)).is_err());
    let mut files = unpack(&package());
    files.insert("SD_ROOT/00078350.588".into(), b"changed".to_vec());
    assert!(validate_contents(&with_sums(files)).is_err());
    assert!(camera::find("gr2").is_err());
    assert_eq!(camera::find("gr3x").unwrap(), &camera::GR3X);
    assert_eq!(camera::find("gr4").unwrap(), &camera::GR4);
}

fn gr4_runtimes() -> Vec<VerifiedRuntime> {
    testing::camera_runtimes(&camera::GR4)
}

#[test]
fn a_gr4_package_has_its_modeset_file_guide_and_modules() {
    let bytes = assemble(
        &gr4_runtimes(),
        &EffectSet::default(),
        &testing::official_modules(),
        &camera::GR4,
        &english(),
    )
    .unwrap()
    .bytes;
    let verified = verify_package(&bytes).unwrap();
    assert_eq!(verified.camera.id, "gr4");
    assert_eq!(
        verified.targets,
        ["gr4-1.11", "gr4-1.20", "gr4-1.20-0528", "gr4-1.21"]
    );
    let files = unpack(&bytes);
    assert!(files.contains_key("SD_ROOT/00078560.636"));
    assert_eq!(files["GRKU Installation Guide.pdf"], PDF);
    assert_eq!(
        String::from_utf8(installation_guide(&camera::GR4, Language::English)).unwrap(),
        include_str!("../../../resources/INSTALLATION-GR4.md").replace(
            "GR IV HDF firmware 1.11 only.",
            "GR IV HDF firmware 1.11, 1.20, or 1.21 only."
        )
    );
    // A GR III runtime does not run on GR IV.
    assert!(assemble(
        &gr3_runtimes(),
        &EffectSet::default(),
        &testing::official_modules(),
        &camera::GR4,
        &english()
    )
    .is_err());
    // GR IV has Image Control.
    let bytes = assemble(
        &gr4_runtimes(),
        &testing::effect_set(&["test-effect"]),
        &testing::official_modules(),
        &camera::GR4,
        &english(),
    )
    .unwrap()
    .bytes;
    assert_eq!(verify_package(&bytes).unwrap().effect_ids, ["test-effect"]);
    // Date Imprint alone without effects shows a menu.
    assert!(assemble(
        &gr4_runtimes(),
        &EffectSet::default(),
        &[testing::module("DATE")],
        &camera::GR4,
        &english()
    )
    .is_ok());
    assert!(assemble(
        &gr4_runtimes(),
        &EffectSet::default(),
        &[testing::module("FILMLOOK")],
        &camera::GR4,
        &english()
    )
    .is_err());
}

#[test]
fn scripts_off_packages_hold_only_the_disable_command_and_its_key() {
    for camera in camera::CAMERAS {
        let bytes = assemble_scripts_off(camera).unwrap();
        assert_eq!(bytes, assemble_scripts_off(camera).unwrap());
        let files = unpack(&bytes);
        let names: Vec<_> = files.keys().map(String::as_str).collect();
        let mut expected = [
            "SD_ROOT/DEVELOP.MOD".to_owned(),
            format!("SD_ROOT/{}", camera.modeset),
            "SHA256SUMS".to_owned(),
        ];
        expected.sort();
        assert_eq!(
            names,
            expected.iter().map(String::as_str).collect::<Vec<_>>()
        );
        assert_eq!(
            files[&format!("SD_ROOT/{}", camera.modeset)],
            b"[SCRIPT_EN_MODE DIS]\r\n"
        );
        // The same key file as the activation, which only the command differs from.
        let activation = runtime::activation_files(camera);
        assert_eq!(files["SD_ROOT/DEVELOP.MOD"], activation["DEVELOP.MOD"]);
        assert_eq!(activation[camera.modeset], b"[SCRIPT_EN_MODE EN]\r\n");
        // It holds no GRKU code, so it is not a GRKU package.
        assert!(verify_package(&bytes).is_err());
    }
}

#[test]
fn dump_packages_hold_the_tool_files_and_their_checksums() {
    let contents: Files = DUMP_FILES
        .iter()
        .map(|name| ((*name).to_owned(), name.as_bytes().to_vec()))
        .collect();
    let bytes = assemble_dump(contents.clone()).unwrap();
    assert_eq!(bytes, assemble_dump(contents.clone()).unwrap());
    let files = unpack(&bytes);
    let mut expected: Vec<_> = DUMP_FILES.iter().copied().chain(["SHA256SUMS"]).collect();
    expected.sort();
    assert_eq!(
        files.keys().map(String::as_str).collect::<Vec<_>>(),
        expected
    );
    let sums = String::from_utf8(files["SHA256SUMS"].clone()).unwrap();
    for name in DUMP_FILES {
        assert!(sums.contains(&format!("{}  {name}", sha256(name.as_bytes()))));
    }
    // The program and the script are executable on the card.
    let mut archive = ZipArchive::new(Cursor::new(&bytes)).unwrap();
    for (name, mode) in [
        ("SD_ROOT/SCRIPT/GRDUMP/DUMP.BIN", 0o755),
        ("SD_ROOT/SCRIPT/GRDUMP/DUMP.SH", 0o755),
        ("README.txt", 0o644),
    ] {
        assert_eq!(
            archive.by_name(name).unwrap().unix_mode().unwrap() & 0o777,
            mode
        );
    }
    // A missing, empty, or extra file is refused.
    let mut missing = contents.clone();
    missing.remove("README.txt");
    assert!(assemble_dump(missing).is_err());
    let mut empty = contents.clone();
    empty.insert("SD_ROOT/SCRIPT/GRDUMP/DUMP.BIN".into(), Vec::new());
    assert!(assemble_dump(empty).is_err());
    let mut extra = contents;
    extra.insert("SD_ROOT/SCRIPT/STARTUP.BAK".into(), b"x".to_vec());
    assert!(assemble_dump(extra).is_err());
}

/// A GR IV package has the installer of each GR IV build, in release order,
/// and the script that selects one at each power-on. A GR III package keeps
/// the single installer and script of earlier packages.
/// INSTALL.SH of a package with several builds tries the core of the last
/// start first, and keeps the core that installed. A record of another build,
/// after a firmware update, or of a name that the package does not hold, only
/// costs the check of that core.
#[cfg(unix)]
#[test]
fn install_tries_the_core_of_the_last_start_first() {
    let files = unpack(
        &assemble(
            &gr4_runtimes(),
            &EffectSet::default(),
            &testing::official_modules(),
            &camera::GR4,
            &english(),
        )
        .unwrap()
        .bytes,
    );
    let card = tempfile::tempdir().unwrap();
    let root = card.path().to_str().unwrap();
    let script = String::from_utf8(files["SD_ROOT/SCRIPT/GRKU/INSTALL.SH"].clone())
        .unwrap()
        .replace("/media/storage1", root)
        .replace("</proc/uptime", "</dev/null");
    let package = card.path().join("SCRIPT/GRKU");
    std::fs::create_dir_all(&package).unwrap();
    std::fs::create_dir_all(card.path().join("GRKU")).unwrap();
    std::fs::write(package.join("INSTALL.SH"), script).unwrap();
    // A stand-in core: it logs its run and installs only on its build.
    for (index, build) in ["1.11", "1.20", "0528", "1.21"].iter().enumerate() {
        let core = package.join(format!("CORE{}.BIN", index + 1));
        std::fs::write(
            &core,
            format!(
                "#!/bin/sh\necho CORE{} $1 >>{root}/RUNS\n[ \"$BUILD\" = {build} ] && exit 0\nexit 48\n",
                index + 1
            ),
        )
        .unwrap();
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&core, std::fs::Permissions::from_mode(0o755)).unwrap();
    }
    let start = |build: &str| {
        let _ = std::fs::remove_file(card.path().join("RUNS"));
        let output = std::process::Command::new("sh")
            .arg(package.join("INSTALL.SH"))
            .env("BUILD", build)
            .output()
            .unwrap();
        assert!(output.status.success(), "{output:?}");
        let runs = std::fs::read_to_string(card.path().join("RUNS")).unwrap_or_default();
        let record = std::fs::read_to_string(card.path().join("GRKU/CORE.TXT")).unwrap_or_default();
        (runs, record)
    };
    // The first start tries each core in order and keeps the one that installed.
    assert_eq!(
        start("0528"),
        (
            "CORE1 --known\nCORE2 --known\nCORE3 --known\n".into(),
            "CORE3.BIN\n".into()
        )
    );
    // The next start runs only that core.
    assert_eq!(
        start("0528"),
        ("CORE3 --known\n".into(), "CORE3.BIN\n".into())
    );
    // After a firmware update, the kept core is checked once, then the others.
    assert_eq!(
        start("1.20"),
        (
            "CORE3 --known\nCORE1 --known\nCORE2 --known\n".into(),
            "CORE2.BIN\n".into()
        )
    );
    // A record that names no core of the package runs nothing of it.
    std::fs::write(card.path().join("GRKU/CORE.TXT"), "../../bin/sh\n").unwrap();
    assert_eq!(
        start("1.11"),
        ("CORE1 --known\n".into(), "CORE1.BIN\n".into())
    );
    // A build that no core names keeps the record and goes on to --try.
    let (runs, record) = start("2.00");
    assert!(
        runs.starts_with(
            "CORE1 --known\nCORE2 --known\nCORE3 --known\nCORE4 --known\nCORE1 --try\n"
        ),
        "{runs}"
    );
    assert_eq!(record, "CORE1.BIN\n");
}

/// SCAN.SH of a package with several builds starts the core of the last
/// start first, as INSTALL.SH selects it, with the start modes, and runs
/// nothing while the lock of a start exists.
#[cfg(unix)]
#[test]
fn scan_starts_the_core_of_the_build_once() {
    let files = unpack(
        &assemble(
            &gr4_runtimes(),
            &EffectSet::default(),
            &testing::official_modules(),
            &camera::GR4,
            &english(),
        )
        .unwrap()
        .bytes,
    );
    let card = tempfile::tempdir().unwrap();
    let root = card.path().to_str().unwrap();
    let script = String::from_utf8(files["SD_ROOT/SCRIPT/GRKU/SCAN.SH"].clone())
        .unwrap()
        .replace("/media/storage1", root)
        .replace("</proc/uptime", "</dev/null")
        .replace("/tmp/grku-", &format!("{root}/tmp-grku-"));
    let package = card.path().join("SCRIPT/GRKU");
    std::fs::create_dir_all(&package).unwrap();
    std::fs::create_dir_all(card.path().join("GRKU")).unwrap();
    std::fs::write(package.join("SCAN.SH"), script).unwrap();
    // A stand-in core: it logs its run, and starts only on its build, where
    // it takes the lock of the start as the core does.
    for (index, build) in ["1.11", "1.20", "0528", "1.21"].iter().enumerate() {
        let core = package.join(format!("CORE{}.BIN", index + 1));
        std::fs::write(
            &core,
            format!(
                "#!/bin/sh\necho CORE{} $1 >>{root}/RUNS\n\
                 [ \"$BUILD\" = {build} ] && {{ : >{root}/tmp-grku-start.lck; exit 0; }}\n\
                 case $1 in --start-try) exit 47 ;; --start) exit 0 ;; esac\nexit 48\n",
                index + 1
            ),
        )
        .unwrap();
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&core, std::fs::Permissions::from_mode(0o755)).unwrap();
    }
    let start = |build: &str| {
        let _ = std::fs::remove_file(card.path().join("RUNS"));
        let output = std::process::Command::new("sh")
            .arg(package.join("SCAN.SH"))
            .env("BUILD", build)
            .output()
            .unwrap();
        assert!(output.status.success(), "{output:?}");
        let runs = std::fs::read_to_string(card.path().join("RUNS")).unwrap_or_default();
        let record = std::fs::read_to_string(card.path().join("GRKU/CORE.TXT")).unwrap_or_default();
        (runs, record)
    };
    let power_on = || {
        for name in ["tmp-grku-boot", "tmp-grku-start.lck", "tmp-grku-boot.log"] {
            let _ = std::fs::remove_file(card.path().join(name));
        }
    };
    // The first start tries each core in order and keeps the one that started.
    power_on();
    assert_eq!(
        start("0528"),
        (
            "CORE1 --start-known\nCORE2 --start-known\nCORE3 --start-known\n".into(),
            "CORE3.BIN\n".into()
        )
    );
    // The loader repeats SCAN.SH until the start answers: the lock of the
    // start keeps the repeat from running any core.
    assert_eq!(start("0528"), ("".into(), "CORE3.BIN\n".into()));
    assert!(card.path().join("tmp-grku-boot").exists());
    // The next power-on runs only the kept core.
    power_on();
    assert_eq!(
        start("0528"),
        ("CORE3 --start-known\n".into(), "CORE3.BIN\n".into())
    );
    // A build that no core names goes on to --start-try, then --start.
    power_on();
    let (runs, record) = start("2.00");
    assert_eq!(
        runs,
        "CORE3 --start-known\nCORE1 --start-known\nCORE2 --start-known\nCORE4 --start-known\n\
         CORE1 --start-try\nCORE2 --start-try\nCORE3 --start-try\nCORE4 --start\n"
    );
    assert_eq!(record, "CORE3.BIN\n");
    // The boot log of the start is in RAM, after the load line on the card.
    let log = std::fs::read_to_string(card.path().join("GRKU/BOOT.TXT")).unwrap();
    assert_eq!(log.lines().filter(|l| l.ends_with(" load")).count(), 3);
    let ram = std::fs::read_to_string(card.path().join("tmp-grku-boot.log")).unwrap();
    assert!(
        ram.contains(" start\n") && ram.contains(" started 0\n"),
        "{ram}"
    );
}

#[test]
fn a_package_holds_the_core_file_of_each_build_of_its_camera() {
    let gr4 = |runtimes: &[VerifiedRuntime]| {
        assemble(
            runtimes,
            &EffectSet::default(),
            &testing::official_modules(),
            &camera::GR4,
            &english(),
        )
        .map(|package| package.bytes)
    };
    let bytes = gr4(&gr4_runtimes()).unwrap();
    assert_eq!(
        verify_package(&bytes).unwrap().targets,
        ["gr4-1.11", "gr4-1.20", "gr4-1.20-0528", "gr4-1.21"]
    );
    let files = unpack(&bytes);
    for (path, target) in [
        ("SD_ROOT/SCRIPT/GRKU/CORE1.BIN", "gr4-1.11"),
        ("SD_ROOT/SCRIPT/GRKU/CORE2.BIN", "gr4-1.20"),
        ("SD_ROOT/SCRIPT/GRKU/CORE3.BIN", "gr4-1.20-0528"),
        ("SD_ROOT/SCRIPT/GRKU/CORE4.BIN", "gr4-1.21"),
    ] {
        assert_eq!(files[path], testing::marked_installer(target), "{path}");
    }
    // SCAN.SH starts the core once with --start, after the lookup of the
    // other core files and the selection of the core of the build, and leaves
    // when a start of this power-on runs. INSTALL.SH, the fallback, selects
    // as before with --known, --try, and --install, unless the process of the
    // start runs. SCAN.SH logs to the card once, then to RAM; INSTALL.SH to
    // the card.
    let text = |script: &[u8]| String::from_utf8(script.to_vec()).unwrap();
    let scan = text(&files["SD_ROOT/SCRIPT/GRKU/SCAN.SH"]);
    assert!(
        scan.starts_with(
            "mkdir -p /media/storage1/GRKU\n\
             if [ ! -e /tmp/grku-boot ]; then\n\
             \x20 : >/tmp/grku-boot\n\
             \x20 read t _ </proc/uptime; echo \"$t load\" >>/media/storage1/GRKU/BOOT.TXT\n\
             fi\n\
             [ -e /tmp/grku-start.lck ] && exit 0\n\
             read t _ </proc/uptime; echo \"$t start\" >>/tmp/grku-boot.log\n\
             for core in CORE2.BIN CORE3.BIN CORE4.BIN; do [ -e /media/storage1/SCRIPT/GRKU/$core ]; done\n\
             k=/media/storage1/GRKU/CORE.TXT\n"
        ),
        "{scan}"
    );
    for part in [
        "/media/storage1/SCRIPT/GRKU/$last --start-known; status=$?; used=$last ;; esac\n",
        "    /media/storage1/SCRIPT/GRKU/$core --start-known\n",
        "    /media/storage1/SCRIPT/GRKU/$core --start-try\n",
        "  case $status in 47) /media/storage1/SCRIPT/GRKU/CORE4.BIN --start; status=$? ;; esac\n",
        "read t _ </proc/uptime; echo \"$t started $status\" >>/tmp/grku-boot.log\n\
         echo GR_MODULE_START_EXIT_$status\n\
         if [ -e /media/storage1/GRKU/DIAG ]; then\n",
    ] {
        assert!(scan.contains(part), "{part}\n{scan}");
    }
    assert!(scan.ends_with("fi\nexit 0\n"), "{scan}");
    let install = text(&files["SD_ROOT/SCRIPT/GRKU/INSTALL.SH"]);
    assert!(
        install.starts_with(
            "p=; [ -e /tmp/grku-core.pid ] && read p _ </tmp/grku-core.pid\n\
             if [ -n \"$p\" ] && [ -d /proc/$p ]; then echo GR_MODULE_INSTALL_EXIT_3; exit 0; fi\n\
             read t _ </proc/uptime; echo \"$t install-start\" >>/media/storage1/GRKU/BOOT.TXT\n\
             k=/media/storage1/GRKU/CORE.TXT\n"
        ),
        "{install}"
    );
    for part in [
        "/media/storage1/SCRIPT/GRKU/$last --known; status=$?; used=$last ;; esac\n",
        "    /media/storage1/SCRIPT/GRKU/$core --try\n",
        "  case $status in 47) /media/storage1/SCRIPT/GRKU/CORE4.BIN --install; status=$? ;; esac\n",
    ] {
        assert!(install.contains(part), "{part}\n{install}");
    }
    assert!(
        install.ends_with(
            "read t _ </proc/uptime; echo \"$t install $status\" >>/media/storage1/GRKU/BOOT.TXT\n\
             echo GR_MODULE_INSTALL_EXIT_$status\n\
             exit 0\n"
        ),
        "{install}"
    );
    // A GR III package has a core file for 2.10 and one for 2.21, and its
    // scripts select the core of the build as those of GR IV do.
    let gr3 = unpack(&package());
    for (path, target) in [
        ("SD_ROOT/SCRIPT/GRKU/CORE1.BIN", "gr3-2.10"),
        ("SD_ROOT/SCRIPT/GRKU/CORE2.BIN", "gr3-2.21"),
    ] {
        assert_eq!(gr3[path], testing::marked_installer(target), "{path}");
    }
    assert!(!gr3.contains_key("SD_ROOT/SCRIPT/GRKU/CORE.BIN"));
    let scan = text(&gr3["SD_ROOT/SCRIPT/GRKU/SCAN.SH"]);
    for part in [
        "for core in CORE2.BIN; do [ -e /media/storage1/SCRIPT/GRKU/$core ]; done\n",
        "    /media/storage1/SCRIPT/GRKU/$core --start-known\n",
        "  case $status in 47) /media/storage1/SCRIPT/GRKU/CORE2.BIN --start; status=$? ;; esac\n",
    ] {
        assert!(scan.contains(part), "{part}\n{scan}");
    }
    let install = text(&gr3["SD_ROOT/SCRIPT/GRKU/INSTALL.SH"]);
    assert!(
        install.contains(
            "  case $status in 47) /media/storage1/SCRIPT/GRKU/CORE2.BIN --install; status=$? ;; esac\n"
        ),
        "{install}"
    );

    // Each build, in release order.
    let mut runtimes = gr4_runtimes();
    runtimes.swap(1, 2);
    assert!(format!("{:#}", gr4(&runtimes).unwrap_err()).contains("in release order"));
    // A package may leave out a build whose firmware the builder does not
    // have. It names the builds it has; one runtime gives one CORE.BIN, and
    // the scripts select among the core files it has.
    let partial = gr4(&gr4_runtimes()[..2]).unwrap();
    assert_eq!(
        verify_package(&partial).unwrap().targets,
        ["gr4-1.11", "gr4-1.20"]
    );
    let partial = unpack(&partial);
    assert!(partial.contains_key("SD_ROOT/SCRIPT/GRKU/CORE2.BIN"));
    assert!(!partial.contains_key("SD_ROOT/SCRIPT/GRKU/CORE3.BIN"));
    assert!(text(&partial["SD_ROOT/SCRIPT/GRKU/SCAN.SH"]).contains(
        "  case $status in 47) /media/storage1/SCRIPT/GRKU/CORE2.BIN --start; status=$? ;; esac\n"
    ));
    let single = gr4(&gr4_runtimes()[1..2]).unwrap();
    assert_eq!(verify_package(&single).unwrap().targets, ["gr4-1.20"]);
    let single = unpack(&single);
    assert!(single.contains_key("SD_ROOT/SCRIPT/GRKU/CORE.BIN"));
    assert!(!single.contains_key("SD_ROOT/SCRIPT/GRKU/CORE1.BIN"));
    let mut twice = gr4_runtimes();
    twice[1] = twice[0].clone();
    assert!(format!("{:#}", gr4(&twice[..2]).unwrap_err()).contains("each once"));
    // A GR III runtime does not run on GR IV.
    assert!(gr4(&gr3_runtimes()).is_err());
    // The installer and the build manifest must name the same build.
    let files = testing::runtime_files(&testing::marked_installer("gr4-1.20"), "gr4-1.20");
    let error = load_runtime(&testing::manifest("gr4-1.11", &files), &files).unwrap_err();
    assert!(error.to_string().contains("is the gr4-1.20 runtime"));

    // A package whose core files are swapped or missing is refused.
    let mut swapped = files_of(&bytes);
    let first = swapped["SD_ROOT/SCRIPT/GRKU/CORE1.BIN"].clone();
    let second = swapped["SD_ROOT/SCRIPT/GRKU/CORE2.BIN"].clone();
    swapped.insert("SD_ROOT/SCRIPT/GRKU/CORE1.BIN".into(), second);
    swapped.insert("SD_ROOT/SCRIPT/GRKU/CORE2.BIN".into(), first);
    assert!(validate_contents(&with_sums(swapped)).is_err());
    let mut missing = files_of(&bytes);
    missing.remove("SD_ROOT/SCRIPT/GRKU/CORE3.BIN");
    assert!(validate_contents(&with_sums(missing)).is_err());
}

/// The entries of a package without its checksums.
fn files_of(bytes: &[u8]) -> Files {
    let mut files = unpack(bytes);
    files.remove("SHA256SUMS");
    files
}

/// A package puts its effects in the inbox of SCRIPT/GRKU and lists its
/// effect and module files in PACKAGE.TXT. No package file is in GRKU, the
/// data folder.
#[test]
fn packages_list_their_files_and_keep_out_of_the_data_folder() {
    let files = unpack(&package());
    let effects: Vec<_> = files
        .keys()
        .filter_map(|name| name.strip_prefix("SD_ROOT/SCRIPT/GRKU/EFFECTS/"))
        .collect();
    assert_eq!(effects.len(), 1);
    assert!(files.keys().all(|name| !name.starts_with("SD_ROOT/GRKU/")));
    let list = String::from_utf8(files["SD_ROOT/SCRIPT/GRKU/PACKAGE.TXT"].clone()).unwrap();
    assert!(list.lines().any(|line| line == effects[0]));
    assert!(list.lines().any(|line| line.ends_with(".GRM")));
    let mut wrong = files.clone();
    wrong.insert("SD_ROOT/SCRIPT/GRKU/PACKAGE.TXT".into(), b"".to_vec());
    assert!(validate_contents(&with_sums(wrong)).is_err());
}

#[test]
fn module_files_install_from_the_modules_folder() {
    let package = assemble(
        &gr3_runtimes(),
        &EffectSet::default(),
        &[testing::module("GUIDES")],
        &camera::GR3,
        &english(),
    )
    .unwrap();
    // A module shows a page, so a package with only a module is valid.
    assert_eq!(package.contents.modules, ["GUIDES"]);
    let files = unpack(&package.bytes);
    assert!(files.contains_key("SD_ROOT/SCRIPT/GRKU/MODULES/GUIDES.GRM"));
    // The file name is the module ID, and the file must decode.
    let mut renamed = files.clone();
    let module = renamed
        .remove("SD_ROOT/SCRIPT/GRKU/MODULES/GUIDES.GRM")
        .unwrap();
    renamed.insert("SD_ROOT/SCRIPT/GRKU/MODULES/OTHER.GRM".into(), module);
    assert!(validate_contents(&with_sums(renamed)).is_err());
    let mut broken = files.clone();
    broken.insert(
        "SD_ROOT/SCRIPT/GRKU/MODULES/GUIDES.GRM".into(),
        b"GRKM".to_vec(),
    );
    assert!(validate_contents(&with_sums(broken)).is_err());
    // The same module cannot be in a package twice.
    assert!(assemble(
        &gr3_runtimes(),
        &EffectSet::default(),
        &[testing::module("GUIDES"), testing::module("GUIDES")],
        &camera::GR3,
        &english(),
    )
    .is_err());
    // GRKU lists at most MODULES_MAX modules, so a package holds no more.
    let ids: Vec<String> = (0..=grku_core::runtime::MODULES_MAX)
        .map(|n| format!("MOD{n}"))
        .collect();
    let modules: Vec<_> = ids.iter().map(|id| testing::module(id)).collect();
    let package = |modules: &[Vec<u8>]| {
        assemble(
            &gr3_runtimes(),
            &EffectSet::default(),
            modules,
            &camera::GR3,
            &english(),
        )
    };
    assert!(package(&modules[..grku_core::runtime::MODULES_MAX]).is_ok());
    let error = package(&modules).unwrap_err();
    let limit = format!("at most {} modules", grku_core::runtime::MODULES_MAX);
    assert!(error.to_string().contains(&limit), "{error}");
}

/// Only placement headers are needed by package preflight. Installer tests
/// cover the setting and icon descriptors that follow them in real modules.
fn indicator_module(id: &str, placements: &[(u32, u32)]) -> Vec<u8> {
    let count = placements.len();
    let mut code = vec![0; 40 + count * (8 + 24)];
    let mut put = |offset: usize, value: u32| {
        code[offset..offset + 4].copy_from_slice(&value.to_le_bytes());
    };
    put(0, 40);
    put(
        4,
        grku_core::grm::ABI_MAJOR << 16 | grku_core::grm::ABI_MINOR,
    );
    put(8, 40);
    put(12, count as u32);
    let mut relocations = vec![8];
    for (index, &(placement, slot)) in placements.iter().enumerate() {
        let entry = 40 + index * 8;
        let descriptor = 40 + count * 8 + index * 24;
        put(entry, 5);
        put(entry + 4, descriptor as u32);
        put(descriptor, 24);
        put(descriptor + 4, placement);
        put(descriptor + 8, slot);
        relocations.push((entry + 4) as u32);
    }
    grku_core::grm::Module {
        id: id.into(),
        code,
        code_relocations: relocations,
        ..Default::default()
    }
    .encode()
    .unwrap()
}

#[test]
fn package_viewfinder_capacity_is_checked_across_modules() {
    let build = |modules: &[Vec<u8>]| {
        assemble(
            &gr3_runtimes(),
            &EffectSet::default(),
            modules,
            &camera::GR3,
            &english(),
        )
    };
    let first = indicator_module("FIRST", &[(2, 0); 3]);
    let second = indicator_module("SECOND", &[(2, 0); 3]);
    let valid = build(&[first.clone(), second]).unwrap();
    assert_eq!(valid.contents.modules, ["FIRST", "SECOND"]);

    let second = indicator_module("SECOND", &[(2, 0); 4]);
    let error = build(&[first, second.clone()]).unwrap_err().to_string();
    assert!(
        error.contains("capacity of 6") && error.contains("SECOND"),
        "{error}"
    );

    // Imported ZIP verification uses the same preflight as assembly.
    let mut files = unpack(&valid.bytes);
    files.insert("SD_ROOT/SCRIPT/GRKU/MODULES/SECOND.GRM".into(), second);
    let bytes = repack(&with_sums(files), CompressionMethod::Stored);
    assert!(verify_package(&bytes)
        .unwrap_err()
        .to_string()
        .contains("capacity of 6"));
}

#[test]
fn package_viewfinder_slots_have_one_owner() {
    let build = |modules: &[Vec<u8>]| {
        assemble(
            &gr3_runtimes(),
            &EffectSet::default(),
            modules,
            &camera::GR3,
            &english(),
        )
    };
    let first = indicator_module("FIRST", &[(1, 1)]);
    let second = indicator_module("SECOND", &[(2, 0); 5]);
    assert!(build(&[first.clone(), second]).is_ok());
    let second = indicator_module("SECOND", &[(1, 1)]);
    let error = build(&[first, second]).unwrap_err().to_string();
    assert!(
        error.contains("image_control") && error.contains("FIRST") && error.contains("SECOND"),
        "{error}"
    );
    let error = build(&[indicator_module("FIRST", &[(1, 1), (1, 1)])])
        .unwrap_err()
        .to_string();
    assert!(
        error.contains("image_control") && error.contains("FIRST"),
        "{error}"
    );
}

#[test]
fn package_viewfinder_descriptors_are_bounded_before_reading() {
    for (offset, value) in [(8, u32::MAX - 3), (12, 17), (44, u32::MAX - 3), (56, 3)] {
        let mut module =
            grku_core::grm::Module::decode(&indicator_module("BROKEN", &[(2, 0)])).unwrap();
        module.code[offset..offset + 4].copy_from_slice(&value.to_le_bytes());
        // Keep a malformed pointer out of relocation validation to exercise
        // the descriptor reader, as an untrusted file can do.
        module.code_relocations.retain(|&at| at != offset as u32);
        let error = assemble(
            &gr3_runtimes(),
            &EffectSet::default(),
            &[module.encode().unwrap()],
            &camera::GR3,
            &english(),
        )
        .unwrap_err();
        assert!(
            error
                .to_string()
                .contains("viewfinder indicators of BROKEN"),
            "{error:#}"
        );
    }
}

#[test]
fn package_files_gives_the_card_files_of_a_package_from_any_release() {
    let files = unpack(&package());
    let card = package_files(&package()).unwrap();
    assert_eq!(card, card_files(&package()).unwrap());
    assert!(card
        .keys()
        .any(|path| path.starts_with("SCRIPT/GRKU/EFFECTS/") && path.ends_with(".GRF")));

    // A runtime that this version does not know, as in a ZIP of an older release, fails the
    // package checks but still gives the files.
    let mut older = files.clone();
    older.retain(|name, _| !name.ends_with(".BIN"));
    let older = repack(&older, CompressionMethod::Deflated);
    assert!(verify_package(&older).is_err());
    let kept = package_files(&older).unwrap();
    assert!(kept
        .keys()
        .all(|path| card.contains_key(path) && !path.ends_with(".BIN")));
    assert_eq!(
        kept.len(),
        files
            .keys()
            .filter(|name| name.starts_with("SD_ROOT/") && !name.ends_with(".BIN"))
            .count()
    );

    // Entries outside SD_ROOT are left out, and a file that is not a ZIP fails.
    let mut other = Files::new();
    other.insert("LICENSES.md".into(), b"licenses".to_vec());
    assert!(package_files(&repack(&other, CompressionMethod::Stored))
        .unwrap()
        .is_empty());
    assert!(package_files(b"not a zip").is_err());
}

#[test]
fn a_package_keeps_the_import_library_that_the_camera_does_not_install() {
    use grku_core::{card::IMPORTS_FILE, imports};
    let library = imports::encode(&[
        imports::Import {
            details: "{}".into(),
            effect: testing::effect("lut-warm"),
        },
        imports::Import {
            details: "{}".into(),
            effect: testing::effect("lut-cold"),
        },
    ])
    .unwrap();
    let built = assemble_with(
        &gr3_runtimes(),
        &testing::effect_set(&["test-effect"]),
        &testing::official_modules(),
        &camera::GR3,
        &english(),
        Extras {
            imports: Some(&library),
            ..Extras::default()
        },
    )
    .unwrap();
    // The library holds more imports than the package installs, and the list leaves it out.
    assert_eq!(built.contents.imports, 2);
    assert_eq!(built.contents.effect_ids, ["test-effect"]);
    let files = unpack(&built.bytes);
    assert_eq!(files[&format!("SD_ROOT/{IMPORTS_FILE}")], library);
    let list = String::from_utf8(files[&format!("SD_ROOT/{PACKAGE_LIST}")].clone()).unwrap();
    assert!(!list.contains("IMPORTS"));
    assert_eq!(verify_package(&built.bytes).unwrap().imports, 2);
    assert_eq!(verify_package(&package()).unwrap().imports, 0);

    // A damaged library fails the package checks.
    let mut damaged = files.clone();
    damaged.insert(format!("SD_ROOT/{IMPORTS_FILE}"), b"GRKIMP01".to_vec());
    assert!(verify_package(&repack(&with_sums(damaged), CompressionMethod::Stored)).is_err());
}

/// A runtime build has the fast-boot files of each release that it runs, and
/// a package has those of its camera, with their install files and a loader
/// that runs them.
#[test]
fn a_package_holds_the_fast_boot_files_of_its_camera() {
    // The files of a release: the prefix, then the release number.
    let names = |bytes: &[u8], prefix: &str| -> Vec<String> {
        files_of(bytes)
            .keys()
            .filter_map(|path| path.strip_prefix(&format!("SD_ROOT/SCRIPT/GRKU/{prefix}")))
            .filter(|name| name.starts_with(|c: char| c.is_ascii_digit()))
            .map(|name| format!("{prefix}{name}"))
            .collect()
    };
    let gr3 = testing::fast_runtime("gr3-2.10");
    for name in ["F588210", "F588220", "F609160", "F609170"] {
        assert!(gr3.files().contains_key(&format!("SCRIPT/GRKU/{name}.BIN")));
    }
    let package = |runtimes: &[VerifiedRuntime], camera: &camera::Camera| {
        assemble(
            runtimes,
            &EffectSet::default(),
            &testing::official_modules(),
            camera,
            &english(),
        )
        .unwrap()
        .bytes
    };
    let cases = [
        (
            &camera::GR3,
            vec![gr3.clone(), testing::fast_runtime("gr3-2.21")],
            vec!["F588210.BIN", "F588220.BIN", "F588221.BIN"],
        ),
        (
            &camera::GR3X,
            vec![gr3.clone(), testing::fast_runtime("gr3-2.21")],
            vec!["F609160.BIN", "F609170.BIN", "F609171.BIN"],
        ),
        (
            &camera::GR4,
            vec![
                testing::fast_runtime("gr4-1.11"),
                testing::fast_runtime("gr4-1.20"),
                testing::marked_runtime("gr4-1.20-0528"),
                testing::fast_runtime("gr4-1.21"),
            ],
            vec!["F636111.BIN", "F636120.BIN", "F636121.BIN"],
        ),
    ];
    for (camera, runtimes, expected) in cases {
        let bytes = package(&runtimes, camera);
        let expected: Vec<String> = expected.into_iter().map(String::from).collect();
        let installs: Vec<String> = expected
            .iter()
            .map(|name| name.replacen('F', "I", 1))
            .collect();
        assert_eq!(names(&bytes, "F"), expected, "{}", camera.name);
        assert_eq!(names(&bytes, "I"), installs, "{}", camera.name);
        let files = files_of(&bytes);
        assert!(!files.contains_key("SD_ROOT/SCRIPT/GRKU/FRUN.BIN"));
        let loader = String::from_utf8(files["SD_ROOT/SCRIPT/GRKU/LOADER.TTL"].clone()).unwrap();
        for (name, install) in expected.iter().zip(&installs) {
            let fast = &files[&format!("SD_ROOT/SCRIPT/GRKU/{name}")];
            assert_eq!(
                files[&format!("SD_ROOT/SCRIPT/GRKU/{install}")],
                runtime::install_file(fast).unwrap()
            );
            for file in [name, install] {
                assert!(
                    loader.contains(&format!("SYS_memovr C:\\SCRIPT\\GRKU\\{file} 0 call")),
                    "{file}"
                );
            }
        }
        verify_package(&bytes).unwrap();

        // A package without the fast-boot files is still a package.
        let mut plain = files.clone();
        plain.retain(|path, _| {
            let path = path.trim_start_matches("SD_ROOT/");
            runtime::FastRelease::of_path(path).is_none()
                && runtime::FastRelease::of_install_path(path).is_none()
        });
        assert!(validate_contents(&with_sums(plain.clone())).is_err());
        let plain_loader = runtime::package_runtime_files(
            &camera
                .targets()
                .iter()
                .enumerate()
                .map(|(index, _)| {
                    files[&format!(
                        "SD_ROOT/{}",
                        runtime::core_path_of(index, camera.targets().len())
                    )]
                        .as_slice()
                })
                .collect::<Vec<_>>(),
            runtime::icon_stride(camera.targets()[0]).unwrap(),
        )[card_loader()]
        .clone();
        plain.insert(format!("SD_ROOT/{}", card_loader()), plain_loader);
        validate_contents(&with_sums(plain)).unwrap();

        // A fast-boot file of another camera, a missing install file, or
        // another install file is refused.
        let mut foreign = files.clone();
        let other = if camera.id == "gr3" {
            "F609160.BIN"
        } else {
            "F588210.BIN"
        };
        let release = runtime::FastRelease::of_path(&format!("SCRIPT/GRKU/{other}")).unwrap();
        foreign.insert(
            format!("SD_ROOT/SCRIPT/GRKU/{other}"),
            testing::fast_file(&release),
        );
        assert!(validate_contents(&with_sums(foreign)).is_err());
        let install = format!("SD_ROOT/SCRIPT/GRKU/{}", installs[0]);
        let mut no_install = files.clone();
        no_install.remove(&install);
        assert!(validate_contents(&with_sums(no_install)).is_err());
        let mut changed = files.clone();
        changed.get_mut(&install).unwrap()[0] ^= 1;
        assert!(validate_contents(&with_sums(changed)).is_err());
    }

    // A fast-boot file must be that of its build, with its own path.
    let mut files = gr3.files().clone();
    let release = runtime::FastRelease::new(&camera::GR4, "1.11").unwrap();
    files.insert(release.path(), testing::fast_file(&release));
    assert!(load_runtime(&testing::manifest("gr3-2.10", &files), &files).is_err());
    let mut files = gr3.files().clone();
    let path = "SCRIPT/GRKU/F588220.BIN";
    let moved = files["SCRIPT/GRKU/F588210.BIN"].clone();
    files.insert(path.into(), moved);
    assert!(load_runtime(&testing::manifest("gr3-2.10", &files), &files).is_err());
}

fn card_loader() -> &'static str {
    grku_core::card::LOADER_FILE
}

/// A package can hold the recipe library of its camera line in its package
/// folder, which INSTALL copies to the data folder. A recipe of another
/// camera line fails the check.
#[test]
fn a_package_holds_the_recipe_library_of_its_camera() {
    use grku_core::recipes::{encode, Exposure, Family, Look, Recipe};
    let recipe = |family| Recipe {
        name: "Street".into(),
        family,
        look: Look::Off,
        grain: None,
        glow: None,
        white_balance: None,
        corrections: [None; 4],
        exposure: Exposure::default(),
        enabled: true,
        hidden: false,
        number: 0,
        id: 0,
    };
    let library = encode(
        &[recipe(Family::Gr3), recipe(Family::Gr3)],
        &Default::default(),
    )
    .unwrap();
    let with_library = assemble_with(
        &gr3_runtimes(),
        &testing::effect_set(&["test-effect"]),
        &testing::official_modules(),
        &camera::GR3,
        &english(),
        Extras {
            recipes: Some(&library),
            ..Extras::default()
        },
    )
    .unwrap();
    assert_eq!(with_library.contents.recipes, 2);
    // The package folder holds the library; no package file is in the data
    // folder, so a copy that replaces folders keeps the state of the person.
    let files = card_files(&with_library.bytes).unwrap();
    assert_eq!(files[RECIPES_PACKAGE_PATH], library);
    assert!(!files.contains_key(RECIPES_PATH));
    assert!(files.keys().all(|path| !path.starts_with("GRKU/")));
    let other = encode(&[recipe(Family::Gr4)], &Default::default()).unwrap();
    let error = assemble_with(
        &gr3_runtimes(),
        &testing::effect_set(&["test-effect"]),
        &testing::official_modules(),
        &camera::GR3,
        &english(),
        Extras {
            recipes: Some(&other),
            ..Extras::default()
        },
    )
    .unwrap_err();
    assert!(format!("{error:#}").contains("another camera"), "{error:#}");
    assert_eq!(verify_package(&package()).unwrap().recipes, 0);
}
