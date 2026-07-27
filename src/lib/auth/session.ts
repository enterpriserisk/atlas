import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Lightweight signed-cookie sessions for the admin (key management) and contributor
 * (playbook/directory submission) flows. No auth library — this is an internal tool for a
 * small known group, and an HMAC-signed HttpOnly cookie is proportionate: it can't be
 * forged without SESSION_SECRET, and can't be read/tampered with from client JS.
 *
 * Cookies are SET in Route Handlers only (Next.js doesn't allow setting cookies during
 * Server Component rendering) — see src/app/api/admin/login and
 * src/app/api/contribute/unlock. They're READ via the helpers below, usable from both
 * Server Components and Route Handlers.
 */

export const ADMIN_COOKIE = "atlas_admin_session";
export const CONTRIBUTOR_COOKIE = "atlas_contributor_session";

const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const CONTRIBUTOR_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

export interface ContributorSessionPayload {
  contributorId: number;
  label: string;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not configured. Copy .env.local.example to .env.local, add a " +
        "random secret, and restart the dev server.",
    );
  }
  return secret;
}

/** Signs a JSON-serializable payload into a compact, tamper-evident cookie value. */
export function signSession(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

/** Verifies and decodes a cookie value produced by `signSession`. Returns null if invalid. */
export function verifySession<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_MAX_AGE_SECONDS,
  };
}

export function contributorCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CONTRIBUTOR_MAX_AGE_SECONDS,
  };
}

/** Constant-time string comparison — use for comparing a submitted secret (e.g. the admin
 * password) against the real one, so response timing can't leak how much of it matched. */
export function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/** True if the current request carries a valid admin session cookie. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return verifySession<{ admin: true }>(token)?.admin === true;
}

/** The current request's contributor session, or null if unauthenticated. */
export async function getContributorSession(): Promise<ContributorSessionPayload | null> {
  const store = await cookies();
  const token = store.get(CONTRIBUTOR_COOKIE)?.value;
  return verifySession<ContributorSessionPayload>(token);
}
