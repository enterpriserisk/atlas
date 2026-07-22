import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { GlossaryList } from "@/components/glossary/GlossaryList";
import { getGlossary } from "@/lib/content/loaders";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Plain-language definitions of common AI terms — hallucination, prompt engineering, context window, RAG, and more.",
};

export default function GlossaryPage() {
  const terms = getGlossary();

  return (
    <>
      <PageHeader
        eyebrow="Glossary"
        title="AI terms in plain language"
        description="Quick, jargon-free definitions of the AI concepts you'll encounter across ATLAS."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <GlossaryList terms={terms} />
      </div>
    </>
  );
}
