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
 * available, and was observed hanging for minutes at a time), Groq serves specific named
 * models on its own hardware — free, no credit card, and consistently fast. Groq does
 * periodically deprecate models with advance notice (see
 * https://console.groq.com/docs/deprecations) — this previously broke the Advisor outright
 * when `llama-3.3-70b-versatile` was shut down and every request 404'd. To survive the next
 * one without a code change being on the critical path, requests now fall through an
 * ordered chain of models rather than hard-failing on the first one that's gone.
 */

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// Ordered fallback chain, tried in sequence whenever a model is missing/decommissioned.
// The first entry is the "preferred" model; the rest are just-in-case backups so a single
// deprecation can't fully brick the Advisor between now and whenever someone next updates
// this list. When Groq announces a deprecation for whichever model is first here, move it
// to the back (or drop it) and put the recommended replacement at the front — see
// https://console.groq.com/docs/models for current model IDs.
const FALLBACK_MODELS = ["openai/gpt-oss-120b", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"];

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

/** True for the specific shape of error Groq returns for a missing/decommissioned model —
 * the one case where retrying with a *different* model can actually help. Anything else
 * (bad auth, malformed request, rate limit, network/timeout) would fail identically
 * regardless of which model was asked for, so those are surfaced immediately rather than
 * silently retried three times in a row. */
function isModelUnavailableError(err: unknown): boolean {
  if (!isGroqError(err)) return false;
  if (err.status === 404) return true;
  return /model_not_found|model_decommissioned|does not exist|no longer supported/i.test(err.message);
}

/**
 * Sends `input` as a single user message and returns the model's response parsed as JSON
 * of shape `T`. The prompt text passed in `input` must itself spell out the exact JSON
 * shape expected, since `json_object` mode guarantees valid JSON but not a specific schema
 * (callers should still validate/normalize the parsed result defensively).
 *
 * Tries `args.model` (or `GROQ_MODEL`, or the fallback chain's first entry) first, and only
 * on a "model unavailable" response falls through to the next candidate in FALLBACK_MODELS,
 * skipping the primary if it's a duplicate. Any other error type is thrown immediately.
 */
export async function callGroqJSON<T>(args: { input: string; model?: string }): Promise<T> {
  const preferred = args.model ?? process.env.GROQ_MODEL ?? FALLBACK_MODELS[0];
  const candidates = [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];

  let lastError: unknown;
  for (let i = 0; i < candidates.length; i++) {
    const model = candidates[i];
    try {
      const result = await attemptGroqCall<T>(model, args.input);
      if (i > 0) {
        console.warn(
          `[groq] "${candidates[0]}" was unavailable; served this request with fallback model "${model}" instead. ` +
            `Update GROQ_MODEL / FALLBACK_MODELS in src/lib/advisor/groq.ts.`,
        );
      }
      return result;
    } catch (err) {
      lastError = err;
      if (!isModelUnavailableError(err)) throw err;
      // else: try the next candidate
    }
  }

  const message = isGroqError(lastError) ? lastError.message : "Unknown error.";
  throw new GroqError(
    `None of Groq's configured models are currently available (tried: ${candidates.join(", ")}). ` +
      `Last error: ${message} — check https://console.groq.com/docs/models for current model IDs.`,
  );
}

async function attemptGroqCall<T>(model: string, input: string): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError(
      "GROQ_API_KEY is not configured on the server. Copy .env.local.example to " +
        ".env.local, add a free key from https://console.groq.com/keys, and restart the dev server.",
    );
  }

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
        messages: [{ role: "user", content: input }],
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
