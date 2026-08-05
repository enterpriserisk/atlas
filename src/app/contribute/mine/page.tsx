import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { MyContributions } from "@/components/contribute/MyContributions";
import { getContributorSession } from "@/lib/auth/session";
import { getPlaybookSubmissionsByContributor } from "@/lib/content/submissions";
import { getDirectoryResourcesByContributor } from "@/lib/content/directory";

export const metadata: Metadata = {
  title: "My Contributions",
  description: "Manage the Playbook entries and Directory resources you've submitted to ATLAS.",
};

export const dynamic = "force-dynamic";

export default async function MyContributionsPage() {
  const session = await getContributorSession();
  if (!session) redirect("/contribute");

  const [playbookEntries, directoryResources] = await Promise.all([
    getPlaybookSubmissionsByContributor(session.contributorId),
    getDirectoryResourcesByContributor(session.contributorId),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Living resource"
        title="My Contributions"
        description={`Everything you (${session.label}) have submitted. You can remove your own entries here — for example, to fix a typo by resubmitting, or if something no longer applies.`}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <MyContributions initialPlaybookEntries={playbookEntries} initialDirectoryResources={directoryResources} />
      </div>
    </>
  );
}
