"use client";

import { Button } from "@/components/ui";
import { AssessmentSummary } from "../AssessmentSummary";
import type { Tool } from "@/lib/content/types";
import type { Assessment, TaskInput } from "@/lib/advisor/types";

/**
 * Step 4 — Continue checkpoint. Offers to build a ready-to-use prompt for the chosen tool.
 * "Not now" still lets the user see/export the assessment summary, so the tool is useful
 * even if they stop here. If no tool was selected (or AI not recommended), only the
 * summary + restart is offered.
 */
export function StepContinue({
  assessment,
  input,
  selectedTool,
  onBack,
  onContinue,
}: {
  assessment: Assessment;
  input: TaskInput;
  selectedTool: Tool | null;
  onBack: () => void;
  onContinue: () => void;
}) {
  const canBuildPrompt = Boolean(selectedTool) && assessment.verdict !== "not-recommended";

  return (
    <div>
      <h2 className="text-2xl font-bold text-um-blue">
        {canBuildPrompt
          ? `Want ATLAS to help you build a prompt for ${selectedTool?.name}?`
          : "Your assessment summary"}
      </h2>
      <p className="mt-2 text-um-black-metallic">
        {canBuildPrompt
          ? "ATLAS can turn everything so far into a ready-to-use prompt, step-by-step instructions, and a review checklist. You can also stop here with the summary below."
          : "Here's a summary you can keep or export. You can start over any time."}
      </p>

      <div className="mt-6">
        <AssessmentSummary input={input} assessment={assessment} tool={selectedTool} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        {canBuildPrompt && (
          <Button onClick={onContinue} size="lg">
            Build my prompt →
          </Button>
        )}
      </div>
    </div>
  );
}
