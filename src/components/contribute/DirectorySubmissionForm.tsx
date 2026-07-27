"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

const inputClass =
  "w-full rounded-lg border border-border-subtle bg-white px-4 py-2.5 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue";

export function DirectorySubmissionForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit = name.trim() && description.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contribute/directory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          description: description.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not save the resource.");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the resource.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-um-maize bg-[#fffaeb] p-6">
        <p className="text-lg font-semibold text-um-blue">Published.</p>
        <p className="mt-1 text-sm text-um-black-metallic">
          Your resource is live in the Resource Directory right now.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/directory">View the directory</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSuccess(false);
              setName("");
              setUrl("");
              setDescription("");
              setTags("");
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
        <label htmlFor="dir-name" className="mb-1 block text-sm font-medium text-um-black-metallic">
          Name
        </label>
        <input id="dir-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="dir-url" className="mb-1 block text-sm font-medium text-um-black-metallic">
          Link <span className="font-normal text-um-stone">(optional)</span>
        </label>
        <input
          id="dir-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="dir-description" className="mb-1 block text-sm font-medium text-um-black-metallic">
          Description <span className="font-normal text-um-stone">(what is it, why is it useful)</span>
        </label>
        <textarea
          id="dir-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="dir-tags" className="mb-1 block text-sm font-medium text-um-black-metallic">
          Tags <span className="font-normal text-um-stone">(comma-separated)</span>
        </label>
        <input id="dir-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="templates, checklists" className={inputClass} />
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
          {submitting ? "Publishing…" : "Publish resource"}
        </Button>
      </div>
    </form>
  );
}
