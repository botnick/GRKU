import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Strings } from '../i18n';
import { RichText } from './RichText';

/** The questions of the page, one open at a time. */
export function Faq({ strings: t }: { strings: Strings }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-border py-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <h2 id="faq-title" className="text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em]">
          {t.faqTitle}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {t.faq.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="py-4 text-left text-[15px] font-medium hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">
                <RichText parts={item.a} link="" />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
