import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Plain drawings for the install guide, in the greys of CameraArt with the one red of the brand
// for what to press. They stand for the computer, the card, and the back of a GR; they are no
// product photos. The words on them are the words on the camera and on the card, so every
// language shows them as they are.

const RED = "#d94135";
const BODY = "#2b2b2b";
const EDGE = "rgba(255,255,255,0.14)";
const KEY = "#3a3a3a";
const LABEL = "#d4d4d4";
const MONO = "JetBrains Mono, ui-monospace, monospace";
const SANS = "Inter, sans-serif";

function Art({
  viewBox,
  className,
  children,
}: {
  viewBox: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** A red ring around what to press, with its order in a small red disc. */
function Press({
  x,
  y,
  r,
  n,
}: {
  x: number;
  y: number;
  r: number;
  n?: number;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 5} fill={RED} opacity="0.16" />
      <circle
        cx={x}
        cy={y}
        r={r + 2}
        fill="none"
        stroke={RED}
        strokeWidth="2.2"
      />
      {n !== undefined && (
        <g>
          <circle cx={x + r + 3} cy={y - r - 3} r="7" fill={RED} />
          <text
            x={x + r + 3}
            y={y - r - 0.6}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            fill="#fff"
            fontFamily={SANS}
          >
            {n}
          </text>
        </g>
      )}
    </g>
  );
}

/** An SD card: the notched corner and the contacts. */
function SdCard({
  x,
  y,
  w = 26,
  h = 34,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
}) {
  const notch = w * 0.3;
  return (
    <g>
      <path
        d={`M ${x} ${y + notch} L ${x + notch} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`}
        fill="#34343a"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1"
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={x + notch + 1 + i * ((w - notch - 3) / 4)}
          y={y + 3}
          // A small card keeps thin contacts: a negative width is an error in the SVG.
          width={Math.max(0.5, (w - notch - 3) / 4 - 1.5)}
          height={h * 0.2}
          rx="0.6"
          fill="#b08d3c"
        />
      ))}
      <text
        x={x + w / 2}
        y={y + h * 0.75}
        textAnchor="middle"
        fontSize={w * 0.32}
        fontWeight="700"
        fill={LABEL}
        fontFamily={SANS}
      >
        SD
      </text>
    </g>
  );
}

/** A computer with the site open in its browser, and a card reader with the SD card going in. */
export function ComputerArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 260 150" className={className}>
      {/* The laptop: the screen with a browser, then the base. */}
      <rect
        x="18"
        y="14"
        width="160"
        height="104"
        rx="7"
        fill="#202020"
        stroke={EDGE}
      />
      <rect x="25" y="21" width="146" height="90" rx="3" fill="#141414" />
      <rect x="25" y="21" width="146" height="13" rx="3" fill="#262626" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={32 + i * 6} cy="27.5" r="1.8" fill="#4a4a4a" />
      ))}
      <rect x="54" y="24.5" width="70" height="6" rx="3" fill="#1a1a1a" />
      <text
        x="89"
        y="29.6"
        textAnchor="middle"
        fontSize="5"
        fill="#a3a3a3"
        fontFamily={MONO}
      >
        grku.app
      </text>
      <text
        x="36"
        y="56"
        fontSize="13"
        fontWeight="800"
        fill="#f7f7f2"
        fontFamily={SANS}
        letterSpacing="-0.4"
      >
        GRKU<tspan fill={RED}>.</tspan>
      </text>
      <rect x="36" y="63" width="78" height="4" rx="2" fill="#3a3a3a" />
      <rect x="36" y="71" width="58" height="4" rx="2" fill="#2e2e2e" />
      <rect x="36" y="86" width="52" height="13" rx="3.5" fill={RED} />
      <rect
        x="44"
        y="91"
        width="36"
        height="3"
        rx="1.5"
        fill="#fff"
        opacity="0.85"
      />
      <path
        d="M 8 118 L 188 118 L 182 128 L 14 128 Z"
        fill="#262626"
        stroke={EDGE}
      />
      <rect x="84" y="119" width="28" height="3" rx="1.5" fill="#1a1a1a" />
      {/* The cable from the laptop to the card reader. */}
      <path
        d="M 186 123 C 200 123 204 128 214 128"
        stroke="#4a4a4a"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* The card reader, the card above it, and an arrow down. */}
      <rect
        x="212"
        y="114"
        width="40"
        height="22"
        rx="5"
        fill="#2b2b2b"
        stroke={EDGE}
      />
      <rect x="218" y="113" width="28" height="3" rx="1.5" fill="#111" />
      <circle cx="246" cy="130" r="1.6" fill={RED} />
      <SdCard x={219} y={62} w={26} h={34} />
      <path
        d="M 232 99 L 232 108 M 228 104.5 L 232 108.5 L 236 104.5"
        stroke={RED}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Art>
  );
}

