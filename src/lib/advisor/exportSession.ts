import type { Tool } from "@/lib/content/types";
import type { Assessment, TaskInput, Verdict } from "./types";
import type { PromptOutput } from "./generatePrompt";

const VERDICT_LABEL: Record<Verdict, string> = {
  recommended: "AI Recommended",
  caution: "AI Possible with Caution",
  "not-recommended": "AI Not Recommended for This Task",
};

/**
 * buildSessionExport — renders the full advisor session as Markdown text, suitable for
 * copy-to-clipboard or download and attaching to project documentation.
 */
export function buildSessionExport(args: {
  input: TaskInput;
  assessment: Assessment;
  tool: Tool | null;
  output: PromptOutput | null;
}): string {
  const { input, assessment, tool, output } = args;
  const lines: string[] = [];

  lines.push("# ATLAS — AI Task Advisor summary");
  lines.push("");
  lines.push("_AI-assisted guidance requiring human judgment. Not an approval._");
  lines.push("");
  lines.push("## Task");
  lines.push(input.description.trim());
  lines.push("");
  lines.push("## Assessment");
  lines.push(`- **Verdict:** ${VERDICT_LABEL[assessment.verdict]}`);
  lines.push(
    `- **Human review:** ${assessment.humanReview.status} — ${assessment.humanReview.reason}`,
  );
  lines.push("");
  lines.push("### Scores (1 = low, 5 = high)");
  for (const a of assessment.axes) {
    lines.push(`- ${a.label}: ${a.score}/5 — ${a.reason}`);
  }
  lines.push("");
  lines.push("### Why");
  for (const r of assessment.reasons) lines.push(`- ${r}`);
  lines.push("");

  if (tool) {
    lines.push("## Chosen tool");
    lines.push(`${tool.name}${tool.universityProvided ? " (University-provided)" : " (NOT a University tool — verify data-handling and approval status before use)"}`);
    lines.push("");
  }

  if (output) {
    lines.push("## Refined prompt");
    lines.push("```");
    lines.push(output.prompt);
    lines.push("```");
    lines.push("");
    lines.push("## How to use it");
    output.instructions.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push("");
    lines.push("## Human-review checklist");
    output.checklist.forEach((item) => lines.push(`- [ ] ${item}`));
    lines.push("");
  }

  return lines.join("\n");
}
