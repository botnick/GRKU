/**
 * The settings of the Develop page: a film look and the modules of the camera, with the values of
 * the camera menus. Each value is the stored value of the camera setting (module.toml), so a
 * recipe here is a recipe on the camera.
 */

export interface GrainSettings {
  /** CORE.GRAIN: 0 Off, 1 Weak, 2 Medium, 3 Strong, 4 Extra Strong. */
  level: number;
  /** CORE.GRAIN_SIZE: 0 Auto (by ISO), 1 Small, 2 Medium, 3 Large. */
  size: number;
}

export interface GlowSettings {
  /** 0 Off, 1 Weak, 2 Medium, 3 Strong. */
  bloom: number;
  halation: number;
  /** 0 Red, 1 Orange, 2 Gold, 3 White. */
  color: number;
}

export interface LeakSettings {
  /** 0 Off, 1 Custom, 2 Faded, 3 Dusty, 4 Leaky, 5 Expired. */
  look: number;
  /** The strengths of Custom, 0 Off to 3 Strong. */
  vignette: number;
  dust: number;
  leak: number;
  scratches: number;
}

export interface DiffusionSettings {
  /** 0 Off, 1 1/8, 2 1/4, 3 1/2. */
  strength: number;
  /** Black Mist: 0 Off, 1 Light, 2 Heavy. */
  mist: number;
  /** 0 Off, 1 Blue, 2 Amber. */
  streak: number;
  /** Film Softness: 0 Off, 1 Low, 2 Medium, 3 High. */
  softness: number;
}

export interface DateSettings {
  /** 0 Off, 1 'YY M D, 2 'YY M D H:MM, 3 M D 'YY, 4 D M 'YY, 5 D M 'YY H:MM. */
  style: number;
  /** Date Font: 0 Classic, 1 GR1s, 2 GR II. */
  look: number;
  /** 0 Film, 1 Upright. */
  position: number;
  /** 0 Standard, 1 Orange, 2 White, 3 Sepia, 4 LED Yellow. */
  color: number;
  /** 0 S, 1 M, 2 M-L, 3 L. */
  size: number;
  /** 0 Bottom Right, 1 Bottom Left, 2 Top Right, 3 Bottom Split. */
  corner: number;
  /** 0 Off, 1 On. */
  glow: number;
  /** 0 Off, then the captions of the camera; 8 is GRKU ♥. */
  caption: number;
}

export interface BorderSettings {
  /** CORE.BORDER: 0 Off, 1 Thin, 2 Wide, 3 Instant. */
  style: number;
  /** CORE.BORDER_COLOR: 0 White, 1 Black. */
  color: number;
}

export interface DevelopSettings {
  /** The effect ID of the film look, or null for the photo as it is. */
  look: string | null;
  grain: GrainSettings;
  glow: GlowSettings;
  leak: LeakSettings;
  diffusion: DiffusionSettings;
  date: DateSettings;
  border: BorderSettings;
}

/** The number of values of each setting, as module.toml gives them. */
export const VALUES = {
  grain: { level: 5, size: 4 },
  glow: { bloom: 4, halation: 4, color: 4 },
  leak: { look: 6, vignette: 4, dust: 4, leak: 4, scratches: 4 },
  diffusion: { strength: 4, mist: 3, streak: 3, softness: 4 },
  date: { style: 6, look: 3, position: 2, color: 5, size: 4, corner: 4, glow: 2, caption: 9 },
  border: { style: 4, color: 2 },
} as const satisfies { [M in Exclude<keyof DevelopSettings, 'look'>]: { [K in keyof DevelopSettings[M]]: number } };

export type ModuleName = keyof typeof VALUES;
export const MODULE_NAMES: readonly ModuleName[] = ['glow', 'leak', 'diffusion', 'grain', 'date', 'border'];

/** Everything off, the camera defaults for the rest (Date size M, Halation Orange). */
export const OFF: DevelopSettings = {
  look: null,
  grain: { level: 0, size: 0 },
  glow: { bloom: 0, halation: 0, color: 1 },
  leak: { look: 0, vignette: 0, dust: 0, leak: 0, scratches: 0 },
  diffusion: { strength: 0, mist: 0, streak: 0, softness: 0 },
  date: { style: 0, look: 0, position: 0, color: 0, size: 1, corner: 0, glow: 0, caption: 0 },
  border: { style: 0, color: 0 },
};

/** Whether a module changes the picture with these settings. */
export function isOn(settings: DevelopSettings, module: ModuleName): boolean {
  switch (module) {
    case 'grain':
      return settings.grain.level > 0;
    case 'glow':
      return settings.glow.bloom > 0 || settings.glow.halation > 0;
    case 'leak':
      return settings.leak.look > 0;
    case 'diffusion':
      return settings.diffusion.strength > 0 || settings.diffusion.softness > 0;
    case 'date':
      return settings.date.style > 0;
    case 'border':
      return settings.border.style > 0;
  }
}

/** The module settings of OFF, without the look. */
const { look: _none, ...MODULES_OFF } = OFF;

export type PresetId = 'natural' | 'snapshot' | 'dreamy' | 'date' | 'instant';
export const PRESET_IDS: readonly PresetId[] = ['natural', 'snapshot', 'dreamy', 'date', 'instant'];

