import type { InboxEvent } from "@latch/shared";
import type { EmailMessage } from "./send.ts";

export function magicLinkEmail(args: {
  to: string;
  link: string;
  ttlSeconds: number;
}): EmailMessage {
  const minutes = Math.round(args.ttlSeconds / 60);
  const text = [
    `Sign in to Latch`,
    ``,
    `Tap the link below to sign in. It expires in ${minutes} minutes and can only be used once.`,
    ``,
    args.link,
    ``,
    `If you didn't ask to sign in, you can safely ignore this email.`,
    ``,
    `— Latch`,
  ].join("\n");

  return {
    to: args.to,
    subject: "Your Latch sign-in link",
    text,
  };
}

export function triageSummaryEmail(args: {
  to: string;
  todayCount: number;
  archiveCount: number;
  events: ReadonlyArray<InboxEvent>;
}): EmailMessage {
  const needToday = args.events.filter((e) => e.needsReply);
  const headlines = needToday
    .slice(0, 5)
    .map((e) => `  · ${e.subject} — from ${e.from}`)
    .join("\n");
  const text = [
    `Your inbox today`,
    ``,
    `Latch reviewed ${args.events.length} threads while you slept.`,
    `${args.todayCount} need you today. ${args.archiveCount} are handled.`,
    ``,
    headlines || `(Nothing needs you today.)`,
    ``,
    `Open Latch when you're ready. There's no rush.`,
    ``,
    `— Latch`,
  ].join("\n");

  return {
    to: args.to,
    subject: `${args.todayCount} threads need you today`,
    text,
  };
}
