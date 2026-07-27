#!/usr/bin/env node
/**
 * One-time (safe to re-run) database setup for ATLAS's dynamic content: contributor
 * access keys, playbook submissions, and directory resources. Run with `npm run db:init`.
 *
 * This is a plain Node script (not part of the Next.js app), so it reads DATABASE_URL
 * from .env.local itself rather than relying on Next's automatic env loading.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal(join(projectRoot, ".env.local"));

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Add it to .env.local (see .env.local.example) and try again.",
  );
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS contributor_keys (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      revoked_at TIMESTAMPTZ
    )
  `;
  console.log("✓ contributor_keys");

  await sql`
    CREATE TABLE IF NOT EXISTS playbook_submissions (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      ai_tools_referenced TEXT[] NOT NULL DEFAULT '{}',
      human_review_required TEXT NOT NULL,
      summary TEXT NOT NULL,
      body TEXT NOT NULL,
      contributor_label TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ playbook_submissions");

  await sql`
    CREATE TABLE IF NOT EXISTS directory_resources (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT,
      description TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      contributor_label TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ directory_resources");

  console.log("\nDone. Tables are ready.");
}

main().catch((err) => {
  console.error("Database setup failed:", err);
  process.exit(1);
});

/** Minimal .env.local parser — no dotenv dependency, matches this project's minimal style. */
function loadEnvLocal(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
