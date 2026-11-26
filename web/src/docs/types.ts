import type { DocGroup, DocSlug } from './pages';

/**
 * Text with inline marks: `code`, **bold** (a word on the camera screen or the site), {{KEY}} for a
 * camera button, and [label](target). A target is `doc:<slug>` or `doc:<slug>#<id>`, `site:<page>`
 * (a page of the site, such as `site:install` or `site:develop`), `site:recovery`, `support`, or
 * an https address.
 */
export type Inline = string;

/** A mock-up of a camera screen (public/docs/screen-<name>.<camera language>-<width>.webp), drawn from the GRKU tiles, film boxes, and menu words. */
export type DocScreen = 'adj' | 'film-look' | 'recipes' | 'menu' | 'settings' | 'date' | 'mode-dial' | 'modeset' | 'setup-gr3' | 'setup-gr4' | 'info-gr3' | 'info-gr4';

/** A photo of GRKU's own, shot on a GR IV (public/docs/photo-<name>-<width>.webp). */
export type DocPhoto = 'portra-heart' | 'pro400h' | 'portra-bloom' | 'chrome-grain' | 'neg-gr1s' | 'cinestill' | 'kodachrome-leak' | 'trix' | 'chrome-white' | 'gr2-soft' | 'velvia-wide' | 'acros-instant';

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
  | { kind: 'screen'; screen: DocScreen; alt: string }
  | { kind: 'photo'; photo: DocPhoto; alt: string }
  /** The top level of the SD card: each name and what it is. */
  | { kind: 'card'; alt: string; items: readonly (readonly [name: string, about: string])[] }
  /** Framing, Crop, or Guides over a photo, with their choices to try. */
  | { kind: 'frame'; mode: 'framing' | 'crop' | 'guides'; alt: string }
  | { kind: 'camera'; screen: CameraScreen; press: readonly CameraKey[]; alt: string }
  | { kind: 'cameras' };

export interface DocText {
  title: string;
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
    updated: string;
  };
  groups: Readonly<Record<DocGroup, string>>;
  pages: Readonly<Record<DocSlug, DocText>>;
}
