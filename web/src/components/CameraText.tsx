import { PICTURE_HEIGHT, PICTURE_WIDTH } from '../shutdownPicture';

/**
 * The text that the camera draws over the picture: the bar of the shot counts and the firmware
 * version, at their places on the screen of 720 by 480. The preview shows where the picture stays
 * free of them.
 */
export function CameraText({ firmware }: { firmware: string }) {
  const version = /\d+\.\d+/.exec(firmware)?.[0];
  return (
    <svg className="pointer-events-none absolute inset-0 size-full fill-white font-mono" viewBox={`0 0 ${PICTURE_WIDTH} ${PICTURE_HEIGHT}`} aria-hidden="true">
      <rect x="20" y="340" width="680" height="40" fill="#000" fillOpacity="0.45" />
      <text x="360" y="371" textAnchor="middle" fontSize="30" textLength="545" lengthAdjust="spacingAndGlyphs">
        Today : 0000000 &gt; Total: 0000000
      </text>
      {version && (
        <text x="710" y="462" textAnchor="end" fontSize="30" textLength="176" lengthAdjust="spacingAndGlyphs">
          FW Ver.{version}
        </text>
      )}
    </svg>
  );
}
