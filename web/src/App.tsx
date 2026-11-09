import { Suspense, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { DIAL_SAVED, effectCode, familyOf, withPreset, writeRecipeFile, type Family, type Recipe } from './recipes';
import { RecipesPanel } from './components/RecipesPanel';
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
import { loadCatalog, MAX_EFFECTS, type Catalog, type CardEffect, type ImportedEffect, type PackageEffect } from './catalog';
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
import { AppPromo } from './components/AppPromo';
import { ChoiceCard } from './components/ChoiceCard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Faq } from './components/Faq';
import { Masthead } from './components/Masthead';
import { ModulesStep } from './components/ModulesStep';
import { PackageOpen, type PackageStatus } from './components/PackageOpen';
import { PlusSheet } from './components/PlusSheet';
import { DOC_PATHS, LANGUAGE_PATHS } from './languagePage';
import { RichText } from './components/RichText';
import { SiteFooter } from './components/SiteFooter';
import { Step } from './components/Step';
import { TermsNote } from './components/TermsNote';
import { Workbench } from './components/Workbench';
import { guideUrl, REPOSITORY } from './links';
import { loadFonts } from './fonts';
import { encodeLibrary, IMPORTS_FILE, nativeTone, readLibrary, withDetails, type LibraryDetails } from './import/library';
import { restoreImports } from './import/lut';
import { importsForCamera, NATIVE_LOOKS } from './import/native';
import { isLutImportId } from './import/names';
import { deleteImport, saveImport, updateImport } from './import/store';
import { applyLanguage, STRINGS, type Language, type Strings } from './i18n';
import { DEFAULT_ENABLED, MODULES, MODULES_MAX, planModules, type ModuleKey } from './modules';
import {
  buildCardFiles,
  buildPackage,
  buildScriptsOff,
  effectLabel,
  prefetchPackage,
  packageFilename,
  save,
  scriptsOffCardFiles,
} from './package';
import { packageCard } from './packageCard';
import { fetchEntitlement, forgetKey, FREE, loadKey, packCounts, PlusError, saveKey, takeKeyFromHash, takeOrderFromHash, type Entitlement } from './plus';
import { loadSelection, resolveSelection, saveSelection, type Selection } from './selection';
import { TransferError } from './transfer';
import { useCatalog } from './useCatalog';

/** The Tally form for problems, feature ideas, and questions. A plain link, so the page loads nothing from Tally. */
const FEEDBACK_FORM = `${REPOSITORY}/issues`;
/** The release notes of the GRKU version that the site packages, on the releases page. */
const RELEASE_URL = `${REPOSITORY}/releases#release-v${__GRKU_VERSION__}`;

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
  initialImports = [],
  initialCard = null,
}: {
  /** The language of the page address. */
  initialLanguage: Language;
  initialImports?: readonly ImportedEffect[];
  /** The card connected on an earlier visit, which a click reconnects. */
  initialCard?: CardDirectory | null;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [cameraKey, setCameraKey] = useState(CAMERAS[0]!.key);
  // The ZIP download has no card to read the effects from, so the choice of the last visit
  // comes back.
  const [selection, setSelection] = useState<Selection>(() => loadSelection(browserStorage()));
  const [enabled, setEnabled] = useState<ReadonlySet<ModuleKey>>(DEFAULT_ENABLED);
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

  function chooseLanguage(next: Language) {
    loadFonts(next);
    applyLanguage(next);
    setLanguage(next);
  }

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
  function cardChanges(session: CardSession, checked: readonly string[]): CardChanges {
    const changes = planChanges(
      session.state,
      __GRKU_VERSION__,
      plan.modules,
      plan.includeEffects
        ? { before: [...session.effects.keys()], after: checked, changed: [...changedImports(session, imported)] }
        : null,
      recipeLibrary.cardChange(session),
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
      const files = await buildCardFiles(targets, camera.id, effects, plan.modules, language, imports, (received) => {
        if (run === cardRun.current) setCardTask({ kind: 'preparing', received });
      });
      const changes = cardChanges(
        session,
        checked.map((effect) => effect.id),
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
        const text = await writeRecipeFile(
          recipeLibrary.packageRecipes,
          family,
          session.state.recipeText ?? '',
          recipeLibrary.dial(session),
        );
        files.push({ path: RECIPE_FILE, bytes: new TextEncoder().encode(text) });
        library.remove.push(RECIPES_PACKAGE);
      }
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
        // that were off, then GRK in ADJ.
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
          <a href={FEEDBACK_FORM}>{t.feedback}</a>
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

  const zipFlow = (
    <div className="flex flex-col gap-6">
      {packageOpen}
      <dl className={FACTS}>
        <dt className={FACT_LABEL}>{t.camera}</dt>
        <dd className={FACT_VALUE}>{camera.name}</dd>
        <dt className={FACT_LABEL}>{t.firmware}</dt>
        <dd className={FACT_VALUE}>{support?.firmware ?? '—'}</dd>
        <dt className={FACT_LABEL}>{t.effectCount}</dt>
        <dd className={FACT_VALUE}>{effectCount ?? '—'}</dd>
        <dt className={FACT_LABEL}>{t.modules}</dt>
        <dd className={FACT_VALUE}>{moduleNames.length > 0 ? moduleNames.join(t.listSeparator) : '—'}</dd>
      </dl>
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

  return (
    <>
      {(appBrowser || cardHintKind) && (
        <div className="bg-foreground px-gutter py-2.5 text-center text-[13px] leading-snug text-balance text-background" role="note">
          {appBrowser ? t.appBrowser : cardHintKind === 'computer' ? t.cardComputer : t.cardBrowser}
        </div>
      )}
      <Masthead strings={t} language={language} onLanguage={chooseLanguage} version={__GRKU_VERSION__} releaseUrl={RELEASE_URL} />
      <main id="top" className="mx-auto w-full max-w-[1280px] px-gutter pb-8">
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
          canWrite={canWrite}
          owned={owned}
          onPlus={() => setPlusOpen(true)}
          notice={!available.includes('filmLook') ? t.effectsUnavailable(camera.name) : !plan.includeEffects ? t.effectsOff : null}
        />

        <Step id="modules" number={t.step(2)} title={t.modules} description={t.landing.moduleListText} ref={prefetchInView} className="mt-14">
          <ModulesStep
            strings={t}
            modules={offered}
            enabled={enabled}
            onToggle={toggleModule}
            installed={active && active.state.install !== 'none' ? cardModules(active.state) : null}
            planned={plan.modules}
            emptyLooks={enabled.has('filmLook') && selection?.size === 0}
            lookCount={effectCount ?? '…'}
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
                      dial={
                        // A card shows and writes its own dial; a ZIP package carries the choice
                        // of this browser.
                        !recipeLibrary.packageRecipes
                          ? null
                          : mode === 'zip'
                            ? { shown: recipeLibrary.zipDial, canKeep: true, onChange: recipeLibrary.changeZipDial }
                            : active
                              ? {
                                  shown: recipeLibrary.shownDial(active),
                                  canKeep: false,
                                  // The settings that the camera saved in a user mode stay a
                                  // choice while the person tries another value.
                                  saved: active.dial.map((value) => value === DIAL_SAVED),
                                  onChange: (u: number, value: number | null) => {
                                    if (value !== null) recipeLibrary.changeDial(active, u, value);
                                  },
                                }
                              : null
                      }
                    />
                  </Suspense>
                </ErrorBoundary>
              ) : null
            }
          />
        </Step>

        <Step id="camera" number={t.step(3)} title={t.camera} description={cardCamera ? undefined : t.firmwareNote}>
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
            <RadioGroup
              name="camera"
              value={camera.key}
              aria-labelledby="camera-title"
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              onValueChange={(next) => chooseCamera(next as Camera['key'])}
            >
              {CAMERAS.map((item) => (
                <ChoiceCard
                  key={item.key}
                  htmlFor={`camera-${item.key}`}
                  control={
                    <RadioGroupItem
                      id={`camera-${item.key}`}
                      value={item.key}
                      className="mt-1"
                      disabled={!item.support || (!!lockedCameras && !lockedCameras.includes(item))}
                    />
                  }
                >
                  <span className="font-semibold">{item.name}</span>
                  {item.support && (
                    <span className="text-sm text-muted-foreground">
                      {t.firmware} {item.support.firmware}
                    </span>
                  )}
                  {!item.support && (
                    <Badge variant="outline" className="w-fit">
                      {t.planned}
                    </Badge>
                  )}
                  {item.support?.noEffects && <span className="text-sm text-muted-foreground">{t.noEffects}</span>}
                </ChoiceCard>
              ))}
            </RadioGroup>
          )}
        </Step>

        <Step id="install" number={t.step(4)} title={t.install} description={canWrite ? t.landing.installNote : t.landing.installNoteZip}>
          <Alert className="mb-8 border-2 border-destructive bg-destructive/15 px-5 py-5 shadow-[inset_6px_0_0_0_var(--destructive)] sm:px-6 has-[>svg]:grid-cols-[calc(var(--spacing)*7)_1fr] has-[>svg]:gap-x-4 [&>svg]:size-7 [&>svg]:translate-y-0">
            <TriangleAlert className="text-destructive" strokeWidth={2.5} aria-hidden="true" />
            <AlertTitle className="text-xl font-bold tracking-tight text-destructive sm:text-2xl">{t.riskTitle}</AlertTitle>
            <AlertDescription className="mt-1 max-w-[80ch] text-base leading-relaxed text-foreground">{t.riskText}</AlertDescription>
          </Alert>
          <dl className="mb-8 grid gap-5 sm:grid-cols-3">
            {t.landing.facts.map(([title, text]) => (
              <div key={title} className="flex flex-col gap-1 border-l-2 border-brand/70 pl-4">
                <dt className="font-medium">{title}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
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
        </Step>

        <Faq strings={t} />
      </main>
      <SiteFooter strings={t} language={language} version={__GRKU_VERSION__} releaseUrl={RELEASE_URL} />
      <PlusSheet
        open={plusOpen}
        onOpenChange={setPlusOpen}
        strings={t}
        owned={owned}
        hasKey={!!plusKey}
        onKey={adoptKey}
        onForget={dropKey}
        packCounts={previewCatalog ? packCounts(previewCatalog.effects) : null}
        payOrder={payOrder}
        termsHref={`${LANGUAGE_PATHS[language]}${DOC_PATHS.TERMS}`}
        language={language}
        onBrowse={() => document.getElementById('looks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />
      <AppPromo strings={t} />
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
  session: CardSession;
  selection: Selection;
  imported: readonly ImportedEffect[];
  cardEffects: readonly CardEffect[];
  changes: (session: CardSession, checked: readonly string[]) => CardChanges;
  modules: readonly string[];
  recipes: { label: string; text: string } | null;
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
function CardChangesSection({ strings: t, session, selection, imported, cardEffects, changes, ...rest }: ChangesSectionProps) {
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
      releaseUrl={RELEASE_URL}
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
}: Omit<Parameters<typeof RecipesPanel>[0], 'effectNames' | 'packageEffects' | 'onAddPreset'> & {
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
