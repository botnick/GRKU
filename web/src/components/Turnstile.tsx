import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render(container: HTMLElement, options: Record<string, unknown>): string;
      reset(id: string): void;
      remove(id: string): void;
    };
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<void> | null = null;

/** Loads the Turnstile script once. */
function load(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('turnstile script'));
      document.head.appendChild(script);
    });
  }
  return loading;
}

/**
 * Cloudflare Turnstile, rendered explicitly so the token reaches React: `onToken` gets a token, or
 * null when it expires or fails. `resetKey` changes after a submission, so a new token is issued.
 */
export function Turnstile({ siteKey, action, onToken, resetKey, theme = 'dark', language = 'auto' }: { siteKey: string; action: string; onToken: (token: string | null) => void; resetKey: number; theme?: 'light' | 'dark' | 'auto'; /** A Turnstile language tag such as th, ja, ko, zh-cn, zh-tw, en, or auto. */ language?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const latest = useRef(onToken);
  latest.current = onToken;

  useEffect(() => {
    let live = true;
    load()
      .then(() => {
        if (!live || !box.current || !window.turnstile) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          action,
          theme,
          language,
          size: 'flexible',
          callback: (token: string) => latest.current(token),
          'expired-callback': () => latest.current(null),
          'error-callback': () => latest.current(null),
        });
      })
      .catch(() => latest.current(null));
    return () => {
      live = false;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey, action, theme, language]);

  useEffect(() => {
    if (resetKey > 0 && widget.current && window.turnstile) {
      latest.current(null);
      window.turnstile.reset(widget.current);
    }
  }, [resetKey]);

  return <div ref={box} className="min-h-[65px]" />;
}
