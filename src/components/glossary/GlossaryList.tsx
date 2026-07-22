"use client";

import { useMemo, useState } from "react";
import { slugifyTerm, type GlossaryTerm } from "@/lib/content/types";

/**
 * GlossaryList — alphabetized, filterable term/definition list.
 * Each term is anchored by id (lowercased term) so links like /glossary#hallucination
 * scroll to and highlight the entry. Filtering matches term text, aliases, and definition.
 */
export function GlossaryList({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => {
      const haystack = [t.term, ...(t.aliases ?? []), t.definition].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [terms, query]);

  return (
    <div>
      <div className="mb-6">
        <label htmlFor="glossary-search" className="sr-only">
          Filter glossary terms
        </label>
        <input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter terms…"
          className="w-full rounded-lg border border-border-subtle bg-white px-4 py-3 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
          aria-describedby="glossary-count"
        />
        <p id="glossary-count" className="mt-2 text-sm text-um-stone" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "term" : "terms"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-subtle bg-surface-muted p-6 text-center text-um-stone">
          No terms match “{query}”.
        </p>
      ) : (
        <dl className="space-y-4">
          {filtered.map((t) => (
            <div
              key={t.term}
              id={slugifyTerm(t.term)}
              className="scroll-mt-24 rounded-lg border border-border-subtle bg-white p-5 shadow-sm target:ring-2 target:ring-um-maize"
            >
              <dt className="text-lg font-semibold text-um-blue">{t.term}</dt>
              <dd className="mt-1 leading-relaxed text-um-black-metallic">{t.definition}</dd>
              {t.aliases && t.aliases.length > 0 && (
                <p className="mt-2 text-xs text-um-stone">
                  Also: {t.aliases.join(", ")}
                </p>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
