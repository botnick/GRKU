import type { DocGroup, DocSlug } from './pages';

/**
 * Text with inline marks: `code`, **bold** (a word on the camera screen or the site), {{KEY}} for a
 * camera button, and [label](target). A target is `doc:<slug>` or `doc:<slug>#<id>`, `site:<page>`
 * (a page of the site, such as `site:install` or `site:develop`), `site:recovery`, `support`, or
 * an https address.
 */
export type Inline = string;

/** A real camera screen of GRKU (public/docs/screen-<name>.en-<width>.webp): `modeset` is the camera's own
 * framebuffer, `menu` a photo of a GR IV, `adj` the camera's ADJ panels (resources/images/grku-root.jpg)
 * over a photo of GRKU, and `modeset-back` the guide picture with the MENU button (resources/images/camera-menu.png). */
export type DocScreen = 'adj-grku' | 'menu-grku' | 'menu-grku-end' | 'menu-photo' | 'film-look' | 'recipes' | 'framing' | 'crop' | 'mode-dial-gr4' | 'grku-settings' | 'modeset-back';

/** A photo of the owner's GR IV rendered with GRKU's own code (the site's look tables and the camera's module code, as the promo renders): the Standard look,
 * and the same photo with only one setting (public/docs/render-<name>-<width>.webp). `-crop` is a part at full size. */
export type DocRender =
  | 'chairs-standard' | 'chairs-portra' | 'chairs-chrome' | 'chairs-date' | 'chairs-date-crop' | 'chairs-date-gr1s-crop' | 'chairs-standard-crop'
  | 'daisy-standard' | 'daisy-bloom' | 'daisy-diffusion' | 'daisy-softness'
  | 'house-standard' | 'house-standard-crop' | 'house-grain-crop' | 'house-leak' | 'house-border-wide' | 'house-border-instant';

/** A screen of the camera drawing (GuideArt.tsx) and the buttons it rings. */
export type CameraScreen = 'modeset' | 'loaded' | 'adj' | 'look';
export type CameraKey = 'menu' | 'power' | 'adj' | 'ok' | 'grku';

export type DocBlock =
  | { kind: 'p'; text: Inline }
  | { kind: 'h2'; id: string; text: string }
  | { kind: 'steps'; items: readonly Inline[] }
  | { kind: 'list'; items: readonly Inline[] }
  | { kind: 'note'; tone: 'plain' | 'tip' | 'warning'; title: string; text: Inline }
  | { kind: 'path'; items: readonly string[] }
  | { kind: 'table'; head: readonly string[]; rows: readonly (readonly Inline[])[] }
  | { kind: 'files'; items: readonly (readonly [path: string, about: string])[] }
  /** `source`: a photo of the camera, a capture of its screen (the ADJ panels over a photo of GRKU, the Mode Set Command screen), or drawn after a photo of the menu with the rows of the code. */
  | { kind: 'screen'; screen: DocScreen; alt: string; source: 'photo' | 'capture' | 'drawn' }
  /** The same photo without and with one setting. */
  | { kind: 'compare'; before: DocRender; after: DocRender; label: string; alt: string; beforeLabel?: string }
  /** The top level of the SD card: each name and what it is. */
  | { kind: 'card'; alt: string; items: readonly (readonly [name: string, about: string])[] }
  /** Framing, Crop, or Guides over a photo, with their choices to try. */
  | { kind: 'frame'; mode: 'framing' | 'crop' | 'guides'; alt: string }
  | { kind: 'camera'; screen: CameraScreen; press: readonly CameraKey[]; alt: string }
  | { kind: 'cameras' }
  /** A strip of short facts in columns: where a setting is, what it does to the JPEG and the DNG. */
  | { kind: 'facts'; cells: readonly (readonly [label: string, value: Inline])[] }
  /** One tab for each camera where the cameras differ; the page remembers the tab (localStorage). */
  | { kind: 'tabs'; tabs: readonly { label: string; blocks: readonly DocBlock[] }[] }
  /** A drawing of a step (components/GuideArt.tsx): the computer with a card reader, the files copied to the card, the card into the camera. */
  | { kind: 'art'; art: 'computer' | 'copy' | 'insert'; alt: string }
  /** The modules with their real tile (modules/<module>/tiles/0-module.png) and a link to their page. */
  | { kind: 'modules' }
  /** What you see, and what to do: a short decision path. */
  | { kind: 'flow'; steps: readonly { see: Inline; then: Inline }[] }
  /** The settings of a module as the camera names them, with their values and defaults, from the code
   * (docs/moduleSettings.generated.ts), and what each does (`notes`, by setting key). */
  | { kind: 'settings'; module: string; notes: Readonly<Record<string, Inline>> };

export interface DocText {
  title: string;
  /** Where each fact of the page comes from (files of the repository, or RICOH pages), for an audit. Not shown. */
  sources?: readonly string[];
  /** The title for search engines: the words people search for. */
  seo: string;
  /** The first line of the page, also its search result text and its description. */
  lead: string;
  /** Other words that a reader may search for this page. */
  keywords: string;
  blocks: readonly DocBlock[];
}

export interface DocsContent {
  home: {
    title: string;
    /** The title of the docs home in the browser tab and the search results. */
    seoTitle: string;
    lead: string;
    trust: string;
    need: string;
    tasks: readonly { slug: DocSlug; label: string; hint: string }[];
    rescue: string;
    all: string;
    /** The credit line of the project GRKU grew out of. */
    credit: Inline;
  };
  ui: {
    docs: string;
    searchLabel: string;
    searchHome: string;
    searchShort: string;
    noResults: string;
    askInstead: string;
    browse: string;
    previous: string;
    next: string;
    onThisPage: string;
    stuck: string;
    report: string;
    askAi: string;
    askAiText: string;
    /** The first question to the assistant from a doc; `${title}` is the title of the doc. */
    askPrompt: string;
    camera: string;
    firmware: string;
    modeset: string;
    ratio: string;
    mask: string;
    masks: readonly string[];
    focal: string;
    style: string;
    guides: readonly string[];
    settingCol: string;
    choicesCol: string;
    defaultMark: string;
    withoutLabel: string;
    photoBadge: string;
    readingTime: string;
    copyStep: string;
    copiedStep: string;
    askStep: string;
    askStepPrompt: string;
    captureBadge: string;
    drawnBadge: string;
    updated: string;
  };
  groups: Readonly<Record<DocGroup, string>>;
  pages: Readonly<Record<DocSlug, DocText>>;
}
