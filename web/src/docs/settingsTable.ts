// The rows of a `settings` block: the settings of a module from the code
// (moduleSettings.generated.ts), in the menu language of the camera of a reader.
import type { Language } from '../i18n';
import { MODULE_SETTINGS } from './moduleSettings.generated';

/** The menu language of the camera: the camera has no Thai menu, so a Thai reader sees English. */
export const cameraLanguage = (language: Language): string => (language === 'th' ? 'en' : language);

export interface SettingRow {
  key: string;
  /** The name of the row, with its child page first (Bloom › Strength). */
  name: string;
  values: readonly string[];
  default: number;
}

/** The settings of the module in folder `module`, or null for a folder that has no module. */
export function settingRows(module: string, language: Language): SettingRow[] | null {
  const info = MODULE_SETTINGS.find((item) => item.dir === module);
  if (!info) return null;
  const code = cameraLanguage(language);
  const pick = <T,>(record: Readonly<Record<string, T | null>> | null) => (record ? (record[code] ?? record.en ?? null) : null);
  return info.settings.map((setting) => {
    const label = pick(setting.label) ?? setting.key;
    const group = pick(setting.groupTitle);
    return { key: setting.key, name: group ? `${group} › ${label}` : label, values: pick(setting.values) ?? [], default: setting.default };
  });
}
