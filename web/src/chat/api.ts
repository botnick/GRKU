// The assistant's service: a session after the Turnstile check, then one streamed answer per
// message (services/plus/src/chat). The answer is Server-Sent Events over a POST: `meta`, text
// pieces, then `done` with the signature of the whole answer, or `replace`, `chips`, `error`.
import { PLUS_API } from '../plus';

export interface ChatSession {
  session: string;
  tier: 'free' | 'plus';
  limit: number;
  remaining: number;
  maxInput: number;
  /** Photos: the daily cap of this visitor (0: photos are off), what is left, the most in a message, and how many messages one counts as. */
  images?: { limit: number; remaining: number; max: number; weight: number };
}

/** A turn as the service takes it back: assistant turns with their signature. */
export interface Turn {
  role: 'user' | 'assistant';
  content: string;
  sig?: string;
}

/** What the page tells the assistant about where the visitor is; nothing personal. */
export interface ChatContext {
  page?: string;
  camera?: string;
  card?: boolean;
  looks?: number;
  error?: string;
  firmware?: string;
  likes?: string[];
}

export class ChatFailure extends Error {
  constructor(
    /** limit | slow down | cooldown | busy | closed | turnstile failed | no session | message too long | network | interrupted | … */
    public code: string,
    public status: number,
    public detail: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

/** The service of the assistant: the Plus Worker, or VITE_CHAT_API for a local one. */
export const CHAT_API: string = (import.meta.env?.VITE_CHAT_API as string | undefined) ?? PLUS_API;

async function failure(response: Response): Promise<ChatFailure> {
  const body = (await response.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
  return new ChatFailure(body.error ?? 'failed', response.status, body);
}

export async function openSession(turnstile: string | null, key: string | null): Promise<ChatSession> {
  let response: Response;
  try {
    response = await fetch(`${CHAT_API}/chat/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turnstile: turnstile ?? undefined, key: key ?? undefined }),
    });
  } catch {
    throw new ChatFailure('network', 0);
  }
  if (!response.ok) throw await failure(response);
  return (await response.json()) as ChatSession;
}

export interface StreamEvents {
  onMeta?(meta: { tier: 'free' | 'plus'; remaining: number; limit: number; imagesRemaining?: number }): void;
  onText(piece: string): void;
  onReplace?(text: string): void;
  onChips?(ids: string[]): void;
}

export interface StreamResult {
  sig: string | null;
  remaining: number | null;
  /** The pre-filter's reason when the service answered by itself. */
  fixed: string | null;
}

/** Reads SSE events from a stream of text: each `event:` and `data:` block, in order. */
export async function* sseEvents(stream: ReadableStream<Uint8Array>): AsyncGenerator<{ event: string; data: string }> {
  const reader = stream.pipeThrough(new TextDecoderStream() as unknown as ReadableWritablePair<string, Uint8Array>).getReader();
  let buffer = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (value) buffer += value;
      let end: number;
      while ((end = buffer.indexOf('\n\n')) >= 0) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        let event = 'message';
        const data: string[] = [];
        for (const line of block.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
        }
        if (data.length) yield { event, data: data.join('\n') };
      }
      if (done) return;
    }
  } finally {
    reader.releaseLock();
  }
}

/** Sends the conversation and streams the answer into `events`. */
export async function ask(
  session: string,
  turns: readonly Turn[],
  language: string,
  context: ChatContext,
  events: StreamEvents,
  signal?: AbortSignal,
  /** Photos of the last turn: JPEG base64, already shrunk (chat/image.ts). */
  images: readonly string[] = [],
): Promise<StreamResult> {
  let response: Response;
  try {
    response = await fetch(`${CHAT_API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session}` },
      body: JSON.stringify({ messages: turns, lang: language, context, ...(images.length ? { images: images.map((data) => ({ type: 'image/jpeg', data })) } : {}) }),
      signal,
    });
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') throw new ChatFailure('aborted', 0);
    throw new ChatFailure('network', 0);
  }
  if (!response.ok || !response.body) throw await failure(response);
  const result: StreamResult = { sig: null, remaining: null, fixed: null };
  try {
    for await (const { event, data } of sseEvents(response.body)) {
      const parsed = JSON.parse(data) as Record<string, unknown>;
      if (event === 'meta') events.onMeta?.(parsed as never);
      else if (event === 'message' && typeof parsed.d === 'string') events.onText(parsed.d);
      else if (event === 'replace' && typeof parsed.text === 'string') events.onReplace?.(parsed.text);
      else if (event === 'chips' && Array.isArray(parsed.ids)) events.onChips?.(parsed.ids.filter((id): id is string => typeof id === 'string'));
      else if (event === 'error') throw new ChatFailure(String(parsed.code ?? 'interrupted'), 200);
      else if (event === 'done') {
        result.sig = typeof parsed.sig === 'string' ? parsed.sig : null;
        result.remaining = typeof parsed.remaining === 'number' ? parsed.remaining : null;
        result.fixed = typeof parsed.fixed === 'string' ? parsed.fixed : null;
      }
    }
  } catch (error) {
    if (error instanceof ChatFailure) throw error;
    if ((error as { name?: string })?.name === 'AbortError') throw new ChatFailure('aborted', 0);
    throw new ChatFailure('interrupted', 0);
  }
  return result;
}
