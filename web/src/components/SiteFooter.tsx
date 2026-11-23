import type { ReactNode } from 'react';
import { siteUrl } from '../catalog';
import type { Language, Strings } from '../i18n';
import { LANGUAGE_PATHS, pagePath } from '../languagePage';
import { docUrl, FEEDBACK, guideUrl } from '../links';
import type { PageLink } from '../navigation';
import { newsStrings } from '../whatsNew';

const LINK = 'text-muted-foreground transition-colors hover:text-foreground';

/** A labelled group of footer links. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[13px] font-medium text-foreground">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  );
}

/**
 * The end of every page, the document pages too (scripts/build-docs.mjs renders it there): the
 * wordmark with one line, then the links in three groups, help, the project, and the legal pages,
 * each in the language of the page, and a quiet line with the risk and the trademarks.
 * `link` moves between the pages of the site without a reload; without it the links are plain.
 */
export function SiteFooter({
  strings: t,
  language,
  version,
  releaseUrl,
  link,
}: {
  strings: Strings;
  language: Language;
  version: string;
  releaseUrl: string;
  link?: PageLink;
}) {
  const guide = link ? link('guide') : { href: pagePath(language, 'guide') };
  const news = link ? link('home', '#news') : { href: `${LANGUAGE_PATHS[language]}#news` };
  return (
    <footer className="border-t border-border text-sm">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-gutter py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-3 lg:col-span-1">
            <a href={LANGUAGE_PATHS[language]} className="w-fit text-[20px] leading-none font-extrabold tracking-[-0.03em] text-foreground no-underline">
              GRKU<span className="text-brand-mark">.</span>
            </a>
            <p className="max-w-[36ch] text-sm leading-relaxed text-muted-foreground">{t.lead[1]}</p>
            <a className="w-fit font-mono text-xs text-muted-foreground hover:text-foreground" href={releaseUrl}>
              GRKU {version}
            </a>
          </div>
          <Group title={t.site.footerHelp}>
            <li>
              <a className={LINK} {...guide}>
                {t.card}
              </a>
            </li>
            <li>
              <a className={LINK} href={guideUrl('RECOVERY', language)}>
                {t.recovery}
              </a>
            </li>
            <li>
              <a className={LINK} href={guideUrl('DUMP', language)}>
                {t.firmwareDump}
              </a>
            </li>
          </Group>
          <Group title={t.site.footerProject}>
            <li>
              <a className={LINK} {...news}>
                {newsStrings(language).navLabel}
              </a>
            </li>
            <li>
              <a className={LINK} href={FEEDBACK}>
                {t.feedback}
              </a>
            </li>
          </Group>
          <Group title={t.site.footerLegal}>
            <li>
              <a className={LINK} href={guideUrl('TERMS', language)}>
                {t.terms}
              </a>
            </li>
            <li>
              <a className={LINK} href={docUrl('LICENSES', language)}>
                {t.licenses}
              </a>
            </li>
            <li>
              <a className={LINK} href={siteUrl('THIRD_PARTY_LICENSES.txt')}>
                {t.thirdParty}
              </a>
            </li>
          </Group>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          <p className="text-muted-foreground">{t.riskShort}</p>
          <p className="max-w-[90ch]">{t.trademarks}</p>
        </div>
      </div>
    </footer>
  );
}
