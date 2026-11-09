import { Suspense, use, useCallback, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  removeGrkit,
  removeModesetFiles,
  writeFiles,
  type CardChanges,
  type CardDirectory,
} from './card';
import { allowCard, forgetLastCard, saveLastCard } from './cardStore';
import {
  changedImports,
  extraCardEffects,
  libraryChanges,
  openSession,
  packageEffects as cardPackageEffects,
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
import { loadCatalog, siteUrl, type Catalog, type CardEffect, type ImportedEffect, type PackageEffect } from './catalog';
import {
  CardChangesView,
  CardUninstall,
  FACT_LABEL,
  FACT_VALUE,
  FACTS,
  StartSection,
  UninstallSection,
  type CardMessage,
  type CardTask,
  type InstallMode,
} from './components/CardPanel';
import { AppPromo } from './components/AppPromo';
import { ChoiceCard } from './components/ChoiceCard';
import { ChangeBadge, EffectsSection } from './components/EffectsSection';
import { PackageOpen, type PackageStatus } from './components/PackageOpen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Landing } from './components/Landing';
import { RichText } from './components/RichText';
import { Section } from './components/Section';
import { TermsNote } from './components/TermsNote';
import { guideUrl, REPOSITORY, UPSTREAM } from './links';
import { loadFonts } from './fonts';
import { encodeLibrary, IMPORTS_FILE, nativeTone, readLibrary, withDetails, type LibraryDetails } from './import/library';
import { restoreImports } from './import/lut';
import { importsForCamera, NATIVE_LOOKS } from './import/native';
import { isLutImportId } from './import/names';
import { deleteImport, saveImport, updateImport } from './import/store';
import { applyLanguage, LANGUAGES, sentences, STRINGS, type Language, type Strings } from './i18n';
import { ALL_MODULES, MODULES, planModules, type ModuleKey } from './modules';
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
import { loadSelection, resolveSelection, saveSelection, type Selection } from './selection';
import { TransferError } from './transfer';

/** The Tally form for problems, feature ideas, and questions. A plain link, so the page loads nothing from Tally. */
const FEEDBACK_FORM = `${REPOSITORY}/issues`;
/** The release notes of the GRKU version that the site packages, on the releases page. */
const RELEASE_URL = `${REPOSITORY}/releases#release-v${__GRKIT_VERSION__}`;

/** The content of the desk is as wide as the page above it: the page width less its gutters. */
const DESK_INNER = 'mx-auto w-full max-w-[calc(1280px_-_2_*_var(--gutter))]';
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
  const [enabled, setEnabled] = useState<ReadonlySet<ModuleKey>>(ALL_MODULES);
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
    const session = await openSession(root, [...catalog.effects, ...imported]);
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
      adoptCard(session);
      const added = await adoptImports(root, session, file.name, catalog);
      resetBuild();
      setPackageStatus({ state: 'done', added: added.length, locked: lockedLooks(session, added) });
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
      const session = await openSession(root, [...catalog.effects, ...imported]);
      if (run !== cardRun.current) return;
      const fit = adoptCard(session);
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
      const next = await openSession(session.root, [...catalog.effects, ...imported]);
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
        await removeGrkit(session.root, data);
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
      __GRKIT_VERSION__,
      plan.modules,
      plan.includeEffects
        ? { before: [...session.effects.keys()], after: checked, changed: [...changedImports(session, imported)] }
        : null,
    );
    return session.written && changes.grkit === 'update' ? { ...changes, grkit: 'same' } : changes;
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
      await applyChanges(session.root, session.state, files, library, ({ written, total }) => {
        if (run !== cardRun.current) return;
        setCardTask(written < total ? { kind: 'writing', written, total } : { kind: 'finishing' });
      });
      const catalog = await loadCatalog(PREVIEW_TARGET);
      const next = await openSession(session.root, [...catalog.effects, ...imported]);
      if (run !== cardRun.current) return;
      setCard({ ...next, written: true });
      setApplyMessage({
        tone: 'ok',
        // The camera steps after the write: the MENU step for a first install and for SD scripts
        // that were off, then GRK in ADJ.
        lines: [
          t.cardDone,
          t.cardStepInsert,
          ...(changes.grkit === 'install' ? [t.cardDoneFirst] : changes.scriptsOn ? [t.cardEnable] : []),
          t.steps[3]!.join(''),
        ],
      });
      trackCardWrite(
        camera,
        plan,
        plan.includeEffects ? checked.length : 0,
        language,
        changes.grkit === 'same' ? 'change' : changes.grkit,
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
      );
      if (run === buildRun.current) {
        save(blob, packageFilename(__GRKIT_VERSION__, camera.name, new Date()));
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

  const packageLinks = (
    <ul className="flex flex-wrap gap-2">
      <li>
        <Button asChild variant="outline">
          <a href={FEEDBACK_FORM}>{t.feedback}</a>
        </Button>
      </li>
    </ul>
  );

  const languageLabel = LANGUAGES.find((item) => item.code === language)?.label ?? language;

  return (
    <>
      {(appBrowser || cardHintKind) && (
        <div
          className="browser-banner bg-[var(--ink)] px-[var(--gutter)] py-3 text-center text-sm leading-normal text-[var(--paper)] text-balance"
          role="note"
        >
          {appBrowser ? t.appBrowser : cardHintKind === 'computer' ? t.cardComputer : t.cardBrowser}
        </div>
      )}
      <div className="page">
        <header className="masthead pb-10">
          {/* One row: the name on the left, the links and the language on the right. */}
          <div className="masthead-top flex items-center justify-between gap-4">
            <div className="masthead-title flex items-start gap-1.5">
              <h1 className="m-0 text-[28px] leading-none font-extrabold tracking-tight">
                GRKU<span className="dot">.</span>
              </h1>
              <a
                className="masthead-version border border-[var(--line-2)] px-1.5 py-px font-mono text-[11px] no-underline"
                href={RELEASE_URL}
              >
                v{__GRKIT_VERSION__}
              </a>
            </div>
            <div className="languages flex items-center justify-end gap-3">
              <nav className="masthead-nav hidden gap-6 text-[15px] md:flex" aria-label="GRKU">
                <a href="#effects-label">{t.effects}</a>
                <a href="#modules-label">{t.modules}</a>
                <a href="#faq-label">{t.faqTitle}</a>
              </nav>
              <a
                className="github inline-flex size-11 items-center justify-center"
                href={REPOSITORY}
                aria-label="GitHub"
                title="GitHub"
              >
                <svg viewBox="0 0 16 16" width="22" height="22" aria-hidden="true" focusable="false">
                  <path
                    fill="currentColor"
                    d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
                  />
                </svg>
              </a>
              <Select value={language} onValueChange={(next) => chooseLanguage(next as Language)}>
                <SelectTrigger size="sm" aria-label={t.language}>
                  <SelectValue>{languageLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {LANGUAGES.map((item) => (
                    <SelectItem key={item.code} value={item.code} lang={item.code}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <Landing strings={t} language={language} canWrite={canWriteCards()} />

        <main>
          <div className={DESK_INNER}>
            {canWriteCards() && (
              <StartSection
                strings={t}
                mode={mode}
                onMode={chooseMode}
                session={card}
                cardCamera={cardCamera}
                onCamera={(next) => chooseCamera(next.key)}
                otherCamera={
                  !!card && !!support && cardBuilds(card.state).some((build) => !support.targets.includes(build))
                }
                busy={cardTask.kind !== 'idle'}
                reading={cardTask.kind === 'reading'}
                message={connectMessage}
                lastCard={lastCard?.name ?? null}
                onConnect={connectCard}
                onReconnect={reconnectCard}
                onDisconnect={disconnectCard}
                zip={packageOpen}
                next={
                  card && (
                    <ErrorBoundary resetKey={String(catalogAttempt)} fallback={null}>
                      <Suspense fallback={null}>
                        <CardNext
                          strings={t}
                          session={card}
                          selection={selection}
                          imported={imported}
                          cardEffects={cardExtra}
                          changes={cardChanges}
                        />
                      </Suspense>
                    </ErrorBoundary>
                  )
                }
              />
            )}

            {!cardCamera && (
              <Section id="camera-label" title={t.camera}>
                {/* Without the mode section, the ZIP is the only mode, and this is the first section. */}
                {!canWriteCards() && packageOpen}
                <RadioGroup
                  name="camera"
                  value={camera.key}
                  aria-labelledby="camera-label"
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
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
                      {/* A badge marks only a camera that GRKU does not support yet. */}
                      {!item.support && (
                        <Badge variant="outline" className="w-fit">
                          {t.planned}
                        </Badge>
                      )}
                      {item.support?.noEffects && <span className="text-sm text-muted-foreground">{t.noEffects}</span>}
                    </ChoiceCard>
                  ))}
                </RadioGroup>
                <p className={NOTE}>{t.firmwareNote}</p>
              </Section>
            )}

            <Section id="modules-label" title={t.modules}>
              <p className={NOTE}>{t.modulesNote}</p>
              <div role="group" aria-labelledby="modules-label" className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {MODULES.filter((module) => available.includes(module.key)).map((module) => (
                  <ChoiceCard
                    key={module.key}
                    htmlFor={`module-${module.key}`}
                    control={
                      <Checkbox
                        id={`module-${module.key}`}
                        className="mt-1"
                        checked={enabled.has(module.key)}
                        onCheckedChange={() => toggleModule(module.key)}
                      />
                    }
                  >
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {t.moduleNames[module.key]}
                      {active && active.state.install !== 'none' && (
                        <ChangeBadge
                          on={cardModules(active.state).includes(module.id)}
                          checked={plan.modules.includes(module.id)}
                          strings={t}
                        />
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">{t.modulesText[module.key]}</span>
                    {module.key === 'filmLook' && enabled.has('filmLook') && selection?.size === 0 && (
                      <span className="text-sm text-destructive">{t.filmLookEmpty}</span>
                    )}
                  </ChoiceCard>
                ))}
              </div>
            </Section>

            <Section id="effects-label" title={t.effects} ref={prefetchInView}>
              {!available.includes('filmLook') ? (
                <p className={STATUS}>{t.effectsUnavailable(camera.name)}</p>
              ) : plan.includeEffects ? (
                <ErrorBoundary
                  resetKey={String(catalogAttempt)}
                  fallback={
                    <div className="flex flex-col items-start gap-3">
                      <p className={ERROR}>{t.loadError}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCatalogAttempt((attempt) => attempt + 1)}
                      >
                        {t.retryLoad}
                      </Button>
                    </div>
                  }
                >
                  <Suspense fallback={<p className={STATUS}>{t.loading}</p>}>
                    <EffectsSection
                      strings={t}
                      language={language}
                      selection={selection}
                      onSelectionChange={changeSelection}
                      imported={imported}
                      onImport={addImported}
                      onRemove={removeImported}
                      onEdit={editImported}
                      // GRKU never asks for a firmware file, so the GR IV looks that need one are not offered.
                      nativeLooks={false}
                      cardEffects={active ? cardExtra : []}
                      onCard={active && active.state.install !== 'none' ? new Set(active.effects.keys()) : null}
                      changedOnCard={active ? changedImports(active, imported) : undefined}
                    />
                  </Suspense>
                </ErrorBoundary>
              ) : (
                <p className={STATUS}>{t.effectsOff}</p>
              )}
            </Section>

            <Section id="package-label" title={mode === 'card' ? t.install : t.package}>
              {mode === 'card' && !card ? (
                <div className="flex flex-col items-start gap-3">
                  <Button
                    type="button"
                    variant="brand"
                    size="lg"
                    disabled={cardTask.kind !== 'idle'}
                    onClick={lastCard ? reconnectCard : connectCard}
                  >
                    {lastCard ? t.cardReconnect(lastCard.name) : t.cardConnect}
                  </Button>
                  <p className={NOTE}>{t.cardConnectNext}</p>
                </div>
              ) : mode === 'card' && card ? (
                <>
                  <ErrorBoundary resetKey={String(catalogAttempt)} fallback={<p className={ERROR}>{t.loadError}</p>}>
                    <Suspense fallback={<p className={STATUS}>{t.loading}</p>}>
                      <CardChangesSection
                        strings={t}
                        session={card}
                        selection={selection}
                        imported={imported}
                        cardEffects={cardExtra}
                        changes={cardChanges}
                        modules={MODULES.filter((module) => plan.visible.includes(module.key)).map(
                          (module) => t.moduleNames[module.key],
                        )}
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
                  {plan.visible.length === 0 && <p className={ERROR}>{t.noModules}</p>}
                </>
              ) : (
                <>
                  <dl className={FACTS}>
                    <dt className={FACT_LABEL}>{t.camera}</dt>
                    <dd className={FACT_VALUE}>{camera.name}</dd>
                    <dt className={FACT_LABEL}>{t.firmware}</dt>
                    <dd className={FACT_VALUE}>{support?.firmware ?? '—'}</dd>
                    <dt className={FACT_LABEL}>{t.effectCount}</dt>
                    <dd className={FACT_VALUE}>
                      {plan.includeEffects ? (
                        <ErrorBoundary resetKey={String(catalogAttempt)} fallback="—">
                          <Suspense fallback="—">
                            <CheckedCount
                              selection={selection}
                              others={[...imported, ...(active ? cardExtra : [])].map((effect) => effect.id)}
                            />
                          </Suspense>
                        </ErrorBoundary>
                      ) : (
                        0
                      )}
                    </dd>
                    <dt className={FACT_LABEL}>{t.modules}</dt>
                    <dd className={FACT_VALUE}>
                      {plan.visible.length > 0
                        ? MODULES.filter((module) => plan.visible.includes(module.key))
                            .map((module) => t.moduleNames[module.key])
                            .join(t.listSeparator)
                        : '—'}
                    </dd>
                  </dl>
                  <div className="flex flex-col items-start gap-3">
                    <Button
                      type="button"
                      variant="brand"
                      size="lg"
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
                          {build.retrying
                            ? t.retrying
                            : build.received > 0
                              ? t.downloading(megabytes(build.received))
                              : t.building}
                        </p>
                      )}
                      {build.state === 'ready' && <p className={STATUS}>{t.ready}</p>}
                      {build.state === 'failed' && <p className={ERROR}>{t.buildError}</p>}
                    </div>
                    {build.state === 'ready' && packageLinks}
                  </div>
                </>
              )}
            </Section>

            {mode === 'zip' && (
              <Section id="install-label" title={t.install}>
                <ol className={STEPS}>
                  {t.steps.map((parts, index) => (
                    <li key={index}>
                      <RichText
                        parts={parts.map((part) =>
                          part === MODESET_TOKEN ? `\`${support?.modeset ?? ''}` : part,
                        )}
                      />
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {showUninstall && (
              <UninstallSection title={t.remove}>
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
              </UninstallSection>
            )}

            {mode === 'zip' && (
              <Section id="update-label" title={t.update}>
                <ol className={STEPS}>
                  {t.updateSteps.map((parts, index) => (
                    <li key={index}>
                      <RichText parts={parts} />
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {mode === 'zip' && (
              <Section id="remove-label" title={t.remove}>
                <ol className={STEPS}>
                  {t.removeSteps.map((parts, index) => (
                    <li key={index}>
                      <RichText
                        parts={parts.map((part) =>
                          part === MODESET_TOKEN ? `\`${support?.modeset ?? ''}` : part,
                        )}
                      />
                    </li>
                  ))}
                </ol>
                <div className="flex flex-col items-start gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={!support || scriptsOff === 'building'}
                    aria-busy={scriptsOff === 'building'}
                    onClick={downloadScriptsOff}
                  >
                    {t.scriptsOff(camera.name)}
                  </Button>
                  <div aria-live="polite">
                    {scriptsOff === 'failed' && <p className={ERROR}>{t.scriptsOffError}</p>}
                  </div>
                </div>
              </Section>
            )}

            <Section id="faq-label" title={t.faqTitle}>
              <div className="flex max-w-[760px] flex-col">
                {t.faq.map((item) => (
                  <details key={item.q} className="group border-b border-border">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 font-semibold leading-normal [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <Plus className="size-4 shrink-0 text-muted-foreground group-open:hidden" aria-hidden="true" />
                      <Minus className="hidden size-4 shrink-0 text-muted-foreground group-open:block" aria-hidden="true" />
                    </summary>
                    <p className="pb-4 text-[15px] leading-relaxed">
                      <RichText parts={item.a} link="" />
                    </p>
                  </details>
                ))}
              </div>
            </Section>
          </div>
        </main>

        <footer className="footer">
          <div className={`${DESK_INNER} flex flex-col gap-6 text-sm text-muted-foreground`}>
            <div className="grid gap-4 sm:grid-cols-3">
              <ul className="flex flex-col gap-2">
                <li>
                  <a className="hover:text-foreground hover:underline underline-offset-4" href={guideUrl('RECOVERY', language)}>
                    {t.recovery}
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground hover:underline underline-offset-4" href={guideUrl('DUMP', language)}>
                    {t.firmwareDump}
                  </a>
                </li>
              </ul>
              <ul className="flex flex-col gap-2">
                <li>
                  <a className="hover:text-foreground hover:underline underline-offset-4" href={FEEDBACK_FORM}>
                    {t.feedback}
                  </a>
                </li>
              </ul>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    className="hover:text-foreground hover:underline underline-offset-4"
                    href={`${REPOSITORY}/blob/main/effects/NOTICE.md`}
                  >
                    {t.licenses}
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-foreground hover:underline underline-offset-4"
                    href={siteUrl('THIRD_PARTY_LICENSES.txt')}
                  >
                    {t.thirdParty}
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground hover:underline underline-offset-4" href={guideUrl('TERMS', language)}>
                    {t.terms}
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2 border-t border-border pt-4 text-[13px]">
              <p>{t.trademarks}</p>
              <p>
                <b className="font-semibold text-foreground">GRKU {t.landing.edition}</b> — {t.landing.fork[0]}
                <a className="underline underline-offset-4 hover:text-foreground" href={UPSTREAM}>
                  {t.landing.fork[1]}
                </a>
                {t.landing.fork[2]}
              </p>
              <a className="w-fit hover:text-foreground hover:underline underline-offset-4" href={RELEASE_URL}>
                GRKU {__GRKIT_VERSION__}
              </a>
            </div>
          </div>
        </footer>
      </div>
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

const MODE_KEY = 'grkit.installMode';

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

/**
 * The next step after a card connects: what a write would do, with a link down to the changes
 * and the write button, so a returning user does not scroll past every section to find them.
 */
function CardNext({
  strings: t,
  session,
  selection,
  imported,
  cardEffects,
  changes,
}: Pick<ChangesSectionProps, 'strings' | 'session' | 'selection' | 'imported' | 'cardEffects' | 'changes'>) {
  const { checked } = useChecked(selection, [...imported, ...cardEffects]);
  const next = changes(session, [...checked]);
  const count =
    next.addModules.length +
    next.removeModules.length +
    next.addEffects.length +
    next.removeEffects.length +
    next.updateEffects.length +
    (next.scriptsOn ? 1 : 0) +
    (next.cleanLegacy ? 1 : 0);
  const lines =
    next.grkit === 'install'
      ? [t.cardNextInstall(__GRKIT_VERSION__)]
      : [
          ...(next.grkit === 'update' ? [t.cardNextUpdate(__GRKIT_VERSION__)] : []),
          ...(count > 0 ? [t.cardNextChanges(count)] : []),
        ];
  if (lines.length === 0) return <p className={STATUS}>{t.cardNextNone}</p>;
  return (
    <p className={STATUS}>
      {sentences(...lines)}{' '}
      <a href="#package-label" className="text-foreground underline underline-offset-4 hover:text-brand">
        {t.cardNextReview}
      </a>
    </p>
  );
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
      version={__GRKIT_VERSION__}
      releaseUrl={RELEASE_URL}
      effectCount={checked.size}
      moduleName={moduleName}
      effectName={effectName}
      {...rest}
    />
  );
}

/** The number of checked effects. Before the first change, it needs the catalog. */
function CheckedCount({ selection, others }: { selection: Selection; others: readonly string[] }) {
  const catalog = use(loadCatalog(PREVIEW_TARGET));
  return resolveSelection(
    selection,
    catalog.effects.map((effect) => effect.id),
    others,
  ).size;
}
