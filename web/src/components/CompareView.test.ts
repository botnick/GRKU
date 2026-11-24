import { describe, expect, it } from 'vitest';
import { gesture, SLOP } from './CompareView';

describe('the before-and-after view on a touch screen', () => {
  it('drags the divider only after a sideways movement, and leaves a vertical one to the page', () => {
    expect(gesture(2, 1)).toBe('wait');
    expect(gesture(SLOP + 1, 2)).toBe('drag');
    expect(gesture(-(SLOP + 4), 3)).toBe('drag');
    expect(gesture(3, SLOP + 1)).toBe('scroll');
    expect(gesture(2, -(SLOP + 8))).toBe('scroll');
    // A diagonal that goes more down than across is a scroll.
    expect(gesture(SLOP + 2, SLOP + 3)).toBe('scroll');
  });
});
