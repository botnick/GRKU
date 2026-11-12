import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Language } from '../i18n';
import { REPOSITORY } from '../links';
import { RELEASES, newsStrings, type Release } from '../whatsNew';

const CHANGELOG = `${REPOSITORY}/blob/main/CHANGELOG.md`;

function formatDate(date: string, language: Language): string {
  try {
    return new Date(`${date}T12:00:00Z`).toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return date;
  }
}

function Items({ release, language }: { release: Release; language: Language }) {
  const text = newsStrings(language);
  return (
    <ul className="grid gap-2 text-[15px] leading-relaxed text-muted-foreground">
      {release.items.map((key) => (
        <li key={key} className="relative pl-4 before:absolute before:top-[0.7em] before:left-0 before:size-1.5 before:rounded-full before:bg-muted-foreground/50">
          {text[key]}
        </li>
      ))}
    </ul>
  );
}

/** What each release changed, newest first: the latest open, the earlier ones folded. */
export function WhatsNew({ language }: { language: Language }) {
  const text = newsStrings(language);
  const [latest, ...older] = RELEASES;
  if (!latest) return null;
  return (
    <section id="news" aria-labelledby="news-title" className="scroll-mt-20 border-t border-border py-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <h2 id="news-title" className="text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em]">
            {text.title}
          </h2>
          <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted-foreground">{text.lead}</p>
          <a href={CHANGELOG} className="mt-4 inline-block text-[14px] text-muted-foreground underline underline-offset-4 hover:text-foreground">
            {text.full}
          </a>
        </div>
        <div>
          <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-mono text-[18px] font-semibold">v{latest.version}</h3>
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[12px] font-medium text-brand">{text.latest}</span>
              <time dateTime={latest.date} className="text-[13px] text-muted-foreground">
                {formatDate(latest.date, language)}
              </time>
            </header>
            <Items release={latest} language={language} />
          </article>
          <h3 className="mt-8 mb-1 text-[13px] font-medium text-muted-foreground">{text.older}</h3>
          <Accordion type="single" collapsible className="w-full">
            {older.map((release) => (
              <AccordionItem key={release.version} value={release.version}>
                <AccordionTrigger className="py-3.5 text-left hover:no-underline">
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-[15px] font-medium">v{release.version}</span>
                    <time dateTime={release.date} className="text-[13px] font-normal text-muted-foreground">
                      {formatDate(release.date, language)}
                    </time>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Items release={release} language={language} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
