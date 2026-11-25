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
import { cn } from '@/lib/utils';

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

const seenGreeting = () => {
  try {
    return !!sessionStorage.getItem(GREET_SEEN);
  } catch {
    return false;
  }
};

/**
 * Whether the mascot says hello now (once a visit, a few seconds after the page opens), and
 * whether it has said it: on a phone the label beside the button folds away after the hello.
 */
function useGreeting(opened: boolean): [boolean, () => void, boolean] {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(seenGreeting);
  useEffect(() => {
    if (opened) {
      setShow(false);
      setDone(true);
      return;
    }
    if (seenGreeting()) return;
    const start = setTimeout(() => {
      setShow(true);
      try {
        sessionStorage.setItem(GREET_SEEN, '1');
      } catch {
        // Nothing to keep.
      }
    }, GREET_AFTER);
    const end = setTimeout(() => {
      setShow(false);
      setDone(true);
    }, GREET_AFTER + GREET_FOR);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [opened]);
  return [
    show,
    () => {
      setShow(false);
      setDone(true);
    },
    done,
  ];
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
  const [greeting, dismissGreeting, greeted] = useGreeting(mounted);
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
          {/* The label tells at a glance that this is an AI assistant; on a phone it folds away after the hello. */}
          <button
            type="button"
            onClick={show}
            onPointerEnter={() => void ChatPanel.preload().catch(() => {})}
            onFocus={() => void ChatPanel.preload().catch(() => {})}
            aria-label={text.ai}
            aria-haspopup="dialog"
            className="group flex items-center gap-2 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {!bubble && (
              <span className={cn('h-9 items-center rounded-full border bg-popover px-3.5 text-[14px] font-medium whitespace-nowrap text-popover-foreground shadow-md group-hover:border-foreground/30', greeted ? 'hidden sm:inline-flex' : 'inline-flex')}>
                {text.ai}
              </span>
            )}
            <span className="grid size-16 place-items-center rounded-full border border-black/10 bg-[#f4f2ec] shadow-[0_8px_24px_rgba(0,0,0,0.28)] light:bg-white light:shadow-[0_8px_24px_rgba(40,30,10,0.2)] sm:size-[72px]">
              <Mascot pose="wave" size={56} bob eager className="sm:scale-110" />
            </span>
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
