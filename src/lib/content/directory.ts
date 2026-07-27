import "server-only";
import { getSql } from "@/lib/db/client";
import type { DirectoryResource } from "./types";

/**
 * The Resource Directory: entirely database-backed, since every entry is by definition a
 * staff-submitted resource (no static-file equivalent, unlike the Playbook). Submitted
 * through the access-key-gated /contribute flow — see
 * src/app/api/contribute/directory/route.ts.
 */

interface ResourceRow {
  id: number;
  name: string;
  url: string | null;
  description: string;
  tags: string[];
  contributor_label: string;
  submitted_at: string | Date;
}

function toDateOnly(value: string | Date): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function mapRow(row: ResourceRow): DirectoryResource {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description,
    tags: row.tags,
    contributorLabel: row.contributor_label,
    submittedAt: toDateOnly(row.submitted_at),
  };
}

/** Catches its own errors and returns [] if the database isn't configured/reachable, so
 * the Directory page can show a friendly empty state rather than crash. */
export async function getDirectoryResources(): Promise<DirectoryResource[]> {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM directory_resources ORDER BY submitted_at DESC
    `) as unknown as ResourceRow[];
    return rows.map(mapRow);
  } catch (err) {
    console.warn("[directory] could not load directory resources:", err);
    return [];
  }
}

export interface DirectoryResourceInput {
  name: string;
  url: string | null;
  description: string;
  tags: string[];
  contributorLabel: string;
}

export async function createDirectoryResource(input: DirectoryResourceInput): Promise<DirectoryResource> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO directory_resources (name, url, description, tags, contributor_label)
    VALUES (${input.name}, ${input.url}, ${input.description}, ${input.tags}, ${input.contributorLabel})
    RETURNING *
  `) as unknown as ResourceRow[];
  return mapRow(rows[0]);
}
