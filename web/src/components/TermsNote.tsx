/**
 * The line next to a button that writes or downloads GRKU: continuing accepts the terms of use.
 * The link opens a new tab, which keeps the connected card and the selection of this page.
 */
export function TermsNote({ text, href }: { text: readonly [string, string, string]; href: string }) {
  const [before, link, after] = text;
  return (
    <p className="text-sm text-muted-foreground">
      {before}
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 hover:text-foreground"
      >
        {link}
      </a>
      {after}
    </p>
  );
}
