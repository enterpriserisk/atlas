import "server-only";
import { getSql } from "@/lib/db/client";
import { slugify } from "./types";
import type { PlaybookEntry, ReviewRequirement } from "./types";

/**
 * Database-backed playbook entries, submitted by staff/interns through the access-key-
 * gated /contribute flow (see src/app/api/contribute/playbook/route.ts). Merged with the
 * static .mdx-file entries (src/lib/content/loaders.ts) so the rest of the app — the
 * Playbook list, search/filter, and the [slug] detail page — doesn't need to know or care
 * which source a given entry came from.
 *
 * Read functions here catch their own errors and return empty/undefined rather than
 * throwing, so the Playbook still works from static content alone if the database isn't
 * configured or reachable. `createPlaybookSubmission` has no such fallback — a missing
 * database there is a real error, surfaced to the caller (the API route).
 */

interface SubmissionRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  ai_tools_referenced: string[];
  human_review_required: string;
  summary: string;
  body: string;
  contributor_label: string;
  contributor_key_id: number | null;
  draft: boolean;
  submitted_at: string | Date;
}

function toDateOnly(value: string | Date): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function mapRow(row: SubmissionRow): PlaybookEntry {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    tags: row.tags,
    aiToolsReferenced: row.ai_tools_referenced,
    humanReviewRequired: row.human_review_required as ReviewRequirement,
    lastUpdated: toDateOnly(row.submitted_at),
    author: row.contributor_label,
    summary: row.summary,
    body: row.body,
    draft: row.draft,
  };
}

export async function getDynamicPlaybookEntries(): Promise<PlaybookEntry[]> {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM playbook_submissions ORDER BY submitted_at DESC
    `) as unknown as SubmissionRow[];
    return rows.map(mapRow);
  } catch (err) {
    console.warn("[submissions] could not load dynamic playbook entries:", err);
    return [];
  }
}

export async function getDynamicPlaybookEntry(slug: string): Promise<PlaybookEntry | undefined> {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM playbook_submissions WHERE slug = ${slug} LIMIT 1
    `) as unknown as SubmissionRow[];
    return rows[0] ? mapRow(rows[0]) : undefined;
  } catch (err) {
    console.warn("[submissions] could not load dynamic playbook entry:", err);
    return undefined;
  }
}

export interface PlaybookSubmissionInput {
  title: string;
  category: string;
  tags: string[];
  aiToolsReferenced: string[];
  humanReviewRequired: ReviewRequirement;
  summary: string;
  body: string;
  contributorLabel: string;
}

/** `existingStaticSlugs` lets the caller (the API route, which already loads static
 * entries via loaders.ts) avoid colliding with a file-based entry — kept as a parameter
 * rather than importing loaders.ts here, since loaders.ts imports from this file. */
export async function createPlaybookSubmission(
  input: PlaybookSubmissionInput,
  existingStaticSlugs: string[],
  contributorId: number,
): Promise<PlaybookEntry> {
  const sql = getSql();
  const taken = new Set(existingStaticSlugs);
  const dynamicRows = (await sql`SELECT slug FROM playbook_submissions`) as unknown as { slug: string }[];
  for (const r of dynamicRows) taken.add(r.slug);

  const base = slugify(input.title) || "entry";
  let slug = base;
  let suffix = 2;
  while (taken.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  const rows = (await sql`
    INSERT INTO playbook_submissions
      (slug, title, category, tags, ai_tools_referenced, human_review_required, summary, body, contributor_label, contributor_key_id)
    VALUES
      (${slug}, ${input.title}, ${input.category}, ${input.tags}, ${input.aiToolsReferenced},
       ${input.humanReviewRequired}, ${input.summary}, ${input.body}, ${input.contributorLabel}, ${contributorId})
    RETURNING *
  `) as unknown as SubmissionRow[];

  return mapRow(rows[0]);
}

/** Delete a playbook submission. Pass `contributorId: null` for an unrestricted
 * (admin) delete; otherwise the row must belong to that contributor key, so a
 * contributor can only remove their own entries. Returns whether a row was deleted. */
export async function deletePlaybookSubmission(
  id: number,
  contributorId: number | null,
): Promise<boolean> {
  const sql = getSql();
  const rows =
    contributorId === null
      ? ((await sql`DELETE FROM playbook_submissions WHERE id = ${id} RETURNING id`) as unknown as { id: number }[])
      : ((await sql`
          DELETE FROM playbook_submissions
          WHERE id = ${id} AND contributor_key_id = ${contributorId}
          RETURNING id
        `) as unknown as { id: number }[]);
  return rows.length > 0;
}

export async function getPlaybookSubmissionsByContributor(contributorId: number): Promise<PlaybookEntry[]> {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM playbook_submissions WHERE contributor_key_id = ${contributorId} ORDER BY submitted_at DESC
    `) as unknown as SubmissionRow[];
    return rows.map(mapRow);
  } catch (err) {
    console.warn("[submissions] could not load contributor's playbook entries:", err);
    return [];
  }
}

export async function getPendingPlaybookSubmissions(): Promise<PlaybookEntry[]> {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM playbook_submissions WHERE draft = true ORDER BY submitted_at DESC
    `) as unknown as SubmissionRow[];
    return rows.map(mapRow);
  } catch (err) {
    console.warn("[submissions] could not load pending playbook submissions:", err);
    return [];
  }
}

/** Admin-only: mark a submission as reviewed (clears the Draft badge). Returns
 * whether a row was updated. */
export async function approvePlaybookSubmission(id: number): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE playbook_submissions SET draft = false WHERE id = ${id} RETURNING id
  `) as unknown as { id: number }[];
  return rows.length > 0;
}
