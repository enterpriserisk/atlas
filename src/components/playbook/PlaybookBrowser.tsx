"use client";

import { useMemo, useState } from "react";
import fuzzysort from "fuzzysort";
import { Badge, HumanReviewBadge, Card, CardBody } from "@/components/ui";
import type { PlaybookEntry, ReviewRequirement, Tool } from "@/lib/content/types";

/**
 * PlaybookBrowser — client-side searchable, filterable index of playbook entries.
 * Instant fuzzy search (fuzzysort) over title/summary/tags/category, plus filters for
 * category, referenced AI tool, and human-review requirement. No backend required.
 */

interface Props {
  entries: PlaybookEntry[];
  categories: string[];
  tools: Pick<Tool, "id" | "name">[];
}

const REVIEW_OPTIONS: ReviewRequirement[] = ["Yes", "No", "Conditional"];

/** Pre-computed searchable haystack per entry (fuzzysort prepares strings for speed). */
interface Indexed {
  entry: PlaybookEntry;
  prepared: Fuzzysort.Prepared;
}

export function PlaybookBrowser({ entries, categories, tools }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [toolId, setToolId] = useState<string | null>(null);
  const [review, setReview] = useState<ReviewRequirement | null>(null);

  const indexed = useMemo<Indexed[]>(
    () =>
      entries.map((entry) => ({
        entry,
        prepared: fuzzysort.prepare(
          [entry.title, entry.summary, entry.category, entry.tags.join(" ")].join(" "),
        ),
      })),
    [entries],
  );

  const filtered = useMemo(() => {
    // Apply structured filters first.
    let pool = indexed.filter(({ entry }) => {
      if (category && entry.category !== category) return false;
      if (toolId && !entry.aiToolsReferenced.includes(toolId)) return false;
      if (review && entry.humanReviewRequired !== review) return false;
      return true;
    });

    // Then fuzzy-rank by query if present.
    const q = query.trim();
    if (q) {
      const results = fuzzysort.go(q, pool, { key: "prepared", threshold: -10000 });
      pool = results.map((r) => r.obj);
    }
    return pool.map((p) => p.entry);
  }, [indexed, category, toolId, review, query]);

  const hasActiveFilter = Boolean(category || toolId || review || query.trim());

  const toolName = (id: string) => tools.find((t) => t.id === id)?.name ?? id;

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <label htmlFor="playbook-search" className="sr-only">
          Search the playbook
        </label>
        <input
          id="playbook-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guidance, tools, and topics…"
          className="w-full rounded-lg border border-border-subtle bg-white px-4 py-3 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
          aria-describedby="playbook-result-count"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <FilterSelect
          label="Category"
          value={category ?? ""}
          onChange={(v) => setCategory(v || null)}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          label="AI tool"
          value={toolId ?? ""}
          onChange={(v) => setToolId(v || null)}
          options={tools.map((t) => ({ value: t.id, label: t.name }))}
        />
        <FilterSelect
          label="Human review"
          value={review ?? ""}
          onChange={(v) => setReview((v as ReviewRequirement) || null)}
          options={REVIEW_OPTIONS.map((r) => ({ value: r, label: r }))}
        />
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(null);
              setToolId(null);
              setReview(null);
            }}
            className="self-end rounded-md px-3 py-2 text-sm font-medium text-um-arboretum-blue underline underline-offset-2 hover:text-um-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
          >
            Clear filters
          </button>
        )}
      </div>

      <p id="playbook-result-count" className="mb-4 text-sm text-um-stone" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        {hasActiveFilter ? " match your filters" : ""}
      </p>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-subtle bg-surface-muted p-8 text-center text-um-stone">
          No entries match. Try clearing a filter or searching a different term.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((entry) => (
            <li key={entry.slug}>
              <Card href={`/playbook/${entry.slug}`} className="h-full">
                <CardBody className="flex h-full flex-col">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge tone="blue" glyph={null}>
                      {entry.category}
                    </Badge>
                    {entry.draft && (
                      <Badge tone="warning" glyph="✎">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-um-blue">{entry.title}</h2>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-um-black-metallic">
                    {entry.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <HumanReviewBadge status={entry.humanReviewRequired} />
                    {entry.aiToolsReferenced.slice(0, 2).map((id) => (
                      <span key={id} className="text-xs text-um-stone">
                        {toolName(id)}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-xs font-semibold uppercase tracking-wide text-um-stone">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border-subtle bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
