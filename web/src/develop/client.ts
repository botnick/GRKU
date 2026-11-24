/**
 * The page side of the Develop workers: one worker for the previews of the open photos, and a new
 * worker for each download, ended after it, so the memory of a full-size picture goes back.
 */
import wasmUrl from '../wasm/develop.wasm?url';
import type { LookUrls, Opened, Request, Response } from './protocol';
import type { DevelopSettings } from './settings';

let compiled: Promise<WebAssembly.Module> | null = null;
/** develop.wasm, compiled once for all the workers. */
function wasm(): Promise<WebAssembly.Module> {
  compiled ??= (async () => {
    const response = await fetch(wasmUrl);
    if (!response.ok) throw new Error(`develop.wasm: ${response.status}`);
    return WebAssembly.compile(await response.arrayBuffer());
  })();
  compiled.catch(() => (compiled = null));
  return compiled;
}

const newWorker = () => new Worker(new URL('./develop.worker.ts', import.meta.url), { type: 'module' });

export type Phase = Extract<Response, { type: 'progress' }>['phase'];

export interface Exported {
  blob: Blob;
  width: number;
  height: number;
  ms: number;
}

interface Waiting {
  resolve: (value: never) => void;
  reject: (error: Error) => void;
}

export class Developer {
  private worker: Worker | null = null;
  private next = 0;
  private seq = 0;
  private readonly opening = new Map<number, Waiting>();
  /** The waiting preview of each photo and channel (`id:channel`). */
  private readonly previews = new Map<string, Waiting & { seq: number }>();

  private async previewWorker(): Promise<Worker> {
    if (this.worker) return this.worker;
    const module = await wasm();
    if (this.worker) return this.worker;
    const worker = newWorker();
    worker.onmessage = ({ data }: MessageEvent<Response>) => this.receive(data);
    worker.onerror = () => this.fail('The preview worker stopped');
    worker.postMessage({ type: 'init', module } satisfies Request);
    this.worker = worker;
    return worker;
  }

  private fail(message: string) {
    this.worker?.terminate();
    this.worker = null;
    for (const waiting of [...this.opening.values(), ...this.previews.values()]) waiting.reject(new Error(message));
    this.opening.clear();
    this.previews.clear();
  }

  private receive(data: Response) {
    if (data.type === 'opened') {
      this.opening.get(data.id)?.resolve(data.photo as never);
      this.opening.delete(data.id);
    } else if (data.type === 'preview') {
      const key = `${data.id}:${data.channel}`;
      const waiting = this.previews.get(key);
      if (waiting?.seq === data.seq) {
        waiting.resolve(data as never);
        this.previews.delete(key);
      } else data.image.close();
    } else if (data.type === 'error') {
      if (data.seq === undefined) {
        this.opening.get(data.id)?.reject(new Error(data.message));
        this.opening.delete(data.id);
      } else {
        const key = `${data.id}:${data.channel}`;
        if (this.previews.get(key)?.seq === data.seq) {
          this.previews.get(key)!.reject(new Error(data.message));
          this.previews.delete(key);
        }
      }
    }
  }

  /** Opens a photo for previews, `side` pixels on its long side. */
  async open(file: File, side: number, standard: string): Promise<{ id: number; photo: Opened }> {
    const worker = await this.previewWorker();
    const id = ++this.next;
    const photo = await new Promise<Opened>((resolve, reject) => {
      this.opening.set(id, { resolve: resolve as (value: never) => void, reject });
      worker.postMessage({ type: 'open', id, file, side, standard } satisfies Request);
    });
    return { id, photo };
  }

  close(id: number): void {
    this.worker?.postMessage({ type: 'close', id } satisfies Request);
    for (const [key, waiting] of this.previews) {
      if (!key.startsWith(`${id}:`)) continue;
      waiting.resolve(null as never);
      this.previews.delete(key);
    }
  }

  /**
   * The preview of `settings` on photo `id`. A newer request for the same photo and channel
   * replaces it: the older one then resolves null. `thumb` makes a small one.
   */
  async preview(id: number, settings: DevelopSettings, urls: LookUrls, channel = 'main', thumb?: number): Promise<{ image: ImageBitmap; ms: number; margins: [number, number, number, number] } | null> {
    const worker = await this.previewWorker();
    const seq = ++this.seq;
    const key = `${id}:${channel}`;
    this.previews.get(key)?.resolve(null as never);
    return new Promise((resolve, reject) => {
      this.previews.set(key, { seq, resolve: resolve as (value: never) => void, reject });
      worker.postMessage({ type: 'preview', id, seq, channel, settings, urls, thumb } satisfies Request);
    });
  }

  /** Develops `file` at full size in a worker of its own and makes its JPEG. */
  async export(
    file: File,
    settings: DevelopSettings,
    urls: LookUrls,
    limits: { maxSide: number | null; credit: string | null; seed: number; processSide: number | null },
    progress: (phase: Phase, fraction: number) => void,
    signal?: AbortSignal,
  ): Promise<Exported> {
    const module = await wasm();
    const worker = newWorker();
    try {
      return await new Promise<Exported>((resolve, reject) => {
        const abort = () => reject(signal!.reason ?? new Error('Cancelled'));
        signal?.addEventListener('abort', abort, { once: true });
        worker.onmessage = ({ data }: MessageEvent<Response>) => {
          if (data.type === 'progress') progress(data.phase, data.fraction);
          else if (data.type === 'exported') resolve(data);
          else if (data.type === 'error') reject(new Error(data.message));
        };
        // A worker that runs out of memory ends without a message.
        worker.onerror = (event) => reject(new Error(event.message || 'memory'));
        worker.postMessage({ type: 'init', module } satisfies Request);
        worker.postMessage({ type: 'export', id: 1, file, settings, urls, ...limits } satisfies Request);
      });
    } finally {
      worker.terminate();
    }
  }

  dispose(): void {
    this.fail('Closed');
  }
}

/**
 * The longest side that this device develops: a phone that tells little memory
 * (navigator.deviceMemory, in GB) takes a smaller picture; null for the full size.
 */
export function processSide(): number | null {
  const memory = typeof navigator === 'undefined' ? undefined : (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory === undefined) return null;
  return memory <= 2 ? 3000 : memory <= 4 ? 4096 : null;
}

/** The side that a download takes again after it ran out of memory. */
export const SMALL_SIDE = 3000;

/** The long side of the previews for this screen. */
export function previewSide(): number {
  if (typeof window === 'undefined') return 1600;
  const css = Math.max(Math.min(window.innerWidth, 1280) * 0.62, Math.min(window.innerWidth, 900));
  // A phone takes a smaller preview: its screen is small, and its memory too.
  const most = window.innerWidth < 768 ? 1280 : 1920;
  return Math.max(1024, Math.min(most, Math.round((css * Math.min(2, window.devicePixelRatio || 1)) / 64) * 64));
}
