import { siteUrl } from '../catalog';
import type { Language, Strings } from '../i18n';
import { guideUrl, REPOSITORY, UPSTREAM } from '../links';

const LINK = 'text-muted-foreground hover:text-foreground hover:underline underline-offset-4';

/** The end of the page: the guides, the licenses, the trademarks, and the credit to the fork's source. */
export function SiteFooter({
  strings: t,
  language,
  version,
  releaseUrl,
}: {
  strings: Strings;
  language: Language;
  version: string;
  releaseUrl: string;
}) {
  return (
    <footer className="border-t border-border py-10 text-sm">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-gutter">
        <div className="grid gap-6 sm:grid-cols-3">
          <ul className="flex flex-col gap-2">
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
          </ul>
          <ul className="flex flex-col gap-2">
            <li>
              <a className={LINK} href={`${REPOSITORY}/issues`}>
                {t.feedback}
              </a>
            </li>
            <li>
              <a className={LINK} href={REPOSITORY}>
                GitHub
              </a>
            </li>
          </ul>
          <ul className="flex flex-col gap-2">
            <li>
              <a className={LINK} href={`${REPOSITORY}/blob/main/effects/NOTICE.md`}>
                {t.licenses}
              </a>
            </li>
            <li>
              <a className={LINK} href={siteUrl('THIRD_PARTY_LICENSES.txt')}>
                {t.thirdParty}
              </a>
            </li>
            <li>
              <a className={LINK} href={guideUrl('TERMS', language)}>
                {t.terms}
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-6 text-[13px] text-muted-foreground">
          <p className="max-w-[80ch]">{t.trademarks}</p>
          <p>
            <b className="font-semibold text-foreground">GRKU {t.landing.edition}</b> — {t.landing.fork[0]}
            <a className="underline underline-offset-4 hover:text-foreground" href={UPSTREAM}>
              {t.landing.fork[1]}
            </a>
            {t.landing.fork[2]}
          </p>
          <a className="w-fit font-mono hover:text-foreground" href={releaseUrl}>
            GRKU {version}
          </a>
        </div>
      </div>
    </footer>
  );
}
