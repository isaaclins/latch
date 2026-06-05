export function json<T>(body: T, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...Object.fromEntries(new Headers(init.headers).entries()),
    },
  });
}

export function err(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, { status });
}
