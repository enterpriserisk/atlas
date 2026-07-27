"use client";

import { useState } from "react";
import { Button, Badge } from "@/components/ui";
import type { ContributorKeyRecord } from "@/lib/auth/keys";

/** Admin UI for generating and revoking contributor access keys. Raw keys are shown
 * exactly once, right after generation — copy them somewhere safe before navigating away. */
export function KeyManager({ initialKeys }: { initialKeys: ContributorKeyRecord[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [label, setLabel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState<{ label: string; rawKey: string } | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not create the key.");
      setJustGenerated({ label, rawKey: data.rawKey });
      setKeys((prev) => [
        { id: data.id, label, createdAt: new Date().toISOString(), revokedAt: null },
        ...prev,
      ]);
      setLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the key.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevoke(id: number) {
    setRevokingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/keys/${id}/revoke`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not revoke the key.");
      }
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke the key.");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label htmlFor="key-label" className="mb-1 block text-sm font-medium text-um-black-metallic">
            Contributor name or email
          </label>
          <input
            id="key-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Jordan Lee"
            className="w-full rounded-lg border border-border-subtle bg-white px-4 py-2.5 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
          />
        </div>
        <Button type="submit" disabled={generating || !label.trim()}>
          {generating ? "Generating…" : "Generate key"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red">
          {error}
        </p>
      )}

      {justGenerated && (
        <div className="mt-4 rounded-lg border border-um-maize bg-[#fffaeb] p-4">
          <p className="text-sm font-semibold text-um-blue">
            Key generated for {justGenerated.label} — copy it now, it won&apos;t be shown again:
          </p>
          <code className="mt-2 block break-all rounded-md bg-white px-3 py-2 text-sm text-um-black-metallic">
            {justGenerated.rawKey}
          </code>
        </div>
      )}

      <div className="mt-8 overflow-x-auto rounded-lg border border-border-subtle bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-subtle bg-surface-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold text-um-blue">Contributor</th>
              <th className="px-4 py-2.5 font-semibold text-um-blue">Created</th>
              <th className="px-4 py-2.5 font-semibold text-um-blue">Status</th>
              <th className="px-4 py-2.5 font-semibold text-um-blue">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {keys.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-um-stone">
                  No keys generated yet.
                </td>
              </tr>
            )}
            {keys.map((k) => (
              <tr key={k.id}>
                <td className="px-4 py-2.5 text-um-black-metallic">{k.label}</td>
                <td className="px-4 py-2.5 text-um-stone">{k.createdAt.slice(0, 10)}</td>
                <td className="px-4 py-2.5">
                  {k.revokedAt ? (
                    <Badge tone="danger">Revoked</Badge>
                  ) : (
                    <Badge tone="success">Active</Badge>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {!k.revokedAt && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      disabled={revokingId === k.id}
                      className="text-sm font-medium text-um-tappan-red underline underline-offset-2 hover:text-[#7a231a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue disabled:opacity-50"
                    >
                      {revokingId === k.id ? "Revoking…" : "Revoke"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
