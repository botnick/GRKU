import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { sentences, type Strings } from '../i18n';

/** The read of a GRKU.zip of an earlier download. */
export type PackageStatus =
  | { state: 'idle' | 'reading' | 'error' }
  /**
   * `added` imports and `recipes` recipes came back, and `locked` is true when native looks need
   * an unlock again.
   */
  | { state: 'done'; added: number; recipes: number; locked: boolean };

/**
 * Opens a GRKU.zip of an earlier download, so the page shows what it holds: its camera, its
 * modules, its film looks, its recipes, and the imports of the browser that made it.
 */
export function PackageOpen({
  strings: t,
  status,
  onOpen,
}: {
  strings: Strings;
  status: PackageStatus;
  onOpen: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="text-muted-foreground">
        {t.packageHint}{' '}
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-sm"
          disabled={status.state === 'reading'}
          onClick={() => input.current?.click()}
        >
          {t.packageOpen}
        </Button>
        <input
          ref={input}
          className="sr-only"
          type="file"
          accept=".zip,application/zip"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onOpen(file);
          }}
        />
      </p>
      <div aria-live="polite">
        {status.state === 'reading' && <p className="text-muted-foreground">{t.packageReading}</p>}
        {status.state === 'error' && <p className="text-destructive">{t.packageError}</p>}
        {status.state === 'done' && (
          <p className="text-muted-foreground">
            {sentences(
              t.packageDone,
              ...(status.added > 0 ? [t.packageImports(status.added)] : []),
              ...(status.recipes > 0 ? [t.packageRecipes(status.recipes)] : []),
              ...(status.locked ? [t.packageLocked] : []),
            )}
          </p>
        )}
      </div>
    </div>
  );
}
