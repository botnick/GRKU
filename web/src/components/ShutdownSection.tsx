import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Info, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { Strings } from '../i18n';
import { save } from '../package';
import { makePicture, PICTURE_HEIGHT, PICTURE_NAME, PICTURE_WIDTH, type ShutdownKind } from '../shutdownPicture';

/**
 * The text that the camera draws over the picture: the bar of the shot counts and the firmware
 * version, at their places on the screen of 720 by 480. The preview shows where the picture stays
 * free of them.
 */
function CameraText({ firmware }: { firmware: string }) {
  const version = /\d+\.\d+/.exec(firmware)?.[0];
  return (
    <svg className="absolute inset-0 size-full fill-white font-mono" viewBox={`0 0 ${PICTURE_WIDTH} ${PICTURE_HEIGHT}`} aria-hidden="true">
      <rect x="20" y="340" width="680" height="40" fill="#000" fillOpacity="0.45" />
      <text x="360" y="371" textAnchor="middle" fontSize="30" textLength="545" lengthAdjust="spacingAndGlyphs">
        Today : 0000000 &gt; Total: 0000000
      </text>
      {version && (
        <text x="710" y="462" textAnchor="end" fontSize="30" textLength="176" lengthAdjust="spacingAndGlyphs">
          FW Ver.{version}
        </text>
      )}
    </svg>
  );
}

function dataUrl(bytes: Uint8Array): string {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return `data:image/jpeg;base64,${btoa(text)}`;
}

/** Downloads the file for the GRKU folder of the card, for a card that the page does not write. */
export function savePicture(bytes: Uint8Array) {
  save(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'image/jpeg' }), PICTURE_NAME);
}

/**
 * The picture that the camera shows when it turns off (Shutdown Screen), as an extra of the
 * modules step: the GRKU logo, a picture of the user cropped to the screen, the camera's own
 * screen, or the picture that the card already has. The chosen picture shows with the text that
 * the camera draws over it.
 */
export function ShutdownSection({
  strings,
  kind,
  onKind,
  own,
  onOwn,
  logoUrl,
  onCard,
  firmware,
}: {
  strings: Strings;
  /** The kind that applies (`shutdownKind`). */
  kind: ShutdownKind;
  onKind: (kind: ShutdownKind) => void;
  /** The picture of the user, as the file for the card, or null without one. */
  own: Uint8Array | null;
  onOwn: (bytes: Uint8Array) => void;
  logoUrl: string;
  /** The file of the connected card, or null. */
  onCard: Uint8Array | null;
  /** The firmware versions of the camera, such as `2.21`, for the version text of the preview. */
  firmware: string;
}) {
  const t = strings.shutdown;
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const ownUrl = useMemo(() => (own ? dataUrl(own) : null), [own]);
  const cardUrl = useMemo(() => (onCard ? dataUrl(onCard) : null), [onCard]);

  async function choose(file: File | undefined) {
    // A new input, so the same file can be selected again.
    setFileKey((key) => key + 1);
    if (!file) return;
    try {
      onOwn(await makePicture(file));
      onKind('own');
      setFailed(false);
    } catch (error) {
      console.error(error);
      setFailed(true);
    }
  }

  function pick(next: string) {
    // Your picture without a picture yet asks for one first, and stays unchosen until it reads.
    if (next === 'own' && !own) input.current?.click();
    else onKind(next as ShutdownKind);
  }

  const options: { value: ShutdownKind; label: string; url: string | null; empty: ReactNode }[] = [
    { value: 'logo', label: t.logo, url: logoUrl, empty: null },
    { value: 'own', label: t.own, url: ownUrl, empty: <ImagePlus className="size-6" aria-hidden="true" /> },
    ...(cardUrl ? [{ value: 'keep' as const, label: t.keep, url: cardUrl, empty: null }] : []),
    { value: 'none', label: t.none, url: null, empty: <Power className="size-6" aria-hidden="true" /> },
  ];
  const shown = options.find((option) => option.value === kind)?.url ?? null;

  return (
    <section aria-labelledby={`${id}-title`} className="mt-4 rounded-xl border bg-card p-4 sm:p-5">
      <h2 id={`${id}-title`} className="text-[15px] font-semibold">
        {t.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.note}</p>
      <RadioGroup
        value={kind}
        onValueChange={pick}
        aria-labelledby={`${id}-title`}
        className={cn('mt-4 grid gap-2 sm:gap-3', options.length > 3 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3')}
      >
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${id}-${option.value}`}
            className={cn(
              'flex cursor-pointer flex-col items-stretch gap-2 rounded-lg border border-border p-2 text-sm font-medium transition-colors',
              'hover:border-input has-data-[state=checked]:border-foreground has-data-[state=checked]:shadow-[inset_0_0_0_1px_var(--foreground)]',
            )}
          >
            <span className="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-md bg-black text-muted-foreground">
              {option.url ? (
                <img src={option.url} alt="" width={PICTURE_WIDTH} height={PICTURE_HEIGHT} className="size-full object-cover" />
              ) : (
                option.empty
              )}
            </span>
            <span className="flex items-center gap-2 px-0.5 pb-0.5">
              <RadioGroupItem id={`${id}-${option.value}`} value={option.value} />
              <span className="min-w-0 leading-snug">{option.label}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <input
        key={fileKey}
        ref={input}
        id={`${id}-file`}
        className="sr-only"
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void choose(event.target.files?.[0])}
      />
      {(kind === 'own' || failed) && (
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => input.current?.click()}>
          <ImagePlus aria-hidden="true" />
          {t.choose}
        </Button>
      )}
      {failed && <p className="mt-2 text-sm text-destructive">{t.failed}</p>}

      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start">
        {shown && (
          <figure className="m-0">
            <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-black ring-1 ring-border">
              <img src={shown} width={PICTURE_WIDTH} height={PICTURE_HEIGHT} alt={t.alt} className="absolute inset-0 size-full" />
              <CameraText firmware={firmware} />
            </div>
            <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.textNote}</figcaption>
          </figure>
        )}
        <p className={cn('m-0 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground', !shown && 'sm:col-span-2')}>
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{kind === 'none' ? t.noneNote : t.cameraNote}</span>
        </p>
      </div>
    </section>
  );
}

/** The shutdown picture in the ZIP flow: GRKU.zip leaves it out, so it downloads on its own. */
export function ShutdownDownload({ strings, picture }: { strings: Strings; picture: Uint8Array }) {
  const t = strings.shutdown;
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border bg-card p-4">
      <p className="m-0 text-sm font-medium">{t.title}</p>
      <p className="m-0 text-sm text-muted-foreground">{t.zipText}</p>
      <Button type="button" variant="outline" size="sm" onClick={() => savePicture(picture)}>
        {t.download}
      </Button>
      <p className="m-0 text-xs text-muted-foreground">{t.downloadNote}</p>
    </div>
  );
}
