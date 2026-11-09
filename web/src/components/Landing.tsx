import { startTransition, Suspense, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { CAMERAS, PREVIEW_TARGET } from '../cameras';
import { effectUrl, loadCatalog, previewTable, type Catalog, type CatalogEffect } from '../catalog';
import { sentences, type Language, type Strings } from '../i18n';
import { LANDING_HERO, LANDING_PHOTOS, landingImage } from '../landing';
import { preview, type PreviewEffect, type Source } from '../preview/render';
import { DEFAULT_SAMPLE } from '../preview/samples';
import { EffectIcon } from './EffectIcon';
import { ErrorBoundary } from './ErrorBoundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { OFFICIAL_MODULES, type ModuleKey } from '../generated/modules';
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
const MODULE_TILES: Record<ModuleKey, string> = {
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

/** The look of this fork, which the hero shows first. */
const FIRST_LOOK = 'positive-film-grii-v1';

/** A block that runs from edge to edge of the window, out of the page column. */
const BLEED = 'mx-[calc(50%-50vw)] px-(--gutter)';
/** A section after the first: room above its hairline, room under it. */
const BAND = 'mt-[clamp(40px,7vh,72px)]';
const BAND_GAP = 'mb-[clamp(32px,5vh,48px)]';
const BAND_TITLE = 'm-0 text-[clamp(24px,2.4vw,30px)] font-semibold tracking-[-0.015em]';

type Photo = keyof typeof LANDING_PHOTOS;

interface Props {
  strings: Strings;
  language: Language;
  /** Whether this browser writes to a card. Without it (a phone, a tablet, Safari, Firefox), the
      installer only downloads GRKU.zip. */
  canWrite: boolean;
}

/**
 * The landing page above the installer, in the dark. The hero is alive: the GR IIIx photograph
 * renders in the browser with the look that the visitor picks from the film shelf under it,
 * Positive GRII first. Then the camera's menu, a contact sheet of results, one line on safety,
 * and the installer. The page is shadcn/ui components and Tailwind classes; landing.css keeps
 * the few rules they cannot say.
 */
export function Landing({ strings, canWrite }: Props) {
  const t = strings.landing;
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [lookId, setLookId] = useState(FIRST_LOOK);
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let live = true;
    loadCatalog(PREVIEW_TARGET)
      .then((loaded) => {
        if (live) setCatalog(loaded);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  const look = catalog?.effects.find((effect) => effect.id === lookId) ?? null;
  function pick(id: string) {
    startTransition(() => setLookId(id));
    // On a phone the photograph is above the shelf: bring it back into view.
    if (window.innerWidth < 960) frame.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return (
    <div className="dark text-foreground">
      <section className={cn(BLEED, 'pt-[clamp(32px,6vh,72px)]')} id={LANDING_HERO}>
        <div className="mx-auto grid max-w-[1280px] min-h-[min(680px,calc(100svh-160px))] items-center gap-[clamp(32px,5vw,72px)] min-[960px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="min-w-0">
            <h2 className="m-0 text-balance text-[clamp(36px,4.4vw,62px)] leading-[1.12] font-bold tracking-[-0.02em] [:root[lang=th]_&]:leading-[1.22] [:root[lang=th]_&]:tracking-normal">
              {strings.lead[0]}
            </h2>
            <p className="mt-5 max-w-[28em] text-[clamp(17px,1.5vw,20px)] leading-relaxed text-foreground/85">{strings.lead[1]}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-lg bg-brand px-6 text-base font-semibold text-brand-foreground hover:bg-brand/90"
              >
                <a href="#install">{t.install}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-lg border-input bg-transparent px-6 text-base font-semibold hover:border-foreground hover:bg-transparent"
              >
                <a href="#shelf">{t.shelf}</a>
              </Button>
            </div>
            <p className="mt-5 max-w-[36em] text-sm leading-relaxed text-muted-foreground">
              {sentences(t.supports(SUPPORTED_CAMERAS), canWrite ? t.installNote : t.installNoteZip)}
            </p>
          </div>
          <div className="min-w-0" ref={frame}>
            <HeroPreview catalog={catalog} look={look} strings={strings} />
            <p className="mt-3 text-[13px] text-muted-foreground/80 [&_a]:text-muted-foreground/80">
              {look?.name ?? ''} · {t.lookNote} <Credit photo="wheels" camera />
            </p>
          </div>
        </div>
      </section>

      <Shelf catalog={catalog} selected={lookId} onPick={pick} strings={strings} />

      <section className={BAND} id="modules" aria-labelledby="landing-modules">
        <Separator className={BAND_GAP} />
        <div className="grid items-start gap-[clamp(32px,5vw,72px)] min-[960px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Card
            className="gap-0 rounded-2xl border-input bg-[#0c0c0c] py-0 shadow-[0_24px_60px_rgba(0,0,0,0.5)] min-[960px]:sticky min-[960px]:top-6"
            role="img"
            aria-label={t.menuCaption}
          >
            <CardHeader className="block border-b px-5 py-3.5 font-mono text-[13px] font-medium tracking-[0.04em] text-muted-foreground">
              GRKU
            </CardHeader>
            <CardContent className="px-2.5 pt-1">
              <ul className="m-0 list-none p-0">
                {OFFICIAL_MODULES.map((module) => (
                  <li
                    key={module.key}
                    className="flex items-center gap-3 border-b border-[#161616] px-2.5 py-1.5 text-[15px] font-medium last:border-b-0"
                  >
                    <img
                      src={MODULE_TILES[module.key]}
                      alt=""
                      width="40"
                      height="40"
                      className="size-8 rounded-[3px] [image-rendering:pixelated]"
                    />
                    <span>{strings.moduleNames[module.key]}</span>
                    {module.key === 'filmLook' && look && (
                      <b className="ml-auto text-[13px] font-medium whitespace-nowrap text-muted-foreground">{look.name}</b>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="px-5 pt-2.5 pb-3 text-xs text-muted-foreground/70">{t.menuCaption}</CardFooter>
          </Card>
          <div className="min-w-0">
            <h2 id="landing-modules" className={BAND_TITLE}>
              {strings.modules}
            </h2>
            <p className="mt-3 mb-7 max-w-[48em] text-[15px] text-muted-foreground">{t.moduleListText}</p>
            <dl className="m-0 grid gap-x-8 gap-y-5 min-[960px]:grid-cols-2">
              {OFFICIAL_MODULES.map((module) => (
                <div key={module.key}>
                  <dt className="text-[15px] font-semibold">{strings.moduleNames[module.key]}</dt>
                  <dd className="mt-1 ml-0 text-sm leading-relaxed text-muted-foreground">{strings.modulesText[module.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className={BAND} aria-labelledby="landing-details">
        <Separator className={BAND_GAP} />
        <h2 id="landing-details" className={cn(BAND_TITLE, 'mb-6')}>
          {t.details}
        </h2>
        <div
          className={cn(BLEED, 'contact flex gap-4 overflow-x-auto py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden')}
          role="group"
          aria-label={t.details}
        >
          <Frame index="01" image="date-gr2.jpg" title={strings.moduleNames.dateStamp} detail={t.dateLooks[2] ?? ''} photo="wakkanai" />
          <Frame index="02" image="date-gr1s.jpg" title={strings.moduleNames.dateStamp} detail={t.dateLooks[1] ?? ''} photo="wakkanai" />
          <Frame index="03" image="bloom.jpg" title={strings.moduleNames.glow} detail={t.glowKinds[1] ?? ''} photo="hokkaido" />
          <Frame index="04" image="halation.jpg" title={strings.moduleNames.glow} detail={t.glowKinds[2] ?? ''} photo="hokkaido" />
          <Frame index="05" image="grain-2.jpg" title={strings.moduleNames.grain} detail={t.grainLevels[1] ?? ''} photo="tram" />
          <Frame index="06" image="grain-4.jpg" title={strings.moduleNames.grain} detail={t.grainLevels[3] ?? ''} photo="tram" />
        </div>
      </section>

      <section className={BAND} aria-labelledby="landing-safe">
        <Separator className={BAND_GAP} />
        <h2
          id="landing-safe"
          className="m-0 max-w-[28em] text-[clamp(22px,2.6vw,34px)] leading-[1.35] font-semibold tracking-[-0.015em]"
        >
          {t.facts.map(([title], index) => (
            <span key={title}>
              {index > 0 && <span className="mx-3.5 mb-1 inline-block size-2 rounded-full bg-brand" aria-hidden="true" />}
              {title}
            </span>
          ))}
        </h2>
        <p className="mt-4 max-w-[52em] text-[15px] leading-[1.7] text-muted-foreground">
          {t.facts.map(([, text]) => text).join(' ')}
        </p>
      </section>

      {/* The title of the installer below, where the install link goes. The desk is light. */}
      <h2 className="landing-start" id="install">
        {t.install}
      </h2>
    </div>
  );
}

/** The cameras that GRKU supports, by the names of the installer. */
const SUPPORTED_CAMERAS = CAMERAS.filter((camera) => camera.support)
  .map((camera) => camera.name)
  .join(' · ');

/** The author and the license of a photo, as a link to its source page. */
function Credit({ photo, camera = false }: { photo: Photo; camera?: boolean }) {
  const { author, license, source } = LANDING_PHOTOS[photo];
  return (
    <a href={source} target="_blank" rel="noreferrer">
      {author} · {license}
      {camera && ` · ${LANDING_PHOTOS[photo].camera}`}
    </a>
  );
}

/** The frame of the photograph: rounded, over the dark, with the name of the look as a badge. */
function PhotoFrame({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      {children}
      <Badge className="pointer-events-none absolute top-3 right-3 z-10 rounded-md bg-[#171717]/80 font-mono text-xs font-medium text-foreground">
        {name}
      </Badge>
    </div>
  );
}

/**
 * The photograph of the hero. Until the catalog is here, the Standard development of the
 * sample; then the picked look, rendered in the browser from the linear sample with the same
 * tables as the installer, against the Standard development under the handle.
 */
function HeroPreview({ catalog, look, strings }: { catalog: Catalog | null; look: CatalogEffect | null; strings: Strings }) {
  const still = (
    <PhotoFrame name={strings.original}>
      <img
        src={landingImage('looks/standard.jpg')}
        alt={`${strings.samplePhoto} — ${strings.original}`}
        className="block size-full object-cover"
      />
    </PhotoFrame>
  );
  if (!catalog || !look) return still;
  const effect: PreviewEffect = {
    id: look.id,
    table: previewTable(catalog.target, look),
    size: catalog.lutSize,
    baseline: effectUrl(catalog.target, catalog.baseline),
  };
  return (
    <ErrorBoundary resetKey={look.id} fallback={still}>
      <Suspense fallback={still}>
        <LookFrame source={DEFAULT_SAMPLE} effect={effect} name={look.name} strings={strings} />
      </Suspense>
    </ErrorBoundary>
  );
}

function LookFrame({ source, effect, name, strings }: { source: Source; effect: PreviewEffect; name: string; strings: Strings }) {
  const result = use(preview(source, effect));
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });
  return (
    <PhotoFrame name={name}>
      <Provider {...comparison}>
        <Root className="image-comparison">
          <Item item="itemOne">
            <img src={result.original} alt={`${strings.samplePhoto} — ${strings.original}`} />
          </Item>
          <Item item="itemTwo" className="comparison-effect">
            <img src={result.processed} alt={`${strings.samplePhoto} — ${name}`} />
          </Item>
          <HandleRoot aria-label={strings.compare}>
            <Handle buttonStyle={{ width: 32, height: 32, gap: '0.2rem' }} />
          </HandleRoot>
        </Root>
      </Provider>
    </PhotoFrame>
  );
}

/**
 * The film shelf: every look of the library as its box, drawn sharp at shelf size, in two rows
 * that drift slowly until the visitor touches them. A box picks the look of the hero.
 */
function Shelf({
  catalog,
  selected,
  onPick,
  strings,
}: {
  catalog: Catalog | null;
  selected: string;
  onPick: (id: string) => void;
  strings: Strings;
}) {
  const t = strings.landing;
  const shelf = useRef<HTMLDivElement>(null);
  const boxes = catalog?.effects ?? [];
  useEffect(() => {
    const element = shelf.current;
    if (!element || boxes.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stopped = false;
    let last = performance.now();
    const stop = () => {
      stopped = true;
    };
    for (const event of ['pointerdown', 'wheel', 'touchstart', 'keydown', 'focusin']) {
      element.addEventListener(event, stop, { passive: true });
    }
    let frame = requestAnimationFrame(function step(now: number) {
      if (stopped) return;
      element.scrollLeft += (now - last) * 0.024;
      last = now;
      if (element.scrollLeft + element.clientWidth >= element.scrollWidth - 1) return;
      frame = requestAnimationFrame(step);
    });
    return () => {
      cancelAnimationFrame(frame);
      for (const event of ['pointerdown', 'wheel', 'touchstart', 'keydown', 'focusin']) {
        element.removeEventListener(event, stop);
      }
    };
  }, [boxes.length]);
  const half = Math.ceil(boxes.length / 2);
  const rows = [boxes.slice(0, half), boxes.slice(half)];
  return (
    <section className="mx-[calc(50%-50vw)] mt-[clamp(40px,7vh,80px)] pb-2" id="shelf" aria-label={t.shelf}>
      <div
        className="shelf overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={shelf}
        role="group"
        aria-label={t.shelfAlt}
      >
        {rows.map((row, index) => (
          <div
            className="mb-3.5 flex w-max gap-2 border-b-[3px] border-input px-(--gutter) pb-2.5 shadow-[0_3px_0_#1f1f1f] last:mb-0"
            key={index}
          >
            {row.map((box) => (
              <button
                type="button"
                className="shelf-box block shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0 outline-2 outline-offset-[3px] outline-transparent transition-[transform,outline-color] duration-150 hover:-translate-y-[3px] focus-visible:outline-brand aria-pressed:outline-foreground"
                key={box.id}
                title={box.name}
                aria-label={box.name}
                aria-pressed={box.id === selected}
                onClick={() => onPick(box.id)}
              >
                <EffectIcon effect={{ id: box.id, icon: box.icon, cover: box.cover }} />
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-[1280px] px-(--gutter) text-sm text-muted-foreground">{t.shelfText}</p>
    </section>
  );
}

/** One frame of the contact sheet: a result on a photo, the module, and the setting. */
function Frame({
  index,
  image,
  title,
  detail,
  photo,
}: {
  index: string;
  image: string;
  title: string;
  detail: string;
  photo: Photo;
}) {
  return (
    <figure className="m-0 w-[min(440px,80vw)] shrink-0">
      <img
        src={landingImage(image)}
        alt={`${title} — ${detail}`}
        width="800"
        height="600"
        loading="lazy"
        className="block aspect-[4/3] h-auto w-full rounded bg-black object-cover"
      />
      <figcaption className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-0.5 pt-2.5 text-sm text-muted-foreground">
        <span className="font-mono text-xs text-muted-foreground/70">{index}</span>
        <b className="font-semibold text-foreground">{title}</b> <span>{detail}</span>
        <span className="w-full text-xs text-muted-foreground/70 [&_a]:text-muted-foreground/70">
          <Credit photo={photo} />
        </span>
      </figcaption>
    </figure>
  );
}
