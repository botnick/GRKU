// The menu tiles of the modules and the example photos, which the home page and the modules step
// both show. Its own module, so the home page loads them without the install steps.
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Badge } from '@/components/ui/badge';
import type { Strings } from '../i18n';
import { LANDING_PHOTOS, landingPicture } from '../landing';
import type { ModuleKey } from '../modules';
import tileFilmLook from '../../../modules/film-look/tiles/0-module.png';
import tileFraming from '../../../modules/framing/tiles/0-module.png';
import tileCrop from '../../../modules/crop/tiles/0-module.png';
import tileGuides from '../../../modules/guides/tiles/0-module.png';
import tileDate from '../../../modules/date/tiles/0-module.png';
import tileGlow from '../../../modules/glow/tiles/0-module.png';
import tileGrain from '../../../modules/grain/tiles/0-module.png';
import tileBorder from '../../../modules/border/tiles/0-module.png';
import tileLightLeak from '../../../modules/lightleak/tiles/0-module.png';
import tileDiffusion from '../../../modules/diffusion/tiles/0-module.png';
import tileRecipes from '../../../modules/recipes/tiles/0-module.png';

/** The menu tile of each module, as the camera shows it. */
export const TILES: Record<ModuleKey, string> = {
  filmLook: tileFilmLook,
  framing: tileFraming,
  crop: tileCrop,
  guides: tileGuides,
  dateStamp: tileDate,
  glow: tileGlow,
  grain: tileGrain,
  border: tileBorder,
  lightLeak: tileLightLeak,
  diffusion: tileDiffusion,
  recipes: tileRecipes,
};

export type Photo = keyof typeof LANDING_PHOTOS;

/** The example photos of the modules: the image in public/landing/, the module, the setting, the photo. */
export const EXAMPLES: readonly { image: string; before?: string; beforeDetail?: (t: Strings) => string; module: ModuleKey; detail: (t: Strings) => string; photo: Photo }[] = [
  { image: 'framing-xpan.jpg', before: 'framing-xpan-before.jpg', module: 'framing', detail: () => 'XPan 65:24', photo: 'achensee' },
  { image: 'crop-50.jpg', before: 'crop-50-before.jpg', module: 'crop', detail: () => '50mm', photo: 'tram' },
  { image: 'guides-thirds.jpg', before: 'guides-thirds-before.jpg', module: 'guides', detail: (t) => t.landing.guideRows[1] ?? '', photo: 'clouds' },
  { image: 'date-gr2.jpg', before: 'date-before.jpg', module: 'dateStamp', detail: (t) => t.landing.dateLooks[2] ?? '', photo: 'wakkanai' },
  { image: 'date-gr1s.jpg', before: 'date-before.jpg', module: 'dateStamp', detail: (t) => t.landing.dateLooks[1] ?? '', photo: 'wakkanai' },
  { image: 'bloom.jpg', before: 'glow-off.jpg', module: 'glow', detail: (t) => t.landing.glowKinds[1] ?? '', photo: 'hokkaido' },
  { image: 'halation.jpg', before: 'glow-off.jpg', module: 'glow', detail: (t) => t.landing.glowKinds[2] ?? '', photo: 'hokkaido' },
  { image: 'leak-leaky.jpg', before: 'leak-leaky-before.jpg', module: 'lightLeak', detail: () => 'Leaky', photo: 'beach' },
  { image: 'leak-dusty.jpg', before: 'leak-dusty-before.jpg', module: 'lightLeak', detail: () => 'Dusty', photo: 'nathans' },
  { image: 'diffusion-half.jpg', before: 'diffusion-half-before.jpg', module: 'diffusion', detail: () => '1/2 · Streak', photo: 'neon' },
  { image: 'border-white.jpg', before: 'border-white-before.jpg', module: 'border', detail: () => 'White 3%', photo: 'temple' },
  // Grain comes from the camera itself, so the comparison is Weak against Extra Strong.
  { image: 'grain-4.jpg', before: 'grain-1.jpg', beforeDetail: (t) => t.landing.grainLevels[0] ?? '', module: 'grain', detail: (t) => t.landing.grainLevels[3] ?? '', photo: 'tram' },
];

/** A frame of the strip: the photo without the module on the left, with it on the right, under a handle. */
/** The width of an example: most of a phone screen, half the page on a tablet, a third on a computer. */
const EXAMPLE_SIZES = '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 82vw';

export function Example({ before, beforeDetail = 'Off', after, alt, detail, compareLabel }: { before?: string; beforeDetail?: string; after: string; alt: string; detail: string; compareLabel: string }) {
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });
  const frame = 'relative aspect-[3/2] overflow-hidden rounded-lg bg-black';
  if (!before) {
    return (
      <div className={frame}>
        <img {...landingPicture(after, EXAMPLE_SIZES)} alt={alt} width="1200" height="800" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        <Badge className="pointer-events-none absolute top-2 right-2 z-[2] rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] text-photo-foreground">{detail}</Badge>
      </div>
    );
  }
  return (
    <div className={frame}>
      <Provider {...comparison}>
        <Root className="image-comparison">
          <Item item="itemOne">
            <img {...landingPicture(before, EXAMPLE_SIZES)} alt={`${alt} — ${beforeDetail}`} width="1200" height="800" loading="lazy" decoding="async" />
          </Item>
          <Item item="itemTwo" className="comparison-effect">
            <img {...landingPicture(after, EXAMPLE_SIZES)} alt={alt} width="1200" height="800" loading="lazy" decoding="async" />
          </Item>
          <HandleRoot aria-label={compareLabel}>
            <Handle buttonStyle={{ width: 28, height: 28, gap: '0.2rem' }} />
          </HandleRoot>
        </Root>
      </Provider>
      <Badge className="pointer-events-none absolute top-2 left-2 z-[2] rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] text-photo-foreground">{beforeDetail}</Badge>
      <Badge className="pointer-events-none absolute top-2 right-2 z-[2] rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] text-photo-foreground">{detail}</Badge>
    </div>
  );
}
