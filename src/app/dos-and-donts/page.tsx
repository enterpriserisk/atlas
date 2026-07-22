import type { Metadata } from "next";
import { Accordion, DraftTag, PageHeader, AiAssistedNotice } from "@/components/ui";
import type { AccordionItem } from "@/components/ui";
import { DoDontColumns } from "@/components/dosdonts/DoDontColumns";
import { getDosDonts } from "@/lib/content/loaders";

export const metadata: Metadata = {
  title: "Do's & Don'ts",
  description:
    "Responsible-AI-use standards for U-M Enterprise Risk Office staff: appropriate uses, human review, confidentiality, citations, fact-checking, and ethics.",
};

export default function DosAndDontsPage() {
  const { sections, lastReviewedByERO } = getDosDonts();

  const items: AccordionItem[] = sections.map((section) => ({
    id: section.id,
    title: section.title,
    meta: section.draft ? <DraftTag /> : undefined,
    content: (
      <div className="space-y-4">
        <DoDontColumns dos={section.dos} donts={section.donts} />
        <div className="rounded-md border border-border-subtle bg-surface-muted p-4">
          <p className="text-sm">
            <span className="font-semibold text-um-blue">Example: </span>
            <span className="text-um-black-metallic">{section.example}</span>
          </p>
        </div>
      </div>
    ),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Responsible-use standards"
        title="Do's and Don'ts"
        description="Clear standards for using AI responsibly at the Enterprise Risk Office. Expand any section for practical do's, don'ts, and a real-world example."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <AiAssistedNotice
            variant="banner"
            message="These standards are working guidance and must be applied with human judgment. Draft sections are pending review by ERO subject-matter experts."
          />
        </div>

        <Accordion items={items} defaultOpen={sections[0] ? [sections[0].id] : []} />

        <ReviewFooter lastReviewedByERO={lastReviewedByERO} draftCount={sections.filter((s) => s.draft).length} />
      </div>
    </>
  );
}

function ReviewFooter({
  lastReviewedByERO,
  draftCount,
}: {
  lastReviewedByERO: string | null;
  draftCount: number;
}) {
  return (
    <footer className="mt-8 border-t border-border-subtle pt-4 text-sm text-um-stone">
      {lastReviewedByERO ? (
        <p>
          Last reviewed by ERO on{" "}
          <span className="font-medium text-um-black-metallic">{lastReviewedByERO}</span>.
        </p>
      ) : (
        <p>
          <span className="font-semibold text-[#7a3406]">Not yet reviewed by ERO.</span> This page
          contains {draftCount} draft {draftCount === 1 ? "section" : "sections"} of placeholder
          guidance pending subject-matter review.
        </p>
      )}
    </footer>
  );
}
