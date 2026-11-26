import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ImportedEffect } from '../catalog';
import { NATIVE_LOOK_IDS } from './names';
import {
  hasNativeLooks,
  importsForCamera,
  missingNativeLooks,
  NATIVE_LOOKS,
  nativeLooksFor,
  nativeProblem,
  takesNativeLooks,
} from './native';

const effect = (id: string, kind: 'lut' | 'native') => ({ id, imported: { kind } }) as ImportedEffect;

describe('importsForCamera', () => {
  const imported = [
    effect('lut-a', 'lut'),
    effect('gr4-cinema-yellow', 'native'),
    effect('gr4-cinema-green', 'native'),
    effect('gr2-positive-film', 'native'),
    effect('gr2-positive-film-gr4', 'native'),
  ];
  const solid = effect('gr4-mono-solid', 'native');
  const ids = (items: readonly { id: string }[]) => items.map((item) => item.id);

  it('keeps the GR III native looks on GR III and GR IIIx', () => {
    for (const camera of ['gr3', 'gr3x']) {
      expect(takesNativeLooks(camera)).toBe(true);
      expect(ids(importsForCamera(imported, camera))).toEqual(ids(imported.slice(0, 4)));
      expect(ids(nativeLooksFor(camera))).toEqual(NATIVE_LOOK_IDS.filter((id) => id !== 'gr2-positive-film-gr4'));
    }
  });

  it('gives GR IV the monochrome looks and its Positive, and GR IV Monochrome no native look', () => {
    expect(ids(nativeLooksFor('gr4'))).toEqual(
      NATIVE_LOOK_IDS.filter((id) => id.startsWith('gr4-mono-') || id === 'gr2-positive-film-gr4'),
    );
    expect(ids(importsForCamera([...imported, solid], 'gr4'))).toEqual(['lut-a', 'gr2-positive-film-gr4', 'gr4-mono-solid']);
    expect(takesNativeLooks('gr4m')).toBe(false);
    expect(ids(importsForCamera([...imported, solid], 'gr4m'))).toEqual(['lut-a']);
  });

  it('tells which native looks the page lacks', () => {
    expect(NATIVE_LOOKS.filter((look) => look.firmware === 'gr2').map((look) => look.id)).toEqual([
      'gr2-positive-film',
      'gr2-positive-film-gr4',
    ]);
    const cinema = NATIVE_LOOKS.slice(0, 2);
    expect(cinema.map((look) => look.id)).toEqual(['gr4-cinema-yellow', 'gr4-cinema-green']);
    expect(NATIVE_LOOKS.map((look) => look.id)).toEqual(NATIVE_LOOK_IDS);
    expect(ids(missingNativeLooks(imported.slice(0, 1), cinema))).toEqual(ids(cinema));
    expect(hasNativeLooks(imported.slice(0, 4))).toBe(false);
    expect(hasNativeLooks(NATIVE_LOOKS.map((look) => effect(look.id, 'native')))).toBe(true);
    const color = (camera: string) => nativeLooksFor(camera).filter((look) => !look.monochrome);
    expect(ids(missingNativeLooks(imported.slice(2, 3), color('gr3')))).toEqual(['gr4-cinema-yellow', 'gr2-positive-film']);
    expect(ids(missingNativeLooks(imported.slice(0, 1), color('gr4')))).toEqual(['gr2-positive-film-gr4']);
  });
});

describe('nativeProblem', () => {
  it('maps the grku-core messages', () => {
    const problem = (message: string) => nativeProblem(new Error(message));
    expect(problem('This is not a supported GR IV firmware file. Supported versions: 1.11, 1.20')).toBe(
      'unsupported',
    );
    expect(problem('This is not a supported GR II firmware file. Supported version: 3.00')).toBe('unsupported');
    expect(problem('The ZIP file has no fwdc248b.bin')).toBe('notFirmware');
    expect(problem('Invalid ZIP file: invalid Zip archive')).toBe('notFirmware');
    expect(problem('The file is too large')).toBe('tooLarge');
    expect(problem('fwdc248b.bin is too large')).toBe('tooLarge');
    expect(problem('The firmware read timed out')).toBe('failed');
    expect(nativeProblem('unknown')).toBe('failed');
  });
});

/** grku-wasm, which the page builds before its checks (`pnpm wasm`). */
async function loadWasm() {
  const wasm = await import('../wasm/grku_wasm.js');
  await wasm.default({
    module_or_path: readFileSync(resolve(import.meta.dirname, '../wasm/grku_wasm_bg.wasm')),
  });
  return wasm;
}

// The analytic stand-in of the grku-wasm tests: any rising table works for these checks.
const baseGamma = Uint16Array.from({ length: 256 }, (_, i) => Math.floor((i / 255) ** 0.45 * 16000));

describe('nativeLooks errors', () => {
  it('give the problems that the dialog explains', async () => {
    const wasm = await loadWasm();
    const problem = (bytes: Uint8Array) => {
      try {
        wasm.nativeLooks(bytes, baseGamma);
      } catch (error) {
        return nativeProblem(error);
      }
      throw new Error('nativeLooks read the file');
    };
    expect(problem(new Uint8Array(64))).toBe('unsupported');
    expect(problem(new TextEncoder().encode('PK not a zip'))).toBe('notFirmware');
  });
});

// A check with an official GR IV ZIP, which the repository does not hold. Set GRKU_TEST_GR4_ZIP to
// its path to run it.
const zip = process.env.GRKU_TEST_GR4_ZIP;

describe.skipIf(!zip)('nativeLooks with an official GR IV ZIP', () => {
  it('reads Cinema Yellow and Cinema Green', async () => {
    const wasm = await loadWasm();
    const read = wasm.nativeLooks(readFileSync(zip!), baseGamma).map((look) => {
      try {
        return { id: look.id, name: look.name, version: look.version, blob: look.blob, preview: look.preview };
      } finally {
        look.free();
      }
    });
    expect(read.map((look) => look.id)).toEqual(NATIVE_LOOKS.map((look) => look.id));
    expect(read.map((look) => look.name)).toEqual(NATIVE_LOOKS.map((look) => look.name));
    for (const look of read) {
      expect(['1.11', '1.20']).toContain(look.version);
      expect(new TextDecoder().decode(look.blob.subarray(0, 8))).toBe('GRFX0001');
      expect(look.preview.length).toBe(33 ** 3 * 3);
    }
  });
});
