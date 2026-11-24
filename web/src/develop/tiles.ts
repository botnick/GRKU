/**
 * The camera's own menu tiles of the modules of the Develop page: the module tile, and the tile of
 * each value where ADJ shows one (module.toml `tiles`), 40 x 40 pixels each.
 */
import type { ModuleName } from './settings';
import dateModule from '../../../modules/date/tiles/0-module.png';
import date1 from '../../../modules/date/tiles/1-yy-m-d.png';
import date2 from '../../../modules/date/tiles/2-yy-m-d-time.png';
import date3 from '../../../modules/date/tiles/3-m-d-yy.png';
import date4 from '../../../modules/date/tiles/4-d-m-yy.png';
import date5 from '../../../modules/date/tiles/5-d-m-yy-time.png';
import glowModule from '../../../modules/glow/tiles/0-module.png';
import bloomOff from '../../../modules/glow/tiles/off-bloom.png';
import bloomWeak from '../../../modules/glow/tiles/1-bloom-weak.png';
import bloomMedium from '../../../modules/glow/tiles/1-bloom.png';
import bloomStrong from '../../../modules/glow/tiles/3-bloom-strong.png';
import halationOff from '../../../modules/glow/tiles/off-halation.png';
import halationWeak from '../../../modules/glow/tiles/4-halation-weak.png';
import halationMedium from '../../../modules/glow/tiles/2-halation.png';
import halationStrong from '../../../modules/glow/tiles/6-halation-strong.png';
import diffusionModule from '../../../modules/diffusion/tiles/0-module.png';
import filterOff from '../../../modules/diffusion/tiles/off-filter.png';
import filterEighth from '../../../modules/diffusion/tiles/1-eighth.png';
import filterQuarter from '../../../modules/diffusion/tiles/2-quarter.png';
import filterHalf from '../../../modules/diffusion/tiles/3-half.png';
import softOff from '../../../modules/diffusion/tiles/off-softness.png';
import softLow from '../../../modules/diffusion/tiles/softness-low.png';
import softMedium from '../../../modules/diffusion/tiles/softness-medium.png';
import softHigh from '../../../modules/diffusion/tiles/softness-high.png';
import leakModule from '../../../modules/lightleak/tiles/0-module.png';
import leak1 from '../../../modules/lightleak/tiles/1-custom.png';
import leak2 from '../../../modules/lightleak/tiles/2-faded.png';
import leak3 from '../../../modules/lightleak/tiles/3-dusty.png';
import leak4 from '../../../modules/lightleak/tiles/4-leaky.png';
import leak5 from '../../../modules/lightleak/tiles/5-expired.png';
import grainModule from '../../../modules/grain/tiles/0-module.png';
import grainOff from '../../../modules/grain/tiles/off.png';
import grain1 from '../../../modules/grain/tiles/1-weak.png';
import grain2 from '../../../modules/grain/tiles/2-medium.png';
import grain3 from '../../../modules/grain/tiles/3-strong.png';
import grain4 from '../../../modules/grain/tiles/4-extra.png';
import borderModule from '../../../modules/border/tiles/0-module.png';
import border1 from '../../../modules/border/tiles/1-thin.png';
import border2 from '../../../modules/border/tiles/2-wide.png';
import border3 from '../../../modules/border/tiles/3-instant.png';

/** The tile of each module. */
export const MODULE_TILES: Readonly<Record<ModuleName, string>> = {
  date: dateModule,
  glow: glowModule,
  diffusion: diffusionModule,
  leak: leakModule,
  grain: grainModule,
  border: borderModule,
};

/** The Off tile of the camera (the struck symbol), for the Off row of a page without its own. */
const OFF = grainOff;

/** The tile of each value of the settings that ADJ shows with tiles, value 0 first. */
export const VALUE_TILES = {
  grainLevel: [grainOff, grain1, grain2, grain3, grain4],
  bloom: [bloomOff, bloomWeak, bloomMedium, bloomStrong],
  halation: [halationOff, halationWeak, halationMedium, halationStrong],
  leakLook: [OFF, leak1, leak2, leak3, leak4, leak5],
  diffusionStrength: [filterOff, filterEighth, filterQuarter, filterHalf],
  softness: [softOff, softLow, softMedium, softHigh],
  dateStyle: [OFF, date1, date2, date3, date4, date5],
  borderStyle: [OFF, border1, border2, border3],
} as const;
