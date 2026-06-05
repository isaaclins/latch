import type { Env } from "../types.ts";

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
}

/**
 * Send a single email via the Resend HTTP API.
 *
 * When `RESEND_API_KEY` is absent (vitest, fresh clones, etc.) we fall back to
 * a labelled stdout sink. /verify greps `══════ latch-email-sink ══════` for
 * proof of what would have been sent.
 *
 * Sender address comes from `env.SENDER_ADDRESS`:
 *   - Before you verify wolf-werler.ch in Resend: leave it as
 *     `onboarding@resend.dev` (Resend's sandbox sender — works immediately).
 *   - After verification: switch it to `noreply@wolf-werler.ch` in
 *     wrangler.jsonc. No code change.
 */
export async function sendEmail(env: Env, msg: EmailMessage): Promise<void> {
  if (!env.RESEND_API_KEY) {
    devSink(env, msg);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: `${env.SENDER_NAME} <${env.SENDER_ADDRESS}>`,
      to: [msg.to],
      subject: msg.subject,
      text: msg.text,
      ...(msg.html ? { html: msg.html } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "<unreadable>");
    throw new Error(`resend ${res.status}: ${body.slice(0, 300)}`);
  }
}

function devSink(env: Env, msg: EmailMessage): void {
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
