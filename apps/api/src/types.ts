import type { SessionUser } from "@latch/shared";
import type { UserInbox } from "./do/UserInbox.ts";

export interface Env {
  USER_INBOX: DurableObjectNamespace<UserInbox>;
  ENVIRONMENT: "local" | "production";
  SENDER_ADDRESS: string;
  SENDER_NAME: string;
  SITE_URL: string;
  API_URL: string;
  MAGIC_LINK_TTL_SECONDS: string;
  SESSION_TTL_SECONDS: string;
  SESSION_SECRET: string;
  MAGIC_LINK_SECRET: string;
  RESEND_API_KEY?: string;
}

export interface Variables {
  user: SessionUser;
}
