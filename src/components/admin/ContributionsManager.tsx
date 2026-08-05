"use client";

import { useState } from "react";
import Link from "next/link";
import { DraftTag } from "@/components/ui";
import type { PlaybookEntry, DirectoryResource } from "@/lib/content/types";

interface ContributionsManagerProps {
  initialPlaybookEntries: PlaybookEntry[];
  initialDirectoryResources: DirectoryResource[];
}

/** Admin UI with full access to every dynamic contribution — every Playbook submission
 * and every Directory resource, regardless of who submitted it or whether it's been
 * reviewed. Submissions are already live the moment they're submitted; Approve here only
 * clears the Draft badge to mark that ESRM has reviewed it. Delete removes the entry
 * outright, for any contributor's item. */
export function ContributionsManager({
  initialPlaybookEntries,
  initialDirectoryResources,
}: ContributionsManagerProps) {
  const [playbookEntries, setPlaybookEntries] = useState(initialPlaybookEntries);
  const [directoryResources, setDirectoryResources] = useState(initialDirectoryResources);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(id: number) {
    const key = `playbook-approve-${id}`;
    setBusyKey(key);
    setError(null);
    try {
      const res = await fetch(`/api/admin/playbook/${id}/approve`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not approve this entry.");
      }
      setPlaybookEntries((prev) => prev.map((e) => (e.id === id ? { ...e, draft: false } : e)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve this entry.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeletePlaybook(id: number) {
    const key = `playbook-delete-${id}`;
    setBusyKey(key);
    setError(null);
    try {
      const res = await fetch(`/api/contribute/playbook/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not delete this entry.");
      }
      setPlaybookEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this entry.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeleteDirectory(id: number) {
    const key = `directory-delete-${id}`;
    setBusyKey(key);
    setError(null);
    try {
      const res = await fetch(`/api/contribute/directory/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not delete this resource.");
      }
      setDirectoryResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this resource.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-um-stone">
        Every Playbook entry and Directory resource submitted through an access key, regardless of
        who added it. Deleting here removes it outright, whether or not the key that added it is
        still active.
      </p>

      {error && (
        <p role="alert" className="rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red">
          {error}
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold text-um-blue">Playbook entries</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle bg-surface-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-um-blue">Title</th>
                <th className="px-4 py-2.5 font-semibold text-um-blue">Contributor</th>
                <th className="px-4 py-2.5 font-semibold text-um-blue">Submitted</th>
                <th className="px-4 py-2.5 font-semibold text-um-blue">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {playbookEntries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-um-stone">
                    No dynamic Playbook submissions yet.
                  </td>
                </tr>
              )}
              {playbookEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-2.5 text-um-black-metallic">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/playbook/${entry.slug}`} className="underline-offset-2 hover:underline">
                        {entry.title}
                      </Link>
                      {entry.draft && <DraftTag label="Pending review" />}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-um-stone">{entry.author}</td>
                  <td className="px-4 py-2.5 text-um-stone">{entry.lastUpdated}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {entry.draft && (
                      <button
                        type="button"
                        onClick={() => handleApprove(entry.id!)}
                        disabled={busyKey === `playbook-approve-${entry.id}` || busyKey === `playbook-delete-${entry.id}`}
                        className="text-sm font-medium text-um-blue underline underline-offset-2 hover:text-[#003366] focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue disabled:opacity-50"
                      >
                        {busyKey === `playbook-approve-${entry.id}` ? "Working…" : "Approve"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeletePlaybook(entry.id!)}
                      disabled={busyKey === `playbook-approve-${entry.id}` || busyKey === `playbook-delete-${entry.id}`}
                      className="ml-4 text-sm font-medium text-um-tappan-red underline underline-offset-2 hover:text-[#7a231a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue disabled:opacity-50"
                    >
                      {busyKey === `playbook-delete-${entry.id}` ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-um-blue">Directory resources</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle bg-surface-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-um-blue">Name</th>
                <th className="px-4 py-2.5 font-semibold text-um-blue">Contributor</th>
                <th className="px-4 py-2.5 font-semibold text-um-blue">Submitted</th>
                <th className="px-4 py-2.5 font-semibold text-um-blue">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {directoryResources.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-um-stone">
                    No Directory resources yet.
                  </td>
                </tr>
              )}
              {directoryResources.map((resource) => (
                <tr key={resource.id}>
                  <td className="px-4 py-2.5 text-um-black-metallic">
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline"
                      >
                        {resource.name}
                      </a>
                    ) : (
                      resource.name
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-um-stone">{resource.contributorLabel}</td>
                  <td className="px-4 py-2.5 text-um-stone">{resource.submittedAt}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleDeleteDirectory(resource.id)}
                      disabled={busyKey === `directory-delete-${resource.id}`}
                      className="text-sm font-medium text-um-tappan-red underline underline-offset-2 hover:text-[#7a231a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue disabled:opacity-50"
                    >
                      {busyKey === `directory-delete-${resource.id}` ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
