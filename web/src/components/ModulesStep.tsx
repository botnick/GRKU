import { useRef, type ReactNode } from 'react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Strings } from '../i18n';
import { LANDING_PHOTOS, landingImage } from '../landing';
import type { MODULES, ModuleKey } from '../modules';
import { ChangeBadge } from './Workbench';
import { MODULES_MAX } from '../modules';
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
const TILES: Record<ModuleKey, string> = {
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

type Photo = keyof typeof LANDING_PHOTOS;

/** The example photos of the modules: the image in public/landing/, the module, the setting, the photo. */
const EXAMPLES: readonly { image: string; before?: string; beforeDetail?: (t: Strings) => string; module: ModuleKey; detail: (t: Strings) => string; photo: Photo }[] = [
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
function Example({ before, beforeDetail = 'Off', after, alt, detail, compareLabel }: { before?: string; beforeDetail?: string; after: string; alt: string; detail: string; compareLabel: string }) {
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });
  const frame = 'relative aspect-[3/2] overflow-hidden rounded-lg bg-black';
  if (!before) {
    return (
      <div className={frame}>
        <img src={landingImage(after)} alt={alt} width="1200" height="800" loading="lazy" className="absolute inset-0 size-full object-cover" />
        <Badge className="pointer-events-none absolute top-2 right-2 z-[2] rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] text-foreground">{detail}</Badge>
      </div>
    );
  }
  return (
    <div className={frame}>
      <Provider {...comparison}>
        <Root className="image-comparison">
          <Item item="itemOne">
            <img src={landingImage(before)} alt={`${alt} — ${beforeDetail}`} width="1200" height="800" loading="lazy" />
          </Item>
          <Item item="itemTwo" className="comparison-effect">
            <img src={landingImage(after)} alt={alt} width="1200" height="800" loading="lazy" />
          </Item>
          <HandleRoot aria-label={compareLabel}>
            <Handle buttonStyle={{ width: 28, height: 28, gap: '0.2rem' }} />
          </HandleRoot>
        </Root>
      </Provider>
      <Badge className="pointer-events-none absolute top-2 left-2 z-[2] rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] text-foreground">{beforeDetail}</Badge>
      <Badge className="pointer-events-none absolute top-2 right-2 z-[2] rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] text-foreground">{detail}</Badge>
    </div>
  );
}

/**
 * The modules of the camera menu: a card per module to turn it on, the menu as the camera will
 * show it, and example photos of what the modules do.
 */
