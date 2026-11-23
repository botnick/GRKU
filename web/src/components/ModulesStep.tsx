import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Strings } from '../i18n';
import { landingPicture } from '../landing';
import type { MODULES, ModuleKey } from '../modules';
import { ChangeBadge } from './ChangeBadge';
import { MODULES_MAX } from '../modules';
import { EXAMPLES, TILES } from './ModuleExamples';

/** The photo of each module in its row: the example of the module, where it has one. */
const ROW_EXAMPLES: Partial<Record<ModuleKey, string>> = Object.fromEntries(
  [...EXAMPLES].reverse().map((example) => [example.module, example.image]),
);
ROW_EXAMPLES.filmLook = 'hero/achensee-portra-400.jpg';

/**
 * The modules of the camera menu: a card per module to turn it on, the menu as the camera will
 * show it. The home page shows the example photos (`EXAMPLES`).
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
  return (
    <div className="flex flex-col gap-10">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-3">
        <p className="m-0 text-sm text-muted-foreground tabular-nums">{t.site.menuPlaces(visible.length, MODULES_MAX)}</p>
        {full && <p className="m-0 text-[13px] text-muted-foreground">{t.modulesFull(MODULES_MAX)}</p>}
        <ul aria-label={t.modules} className="divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {modules.map((module) => {
            const on = enabled.has(module.key);
            return (
              <li key={module.key} className={cn('flex items-start gap-4 p-4 transition-opacity', !on && 'opacity-80')}>
                {/* What the module does, on a photo where there is one, with its menu tile in the corner. */}
                <span className="relative flex aspect-[3/2] w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black/40 sm:w-28">
                  {ROW_EXAMPLES[module.key] ? (
                    <img {...landingPicture(ROW_EXAMPLES[module.key]!, '112px')} alt="" width="1200" height="800" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                  ) : null}
                  <img
                    src={TILES[module.key]}
                    alt=""
                    width="40"
                    height="40"
                    className={cn('rounded-[3px] [image-rendering:pixelated]', ROW_EXAMPLES[module.key] ? 'absolute bottom-1 left-1 size-6 ring-1 ring-black/60' : 'size-10')}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor={`module-${module.key}`} className="flex cursor-pointer flex-wrap items-center gap-2 text-[15px] font-semibold">
                      {t.moduleNames[module.key]}
                      {installed && <ChangeBadge on={installed.includes(module.id)} checked={planned.includes(module.id)} strings={t} />}
                    </Label>
                    <Switch id={`module-${module.key}`} checked={on} disabled={!on && full} onCheckedChange={() => onToggle(module.key)} aria-label={t.moduleNames[module.key]} />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{module.key === 'filmLook' ? t.site.filmLookText : (t.site.plain[module.key] ?? t.modulesText[module.key])}</p>
                  {!on && full && <p className="mt-1 text-[13px] font-medium text-foreground/80">{t.modulesFullHint}</p>}
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
          <CardFooter className="px-5 pt-2 pb-3 text-xs text-muted-foreground">{t.landing.menuCaption}</CardFooter>
        </Card>
      </div>
      {/* The recipes wait folded: most people keep the ones the card has. */}
      {recipes && (
        <details className="group rounded-xl border bg-card">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
            <img src={TILES.recipes} alt="" width="40" height="40" className="size-6 rounded-[3px] [image-rendering:pixelated]" />
            {t.site.chooseRecipes}
            <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="border-t px-4 py-5">{recipes}</div>
        </details>
      )}
    </div>
  );
}
