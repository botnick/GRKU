/**
 * The names that the site shows for a look of the catalog in place of the name of its effect
 * file, which the camera shows and which holds at most 16 characters (grku-core
 * `effects::NAME_MAX`). The ID, the file, and the code of the look stay, so cards and recipes
 * keep it.
 */
export const SITE_NAMES: Readonly<Record<string, string>> = {
  // GRKU's own look after the Positive Film of GR II, made by eye, apart from GR II Positive,
  // which the site makes from a GR II firmware file (import/native.ts). The camera shows the
  // name of its file, GRII Pos. (GRKU).
  'positive-film-grii-v1': 'GR II Positive (GRKU)',
};

/** The name that the site shows for the look `id`, whose file names it `name`. */
export const siteName = (id: string, name: string): string => SITE_NAMES[id] ?? name;
