import { useId, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cardStarted, cardVersion, hasChanges, type CardChanges } from '../card';
import type { CardSession } from '../cardSession';
import type { Camera } from '../cameras';
import { sentences, type Strings } from '../i18n';
import { ChoiceCard } from './ChoiceCard';
import { Section } from './Section';
import { TermsNote } from './TermsNote';

/** What the card panels are doing. Each task disables the card buttons until it ends. */
export type CardTask =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'preparing'; received: number }
  | { kind: 'writing'; written: number; total: number }
  | { kind: 'finishing' };

export type CardMessage = { tone: 'ok' | 'error'; lines: readonly string[] } | null;

const megabytes = (bytes: number) => (bytes / 1_000_000).toFixed(1);

/** A list of facts: the labels in a column, the values beside them. */
export const FACTS = 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm';
export const FACT_LABEL = 'text-muted-foreground';
export const FACT_VALUE = 'min-w-0 font-medium';
/** A note under a control. */
const NOTE = 'max-w-[72ch] text-sm text-muted-foreground';
const WARNING = 'max-w-[72ch] text-sm text-destructive';

function taskText(task: CardTask, t: Strings): string | null {
  switch (task.kind) {
    case 'reading':
      return t.cardReading;
    case 'preparing':
      return task.received > 0 ? t.cardDownloading(megabytes(task.received)) : t.cardPreparing;
    case 'writing':
      return t.cardWriting(Math.min(task.written + 1, Math.max(task.total, 1)), task.total);
    case 'finishing':
      return t.cardFinishing;
    default:
      return null;
  }
}

