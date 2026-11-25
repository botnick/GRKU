// The GRKU assistant's mascot: a little 3D camera with its lens as a big eye and the red dot of
// GRKU, in a pose for each moment of the chat. The poses are small WebP files in public/mascot/
// (64, 144, and 320 px wide, from the cut-outs in GRKU-promo/mascot/poses); the browser picks the
// width for the size and the screen. Motion is CSS only (index.css, `mascot-*`): a gentle bob
// when idle, a tilt on hover, and nothing for a visitor who asks for reduced motion.
import { siteUrl } from '../catalog';
import { cn } from '@/lib/utils';

export type MascotPose = 'wave' | 'hi' | 'think' | 'happy' | 'point' | 'sleep' | 'oops' | 'love';

const FILES: Readonly<Record<MascotPose, string>> = {
  wave: 'wave-0',
  hi: 'hi-0',
  think: 'think-1',
  happy: 'happy-0',
  point: 'point-0',
  sleep: 'sleep-0',
  oops: 'oops-0',
  love: 'love-1',
};

/**
 * The mascot in `pose`, inside a square of `size` pixels: each pose keeps its own proportions
 * (most are wide, love stands tall), so nothing it sits next to moves or hides behind it. `disc` sets it on a light round disc, which keeps
 * the charcoal body visible on the dark page. `eager` loads it with the page (the chat button);
 * every other pose loads when it shows.
 */
export function Mascot({ pose, size, disc = false, bob = false, eager = false, className }: { pose: MascotPose; size: number; disc?: boolean; bob?: boolean; eager?: boolean; className?: string }) {
  const file = FILES[pose];
  const image = (
    <img
      src={siteUrl(`mascot/${file}-144.webp`)}
      srcSet={['64', '144', '320'].map((w) => `${siteUrl(`mascot/${file}-${w}.webp`)} ${w}w`).join(', ')}
      sizes={`${size}px`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      alt=""
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('mascot-img pointer-events-none object-contain select-none', bob && 'mascot-bob')}
    />
  );
  if (!disc) return <span className={cn('inline-grid shrink-0 place-items-center', className)}>{image}</span>;
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-full bg-[#f4f2ec] light:bg-transparent', className)}
      style={{ width: Math.round(size * 1.18), height: Math.round(size * 1.18) }}
    >
      {image}
    </span>
  );
}
