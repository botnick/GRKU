import type { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Strings } from '../i18n';
import { LANDING_PHOTOS, landingImage } from '../landing';
import type { MODULES, ModuleKey } from '../modules';
import { ChangeBadge } from './Workbench';
import tileFilmLook from '../../../modules/film-look/tiles/0-module.png';
import tileFraming from '../../../modules/framing/tiles/0-module.png';
import tileGuides from '../../../modules/guides/tiles/0-module.png';
import tileDate from '../../../modules/date/tiles/0-module.png';
import tileGlow from '../../../modules/glow/tiles/0-module.png';
import tileGrain from '../../../modules/grain/tiles/0-module.png';
import tileBorder from '../../../modules/border/tiles/0-module.png';
import tileLightLeak from '../../../modules/lightleak/tiles/0-module.png';
import tileDiffusion from '../../../modules/diffusion/tiles/0-module.png';

/** The menu tile of each module, as the camera shows it. */
const TILES: Record<ModuleKey, string> = {
  filmLook: tileFilmLook,
  framing: tileFraming,
  guides: tileGuides,
  dateStamp: tileDate,
  glow: tileGlow,
  grain: tileGrain,
  border: tileBorder,
  lightLeak: tileLightLeak,
  diffusion: tileDiffusion,
};

type Photo = keyof typeof LANDING_PHOTOS;

/** The example photos of the modules: the image in public/landing/, the module, the setting, the photo. */
const EXAMPLES: readonly { image: string; module: ModuleKey; detail: (t: Strings) => string; photo: Photo }[] = [
  { image: 'date-gr2.jpg', module: 'dateStamp', detail: (t) => t.landing.dateLooks[2] ?? '', photo: 'wakkanai' },
  { image: 'date-gr1s.jpg', module: 'dateStamp', detail: (t) => t.landing.dateLooks[1] ?? '', photo: 'wakkanai' },
  { image: 'bloom.jpg', module: 'glow', detail: (t) => t.landing.glowKinds[1] ?? '', photo: 'hokkaido' },
  { image: 'halation.jpg', module: 'glow', detail: (t) => t.landing.glowKinds[2] ?? '', photo: 'hokkaido' },
  { image: 'grain-2.jpg', module: 'grain', detail: (t) => t.landing.grainLevels[1] ?? '', photo: 'tram' },
  { image: 'grain-4.jpg', module: 'grain', detail: (t) => t.landing.grainLevels[3] ?? '', photo: 'tram' },
];

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
}) {
  const visible = modules.filter((module) => enabled.has(module.key));
  return (
    <div className="flex flex-col gap-10">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div role="group" aria-label={t.modules} className="grid gap-3 sm:grid-cols-2">
          {modules.map((module) => {
            const on = enabled.has(module.key);
            return (
              <Label
                key={module.key}
                htmlFor={`module-${module.key}`}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 text-left text-base leading-normal font-normal transition-colors hover:border-input',
                  on && 'border-foreground/60',
                )}
              >
                <Checkbox id={`module-${module.key}`} className="mt-1" checked={on} onCheckedChange={() => onToggle(module.key)} />
                <img src={TILES[module.key]} alt="" width="40" height="40" className="mt-0.5 size-9 rounded-[3px] [image-rendering:pixelated]" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2 font-semibold">
                    {t.moduleNames[module.key]}
                    {installed && <ChangeBadge on={installed.includes(module.id)} checked={planned.includes(module.id)} strings={t} />}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{t.modulesText[module.key]}</span>
                  {module.key === 'filmLook' && emptyLooks && <span className="text-sm text-destructive">{t.filmLookEmpty}</span>}
                </span>
              </Label>
            );
          })}
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

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t.examples}</h3>
        <div className="-mx-gutter flex gap-4 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label={t.examples}>
          {EXAMPLES.map((example, index) => {
            const title = t.moduleNames[example.module];
            const detail = example.detail(t);
            const credit = LANDING_PHOTOS[example.photo];
            return (
              <figure key={example.image} className="m-0 w-[min(360px,78vw)] shrink-0">
                <img
                  src={landingImage(example.image)}
                  alt={`${title} — ${detail}`}
                  width="800"
                  height="600"
                  loading="lazy"
                  className="block aspect-[4/3] h-auto w-full rounded-lg bg-black object-cover"
                />
                <figcaption className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-2.5 text-sm text-muted-foreground">
                  <span className="font-mono text-xs text-muted-foreground/70">{String(index + 1).padStart(2, '0')}</span>
                  <b className="font-semibold text-foreground">{title}</b>
                  <span>{detail}</span>
                  <a className="w-full text-xs text-muted-foreground/70 hover:text-foreground" href={credit.source} target="_blank" rel="noreferrer">
                    {credit.author} · {credit.license}
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
