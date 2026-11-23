import { describe, expect, it } from "vitest";
import { STRINGS } from "../i18n";
import { warningText } from "./warningText";

const th = STRINGS.th.warningText;
const en = STRINGS.en.warningText;

describe("warningText", () => {
  it("translates the notes of a preset import and fills in their values", () => {
    expect(
      warningText(
        "Approximated Highlights and Shadows with a fixed global curve.",
        en,
      ).text,
    ).toBe(
      "Highlights and Shadows are approximated with one fixed curve for the whole photo.",
    );
    const skipped = warningText("Skipped Clarity, vignette and crop.", th);
    expect(skipped.translated).toBe(true);
    expect(skipped.text).toContain("Clarity, vignette and crop");
    expect(warningText("Skipped some settings of the profile.", th).text).toBe(
      th.someProfile,
    );
  });

  it("translates the notes of a LUT import", () => {
    const guess = warningText(
      "The LUT data suggests F-Log input, but the import used Standard",
      th,
    );
    expect(guess.text).toContain("F-Log");
    expect(guess.text).toContain("Standard");
    const fall = warningText(
      "Some saturated colors get darker as their exposure grows, by up to 7 L*, where the LUT keeps them brightening",
      th,
    );
    expect(fall.text).toContain("7");
    expect(fall.translated).toBe(true);
  });

  it("keeps an unknown sentence in English", () => {
    expect(warningText("Something new.", th)).toEqual({
      text: "Something new.",
      translated: false,
    });
  });
});