/** A folder icon at (x, y). */
function Folder({
  x,
  y,
  color = "#5b8fd6",
}: {
  x: number;
  y: number;
  color?: string;
}) {
  return (
    <path
      d={`M ${x} ${y + 1} h 4 l 1.5 1.6 h 6.5 v 7.4 h -12 z`}
      fill={color}
    />
  );
}

/** A file icon at (x, y). */
function File({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x + 1} ${y} h 6 l 3 3 v 8 h -9 z`} fill="#d4d4d4" />;
}

/** The contents of SD_ROOT copied to the top level of the card, not the folder itself. */
export function CopyArt({ className }: { className?: string }) {
  const rows = [
    { name: "SCRIPT", folder: true },
    { name: "DEVELOP.MOD", folder: false },
    { name: "0007…", folder: false },
  ];
  return (
    <Art viewBox="0 0 280 150" className={className}>
      {/* The SD_ROOT folder of GRKU.zip, open, with what is inside it. */}
      <rect
        x="8"
        y="16"
        width="110"
        height="118"
        rx="8"
        fill="#202020"
        stroke={EDGE}
      />
      <Folder x={18} y={26} color="#8a8a8a" />
      <text
        x="36"
        y="35"
        fontSize="9"
        fontWeight="600"
        fill="#a3a3a3"
        fontFamily={MONO}
      >
        SD_ROOT
      </text>
      <line x1="8" y1="46" x2="118" y2="46" stroke={EDGE} />
      <rect
        x="14"
        y="52"
        width="98"
        height="74"
        rx="5"
        fill="none"
        stroke={RED}
        strokeDasharray="3 3"
        strokeWidth="1.2"
      />
      {rows.map((row, i) => (
        <g key={row.name}>
          {row.folder ? (
            <Folder x={22} y={60 + i * 21} />
          ) : (
            <File x={23} y={60 + i * 21} />
          )}
          <text
            x="40"
            y={69 + i * 21}
            fontSize="8.5"
            fill="#f7f7f2"
            fontFamily={MONO}
          >
            {row.name}
          </text>
        </g>
      ))}
      {/* The arrow to the card. */}
      <path
        d="M 126 89 L 150 89 M 144 83 L 150 89 L 144 95"
        stroke={RED}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The top level of the SD card, with DCIM of the camera and the new files. */}
      <rect
        x="158"
        y="16"
        width="114"
        height="118"
        rx="8"
        fill="#202020"
        stroke={EDGE}
      />
      <SdCard x={167} y={24} w={11} h={14} />
      <text
        x="185"
        y="35"
        fontSize="9"
        fontWeight="600"
        fill="#a3a3a3"
        fontFamily={SANS}
      >
        SD
      </text>
      <line x1="158" y1="46" x2="272" y2="46" stroke={EDGE} />
      <Folder x={170} y={53} color="#3b5a86" />
      <text x="188" y="62" fontSize="8.5" fill="#777" fontFamily={MONO}>
        DCIM
      </text>
      {rows.map((row, i) => (
        <g key={row.name}>
          <rect
            x="164"
            y={68 + i * 21}
            width="102"
            height="18"
            rx="4"
            fill={RED}
            opacity="0.14"
          />
          {row.folder ? (
            <Folder x={170} y={72 + i * 21} />
          ) : (
            <File x={171} y={72 + i * 21} />
          )}
          <text
            x="188"
            y={81 + i * 21}
            fontSize="8.5"
            fill="#f7f7f2"
            fontFamily={MONO}
          >
            {row.name}
          </text>
        </g>
      ))}
    </Art>
  );
}

/** The SD card going into the card slot under the camera. */
export function InsertArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 320 190" className={className}>
      {/* The camera from the front, its base toward the card. */}
      <rect
        x="40"
        y="36"
        width="240"
        height="96"
        rx="16"
        fill={BODY}
        stroke={EDGE}
      />
      <rect x="40" y="36" width="54" height="96" rx="16" fill="#333" />
      <rect x="76" y="36" width="18" height="96" fill="#333" />
      <rect x="226" y="28" width="28" height="9" rx="3" fill={KEY} />
      <rect x="190" y="31" width="18" height="6" rx="2" fill="#383838" />
      <circle
        cx="170"
        cy="84"
        r="34"
        fill="#151515"
        stroke="#4a4a4a"
        strokeWidth="2"
      />
      <circle cx="170" cy="84" r="24" fill="#0c0c0c" stroke="#2a2a2a" />
      <circle cx="170" cy="84" r="14" fill="#141619" />
      <text
        x="262"
        y="58"
        textAnchor="end"
        fontSize="11"
        fontWeight="700"
        fill={LABEL}
        fontFamily={SANS}
        letterSpacing="0.6"
      >
        GR
      </text>
      {/* The open door of the battery and the card under the grip. */}
      <rect
        x="52"
        y="132"
        width="44"
        height="6"
        rx="2"
        fill="#111"
        stroke={EDGE}
      />
      <SdCard x={60} y={150} w={28} h={34} />
      <path
        d="M 74 146 L 74 140 M 70 143.5 L 74 139.5 L 78 143.5"
        stroke={RED}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Art>
  );
}

type Screen = "modeset" | "loaded" | "adj" | "look";
type Target = "menu" | "power" | "adj" | "ok" | "grku";

/**
 * The back of a GR as the camera screens of the guide PDF show it: the screen at the left, the ADJ
 * lever, Fn, the dial with OK, MENU and DISP at the right, and the shutter and the power button
 * on the top plate. `press` rings the buttons to press, numbered in that order.
 */
export function CameraBackArt({
  screen,
  press = [],
  className,
}: {
  screen: Screen;
  press?: readonly Target[];
  className?: string;
}) {
  const at: Record<Target, { x: number; y: number; r: number }> = {
    power: { x: 205, y: 10, r: 9 },
    adj: { x: 266, y: 41, r: 14 },
    menu: { x: 244, y: 164, r: 11 },
    ok: { x: 278, y: 115, r: 10 },
    grku: { x: 196.5, y: 43, r: 9 },
  };
  return (
    <Art viewBox="0 -14 320 210" className={className}>
      {/* The top plate: the power button and the shutter. */}
      <rect x="194" y="8" width="22" height="9" rx="2.5" fill={KEY} />
      <rect x="248" y="5" width="34" height="12" rx="3" fill={KEY} />
      {/* The body. */}
      <rect
        x="4"
        y="15"
        width="312"
        height="176"
        rx="18"
        fill={BODY}
        stroke={EDGE}
      />
      <rect x="226" y="58" width="82" height="126" rx="10" fill="#262626" />
      {/* The screen. */}
      <rect
        x="16"
        y="28"
        width="196"
        height="150"
        rx="7"
        fill="#0a0a0a"
        stroke="#1f1f1f"
      />
      <CameraScreen screen={screen} />
      {/* ADJ, Fn, the dial, MENU, and DISP. */}
      <text
        x="244"
        y="44"
        textAnchor="end"
        fontSize="7.5"
        fontWeight="700"
        fill={LABEL}
        fontFamily={SANS}
      >
        ADJ
      </text>
      <rect x="250" y="34" width="32" height="14" rx="4" fill="#444" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={254 + i * 3.8}
          y="36"
          width="1.4"
          height="10"
          rx="0.7"
          fill="#5c5c5c"
        />
      ))}
      <circle cx="244" cy="77" r="11" fill={KEY} stroke="#4a4a4a" />
      <text
        x="244"
        y="80"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="700"
        fill={LABEL}
        fontFamily={SANS}
      >
        Fn
      </text>
      <circle cx="278" cy="115" r="28" fill="#1d1d1d" stroke="#4a4a4a" />
      <circle cx="278" cy="115" r="10" fill={KEY} stroke="#4a4a4a" />
      <text
        x="278"
        y="118"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill={LABEL}
        fontFamily={SANS}
      >
        OK
      </text>
      <circle cx="244" cy="164" r="11" fill={KEY} stroke="#4a4a4a" />
      <text
        x="244"
        y="166.6"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill={LABEL}
        fontFamily={SANS}
      >
        MENU
      </text>
      <circle cx="294" cy="164" r="11" fill={KEY} stroke="#4a4a4a" />
      <text
        x="294"
        y="166.6"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill={LABEL}
        fontFamily={SANS}
      >
        DISP
      </text>
      {press.map((target, index) => (
        <Press
          key={target}
          {...at[target]}
          n={press.length > 1 ? index + 1 : undefined}
        />
      ))}
    </Art>
  );
}

/** A shooting screen: a plain scene of sky and ground. */
function Scene() {
  return (
    <g>
      <defs>
        <linearGradient id="guide-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d5f86" />
          <stop offset="1" stopColor="#8fa9c4" />
        </linearGradient>
      </defs>
      <rect
        x="18"
        y="30"
        width="192"
        height="146"
        rx="5"
        fill="url(#guide-sky)"
      />
      <path
        d="M 18 132 L 70 112 L 110 122 L 160 104 L 210 118 L 210 176 L 18 176 Z"
        fill="#3e5a3a"
      />
      <path d="M 18 150 L 210 140 L 210 176 L 18 176 Z" fill="#2f4630" />
    </g>
  );
}

/** A text on the screen in the style of the camera: light type on a dark band. */
function ScreenLabel({
  x,
  y,
  text,
  size = 10,
}: {
  x: number;
  y: number;
  text: string;
  size?: number;
}) {
  const width = text.length * size * 0.62 + 6;
  return (
    <g>
      <rect
        x={x - 3}
        y={y - size}
        width={width}
        height={size + 4}
        fill="#000"
        opacity="0.55"
      />
      <text x={x} y={y} fontSize={size} fill="#f2f2f2" fontFamily={MONO}>
        {text}
      </text>
    </g>
  );
}

/** The ADJ menu: a row of six icons with GRKU last, and the GRKU list under it. */
function AdjMenu({ list }: { list: boolean }) {
  return (
    <g>
      <rect
        x="114"
        y="34"
        width="92"
        height="18"
        rx="2"
        fill="#000"
        opacity="0.6"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={117 + i * 14.6}
          y="37"
          width="12"
          height="12"
          rx="1.5"
          fill="#d8d8d8"
          opacity="0.75"
        />
      ))}
      <rect
        x="189"
        y="35.5"
        width="15"
        height="15"
        rx="1.5"
        fill="#111"
        stroke="#f2c230"
        strokeWidth="1.6"
      />
      {/* The GRKU icon of the camera: a ring in the colors of the film looks over the word GRKU. */}
      {["#e8503a", "#f2c230", "#46b37a", "#3d7fd6", "#a35bd4"].map(
        (color, i) => (
          <circle
            key={color}
            cx="196.5"
            cy="41.4"
            r="3.5"
            fill="none"
            stroke={color}
            strokeWidth="1.3"
            strokeDasharray="4.4 17.6"
            strokeDashoffset={-i * 4.4}
            transform="rotate(-90 196.5 41.4)"
          />
        ),
      )}
      <text
        x="196.5"
        y="49"
        textAnchor="middle"
        fontSize="3.4"
        fontWeight="700"
        fill="#f2f2f2"
        fontFamily={SANS}
      >
        GRKU
      </text>
      {list && (
        <g>
          <rect
            x="186"
            y="54"
            width="21"
            height="96"
            rx="2"
            fill="#1c1c1c"
            opacity="0.92"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x="189.5"
              y={57.5 + i * 18.5}
              width="14"
              height="14"
              rx="1.5"
              fill={i === 0 ? "#f2c230" : "#5d7f9e"}
              opacity={i === 0 ? 1 : 0.8}
            />
          ))}
        </g>
      )}
    </g>
  );
}

function CameraScreen({ screen }: { screen: Screen }) {
  switch (screen) {
    case "modeset":
      return (
        <g fontFamily={MONO} fill="#f2f2f2">
          <text x="114" y="50" textAnchor="middle" fontSize="11">
            Mode Set Command
          </text>
          <line
            x1="22"
            y1="56"
            x2="206"
            y2="56"
            stroke="#bdbdbd"
            strokeWidth="0.8"
          />
          <text x="24" y="88" fontSize="10.5">
            Script - Enable
          </text>
          <text x="114" y="124" textAnchor="middle" fontSize="10.5">
            Complete
          </text>
        </g>
      );
    case "loaded":
      return (
        <g>
          <Scene />
          <ScreenLabel x={24} y={46} text="GRKU" size={12} />
        </g>
      );
    case "adj":
      return (
        <g>
          <Scene />
          <ScreenLabel x={24} y={46} text="GRKU" size={10} />
          <AdjMenu list={false} />
        </g>
      );
    case "look":
      return (
        <g>
          <Scene />
          <rect
            x="18"
            y="30"
            width="192"
            height="146"
            rx="5"
            fill="#e0a060"
            opacity="0.18"
          />
          <ScreenLabel x={24} y={46} text="GRKU" size={10} />
          <ScreenLabel x={24} y={64} text="Film Look" size={9} />
          <AdjMenu list />
        </g>
      );
  }
}
