import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LANGUAGES, type Language, type Strings } from '../i18n';
import { REPOSITORY } from '../links';
import { newsStrings } from '../whatsNew';
import type { SitePage } from '../languagePage';
import type { PageLink } from '../navigation';
import { cn } from '@/lib/utils';

/** The version whose news this browser opened (the dot on the version goes). */
const SEEN_KEY = 'grku.seenNews';

/**
 * The header: the wordmark with its red period and the version, the links to the three pages, the
 * language, and the repository. It stays at the top while the page scrolls. On a phone the page
 * links take a row of their own under it.
 */
export function Masthead({
  strings: t,
  language,
  onLanguage,
  version,
  releaseUrl,
  page,
  link,
  installStep,
}: {
  strings: Strings;
  /** The step of the install that Install opens: the last one the visitor saw. */
  installStep: SitePage;
  /** The page that shows. */
  page: SitePage;
  link: PageLink;
  language: Language;
  onLanguage: (language: Language) => void;
  version: string;
  releaseUrl: string;
}) {
  // A red dot on the version until this browser opened the news of this version.
  const [unseen, setUnseen] = useState(false);
  useEffect(() => {
    try {
      setUnseen(localStorage.getItem(SEEN_KEY) !== version);
    } catch {
      setUnseen(false);
    }
  }, [version]);
  const seen = () => {
    setUnseen(false);
    try {
      localStorage.setItem(SEEN_KEY, version);
    } catch {
      // Private mode: the dot comes back next time.
    }
  };
  const news = newsStrings(language);
  const label = LANGUAGES.find((item) => item.code === language)?.label ?? language;
  const newsLink = link('home', '#news');
  const pages = (
    [
      ['home', t.site.home],
      ['install', t.install],
    ] as const
  ).map(([name, text]) => ({
    name: name === 'install' ? installStep : name,
    text,
    current: name === 'home' ? page === 'home' : page !== 'home',
  }));
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-gutter">
        <div className="flex items-baseline gap-1">
          <a {...link('home')} className="no-underline">
            <span className="text-[22px] leading-none font-extrabold tracking-[-0.03em]">
              GRKU<span className="text-brand">.</span>
            </span>
          </a>
          <a
            href={newsLink.href}
            onClick={(event) => {
              seen();
              newsLink.onClick(event);
            }}
            title={news.navLabel}
            className="relative rounded-full px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground no-underline hover:bg-accent hover:text-foreground"
          >
            v{version}
            {unseen && <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-brand" aria-label={news.latest} />}
          </a>
        </div>
        <nav className="hidden items-center gap-1 md:flex" aria-label="GRKU">
          {pages.map(({ name, text, current }) => (
            <Button
              key={name}
              asChild
              variant="ghost"
              size="sm"
              className={cn('text-[13px] text-muted-foreground hover:text-foreground', current && 'bg-accent text-foreground')}
            >
              <a {...link(name)} aria-current={current ? 'page' : undefined}>
                {text}
              </a>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Select value={language} onValueChange={(next) => onLanguage(next as Language)}>
            <SelectTrigger size="sm" className="h-8 border-transparent bg-transparent text-[13px] shadow-none hover:bg-accent" aria-label={t.language}>
              <SelectValue>{label}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {LANGUAGES.map((item) => (
                <SelectItem key={item.code} value={item.code} lang={item.code}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <a href={REPOSITORY} aria-label="GitHub" title="GitHub">
              <svg viewBox="0 0 16 16" className="size-[18px]" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
                />
              </svg>
            </a>
          </Button>
          <a href={releaseUrl} className="sr-only">
            GRKU {version}
          </a>
        </div>
      </div>
      <nav className="mx-auto flex h-10 max-w-[1280px] items-stretch gap-4 overflow-x-auto px-gutter md:hidden" aria-label="GRKU">
        {pages.map(({ name, text, current }) => (
          <a
            key={name}
            {...link(name)}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center border-b-2 border-transparent text-[13px] whitespace-nowrap text-muted-foreground no-underline',
              current && 'border-foreground text-foreground',
            )}
          >
            {text}
          </a>
        ))}
      </nav>
    </header>
  );
}
