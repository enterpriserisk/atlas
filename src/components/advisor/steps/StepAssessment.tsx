"use client";

import { Button } from "@/components/ui";
import { AssessmentRadar } from "../AssessmentRadar";
import { VerdictBanner } from "../VerdictBanner";
import type { Assessment } from "@/lib/advisor/types";

/**
 * Step 2 — Assessment. Radar chart of the five dimensions + verdict + human-review flag.
 * If AI is not recommended, the "next" action (wired by the parent) skips the tool step.
 */
export function StepAssessment({
  assessment,
  onBack,
  onNext,
}: {
  assessment: Assessment;
  onBack: () => void;
  onNext: () => void;
}) {
  const notRecommended = assessment.verdict === "not-recommended";

  return (
    <div>
      <h2 className="text-2xl font-bold text-um-blue">Should AI help with this task?</h2>
      <p className="mt-2 text-um-black-metallic">
        ATLAS scored your task across five dimensions. This is transparent decision support —
        the reasoning is shown, and you make the final call.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border-subtle bg-white p-4">
          <AssessmentRadar axes={assessment.axes} />
        </div>
        <VerdictBanner assessment={assessment} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext} size="lg">
          {notRecommended ? "See summary →" : "See tool options →"}
        </Button>
      </div>
    </div>
  );
}
