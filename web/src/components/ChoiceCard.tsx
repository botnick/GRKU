import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * A choice on a card: a radio or a checkbox with its text. The whole card is the label, and the
 * card darkens its frame when the choice is on.
 */
export function ChoiceCard({
  htmlFor,
  control,
  children,
  className,
}: {
  /** The ID of the radio or the checkbox. */
  htmlFor: string;
  control: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 text-left text-base leading-normal font-normal transition-colors',
        'hover:border-input has-data-[state=checked]:border-foreground has-data-[state=checked]:shadow-[inset_0_0_0_1px_var(--foreground)]',
        'has-disabled:cursor-default has-disabled:opacity-60 has-disabled:hover:border-border',
        className,
      )}
    >
      {control}
      <span className="flex min-w-0 flex-1 flex-col gap-1">{children}</span>
    </Label>
  );
}
