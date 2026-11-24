import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LANGUAGES, type Language, type Strings } from '../i18n';
import { newsStrings } from '../whatsNew';
import { isInstallStep, type SitePage } from '../languagePage';
import type { PageLink } from '../navigation';
import { cn } from '@/lib/utils';
import { THEME_PREFERENCES, themeStrings, useThemePreference, type ThemePreference } from '../theme';

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

/** The theme of the page: System (the device), Light, or Dark, as an icon beside the language. */
function ThemeMenu({ language }: { language: Language }) {
  const [preference, choose] = useThemePreference();
  const ts = themeStrings(language);
  const Icon = THEME_ICONS[preference];
  return (
    <Select value={preference} onValueChange={(next) => choose(next as ThemePreference)}>
      <SelectTrigger
        size="sm"
        className="h-8 gap-1 border-transparent bg-transparent px-2 text-[13px] shadow-none hover:bg-accent [&>svg:last-child]:hidden"
        aria-label={`${ts.theme}: ${ts[preference]}`}
        title={ts.theme}
      >
        <SelectValue>
          <Icon className="size-4 text-foreground" aria-hidden="true" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {THEME_PREFERENCES.map((item) => {
          const ItemIcon = THEME_ICONS[item];
          return (
            <SelectItem key={item} value={item}>
              <ItemIcon className="size-4" aria-hidden="true" />
              {ts[item]}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

/** The version whose news this browser opened (the dot on the version goes). */
const SEEN_KEY = 'grku.seenNews';

/**
 * The header: the wordmark with its red period and the version, the links to the three pages, the
 * language, the theme, and the repository. It stays at the top while the page scrolls. On a phone the page
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
      ['develop', t.develop.nav],
      ['guide', t.card],
      ['install', t.install],
    ] as const
  ).map(([name, text]) => ({
    name: name === 'install' ? installStep : name,
    text,
    current: name === 'install' ? isInstallStep(page) : page === name,
  }));
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-gutter">
        <div className="flex items-baseline gap-1">
          <a {...link('home')} className="no-underline">
            <span className="text-[22px] leading-none font-extrabold tracking-[-0.03em]">
              GRKU<span className="text-brand-mark">.</span>
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
          <ThemeMenu language={language} />
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
