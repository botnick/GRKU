// The user manual (/docs/): its home page with the search and the tasks, and each doc with the
// sidebar (a menu that folds on a phone), the sections of the page, the previous and next docs, and
// "Ask AI about this page". After the docs of GRKit (MIT, github.com/ahonn/GRKit); the text is
// GRKU's own (docs/content/).
import { use, useEffect, useId, useState, type FormEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, LifeBuoy, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CAMERAS } from '../cameras';
import { parseInline, plusTarget, targetUrl } from '../docs/inline';
import { DOCS, loadDocs } from '../docs/load';
import { DOC_GROUPS, DOC_PAGES, docSlug, type DocSlug, type DocsSitePage } from '../docs/pages';
import { searchDocs } from '../docs/search';
import { settingRows } from '../docs/settingsTable';
import type { DocBlock, DocsContent, Inline } from '../docs/types';
import { siteUrl } from '../catalog';
import { guideLines, type LandingGuide } from '../landing';
import { showLanguage, type Language } from '../i18n';
import { pathPage } from '../languagePage';
import type { PageLink } from '../navigation';
import { CameraBackArt, ComputerArt, CopyArt, InsertArt } from './GuideArt';
import { MODULE_SETTINGS } from '../docs/moduleSettings.generated';
import { cameraLanguage } from '../docs/settingsTable';
import type { DocSlug as Slug } from '../docs/pages';

/** The address of a camera screen or a photo of the manual at a width. */
const docsImage = (name: string, width: number) => siteUrl(`docs/${name}-${width}.webp`);

/** The photo of the Framing, Crop, and Guides previews: a GR IV photo in the Standard look, without settings. */
const FRAME_PHOTO = 'render-chairs-standard';

/** A promise that `use` reads at once when it has settled (React reads `status` and `value`). */
type Tracked<T> = Promise<T> & { status?: 'fulfilled'; value?: T };
const pending: Partial<Record<Language, Tracked<DocsContent>>> = {};

/** The manual of `language`: at once when it is loaded (always in the prerender), else it suspends. */
function useDocs(language: Language): DocsContent {
  const ready = DOCS[language];
  if (ready) return ready;
  const promise = (pending[language] ??= loadDocs(language).then(
    (content) => {
      promise.status = 'fulfilled';
      promise.value = content;
      return content;
    },
    (error: unknown) => {
      // A failed download (a new deploy, a lost connection) can try again on the next render.
      delete pending[language];
      throw error;
    },
  ) as Tracked<DocsContent>);
  return use(promise as Promise<DocsContent>);
}

export interface DocsProps {
  language: Language;
  page: DocsSitePage;
  link: PageLink;
  /** Opens GRKU Plus on its plans or on "I have a key". */
  onPlus: (start: 'tiers' | 'key') => void;
  /** Opens the assistant with a first question and the page as its context. */
  onAsk: (question: string) => void;
}

interface Ctx {
  content: DocsContent;
  language: Language;
  link: PageLink;
  onPlus: DocsProps['onPlus'];
}

/** A link of the manual text: a page of the site opens in place, GRKU Plus opens its sheet. */
function TextLink({ target, children, ctx }: { target: string; children: ReactNode; ctx: Ctx }) {
  const plus = plusTarget(target);
  const href = targetUrl(target, ctx.language);
  const className = 'font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-brand';
  if (plus) {
    return (
      <a
        href={href ?? '#'}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          ctx.onPlus(plus);
        }}
      >
        {children}
      </a>
    );
  }
  if (!href) return <>{children}</>;
  if (href.startsWith('/')) {
    const url = new URL(href, 'https://grku.app');
    const page = pathPage(url.pathname);
    if (page) {
      return (
        <a {...ctx.link(page, url.hash)} className={className}>
          {children}
        </a>
      );
    }
  }
  const external = href.startsWith('https://');
  return (
    <a href={href} className={className} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>
      {children}
    </a>
  );
}

