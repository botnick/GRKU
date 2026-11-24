// The panel of the GRKU assistant: a floating panel on a computer, a full-height sheet on a phone.
// It loads only when the visitor opens the chat (ChatLauncher). The conversation stays on this
// device (chat/store.ts); the service gets the turns, the page context, and, when the visitor
// turned it on, the small memory.
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { ArrowUp, Check, Copy, History, MessageSquarePlus, Square, Trash2, X } from 'lucide-react';
import { ask, ChatFailure, openSession, type ChatContext, type ChatSession, type Turn } from '../chat/api';
import { lookKey, parseReply, plainText, type Block, type Inline, type LookPick, type SiteLink } from '../chat/render';
import { chatStrings, type ChatStrings, type ChipId } from '../chat/strings';
import {
  deviceStorage,
  firmwareIn,
  forgetAll,
  likeLook,
  loadCurrent,
  loadMemory,
  loadRecent,
  loadSession,
  newConversation,
  saveCurrent,
  saveMemory,
  saveSession,
  titleOf,
  type Conversation,
  type Memory,
  type StoredTurn,
} from '../chat/store';
import type { Cover } from '../catalog';
import { siteUrl } from '../catalog';
import type { Language, Strings } from '../i18n';
import { LANGUAGE_PATHS, DOC_PATHS } from '../languagePage';
import { TURNSTILE_SITEKEY } from '../plus';
import { BrandMark } from './BrandMark';
import { EffectIcon } from './EffectIcon';
import { Turnstile } from './Turnstile';
import { cn } from '@/lib/utils';

/** The Turnstile language tag of each page language. */
const TURNSTILE_LANGUAGES: Readonly<Record<Language, string>> = { en: 'en', th: 'th', 'zh-Hans': 'zh-cn', 'zh-Hant': 'zh-tw', ja: 'ja', ko: 'ko' };

/** The site key of the chat's Turnstile: VITE_CHAT_TURNSTILE for local tests (Cloudflare's test key). */
const SITEKEY: string = (import.meta.env?.VITE_CHAT_TURNSTILE as string | undefined) ?? TURNSTILE_SITEKEY;

interface LookInfo {
  id: string;
  name: string;
  brand: string;
  kind: string;
  hint?: string;
  cover?: Cover;
}

let looksLoading: Promise<Map<string, LookInfo>> | null = null;

const resolvers = new WeakMap<Map<string, LookInfo>, (id: string) => string | null>();
/** The library id of a look id of an answer, forgiving a misspelled dash or case. */
function resolver(looks: Map<string, LookInfo>): (id: string) => string | null {
  let resolve = resolvers.get(looks);
  if (!resolve) {
    const byKey = new Map([...looks.keys()].map((id) => [lookKey(id), id]));
    resolve = (id) => (looks.has(id) ? id : (byKey.get(lookKey(id)) ?? null));
    resolvers.set(looks, resolve);
  }
  return resolve;
}

/** The looks of the library, from the knowledge pack of the site, for the look cards. */
function loadLooks(): Promise<Map<string, LookInfo>> {
  looksLoading ??= fetch(siteUrl('chat/knowledge.json'))
    .then((response) => (response.ok ? response.json() : { looks: [] }))
    .then((pack: { looks?: LookInfo[] }) => new Map((pack.looks ?? []).map((look) => [look.id, look])))
    .catch(() => {
      looksLoading = null;
      return new Map<string, LookInfo>();
    });
  return looksLoading;
}

type Notice =
  | { kind: 'limit' }
  | { kind: 'busy' }
  | { kind: 'slow' }
  | { kind: 'cooldown' }
  | { kind: 'closed' }
  | { kind: 'human' }
  | { kind: 'error'; retry: boolean }
  | { kind: 'tooLong'; max: number };

