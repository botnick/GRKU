//! The generated module of the site for recipes.

use super::presets;
use crate::native;
use std::fmt::Write;

/// `web/src/generated/recipes.ts`: the recipes that the site offers, and the
/// camera names of the native types in each site language.
fn site_module() -> String {
    use crate::language::Language;
    let mut out = String::from(
        "// Generated from crates/grku-core/src/recipes/. Do not edit: change the\n\
         // presets there, then run\n\
         // GRKU_UPDATE_GENERATED=1 cargo test -p grku-core --test generated.\n\n\
         import type { Preset } from '../recipes';\n\n\
         /** The recipes that the site offers. */\n\
         export const PRESETS: readonly Preset[] = ",
    );
    out.push_str(&serde_json::to_string_pretty(&presets()).unwrap());
    // The names of the stored values that a recipe shows: the nine levels of
    // a native look in portable order, the white balance modes of GR III and
    // GR IV, and the values of each correction setting.
    let levels: Vec<&str> = native::TYPES[0].families[0]
        .map_or(&[][..], |(_, keys)| keys)
        .to_vec();
    let modes: Vec<[Option<&str>; 2]> = native::WHITE_BALANCE
        .iter()
        .map(|mode| mode.labels)
        .collect();
    let corrections: Vec<Vec<&str>> = native::CORRECTIONS
        .iter()
        .map(|correction| correction.labels.labels.to_vec())
        .collect();
    writeln!(
        out,
        ";\n\n/** The levels of a native look in portable order (`native::TYPES`). */\n\
         export const LEVEL_KEYS: readonly string[] = {};\n\n\
         /** The labels of each white balance mode in portable order: GR III, then GR IV, or null. */\n\
         export const WHITE_BALANCE_MODES: readonly (readonly (string | null)[])[] = {};\n\n\
         /** The labels of the stored values of each correction setting, in portable order. */\n\
         export const CORRECTION_VALUES: readonly (readonly string[])[] = {};",
        serde_json::to_string(&levels).unwrap(),
        serde_json::to_string(&modes).unwrap(),
        serde_json::to_string(&corrections).unwrap(),
    )
    .unwrap();
    out.push_str(
        "\n/** The camera names of the types in each site language, by portable index. */\n",
    );
    out.push_str("export const TYPE_NAMES: Readonly<Record<string, readonly string[]>> = {\n");
    for language in Language::ALL {
        let names = serde_json::to_string(crate::menu_text::native_type_names(language)).unwrap();
        writeln!(out, "  '{}': {names},", language.code()).unwrap();
    }
    out.push_str("};\n");
    // The tables of the recipe editor of the site: which camera line has each
    // type, the Monochrome types, the ISO steps and the highest ISO of each
    // line, the exposure compensation range, the color temperature range, and
    // the count of white balance shift steps.
    let families: Vec<[bool; 2]> = native::TYPES
        .iter()
        .map(|image_type| {
            [
                image_type.families[0].is_some(),
                image_type.families[1].is_some(),
            ]
        })
        .collect();
    let monochrome: Vec<bool> = native::TYPES
        .iter()
        .map(|image_type| image_type.monochrome)
        .collect();
    writeln!(
        out,
        "\n/** Whether GR III, then GR IV, has each type, by portable index. */\n\
         export const TYPE_FAMILIES: readonly (readonly [boolean, boolean])[] = {};\n\n\
         /** The types of GR IV Monochrome, by portable index. */\n\
         export const TYPE_MONOCHROME: readonly boolean[] = {};\n\n\
         /** The nominal ISO of each third stop from ISO 100. */\n\
         export const ISO_STEPS: readonly number[] = {};\n\n\
         /** The highest ISO of each camera line. */\n\
         export const ISO_MAX = {{ gr3: {}, gr4: {} }} as const;\n\n\
         /** The largest exposure compensation, in thirds of a stop. */\n\
         export const EXPOSURE_THIRDS_MAX = {};\n\n\
         /** The color temperature range of the Color Temperature white balance, in kelvin. */\n\
         export const TEMPERATURE = {{ min: {}, max: {}, step: {} }} as const;\n\n\
         /** The count of white balance shift steps on each axis; the middle one is no shift. */\n\
         export const SHIFT_STEPS = {};",
        serde_json::to_string(&families).unwrap(),
        serde_json::to_string(&monochrome).unwrap(),
        serde_json::to_string(&native::ISO_STEPS[..]).unwrap(),
        native::Family::Gr3.iso_max(),
        native::Family::Gr4.iso_max(),
        native::EXPOSURE_THIRDS_MAX,
        native::TEMPERATURE_MIN,
        native::TEMPERATURE_MAX,
        native::TEMPERATURE_STEP,
        native::SHIFT_BA.labels.len(),
    )
    .unwrap();
    out
}

/// The generated files, as paths from the repository root and contents.
pub fn generated() -> Vec<(&'static str, String)> {
    vec![("web/src/generated/recipes.ts", site_module())]
}
