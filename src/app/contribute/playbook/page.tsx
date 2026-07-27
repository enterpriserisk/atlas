import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { PlaybookSubmissionForm } from "@/components/contribute/PlaybookSubmissionForm";
import { getContributorSession } from "@/lib/auth/session";
import { getTools } from "@/lib/content/loaders";

export const metadata: Metadata = {
  title: "Add a Playbook entry",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ContributePlaybookPage() {
  const session = await getContributorSession();
  if (!session) redirect("/contribute");

  const tools = getTools().map((t) => ({ id: t.id, name: t.name }));

  return (
    <>
      <PageHeader
        eyebrow="Contribute"
        title="Add a Playbook entry"
        description={`Submitting as ${session.label}. This publishes to the live Playbook immediately.`}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PlaybookSubmissionForm tools={tools} />
      </div>
    </>
  );
}
