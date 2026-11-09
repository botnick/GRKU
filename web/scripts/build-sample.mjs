// Builds a sample from a camera JPEG, with its scene-linear pixels estimated by linear-sample.mjs.
// The full JPEG stays outside the repository; web/samples/<name>.json describes it.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { encodeLinear } from '../src/preview/linear.ts';
import { linearSample } from './linear-sample.mjs';

const [spec, input, tablePath] = process.argv.slice(2);
if (!spec || !input || !tablePath) {
  throw new Error(
    'Usage: node scripts/build-sample.mjs SPEC.json /path/to/photo.jpg /path/to/effects/gr3-2.10/preview/standard.lut\n' +
      'SPEC names the sample (name, key), the photo (title, author, license, licenseUrl, camera, url, page, sha256).',
  );
}
const SOURCE = JSON.parse(await readFile(spec, 'utf8'));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const source = await readFile(input);
if (sha256(source) !== SOURCE.sha256) throw new Error(`Expected the photo of ${spec}: ${SOURCE.title}`);
const table = await readFile(tablePath);
const { image, meanError } = linearSample(source, table);

const bytes = gzipSync(encodeLinear(image), { level: 9 });
const output = new URL('../public/samples/', import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL(`${SOURCE.name}.grlinear`, output), bytes);
await writeFile(
  new URL(`${SOURCE.name}.json`, output),
  JSON.stringify(
    {
      source: SOURCE.url,
      sourcePage: SOURCE.page,
      sourceSha256: SOURCE.sha256,
      title: SOURCE.title,
      author: SOURCE.author,
      license: SOURCE.license,
      licenseUrl: SOURCE.licenseUrl,
      camera: SOURCE.camera,
      decoder: 'jpeg-js 0.4.4',
      settings: {
        input: 'sRGB JPEG',
        outputColor: 'linear sRGB, estimated by inverting preview/standard.lut',
        standardTableSha256: sha256(table),
        bits: 16,
        resize: 'area resampling in linear light',
      },
      width: image.width,
      height: image.height,
      sha256: sha256(bytes),
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Sample: ${image.width} x ${image.height}, ${bytes.length} bytes. ` +
    `Mean difference between the baseline and the JPEG: ${meanError.toFixed(2)} of 255.`,
);
