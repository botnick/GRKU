import { SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import type { Effect } from '../catalog';
import type { Strings } from '../i18n';
import { lookRequestMail } from '../lookSearch';
import { EffectIcon } from './EffectIcon';

type Suggestion = Pick<Effect, 'id' | 'name' | 'icon' | 'cover'>;

/**
 * What the look grid shows when a search or a filter finds nothing: what was searched, the closest
 * looks (or the popular ones), a way back to every look, and two quiet ways on: make the look from
 * a LUT or a Lightroom preset, or ask for it.
 */
export function LookSearchEmpty<T extends Suggestion>({
  query,
  suggestions,
  near,
  strings: t,
  onPick,
  onClear,
  onShowAll,
  makeOwn,
}: {
  query: string;
  /** The closest looks, or the popular ones when `near` is false. */
  suggestions: readonly T[];
  near: boolean;
  strings: Strings;
  onPick: (look: T) => void;
  onClear: () => void;
  onShowAll: () => void;
  /** The way to the import of a LUT: a button of this page or a link to the install page. */
  makeOwn: { onClick: () => void } | { href: string } | null;
}) {
  const typed = query.trim();
  const quiet = 'underline underline-offset-4 decoration-muted-foreground/50 hover:text-foreground hover:decoration-foreground';
  let own: ReactNode = null;
  if (makeOwn && 'href' in makeOwn)
    own = (
      <a href={makeOwn.href} className={quiet}>
        {t.lookSearch.makeOwn}
      </a>
    );
  else if (makeOwn)
    own = (
      <button type="button" onClick={makeOwn.onClick} className={quiet}>
        {t.lookSearch.makeOwn}
      </button>
    );
  return (
    <div className="flex flex-col items-center gap-4 px-2 py-8 text-center" role="status">
      <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-[15px] font-medium text-foreground [overflow-wrap:anywhere]">{typed ? t.lookSearch.noLookNamed(typed) : t.lookSearch.noLooksHere}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {typed && (
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            {t.lookSearch.clearSearch}
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onShowAll}>
          {t.lookSearch.showAll}
        </Button>
      </div>
      {suggestions.length > 0 && (
        <div className="w-full max-w-xl">
          <p className="mb-2 text-[13px] text-muted-foreground">{near ? t.lookSearch.closest : t.lookSearch.popular}</p>
          <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {suggestions.map((look) => (
              <li key={look.id}>
                <button
                  type="button"
                  onClick={() => onPick(look)}
                  className="flex h-full min-h-[44px] w-full flex-col items-center gap-1 rounded-lg border bg-card p-1.5 pt-2 text-center outline-none transition-colors hover:border-input focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <EffectIcon effect={look} className="size-11" />
                  <span className="line-clamp-2 text-[11px] leading-[1.25] font-medium text-foreground">{look.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {typed && (
        <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
          {own}
          <a href={lookRequestMail(typed)} className={quiet}>
            {t.lookSearch.ask}
          </a>
        </p>
      )}
    </div>
  );
}
