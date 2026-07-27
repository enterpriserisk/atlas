import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Shared Postgres client (Neon's serverless driver — talks to Postgres over plain HTTPS
 * fetch rather than a raw TCP connection, so it works from any hosting environment,
 * including restrictive institutional networks that only allow outbound HTTPS).
 *
 * Use the tagged-template form for queries — `getSql()\`SELECT ... WHERE id = ${id}\`` —
 * which parameterizes interpolated values automatically (safe against SQL injection).
 *
 * Lazy on purpose: pages that can still function without the database (the Playbook list
 * merges in dynamic entries but works fine with static-only content) should be able to
 * catch a missing/unreachable DB and degrade gracefully instead of crashing the whole
 * page. Routes that have no meaningful fallback (admin, contribute submissions) should let
 * the error from calling this propagate up to their own error handling.
 */
let cached: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not configured. Copy .env.local.example to .env.local, add a Neon " +
        "Postgres connection string (see https://neon.tech), and restart the dev server.",
    );
  }
  if (!cached) {
    cached = neon(process.env.DATABASE_URL);
  }
  return cached;
}
