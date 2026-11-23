import { describe, expect, it } from 'vitest';
import { coverCrop, loadShutdown, pictureChange, pictureFor, saveOwnPicture, saveShutdownKind, saveStudioPicture, shutdownKind, shutdownWrite } from './shutdownPicture';

describe('the shutdown picture', () => {
  it('takes the center of a source at the ratio of the screen', () => {
    expect(coverCrop(720, 480)).toEqual({ x: 0, y: 0, width: 720, height: 480 });
    // A portrait photo keeps its width, and a wide one its height.
    expect(coverCrop(3000, 4500)).toEqual({ x: 0, y: 1250, width: 3000, height: 2000 });
    expect(coverCrop(4000, 1000)).toEqual({ x: 1250, y: 0, width: 1500, height: 1000 });
  });

  it('changes the card only for a new file or a file to remove', () => {
    const file = new Uint8Array([1, 2, 3]);
    expect(pictureChange(file, null)).toBe('same');
    expect(pictureChange(null, 'remove')).toBe('same');
    expect(pictureChange(file, 'remove')).toBe('remove');
    expect(pictureChange(file, new Uint8Array([1, 2, 3]))).toBe('same');
    expect(pictureChange(file, new Uint8Array([1, 2, 4]))).toBe('write');
    expect(pictureChange(null, file)).toBe('write');
  });
});

describe('the shutdown choice', () => {
  const memory = () => {
    const items = new Map<string, string>();
    return {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => void items.set(key, value),
      removeItem: (key: string) => void items.delete(key),
    };
  };

  it('starts from the logo, and keeps a picture of the card that was never chosen here', () => {
    const card = new Uint8Array([9]);
    expect(shutdownKind(null, null, null)).toBe('logo');
    expect(shutdownKind(null, null, card)).toBe('keep');
    expect(shutdownKind('none', null, card)).toBe('none');
    // A choice that cannot apply falls back: no picture of the user, no card.
    expect(shutdownKind('own', null, null)).toBe('logo');
    expect(shutdownKind('own', new Uint8Array([1]), null)).toBe('own');
    expect(shutdownKind('keep', null, null)).toBe('logo');
    expect(shutdownKind('design', null, card)).toBe('design');
    // A Studio picture applies once the Studio made one.
    expect(shutdownKind('studio', null, card)).toBe('keep');
    expect(shutdownKind('studio', null, null, new Uint8Array([4]))).toBe('studio');
  });

  it('gives the file of each kind', () => {
    const logo = new Uint8Array([1]);
    const own = new Uint8Array([2]);
    expect(pictureFor('logo', logo, own)).toBe(logo);
    expect(pictureFor('logo', null, own)).toBeNull();
    const design = new Uint8Array([3]);
    expect(pictureFor('design', logo, own, design)).toBe(design);
    expect(pictureFor('design', logo, own)).toBeNull();
    const studio = new Uint8Array([4]);
    expect(pictureFor('studio', logo, own, design, studio)).toBe(studio);
    expect(pictureFor('studio', logo, own)).toBeNull();
    expect(pictureFor('own', logo, own)).toBe(own);
    expect(pictureFor('none', logo, own)).toBe('remove');
    expect(pictureFor('keep', logo, own)).toBeNull();
  });

  it('writes the file to the data folder, or removes it', () => {
    const file = new Uint8Array([1, 2]);
    expect(shutdownWrite('write', file)).toEqual({ files: [{ path: 'GRKU/GOODBYE.JPG', bytes: file }], remove: [] });
    expect(shutdownWrite('remove', 'remove')).toEqual({ files: [], remove: ['GRKU/GOODBYE.JPG'] });
    expect(shutdownWrite('same', file)).toEqual({ files: [], remove: [] });
    expect(shutdownWrite('same', null)).toEqual({ files: [], remove: [] });
  });

  it('keeps the choice and the picture of the user in this browser', () => {
    const storage = memory();
    expect(loadShutdown(storage)).toEqual({ kind: null, own: null, studio: null });
    saveShutdownKind(storage, 'design');
    expect(loadShutdown(storage).kind).toBe('design');
    saveShutdownKind(storage, 'own');
    saveOwnPicture(storage, new Uint8Array([0, 255, 128]));
    expect(loadShutdown(storage)).toEqual({ kind: 'own', own: new Uint8Array([0, 255, 128]), studio: null });
    saveShutdownKind(storage, 'studio');
    saveStudioPicture(storage, new Uint8Array([7, 8]));
    expect(loadShutdown(storage)).toMatchObject({ kind: 'studio', studio: new Uint8Array([7, 8]) });
    saveStudioPicture(storage, null);
    expect(loadShutdown(storage).studio).toBeNull();
    saveOwnPicture(storage, null);
    expect(loadShutdown(storage).own).toBeNull();
    storage.setItem('grku.shutdown', 'other');
    expect(loadShutdown(storage).kind).toBeNull();
    expect(loadShutdown(null)).toEqual({ kind: null, own: null, studio: null });
  });
});
