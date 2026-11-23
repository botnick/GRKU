import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, LifeBuoy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { CAMERAS, MODESET_TOKEN } from '../cameras';
import { GUIDE_STRINGS } from '../guide';
import type { FaqItem, Language, RichText as Parts, Strings } from '../i18n';
import { FEEDBACK, guideUrl } from '../links';
import type { PageLink } from '../navigation';
import { CameraBackArt, ComputerArt, CopyArt, InsertArt } from './GuideArt';
import { RichText } from './RichText';
import { StepHeading } from './Step';

/** A section of the guide: a hairline above, the heading, then the body. */
const SECTION = 'scroll-mt-28 md:scroll-mt-20 border-t border-border py-12 lg:py-16';
const NOTE = 'mt-1.5 text-sm leading-relaxed text-muted-foreground';

/** The cameras that GRKU supports, by the names of the installer. */
const SUPPORTED_CAMERAS = CAMERAS.filter((camera) => camera.support).map((camera) => camera.name);

/** The ModeSet file of each camera, each once, for the steps that name it. */
const MODESETS = [...new Set(CAMERAS.flatMap((camera) => (camera.support ? [camera.support.modeset] : [])))].join(' / ');

/** Install text with the ModeSet file of the cameras in place of its token. */
const withModeset = (parts: Parts): Parts => parts.map((part) => (part === MODESET_TOKEN ? `\`${MODESETS}` : part));

/** A button of the install as the page shows it, so the visitor knows what to look for. */
function ButtonShape({ children, outline = false }: { children: ReactNode; outline?: boolean }) {
  return (
    <span
      className={cn(
        'mt-2.5 inline-flex h-8 w-fit items-center rounded-md px-3 text-[13px] font-medium select-none',
        outline ? 'border border-input text-foreground' : 'bg-brand text-brand-foreground',
      )}
    >
      {children}
    </span>
  );
}

/** One numbered step: the number on a line that joins the steps, the text, and what goes with it. */
function Item({ n, text, children, last = false }: { n: number; text: ReactNode; children?: ReactNode; last?: boolean }) {
  return (
    <li className="relative flex gap-4 pb-7 last:pb-0">
      {!last && <span className="absolute top-8 bottom-1 left-[13px] w-px bg-border" aria-hidden="true" />}
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-semibold text-brand-foreground">
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col pt-0.5">
        <p className="text-[15px] leading-relaxed font-medium">{text}</p>
        {children}
      </div>
    </li>
  );
}

/** A list of steps; each entry is the text and what goes under it. */
function Steps({ items }: { items: readonly (readonly [ReactNode, ReactNode?])[] }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {items.map(([text, extra], index) => (
        <Item key={index} n={index + 1} text={text} last={index === items.length - 1}>
          {extra}
        </Item>
      ))}
    </ol>
  );
}

/** A step with its picture on a card: the cards of the camera stand in a row from the tablet up. */
function PictureStep({ n, art, text, children }: { n: number; art: ReactNode; text: ReactNode; children?: ReactNode }) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="border-b border-border bg-[#141414] p-4">{art}</div>
      <div className="flex gap-3 p-5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-semibold text-brand-foreground">
          {n}
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[15px] leading-relaxed font-medium">{text}</p>
          {children}
        </div>
      </div>
    </li>
  );
}

/** A tab of the two ways to put GRKU on the card: its name, a line under it, and a badge. */
function WayTab({ value, title, text, badge }: { value: string; title: string; text: string; badge?: string }) {
  return (
    <TabsTrigger
      value={value}
      className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-border bg-transparent px-4 py-3 text-left whitespace-normal hover:border-input data-[state=active]:border-foreground/50 data-[state=active]:bg-card data-[state=active]:shadow-[inset_0_0_0_1px_var(--foreground)]"
    >
      <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-foreground">
        {title}
        {badge && (
          <Badge variant="outline" className="border-brand/60 text-[11px] font-medium text-brand">
            {badge}
          </Badge>
        )}
      </span>
      <span className="text-[13px] leading-snug font-normal text-muted-foreground">{text}</span>
    </TabsTrigger>
  );
}

/** A way on a computer and its drawing: the steps at the left, the drawing at the right. */
function Way({ art, steps, start }: { art: ReactNode; steps: ReactNode; start: ReactNode }) {
  return (
    <div className="grid items-start gap-x-14 gap-y-8 pt-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <div className="min-w-0">
        {steps}
        <div className="mt-8 pl-11">{start}</div>
      </div>
      {/* On a phone the drawing comes first, above the steps it shows. */}
      <div className="order-first rounded-2xl border bg-[#141414] p-5 lg:sticky lg:top-24 lg:order-none lg:p-8">{art}</div>
    </div>
  );
}

/**
 * The install guide: how to put GRKU on the card in two ways, the first start on the camera, how
 * to use it, then updates, the uninstall, and what to do when something goes wrong. It tells the
 * steps of the install with drawings; the install itself is the wizard at /install/.
 */
