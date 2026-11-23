import { ChevronDownIcon } from 'lucide-react';
import type { Strings } from '../i18n';
import { RichText } from './RichText';

/**
 * The questions of the page, one open at a time. Each is a `<details>` element, so the answers are
 * in the HTML of the page for search engines and the FAQ structured data, open or closed, and
 * the `name` keeps one open at a time without a script.
 */
export function Faq({ strings: t }: { strings: Strings }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-28 md:scroll-mt-20 border-t border-border py-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <h2 id="faq-title" className="text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em]">
          {t.faqTitle}
        </h2>
        <div className="w-full">
          {t.faq.map((item) => (
            <details key={item.q} name="faq" className="group border-b last:border-b-0">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md py-4 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <h3 className="text-[15px] font-medium">{item.q}</h3>
                <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="max-w-[68ch] pb-4 text-[15px] leading-relaxed text-muted-foreground">
                <RichText parts={item.a} link="" />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
