//! The recipes that the site offers.

use super::{effect_code, Exposure, Family, Glow, Grain, Look, NativeLook, Recipe, WhiteBalance};
use crate::native;
use serde::Serialize;

/// A recipe that the site offers: its ID, the effect that it uses, and the
/// recipe for each camera line that can hold it. Other recipes come from the
/// camera.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    pub id: &'static str,
    /// The ID of the effect of the look, which the package must hold.
    pub effect: Option<&'static str>,
    /// The person who made a community recipe, and the post where they
    /// shared it, or `None` for a recipe of GRKU.
    pub author: Option<&'static str>,
    pub source: Option<&'static str>,
    pub recipes: Vec<Recipe>,
}

/// The white balance and the correction settings of a recipe that sets no
/// others: Auto with no shift, highlight and shadow correction Auto,
/// peripheral illumination correction Off, and high-ISO noise reduction
/// Auto. A preset holds each setting of the look (runtime/recipes.h), so it
/// gives the same picture after any other recipe.
const AUTO_WHITE_BALANCE: WhiteBalance = WhiteBalance {
    mode: 0,
    shift_ba: 14,
    shift_gm: 14,
    kelvin: 5500,
};
const NEUTRAL_CORRECTIONS: [Option<u8>; 4] = [Some(0), Some(0), Some(0), Some(0)];
const GRAIN_OFF: Grain = Grain { level: 0, size: 0 };
const GLOW_OFF: Glow = Glow {
    bloom: 0,
    halation: 0,
    halation_color: Some(0),
};

