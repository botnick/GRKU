import { useEffect, useState } from 'react';
import type { Strings } from '../i18n';
import { LAUNCH_ENDS, LAUNCH_PRICES, REGULAR_PRICES, inLaunch, type Tier } from '../plus';
import { cn } from '@/lib/utils';

/** The largest launch discount of any tier, in whole percent. */
const maxOff = Math.max(
  ...(Object.keys(LAUNCH_PRICES) as Tier[]).map((tier) => Math.round((1 - LAUNCH_PRICES[tier] / REGULAR_PRICES[tier]) * 100)),
);

/**
 * The launch offer: the largest discount, and the days until the regular prices start. Renders
 * nothing after the launch ends. The date is real; the service switches prices at the same instant.
 */
export function LaunchOffer({ strings: t, className }: { strings: Strings; className?: string }) {
  // Counted in the browser, not when the page is prerendered.
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => setDays(Math.ceil((LAUNCH_ENDS - Date.now()) / 86_400_000)), []);
  if (!inLaunch()) return null;
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border border-brand/40 bg-brand/10 px-4 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[12px] font-medium text-brand">{t.plus.launchTitle}</span>
        <span className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t.plus.launchOff(maxOff)}</span>
        <span className="text-[12px] leading-snug text-muted-foreground">{t.plus.launchAfter}</span>
      </div>
      <div className="flex shrink-0 flex-col items-center rounded-lg border border-brand/30 bg-background/60 px-3 py-2 text-center">
        {days !== null && days <= 1 ? (
          <span className="text-sm font-semibold text-brand">{t.plus.launchLastDay}</span>
        ) : (
          <>
            <span className="text-[11px] text-muted-foreground">{t.plus.launchEndsIn}</span>
            <span className="text-2xl leading-none font-semibold tabular-nums text-brand">{days ?? '–'}</span>
            <span className="text-[11px] text-muted-foreground">{t.plus.launchDays}</span>
          </>
        )}
      </div>
    </div>
  );
}
