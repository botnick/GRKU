import { describe, expect, it } from 'vitest';
import { GRID_PAGE, gridLooks } from './gridPage';

const looks = Array.from({ length: 135 }, (_, index) => index);

describe('gridLooks', () => {
  it('fills whole pages with the import tile as the last place', () => {
    expect(gridLooks(looks, 1, true, -1)).toEqual(looks.slice(0, GRID_PAGE - 1));
    expect(gridLooks(looks, 1, false, -1)).toHaveLength(GRID_PAGE);
    expect(gridLooks(looks, 2, true, 5)).toHaveLength(2 * GRID_PAGE - 1);
  });

  it('shows every match when they fit', () => {
    expect(gridLooks(looks.slice(0, 7), 1, true, -1)).toHaveLength(7);
    expect(gridLooks(looks, 9, true, 106)).toEqual(looks);
  });

  it('keeps the previewed look in the last place of the page', () => {
    const shown = gridLooks(looks, 1, true, 106);
    expect(shown).toHaveLength(GRID_PAGE - 1);
    expect(shown.at(-1)).toBe(106);
    expect(shown.at(-2)).toBe(GRID_PAGE - 3);
  });
});
