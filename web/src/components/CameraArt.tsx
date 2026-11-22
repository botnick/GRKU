import { cn } from '@/lib/utils';

/** The angle of view of each camera entry, as a 35 mm focal length. */
export const FOCAL_LENGTH: Readonly<Record<string, string>> = {
  gr3: '28mm',
  gr3x: '40mm',
  gr4: '28mm',
  gr4m: '28mm',
};

/**
 * A plain drawing of a compact GR seen from the front: the grip, the lens, the shutter button.
 * The 40 mm lens of the GR IIIx draws larger. It stands for
 * the camera on the camera step; it is no product photo.
 */
export function CameraArt({ camera, className }: { camera: string; className?: string }) {
  const wide = FOCAL_LENGTH[camera] !== '40mm';
  const lens = wide ? 22 : 25;
  return (
    <svg viewBox="0 0 160 96" className={cn('h-auto w-full', className)} aria-hidden="true" focusable="false">
      {/* The shutter and the power button on the top plate. */}
      <rect x="112" y="11" width="16" height="6" rx="2" fill="#3a3a3a" />
      <rect x="92" y="13" width="10" height="4" rx="1.5" fill="#383838" />
      {/* The body and its grip. */}
      <rect x="10" y="16" width="140" height="66" rx="12" fill="#2b2b2b" stroke="rgba(255,255,255,0.14)" />
      <rect x="10" y="16" width="34" height="66" rx="12" fill="#333" />
      <rect x="32" y="16" width="12" height="66" fill="#333" />
      {/* The lens: barrel, ring, glass, and a highlight on the glass. */}
      <circle cx="92" cy="50" r={lens} fill="#151515" stroke="#4a4a4a" strokeWidth="1.5" />
      <circle cx="92" cy="50" r={lens - 7} fill="#0c0c0c" stroke="#2a2a2a" />
      <circle cx="92" cy="50" r={lens - 13} fill="#141619" />
      <path d={`M ${92 - (lens - 16)} ${50 - 3} a ${lens - 14} ${lens - 14} 0 0 1 ${lens - 12} ${-(lens - 18)}`} stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* The GR mark. */}
      <text x="134" y="31" textAnchor="end" fontSize="8" fontWeight="700" fill="#d4d4d4" fontFamily="Inter, sans-serif" letterSpacing="0.5">
        GR
      </text>
    </svg>
  );
}
