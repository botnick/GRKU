// The modules and the camera that the visitor chose, kept in the browser storage, so the install
// page and a later visit start from them. The film looks keep their own key (selection.ts).
import { CAMERAS, type Camera } from './cameras';
import { ALL_MODULES, DEFAULT_ENABLED, MODULES_MAX, type ModuleKey } from './modules';

const MODULES_KEY = 'grku.modules';
const CAMERA_KEY = 'grku.camera';

/** The modules of the last visit, or the default ones when this browser kept none. */
export function loadModules(storage: Pick<Storage, 'getItem'> | null): ReadonlySet<ModuleKey> {
  try {
    const value: unknown = JSON.parse(storage?.getItem(MODULES_KEY) ?? 'null');
    if (Array.isArray(value) && value.length <= MODULES_MAX && value.every((key) => ALL_MODULES.has(key as ModuleKey))) {
      return new Set(value as ModuleKey[]);
    }
  } catch {
    // An unreadable value is the same as none.
  }
  return DEFAULT_ENABLED;
}

export function saveModules(storage: Pick<Storage, 'setItem'> | null, modules: ReadonlySet<ModuleKey>) {
  try {
    storage?.setItem(MODULES_KEY, JSON.stringify([...modules]));
  } catch {
    // A convenience: without storage, the next visit starts from the default modules.
  }
}

/** The camera of the last visit when the site still supports it, else the first camera. */
export function loadCamera(storage: Pick<Storage, 'getItem'> | null): Camera['key'] {
  let saved: string | null = null;
  try {
    saved = storage?.getItem(CAMERA_KEY) ?? null;
  } catch {
    // Storage can be unavailable, for example in a private window.
  }
  return CAMERAS.find((camera) => camera.key === saved && camera.support)?.key ?? CAMERAS[0]!.key;
}

export function saveCamera(storage: Pick<Storage, 'setItem'> | null, key: Camera['key']) {
  try {
    storage?.setItem(CAMERA_KEY, key);
  } catch {
    // A convenience: without storage, the next visit starts from the first camera.
  }
}
