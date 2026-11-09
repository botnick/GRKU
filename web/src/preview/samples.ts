import { siteUrl } from '../catalog';
import { decodeLinear, MAX_EDGE } from './linear';
import type { Source } from './render';

/** The credit of a sample photo, for the line under the preview. */
export interface SampleCredit {
  title: string;
  author: string;
  license: string;
  camera: string;
  source: string;
}

/** A sample photo of the preview: its source, its thumbnail, and its credit. */
export interface Sample {
  source: Source;
  thumbnail: string;
  credit: SampleCredit;
}

/** Reads the scene-linear sample `name` of public/samples/ (scripts/build-sample.mjs). */
async function loadSample(name: string) {
  const response = await fetch(siteUrl(`samples/${name}.grlinear`));
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
}

const sample = (name: string, key: string, credit: SampleCredit): Sample => ({
  source: { key, load: () => loadSample(name) },
  thumbnail: siteUrl(`samples/${name}.jpg`),
  credit,
});

/**
 * The sample photos of the preview, GR photos from Wikimedia Commons (web/samples/<name>.json
 * describes each): a beach street in daylight, a tram, a neon night, a lake, a temple, and a beach.
 * scripts/build-sample.mjs estimates the linear pixels of each by inverting the Standard
 * development of the preview.
 */
export const SAMPLES: readonly Sample[] = [
  sample("electric-wheels", "gr-iiix-electric-wheels-v1", { title: "Electric Wheels in Fort Lauderdale, Florida", author: "Austin Kirk", license: "CC BY 2.0", camera: "RICOH GR IIIx", source: "https://www.flickr.com/photos/aukirk/53383031689/" }),
  sample("tram", "gr-iiix-tram-v1", { title: "Tramway (53731862585)", author: "MIKI Yoshihito", license: "CC BY 2.0", camera: "RICOH GR IIIx", source: "https://commons.wikimedia.org/wiki/File:Tramway_(53731862585).jpg" }),
  sample("neon", "gr-iv-neon-v1", { title: "Chicken sandwiches in Vegas", author: "Sergiy Galyonkin", license: "CC BY-SA 4.0", camera: "RICOH GR IV", source: "https://commons.wikimedia.org/wiki/File:Chicken_sandwiches_in_Vegas.jpg" }),
  sample("achensee", "gr-iii-achensee-v1", { title: "Achensee nördlich von Pertisau", author: "Stephan van Helden", license: "CC BY-SA 4.0", camera: "RICOH GR III", source: "https://commons.wikimedia.org/wiki/File:Achensee_n%C3%B6rdlich_von_Pertisau.jpg" }),
  sample("temple", "gr-ii-temple-v1", { title: "Oguchi Joushi Kouen 1", author: "Mobnoboka", license: "CC BY-SA 4.0", camera: "RICOH GR II", source: "https://commons.wikimedia.org/wiki/File:Oguchi_Joushi_Kouen_1.jpg" }),
  sample("beach", "gr-iiix-beach-v1", { title: "Paradise found - Flickr - matthias.ripp", author: "Matthias Ripp", license: "CC BY 2.0", camera: "RICOH GR IIIx", source: "https://commons.wikimedia.org/wiki/File:Paradise_found_-_Flickr_-_matthias.ripp.jpg" }),
];

/** The first sample: Electric Wheels in Fort Lauderdale, a GR IIIx JPEG by Austin Kirk (CC BY 2.0). */
export const DEFAULT_SAMPLE: Source = SAMPLES[0]!.source;

/** The sample of a preview source, or undefined for a person's own photo. */
export const sampleOf = (source: Source): Sample | undefined => SAMPLES.find((item) => item.source === source);
