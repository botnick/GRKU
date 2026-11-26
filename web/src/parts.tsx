// The parts of the site that only some pages show: the install steps, the guide, Develop, GRKU Plus. Each
// is its own script, so a page downloads and runs only what it shows. main.tsx loads the part of
// the first page before the first render, and a link loads the part of its page when the pointer
// or the focus comes to it, so a move between pages does not wait.
import { lazy, type ComponentType, type JSX } from 'react';
import { loadAllDocs, loadDocs } from './docs/load';
import { isDocsPage } from './docs/pages';
import { INSTALL_STEPS, isInstallStep, pathLanguage, pathPage, type SitePage } from './languagePage';

export interface Part<P extends object> {
  (props: P): JSX.Element;
  /** Downloads the part; the promise ends when it can render. */
  preload(): Promise<unknown>;
}

/**
 * A component that `load` downloads on first use. Once loaded (by `preload` or a render), it
 * renders at once. Before that, its render suspends until it arrives.
 */
export function part<P extends object>(load: () => Promise<ComponentType<P>>): Part<P> {
  let loaded: ComponentType<P> | null = null;
  let pending: Promise<ComponentType<P>> | null = null;
  const preload = () =>
    (pending ??= load().then(
      (component) => (loaded = component),
      (error: unknown) => {
        // A failed download (a new deploy, a lost connection) can try again.
        pending = null;
        throw error;
      },
    ));
  const Lazy = lazy(() => preload().then((component) => ({ default: component })));
  // One kind of element for the life of the page, so a part that rendered through `lazy` is
  // not remounted, losing its state, when it renders again after loading.
  let direct: boolean | null = null;
  function Part(props: P) {
    direct ??= loaded !== null;
    const Component = direct ? loaded! : Lazy;
    return <Component {...props} />;
  }
  return Object.assign(Part, { preload });
}

export const Home = part(() => import('./components/Home').then((module) => module.Home));
export const Guide = part(() => import('./components/Guide').then((module) => module.Guide));
export const Workbench = part(() => import('./components/Workbench').then((module) => module.Workbench));
export const ModulesStep = part(() => import('./components/ModulesStep').then((module) => module.ModulesStep));
export const RecipesPanel = part(() => import('./components/RecipesPanel').then((module) => module.RecipesPanel));
export const PlusSheet = part(() => import('./components/PlusSheet').then((module) => module.PlusSheet));
export const ShutdownSection = part(() => import('./components/ShutdownSection').then((module) => module.ShutdownSection));
export const Develop = part(() => import('./components/Develop').then((module) => module.Develop));
export const Docs = part(() => import('./components/DocsPage').then((module) => module.DocsPage));
export const ShutdownDownload = part(() => import('./components/ShutdownSection').then((module) => module.ShutdownDownload));

/** The parts that each page shows at once. */
const PAGE_PARTS: Record<Exclude<SitePage, `docs${string}`>, readonly { preload(): Promise<unknown> }[]> = {
  home: [Home],
  guide: [Guide],
  install: [Workbench],
  camera: [],
  modules: [ModulesStep, RecipesPanel, ShutdownSection],
  write: [],
  develop: [Develop],
};

/** Loads the parts of `page`. */
export function preloadPage(page: SitePage): Promise<unknown> {
  // A page of the manual loads its text in the language of the address too.
  if (isDocsPage(page)) return Promise.all([Docs.preload(), loadDocs(pathLanguage(location.pathname))]);
  return Promise.all(PAGE_PARTS[page].map((item) => item.preload()));
}

/** Loads every part, for the prerender, which renders each page at once. */
export function preloadAll(): Promise<unknown> {
  return Promise.all([Home, Guide, Workbench, ModulesStep, RecipesPanel, PlusSheet, ShutdownSection, ShutdownDownload, Develop, Docs].map((item) => item.preload()).concat(loadAllDocs()));
}

/**
 * Loads the part of a page when a link to it may be followed: the pointer over it, a touch, or the
 * keyboard focus. On a step of the install, the other steps load when the browser is idle.
 */
export function preloadOnIntent(page: SitePage): void {
  const intent = (event: Event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]');
    if (!(link instanceof HTMLAnchorElement) || link.origin !== location.origin) return;
    const next = pathPage(link.pathname);
    if (next) preloadPage(next).catch(() => {});
  };
  for (const type of ['pointerover', 'touchstart', 'focusin']) {
    addEventListener(type, intent, { passive: true, capture: true });
  }
  if (isInstallStep(page)) {
    const idle = window.requestIdleCallback ?? ((task: () => void) => setTimeout(task, 1500));
    idle(() => {
      for (const step of INSTALL_STEPS) preloadPage(step).catch(() => {});
    });
  }
}
