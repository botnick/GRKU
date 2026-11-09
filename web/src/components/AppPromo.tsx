import { useState, useSyncExternalStore } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAppleMobileDevice, type DeviceNavigator } from '../card';
import type { Strings } from '../i18n';
import { LANDING_HERO } from '../landing';

/** GR Snap on the App Store. GR Snap is an iOS app by the same author as GRKU. */
const APP_URL = 'https://apps.apple.com/app/gr-snap-ricoh-gr-wireless/id6768040383';
const CLOSED_KEY = 'grku.appPromo';

/** Shown on an iPhone or an iPad until the user closes it. */
function initiallyShown(): boolean {
  if (typeof navigator === 'undefined' || !isAppleMobileDevice(navigator as DeviceNavigator)) return false;
  try {
    return localStorage.getItem(CLOSED_KEY) !== 'closed';
  } catch {
    return true;
  }
}

/** Calls `change` when the page scrolls or resizes. */
function subscribeScroll(change: () => void): () => void {
  addEventListener('scroll', change, { passive: true });
  addEventListener('resize', change);
  return () => {
    removeEventListener('scroll', change);
    removeEventListener('resize', change);
  };
}

/**
 * Whether the landing hero has scrolled out of view. Before the hero is in the page (the first
 * render), it has not: the bar never shows over the hero, even for a frame.
 */
function pastHero(): boolean {
  const hero = document.getElementById(LANDING_HERO);
  return !!hero && hero.getBoundingClientRect().bottom <= 0;
}

/**
 * A bar at the bottom of the screen that links to GR Snap on the App Store, on an iPhone or an iPad
 * until the user closes it.
 */
export function AppPromo({ strings }: { strings: Strings }) {
  const [shown, setShown] = useState(initiallyShown);
  if (!shown) return null;
  return <PromoBar strings={strings} onClose={() => setShown(false)} />;
}

/**
 * The bar, which waits until the landing hero scrolls away, so it does not compete with the install
 * action or cover the film looks. It follows the scroll only while it can show.
 */
function PromoBar({ strings, onClose }: { strings: Strings; onClose: () => void }) {
  const past = useSyncExternalStore(subscribeScroll, pastHero, () => false);
  if (!past) return null;

  const close = () => {
    onClose();
    try {
      localStorage.setItem(CLOSED_KEY, 'closed');
    } catch {
      // Without storage, the bar comes back on the next visit.
    }
  };

  return (
    <>
      {/* Keeps the end of the page clear of the fixed bar. */}
      <div className="h-20" aria-hidden="true" />
      <aside
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-card px-4 py-3 text-card-foreground shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
        aria-label="GR Snap"
      >
        <img src="/gr-snap.png" alt="" width="40" height="40" className="size-10 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col text-sm leading-tight">
          <strong className="font-semibold">GR Snap</strong>
          <span className="truncate text-muted-foreground">{strings.appPromo}</span>
          <small className="text-xs text-muted-foreground">{strings.appPromoMaker}</small>
        </div>
        <Button asChild variant="brand" size="sm">
          <a href={APP_URL}>{strings.appPromoOpen}</a>
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={strings.appPromoClose} onClick={close}>
          <X aria-hidden="true" />
        </Button>
      </aside>
    </>
  );
}
