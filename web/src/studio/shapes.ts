/**
 * Builders of SVG path data for the stickers and the frames of the Studio. Every shape is drawn
 * clockwise on the screen, so shapes of one path add up under the nonzero rule.
 */

const n = (value: number) => String(Math.round(value * 100) / 100);
const pt = (x: number, y: number) => `${n(x)} ${n(y)}`;

export type Point = readonly [number, number];

/** `point` turned by `degrees` around `cx`, `cy`. */
export function turn([x, y]: Point, cx: number, cy: number, degrees: number): Point {
  const a = (degrees * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
}

export function circle(cx: number, cy: number, r: number): string {
  return `M${pt(cx - r, cy)}A${n(r)} ${n(r)} 0 1 1 ${pt(cx + r, cy)}A${n(r)} ${n(r)} 0 1 1 ${pt(cx - r, cy)}Z`;
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, degrees = 0): string {
  const [x1, y1] = turn([cx - rx, cy], cx, cy, degrees);
  const [x2, y2] = turn([cx + rx, cy], cx, cy, degrees);
  return `M${pt(x1, y1)}A${n(rx)} ${n(ry)} ${n(degrees)} 1 1 ${pt(x2, y2)}A${n(rx)} ${n(ry)} ${n(degrees)} 1 1 ${pt(x1, y1)}Z`;
}

export function rect(x: number, y: number, w: number, h: number, r = 0): string {
  if (!r) return `M${pt(x, y)}H${n(x + w)}V${n(y + h)}H${n(x)}Z`;
  r = Math.min(r, w / 2, h / 2);
  return (
    `M${pt(x + r, y)}H${n(x + w - r)}A${n(r)} ${n(r)} 0 0 1 ${pt(x + w, y + r)}V${n(y + h - r)}` +
    `A${n(r)} ${n(r)} 0 0 1 ${pt(x + w - r, y + h)}H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${pt(x, y + h - r)}V${n(y + r)}` +
    `A${n(r)} ${n(r)} 0 0 1 ${pt(x + r, y)}Z`
  );
}

/** A rectangle of `w` by `h` centered on `cx`, `cy`, turned by `degrees`. */
export function turnedRect(cx: number, cy: number, w: number, h: number, degrees: number): string {
  return poly(
    ...[
      [cx - w / 2, cy - h / 2],
      [cx + w / 2, cy - h / 2],
      [cx + w / 2, cy + h / 2],
      [cx - w / 2, cy + h / 2],
    ].flatMap((p) => turn(p as unknown as Point, cx, cy, degrees)),
  );
}

export function poly(...xy: number[]): string {
  let d = '';
  for (let i = 0; i + 1 < xy.length; i += 2) d += `${i ? 'L' : 'M'}${pt(xy[i]!, xy[i + 1]!)}`;
  return `${d}Z`;
}

/** An open line through the points, for a stroke. */
export function line(...xy: number[]): string {
  let d = '';
  for (let i = 0; i + 1 < xy.length; i += 2) d += `${i ? 'L' : 'M'}${pt(xy[i]!, xy[i + 1]!)}`;
  return d;
}

export function star(cx: number, cy: number, points: number, outer: number, inner: number, degrees = -90): string {
  const xy: number[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = ((degrees + (i * 180) / points) * Math.PI) / 180;
    xy.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return poly(...xy);
}

/** A heart about `2s` wide, centered on `cx`, `cy`. */
export function heart(cx: number, cy: number, s: number, degrees = 0): string {
  const p = (x: number, y: number) => {
    const [a, b] = turn([cx + x * s, cy + y * s], cx, cy, degrees);
    return pt(a, b);
  };
  return (
    `M${p(0, -0.5)}C${p(0.45, -1.05)} ${p(1, -0.85)} ${p(1, -0.33)}C${p(1, 0.12)} ${p(0.35, 0.55)} ${p(0, 0.92)}` +
    `C${p(-0.35, 0.55)} ${p(-1, 0.12)} ${p(-1, -0.33)}C${p(-1, -0.85)} ${p(-0.45, -1.05)} ${p(0, -0.5)}Z`
  );
}

/** A drop of water, its point up, `s` from the point to the center, turned by `degrees`. */
export function drop(cx: number, cy: number, s: number, degrees = 0): string {
  const p = (x: number, y: number) => {
    const [a, b] = turn([cx + x * s, cy + y * s], cx, cy, degrees);
    return pt(a, b);
  };
  return `M${p(0, -1)}C${p(0.25, -0.55)} ${p(0.75, -0.15)} ${p(0.75, 0.3)}C${p(0.75, 0.75)} ${p(0.4, 1)} ${p(0, 1)}C${p(-0.4, 1)} ${p(-0.75, 0.75)} ${p(-0.75, 0.3)}C${p(-0.75, -0.15)} ${p(-0.25, -0.55)} ${p(0, -1)}Z`;
}

/** A petal from `cx`, `cy` out to `length` in the direction `degrees`, `width` wide. */
export function petal(cx: number, cy: number, length: number, width: number, degrees: number): string {
  const p = (x: number, y: number) => {
    const [a, b] = turn([cx + x, cy + y], cx, cy, degrees);
    return pt(a, b);
  };
  return `M${p(0, 0)}C${p(width * 0.7, -length * 0.25)} ${p(width * 0.6, -length * 0.95)} ${p(0, -length)}C${p(-width * 0.6, -length * 0.95)} ${p(-width * 0.7, -length * 0.25)} ${p(0, 0)}Z`;
}

/** The part of the circle `c1` outside the circle `c2`: a crescent. */
export function crescent(c1: [number, number, number], c2: [number, number, number]): string {
  const [x1, y1, r1] = c1;
  const [x2, y2, r2] = c2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const mx = x1 + (a * dx) / d;
  const my = y1 + (a * dy) / d;
  const p1: Point = [mx + (h * -dy) / d, my + (h * dx) / d];
  const p2: Point = [mx - (h * -dy) / d, my - (h * dx) / d];
  // Around the far side of the first circle, then back along the near side of the second.
  return `M${pt(...p1)}A${n(r1)} ${n(r1)} 0 1 1 ${pt(...p2)}A${n(r2)} ${n(r2)} 0 0 0 ${pt(...p1)}Z`;
}

/** An arc of a circle as an open line, from `from` to `to` degrees, clockwise. */
export function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const a = (from * Math.PI) / 180;
  const b = (to * Math.PI) / 180;
  const large = Math.abs(to - from) % 360 > 180 ? 1 : 0;
  return `M${pt(cx + Math.cos(a) * r, cy + Math.sin(a) * r)}A${n(r)} ${n(r)} 0 ${large} 1 ${pt(cx + Math.cos(b) * r, cy + Math.sin(b) * r)}`;
}

/** Lines from `inner` to `outer` around a center, `count` of them, for rays and bursts. */
export function rays(cx: number, cy: number, inner: number, outer: number, count: number, degrees = -90): string {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = ((degrees + (i * 360) / count) * Math.PI) / 180;
    d += `M${pt(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)}L${pt(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer)}`;
  }
  return d;
}

/** Circles of radius `r` evenly around a center at distance `distance`. */
export function ring(cx: number, cy: number, distance: number, count: number, r: number, degrees = -90): string {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = ((degrees + (i * 360) / count) * Math.PI) / 180;
    d += circle(cx + Math.cos(a) * distance, cy + Math.sin(a) * distance, r);
  }
  return d;
}
