import { startTransition, Suspense, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, BookOpen, ChevronDown, FileText, TriangleAlert } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  trackCardUninstall,
  trackCardWrite,
  trackDownload,
  trackDownloadError,
  trackScriptsOff,
} from './analytics';
import { suggestOwnBrowser } from './browser';
import {
  applyChanges,
  canWriteCards,
  suggestCardHint,
  cardBuilds,
  cardModules,
  pickCard,
  planChanges,
  readFile,
  RECIPE_FILE,
  RECIPES_PACKAGE,
  removeGrku,
  removeModesetFiles,
  writeFiles,
  type CardChanges,
  type CardDirectory,
} from './card';
import { allowCard, forgetLastCard, saveLastCard } from './cardStore';
import { useRecipeLibrary } from './recipeLibrary';
import { cameraOrder, effectCode, familyOf, withPreset, writeRecipeFile, type Family, type Recipe } from './recipes';
import type { RecipesPanelProps } from './components/RecipesPanel';
import {
  changedImports,
  extraCardEffects,
  libraryChanges,
  openSession,
  packageEffects as cardPackageEffects,
  withFamily,
  type CardSession,
} from './cardSession';
import {
  cameraForCard,
  CAMERAS,
  camerasForCard,
  firmwareForTarget,
  MODESET_TOKEN,
  PREVIEW_TARGET,
  type Camera,
} from './cameras';
import { loadCatalog, MAX_EFFECTS, siteUrl, type Catalog, type CardEffect, type ImportedEffect, type PackageEffect } from './catalog';
import {
  CardChangesView,
  CardConnect,
  CardUninstall,
  FACT_LABEL,
  FACT_VALUE,
  FACTS,
  type CardMessage,
  type CardTask,
  type InstallMode,
} from './components/CardPanel';
import { ChoiceCard } from './components/ChoiceCard';
import { CameraArt, FOCAL_LENGTH } from './components/CameraArt';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Faq } from './components/Faq';
import { Masthead } from './components/Masthead';
import { PackageOpen, type PackageStatus } from './components/PackageOpen';
import {
  DOC_PATHS,
  INSTALL_STEPS,
  isInstallStep,
  LANGUAGE_PATHS,
  pagePath,
  pathLanguage,
  pathPage,
  type InstallStep,
  type SitePage,
} from './languagePage';
import { isDocsPage } from './docs/pages';
import { syncHead } from './head';
import { loadDocs } from './docs/load';
import { pageLink, type Navigate, type PageLink } from './navigation';
import { hasCamera, loadCamera, loadModules, loadProgress, saveCamera, saveModules, saveProgress, visitStep } from './setup';
import { RichText } from './components/RichText';
import { SiteFooter } from './components/SiteFooter';
import { ChatLauncher } from './components/ChatLauncher';
import { WhatsNew } from './components/WhatsNew';
import { Step } from './components/Step';
import { TermsNote } from './components/TermsNote';
import { FEEDBACK, guideUrl, releaseUrl } from './links';
import { loadFonts } from './fonts';
import { encodeLibrary, IMPORTS_FILE, nativeTone, readLibrary, withDetails, type LibraryDetails } from './import/library';
import { restoreImports } from './import/lut';
import { importsForCamera, NATIVE_LOOKS } from './import/native';
import { isLutImportId } from './import/names';
import { deleteImport, saveImport, updateImport } from './import/store';
import { applyLanguage, loadStrings, showLanguage, STRINGS, type Language, type Strings } from './i18n';
import { ALL_MODULES, MODULES, MODULES_MAX, planModules, type ModuleKey } from './modules';
import {
  buildCardFiles,
  buildPackage,
  buildScriptsOff,
  effectLabel,
  prefetchPackage,
  packageFilename,
  guideUrl as guidePdfUrl,
  save,
  scriptsOffCardFiles,
} from './package';
import { packageCard } from './packageCard';
import { cn } from '@/lib/utils';
import cardGr3 from '../../resources/images/card-gr3.png';
import cardGr3x from '../../resources/images/card-gr3x.png';
import cardGr4 from '../../resources/images/card-gr4.png';
import cameraMenuImage from './assets/camera-menu.webp';
import cameraAdjImage from './assets/camera-adj.webp';

/** A step number in a red circle. */
function StepNumber({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-brand-foreground', className)}>{n}</span>
  );
}

/** The card root after copying SD_ROOT, with the ModeSet file of each camera. */
const CARD_IMAGES: Record<string, string> = { gr3: cardGr3, gr3x: cardGr3x, gr4: cardGr4, gr4m: cardGr4 };
import { fetchEntitlement, forgetKey, FREE, loadKey, packCounts, PlusError, saveKey, studioUnlocked, takeKeyFromHash, takeOrderFromHash, type Entitlement } from './plus';
import { loadSelection, resolveSelection, saveSelection, type Selection } from './selection';
import {
  loadLogo,
  loadShutdown,
  LOGO_PATH,
  makeDesignPicture,
  pictureChange,
  pictureFor,
  saveOwnPicture,
  saveShutdownKind,
  saveStudioPicture,
  shutdownKind,
  shutdownWrite,
  type PictureChoice,
  type ShutdownKind,
} from './shutdownPicture';
import { designChoice, loadDesigns, saveDesigns, type DesignState } from './shutdownDesigns';
import { TransferError } from './transfer';
import { useCatalog } from './useCatalog';
import { Develop, Docs, Guide, Home, ModulesStep, PlusSheet, RecipesPanel, ShutdownDownload, ShutdownSection, Workbench } from './parts';
import { readInstallQuery } from './develop/install';

/** The Tally form for problems, feature ideas, and questions. A plain link, so the page loads nothing from Tally. */
/** The release notes of the GRKU version that the site packages, on the releases page. */

/** The steps of a guide. */
const STEPS = 'flex max-w-[72ch] list-decimal flex-col gap-3 pl-6 leading-relaxed';
/** A note under a control, and a status line. */
const NOTE = 'max-w-[72ch] text-sm text-muted-foreground';
const STATUS = 'text-sm text-muted-foreground';
const ERROR = 'text-sm text-destructive';

type Build =
  | { state: 'idle' }
  | { state: 'building'; received: number; retrying: boolean }
  | { state: 'ready' }
  | { state: 'failed' };

/** Megabytes with one decimal, as the progress text shows them. */
const megabytes = (bytes: number) => (bytes / 1_000_000).toFixed(1);