function Text({ text, ctx }: { text: Inline; ctx: Ctx }) {
  return parseInline(text).map((part, index) => {
    switch (part.kind) {
      case 'code':
        return (
          <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.88em] break-words">
            {part.text}
          </code>
        );
      case 'bold':
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.text}
          </strong>
        );
      case 'key':
        return (
          <kbd key={index} className="mx-0.5 inline-flex min-w-6 items-center justify-center rounded-md border border-b-2 border-border bg-card px-1.5 font-mono text-[0.82em] font-semibold text-foreground">
            {part.text}
          </kbd>
        );
      case 'link':
        return (
          <TextLink key={index} target={part.target} ctx={ctx}>
            {part.text}
          </TextLink>
        );
      default:
        return <span key={index}>{part.text}</span>;
    }
  });
}

/** The search of the manual, with its result list. `/` moves the focus to it. */
function DocsSearch({ ctx, large, onAsk }: { ctx: Ctx; large?: boolean; onAsk: (question: string) => void }) {
  const { content, link } = ctx;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const t = content.ui;
  const results = searchDocs(content, query);
  const showList = open && query.trim() !== '';
  useEffect(() => {
    if (!large) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      const { target } = event;
      if (event.key !== '/' || (target instanceof Element && target.closest('input, select, textarea, [contenteditable]'))) return;
      event.preventDefault();
      document.getElementById(`${listId}-input`)?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [large, listId]);

  const go = (index: number) => {
    const result = results[index];
    if (!result) return;
    setOpen(false);
    setQuery('');
    const target = link(`docs/${result.slug}`, result.section ? `#${result.section.id}` : '');
    target.onClick({ defaultPrevented: false, button: 0, preventDefault() {} } as unknown as MouseEvent<HTMLAnchorElement>);
  };

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setQuery('');
      setActive(0);
    } else if (results.length > 0 && event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((active + 1) % results.length);
    } else if (results.length > 0 && event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((active - 1 + results.length) % results.length);
    }
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <form
        role="search"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          go(active);
        }}
        className={cn('flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-foreground/40 focus-within:ring-[3px] focus-within:ring-ring/30', large ? 'h-12' : 'h-10')}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results.length > 0 ? `${listId}-${active}` : undefined}
          aria-label={t.searchLabel}
          placeholder={large ? t.searchHome : t.searchShort}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn('min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground', large ? 'text-[16px]' : 'text-[15px]')}
        />
        {large && <kbd className="hidden rounded border border-border px-1.5 font-mono text-[11px] text-muted-foreground sm:inline">/</kbd>}
      </form>
      {showList && (
        <ul id={listId} role="listbox" aria-label={t.searchLabel} className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-[60vh] list-none overflow-auto rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg">
          {results.map((result, index) => (
            <li key={result.slug} id={`${listId}-${index}`} role="option" aria-selected={index === active}>
              <a
                {...link(`docs/${result.slug}`, result.section ? `#${result.section.id}` : '')}
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  setOpen(false);
                  setQuery('');
                  link(`docs/${result.slug}`, result.section ? `#${result.section.id}` : '').onClick(event);
                }}
                className={cn('flex flex-col rounded-lg px-3 py-2 no-underline', index === active ? 'bg-accent' : 'hover:bg-accent')}
              >
                <span className="text-[15px] font-medium">{result.title}</span>
                <small className="text-[12px] text-muted-foreground">
                  {result.group}
                  {result.section && ` › ${result.section.text}`}
                </small>
              </a>
            </li>
          ))}
          {results.length === 0 && (
            <li role="presentation" className="px-3 py-2 text-[14px] text-muted-foreground">
              {t.noResults}{' '}
              <button type="button" className="font-medium text-foreground underline underline-offset-4" onClick={() => onAsk(query)}>
                {t.askInstead}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

const MASKS = [
  { boxShadow: '0 0 0 2000px rgb(0 0 0 / 0.55)' },
  { boxShadow: '0 0 0 2000px #000' },
  { outline: '2px solid #fff', outlineOffset: '-2px' },
] as const;
// The ratios in the order of the camera (runtime/framing_ratios.h: FRAMING_RATIO_ROWS), from the widest.
const RATIOS = ['XPan 65:24', '2.35:1', '16:9', '4:3', '5:4', '7:6', '1:1', '3:4'].map((label) => {
  const [w, h] = label.replace('XPan ', '').split(':').map(Number) as [number, number];
  return { label, ratio: w / h };
});
/** Crop of GR III and GR IV: the 28 mm lens, cropped to each focal length. */
const FOCALS = [35, 40, 50, 70];
const GUIDES: readonly LandingGuide[] = ['thirds', 'center', 'golden', 'diagonals'];

function Chips({ label, items, active, onPick }: { label: string; items: readonly string[]; active: number; onPick: (index: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <button
            key={item}
            type="button"
            aria-pressed={index === active}
            onClick={() => onPick(index)}
            className={cn('h-8 rounded-full border px-3 text-[13px] font-medium transition-colors', index === active ? 'border-foreground bg-foreground text-background' : 'border-input hover:border-foreground/40')}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Framing, Crop, or Guides over a photo of GRKU, with their choices to try. */
function Frame({ block, ctx }: { block: Extract<DocBlock, { kind: 'frame' }>; ctx: Ctx }) {
  const t = ctx.content.ui;
  const [choice, setChoice] = useState(0);
  const [mask, setMask] = useState(0);
  let area: { width: string; height: string } | null = null;
  let tag = '';
  if (block.mode === 'framing') {
    const ratio = RATIOS[choice]!;
    area = { width: `${ratio.ratio >= 1.5 ? 100 : (ratio.ratio / 1.5) * 100}%`, height: `${ratio.ratio >= 1.5 ? (1.5 / ratio.ratio) * 100 : 100}%` };
    tag = ratio.label;
  } else if (block.mode === 'crop') {
    const scale = (28 / FOCALS[choice]!) * 100;
    area = { width: `${scale}%`, height: `${scale}%` };
    tag = `${FOCALS[choice]}mm`;
  }
  const lines = block.mode === 'guides' ? guideLines(GUIDES[choice]!) : [];
  return (
    <figure className="my-6">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl border bg-black">
        <img src={docsImage(FRAME_PHOTO, 1200)} srcSet={`${docsImage(FRAME_PHOTO, 600)} 600w, ${docsImage(FRAME_PHOTO, 1200)} 1200w`} sizes="(min-width: 1024px) 720px, 100vw" alt={block.alt} width={1200} height={800} loading="lazy" className="block size-full object-cover" />
        {area && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-200" style={{ ...area, ...MASKS[mask] }} />}
        {lines.length > 0 && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
            {lines.map(([x1, y1, x2, y2], index) => (
              <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeOpacity="0.85" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        )}
        {tag && <span className="absolute top-2 left-2 rounded-md bg-black/65 px-2 py-0.5 font-mono text-[12px] text-white">{tag}</span>}
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
        {block.mode === 'framing' && <Chips label={t.ratio} items={RATIOS.map((ratio) => ratio.label)} active={choice} onPick={setChoice} />}
        {block.mode === 'crop' && <Chips label={t.focal} items={FOCALS.map((focal) => `${focal}mm`)} active={choice} onPick={setChoice} />}
        {block.mode === 'guides' && <Chips label={t.style} items={t.guides} active={choice} onPick={setChoice} />}
        {block.mode !== 'guides' && <Chips label={t.mask} items={t.masks} active={mask} onPick={setMask} />}
      </figcaption>
    </figure>
  );
}

/** The page of each module, with its real tile and its name on the camera. */
const MODULE_PAGES: Readonly<Record<string, Slug>> = { recipes: 'recipes', 'film-look': 'film-look', framing: 'framing', crop: 'crop', guides: 'guides', date: 'date', glow: 'glow', lightleak: 'light-leak', diffusion: 'diffusion', grain: 'grain', border: 'border' };
function ModuleGrid({ ctx }: { ctx: Ctx }) {
  const code = cameraLanguage(ctx.language);
  const order = Object.keys(MODULE_PAGES);
  const modules = [...MODULE_SETTINGS].sort((a, b) => order.indexOf(a.dir) - order.indexOf(b.dir));
  return (
    <ul className="my-6 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
      {modules.map((module) => (
        <li key={module.dir}>
          <a {...ctx.link(`docs/${MODULE_PAGES[module.dir]!}`)} className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 no-underline hover:border-input hover:bg-accent/50">
            <img src={siteUrl(`docs/tiles/${module.dir}.png`)} alt="" width={40} height={40} className="size-10 shrink-0 rounded-md bg-black [image-rendering:pixelated]" />
            <span className="text-[14px] font-semibold">{module.title[code] ?? module.title.en}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The same photo without and with one setting, side by side. */
function Compare({ block, ctx }: { block: Extract<DocBlock, { kind: 'compare' }>; ctx: Ctx }) {
  const image = (name: string) => {
    const crop = name.endsWith('-crop');
    const large = crop ? 900 : 1200;
    return { src: docsImage(`render-${name}`, large), srcSet: `${docsImage(`render-${name}`, 600)} 600w, ${docsImage(`render-${name}`, large)} ${large}w`, sizes: '(min-width: 1024px) 360px, 50vw' };
  };
  return (
    <figure className="my-6">
      <div className="grid grid-cols-2 gap-2">
        {([[block.before, ctx.content.ui.withoutLabel], [block.after, block.label]] as const).map(([name, caption], index) => (
          <div key={index} className="relative overflow-hidden rounded-xl border bg-muted">
            <img {...image(name)} alt={index === 1 ? block.alt : ''} loading="lazy" className="block h-auto w-full" />
            <span className={cn('absolute bottom-2 left-2 rounded-md px-2 py-0.5 text-[12px] font-medium', index === 1 ? 'bg-brand text-brand-foreground' : 'bg-black/65 text-white')}>{caption}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{block.alt}</figcaption>
    </figure>
  );
}

/** The top level of the SD card, as a tree in the look of the site. */
function CardTree({ block }: { block: Extract<DocBlock, { kind: 'card' }> }) {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border bg-card" aria-label={block.alt}>
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5 font-mono text-[13px] font-semibold">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true"><path d="M6 2h9l5 5v15H6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="17" cy="18" r="1.6" fill="#d94135" /></svg>
        SD
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {block.items.map(([name, about]) => {
          const folder = !name.includes('.');
          return (
            <li key={name} className="flex flex-col gap-0.5 border-b px-4 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
              <code className="flex shrink-0 items-center gap-2 font-mono text-[13px] font-semibold sm:w-[11em]">
                <span aria-hidden="true" className={folder ? 'text-brand-text' : 'text-muted-foreground'}>{folder ? '▸' : '·'}</span>
                {name}
                {folder && '/'}
              </code>
              <span className="text-[14px] leading-relaxed text-muted-foreground">{about}</span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/** The settings of a module as the camera shows them, from the code, with what each does. */
function SettingsTable({ block, ctx }: { block: Extract<DocBlock, { kind: 'settings' }>; ctx: Ctx }) {
  const t = ctx.content.ui;
  const rows = settingRows(block.module, ctx.language) ?? [];
  return (
    <div className="my-6 overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-[15px]">
        <thead className="bg-muted/60 text-[13px] text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.settingCol}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.choicesCol}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t align-top">
              <td className="min-w-[8.5em] px-4 py-3 font-semibold">{row.name}</td>
              <td className="px-4 py-3 leading-relaxed">
                <span className="flex flex-wrap gap-1.5">
                  {row.values.map((value, index) => (
                    <span key={index} className={cn('rounded-md border px-1.5 py-0.5 font-mono text-[12.5px]', index === row.default ? 'border-foreground/60 bg-accent font-semibold' : 'border-border text-muted-foreground')}>
                      {value}
                      {index === row.default && <span className="ml-1 font-sans text-[11px] font-normal text-muted-foreground">({t.defaultMark})</span>}
                    </span>
                  ))}
                </span>
                {block.notes[row.key] && (
                  <span className="mt-1.5 block text-foreground/85">
                    <Text text={block.notes[row.key]!} ctx={ctx} />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CameraTable({ ctx }: { ctx: Ctx }) {
  const t = ctx.content.ui;
  return (
    <div className="my-6 overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-[14px]">
        <thead className="bg-muted/60 text-[13px] text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.camera}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.firmware}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.modeset}</th>
          </tr>
        </thead>
        <tbody>
          {CAMERAS.filter((camera) => camera.support).map((camera) => (
            <tr key={camera.key} className="border-t">
              <td className="px-4 py-2.5 font-medium">{camera.name}</td>
              <td className="px-4 py-2.5 font-mono text-[13px]">{camera.support!.firmware}</td>
              <td className="px-4 py-2.5 font-mono text-[13px]">{camera.support!.modeset}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The pose of the GRKU mascot (public/mascot) beside each kind of note. */
const MASCOT = { plain: 'think-1', tip: 'point-0', warning: 'oops-0' } as const;

const NOTE_TONES = {
  plain: 'border-border bg-muted/40',
  tip: 'border-emerald-600/30 bg-emerald-600/5',
  warning: 'border-brand/45 bg-brand/5',
} as const;

function Block({ block, ctx }: { block: DocBlock; ctx: Ctx }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="my-4 text-[16px] leading-[1.75] text-foreground/90">
          <Text text={block.text} ctx={ctx} />
        </p>
      );
    case 'h2':
      return (
        <h2 id={block.id} className="group mt-12 mb-3 scroll-mt-28 text-[22px] leading-snug font-semibold tracking-[-0.01em] md:scroll-mt-20">
          {block.text}
          <a href={`#${block.id}`} className="ml-2 text-muted-foreground no-underline opacity-0 group-hover:opacity-100 focus:opacity-100" aria-hidden="true" tabIndex={-1}>
            #
          </a>
        </h2>
      );
    case 'steps':
      return (
        <ol className="my-5 flex list-none flex-col gap-3 p-0">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-semibold text-brand-foreground">{index + 1}</span>
              <span className="min-w-0 pt-0.5 text-[16px] leading-[1.7]">
                <Text text={item} ctx={ctx} />
              </span>
            </li>
          ))}
        </ol>
      );
    case 'list':
      return (
        <ul className="my-4 flex list-disc flex-col gap-2 pl-5 text-[16px] leading-[1.7] marker:text-brand">
          {block.items.map((item, index) => (
            <li key={index}>
              <Text text={item} ctx={ctx} />
            </li>
          ))}
        </ul>
      );
    case 'note':
      return (
        <aside className={cn('my-6 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-[15px] leading-relaxed', NOTE_TONES[block.tone])}>
          <img src={siteUrl(`mascot/${MASCOT[block.tone]}-144.webp`)} alt="" width={48} height={48} loading="lazy" className="size-12 shrink-0 object-contain" />
          <span className="min-w-0">
            <strong className="block font-semibold">{block.title}</strong>
            <span className="mt-1 block text-foreground/85">
              <Text text={block.text} ctx={ctx} />
            </span>
          </span>
        </aside>
      );
    case 'path':
      return (
        <p className="my-4 flex flex-wrap items-center gap-1.5 font-mono text-[13px]">
          {block.items.map((item, index) => (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-muted-foreground">
                  ›
                </span>
              )}
              <span className="rounded-md border bg-card px-2 py-0.5 font-semibold">{item}</span>
            </span>
          ))}
        </p>
      );
    case 'table':
      return (
        <div className="my-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-muted/60 text-[13px] text-muted-foreground">
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="px-4 py-2.5 font-medium whitespace-nowrap">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t align-top">
                  {row.map((cell, index) => (
                    <td key={index} className={cn('px-4 py-3 leading-relaxed', index === 0 && 'min-w-[8.5em]')}>
                      <Text text={cell} ctx={ctx} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'files':
      return (
        <ul className="my-5 flex list-none flex-col gap-2 p-0">
          {block.items.map(([path, about]) => (
            <li key={path} className="flex flex-col gap-0.5 rounded-xl border px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4">
              <code className="font-mono text-[13px] font-semibold break-all">{path}</code>
              <span className="text-[14px] text-muted-foreground">{about}</span>
            </li>
          ))}
        </ul>
      );
    case 'screen': {
      // The screens are captures of a camera in English, the menu language of a Thai reader too.
      const name = `screen-${block.screen}.en`;
      return (
        <figure className="my-6">
          <img src={docsImage(name, 720)} srcSet={`${docsImage(name, 720)} 720w, ${docsImage(name, 1080)} 1080w`} sizes="(min-width: 768px) 560px, 100vw" alt={block.alt} width={720} height={480} loading="lazy" className={cn("block h-auto w-full max-w-[560px] rounded-xl", block.screen !== "modeset-back" && "border-[6px] border-[#1c1c1e] bg-black shadow-sm")} />
          <figcaption className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-muted-foreground">
            <span className="mr-1.5 rounded border px-1.5 py-0.5 text-[11px] font-medium">{{ photo: ctx.content.ui.photoBadge, capture: ctx.content.ui.captureBadge, drawn: ctx.content.ui.drawnBadge }[block.source]}</span>
            {block.alt}
          </figcaption>
        </figure>
      );
    }
    case 'compare':
      return <Compare block={block} ctx={ctx} />;
    case 'card':
      return <CardTree block={block} />;
    case 'frame':
      return <Frame block={block} ctx={ctx} />;
    case 'camera':
      return (
        <figure className="my-6 max-w-[460px] rounded-xl border bg-art p-4">
          <CameraBackArt screen={block.screen} press={block.press} />
          <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{block.alt}</figcaption>
        </figure>
      );
    case 'cameras':
      return <CameraTable ctx={ctx} />;
    case 'settings':
      return <SettingsTable block={block} ctx={ctx} />;
    case 'art': {
      const Art = { computer: ComputerArt, copy: CopyArt, insert: InsertArt }[block.art];
      return (
        <figure className="my-6 max-w-[520px] rounded-xl border bg-art p-4">
          <Art />
          <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{block.alt}</figcaption>
        </figure>
      );
    }
    case 'modules':
      return <ModuleGrid ctx={ctx} />;
    case 'flow':
      return (
        <ol className="my-6 flex list-none flex-col gap-2 p-0">
          {block.steps.map((step, index) => (
            <li key={index} className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <span className="text-[15px] leading-snug"><Text text={step.see} ctx={ctx} /></span>
              <span aria-hidden="true" className="hidden text-brand-text sm:block">→</span>
              <span className="rounded-lg bg-brand/5 px-3 py-2 text-[15px] leading-snug font-medium"><Text text={step.then} ctx={ctx} /></span>
            </li>
          ))}
        </ol>
      );
  }
}

function AskButton({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('inline-flex h-9 items-center gap-2 rounded-full border border-input bg-card px-4 text-[14px] font-medium text-foreground shadow-xs transition-colors hover:border-foreground/40 hover:bg-accent', className)}
    >
      <Sparkles className="size-4 text-brand-text" aria-hidden="true" />
      {label}
    </button>
  );
}

function DocsHome({ ctx, onAsk }: { ctx: Ctx; onAsk: (question: string) => void }) {
  const { content, link } = ctx;
  const t = content.home;
  return (
    <div className="pb-8">
      <section className="grid items-start gap-x-14 gap-y-8 pt-[clamp(28px,6vh,64px)] pb-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0">
          <h1 className="text-[clamp(34px,4vw,52px)] leading-[1.08] font-bold tracking-[-0.025em] text-balance [:root[lang=th]_&]:leading-[1.25] [:root[lang=th]_&]:tracking-normal">{t.title}</h1>
          <p className="mt-4 max-w-[34em] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-muted-foreground">{t.lead}</p>
          <div className="mt-6 max-w-[560px]">
            <DocsSearch ctx={ctx} large onAsk={onAsk} />
          </div>
          <p className="mt-4 flex items-center gap-2 text-[14px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {t.trust}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <nav aria-label={t.need} className="rounded-2xl border bg-card p-2">
            <p className="px-3 pt-2 pb-1 text-[13px] font-medium text-muted-foreground">{t.need}</p>
            {t.tasks.map((task) => (
              <a key={task.slug} {...link(`docs/${task.slug}`)} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 no-underline hover:bg-accent">
                <span className="text-[15px] font-medium">{task.label}</span>
                <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  {task.hint}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </a>
            ))}
          </nav>
          <a {...link('docs/stuck')} className="flex items-center gap-3 rounded-2xl border border-brand/45 bg-brand/5 px-4 py-3 no-underline hover:bg-brand/10">
            <LifeBuoy className="size-5 shrink-0 text-brand-text" aria-hidden="true" />
            <span className="flex-1 text-[15px] font-medium">{t.rescue}</span>
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </a>
        </div>
      </section>
      <h2 className="border-t pt-10 text-[13px] font-medium tracking-wide text-muted-foreground">{t.all}</h2>
      <div className="mt-4 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {DOC_GROUPS.map((group) => (
          <section key={group}>
            <h3 className="text-[15px] font-semibold">{content.groups[group]}</h3>
            <ul className="mt-2 flex list-none flex-col gap-1 p-0">
              {DOC_PAGES.filter((page) => page.group === group).map((page) => (
                <li key={page.slug}>
                  <a {...link(`docs/${page.slug}`)} className="text-[15px] leading-relaxed text-muted-foreground no-underline hover:text-foreground">
                    {content.pages[page.slug].title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-12 border-t pt-6 text-[13px] text-muted-foreground">
        <Text text={t.credit} ctx={ctx} />
      </p>
    </div>
  );
}

function DocsNav({ ctx, slug, onAsk }: { ctx: Ctx; slug: DocSlug; onAsk: (question: string) => void }) {
  const { content, link } = ctx;
  const [open, setOpen] = useState(false);
  // A move to another doc folds the menu of the phone again.
  useEffect(() => setOpen(false), [slug]);
  return (
    <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-6">
      <div className="mb-3">
        <DocsSearch ctx={ctx} onAsk={onAsk} />
      </div>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-xl border px-3 text-[14px] font-medium lg:hidden"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {content.ui.browse}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <nav className={cn('mt-2 lg:mt-0 lg:block', open ? 'block' : 'hidden')} aria-label={content.ui.docs}>
        {DOC_GROUPS.map((group) => (
          <div key={group} className="mt-4 first:mt-1">
            <h2 className="px-3 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">{content.groups[group]}</h2>
            <ul className="mt-1 flex list-none flex-col p-0">
              {DOC_PAGES.filter((page) => page.group === group).map((page) => (
                <li key={page.slug}>
                  <a
                    {...link(`docs/${page.slug}`)}
                    aria-current={page.slug === slug ? 'page' : undefined}
                    className={cn(
                      'block rounded-lg px-3 py-1.5 text-[14px] leading-snug no-underline',
                      page.slug === slug ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    )}
                  >
                    {content.pages[page.slug].title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

function DocArticle({ ctx, slug, onAsk }: { ctx: Ctx; slug: DocSlug; onAsk: (question: string) => void }) {
  const { content, link } = ctx;
  const index = DOC_PAGES.findIndex((page) => page.slug === slug);
  const { group } = DOC_PAGES[index]!;
  const page = content.pages[slug];
  const previous = DOC_PAGES[index - 1];
  const next = DOC_PAGES[index + 1];
  const sections = page.blocks.filter((block): block is Extract<DocBlock, { kind: 'h2' }> => block.kind === 'h2');
  const ask = () => onAsk(content.ui.askPrompt.replace('${title}', page.title));
  return (
    <div className="grid gap-x-12 gap-y-6 pt-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_200px]">
      <DocsNav ctx={ctx} slug={slug} onAsk={onAsk} />
      <article className="min-w-0 max-w-[720px] pb-8">
        <p className="text-[13px] text-muted-foreground">
          <a {...link('docs')} className="no-underline hover:text-foreground">
            {content.ui.docs}
          </a>{' '}
          / {content.groups[group]}
        </p>
        <h1 className="mt-2 text-[clamp(30px,3.4vw,40px)] leading-[1.12] font-bold tracking-[-0.02em] text-balance [:root[lang=th]_&]:leading-[1.3] [:root[lang=th]_&]:tracking-normal">{page.title}</h1>
        <p className="mt-3 text-[18px] leading-relaxed text-muted-foreground">{page.lead}</p>
        {typeof __DOCS_UPDATED__ === 'string' && (
          <p className="mt-2 text-[13px] text-muted-foreground">
            {content.ui.updated} <time dateTime={__DOCS_UPDATED__}>{__DOCS_UPDATED__}</time>
          </p>
        )}
        <AskButton label={content.ui.askAi} onClick={ask} className="mt-5" />
        {sections.length > 1 && (
          <nav aria-label={content.ui.onThisPage} className="mt-6 xl:hidden">
            <ol className="flex list-none flex-wrap gap-2 p-0">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="inline-flex rounded-full border px-3 py-1 text-[13px] text-muted-foreground no-underline hover:border-input hover:text-foreground">
                    {section.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="mt-6">
          {page.blocks.map((block, blockIndex) => (
            <Block key={blockIndex} block={block} ctx={ctx} />
          ))}
        </div>
        <aside className="mt-12 flex flex-col gap-3 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold">{content.ui.stuck}</p>
            <p className="mt-0.5 text-[14px] text-muted-foreground">{content.ui.askAiText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AskButton label={content.ui.askAi} onClick={ask} />
            <TextLink target="support" ctx={ctx}>
              {content.ui.report}
            </TextLink>
          </div>
        </aside>
        <nav className="mt-8 grid grid-cols-2 gap-3" aria-label={`${content.ui.previous} / ${content.ui.next}`}>
          {previous ? (
            <a {...link(`docs/${previous.slug}`)} className="flex flex-col gap-0.5 rounded-xl border px-4 py-3 no-underline hover:border-input hover:bg-accent/50">
              <small className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <ArrowLeft className="size-3" aria-hidden="true" />
                {content.ui.previous}
              </small>
              <span className="text-[15px] font-medium">{content.pages[previous.slug].title}</span>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a {...link(`docs/${next.slug}`)} className="flex flex-col items-end gap-0.5 rounded-xl border px-4 py-3 text-right no-underline hover:border-input hover:bg-accent/50">
              <small className="flex items-center gap-1 text-[12px] text-muted-foreground">
                {content.ui.next}
                <ArrowRight className="size-3" aria-hidden="true" />
              </small>
              <span className="text-[15px] font-medium">{content.pages[next.slug].title}</span>
            </a>
          ) : (
            <span />
          )}
        </nav>
      </article>
      {sections.length > 1 && (
        <nav aria-label={content.ui.onThisPage} className="hidden xl:block">
          <div className="sticky top-20">
            <p className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">{content.ui.onThisPage}</p>
            <ol className="mt-2 flex list-none flex-col gap-1.5 border-l p-0 pl-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-[13px] leading-snug text-muted-foreground no-underline hover:text-foreground">
                    {section.text}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}
    </div>
  );
}

/** The manual home and each doc (`/docs/` under each language page). */
export function DocsPage({ language, page, link, onPlus, onAsk }: DocsProps) {
  const content = useDocs(language);
  const slug = docSlug(page);
  const ctx: Ctx = { content, language, link, onPlus };
  // The title of the tab: the text of the manual may arrive after the page showed.
  useEffect(() => showLanguage(language, page), [language, page, content]);
  return slug ? <DocArticle ctx={ctx} slug={slug} onAsk={onAsk} /> : <DocsHome ctx={ctx} onAsk={onAsk} />;
}
