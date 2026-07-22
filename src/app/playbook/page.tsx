import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { PlaybookBrowser } from "@/components/playbook/PlaybookBrowser";
import { getPlaybookEntries, getTools } from "@/lib/content/loaders";
import { PLAYBOOK_CATEGORIES } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "Playbook",
  description:
    "Searchable library of AI-use guidance, tools, and standards for U-M Enterprise Risk Office staff.",
};

export default function PlaybookPage() {
  const entries = getPlaybookEntries();
  const tools = getTools().map((t) => ({ id: t.id, name: t.name }));

  return (
    <>
      <PageHeader
        eyebrow="Playbook / Library"
        title="AI-use guidance library"
        description="Search and filter practical guidance for using AI effectively and responsibly. Each entry notes when human review is required and which tools it applies to."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PlaybookBrowser
          entries={entries}
          categories={[...PLAYBOOK_CATEGORIES]}
          tools={tools}
        />
      </div>
    </>
  );
}
