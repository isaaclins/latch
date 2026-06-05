// Shared between apps/site and apps/api.
// Kept tiny on purpose — only types that genuinely cross the boundary.

export interface InboxEvent {
  readonly id: string;
  readonly subject: string;
  readonly from: string;
  readonly receivedAt: string; // ISO 8601
  readonly needsReply: boolean;
}

export interface TriageDecision {
  readonly threadId: string;
  readonly importance: "today" | "this-week" | "later" | "archive";
  readonly confidence: number; // 0..1
  readonly draft?: string;
}

export interface MagicLinkRequest {
  readonly email: string;
}

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string;
}
