import { describe, expect, it } from "vitest";
import { SELF } from "cloudflare:test";

const HEADERS = { "content-type": "application/json" };

describe("magic-link auth", () => {
  it("rejects invalid email shape", async () => {
    const res = await SELF.fetch("https://api.test/auth/request-link", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ email: "not-an-email" }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("invalid_email");
  });

  it("issues a link for a valid email (200)", async () => {
    const res = await SELF.fetch("https://api.test/auth/request-link", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ email: "alice@example.com" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; expiresAt: number };
    expect(body.ok).toBe(true);
    expect(body.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rejects redemption with bad token", async () => {
    const res = await SELF.fetch(
      "https://api.test/auth/callback?token=garbage&email=alice@example.com",
    );
    expect(res.status).toBe(401);
  });

  it("rejects /me without a cookie", async () => {
    const res = await SELF.fetch("https://api.test/auth/me");
    expect(res.status).toBe(401);
  });
});
