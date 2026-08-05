import "server-only";
import crypto from "node:crypto";
import { getSql } from "@/lib/db/client";
import type { ContributorSessionPayload } from "./session";

/**
 * Individual per-person contributor access keys. The admin (site owner) generates one per
 * verified staff member and hands it out; entering it on /contribute unlocks the
 * submission forms. Raw keys are shown exactly once at generation time and stored only as
 * a SHA-256 hash — the database never holds a key in a form that could be used directly if
 * it were ever exposed.
 */

export interface ContributorKeyRecord {
  id: number;
  label: string;
  createdAt: string;
  revokedAt: string | null;
}

function hashKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/** Neon can return TIMESTAMPTZ columns as either a string or a Date depending on the
 * query path — normalize to an ISO string so callers can rely on string methods. */
function toISOString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** Generates a new key for `label` (e.g. a staff member's name). Returns the RAW key —
 * this is the only time it's ever available; store it nowhere except handing it to them. */
export async function createContributorKey(label: string): Promise<{ id: number; rawKey: string }> {
  const rawKey = `atlas_${crypto.randomBytes(24).toString("base64url")}`;
  const sql = getSql();
  const rows = await sql`
    INSERT INTO contributor_keys (label, key_hash)
    VALUES (${label}, ${hashKey(rawKey)})
    RETURNING id
  `;
  return { id: rows[0].id, rawKey };
}

export async function listContributorKeys(): Promise<ContributorKeyRecord[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, label, created_at, revoked_at
    FROM contributor_keys
    ORDER BY created_at DESC
  `;
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    createdAt: toISOString(r.created_at),
    revokedAt: r.revoked_at ? toISOString(r.revoked_at) : null,
  }));
}

export async function revokeContributorKey(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contributor_keys SET revoked_at = now() WHERE id = ${id} AND revoked_at IS NULL
  `;
}

/** Verifies a raw key entered on /contribute. Returns the session payload if valid and
 * not revoked, otherwise null. */
export async function verifyContributorKey(rawKey: string): Promise<ContributorSessionPayload | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, label FROM contributor_keys
    WHERE key_hash = ${hashKey(rawKey)} AND revoked_at IS NULL
  `;
  if (rows.length === 0) return null;
  return { contributorId: rows[0].id, label: rows[0].label };
}

/** Re-checks a contributor's key against the database (not just the signed session
 * cookie, which has no idea a key was revoked after the cookie was issued). Write and
 * delete routes should call this before acting, so revoking a key actually revokes
 * access rather than just blocking future unlocks. */
export async function isContributorKeyActive(contributorId: number): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT id FROM contributor_keys WHERE id = ${contributorId} AND revoked_at IS NULL
  `;
  return rows.length > 0;
}
