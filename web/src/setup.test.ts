import { describe, expect, it } from 'vitest';
import { CAMERAS } from './cameras';
import { DEFAULT_ENABLED, MODULES, MODULES_MAX } from './modules';
import { loadCamera, loadModules, loadProgress, saveCamera, saveModules, saveProgress, visitStep } from './setup';

/** A storage in memory. */
function memory(): Pick<Storage, 'getItem' | 'setItem'> {
  const items = new Map<string, string>();
  return { getItem: (key) => items.get(key) ?? null, setItem: (key, value) => void items.set(key, value) };
}

describe('modules', () => {
  it('keeps the modules for the next page', () => {
    const storage = memory();
    const chosen = new Set([MODULES[0]!.key, MODULES[2]!.key]);
    saveModules(storage, chosen);
    expect([...loadModules(storage)]).toEqual([...chosen]);
    saveModules(storage, new Set());
    expect(loadModules(storage).size).toBe(0);
  });

  it('starts from the default modules without a valid choice', () => {
    expect(loadModules(null)).toBe(DEFAULT_ENABLED);
    const storage = memory();
    storage.setItem('grku.modules', '["filmLook","nope"]');
    expect(loadModules(storage)).toBe(DEFAULT_ENABLED);
    storage.setItem('grku.modules', JSON.stringify(MODULES.map((module) => module.key).concat(Array(MODULES_MAX).fill('crop'))));
    expect(loadModules(storage)).toBe(DEFAULT_ENABLED);
    storage.setItem('grku.modules', '{');
    expect(loadModules(storage)).toBe(DEFAULT_ENABLED);
  });
});

describe('camera', () => {
  it('keeps a supported camera and falls back to the first one', () => {
    const storage = memory();
    const other = CAMERAS.filter((camera) => camera.support).at(-1)!;
    saveCamera(storage, other.key);
    expect(loadCamera(storage)).toBe(other.key);
    saveCamera(storage, 'gone');
    expect(loadCamera(storage)).toBe(CAMERAS[0]!.key);
    expect(loadCamera(null)).toBe(CAMERAS[0]!.key);
  });
});

describe('install progress', () => {
  it('keeps the furthest and the last step', () => {
    const storage = memory();
    expect(loadProgress(storage)).toEqual({ furthest: 'install', last: 'install' });
    let progress = visitStep(loadProgress(storage), 'modules');
    progress = visitStep(progress, 'camera');
    expect(progress).toEqual({ furthest: 'modules', last: 'camera' });
    saveProgress(storage, progress);
    expect(loadProgress(storage)).toEqual(progress);
    storage.setItem('grku.installStep', '{"furthest":"nope","last":"write"}');
    expect(loadProgress(storage)).toEqual({ furthest: 'install', last: 'install' });
  });
});
