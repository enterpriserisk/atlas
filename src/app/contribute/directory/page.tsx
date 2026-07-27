import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { DirectorySubmissionForm } from "@/components/contribute/DirectorySubmissionForm";
import { getContributorSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Add a Directory resource",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ContributeDirectoryPage() {
  const session = await getContributorSession();
  if (!session) redirect("/contribute");

  return (
    <>
      <PageHeader
        eyebrow="Contribute"
        title="Add a Directory resource"
        description={`Submitting as ${session.label}. This publishes to the live Resource Directory immediately.`}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <DirectorySubmissionForm />
      </div>
    </>
  );
}
