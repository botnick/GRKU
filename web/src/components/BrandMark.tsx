import { BRAND_STYLE } from '../filmKind';
import { cn } from '@/lib/utils';

/**
 * How each brand sets its name on the chip: the case, the weight, the tracking, and a Polaroid
 * rainbow on the left edge. Set in the page font, in the colours of the brand's box band: not the
 * brand's own logo.
 */
const WORDMARK: Readonly<Record<string, { text: string; className: string; rainbow?: boolean }>> = {
  Kodak: { text: 'Kodak', className: 'font-extrabold tracking-tight' },
  Fujifilm: { text: 'FUJIFILM', className: 'font-extrabold tracking-wide' },
  Ilford: { text: 'ILFORD', className: 'font-extrabold tracking-[0.12em]' },
  Agfa: { text: 'AGFA', className: 'font-extrabold tracking-[0.14em]' },
  Polaroid: { text: 'Polaroid', className: 'font-semibold tracking-tight', rainbow: true },
  Lomography: { text: 'LOMO', className: 'font-extrabold tracking-[0.1em]' },
  Rollei: { text: 'Rollei', className: 'font-bold tracking-tight' },
  CineStill: { text: 'CineStill', className: 'font-extrabold tracking-tight' },
  Harman: { text: 'HARMAN', className: 'font-extrabold tracking-[0.12em]' },
  Ricoh: { text: 'RICOH', className: 'font-extrabold tracking-[0.16em]' },
};

/** A chip with the brand's name in the colours of its box band, 20px tall; a muted chip for a brand without a band. */
export function BrandMark({ brand, className }: { brand: string; className?: string }) {
  const style = BRAND_STYLE[brand] ?? { band: 'var(--muted)', text: 'var(--foreground)' };
  const mark = WORDMARK[brand] ?? { text: brand, className: 'font-bold' };
  return (
    <span
      className={cn(
        'relative inline-flex h-5 shrink-0 items-center overflow-hidden rounded-[4px] px-1.5 text-[10px] leading-none whitespace-nowrap ring-1 ring-black/10 ring-inset',
        mark.rainbow && 'pl-3',
        mark.className,
        className,
      )}
      style={{ background: style.band, color: style.text }}
      aria-hidden="true"
    >
      {mark.rainbow && (
        <span
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ background: 'linear-gradient(180deg, #ed1c24 0 20%, #f7941d 20% 40%, #ffde00 40% 60%, #00a651 60% 80%, #0072bc 80%)' }}
        />
      )}
      {mark.text}
    </span>
  );
}

/**
 * A 16px square in the brand's band colour with the brand's initial in its text colour (the
 * Polaroid rainbow for Polaroid): the quiet, distinct mark of a list row, like a favicon.
 */
export function BrandSwatch({ brand, className }: { brand: string; className?: string }) {
  const style = BRAND_STYLE[brand];
  const rainbow = style?.rainbow ?? false;
  return (
    <span
      className={cn('inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] leading-none font-extrabold ring-1 ring-white/15 ring-inset', className)}
      style={{ background: rainbow ? 'linear-gradient(180deg, #ed1c24 0 20%, #f7941d 20% 40%, #ffde00 40% 60%, #00a651 60% 80%, #0072bc 80%)' : (style?.band ?? 'var(--muted)'), color: rainbow ? 'transparent' : (style?.text ?? 'var(--foreground)') }}
      aria-hidden="true"
    >
      {brand.charAt(0)}
    </span>
  );
}