export function Guide({ strings: t, language, link, canWrite }: { strings: Strings; language: Language; link: PageLink; canWrite: boolean }) {
  const g = GUIDE_STRINGS[language];
  const [way, setWay] = useState('card');
  const start = (
    <Button asChild variant="brand" size="lg" className="h-11 px-6 text-[15px]">
      <a {...link('install')}>
        {g.start}
        <ArrowRight aria-hidden="true" />
      </a>
    </Button>
  );
  const contents = [
    ['put', g.putTitle],
    ['camera', g.cameraTitle],
    ['use', g.useTitle],
    ['update', g.updateTitle],
    ['uninstall', t.uninstallButton],
    ['help', g.helpTitle],
  ] as const;
  // The questions of the FAQ that the guide repeats; their place in the FAQ differs by language.
  const faq = (id: FaqItem['id']) => t.faq.filter((item) => item.id === id).map((item) => ({ q: item.q, a: <RichText parts={item.a} /> }));
  const help: readonly { q: string; a: ReactNode }[] = [
    ...faq('adj'),
    { q: g.modeSetQ, a: g.modeSetA },
    { q: g.firmwareQ, a: g.firmwareA },
    {
      q: g.stuckQ,
      a: (
        <>
          {g.stuckA}{' '}
          <a href={guideUrl('RECOVERY', language)} className="text-foreground underline underline-offset-4 hover:text-brand">
            {t.recovery}
          </a>
        </>
      ),
    },
    ...faq('format'),
  ];

  return (
    <>
      <section className="grid items-start gap-x-14 gap-y-10 pt-[clamp(32px,6vh,72px)] pb-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:pb-16" aria-labelledby="guide-title">
        <div className="min-w-0">
          <h1
            id="guide-title"
            className="text-balance text-[clamp(34px,4vw,52px)] leading-[1.08] font-bold tracking-[-0.025em] [:root[lang=th]_&]:leading-[1.25] [:root[lang=th]_&]:tracking-normal"
          >
            {g.heading}
          </h1>
          <p className="mt-4 max-w-[34em] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-muted-foreground">{g.lead}</p>
          <nav className="mt-8" aria-label={g.onThisPage}>
            <p className="text-[13px] text-muted-foreground">{g.onThisPage}</p>
            <ol className="mt-2 flex list-none flex-wrap gap-2 p-0">
              {contents.map(([id, title], index) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[13px] text-muted-foreground no-underline transition-colors hover:border-input hover:text-foreground"
                  >
                    {index < 3 && <span className="font-mono text-[11px] text-brand">{index + 1}</span>}
                    {title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="text-sm font-medium text-muted-foreground">{t.site.needTitle}</h2>
          <ul className="mt-3 flex list-none flex-col gap-3 p-0 text-[15px]">
            {[
              [g.needCamera, SUPPORTED_CAMERAS.join(' · ')],
              [g.needCard, null],
              [t.cardReader, null],
              [t.site.needBattery, null],
            ].map(([item, detail]) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
                <span className="min-w-0">
                  {item}
                  {detail && <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{detail}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">{t.firmwareNote}</p>
        </div>
      </section>

      <section id="put" className={SECTION} aria-labelledby="put-title">
        <StepHeading id="put-title" number={t.step(1)} title={g.putTitle} description={g.putLead} className="mb-8" />
        <Tabs value={way} onValueChange={setWay}>
          <TabsList className="grid w-full max-w-[760px] grid-cols-1 gap-3 bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-auto sm:grid-cols-2">
            <WayTab value="card" title={t.modeCard} text={g.cardSub} badge={t.recommended} />
            <WayTab value="zip" title={t.modeZip} text={t.modeZipText} />
          </TabsList>
          {/* Both ways stay in the page, so search engines and a page without the script read them. */}
          <TabsContent value="card" forceMount className="data-[state=inactive]:hidden">
            <Way
              art={<ComputerArt />}
              start={start}
              steps={
                <Steps
                  items={[
                    [g.openSite, !canWrite && <p className={NOTE}>{t.cardComputer}</p>],
                    [g.reader, <p className={NOTE}>{t.cardReader}</p>],
                    [g.pick],
                    [g.connect, <ButtonShape outline>{t.cardConnect}</ButtonShape>],
                    [
                      g.write,
                      <>
                        <ButtonShape>{t.cardApplyInstall}</ButtonShape>
                        <p className={NOTE}>
                          {g.confirmNote} {t.cardSafe}
                        </p>
                      </>,
                    ],
                    [t.cardDone],
                  ]}
                />
              }
            />
          </TabsContent>
          <TabsContent value="zip" forceMount className="data-[state=inactive]:hidden">
            <Way
              art={<CopyArt />}
              start={start}
              steps={
                <Steps
                  items={[
                    [g.pick],
                    [g.download, <ButtonShape>{t.download}</ButtonShape>],
                    [t.zipNext1, <p className={NOTE}>{g.unzipNote}</p>],
                    [t.zipNext2, <p className={NOTE}>{g.copyNote}</p>],
                    [t.cardDone],
                  ]}
                />
              }
            />
          </TabsContent>
        </Tabs>
      </section>

      <section id="camera" className={SECTION} aria-labelledby="camera-title">
        <StepHeading id="camera-title" number={t.step(2)} title={g.cameraTitle} description={g.cameraLead} className="mb-8" />
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
          <PictureStep n={1} art={<InsertArt />} text={`${t.steps[0]![0]} ${t.cardStepInsert}`} />
          <PictureStep n={2} art={<CameraBackArt screen="modeset" press={['menu', 'power']} />} text={t.cardEnable}>
            <p className={NOTE}>{g.modeSetNote}</p>
          </PictureStep>
          <PictureStep n={3} art={<CameraBackArt screen="loaded" />} text={g.powerOn}>
            <p className={NOTE}>{g.firstSlow}</p>
          </PictureStep>
        </ol>
        <div className="mt-6 flex max-w-[80ch] flex-col gap-2 border-l-2 border-brand/70 pl-4">
          <p className="text-[15px] leading-relaxed font-medium">{g.once}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <RichText parts={withModeset(t.steps[4]!)} />
          </p>
        </div>
      </section>

      <section id="use" className={SECTION} aria-labelledby="use-title">
        <StepHeading id="use-title" number={t.step(3)} title={g.useTitle} description={g.useLead} className="mb-8" />
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
          <PictureStep n={1} art={<CameraBackArt screen="adj" press={['adj']} />} text={g.adj} />
          <PictureStep n={2} art={<CameraBackArt screen="look" press={['grku']} />} text={g.sixth} />
          <PictureStep n={3} art={<CameraBackArt screen="look" press={['ok']} />} text={g.look} />
        </ol>
        <p className="mt-6 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">{g.menu}</p>
      </section>

      <div className="grid gap-x-14 border-t border-border lg:grid-cols-2">
        <section id="update" className="scroll-mt-28 py-12 md:scroll-mt-20 lg:py-16" aria-labelledby="update-title">
          <StepHeading id="update-title" title={g.updateTitle} className="mb-6" />
          <p className="text-[15px] leading-relaxed">{g.withBrowser}</p>
          <ButtonShape>{t.cardApplyUpdate}</ButtonShape>
          <h3 className="mt-8 text-sm font-medium text-muted-foreground">{g.byHand}</h3>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-relaxed">
            {t.updateSteps.map((parts, index) => (
              <li key={index}>
                <RichText parts={parts} />
              </li>
            ))}
          </ol>
          <p className={cn(NOTE, 'mt-4')}>{g.updateKeep}</p>
        </section>
        <section id="uninstall" className="scroll-mt-28 border-t border-border py-12 md:scroll-mt-20 lg:border-t-0 lg:py-16" aria-labelledby="uninstall-title">
          <StepHeading id="uninstall-title" title={t.uninstallButton} className="mb-6" />
          <p className="text-[15px] leading-relaxed">{g.withBrowser}</p>
          <ButtonShape outline>{t.uninstallButton}</ButtonShape>
          <p className={NOTE}>{t.uninstallText}</p>
          <h3 className="mt-8 text-sm font-medium text-muted-foreground">{g.byHand}</h3>
          <p className="mt-3 text-[15px] leading-relaxed">
            <RichText parts={t.removeSteps[0]!} />
          </p>
          <h3 className="mt-8 text-[15px] font-medium">{t.scriptsOffTitle}</h3>
          <p className={NOTE}>{t.scriptsOffText}</p>
          <p className={NOTE}>{g.scriptsOffWhere}</p>
        </section>
      </div>

      <section id="help" className={SECTION} aria-labelledby="help-title">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div className="min-w-0">
            <h2 id="help-title" className="text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
              {g.helpTitle}
            </h2>
            <div className="mt-5 flex flex-col items-start gap-2 text-sm">
              <a href={guideUrl('RECOVERY', language)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <LifeBuoy className="size-4" aria-hidden="true" />
                {t.recovery}
              </a>
              <a href={FEEDBACK} className="text-muted-foreground hover:text-foreground">
                {t.feedback}
              </a>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {help.map((item, index) => (
              <AccordionItem key={item.q} value={`help-${index}`}>
                <AccordionTrigger className="py-4 text-left text-[15px] font-medium hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className={cn(SECTION, 'flex flex-col items-start gap-4')} aria-labelledby="guide-start-title">
        <h2 id="guide-start-title" className="text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
          {t.site.ctaTitle}
        </h2>
        <p className="max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{t.site.ctaText}</p>
        <div className="mt-2">{start}</div>
      </section>
    </>
  );
}