export interface ChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language;
  strings: Strings;
  plusKey: string | null;
  /** Where the visitor is, for answers that fit the page. */
  context: ChatContext;
  /** Opens GRKU Plus on its plans or on "I have a key". */
  onPlus: (start: 'tiers' | 'key') => void;
  /** Opens a site address: in place when it is a page of the app, else as a new page load. */
  onNavigate: (href: string) => void;
  /** A question to ask at once, from the hint or a chip outside the panel. */
  initialQuestion?: string | null;
}

export function ChatPanel({ open, onOpenChange, language, strings: t, plusKey, context, onPlus, onNavigate, initialQuestion }: ChatPanelProps) {
  const c = chatStrings(language);
  const storage = deviceStorage();
  const [conversation, setConversation] = useState<Conversation>(() => loadCurrent(storage) ?? newConversation());
  const [session, setSession] = useState<ChatSession | null>(() => loadSession(storage, plusKey));
  const [needHuman, setNeedHuman] = useState(false);
  const [humanReset, setHumanReset] = useState(0);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState<string | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [remaining, setRemaining] = useState<number | null>(session?.remaining ?? null);
  const [view, setView] = useState<'chat' | 'menu'>('chat');
  const [memory, setMemory] = useState<Memory>(() => loadMemory(storage));
  const [looks, setLooks] = useState<Map<string, LookInfo> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pendingQuestion = useRef<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const tier = session?.tier ?? 'free';
  const maxInput = session?.maxInput ?? 600;
  const busy = streaming !== null;
  const sheet = useSheetViewport(open);

  // A session from an earlier visit for another key (or none) is not this visitor's tier.
  useEffect(() => {
    const kept = loadSession(storage, plusKey);
    setSession(kept);
    if (kept) setRemaining(kept.remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plusKey]);

  // The Turnstile check runs when the panel first opens without a session.
  useEffect(() => {
    if (open && !session) setNeedHuman(true);
  }, [open, session]);

  useEffect(() => {
    if (!open) return;
    const looksWanted = conversation.turns.some((turn) => turn.role === 'assistant' && turn.content.includes('"id"')) || (streaming ?? '').includes('"id"');
    if ((looksWanted || (view === 'menu' && memory.likes?.length)) && !looks) void loadLooks().then(setLooks);
  }, [open, conversation, streaming, looks, view, memory]);

  const persist = useCallback(
    (next: Conversation) => {
      setConversation(next);
      saveCurrent(storage, next);
    },
    [storage],
  );

  const startSession = useCallback(
    async (token: string | null) => {
      try {
        const opened = await openSession(token, plusKey);
        setSession(opened);
        setRemaining(opened.remaining);
        saveSession(storage, opened, plusKey);
        setNeedHuman(false);
        setNotice(null);
        const question = pendingQuestion.current;
        pendingQuestion.current = null;
        if (question) void send(question, opened);
      } catch (error) {
        setNeedHuman(false);
        setNotice(error instanceof ChatFailure && error.code === 'closed' ? { kind: 'closed' } : error instanceof ChatFailure && error.status === 403 ? { kind: 'human' } : { kind: 'error', retry: false });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plusKey, storage],
  );

  // Without a site key (a local build), the service skips the check too.
  useEffect(() => {
    if (needHuman && !SITEKEY) void startSession(null);
  }, [needHuman, startSession]);

  async function send(input: string, using: ChatSession | null = session) {
    const question = input.trim();
    if (!question || busy) return;
    if ([...question].length > maxInput) {
      setNotice({ kind: 'tooLong', max: maxInput });
      return;
    }
    if (!using) {
      pendingQuestion.current = question;
      setNeedHuman(true);
      return;
    }
    setNotice(null);
    setChips([]);
    setDraft('');
    const userTurn: StoredTurn = { role: 'user', content: question, at: Date.now() };
    const base = { ...conversation, turns: [...conversation.turns, userTurn], updated: Date.now() };
    persist(base);
    const found = firmwareIn(question);
    if (memory.on && ((found && found !== memory.firmware) || (context.camera && context.camera !== memory.camera))) {
      updateMemory({ ...memory, firmware: found ?? memory.firmware, camera: context.camera ?? memory.camera });
    }
    const turns: Turn[] = base.turns.map(({ role, content, sig }) => (role === 'assistant' ? { role, content, sig } : { role, content }));
    const controller = new AbortController();
    abort.current = controller;
    let text = '';
    setStreaming('');
    try {
      const result = await ask(
        using.session,
        turns,
        language,
        { ...context, ...(memory.on ? { camera: context.camera ?? memory.camera, firmware: memory.firmware, likes: memory.likes } : {}) },
        {
          onMeta: (meta) => setRemaining(meta.remaining),
          onText: (piece) => {
            text += piece;
            setStreaming(text);
          },
          onReplace: (safe) => {
            text = safe;
            setStreaming(text);
          },
          onChips: (ids) => setChips(ids),
        },
        controller.signal,
      );
      if (result.remaining !== null) setRemaining(result.remaining);
      const answer: StoredTurn = { role: 'assistant', content: text, sig: result.sig ?? undefined, at: Date.now() };
      persist({ ...base, turns: [...base.turns, answer], updated: Date.now() });
      if (result.remaining === 0) setNotice({ kind: 'limit' });
    } catch (error) {
      const code = error instanceof ChatFailure ? error.code : 'error';
      if (code === 'aborted' && text) {
        // A stopped answer stays, unsigned: it does not go back to the service.
        persist({ ...base, turns: [...base.turns, { role: 'assistant', content: text, at: Date.now() }], updated: Date.now() });
      } else {
        // The question goes back to the box, so the visitor can send it again.
        persist(conversation);
        setDraft(question);
        if (code === 'no session') {
          setSession(null);
          saveSession(storage, null, plusKey);
          pendingQuestion.current = question;
          setDraft('');
          setHumanReset((n) => n + 1);
          setNeedHuman(true);
        } else if (code === 'limit') {
          setRemaining(0);
          setNotice({ kind: 'limit' });
        } else if (code === 'busy') setNotice({ kind: 'busy' });
        else if (code === 'slow down') setNotice({ kind: 'slow' });
        else if (code === 'cooldown') setNotice({ kind: 'cooldown' });
        else if (code === 'closed') setNotice({ kind: 'closed' });
        else if (code === 'message too long') setNotice({ kind: 'tooLong', max: maxInput });
        else if (code !== 'aborted') setNotice({ kind: 'error', retry: true });
      }
    } finally {
      abort.current = null;
      setStreaming(null);
    }
  }

  function updateMemory(next: Memory) {
    setMemory(next);
    saveMemory(storage, next);
  }

  function newChat() {
    abort.current?.abort();
    persist(newConversation());
    setChips([]);
    setNotice(null);
    setView('chat');
    requestAnimationFrame(() => input.current?.focus());
  }

  function deleteAll() {
    abort.current?.abort();
    forgetAll(storage);
    setSession(null);
    setMemory({ on: false });
    setConversation(newConversation());
    setConfirmDelete(false);
    setView('chat');
  }

  // A question from outside the panel (the hint): asked once the panel is open.
  const asked = useRef<string | null>(null);
  useEffect(() => {
    if (open && initialQuestion && asked.current !== initialQuestion) {
      asked.current = initialQuestion;
      void send(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQuestion]);

  // The newest message stays in view while it streams.
  useLayoutEffect(() => {
    const element = list.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [conversation.turns.length, streaming, notice, chips]);

  const openLink = (link: SiteLink) => {
    if (link.kind === 'plus') {
      onOpenChange(false);
      onPlus(link.start);
    } else if (link.kind === 'page') {
      onOpenChange(false);
      onNavigate(link.href);
    } else {
      window.open(link.href, link.kind === 'mail' ? '_self' : '_blank', 'noopener');
    }
  };

  const lookAction = (id: string, where: 'develop' | 'install') => {
    if (memory.on) updateMemory(likeLook(memory, id));
    onOpenChange(false);
    onNavigate(`${LANGUAGE_PATHS[language]}${where}/?look=${encodeURIComponent(id)}`);
  };

  const lastAssistant = [...conversation.turns].reverse().find((turn) => turn.role === 'assistant');
  const empty = conversation.turns.length === 0 && streaming === null;
  const recent = view === 'menu' ? loadRecent(storage).filter((item) => item.id !== conversation.id) : [];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-chat-fade motion-reduce:animate-none sm:bg-transparent" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            input.current?.focus({ preventScroll: true });
          }}
          style={sheet}
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden bg-background text-foreground outline-none',
            // A phone: the whole screen, above the keyboard. A computer: a panel at the bottom right.
            'inset-x-0 top-0 h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
            'sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[min(640px,calc(100dvh-32px))] sm:w-[400px] sm:rounded-2xl sm:border sm:pt-0 sm:pb-0 sm:shadow-[0_24px_64px_rgba(0,0,0,0.28)] light:sm:shadow-[0_24px_64px_rgba(40,30,10,0.16)]',
            'data-[state=open]:animate-chat-in motion-reduce:animate-none',
          )}
        >
          {/* The header: the name, the insider pill for GRKU Plus, the options, and Close. */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b pr-2 pl-4">
            <Mark />
            <div className="flex min-w-0 flex-col justify-center gap-0.5">
              <DialogPrimitive.Title className="truncate text-[15px] leading-5 font-semibold">{c.title}</DialogPrimitive.Title>
              {tier === 'plus' && (
                <span className="inline-flex h-5 max-w-full items-center gap-1.5 self-start rounded-full border px-2 text-[11.5px] leading-none font-medium text-muted-foreground">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand-mark" aria-hidden="true" />
                  <span className="truncate">{c.badge}</span>
                </span>
              )}
            </div>
            <div className="ml-auto flex shrink-0 items-center">
              <IconButton label={view === 'menu' ? c.title : c.options} pressed={view === 'menu'} onClick={() => setView(view === 'menu' ? 'chat' : 'menu')}>
                <History />
              </IconButton>
              <IconButton label={c.newChat} onClick={newChat} disabled={empty}>
                <MessageSquarePlus />
              </IconButton>
              <DialogPrimitive.Close asChild>
                <IconButton label={c.close}>
                  <X />
                </IconButton>
              </DialogPrimitive.Close>
            </div>
          </header>

          {view === 'menu' ? (
            <ChatMenu
              c={c}
              recent={recent}
              memory={memory}
              looks={looks}
              confirmDelete={confirmDelete}
              onOpen={(item) => {
                persist(item);
                setView('chat');
              }}
              onMemory={(next) => {
                updateMemory(next);
                if (next.on && next.likes?.length) void loadLooks().then(setLooks);
              }}
              onAskDelete={() => setConfirmDelete(true)}
              onCancelDelete={() => setConfirmDelete(false)}
              onDelete={deleteAll}
            />
          ) : (
            <div ref={list} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite" aria-busy={busy} aria-relevant="additions">
              {empty ? (
                <div className="flex flex-col gap-4">
                  <Bubble role="assistant">
                    <p>{tier === 'plus' ? c.greetingPlus : c.greeting}</p>
                  </Bubble>
                  <Chips ids={['install', 'camera', 'warm', 'plus', 'safe', 'night']} c={c} onPick={(text) => void send(text)} disabled={busy} />
                </div>
              ) : (
                <ol className="flex flex-col gap-4">
                  {conversation.turns.map((turn, index) => (
                    <li key={`${turn.at}-${index}`}>
                      {turn.role === 'user' ? (
                        <Bubble role="user" label={c.you}>
                          <p className="whitespace-pre-wrap">{turn.content}</p>
                        </Bubble>
                      ) : (
                        <Answer
                          text={turn.content}
                          language={language}
                          c={c}
                          t={t}
                          looks={looks}
                          onLink={openLink}
                          onLook={lookAction}
                          copyable
                        />
                      )}
                    </li>
                  ))}
                  {streaming !== null && (
                    <li>
                      {streaming ? (
                        <Answer text={streaming} language={language} c={c} t={t} looks={looks} onLink={openLink} onLook={lookAction} streaming />
                      ) : (
                        <Bubble role="assistant" label={c.title}>
                          <Typing label={c.writing} />
                        </Bubble>
                      )}
                    </li>
                  )}
                </ol>
              )}
              {!busy && !empty && lastAssistant && (
                <div className="mt-3 pl-9">
                  {(() => {
                    const fromAnswer = parseReply(lastAssistant.content, language).chips;
                    const ids = chips.filter((id): id is ChipId => id in c.chips);
                    if (fromAnswer.length) return <Chips texts={fromAnswer} c={c} onPick={(text) => void send(text)} disabled={busy} />;
                    if (ids.length) return <Chips ids={ids} c={c} onPick={(text) => void send(text)} disabled={busy} />;
                    return <Chips texts={[c.explainMore]} c={c} onPick={(text) => void send(text)} disabled={busy} quiet />;
                  })()}
                </div>
              )}
              {notice && <NoticeLine notice={notice} c={c} tier={tier} onPlus={() => openLink({ kind: 'plus', start: 'tiers' })} onRetry={() => void send(draft)} onGuide={() => openLink({ kind: 'page', href: `${LANGUAGE_PATHS[language]}guide/`, path: '/guide/' })} />}
              {needHuman && SITEKEY && (
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-[13px] text-muted-foreground">{c.checking}</p>
                  <Turnstile
                    siteKey={SITEKEY}
                    action="grku-chat"
                    appearance="interaction-only"
                    className="min-h-0"
                    theme={document.documentElement.dataset.theme === 'light' ? 'light' : 'auto'}
                    language={TURNSTILE_LANGUAGES[language]}
                    resetKey={humanReset}
                    onToken={(token) => {
                      if (token) void startSession(token);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* The box: 16px text, so a phone does not zoom in; Enter sends, Shift+Enter adds a line. */}
          {view === 'chat' && (
            <form
              className="shrink-0 border-t px-3 pt-3 pb-2"
              onSubmit={(event) => {
                event.preventDefault();
                void send(draft);
              }}
            >
              <div className="flex items-end gap-2 rounded-xl border bg-card px-3 py-2 focus-within:border-foreground/40">
                <textarea
                  ref={input}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      void send(draft);
                    }
                  }}
                  rows={1}
                  maxLength={maxInput + 50}
                  placeholder={c.placeholder}
                  aria-label={c.placeholder}
                  disabled={notice?.kind === 'limit' || notice?.kind === 'closed'}
                  className="max-h-32 min-h-7 flex-1 resize-none bg-transparent py-0.5 text-base leading-6 outline-none [field-sizing:content] placeholder:text-muted-foreground disabled:opacity-50"
                />
                {busy ? (
                  <button type="button" onClick={() => abort.current?.abort()} className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground text-background" aria-label={c.stop}>
                    <Square className="size-3.5 fill-current" aria-hidden="true" />
                  </button>
                ) : (
                  <button type="submit" disabled={!draft.trim()} className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-brand-foreground transition-opacity disabled:opacity-30" aria-label={c.send}>
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3 px-1 text-[12px] text-muted-foreground">
                <span>
                  {c.mayBeWrong}{' '}
                  <a href={`${LANGUAGE_PATHS[language]}${DOC_PATHS.TERMS}`} className="underline underline-offset-2 hover:text-foreground">
                    {c.terms}
                  </a>
                </span>
                {remaining !== null && <span className="tabular-nums">{c.remaining(remaining)}</span>}
              </div>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * On a phone, the panel fits the visual viewport, so the box stays above the on-screen keyboard
 * (iOS Safari shrinks the visual viewport, not the layout one).
 */
function useSheetViewport(open: boolean): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!open || !viewport) return;
    const phone = window.matchMedia('(max-width: 639px)');
    const update = () => setStyle(phone.matches ? { height: `${viewport.height}px`, transform: `translateY(${viewport.offsetTop}px)` } : undefined);
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    phone.addEventListener('change', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      phone.removeEventListener('change', update);
    };
  }, [open]);
  return style;
}

/** The GRKU mark of the assistant: the G of the wordmark with its red dot. */
export function Mark({ className }: { className?: string }) {
  return (
    <span className={cn('relative grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-[13px] leading-none font-extrabold tracking-[-0.04em] text-background', className)} aria-hidden="true">
      G
      <span className="absolute right-[5px] bottom-[6px] size-[4px] rounded-full bg-brand-mark" />
    </span>
  );
}

function IconButton({ label, children, onClick, disabled, pressed }: { label: string; children: ReactNode; onClick?: () => void; disabled?: boolean; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn('grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 [&_svg]:size-[18px]', pressed && 'bg-accent text-foreground')}
    >
      {children}
    </button>
  );
}

function Bubble({ role, label, children }: { role: 'user' | 'assistant'; label?: string; children: ReactNode }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-3.5 py-2.5 text-[15px] leading-relaxed" aria-label={label}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <Mark className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 text-[15px] leading-relaxed" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

function Typing({ label }: { label: string }) {
  return (
    <span className="flex h-6 items-center gap-1" role="status" aria-label={label}>
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-pulse" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  );
}

function InlineParts({ parts, onLink }: { parts: Inline[]; onLink: (link: SiteLink) => void }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.kind === 'bold') return <strong key={index} className="font-semibold">{part.text}</strong>;
        if (part.kind === 'code') return <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[13px]">{part.text}</code>;
        if (part.kind === 'link')
          return (
            <a
              key={index}
              href={part.link.kind === 'plus' ? '#' : part.link.href}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                onLink(part.link);
              }}
              className="font-medium underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
            >
              {part.text}
            </a>
          );
        return <Fragment key={index}>{part.text}</Fragment>;
      })}
    </>
  );
}

