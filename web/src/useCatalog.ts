import { useCallback, useEffect, useState } from 'react';
import { loadCatalog, type Catalog } from './catalog';

/**
 * The catalog of `target` once it is here, without suspending: the page around it renders at
 * once, also for the prerender, where the request never answers. `error` is set when the request
 * failed, and `retry` asks again.
 */
export function useCatalog(target: string): { catalog: Catalog | null; error: boolean; retry: () => void } {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setError(false);
    loadCatalog(target)
      .then((loaded) => {
        if (live) setCatalog(loaded);
      })
      .catch((failure: unknown) => {
        console.error(failure);
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, [target, attempt]);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return { catalog, error, retry };
}
