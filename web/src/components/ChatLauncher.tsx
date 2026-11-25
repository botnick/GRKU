// The round button of the GRKU assistant at the bottom right of every page. It is the only part
// of the chat in the page script: the panel (ChatPanel.tsx) downloads when the visitor first
// opens it, or when the pointer comes to the button. It sits above the bars fixed at the bottom
// of a page (the install steps, the Save bar of Develop), and hides while the panel is open.
import { Suspense, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ChatContext } from '../chat/api';
import { launcherText } from '../chat/label';
import type { Language, Strings } from '../i18n';
import type { SitePage } from '../languagePage';
import { part } from '../parts';
import { Mascot } from './Mascot';

const ChatPanel = part(() => import('./ChatPanel').then((module) => module.ChatPanel));

/** The bars fixed to the bottom of the window: the launcher stays above the highest one. */
const BOTTOM_BARS = '.fixed.inset-x-0.bottom-0, [data-bottom-bar]';

/** The height of the bars fixed at the bottom of the window, measured again as the page changes. */
function useBottomOffset(page: SitePage): number {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let scheduled = false;
    const measure = () => {
      scheduled = false;
      let top = window.innerHeight;
      for (const element of document.querySelectorAll<HTMLElement>(BOTTOM_BARS)) {
        if (element.closest('[data-chat]')) continue;
        const box = element.getBoundingClientRect();
        if (box.height > 0 && box.bottom >= window.innerHeight - 2) top = Math.min(top, box.top);
      }
      setOffset(Math.max(0, Math.round(window.innerHeight - top)));
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(measure);
    };
    measure();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [page]);
  return offset;
}

const GREET_SEEN = 'grku.chat.greet';
/** The greeting bubble shows this long after the page opens, for this long, once a visit. */
const GREET_AFTER = 4000;
const GREET_FOR = 6000;

/** Whether the mascot says hello now: once a visit, a few seconds after the page opens. */
function useGreeting(opened: boolean): [boolean, () => void] {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (opened) {
      setShow(false);
      return;
    }
    try {
      if (sessionStorage.getItem(GREET_SEEN)) return;
    } catch {
      // Without storage it greets once in this page.
    }
    const start = setTimeout(() => {
      setShow(true);
      try {
        sessionStorage.setItem(GREET_SEEN, '1');
      } catch {
        // Nothing to keep.
      }
    }, GREET_AFTER);
    const end = setTimeout(() => setShow(false), GREET_AFTER + GREET_FOR);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [opened]);
  return [show, () => setShow(false)];
}

const HINT_SEEN = 'grku.chat.hint';
/** How long a visitor stays still on the write step before the hint offers help. */
const HINT_AFTER = 60_000;

/** Whether to offer help: on the last install step, after a minute without a click or a key, once a visit. */
function useHint(page: SitePage, opened: boolean): [boolean, () => void] {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (page !== 'write' || opened) {
      setShow(false);
      return;
    }
    try {
      if (sessionStorage.getItem(HINT_SEEN)) return;
    } catch {
      // Without storage the hint can show once in this page.
    }
    let timer = setTimeout(() => setShow(true), HINT_AFTER);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setShow(true), HINT_AFTER);
    };
    for (const type of ['pointerdown', 'keydown']) window.addEventListener(type, reset, { passive: true });
    return () => {
      clearTimeout(timer);
      for (const type of ['pointerdown', 'keydown']) window.removeEventListener(type, reset);
    };
  }, [page, opened]);
  const dismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem(HINT_SEEN, '1');
    } catch {
      // Nothing to keep.
    }
  };
  return [show, dismiss];
}

export function ChatLauncher({
  language,
  strings,
  page,
  plusKey,
  context,
  onPlus,
  onNavigate,
}: {
  language: Language;
  strings: Strings;
  page: SitePage;
  plusKey: string | null;
  context: ChatContext;
  onPlus: (start: 'tiers' | 'key') => void;
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const offset = useBottomOffset(page);
  const [hint, dismissHint] = useHint(page, mounted);
  const [greeting, dismissGreeting] = useGreeting(mounted);
  const text = launcherText(language);
  const bubble = hint ? text.hint : greeting ? text.greet : null;
  const dismissBubble = hint ? dismissHint : dismissGreeting;
  if (open && !mounted) setMounted(true);

  const show = () => {
    dismissHint();
    dismissGreeting();
    setOpen(true);
  };

  return (
    <div data-chat="">
      {!open && (
        <div className="fixed right-3 z-40 flex items-end gap-1 transition-[bottom] duration-200 motion-reduce:transition-none sm:right-5" style={{ bottom: offset ? `${offset + 12}px` : 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
          {bubble && (
            <div className="relative mb-3 flex max-w-[220px] items-start gap-1 rounded-2xl rounded-br-md border bg-popover py-2 pr-1 pl-3 text-[14px] leading-snug text-popover-foreground shadow-lg motion-safe:animate-chat-in" role="status">
              <button type="button" onClick={show} className="text-left">
                {bubble}
              </button>
              <button type="button" onClick={dismissBubble} aria-label={text.dismiss} className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={show}
            onPointerEnter={() => void ChatPanel.preload().catch(() => {})}
            onFocus={() => void ChatPanel.preload().catch(() => {})}
            aria-label={text.open}
            title={text.open}
            aria-haspopup="dialog"
            className="grid size-14 place-items-center rounded-full border border-black/10 bg-[#f7f7f2] shadow-[0_8px_24px_rgba(0,0,0,0.28)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 light:bg-white light:shadow-[0_8px_24px_rgba(40,30,10,0.2)] sm:size-16 [&>svg]:size-11 sm:[&>svg]:size-[52px]"
          >
            <Mascot animated />
          </button>
        </div>
      )}
      {mounted && (
        <Suspense fallback={null}>
          <ChatPanel open={open} onOpenChange={setOpen} language={language} strings={strings} plusKey={plusKey} context={context} onPlus={onPlus} onNavigate={onNavigate} />
        </Suspense>
      )}
    </div>
  );
}