function Status({ task, message, strings: t }: { task: CardTask; message: CardMessage; strings: Strings }) {
  const text = taskText(task, t);
  return (
    <div aria-live="polite" className="flex flex-col gap-1 text-sm">
      {text && <p className="text-muted-foreground">{text}</p>}
      {message?.lines.map((line) => (
        <p key={line} className={message.tone === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
          {line}
        </p>
      ))}
    </div>
  );
}

/** How the user installs GRKU: write to a connected card, or download GRKU.zip. */
export type InstallMode = 'card' | 'zip';

interface StartProps {
  strings: Strings;
  mode: InstallMode;
  onMode: (mode: InstallMode) => void;
  session: CardSession | null;
  /** The card's GRKU is for another camera than the selected one. */
  otherCamera: boolean;
  /**
   * The camera of the card's GRKU, which the page then shows here instead of the camera section.
   * `options` has two entries when one build runs on both, such as GR IV and GR IV Monochrome.
   */
  cardCamera: { options: readonly Camera[]; selected: Camera; firmware: string } | null;
  onCamera: (camera: Camera) => void;
  /** Any card task runs. */
  busy: boolean;
  reading: boolean;
  message: CardMessage;
  /** The name of the card of an earlier visit, which `onReconnect` opens again, or null. */
  lastCard: string | null;
  onConnect: () => void;
  onReconnect: () => void;
  onDisconnect: () => void;
  /** What the ZIP mode shows under the modes, such as the open of an earlier GRKU.zip. */
  zip?: ReactNode;
  /** The next step with a connected card: what a write would do. */
  next?: ReactNode;
}

/**
 * The first section: the install mode, and in card mode the connected card. The page shows it only
 * in a browser that can write to a card.
 */
export function StartSection({
  strings: t,
  mode,
  onMode,
  session,
  otherCamera,
  cardCamera,
  onCamera,
  busy,
  reading,
  message,
  lastCard,
  onConnect,
  onReconnect,
  onDisconnect,
  zip,
  next,
}: StartProps) {
  const ids = useId();
  const state = session?.state;
  return (
    <Section id="start-label" title={t.card}>
      <RadioGroup
        name="mode"
        value={mode}
        disabled={busy}
        aria-labelledby="start-label"
        className="grid gap-3 sm:grid-cols-2"
        onValueChange={(value) => onMode(value as InstallMode)}
      >
        <ChoiceCard htmlFor={`${ids}-card`} control={<RadioGroupItem id={`${ids}-card`} value="card" className="mt-1" />}>
          <span className="flex flex-wrap items-center gap-2 font-semibold">
            {t.modeCard}
            <Badge variant="outline" className="border-brand text-brand">
              {t.recommended}
            </Badge>
          </span>
          <span className="text-sm text-muted-foreground">{t.modeCardText}</span>
        </ChoiceCard>
        <ChoiceCard htmlFor={`${ids}-zip`} control={<RadioGroupItem id={`${ids}-zip`} value="zip" className="mt-1" />}>
          <span className="font-semibold">{t.modeZip}</span>
          <span className="text-sm text-muted-foreground">{t.modeZipText}</span>
        </ChoiceCard>
      </RadioGroup>

      {mode === 'zip' && zip}

      {mode === 'card' &&
        (!session || !state ? (
          <>
            <div className="flex flex-wrap gap-2">
              {lastCard ? (
                <>
                  <Button type="button" variant="brand" size="lg" disabled={busy} onClick={onReconnect}>
                    {t.cardReconnect(lastCard)}
                  </Button>
                  <Button type="button" variant="outline" size="lg" disabled={busy} onClick={onConnect}>
                    {t.cardConnectAnother}
                  </Button>
                </>
              ) : (
                <Button type="button" variant="brand" size="lg" disabled={busy} onClick={onConnect}>
                  {t.cardConnect}
                </Button>
              )}
            </div>
            <p className={NOTE}>
              {lastCard ? sentences(t.cardReconnectNote, t.cardReader) : sentences(t.cardReader, t.cardPickNote)}
            </p>
          </>
        ) : (
          <>
            <dl className={FACTS}>
              <dt className={FACT_LABEL}>{t.cardName}</dt>
              <dd className={FACT_VALUE}>{state.name || '—'}</dd>
              {cardCamera && (
                <>
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
                            disabled={busy}
                            onClick={() => onCamera(option)}
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
                </>
              )}
              <dt className={FACT_LABEL}>{t.cardGrkit}</dt>
              <dd className={FACT_VALUE}>
                {state.install === 'none'
                  ? t.cardNone
                  : state.install === 'legacy'
                    ? t.cardLegacy
                    : [cardVersion(state), !cardStarted(state) && t.cardNotStarted]
                        .filter(Boolean)
                        .join(' · ')}
              </dd>
            </dl>
            {!state.isCardRoot && <p className={WARNING}>{t.cardNotRoot}</p>}
            {otherCamera && <p className={WARNING}>{t.cardOtherCamera}</p>}
            {state.install === 'legacy' && <p className={NOTE}>{t.cardLegacyNote}</p>}
            {/* Right after a write, the result of the write shows this step. */}
            {state.install === 'current' && !cardStarted(state) && !session.written && (
              <p className={NOTE}>{t.cardDoneFirst}</p>
            )}
            {next}
            {state.userModules.length > 0 && (
              <p className={NOTE}>
                {t.cardUserModules} {state.userModules.map((name) => name.replace(/\.GRM$/i, '')).join(t.listSeparator)}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={onConnect}>
                {t.cardConnectOther}
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={onDisconnect}>
                {t.cardDisconnect}
              </Button>
            </div>
          </>
        ))}
      {mode === 'card' && (
        <Status task={reading ? { kind: 'reading' } : { kind: 'idle' }} message={message} strings={t} />
      )}
    </Section>
  );
}

interface ChangesProps {
  strings: Strings;
  session: CardSession;
  changes: CardChanges;
  version: string;
  /** The camera and its firmware that the write installs for, as the ZIP summary names them. */
  camera: string;
  firmware: string;
  /** The names of the modules of the package, in menu order. */
  modules: readonly string[];
  /** The number of effects of the package. */
  effectCount: number;
  /** The release page of `version`. */
  releaseUrl: string;
  /** The name of a module by ID, and of an effect by ID. */
  moduleName: (id: string) => string;
  effectName: (id: string) => string;
  /** True when the selection makes a package. */
  canWrite: boolean;
  /** Any card task runs. */
  busy: boolean;
  /** The task of this section, for its progress text. */
  task: CardTask;
  message: CardMessage;
  onApply: () => void;
  /** The links that the success state shows, as the download has them. */
  links: ReactNode;
  /** A line under the next steps of the success state, if any. */
  hint?: ReactNode;
  /** The terms of use, which the line under the button links to. */
  termsUrl: string;
}

function Change({ label, items, separator }: { label: string; items: readonly string[]; separator: string }) {
  if (items.length === 0) return null;
  return (
    <>
      <dt className={FACT_LABEL}>{label}</dt>
      <dd className={FACT_VALUE}>{items.join(separator)}</dd>
    </>
  );
}

/** The last section with a card: the changes, and the button that writes them. */
export function CardChangesView({
  strings: t,
  session,
  changes,
  version,
  releaseUrl,
  modules,
  effectCount,
  moduleName,
  effectName,
  canWrite,
  busy,
  task,
  message,
  onApply,
  links,
  hint,
  termsUrl,
  camera,
  firmware,
}: ChangesProps) {
  const fresh = changes.grkit !== 'same';
  const any = hasChanges(changes);
  const state = session.state;
  // After a write, until the selection changes again, the page shows the next steps.
  const doneLines = message?.tone === 'ok' && !any && !busy ? message.lines : null;
  return (
    <div className="flex flex-col gap-6">
      <dl className={FACTS}>
        <dt className={FACT_LABEL}>{t.camera}</dt>
        <dd className={FACT_VALUE}>{camera}</dd>
        <dt className={FACT_LABEL}>{t.firmware}</dt>
        <dd className={FACT_VALUE}>{firmware}</dd>
        <dt className={FACT_LABEL}>{t.cardGrkit}</dt>
        <dd className={FACT_VALUE}>
          {changes.grkit === 'install'
            ? t.changeInstall(version)
            : changes.grkit === 'update'
              ? t.changeUpdate(version)
              : t.changeSame(version)}
          {fresh && (
            <>
              {' · '}
              {/* A new tab keeps the connected card and the selection of this page. */}
              <a
                href={releaseUrl}
                target="_blank"
                rel="noreferrer"
                className="font-normal underline underline-offset-4 hover:text-brand"
              >
                {t.releaseNotes}
              </a>
            </>
          )}
        </dd>
        {state.install === 'none' ? (
          <>
            <Change label={t.changeModules} items={modules} separator={t.listSeparator} />
            <dt className={FACT_LABEL}>{t.changeEffects}</dt>
            <dd className={FACT_VALUE}>{effectCount}</dd>
          </>
        ) : (
          <>
            <Change label={t.changeAddModules} items={changes.addModules.map(moduleName)} separator={t.listSeparator} />
            <Change label={t.changeRemoveModules} items={changes.removeModules.map(moduleName)} separator={t.listSeparator} />
            <Change label={t.changeAddEffects} items={changes.addEffects.map(effectName)} separator={t.listSeparator} />
            <Change label={t.changeRemoveEffects} items={changes.removeEffects.map(effectName)} separator={t.listSeparator} />
            <Change label={t.changeUpdateEffects} items={changes.updateEffects.map(effectName)} separator={t.listSeparator} />
          </>
        )}
        {changes.scriptsOn && (
          <>
            <dt className={FACT_LABEL}>{t.changeScripts}</dt>
            <dd className={FACT_VALUE}>{t.changeScriptsOn}</dd>
          </>
        )}
        {changes.cleanLegacy && (
          <>
            <dt className={FACT_LABEL}>{t.changeLegacy}</dt>
            <dd className={FACT_VALUE}>{t.changeRemoves}</dd>
          </>
        )}
      </dl>
      {doneLines ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5" role="status">
          <p className="font-semibold">{t.cardDoneTitle}</p>
          <ol className="flex list-decimal flex-col gap-2 pl-6 leading-relaxed">
            {doneLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          {hint}
          {links}
        </div>
      ) : (
        <>
          {!any && <p className="text-sm text-muted-foreground">{t.noChanges}</p>}
          <div className="flex flex-col items-start gap-3">
            <Button
              type="button"
              variant="brand"
              size="lg"
              disabled={busy || !any || !canWrite || !state.isCardRoot}
              aria-busy={busy}
              onClick={onApply}
            >
              {changes.grkit === 'install'
                ? t.cardApplyInstall
                : changes.grkit === 'update'
                  ? t.cardApplyUpdate
                  : t.cardApply}
            </Button>
            <p className={NOTE}>{t.cardSafe}</p>
            <TermsNote text={t.termsNote} href={termsUrl} />
            <Status task={task} message={message} strings={t} />
          </div>
        </>
      )}
    </div>
  );
}

interface RemoveProps {
  strings: Strings;
  session: CardSession;
  /** Any card task runs. */
  busy: boolean;
  /** The task of this section, for its progress text. */
  task: CardTask;
  message: CardMessage;
  /**
   * Uninstalls GRKU: with `data` also the settings and the effects, and with `scriptsOff` it then
   * writes the files that turn SD scripts off.
   */
  onUninstall: (data: boolean, scriptsOff: boolean) => void;
  onScriptsOff: () => void;
  onCleanModeset: () => void;
}

/** The Uninstall section with a card. */
export function UninstallSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Section id="uninstall-label" title={title}>
      {children}
    </Section>
  );
}

/**
 * The card actions of Uninstall GRKU: uninstall GRKU, and turn SD scripts off. Without GRKU on
 * the card, only the cleanup of the files that turned SD scripts off stays.
 */
export function CardUninstall({
  strings: t,
  session,
  busy,
  task,
  message,
  onUninstall,
  onScriptsOff,
  onCleanModeset,
}: RemoveProps) {
  const [data, setData] = useState(false);
  const [scriptsOff, setScriptsOff] = useState(false);
  const [open, setOpen] = useState(false);
  const ids = useId();
  const state = session.state;
  const off = state.modeset?.command === 'off';

  function confirm() {
    setData(false);
    setScriptsOff(false);
    setOpen(true);
  }

  function uninstall() {
    setOpen(false);
    onUninstall(data, scriptsOff);
  }

  return (
    <div className="flex flex-col gap-6">
      {state.install !== 'none' && (
        <div className="flex flex-col items-start gap-3">
          <p className="max-w-[72ch]">{t.uninstallText}</p>
          <Button type="button" variant="outline" disabled={busy} onClick={confirm}>
            {t.uninstallButton}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false} aria-describedby={undefined} className="sm:max-w-md">
              <DialogHeader className="text-left">
                <DialogTitle>{t.uninstallButton}</DialogTitle>
              </DialogHeader>
              <p>{t.uninstallConfirm}</p>
              <div className="flex flex-col gap-3">
                <Label htmlFor={`${ids}-data`} className="items-start gap-3 leading-normal font-normal">
                  <Checkbox
                    id={`${ids}-data`}
                    className="mt-0.5"
                    checked={data}
                    onCheckedChange={(value) => setData(value === true)}
                  />
                  <span>{t.uninstallData}</span>
                </Label>
                <Label htmlFor={`${ids}-scripts`} className="items-start gap-3 leading-normal font-normal">
                  <Checkbox
                    id={`${ids}-scripts`}
                    className="mt-0.5"
                    checked={scriptsOff}
                    onCheckedChange={(value) => setScriptsOff(value === true)}
                  />
                  <span>{t.uninstallScriptsOff}</span>
                </Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="button" variant="destructive" onClick={uninstall}>
                  {t.uninstallConfirmButton}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <Status task={task} message={message} strings={t} />

      <div className="flex flex-col items-start gap-3">
        {state.install !== 'none' && (
          <>
            <h3 className="font-semibold">{t.scriptsOffTitle}</h3>
            <p className={NOTE}>{t.scriptsOffText}</p>
            <Button type="button" variant="outline" disabled={busy} onClick={onScriptsOff}>
              {t.scriptsOffWrite}
            </Button>
          </>
        )}
        {off && (
          <div className="flex flex-col items-start gap-2">
            <p className={NOTE}>{t.modesetClean}</p>
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onCleanModeset}>
              {t.modesetCleanButton}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
