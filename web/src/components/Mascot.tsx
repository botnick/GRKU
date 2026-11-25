// The GRKU assistant's mascot: a small compact camera with its lens as a big friendly eye and the
// red dot of GRKU as its cheek. An original drawing, not a camera maker's logo. Inline SVG, so it
// is crisp at any size and costs no request; its moves are CSS only (index.css, `mascot-*`), and
// a visitor who asks for reduced motion sees it still.
import { cn } from '@/lib/utils';

export type MascotMood = 'idle' | 'thinking' | 'happy' | 'sleeping';

/**
 * The mascot at `size` pixels. `idle` blinks now and then and bobs a little (`animated`),
 * `thinking` turns the ring of its lens, `happy` smiles with its eye, `sleeping` closes it.
 */
export function Mascot({ mood = 'idle', size = 56, animated = false, limbs = false, className, title }: { mood?: MascotMood; size?: number; animated?: boolean; /** Stubby arms and legs, for the larger poses (the concept art has them). */ limbs?: boolean; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn('mascot shrink-0 overflow-visible', animated && 'mascot-animated', `mascot-${mood}`, className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <g className="mascot-body">
        {limbs && (
          <g className="fill-[#1c1c1c]">
            {/* Arms: the right one waves on hover (mascot-arm). */}
            <rect x="-1" y="30" width="9" height="5" rx="2.5" transform="rotate(-30 4 32)" />
            <rect x="56" y="30" width="9" height="5" rx="2.5" transform="rotate(30 60 32)" className="mascot-arm" />
            {/* Legs. */}
            <rect x="20" y="50" width="7" height="9" rx="3.5" />
            <rect x="37" y="50" width="7" height="9" rx="3.5" />
          </g>
        )}
        {/* Shutter button and the top plate. */}
        <rect x="40" y="11" width="11" height="6" rx="3" className="fill-[#2b2b2b]" />
        {/* The body: a rounded compact camera, with a light edge that keeps it apart on the dark page. */}
        <rect x="5" y="15" width="54" height="38" rx="11" className="fill-[#1c1c1c] stroke-white/25 light:stroke-transparent" strokeWidth="1.5" />
        {/* The grip: a little darker on the left. */}
        <rect x="5" y="15" width="11" height="38" rx="11" className="fill-[#141414]" />
        {/* The flash window, as a little forehead light. */}
        <rect x="45" y="21" width="8" height="4" rx="2" className="fill-[#3d3d3d]" />
        {/* The lens: the eye. */}
        <circle cx="31" cy="33" r="13" className="fill-[#2e2e2e]" />
        <circle cx="31" cy="33" r="10.5" className="mascot-ring fill-none stroke-[#5a5a5a]" strokeWidth="1.6" strokeDasharray="3 2.6" />
        <g className="mascot-eye">
          <circle cx="31" cy="33" r="7.5" className="fill-[#0b0b0b]" />
          <circle cx="34" cy="29.8" r="2.4" className="fill-[#f7f7f2]" />
          <circle cx="28.6" cy="36" r="1" className="fill-[#f7f7f2]/70" />
        </g>
        {/* A smiling eye and a closed eye, shown by the mood. */}
        <path d="M25.5 34.5 Q31 28 36.5 34.5" className="mascot-eye-happy fill-none stroke-[#f7f7f2]" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M25.5 33 Q31 37.5 36.5 33" className="mascot-eye-sleep fill-none stroke-[#f7f7f2]" strokeWidth="2" strokeLinecap="round" />
        {/* The red dot of GRKU, as a cheek. */}
        <circle cx="50" cy="42" r="3" className="fill-brand-mark" />
        {/* A small smile under the lens. */}
        <path d="M27.5 48.5 Q31 50.6 34.5 48.5" className="fill-none stroke-[#8a8a8a]" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      {/* Zz, when it sleeps. */}
      <text x="52" y="11" className="mascot-zz fill-muted-foreground text-[9px] font-bold">z</text>
    </svg>
  );
}
