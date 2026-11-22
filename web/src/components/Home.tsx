import { useState, type ReactNode } from 'react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CAMERAS, PREVIEW_TARGET } from '../cameras';
import type { Cover } from '../catalog';
import type { Language, Strings } from '../i18n';
import { LANDING_LOOKS, LANDING_PHOTOS, landingImage } from '../landing';
import type { PageLink } from '../navigation';
import { SAMPLES } from '../preview/samples';
import { cameraTerms, RECIPE_STRINGS } from '../recipeStrings';
import { useCatalog } from '../useCatalog';
import { EffectIcon } from './EffectIcon';
import { Example, EXAMPLES, TILES } from './ModulesStep';
import cameraAdjImage from '../../../resources/images/camera-adj.png';

/** A section of the home page: a hairline above, the heading, then the body. */
const SECTION = 'scroll-mt-28 md:scroll-mt-20 border-t border-border py-12 lg:py-16';
const H2 = 'text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance';
const LEAD = 'mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground';

/** The headline with each brand name (RICOH GR…) as its own inline box, so the brand stays on one line. */
function Headline({ text }: { text: string }) {
  return text.split(/(RICOH GR[\w ]*?(?= |$))/).map((part, index) =>
    /^RICOH GR/.test(part) ? (
      <span key={index} className="inline-block" lang="en">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

/** One example of each module: the first photo of the module in `EXAMPLES`. */
const MODULE_EXAMPLES = EXAMPLES.filter(
  (example, index) => EXAMPLES.findIndex((other) => other.module === example.module) === index,
);

/** The cameras that GRKU supports, by the names of the installer. */
const SUPPORTED_CAMERAS = CAMERAS.filter((camera) => camera.support)
  .map((camera) => camera.name)
  .join(' · ');

/** The boxes on the shelf of the home page. */
const SHELF_SIZE = 23;

/**
 * The first screen: the same photo developed with five looks of the library, against the base
 * development under a handle, and the boxes that pick the look.
 */
function HeroCompare({ strings: t }: { strings: Strings }) {
  const [index, setIndex] = useState(0);
  const look = LANDING_LOOKS[index]!;
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });
  const credit = SAMPLES[0]!.credit;
  return (
    <figure className="m-0 min-w-0">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-black ring-1 ring-white/[0.06]">
        <Provider {...comparison}>
          <Root className="image-comparison">
            <Item item="itemOne">
              <img src={landingImage('looks/standard.jpg')} alt={`${t.samplePhoto} — ${t.original}`} width="1200" height="800" fetchPriority="high" />
            </Item>
            <Item item="itemTwo" className="comparison-effect">
              <img src={landingImage(`looks/${look.image}.jpg`)} alt={`${t.samplePhoto} — ${look.name}`} width="1200" height="800" fetchPriority="high" />
            </Item>
            <HandleRoot aria-label={t.compare}>
              <Handle buttonStyle={{ width: 32, height: 32, gap: '0.2rem' }} />
            </HandleRoot>
          </Root>
        </Provider>
        <Badge className="pointer-events-none absolute top-3 left-3 z-[2] rounded-md bg-black/75 px-2 py-1 font-mono text-xs font-medium text-foreground">
          {t.original}
        </Badge>
        <Badge className="pointer-events-none absolute top-3 right-3 z-[2] rounded-md bg-black/75 px-2 py-1 font-mono text-xs font-medium text-foreground">
          {look.name}
        </Badge>
      </div>
      <div className="mt-4 flex gap-2" role="group" aria-label={t.effects}>
        {LANDING_LOOKS.map((item, at) => (
          <button
            key={item.effect}
            type="button"
            aria-pressed={at === index}
            onClick={() => setIndex(at)}
            className={cn(
              'flex max-w-[84px] min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg border p-1.5 pt-2 text-center transition-colors outline-none hover:border-input focus-visible:ring-[3px] focus-visible:ring-ring/50',
              at === index ? 'border-brand ring-2 ring-brand/70' : 'border-border bg-card',
            )}
          >
            <EffectIcon effect={{ id: item.effect, icon: '', cover: item.cover as Cover }} className="size-11 sm:size-12" />
            <span className="line-clamp-2 text-[11px] leading-[1.25] font-medium">{item.name}</span>
          </button>
        ))}
      </div>
      <figcaption className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        {t.site.heroCaption}{' '}
        <a href={credit.source} target="_blank" rel="noreferrer" className="text-muted-foreground/80 hover:text-foreground">
          {credit.author} · {credit.license} · {credit.camera}
        </a>
      </figcaption>
    </figure>
  );
}

/** A primary and a secondary link to the looks page and the install page. */
function Actions({ strings: t, link, className }: { strings: Strings; link: PageLink; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Button asChild variant="brand" size="lg" className="h-11 px-6 text-[15px]">
        <a {...link('looks')}>{t.chooseLooks}</a>
      </Button>
      <Button asChild variant="outline" size="lg" className="h-11 px-6 text-[15px]">
        <a {...link('install')}>{t.install}</a>
      </Button>
    </div>
  );
}

/** The boxes of the library, as the shelf of the looks page shows them. Without the catalog, the boxes of the hero. */
function Shelf({ strings: t, link }: { strings: Strings; link: PageLink }) {
  const { catalog } = useCatalog(PREVIEW_TARGET);
  const boxes: { id: string; name: string; icon: string; cover?: Cover }[] = catalog
    ? catalog.effects.slice(0, SHELF_SIZE)
    : LANDING_LOOKS.map((look) => ({ id: look.effect, name: look.name, icon: '', cover: look.cover as Cover }));
  const rest = catalog ? catalog.effects.length - boxes.length : 0;
  return (
    <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-8" aria-label={t.landing.shelf}>
      {boxes.map((effect, index) => (
        <li
          key={effect.id}
          title={effect.name}
          className={cn('flex flex-col items-center gap-1.5 rounded-lg border bg-card p-1.5 pt-2', index >= 15 && 'max-sm:hidden')}
        >
          <EffectIcon effect={effect} className="size-14" />
          <span className="line-clamp-1 w-full text-center text-[11px] leading-[1.25] font-medium">{effect.name}</span>
        </li>
      ))}
      {rest > 0 && (
        <li className="flex">
          <a
            {...link('looks')}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-1.5 text-center text-muted-foreground no-underline transition-colors hover:border-input hover:text-foreground"
          >
            <span className="font-mono text-lg tabular-nums">+{rest}</span>
            <span className="text-[11px] leading-tight font-medium">{t.effects}</span>
          </a>
        </li>
      )}
    </ul>
  );
}

/**
 * The home page: what GRKU does, shown on photos. The hero compares five looks on one photo, the
 * shelf shows the boxes of the library, each module has its own example, then the recipes, the
 * cameras, GRKU Plus, the news, and the questions. Choosing looks and installing have their own pages.
 */
export function Home({
  strings: t,
  language,
  link,
  canWrite,
  onPlus,
  news,
  faq,
}: {
  strings: Strings;
  language: Language;
  link: PageLink;
  /** Whether this browser writes to a card, which the line under the actions tells. */
  canWrite: boolean;
  /** Opens GRKU Plus. */
  onPlus: () => void;
  news: ReactNode;
  faq: ReactNode;
}) {
  const r = cameraTerms(RECIPE_STRINGS[language], language);
  return (
    <>
      <section className="grid items-center gap-x-14 gap-y-10 pt-[clamp(32px,7vh,88px)] pb-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:pb-16" aria-labelledby="home-title">
        <div className="min-w-0">
          <h1
            id="home-title"
            className="text-balance text-[clamp(38px,4.6vw,60px)] leading-[1.06] font-bold tracking-[-0.025em] [:root[lang=th]_&]:leading-[1.22] [:root[lang=th]_&]:tracking-normal"
          >
            <Headline text={t.lead[0] ?? ''} />
          </h1>
          <p className="mt-4 max-w-[30em] text-[clamp(16px,1.3vw,19px)] leading-relaxed text-muted-foreground">{t.lead[1]}</p>
          <Actions strings={t} link={link} className="mt-8" />
          <p className="mt-6 max-w-[40em] text-sm leading-relaxed text-muted-foreground">
            {t.landing.supports(SUPPORTED_CAMERAS)} {canWrite ? t.landing.installNote : t.landing.installNoteZip}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t.riskShort}</p>
        </div>
        <HeroCompare strings={t} />
      </section>

      <section id="shelf" className={cn(SECTION, 'grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]')} aria-labelledby="shelf-title">
        <div className="min-w-0">
          <h2 id="shelf-title" className={H2}>
            {t.landing.shelf}
          </h2>
          <p className={LEAD}>{t.site.shelfText}</p>
          <Button asChild variant="outline" className="mt-6">
            <a {...link('looks')}>{t.chooseLooks}</a>
          </Button>
        </div>
        <Shelf strings={t} link={link} />
      </section>

      <section id="features" className={SECTION} aria-labelledby="features-title">
        <h2 id="features-title" className={H2}>
          {t.site.featuresTitle}
        </h2>
        <p className={LEAD}>{t.landing.moduleListText}</p>
        {/* A strip that scrolls sideways on a phone, a grid from the tablet up. */}
        <ul className="-mx-gutter mt-10 flex list-none snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {MODULE_EXAMPLES.map((example) => {
            const title = t.moduleNames[example.module];
            const detail = example.detail(t);
            const credit = LANDING_PHOTOS[example.photo];
            return (
              <li key={example.module} className="flex w-[82vw] min-w-0 shrink-0 snap-start flex-col sm:w-auto">
                <Example
                  before={example.before}
                  beforeDetail={example.beforeDetail?.(t)}
                  after={example.image}
                  alt={`${title} — ${detail}`}
                  detail={detail}
                  compareLabel={t.compare}
                />
                <h3 className="mt-4 flex items-center gap-3 text-[17px] font-semibold">
                  <img src={TILES[example.module]} alt="" width="40" height="40" className="size-8 shrink-0 rounded-[3px] [image-rendering:pixelated]" />
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.modulesText[example.module]}</p>
                <a className="mt-2 text-xs text-muted-foreground/70 hover:text-foreground" href={credit.source} target="_blank" rel="noreferrer">
                  {credit.author} · {credit.license} · {credit.camera}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="recipes" className={cn(SECTION, 'grid items-center gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')} aria-labelledby="recipes-title">
        <div className="min-w-0">
          <h2 id="recipes-title" className={H2}>
            {t.site.recipesTitle}
          </h2>
          <p className={LEAD}>{r.introWhat}</p>
          <p className={LEAD}>{r.introCamera}</p>
          <h3 className="mt-8 flex items-center gap-3 text-[17px] font-semibold">
            <img src={TILES.recipes} alt="" width="40" height="40" className="size-8 shrink-0 rounded-[3px] [image-rendering:pixelated]" />
            {r.modeDial}
          </h3>
          <p className={cn(LEAD, 'mt-2')}>{r.introDial}</p>
        </div>
        <figure className="m-0 min-w-0">
          <img src={cameraAdjImage} alt={t.landing.adjCaption} width="1160" height="636" loading="lazy" className="h-auto w-full rounded-2xl" />
          <figcaption className="mt-3 text-[13px] text-muted-foreground">
            {t.landing.adjCaption} {t.landing.menuCaption}
          </figcaption>
        </figure>
      </section>

      <section id="cameras" className={cn(SECTION, 'grid gap-x-14 gap-y-12 lg:grid-cols-2')} aria-label={t.site.camerasTitle}>
        <div className="min-w-0">
          <h2 className={H2}>{t.site.camerasTitle}</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {CAMERAS.map((camera) => (
              <li key={camera.key} className="flex items-baseline justify-between gap-4 py-3">
                <span className="font-medium">{camera.name}</span>
                <span className="text-right font-mono text-[13px] text-muted-foreground">
                  {camera.support ? `${t.firmware} ${camera.support.firmware}` : t.planned}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{t.firmwareNote}</p>
        </div>
        <div className="min-w-0">
          <h2 className={H2}>{t.landing.safe}</h2>
          <dl className="mt-6 flex flex-col gap-5">
            {t.landing.facts.map(([title, text]) => (
              <div key={title} className="flex flex-col gap-1 border-l-2 border-brand/70 pl-4">
                <dt className="font-medium">{title}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{t.riskText}</p>
        </div>
      </section>

      <section id="plus" className={cn(SECTION, 'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between')} aria-labelledby="plus-title">
        <div className="min-w-0">
          <h2 id="plus-title" className={H2}>
            {t.plus.title}
          </h2>
          <p className={LEAD}>{t.plus.lead}</p>
        </div>
        <Button type="button" variant="outline" className="shrink-0 self-start sm:self-auto" onClick={onPlus}>
          {t.plus.getMore}
        </Button>
      </section>

      {news}
      {faq}

      <section className={cn(SECTION, 'flex flex-col items-start gap-4')} aria-labelledby="start-title">
        <h2 id="start-title" className={H2}>
          {t.site.ctaTitle}
        </h2>
        <p className="max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{t.site.ctaText}</p>
        <Actions strings={t} link={link} className="mt-2" />
      </section>
    </>
  );
}