/// A community recipe of a native Image Control type, with its settings as
/// its source gives them and the camera menus show them. A setting that the
/// source does not give takes the neutral value of `AUTO_WHITE_BALANCE` and
/// `NEUTRAL_CORRECTIONS`. It has no GRKU Grain or Glow.
struct Native {
    name: &'static str,
    /// The label of the type (`native::TYPES`).
    image_type: &'static str,
    /// The nine levels, -4 to +4, in portable order: saturation, hue, key,
    /// contrast, highlight contrast, shadow contrast, sharpness, shading,
    /// and clarity. A level that the type does not have is 0.
    levels: [i8; 9],
    /// The label of the value of the tone parameter of the type, if it has
    /// one: "OFF" of Toning, or "Mid" of the Cinema tone.
    tone: Option<&'static str>,
    /// The native grain in portable values: strength 0 (Off) to 3 (High),
    /// and size 0 (Small) to 2 (Large). GR III has one size, 0, so a recipe
    /// of both lines has size 0 on GR IV too.
    grain: (u8, u8),
    /// The label of the white balance mode (`native::WHITE_BALANCE`), its
    /// A-B shift (A positive) and G-M shift (M positive) in steps, and the
    /// color temperature of `ColorTemp1`.
    white_balance: (&'static str, i8, i8, u32),
    /// The labels of the highlight correction, the shadow correction, the
    /// peripheral illumination correction, and the high-ISO noise reduction
    /// (`native::CORRECTIONS`).
    corrections: [&'static str; 4],
}

impl Native {
    /// The recipes of the lines.
    fn recipes(&self, lines: &[Family]) -> Vec<Recipe> {
        lines.iter().map(|&family| self.recipe(family)).collect()
    }

    fn recipe(&self, family: Family) -> Recipe {
        let image_type = native::TYPES
            .iter()
            .position(|t| t.label == self.image_type)
            .unwrap_or_else(|| panic!("no type {}", self.image_type));
        let native_family = family.native();
        // The tone parameter of the type in the family: one of the
        // ColorTone parameters.
        let tone = self.tone.map_or(0, |label| {
            let parameter = (0..native::PARAMETERS.len())
                .find(|&p| {
                    native::PARAMETERS[p].key.starts_with("ColorTone")
                        && native::parameter_name(native_family, image_type, p).is_some()
                })
                .unwrap_or_else(|| panic!("{} has no tone", self.image_type));
            let labels = native::type_parameter_labels(native_family, image_type, parameter)
                .unwrap_or_else(|| panic!("{} has no tone labels", self.image_type));
            stored(&labels, label)
        });
        let (mode, ba, gm, kelvin) = self.white_balance;
        let mode = native::WHITE_BALANCE
            .iter()
            .position(|m| m.labels.contains(&Some(mode)))
            .unwrap_or_else(|| panic!("no white balance mode {mode}"));
        Recipe {
            name: self.name.into(),
            family,
            look: Look::Native(NativeLook {
                image_type,
                levels: self.levels.map(|level| (level + 4) as u8),
                tone,
                intensity: 0,
                filter: 0,
                grain_strength: self.grain.0,
                grain_size: self.grain.1,
                solarization: 0,
            }),
            grain: Some(GRAIN_OFF),
            glow: Some(GLOW_OFF),
            grain_style: None,
            // A preset keeps the border of the camera.
            border: None,
            white_balance: Some(WhiteBalance {
                mode,
                shift_ba: (ba + 14) as u8,
                shift_gm: (gm + 14) as u8,
                kelvin,
            }),
            corrections: std::array::from_fn(|n| {
                Some(stored(&native::CORRECTIONS[n].labels, self.corrections[n]))
            }),
            exposure: Exposure::default(),
            enabled: true,
            hidden: false,
            number: 0,
            id: 0,
        }
    }
}

/// The stored value of a label.
fn stored(labels: &native::Labels, label: &str) -> u8 {
    labels
        .values()
        .find(|(name, _)| *name == label)
        .map(|(_, value)| value as u8)
        .unwrap_or_else(|| panic!("no label {label}"))
}

/// The recipes that the site offers.
pub fn presets() -> Vec<Preset> {
    // CineStill 800T is Vision3 500T without its anti-halation layer: the
    // film look and a red halation close around the lights, without the
    // wide glow of Bloom. The film is balanced for tungsten light. Auto white
    // balance shifted to B10 (about 30 mired toward blue) puts night scenes
    // in the colors of CineStill 800T scans and keeps daylight usable, where
    // a fixed 3200 K turns blue. Shadow correction Off keeps the deep
    // shadows, peripheral illumination correction Off keeps the falloff of
    // the lens, and high-ISO noise reduction Low keeps the texture under the
    // Grain.
    let cinestill = |family| Recipe {
        name: "CineStill 800T".into(),
        family,
        look: Look::Effect {
            code: effect_code("vision3-500t-supra-v1"),
            adjustments: [0; 9],
        },
        grain: Some(Grain { level: 2, size: 0 }),
        glow: Some(Glow {
            bloom: 0,
            halation: 2,
            halation_color: Some(0),
        }),
        grain_style: None,
        // A preset keeps the border of the camera.
        border: None,
        white_balance: Some(WhiteBalance {
            shift_ba: CINESTILL_SHIFT_BA,
            ..AUTO_WHITE_BALANCE
        }),
        // Highlight Auto, shadow Off, peripheral illumination Off, NR Low.
        corrections: [Some(0), Some(4), Some(0), Some(1)],
        exposure: Exposure::default(),
        enabled: true,
        hidden: false,
        number: 0,
        id: 0,
    };
    // A community recipe of Negative Film with its nine levels as the camera
    // shows them, -4 to +4, the Auto white balance with its shifts (stored
    // 14 is none), and the highlight and shadow corrections, for each color
    // line: GR III and GR IV have Negative Film with the same nine levels.
    // It has no GRKU Grain or Glow.
    let negative =
        |name: &str, levels: [i8; 9], shift_gm: i8, shift_ba: i8, corrections: [u8; 2]| {
            COLOR_LINES
                .map(|family| Recipe {
                    name: name.into(),
                    family,
                    look: Look::Native(NativeLook {
                        image_type: NEGATIVE_FILM,
                        levels: levels.map(|level| (level + 4) as u8),
                        tone: 0,
                        intensity: 0,
                        filter: 0,
                        grain_strength: 0,
                        grain_size: 0,
                        solarization: 0,
                    }),
                    grain: Some(GRAIN_OFF),
                    glow: Some(GLOW_OFF),
                    grain_style: None,
                    border: None,
                    white_balance: Some(WhiteBalance {
                        shift_ba: (shift_ba + 14) as u8,
                        shift_gm: (shift_gm + 14) as u8,
                        ..AUTO_WHITE_BALANCE
                    }),
                    corrections: [
                        Some(corrections[0]),
                        Some(corrections[1]),
                        NEUTRAL_CORRECTIONS[2],
                        NEUTRAL_CORRECTIONS[3],
                    ],
                    exposure: Exposure::default(),
                    enabled: true,
                    hidden: false,
                    number: 0,
                    id: 0,
                })
                .to_vec()
        };
    vec![
        // Highlight correction On, shadow correction Off; AWB G2 A14.
        Preset {
            id: "bennet-800",
            effect: None,
            author: Some("Bennet"),
            source: Some("https://www.reddit.com/r/ricohGR/comments/1k27hmk/"),
            recipes: negative(
                "Bennet 800",
                [3, -1, 0, 2, -2, -4, 0, 0, -1],
                -2,
                14,
                [1, 4],
            ),
        },
        // Highlight correction Auto, shadow correction Mid; AWB A6.
        Preset {
            id: "reggie-negative",
            effect: None,
            author: Some("Reggie Ballesteros"),
            source: Some("https://www.reddit.com/r/ricohGR/comments/180a8nt/"),
            recipes: negative(
                "Reggie Negative",
                [2, 0, 0, 3, -4, -1, 1, 0, 0],
                0,
                6,
                [0, 2],
            ),
        },
        Preset {
            id: "cinestill-800t",
            effect: Some("vision3-500t-supra-v1"),
            author: None,
            source: None,
            recipes: COLOR_LINES.map(cinestill).to_vec(),
        },
        // The recipes that the GR community saves most on ricohcookbook.com
        // (2026-11-09), each credited to its author, with the camera's grain
        // as GRKU Grain where the author used it, and without the ISO ceilings and
        // exposure compensation of the posts, which are advice rather than the look. The levels are stored
        // values (0 to 8 for -4 to +4; 4 where the type has no such level).
        // Royal Supra by Ritchie Roesch: Positive Film; saved 209 times on ricohcookbook.com.
        Preset {
            id: "royal-supra",
            effect: None,
            author: Some("Ritchie Roesch"),
            source: Some("https://ricohrecipes.com/the-street-collection/"),
            recipes: vec![Recipe {
                name: "Royal Supra".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [6, 0, 5, 8, 0, 1, 5, 4, 8],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 5, shift_ba: 8, shift_gm: 10, kelvin: 5500 }),
                corrections: [Some(1), Some(3), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Royal Supra".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [6, 0, 5, 8, 0, 1, 5, 4, 8],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 5, shift_ba: 8, shift_gm: 10, kelvin: 5500 }),
                corrections: [Some(1), Some(3), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Bennet's BW800 by Bennet: Monotone; saved 116 times on ricohcookbook.com.
        // The comment of the author on the post gives the settings. The grain of GR III Grain Effect 2 is Mid.
        Preset {
            id: "bennets-bw800",
            effect: None,
            author: Some("Bennet"),
            source: Some("https://www.reddit.com/r/ricohGR/comments/1t2rmuv/bennets_bw800/"),
            recipes: Native { name: "Bennet's BW800", image_type: "MonotoneGR", levels: [0, 0, -2, 4, -2, -4, -1, 0, 0], tone: Some("OFF"), grain: (2, 0), white_balance: ("Daylight", 14, -2, 5500), corrections: ["On", "Mid", "On", "Off"] }.recipes(&[Family::Gr3, Family::Gr4]),
        },
        // Portra 160 by Chrizz Ocampo: Negative Film; saved 107 times on ricohcookbook.com.
        // The reply of the author to the post gives clarity "0 or -4 (for a nostalgic look)": the recipe keeps 0, as GRKit does.
        Preset {
            id: "portra-160-chrizz-ocampo",
            effect: None,
            author: Some("Chrizz Ocampo"),
            source: Some("https://www.facebook.com/groups/363978064347683/posts/1465331294212349/"),
            recipes: Native { name: "Portra 160", image_type: "NegativeFilm", levels: [3, -1, 3, -1, 2, -3, 0, 0, 0], tone: None, grain: (0, 0), white_balance: ("Shade", 3, -3, 5500), corrections: ["Auto", "Auto", "Off", "Auto"] }.recipes(&[Family::Gr3, Family::Gr4]),
        },
        // Lanzarote by I Am a Camera: Cinema (Yellow); saved 58 times on ricohcookbook.com.
        // The video gives Toning 2 (Mid) and grain size 1 and strength 1 (Small, Low), and no white balance.
        Preset {
            id: "lanzarote-cinema-yellow",
            effect: None,
            author: Some("I Am a Camera"),
            source: Some("https://ricohcookbook.com/recipe/lanzarote-cinema-yellow"),
            recipes: Native { name: "Lanzarote", image_type: "CinemaYellow", levels: [0, -1, 1, 0, -2, -1, 0, 0, 0], tone: Some("Mid"), grain: (1, 0), white_balance: ("Auto", 0, 0, 5500), corrections: ["Auto", "Auto", "Off", "Auto"] }.recipes(&[Family::Gr4]),
        },
        // Cotton Color 400 by Luke Taylor: Positive Film, from the settings of the post.
        Preset {
            id: "cotton-color-400",
            effect: None,
            author: Some("Luke Taylor"),
            source: Some("https://www.lukeptaylor.com/blog/cotton-color-400-ricoh-gr-iii-film-recipe"),
            recipes: Native { name: "Cotton Color 400", image_type: "PositiveFilm", levels: [0, 0, 2, 1, -1, -4, -2, 2, -2], tone: None, grain: (0, 0), white_balance: ("Auto", -2, -3, 5500), corrections: ["On", "Mid", "Off", "Off"] }.recipes(&[Family::Gr3, Family::Gr4]),
        },
        // Candy Color 400 by Luke Taylor: Positive Film; saved 52 times on ricohcookbook.com.
        // The post gives a white balance of 5700 K with M2.
        Preset {
            id: "candy-color-400",
            effect: None,
            author: Some("Luke Taylor"),
            source: Some("https://www.lukeptaylor.com/blog/candy-color-400-ricoh-gr-iii-film-recipe"),
            recipes: Native { name: "Candy Color 400", image_type: "PositiveFilm", levels: [4, -2, 0, 4, 4, 4, 4, 1, 4], tone: None, grain: (0, 0), white_balance: ("ColorTemp1", 0, 2, 5700), corrections: ["On", "High", "On", "Off"] }.recipes(&[Family::Gr3, Family::Gr4]),
        },
        // IAC Tri-X by I Am a Camera: Monotone; saved 51 times on ricohcookbook.com.
        Preset {
            id: "iac-tri-x",
            effect: None,
            author: Some("I Am a Camera"),
            source: Some("https://ricohcookbook.com/recipe/iac-tri-x"),
            recipes: vec![Recipe {
                name: "IAC Tri-X".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 2,
                    levels: [4, 4, 3, 6, 4, 2, 3, 4, 5],
                    tone: 0,
                    intensity: 0,
                    filter: 3,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 1, size: 2 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "IAC Tri-X".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 2,
                    levels: [4, 4, 3, 6, 4, 2, 3, 4, 5],
                    tone: 0,
                    intensity: 0,
                    filter: 3,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 1, size: 2 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Lux Pastel by Robert Luxun: Positive Film; saved 43 times on ricohcookbook.com.
        Preset {
            id: "lux-pastel",
            effect: None,
            author: Some("Robert Luxun"),
            source: Some("https://www.reddit.com/r/ricohGR/comments/1u1a9s6/new_to_the_ricoh_gr_iv_heres_some_portrait_shots/"),
            recipes: vec![Recipe {
                name: "Lux Pastel".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [6, 4, 6, 2, 3, 7, 5, 3, 5],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 6, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(1), Some(3), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Lux Pastel".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [6, 4, 6, 2, 3, 7, 5, 3, 5],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 6, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(1), Some(3), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Dante Sisofo Street B&W by Dante Sisofo: Hi-Contrast B&W; saved 42 times on ricohcookbook.com.
        // GR III Grain Effect 3 is High. The source gives no white balance: the recipe is black and white.
        Preset {
            id: "dante-sisofo-street-bw",
            effect: None,
            author: Some("Dante Sisofo"),
            source: Some("https://dantesisofo.com/my-ricoh-gr-camera-settings-for-street-photography/"),
            recipes: Native { name: "Sisofo Street BW", image_type: "HighContrastBW", levels: [0, 0, -2, 4, -4, 0, 4, 4, 4], tone: Some("OFF"), grain: (3, 0), white_balance: ("Auto", 0, 0, 5500), corrections: ["Auto", "Auto", "Off", "Auto"] }.recipes(&[Family::Gr3, Family::Gr4]),
        },
        // Kodak Chrome by Ritchie Roesch: Positive Film; saved 40 times on ricohcookbook.com.
        Preset {
            id: "kodak-chrome",
            effect: None,
            author: Some("Ritchie Roesch"),
            source: Some("https://ricohrecipes.com/the-street-collection/"),
            recipes: vec![Recipe {
                name: "Kodak Chrome".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [7, 3, 2, 2, 6, 0, 5, 4, 6],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 4, shift_ba: 24, shift_gm: 10, kelvin: 5500 }),
                corrections: [Some(1), Some(1), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Kodak Chrome".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [7, 3, 2, 2, 6, 0, 5, 4, 6],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 4, shift_ba: 24, shift_gm: 10, kelvin: 5500 }),
                corrections: [Some(1), Some(1), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Classic Chrome... but Better by Luke Taylor: Positive Film; saved 33 times on ricohcookbook.com.
        Preset {
            id: "classic-chrome-but-better",
            effect: None,
            author: Some("Luke Taylor"),
            source: Some("https://www.lukeptaylor.com/blog/classic-chrome-ricoh-griii-film-recipe"),
            recipes: vec![Recipe {
                name: "Classic Chrome+".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [4, 2, 7, 6, 5, 4, 3, 5, 3],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 14, shift_ba: 14, shift_gm: 14, kelvin: 3700 }),
                corrections: [Some(0), Some(3), Some(0), Some(1)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Classic Chrome+".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [4, 2, 7, 6, 5, 4, 3, 5, 3],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 14, shift_ba: 14, shift_gm: 14, kelvin: 3700 }),
                corrections: [Some(0), Some(3), Some(0), Some(1)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // KYO Night B&W by Ricoh (GR official): Monotone; saved 31 times on ricohcookbook.com.
        Preset {
            id: "kyo-night-bw",
            effect: None,
            author: Some("Ricoh (GR official)"),
            source: Some("https://www.grblog.jp/en/article/2274/"),
            recipes: vec![Recipe {
                name: "KYO Night B&W".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 2,
                    levels: [4, 4, 4, 5, 3, 6, 4, 4, 4],
                    tone: 5,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "KYO Night B&W".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 2,
                    levels: [4, 4, 4, 5, 3, 6, 4, 4, 4],
                    tone: 5,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Asakura Negative Film by Ricoh (GR official): Negative Film; saved 29 times on ricohcookbook.com.
        Preset {
            id: "asakura-negative",
            effect: None,
            author: Some("Ricoh (GR official)"),
            source: Some("https://www.grblog.jp/en/article/7151/"),
            recipes: vec![Recipe {
                name: "Asakura Negative".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 6,
                    levels: [2, 4, 4, 7, 8, 0, 4, 4, 4],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 1, shift_ba: 9, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Asakura Negative".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 6,
                    levels: [2, 4, 4, 7, 8, 0, 4, 4, 4],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 9, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Leica Look by Photo Stuff: Standard; saved 26 times on ricohcookbook.com.
        Preset {
            id: "photo-stuff-leica-look",
            effect: None,
            author: Some("Photo Stuff"),
            source: Some("https://ricohcookbook.com/recipe/photo-stuff-leica-look"),
            recipes: vec![Recipe {
                name: "Leica Look".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 0,
                    levels: [6, 4, 2, 5, 5, 5, 5, 3, 6],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Leica Look".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 0,
                    levels: [6, 4, 2, 5, 5, 5, 5, 3, 6],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Ninzaburo Monotone by Ricoh (GR official): Monotone; saved 26 times on ricohcookbook.com.
        Preset {
            id: "ninzaburo-monotone",
            effect: None,
            author: Some("Ricoh (GR official)"),
            source: Some("https://www.grblog.jp/article/13501/"),
            recipes: vec![Recipe {
                name: "Ninzaburo Mono".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 2,
                    levels: [4, 4, 2, 6, 4, 4, 4, 8, 4],
                    tone: 0,
                    intensity: 0,
                    filter: 3,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 3, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Ninzaburo Mono".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 2,
                    levels: [4, 4, 2, 6, 4, 4, 4, 8, 4],
                    tone: 0,
                    intensity: 0,
                    filter: 3,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 3, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Barbican by I Am a Camera: Cinema (Green); saved 21 times on ricohcookbook.com.
        Preset {
            id: "barbican-cinema-green",
            effect: None,
            author: Some("I Am a Camera"),
            source: Some("https://ricohcookbook.com/recipe/barbican-cinema-green"),
            recipes: vec![Recipe {
                name: "Barbican".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 13,
                    levels: [5, 4, 3, 5, 2, 5, 3, 4, 4],
                    tone: 1,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 1, size: 1 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 3, shift_ba: 14, shift_gm: 14, kelvin: 5500 }),
                corrections: [Some(0), Some(0), Some(0), Some(0)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Indigo Film 800 by Luke Taylor: Retro; saved 21 times on ricohcookbook.com.
        Preset {
            id: "indigo-film-800",
            effect: None,
            author: Some("Luke Taylor"),
            source: Some("https://www.lukeptaylor.com/blog/indigo-film-ricoh-gr-iii-film-recipe-griiix"),
            recipes: vec![Recipe {
                name: "Indigo Film 800".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 9,
                    levels: [8, 6, 4, 4, 6, 7, 8, 6, 2],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 7, shift_ba: 13, shift_gm: 17, kelvin: 5500 }),
                corrections: [Some(1), Some(2), Some(0), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Indigo Film 800".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 9,
                    levels: [8, 6, 4, 4, 6, 7, 8, 6, 2],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 7, shift_ba: 13, shift_gm: 17, kelvin: 5500 }),
                corrections: [Some(1), Some(2), Some(0), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Dramatic Monochrome by Ritchie Roesch: Hi-Contrast B&W; saved 18 times on ricohcookbook.com.
        Preset {
            id: "dramatic-monochrome",
            effect: None,
            author: Some("Ritchie Roesch"),
            source: Some("https://ricohrecipes.com/the-bw-collection/"),
            recipes: vec![Recipe {
                name: "Dramatic Mono".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 5,
                    levels: [4, 4, 3, 7, 1, 1, 4, 4, 5],
                    tone: 0,
                    intensity: 0,
                    filter: 2,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 3, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 14, shift_ba: 14, shift_gm: 14, kelvin: 10000 }),
                corrections: [Some(1), Some(1), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Dramatic Mono".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 5,
                    levels: [4, 4, 3, 7, 1, 1, 4, 4, 5],
                    tone: 0,
                    intensity: 0,
                    filter: 2,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 3, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 14, shift_ba: 14, shift_gm: 14, kelvin: 10000 }),
                corrections: [Some(1), Some(1), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Pro Color by Ritchie Roesch: Negative Film; saved 16 times on ricohcookbook.com.
        Preset {
            id: "pro-color",
            effect: None,
            author: Some("Ritchie Roesch"),
            source: Some("https://ricohrecipes.com/the-starter-collection/"),
            recipes: vec![Recipe {
                name: "Pro Color".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 6,
                    levels: [8, 2, 7, 7, 2, 8, 3, 4, 3],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 1, size: 2 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 4, shift_ba: 24, shift_gm: 9, kelvin: 5500 }),
                corrections: [Some(1), Some(3), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Pro Color".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 6,
                    levels: [8, 2, 7, 7, 2, 8, 3, 4, 3],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 1, size: 2 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 4, shift_ba: 24, shift_gm: 9, kelvin: 5500 }),
                corrections: [Some(1), Some(3), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // 1986 Negative by Ritchie Roesch: Negative Film; saved 16 times on ricohcookbook.com.
        Preset {
            id: "1986-negative",
            effect: None,
            author: Some("Ritchie Roesch"),
            source: Some("https://ricohrecipes.com/the-adventure-collection/"),
            recipes: vec![Recipe {
                name: "1986 Negative".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 6,
                    levels: [8, 2, 3, 6, 6, 1, 3, 4, 2],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 14, shift_ba: 14, shift_gm: 14, kelvin: 6700 }),
                corrections: [Some(1), Some(0), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "1986 Negative".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 6,
                    levels: [8, 2, 3, 6, 6, 1, 3, 4, 2],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 14, shift_ba: 14, shift_gm: 14, kelvin: 6700 }),
                corrections: [Some(1), Some(0), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Kodamax by Ritchie Roesch: Positive Film; saved 14 times on ricohcookbook.com.
        Preset {
            id: "kodamax",
            effect: None,
            author: Some("Ritchie Roesch"),
            source: Some("https://ricohrecipes.com/the-adventure-collection/"),
            recipes: vec![Recipe {
                name: "Kodamax".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [8, 2, 4, 7, 4, 2, 4, 4, 5],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 15, shift_gm: 4, kelvin: 5500 }),
                corrections: [Some(1), Some(2), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Kodamax".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 7,
                    levels: [8, 2, 4, 7, 4, 2, 4, 4, 5],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 0, shift_ba: 15, shift_gm: 4, kelvin: 5500 }),
                corrections: [Some(1), Some(2), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
        // Grotto 200 by Brendan Bullivant: Vivid; saved 14 times on ricohcookbook.com.
        Preset {
            id: "grotto-200",
            effect: None,
            author: Some("Brendan Bullivant"),
            source: Some("https://ricohcookbook.com/recipe/grotto-200"),
            recipes: vec![Recipe {
                name: "Grotto 200".into(),
                family: Family::Gr3,
                look: Look::Native(NativeLook {
                    image_type: 1,
                    levels: [4, 3, 5, 5, 1, 3, 4, 4, 3],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 4, shift_ba: 15, shift_gm: 15, kelvin: 5500 }),
                corrections: [Some(1), Some(0), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }, Recipe {
                name: "Grotto 200".into(),
                family: Family::Gr4,
                look: Look::Native(NativeLook {
                    image_type: 1,
                    levels: [4, 3, 5, 5, 1, 3, 4, 4, 3],
                    tone: 0,
                    intensity: 0,
                    filter: 0,
                    grain_strength: 0,
                    grain_size: 0,
                    solarization: 0,
                }),
                grain: Some(Grain { level: 0, size: 0 }),
                glow: Some(GLOW_OFF),
                grain_style: None,
                border: None,
                white_balance: Some(WhiteBalance { mode: 4, shift_ba: 15, shift_gm: 15, kelvin: 5500 }),
                corrections: [Some(1), Some(0), Some(1), Some(5)],
                exposure: Exposure::default(),
                enabled: true,
                hidden: false,
                number: 0,
                id: 0,
            }],
        },
    ]
}

/// The camera lines of the color recipes: each but GR IV Monochrome.
const COLOR_LINES: [Family; 2] = [Family::Gr3, Family::Gr4];

/// B10: stored A-B shifts run from B14 (0) through none (14) to A14 (28).
const CINESTILL_SHIFT_BA: u8 = 4;

/// The portable index of Negative Film (`native::TYPES`).
pub(super) const NEGATIVE_FILM: usize = 6;
