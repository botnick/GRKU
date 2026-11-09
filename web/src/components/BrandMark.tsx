import { BRAND_STYLE } from '../filmKind';
import { cn } from '@/lib/utils';

/**
 * A small mark of a film brand in the colours of its box band: the first letter on the band,
 * and the Polaroid rainbow under its letter. Not the brand's own logo.
 */
export function BrandMark({ brand, className }: { brand: string; className?: string }) {
  const style = BRAND_STYLE[brand];
  if (!style) return null;
  return (
    <span
      className={cn('relative inline-flex size-[18px] shrink-0 items-center justify-center overflow-hidden rounded-[4px] text-[11px] leading-none font-extrabold', className)}
      style={{ background: style.band, color: style.text }}
      aria-hidden="true"
    >
      {brand.charAt(0)}
      {style.rainbow && (
        <span
          className="absolute inset-x-0 bottom-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, #ed1c24 0 20%, #f7941d 20% 40%, #ffde00 40% 60%, #00a651 60% 80%, #0072bc 80%)' }}
        />
      )}
    </span>
  );
}
