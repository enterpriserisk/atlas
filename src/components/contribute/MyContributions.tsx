"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, DraftTag } from "@/components/ui";
import type { PlaybookEntry, DirectoryResource } from "@/lib/content/types";

interface MyContributionsProps {
  initialPlaybookEntries: PlaybookEntry[];
  initialDirectoryResources: DirectoryResource[];
}

/** Lets a signed-in contributor see and remove the Playbook entries and Directory
 * resources they've personally submitted — e.g. to fix a typo or retract a mistake.
 * Deletion is scoped server-side to entries owned by their access key. */
export function MyContributions({ initialPlaybookEntries, initialDirectoryResources }: MyContributionsProps) {
  const [playbookEntries, setPlaybookEntries] = useState(initialPlaybookEntries);
  const [directoryResources, setDirectoryResources] = useState(initialDirectoryResources);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(kind: "playbook" | "directory", id: number) {
    const key = `${kind}-${id}`;
    setDeletingKey(key);
    setError(null);
    try {
      const res = await fetch(`/api/contribute/${kind}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not delete this entry.");
      }
      if (kind === "playbook") {
        setPlaybookEntries((prev) => prev.filter((e) => e.id !== id));
      } else {
        setDirectoryResources((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this entry.");
    } finally {
      setDeletingKey(null);
    }
  }

  const isEmpty = playbookEntries.length === 0 && directoryResources.length === 0;

  return (
    <div className="space-y-10">
      {error && (
        <p role="alert" className="rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red">
          {error}
        </p>
      )}

      {isEmpty && (
        <p className="text-sm text-um-stone">
          You haven&apos;t submitted anything yet. Head back to{" "}
          <Link href="/contribute" className="text-um-blue underline underline-offset-2">
            Contribute
          </Link>{" "}
          to add a Playbook entry or Directory resource.
        </p>
      )}

      {playbookEntries.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-um-blue">Playbook entries</h2>
          <ul className="mt-3 space-y-3">
            {playbookEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border-subtle bg-white p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/playbook/${entry.slug}`}
                      className="font-semibold text-um-black-metallic underline-offset-2 hover:underline"
                    >
                      {entry.title}
                    </Link>
                    {entry.draft && <DraftTag label="Pending ESRM review" />}
                  </div>
                  <p className="mt-1 text-sm text-um-stone">
                    {entry.category} · submitted {entry.lastUpdated}
                  </p>
                </div>
                <RemoveButton
                  label={`Remove "${entry.title}"`}
                  busy={deletingKey === `playbook-${entry.id}`}
                  onClick={() => handleDelete("playbook", entry.id!)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {directoryResources.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-um-blue">Directory resources</h2>
          <ul className="mt-3 space-y-3">
            {directoryResources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border-subtle bg-white p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-um-black-metallic">{resource.name}</span>
                    {resource.url && <Badge tone="neutral">Link</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-um-stone">submitted {resource.submittedAt}</p>
                </div>
                <RemoveButton
                  label={`Remove "${resource.name}"`}
                  busy={deletingKey === `directory-${resource.id}`}
                  onClick={() => handleDelete("directory", resource.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Compact circular (×) button for removing a single contribution inline. Icon-only, so
 * it carries an explicit aria-label naming the specific item — never just "Remove". */
function RemoveButton({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-um-tappan-red text-um-tappan-red transition-colors hover:bg-um-tappan-red hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-um-tappan-red"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {busy ? "…" : "×"}
      </span>
    </button>
  );
}
