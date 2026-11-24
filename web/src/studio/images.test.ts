import { describe, expect, it } from 'vitest';
import { fitSize, hasAlpha, IMAGE_MAX } from './images';
import { canAddLayer, emptyDoc, FREE_LAYERS, imageLayer, layerBox, parse, resizeLayer, serialize, textLayer } from './model';

describe('pictures as layers', () => {
  it('makes a large picture small and keeps a small one', () => {
    expect(fitSize(6000, 4000)).toEqual({ width: IMAGE_MAX, height: 960 });
    expect(fitSize(3000, 4000)).toEqual({ width: 1080, height: IMAGE_MAX });
    expect(fitSize(500, 300)).toEqual({ width: 500, height: 300 });
  });

  it('finds transparency', () => {
    expect(hasAlpha(new Uint8ClampedArray([1, 2, 3, 255, 4, 5, 6, 255]))).toBe(false);
    expect(hasAlpha(new Uint8ClampedArray([1, 2, 3, 255, 4, 5, 6, 0]))).toBe(true);
  });

  it('boxes a picture at its ratio, on its longer side', () => {
    expect(layerBox(imageLayer('a1', 2, { size: 400 }))).toEqual({ w: 400, h: 200 });
    expect(layerBox(imageLayer('a1', 0.5, { size: 400 }))).toEqual({ w: 200, h: 400 });
  });

  it('keeps a picture layer through storage, with its values in range', () => {
    const layer = imageLayer('abc123', 1.5, { size: 300, flip: true });
    const doc = { ...emptyDoc(), layers: [layer] };
    expect(parse(serialize(doc), () => 0)?.layers[0]).toEqual(layer);
    const bad = serialize({ ...doc, layers: [{ ...layer, image: '../x', size: 99999 }] as never });
    expect(parse(bad, () => 0)?.layers).toEqual([]);
    const big = resizeLayer(doc, layer.id, 99999).layers[0]!;
    expect(big.type === 'image' && big.size).toBe(1440);
  });

  it('counts pictures in the layers of the free Studio', () => {
    const layers = Array.from({ length: FREE_LAYERS - 1 }, () => textLayer());
    const doc = { ...emptyDoc(), layers };
    expect(canAddLayer(doc, false)).toBe(true);
    const full = { ...doc, layers: [...layers, imageLayer('p1', 1)] };
    expect(canAddLayer(full, false)).toBe(false);
    expect(canAddLayer(full, true)).toBe(true);
  });
});