/** The module settings of each preset; the look stays the one chosen. */
export const PRESETS: Readonly<Record<PresetId, Omit<DevelopSettings, 'look'>>> = {
  // The look alone, with the finest grain, as most people shoot it.
  natural: { ...MODULES_OFF, grain: { level: 1, size: 1 } },
  // A drugstore print: grain, a warm bloom on the lights, the orange date.
  snapshot: {
    ...MODULES_OFF,
    grain: { level: 2, size: 0 },
    glow: { bloom: 1, halation: 0, color: 1 },
    date: { ...OFF.date, style: 1, glow: 1 },
  },
  // Soft light: Diffusion 1/4 with Film Softness and Bloom, fine grain.
  dreamy: {
    ...MODULES_OFF,
    grain: { level: 1, size: 1 },
    glow: { bloom: 2, halation: 0, color: 1 },
    diffusion: { strength: 2, mist: 0, streak: 0, softness: 1 },
  },
  // The date as the GR1s printed it, nothing else.
  date: { ...MODULES_OFF, date: { ...OFF.date, style: 1, look: 1, size: 2, glow: 1 } },
  // An instant print: the white Instant border, GRKU ♥ beside the date, a soft bloom.
  instant: {
    ...MODULES_OFF,
    grain: { level: 1, size: 1 },
    glow: { bloom: 1, halation: 0, color: 1 },
    date: { ...OFF.date, style: 1, glow: 1, caption: 8 },
    border: { style: 3, color: 0 },
  },
};

export function applyPreset(settings: DevelopSettings, preset: PresetId): DevelopSettings {
  return { look: settings.look, ...structuredClone(PRESETS[preset]) };
}

/** The preset that `settings` match, or null. */
export function presetOf(settings: DevelopSettings): PresetId | null {
  const { look: _look, ...modules } = settings;
  return PRESET_IDS.find((id) => JSON.stringify(PRESETS[id]) === JSON.stringify(modules)) ?? null;
}

const clampValue = (value: unknown, values: number, fallback: number) =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) < values ? (value as number) : fallback;

/** Settings from untrusted JSON (the address, the storage), each value in range or its default. */
export function readSettings(value: unknown, fallback: DevelopSettings = PRESETS.natural as DevelopSettings): DevelopSettings {
  const input = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const base = { ...OFF, ...fallback };
  const result = { look: typeof input.look === 'string' && /^[a-z0-9-]{1,64}$/.test(input.look) ? input.look : (fallback.look ?? null) } as DevelopSettings;
  for (const module of MODULE_NAMES) {
    const given = (input[module] && typeof input[module] === 'object' ? input[module] : {}) as Record<string, unknown>;
    const values = VALUES[module] as Record<string, number>;
    const defaults = base[module] as unknown as Record<string, number>;
    (result as unknown as Record<string, Record<string, number>>)[module] = Object.fromEntries(
      Object.keys(values).map((key) => [key, clampValue(given[key], values[key]!, defaults[key] ?? 0)]),
    );
  }
  return result;
}

// ---- The camera's work ---------------------------------------------------------------------------

/** What the shot of a picture gives the modules (EXIF), as GrkuShot. */
export interface Shot {
  iso: number;
  /** The f-number x 10. */
  fNumber: number;
  exposureUs: number;
}

/** One call of the module code, in the order of the camera. */
export type Step =
  | { module: 'glow'; bloom: number; halation: number; color: number }
  | { module: 'leak'; look: number; vignette: number; dust: number; leak: number; scratches: number }
  | { module: 'diffusion'; strength: number; mist: number; streak: number }
  | { module: 'softness'; level: number }
  | { module: 'grain'; level: number; size: number }
  | { module: 'date'; style: number; look: number; position: number; color: number; size: number; corner: number; glow: number; caption: number };

/** The grain size of Auto for an ISO, as grain.c: Small to ISO 400, Medium to 800, Large above. */
export const autoGrainSize = (iso: number | null) => (iso === null ? 1 : iso <= 400 ? 1 : iso <= 800 ? 2 : 3);

/**
 * The module calls of the settings in the order of the camera: Glow, Light Leak, Diffusion, Film
 * Softness, Grain (frame stage), then the Date (mark stage). The Border is the canvas around them.
 */
export function steps(settings: DevelopSettings, iso: number | null): Step[] {
  const out: Step[] = [];
  const { glow, leak, diffusion, grain, date } = settings;
  if (glow.bloom || glow.halation) out.push({ module: 'glow', ...glow });
  if (leak.look) out.push({ module: 'leak', ...leak });
  if (diffusion.strength) out.push({ module: 'diffusion', strength: diffusion.strength, mist: diffusion.mist, streak: diffusion.streak });
  if (diffusion.softness) out.push({ module: 'softness', level: diffusion.softness });
  if (grain.level) out.push({ module: 'grain', level: grain.level, size: grain.size || autoGrainSize(iso) });
  if (date.style) out.push({ module: 'date', ...date });
  return out;
}

/** The sides of a border margin array: left, top, right, bottom of the stored picture. */
export type Margins = [number, number, number, number];

/**
 * The border of runtime/canvas.h (canvas_margins): the percent of the style (Thin 3, Wide 6,
 * Instant 4) of the short side, to the nearest multiple of 16; Instant makes the side at the
 * bottom of the upright picture three times as wide.
 */
export function borderMargins(style: number, width: number, height: number, turns: number): Margins {
  const percent = [0, 3, 6, 4][style] ?? 0;
  let m = Math.floor((Math.min(width, height) * percent) / 100);
  m = Math.floor((m + 8) / 16) * 16;
  const margins: Margins = [m, m, m, m];
  if (style === 3) margins[[3, 2, 1, 0][turns & 3]!] = 3 * m;
  return margins;
}

/** Margins for a picture `scale` times the size, each even, so chroma pairs stay whole. */
export const scaleMargins = (margins: Margins, scale: number): Margins =>
  margins.map((m) => Math.round((m * scale) / 2) * 2) as Margins;
