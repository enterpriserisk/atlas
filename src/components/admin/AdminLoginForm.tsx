"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/** Simple password-style gate for /admin — checks ADMIN_SECRET server-side via
 * /api/admin/login. On success, reloads so the Server Component re-checks the cookie. */
export function AdminLoginForm() {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Login failed.");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <label htmlFor="admin-secret" className="mb-1 block text-sm font-medium text-um-black-metallic">
        Admin secret
      </label>
      <input
        id="admin-secret"
        type="password"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        autoComplete="off"
        className="w-full rounded-lg border border-border-subtle bg-white px-4 py-3 text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-um-blue"
      />
      {error && (
        <p role="alert" className="mt-3 rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="mt-4" disabled={loading || !secret}>
        {loading ? "Checking…" : "Log in"}
      </Button>
    </form>
  );
}
