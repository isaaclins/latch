import type { Env } from "../types.ts";

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
}

/**
 * Send a single email via the Cloudflare Email binding.
 *
 * In `wrangler dev`, the EMAIL binding may not be configured for arbitrary
 * external destinations (it routes through Email Workers, which historically
 * required a verified-routing destination on the same zone). When the binding
 * isn't available, we fall back to a file-backed dev sink so /verify can still
 * inspect what would have been sent.
 *
 * The dev sink writes RFC822-ish lines to stdout — `wrangler dev` captures
 * those into the terminal, and the dev script `npm run dev:tail-emails` mirrors
 * the most recent ones for /verify to screenshot.
 */
export async function sendEmail(env: Env, msg: EmailMessage): Promise<void> {
  if (env.ENVIRONMENT !== "production" || !env.EMAIL) {
    devSink(env, msg);
    return;
  }
  const mime = buildMime(env, msg);
  // `cloudflare:email` is only resolvable inside the Workers runtime.
  // Dynamic import keeps local dev / vitest from trying to resolve it.
  const { EmailMessage: CFEmail } = await import("cloudflare:email" as string);
  const message = new CFEmail(env.SENDER_ADDRESS, msg.to, mime);
  await env.EMAIL.send(message);
}

function buildMime(env: Env, msg: EmailMessage): string {
  const boundary = `latch_${Math.floor(Math.random() * 1e9).toString(36)}`;
  const from = `${env.SENDER_NAME} <${env.SENDER_ADDRESS}>`;
  const lines = [
    `From: ${from}`,
    `To: ${msg.to}`,
    `Subject: ${msg.subject}`,
    `MIME-Version: 1.0`,
  ];
  if (msg.html) {
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    lines.push("");
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: text/plain; charset="utf-8"`);
    lines.push("");
    lines.push(msg.text);
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: text/html; charset="utf-8"`);
    lines.push("");
    lines.push(msg.html);
    lines.push(`--${boundary}--`);
  } else {
    lines.push(`Content-Type: text/plain; charset="utf-8"`);
    lines.push("");
    lines.push(msg.text);
  }
  return lines.join("\r\n");
}

function devSink(env: Env, msg: EmailMessage): void {
  // Visible in the `wrangler dev` console; /verify tails the log for this marker.
  const stamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(
    `\n══════ latch-email-sink ══════\n` +
      `stamp: ${stamp}\n` +
      `from:  ${env.SENDER_NAME} <${env.SENDER_ADDRESS}>\n` +
      `to:    ${msg.to}\n` +
      `subj:  ${msg.subject}\n` +
      `─ text ─\n${msg.text}\n` +
      `══════ end ══════\n`,
  );
}