export function App({
  initialLanguage,
  initialPage = 'home',
  initialImports = [],
  initialCard = null,
}: {
  /** The language of the page address. */
  initialLanguage: Language;
  /** The page of the address: home, looks, or install. */
  initialPage?: SitePage;
  initialImports?: readonly ImportedEffect[];
  /** The card connected on an earlier visit, which a click reconnects. */
  initialCard?: CardDirectory | null;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  // The three pages share this state, so a move between them keeps the looks, the modules, the
  // camera, and the connected card. The browser storage keeps them for a reload and the next visit.
  const [page, setPage] = useState<SitePage>(initialPage);
  // Whether the visitor moved to another page in place. The fade of a new step marks only such a
  // move: the first page shows at once, so its photo and heading count as painted when they arrive.
  const [moved, setMoved] = useState(false);
  // The furthest step of the install that the visitor reached, and the last one, which Install
  // in the header opens.
  const [progress, setProgress] = useState(() => loadProgress(browserStorage()));
  useEffect(() => {
    if (!isInstallStep(page)) return;
    setProgress((current) => {
      const next = visitStep(current, page);
      saveProgress(browserStorage(), next);
      return next;
    });
  }, [page]);
  // The element that a move to a page shows, by the hash of its link, or the top of the page.
  const [scrollTarget, setScrollTarget] = useState<{ hash: string } | null>(() =>
    typeof location === 'undefined' || !location.hash ? null : { hash: location.hash },
  );
  const [cameraKey, setCameraKeyState] = useState(() => loadCamera(browserStorage()));
  // Whether the visitor chose the camera, or a card or a package told it. Until then the camera
  // step asks, and the last step waits for the answer.
  const [cameraChosen, setCameraChosen] = useState(() => hasCamera(browserStorage()));
  // The ZIP download has no card to read the effects from, so the choice of the last visit
  // comes back.
  const [selection, setSelection] = useState<Selection>(() => loadSelection(browserStorage()));
  const [enabled, setEnabledState] = useState<ReadonlySet<ModuleKey>>(() => loadModules(browserStorage()));

  function setCameraKey(key: Camera['key']) {
    setCameraKeyState(key);
    setCameraChosen(true);
    saveCamera(browserStorage(), key);
  }

  function setEnabled(next: ReadonlySet<ModuleKey>) {
    setEnabledState(next);
    saveModules(browserStorage(), next);
  }

  // A link from the Develop page (`/install/?look=…&modules=…`) brings its look and modules: the
  // look shows first on the shelf and goes on the card if it has room (Workbench), and the modules
  // turn on while the camera menu has places.
  const [installRequest] = useState(() =>
    typeof location !== 'undefined' && initialPage === 'install' && location.search ? readInstallQuery(location.search, ALL_MODULES) : null,
  );
  useEffect(() => {
    if (!installRequest) return;
    history.replaceState(history.state, '', `${location.pathname}${location.hash}`);
    const missing = installRequest.modules.filter((key) => !enabled.has(key));
    if (!missing.length) return;
    const next = new Set(enabled);
    for (const key of missing) if (next.size < MODULES_MAX) next.add(key);
    setEnabled(next);
    // Once, for the address that the page opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installRequest]);
  // Effects fitted from LUTs and native looks read on this page. This browser keeps them for the
  // next visit.
  const [allImported, setImported] = useState<readonly ImportedEffect[]>(initialImports);
  const [build, setBuild] = useState<Build>({ state: 'idle' });
  // A retry of a failed catalog request clears the error boundaries that use the catalog.
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  // A newer build or a changed selection makes the result of an older build stale.
  const buildRun = useRef(0);
  const [mode, setMode] = useState<InstallMode>(initialMode);
  const [packageStatus, setPackageStatus] = useState<PackageStatus>({ state: 'idle' });
  // The connected SD card. The page changes it only when the user confirms the changes.
  const [card, setCard] = useState<CardSession | null>(null);
  const [lastCard, setLastCard] = useState<CardDirectory | null>(initialCard);
  const [cardTask, setCardTask] = useState<CardTask>({ kind: 'idle' });
  const [connectMessage, setConnectMessage] = useState<CardMessage>(null);
  const [applyMessage, setApplyMessage] = useState<CardMessage>(null);
  const [removeMessage, setRemoveMessage] = useState<CardMessage>(null);
  // The section whose action runs, so that only it shows the progress.
  const [taskArea, setTaskArea] = useState<'apply' | 'remove'>('apply');
  // A newer connection makes the result of an older card task stale.
  const cardRun = useRef(0);

  const t = STRINGS[language];
  const packageOpen = <PackageOpen strings={t} status={packageStatus} onOpen={openPackage} />;
  // An app browser, such as WeChat's, often saves no GRKU.zip, so the page asks for a browser.
  const appBrowser = suggestOwnBrowser();
  // Without an app browser, the page tells how to write to the card: on a computer from a phone,
  // or in Chrome or Edge from another computer browser.
  const cardHintKind = suggestCardHint();
  const camera = CAMERAS.find((item) => item.key === cameraKey) ?? CAMERAS[0]!;
  const support = camera.support;
  const targets = support?.targets;
  const available = support?.modules ?? [];
  // The imports that the camera can use. The others stay for a later change of camera, but the
  // list, the selection count, the package, and the card leave them out.
  const imported = importsForCamera(allImported, camera.key);
  const cardExtra = extraCardEffects(card?.extra ?? [], imported);
  // A card with GRKU fixes the camera: an update or a change keeps the camera of the card. One
  // build runs on two entries, such as GR III and GR IIIx, so the user can still pick between them.
  // Only the card mode uses the card.
  const active = mode === 'card' ? card : null;
  // Uninstall shows for a card with GRKU, for the files that turned SD scripts off, and for the
  // result of the last uninstall.
  const showUninstall =
    !!active &&
    (active.state.install !== 'none' || active.state.modeset?.command === 'off' || !!removeMessage);
  const cardCameras =
    active && active.state.install !== 'none'
      ? camerasForCard(cardBuilds(active.state), active.state.rootNames)
      : null;
  const lockedCameras = cardCameras && cardCameras.length > 0 ? cardCameras : null;
  // With a card whose GRKU tells its camera, the card facts show the camera instead of the
  // camera section.
  const cardCamera =
    active && lockedCameras
      ? {
          options: lockedCameras,
          selected: camera,
          firmware: firmwareForTarget(camera, oneBuild(cardBuilds(active.state))),
        }
      : null;
  // Before the first change, every catalog effect is checked, so the count is not 0.
  const plan = planModules(enabled, selection?.size ?? 1, available);
  const family = familyOf(camera.key);
  const recipeLibrary = useRecipeLibrary({
    family,
    inPackage: plan.modules.includes('RECIPES'),
    storage: browserStorage,
    onChange: resetBuild,
  });

  // The picture of Shutdown Screen: the choice of this browser, and the picture of the user.
  const [shutdownSaved] = useState(() => loadShutdown(browserStorage()));
  const [shutdownChosen, setShutdownChosen] = useState<ShutdownKind | null>(shutdownSaved.kind);
  const [ownPicture, setOwnPicture] = useState<Uint8Array | null>(shutdownSaved.own);
  // The picture made in GRKU Studio, as drawn at its last Done.
  const [studioPicture, setStudioPicture] = useState<Uint8Array | null>(shutdownSaved.studio);
  const [logoPicture, setLogoPicture] = useState<Uint8Array | null>(null);
  const logoUrl = siteUrl(LOGO_PATH);
  const pictureOnCard = active?.state.shutdownPicture ?? null;
  const pictureKind = shutdownKind(shutdownChosen, ownPicture, pictureOnCard, studioPicture);
  // The ready-made designs, and the file of the chosen one as it is drawn now.
  const [designs, setDesigns] = useState<DesignState>(() => loadDesigns(browserStorage()));
  const design = designChoice(designs);
  const designKey = JSON.stringify(design);
  const [designFile, setDesignFile] = useState<{ key: string; bytes: Uint8Array } | null>(null);
  const designPicture = designFile?.key === designKey ? designFile.bytes : null;
  const picture = pictureFor(pictureKind, logoPicture, ownPicture, designPicture, studioPicture);
  // The logo file waits for the steps that use it.
  const needsLogo = page === 'modules' || page === 'write';
  useEffect(() => {
    if (!needsLogo || logoPicture) return;
    let live = true;
    loadLogo(logoUrl).then(
      (bytes) => live && setLogoPicture(bytes),
      (error: unknown) => console.error(error),
    );
    return () => {
      live = false;
    };
  }, [needsLogo, logoPicture, logoUrl]);

  // The file of the design follows the choice, a moment after the last change of the text.
  const drawDesignFile = pictureKind === 'design' && needsLogo && !designPicture;
  useEffect(() => {
    if (!drawDesignFile) return;
    let live = true;
    const choice = JSON.parse(designKey) as typeof design;
    const timer = setTimeout(() => {
      makeDesignPicture(choice).then(
        (bytes) => live && setDesignFile({ key: designKey, bytes }),
        (error: unknown) => console.error(error),
      );
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [drawDesignFile, designKey]);

  function chooseDesigns(state: DesignState) {
    setDesigns(state);
    saveDesigns(browserStorage(), state);
  }

  function chooseShutdown(kind: ShutdownKind) {
    setShutdownChosen(kind);
    saveShutdownKind(browserStorage(), kind);
  }

  function chooseStudioPicture(bytes: Uint8Array) {
    setStudioPicture(bytes);
    saveStudioPicture(browserStorage(), bytes);
  }

  function chooseOwnPicture(bytes: Uint8Array) {
    setOwnPicture(bytes);
    saveOwnPicture(browserStorage(), bytes);
  }

  function prefetch() {
    if (targets) prefetchPackage(targets, camera.id, language);
  }

  // When the effects come into view, the package files start to download, so Download is quick
  // on a slow connection. A change of camera or language observes again for the new files.
  const prefetchInView = useCallback(
    (section: HTMLElement | null) => {
      if (!section || !targets) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            prefetchPackage(targets, camera.id, language);
          }
        },
        { rootMargin: '200px 0px' },
      );
      observer.observe(section);
      return () => observer.disconnect();
    },
    [targets, camera.id, language],
  );

  // The page that shows now, for a language that arrives after a move to another page.
  const pageNow = useRef(page);
  pageNow.current = page;
  const languageRun = useRef(0);
  function chooseLanguage(next: Language) {
    loadFonts(next);
    const run = ++languageRun.current;
    // The text of the language downloads first; the page changes when it is there, on the page
    // that shows then. A later choice wins over an earlier one that arrives late.
    const target = pageNow.current;
    void Promise.all([loadStrings(next), isDocsPage(target) ? loadDocs(next) : null]).then(async () => {
      if (isDocsPage(pageNow.current)) await loadDocs(next);
      if (run !== languageRun.current) return;
      applyLanguage(next, pageNow.current);
      setLanguage(next);
    });
  }

  // After a move or a change of language, the head takes the tags of the prerendered page.
  const headSynced = useRef(false);
  useEffect(() => {
    const path = pagePath(language, page);
    // The first render keeps the head of its HTML, unless the start moved to another address (`/#install`).
    if (!headSynced.current) {
      headSynced.current = true;
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      if (canonical && new URL(canonical, location.href).pathname === path) return;
    }
    void syncHead(path);
  }, [language, page]);

  /** Shows `next` without a reload, as a new entry of the history. */
  const navigate: Navigate = (next, hash = '') => {
    history.pushState(null, '', `${pagePath(language, next)}${hash}`);
    // A language that arrives before the page shows applies to this page.
    pageNow.current = next;
    showLanguage(language, next);
    // A transition keeps the current page on screen while the part of the next one downloads.
    startTransition(() => {
      setMoved(true);
      setPage(next);
      setScrollTarget({ hash });
    });
  };
  const link: PageLink = (next, hash) => pageLink(language, navigate, next, hash);

  // Back and forward show the page of the address, in its language.
  useEffect(() => {
    async function back() {
      // A language that is still on its way would move this page back to the earlier one, and a
      // later Back or Forward wins over this one when its text arrives first.
      const mine = ++languageRun.current;
      const next = pathPage(location.pathname) ?? 'home';
      const nextLanguage = pathLanguage(location.pathname);
      const hash = location.hash;
      pageNow.current = next;
      loadFonts(nextLanguage);
      await loadStrings(nextLanguage);
      if (mine !== languageRun.current) return;
      showLanguage(nextLanguage, next);
      startTransition(() => {
        setMoved(true);
        setLanguage(nextLanguage);
        setPage(next);
        setScrollTarget({ hash });
      });
    }
    addEventListener('popstate', back);
    return () => removeEventListener('popstate', back);
  }, []);

  useEffect(() => {
    if (!scrollTarget) return;
    const target = () => (scrollTarget.hash ? document.getElementById(scrollTarget.hash.slice(1)) : null);
    if (!target()) {
      window.scrollTo(0, 0);
      return;
    }
    target()?.scrollIntoView({ block: 'start' });
    // The looks above a step fill in as the catalog arrives, which moves the step down: it comes
    // back into place for a moment, until the visitor scrolls.
    const again = () => target()?.scrollIntoView({ block: 'start' });
    const timers = [setTimeout(again, 400), setTimeout(again, 1200)];
    const stop = () => timers.forEach(clearTimeout);
    addEventListener('wheel', stop, { once: true, passive: true });
    addEventListener('touchstart', stop, { once: true, passive: true });
    addEventListener('keydown', stop, { once: true });
    return () => {
      stop();
      removeEventListener('wheel', stop);
      removeEventListener('touchstart', stop);
      removeEventListener('keydown', stop);
    };
  }, [scrollTarget]);

  /** A change of the selection makes the result of a download or a card write stale. */
  function resetBuild() {
    buildRun.current += 1;
    setBuild({ state: 'idle' });
    setApplyMessage(null);
  }

  function chooseCamera(key: Camera['key']) {
    setCameraKey(key);
    resetBuild();
    // The recipe file holds no camera line, and one card fits GR IV and GR IV Monochrome, so the
    // recipes of the card are read again for the line of the chosen camera.
    const of = familyOf(key);
    if (card && of !== familyOf(camera.key)) void readCardRecipes(card, of);
  }

  /** Reads the recipes of the card `session` again for the camera line `of`. */
  async function readCardRecipes(session: CardSession, of: Family) {
    const run = cardRun.current;
    const next = await withFamily(session, of);
    if (run !== cardRun.current) return;
    setCard((current) => (current === session ? next : current));
    if (next.recipes) recipeLibrary.adoptCard(of, next.recipes);
  }

  function keepSelection(next: ReadonlySet<string>) {
    setSelection(next);
    saveSelection(browserStorage(), next);
  }

  function changeSelection(next: ReadonlySet<string>) {
    keepSelection(next);
    resetBuild();
  }

  // The effects section checks an import (`selectImport`). An import with the ID of an earlier
  // one, such as a native look read again, takes its place.
  function addImported(effect: ImportedEffect) {
    setImported((current) => [...current.filter((item) => item.id !== effect.id), effect]);
    void saveImport(effect);
    resetBuild();
  }

  // A new name or icon keeps the import in its place and keeps its ID.
  function editImported(effect: ImportedEffect) {
    setImported((current) => current.map((item) => (item.id === effect.id ? effect : item)));
    void updateImport(effect);
    resetBuild();
  }

  function removeImported(effect: ImportedEffect) {
    setImported((current) => current.filter((item) => item !== effect));
    void deleteImport(effect.id);
    if (selection?.has(effect.id)) {
      const next = new Set(selection);
      next.delete(effect.id);
      changeSelection(next);
    } else {
      resetBuild();
    }
  }

  function toggleModule(key: ModuleKey) {
    const next = new Set(enabled);
    if (!next.delete(key)) {
      // The camera holds at most MODULES_MAX modules: one has to go off first.
      if (next.size >= MODULES_MAX) return;
      next.add(key);
    }
    setEnabled(next);
    resetBuild();
  }

  const [scriptsOff, setScriptsOff] = useState<'idle' | 'building' | 'failed'>('idle');

  async function downloadScriptsOff() {
    setScriptsOff('building');
    try {
      save(await buildScriptsOff(camera.id), 'GRKU-scripts-off.zip');
      trackScriptsOff(camera);
      setScriptsOff('idle');
    } catch (error) {
      console.error(error);
      setScriptsOff('failed');
    }
  }

  /**
   * The checked effects of the table. The builds of a camera have the same effects, so the first
   * build's catalog serves the package. Imported effects do not depend on the target.
   */
  async function checkedEffects(): Promise<PackageEffect[]> {
    const catalog = (await loadCatalog(targets![0]!)).effects;
    const others = [...imported, ...cardExtra];
    const checked = resolveSelection(
      selection,
      catalog.map((effect) => effect.id),
      others.map((effect) => effect.id),
    );
    return [...catalog, ...others].filter((effect) => checked.has(effect.id));
  }

  /** The effects of the package: the checked ones, or none while Film Look is off. */
  const packageEffects = () => (plan.includeEffects ? checkedEffects() : Promise.resolve([]));

  /**
   * The `.GRF` files of the site effects that `effects` leaves out, while Film Look is on: the
   * camera then does not list them, also when an earlier package put them on the card.
   */
  async function leftOutEffects(effects: readonly PackageEffect[]): Promise<string[]> {
    if (!plan.includeEffects) return [];
    const chosen = new Set(effects.map((effect) => effect.id));
    return (await loadCatalog(targets![0]!)).effects
      .filter((effect) => !chosen.has(effect.id))
      .map((effect) => effect.file);
  }

  /** Opens the card picker, then reads the card that the user picks. */
  async function connectCard() {
    let root;
    try {
      root = await pickCard();
    } catch (error) {
      if (errorName(error) !== 'AbortError') {
        console.error(error);
        setConnectMessage({
          tone: 'error',
          lines: [errorName(error) === 'NotAllowedError' ? t.cardPermission : t.cardConnectError],
        });
      }
      return;
    }
    await openCard(root);
  }

  /** Reads the card of an earlier visit again, after the user allows editing it. */
  async function reconnectCard() {
    if (!lastCard) return;
    try {
      if (!(await allowCard(lastCard))) {
        setConnectMessage({ tone: 'error', lines: [t.cardPermission] });
        return;
      }
    } catch (error) {
      console.error(error);
      setConnectMessage({ tone: 'error', lines: [t.cardNotInserted] });
      return;
    }
    await openCard(lastCard, t.cardNotInserted);
  }

  /**
   * Shows what a card or a package holds: its camera, its modules, and its effects as the
   * selection. Returns the camera.
   */
  function adoptCard(session: CardSession): Camera {
    const state = session.state;
    const fit = cameraForCard(camera, cardBuilds(state), state.rootNames) ?? camera;
    setCameraKey(fit.key);
    if (state.install !== 'none') {
      keepSelection(new Set(session.effects.keys()));
      const ids = new Set(cardModules(state));
      setEnabled(new Set(MODULES.filter((module) => ids.has(module.id)).map((module) => module.key)));
    }
    return fit;
  }

  /**
   * Adds the LUT imports that a card or a package keeps and this browser lacks: each import of
   * its import library, or without one, its effect files of LUT imports. Returns the added
   * imports. `source` names the card or the ZIP.
   */
  async function adoptImports(
    root: CardDirectory,
    session: CardSession,
    source: string,
    catalog: Catalog,
  ): Promise<ImportedEffect[]> {
    if (!catalog.baseGamma) return [];
    const library = await readFile(root, IMPORTS_FILE);
    const entries = library ? await readLibrary(library).catch(() => []) : [];
    // The details join the restored imports by the ID of each library effect.
    const details = new Map<string, LibraryDetails>();
    for (const entry of entries) {
      const label = await effectLabel(entry.effect);
      if (label) details.set(label.id, entry.details);
    }
    const files = [
      ...entries.map((entry) => ({ bytes: entry.effect, tone: nativeTone(entry.details) })),
      ...session.extra
        .filter((effect) => isLutImportId(effect.id))
        .map((effect) => ({ bytes: effect.card.bytes })),
    ];
    const { effects } = await restoreImports(
      files,
      source,
      catalog.baseGamma,
      [...catalog.effects, ...allImported].map((effect) => effect.id),
      new AbortController().signal,
    );
    const added = effects.map((effect) => withDetails(effect, details.get(effect.id)));
    for (const effect of added) addImported(effect);
    return added;
  }

  /** Reads a GRKU.zip of an earlier download as the card that it makes, or fails for another file. */
  async function readPackage(file: File) {
    const root = await packageCard(file);
    const catalog = await loadCatalog(PREVIEW_TARGET);
    const session = await openSession(root, [...catalog.effects, ...imported], family);
    if (session.state.install !== 'current') throw new Error('The ZIP is not a GRKU package');
    return { root, session, catalog };
  }

  /**
   * True when `session` installs a native look that neither this browser nor `added` has: a look
   * unlocked before the page kept it in the import library, so it needs an unlock again.
   */
  const lockedLooks = (session: CardSession, added: readonly ImportedEffect[]) =>
    NATIVE_LOOKS.some(
      (look) =>
        session.effects.has(look.id) &&
        !allImported.some((effect) => effect.id === look.id) &&
        !added.some((effect) => effect.id === look.id),
    );

  /** Reads a GRKU.zip of an earlier download and shows what it holds, as a card does. */
  async function openPackage(file: File) {
    setPackageStatus({ state: 'reading' });
    try {
      const { root, session, catalog } = await readPackage(file);
      const fit = adoptCard(session);
      const added = await adoptImports(root, session, file.name, catalog);
      // The package works without its recipes, so a damaged library adds none.
      const recipes = await recipeLibrary.restorePackage(root).catch((error: unknown) => {
        console.warn(error);
        return { count: 0, family: null };
      });
      // A package fits GR IV and GR IV Monochrome; the camera line of its recipes tells which.
      const line = recipes.family;
      if (line && line !== familyOf(fit.key)) {
        const other = camerasForCard(cardBuilds(session.state), session.state.rootNames)?.find(
          (item) => familyOf(item.key) === line,
        );
        if (other) setCameraKey(other.key);
      }
      resetBuild();
      setPackageStatus({
        state: 'done',
        added: added.length,
        recipes: recipes.count,
        locked: lockedLooks(session, added),
      });
    } catch (error) {
      console.error(error);
      setPackageStatus({ state: 'error' });
    }
  }

  /** Reads the card and shows what it holds as the selection. `failure` is the error text. */
  async function openCard(root: CardDirectory, failure = t.cardConnectError) {
    const run = (cardRun.current += 1);
    setCardTask({ kind: 'reading' });
    setConnectMessage(null);
    setApplyMessage(null);
    setRemoveMessage(null);
    try {
      const catalog = await loadCatalog(PREVIEW_TARGET);
      const opened = await openSession(root, [...catalog.effects, ...imported], family);
      if (run !== cardRun.current) return;
      const fit = adoptCard(opened);
      // The recipes of the camera are those of its recipe file: the page shows and edits them.
      const session = await withFamily(opened, familyOf(fit.key));
      if (run !== cardRun.current) return;
      recipeLibrary.dropCardChoice();
      if (session.recipes) recipeLibrary.adoptCard(familyOf(fit.key), session.recipes);
      setCard(session);
      setLastCard(root);
      void saveLastCard(root);
      resetBuild();
      if (fit.support) prefetchPackage(fit.support.targets, fit.id, language);
      // The imports of an earlier browser come back with the card. The card works without them.
      await adoptImports(root, session, root.name, catalog).catch((error) => console.warn(error));
    } catch (error) {
      console.error(error);
      if (run === cardRun.current) setConnectMessage({ tone: 'error', lines: [failure] });
    } finally {
      if (run === cardRun.current) setCardTask({ kind: 'idle' });
    }
  }

  /** Runs one action of Remove GRKU on the connected card, then reads the card again. */
  async function removeAction(
    task: CardTask,
    action: (session: CardSession) => Promise<void>,
    done: readonly string[],
  ) {
    if (!card) return;
    const session = card;
    const run = cardRun.current;
    setApplyMessage(null);
    setRemoveMessage(null);
    setTaskArea('remove');
    setCardTask(task);
    try {
      await action(session);
      const catalog = await loadCatalog(PREVIEW_TARGET);
      const next = await openSession(session.root, [...catalog.effects, ...imported], family);
      if (run !== cardRun.current) return;
      setCard(next);
      setRemoveMessage({ tone: 'ok', lines: done });
    } catch (error) {
      console.error(error);
      if (run === cardRun.current) setRemoveMessage({ tone: 'error', lines: cardErrorLines(error, t, false) });
    } finally {
      if (run === cardRun.current) setCardTask({ kind: 'idle' });
    }
  }

  const uninstallCard = (data: boolean, scriptsOff: boolean) =>
    removeAction(
      { kind: 'finishing' },
      async (session) => {
        await removeGrku(session.root, data);
        if (scriptsOff) await writeFiles(session.root, await scriptsOffCardFiles(camera.id));
        trackCardUninstall(camera, data, scriptsOff);
      },
      scriptsOff ? [t.uninstallDone, t.scriptsOffNext] : [t.uninstallDone],
    );

  const scriptsOffCard = () =>
    removeAction(
      { kind: 'writing', written: 0, total: 2 },
      async (session) => {
        await writeFiles(session.root, await scriptsOffCardFiles(camera.id));
        trackScriptsOff(camera);
      },
      [t.scriptsOffDone],
    );

  const cleanModeset = () =>
    removeAction(
      { kind: 'finishing' },
      (session) => removeModesetFiles(session.root, session.state),
      [t.modesetCleaned],
    );

  function chooseMode(next: InstallMode) {
    setMode(next);
    saveMode(next);
    setApplyMessage(null);
    setRemoveMessage(null);
  }

  function disconnectCard() {
    cardRun.current += 1;
    setCard(null);
    setLastCard(null);
    void forgetLastCard();
    setConnectMessage(null);
    setApplyMessage(null);
    setRemoveMessage(null);
  }

  /** The changes from the card to the selection: `checked` gives the checked effect IDs. */
  function cardChanges(session: CardSession, checked: readonly string[], shutdown: PictureChoice = picture): CardChanges {
    const changes = planChanges(
      session.state,
      __GRKU_VERSION__,
      plan.modules,
      plan.includeEffects
        ? { before: [...session.effects.keys()], after: checked, changed: [...changedImports(session, imported)] }
        : null,
      recipeLibrary.cardChange(session),
      pictureChange(session.state.shutdownPicture, shutdown),
    );
    return session.written && changes.grku === 'update' ? { ...changes, grku: 'same' } : changes;
  }

  /** Writes the changes that the user confirmed, then reads the card again. */
  async function applyCard() {
    if (!card || !targets) return;
    const session = card;
    const run = cardRun.current;
    setApplyMessage(null);
    setRemoveMessage(null);
    setTaskArea('apply');
    setCardTask({ kind: 'preparing', received: 0 });
    try {
      const checked = await checkedEffects();
      const effects = plan.includeEffects ? cardPackageEffects(checked) : [];
      const imports = await encodeLibrary(allImported);
      const files = await buildCardFiles(
        targets,
        camera.id,
        effects,
        plan.modules,
        language,
        imports,
        (received) => {
          if (run === cardRun.current) setCardTask({ kind: 'preparing', received });
        },
        null,
        await leftOutEffects(effects),
      );
      // The logo file of a write that starts before it arrived.
      const shutdown =
        pictureKind === 'logo'
          ? await loadLogo(logoUrl)
          : pictureKind === 'design'
            ? (designPicture ?? (await makeDesignPicture(design)))
            : pictureFor(pictureKind, logoPicture, ownPicture, null, studioPicture);
      const changes = cardChanges(
        session,
        checked.map((effect) => effect.id),
        shutdown,
      );
      const library = await libraryChanges(
        session,
        files,
        checked,
        [...changes.addEffects, ...changes.updateEffects],
        changes.removeEffects,
      );
      // The recipes of the site replace the recipe file of the camera, which keeps its import
      // record; the library of a ZIP package has no more use.
      if (changes.recipes === 'write' && recipeLibrary.packageRecipes) {
        const text = await writeRecipeFile(recipeLibrary.packageRecipes, family, session.state.recipeText ?? '');
        files.push({ path: RECIPE_FILE, bytes: new TextEncoder().encode(text) });
        library.remove.push(RECIPES_PACKAGE);
      }
      // The picture of Shutdown Screen goes to the data folder, or leaves it.
      const goodbye = shutdownWrite(changes.shutdown, shutdown);
      files.push(...goodbye.files);
      library.remove.push(...goodbye.remove);
      await applyChanges(session.root, session.state, files, library, ({ written, total }) => {
        if (run !== cardRun.current) return;
        setCardTask(written < total ? { kind: 'writing', written, total } : { kind: 'finishing' });
      });
      const catalog = await loadCatalog(PREVIEW_TARGET);
      const next = await openSession(session.root, [...catalog.effects, ...imported], family);
      if (run !== cardRun.current) return;
      setCard({ ...next, written: true });
      setApplyMessage({
        tone: 'ok',
        // The camera steps after the write: the MENU step for a first install and for SD scripts
        // that were off, then GRKU in ADJ.
        lines: [
          t.cardDone,
          t.cardStepInsert,
          ...(changes.grku === 'install' ? [t.cardDoneFirst] : changes.scriptsOn ? [t.cardEnable] : []),
          t.steps[3]!.join(''),
        ],
      });
      trackCardWrite(
        camera,
        plan,
        plan.includeEffects ? checked.length : 0,
        language,
        changes.grku === 'same' ? 'change' : changes.grku,
      );
    } catch (error) {
      console.error(error);
      if (run === cardRun.current) {
        // Only a site file that did not arrive is a download error. Other errors are the card's.
        if (error instanceof TransferError) trackDownloadError(camera, 'card', appBrowser, error);
        setApplyMessage({ tone: 'error', lines: cardErrorLines(error, t, true) });
      }
    } finally {
      if (run === cardRun.current) setCardTask({ kind: 'idle' });
    }
  }

  async function download() {
    if (!targets || plan.visible.length === 0) {
      return;
    }
    buildRun.current += 1;
    const run = buildRun.current;
    setBuild({ state: 'building', received: 0, retrying: false });
    try {
      const effects = await packageEffects();
      const recipes = await recipeLibrary.packageBytes();
      const blob = await buildPackage(
        targets,
        camera.id,
        effects,
        plan.modules,
        language,
        await encodeLibrary(allImported),
        (received, retrying) => {
          if (run === buildRun.current) setBuild({ state: 'building', received, retrying });
        },
        recipes,
        await leftOutEffects(effects),
      );
      if (run === buildRun.current) {
        save(blob, packageFilename(__GRKU_VERSION__, camera.name, new Date()));
        trackDownload(camera, plan, effects.length, language);
        setBuild({ state: 'ready' });
      }
    } catch (error) {
      console.error(error);
      if (run === buildRun.current) {
        trackDownloadError(camera, 'zip', appBrowser, error);
        setBuild({ state: 'failed' });
      }
    }
  }

  // GRKU Plus: the key of this browser and what it owns. The key of a mail link comes first.
  const [plusKey, setPlusKey] = useState<string | null>(() => takeKeyFromHash() ?? loadKey());
  const [owned, setOwned] = useState<Entitlement>(FREE);
  // A phone that scanned the pay QR of another page opens this page with the order to pay.
  const [payOrder] = useState<string | null>(() => takeOrderFromHash());
  const [plusOpen, setPlusOpen] = useState(() => payOrder !== null);
  // GRKU Plus downloads its part when it first opens, and stays mounted for its closing animation.
  const [plusMounted, setPlusMounted] = useState(plusOpen);
  if (plusOpen && !plusMounted) setPlusMounted(true);
  const [plusStart, setPlusStart] = useState<'tiers' | 'key'>('tiers');
  // A question for the assistant from a page of the manual (Ask AI about this page).
  const [chatRequest, setChatRequest] = useState<{ question: string; at: number } | null>(null);
  useEffect(() => {
    if (!plusKey) return;
    let live = true;
    fetchEntitlement(plusKey)
      .then((result) => {
        if (live) setOwned(result.entitlement);
      })
      .catch((failure: unknown) => {
        // A key that the service rejects is gone. A service that does not answer keeps the key for later.
        if (live && failure instanceof PlusError && failure.status === 401) {
          forgetKey();
          setPlusKey(null);
          setOwned(FREE);
        }
      });
    return () => {
      live = false;
    };
  }, [plusKey]);

  function adoptKey(key: string, entitlement: Entitlement) {
    saveKey(key);
    setPlusKey(key);
    setOwned(entitlement);
  }

  function dropKey() {
    forgetKey();
    setPlusKey(null);
    setOwned(FREE);
  }

  // The catalog of the preview target, for the counts of the page. The workbench loads the same one.
  const { catalog: previewCatalog } = useCatalog(PREVIEW_TARGET);
  const checkedCount = previewCatalog
    ? resolveSelection(
        selection,
        previewCatalog.effects.map((effect) => effect.id),
        [...imported, ...(active ? cardExtra : [])].map((effect) => effect.id),
      ).size
    : null;
  const effectCount = plan.includeEffects ? checkedCount : 0;
  const canWrite = canWriteCards();
  const offered = MODULES.filter((module) => available.includes(module.key));
  const moduleNames = MODULES.filter((module) => plan.visible.includes(module.key)).map((module) => t.moduleNames[module.key]);

  const packageLinks = (
    <ul className="flex flex-wrap gap-2">
      <li>
        <Button asChild variant="outline">
          <a href={FEEDBACK}>{t.feedback}</a>
        </Button>
      </li>
    </ul>
  );

  /** The steps of a guide as an entry of the accordion under the download. */
  const guide = (value: string, title: string, steps: readonly (readonly string[])[], extra?: ReactNode) => (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-[15px] font-medium hover:no-underline">{title}</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4">
        <ol className={STEPS}>
          {steps.map((parts, index) => (
            <li key={index}>
              <RichText parts={parts.map((part) => (part === MODESET_TOKEN ? `\`${support?.modeset ?? ''}` : part))} />
            </li>
          ))}
        </ol>
        {extra}
      </AccordionContent>
    </AccordionItem>
  );

  // The write or the download is done: the step says so and leads on to the camera.
  const finished = mode === 'card' && canWrite ? applyMessage?.tone === 'ok' : build.state === 'ready';

  // What to do on the camera afterwards, numbered, with the card and the camera as they will look.
  // It stands out once the card is written or the ZIP is here.
  const cameraStepLines =
    mode === 'card' && canWrite ? [t.cardStepInsert, t.cardDoneFirst, t.zipNext4] : [t.zipNext1, t.zipNext2, t.zipNext3, t.zipNext4];
  const cameraStepImages: Record<number, readonly [string, number, number]> =
    mode === 'card' && canWrite
      ? { 1: [cameraMenuImage, 580, 318], 2: [cameraAdjImage, 580, 318] }
      : { 1: [CARD_IMAGES[camera.key] ?? CARD_IMAGES.gr4!, 340, 178], 2: [cameraMenuImage, 580, 318], 3: [cameraAdjImage, 580, 318] };
  const cameraSteps = (
    <section
      aria-labelledby="camera-steps"
      className={cn('rounded-2xl border bg-card p-5 transition-colors lg:sticky lg:top-24', finished && 'border-foreground/30')}
    >
      <h2 id="camera-steps" className="text-base font-semibold">
        {t.site.thenTitle}
      </h2>
      <ol className="mt-4 flex list-none flex-col gap-5 p-0">
        {cameraStepLines.map((line, index) => (
          <li key={line} className="flex gap-3">
            <StepNumber n={index + 1} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed">{line}</p>
              {cameraStepImages[index] && (
                <img
                  src={cameraStepImages[index]![0]}
                  alt=""
                  width={cameraStepImages[index]![1]}
                  height={cameraStepImages[index]![2]}
                  loading="lazy"
                  className="mt-3 h-auto w-full rounded-lg"
                />
              )}
            </div>
          </li>
        ))}
      </ol>
      <a {...link('guide')} className="mt-5 flex w-fit items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        <BookOpen className="size-4" aria-hidden="true" />
        {t.card}
      </a>
      <a
        href={guidePdfUrl(camera.id, language)}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <FileText className="size-4" aria-hidden="true" />
        {t.zipGuideButton}
      </a>
    </section>
  );

  const zipFlow = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
      {packageOpen}
      <div className="flex flex-col items-start gap-3">
        <Button
          type="button"
          variant="brand"
          size="lg"
          className="h-11 px-6 text-[15px]"
          disabled={!targets || plan.visible.length === 0 || build.state === 'building'}
          aria-busy={build.state === 'building'}
          onClick={download}
          onPointerEnter={prefetch}
          onFocus={prefetch}
        >
          {t.download}
        </Button>
        <TermsNote text={t.termsNote} href={guideUrl('TERMS', language)} />
        <div aria-live="polite" className="flex flex-col gap-1">
          {plan.visible.length === 0 && <p className={ERROR}>{t.noModules}</p>}
          {build.state === 'building' && (
            <p className={STATUS}>
              {build.retrying ? t.retrying : build.received > 0 ? t.downloading(megabytes(build.received)) : t.building}
            </p>
          )}
          {build.state === 'ready' && <p className={STATUS}>{t.ready}</p>}
          {build.state === 'failed' && <p className={ERROR}>{t.buildError}</p>}
        </div>
        {build.state === 'ready' && packageLinks}
      </div>
      {/* GRKU.zip holds no file of the data folder, so the picture downloads on its own. */}
      {picture instanceof Uint8Array && (
        <Suspense fallback={null}>
          <ShutdownDownload strings={t} picture={picture} />
        </Suspense>
      )}
      </div>
      <div>
      <Accordion type="single" collapsible className="w-full border-t border-border">
        {guide('install', t.install, t.steps)}
        {guide('update', t.update, t.updateSteps)}
        {guide(
          'remove',
          t.remove,
          t.removeSteps,
          <div className="flex flex-col items-start gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!support || scriptsOff === 'building'}
              aria-busy={scriptsOff === 'building'}
              onClick={downloadScriptsOff}
            >
              {t.scriptsOff(camera.name)}
            </Button>
            <div aria-live="polite">{scriptsOff === 'failed' && <p className={ERROR}>{t.scriptsOffError}</p>}</div>
          </div>,
        )}
      </Accordion>
      </div>
      </div>
    </div>
  );

  const cardFlow = (
    <div className="flex flex-col gap-8">
      <CardConnect
        strings={t}
        session={card}
        otherCamera={!!card && !!support && cardBuilds(card.state).some((build) => !support.targets.includes(build))}
        busy={cardTask.kind !== 'idle'}
        reading={cardTask.kind === 'reading'}
        message={connectMessage}
        lastCard={lastCard?.name ?? null}
        onConnect={connectCard}
        onReconnect={reconnectCard}
        onDisconnect={disconnectCard}
      />
      {card && (
        <ErrorBoundary
          resetKey={String(catalogAttempt)}
          fallback={
            <div className="flex flex-col items-start gap-3">
              <p className={ERROR}>{t.loadError}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setCatalogAttempt((attempt) => attempt + 1)}>
                {t.retryLoad}
              </Button>
            </div>
          }
        >
          <Suspense fallback={<p className={STATUS}>{t.loading}</p>}>
            <CardChangesSection
              strings={t}
              releaseUrl={releaseUrl(language)}
              session={card}
              selection={selection}
              imported={imported}
              cardEffects={cardExtra}
              changes={cardChanges}
              modules={moduleNames}
              recipes={recipeLibrary.changeLine(card, language, t.moduleNames.recipes)}
              canWrite={!!targets && plan.visible.length > 0}
              busy={cardTask.kind !== 'idle'}
              task={taskArea === 'apply' ? cardTask : IDLE}
              message={applyMessage}
              onApply={applyCard}
              links={packageLinks}
              termsUrl={guideUrl('TERMS', language)}
              camera={camera.name}
              firmware={support?.firmware ?? '—'}
              shutdown={t.shutdown.title}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {card && plan.visible.length === 0 && <p className={ERROR}>{t.noModules}</p>}
      {showUninstall && (
        <div className="flex flex-col gap-4 border-t border-border pt-8">
          <h3 className="text-lg font-semibold">{t.remove}</h3>
          <CardUninstall
            strings={t}
            session={card!}
            busy={cardTask.kind !== 'idle'}
            task={taskArea === 'remove' ? cardTask : IDLE}
            message={removeMessage}
            onUninstall={uninstallCard}
            onScriptsOff={scriptsOffCard}
            onCleanModeset={cleanModeset}
          />
        </div>
      )}
    </div>
  );

  /** Why the visitor cannot go on from `step` yet, or null. */
  function stepBlocked(step: InstallStep): string | null {
    if (step === 'camera' && !cameraChosen) return t.site.cameraPick;
    if (step === 'modules') {
      if (plan.visible.length === 0) return t.noModules;
      if (plan.includeEffects && effectCount === 0) return t.filmLookEmpty;
    }
    return null;
  }

  const openPlus = () => {
    setPlusStart('tiers');
    setPlusOpen(true);
  };

  return (
    <>
      {(appBrowser || (page === 'install' && cardHintKind)) && (
        <div className="bg-foreground px-gutter py-2.5 text-center text-[13px] leading-snug text-balance text-background" role="note">
          {appBrowser ? t.appBrowser : cardHintKind === 'computer' ? t.cardComputer : t.cardBrowser}
        </div>
      )}
      <Masthead
        strings={t}
        language={language}
        onLanguage={chooseLanguage}
        version={__GRKU_VERSION__}
        releaseUrl={releaseUrl(language)}
        page={page}
        link={link}
        installStep={progress.last}
      />
      <main id="top" className={cn('mx-auto w-full max-w-[1280px] px-gutter', isInstallStep(page) ? 'pb-28' : 'pb-8')}>
        {/* Shown only when a page part is not loaded yet, such as after a lost connection. */}
        <Suspense fallback={<p className={cn(STATUS, 'min-h-[60vh] py-16')}>{t.loading}</p>}>
        {page === 'home' && (
          <Home
            strings={t}
            language={language}
            link={link}
            canWrite={canWrite}
            installStep={progress.last}
            onPlus={openPlus}
            news={<WhatsNew language={language} />}
            faq={<Faq strings={t} />}
          />
        )}

        {page === 'guide' && <Guide strings={t} language={language} link={link} canWrite={canWrite} />}

        {page === 'develop' && <Develop strings={t} language={language} owned={owned} onPlus={openPlus} />}

        {isDocsPage(page) && (
          <Docs
            language={language}
            page={page}
            link={link}
            onPlus={(start) => {
              setPlusStart(start);
              setPlusOpen(true);
            }}
            onAsk={(question) => setChatRequest({ question, at: Date.now() })}
          />
        )}

        {isInstallStep(page) && (
          // The steps of the install, each its own page. A short fade marks the change of step.
          <div key={page} className={cn(moved && 'motion-safe:animate-[step-in_160ms_ease-out]')}>
            <StepIndicator strings={t} page={page} furthest={progress.furthest} link={link} />
            {page === 'install' && (
              <Workbench
                strings={t}
                selection={selection}
                onSelectionChange={changeSelection}
                imported={imported}
                onImport={addImported}
                onRemove={removeImported}
                onEdit={editImported}
                cardEffects={active ? cardExtra : []}
                onCard={active && active.state.install !== 'none' ? new Set(active.effects.keys()) : null}
                changedOnCard={active ? changedImports(active, imported) : undefined}
                family={family}
                recipes={recipeLibrary.library}
                onAddRecipe={(recipe) => recipeLibrary.change(cameraOrder([...recipeLibrary.library, recipe]))}
                owned={owned}
                onPlus={openPlus}
                initialLook={installRequest?.look ?? null}
                developLink={(look) => `${pagePath(language, 'develop')}?look=${encodeURIComponent(look)}`}
                plusKey={plusKey}
                onOtherKey={() => {
                  setPlusStart('key');
                  setPlusOpen(true);
                }}
                onForgetKey={dropKey}
                notice={!available.includes('filmLook') ? t.effectsUnavailable(camera.name) : !plan.includeEffects ? t.effectsOff : null}
              />
            )}
            {page === 'camera' && (
              <Step id="camera" title={t.site.cameraQuestion} description={cardCamera ? undefined : t.site.cameraHelp} level="h1" className="border-t-0 pt-8 lg:pt-10">
                {cardCamera ? (
                  <dl className={FACTS}>
                    <dt className={FACT_LABEL}>{t.camera}</dt>
                    <dd className={FACT_VALUE}>
                      {cardCamera.options.length > 1 ? (
                        <span className="inline-flex flex-wrap gap-2" role="group" aria-label={t.camera}>
                          {cardCamera.options.map((option) => (
                            <Button
                              key={option.key}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="aria-pressed:border-foreground aria-pressed:bg-secondary"
                              aria-pressed={option === cardCamera.selected}
                              disabled={cardTask.kind !== 'idle'}
                              onClick={() => chooseCamera(option.key)}
                            >
                              {option.name}
                            </Button>
                          ))}
                        </span>
                      ) : (
                        cardCamera.selected.name
                      )}
                    </dd>
                    <dt className={FACT_LABEL}>{t.firmware}</dt>
                    <dd className={FACT_VALUE}>{cardCamera.firmware}</dd>
                    <dt className={FACT_LABEL}>{t.cardName}</dt>
                    <dd className={FACT_VALUE}>{card?.state.name || '—'}</dd>
                  </dl>
                ) : (
                  <>
                  <RadioGroup
                    name="camera"
                    value={cameraChosen ? camera.key : ''}
                    aria-labelledby="camera-title"
                    className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                    onValueChange={(next) => chooseCamera(next as Camera['key'])}
                  >
                    {CAMERAS.map((item) => (
                      <ChoiceCard
                        key={item.key}
                        htmlFor={`camera-${item.key}`}
                        className="relative flex-col items-stretch gap-0 p-0"
                        control={
                          <RadioGroupItem
                            id={`camera-${item.key}`}
                            value={item.key}
                            className="absolute top-3 left-3"
                            disabled={!item.support || (!!lockedCameras && !lockedCameras.includes(item))}
                          />
                        }
                      >
                        {/* The camera drawn large, then its name, its lens, and the firmware it needs. */}
                        <span className="flex items-center justify-center rounded-t-xl bg-black/30 px-6 light:bg-art pt-8 pb-4">
                          <CameraArt camera={item.key} className="max-w-[180px]" />
                        </span>
                        <span className="flex flex-col gap-1 p-4">
                          <span className="flex flex-wrap items-baseline gap-x-2 font-semibold">
                            {item.name}
                            <span className="font-mono text-xs font-normal text-muted-foreground">{FOCAL_LENGTH[item.key]}</span>
                          </span>
                        {item.support && (
                          <span className="text-[13px] text-muted-foreground">
                            {t.firmware} {item.support.firmware}
                          </span>
                        )}
                        {!item.support && (
                          <Badge variant="outline" className="w-fit">
                            {t.planned}
                          </Badge>
                        )}
                        {item.support?.noEffects && <span className="text-[13px] text-muted-foreground">{t.noEffects}</span>}
                        </span>
                      </ChoiceCard>
                    ))}
                  </RadioGroup>
                  {/* How to read the firmware version, for those who do not know it. */}
                  <details className="group mt-6 max-w-[64ch] rounded-xl border bg-card px-4 py-3 text-sm">
                    <summary className="cursor-pointer list-none font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2">
                        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                        {t.site.firmwareHow}
                      </span>
                    </summary>
                    <p className="mt-2 pl-6 leading-relaxed text-muted-foreground">{t.site.firmwareHowText}</p>
                  </details>
                  </>
                )}
              </Step>
            )}
            {page === 'modules' && (
              <Step id="modules" title={t.site.extrasQuestion} description={t.site.extrasHelp} ref={prefetchInView} level="h1" className="border-t-0 pt-8 lg:pt-10">
                <ModulesStep
                  strings={t}
                  modules={offered}
                  enabled={enabled}
                  onToggle={toggleModule}
                  installed={active && active.state.install !== 'none' ? cardModules(active.state) : null}
                  planned={plan.modules}
                  emptyLooks={enabled.has('filmLook') && selection?.size === 0}
                  lookCount={effectCount ?? '…'}
                  shutdown={
                    <ShutdownSection
                      strings={t}
                      kind={pictureKind}
                      onKind={chooseShutdown}
                      own={ownPicture}
                      onOwn={chooseOwnPicture}
                      logoUrl={logoUrl}
                      onCard={pictureOnCard}
                      firmware={support?.firmware ?? ''}
                      designs={designs}
                      onDesigns={chooseDesigns}
                      studio={studioPicture}
                      onStudio={chooseStudioPicture}
                      plus={studioUnlocked(owned)}
                      onPlus={openPlus}
                      language={language}
                    />
                  }
                  recipes={
                    available.includes('recipes') && enabled.has('recipes') ? (
                      <ErrorBoundary resetKey={String(catalogAttempt)} fallback={<p className={ERROR}>{t.loadError}</p>}>
                        <Suspense fallback={<p className={STATUS}>{t.loading}</p>}>
                          <RecipesWithEffects
                            strings={t}
                            language={language}
                            family={family}
                            library={recipeLibrary.library}
                            onChange={recipeLibrary.change}
                            cardRecipes={recipeLibrary.cardChoice}
                            onCardChoice={recipeLibrary.chooseCard}
                            selection={selection}
                            filmLook={plan.includeEffects}
                            onSelectionChange={changeSelection}
                            others={[...imported, ...(active ? cardExtra : [])]}
                            grainModule={plan.modules.includes('GRAIN')}
                            glowModule={plan.modules.includes('GLOW')}
                            borderModule={plan.modules.includes('BORDER')}
                          />
                        </Suspense>
                      </ErrorBoundary>
                    ) : null
                  }
                />
              </Step>
            )}
            {page === 'write' && (
              <Step id="install" title={t.site.writeQuestion} description={t.site.writeHelp} ref={prefetchInView} level="h1" className="border-t-0 pt-8 lg:pt-10">
                {!cameraChosen ? (
                  // The card needs the camera: the step sends the visitor back to choose it.
                  <div className="flex flex-col items-start gap-4 rounded-2xl border bg-card p-6">
                    <p className="text-base font-medium">{t.site.cameraPick}</p>
                    <Button asChild>
                      <a {...link('camera')}>
                        <ArrowLeft aria-hidden="true" />
                        {t.site.cameraQuestion}
                      </a>
                    </Button>
                  </div>
                ) : (
                  <>
                    {finished && (
                      <div className="mb-8 flex items-start gap-4 rounded-2xl border border-foreground/20 bg-card p-5 motion-safe:animate-[step-in_240ms_ease-out] sm:p-6" role="status">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                          <Check className="size-5" strokeWidth={2.5} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-lg font-semibold">{mode === 'card' && canWrite ? t.site.doneTitle : t.ready}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.site.doneText}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                      <div className="min-w-0">
                        <WriteSummary
                          strings={t}
                          link={link}
                          looks={plan.includeEffects ? effectCount : 0}
                          camera={camera.name}
                          firmware={support?.firmware ?? '—'}
                          modules={moduleNames}
                          shutdown={pictureKind === 'design' ? t.shutdown.designs[design.id as keyof typeof t.shutdown.designs] : t.shutdown[pictureKind]}
                        />
                        {/* What the visitor needs at hand, before the one action of the step. */}
                        <div className="mb-8">
                          <h2 className="text-sm font-medium text-muted-foreground">{t.site.needTitle}</h2>
                          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                            {[t.cardReader, ...(canWrite && mode === 'card' ? [t.cardComputer] : []), t.site.needBattery].map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {canWrite ? (
                          <Tabs value={mode} onValueChange={(value) => chooseMode(value as InstallMode)}>
                            <TabsList className="mb-2 h-10">
                              <TabsTrigger value="card" className="px-4">
                                {t.modeCard}
                              </TabsTrigger>
                              <TabsTrigger value="zip" className="px-4">
                                {t.modeZip}
                              </TabsTrigger>
                            </TabsList>
                            <p className={`${NOTE} mb-6`}>{mode === 'card' ? t.modeCardText : t.modeZipText}</p>
                            <TabsContent value="card">{cardFlow}</TabsContent>
                            <TabsContent value="zip">{zipFlow}</TabsContent>
                          </Tabs>
                        ) : (
                          zipFlow
                        )}
                        {/* The risk, said once and quietly, under the action. */}
                        <p className="mt-10 flex max-w-[72ch] items-start gap-3 border-t border-border pt-6 text-[13px] leading-relaxed text-muted-foreground">
                          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                          <span>
                            <b className="font-medium text-foreground">{t.riskTitle}.</b> {t.riskText}
                          </span>
                        </p>
                      </div>
                      {cameraSteps}
                    </div>
                  </>
                )}
              </Step>
            )}
          </div>
        )}
        </Suspense>
      </main>
      {isInstallStep(page) && (
        <StepBar strings={t} page={page} link={link} blocked={stepBlocked(page)} />
      )}
      <SiteFooter strings={t} language={language} version={__GRKU_VERSION__} releaseUrl={releaseUrl(language)} link={link} />
      {/* Room under the footer for the bar of the install steps. */}
      {isInstallStep(page) && <div className="h-16" aria-hidden="true" />}
      {plusMounted && (
      <Suspense fallback={null}>
      <PlusSheet
        open={plusOpen}
        onOpenChange={setPlusOpen}
        strings={t}
        owned={owned}
        hasKey={!!plusKey}
        onKey={adoptKey}
        onForget={dropKey}
        startOn={plusStart}
        packCounts={previewCatalog ? packCounts(previewCatalog.effects) : null}
        libraryLooks={previewCatalog ? previewCatalog.effects.length : null}
        payOrder={payOrder}
        termsHref={`${LANGUAGE_PATHS[language]}${DOC_PATHS.TERMS}`}
        language={language}
        onBrowse={() => navigate('install', '#looks')}
      />
      </Suspense>
      )}
      {/* The GRKU assistant: where the visitor is, so its answers fit the page. Nothing personal. */}
      <ChatLauncher
        language={language}
        strings={t}
        page={page}
        plusKey={plusKey}
        request={chatRequest}
        context={{
          page,
          camera: cameraChosen ? camera.name : undefined,
          card: page === 'write' ? !!card : undefined,
          looks: isInstallStep(page) ? (effectCount ?? undefined) : undefined,
          error: [applyMessage, connectMessage, removeMessage].find((message) => message?.tone === 'error')?.lines.join(' '),
        }}
        onPlus={(start) => {
          setPlusStart(start);
          setPlusOpen(true);
        }}
        onNavigate={(href) => {
          const url = new URL(href, location.origin);
          const target = pathPage(url.pathname);
          // A page of this language without a query opens in place; a look link reloads, so the page reads it.
          if (target && !url.search && pathLanguage(url.pathname) === language) navigate(target, url.hash);
          else location.assign(url.href);
        }}
      />
    </>
  );
}

const errorName = (error: unknown) => (error as { name?: string } | null)?.name;

/**
 * The lines of a failed card task. `partial` tells that the task wrote GRKU files, so the card may
 * hold a part of them and should not go into the camera yet.
 */
function cardErrorLines(error: unknown, t: Strings, partial: boolean): string[] {
  switch (errorName(error)) {
    case 'NoModificationAllowedError':
      return [t.cardLocked];
    case 'NotAllowedError':
    case 'SecurityError':
      return [t.cardPermission];
  }
  const reason =
    errorName(error) === 'QuotaExceededError'
      ? t.cardFull
      : errorName(error) === 'NotFoundError'
        ? t.cardGone
        : t.cardWriteError;
  return [reason, partial ? t.cardPartial : t.cardTryAgain];
}

/** The build when there is exactly one, else null. */
const oneBuild = (builds: readonly string[]) => (builds.length === 1 ? builds[0]! : null);

const MODE_KEY = 'grku.installMode';

/** The storage of this site, or null when the browser blocks it. */
function browserStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

/** The card mode where the browser can write to a card, unless the user chose the ZIP before. */
function initialMode(): InstallMode {
  if (!canWriteCards()) return 'zip';
  try {
    return localStorage.getItem(MODE_KEY) === 'zip' ? 'zip' : 'card';
  } catch {
    return 'card';
  }
}

function saveMode(mode: InstallMode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // The choice is a convenience. Without storage, the page asks again next time.
  }
}

const IDLE: CardTask = { kind: 'idle' };

interface ChangesSectionProps {
  strings: Strings;
  releaseUrl: string;
  session: CardSession;
  selection: Selection;
  imported: readonly ImportedEffect[];
  cardEffects: readonly CardEffect[];
  changes: (session: CardSession, checked: readonly string[]) => CardChanges;
  modules: readonly string[];
  recipes: { label: string; text: string } | null;
  /** The label of the change of the shutdown picture. */
  shutdown: string;
  canWrite: boolean;
  busy: boolean;
  task: CardTask;
  message: CardMessage;
  onApply: () => void;
  links: ReactNode;
  hint?: ReactNode;
  termsUrl: string;
  camera: string;
  firmware: string;
}

/** The checked effect IDs of `selection`. Before the first change, it needs the catalog. */
function useChecked(selection: Selection, others: readonly { id: string }[]) {
  const catalog = use(loadCatalog(PREVIEW_TARGET));
  return {
    catalog,
    checked: resolveSelection(
      selection,
      catalog.effects.map((effect) => effect.id),
      others.map((effect) => effect.id),
    ),
  };
}

/** The changes from the card to the selection. Before the first change, it needs the catalog. */
function CardChangesSection({ strings: t, releaseUrl: release, session, selection, imported, cardEffects, changes, ...rest }: ChangesSectionProps) {
  const { catalog, checked } = useChecked(selection, [...imported, ...cardEffects]);
  const effects = [...catalog.effects, ...imported, ...cardEffects];
  const effectName = (id: string) => effects.find((effect) => effect.id === id)?.name ?? id;
  const moduleName = (id: string) => {
    const module = MODULES.find((item) => item.id === id);
    return module ? t.moduleNames[module.key] : id;
  };
  return (
    <CardChangesView
      strings={t}
      session={session}
      changes={changes(session, [...checked])}
      version={__GRKU_VERSION__}
      releaseUrl={release}
      effectCount={checked.size}
      moduleName={moduleName}
      effectName={effectName}
      {...rest}
    />
  );
}

/**
 * The recipes panel with the names of the effects of the catalog and the imports, by recipe code,
 * and the effects of the package. A preset that joins the library adds its effect to the package.
 */
function RecipesWithEffects({
  selection,
  others,
  filmLook,
  onSelectionChange,
  ...rest
}: Omit<RecipesPanelProps, 'effectNames' | 'packageEffects' | 'onAddPreset'> & {
  selection: Selection;
  others: readonly { id: string; name: string }[];
  /** The package has Film Look, so it holds the checked effects. */
  filmLook: boolean;
  onSelectionChange: (selection: ReadonlySet<string>) => void;
}) {
  const catalog = use(loadCatalog(PREVIEW_TARGET));
  const all = [...catalog.effects, ...others];
  const checked = resolveSelection(
    selection,
    catalog.effects.map((effect) => effect.id),
    others.map((effect) => effect.id),
  );
  const effectNames = new Map(all.map((effect) => [effectCode(effect.id), effect.name]));
  const packageEffects = new Set(
    filmLook ? all.filter((effect) => checked.has(effect.id)).map((effect) => effectCode(effect.id)) : [],
  );
  function addPreset(recipe: Recipe, effect: string | null) {
    rest.onChange(withPreset(rest.library, recipe));
    if (filmLook && effect && !checked.has(effect) && checked.size < MAX_EFFECTS) {
      onSelectionChange(new Set([...checked, effect]));
    }
  }
  return <RecipesPanel {...rest} effectNames={effectNames} packageEffects={packageEffects} onAddPreset={addPreset} />;
}

/** The name of a step of the install, as the step indicator and the Next button show it. */
function stepName(step: InstallStep, t: Strings): string {
  switch (step) {
    case 'install':
      return t.effects;
    case 'camera':
      return t.camera;
    case 'modules':
      return t.site.extras;
    case 'write':
      return t.install;
  }
}

/**
 * The steps of the install at the top of each step: the steps up to the furthest one reached are
 * links, the current one is marked, and the later ones wait.
 */
function StepIndicator({
  strings: t,
  page,
  furthest,
  link,
}: {
  strings: Strings;
  page: InstallStep;
  furthest: InstallStep;
  link: PageLink;
}) {
  const reached = INSTALL_STEPS.indexOf(furthest);
  return (
    <nav aria-label={t.site.stepsLabel} className="-mx-gutter overflow-x-auto px-gutter pt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ol className="flex min-w-max items-center gap-2 text-sm">
        {INSTALL_STEPS.map((step, index) => {
          const current = step === page;
          const open = !current && index <= Math.max(reached, INSTALL_STEPS.indexOf(page));
          const body = (
            <>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums',
                  current ? 'border-foreground bg-foreground text-background' : 'border-border',
                )}
              >
                {index + 1}
              </span>
              {/* On a phone only the current step shows its name, so the four steps fit. */}
              <span className={cn(!current && 'max-sm:sr-only')}>{stepName(step, t)}</span>
            </>
          );
          return (
            <li key={step} className="flex items-center gap-2">
              {index > 0 && <span className="h-px w-4 bg-border sm:w-8" aria-hidden="true" />}
              {open ? (
                <a
                  {...link(step)}
                  className="flex h-9 items-center gap-2 rounded-md px-2 text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground"
                >
                  {body}
                </a>
              ) : (
                <span
                  className={cn('flex h-9 items-center gap-2 px-2', current ? 'font-medium text-foreground' : 'text-muted-foreground')}
                  aria-current={current ? 'step' : undefined}
                >
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * The bar at the bottom of each step: Back, the count of the looks on the first step, and Next
 * with the name of the next step. A step that is not complete says why next to a disabled Next.
 */
function StepBar({
  strings: t,
  page,
  link,
  count,
  blocked,
}: {
  strings: Strings;
  page: InstallStep;
  link: PageLink;
  /** The looks on the card, on the first step; null while the catalog loads. */
  count?: number | null;
  /** Why the visitor cannot go on yet, or null. */
  blocked: string | null;
}) {
  const index = INSTALL_STEPS.indexOf(page);
  const previous = INSTALL_STEPS[index - 1];
  const next = INSTALL_STEPS[index + 1];
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-3 px-gutter py-2.5">
        {previous ? (
          <Button asChild variant="ghost" className="h-10 shrink-0 px-3">
            <a {...link(previous)}>
              <ArrowLeft aria-hidden="true" />
              {t.site.back}
            </a>
          </Button>
        ) : (
          <span />
        )}
        <div className="flex min-w-0 items-center justify-end gap-3">
          {blocked ? (
            <p className="min-w-0 text-right text-[13px] leading-snug text-muted-foreground" role="status">
              {blocked}
            </p>
          ) : (
            count !== undefined && (
              <p className="hidden min-w-0 truncate text-sm text-muted-foreground tabular-nums sm:block">
                {count === null ? t.loading : t.slotsUsed(count, MAX_EFFECTS)}
              </p>
            )
          )}
          {next &&
            (blocked ? (
              <Button size="lg" className="h-10 shrink-0 px-4" disabled>
                {t.site.nextStep(stepName(next, t))}
                <ArrowRight aria-hidden="true" />
              </Button>
            ) : (
              <Button asChild size="lg" className="h-10 shrink-0 px-4">
                <a {...link(next)}>
                  {t.site.nextStep(stepName(next, t))}
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}

/** What the card will get, on the last step, with a link back to the step of each line. */
function WriteSummary({
  strings: t,
  link,
  looks,
  camera,
  firmware,
  modules,
  shutdown,
}: {
  strings: Strings;
  link: PageLink;
  /** The looks on the card; null while the catalog loads. */
  looks: number | null;
  camera: string;
  firmware: string;
  modules: readonly string[];
  /** The name of the picture of Shutdown Screen. */
  shutdown: string;
}) {
  const rows: [InstallStep, string, string][] = [
    ['install', t.effects, looks === null ? '…' : t.slotsUsed(looks, MAX_EFFECTS)],
    ['camera', t.camera, `${camera} · ${t.firmware} ${firmware}`],
    ['modules', t.site.extras, modules.length > 0 ? modules.join(t.listSeparator) : '—'],
    ['modules', t.shutdown.title, shutdown],
  ];
  return (
    <section aria-labelledby="summary-title" className="mb-8 rounded-2xl border bg-card px-5 py-4">
      <h2 id="summary-title" className="text-base font-semibold">
        {t.site.summaryTitle}
      </h2>
      <dl className="mt-2 divide-y divide-border">
        {rows.map(([step, label, value]) => (
          <div key={label} className="flex items-baseline gap-4 py-3 text-sm">
            {/* On a phone the label sits over the value; from the tablet up, beside it. */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:grid sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="min-w-0">{value}</dd>
            </div>
            <dd className="shrink-0">
              <a {...link(step)} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" aria-label={`${t.site.change}: ${label}`}>
                {t.site.change}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
