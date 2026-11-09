import { useEffect, useRef, useState } from 'react';
import { Handle, HandleRoot, Item, Provider, Root } from 'react-compare-slider/components';
import { useReactCompareSlider } from 'react-compare-slider/hooks';
import { CAMERAS, PREVIEW_TARGET } from '../cameras';
import { loadCatalog } from '../catalog';
import { sentences, type Language, type Strings } from '../i18n';
import { LANDING_HERO, LANDING_LOOKS, LANDING_PHOTOS, landingImage } from '../landing';
import { EffectIcon } from './EffectIcon';
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

type Photo = keyof typeof LANDING_PHOTOS;
type Look = (typeof LANDING_LOOKS)[number];

interface Props {
  strings: Strings;
  language: Language;
  /** Whether this browser writes to a card. Without it (a phone, a tablet, Safari, Firefox), the
      installer only downloads GRKU.zip. */
  canWrite: boolean;
}

/**
 * The landing page above the installer, in the dark: the statement and the real photograph in
 * one screen, the film shelf under them, then the camera menu, three results, and the three
 * facts that make GRKU safe to try.
 */
export function Landing({ strings, canWrite }: Props) {
  const t = strings.landing;
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
          <div className="hero-visual">
            <Looks strings={strings} />
          </div>
        </div>
      </section>

      <Shelf strings={strings} />

      <section className="band" id="modules" aria-labelledby="landing-modules">
        <div className="band-head">
          <h2 id="landing-modules">{strings.modules}</h2>
          <p>{t.moduleListText}</p>
        </div>
        <ul className="menu" aria-label={strings.modules}>
          {OFFICIAL_MODULES.map((module) => (
            <li key={module.key}>
              <img src={MODULE_TILES[module.key]} alt="" width="40" height="40" />
              <div>
                <b>{strings.moduleNames[module.key]}</b>
                <p>{strings.modulesText[module.key]}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="band" aria-labelledby="landing-details">
        <div className="band-head">
          <h2 id="landing-details">{t.details}</h2>
        </div>
        <div className="stills">
          <Still
            image="date-gr2.jpg"
            title={strings.moduleNames.dateStamp}
            text={t.dateText}
            photo="tram"
            alt={`${strings.moduleNames.dateStamp} — ${t.dateLooks[2]}`}
          />
          <Still
            image="halation.jpg"
            title={strings.moduleNames.glow}
            text={t.glowText}
            photo="street"
            alt={`${strings.moduleNames.glow} — ${t.glowKinds[2]}`}
          />
          <Still
            image="grain-3.jpg"
            title={strings.moduleNames.grain}
            text={t.grainText}
            photo="tram"
            alt={`${strings.moduleNames.grain} — ${t.grainLevels[2]}`}
          />
        </div>
      </section>

      <section className="band" aria-labelledby="landing-safe">
        <div className="band-head">
          <h2 id="landing-safe">{t.safe}</h2>
        </div>
        <ul className="facts">
          {t.facts.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* The title of the installer below, where the install link goes. */}
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
 * The photograph of the hero: a GR IIIx picture, the Standard development against the picked
 * film look, which the handle compares, and the looks to pick from.
 */
function Looks({ strings }: { strings: Strings }) {
  const t = strings.landing;
  const [look, setLook] = useState<Look>(LANDING_LOOKS[0]);
  const comparison = useReactCompareSlider({ clip: 'itemTwo' });
  return (
    <div className="looks">
      <div className="frame looks-frame">
        <Provider {...comparison}>
          <Root className="image-comparison">
            <Item item="itemOne">
              <img src={landingImage('looks/standard.jpg')} alt={`${strings.samplePhoto} — ${strings.original}`} />
            </Item>
            <Item item="itemTwo" className="comparison-effect">
              <img src={landingImage(`looks/${look.image}.jpg`)} alt={`${strings.samplePhoto} — ${look.name}`} />
            </Item>
            <HandleRoot aria-label={strings.compare}>
              <Handle buttonStyle={{ width: 32, height: 32, gap: '0.2rem' }} />
            </HandleRoot>
          </Root>
        </Provider>
        <span className="tag">{look.name}</span>
      </div>
      <div className="looks-strip" role="group" aria-label={t.looks}>
        {LANDING_LOOKS.map((item) => (
          <button
            key={item.name}
            type="button"
            className="looks-film"
            aria-pressed={item === look}
            onClick={() => setLook(item)}
          >
            <EffectIcon effect={{ id: item.effect, icon: '', cover: item.cover }} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <p className="looks-note">
        {t.lookNote} <Credit photo="kitchen" camera />
      </p>
      {/* The other looks load while the visitor reads, so a pick shows at once. */}
      {LANDING_LOOKS.filter((item) => item !== look).map((item) => (
        <link key={item.image} rel="prefetch" as="image" href={landingImage(`looks/${item.image}.jpg`)} />
      ))}
    </div>
  );
}

interface Box {
  id: string;
  name: string;
  /** The ADJ icon of the effect, 40 x 40 pixels: the film box in its real colors. */
  icon: string;
}

/**
 * The film shelf: every look of the library as its box, drawn sharp at shelf size, in two rows
 * that drift slowly until the visitor touches them. The boxes come from the catalog of the site,
 * so the shelf shows what the installer offers.
 */
function Shelf({ strings }: { strings: Strings }) {
  const t = strings.landing;
  const [boxes, setBoxes] = useState<Box[]>([]);
  const shelf = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let live = true;
    loadCatalog(PREVIEW_TARGET)
      .then((catalog) => {
        if (!live) return;
        setBoxes(catalog.effects.map((effect) => ({ id: effect.id, name: effect.name, icon: effect.icon })));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    const element = shelf.current;
    if (!element || boxes.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stopped = false;
    let last = performance.now();
    const stop = () => {
      stopped = true;
    };
    for (const event of ['pointerdown', 'wheel', 'touchstart', 'keydown']) {
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
      for (const event of ['pointerdown', 'wheel', 'touchstart', 'keydown']) {
        element.removeEventListener(event, stop);
      }
    };
  }, [boxes]);
  const half = Math.ceil(boxes.length / 2);
  const rows = [boxes.slice(0, half), boxes.slice(half)];
  return (
    <section className="shelf-section" id="shelf" aria-label={t.shelf}>
      <div className="shelf" ref={shelf} role="group" aria-label={t.shelfAlt} tabIndex={0}>
        {rows.map((row, index) => (
          <div className="shelf-row" key={index}>
            {row.map((box) => (
              <span className="shelf-box" key={box.id} title={box.name}>
                <EffectIcon effect={{ id: box.id, icon: box.icon, cover: undefined }} />
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="shelf-caption">{t.shelfText}</p>
    </section>
  );
}

/** One result on a photo, with the module it comes from. */
function Still({
  image,
  title,
  text,
  photo,
  alt,
}: {
  image: string;
  title: string;
  text: string;
  photo: Photo;
  alt: string;
}) {
  return (
    <figure className="still">
      <img src={landingImage(image)} alt={alt} width="800" height="600" loading="lazy" />
      <figcaption>
        <h3>{title}</h3>
        <p>{text}</p>
        <p className="still-credit">
          <Credit photo={photo} />
        </p>
      </figcaption>
    </figure>
  );
}
