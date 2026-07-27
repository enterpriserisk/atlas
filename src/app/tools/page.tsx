import type { Metadata } from "next";
import { PageHeader, AiAssistedNotice } from "@/components/ui";
import { ToolCard } from "@/components/tools/ToolCard";
import { getTools } from "@/lib/content/loaders";

export const metadata: Metadata = {
  title: "Tool Directory",
  description:
    "Reference cards for AI tools available to U-M Enterprise Risk Management staff: what each is approved for, data-sensitivity notes, strengths, and limitations.",
};

export default function ToolsPage() {
  const tools = getTools();
  const universityTools = tools.filter((t) => t.universityProvided);
  const externalTools = tools.filter((t) => !t.universityProvided);

  return (
    <>
      <PageHeader
        eyebrow="Tool Directory"
        title="AI tools reference"
        description="What each tool is approved for, how sensitive the data it can handle, and where it fits. Tool approval status can change — always confirm current guidance before use."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <AiAssistedNotice
            variant="banner"
            message="Approval status and data-handling terms can change. Treat these cards as a starting point and confirm current U-M/ITS guidance before relying on any tool."
          />
        </div>

        <section aria-labelledby="university-tools-heading" className="mb-10">
          <h2 id="university-tools-heading" className="mb-4 text-lg font-bold text-um-blue">
            University-provided tools
          </h2>
          <div className="space-y-6">
            {universityTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {externalTools.length > 0 && (
          <section aria-labelledby="external-tools-heading">
            <h2 id="external-tools-heading" className="mb-4 text-lg font-bold text-um-blue">
              Other / external tools
            </h2>
            <div className="space-y-6">
              {externalTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
