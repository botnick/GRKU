import type { ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils';

/**
 * A section of the desk: the heading in a column on the left, which stays in view while the
 * section scrolls by, and the body on the right. On a narrow window the body follows the heading.
 */
export function Section({
  id,
  title,
  children,
  className,
  ref,
}: {
  /** The ID of the heading, which the section is labelled by and the masthead links to. */
  id: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
}) {
  return (
    <section
      ref={ref}
      className={cn('grid gap-6 border-t border-border py-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8', className)}
      aria-labelledby={id}
    >
      <h2
        id={id}
        className="section-title scroll-mt-12 text-[26px] leading-tight font-semibold lg:sticky lg:top-4 lg:self-start"
      >
        {title}
      </h2>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </section>
  );
}
