"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { PLAYBOOK_CATEGORIES } from "@/lib/content/types";

const REVIEW_OPTIONS: { value: string; label: string }[] = [
  { value: "No", label: "No — low risk, light self-check is enough" },
  { value: "Conditional", label: "Conditional — depends on specifics" },
  { value: "Yes", label: "Yes — a colleague should review before use" },
];

const inputClass =
  "w-full rounded-lg border border-border-subtle bg-white px-4 py-2.5 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue";

export function PlaybookSubmissionForm({ tools }: { tools: { id: string; name: string }[] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [humanReviewRequired, setHumanReviewRequired] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string } | null>(null);

  const canSubmit = title.trim() && category && humanReviewRequired && summary.trim() && body.trim();

  function toggleTool(id: string) {
    setAiTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contribute/playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          aiToolsReferenced: aiTools,
          humanReviewRequired,
          summary: summary.trim(),
          body: body.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not save the entry.");
      setSuccess({ slug: data.slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the entry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-um-maize bg-[#fffaeb] p-6">
        <p className="text-lg font-semibold text-um-blue">Published.</p>
        <p className="mt-1 text-sm text-um-black-metallic">
          Your entry is live on the Playbook right now.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href={`/playbook/${success.slug}`}>View it</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSuccess(null);
              setTitle("");
              setCategory("");
              setTags("");
              setAiTools([]);
              setHumanReviewRequired("");
              setSummary("");
              setBody("");
            }}
          >
            Add another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="pb-title" className="mb-1 block text-sm font-medium text-um-black-metallic">
          Title
        </label>
        <input id="pb-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pb-category" className="mb-1 block text-sm font-medium text-um-black-metallic">
            Category
          </label>
          <select id="pb-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="">Select a category</option>
            {PLAYBOOK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pb-tags" className="mb-1 block text-sm font-medium text-um-black-metallic">
            Tags <span className="font-normal text-um-stone">(comma-separated)</span>
          </label>
          <input
            id="pb-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="drafting, email"
            className={inputClass}
          />
        </div>
      </div>

      {tools.length > 0 && (
        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-um-black-metallic">
            AI tools this entry references
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {tools.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm text-um-black-metallic">
                <input
                  type="checkbox"
                  checked={aiTools.includes(t.id)}
                  onChange={() => toggleTool(t.id)}
                  className="h-4 w-4 accent-um-blue"
                />
                {t.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="pb-review" className="mb-1 block text-sm font-medium text-um-black-metallic">
          Human review required?
        </label>
        <select
          id="pb-review"
          value={humanReviewRequired}
          onChange={(e) => setHumanReviewRequired(e.target.value)}
          className={inputClass}
        >
          <option value="">Select one</option>
          {REVIEW_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pb-summary" className="mb-1 block text-sm font-medium text-um-black-metallic">
          Summary <span className="font-normal text-um-stone">(one or two sentences, shown in lists)</span>
        </label>
        <textarea id="pb-summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={inputClass} />
      </div>

      <div>
        <label htmlFor="pb-body" className="mb-1 block text-sm font-medium text-um-black-metallic">
          Full entry <span className="font-normal text-um-stone">(Markdown — headings with ##, bullets with -)</span>
        </label>
        <textarea id="pb-body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} className={inputClass} />
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Link href="/contribute" className="text-sm font-medium text-um-arboretum-blue underline underline-offset-2 hover:text-um-blue">
          ← Back
        </Link>
        <Button type="submit" size="lg" disabled={!canSubmit || submitting}>
          {submitting ? "Publishing…" : "Publish entry"}
        </Button>
      </div>
    </form>
  );
}
