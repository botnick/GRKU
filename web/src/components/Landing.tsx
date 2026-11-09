import { startTransition, Suspense, use, useEffect, useRef, useState } from 'react';
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
 * and the installer.
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
    <>
      <section className="hero" id={LANDING_HERO}>
        <div className="hero-grid">
          <div className="hero-copy">
            <h2 className="hero-title">{strings.lead[0]}</h2>
            <p className="hero-sub">{strings.lead[1]}</p>
            <div className="hero-actions">
              <a className="hero-primary" href="#install">
                {t.install}
              </a>
              <a className="hero-ghost" href="#shelf">
                {t.shelf}
              </a>
            </div>
            <p className="hero-meta">{sentences(t.supports(SUPPORTED_CAMERAS), canWrite ? t.installNote : t.installNoteZip)}</p>
          </div>
          <div className="hero-visual" ref={frame}>
            <HeroPreview catalog={catalog} look={look} strings={strings} />
            <p className="looks-note">
              {look?.name ?? ''} · {t.lookNote} <Credit photo="fox" camera />
            </p>
          </div>
        </div>
      </section>

      <Shelf catalog={catalog} selected={lookId} onPick={pick} strings={strings} />

      <section className="band camera-band" id="modules" aria-labelledby="landing-modules">
        <div className="camera-grid">
          <div className="screen" role="img" aria-label={t.menuCaption}>
            <div className="screen-title">GRKU</div>
            <ul className="screen-list">
              {OFFICIAL_MODULES.map((module) => (
                <li key={module.key}>
                  <img src={MODULE_TILES[module.key]} alt="" width="40" height="40" />
                  <span>{strings.moduleNames[module.key]}</span>
                  {module.key === 'filmLook' && look && <b>{look.name}</b>}
                </li>
              ))}
            </ul>
            <div className="screen-foot">{t.menuCaption}</div>
          </div>
          <div className="camera-text">
            <h2 id="landing-modules">{strings.modules}</h2>
            <p className="band-lead">{t.moduleListText}</p>
            <dl className="module-list">
              {OFFICIAL_MODULES.map((module) => (
                <div key={module.key}>
                  <dt>{strings.moduleNames[module.key]}</dt>
                  <dd>{strings.modulesText[module.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="landing-details">
        <div className="band-head">
          <h2 id="landing-details">{t.details}</h2>
        </div>
        <div className="contact" role="group" aria-label={t.details}>
          <Frame index="01" image="date-gr2.jpg" title={strings.moduleNames.dateStamp} detail={t.dateLooks[2] ?? ''} photo="wakkanai" />
          <Frame index="02" image="date-gr1s.jpg" title={strings.moduleNames.dateStamp} detail={t.dateLooks[1] ?? ''} photo="wakkanai" />
          <Frame index="03" image="bloom.jpg" title={strings.moduleNames.glow} detail={t.glowKinds[1] ?? ''} photo="hokkaido" />
          <Frame index="04" image="halation.jpg" title={strings.moduleNames.glow} detail={t.glowKinds[2] ?? ''} photo="hokkaido" />
          <Frame index="05" image="grain-2.jpg" title={strings.moduleNames.grain} detail={t.grainLevels[1] ?? ''} photo="tram" />
          <Frame index="06" image="grain-4.jpg" title={strings.moduleNames.grain} detail={t.grainLevels[3] ?? ''} photo="tram" />
        </div>
      </section>

      <section className="band safe-band" aria-labelledby="landing-safe">
        <h2 id="landing-safe" className="safe-line">
          {t.facts.map(([title], index) => (
            <span key={title}>
              {index > 0 && <span className="safe-dot" aria-hidden="true" />}
              {title}
            </span>
          ))}
        </h2>
        <p className="safe-text">{t.facts.map(([, text]) => text).join(' ')}</p>
      </section>

      {/* The title of the installer below, where the install link goes. The desk is light. */}
      <h2 className="landing-start" id="install">
        {t.install}
      </h2>
    </>
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

/**
 * The photograph of the hero. Until the catalog is here, the Standard development of the
 * sample; then the picked look, rendered in the browser from the linear sample with the same
 * tables as the installer, against the Standard development under the handle.
 */
function HeroPreview({ catalog, look, strings }: { catalog: Catalog | null; look: CatalogEffect | null; strings: Strings }) {
  const still = (
    <div className="frame looks-frame">
      <img src={landingImage('looks/standard.jpg')} alt={`${strings.samplePhoto} — ${strings.original}`} />
      <span className="tag">{strings.original}</span>
    </div>
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
    <div className="frame looks-frame">
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
      <span className="tag">{name}</span>
    </div>
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
    <section className="shelf-section" id="shelf" aria-label={t.shelf}>
      <div className="shelf" ref={shelf} role="group" aria-label={t.shelfAlt}>
        {rows.map((row, index) => (
          <div className="shelf-row" key={index}>
            {row.map((box) => (
              <button
                type="button"
                className="shelf-box"
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
      <p className="shelf-caption">{t.shelfText}</p>
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
    <figure className="contact-frame">
      <img src={landingImage(image)} alt={`${title} — ${detail}`} width="800" height="600" loading="lazy" />
      <figcaption>
        <span className="contact-index">{index}</span>
        <b>{title}</b> <span>{detail}</span>
        <span className="contact-credit">
          <Credit photo={photo} />
        </span>
      </figcaption>
    </figure>
  );
}
