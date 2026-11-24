// A before-and-after view made for a thumb, as on iPhone Safari: a horizontal drag anywhere on the
// picture moves the divider, a vertical one scrolls the page (touch-action: pan-y), and a tap moves
// the divider to the tap. The drag starts only after the finger has moved a few pixels sideways, so
// a page scroll that starts on the picture stays a scroll. Pointer Events with pointer capture; touch
// events where a browser has no Pointer Events (iOS before 13). The handle is a slider for the keys.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The sideways movement in CSS pixels after which a touch drags the divider. */
export const SLOP = 6;

/**
 * What a movement of (dx, dy) CSS pixels from the touch start is: a drag of the divider (sideways
 * past SLOP), a page scroll (more down than across past SLOP), or not yet either.
 */
export function gesture(dx: number, dy: number): 'drag' | 'scroll' | 'wait' {
  const x = Math.abs(dx), y = Math.abs(dy);
  if (y > SLOP && y >= x) return 'scroll';
  return x > SLOP ? 'drag' : 'wait';
}

export interface CompareViewProps {
  before: ReactNode;
  after: ReactNode;
  /** The divider in percent of the width from the left: the before side is left of it. */
  position: number;
  onPosition: (position: number) => void;
  label: string;
  className?: string;
  children?: ReactNode;
}

export function CompareView({ before, after, position, onPosition, label, className, children }: CompareViewProps) {
  const root = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  // Moves on a tap ease into place; drags follow the finger.
  const [easing, setEasing] = useState(false);
  const onPositionRef = useRef(onPosition);
  onPositionRef.current = onPosition;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const at = (clientX: number) => {
      const box = el.getBoundingClientRect();
      return Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100));
    };
    let start: { x: number; y: number; id: number } | null = null;
    let drag = false;
    const begin = (x: number, y: number, id: number) => {
      start = { x, y, id };
      drag = false;
    };
    /** Returns true when the movement belongs to the divider. */
    const move = (x: number, y: number): boolean => {
      if (!start) return false;
      if (!drag) {
        const kind = gesture(x - start.x, y - start.y);
        if (kind === 'scroll') {
          start = null;
          return false;
        }
        if (kind === 'wait') return false;
        drag = true;
        setDragging(true);
        setEasing(false);
      }
      onPositionRef.current(at(x));
      return true;
    };
    const end = (x: number, cancelled: boolean) => {
      if (start && !drag && !cancelled) {
        setEasing(true);
        onPositionRef.current(at(x));
      }
      start = null;
      drag = false;
      setDragging(false);
    };

    if ('PointerEvent' in window) {
      const down = (event: PointerEvent) => {
        if (event.button !== 0 || (event.target as Element).closest('[data-compare-ignore]')) return;
        begin(event.clientX, event.clientY, event.pointerId);
      };
      const moved = (event: PointerEvent) => {
        if (!start || event.pointerId !== start.id) return;
        const wasDragging = drag;
        if (move(event.clientX, event.clientY) && !wasDragging) {
          try {
            el.setPointerCapture(event.pointerId);
          } catch {
            // A pointer that is gone already: the drag follows its moves anyway.
          }
        }
      };
      const up = (event: PointerEvent) => start && event.pointerId === start.id && end(event.clientX, false);
      const cancel = (event: PointerEvent) => start && event.pointerId === start.id && end(event.clientX, true);
      // iPhone Safari: while the divider drags, the page does not move under the finger.
      const hold = (event: TouchEvent) => {
        if (drag) event.preventDefault();
      };
      el.addEventListener('touchmove', hold, { passive: false });
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', moved);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', cancel);
      return () => {
        el.removeEventListener('touchmove', hold);
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', moved);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', cancel);
      };
    }
    // iOS before 13: touch events; a sideways drag stops the page from scrolling.
    let lastX = 0;
    const tstart = (event: TouchEvent) => {
      const t = event.touches[0];
      if (event.touches.length !== 1 || !t) return;
      lastX = t.clientX;
      begin(t.clientX, t.clientY, 0);
    };
    const tmove = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      lastX = t.clientX;
      if (move(t.clientX, t.clientY)) event.preventDefault();
    };
    const tend = () => end(lastX, false);
    el.addEventListener('touchstart', tstart, { passive: true });
    el.addEventListener('touchmove', tmove, { passive: false });
    el.addEventListener('touchend', tend);
    el.addEventListener('touchcancel', () => end(lastX, true));
    return () => {
      el.removeEventListener('touchstart', tstart);
      el.removeEventListener('touchmove', tmove);
      el.removeEventListener('touchend', tend);
    };
  }, []);

  const ease = easing && !dragging ? 'transition-[clip-path,left] duration-200 ease-out' : '';
  return (
    <div
      ref={root}
      className={cn(
        'relative size-full touch-pan-y overflow-hidden select-none [-webkit-touch-callout:none] [-webkit-user-select:none] [&_canvas]:pointer-events-none [&_img]:pointer-events-none',
        dragging ? 'cursor-grabbing' : 'cursor-ew-resize',
        className,
      )}
    >
      <div className="absolute inset-0">{before}</div>
      <div className={cn('absolute inset-0', ease)} style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        {after}
      </div>
      <div className={cn('pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_4px_rgba(0,0,0,0.4)]', ease)} style={{ left: `${position}%` }} />
      {/* The handle: 44 px, a slider for the keyboard and for screen readers. */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 10 : 2;
          const next = event.key === 'ArrowLeft' ? position - step : event.key === 'ArrowRight' ? position + step : event.key === 'Home' ? 0 : event.key === 'End' ? 100 : null;
          if (next === null) return;
          event.preventDefault();
          setEasing(false);
          onPosition(Math.min(100, Math.max(0, next)));
        }}
        className={cn('absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white', ease)}
        style={{ left: `${position}%` }}
      >
        <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-black/35 text-white shadow-md backdrop-blur-sm" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M9 6 3 12l6 6zM15 6l6 6-6 6z" />
          </svg>
        </span>
      </div>
      {children}
    </div>
  );
}
