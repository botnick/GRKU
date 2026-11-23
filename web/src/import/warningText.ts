import type { Strings } from "../i18n";

/** The note templates of an import in one language (`Strings['warningText']`). */
export type WarningText = Strings["warningText"];

/**
 * The English sentences of the importer (crates/grku-core: fit/import.rs, xmp/transform.rs,
 * xmp/bridge.rs) and the template of each. A sentence that matches none stays in English.
 */
const PATTERNS: readonly [RegExp, keyof WarningText, readonly string[]][] = [
  [
    /^The look includes a tone bridge from the camera Standard rendering/,
    "bridge",
    [],
  ],
  [/^Approximated (.+) with a fixed global curve\.$/, "approx", ["names"]],
  [
    /^Skipped the profile table: the preset does not contain it\.$/,
    "noTable",
    [],
  ],
  [/^Skipped RGBTable: (.+)\.$/, "rgbTable", ["reason"]],
  [
    /^Skipped the profile "(.+)": the preset does not contain it\.$/,
    "noProfile",
    ["name"],
  ],
  [/^Skipped some settings of the profile\.$/, "someProfile", []],
  [/^Skipped (.+)\.$/, "skipped", ["names"]],
  [/^The film look does not hold the white balance\.$/, "noWb", []],
  [/^The fit reached the matrix limit of (\S+?)\. /, "matrix", ["limit"]],
  [/^The LUT image is noisy/, "noisy", []],
  [
    /^Read the image as a LUT in (.+), not as a HALD image$/,
    "layout",
    ["layout"],
  ],
  [
    /^The LUT data suggests (.+) input, but the import used (.+)$/,
    "wrongInput",
    ["guess", "input"],
  ],
  [
    /^The LUT data suggests (.+?) input, and it fits (.+) about as well\. /,
    "logGuessAlso",
    ["guess", "also"],
  ],
  [/^The LUT data suggests (.+?) input\. /, "logGuess", ["guess"]],
  [
    /^Some saturated colors get darker as their exposure grows, by up to (\d+) L\*/,
    "fall",
    ["n"],
  ],
  [
    /^Some saturated colors stay darker and more saturated .* by up to (\d+) L\*/,
    "lag",
    ["n"],
  ],
  [
    /^Some saturated colors change abruptly .* by up to (\d+) dE2000/,
    "step",
    ["n"],
  ],
  [/^The LUT uses video levels\./, "video", []],
];

/** A note of an import in the language of `text`, and whether it was translated. */
export function warningText(
  warning: string,
  text: WarningText,
): { text: string; translated: boolean } {
  for (const [pattern, key, names] of PATTERNS) {
    const match = pattern.exec(warning);
    if (!match) continue;
    const filled = names.reduce(
      (line, name, i) => line.replaceAll(`{${name}}`, match[i + 1] ?? ""),
      text[key],
    );
    return { text: filled, translated: true };
  }
  return { text: warning, translated: false };
}
