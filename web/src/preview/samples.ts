import { siteUrl } from '../catalog';
import { decodeLinear, MAX_EDGE } from './linear';
import type { Source } from './render';

/**
 * Electric Wheels in Fort Lauderdale, a GR IIIx JPEG by Austin Kirk (CC BY 2.0): rental bikes by the
 * beach in daylight. scripts/build-sample.mjs estimates its linear pixels by inverting the Standard
 * development of the preview (web/samples/electric-wheels.json).
 */
export const DEFAULT_SAMPLE: Source = {
  key: 'gr-iiix-electric-wheels-v1',
  load: async () => {
    const response = await fetch(siteUrl('samples/electric-wheels.grlinear'));
    if (!response.ok || !response.body) throw new Error('Cannot load sample photo');
    const reader = response.body.pipeThrough(new DecompressionStream('gzip')).getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 16 + MAX_EDGE * MAX_EDGE * 6) throw new Error('Sample photo is too large');
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
      reader.releaseLock();
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return decodeLinear(bytes.buffer);
  },
};
