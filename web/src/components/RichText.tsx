import type { RichText as Parts } from '../i18n';

/**
 * Renders text parts. A part that starts with a backtick is code, and a part that starts with `[`
 * links to `link`.
 */
export function RichText({ parts, link }: { parts: Parts; link?: string }) {
  return parts.map((part, index) =>
    part.startsWith('`') ? (
      <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
        {part.slice(1)}
      </code>
    ) : part.startsWith('[') && link ? (
      <a key={index} href={link} className="underline underline-offset-4 hover:text-brand">
        {part.slice(1)}
      </a>
    ) : (
      <span key={index}>{part.startsWith('[') ? part.slice(1) : part}</span>
    ),
  );
}
