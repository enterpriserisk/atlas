import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { AdvisorWizard } from "@/components/advisor/AdvisorWizard";
import { getTools } from "@/lib/content/loaders";

export const metadata: Metadata = {
  title: "AI Task Advisor",
  description:
    "Answer a few questions and ATLAS will assess whether AI fits your task, which tool to use, and generate a ready-to-use prompt — with a transparent, auditable scoring engine.",
};

export default function AdvisorPage() {
  const tools = getTools();

  return (
    <>
      <PageHeader
        eyebrow="AI Task Advisor"
        title="Should AI help with this task?"
        description="A guided assessment that scores your task, recommends a tool, and builds a ready-to-use prompt. Transparent and auditable — no data leaves your browser."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <AdvisorWizard tools={tools} />
      </div>
    </>
  );
}
