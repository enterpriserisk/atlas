import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { KeyManager } from "@/components/admin/KeyManager";
import { ContributionsManager } from "@/components/admin/ContributionsManager";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { listContributorKeys } from "@/lib/auth/keys";
import { getDynamicPlaybookEntries } from "@/lib/content/submissions";
import { getDirectoryResources } from "@/lib/content/directory";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  let keys: Awaited<ReturnType<typeof listContributorKeys>> = [];
  let playbookEntries: Awaited<ReturnType<typeof getDynamicPlaybookEntries>> = [];
  let directoryResources: Awaited<ReturnType<typeof getDirectoryResources>> = [];
  let loadError: string | null = null;
  if (authenticated) {
    try {
      [keys, playbookEntries, directoryResources] = await Promise.all([
        listContributorKeys(),
        getDynamicPlaybookEntries(),
        getDirectoryResources(),
      ]);
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Could not load admin data.";
    }
  }

  const pendingCount = playbookEntries.filter((e) => e.draft).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Admin"
        description="Manage contributor access keys and every dynamic contribution. Full access — deletions here apply regardless of who submitted an entry or whether their key is still active."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {!authenticated ? (
          <AdminLoginForm />
        ) : loadError ? (
          <p role="alert" className="rounded-md border border-um-tappan-red bg-[#f6e3e0] px-3 py-2 text-sm text-um-tappan-red">
            {loadError}
          </p>
        ) : (
          <AdminTabs
            keysPanel={<KeyManager initialKeys={keys} />}
            contributionsPanel={
              <ContributionsManager
                initialPlaybookEntries={playbookEntries}
                initialDirectoryResources={directoryResources}
              />
            }
            pendingCount={pendingCount}
          />
        )}
      </div>
    </>
  );
}
