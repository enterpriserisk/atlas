import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { KeyManager } from "@/components/admin/KeyManager";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { listContributorKeys } from "@/lib/auth/keys";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  let keys: Awaited<ReturnType<typeof listContributorKeys>> = [];
  let loadError: string | null = null;
  if (authenticated) {
    try {
      keys = await listContributorKeys();
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Could not load contributor keys.";
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Contributor access keys"
        description="Generate an individual access key for each verified staff member or intern, then send it to them directly. They'll enter it on the Contribute page to unlock submission forms."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {!authenticated ? (
          <AdminLoginForm />
        ) : loadError ? (
          <p role="alert" className="rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red">
            {loadError}
          </p>
        ) : (
          <KeyManager initialKeys={keys} />
        )}
      </div>
    </>
  );
}
