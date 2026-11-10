import { describe, expect, it } from 'vitest';
import { amountDue, DEFAULT_LOOKS, FREE, FREE_SLOTS, hasTier, packOf, slotsOf, takesSlot, usedSlots, type Entitlement } from './plus';
import { MAX_EFFECTS, type Effect } from './catalog';

const box = (brand: string, name: string, extra: Record<string, unknown> = {}, number?: string) =>
  ({ id: `${brand}-${name}`.toLowerCase(), name, icon: '', monochrome: false, cover: { template: 'box', brand, name, number }, look: '', ...extra }) as unknown as Effect;

describe('packOf', () => {
  it('sorts the shelf into its packs, and leaves the camera looks out', () => {
    expect(packOf(box('Kodak', 'PORTRA'))).toBe('kodak');
    expect(packOf(box('FUJIFILM', 'SUPERIA'))).toBe('fuji');
    expect(packOf(box('AGFA', 'VISTA'))).toBe('indie');
    expect(packOf(box('FUJIFILM', 'VELVIA', {}, '100'))).toBe('slide');
    expect(packOf(box('Kodak', 'TRI-X', { monochrome: true }))).toBe('mono');
    expect(packOf(box('FUJIFILM', 'INSTAX'))).toBe('instant');
    expect(packOf({ id: 'c', name: 'c', icon: '', monochrome: false, cover: { template: 'cine', brand: 'Kodak', name: '5219' }, look: '' } as unknown as Effect)).toBe('cinema');
    expect(packOf(box('RICOH', 'POSITIVE'))).toBeNull();
    // The film simulations of the FUJIFILM cameras are camera looks, the monochrome one too.
    expect(packOf(box('FUJIFILM', 'VELVIA'))).toBeNull();
    expect(packOf(box('FUJIFILM', 'CLASSIC', {}, 'CHROME'))).toBeNull();
    expect(packOf(box('FUJIFILM', 'ACROS', { monochrome: true }))).toBeNull();
  });
});

describe('takesSlot and usedSlots', () => {
  const portra = box('Kodak', 'PORTRA');
  const velvia = box('FUJIFILM', 'VELVIA', {}, '100');
  const positive = box('RICOH', 'POSITIVE');
  const lut = box('X', 'LUT', { imported: { kind: 'lut' } });

  it('counts catalog looks outside the owned packs, never imports or camera looks', () => {
    expect(takesSlot(portra, FREE)).toBe(true);
    expect(takesSlot(positive, FREE)).toBe(false);
    expect(takesSlot(lut, FREE)).toBe(false);
    expect(takesSlot(velvia, { ...FREE, packs: ['slide'] })).toBe(false);
    expect(takesSlot(portra, { ...FREE, plus: true })).toBe(false);
    expect(usedSlots([portra, velvia, positive, lut], new Set([portra.id, velvia.id, positive.id, lut.id]), FREE)).toBe(2);
  });

  it('allows the free slots, 25 after the slots tier, and the card limit with the shelf', () => {
    expect(slotsOf(FREE)).toBe(FREE_SLOTS);
    expect(slotsOf({ ...FREE, slots: 25 })).toBe(25);
    expect(slotsOf({ ...FREE, plus: true })).toBe(MAX_EFFECTS);
  });
});

describe('amountDue and hasTier', () => {
  const bought: Entitlement = { packs: ['kodak'], slots: 25, plus: false, paid: 128 };
  it('credits earlier payments toward the shelf and the slots, not toward a pack', () => {
    expect(amountDue('plus', FREE)).toBe(199);
    expect(amountDue('plus', bought)).toBe(71);
    expect(amountDue('slots25', { ...FREE, paid: 190 })).toBe(20);
    expect(amountDue('pack:fuji', bought)).toBe(49);
  });
  it('knows what is already owned', () => {
    expect(hasTier('pack:kodak', bought)).toBe(true);
    expect(hasTier('slots25', bought)).toBe(true);
    expect(hasTier('plus', bought)).toBe(false);
    expect(hasTier('pack:fuji', { ...FREE, plus: true })).toBe(true);
  });
});

describe('DEFAULT_LOOKS', () => {
  it('leaves free slots open, with Positive GRII on top', () => {
    expect(DEFAULT_LOOKS[0]).toBe('positive-film-grii-v1');
    expect(DEFAULT_LOOKS.length - 1).toBeLessThan(FREE_SLOTS);
  });
});
