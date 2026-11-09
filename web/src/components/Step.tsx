import type { ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils';

/** The heading of a step of the page: its number small above its title, and a line under it. */
export function StepHeading({
  id,
  number,
  label,
  title,
  description,
  aside,
  className,
}: {
  /** The ID of the title, which the step is labelled by and the masthead links to. */
  id: string;
  /** The number of the step, as the page text names it ("Step 1"). */
  number: string;
  /** The text of the number, for screen readers. */
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  /** What sits at the end of the heading row: a count, a button. */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-x-8 gap-y-4', className)}>
      <div className="min-w-0 max-w-[60ch]">
        <p className="font-mono text-xs font-medium tracking-[0.04em] text-brand" aria-label={label}>
          {number}
        </p>
        <h2 id={id} className="mt-1.5 text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-3">{aside}</div>}
    </header>
  );
}

/**
 * A step of the page after the first: a hairline above, the heading, then the body. The ID is on
 * the section, so a link lands above the heading.
 */
export function Step({
  id,
  number,
  label,
  title,
  description,
  aside,
  children,
  className,
  ref,
}: Parameters<typeof StepHeading>[0] & { children: ReactNode; ref?: Ref<HTMLElement> }) {
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('scroll-mt-20 border-t border-border py-12 lg:py-16', className)}
    >
      <StepHeading id={`${id}-title`} number={number} label={label} title={title} description={description} aside={aside} className="mb-8" />
      {children}
    </section>
  );
}