function Blocks({ blocks, onLink }: { blocks: Block[]; onLink: (link: SiteLink) => void }) {
  return (
    <>
      {blocks.map((block, index) =>
        block.kind === 'paragraph' ? (
          <p key={index}>
            <InlineParts parts={block.parts} onLink={onLink} />
          </p>
        ) : block.ordered ? (
          <ol key={index} className="flex flex-col gap-1.5">
            {block.items.map((item, i) => (
              <li key={i} className="grid grid-cols-[20px_minmax(0,1fr)] gap-1.5">
                <span className="mt-[3px] grid size-5 place-items-center rounded-full bg-muted text-[11px] font-semibold tabular-nums">{i + 1}</span>
                <span>
                  <InlineParts parts={item} onLink={onLink} />
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <ul key={index} className="flex flex-col gap-1">
            {block.items.map((item, i) => (
              <li key={i} className="relative pl-4 before:absolute before:top-[0.7em] before:left-1 before:size-1 before:rounded-full before:bg-muted-foreground">
                <InlineParts parts={item} onLink={onLink} />
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

function Answer({
  text,
  language,
  c,
  t,
  looks,
  onLink,
  onLook,
  streaming,
  copyable,
}: {
  text: string;
  language: Language;
  c: ChatStrings;
  t: Strings;
  looks: Map<string, LookInfo> | null;
  onLink: (link: SiteLink) => void;
  onLook: (id: string, where: 'develop' | 'install') => void;
  streaming?: boolean;
  copyable?: boolean;
}) {
  const reply = useMemo(() => parseReply(text, language, looks ? resolver(looks) : (id) => id), [text, language, looks]);
  const [copied, setCopied] = useState(false);
  return (
    <Bubble role="assistant" label={c.title}>
      <Blocks blocks={reply.blocks} onLink={onLink} />
      {reply.looks.length > 0 && looks && <LookCards picks={reply.looks} looks={looks} c={c} t={t} onLook={onLook} />}
      {!streaming && reply.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {reply.links.map(({ text: label, link }) => (
            <button
              key={JSON.stringify(link)}
              type="button"
              onClick={() => onLink(link)}
              className="inline-flex h-9 items-center rounded-full border bg-card px-3.5 text-[13px] font-medium hover:border-foreground/40 hover:bg-accent"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {copyable && (
        <div className="-mt-1 flex">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(plainText(text)).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:size-3.5"
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? c.copied : c.copy}
          </button>
        </div>
      )}
    </Bubble>
  );
}

const KIND_LABEL: Record<string, (t: Strings) => string> = {
  negative: (t) => t.kindNegative,
  slide: (t) => t.kindSlide,
  mono: (t) => t.kindMono,
  cine: (t) => t.kindCine,
  instant: (t) => t.kindInstant,
  camera: (t) => t.kindCamera,
};

function LookCards({ picks, looks, c, t, onLook }: { picks: LookPick[]; looks: Map<string, LookInfo>; c: ChatStrings; t: Strings; onLook: (id: string, where: 'develop' | 'install') => void }) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 sm:-mx-0 sm:px-0">
      {picks.map((pick) => {
        const look = looks.get(pick.id);
        if (!look) return null;
        return (
          <li key={pick.id} className="flex w-[220px] shrink-0 snap-start flex-col gap-2 rounded-xl border bg-card p-3">
            <div className="flex items-center gap-3">
              <EffectIcon effect={{ id: look.id, icon: '', cover: look.cover }} className="size-12 [image-rendering:pixelated]" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{look.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  {look.brand && <BrandMark brand={look.brand} />}
                  <span className="truncate text-[12px] text-muted-foreground">{KIND_LABEL[look.kind]?.(t) ?? ''}</span>
                </div>
              </div>
            </div>
            {(pick.why || look.hint) && <p className="line-clamp-3 text-[13px] leading-snug text-muted-foreground">{pick.why || look.hint}</p>}
            <div className="mt-auto flex flex-col gap-1.5">
              <button type="button" onClick={() => onLook(look.id, 'develop')} className="h-9 rounded-lg border text-[13px] font-medium hover:bg-accent">
                {c.tryPhoto}
              </button>
              <button type="button" onClick={() => onLook(look.id, 'install')} className="h-9 rounded-lg bg-foreground text-[13px] font-medium text-background hover:bg-foreground/90">
                {c.putOnGr}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Chips({ ids, texts, c, onPick, disabled, quiet }: { ids?: ChipId[]; texts?: string[]; c: ChatStrings; onPick: (text: string) => void; disabled?: boolean; quiet?: boolean }) {
  const items = texts ?? (ids ?? []).map((id) => c.chips[id]);
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onPick(text)}
          className={cn(
            'inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-left text-[13px] leading-snug hover:border-foreground/40 hover:bg-accent disabled:opacity-50',
            quiet ? 'text-muted-foreground' : 'bg-card',
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function NoticeLine({ notice, c, tier, onPlus, onRetry, onGuide }: { notice: Notice; c: ChatStrings; tier: 'free' | 'plus'; onPlus: () => void; onRetry: () => void; onGuide: () => void }) {
  const box = 'mt-4 flex flex-col gap-2 rounded-xl border bg-card px-3.5 py-3 text-[14px] leading-snug';
  switch (notice.kind) {
    case 'limit':
      return (
        <div className={box} role="status">
          <p>{c.limitReached}</p>
          {tier === 'free' && (
            <>
              <p className="flex items-center gap-2 text-muted-foreground">
                <span className="size-1.5 shrink-0 rounded-full bg-brand-mark" aria-hidden="true" />
                {c.plusBenefit}
              </p>
              <button type="button" onClick={onPlus} className="self-start rounded-lg bg-brand px-3.5 py-2 text-[13px] font-medium text-brand-foreground hover:bg-brand/90">
                {c.plusButton}
              </button>
            </>
          )}
        </div>
      );
    case 'busy':
    case 'closed':
      return (
        <div className={box} role="status">
          <p>{notice.kind === 'busy' ? c.busy : c.unavailable}</p>
          <button type="button" onClick={onGuide} className="self-start rounded-full border px-3.5 py-1.5 text-[13px] font-medium hover:bg-accent">
            {c.openGuide}
          </button>
        </div>
      );
    case 'slow':
      return <p className="mt-4 text-[13px] text-muted-foreground" role="status">{c.slowDown}</p>;
    case 'cooldown':
      return <p className="mt-4 text-[13px] text-muted-foreground" role="status">{c.cooldown}</p>;
    case 'human':
      return <p className="mt-4 text-[13px] text-destructive" role="alert">{c.humanFailed}</p>;
    case 'tooLong':
      return <p className="mt-4 text-[13px] text-destructive" role="alert">{c.tooLong(notice.max)}</p>;
    case 'error':
      return (
        <div className="mt-4 flex items-center gap-3 text-[13px]" role="alert">
          <span className="text-destructive">{c.error}</span>
          {notice.retry && (
            <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">
              {c.retry}
            </button>
          )}
        </div>
      );
  }
}

function ChatMenu({
  c,
  recent,
  memory,
  looks,
  confirmDelete,
  onOpen,
  onMemory,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  c: ChatStrings;
  recent: Conversation[];
  memory: Memory;
  looks: Map<string, LookInfo> | null;
  confirmDelete: boolean;
  onOpen: (conversation: Conversation) => void;
  onMemory: (memory: Memory) => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const section = 'flex flex-col gap-2 border-b py-4 last:border-b-0';
  const heading = 'text-[13px] font-semibold text-muted-foreground';
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4">
      <section className={section}>
        <h3 className={heading}>{c.recent}</h3>
        {recent.length === 0 ? (
          <p className="text-[14px] text-muted-foreground">{c.memoryEmpty}</p>
        ) : (
          <ul className="flex flex-col">
            {recent.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => onOpen(item)} className="flex h-11 w-full items-center rounded-lg px-2 text-left text-[14px] hover:bg-accent">
                  <span className="truncate">{titleOf(item)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={section}>
        <h3 className={heading}>{c.memoryTitle}</h3>
        <label className="flex items-start gap-3 text-[14px]">
          <input type="checkbox" checked={memory.on} onChange={(event) => onMemory(event.target.checked ? { on: true } : { on: false })} className="mt-1 size-4 accent-[var(--brand)]" />
          <span>
            {c.memoryToggle}
            <span className="mt-0.5 block text-[12px] text-muted-foreground">{c.memoryNote}</span>
          </span>
        </label>
        {memory.on && (
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 pl-7 text-[14px]">
            <dt className="text-muted-foreground">{c.memoryCamera}</dt>
            <dd>{memory.camera ?? '—'}</dd>
            <dt className="text-muted-foreground">{c.memoryFirmware}</dt>
            <dd>{memory.firmware ?? '—'}</dd>
            <dt className="text-muted-foreground">{c.memoryLooks}</dt>
            <dd>{memory.likes?.length ? memory.likes.map((id) => looks?.get(id)?.name ?? id).join(', ') : '—'}</dd>
          </dl>
        )}
        {memory.on && (memory.camera || memory.firmware || memory.likes?.length) && (
          <button type="button" onClick={() => onMemory({ on: true })} className="ml-7 self-start text-[13px] underline underline-offset-2">
            {c.memoryClear}
          </button>
        )}
      </section>
      <section className={section}>
        {confirmDelete ? (
          <div className="flex flex-col gap-2">
            <p className="text-[14px]">{c.deleteConfirm}</p>
            <div className="flex gap-2">
              <button type="button" onClick={onDelete} className="rounded-lg bg-destructive px-3.5 py-2 text-[13px] font-medium text-white">
                {c.deleteYes}
              </button>
              <button type="button" onClick={onCancelDelete} className="rounded-lg border px-3.5 py-2 text-[13px] font-medium">
                {c.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={onAskDelete} className="inline-flex h-10 items-center gap-2 self-start rounded-lg px-2 text-[14px] text-destructive hover:bg-accent [&_svg]:size-4">
            <Trash2 aria-hidden="true" />
            {c.deleteAll}
          </button>
        )}
      </section>
    </div>
  );
}
