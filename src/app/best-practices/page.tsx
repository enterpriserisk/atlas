import type { Metadata } from "next";
import { Accordion, DraftTag, PageHeader, AiAssistedNotice } from "@/components/ui";
import type { AccordionItem } from "@/components/ui";
import { DoDontColumns } from "@/components/dosdonts/DoDontColumns";
import { getDosDonts } from "@/lib/content/loaders";

export const metadata: Metadata = {
  title: "Best Practices",
  description:
    "Responsible-AI-use standards for U-M Enterprise Strategic Risk Management staff: appropriate uses, human review, confidentiality, citations, fact-checking, and ethics.",
};

export default function BestPracticesPage() {
  const { sections, lastReviewedByESRM } = getDosDonts();
  const draftCount = sections.filter((s) => s.draft).length;

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
        title="Best Practices"
        description="Clear standards for using AI responsibly within Enterprise Strategic Risk Management. Expand any section for practical do's, don'ts, and a real-world example."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <AiAssistedNotice
            variant="banner"
            message={
              draftCount > 0
                ? "These standards are working guidance and must be applied with human judgment. Draft sections are pending review by ESRM subject-matter experts."
                : "These standards are working guidance and must be applied with human judgment."
            }
          />
        </div>

        <Accordion
          items={items}
          headingLevel="h2"
          defaultOpen={sections[0] ? [sections[0].id] : []}
        />

        <ReviewFooter lastReviewedByESRM={lastReviewedByESRM} draftCount={draftCount} />
      </div>
    </>
  );
}

function ReviewFooter({
  lastReviewedByESRM,
  draftCount,
}: {
  lastReviewedByESRM: string | null;
  draftCount: number;
}) {
  return (
    <footer className="mt-8 border-t border-border-subtle pt-4 text-sm text-um-stone">
      {lastReviewedByESRM ? (
        <p>
          Last reviewed by ESRM on{" "}
          <span className="font-medium text-um-black-metallic">{lastReviewedByESRM}</span>.
        </p>
      ) : (
        <p>
          <span className="font-semibold text-[#7a3406]">Not yet reviewed by ESRM.</span>
          {draftCount > 0 && (
            <>
              {" "}
              This page contains {draftCount} draft {draftCount === 1 ? "section" : "sections"} of
              placeholder guidance pending subject-matter review.
            </>
          )}
        </p>
      )}
    </footer>
  );
}
