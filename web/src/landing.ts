import { siteUrl } from './catalog';
export { LANDING_LOOKS, LANDING_PHOTOS } from './landing-data';

/** The Framing ratios in the order of the camera menu, with their width over height. */
export const LANDING_RATIOS = [
  { label: 'XPan 65:24', ratio: 65 / 24 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '2.35:1', ratio: 2.35 },
  { label: '1:1', ratio: 1 },
  { label: '5:4', ratio: 5 / 4 },
  { label: '7:6', ratio: 7 / 6 },
] as const;

/** The id of the landing hero. */
export const LANDING_HERO = 'landing-hero';

/** The guide styles in the order of the camera menu (`landing.guideRows`). */
export const LANDING_GUIDES = ['off', 'thirds', 'center', 'golden', 'diagonals'] as const;
export type LandingGuide = (typeof LANDING_GUIDES)[number];

/** The image of the landing page with the name `name` in public/landing/. */
export function landingImage(name: string): string {
  return siteUrl(`landing/${name}`);
}


/** The guide lines inside a frame, in percent of its width and height. */
export function guideLines(guide: LandingGuide): readonly (readonly [number, number, number, number])[] {
  const at = (p: number) =>
    [
      [p, 0, p, 100],
      [100 - p, 0, 100 - p, 100],
      [0, p, 100, p],
      [0, 100 - p, 100, 100 - p],
    ] as const;
  switch (guide) {
    case 'thirds':
      return at(100 / 3);
    case 'golden':
      return at(38.2);
    case 'center':
      return [
        [46, 50, 54, 50],
        [50, 44, 50, 56],
      ];
    case 'diagonals':
      return [
        [0, 0, 100, 100],
        [100, 0, 0, 100],
      ];
    default:
      return [];
  }
}

/**
 * The width of a crop of `ratio` inside the 3:2 display, in percent of the display width: the
 * full width for a wider ratio, the full height for a narrower one.
 */
export function cropWidth(ratio: number): number {
  return ratio >= 1.5 ? 100 : (ratio / 1.5) * 100;
}