export function ModulesStep({
  strings: t,
  modules,
  enabled,
  onToggle,
  installed,
  planned,
  emptyLooks,
  lookCount,
  recipes = null,
}: {
  strings: Strings;
  /** The modules that the camera offers, in menu order. */
  modules: readonly (typeof MODULES)[number][];
  enabled: ReadonlySet<ModuleKey>;
  onToggle: (key: ModuleKey) => void;
  /** The module IDs on the connected card, or null without GRKU on a card. */
  installed: readonly string[] | null;
  /** The module IDs that the package will hold. */
  planned: readonly string[];
  /** Film Look is on with no film look checked. */
  emptyLooks: boolean;
  /** The number of film looks of the package, for the Film Look row of the menu. */
  lookCount: ReactNode;
  /** The recipes of the camera and the mode dial, while the Recipes module is on. */
  recipes?: ReactNode;
}) {
  const visible = modules.filter((module) => enabled.has(module.key));
  const full = visible.length >= MODULES_MAX;
  const strip = useRef<HTMLDivElement>(null);
  /** Scrolls the example strip by one frame. */
  function scrollExamples(direction: 1 | -1) {
    const node = strip.current;
    if (!node) return;
    const frame = node.querySelector('figure');
    node.scrollBy({ left: direction * ((frame?.clientWidth ?? 400) + 16), behavior: 'smooth' });
  }
  return (
    <div className="flex flex-col gap-10">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end gap-3 text-sm tabular-nums">
          <Progress value={Math.min(100, (visible.length / MODULES_MAX) * 100)} className="w-20 [&>div]:bg-brand" aria-hidden="true" />
          <span>
            <b className="font-semibold">{visible.length}</b>
            <span className="text-muted-foreground"> / {MODULES_MAX}</span>
          </span>
        </div>
        <ul role="group" aria-label={t.modules} className="divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {modules.map((module) => {
            const on = enabled.has(module.key);
            return (
              <li key={module.key} className={cn('flex items-start gap-4 p-4 transition-opacity', !on && 'opacity-60')}>
                <img src={TILES[module.key]} alt="" width="40" height="40" className="mt-0.5 size-10 shrink-0 rounded-[3px] [image-rendering:pixelated]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor={`module-${module.key}`} className="flex cursor-pointer flex-wrap items-center gap-2 text-[15px] font-semibold">
                      {t.moduleNames[module.key]}
                      {installed && <ChangeBadge on={installed.includes(module.id)} checked={planned.includes(module.id)} strings={t} />}
                    </Label>
                    <Switch id={`module-${module.key}`} checked={on} disabled={!on && full} onCheckedChange={() => onToggle(module.key)} aria-label={t.moduleNames[module.key]} />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.modulesText[module.key]}</p>
                  {module.key === 'filmLook' && emptyLooks && <p className="mt-1 text-sm text-destructive">{t.filmLookEmpty}</p>}
                </div>
              </li>
            );
          })}
        </ul>
        </div>

        <Card
          className="gap-0 rounded-2xl border-input bg-[#0c0c0c] py-0 shadow-[0_24px_60px_rgba(0,0,0,0.5)] lg:sticky lg:top-20"
          role="img"
          aria-label={t.landing.menuCaption}
        >
          <CardHeader className="block border-b px-5 py-3 font-mono text-[13px] font-medium tracking-[0.04em] text-muted-foreground">
            GRKU
          </CardHeader>
          <CardContent className="px-2.5 pt-1 pb-1">
            <ul className="m-0 list-none p-0">
              {visible.map((module) => (
                <li key={module.key} className="flex items-center gap-3 border-b border-[#161616] px-2.5 py-1.5 text-[15px] font-medium last:border-b-0">
                  <img src={TILES[module.key]} alt="" width="40" height="40" className="size-8 rounded-[3px] [image-rendering:pixelated]" />
                  <span>{t.moduleNames[module.key]}</span>
                  {module.key === 'filmLook' && (
                    <span className="ml-auto font-mono text-[13px] whitespace-nowrap text-muted-foreground">{lookCount}</span>
                  )}
                </li>
              ))}
              {visible.length === 0 && <li className="px-2.5 py-3 text-sm text-destructive">{t.noModules}</li>}
            </ul>
          </CardContent>
          <CardFooter className="px-5 pt-2 pb-3 text-xs text-muted-foreground/70">{t.landing.menuCaption}</CardFooter>
        </Card>
      </div>
      {recipes}

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-muted-foreground">{t.examples}</h3>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="icon" className="size-8" aria-label={t.compare} onClick={() => scrollExamples(-1)}>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="size-8" aria-label={t.compare} onClick={() => scrollExamples(1)}>
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div ref={strip} className="-mx-gutter flex gap-4 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(90deg,#000_0,#000_calc(100%-56px),transparent)]" role="group" aria-label={t.examples}>
          {EXAMPLES.map((example, index) => {
            const title = t.moduleNames[example.module];
            const detail = example.detail(t);
            const credit = LANDING_PHOTOS[example.photo];
            return (
              <figure key={example.image} className="m-0 w-[min(420px,82vw)] shrink-0">
                <Example before={example.before} beforeDetail={example.beforeDetail?.(t)} after={example.image} alt={`${title} — ${detail}`} detail={detail} compareLabel={t.compare} />
                <figcaption className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-2.5 text-sm text-muted-foreground">
                  <span className="font-mono text-xs text-muted-foreground/70">{String(index + 1).padStart(2, '0')}</span>
                  <b className="font-semibold text-foreground">{title}</b>
                  <span>{detail}</span>
                  <a className="w-full text-xs text-muted-foreground/70 hover:text-foreground" href={credit.source} target="_blank" rel="noreferrer">
                    {credit.author} · {credit.license} · {credit.camera}
                  </a>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
