"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

/** The /contribute unlock gate — verifies the entered key against the server and, on
 * success, refreshes so the (Server Component) page picks up the new session cookie. */
export function AccessKeyForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contribute/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not verify the key.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify the key.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <label htmlFor="access-key" className="mb-1 block text-sm font-medium text-um-black-metallic">
        Access key
      </label>
      <input
        id="access-key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="atlas_…"
        autoComplete="off"
        disabled={loading}
        className="w-full rounded-lg border border-border-subtle bg-white px-4 py-3 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue disabled:opacity-60"
      />
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red"
        >
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="mt-4" disabled={loading || !key.trim()}>
        {loading ? "Verifying…" : "Unlock contribution forms"}
      </Button>
    </form>
  );
}
