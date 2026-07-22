"use client";

import { Button } from "@/components/ui";
import { CopyButton } from "../CopyButton";
import { AssessmentSummary } from "../AssessmentSummary";
import type { Tool } from "@/lib/content/types";
import type { Assessment, TaskInput } from "@/lib/advisor/types";
import type { PromptOutput } from "@/lib/advisor/generatePrompt";
import { buildSessionExport } from "@/lib/advisor/exportSession";

/**
 * Step 6 — Generated Prompt + Instructions. The payoff screen:
 * refined prompt (with copy), step-by-step usage instructions, an auto-generated
 * human-review checklist, and an exportable summary of the whole session.
 */
export function StepResult({
  input,
  assessment,
  tool,
  output,
  onBack,
  onRestart,
}: {
  input: TaskInput;
  assessment: Assessment;
  tool: Tool;
  output: PromptOutput;
  onBack: () => void;
  onRestart: () => void;
}) {
  function downloadSummary() {
    const text = buildSessionExport({ input, assessment, tool, output });
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atlas-ai-task-summary.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-um-blue">Your ready-to-use prompt</h2>
      <p className="mt-2 text-um-black-metallic">
        Built for <span className="font-semibold">{tool.name}</span> from everything you told
        ATLAS. Review the checklist before using the output.
      </p>

      {/* Refined prompt */}
      <section className="mt-6" aria-labelledby="prompt-heading">
        <div className="mb-2 flex items-center justify-between">
          <h3 id="prompt-heading" className="text-lg font-semibold text-um-blue">
            Refined prompt
          </h3>
          <CopyButton text={output.prompt} label="Copy prompt" />
        </div>
        <pre className="whitespace-pre-wrap rounded-lg border border-border-subtle bg-surface-muted p-4 text-sm text-um-black-metallic">
          {output.prompt}
        </pre>
      </section>

      {/* Instructions */}
      <section className="mt-6" aria-labelledby="instructions-heading">
        <h3 id="instructions-heading" className="text-lg font-semibold text-um-blue">
          How to use it
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-6 text-sm text-um-black-metallic">
          {output.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Review checklist */}
      <section className="mt-6" aria-labelledby="checklist-heading">
        <h3 id="checklist-heading" className="text-lg font-semibold text-um-blue">
          Human-review checklist
        </h3>
        <ul className="mt-2 space-y-2">
          {output.checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-um-black-metallic">
              <input
                type="checkbox"
                id={`check-${i}`}
                className="mt-0.5 h-4 w-4 shrink-0 accent-um-blue"
              />
              <label htmlFor={`check-${i}`}>{item}</label>
            </li>
          ))}
        </ul>
      </section>

      {/* Session summary + export */}
      <section className="mt-8" aria-labelledby="summary-heading">
        <h3 id="summary-heading" className="mb-2 text-lg font-semibold text-um-blue">
          Session summary
        </h3>
        <AssessmentSummary input={input} assessment={assessment} tool={tool} />
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton
            text={buildSessionExport({ input, assessment, tool, output })}
            label="Copy full summary"
          />
          <Button variant="secondary" size="sm" onClick={downloadSummary}>
            Download summary (.md)
          </Button>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="secondary" onClick={onRestart}>
          Start a new assessment
        </Button>
      </div>
    </div>
  );
}
