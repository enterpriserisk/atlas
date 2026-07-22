import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { slugifyTerm } from "./types";
import type {
  DosDontsContent,
  GlossaryTerm,
  PlaybookEntry,
  PlaybookFrontmatter,
  SearchRecord,
  Tool,
} from "./types";

/**
 * File-based content loaders — the backbone of ATLAS's "living resource" promise.
 * These read from the /content directory at build time so future staff can add or edit
 * content (MDX/JSON) with no code changes. All functions are server-only.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const PLAYBOOK_DIR = path.join(CONTENT_DIR, "playbook");

function readJson<T>(file: string): T {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

/** Load and sort all playbook entries (newest first). */
export function getPlaybookEntries(): PlaybookEntry[] {
  if (!fs.existsSync(PLAYBOOK_DIR)) return [];
  const files = fs.readdirSync(PLAYBOOK_DIR).filter((f) => f.endsWith(".mdx"));

  const entries = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(PLAYBOOK_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const fm = data as PlaybookFrontmatter;
    return {
      slug,
      body: content,
      title: fm.title ?? slug,
      category: fm.category ?? "Uncategorized",
      tags: fm.tags ?? [],
      aiToolsReferenced: fm.aiToolsReferenced ?? [],
      humanReviewRequired: fm.humanReviewRequired ?? "Conditional",
      lastUpdated: fm.lastUpdated ?? "",
      author: fm.author ?? "",
      summary: fm.summary ?? "",
      draft: fm.draft ?? false,
    } satisfies PlaybookEntry;
  });

  return entries.sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));
}

export function getPlaybookEntry(slug: string): PlaybookEntry | undefined {
  return getPlaybookEntries().find((e) => e.slug === slug);
}

export function getTools(): Tool[] {
  return readJson<{ tools: Tool[] }>("tools.json").tools;
}

export function getTool(id: string): Tool | undefined {
  return getTools().find((t) => t.id === id);
}

export function getGlossary(): GlossaryTerm[] {
  return readJson<{ terms: GlossaryTerm[] }>("glossary.json").terms.sort((a, b) =>
    a.term.localeCompare(b.term),
  );
}

export function getDosDonts(): DosDontsContent {
  return readJson<DosDontsContent>("dos-donts.json");
}

/**
 * Build the unified, client-shippable search index from all content.
 * Called at build time; the result is small JSON safe to send to the browser for
 * instant client-side fuzzy search (no backend / no manual re-indexing step).
 */
export function buildSearchIndex(): SearchRecord[] {
  const records: SearchRecord[] = [];

  for (const e of getPlaybookEntries()) {
    records.push({
      type: "playbook",
      href: `/playbook/${e.slug}`,
      title: e.title,
      text: [e.title, e.summary, e.category, ...e.tags].join(" "),
      category: e.category,
      tags: e.tags,
      humanReviewRequired: e.humanReviewRequired,
    });
  }

  for (const t of getTools()) {
    records.push({
      type: "tool",
      href: `/tools#${t.id}`,
      title: t.name,
      text: [t.name, t.shortDescription, t.bestFor, ...t.relatedPlaybookTags].join(" "),
      tags: t.relatedPlaybookTags,
    });
  }

  for (const g of getGlossary()) {
    records.push({
      type: "glossary",
      href: `/glossary#${slugifyTerm(g.term)}`,
      title: g.term,
      text: [g.term, ...(g.aliases ?? []), g.definition].join(" "),
    });
  }

  return records;
}
