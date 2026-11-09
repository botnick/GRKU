// A small SMTP client for Cloudflare Workers: one connection over a TCP socket, STARTTLS, AUTH PLAIN,
// one message. It sends the GRKU Plus mails from the hosting mailbox (noreply@grku.app) instead of
// a mail API. Only what Exim and the other common servers need; no pipelining, no retries.
import { connect } from 'cloudflare:sockets';

export interface SmtpAccount {
  /** The host whose certificate the server presents for STARTTLS (it is also the TCP target). */
  host: string;
  port: number;
  user: string;
  pass: string;
}

export interface Mail {
  from: { name: string; address: string };
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Sends one message; throws with the server's reply when a step is refused. */
export async function sendMail(account: SmtpAccount, mail: Mail): Promise<void> {
  const socket = connect({ hostname: account.host, port: account.port }, { secureTransport: 'starttls', allowHalfOpen: false });
  const plain = new Session(socket.readable, socket.writable);
  await plain.expect(220);
  await plain.command(`EHLO grku.app`, 250);
  await plain.command('STARTTLS', 220);
  plain.release();

  const tls = socket.startTls();
  const session = new Session(tls.readable, tls.writable);
  try {
    await session.command(`EHLO grku.app`, 250);
    await session.command(`AUTH PLAIN ${btoa(`\0${account.user}\0${account.pass}`)}`, 235);
    await session.command(`MAIL FROM:<${mail.from.address}>`, 250);
    await session.command(`RCPT TO:<${mail.to}>`, 250);
    await session.command('DATA', 354);
    await session.command(`${message(mail)}\r\n.`, 250);
    await session.command('QUIT', 221).catch(() => undefined);
  } finally {
    session.release();
    await tls.close().catch(() => undefined);
  }
}

/** One SMTP conversation on a pair of streams: write a line, read the reply, check its code. */
class Session {
  private readonly reader: ReadableStreamDefaultReader<Uint8Array>;
  private readonly writer: WritableStreamDefaultWriter<Uint8Array>;
  private buffer = '';

  constructor(readable: ReadableStream<Uint8Array>, writable: WritableStream<Uint8Array>) {
    this.reader = readable.getReader();
    this.writer = writable.getWriter();
  }

  async command(line: string, code: number): Promise<string> {
    await this.writer.write(new TextEncoder().encode(`${line}\r\n`));
    return this.expect(code);
  }

  /** Reads one (possibly multi-line) reply and checks its code. */
  async expect(code: number): Promise<string> {
    const reply = await this.reply();
    if (!reply.startsWith(`${code} `) && !reply.startsWith(`${code}-`)) throw new Error(`smtp: expected ${code}, got ${reply.split('\r\n')[0]}`);
    return reply;
  }

  private async reply(): Promise<string> {
    for (;;) {
      // A reply ends with a line "ddd text"; "ddd-text" lines continue it.
      const match = /^(\d{3}) [^\r\n]*\r\n/m.exec(this.buffer);
      if (match) {
        const end = match.index + match[0].length;
        const text = this.buffer.slice(0, end).trimEnd();
        this.buffer = this.buffer.slice(end);
        return text;
      }
      const { value, done } = await this.reader.read();
      if (done) throw new Error('smtp: the server closed the connection');
      this.buffer += new TextDecoder().decode(value, { stream: true });
    }
  }

  release(): void {
    this.reader.releaseLock();
    this.writer.releaseLock();
  }
}

/** The message as RFC 5322 text: the headers, then HTML and plain text as a multipart/alternative body, all in base64. */
function message(mail: Mail): string {
  const boundary = `=_grku_${crypto.randomUUID().replace(/-/g, '')}`;
  const id = `${crypto.randomUUID()}@${mail.from.address.split('@')[1] ?? 'grku.app'}`;
  const headers = [
    `From: ${encodeWord(mail.from.name)} <${mail.from.address}>`,
    `To: <${mail.to}>`,
    `Subject: ${encodeWord(mail.subject)}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: <${id}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const part = (type: string, body: string) => [`--${boundary}`, `Content-Type: ${type}; charset=utf-8`, 'Content-Transfer-Encoding: base64', '', base64Lines(body)].join('\r\n');
  return [...headers, '', part('text/plain', mail.text), part('text/html', mail.html), `--${boundary}--`].join('\r\n');
}

/** An RFC 2047 encoded word, so Thai subjects and names survive every server. */
function encodeWord(text: string): string {
  return /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${base64(text)}?=`;
}

function base64(text: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

/** Base64 in lines of 76 characters, as MIME asks. */
function base64Lines(text: string): string {
  return base64(text).replace(/.{1,76}/g, '$&\r\n').trimEnd();
}
