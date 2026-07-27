import "server-only";

/**
 * groq.ts — thin, server-only client for Groq's chat completions API (OpenAI-compatible).
 * This is the ONLY place that knows about the request/response format; both advisor API
 * routes call `callGroqJSON()` and never touch `fetch()` or the API key directly.
 *
 * Never import this from a "use client" component — the `server-only` import above makes
 * the build fail loudly if that ever happens, so GROQ_API_KEY can't leak to the browser.
 *
 * Unlike OpenRouter's free auto-router (which gambles on whichever third-party backend is
 * available, and was observed hanging for minutes at a time), Groq serves a specific named
 * model on its own hardware — free, no credit card, and consistently fast. Model defaults
 * to "llama-3.3-70b-versatile"; override via GROQ_MODEL.
 */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export class GroqError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "GroqError";
    this.status = status;
  }
}

/**
 * Use this instead of `err instanceof GroqError` — subclassing the built-in Error doesn't
 * always survive TypeScript/SWC's compilation target across module boundaries, which can
 * make `instanceof` silently fail even for errors thrown by this exact file. Checking
 * `.name` is a plain string comparison, immune to that pitfall (learned the hard way with
 * the previous OpenRouter client, where a DOMException timeout also turned out not to be
 * an `instanceof Error` at all).
 */
export function isGroqError(err: unknown): err is GroqError {
  return err instanceof Error && err.name === "GroqError";
}

/**
 * Sends `input` as a single user message and returns the model's response parsed as JSON
 * of shape `T`. The prompt text passed in `input` must itself spell out the exact JSON
 * shape expected, since `json_object` mode guarantees valid JSON but not a specific schema
 * (callers should still validate/normalize the parsed result defensively).
 */
export async function callGroqJSON<T>(args: { input: string; model?: string }): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError(
      "GROQ_API_KEY is not configured on the server. Copy .env.local.example to " +
        ".env.local, add a free key from https://console.groq.com/keys, and restart the dev server.",
    );
  }
  const model = args.model ?? process.env.GROQ_MODEL ?? DEFAULT_MODEL;

  // Bound the call explicitly rather than trusting it resolves quickly — even fast
  // providers can have an occasional slow request, and the UI shouldn't spin forever.
  // The abort can fire either while awaiting fetch() itself OR while awaiting res.text()
  // (body streaming), so both must be inside this one try/catch — and the resulting error
  // is a DOMException, which does NOT extend Error, so `instanceof Error` won't match it.
  let rawText: string;
  let ok: boolean;
  let status: number;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: args.input }],
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    ok = res.ok;
    status = res.status;
    rawText = await res.text();
  } catch (err) {
    const name = (err as { name?: unknown })?.name;
    if (name === "TimeoutError" || name === "AbortError") {
      throw new GroqError("The AI model took too long to respond (over 30s). Please try again.");
    }
    throw new GroqError(`Could not reach Groq: ${(err as Error).message}`);
  }

  if (!ok) {
    throw new GroqError(`Groq returned ${status}: ${truncate(rawText, 500)}`, status);
  }

  return parseCompletionJSON<T>(rawText);
}

function parseCompletionJSON<T>(rawText: string): T {
  let body: unknown;
  try {
    body = JSON.parse(rawText);
  } catch {
    throw new GroqError(`Groq returned non-JSON output: ${truncate(rawText, 300)}`);
  }

  const content = prop(prop(prop(prop(body, "choices"), 0), "message"), "content");
  if (typeof content !== "string") {
    throw new GroqError(`Unexpected Groq response shape. Raw body: ${truncate(rawText, 500)}`);
  }

  // Some models wrap JSON in a markdown code fence despite instructions not to.
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new GroqError(`Model response was not valid JSON. Raw content: ${truncate(cleaned, 500)}`);
  }
}

function prop(obj: unknown, key: string | number): unknown {
  if (obj === null || typeof obj !== "object") return undefined;
  return (obj as Record<string | number, unknown>)[key];
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
